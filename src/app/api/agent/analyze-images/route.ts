import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function is503(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes("503") || error.message.toLowerCase().includes("service unavailable") || error.message.toLowerCase().includes("high demand");
  }
  return false;
}

async function generateWithRetry(parts: Parameters<typeof model.generateContent>[0], maxAttempts = 4): Promise<string> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await model.generateContent(parts);
      return response.response.text();
    } catch (err) {
      if (is503(err) && attempt < maxAttempts) {
        const delay = Math.min(2000 * 2 ** (attempt - 1), 16000); // 2s, 4s, 8s, 16s
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Gemini service unavailable after retries. Please try again in a moment.");
}

export async function POST(req: NextRequest) {
  try {
    const { images } = (await req.json()) as {
      images: { data: string; mimeType: string }[];
    };

    if (!images?.length) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const imageParts = images.slice(0, 5).map((img) => ({
      inlineData: { data: img.data, mimeType: img.mimeType },
    }));

    const prompt = `You are analyzing product images for an e-commerce store listing.
Study the images carefully and return ONLY a valid JSON object — no markdown, no explanation, just JSON.

{
  "title": "concise product title (5–8 words)",
  "description": "detailed e-commerce product description (2–3 paragraphs covering features, materials, use cases, appeal)",
  "suggestedCategory": "most specific category name (e.g. Canvas Art, Wooden Furniture, Wall Decor)",
  "colors": ["list of primary colors visible in the product"],
  "material": "primary material if identifiable, else null",
  "style": "aesthetic style such as Rustic, Modern, Abstract, Minimalist — or null if not clear",
  "additionalDetails": "any other relevant details visible: dimensions, finish, technique, care instructions, etc. — or null"
}`;

    const raw = await generateWithRetry([...imageParts, { text: prompt }]);

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
