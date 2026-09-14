import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { GoogleAccountCard, GoogleSheetCard } from "@/components/commerce/google-connect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { formsStore, useGoogleSheets } from "@/services/forms.store";
import type { GoogleSheetColumnMapping, GoogleSheetOrderField } from "@/types";

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

        <ColumnMappingCard
          columns={config.columns}
          disabled={!config.sheet.connected}
          onChange={(columns) => formsStore.setGoogleSheets(storeId, { columns })}
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

const orderFields: { value: GoogleSheetOrderField; label: string; example: string }[] = [
  { value: "empty", label: "Laisser vide", example: "—" },
  { value: "reference", label: "Numéro de commande", example: "CMD-1048" },
  { value: "createdAt", label: "Date et heure", example: "14/09/2026 12:43" },
  { value: "customerName", label: "Nom du client", example: "Aminata Koné" },
  { value: "customerPhone", label: "Téléphone", example: "+225 07 08 09 10 11" },
  { value: "customerCity", label: "Ville", example: "Abidjan" },
  { value: "customerAddress", label: "Adresse", example: "Cocody, Angré 8e tranche" },
  { value: "products", label: "Produits", example: "Sac Awa, Sandales Naya" },
  { value: "quantities", label: "Quantités", example: "1, 2" },
  { value: "total", label: "Montant total", example: "35 000" },
  { value: "currency", label: "Devise", example: "XOF" },
  { value: "paymentMethod", label: "Mode de paiement", example: "Paiement à la livraison" },
  { value: "status", label: "Statut", example: "Confirmée" },
  { value: "comments", label: "Commentaire de commande", example: "Appeler avant la livraison" },
  { value: "courierNote", label: "Commentaire du livreur", example: "Livraison prévue à 16 h" },
];

function columnLetter(index: number) {
  let value = index + 1;
  let result = "";
  while (value > 0) {
    value -= 1;
    result = String.fromCharCode(65 + (value % 26)) + result;
    value = Math.floor(value / 26);
  }
  return result;
}

function ColumnMappingCard({
  columns,
  disabled,
  onChange,
}: {
  columns: GoogleSheetColumnMapping[];
  disabled: boolean;
  onChange: (columns: GoogleSheetColumnMapping[]) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const updateColumn = (id: string, patch: Partial<GoogleSheetColumnMapping>) => {
    onChange(columns.map((column) => (column.id === id ? { ...column, ...patch } : column)));
  };

  const addColumn = () => {
    onChange([
      ...columns,
      { id: `gs-column-${Date.now()}`, header: `Colonne ${columnLetter(columns.length)}`, field: "empty" },
    ]);
  };

  const dropOn = (targetId: string) => {
    if (!draggedId || draggedId === targetId) return;
    const from = columns.findIndex((column) => column.id === draggedId);
    const to = columns.findIndex((column) => column.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...columns];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    onChange(next);
    setDraggedId(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">Mapping des colonnes</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Associez chaque colonne du fichier à une donnée de commande, ou laissez-la vide.
          </p>
        </div>
        <Button variant="outline" size="sm" disabled={disabled} onClick={addColumn}>
          <Plus className="mr-2 h-4 w-4" /> Colonne
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {disabled && (
          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            Connectez d’abord un fichier Google Sheets pour configurer les colonnes.
          </p>
        )}

        <div className="space-y-2">
          {columns.map((column, index) => (
            <div
              key={column.id}
              draggable={!disabled}
              onDragStart={() => setDraggedId(column.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOn(column.id)}
              onDragEnd={() => setDraggedId(null)}
              className="grid grid-cols-[32px_minmax(0,1fr)_40px] items-end gap-2 rounded-lg border p-3 sm:grid-cols-[32px_64px_minmax(140px,1fr)_minmax(190px,1.2fr)_40px]"
            >
              <button
                type="button"
                className="flex h-10 cursor-grab items-center justify-center text-muted-foreground disabled:cursor-not-allowed"
                disabled={disabled}
                aria-label={`Déplacer la colonne ${columnLetter(index)}`}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs">Colonne</Label>
                <div className="mt-2 flex h-10 items-center justify-center rounded-md bg-muted font-semibold">
                  {columnLetter(index)}
                </div>
              </div>
              <div className="col-span-2 space-y-2 sm:col-span-1">
                <Label htmlFor={`header-${column.id}`} className="text-xs">Nom de l’en-tête</Label>
                <Input
                  id={`header-${column.id}`}
                  value={column.header}
                  disabled={disabled}
                  onChange={(event) => updateColumn(column.id, { header: event.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2 sm:col-span-1">
                <Label className="text-xs">Donnée envoyée</Label>
                <Select
                  value={column.field}
                  disabled={disabled}
                  onValueChange={(field) => updateColumn(column.id, { field: field as GoogleSheetOrderField })}
                >
                  <SelectTrigger aria-label={`Donnée de la colonne ${columnLetter(index)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderFields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={disabled || columns.length === 1}
                onClick={() => {
                  onChange(columns.filter((item) => item.id !== column.id));
                  toast.success("Colonne supprimée");
                }}
                aria-label={`Supprimer la colonne ${columnLetter(index)}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-max text-left text-xs">
            <caption className="border-b bg-muted/50 px-3 py-2 text-left font-medium text-foreground">
              Aperçu d’une ligne envoyée
            </caption>
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={column.id} className="border-r px-3 py-2 last:border-r-0">
                    <span className="mr-2 text-muted-foreground">{columnLetter(index)}</span>
                    {column.header || "Sans en-tête"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                {columns.map((column) => (
                  <td key={column.id} className="max-w-56 truncate border-r px-3 py-2 text-muted-foreground last:border-r-0">
                    {orderFields.find((field) => field.value === column.field)?.example ?? "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
