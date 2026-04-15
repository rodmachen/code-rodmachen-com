# Phase 1.5 — Tech Debt Cleanup

## Context

Phase 1 (visual foundation, completed in PR #4) was built mostly by mid-tier models. It works, deploys, and tests pass — but the code carries tech debt that will compound through Phase 2. This plan addresses that debt now, before adding Phase 2 features (RSS, topics page, Cloudinary remark plugin, cross-site nav).

The goal is **not** new features. It's a clean foundation.

### Architectural decisions made up-front (with user)

- **Stay close to the Classicy way.** Customizations stay; their *implementation* gets simpler by using Classicy's public dispatch API instead of deep `setState` writes and reactive watchers.
- **Keep all four desktop customizations** (Hard Drive label, Trash position, sounds disabled, time format). None are individually expensive to keep.
- **Re-enable Classicy persistence.** Drop the `localStorage.removeItem` wipe; make customization effects idempotent so they reapply cleanly on each load.
- **URL is the source of truth for the focused window.** The dual `pushState` + `popstate` + Classicy-dispatch system gets replaced by a single `useBlogNavigation` hook. Contract: `/` and `/posts` show the Post Listings window focused; `/posts/<slug>` opens that post and focuses it. Persistence may restore extra open windows from a prior session — fine, as long as the URL's window is the focused one.
- **Out of scope:** CI/Playwright caching, content-schema additions for Phase 2 (thumbnails, reading time), responsive/mobile (intentionally desktop-only), Chicago font extraction (the bundled-by-Classicy approach is acceptable for now).

### Audit findings driving the plan

Confirmed by reading the code directly + 3 parallel exploration agents:

- **Dead code:** `PostListingsWindow.tsx` (192 LOC), `PostReaderWindow.tsx` (~360 LOC) — neither is imported anywhere in the live render path (`app/page.tsx` and `app/posts/[slug]/page.tsx` both render `<ClassicyShell>` → `ClassicyDesktopInner` → `BlogApp`). Plus root scratch files `test.js`, `test.mjs`, `test-classicy.js`.
- **Type holes:** five `// @ts-ignore` comments on Classicy exports + `(state: any)` / `(i: any)` selectors throughout `BlogApp.tsx` and `ClassicyDesktopInner.tsx`.
- **Duplication:** `formatDate` defined in `BlogApp.tsx`, `PostReaderWindow.tsx`, `PostListingsWindow.tsx` (last two are dead, but pattern remains). `ClassicyMenuItem` type re-declared in three files. Help/About/Contact menu items duplicated between `BlogApp.tsx` (ReaderWindow's `appMenu`) and `ClassicyDesktopInner.tsx` (`blogMenu`).
- **Classicy fight patterns:** reactive watcher + deep `setState` to relabel "Macintosh HD" → "Hard Drive" (`ClassicyDesktopInner.tsx:44–72`); module-top `localStorage.removeItem` (`ClassicyDesktopInner.tsx:3–5`); single mega-`setState` mutating icons + DateAndTime + appMenu + systemMenu (lines 241–269).
- **Navigation race tissue:** `mounted` flag in `BlogApp.tsx:169–173` (ESLint flagged), `openSlugsRef` workaround at lines 343–347, `popstate` + `pushState` manually synced with Classicy dispatch (lines 356–397).
- **CSS:** 22 `!important` declarations in `blog-window.css` overriding Classicy chrome — some essential (typography contract), some cosmetic.
- **Config:** `velite.config.ts:22` uses `rehypeShiki as any` to mask a `unified` version duplication between `@shikijs/rehype` and velite's transitive dep.

### Branching & PR

- Repo already initialized; CI exists (`.github/workflows/ci.yml`); test framework exists (Vitest + Playwright). No project-initialization steps needed.
- Create one feature branch: `feature/phase-1-cleanup`.
- One PR, atomic commits per step. Open the PR after the first implementation commit lands; update its description after each step.

---

## Steps

> **Pause rule:** Pause between steps whenever the **model** changes or the **effort level** changes. Each step's assignment is at the bottom.

### Step 1 — Delete dead code and scratch files

**Files to modify:**
- Delete: `app/components/PostListingsWindow.tsx`
- Delete: `app/components/PostReaderWindow.tsx`
- Delete: `test.js`, `test.mjs`, `test-classicy.js` (root)

**What:** Confirmed dead — not imported anywhere on the live render path. Removes ~550 LOC and removes confusion about which post components are canonical.

**Tests:** Tests-alongside. No test changes expected (these files are not referenced by any test).

**Verify:**
- Run `grep -r "PostListingsWindow\|PostReaderWindow" app/ tests/ content/` — should return zero matches outside `docs/`.
- Run `npm run content:build && npx tsc --noEmit && npm run lint && npm test && npm run build && npm run test:e2e` — all green.

**Model & effort:** **Sonnet** / **medium** — Pure deletion verified by grep and build. No ambiguity, nothing downstream depends on getting this subtle.

---

### Step 2 — Add `types/classicy.d.ts`; eliminate `@ts-ignore` and `(state: any)`

**Files to modify:**
- New: `types/classicy.d.ts` (module augmentation declaring the runtime exports `useAppManager`, `useAppManagerDispatch`, `useSoundDispatch`, plus the slice of the store we read: `System.Manager.Applications.apps`, `System.Manager.Desktop.icons`, `System.Manager.DateAndTime`).
- `tsconfig.json` — add `"types/**/*.d.ts"` to `include` if not already covered.
- `app/components/BlogApp.tsx` — remove the two `// @ts-ignore` lines, drop `(state: any)` and `(w: any)` casts.
- `app/components/ClassicyDesktopInner.tsx` — remove three `// @ts-ignore` lines, drop `(state: any)`, `(i: any)` casts.

**What:** Reading Classicy's compiled `dist/classicy.es.js` and its existing `dist/types/`, write minimal declarations covering only what we touch. Don't try to type the entire Classicy API.

**Tests:** Tests-alongside.

**Verify:**
- `npx tsc --noEmit` passes with zero `@ts-ignore` in `app/components/`.
- `grep -rn "@ts-ignore\|: any" app/components/` should show no Classicy-related matches.
- Existing tests still pass.

**Model & effort:** **Sonnet** / **high** — Reads Classicy's compiled `dist/classicy.es.js` to author module augmentation. Type holes compound into every later step, but `tsc --noEmit` is a hard oracle.

---

### Step 3 — Extract `lib/posts.ts` (Post type, sort, formatDate)

**Files to modify:**
- New: `app/lib/posts.ts` — exports `Post` type, `sortedPosts` (sorted-by-date-desc), `formatDate`, `SortKey`, `SortDir`, `applySort`.
- `app/components/BlogApp.tsx` — import from `lib/posts.ts`; delete local `Post` type, local `formatDate`, local sort logic.

**What:** Single source for post data shaping. Note: `PostBody.tsx` and the Velite-generated `posts` array are unchanged — `lib/posts.ts` is the typed adapter.

**Tests:** Tests-alongside. Add a small `tests/unit/posts.test.ts` if `applySort` and `formatDate` aren't already covered by an existing unit test (they aren't — `tests/unit/content.test.ts` only checks the content pipeline).

**Verify:**
- `npm test` shows new unit tests passing.
- Listings window still renders posts in date-desc order; sort indicators still toggle (manual + e2e `blog.spec.ts`).

**Model & effort:** **Sonnet** / **medium** — Pure extraction of a local type and helpers. New unit tests plus existing e2e cover correctness.

---

### Step 4 — Extract `lib/menus.ts` (shared menu factory)

**Files to modify:**
- New: `app/lib/menus.ts` — exports `ClassicyMenuItem` type and a `buildBlogMenu(deps)` function returning the File / Edit / View / Help menu structure. `deps` includes `dispatch`, optional `setZoom`, optional `disableViewItems` (true when no Reader window is focused, false when one is).
- `app/components/BlogApp.tsx` — `ReaderWindow`'s `appMenu` calls `buildBlogMenu({ dispatch, setZoom, disableViewItems: false })`.
- `app/components/ClassicyDesktopInner.tsx` — `DesktopInit`'s `blogMenu` calls `buildBlogMenu({ dispatch, disableViewItems: true })`.
- Both files: delete local `ClassicyMenuItem` type, delete inline menu literals.

**What:** Single source for the entire blog menu bar. The two consumers differ only in whether the View menu's Normal/Full Width items are enabled (only the focused Reader knows its zoom state).

**Tests:** Tests-alongside.

**Verify:**
- `grep -rn "blog.help.help-me\|blog.file.open" app/ | grep -v "lib/menus"` should show zero matches (only the lib defines them).
- Menu items render and click correctly in browser: File→Open opens listings; Help→About opens About window; Help→Help me opens google.com in new tab.
- e2e `blog.spec.ts` still passes.

**Model & effort:** **Sonnet** / **medium** — Mechanical factoring of menu literals; consumers differ by one bool flag. e2e validates clicks.

---

### Step 5 — Fix `velite.config.ts` `as any` cast

**Files to modify:**
- `velite.config.ts` — replace `rehypeShiki as any` with one of: (a) `satisfies` assertion against the correct `Plugin` type imported from `unified`, (b) explicit type narrowing, or (c) `npm dedupe unified` + verify it collapses the duplicate resolved paths.

**What:** Investigate which fix actually resolves it. Try `npm dedupe` first; if that doesn't collapse the dup (transitive constraints may differ), use the type assertion approach with a clear comment explaining the dep-tree reality.

**Tests:** Tests-alongside.

**Verify:**
- `npm run content:build` succeeds.
- `npx tsc --noEmit` passes.
- `grep -n "as any" velite.config.ts` returns zero.
- Existing `tests/unit/content.test.ts` still passes (validates Velite output shape).

**Model & effort:** **Sonnet** / **high** — Investigation across three candidate fixes through npm's dep tree and Shiki/`unified` typings. Bounded to one file; `tsc --noEmit` verifies. **Judgment call:** escalate to **Opus** / high if `npm dedupe` doesn't collapse the duplicate and the type-assertion path turns murky.

---

### Step 6 — Refactor Hard Drive icon via public dispatches

**Files to modify:**
- `app/components/ClassicyDesktopInner.tsx` — delete the `needsHardDriveFix` reactive selector and its effect (lines 44–72). Replace with a single effect that dispatches `ClassicyDesktopIconRemove` for Classicy's auto-added "Macintosh HD" then `ClassicyDesktopIconAdd` with our preferred `label: 'Hard Drive'` and `location: [rightX, 40]`. The effect runs on mount and stays idempotent (safe to re-run).

**What:** Use Classicy's documented dispatch surface (confirmed by reading `node_modules/classicy/dist/classicy.es.js:1674–1697`) instead of deep `setState` mutation. Remove the reactive watcher pattern entirely. The effect can run in `DesktopInit`'s existing useEffect chain.

**Tests:** Tests-alongside. Add an e2e assertion to `tests/e2e/blog.spec.ts` (or a new `desktop.spec.ts`) that the desktop shows an icon labeled "Hard Drive" near the top-right.

**Verify:**
- Open dev server, see "Hard Drive" labeled icon top-right.
- e2e test asserts icon presence + label.
- `grep -n "needsHardDriveFix\|useAppManager.setState" app/components/ClassicyDesktopInner.tsx` — first match gone; the second will be addressed in Step 7.

**Model & effort:** **Sonnet** / **high** — Reads Classicy's compiled reducer to pick the right dispatch sequence. The idempotency pattern established here is reused in Steps 7 and 9.

---

### Step 7 — Split mega-`setState` in `DesktopInit` into focused effects

**Files to modify:**
- `app/components/ClassicyDesktopInner.tsx` — break the single `useEffect` block at lines 194–270 into:
  1. Trash icon: `ClassicyDesktopIconAdd` (only if not present).
  2. Hard Drive icon: from Step 6.
  3. DateAndTime config: deep `setState` with comment noting "no public dispatch — Classicy gap, see issue tracker if filed."
  4. System menu (`About This Site` item): deep `setState`, narrowed to only the `systemMenu` field.
  5. App menu (initial `appMenu`): deep `setState`, narrowed.
- The icon dedup logic (`seenIds` set, lines 210–215) becomes unnecessary because we no longer mutate the icons array directly — each `IconAdd` is a no-op when the icon already exists (Classicy reducer handles this at `dist/classicy.es.js:1675`).

**What:** Each customization is independently readable and idempotent. Smaller blast radius if any one needs to change.

**Tests:** Tests-alongside.

**Verify:**
- Desktop renders correctly: Trash bottom-right, Hard Drive top-right labeled "Hard Drive", clock in menu bar without seconds, system menu has "About This Site".
- e2e `blog.spec.ts` and any new desktop assertions pass.
- `grep -c "useAppManager.setState" app/components/ClassicyDesktopInner.tsx` — at most 3 (DateAndTime, systemMenu, appMenu).

**Model & effort:** **Sonnet** / **high** — Five sub-effects, each independently correct and idempotent. Step 9's persistence rework depends on getting idempotency right here.

---

### Step 8 — Audit `blog-window.css` `!important` declarations

**Files to modify:**
- `app/components/blog-window.css` — go through each of the 22 `!important` rules; for each, classify as KEEP (typography contract: Chicago font, no smoothing, integer px, post-body styling) or DROP (cosmetic override of Classicy chrome that worked fine already). Add a one-line `/* WHY */` comment above each remaining `!important`.
- Use `@layer` if it cleanly resolves any specificity issues without `!important`.

**What:** Reduce `!important` count meaningfully (target: under 8) and document the survivors so future-you knows which are load-bearing.

**Tests:** Tests-alongside. `tests/e2e/typography.spec.ts` is the safety net here — it asserts Chicago font load, no font-smoothing, and integer px sizes. Don't break it.

**Verify:**
- `grep -c "!important" app/components/blog-window.css` returns a number under 8.
- `npm run test:e2e -- typography.spec.ts` passes.
- Visual inspection in dev server: post body looks identical to before; menu bar, windows, drag affordances unchanged.

**Model & effort:** **Sonnet** / **high** — 22 subjective keep/drop calls; only `typography.spec.ts` is an automated oracle (cosmetic regressions won't fail it). **Judgment call:** escalate to **Opus** / high if specificity fights eat iterations or visual regressions surface.

---

### Step 9 — Drop `localStorage.removeItem`; make customizations idempotent

**Files to modify:**
- `app/components/ClassicyDesktopInner.tsx` — delete lines 3–5 (the module-top `localStorage.removeItem('classicyDesktopState')`).
- Verify each effect from Step 6 + Step 7 is idempotent: re-running them on a load where Classicy persistence already restored a customized state should be a no-op (or apply the same customization again with no visible change).

**What:** Re-enables Classicy persistence (window positions, drag arrangements, open windows survive reload). Idempotent customization effects mean drift is impossible.

**Tests:** Tests-alongside. Add e2e: open a post, drag the window 100px right, reload — window stays at the new position. Reload without prior drag — Hard Drive label is still "Hard Drive", Trash position unchanged, clock format unchanged.

**Verify:**
- Manual: open `/posts/hello-classicy`, drag the Reader window, reload. Window position persists.
- Manual: clear `localStorage`, reload. Hard Drive still labeled correctly, clock has no seconds.
- e2e tests for both scenarios pass.

**Model & effort:** **Opus** / **high** — Exercises every customization effect under the full persistence lifecycle. Silent drift across reloads is easy to miss; idempotency bugs surface as flaky visual state rather than hard failures.

---

### Step 10 — Build `useBlogNavigation` hook (TDD)

**Files to modify:**
- New: `app/lib/use-blog-navigation.ts` — exports a `useBlogNavigation()` hook that:
  1. Reads current pathname (`usePathname` from Next).
  2. Derives `desiredSlug` (string or null) from path: `/` and `/posts` → null; `/posts/<slug>` → slug.
  3. Maintains `openSlugs: string[]` state.
  4. On `desiredSlug` change: ensures it's in `openSlugs`; dispatches `ClassicyWindowFocus` for the matching window (or `blog.listings` if null).
  5. Exposes `openPost(slug)` and `closePost(slug)` callbacks. `openPost` calls `router.push('/posts/' + slug)`; URL change triggers the focus dispatch via the same path.
- New: `tests/unit/use-blog-navigation.test.ts` — TDD: write tests first for derivation logic (`pathToSlug`), state-update logic, and dispatch sequence. Mock `usePathname`, `useRouter`, and the Classicy dispatch.

**What:** Single source of truth: URL drives focus. No more `pushState`/`popstate`/manual sync. Browser back/forward "just work" because they're standard Next routing.

**Tests:** **TDD.** Write the test cases first, then implement until green.

**Verify:**
- `npm test` shows new unit tests passing.
- Hook is not yet wired into `BlogApp.tsx` (that's Step 11), so no e2e impact yet.

**Model & effort:** **Opus** / **high** — New navigation primitive. Design choices (state shape, dispatch order, router vs `pushState` semantics) set the contract for Step 11. TDD pins the API surface but not the design.

---

### Step 11 — Wire `useBlogNavigation` into `BlogApp`; delete old nav code

**Files to modify:**
- `app/components/BlogApp.tsx` — replace:
  - `openSlugs` state + `openSlugsRef` ref + sync effect (lines 342–347)
  - `focusedWindowId` selector + `pushState` effect (lines 337–370)
  - `popstate` listener effect (lines 372–397)
  - `initialSlug` mount effect (lines 399–404)
  - `mounted` flag in `ReaderWindow` (lines 169–173, 176)
  - `ReaderWindow`'s focus dispatch effect (lines 175–182)
  
  ...with the `useBlogNavigation()` hook from Step 10. `handleOpenPost` and `handleClosePost` become thin wrappers around `openPost`/`closePost`. `ListingsWindow` continues calling `onOpenPost`.
- `app/posts/[slug]/page.tsx` — `initialSlug` prop is no longer needed once the hook reads from `usePathname` (the route still calls `notFound()` for unknown slugs at the server boundary). Remove the prop from `ClassicyShell` if it's no longer consumed downstream.

**What:** Removes the entire two-system navigation race. ESLint violation (`react-hooks/set-state-in-effect`) goes with the `mounted` flag.

**Tests:** Tests-alongside. The hook's unit tests from Step 10 cover the logic; existing e2e covers integration.

**Verify:**
- `grep -n "pushState\|popstate\|openSlugsRef\|mounted" app/components/BlogApp.tsx` returns zero (or only unrelated occurrences).
- `npm run lint` passes with zero `react-hooks/set-state-in-effect` warnings.
- e2e `blog.spec.ts` and `smoke.spec.ts` pass.
- Manual: navigate `/` → click post → URL changes to `/posts/<slug>`; click back → URL returns to `/` and listings window is focused; reload on `/posts/<slug>` → that post window is focused.

**Model & effort:** **Sonnet** / **high** — Delete six overlapping effects/refs and wire the hook in their place. Design load is low but integration risk is high — this is where race conditions used to live. **Judgment call:** escalate to **Opus** / high if e2e surfaces timing flakes after deletion.

---

### Step 12 — Update e2e tests for URL contract + persistence

**Files to modify:**
- `tests/e2e/blog.spec.ts` — add explicit assertions for the URL contract:
  - Visiting `/` focuses the listings window.
  - Visiting `/posts/<slug>` focuses that post's window.
  - Clicking back in the browser returns focus to the listings window AND updates URL to `/`.
  - Reloading `/posts/<slug>` after dragging another window keeps the dragged window's position (persistence) AND focuses the URL's slug (contract).
- Remove or update any assertions that relied on the old `pushState`-based timing.

**What:** Lock in the contract decided up-front so future regressions are caught.

**Tests:** Tests-alongside.

**Verify:**
- `npm run test:e2e` all green.
- Run on CI (push branch, observe GitHub Actions).

**Model & effort:** **Sonnet** / **medium** — Test authoring against a pinned contract. Running the tests is the oracle.

---

## Post-step actions

- After Step 1 commit lands, open the PR (`gh pr create`). Title: `Phase 1.5: tech debt cleanup`. Body lists all 12 steps with checkboxes; update after each step lands.
- After all 12 steps merge, run the post-merge cleanup from global CLAUDE.md (`git checkout main && git pull && git branch -d feature/phase-1-cleanup`).

## Verification at the end (full smoke)

1. `npm run content:build && npx tsc --noEmit && npm run lint && npm test && npm run build && npm run test:e2e` — all green locally.
2. CI green on the PR.
3. Manual in dev server (`npm run dev`):
   - `/` shows desktop with Hard Drive top-right (label "Hard Drive"), Trash bottom-right, clock without seconds, listings window focused.
   - Click a post → URL changes to `/posts/<slug>`, that post window opens and focuses, listings stays open behind it.
   - Browser back button → URL returns to `/`, listings refocuses.
   - Drag the listings window 100px → reload → window is at the dragged position (persistence works).
   - Reload `/posts/<slug>` directly → that post window is focused.
   - `/posts` shows listings focused (same as `/`).
4. Deploy preview on Vercel reflects all of the above.
