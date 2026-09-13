import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { commerceStore } from "@/services/commerce.store";
import { useLanguage } from "@/lib/i18n";

export function CourierNoteButton({ orderId, note }: { orderId: string; note?: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(note ?? "");

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setValue(note ?? "");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" onClick={(e) => e.stopPropagation()}>
          <MessageSquarePlus className="h-4 w-4" />
          {note ? t("courierNote") : t("addCourierNote")}
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{t("courierNote")}</DialogTitle>
          <DialogDescription>{t("courierNoteHint")}</DialogDescription>
        </DialogHeader>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("courierNotePlaceholder")}
          rows={4}
        />
        <DialogFooter className="gap-2 sm:gap-2">
          {note && (
            <Button
              variant="ghost"
              onClick={() => {
                commerceStore.setCourierNote(orderId, null);
                toast.success(t("courierNoteDeleted"));
                setOpen(false);
              }}
            >
              {t("delete")}
            </Button>
          )}
          <Button
            onClick={() => {
              commerceStore.setCourierNote(orderId, value);
              toast.success(t("courierNoteSaved"));
              setOpen(false);
            }}
          >
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
