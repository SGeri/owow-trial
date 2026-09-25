import type { UIMessage } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

const captured = vi.hoisted(() => ({
  onEnd: undefined as
    | ((args: { messages: UIMessage[] }) => Promise<void> | void)
    | undefined,
  messageMetadata: undefined as unknown,
}));

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    generateText: vi.fn(),
    streamText: vi.fn(() => ({
      consumeStream: vi.fn(),
      stream: new ReadableStream(),
    })),
    toUIMessageStream: vi.fn((options: {
      onEnd?: typeof captured.onEnd;
      messageMetadata?: ((options: { part: unknown }) => unknown) | unknown;
    }) => {
      if (options.onEnd) captured.onEnd = options.onEnd;
      captured.messageMetadata =
        typeof options.messageMetadata === "function"
          ? options.messageMetadata({ part: { type: "start" } })
          : options.messageMetadata;
      return new ReadableStream();
    }),
    createUIMessageStreamResponse: vi.fn(
      ({ stream }: { stream: ReadableStream }) => new Response(stream),
    ),
  };
});

import { generateText, streamText } from "ai";

import { REFUSAL_INSTRUCTIONS } from "@/server/chat/prompts";
import { listThreadMessages, getOrCreateThreadForSession } from "@/server/controllers/threads";
import { assistantMessage, userMessage } from "@/test/fixtures/messages";
import { seedTestDatabase } from "@/test/ensure-db";

import { streamChat } from "./stream-chat";

const coachingMessage = userMessage(
  "I postponed the conversation again.",
  "msg-user-coach",
);

describe("streamChat", () => {
  beforeEach(async () => {
    captured.onEnd = undefined;
    captured.messageMetadata = undefined;
    vi.mocked(generateText).mockReset();
    vi.mocked(streamText).mockClear();
    await seedTestDatabase();
  });

  it("returns 404 for an unknown session", async () => {
    const response = await streamChat({
      sessionId: "missing",
      message: coachingMessage,
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Unknown session" });
    expect(generateText).not.toHaveBeenCalled();
    expect(streamText).not.toHaveBeenCalled();
  });

  it("streams a refusal without member records when the guardrail blocks", async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: { allowed: false },
    } as Awaited<ReturnType<typeof generateText>>);

    const response = await streamChat({
      sessionId: "session-101",
      message: userMessage("Write a python script", "msg-user-refuse"),
    });

    expect(response.status).toBe(200);
    expect(streamText).toHaveBeenCalledTimes(1);
    const system = vi.mocked(streamText).mock.calls[0]?.[0].system;
    expect(system).toBe(REFUSAL_INSTRUCTIONS);
    expect(system).not.toContain("leaving my job");
    expect(system).not.toContain("Member context");

    await persistAndExpectSaved("session-101", "Refusal.");
  });

  it("streams Otto with exercise context and marks citations pending", async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: { allowed: true },
    } as Awaited<ReturnType<typeof generateText>>);

    const response = await streamChat({
      sessionId: "session-101",
      message: coachingMessage,
    });

    expect(response.status).toBe(200);
    const system = String(vi.mocked(streamText).mock.calls[0]?.[0].system);
    expect(system).toContain("You are Otto");
    expect(system).toContain("I keep taking ownership of every status update");
    expect(system).toContain("status=active");
    expect(system).not.toContain("leaving my job");
    expect(system).not.toContain("chat-101-1");
    expect(system).not.toContain("member-202");

    expect(generateText).toHaveBeenCalledTimes(1);
    expect(captured.messageMetadata).toEqual({
      citationStatus: "pending",
    });

    await persistAndExpectSaved(
      "session-101",
      "Next cue: ask them what they see.",
      captured.messageMetadata,
    );
  });
});

async function persistAndExpectSaved(
  sessionId: string,
  assistantText: string,
  metadata?: unknown,
) {
  expect(captured.onEnd).toBeTypeOf("function");
  const thread = await getOrCreateThreadForSession(sessionId);
  await captured.onEnd?.({
    messages: [
      userMessage("saved user", "msg-saved-user"),
      {
        ...assistantMessage(assistantText, "msg-saved-assistant"),
        ...(metadata !== undefined ? { metadata } : {}),
      },
    ],
  });

  const saved = await listThreadMessages(thread!.id);
  expect(saved.map((message) => message.id)).toEqual([
    "msg-saved-user",
    "msg-saved-assistant",
  ]);
  if (metadata !== undefined) {
    expect(saved[1]?.metadata).toEqual(metadata);
  }
}
