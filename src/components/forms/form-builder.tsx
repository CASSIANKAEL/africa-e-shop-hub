import { useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  ChevronDown,
  Eye,
  EyeOff,
  GripVertical,
  Lock,
  Monitor,
  Pencil,
  Plus,
  Save,
  Smartphone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { useStores } from "@/services/commerce.store";
import type { OrderForm, OrderFormDisplay, OrderFormField, OrderFormFieldType } from "@/types";

const fieldTypeLabels: Record<OrderFormFieldType, string> = {
  text: "Texte",
  phone: "Téléphone",
  email: "Email",
  city: "Ville (liste)",
  address: "Adresse",
  note: "Note (long texte)",
  select: "Liste déroulante",
};

const defaultDisplay: OrderFormDisplay = {
  mode: "embedded",
  popupTrigger: "buy_now",
  autoOpen: "never",
  position: "below_price",
};

interface FormBuilderProps {
  initial: OrderForm;
  onSave: (form: OrderForm) => void;
  saveLabel?: string;
  /** "editor" = éditeur complet, "offers" = uniquement les offres de quantité. */
  mode?: "editor" | "offers";
}

export function FormBuilder({
  initial,
  onSave,
  saveLabel = "Enregistrer",
  mode = "editor",
}: FormBuilderProps) {
  const [form, setForm] = useState<OrderForm>(initial);
  const [openBlock, setOpenBlock] = useState<string | null>(null);
  const [thanksOpen, setThanksOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);
  const { t } = useLanguage();
  const stores = useStores();
  const currency = stores.find((s) => s.id === form.storeId)?.currency ?? "XOF";
  const design = form.design;
  const display = form.display ?? defaultDisplay;
  const [previewTab, setPreviewTab] = useState<"form" | "thanks">("form");

  const patch = (p: Partial<OrderForm>) => setForm((f) => ({ ...f, ...p }));
  const patchDesign = (p: Partial<OrderForm["design"]>) =>
    setForm((f) => ({ ...f, design: { ...f.design, ...p } }));
  const patchDisplay = (p: Partial<OrderFormDisplay>) =>
    setForm((f) => ({ ...f, display: { ...(f.display ?? defaultDisplay), ...p } }));
  const patchSettings = (p: Partial<OrderForm["settings"]>) =>
    setForm((f) => ({ ...f, settings: { ...f.settings, ...p } }));
  const patchThanks = (p: Partial<OrderForm["thankYou"]>) =>
    setForm((f) => ({ ...f, thankYou: { ...f.thankYou, ...p } }));

  const updateField = (id: string, p: Partial<OrderFormField>) =>
    setForm((f) => ({ ...f, fields: f.fields.map((x) => (x.id === id ? { ...x, ...p } : x)) }));

  const moveFieldTo = (sourceId: string, targetId: string) =>
    setForm((f) => {
      const sourceIndex = f.fields.findIndex((field) => field.id === sourceId);
      const targetIndex = f.fields.findIndex((field) => field.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return f;
      const next = [...f.fields];
      const [moving] = next.splice(sourceIndex, 1);
      if (!moving) return f;
      next.splice(targetIndex, 0, moving);
      return { ...f, fields: next };
    });

  const beginFieldDrag = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggedFieldId(id);
    setDragOverFieldId(id);
  };

  const continueFieldDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggedFieldId) return;
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const row = element?.closest<HTMLElement>("[data-field-id]");
    const targetId = row?.dataset["fieldId"];
    if (!targetId || targetId === draggedFieldId) return;
    setDragOverFieldId(targetId);
    moveFieldTo(draggedFieldId, targetId);
  };

  const endFieldDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDraggedFieldId(null);
    setDragOverFieldId(null);
  };

  const addField = () => {
    const id = `f-${Date.now()}`;
    setForm((f) => ({
      ...f,
      fields: [
        ...f.fields,
        {
          id,
          label: "Nouveau champ",
          type: "text",
          placeholder: "",
          required: false,
          enabled: true,
        },
      ],
    }));
    setOpenBlock(id);
  };

  const removeField = (id: string) =>
    setForm((f) => ({ ...f, fields: f.fields.filter((x) => x.id !== id) }));

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Donnez un nom à votre formulaire.");
      return;
    }
    onSave(form);
  };

  const toggleBlock = (id: string) => setOpenBlock((v) => (v === id ? null : id));

  const saveBar = (
    <div className="flex flex-wrap items-center gap-3">
      <Button onClick={submit}>
        <Save className="mr-2 h-4 w-4" /> {saveLabel}
      </Button>
      <Button
        variant="outline"
        onClick={() => patch({ status: form.status === "active" ? "draft" : "active" })}
      >
        {form.status === "active" ? "Repasser en brouillon" : "Publier le formulaire"}
      </Button>
      <Badge variant={form.status === "active" ? "default" : "secondary"}>
        {form.status === "active" ? "En ligne" : "Brouillon"}
      </Badge>
    </div>
  );

  /* ---------------- Offres de quantité (page dédiée) ---------------- */
  if (mode === "offers") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Proposez plusieurs quantités au client pour augmenter le panier moyen. Ces offres
          s'appliquent à tous les produits de la boutique.
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventes additionnelles</CardTitle>
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
                      upsells: form.upsells.map((x) => (x.id === u.id ? { ...x, enabled: v } : x)),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Supprimer la vente additionnelle"
                  onClick={() => patch({ upsells: form.upsells.filter((x) => x.id !== u.id) })}
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

        {saveBar}
      </div>
    );
  }

  /* ---------------- Éditeur complet ---------------- */
  const blockRow = (opts: {
    id: string;
    draggable?: boolean;
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    badge?: string;
    locked?: boolean;
    visible?: boolean;
    onToggleVisible?: (v: boolean) => void;
    onDelete?: () => void;
    panel: React.ReactNode;
  }) => {
    const open = openBlock === opts.id;
    return (
      <div
        key={opts.id}
        data-field-id={opts.draggable ? opts.id : undefined}
        className={cn(
          "rounded-xl border transition-colors",
          open ? "border-primary bg-accent/40" : "bg-card",
          draggedFieldId === opts.id && "scale-[0.99] border-primary opacity-70",
          dragOverFieldId === opts.id && draggedFieldId !== opts.id && "border-primary",
        )}
      >
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
          {opts.draggable ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-grab touch-none active:cursor-grabbing"
              aria-label={t("dragHint")}
              title={t("dragHint")}
              onPointerDown={(event) => beginFieldDrag(event, opts.id)}
              onPointerMove={continueFieldDrag}
              onPointerUp={endFieldDrag}
              onPointerCancel={endFieldDrag}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          ) : (
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{opts.title}</p>
            {opts.subtitle && (
              <p className="truncate text-xs text-muted-foreground">{opts.subtitle}</p>
            )}
          </div>
          {opts.badge && <Badge variant="secondary">{opts.badge}</Badge>}
          {opts.onToggleVisible && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={opts.visible ? "Masquer le bloc" : "Afficher le bloc"}
              onClick={() => opts.onToggleVisible!(!opts.visible)}
            >
              {opts.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Personnaliser le bloc"
            onClick={() => toggleBlock(opts.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {opts.locked ? (
            <span className="px-2 text-muted-foreground" title="Champ protégé">
              <Lock className="h-4 w-4" />
            </span>
          ) : (
            opts.onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Supprimer le bloc"
                onClick={opts.onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )
          )}
        </div>
        {open && <div className="space-y-3 border-t px-3 py-3">{opts.panel}</div>}
      </div>
    );
  };

  const previewFields = form.fields.filter((f) => f.enabled);

  const previewForm = (
    <div className="rounded-2xl border bg-card p-4">
      {design.showHeadline !== false && (
        <h3 className="font-display text-lg font-semibold">{design.headline}</h3>
      )}
      {design.showSubheadline !== false && (
        <p className="mt-1 text-sm text-muted-foreground">{design.subheadline}</p>
      )}
      {design.showCountdown && (
        <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-center text-sm font-medium">
          Offre valable encore 09:59
        </p>
      )}
      <div
        className={cn(
          "mt-4 grid gap-3",
          design.layout === "two-columns" && device === "desktop" ? "sm:grid-cols-2" : "",
        )}
      >
        {previewFields.map((f) => (
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
      {design.showQuantitySelector && (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs font-medium">Quantité</span>
          <div className="flex items-center gap-3 rounded-lg border px-3 py-1.5 text-sm">
            <span>−</span>
            <span>1</span>
            <span>+</span>
          </div>
        </div>
      )}
      {design.showProductSummary && (
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
        className={cn(
          "mt-4 w-full overflow-hidden px-4",
          design.buttonAnimation && design.buttonAnimation !== "none"
            ? `order-button-${design.buttonAnimation}`
            : "",
        )}
        style={{
          backgroundColor: design.primaryColor,
          color: design.buttonTextColor ?? "#ffffff",
          borderRadius: design.buttonRadius ?? 10,
          fontSize: design.buttonFontSize ?? 15,
          height: design.buttonHeight ?? 46,
          fontWeight: design.buttonBold === false ? 500 : 700,
        }}
      >
        {design.buttonText}
      </button>
      {design.showTrustBadges !== false && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {(design.trustBadges ?? []).join(" • ")}
        </p>
      )}
    </div>
  );

  const previewThanks = (
    <div className="rounded-2xl border bg-card p-6 text-center">
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl"
        style={{ backgroundColor: design.primaryColor, color: design.buttonTextColor ?? "#fff" }}
      >
        {form.thankYou.emoji || "✓"}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold">
        {form.thankYou.title || "Commande confirmée"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{form.thankYou.message}</p>
      {form.thankYou.showOrderNumber !== false && (
        <p className="mt-3 text-sm font-medium">Commande n° 1042</p>
      )}
      {form.thankYou.showSummary !== false && (
        <div className="mt-4 rounded-lg bg-muted p-3 text-left text-sm">
          <div className="flex justify-between">
            <span>Produit</span>
            <span>{formatMoney(19900, currency)}</span>
          </div>
          <div className="flex justify-between">
            <span>Livraison</span>
            <span>{formatMoney(form.settings.shippingFee, currency)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t pt-1 font-semibold">
            <span>À payer à la livraison</span>
            <span>{formatMoney(19900 + form.settings.shippingFee, currency)}</span>
          </div>
        </div>
      )}
      {form.thankYou.ctaLabel && (
        <div
          className="mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{
            backgroundColor: design.primaryColor,
            color: design.buttonTextColor ?? "#fff",
          }}
        >
          {form.thankYou.ctaLabel}
        </div>
      )}
      {form.thankYou.supportNote && (
        <p className="mt-3 text-xs text-muted-foreground">{form.thankYou.supportNote}</p>
      )}
      {form.thankYou.redirectUrl && (
        <p className="mt-2 text-xs text-muted-foreground">
          Redirection vers {form.thankYou.redirectUrl}
        </p>
      )}
    </div>
  );


  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
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
              <Label>Portée</Label>
              <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                S'applique à tous les produits de {stores.find((s) => s.id === form.storeId)?.name ?? "la boutique"}.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 1. Type d'affichage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Type d'affichage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  {
                    key: "popup" as const,
                    title: "Fenêtre pop-up",
                    text: "S'ouvre par-dessus la page produit après un clic.",
                  },
                  {
                    key: "embedded" as const,
                    title: "Formulaire intégré",
                    text: "Toujours visible dans la page produit.",
                  },
                ]
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => patchDisplay({ mode: opt.key })}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition-colors",
                    display.mode === opt.key
                      ? "border-primary bg-accent"
                      : "hover:border-primary/40",
                  )}
                >
                  <div className="mb-3 h-20 rounded-xl bg-muted p-2">
                    {opt.key === "popup" ? (
                      <div className="flex h-full items-center justify-center rounded-lg bg-background/60">
                        <div className="h-10 w-2/3 rounded-md border bg-card" />
                      </div>
                    ) : (
                      <div className="flex h-full flex-col gap-1.5">
                        <div className="h-3 rounded bg-background/70" />
                        <div className="flex-1 rounded border bg-card" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium">{opt.title}</p>
                  <p className="text-xs text-muted-foreground">{opt.text}</p>
                </button>
              ))}
            </div>

            {display.mode === "popup" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Déclenché par</Label>
                  <Select
                    value={display.popupTrigger}
                    onValueChange={(v) =>
                      patchDisplay({ popupTrigger: v as OrderFormDisplay["popupTrigger"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy_now">Bouton « Acheter maintenant »</SelectItem>
                      <SelectItem value="add_to_cart">Bouton « Ajouter au panier »</SelectItem>
                      <SelectItem value="custom">Bouton personnalisé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ouverture automatique</Label>
                  <Select
                    value={display.autoOpen}
                    onValueChange={(v) =>
                      patchDisplay({ autoOpen: v as OrderFormDisplay["autoOpen"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Jamais</SelectItem>
                      <SelectItem value="10s">Après 10 secondes</SelectItem>
                      <SelectItem value="30s">Après 30 secondes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2 sm:max-w-sm">
                <Label>Position dans la page produit</Label>
                <Select
                  value={display.position}
                  onValueChange={(v) =>
                    patchDisplay({ position: v as OrderFormDisplay["position"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below_price">Sous le prix</SelectItem>
                    <SelectItem value="below_description">Sous la description</SelectItem>
                    <SelectItem value="replace_cart">
                      À la place du bouton « Ajouter au panier »
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Blocs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Modifier votre formulaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockRow({
              id: "title",
              title: "Titre du formulaire",
              subtitle: design.headline,
              badge: "Obligatoire",
              visible: design.showHeadline !== false,
              onToggleVisible: (v) => patchDesign({ showHeadline: v }),
              panel: (
                <Input
                  value={design.headline}
                  onChange={(e) => patchDesign({ headline: e.target.value })}
                />
              ),
            })}
            {blockRow({
              id: "description",
              title: "Description",
              subtitle: design.subheadline,
              visible: design.showSubheadline !== false,
              onToggleVisible: (v) => patchDesign({ showSubheadline: v }),
              panel: (
                <Textarea
                  value={design.subheadline}
                  onChange={(e) => patchDesign({ subheadline: e.target.value })}
                />
              ),
            })}

            {form.fields.map((field) =>
              blockRow({
                id: field.id,
                draggable: true,
                title: field.label,
                subtitle: fieldTypeLabels[field.type],
                badge: field.required ? "Obligatoire" : "Optionnel",
                locked: field.type === "phone",
                visible: field.enabled,
                onToggleVisible: (v) => updateField(field.id, { enabled: v }),
                onDelete: () => removeField(field.id),
                panel: (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Libellé</Label>
                        <Input
                          value={field.label}
                          className="h-9"
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(v) =>
                            updateField(field.id, { type: v as OrderFormFieldType })
                          }
                        >
                          <SelectTrigger className="h-9">
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
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Texte d'aide</Label>
                      <Input
                        value={field.placeholder ?? ""}
                        className="h-9"
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                      />
                    </div>
                    {(field.type === "city" || field.type === "select") && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">Options (séparées par des virgules)</Label>
                        <Input
                          value={(field.options ?? []).join(", ")}
                          className="h-9"
                          onChange={(e) =>
                            updateField(field.id, {
                              options: e.target.value
                                .split(",")
                                .map((o) => o.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </div>
                    )}
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={field.required}
                        disabled={field.type === "phone"}
                        onCheckedChange={(v) => updateField(field.id, { required: v })}
                      />
                      Champ obligatoire
                    </label>
                  </>
                ),
              }),
            )}

            <Button type="button" variant="outline" onClick={addField}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un bloc
            </Button>

            {blockRow({
              id: "quantity",
              title: "Sélecteur de quantité",
              subtitle: "− 1 +",
              badge: design.showQuantitySelector ? "Activé" : "Désactivé",
              visible: design.showQuantitySelector,
              onToggleVisible: (v) => patchDesign({ showQuantitySelector: v }),
              panel: (
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={design.showProductSummary}
                    onCheckedChange={(v) => patchDesign({ showProductSummary: v })}
                  />
                  Afficher le récapitulatif et le total
                </label>
              ),
            })}

            {blockRow({
              id: "button",
              title: "Bouton de commande",
              subtitle: design.buttonText,
              badge: "Obligatoire",
              panel: (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Texte du bouton</Label>
                    <Input
                      value={design.buttonText}
                      className="h-9"
                      onChange={(e) => patchDesign({ buttonText: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Couleur de fond</Label>
                    <Input
                      type="color"
                      value={design.primaryColor}
                      className="h-9 w-24 p-1"
                      onChange={(e) => patchDesign({ primaryColor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Couleur du texte</Label>
                    <Input
                      type="color"
                      value={design.buttonTextColor ?? "#ffffff"}
                      className="h-9 w-24 p-1"
                      onChange={(e) => patchDesign({ buttonTextColor: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Arrondi (px)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={40}
                      value={design.buttonRadius ?? 10}
                      className="h-9"
                      onChange={(e) => patchDesign({ buttonRadius: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Hauteur (px)</Label>
                    <Input
                      type="number"
                      min={32}
                      max={80}
                      value={design.buttonHeight ?? 46}
                      className="h-9"
                      onChange={(e) => patchDesign({ buttonHeight: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Taille du texte (px)</Label>
                    <Input
                      type="number"
                      min={12}
                      max={24}
                      value={design.buttonFontSize ?? 15}
                      className="h-9"
                      onChange={(e) => patchDesign({ buttonFontSize: Number(e.target.value) })}
                    />
                  </div>
                  <label className="flex items-center gap-2 self-end text-sm">
                    <Switch
                      checked={design.buttonBold !== false}
                      onCheckedChange={(v) => patchDesign({ buttonBold: v })}
                    />
                    Texte en gras
                  </label>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">{t("animation")}</Label>
                    <Select
                      value={design.buttonAnimation ?? "none"}
                      onValueChange={(value) =>
                        patchDesign({
                          buttonAnimation: value as NonNullable<
                            OrderForm["design"]["buttonAnimation"]
                          >,
                        })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t("none")}</SelectItem>
                        <SelectItem value="pulse">{t("pulse")}</SelectItem>
                        <SelectItem value="bounce">{t("bounce")}</SelectItem>
                        <SelectItem value="shake">{t("shake")}</SelectItem>
                        <SelectItem value="float">{t("float")}</SelectItem>
                        <SelectItem value="shine">{t("shine")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ),
            })}

            {blockRow({
              id: "badges",
              title: "Badges de confiance",
              subtitle: (design.trustBadges ?? []).join(" • "),
              visible: design.showTrustBadges !== false,
              onToggleVisible: (v) => patchDesign({ showTrustBadges: v }),
              panel: (
                <div className="space-y-1.5">
                  <Label className="text-xs">Textes séparés par «•»</Label>
                  <Input
                    value={(design.trustBadges ?? []).join(" • ")}
                    className="h-9"
                    onChange={(e) =>
                      patchDesign({
                        trustBadges: e.target.value
                          .split("•")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              ),
            })}
          </CardContent>
        </Card>

        {/* 3. Page de remerciement */}
        <Card>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 p-5 text-left"
            onClick={() =>
              setThanksOpen((v) => {
                if (!v) setPreviewTab("thanks");
                return !v;
              })
            }
          >
            <span>
              <span className="font-display text-base font-semibold">Page de remerciement</span>
              <span className="block text-sm text-muted-foreground">
                Ce que le client voit après avoir commandé.
              </span>
            </span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", thanksOpen && "rotate-180")}
            />
          </button>
          {thanksOpen && (
            <CardContent className="grid gap-4 border-t pt-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTab("thanks")}
                >
                  Prévisualiser la page de remerciement
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ty-title">Titre de confirmation</Label>
                <Input
                  id="ty-title"
                  value={form.thankYou.title ?? ""}
                  onChange={(e) => patchThanks({ title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirect">Redirection (optionnel)</Label>
                <Input
                  id="redirect"
                  placeholder="https://…"
                  value={form.thankYou.redirectUrl ?? ""}
                  onChange={(e) => patchThanks({ redirectUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="thanks">Message de confirmation</Label>
                <Textarea
                  id="thanks"
                  value={form.thankYou.message}
                  onChange={(e) => patchThanks({ message: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ty-emoji">Icône (emoji)</Label>
                <Input
                  id="ty-emoji"
                  maxLength={4}
                  placeholder="✓"
                  value={form.thankYou.emoji ?? ""}
                  onChange={(e) => patchThanks({ emoji: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ty-note">Note d'assistance (optionnel)</Label>
                <Input
                  id="ty-note"
                  placeholder="Besoin d'aide ? WhatsApp +229…"
                  value={form.thankYou.supportNote ?? ""}
                  onChange={(e) => patchThanks({ supportNote: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ty-cta">Texte du bouton (optionnel)</Label>
                <Input
                  id="ty-cta"
                  placeholder="Continuer mes achats"
                  value={form.thankYou.ctaLabel ?? ""}
                  onChange={(e) => patchThanks({ ctaLabel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ty-cta-url">Lien du bouton (optionnel)</Label>
                <Input
                  id="ty-cta-url"
                  placeholder="https://…"
                  value={form.thankYou.ctaUrl ?? ""}
                  onChange={(e) => patchThanks({ ctaUrl: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.thankYou.showOrderNumber !== false}
                  onCheckedChange={(v) => patchThanks({ showOrderNumber: v })}
                />
                Afficher le numéro de commande
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={form.thankYou.showSummary !== false}
                  onCheckedChange={(v) => patchThanks({ showSummary: v })}
                />
                Afficher le récapitulatif
              </label>
            </CardContent>
          )}

        </Card>

        {/* 4. Options de commande */}
        <Card>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 p-5 text-left"
            onClick={() => setOptionsOpen((v) => !v)}
          >
            <span>
              <span className="font-display text-base font-semibold">Options de commande</span>
              <span className="block text-sm text-muted-foreground">
                Livraison, doublons, vérification du numéro.
              </span>
            </span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", optionsOpen && "rotate-180")}
            />
          </button>
          {optionsOpen && (
            <CardContent className="grid gap-4 border-t pt-5 sm:grid-cols-2">
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
                    checked={form.design.showCountdown}
                    onCheckedChange={(v) => patchDesign({ showCountdown: v })}
                  />
                  Afficher un compte à rebours d'urgence
                </label>
              </div>
            </CardContent>
          )}
        </Card>

        {saveBar}
      </div>

      {/* Aperçu */}
      <div className="xl:sticky xl:top-6 xl:self-start">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
            <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() => setPreviewTab("form")}
                className={cn(
                  "rounded-md px-2 py-1",
                  previewTab === "form" && "bg-background font-medium shadow-sm",
                )}
              >
                {t("previewForm")}
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("thanks")}
                className={cn(
                  "rounded-md px-2 py-1",
                  previewTab === "thanks" && "bg-background font-medium shadow-sm",
                )}
              >
                {t("previewThanks")}
              </button>
            </div>

            <div className="flex gap-1">
              <Button
                type="button"
                variant={device === "desktop" ? "secondary" : "ghost"}
                size="icon"
                aria-label="Aperçu ordinateur"
                onClick={() => setDevice("desktop")}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant={device === "mobile" ? "secondary" : "ghost"}
                size="icon"
                aria-label="Aperçu mobile"
                onClick={() => setDevice("mobile")}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "mx-auto rounded-2xl bg-muted/60 p-3",
                device === "mobile" ? "max-w-[320px]" : "",
              )}
            >
              {display.mode === "popup" && previewTab === "form" && (
                <p className="mb-2 text-center text-xs text-muted-foreground">
                  Page produit assombrie — le formulaire s'ouvre en pop-up
                </p>
              )}
              {display.mode === "embedded" && previewTab === "form" && (
                <div className="mb-2 space-y-1.5">
                  <div className="h-16 rounded-xl bg-background" />
                  <div className="h-2 w-1/2 rounded bg-background" />
                </div>
              )}
              {previewTab === "form" ? previewForm : previewThanks}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
