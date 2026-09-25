"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { SessionSelector, type TrustedSessionOption } from "./session-selector";

export function ChatShell({
  sessionId,
  sessions,
}: {
  sessionId: string;
  sessions: TrustedSessionOption[];
}) {
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, id }) => ({
          body: { messages, id, sessionId },
        }),
      }),
  );

  const { messages, sendMessage, status, error } = useChat({
    id: sessionId,
    transport,
  });

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-background">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Otto</p>
          <p className="text-xs text-muted-foreground">Weekly exercise</p>
        </div>
        <SessionSelector sessions={sessions} sessionId={sessionId} />
      </header>

      {error ? (
        <div className="mx-auto w-full max-w-2xl px-4 pt-3">
          <Alert variant="destructive">
            <AlertTitle>Couldn’t get a reply</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <ChatMessages messages={messages} status={status} />
      <ChatInput
        disabled={busy}
        onSend={(text) => {
          void sendMessage({ text });
        }}
      />
    </div>
  );
}
