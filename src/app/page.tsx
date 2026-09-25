import { ChatShell } from "@/components/chat/chat-shell";
import { listMessagesForSession } from "@/server/controllers/threads";
import { listTrustedSessions } from "@/server/controllers/sessions";

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const requested = Array.isArray(params.session)
    ? params.session[0]
    : params.session;

  const sessions = await listTrustedSessions();

  const sessionId =
    sessions.find((session) => session.id === requested)?.id ?? sessions[0]?.id;

  if (!sessionId) {
    return (
      <main className="flex h-dvh items-center justify-center px-6 text-sm text-muted-foreground">
        No trusted sessions in the database.
      </main>
    );
  }

  const initialMessages = await listMessagesForSession(sessionId);

  return (
    <ChatShell
      key={sessionId}
      sessionId={sessionId}
      sessions={sessions}
      initialMessages={initialMessages}
    />
  );
}
