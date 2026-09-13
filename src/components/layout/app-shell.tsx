import type { ReactNode } from "react";
import { Bell, Languages, Search } from "lucide-react";

import { AppSidebar } from "./app-sidebar";
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

export function AppShell({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-3 backdrop-blur md:px-6">
            <SidebarTrigger className="shrink-0" />
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
              <Button variant="ghost" size="icon" aria-label={t("notifications")}>
                <Bell className="h-4 w-4" />
              </Button>
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
          <main className="flex-1 px-3 py-5 md:px-6 md:py-7">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
