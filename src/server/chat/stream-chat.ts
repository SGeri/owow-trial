import { convertToModelMessages, streamText, type UIMessage } from "ai";

import type { ChatRequest } from "@/server/schemas/chat";

const SYSTEM_PROMPT =
  "You are a brief helpful assistant; answer in one short sentence.";

export async function streamChat(input: ChatRequest) {
  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(input.messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
