import { createGateway, type GatewayModelId } from "ai";

import { env } from "@/env";

import { AI_MODELS } from "./models";

export type AiGateway = ReturnType<typeof createGateway>;

const globalForAi = globalThis as unknown as {
  aiGateway?: AiGateway;
};

/** Shared AI Gateway provider. `apiKey` omitted when `AI_GATEWAY_API_KEY` is unset. */
export const ai =
  globalForAi.aiGateway ??
  createGateway(
    env.AI_GATEWAY_API_KEY ? { apiKey: env.AI_GATEWAY_API_KEY } : {},
  );

if (env.NODE_ENV !== "production") {
  globalForAi.aiGateway = ai;
}

/** Chat model: optional override → `AI_CHAT_MODEL` → `AI_MODELS.chat`. */
export function chatModel(override?: GatewayModelId) {
  const id =
    override ??
    (env.AI_CHAT_MODEL as GatewayModelId | undefined) ??
    AI_MODELS.chat;
  return ai.chat(id);
}
