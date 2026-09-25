import type { GatewayModelId } from "ai";

/**
 * Named model roles used by the app.
 * Values are AI Gateway ids (`provider/model`) typed as `GatewayModelId`.
 */
export const AI_MODELS = {
  /** Default coach / chat completions model. */
  chat: "openai/gpt-4o-mini",
  /** Lower-latency chat variant when quality can trade off. */
  chatFast: "openai/gpt-4o-mini-fast",
} as const satisfies Record<string, GatewayModelId>;

export type AiModelRole = keyof typeof AI_MODELS;

export type AppChatModelId = (typeof AI_MODELS)[AiModelRole];

export function isGatewayModelId(value: string): value is GatewayModelId {
  return value.length > 0 && value.includes("/");
}

/**
 * Resolve the chat model: explicit override → `AI_CHAT_MODEL` env → default role.
 */
export function resolveChatModel(
  override?: GatewayModelId,
  envModel?: string,
): GatewayModelId {
  if (override) {
    return override;
  }

  if (envModel) {
    if (!isGatewayModelId(envModel)) {
      throw new Error(
        `Invalid AI_CHAT_MODEL "${envModel}". Expected a Gateway id like "openai/gpt-4o-mini".`,
      );
    }
    return envModel;
  }

  return AI_MODELS.chat;
}
