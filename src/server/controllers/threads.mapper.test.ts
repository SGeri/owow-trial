import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";

import { Prisma } from "@/generated/prisma/client";

import { fromUIMessage, toUIMessage } from "./threads";

function asJson(value: unknown): Prisma.JsonValue {
  return value as Prisma.JsonValue;
}

describe("UI message mapping", () => {
  it("round-trips parts and metadata", () => {
    const message: UIMessage = {
      id: "msg-1",
      role: "user",
      parts: [{ type: "text", text: "Hello" }],
      metadata: { source: "test" },
    };

    const row = fromUIMessage(message, "thread-1");
    expect(row).toMatchObject({
      id: "msg-1",
      threadId: "thread-1",
      role: "user",
      metadata: { source: "test" },
    });

    expect(
      toUIMessage({
        id: row.id,
        role: row.role,
        parts: asJson(row.parts),
        metadata: asJson(row.metadata ?? null),
      }),
    ).toEqual(message);
  });

  it("omits metadata when it was never set", () => {
    const message: UIMessage = {
      id: "msg-2",
      role: "assistant",
      parts: [{ type: "text", text: "Next cue: ask." }],
    };

    expect(fromUIMessage(message, "thread-1").metadata).toBeUndefined();
    expect(
      toUIMessage({
        id: message.id,
        role: message.role,
        parts: asJson(message.parts),
        metadata: null,
      }),
    ).toEqual(message);
  });
});
