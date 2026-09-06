# Prompt 09 — Header, mega panel and announcement bar

- **Phase:** 1 — Storefront shell
- **Depends on:** 08
- **Unlocks:** 10, 11, 12, 13, 14
- **Scope:** L
- **Expected files to change/create:** rewrite `src/components/Header/Header.js`, `src/components/Header/Header.module.css`; create `src/components/Header/MegaPanel.js` (+ `.module.css`), `src/components/Header/HeaderActions.js`; rewrite `src/components/AnnouncementBar/AnnouncementBar.js` (+ `.module.css`); delete `src/components/CategoriesDrawer/` (both files); change `src/App.css` (header spacer rules), `src/App.js` (nothing structural; verify the skip link target), `src/components/brand/Logo.js` (no change expected).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–08 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Replace the Meghali's Silk masthead with the LAMIKAA sticky glass header: announcement bar from data, wordmark left, a four-item primary navigation whose "Shop" opens a mega panel (seven categories with product thumbnails, shop-by-concern chips, a featured glow card), and the utility actions (search, account, wishlist, cart with count).

## Pre-flight checks

```bash
grep -n "CategoriesDrawer\|TrustStrip\|measureOverflow\|navMeasure" src/components/Header/Header.js | head
grep -rn "CategoriesDrawer" src --include=*.js | grep -v "components/CategoriesDrawer"   # only Header imports it
grep -n "getMainMenuCategories\|categoryPath\|concernPath" src/utils/categories.js
grep -n "announcements: {" src/services/api.js && grep -n "announcements:" src/config/brand.js
```

## Tasks

1. **`AnnouncementBar`** — data: `apiService.announcements.getAll()` on mount (fallback `brand.announcements` when the API returns `[]` or fails); drop any row whose `text` `isPlaceholder(...)`; keep the existing crossfade rotation (6 s, pause on hover/focus, `role="status" aria-live="polite"`), but persist the dismissal in **`sessionStorage`** under `lk-announcement-dismissed` (the brief: remembered per session); glass band 36px (`.sf-glass` at 4 % white, no blur — it sits above the blurred header, blur budget), Manrope 500 13px, gold dot separator, optional link (`row.link`), dismiss button 44×44 hit area with a 16px glyph. Remove the `FREE_SHIPPING_THRESHOLD`/`formatPrice` usage.
2. **`Header` skeleton** — `position: sticky; top: 0; z-index: var(--sf-z-header)`; heights 64px desktop / 56px ≤ 768px; three zones (left: mobile hamburger + `<Logo variant="wordmark" width={168}>` (140 ≤ 768, `variant="mark" width={40}` ≤ 340px); centre: `<nav aria-label="Shop">`; right: `HeaderActions`). States: `transparent` while `#hero-sentinel` is intersecting (IntersectionObserver; the sentinel is rendered by the hero in Prompt 14 — when absent the header is always glass), `glass` (`.sf-glass`) otherwise, `glass--strong` after 24px of scroll; while `body[data-drawer-open]` is set the header removes its backdrop filter (blur budget). Remove the in-flow spacer logic and the `.header.scrolled` hairline mechanics; remove the `TrustStrip` render (it moves to the home page in Prompt 15) and the `CategoriesDrawer` import and files.
3. **Primary nav** (desktop ≥ 1025px): items `Shop` (button, `aria-haspopup="true" aria-expanded aria-controls="mega-panel"`), `Rituals` → `/rituals`, `Our Story` → `/about`, `Why LAMIKAA` → `/why-lamikaa`, and `Offers` → `/special-offers` only while `useDealsConfig().enabled`. Manrope 500 15px, warm-white, hover/active gold with a 1px gradient underline (`.sf-btn--ghost` underline technique); `aria-current="page"` on the active route. Delete the priority-nav measurement machinery (`navMeasure`, `measureOverflow`, hidden twin list) — four items never overflow at ≥ 1025px; at 769–1024px the nav collapses into the hamburger like mobile.
4. **`MegaPanel`** — opens on pointer hover (200 ms intent delay) and on click/Enter/Space of the Shop button; closes on Escape, on outside click, on focus leaving the header, and on route change. Rendered under the header as a full-width `.sf-glass--strong` sheet (`role="region" aria-label="Shop menu"`, `id="mega-panel"`), max-height `calc(100vh - 100px)`, `sheet()` motion. Grid at 1280: `1.1fr 1fr 1.2fr`, 32px gap, 40px padding inside `.sf-container`:
   - **Categories** — the seven rows from `apiService.categories.getAll()` (active, by `sortOrder`): 40px `.sf-plate` thumbnail using `stageSrc(firstProduct, { w: 96 })` where `firstProduct` is the first hero-ordered product whose `categoryIds` includes the category (products from `apiService.products.getHeroProducts()`, cached in a module-level promise like `SearchModal.loadSearchData`), `displayName` in Fraunces 20px, one-line `description` in `--sf-color-text-secondary`, product count chip; row link = `categoryPath(cat)` (`/rituals` for `kind: "rituals"`). Last row: "All products" → `/shop`.
   - **Shop by concern** — eyebrow "Shop by concern" + `Chip variant="concern"` for each concern (`apiService.concerns.getAll()`) linking to `concernPath(slug)`; wraps to two columns.
   - **Featured** — `GlassCard glow="duo" interactive` with the first hero product: label card (`stageSrc(p, { w: 600 })`, `aspect-ratio: 1`), eyebrow "Black Rice Ritual · 01", name (Fraunces 24), `promise`, `Price product={p}`, `Button variant="primary" size="sm"` "Explore" → `productPath(p)`. When no hero product is available, show the first ritual instead (name, tagline, "Build your ritual" → `/rituals/<slug>`).
   - Tablet (769–1024): the panel is not rendered (hamburger drawer instead). Keyboard: Tab order is categories → concerns → featured; Shift+Tab from the first link returns to the Shop button.
5. **`HeaderActions`** — Search (`Button variant="icon"` → opens `SearchModal`; icon `mdi:magnify`), Account (existing MUI `Menu` logic moved here verbatim: greeting, My Profile, My Orders, My Wishlist, Logout / Login, Register; restyle the `Menu` paper via `PaperProps.className` to glass + hairline), Wishlist (`/wishlist`, count badge) hidden ≤ 768px, Cart (opens `CartDrawer`, count badge with `aria-label="Cart, N items"`), keeping every existing handler (`openAuthModal`, `logout` → `navigate("/")`). Badge = 18px gold circle with near-black numerals, `max 99`. Keep the `CartDrawer`, `SidebarMenu`, `AuthModal`, `SearchModal` mounts at the end of `Header` exactly as today (props unchanged) so those components keep working until their own prompts.
6. **Mobile (≤ 768px)** — hamburger left (opens `SidebarMenu`), wordmark centre-left, actions right: search, cart (account and wishlist live in the drawer and bottom nav). `<Logo variant="mark">` below 340px.
7. **Skip link** — the App-level `.skip-link` still targets `#main-content`; make sure the sticky header does not cover the focused target (`scroll-margin-top: 80px` on `#main-content` and on every `[id]` section via the base layer).
8. **Focus/hover parity** — every trigger reachable with Tab, visible `--sf-shadow-focus`, `Escape` closes the panel and returns focus to the Shop button; pointer users get the hover intent; touch users (`pointer: coarse`) get click only.
9. **Old CSS** — delete `Header.module.css` content that served the priority nav, collection panels and the promises line; keep nothing hard-coded; the header wordmark needs no plate (see `PACKAGING_NOTES.md` §1).

## Design and content specification

- 1280/1440: announcement 36px → header 64px; wordmark 168px; nav centred with 32px gaps; actions 44px icon buttons with 8px gaps; mega panel 40px padding, hairline top, `--sf-shadow-2`.
- 1024: same header, nav collapses into the hamburger (drawer from Prompt 10; until then the old `SidebarMenu` opens).
- 768 / 414 / 390 / 360: header 56px, wordmark 140px (mark at ≤ 340), actions: search + cart; announcement text truncates to one line with ellipsis.
- Transparent-over-hero state: background `transparent`, no blur, hairline hidden; text stays warm white (the hero ground is `#0B0B0D`).
- Motion: panel `sheet()` 320 ms; underline reveal 160 ms; reduced motion → instant.
- Copy: nav labels exactly "Shop", "Rituals", "Our Story", "Why LAMIKAA", "Offers"; panel eyebrows "Categories", "Shop by concern", "Featured"; link "All products".

## Data and API changes

Reads only: `announcements.getAll`, `categories.getAll`, `concerns.getAll`, `products.getHeroProducts`, `rituals.getAll` (fallback card). No writes; no admin change.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: keep the account menu, cart count, wishlist count and auth-modal behaviours intact; at most two blurred layers (announcement bar has none); the header never exceeds 100px of pinned height including the announcement bar.

## Acceptance criteria

- [ ] Header is sticky glass, transparent over the hero sentinel when present, strong glass after scroll; no blur while a drawer is open.
- [ ] Mega panel opens by hover/click/keyboard, shows 7 categories with thumbnails and counts, 11 concern chips and the featured glow card; closes on Escape/outside/route change; focus returns to the trigger.
- [ ] Announcement bar rotates data-driven messages, hides placeholder texts, dismisses per session.
- [ ] Utility actions work: search opens the overlay, cart opens the drawer with the correct count, wishlist count correct, account menu logs in/out.
- [ ] `CategoriesDrawer` files are deleted; `grep -rn "CategoriesDrawer\|TrustStrip" src/components/Header` → 0.
- [ ] axe (browser extension or `@axe-core/cli` if available) reports no violations on the header at 1280 and 390.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
test ! -d src/components/CategoriesDrawer && echo "drawer removed"
grep -rn "FREE_SHIPPING_THRESHOLD" src/components/AnnouncementBar | wc -l   # 0
grep -rn "localStorage" src/components/AnnouncementBar | wc -l               # 0 (sessionStorage now)
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440: header height, logo legibility, no horizontal scroll, mega panel layout at 1280/1440 (three columns) and absence at 1024/768, keyboard walk (Tab → Shop → Enter → Tab through → Escape), announcement dismiss persists across routes but not across a new tab, `prefers-reduced-motion` → no panel motion.

## Handoff

1. `PROGRESS.md`: row 09 → `complete`; Decisions log: hover-intent delay, mark breakpoint, any category thumbnail fallback.
2. `REPO_MAP.md` §5: append "Updated by Prompt 09" (Header/MegaPanel/AnnouncementBar contracts; CategoriesDrawer removed).
3. Commit: `feat(lamikaa): 09 header, mega panel and announcement bar`.
