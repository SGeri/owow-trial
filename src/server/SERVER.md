# Server layer

Code under `src/server` is the backend. UI routes stay thin.

## Map

```
src/server/
  db.ts                  Prisma client (Postgres adapter). Server-only.
  controllers/           Data access functions pages and actions call.
    sessions.ts          listTrustedSessions()
  schemas/               Zod schemas for untrusted input.
    chat.ts              chatRequestSchema
  chat/                  Model calls and coaching flow.
    stream-chat.ts       streamChat() — one system sentence, AI Gateway
  actions/               Server Actions for client mutations.
    index.ts             Barrel. Add `"use server"` modules and re-export them.
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

**Chat.** Extend `src/server/chat/`. The route stays a parse-and-delegate handler. The current call is:

- model: `openai/gpt-4o-mini` (AI Gateway string id; needs `AI_GATEWAY_API_KEY`)
- system: one sentence
- messages: `convertToModelMessages`, then `streamText` → `toUIMessageStreamResponse()`

`sessionId` is accepted on the request so the client can send it. It is not used yet. When coach context lands, resolve the trusted session inside `chat/` (or a controller it calls), filter records in code, then pass the result into `streamText`. Do not put that in the route.

## Naming

- Controllers: verb + noun, one file per area (`sessions.ts`).
- Schemas: `<area>RequestSchema` / `<area>Schema` in `schemas/`.
- Chat helpers: verb phrases (`streamChat`).
- No React components in this directory.

## Next, not now

Otto’s persona, privacy filtering, exercise persistence, and scenario loading belong in `chat/` and new controllers. They are intentionally absent from this scaffold.
