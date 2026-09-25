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
      <SelectTrigger size="sm" aria-label="Trusted session">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {sessions.map((session) => (
          <SelectItem key={session.id} value={session.id}>
            {session.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
