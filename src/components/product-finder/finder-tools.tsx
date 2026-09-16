import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  BookmarkCheck,
  Bot,
  FileStack,
  FolderPlus,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  MessageCircle,
  PackageSearch,
  Play,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { analyzeWinningProduct } from "@/lib/ai.functions";
import { productFinderStore, useProductFinderState } from "@/services/product-finder.store";
import { spyAds } from "@/services/spy.mock";

export function BrandTracker() {
  const { trackedBrands } = useProductFinderState();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Côte d'Ivoire");
  const brands = trackedBrands.map((brand) => ({
    ...brand,
    ads: spyAds.filter((ad) => ad.advertiser.toLowerCase().includes(brand.name.toLowerCase().split(" ")[0] ?? "")),
  }));

  return <div className="space-y-4">
    <Card><CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_190px_auto] sm:items-end">
      <div className="space-y-2"><Label htmlFor="brand-name">Marque ou boutique</Label><Input id="brand-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Maison Kora" /></div>
      <div className="space-y-2"><Label>Pays principal</Label><Select value={country} onValueChange={setCountry}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Côte d'Ivoire", "Sénégal", "Bénin", "Mali", "Nigeria"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
      <Button className="gap-2" onClick={() => { productFinderStore.addBrand(name, country); setName(""); toast.success("Marque ajoutée au suivi"); }} disabled={!name.trim()}><Plus className="h-4 w-4" /> Suivre</Button>
    </CardContent></Card>
    <div className="grid gap-4 md:grid-cols-2">
      {brands.map((brand) => <Card key={brand.id}><CardContent className="p-4">
        <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{brand.name}</h2><p className="text-sm text-muted-foreground">{brand.country}</p></div><Button size="icon" variant="ghost" aria-label="Arrêter le suivi" onClick={() => productFinderStore.removeBrand(brand.id)}><Trash2 className="h-4 w-4" /></Button></div>
        <div className="mt-4 grid grid-cols-2 gap-3"><Metric label="Publicités repérées" value={String(brand.ads.length)} /><Metric label="Interactions" value={fixedNumber(brand.ads.reduce((sum, ad) => sum + ad.likes + ad.comments, 0))} /></div>
        <p className="mt-3 text-xs text-muted-foreground">Suivi automatique des nouvelles créations et produits de cette marque.</p>
      </CardContent></Card>)}
    </div>
  </div>;
}

export function SwipeFile() {
  const { favorites, folders } = useProductFinderState();
  const ads = spyAds.filter((ad) => favorites.includes(ad.id));
  return <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
    <FolderSidebar />
    <div>{ads.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{ads.map((ad) => <Card key={ad.id} className="overflow-hidden"><img src={ad.image} alt={ad.headline} className="aspect-video w-full object-cover" /><CardContent className="space-y-3 p-4"><Badge variant="secondary">{ad.format === "video" ? "Vidéo" : "Image"}</Badge><h2 className="line-clamp-2 font-semibold">{ad.headline}</h2><Select onValueChange={(folderId) => productFinderStore.toggleAdInFolder(folderId, ad.id)}><SelectTrigger aria-label="Ajouter à un dossier"><SelectValue placeholder="Ajouter à un dossier" /></SelectTrigger><SelectContent>{folders.map((folder) => <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>)}</SelectContent></Select></CardContent></Card>)}</div> : <EmptyState icon={BookmarkCheck} title="Votre fichier est vide" text="Enregistrez des publicités depuis l’explorateur pour les classer ici." />}</div>
  </div>;
}

export function TrendsDashboard() {
  const categories = useMemo(() => Array.from(new Set(spyAds.map((ad) => ad.category))).map((category) => {
    const ads = spyAds.filter((ad) => ad.category === category);
    return { category, ads: ads.length, engagement: ads.reduce((sum, ad) => sum + ad.likes + ad.comments, 0), momentum: Math.round(ads.reduce((sum, ad) => sum + (ad.likes + ad.comments) / ad.runningDays, 0)) };
  }).sort((a, b) => b.momentum - a.momentum), []);
  const max = Math.max(...categories.map((item) => item.momentum));
  return <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-3"><MetricCard icon={TrendingUp} label="Catégorie en tête" value={categories[0]?.category ?? "—"} /><MetricCard icon={FileStack} label="Créations analysées" value={String(spyAds.length)} /><MetricCard icon={Sparkles} label="Marchés actifs" value={String(new Set(spyAds.map((ad) => ad.countryCode)).size)} /></div>
    <Card><CardHeader><CardTitle className="text-base">Tendances par catégorie</CardTitle></CardHeader><CardContent className="space-y-5">{categories.map((item, index) => <div key={item.category} className="space-y-2"><div className="flex items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-2"><Badge variant={index === 0 ? "default" : "secondary"}>#{index + 1}</Badge><span className="truncate text-sm font-medium">{item.category}</span></div><span className="text-xs text-muted-foreground">{fixedNumber(item.engagement)} interactions</span></div><Progress value={(item.momentum / max) * 100} /></div>)}</CardContent></Card>
  </div>;
}

export function CreativeFinder() {
  const [format, setFormat] = useState("all");
  const [angle, setAngle] = useState("all");
  const items = spyAds.filter((ad) => (format === "all" || ad.format === format) && (angle === "all" || creativeAngle(ad.description) === angle));
  return <div className="space-y-4">
    <Card><CardContent className="flex flex-wrap gap-2 p-4"><Select value={format} onValueChange={setFormat}><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous formats</SelectItem><SelectItem value="image">Images</SelectItem><SelectItem value="video">Vidéos</SelectItem></SelectContent></Select><Select value={angle} onValueChange={setAngle}><SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Tous les angles</SelectItem><SelectItem value="promotion">Promotion</SelectItem><SelectItem value="preuve">Preuve sociale</SelectItem><SelectItem value="artisanat">Savoir-faire</SelectItem><SelectItem value="benefice">Bénéfice produit</SelectItem></SelectContent></Select></CardContent></Card>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((ad) => <Card key={ad.id} className="overflow-hidden"><div className="relative"><img src={ad.image} alt={ad.headline} className="aspect-video w-full object-cover" /><Badge className="absolute left-2 top-2 gap-1">{ad.format === "video" ? <Play className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}{ad.format === "video" ? "Vidéo" : "Image"}</Badge></div><CardContent className="space-y-2 p-4"><Badge variant="secondary">{creativeAngleLabel(creativeAngle(ad.description))}</Badge><h2 className="line-clamp-2 font-semibold">{ad.headline}</h2><div className="flex gap-4 text-xs text-muted-foreground"><span className="flex gap-1"><Heart className="h-3.5 w-3.5" />{fixedNumber(ad.likes)}</span><span className="flex gap-1"><MessageCircle className="h-3.5 w-3.5" />{fixedNumber(ad.comments)}</span></div></CardContent></Card>)}</div>
  </div>;
}

export function WinningAgent() {
  const analyze = useServerFn(analyzeWinningProduct);
  const [product, setProduct] = useState(spyAds[0]?.headline ?? "");
  const [market, setMarket] = useState("Côte d'Ivoire");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const run = async () => {
    setLoading(true); setResult(null);
    try { setResult(await analyze({ data: { product, market } })); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Analyse indisponible"); }
    finally { setLoading(false); }
  };
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bot className="h-5 w-5 text-primary" /> Lancer une analyse</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="agent-product">Produit ou idée</Label><Textarea id="agent-product" value={product} onChange={(event) => setProduct(event.target.value)} rows={5} placeholder="Décrivez le produit à évaluer…" /></div><div className="space-y-2"><Label>Marché</Label><Select value={market} onValueChange={setMarket}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Côte d'Ivoire", "Sénégal", "Bénin", "Mali", "Nigeria"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><Button className="w-full gap-2" onClick={run} disabled={loading || product.trim().length < 3}><Sparkles className="h-4 w-4" />{loading ? "Analyse en cours…" : "Analyser le potentiel"}</Button></CardContent></Card>
    {result ? <Card><CardHeader><CardTitle className="text-base">Rapport de l’agent</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap text-sm leading-7">{result}</p></CardContent></Card> : <EmptyState icon={Lightbulb} title="Votre rapport apparaîtra ici" text="L’agent étudiera le potentiel, l’angle de vente, les risques et une méthode de test adaptée au marché." />}
  </div>;
}

export function QuickSourcing() {
  const { sourcingRequests } = useProductFinderState();
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("50");
  const [targetPrice, setTargetPrice] = useState("");
  const [country, setCountry] = useState("Côte d'Ivoire");
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_1fr]">
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><PackageSearch className="h-5 w-5 text-primary" /> Nouvelle demande</CardTitle></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="source-product">Produit recherché</Label><Input id="source-product" value={product} onChange={(event) => setProduct(event.target.value)} placeholder="Ex. Mini blender rechargeable" /></div><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="quantity">Quantité</Label><Input id="quantity" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="price">Prix cible/unité</Label><Input id="price" inputMode="numeric" value={targetPrice} onChange={(event) => setTargetPrice(event.target.value)} placeholder="FCFA" /></div></div><div className="space-y-2"><Label>Pays de livraison</Label><Select value={country} onValueChange={setCountry}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Côte d'Ivoire", "Sénégal", "Bénin", "Mali", "Nigeria"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><Button className="w-full gap-2" disabled={!product.trim()} onClick={() => { productFinderStore.addSourcingRequest({ product, quantity: Number(quantity) || 1, country, targetPrice: Number(targetPrice) || 0 }); setProduct(""); toast.success("Demande enregistrée"); }}><Truck className="h-4 w-4" /> Enregistrer la demande</Button></CardContent></Card>
    <Card><CardHeader><CardTitle className="text-base">Demandes récentes</CardTitle></CardHeader><CardContent className="space-y-3">{sourcingRequests.length ? sourcingRequests.map((request) => <div key={request.id} className="flex items-center justify-between gap-3 rounded-md border p-3"><div className="min-w-0"><p className="truncate text-sm font-medium">{request.product}</p><p className="text-xs text-muted-foreground">{request.quantity} unités · {request.country}</p></div><Badge variant="secondary">À chiffrer</Badge></div>) : <p className="py-8 text-center text-sm text-muted-foreground">Aucune demande pour le moment.</p>}</CardContent></Card>
  </div>;
}

export function FolderManager() { return <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]"><FolderSidebar /><FolderContents /></div>; }

function FolderSidebar() {
  const { folders } = useProductFinderState();
  const [name, setName] = useState("");
  return <Card className="h-fit"><CardHeader><CardTitle className="text-base">Mes dossiers</CardTitle></CardHeader><CardContent className="space-y-3"><div className="flex gap-2"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nouveau dossier" /><Button size="icon" aria-label="Créer le dossier" onClick={() => { productFinderStore.addFolder(name); setName(""); }} disabled={!name.trim()}><FolderPlus className="h-4 w-4" /></Button></div>{folders.map((folder) => <div key={folder.id} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"><div className="min-w-0"><p className="truncate text-sm font-medium">{folder.name}</p><p className="text-xs text-muted-foreground">{folder.adIds.length} élément{folder.adIds.length === 1 ? "" : "s"}</p></div><Button variant="ghost" size="icon" aria-label="Supprimer le dossier" onClick={() => productFinderStore.removeFolder(folder.id)}><Trash2 className="h-4 w-4" /></Button></div>)}</CardContent></Card>;
}

function FolderContents() {
  const { folders } = useProductFinderState();
  return <div className="space-y-4">{folders.map((folder) => <Card key={folder.id}><CardHeader><CardTitle className="text-base">{folder.name}</CardTitle></CardHeader><CardContent>{folder.adIds.length ? <div className="grid gap-3 sm:grid-cols-2">{folder.adIds.map((id) => { const ad = spyAds.find((item) => item.id === id); return ad ? <div key={id} className="flex gap-3 rounded-md border p-2"><img src={ad.image} alt={ad.headline} className="h-16 w-16 rounded object-cover" /><div className="min-w-0"><p className="line-clamp-2 text-sm font-medium">{ad.headline}</p><p className="mt-1 text-xs text-muted-foreground">{ad.advertiser}</p></div></div> : null; })}</div> : <p className="text-sm text-muted-foreground">Ce dossier est vide. Ajoutez-y des éléments depuis le fichier de balayage.</p>}</CardContent></Card>)}</div>;
}

export function TutorialPanel() {
  const { tutorialSteps } = useProductFinderState();
  const steps = [
    { id: "search", title: "Chercher une opportunité", text: "Utilisez l’explorateur et ses filtres pour repérer un produit." },
    { id: "save", title: "Enregistrer les meilleures idées", text: "Ajoutez les créations utiles à votre fichier de balayage." },
    { id: "compare", title: "Comparer les signaux", text: "Consultez les tendances et les produits gagnants." },
    { id: "test", title: "Préparer votre test", text: "Analysez le produit avec l’agent puis créez une demande d’approvisionnement." },
  ];
  return <div className="space-y-4"><Card><CardContent className="p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium">Progression</p><p className="text-xs text-muted-foreground">{tutorialSteps.length} étape{tutorialSteps.length === 1 ? "" : "s"} sur {steps.length}</p></div><span className="text-2xl font-semibold">{Math.round((tutorialSteps.length / steps.length) * 100)} %</span></div><Progress value={(tutorialSteps.length / steps.length) * 100} className="mt-3" /></CardContent></Card><div className="grid gap-3 md:grid-cols-2">{steps.map((step, index) => { const done = tutorialSteps.includes(step.id); return <Card key={step.id}><CardContent className="flex gap-3 p-4"><Checkbox checked={done} onCheckedChange={() => productFinderStore.toggleTutorialStep(step.id)} aria-label={`Marquer ${step.title}`} /><div><div className="flex items-center gap-2"><Badge variant="secondary">{index + 1}</Badge><h2 className="text-sm font-semibold">{step.title}</h2></div><p className="mt-2 text-sm text-muted-foreground">{step.text}</p></div></CardContent></Card>; })}</div></div>;
}

function EmptyState({ icon: Icon, title, text }: { icon: typeof Search; title: string; text: string }) { return <Card><CardContent className="flex min-h-56 flex-col items-center justify-center gap-2 p-6 text-center"><Icon className="h-8 w-8 text-muted-foreground" /><h2 className="font-semibold">{title}</h2><p className="max-w-md text-sm text-muted-foreground">{text}</p></CardContent></Card>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-md bg-muted p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-semibold">{value}</p></div>; }
function MetricCard({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) { return <Card><CardContent className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold">{value}</p></div></CardContent></Card>; }
function fixedNumber(value: number) { return new Intl.NumberFormat("fr-FR").format(value); }
function creativeAngle(description: string) { const value = description.toLowerCase(); if (value.includes("promo") || value.includes("gratuite")) return "promotion"; if (value.includes("clientes") || value.includes("garantie")) return "preuve"; if (value.includes("artisan") || value.includes("main")) return "artisanat"; return "benefice"; }
function creativeAngleLabel(value: string) { return { promotion: "Promotion", preuve: "Preuve sociale", artisanat: "Savoir-faire", benefice: "Bénéfice produit" }[value] ?? "Angle produit"; }