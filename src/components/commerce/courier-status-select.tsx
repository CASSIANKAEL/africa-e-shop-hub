import { useState } from "react";
import { toast } from "sonner";

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
import { Textarea } from "@/components/ui/textarea";
import { useOrderLabels } from "./order-status-badge";
import { commerceStore } from "@/services/commerce.store";
import { useLanguage } from "@/lib/i18n";
import type { OrderStatus } from "@/types";

/** Statuts qu'un livreur peut poser depuis son espace. */
const courierStatuses: OrderStatus[] = [
  "shipped",
  "delivered",
  "unreachable",
  "scheduled",
  "returned",
  "cancelled",
];

export function CourierStatusSelect({
  orderId,
  status,
  className,
}: {
  orderId: string;
  status: OrderStatus;
  className?: string;
}) {
  const { t } = useLanguage();
  const { statuses } = useOrderLabels();
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [comment, setComment] = useState("");

  function apply(next: OrderStatus, text?: string) {
    commerceStore.updateOrderStatus(orderId, next, {
      byCourier: true,
      ...(text?.trim() ? { comment: text.trim() } : {}),
    });
    toast.success(
      next === "delivered" ? t("orderDelivered") : `${t("statusUpdated")} · ${statuses[next]}`,
    );
  }

  return (
    <>
      <Select
        value={status}
        onValueChange={(value) => {
          const next = value as OrderStatus;
          if (next === status) return;
          if (next === "delivered" || next === "shipped") {
            apply(next);
            return;
          }
          setComment("");
          setPending(next);
        }}
      >
        <SelectTrigger className={className ?? "h-10 w-full sm:w-[190px]"} aria-label={t("deliveryStatus")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {courierStatuses.map((s) => (
            <SelectItem key={s} value={s}>
              {statuses[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{pending ? statuses[pending] : ""}</DialogTitle>
            <DialogDescription>{t("whyNotDelivered")}</DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("commentPlaceholder")}
          />
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setPending(null)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={() => {
                if (!pending) return;
                if (!comment.trim()) {
                  toast.error(t("commentRequired"));
                  return;
                }
                apply(pending, comment);
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
