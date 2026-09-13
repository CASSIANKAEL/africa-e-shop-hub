import type { Order, SalesPoint } from "@/types";
import { historicalOrders } from "./history";
import { allStoreIds, visitsInRange } from "./traffic";

export { allStoreIds } from "./traffic";

export type PeriodKey = "today" | "yesterday" | "7d" | "30d" | "90d" | "custom";

export interface DateRange {
  /** Début inclus (ms). */
  from: number;
  /** Fin exclue (ms). */
  to: number;
}

export const periodLabels: Record<PeriodKey, string> = {
  today: "Aujourd'hui",
  yesterday: "Hier",
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  "90d": "90 derniers jours",
  custom: "Période personnalisée",
};

const DAY = 86_400_000;

function todayStart(): number {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function resolveRange(
  period: PeriodKey,
  custom?: { from?: string; to?: string },
): DateRange {
  const t0 = todayStart();
  switch (period) {
    case "today":
      return { from: t0, to: t0 + DAY };
    case "yesterday":
      return { from: t0 - DAY, to: t0 };
    case "7d":
      return { from: t0 - 6 * DAY, to: t0 + DAY };
    case "30d":
      return { from: t0 - 29 * DAY, to: t0 + DAY };
    case "90d":
      return { from: t0 - 89 * DAY, to: t0 + DAY };
    case "custom": {
      const from = custom?.from ? Date.parse(`${custom.from}T00:00:00.000Z`) : t0 - 6 * DAY;
      const to = custom?.to ? Date.parse(`${custom.to}T00:00:00.000Z`) + DAY : t0 + DAY;
      return { from, to: Math.max(to, from + DAY) };
    }
  }
}

/** Toutes les commandes connues (historique fictif + commandes vivantes). */
export function allOrders(liveOrders: Order[]): Order[] {
  return [...liveOrders, ...historicalOrders];
}

export function inRange(orders: Order[], range: DateRange): Order[] {
  return orders.filter((o) => {
    const t = Date.parse(o.createdAt);
    return t >= range.from && t < range.to;
  });
}

export interface PeriodMetrics {
  revenue: number;
  revenueChange: number;
  ordersVolume: number;
  ordersChange: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  codConfirmationRate: number;
  codChange: number;
  averageBasket: number;
  /** Visites du ou des sites sur la période. */
  visits: number;
  visitsChange: number;
  /** Commandes / visites. */
  conversionRate: number;
  conversionChange: number;
  /** Commandes livrées (retirées par le client). */
  delivered: number;
  /** Livrées / confirmées — taux de retrait. */
  deliveryRate: number;
  returned: number;
  /** Retours / (livrées + retours). */
  returnRate: number;
  /** Chiffre d'affaires par visite. */
  revenuePerVisit: number;
}

const confirmedStatuses = ["confirmed", "shipped", "delivered"];
const cancelledStatuses = ["cancelled", "rejected", "returned"];

function change(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function codRate(orders: Order[]): number {
  const cod = orders.filter((o) => o.paymentMethod === "cod");
  if (cod.length === 0) return 0;
  const ok = cod.filter((o) => confirmedStatuses.includes(o.status)).length;
  return (ok / cod.length) * 100;
}

function revenueOf(orders: Order[]): number {
  return orders
    .filter((o) => !cancelledStatuses.includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);
}

export function computeMetrics(
  orders: Order[],
  range: DateRange,
  storeIds: string[] = allStoreIds,
): PeriodMetrics {
  const span = range.to - range.from;
  const current = inRange(orders, range);
  const previous = inRange(orders, { from: range.from - span, to: range.from });

  const revenue = revenueOf(current);
  const prevRevenue = revenueOf(previous);
  const confirmed = current.filter((o) => confirmedStatuses.includes(o.status)).length;
  const delivered = current.filter((o) => o.status === "delivered").length;
  const returned = current.filter((o) => o.status === "returned").length;

  const visits = visitsInRange(storeIds, range);
  const prevVisits = visitsInRange(storeIds, { from: range.from - span, to: range.from });
  const conversionRate = visits ? (current.length / visits) * 100 : 0;
  const prevConversion = prevVisits ? (previous.length / prevVisits) * 100 : 0;

  return {
    revenue,
    revenueChange: change(revenue, prevRevenue),
    ordersVolume: current.length,
    ordersChange: change(current.length, previous.length),
    pending: current.filter((o) =>
      ["pending", "callback", "scheduled", "unreachable"].includes(o.status),
    ).length,
    confirmed,
    cancelled: current.filter((o) => cancelledStatuses.includes(o.status)).length,
    codConfirmationRate: codRate(current),
    codChange: codRate(current) - codRate(previous),
    averageBasket: current.length ? Math.round(revenue / current.length) : 0,
    visits,
    visitsChange: change(visits, prevVisits),
    conversionRate,
    conversionChange: conversionRate - prevConversion,
    delivered,
    deliveryRate: confirmed ? (delivered / confirmed) * 100 : 0,
    returned,
    returnRate: delivered + returned ? (returned / (delivered + returned)) * 100 : 0,
    revenuePerVisit: visits ? Math.round(revenue / visits) : 0,
  };
}

const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

/** Série de ventes par jour (ou par heure quand la période est d'un seul jour). */
export function buildSeries(orders: Order[], range: DateRange): SalesPoint[] {
  const span = range.to - range.from;
  const current = inRange(orders, range);

  if (span <= DAY) {
    const buckets: SalesPoint[] = Array.from({ length: 12 }, (_, i) => ({
      day: `${String(i * 2).padStart(2, "0")}h`,
      revenue: 0,
      orders: 0,
    }));
    current.forEach((o) => {
      const i = Math.min(11, Math.floor((Date.parse(o.createdAt) - range.from) / (2 * 3_600_000)));
      const b = buckets[i];
      if (!b) return;
      b.orders += 1;
      if (!cancelledStatuses.includes(o.status)) b.revenue += o.total;
    });
    return buckets;
  }

  const days = Math.min(90, Math.round(span / DAY));
  const buckets: SalesPoint[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(range.from + i * DAY);
    return {
      day:
        days <= 10
          ? (dayNames[d.getUTCDay()] ?? "")
          : `${d.getUTCDate()}/${d.getUTCMonth() + 1}`,
      revenue: 0,
      orders: 0,
    };
  });
  current.forEach((o) => {
    const i = Math.floor((Date.parse(o.createdAt) - range.from) / DAY);
    const b = buckets[i];
    if (!b) return;
    b.orders += 1;
    if (!cancelledStatuses.includes(o.status)) b.revenue += o.total;
  });
  return buckets;
}
