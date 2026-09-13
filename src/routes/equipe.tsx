import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, ShieldCheck, Trash2, Truck, UserPlus, Headphones } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { commerceStore, useActiveStore, useActiveStoreId, useTeam } from "@/services/commerce.store";
import { useLanguage } from "@/lib/i18n";
import type { TeamRole } from "@/types";

export const Route = createFileRoute("/equipe")({
  head: () => ({
    meta: [
      { title: "Équipe de la boutique — Sooko" },
      {
        name: "description",
        content:
          "Ajoutez des admins, des closeuses et des livreurs à votre boutique et gérez leurs accès.",
      },
      { property: "og:title", content: "Équipe de la boutique — Sooko" },
      {
        property: "og:description",
        content: "Admins, closeuses et livreurs : chaque boutique gère sa propre équipe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeamPage,
});

const roleOrder: TeamRole[] = ["admin", "closer", "courier"];
const roleIcon = { admin: ShieldCheck, closer: Headphones, courier: Truck } as const;
const roleKey = { admin: "roleAdmin", closer: "roleCloser", courier: "roleCourier" } as const;
const roleHintKey = {
  admin: "roleAdminHint",
  closer: "roleCloserHint",
  courier: "roleCourierHint",
} as const;

function TeamPage() {
  const { t } = useLanguage();
  const store = useActiveStore();
  const storeId = useActiveStoreId();
  const members = useTeam(storeId);

  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<TeamRole>("closer");

  function reset() {
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("closer");
  }

  function submit(status: "invited" | "active") {
    if (!fullName.trim() || !email.trim()) return;
    commerceStore.addTeamMember(storeId, {
      fullName,
      email,
      ...(phone.trim() ? { phone } : {}),
      role,
      status,
    });
    toast.success(
      status === "invited"
        ? t("inviteSent", { email: email.trim() })
        : t("accessGranted", { name: fullName.trim() }),
    );
    reset();
    setOpen(false);
  }

  return (
    <AppShell>
      <PageHeader
        title={t("team")}
        description={t("teamDescription", { store: store?.name ?? "" })}
      >
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" /> {t("addMember")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("addMember")}</DialogTitle>
              <DialogDescription>{t(roleHintKey[role])}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member-name">{t("memberName")}</Label>
                <Input
                  id="member-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email">{t("memberEmail")}</Label>
                <Input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-phone">{t("memberPhone")}</Label>
                <Input id="member-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("memberRole")}</Label>
                <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOrder.map((r) => (
                      <SelectItem key={r} value={r}>
                        {t(roleKey[r])}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button variant="outline" onClick={() => submit("active")}>
                {t("giveAccessNow")}
              </Button>
              <Button onClick={() => submit("invited")}>{t("sendInvitation")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        {roleOrder.map((r) => {
          const Icon = roleIcon[r];
          const list = members.filter((m) => m.role === r);
          return (
            <Card key={r}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4 text-primary" />
                  {t(roleKey[r])}
                  <span className="text-sm font-normal text-muted-foreground">({list.length})</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">{t(roleHintKey[r])}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {list.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t("noMembers")}</p>
                )}
                {list.map((m) => (
                  <div key={m.id} className="rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{m.fullName}</p>
                        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" /> {m.email}
                        </p>
                        {m.phone && (
                          <a
                            href={`tel:${m.phone.replace(/\s/g, "")}`}
                            className="flex items-center gap-1 text-xs text-primary"
                          >
                            <Phone className="h-3.5 w-3.5" /> {m.phone}
                          </a>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("removeMember")}
                        onClick={() => {
                          commerceStore.removeTeamMember(m.id);
                          toast.success(t("memberRemoved", { name: m.fullName }));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant={m.status === "active" ? "default" : "secondary"}>
                        {m.status === "active" ? t("statusActiveMember") : t("statusInvited")}
                      </Badge>
                      {m.status === "invited" ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.success(t("inviteSent", { email: m.email }))}
                          >
                            {t("resendInvite")}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              commerceStore.setMemberStatus(m.id, "active");
                              toast.success(t("accessGranted", { name: m.fullName }));
                            }}
                          >
                            {t("activateAccess")}
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
