# Technical Debt & Future Improvements

## Pull Request #1: Classic Mac OS Theme

### CSS and Component Structure
- **Extract UI Components**: The `BaseLayout.astro` file has grown significantly with the addition of the classic Mac OS theme. The Menu Bar (`.classic-menu-bar`) and Desktop Icons (`.desktop-icons`) should be extracted into their own reusable Astro components (e.g., `src/components/MenuBar.astro`, `src/components/DesktopIcons.astro`) to keep the layout file maintainable.
- **Cross-Platform Compatibility**: The Apple logo character (`\u{f8ff}`) used in the menu bar is a Private Use Area (PUA) Unicode character and will only render correctly on Apple operating systems. It should be replaced with an inline SVG to ensure the retro aesthetic works consistently across Windows, Linux, and Android.
- **Separation of Concerns (CSS/JS)**: The window shade functionality currently toggles inline styles via JavaScript (`pane.style.display = 'none'`). This should be refactored to rely entirely on CSS classes (e.g., hiding `.window-pane` when the parent `.classic-window` has the `.shaded` class) to keep styling and logic separated.

### Testing Strategy for Visual Changes
While this PR is primarily visual, it introduces complexity that should be tested to prevent future regressions:
1. **Visual Regression Testing**: Implement visual snapshot testing (using tools like Playwright or Cypress) to ensure future CSS changes do not unintentionally break the retro layout, window borders, or custom scrollbars.
2. **E2E Interaction Tests**: Write simple End-to-End tests (e.g., Playwright) to verify the new JavaScript interactions, such as clicking the `.windowshade-box` and asserting that the `.window-pane` correctly collapses and expands.
3. **Accessibility (a11y) Audits**: Retro themes often risk violating modern accessibility standards. Integrate automated accessibility testing (like `axe-core`) to verify that the custom contrast ratios, `ChicagoFLF` font definitions, and custom window controls remain accessible to screen readers and keyboard navigation.
