"use client";

import type { ChatStatus, UIMessage } from "ai";
import { MessageSquareTextIcon } from "lucide-react";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
        <Empty className="animate-in fade-in slide-in-from-bottom-2 border-0 duration-700">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-accent text-accent-foreground">
              <MessageSquareTextIcon />
            </EmptyMedia>
            <EmptyTitle className="font-heading text-xl tracking-tight">
              This week’s exercise
            </EmptyTitle>
            <EmptyDescription className="max-w-sm text-pretty">
              Write what happened. Otto will answer with one clear next cue.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <MessageScrollerProvider>
      <MessageScroller className="min-h-0 flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent
            className={`${chatColumnClassName} flex h-max min-h-full flex-col gap-6 py-6`}
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
                      <MessageContent>
                        <MessageHeader className="text-[0.7rem]">
                          {isUser ? "You" : "Otto"}
                          {showSpinner ? <Spinner className="ml-2" /> : null}
                        </MessageHeader>
                        <Bubble
                          variant={isUser ? "default" : "muted"}
                          align={isUser ? "end" : "start"}
                        >
                          <BubbleContent className="leading-relaxed">
                            {textFromMessage(message)}
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              })}
              {status === "submitted" ? (
                <MessageScrollerItem scrollAnchor>
                  <Message align="start">
                    <MessageContent>
                      <MessageHeader className="text-[0.7rem]">
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
