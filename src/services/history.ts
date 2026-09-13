import type { Order, OrderStatus } from "@/types";
import { stores } from "./mock-data";

/** Générateur pseudo-aléatoire déterministe (même résultat serveur/client). */
function rand(seed: number) {
  const x = Math.sin(seed) * 10_000;
  return x - Math.floor(x);
}

const names = [
  "Aminata Diallo",
  "Kouassi N'Guessan",
  "Fatou Bamba",
  "Serge Hounkpatin",
  "Mariam Traoré",
  "Ibrahim Sow",
  "Awa Konaté",
  "Yao Kouadio",
];
const cities = ["Abidjan", "Dakar", "Cotonou", "Bamako", "Bouaké", "Lomé"];
const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "confirmed",
  "confirmed",
  "shipped",
  "delivered",
  "delivered",
  "cancelled",
  "rejected",
  "callback",
];
const payments = ["cod", "cod", "cod", "mobile_money", "card", "transfer"] as const;

function startOfTodayUTC(): number {
  const d = new Date();
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Historique de commandes fictif sur 120 jours, utilisé uniquement pour les
 * statistiques du tableau de bord et de la vue d'ensemble.
 */
export function generateHistory(days = 120): Order[] {
  const base = startOfTodayUTC();
  const out: Order[] = [];
  let n = 0;

  for (let d = 0; d < days; d++) {
    const dayStart = base - d * 86_400_000;
    stores.forEach((store, si) => {
      const seed = d * 13 + si * 7 + 1;
      const volume = Math.round(2 + rand(seed) * (si === 0 ? 8 : si === 1 ? 5 : 3));
      for (let i = 0; i < volume; i++) {
        const s = seed * 31 + i * 17;
        const hour = Math.floor(rand(s) * 14) + 7;
        const minute = Math.floor(rand(s + 1) * 60);
        const total = Math.round((5_000 + rand(s + 2) * 60_000) / 500) * 500;
        n += 1;
        const name = names[Math.floor(rand(s + 3) * names.length)] ?? "Client";
        const city = cities[Math.floor(rand(s + 4) * cities.length)] ?? "Abidjan";
        const status = statuses[Math.floor(rand(s + 5) * statuses.length)] ?? "confirmed";
        const payment = payments[Math.floor(rand(s + 6) * payments.length)] ?? "cod";
        out.push({
          id: `h-${d}-${si}-${i}`,
          reference: `CMD-${90_000 + n}`,
          customer: { id: `hc-${n}`, fullName: name, phone: "+225 00 00 00 00", city },
          storeId: store.id,
          items: [{ productId: "p-1", name: "Article", quantity: 1, unitPrice: total }],
          total,
          currency: store.currency,
          status,
          paymentMethod: payment,
          createdAt: new Date(dayStart + hour * 3_600_000 + minute * 60_000).toISOString(),
        });
      }
    });
  }
  return out;
}

export const historicalOrders: Order[] = generateHistory();
