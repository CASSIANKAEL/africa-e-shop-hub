import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderStatusLabels } from "./order-status-badge";
import { commerceStore } from "@/services/commerce.store";
import type { OrderStatus } from "@/types";
import { toast } from "sonner";

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export function OrderStatusSelect({
  orderId,
  status,
  className,
}: {
  orderId: string;
  status: OrderStatus;
  className?: string;
}) {
  return (
    <Select
      value={status}
      onValueChange={(value) => {
        commerceStore.updateOrderStatus(orderId, value as OrderStatus);
        toast.success(`Commande mise à jour : ${orderStatusLabels[value as OrderStatus]}`);
      }}
    >
      <SelectTrigger
        className={className ?? "h-9 w-[160px]"}
        aria-label="Changer le statut de la commande"
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
  );
}
