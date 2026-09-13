import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { commerceStore, useStores } from "@/services/commerce.store";

const categories = ["Mode", "Beauté", "Électronique", "Accessoires", "Maison", "Alimentation"];

export function NewProductDialog() {
  const stores = useStores();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [category, setCategory] = useState(categories[0]);

  function reset() {
    setName("");
    setSku("");
    setPrice("");
    setStock("");
    setCategory(categories[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !storeId) return;
    commerceStore.addProduct({
      name: name.trim(),
      sku: sku.trim() || `REF-${Math.floor(Math.random() * 9000 + 1000)}`,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      storeId,
      category,
    });
    toast.success("Produit ajouté au catalogue");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Ajouter un produit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouveau produit</DialogTitle>
            <DialogDescription>
              Renseignez les informations du produit à ajouter au catalogue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="grid gap-2">
                <Label htmlFor="product-stock">Stock</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="25"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="product-store">Boutique</Label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger id="product-store">
                  <SelectValue placeholder="Choisir une boutique" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Ajouter le produit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
