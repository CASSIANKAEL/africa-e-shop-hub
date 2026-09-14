import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Globe } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { formsStore, useAppIntegrations } from "@/services/forms.store";

export const Route = createFileRoute("/formulaires/site")({
  head: () => ({
    meta: [
      { title: "Site — Sooko" },
      {
        name: "description",
        content:
          "Outils connectés au site de votre boutique : Google Sheets, SMS, transporteur et webhook.",
      },
      { property: "og:title", content: "Site — Sooko" },
      {
        property: "og:description",
        content: "Automatisations du site, boutique par boutique.",
      },
    ],
  }),
  component: SitePage,
});

function SitePage() {
  const storeId = useActiveStoreId();
  const activeStore = useActiveStore();
  const integrations = useAppIntegrations(storeId).filter(
    (i) => i.key !== "whatsapp" && i.key !== "google_sheets",
  );

  return (
    <AppShell>
      <PageHeader
        title="Site"
        description={`Outils connectés au site de ${activeStore?.name ?? "la boutique active"}.`}
        action={
          <Button variant="outline" asChild>
            <Link to="/formulaires">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" />
            Outils disponibles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((i) => (
            <div key={i.key} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">{i.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={i.connected ? "default" : "secondary"}>
                    {i.connected ? "Connecté" : "Non connecté"}
                  </Badge>
                  <Switch
                    checked={i.connected}
                    onCheckedChange={() => formsStore.toggleIntegration(storeId, i.key)}
                    aria-label={`Activer ${i.name}`}
                  />
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <Label htmlFor={`int-${i.key}`} className="text-xs">
                  {i.valueLabel}
                </Label>
                <Input
                  id={`int-${i.key}`}
                  value={i.value}
                  placeholder={i.placeholder}
                  onChange={(e) => formsStore.setIntegrationValue(storeId, i.key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
