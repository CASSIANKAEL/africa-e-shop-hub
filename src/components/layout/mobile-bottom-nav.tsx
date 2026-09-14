import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Menu, Package, Plus, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { t } = useLanguage();
  const { toggleSidebar } = useSidebar();
  const items = [
    { to: "/tableau-de-bord" as const, label: t("mobileHome"), icon: Home },
    { to: "/produits" as const, label: t("products"), icon: Package },
    { to: "/commandes" as const, label: t("orders"), icon: ShoppingCart },
  ];
  const active = (to: string) => to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-lg backdrop-blur md:hidden" aria-label="Navigation mobile">
      <div className="grid grid-cols-5 items-end">
        {items.slice(0, 2).map((item) => (
          <Link key={item.to} to={item.to} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground", active(item.to) && "text-primary")}>
            <item.icon className="h-5 w-5" /><span>{item.label}</span>
          </Link>
        ))}
        <Link to="/produits/nouveau" aria-label={t("addProduct")} className="mx-auto -mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background">
          <Plus className="h-7 w-7" />
        </Link>
        {items.slice(2).map((item) => (
          <Link key={item.to} to={item.to} className={cn("flex min-h-12 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground", active(item.to) && "text-primary")}>
            <item.icon className="h-5 w-5" /><span>{item.label}</span>
          </Link>
        ))}
        <Button variant="ghost" onClick={toggleSidebar} className="flex h-12 flex-col gap-1 rounded-md px-1 text-[11px] font-medium text-muted-foreground">
          <Menu className="h-5 w-5" /><span>{t("mobileMenu")}</span>
        </Button>
      </div>
    </nav>
  );
}
