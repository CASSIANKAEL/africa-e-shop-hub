import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ShieldCheck, Truck, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { stripHtml } from "@/components/commerce/rich-text-editor";
import { formatMoney } from "@/lib/format";
import { useProducts, useStores } from "@/services/commerce.store";
import { useForms } from "@/services/forms.store";
import { WhatsappFloat } from "@/components/commerce/whatsapp-float";

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
  const forms = useForms(storeId).filter((f) => f.status === "active");

  if (!store) {
    return (
      <main className="mx-auto max-w-3xl p-10 text-center">
        <h1 className="font-display text-2xl font-semibold">Boutique introuvable</h1>
        <p className="mt-2 text-muted-foreground">Ce lien ne correspond à aucune boutique.</p>
      </main>
    );
  }

  return (
    <>
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Boutique en ligne
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{store.name}</h1>
            <p className="text-sm text-muted-foreground">
              {store.city}, {store.country}
            </p>
          </div>
          <Badge variant={store.status === "active" ? "default" : "secondary"}>
            {store.status === "active" ? "Ouverte" : "En pause"}
          </Badge>
        </div>
      </header>

      <section className="mx-auto grid max-w-5xl gap-3 px-5 py-6 sm:grid-cols-3">
        {[
          { icon: Wallet, title: "Paiement à la livraison", text: "Vous payez à la réception." },
          { icon: Truck, title: "Livraison rapide", text: "Partout en ville sous 48 h." },
          { icon: ShieldCheck, title: "Produits vérifiés", text: "Échange en cas de problème." },
        ].map((b) => (
          <Card key={b.title}>
            <CardContent className="flex items-start gap-3 p-4">
              <b.icon className="mt-0.5 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Produits disponibles</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} produit{products.length > 1 ? "s" : ""} ·{" "}
            {forms.length} formulaire{forms.length > 1 ? "s" : ""} de commande actif
            {forms.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-44 w-full object-cover" />
              ) : (
                <div className="h-44 w-full bg-muted" />
              )}
              <CardContent className="space-y-2 p-4">
                <p className="text-xs text-muted-foreground">{p.category}</p>
                <p className="font-medium">{p.name}</p>
                {p.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {stripHtml(p.description)}
                  </p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-display text-lg font-semibold">
                    {formatMoney(p.price, store.currency)}
                  </span>
                  <Button size="sm" asChild>
                    <Link
                      to="/vitrine/$storeId/$productId"
                      params={{ storeId, productId: p.id }}
                    >
                      Commander
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {products.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucun produit publié dans cette boutique.
            </p>
          )}
        </div>
      </section>
    </main>
      <WhatsappFloat storeId={storeId} />
    </>
  );
}
