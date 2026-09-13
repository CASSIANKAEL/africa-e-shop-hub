export type Currency = "XOF" | "XAF" | "GHS" | "NGN";

export type OrderStatus =
  | "pending"
  | "unreachable"
  | "scheduled"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "rejected"
  | "cancelled"
  | "returned";

export interface OrderComment {
  id: string;
  text: string;
  createdAt: string;
}

export type PaymentMethod = "cod" | "mobile_money" | "card" | "transfer";

export interface Store {
  id: string;
  name: string;
  city: string;
  country: string;
  currency: Currency;
  status: "active" | "paused";
  productsCount: number;
  monthlyRevenue: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  storeId: string;
  category: string;
  image?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  ordersCount: number;
  totalSpent: number;
  confirmationRate: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  reference: string;
  customer: Pick<Customer, "id" | "fullName" | "phone" | "city">;
  storeId: string;
  items: OrderItem[];
  total: number;
  currency: Currency;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  note?: string;
  /** Date/heure de rappel pour les commandes injoignables ou programmées. */
  followUpAt?: string;
  comments?: OrderComment[];
}

export interface DashboardMetrics {
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
  currency: Currency;
}

export interface SalesPoint {
  day: string;
  revenue: number;
  orders: number;
}

export interface ActivityEvent {
  id: string;
  type: "order" | "stock" | "payment" | "customer";
  label: string;
  detail: string;
  time: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  features: string[];
  current?: boolean;
}
