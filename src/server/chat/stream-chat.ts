import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { chatModel } from "@/server/ai";
import type { ChatRequest } from "@/server/schemas/chat";

const SYSTEM_PROMPT =
  "You are a brief helpful assistant; answer in one short sentence.";

export async function streamChat(input: ChatRequest) {
  const result = streamText({
    model: chatModel(),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(input.messages as UIMessage[]),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
