import { createFileRoute } from "@tanstack/react-router";

import { AdExplorer } from "@/components/product-finder/ad-explorer";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/product-finder/enregistres")({
  head: () => ({
    meta: [
      { title: "Produits enregistrés — Product Finder" },
      { name: "description", content: "Retrouvez les produits et publicités enregistrés dans Product Finder." },
      { property: "og:title", content: "Produits enregistrés — Product Finder" },
      { property: "og:description", content: "Votre sélection de produits et publicités à étudier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  return (
    <AppShell>
      <PageHeader title="Enregistrés" description="Retrouvez ici toutes les opportunités que vous avez sauvegardées." />
      <AdExplorer savedOnly />
    </AppShell>
  );
}