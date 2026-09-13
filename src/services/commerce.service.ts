import type {
  ActivityEvent,
  Customer,
  DashboardMetrics,
  Order,
  Product,
  SalesPoint,
  Store,
  SubscriptionPlan,
} from "@/types";
import {
  customers,
  dashboardMetrics,
  orders,
  products,
  recentActivity,
  salesSeries,
  stores,
  subscriptionPlans,
} from "./mock-data";

/**
 * Mock service layer. Replace these implementations with real API / backend
 * calls later — the component code only depends on these signatures.
 */
export const commerceService = {
  getStores: (): Store[] => stores,
  getProducts: (): Product[] => products,
  getCustomers: (): Customer[] => customers,
  getOrders: (): Order[] => orders,
  getOrder: (id: string): Order | undefined =>
    orders.find((o) => o.id === id || o.reference === id),
  getDashboardMetrics: (): DashboardMetrics => dashboardMetrics,
  getSalesSeries: (): SalesPoint[] => salesSeries,
  getRecentActivity: (): ActivityEvent[] => recentActivity,
  getSubscriptionPlans: (): SubscriptionPlan[] => subscriptionPlans,
  getStoreName: (storeId: string): string =>
    stores.find((s) => s.id === storeId)?.name ?? "Boutique",
};
