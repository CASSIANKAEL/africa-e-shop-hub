import { useSyncExternalStore } from "react";

import type { Order, OrderStatus, Product, Store } from "@/types";
import {
  orders as initialOrders,
  products as initialProducts,
  stores as initialStores,
} from "./mock-data";

interface CommerceState {
  stores: Store[];
  products: Product[];
  orders: Order[];
  /** Boutique active : chaque boutique est indépendante, une seule à la fois. */
  activeStoreId: string;
}

let state: CommerceState = {
  stores: initialStores,
  products: initialProducts,
  orders: initialOrders,
  activeStoreId: initialStores[0]?.id ?? "",
};

const listeners = new Set<() => void>();

function setState(next: Partial<CommerceState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
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
    options?: { followUpAt?: string | null; comment?: string },
  ) {
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
};

/** Une commande injoignable/programmée dont l'heure de rappel est arrivée. */
export function isFollowUpDue(order: Order, now: number = Date.now()): boolean {
  if (!order.followUpAt) return false;
  if (order.status !== "unreachable" && order.status !== "scheduled" && order.status !== "callback")
    return false;
  return new Date(order.followUpAt).getTime() <= now;
}
