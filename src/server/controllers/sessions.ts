import { db } from "@/server/db";

export async function listTrustedSessions() {
  return db.trustedSession.findMany({
    orderBy: { id: "asc" },
    select: { id: true, memberId: true },
  });
}

export type SessionContext = {
  session: {
    id: string;
    memberId: string;
  };
  records: Array<{
    id: string;
    memberId: string;
    type: string;
    visibility: string;
    week: number;
    text: string;
    status: string | null;
    replacedBy: string | null;
  }>;
  scenarios: Array<{
    id: string;
    trustedSessionId: string;
    week: number;
    question: string;
    answer: string;
  }>;
};

export async function getSessionContext(
  sessionId: string,
): Promise<SessionContext | null> {
  const session = await db.trustedSession.findUnique({
    where: { id: sessionId },
    select: { id: true, memberId: true },
  });

  if (!session) {
    return null;
  }

  const [records, scenarios] = await Promise.all([
    db.coachingRecord.findMany({
      where: { memberId: session.memberId },
      orderBy: [{ week: "asc" }, { type: "asc" }, { id: "asc" }],
      select: {
        id: true,
        memberId: true,
        type: true,
        visibility: true,
        week: true,
        text: true,
        status: true,
        replacedBy: true,
      },
    }),
    db.scenario.findMany({
      where: { trustedSessionId: session.id },
      orderBy: [{ week: "asc" }, { id: "asc" }],
      select: {
        id: true,
        trustedSessionId: true,
        week: true,
        question: true,
        answer: true,
      },
    }),
  ]);

  return { session, records, scenarios };
}
