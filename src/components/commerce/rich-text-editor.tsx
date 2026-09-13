import { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

const fonts = [
  { label: "Par défaut", value: "inherit" },
  { label: "Sans (DM Sans)", value: "'DM Sans', sans-serif" },
  { label: "Titre (Space Grotesk)", value: "'Space Grotesk', sans-serif" },
  { label: "Serif (Georgia)", value: "Georgia, serif" },
  { label: "Mono (Courier)", value: "'Courier New', monospace" },
];

const sizes = [
  { label: "Très petit", value: "1" },
  { label: "Petit", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Moyen", value: "4" },
  { label: "Grand", value: "5" },
  { label: "Très grand", value: "6" },
];

const blocks = [
  { label: "Paragraphe", value: "p" },
  { label: "Titre 1", value: "h1" },
  { label: "Titre 2", value: "h2" },
  { label: "Titre 3", value: "h3" },
];

const colors = [
  "#111827",
  "#6b7280",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [marks, setMarks] = useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
  });
  const [empty, setEmpty] = useState(!value);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
    setEmpty(!stripHtml(value) && !/<img/i.test(value));
  }, [value]);

  function emit() {
    const el = ref.current;
    if (!el) return;
    onChange(el.innerHTML);
    setEmpty(!stripHtml(el.innerHTML) && !el.querySelector("img"));
  }

  function refreshMarks() {
    if (typeof document === "undefined") return;
    try {
      setMarks({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strike: document.queryCommandState("strikeThrough"),
      });
    } catch {
      /* ignore */
    }
  }

  function run(command: string, arg?: string) {
    ref.current?.focus();
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, arg);
    emit();
    refreshMarks();
  }

  async function insertImages(files: FileList | null) {
    if (!files?.length) return;
    const urls = await Promise.all(Array.from(files).map(readFile));
    ref.current?.focus();
    urls.forEach((url) => document.execCommand("insertImage", false, url));
    if (fileRef.current) fileRef.current.value = "";
    emit();
  }

  function addLink() {
    const url = window.prompt("Adresse du lien (https://…)");
    if (url) run("createLink", url);
  }

  return (
    <div className="rounded-md border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b p-2">
        <Select onValueChange={(v) => run("formatBlock", v)}>
          <SelectTrigger className="h-8 w-[130px]" aria-label="Style de bloc">
            <SelectValue placeholder="Paragraphe" />
          </SelectTrigger>
          <SelectContent>
            {blocks.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => run("fontName", v)}>
          <SelectTrigger className="h-8 w-[150px]" aria-label="Police">
            <SelectValue placeholder="Police" />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(v) => run("fontSize", v)}>
          <SelectTrigger className="h-8 w-[120px]" aria-label="Taille du texte">
            <SelectValue placeholder="Taille" />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Toggle
          size="sm"
          pressed={marks.bold}
          onPressedChange={() => run("bold")}
          aria-label="Gras"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={marks.italic}
          onPressedChange={() => run("italic")}
          aria-label="Italique"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={marks.underline}
          onPressedChange={() => run("underline")}
          aria-label="Souligné"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={marks.strike}
          onPressedChange={() => run("strikeThrough")}
          aria-label="Barré"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Liste à puces"
          onClick={() => run("insertUnorderedList")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Liste numérotée"
          onClick={() => run("insertOrderedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Citation"
          onClick={() => run("formatBlock", "blockquote")}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Aligner à gauche"
          onClick={() => run("justifyLeft")}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Centrer"
          onClick={() => run("justifyCenter")}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Aligner à droite"
          onClick={() => run("justifyRight")}
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <div className="flex items-center gap-1">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Couleur ${c}`}
              onClick={() => run("foreColor", c)}
              className="h-5 w-5 rounded-full border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void insertImages(e.target.files)}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="mr-1 h-4 w-4" /> Image
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={addLink}
        >
          <Link2 className="mr-1 h-4 w-4" /> Lien
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Annuler"
          onClick={() => run("undo")}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Rétablir"
          onClick={() => run("redo")}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Effacer la mise en forme"
          onClick={() => run("removeFormat")}
        >
          <Eraser className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative">
        {empty && placeholder && (
          <span className="pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground">
            {placeholder}
          </span>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Description du produit"
          onInput={emit}
          onBlur={emit}
          onKeyUp={refreshMarks}
          onMouseUp={refreshMarks}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
            emit();
          }}
          className={cn(
            "prose-editor min-h-[220px] w-full px-3 py-2 text-sm outline-none",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic",
            "[&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_a]:text-primary [&_a]:underline",
            "[&_img]:my-2 [&_img]:max-h-72 [&_img]:rounded-md",
          )}
        />
      </div>
    </div>
  );
}
