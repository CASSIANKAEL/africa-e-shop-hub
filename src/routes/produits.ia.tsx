import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { commerceStore, useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { generateProductsWithAi, type GeneratedProduct } from "@/lib/ai.functions";
import { formatMoney } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/produits/ia")({
  head: () => ({
    meta: [
      { title: "Créer des produits avec l'IA — Sooko" },
      {
        name: "description",
        content: "Décrivez votre activité et laissez l'IA proposer des produits prêts à vendre.",
      },
      { property: "og:title", content: "Créer des produits avec l'IA — Sooko" },
      {
        property: "og:description",
        content: "Générez un catalogue de produits en quelques secondes grâce à l'IA.",
      },
    ],
  }),
  component: AiProductsPage,
});

function AiProductsPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const activeStoreId = useActiveStoreId();
  const activeStore = useActiveStore();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedProduct[]>([]);

  async function handleGenerate() {
    if (prompt.trim().length < 3 || loading) return;
    setLoading(true);
    try {
      const products = await generateProductsWithAi({
        data: {
          prompt: prompt.trim(),
          currency: activeStore?.currency ?? "XOF",
          language,
        },
      });
      if (products.length === 0) {
        toast.error(t("aiError"));
      } else {
        setResults(products);
      }
    } catch {
      toast.error(t("aiError"));
    } finally {
      setLoading(false);
    }
  }

  function updateResult(index: number, patch: Partial<GeneratedProduct>) {
    setResults((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeResult(index: number) {
    setResults((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (results.length === 0 || !activeStoreId) return;
    results.forEach((r) => {
      commerceStore.addProduct({
        name: r.name,
        sku: `IA-${Math.floor(Math.random() * 9000 + 1000)}`,
        price: r.price,
        stock: r.stock,
        trackStock: true,
        storeId: activeStoreId,
        category: r.category || "Autre",
        ...(r.description ? { description: r.description } : {}),
      });
    });
    toast.success(t("importedCount", { n: results.length }));
    void navigate({ to: "/produits" });
  }

  return (
    <AppShell>
      <PageHeader
        title={t("aiTitle")}
        description={t("aiDescription")}
        action={
          <Button variant="outline" asChild>
            <Link to="/produits">
              <ArrowLeft className="mr-1 h-4 w-4" /> {t("backToCatalog")}
            </Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder={t("aiPromptPlaceholder")}
          />
          <Button onClick={() => void handleGenerate()} disabled={loading || prompt.trim().length < 3} size="lg">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {loading ? t("aiGenerating") : t("aiGenerate")}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <div className="grid gap-3">
            {results.map((r, i) => (
              <Card key={i}>
                <CardContent className="grid gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="grid flex-1 gap-3 sm:grid-cols-2">
                      <Input
                        value={r.name}
                        onChange={(e) => updateResult(i, { name: e.target.value })}
                        aria-label={t("productName")}
                      />
                      <Input
                        value={r.category}
                        onChange={(e) => updateResult(i, { category: e.target.value })}
                        aria-label={t("category")}
                      />
                      <Input
                        type="number"
                        value={r.price}
                        onChange={(e) => updateResult(i, { price: Number(e.target.value) || 0 })}
                        aria-label={t("price")}
                      />
                      <Input
                        type="number"
                        value={r.stock}
                        onChange={(e) => updateResult(i, { stock: Number(e.target.value) || 0 })}
                        aria-label={t("stock")}
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeResult(i)} aria-label={t("deleteComment")}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={r.description}
                    onChange={(e) => updateResult(i, { description: e.target.value })}
                    rows={2}
                    aria-label={t("descriptionLabel")}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(r.price, activeStore?.currency)} · {t("stock")} : {r.stock}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            {t("importInto", { store: activeStore?.name ?? "" })}
          </p>
          <Button onClick={handleSave} size="lg" className="w-full">
            {t("save")} ({results.length})
          </Button>
        </>
      )}
    </AppShell>
  );
}
