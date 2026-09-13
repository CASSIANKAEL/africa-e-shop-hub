import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Pencil, PhoneCall, Trash2, XCircle } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useOrderLabels } from "@/components/commerce/order-status-badge";
import { OrderStatusSelect } from "@/components/commerce/order-status-select";
import { commerceService } from "@/services/commerce.service";
import { commerceStore, useOrder, useStoreName } from "@/services/commerce.store";
import { toast } from "sonner";
import { formatDate, formatMoney } from "@/lib/format";
import { useLanguage } from "@/lib/i18n";

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
  const { t } = useLanguage();
  const { payments: paymentLabels } = useOrderLabels();

  return (
    <AppShell>
      <Button variant="ghost" size="sm" className="mb-3" asChild>
        <Link to="/commandes">
          <ArrowLeft className="mr-1 h-4 w-4" /> {t("backToOrders")}
        </Link>
      </Button>

      <PageHeader
        title={order.reference}
        description={`${storeName} · ${formatDate(order.createdAt)}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <a href={`tel:${order.customer.phone.replace(/\s/g, "")}`}>
                <PhoneCall className="mr-1 h-4 w-4" /> {t("callCustomer")}
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
                toast.success(t("orderCancelled"));
              }}
            >
              <XCircle className="mr-1 h-4 w-4" /> {t("cancel")}
            </Button>
            <Button
              onClick={() => {
                commerceStore.updateOrderStatus(order.id, "confirmed");
                toast.success(t("orderConfirmed"));
              }}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" /> {t("confirm")}
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">{t("items")}</CardTitle>
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
              <span className="text-sm text-muted-foreground">{t("totalToCollect")}</span>
              <span className="font-display text-xl font-semibold">
                {formatMoney(order.total, order.currency)}
              </span>
            </div>
            {order.note && (
              <p className="mt-4 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                {t("note")} : {order.note}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("customerInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Info label={t("name")} value={order.customer.fullName} />
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">{t("phone")}</span>
              <a
                href={`tel:${order.customer.phone.replace(/\s/g, "")}`}
                className="font-medium text-primary"
              >
                {order.customer.phone}
              </a>
            </div>
            <Info label={t("city")} value={order.customer.city} />
            <Info label={t("payment")} value={paymentLabels[order.paymentMethod]} />
            <Info label={t("currency")} value={order.currency} />
            {order.followUpAt && (
              <Info label={t("scheduledReminder")} value={formatDate(order.followUpAt)} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">{t("comments")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.comments?.length ? (
              <ul className="space-y-2">
                {order.comments.map((c) => (
                  <CommentItem key={c.id} orderId={order.id} comment={c} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noComments")}</p>
            )}
            <CommentForm orderId={order.id} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function CommentItem({
  orderId,
  comment,
}: {
  orderId: string;
  comment: { id: string; text: string; createdAt: string };
}) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);

  return (
    <li className="rounded-xl bg-muted p-3 text-sm">
      {editing ? (
        <div className="space-y-2">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={!draft.trim()}
              onClick={() => {
                commerceStore.updateComment(orderId, comment.id, draft);
                setEditing(false);
                toast.success(t("commentUpdated"));
              }}
            >
              {t("save")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setDraft(comment.text);
                setEditing(false);
              }}
            >
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0">
            <p className="whitespace-pre-wrap">{comment.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              size="icon"
              variant="ghost"
              aria-label={t("editComment")}
              onClick={() => {
                setDraft(comment.text);
                setEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={t("deleteComment")}
              className="text-destructive"
              onClick={() => {
                commerceStore.deleteComment(orderId, comment.id);
                toast.success(t("commentDeleted"));
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function CommentForm({ orderId }: { orderId: string }) {
  const { t } = useLanguage();
  const [text, setText] = useState("");
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        commerceStore.addComment(orderId, text);
        setText("");
        toast.success(t("commentAdded"));
      }}
    >
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("addCommentPlaceholder")}
      />
      <Button type="submit" size="sm" disabled={!text.trim()}>
        {t("addComment")}
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
