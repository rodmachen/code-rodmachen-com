# Pre-plan: Classicy + Next.js rewrite of code.rodmachen.com

This document is a briefing for a future planning session. It captures the
goals of the site, the chosen technical direction, open questions, and risks
I've identified so the next session can walk in with context instead of
re-deriving it.

**Status:** No code written yet. The current repo (Astro-based) will be
abandoned. The rewrite will live in a new GitHub repo.

---

## 1. Context: how we got here

The current `code-rodmachen-com` repo is an Astro static site with a
hand-rolled Mac OS 8.1 theme built on `npjg/classic.css`. Over the last few
days of work, the user tightened the visual fidelity (pinstripe title bars,
Apple-logo SVG, desktop icons, functional menu dropdowns, modal sub-windows,
a Playwright e2e suite). That work is on PR #3 of the old repo.

While iterating on desktop icons, the user discovered Classicy
(https://github.com/robbiebyrd/classicy, https://classicy.ing/) — a React
framework that ships a much more complete Mac OS 8 Platinum interface,
including a full Webtop with theme manager, file system, sound events, and
a deep catalog of form controls.

We evaluated three integration paths:

1. **Use Classicy's CSS only, keep Astro.** Rejected. Classicy's SCSS
   references ~30 CSS custom properties that are never defined in any
   stylesheet — the Appearance Manager React component sets them at runtime
   from `themes.json`. Pulling "just the CSS" would require re-implementing
   that bootstrap as static CSS *and* rewriting all markup to match
   Classicy's class names and DOM nesting. That's effectively the cost of
   a full migration without any of Classicy's framework benefits.
2. **Astro + Classicy as a React island.** Rejected. Astro's strength is
   server-rendered HTML; Classicy wants to own the DOM from the React root
   down. Running Classicy in `client:only` mode loses Astro's HTML-first
   advantages while still paying the framework-bridge cost.
3. **Next.js + Classicy as a full React app.** **Accepted as the direction.**
   Classicy's `package.json` lists `nextjs` in its keywords, the project is
   already deployed on Vercel (Next.js is Vercel's own product), and React
   18/19 matches Classicy's peer deps.

The user has decided to start over in a fresh repo rather than migrate the
existing one in place. Nothing in the old repo is load-bearing.

---

## 2. What this blog is (goals and identity)

### What I know from the existing repo

- **URL:** code.rodmachen.com
- **Owner:** Rod Machen
- **Purpose:** A hub for tech and code-related writing. Part of a personal
  site network alongside `rodmachen.com`, `edition.rodmachen.com`, and
  `photo.rodmachen.com`.
- **Tagline from the current `<meta>`:** "Tech and code writing by Rod Machen"
- **Current content:** Two posts. `sample-post` ("Building the Next
  Generation of code.rodmachen.com") and `code-template`. Both short.
- **Aesthetic identity:** Mac OS 8.1 (1997–1998 Platinum). This is not
  incidental decoration — the user has spent real time on visual details
  (pinstripe title bars, era-accurate icons, Chicago font, dotted focus
  rings, dithered opened-disk states). The retro aesthetic *is* the site's
  voice. Any plan that treats it as a skin to be swapped out later would
  miss the point.
- **Hosting:** Vercel, free tier.

### What I'm inferring, worth confirming with the user

- This is a **personal / hobby project**, not a commercial site. There's no
  revenue, no SLA, no team. Decisions can favor "what the owner enjoys
  building" over "what's most pragmatic."
- The **writing cadence is low** (two posts so far over weeks/months), so
  performance regressions from a heavy JS runtime are less painful than
  they would be on a high-traffic blog — but the owner still cares about
  craft.
- The **audience is fellow developers and tech-curious readers**, plus
  friends and family. Not SEO-dependent. Not ad-supported.
- Code samples and technical writing will be the main content type —
  syntax highlighting, maybe embedded demos, block quotes, images.

### What I don't know and the planner should ask

- **Writing cadence and post length.** Short essays, long deep-dives, both?
  This affects whether post windows should be resizable, what the default
  window size should be, and whether a table of contents widget is needed.
- **Syndication requirements.** Does the user want an RSS feed? If yes,
  it needs to be built as a static file independent of the Classicy UI so
  readers can consume posts outside the webtop.
- **Analytics.** Is anything currently tracked? Vercel Analytics? Plausible?
  None? Classicy bundles `@analytics/google-tag-manager` and `analytics`
  as dependencies — worth knowing if those are wanted or dead weight.
- **Comments.** Presumably none, but confirm.
- **Search.** Probably not needed at two posts, but worth asking about the
  long term. Classicy has a Finder — a searchable archive window is on-theme
  and fun if it's wanted.
- **Categories, tags, series.** None visible in current content. Plan for
  a flat post list unless the user says otherwise.
- **Other content types.** Are photo posts, link posts, or code-snippet
  posts in scope, or is this strictly long-form writing?
- **The rest of the network.** `edition.rodmachen.com` and
  `photo.rodmachen.com` exist. Are they also getting themed rewrites? Is
  there a shared design language across the network, or does
  `code.rodmachen.com` stand alone? This affects whether Classicy's theme
  system should be used in a way that could be reused elsewhere.
- **Long-term vision.** Is this "a blog that looks like Mac OS 8" forever,
  or is the ambition eventually "a personal webtop with multiple apps"
  (notes, photos, links, music player, etc.)? The answer drives whether to
  lean into Classicy's multi-app architecture from day one or keep it
  simple and evolve.

---

## 3. The big design decision the plan must make

In the previous session I sketched three models for how URLs should map to
Classicy windows. **This is the single most important decision and the plan
cannot proceed without it.** Whoever leads the planning session should
drive the user to pick one before writing step-by-step tasks.

**Model A — Single blog window.** The whole site is one Classicy app. The
app's window has a sidebar post list and a reading pane. Clicking a post
swaps content in place; the URL changes to `/posts/[slug]` but no new
window opens. Menu bar and desktop icons are decorative (Apple menu →
About this site, Trash, etc.) or launch modals. Closest to the current
UX, fastest to build, lowest risk. My recommended first pass.

**Model B — Multi-window desktop.** Each post opens in its own Classicy
window. An Archive icon on the desktop opens a Finder-like window listing
all posts. About and Contact are separate windowed apps launched from
desktop icons or the Apple menu. Clicking a post in the Archive spawns a
new window. This is the full "running Mac OS 8 in your browser" fantasy
and the reason Classicy exists — but it requires solving URL ↔ open-window
state sync under static export, which is non-trivial. Deep links from
search engines need to open the right combination of windows on load.

**Model C — Boot-to-blog.** First-time visitors see a boot animation,
then the desktop. They click a Blog icon to open the blog window. Direct
links skip the boot and land inside an open post window. A nice first-visit
experience but doubles the state-modeling work.

**My recommendation:** Start with **Model A**, ship it, then decide whether
to evolve toward B. Starting with B risks bogging down in routing edge
cases before you've proven Classicy's bundle size and theming work in
production. The evolution from A to B later is cheaper than a second
rewrite.

---

## 4. Technical stack (proposed, for the planner to confirm)

- **Framework:** Next.js (App Router), `output: 'export'` for static build.
- **UI library:** `classicy` (pin to a specific version, currently 0.6.54).
- **React:** 18 or 19, matching Classicy's peer deps.
- **Content pipeline:** Velite. Reasoning: it's the current best option for
  typed Markdown content in Next.js App Router, validates frontmatter with
  Zod, and generates a type-safe content index. Alternatives worth noting:
  `@next/mdx` (lighter, less structure) and `contentlayer` (older,
  maintenance has been patchy).
- **Deployment:** Vercel, same as today. Static export means zero adapter
  config.
- **Language:** TypeScript throughout.
- **Testing:** Playwright for e2e (same tool the current repo uses — the
  test *intent* carries over even though every selector changes). Vitest
  for any unit tests of content transforms.
- **CI:** GitHub Actions, matching the pattern in the current repo's
  `.github/workflows/ci.yml` (type check, build, e2e). Will need to fix
  the missing `@astrojs/check` problem that bit the old repo by adding
  actual dev dependencies for type checking and locking down visual
  regression snapshots to a consistent platform.

---

## 5. Concerns and risks the plan needs to address

These are the things I'd want named explicitly in the plan with mitigation
strategies, not swept past.

### 5.1 Classicy is pre-1.0

Current version 0.6.54. The maintainer labels several features as
"experimental" or "partially complete." Breaking changes between minor
versions are plausible. For a hobby site this is acceptable, but:

- **Mitigation:** Pin the exact version in `package.json`. Do not let
  Dependabot auto-bump. Plan to review and test upgrades manually.
- **Fallback plan:** If Classicy stalls or breaks, what's the exit? Worth
  at least naming. One option: fork it. Another: drop back to the
  hand-rolled CSS approach (we'd still have the old repo as reference).

### 5.2 Bundle size

Classicy's production dependencies include zustand, immer, `@mdxeditor/editor`,
`react-player`, `howler`, `react-json-tree`, `@tanstack/react-table`,
`analytics`, `@analytics/google-tag-manager`, `@plussub/srt-vtt-parser`,
`classnames`, `he`, `sha512-crypt-ts`, `screenfull`, `use-analytics`. That's
a lot of JavaScript before any content renders. Rough expectation: **500KB+
gzipped JS on first paint**, vs. the current site's near-zero JS.

- **The plan must have a bundle-size step.** Not "we'll see," but an actual
  measurement early in the build with a budget. If the initial page weight
  is, say, over 1MB JS, that's a red flag worth stopping on.
- **Mitigation options:** lazy-load Classicy features the blog doesn't use
  (MDXEditor, ReactPlayer, sound manager can probably be tree-shaken or
  dynamic-imported), use Next.js's built-in code splitting, measure with
  `@next/bundle-analyzer`.
- **Risk:** Some of Classicy's deps may be deeply entangled with the
  Appearance Manager or Desktop providers such that you can't exclude them
  without patching. Worth investigating in an early spike step.

### 5.3 SEO, reader mode, RSS

The current site serves server-rendered HTML on first paint. A Next.js
static-export site with Classicy will pre-render the HTML tree, but the
visible content is gated on React hydration and the Appearance Manager's
theme bootstrap running. Content is still in the HTML for crawlers, so
SEO isn't a disaster, but:

- **Reader modes** (Safari Reader, Firefox Reader View) may or may not
  work depending on how the post content is nested inside Classicy's
  window components. Worth testing early.
- **RSS must be built independently** of the Classicy UI. A static
  `/rss.xml` generated from the same Velite content index, not reading from
  the rendered page. Standard Next.js pattern.
- **First-paint perception** will feel slower than today. For a blog that
  is specifically about looking like Mac OS 8, a brief "boot" or loading
  moment is arguably on-theme — but it should be deliberate, not an
  unstyled flash of content.

### 5.4 Accessibility

The current site has careful a11y work: focus traps in modals, dotted focus
rings, ARIA roles on menu bar and menus, Escape handling, keyboard Enter to
open menus, screen-reader-friendly labels. **Classicy's a11y story is not
documented in its README or on its marketing site.** This is an open
question.

- **The plan needs an a11y audit step** against the built site, ideally
  early enough that if Classicy has serious gaps the user can decide
  whether to patch upstream, work around, or reconsider.
- **Keyboard navigation** in particular — can you tab through menu bar
  items? Open menus with Enter? Close with Escape? These were carefully
  built in the old repo; they should work in the new one before shipping.

### 5.5 The webtop-vs-blog tension

Classicy is designed for "running a Mac OS 8 desktop in your browser as an
app host." A blog is not an app; it's a reading experience. Every design
decision in the plan will hit this tension somewhere. Examples:

- Should the menu bar have a real File/Edit/View set, or fake ones that are
  purely decorative? The old repo did the latter; it worked but felt thin.
- Should there be sound effects on clicks? Authentic, but probably annoying
  for a reading site. Classicy ships sound themes; the plan should decide
  whether to enable them (maybe with a visible mute toggle).
- Should the desktop have a working Trash that accepts dragged items?
  Authentic-looking but meaningless on a blog.
- Should posts live in an actual Classicy file system (persistent via its
  browser storage), or are they static routes rendered in an app window?

**The planner should push the user to commit to one framing: "this is a
blog that uses Classicy as its chrome" or "this is a webtop that happens to
include a blog app."** Model A in section 3 implies the former; Model B
implies the latter. A hybrid will be more work and less coherent.

### 5.6 Content authoring ergonomics

In the old repo, writing a post was "add a Markdown file to
`src/content/posts/`." The new repo should preserve that — the user
shouldn't have to touch any React components to publish. The plan needs to
verify that Velite (or whichever pipeline is chosen) gives the same
"drop a file in, it appears" experience.

### 5.7 Testing

The current Playwright suite is ~50 tests asserting on class names and DOM
structure that will not exist in the new repo. **The tests themselves must
be rewritten from scratch**, but the *test intents* carry over:

- Smoke: home page renders, post pages render, no console errors.
- Window chrome: title bar renders, window controls are present and
  clickable, close/zoom/shade work.
- Menu bar: menus open, items trigger the right actions, Escape closes.
- Modals / dialogs: open, close, focus trap, Escape.
- A11y: keyboard navigation, focus rings, ARIA roles.
- Visual regression: optional, and only if the platform-baseline problem
  from the old repo is solved (run snapshots in CI on a pinned platform,
  or skip this category).

The plan should include test-writing as an explicit step per feature, not
as an afterthought at the end.

### 5.8 Deployment and DNS

Current site is live at `code.rodmachen.com`. The safest path is:

- Build the new repo as a separate Vercel project.
- Deploy to a staging subdomain (e.g. `classicy.rodmachen.com` or a
  Vercel preview URL) until the user is satisfied.
- Flip the DNS only at the end, once the new site is verified.

The plan should call this out explicitly so nobody accidentally redeploys
over the production domain mid-build.

---

## 6. What to bring from the old repo

- **Markdown content.** The two existing posts (`sample-post` and
  `code-template`). Frontmatter will need to be adapted to the new
  Velite schema.
- **Plan files.** `docs/plans/` from the old repo, including this pre-plan,
  for continuity.
- **Possibly some icon SVGs.** The disk, trash, and disk-open SVGs from
  the most recent iteration are arguably nicer than whatever Classicy
  ships, and can be used as custom `ClassicyDesktopIcon` assets if the
  user wants. Worth offering as an option, not a requirement.
- **The site's tagline, meta description, and favicon** — small but easy
  to forget.

## 7. What to leave behind

- All Astro components (`BaseLayout`, `MenuBar`, `DesktopIcons`, `SubWindow`,
  all modals).
- `src/styles/classic.css` and the entire `npjg/classic.css` dependency.
- `src/scripts/classic-ui.ts`.
- The current Playwright test suite (the intents carry over; the
  implementation doesn't).
- The old `.github/workflows/ci.yml` (it has a bug around `@astrojs/check`
  that the new repo should not inherit).
- Visual regression snapshot baselines (they're Astro-specific and
  platform-specific).
- PR #3 on the old repo — the plan should decide whether to close it with
  a comment or leave it open for historical reference. My recommendation:
  close with a comment pointing at the new repo.

---

## 8. Rough effort estimate (from earlier analysis, not a plan)

This is a sketch to calibrate expectations, **not** a step-by-step plan.
The planner should turn this into verification-gated steps with assigned
models and file lists per the global workflow rules.

- **Bootstrap Next.js project:** ~1 hour
- **MDX/content pipeline (Velite):** 2–3 hours
- **Migrate existing posts:** 30 minutes
- **Classicy root layout and provider setup:** 2–3 hours
- **Design the app shell (Model A):** 4–8 hours
- **Wire post content into a Classicy app window:** 3–4 hours
- **Bundle-size audit and lazy-loading pass:** 2–4 hours
- **A11y audit and fixes:** 2–4 hours
- **Rewrite Playwright tests:** 2–4 hours
- **RSS feed generation:** 1–2 hours
- **CI workflow (lint, type check, build, e2e):** 1–2 hours
- **Staging deployment and smoke:** 1 hour
- **DNS cutover and cleanup:** 1 hour

**Total: roughly 3–5 solid days of focused work.** This assumes Model A.
Model B adds 1–2 days for routing and state synchronization.

---

## 9. Questions the planning session should answer before writing steps

In rough priority order:

1. **Model A, B, or C?** (See section 3.) The whole plan hangs on this.
2. **Repo name and visibility?** Same name, or something different to
   signal the rewrite? Public or private GitHub repo?
3. **Staging domain?** Build behind a preview URL or a staging subdomain
   until the new site is ready? (Strong recommendation: yes.)
4. **Velite, `@next/mdx`, or something else for content?** Default
   recommendation: Velite.
5. **Which Classicy theme?** Default Platinum, or one of the other 25 in
   `themes.json`? Is multi-theme switching in scope for v1, or defer?
6. **Sound on or off?** Classicy ships sound themes. Appropriate for a
   blog? User-toggleable?
7. **What belongs in the menu bar?** Decorative only, or functional
   (File → New Post window, Edit disabled, View → toggle theme, etc.)?
8. **What desktop icons does v1 need?** At minimum: Archive (blog),
   About, Contact, Trash. Anything else?
9. **RSS feed required?** Almost certainly yes. Just flagging.
10. **What's the long-term ambition?** "Blog forever" or "grow into a
    multi-app webtop"? The answer affects whether the plan should
    over-engineer the app architecture for future apps or stay minimal.
11. **Writing cadence and typical post length?** Affects window default
    sizes, sidebar layout, whether TOC is needed.
12. **What to do with PR #3 on the old repo?** Close with a comment
    pointing at the new repo, or leave open?

---

## 10. Suggested reading for the next session

- **Classicy repo:** https://github.com/robbiebyrd/classicy
- **Classicy marketing site:** https://classicy.ing/
- **Classicy live demo:** https://robbiebyrd.github.io/classicy/
- **Classicy example app source:** the `example/` directory in the repo
  is the best reference for "how do you actually wire up a real app
  inside Classicy."
- **Classicy `themes.json`:**
  `src/SystemFolder/ControlPanels/AppearanceManager/styles/themes.json`
  — useful for understanding the theme variable system and picking a
  starting theme.
- **Velite docs:** https://velite.js.org/
- **Next.js App Router static export docs:**
  https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **Old repo PR #3:** the work there (pinstripe title bars, menu dropdowns,
  modal patterns, focus trap, Playwright test suite) is worth skimming
  for the *intent* behind each feature, even though none of the code
  transfers.

---

## 11. One thing I'd double-check before committing

Before writing any code in the new repo, **spend 30 minutes with the
Classicy live demo**. Click around, resize windows, open menus, try
keyboard navigation. Get a feel for how it actually behaves, not just how
it looks in screenshots. The goal is to confirm that the framework's
ergonomics match the user's expectations for a reading site. If something
feels off in the demo — sluggish, clunky menus, bad keyboard handling —
better to discover it now than three days into a rewrite.
