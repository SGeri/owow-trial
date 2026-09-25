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
    <div className="border-t border-border bg-background">
      <form
        className={`${chatColumnClassName} flex items-end gap-2 py-3`}
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
          className="min-h-[3.25rem] resize-none bg-card"
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
          className="size-11 shrink-0 bg-cue text-cue-foreground hover:bg-cue/90"
        >
          <ArrowUpIcon />
        </Button>
      </form>
    </div>
  );
}
