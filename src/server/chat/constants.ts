import { AI_MODELS } from "@/server/ai/models";

/** Model ids for pipeline steps. Coach replies still go through `chatModel()` so `AI_CHAT_MODEL` can override. */
export const PIPELINE_MODELS = {
  guardrail: AI_MODELS.guardrail,
  coach: AI_MODELS.chat,
} as const;
