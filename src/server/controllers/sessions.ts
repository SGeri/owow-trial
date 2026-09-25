import { db } from "@/server/db";

export async function listTrustedSessions() {
  return db.trustedSession.findMany({
    orderBy: { id: "asc" },
    select: { id: true, memberId: true },
  });
}
