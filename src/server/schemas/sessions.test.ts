import { describe, expect, it } from "vitest";

import { sessionIdSchema } from "./sessions";

describe("sessionIdSchema", () => {
  it("accepts an id within 1 and 64 characters", () => {
    expect(sessionIdSchema.safeParse("session-101").success).toBe(true);
    expect(sessionIdSchema.safeParse("a".repeat(64)).success).toBe(true);
  });

  it("rejects empty and oversized ids", () => {
    expect(sessionIdSchema.safeParse("").success).toBe(false);
    expect(sessionIdSchema.safeParse("a".repeat(65)).success).toBe(false);
    expect(sessionIdSchema.safeParse(101).success).toBe(false);
  });
});
