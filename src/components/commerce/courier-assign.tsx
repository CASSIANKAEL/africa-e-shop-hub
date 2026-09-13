import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { commerceStore, useCouriers } from "@/services/commerce.store";
import { useLanguage } from "@/lib/i18n";
import type { OrderStatus } from "@/types";

const assignableStatuses: OrderStatus[] = ["confirmed", "shipped", "delivered"];

export function CourierAssign({
  orderId,
  status,
  courierId,
  className,
}: {
  orderId: string;
  status: OrderStatus;
  courierId?: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const couriers = useCouriers();

  if (!assignableStatuses.includes(status)) {
    return <span className="text-xs text-muted-foreground">{t("assignAfterConfirm")}</span>;
  }

  if (couriers.length === 0) {
    return (
      <Link to="/equipe" className="text-xs text-primary underline-offset-2 hover:underline">
        {t("addCourierFirst")}
      </Link>
    );
  }

  return (
    <Select
      value={courierId ?? "none"}
      onValueChange={(value) => {
        if (value === "none") {
          commerceStore.assignCourier(orderId, null);
          toast.success(t("courierUnassigned"));
          return;
        }
        commerceStore.assignCourier(orderId, value);
        const name = couriers.find((c) => c.id === value)?.fullName ?? "";
        toast.success(t("courierAssigned", { name }));
      }}
    >
      <SelectTrigger
        className={className ?? "h-10 w-full sm:w-[170px]"}
        aria-label={t("assignCourier")}
        onClick={(e) => e.stopPropagation()}
      >
        <SelectValue placeholder={t("assignCourier")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">{t("noCourier")}</SelectItem>
        {couriers.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
