import type {
  AppIntegration,
  OrderForm,
  OrderFormField,
  PixelIntegration,
  QuantityOffer,
} from "@/types";

export const defaultFields = (): OrderFormField[] => [
  {
    id: "f-name",
    label: "Nom complet",
    type: "text",
    placeholder: "Ex. Aminata Diallo",
    required: true,
    enabled: true,
  },
  {
    id: "f-phone",
    label: "Numéro de téléphone",
    type: "phone",
    placeholder: "Ex. 07 00 00 00 00",
    required: true,
    enabled: true,
  },
  {
    id: "f-city",
    label: "Ville",
    type: "city",
    placeholder: "Ex. Abidjan",
    required: true,
    enabled: true,
    options: ["Abidjan", "Bouaké", "Dakar", "Lomé", "Cotonou", "Accra"],
  },
  {
    id: "f-address",
    label: "Quartier / adresse de livraison",
    type: "address",
    placeholder: "Ex. Cocody, Riviera 3",
    required: true,
    enabled: true,
  },
  {
    id: "f-email",
    label: "Email",
    type: "email",
    placeholder: "Ex. client@email.com",
    required: false,
    enabled: false,
  },
  {
    id: "f-note",
    label: "Note pour le livreur",
    type: "note",
    placeholder: "Repère, heure de livraison…",
    required: false,
    enabled: true,
  },
];

export const defaultOffers = (): QuantityOffer[] => [
  { id: "q-1", quantity: 1, label: "1 article", discountPercent: 0, freeShipping: false },
  { id: "q-2", quantity: 2, label: "2 articles — 10 % de remise", discountPercent: 10, freeShipping: false },
  { id: "q-3", quantity: 3, label: "3 articles — 15 % + livraison offerte", discountPercent: 15, freeShipping: true },
];

export function emptyForm(storeId: string): Omit<OrderForm, "id" | "createdAt"> {
  return {
    name: "Formulaire de commande",
    storeId,
    productIds: [],
    status: "draft",
    fields: defaultFields(),
    offers: defaultOffers(),
    upsells: [],
    design: {
      primaryColor: "#e2703f",
      buttonText: "Commander maintenant",
      headline: "Commandez en 30 secondes",
      subheadline: "Paiement à la livraison — vous payez à la réception.",
      layout: "single",
      showProductSummary: true,
      showQuantitySelector: true,
      showCountdown: false,
      buttonTextColor: "#ffffff",
      buttonRadius: 10,
      buttonFontSize: 15,
      buttonHeight: 46,
      buttonBold: true,
      buttonAnimation: "none",
      showTrustBadges: true,
      trustBadges: ["Paiement à la livraison", "Données protégées", "Service client 7j/7"],
      showHeadline: true,
      showSubheadline: true,
    },
    display: {
      mode: "embedded",
      popupTrigger: "buy_now",
      autoOpen: "never",
      position: "below_price",
    },
    settings: {
      blockDuplicates: true,
      requireOtp: false,
      abandonedTracking: true,
      whatsappConfirm: false,
      googleSheetSync: false,
      shippingFee: 2000,
      freeShippingThreshold: 25000,
    },
    thankYou: {
      title: "Commande confirmée",
      message: "Merci ! Votre commande est enregistrée, nous vous appelons pour confirmer.",
      showOrderNumber: true,
      showSummary: true,
    },
    views: 0,
    submissions: 0,
  };
}

export const initialForms: OrderForm[] = [
  {
    ...emptyForm("st-1"),
    id: "form-1",
    name: "Formulaire — Montre connectée",
    status: "active",
    createdAt: "2026-08-21T09:00:00.000Z",
    views: 4820,
    submissions: 612,
    upsells: [
      { id: "u-1", title: "Bracelet de rechange", price: 4000, enabled: true },
      { id: "u-2", title: "Garantie 12 mois", price: 3000, enabled: false },
    ],
  },
  {
    ...emptyForm("st-2"),
    id: "form-2",
    name: "Formulaire — Pack bien-être",
    status: "draft",
    createdAt: "2026-09-02T11:30:00.000Z",
    views: 940,
    submissions: 88,
  },
];

export const initialPixels: PixelIntegration[] = [
  {
    id: "px-1",
    provider: "facebook",
    label: "Meta Pixel — Boutique Abidjan",
    pixelId: "8123456789012345",
    storeId: "st-1",
    events: ["PageView", "ViewContent", "InitiateCheckout", "Purchase"],
    enabled: true,
  },
  {
    id: "px-2",
    provider: "tiktok",
    label: "TikTok Pixel — Campagne septembre",
    pixelId: "CT9K2LRC77U1A3KJ",
    storeId: "st-1",
    events: ["ViewContent", "PlaceAnOrder"],
    enabled: true,
  },
];

export const initialAppIntegrations: AppIntegration[] = [
  {
    key: "google_sheets",
    name: "Google Sheets",
    description: "Chaque commande est ajoutée automatiquement à une feuille de calcul.",
    connected: false,
    value: "",
    valueLabel: "Lien de la feuille",
    placeholder: "https://docs.google.com/spreadsheets/…",
  },
  {
    key: "whatsapp",
    name: "WhatsApp",
    description: "Message automatique de confirmation envoyé au client après commande.",
    connected: true,
    value: "+225 07 00 00 00 00",
    valueLabel: "Numéro d'envoi",
    placeholder: "+225 07 00 00 00 00",
  },
  {
    key: "sms",
    name: "SMS",
    description: "Notification SMS à chaque changement de statut de commande.",
    connected: false,
    value: "",
    valueLabel: "Nom de l'expéditeur",
    placeholder: "SOOKO",
  },
  {
    key: "shipping",
    name: "Société de livraison",
    description: "Envoi automatique des commandes confirmées au transporteur.",
    connected: false,
    value: "",
    valueLabel: "Clé API transporteur",
    placeholder: "Clé fournie par le transporteur",
  },
  {
    key: "webhook",
    name: "Webhook",
    description: "Envoyez chaque commande vers votre propre outil.",
    connected: false,
    value: "",
    valueLabel: "URL du webhook",
    placeholder: "https://mon-outil.com/hooks/commandes",
  },
];
