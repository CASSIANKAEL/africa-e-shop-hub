import { useSyncExternalStore } from "react";

import type { AppIntegration, AppIntegrationKey, OrderForm, PixelIntegration } from "@/types";
import { emptyForm, initialAppIntegrations, initialForms, initialPixels } from "./forms.mock";

interface FormsState {
  forms: OrderForm[];
  pixels: PixelIntegration[];
  /** Intégrations propres à chaque boutique. */
  integrations: Record<string, AppIntegration[]>;
}

let state: FormsState = {
  forms: initialForms,
  pixels: initialPixels,
  integrations: {},
};

const listeners = new Set<() => void>();

function setState(next: Partial<FormsState>) {
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

function useFormsState(): FormsState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useForms(): OrderForm[] {
  return useFormsState().forms;
}

export function useOrderForm(id: string): OrderForm | undefined {
  return useFormsState().forms.find((f) => f.id === id);
}

export function usePixels(): PixelIntegration[] {
  return useFormsState().pixels;
}

export function useAppIntegrations(): AppIntegration[] {
  return useFormsState().integrations;
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
  toggleIntegration(key: AppIntegrationKey) {
    setState({
      integrations: state.integrations.map((i) =>
        i.key === key ? { ...i, connected: !i.connected } : i,
      ),
    });
  },
  setIntegrationValue(key: AppIntegrationKey, value: string) {
    setState({
      integrations: state.integrations.map((i) => (i.key === key ? { ...i, value } : i)),
    });
  },
};
