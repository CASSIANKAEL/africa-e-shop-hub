import { createFileRoute } from "@tanstack/react-router";
import { TrendsDashboard } from "@/components/product-finder/finder-tools";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/product-finder/tendances")({
  head: () => ({ meta: [{ title: "Tendances principales — Product Finder" }, { name: "description", content: "Comparez les catégories et marchés e-commerce qui progressent." }, { property: "og:title", content: "Tendances principales — Product Finder" }, { property: "og:description", content: "Les signaux produits à suivre sur les marchés africains." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AppShell><PageHeader title="Tendances principales" description="Comparez les catégories selon leur activité, leur engagement et leur progression." /><TrendsDashboard /></AppShell>,
});