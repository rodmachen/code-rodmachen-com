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
4. **Bundle weight unknown.** → Step 7 captures a measurement and records
   it in the PR description. Budget enforcement deferred to Phase 2.

---

## Roles and workflow

Phase 1 is executed collaboratively by Opus, Gemini 3.1 Pro, and the user.
Each role has a well-defined lane.

**Opus (Claude Code, this agent):**
- Owns this plan document and keeps it current
- Writes the Gemini prompts for each Gemini-eligible step
- **Executes Steps 3 and 5 directly** (framework spike and Model A shell)
- **Reviews Gemini's output** for every Gemini-executed step: reads the
  diff, re-runs the verification commands locally, and catches drift
  between "works on Gemini's machine" and "works here"
- **Owns all git actions** — stage, commit, push, open/update the PR
- Interprets the bundle numbers Gemini produces in Step 7

**Gemini 3.1 Pro:**
- Executes mechanical scaffolding and implementation work for Steps
  1, 2, 4, 6, and the mechanical half of Step 7
- Reads this plan file as its source of truth for each step
- Produces files and pastes verification command output
- **Does not touch git.** No staging, no commits, no pushes. Just writes
  files and reports what ran

**User (Rod):**
- Switches the active model in Claude Code between Opus-owned steps
  (3, 5) and Gemini-executed steps (1, 2, 4, 6, 7-mechanical)
- Runs the Gemini prompts in a separate Gemini session
- Pastes Gemini's reply back into Claude Code so Opus can review and commit
- Performs the one-time Vercel project setup in Step 7
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

## Step 7 — Vercel preview deploy + bundle measurement

**Executor:** Gemini 3.1 Pro (mechanical) + Opus (interpret) · **Reviewer:** Opus
**Test posture:** tests-alongside

Phase 1's exit criterion is a working preview URL. Per pre-plan §5.8, do
**not** touch the production `code.rodmachen.com` DNS in this phase.

Files created/modified:
- `package.json` — add `@next/bundle-analyzer` as a dev dep, add
  `npm run analyze` script
- `next.config.mjs` — wire the analyzer behind `ANALYZE=true`
- PR description — record:
  - The Vercel preview URL
  - First-load JS size (kB) for `/` and `/posts/[slug]` from the build output
  - The bundle analyzer top-10 chunk list
  - Any console errors or warnings in the deployed preview

**Vercel project setup (user action, not Gemini, not Opus):**
- User connects the GitHub repo to a new Vercel project named
  `code-rodmachen-com-classicy` (distinct from any existing
  `code-rodmachen-com` project so the production domain is unaffected)
- User confirms the framework preset is "Next.js"
- User does **not** assign a custom domain in this phase

**Opus-only interpretation:**
- Read the bundle numbers Gemini reports and judge whether they're in the
  expected range per pre-plan §5.2 (rough expectation: 500KB+ gzipped JS).
- If first-load JS for any route exceeds ~1MB gzipped, flag it in the PR
  description and recommend a lazy-loading pass before Phase 2.

**Verify:**
- Push the branch; the Vercel GitHub integration produces a preview URL
- Visit the preview URL: home page loads, both posts render, sidebar
  navigation works, no console errors
- `ANALYZE=true npm run build` produces the bundle report
- All Playwright tests pass against `npm run start` (production build, not dev)

**Commit message:** `Step 7: Vercel preview deploy and bundle measurement`

### Gemini prompt (mechanical half only — Opus interprets the numbers)

> You are executing the **mechanical half of Step 7** of the Phase 1 plan
> for `code.rodmachen.com`. Read `docs/plans/phase-1.md` for full context.
> Your scope is **bundle analysis and measurement only** — the Vercel
> project setup and the decision about whether the bundle numbers are
> acceptable are not your call.
>
> **Starting state:** branch `feature/classicy-phase-1`. Steps 1–6 have
> landed. The full Phase 1 UI is working locally.
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
> project (`code-rodmachen-com-classicy`) manually from the GitHub repo.
> Do not run any `vercel` CLI commands or touch Vercel configuration.

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

## Executor assignment summary

| Step | Executor | Reviewer & git owner |
|---|---|---|
| 1 — Scaffold Next.js | Gemini 3.1 Pro | Opus |
| 2 — CI + tests | Gemini 3.1 Pro | Opus |
| 3 — Classicy spike | **Opus** | Opus |
| 4 — Velite + posts | Gemini 3.1 Pro | Opus |
| 5 — Blog window | **Opus** | Opus |
| 6 — Typography | Gemini 3.1 Pro | Opus |
| 7 — Deploy + measure | Gemini (mechanical) + Opus (interpret) | Opus |

**Model switches happen between Steps 2→3, 3→4, 4→5, 5→6, and 6→7.** At
each switch the user stops and changes the active model in Claude Code,
then runs the corresponding Gemini prompt (from the step's "Gemini prompt"
subsection) in a separate Gemini session, then pastes Gemini's reply back
into a Claude Code session for Opus to review and commit. Steps 3 and 5
run entirely in Claude Code with Opus.

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
