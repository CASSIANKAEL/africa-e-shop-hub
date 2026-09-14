import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Check, ExternalLink, GripVertical, ImagePlus, Monitor, Palette, Plus, RotateCcw, Smartphone, Store as StoreIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { StorefrontCanvas } from "@/components/commerce/storefront-canvas";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActiveStore, useProducts } from "@/services/commerce.store";
import {
  buttonStyleOf,
  fontPairs,
  storeTemplates,
  themeStore,
  useStoreTheme,
  type StoreSectionId,
  type StoreTextBlock,
  type StoreTextBlockType,
  type StoreTheme,
} from "@/services/theme.store";
import { formatMoney, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/boutique")({
  head: () => ({
    meta: [
      { title: "Ma boutique — Sooko" },
      {
        name: "description",
        content:
          "Choisissez un modèle et personnalisez la mise en page, les couleurs, la typographie et les boutons de votre boutique en ligne.",
      },
      { property: "og:title", content: "Ma boutique — Sooko" },
      {
        property: "og:description",
        content: "Modèles prêts à l'emploi et personnalisation avancée de votre boutique en ligne.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoreEditorPage,
});

function StoreEditorPage() {
  const store = useActiveStore();

  if (!store) {
    return (
      <AppShell>
        <PageHeader title="Ma boutique" description="Sélectionnez une boutique dans le menu." />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <StoreEditor storeId={store.id} />
    </AppShell>
  );
}

function StoreEditor({ storeId }: { storeId: string }) {
  const store = useActiveStore();
  const products = useProducts().filter((product) => product.storeId === storeId);
  const theme = useStoreTheme(storeId);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const set = (patch: Partial<StoreTheme>) => themeStore.update(storeId, patch);

  if (!store) return null;

  return (
    <>
      <PageHeader
        title={store.name}
        description="Espace d'édition de votre boutique en ligne : modèle, mise en page, couleurs, typographie, boutons et contenus."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                themeStore.reset(storeId);
                toast.success("Modèle réinitialisé");
              }}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
            </Button>
            <Button asChild>
              <Link to="/vitrine/$storeId" params={{ storeId }} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" /> Voir la boutique
              </Link>
            </Button>
          </div>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <StoreIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{store.name}</p>
            <p className="text-sm text-muted-foreground">
              {store.city}, {store.country} · {store.currency}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Produits</p>
              <p className="font-semibold">{formatNumber(store.productsCount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CA du mois</p>
              <p className="font-semibold">{formatMoney(store.monthlyRevenue, store.currency)}</p>
            </div>
            <Badge variant={store.status === "active" ? "default" : "secondary"}>
              {store.status === "active" ? "Active" : "En pause"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(360px,2fr)_minmax(0,3fr)]">
      <Tabs defaultValue="templates" className="min-w-0">
        <div className="w-full overflow-x-auto pb-1">
        <TabsList className="inline-flex min-w-max justify-start gap-1">
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="layout">Mise en page</TabsTrigger>
          <TabsTrigger value="colors">Couleurs</TabsTrigger>
          <TabsTrigger value="fonts">Typographie</TabsTrigger>
          <TabsTrigger value="buttons">Boutons</TabsTrigger>
          <TabsTrigger value="content">Contenus</TabsTrigger>
        </TabsList>
        </div>

        {/* -------- Modèles -------- */}
        <TabsContent value="templates" className="mt-4 grid gap-4 2xl:grid-cols-2">
          {storeTemplates.map((tpl) => {
            const active = theme.templateId === tpl.id;
            return (
              <Card key={tpl.id} className={active ? "border-primary ring-1 ring-primary" : ""}>
                <CardContent className="p-5">
                  <TemplatePreview theme={tpl.theme} />
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{tpl.name}</h2>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {tpl.tagline}
                      </p>
                    </div>
                    {active && (
                      <Badge className="shrink-0">
                        <Check className="mr-1 h-3 w-3" /> Utilisé
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tpl.description}</p>
                  <Button
                    className="mt-4 w-full"
                    variant={active ? "outline" : "default"}
                    onClick={() => {
                      themeStore.applyTemplate(storeId, tpl.id);
                      toast.success(`Modèle « ${tpl.name} » appliqué`);
                    }}
                  >
                    <Palette className="mr-2 h-4 w-4" />
                    {active ? "Réappliquer ce modèle" : "Utiliser ce modèle"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* -------- Mise en page -------- */}
        <TabsContent value="layout" className="mt-4 grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Grille des produits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Colonnes de produits">
                <Select
                  value={String(theme.columns)}
                  onValueChange={(v) => set({ columns: Number(v) as StoreTheme["columns"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 colonnes</SelectItem>
                    <SelectItem value="3">3 colonnes</SelectItem>
                    <SelectItem value="4">4 colonnes</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Largeur de la page">
                <Select
                  value={theme.containerWidth}
                  onValueChange={(v) => set({ containerWidth: v as StoreTheme["containerWidth"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="narrow">Étroite</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="wide">Large</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Style des cartes">
                <Select
                  value={theme.cardStyle}
                  onValueChange={(v) => set({ cardStyle: v as StoreTheme["cardStyle"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shadow">Ombre douce</SelectItem>
                    <SelectItem value="border">Bordure fine</SelectItem>
                    <SelectItem value="flat">Sans contour</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Format des images">
                <Select
                  value={theme.imageRatio}
                  onValueChange={(v) => set({ imageRatio: v as StoreTheme["imageRatio"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Carré</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Paysage</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <SliderField
                label="Arrondi des blocs"
                value={theme.cornerRadius}
                min={0}
                max={32}
                suffix="px"
                onChange={(v) => set({ cornerRadius: v })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sections affichées</CardTitle>
            </CardHeader>
            <CardContent>
              <SectionManager theme={theme} set={set} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Couleurs -------- */}
        <TabsContent value="colors" className="mt-4 grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Palette</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Palettes prêtes à l'emploi</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {COLOR_PALETTES.map((palette) => (
                    <Button key={palette.name} variant="outline" className="h-auto justify-start p-3" onClick={() => set(palette.colors)}>
                      <span className="flex gap-1" aria-hidden="true">
                        {[palette.colors.primary, palette.colors.accent, palette.colors.background].map((color) => <span key={color} className="h-5 w-5 rounded-full border" style={{ background: color }} />)}
                      </span>
                      <span className="text-xs">{palette.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <ColorField label="Couleur principale" value={theme.primary} onChange={(v) => set({ primary: v })} />
              <ColorField label="Texte sur la couleur principale" value={theme.primaryText} onChange={(v) => set({ primaryText: v })} />
              <ColorField label="Fond de la page" value={theme.background} onChange={(v) => set({ background: v })} />
              <ColorField label="Fond des cartes" value={theme.surface} onChange={(v) => set({ surface: v })} />
              <ColorField label="Texte" value={theme.text} onChange={(v) => set({ text: v })} />
              <ColorField label="Texte secondaire" value={theme.muted} onChange={(v) => set({ muted: v })} />
              <ColorField label="Couleur d'accent" value={theme.accent} onChange={(v) => set({ accent: v })} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rendu de la palette</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplatePreview theme={theme} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Typographie -------- */}
        <TabsContent value="fonts" className="mt-4 grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Polices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Association de polices">
                <Select
                  value={theme.fontPair}
                  onValueChange={(v) => set({ fontPair: v as StoreTheme["fontPair"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(fontPairs) as [StoreTheme["fontPair"], { label: string; heading: string }][]).map(
                      ([key, pair]) => (
                        <SelectItem key={key} value={key} style={{ fontFamily: pair.heading }}>
                          {pair.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </Field>
              <SliderField
                label="Taille des titres"
                value={Math.round(theme.headingScale * 100)}
                min={80}
                max={140}
                suffix="%"
                onChange={(v) => set({ headingScale: v / 100 })}
              />
              <ToggleRow
                label="Titres en majuscules"
                hint="Donne un style éditorial aux titres."
                checked={theme.uppercaseHeadings}
                onChange={(v) => set({ uppercaseHeadings: v })}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aperçu des textes</CardTitle>
            </CardHeader>
            <CardContent
              className="space-y-2 rounded-xl p-5"
              style={{ background: theme.surface, color: theme.text }}
            >
              <p
                style={{
                  fontFamily: fontPairs[theme.fontPair].heading,
                  fontSize: `${1.6 * theme.headingScale}rem`,
                  textTransform: theme.uppercaseHeadings ? "uppercase" : "none",
                  fontWeight: 700,
                }}
              >
                {store.name}
              </p>
              <p style={{ fontFamily: fontPairs[theme.fontPair].body, color: theme.muted }}>
                Paiement à la livraison, partout en ville. Commandez en deux minutes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Boutons -------- */}
        <TabsContent value="buttons" className="mt-4 grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Style des boutons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Texte du bouton d'achat">
                <Input
                  value={theme.buttonLabel}
                  onChange={(e) => set({ buttonLabel: e.target.value })}
                />
              </Field>
              <Field label="Apparence">
                <Select
                  value={theme.buttonStyle}
                  onValueChange={(v) => set({ buttonStyle: v as StoreTheme["buttonStyle"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Plein</SelectItem>
                    <SelectItem value="outline">Contour</SelectItem>
                    <SelectItem value="soft">Teinté</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <SliderField
                label="Arrondi"
                value={theme.buttonRadius}
                min={0}
                max={999}
                suffix="px"
                onChange={(v) => set({ buttonRadius: v })}
              />
              <SliderField
                label="Hauteur"
                value={theme.buttonHeight}
                min={36}
                max={64}
                suffix="px"
                onChange={(v) => set({ buttonHeight: v })}
              />
              <ToggleRow
                label="Texte en gras"
                hint="Renforce la lisibilité sur mobile."
                checked={theme.buttonBold}
                onChange={(v) => set({ buttonBold: v })}
              />
              <ToggleRow
                label="Texte en majuscules"
                hint="Style plus affirmé."
                checked={theme.buttonUppercase}
                onChange={(v) => set({ buttonUppercase: v })}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Aperçu du bouton</CardTitle>
            </CardHeader>
            <CardContent
              className="flex items-center justify-center rounded-xl p-8"
              style={{ background: theme.background }}
            >
              <span style={buttonStyleOf(theme)}>{theme.buttonLabel}</span>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Contenus -------- */}
        <TabsContent value="content" className="mt-4 grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Logo de la boutique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LogoUploader theme={theme} set={set} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Blocs de texte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextBlockManager theme={theme} set={set} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bandeau d'annonces</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnnouncementManager theme={theme} set={set} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pages légales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow
                label="Afficher les pages légales"
                hint="Visibles dans le pied de page et sur chaque fiche produit."
                checked={theme.showLegalPages}
                onChange={(v) => set({ showLegalPages: v })}
              />
              <LegalPagesManager theme={theme} set={set} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pied de page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow
                label="Afficher le pied de page"
                hint="Masquez-le pour une page plus courte sur téléphone."
                checked={theme.showFooter}
                onChange={(v) => set({ showFooter: v })}
              />
              <Field label="Texte du pied de page">
                <Input value={theme.footerText} onChange={(e) => set({ footerText: e.target.value })} />
              </Field>
              <Button onClick={() => toast.success("Boutique enregistrée")}>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <aside className="min-w-0 rounded-lg border bg-muted/40 p-3 xl:sticky xl:top-4">
        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div><p className="font-semibold">Aperçu en direct</p><p className="text-xs text-muted-foreground">Les changements apparaissent immédiatement.</p></div>
          <div className="flex rounded-md border bg-background p-1">
            <Button size="icon" variant={previewDevice === "desktop" ? "secondary" : "ghost"} aria-label="Aperçu ordinateur" title="Ordinateur" onClick={() => setPreviewDevice("desktop")}><Monitor /></Button>
            <Button size="icon" variant={previewDevice === "mobile" ? "secondary" : "ghost"} aria-label="Aperçu téléphone" title="Téléphone" onClick={() => setPreviewDevice("mobile")}><Smartphone /></Button>
          </div>
        </div>
        <div className="flex max-h-[calc(100vh-10rem)] min-h-[520px] justify-center overflow-auto rounded-md border bg-background/50 p-2 sm:p-4">
          <div className={previewDevice === "mobile" ? "w-full max-w-[390px] shrink-0 overflow-hidden rounded-lg border bg-background shadow-sm" : "w-full min-w-0 overflow-hidden rounded-lg border bg-background shadow-sm"}>
            <StorefrontCanvas store={store} products={products} theme={theme} preview />
          </div>
        </div>
      </aside>
      </div>
    </>
  );
}

/* ---------- Petits composants ---------- */

const COLOR_PALETTES: { name: string; colors: Pick<StoreTheme, "primary" | "primaryText" | "background" | "surface" | "text" | "muted" | "accent"> }[] = [
  { name: "Savane", colors: { primary: "#b54708", primaryText: "#fffaf5", background: "#fffaf2", surface: "#ffffff", text: "#2b1b12", muted: "#795f50", accent: "#2f7d64" } },
  { name: "Lagune", colors: { primary: "#075985", primaryText: "#f0f9ff", background: "#f8fafc", surface: "#ffffff", text: "#172033", muted: "#64748b", accent: "#f2bd48" } },
  { name: "Ébène", colors: { primary: "#171717", primaryText: "#ffffff", background: "#fafafa", surface: "#ffffff", text: "#171717", muted: "#737373", accent: "#dc9f54" } },
];

const SECTION_CONFIG: Record<StoreSectionId, { label: string; hint: string; visibility: keyof StoreTheme }> = {
  announcement: { label: "Bandeau d'annonce", hint: "Message placé en haut de la boutique.", visibility: "showAnnouncement" },
  hero: { label: "Bannière d'accueil", hint: "Titre et présentation de la boutique.", visibility: "showHero" },
  benefits: { label: "Arguments de confiance", hint: "Paiement, livraison et garanties.", visibility: "showBenefits" },
  categories: { label: "Catégories", hint: "Accès rapide aux catégories de produits.", visibility: "showCategories" },
  products: { label: "Produits", hint: "Catalogue des produits disponibles.", visibility: "showProducts" },
  footer: { label: "Pied de page", hint: "Informations affichées en bas de page.", visibility: "showFooter" },
};

const TEXT_BLOCK_LABELS: Record<StoreTextBlockType, string> = {
  display: "Grand titre",
  heading: "Titre",
  body: "Texte",
  caption: "Petit texte",
};

function LogoUploader({ theme, set }: { theme: StoreTheme; set: (patch: Partial<StoreTheme>) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function importLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choisissez une image pour votre logo");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le logo doit peser moins de 2 Mo");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      set({ logo: reader.result });
      toast.success("Logo importé");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={importLogo} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex min-h-32 w-full cursor-pointer items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/40 p-4 text-center transition-colors hover:bg-muted"
      >
        {theme.logo ? (
          <img src={theme.logo} alt="Logo actuel" className="max-h-24 max-w-[220px] object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
            <ImagePlus className="h-7 w-7" />
            <span className="font-medium text-foreground">Importer un logo</span>
            <span className="text-xs">PNG, JPG, WebP ou SVG · 2 Mo maximum</span>
          </span>
        )}
      </button>
      {theme.logo && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <ImagePlus /> Remplacer
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => set({ logo: "" })}>
            <Trash2 /> Supprimer
          </Button>
        </div>
      )}
    </div>
  );
}

function TextBlockManager({ theme, set }: { theme: StoreTheme; set: (patch: Partial<StoreTheme>) => void }) {
  const [dragged, setDragged] = useState<string | null>(null);

  function updateBlock(id: string, patch: Partial<StoreTextBlock>) {
    set({ textBlocks: theme.textBlocks.map((block) => block.id === id ? { ...block, ...patch } : block) });
  }

  function addBlock() {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `text-${Date.now()}`;
    set({ textBlocks: [...theme.textBlocks, { id, type: "body", text: "Nouveau texte" }] });
  }

  function moveBlock(targetId: string, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!dragged || dragged === targetId) return;
    const next = [...theme.textBlocks];
    const from = next.findIndex((block) => block.id === dragged);
    const to = next.findIndex((block) => block.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    set({ textBlocks: next });
    setDragged(null);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="text-xs text-muted-foreground">Ajoutez, modifiez et réorganisez les textes de la bannière.</p>
        <Button type="button" size="sm" variant="outline" onClick={addBlock}><Plus /> Ajouter</Button>
      </div>
      {theme.textBlocks.map((block) => (
        <div
          key={block.id}
          draggable
          onDragStart={() => setDragged(block.id)}
          onDragEnd={() => setDragged(null)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => moveBlock(block.id, event)}
          className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 rounded-md border bg-muted/30 p-3 ${dragged === block.id ? "opacity-50" : "opacity-100"}`}
        >
          <GripVertical className="mt-2 h-5 w-5 cursor-grab text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 space-y-2">
            <Select value={block.type} onValueChange={(value) => updateBlock(block.id, { type: value as StoreTextBlockType })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.entries(TEXT_BLOCK_LABELS) as [StoreTextBlockType, string][]).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea aria-label={`Contenu du bloc ${TEXT_BLOCK_LABELS[block.type]}`} rows={2} value={block.text} onChange={(event) => updateBlock(block.id, { text: event.target.value })} />
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Supprimer ce bloc" title="Supprimer" onClick={() => set({ textBlocks: theme.textBlocks.filter((item) => item.id !== block.id) })}>
            <Trash2 />
          </Button>
        </div>
      ))}
      {theme.textBlocks.length === 0 && <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">Ajoutez un premier texte à votre bannière.</p>}
    </div>
  );
}

function SectionManager({ theme, set }: { theme: StoreTheme; set: (patch: Partial<StoreTheme>) => void }) {
  const [dragged, setDragged] = useState<StoreSectionId | null>(null);

  function dropOn(target: StoreSectionId, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!dragged || dragged === target) return;
    const next = [...theme.sectionOrder];
    const from = next.indexOf(dragged);
    const to = next.indexOf(target);
    if (from < 0 || to < 0) return;
    next.splice(from, 1);
    next.splice(to, 0, dragged);
    set({ sectionOrder: next });
    setDragged(null);
  }

  return (
    <div className="space-y-2">
      <p className="mb-3 text-xs text-muted-foreground">Saisissez un bloc par sa poignée puis déposez-le à la position souhaitée.</p>
      {theme.sectionOrder.map((id) => {
        const config = SECTION_CONFIG[id];
        const enabled = Boolean(theme[config.visibility]);
        return (
          <div
            key={id}
            draggable
            onDragStart={() => setDragged(id)}
            onDragEnd={() => setDragged(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => dropOn(id, event)}
            className={`flex items-center gap-3 rounded-md border bg-card p-3 transition-opacity ${dragged === id ? "opacity-50" : "opacity-100"}`}
          >
            <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.hint}</p>
            </div>
            <Switch
              aria-label={`${enabled ? "Masquer" : "Afficher"} ${config.label}`}
              checked={enabled}
              onCheckedChange={(checked) => set({ [config.visibility]: checked } as Partial<StoreTheme>)}
            />
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v ?? min)}
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-md border border-border bg-transparent p-1"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function TemplatePreview({ theme }: { theme: StoreTheme }) {
  const pair = fontPairs[theme.fontPair];
  return (
    <div
      className="overflow-hidden rounded-xl border border-border"
      style={{ background: theme.background, color: theme.text }}
    >
      {theme.showAnnouncement && (
        <div
          className="px-3 py-1.5 text-center text-[10px]"
          style={{ background: theme.primary, color: theme.primaryText }}
        >
          {theme.announcement}
        </div>
      )}
      <div className="p-4">
        <p
          style={{
            fontFamily: pair.heading,
            fontSize: `${1.1 * theme.headingScale}rem`,
            textTransform: theme.uppercaseHeadings ? "uppercase" : "none",
            fontWeight: 700,
          }}
        >
          {theme.heroTitle}
        </p>
        <p className="mt-1 text-xs" style={{ fontFamily: pair.body, color: theme.muted }}>
          {theme.heroSubtitle}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                background: theme.surface,
                borderRadius: `${theme.cornerRadius}px`,
                border: theme.cardStyle === "border" ? `1px solid ${theme.muted}33` : undefined,
                boxShadow: theme.cardStyle === "shadow" ? "0 6px 18px rgba(0,0,0,0.08)" : undefined,
              }}
              className="overflow-hidden p-2"
            >
              <div
                className={theme.imageRatio === "portrait" ? "aspect-[3/4]" : theme.imageRatio === "landscape" ? "aspect-[4/3]" : "aspect-square"}
                style={{ background: `${theme.accent}55`, borderRadius: `${theme.cornerRadius / 2}px` }}
              />
              <p className="mt-1 truncate text-[10px]" style={{ fontFamily: pair.body }}>
                Produit
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <span style={{ ...buttonStyleOf(theme), height: 32, fontSize: "0.7rem" }}>
            {theme.buttonLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function AnnouncementManager({ theme, set }: { theme: StoreTheme; set: (patch: Partial<StoreTheme>) => void }) {
  const messages = theme.announcements;

  function updateMessage(index: number, value: string) {
    const next = messages.map((message, i) => (i === index ? value : message));
    set({ announcements: next, announcement: next[0] ?? "" });
  }

  return (
    <div className="space-y-3">
      <ToggleRow
        label="Afficher le bandeau"
        hint="Bandeau placé tout en haut de la boutique."
        checked={theme.showAnnouncement}
        onChange={(v) => set({ showAnnouncement: v })}
      />
      <ToggleRow
        label="Faire défiler les messages"
        hint="Les messages défilent en continu, l'un après l'autre."
        checked={theme.announcementScroll}
        onChange={(v) => set({ announcementScroll: v })}
      />
      {theme.announcementScroll && (
        <SliderField
          label="Vitesse du défilement"
          value={theme.announcementSpeed}
          min={8}
          max={60}
          suffix=" s"
          onChange={(v) => set({ announcementSpeed: v })}
        />
      )}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="text-xs text-muted-foreground">Ajoutez plusieurs messages : ils s'enchaînent dans le bandeau.</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => set({ announcements: [...messages, "Nouveau message"] })}
        >
          <Plus /> Ajouter
        </Button>
      </div>
      {messages.map((message, index) => (
        <div key={index} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <Input
            aria-label={`Message ${index + 1} du bandeau`}
            value={message}
            onChange={(event) => updateMessage(index, event.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Supprimer le message ${index + 1}`}
            onClick={() => {
              const next = messages.filter((_, i) => i !== index);
              set({ announcements: next, announcement: next[0] ?? "" });
            }}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      {messages.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Ajoutez un premier message d'annonce.
        </p>
      )}
    </div>
  );
}

function LegalPagesManager({ theme, set }: { theme: StoreTheme; set: (patch: Partial<StoreTheme>) => void }) {
  const pages = theme.legalPages;

  function updatePage(id: string, patch: Partial<StoreLegalPage>) {
    set({ legalPages: pages.map((page) => (page.id === id ? { ...page, ...patch } : page)) });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Des textes d'exemple sont déjà remplis : modifiez-les librement.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              set({ legalPages: defaultLegalPages });
              toast.success("Textes d'exemple restaurés");
            }}
          >
            <RotateCcw /> Exemples
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `legal-${Date.now()}`;
              set({ legalPages: [...pages, { id, title: "Nouvelle page", content: "", enabled: true }] });
            }}
          >
            <Plus /> Ajouter
          </Button>
        </div>
      </div>
      {pages.map((page) => (
        <div key={page.id} className="space-y-2 rounded-md border bg-muted/30 p-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
            <Input
              aria-label="Titre de la page légale"
              value={page.title}
              onChange={(event) => updatePage(page.id, { title: event.target.value })}
            />
            <Switch
              aria-label={`${page.enabled ? "Masquer" : "Afficher"} ${page.title}`}
              checked={page.enabled}
              onCheckedChange={(checked) => updatePage(page.id, { enabled: checked })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Supprimer ${page.title}`}
              onClick={() => set({ legalPages: pages.filter((item) => item.id !== page.id) })}
            >
              <Trash2 />
            </Button>
          </div>
          <Textarea
            aria-label={`Contenu de ${page.title}`}
            rows={4}
            value={page.content}
            onChange={(event) => updatePage(page.id, { content: event.target.value })}
          />
        </div>
      ))}
      {pages.length === 0 && (
        <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Aucune page légale. Ajoutez-en une ou restaurez les exemples.
        </p>
      )}
    </div>
  );
}
