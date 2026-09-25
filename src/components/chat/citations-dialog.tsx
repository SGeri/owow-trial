"use client";

import type { Citation } from "@/server/schemas/chat";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CitationsDialog({ citations }: { citations: Citation[] }) {
  const empty = citations.length === 0;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="h-11 self-start px-2 text-sm text-foreground"
          />
        }
      >
        Prior work
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[min(90dvh,40rem)] w-full max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="gap-1 border-b border-border px-5 py-4 pr-12">
          <DialogTitle className="font-heading text-xl tracking-tight">
            Prior work
          </DialogTitle>
          <DialogDescription>
            {empty
              ? "No prior work shaped this reply."
              : "Earlier records this reply used."}
          </DialogDescription>
        </DialogHeader>

        {empty ? (
          <p className="px-5 py-8 text-sm leading-relaxed text-foreground">
            This reply stands on this week&apos;s message.
          </p>
        ) : (
          <div className="max-h-[min(60dvh,24rem)] overflow-y-auto px-5">
            {citations.map((citation) => (
              <article
                key={citation.recordId}
                className="border-b border-border py-4 last:border-b-0"
              >
                <p className="font-mono text-xs text-muted-foreground">
                  week {citation.week} {citation.type}
                </p>
                <p className="mt-2 text-sm leading-relaxed wrap-break-word text-foreground">
                  {citation.text}
                </p>
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-sm text-foreground">Why it mattered</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground">
                    {citation.explanation}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
