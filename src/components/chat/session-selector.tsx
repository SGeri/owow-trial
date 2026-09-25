"use client";

import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TrustedSessionOption = {
  id: string;
  memberId: string;
  scenarioId: string | null;
  empty: boolean;
  label: string;
};

export function SessionSelector({
  sessions,
  sessionId,
}: {
  sessions: TrustedSessionOption[];
  sessionId: string;
}) {
  const router = useRouter();

  return (
    <Select
      value={sessionId}
      onValueChange={(value) => {
        if (value == null) return;
        router.replace(`/?session=${encodeURIComponent(value)}`);
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label="Trusted session"
        className="min-w-36 bg-card font-mono text-xs"
      >
        <SelectValue>
          {(value: string | null) => value ?? "Session"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        alignItemWithTrigger={false}
        className="min-w-(--anchor-width) w-max"
      >
        {sessions.map((session) => (
          <SelectItem key={session.id} value={session.id} className="text-xs">
            <span className="font-mono">{session.id}</span>
            <span className="text-muted-foreground">{session.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
