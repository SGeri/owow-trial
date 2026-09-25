"use client";

import { useState } from "react";
import { ArrowUpIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    <form
      className="mx-auto flex w-full max-w-2xl items-end gap-2 px-4 pb-4"
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
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
      />
      <Button type="submit" size="icon" disabled={!canSend} aria-label="Send">
        <ArrowUpIcon />
      </Button>
    </form>
  );
}
