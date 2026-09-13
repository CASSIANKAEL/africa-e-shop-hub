import { Activity, Radio } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, formatNumber } from "@/lib/format";
import {
  activeVisitors,
  countBySource,
  countByType,
  liveEventLabels,
  perMinuteSeries,
  useRealtime,
} from "@/services/realtime";
import type { Currency } from "@/types";
import { useLanguage } from "@/lib/i18n";

function timeAgo(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `il y a ${s} s`;
  return `il y a ${Math.round(s / 60)} min`;
}

export function LivePanel({
  storeId,
  currency = "XOF",
  title = "Temps réel",
}: {
  storeId?: string;
  currency?: Currency;
  title?: string;
}) {
  const { t } = useLanguage();
  const { events, now } = useRealtime(storeId);
  const series = perMinuteSeries(events, now);
  const active = activeVisitors(events, now);
  const byType = countByType(events);
  const maxType = Math.max(1, ...byType.map((t) => t.count));
  const bySource = countBySource(events).slice(0, 5);
  const maxSource = Math.max(1, ...bySource.map((s) => s.count));
  const purchases = events.filter((e) => e.type === "purchase");
  const liveRevenue = purchases.reduce((sum, e) => sum + e.value, 0);

  return (
    <Card className="mt-4">
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          {title}
        </CardTitle>
        <Badge variant="secondary" className="gap-1">
          <Radio className="h-3 w-3" /> {t("last30Minutes")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">{t("activeVisitors")}</p>
            <p className="mt-1 font-display text-3xl font-semibold tracking-tight">
              {formatNumber(active)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatNumber(events.length)} évènements captés · {formatNumber(purchases.length)}{" "}
              commandes
            </p>
            <p className="mt-3 text-xs text-muted-foreground">{t("liveSales")}</p>
            <p className="font-display text-lg font-semibold">
              {formatMoney(liveRevenue, currency)}
            </p>
          </div>

          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="liveGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} interval={5} />
                <YAxis tickLine={false} axisLine={false} width={28} fontSize={11} />
                <Tooltip
                  formatter={(v: number) => [formatNumber(v), "Évènements"]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                    color: "var(--color-card-foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2.5}
                  fill="url(#liveGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium">{t("triggeredEvents")}</p>
            {byType.map((t) => (
              <div key={t.type}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{liveEventLabels[t.type]}</span>
                  <span className="font-medium">{formatNumber(t.count)}</span>
                </div>
                <Progress value={(t.count / maxType) * 100} className="mt-1.5" />
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">{t("trafficSources")}</p>
            {bySource.map((s) => (
              <div key={s.source}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.source}</span>
                  <span className="font-medium">{formatNumber(s.count)}</span>
                </div>
                <Progress value={(s.count / maxSource) * 100} className="mt-1.5" />
              </div>
            ))}
            {bySource.length === 0 && (
              <p className="text-sm text-muted-foreground">{t("noTraffic")}</p>
            )}
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Activity className="h-4 w-4" /> {t("liveLog")}
          </p>
          <div className="max-h-80 overflow-auto rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                   <TableHead>{t("time")}</TableHead>
                   <TableHead>{t("event")}</TableHead>
                   <TableHead className="hidden sm:table-cell">{t("source")}</TableHead>
                   <TableHead className="hidden md:table-cell">{t("city")}</TableHead>
                   <TableHead className="hidden lg:table-cell">{t("page")}</TableHead>
                   <TableHead className="hidden lg:table-cell">Pixels</TableHead>
                   <TableHead className="text-right">{t("value")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.slice(0, 40).map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {timeAgo(now - e.at)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-medium">
                      {liveEventLabels[e.type]}
                    </TableCell>
                     <TableCell className="hidden text-muted-foreground sm:table-cell">{e.source}</TableCell>
                     <TableCell className="hidden text-muted-foreground md:table-cell">
                      {e.city} · {e.device === "mobile" ? "Mobile" : "Ordinateur"}
                    </TableCell>
                     <TableCell className="hidden text-muted-foreground lg:table-cell">{e.page}</TableCell>
                     <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {e.pixels.map((p) => (
                          <Badge key={p} variant="secondary" className="text-[10px]">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {e.value ? formatMoney(e.value, currency) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {events.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                       {t("connectingLive")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
