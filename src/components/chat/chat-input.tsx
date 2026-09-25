"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { chatColumnClassName } from "./chat-layout";

const chatInputSchema = z.object({
  message: z.string().trim().min(1, "Enter a message"),
});

type ChatInputValues = z.infer<typeof chatInputSchema>;

export function ChatInput({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { isValid },
  } = useForm<ChatInputValues>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: { message: "" },
    mode: "onChange",
  });

  useEffect(() => {
    void trigger();
  }, [trigger]);

  const canSend = !disabled && isValid;

  function onSubmit(values: ChatInputValues) {
    if (disabled) return;
    onSend(values.message);
    reset();
    void trigger();
  }

  return (
    <div className="border-t border-border bg-background">
      <form
        className={`${chatColumnClassName} flex items-end gap-2 py-3`}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Textarea
          {...register("message")}
          placeholder="What happened this week?"
          disabled={disabled}
          rows={2}
          className="min-h-[3.25rem] resize-none bg-card"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSubmit(onSubmit)();
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
