import { formatPercent } from "@/lib/format";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  change?: number;
  icon: LucideIcon;
}) {
  const positive = (change ?? 0) >= 0;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted-foreground">{label}</p>
          <span className="flex h-8 w-8 shrink-0 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-3 break-words font-display text-xl sm:text-2xl font-semibold tracking-tight">{value}</p>
        <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5 text-xs">
          {change !== undefined && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                positive ? "bg-success/15 text-success" : "bg-destructive/10 text-destructive",
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {formatPercent(Math.abs(change))}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
