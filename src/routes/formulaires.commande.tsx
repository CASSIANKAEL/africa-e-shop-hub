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

export const Route = createFileRoute("/formulaires/commande")({
  head: () => ({
    meta: [
      { title: "Formulaire de commande — Sooko" },
      {
        name: "description",
        content:
          "Personnalisez le formulaire de commande paiement à la livraison de votre boutique : champs, produits, apparence et options.",
      },
      { property: "og:title", content: "Formulaire de commande — Sooko" },
      {
        property: "og:description",
        content: "Un formulaire de commande unique et entièrement personnalisable par boutique.",
      },
    ],
  }),
  component: OrderFormPage,
});

function OrderFormPage() {
  const storeId = useActiveStoreId();
  const store = useActiveStore();
  const forms = useForms(storeId);
  const existing = forms[0];
  const blank = useMemo(() => formsStore.blankForm(storeId), [storeId]);
  const form = existing ?? blank;

  return (
    <AppShell>
      <PageHeader
        title="Formulaire de commande"
        description={`Le formulaire unique de ${store?.name ?? "la boutique active"}.`}
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
        saveLabel={existing ? "Enregistrer" : "Créer le formulaire"}
        onSave={(f) => {
          formsStore.saveForm({ ...f, storeId });
          toast.success(existing ? "Formulaire enregistré" : "Formulaire créé");
        }}
      />
    </AppShell>
  );
}
