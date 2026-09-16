import { createFileRoute } from "@tanstack/react-router";
import { FolderManager } from "@/components/product-finder/finder-tools";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/product-finder/dossiers")({
  head: () => ({ meta: [{ title: "Mes dossiers — Product Finder" }, { name: "description", content: "Organisez les produits et publicités repérés dans vos dossiers." }, { property: "og:title", content: "Mes dossiers — Product Finder" }, { property: "og:description", content: "Vos collections de recherche produit." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AppShell><PageHeader title="Mes dossiers" description="Regroupez vos idées, publicités et pistes de produits par objectif." /><FolderManager /></AppShell>,
});