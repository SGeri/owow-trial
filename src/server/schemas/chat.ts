import type { UIMessage } from "ai";
import { z } from "zod";

const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
});

/** Snapshot of a prior record plus why it shaped one coaching reply. */
export const citationSchema = z.object({
  recordId: z.string().min(1),
  week: z.number().int(),
  type: z.enum(["exercise", "commitment"]),
  text: z.string().min(1),
  explanation: z.string().min(1),
});

export const messageMetadataSchema = z.object({
  citations: z.array(citationSchema).optional(),
});

export type Citation = z.infer<typeof citationSchema>;
export type MessageMetadata = z.infer<typeof messageMetadataSchema>;
export type OttoUIMessage = UIMessage<MessageMetadata>;

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
