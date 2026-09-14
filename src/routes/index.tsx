import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  FileText,
  Globe2,
  Languages,
  LayoutDashboard,
  Layers,
  MessageCircle,
  Palette,
  PhoneCall,
  Sparkles,
  Target,
  Truck,
  UsersRound,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sooko — Le SaaS e-commerce et COD des commerçants africains" },
      {
        name: "description",
        content:
          "Sooko réunit boutique en ligne, formulaire de commande COD, offres de quantité, équipe, livraisons et tableaux de bord en direct, en FCFA et en 7 langues.",
      },
      { property: "og:title", content: "Sooko — Vendez et livrez partout en Afrique" },
      {
        property: "og:description",
        content:
          "Créez votre boutique, recevez les commandes au paiement à la livraison et pilotez vos ventes en temps réel depuis votre téléphone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: Palette,
    title: "Boutique en ligne personnalisable",
    text: "Deux modèles prêts à l'emploi, votre logo, vos couleurs, vos polices et des blocs de contenu réorganisables — avec aperçu direct téléphone et ordinateur.",
  },
  {
    icon: FileText,
    title: "Formulaire de commande COD",
    text: "Un formulaire par boutique, affiché en pop-up ou intégré : champs déplaçables, badges de confiance, bouton animé et page de remerciement personnalisée.",
  },
  {
    icon: Layers,
    title: "Offres de quantité",
    text: "Créez des offres par produits choisis : remise fixe ou en pourcentage, étiquette colorée, image, livraison offerte et offre présélectionnée.",
  },
  {
    icon: LayoutDashboard,
    title: "Tableaux de bord en direct",
    text: "Chiffre d'affaires, volume de commandes, taux de confirmation COD, panier moyen, visites et conversion, sur la période de votre choix.",
  },
  {
    icon: PhoneCall,
    title: "Confirmation des commandes",
    text: "Statuts complets (à rappeler, injoignable, programmée, confirmée, livrée, retour), rappels datés remontés en haut de liste et commentaires modifiables.",
  },
  {
    icon: UsersRound,
    title: "Équipe et rôles",
    text: "Invitez vos closeuses et vos livreurs par boutique, attribuez les commandes et suivez qui fait quoi.",
  },
  {
    icon: Truck,
    title: "Espace livraisons",
    text: "Le livreur reçoit ses commandes et leurs notifications, marque livré ou non livré avec motif et commentaire visible côté vendeur.",
  },
  {
    icon: Target,
    title: "Pixels publicitaires",
    text: "Meta, TikTok, Snapchat, Google Ads et Pinterest pour mesurer vos campagnes jusqu'à la commande.",
  },
  {
    icon: MessageCircle,
    title: "Bouton WhatsApp",
    text: "Votre numéro par pays, un message pré-rempli et un bouton flottant sur la boutique pour discuter avec vos clients.",
  },
  {
    icon: Boxes,
    title: "Catalogue et import CSV",
    text: "Produits multi-images, suivi de stock optionnel, duplication ou transfert entre boutiques, import CSV et création assistée par IA.",
  },
  {
    icon: BarChart3,
    title: "Google Sheets",
    text: "Connectez un fichier de calcul et choisissez quelle donnée part dans quelle colonne, avec aperçu d'une ligne.",
  },
  {
    icon: Globe2,
    title: "Plusieurs boutiques",
    text: "Basculez d'une boutique à l'autre en un clic, chacune avec ses produits, son équipe, sa devise et sa langue.",
  },
];

const steps = [
  {
    step: "1",
    title: "Créez votre boutique",
    text: "Choisissez un modèle, importez votre logo et ajustez couleurs, polices et sections.",
  },
  {
    step: "2",
    title: "Ajoutez vos produits et vos offres",
    text: "Import CSV, création manuelle ou IA, puis vos offres de quantité sur les produits choisis.",
  },
  {
    step: "3",
    title: "Recevez et confirmez les commandes",
    text: "Le client commande sans compte, vous confirmez par appel et l'équipe voit tout en direct.",
  },
  {
    step: "4",
    title: "Livrez et analysez",
    text: "Attribuez au livreur, suivez la livraison et mesurez vos résultats sur vos tableaux de bord.",
  },
];

const stats = [
  { value: "19", label: "devises africaines et internationales" },
  { value: "7", label: "langues d'interface, arabe inclus" },
  { value: "100 %", label: "pensé mobile d'abord" },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-semibold">Sooko</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <a href="#fonctionnalites">Fonctionnalités</a>
            </Button>
            <Button asChild>
              <Link to="/tableau-de-bord">
                Ouvrir l'application
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div>
              <Badge variant="secondary" className="mb-4">
                Paiement à la livraison · Afrique
              </Badge>
              <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
                Vendez, confirmez et livrez depuis un seul espace
              </h1>
              <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
                Sooko est la plateforme e-commerce des commerçants africains : votre boutique en
                ligne, un formulaire de commande pensé pour le paiement à la livraison, votre
                équipe, vos livreurs et vos chiffres en temps réel, en FCFA et sur votre téléphone.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link to="/tableau-de-bord">
                    Découvrir le tableau de bord
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/boutique">Personnaliser une boutique</Link>
                </Button>
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="font-display text-2xl font-semibold md:text-3xl">{s.value}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Card className="overflow-hidden border-border shadow-lg">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display text-sm font-semibold">Aujourd'hui</p>
                  <Badge variant="secondary">En direct</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat icon={Wallet} label="Chiffre d'affaires" value="5 398 000 F CFA" />
                  <MiniStat icon={Boxes} label="Commandes" value="184" />
                  <MiniStat icon={PhoneCall} label="Confirmation COD" value="78 %" />
                  <MiniStat icon={Truck} label="Livrées" value="126" />
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Dernière commande</p>
                  <p className="mt-1 text-sm font-medium">Aïcha Diallo · Dakar</p>
                  <p className="text-xs text-muted-foreground">
                    2 unités · 36 800 F CFA · paiement à la livraison
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                  <Languages className="h-4 w-4 shrink-0" />
                  Interface et boutique disponibles en 7 langues, devise par boutique.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="fonctionnalites" className="border-y border-border bg-muted/40 py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Tout ce dont votre commerce a besoin
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              De la vitrine à la livraison, chaque fonctionnalité est conçue pour la vente au
              paiement à la livraison et se règle boutique par boutique.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <Card key={f.title} className="h-full">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <p className="font-display text-base font-semibold">{f.title}</p>
                    <p className="text-sm text-muted-foreground">{f.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Comment ça marche
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <Card key={s.step} className="h-full">
                <CardContent className="p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">
                    {s.step}
                  </span>
                  <p className="mt-3 font-display text-base font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-muted/40 py-14 md:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Prêt à lancer votre boutique ?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              Ouvrez l'espace de gestion, choisissez un modèle et recevez votre première commande
              au paiement à la livraison dès aujourd'hui.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/tableau-de-bord">
                  Ouvrir l'application
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/abonnement">Voir les formules</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Sooko — commerce africain.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/produits" className="hover:text-foreground">Produits</Link>
            <Link to="/commandes" className="hover:text-foreground">Commandes</Link>
            <Link to="/formulaires" className="hover:text-foreground">Formulaires</Link>
            <Link to="/abonnement" className="hover:text-foreground">Abonnement</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}
