import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { GoogleAccountCard, GoogleSheetCard } from "@/components/commerce/google-connect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { formsStore, useGoogleSheets } from "@/services/forms.store";

export const Route = createFileRoute("/formulaires/google-sheets")({
  head: () => ({
    meta: [
      { title: "Google Sheets — Sooko" },
      {
        name: "description",
        content:
          "Connectez un compte Google et un fichier Google Sheets pour recevoir automatiquement vos commandes.",
      },
      { property: "og:title", content: "Google Sheets — Sooko" },
      {
        property: "og:description",
        content: "Compte Google et fichier Google Sheets de la boutique active.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GoogleSheetsPage,
});

function GoogleSheetsPage() {
  const storeId = useActiveStoreId();
  const activeStore = useActiveStore();
  const config = useGoogleSheets(storeId);

  return (
    <AppShell>
      <PageHeader
        title="Google Sheets"
        description={`Compte Google et fichier de calcul de ${activeStore?.name ?? "la boutique active"}.`}
        action={
          <Button variant="outline" asChild>
            <Link to="/formulaires">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <GoogleAccountCard
          account={config.account}
          description="Le compte Google donne accès à vos fichiers de calcul."
          onChange={(patch) => formsStore.setGoogleSheets(storeId, { account: { ...config.account, ...patch } })}
        />

        <GoogleSheetCard
          sheet={config.sheet}
          disabled={!config.account.connected}
          description="Chaque nouvelle commande sera ajoutée à ce fichier, ligne par ligne."
          onChange={(patch) => formsStore.setGoogleSheets(storeId, { sheet: { ...config.sheet, ...patch } })}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Synchronisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
              <div>
                <p className="text-sm font-medium">Ajouter chaque commande automatiquement</p>
                <p className="text-xs text-muted-foreground">
                  Nom, numéro, ville, produits, montant et statut sont écrits dans la feuille.
                </p>
              </div>
              <Switch
                checked={config.autoSyncOrders}
                disabled={!config.sheet.connected}
                onCheckedChange={(v) => formsStore.setGoogleSheets(storeId, { autoSyncOrders: v })}
                aria-label="Synchroniser les commandes"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
