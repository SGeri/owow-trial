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
    <div className="relative flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.92_0.04_75/0.55),transparent),radial-gradient(ellipse_60%_40%_at_100%_100%,oklch(0.9_0.03_250/0.4),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.05%22/></svg>')]"
      />

      <header className="relative z-10 border-b border-border/70 bg-background/70 backdrop-blur-md">
        <div
          className={`${chatColumnClassName} flex items-center justify-between gap-4 py-4`}
        >
          <div className="min-w-0 animate-in fade-in slide-in-from-bottom-1 duration-500">
            <p className="font-heading text-2xl leading-none tracking-tight text-foreground">
              Otto
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Weekly exercise
            </p>
          </div>
          <div className="flex animate-in items-center gap-2 fade-in slide-in-from-bottom-1 duration-500 [animation-delay:80ms]">
            <SessionSelector sessions={sessions} sessionId={sessionId} />
            <SessionInfoDialog sessionId={sessionId} />
          </div>
        </div>
      </header>

      {error ? (
        <div className={`relative z-10 ${chatColumnClassName} pt-3`}>
          <Alert variant="destructive">
            <AlertTitle>Couldn’t get a reply</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
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
