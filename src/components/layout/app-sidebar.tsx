import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Store,
  Globe,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Settings,
  Sparkles,
  FileText,
  Plug,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { commerceStore, useActiveStoreId, useStores } from "@/services/commerce.store";

const mainItems = [
  { title: "Tableau de bord", url: "/", icon: LayoutDashboard, exact: true },
  { title: "Vue d'ensemble", url: "/vue-ensemble", icon: Globe },
  { title: "Boutiques", url: "/boutiques", icon: Store },
  { title: "Produits", url: "/produits", icon: Package },
  { title: "Commandes", url: "/commandes", icon: ShoppingCart },
  { title: "Clients", url: "/clients", icon: Users },
  { title: "Formulaires & intégrations", url: "/formulaires", icon: FileText },
] as const;


const accountItems = [
  { title: "Abonnement", url: "/abonnement", icon: CreditCard },
  { title: "Paramètres", url: "/parametres", icon: Settings },
] as const;

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const stores = useStores();
  const activeStoreId = useActiveStoreId();

  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);

  const close = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link to="/" onClick={close} className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          {!collapsed && (
            <span className="flex flex-col leading-tight">
              <span className="font-display text-sm font-semibold">Sooko</span>
              <span className="text-xs text-sidebar-foreground/60">Commerce africain</span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <>
            <Select
              value={activeStoreId}
              onValueChange={(v) => commerceStore.setActiveStore(v)}
            >
              <SelectTrigger className="mt-3 h-9 w-full" aria-label="Changer de boutique">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
                <div className="mt-1 border-t pt-1">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary hover:bg-accent"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={() => setNewStoreOpen(true)}
                  >
                    <Plus className="h-4 w-4" /> Nouvelle boutique
                  </button>
                </div>
              </SelectContent>
            </Select>
            <NewStoreDialog
              trigger={null}
              open={newStoreOpen}
              onOpenChange={setNewStoreOpen}
              switchOnCreate
            />
          </>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pilotage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url, "exact" in item ? item.exact : false)}
                    tooltip={item.title}
                  >
                    <Link to={item.url} onClick={close} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel>Compte</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} onClick={close} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="rounded-xl bg-sidebar-accent p-3">
            <p className="text-xs font-medium text-sidebar-accent-foreground">Plan Croissance</p>
            <p className="mt-1 text-xs text-sidebar-foreground/60">
              Renouvellement le 30 sept. 2026
            </p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
