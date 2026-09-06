# Prompt 23 — Shop page: chaptered editorial listing

- **Phase:** 3 — Catalogue
- **Depends on:** 16, 22
- **Unlocks:** 24
- **Scope:** L
- **Expected files to change/create:** create `src/pages/Shop/Shop.js` (+ `Shop.module.css`), `src/components/catalogue/ChapterIndex.js` (+ `.module.css`), `src/components/catalogue/BuildRitualPanel.js` (+ `.module.css`); delete `src/pages/Products/Products.js` and `Products.module.css`; change `src/App.js` (`/shop` → `pages/Shop/Shop`), `src/components/catalogue/ProductChapter.js` (`variant="shop"`), `src/utils/categories.js` (remove listing-only helpers if unused: `orderCategoriesHierarchically`, `getCategoryScopeIds` — keep `getDescendantIds` for the admin).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–22 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Replace the filter-and-grid catalogue with `/shop`: a chaptered vertical scroll where every product is a full-height editorial section, a sticky right-rail index with a gradient progress indicator on desktop and a compact horizontal index on mobile, optional desktop scroll-snap, and a closing "Build your ritual" panel — no filters, no sort controls, no sidebar. `?concern=<slug>` constrains the set by routing.

## Pre-flight checks

```bash
grep -n "data-chapter\|variant" src/components/catalogue/ProductChapter.js | head
grep -rn "pages/Products/Products" src --include=*.js          # App.js only
grep -rn "orderCategoriesHierarchically\|getCategoryScopeIds" src --include=*.js | grep -v "utils/categories.js"   # consumers (expect only Products.js)
grep -n "getByConcern\|concerns: {" src/services/api.js
```

## Tasks

1. **`Shop` page** — props none; reads `useSearchParams().get("concern")`. Data: `apiService.products.getAll()` (visible) sorted by `heroOrder ?? 99`, then `name`; when `concern` is set use `apiService.products.getByConcern(slug)` → `{ concern, products }`. Head: `SectionHeading` eyebrow "The Black Rice range" (or `Shop by concern`), title "Shop" (or `For {concern.name}` with `gradientWord`), lede "{n} products · one ritual" (or "{n} products for {concern.name}"), `as="h1"`; a chip row of the 11 concerns (`Chip variant="concern"` with `active` for the current one, "All" first → `/shop`). Then one `ProductChapter variant="shop" index={i} total={n} id={`chapter-${p.slug}`}` per product with `flip` alternating; between chapters a `.sf-hairline`; after the last chapter `BuildRitualPanel`. States: loading → 3 skeleton chapters; error → glass panel with "Try again" (`fetchError` never masquerades as empty); empty (concern with no products) → "Nothing here yet" + concern chips + "All products".
2. **`ProductChapter variant="shop"`** — no `min-height` cap on mobile, `min-height: 88svh` on desktop, `scroll-margin-top: 96px`, `data-chapter={index}`, `data-slug`; emits its intersection state via a callback prop `onVisible(index)` (IntersectionObserver at `threshold: 0.5`) so the index can follow the scroll; otherwise identical to the home variant (numeral, step, name as `h2`, promise, description, ingredient chips, badges, price, **"Explore more"** and **"Add to Cart"**).
3. **`ChapterIndex`** — desktop (≥ 1025px): `position: sticky; top: 112px` in a 220px right rail (the page grid is `1fr 220px` with 48px gap; chapters occupy the first column): a `<nav aria-label="Products on this page">` with an `<ol>` of product buttons (`shortName`, 14px, `aria-current="true"` on the active one, gold, gradient dot marker), a vertical 2px gradient progress track whose fill = `(activeIndex + intraChapterProgress) / n` (compute intra-chapter progress from the chapter's `getBoundingClientRect` on scroll via `requestAnimationFrame`), and a "Back to top" ghost button; clicking scrolls to `#chapter-<slug>` (`scrollIntoView` smooth / auto under reduced motion) and moves focus to the chapter heading (`tabIndex=-1`). Mobile/tablet (≤ 1024px): a horizontal glass strip `position: sticky; top: 56px` (below the header; 36px pills with snap scrolling, active pill gold, auto-scrolls into view) — shows numerals + shortName, hides while a drawer is open.
4. **Scroll-snap (desktop only, optional)** — `scroll-snap-type: y proximity` on the chapter list container with `scroll-snap-align: start` on chapters, enabled only at ≥ 1025px and disabled under `prefers-reduced-motion`; verify it never traps the user (proximity, not mandatory). If it fights the sticky rail in testing, drop it and record the decision.
5. **`BuildRitualPanel`** — `GlassCard strong glow="duo"` full-width: eyebrow "Finish the ritual", title "Build your ritual" (`gradientWord` "ritual"), lede "Three routines that put the range in order.", three `RitualCard compact`, CTA `Button variant="primary"` "See all rituals" → `/rituals`.
6. **Delete** `src/pages/Products/*`; update `App.js`; remove listing-only helpers from `src/utils/categories.js` if no consumer remains (`grep`); remove `getDeviceType` from helpers if unused.
7. **SEO** — `useSeo({ title: concern ? `Shop · ${concern.name}` : "Shop", description: "Eight Black Rice skincare products from a farmer-owned brand. Cleanse, refresh, treat and moisturise." , jsonLd: itemListJsonLd(products) })` with `ItemList` of `Product` URLs.

## Design and content specification

- Desktop: page grid `minmax(0,1fr) 220px`; chapters `88svh` min, glass text panel, sticky media at 112px; rail typography 14px; progress track `--sf-color-surface-2` with gradient fill; hairlines between chapters.
- 1024: rail hidden, horizontal index strip; chapters `min-height` unset; 768 and below: media-first stack, index strip 48px with pills.
- Copy: "The Black Rice range", "Shop", "{n} products · one ritual", "All", "For {concern}", "Explore more", "Add to Cart", "Finish the ritual", "Build your ritual", "See all rituals", "Nothing here yet", "Try again", "Back to top".
- Motion: chapter reveal, rail marker slide 160 ms; reduced motion → none.

## Data and API changes

Reads only (`products.getAll`, `products.getByConcern`, `concerns.getAll`, `rituals.getAll`). No filters/sort → no URL params other than `concern`. Admin unchanged.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: **no filter, sort or pagination UI** — this removal is an explicit owner decision (brief §7.3) and is recorded as such in `PROGRESS.md`; search remains available through the overlay/results page; chapters use solid surfaces on mobile (blur budget).

## Acceptance criteria

- [ ] `/shop` lists all eight products as chapters in hero order with working CTAs; `/shop?concern=hydration` lists the three hydration products with the concern chip active.
- [ ] Desktop rail follows the scroll (active name + progress), jumps on click; mobile strip follows and scrolls its active pill into view.
- [ ] Keyboard: rail buttons focusable; after a jump focus lands on the chapter heading; Escape does nothing harmful.
- [ ] Loading/error/empty states render as specified.
- [ ] `src/pages/Products` deleted; `grep -rn "FABRIC_FAMILIES\|All Silk\|Nothing woven" src` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
test ! -d src/pages/Products && echo "old listing removed"
grep -n "pages/Shop/Shop" src/App.js
npm run dev   # /shop, /shop?concern=hydration, /shop?concern=nope (empty state)
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440: rail/strip behaviour, snap feel on desktop, no horizontal scroll, reduced motion.

## Handoff

1. `PROGRESS.md`: row 23 → `complete`; Decisions log: "filters/sort removed per brief §7.3", scroll-snap decision.
2. `REPO_MAP.md` §6 "Updated by Prompt 23" (Shop, ChapterIndex, BuildRitualPanel; Products removed).
3. Commit: `feat(lamikaa): 23 shop page chaptered editorial listing`.
