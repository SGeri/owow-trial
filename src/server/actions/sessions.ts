"use server";

import { getSessionContext } from "@/server/controllers/sessions";
import { sessionIdSchema } from "@/server/schemas/sessions";

export async function getSessionContextAction(input: unknown) {
  const parsed = sessionIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid session id" };
  }

  const data = await getSessionContext(parsed.data);
  if (!data) {
    return { ok: false as const, error: "Session not found" };
  }

  return { ok: true as const, data };
}
