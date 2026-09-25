import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/actions", () => ({
  getSessionContextAction: vi.fn(),
}));

import { getSessionContextAction } from "@/server/actions";

import { SessionInfoDialog } from "./session-info-dialog";

const context = {
  session: { id: "session-101", memberId: "member-101" },
  records: [
    {
      id: "ex-101-0",
      memberId: "member-101",
      type: "exercise",
      visibility: "exercise",
      week: 0,
      text: "Delegating updates",
      status: null,
      replacedBy: null,
    },
    {
      id: "chat-101-1",
      memberId: "member-101",
      type: "private_chat",
      visibility: "private_chat",
      week: 1,
      text: "Secret leaving job",
      status: null,
      replacedBy: null,
    },
  ],
  scenarios: [
    {
      id: "continuity",
      trustedSessionId: "session-101",
      week: 2,
      question: "Which conversation did you postpone?",
      answer: "I postponed it again.",
    },
  ],
};

describe("SessionInfoDialog", () => {
  beforeEach(() => {
    vi.mocked(getSessionContextAction).mockResolvedValue({
      ok: true,
      data: context,
    });
  });

  it("filters records by type and text", async () => {
    const user = userEvent.setup();
    render(<SessionInfoDialog sessionId="session-101" />);

    await user.click(screen.getByRole("button", { name: "Session fixture details" }));
    expect(await screen.findByText("Delegating updates")).toBeInTheDocument();
    expect(screen.getByText("Secret leaving job")).toBeInTheDocument();

    const privateButtons = screen.getAllByRole("button", { name: "Private" });
    await user.click(privateButtons[0]!);
    expect(screen.queryByText("Delegating updates")).not.toBeInTheDocument();
    expect(screen.getByText("Secret leaving job")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "All" })[0]!);
    await user.type(
      screen.getByPlaceholderText("Filter by id, text, status…"),
      "Delegating",
    );
    expect(screen.getByText("Delegating updates")).toBeInTheDocument();
    expect(screen.queryByText("Secret leaving job")).not.toBeInTheDocument();
  });
});
