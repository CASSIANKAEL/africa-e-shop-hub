import { stores } from "./mock-data";

/** Générateur pseudo-aléatoire déterministe (même résultat serveur/client). */
function rand(seed: number) {
  const x = Math.sin(seed) * 10_000;
  return x - Math.floor(x);
}

const DAY = 86_400_000;

function startOfTodayUTC(): number {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export const allStoreIds = stores.map((s) => s.id);

function storeIndex(storeId: string): number {
  const i = allStoreIds.indexOf(storeId);
  return i < 0 ? 0 : i;
}

/** Visites fictives d'une boutique pour un jour donné (UTC). */
export function visitsForDay(storeId: string, dayStart: number): number {
  const si = storeIndex(storeId);
  const dayIndex = Math.round((startOfTodayUTC() - dayStart) / DAY);
  const seed = dayIndex * 17 + si * 5 + 3;
  const base = si === 0 ? 420 : si === 1 ? 260 : 150;
  return Math.round(base * (0.6 + rand(seed) * 0.9));
}

/** Répartition horaire (24 h) des visites d'un jour, somme = visitsForDay. */
export function visitsByHour(storeId: string, dayStart: number): number[] {
  const total = visitsForDay(storeId, dayStart);
  const si = storeIndex(storeId);
  const weights = Array.from({ length: 24 }, (_, h) => {
    const peak = Math.exp(-((h - 13) ** 2) / 26) + Math.exp(-((h - 20) ** 2) / 14);
    return peak * (0.7 + rand(h * 3 + si + 1) * 0.6);
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => Math.round((w / sum) * total));
}

/** Visites cumulées sur une plage, pour une ou plusieurs boutiques. */
export function visitsInRange(storeIds: string[], range: { from: number; to: number }): number {
  let total = 0;
  for (const storeId of storeIds) {
    for (let t = Math.floor(range.from / DAY) * DAY; t < range.to; t += DAY) {
      if (t + DAY <= range.from) continue;
      const hours = visitsByHour(storeId, t);
      const start = Math.max(0, Math.floor((range.from - t) / 3_600_000));
      const end = Math.min(24, Math.ceil((range.to - t) / 3_600_000));
      for (let h = start; h < end; h++) total += hours[h] ?? 0;
    }
  }
  return total;
}
