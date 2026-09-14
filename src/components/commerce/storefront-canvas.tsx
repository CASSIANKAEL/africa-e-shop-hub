import { Link } from "@tanstack/react-router";
import { ShieldCheck, Truck, Wallet } from "lucide-react";

import { stripHtml } from "@/components/commerce/rich-text-editor";
import { formatMoney } from "@/lib/format";
import type { Product, Store } from "@/types";
import {
  buttonStyleOf,
  columnsClass,
  containerClass,
  fontPairs,
  ratioClass,
  themeVars,
  type StoreSectionId,
  type StoreTextBlock,
  type StoreTheme,
} from "@/services/theme.store";

function TextBlock({ block, theme }: { block: StoreTextBlock; theme: StoreTheme }) {
  const pair = fontPairs[theme.fontPair];
  const shared = {
    fontFamily: block.type === "body" || block.type === "caption" ? pair.body : pair.heading,
    color: block.type === "body" || block.type === "caption" ? theme.muted : theme.text,
    textTransform: block.type === "display" && theme.uppercaseHeadings ? "uppercase" as const : "none" as const,
  };

  if (block.type === "display") return <h2 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ ...shared, fontSize: `${2 * theme.headingScale}rem` }}>{block.text}</h2>;
  if (block.type === "heading") return <h3 className="text-xl font-semibold leading-snug" style={{ ...shared, fontSize: `${1.3 * theme.headingScale}rem` }}>{block.text}</h3>;
  if (block.type === "caption") return <p className="text-xs leading-relaxed" style={shared}>{block.text}</p>;
  return <p className="text-sm leading-relaxed sm:text-base" style={shared}>{block.text}</p>;
}

export function AnnouncementBar({ theme }: { theme: StoreTheme }) {
  const messages = (theme.announcements ?? []).map((text) => text.trim()).filter(Boolean);
  if (messages.length === 0) return null;

  if (!theme.announcementScroll) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2 text-center text-xs" style={{ background: theme.primary, color: theme.primaryText }}>
        {messages.map((message, index) => <span key={`${message}-${index}`}>{message}</span>)}
      </div>
    );
  }

  const loop = [...messages, ...messages];
  return (
    <div className="store-marquee py-2 text-xs" style={{ background: theme.primary, color: theme.primaryText }} aria-label="Annonces de la boutique">
      <div className="store-marquee-track" style={{ animationDuration: `${Math.max(6, theme.announcementSpeed ?? 20)}s` }}>
        {loop.map((message, index) => (
          <span key={`${message}-${index}`} className="flex items-center whitespace-nowrap px-6" aria-hidden={index >= messages.length}>
            {message}
            <span className="pl-6 opacity-60">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function LegalPages({ theme, title = "Informations légales" }: { theme: StoreTheme; title?: string }) {
  const pages = (theme.legalPages ?? []).filter((page) => page.enabled && page.title.trim());
  if (!theme.showLegalPages || pages.length === 0) return null;
  return (
    <div className="mx-auto w-full max-w-3xl space-y-2 text-left">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.text }}>{title}</p>
      {pages.map((page) => (
        <details key={page.id} className="rounded-md px-3 py-2 text-xs" style={{ background: theme.surface, border: `1px solid ${theme.muted}22` }}>
          <summary className="cursor-pointer font-medium" style={{ color: theme.text }}>{page.title}</summary>
          <p className="mt-2 whitespace-pre-line leading-relaxed" style={{ color: theme.muted }}>{page.content}</p>
        </details>
      ))}
    </div>
  );
}

export function StorefrontCanvas({
  store,
  products,
  theme,
  preview = false,
}: {
  store: Store;
  products: Product[];
  theme: StoreTheme;
  preview?: boolean;
}) {
  const pair = fontPairs[theme.fontPair];
  const container = containerClass[theme.containerWidth];
  const categories = Array.from(new Set(products.map((product) => product.category))).filter(Boolean);
  const cardStyle = {
    background: theme.surface,
    borderRadius: `${theme.cornerRadius}px`,
    border: theme.cardStyle === "border" ? `1px solid ${theme.muted}33` : undefined,
    boxShadow: theme.cardStyle === "shadow" ? "0 10px 30px rgba(0,0,0,0.08)" : undefined,
  };

  const sections: Record<StoreSectionId, React.ReactNode> = {
    announcement: theme.showAnnouncement ? <AnnouncementBar theme={theme} /> : null,
    hero: theme.showHero ? (
      <section className={`mx-auto ${container} px-5 pt-8`}>
        <div className="p-6 text-center sm:p-8" style={{ ...cardStyle, background: `${theme.accent}33` }}>
          {theme.logo && <img src={theme.logo} alt={`Logo ${store.name}`} className="mx-auto mb-5 max-h-20 max-w-[180px] object-contain" />}
          <div className="mx-auto max-w-xl space-y-3">
            {theme.textBlocks.map((block) => <TextBlock key={block.id} block={block} theme={theme} />)}
          </div>
        </div>
      </section>
    ) : null,
    benefits: theme.showBenefits ? (
      <section className={`mx-auto grid ${container} gap-3 px-5 py-6 sm:grid-cols-3`}>
        {[
          { icon: Wallet, title: "Paiement à la livraison", text: "Vous payez à la réception." },
          { icon: Truck, title: "Livraison rapide", text: "Partout en ville sous 48 h." },
          { icon: ShieldCheck, title: "Produits vérifiés", text: "Échange en cas de problème." },
        ].map((benefit) => (
          <div key={benefit.title} className="flex items-start gap-3 p-4" style={cardStyle}>
            <benefit.icon className="mt-0.5 h-5 w-5" style={{ color: theme.primary }} />
            <div><p className="text-sm font-medium">{benefit.title}</p><p className="text-xs" style={{ color: theme.muted }}>{benefit.text}</p></div>
          </div>
        ))}
      </section>
    ) : null,
    categories: theme.showCategories && categories.length > 0 ? (
      <section className={`mx-auto ${container} px-5 pt-6`}>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => <span key={category} className="rounded-full px-3 py-1 text-xs" style={{ background: `${theme.primary}14`, color: theme.primary }}>{category}</span>)}
        </div>
      </section>
    ) : null,
    products: theme.showProducts ? (
      <section className={`mx-auto ${container} px-5 py-8`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 style={{ fontFamily: pair.heading, fontSize: `${1.2 * theme.headingScale}rem`, textTransform: theme.uppercaseHeadings ? "uppercase" : "none", fontWeight: 700 }}>Produits disponibles</h2>
          <p className="text-sm" style={{ color: theme.muted }}>{products.length} produit{products.length > 1 ? "s" : ""}</p>
        </div>
        <div className={`grid gap-4 ${columnsClass[theme.columns]}`}>
          {products.map((product) => (
            <article key={product.id} className="overflow-hidden" style={cardStyle}>
              {product.image ? <img src={product.image} alt={product.name} className={`w-full object-cover ${ratioClass[theme.imageRatio]}`} /> : <div className={`w-full ${ratioClass[theme.imageRatio]}`} style={{ background: `${theme.accent}44` }} />}
              <div className="space-y-2 p-4">
                <p className="text-xs" style={{ color: theme.muted }}>{product.category}</p>
                <p className="font-medium">{product.name}</p>
                {product.description && <p className="line-clamp-2 text-xs" style={{ color: theme.muted }}>{stripHtml(product.description)}</p>}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <strong style={{ fontFamily: pair.heading }}>{formatMoney(product.price, store.currency)}</strong>
                  {preview ? <span style={{ ...buttonStyleOf(theme), height: Math.min(theme.buttonHeight, 44) }}>{theme.buttonLabel}</span> : <Link to="/vitrine/$storeId/$productId" params={{ storeId: store.id, productId: product.id }} style={{ ...buttonStyleOf(theme), height: Math.min(theme.buttonHeight, 44) }}>{theme.buttonLabel}</Link>}
                </div>
              </div>
            </article>
          ))}
          {products.length === 0 && <p className="text-sm" style={{ color: theme.muted }}>Aucun produit publié dans cette boutique.</p>}
        </div>
      </section>
    ) : null,
    footer: theme.showFooter ? (
      <footer className="space-y-5 px-5 py-8 text-center text-xs" style={{ borderTop: `1px solid ${theme.muted}22`, color: theme.muted }}>
        <LegalPages theme={theme} />
        <p>{theme.footerText}</p>
      </footer>
    ) : null,
  };

  return (
    <div className="min-h-full" style={themeVars(theme)}>
      <header style={{ borderBottom: `1px solid ${theme.muted}22` }}>
        <div className={`mx-auto grid ${container} grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-5`}>
          <div className="flex min-w-0 items-center gap-3">
            {theme.logo && <img src={theme.logo} alt="" className="h-12 w-12 shrink-0 object-contain" />}
            <div className="min-w-0"><p className="text-xs uppercase" style={{ color: theme.muted }}>Boutique en ligne</p><h1 className="truncate" style={{ fontFamily: pair.heading, fontSize: `${1.7 * theme.headingScale}rem`, textTransform: theme.uppercaseHeadings ? "uppercase" : "none", fontWeight: 700 }}>{store.name}</h1><p className="truncate text-sm" style={{ color: theme.muted }}>{store.city}, {store.country}</p></div>
          </div>
          <span className="rounded-full px-3 py-1 text-xs" style={{ background: `${theme.accent}55` }}>{store.status === "active" ? "Ouverte" : "En pause"}</span>
        </div>
      </header>
      {theme.sectionOrder.map((section) => <div key={section}>{sections[section]}</div>)}
    </div>
  );
}