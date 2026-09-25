"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  messageMetadataSchema,
  type OttoUIMessage,
} from "@/server/schemas/chat";

import { chatColumnClassName } from "./chat-layout";
import { ChatInput } from "./chat-input";
import { ChatMessages } from "./chat-messages";
import { SessionInfoDialog } from "./session-info-dialog";
import { SessionSelector, type TrustedSessionOption } from "./session-selector";

export function ChatShell({
  sessionId,
  sessions,
  initialMessages,
}: {
  sessionId: string;
  sessions: TrustedSessionOption[];
  initialMessages: OttoUIMessage[];
}) {
  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => ({
          body: {
            sessionId,
            message: messages[messages.length - 1],
          },
        }),
      }),
  );

  const { messages, sendMessage, setMessages, status, error } =
    useChat<OttoUIMessage>({
      id: sessionId,
      messages: initialMessages,
      transport,
    });
  const citationRequests = useRef(new Set<string>());

  useEffect(() => {
    if (status !== "ready") return;

    const message = messages.at(-1);
    if (message?.role !== "assistant") return;
    const metadata = messageMetadataSchema.safeParse(message.metadata ?? {});
    if (
      !metadata.success ||
      metadata.data.citationStatus !== "pending" ||
      citationRequests.current.has(message.id)
    ) {
      return;
    }

    citationRequests.current.add(message.id);
    void fetch("/api/chat/citations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId, messageId: message.id }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Citation request failed");
        const json: unknown = await response.json();
        const nextMetadata = messageMetadataSchema.safeParse({
          ...(typeof json === "object" && json ? json : {}),
          citationStatus: "complete",
        });
        if (!nextMetadata.success) throw new Error("Invalid citation response");

        setMessages((current) =>
          current.map((item) =>
            item.id === message.id
              ? { ...item, metadata: nextMetadata.data }
              : item,
          ),
        );
      })
      .catch(() => {
        citationRequests.current.delete(message.id);
      });
  }, [messages, sessionId, setMessages, status]);

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
            <p className="mt-1 text-sm text-muted-foreground">
              Weekly exercise
            </p>
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
          onSend={(text) => void sendMessage({ text })}
        />
      </div>
    </div>
  );
}
