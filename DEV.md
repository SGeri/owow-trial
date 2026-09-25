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

`AI_GATEWAY_API_KEY` is optional. Without it, open **session-202** to review the seeded member message, Otto reply, and Prior work citations. Live sends need a key.

## Testing

Unit, component, and database tests use Vitest. End-to-end tests use Playwright against a seeded Postgres database named `owow_test` (not the dev `owow` database). Postgres must be running (`docker compose up -d`).

```bash
pnpm test
pnpm test:coverage
pnpm exec playwright install chromium
pnpm test:e2e
```

If `libnspr4`, `libnss3`, or `libasound2` are not installed, `pnpm test:e2e` downloads those packages with `apt-get download` (no sudo) into `.playwright-libs` and launches Chromium with that library path.

| Script | What it runs |
| --- | --- |
| `pnpm test` | Vitest: Zod and helpers, chat components, Postgres integration, mocked `streamChat` |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:coverage` | Vitest with v8 coverage. Line coverage is gated at 70% for schemas, `listCoachContext` / session controllers, `formatCoachContext`, and `streamChat` |
| `pnpm test:e2e` | Playwright. Builds and starts Next on port 3100 (`.next-e2e`, so it can run beside `pnpm dev`) with `DATABASE_URL` pointed at `owow_test`, and mocks `POST /api/chat` |
| `pnpm test:e2e:ui` | Playwright UI mode |

The test runner forces `DATABASE_URL` to `postgresql://owow:owow@localhost:5432/owow_test`. Override with `TEST_DATABASE_URL`. Admin connection used to create that database defaults to the dev `owow` database; override with `TEST_ADMIN_DATABASE_URL`.

`AI_GATEWAY_API_KEY` is set to a dummy value when missing. Automated tests mock the AI SDK (`generateText` / `streamText`). They do not call the gateway. `SKIP_ENV_VALIDATION=1` is set for the Playwright server only.

Live coaching-quality evals are not part of this suite.

## Environment

Validated at build/runtime via [`src/env.ts`](src/env.ts) ([T3 Env](https://env.t3.gg/docs/nextjs)). Copy [`.env.example`](.env.example) to `.env`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string |
| `AI_GATEWAY_API_KEY` | no | Vercel AI Gateway token. Omit to browse the UI and the seeded session-202 demo thread; required for live coach / citation calls |
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

Load the matching skill before writing in that area. Project skills are in `.agents/skills/`. Routing for antislop also lives in [`AGENTS.md`](AGENTS.md).

| Skill | Use when |
| --- | --- |
| `antislop` (+ `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`) | Any UI, chrome copy, accessibility pass, responsive layout, or comment cleanup. Read [`DESIGN.md`](DESIGN.md) first, then the core filter, then the task skill. Ask during vs after before UI work. Delivery Gate required before shipping UI. |
| `ai-sdk` | Changing `useChat`, `streamText`, transports, or gateway calls. Read the installed docs under `node_modules/ai/docs` — do not rely on memory. |
| `shadcn` | Adding or composing UI components, presets, or theme tokens. Stay inside `DESIGN.md` tokens; do not invent a second palette. |
| `frontend-design` | Extra visual critique after antislop + `DESIGN.md`. Does not replace the filter. |
| `color-palette` | Building or adjusting a Tailwind v4 palette from a brand hex. Must end up matching `DESIGN.md`. |
| `vercel-react-best-practices` | React and Next performance and composition. |
| Prisma skills (`prisma-client-api`, `prisma-cli`) | Queries, migrations, or schema changes. |

Also read `node_modules/next/dist/docs/` before using Next.js APIs. This app’s Next version differs from older training data.

### UI direction (anti-slop)

- Source of direction: [`DESIGN.md`](DESIGN.md) (call sheet / prompt book; dials ENERGY 2 / RHYTHM 2 / MOTION 1).
- Filter: antislop skills above. Technique needs a written purpose; no radial glows, noise overlays, glass chrome stacks, page-load entrance animations, or pill-filter clusters.
- Do not ship UI that would look the same with another product name swapped in.

## What not to do

- No Prisma in client components.
- No secrets in source, prompts, or committed env files.
- No second chat transport.
- No coach, privacy, or persistence logic inside `src/app/api/chat/route.ts`.
- Do not invent member history. Later, only exercise-visible records for the trusted session’s member may reach the model.
