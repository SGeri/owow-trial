import { z } from "zod";

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

const uiMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(z.union([textPartSchema, z.object({ type: z.string() }).loose()])),
});

export const chatRequestSchema = z.object({
  id: z.string().optional(),
  sessionId: z.string().min(1).optional(),
  messages: z.array(uiMessageSchema),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
