import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { FormBuilder } from "@/components/forms/form-builder";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { useActiveStoreId } from "@/services/commerce.store";
import { formsStore } from "@/services/forms.store";

export const Route = createFileRoute("/formulaires/nouveau")({
  head: () => ({
    meta: [
      { title: "Créer un formulaire de commande — Sooko" },
      {
        name: "description",
        content:
          "Composez votre formulaire de commande : champs, offres quantité, upsells, couleurs et options.",
      },
      { property: "og:title", content: "Créer un formulaire de commande — Sooko" },
      {
        property: "og:description",
        content: "Formulaire de commande paiement à la livraison entièrement personnalisable.",
      },
    ],
  }),
  component: NewFormPage,
});

function NewFormPage() {
  const activeStoreId = useActiveStoreId();
  const navigate = useNavigate();
  const [initial] = useState(() => formsStore.blankForm(activeStoreId));

  return (
    <AppShell>
      <PageHeader
        title="Créer un formulaire de commande"
        description="Personnalisez les champs, les offres et l'apparence, puis enregistrez."
      />
      <FormBuilder
        initial={initial}
        saveLabel="Enregistrer le formulaire"
        onSave={(form) => {
          formsStore.saveForm(form);
          toast.success("Formulaire créé");
          navigate({ to: "/formulaires" });
        }}
      />
    </AppShell>
  );
}
