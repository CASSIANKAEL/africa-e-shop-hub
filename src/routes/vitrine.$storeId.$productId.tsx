import { useMemo, useState } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/format";
import { commerceStore, useProducts, useStores } from "@/services/commerce.store";
import { useForms, useProductOffers } from "@/services/forms.store";
import { offerPrice, offerSavings } from "@/components/forms/offer-campaign-editor";
import { WhatsappFloat } from "@/components/commerce/whatsapp-float";
import { AnnouncementBar, LegalPages } from "@/components/commerce/storefront-canvas";
import { useStoreTheme } from "@/services/theme.store";
import type { Order, OrderFormField, QuantityOffer } from "@/types";

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
  const theme = useStoreTheme(storeId);
  const campaign = useProductOffers(storeId, productId);

  const offers = useMemo(() => campaign?.offers ?? [], [campaign]);
  const fields = useMemo(
    () => (form?.fields ?? []).filter((f) => f.enabled),
    [form],
  );
  const upsells = (form?.upsells ?? []).filter((u) => u.enabled);

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);

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
  const preselected = offers.find((o) => o.preselected) ?? offers[0];
  const activeOffer: QuantityOffer | undefined =
    offers.find((o) => o.id === selectedOfferId) ?? preselected;
  const quantity = Math.max(1, activeOffer?.quantity ?? 1);
  const subtotal = activeOffer
    ? offerPrice(product.price, activeOffer)
    : product.price;
  const shipping = activeOffer?.freeShipping ? 0 : (form?.settings.shippingFee ?? 0);
  const total = subtotal + shipping;

  function fieldValue(kind: OrderFormField["type"]): string {
    const field = fields.find((f) => f.type === kind);
    return field ? (values[field.id] ?? "").trim() : "";
  }

  function submit() {
    if (!store || !product) return;
    const nextErrors: Record<string, boolean> = {};
    fields.forEach((f) => {
      if (f.required && !(values[f.id] ?? "").trim()) nextErrors[f.id] = true;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const fullName = fieldValue("text") || "Client boutique";
    const phone = fieldValue("phone");
    const city = fieldValue("city");
    const address = fieldValue("address");
    const note = fieldValue("note");

    const order = commerceStore.addOrder({
      customer: { id: `c-${Date.now()}`, fullName, phone, city },
      storeId,
      items: [
        {
          productId: product.id,
          name: product.name,
          quantity,
          unitPrice: Math.round(subtotal / quantity),
        },
      ],
      total,
      currency: store.currency,
      status: "pending",
      paymentMethod: "cod",
      ...(address || note
        ? { note: [address ? `Adresse : ${address}` : "", note].filter(Boolean).join(" — ") }
        : {}),
    });

    setPlaced(order);
    setValues({});
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (placed) {
    const thanks = form?.thankYou;
    return (
      <>
        <main className="min-h-screen bg-background">
          {theme.showAnnouncement && <AnnouncementBar theme={theme} />}
          <div className="mx-auto max-w-lg px-5 py-16">
            <Card>
              <CardContent className="space-y-4 p-8 text-center">
                <div className="text-4xl">{thanks?.emoji ?? "🎉"}</div>
                <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
                <h1 className="font-display text-2xl font-semibold">
                  {thanks?.title ?? "Commande confirmée"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {thanks?.message ??
                    "Merci ! Votre commande est enregistrée, nous vous appelons pour confirmer."}
                </p>
                {thanks?.showOrderNumber !== false && (
                  <p className="text-sm font-medium">Numéro de commande : {placed.reference}</p>
                )}
                {thanks?.showSummary !== false && (
                  <div className="space-y-1 rounded-xl border p-4 text-left text-sm">
                    <div className="flex justify-between">
                      <span>
                        {product.name} × {placed.items[0]?.quantity ?? 1}
                      </span>
                      <span>{formatMoney(subtotal, store.currency)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Livraison</span>
                      <span>{formatMoney(shipping, store.currency)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total à payer</span>
                      <span>{formatMoney(placed.total, store.currency)}</span>
                    </div>
                  </div>
                )}
                {thanks?.supportNote && (
                  <p className="text-xs text-muted-foreground">{thanks.supportNote}</p>
                )}
                {thanks?.ctaLabel && thanks.ctaUrl ? (
                  <Button className="w-full" asChild>
                    <a href={thanks.ctaUrl}>{thanks.ctaLabel}</a>
                  </Button>
                ) : (
                  <Button className="w-full" asChild>
                    <Link to="/vitrine/$storeId" params={{ storeId }}>
                      Continuer mes achats
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <WhatsappFloat storeId={storeId} />
      </>
    );
  }

  return (
    <>
    <main className="min-h-screen bg-background">
      {theme.showAnnouncement && <AnnouncementBar theme={theme} />}
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
                {offers.map((o) => {
                  const price = offerPrice(product.price, o);
                  const saving = offerSavings(product.price, o);
                  const selected = activeOffer?.id === o.id;
                  return (
                    <button
                      type="button"
                      key={o.id}
                      onClick={() => setSelectedOfferId(o.id)}
                      aria-pressed={selected}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left text-sm transition ${
                        selected ? "border-primary ring-2 ring-primary/30" : "hover:bg-muted/50"
                      }`}
                      style={selected && o.tagColor ? { borderColor: o.tagColor } : undefined}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {o.image && (
                          <img src={o.image} alt="" className="h-9 w-9 rounded object-cover" />
                        )}
                        <span className="min-w-0">
                          <span className="block truncate">{o.label}</span>
                          {o.tag && (
                            <span
                              className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                              style={{ backgroundColor: o.tagColor ?? "#e2703f" }}
                            >
                              {o.tag}
                            </span>
                          )}
                          {o.freeShipping && (
                            <span className="block text-xs text-muted-foreground">
                              Livraison offerte
                            </span>
                          )}
                        </span>
                      </span>
                      <span className="text-right">
                        {saving > 0 && (
                          <span className="block text-xs text-muted-foreground line-through">
                            {formatMoney(product.price * o.quantity, store.currency)}
                          </span>
                        )}
                        <span className="font-semibold">{formatMoney(price, store.currency)}</span>
                      </span>
                    </button>
                  );
                })}
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
                  {f.type === "note" || f.type === "address" ? (
                    <Textarea
                      id={`pub-${f.id}`}
                      rows={2}
                      placeholder={f.placeholder ?? ""}
                      value={values[f.id] ?? ""}
                      aria-invalid={errors[f.id] ? true : undefined}
                      className={errors[f.id] ? "border-destructive" : ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                    />
                  ) : (
                    <Input
                      id={`pub-${f.id}`}
                      type={f.type === "email" ? "email" : f.type === "phone" ? "tel" : "text"}
                      placeholder={f.placeholder ?? ""}
                      value={values[f.id] ?? ""}
                      aria-invalid={errors[f.id] ? true : undefined}
                      className={errors[f.id] ? "border-destructive" : ""}
                      onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                    />
                  )}
                  {errors[f.id] && (
                    <p className="text-xs text-destructive">Ce champ est obligatoire.</p>
                  )}
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Aucun formulaire actif : créez-en un depuis l'espace Formulaires.
                </p>
              )}
              <div className="space-y-1 rounded-xl border p-3 text-sm">
                <div className="flex justify-between">
                  <span>
                    {product.name} × {quantity}
                  </span>
                  <span>{formatMoney(subtotal, store.currency)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Livraison</span>
                  <span>{formatMoney(shipping, store.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatMoney(total, store.currency)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={fields.length === 0}
                onClick={submit}
              >
                <Check className="mr-2 h-4 w-4" />
                {design?.buttonText ?? "Commander maintenant"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Paiement à la livraison · Frais de livraison{" "}
                {formatMoney(shipping, store.currency)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {theme.showFooter && (
        <footer className="mx-auto max-w-5xl space-y-5 px-5 pb-10 text-center text-xs text-muted-foreground">
          <LegalPages theme={theme} />
          <p>{theme.footerText}</p>
        </footer>
      )}
    </main>
      <WhatsappFloat storeId={storeId} />
    </>
  );
}
