import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookmarkCheck, Megaphone, Search, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
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
    title: "Produits gagnants",
    description: "Comparez les signaux de performance pour identifier rapidement les meilleures opportunités.",
    icon: TrendingUp,
    to: "/product-finder/gagnants" as const,
    action: "Voir les tendances",
  },
  {
    title: "Enregistrés",
    description: "Regroupez les produits et campagnes que vous souhaitez étudier plus tard.",
    icon: BookmarkCheck,
    to: "/product-finder/enregistres" as const,
    action: "Ouvrir mes favoris",
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
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Publicités analysées</p><p className="mt-1 text-2xl font-semibold">{formatNumber(spyAds.length)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Marchés suivis</p><p className="mt-1 text-2xl font-semibold">{formatNumber(new Set(spyAds.map((ad) => ad.countryCode)).size)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Meilleure tendance</p><p className="mt-1 truncate text-lg font-semibold">{strongest?.category ?? "—"}</p></CardContent></Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3" aria-label="Outils Product Finder">
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
                <p className="mt-1 text-sm text-muted-foreground">{strongest.country} · {formatNumber(strongest.likes + strongest.comments)} interactions</p>
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