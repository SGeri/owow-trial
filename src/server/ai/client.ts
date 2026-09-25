import type { GatewayModelId } from "ai";

import { env } from "@/env";

import { createAiGateway, type AiGateway } from "./gateway";
import { resolveChatModel } from "./models";

const globalForAi = globalThis as unknown as {
  aiGateway?: AiGateway;
};

function createSharedGateway(): AiGateway {
  return createAiGateway({
    apiKey: env.AI_GATEWAY_API_KEY,
  });
}

/** Shared AI Gateway provider. Uses `env.AI_GATEWAY_API_KEY`, not process defaults. */
export const ai = globalForAi.aiGateway ?? createSharedGateway();

if (env.NODE_ENV !== "production") {
  globalForAi.aiGateway = ai;
}

/** Chat role model id: override → `AI_CHAT_MODEL` → default. */
export function getChatModel(override?: GatewayModelId): GatewayModelId {
  return resolveChatModel(override, env.AI_CHAT_MODEL);
}

export function chatModel(override?: GatewayModelId) {
  return ai.chat(getChatModel(override));
}
