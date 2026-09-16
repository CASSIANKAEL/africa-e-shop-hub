import { createFileRoute } from "@tanstack/react-router";
import { BrandTracker } from "@/components/product-finder/finder-tools";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/product-finder/marques")({
  head: () => ({ meta: [{ title: "Suivi de marque — Product Finder" }, { name: "description", content: "Suivez les publicités et signaux des marques qui vous intéressent." }, { property: "og:title", content: "Suivi de marque — Product Finder" }, { property: "og:description", content: "Surveillez les marques et leurs nouvelles campagnes." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AppShell><PageHeader title="Suivi de marque" description="Surveillez les nouvelles publicités et l’activité des boutiques qui vous intéressent." /><BrandTracker /></AppShell>,
});