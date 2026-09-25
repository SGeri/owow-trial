import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/server/db";
import { assistantMessage, userMessage } from "@/test/fixtures/messages";
import { seedTestDatabase } from "@/test/ensure-db";

import {
  getAssistantMessageForSession,
  getOrCreateThreadForSession,
  listThreadMessages,
  replaceThreadMessages,
  setMessageCitationsForSession,
} from "./threads";

describe("thread persistence", () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  it("returns the existing thread and creates one after it is removed", async () => {
    const existing = await getOrCreateThreadForSession("session-303");
    expect(existing?.id).toBeTruthy();

    const again = await getOrCreateThreadForSession("session-303");
    expect(again?.id).toBe(existing?.id);

    await db.chatThread.delete({ where: { id: existing!.id } });
    const created = await getOrCreateThreadForSession("session-303");
    expect(created?.id).toBeTruthy();
    expect(created?.id).not.toBe(existing?.id);

    expect(await getOrCreateThreadForSession("missing")).toBeNull();
  });

  it("lists messages by createdAt and replaces the whole thread", async () => {
    const thread = await getOrCreateThreadForSession("session-101");
    expect(thread).not.toBeNull();

    await db.chatMessage.create({
      data: {
        id: "older",
        threadId: thread!.id,
        role: "user",
        parts: [{ type: "text", text: "first" }],
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    });
    await db.chatMessage.create({
      data: {
        id: "newer",
        threadId: thread!.id,
        role: "assistant",
        parts: [{ type: "text", text: "second" }],
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
      },
    });

    expect((await listThreadMessages(thread!.id)).map((message) => message.id)).toEqual([
      "older",
      "newer",
    ]);

    const next = [
      userMessage("replaced", "msg-replaced-user"),
      assistantMessage("Next cue: ask.", "msg-replaced-assistant"),
    ];
    await replaceThreadMessages(thread!.id, next);

    const saved = await listThreadMessages(thread!.id);
    expect(saved.map((message) => message.id)).toEqual([
      "msg-replaced-user",
      "msg-replaced-assistant",
    ]);
    expect(saved[0]?.parts).toEqual([{ type: "text", text: "replaced" }]);
  });

  it("updates citations only on an assistant message in the requested session", async () => {
    const thread = await getOrCreateThreadForSession("session-101");
    await replaceThreadMessages(thread!.id, [
      userMessage("Member reply", "msg-user"),
      {
        ...assistantMessage("Coach reply", "msg-assistant"),
        metadata: { citationStatus: "pending" },
      },
    ]);

    const citations = [
      {
        recordId: "ex-101-1",
        week: 1,
        type: "exercise" as const,
        text: "I postponed a difficult conversation.",
        explanation: "The coach stayed with the postponed conversation.",
      },
    ];
    await expect(
      setMessageCitationsForSession(
        "session-101",
        "msg-assistant",
        citations,
      ),
    ).resolves.toBe(true);

    const saved = await getAssistantMessageForSession(
      "session-101",
      "msg-assistant",
    );
    expect(saved?.metadata).toEqual({
      citationStatus: "complete",
      citations,
    });

    await replaceThreadMessages(thread!.id, [
      userMessage("Next member reply", "msg-next-user"),
      {
        ...assistantMessage("Coach reply", "msg-assistant"),
        metadata: { citationStatus: "pending" },
      },
      assistantMessage("Next coach reply", "msg-next-assistant"),
    ]);
    expect(
      (
        await getAssistantMessageForSession(
          "session-101",
          "msg-assistant",
        )
      )?.metadata,
    ).toEqual({
      citationStatus: "complete",
      citations,
    });

    await expect(
      setMessageCitationsForSession(
        "session-202",
        "msg-assistant",
        citations,
      ),
    ).resolves.toBe(false);
    await expect(
      getAssistantMessageForSession("session-101", "msg-user"),
    ).resolves.toBeNull();
  });
});
