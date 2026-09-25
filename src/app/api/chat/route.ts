import { streamChat } from "@/server/chat/stream-chat";
import { chatRequestSchema } from "@/server/schemas/chat";

export async function POST(req: Request) {
  const json = await req
    .json()
    .catch(() =>
      Response.json({ error: "Invalid chat request" }, { status: 400 }),
    );
  const parsed = chatRequestSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json({ error: "Invalid chat request" }, { status: 400 });
  }

  return streamChat(parsed.data);
}
