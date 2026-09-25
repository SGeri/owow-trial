import type { UIMessage } from "ai";
import { Prisma } from "@/generated/prisma/client";

import { db } from "@/server/db";
import { messageMetadataSchema } from "@/server/schemas/chat";
import type {
  Citation,
  MessageMetadata,
  OttoUIMessage,
} from "@/server/schemas/chat";

type MessageRow = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Prisma.JsonValue;
  metadata: Prisma.JsonValue | null;
};

export function toUIMessage(row: MessageRow): OttoUIMessage {
  return {
    id: row.id,
    role: row.role,
    parts: row.parts as OttoUIMessage["parts"],
    ...(row.metadata != null
      ? { metadata: row.metadata as MessageMetadata }
      : {}),
  };
}

export function fromUIMessage(message: UIMessage, threadId: string) {
  return {
    id: message.id,
    threadId,
    role: message.role,
    parts: message.parts as Prisma.InputJsonValue,
    metadata:
      message.metadata === undefined
        ? undefined
        : (message.metadata as Prisma.InputJsonValue),
  };
}

export async function getOrCreateThreadForSession(sessionId: string) {
  const session = await db.trustedSession.findUnique({
    where: { id: sessionId },
    select: { id: true, thread: { select: { id: true } } },
  });

  if (!session) {
    return null;
  }

  if (session.thread) {
    return session.thread;
  }

  return db.chatThread.create({
    data: { trustedSessionId: session.id },
    select: { id: true },
  });
}

export async function listThreadMessages(
  threadId: string,
): Promise<OttoUIMessage[]> {
  const rows = await db.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, parts: true, metadata: true },
  });

  return rows.map(toUIMessage);
}

export async function listMessagesForSession(
  sessionId: string,
): Promise<OttoUIMessage[]> {
  const thread = await getOrCreateThreadForSession(sessionId);
  if (!thread) {
    return [];
  }
  return listThreadMessages(thread.id);
}

export async function getAssistantMessageForSession(
  sessionId: string,
  messageId: string,
): Promise<OttoUIMessage | null> {
  const row = await db.chatMessage.findFirst({
    where: {
      id: messageId,
      role: "assistant",
      thread: { trustedSessionId: sessionId },
    },
    select: { id: true, role: true, parts: true, metadata: true },
  });

  return row ? toUIMessage(row) : null;
}

export async function setMessageCitationsForSession(
  sessionId: string,
  messageId: string,
  citations: Citation[],
): Promise<boolean> {
  const message = await db.chatMessage.findFirst({
    where: {
      id: messageId,
      role: "assistant",
      thread: { trustedSessionId: sessionId },
    },
    select: { metadata: true },
  });
  if (!message) return false;

  const current =
    message.metadata &&
    typeof message.metadata === "object" &&
    !Array.isArray(message.metadata)
      ? message.metadata
      : {};

  await db.chatMessage.update({
    where: { id: messageId },
    data: {
      metadata: {
        ...current,
        citations,
        citationStatus: "complete",
      } as Prisma.InputJsonValue,
    },
  });
  return true;
}

export async function replaceThreadMessages(
  threadId: string,
  messages: UIMessage[],
) {
  await db.$transaction(async (tx) => {
    const completedMetadata = await tx.chatMessage.findMany({
      where: {
        threadId,
        id: { in: messages.map((message) => message.id) },
      },
      select: { id: true, metadata: true },
    });
    const completedById = new Map(
      completedMetadata.flatMap((message) => {
        const parsed = messageMetadataSchema.safeParse(message.metadata ?? {});
        return parsed.success && parsed.data.citationStatus === "complete"
          ? [[message.id, parsed.data] as const]
          : [];
      }),
    );

    await tx.chatMessage.deleteMany({ where: { threadId } });
    await tx.chatMessage.createMany({
      data: messages.map((message) =>
        fromUIMessage(
          completedById.has(message.id)
            ? { ...message, metadata: completedById.get(message.id) }
            : message,
          threadId,
        ),
      ),
    });
  });
}
