import type { GatewayModelId } from "ai";

/** Named Gateway model ids used by the app. */
export const AI_MODELS = {
  chat: "openai/gpt-4o-mini",
  guardrail: "openai/gpt-4o-mini-fast",
  citations: "openai/gpt-4o-mini-fast",
} as const satisfies Record<string, GatewayModelId>;
