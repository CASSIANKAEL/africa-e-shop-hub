import { createFileRoute, Link } from "@tanstack/react-router";

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
import { paymentLabels } from "@/components/commerce/order-status-badge";
import { OrderStatusSelect } from "@/components/commerce/order-status-select";
import { useOrders } from "@/services/commerce.store";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/commandes/")({
  head: () => ({
    meta: [
      { title: "Commandes — Sooko" },
      {
        name: "description",
        content:
          "Liste des commandes à confirmer, confirmées, en livraison et annulées, avec le mode de paiement.",
      },
      { property: "og:title", content: "Commandes — Sooko" },
      {
        property: "og:description",
        content: "Confirmez vos commandes cash-on-delivery et suivez leur livraison.",
      },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const orders = useOrders();

  return (
    <AppShell>
      <PageHeader
        title="Commandes"
        description="Confirmez, suivez et clôturez les commandes de vos boutiques."
      />
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link to="/commandes/$orderId" params={{ orderId: order.id }}>
                      {order.reference}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {order.customer.fullName}
                    <span className="block text-xs text-muted-foreground">
                      {order.customer.city}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {paymentLabels[order.paymentMethod]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(order.total, order.currency)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusSelect orderId={order.id} status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
