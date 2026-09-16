import { createFileRoute } from "@tanstack/react-router";
import { TutorialPanel } from "@/components/product-finder/finder-tools";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/product-finder/tutoriel")({
  head: () => ({ meta: [{ title: "Tutoriel — Product Finder" }, { name: "description", content: "Apprenez à trouver, comparer et tester une opportunité produit." }, { property: "og:title", content: "Tutoriel — Product Finder" }, { property: "og:description", content: "Le parcours guidé du Product Finder." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AppShell><PageHeader title="Tutoriel Product Finder" description="Suivez le parcours complet, de la recherche d’une idée jusqu’à son test." /><TutorialPanel /></AppShell>,
});