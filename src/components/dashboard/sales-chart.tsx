import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SalesPoint } from "@/types";
import { formatCompactMoney, formatMoney, formatNumber } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export function RevenueChart({ data }: { data: SalesPoint[] }) {
  const { t } = useLanguage();
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickFormatter={(v: number) => formatCompactMoney(v)}
          tickLine={false}
          axisLine={false}
          width={70}
          fontSize={12}
        />
        <Tooltip
          formatter={(v: number) => [formatMoney(v), t("revenue")]}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-card-foreground)",
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-chart-1)"
          strokeWidth={2.5}
          fill="url(#revGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OrdersChart({ data }: { data: SalesPoint[] }) {
  const { t } = useLanguage();
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} width={32} fontSize={12} />
        <Tooltip
          formatter={(v: number) => [formatNumber(v), t("orders")]}
          cursor={{ fill: "var(--color-muted)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-card-foreground)",
          }}
        />
        <Bar dataKey="orders" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrafficChart({
  data,
}: {
  data: { day: string; visits: number; conversion: number }[];
}) {
  const { t } = useLanguage();
  return (
    <ResponsiveContainer width="100%" height={210}>
      <ComposedChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis yAxisId="left" tickLine={false} axisLine={false} width={44} fontSize={12} />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          width={44}
          fontSize={12}
          tickFormatter={(v: number) => `${v}%`}
        />
        <Tooltip
          formatter={(v: number, name) =>
            name === "conversion"
               ? [`${v} %`, t("conversionRate")]
               : [formatNumber(v), t("visits")]
          }
          contentStyle={{
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-card-foreground)",
          }}
        />
        <Bar
          yAxisId="left"
          dataKey="visits"
          fill="var(--color-chart-3)"
          radius={[6, 6, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="conversion"
          stroke="var(--color-chart-1)"
          strokeWidth={2.5}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
