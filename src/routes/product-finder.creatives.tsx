import { createFileRoute } from "@tanstack/react-router";
import { CreativeFinder } from "@/components/product-finder/finder-tools";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/product-finder/creatives")({
  head: () => ({ meta: [{ title: "Creative Finder — Product Finder" }, { name: "description", content: "Repérez les angles, formats et créations publicitaires efficaces." }, { property: "og:title", content: "Creative Finder — Product Finder" }, { property: "og:description", content: "Explorez des créations publicitaires par format et angle." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AppShell><PageHeader title="Creative Finder" description="Analysez les formats et les angles publicitaires qui captent l’attention." /><CreativeFinder /></AppShell>,
});