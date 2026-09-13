import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { commerceService } from "@/services/commerce.service";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients — Sooko" },
      {
        name: "description",
        content:
          "Fichier clients avec téléphone, ville, dépenses totales et taux de confirmation des commandes.",
      },
      { property: "og:title", content: "Clients — Sooko" },
      {
        property: "og:description",
        content: "Identifiez vos meilleurs clients et ceux à risque d'annulation.",
      },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const customers = commerceService.getCustomers();
  const { t } = useLanguage();

  return (
    <AppShell>
      <PageHeader
        title={t("customers")}
        description={t("customersDescription")}
      />
      <div className="grid gap-3 md:hidden">
        {customers.map((c) => (
          <Card key={c.id}><CardContent className="p-4"><div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3"><div className="min-w-0"><p className="truncate font-medium">{c.fullName}</p><p className="text-xs text-muted-foreground">{c.phone} · {c.city}</p></div><span className="font-semibold">{formatMoney(c.totalSpent)}</span></div><dl className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-sm"><div><dt className="text-xs text-muted-foreground">{t("orders")}</dt><dd>{formatNumber(c.ordersCount)}</dd></div><div><dt className="text-xs text-muted-foreground">{t("confirmation")}</dt><dd>{formatPercent(c.confirmationRate)}</dd></div></dl></CardContent></Card>
        ))}
      </div>
      <Card className="hidden md:block">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("customer")}</TableHead>
                 <TableHead>{t("phone")}</TableHead>
                 <TableHead>{t("city")}</TableHead>
                 <TableHead>{t("orders")}</TableHead>
                 <TableHead>{t("spending")}</TableHead>
                 <TableHead>{t("confirmation")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="text-muted-foreground">{c.city}</TableCell>
                  <TableCell>{formatNumber(c.ordersCount)}</TableCell>
                  <TableCell className="font-medium">{formatMoney(c.totalSpent)}</TableCell>
                  <TableCell>{formatPercent(c.confirmationRate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
