import { generateCitations } from "@/server/chat/citations";
import { listCoachContext } from "@/server/controllers/sessions";
import {
  getAssistantMessageForSession,
  setMessageCitationsForSession,
} from "@/server/controllers/threads";
import { citationRequestSchema } from "@/server/schemas/chat";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = citationRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid citation request" },
      { status: 400 },
    );
  }

  const { sessionId, messageId } = parsed.data;
  const [message, context] = await Promise.all([
    getAssistantMessageForSession(sessionId, messageId),
    listCoachContext(sessionId),
  ]);
  if (!message || !context) {
    return Response.json({ error: "Message not found" }, { status: 404 });
  }

  const assistantText = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
  const citations = await generateCitations({
    records: context.records,
    assistantText,
  });
  const saved = await setMessageCitationsForSession(
    sessionId,
    messageId,
    citations,
  );
  if (!saved) {
    return Response.json({ error: "Message not found" }, { status: 404 });
  }

  return Response.json({ citations });
}
