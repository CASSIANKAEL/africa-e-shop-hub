import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Sparkles, Loader2, Trash2, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { commerceStore, useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { generateProductsWithAi, type GeneratedProduct } from "@/lib/ai.functions";
import { formatMoney } from "@/lib/format";
import { languageNames, useLanguage, type AppLanguage } from "@/lib/i18n";

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
  const [pageLanguage, setPageLanguage] = useState<AppLanguage>(language);
  const [images, setImages] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedProduct[]>([]);

  async function handleImages(files: FileList | null) {
    if (!files) return;
    const next = [...images];
    for (const file of Array.from(files)) {
      if (next.length >= 5 || !file.type.startsWith("image/")) continue;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      next.push(dataUrl);
    }
    setImages(next);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleGenerate() {
    if (prompt.trim().length < 3 || loading) return;
    setLoading(true);
    try {
      const products = await generateProductsWithAi({
        data: {
          prompt: prompt.trim(),
          currency: activeStore?.currency ?? "XOF",
          language: pageLanguage,
          images,
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

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/produits/nouveau">{t("addProductManually")}</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/produits/import">{t("importCsv")}</Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link to="/produits/ia">{t("addProductAi")}</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder={t("aiPromptPlaceholder")}
          />

          <div className="grid gap-1.5">
            <Label htmlFor="ai-page-language">{t("aiProductLanguage")}</Label>
            <Select value={pageLanguage} onValueChange={(v) => setPageLanguage(v as AppLanguage)}>
              <SelectTrigger id="ai-page-language" className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(languageNames) as [AppLanguage, string][]).map(([code, label]) => (
                  <SelectItem key={code} value={code}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>{t("aiImagesLabel")}</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => void handleImages(e.target.files)}
            />
            <div className="flex flex-wrap items-center gap-2">
              {images.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt="" className="h-16 w-16 rounded-md border object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-foreground p-0.5 text-background"
                    aria-label="×"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <ImagePlus className="mr-1 h-4 w-4" /> {t("aiAddImages")}
                </Button>
              )}
            </div>
          </div>

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
