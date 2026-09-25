# Development guide

How to work in this repo. Server-layer details live in [src/server/SERVER.md](src/server/SERVER.md).

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS v4 and shadcn/ui (`base-nova`) under `src/components/ui`
- Prisma 7 with the Postgres driver adapter (`src/server/db.ts`)
- Vercel AI SDK (`ai`, `@ai-sdk/react`) through the AI Gateway
- Zod at every request boundary

## Setup

```bash
pnpm install
pnpm db:generate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`. The session selector reads trusted sessions from Postgres. Chat posts to `POST /api/chat`.

## Environment

Validated at build/runtime via [`src/env.ts`](src/env.ts) ([T3 Env](https://env.t3.gg/docs/nextjs)). Copy [`.env.example`](.env.example) to `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string |
| `AI_GATEWAY_API_KEY` | yes | Vercel AI Gateway token (passed explicitly into the AI client) |
| `AI_CHAT_MODEL` | no | Override chat model Gateway id (default `openai/gpt-4o-mini`) |
| `SKIP_ENV_VALIDATION` | no | Set to `1` to skip T3 validation (CI edge cases only) |

Do not commit `.env` or put secrets in prompts, fixtures, or docs.

AI usage: import from `@/server/ai` (`chatModel()`, `ai`, `AI_MODELS`). Do not hardcode model strings in route handlers.

## Layering

| Caller | Calls | Does not |
| --- | --- | --- |
| Server Component (`src/app/**/page.tsx`) | a controller | Prisma, the model, request parsing |
| Controller (`src/server/controllers`) | `db` | HTTP, streaming, UI |
| Route Handler (`src/app/api/chat/route.ts`) | Zod, then `streamChat` | business rules, Prisma queries |
| Chat service (`src/server/chat`) | the model | UI components |
| Server Action (`src/server/actions`) | Zod, then a controller | streaming |

Rules:

- Server Components read data by calling controller functions. Do not import `db` from `src/app`.
- Client components never import Prisma or `src/server/db.ts`. Mutations go through a server action. Streaming chat goes through the single `POST /api/chat` endpoint and `useChat`.
- Validate untrusted input with Zod in `src/server/schemas` before it reaches a controller or the model.
- One streaming endpoint. Do not add a second chat route or stream from a server action.
- Privacy filtering (later) is code that drops records before the model call. A prompt instruction is not access control.

## Chat today

`streamChat` uses `chatModel()` from `@/server/ai` (AI Gateway + explicit `AI_GATEWAY_API_KEY`) with one system sentence. It does not load coaching records, apply Otto’s persona, or persist messages. That logic extends `src/server/chat` without growing the route file.

## Agents and skills

Load the matching skill before writing in that area. Project skills are in `.agents/skills/`.

| Skill | Use when |
| --- | --- |
| `ai-sdk` | Changing `useChat`, `streamText`, transports, or gateway calls. Read the installed docs under `node_modules/ai/docs` — do not rely on memory. |
| `shadcn` | Adding or composing UI components, presets, or theme tokens. |
| `frontend-design` | Layout and visual direction. Avoid generic AI aesthetics. |
| `color-palette` | Building or adjusting a Tailwind v4 palette. |
| `vercel-react-best-practices` | React and Next performance and composition. |
| Prisma skills (`prisma-client-api`, `prisma-cli`) | Queries, migrations, or schema changes. |

Also read `node_modules/next/dist/docs/` before using Next.js APIs. This app’s Next version differs from older training data.

## What not to do

- No Prisma in client components.
- No secrets in source, prompts, or committed env files.
- No second chat transport.
- No coach, privacy, or persistence logic inside `src/app/api/chat/route.ts`.
- Do not invent member history. Later, only exercise-visible records for the trusted session’s member may reach the model.
