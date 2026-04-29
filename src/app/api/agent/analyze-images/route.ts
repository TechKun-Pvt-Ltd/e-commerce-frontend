import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { images } = (await req.json()) as {
      images: { data: string; mimeType: string }[];
    };

    if (!images?.length) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            // Send up to 5 images for analysis
            ...images.slice(0, 5).map((img) => ({
              type: "image" as const,
              source: {
                type: "base64" as const,
                media_type: img.mimeType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: img.data,
              },
            })),
            {
              type: "text" as const,
              text: `You are analyzing product images for an e-commerce store listing.
Study the images carefully and return ONLY a valid JSON object — no markdown, no explanation, just JSON.

{
  "title": "concise product title (5–8 words)",
  "description": "detailed e-commerce product description (2–3 paragraphs covering features, materials, use cases, appeal)",
  "suggestedCategory": "most specific category name (e.g. Canvas Art, Wooden Furniture, Wall Decor)",
  "colors": ["list of primary colors visible in the product"],
  "material": "primary material if identifiable, else null",
  "style": "aesthetic style such as Rustic, Modern, Abstract, Minimalist — or null if not clear",
  "additionalDetails": "any other relevant details visible: dimensions, finish, technique, care instructions, etc. — or null"
}`,
            },
          ],
        },
      ],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Strip markdown code blocks if the model wraps its response
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    try {
      return NextResponse.json(JSON.parse(cleaned));
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("analyze-images error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
