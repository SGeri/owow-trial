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
        className="min-w-40 bg-card font-mono text-xs shadow-sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {sessions.map((session) => (
          <SelectItem key={session.id} value={session.id} className="font-mono text-xs">
            {session.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
