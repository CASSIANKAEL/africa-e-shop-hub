import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Phone, Truck } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderLabels } from "@/components/commerce/order-status-badge";
import {
  commerceStore,
  useActiveStoreId,
  useCouriers,
  useOrders,
} from "@/services/commerce.store";
import { formatDate, formatMoney } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/livraisons")({
  head: () => ({
    meta: [
      { title: "Espace livreur — Sooko" },
      {
        name: "description",
        content:
          "Les commandes confirmées attribuées à chaque livreur, à suivre et à marquer comme livrées.",
      },
      { property: "og:title", content: "Espace livreur — Sooko" },
      {
        property: "og:description",
        content: "Suivez les commandes attribuées et marquez-les livrées en un clic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DeliveriesPage,
});

function DeliveriesPage() {
  const { t } = useLanguage();
  const { statuses: statusLabels } = useOrderLabels();
  const storeId = useActiveStoreId();
  const couriers = useCouriers(storeId);
  const allOrders = useOrders();
  const [courierId, setCourierId] = useState<string>("");

  const selected = courierId || couriers[0]?.id || "";

  const orders = useMemo(
    () =>
      allOrders
        .filter((o) => o.storeId === storeId && o.courierId === selected)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [allOrders, storeId, selected],
  );

  return (
    <AppShell>
      <PageHeader title={t("deliveries")} description={t("deliveriesDescription")} />

      {couriers.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            <Link to="/equipe" className="text-primary underline-offset-2 hover:underline">
              {t("addCourierFirst")}
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 max-w-xs">
            <Select value={selected} onValueChange={setCourierId}>
              <SelectTrigger aria-label={t("chooseCourier")}>
                <SelectValue placeholder={t("chooseCourier")} />
              </SelectTrigger>
              <SelectContent>
                {couriers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <OrderStats orders={orders} variant="courier" />

          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                {t("noAssignedOrders")}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 p-4 pb-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">
                        <Link to="/commandes/$orderId" params={{ orderId: order.id }}>
                          {order.customer.fullName}
                        </Link>
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {order.reference} · {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatMoney(order.total, order.currency)}
                    </span>
                  </CardHeader>
                  <CardContent className="space-y-2 p-4 pt-1">
                    <a
                      href={`tel:${order.customer.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-2 text-sm font-medium text-primary"
                    >
                      <Phone className="h-4 w-4" />
                      {order.customer.phone}
                    </a>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {order.customer.city}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                        <Truck className="mr-1 h-3.5 w-3.5" />
                        {statusLabels[order.status]}
                      </Badge>
                      {order.status !== "delivered" && (
                        <Button
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            commerceStore.updateOrderStatus(order.id, "delivered");
                            toast.success(t("orderDelivered"));
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {t("markDelivered")}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
