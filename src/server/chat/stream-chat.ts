import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  validateUIMessages,
  type UIMessage,
} from "ai";

import { chatModel } from "@/server/ai";
import {
  getOrCreateThreadForSession,
  listThreadMessages,
  replaceThreadMessages,
} from "@/server/controllers/threads";
import type { ChatRequest } from "@/server/schemas/chat";

const SYSTEM_PROMPT =
  "You are a brief helpful assistant; answer in one short sentence.";

const generateMessageId = createIdGenerator({ prefix: "msg", size: 16 });

export async function streamChat(input: ChatRequest) {
  const thread = await getOrCreateThreadForSession(input.sessionId);
  if (!thread) {
    return Response.json({ error: "Unknown session" }, { status: 404 });
  }

  const previous = await listThreadMessages(thread.id);
  const messages = await validateUIMessages({
    messages: [...previous, input.message as UIMessage],
  });

  const result = streamText({
    model: chatModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
  });

  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId,
      onEnd: async ({ messages: saved }) => {
        await replaceThreadMessages(thread.id, saved);
      },
    }),
  });
}
