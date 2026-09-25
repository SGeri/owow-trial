import type { GatewayModelId } from "ai";

/** Named roles → AI Gateway ids (`provider/model`). */
export const AI_MODELS = {
  chat: "openai/gpt-4o-mini",
  chatFast: "openai/gpt-4o-mini-fast",
} as const satisfies Record<string, GatewayModelId>;

export type AiModelRole = keyof typeof AI_MODELS;

export type AppChatModelId = (typeof AI_MODELS)[AiModelRole];

export function isGatewayModelId(value: string): value is GatewayModelId {
  return value.length > 0 && value.includes("/");
}

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
