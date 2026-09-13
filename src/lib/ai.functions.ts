import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ProductIdea = z.object({
  name: z.string(),
  category: z.string(),
  price: z.number(),
  stock: z.number(),
  description: z.string(),
});

const GenerateInput = z.object({
  prompt: z.string().min(3),
  currency: z.string().default("XOF"),
  language: z.string().default("fr"),
  images: z.array(z.string()).max(5).default([]),
  sourceUrl: z.string().default(""),

});

export type GeneratedProduct = z.infer<typeof ProductIdea>;

/** Lit un flux SSE et concatène les deltas de texte. */
async function readSseText(res: Response): Promise<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") return text;
      try {
        const json = JSON.parse(data) as {
          choices?: { delta?: { content?: string } }[];
        };
        text += json.choices?.[0]?.delta?.content ?? "";
      } catch {
        // ignore partial lines
      }
    }
  }
  return text;
}

export const generateProductsWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data }): Promise<GeneratedProduct[]> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        stream: true,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Tu es un assistant pour des commerçants africains. À partir de cette demande : « ${data.prompt} »${data.images.length > 0 ? " et des photos jointes" : ""}${data.sourceUrl ? ` et de cette page produit de référence : ${data.sourceUrl} (inspire-toi du produit qu'elle décrit, sans copier le texte)` : ""}, propose 1 à 5 produits concrets et réalistes pour une boutique en ligne (paiement à la livraison). Prix en ${data.currency} (nombres entiers réalistes pour le marché local), stock entre 5 et 100, description courte et vendeuse en langue "${data.language}". Catégorie courte (Mode, Beauté, Électronique, Maison, Alimentation…). Réponds uniquement avec un objet json de la forme {"products":[{"name":"...","category":"...","price":0,"stock":0,"description":"..."}]}.`,
              },
              ...data.images.map((url) => ({
                type: "image_url" as const,
                image_url: { url },
              })),
            ],
          },
        ],
      }),
    });

    if (!res.ok || !res.body) {
      const message = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${message.slice(0, 200)}`);
    }

    try {
      const content = await readSseText(res);
      const parsed = z
        .object({ products: z.array(ProductIdea) })
        .parse(JSON.parse(content));
      return parsed.products.slice(0, 5);
    } catch {
      return [];
    }
  });
