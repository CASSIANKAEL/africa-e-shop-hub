import { useState } from "react";
import { ChevronDown, GripVertical, Plus, Save, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Currency, OfferCampaign, Product, QuantityOffer } from "@/types";

export function offerPrice(unitPrice: number, offer: QuantityOffer): number {
  const base = unitPrice * Math.max(1, offer.quantity);
  const type = offer.discountType ?? (offer.discountPercent > 0 ? "percent" : "none");
  if (type === "percent") return Math.max(0, base * (1 - (offer.discountPercent || 0) / 100));
  if (type === "fixed") return Math.max(0, base - (offer.discountValue || 0));
  return base;
}

export function offerSavings(unitPrice: number, offer: QuantityOffer): number {
  return unitPrice * Math.max(1, offer.quantity) - offerPrice(unitPrice, offer);
}

interface EditorProps {
  campaign: OfferCampaign;
  products: Product[];
  currency: Currency;
  onSave: (campaign: OfferCampaign) => void;
  onCancel: () => void;
}

export function OfferCampaignEditor({
  campaign: initial,
  products,
  currency,
  onSave,
  onCancel,
}: EditorProps) {
  const [campaign, setCampaign] = useState<OfferCampaign>(initial);
  const [openOffer, setOpenOffer] = useState<string | null>(initial.offers[0]?.id ?? null);
  const [dragId, setDragId] = useState<string | null>(null);

  const patch = (p: Partial<OfferCampaign>) => setCampaign((c) => ({ ...c, ...p }));
  const patchOffer = (id: string, p: Partial<QuantityOffer>) =>
    setCampaign((c) => ({
      ...c,
      offers: c.offers.map((o) => (o.id === id ? { ...o, ...p } : o)),
    }));

  const moveOffer = (sourceId: string, targetId: string) =>
    setCampaign((c) => {
      const from = c.offers.findIndex((o) => o.id === sourceId);
      const to = c.offers.findIndex((o) => o.id === targetId);
      if (from < 0 || to < 0 || from === to) return c;
      const next = [...c.offers];
      const [moving] = next.splice(from, 1);
      if (!moving) return c;
      next.splice(to, 0, moving);
      return { ...c, offers: next };
    });

  const addOffer = () => {
    const id = `q-${Date.now()}`;
    const quantity = campaign.offers.length + 1;
    setCampaign((c) => ({
      ...c,
      offers: [
        ...c.offers,
        {
          id,
          quantity,
          label: `${quantity} unités`,
          discountPercent: 0,
          freeShipping: false,
          discountType: "none",
          discountValue: 0,
          tag: "",
          tagColor: "#e2703f",
          preselected: false,
        },
      ],
    }));
    setOpenOffer(id);
  };

  const toggleProduct = (productId: string, checked: boolean) =>
    setCampaign((c) => ({
      ...c,
      productIds: checked
        ? [...c.productIds, productId]
        : c.productIds.filter((id) => id !== productId),
    }));

  const previewProduct = products.find((p) => campaign.productIds.includes(p.id)) ?? products[0];
  const unitPrice = previewProduct?.price ?? 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(300px,2fr)]">
      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[220px] flex-1 space-y-1">
                <Label className="text-xs">Nom de l'offre</Label>
                <Input
                  value={campaign.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  className="h-9"
                />
              </div>
              <label className="flex items-center gap-2 pb-2 text-sm">
                <Switch
                  checked={campaign.enabled}
                  onCheckedChange={(v) => patch({ enabled: v })}
                />
                {campaign.enabled ? "Active" : "Inactive"}
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Produits concernés
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {campaign.productIds.length} sélectionné(s)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border p-2">
              {products.length === 0 && (
                <p className="p-2 text-sm text-muted-foreground">
                  Aucun produit dans cette boutique.
                </p>
              )}
              {products.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={campaign.productIds.includes(p.id)}
                    onCheckedChange={(v) => toggleProduct(p.id, v === true)}
                  />
                  {p.image && (
                    <img src={p.image} alt="" className="h-8 w-8 rounded object-cover" />
                  )}
                  <span className="flex-1 truncate">{p.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatMoney(p.price, currency)}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => patch({ productIds: products.map((p) => p.id) })}
              >
                Tout sélectionner
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => patch({ productIds: [] })}
              >
                Tout retirer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Offres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {campaign.offers.map((o) => (
              <div
                key={o.id}
                data-offer-id={o.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragId && dragId !== o.id) moveOffer(dragId, o.id);
                }}
                className={cn(
                  "rounded-xl border",
                  dragId === o.id && "border-primary bg-accent/40",
                )}
              >
                <div className="flex items-center gap-2 p-3">
                  <button
                    type="button"
                    aria-label="Déplacer l'offre"
                    draggable
                    onDragStart={() => setDragId(o.id)}
                    onDragEnd={() => setDragId(null)}
                    className="cursor-grab text-muted-foreground"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <span className="flex-1 truncate text-sm font-medium">
                    {o.label || `${o.quantity} unités`}
                  </span>
                  {o.preselected && <Badge variant="secondary">Par défaut</Badge>}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setOpenOffer((v) => (v === o.id ? null : o.id))}
                  >
                    {openOffer === o.id ? "Terminé" : "Modifier"}
                    <ChevronDown
                      className={cn("ml-1 h-4 w-4", openOffer === o.id && "rotate-180")}
                    />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Supprimer l'offre"
                    onClick={() =>
                      patch({ offers: campaign.offers.filter((x) => x.id !== o.id) })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {openOffer === o.id && (
                  <div className="grid gap-3 border-t p-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantité</Label>
                      <Input
                        type="number"
                        min={1}
                        className="h-9"
                        value={o.quantity}
                        onChange={(e) =>
                          patchOffer(o.id, { quantity: Math.max(1, Number(e.target.value)) })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Titre</Label>
                      <Input
                        className="h-9"
                        value={o.label}
                        onChange={(e) => patchOffer(o.id, { label: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type de remise</Label>
                      <Select
                        value={o.discountType ?? (o.discountPercent > 0 ? "percent" : "none")}
                        onValueChange={(v) =>
                          patchOffer(o.id, { discountType: v as QuantityOffer["discountType"] })
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune remise</SelectItem>
                          <SelectItem value="fixed">Montant fixe</SelectItem>
                          <SelectItem value="percent">Pourcentage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Valeur de la remise</Label>
                      {(o.discountType ?? (o.discountPercent > 0 ? "percent" : "none")) ===
                      "fixed" ? (
                        <Input
                          type="number"
                          min={0}
                          className="h-9"
                          value={o.discountValue ?? 0}
                          onChange={(e) =>
                            patchOffer(o.id, { discountValue: Number(e.target.value) })
                          }
                        />
                      ) : (
                        <Input
                          type="number"
                          min={0}
                          max={90}
                          className="h-9"
                          value={o.discountPercent}
                          onChange={(e) =>
                            patchOffer(o.id, { discountPercent: Number(e.target.value) })
                          }
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Étiquette</Label>
                      <Input
                        className="h-9"
                        placeholder="Ex. Le plus vendu"
                        value={o.tag ?? ""}
                        onChange={(e) => patchOffer(o.id, { tag: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Couleur de l'étiquette</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          aria-label="Couleur de l'étiquette"
                          className="h-9 w-12 cursor-pointer rounded border bg-transparent"
                          value={o.tagColor ?? "#e2703f"}
                          onChange={(e) => patchOffer(o.id, { tagColor: e.target.value })}
                        />
                        <Input
                          className="h-9"
                          value={o.tagColor ?? "#e2703f"}
                          onChange={(e) => patchOffer(o.id, { tagColor: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">Image de l'offre (lien)</Label>
                      <Input
                        className="h-9"
                        placeholder="https://…"
                        value={o.image ?? ""}
                        onChange={(e) => patchOffer(o.id, { image: e.target.value })}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={o.freeShipping}
                        onCheckedChange={(v) => patchOffer(o.id, { freeShipping: v })}
                      />
                      Livraison offerte
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={o.preselected ?? false}
                        onCheckedChange={(v) =>
                          setCampaign((c) => ({
                            ...c,
                            offers: c.offers.map((x) => ({
                              ...x,
                              preselected: x.id === o.id ? v : v ? false : x.preselected,
                            })),
                          }))
                        }
                      />
                      Présélectionner cette offre
                    </label>
                  </div>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOffer}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter une offre
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Présentation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 p-4 pt-0">
            {(["classic", "modern", "vertical"] as const).map((tpl) => (
              <Button
                key={tpl}
                type="button"
                variant={campaign.template === tpl ? "default" : "outline"}
                size="sm"
                onClick={() => patch({ template: tpl })}
              >
                {tpl === "classic" ? "Classique" : tpl === "modern" ? "Moderne" : "Vertical"}
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => onSave(campaign)}>
            <Save className="mr-2 h-4 w-4" /> Enregistrer l'offre
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </div>

      <aside className="xl:sticky xl:top-20 xl:self-start">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Aperçu en direct</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-4 pt-0">
            {!previewProduct && (
              <p className="text-sm text-muted-foreground">
                Sélectionnez un produit pour voir l'aperçu.
              </p>
            )}
            {previewProduct && (
              <>
                <p className="text-xs text-muted-foreground">{previewProduct.name}</p>
                <OfferPreview campaign={campaign} unitPrice={unitPrice} currency={currency} />
              </>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

export function OfferPreview({
  campaign,
  unitPrice,
  currency,
}: {
  campaign: OfferCampaign;
  unitPrice: number;
  currency: Currency;
}) {
  return (
    <div
      className={cn(
        "gap-2",
        campaign.template === "vertical" ? "grid grid-cols-3" : "flex flex-col",
      )}
    >
      {campaign.offers.map((o) => {
        const price = offerPrice(unitPrice, o);
        const saving = offerSavings(unitPrice, o);
        return (
          <div
            key={o.id}
            className={cn(
              "rounded-xl border p-3 text-sm",
              o.preselected && "border-primary bg-accent/40",
              campaign.template === "modern" && "shadow-sm",
            )}
          >
            <div className="flex items-center gap-2">
              {o.image && <img src={o.image} alt="" className="h-9 w-9 rounded object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{o.label || `${o.quantity} unités`}</p>
                {o.tag && (
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                    style={{ backgroundColor: o.tagColor ?? "#e2703f" }}
                  >
                    {o.tag}
                  </span>
                )}
              </div>
              <div className="text-right">
                {saving > 0 && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatMoney(unitPrice * o.quantity, currency)}
                  </p>
                )}
                <p className="font-semibold">{formatMoney(price, currency)}</p>
              </div>
            </div>
            {o.freeShipping && (
              <p className="mt-1 text-xs text-muted-foreground">Livraison offerte</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
