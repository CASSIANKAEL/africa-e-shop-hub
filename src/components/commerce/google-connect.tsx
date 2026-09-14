import { useState } from "react";
import { Check, FileSpreadsheet, LogOut, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GoogleAccountLink, GoogleSheetLink } from "@/types";

/** Extrait l'identifiant d'un lien Google Sheets (null si le lien est invalide). */
export function sheetIdFromUrl(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? null;
}

export function GoogleAccountCard({
  account,
  onChange,
  description,
}: {
  account: GoogleAccountLink;
  onChange: (patch: Partial<GoogleAccountLink>) => void;
  description: string;
}) {
  const [email, setEmail] = useState(account.email);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCircle2 className="h-4 w-4 text-primary" />
          Compte Google
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">{description}</p>

        {account.connected ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{account.email}</p>
              <p className="text-xs text-muted-foreground">Compte Google connecté</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>
                <Check className="mr-1 h-3 w-3" /> Connecté
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onChange({ connected: false });
                  toast.success("Compte Google déconnecté");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Déconnecter
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border p-4">
            <div className="space-y-2">
              <Label htmlFor="google-email" className="text-xs">
                Adresse Google
              </Label>
              <Input
                id="google-email"
                type="email"
                value={email}
                placeholder="boutique@gmail.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button
              className="w-full sm:w-auto"
              onClick={() => {
                if (!email.includes("@")) {
                  toast.error("Entrez une adresse Google valide");
                  return;
                }
                onChange({ connected: true, email });
                toast.success("Compte Google connecté");
              }}
            >
              Connecter le compte Google
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GoogleSheetCard({
  sheet,
  onChange,
  disabled,
  title = "Fichier Google Sheets",
  description,
}: {
  sheet: GoogleSheetLink;
  onChange: (patch: Partial<GoogleSheetLink>) => void;
  disabled?: boolean;
  title?: string;
  description: string;
}) {
  const [url, setUrl] = useState(sheet.url);
  const [tab, setTab] = useState(sheet.tab);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileSpreadsheet className="h-4 w-4 text-[#188038]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground">{description}</p>

        {disabled && (
          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            Connectez d'abord votre compte Google pour choisir un fichier.
          </p>
        )}

        <div className="space-y-3 rounded-xl border p-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-url" className="text-xs">
              Lien du fichier
            </Label>
            <Input
              id="sheet-url"
              value={url}
              disabled={disabled}
              placeholder="https://docs.google.com/spreadsheets/d/…"
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sheet-tab" className="text-xs">
              Nom de l'onglet
            </Label>
            <Input
              id="sheet-tab"
              value={tab}
              disabled={disabled}
              placeholder="Feuille 1"
              onChange={(e) => setTab(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={disabled}
              onClick={() => {
                if (!sheetIdFromUrl(url)) {
                  toast.error("Lien Google Sheets invalide");
                  return;
                }
                onChange({ connected: true, url, tab: tab.trim() || "Feuille 1" });
                toast.success("Fichier Google Sheets connecté");
              }}
            >
              Connecter le fichier
            </Button>
            {sheet.connected && (
              <>
                <Badge>
                  <Check className="mr-1 h-3 w-3" /> Fichier connecté
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onChange({ connected: false });
                    toast.success("Fichier déconnecté");
                  }}
                >
                  Déconnecter
                </Button>
              </>
            )}
          </div>
          {sheet.connected && (
            <p className="truncate text-xs text-muted-foreground">
              Onglet « {sheet.tab} » — {sheet.url}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
