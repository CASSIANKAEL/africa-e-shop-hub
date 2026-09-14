/** Indicatifs téléphoniques utilisés pour le bouton WhatsApp de la boutique. */
export interface CountryDial {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

export const countryDials: CountryDial[] = [
  { code: "BJ", name: "Bénin", dial: "229", flag: "🇧🇯" },
  { code: "BF", name: "Burkina Faso", dial: "226", flag: "🇧🇫" },
  { code: "CM", name: "Cameroun", dial: "237", flag: "🇨🇲" },
  { code: "CI", name: "Côte d'Ivoire", dial: "225", flag: "🇨🇮" },
  { code: "CD", name: "RD Congo", dial: "243", flag: "🇨🇩" },
  { code: "CG", name: "Congo", dial: "242", flag: "🇨🇬" },
  { code: "GA", name: "Gabon", dial: "241", flag: "🇬🇦" },
  { code: "GH", name: "Ghana", dial: "233", flag: "🇬🇭" },
  { code: "GN", name: "Guinée", dial: "224", flag: "🇬🇳" },
  { code: "KE", name: "Kenya", dial: "254", flag: "🇰🇪" },
  { code: "ML", name: "Mali", dial: "223", flag: "🇲🇱" },
  { code: "MA", name: "Maroc", dial: "212", flag: "🇲🇦" },
  { code: "NE", name: "Niger", dial: "227", flag: "🇳🇪" },
  { code: "NG", name: "Nigeria", dial: "234", flag: "🇳🇬" },
  { code: "RW", name: "Rwanda", dial: "250", flag: "🇷🇼" },
  { code: "SN", name: "Sénégal", dial: "221", flag: "🇸🇳" },
  { code: "SL", name: "Sierra Leone", dial: "232", flag: "🇸🇱" },
  { code: "TZ", name: "Tanzanie", dial: "255", flag: "🇹🇿" },
  { code: "TD", name: "Tchad", dial: "235", flag: "🇹🇩" },
  { code: "TG", name: "Togo", dial: "228", flag: "🇹🇬" },
  { code: "TN", name: "Tunisie", dial: "216", flag: "🇹🇳" },
  { code: "DZ", name: "Algérie", dial: "213", flag: "🇩🇿" },
  { code: "EG", name: "Égypte", dial: "20", flag: "🇪🇬" },
  { code: "ZA", name: "Afrique du Sud", dial: "27", flag: "🇿🇦" },
  { code: "UG", name: "Ouganda", dial: "256", flag: "🇺🇬" },
  { code: "FR", name: "France", dial: "33", flag: "🇫🇷" },
  { code: "BE", name: "Belgique", dial: "32", flag: "🇧🇪" },
  { code: "ES", name: "Espagne", dial: "34", flag: "🇪🇸" },
  { code: "IT", name: "Italie", dial: "39", flag: "🇮🇹" },
  { code: "DE", name: "Allemagne", dial: "49", flag: "🇩🇪" },
  { code: "PT", name: "Portugal", dial: "351", flag: "🇵🇹" },
  { code: "GB", name: "Royaume-Uni", dial: "44", flag: "🇬🇧" },
  { code: "US", name: "États-Unis / Canada", dial: "1", flag: "🇺🇸" },
  { code: "AE", name: "Émirats arabes unis", dial: "971", flag: "🇦🇪" },
  { code: "SA", name: "Arabie saoudite", dial: "966", flag: "🇸🇦" },
  { code: "TR", name: "Turquie", dial: "90", flag: "🇹🇷" },
  { code: "CN", name: "Chine", dial: "86", flag: "🇨🇳" },
  { code: "IN", name: "Inde", dial: "91", flag: "🇮🇳" },
];

export function findDial(code: string): CountryDial | undefined {
  return countryDials.find((c) => c.code === code);
}

/** Numéro complet au format WhatsApp (chiffres uniquement). */
export function whatsappNumber(countryCode: string, phone: string): string {
  const dial = findDial(countryCode)?.dial ?? "";
  return `${dial}${phone.replace(/\D/g, "")}`;
}
