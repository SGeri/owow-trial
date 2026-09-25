import type { UIMessage } from "ai";
import { Prisma } from "@/generated/prisma/client";

import { db } from "@/server/db";

type MessageRow = {
  id: string;
  role: "user" | "assistant" | "system";
  parts: Prisma.JsonValue;
  metadata: Prisma.JsonValue | null;
};

export function toUIMessage(row: MessageRow): UIMessage {
  return {
    id: row.id,
    role: row.role,
    parts: row.parts as UIMessage["parts"],
    ...(row.metadata != null ? { metadata: row.metadata } : {}),
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

export async function listThreadMessages(threadId: string): Promise<UIMessage[]> {
  const rows = await db.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, parts: true, metadata: true },
  });

  return rows.map(toUIMessage);
}

export async function listMessagesForSession(
  sessionId: string,
): Promise<UIMessage[]> {
  const thread = await getOrCreateThreadForSession(sessionId);
  if (!thread) {
    return [];
  }
  return listThreadMessages(thread.id);
}

export async function replaceThreadMessages(
  threadId: string,
  messages: UIMessage[],
) {
  await db.$transaction([
    db.chatMessage.deleteMany({ where: { threadId } }),
    db.chatMessage.createMany({
      data: messages.map((message) => fromUIMessage(message, threadId)),
    }),
  ]);
}
