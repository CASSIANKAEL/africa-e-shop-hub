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
        title="Vue d'ensemble"
        description="Données de toutes vos boutiques combinées."
        action={<PeriodFilter value={period} onChange={setPeriod} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Chiffre d'affaires total"
          value={formatMoney(m.revenue)}
          change={m.revenueChange}
          hint="toutes boutiques"
          icon={Banknote}
        />
        <MetricCard
          label="Commandes"
          value={formatNumber(m.ordersVolume)}
          change={m.ordersChange}
          hint="vs période précédente"
          icon={ShoppingBag}
        />
        <MetricCard
          label="Taux de confirmation COD"
          value={formatPercent(m.codConfirmationRate)}
          change={m.codChange}
          hint="paiement à la livraison"
          icon={PhoneCall}
        />
        <MetricCard
          label="Panier moyen"
          value={formatMoney(m.averageBasket)}
          hint={`sur ${formatNumber(m.ordersVolume)} commandes`}
          icon={CheckCircle2}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Visites"
          value={formatNumber(m.visits)}
          change={m.visitsChange}
          hint="toutes boutiques"
          icon={Eye}
        />
        <MetricCard
          label="Taux de conversion"
          value={formatPercent(m.conversionRate)}
          change={m.conversionChange}
          hint={`${formatNumber(m.ordersVolume)} commandes / ${formatNumber(m.visits)} visites`}
          icon={MousePointerClick}
        />
        <MetricCard
          label="Taux de livraison"
          value={formatPercent(m.deliveryRate)}
          hint={`${formatNumber(m.delivered)} livrées sur ${formatNumber(m.confirmed)} confirmées`}
          icon={Truck}
        />
        <MetricCard
          label="Taux de retour"
          value={formatPercent(m.returnRate)}
          hint={`${formatNumber(m.returned)} retours · ${formatMoney(m.revenuePerVisit)} par visite`}
          icon={Undo2}
        />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Visites & taux de conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <TrafficChart data={traffic} />
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Ventes cumulées</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={sales} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Volume de commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <OrdersChart data={sales} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Performance par boutique</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Boutique</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Visites</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead>Chiffre d'affaires</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>À confirmer</TableHead>
                <TableHead>Confirmation COD</TableHead>
                <TableHead>Livraison</TableHead>
                <TableHead>Retours</TableHead>
                <TableHead>Panier moyen</TableHead>
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
                  <TableCell className="font-medium">
                    {formatMoney(metrics.revenue, store.currency)}
                  </TableCell>
                  <TableCell>{formatNumber(metrics.ordersVolume)}</TableCell>
                  <TableCell>{formatNumber(metrics.pending)}</TableCell>
                  <TableCell>{formatPercent(metrics.codConfirmationRate)}</TableCell>
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
