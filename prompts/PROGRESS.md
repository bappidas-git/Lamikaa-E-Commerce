# PROGRESS — LAMIKAA NATURALS rebuild

Update this file at the end of every prompt (Handoff step). Status values: `pending` · `in-progress` · `complete` · `blocked` · `skipped (reason)`. Commit hashes are short SHAs on branch `feat/lamikaa-naturals`.

| # | Prompt | Status | Date | Commit | Notes |
|---|---|---|---|---|---|
| 01 | Project baseline and verification harness | complete | 2026-09-06 | (this commit) | Node v22.17.0 / npm 10.9.2. `npm ci` clean; `CI=true npm run build` **exit 0 with no warnings — no ESLint fixes were needed**; `npm test -- --watchAll=false` exit 0 (1 suite / 45 tests skipped). Both api modes checked (Task 5). All 15 admin screens open, zero console errors. 22 baseline screenshots in `prompts/_baseline/` (git-ignored). Brand footprint re-counted at **531 — matches `BRAND_FOOTPRINT.md`, not regenerated**. 10/10 real asset URLs + the transformation URL return 200. See "Baseline record" below. |
| 02 | Brand config module and identity assets | complete | 2026-09-06 | (this commit) | `src/config/brand.js` is now the single source of brand truth; `src/utils/{placeholders,cloudinary}.js` and `src/components/brand/Logo.{js,module.css}` added. All **10** old logo constants replaced by `<Logo>` (header, mobile drawer, footer, auth modal, admin shell, admin login) — `grep -rn "meghali-silk-logo\|v1787592407\|v1787592405" src public` → **0** (was 15: 10 constants + 2 token comments + 3 in index.html). Favicons regenerated from the LAMIKAA mark via Cloudinary (`f_ico` accepted — **no Node ICO fallback needed**); 7 files verified by header at 16/32/48/180/192/512/512. `index.html`, `manifest.json`, `package.json`, `.env*` re-pointed; `README.md` stubbed. `FREE_SHIPPING_THRESHOLD` retired to `null` and all four consumers hide rather than promise. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (1 suite / 45 tests skipped). Browser QA at 390/768/1280 + API-unreachable run: `document.body.innerText.includes("{{")` **false** on `/`, `/help`, `/support`; no `a[href*="{{"]`. See "Prompt 02 record" below. |
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
- `02 · 2026-09-06 · The ICO was built by Cloudinary's f_ico, NOT by the Node fallback the prompt allows · https://res.cloudinary.com/v8vrixwq/image/upload/w_48,h_48,c_fit,f_ico/v1788670625/icon.png returns 200 image/x-icon; the downloaded file parses as a real ICO with one 48x48 BMP entry. No local image tooling and no ICO-writing script were needed.`
- `02 · 2026-09-06 · Logo.module.css wraps its rules in :where() so they carry ZERO specificity · Six consumers already size their own logo slot with a plain class (masthead 44px, drawer 38px, footer 48px, auth modal 34px, admin inline styles). A normal .logo{height:auto} would have fought them and the winner would have depended on CSS bundle order. :where() makes <Logo> supply defaults that any consumer class beats deterministically. Verified in the emitted CSS (":where(.Logo_logo__MDQoS){display:block;height:auto;max-width:100%}") and at runtime: header 154x44, drawer 132x38, footer 167x48 — all exactly 3.5:1.`
- `02 · 2026-09-06 · FAQ 6 is written as a full sentence around {freeShipping} ("Shipping is free on orders above {freeShipping}.") rather than the bare token the prompt quotes · fillStoreCopy substitutes {freeShipping} with a MONEY FIGURE, so a bare token would render "…for your address. ₹999." once the owner sets a threshold. Writing the sentence satisfies the prompt's own rule ("the {freeShipping} sentence is dropped while the threshold is unknown") in both states. Verified: with no threshold the answer renders as one sentence, "Dispatch and delivery times are shown at checkout for your address."`
- `02 · 2026-09-06 · {{RETURN_WINDOW_DAYS}} is resolved inside fillStoreCopy from an optional third argument, not from a direct import of STOREFRONT_CONFIG · utils/storeSettings.js importing theme/tokens.js would close a cycle (tokens → utils/helpers → utils/storeSettings). StoreSettingsContext passes { returnWindowDays: STOREFRONT_CONFIG.returnsWindowDays } instead; fillStoreCopy also accepts { freeAbove } so Prompt 12 can pass the live shipping threshold. Any token fillStoreCopy cannot resolve loses its sentence (stripPlaceholderSentences runs last), so no {{…}} can reach the page through shared copy.`
- `02 · 2026-09-06 · Placeholder blanking of the contact fields was put in normalizeStoreSettings (and the context's seed state), not in each surface · PLACEHOLDERS.md's rendering rule ("contact rows hidden while unresolved, never printed raw") is global, and the Footer, Help Centre, Contact page, checkout and admin invoice all read the same three fields through useStoreSettings. Doing it once means no later prompt can leak a token by forgetting a guard. NOTE: StoreSettingsContext seeded useState from the RAW DEFAULT_STORE_SETTINGS, so an unreachable API printed "{{LAMIKAA_EMAIL}}" on /help until the seed was normalised too — caught by the offline browser run, fixed, re-verified.`
- `02 · 2026-09-06 · Four files outside the prompt's expected-files list were touched, each to stop a token or a false promise rendering · AnnouncementBar.js and CartDrawer.js are the two remaining FREE_SHIPPING_THRESHOLD consumers (the prompt requires every consumer to treat null as "unknown → hide"); HelpCenter.js and Support.js render SUPPORT_HOURS directly and would otherwise have printed "{{SUPPORT_HOURS}}". StoreSettingsContext.js carries the fillCopy argument and the normalised seed. All five stay minimal — no layout or theme changes.`
- `02 · 2026-09-06 · The header/footer/auth logo alt text still reads the ADMIN-SET store name (settings.store.name), not brand.name · That is the existing contract (renaming the store in Admin > Settings renames the lockup's accessible name everywhere). In mock mode db.json still seeds "Meghali's Silk", so the alt reads that until Prompt 06 reseeds; with the API unreachable it already reads "LAMIKAA NATURALS". Deliberate — not a leak of the old brand into code.`

## Open TODOs

Carry-overs that a later prompt (or the developer/owner) must pick up (format: `NN · item · owner · target prompt`).

- `01 · Baseline works: add to cart from a card (guest, 0 → 1) and from the PDP (5 → 6 items); quantity + in the drawer (6 → 7); remove line (7 → 2); coupon MUGA500 (−₹500.00 — savings −₹3,500 → −₹4,000, total ₹18,500 → ₹18,000); checkout through all four steps to an order confirmation on COD (ORD-MTPU49W5-8QEA); that order then listed in /orders (4 rows) and in Admin → Orders (12 rows); wishlist toggle as guest (0 → 1) and as a signed-in user (1 → 0 → 1, both directions); search "Muga" (26 product links); light/dark toggle (body "dark react-loaded" ↔ "react-loaded light" — to be removed by Prompt 03); review from a delivered order (created review id 13, product 22, rating 4, status "pending"); cancel a processing order (ORD-MTPU49W5-8QEA → fulfillmentStatus "cancelled", paymentStatus "voided" — the cascade ran); address book in /profile → Addresses: add, edit (city Guwahati → Jorhat, persisted) and delete all confirmed against the API. · developer · —`
- `01 · db.json product 1 ("Sualkuchi Muga Mekhela Chador — Natural Gold") carries corrupted prices in the committed seed: price 41, comparePrice 380000000000, variants ₹3,25,00,00,000 and ₹3,35,00,00,00,000 (the PDP renders them). Left as-is — Prompt 06 reseeds db.json wholesale — but do not treat these numbers as a pricing reference. · Prompt 06 · 06`
- `01 · No user has a delivered order in the committed seed (user 1: shipped ×2, cancelled ×1). To exercise "review from a delivered order" the baseline had to PATCH one order to shippingStatus "delivered" (OrderHistory.js:72 derives the status from that field, :313 gates reviewing on it). Worth seeding at least one delivered order so the review path is reachable out of the box. · Prompt 06 · 06`
- `01 · Storefront placeholder images are served from placehold.co; a first capture run logged intermittent ERR_NAME_NOT_RESOLVED for them at 1280 px (clean on re-run). Not a code defect — but the Prompt 06 seed should prefer the hosts verified below. · Prompt 06 · 06`
- `02 · meta[name=theme-color] is #0B0B0D in the static HTML, but ThemeContext rewrites it to #14120F at runtime (ThemeContext.js). Task 8 is satisfied in index.html; making it static is explicitly Prompt 03's job (DESIGN_SYSTEM §1). · Prompt 03 · 03`
- `02 · The pre-mount theme script in index.html still writes body.dark/body.light because ThemeContext and ~16 CSS modules still read the class. Both of its branches now paint the same #0B0B0D ground, so no ivory flash is possible; the script is deleted with the toggle. · Prompt 03 · 03`
- `02 · Eight files still carry the literal "Meghali" in a comment or a header docblock: AuthModal.module.css:12, BottomNav.module.css:2, ErrorBoundary.js:42, Footer.module.css:2, Header.module.css:2, SidebarMenu.module.css:2, storefront/ProductCard.js:17, theme/tokens.js:59. None was touched by Prompt 02 (the prompt's own verification grep excludes them), and each belongs to the prompt that rewrites its file — but Prompt 35's sweep must close all eight. storefront-tokens.css keeps two more (palette headings) which Prompt 03 rewrites. · Prompt 35 · 35`
- `02 · db.json still seeds the old identity, so mock mode shows Meghali contact rows, tagline, store name and social marks, and the document title comes from settings.seo.metaTitle. Every one of those resolves to the brand.js values (or hides) the moment the API is unreachable, which is how it was verified. · Prompt 06 · 06`
- `02 · TrustStrip and the Home promises row still render the old four badges rather than brand.trustBadges (TrustStrip keeps its own list; Home maps TRUST_BADGES, which is now the three LAMIKAA badges). The Footer promise row was switched to brand.trustBadges[0] in this prompt. · Prompt 15 · 15`

## Placeholders introduced / resolved

Mirror of `_reference/PLACEHOLDERS.md` changes per prompt (format: `NN · token · introduced|resolved · where`).

- (none yet — Prompt 01 changes no application code)
- `02 · {{SUPPORT_HOURS}} · introduced · brand.js → contact.hours → constants.js SUPPORT_HOURS; read by Footer (Hours row), HelpCenter (lede) and Support (form lede, sent confirmation, "Visit us" card) — every one through resolveOrNull, so the row or clause is dropped while unresolved.`
- `02 · {{LAMIKAA_EMAIL}} / {{LAMIKAA_PHONE}} / {{LAMIKAA_ADDRESS}} · introduced · brand.js → contact.* → constants.js SUPPORT_EMAIL/PHONE/ADDRESS → DEFAULT_STORE_SETTINGS.store.*. normalizeStoreSettings() resolves a token to "" so no storefront surface can print one.`
- `02 · {{LAMIKAA_INSTAGRAM_URL}} / {{LAMIKAA_FACEBOOK_URL}} / {{LAMIKAA_YOUTUBE_URL}} / {{LAMIKAA_WHATSAPP_URL}} · introduced · brand.js → social.* → constants.js SOCIAL_LINKS → DEFAULT_SOCIAL_LINKS. normalizeSocialUrl() returns "" for a placeholder, so the footer social row renders nothing until the owner fills the admin. (brand.social.twitter is "" — blank by choice, not a token.)`
- `02 · {{LAMIKAA_DOMAIN}} · introduced · brand.js → seo.siteUrl and public/index.html og:url + twitter:url. A raw token in static HTML is tolerated until Prompt 36 verifies it is resolved or removed.`
- `02 · {{GSTIN}} / {{CIN}} · introduced · brand.js → legal.*. Not rendered anywhere yet — the footer legal line arrives in Prompt 13.`
- `02 · {{FREE_SHIPPING_THRESHOLD}} · introduced · brand.js → announcements[1].text, and emitted internally by fillStoreCopy when {freeShipping} cannot be resolved so the sentence is dropped. constants.js FREE_SHIPPING_THRESHOLD is now null.`
- `02 · {{LAUNCH_OFFER_TEXT}} · introduced · brand.js → announcements[2].text.`
- `02 · {{SHELF_LIFE}} · introduced · brand.js → productDefaults.shelfLife. Rendered by the PDP "Good to know" row in Prompt 25.`
- `02 · {{CERTIFICATIONS}} · introduced · marker comment above brand.js → packBadges[].`
- `02 · {{RETURN_WINDOW_DAYS}} · introduced · constants.js FAQ_ITEMS[6].answer, resolved by fillStoreCopy from STOREFRONT_CONFIG.returnsWindowDays (7). Verified rendering as "within 7 days of delivery".`

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

---

## Prompt 02 record (2026-09-06)

### What now owns the brand

`src/config/brand.js` — default + named `brand` export, plus `LOGO_URL` / `ICON_URL`. Every name, tagline, pillar, badge, contact field, social handle, SEO string and feature flag reads from it. Nothing else in `src/` inlines the logo or icon URL (`grep -rn "v1788670626\|v1788670625" src public` returns only `brand.js` and `public/index.html`).

New helpers, both pure and React-free:

| Module | Exports |
|---|---|
| `src/utils/placeholders.js` | `PLACEHOLDER_RE`, `isPlaceholder`, `resolveOrNull`, `placeholderToken`, `stripPlaceholderSentences` |
| `src/utils/cloudinary.js` | `isCloudinary`, `cld`, `srcSet`, `SRCSET_WIDTHS` |

Both were exercised against 29 assertions (transformation chains including `c_crop,x_700,y_10,w_425,h_750/c_pad,ar_1:1,b_auto/f_auto,q_auto,w_900`, non-Cloudinary pass-through, sentence dropping at `. ` and `.\n`, "Co. Ltd." left intact, non-string inputs) — all passed. The permanent unit tests land in Prompt 05.

`src/components/brand/Logo.js` — `variant="wordmark"|"mark"`, `width` (CSS px; the file is requested at `2×` for retina), derived `height` from `brand.logoAspect`, `alt` defaulting to `brand.name`, plus a `style` pass-through the two MUI admin surfaces need.

### Logo call sites replaced (10 constants → 6 `<Logo>` renders)

| Surface | Was | Now | Rendered box |
|---|---|---|---|
| `Header.js:57,426` | `LOGO_SRC` | `<Logo className={styles.logoImg} width={168}>` | 154×44 (119×34 ≤ 768px) |
| `SidebarMenu.js:40-42,362` | `LOGO_LIGHT`/`LOGO_WHITE` by `isDarkMode` | `<Logo className={styles.logo} width={148}>` | 132×38 |
| `Footer.js:45,265` | `LOGO_SRC` (white art) | `<Logo className={styles.logo} width={190}>` | 167×48 |
| `AuthModal.js:26-28,553` | by `isDarkMode` | `<Logo className={styles.logo} width={132}>` | 34px tall |
| `AdminLayout.js:44-46,373` | by `mode` | `<Logo width={130} style={…}>` | 36px tall |
| `AdminLogin.js:26-28,155` | by `isDarkMode` | `<Logo width={210} style={…}>` | 60px tall |

The `isDarkMode` / `mode` reads themselves stay (each file still uses them elsewhere) and are removed in Prompt 03.

### `FREE_SHIPPING_THRESHOLD = null` — the four consumers

| Consumer | Before | After (threshold unknown) |
|---|---|---|
| `AnnouncementBar.js` | "Complimentary shipping above ₹999" | the `{amount}` message is filtered out of the rotation (the bar renders nothing at all if that leaves it empty) |
| `CartDrawer.js` | meter + `cartTotal >= 999 ? 0 : 99` | meter not rendered; flat ₹99 stands. **Without the guard `cartTotal >= null` is `cartTotal >= 0`, i.e. every order would have shipped free** |
| `Footer.js` | "Free shipping above ₹999" promise row | row dropped (`needsThreshold`) |
| `storeSettings.js` `fillStoreCopy` | `{freeShipping}` → `₹0` | `{freeShipping}` → `{{FREE_SHIPPING_THRESHOLD}}` → its sentence is dropped |

Verified in the cart drawer with 2 lines / ₹23,300: no meter, "Shipping ₹99.00".

### Identity assets

Seven icon files regenerated from `…/v1788670625/icon.png` and byte-verified after download:

```
favicon.ico                  ICO 48x48 (bmp)   9,662 b
favicon-16x16.png            PNG 16x16           891 b
favicon-32x32.png            PNG 32x32         2,050 b
apple-touch-icon.png         PNG 180x180      24,027 b
android-chrome-192x192.png   PNG 192x192      26,701 b
android-chrome-512x512.png   PNG 512x512     133,132 b
maskable-512x512.png         PNG 512x512      82,329 b   (410px art lpadded onto #0B0B0D)
```

All seven, plus `manifest.json`, were re-fetched from the dev server and compared byte-for-byte with `public/`. `manifest.json` parses and declares `any`/`any`/`maskable` icons on `#0B0B0D`.

`public/index.html`: title, description, keywords, author, the full OG/Twitter set (share image `…/f_auto,q_auto,w_1200/v1788670626/logo.png`, 1200×343, card stays `summary`), `theme-color #0B0B0D`, preload re-pointed to the LAMIKAA wordmark at `w_520`. The splash is one `<img class="loader-logo" width="1400" height="400">` on `#0B0B0D` with the master tagline; `.loader-logo-dark`, every `body.dark` branch and all eleven light-palette literals are gone.

### Verification run

| Check | Result |
|---|---|
| `grep -rn "meghali-silk-logo\|v1787592407\|v1787592405" src public` | **0** (was 15) |
| Same grep over `build/index.html`, `build/manifest.json` | **0** |
| Prompt's `meghali\|Meghali` verification grep | 8 lines, **none in a file this prompt touched** — all eight are header comments in files owned by Prompts 03/09/10/13/15/30/35 (logged as an Open TODO) |
| `grep -n meghali .env*` | 0 |
| `grep -rn "REACT_APP_NAME\|REACT_APP_VERSION" src public server.js .env*` | 0 |
| `CI=true npm run build` | exit 0, **no warnings**, 455.5 kB JS / 61.13 kB CSS gzipped |
| `npm test -- --watchAll=false` | exit 0 (1 suite / 45 tests skipped) |

Browser QA (Chrome, 390 / 768 / 1280 px, plus a second dev server pointed at a dead API to force the fallback path):

- Header, mobile drawer, footer, auth modal, admin login and the admin shell drawer all paint the LAMIKAA wordmark; no clipping, correct 3.5:1 at every width, no horizontal scroll.
- Tab favicon is the LAMIKAA mark; `<title>` is `LAMIKAA NATURALS — Black Rice Skincare, Farmer-Owned` before React mounts.
- `document.body.innerText.includes("{{")` → **false** on `/`, `/help` and `/support`; `document.querySelectorAll('a[href*="{{"]')` → **empty**; no empty `mailto:` / `tel:` links.
- With the API unreachable: `/help` falls back to the eight LAMIKAA FAQs; FAQ 6 renders as "Dispatch and delivery times are shown at checkout for your address." (shipping sentence dropped); FAQ 7 renders "within 7 days of delivery". The footer shows the brand tagline, the legal note, the "Farmer to Consumer" badge and "© 2026 LAMIKAA NATURALS" — with the contact block, the social row and the free-shipping promise all hidden.
- Admin: signed in as `admin@store.com`, dashboard rendered, **zero console errors**.
