"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { chatColumnClassName } from "./chat-layout";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { SessionInfoDialog } from "./session-info-dialog";
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
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <header className="border-b border-border bg-background">
        <div
          className={`${chatColumnClassName} flex items-center justify-between gap-4 py-3`}
        >
          <div className="min-w-0">
            <p className="font-heading text-2xl leading-none tracking-tight text-foreground">
              Otto
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Weekly exercise</p>
          </div>
          <div className="flex items-center gap-2">
            <SessionSelector sessions={sessions} sessionId={sessionId} />
            <SessionInfoDialog sessionId={sessionId} />
          </div>
        </div>
      </header>

      {error ? (
        <div className={`${chatColumnClassName} pt-3`}>
          <Alert variant="destructive">
            <AlertTitle>Could not get a reply</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col">
        <ChatMessages messages={messages} status={status} />
        <ChatInput
          disabled={busy}
          onSend={(text) => {
            void sendMessage({ text });
          }}
        />
      </div>
    </div>
  );
}
