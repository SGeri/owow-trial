"use client";

import type { ChatStatus, UIMessage } from "ai";

import {
  Message,
  MessageContent,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Spinner } from "@/components/ui/spinner";

import { chatColumnClassName } from "./chat-layout";

function textFromMessage(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatMessages({
  messages,
  status,
}: {
  messages: UIMessage[];
  status: ChatStatus;
}) {
  const pending = status === "submitted" || status === "streaming";

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <p className="font-heading text-xl tracking-tight text-foreground">
            This week&apos;s exercise
          </p>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">
            Write what happened. Otto answers with one clear next cue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MessageScrollerProvider>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent
            className={`${chatColumnClassName} flex h-max min-h-full flex-col gap-5 py-6`}
          >
            <MessageGroup>
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const isLast = index === messages.length - 1;
                const showSpinner =
                  pending && isLast && !isUser && status === "streaming";

                return (
                  <MessageScrollerItem key={message.id} scrollAnchor>
                    <Message align={isUser ? "end" : "start"}>
                      <MessageContent className="max-w-[min(100%,36rem)]">
                        <MessageHeader className="text-[0.7rem] text-muted-foreground">
                          {isUser ? "You" : "Otto"}
                          {showSpinner ? <Spinner className="ml-2" /> : null}
                        </MessageHeader>
                        <p
                          className={
                            isUser
                              ? "rounded-md border border-border bg-card px-3 py-2 text-sm leading-relaxed"
                              : "text-sm leading-relaxed"
                          }
                        >
                          {textFromMessage(message)}
                        </p>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              })}
              {status === "submitted" ? (
                <MessageScrollerItem scrollAnchor>
                  <Message align="start">
                    <MessageContent>
                      <MessageHeader className="text-[0.7rem] text-muted-foreground">
                        Otto
                      </MessageHeader>
                      <Spinner />
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>
              ) : null}
            </MessageGroup>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}
