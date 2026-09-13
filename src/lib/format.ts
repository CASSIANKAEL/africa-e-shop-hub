import type { Currency } from "@/types";

const SUFFIX: Record<Currency, string> = {
  XOF: "FCFA",
  XAF: "FCFA",
  GHS: "GHS",
  NGN: "NGN",
};

export function formatMoney(value: number, currency: Currency = "XOF"): string {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(value))} ${SUFFIX[currency]}`;
}

export function formatCompactMoney(value: number, currency: Currency = "XOF"): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M ${SUFFIX[currency]}`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K ${SUFFIX[currency]}`;
  return formatMoney(value, currency);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1).replace(".", ",")} %`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
