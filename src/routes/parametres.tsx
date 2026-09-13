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
import { toast } from "sonner";
import { languageNames, useLanguage, type AppLanguage } from "@/lib/i18n";
import { commerceStore, useActiveStore } from "@/services/commerce.store";
import { currencies, currencyNames } from "@/lib/currencies";
import type { Currency } from "@/types";


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
  const { language, setLanguage, t } = useLanguage();
  const store = useActiveStore();

  return (
    <AppShell>
      <PageHeader title={t("settings")} description={t("profilePreferences")} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("languages")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admin-language">{t("adminLanguage")}</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as AppLanguage)}>
                <SelectTrigger id="admin-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(languageNames) as [AppLanguage, string][]).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t("adminLanguageHint")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-language">
                {t("storeLanguage")}
                {store ? ` — ${store.name}` : ""}
              </Label>
              <Select
                value={store?.language ?? "fr"}
                onValueChange={(v) => {
                  if (!store) return;
                  commerceStore.updateStore(store.id, { language: v as AppLanguage });
                  toast.success("Langue de la boutique mise à jour");
                }}
                disabled={!store}
              >
                <SelectTrigger id="store-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(languageNames) as [AppLanguage, string][]).map(([code, label]) => (
                    <SelectItem key={code} value={code}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t("storeLanguageHint")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("merchantProfile")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fullName")}</Label>
              <Input id="name" defaultValue="Henoc ODJI" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("whatsappPhone")}</Label>
              <Input id="phone" defaultValue="+229 97 00 12 34" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t("defaultCurrency")}</Label>
              <Select value={store?.currency ?? "XOF"} onValueChange={(value) => { if (store) { commerceStore.updateStore(store.id, { currency: value as Currency }); toast.success(t("saved")); } }} disabled={!store}>
                <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                <SelectContent>{currencies.map((code) => <SelectItem key={code} value={code}>{currencyNames[code]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={() => toast.success(t("saved"))}>{t("save")}</Button>
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
