/**
 * Server-only AI Gateway client.
 *
 * Prefer `chatModel()` / `ai` from this barrel. Do not import in client components.
 */

export { ai, chatModel, getChatModel } from "./client";
export {
  createAiGateway,
  type AiGateway,
  type CreateAiGatewayOptions,
} from "./gateway";
export {
  AI_MODELS,
  isGatewayModelId,
  resolveChatModel,
  type AiModelRole,
  type AppChatModelId,
} from "./models";

export type { GatewayModelId } from "ai";
