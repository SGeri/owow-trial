import { describe, expect, it } from "vitest";

import type { CoachContext } from "@/server/controllers/sessions";

import { formatCoachContext } from "./context";

const empty: CoachContext = {
  sessionId: "session-303",
  memberId: "member-303",
  records: [],
  exercises: [],
};

describe("formatCoachContext", () => {
  it("describes a session with no history", () => {
    const text = formatCoachContext(empty);
    expect(text).toContain("Session: session-303");
    expect(text).toContain("Member: member-303");
    expect(text).toContain("No exercise question for this session.");
    expect(text).toContain("No earlier exercises or commitments.");
  });

  it("includes status and replacedBy on earlier records", () => {
    const text = formatCoachContext({
      ...empty,
      sessionId: "session-202",
      memberId: "member-202",
      exercises: [
        {
          id: "revised-commitment",
          week: 2,
          question: "Which conversation did you postpone?",
        },
      ],
      records: [
        {
          id: "com-202-1",
          type: "commitment",
          week: 1,
          text: "I will decline every unplanned request this week.",
          status: "superseded",
          replacedBy: "com-202-2",
        },
        {
          id: "ex-202-0",
          type: "exercise",
          week: 0,
          text: "Priorities were unclear.",
          status: null,
          replacedBy: null,
        },
      ],
    });

    expect(text).toContain(
      "- week 2 (revised-commitment): Which conversation did you postpone?",
    );
    expect(text).toContain(
      "- week 1 commitment (com-202-1) status=superseded replacedBy=com-202-2: I will decline every unplanned request this week.",
    );
    expect(text).toContain(
      "- week 0 exercise (ex-202-0): Priorities were unclear.",
    );
    expect(text).not.toContain("status=null");
  });
});
