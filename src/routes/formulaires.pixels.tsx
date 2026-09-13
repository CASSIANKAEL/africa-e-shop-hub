import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { formsStore, usePixels } from "@/services/forms.store";
import type { PixelProvider } from "@/types";

export const Route = createFileRoute("/formulaires/pixels")({
  head: () => ({
    meta: [
      { title: "Pixels publicitaires — Sooko" },
      {
        name: "description",
        content:
          "Ajoutez vos pixels Meta, TikTok, Snapchat, Google Ads ou Pinterest pour suivre les conversions de votre boutique.",
      },
      { property: "og:title", content: "Pixels publicitaires — Sooko" },
      {
        property: "og:description",
        content: "Suivi des conversions publicitaires, boutique par boutique.",
      },
    ],
  }),
  component: PixelsPage,
});

const providerLabels: Record<PixelProvider, string> = {
  facebook: "Meta / Facebook",
  tiktok: "TikTok",
  snapchat: "Snapchat",
  google: "Google Ads",
  pinterest: "Pinterest",
};

const providerEvents: Record<PixelProvider, string[]> = {
  facebook: ["PageView", "ViewContent", "InitiateCheckout", "Purchase"],
  tiktok: ["ViewContent", "AddToCart", "PlaceAnOrder", "CompletePayment"],
  snapchat: ["PAGE_VIEW", "VIEW_CONTENT", "PURCHASE"],
  google: ["page_view", "begin_checkout", "conversion"],
  pinterest: ["pagevisit", "checkout"],
};

function PixelsPage() {
  const storeId = useActiveStoreId();
  const activeStore = useActiveStore();
  const pixels = usePixels(storeId);

  const [provider, setProvider] = useState<PixelProvider>("facebook");
  const [pixelId, setPixelId] = useState("");
  const [label, setLabel] = useState("");

  const addPixel = () => {
    if (!pixelId.trim()) {
      toast.error("Renseignez l'identifiant du pixel.");
      return;
    }
    formsStore.addPixel({
      provider,
      pixelId: pixelId.trim(),
      label: label.trim() || `${providerLabels[provider]} pixel`,
      storeId,
      events: providerEvents[provider],
      enabled: true,
    });
    setPixelId("");
    setLabel("");
    toast.success("Pixel ajouté");
  };

  return (
    <AppShell>
      <PageHeader
        title="Pixels publicitaires"
        description={`Pixels de ${activeStore?.name ?? "la boutique active"}.`}
        action={
          <Button variant="outline" asChild>
            <Link to="/formulaires">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ajouter un pixel</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Plateforme</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as PixelProvider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(providerLabels).map(([value, l]) => (
                  <SelectItem key={value} value={value}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pixel-id">Identifiant du pixel</Label>
            <Input
              id="pixel-id"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="Ex. 8123456789012345"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pixel-label">Nom interne</Label>
            <Input
              id="pixel-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex. Campagne septembre"
            />
          </div>
          <div className="space-y-2">
            <Label>Boutique</Label>
            <div className="flex h-9 items-center rounded-md border px-3 text-sm text-muted-foreground">
              {activeStore?.name ?? "Boutique active"}
            </div>
          </div>
          <div className="sm:col-span-2 xl:col-span-4">
            <Button onClick={addPixel}>
              <Plus className="mr-2 h-4 w-4" /> Ajouter le pixel
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {pixels.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {providerLabels[p.provider]} · {p.pixelId}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Switch
                    checked={p.enabled}
                    onCheckedChange={() => formsStore.togglePixel(p.id)}
                    aria-label="Activer le pixel"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer le pixel"
                    onClick={() => {
                      formsStore.deletePixel(p.id);
                      toast.success("Pixel supprimé");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {p.events.map((e) => (
                  <Badge key={e} variant="secondary">
                    {e}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {pixels.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun pixel configuré pour le moment.</p>
        )}
      </div>
    </AppShell>
  );
}
