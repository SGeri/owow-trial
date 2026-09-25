import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/chat/stream-chat", () => ({
  streamChat: vi.fn(async () => Response.json({ ok: true })),
}));

import { streamChat } from "@/server/chat/stream-chat";
import { userMessage } from "@/test/fixtures/messages";

import { POST } from "./route";

const validBody = {
  sessionId: "session-101",
  message: userMessage("I postponed the conversation."),
};

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.mocked(streamChat).mockClear();
  });

  it("returns 400 for invalid JSON", async () => {
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid chat request",
    });
    expect(streamChat).not.toHaveBeenCalled();
  });

  it("returns 400 when the body fails the schema", async () => {
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: "", message: validBody.message }),
      }),
    );

    expect(response.status).toBe(400);
    expect(streamChat).not.toHaveBeenCalled();
  });

  it("delegates a valid body to streamChat", async () => {
    const response = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validBody),
      }),
    );

    expect(response.status).toBe(200);
    expect(streamChat).toHaveBeenCalledWith(validBody);
  });
});
