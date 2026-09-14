import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ShieldCheck, Truck, Wallet } from "lucide-react";

import { stripHtml } from "@/components/commerce/rich-text-editor";
import { formatMoney } from "@/lib/format";
import { useProducts, useStores } from "@/services/commerce.store";
import { WhatsappFloat } from "@/components/commerce/whatsapp-float";
import {
  buttonStyleOf,
  columnsClass,
  containerClass,
  fontPairs,
  ratioClass,
  themeVars,
  useStoreTheme,
} from "@/services/theme.store";

export const Route = createFileRoute("/vitrine/$storeId/")({
  head: () => ({
    meta: [
      { title: "Boutique en ligne — Sooko" },
      {
        name: "description",
        content:
          "Aperçu public de la boutique : produits disponibles, prix en FCFA et commande en paiement à la livraison.",
      },
      { property: "og:title", content: "Boutique en ligne — Sooko" },
      {
        property: "og:description",
        content: "Découvrez les produits de la boutique et commandez en paiement à la livraison.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StorefrontPage,
});

function StorefrontPage() {
  const { storeId } = useParams({ from: "/vitrine/$storeId/" });
  const store = useStores().find((s) => s.id === storeId);
  const products = useProducts().filter((p) => p.storeId === storeId);
  const theme = useStoreTheme(storeId);
  const pair = fontPairs[theme.fontPair];
  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  if (!store) {
    return (
      <main className="mx-auto max-w-3xl p-10 text-center">
        <h1 className="font-display text-2xl font-semibold">Boutique introuvable</h1>
        <p className="mt-2 text-muted-foreground">Ce lien ne correspond à aucune boutique.</p>
      </main>
    );
  }

  const container = containerClass[theme.containerWidth];
  const cardStyle = {
    background: theme.surface,
    borderRadius: `${theme.cornerRadius}px`,
    border: theme.cardStyle === "border" ? `1px solid ${theme.muted}33` : undefined,
    boxShadow: theme.cardStyle === "shadow" ? "0 10px 30px rgba(0,0,0,0.08)" : undefined,
  };

  return (
    <>
      <main className="min-h-screen" style={themeVars(theme)}>
        {theme.showAnnouncement && theme.announcement && (
          <div
            className="px-4 py-2 text-center text-xs"
            style={{ background: theme.primary, color: theme.primaryText }}
          >
            {theme.announcement}
          </div>
        )}

        <header style={{ borderBottom: `1px solid ${theme.muted}22` }}>
          <div
            className={`mx-auto flex ${container} flex-wrap items-center justify-between gap-3 px-5 py-6`}
          >
            <div>
              <p className="text-xs uppercase tracking-wide" style={{ color: theme.muted }}>
                Boutique en ligne
              </p>
              <h1
                style={{
                  fontFamily: pair.heading,
                  fontSize: `${1.7 * theme.headingScale}rem`,
                  textTransform: theme.uppercaseHeadings ? "uppercase" : "none",
                  fontWeight: 700,
                }}
              >
                {store.name}
              </h1>
              <p className="text-sm" style={{ color: theme.muted }}>
                {store.city}, {store.country}
              </p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs"
              style={{ background: `${theme.accent}55` }}
            >
              {store.status === "active" ? "Ouverte" : "En pause"}
            </span>
          </div>
        </header>

        {theme.showHero && (
          <section className={`mx-auto ${container} px-5 pt-10`}>
            <div className="p-8 text-center" style={{ ...cardStyle, background: `${theme.accent}33` }}>
              <h2
                style={{
                  fontFamily: pair.heading,
                  fontSize: `${2 * theme.headingScale}rem`,
                  textTransform: theme.uppercaseHeadings ? "uppercase" : "none",
                  fontWeight: 700,
                }}
              >
                {theme.heroTitle}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm" style={{ color: theme.muted }}>
                {theme.heroSubtitle}
              </p>
            </div>
          </section>
        )}

        {theme.showBenefits && (
          <section className={`mx-auto grid ${container} gap-3 px-5 py-6 sm:grid-cols-3`}>
            {[
              { icon: Wallet, title: "Paiement à la livraison", text: "Vous payez à la réception." },
              { icon: Truck, title: "Livraison rapide", text: "Partout en ville sous 48 h." },
              { icon: ShieldCheck, title: "Produits vérifiés", text: "Échange en cas de problème." },
            ].map((b) => (
              <div key={b.title} className="flex items-start gap-3 p-4" style={cardStyle}>
                <b.icon className="mt-0.5 h-5 w-5" style={{ color: theme.primary }} />
                <div>
                  <p className="text-sm font-medium">{b.title}</p>
                  <p className="text-xs" style={{ color: theme.muted }}>
                    {b.text}
                  </p>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className={`mx-auto ${container} px-5 pb-16`}>
          {theme.showCategories && categories.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full px-3 py-1 text-xs"
                  style={{ background: `${theme.primary}14`, color: theme.primary }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
          <div className="mb-4 flex items-center justify-between">
            <h2
              style={{
                fontFamily: pair.heading,
                fontSize: `${1.2 * theme.headingScale}rem`,
                textTransform: theme.uppercaseHeadings ? "uppercase" : "none",
                fontWeight: 700,
              }}
            >
              Produits disponibles
            </h2>
            <p className="text-sm" style={{ color: theme.muted }}>
              {products.length} produit{products.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className={`grid gap-4 ${columnsClass[theme.columns]}`}>
            {products.map((p) => (
              <div key={p.id} className="overflow-hidden" style={cardStyle}>
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className={`w-full object-cover ${ratioClass[theme.imageRatio]}`}
                  />
                ) : (
                  <div
                    className={`w-full ${ratioClass[theme.imageRatio]}`}
                    style={{ background: `${theme.accent}44` }}
                  />
                )}
                <div className="space-y-2 p-4">
                  <p className="text-xs" style={{ color: theme.muted }}>
                    {p.category}
                  </p>
                  <p className="font-medium">{p.name}</p>
                  {p.description && (
                    <p className="line-clamp-2 text-xs" style={{ color: theme.muted }}>
                      {stripHtml(p.description)}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span
                      style={{ fontFamily: pair.heading, fontWeight: 700, fontSize: "1.05rem" }}
                    >
                      {formatMoney(p.price, store.currency)}
                    </span>
                    <Link
                      to="/vitrine/$storeId/$productId"
                      params={{ storeId, productId: p.id }}
                      style={{ ...buttonStyleOf(theme), height: Math.min(theme.buttonHeight, 44) }}
                    >
                      {theme.buttonLabel}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-sm" style={{ color: theme.muted }}>
                Aucun produit publié dans cette boutique.
              </p>
            )}
          </div>
        </section>

        {theme.showFooter && (
          <footer
            className="px-5 py-8 text-center text-xs"
            style={{ borderTop: `1px solid ${theme.muted}22`, color: theme.muted }}
          >
            {theme.footerText}
          </footer>
        )}
      </main>
      <WhatsappFloat storeId={storeId} />
    </>
  );
}
