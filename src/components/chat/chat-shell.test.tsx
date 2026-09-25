import { render, screen, waitFor } from "@testing-library/react";
import { useChat } from "@ai-sdk/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@ai-sdk/react", () => ({
  useChat: vi.fn(),
}));
vi.mock("./session-info-dialog", () => ({
  SessionInfoDialog: () => null,
}));
vi.mock("./session-selector", () => ({
  SessionSelector: () => null,
}));

import { ChatShell } from "./chat-shell";

const assistant = {
  id: "msg-assistant",
  role: "assistant" as const,
  parts: [{ type: "text" as const, text: "What made you postpone it?" }],
  metadata: { citationStatus: "pending" as const },
};

describe("ChatShell composer lifecycle", () => {
  const sendMessage = vi.fn();
  const setMessages = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the composer disabled while the reply stream is active", () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [assistant],
      sendMessage,
      setMessages,
      status: "streaming",
      error: undefined,
    } as unknown as ReturnType<typeof useChat>);

    render(
      <ChatShell
        sessionId="session-101"
        sessions={[]}
        initialMessages={[]}
      />,
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("enables the composer while citations load in the background", async () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [assistant],
      sendMessage,
      setMessages,
      status: "ready",
      error: undefined,
    } as unknown as ReturnType<typeof useChat>);
    const fetchPromise = new Promise<Response>(() => {});
    vi.spyOn(globalThis, "fetch").mockReturnValue(fetchPromise);

    render(
      <ChatShell
        sessionId="session-101"
        sessions={[]}
        initialMessages={[]}
      />,
    );

    expect(screen.getByRole("textbox")).toBeEnabled();
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/chat/citations",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            sessionId: "session-101",
            messageId: "msg-assistant",
          }),
        }),
      );
    });
    expect(screen.getByRole("textbox")).toBeEnabled();
  });
});
