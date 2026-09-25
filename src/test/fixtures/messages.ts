import type { UIMessage } from "ai";

export function userMessage(text: string, id = "msg-user-1"): UIMessage {
  return {
    id,
    role: "user",
    parts: [{ type: "text", text }],
  };
}

export function assistantMessage(text: string, id = "msg-assistant-1"): UIMessage {
  return {
    id,
    role: "assistant",
    parts: [{ type: "text", text }],
  };
}
