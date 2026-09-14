import { useSyncExternalStore } from "react";

import type {
  AppIntegration,
  AppIntegrationKey,
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

interface FormsState {
  forms: OrderForm[];
  pixels: PixelIntegration[];
  /** Intégrations propres à chaque boutique. */
  integrations: Record<string, AppIntegration[]>;
  /** Bouton WhatsApp de la boutique en ligne, propre à chaque boutique. */
  whatsapp: Record<string, WhatsappWidget>;
}

let state: FormsState = {
  forms: initialForms,
  pixels: initialPixels,
  integrations: {},
  whatsapp: {},
};

const listeners = new Set<() => void>();

function setState(next: Partial<FormsState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

const WA_KEY = "sooko-whatsapp-widgets";
let hydrated = false;

/** Charge les boutons WhatsApp enregistrés (après l'hydratation, côté navigateur). */
function hydrateWhatsapp() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(WA_KEY);
    if (raw) setState({ whatsapp: JSON.parse(raw) as Record<string, WhatsappWidget> });
  } catch {
    /* stockage indisponible */
  }
}

function persistWhatsapp() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WA_KEY, JSON.stringify(state.whatsapp));
  } catch {
    /* stockage indisponible */
  }
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
};
