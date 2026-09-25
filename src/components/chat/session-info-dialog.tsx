"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { InfoIcon, SearchIcon } from "lucide-react";

import { getSessionContextAction } from "@/server/actions";
import type { SessionContext } from "@/server/controllers/sessions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type RecordTypeFilter = "all" | "exercise" | "commitment" | "private_chat";
type VisibilityFilter = "all" | "exercise" | "private_chat";

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="xs"
      variant={active ? "default" : "outline"}
      className={cn(!active && "bg-transparent")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function MetaLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[0.65rem] text-muted-foreground">
      {children}
    </span>
  );
}

export function SessionInfoDialog({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState<SessionContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecordTypeFilter>("all");
  const [visibilityFilter, setVisibilityFilter] =
    useState<VisibilityFilter>("all");

  useEffect(() => {
    if (!open) return;

    startTransition(async () => {
      setError(null);
      const result = await getSessionContextAction(sessionId);
      if (!result.ok) {
        setContext(null);
        setError(result.error);
        return;
      }
      setContext(result.data);
    });
  }, [open, sessionId]);

  const filteredRecords = useMemo(() => {
    if (!context) return [];
    const needle = query.trim().toLowerCase();

    return context.records.filter((record) => {
      if (typeFilter !== "all" && record.type !== typeFilter) return false;
      if (visibilityFilter !== "all" && record.visibility !== visibilityFilter) {
        return false;
      }
      if (!needle) return true;
      return (
        record.id.toLowerCase().includes(needle) ||
        record.text.toLowerCase().includes(needle) ||
        (record.status?.toLowerCase().includes(needle) ?? false) ||
        (record.replacedBy?.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [context, query, typeFilter, visibilityFilter]);

  const filteredScenarios = useMemo(() => {
    if (!context) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return context.scenarios;
    return context.scenarios.filter(
      (scenario) =>
        scenario.id.toLowerCase().includes(needle) ||
        scenario.question.toLowerCase().includes(needle) ||
        scenario.answer.toLowerCase().includes(needle),
    );
  }, [context, query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Session fixture details"
            className="bg-card"
          />
        }
      >
        <InfoIcon />
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[min(90vh,52rem)] w-full max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl"
        showCloseButton
      >
        <DialogHeader className="gap-1 border-b border-border px-5 py-4 pr-12">
          <DialogTitle className="font-heading text-xl tracking-tight">
            Session fixture
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {sessionId}
            {context ? ` · ${context.session.memberId}` : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 border-b border-border px-5 py-3">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by id, text, status…"
              className="bg-card pl-8"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-muted-foreground">Type</span>
            {(
              [
                ["all", "All"],
                ["exercise", "Exercise"],
                ["commitment", "Commitment"],
                ["private_chat", "Private"],
              ] as const
            ).map(([value, label]) => (
              <FilterButton
                key={value}
                active={typeFilter === value}
                onClick={() => setTypeFilter(value)}
              >
                {label}
              </FilterButton>
            ))}
            <Separator orientation="vertical" className="mx-1 h-4" />
            <span className="mr-1 text-xs text-muted-foreground">Visible</span>
            {(
              [
                ["all", "All"],
                ["exercise", "Exercise"],
                ["private_chat", "Private"],
              ] as const
            ).map(([value, label]) => (
              <FilterButton
                key={value}
                active={visibilityFilter === value}
                onClick={() => setVisibilityFilter(value)}
              >
                {label}
              </FilterButton>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {pending && !context ? (
            <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Spinner /> Loading fixture…
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center px-5 text-sm text-destructive">
              {error}
            </div>
          ) : context ? (
            <Tabs defaultValue="records" className="flex h-full min-h-0 flex-col gap-0">
              <div className="border-b border-border px-5 py-2">
                <TabsList variant="line" className="w-full justify-start">
                  <TabsTrigger value="records">
                    Records ({filteredRecords.length})
                  </TabsTrigger>
                  <TabsTrigger value="scenarios">
                    Scenarios ({filteredScenarios.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="records"
                className="min-h-0 flex-1 overflow-hidden data-hidden:hidden"
              >
                <ScrollArea className="h-[min(52vh,28rem)]">
                  <div className="divide-y divide-border px-5">
                    {filteredRecords.length === 0 ? (
                      <p className="py-10 text-center text-sm text-muted-foreground">
                        No records match these filters.
                      </p>
                    ) : (
                      filteredRecords.map((record) => (
                        <article key={record.id} className="py-4">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <MetaLabel>{record.id}</MetaLabel>
                            <MetaLabel>week {record.week}</MetaLabel>
                            <Badge
                              variant={
                                record.type === "private_chat"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {record.type}
                            </Badge>
                            <Badge variant="outline">{record.visibility}</Badge>
                            {record.status ? (
                              <Badge
                                variant={
                                  record.status === "superseded"
                                    ? "outline"
                                    : "default"
                                }
                              >
                                {record.status}
                              </Badge>
                            ) : null}
                            {record.replacedBy ? (
                              <MetaLabel>replaced by {record.replacedBy}</MetaLabel>
                            ) : null}
                          </div>
                          <p className="text-sm leading-relaxed text-foreground">
                            {record.text}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="scenarios"
                className="min-h-0 flex-1 overflow-hidden data-hidden:hidden"
              >
                <ScrollArea className="h-[min(52vh,28rem)]">
                  <div className="divide-y divide-border px-5">
                    {filteredScenarios.length === 0 ? (
                      <p className="py-10 text-center text-sm text-muted-foreground">
                        No scenarios match these filters.
                      </p>
                    ) : (
                      filteredScenarios.map((scenario) => (
                        <article key={scenario.id} className="py-4">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="font-heading text-sm">
                              {scenario.id}
                            </span>
                            <MetaLabel>week {scenario.week}</MetaLabel>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <p className="mb-1 text-xs text-muted-foreground">
                                Question
                              </p>
                              <p className="text-sm leading-relaxed">
                                {scenario.question}
                              </p>
                            </div>
                            <Separator />
                            <div>
                              <p className="mb-1 text-xs text-muted-foreground">
                                Answer
                              </p>
                              <p className="text-sm leading-relaxed">
                                {scenario.answer}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
