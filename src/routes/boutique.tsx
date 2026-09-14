import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ExternalLink, Palette, RotateCcw, Store as StoreIcon } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
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
import { useActiveStore } from "@/services/commerce.store";
import {
  buttonStyleOf,
  fontPairs,
  storeTemplates,
  themeStore,
  useStoreTheme,
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
  const store = useActiveStore()!;
  const theme = useStoreTheme(storeId);
  const set = (patch: Partial<StoreTheme>) => themeStore.update(storeId, patch);

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

      <Tabs defaultValue="templates">
        <TabsList className="flex w-full flex-wrap justify-start gap-1 sm:w-auto">
          <TabsTrigger value="templates">Modèles</TabsTrigger>
          <TabsTrigger value="layout">Mise en page</TabsTrigger>
          <TabsTrigger value="colors">Couleurs</TabsTrigger>
          <TabsTrigger value="fonts">Typographie</TabsTrigger>
          <TabsTrigger value="buttons">Boutons</TabsTrigger>
          <TabsTrigger value="content">Contenus</TabsTrigger>
        </TabsList>

        {/* -------- Modèles -------- */}
        <TabsContent value="templates" className="mt-4 grid gap-4 md:grid-cols-2">
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
        <TabsContent value="layout" className="mt-4 grid gap-4 lg:grid-cols-2">
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
            <CardContent className="space-y-3">
              <ToggleRow
                label="Bandeau d'annonce"
                hint="Message défilant en haut de la boutique."
                checked={theme.showAnnouncement}
                onChange={(v) => set({ showAnnouncement: v })}
              />
              <ToggleRow
                label="Bannière d'accueil"
                hint="Grand titre de présentation au-dessus des produits."
                checked={theme.showHero}
                onChange={(v) => set({ showHero: v })}
              />
              <ToggleRow
                label="Arguments de confiance"
                hint="Paiement à la livraison, livraison rapide, produits vérifiés."
                checked={theme.showBenefits}
                onChange={(v) => set({ showBenefits: v })}
              />
              <ToggleRow
                label="Filtres par catégorie"
                hint="Liste des catégories au-dessus des produits."
                checked={theme.showCategories}
                onChange={(v) => set({ showCategories: v })}
              />
              <ToggleRow
                label="Pied de page"
                hint="Texte rassurant en bas de la boutique."
                checked={theme.showFooter}
                onChange={(v) => set({ showFooter: v })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------- Couleurs -------- */}
        <TabsContent value="colors" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Palette</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
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
        <TabsContent value="fonts" className="mt-4 grid gap-4 lg:grid-cols-2">
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
                    {(Object.entries(fontPairs) as [StoreTheme["fontPair"], { label: string }][]).map(
                      ([key, pair]) => (
                        <SelectItem key={key} value={key}>
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
        <TabsContent value="buttons" className="mt-4 grid gap-4 lg:grid-cols-2">
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
        <TabsContent value="content" className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Textes de la boutique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Bandeau d'annonce">
                <Input
                  value={theme.announcement}
                  onChange={(e) => set({ announcement: e.target.value })}
                />
              </Field>
              <Field label="Titre de la bannière">
                <Input value={theme.heroTitle} onChange={(e) => set({ heroTitle: e.target.value })} />
              </Field>
              <Field label="Sous-titre de la bannière">
                <Textarea
                  rows={3}
                  value={theme.heroSubtitle}
                  onChange={(e) => set({ heroSubtitle: e.target.value })}
                />
              </Field>
              <Field label="Texte du pied de page">
                <Input value={theme.footerText} onChange={(e) => set({ footerText: e.target.value })} />
              </Field>
              <Button onClick={() => toast.success("Boutique enregistrée")}>Enregistrer</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rendu</CardTitle>
            </CardHeader>
            <CardContent>
              <TemplatePreview theme={theme} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

/* ---------- Petits composants ---------- */

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
