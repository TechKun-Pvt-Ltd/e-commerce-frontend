import Anthropic from "@anthropic-ai/sdk";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import tools from "@/lib/agent/tools";
import { executeTool } from "@/lib/agent/executeTools";
import SYSTEM_PROMPT from "@/lib/agent/systemPrompt";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type AgentEvent =
  | { type: "text_delta"; delta: string }
  | { type: "tool_start"; id: string; name: string; input: Record<string, unknown> }
  | { type: "tool_done"; id: string; result: unknown; isError: boolean }
  | { type: "done" }
  | { type: "error"; message: string };

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as {
    messages: Anthropic.MessageParam[];
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
      let currentMessages: Anthropic.MessageParam[] = [...messages];

      // Agentic loop — runs until stop_reason is "end_turn"
      while (true) {
        // Collect tool results for this iteration
        const toolResults: Array<{ id: string; result: unknown; isError: boolean }> = [];

        // Use streaming for text so the UI feels responsive
        const stream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 8096,
          system: SYSTEM_PROMPT,
          tools,
          messages: currentMessages,
        });

        // Collect the full content blocks this turn (as ContentBlockParam for reuse in next turn)
        type AsstContentBlock =
          | { type: "text"; text: string }
          | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> };
        const contentBlocks: AsstContentBlock[] = [];
        let currentToolUseBlock: { id: string; name: string; input: string } | null = null;

        for await (const event of stream) {
          if (event.type === "content_block_start") {
            if (event.content_block.type === "text") {
              contentBlocks.push({ type: "text", text: "" });
            } else if (event.content_block.type === "tool_use") {
              currentToolUseBlock = {
                id: event.content_block.id,
                name: event.content_block.name,
                input: "",
              };
              contentBlocks.push({
                type: "tool_use",
                id: event.content_block.id,
                name: event.content_block.name,
                input: {},
              });
            }
          } else if (event.type === "content_block_delta") {
            const lastBlock = contentBlocks[contentBlocks.length - 1];
            if (event.delta.type === "text_delta") {
              if (lastBlock?.type === "text") {
                lastBlock.text += event.delta.text;
                await send({ type: "text_delta", delta: event.delta.text });
              }
            } else if (event.delta.type === "input_json_delta" && currentToolUseBlock) {
              currentToolUseBlock.input += event.delta.partial_json;
            }
          } else if (event.type === "content_block_stop") {
            if (currentToolUseBlock) {
              // Parse the accumulated input JSON
              let parsedInput: Record<string, unknown> = {};
              try {
                parsedInput = JSON.parse(currentToolUseBlock.input || "{}");
              } catch {
                parsedInput = {};
              }
              // Update the content block with parsed input
              const toolBlock = contentBlocks.find(
                (b) => b.type === "tool_use" && b.id === currentToolUseBlock!.id
              );
              if (toolBlock && toolBlock.type === "tool_use") {
                toolBlock.input = parsedInput;
              }
              // Notify client a tool is starting
              await send({
                type: "tool_start",
                id: currentToolUseBlock.id,
                name: currentToolUseBlock.name,
                input: parsedInput,
              });
              // Execute the tool
              const toolId = currentToolUseBlock.id;
              const toolName = currentToolUseBlock.name;
              let result: unknown;
              let isError = false;
              try {
                result = await executeTool(toolName, parsedInput, token);
              } catch (e) {
                result = e instanceof Error ? e.message : String(e);
                isError = true;
              }
              toolResults.push({ id: toolId, result, isError });
              await send({ type: "tool_done", id: toolId, result, isError });
              currentToolUseBlock = null;
            }
          }
        }

        const finalMessage = await stream.finalMessage();

        if (finalMessage.stop_reason === "end_turn") {
          break;
        }

        if (finalMessage.stop_reason !== "tool_use") {
          break;
        }

        // Build tool_result blocks for the next turn
        const toolResultContents: Anthropic.ToolResultBlockParam[] = toolResults.map(({ id, result, isError }) => ({
          type: "tool_result",
          tool_use_id: id,
          content: typeof result === "string" ? result : JSON.stringify(result),
          is_error: isError,
        }));

        // Append this turn's assistant message and tool results to history
        currentMessages = [
          ...currentMessages,
          { role: "assistant" as const, content: contentBlocks as Anthropic.MessageParam["content"] },
          { role: "user" as const, content: toolResultContents },
        ];
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
