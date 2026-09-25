"use client";

import type { ChatStatus, UIMessage } from "ai";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
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
        <Empty>
          <EmptyHeader>
            <EmptyTitle>This week’s exercise</EmptyTitle>
            <EmptyDescription>
              Write what happened, then send it to Otto.
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
          <MessageScrollerContent className="mx-auto w-full max-w-2xl px-4 py-6">
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
                        <MessageHeader>
                          {isUser ? "You" : "Otto"}
                          {showSpinner ? <Spinner className="ml-2" /> : null}
                        </MessageHeader>
                        <Bubble
                          variant={isUser ? "default" : "muted"}
                          align={isUser ? "end" : "start"}
                        >
                          <BubbleContent>{textFromMessage(message)}</BubbleContent>
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
                      <MessageHeader>Otto</MessageHeader>
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
