import adWax from "@/assets/spy/ad-wax.jpg";
import adKarite from "@/assets/spy/ad-karite.jpg";
import adEarbuds from "@/assets/spy/ad-earbuds.jpg";
import adBag from "@/assets/spy/ad-bag.jpg";

export type SpyPlatform = "meta" | "facebook" | "tiktok";
export type SpyFormat = "image" | "video";

export interface SpyAd {
  id: string;
  advertiser: string;
  platform: SpyPlatform;
  format: SpyFormat;
  country: string;
  countryCode: string;
  category: string;
  /** Nombre de jours depuis le lancement de la publicité. */
  runningDays: number;
  headline: string;
  description: string;
  likes: number;
  comments: number;
  image: string;
  cta: string;
}

export const spyPlatforms: { key: SpyPlatform | "all"; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "meta", label: "Méta" },
  { key: "facebook", label: "Facebook" },
  { key: "tiktok", label: "TikTok" },
];

export const spyAds: SpyAd[] = [
  {
    id: "spy-1",
    advertiser: "Wax Palace Abidjan",
    platform: "meta",
    format: "image",
    country: "Côte d'Ivoire",
    countryCode: "CI",
    category: "Mode",
    runningDays: 21,
    headline: "La robe wax qui fait tourner les têtes",
    description:
      "Col V flatteur, ceinture ajustable et poches fonctionnelles. Livraison partout à Abidjan, paiement à la livraison.",
    likes: 4820,
    comments: 312,
    image: adWax,
    cta: "Commander",
  },
  {
    id: "spy-2",
    advertiser: "Karité Beauté Dakar",
    platform: "facebook",
    format: "image",
    country: "Sénégal",
    countryCode: "SN",
    category: "Beauté",
    runningDays: 34,
    headline: "Beurre de karité 100 % naturel — visage, corps, cheveux",
    description:
      "Hydratation intense pour peaux sèches. Pot de 226 g, livraison gratuite dès 2 pots achetés.",
    likes: 3150,
    comments: 188,
    image: adKarite,
    cta: "J'en profite",
  },
  {
    id: "spy-3",
    advertiser: "Tech Pratique Cotonou",
    platform: "tiktok",
    format: "video",
    country: "Bénin",
    countryCode: "BJ",
    category: "Électronique",
    runningDays: 12,
    headline: "Écouteurs sans fil VIBE — basses puissantes",
    description:
      "Autonomie 24 h, réduction de bruit, étui de charge rapide. Promo lancement -30 % cette semaine.",
    likes: 12400,
    comments: 960,
    image: adEarbuds,
    cta: "Acheter",
  },
  {
    id: "spy-4",
    advertiser: "Coin Afrique",
    platform: "meta",
    format: "video",
    country: "Sénégal",
    countryCode: "SN",
    category: "Accessoires",
    runningDays: 47,
    headline: "Sac en cuir tissé main — fait par des artisans",
    description:
      "Cuir véritable, tissage artisanal, doublure en coton. Chaque sac est unique. Expédition sous 48 h.",
    likes: 6780,
    comments: 421,
    image: adBag,
    cta: "Découvrir",
  },
  {
    id: "spy-5",
    advertiser: "AfroStyle Bamako",
    platform: "facebook",
    format: "video",
    country: "Mali",
    countryCode: "ML",
    category: "Mode",
    runningDays: 9,
    headline: "Collection bogolan 2026 — pièces limitées",
    description:
      "Chemises et ensembles en bogolan authentique. Tailles S à XXL. Paiement Orange Money accepté.",
    likes: 2210,
    comments: 143,
    image: adWax,
    cta: "Voir la collection",
  },
  {
    id: "spy-6",
    advertiser: "Glow Nature Abidjan",
    platform: "meta",
    format: "image",
    country: "Côte d'Ivoire",
    countryCode: "CI",
    category: "Beauté",
    runningDays: 28,
    headline: "Routine karité complète : savon noir + beurre pur",
    description:
      "Le duo best-seller pour une peau éclatante. Plus de 4 000 clientes conquises à Abidjan.",
    likes: 5430,
    comments: 276,
    image: adKarite,
    cta: "Commander",
  },
  {
    id: "spy-7",
    advertiser: "Urban Sound Lagos",
    platform: "tiktok",
    format: "video",
    country: "Nigeria",
    countryCode: "NG",
    category: "Électronique",
    runningDays: 18,
    headline: "Le son qui bouge avec vous",
    description:
      "Écouteurs Bluetooth étanches, parfaits pour le sport. Livraison en 24 h sur Lagos.",
    likes: 9870,
    comments: 702,
    image: adEarbuds,
    cta: "Acheter",
  },
  {
    id: "spy-8",
    advertiser: "Héritage Cuir Dakar",
    platform: "facebook",
    format: "image",
    country: "Sénégal",
    countryCode: "SN",
    category: "Accessoires",
    runningDays: 55,
    headline: "Maroquinerie artisanale — cuir pleine fleur",
    description:
      "Sacs, ceintures et portefeuilles cousus main. Garantie 2 ans. Paiement à la livraison.",
    likes: 3890,
    comments: 205,
    image: adBag,
    cta: "Commander",
  },
  {
    id: "spy-9",
    advertiser: "Wax Palace Abidjan",
    platform: "meta",
    format: "video",
    country: "Côte d'Ivoire",
    countryCode: "CI",
    category: "Mode",
    runningDays: 6,
    headline: "Nouvelle collection pagnes premium",
    description:
      "Ensembles 3 pièces en wax premium, motifs exclusifs. Stock limité — commandez vite.",
    likes: 1540,
    comments: 98,
    image: adWax,
    cta: "Commander",
  },
];

export const spyCountries = Array.from(
  new Map(spyAds.map((a) => [a.countryCode, a.country])).entries(),
).map(([code, name]) => ({ code, name }));

export const SPY_FAVORITES_KEY = "sooko-spy-favorites";
