<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- antislop:start -->

## antislop

For UI, copy, people, mobile layout, or code comments work:

1. Read [`DESIGN.md`](DESIGN.md) for direction (palette, type, layout, dials).
2. Read [`.agents/skills/antislop/SKILL.md`](.agents/skills/antislop/SKILL.md) as the filter.
3. Then the skill for the task:
   - UI / visual: `.agents/skills/antislop-ui/SKILL.md`
   - Copy & text: `.agents/skills/antislop-copywriting/SKILL.md`
   - People: `.agents/skills/antislop-human/SKILL.md`
   - Mobile / responsive: `.agents/skills/antislop-layoutmobile/SKILL.md`
   - Code comments: `.agents/skills/antislop-code/SKILL.md`

Before starting UI work, ask when antislop applies: during the work, or after it is done. Run the Delivery Gate before shipping UI.

Update later with `npx antislop-ai --update` or `npx skills add miqdadbadjuber/anti-slop`.

<!-- antislop:end -->
