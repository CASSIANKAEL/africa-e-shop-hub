import { createFileRoute, useParams } from "@tanstack/react-router";
import { StorefrontCanvas } from "@/components/commerce/storefront-canvas";
import { useProducts, useStores } from "@/services/commerce.store";
import { WhatsappFloat } from "@/components/commerce/whatsapp-float";
import { useStoreTheme } from "@/services/theme.store";

export const Route = createFileRoute("/vitrine/$storeId/")({
  head: () => ({
    meta: [
      { title: "Boutique en ligne — Sooko" },
      {
        name: "description",
        content:
          "Aperçu public de la boutique : produits disponibles, prix en FCFA et commande en paiement à la livraison.",
      },
      { property: "og:title", content: "Boutique en ligne — Sooko" },
      {
        property: "og:description",
        content: "Découvrez les produits de la boutique et commandez en paiement à la livraison.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StorefrontPage,
});

function StorefrontPage() {
  const { storeId } = useParams({ from: "/vitrine/$storeId/" });
  const store = useStores().find((s) => s.id === storeId);
  const products = useProducts().filter((p) => p.storeId === storeId);
  const theme = useStoreTheme(storeId);

  if (!store) {
    return (
      <main className="mx-auto max-w-3xl p-10 text-center">
        <h1 className="font-display text-2xl font-semibold">Boutique introuvable</h1>
        <p className="mt-2 text-muted-foreground">Ce lien ne correspond à aucune boutique.</p>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen"><StorefrontCanvas store={store} products={products} theme={theme} /></main>
      <WhatsappFloat storeId={storeId} />
    </>
  );
}
