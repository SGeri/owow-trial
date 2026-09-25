import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  CommitmentStatus,
  PrismaClient,
  RecordType,
  RecordVisibility,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const fixture = {
  trustedSessions: [
    { id: "session-101", memberId: "member-101" },
    { id: "session-202", memberId: "member-202" },
    { id: "session-303", memberId: "member-303" },
  ],
  records: [
    {
      id: "ex-101-0",
      memberId: "member-101",
      type: RecordType.exercise,
      visibility: RecordVisibility.exercise,
      week: 0,
      text: "I keep taking ownership of every status update instead of delegating.",
    },
    {
      id: "com-101-0",
      memberId: "member-101",
      type: RecordType.commitment,
      visibility: RecordVisibility.exercise,
      week: 0,
      status: CommitmentStatus.completed,
      text: "I will ask a colleague to run Monday's status roundup.",
    },
    {
      id: "ex-101-1",
      memberId: "member-101",
      type: RecordType.exercise,
      visibility: RecordVisibility.exercise,
      week: 1,
      text: "I postponed a difficult conversation with a colleague because I wanted more information first.",
    },
    {
      id: "com-101-1",
      memberId: "member-101",
      type: RecordType.commitment,
      visibility: RecordVisibility.exercise,
      week: 1,
      status: CommitmentStatus.active,
      text: "By Friday, I will ask my colleague what delivery risk they see.",
    },
    {
      id: "chat-101-1",
      memberId: "member-101",
      type: RecordType.private_chat,
      visibility: RecordVisibility.private_chat,
      week: 1,
      text: "I am thinking about leaving my job.",
    },
    {
      id: "ex-202-0",
      memberId: "member-202",
      type: RecordType.exercise,
      visibility: RecordVisibility.exercise,
      week: 0,
      text: "My team could not tell which requests were most important.",
    },
    {
      id: "com-202-0",
      memberId: "member-202",
      type: RecordType.commitment,
      visibility: RecordVisibility.exercise,
      week: 0,
      status: CommitmentStatus.completed,
      text: "I will publish our top three priorities each Monday.",
    },
    {
      id: "ex-202-1",
      memberId: "member-202",
      type: RecordType.exercise,
      visibility: RecordVisibility.exercise,
      week: 1,
      text: "I agreed to several urgent requests without asking what should be delayed.",
    },
    {
      id: "com-202-1",
      memberId: "member-202",
      type: RecordType.commitment,
      visibility: RecordVisibility.exercise,
      week: 1,
      status: CommitmentStatus.superseded,
      replacedBy: "com-202-2",
      text: "I will decline every unplanned request this week.",
    },
    {
      id: "com-202-2",
      memberId: "member-202",
      type: RecordType.commitment,
      visibility: RecordVisibility.exercise,
      week: 1,
      status: CommitmentStatus.active,
      text: "On Monday, I will ask my manager to rank new requests against our current priorities.",
    },
    {
      id: "chat-202-1",
      memberId: "member-202",
      type: RecordType.private_chat,
      visibility: RecordVisibility.private_chat,
      week: 1,
      text: "I had an argument with my manager about my future on the team.",
    },
    {
      id: "com-404-1",
      memberId: "member-404",
      type: RecordType.commitment,
      visibility: RecordVisibility.exercise,
      week: 1,
      status: CommitmentStatus.active,
      text: "By Friday, I will ask my colleague what delivery risk they see.",
    },
  ],
  scenarios: [
    {
      id: "continuity",
      trustedSessionId: "session-101",
      week: 2,
      question:
        "Which conversation or decision did you postpone this week, and what happened?",
      answer:
        "I postponed the conversation again. I told myself I needed more data, but I did not ask my colleague what they thought.",
    },
    {
      id: "revised-commitment",
      trustedSessionId: "session-202",
      week: 2,
      question:
        "Which conversation or decision did you postpone this week, and what happened?",
      answer:
        "Another urgent request arrived. I paused before saying yes, but I still have not asked my manager which existing priority should move.",
    },
    {
      id: "no-history",
      trustedSessionId: "session-303",
      week: 2,
      question:
        "Which conversation or decision did you postpone this week, and what happened?",
      answer:
        "I avoided telling a teammate that we are likely to miss a deadline.",
    },
  ],
} as const;

async function main() {
  await prisma.scenario.deleteMany();
  await prisma.coachingRecord.deleteMany();
  await prisma.trustedSession.deleteMany();
  await prisma.member.deleteMany();

  const memberIds = [
    ...new Set([
      ...fixture.trustedSessions.map((s) => s.memberId),
      ...fixture.records.map((r) => r.memberId),
    ]),
  ];

  await prisma.member.createMany({
    data: memberIds.map((id) => ({ id })),
  });

  await prisma.trustedSession.createMany({
    data: [...fixture.trustedSessions],
  });

  await prisma.coachingRecord.createMany({
    data: fixture.records.map((record) => ({
      id: record.id,
      memberId: record.memberId,
      type: record.type,
      visibility: record.visibility,
      week: record.week,
      text: record.text,
      status: "status" in record ? record.status : null,
      replacedBy: "replacedBy" in record ? record.replacedBy : null,
    })),
  });

  await prisma.scenario.createMany({
    data: [...fixture.scenarios],
  });

  console.log(
    `Seeded ${memberIds.length} members, ${fixture.trustedSessions.length} sessions, ${fixture.records.length} records, ${fixture.scenarios.length} scenarios.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
