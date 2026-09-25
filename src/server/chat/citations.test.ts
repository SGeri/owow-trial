import { generateText } from "ai";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    generateText: vi.fn(),
  };
});

import { enrichCitations, generateCitations } from "./citations";

const records = [
  {
    id: "ex-101-1",
    type: "exercise",
    week: 1,
    text: "I postponed a difficult conversation.",
    status: null,
    replacedBy: null,
  },
  {
    id: "com-101-1",
    type: "commitment",
    week: 1,
    text: "By Friday, I will ask what risk they see.",
    status: "active",
    replacedBy: null,
  },
  {
    id: "chat-101-1",
    type: "private_chat",
    week: 1,
    text: "I am thinking about leaving my job.",
    status: null,
    replacedBy: null,
  },
];

describe("enrichCitations", () => {
  it("copies record fields and drops unknown, blank, duplicate, and private ids", () => {
    expect(
      enrichCitations(records, [
        {
          recordId: " ex-101-1 ",
          explanation: " The reply stays on the postponed conversation. ",
        },
        {
          recordId: "ex-101-1",
          explanation: "Duplicate.",
        },
        {
          recordId: "missing",
          explanation: "Not in the list.",
        },
        {
          recordId: "com-101-1",
          explanation: "   ",
        },
        {
          recordId: "chat-101-1",
          explanation: "Private chat must not be cited.",
        },
      ]),
    ).toEqual([
      {
        recordId: "ex-101-1",
        week: 1,
        type: "exercise",
        text: "I postponed a difficult conversation.",
        explanation: "The reply stays on the postponed conversation.",
      },
    ]);
  });
});

describe("generateCitations", () => {
  beforeEach(() => {
    vi.mocked(generateText).mockReset();
  });

  it("skips the model when there is no earlier work or no reply", async () => {
    await expect(
      generateCitations({ records: [], assistantText: "Next cue: look again." }),
    ).resolves.toEqual([]);
    await expect(
      generateCitations({ records, assistantText: "  " }),
    ).resolves.toEqual([]);
    expect(generateText).not.toHaveBeenCalled();
  });

  it("returns an empty list when the model finds no relevance", async () => {
    vi.mocked(generateText).mockResolvedValue({
      output: { citations: [] },
    } as Awaited<ReturnType<typeof generateText>>);

    await expect(
      generateCitations({
        records,
        assistantText: "This week's answer stands on its own.",
      }),
    ).resolves.toEqual([]);
  });
});
