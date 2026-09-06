# Prompt 37 — Responsive and mobile QA pass

- **Phase:** 6 — Cleanup and QA
- **Depends on:** 36
- **Unlocks:** 38
- **Scope:** M
- **Expected files to change/create:** create `prompts/_reference/QA_MATRIX.md`; fix-ups in any `src/**` CSS module / component the matrix flags (list them in `PROGRESS.md`).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–36 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Verify every storefront and admin route at the seven reference widths (mobile first), fix every layout, overflow, safe-area, sticky-overlap, scroll-lock, tap-target and type-size defect found, and record the results in a QA matrix.

## Pre-flight checks

```bash
node -e "console.log(require('./db.json').products.map(p=>p.slug).join('\n'))"
grep -n "path=" src/App.js | sed 's/^[ \t]*//' | cut -c1-90
```

## Tasks

1. **Matrix** — create `prompts/_reference/QA_MATRIX.md` with one row per route (`/`, `/shop`, `/shop?concern=hydration`, `/category/face-care`, `/category/body-care`, `/product/black-rice-face-wash`, `/product/black-rice-face-mist` (TBA), `/rituals`, `/rituals/morning-glow`, `/rituals/black-rice-body`, `/search?q=serum`, `/cart` (empty and filled), `/checkout` (all four steps), `/order-confirmation/<sample>`, `/orders`, `/profile` (each section), `/wishlist`, `/special-offers` (disabled + enabled), `/about`, `/why-lamikaa`, `/faq`, `/contact`, `/policies/privacy|terms|shipping-returns|cookies`, `/login`, `/nope` (404), plus overlays: header mega panel, mobile drawer, search overlay, cart drawer, auth modal, review modal, lightbox, and every admin screen) × widths `360, 390, 414, 768, 1024, 1280, 1440`, with the checks: no horizontal scroll (`document.documentElement.scrollWidth <= window.innerWidth`), no clipped text, images keep aspect (no stretch, no white edges), sticky elements (header, chapter index/nav, purchase bar, bottom nav, checkout summary bar) never cover a CTA or focused input, overlays lock and restore body scroll and restore focus, safe-area insets on notched devices (DevTools iPhone 14 Pro emulation), `svh/dvh` behaviour with the URL bar (Chrome Android emulation), tap targets ≥ 44px (DevTools → Lighthouse "tap targets" or manual), body text ≥ 16px on ≤ 414, no light text < 14px, keyboard focus visible, `prefers-reduced-motion` respected. Mark each cell ✓ / ✗ (+ fix commit) / n/a.
2. **Fix** every ✗ in the smallest correct way (token/primitive-level first, then the component's own module; never hard-code colours); typical suspects: long product names in cards/hero, chapter panel widths at 1024, checkout option cards at 360, admin tables (must scroll inside `TableContainer`), the mega panel at 1025–1100px, the value chain at 769–1024, footer accordion, lightbox controls under 360, the PDP sticky bar over the summary of the cart page.
3. **Global checks** — `overflow-x: hidden` is not used to hide a real overflow (find the real cause); `100vw` never used where scrollbars exist (use `100%`); `env(safe-area-inset-*)` on the header (top), bottom nav, sticky bars, drawers; `min-height: 100svh` with `100vh` fallbacks in place on hero/CTA/lightbox/drawers; touch `pointer: coarse` states (hover-only affordances have a visible alternative).
4. **Landscape** — 844×390 (phone landscape): hero, drawers, lightbox and checkout still usable (no fixed-height traps).
5. **Print** — `/order-confirmation/*` and the admin invoice print cleanly (no dark backgrounds on paper: add a minimal `@media print` in `App.css`).

## Design and content specification

No new design. Fixes must keep the specified breakpoint behaviours in each feature prompt.

## Data and API changes

None.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: no `!important` fixes; no viewport-specific hacks that hide content; record every fix.

## Acceptance criteria

- [ ] `QA_MATRIX.md` complete, every cell ✓ or n/a after fixes.
- [ ] Zero horizontal scroll on every route at 360 and 390 (scripted check in the console on each route).
- [ ] Overlays lock/restore scroll and focus on every width; safe-area verified.
- [ ] Print styles for confirmation/invoice.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -rn "100vw" src --include=*.css | wc -l          # 0 (or justified)
grep -rn "!important" src --include=*.css | grep -v "admin-area\|hidden\]" | wc -l   # 0
```

Manual QA: the matrix itself.

## Handoff

1. `PROGRESS.md`: row 37 → `complete`; list of fixes with files.
2. `QA_MATRIX.md` committed under `prompts/_reference/`.
3. Commit: `feat(lamikaa): 37 responsive and mobile qa pass`.
