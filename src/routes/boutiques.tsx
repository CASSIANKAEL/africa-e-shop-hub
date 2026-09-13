import { createFileRoute } from "@tanstack/react-router";
import { Plus, Store as StoreIcon } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { commerceService } from "@/services/commerce.service";
import { formatMoney, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/boutiques")({
  head: () => ({
    meta: [
      { title: "Boutiques — Sooko" },
      {
        name: "description",
        content: "Gérez vos boutiques en ligne, leur devise et leur chiffre d'affaires mensuel.",
      },
      { property: "og:title", content: "Boutiques — Sooko" },
      {
        property: "og:description",
        content: "Vue d'ensemble de vos boutiques et de leurs performances mensuelles en FCFA.",
      },
    ],
  }),
  component: StoresPage,
});

function StoresPage() {
  const stores = commerceService.getStores();

  return (
    <AppShell>
      <PageHeader
        title="Boutiques"
        description="Chaque boutique possède son catalogue, sa devise et ses commandes."
        action={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Nouvelle boutique
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <Card key={store.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <StoreIcon className="h-5 w-5" />
                </span>
                <Badge variant={store.status === "active" ? "default" : "secondary"}>
                  {store.status === "active" ? "Active" : "En pause"}
                </Badge>
              </div>
              <h2 className="mt-4 text-lg font-semibold">{store.name}</h2>
              <p className="text-sm text-muted-foreground">
                {store.city}, {store.country} · {store.currency}
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-muted p-3">
                  <dt className="text-xs text-muted-foreground">Produits</dt>
                  <dd className="font-semibold">{formatNumber(store.productsCount)}</dd>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <dt className="text-xs text-muted-foreground">CA du mois</dt>
                  <dd className="font-semibold">
                    {formatMoney(store.monthlyRevenue, store.currency)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
