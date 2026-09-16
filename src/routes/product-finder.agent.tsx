import { createFileRoute } from "@tanstack/react-router";
import { WinningAgent } from "@/components/product-finder/finder-tools";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/product-finder/agent")({
  head: () => ({ meta: [{ title: "Agent gagnant IA — Product Finder" }, { name: "description", content: "Évaluez une idée de produit avec une analyse adaptée au marché africain." }, { property: "og:title", content: "Agent gagnant IA — Product Finder" }, { property: "og:description", content: "Analyse assistée des opportunités produits." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AppShell><PageHeader title="Agent gagnant IA" description="Évaluez une idée avant de la tester : potentiel, angle de vente, risques et méthode de lancement." /><WinningAgent /></AppShell>,
});