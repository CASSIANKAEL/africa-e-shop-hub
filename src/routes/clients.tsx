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

  return (
    <AppShell>
      <PageHeader
        title="Clients"
        description="Historique d'achat et fiabilité de confirmation par client."
      />
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Ville</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Dépenses</TableHead>
                <TableHead>Confirmation</TableHead>
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
