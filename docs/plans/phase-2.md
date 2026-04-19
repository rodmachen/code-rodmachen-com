# Phase 2 — Full blog buildout

## Context

Phase 1 landed the Classicy Mac OS 8 desktop UI, the Velite content pipeline, two sample posts, Chicago-font heading styling, and the Listings/Reader windows. What's left is the production polish that makes this a real blog: dynamic routes for topics, a discoverable feed set (RSS/sitemap/robots), Cloudinary-backed responsive images, SEO metadata, cross-site navigation back to the sibling `rodmachen.com` / `edition` / `photo` subdomains, Google Analytics, and a static Vercel deployment at `code.rodmachen.com`.

Notes on how this deviates from the original brief:
- Stack is **Next.js 16 + Velite + Classicy**, not Astro. The brief's references to `astro-cloudinary`, `@astrojs/rss`, `src/content.config.ts`, etc. are adapted to their Next/Velite equivalents below, but the *patterns* are ported from `edition-rodmachen-com` as directed.
- There is no traditional header/footer in the desktop UI, so cross-site links land as entries under the Apple (🍎) system menu rather than a footer.
- Topics get both a dedicated Classicy window **and** static `/topics/` + `/topics/[tag]/` routes so URLs are deep-linkable and crawlable — confirmed with user.
- Static export is fine because all interactivity (windows, menus) is client-side Classicy React — confirmed with user.

## Verification strategy (applies to every step)

- `npm run build` succeeds (Velite + Next.js static export) with zero warnings introduced by the step.
- `npm run lint` passes.
- `npm run test` (Vitest) passes.
- `npm run test:e2e` (Playwright) passes where a step touches runtime behavior.
- CI (GitHub Actions) on the PR stays green.

Per-step verification sub-steps below describe what's *specific* to that step on top of the baseline above.

---

## Step 0 — Branch + PR setup

Pre-flight only; no code changes yet.

- Create `feature/phase-2` branch off `main`.
- Push branch and open draft PR titled "Phase 2 — Full blog buildout" with this plan as the PR description (steps as checklist).
- Confirm CI runs on the empty branch.

**Files:** none.
**Model:** Sonnet / **Effort:** low. **Context-clear:** no.
**Justification:** Pure workflow scaffolding, zero ambiguity, automatically verifiable via `gh pr view`.
**Verify:** `gh pr view` shows the PR open, first CI run green.

---

## Step 1 — Static export + `published` filter ✅

Switch Next.js to static export and add a `published` field so unpublished drafts can live in the content folder without shipping.

- `next.config.mjs`: add `output: 'export'`, `trailingSlash: true`, and `images: { unoptimized: true }` (Cloudinary serves its own optimized URLs; Next's image optimizer is incompatible with `output: 'export'` anyway).
- `velite.config.ts`: add `published: s.boolean().default(true)` to the posts schema.
- `app/lib/posts.ts`: add a `publishedPosts` helper that filters `published !== false` and is used everywhere we currently iterate `posts` (homepage, listings, post static params). **Dev-mode behavior:** when `process.env.NODE_ENV === 'development'` the helper returns everything (drafts included) so `npm run dev` shows draft posts locally. An escape hatch env var `SHOW_DRAFTS=false` forces production behavior in dev if you ever want to preview the shipped state. Production builds always filter — drafts never land on `code.rodmachen.com`.
- Mark **both** existing sample posts (`content/posts/hello-classicy.md` and `content/posts/typography-test.md`) with `published: false`. Keep them in the repo as draft content / regression fixtures until real posts arrive; they continue to render locally via the dev-mode behavior above.

**TDD.** Write Vitest unit tests for `publishedPosts` first (empty list, all published, mixed, plus the dev/prod env-var matrix), then implement.

**Files:**
- `next.config.mjs`
- `velite.config.ts`
- `app/lib/posts.ts`
- `app/lib/posts.test.ts` (new)
- `content/posts/hello-classicy.md` (frontmatter only)
- `content/posts/typography-test.md` (frontmatter only)

**Model:** Sonnet / **Effort:** medium. **Context-clear:** no.
**Justification:** Config + small transform. Moderate because `output: 'export'` interacts with all dynamic routes added in later steps — if Step 1 silently breaks `generateStaticParams`, later steps compound the failure. Automatically verifiable via build output.
**Verify:**
- `npm run build` produces an `out/` directory containing `index.html` but **no** `out/posts/*/` subdirectories (both samples are unpublished).
- `npm run dev` → homepage lists both sample posts; `/posts/hello-classicy/` renders.
- `SHOW_DRAFTS=false npm run dev` → homepage is empty (escape hatch works).
- Vitest tests green.

---

## Step 2 — Cloudinary responsive images via remark plugin ✅

Port the remark plugin from `edition-rodmachen-com` so markdown images resolve to responsive `<figure>` with srcset. Add `thumbnail` to the schema for homepage/listing cards.

- Create `app/plugins/remark-cloudinary-images.ts` by copying `/Users/rodmachen/code/edition-rodmachen-com/src/plugins/remark-cloudinary-images.ts` verbatim. The plugin is framework-agnostic — it operates on an mdast tree.
- `velite.config.ts`: wire it into `markdown.remarkPlugins`. Velite runs remark before its rehype stage, so `rehype-shiki` still sees code fences unchanged.
- Extend schema: `thumbnail: s.string().optional()` (Cloudinary public ID, no URL prefix — matches brief).
- Add a third sample post `content/posts/images-test.md` (draft, `published: false`) that exercises a Cloudinary URL with each of `size:small`, `size:medium`, `size:large`, `size:full` directives so we can eyeball rendering locally. Keep it unpublished so it does not ship.
- `app/components/post-body.module.css`: add minimal styling for `.img-small`, `.img-medium`, `.img-large`, `.img-full`, and `figcaption` (match edition's visual approach — centered figures, subdued caption).

**TDD.** The plugin has unit-testable pure behavior. Write Vitest tests that run the plugin on a synthetic mdast tree and assert the output HTML string for each size preset + the non-Cloudinary passthrough case.

**Files:**
- `app/plugins/remark-cloudinary-images.ts` (new)
- `app/plugins/remark-cloudinary-images.test.ts` (new)
- `velite.config.ts`
- `app/components/post-body.module.css`
- `content/posts/images-test.md` (new, unpublished)

**Model:** Sonnet / **Effort:** high. **Context-clear:** yes.
**Justification:** Porting a regex/tree-transform plugin into a different build pipeline (Velite vs Astro). Mistakes here compound: a broken plugin silently corrupts every post with an image. TDD is the forcing function. Context-clear=yes because Step 1 context (config + filter) is noise for writing a transformer.
**Verify:**
- Vitest tests cover all four size presets + the non-Cloudinary bypass.
- `npm run build` succeeds; the generated HTML for `images-test.md` contains `<figure class="img-medium">` and a `srcset="... 1x, ... 2x"` attribute with `w_600` / `w_1200` Cloudinary transforms.

---

## Step 3 — Topics: window + static routes ✅

Topics surface in two places: a Classicy "Topics" app window (menu-accessible), and crawlable routes `/topics/` and `/topics/[tag]/`.

- `app/lib/posts.ts`: add `getAllTags()` (returns `{ tag: string; count: number }[]`, sorted by count desc then alpha) and `getPostsByTag(tag: string)`.
- `app/topics/page.tsx`: static tag cloud. Renders a simple list (`<a href="/topics/foo/">foo (3)</a>`). Reuses root layout.
- `app/topics/[tag]/page.tsx`: static per-tag listing; `generateStaticParams` from `getAllTags()`. Reuses the same sortable-table pattern as BlogApp's listings window but rendered as a plain page (no Classicy wrapper — these routes are for SEO/deep-linking; they do not need to be fully usable inside the desktop metaphor).
- `app/components/TopicsWindow.tsx`: new Classicy app window showing the tag cloud. Clicking a tag navigates via the existing `blog-navigation` hook pattern so the URL stays in sync.
- `app/components/ClassicyDesktopInner.tsx`: register `<TopicsWindow />` alongside the other apps. Add "Topics" to the Apple menu entries (same `systemMenu` array you'll extend further in Step 6).
- `app/lib/menus.ts` / `buildBlogMenu`: add File → "Open Topics" entry.

**Tests-alongside.** Unit-test `getAllTags` and `getPostsByTag` pure functions; E2E-test `/topics/` and `/topics/classicy/` render (Playwright).

**Files:**
- `app/lib/posts.ts`, `app/lib/posts.test.ts`
- `app/topics/page.tsx` (new)
- `app/topics/[tag]/page.tsx` (new)
- `app/components/TopicsWindow.tsx` (new)
- `app/components/ClassicyDesktopInner.tsx`
- `app/lib/menus.ts`
- `e2e/topics.spec.ts` (new)

**Model:** Opus / **Effort:** high. **Context-clear:** yes.
**Justification:** Highest design-judgment step — weaves a new UI surface into the existing Classicy app/window/menu registry and keeps URL ↔ window-state in sync with `blog-navigation`. Hard to verify automatically beyond "routes exist and e2e passes"; easy to get subtly wrong. Context-clear to drop Step 2's plugin-testing context.
**Verify:**
- `/topics/` lists every tag with counts.
- `/topics/classicy/` lists `hello-classicy` only.
- In the desktop, File → Open Topics opens the Topics window; URL updates; reload restores the window.
- Playwright spec green.

---

## Step 4 — Feeds & discoverability (RSS + sitemap + robots) ✅

- `app/rss.xml/route.ts`: Next 16 static route handler (`export const dynamic = 'force-static'`) that returns an RSS 2.0 XML string built from `publishedPosts()`. Port the item shape from `edition-rodmachen-com/src/pages/rss.xml.ts`: title, link (`https://code.rodmachen.com/posts/${slug}/`), pubDate, description (use `subTitle` if present else empty). Channel title "code – Rod Machen".
- `app/sitemap.ts`: Next 16 built-in sitemap generator. Emit `/`, `/topics/`, each `/topics/[tag]/`, and each `/posts/[slug]/`.
- `app/robots.ts`: Next 16 built-in. Allow all, reference sitemap URL.

**Tests-alongside.** Vitest test builds the RSS string from a fixture list of posts and asserts shape + escaping of titles with `&`. Playwright test hits `/rss.xml` and asserts `content-type` / root `<rss>` element.

**Files:**
- `app/rss.xml/route.ts` (new)
- `app/rss.xml/route.test.ts` (new)
- `app/sitemap.ts` (new)
- `app/robots.ts` (new)
- `e2e/feeds.spec.ts` (new)

**Model:** Sonnet / **Effort:** medium. **Context-clear:** no.
**Justification:** Straightforward wiring with known Next 16 idioms, but per-post URL construction needs to match Step 1's trailing-slash choice. Escaping bugs in RSS are easy to miss without tests.
**Verify:**
- `out/rss.xml`, `out/sitemap.xml`, `out/robots.txt` all exist after `npm run build`.
- Feed validates at https://validator.w3.org/feed/ (manual). Empty-channel case is acceptable until real posts ship — assert the RSS envelope is well-formed even with zero items.
- Sitemap includes `/`, `/topics/`, and each `/topics/[tag]/` that has a published post. It does **not** include `/posts/hello-classicy/`, `/posts/typography-test/`, or `/posts/images-test/` (all unpublished). With real content added later, those post URLs appear automatically.

---

## Step 5 — SEO metadata (OG / Twitter / canonical) ✅

- `app/layout.tsx`: add a default `Metadata` export with site-wide `title` template, `description`, `openGraph.siteName`, `twitter.card: 'summary_large_image'`, `metadataBase: new URL('https://code.rodmachen.com')`.
- `app/posts/[slug]/page.tsx`: add `generateMetadata({ params })` that pulls the post and sets title, description (from `subTitle` or first ~160 chars of body), canonical, and an OG image built from the post's `thumbnail` public ID via the standard Cloudinary social-card transform (`c_fill,w_1200,h_630,f_auto,q_auto`).
- `app/topics/page.tsx` and `app/topics/[tag]/page.tsx`: add simple `generateMetadata` for title/description/canonical.

**Tests-alongside.** Playwright test asserts `<meta property="og:title">` and `<link rel="canonical">` on `/posts/hello-classicy/` and `/topics/classicy/`.

**Files:**
- `app/layout.tsx`
- `app/posts/[slug]/page.tsx`
- `app/topics/page.tsx`, `app/topics/[tag]/page.tsx`
- `e2e/seo.spec.ts` (new)

**Model:** Sonnet / **Effort:** medium. **Context-clear:** no.
**Justification:** Lots of repetitive per-page metadata but the pattern is well-known. Main risk is inconsistency (one page missing canonical) — caught by e2e spec.
**Verify:** e2e spec green; manually test the `/posts/hello-classicy/` URL in https://opengraph.dev after deploy.

---

## Step 6 — Apple menu cross-site navigation ✅

Append sibling-site entries to the Classicy system menu so the desktop has a native equivalent of the cross-site footer in the brief.

- `app/components/ClassicyDesktopInner.tsx`: extend the `systemMenu` array (currently `[{ id: 'about-this-site', ... }]`) with a separator and three external-link entries using the pipe-delimited `Label | Role` naming convention:
  - `"rodmachen.com | Home"` → `https://rodmachen.com`
  - `"Edition | Writing"` → `https://edition.rodmachen.com`
  - `"Photo | Portfolio"` → `https://photo.rodmachen.com`

  Use `window.open(url, '_blank', 'noopener,noreferrer')` in each `onClickFunc`.
- If Classicy's `systemMenu` schema does not support separators, fall back to grouping via label prefix or skip the separator entirely — verify against the Classicy types before coding.

**Tests-alongside.** Playwright test: click the Apple menu, assert the three entries are present; verify `target="_blank"`/external open behavior by intercepting the `window.open` call.

**Files:**
- `app/components/ClassicyDesktopInner.tsx`
- `e2e/cross-site-menu.spec.ts` (new)

**Model:** Sonnet / **Effort:** medium. **Context-clear:** no.
**Justification:** Small change but `systemMenu` state lives deep in Classicy's zustand store and has no public dispatch (per the existing `// Classicy gap` comment at `ClassicyDesktopInner.tsx:87`). Need to read Classicy's types carefully to match the entry schema.
**Verify:** Three items appear under the Apple menu; each opens the correct URL in a new tab.

---

## Step 7 — Google Analytics + production deploy

Wrap up with analytics and the actual Vercel deployment.

- Install `@next/third-parties`. In `app/layout.tsx`, add `<GoogleAnalytics gaId="G-VX04LCY48Q" />` inside `<body>`, gated on `process.env.NODE_ENV === 'production'`. This is the shared Measurement ID for the `rodmachen.com` GA4 property (one property, four streams — one per sibling subdomain), so all sites use the same ID.
- `astro.config.mjs` equivalent: set `site` via `metadataBase` (already done in Step 5).
- Create the Vercel project `code-rodmachen-com`, point it at the `main` branch, set the framework preset to Next.js, confirm it picks up `output: 'export'`.
- Configure the `code.rodmachen.com` custom domain on the Vercel project (CNAME already in the brief: `cname.vercel-dns.com`).
- Smoke-test production URL for: homepage loads, `/posts/hello-classicy/` loads, `/topics/`, `/topics/classicy/`, `/rss.xml`, `/sitemap.xml`, `/robots.txt`, Apple-menu cross-site links, GA `gtag` network call fires.

**Tests-alongside.** Nothing new automated — the GA gate is too env-specific for unit tests; production smoke is manual.

**Files:**
- `package.json`, `package-lock.json`
- `app/layout.tsx`

**Model:** Sonnet / **Effort:** medium. **Context-clear:** yes.
**Justification:** Two unrelated tasks (GA snippet + DNS/Vercel) but both are well-trodden. Highest-risk piece is the GA gate accidentally firing in local dev (privacy bug) — easy to verify. Context-clear=yes because the deploy is the "close the loop" chapter; prior in-conversation detail about plugins/feeds is noise.
**Verify:** Production site accessible at `https://code.rodmachen.com/`. All smoke-test URLs return 200. GA Realtime dashboard shows a hit after a production page view. Local `npm run dev` does *not* fire a GA beacon.

---

## Post-merge

- `git checkout main && git pull && git branch -d feature/phase-2`.
- Move this plan file from `docs/plans/` to `docs/plans/archive/` per the global workflow.
