import type { GatewayModelId } from "ai";

export const AI_MODELS = {
  chat: "openai/gpt-4o-mini",
  guardrail: "openai/gpt-4o-mini-fast",
  citations: "openai/gpt-4o-mini-fast",
} as const satisfies Record<string, GatewayModelId>;

export const AI_MODEL_FALLBACKS = [
  "google/gemini-2.5-flash",
  "anthropic/claude-haiku-4.5",
] as const satisfies readonly GatewayModelId[];

export function gatewayProviderOptions(
  models: readonly GatewayModelId[] = AI_MODEL_FALLBACKS,
) {
  return {
    gateway: {
      models: [...models],
    },
  };
}
