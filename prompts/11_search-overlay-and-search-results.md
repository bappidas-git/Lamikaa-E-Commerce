# Prompt 11 — Search overlay and search results

- **Phase:** 1 — Storefront shell
- **Depends on:** 10
- **Unlocks:** 12
- **Scope:** M
- **Expected files to change/create:** rewrite `src/components/SearchModal/SearchModal.js` and `SearchModal.module.css` (keep `index.js`); create `src/utils/search.js`, `src/pages/Search/Search.js` (+ `.module.css`); change `src/App.js` (`/search` → `pages/Search/Search`), `src/components/ui/Modal.js` (add `size="full"`), `src/pages/_ComingSoon/ComingSoon.js` (no change; one fewer usage).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–10 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Turn the search modal into a full-screen glass overlay with instant, ranked results over the LAMIKAA product fields, popular-search chips from brand config, session-only recent searches and full keyboard navigation — and give `/search?q=` a real results page.

## Pre-flight checks

```bash
grep -n "POPULAR_SEARCHES\|TRENDING\|scoreProduct\|loadSearchData\|recent" src/components/SearchModal/SearchModal.js | head -20
grep -n "search: {" src/config/brand.js
grep -n "/search" src/App.js src/components/routing/LegacyRedirects.js
```

## Tasks

1. **`src/utils/search.js`** — `normalize(str)` (lowercase, strip diacritics/punctuation), `tokenize`, and `rankProducts(products, query)` → sorted array of `{ product, score, matchedOn }`: weights name 10 (prefix 14), shortName 10, tags 6, concerns 6, keyIngredients names 5, benefits 4, promise 3, description 2, category display names 4 (pass `categories` optionally); phrase match bonus; `priceTBA` products rank after known-price ties; returns `[]` for an empty query. Unit test (`src/utils/search.test.js`, 5 cases: "serum", "black rice", "hydration", "goat", nonsense).
2. **Catalogue cache** — keep the module-level `loadSearchData()` pattern (products via `apiService.products.getAll()`, categories, plus `apiService.concerns.getAll()`), refreshed when the tab regains focus (existing behaviour).
3. **`SearchModal` on `Modal size="full"`** — add the `full` size to the primitive (100svw × 100svh, no border radius, `.sf-glass--strong` over the overlay scrim, `padding-top: env(safe-area-inset-top)`). Layout: top row = search field (52px, glass, gold focus ring, `role="search"` form, `aria-label="Search products"`, autofocus on open, clear button) + close (44px); below, when the query is empty: "Popular searches" chips from `brand.search.popular` (`Chip variant="glass" as="button"`), "Recent" chips from `sessionStorage["lk-recent-searches"]` (max 6, with a "Clear" text button), and "Shop by category" chips (7); when the query has ≥ 1 character: a live count line (`role="status" aria-live="polite"`: "3 results for “serum”") and a result list.
4. **Results list** — `<ul role="list">` of `Link` rows (≥ 64px): 56px `.sf-plate` thumbnail (`stageSrc(p, { w: 112 })`), name (Manrope 600), `promise` one line, `Price product={p}` (or "Price on launch"), and a 40px `Button variant="icon"` "Add to cart" (`mdi:cart-plus`, disabled + `srLabel="Coming soon"` when `priceTBA`; on add: `addToCart(buildCartItem(p), 1, { openDrawer: false })` + the existing toast, overlay stays open). Rows are highlighted with `data-active` via ↑/↓ (roving `tabIndex`), Enter opens the active row, Escape closes; on Enter in the field with no active row → navigate to `/search?q=…` and save the query to recent. Limit the overlay list to 8 rows plus a "See all N results" link to `/search?q=`.
5. **Empty result** — "Nothing matched “…”. Try one of these:" + popular chips + "Browse all products" → `/shop`. No product names invented; no silk copy anywhere (delete the `POPULAR_SEARCHES`/`TRENDING_TERMS` constants and the "Try another weave…" copy).
6. **`/search` page** (`src/pages/Search/Search.js`) — reads `?q=`; `useSeo({ title: q ? `Search: ${q}` : "Search", noindex: true })`; `SectionHeading` eyebrow "Search", title "Results for “{q}”" (or "Search"), lede with the count; results as a responsive grid of the shared `ProductCard` (Prompt 15 restyles it; until then the current card) 1 / 2 / 3 / 4 columns at 360 / 640 / 1024 / 1280; empty state as in Task 5; a search field at the top that submits to the same page. Replace the `ComingSoon` stub in `App.js`.
7. **Header/BottomNav** — no change needed (they open the modal). Verify `Header` passes `open/onClose` unchanged.
8. **Old code** — remove the internal category "descendant slug" logic (categories are flat now) and the trending rail (no `trending` products exist; keep the API call out).

## Design and content specification

- Overlay: field 52px glass with a gold 2px bottom hairline when focused (no boxy border), 20px padding; chips 36px; result rows 72px on desktop / 64px on mobile; thumbnails on `.sf-plate`; max content width 880px centred; keyboard hints line ("↑ ↓ to move · Enter to open · Esc to close") on desktop only.
- 360–768: full-screen, single column; 1024+: two-column empty state (popular + recent | categories).
- Motion: overlay fade 320 ms, list rows stagger via `reveal()`; reduced motion → none.
- Copy: "Search products", "Popular searches", "Recent", "Shop by category", "See all N results", "Nothing matched “{q}”", "Browse all products".

## Data and API changes

Reads only (`products.getAll`, `categories.getAll`, `concerns.getAll`). Live mode note: the `/search` page and overlay rank client-side from `getAll()`; a future server search endpoint is optional and documented in `REPO_MAP.md` §3 (Prompt 07).

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: recent searches in `sessionStorage` only; no `localStorage`; the overlay must not render two blurred layers (it replaces the header's blur while open — `body[data-drawer-open]` semantics apply: have `Modal` set the same attribute).

## Acceptance criteria

- [ ] Typing "serum" lists the Face Serum first; "hydration" lists Mist/Gel/Body Wash; "goat" lists the soap; nonsense shows the empty state.
- [ ] ↑/↓/Enter/Escape work; focus returns to the trigger on close; screen reader hears the result count.
- [ ] Popular chips come from `brand.search.popular`; recent chips persist within the tab and not in a new tab.
- [ ] `/search?q=serum` renders the results page with SEO `noindex`; `/products?search=x` redirects to it.
- [ ] Quick add works for priced products and is disabled for `priceTBA` ones.
- [ ] `grep -rn "Muga\|Mekhela\|Eri \|Pat silk\|weave" src/components/SearchModal src/pages/Search` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass (search tests included).

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -rn "sessionStorage" src/components/SearchModal | head -3
grep -rn "ComingSoon" src/App.js | grep -i search | wc -l   # 0
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280: overlay layout, virtual keyboard does not hide the field (iOS emulation), result rows tappable, `/search` grid columns, reduced motion.

## Handoff

1. `PROGRESS.md`: row 11 → `complete`; Open TODOs: remove "/search stub" entry.
2. `REPO_MAP.md` §5/§6 "Updated by Prompt 11".
3. Commit: `feat(lamikaa): 11 search overlay and search results`.
