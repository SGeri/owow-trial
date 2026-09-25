import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/server/db";
import { assistantMessage, userMessage } from "@/test/fixtures/messages";
import { seedTestDatabase } from "@/test/ensure-db";

import {
  getOrCreateThreadForSession,
  listThreadMessages,
  replaceThreadMessages,
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
});
