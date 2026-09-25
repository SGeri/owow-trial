import { z } from "zod";

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

export const uiMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant", "system"]),
  metadata: z.unknown().optional(),
  parts: z.array(
    z.union([textPartSchema, z.object({ type: z.string() }).loose()]),
  ),
});

export const chatRequestSchema = z.object({
  sessionId: z.string().min(1),
  message: uiMessageSchema,
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
