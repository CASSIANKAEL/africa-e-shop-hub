import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { FormBuilder } from "@/components/forms/form-builder";
import { useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { formsStore, useForms } from "@/services/forms.store";

export const Route = createFileRoute("/formulaires/offres")({
  head: () => ({
    meta: [
      { title: "Offres de quantité — Sooko" },
      {
        name: "description",
        content:
          "Créez des remises par lot, la livraison offerte et des ventes additionnelles pour votre formulaire de commande.",
      },
      { property: "og:title", content: "Offres de quantité — Sooko" },
      {
        property: "og:description",
        content: "Remises par quantité, livraison offerte et ventes additionnelles par boutique.",
      },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const storeId = useActiveStoreId();
  const store = useActiveStore();
  const forms = useForms(storeId);
  const existing = forms[0];
  const blank = useMemo(() => formsStore.blankForm(storeId), [storeId]);
  const form = existing ?? blank;

  return (
    <AppShell>
      <PageHeader
        title="Offres de quantité"
        description={`Remises par lot et ventes additionnelles de ${store?.name ?? "la boutique active"}.`}
        action={
          <Button variant="outline" asChild>
            <Link to="/formulaires">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Link>
          </Button>
        }
      />
      <FormBuilder
        key={form.id}
        initial={form}
        mode="offers"
        saveLabel="Enregistrer les offres"
        onSave={(f) => {
          formsStore.saveForm({ ...f, storeId });
          toast.success("Offres enregistrées");
        }}
      />
    </AppShell>
  );
}
