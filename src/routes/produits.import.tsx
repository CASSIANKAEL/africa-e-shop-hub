import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileUp } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { commerceStore, useActiveStore, useActiveStoreId } from "@/services/commerce.store";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/produits/import")({
  head: () => ({
    meta: [
      { title: "Import CSV de produits — Sooko" },
      {
        name: "description",
        content: "Importez votre catalogue en masse depuis un fichier CSV : nom, prix, stock.",
      },
      { property: "og:title", content: "Import CSV de produits — Sooko" },
      {
        property: "og:description",
        content: "Chargez un fichier CSV et ajoutez des dizaines de produits en une fois.",
      },
    ],
  }),
  component: ImportProductsPage,
});

interface Row {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else quoted = !quoted;
    } else if ((ch === "," || ch === ";") && !quoted) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCsv(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = splitLine(lines[0]!).map((h) => h.toLowerCase());
  const idx = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const iName = idx("nom", "name", "produit", "title");
  const iSku = idx("reference", "référence", "sku", "variant sku");
  const iCat = idx("categorie", "catégorie", "category", "product category", "type", "vendor");
  const iPrice = idx("prix", "price", "variant price");
  const iStock = idx("stock", "quantite", "quantité", "variant inventory qty", "inventory qty");
  const iDesc = idx("description", "desc", "body (html)");
  const hasHeader = iName >= 0;
  const body = hasHeader ? lines.slice(1) : lines;

  return body
    .map((line) => {
      const c = splitLine(line);
      const get = (i: number) => (i >= 0 ? (c[i] ?? "") : "");
      return {
        name: hasHeader ? get(iName) : (c[0] ?? ""),
        sku: hasHeader ? get(iSku) : (c[1] ?? ""),
        category: (hasHeader ? get(iCat) : c[2]) || "Autre",
        price:
          Number(
            (hasHeader ? get(iPrice) : c[3])?.replace(/[^\d.,-]/g, "").replace(",", "."),
          ) || 0,
        stock: Number((hasHeader ? get(iStock) : c[4])?.replace(/[^\d-]/g, "")) || 0,
        description: stripHtml(hasHeader ? get(iDesc) : (c[5] ?? "")),
      };
    })
    .filter((r) => r.name.length > 0);
}

function ImportProductsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const activeStoreId = useActiveStoreId();
  const activeStore = useActiveStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState("");

  const rows = parseCsv(raw);

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setRaw(await file.text());
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleImport() {
    if (rows.length === 0 || !activeStoreId) return;
    rows.forEach((r) => {
      commerceStore.addProduct({
        name: r.name,
        sku: r.sku || `REF-${Math.floor(Math.random() * 9000 + 1000)}`,
        price: r.price,
        stock: r.stock,
        trackStock: true,
        storeId: activeStoreId,
        category: r.category,
        ...(r.description ? { description: r.description } : {}),
      });
    });
    toast.success(t("importedCount", { n: rows.length }));
    setRaw("");
    void navigate({ to: "/produits" });
  }

  return (
    <AppShell>
      <PageHeader
        title={t("importTitle")}
        description={t("importDescription")}
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
        <Button variant="secondary" size="sm" asChild>
          <Link to="/produits/import">{t("importCsv")}</Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/produits/ia">{t("addProductAi")}</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-4 sm:p-6">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files)}
          />
          <Button type="button" onClick={() => fileRef.current?.click()} size="lg" className="w-full">
            <FileUp className="mr-2 h-5 w-5" /> {t("chooseCsv")}
          </Button>

          {rows.length > 0 && (
            <p className="text-sm font-medium">
              {rows.length} · {rows[0]?.name}
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            {t("importInto", { store: activeStore?.name ?? "" })}
          </p>

          <Button onClick={handleImport} disabled={rows.length === 0} size="lg" className="w-full">
            {rows.length > 0 ? `${t("save")} (${rows.length})` : t("noRows")}
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
