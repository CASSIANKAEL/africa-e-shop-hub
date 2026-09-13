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
import { orderStatusLabels, statusesNeedingFollowUp } from "./order-status-badge";
import { commerceStore } from "@/services/commerce.store";
import type { OrderStatus } from "@/types";
import { toast } from "sonner";

const statuses: OrderStatus[] = [
  "pending",
  "unreachable",
  "scheduled",
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
    commerceStore.updateOrderStatus(next === "rejected" ? orderId : orderId, next, {
      followUpAt: null,
    });
    toast.success(`Commande mise à jour : ${orderStatusLabels[next]}`);
  }

  function confirmFollowUp() {
    if (!pending) return;
    if (!when) {
      toast.error("Choisissez une date et une heure de rappel.");
      return;
    }
    commerceStore.updateOrderStatus(pending, pending, undefined as never); // placeholder replaced below
    setPending(null);
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
          className={className ?? "h-9 w-[170px]"}
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

      <Dialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pending ? orderStatusLabels[pending] : ""} — planifier le rappel
            </DialogTitle>
            <DialogDescription>
              Choisissez la date et l'heure auxquelles rappeler le client. La commande remontera en
              haut de la liste à ce moment-là.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="follow-up-at">Date et heure du rappel</Label>
              <Input
                id="follow-up-at"
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow-up-comment">Commentaire (optionnel)</Label>
              <Textarea
                id="follow-up-comment"
                placeholder="Ex. : Client en réunion, rappeler en fin de journée."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (!pending) return;
                if (!when) {
                  toast.error("Choisissez une date et une heure de rappel.");
                  return;
                }
                commerceStore.updateOrderStatus(orderId, pending, {
                  followUpAt: new Date(when).toISOString(),
                  comment,
                });
                toast.success(
                  `${orderStatusLabels[pending]} · rappel le ${new Date(when).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`,
                );
                setPending(null);
              }}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
