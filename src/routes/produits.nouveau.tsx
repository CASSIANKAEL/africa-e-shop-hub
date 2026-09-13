import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor, stripHtml } from "@/components/commerce/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { commerceStore, useStores } from "@/services/commerce.store";

export const productCategories = [
  "Mode",
  "Beauté",
  "Bien-être",
  "Santé générale",
  "Électronique",
  "Accessoires",
  "Maison",
  "Alimentation",
  "Sport & fitness",
  "Enfants & bébé",
  "Hygiène",
  "Autre",
];

export const Route = createFileRoute("/produits/nouveau")({
  head: () => ({
    meta: [
      { title: "Nouveau produit — Sooko" },
      {
        name: "description",
        content: "Créez un produit : prix en FCFA, stock, boutiques, description et images.",
      },
      { property: "og:title", content: "Nouveau produit — Sooko" },
      {
        property: "og:description",
        content: "Ajoutez un produit à une ou plusieurs boutiques en quelques secondes.",
      },
    ],
  }),
  component: NewProductPage,
});

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function NewProductPage() {
  const stores = useStores();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [trackStock, setTrackStock] = useState(true);
  const [storeIds, setStoreIds] = useState<string[]>(stores[0] ? [stores[0].id] : []);
  const [category, setCategory] = useState<string>("Mode");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const allSelected = storeIds.length === stores.length && stores.length > 0;

  function toggleStore(id: string, checked: boolean) {
    setStoreIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((s) => s !== id)));
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = await Promise.all(Array.from(files).map(readFile));
    setImages((prev) => [...prev, ...list]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (storeIds.length === 0) {
      toast.error("Choisissez au moins une boutique");
      return;
    }
    const baseSku = sku.trim() || `REF-${Math.floor(Math.random() * 9000 + 1000)}`;
    storeIds.forEach((storeId) => {
      commerceStore.addProduct({
        name: name.trim(),
        sku: baseSku,
        price: Number(price) || 0,
        stock: trackStock ? Number(stock) || 0 : 0,
        trackStock,
        storeId,
        category,
        ...(description.trim() ? { description: description.trim() } : {}),
        ...(images.length ? { images, image: images[0]! } : {}),
      });
    });
    toast.success(
      storeIds.length > 1
        ? `Produit ajouté à ${storeIds.length} boutiques`
        : "Produit ajouté au catalogue",
    );
    void navigate({ to: "/produits" });
  }

  return (
    <AppShell>
      <PageHeader
        title="Nouveau produit"
        description="Renseignez les informations du produit à ajouter au catalogue."
        action={
          <Button variant="outline" asChild>
            <Link to="/produits">
              <ArrowLeft className="mr-1 h-4 w-4" /> Retour au catalogue
            </Link>
          </Button>
        }
      />
      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product-name">Nom du produit</Label>
                <Input
                  id="product-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ensemble pagne wax premium"
                  required
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="product-sku">Référence</Label>
                  <Input
                    id="product-sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="WAX-050"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="product-category">Catégorie</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="product-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-description">Description</Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Décrivez le produit : texte, titres, listes, couleurs, images…"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void handleFiles(e.target.files)}
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="mr-1 h-4 w-4" /> Importer des images
              </Button>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {images.map((src, i) => (
                    <div key={i} className="relative">
                      <img
                        src={src}
                        alt={`Aperçu ${i + 1}`}
                        className="h-20 w-20 rounded-md object-cover"
                      />
                      <button
                        type="button"
                        aria-label="Retirer l'image"
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 self-start">
          <Card>
            <CardHeader>
              <CardTitle>Prix et stock</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="product-price">Prix (FCFA)</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="15000"
                  required
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="pr-3">
                  <Label htmlFor="product-track-stock">Suivi de stock</Label>
                  <p className="text-xs text-muted-foreground">
                    Désactivez pour vendre sans limite d'unités.
                  </p>
                </div>
                <Switch
                  id="product-track-stock"
                  checked={trackStock}
                  onCheckedChange={setTrackStock}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product-stock">Stock</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder={trackStock ? "25" : "Non suivi"}
                  disabled={!trackStock}
                />
              </div>
            </CardContent>
          </Card>

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

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Enregistrer le produit
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/produits">Annuler</Link>
            </Button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
