import { useSyncExternalStore } from "react";

/* ---------- Types ---------- */

export type StoreTemplateId = "eclat" | "sahel";
export type StoreSectionId = "announcement" | "hero" | "benefits" | "categories" | "products" | "footer";
export type StoreTextBlockType = "display" | "heading" | "body" | "caption";

export interface StoreTextBlock {
  id: string;
  type: StoreTextBlockType;
  text: string;
}

/** Page légale affichée dans le pied de page et sur chaque fiche produit. */
export interface StoreLegalPage {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
}

export const defaultLegalPages: StoreLegalPage[] = [
  {
    id: "confidentialite",
    title: "Politique de confidentialité",
    content:
      "Nous collectons uniquement votre nom, votre numéro de téléphone et votre adresse de livraison pour traiter votre commande. Ces informations ne sont jamais revendues. Vous pouvez demander leur suppression à tout moment en nous écrivant sur WhatsApp.",
    enabled: true,
  },
  {
    id: "retours",
    title: "Retours et remboursements",
    content:
      "Vous disposez de 7 jours après la réception pour demander un échange ou un retour si le produit est défectueux ou ne correspond pas à la description. Le produit doit être non utilisé et dans son emballage d'origine. Le remboursement est effectué en espèces ou par mobile money sous 72 heures.",
    enabled: true,
  },
  {
    id: "livraison",
    title: "Livraison",
    content:
      "Livraison en 24 à 48 heures en ville et 2 à 5 jours à l'intérieur du pays. Vous payez le produit à la réception, après vérification. Le livreur vous appelle avant de passer.",
    enabled: true,
  },
  {
    id: "cgv",
    title: "Conditions générales de vente",
    content:
      "Toute commande passée sur cette boutique vaut acceptation des présentes conditions. Les prix sont affichés toutes taxes comprises. Une commande peut être annulée gratuitement tant que le livreur n'est pas parti.",
    enabled: true,
  },
  {
    id: "contact",
    title: "Contact et mentions légales",
    content:
      "Pour toute question, écrivez-nous sur WhatsApp ou appelez le numéro affiché sur la boutique. Notre service client répond 7j/7 de 8h à 20h.",
    enabled: true,
  },
];


export interface StoreTheme {
  templateId: StoreTemplateId;
  /** Couleurs (valeurs hexadécimales). */
  primary: string;
  primaryText: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  /** Identité et contenu libre de la bannière. */
  logo?: string;
  textBlocks: StoreTextBlock[];
  /** Typographie */
  fontPair: "grotesk" | "elegant" | "modern" | "afro" | "editorial" | "friendly";
  headingScale: number;
  uppercaseHeadings: boolean;
  /** Boutons */
  buttonRadius: number;
  buttonHeight: number;
  buttonBold: boolean;
  buttonUppercase: boolean;
  buttonStyle: "solid" | "outline" | "soft";
  buttonLabel: string;
  /** Mise en page */
  columns: 2 | 3 | 4;
  containerWidth: "narrow" | "normal" | "wide";
  cardStyle: "shadow" | "border" | "flat";
  imageRatio: "square" | "portrait" | "landscape";
  cornerRadius: number;
  /** Éléments affichés */
  showAnnouncement: boolean;
  announcement: string;
  /** Plusieurs messages affichés dans le bandeau. */
  announcements: string[];
  /** Fait défiler les messages du bandeau en continu. */
  announcementScroll: boolean;
  /** Durée d'un cycle de défilement, en secondes. */
  announcementSpeed: number;
  showHero: boolean;
  heroTitle: string;
  heroSubtitle: string;
  showBenefits: boolean;
  showCategories: boolean;
  showProducts: boolean;
  showFooter: boolean;
  footerText: string;
  /** Pages légales affichées dans le pied de page et sur chaque produit. */
  showLegalPages: boolean;
  legalPages: StoreLegalPage[];

  /** Ordre visuel des blocs de la vitrine. */
  sectionOrder: StoreSectionId[];
}

export interface StoreTemplate {
  id: StoreTemplateId;
  name: string;
  tagline: string;
  description: string;
  theme: StoreTheme;
}

export const fontPairs: Record<
  StoreTheme["fontPair"],
  { label: string; heading: string; body: string }
> = {
  grotesk: {
    label: "Space Grotesk / DM Sans",
    heading: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
    body: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  },
  elegant: {
    label: "Playfair Display / Poppins",
    heading: '"Playfair Display", Georgia, serif',
    body: '"Poppins", ui-sans-serif, system-ui, sans-serif',
  },
  modern: {
    label: "Outfit / DM Sans",
    heading: '"Outfit", ui-sans-serif, system-ui, sans-serif',
    body: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
  },
  afro: {
    label: "Sora / Work Sans",
    heading: '"Sora", ui-sans-serif, system-ui, sans-serif',
    body: '"Work Sans", ui-sans-serif, system-ui, sans-serif',
  },
  editorial: {
    label: "Libre Baskerville / Work Sans",
    heading: '"Libre Baskerville", Georgia, serif',
    body: '"Work Sans", ui-sans-serif, system-ui, sans-serif',
  },
  friendly: {
    label: "Lora / Nunito Sans",
    heading: '"Lora", Georgia, serif',
    body: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
  },
};

/* ---------- Modèles prêts à l'emploi ---------- */

const eclat: StoreTheme = {
  templateId: "eclat",
  primary: "#111111",
  primaryText: "#ffffff",
  background: "#ffffff",
  surface: "#f7f6f3",
  text: "#12100e",
  muted: "#6b6560",
  accent: "#e8c9a0",
  textBlocks: [
    { id: "eclat-title", type: "display", text: "Une sélection qui brille" },
    { id: "eclat-copy", type: "body", text: "Des pièces choisies avec soin, livrées chez vous et payées à la réception." },
  ],
  fontPair: "elegant",
  headingScale: 1,
  uppercaseHeadings: true,
  buttonRadius: 4,
  buttonHeight: 48,
  buttonBold: false,
  buttonUppercase: true,
  buttonStyle: "solid",
  buttonLabel: "Commander",
  columns: 3,
  containerWidth: "wide",
  cardStyle: "flat",
  imageRatio: "portrait",
  cornerRadius: 4,
  showAnnouncement: true,
  announcement: "Livraison offerte dès 50 000 F CFA",
  announcements: [
    "Livraison offerte dès 50 000 F CFA",
    "Paiement à la livraison partout en ville",
    "Nouvelle collection disponible cette semaine",
  ],
  announcementScroll: true,
  announcementSpeed: 22,
  showHero: true,
  heroTitle: "Une sélection qui brille",
  heroSubtitle: "Des pièces choisies avec soin, livrées chez vous et payées à la réception.",
  showBenefits: true,
  showCategories: true,
  showProducts: true,
  showFooter: true,
  footerText: "Paiement à la livraison · Service client 7j/7",
  showLegalPages: true,
  legalPages: defaultLegalPages,

  sectionOrder: ["announcement", "hero", "benefits", "categories", "products", "footer"],
};

const sahel: StoreTheme = {
  templateId: "sahel",
  primary: "#c1440e",
  primaryText: "#fff8f0",
  background: "#fdf6ec",
  surface: "#ffffff",
  text: "#2b1a12",
  muted: "#7c6553",
  accent: "#1f7a5a",
  textBlocks: [
    { id: "sahel-title", type: "display", text: "Le marché, en un clic" },
    { id: "sahel-copy", type: "body", text: "Commandez sans carte bancaire, payez à la livraison et discutez avec nous sur WhatsApp." },
  ],
  fontPair: "afro",
  headingScale: 1.05,
  uppercaseHeadings: false,
  buttonRadius: 999,
  buttonHeight: 52,
  buttonBold: true,
  buttonUppercase: false,
  buttonStyle: "solid",
  buttonLabel: "Je commande",
  columns: 2,
  containerWidth: "normal",
  cardStyle: "shadow",
  imageRatio: "square",
  cornerRadius: 20,
  showAnnouncement: true,
  announcement: "Paiement à la livraison partout en ville 🚚",
  showHero: true,
  heroTitle: "Le marché, en un clic",
  heroSubtitle:
    "Commandez sans carte bancaire, payez à la livraison et discutez avec nous sur WhatsApp.",
  showBenefits: true,
  showCategories: true,
  showProducts: true,
  showFooter: true,
  footerText: "Commandez sur WhatsApp · Livraison 24-48 h · Paiement à la réception",
  sectionOrder: ["announcement", "hero", "categories", "products", "benefits", "footer"],
};

export const storeTemplates: StoreTemplate[] = [
  {
    id: "eclat",
    name: "Éclat",
    tagline: "Élégant et minimal",
    description:
      "Grandes images, typographie éditoriale et beaucoup d'espace blanc. Idéal pour la mode, la beauté et les marques haut de gamme.",
    theme: eclat,
  },
  {
    id: "sahel",
    name: "Sahel Market",
    tagline: "Pensé pour l'Afrique",
    description:
      "Couleurs chaudes, gros boutons tactiles, paiement à la livraison et WhatsApp mis en avant. Optimisé pour le mobile et les connexions lentes.",
    theme: sahel,
  },
];

export const defaultStoreTheme: StoreTheme = sahel;

export function templateOf(id: StoreTemplateId): StoreTemplate {
  return storeTemplates.find((t) => t.id === id) ?? storeTemplates[1]!;
}

/* ---------- Store réactif ---------- */

const KEY = "sooko-store-themes";
let themes: Record<string, StoreTheme> = {};
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      themes = JSON.parse(raw) as Record<string, StoreTheme>;
      emit();
    }
  } catch {
    /* stockage indisponible */
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(themes));
  } catch {
    /* stockage indisponible */
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  hydrate();
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return themes;
}

export function useStoreTheme(storeId: string): StoreTheme {
  const map = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const saved: Partial<StoreTheme> = map[storeId] ?? {};
  return {
    ...defaultStoreTheme,
    ...saved,
    sectionOrder: saved.sectionOrder ?? defaultStoreTheme.sectionOrder,
    textBlocks: saved.textBlocks ?? [
      { id: "legacy-title", type: "display", text: saved.heroTitle ?? defaultStoreTheme.heroTitle },
      { id: "legacy-copy", type: "body", text: saved.heroSubtitle ?? defaultStoreTheme.heroSubtitle },
    ],
  };
}

export const themeStore = {
  update(storeId: string, patch: Partial<StoreTheme>) {
    themes = {
      ...themes,
      [storeId]: { ...defaultStoreTheme, ...(themes[storeId] ?? {}), ...patch },
    };
    persist();
    emit();
  },
  applyTemplate(storeId: string, templateId: StoreTemplateId) {
    themes = { ...themes, [storeId]: { ...templateOf(templateId).theme } };
    persist();
    emit();
  },
  reset(storeId: string) {
    const current = themes[storeId]?.templateId ?? defaultStoreTheme.templateId;
    this.applyTemplate(storeId, current);
  },
};

/* ---------- Aide au rendu de la vitrine ---------- */

export function themeVars(theme: StoreTheme): React.CSSProperties {
  const pair = fontPairs[theme.fontPair];
  return {
    ["--sv-primary" as string]: theme.primary,
    ["--sv-primary-text" as string]: theme.primaryText,
    ["--sv-bg" as string]: theme.background,
    ["--sv-surface" as string]: theme.surface,
    ["--sv-text" as string]: theme.text,
    ["--sv-muted" as string]: theme.muted,
    ["--sv-accent" as string]: theme.accent,
    ["--sv-heading" as string]: pair.heading,
    ["--sv-body" as string]: pair.body,
    ["--sv-radius" as string]: `${theme.cornerRadius}px`,
    backgroundColor: theme.background,
    color: theme.text,
    fontFamily: pair.body,
  };
}

export function buttonStyleOf(theme: StoreTheme): React.CSSProperties {
  const base: React.CSSProperties = {
    borderRadius: `${theme.buttonRadius}px`,
    height: `${theme.buttonHeight}px`,
    fontWeight: theme.buttonBold ? 700 : 500,
    textTransform: theme.buttonUppercase ? "uppercase" : "none",
    letterSpacing: theme.buttonUppercase ? "0.05em" : undefined,
    padding: "0 1.25rem",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--sv-body)",
    fontSize: "0.9rem",
    cursor: "pointer",
  };
  if (theme.buttonStyle === "outline") {
    return { ...base, border: `1.5px solid ${theme.primary}`, color: theme.primary, background: "transparent" };
  }
  if (theme.buttonStyle === "soft") {
    return { ...base, background: `${theme.primary}1f`, color: theme.primary };
  }
  return { ...base, background: theme.primary, color: theme.primaryText };
}

export const containerClass: Record<StoreTheme["containerWidth"], string> = {
  narrow: "max-w-3xl",
  normal: "max-w-5xl",
  wide: "max-w-7xl",
};

export const columnsClass: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 md:grid-cols-3",
  4: "grid-cols-2 md:grid-cols-4",
};

export const ratioClass: Record<StoreTheme["imageRatio"], string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
};
