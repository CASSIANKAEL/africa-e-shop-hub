import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle } from "lucide-react";
import { countryDials, whatsappNumber } from "@/lib/countries";
import { useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { formsStore, useAppIntegrations, useWhatsappWidget } from "@/services/forms.store";

export const Route = createFileRoute("/formulaires/integrations")({
  head: () => ({
    meta: [
      { title: "Intégrations — Sooko" },
      {
        name: "description",
        content:
          "Connectez Google Sheets, WhatsApp, SMS, votre transporteur ou un webhook à votre boutique.",
      },
      { property: "og:title", content: "Intégrations — Sooko" },
      {
        property: "og:description",
        content: "Automatisations et outils connectés, boutique par boutique.",
      },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const storeId = useActiveStoreId();
  const activeStore = useActiveStore();
  const integrations = useAppIntegrations(storeId);

  return (
    <AppShell>
      <PageHeader
        title="Intégrations"
        description={`Outils connectés à ${activeStore?.name ?? "la boutique active"}.`}
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
          <CardTitle className="text-base">Outils disponibles</CardTitle>
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
