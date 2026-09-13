import { Clock, PackageCheck, Truck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import type { Order, OrderStatus } from "@/types";

const toProcess: OrderStatus[] = ["pending", "unreachable", "scheduled", "callback"];

function isToday(iso: string) {
  const d = new Date(iso);
  const n = new Date();
  return (
    d.getFullYear() === n.getFullYear() &&
    d.getMonth() === n.getMonth() &&
    d.getDate() === n.getDate()
  );
}

function Stat({
  icon,
  label,
  count,
  todayCount,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  todayCount: number;
  tone: string;
}) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold leading-tight">{count}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {t("todayStats")} : {todayCount}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function OrderStats({
  orders,
  variant = "seller",
}: {
  orders: Order[];
  variant?: "seller" | "courier";
}) {
  const { t } = useLanguage();
  const buckets = {
    process: orders.filter((o) => toProcess.includes(o.status)),
    shipped: orders.filter((o) => o.status === "shipped"),
    delivered: orders.filter((o) => o.status === "delivered"),
  };

  return (
    <div
      className={`mb-4 grid gap-3 ${variant === "courier" ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3"}`}
    >
      {variant === "seller" && (
        <Stat
          icon={<Clock className="h-5 w-5 text-warning-foreground" />}
          tone="bg-warning/20"
          label={t("statToProcess")}
          count={buckets.process.length}
          todayCount={buckets.process.filter((o) => isToday(o.createdAt)).length}
        />
      )}
      <Stat
        icon={<Truck className="h-5 w-5 text-primary" />}
        tone="bg-primary/10"
        label={variant === "courier" ? t("statToDeliver") : t("statInDelivery")}
        count={buckets.shipped.length}
        todayCount={buckets.shipped.filter((o) => isToday(o.createdAt)).length}
      />
      <Stat
        icon={<PackageCheck className="h-5 w-5 text-success" />}
        tone="bg-success/10"
        label={t("statDelivered")}
        count={buckets.delivered.length}
        todayCount={buckets.delivered.filter((o) => isToday(o.createdAt)).length}
      />
    </div>
  );
}
