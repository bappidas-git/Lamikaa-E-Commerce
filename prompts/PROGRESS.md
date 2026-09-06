# PROGRESS — LAMIKAA NATURALS rebuild

Update this file at the end of every prompt (Handoff step). Status values: `pending` · `in-progress` · `complete` · `blocked` · `skipped (reason)`. Commit hashes are short SHAs on branch `feat/lamikaa-naturals`.

| # | Prompt | Status | Date | Commit | Notes |
|---|---|---|---|---|---|
| 01 | Project baseline and verification harness | complete | 2026-09-06 | (this commit) | Node v22.17.0 / npm 10.9.2. `npm ci` clean; `CI=true npm run build` **exit 0 with no warnings — no ESLint fixes were needed**; `npm test -- --watchAll=false` exit 0 (1 suite / 45 tests skipped). Both api modes checked (Task 5). All 15 admin screens open, zero console errors. 22 baseline screenshots in `prompts/_baseline/` (git-ignored). Brand footprint re-counted at **531 — matches `BRAND_FOOTPRINT.md`, not regenerated**. 10/10 real asset URLs + the transformation URL return 200. See "Baseline record" below. |
| 02 | Brand config module and identity assets | pending | | | |
| 03 | Design tokens and single dark theme | pending | | | |
| 04 | Typography and global styles | pending | | | |
| 05 | Shared UI primitives and media helpers | pending | | | |
| 06 | Data model and seed (db.json) | pending | | | |
| 07 | api.js contract extension in both modes | pending | | | |
| 08 | Routing, IA, lazy loading and SEO hook | pending | | | |
| 09 | Header, mega panel and announcement bar | pending | | | |
| 10 | Mobile navigation drawer and bottom nav | pending | | | |
| 11 | Search overlay and search results | pending | | | |
| 12 | Cart drawer with cross-sell | pending | | | |
| 13 | Footer | pending | | | |
| 14 | Home hero product carousel | pending | | | |
| 15 | Trust strip and shop-by-category/concern | pending | | | |
| 16 | Home product showcase sections | pending | | | |
| 17 | About LAMIKAA section and value-chain visual | pending | | | |
| 18 | Why Black Rice spotlight and rituals teaser | pending | | | |
| 19 | Full-page CTA section | pending | | | |
| 20 | Why LAMIKAA section (pillars and impact) | pending | | | |
| 21 | Home FAQs section and accordion | pending | | | |
| 22 | Home assembly, performance and SEO | pending | | | |
| 23 | Shop page — chaptered editorial listing | pending | | | |
| 24 | Category pages and rituals pages | pending | | | |
| 25 | PDP — layout, chapters, purchase panel, mobile bar | pending | | | |
| 26 | PDP — media gallery with images and videos | pending | | | |
| 27 | PDP — supporting content, reviews, cross-sell, JSON-LD | pending | | | |
| 28 | Content pages from siteContent | pending | | | |
| 29 | Cart page and checkout restyle | pending | | | |
| 30 | Auth, account, orders and wishlist restyle | pending | | | |
| 31 | Order confirmation, offers, search results and state consistency | pending | | | |
| 32 | Admin rebrand and shell | pending | | | |
| 33 | Admin product form — media manager and new fields | pending | | | |
| 34 | Admin content management | pending | | | |
| 35 | Brand cleanup I — code identifiers | pending | | | |
| 36 | Brand cleanup II — content, assets, seeds, verification | pending | | | |
| 37 | Responsive and mobile QA pass | pending | | | |
| 38 | Accessibility, performance and SEO audit | pending | | | |
| 39 | Final QA, parity, README and release notes | pending | | | |

## Decisions log

Record every decision a prompt had to make that the reference files did not settle (format: `NN · date · decision · why`).

- `01 · 2026-09-06 · "Both api modes" means: exercised in mock mode + the live branch implemented and reviewed against the documented endpoint contract (REPO_MAP §3) · The Laravel backend lives outside this repository and `npm run test:live` writes to the production database, so the live branch can never be executed from here. Every later prompt claiming "both api modes" must satisfy it this way.`
- `01 · 2026-09-06 · Mode selection is by env file, not by a single .env line · Recorded because the prompt's wording implies .env carries the live values. Reality: committed .env selects **mock** mode (REACT_APP_API_URL=http://localhost:3001, REACT_APP_USE_MOCK_API=true, .env:21-22) with the live pair present but commented out (.env:25-26); .env.production carries live mode (REACT_APP_API_URL=https://core.lamikanaturals.com/api/v1, REACT_APP_USE_MOCK_API=false, .env.production:14,17). src/services/baseURL.js resolves REACT_APP_USE_MOCK_API === "true" → MOCK_API_URL first, else REACT_APP_API_URL, else mock in development.`
- `01 · 2026-09-06 · JSON Server was run against a scratchpad copy of db.json via the supported JSON_SERVER_DB override (server.js:47-49), not the tracked file · The Task 8 feature checklist writes orders, reviews, wishlist and address rows. The guardrail forbids changing db.json in this prompt, so the tracked seed stays byte-identical (verified: git diff --stat db.json is empty) while the flows were still exercised for real.`
- `01 · 2026-09-06 · Screenshots and the behaviour walk were driven with puppeteer-core against the already-installed Chrome, installed **into the scratchpad only** · Keeps package.json untouched (guardrail) and downloads no browser binary; 00_INDEX §2 allows CLI tooling outside the dependency list.`

## Open TODOs

Carry-overs that a later prompt (or the developer/owner) must pick up (format: `NN · item · owner · target prompt`).

- `01 · Baseline works: add to cart from a card (guest, 0 → 1) and from the PDP (5 → 6 items); quantity + in the drawer (6 → 7); remove line (7 → 2); coupon MUGA500 (−₹500.00 — savings −₹3,500 → −₹4,000, total ₹18,500 → ₹18,000); checkout through all four steps to an order confirmation on COD (ORD-MTPU49W5-8QEA); that order then listed in /orders (4 rows) and in Admin → Orders (12 rows); wishlist toggle as guest (0 → 1) and as a signed-in user (1 → 0 → 1, both directions); search "Muga" (26 product links); light/dark toggle (body "dark react-loaded" ↔ "react-loaded light" — to be removed by Prompt 03); review from a delivered order (created review id 13, product 22, rating 4, status "pending"); cancel a processing order (ORD-MTPU49W5-8QEA → fulfillmentStatus "cancelled", paymentStatus "voided" — the cascade ran); address book in /profile → Addresses: add, edit (city Guwahati → Jorhat, persisted) and delete all confirmed against the API. · developer · —`
- `01 · db.json product 1 ("Sualkuchi Muga Mekhela Chador — Natural Gold") carries corrupted prices in the committed seed: price 41, comparePrice 380000000000, variants ₹3,25,00,00,000 and ₹3,35,00,00,00,000 (the PDP renders them). Left as-is — Prompt 06 reseeds db.json wholesale — but do not treat these numbers as a pricing reference. · Prompt 06 · 06`
- `01 · No user has a delivered order in the committed seed (user 1: shipped ×2, cancelled ×1). To exercise "review from a delivered order" the baseline had to PATCH one order to shippingStatus "delivered" (OrderHistory.js:72 derives the status from that field, :313 gates reviewing on it). Worth seeding at least one delivered order so the review path is reachable out of the box. · Prompt 06 · 06`
- `01 · Storefront placeholder images are served from placehold.co; a first capture run logged intermittent ERR_NAME_NOT_RESOLVED for them at 1280 px (clean on re-run). Not a code defect — but the Prompt 06 seed should prefer the hosts verified below. · Prompt 06 · 06`

## Placeholders introduced / resolved

Mirror of `_reference/PLACEHOLDERS.md` changes per prompt (format: `NN · token · introduced|resolved · where`).

- (none yet — Prompt 01 changes no application code)

---

## Baseline record (Prompt 01, 2026-09-06)

Captured on branch `feat/lamikaa-naturals`, branched from `main` at `023e02f`.

### Toolchain and gates

| Check | Result |
|---|---|
| Node / npm | v22.17.0 / 10.9.2 |
| `npm ci` | exit 0 (lockfile in sync; `npm install` was not needed) |
| `CI=true npm run build` | **exit 0, no warnings** — no ESLint fixes were required, so no file under `src/` was touched. 454.42 kB JS + 61.11 kB CSS gzipped. Two non-blocking notices: an outdated `caniuse-lite`, and the CRA `@babel/plugin-proposal-private-property-in-object` advisory. |
| `npm test -- --watchAll=false` | exit 0 — `Test Suites: 1 skipped, 0 of 1 total · Tests: 45 skipped, 45 total` (the live suite is `describe.skip` unless `LIVE_API=1`) |
| `npm run test:live` | **not run** (writes to the production database) |

### API modes (Task 5 — configuration only, no writes)

- Mock mode is what `.env` selects today: `REACT_APP_API_URL=http://localhost:3001`, `REACT_APP_USE_MOCK_API=true` (`.env:21-22`). The live pair is present but commented out (`.env:25-26`).
- Live mode is carried by `.env.production`: `REACT_APP_API_URL=https://core.lamikanaturals.com/api/v1`, `REACT_APP_USE_MOCK_API=false` (`.env.production:14,17`).
- `src/services/baseURL.js` resolves the flag first, then `REACT_APP_API_URL`, then falls back to mock in development; `IS_MOCK_API` is true when the base URL is the mock URL or the flag is `"true"`.
- The Laravel backend is **outside this repository**. From here on, "both api modes" means: exercised in mock mode, and the live branch implemented and reviewed against the endpoint contract in `_reference/REPO_MAP.md` §3.
- Stale comment noted for cleanup: `src/services/baseURL.js:7` still names `core.meghalisilk.in` (owned by Prompts 35/36).

### Mock mode and admin

JSON Server answered on `:3001` (`/products` returns the silk catalogue, `/settings` the settings singleton); the storefront rendered on `:3000`. Admin login `admin@store.com` / `admin123` succeeded and **all 15 screens opened with no console errors**:

Dashboard (5 rows) · Products (6) · Categories (3) · Orders (11) · Returns & Refunds (4) · Payments (9) · Coupons (7) · Special Offers Page · Hero Section · FAQs · Reviews (8) · Users (4) · Shipping (5) · Lead Management (6) · Settings.

The product form opens with the **"Image URLs (one per line)"** textarea present (8 textareas in the form) — the field Prompt 33 replaces with the media manager.

### Visual baseline

22 full-page screenshots at 390 px and 1280 px under `prompts/_baseline/` (git-ignored via `.gitignore:26`): `home`, `products`, `product-detail`, `cart-drawer`, `checkout`, `about`, `help`, `support`, `orders`, `profile`, `admin-dashboard`. Captured signed in as `user@example.com` with a populated cart; default zoom, no dev-tool overlays. These are Prompt 39's "before" images.

### Brand footprint

The Task 9 grep returns **531** hits — identical to the figure recorded in `_reference/BRAND_FOOTPRINT.md`, so §2 was **not** regenerated and the file is unchanged.

### Asset reachability

All ten real URLs from `PRODUCTS.md` §1–§2 return **HTTP 200** on HEAD (logo, icon and the eight covers), and the transformation URL `…/upload/f_auto,q_auto,w_600/v1788670626/logo.png` returns 200 — so `cld()` transformations are safe to build on in Prompt 02.

### Placeholder host reachability (Task 11 — decides what Prompt 06 may seed)

| Host | Result |
|---|---|
| `picsum.photos` | **206** (image/jpeg) — seedable |
| `interactive-examples.mdn.mozilla.net` (MDN CC0 videos) | **206** (video/mp4) — seedable |
| `res.cloudinary.com/demo` (Cloudinary demo videos) | **206** (video/mp4) — seedable |
| `commondatastorage.googleapis.com/gtv-videos-bucket` | **403** — do not seed |
| `www.w3schools.com/html/mov_bbb.mp4` | **403** — do not seed |

This reproduces the analysis-environment result recorded in `PLACEHOLDER_ASSETS.md`: the brief's Google and w3schools sample videos are **still unreachable from the developer machine**, so Prompt 06 seeds only Picsum, MDN CC0 and Cloudinary demo media.
