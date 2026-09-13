import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Layers, Plug, Target } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, formatPercent } from "@/lib/format";
import { useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { useAppIntegrations, useForms, usePixels } from "@/services/forms.store";

export const Route = createFileRoute("/formulaires/")({
  head: () => ({
    meta: [
      { title: "Formulaires & intégrations — Sooko" },
      {
        name: "description",
        content:
          "Un formulaire de commande par boutique, des pixels publicitaires et des offres par quantité, réunis au même endroit.",
      },
      { property: "og:title", content: "Formulaires & intégrations — Sooko" },
      {
        property: "og:description",
        content:
          "Configurez le formulaire de commande, les pixels et les offres quantité de chaque boutique.",
      },
    ],
  }),
  component: FormsHubPage,
});

function FormsHubPage() {
  const activeStoreId = useActiveStoreId();
  const activeStore = useActiveStore();
  const forms = useForms(activeStoreId);
  const pixels = usePixels(activeStoreId);
  const integrations = useAppIntegrations(activeStoreId);
  const form = forms[0];
  const connected = integrations.filter((i) => i.connected).length;

  const sections = [
    {
      to: "/formulaires/commande" as const,
      icon: FileText,
      title: "Formulaire de commande",
      text: "Affichage pop-up ou intégré, blocs, bouton et page de remerciement. Un seul formulaire par boutique, valable pour tous ses produits.",
      status: form
        ? form.status === "active"
          ? "Actif"
          : "Brouillon"
        : "À créer",
      detail: form
        ? `${formatNumber(form.views)} vues · ${formatPercent(form.views ? (form.submissions / form.views) * 100 : 0)} de conversion`
        : "Aucun formulaire configuré",
    },
    {
      to: "/formulaires/offres" as const,
      icon: Layers,
      title: "Offres de quantité",
      text: "Remises par lot, livraison offerte et ventes additionnelles proposées dans le formulaire.",
      status: `${form?.offers.length ?? 0} offre(s)`,
      detail: `${form?.upsells.length ?? 0} vente(s) additionnelle(s)`,
    },
    {
      to: "/formulaires/pixels" as const,
      icon: Target,
      title: "Pixels publicitaires",
      text: "Meta, TikTok, Snapchat, Google Ads ou Pinterest pour suivre vos campagnes.",
      status: `${pixels.length} pixel(s)`,
      detail: `${pixels.filter((p) => p.enabled).length} actif(s)`,
    },
    {
      to: "/formulaires/integrations" as const,
      icon: Plug,
      title: "Intégrations",
      text: "Google Sheets, WhatsApp, SMS, transporteur ou webhook pour automatiser vos commandes.",
      status: `${connected} connectée(s)`,
      detail: `${integrations.length} disponibles`,
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Formulaires & intégrations"
        description={`Réglages propres à ${activeStore?.name ?? "la boutique active"}. Changez de boutique dans le menu de gauche.`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.to} to={s.to} className="group">
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <Badge variant="secondary">{s.status}</Badge>
                </div>
                <div>
                  <p className="font-display text-base font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </div>
                <p className="mt-auto text-xs text-muted-foreground">{s.detail}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
