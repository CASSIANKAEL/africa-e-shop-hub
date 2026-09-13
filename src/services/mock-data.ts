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

export const stores: Store[] = [
  {
    id: "st-1",
    name: "Wax & Co Abidjan",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    currency: "XOF",
    status: "active",
    productsCount: 84,
    monthlyRevenue: 7_450_000,
  },
  {
    id: "st-2",
    name: "Karité Beauté Dakar",
    city: "Dakar",
    country: "Sénégal",
    currency: "XOF",
    status: "active",
    productsCount: 42,
    monthlyRevenue: 3_120_000,
  },
  {
    id: "st-3",
    name: "Tech Pratique Cotonou",
    city: "Cotonou",
    country: "Bénin",
    currency: "XOF",
    status: "paused",
    productsCount: 27,
    monthlyRevenue: 980_000,
  },
];

export const products: Product[] = [
  { id: "p-1", name: "Ensemble pagne wax premium", sku: "WAX-001", price: 24_500, stock: 38, storeId: "st-1", category: "Mode" },
  { id: "p-2", name: "Chemise bogolan homme", sku: "WAX-014", price: 18_000, stock: 12, storeId: "st-1", category: "Mode" },
  { id: "p-3", name: "Beurre de karité pur 500g", sku: "KAR-002", price: 6_500, stock: 120, storeId: "st-2", category: "Beauté" },
  { id: "p-4", name: "Savon noir artisanal", sku: "KAR-009", price: 3_000, stock: 4, storeId: "st-2", category: "Beauté" },
  { id: "p-5", name: "Écouteurs sans fil X3", sku: "TEC-021", price: 15_900, stock: 0, storeId: "st-3", category: "Électronique" },
  { id: "p-6", name: "Sac en cuir tissé", sku: "WAX-033", price: 32_000, stock: 21, storeId: "st-1", category: "Accessoires" },
];

export const customers: Customer[] = [
  { id: "c-1", fullName: "Aminata Diallo", phone: "+221 77 412 08 91", city: "Dakar", ordersCount: 14, totalSpent: 348_000, confirmationRate: 92.8 },
  { id: "c-2", fullName: "Kouassi N'Guessan", phone: "+225 07 55 21 44", city: "Abidjan", ordersCount: 9, totalSpent: 221_500, confirmationRate: 77.7 },
  { id: "c-3", fullName: "Fatou Bamba", phone: "+225 05 88 13 27", city: "Bouaké", ordersCount: 6, totalSpent: 132_000, confirmationRate: 83.3 },
  { id: "c-4", fullName: "Serge Hounkpatin", phone: "+229 96 22 40 18", city: "Cotonou", ordersCount: 4, totalSpent: 74_600, confirmationRate: 50 },
  { id: "c-5", fullName: "Mariam Traoré", phone: "+223 76 09 55 12", city: "Bamako", ordersCount: 11, totalSpent: 289_300, confirmationRate: 90.9 },
];

export const orders: Order[] = [
  {
    id: "o-1",
    reference: "CMD-10241",
    customer: { id: "c-1", fullName: "Aminata Diallo", phone: "+221 77 412 08 91", city: "Dakar" },
    storeId: "st-2",
    items: [
      { productId: "p-3", name: "Beurre de karité pur 500g", quantity: 3, unitPrice: 6_500 },
      { productId: "p-4", name: "Savon noir artisanal", quantity: 2, unitPrice: 3_000 },
    ],
    total: 25_500,
    currency: "XOF",
    status: "pending",
    paymentMethod: "cod",
    createdAt: "2026-09-13T09:14:00.000Z",
    note: "Livraison après 17h, quartier Ouakam.",
  },
  {
    id: "o-2",
    reference: "CMD-10240",
    customer: { id: "c-2", fullName: "Kouassi N'Guessan", phone: "+225 07 55 21 44", city: "Abidjan" },
    storeId: "st-1",
    items: [{ productId: "p-1", name: "Ensemble pagne wax premium", quantity: 1, unitPrice: 24_500 }],
    total: 24_500,
    currency: "XOF",
    status: "confirmed",
    paymentMethod: "mobile_money",
    createdAt: "2026-09-13T07:42:00.000Z",
  },
  {
    id: "o-3",
    reference: "CMD-10239",
    customer: { id: "c-3", fullName: "Fatou Bamba", phone: "+225 05 88 13 27", city: "Bouaké" },
    storeId: "st-1",
    items: [{ productId: "p-6", name: "Sac en cuir tissé", quantity: 1, unitPrice: 32_000 }],
    total: 32_000,
    currency: "XOF",
    status: "shipped",
    paymentMethod: "cod",
    createdAt: "2026-09-12T15:05:00.000Z",
  },
  {
    id: "o-4",
    reference: "CMD-10238",
    customer: { id: "c-4", fullName: "Serge Hounkpatin", phone: "+229 96 22 40 18", city: "Cotonou" },
    storeId: "st-3",
    items: [{ productId: "p-5", name: "Écouteurs sans fil X3", quantity: 2, unitPrice: 15_900 }],
    total: 31_800,
    currency: "XOF",
    status: "cancelled",
    paymentMethod: "cod",
    createdAt: "2026-09-12T11:20:00.000Z",
    note: "Client injoignable après 3 appels.",
  },
  {
    id: "o-5",
    reference: "CMD-10237",
    customer: { id: "c-5", fullName: "Mariam Traoré", phone: "+223 76 09 55 12", city: "Bamako" },
    storeId: "st-2",
    items: [{ productId: "p-3", name: "Beurre de karité pur 500g", quantity: 6, unitPrice: 6_500 }],
    total: 39_000,
    currency: "XOF",
    status: "delivered",
    paymentMethod: "cod",
    createdAt: "2026-09-11T18:31:00.000Z",
  },
  {
    id: "o-6",
    reference: "CMD-10236",
    customer: { id: "c-1", fullName: "Aminata Diallo", phone: "+221 77 412 08 91", city: "Dakar" },
    storeId: "st-1",
    items: [{ productId: "p-2", name: "Chemise bogolan homme", quantity: 2, unitPrice: 18_000 }],
    total: 36_000,
    currency: "XOF",
    status: "pending",
    paymentMethod: "cod",
    createdAt: "2026-09-11T08:02:00.000Z",
  },
];

export const dashboardMetrics: DashboardMetrics = {
  revenue: 11_550_000,
  revenueChange: 12.4,
  ordersVolume: 428,
  ordersChange: 8.1,
  pending: 37,
  confirmed: 341,
  cancelled: 50,
  codConfirmationRate: 79.7,
  codChange: -2.3,
  averageBasket: 26_980,
  currency: "XOF",
};

export const salesSeries: SalesPoint[] = [
  { day: "Lun", revenue: 1_240_000, orders: 46 },
  { day: "Mar", revenue: 1_580_000, orders: 58 },
  { day: "Mer", revenue: 1_310_000, orders: 49 },
  { day: "Jeu", revenue: 1_920_000, orders: 71 },
  { day: "Ven", revenue: 2_460_000, orders: 88 },
  { day: "Sam", revenue: 2_140_000, orders: 79 },
  { day: "Dim", revenue: 900_000, orders: 37 },
];

export const recentActivity: ActivityEvent[] = [
  { id: "a-1", type: "order", label: "Nouvelle commande CMD-10241", detail: "Aminata Diallo · 25 500 FCFA · Paiement à la livraison", time: "Il y a 12 min" },
  { id: "a-2", type: "payment", label: "Paiement Mobile Money reçu", detail: "CMD-10240 · 24 500 FCFA · Wave", time: "Il y a 1 h" },
  { id: "a-3", type: "stock", label: "Stock faible", detail: "Savon noir artisanal · 4 unités restantes", time: "Il y a 3 h" },
  { id: "a-4", type: "order", label: "Commande annulée", detail: "CMD-10238 · Client injoignable", time: "Hier, 11:20" },
  { id: "a-5", type: "customer", label: "Nouveau client fidèle", detail: "Mariam Traoré · 11 commandes confirmées", time: "Hier, 09:05" },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  { id: "pl-1", name: "Démarrage", price: 0, currency: "XOF", features: ["1 boutique", "50 commandes / mois", "Support communautaire"] },
  { id: "pl-2", name: "Croissance", price: 15_000, currency: "XOF", features: ["3 boutiques", "Commandes illimitées", "Suivi COD avancé", "Support WhatsApp"], current: true },
  { id: "pl-3", name: "Pro", price: 45_000, currency: "XOF", features: ["Boutiques illimitées", "Multi-agents", "Rapports exportables", "Account manager"] },
];
