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
import { commerceStore } from "@/services/commerce.store";
import type { Currency, Store } from "@/types";

const currencies: Currency[] = ["XOF", "XAF", "GHS", "NGN"];

export function NewStoreDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState<Currency>("XOF");
  const [status, setStatus] = useState<Store["status"]>("active");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    commerceStore.addStore({
      name: name.trim(),
      city: city.trim() || "—",
      country: country.trim() || "—",
      currency,
      status,
    });
    toast.success("Boutique créée");
    setName("");
    setCity("");
    setCountry("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Nouvelle boutique
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvelle boutique</DialogTitle>
            <DialogDescription>
              Chaque boutique a son catalogue, sa devise et ses commandes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="store-name">Nom de la boutique</Label>
              <Input
                id="store-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Wax & Co Abidjan"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="store-city">Ville</Label>
                <Input
                  id="store-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Abidjan"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="store-country">Pays</Label>
                <Input
                  id="store-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Côte d'Ivoire"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="store-currency">Devise</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                  <SelectTrigger id="store-currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="store-status">Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Store["status"])}>
                  <SelectTrigger id="store-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">En pause</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Créer la boutique</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
