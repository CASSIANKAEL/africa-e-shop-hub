import { createFileRoute } from "@tanstack/react-router";

import { AdExplorer } from "@/components/product-finder/ad-explorer";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/product-finder/publicites")({
  head: () => ({
    meta: [
      { title: "Explorateur de publicités — Product Finder" },
      { name: "description", content: "Recherchez les publicités performantes par plateforme, pays, format et ancienneté." },
      { property: "og:title", content: "Explorateur de publicités — Product Finder" },
      { property: "og:description", content: "Analysez les publicités qui performent sur les marchés africains." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdsPage,
});

function AdsPage() {
  return (
    <AppShell>
      <PageHeader title="Explorateur de publicités" description="Repérez les campagnes actives et les produits qui attirent déjà l’attention." />
      <AdExplorer />
    </AppShell>
  );
}