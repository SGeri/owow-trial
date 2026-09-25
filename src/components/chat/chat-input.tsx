"use client";

import { useState } from "react";
import { ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { chatColumnClassName } from "./chat-layout";

export function ChatInput({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const canSend = !disabled && input.trim().length > 0;

  function submit() {
    const text = input.trim();
    if (!text || disabled) return;
    onSend(text);
    setInput("");
  }

  return (
    <div className="relative z-10 border-t border-border/70 bg-background/80 backdrop-blur-md">
      <form
        className={`${chatColumnClassName} flex items-end gap-2 py-4`}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Textarea
          value={input}
          placeholder="What happened this week?"
          disabled={disabled}
          rows={2}
          className="min-h-[3.25rem] resize-none bg-card shadow-sm"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label="Send"
          className="size-10 shrink-0 rounded-xl"
        >
          <ArrowUpIcon />
        </Button>
      </form>
    </div>
  );
}
