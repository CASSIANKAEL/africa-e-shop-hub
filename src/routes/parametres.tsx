import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/parametres")({
  head: () => ({
    meta: [
      { title: "Paramètres — Sooko" },
      {
        name: "description",
        content: "Configurez votre profil commerçant, la devise par défaut et les notifications.",
      },
      { property: "og:title", content: "Paramètres — Sooko" },
      {
        property: "og:description",
        content: "Profil, devise FCFA, langue et alertes de commandes à confirmer.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Paramètres" description="Préférences du compte et de la facturation." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil commerçant</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" defaultValue="Henoc ODJI" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone WhatsApp</Label>
              <Input id="phone" defaultValue="+229 97 00 12 34" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Devise par défaut</Label>
              <Select defaultValue="XOF">
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="XOF">FCFA (XOF)</SelectItem>
                  <SelectItem value="XAF">FCFA (XAF)</SelectItem>
                  <SelectItem value="GHS">Cedi (GHS)</SelectItem>
                  <SelectItem value="NGN">Naira (NGN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>Enregistrer</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Toggle label="Nouvelle commande" hint="Alerte WhatsApp immédiate" defaultChecked />
            <Toggle label="Commande à confirmer depuis 24 h" hint="Rappel quotidien" defaultChecked />
            <Toggle label="Stock faible" hint="Seuil de 10 unités" />
            <Toggle label="Rapport hebdomadaire" hint="Chaque lundi matin" defaultChecked />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Toggle({
  label,
  hint,
  defaultChecked,
}: {
  label: string;
  hint: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch defaultChecked={defaultChecked ?? false} />
    </div>
  );
}
