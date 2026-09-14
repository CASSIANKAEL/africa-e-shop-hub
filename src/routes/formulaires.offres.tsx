import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { OfferCampaignEditor } from "@/components/forms/offer-campaign-editor";
import { useActiveStore, useActiveStoreId, useProducts } from "@/services/commerce.store";
import {
  blankCampaign,
  formsStore,
  useForms,
  useOfferCampaigns,
} from "@/services/forms.store";
import type { OfferCampaign } from "@/types";

export const Route = createFileRoute("/formulaires/offres")({
  head: () => ({
    meta: [
      { title: "Offres de quantité — Sooko" },
      {
        name: "description",
        content:
          "Créez des offres par quantité sur les produits de votre choix : remises, étiquettes, livraison offerte et ventes additionnelles.",
      },
      { property: "og:title", content: "Offres de quantité — Sooko" },
      {
        property: "og:description",
        content: "Remises par quantité, étiquettes et ventes additionnelles par boutique.",
      },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const storeId = useActiveStoreId();
  const store = useActiveStore();
  const campaigns = useOfferCampaigns(storeId);
  const allProducts = useProducts();
  const products = useMemo(
    () => allProducts.filter((p) => p.storeId === storeId),
    [allProducts, storeId],
  );
  const currency = store?.currency ?? "XOF";
  const [editing, setEditing] = useState<OfferCampaign | null>(null);

  const forms = useForms(storeId);
  const form = forms[0];

  const startNew = () => setEditing(blankCampaign(storeId, campaigns.length));

  return (
    <AppShell>
      <PageHeader
        title="Offres de quantité"
        description={`Remises par lot et ventes additionnelles de ${store?.name ?? "la boutique active"}.`}
        action={
          <div className="flex flex-wrap gap-2">
            {!editing && (
              <Button onClick={startNew}>
                <Plus className="mr-2 h-4 w-4" /> Nouvelle offre
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/formulaires">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Link>
            </Button>
          </div>
        }
      />

      {editing ? (
        <OfferCampaignEditor
          key={editing.id}
          campaign={editing}
          products={products}
          currency={currency}
          onSave={(c) => {
            formsStore.saveCampaign(c);
            setEditing(null);
            toast.success("Offre enregistrée");
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Chaque offre s'applique aux produits que vous choisissez. Activez, dupliquez ou
            modifiez-les à tout moment.
          </p>

          {campaigns.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-start gap-3 p-6">
                <p className="text-sm text-muted-foreground">
                  Aucune offre de quantité pour cette boutique.
                </p>
                <Button onClick={startNew}>
                  <Plus className="mr-2 h-4 w-4" /> Créer ma première offre
                </Button>
              </CardContent>
            </Card>
          )}

          {campaigns.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <Switch
                  checked={c.enabled}
                  aria-label="Activer l'offre"
                  onCheckedChange={() => formsStore.toggleCampaign(c.id)}
                />
                <div className="min-w-[180px] flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.offers.length} offre(s) · appliquée à {c.productIds.length} produit(s)
                  </p>
                </div>
                <Badge variant={c.enabled ? "default" : "secondary"}>
                  {c.enabled ? "Active" : "Inactive"}
                </Badge>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Dupliquer l'offre"
                  onClick={() => {
                    formsStore.duplicateCampaign(c.id);
                    toast.success("Offre dupliquée");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Modifier l'offre"
                  onClick={() => setEditing(c)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Supprimer l'offre"
                  onClick={() => {
                    formsStore.deleteCampaign(c.id);
                    toast.success("Offre supprimée");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}

          {form && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ventes additionnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {form.upsells.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Proposez un produit complémentaire au moment de la commande.
                  </p>
                )}
                {form.upsells.map((u) => (
                  <div key={u.id} className="flex flex-wrap items-center gap-2">
                    <Input
                      className="h-9 max-w-[240px]"
                      value={u.title}
                      onChange={(e) =>
                        formsStore.saveForm({
                          ...form,
                          upsells: form.upsells.map((x) =>
                            x.id === u.id ? { ...x, title: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Input
                      type="number"
                      className="h-9 w-32"
                      value={u.price}
                      onChange={(e) =>
                        formsStore.saveForm({
                          ...form,
                          upsells: form.upsells.map((x) =>
                            x.id === u.id ? { ...x, price: Number(e.target.value) } : x,
                          ),
                        })
                      }
                    />
                    <Switch
                      checked={u.enabled}
                      aria-label="Activer la vente additionnelle"
                      onCheckedChange={(v) =>
                        formsStore.saveForm({
                          ...form,
                          upsells: form.upsells.map((x) =>
                            x.id === u.id ? { ...x, enabled: v } : x,
                          ),
                        })
                      }
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Supprimer la vente additionnelle"
                      onClick={() =>
                        formsStore.saveForm({
                          ...form,
                          upsells: form.upsells.filter((x) => x.id !== u.id),
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() =>
                    formsStore.saveForm({
                      ...form,
                      upsells: [
                        ...form.upsells,
                        {
                          id: `up-${Date.now()}`,
                          title: "Produit complémentaire",
                          price: 0,
                          enabled: true,
                        },
                      ],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Ajouter une vente additionnelle
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
