/** Server-only AI Gateway client. Prefer `chatModel()` / `ai`. */

export { ai, chatModel, type AiGateway } from "./client";
export {
  AI_MODELS,
  AI_MODEL_FALLBACKS,
  gatewayProviderOptions,
} from "./models";

export type { GatewayModelId } from "ai";
