import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/format";
import { useProducts, useStores } from "@/services/commerce.store";
import type { OrderForm, OrderFormField, OrderFormFieldType } from "@/types";

const fieldTypeLabels: Record<OrderFormFieldType, string> = {
  text: "Texte",
  phone: "Téléphone",
  email: "Email",
  city: "Ville (liste)",
  address: "Adresse",
  note: "Note (long texte)",
  select: "Liste déroulante",
};

interface FormBuilderProps {
  initial: OrderForm;
  onSave: (form: OrderForm) => void;
  saveLabel?: string;
}

export function FormBuilder({ initial, onSave, saveLabel = "Enregistrer" }: FormBuilderProps) {
  const [form, setForm] = useState<OrderForm>(initial);
  const stores = useStores();
  const products = useProducts();
  const storeProducts = products.filter((p) => p.storeId === form.storeId);
  const currency = stores.find((s) => s.id === form.storeId)?.currency ?? "XOF";

  const patch = (p: Partial<OrderForm>) => setForm((f) => ({ ...f, ...p }));
  const patchDesign = (p: Partial<OrderForm["design"]>) =>
    setForm((f) => ({ ...f, design: { ...f.design, ...p } }));
  const patchSettings = (p: Partial<OrderForm["settings"]>) =>
    setForm((f) => ({ ...f, settings: { ...f.settings, ...p } }));

  const updateField = (id: string, p: Partial<OrderFormField>) =>
    setForm((f) => ({ ...f, fields: f.fields.map((x) => (x.id === id ? { ...x, ...p } : x)) }));

  const moveField = (index: number, dir: -1 | 1) =>
    setForm((f) => {
      const next = [...f.fields];
      const target = index + dir;
      if (target < 0 || target >= next.length) return f;
      const a = next[index]!;
      const b = next[target]!;
      next[index] = b;
      next[target] = a;
      return { ...f, fields: next };
    });

  const addField = () =>
    setForm((f) => ({
      ...f,
      fields: [
        ...f.fields,
        {
          id: `f-${Date.now()}`,
          label: "Nouveau champ",
          type: "text",
          placeholder: "",
          required: false,
          enabled: true,
        },
      ],
    }));

  const removeField = (id: string) =>
    setForm((f) => ({ ...f, fields: f.fields.filter((x) => x.id !== id) }));

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Donnez un nom à votre formulaire.");
      return;
    }
    onSave(form);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <Card>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="form-name">Nom du formulaire</Label>
              <Input
                id="form-name"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Boutique</Label>
              <Select
                value={form.storeId}
                onValueChange={(v) => patch({ storeId: v, productIds: [] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="champs">
          <TabsList className="flex-wrap">
            <TabsTrigger value="champs">Champs</TabsTrigger>
            <TabsTrigger value="produits">Produits</TabsTrigger>
            <TabsTrigger value="offres">Offres quantité</TabsTrigger>
            <TabsTrigger value="apparence">Apparence</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="champs" className="space-y-3 pt-4">
            {form.fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      className="h-9 max-w-[240px]"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(v) =>
                        updateField(field.id, { type: v as OrderFormFieldType })
                      }
                    >
                      <SelectTrigger className="h-9 w-[170px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(fieldTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Monter"
                        onClick={() => moveField(index, -1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Descendre"
                        onClick={() => moveField(index, 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Supprimer le champ"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    value={field.placeholder ?? ""}
                    placeholder="Texte d'aide affiché dans le champ"
                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                    className="h-9"
                  />
                  {(field.type === "city" || field.type === "select") && (
                    <Input
                      value={(field.options ?? []).join(", ")}
                      placeholder="Options séparées par des virgules"
                      onChange={(e) =>
                        updateField(field.id, {
                          options: e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })
                      }
                      className="h-9"
                    />
                  )}
                  <div className="flex flex-wrap gap-6 text-sm">
                    <label className="flex items-center gap-2">
                      <Switch
                        checked={field.enabled}
                        onCheckedChange={(v) => updateField(field.id, { enabled: v })}
                      />
                      Affiché
                    </label>
                    <label className="flex items-center gap-2">
                      <Switch
                        checked={field.required}
                        onCheckedChange={(v) => updateField(field.id, { required: v })}
                      />
                      Obligatoire
                    </label>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addField}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un champ
            </Button>
          </TabsContent>

          <TabsContent value="produits" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Produits liés au formulaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {storeProducts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Aucun produit dans cette boutique pour le moment.
                  </p>
                )}
                {storeProducts.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 text-sm">
                    <Checkbox
                      checked={form.productIds.includes(p.id)}
                      onCheckedChange={(v) =>
                        patch({
                          productIds: v
                            ? [...form.productIds, p.id]
                            : form.productIds.filter((id) => id !== p.id),
                        })
                      }
                    />
                    <span className="flex-1">{p.name}</span>
                    <span className="text-muted-foreground">{formatMoney(p.price, currency)}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ventes additionnelles (upsell)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.upsells.map((u) => (
                  <div key={u.id} className="flex flex-wrap items-center gap-2">
                    <Input
                      value={u.title}
                      className="h-9 max-w-[240px]"
                      onChange={(e) =>
                        patch({
                          upsells: form.upsells.map((x) =>
                            x.id === u.id ? { ...x, title: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Input
                      type="number"
                      value={u.price}
                      className="h-9 w-32"
                      onChange={(e) =>
                        patch({
                          upsells: form.upsells.map((x) =>
                            x.id === u.id ? { ...x, price: Number(e.target.value) } : x,
                          ),
                        })
                      }
                    />
                    <Switch
                      checked={u.enabled}
                      onCheckedChange={(v) =>
                        patch({
                          upsells: form.upsells.map((x) =>
                            x.id === u.id ? { ...x, enabled: v } : x,
                          ),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Supprimer l'upsell"
                      onClick={() =>
                        patch({ upsells: form.upsells.filter((x) => x.id !== u.id) })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    patch({
                      upsells: [
                        ...form.upsells,
                        {
                          id: `u-${Date.now()}`,
                          title: "Produit complémentaire",
                          price: 3000,
                          enabled: true,
                        },
                      ],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une vente additionnelle
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="offres" className="space-y-3 pt-4">
            <p className="text-sm text-muted-foreground">
              Proposez plusieurs quantités au client pour augmenter le panier moyen.
            </p>
            {form.offers.map((o) => (
              <Card key={o.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Quantité</Label>
                    <Input
                      type="number"
                      min={1}
                      value={o.quantity}
                      className="h-9 w-24"
                      onChange={(e) =>
                        patch({
                          offers: form.offers.map((x) =>
                            x.id === o.id ? { ...x, quantity: Number(e.target.value) } : x,
                          ),
                        })
                      }
                    />
                  </div>
                  <div className="min-w-[200px] flex-1 space-y-1">
                    <Label className="text-xs">Texte affiché</Label>
                    <Input
                      value={o.label}
                      className="h-9"
                      onChange={(e) =>
                        patch({
                          offers: form.offers.map((x) =>
                            x.id === o.id ? { ...x, label: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Remise %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={90}
                      value={o.discountPercent}
                      className="h-9 w-24"
                      onChange={(e) =>
                        patch({
                          offers: form.offers.map((x) =>
                            x.id === o.id ? { ...x, discountPercent: Number(e.target.value) } : x,
                          ),
                        })
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={o.freeShipping}
                      onCheckedChange={(v) =>
                        patch({
                          offers: form.offers.map((x) =>
                            x.id === o.id ? { ...x, freeShipping: v } : x,
                          ),
                        })
                      }
                    />
                    Livraison offerte
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer l'offre"
                    onClick={() => patch({ offers: form.offers.filter((x) => x.id !== o.id) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                patch({
                  offers: [
                    ...form.offers,
                    {
                      id: `q-${Date.now()}`,
                      quantity: form.offers.length + 1,
                      label: `${form.offers.length + 1} articles`,
                      discountPercent: 0,
                      freeShipping: false,
                    },
                  ],
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Ajouter une offre
            </Button>
          </TabsContent>

          <TabsContent value="apparence" className="space-y-4 pt-4">
            <Card>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="headline">Titre</Label>
                  <Input
                    id="headline"
                    value={form.design.headline}
                    onChange={(e) => patchDesign({ headline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subheadline">Sous-titre</Label>
                  <Input
                    id="subheadline"
                    value={form.design.subheadline}
                    onChange={(e) => patchDesign({ subheadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="btn">Texte du bouton</Label>
                  <Input
                    id="btn"
                    value={form.design.buttonText}
                    onChange={(e) => patchDesign({ buttonText: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Couleur principale</Label>
                  <Input
                    id="color"
                    type="color"
                    value={form.design.primaryColor}
                    className="h-10 w-24 p-1"
                    onChange={(e) => patchDesign({ primaryColor: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Disposition</Label>
                  <Select
                    value={form.design.layout}
                    onValueChange={(v) =>
                      patchDesign({ layout: v as OrderForm["design"]["layout"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Une colonne</SelectItem>
                      <SelectItem value="two-columns">Deux colonnes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={form.design.showProductSummary}
                      onCheckedChange={(v) => patchDesign({ showProductSummary: v })}
                    />
                    Afficher le récapitulatif produit
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={form.design.showQuantitySelector}
                      onCheckedChange={(v) => patchDesign({ showQuantitySelector: v })}
                    />
                    Afficher le sélecteur de quantité
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={form.design.showCountdown}
                      onCheckedChange={(v) => patchDesign({ showCountdown: v })}
                    />
                    Afficher un compte à rebours d'urgence
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="options" className="space-y-4 pt-4">
            <Card>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ship">Frais de livraison</Label>
                  <Input
                    id="ship"
                    type="number"
                    value={form.settings.shippingFee}
                    onChange={(e) => patchSettings({ shippingFee: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="free">Livraison offerte à partir de</Label>
                  <Input
                    id="free"
                    type="number"
                    value={form.settings.freeShippingThreshold}
                    onChange={(e) =>
                      patchSettings({ freeShippingThreshold: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={form.settings.blockDuplicates}
                      onCheckedChange={(v) => patchSettings({ blockDuplicates: v })}
                    />
                    Bloquer les commandes en double (même numéro)
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={form.settings.requireOtp}
                      onCheckedChange={(v) => patchSettings({ requireOtp: v })}
                    />
                    Vérifier le numéro par code SMS
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={form.settings.abandonedTracking}
                      onCheckedChange={(v) => patchSettings({ abandonedTracking: v })}
                    />
                    Enregistrer les formulaires abandonnés
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={form.settings.whatsappConfirm}
                      onCheckedChange={(v) => patchSettings({ whatsappConfirm: v })}
                    />
                    Confirmation WhatsApp automatique
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={form.settings.googleSheetSync}
                      onCheckedChange={(v) => patchSettings({ googleSheetSync: v })}
                    />
                    Envoyer les commandes vers Google Sheets
                  </label>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="thanks">Message de remerciement</Label>
                  <Textarea
                    id="thanks"
                    value={form.thankYou.message}
                    onChange={(e) => patch({ thankYou: { ...form.thankYou, message: e.target.value } })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="redirect">Redirection après commande (optionnel)</Label>
                  <Input
                    id="redirect"
                    placeholder="https://…"
                    value={form.thankYou.redirectUrl ?? ""}
                    onChange={(e) =>
                      patch({ thankYou: { ...form.thankYou, redirectUrl: e.target.value } })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-3">
          <Button onClick={submit}>
            <Save className="mr-2 h-4 w-4" /> {saveLabel}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              patch({ status: form.status === "active" ? "draft" : "active" });
            }}
          >
            {form.status === "active" ? "Repasser en brouillon" : "Activer le formulaire"}
          </Button>
        </div>
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Aperçu</CardTitle>
            <Badge variant={form.status === "active" ? "default" : "secondary"}>
              {form.status === "active" ? "Actif" : "Brouillon"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-display text-lg font-semibold">{form.design.headline}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{form.design.subheadline}</p>
              {form.design.showCountdown && (
                <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-center text-sm font-medium">
                  Offre valable encore 09:59
                </p>
              )}
              {form.design.showQuantitySelector && (
                <div className="mt-4 space-y-2">
                  {form.offers.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <span>{o.label}</span>
                      {o.freeShipping && <Badge variant="secondary">Livraison offerte</Badge>}
                    </div>
                  ))}
                </div>
              )}
              <div
                className={`mt-4 grid gap-3 ${
                  form.design.layout === "two-columns" ? "sm:grid-cols-2" : ""
                }`}
              >
                {form.fields
                  .filter((f) => f.enabled)
                  .map((f) => (
                    <div key={f.id} className="space-y-1">
                      <span className="text-xs font-medium">
                        {f.label}
                        {f.required && <span className="text-destructive"> *</span>}
                      </span>
                      <div className="rounded-md border bg-background px-3 py-2 text-xs text-muted-foreground">
                        {f.placeholder || "…"}
                      </div>
                    </div>
                  ))}
              </div>
              {form.design.showProductSummary && (
                <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{formatMoney(19900, currency)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Livraison</span>
                    <span>{formatMoney(form.settings.shippingFee, currency)}</span>
                  </div>
                </div>
              )}
              <button
                type="button"
                className="mt-4 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: form.design.primaryColor }}
              >
                {form.design.buttonText}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Paiement à la livraison · {form.fields.filter((f) => f.enabled).length} champs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
