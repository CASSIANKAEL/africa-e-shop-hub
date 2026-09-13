import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Download, FileUp } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { commerceStore, useStores } from "@/services/commerce.store";
import { formatMoney } from "@/lib/format";

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

const TEMPLATE = "nom,reference,categorie,prix,stock,description\nEnsemble pagne wax,WAX-050,Mode,24500,30,Tissu wax premium\nBeurre de karité 500g,KAR-120,Beauté,6500,80,100% naturel";

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
        price: Number((hasHeader ? get(iPrice) : c[3])?.replace(/[^\d.,-]/g, "").replace(",", ".")) || 0,
        stock: Number((hasHeader ? get(iStock) : c[4])?.replace(/[^\d-]/g, "")) || 0,
        description: hasHeader ? get(iDesc) : (c[5] ?? ""),
      };
    })
    .filter((r) => r.name.length > 0);
}

function ImportProductsPage() {
  const stores = useStores();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState("");
  const [storeIds, setStoreIds] = useState<string[]>(stores[0] ? [stores[0].id] : []);

  const rows = parseCsv(raw);
  const allSelected = storeIds.length === stores.length && stores.length > 0;

  function toggleStore(id: string, checked: boolean) {
    setStoreIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((s) => s !== id)));
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setRaw(await file.text());
    if (fileRef.current) fileRef.current.value = "";
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "modele-produits.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    if (rows.length === 0) {
      toast.error("Aucune ligne valide à importer");
      return;
    }
    if (storeIds.length === 0) {
      toast.error("Choisissez au moins une boutique");
      return;
    }
    rows.forEach((r) => {
      storeIds.forEach((storeId) => {
        commerceStore.addProduct({
          name: r.name,
          sku: r.sku || `REF-${Math.floor(Math.random() * 9000 + 1000)}`,
          price: r.price,
          stock: r.stock,
          trackStock: true,
          storeId,
          category: r.category,
          ...(r.description ? { description: r.description } : {}),
        });
      });
    });
    toast.success(`${rows.length} produit(s) importé(s)`);
    void navigate({ to: "/produits" });
  }

  return (
    <AppShell>
      <PageHeader
        title="Importer des produits par CSV"
        description="Chargez un fichier CSV pour créer plusieurs produits d'un coup."
        action={
          <Button variant="outline" asChild>
            <Link to="/produits">
              <ArrowLeft className="mr-1 h-4 w-4" /> Retour au catalogue
            </Link>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Fichier CSV</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm text-muted-foreground">
                Colonnes attendues : nom, reference, categorie, prix, stock, description.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => void handleFile(e.target.files)}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => fileRef.current?.click()}>
                  <FileUp className="mr-1 h-4 w-4" /> Choisir un fichier CSV
                </Button>
                <Button type="button" variant="outline" onClick={downloadTemplate}>
                  <Download className="mr-1 h-4 w-4" /> Télécharger le modèle
                </Button>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="csv-raw">Ou collez vos lignes ici</Label>
                <Textarea
                  id="csv-raw"
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  rows={8}
                  placeholder={TEMPLATE}
                  className="font-mono text-xs"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aperçu ({rows.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {rows.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  Aucune ligne détectée pour l'instant.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Référence</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell className="text-muted-foreground">{r.sku || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{r.category}</TableCell>
                        <TableCell>{formatMoney(r.price)}</TableCell>
                        <TableCell>{r.stock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 self-start">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Boutiques</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setStoreIds(allSelected ? [] : stores.map((s) => s.id))}
              >
                {allSelected ? "Tout désélectionner" : "Toutes"}
              </Button>
            </CardHeader>
            <CardContent className="grid gap-2">
              {stores.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={storeIds.includes(s.id)}
                    onCheckedChange={(c) => toggleStore(s.id, c === true)}
                  />
                  {s.name}
                </label>
              ))}
            </CardContent>
          </Card>
          <Button onClick={handleImport} disabled={rows.length === 0}>
            Importer {rows.length > 0 ? `${rows.length} produit(s)` : ""}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
