/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import rawTools from "@/lib/agent/tools";
import { executeTool } from "@/lib/agent/executeTools";
import SYSTEM_PROMPT from "@/lib/agent/systemPrompt";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Gemini requires uppercase type values in schema (STRING, OBJECT, ARRAY, etc.)
function toGeminiSchema(schema: any): any {
  if (!schema || typeof schema !== "object") return schema;
  if (Array.isArray(schema)) return schema.map(toGeminiSchema);
  const out: any = {};
  for (const [k, v] of Object.entries(schema)) {
    if (k === "type" && typeof v === "string") {
      out[k] = v.toUpperCase();
    } else if (typeof v === "object") {
      out[k] = toGeminiSchema(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: SYSTEM_PROMPT,
  tools: [{
    functionDeclarations: rawTools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: toGeminiSchema(t.input_schema),
    })),
  }],
});

function is503(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const m = e.message.toLowerCase();
  return m.includes("503") || m.includes("service unavailable") || m.includes("high demand");
}

async function sendWithRetry<T>(fn: () => Promise<T>, maxAttempts = 4): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (is503(e) && attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, Math.min(2000 * 2 ** (attempt - 1), 16000)));
        continue;
      }
      throw e;
    }
  }
  throw new Error("Gemini service unavailable after retries.");
}

export type AgentEvent =
  | { type: "text_delta"; delta: string }
  | { type: "tool_start"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_done"; id: string; result: unknown; isError: boolean }
  | { type: "done" }
  | { type: "error"; message: string };

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
  };
  const token = (await cookies()).get("token")?.value;

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  async function send(event: AgentEvent) {
    await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
  }

  (async () => {
    try {
      // Convert prior messages to Gemini history format
      const history = messages.slice(0, -1).map(m => ({
        role: m.role === "user" ? "user" as const : "model" as const,
        parts: [{ text: m.content }],
      }));
      const lastMessage = messages[messages.length - 1]?.content ?? "";

      const chat = geminiModel.startChat({ history });

      // Agentic loop — first call uses lastMessage, subsequent calls use tool results
      let nextParts: any = lastMessage;

      while (true) {
        const result = await sendWithRetry(() => chat.sendMessageStream(nextParts));

        let accText = "";
        const functionCalls: { name: string; args: Record<string, unknown> }[] = [];

        for await (const chunk of result.stream) {
          for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
            if ("text" in part && part.text) {
              accText += part.text;
              await send({ type: "text_delta", delta: part.text });
            }
            if ("functionCall" in part && part.functionCall) {
              functionCalls.push({
                name: part.functionCall.name,
                args: (part.functionCall.args ?? {}) as Record<string, unknown>,
              });
            }
          }
        }

        if (functionCalls.length === 0) break;

        // Execute tool calls
        const responseParts: any[] = [];

        for (const fc of functionCalls) {
          const id = `${fc.name}_${Date.now()}`;
          await send({ type: "tool_start", id, name: fc.name, input: fc.args });

          let toolResult: unknown;
          let isError = false;
          try {
            toolResult = await executeTool(fc.name, fc.args, token);
          } catch (e) {
            toolResult = e instanceof Error ? e.message : String(e);
            isError = true;
          }

          await send({ type: "tool_done", id, result: toolResult, isError });

          responseParts.push({
            functionResponse: {
              name: fc.name,
              response: isError
                ? { error: String(toolResult) }
                : { result: toolResult },
            },
          });
        }

        nextParts = responseParts;
      }

      await send({ type: "done" });
    } catch (e) {
      await send({ type: "error", message: e instanceof Error ? e.message : "Unexpected error" });
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
