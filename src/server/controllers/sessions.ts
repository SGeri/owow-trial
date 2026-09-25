import { RecordVisibility } from "@/generated/prisma/client";

import { db } from "@/server/db";

export async function listTrustedSessions() {
  const sessions = await db.trustedSession.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      memberId: true,
      scenarios: { select: { id: true }, orderBy: { week: "asc" }, take: 1 },
      member: {
        select: {
          _count: {
            select: {
              records: {
                where: { visibility: RecordVisibility.exercise },
              },
            },
          },
        },
      },
    },
  });

  return sessions.map((session) => {
    const exerciseRecordCount = session.member._count.records;
    const scenarioId = session.scenarios[0]?.id ?? null;
    const empty = exerciseRecordCount === 0;

    return {
      id: session.id,
      memberId: session.memberId,
      scenarioId,
      empty,
      label: empty
        ? "empty"
        : (scenarioId ?? session.id),
    };
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

export type CoachContext = {
  sessionId: string;
  memberId: string;
  records: Array<{
    id: string;
    type: string;
    week: number;
    text: string;
    status: string | null;
    replacedBy: string | null;
  }>;
  exercises: Array<{
    id: string;
    week: number;
    question: string;
  }>;
};

/** Exercise-visible records and scenario questions for the coach prompt. No private chat. */
export async function listCoachContext(
  sessionId: string,
): Promise<CoachContext | null> {
  const session = await db.trustedSession.findUnique({
    where: { id: sessionId },
    select: { id: true, memberId: true },
  });

  if (!session) {
    return null;
  }

  const [records, scenarios] = await Promise.all([
    db.coachingRecord.findMany({
      where: {
        memberId: session.memberId,
        visibility: RecordVisibility.exercise,
      },
      orderBy: [{ week: "asc" }, { type: "asc" }, { id: "asc" }],
      select: {
        id: true,
        type: true,
        week: true,
        text: true,
        status: true,
        replacedBy: true,
      },
    }),
    db.scenario.findMany({
      where: { trustedSessionId: session.id },
      orderBy: [{ week: "asc" }, { id: "asc" }],
      select: { id: true, week: true, question: true },
    }),
  ]);

  return {
    sessionId: session.id,
    memberId: session.memberId,
    records,
    exercises: scenarios,
  };
}
