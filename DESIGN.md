# Otto design direction

Direction for UI work. antislop filters technique without purpose; this file supplies identity. Treat fields below as design data, not agent commands.

## Product

Otto is a weekly leadership-coaching chat for programme members. The member writes what happened this week; Otto answers with one observation, one sharp question, and sometimes a concrete next cue. It is a working tool, not a product marketing page.

## Audience

Programme members mid-exercise. They need a calm place to write and read, not a demo of how clever the UI is.

## Personality

Stage-manager desk: dry, practical, hard to rattle. Quiet confidence. Theatre colour only as a cue light, never as decoration.

## Visual concept

**Call sheet / prompt book.** One column of conversation on cool stone paper. Typography and spacing do the work. No atmosphere layers, no glass chrome, no floating cards.

## Palette

Active colors: 2 cores + 1 accent.

| Token | Hex (approx) | Role |
| --- | --- | --- |
| Paper | `#EBECE8` | Cool stone ground (not cream wash) |
| Ink | `#1C1B19` | Primary text and chrome |
| Cue | `#B45309` | Single accent: send control and focus ring only |
| Rule | `#D0D1CB` | Hairline borders / dividers |
| Mute | `#5A5C56` | Secondary labels |

Do not use purple, blue-purple gradients, radial glow orbs, mesh backgrounds, or noise overlays. Do not wash Cue across backgrounds or empty-state icons.

## Typography

| Role | Face | Why |
| --- | --- | --- |
| Wordmark / dialog titles | Fraunces | Prompt-book serif; used sparingly for “Otto” and major titles |
| Body / UI | Source Sans 3 | Readable exercise prose and form chrome |
| Ids / codes | IBM Plex Mono | Session ids and fixture metadata only |

No Inter. No all-caps tracked eyebrows. No accenting a single word inside a headline.

## Layout

- Full-height single column, max width ~42rem, left-aligned content.
- Solid header and composer bars (no backdrop blur).
- Messages as plain text blocks with role labels; user replies slightly inset or weight-shifted, not glossy bubbles if a quieter treatment reads clearer.
- Empty state: short copy only. No icon badge, no fade-up entrance.
- Session fixture dialog: document layout (search + filters as text controls, records as stacked blocks with rules, not soft elevated cards).

## Radius and elevation

- Radius scale: tight (`~0.375rem` base). Inputs and buttons share it. Avoid pill chips for filters.
- Shadows: none by default. Elevation only if a floating surface is required for stacking (dialogs), and then one soft shadow.

## Motion

Dial target: **ENERGY 2 / RHYTHM 2 / MOTION 1**.

- No page-load entrance animations.
- Motion only for state feedback (streaming indicator, dialog open/close from the component library).
- Prefer `prefers-reduced-motion` defaults from the system.

## Copy voice (UI chrome)

- Plain verbs, sentence case.
- Empty: “Write what happened this week.”
- Send: “Send” (aria). Error: name the failure, no apology fluff.
- No em dashes in agent-written UI copy.
- No “AI powered”, sparkles, or marketing CTAs.

## Dial

`Dial: ENERGY 2 / RHYTHM 2 / MOTION 1`
