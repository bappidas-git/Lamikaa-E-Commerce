# Prompt 31 — Order confirmation, offers, search and state consistency

- **Phase:** 4 — Commerce and account
- **Depends on:** 30
- **Unlocks:** 32
- **Scope:** M
- **Expected files to change/create:** change `src/pages/OrderConfirmation/OrderConfirmation.js` (+ `.module.css`), `src/pages/SpecialOffers/SpecialOffers.js` (+ `.module.css`), `src/pages/Search/Search.js`, `src/pages/NotFound/NotFound.js`, `src/components/routing/RouteFallback.js`; create `src/components/ui/EmptyState.js` (+ `.module.css`), `src/components/ui/ErrorState.js`; delete `src/pages/_ComingSoon/`; sweep every page's loading/empty/error branches.

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–30 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Restyle the order confirmation and the admin-driven offers page (keeping their logic), formalise the shared empty / error / loading / 404 states across the storefront, and remove the last scaffolding stub.

## Pre-flight checks

```bash
grep -n "confettiFiredRef\|CONFETTI_COLORS\|paymentStatus\|Download Invoice" src/pages/OrderConfirmation/OrderConfirmation.js | head
grep -n "const ProductCard\|pickByIds\|isCouponValid\|CategoryTabs" src/pages/SpecialOffers/SpecialOffers.js | head
grep -rn "ComingSoon" src --include=*.js | grep -v "_ComingSoon"   # 0 expected
grep -rln "role=\"status\"\|role=\"alert\"" src/pages | wc -l
```

## Tasks

1. **`EmptyState`** — props `{ eyebrow, title, text, icon, actions, compact }`: glass card, centred, a hairline glyph (Iconify) in a gradient ring, Fraunces title, secondary text, pill actions. **`ErrorState`** — same anatomy with `role="alert"`, a "Try again" action calling `onRetry`, and honest copy ("We couldn't load this. Nothing was changed."). Both exported from `ui/index.js`.
2. **Sweep** — replace ad-hoc empty/error markup with the two components on: Shop/Category (empty concern, fetch error), Search (no results), Rituals (missing), Cart (empty), Wishlist (empty, guest band stays), OrderHistory (empty, no-match, error), Profile (recent orders empty, wallet empty, addresses empty), OrderConfirmation (error, not found), Faq (no results), Contact (submit error stays inline), NotFound (uses `EmptyState` with the 404 eyebrow), `RouteFallback` (skeleton). Loading states use `Skeleton` variants sized to the layout (no spinners except inside buttons). Every list page keeps the rule "fetch error never masquerades as empty".
3. **`OrderConfirmation` restyle** — keep everything: `getByOrderNumber`, payment-status-driven chip + lede, estimated/real arrival, copy-order-number with clipboard-verified status, confetti (new palette, reduced-motion skip, canvas `aria-hidden`), money ledger with store-credit lines, addresses, actions (Continue shopping → `/shop`, View orders, Track order, Download invoice "Coming soon" placeholder — keep the honest disabled state), loading/error/not-found branches. Restyle: a gold seal (`GlowWrap tone="gold"` around a gradient-ring check), Fraunces thank-you addressed by first name, record card glass, ledger hairlines; `useSeo({ title: "Order confirmed", noindex: true })`.
4. **`SpecialOffers` restyle** — keep the config gate (`enabled`), hero copy from `dealsConfig.hero`, countdown (`resolveCountdownTarget`), coupon vouchers with copy-to-clipboard (honest failure), Deal of the Day, category tabs derived from present categories, discount-derived fallbacks, `useAddedFlash`, `buildCartItem` adds. Replace the **local** `ProductCard` copy (lines ~437-544) with the shared `ProductCard`; vouchers as `GlassCard glow="gold"`; the disabled state ("No offers right now" — `dealsConfig.enabled` is `false` in the seed) uses `EmptyState` with a CTA to `/shop`; `useSeo({ title: "Offers" })`. The nav label is "Offers" (Header/Footer/SidebarMenu already gate on `enabled`).
5. **`Search` page** — adopt `EmptyState`; keep ranking.
6. **Delete `src/pages/_ComingSoon/`** and any import.
7. **Consistency audit** — a checklist in `PROGRESS.md` listing every page and which of loading / empty / error / not-found it implements, with the component used.

## Design and content specification

- EmptyState: max-width 520px, 40px padding, glyph 56px ring, title Fraunces 24px, text 15px, actions wrap; compact variant 24px padding for in-page use.
- Confirmation: seal 96px, record card grid `1fr 1fr` ≥ 769px; actions pills; ledger 15px.
- Offers: vouchers 3-up/2-up/1-up; code chip monospace gold; countdown as one tracked line.
- Copy: "Nothing here yet", "We couldn't load this", "Try again", "Order confirmed", "Thank you, {firstName}", "No offers right now", "Copy code", "Copied".

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
- Prompt-specific: the offers page's local card copy must go (one `ProductCard`); no page may show a spinner as its main loading state; confetti colours from the palette only.

## Acceptance criteria

- [ ] Placing an order shows the restyled confirmation with the correct payment chip for COD and for a store-credit-covered order; copy-number works; confetti respects reduced motion.
- [ ] `/special-offers` shows the disabled state with the seed; enabling it in Admin → Special Offers with `SAMPLE10` featured shows the voucher and the auto-derived deals (none, since no `comparePrice`) honestly.
- [ ] Every page in the checklist uses `EmptyState`/`ErrorState`/`Skeleton`; `grep -rn "loading-spinner" src/pages | wc -l` → 0.
- [ ] `src/pages/_ComingSoon` deleted; `grep -rn "ComingSoon" src` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
test ! -d src/pages/_ComingSoon && echo "stub removed"
grep -rn "const ProductCard" src/pages/SpecialOffers | wc -l   # 0
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440; stop JSON Server and visit `/shop`, `/orders`, `/faq` to see error states; reduced motion.

## Handoff

1. `PROGRESS.md`: row 31 → `complete`; the state-consistency checklist.
2. `REPO_MAP.md` §5/§6 "Updated by Prompt 31".
3. Commit: `feat(lamikaa): 31 order confirmation, offers, search and state consistency`.
