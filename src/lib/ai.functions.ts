import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";

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
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const schema = z.object({ products: z.array(ProductIdea) });

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3.8-flash"),
        output: Output.object({ schema }),
        prompt: `Tu es un assistant pour des commerçants africains. À partir de cette demande : « ${data.prompt} », propose 1 à 5 produits concrets et réalistes pour une boutique en ligne (paiement à la livraison). Prix en ${data.currency} (nombres entiers réalistes pour le marché local), stock entre 5 et 100, description courte et vendeuse en langue "${data.language}". Catégorie courte (Mode, Beauté, Électronique, Maison, Alimentation…).`,
      });
      return output.products.slice(0, 5);
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return [];
      }
      throw error;
    }
  });
