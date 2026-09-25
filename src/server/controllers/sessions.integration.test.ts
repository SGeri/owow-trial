import { beforeEach, describe, expect, it } from "vitest";

import { seedTestDatabase } from "@/test/ensure-db";

import {
  getSessionContext,
  listCoachContext,
  listTrustedSessions,
} from "./sessions";

const privateSnippets = [
  "leaving my job",
  "argument with my manager",
];

describe("session controllers", () => {
  beforeEach(async () => {
    await seedTestDatabase();
  });

  it("lists seeded trusted sessions in id order", async () => {
    const sessions = await listTrustedSessions();
    expect(sessions.map((session) => session.id)).toEqual([
      "session-101",
      "session-202",
      "session-303",
    ]);
  });

  it("keeps private chat and other members out of coach context", async () => {
    const session101 = await listCoachContext("session-101");
    const session202 = await listCoachContext("session-202");

    expect(session101).not.toBeNull();
    expect(session202).not.toBeNull();

    const ids = [
      ...session101!.records.map((record) => record.id),
      ...session202!.records.map((record) => record.id),
    ];

    expect(ids).toContain("ex-101-0");
    expect(ids).toContain("com-202-1");
    expect(ids).not.toContain("chat-101-1");
    expect(ids).not.toContain("chat-202-1");
    expect(ids).not.toContain("com-404-1");

    const blob = JSON.stringify({ session101, session202 });
    for (const snippet of privateSnippets) {
      expect(blob).not.toContain(snippet);
    }
    expect(blob).not.toContain("member-404");
    expect(session101!.memberId).toBe("member-101");
    expect(session202!.records.every((record) => record.id.startsWith("ex-202") || record.id.startsWith("com-202"))).toBe(true);

    const superseded = session202!.records.find((record) => record.id === "com-202-1");
    expect(superseded).toMatchObject({
      status: "superseded",
      replacedBy: "com-202-2",
    });
  });

  it("returns null coach context for an unknown session", async () => {
    expect(await listCoachContext("missing")).toBeNull();
  });

  it("returns empty records for the no-history session", async () => {
    const context = await listCoachContext("session-303");

    expect(context).not.toBeNull();
    expect(context!.memberId).toBe("member-303");
    expect(context!.records).toEqual([]);
    expect(context!.exercises.map((exercise) => exercise.id)).toContain(
      "no-history",
    );
  });

  it("includes private chat in the fixture viewer context", async () => {
    const context = await getSessionContext("session-101");
    expect(context?.records.map((record) => record.id)).toContain("chat-101-1");
    expect(context?.records.map((record) => record.visibility)).toContain(
      "private_chat",
    );
    expect(context?.scenarios.map((scenario) => scenario.id)).toContain(
      "continuity",
    );
    expect(await getSessionContext("missing")).toBeNull();
  });
});
