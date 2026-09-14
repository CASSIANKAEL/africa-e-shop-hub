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
      { title: "WhatsApp — Sooko" },
      {
        name: "description",
        content:
          "Connectez WhatsApp à votre boutique : bouton flottant sur la boutique en ligne et confirmations automatiques.",
      },
      { property: "og:title", content: "WhatsApp — Sooko" },
      {
        property: "og:description",
        content: "Tous les réglages WhatsApp de la boutique, au même endroit.",
      },
    ],
  }),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const storeId = useActiveStoreId();
  const activeStore = useActiveStore();
  const integrations = useAppIntegrations(storeId).filter((i) => i.key === "whatsapp");
  const wa = useWhatsappWidget(storeId);
  const waNumber = whatsappNumber(wa.countryCode, wa.phone);

  return (
    <AppShell>
      <PageHeader
        title="WhatsApp"
        description={`Tous les réglages WhatsApp de ${activeStore?.name ?? "la boutique active"} : bouton sur la boutique en ligne et confirmations automatiques.`}
        action={
          <Button variant="outline" asChild>
            <Link to="/formulaires">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Link>
          </Button>
        }
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            Bouton WhatsApp sur la boutique en ligne
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
            <div>
              <p className="text-sm font-medium">Afficher le bouton WhatsApp</p>
              <p className="text-xs text-muted-foreground">
                Un bouton flottant apparaît en bas de la boutique : le client vous écrit
                directement sur WhatsApp.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={wa.enabled ? "default" : "secondary"}>
                {wa.enabled ? "Activé" : "Désactivé"}
              </Badge>
              <Switch
                checked={wa.enabled}
                onCheckedChange={(v) => formsStore.setWhatsappWidget(storeId, { enabled: v })}
                aria-label="Activer le bouton WhatsApp"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="wa-country">Pays</Label>
              <Select
                value={wa.countryCode}
                onValueChange={(v) => formsStore.setWhatsappWidget(storeId, { countryCode: v })}
              >
                <SelectTrigger id="wa-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {countryDials.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.name} (+{c.dial})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa-phone">Numéro WhatsApp</Label>
              <Input
                id="wa-phone"
                inputMode="tel"
                value={wa.phone}
                placeholder="07 00 00 00 00"
                onChange={(e) => formsStore.setWhatsappWidget(storeId, { phone: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {waNumber ? `Numéro complet : +${waNumber}` : "Saisissez votre numéro."}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa-label">Texte du bouton</Label>
              <Input
                id="wa-label"
                value={wa.label}
                placeholder="Écrivez-nous"
                onChange={(e) => formsStore.setWhatsappWidget(storeId, { label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wa-position">Position</Label>
              <Select
                value={wa.position}
                onValueChange={(v) =>
                  formsStore.setWhatsappWidget(storeId, { position: v as "right" | "left" })
                }
              >
                <SelectTrigger id="wa-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right">En bas à droite</SelectItem>
                  <SelectItem value="left">En bas à gauche</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="wa-message">Message pré-rempli</Label>
              <Input
                id="wa-message"
                value={wa.message}
                placeholder="Bonjour, j'ai une question sur un produit."
                onChange={(e) => formsStore.setWhatsappWidget(storeId, { message: e.target.value })}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-muted/40 p-4">
            <p className="mb-3 text-xs text-muted-foreground">Aperçu du bouton</p>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white shadow-lg">
              <MessageCircle className="h-5 w-5" />
              {wa.label || "Écrivez-nous"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confirmation automatique WhatsApp</CardTitle>
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
