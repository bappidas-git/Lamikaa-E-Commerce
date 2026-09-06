# Prompt 15 — Trust strip, shop-by-category/concern and the shared product card

- **Phase:** 2 — Home page
- **Depends on:** 14
- **Unlocks:** 16
- **Scope:** M
- **Expected files to change/create:** rewrite `src/components/TrustStrip/TrustStrip.js` and `TrustStrip.module.css`; create `src/components/home/ShopByCategory.js` (+ `.module.css`), `src/components/catalogue/CategoryCard.js` (+ `.module.css`); rewrite `src/components/storefront/ProductCard.js` and `ProductCard.module.css`; change `src/pages/Home/Home.js` (mount the two sections under the hero), `src/theme/tokens.js` (`TRUST_BADGE_CATALOG` + `STOREFRONT_CONFIG.trustBadges`).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–14 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Add the slim glass trust strip on the hero's bottom edge and the "Shop by category / concern" section (seven glass category cards with product thumbnails and counts plus a concern chip row), and rebuild the shared `ProductCard` into the LAMIKAA glass label card used by search, wishlist, related rails and offers.

## Pre-flight checks

```bash
grep -n "TRUST_ITEMS\|Authentic" src/components/TrustStrip/TrustStrip.js
grep -n "trustBadges\|TRUST_BADGE_CATALOG" src/theme/tokens.js
grep -rn "storefront/ProductCard\|from \"../../components/storefront\"" src --include=*.js | cut -d: -f1 | sort -u   # consumers: Home, Products, Wishlist, RelatedProducts, Search, SpecialOffers(local copy)
grep -n "firstProductForCategory" src/utils/catalogue.js
```

## Tasks

1. **`TrustStrip`** — items from config: `brand.trustBadges` ("Farmer to Consumer", "100% Organic", "Result Oriented") plus a fourth fixed item "Rooted in Assam & Northeast India"; icons `mdi:sprout-outline`, `mdi:leaf`, `mdi:star-four-points-outline`, `mdi:map-marker-outline`; `.sf-glass` band (no blur ≤ 768px), 56px tall, items centred with gold icons, Manrope 600 13px; `<ul aria-label="Our promises">`; mobile: horizontal scroll with snap and edge fades, no wrapping. Placed by `Home.js` as the hero's bottom edge (negative top margin of 28px on desktop so it overlaps the hero's ground; plain stack on mobile). `STOREFRONT_CONFIG.trustBadges` (used by the PDP `TrustBadges`) becomes `["farmerOwned", "organic", "resultOriented", "securePayment"]` with the catalogue entries `farmerOwned: { icon: "sprout", label: "Farmer to Consumer" }`, `organic: { icon: "leaf", label: "100% Organic" }`, `resultOriented: { icon: "spark", label: "Result Oriented" }` added to `TRUST_BADGE_CATALOG` (labels read from `brand.trustBadges[i]` so wording stays configurable); `easyReturns` keeps its `dynamic: "returns"` rule; `TrustBadges.js` gains the three new icon paths.
2. **`CategoryCard`** — `GlassCard interactive glow="violet"` (glow on hover only): 1:1 `.sf-plate` with `stageSrc(firstProductForCategory(products, cat), { w: 480 })` (contain), `displayName` Fraunces 22px, description one line, count chip "N products" (from `categoryIds` membership; Rituals → "3 rituals"), whole card is one `Link` (`categoryPath`), `aria-label="{displayName}, N products"`. Hover: 4px lift, border strong, glow .2.
3. **`ShopByCategory` section** — `SectionHeading` eyebrow "Shop by category", title "Find your step" (`gradientWord` on "step"), lede "Seven ways into the Black Rice range."; grid of the seven cards: 1280 → 4 + 3 (second row centred via `grid-template-columns: repeat(4, 1fr)` and `grid-column` spans), 1024 → 3 columns, 768 → 2, ≤ 480 → horizontal snap scroll of 76vw cards (no vertical stacking of seven cards on a phone). Below: eyebrow "Shop by concern" and the 11 concern chips (`Chip variant="concern" as={Link}` → `concernPath`), wrapping. Data: `categories.getAll`, `concerns.getAll`, `products.getAll` (for thumbnails/counts) — one `Promise.all`, skeletons while loading, section hidden entirely on error/empty.
4. **`ProductCard` (shared)** — keep the **prop contract** (`product, onAddToCart, onToggleWishlist, isWishlisted, showAddToCart`) and the DOM order (media → body → action last). New look: `GlassCard interactive glow="pink"`; media = `.sf-plate` 1:1 with the label crop (`stageSrc(p,{ w: 640 })`, `sizes` per grid), eyebrow row = ritual step (`01 · Cleanse`) + concern chips (max 2), name (Fraunces 20px, `Link`), `promise` (2 lines clamp), badges row (`Chip variant="trust"` × `p.badges`, 11px), `Price product={p}`, rating row **only when `totalReviews > 0`** (else nothing — not even "No ratings yet"), wishlist heart (44px glass circle, `aria-pressed`), action = `Button variant="addToCart" block` ("Add to Cart" / "Coming soon" when TBA / "Out of stock" when `stock === 0`); on fine pointers the action reveals on hover/focus-within over the plate foot (existing technique), on touch it stays in flow. Remove `isPremium/bridal`, PREMIUM ribbon, `truncateText(…,48)`, discount badge stays (real `comparePrice` only). Every consumer keeps working unchanged.
5. **`RelatedProducts`/`FrequentlyBoughtTogether`/`Wishlist`/`Search`** — no code change expected beyond the card; verify they render.
6. **Home wiring** — `Home.js`: under `<HeroCarousel/>` render `<TrustStrip/>` then `<ShopByCategory/>` (the remaining old sections stay until Prompt 22).

## Design and content specification

- Trust strip: glass 6 %, hairline top/bottom, gold icons 20px, text 13px; mobile 48px tall scrolling.
- Category cards: 1:1 plate, 16px padding, radius `--sf-radius-lg`; grid gaps 24px (16px mobile); section `--sf-section-y`.
- Product card: 16px padding, plate 1:1, name 20px, promise 14px secondary, price gold 16px, badges 11px outlined gold hairline chips; hover lift 4px + glow .2; focus ring on links/buttons.
- Copy: "Shop by category", "Find your step", "Seven ways into the Black Rice range.", "Shop by concern", "N products", "3 rituals", "Add to Cart", "Coming soon", "Out of stock".

## Data and API changes

Reads only. No admin change.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: badges come from `product.badges`/`brand.trustBadges` — never string literals in components; no rating UI without real reviews; keep the card's prop contract.

## Acceptance criteria

- [ ] Trust strip shows the four promises from config on the hero's edge, scrolls on mobile.
- [ ] Seven category cards with real thumbnails and counts link to the category routes (Rituals → `/rituals`); concern chips link to `/shop?concern=…`.
- [ ] `ProductCard` renders the label plate, badges, price/TBA/out-of-stock states in Search, Wishlist and Related rails without console errors; heart and add-to-cart still call the passed handlers.
- [ ] `grep -rn "bridal\|Premium\|No ratings yet" src/components/storefront/ProductCard.js` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "Authentic Silk\|Handwoven" src/components/TrustStrip/TrustStrip.js src/theme/tokens.js | wc -l   # 0
npm run dev   # /, /search?q=black, /wishlist (add two products), a PDP's related rail
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440: strip overlap on desktop, card grid columns per breakpoint, mobile snap scroll, hover/focus reveal of the add button, reduced motion.

## Handoff

1. `PROGRESS.md`: row 15 → `complete`; Decisions log: fourth trust item wording, card hover-reveal rule.
2. `REPO_MAP.md` §5 "Updated by Prompt 15".
3. Commit: `feat(lamikaa): 15 trust strip, shop by category and product card`.
