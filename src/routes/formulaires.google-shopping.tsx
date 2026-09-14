import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { GoogleAccountCard, GoogleSheetCard } from "@/components/commerce/google-connect";
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
import { countryDials } from "@/lib/countries";
import { useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { formsStore, useGoogleShopping } from "@/services/forms.store";

export const Route = createFileRoute("/formulaires/google-shopping")({
  head: () => ({
    meta: [
      { title: "Google Shopping — Sooko" },
      {
        name: "description",
        content:
          "Connectez un compte Google et un fichier Google Sheets pour publier votre flux produits sur Google Shopping.",
      },
      { property: "og:title", content: "Google Shopping — Sooko" },
      {
        property: "og:description",
        content: "Flux produits Google Shopping de la boutique active.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GoogleShoppingPage,
});

function GoogleShoppingPage() {
  const storeId = useActiveStoreId();
  const activeStore = useActiveStore();
  const config = useGoogleShopping(storeId);

  return (
    <AppShell>
      <PageHeader
        title="Google Shopping"
        description={`Flux produits de ${activeStore?.name ?? "la boutique active"} sur Google Shopping.`}
        action={
          <Button variant="outline" asChild>
            <Link to="/formulaires">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="h-4 w-4 text-primary" />
              Activer Google Shopping
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <p className="text-sm font-medium">Publier les produits sur Google Shopping</p>
                <p className="text-xs text-muted-foreground">
                  Vos produits apparaissent dans les résultats Google Shopping.
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(v) => formsStore.setGoogleShopping(storeId, { enabled: v })}
                aria-label="Activer Google Shopping"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="merchant-id" className="text-xs">
                  Identifiant Merchant Center
                </Label>
                <Input
                  id="merchant-id"
                  value={config.merchantId}
                  placeholder="123456789"
                  onChange={(e) =>
                    formsStore.setGoogleShopping(storeId, { merchantId: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Pays de vente</Label>
                <Select
                  value={config.country}
                  onValueChange={(v) => formsStore.setGoogleShopping(storeId, { country: v })}
                >
                  <SelectTrigger aria-label="Pays de vente">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryDials.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <GoogleAccountCard
          account={config.account}
          description="Le compte Google relié à votre Merchant Center."
          onChange={(patch) =>
            formsStore.setGoogleShopping(storeId, { account: { ...config.account, ...patch } })
          }
        />

        <GoogleSheetCard
          sheet={config.sheet}
          title="Fichier du flux produits"
          disabled={!config.account.connected}
          description="Le fichier Google Sheets qui contient le flux produits envoyé à Google Shopping."
          onChange={(patch) =>
            formsStore.setGoogleShopping(storeId, { sheet: { ...config.sheet, ...patch } })
          }
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mise à jour du flux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <p className="text-sm font-medium">Mettre à jour le flux automatiquement</p>
                <p className="text-xs text-muted-foreground">
                  Prix, stock et images sont renvoyés à Google chaque jour.
                </p>
              </div>
              <Switch
                checked={config.autoSyncFeed}
                disabled={!config.sheet.connected}
                onCheckedChange={(v) => formsStore.setGoogleShopping(storeId, { autoSyncFeed: v })}
                aria-label="Mettre à jour le flux"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
