# Prompt 25 — PDP: layout, chapters, purchase panel and mobile bar

- **Phase:** 3 — Catalogue
- **Depends on:** 24
- **Unlocks:** 26
- **Scope:** L
- **Expected files to change/create:** rewrite `src/pages/ProductDetails/ProductDetails.js` and `ProductDetails.module.css`; create `src/components/pdp/PurchasePanel.js` (+ `.module.css`), `src/components/pdp/ChapterNav.js` (+ `.module.css`), `src/components/pdp/Chapter.js`; change `src/components/storefront/AddToCartBar.js` (+ `.module.css`), `src/components/storefront/DeliveryReturnsInfo.js`, `src/components/storefront/TrustBadges.js` (restyle), `src/components/storefront/SocialProof.js` (restyle), `src/components/BottomNav/BottomNav.js` (hide on `/product/*` at ≤ 768px), `src/components/Breadcrumb/Breadcrumb.js` (+ `.module.css`, restyle + `aria-current`).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`, `PACKAGING_NOTES.md`. Confirm that prompts 01–24 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Rebuild the product page skeleton: a sticky media column (gallery arrives in Prompt 26) beside a scrolling content column organised as chapters, a purchase panel with every commerce control the current page has (variants if any, quantity, Add to Cart with states, Buy Now, wishlist, share, delivery/returns, farmer-owned note), a slim chapter index that appears after scrolling, and on mobile a swipeable media strip plus a sticky bottom purchase bar.

## Pre-flight checks

```bash
grep -n "isLegacyId\|navigate(\`/products\|recentlyViewed\|setPageTitle\|SILK_SPEC_LABELS\|deriveFabricCraft\|deriveKeyFeatures\|isPremiumProduct" src/pages/ProductDetails/ProductDetails.js | head -20
grep -n "handleAddToCart\|handleBuyNow\|toggleWishlist\|maxQuantity\|STOCK_UNKNOWN_MAX" src/pages/ProductDetails/ProductDetails.js | head
grep -n "anchorRef\|IntersectionObserver" src/components/storefront/AddToCartBar.js
```

## Tasks

1. **Resolution & side effects (keep verbatim, re-targeted)** — slug/legacy-id resolution with retry and canonical redirect to `/product/<slug>` (`productPath`), `NotFound` for missing/draft products, the `recentlyViewed` localStorage write (cap 20), `useCart`/`useWishlist`/`useStoreSettings`/`useFaqs` reads, variant auto-selection and price/stock/SKU following the selection (`VariantSelector` stays for products with variants), stock rules (`hasStockInfo`, `isOutOfStock`, `isLowStock`, `STOCK_UNKNOWN_MAX`, `maxQuantity` clamp), `handleAddToCart` (line id scheme, `{ openDrawer }`), `handleBuyNow` (add silently → `/checkout`), the "Added" flash, wishlist toggle. Replace the manual meta code with `useSeo({ title: product.metaTitle || product.name, description: product.metaDescription || product.promise, image: stageSrc(product,{w:1200,ar:"1:1"}), type: "product" })` (JSON-LD added in Prompt 27). Delete `SILK_SPEC_LABELS`, `deriveSilkSpecRows`, `deriveGenericSpecRows`, `deriveFabricCraft`, `deriveKeyFeatures`, `isPremiumProduct`, the tabs machinery and the promises band.
2. **Layout** — desktop (≥ 1025px): `.sf-container--wide` grid `minmax(0, 1.05fr) minmax(0, 1fr)` gap 56px; left column `position: sticky; top: 96px; align-self: start` holding the media area (`<MediaGalleryPlaceholder>` = `CloudinaryImage` primary on a 4:5 `.sf-plate` until Prompt 26 replaces it); right column: `PurchasePanel` then the chapters (`Chapter` = `<section id aria-labelledby className="sf-section--tight">` with a `SectionHeading as="h2"`); chapters in this prompt: `overview` (description via `ContentBlocks`, `suitableFor` line) only — Prompt 27 adds the rest. Tablet (769–1024): same two columns, gap 32px, media 44 %. Mobile (≤ 768): media strip first (full-width, 1:1 plate; Prompt 26 makes it swipeable), then the purchase panel, then chapters; `AddToCartBar` sticky at the bottom.
3. **`PurchasePanel`** — in order: `Breadcrumb` (Home / Shop / {category displayName} / {shortName}), category eyebrow (`displayName` link + ritual step "01 — Cleanse"), `h1` name (Fraunces `--sf-text-3xl`), `promise` (18px), rating summary (`SocialProof` restyled) **only when** `totalReviews > 0 || reviews.length > 0`, `Price product size="lg"` (+ compare-at + savings), size line (`size`, e.g. "200 ml") and `fragranceNote` as quiet 14px rows, trust badges (`TrustBadges` from `STOREFRONT_CONFIG.trustBadges`, glass chips), `VariantSelector` (only when variants exist), quantity row (`QuantityStepper` + stock status text: "In stock" / "Only N left" / "Out of stock"), CTA row: `Button variant="addToCart" size="lg"` (idle/loading/success; "Coming soon" disabled when TBA; "Out of stock" when 0) and `Button variant="primary" size="lg"` "Buy now" (hidden when TBA/out of stock), wishlist `Button variant="icon"` (`aria-pressed`), share `Button variant="icon"` (`navigator.share({ title, url })` with clipboard fallback + toast "Link copied"), `DeliveryReturnsInfo` (restyled; shipping methods/COD/returns/tax lines only when the underlying value is known — `estimatedDays` empty → row hidden; `returnsWindowDays` 0 → hidden; tax note from `fillCopy`), and the farmer-owned note: `LegalNote compact` + link "Read our story" → `/about`.
4. **`ChapterNav`** — a slim glass pill bar that appears after 320px of scroll (desktop: sticky under the header at `top: 72px` spanning the content column; mobile: sticky at `top: 56px`, horizontal scroll): links to every chapter id present (Overview, Benefits, Ingredients, How to use, Farmer story, Full ingredients, FAQs, Reviews, Complete the ritual — labels from the chapters actually rendered), active via IntersectionObserver, `aria-current`; hidden under 320px scroll and while a drawer is open.
5. **`AddToCartBar` (mobile sticky bar)** — restyle to glass strong: 56px plate thumbnail, name (1 line), `Price` (TBA-aware), `Button variant="addToCart"` ("Coming soon"/"Out of stock" states), optional Buy now icon button; shows once the panel's Add to Cart scrolls out (existing IntersectionObserver contract with `anchorRef`); `z-index: var(--sf-z-stickybar)`; `padding-bottom: env(safe-area-inset-bottom)`; `BottomNav` hides on `/product/*` at ≤ 768px so the bars never stack (record this decision).
6. **Video pause/perf** — nothing here (26).
7. **Old CSS** — rewrite the module: no tabs, no `.dark`, no promises band.

## Design and content specification

- Purchase panel: `GlassCard padding="lg"` on desktop; plain on mobile (no blur); name 40/32px; promise 18/16px; price 24px gold; CTAs 52px; icon buttons 44px glass circles; delivery rows 14px with gold glyphs.
- Chapter headings: eyebrow "Chapter 0N", title Fraunces 28px; chapter rhythm `--sf-section--tight` (60 % of `--sf-section-y`).
- ChapterNav: 40px pills, 13px, active gold with gradient underline.
- Copy: "Buy now", "Add to Cart", "Coming soon", "Out of stock", "Only N left", "In stock", "Share", "Link copied", "Read our story", "Overview".

## Data and API changes

None. (Reads `products.getBySlug/getById`, `categories.getById`, `shipping.getMethods` — existing.)

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm test -- --watchAll=false` and `npm run build` clean.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: the sticky bar must never cover the panel's own CTAs (it appears only when they are off-screen); no rating UI without reviews; keep the cart line-id scheme.

## Acceptance criteria

- [ ] `/product/black-rice-face-wash` renders the new layout; `/products/1` and `/product/1` redirect to the slug URL; a draft product → NotFound.
- [ ] Add to Cart (states), Buy now (→ checkout), quantity clamp, wishlist toggle, share (or copy) all work; TBA product shows "Coming soon" and no Buy now.
- [ ] ChapterNav appears after scroll and tracks the visible chapter; keyboard reachable.
- [ ] Mobile: media strip, panel, sticky bar (appears when the panel CTA leaves the viewport), bottom nav hidden on PDP.
- [ ] `document.title` = "{name} · LAMIKAA NATURALS"; meta description set; old manual meta code removed.
- [ ] `grep -n "SILK_SPEC\|Fabric\|weave\|handloom\|Tabs" src/pages/ProductDetails/ProductDetails.js` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "useSeo" src/pages/ProductDetails/ProductDetails.js
npm run dev   # /product/black-rice-face-wash, /product/black-rice-face-mist (TBA), /products/1
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440: sticky media column, panel wrapping, bar overlap, reduced motion.

## Handoff

1. `PROGRESS.md`: row 25 → `complete`; Decisions log: bottom nav hidden on PDP; share fallback.
2. `REPO_MAP.md` §6 "Updated by Prompt 25" (PDP skeleton, PurchasePanel, ChapterNav, AddToCartBar).
3. Commit: `feat(lamikaa): 25 pdp layout, chapters, purchase panel and mobile bar`.
