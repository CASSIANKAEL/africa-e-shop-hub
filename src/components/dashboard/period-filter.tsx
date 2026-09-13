import { CalendarRange } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { periodLabels, type PeriodKey } from "@/services/analytics";

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
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={value.period}
        onValueChange={(p) => onChange({ ...value, period: p as PeriodKey })}
      >
        <SelectTrigger className="h-9 w-[190px]" aria-label="Période">
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(periodLabels) as PeriodKey[]).map((k) => (
            <SelectItem key={k} value={k}>
              {periodLabels[k]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.period === "custom" && (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="h-9 w-[150px]"
            aria-label="Date de début"
            value={value.from ?? ""}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
          <span className="text-muted-foreground text-sm">au</span>
          <Input
            type="date"
            className="h-9 w-[150px]"
            aria-label="Date de fin"
            value={value.to ?? ""}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
