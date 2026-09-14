import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrderLabels } from "@/components/commerce/order-status-badge";
import { commerceStore, useNotifications } from "@/services/commerce.store";
import { useLanguage } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import type { OrderStatus, TeamRole } from "@/types";

export function NotificationBell({ role = "admin", courierId }: { role?: TeamRole; courierId?: string }) {
  const { t } = useLanguage();
  const { statuses } = useOrderLabels();
  const notifications = useNotifications(role, courierId);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu onOpenChange={(open) => open && unread > 0 && commerceStore.markNotificationsRead()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("notifications")}>
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-96 w-80 overflow-y-auto p-2">
        {notifications.length === 0 ? (
          <p className="p-3 text-sm text-muted-foreground">{t("noNotifications")}</p>
        ) : (
          notifications.map((n) => (
            <Link
              key={n.id}
              to="/commandes/$orderId"
              params={{ orderId: n.orderId }}
              className="block rounded-lg p-2 text-sm hover:bg-muted"
            >
              <p className={n.read ? "text-muted-foreground" : "font-medium"}>
                {t(n.messageKey, {
                  ...n.vars,
                  ...(n.vars?.["status"]
                    ? { status: statuses[n.vars["status"] as OrderStatus] }
                    : {}),
                })}
              </p>
              <p className="text-[11px] text-muted-foreground">{formatDate(n.createdAt)}</p>
            </Link>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
