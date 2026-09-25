/** Minimal AI SDK UI message stream body for Playwright route mocks. */
export function uiMessageStream(text: string) {
  const chunks = [
    { type: "start", messageId: "msg-e2e-assistant" },
    { type: "text-start", id: "text-1" },
    { type: "text-delta", id: "text-1", delta: text },
    { type: "text-end", id: "text-1" },
    { type: "finish", finishReason: "stop" },
  ];

  const body =
    chunks.map((chunk) => `data: ${JSON.stringify(chunk)}\n\n`).join("") +
    "data: [DONE]\n\n";

  return {
    status: 200,
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "x-vercel-ai-ui-message-stream": "v1",
    },
    body,
  };
}
