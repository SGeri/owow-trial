import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";

const PLACEHOLDER =
  "Coach reply is not connected yet. This placeholder confirms the chat can stream a response.";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages?: UIMessage[];
    id?: string;
    sessionId?: string;
  };

  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.length > 0
      ? body.sessionId
      : "unknown";

  const text = `Session ${sessionId}. ${PLACEHOLDER}`;
  const words = text.split(" ");

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const partId = "placeholder";
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: partId });

      for (const [index, word] of words.entries()) {
        const delta = index === words.length - 1 ? word : `${word} `;
        writer.write({ type: "text-delta", id: partId, delta });
        await new Promise((resolve) => setTimeout(resolve, 24));
      }

      writer.write({ type: "text-end", id: partId });
      writer.write({ type: "finish", finishReason: "stop" });
      writer.setOutcome({ status: "completed" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}
