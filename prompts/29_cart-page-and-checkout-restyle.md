# Prompt 29 — Cart page and checkout restyle

- **Phase:** 4 — Commerce and account
- **Depends on:** 28
- **Unlocks:** 30
- **Scope:** L
- **Expected files to change/create:** create `src/pages/Cart/Cart.js` (+ `Cart.module.css`) and `src/components/cart/CrossSell.js` (+ `.module.css`, extracted from the drawer); change `src/components/CartDrawer/CartDrawer.js` (use the extracted `CrossSell`), `src/pages/Checkout/Checkout.js` and `Checkout.module.css` (restyle; logic preserved), `src/App.js` (`/cart` → Cart), `src/components/storefront/QuantityStepper.js` (no change expected).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–28 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Add the full-page cart the drawer's "View cart" points to, and restyle the four-step checkout to the design system with **zero functional regression** — every step, validation rule, address-book action, shipping method, coupon, tax, store-credit, COD rule, payment form and the order payload stay exactly as they are.

## Pre-flight checks

```bash
grep -n "const STEPS\|validateAddress\|codAvailable\|storeCreditApplied\|PAYMENT_OPTIONS\|orderData = {" src/pages/Checkout/Checkout.js
grep -c "" src/pages/Checkout/Checkout.module.css        # 2112 — to be rewritten
grep -n "insured silk\|Choose a weave\|loom" src/pages/Checkout/Checkout.js
grep -n "ComingSoon" src/App.js                           # /cart only
```

## Tasks

1. **`Cart` page** (`/cart`) — `useSeo({ title: "Your cart", noindex: true })`; `SectionHeading as="h1"` eyebrow "Cart", title "Your cart", lede "{n} items"; two columns ≥ 1025px (`1.4fr 1fr`): left = line items (same row anatomy as the drawer — 96px plate, name link, variant, unit price, `QuantityStepper`, line total, remove; `AnimatePresence` removal), right = sticky summary `GlassCard strong` (subtotal, coupon disclosure identical to the drawer's, discount, "Shipping and taxes calculated at checkout", `Button variant="primary" block` "Checkout" → `/checkout`, `Button variant="ghost" block` "Continue shopping" → `/shop`, `LegalNote compact`); under the items: the drawer's "Complete your ritual" cross-sell (extract it into `src/components/cart/CrossSell.js` and use it in both). Empty state: eyebrow "Your cart is empty", `EmptyState` (Prompt 31 formalises it — for now a `GlassCard`), CTA to `/shop`. Mobile: single column, summary card after the items, sticky "Checkout" bar at the bottom (glass, 64px, above the bottom nav — hide the bottom nav on `/cart` like the PDP, or stack; choose stacking with the summary CTA duplicated only if the page is taller than 2 viewports — record the decision).
2. **Checkout restyle** — rewrite `Checkout.module.css` from scratch with tokens and primitives; edit `Checkout.js` only for markup/classes and copy, **never** for state/logic. Preserve verbatim: `STEPS`, `handleNext`/`handleBack`, `validateAddress` (required fields), saved-address radios + inline form + "Add new address", shipping-method radios (free above `freeAbove`, flat rates, `estimatedDays` when set), coupon apply/remove/auto-drop, money math (subtotal → shipping → taxable base → tax inclusive/exclusive → total), store-credit panel (`maxApplicableCredit`, "Use max", `fullyCovered`), COD availability/fee/reset rules, `PAYMENT_OPTIONS` with the mock inline forms (unvalidated, as today), the review step with Edit jumps, the summary rail (collapsible on mobile), `createOrder` → `clearCart({ silent: true })` → `navigate('/order-confirmation/…')`, empty-cart branch, sign-in gate (`openAuthModal("login")`).
   - Step line: four `Chip variant="step"` numerals joined by gradient hairlines; completed steps get a gold check; `aria-current="step"`.
   - Content column: each step inside a `GlassCard padding="lg"` (no blur on mobile); inputs via the `ui` input styles (48px, gold focus, error text with icon, `aria-invalid`); radios as glass option cards with a gold ring when selected; the store-credit panel as a violet-glow card; payment method rows as glass cards with the inline form inside.
   - Summary rail: sticky `GlassCard strong` on desktop; collapsible glass bar on mobile (existing toggle), showing items (plates), subtotal, discount, shipping, tax (with the inclusive/exclusive wording from `fillCopy`), COD fee, total, store credit, amount payable; `assurances` line rebuilt from live values only (returns window when > 0, COD when enabled, support email when resolved — nothing else).
   - Nav row: Back (`ghost`) + primary CTA ("Continue to shipping" / "Continue to payment" / "Review order" / "Place order"), `aria-busy` while processing, `role="status"` text.
   - Copy fixes: remove "Delivered across India in insured silk packaging.", "Choose a weave and it waits here", the loom comment; use `currencySymbol` from settings instead of the hard-coded `&#8377;`; phone placeholder "+91 …"; country stays "India" read-only (existing behaviour; note it in `PROGRESS.md` as an owner decision to revisit if shipping abroad).
   - TBA guard: the checkout must refuse to proceed with any line whose price is not a finite number > 0 (cannot happen through the UI; add a defensive check at step 0 that removes such lines with a toast).
3. **Order failure state** — today a thrown `createOrder` error is only logged; add a visible `role="alert"` panel ("We couldn't place your order. Nothing was charged. Please try again.") with a retry button — an additive robustness fix, not a behaviour change.
4. **Routes** — `/cart` replaces the stub; `ComingSoon` now has no usage (Prompt 31 deletes it).

## Design and content specification

- Checkout container `.sf-container` grid `minmax(0,1fr) 380px` gap 48px ≥ 1025px; 1024: `1fr 320px`; ≤ 768: single column with the summary bar.
- Cards glass on desktop, solid surface on mobile; step chips 36px; option cards 64px min; inputs 48px; CTAs 52px pills.
- Copy: "Cart", "Shipping", "Payment", "Review", "Continue to shipping", "Continue to payment", "Review order", "Place order", "Have a code?", "Use max", "Shipping and taxes calculated at checkout", "Your cart is empty", "Continue shopping".
- Motion: step swap `collapse()`; reduced motion instant.

## Data and API changes

None (order payload unchanged: `items[], shippingAddress, billingAddress, subtotal, discountAmount, couponCode, shippingAmount, taxAmount, codFee, total, storeCreditUsed, amountPayable, paymentMethod, paymentStatus, fulfillmentStatus, shippingStatus, trackingNumber, notes`).

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: diff `Checkout.js` before committing — every hunk must be markup, class names, copy or the two additive guards; the money maths and payload lines are untouched.

## Acceptance criteria

- [ ] `/cart` lists items, updates quantities, applies `SAMPLE10`, links to checkout; empty state works.
- [ ] Checkout end-to-end in mock mode: guest → sign-in gate → saved address → new address validation (7 required fields) → shipping method → coupon → store credit (login as the sample customer who has wallet credit) → COD rules (set `codMaxOrder` in admin to test the reset) → review edits → place order → confirmation page; the order, payment and coupon `usedCount` appear in the admin.
- [ ] Tax wording follows settings (`taxIncluded`, rate 0 → "inclusive of all taxes").
- [ ] Order-failure alert shows when JSON Server is stopped at the last step.
- [ ] `grep -n "silk\|weave\|loom\|&#8377;" src/pages/Checkout/Checkout.js` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
git diff --stat HEAD~0 -- src/pages/Checkout/Checkout.js   # review the hunks before committing
grep -n "ComingSoon" src/App.js | wc -l   # 0
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 through all four steps; keyboard-only checkout; reduced motion.

## Handoff

1. `PROGRESS.md`: row 29 → `complete`; Decisions log: mobile summary bar behaviour, country read-only note.
2. `REPO_MAP.md` §6 "Updated by Prompt 29" (Cart page; Checkout preserved).
3. Commit: `feat(lamikaa): 29 cart page and checkout restyle`.
