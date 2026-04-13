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
| GitHub repo visibility | Public (existing `rodmachen/code-rodmachen-com`) |

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
4. **Bundle weight unknown.** → Step 12 captures a measurement and records
   it in the PR description. Budget enforcement deferred to Phase 2.

---

## Roles and workflow

Phase 1 is executed collaboratively by Opus, Gemini 3.1 Pro, and the user.
Each role has a well-defined lane.

**Opus (Claude Code, this agent):**
- Owns this plan document and keeps it current
- Writes the Gemini prompts for each Gemini-eligible step
- **Executes Steps 3, 5, 7, and 8 directly** (framework spike, Model A
  shell, chrome/menu wiring with Classicy API investigation, and the
  multi-window architectural refactor)
- **Reviews Gemini's output** for every Gemini-executed step: reads the
  diff, re-runs the verification commands locally, and catches drift
  between "works on Gemini's machine" and "works here"
- **Owns all git actions** — stage, commit, push, open/update the PR
- **Fills in Step 9's prompt with the exact API patterns produced by
  Steps 7 and 8** before handoff (without that, Step 9 isn't really a
  Gemini task)
- Interprets the bundle numbers Gemini produces in Step 12

**Test posture for Steps 7–9 (and any inserted UI iteration steps):**
**tests deferred to Step 10.** UI iteration is the wrong time to write
tests — assertions get rewritten as the design changes. Steps 7, 8, 9
land UI changes with no new test files (only minimal maintenance to
existing tests so CI stays green). Each step documents its test
contract in a "Test specs for Step 10" subsection. Step 10 is a
dedicated tests-only step that implements every deferred spec in one
pass. **More UI iteration steps may be inserted between Step 9 and Step
10** as the design evolves; each carries its own deferred test spec
that Step 10 absorbs.

**Gemini 3.1 Pro:**
- Executes mechanical scaffolding and implementation work for Steps
  1, 2, 4, 6, 9, 10, and the mechanical half of Step 12 (sub-step 12b)
- Reads this plan file as its source of truth for each step
- Produces files and pastes verification command output
- **Does not touch git.** No staging, no commits, no pushes. Just writes
  files and reports what ran

**User (Rod):**
- Switches the active model in Claude Code between Opus-owned steps
  (3, 5, 7, 8, plus any inserted UI iteration steps) and Gemini-executed
  steps (1, 2, 4, 6, 9, 10, 12-mechanical)
- Runs the Gemini prompts in a separate Gemini session
- Pastes Gemini's reply back into Claude Code so Opus can review and commit
- Performs the one-time Vercel project setup in Step 12 (sub-step 12a)
- Makes the DNS-cutover call in Step 12 (sub-step 12d)
- Reviews and merges the PR

**Verification policy:** Gemini runs the per-step verification commands
and pastes the output. Opus then re-runs the same commands locally before
staging and committing. This is deliberate redundancy — it catches
environment drift, stale lockfiles, and "passed on paste, fails on pull"
surprises that would otherwise show up in CI.

---

## Pre-flight ✅ done

- `git status` clean, `main` checked out
- Feature branch created: `feature/classicy-phase-1`
- Repo confirmed public (`rodmachen/code-rodmachen-com`)
- PR #4 opened against `main` after Step 1 landed

---

## Step 1 — Scaffold Next.js + TypeScript project ✅ complete

**Executor:** Gemini 3.1 Pro · **Reviewer:** Opus
**Test posture:** tests-alongside (no behavior to TDD here)
**Status:** ✅ Complete. Commits `8f93c1f` (Gemini), `459eabc` (docs), `c38305a` (gitignore fix). PR #4.

Scaffolded a Next.js App Router project at the repo root. The repo
contained only `docs/` and `.gitignore`, so the scaffold was added in place.

Files created/modified:
- `package.json` — `next@latest` (resolved to 16.2.3), `react@^18`,
  `react-dom@^18`, `typescript`, `@types/react`, `@types/node`.
  `classicy@0.6.54` pinned exactly, **not imported yet** — Step 3 does that.
- `tsconfig.json` — Next.js App Router defaults, strict mode on
- `next.config.mjs` — empty config. **No `output: 'export'`** — deferred to Phase 2
- `app/layout.tsx` — minimal HTML shell with metadata exported
- `app/page.tsx` — renders `<h1>Hello, Classicy</h1>`
- `.gitignore` — extended with `.next/`, `out/`, `*.tsbuildinfo`
- `README.md` — one paragraph linking to this plan

**Verified:** `npm install` clean, `npm run dev` served "Hello, Classicy",
`npm run build` succeeded, `npx tsc --noEmit` passed.

**Known follow-up for Step 2:** pin `next` to an exact version instead of
`"latest"`. Lockfile makes current builds reproducible but a fresh clone
could resolve to a newer major.

### Gemini prompt

> You are executing **Step 1** of the Phase 1 plan for `code.rodmachen.com`,
> a personal blog being rebuilt on Next.js + Classicy (a React framework
> that renders a Mac OS 8 Platinum desktop in the browser).
>
> **Read `docs/plans/phase-1.md` for full context**, but your scope in this
> turn is **Step 1 only** — "Scaffold Next.js + TypeScript project." Do not
> touch Steps 2–7.
>
> **Starting state:** working directory `/Users/rodmachen/code/code-rodmachen-com`.
> It contains only `docs/`, `.gitignore`, and `.claude/`. Current branch is `main`.
>
> **Pre-flight:**
> 1. Verify `git status` is clean.
> 2. Create and check out a new branch: `git checkout -b feature/classicy-phase-1`.
>
> **Deliverables** (create exactly these files; do not add others):
> - `package.json` — Next.js App Router project. Dependencies: `next`
>   (latest stable), `react@^18`, `react-dom@^18`. Dev dependencies:
>   `typescript`, `@types/react`, `@types/node`. Also add `classicy` pinned
>   to **exactly `0.6.54`** (no caret, no tilde) in `dependencies`, but do
>   **not** import it anywhere yet — Step 3 wires it up. Scripts: `dev`,
>   `build`, `start`, `lint` (can be a placeholder `echo` for now; real
>   lint comes in Step 2).
> - `tsconfig.json` — Next.js App Router defaults (strict mode on).
> - `next.config.mjs` — default export of an empty config object. **Do NOT
>   set `output: 'export'`** — deferred to Phase 2.
> - `app/layout.tsx` — minimal root layout: `<html lang="en"><body>{children}</body></html>`,
>   with `metadata` exporting title "code.rodmachen.com" and description
>   "Tech and code writing by Rod Machen."
> - `app/page.tsx` — placeholder home page that renders
>   `<h1>Hello, Classicy</h1>`. Server component (no `"use client"`).
> - `.gitignore` — **extend the existing file** (don't overwrite) by adding
>   `.next/`, `out/`, `*.tsbuildinfo`, and `node_modules/` if missing.
>   Leave all existing entries intact.
> - `README.md` — one short paragraph: this is code.rodmachen.com, a
>   personal tech blog being rebuilt on Next.js + Classicy. Link to
>   `docs/plans/phase-1.md`.
>
> **Do NOT create:** any `tests/` directory, any `.github/workflows/` file,
> any ESLint/Prettier config, any Classicy component, any `velite.config.ts`,
> any `content/` directory, any `vercel.json`.
>
> **Verification** — all must pass before reporting back:
> 1. `npm install` — zero peer-dep warnings on React or Classicy. If
>    Classicy warns about React 19 vs 18, stop and report back.
> 2. `npm run dev` — serves the placeholder page at http://localhost:3000
>    showing "Hello, Classicy". Stop the dev server after confirming.
> 3. `npm run build` — succeeds.
> 4. `npx tsc --noEmit` — passes with no errors.
>
> **Do not commit and do not push.** Claude Opus will review the diff and
> handle all git actions. When done, reply with:
> (1) the list of files created/modified,
> (2) the four verification command outputs (last 20 lines of each),
> (3) any warnings or surprises.
>
> **If any verification step fails, stop immediately** and report what
> broke with the exact error output. Do not attempt creative fixes — Opus
> will diagnose.

---

## Step 2 — CI + test framework ✅ complete

**Executor:** Gemini 3.1 Pro · **Reviewer:** Opus
**Test posture:** tests-alongside
**Status:** ✅ Complete. Commit `d425bae`. Hit one snag (Next.js 16 removed `next lint`); Opus diagnosed and fixed during review. Plan/prompt below updated to prevent recurrence.

Per global workflow rules, the project lacks a test framework, so this
must be set up before any feature work. Mirrors the intent (not the
implementation) of the old repo's Playwright suite per pre-plan §5.7.

Files created/modified:
- `package.json` — add `@playwright/test`, `vitest`, `eslint`,
  `eslint-config-next`, `prettier` as dev deps. Also pin `next` to the
  exact version from Step 1 (replace `"latest"`).
- `playwright.config.ts` — single Chromium project, baseURL
  `http://localhost:3000`, `webServer` runs `npm run dev`
- `tests/e2e/smoke.spec.ts` — loads `/`, asserts "Hello, Classicy" is
  present, asserts zero console errors. Placeholder to be replaced.
- `vitest.config.ts` — minimal config for unit tests of content transforms,
  with `passWithNoTests: true` so it doesn't exit non-zero before Step 4
  adds the first unit test
- `.github/workflows/ci.yml` — Node 20, `npm ci`, `npx tsc --noEmit`,
  `npm run lint`, `npm run build`,
  `npx playwright install --with-deps chromium`, `npm run test:e2e`.
  **Do not** add `@astrojs/check` — that bug bit the old repo (pre-plan
  §4 last bullet) and this project must not inherit it.
- `eslint.config.mjs` — ESLint 9 flat config. **Not `.eslintrc.json`** —
  Next.js 16 dropped the legacy lint pipeline and ESLint 9 uses flat
  config by default. Imports from `eslint-config-next/core-web-vitals`,
  which already covers `.js/.jsx/.mjs/.ts/.tsx`, includes TypeScript
  support, and ignores `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.
  Add `.velite/**`, `test-results/**`, `playwright-report/**` to the
  user `ignores` block.
- `.prettierrc` — minimal sane defaults
- `.gitignore` — add Playwright artifacts: `test-results/`,
  `playwright-report/`, `playwright/.cache/`

**Lint script:** `"lint": "eslint ."` (NOT `"next lint"` — that command
was removed in Next.js 16).

**Verify:**
- `npm run lint` passes (using `eslint .` directly)
- `npx tsc --noEmit` passes
- `npm run build` still succeeds
- `npx playwright test` passes locally (the one smoke test)
- `npm run test` exits 0 even with no test files
- Push branch; GitHub Actions CI run is green on the PR

**Commit message (Opus writes, not Gemini):** `Step 2: add Playwright + Vitest + GitHub Actions CI`

### Gemini prompt

> You are executing **Step 2** of the Phase 1 plan for `code.rodmachen.com`.
> Read `docs/plans/phase-1.md` for full context. Your scope in this turn
> is **Step 2 only** — "CI + test framework."
>
> **Starting state:** branch `feature/classicy-phase-1` is checked out.
> Step 1 (Next.js + TypeScript scaffold) has already landed.
> `app/layout.tsx` and `app/page.tsx` exist and render "Hello, Classicy."
>
> **Pre-flight:**
> 1. Verify `git status` is clean.
> 2. Verify you are on `feature/classicy-phase-1`.
> 3. Verify `npm run build` still succeeds before changing anything.
>
> **Deliverables:**
>
> **Critical context for Next.js 16:** the built-in `next lint` command
> was removed in Next.js 16. ESLint must be invoked directly. Also,
> ESLint 9 uses flat config by default (`eslint.config.mjs`), not the
> legacy `.eslintrc.json`. `eslint-config-next@16` ships native flat
> config via `eslint-config-next/core-web-vitals` and already covers
> `.js/.jsx/.mjs/.ts/.tsx`, TypeScript support, and global ignores for
> `.next/**`, `out/**`, `build/**`, `next-env.d.ts`.
>
> Edit `package.json`:
> - Add devDependencies (pin exact versions from each package's latest, no caret):
>   `@playwright/test`, `vitest`, `eslint`, `eslint-config-next`, `prettier`.
> - **Pin `next` to the exact version that Step 1 resolved to.** Check
>   `package-lock.json` for the installed `next` version and replace
>   `"latest"` in `dependencies` with that exact number (no caret).
> - Replace the placeholder `lint` script with `"lint": "eslint ."`.
>   **Do NOT use `"next lint"`** — removed in Next.js 16.
> - Add `"test": "vitest run"` and `"test:e2e": "playwright test"`.
>
> Create:
> - `playwright.config.ts` — single Chromium project, baseURL
>   `http://localhost:3000`, `webServer` runs `npm run dev` and reuses an
>   existing server if one is already up.
> - `tests/e2e/smoke.spec.ts` — one test: navigate to `/`, assert the page
>   contains "Hello, Classicy", assert zero console errors via
>   `page.on('console', ...)`. This test exists only to prove the pipeline
>   works; Steps 3, 5, and 6 replace it with real assertions.
> - `vitest.config.ts` — minimal config; test files under
>   `tests/unit/**/*.test.ts`. **Set `passWithNoTests: true`** so the
>   suite exits 0 before Step 4 adds the first real unit test.
> - `eslint.config.mjs` (NOT `.eslintrc.json`) — flat config:
>   ```js
>   import next from 'eslint-config-next/core-web-vitals';
>
>   const config = [
>     ...next,
>     {
>       ignores: ['.velite/**', 'test-results/**', 'playwright-report/**'],
>     },
>   ];
>
>   export default config;
>   ```
>   The `const config` indirection is needed to avoid the
>   `import/no-anonymous-default-export` warning that flat-config-next
>   itself enables.
> - `.prettierrc` — minimal: single quotes, trailing commas, 2-space indent,
>   80-char print width.
> - `.github/workflows/ci.yml` — triggered on `push` and `pull_request`.
>   Single job, `ubuntu-latest`, Node 20. Steps: `actions/checkout@v4`,
>   `actions/setup-node@v4` with Node 20 and `npm` cache, `npm ci`,
>   `npx tsc --noEmit`, `npm run lint`, `npm run build`,
>   `npx playwright install --with-deps chromium`, `npm run test:e2e`.
>   **Do NOT add `@astrojs/check`** — that bug bit the old repo.
>
> Extend `.gitignore` with Playwright artifacts:
> `test-results/`, `playwright-report/`, `playwright/.cache/`.
>
> **Do NOT create or modify:** any Classicy component (Step 3), any
> Velite config or content file (Step 4), any blog UI component (Step 5).
>
> **Verification** — all must pass:
> 1. `npm install` — clean
> 2. `npx tsc --noEmit` — passes
> 3. `npm run lint` — passes (warnings acceptable; report them)
> 4. `npm run build` — still succeeds
> 5. `npx playwright install --with-deps chromium` — succeeds
> 6. `npm run test:e2e` — the smoke test passes
> 7. `npm run test` — vitest runs and exits 0 ("no test files found" with
>    `passWithNoTests` returns success)
>
> **Do not commit and do not push.** Reply with:
> (1) files created/modified,
> (2) verification outputs (last 20 lines each),
> (3) the exact Next.js version you pinned (from `package-lock.json`),
> (4) any warnings.
>
> **If any verification fails, stop and report.**

---

## Step 3 — Classicy spike: prove SSR/client boundary works ✅ complete

**Executor:** Opus · **Reviewer:** Opus (self)
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

## Step 4 — Velite content pipeline + 2 placeholder posts ✅ complete

**Executor:** Gemini 3.1 Pro · **Reviewer:** Opus
**Test posture:** TDD-lite — write a failing Vitest test asserting the
generated content index has length 2 with expected slugs, *then* add
the config and posts.

Files created/modified:
- `package.json` — add `velite` as a dev dep
- `velite.config.ts` — define a `posts` collection with a schema
  (title, subTitle?, date, tags[], slug, body). Output to `.velite/`
  (gitignored). No Cloudinary remark plugin yet — Phase 2.
- `next.config.mjs` — wrap with the Velite Next.js plugin so `velite`
  runs on `next dev` / `next build`
- `content/posts/hello-classicy.md` — placeholder #1, exercising multiple
  heading levels, a code block, an inline `code` snippet, a blockquote,
  and a list
- `content/posts/typography-test.md` — placeholder #2, focused on
  typography stress (long paragraphs, h1–h4, ordered list, table)
- `tests/unit/content.test.ts` — Vitest test asserting the Velite output
  index contains both posts with the expected slugs and titles
- `.gitignore` — add `.velite/`

**Verify:**
- `npx velite` (or `npm run dev`) produces `.velite/` with both posts
- `npx vitest run` passes
- `npx tsc --noEmit` passes (Velite generates types)
- `npm run build` succeeds

**Commit message:** `Step 4: add Velite content pipeline and two placeholder posts`

### Gemini prompt

> You are executing **Step 4** of the Phase 1 plan for `code.rodmachen.com`.
> Read `docs/plans/phase-1.md` for full context. Your scope is
> **Step 4 only** — "Velite content pipeline + 2 placeholder posts."
>
> **Starting state:** branch `feature/classicy-phase-1`. Steps 1 (scaffold),
> 2 (CI + tests), and 3 (Classicy spike) have landed.
> `app/components/ClassicyShell.tsx` exists as the client boundary. Do
> not modify it in this step.
>
> **Test posture:** TDD-lite. Write the failing Vitest test **before** the
> config and posts. The test asserts the generated content index has the
> expected shape; implementing the config + posts makes it pass.
>
> **Pre-flight:**
> 1. `git status` clean, on `feature/classicy-phase-1`
> 2. `npm run build` and `npm run test:e2e` still succeed
>
> **Deliverables (in this order):**
>
> 1. Add to `package.json` devDependencies: `velite` pinned to its current
>    latest version (check `npm view velite version`, no caret).
>
> 2. `tests/unit/content.test.ts` — Vitest test that imports from the
>    Velite output (check Velite docs for the default output path) and
>    asserts:
>    - `posts` is an array of length 2
>    - contains a post with slug `hello-classicy` and title "Hello, Classicy"
>    - contains a post with slug `typography-test` and title "Typography Test"
>    - both posts have a `body` (HTML string) and a `date` field
>    Run `npm run test` to confirm it **fails** before proceeding.
>
> 3. `velite.config.ts` at repo root. Define a `posts` collection reading
>    from `content/posts/**/*.md`. Schema (use Velite's `s` builder):
>    ```ts
>    {
>      title: s.string(),
>      subTitle: s.string().optional(),
>      date: s.isodate(),
>      tags: s.array(s.string()).default([]),
>      slug: s.slug('posts'),
>      body: s.markdown(),
>    }
>    ```
>    Output to `.velite/` (default). **Do not** add any Cloudinary remark
>    plugin — that's Phase 2.
>
> 4. Wrap `next.config.mjs` with Velite's Next.js plugin so `velite` runs
>    during `next dev` and `next build`. See Velite docs for the exact API.
>
> 5. `content/posts/hello-classicy.md` — frontmatter:
>    ```
>    ---
>    title: Hello, Classicy
>    subTitle: First post on the rebuild
>    date: 2026-04-10
>    tags: [meta, classicy]
>    ---
>    ```
>    Body: opening paragraph, `## h2`, `### h3`, fenced TypeScript code
>    block (3–4 lines), inline `code`, blockquote, unordered list.
>    `docs/code-template.md` is inspiration but **strip the Astro-specific
>    `layout:` and `accentColor:` frontmatter** — they don't apply here.
>
> 6. `content/posts/typography-test.md` — frontmatter:
>    ```
>    ---
>    title: Typography Test
>    date: 2026-04-09
>    tags: [meta]
>    ---
>    ```
>    Body stress-tests typography: long paragraph, `h1`–`h4`, ordered list,
>    unordered list, a 3-row table, a second longer fenced code block.
>
> 7. Extend `.gitignore` with `.velite/`.
>
> **Verification:**
> 1. `npx velite` (or `npm run dev` briefly) produces `.velite/` with both
>    posts indexed
> 2. `npm run test` — the content.test.ts you wrote now passes
> 3. `npx tsc --noEmit` — passes
> 4. `npm run build` — succeeds
> 5. `npm run test:e2e` — smoke test still passes
>
> **Do not commit and do not push.** Reply with:
> (1) files created/modified,
> (2) test output showing the content test went from failing to passing,
> (3) verification outputs,
> (4) any Velite plugin/API surprises worth noting.

---

## Step 5 — Model A blog window: sidebar + reading pane ✅ complete

**Executor:** Opus · **Reviewer:** Opus (self)
**Test posture:** tests-alongside (Playwright e2e drives the assertions)

Build the actual Model A blog UI inside the Classicy shell from Step 3.
This is the design step that sets the visual identity for everything that
follows — Opus owns it directly.

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

## Step 6 — Typography and code-block styling inside the reading pane ✅ complete

**Executor:** Gemini 3.1 Pro · **Reviewer:** Opus
**Test posture:** tests-alongside (one Playwright assertion per element)

The reading pane needs to look like long-form writing inside a Mac OS 8
window — not generic web typography. This step is the project-brief.md
Phase 1 styling work, applied to the Classicy reading pane instead of an
Astro layout.

**Typography reference (locked in by user, recorded during Step 3 review):**
The previous version of `code.rodmachen.com` used **Chicago** (the classic
Mac bitmap system font) for every heading — post title and all section
headings — with a readable sans (Geneva-like) for body copy. That is the
target aesthetic for this step. The user shared a screenshot of the old
"Code Template" post during Step 3 as reference: title in Chicago, blue,
large; `Main Section` / `Subsection` / `Another Section` / `Conclusion`
all in Chicago at a stepped-down size; body in sans; dark-background
monospace code blocks. This is not up for reinterpretation — Step 6 must
use Chicago for headings.

**Chicago font notes for the executor:**
- **Retro look, no smoothing.** The point of Chicago is that it looks
  like an authentic Mac OS 8 bitmap font. Headings must render blocky,
  aliased, pixel-accurate — not the smoothed modern reinterpretation
  most browsers default to. Apply **all** of:
  - `-webkit-font-smoothing: none;`
  - `-moz-osx-font-smoothing: auto;` (the `grayscale` value smooths —
    don't use it; `auto` lets the bitmap stay blocky)
  - `font-smooth: never;` (non-standard but still honored in some
    engines)
  - `text-rendering: optimizeSpeed;` (hints the engine to skip
    anti-aliased glyph optimization)
  Do not anti-alias, do not subpixel-render, do not add letter-spacing
  tricks that disguise the bitmap grid. If the user wanted modern
  typography they wouldn't have asked for Chicago.
- Chicago is a **bitmap font.** At arbitrary sizes it blurs. Pin heading
  sizes to **integer pixel values** that hit the bitmap grid cleanly:
  h1=24px, h2=18px, h3=14px, h4=12px. Do **not** use a fractional `rem`
  scale for headings. No fluid clamp(), no viewport units.
- **Check `classicy/dist/classicy.css` first** — Classicy may already
  load a Chicago webfont as part of its Platinum theme. If it does,
  reuse that `@font-face` instead of shipping Chicago twice. If not,
  ship ChicagoFLF (public-domain TTF reflow, credited in Classicy's
  README).
- Chicago is for the *reading pane content only*. Classicy already
  styles its own chrome (menu bar, window title, buttons) — don't
  touch it.

Files created/modified:
- `app/components/PostBody.tsx` — wrap the rendered HTML in a `.postBody`
  class that scopes all styles below
- `app/components/post-body.module.css` — style body text, headings, code
  blocks, inline code, blockquotes, lists, tables, links
- `velite.config.ts` — enable Velite's built-in Shiki integration for
  syntax highlighting. Pick one light theme matching the Platinum aesthetic
  (`github-light` or `solarized-light`)
- `tests/e2e/typography.spec.ts` — renders `h1`, `h2`, `<pre><code>`,
  `<blockquote>`, `<table>`; code block has Shiki-applied color; no
  horizontal overflow at default window size

**Verify:**
- All typography.spec.ts assertions pass
- `npm run build` succeeds
- Visual sanity check in `npm run dev`

**Commit message:** `Step 6: typography and code-block styling for the reading pane`

### Gemini prompt

> You are executing **Step 6** of the Phase 1 plan for `code.rodmachen.com`.
> Read `docs/plans/phase-1.md` for full context. Your scope is
> **Step 6 only** — "Typography and code-block styling inside the reading
> pane."
>
> **Starting state:** branch `feature/classicy-phase-1`. Steps 1–5 have
> landed. The Model A blog window exists at `app/components/BlogWindow.tsx`
> and the reading pane renders post HTML via `app/components/PostBody.tsx`.
> **Read both files before starting** — understanding the existing
> structure is the whole game.
>
> **Pre-flight:**
> 1. `git status` clean, on `feature/classicy-phase-1`
> 2. `npm run build` succeeds
> 3. `npm run test:e2e` passes
>
> **Deliverables:**
>
> 1. `app/components/post-body.module.css` — scoped styles keyed off a
>    `.postBody` wrapper. Style:
>    - **Body text:** readable serif stack (Charter, Georgia, serif) or
>      system stack — pick based on what looks right inside the Classicy
>      window. Line-height ~1.6, max-width ~65ch inside the reading pane.
>    - **Headings:** **Chicago font, mandatory** for h1–h6, and
>      **rendered retro — blocky, aliased, pixel-accurate — not
>      smoothed.** The user ran this on the previous site and asked for
>      it explicitly (reference screenshot shared during Step 3 review,
>      see the "Typography reference" note above). The point of Chicago
>      is the authentic Mac OS 8 bitmap look; if you smooth it, you've
>      defeated the purpose. Required CSS on every heading rule (h1–h6):
>      `-webkit-font-smoothing: none;`,
>      `-moz-osx-font-smoothing: auto;` (NOT `grayscale`),
>      `font-smooth: never;`,
>      `text-rendering: optimizeSpeed;`. Check
>      `classicy/dist/classicy.css` first for an existing Chicago
>      `@font-face` — reuse it if present. If not, ship ChicagoFLF
>      (public domain, credited in Classicy's README) as a self-hosted
>      webfont under `public/fonts/` and declare it in
>      `post-body.module.css`. Chicago is a bitmap font — pin heading
>      sizes to the **integer pixel** values 24px / 18px / 14px / 12px
>      (h1 / h2 / h3 / h4). Do **not** use a fractional rem scale, no
>      `clamp()`, no viewport units. Stepped hierarchy: h1 largest,
>      h2–h4 step down, h5–h6 optional.
>    - **Code blocks:** monospace, light background, padding, horizontal
>      scroll on overflow. Must not visually fight the Mac OS 8 window
>      chrome.
>    - **Inline code:** subtle background, slightly tighter padding,
>      monospace.
>    - **Blockquote:** left border accent, italic, indented.
>    - **Lists, tables, links:** brief but deliberate styling. Links need
>      a visible hover state.
>
> 2. Update `app/components/PostBody.tsx` to apply the `.postBody`
>    className wrapper around the rendered HTML.
>
> 3. Update `velite.config.ts` to enable Shiki syntax highlighting for
>    fenced code blocks. Velite integrates with `@shikijs/transformers`
>    via its markdown options — see Velite docs. Pick a single light theme
>    that harmonizes with Platinum (`github-light` or `solarized-light`).
>    Add any new Shiki dependencies to `package.json` with pinned versions.
>
> 4. `tests/e2e/typography.spec.ts` — Playwright test that:
>    - Navigates to `/posts/typography-test`
>    - Asserts `<h1>`, `<h2>`, `<pre><code>`, `<blockquote>`, and `<table>`
>      elements are present inside `.postBody`
>    - Asserts the `h1` uses Chicago — read
>      `getComputedStyle(h1).fontFamily` and assert it contains
>      `"Chicago"` (or `"ChicagoFLF"`, whichever you ship)
>    - Asserts the `h1` is rendered **unsmoothed** — read
>      `getComputedStyle(h1).webkitFontSmoothing` and assert it equals
>      `"none"`. This catches the most common way Chicago gets
>      accidentally modernized.
>    - Asserts the `h1` font-size is an **integer pixel value** (no
>      fractional rem) — parse `getComputedStyle(h1).fontSize` and
>      assert `Number.isInteger(parseFloat(size))`.
>    - Asserts at least one `<pre>` has inline color styles (evidence that
>      Shiki ran) — `expect(style).toContain('color')` or similar
>    - Asserts no horizontal overflow at default window size (compare
>      `scrollWidth` vs `clientWidth` on the reading pane container)
>    - Asserts zero console errors during load
>
> **Do NOT touch:** Classicy components, the blog window sidebar logic,
> Velite schema, post content files. This step is purely visual + a new test.
>
> **Verification:**
> 1. `npm run build` succeeds
> 2. `npm run test:e2e` — all existing tests still pass AND the new
>    typography.spec.ts passes
> 3. `npx tsc --noEmit` passes
> 4. `npm run lint` passes
>
> **Do not commit or push.** Reply with:
> (1) files created/modified,
> (2) verification output,
> (3) a note on which fonts you picked and why,
> (4) any visual issue you noticed but chose not to fix (Opus will triage).

---

## Step 7 — Chrome, menu bars, and window framing ✅

**Executor:** Opus · **Reviewer:** Opus
**Test posture:** **tests deferred to Step 10.** Document the test spec
in this step (see "Test specs" subsection); Step 10 implements them.
This step minimally maintains any existing tests it breaks so CI stays
green, but writes no new test files.

UI polish on top of Steps 5–6: fix layout chrome, define the four menu
bars properly, position desktop chrome (clock, speaker, hard drive icon),
and add the View → Full Width / Normal zoom toggle.

This is all Classicy-config / wiring work. No architectural changes —
that comes in Step 8.

### Items to land

1. **Window framing.**
   - BlogWindow centered horizontally
   - Full height below the menu bar
   - Max-width 1000px (this is the "Normal" zoom state)
   - Fix the **double menu bar** currently visible (find the source — Classicy renders one, something else is rendering a second)
   - Fix the **stray white border** on the top and left

2. **Apple menu.**
   - Single item: **About This Site**
   - Opens a small Classicy window with the tech stack: Next.js 16, Classicy, Velite, Shiki, Playwright, deployed on Vercel, plus a link to the GitHub repo
   - This is **distinct** from the desktop About icon (Step 8) — Apple menu is brief credits; desktop About is the full About page

3. **File menu.**
   - Single item: **Open...** (no keyboard shortcut)
   - In Step 7, this is **stubbed** — wire it to dispatch an action with a no-op handler (or open a placeholder alert). Step 8 will replace the handler with "open the Posts listings window."

4. **Edit menu.**
   - Single item: **Edit Posts**, permanently **disabled** (greyed, not clickable, `aria-disabled` or Classicy equivalent)

5. **View menu.**
   - Two items: **Normal** and **Full Width**
   - Toggles the BlogWindow max-width between 1000px (Normal) and 100% (Full Width)
   - **Resets on navigation** — when the user navigates to a different post (URL change), the toggle returns to Normal
   - To satisfy `react-hooks/set-state-in-effect`, implement reset via a `key` prop on the inner window component that includes the current slug. No `useState` in `useEffect`.

6. **Help menu.**
   - Single item: **Help me…**
   - On click: opens https://www.google.com in a new tab (`window.open(url, '_blank')`)

7. **No keyboard shortcuts on any menu item** in any of the four menus. If Classicy's menu config supports a shortcut field, leave it empty / undefined.

8. **Desktop chrome.**
   - Clock: format `H:MM AM/PM`, **no seconds**. The clock is JS `new Date()` in the browser, so it's the visitor's local time — no server involvement.
   - Speaker icon: positioned **to the left of the clock** in the menu bar
   - Speaker default state: **muted** (sound system fully off until user clicks unmute, after which Classicy's normal sound effects resume)
   - Macintosh HD desktop icon: relabel to **Hard Drive**

### Implementation notes (investigation expected)

- Classicy's menu definition API isn't documented in the README. Read the compiled `node_modules/classicy/dist/classicy.es.js` to find the right shape (likely a config object passed to `ClassicyDesktop` or per-app menu defs on `ClassicyApp`).
- The double menu bar is most likely Classicy's menu bar plus an inadvertent second bar from our own JSX or default theme styling. Inspect the rendered DOM in dev tools first.
- The white border is probably a default body/html margin or Classicy desktop padding. CSS reset or theme tweak.
- For the speaker default-muted state, look for a Classicy store action like `ClassicySoundManagerMute` or a prop on the sound manager provider. If neither exists, dispatch the mute on mount (same pattern as Step 5's `ClassicyAppOpen`).

### Files modified / created

- `app/components/BlogWindow.tsx` — window sizing, menu definitions, View toggle
- `app/components/ClassicyDesktopInner.tsx` — desktop chrome (clock format, speaker, HD label, default mute dispatch)
- `app/components/blog-window.css` — extend with framing/centering rules
- New: `app/components/AboutThisSiteWindow.tsx` — small Classicy window with tech stack
- New: `tests/e2e/chrome.spec.ts`
- Possibly new: `app/globals.css` or extend `app/layout.tsx` to reset the white border

### Test specs for Step 10 (`tests/e2e/chrome.spec.ts`)

These are the assertions Step 10 will implement. Documented here so the
behavior contract lives next to the code that defines it.

- Exactly one menu bar in DOM
- BlogWindow is horizontally centered and `<= 1000px` wide at default zoom
- All four custom menus present with the documented items, no keyboard shortcut text
- Edit → Edit Posts present and `aria-disabled` (or Classicy equivalent)
- View → Full Width removes the 1000px constraint; View → Normal restores it
- Navigating to a different post resets View to Normal
- Clock text matches `/\d{1,2}:\d{2}\s?(AM|PM)/i` and does NOT contain a seconds pattern
- Speaker icon precedes clock in DOM order; speaker default state is muted
- Desktop has an icon labeled `Hard Drive` and none labeled `Macintosh HD`
- Apple menu → About This Site opens a window containing the substring `Next.js`
- Help → Help me… invokes `window.open` with `https://www.google.com` and `_blank` (capture via `page.context().on('page', ...)`)

### Verify

- `npm run content:build` — clean
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm test` — unit suite passes
- `npm run build` — succeeds
- `npm run test:e2e` — **all existing tests still pass.** No new tests
  in this step. If a chrome change breaks an existing assertion (e.g. the
  smoke test's menubar check), update the existing assertion minimally
  to reflect the new state — do not skip, do not write new specs.
- **Manual browser check:** load `npm run dev`, visit `/`, walk the four
  menus, toggle View → Full Width / Normal, verify the clock has no
  seconds, verify the speaker icon is muted and to the left of the clock,
  verify `Hard Drive` desktop label, verify Apple → About This Site
  opens the tech-stack window, verify Help → Help me… opens google.com
  in a new tab.

### Commit message

`Step 7: Chrome, menu bars, and window framing`

---

## Step 8 — Multi-window architecture (Reader + Posts listings) ✅

**Executor:** Opus · **Reviewer:** Opus
**Test posture:** **tests deferred to Step 10.** Same rule as Step 7:
no new tests, but minimally maintain existing tests so CI stays green.
The `BlogWindow` → `PostReaderWindow` rename will break `blog.spec.ts`
selectors — strip the broken assertions, do not write replacement
assertions (those land in Step 10).

This is the **architectural change** of Phase 1's UI work: move from
Model A (single window with sidebar + reading pane) to a multi-window
model with a dedicated Posts listings window and a post-only Reader.

The About/Contact sub-windows and the Geneva body-font swap are
**deliberately deferred to Step 9** so that step is a clean, mechanical
Gemini task that follows patterns this step establishes.

### Window model (locked)

- **Reader window.** Post body only. No sidebar. Reads slug from pathname; URL drives selection (the existing deep-link behavior from Step 5 is preserved).
- **Posts listings window.** Finder-style file-list view of all posts. Columns: **Name**, **Date Added**, **Tags**. Default sort: date descending. Opens via File → Open… (replacing Step 7's stub). Closed by default on initial page load.
- **Single Reader, no spawning.** Selecting a post in the listings updates the URL, which drives the existing Reader to display the new post. It does **not** spawn a new Reader window.

### Items to land

1. **Refactor Reader.**
   - Rename `BlogWindow.tsx` → `PostReaderWindow.tsx` (or create new + delete old)
   - Strip out all sidebar code; the component is now post-body only
   - Keep the `ClassicyAppOpen` dispatch from Step 5

2. **Posts listings window.**
   - New `app/components/PostListingsWindow.tsx`
   - Renders inside its own `ClassicyApp` + `ClassicyWindow`
   - Investigate first: does Classicy ship a built-in file-list-view component? If yes, use it. If not, build a minimal three-column table.
   - Each row's primary action is `router.push('/posts/' + slug)`
   - Tags column renders comma-separated tags (Phase 1 keeps it simple; pill rendering is Phase 2)
   - **Closed by default.** Step 7's File → Open handler is rewired to dispatch the action that opens this window.

3. **Apple menu's "About This Site" stays as Step 7 left it.** Different content, different window — Step 9 will add the desktop About sub-window separately and they should not be merged.

### Files modified / created

- New: `app/components/PostReaderWindow.tsx`
- Delete: `app/components/BlogWindow.tsx`
- New: `app/components/PostListingsWindow.tsx`
- Modified: `app/components/ClassicyDesktopInner.tsx` (register the listings window; rewire File → Open handler)
- Modified: `tests/e2e/blog.spec.ts` (strip sidebar assertions only — no new assertions; Step 10 rewrites this test file)

### Test specs for Step 10

These are the assertions Step 10 will implement.

- **`posts-listings.spec.ts` (new in Step 10):**
  - File → Open opens the Posts listings window
  - Listings shows both posts with their Name, Date Added, and Tags columns populated
  - Clicking a row navigates to `/posts/[slug]` and the Reader displays the new post
  - Listings window remains visible after selection (single-Reader model)
  - Direct nav to `/posts/typography-test` still selects it in the Reader (deep-link preserved)

- **`blog.spec.ts` rewrite in Step 10:**
  - Reader displays the correct post for the URL
  - Deep-link nav to `/posts/[slug]` works
  - (The in-window navigation tests are gone — that behavior moved to `posts-listings.spec.ts`)

- **`chrome.spec.ts` File → Open assertion:**
  - Step 7's spec has `File → Open` as a stub. Step 10 implements that test as "opens the Posts listings window," not the stubbed no-op.

### Verify

- `rm -rf .velite .next` — clean checkout
- `npm run content:build` — clean
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm test` — unit suite passes
- `npm run build` — succeeds, still emits the SSG post routes
- `npm run test:e2e` — **all existing tests still pass after the
  minimal `blog.spec.ts` strip-down.** No new tests in this step.
- **Manual smoke:** open `/`, verify Reader shows most recent post;
  File → Open opens the listings; click a row, verify URL changes and
  Reader updates; direct-nav to `/posts/typography-test` still works.

### Handoff to Step 9 ✅ (filled in by Opus after Step 8)

1. **Classicy desktop-icon registration API:** Not used — windows use
   `noDesktopIcon` on `<ClassicyApp>`. Each sub-window is registered by
   rendering its `<ClassicyApp>` + `<ClassicyWindow>` as a child of
   `<ClassicyDesktop>` inside `ClassicyDesktopInner.tsx`. Opening a
   window programmatically is done via `useAppManagerDispatch()` +
   `dispatch({ type: 'ClassicyAppOpen', app: { id, name, icon: '' } })`.

2. **Pattern for building a small Classicy window** (copy
   `PostListingsWindow.tsx` or `AboutThisSiteWindow.tsx`):
   ```tsx
   export const MY_APP_ID = 'myApp';
   export const MY_WINDOW_ID = 'myApp.main';

   export default function MyWindow() {
     return (
       <ClassicyApp id={MY_APP_ID} name="My App" icon="" noDesktopIcon
                    defaultWindow={MY_WINDOW_ID}>
         <ClassicyWindow id={MY_WINDOW_ID} appId={MY_APP_ID}
                         title="My App" initialSize={[360, 280]}
                         initialPosition={[200, 120]} resizable={false}
                         zoomable={false} collapsable={false} defaultWindow>
           {/* content */}
         </ClassicyWindow>
       </ClassicyApp>
     );
   }
   ```
   Then add `<MyWindow />` as a child of `<ClassicyDesktop>` in
   `ClassicyDesktopInner.tsx`.

### Commit message

`Step 8: Multi-window architecture (Reader + Posts listings)`

---

## Step 9 — About/Contact sub-windows + Geneva body font ✅

**Executor:** Gemini 3.1 Pro · **Reviewer:** Opus
**Test posture:** **tests deferred to Step 10.** Same rule as Steps 7
and 8: no new test files. The Geneva font swap loses its automated
false-green guard during this step, so this step adds a **mandatory
manual browser verification** as a substitute (see Verify below).

A purely mechanical wrap-up step. By the time Step 9 starts, every
Classicy API needed has been documented (Step 7's chrome work covered
desktop icons + windows, Step 8's multi-window work covered the
sub-window pattern). Gemini's job is to copy patterns and write CSS,
not to investigate.

### Items to land

1. **`AboutWindow.tsx` (new component).**
   - A small Classicy window (~500×400) following the exact pattern Step 8 established for `PostListingsWindow.tsx`
   - Stacks above the Reader window
   - Plain HTML inside (no markdown pipeline needed)
   - **Placeholder content (user will edit later):**
     > Code is a coding-focused blog by Rod Machen, built on Next.js + Classicy + Velite. The retro Mac OS 8 look is deliberate.

2. **`ContactWindow.tsx` (new component).**
   - Same pattern as `AboutWindow.tsx`
   - Smaller (~400×300)
   - **Placeholder content:**
     > Reach me on GitHub: github.com/rodmachen

3. **Desktop icons for About and Contact.**
   - In `app/components/ClassicyDesktopInner.tsx`, register two new desktop icons using the exact Classicy desktop-icon API documented in Step 8's handoff section above
   - Both use the **document** icon variant (not folder, not application)
   - Double-clicking each icon dispatches the action that opens its corresponding sub-window
   - Icon labels: literally `About` and `Contact`

4. **Geneva body font swap.**
   - In `app/components/post-body.module.css`, change `.postBody`'s `font-family` from `Charter, Georgia, serif` to **`Geneva, "Lucida Grande", Verdana, sans-serif`**
   - Headings remain Chicago (do **not** touch heading styles — Step 6 work is locked in)
   - **CRITICAL — false-green warning from Step 6.** Before changing the CSS, do this investigation:
     - Grep `node_modules/classicy/dist/` for any reference to Geneva or `@font-face` rules beyond the Chicago one
     - If Classicy ships Geneva inline (parallel to its inline base64 ChicagoFLF), use the exact font-family name Classicy declares
     - If Classicy does NOT ship Geneva, the system fallback chain above is the safest path — Mac users will see real Geneva, others will see a sans-serif fallback
     - **DO NOT download or ship a Geneva font file.** Step 6 had an incident where a 14-byte 404 response was saved as `.ttf` and the test passed false-green because `getComputedStyle().fontFamily` returns the *declared* family string, not the *resolved* font. If you can't verify a font binary is a real font, don't ship it. Use the system fallback chain.
   - Report in your reply: which path you took (Classicy-shipped vs system fallback) and why.

5. **Tests are deferred to Step 10.** Do **not** write new test files in
   this step. Do **not** modify `tests/e2e/typography.spec.ts`. The
   contracts for `desktop-windows.spec.ts` and the `typography.spec.ts`
   body-font additions live in the "Test specs for Step 10" subsection
   below — Step 10's executor will implement them.

   In place of automated tests, this step relies on a **mandatory
   manual browser verification** documented in the Verify subsection.
   The Geneva font check is the highest-risk item (see the false-green
   warning under item 4) and the manual check exists specifically to
   catch it before commit.

### Files modified / created

- New: `app/components/AboutWindow.tsx`
- New: `app/components/ContactWindow.tsx`
- Modified: `app/components/ClassicyDesktopInner.tsx` (register About + Contact icons)
- Modified: `app/components/post-body.module.css` (Geneva body font)
- **No test files modified or created.** Tests land in Step 10.

### Test specs for Step 10

These are the assertions Step 10 will implement.

- **`desktop-windows.spec.ts` (new in Step 10):**
  - Desktop has icons labeled exactly `About` and `Contact`
  - Double-clicking About opens a window containing the substring `Rod Machen`
  - Double-clicking Contact opens a window containing the substring `github.com/rodmachen`
  - Both sub-windows render above the Reader (z-index check or DOM stacking order)
  - About sub-window content is **different** from the Apple menu's "About This Site" modal (different substring assertion)

- **`typography.spec.ts` body-font additions (Step 10):**
  - Select an element inside `.blogPostBody` that is NOT a heading (e.g. a paragraph). Read its computed `font-family`.
  - Assert it does NOT contain `serif` (negative assertion against the pre-Step-9 Charter/Georgia stack)
  - Assert it contains `Geneva` (or whatever Classicy-shipped name Step 9 actually used)
  - **Plus the Step 6 false-green guards:**
    - `await page.evaluate(() => document.fonts.ready)`
    - `document.fonts.check('16px Geneva')` (or whatever family Step 9 used) → expect `true`
    - Canvas `measureText` width comparison: render `'Body Width Sample'` at 16px in the declared family vs at 16px in a different family. Assert the two widths are NOT close (`expect(...).not.toBeCloseTo(..., 0)`). If the fallback is `sans-serif`, use `monospace` as the comparison so you're comparing against a different font, not the same one.
  - The existing heading assertions (Chicago, unsmoothed, integer pixel) all stay untouched.

### Verify

- `npm run content:build` — clean
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm test` — unit suite passes
- `npm run build` — succeeds
- `npm run test:e2e` — **all existing tests still pass.** No new tests
  in this step.
- **MANDATORY manual browser check (substitutes for the deferred font
  test):**
  1. Run `npm run dev` and visit `/posts/typography-test`
  2. Open browser dev tools → Elements → select a paragraph in the post body
  3. Read computed `font-family` — it must NOT be `Charter`/`Georgia`/`serif`
  4. The body text must visibly look different from how it looked before this step (Charter/Georgia is a serif; Geneva is a sans-serif — the visual difference is unmistakable)
  5. Open dev tools → Console → run `document.fonts.check('16px Geneva')` — expect `true` if you used Geneva, or substitute the family name you actually shipped
  6. **Report all five checks in your reply.** If any check fails, do not declare the step done.

### Commit message

`Step 9: About/Contact sub-windows and Geneva body font`

### Gemini prompt

> You are executing **Step 9** of the Phase 1 plan for `code.rodmachen.com`.
> Read `docs/plans/phase-1.md` for full context — your scope is the
> "Step 9 — About/Contact sub-windows + Geneva body font" section only.
>
> **Starting state:** branch `feature/classicy-phase-1`. Steps 1–8 have
> landed. Steps 7 and 8 produced the patterns you'll be copying.
>
> **CRITICAL — tests are deferred to Step 10.** Do not write or modify
> any test files in this step. Specifically: do NOT create
> `tests/e2e/desktop-windows.spec.ts`, do NOT modify
> `tests/e2e/typography.spec.ts`. Step 10's executor will write those
> against the spec already documented in this step. Your only test
> obligation is that all **existing** Playwright tests still pass after
> your changes.
>
> **Required reading before you write any code:**
> 1. `app/components/ClassicyDesktopInner.tsx` — for the exact desktop
>    icon registration shape Step 8 established. Match it precisely for
>    About + Contact.
> 2. `app/components/PostListingsWindow.tsx` — for the exact small-window
>    pattern Step 8 established (`ClassicyApp` + `ClassicyWindow`,
>    `ClassicyAppOpen` dispatch on mount). Copy this pattern for
>    `AboutWindow.tsx` and `ContactWindow.tsx`.
> 3. `node_modules/classicy/dist/classicy.css` — grep for `Geneva` and
>    for `@font-face`. Determine whether Classicy ships Geneva inline.
>    Report what you found.
>
> **Build the three code deliverables** from items 1–4 in the "Items to
> land" list (the two new components + the desktop icon registration +
> the CSS font swap). Skip item 5 ("Tests") entirely — that's Step 10.
>
> **Heed the CRITICAL false-green warning on the Geneva font:** do NOT
> download or ship a font file. Use Classicy's font if it ships one;
> otherwise use the system fallback chain. **Step 6 had an incident
> where a 14-byte 404 response was saved as `ChicagoFLF.ttf` and the
> test still passed because `getComputedStyle().fontFamily` returns the
> declared string, not the resolved font.** Do not repeat that. Because
> tests are deferred this round, the manual browser check below is the
> ONLY safety net — take it seriously.
>
> **Verification (run all of these and paste output):**
> 1. `npm run content:build`
> 2. `npx tsc --noEmit`
> 3. `npm run lint`
> 4. `npm test`
> 5. `npm run build`
> 6. `npm run test:e2e` — all existing tests must still pass; no new
>    test files
>
> **MANDATORY manual browser check** (substitutes for the deferred font
> test, run after the automated checks above):
> 1. `npm run dev`, visit `/posts/typography-test`
> 2. Dev tools → Elements → select a paragraph in the post body
> 3. Read computed `font-family` — it must NOT contain `Charter`,
>    `Georgia`, or `serif`
> 4. Body text must visibly look like a sans-serif (Geneva is sans;
>    Charter/Georgia were serif — the difference is obvious)
> 5. Dev tools → Console → run `document.fonts.check('16px Geneva')`
>    (or substitute the family name you actually used) — expect `true`
>
> **Do not commit or push.** Reply with:
> (1) files created/modified,
> (2) which path you took for the Geneva font (Classicy-shipped name vs
>     system fallback) and what you found in `classicy.css`,
> (3) full output of all six automated verification commands,
> (4) **the result of all five manual browser check steps**, including
>     the literal computed `font-family` string and the
>     `document.fonts.check` boolean,
> (5) anything you noticed but chose not to fix (Opus will triage).

---

## Step 10 — UI bug fixes (post-audit) ✅

**Executor:** Gemini 3.1 Pro · **Reviewer:** Opus
**Test posture:** tests-alongside — each fix should be verifiable by the
automated checks plus manual browser confirmation.

An Opus-driven browser audit after Steps 7–9 found eight issues. This
step fixes all of them. Do each sub-item in order; verify the full suite
after each sub-item before moving to the next.

### Background for Gemini

The project uses the Classicy library (Mac OS 8 UI shell). Key files:
- `app/components/PostReaderWindow.tsx` — post-body-only reader, the
  main window (always visible). Uses `ClassicyApp` id `"blog"`,
  `ClassicyWindow` id `"blog.reader"`.
- `app/components/PostListingsWindow.tsx` — Finder-style post table.
  Uses `ClassicyApp` id `"postListings"`.
- `app/components/AboutWindow.tsx` — desktop-icon-launched sub-window.
  Uses `ClassicyApp` id `"about"`.
- `app/components/ContactWindow.tsx` — same pattern, id `"contact"`.
- `app/components/AboutThisSiteWindow.tsx` — Apple-menu-launched, id
  `"aboutThisSite"`.
- `app/components/ClassicyDesktopInner.tsx` — registers all apps, injects
  desktop icons for About and Contact, renames "Macintosh HD" → "Hard
  Drive", adds "About This Site" to the Apple menu.
- `app/components/blog-window.css` — window framing, reading pane layout,
  post listings table styles.
- `app/components/post-body.module.css` — typography inside the post body
  (Geneva body text, ChicagoFLF headings, code blocks, etc.).

The Classicy API for opening a window programmatically:
```js
dispatch({ type: 'ClassicyAppOpen', app: { id: APP_ID, name: '...', icon: '' } });
```
`dispatch` comes from `useAppManagerDispatch()`.

Desktop icons are injected via `useAppManager.setState()` into
`System.Manager.Desktop.icons`. Each icon needs `appId`, `appName`,
`icon`, `kind`, and `label`. Classicy auto-wires double-click on a
desktop icon to open the matching `ClassicyApp` by `appId`.

### Items to fix

**10a. Post title h1 must be Chicago, not Times.**

The `.blogPostTitle` (h1) is inside `.blogPostHeader`, which is inside
`.blogReadingPane` — but it is **not** inside the `.postBody` CSS module
(that module wraps only the Velite-rendered HTML via `PostBody.tsx`). So
the Chicago heading styles in `post-body.module.css` do not reach the
post title.

Fix: add a rule in `blog-window.css` that applies the same Chicago
treatment to `.blogPostTitle`:
```css
.blogPostTitle {
  font-family: 'ChicagoFLF', serif;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: auto;
  font-smooth: never;
  text-rendering: optimizeSpeed;
  font-weight: normal;
  font-size: 24px;
  line-height: 1.2;
}
```

**10b. Reading pane base font must be Geneva, not Times.**

`.blogReadingPane` in `blog-window.css` has no `font-family`. Everything
outside the `.postBody` CSS module (subtitle, date, any chrome) inherits
the browser default (Times).

Fix: add to the existing `.blogReadingPane` rule:
```css
font-family: Geneva, "Lucida Grande", Verdana, sans-serif;
```

**10c. Post listings window is hidden behind the Reader.**

File → Open dispatches `ClassicyAppOpen` correctly (audit confirmed the
window is in the DOM and "VISIBLE" per `getBoundingClientRect`) — but the
Reader's `!important` CSS makes it fill the viewport and sit on top. The
listings window renders at `initialPosition={[250, 80]}` underneath.

Fix: clicking the listings row is also broken because the Reader's
`<article>` intercepts pointer events. Two things need to happen:
1. After `ClassicyAppOpen` for the listings, also call
   `dispatch({ type: 'ClassicyAppFocus', app: { id: POST_LISTINGS_APP_ID } })`
   (or the equivalent Classicy action) to bring the listings to front.
   **Investigate first:** check what Classicy actions exist for focusing /
   raising a window. If `ClassicyAppFocus` doesn't exist, try
   `ClassicyWindowFocus` or look at the Classicy source for the correct
   action type.
2. If Classicy's z-index management still can't overcome the Reader's
   `!important` CSS, add a `z-index` rule for the listings window in
   `blog-window.css` that places it above the reader when open. The
   Classicy window element's id is `postListings_postListings\.main`.

**10d. Desktop icons overlap — About icon unclickable.**

Both About and Contact icons are injected into `Desktop.icons` in
`ClassicyDesktopInner.tsx` without explicit positions, so Classicy stacks
them at its default location. Contact's mask intercepts About's clicks.

Fix: investigate whether Classicy's icon model supports `x`/`y` or
`position` fields. If so, set distinct positions for each icon. If not,
change the injection order (Contact first, then About) or explore
Classicy's icon layout algorithm to find a workaround. The icons should
be visually separated like "Hard Drive" already is.

**10e. About window doesn't open from its desktop icon.**

Even force-clicking the About icon (bypassing the overlap in 10d), the
audit returned `NOT_IN_DOM` — the window never renders. Contact works
fine with the same pattern.

Investigate: the `about` appId may collide with something internal to
Classicy. Try renaming to `aboutPage` or `siteAbout` in both
`AboutWindow.tsx` and the icon injection in `ClassicyDesktopInner.tsx`.
If that's not the issue, compare the About and Contact registrations
line by line to find the difference.

**10f. Post listings table font is Times.**

The `.postListingsTable` in `blog-window.css` has `font-size: 12px` but
no `font-family`. Confirmed by audit: `LISTINGS_TABLE_FONT: Times`.

Fix: add to `.postListingsTable`:
```css
font-family: Geneva, "Lucida Grande", Verdana, sans-serif;
```

**10g. About/Contact window content font is not Geneva.**

The inline `style={{ padding: '1rem' }}` divs in `AboutWindow.tsx` and
`ContactWindow.tsx` inherit Classicy's default font, not Geneva.

Fix: add `fontFamily: 'Geneva, "Lucida Grande", Verdana, sans-serif'`
to the inline style, or better, create CSS classes in `blog-window.css`
for these windows (similar to `.aboutThisSiteContent`) that set the
Geneva font stack.

**10h. About This Site window content font is not Geneva.**

The `.aboutThisSiteContent` class in `blog-window.css` sets `font-size`
and `line-height` but not `font-family`.

Fix: add to `.aboutThisSiteContent`:
```css
font-family: Geneva, "Lucida Grande", Verdana, sans-serif;
```

### Files modified

- `app/components/blog-window.css` (10a, 10b, 10c, 10f, 10g, 10h)
- `app/components/PostReaderWindow.tsx` (10c — focus dispatch)
- `app/components/PostListingsWindow.tsx` (10c — possible z-index or
  CSS class addition)
- `app/components/ClassicyDesktopInner.tsx` (10d, 10e — icon positions
  and/or About app ID rename)
- `app/components/AboutWindow.tsx` (10e — possible app ID rename; 10g —
  font fix)
- `app/components/ContactWindow.tsx` (10g — font fix)
- `app/components/AboutThisSiteWindow.tsx` (10h — only if moving font
  to inline style instead of CSS)

### Verify

- `npm run content:build` — clean
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm test` — unit suite passes
- `npm run build` — succeeds
- `npm run test:e2e` — all existing tests still pass
- **Manual browser checks (paste screenshots or describe results):**
  1. Home page: post title "Hello, Classicy" renders in Chicago (blocky,
     unsmoothed, 24px, normal weight)
  2. Post subtitle and date render in Geneva (sans-serif)
  3. File → Open opens the Posts listings window **visibly on top of** the
     Reader
  4. Clicking a row in the listings navigates the Reader to that post
  5. Double-clicking the About desktop icon opens the About sub-window
  6. Double-clicking the Contact desktop icon opens the Contact sub-window
  7. About, Contact, and About This Site windows all render text in Geneva
  8. Desktop icons (About, Contact, Hard Drive) are visually separated,
     none overlap

### Commit message

`Step 10: UI bug fixes from post-audit (fonts, z-order, icons)`

### Gemini prompt

> You are executing **Step 10** of the Phase 1 plan for
> `code.rodmachen.com`. Read `docs/plans/phase-1.md` — your scope is the
> "Step 10 — UI bug fixes (post-audit)" section.
>
> **Starting state:** branch `feature/classicy-phase-1`. Steps 1–9 have
> landed. An Opus-driven browser audit found eight UI bugs. Your job is
> to fix all of them.
>
> **Required reading before you start:**
> 1. The full "Step 10" section in `docs/plans/phase-1.md` — it describes
>    every bug, the root cause, and a suggested fix.
> 2. The files listed in "Background for Gemini" in that section.
> 3. The Classicy library's exported types and state shape — use
>    `node_modules/classicy/dist/` to understand available actions and
>    icon model fields. Do not guess — investigate.
>
> **Work through items 10a–10h in order.** For each:
> 1. Read the relevant source files.
> 2. Apply the fix (or investigate and apply a better fix if the
>    suggested one doesn't work).
> 3. Run the verification suite: `npm run content:build`, `npx tsc
>    --noEmit`, `npm run lint`, `npm test`, `npm run build`, `npm run
>    test:e2e`.
> 4. If any check fails, fix it before moving to the next item.
>
> **Investigation tasks (10c, 10d, 10e):** These require looking at
> Classicy's source/types to find the right approach. Grep
> `node_modules/classicy/dist/` for action types, icon position fields,
> etc. Report what you find and the approach you took.
>
> **Do not commit or push.** Reply with:
> (1) files modified and what changed in each,
> (2) investigation findings for 10c/10d/10e,
> (3) full output of all six verification commands,
> (4) manual browser check results (describe what you see for each of
>     the eight checks in the Verify section),
> (5) anything you couldn't fix and why.

---

## Step 11 — UI polish: desktop icons, Finder-style Posts, menu bar, trash ✅

**Executor:** **Opus** · **Reviewer:** Opus
**Test posture:** tests-alongside — changes are UI/behavioral; verify with
automated checks plus manual browser confirmation.

A second round of user-reported issues after Step 10. This step addresses
ten items grouped into sub-steps.

### Background

Classicy exports `ClassicyIcons` which contains bundled icon assets:
- `ClassicyIcons.system.files.document` — document file icon
- `ClassicyIcons.system.desktop.trashEmpty` — empty trash can icon
- `ClassicyIcons.system.drives.disk` — hard drive icon

The Classicy `ClassicyDesktopIconAdd` action (line 1674 of classicy.es.js)
deduplicates by `appId`. Desktop icon `location` is `[left, top]` in pixels.
Classicy persists state to `localStorage("classicyDesktopState")` which can
cause stale duplicates during development.

### Items to fix

**10.5a. Fix duplicate About desktop icon and duplicate "contact" React keys.**

Two issues cause the duplicate icons and React key warnings:

1. The `DesktopInit` useEffect in `ClassicyDesktopInner.tsx` manually
   splices icons into state with `useAppManager.setState()`. Due to
   localStorage persistence and React strict mode, duplicate icons can
   accumulate. Fix: before setting icons, deduplicate by `appId` so that
   even if stale state exists, only one icon per `appId` survives.

2. The Contact desktop icon uses `appId: 'contact'` which matches
   `CONTACT_APP_ID = 'contact'` exactly. Same for About (`siteAbout`).
   The `ClassicyApp` components dispatch `ClassicyDesktopIconAdd` unless
   `noDesktopIcon` is set — our apps have `noDesktopIcon`, but Classicy's
   internal key generation for window/app tracking may still produce
   duplicate React keys when both the desktop icon and the app share an
   `appId`. Fix: rename the desktop icon `appId` values to be distinct
   from the `ClassicyApp` component IDs. Use `appId: 'desktop.about'`
   and `appId: 'desktop.contact'`. Then wire the icon's click behavior
   to open the corresponding app (via `event` / `eventData` fields on the
   icon, or by subscribing to icon open events and dispatching
   `ClassicyAppOpen` for the real app).

   **Investigation needed**: check how Classicy wires desktop icon
   double-click to app opening. The `ClassicyDesktopIconOpen` action
   (line 1667) dispatches `ClassicyAppOpen` using the icon's `appId`.
   If the icon `appId` doesn't match a `ClassicyApp`, the app won't open.
   Options:
   - Keep matching appIds but investigate the actual source of the
     duplicate React keys — it may be a different issue entirely.
   - Use the icon's `event` / `eventData` fields to dispatch a custom
     action, and handle that in a subscriber.

   Start by checking whether simply deduplicating icons (fix 1) also
   resolves the React key warnings. If so, matching appIds are fine.

**10.5b. Use Classicy's built-in document icon for About/Contact desktop icons.**

Replace the transparent 1x1 GIF with `ClassicyIcons.system.files.document`.
Import `ClassicyIcons` from `'classicy'` (it's exported at line 36434).

This should also fix the `GET /document` 404 errors — the transparent GIF
may be causing Classicy's icon rendering pipeline to fall through to a
URL-based icon lookup.

**10.5c. Move About/Contact icons to right side of desktop, below Hard Drive.**

Mac convention: icons stack top-to-bottom on the right edge. Hard Drive
is already on the right (placed by Classicy's Finder). Position About and
Contact below it.

The Hard Drive icon's position is auto-placed by Classicy. Investigate its
default position, then place About and Contact below it. Approximate
positions: About at `[right-edge, hard-drive-top + 80]`, Contact at
`[right-edge, hard-drive-top + 160]`. Since the desktop width varies,
use a useEffect that reads the desktop element's width or reads the Hard
Drive icon's current position from state, then positions accordingly.

Alternatively, use fixed right-side positions that work at common screen
widths (e.g., `location: [window.innerWidth - 80, 80]` for About,
`[window.innerWidth - 80, 160]` for Contact). Classicy's icon location
tuple is `[left, top]`.

**10.5d. Add Trash icon to desktop.**

Add a desktop icon using `ClassicyIcons.system.desktop.trashEmpty` with
label "Trash". Position it in the bottom-right corner (Mac convention).
On double-click, open `https://www.utexas.edu/` in a new tab.

Use the icon's `onClickFunc` field (Classicy supports this per line 1687)
or use the `event`/`eventData` fields. The `onClickFunc` approach is
simplest — set it to `() => window.open('https://www.utexas.edu/', '_blank')`.

Note: Classicy icons respond to double-click for opening, not single-click.
Investigate whether `onClickFunc` fires on double-click or single-click.
If it fires on single-click, use the `event`/`eventData` pattern instead,
or listen for the `ClassicyDesktopIconOpen` action in a subscriber.

**10.5e. Make menu bar persistent — always show File/Edit/View/Help.**

Currently the blog window's `appMenu` only shows when the blog app is
focused. When focus moves to Finder, desktop, or a sub-window, the menu
items disappear.

Fix: Move the menu bar items from `PostReaderWindow`'s `appMenu` prop to
the desktop-level system menu or find a way to make the blog app always
own the menu bar. Options to investigate:

1. **Global menu approach**: Classicy's `ClassicyDesktop` or the state
   manager may support a global/default app menu. Check if there's a
   `defaultAppMenu` or similar concept.
2. **Finder menu override**: Register the File/Edit/View/Help items on the
   Finder.app itself (since Finder is always "running"). This way, when
   the desktop or Finder is focused, the same menus appear.
3. **Force blog focus**: Keep the blog app focused at all times by
   intercepting focus changes. This is fragile and not recommended.
4. **addSystemMenu prop**: The `ClassicyApp` component has an
   `addSystemMenu` prop (line 7471). Investigate whether setting this
   adds the app's menu to the system-level menu bar permanently.

The preferred approach is (2) or (4) — whichever Classicy supports.

**10.5f. Hard Drive icon should open Posts listings (same as File > Open).**

Currently the Hard Drive desktop icon opens Classicy's built-in Finder
window showing a fake filesystem (Applications, Library, etc.). It should
instead open the Posts listings window.

Fix: Intercept the Hard Drive icon's open action. When the Hard Drive
icon is double-clicked, Classicy dispatches `ClassicyDesktopIconOpen`
which triggers `ClassicyAppOpen` for `Finder.app`. Instead, we want it
to open the PostListingsWindow.

Options:
1. Subscribe to state changes and detect when Finder.app opens, then
   immediately close it and open PostListingsWindow instead.
2. Remove the default Hard Drive icon and replace it with a custom one
   that has the same visual but opens PostListingsWindow.
3. Override the Finder.app's behavior.

Option 2 is cleanest. Remove the Macintosh HD renaming logic and instead:
- Remove the default Hard Drive icon (via `ClassicyDesktopIconRemove`)
- Add a custom "Hard Drive" icon with the disk icon
  (`ClassicyIcons.system.drives.disk`) that dispatches `ClassicyAppOpen`
  for `POST_LISTINGS_APP_ID` on double-click.

**10.5g. Posts listings window: Finder-style appearance.**

Transform the PostListingsWindow to look like a Classicy Finder window:

1. **Window controls**: Enable `zoomable={true}` and `collapsable={true}`
   (WindowShade) on the `ClassicyWindow`.
2. **Title bar icon**: Set the window's icon to
   `ClassicyIcons.system.drives.disk` (the Hard Drive icon).
3. **Column headers**: Change from Name/Date Added/Tags to
   Name/Date Modified/Size/Kind:
   - **Name**: post title (sortable, click to sort A-Z / Z-A)
   - **Date Modified**: post date (sortable, click to sort newest/oldest,
     default sort)
   - **Size**: calculated HTML body byte size, displayed human-readable
     (e.g., "2.4 KB"). Sortable.
   - **Kind**: post tags joined (e.g., "coding, react"). NOT sortable.
4. **Sort triangles**: Active sort column shows a triangle indicator
   (▲ ascending, ▼ descending). Clicking a sortable header toggles
   direction. Default: Date Modified descending.
5. **Status bar**: Bottom of the window shows "{N} items, {total bytes}"
   (e.g., "4 items, 12.8 KB"). Style to match Classicy Finder's bottom
   info area.
6. **Row styling**: Keep current hover highlight. Each row should show a
   small document icon before the name (using
   `ClassicyIcons.system.files.document` or similar small icon).

Byte calculation: `new Blob([post.body]).size` gives the byte count of the
HTML body string. This runs at module load time (posts are statically
imported), so no performance concern.

**10.5h. Remove italic from post subtitle.**

In `blog-window.css`, remove `font-style: italic` from `.blogPostSubtitle`.

**10.5i. Fix GET /document 404 errors.**

These are likely caused by the transparent GIF icons or empty `icon=""`
props. Fixing 10.5b (using real Classicy icons) should resolve the 404s.
If they persist after 10.5b, investigate further:
- Check if any `<img src="">` elements exist (empty src causes a request
  to the current page)
- Check if Classicy's icon resolution falls back to a URL-based fetch
  for `kind: 'document'`

This item may be resolved by 10.5b — verify after that fix is applied.

**10.5j. Bondi Blue teal stipple desktop background.**

The previous iteration of the site had a teal stippled desktop background
inspired by the Bondi Blue iMac. Restore it by applying a tiny 2×2 pixel
PNG pattern to the Classicy desktop area.

CSS to add (as a utility class or applied directly to the desktop element):

```css
/* Bondi Blue stipple desktop background */
.bg-os8-bondi {
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAE0lEQVR4nGNgKO9gWLWKAYTLOwAeNASnVBlSOwAAAABJRU5ErkJggg==");
  background-repeat: repeat;
  background-size: 2px 2px;
  image-rendering: pixelated;
}
```

The Base64 PNG uses `#007788` and `#00AAAA` pixels for a classic teal iMac
vibe. Apply the class to the Classicy desktop element — either via a
`className` prop on `ClassicyDesktop` or by targeting the desktop element
with a CSS selector and applying the properties directly. Ensure the
background covers the full viewport behind all windows and desktop icons.

### Execution order

1. **10.5h** (trivial CSS fix — subtitle italic)
2. **10.5b** (use real document icons — may fix 404s)
3. **10.5a** (deduplicate icons, fix React key warnings)
4. **10.5c** (reposition icons to right side)
5. **10.5d** (add Trash icon)
6. **10.5e** (persistent menu bar)
7. **10.5f** (Hard Drive opens Posts)
8. **10.5g** (Finder-style Posts listings)
9. **10.5i** (verify 404s are gone; investigate if not)
10. **10.5j** (Bondi Blue desktop background)

### Files modified

- `app/components/blog-window.css` (10.5h, 10.5g status bar and sort styles)
- `app/components/ClassicyDesktopInner.tsx` (10.5a, 10.5b, 10.5c, 10.5d,
  10.5e, 10.5f — icon management, menu bar, Hard Drive behavior)
- `app/components/PostListingsWindow.tsx` (10.5g — Finder-style redesign)
- `app/components/PostReaderWindow.tsx` (10.5e — move appMenu to global
  level if needed)
- `app/globals.css` or inline in `ClassicyDesktopInner.tsx` (10.5j — Bondi
  Blue desktop background)

### Verify

- `npm run content:build` — clean
- `npx tsc --noEmit` — clean
- `npm run lint` — clean
- `npm test` — unit suite passes
- `npm run build` — succeeds
- `npm run test:e2e` — all existing tests still pass
- **Manual browser checks:**
  1. Desktop shows exactly one About icon and one Contact icon with
     document icons visible, positioned on the right side below Hard Drive
  2. Trash icon visible in bottom-right corner; double-clicking opens
     https://www.utexas.edu/ in a new tab
  3. Menu bar always shows File/Edit/View/Help regardless of which window
     is focused or if the desktop is clicked
  4. Double-clicking Hard Drive opens the Posts listings window (not the
     Finder filesystem)
  5. Posts listings has Name/Date Modified/Size/Kind columns with sort
     triangles on Name, Date Modified, Size; clicking sorts; Kind is
     not sortable
  6. Posts listings shows item count and total bytes in a status bar
  7. Posts listings has Zoom and WindowShade buttons in title bar
  8. Posts listings title bar shows the Hard Drive icon
  9. Post subtitle is NOT italicized
  10. Browser console has no `GET /document` 404 errors
  11. Browser console has no "duplicate key" React warnings
  12. File > Open still works and opens the same Posts listings window
  13. Desktop background shows a teal Bondi Blue stipple pattern (not the
      default Classicy background)

### Commit message

`Step 11: UI polish — desktop icons, Finder-style Posts, persistent menu, trash, Bondi Blue background`

---

## Step 12 — Vercel preview deploy + bundle measurement

**Executor:** Gemini 3.1 Pro (mechanical) + Opus (interpret) + User (Vercel setup) · **Reviewer:** Opus
**Test posture:** tests-alongside

Phase 1's exit criterion is a working preview URL. Per pre-plan §5.8, do
**not** touch the production `code.rodmachen.com` DNS in this phase
(decision pending — see §12d).

Step 12 has four sub-steps with explicit ordering. 12a (user) and 12b
(Gemini) are independent and can run in parallel; 12c and 12d are
strictly sequential and must wait for both.

Files created/modified across the whole step:
- `package.json` — add `@next/bundle-analyzer` as a dev dep, add
  `npm run analyze` script (12b)
- `next.config.mjs` — wire the analyzer behind `ANALYZE=true` (12b)
- PR description — record preview URL, bundle numbers, top-10 chunks,
  any deployed-preview console warnings (12d)

**Commit message:** `Step 12: Vercel preview deploy and bundle measurement`

---

### Step 12a — Vercel project setup (User, one-time)

**Owner:** User. Cannot be done by Gemini or Opus. Can run in parallel with 12b.

1. In the Vercel dashboard, create a new project from the
   `rodmachen/code-rodmachen-com` GitHub repo.
2. Project name: **`code-rodmachen-com`** (matches the repo; the earlier
   `-classicy` suffix was defensive against an imagined existing project
   that doesn't exist).
3. Confirm the framework preset auto-detects as **Next.js**.
4. Set the production branch to `main` so feature-branch pushes produce
   *preview* deploys, not production deploys.
5. **Do not assign a custom domain yet.** The DNS decision lives in 12d.
6. Report back to Opus: the project URL (e.g.
   `vercel.com/<team>/code-rodmachen-com`) and confirmation that the
   framework preset is Next.js.

**Verify (12a):** Vercel project exists, is connected to the GitHub repo,
production branch is `main`, no custom domain assigned.

---

### Step 12b — Bundle analyzer + local measurement (Gemini 3.1 Pro)

**Owner:** Gemini 3.1 Pro. Can run in parallel with 12a. Does **not**
touch git or Vercel.

Mechanical work — see the "Gemini prompt" subsection below for the exact
deliverables. Outputs:
- Modified `package.json` and `next.config.mjs`
- Verbatim `npm run build` output (especially the Route table)
- Bundle analyzer report file sizes / top-chunk list
- Pass/fail of Playwright e2e against a **production** build (`next start`,
  not `next dev`)

**Verify (12b):** Gemini's reply includes all five deliverables listed in
the prompt, with raw build output pasted (not summarized).

---

### Step 12c — Review, commit, push (Opus)

**Owner:** Opus. **Strict prerequisite: 12a AND 12b are both done.**

Why both: pushing the commit triggers a Vercel deploy, and that deploy
needs a Vercel project to land in (12a). Pushing without 12a would just
sit on GitHub with no preview URL.

1. Re-run all of Gemini's verification commands locally (per the project's
   redundancy policy in the "Roles and workflow" section): clean
   `npm run build`, `ANALYZE=true npm run build`, e2e against
   `next start`.
2. Stage Gemini's `package.json` and `next.config.mjs` changes.
3. Commit with the Step 12 message.
4. Push the branch. The Vercel GitHub integration auto-creates a preview
   deploy against the new project from 12a.
5. Wait for the Vercel deploy to finish; capture the preview URL.

**Verify (12c):** local runs all green, commit pushed, Vercel preview URL
returned (typically `code-rodmachen-com-<hash>-<team>.vercel.app`).

---

### Step 12d — Preview verification + interpretation + DNS decision (Opus + User)

**Owner:** Opus interprets the numbers and verifies the preview; User
decides whether to assign the custom domain.

1. **Opus visits the preview URL** and verifies:
   - Home page loads, Classicy desktop renders
   - Both placeholder posts visible in the sidebar
   - Clicking a post updates the URL and reading pane (no full reload)
   - Direct navigation to `/posts/typography-test` lands selected
   - Browser back restores the prior selection
   - Console is free of errors (audio-sprite warnings excepted) and
     hydration warnings
2. **Opus interprets bundle numbers** against pre-plan §5.2 (rough
   expectation: 500KB+ gzipped JS). If first-load JS for any route exceeds
   **~1MB gzipped**, flag it in the PR description and recommend a
   lazy-loading pass before Phase 2. Otherwise just record the numbers.
3. **Opus updates the PR description** with: preview URL, exact First Load
   JS numbers, bundle analyzer top-10 chunk list, any deployed-preview
   warnings, and the verdict on whether numbers are within expectation.
4. **DNS decision (User-only call).** The original plan defers DNS to
   Phase 2. The case for *waiting*: only 2 placeholder posts are live;
   cutting over makes `code.rodmachen.com` show "Hello Classicy" + a
   typography test until content is migrated. The case for *cutting over
   now*: if the existing S3 site is fully abandoned and not serving
   anything users still rely on, cutover gives end-to-end verification on
   the real domain at zero cost. **The user decides.** If the user opts
   to cut over: assign `code.rodmachen.com` as a production domain on the
   Vercel project, update DNS at the registrar (Vercel will surface the
   exact records), and record the cutover in the PR description as a
   scope deviation from the original plan.

**Verify (12d):** preview URL renders cleanly, PR description updated,
DNS decision recorded one way or the other.

### Gemini prompt (mechanical half only — Opus interprets the numbers)

> You are executing the **mechanical half of Step 12** (sub-step 12b)
> of the Phase 1 plan for `code.rodmachen.com`. Read `docs/plans/phase-1.md`
> for full context. Your scope is **bundle analysis and measurement only**
> — the Vercel project setup (12a) and the decision about whether the
> bundle numbers are acceptable (12d) are not your call.
>
> **Starting state:** branch `feature/classicy-phase-1`. Steps 1–10 have
> landed. The full Phase 1 UI is working locally and is fully tested.
>
> **Deliverables:**
>
> 1. Add to `package.json` devDependencies: `@next/bundle-analyzer`
>    (pinned exact version).
>
> 2. Update `next.config.mjs` to conditionally wrap the config with the
>    analyzer when the `ANALYZE` env var is truthy. **Preserve any existing
>    Velite plugin wrapping** from Step 4. Pattern:
>    ```js
>    import bundleAnalyzer from '@next/bundle-analyzer';
>    const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });
>    export default withAnalyzer(withVelite(nextConfig));
>    ```
>    Adjust to match whatever wrappers are already present.
>
> 3. Add an `analyze` script to `package.json`:
>    `"analyze": "ANALYZE=true next build"`.
>
> **Measurement runs:**
>
> 1. Run `npm run build` and capture the full output, especially the
>    "Route (app)" table. Record exact kB numbers for:
>    - `/` (home page)
>    - `/posts/[slug]` (dynamic post route)
>    - `First Load JS shared by all` (the shared baseline)
>
> 2. Run `npm run analyze` — produces bundle analyzer HTML reports at
>    `.next/analyze/*.html`. Report file sizes via
>    `ls -lh .next/analyze/` and, if possible, grep the HTML for the top
>    chunk names by size.
>
> 3. Run the e2e suite against a **production build**, not dev:
>    - `npm run build`
>    - Start `npm run start` in the background
>    - Wait a few seconds for it to be ready
>    - `npm run test:e2e`
>    - Kill the background server
>    - Report whether tests passed under `next start`
>
> **Do not commit or push.** Reply with:
> (1) files created/modified,
> (2) **exact First Load JS numbers** for each route (verbatim from the
> build output),
> (3) top-10 chunk list or report file sizes,
> (4) whether the production build test run passed,
> (5) any runtime warnings.
>
> **Do not interpret the numbers** or claim anything about acceptability —
> that's Opus's job. Just paste the numbers.
>
> **Vercel deploy setup is NOT your job.** The user creates the new Vercel
> project (`code-rodmachen-com`) manually from the GitHub repo in
> sub-step 12a. Do not run any `vercel` CLI commands or touch Vercel
> configuration. Your scope is sub-step 12b only — the bundle analyzer
> wiring and the local measurement runs.

---

## End-to-end verification (Phase 1 exit criteria)

Phase 1 is done when **all** of the following are true:

1. CI is green on the PR (lint, type check, build, Playwright e2e)
2. The Vercel preview URL renders the Classicy desktop with: a single
   menu bar, the Reader window centered (max-width 1000px) showing the
   most recent post, the speaker icon (muted) to the left of the clock,
   and a desktop with `Hard Drive`, `About`, and `Contact` icons
3. The four custom menus (Apple / File / Edit / View / Help) all render
   their documented items with no keyboard shortcuts; Edit → Edit Posts
   is disabled; View toggles between Normal and Full Width and resets on
   navigation; Apple → About This Site opens the tech-stack window
4. File → Open opens the Posts listings window with Name / Date Added /
   Tags columns; clicking a row navigates to `/posts/[slug]` and the
   Reader updates without a full page reload
5. Direct navigation to `/posts/[slug]` lands with the right post
   selected in the Reader (deep-link preserved)
6. Double-clicking the desktop About icon opens the full About sub-window;
   double-clicking Contact opens the Contact sub-window; both stack above
   the Reader
7. Post body text renders in Geneva (or the verified Classicy-shipped
   Geneva equivalent), headings remain in unsmoothed ChicagoFLF
8. Browser console is free of errors and React hydration warnings on
   every route, in both `next dev` and `next start` (audio-sprite warnings
   excepted, as they have been since Step 3)
9. Bundle size measurement is recorded in the PR description (no budget
   enforcement yet — that's a Phase 2 decision)
10. The production `code.rodmachen.com` DNS decision is recorded in the
    PR description (either "untouched per plan" or "cut over with the
    user's explicit approval in §12d")

When all ten hold, the PR is ready for human review. After merge,
Phase 2 picks up: theme/sound decisions, content migration from the old
repo, RSS, topics pages, analytics, Cloudinary, a11y audit, bundle budget,
DNS cutover.

---

## Executor assignment summary

| Step | Executor | Reviewer & git owner |
|---|---|---|
| 1 — Scaffold Next.js | Gemini 3.1 Pro | Opus |
| 2 — CI + tests | Gemini 3.1 Pro | Opus |
| 3 — Classicy spike | **Opus** | Opus |
| 4 — Velite + posts | Gemini 3.1 Pro | Opus |
| 5 — Blog window | **Opus** | Opus |
| 6 — Typography | Gemini 3.1 Pro | Opus |
| 7 — Chrome and menu bars | **Opus** | Opus |
| 8 — Multi-window architecture | **Opus** | Opus |
| 9 — About/Contact + Geneva font | Gemini 3.1 Pro | Opus |
| 11 — UI polish (icons, Finder Posts, menu, trash, Bondi Blue bg) | **Opus** | Opus |
| (UI iteration steps may be inserted here — usually **Opus**) | | |
| 12 — Deploy + measure | Gemini (mechanical) + Opus (interpret) + User (Vercel + DNS) | Opus |

**Model switches happen between Steps 2→3, 3→4, 4→5, 5→6, 6→7, 8→9,
and (after any inserted UI iteration steps) when entering Step 10 and
again entering Step 12b.** At each switch the user stops and changes
the active model in Claude Code, then runs the corresponding Gemini
prompt (from the step's "Gemini prompt" subsection) in a separate
Gemini session, then pastes Gemini's reply back into a Claude Code
session for Opus to review and commit. Steps 3, 5, 7, 8 (and any
inserted UI iteration steps) run entirely in Claude Code with Opus.

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
app/components/ClassicyDesktopInner.tsx
app/components/PostReaderWindow.tsx          # replaces BlogWindow.tsx in Step 8
app/components/PostListingsWindow.tsx        # Step 8
app/components/AboutThisSiteWindow.tsx       # Step 7 (Apple menu)
app/components/AboutWindow.tsx               # Step 9 (desktop icon)
app/components/ContactWindow.tsx             # Step 9 (desktop icon)
app/components/PostBody.tsx
app/components/post-body.module.css
app/components/blog-window.css
app/posts/[slug]/page.tsx
content/posts/hello-classicy.md
content/posts/typography-test.md
tests/e2e/smoke.spec.ts
tests/e2e/blog.spec.ts
tests/e2e/typography.spec.ts
tests/e2e/chrome.spec.ts                     # Step 7
tests/e2e/posts-listings.spec.ts             # Step 8
tests/e2e/desktop-windows.spec.ts            # Step 9
tests/unit/content.test.ts
README.md
```

Files **deleted** during Phase 1:
- `app/components/BlogWindow.tsx` (Step 8 — replaced by `PostReaderWindow.tsx`)

Files modified (existing):
- `.gitignore` (extend)

Files **not** touched in Phase 1: anything under `docs/` (those are
authoritative inputs to the plan, not outputs).
