import { useSyncExternalStore } from "react";

import { allStoreIds } from "./traffic";

export type LiveEventType =
  | "page_view"
  | "view_content"
  | "form_view"
  | "add_to_cart"
  | "initiate_checkout"
  | "purchase";

export interface LiveEvent {
  id: string;
  storeId: string;
  type: LiveEventType;
  source: string;
  city: string;
  device: "mobile" | "desktop";
  page: string;
  value: number;
  pixels: string[];
  at: number;
}

export const liveEventLabels: Record<LiveEventType, string> = {
  page_view: "Page vue",
  view_content: "Produit consulté",
  form_view: "Formulaire ouvert",
  add_to_cart: "Ajout au panier",
  initiate_checkout: "Début de commande",
  purchase: "Commande validée",
};

const cities = ["Abidjan", "Bouaké", "Dakar", "Lomé", "Cotonou", "Accra", "Yamoussoukro"];
const sources = ["Facebook Ads", "TikTok Ads", "Direct", "WhatsApp", "Google", "Instagram"];
const pages = ["/montre-connectee", "/pack-bien-etre", "/formulaire/commande", "/promo-septembre"];
const pixelNames = ["Meta", "TikTok", "Google Ads"];

const weighted: LiveEventType[] = [
  "page_view",
  "page_view",
  "page_view",
  "page_view",
  "view_content",
  "view_content",
  "view_content",
  "form_view",
  "form_view",
  "add_to_cart",
  "initiate_checkout",
  "purchase",
];

const WINDOW_MS = 30 * 60_000;

interface RealtimeState {
  events: LiveEvent[];
  now: number;
}

let state: RealtimeState = { events: [], now: 0 };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
let counter = 0;

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)] as T;
}

function makeEvent(at: number): LiveEvent {
  const type = pick(weighted);
  const firedCount = type === "purchase" ? 3 : type === "page_view" ? 1 : 2;
  counter += 1;
  return {
    id: `ev-${at}-${counter}`,
    storeId: pick(allStoreIds),
    type,
    source: pick(sources),
    city: pick(cities),
    device: Math.random() > 0.22 ? "mobile" : "desktop",
    page: pick(pages),
    value: type === "purchase" ? 12000 + Math.floor(Math.random() * 40000) : 0,
    pixels: pixelNames.slice(0, firedCount),
    at,
  };
}

function tick() {
  const now = Date.now();
  const count = 1 + Math.floor(Math.random() * 3);
  const fresh = Array.from({ length: count }, (_, i) => makeEvent(now - i * 120));
  const events = [...fresh, ...state.events].filter((e) => now - e.at < WINDOW_MS).slice(0, 400);
  state = { events, now };
  listeners.forEach((l) => l());
}

function seed() {
  const now = Date.now();
  const events: LiveEvent[] = [];
  for (let i = 0; i < 160; i++) {
    events.push(makeEvent(now - Math.floor(Math.random() * WINDOW_MS)));
  }
  events.sort((a, b) => b.at - a.at);
  state = { events, now };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    if (state.events.length === 0) seed();
    timer = setInterval(tick, 2500);
    listeners.forEach((l) => l());
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const serverSnapshot: RealtimeState = { events: [], now: 0 };

function getSnapshot() {
  return state;
}

function getServerSnapshot() {
  return serverSnapshot;
}

export function useRealtime(storeId?: string) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const events = storeId ? snap.events.filter((e) => e.storeId === storeId) : snap.events;
  return { events, now: snap.now };
}

/** Visiteurs actifs = sessions distinctes (approximées) sur les 5 dernières minutes. */
export function activeVisitors(events: LiveEvent[], now: number): number {
  return events.filter((e) => now - e.at < 5 * 60_000).length;
}

/** Série par minute sur les 30 dernières minutes. */
export function perMinuteSeries(
  events: LiveEvent[],
  now: number,
): { day: string; visits: number; orders: number }[] {
  if (!now) return [];
  const buckets = Array.from({ length: 30 }, () => ({ visits: 0, orders: 0 }));
  for (const e of events) {
    const idx = 29 - Math.floor((now - e.at) / 60_000);
    if (idx < 0 || idx > 29) continue;
    const b = buckets[idx]!;
    b.visits += 1;
    if (e.type === "purchase") b.orders += 1;
  }
  return buckets.map((b, i) => ({ day: `-${29 - i} min`, visits: b.visits, orders: b.orders }));
}

export function countByType(events: LiveEvent[]): { type: LiveEventType; count: number }[] {
  const order: LiveEventType[] = [
    "page_view",
    "view_content",
    "form_view",
    "add_to_cart",
    "initiate_checkout",
    "purchase",
  ];
  return order.map((type) => ({ type, count: events.filter((e) => e.type === type).length }));
}

export function countBySource(events: LiveEvent[]): { source: string; count: number }[] {
  return sources
    .map((source) => ({ source, count: events.filter((e) => e.source === source).length }))
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);
}
