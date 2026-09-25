import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  generateText,
  Output,
  streamText,
  toUIMessageStream,
  validateUIMessages,
  type UIMessage,
} from "ai";
import { z } from "zod";

import { ai, chatModel } from "@/server/ai";
import { listCoachContext } from "@/server/controllers/sessions";
import {
  getOrCreateThreadForSession,
  listThreadMessages,
  replaceThreadMessages,
} from "@/server/controllers/threads";
import type { ChatRequest } from "@/server/schemas/chat";

import { formatCoachContext } from "./context";
import { PIPELINE_MODELS } from "./constants";
import {
  COACHING_METHOD,
  GUARDRAIL_INSTRUCTIONS,
  OTTO_PERSONA,
  REFUSAL_INSTRUCTIONS,
} from "./prompts";

const generateMessageId = createIdGenerator({ prefix: "msg", size: 16 });

const guardrailSchema = z.object({
  allowed: z.boolean(),
});

function textOf(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

function persistStream(
  result: ReturnType<typeof streamText>,
  threadId: string,
  originalMessages: UIMessage[],
) {
  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages,
      generateMessageId,
      onEnd: async ({ messages: saved }) => {
        await replaceThreadMessages(threadId, saved);
      },
    }),
  });
}

export async function streamChat(input: ChatRequest) {
  const thread = await getOrCreateThreadForSession(input.sessionId);
  if (!thread) {
    return Response.json({ error: "Unknown session" }, { status: 404 });
  }

  const previous = await listThreadMessages(thread.id);
  const messages = await validateUIMessages({
    messages: [...previous, input.message as UIMessage],
  });

  const latest = messages.at(-1);
  const guardrail = await generateText({
    model: ai.chat(PIPELINE_MODELS.guardrail),
    system: GUARDRAIL_INSTRUCTIONS,
    prompt: latest ? textOf(latest) : "",
    output: Output.object({ schema: guardrailSchema }),
  });

  const modelMessages = await convertToModelMessages(messages);

  if (!guardrail.output.allowed) {
    const result = streamText({
      model: chatModel(),
      system: REFUSAL_INSTRUCTIONS,
      messages: modelMessages,
    });
    return persistStream(result, thread.id, messages);
  }

  const context = await listCoachContext(input.sessionId);
  const contextBlock = context
    ? formatCoachContext(context)
    : "Member context\nNo exercise-visible history.";

  const result = streamText({
    model: chatModel(),
    system: `${OTTO_PERSONA}\n\n${COACHING_METHOD}\n\n${contextBlock}`,
    messages: modelMessages,
  });

  return persistStream(result, thread.id, messages);
}
