import { useState } from "react";
import { Copy, MoreHorizontal, MoveRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { commerceStore, useStores } from "@/services/commerce.store";
import type { Product } from "@/types";
import { useLanguage } from "@/lib/i18n";

type Mode = "duplicate" | "move" | null;

export function ProductActions({ product }: { product: Product }) {
  const { t } = useLanguage();
  const stores = useStores();
  const others = stores.filter((s) => s.id !== product.storeId);
  const [mode, setMode] = useState<Mode>(null);
  const [targets, setTargets] = useState<string[]>([]);
  const [moveTarget, setMoveTarget] = useState<string>(others[0]?.id ?? "");

  const toggle = (id: string) =>
    setTargets((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]));

  const confirmDuplicate = () => {
    if (targets.length === 0) {
      toast.error(t("chooseStore"));
      return;
    }
    commerceStore.duplicateProduct(product.id, targets);
    toast.success(t("productDuplicatedTo", { name: product.name, n: targets.length }));
    setTargets([]);
    setMode(null);
  };

  const confirmMove = () => {
    if (!moveTarget) return;
    commerceStore.moveProduct(product.id, moveTarget);
    const name = stores.find((s) => s.id === moveTarget)?.name ?? t("store");
    toast.success(t("productMoved", { name: product.name, store: name }));
    setMode(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("actionsFor", { name: product.name })}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              commerceStore.duplicateProduct(product.id, [product.storeId]);
              toast.success(t("productDuplicated"));
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            {t("duplicateHere")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={others.length === 0} onSelect={() => setMode("duplicate")}>
            <Copy className="mr-2 h-4 w-4" />
            {t("duplicateTo")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={others.length === 0} onSelect={() => setMode("move")}>
            <MoveRight className="mr-2 h-4 w-4" />
            {t("moveTo")}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              commerceStore.deleteProduct(product.id);
              toast.success(t("productDeleted"));
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("deleteProduct")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={mode !== null} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "move" ? t("moveProductTitle") : t("duplicateProductTitle")}
            </DialogTitle>
            <DialogDescription>
              {mode === "move"
                ? t("moveProductHint")
                : t("duplicateProductHint", { name: product.name })}
            </DialogDescription>
          </DialogHeader>

          {mode === "duplicate" && (
            <div className="space-y-2">
              {others.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={targets.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
                  {s.name}
                </label>
              ))}
            </div>
          )}

          {mode === "move" && (
            <Select value={moveTarget} onValueChange={setMoveTarget}>
              <SelectTrigger aria-label={t("destinationStore")}>
                <SelectValue placeholder={t("destinationStore")} />
              </SelectTrigger>
              <SelectContent>
                {others.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setMode(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={mode === "move" ? confirmMove : confirmDuplicate}>{t("confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
