import { beforeEach, describe, expect, it } from "vitest";

import { seedTestDatabase } from "@/test/ensure-db";

import { getSessionContextAction } from "./sessions";

describe("getSessionContextAction", () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  it("rejects an invalid session id", async () => {
    await expect(getSessionContextAction("")).resolves.toEqual({
      ok: false,
      error: "Invalid session id",
    });
    await expect(getSessionContextAction("a".repeat(65))).resolves.toEqual({
      ok: false,
      error: "Invalid session id",
    });
  });

  it("reports a missing session", async () => {
    await expect(getSessionContextAction("missing-session")).resolves.toEqual({
      ok: false,
      error: "Session not found",
    });
  });

  it("returns fixture records for a seeded session", async () => {
    const result = await getSessionContextAction("session-101");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.session.memberId).toBe("member-101");
    expect(result.data.records.map((record) => record.id)).toContain("chat-101-1");
    expect(result.data.scenarios.map((scenario) => scenario.id)).toContain(
      "continuity",
    );
  });
});
