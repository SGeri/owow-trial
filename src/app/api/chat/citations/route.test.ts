import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/chat/citations", () => ({
  generateCitations: vi.fn(),
}));
vi.mock("@/server/controllers/sessions", () => ({
  listCoachContext: vi.fn(),
}));
vi.mock("@/server/controllers/threads", () => ({
  getAssistantMessageForSession: vi.fn(),
  setMessageCitationsForSession: vi.fn(),
}));

import { generateCitations } from "@/server/chat/citations";
import { listCoachContext } from "@/server/controllers/sessions";
import {
  getAssistantMessageForSession,
  setMessageCitationsForSession,
} from "@/server/controllers/threads";

import { POST } from "./route";

const context = {
  sessionId: "session-101",
  memberId: "member-101",
  records: [
    {
      id: "ex-101-1",
      type: "exercise",
      week: 1,
      text: "I postponed a difficult conversation.",
      status: null,
      replacedBy: null,
    },
  ],
  exercises: [],
};

describe("POST /api/chat/citations", () => {
  beforeEach(() => {
    vi.mocked(generateCitations).mockReset();
    vi.mocked(listCoachContext).mockReset();
    vi.mocked(getAssistantMessageForSession).mockReset();
    vi.mocked(setMessageCitationsForSession).mockReset();
  });

  it("rejects an invalid request", async () => {
    const response = await POST(
      new Request("http://localhost/api/chat/citations", {
        method: "POST",
        body: JSON.stringify({ sessionId: "" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(generateCitations).not.toHaveBeenCalled();
  });

  it("generates and stores citations for the saved assistant message", async () => {
    vi.mocked(listCoachContext).mockResolvedValue(context);
    vi.mocked(getAssistantMessageForSession).mockResolvedValue({
      id: "msg-assistant",
      role: "assistant",
      parts: [{ type: "text", text: "What made you postpone it again?" }],
    });
    const citations = [
      {
        recordId: "ex-101-1",
        week: 1,
        type: "exercise" as const,
        text: "I postponed a difficult conversation.",
        explanation: "The reply stays with the same postponed conversation.",
      },
    ];
    vi.mocked(generateCitations).mockResolvedValue(citations);
    vi.mocked(setMessageCitationsForSession).mockResolvedValue(true);

    const response = await POST(
      new Request("http://localhost/api/chat/citations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId: "session-101",
          messageId: "msg-assistant",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ citations });
    expect(generateCitations).toHaveBeenCalledWith({
      records: context.records,
      assistantText: "What made you postpone it again?",
    });
    expect(setMessageCitationsForSession).toHaveBeenCalledWith(
      "session-101",
      "msg-assistant",
      citations,
    );
  });
});
