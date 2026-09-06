# Prompt 12 — Cart drawer with cross-sell

- **Phase:** 1 — Storefront shell
- **Depends on:** 11
- **Unlocks:** 13
- **Scope:** M
- **Expected files to change/create:** rewrite `src/components/CartDrawer/CartDrawer.js` and `CartDrawer.module.css`; change `src/context/CartContext.js` (`addMany`, toast copy), `src/utils/constants.js` (remove `FREE_SHIPPING_THRESHOLD` consumers), `src/components/storefront/QuantityStepper.module.css` (restyle), `src/components/Footer/Footer.js` (drop the constant import only; the footer is rebuilt in 13).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–11 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Rebuild the cart drawer as a glass drawer with plate thumbnails, quantity controls, a free-shipping meter driven by live shipping data, coupon entry, a "Complete your ritual" cross-sell, and the two CTAs (Checkout, View cart), keeping every CartContext behaviour intact and adding a multi-add helper for rituals.

## Pre-flight checks

```bash
sed -n 40,60p src/components/CartDrawer/CartDrawer.js          # couponDiscountFor, FLAT_SHIPPING, FREE_SHIPPING_THRESHOLD usage
grep -n "addToCart = useCallback\|cartToast\|setIsCartOpen(true)" src/context/CartContext.js
grep -n "getMethods" src/services/api.js                          # shipping.getMethods (active methods)
grep -n "CartDrawer" src/components/Header/Header.js              # <CartDrawer open={isCartOpen} onClose=…/>
```

## Tasks

1. **`CartContext.addMany(items, { openDrawer = true } = {})`** — sequentially normalises and merges each item with the same `lineKey` logic as `addToCart` (reuse the functional update), shows **one** toast ("{n} items added to your cart"), opens the drawer once; skips items whose price is unknown and reports them in the toast ("2 added · 1 coming soon"). Export it in the context value; keep every existing export.
2. **Toast copy** — cart toasts say "Added to cart" / "Cart updated" / "Removed from cart" / "Cart cleared" in sentence case; keep SweetAlert2 (skinned in Prompt 04).
3. **`CartDrawer` on `Drawer`** — props `{ open, onClose }` unchanged. `<Drawer side="right" width="min(100vw, 440px)" title="Your cart" footer={…}>`. Header shows the item count chip. Remove the hand-rolled trap/scroll lock and every `FREE_SHIPPING_THRESHOLD`/`FLAT_SHIPPING` constant.
4. **Line items** — `stageSrc(item, { w: 160 })`-style thumbnail: the cart line only stores `image` (a URL) — use `cld(item.image, { w: 160, ar: "1:1", pad: true })` on a 72px `.sf-plate`; name (`Link` to `productPath(item)`), variant name if any, unit price, `QuantityStepper` (restyled: glass pill, 36px buttons, `aria-live` value), line total, remove (`Button variant="icon"`, `srLabel="Remove {name}"`). Stock cap via the existing `clampQty` in the context.
5. **Free-shipping meter** — on open, fetch `apiService.shipping.getMethods()` once (cache in a ref); threshold = the smallest positive `freeAbove` among active methods; when there is none the meter is not rendered; otherwise a gradient hairline progress (`role="progressbar"` with `aria-valuenow/max`, text "₹X away from free shipping" / "You've unlocked free shipping"). Shipping cost preview is **not** shown in the drawer (checkout owns it); remove the old flat-rate maths.
6. **Coupon** — keep `apiService.coupons.validate(code, subtotal)` flow, the auto-drop-below-minimum rule and `couponDiscountFor`; restyle as a collapsible "Have a code?" row (`Accordion`-like disclosure), input + "Apply" pill, applied state chip with remove; error text with icon.
7. **Summary** — subtotal, discount line when applied, note "Shipping and taxes calculated at checkout"; totals via `useStoreSettings().formatPrice`.
8. **"Complete your ritual" cross-sell** — up to 2 products not in the cart, chosen in order: `frequentlyBoughtTogetherIds` of cart lines → the next `ritualStep.order` in the same category → hero order; exclude `priceTBA`; each as a compact row (56px plate, name, price, `Button variant="secondary" size="sm"` "Add"); needs `apiService.products.getAll()` (cache); hidden when the cart is empty or nothing qualifies. Eyebrow "Complete your ritual".
9. **Footer (pinned)** — `Button variant="primary" block` "Checkout" → `/checkout` (closes the drawer), `Button variant="ghost" block` "View cart" → `/cart` (stub until Prompt 29), the legal-free micro-line "Secure checkout" with a lock glyph; `padding-bottom: env(safe-area-inset-bottom)`.
10. **Empty state** — `GlassCard` with eyebrow "Your cart is empty", Fraunces line "Nothing chosen yet.", `Button variant="primary"` "Shop the Black Rice Range" → `/shop`, plus the cross-sell rows fed by hero order (up to 2) titled "Start with".
11. **Auto-open** — unchanged: `addToCart` sets `isCartOpen` unless `openDrawer: false`; verify the header's cart button toggles it.

## Design and content specification

- Drawer 440px (≥ 481px) / full width (≤ 480px); header 64px; body scrolls; footer 128px pinned; line items 96px; plates `--sf-color-surface`; gold prices; meter hairline 2px gradient on `--sf-color-surface-2`.
- Motion: `panel(reduce, "right")`; line removal uses `AnimatePresence` height collapse 320 ms; reduced motion → instant.
- Copy: "Your cart", "Have a code?", "Apply", "Complete your ritual", "Checkout", "View cart", "Shipping and taxes calculated at checkout", "Nothing chosen yet.", "Shop the Black Rice Range", "Start with".

## Data and API changes

Reads: `shipping.getMethods`, `products.getAll`, `coupons.validate` (existing). `CartContext` gains `addMany` (no persistence change; `localStorage.cart` format unchanged). No admin change.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: never show a shipping figure that does not come from `shipping_methods`; never add a `priceTBA` product to the cart; keep the line-id scheme (`${productId}-${variantId ?? "default"}`) so PDP/card/wishlist/search adds still merge.

## Acceptance criteria

- [ ] Add from a card/search → drawer opens with the toast; quantity ±, remove, coupon apply/remove and auto-drop all work as before.
- [ ] Meter appears only when a shipping method has `freeAbove` (set one in Admin → Shipping to test) and its maths is right.
- [ ] Cross-sell shows up to two eligible products; "Add" adds without closing; nothing shown for empty/ineligible cases.
- [ ] `addMany` adds several products with one toast (test via the console on `window.__cart` exposed temporarily, then removed).
- [ ] Checkout button lands on `/checkout` with the cart intact; View cart lands on `/cart`.
- [ ] Focus trap/Escape/route-change close work; body scroll locked; header blur off while open.
- [ ] `grep -rn "FREE_SHIPPING_THRESHOLD\|FLAT_SHIPPING\|Sualkuchi\|looms" src/components/CartDrawer src/context/CartContext.js` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -rn "FREE_SHIPPING_THRESHOLD" src --include=*.js | grep -v "constants.js\|storeSettings.js\|tokens.js"   # 0 after Footer (13) — for now only Footer.js may remain
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280: drawer widths, stepper thumb reach, long product names wrap, coupon errors readable, reduced motion.

## Handoff

1. `PROGRESS.md`: row 12 → `complete`; Decisions log: cross-sell selection order; `addMany` contract.
2. `REPO_MAP.md` §8 (CartContext gains `addMany`) "Updated by Prompt 12".
3. Commit: `feat(lamikaa): 12 cart drawer with cross-sell`.
