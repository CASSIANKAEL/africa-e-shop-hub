import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing } from "lucide-react";


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
import { isFollowUpDue, useOrders } from "@/services/commerce.store";
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
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(() => {
    return [...orders].sort((a, b) => {
      const da = isFollowUpDue(a, now) ? 0 : 1;
      const db = isFollowUpDue(b, now) ? 0 : 1;
      if (da !== db) return da - db;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [orders, now]);

  const dueCount = sorted.filter((o) => isFollowUpDue(o, now)).length;

  return (
    <AppShell>
      <PageHeader
        title="Commandes"
        description={
          dueCount > 0
            ? `${dueCount} commande(s) à rappeler maintenant.`
            : "Confirmez, suivez et clôturez les commandes de vos boutiques."
        }
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
                <TableHead>Rappel</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((order) => (
                <TableRow
                  key={order.id}
                  className={isFollowUpDue(order, now) ? "bg-warning/10" : undefined}
                >
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
