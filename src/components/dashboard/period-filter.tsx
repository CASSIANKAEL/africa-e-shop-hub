import { CalendarRange } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type PeriodKey } from "@/services/analytics";
import { useLanguage } from "@/lib/i18n";

export interface PeriodValue {
  period: PeriodKey;
  from?: string;
  to?: string;
}

export function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodValue;
  onChange: (v: PeriodValue) => void;
}) {
  const { t } = useLanguage();
  const labels: Record<PeriodKey, string> = { today: t("today"), yesterday: t("yesterday"), "7d": t("last7Days"), "30d": t("last30Days"), "90d": t("last90Days"), custom: t("customPeriod") };
  return (
    <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
      <Select
        value={value.period}
        onValueChange={(p) => onChange({ ...value, period: p as PeriodKey })}
      >
        <SelectTrigger className="h-10 w-full sm:w-[190px]" aria-label={t("customPeriod")}>
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(labels) as PeriodKey[]).map((k) => (
            <SelectItem key={k} value={k}>
              {labels[k]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.period === "custom" && (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <Input
            type="date"
            className="h-10 min-w-0 w-full"
            aria-label={t("startDate")}
            value={value.from ?? ""}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
          <span className="text-muted-foreground text-sm">{t("until")}</span>
          <Input
            type="date"
            className="h-10 min-w-0 w-full"
            aria-label={t("endDate")}
            value={value.to ?? ""}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
