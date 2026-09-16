import { useSyncExternalStore } from "react";

import { SPY_FAVORITES_KEY } from "./spy.mock";

export interface TrackedBrand {
  id: string;
  name: string;
  country: string;
  createdAt: string;
}

export interface FinderFolder {
  id: string;
  name: string;
  adIds: string[];
}

export interface SourcingRequest {
  id: string;
  product: string;
  quantity: number;
  country: string;
  targetPrice: number;
  createdAt: string;
}

interface ProductFinderState {
  favorites: string[];
  trackedBrands: TrackedBrand[];
  folders: FinderFolder[];
  sourcingRequests: SourcingRequest[];
  tutorialSteps: string[];
}

const STORAGE_KEY = "sooko-product-finder";

const initialState: ProductFinderState = {
  favorites: [],
  trackedBrands: [
    { id: "brand-1", name: "Wax Palace Abidjan", country: "Côte d'Ivoire", createdAt: "2026-09-10T09:00:00.000Z" },
    { id: "brand-2", name: "Karité Beauté Dakar", country: "Sénégal", createdAt: "2026-09-12T14:30:00.000Z" },
  ],
  folders: [
    { id: "folder-1", name: "À tester cette semaine", adIds: ["spy-2", "spy-3"] },
    { id: "folder-2", name: "Mode & accessoires", adIds: ["spy-1", "spy-4"] },
  ],
  sourcingRequests: [],
  tutorialSteps: [],
};

let state = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.localStorage.setItem(SPY_FAVORITES_KEY, JSON.stringify(state.favorites));
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const legacyFavorites = window.localStorage.getItem(SPY_FAVORITES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<ProductFinderState>;
      state = {
        favorites: parsed.favorites ?? initialState.favorites,
        trackedBrands: parsed.trackedBrands ?? initialState.trackedBrands,
        folders: parsed.folders ?? initialState.folders,
        sourcingRequests: parsed.sourcingRequests ?? initialState.sourcingRequests,
        tutorialSteps: parsed.tutorialSteps ?? initialState.tutorialSteps,
      };
    } else if (legacyFavorites) {
      const favorites = JSON.parse(legacyFavorites) as unknown;
      if (Array.isArray(favorites)) state = { ...state, favorites: favorites.filter((id): id is string => typeof id === "string") };
    }
  } catch {
    state = initialState;
  }
  listeners.forEach((listener) => listener());
}

function update(next: ProductFinderState) {
  state = next;
  persist();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrate();
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useProductFinderState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const productFinderStore = {
  toggleFavorite(id: string) {
    const favorites = state.favorites.includes(id)
      ? state.favorites.filter((item) => item !== id)
      : [...state.favorites, id];
    update({ ...state, favorites });
  },
  addBrand(name: string, country: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    update({
      ...state,
      trackedBrands: [...state.trackedBrands, { id: `brand-${Date.now()}`, name: trimmed, country, createdAt: new Date().toISOString() }],
    });
  },
  removeBrand(id: string) {
    update({ ...state, trackedBrands: state.trackedBrands.filter((brand) => brand.id !== id) });
  },
  addFolder(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    update({ ...state, folders: [...state.folders, { id: `folder-${Date.now()}`, name: trimmed, adIds: [] }] });
  },
  removeFolder(id: string) {
    update({ ...state, folders: state.folders.filter((folder) => folder.id !== id) });
  },
  toggleAdInFolder(folderId: string, adId: string) {
    update({
      ...state,
      folders: state.folders.map((folder) => {
        if (folder.id !== folderId) return folder;
        const adIds = folder.adIds.includes(adId) ? folder.adIds.filter((id) => id !== adId) : [...folder.adIds, adId];
        return { ...folder, adIds };
      }),
    });
  },
  addSourcingRequest(input: Omit<SourcingRequest, "id" | "createdAt">) {
    update({
      ...state,
      sourcingRequests: [
        { ...input, id: `source-${Date.now()}`, createdAt: new Date().toISOString() },
        ...state.sourcingRequests,
      ],
    });
  },
  toggleTutorialStep(id: string) {
    const tutorialSteps = state.tutorialSteps.includes(id)
      ? state.tutorialSteps.filter((step) => step !== id)
      : [...state.tutorialSteps, id];
    update({ ...state, tutorialSteps });
  },
};