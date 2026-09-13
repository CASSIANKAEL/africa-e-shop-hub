import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, PhoneCall, XCircle } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { paymentLabels } from "@/components/commerce/order-status-badge";
import { OrderStatusSelect } from "@/components/commerce/order-status-select";
import { commerceService } from "@/services/commerce.service";
import { commerceStore, useOrder, useStoreName } from "@/services/commerce.store";
import { toast } from "sonner";
import { formatDate, formatMoney } from "@/lib/format";

export const Route = createFileRoute("/commandes/$orderId")({
  loader: ({ params }) => {
    const order = commerceService.getOrder(params.orderId);
    if (!order) throw notFound();
    return { order };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Commande introuvable — Sooko" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `Commande ${loaderData.order.reference} — Sooko`;
    const description = `Détail de la commande ${loaderData.order.reference} de ${loaderData.order.customer.fullName}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { order: loaded } = Route.useLoaderData();
  const order = useOrder(loaded.id) ?? loaded;
  const storeName = useStoreName(order.storeId);

  return (
    <AppShell>
      <Button variant="ghost" size="sm" className="mb-3" asChild>
        <Link to="/commandes">
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour aux commandes
        </Link>
      </Button>

      <PageHeader
        title={order.reference}
        description={`${storeName} · ${formatDate(order.createdAt)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`}>
                <PhoneCall className="mr-1 h-4 w-4" /> Appeler le client
              </a>
            </Button>
            <OrderStatusSelect
              orderId={order.id}
              status={order.status}
              {...(order.followUpAt ? { currentFollowUpAt: order.followUpAt } : {})}
              className="h-9 w-[170px]"
            />
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => {
                commerceStore.updateOrderStatus(order.id, "cancelled");
                toast.success("Commande annulée");
              }}
            >
              <XCircle className="mr-1 h-4 w-4" /> Annuler
            </Button>
            <Button
              onClick={() => {
                commerceStore.updateOrderStatus(order.id, "confirmed");
                toast.success("Commande confirmée");
              }}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" /> Confirmer
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Articles</CardTitle>
            <OrderStatusSelect
              orderId={order.id}
              status={order.status}
              {...(order.followUpAt ? { currentFollowUpAt: order.followUpAt } : {})}
            />
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.productId} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} × {formatMoney(item.unitPrice, order.currency)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatMoney(item.quantity * item.unitPrice, order.currency)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total à encaisser</span>
              <span className="font-display text-xl font-semibold">
                {formatMoney(order.total, order.currency)}
              </span>
            </div>
            {order.note && (
              <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                Note : {order.note}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client & livraison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label="Nom" value={order.customer.fullName} />
            <Info label="Téléphone" value={order.customer.phone} />
            <Info label="Ville" value={order.customer.city} />
            <Info label="Paiement" value={paymentLabels[order.paymentMethod]} />
            <Info label="Devise" value={order.currency} />
            {order.followUpAt && (
              <Info label="Rappel prévu" value={formatDate(order.followUpAt)} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Commentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.comments?.length ? (
              <ul className="space-y-2">
                {order.comments.map((c) => (
                  <li key={c.id} className="rounded-xl bg-muted p-3 text-sm">
                    <p>{c.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(c.createdAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
            )}
            <CommentForm orderId={order.id} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function CommentForm({ orderId }: { orderId: string }) {
  const [text, setText] = useState("");
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        commerceStore.addComment(orderId, text);
        setText("");
        toast.success("Commentaire ajouté");
      }}
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ajouter un commentaire (ex. : client à rappeler demain matin)."
      />
      <Button type="submit" size="sm" disabled={!text.trim()}>
        Ajouter le commentaire
      </Button>
    </form>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
