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
});

export type GeneratedProduct = z.infer<typeof ProductIdea>;

export const generateProductsWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data }): Promise<GeneratedProduct[]> => {
    console.log("[ai] handler start");
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    console.log("[ai] fetching gateway");
    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `Tu es un assistant pour des commerçants africains. À partir de cette demande : « ${data.prompt} », propose 1 à 5 produits concrets et réalistes pour une boutique en ligne (paiement à la livraison). Prix en ${data.currency} (nombres entiers réalistes pour le marché local), stock entre 5 et 100, description courte et vendeuse en langue "${data.language}". Catégorie courte (Mode, Beauté, Électronique, Maison, Alimentation…). Réponds uniquement avec un objet json de la forme {"products":[{"name":"...","category":"...","price":0,"stock":0,"description":"..."}]}.`,
          },
        ],
      }),
      });
    } catch (e) {
      console.log("[ai] fetch threw", (e as Error).message);
      throw e;
    }

    console.log("[ai] gateway status", res.status);
    if (!res.ok) {
      const message = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${message.slice(0, 200)}`);
    }

    try {
      console.log("[ai] reading body");
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = json.choices?.[0]?.message?.content ?? "";
      const parsed = z
        .object({ products: z.array(ProductIdea) })
        .parse(JSON.parse(content));
      console.log("[ai] parsed", parsed.products.length);
      return parsed.products.slice(0, 5);
    } catch (e) {
      console.log("[ai] parse failed", (e as Error).message);
      return [];
    }
  });

export const pingServerFn = createServerFn({ method: "GET" }).handler(() => "pong");

export const probeEgress = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const r = await fetch("https://example.com", { signal: AbortSignal.timeout(8000) });
    return `ok ${r.status}`;
  } catch (e) {
    return `err ${(e as Error).message}`;
  }
});
