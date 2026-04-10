# Plan: Classic Mac OS Refinement (Phase 1.5)

## Context

The site currently has a rough classic Mac OS look (Chicago font, menu bar, beveled window, desktop icons, zoom/shade/close controls) but several details do not match the reference screenshots (Mac OS 7.x–8.x era). This plan tightens the visual fidelity and adds a small amount of interactivity — functional menu dropdowns and About/Contact as modal sub-windows — while staying a styling-only phase. Phase 2 (content collection, RSS, Cloudinary, dynamic routes) remains untouched by this plan.

The goal is to make the chrome look and feel authentic before we layer on real blog functionality.

## Reference Screenshots

Provided by the user:
- "About This Computer" (Mac OS 8.1) — shows title bar with pinstripe racing lines flanking the title, and the exact look of the close/zoom/collapse buttons
- "Mac OS Info Center" — menu bar layout, desktop icons on right (MacOS 8.1 disk, Mac OS Info Center, Browse the Internet, Mail, Trash)
- Multi-window screenshot — shows stacked/overlapping windows with active vs. inactive title bars (active = pinstriped, inactive = plain)
- Apple Computer browser — another overlapping window example

## Scope

**In scope**
1. Title bar pinstripe racing lines flanking the title text
2. Title bar height proportional to the menu bar, with the correct border sitting flush under the menu bar
3. Window sized full height (below menu bar), centered horizontally, max-width preserved
4. Close / zoom / collapse buttons refined to match screenshot pixel details
5. Desktop file icons redrawn to match MacOS 8.1 style (disk, info, globe, mail, trash, or a themed subset)
6. Functional menu dropdowns (click to open, click-outside or Escape to close)
7. Apple menu → "About this site" → modal with tech stack info
8. Edit menu → disabled "Edit Posts" item (grayed out, not clickable)
9. View menu → "Full Width" / "Normal" items that toggle the zoom state
10. Help menu → "Help me…" item that opens `https://www.google.com` in a new tab
11. Remove the Special menu
12. About and Contact become smaller sub-windows that open on top of the main window, closable via their own top-left close box (draggable is a stretch; static centered is fine)
13. Testing framework setup (Playwright) + high-priority tests (and selected medium-priority tests)

**Additional authenticity suggestions (recommended)**
14. Active vs. inactive window state — pinstripe title bar only when the window is "active" (useful when a modal opens: the main window should dim to inactive state)
15. Drop shadow under windows (subtle offset dark shadow, flat — no blur in the strictest era, but a small blur reads better on modern displays)
16. Menu dropdown styling: white bg, black border, 1px drop shadow, Chicago font items, disabled items in stipple/gray, divider lines, optional ⌘-key hint on the right
17. Dotted focus ring on keyboard-focused controls (era-appropriate)
18. Proper solid-black Apple logo (SVG) to replace the Unicode `` character that only renders on macOS
19. Clock in menu bar uses the same Chicago font it already does — verify alignment baseline
20. Modal sub-windows use the same pinstripe title bar + close box; while a modal is open, the main window's title bar renders in the inactive (plain) state

**Out of scope (Phase 2)**
- Content collections, RSS, sitemap, topics pages
- Cloudinary integration
- Google Analytics
- Dark mode
- Draggable windows, resize handles, real multi-window management

## Files to Modify

| Area | File | Notes |
|---|---|---|
| Menu bar markup + dropdown logic | `src/components/MenuBar.astro` (new) | Extracted from `BaseLayout.astro` lines 33–71, 197–208 |
| Desktop icons | `src/components/DesktopIcons.astro` (new) | Extracted from `BaseLayout.astro` lines 73–114, 211–228 |
| Classic window title bar + controls | `src/styles/classic.css` | Lines 37–172 (window frame, buttons) |
| Window sizing, border under menu bar | `src/layouts/BaseLayout.astro` | Lines 117–194 |
| Modal sub-window component | `src/components/SubWindow.astro` (new) | New — reuses classic window styles |
| About modal content | `src/components/modals/AboutSiteModal.astro` (new) | Tech stack info |
| About page content | `src/components/modals/AboutModal.astro` (new) | User-provided copy |
| Contact page content | `src/components/modals/ContactModal.astro` (new) | User-provided copy |
| Apple logo SVG | `public/img/apple-logo.svg` (new) | Replaces Unicode `` |
| File icons SVG | `public/img/icons/*.svg` (new) | Disk, info, mail, trash, etc. |
| Global variables | `src/styles/global.css` | Add pinstripe color vars, modal z-index |
| Menu + modal JS | `src/scripts/classic-ui.ts` (new) | Centralized client JS (currently inline in BaseLayout.astro lines 254–282) |
| Playwright config | `playwright.config.ts` (new) | Test setup |
| E2E tests | `tests/e2e/*.spec.ts` (new) | See Testing section |
| CI | `.github/workflows/ci.yml` (new) | Runs lint + Playwright |

## Design Details

### Title bar pinstripe
Six thin black horizontal lines (approx 1px tall each, separated by 1px) extending left of the title text and right of the title text, stopping before the control buttons. In the reference screenshots this reads as a "racing stripe" treatment. Implement with a repeating linear-gradient background on the title bar flanking elements, not an image. The title text sits in the middle on a white background (the lines stop where the text begins and resume on the other side).

### Title bar height
Proportional to the 24px menu bar — target 20px title bar interior height (close to menu bar) with a 1px black top border and 1px black bottom border. Total ~22px. Buttons sit vertically centered.

### Window positioning
`margin-top: 24px` (flush under menu bar, 1px black border of window adjacent to menu bar border), `height: calc(100vh - 24px)`, `width: 95%; max-width: 1000px`, `margin-left: auto; margin-right: auto`. No `margin-bottom` — window reaches the bottom of the viewport. Inner pane scrolls.

### Control buttons
Match the screenshots: 11×11 px squares with double-line beveled borders. The close box is empty. The zoom box has a small inner square in the upper-left quadrant. The collapse box has a horizontal line through the middle. All three use the same outer frame. Keep the current beveled bg but tighten the inner glyphs to pixel-perfect.

### File icons
Five desktop icons down the right edge matching Mac OS 8.1 screenshots:
1. **MacOS 8.1** — hard disk icon (labeled "code.rodmachen.com")
2. **Info Center** — blue "i" sphere (links to About modal)
3. **Browse the Internet** — globe (links to rodmachen.com in new tab)
4. **Mail** — envelope (links to Contact modal)
5. **Trash** — trash can (decorative, no link — or links to a fun 404)

Each icon ~32–48px tall, white outline text label beneath. SVGs stored in `public/img/icons/`.

### Menu dropdowns
Click-to-open behavior (not hover). Each menu is a `<button>` that toggles an adjacent `<ul>` positioned absolutely below it. The dropdown has:
- White bg
- 1px black border + 1px black drop shadow offset by (1, 1)
- Chicago font items with 4px horizontal padding, 2px vertical padding
- Disabled items in gray (`#888`) and not clickable
- Divider lines as 1px gray `<hr>`
- Hover state: black bg with white text (inverse)

Only one menu open at a time. Click-outside or Escape closes. Active menu title gets the inverse state (black bg, white text).

### Menu contents
- **Apple** (logo): "About this site" → opens About Site modal
- **File**: "Home" → `/` (only item for now, always present)
- **Edit**: "Edit Posts" (disabled/gray)
- **View**: "Full Width" (toggle check ✓ when `.maximized`), "Normal" (check when not)
- **Help**: "Help me…" → `window.open('https://www.google.com', '_blank')`
- **Special**: removed

### Modal sub-windows (About, Contact, About this site)
A `SubWindow` component wraps content in the same classic-window chrome but smaller (e.g. `width: 420px; max-height: 60vh`). Fixed-position centered on viewport. Full-screen translucent dim layer behind (optional — even a plain transparent click-catcher works). Opened via click on a trigger (desktop icon or menu item), closed via the top-left close box or Escape. While any modal is open, the main window's title bar renders the inactive (no-pinstripe) state. Stack: `z-index` above main window, below menu bar.

The About-site modal content is authored by Claude (tech stack blurb). The About and Contact modal content is user-provided — leave placeholder copy I can swap in.

### Inactive vs active window state
CSS class `.classic-window.inactive` removes the pinstripe backgrounds and the close/zoom/shade inner glyphs appear hollow (border only, no fill). Triggered when a modal is open.

## Implementation Steps

Each step ends with: **Verify** (what to run, what passing looks like), **Model**, **Files**, **Test type**.

### Step 1 — Testing framework + CI scaffolding (tests-alongside)

Install Playwright, add `playwright.config.ts`, add a single smoke test (`tests/e2e/smoke.spec.ts`) that loads `/` and asserts the title. Add `.github/workflows/ci.yml` that runs `astro check` and `playwright test` on push/PR. Add `test` and `test:e2e` scripts to `package.json`.

**Verify**: `npm run test:e2e` passes locally; push to feature branch and confirm GitHub Actions run succeeds.

**Model**: **Sonnet**

**Files**: `package.json`, `playwright.config.ts`, `tests/e2e/smoke.spec.ts`, `.github/workflows/ci.yml`, `.gitignore` (add `test-results/`, `playwright-report/`)

**Test type**: tests-alongside

---

### Step 2 — Extract MenuBar + DesktopIcons components (tests-alongside)

Extract the existing menu bar and desktop icons from `BaseLayout.astro` into `src/components/MenuBar.astro` and `src/components/DesktopIcons.astro`. No visual changes yet — pure refactor. Also move the inline `<script>` in `BaseLayout.astro` into `src/scripts/classic-ui.ts` and import it.

**Verify**: Site looks identical to before (diff a screenshot before/after with Playwright). `npm run build` succeeds. Smoke test still passes.

**Model**: **Sonnet**

**Files**: `src/layouts/BaseLayout.astro`, `src/components/MenuBar.astro` (new), `src/components/DesktopIcons.astro` (new), `src/scripts/classic-ui.ts` (new)

**Test type**: tests-alongside

---

### Step 3 — Title bar pinstripe + window positioning + border flush with menu bar (tests-alongside)

Update `classic.css` title bar to include the pinstripe racing lines flanking the title text. Tighten title bar height to ~22px. Update `BaseLayout.astro` window sizing so the window is flush under the menu bar (top border adjacent to menu bar bottom border), centered horizontally, full-height (no bottom margin), with the existing max-width preserved.

**Verify**: Visual comparison against the reference screenshots. Playwright test asserts window `getBoundingClientRect().top === 24` and title bar height. `npm run build` succeeds.

**Model**: **Sonnet**

**Files**: `src/styles/classic.css`, `src/layouts/BaseLayout.astro`

**Test type**: tests-alongside

---

### Step 4 — Refine close/zoom/collapse button glyphs + Apple logo SVG + file icons (tests-alongside)

Pixel-tune the control button inner glyphs to match the screenshots. Replace the Unicode Apple logo with an SVG at `public/img/apple-logo.svg`. Draw the five desktop icons (disk, info, globe, mail, trash) as SVGs in `public/img/icons/` and wire them up in `DesktopIcons.astro`. Icons are black-and-white line art matching the classic Mac look.

**Verify**: Visual check against screenshots. Playwright test asserts each icon SVG loads and is visible.

**Model**: **Sonnet**

**Files**: `src/styles/classic.css`, `src/components/DesktopIcons.astro`, `src/components/MenuBar.astro`, `public/img/apple-logo.svg` (new), `public/img/icons/*.svg` (new)

**Test type**: tests-alongside

---

### Step 5 — Functional menu dropdowns (TDD)

Write tests first:
- Clicking a menu title opens its dropdown; only one open at a time
- Escape closes an open dropdown
- Click outside closes the dropdown
- Disabled items are not clickable and have the disabled class
- Clicking "Full Width" maximizes the window (adds `.maximized`); "Normal" removes it
- Clicking "Help me…" opens a new tab to google.com (assert anchor `target="_blank"` + href)
- Special menu is absent

Then implement dropdown markup and logic in `MenuBar.astro` + `classic-ui.ts`. Update menu items: remove Special, add Apple→About this site, File→Home, Edit→Edit Posts (disabled), View→Full Width/Normal, Help→Help me…

**Verify**: Playwright tests pass. Manual check each menu.

**Model**: **Sonnet**

**Files**: `src/components/MenuBar.astro`, `src/scripts/classic-ui.ts`, `src/styles/classic.css`, `tests/e2e/menu.spec.ts` (new)

**Test type**: TDD

---

### Step 6 — SubWindow modal component + About / Contact / About-this-site modals (TDD)

Write tests first:
- Clicking the Info Center desktop icon opens the About modal
- Clicking the Mail desktop icon opens the Contact modal
- Clicking Apple → About this site opens the About-site modal
- Each modal renders a close box in the top-left that closes it
- Escape closes the open modal
- While a modal is open, the main window has the `.inactive` class
- Closing the modal restores the active state

Then implement `SubWindow.astro`, `AboutSiteModal.astro` (authored — tech stack), `AboutModal.astro` (placeholder copy marked "replace me"), `ContactModal.astro` (placeholder copy marked "replace me"). Wire up triggers from MenuBar and DesktopIcons. Add `.inactive` state styles in `classic.css`.

**Verify**: Playwright tests pass. Visual check that modals overlay the main window and the main window dims to inactive state.

**Model**: **Sonnet**

**Files**: `src/components/SubWindow.astro` (new), `src/components/modals/AboutSiteModal.astro` (new), `src/components/modals/AboutModal.astro` (new), `src/components/modals/ContactModal.astro` (new), `src/layouts/BaseLayout.astro`, `src/scripts/classic-ui.ts`, `src/styles/classic.css`, `tests/e2e/modals.spec.ts` (new)

**Test type**: TDD

---

### Step 7 — Accessibility + polish pass (tests-alongside)

Keyboard navigation: Tab moves through menu titles, Enter opens dropdown, Arrow keys navigate items, Escape closes. Proper ARIA roles (`menubar`, `menu`, `menuitem`, `menuitemcheckbox` for View toggles, `dialog` + `aria-modal` for sub-windows). Focus trap inside open modals. Restore focus to trigger on close.

**Verify**: Playwright keyboard test (`tests/e2e/a11y.spec.ts`): tab through menu, open Apple menu with Enter, arrow-down to item, Enter activates, modal opens, Escape closes, focus returns to Apple menu button.

**Model**: **Sonnet**

**Files**: `src/components/MenuBar.astro`, `src/components/SubWindow.astro`, `src/scripts/classic-ui.ts`, `tests/e2e/a11y.spec.ts` (new)

**Test type**: tests-alongside

---

## Testing Plan

### High priority (must have)
- **Menu dropdowns**: open/close, one-at-a-time, disabled item, Full Width / Normal toggle
- **Help menu**: opens google.com in new tab (`target="_blank"`, correct href)
- **Modals**: open from trigger, close via close box, close via Escape, inactive state on main window while open
- **Window controls**: zoom button toggles `.maximized`; collapse button hides pane
- **Layout**: main window flush under menu bar, centered, full height

### Medium priority (recommended)
- **Keyboard navigation + ARIA**: full menu bar keyboard flow, focus trap in modal, focus restore
- **Icon rendering**: desktop icon SVGs load and are visible
- **Visual regression**: Playwright screenshot of homepage compared against a committed baseline
- **Build succeeds**: `astro check` and `astro build` have zero errors

### Lower priority (nice to have, skip if time-boxed)
- Active vs inactive title bar pinstripe rendering snapshot test
- Contrast ratio checks with axe-core

## Decisions (confirmed with user)

1. **Apple logo**: solid black silhouette SVG (Mac OS 8.x accurate).
2. **About-site modal**: Claude drafts the tech-stack blurb (Astro 5.x, Vercel, Chicago font, classic Mac inspiration, link to GitHub source).
3. **About / Contact modals**: placeholder copy marked clearly in comments; user swaps in real copy later, does not block Step 6.
4. **Sub-window modals**: static, centered — not draggable. Out of scope for this phase.
5. **Trash icon**: decorative only (no link) — keeping scope tight.

## Verification (end-to-end)

After all steps:
1. `npm run build` — zero errors
2. `npm run test:e2e` — all tests pass
3. `npm run dev` — manual walkthrough:
   - Homepage loads, window flush under menu bar, pinstripe title bar visible
   - Click each menu title — dropdown opens, inverse highlight on the title
   - Apple → About this site → modal opens, main window dims, Escape closes, focus returns
   - Edit → Edit Posts is grayed out
   - View → Full Width → window maximizes
   - Help → Help me… → new tab to google.com
   - Click Info Center icon → About modal opens; click close box → closes
   - Click Mail icon → Contact modal opens
4. Push branch, PR opens, GitHub Actions green
5. Deploy preview on Vercel visually matches local
