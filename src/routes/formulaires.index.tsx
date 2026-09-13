import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Copy, ExternalLink, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";
import { useActiveStoreId, useStores } from "@/services/commerce.store";
import { formsStore, useForms } from "@/services/forms.store";

export const Route = createFileRoute("/formulaires/")({
  head: () => ({
    meta: [
      { title: "Formulaires & intégrations — Sooko" },
      {
        name: "description",
        content:
          "Créez vos formulaires de commande paiement à la livraison et connectez vos pixels publicitaires.",
      },
      { property: "og:title", content: "Formulaires & intégrations — Sooko" },
      {
        property: "og:description",
        content:
          "Formulaires de commande personnalisables, offres quantité, upsells et pixels TikTok ou Facebook.",
      },
    ],
  }),
  component: FormsPage,
});

function FormsPage() {
  const activeStoreId = useActiveStoreId();
  const forms = useForms(activeStoreId);
  const stores = useStores();
  const navigate = useNavigate();
  const activeStore = stores.find((s) => s.id === activeStoreId);

  const storeName = (id: string) => stores.find((s) => s.id === id)?.name ?? "Boutique";

  return (
    <AppShell>
      <PageHeader
        title="Formulaires & intégrations"
        description="Créez vos formulaires de commande et connectez vos outils publicitaires."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/formulaires/integrations">Intégrations</Link>
            </Button>
            <Button asChild>
              <Link to="/formulaires/nouveau">
                <Plus className="mr-2 h-4 w-4" /> Créer un formulaire
              </Link>
            </Button>
          </div>
        }
      />

      {forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Aucun formulaire pour le moment. Créez votre premier formulaire de commande.
            </p>
            <Button asChild>
              <Link to="/formulaires/nouveau">Créer un formulaire</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formulaire</TableHead>
                  <TableHead>Boutique</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Vues</TableHead>
                  <TableHead className="text-right">Commandes</TableHead>
                  <TableHead className="text-right">Conversion</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">
                      <Link
                        to="/formulaires/$formId"
                        params={{ formId: form.id }}
                        className="hover:underline"
                      >
                        {form.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {storeName(form.storeId)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={form.status === "active" ? "default" : "secondary"}>
                        {form.status === "active" ? "Actif" : "Brouillon"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(form.views)}</TableCell>
                    <TableCell className="text-right">{formatNumber(form.submissions)}</TableCell>
                    <TableCell className="text-right">
                      {formatPercent(form.views ? (form.submissions / form.views) * 100 : 0)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(form.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Dupliquer"
                          onClick={() => {
                            formsStore.duplicateForm(form.id);
                            toast.success("Formulaire dupliqué");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Ouvrir"
                          onClick={() =>
                            navigate({
                              to: "/formulaires/$formId",
                              params: { formId: form.id },
                            })
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Supprimer"
                          onClick={() => {
                            formsStore.deleteForm(form.id);
                            toast.success("Formulaire supprimé");
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
