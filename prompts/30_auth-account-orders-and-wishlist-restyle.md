# Prompt 30 — Auth, account, orders and wishlist restyle

- **Phase:** 4 — Commerce and account
- **Depends on:** 29
- **Unlocks:** 31
- **Scope:** L
- **Expected files to change/create:** change `src/components/AuthModal/AuthModal.js` (+ `.module.css`), `src/components/ReviewModal/ReviewModal.js` (+ `.module.css`), `src/pages/Profile/Profile.js` (+ `.module.css`), `src/pages/OrderHistory/OrderHistory.js` (+ `.module.css`), `src/pages/Wishlist/Wishlist.js` (+ `.module.css`); create `src/utils/orderStatus.js` (shared `deriveOrderStatus` + `STATUS_CONFIG`).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–29 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Restyle the authentication modal, the account hub, order history (with the review flow) and the wishlist to the design system with zero functional regression, moving the modals onto the shared `Modal` primitive and unifying the duplicated order-status logic.

## Pre-flight checks

```bash
grep -n "deriveOrderStatus" src/pages/OrderHistory/OrderHistory.js src/pages/Profile/Profile.js   # duplicated
grep -n "getPasswordStrength\|handleTabKeyDown\|GoogleIcon\|FacebookIcon" src/components/AuthModal/AuthModal.js | head
grep -n "renderProfileSection\|renderAddressesSection\|renderWalletSection\|renderSettingsSection\|handlePasswordSubmit" src/pages/Profile/Profile.js
grep -n "isReturnEligible\|isCancellable\|reorderableItems\|openReviewModal\|ORDERS_PER_PAGE" src/pages/OrderHistory/OrderHistory.js
```

## Tasks

1. **`src/utils/orderStatus.js`** — move `deriveOrderStatus` and `STATUS_CONFIG` (identical in `OrderHistory.js:18-47` and `Profile.js:18-47`) into one module; both pages import it; labels/colours from tokens (`--sf-color-success/warning/danger/info`).
2. **`AuthModal` on `Modal`** — keep props `{ open, onClose, defaultTab }`, the tabs (login/signup, roving tabindex, Home/End), password strength meter (word + bar), show/hide toggles, validation, `login`/`register` calls, `aria-invalid`/`aria-describedby`, legal links (`/policies/terms`, `/policies/privacy`, `/contact`). Remove the **disabled** Google/Facebook buttons and their brand-hex icons (they have no function today — record as a decision) — if the owner later wants social login it is a backend feature. Layout: `Modal size="sm"` (bottom sheet ≤ 480px), wordmark at the top, tabs as glass segmented control, inputs 48px, primary CTA 52px; name placeholders neutral ("First name", "Last name").
3. **`ReviewModal` on `Modal`** — keep `{ open, onClose, product, existing, onSubmit }`, star radiogroup with words, title/body counters, moderation notice; product thumbnail on a plate; placeholder text "How does it feel on your skin? How does it smell? What would you tell a friend?".
4. **`Profile`** — keep all sections and logic (profile edit with read-only email, password change + checklist, addresses CRUD with default rules and legacy-row normalisation, wallet lazy load + ledger, payment/notifications empty states, logout confirm, membership badge, honest figures, feedback toast). Restyle: dashboard as a two-column layout ≥ 1025px (identity `GlassCard` with initials avatar in a gradient ring + figures; index list right), sections as glass cards; address cards with a gold "Default" chip; wallet ledger as hairline rows with credit/debit tones; forms via `ui` inputs; the feedback toast via the SweetAlert2 skin or the existing `collapse()` toast (keep whichever is simpler, no behaviour change). Settings keeps only the password block (the Appearance switch is gone).
5. **`OrderHistory`** — keep everything: search, five filters, 5/page pagination, timeline, tracking drawer, details drawer, cancel with payment-aware copy, return within `RETURN_WINDOW_DAYS` → `/contact`, reorder via `addToCart(..., { openDrawer: false })` + drawer open, review submit via `ReviewModal` → `reviews.submit` → `getMine` refresh, review status chips, copy controls, refund line states, signed-out/loading/error/empty/no-match states. Restyle: order records as `GlassCard`s with a plate strip of item images, status `Chip variant="status"`, timeline as three `Chip variant="step"` numerals joined by a gradient hairline, drawers as `Accordion`-style disclosures, buttons pills. `RETURN_WINDOW_DAYS` must read `STOREFRONT_CONFIG.returnsWindowDays` (single source) — replace the local constant.
6. **`Wishlist`** — keep sorts, guest band, heart-remove with exit animation, Move to Cart (silent remove), Clear All (context confirm), recommendations (related → featured, dedupe), stock gating. Restyle: `ProductCard` is already new; the Move-to-Cart button becomes `Button variant="secondary" block` under each card; toolbar glass; empty state via the shared pattern; title "Your wishlist" (not "Your Collection").
7. **Copy sweep** — remove "Muga, Pat and Eri — woven in Assam" (OrderHistory 691-692), "the weave, the colour" (Wishlist 354), loom SVG illustrations (draw a simple hairline heart / bag instead); no textile words remain in these five files.

## Design and content specification

- Modals: glass strong, 24px padding, sheet on mobile; forms 48px inputs; CTAs 52px.
- Account: page grid `320px 1fr` ≥ 1025px; cards 24px padding; figures Fraunces 32px; index rows 52px.
- Orders: record header row (number + date + status chip), plates 56px, actions as pill buttons that wrap; drawers animate height.
- Wishlist grid 1/2/3/4 columns at 360/640/1024/1280.
- Copy: "Welcome back", "Create your account", "Your account", "Your orders", "Your wishlist", "Write a review", "Move to cart", "Clear all".

## Data and API changes

None (all existing endpoints).

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: diff the logic sections of `Profile.js` and `OrderHistory.js` — handlers and effects unchanged apart from imports; the disabled social buttons are the only removal.

## Acceptance criteria

- [ ] Login/register (validation, strength meter, remember me) work; the modal traps focus and is a sheet on mobile.
- [ ] Profile: edit name/phone, change password (checklist), add/edit/delete/default addresses (default promotion rules), wallet ledger for the sample customer, logout.
- [ ] Orders: filters/search/pagination; cancel the processing sample order (refund copy correct for COD); reorder; write a review on the delivered order → appears pending in Admin → Reviews → approve → shows on the PDP.
- [ ] Wishlist: sort, move to cart, remove, clear, recommendations, guest persistence.
- [ ] `grep -rn "Muga\|Eri\|weave\|loom\|Collection" src/pages/Profile src/pages/OrderHistory src/pages/Wishlist src/components/AuthModal src/components/ReviewModal` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -rn "deriveOrderStatus" src --include=*.js | grep -v utils/orderStatus.js | wc -l   # 2 imports
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 for all four surfaces; keyboard-only review submission; reduced motion.

## Handoff

1. `PROGRESS.md`: row 30 → `complete`; Decisions log: social buttons removed (non-functional).
2. `REPO_MAP.md` §6/§5 "Updated by Prompt 30".
3. Commit: `feat(lamikaa): 30 auth, account, orders and wishlist restyle`.
