# Prompt 16 — Home product showcase sections

- **Phase:** 2 — Home page
- **Depends on:** 15
- **Unlocks:** 17, 23
- **Scope:** L
- **Expected files to change/create:** create `src/components/catalogue/ProductChapter.js` (+ `ProductChapter.module.css`), `src/components/home/ProductShowcase.js` (+ `.module.css`); change `src/pages/Home/Home.js` (mount `ProductShowcase` after `ShopByCategory`).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`, `PACKAGING_NOTES.md`. Confirm that prompts 01–15 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Give every product its own full editorial section on the home page — alternating split-screen chapters with a sticky label card on desktop and image-first stacking on mobile — each carrying the chapter number and ritual step, name, promise, description, key-ingredient chips, the three trust badges, the price and the two CTAs ("Explore more", "Add to Cart"); the same `ProductChapter` component powers the shop page in Prompt 23.

## Pre-flight checks

```bash
grep -n "ShopByCategory\|HeroCarousel\|TrustStrip" src/pages/Home/Home.js
node -e "const db=require('./db.json'); console.log(db.products.map(p=>`${p.heroOrder}. ${p.shortName} — ${p.ritualStep.order} ${p.ritualStep.label} — ${p.keyIngredients.length} ingredients`).join('\n'))"
grep -n "export function reveal\|export const reveal" src/theme/motion.js
```

## Tasks

1. **`ProductChapter`** — props `{ product, index, total, variant: "home" | "shop", flip: boolean, id }`. Renders `<section id={id} aria-labelledby=… className="sf-section">` with a two-column grid on desktop (`1fr 1fr`, 64px gap; `flip` swaps columns) and a single column on mobile (media first).
   - **Media column**: `GlowWrap tone={index % 2 ? "violet" : "pink"} intensity={0.2}` → `.sf-plate` 4:5 (`stageSrc(p, { w: 900, ar: "4:5" })`, `CloudinaryImage sizes="(max-width: 768px) 92vw, 44vw"`, lazy). On desktop the media column is `position: sticky; top: 112px` inside the section so the text scrolls beside it ("scrollytelling" within the chapter); the section has `min-height: 80svh` on desktop (`80vh` fallback), none on mobile.
   - **Text column**: chapter numeral row — `Chip variant="step"` with `String(index+1).padStart(2,"0")` + eyebrow `{ritualStep.order} — {ritualStep.label}` (e.g. "01 — Cleanse"; for body products "Body 01 — Body cleanse"), then `h2` name (Fraunces `--sf-text-3xl`), promise (Manrope 18px), description (2–3 lines, 16px secondary, `max-width: 52ch`), key ingredients (eyebrow "Key ingredients" + `Chip variant="glass"` × `keyIngredients[].name`, max 5), trust badges (`Chip variant="trust"` × `badges`), `fragranceNote` as a quiet 13px line when present, `Price product size="lg"`, CTA row: `Button variant="secondary"` **"Explore more"** → `productPath(p)` and `Button variant="addToCart"` **"Add to Cart"** (quick add via `useCart().addToCart(buildCartItem(p),1)`, disabled "Coming soon" when TBA, "Out of stock" when `stock === 0`). The text column is wrapped in a `GlassCard padding="lg"` (glass panel) on desktop; on mobile the panel loses its blur (`.sf-glass` ≤ 768 = solid surface) to respect the blur budget in long lists.
   - **Motion**: `reveal(reduce, { inView: true })` on the text panel and a slower fade on the media; no parallax; reduced motion → static.
   - `variant="shop"` differences are defined in Prompt 23 (index rail hooks, `data-chapter` attribute, no `min-height` cap); implement the attribute now: `data-chapter={index}`.
2. **`ProductShowcase`** — loads `apiService.products.getHeroProducts()` (fallback `getAll()` sorted by `heroOrder ?? 99`, visible only); renders `SectionHeading` (eyebrow "The Black Rice range", title "Eight steps. One ritual." with `gradientWord` on "ritual", lede "Every product carries a bigger purpose — beauty that creates value for farmers." from `BRAND.md` 3.1) once, then a `ProductChapter` per product with `flip={i % 2 === 1}`, `id={`product-${p.slug}`}`, `variant="home"`; a hairline between chapters; skeleton chapters (2) while loading; nothing on error.
3. **Home wiring** — mount `<ProductShowcase/>` after `<ShopByCategory/>` in `Home.js`; old sections still follow (removed in 22).
4. **Images** — verify each product's `stageSrc` crop visually here (this is the first place all eight crops are large): adjust `media[0].crop` values in `db.json` where text is clipped or white canvas shows (soap, body wash), and record the final rectangles in `PACKAGING_NOTES.md` §2 and `PRODUCTS.md` §2.

## Design and content specification

- Desktop 1280/1440: chapter grid `1fr 1fr` gap 64px inside `.sf-container`; media sticky at 112px (below the header + announcement); text panel glass, padding 40px, radius `--sf-radius-xl`; numeral chip 36px with gradient ring; name 40px; CTAs 48px pills side by side (wrap on narrow).
- 1024: gap 40px, media 42 %; 768: single column, media 92vw 4:5 first, panel solid surface; 360–414: numerals 28px, name `--sf-text-2xl`, CTAs stacked full width.
- Rhythm: `--sf-section-y` per chapter; total page length is expected (~8 × 80svh on desktop); an "index" of chapters is not part of the home page (that is the shop page's rail in Prompt 23).
- Copy: field-driven (`PRODUCTS.md` §5 seeded in `db.json`) — do not hard-code any product text.

## Data and API changes

Reads only. Crop rectangle corrections in `db.json` (data, both modes) are allowed and must be recorded.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: exactly one `h2` per chapter; badges from data; no blur on mobile chapters; images lazy except none (the hero owns eager loading).

## Acceptance criteria

- [ ] Eight chapters in hero order, alternating sides on desktop, image-first on mobile, each with numeral, step, name, promise, description, ingredient chips, badges, price/TBA, and both CTAs working.
- [ ] Sticky media behaves on desktop (image stays in view while its text scrolls) and does not stick on mobile.
- [ ] Quick add opens the drawer with a toast; TBA products show "Coming soon".
- [ ] Every label crop is verified (no clipped text, no white canvas); corrections recorded.
- [ ] Lighthouse mobile on `/`: no CLS from chapter images (aspect ratios reserved); images lazy.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "ProductShowcase" src/pages/Home/Home.js
npm run dev   # scroll the whole home at 1280 and 390; DevTools → Rendering → Layout Shift Regions
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440: sticky behaviour, panel readability over the ground, chip wrapping, CTA wrapping, keyboard reach of both CTAs per chapter, reduced motion.

## Handoff

1. `PROGRESS.md`: row 16 → `complete`; Decisions log: crop corrections (per product), min-height choice.
2. `PACKAGING_NOTES.md` §2 + `PRODUCTS.md` §2: final `stageCrop` values; `REPO_MAP.md` §5 "Updated by Prompt 16" (ProductChapter contract).
3. Commit: `feat(lamikaa): 16 home product showcase sections`.
