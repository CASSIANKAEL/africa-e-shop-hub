import { useSyncExternalStore } from "react";

import type {
  AppNotification,
  Order,
  OrderStatus,
  Product,
  Store,
  TeamMember,
  TeamRole,
} from "@/types";
import {
  orders as initialOrders,
  products as initialProducts,
  stores as initialStores,
} from "./mock-data";

interface CommerceState {
  stores: Store[];
  products: Product[];
  orders: Order[];
  team: TeamMember[];
  /** Boutique active : chaque boutique est indépendante, une seule à la fois. */
  activeStoreId: string;
  notifications: AppNotification[];
}

const firstStoreId = initialStores[0]?.id ?? "";

const initialTeam: TeamMember[] = [
  {
    id: "tm-1",
    storeId: firstStoreId,
    fullName: "Awa Diallo",
    email: "awa@example.com",
    phone: "+225 07 00 11 22",
    role: "closer",
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "tm-2",
    storeId: firstStoreId,
    fullName: "Koffi Mensah",
    email: "koffi@example.com",
    phone: "+225 05 44 33 22",
    role: "courier",
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

let state: CommerceState = {
  stores: initialStores,
  products: initialProducts,
  orders: initialOrders,
  team: initialTeam,
  activeStoreId: firstStoreId,
  notifications: [],
};

const listeners = new Set<() => void>();

/** Les boutiques, produits et commandes sont conservés d'une visite à l'autre. */
const STORAGE_KEY = "sooko-commerce";
let hydrated = false;

type PersistedState = Pick<
  CommerceState,
  "stores" | "products" | "orders" | "team" | "activeStoreId"
>;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as Partial<PersistedState>;
    setState({
      ...(saved.stores ? { stores: saved.stores } : {}),
      ...(saved.products ? { products: saved.products } : {}),
      ...(saved.orders ? { orders: saved.orders } : {}),
      ...(saved.team ? { team: saved.team } : {}),
      ...(saved.activeStoreId ? { activeStoreId: saved.activeStoreId } : {}),
    });
  } catch {
    /* stockage indisponible */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    const payload: PersistedState = {
      stores: state.stores,
      products: state.products,
      orders: state.orders,
      team: state.team,
      activeStoreId: state.activeStoreId,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* stockage indisponible */
  }
}

function setState(next: Partial<CommerceState>) {
  state = { ...state, ...next };
  if (hydrated) persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrate();
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function useCommerceState(): CommerceState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useStores() {
  return useCommerceState().stores;
}

export function useProducts() {
  return useCommerceState().products;
}

export function useOrders() {
  return useCommerceState().orders;
}

export function useOrder(id: string): Order | undefined {
  return useCommerceState().orders.find((o) => o.id === id || o.reference === id);
}

export function useActiveStoreId(): string {
  return useCommerceState().activeStoreId;
}

export function useActiveStore(): Store | undefined {
  const s = useCommerceState();
  return s.stores.find((st) => st.id === s.activeStoreId);
}

export function useStoreName(storeId: string): string {
  return useCommerceState().stores.find((s) => s.id === storeId)?.name ?? "Boutique";
}

/** Équipe de la boutique active (ou d'une boutique précise). */
export function useTeam(storeId?: string): TeamMember[] {
  const s = useCommerceState();
  const id = storeId ?? s.activeStoreId;
  return s.team.filter((m) => m.storeId === id);
}

export function useCouriers(storeId?: string): TeamMember[] {
  return useTeam(storeId).filter((m) => m.role === "courier");
}

/** Notifications destinées à un rôle (et, pour un livreur, à lui seul). */
export function useNotifications(role: TeamRole = "admin", courierId?: string): AppNotification[] {
  const s = useCommerceState();
  return s.notifications.filter(
    (n) =>
      n.storeId === s.activeStoreId &&
      n.audience.includes(role) &&
      (role !== "courier" || !n.courierId || n.courierId === courierId),
  );
}

function notify(input: Omit<AppNotification, "id" | "createdAt" | "read">) {
  const notification: AppNotification = {
    ...input,
    id: `nt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  setState({ notifications: [notification, ...state.notifications].slice(0, 100) });
}

export type NewTeamMemberInput = {
  fullName: string;
  email: string;
  phone?: string;
  role: TeamRole;
  status: "invited" | "active";
};

export type NewProductInput = Omit<Product, "id">;
export type NewStoreInput = Omit<Store, "id" | "productsCount" | "monthlyRevenue">;

export const commerceStore = {
  setActiveStore(storeId: string) {
    setState({ activeStoreId: storeId });
  },
  addProduct(input: NewProductInput): Product {
    const product: Product = { ...input, id: `p-${Date.now()}` };
    setState({
      products: [product, ...state.products],
      stores: state.stores.map((s) =>
        s.id === product.storeId ? { ...s, productsCount: s.productsCount + 1 } : s,
      ),
    });
    return product;
  },
  addStore(input: NewStoreInput): Store {
    const store: Store = { ...input, id: `st-${Date.now()}`, productsCount: 0, monthlyRevenue: 0 };
    setState({ stores: [...state.stores, store] });
    return store;
  },
  updateStore(storeId: string, patch: Partial<Store>) {
    setState({
      stores: state.stores.map((s) => (s.id === storeId ? { ...s, ...patch } : s)),
    });
  },

  /** Copie un produit vers une ou plusieurs autres boutiques. */
  duplicateProduct(productId: string, targetStoreIds: string[]): Product[] {
    const source = state.products.find((p) => p.id === productId);
    if (!source || targetStoreIds.length === 0) return [];
    const copies = targetStoreIds.map((storeId, i) => ({
      ...source,
      id: `p-${Date.now()}-${i}`,
      storeId,
    }));
    setState({
      products: [...copies, ...state.products],
      stores: state.stores.map((s) => {
        const added = copies.filter((c) => c.storeId === s.id).length;
        return added ? { ...s, productsCount: s.productsCount + added } : s;
      }),
    });
    return copies;
  },
  /** Déplace un produit vers une autre boutique. */
  moveProduct(productId: string, targetStoreId: string) {
    const source = state.products.find((p) => p.id === productId);
    if (!source || source.storeId === targetStoreId) return;
    setState({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, storeId: targetStoreId } : p,
      ),
      stores: state.stores.map((s) => {
        if (s.id === source.storeId) return { ...s, productsCount: Math.max(0, s.productsCount - 1) };
        if (s.id === targetStoreId) return { ...s, productsCount: s.productsCount + 1 };
        return s;
      }),
    });
  },
  deleteProduct(productId: string) {
    const source = state.products.find((p) => p.id === productId);
    if (!source) return;
    setState({
      products: state.products.filter((p) => p.id !== productId),
      stores: state.stores.map((s) =>
        s.id === source.storeId ? { ...s, productsCount: Math.max(0, s.productsCount - 1) } : s,
      ),
    });
  },
  updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    options?: { followUpAt?: string | null; comment?: string; byCourier?: boolean },
  ) {
    const before = state.orders.find((o) => o.id === orderId);
    setState({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const next: Order = { ...o, status };
        if (options?.followUpAt === null) {
          delete next.followUpAt;
        } else if (options?.followUpAt) {
          next.followUpAt = options.followUpAt;
        }
        if (options?.comment?.trim()) {
          next.comments = [
            ...(o.comments ?? []),
            {
              id: `cm-${Date.now()}`,
              text: options.comment.trim(),
              createdAt: new Date().toISOString(),
            },
          ];
        }
        return next;
      }),
    });
    if (!before || before.status === status) return;
    const base = { storeId: before.storeId, orderId, audience: ["admin", "closer"] as TeamRole[] };
    if (status === "delivered") {
      notify({ ...base, messageKey: "notifOrderDelivered", vars: { ref: before.reference } });
    } else if (before.status === "delivered") {
      notify({ ...base, messageKey: "notifOrderReopened", vars: { ref: before.reference } });
    } else if (options?.byCourier) {
      notify({
        ...base,
        messageKey: "notifOrderNotDelivered",
        vars: { ref: before.reference, status },
      });
    }
  },
  /** Notifie l'équipe d'une nouvelle commande entrante. */
  notifyNewOrder(orderId: string) {
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return;
    notify({
      storeId: order.storeId,
      orderId,
      audience: ["admin", "closer"],
      messageKey: "notifOrderNew",
      vars: { ref: order.reference },
    });
  },
  markNotificationsRead() {
    setState({ notifications: state.notifications.map((n) => ({ ...n, read: true })) });
  },
  addComment(orderId: string, text: string) {
    if (!text.trim()) return;
    setState({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              comments: [
                ...(o.comments ?? []),
                { id: `cm-${Date.now()}`, text: text.trim(), createdAt: new Date().toISOString() },
              ],
            }
          : o,
      ),
    });
  },
  updateComment(orderId: string, commentId: string, text: string) {
    if (!text.trim()) return;
    setState({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              comments: (o.comments ?? []).map((c) =>
                c.id === commentId ? { ...c, text: text.trim() } : c,
              ),
            }
          : o,
      ),
    });
  },
  deleteComment(orderId: string, commentId: string) {
    setState({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, comments: (o.comments ?? []).filter((c) => c.id !== commentId) }
          : o,
      ),
    });
  },

  /* ---------- Équipe ---------- */
  addTeamMember(storeId: string, input: NewTeamMemberInput): TeamMember {
    const member: TeamMember = {
      id: `tm-${Date.now()}`,
      storeId,
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
      role: input.role,
      status: input.status,
      createdAt: new Date().toISOString(),
    };
    setState({ team: [...state.team, member] });
    return member;
  },
  setMemberStatus(memberId: string, status: "invited" | "active") {
    setState({
      team: state.team.map((m) => (m.id === memberId ? { ...m, status } : m)),
    });
  },
  removeTeamMember(memberId: string) {
    setState({
      team: state.team.filter((m) => m.id !== memberId),
      orders: state.orders.map((o) => {
        if (o.courierId !== memberId) return o;
        const next = { ...o };
        delete next.courierId;
        return next;
      }),
    });
  },
  /** Attribue (ou retire) une commande confirmée à un livreur. */
  assignCourier(orderId: string, courierId: string | null) {
    setState({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const next: Order = { ...o };
        if (courierId) {
          next.courierId = courierId;
          if (next.status === "confirmed") next.status = "shipped";
        } else {
          delete next.courierId;
          delete next.courierNote;
        }
        return next;
      }),
    });
    const order = state.orders.find((o) => o.id === orderId);
    if (order && courierId) {
      notify({
        storeId: order.storeId,
        orderId,
        audience: ["courier"],
        courierId,
        messageKey: "notifOrderAssigned",
        vars: {
          ref: order.reference,
          name: state.team.find((m) => m.id === courierId)?.fullName ?? "",
        },
      });
    }
  },
  /** Consigne destinée au livreur attribué. */
  setCourierNote(orderId: string, note: string | null) {
    setState({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const next: Order = { ...o };
        if (note && note.trim()) next.courierNote = note.trim();
        else delete next.courierNote;
        return next;
      }),
    });
  },
};

/** Une commande injoignable/programmée dont l'heure de rappel est arrivée. */
export function isFollowUpDue(order: Order, now: number = Date.now()): boolean {
  if (!order.followUpAt) return false;
  if (order.status !== "unreachable" && order.status !== "scheduled" && order.status !== "callback")
    return false;
  return new Date(order.followUpAt).getTime() <= now;
}
