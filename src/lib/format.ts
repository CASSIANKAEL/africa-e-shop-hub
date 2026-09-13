import { getActiveLocale } from "@/lib/i18n";
import type { Currency } from "@/types";

const zeroDecimalCurrencies = new Set<Currency>(["XOF", "XAF", "GNF", "RWF", "UGX"]);

export function formatMoney(value: number, currency: Currency = "XOF"): string {
  return new Intl.NumberFormat(getActiveLocale(), {
    style: "currency",
    currency,
    maximumFractionDigits: zeroDecimalCurrencies.has(currency) ? 0 : 2,
  }).format(value);
}

export function formatCompactMoney(value: number, currency: Currency = "XOF"): string {
  return new Intl.NumberFormat(getActiveLocale(), {
    style: "currency", currency, notation: "compact", maximumFractionDigits: 1,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(getActiveLocale()).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat(getActiveLocale(), { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value) + " %";
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(getActiveLocale(), {
    timeZone: "UTC", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}
