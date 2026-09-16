import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Clock3, Flame, Heart, MessageCircle, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { productFinderStore, useProductFinderState } from "@/services/product-finder.store";
import { spyAds } from "@/services/spy.mock";

export const Route = createFileRoute("/product-finder/gagnants")({
  head: () => ({
    meta: [
      { title: "Produits gagnants — Product Finder" },
      { name: "description", content: "Classement des produits aux meilleurs signaux publicitaires sur les marchés africains." },
      { property: "og:title", content: "Produits gagnants — Product Finder" },
      { property: "og:description", content: "Comparez les produits prometteurs grâce à leurs signaux de performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WinnersPage,
});

function WinnersPage() {
  const { favorites: saved } = useProductFinderState();
  const winners = [...spyAds]
    .sort((a, b) => (b.likes + b.comments) / Math.max(b.runningDays, 1) - (a.likes + a.comments) / Math.max(a.runningDays, 1))
    .slice(0, 6);

  return (
    <AppShell>
      <PageHeader title="Produits gagnants" description="Les opportunités classées selon leur engagement et leur vitesse de progression." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {winners.map((ad, index) => {
          const velocity = Math.round((ad.likes + ad.comments) / Math.max(ad.runningDays, 1));
          const isSaved = saved.includes(ad.id);
          return (
            <Card key={ad.id} className="overflow-hidden">
              <CardContent className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 p-3 sm:grid-cols-[136px_minmax(0,1fr)] sm:p-4">
                <div className="relative">
                  <img src={ad.image} alt={ad.headline} className="aspect-[4/5] h-full w-full rounded-md object-cover" />
                  <Badge className="absolute left-2 top-2 gap-1"><Flame className="h-3 w-3" /> #{index + 1}</Badge>
                </div>
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{ad.country} · {ad.category}</p>
                      <h2 className="mt-1 line-clamp-2 text-sm font-semibold sm:text-base">{ad.headline}</h2>
                    </div>
                    <Button size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => productFinderStore.toggleFavorite(ad.id)} aria-label={isSaved ? "Retirer des enregistrements" : "Enregistrer le produit"}>
                      {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-2 pt-3 text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground"><Heart className="h-3.5 w-3.5" /> {formatNumber(ad.likes)}</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><MessageCircle className="h-3.5 w-3.5" /> {formatNumber(ad.comments)}</span>
                    <span className="flex items-center gap-1 text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> {ad.runningDays} jours</span>
                    <span className="flex items-center gap-1 font-medium text-primary"><TrendingUp className="h-3.5 w-3.5" /> {formatNumber(velocity)}/jour</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}