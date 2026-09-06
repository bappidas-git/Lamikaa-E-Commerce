# Prompt 33 — Admin product form: media manager and new fields

- **Phase:** 5 — Admin
- **Depends on:** 26, 32
- **Unlocks:** 34
- **Scope:** L
- **Expected files to change/create:** change `src/pages/Admin/AdminProducts.js`; create `src/pages/Admin/components/MediaManager.js`, `src/pages/Admin/components/ListEditor.js`, `src/pages/Admin/components/KeyValueListEditor.js`, `src/pages/Admin/components/ProductFormSections.js`; change `src/utils/product.js` (`validateMedia`), `src/services/api.js` (no contract change; verify `syncProductMedia` on save).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–32 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Replace the one-URL-per-line image textarea with a media manager for image links and video links (add / remove / reorder / preview / validate / primary), and add every new product field the storefront reads — persisted as `product.media` and the new keys through the existing api layer in both modes.

## Pre-flight checks

```bash
grep -n "const emptyProduct\|imageInput\|tagsInput\|handleSave\|makeUniqueSlug\|clampNum" src/pages/Admin/AdminProducts.js | head -20
grep -n "syncProductMedia\|normalizeProduct" src/services/api.js | head
grep -n "getConcerns\|getCategories" src/services/api.js | head -3
```

## Tasks

1. **`emptyProduct`** — extend with `shortName: ""`, `categoryIds: []`, `concerns: []`, `ritualStep: { order: 1, label: "", frequency: "" }`, `heroHeadline: ""`, `heroSubtext: ""`, `heroOrder: null`, `promise: ""`, `benefits: []`, `keyIngredients: []`, `howToUse: []`, `ingredientsList: ""`, `packClaims: []`, `fragranceNote: ""`, `caution: ""`, `suitableFor: []`, `size: ""`, `priceTBA: false`, `priceSource: ""`, `badges: [...brand.trustBadges]`, `media: []`, `faqs: []`, `isNew: false`, `currency: "INR"`; keep every existing key. Edit hydration maps a stored product through `normalizeProduct` first (so legacy `images[]` rows appear in the manager).
2. **`MediaManager`** — props `{ value: media[], onChange, productName }`. Two ordered lists:
   - **Image links**: rows `{ type: "image", url, alt, primary, crop? }` — URL `TextField` (required, `https?://`), alt `TextField` (default "{productName} — image N"), "Primary" `Radio` (exactly one), optional "Advanced: stage crop" disclosure with `x, y, w, h` numbers (Cloudinary pixels) shown only for Cloudinary URLs, live 64px thumbnail (`img` with `onError` → "Invalid image URL" error), a "Placeholder" `Chip` when `row.placeholder`.
   - **Video links**: rows `{ type: "video", url, poster, title }` — URL (required; `.mp4`/`.webm`/`.mov` or any `https://` — validate reachability only by the preview: `<video preload="metadata">` `onLoadedMetadata` ✓ / `onError` "Video could not be loaded"), poster URL (optional; defaults to the primary image at save), title (default "Video N"), live preview (poster thumbnail with a play badge).
   - Add buttons ("Add image link", "Add video link"), remove (confirm only when the row is the primary), reorder with up/down `IconButton`s **and** HTML5 drag handles (`draggable`, keyboard fallback via the buttons), inline errors per row, a summary line "3 images · 2 videos · primary: #1".
   - `validateMedia(media)` in `src/utils/product.js` → `{ ok, errors: { [rowIndex]: message } }`: at least one image, exactly one primary, valid URLs, no duplicates.
3. **New form sections** (`ProductFormSections.js`, MUI, in this order): Basic (name, shortName, slug, SKU, brand, primary category `Select`, categories `Autocomplete multiple` from `admin.getCategories()` (product kind only; primary must be included — auto-add), concerns `Autocomplete multiple` from `admin.getConcerns()`), Story (promise, shortDescription, description, heroHeadline, heroSubtext, heroOrder number 1–99 with helper "Blank = not in the home hero", ritualStep order/label/frequency), Pricing (price with a **"Price to be announced"** `Switch` that disables the field and stores `price: null, priceTBA: true`; `priceSource` text; comparePrice; costPrice), Inventory & shipping (stock, lowStockThreshold, size text e.g. "200 ml", shipping weight, dimensions), Details (benefits `ListEditor`, keyIngredients `KeyValueListEditor` name/benefit, howToUse `ListEditor` ordered, ingredientsList textarea, packClaims `ListEditor`, fragranceNote, caution, suitableFor `ListEditor`, badges `ListEditor` with "Reset to brand defaults"), FAQs (`KeyValueListEditor` q/a), Media (`MediaManager`), Variants (existing editor, placeholder "e.g. 100 ml"), Visibility & flags (isActive, featured, isNew, trending, hot), SEO (metaTitle, metaDescription). Tags stay comma-separated. Sections as collapsible `Accordion`s (MUI) with the first open.
4. **Validation (`handleSave`)** — existing rules plus: `priceTBA || price > 0 || variants.length`; `validateMedia` ok; `categoryIds` includes `categoryId`; `heroOrder` unique across products (query the current list; error "Hero position N is already used by {name}"); `slug` unique (existing). On save: `syncProductMedia(form)` then `admin.createProduct/updateProduct` (which also syncs — belt and braces); reload the table; toast.
5. **Table** — add filter chips "Hero", "Price on launch", "Drafts"; keep search/category select; row shows media counts (from 32).
6. **Both modes** — mock: verify `db.json` receives `media[]` + derived `images[]`; live: the payload is the same object (documented in Prompt 07's contract).
7. **Storefront check** — after editing media on a product (add an image link, reorder, change primary, add a video link), the PDP gallery, cards, hero and cart thumbnails reflect it after refresh.

## Design and content specification

MUI admin density (Prompt 32 palette): rows 56px, thumbnails 64px, drag handle 24px, error text 12px `error.main`; helper texts as listed; buttons small; sections accordions with counts in their headers ("Media (5)").

## Data and API changes

Persists the full product schema (`PRODUCTS.md` §6) through `admin.createProduct/updateProduct` in both modes; no new endpoints.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: no file upload (links only, per the brief); never save a product with zero images or no primary; the form must load the eight seeded products without data loss (round-trip test: open → save without changes → `db.json` diff is only `updatedAt`).

## Acceptance criteria

- [ ] Media manager: add/remove/reorder/primary/preview/validate for images and videos; errors block save; drag and keyboard reorder both work.
- [ ] All new fields save and reload; "Price to be announced" round-trips; hero position uniqueness enforced.
- [ ] Round-trip on every seeded product changes only `updatedAt`.
- [ ] Storefront reflects media edits (PDP gallery order/primary/video).
- [ ] `grep -n "Image URLs (one per line)" src/pages/Admin/AdminProducts.js` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass (add `validateMedia` cases to `product.test.js`).

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
npm run dev   # admin round-trip; then: node -e "const p=require('./db.json').products[0]; console.log(p.media.length, p.images[0]===p.media.find(m=>m.primary).url)"
```

Manual QA of the form at 360 / 768 / 1280 (dialog full-screen on mobile; every control reachable).

## Handoff

1. `PROGRESS.md`: row 33 → `complete`; Decisions log: drag implementation, crop fields exposure.
2. `REPO_MAP.md` §7 "Updated by Prompt 33".
3. Commit: `feat(lamikaa): 33 admin product form media manager and new fields`.
