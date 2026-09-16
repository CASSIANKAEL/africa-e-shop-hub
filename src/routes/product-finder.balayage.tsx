import { createFileRoute } from "@tanstack/react-router";
import { SwipeFile } from "@/components/product-finder/finder-tools";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/product-finder/balayage")({
  head: () => ({ meta: [{ title: "Fichier de balayage — Product Finder" }, { name: "description", content: "Classez vos publicités et inspirations enregistrées." }, { property: "og:title", content: "Fichier de balayage — Product Finder" }, { property: "og:description", content: "Votre bibliothèque organisée de créations publicitaires." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AppShell><PageHeader title="Fichier de balayage" description="Organisez les publicités enregistrées dans des dossiers prêts à servir d’inspiration." /><SwipeFile /></AppShell>,
});