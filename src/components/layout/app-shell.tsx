import type { ReactNode } from "react";
import { Languages, Search } from "lucide-react";

import { AppSidebar } from "./app-sidebar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { NotificationBell } from "./notification-bell";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languageNames, useLanguage, type AppLanguage } from "@/lib/i18n";
import { useActiveStore } from "@/services/commerce.store";

export function AppShell({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  const store = useActiveStore();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur md:flex md:px-6">
            <SidebarTrigger className="h-10 w-10 shrink-0 md:h-7 md:w-7" />
            <div className="min-w-0 sm:hidden"><p className="truncate text-sm font-semibold">{store?.name ?? "Sooko"}</p><p className="truncate text-[11px] text-muted-foreground">{t("dashboard")}</p></div>
            <div className="relative hidden max-w-sm flex-1 sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                className="pl-9"
                aria-label="Rechercher"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 gap-2 px-2 sm:px-3" aria-label={t("language")}>
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline">{languageNames[language]}</span>
                    <span className="uppercase sm:hidden">{language}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as AppLanguage)}>
                    {(Object.entries(languageNames) as [AppLanguage, string][]).map(([code, label]) => (
                      <DropdownMenuRadioItem key={code} value={code}>{label}</DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <NotificationBell role="admin" />
              <div className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                    HO
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">Henoc O.</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden px-3 py-4 pb-24 md:px-6 md:py-7">{children}</main>
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
