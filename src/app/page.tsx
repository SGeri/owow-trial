import { ChatShell } from "@/components/chat/chat-shell";
import { db } from "@/db";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const requested = Array.isArray(params.session)
    ? params.session[0]
    : params.session;

  const sessions = await db.trustedSession.findMany({
    orderBy: { id: "asc" },
    select: { id: true, memberId: true },
  });

  const sessionId =
    sessions.find((session) => session.id === requested)?.id ??
    sessions[0]?.id;

  if (!sessionId) {
    return (
      <main className="flex h-dvh items-center justify-center px-6 text-sm text-muted-foreground">
        No trusted sessions in the database.
      </main>
    );
  }

  return (
    <ChatShell key={sessionId} sessionId={sessionId} sessions={sessions} />
  );
}
