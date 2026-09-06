# Prompt 07 — api.js contract extension in both modes

- **Phase:** 0 — Foundations
- **Depends on:** 05, 06
- **Unlocks:** 08
- **Scope:** L
- **Expected files to change/create:** `src/services/api.js`, `src/services/baseURL.js` (comments only), `src/utils/heroConfig.js`, `src/context/FaqContext.js` (no change expected; verify), `src/components/HeroSection/HeroSection.js` (temporary compatibility read), `src/pages/Admin/AdminHeroSection.js` (temporary compatibility: read `announcements` instead of `banners` so the screen does not crash; the real rework is Prompt 34), `prompts/_reference/REPO_MAP.md` (§3 rewritten as the final contract).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–06 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Extend `src/services/api.js` so every new capability (product media, hero products, category-by-slug, concerns, rituals, grouped FAQs, siteContent, announcements, sample-review gating, related products over `categoryIds`) works identically in JSON Server mode and in the Laravel branch, with backward-compatible signatures for every existing consumer, and document the final contract.

## Pre-flight checks

```bash
grep -n "^  [a-z]*: {$" src/services/api.js          # namespaces: auth, products, categories, banners, hero, cart, orders, wallet, reviews, returns, coupons, wishlist, shipping, settings, faqs, deals, leads, admin
grep -n "banners\|Banner" src/services/api.js | wc -l
grep -rn "apiService.banners\|admin.getBanners\|admin.createBanner\|admin.updateBanner\|admin.deleteBanner\|admin.reorderBanners" src --include=*.js
grep -n "export const normalizeProduct\|export const syncProductMedia" src/utils/product.js
```

## Tasks

1. **Read-side normalisation.** Import `normalizeProduct` from `../utils/product` and apply it in `products.getAll`, `getById`, `getBySlug`, `getFeatured`, `getTrending`, `getByCategory`, `search`, `getRelated`, `getFrequentlyBoughtTogether` and in `admin.getProducts/getProduct` (map over arrays; single objects too), so every consumer receives `media[]`, `images[]`, `categoryIds[]`, `priceTBA` etc. regardless of what the backend stored.
2. **Write-side sync.** In `admin.createProduct` and `admin.updateProduct` run `syncProductMedia(productData)` before sending so `images[]`/`image` are always derived from `media[]` in **both** branches (the Laravel branch also derives server-side; sending both is harmless).
3. **Products — new functions** (mock path → live path):
   - `getHeroProducts()` → mock: `GET /products`, filter `isVisibleProduct && heroOrder != null`, sort by `heroOrder`; live: `GET /products/hero`. Returns normalised products.
   - `getByCategorySlug(slug)` → mock: `categories.getBySlug(slug)` then `GET /products` filtered by `categoryIds.includes(id) || categoryId === id` (visible only), ordered by `heroOrder` then `name`; live: `GET /products/category/slug/:slug`. Returns `{ category, products }`.
   - `getByConcern(slug)` → mock: filter `concerns.includes(slug)`; live: `GET /products?concern=:slug`. Returns `{ concern, products }` (concern resolved via `concerns.getAll()`).
   - `getRelated(product, limit)` → tier 2 becomes "shares any id in `categoryIds`" (fallback to `categoryId`); tier 3 unchanged (tags/brand); never returns `priceTBA` products first (stable-sort known-price first).
   - `getReviews(productId, { includeSample = brand.flags.showSampleReviews } = {})` → mock: `GET /reviews?productId&status=approved` then drop `isSample` rows unless `includeSample`; live: `GET /products/:id/reviews?includeSample=0|1`.
   - `search(query)` unchanged in signature; mock keeps json-server `?q=`; add client-side ranking in the caller (Prompt 11). Document that the live endpoint must search `name, shortName, tags, concerns, keyIngredients[].name, benefits, description`.
4. **New namespaces** (public reads):
   - `concerns.getAll()` → `GET /concerns` (both), sorted by `order`.
   - `rituals.getAll()` → mock `GET /rituals` (active, by `sortOrder`); live `GET /rituals`. `rituals.getBySlug(slug)` → mock `GET /rituals?slug=`; live `GET /rituals/slug/:slug`. `rituals.resolveSteps(ritual, products)` (pure helper, exported) → steps with `product`/`alternativeProduct` objects attached.
   - `siteContent.get(key?)` → mock `GET /siteContent` (return `[key]` when given); live `GET /content` / `GET /content/:key`. Never throws (returns `{}`/`null`).
   - `announcements.getAll()` → mock `GET /announcements` (active, within `startsAt/endsAt` when set, by `sortOrder`); live `GET /announcements`. Never throws (`[]`).
   - Remove the `banners` namespace.
   - `hero.getConfig()` unchanged (mock `/heroConfig`, live `/hero/config`).
   - `faqs.getAll()` unchanged; `src/utils/faqs.js → normalizeFaq` gains `group` (default `"general"`) and a new `faqsForGroup(faqs, group)` reader; `DEFAULT_FAQ.group = "general"`.
5. **Admin namespace additions** (mock path → live path):
   - Concerns: `getConcerns`, `createConcern`, `updateConcern`, `deleteConcern` → `/concerns` → `/admin/concerns`.
   - Rituals: `getRituals` (all, inactive included), `createRitual`, `updateRitual` (PUT), `deleteRitual`, `reorderRituals(orderedIds, current)` (same contract as `reorderFaqs`) → `/rituals` → `/admin/rituals` (+ `/admin/rituals/reorder`).
   - Site content: `getSiteContent()`, `updateSiteContent(key, data)` → mock: `GET /siteContent`, then `PUT /siteContent` with the merged object (json-server singleton, mirrors `updateSettings`); live: `GET /admin/content`, `PATCH /admin/content/:key`.
   - Announcements: `getAnnouncements`, `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`, `reorderAnnouncements(orderedIds, current)` replace the five banner functions one-for-one (`/announcements` → `/admin/announcements`, `/admin/announcements/reorder`).
   - Hero: `getHeroConfig/updateHeroConfig` unchanged; new `setHeroOrder(orderedProductIds)` → mock: PATCH each product's `heroOrder` (index + 1; products not in the list → `null`), only rows whose value changes; live: `PUT /admin/hero/order { order: [...] }`.
   - Categories: `createCategory/updateCategory` pass through the new fields (`displayName`, `heroImage`, `kind`) untouched.
   - Products: `admin.getProducts()` returns normalised products (drafts included).
6. **Compatibility shims for the two current readers** so the app keeps running until their rebuild prompts: `HeroSection.js` — replace `apiService.banners.getAll()` with `apiService.products.getHeroProducts()` mapped to the old slide shape `{ id, title: heroHeadline, subtitle: heroSubtext, cta: "Explore the " + shortName, link: productPath(p), backgroundType: "image", image: stageSrc(p, { w: 1600, ar: "16:9" }) }` (temporary; Prompt 14 rebuilds the hero); `src/utils/heroConfig.js → normalizeHeroConfig` tolerates the new smaller `heroConfig` (missing `heights/openers/secondaryCta` → defaults; add `source: "products"`). `AdminHeroSection.js` — swap `getBanners/createBanner/updateBanner/deleteBanner/reorderBanners` for the announcement equivalents and rename the tab label to "Announcements (temporary)" with a note; the fields it edits (`title/subtitle/…`) simply persist onto announcement rows for now (Prompt 34 replaces the screen). The admin must not crash.
7. **Errors and logging** — follow the file's conventions: `try/catch`, `console.error` with a labelled message, expected rejections coded (`err.code`) and kept out of the console.
8. **Contract document** — rewrite `REPO_MAP.md` §3 as the final table (namespace · function · mock path · live endpoint · request/response shape) and add a subsection "Laravel endpoints to implement" listing every new live route with method, path, params and response envelope so the backend team can build them: `GET /products/hero`, `GET /products/category/slug/{slug}`, `GET /products?concern=`, `GET /products/{id}/reviews?includeSample=`, `GET /concerns`, `GET /rituals`, `GET /rituals/slug/{slug}`, `GET /content`, `GET /content/{key}`, `GET /announcements`, `GET /hero/config`, admin CRUD for concerns/rituals/content/announcements, `PUT /admin/hero/order`, `PUT /admin/announcements/reorder`, `PUT /admin/rituals/reorder`, and the product payload with `media[]`.
9. **Live-mode review** — you cannot call the Laravel API in this programme (Prompt 01 rule). Review every live branch by reading it against the table; run `npm run test:live` **only** if the owner has explicitly provided a staging URL in `.env.local` (never against production). Record the decision.

## Design and content specification

None (service layer).

## Data and API changes

All of the above. `db.json` is unchanged in this prompt (already seeded). Both modes: every function has a mock branch exercised in the verification below and a live branch reviewed against the documented endpoints.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: do not change existing function signatures (add optional parameters only); keep `extractData/extractMeta/isVisibleProduct/visibleProducts/getErrorMessage` exports; keep the wallet/refund/return/cancel cascades untouched; no `banners` reference may remain in `src/`.

## Acceptance criteria

- [ ] `grep -rn "banners\|Banner" src --include=*.js` → 0 (comments included).
- [ ] In mock mode, the following resolve with the expected data (run in the browser console via a temporary `window.apiService = apiService` exposed in `index.js` for this prompt only, then removed): `products.getHeroProducts()` (8, ordered), `products.getByCategorySlug("serums")` (1), `products.getByConcern("hydration")` (3), `rituals.getBySlug("morning-glow")` (4 steps resolved), `siteContent.get("about")`, `announcements.getAll()` (3), `products.getReviews(1)` → `[]` with the flag off, `[1 sample]` with `{ includeSample: true }`, `admin.setHeroOrder([8,7,6,5,4,3,2,1])` then back.
- [ ] `admin.updateProduct` with a `media[]` change rewrites `images[]` (check `db.json` after saving from the admin form).
- [ ] The home hero renders the eight products through the shim; `/admin/hero-section` opens without errors.
- [ ] `REPO_MAP.md` §3 is the complete final contract including the Laravel endpoint list.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -rn "banners" src | wc -l                                   # 0
grep -n "getHeroProducts\|getByCategorySlug\|getByConcern\|concerns: {\|rituals: {\|siteContent: {\|announcements: {\|setHeroOrder\|updateSiteContent\|reorderAnnouncements\|reorderRituals" src/services/api.js
npm run dev   # exercise the console checks above in mock mode
```

Manual QA: home (hero shows product slides through the shim), `/products` list, a PDP, admin Products edit → add an image URL line → save → product JSON has the new URL in both `media` and `images`; admin Hero screen loads.

## Handoff

1. `PROGRESS.md`: row 07 → `complete`; Decisions log: live-test decision, any shape decisions for the Laravel envelope.
2. `REPO_MAP.md` §3 rewritten; remove the temporary `window.apiService` exposure before committing.
3. Commit: `feat(lamikaa): 07 api contract extension in both modes`.
