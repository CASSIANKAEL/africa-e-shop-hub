export type Currency = "XOF" | "XAF" | "GHS" | "NGN";

export type OrderStatus =
  | "pending"
  | "unreachable"
  | "scheduled"
  | "callback"
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
  /** Suivi de stock activé (false = stock illimité / non suivi). */
  trackStock?: boolean;
  description?: string;
  images?: string[];
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

/* ---------- Formulaires & intégrations ---------- */

export type OrderFormFieldType =
  | "text"
  | "phone"
  | "email"
  | "city"
  | "address"
  | "note"
  | "select";

export interface OrderFormField {
  id: string;
  label: string;
  type: OrderFormFieldType;
  placeholder?: string;
  required: boolean;
  enabled: boolean;
  options?: string[];
}

export interface QuantityOffer {
  id: string;
  quantity: number;
  label: string;
  discountPercent: number;
  freeShipping: boolean;
}

export interface OrderFormUpsell {
  id: string;
  title: string;
  price: number;
  enabled: boolean;
}

export interface OrderFormDesign {
  primaryColor: string;
  buttonText: string;
  headline: string;
  subheadline: string;
  layout: "single" | "two-columns";
  showProductSummary: boolean;
  showQuantitySelector: boolean;
  showCountdown: boolean;
}

export interface OrderFormSettings {
  blockDuplicates: boolean;
  requireOtp: boolean;
  abandonedTracking: boolean;
  whatsappConfirm: boolean;
  googleSheetSync: boolean;
  shippingFee: number;
  freeShippingThreshold: number;
}

export interface OrderForm {
  id: string;
  name: string;
  storeId: string;
  productIds: string[];
  status: "active" | "draft";
  fields: OrderFormField[];
  offers: QuantityOffer[];
  upsells: OrderFormUpsell[];
  design: OrderFormDesign;
  settings: OrderFormSettings;
  thankYou: { message: string; redirectUrl?: string };
  createdAt: string;
  views: number;
  submissions: number;
}

export type PixelProvider = "facebook" | "tiktok" | "snapchat" | "google" | "pinterest";

export interface PixelIntegration {
  id: string;
  provider: PixelProvider;
  label: string;
  pixelId: string;
  accessToken?: string;
  storeId: string;
  events: string[];
  enabled: boolean;
}

export type AppIntegrationKey =
  | "google_sheets"
  | "whatsapp"
  | "sms"
  | "shipping"
  | "webhook";

export interface AppIntegration {
  key: AppIntegrationKey;
  name: string;
  description: string;
  connected: boolean;
  value: string;
  valueLabel: string;
  placeholder: string;
}
