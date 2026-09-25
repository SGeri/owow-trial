import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SessionSelector, type TrustedSessionOption } from "./session-selector";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
}));

const sessions: TrustedSessionOption[] = [
  {
    id: "session-101",
    memberId: "member-101",
    scenarioId: "continuity",
    empty: false,
    label: "continuity",
  },
  {
    id: "session-202",
    memberId: "member-202",
    scenarioId: "revised-commitment",
    empty: false,
    label: "revised-commitment",
  },
];

describe("SessionSelector", () => {
  it("replaces the session query when a session is chosen", async () => {
    const user = userEvent.setup();
    replace.mockClear();
    render(<SessionSelector sessions={sessions} sessionId="session-101" />);

    await user.click(screen.getByRole("combobox", { name: "Trusted session" }));
    await user.click(screen.getByRole("option", { name: /session-202/ }));

    expect(replace).toHaveBeenCalledWith("/?session=session-202");
  });
});
