import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, MapPin, MessageSquare, Phone } from "lucide-react";


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
import { useOrderLabels } from "@/components/commerce/order-status-badge";
import { OrderStatusSelect } from "@/components/commerce/order-status-select";
import { isFollowUpDue, useActiveStoreId, useOrders } from "@/services/commerce.store";
import { formatDate, formatMoney } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";
import { CardHeader, CardTitle } from "@/components/ui/card";

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
  const allOrders = useOrders();
  const { t } = useLanguage();
  const { payments: paymentLabels } = useOrderLabels();
  const activeStoreId = useActiveStoreId();
  const orders = useMemo(
    () => allOrders.filter((o) => o.storeId === activeStoreId),
    [allOrders, activeStoreId],
  );
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
        title={t("orders")}
        description={
          dueCount > 0
            ? t("ordersDueDescription", { n: dueCount })
            : t("ordersDescription")
        }
      />
      <div className="grid gap-3 md:hidden">
        {sorted.map((order) => {
          const lastComment = order.comments?.[order.comments.length - 1];
          return (
          <Card key={order.id} className={isFollowUpDue(order, now) ? "border-warning bg-warning/10" : undefined}>
            <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-4 pb-2">
              <div className="min-w-0"><CardTitle className="truncate text-base"><Link to="/commandes/$orderId" params={{ orderId: order.id }}>{order.customer.fullName}</Link></CardTitle><p className="mt-1 text-xs text-muted-foreground">{order.reference} · {formatDate(order.createdAt)}</p></div>
              <span className="font-semibold">{formatMoney(order.total, order.currency)}</span>
            </CardHeader>
            <CardContent className="space-y-2 p-4 pt-1">
              <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm font-medium text-primary"><Phone className="h-4 w-4" />{order.customer.phone}</a>
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{order.customer.city}</p>
              <p className="text-sm text-muted-foreground">{paymentLabels[order.paymentMethod]}</p>
              {order.followUpAt && <p className="flex items-center gap-1 text-xs text-warning-foreground"><BellRing className="h-3.5 w-3.5" /> {formatDate(order.followUpAt)}</p>}
              {lastComment && (
                <p className="flex items-start gap-2 rounded-lg bg-muted p-2 text-xs text-muted-foreground"><MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="min-w-0">{lastComment.text}</span></p>
              )}
              <OrderStatusSelect orderId={order.id} status={order.status} {...(order.followUpAt ? { currentFollowUpAt: order.followUpAt } : {})} />
            </CardContent>
          </Card>
          );
        })}
      </div>
      <Card className="hidden md:block">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("reference")}</TableHead>
                <TableHead>{t("customers")}</TableHead>
                <TableHead>{t("phone")}</TableHead>
                <TableHead>{t("payment")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("reminder")}</TableHead>
                <TableHead>{t("lastComment")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((order) => {
                const lastComment = order.comments?.[order.comments.length - 1];
                return (
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
                  <TableCell className="whitespace-nowrap">
                    <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`} className="text-primary">
                      {order.customer.phone}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {paymentLabels[order.paymentMethod]}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {order.followUpAt ? (
                      <span
                        className={
                          isFollowUpDue(order, now)
                            ? "inline-flex items-center gap-1 font-medium text-warning-foreground"
                            : "inline-flex items-center gap-1 text-muted-foreground"
                        }
                      >
                        <BellRing className="h-3.5 w-3.5" />
                        {formatDate(order.followUpAt)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[220px] text-xs text-muted-foreground">
                    {lastComment ? (
                      <span className="line-clamp-2">{lastComment.text}</span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(order.total, order.currency)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusSelect
                      orderId={order.id}
                      status={order.status}
                      {...(order.followUpAt ? { currentFollowUpAt: order.followUpAt } : {})}
                    />
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
