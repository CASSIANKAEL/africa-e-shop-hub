import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { AddProductButton } from "@/components/commerce/add-product-button";
import { stripHtml } from "@/components/commerce/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActiveStore, useActiveStoreId, useProducts } from "@/services/commerce.store";
import { ProductActions } from "@/components/commerce/product-actions";
import { formatMoney, formatNumber } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/produits/")({
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
  const allProducts = useProducts();
  const activeStoreId = useActiveStoreId();
  const products = allProducts.filter((p) => p.storeId === activeStoreId);
  const activeStore = useActiveStore();
  const { t } = useLanguage();

  return (
    <AppShell>
      <PageHeader
        title={t("products")}
        description={t("productsCatalogOf", { store: activeStore?.name ?? t("store") })}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/vitrine/$storeId" params={{ storeId: activeStoreId }} target="_blank">
                 <ExternalLink className="mr-2 h-4 w-4" /> {t("viewStore")}
              </Link>
            </Button>
            <AddProductButton />
          </div>
        }
      />
      <div className="grid gap-3 md:hidden">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                <div className="flex min-w-0 gap-3">
                  {p.image && <img src={p.image} alt={p.name} className="h-14 w-14 shrink-0 rounded-md object-cover" />}
                  <div className="min-w-0"><p className="truncate font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category} · {p.sku}</p><p className="mt-1 font-semibold">{formatMoney(p.price, activeStore?.currency)}</p></div>
                </div>
                <ProductActions product={p} />
              </div>
              <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm"><span className="text-muted-foreground">{t("stock")}</span><span>{p.trackStock === false ? t("notTracked") : formatNumber(p.stock)}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="hidden md:block">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("product")}</TableHead>
                <TableHead>{t("reference")}</TableHead>
                <TableHead>{t("price")}</TableHead>
                <TableHead>{t("stock")}</TableHead>
                <TableHead className="w-12 text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.image && (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      )}
                      <div>
                        <span className="font-medium">{p.name}</span>
                        <span className="block text-xs text-muted-foreground">{p.category}</span>
                        {p.description && (
                          <span className="block max-w-xs truncate text-xs text-muted-foreground">
                            {stripHtml(p.description)}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="font-medium">{formatMoney(p.price, activeStore?.currency)}</TableCell>
                  <TableCell>
                    {p.trackStock === false ? (
                      <Badge variant="outline">{t("notTracked")}</Badge>
                    ) : p.stock === 0 ? (
                      <Badge variant="destructive">{t("outOfStock")}</Badge>
                    ) : p.stock < 10 ? (
                      <Badge variant="secondary">{formatNumber(p.stock)} · {t("lowStock")}</Badge>
                    ) : (
                      formatNumber(p.stock)
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={t("viewProduct")} asChild>
                        <Link
                          to="/vitrine/$storeId/$productId"
                          params={{ storeId: p.storeId, productId: p.id }}
                          target="_blank"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                      <ProductActions product={p} />
                    </div>
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
