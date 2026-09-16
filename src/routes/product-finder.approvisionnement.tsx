import { createFileRoute } from "@tanstack/react-router";
import { QuickSourcing } from "@/components/product-finder/finder-tools";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/product-finder/approvisionnement")({
  head: () => ({ meta: [{ title: "Approvisionnement rapide — Product Finder" }, { name: "description", content: "Préparez et suivez vos demandes d’approvisionnement produit." }, { property: "og:title", content: "Approvisionnement rapide — Product Finder" }, { property: "og:description", content: "Centralisez vos besoins d’approvisionnement." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AppShell><PageHeader title="Approvisionnement rapide" description="Enregistrez un produit, la quantité et votre prix cible pour préparer son sourcing." /><QuickSourcing /></AppShell>,
});