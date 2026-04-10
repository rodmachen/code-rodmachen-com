# Plan: Classic Mac OS Refinement (Phase 1.5)

## Context

The site currently has a rough classic Mac OS look (Chicago font, menu bar, beveled window, desktop icons, zoom/shade/close controls) but several details do not match the reference screenshots (Mac OS 7.x–8.x era). This plan tightens the visual fidelity and adds a small amount of interactivity — functional menu dropdowns and About/Contact as modal sub-windows — while staying a styling-only phase. Phase 2 (content collection, RSS, Cloudinary, dynamic routes) remains untouched.

The goal is to make the chrome look and feel as authentic as possible to Mac OS 8.1 before layering on real blog functionality.

## Reference Screenshots

- "About This Computer" (Mac OS 8.1) — pinstripe racing lines in title bar, close/zoom/collapse button glyphs
- "Mac OS Info Center" — menu bar layout, desktop icons (MacOS 8.1 disk, Mac OS Info Center, Browse the Internet, Mail, Trash)
- Multi-window screenshot — stacked windows, active vs. inactive title bar states
- Apple Computer browser — overlapping window example

## Decisions (confirmed with user)

1. **Apple logo**: solid black silhouette SVG (Mac OS 8.x accurate)
2. **About-site modal**: Claude drafts the tech-stack blurb (Astro 5.x, Vercel, Chicago font, classic Mac inspiration, GitHub link)
3. **About / Contact modals**: placeholder copy marked in comments; user swaps in real copy later
4. **Sub-window modals**: static, centered — not draggable
5. **Trash icon**: decorative only

## Scope

### Required (user-specified)
1. Title bar pinstripe racing lines flanking the title text
2. Title bar height proportional to the menu bar, flush under menu bar with proper border
3. Window centered, full height (below menu bar), max-width preserved
4. Close / zoom / collapse buttons refined to match screenshot pixel details
5. Desktop file icons redrawn to match Mac OS 8.1 style
6. Functional menu dropdowns (click to open, click-outside or Escape to close)
7. Apple menu → "About this site" → modal with tech stack info
8. Edit menu → disabled "Edit Posts" item (grayed out, not clickable)
9. View menu → "Full Width" / "Normal" items that toggle the zoom state
10. Help menu → "Help me…" item that opens `https://www.google.com` in a new tab
11. Remove the Special menu
12. About and Contact become smaller sub-windows that open on top of the main window, closable via their own top-left close box
13. Testing framework setup (Playwright) + full testing coverage per testing plan below

### Recommended authenticity items (all included)
14. **Active vs. inactive window state** — pinstripe title bar only when the window is "active"; while a modal is open the main window renders in inactive (plain) state, control glyphs become hollow
15. **Drop shadow** — subtle offset dark shadow on windows (small blur acceptable for modern displays)
16. **Menu dropdown styling** — white bg, 1px black border, 1px drop shadow offset (1,1), Chicago font items, disabled items in gray (#888), divider lines as `<hr>`, hover = inverse (black bg / white text), optional ⌘ hint on right
17. **Dotted focus ring** on keyboard-focused controls (era-appropriate; replaces browser default outline)
18. **Proper solid-black Apple logo SVG** to replace the Unicode `` character
19. **Clock baseline alignment** verified; menu bar uses Chicago font consistently
20. **Modal sub-windows** use same pinstripe title bar + close box; while open, main window title bar renders inactive state (ties to item 14)

## Files to Modify

| Area | File | Status |
|---|---|---|
| Menu bar markup + dropdown logic | `src/components/MenuBar.astro` | new |
| Desktop icons | `src/components/DesktopIcons.astro` | new |
| Client-side JS | `src/scripts/classic-ui.ts` | new (extracted from BaseLayout) |
| Sub-window modal wrapper | `src/components/SubWindow.astro` | new |
| About-this-site modal | `src/components/modals/AboutSiteModal.astro` | new |
| About modal | `src/components/modals/AboutModal.astro` | new |
| Contact modal | `src/components/modals/ContactModal.astro` | new |
| Apple logo SVG | `public/img/apple-logo.svg` | new |
| Desktop icon SVGs | `public/img/icons/*.svg` | new (disk, info, globe, mail, trash) |
| Classic window CSS | `src/styles/classic.css` | modify |
| Global CSS variables | `src/styles/global.css` | modify (pinstripe vars, modal z-index) |
| Main layout | `src/layouts/BaseLayout.astro` | modify |
| Playwright config | `playwright.config.ts` | new |
| E2E tests | `tests/e2e/*.spec.ts` | new |
| CI workflow | `.github/workflows/ci.yml` | new |

## Design Details

### Title bar pinstripe (items 1, 14, 20)
Six thin horizontal black lines (1px each, separated by 1px gaps) extending left of the title text and right of the title text, stopping before the control buttons. Implemented with a repeating `linear-gradient` on pseudo-elements or wrapper divs flanking the title. The title text sits centered on a white background where the lines are interrupted. Active windows show the pinstripe; inactive windows show a plain gray title bar.

### Title bar height and window border (item 2)
Target 20px title bar interior with 1px black top border and 1px black bottom border (total ~22px). Window `margin-top: 24px` — flush under the 24px menu bar with borders adjacent. Height: `calc(100vh - 24px)`. Horizontally: `width: 95%; max-width: 1000px; margin-left: auto; margin-right: auto`. No bottom margin — window reaches viewport bottom; inner pane scrolls.

### Control buttons (item 4)
11×11px squares with double-line beveled borders. Close box: empty interior. Zoom box: small inner square in upper-left quadrant. Collapse box: single horizontal line centered vertically. All share the same outer frame (existing beveled bg). In inactive state: border only, no fill glyph.

### Drop shadow (item 15)
`box-shadow: 2px 2px 4px rgba(0,0,0,0.5)` on `.classic-window` and `.sub-window`. Flat-style offset shadow consistent with the Mac OS 8 window look.

### Desktop file icons (item 5)
Five icons stacked down the right edge:
1. **Hard disk** — "code.rodmachen.com" (decorative/home link)
2. **Mac OS Info Center** (blue "i" sphere look) — opens About modal
3. **Browse the Internet** (globe) — opens `https://rodmachen.com` in new tab
4. **Mail** (envelope) — opens Contact modal
5. **Trash** (trash can) — decorative, no link

Each icon is a black-and-white line-art SVG (~36×36px) with white-outlined text label below. Hover: yellow/inverted selection highlight.

### Apple logo SVG (item 18)
Solid black silhouette at `public/img/apple-logo.svg`, ~14px tall, used as `<img>` in MenuBar. Replaces `<span class="apple-logo">` with Unicode `` character.

### Menu dropdowns (items 6–11, 16, 17, 19)
Click-to-open (not hover). Each menu title is a `<button role="menuitem">` toggling an adjacent `<ul role="menu">` positioned absolutely below. Dropdown appearance:
- White background, 1px black border, `box-shadow: 1px 1px 0 #000`
- Chicago font, 4px horizontal padding, 2px vertical padding per item
- Disabled items: `color: #888; cursor: default; pointer-events: none`
- Divider: `<li role="separator"><hr></li>` with 1px gray line
- Hover state: black bg, white text
- ⌘ key hints right-aligned (decorative)
- Active menu title: inverse (black bg / white text)

Only one dropdown open at a time. Click-outside and Escape close. Focus ring on keyboard-focused items is a dotted 1px outline (item 17). Clock alignment verified against Chicago font cap-height (item 19).

### Menu contents
- **Apple** (logo): "About this site" | separator
- **File**: "Home" → `/`
- **Edit**: *(disabled)* "Edit Posts"
- **View**: "Full Width" (✓ when maximized), "Normal" (✓ when not maximized)
- **Help**: "Help me…" → `window.open('https://www.google.com', '_blank')`
- **Special**: removed entirely

### Modal sub-windows (items 7, 12, 14, 20)
`SubWindow.astro` wraps content in the same classic-window chrome but smaller: `width: 420px; max-height: 60vh`, fixed-position centered on viewport. Z-index above main window, below menu bar. While any modal is open:
- `document.querySelector('#main-window')` gets class `.inactive`
- Main window title bar renders plain (no pinstripe, hollow button glyphs)
Closed via top-left close box button or Escape. Focus trap inside modal; on close, focus returns to the trigger element.

### Active/inactive window state (items 14, 20)
`.classic-window.inactive .window-title` has no pinstripe background — plain `#c0c0c0` fill. `.classic-window.inactive .control-box-inner` renders as border only (no fill). JS adds/removes `.inactive` when modals open/close.

### Dotted focus ring (item 17)
```css
.control-box:focus-visible,
.menu-item:focus-visible,
button:focus-visible {
  outline: 1px dotted #000;
  outline-offset: 1px;
}
```

## Implementation Steps

Each step includes: **Verify** (what to run, what passing looks like), **Model**, **Files**, **Test type**.

---

### Step 1 — Testing framework + CI (tests-alongside)

Install Playwright (`@playwright/test`). Add `playwright.config.ts` targeting `http://localhost:4321`. Add `tests/e2e/smoke.spec.ts`: loads `/`, asserts page title contains "code.rodmachen.com" and `h1` exists. Add `.github/workflows/ci.yml` running `astro check`, `astro build`, and `playwright test` (with `astro dev` as webServer). Add `test:e2e` script to `package.json`. Update `.gitignore` with `test-results/`, `playwright-report/`.

**Verify**: `npm run test:e2e` passes locally. Push to feature branch; GitHub Actions run green.

**Model**: **Sonnet**

**Files**: `package.json`, `playwright.config.ts`, `tests/e2e/smoke.spec.ts`, `.github/workflows/ci.yml`, `.gitignore`

**Test type**: tests-alongside

---

### Step 2 — Extract MenuBar + DesktopIcons components + centralize JS (tests-alongside)

Extract menu bar markup (BaseLayout lines 197–208) + scoped CSS (lines 33–71) into `src/components/MenuBar.astro`. Extract desktop icons markup (lines 211–228) + CSS (lines 73–114) into `src/components/DesktopIcons.astro`. Move inline `<script>` (lines 254–282) into `src/scripts/classic-ui.ts` and import via `<script>` tag. No visual changes — pure refactor.

**Verify**: `npm run build` succeeds. `npm run test:e2e` (smoke) still passes. Visual snapshot before/after looks identical.

**Model**: **Sonnet**

**Files**: `src/layouts/BaseLayout.astro`, `src/components/MenuBar.astro` (new), `src/components/DesktopIcons.astro` (new), `src/scripts/classic-ui.ts` (new)

**Test type**: tests-alongside

---

### Step 3 — Title bar pinstripe + window positioning + drop shadow (tests-alongside)

Update `classic.css`:
- `.window-titlebar` gets pinstripe via `repeating-linear-gradient` on flanking pseudo-elements
- `.classic-window.inactive .window-titlebar` reverts to `background: #c0c0c0`
- Add `box-shadow: 2px 2px 4px rgba(0,0,0,0.5)` to `.classic-window` and `.sub-window`

Update `BaseLayout.astro` window sizing: `margin-top: 24px`, `height: calc(100vh - 24px)`, remove bottom margin. Title bar height ~22px.

Add Playwright test `tests/e2e/window.spec.ts`:
- Assert main window `getBoundingClientRect().top` ≈ 24
- Assert title bar has pinstripe visible (check computed background-image on titlebar element)
- Assert `box-shadow` is applied

**Verify**: Visual matches reference screenshots. Playwright window test passes.

**Model**: **Sonnet**

**Files**: `src/styles/classic.css`, `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `tests/e2e/window.spec.ts` (new)

**Test type**: tests-alongside

---

### Step 4 — Control button glyphs + inactive state + Apple logo SVG + file icons (tests-alongside)

Refine control button inner glyphs to pixel-accurate dimensions:
- Close box: empty (no glyph)
- Zoom box: small inner square in upper-left quadrant
- Collapse box: horizontal center line
- `.classic-window.inactive .control-box-inner`: border only, no fill (hollow)

Add `public/img/apple-logo.svg` (solid black Apple silhouette). Update `MenuBar.astro` to use `<img src="/img/apple-logo.svg">` instead of Unicode span.

Draw five desktop icon SVGs in `public/img/icons/`: `disk.svg`, `info.svg`, `globe.svg`, `mail.svg`, `trash.svg`. Update `DesktopIcons.astro` with new icons, new labels (code.rodmachen.com, Mac OS Info Center, Browse the Internet, Mail, Trash), and correct link targets (info → about modal trigger, globe → rodmachen.com new tab, mail → contact modal trigger, trash → no link).

Add Playwright test assertions to `tests/e2e/window.spec.ts`:
- All three control buttons visible
- Apple logo `<img>` present with `src` containing `apple-logo.svg`
- Five desktop icons present

**Verify**: Visual check of button glyphs and icons against screenshots. Tests pass.

**Model**: **Sonnet**

**Files**: `src/styles/classic.css`, `src/components/MenuBar.astro`, `src/components/DesktopIcons.astro`, `public/img/apple-logo.svg` (new), `public/img/icons/disk.svg` (new), `public/img/icons/info.svg` (new), `public/img/icons/globe.svg` (new), `public/img/icons/mail.svg` (new), `public/img/icons/trash.svg` (new)

**Test type**: tests-alongside

---

### Step 5 — Functional menu dropdowns (TDD)

Write `tests/e2e/menu.spec.ts` first (failing):
- Clicking "File" menu opens dropdown containing "Home"
- Clicking "Edit" opens dropdown with "Edit Posts" that has `[aria-disabled=true]` and is not tabbable
- Clicking "View" → "Full Width" adds `.maximized` to `#main-window`; "Normal" removes it
- Clicking "View → Full Width" shows a checkmark on "Full Width" and not on "Normal"
- Clicking "Help" → "Help me…" has `target="_blank"` and `href="https://www.google.com"`
- Special menu is absent from DOM
- Only one dropdown is open at a time (open File, then click Edit — File closes, Edit opens)
- Click-outside closes the open dropdown
- Escape key closes the open dropdown

Then implement:
- Update `MenuBar.astro` with full dropdown markup, ARIA roles (`menubar`, `menu`, `menuitem`)
- Update `classic-ui.ts` with click-toggle logic, one-at-a-time enforcement, click-outside listener, Escape handler
- CSS for dropdown appearance (item 16 specs above)
- Dotted focus ring CSS (item 17)
- Remove Special menu entirely
- Add View state tracking: which item shows checkmark based on `.maximized` class

Also fix clock: verify Chicago font baseline alignment, add `font-family: ChicagoFLF` explicitly if missing (item 19).

**Verify**: All `menu.spec.ts` tests pass. Manual walkthrough each menu.

**Model**: **Sonnet**

**Files**: `src/components/MenuBar.astro`, `src/scripts/classic-ui.ts`, `src/styles/classic.css`, `tests/e2e/menu.spec.ts` (new)

**Test type**: TDD

---

### Step 6 — SubWindow modal component + About / Contact / About-this-site modals (TDD)

Write `tests/e2e/modals.spec.ts` first (failing):
- Clicking "Apple → About this site" opens `#modal-about-site` (visible)
- Clicking Mac OS Info Center desktop icon opens `#modal-about` (visible)
- Clicking Mail desktop icon opens `#modal-contact` (visible)
- Each modal has a close box button in the top-left
- Clicking close box hides the modal
- Pressing Escape closes the active modal
- While any modal is open, `#main-window` has class `.inactive`
- After modal closes, `#main-window` no longer has `.inactive`
- Modal title bars show the pinstripe pattern (same as active main window)
- Modals have `role="dialog"` and `aria-modal="true"`

Then implement:
- `SubWindow.astro`: takes `id`, `title`, slot for content, close button in top-left, same classic-window chrome, drop shadow, pinstripe title bar, `role="dialog"` `aria-modal="true"`
- `AboutSiteModal.astro`: Claude-authored tech-stack content (Astro 5.x, Vercel, Chicago font, Mac OS 8.1 inspiration, GitHub link)
- `AboutModal.astro`: placeholder copy `<!-- TODO: replace with real About copy -->`
- `ContactModal.astro`: placeholder copy `<!-- TODO: replace with real Contact copy -->`
- Update `BaseLayout.astro` to include all three modals in DOM (hidden by default, `display: none`)
- Update `DesktopIcons.astro` triggers: Info Center and Mail icons fire JS open-modal events
- Update `classic-ui.ts`: `openModal(id)` / `closeModal()` functions that show/hide modal, toggle `.inactive` on `#main-window`, manage focus trap, restore focus on close
- CSS `.inactive` state styles in `classic.css`

**Verify**: All `modals.spec.ts` tests pass. Visual check overlay behavior.

**Model**: **Sonnet**

**Files**: `src/components/SubWindow.astro` (new), `src/components/modals/AboutSiteModal.astro` (new), `src/components/modals/AboutModal.astro` (new), `src/components/modals/ContactModal.astro` (new), `src/layouts/BaseLayout.astro`, `src/components/DesktopIcons.astro`, `src/scripts/classic-ui.ts`, `src/styles/classic.css`, `tests/e2e/modals.spec.ts` (new)

**Test type**: TDD

---

### Step 7 — Accessibility + keyboard navigation (tests-alongside)

Add `tests/e2e/a11y.spec.ts`:
- Tab through menu bar buttons; Enter opens dropdown; Arrow Down/Up navigates items; Enter activates; Escape closes and returns focus to menu button
- Modal: Tab cycles only within open modal (focus trap); Escape closes and returns focus to trigger
- Control buttons (zoom, shade) accessible via keyboard Enter/Space
- All interactive elements have visible focus ring (`outline` is not `none`)
- Desktop icon links accessible via Tab + Enter
- `role="menubar"`, `role="menu"`, `role="menuitem"`, `aria-disabled`, `role="dialog"`, `aria-modal` all present in DOM as expected

Then implement any gaps:
- Arrow key navigation in open dropdown
- Focus trap in `SubWindow` (cycle Tab/Shift-Tab between focusable elements inside modal)
- On `closeModal()`: restore focus to whichever element triggered the open
- Verify all ARIA attributes in place from Step 5 and 6

**Verify**: `tests/e2e/a11y.spec.ts` passes. Full keyboard walkthrough manually.

**Model**: **Sonnet**

**Files**: `src/components/MenuBar.astro`, `src/components/SubWindow.astro`, `src/scripts/classic-ui.ts`, `tests/e2e/a11y.spec.ts` (new)

**Test type**: tests-alongside

---

### Step 8 — Visual regression baselines (tests-alongside)

Add Playwright screenshot assertions in `tests/e2e/visual.spec.ts`:
- Homepage default state — full page screenshot
- Window maximized state — screenshot of `#main-window`
- Menu open state (File dropdown open) — screenshot of menu bar area
- About-this-site modal open — full page screenshot showing inactive main window + modal overlay
- Inactive title bar state — screenshot of `#main-window` with `.inactive` class

Commit screenshots as baseline into `tests/e2e/snapshots/`. Future runs will diff against these.

**Verify**: `npm run test:e2e` passes with no diff (baseline run). CI green.

**Model**: **Sonnet**

**Files**: `tests/e2e/visual.spec.ts` (new), `tests/e2e/snapshots/` (new directory), `playwright.config.ts` (add `expect.toHaveScreenshot` config)

**Test type**: tests-alongside

---

## Full Testing Plan

### High priority — must have before PR merge
| Test | File | Type |
|---|---|---|
| Site loads, title correct | `smoke.spec.ts` | E2E |
| Window flush under menu bar (top ≈ 24px) | `window.spec.ts` | E2E |
| Zoom button toggles `.maximized` | `window.spec.ts` | E2E |
| Collapse button hides window pane | `window.spec.ts` | E2E |
| Clicking menu title opens dropdown | `menu.spec.ts` | E2E (TDD) |
| Only one dropdown open at a time | `menu.spec.ts` | E2E (TDD) |
| Click-outside closes dropdown | `menu.spec.ts` | E2E (TDD) |
| Escape closes dropdown | `menu.spec.ts` | E2E (TDD) |
| Edit Posts is `aria-disabled` and not interactive | `menu.spec.ts` | E2E (TDD) |
| View → Full Width adds `.maximized`; Normal removes it | `menu.spec.ts` | E2E (TDD) |
| View checkmark tracks zoom state | `menu.spec.ts` | E2E (TDD) |
| Help me… has `target="_blank"` + google.com href | `menu.spec.ts` | E2E (TDD) |
| Special menu absent from DOM | `menu.spec.ts` | E2E (TDD) |
| Apple → About this site opens modal | `modals.spec.ts` | E2E (TDD) |
| Info Center icon opens About modal | `modals.spec.ts` | E2E (TDD) |
| Mail icon opens Contact modal | `modals.spec.ts` | E2E (TDD) |
| Close box hides modal | `modals.spec.ts` | E2E (TDD) |
| Escape closes modal | `modals.spec.ts` | E2E (TDD) |
| Main window gets `.inactive` while modal open | `modals.spec.ts` | E2E (TDD) |
| `.inactive` removed after modal closes | `modals.spec.ts` | E2E (TDD) |
| `astro build` zero errors (CI) | CI workflow | Build |

### Medium priority — included in this plan
| Test | File | Type |
|---|---|---|
| Apple logo `<img>` present with correct src | `window.spec.ts` | E2E |
| Five desktop icons present | `window.spec.ts` | E2E |
| Modal has `role="dialog"` + `aria-modal` | `modals.spec.ts` | E2E |
| Modal title bar has pinstripe | `modals.spec.ts` | E2E |
| Keyboard: Tab/Enter/ArrowKey/Escape menu navigation | `a11y.spec.ts` | E2E |
| Focus trap inside open modal | `a11y.spec.ts` | E2E |
| Focus restored to trigger on modal close | `a11y.spec.ts` | E2E |
| All interactive elements have visible focus ring | `a11y.spec.ts` | E2E |
| ARIA roles present: menubar, menu, menuitem | `a11y.spec.ts` | E2E |
| Visual regression: homepage default state | `visual.spec.ts` | Screenshot |
| Visual regression: modal open state | `visual.spec.ts` | Screenshot |
| Visual regression: menu dropdown open | `visual.spec.ts` | Screenshot |
| Visual regression: maximized window | `visual.spec.ts` | Screenshot |

### Lower priority (nice-to-have, not in this plan)
- Axe-core contrast ratio / accessibility audit
- Cross-browser visual snapshots (Safari, Firefox)
- Responsive / mobile viewport tests

## Verification (end-to-end)

After all steps are complete:
1. `npm run build` — zero errors, zero warnings
2. `npm run test:e2e` — all tests pass
3. `npm run dev` — manual walkthrough:
   - Homepage loads; window pinstripe visible; window flush under menu bar; drop shadow present
   - Click each menu title; inverse state on active title; correct items visible
   - Apple → About this site → modal opens; main window dims to inactive; Escape closes; focus returns
   - Edit → Edit Posts is visually grayed and not clickable
   - View → Full Width → window maximizes; checkmark appears; Normal reverts
   - Help → Help me… → new tab opens google.com
   - Info Center icon → About modal opens; close box closes it
   - Mail icon → Contact modal opens
   - All of above work via keyboard only
4. Push feature branch; PR open; GitHub Actions CI green
5. Vercel deploy preview matches local
