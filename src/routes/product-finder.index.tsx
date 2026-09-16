import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, CircleHelp, FileStack, FolderKanban, Megaphone, PackageSearch, Radar, Search, Shapes, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { spyAds } from "@/services/spy.mock";

export const Route = createFileRoute("/product-finder/")({
  head: () => ({
    meta: [
      { title: "Product Finder — Sooko" },
      { name: "description", content: "Repérez des produits prometteurs et analysez les publicités qui performent sur les marchés africains." },
      { property: "og:title", content: "Product Finder — Sooko" },
      { property: "og:description", content: "Découvrez des idées de produits, des tendances et des publicités performantes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductFinderHome,
});

const tools = [
  {
    title: "Explorateur de publicités",
    description: "Recherchez les campagnes actives par plateforme, pays, format et ancienneté.",
    icon: Megaphone,
    to: "/product-finder/publicites" as const,
    action: "Explorer les publicités",
  },
  {
    title: "Suivi de marque",
    description: "Surveillez les nouvelles publicités des marques et boutiques qui vous intéressent.",
    icon: Radar,
    to: "/product-finder/marques" as const,
    action: "Suivre une marque",
  },
  {
    title: "Fichier de balayage",
    description: "Classez les meilleures créations enregistrées dans vos dossiers d’inspiration.",
    icon: FileStack,
    to: "/product-finder/balayage" as const,
    action: "Ouvrir le fichier",
  },
  {
    title: "Tendances principales",
    description: "Comparez les catégories qui progressent sur les marchés africains.",
    icon: TrendingUp,
    to: "/product-finder/tendances" as const,
    action: "Voir les tendances",
  },
  {
    title: "Agent gagnant IA",
    description: "Évaluez le potentiel, les risques et le meilleur angle de vente d’un produit.",
    icon: Bot,
    to: "/product-finder/agent" as const,
    action: "Lancer une analyse",
  },
  {
    title: "Creative Finder",
    description: "Repérez les formats, angles et créations qui captent le plus l’attention.",
    icon: Shapes,
    to: "/product-finder/creatives" as const,
    action: "Explorer les créations",
  },
  {
    title: "Approvisionnement rapide",
    description: "Préparez vos demandes avec la quantité, le pays et votre prix cible.",
    icon: PackageSearch,
    to: "/product-finder/approvisionnement" as const,
    action: "Créer une demande",
  },
  {
    title: "Mes dossiers",
    description: "Regroupez vos idées et recherches pour préparer vos prochains tests.",
    icon: FolderKanban,
    to: "/product-finder/dossiers" as const,
    action: "Gérer mes dossiers",
  },
  {
    title: "Tutoriel",
    description: "Suivez le parcours guidé pour trouver, analyser et tester une opportunité.",
    icon: CircleHelp,
    to: "/product-finder/tutoriel" as const,
    action: "Commencer le parcours",
  },
];

function ProductFinderHome() {
  const strongest = [...spyAds].sort((a, b) => b.likes + b.comments - (a.likes + a.comments))[0];

  return (
    <AppShell>
      <PageHeader
        title="Product Finder"
        description="Trouvez des produits à fort potentiel avant de les ajouter à votre boutique."
        action={
          <Button asChild className="gap-2">
            <Link to="/product-finder/publicites">
              <Search className="h-4 w-4" /> Rechercher un produit
            </Link>
          </Button>
        }
      />

      <section className="mb-5 grid gap-3 sm:grid-cols-3" aria-label="Indicateurs Product Finder">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Publicités analysées</p><p className="mt-1 text-2xl font-semibold">{spyAds.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Marchés suivis</p><p className="mt-1 text-2xl font-semibold">{new Set(spyAds.map((ad) => ad.countryCode)).size}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Meilleure tendance</p><p className="mt-1 truncate text-lg font-semibold">{strongest?.category ?? "—"}</p></CardContent></Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Outils Product Finder">
        {tools.map((tool) => (
          <Card key={tool.to} className="flex flex-col">
            <CardHeader className="space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <tool.icon className="h-5 w-5" />
              </span>
              <CardTitle className="text-base">{tool.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <p className="flex-1 text-sm text-muted-foreground">{tool.description}</p>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to={tool.to}>{tool.action}<ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {strongest && (
        <section className="mt-5" aria-labelledby="signal-title">
          <Card className="overflow-hidden">
            <CardContent className="grid gap-4 p-4 sm:grid-cols-[96px_1fr_auto] sm:items-center">
              <img src={strongest.image} alt={strongest.headline} className="aspect-square w-24 rounded-md object-cover" />
              <div className="min-w-0">
                <Badge variant="secondary">Signal du moment</Badge>
                <h2 id="signal-title" className="mt-2 truncate font-semibold">{strongest.headline}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{strongest.country} · {new Intl.NumberFormat("fr-FR").format(strongest.likes + strongest.comments)} interactions</p>
              </div>
              <Button asChild variant="outline">
                <Link to="/product-finder/gagnants">Analyser</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </AppShell>
  );
}