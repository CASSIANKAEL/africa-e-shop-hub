import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Banknote,
  CheckCircle2,
  Eye,
  MousePointerClick,
  PhoneCall,
  ShoppingBag,
  Truck,
  Undo2,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { OrdersChart, RevenueChart, TrafficChart } from "@/components/dashboard/sales-chart";
import { PeriodFilter, type PeriodValue } from "@/components/dashboard/period-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useOrders, useStores } from "@/services/commerce.store";
import {
  allOrders,
  buildSeries,
  buildTrafficSeries,
  computeMetrics,
  resolveRange,
} from "@/services/analytics";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/vue-ensemble")({
  head: () => ({
    meta: [
      { title: "Vue d'ensemble — Sooko" },
      {
        name: "description",
        content:
          "Chiffre d'affaires, commandes et taux de confirmation COD de toutes vos boutiques combinées, sur la période de votre choix.",
      },
      { property: "og:title", content: "Vue d'ensemble — Sooko" },
      {
        property: "og:description",
        content: "Comparez la performance de toutes vos boutiques africaines au même endroit.",
      },
    ],
  }),
  component: OverviewPage,
});

function OverviewPage() {
  const stores = useStores();
  const { t } = useLanguage();
  const liveOrders = useOrders();
  const [period, setPeriod] = useState<PeriodValue>({ period: "30d" });

  const orders = useMemo(() => allOrders(liveOrders), [liveOrders]);
  const range = useMemo(
    () =>
      resolveRange(period.period, {
        ...(period.from ? { from: period.from } : {}),
        ...(period.to ? { to: period.to } : {}),
      }),
    [period],
  );

  const storeIds = useMemo(() => stores.map((s) => s.id), [stores]);
  const m = useMemo(() => computeMetrics(orders, range, storeIds), [orders, range, storeIds]);
  const sales = useMemo(() => buildSeries(orders, range), [orders, range]);
  const traffic = useMemo(
    () => buildTrafficSeries(orders, range, storeIds),
    [orders, range, storeIds],
  );
  const perStore = useMemo(
    () =>
      stores.map((s) => ({
        store: s,
        metrics: computeMetrics(
          orders.filter((o) => o.storeId === s.id),
          range,
          [s.id],
        ),
      })),
    [stores, orders, range],
  );

  return (
    <AppShell>
      <PageHeader
        title={t("overview")}
        description={t("allStoresData")}
        action={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          label={t("totalRevenue")}
          value={formatMoney(m.revenue)}
          change={m.revenueChange}
          hint={t("allStores")}
          icon={Banknote}
        />
        <MetricCard
          label={t("orders")}
          value={formatNumber(m.ordersVolume)}
          change={m.ordersChange}
          hint={t("previousPeriod")}
          icon={ShoppingBag}
        />
        <MetricCard
          label={t("codRate")}
          value={formatPercent(m.codConfirmationRate)}
          change={m.codChange}
          hint={t("cashOnDelivery")}
          icon={PhoneCall}
        />
        <MetricCard
          label={t("averageBasket")}
          value={formatMoney(m.averageBasket)}
          hint={`${formatNumber(m.ordersVolume)} ${t("ordersReceived")}`}
          icon={CheckCircle2}
        />

      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          label={t("visits")}
          value={formatNumber(m.visits)}
          change={m.visitsChange}
          hint={t("allStores")}
          icon={Eye}
        />
        <MetricCard
          label={t("conversionRate")}
          value={formatPercent(m.conversionRate)}
          change={m.conversionChange}
          hint={`${formatNumber(m.ordersVolume)} ${t("orders")} / ${formatNumber(m.visits)} ${t("visits")}`}
          icon={MousePointerClick}
        />
        <MetricCard
          label={t("deliveryRate")}
          value={formatPercent(m.deliveryRate)}
          hint={`${formatNumber(m.delivered)} / ${formatNumber(m.confirmed)} ${t("confirmed")}`}
          icon={Truck}
        />
        <MetricCard
          label={t("returnRate")}
          value={formatPercent(m.returnRate)}
          hint={`${formatNumber(m.returned)} ${t("returns")} · ${formatMoney(m.revenuePerVisit)}`}
          icon={Undo2}
        />

      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{t("trafficConversion")}</CardTitle>
        </CardHeader>
        <CardContent>
          <TrafficChart data={traffic} />
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("cumulativeSales")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={sales} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("orderVolume")}</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersChart data={sales} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{t("storePerformance")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Boutique</TableHead>
                <TableHead className="hidden lg:table-cell">Statut</TableHead>
                <TableHead>{t("visits")}</TableHead>
                <TableHead className="hidden lg:table-cell">Conversion</TableHead>
                <TableHead>Chiffre d'affaires</TableHead>
                <TableHead>{t("orders")}</TableHead>
                <TableHead className="hidden lg:table-cell">À confirmer</TableHead>
                <TableHead className="hidden lg:table-cell">Confirmation COD</TableHead>
                <TableHead className="hidden lg:table-cell">Livraison</TableHead>
                <TableHead className="hidden lg:table-cell">Retours</TableHead>
                <TableHead>{t("averageBasket")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perStore.map(({ store, metrics }) => (
                <TableRow key={store.id}>
                  <TableCell>
                    <span className="font-medium">{store.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {store.city}, {store.country}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={store.status === "active" ? "secondary" : "outline"}>
                      {store.status === "active" ? "Active" : "En pause"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{formatNumber(metrics.visits)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatPercent(metrics.conversionRate)}</TableCell>
                  <TableCell className="font-medium">
                    {formatMoney(metrics.revenue, store.currency)}
                  </TableCell>
                  <TableCell>{formatNumber(metrics.ordersVolume)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatNumber(metrics.pending)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatPercent(metrics.codConfirmationRate)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatPercent(metrics.deliveryRate)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{formatPercent(metrics.returnRate)}</TableCell>
                  <TableCell>{formatMoney(metrics.averageBasket, store.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
