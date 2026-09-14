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
  type StoreTheme,
} from "@/services/theme.store";

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
    announcement: theme.showAnnouncement && theme.announcement ? (
      <div className="px-4 py-2 text-center text-xs" style={{ background: theme.primary, color: theme.primaryText }}>
        {theme.announcement}
      </div>
    ) : null,
    hero: theme.showHero ? (
      <section className={`mx-auto ${container} px-5 pt-8`}>
        <div className="p-8 text-center" style={{ ...cardStyle, background: `${theme.accent}33` }}>
          <h2 style={{ fontFamily: pair.heading, fontSize: `${2 * theme.headingScale}rem`, textTransform: theme.uppercaseHeadings ? "uppercase" : "none", fontWeight: 700 }}>
            {theme.heroTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm" style={{ color: theme.muted }}>{theme.heroSubtitle}</p>
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
    footer: theme.showFooter ? <footer className="px-5 py-8 text-center text-xs" style={{ borderTop: `1px solid ${theme.muted}22`, color: theme.muted }}>{theme.footerText}</footer> : null,
  };

  return (
    <div className="min-h-full" style={themeVars(theme)}>
      <header style={{ borderBottom: `1px solid ${theme.muted}22` }}>
        <div className={`mx-auto flex ${container} items-center justify-between gap-3 px-5 py-5`}>
          <div><p className="text-xs uppercase" style={{ color: theme.muted }}>Boutique en ligne</p><h1 style={{ fontFamily: pair.heading, fontSize: `${1.7 * theme.headingScale}rem`, textTransform: theme.uppercaseHeadings ? "uppercase" : "none", fontWeight: 700 }}>{store.name}</h1><p className="text-sm" style={{ color: theme.muted }}>{store.city}, {store.country}</p></div>
          <span className="rounded-full px-3 py-1 text-xs" style={{ background: `${theme.accent}55` }}>{store.status === "active" ? "Ouverte" : "En pause"}</span>
        </div>
      </header>
      {theme.sectionOrder.map((section) => <div key={section}>{sections[section]}</div>)}
    </div>
  );
}