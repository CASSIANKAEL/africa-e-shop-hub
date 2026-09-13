import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { statusesNeedingFollowUp, useOrderLabels } from "./order-status-badge";
import { commerceStore } from "@/services/commerce.store";
import type { OrderStatus } from "@/types";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n";
import { getActiveLocale } from "@/lib/i18n";

const statuses: OrderStatus[] = [
  "pending",
  "unreachable",
  "scheduled",
  "callback",
  "confirmed",
  "shipped",
  "delivered",
  "rejected",
  "cancelled",
  "returned",
];

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function OrderStatusSelect({
  orderId,
  status,
  currentFollowUpAt,
  className,
}: {
  orderId: string;
  status: OrderStatus;
  currentFollowUpAt?: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const { statuses: orderStatusLabels } = useOrderLabels();
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [when, setWhen] = useState("");
  const [comment, setComment] = useState("");

  function openFollowUp(next: OrderStatus) {
    const base = currentFollowUpAt ? new Date(currentFollowUpAt) : new Date(Date.now() + 3600_000);
    setWhen(toLocalInputValue(base));
    setComment("");
    setPending(next);
  }

  function apply(next: OrderStatus) {
    commerceStore.updateOrderStatus(orderId, next, { followUpAt: null });
    toast.success(t("orderUpdated", { status: orderStatusLabels[next] }));
  }

  return (
    <>
      <Select
        value={status}
        onValueChange={(value) => {
          const next = value as OrderStatus;
          if (statusesNeedingFollowUp.includes(next)) {
            openFollowUp(next);
            return;
          }
          apply(next);
        }}
      >
        <SelectTrigger
          className={className ?? "h-10 w-full sm:w-[170px]"}
          aria-label={t("changeOrderStatus")}
          onClick={(e) => e.stopPropagation()}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {orderStatusLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pending ? orderStatusLabels[pending] : ""} — {t("scheduleReminder")}
            </DialogTitle>
            <DialogDescription>
              {t("reminderHelp")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="follow-up-at">{t("reminderDate")}</Label>
              <Input
                id="follow-up-at"
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow-up-comment">{t("optionalComment")}</Label>
              <Textarea
                id="follow-up-comment"
                placeholder={t("commentPlaceholder")}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => {
                if (!pending) return;
                commerceStore.updateOrderStatus(orderId, pending, {
                  followUpAt: when ? new Date(when).toISOString() : null,
                  comment,
                });
                toast.success(
                  when
                    ? `${orderStatusLabels[pending]} · ${new Date(when).toLocaleString(getActiveLocale(), { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                    : t("orderUpdated", { status: orderStatusLabels[pending] }),
                );
                setPending(null);
              }}
            >
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
