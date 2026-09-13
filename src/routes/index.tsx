import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Banknote,
  CheckCircle2,
  Clock,
  PhoneCall,
  ShoppingBag,
  XCircle,
  Package,
  UserPlus,
  CreditCard,
  Eye,
  MousePointerClick,
  Truck,
  Undo2,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { LivePanel } from "@/components/dashboard/live-panel";
import { OrdersChart, RevenueChart, TrafficChart } from "@/components/dashboard/sales-chart";
import { PeriodFilter, type PeriodValue } from "@/components/dashboard/period-filter";
import { OrderStatusBadge } from "@/components/commerce/order-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { commerceService } from "@/services/commerce.service";
import { useActiveStore, useActiveStoreId, useOrders } from "@/services/commerce.store";
import {
  allOrders,
  buildSeries,
  buildTrafficSeries,
  computeMetrics,
  resolveRange,
} from "@/services/analytics";
import { formatDate, formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — Sooko, le SaaS e-commerce africain" },
      {
        name: "description",
        content:
          "Suivez chiffre d'affaires en FCFA, commandes à confirmer et taux de confirmation du paiement à la livraison pour la boutique active.",
      },
      { property: "og:title", content: "Tableau de bord — Sooko" },
      {
        property: "og:description",
        content:
          "Pilotez la boutique active, ses commandes COD et ses ventes en FCFA sur la période de votre choix.",
      },
    ],
  }),
  component: DashboardPage,
});

const activityIcons = {
  order: ShoppingBag,
  stock: Package,
  payment: CreditCard,
  customer: UserPlus,
} as const;

function DashboardPage() {
  const activeStoreId = useActiveStoreId();
  const { t } = useLanguage();
  const activeStore = useActiveStore();
  const liveOrders = useOrders();
  const activity = commerceService.getRecentActivity();
  const [period, setPeriod] = useState<PeriodValue>({ period: "30d" });

  const storeOrders = useMemo(
    () => allOrders(liveOrders).filter((o) => o.storeId === activeStoreId),
    [liveOrders, activeStoreId],
  );
  const range = useMemo(
    () => resolveRange(period.period, { ...(period.from ? { from: period.from } : {}), ...(period.to ? { to: period.to } : {}) }),
    [period],
  );
  const storeIds = useMemo(() => [activeStoreId], [activeStoreId]);
  const m = useMemo(
    () => computeMetrics(storeOrders, range, storeIds),
    [storeOrders, range, storeIds],
  );
  const sales = useMemo(() => buildSeries(storeOrders, range), [storeOrders, range]);
  const traffic = useMemo(
    () => buildTrafficSeries(storeOrders, range, storeIds),
    [storeOrders, range, storeIds],
  );

  const recent = liveOrders.filter((o) => o.storeId === activeStoreId).slice(0, 5);
  const totalStatuses = m.pending + m.confirmed + m.cancelled;
  const currency = activeStore?.currency ?? "XOF";

  return (
    <AppShell>
      <PageHeader
        title={activeStore?.name ?? "Tableau de bord"}
        description={t("activeStoreData")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <PeriodFilter value={period} onChange={setPeriod} />
            <Button variant="outline" asChild>
              <Link to="/vue-ensemble">{t("overviewAction")}</Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          label={t("revenue")}
          value={formatMoney(m.revenue, currency)}
          change={m.revenueChange}
          hint={t("previousPeriod")}
          icon={Banknote}
        />
        <MetricCard
          label={t("orderVolume")}
          value={formatNumber(m.ordersVolume)}
          change={m.ordersChange}
          hint={t("ordersReceived")}
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
          value={formatMoney(m.averageBasket, currency)}
          hint={`sur ${formatNumber(m.ordersVolume)} commandes`}
          icon={CheckCircle2}
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-4">
        <MetricCard
          label={t("visits")}
          value={formatNumber(m.visits)}
          change={m.visitsChange}
          hint={t("storeVisitors")}
          icon={Eye}
        />
        <MetricCard
          label={t("conversionRate")}
          value={formatPercent(m.conversionRate)}
          change={m.conversionChange}
          hint={`${formatNumber(m.ordersVolume)} commandes / ${formatNumber(m.visits)} visites`}
          icon={MousePointerClick}
        />
        <MetricCard
          label={t("deliveryRate")}
          value={formatPercent(m.deliveryRate)}
          hint={`${formatNumber(m.delivered)} livrées sur ${formatNumber(m.confirmed)} confirmées`}
          icon={Truck}
        />
        <MetricCard
          label={t("returnRate")}
          value={formatPercent(m.returnRate)}
          hint={`${formatNumber(m.returned)} retours · ${formatMoney(m.revenuePerVisit, currency)} par visite`}
          icon={Undo2}
        />
      </div>

      <LivePanel
        storeId={activeStoreId}
        currency={currency}
        title={`${t("live")} — ${activeStore?.name ?? t("stores")}`}
      />

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
            <CardTitle className="text-base">{t("periodSales")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={sales} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("orderStatus")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <StatusRow
              icon={<Clock className="h-4 w-4 text-warning" />}
              label={t("toConfirm")}
              value={m.pending}
              total={totalStatuses}
            />
            <StatusRow
              icon={<CheckCircle2 className="h-4 w-4 text-success" />}
              label={t("confirmed")}
              value={m.confirmed}
              total={totalStatuses}
            />
            <StatusRow
              icon={<XCircle className="h-4 w-4 text-destructive" />}
              label={t("cancelled")}
              value={m.cancelled}
              total={totalStatuses}
            />
            <div className="rounded-xl bg-muted p-4">
              <p className="text-xs text-muted-foreground">Objectif de confirmation COD</p>
              <p className="mt-1 font-display text-xl font-semibold">
                {formatPercent(m.codConfirmationRate)} / 85 %
              </p>
              <Progress value={(m.codConfirmationRate / 85) * 100} className="mt-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{t("recentOrders")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/commandes">{t("seeAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recent.map((order) => (
              <Link
                key={order.id}
                to="/commandes/$orderId"
                params={{ orderId: order.id }}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{order.customer.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.reference} · {order.customer.city} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {formatMoney(order.total, order.currency)}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            ))}
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("noRecentOrders")}
              </p>
            )}
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
          <CardTitle className="text-base">{t("recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {activity.map((event) => {
            const Icon = activityIcons[event.type];
            return (
              <div key={event.id} className="flex gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{event.label}</p>
                  <p className="text-xs text-muted-foreground">{event.detail}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/70">{event.time}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function StatusRow({
  icon,
  label,
  value,
  total,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
}) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="font-medium">{formatNumber(value)}</span>
      </div>
      <Progress value={pct} className="mt-2" />
    </div>
  );
}
