import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { COACHING_METHOD, OTTO_PERSONA, REFUSAL_INSTRUCTIONS } from "./prompts";

const source = readFileSync("docs/SIMPLIFIED_PROMPT.md", "utf8");
const opening = source.split("\n\n")[0]?.trim();

describe("prompt contract", () => {
  it("keeps Otto's opening aligned with the simplified prompt", () => {
    expect(opening?.length).toBeGreaterThan(0);
    expect(OTTO_PERSONA.startsWith(opening ?? "")).toBe(true);
  });

  it("keeps continuity, revision, and no-history rules in the persona", () => {
    expect(OTTO_PERSONA).toContain("superseded commitment");
    expect(OTTO_PERSONA).toContain("No history:");
    expect(OTTO_PERSONA).toContain("Next cue:");
    expect(source).toContain("Next cue:");
  });

  it("tells the model that private chat is already filtered", () => {
    expect(COACHING_METHOD).toContain("replacedBy");
    expect(COACHING_METHOD).toContain("superseded");
    expect(COACHING_METHOD).toContain("Private-chat records");
    expect(REFUSAL_INSTRUCTIONS).toContain("do not do");
  });
});
