import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";

import { FormBuilder } from "@/components/forms/form-builder";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formsStore, useOrderForm } from "@/services/forms.store";

export const Route = createFileRoute("/formulaires/$formId")({
  head: () => ({
    meta: [
      { title: "Modifier le formulaire — Sooko" },
      {
        name: "description",
        content: "Modifiez les champs, offres, upsells et réglages de votre formulaire de commande.",
      },
      { property: "og:title", content: "Modifier le formulaire — Sooko" },
      {
        property: "og:description",
        content: "Édition d'un formulaire de commande paiement à la livraison.",
      },
    ],
  }),
  component: EditFormPage,
});

function EditFormPage() {
  const { formId } = useParams({ from: "/formulaires/$formId" });
  const form = useOrderForm(formId);
  const navigate = useNavigate();

  if (!form) {
    return (
      <AppShell>
        <PageHeader title="Formulaire introuvable" description="Ce formulaire n'existe plus." />
        <Card>
          <CardContent className="p-6">
            <Button asChild>
              <Link to="/formulaires">Retour aux formulaires</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title={form.name}
        description="Modifiez votre formulaire et enregistrez les changements."
      />
      <FormBuilder
        key={form.id}
        initial={form}
        saveLabel="Enregistrer les modifications"
        onSave={(next) => {
          formsStore.saveForm(next);
          toast.success("Formulaire mis à jour");
          navigate({ to: "/formulaires" });
        }}
      />
    </AppShell>
  );
}
