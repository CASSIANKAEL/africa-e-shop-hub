import { useSyncExternalStore } from "react";

import type {
  AppIntegration,
  AppIntegrationKey,
  GoogleSheetsConfig,
  GoogleShoppingConfig,
  OfferCampaign,
  OrderForm,
  PixelIntegration,
  WhatsappWidget,
} from "@/types";
import { emptyForm, initialAppIntegrations, initialForms, initialPixels } from "./forms.mock";

export const defaultWhatsappWidget: WhatsappWidget = {
  enabled: false,
  countryCode: "CI",
  phone: "",
  label: "Écrivez-nous",
  message: "Bonjour, j'ai une question sur un produit.",
  position: "right",
};

export const defaultGoogleSheets: GoogleSheetsConfig = {
  account: { connected: false, email: "" },
  sheet: { connected: false, url: "", tab: "Commandes" },
  autoSyncOrders: true,
  columns: [
    { id: "gs-reference", header: "Commande", field: "reference" },
    { id: "gs-date", header: "Date", field: "createdAt" },
    { id: "gs-name", header: "Client", field: "customerName" },
    { id: "gs-phone", header: "Téléphone", field: "customerPhone" },
    { id: "gs-city", header: "Ville", field: "customerCity" },
    { id: "gs-products", header: "Produits", field: "products" },
    { id: "gs-total", header: "Montant", field: "total" },
    { id: "gs-status", header: "Statut", field: "status" },
  ],
};

export const defaultGoogleShopping: GoogleShoppingConfig = {
  enabled: false,
  account: { connected: false, email: "" },
  sheet: { connected: false, url: "", tab: "Flux produits" },
  merchantId: "",
  country: "CI",
  autoSyncFeed: true,
};

interface FormsState {
  forms: OrderForm[];
  pixels: PixelIntegration[];
  /** Intégrations propres à chaque boutique. */
  integrations: Record<string, AppIntegration[]>;
  /** Bouton WhatsApp de la boutique en ligne, propre à chaque boutique. */
  whatsapp: Record<string, WhatsappWidget>;
  /** Connexion Google Sheets, propre à chaque boutique. */
  googleSheets: Record<string, GoogleSheetsConfig>;
  /** Flux Google Shopping, propre à chaque boutique. */
  googleShopping: Record<string, GoogleShoppingConfig>;
  /** Campagnes d'offres de quantité, toutes boutiques confondues. */
  offerCampaigns: OfferCampaign[];
}

let state: FormsState = {
  forms: initialForms,
  pixels: initialPixels,
  integrations: {},
  whatsapp: {},
  googleSheets: {},
  googleShopping: {},
  offerCampaigns: [],
};

const listeners = new Set<() => void>();

function setState(next: Partial<FormsState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

const WA_KEY = "sooko-whatsapp-widgets";
const GS_KEY = "sooko-google-sheets";
const GSHOP_KEY = "sooko-google-shopping";
const OFFERS_KEY = "sooko-offer-campaigns";
let hydrated = false;

function readMap<T>(key: string): Record<string, T> | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, T>) : null;
  } catch {
    return null;
  }
}

/** Charge les réglages enregistrés (après l'hydratation, côté navigateur). */
function hydrateWhatsapp() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const wa = readMap<WhatsappWidget>(WA_KEY);
  const gs = readMap<GoogleSheetsConfig>(GS_KEY);
  const gshop = readMap<GoogleShoppingConfig>(GSHOP_KEY);
  let campaigns: OfferCampaign[] | null = null;
  try {
    const raw = window.localStorage.getItem(OFFERS_KEY);
    campaigns = raw ? (JSON.parse(raw) as OfferCampaign[]) : null;
  } catch {
    campaigns = null;
  }
  setState({
    ...(wa ? { whatsapp: wa } : {}),
    ...(gs ? { googleSheets: gs } : {}),
    ...(gshop ? { googleShopping: gshop } : {}),
    ...(campaigns ? { offerCampaigns: campaigns } : {}),
  });
}

function persist(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible */
  }
}

function persistWhatsapp() {
  persist(WA_KEY, state.whatsapp);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrateWhatsapp();
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function useFormsState(): FormsState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Formulaires, filtrés sur une boutique si `storeId` est fourni. */
export function useForms(storeId?: string): OrderForm[] {
  const forms = useFormsState().forms;
  return storeId ? forms.filter((f) => f.storeId === storeId) : forms;
}

export function useOrderForm(id: string): OrderForm | undefined {
  return useFormsState().forms.find((f) => f.id === id);
}

/** Pixels, filtrés sur une boutique si `storeId` est fourni. */
export function usePixels(storeId?: string): PixelIntegration[] {
  const pixels = useFormsState().pixels;
  return storeId ? pixels.filter((p) => p.storeId === storeId) : pixels;
}

function integrationsFor(storeId: string): AppIntegration[] {
  return state.integrations[storeId] ?? initialAppIntegrations;
}

/** Intégrations propres à la boutique donnée. */
export function useAppIntegrations(storeId: string): AppIntegration[] {
  const map = useFormsState().integrations;
  return map[storeId] ?? initialAppIntegrations;
}

/** Configuration du bouton WhatsApp de la boutique donnée. */
export function useWhatsappWidget(storeId: string): WhatsappWidget {
  const map = useFormsState().whatsapp;
  return map[storeId] ?? defaultWhatsappWidget;
}

/** Connexion Google Sheets de la boutique donnée. */
export function useGoogleSheets(storeId: string): GoogleSheetsConfig {
  const map = useFormsState().googleSheets;
  const stored = map[storeId];
  return stored ? { ...defaultGoogleSheets, ...stored, columns: stored.columns ?? defaultGoogleSheets.columns } : defaultGoogleSheets;
}

/** Flux Google Shopping de la boutique donnée. */
export function useGoogleShopping(storeId: string): GoogleShoppingConfig {
  const map = useFormsState().googleShopping;
  return map[storeId] ?? defaultGoogleShopping;
}

export type NewPixelInput = Omit<PixelIntegration, "id">;

export const formsStore = {
  blankForm(storeId: string): OrderForm {
    return { ...emptyForm(storeId), id: `form-${Date.now()}`, createdAt: new Date().toISOString() };
  },
  saveForm(form: OrderForm): OrderForm {
    const exists = state.forms.some((f) => f.id === form.id);
    setState({
      forms: exists ? state.forms.map((f) => (f.id === form.id ? form : f)) : [form, ...state.forms],
    });
    return form;
  },
  duplicateForm(id: string): OrderForm | undefined {
    const source = state.forms.find((f) => f.id === id);
    if (!source) return undefined;
    const copy: OrderForm = {
      ...source,
      id: `form-${Date.now()}`,
      name: `${source.name} (copie)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      views: 0,
      submissions: 0,
    };
    setState({ forms: [copy, ...state.forms] });
    return copy;
  },
  toggleFormStatus(id: string) {
    setState({
      forms: state.forms.map((f) =>
        f.id === id ? { ...f, status: f.status === "active" ? "draft" : "active" } : f,
      ),
    });
  },
  deleteForm(id: string) {
    setState({ forms: state.forms.filter((f) => f.id !== id) });
  },
  addPixel(input: NewPixelInput): PixelIntegration {
    const pixel: PixelIntegration = { ...input, id: `px-${Date.now()}` };
    setState({ pixels: [pixel, ...state.pixels] });
    return pixel;
  },
  togglePixel(id: string) {
    setState({
      pixels: state.pixels.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)),
    });
  },
  deletePixel(id: string) {
    setState({ pixels: state.pixels.filter((p) => p.id !== id) });
  },
  toggleIntegration(storeId: string, key: AppIntegrationKey) {
    setState({
      integrations: {
        ...state.integrations,
        [storeId]: integrationsFor(storeId).map((i) =>
          i.key === key ? { ...i, connected: !i.connected } : i,
        ),
      },
    });
  },
  setIntegrationValue(storeId: string, key: AppIntegrationKey, value: string) {
    setState({
      integrations: {
        ...state.integrations,
        [storeId]: integrationsFor(storeId).map((i) => (i.key === key ? { ...i, value } : i)),
      },
    });
  },
  setWhatsappWidget(storeId: string, patch: Partial<WhatsappWidget>) {
    setState({
      whatsapp: {
        ...state.whatsapp,
        [storeId]: { ...(state.whatsapp[storeId] ?? defaultWhatsappWidget), ...patch },
      },
    });
    persistWhatsapp();
  },
  setGoogleSheets(storeId: string, patch: Partial<GoogleSheetsConfig>) {
    const current = state.googleSheets[storeId] ?? defaultGoogleSheets;
    const next = {
      ...current,
      ...patch,
      account: { ...current.account, ...(patch.account ?? {}) },
      sheet: { ...current.sheet, ...(patch.sheet ?? {}) },
      columns: patch.columns ?? current.columns ?? defaultGoogleSheets.columns,
    };
    setState({ googleSheets: { ...state.googleSheets, [storeId]: next } });
    persist(GS_KEY, state.googleSheets);
  },
  setGoogleShopping(storeId: string, patch: Partial<GoogleShoppingConfig>) {
    const current = state.googleShopping[storeId] ?? defaultGoogleShopping;
    const next = {
      ...current,
      ...patch,
      account: { ...current.account, ...(patch.account ?? {}) },
      sheet: { ...current.sheet, ...(patch.sheet ?? {}) },
    };
    setState({ googleShopping: { ...state.googleShopping, [storeId]: next } });
    persist(GSHOP_KEY, state.googleShopping);
  },
};
