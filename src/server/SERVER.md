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
    sessions.ts          listTrustedSessions(), getSessionContext()
  schemas/               Zod schemas for untrusted input.
    chat.ts              chatRequestSchema
    sessions.ts          sessionIdSchema
  chat/                  Model calls and coaching flow.
    stream-chat.ts       streamChat() — uses `chatModel()` from `ai/`
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

**Chat.** Extend `src/server/chat/`. The route stays a parse-and-delegate handler. Models come from `@/server/ai` (`chatModel()`), authenticated with `env.AI_GATEWAY_API_KEY` via `createGateway`. The current call is:

- model: `chatModel()` → default `openai/gpt-4o-mini` (overridable with `AI_CHAT_MODEL`)
- system: one sentence
- messages: `convertToModelMessages`, then `streamText` → `toUIMessageStream` + `createUIMessageStreamResponse`

`sessionId` is accepted on the request so the client can send it. It is not used yet. When coach context lands, resolve the trusted session inside `chat/` (or a controller it calls), filter records in code, then pass the result into `streamText`. Do not put that in the route.

## Naming

- Controllers: verb + noun, one file per area (`sessions.ts`).
- Schemas: `<area>RequestSchema` / `<area>Schema` in `schemas/`.
- Chat helpers: verb phrases (`streamChat`).
- No React components in this directory.

## Next, not now

Otto’s persona, privacy filtering, exercise persistence, and scenario loading belong in `chat/` and new controllers. They are intentionally absent from this scaffold.
