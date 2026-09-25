import type { CoachContext } from "@/server/controllers/sessions";

export function formatCoachContext(context: CoachContext): string {
  const exercises =
    context.exercises.length === 0
      ? "No exercise question on file for this session."
      : context.exercises
          .map(
            (exercise) =>
              `- week ${exercise.week} (${exercise.id}): ${exercise.question}`,
          )
          .join("\n");

  const records =
    context.records.length === 0
      ? "No earlier exercise-visible history."
      : context.records
          .map((record) => {
            const status = record.status ? ` status=${record.status}` : "";
            const replaced = record.replacedBy
              ? ` replacedBy=${record.replacedBy}`
              : "";
            return `- week ${record.week} ${record.type} (${record.id})${status}${replaced}: ${record.text}`;
          })
          .join("\n");

  return `Member context
Session: ${context.sessionId}
Member: ${context.memberId}

This week's exercise question
${exercises}

Earlier exercise-visible records
${records}`;
}
