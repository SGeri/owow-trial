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

/**
 * Shared AI Gateway provider (server-only).
 * Authenticated with `env.AI_GATEWAY_API_KEY` — not the ambient process default.
 *
 * @example
 * ```ts
 * streamText({ model: ai.chat(getChatModel()), ... })
 * streamText({ model: ai(getChatModel()), ... })
 * ```
 */
export const ai = globalForAi.aiGateway ?? createSharedGateway();

if (env.NODE_ENV !== "production") {
  globalForAi.aiGateway = ai;
}

/** Language model id for the app chat role, honoring `AI_CHAT_MODEL` when set. */
export function getChatModel(override?: GatewayModelId): GatewayModelId {
  return resolveChatModel(override, env.AI_CHAT_MODEL);
}

/** Convenience: `ai.chat(getChatModel(override))`. */
export function chatModel(override?: GatewayModelId) {
  return ai.chat(getChatModel(override));
}
