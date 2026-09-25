# Server layer

Code under `src/server` is the backend. UI routes stay thin.

## Map

```
src/server/
  db.ts                  Prisma client (Postgres adapter). Server-only.
  ai/                    Vercel AI Gateway client (typed models, explicit API key).
    index.ts             Public barrel: `ai`, `chatModel`, `AI_MODELS`, …
    client.ts            Shared Gateway singleton
    gateway.ts           `createAiGateway({ apiKey })`
    models.ts            Named roles + `GatewayModelId` helpers
  controllers/           Data access functions pages and actions call.
    sessions.ts          listTrustedSessions(), getSessionContext(), listCoachContext()
    threads.ts           getOrCreateThreadForSession, list/replace UIMessages
  schemas/               Zod schemas for untrusted input.
    chat.ts              chatRequestSchema ({ sessionId, message })
    sessions.ts          sessionIdSchema
  chat/                  Model calls and coaching flow.
    prompts.ts           Otto persona, coaching method, guardrail, refusal
    constants.ts         Pipeline model roles
    context.ts           formatCoachContext
    stream-chat.ts       Guardrail, then coach or refusal stream; persist onEnd
  actions/               Server Actions for client calls.
    index.ts             Barrel
    sessions.ts          getSessionContextAction
```

`POST /api/chat` (`src/app/api/chat/route.ts`) parses the body and returns `streamChat`. It does not query the database or build prompts beyond what `streamChat` already does.

## Patterns

**Reads from a Server Component.** Call a controller. Example: `src/app/page.tsx` calls `listTrustedSessions()` and does not import `db`.

**Add a controller.** Create `src/server/controllers/<name>.ts`. Export async functions that take already-trusted arguments and return data. Import `db` only here (or in another server module that is not a React component). Keep functions small and named for the use case (`listTrustedSessions`, not `getData`).

**Client mutation.** Add `src/server/actions/<name>.ts`:

```ts
"use server";

export async function saveSomething(input: unknown) {
  const data = somethingSchema.parse(input);
  return doSomething(data);
}
```

Re-export it from `actions/index.ts`. Actions validate, then call a controller. They do not embed Prisma queries or stream tokens.

**Chat.** Extend `src/server/chat/`. The route stays a parse-and-delegate handler. Models come from `@/server/ai` (`chatModel()`), authenticated with `env.AI_GATEWAY_API_KEY` via `createGateway`.

Each trusted session has one `ChatThread`. Messages are stored as AI SDK `UIMessage` rows: `role` plus `parts` JSON (and optional `metadata`). Do not persist a flattened text column.

The client sends only the latest message plus `sessionId`. `streamChat`:

1. Resolves or creates the session thread and loads prior `UIMessage[]`.
2. Appends the new message and runs `validateUIMessages`.
3. Classifies the latest user text with `generateText` + `Output.object` (`PIPELINE_MODELS.guardrail`). Prompts live in `src/server/chat/prompts.ts`.
4. If blocked, streams a refusal (`REFUSAL_INSTRUCTIONS`) with no member records.
5. If allowed, streams Otto (`OTTO_PERSONA` + `COACHING_METHOD` + `formatCoachContext`). Context comes from `listCoachContext`: exercise-visible records for that member, plus scenario questions. Private chat and other members are dropped in the query, not by the prompt.
6. Both branches use the same `toUIMessageStream` `onEnd` save. `consumeStream()` keeps the save running if the client disconnects.

Do not put prompt text or record queries in the route.

## Naming

- Controllers: verb + noun, one file per area (`sessions.ts`).
- Schemas: `<area>RequestSchema` / `<area>Schema` in `schemas/`.
- Chat helpers: verb phrases (`streamChat`).
- No React components in this directory.

## Next, not now

Output guardrails, exercise writes, and human review are not in this pipeline.
