import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentMethod } from "@/types";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "À confirmer",
  unreachable: "Injoignable",
  scheduled: "Programmée",
  callback: "À rappeler",
  confirmed: "Confirmée",
  shipped: "En livraison",
  delivered: "Livrée",
  rejected: "Rejetée",
  cancelled: "Annulée",
  returned: "Retournée",
};

/** Statuts qui demandent une date/heure de rappel. */
export const statusesNeedingFollowUp: OrderStatus[] = ["unreachable", "scheduled", "callback"];

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/40",
  unreachable: "bg-chart-5/15 text-chart-5 border-chart-5/40",
  scheduled: "bg-chart-2/15 text-chart-2 border-chart-2/40",
  callback: "bg-chart-1/15 text-chart-1 border-chart-1/40",
  confirmed: "bg-success/15 text-success border-success/40",
  shipped: "bg-chart-4/15 text-chart-4 border-chart-4/40",
  delivered: "bg-success/20 text-success border-success/50",
  rejected: "bg-destructive/15 text-destructive border-destructive/50",
  cancelled: "bg-destructive/10 text-destructive border-destructive/40",
  returned: "bg-muted text-muted-foreground border-border",
};

export const paymentLabels: Record<PaymentMethod, string> = {
  cod: "Paiement à la livraison",
  mobile_money: "Mobile Money",
  card: "Carte bancaire",
  transfer: "Virement",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status],
      )}
    >
      {orderStatusLabels[status]}
    </span>
  );
}
