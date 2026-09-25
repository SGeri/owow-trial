import { generateText, Output } from "ai";
import { z } from "zod";

import { AI_MODELS, ai, gatewayProviderOptions } from "@/server/ai";
import {
  citationSchema,
  type Citation,
} from "@/server/schemas/chat";

import { CITATION_INSTRUCTIONS } from "./prompts";

export type CitationSourceRecord = {
  id: string;
  type: string;
  week: number;
  text: string;
  status: string | null;
  replacedBy: string | null;
};

const citationOutputSchema = z.object({
  citations: z.array(
    z.object({
      recordId: z.string(),
      explanation: z.string(),
    }),
  ),
});

function formatCitationRecords(records: CitationSourceRecord[]) {
  return records
    .map((record) => {
      const status = record.status ? ` status=${record.status}` : "";
      const replaced = record.replacedBy
        ? ` replacedBy=${record.replacedBy}`
        : "";
      return `- week ${record.week} ${record.type} (${record.id})${status}${replaced}: ${record.text}`;
    })
    .join("\n");
}

/** Keep only ids that exist on the records the model was shown, and copy display fields from those rows. */
export function enrichCitations(
  records: CitationSourceRecord[],
  raw: Array<{ recordId: string; explanation: string }>,
): Citation[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  const seen = new Set<string>();
  const citations: Citation[] = [];

  for (const item of raw) {
    const recordId = item.recordId.trim();
    const explanation = item.explanation.trim();
    if (!recordId || !explanation || seen.has(recordId)) continue;

    const record = byId.get(recordId);
    if (!record) continue;
    if (record.type !== "exercise" && record.type !== "commitment") continue;

    seen.add(recordId);
    const parsed = citationSchema.safeParse({
      recordId,
      week: record.week,
      type: record.type,
      text: record.text,
      explanation,
    });
    if (parsed.success) citations.push(parsed.data);
  }

  return citations;
}

export async function generateCitations(input: {
  records: CitationSourceRecord[];
  assistantText: string;
}): Promise<Citation[]> {
  const assistantText = input.assistantText.trim();
  if (input.records.length === 0 || assistantText.length === 0) {
    return [];
  }

  const result = await generateText({
    model: ai.chat(AI_MODELS.citations),
    system: CITATION_INSTRUCTIONS,
    prompt: `Earlier exercises and commitments\n${formatCitationRecords(input.records)}\n\nCoaching reply\n${assistantText}`,
    output: Output.object({ schema: citationOutputSchema }),
    providerOptions: gatewayProviderOptions(),
  });

  return enrichCitations(input.records, result.output.citations);
}
