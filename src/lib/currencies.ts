import type { Currency } from "@/types";

export const currencies: Currency[] = [
  "XOF", "XAF", "GHS", "NGN", "USD", "EUR", "GBP", "MAD", "DZD", "TND",
  "EGP", "KES", "UGX", "TZS", "RWF", "ZAR", "CDF", "GNF", "SLE",
];

export const currencyNames: Record<Currency, string> = {
  XOF: "Franc CFA (XOF)", XAF: "Franc CFA (XAF)", GHS: "Cedi ghanéen (GHS)",
  NGN: "Naira nigérian (NGN)", USD: "Dollar américain (USD)", EUR: "Euro (EUR)",
  GBP: "Livre sterling (GBP)", MAD: "Dirham marocain (MAD)", DZD: "Dinar algérien (DZD)",
  TND: "Dinar tunisien (TND)", EGP: "Livre égyptienne (EGP)", KES: "Shilling kényan (KES)",
  UGX: "Shilling ougandais (UGX)", TZS: "Shilling tanzanien (TZS)", RWF: "Franc rwandais (RWF)",
  ZAR: "Rand sud-africain (ZAR)", CDF: "Franc congolais (CDF)", GNF: "Franc guinéen (GNF)",
  SLE: "Leone sierra-léonais (SLE)",
};
