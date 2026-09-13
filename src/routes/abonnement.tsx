import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { commerceService } from "@/services/commerce.service";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/abonnement")({
  head: () => ({
    meta: [
      { title: "Abonnement — Sooko" },
      {
        name: "description",
        content: "Comparez les formules Démarrage, Croissance et Pro, facturées en FCFA par mois.",
      },
      { property: "og:title", content: "Abonnement — Sooko" },
      {
        property: "og:description",
        content: "Choisissez la formule adaptée au volume de commandes de votre commerce.",
      },
    ],
  }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const plans = commerceService.getSubscriptionPlans();
  const { t } = useLanguage();

  return (
    <AppShell>
      <PageHeader
        title={t("subscription")}
        description={t("subscriptionDescription")}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={cn(plan.current && "border-primary shadow-md")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                {plan.current && <Badge>{t("currentPlanBadge")}</Badge>}
              </div>
              <p className="mt-3 font-display text-2xl font-semibold">
                {plan.price === 0 ? t("free") : formatMoney(plan.price, plan.currency)}
                {plan.price > 0 && (
                  <span className="text-sm font-normal text-muted-foreground"> {t("perMonth")}</span>
                )}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-5 w-full"
                variant={plan.current ? "outline" : "default"}
                disabled={plan.current}
              >
                {plan.current ? t("activePlan") : t("choosePlan")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
