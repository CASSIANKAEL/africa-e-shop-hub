import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { commerceService } from "@/services/commerce.service";
import { formatMoney, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/produits")({
  head: () => ({
    meta: [
      { title: "Produits — Sooko" },
      {
        name: "description",
        content: "Catalogue produits, prix en FCFA et niveaux de stock de vos boutiques.",
      },
      { property: "og:title", content: "Produits — Sooko" },
      {
        property: "og:description",
        content: "Suivez vos prix, vos stocks et vos alertes de rupture produit par produit.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const products = commerceService.getProducts();

  return (
    <AppShell>
      <PageHeader
        title="Produits"
        description="Catalogue partagé entre toutes vos boutiques."
        action={
          <Button>
            <Plus className="mr-1 h-4 w-4" /> Ajouter un produit
          </Button>
        }
      />
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Boutique</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="font-medium">{p.name}</span>
                    <span className="block text-xs text-muted-foreground">{p.category}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {commerceService.getStoreName(p.storeId)}
                  </TableCell>
                  <TableCell className="font-medium">{formatMoney(p.price)}</TableCell>
                  <TableCell>
                    {p.stock === 0 ? (
                      <Badge variant="destructive">Rupture</Badge>
                    ) : p.stock < 10 ? (
                      <Badge variant="secondary">{formatNumber(p.stock)} · faible</Badge>
                    ) : (
                      formatNumber(p.stock)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
