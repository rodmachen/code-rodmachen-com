# Phase 1 Plan: Next.js + Classicy visual foundation for code.rodmachen.com

## Context

`code.rodmachen.com` is being rebuilt. The original Astro implementation
(`docs/plans/project-brief.md`) was abandoned after the user discovered
[Classicy](https://github.com/robbiebyrd/classicy) — a React framework that
ships a much more complete Mac OS 8 Platinum interface than the hand-rolled
theme could ever match. The reasoning is captured in
`docs/plans/classicy-pre-plan.md`. The current repo has been wiped down to
just the `docs/` directory (commit `96b823b "start over"`), so this is a
clean slate.

This plan covers **Phase 1 only**, defined as the visual foundation:

- Bootstrap Next.js + Classicy
- Render a single-window blog shell (**Model A** from the pre-plan §3) with
  a sidebar post list and a reading pane
- 1–2 placeholder Markdown posts via Velite
- Deploy to a Vercel preview URL and verify

Phase 1 explicitly **does not** include: content migration from anywhere,
RSS feed, topics/tags pages, sitemap, analytics, theme switching, sound,
DNS cutover, or bundle-size optimization beyond a measurement.

### Decisions locked in this session

| Question (pre-plan §9) | Answer |
|---|---|
| Window model (A/B/C) | **A** — single blog window |
| Repo location | Continue in this directory on a feature branch |
| Content pipeline | Velite |
| Phase 1 scope | Shell + placeholder posts + Vercel preview deploy |

### Decisions deferred to Phase 2

Theme choice (default Platinum for now), sound on/off, menu bar contents
beyond defaults, desktop icons, RSS feed, content migration, analytics,
Cloudinary, DNS cutover, bundle-size budget enforcement, full a11y audit.
These are **not** Phase 1 blockers but should be revisited before public launch.

### Risks this plan must address

1. **Classicy's own example app is Vite, not Next.js**, despite `nextjs`
   appearing in its package keywords. Next.js App Router compatibility is
   not proven by the upstream example. → **Step 3 is a spike** that must
   pass before any UI work.
2. **Classicy ships no `"use client"` directive** in its package. Consumers
   in App Router must wrap it in a client boundary themselves. → Step 3
   establishes that boundary.
3. **Pre-1.0 framework (0.6.54).** → Pin the exact version, no caret.
4. **Bundle weight unknown.** → Step 7 captures a measurement and records
   it in the PR description. Budget enforcement deferred to Phase 2.

---

## Pre-flight (must complete before Step 1)

- Confirm `git status` is clean and `main` is checked out.
- Create feature branch: `git checkout -b feature/classicy-phase-1`.
- Per global workflow rules: ask the user whether the rewrite should live
  in a public or private GitHub repo. The current repo
  (`rodmachen/code-rodmachen-com`) is presumably public — confirm before
  pushing.
- After Step 1's first commit lands on the branch, open a PR titled
  "Phase 1: Next.js + Classicy visual foundation" with this plan as the
  description checklist.

---

## Step 1 — Scaffold Next.js + TypeScript project

**Model:** Sonnet · **Gemini-eligible:** yes (mechanical scaffold)
**Test posture:** tests-alongside (no behavior to TDD here)

Scaffold a Next.js App Router project at the repo root. The current repo
contains only `docs/` and `.gitignore`, so the scaffold can be added in
place without conflict.

Files created/modified:
- `package.json` — `next@latest`, `react@^18`, `react-dom@^18`,
  `typescript`, `@types/react`, `@types/node`. Pin `classicy@0.6.54`
  exactly (no caret) but **do not import it yet** — that's Step 3.
- `tsconfig.json` — Next.js defaults
- `next.config.mjs` — start with defaults; **do not** set `output: 'export'`
  yet. Static export is a Phase 2 decision; Vercel preview deploys work
  fine with the default SSR build and that gives us a fallback if Classicy
  turns out to need a server runtime.
- `app/layout.tsx` — minimal HTML shell with `<html><body>{children}</body></html>`
- `app/page.tsx` — placeholder "hello" page
- `.gitignore` — extend the existing one with `.next/`, `out/`, `node_modules/`
- `README.md` — one paragraph describing the project (delete the Astro-era
  framing if any remains)

**Verify:**
- `npm install` completes without peer-dep warnings on React/Classicy
- `npm run dev` serves the placeholder page at http://localhost:3000
- `npm run build` succeeds
- `npx tsc --noEmit` passes

**Commit message:** `Step 1: scaffold Next.js + TypeScript project`

---

## Step 2 — CI + test framework

**Model:** Sonnet · **Gemini-eligible:** yes (mechanical config)
**Test posture:** tests-alongside

Per global workflow rules, the project lacks a test framework, so this
must be set up before any feature work. Mirrors the intent (not the
implementation) of the old repo's Playwright suite per pre-plan §5.7.

Files created/modified:
- `package.json` — add `@playwright/test`, `vitest`, `eslint`,
  `eslint-config-next`, `prettier` as dev deps
- `playwright.config.ts` — single Chromium project, baseURL
  `http://localhost:3000`, `webServer` runs `npm run dev`
- `tests/e2e/smoke.spec.ts` — one test that loads `/` and asserts the page
  has a `<body>` and zero console errors. This is a placeholder that real
  steps will replace.
- `vitest.config.ts` — minimal config for unit tests of content transforms
  later
- `.github/workflows/ci.yml` — Node 20, `npm ci`, `npx tsc --noEmit`,
  `npm run lint`, `npm run build`, `npx playwright install --with-deps chromium`,
  `npx playwright test`. **Do not** add `@astrojs/check` — that bug bit the
  old repo (pre-plan §4 last bullet) and this project must not inherit it.
- `.eslintrc.json` and `.prettierrc` — minimal sane defaults

**Verify:**
- `npm run lint` passes
- `npx tsc --noEmit` passes
- `npx playwright test` passes locally (the one smoke test)
- Push branch; GitHub Actions CI run is green on the PR

**Commit message:** `Step 2: add Playwright + Vitest + GitHub Actions CI`

---

## Step 3 — Classicy spike: prove SSR/client boundary works

**Model:** Opus · **Gemini-eligible:** no (architectural risk + framework interop)
**Test posture:** tests-alongside (smoke test confirms render)

This is the de-risking step. Classicy's example app is Vite-based and the
package ships no `"use client"` directive, so its compatibility with
Next.js App Router is not proven by anything upstream. **If this step
fails, the plan stops here and we revisit framework choice with the user
before doing any UI work.**

Files created/modified:
- `app/layout.tsx` — import `classicy/dist/classicy.css` (the bundled
  stylesheet from `package.json` `exports`)
- `app/components/ClassicyShell.tsx` — `"use client"` at the top, imports
  `ClassicyDesktopProvider`, `ClassicyDesktop`, `ClassicyDesktopMenuBar`,
  `ClassicyApp`, `ClassicyWindow` from `classicy`, renders an empty desktop
  with one empty window. This file is the client boundary that wraps
  every Classicy component the rest of the app uses.
- `app/page.tsx` — render `<ClassicyShell />`
- `tests/e2e/smoke.spec.ts` — extend to assert that the desktop and the
  empty window's title bar render (use generic role/name selectors —
  exact class names from Classicy will be discovered in this step and
  recorded in the PR description for Step 5 to reuse)

**Open questions to answer in this step (record findings in PR description):**
- Does Classicy hydrate cleanly under React 18 strict mode?
- Are the imports tree-shakeable, or does importing one component pull
  the whole framework?
- What's the exact set of providers/wrappers needed? Pre-plan §2 listed
  `ClassicyDesktopProvider`, `ClassicyDesktop`, `ClassicyDesktopMenuBar`,
  `ClassicyApp`, `ClassicyWindow`. Confirm the nesting order.
- Does `themes.json` load automatically, or does the consumer need to
  pass it explicitly?

**Verify:**
- `npm run dev` shows a recognizable Mac OS 8 desktop with one window
- Browser console has zero errors and zero React hydration warnings
- `npm run build` succeeds
- Playwright smoke test passes on the new shell

**If verification fails:** stop, write a short note in the PR explaining
what broke, and bring it back to the user before proceeding to Step 4.

**Commit message:** `Step 3: Classicy spike — wire provider, desktop, empty window`

---

## Step 4 — Velite content pipeline + 2 placeholder posts

**Model:** Sonnet · **Gemini-eligible:** yes (well-trodden integration)
**Test posture:** TDD-lite — write a Vitest unit test asserting the
generated content index has length 2 and the expected slugs, *then* add
the posts.

Files created/modified:
- `package.json` — add `velite` as a dev dep
- `velite.config.ts` — define a `posts` collection. Schema (simplified
  from project-brief.md §"Content schema"):
  ```ts
  {
    title: s.string(),
    subTitle: s.string().optional(),
    date: s.isodate(),
    tags: s.array(s.string()).default([]),
    slug: s.slug('posts'),
    body: s.markdown(),
  }
  ```
  Output to `.velite/` (gitignored). No Cloudinary remark plugin yet —
  Phase 2.
- `next.config.mjs` — wrap with the Velite Next.js plugin so `velite`
  runs on `next dev` / `next build`
- `content/posts/hello-classicy.md` — placeholder #1, written to exercise
  multiple heading levels, a code block, an inline `code` snippet, a
  blockquote, and a list. Use `docs/code-template.md` as a starting point
  but **strip the Astro-specific `layout:` frontmatter line**.
- `content/posts/typography-test.md` — placeholder #2, focused on
  typography stress (long paragraphs, h1–h4, ordered list, table)
- `tests/unit/content.test.ts` — Vitest test asserting the Velite output
  index contains both posts with the expected slugs and titles
- `.gitignore` — add `.velite/`

**Verify:**
- `npx velite` (or `npm run dev` which triggers it) produces `.velite/`
  with both posts
- `npx vitest run` passes
- `npx tsc --noEmit` passes (Velite generates types)

**Commit message:** `Step 4: add Velite content pipeline and two placeholder posts`

---

## Step 5 — Model A blog window: sidebar + reading pane

**Model:** Opus · **Gemini-eligible:** no (this is the design step that
sets the visual identity for everything that follows)
**Test posture:** tests-alongside (Playwright e2e drives the assertions)

Build the actual Model A blog UI inside the Classicy shell from Step 3.

Files created/modified:
- `app/components/BlogWindow.tsx` — `"use client"`. A `ClassicyApp` wrapping
  one `ClassicyWindow`. The window content is a two-pane layout:
  - **Sidebar (left):** a list of post titles + dates from the Velite
    content index. Clicking a post sets local state to the selected slug
    and pushes the URL to `/posts/[slug]` via `next/navigation`'s
    `useRouter`. **No new Classicy window opens** — that's Model B.
  - **Reading pane (right):** renders the selected post's HTML body.
    Default selection is the first post.
- `app/posts/[slug]/page.tsx` — server component that imports the Velite
  index, finds the matching post, and renders `<BlogWindow initialSlug={slug} />`.
  Generates `generateStaticParams` from the index so every post has a
  pre-rendered route.
- `app/page.tsx` — replace the spike content with `<BlogWindow />`
  defaulting to the most recent post
- `app/components/PostBody.tsx` — renders the Velite-compiled HTML inside
  the reading pane with `dangerouslySetInnerHTML`. (Velite outputs sanitized
  HTML by default; confirm in Step 4.)
- `tests/e2e/blog.spec.ts`:
  - Home page renders the blog window with both post titles in the sidebar
  - Clicking the second post in the sidebar updates the URL and the
    reading pane content
  - Direct navigation to `/posts/typography-test` lands with that post
    selected
  - Browser back button restores the previous selection
  - No console errors on any of the above

**Verify:**
- All blog.spec.ts assertions pass locally
- `npm run build` succeeds and emits a route for each post slug
- Manually click around in `npm run dev` and confirm the experience feels
  right (the part the planner cannot automate)

**Commit message:** `Step 5: Model A blog window with sidebar + reading pane`

---

## Step 6 — Typography and code-block styling inside the reading pane

**Model:** Sonnet · **Gemini-eligible:** yes (styling work, well-bounded
once Step 5 has set the structure)
**Test posture:** tests-alongside (one Playwright assertion per element)

The reading pane needs to look like long-form writing inside a Mac OS 8
window — not generic web typography. This step is the project-brief.md
Phase 1 styling work, applied to the Classicy reading pane instead of an
Astro layout.

Files created/modified:
- `app/components/PostBody.tsx` — wrap the rendered HTML in a `.post-body`
  class that scopes all styles below
- `app/components/post-body.module.css` (or equivalent) — style:
  - Body text: readable serif or system font, comfortable measure
    (~65ch max-width inside the reading pane)
  - Headings: era-appropriate (Chicago-ish for h1, system for h2–h4 — but
    only if a free font is available; otherwise system stack)
  - Code blocks: monospace, light background, padding, horizontal scroll
    on overflow
  - Inline code: subtle background, slightly tighter padding
  - Blockquote: left border accent, italic, indented
  - Lists, tables, links — brief but deliberate
- `velite.config.ts` — enable Velite's built-in Shiki integration for
  syntax highlighting (it ships with `@shikijs/transformers` support).
  Pick one light theme matching the Platinum aesthetic
  (e.g. `github-light` or `solarized-light`).
- `tests/e2e/typography.spec.ts`:
  - The `typography-test` post renders an `<h1>`, `<h2>`, `<pre><code>`,
    `<blockquote>`, `<table>`
  - The code block has a non-default background color (Shiki applied)
  - No element overflows the reading pane horizontally at the default
    window size

**Verify:**
- All typography.spec.ts assertions pass
- `npm run build` succeeds
- Visual sanity check in `npm run dev`

**Commit message:** `Step 6: typography and code-block styling for the reading pane`

---

## Step 7 — Vercel preview deploy + bundle measurement

**Model:** Sonnet · **Gemini-eligible:** partially — Gemini can run the
deploy commands and paste the bundle numbers; the **interpretation** of
those numbers (is this acceptable? what does the budget look like?) should
stay with Claude/the user.
**Test posture:** tests-alongside

Phase 1's exit criterion is a working preview URL. Per pre-plan §5.8, do
**not** touch the production `code.rodmachen.com` DNS in this phase.

Files created/modified:
- `package.json` — add `@next/bundle-analyzer` as a dev dep, add
  `npm run analyze` script
- `next.config.mjs` — wire the analyzer behind `ANALYZE=true`
- `vercel.json` — only if needed (Vercel auto-detects Next.js, so most
  likely no file at all)
- PR description — record:
  - The Vercel preview URL
  - First-load JS size (kB) for `/` and `/posts/[slug]` from the build output
  - The bundle analyzer screenshot or top-10 chunk list
  - Any console errors or warnings in the deployed preview

**Vercel project setup (one-time, requires user action — Claude should NOT
do this autonomously):**
- User connects the GitHub repo to a new Vercel project named
  `code-rodmachen-com-classicy` (distinct from any existing
  `code-rodmachen-com` project so the production domain is unaffected)
- User confirms the framework preset is "Next.js"
- User does **not** assign a custom domain in this phase

**Verify:**
- Push the branch; the Vercel GitHub integration produces a preview URL
- Visit the preview URL: home page loads, both posts render, sidebar
  navigation works, no console errors
- `ANALYZE=true npm run build` produces the bundle report
- All Playwright tests pass on `npm run start` against the production build
  (not just dev)

**Commit message:** `Step 7: Vercel preview deploy and bundle measurement`

---

## End-to-end verification (Phase 1 exit criteria)

Phase 1 is done when **all** of the following are true:

1. CI is green on the PR (lint, type check, build, Playwright e2e)
2. The Vercel preview URL renders the Classicy desktop with the blog
   window open and both placeholder posts visible in the sidebar
3. Clicking a post in the sidebar updates the URL to `/posts/[slug]` and
   swaps the reading pane content without a full page reload
4. Direct navigation to `/posts/[slug]` lands with the right post selected
5. Browser console is free of errors and React hydration warnings on every
   route, in both `next dev` and `next start`
6. Bundle size measurement is recorded in the PR description (no budget
   enforcement yet — that's a Phase 2 decision)
7. The production `code.rodmachen.com` domain is **untouched**

When all seven hold, the PR is ready for human review. After merge,
Phase 2 picks up: theme/sound decisions, content migration from the old
repo, RSS, topics pages, analytics, Cloudinary, a11y audit, bundle budget,
DNS cutover.

---

## Model assignment summary (to plan model switches)

| Step | Model | Gemini-eligible? |
|---|---|---|
| 1 — Scaffold Next.js | Sonnet | yes |
| 2 — CI + tests | Sonnet | yes |
| 3 — Classicy spike | **Opus** | no |
| 4 — Velite + posts | Sonnet | yes |
| 5 — Blog window | **Opus** | no |
| 6 — Typography | Sonnet | yes |
| 7 — Deploy + measure | Sonnet | partial |

**Model switches happen between Step 2→3, 3→4, 4→5, and 5→6.** Per global
workflow rules, stop and wait for the user to switch models at each
boundary. Steps 1–2 and Steps 6–7 can run continuously without a switch.

**Gemini delegation note:** Steps 1, 2, 4, and 6 are mechanical enough
that they can be handed to Gemini 3.1 Pro to save Pro plan usage. The
human-in-the-loop pattern: Claude (here) writes/owns the plan and the
critical Steps 3 and 5; Gemini executes Steps 1, 2, 4, 6 against this plan
file as its source of truth; Claude reviews the Gemini output before each
commit lands. Step 7 is split — Gemini runs the deploy and reports
numbers, Claude/user interprets them.

---

## Critical files to modify (consolidated)

New files Phase 1 will create:

```
package.json
tsconfig.json
next.config.mjs
velite.config.ts
playwright.config.ts
vitest.config.ts
.eslintrc.json
.prettierrc
.github/workflows/ci.yml
app/layout.tsx
app/page.tsx
app/components/ClassicyShell.tsx
app/components/BlogWindow.tsx
app/components/PostBody.tsx
app/components/post-body.module.css
app/posts/[slug]/page.tsx
content/posts/hello-classicy.md
content/posts/typography-test.md
tests/e2e/smoke.spec.ts
tests/e2e/blog.spec.ts
tests/e2e/typography.spec.ts
tests/unit/content.test.ts
README.md
```

Files modified (existing):
- `.gitignore` (extend)

Files **not** touched in Phase 1: anything under `docs/` (those are
authoritative inputs to the plan, not outputs).
