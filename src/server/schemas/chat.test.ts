import { describe, expect, it } from "vitest";

import { userMessage } from "@/test/fixtures/messages";

import { chatRequestSchema, uiMessageSchema } from "./chat";

describe("uiMessageSchema", () => {
  it("accepts a text message", () => {
    expect(uiMessageSchema.safeParse(userMessage("Hello")).success).toBe(true);
  });

  it("accepts a non-text part", () => {
    const parsed = uiMessageSchema.safeParse({
      id: "msg-1",
      role: "assistant",
      parts: [{ type: "reasoning", text: "thinking" }],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an unknown role and a missing parts array", () => {
    expect(
      uiMessageSchema.safeParse({
        id: "msg-1",
        role: "tool",
        parts: [{ type: "text", text: "nope" }],
      }).success,
    ).toBe(false);
    expect(
      uiMessageSchema.safeParse({
        id: "msg-1",
        role: "user",
      }).success,
    ).toBe(false);
  });
});

describe("chatRequestSchema", () => {
  it("accepts a session id and message", () => {
    const parsed = chatRequestSchema.safeParse({
      sessionId: "session-101",
      message: userMessage("What happened"),
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an empty session id", () => {
    expect(
      chatRequestSchema.safeParse({
        sessionId: "",
        message: userMessage("Hello"),
      }).success,
    ).toBe(false);
  });
});
