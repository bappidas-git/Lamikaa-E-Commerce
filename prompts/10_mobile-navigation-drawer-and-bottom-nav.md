# Prompt 10 — Mobile navigation drawer and bottom nav

- **Phase:** 1 — Storefront shell
- **Depends on:** 09
- **Unlocks:** 11
- **Scope:** M
- **Expected files to change/create:** rewrite `src/components/SidebarMenu/SidebarMenu.js` and `SidebarMenu.module.css`; change `src/components/BottomNav/BottomNav.js` and `BottomNav.module.css`; `src/App.css` (`.main-content` bottom padding with safe-area).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–09 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Rebuild the mobile navigation as a full-height glass drawer with accordion categories, brand pages, account links and a bottom "Shop the Black Rice Range" CTA, and restyle the bottom tab bar — both safe-area aware, focus-trapped and closing on route change.

## Pre-flight checks

```bash
sed -n 60,120p src/components/SidebarMenu/SidebarMenu.js        # current props: open, onClose, onOpenAuth; data fetch; focus trap
grep -n "NAV_ITEMS\|resolveActive\|SearchModal" src/components/BottomNav/BottomNav.js
grep -n "export default function Drawer\|const Drawer" src/components/ui/Drawer.js
grep -n "SidebarMenu" src/components/Header/Header.js           # mount + props unchanged
```

## Tasks

1. **`SidebarMenu` on the `Drawer` primitive** — keep the public props `{ open, onClose, onOpenAuth }` (Header passes them). Compose: `<Drawer side="left" open onClose width="min(100vw, 420px)" title={<Logo width={132}/>}>` with a scrollable body and a pinned footer. Remove the hand-rolled trap/scroll-lock (the primitive owns them); keep the category fetch (`apiService.categories.getAll()` + focus refetch), `useAuth`, `useDealsConfig`, `useStoreSettings` reads. Rituals and the Offers link keep their existing gating.
2. **Body sections** (in order, each a `<nav aria-label>`):
   - "Shop" accordion (`Accordion` primitive, single-open): a header row "Shop" that expands the seven categories (`categoryPath`), each 48px tall with a 32px `.sf-plate` thumbnail (`stageSrc(firstProduct, { w: 64 })`, resolved as in the mega panel — extract that lookup into `src/utils/catalogue.js → firstProductForCategory(products, category)` and reuse it in both), plus "All products" → `/shop`; the accordion is open by default on `/shop` and `/category/*`.
   - Brand links: Rituals → `/rituals`, Our Story → `/about`, Why LAMIKAA → `/why-lamikaa`, Offers → `/special-offers` (only when enabled), FAQ → `/faq`, Contact → `/contact`; Fraunces 22px, 52px rows, hairline separators, gold `aria-current`.
   - Account: signed-out → "Log in" (calls `onOpenAuth`) and "Create account" (`openAuthModal("signup")`); signed-in → avatar initials, name, email, then My Profile / My Orders / My Wishlist (with count) / Log out (existing `logout` + navigate home).
   - Contact & social: email/phone rows only when not placeholders; `socialLinks` marks (already filtered).
3. **Pinned footer** — `Button variant="primary" block` "Shop the Black Rice Range" → `/shop` (closes the drawer), `padding-bottom: calc(16px + env(safe-area-inset-bottom))`; below it the legal note in 12px `--sf-color-text-muted`: `brand.legalNote` (two lines max, `-webkit-line-clamp: 3`).
4. **A11y/behaviour** — `Drawer` provides `role="dialog" aria-modal aria-label="Menu"`, focus trap, Escape, focus restore, scroll lock, close on route change; verify all four work here; the close button is the first tab stop; every row ≥ 44px; the accordion header carries `aria-expanded`.
5. **`BottomNav`** — glass bar (`.sf-glass--strong`, hairline top), 64px + `env(safe-area-inset-bottom)`, five tabs: Home `/`, Shop `/shop` (active on `/shop`, `/category/*`, `/product/*`, `/rituals*`), Search (button → `SearchModal`, unchanged mount), Wishlist `/wishlist` (count badge), Account `/profile`; icons Iconify `mdi:home-outline`, `mdi:shopping-outline`, `mdi:magnify`, `mdi:heart-outline`, `mdi:account-outline`; active tab gold with a 20px gradient hairline above the icon; keep the hide-on-scroll-down behaviour (existing) but never hide while a drawer/overlay is open; `aria-label="Primary"`; labels 11px Manrope 600 (visible, not icon-only).
6. **Layout plumbing** — `.main-content { padding-bottom: calc(80px + env(safe-area-inset-bottom)) }` ≤ 768px; the PDP sticky purchase bar (Prompt 25) will sit above the bottom nav — reserve the z-index order now: bottom nav `--sf-z-sticky`, sticky bar `--sf-z-stickybar`.
7. **Delete** the old `SidebarMenu.module.css` rules wholesale (tokens only in the new file; no `.dark`, no logo swap, no theme row).

## Design and content specification

- Drawer: `.sf-glass--strong` panel over a `--sf-color-overlay` scrim; header 64px with the wordmark and a 44px close button; body padding 8px 20px; rows 48–52px; accordion rows 48px with thumbnails; footer CTA 52px pill.
- 360/390/414: drawer full width; 768: 420px; the drawer is not used ≥ 1025px (the hamburger is hidden there).
- Motion: `panel(reduce, "left")` 600/320 ms; accordion 320 ms; reduced motion → instant.
- Copy: exactly "Shop", "All products", "Rituals", "Our Story", "Why LAMIKAA", "Offers", "FAQ", "Contact", "Log in", "Create account", "My Profile", "My Orders", "My Wishlist", "Log out", "Shop the Black Rice Range".

## Data and API changes

Reads only. None.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: the drawer must not blur while the header is blurred (the header drops its blur via `body[data-drawer-open]` — verify); no theme row; no `TrustStrip` inside the drawer (moved to home).

## Acceptance criteria

- [ ] Hamburger opens the glass drawer; Escape/scrim/close/route change close it; focus returns to the hamburger; body scroll locked while open.
- [ ] Accordion lists the seven categories with thumbnails; every link navigates and closes the drawer.
- [ ] Account section reflects auth state; login opens the AuthModal; logout works.
- [ ] Bottom nav shows five labelled tabs with correct active states and counts; sits above the safe area; hides on scroll down and reappears on scroll up; never overlaps a focused CTA at the page end (padding check on `/checkout`).
- [ ] No `{{` text in the drawer (contact rows hidden while unresolved).
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "useFocusTrap\|useScrollLock\|Drawer" src/components/SidebarMenu/SidebarMenu.js | head
grep -rn "toggleTheme\|Dark mode" src/components/SidebarMenu | wc -l   # 0
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 (drawer + bottom nav) and 1024 / 1280 (no bottom nav, hamburger only at 1024): open/close cycles, Tab cycle stays inside, iOS Safari safe-area (device emulation with notch), reduced motion.

## Handoff

1. `PROGRESS.md`: row 10 → `complete`; Decisions log: accordion default-open rule, tab activation rules.
2. `REPO_MAP.md` §5 "Updated by Prompt 10".
3. Commit: `feat(lamikaa): 10 mobile navigation drawer and bottom nav`.
