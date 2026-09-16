import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Clock3,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Play,
  Search,
  Telescope,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  SPY_FAVORITES_KEY,
  spyAds,
  spyCountries,
  spyPlatforms,
  type SpyAd,
  type SpyFormat,
  type SpyPlatform,
} from "@/services/spy.mock";

type PlatformFilter = SpyPlatform | "all";
type FormatFilter = SpyFormat | "all";
type DurationFilter = "all" | "week" | "month" | "long";

function loadFavorites(): string[] {
  try {
    const raw = window.localStorage.getItem(SPY_FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
  } catch {
    return [];
  }
}

export function AdExplorer({ savedOnly = false }: { savedOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [format, setFormat] = useState<FormatFilter>("all");
  const [country, setCountry] = useState("all");
  const [duration, setDuration] = useState<DurationFilter>("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => setFavorites(loadFavorites()), []);

  const toggleFavorite = (id: string) => {
    setFavorites((previous) => {
      const next = previous.includes(id) ? previous.filter((favorite) => favorite !== id) : [...previous, id];
      window.localStorage.setItem(SPY_FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return spyAds.filter((ad) => {
      if (savedOnly && !favorites.includes(ad.id)) return false;
      if (platform !== "all" && ad.platform !== platform) return false;
      if (format !== "all" && ad.format !== format) return false;
      if (country !== "all" && ad.countryCode !== country) return false;
      if (duration === "week" && ad.runningDays > 7) return false;
      if (duration === "month" && (ad.runningDays <= 7 || ad.runningDays > 30)) return false;
      if (duration === "long" && ad.runningDays <= 30) return false;
      if (!normalizedQuery) return true;
      return `${ad.advertiser} ${ad.headline} ${ad.description} ${ad.category} ${ad.country}`
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [country, duration, favorites, format, platform, query, savedOnly]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-3 md:p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un produit, une marque ou une catégorie…"
              className="pl-9"
              aria-label="Rechercher un produit"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border p-1">
              {spyPlatforms.map((item) => (
                <Button
                  key={item.key}
                  size="sm"
                  variant={platform === item.key ? "default" : "ghost"}
                  className="h-8 shrink-0"
                  onClick={() => setPlatform(item.key)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <Select value={format} onValueChange={(value) => setFormat(value as FormatFilter)}>
              <SelectTrigger className="h-9 w-[130px]" aria-label="Format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous formats</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="h-9 w-[150px]" aria-label="Pays">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous pays</SelectItem>
                {spyCountries.map((item) => (
                  <SelectItem key={item.code} value={item.code}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={duration} onValueChange={(value) => setDuration(value as DurationFilter)}>
              <SelectTrigger className="h-9 w-[170px]" aria-label="Ancienneté">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute ancienneté</SelectItem>
                <SelectItem value="week">Moins de 7 jours</SelectItem>
                <SelectItem value="month">8 à 30 jours</SelectItem>
                <SelectItem value="long">Plus de 30 jours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {results.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
            <Telescope className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium">{savedOnly ? "Aucun produit enregistré" : "Aucun produit trouvé"}</p>
            <p className="text-sm text-muted-foreground">
              {savedOnly ? "Enregistrez des trouvailles depuis l’explorateur." : "Essayez un autre mot-clé ou élargissez vos filtres."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {results.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              saved={favorites.includes(ad.id)}
              onToggleSave={() => toggleFavorite(ad.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const platformLabel: Record<SpyPlatform, string> = {
  meta: "Méta",
  facebook: "Facebook",
  tiktok: "TikTok",
};

export function AdCard({ ad, saved, onToggleSave }: { ad: SpyAd; saved: boolean; onToggleSave: () => void }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/5] bg-muted">
        <img src={ad.image} alt={ad.headline} loading="lazy" className="h-full w-full object-cover" />
        {ad.format === "video" && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/85 shadow-lg">
              <Play className="h-6 w-6 fill-foreground text-foreground" />
            </span>
          </span>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          <Badge variant="secondary" className="bg-background/85 backdrop-blur">{platformLabel[ad.platform]}</Badge>
          <Badge variant="secondary" className="gap-1 bg-background/85 backdrop-blur">
            {ad.format === "video" ? <Play className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
            {ad.format === "video" ? "Vidéo" : "Image"}
          </Badge>
        </div>
        <Button
          size="icon"
          variant={saved ? "default" : "secondary"}
          className={cn("absolute right-2 top-2 h-9 w-9", !saved && "bg-background/85 backdrop-blur")}
          aria-label={saved ? "Retirer des enregistrements" : "Enregistrer le produit"}
          onClick={onToggleSave}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </Button>
      </div>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {ad.advertiser.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{ad.advertiser}</p>
            <p className="text-xs text-muted-foreground">{ad.country} · {ad.category}</p>
          </div>
        </div>
        <p className="line-clamp-2 text-sm font-medium">{ad.headline}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{ad.description}</p>
        <div className="flex items-center gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {ad.runningDays} j</span>
          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {formatNumber(ad.likes)}</span>
          <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {formatNumber(ad.comments)}</span>
          <span className="ml-auto font-medium text-foreground">{ad.cta}</span>
        </div>
      </CardContent>
    </Card>
  );
}