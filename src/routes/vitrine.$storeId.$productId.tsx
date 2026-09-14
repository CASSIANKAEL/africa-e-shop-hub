import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatMoney } from "@/lib/format";
import { useProducts, useStores } from "@/services/commerce.store";
import { useForms } from "@/services/forms.store";
import { WhatsappFloat } from "@/components/commerce/whatsapp-float";

export const Route = createFileRoute("/vitrine/$storeId/$productId")({
  head: () => ({
    meta: [
      { title: "Produit en ligne — Sooko" },
      {
        name: "description",
        content:
          "Page produit publique : photos, description, offres par quantité et commande en paiement à la livraison.",
      },
      { property: "og:title", content: "Produit en ligne — Sooko" },
      {
        property: "og:description",
        content: "Commandez ce produit en paiement à la livraison, en moins d'une minute.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicProductPage,
});

function PublicProductPage() {
  const { storeId, productId } = useParams({ from: "/vitrine/$storeId/$productId" });
  const store = useStores().find((s) => s.id === storeId);
  const product = useProducts().find((p) => p.id === productId);
  const storeForms = useForms(storeId);
  const form = storeForms.find((f) => f.status === "active") ?? storeForms[0];

  if (!store || !product) {
    return (
      <main className="mx-auto max-w-3xl p-10 text-center">
        <h1 className="font-display text-2xl font-semibold">Produit introuvable</h1>
        <Button className="mt-4" asChild>
          <Link to="/vitrine/$storeId" params={{ storeId }}>
            Retour à la boutique
          </Link>
        </Button>
      </main>
    );
  }

  const design = form?.design;
  const offers = form?.offers ?? [];
  const upsells = (form?.upsells ?? []).filter((u) => u.enabled);
  const fields = (form?.fields ?? []).filter((f) => f.enabled);

  return (
    <>
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/vitrine/$storeId" params={{ storeId }}>
              <ArrowLeft className="mr-1 h-4 w-4" /> {store.name}
            </Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 lg:grid-cols-2">
        <div className="space-y-3">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full rounded-2xl object-cover"
            />
          ) : (
            <div className="h-72 w-full rounded-2xl bg-muted" />
          )}
          <div className="grid grid-cols-3 gap-3">
            {(product.images ?? []).slice(0, 3).map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${product.name} ${i + 1}`}
                className="h-24 w-full rounded-xl object-cover"
              />
            ))}
          </div>
          {product.description && (
            <Card>
              <CardContent
                className="prose prose-sm max-w-none p-4 text-sm"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Badge variant="secondary">{product.category}</Badge>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <p className="mt-1 font-display text-3xl font-semibold">
              {formatMoney(product.price, store.currency)}
            </p>
            {design?.subheadline && (
              <p className="mt-1 text-sm text-muted-foreground">{design.subheadline}</p>
            )}
          </div>

          {offers.length > 0 && (
            <Card>
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium">Offres par quantité</p>
                {offers.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-xl border p-3 text-sm"
                  >
                    <span>{o.label}</span>
                    <span className="font-semibold">
                      {formatMoney(
                        product.price * o.quantity * (1 - o.discountPercent / 100),
                        store.currency,
                      )}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {upsells.length > 0 && (
            <Card>
              <CardContent className="space-y-2 p-4">
                <p className="text-sm font-medium">Ajouter à votre commande</p>
                {upsells.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-xl border p-3 text-sm"
                  >
                    <span>{u.title}</span>
                    <span className="font-semibold">{formatMoney(u.price, store.currency)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="space-y-3 p-4">
              <p className="text-sm font-medium">
                {design?.headline ?? "Commandez en 30 secondes"}
              </p>
              {fields.map((f) => (
                <div key={f.id} className="space-y-1.5">
                  <Label htmlFor={`pub-${f.id}`} className="text-xs">
                    {f.label}
                    {f.required ? " *" : ""}
                  </Label>
                  <Input id={`pub-${f.id}`} placeholder={f.placeholder ?? ""} />
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Aucun formulaire actif : créez-en un depuis l'espace Formulaires.
                </p>
              )}
              <Button className="w-full" size="lg">
                <Check className="mr-2 h-4 w-4" />
                {design?.buttonText ?? "Commander maintenant"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Paiement à la livraison · Frais de livraison{" "}
                {formatMoney(form?.settings.shippingFee ?? 0, store.currency)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
      <WhatsappFloat storeId={storeId} />
    </>
  );
}
