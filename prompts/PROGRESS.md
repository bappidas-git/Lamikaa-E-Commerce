# PROGRESS — LAMIKAA NATURALS rebuild

Update this file at the end of every prompt (Handoff step). Status values: `pending` · `in-progress` · `complete` · `blocked` · `skipped (reason)`. Commit hashes are short SHAs on branch `feat/lamikaa-naturals`.

| # | Prompt | Status | Date | Commit | Notes |
|---|---|---|---|---|---|
| 01 | Project baseline and verification harness | complete | 2026-09-06 | (this commit) | Node v22.17.0 / npm 10.9.2. `npm ci` clean; `CI=true npm run build` **exit 0 with no warnings — no ESLint fixes were needed**; `npm test -- --watchAll=false` exit 0 (1 suite / 45 tests skipped). Both api modes checked (Task 5). All 15 admin screens open, zero console errors. 22 baseline screenshots in `prompts/_baseline/` (git-ignored). Brand footprint re-counted at **531 — matches `BRAND_FOOTPRINT.md`, not regenerated**. 10/10 real asset URLs + the transformation URL return 200. See "Baseline record" below. |
| 02 | Brand config module and identity assets | complete | 2026-09-06 | (this commit) | `src/config/brand.js` is now the single source of brand truth; `src/utils/{placeholders,cloudinary}.js` and `src/components/brand/Logo.{js,module.css}` added. All **10** old logo constants replaced by `<Logo>` (header, mobile drawer, footer, auth modal, admin shell, admin login) — `grep -rn "meghali-silk-logo\|v1787592407\|v1787592405" src public` → **0** (was 15: 10 constants + 2 token comments + 3 in index.html). Favicons regenerated from the LAMIKAA mark via Cloudinary (`f_ico` accepted — **no Node ICO fallback needed**); 7 files verified by header at 16/32/48/180/192/512/512. `index.html`, `manifest.json`, `package.json`, `.env*` re-pointed; `README.md` stubbed. `FREE_SHIPPING_THRESHOLD` retired to `null` and all four consumers hide rather than promise. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (1 suite / 45 tests skipped). Browser QA at 390/768/1280 + API-unreachable run: `document.body.innerText.includes("{{")` **false** on `/`, `/help`, `/support`; no `a[href*="{{"]`. See "Prompt 02 record" below. |
| 03 | Design tokens and single dark theme | complete | 2026-09-06 | (this commit) | Token layer rewritten to the LAMIKAA "Luxury Skincare After Dark" set — **one** `:root` block with `color-scheme: dark`; `body.dark` deleted. All **21** mode consumers + `ThemeContext` cleaned: `grep -rn "isDarkMode\|toggleTheme\|useThemeContext\|localStorage.getItem(\"theme\")\|setItem(\"theme\"" src public` → **0**. **27** CSS modules lost their `.dark` rules/comments; `grep -rn "\.dark\b\|body\.light" src --include=*.css` → **0**. Pre-mount theme IIFE deleted from `index.html` (static `#0b0b0d` ground, `theme-color` `#0B0B0D`); `ErrorBoundary` down to one literal palette. A scripted contrast audit (`scratchpad/contrast2.py`, 4 950 CSS rule blocks) found **4** fill/label pairs below 4.5:1 after the palette flip — all fixed in the token layer, all re-verified. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (1 suite / 45 tests skipped — unchanged baseline). Browser QA in mock mode with `prefers-color-scheme: light` emulated throughout: body ground `rgb(11,11,13)` and `color-scheme: dark` on every page, `body.className === "react-loaded"`, a seeded `theme=light` is **gone after one reload**, no toggle in header / mobile drawer / profile settings / admin header, **no horizontal scroll** at 360/390/414/768/1024/1280/1440 across six routes (42 combinations), `--sf-duration` → `0s` under reduced motion, and **zero non-network console errors** on home, PDP, cart drawer, checkout, profile → Settings, `/admin/dashboard` and `/admin/orders`. See "Prompt 03 record" below. |
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
- `03 · 2026-09-06 · --sf-color-brand-green is DELETED but --sf-color-brand-green-deep is KEPT and re-pointed to #0B0B0D · DESIGN_SYSTEM §2 lists both under "Removed tokens (Prompt 03 + 35)", but Task 1's rule — "keep every existing token name that components consume" — and the acceptance criterion that every consumed token resolve, both win where the two disagree. `--sf-color-brand-green` has no consumer, so it went; `--sf-color-brand-green-deep` has four (Footer.module.css:28 and HeroSection.module.css:57 pin their band grounds to it, CTASection.module.css:6 and Newsletter.module.css:11 use it as the near-black label on the gold gradient button). #0B0B0D serves all four. Prompt 35 removes it with its consumers.`
- `03 · 2026-09-06 · --sf-color-primary-contrast INVERTED role, so seven files were re-pointed to --sf-color-text · The token was ivory (#FAF6EC) and is now the near-black label on gold (#0B0B0D). Everywhere it was used as the label ON --sf-color-primary it is still correct (AnnouncementBar, the Header badge, CTASection, Newsletter, Profile's checkbox, FeaturedProducts' discount badge — all ≥ 6:1). Everywhere it meant "warm-white ink on a dark ground" it would have gone invisible, so those aliases and rules now read --sf-color-text: Footer.module.css:29-33 (the five footer-scoped ink/rule aliases), HeroSection.module.css:58-61 and :404, ProductCard.module.css:170 and SpecialOffers.module.css:550 (the out-of-stock tag on --sf-color-overlay), AboutUs.module.css:586,601 and Home.module.css:494,504,509,539,556,562,565 (the heritage band). Token mappings only — no rule was added, removed or re-laid-out.`
- `03 · 2026-09-06 · Four contrast regressions were found by script, not by eye, and fixed in the token layer · A throwaway auditor (kept at scratchpad/contrast2.py) resolves the :root table, walks every CSS rule block, composites rgba/color-mix/gradient stops over #0B0B0D and reports pairs below 4.5:1. It caught: `.sf-btn--gold` (storefront-primitives.css) and `.stepDone .stepMark` (Checkout) painting their label with --sf-color-primary-dark, which is now the PRESSED GOLD #B88924 rather than the old near-black ink — 2.73:1 and 2.23:1 on gold, both re-pointed to --sf-color-primary-contrast; `.wishlistBtn` (FeaturedProducts) — a hardcoded `rgba(255,255,255,0.9)` plate under a now-near-white icon, 1.08:1, re-pointed to --sf-color-overlay + --sf-color-text; and `.heritageCta:focus-visible` (Home), whose ring gap layer was --sf-color-primary-dark and is now --sf-color-bg. The auditor's one remaining "failure", Newsletter `.form input`, is a false positive (it composites over the page ground, but that input sits on the gold `.newsletter` section, where the near-black text is ~11:1). The 41 "light fill with no label colour" hits are all hairlines, rules, bars, dots and ::before/::after decorations that carry no text, plus hover states whose base rule sets the colour.`
- `03 · 2026-09-06 · --sf-cat-* map onto --sf-concern-* by hue role · DESIGN_SYSTEM §2 gives the six concern values but not their names. Chosen: pink #FF4FD8, violet #8B5CF6, cyan #5DE7FF, gold #F5D76E, mint #7ED9A6, rose #F7A8C4; then --sf-cat-pink→pink, -purple→violet, -orange→gold, -blue→cyan, -teal→mint, -red→rose. Only three --sf-cat-* names have consumers (pink = ProductCard/SpecialOffers concern chips, blue = .sf-flag-trending, red = .sf-flag-hot); all six clear 4.5:1 on #0B0B0D and the three live ones clear it on #141416 too.`
- `03 · 2026-09-06 · --sf-gradient-announce was given a value the reference does not state · DESIGN_SYSTEM §2 only says the three announce gradients collapse to one. Chosen `linear-gradient(90deg, #141416 0%, #2A2330 100%)` — the surface tone running into the violet-tinted stop that ends --sf-gradient-brand, so the two read as one family. Nothing consumes it yet (AnnouncementBar still paints --sf-color-primary); Prompt 09 wires it up.`
- `03 · 2026-09-06 · --sf-shadow-focus is now the single ring DESIGN_SYSTEM §2 specifies, not the old two-layer one · It was `0 0 0 2px var(--sf-color-bg), 0 0 0 4px var(--sf-color-focus-ring)` (a ground-coloured gap so the ring cleared 3:1 on ivory, white and sand alike). §2 specifies `0 0 0 3px rgba(245,215,110,.55)`, which is what one ground needs. The two component-scoped overrides that re-pin the gap layer to their own band (Footer.module.css:36-38, HeroSection.module.css:68) still work — they set the whole property.`
- `03 · 2026-09-06 · The acceptance greps have exactly two documented exceptions, both verified benign · (a) `grep -rn "\.dark\b\|body\.light\|prefers-color-scheme" src public --include=*.css --include=*.html --include=*.js` returns ONE line: `adminTheme.js:106 backgroundColor: palette.primary.dark`. That is MUI's palette API (the pressed indigo), not a theme-mode selector, and cannot be renamed. The CSS-only form of the same grep returns 0. (b) The token-coverage script reports 26 `--sf-footer-*` / `--sf-hero-*` / `--sf-slide-offset` names as "missing" from storefront-tokens.css. They are component-scoped aliases declared in Footer.module.css:28-38 and HeroSection.module.css:57-68 (and, for --sf-slide-offset, set inline from HeroSection.js:340 with a `var(…, 0)` fallback) — deliberately local, not global tokens. A second script confirms every consumed `--sf-*`/`--brand-*` name is declared somewhere in src.`
- `03 · 2026-09-06 · buildAdminTheme keeps its (mode) signature and its dead light branch · The prompt says "keep buildAdminTheme(mode) but make dark the only value callers pass", and the palette recolour is explicitly Prompt 32's. Both callers now pass the literal "dark" through useMemo with a [] dependency list. The light half of every ternary in adminTheme.js is unreachable until Prompt 32 deletes it.`
- `03 · 2026-09-06 · Six files outside the prompt's expected-files list were touched, each to keep a token honest · Footer.module.css / HeroSection.module.css / ProductCard.module.css / AboutUs.module.css / Home.module.css / FeaturedProducts.module.css carry the --sf-color-primary-contrast re-pointings and the .wishlistBtn fix above; SearchModal.module.css, CategoriesDrawer.module.css, ReviewModal.module.css, ReviewsSection.module.css, Products.module.css and Wishlist.module.css only lost a `body.dark` sentence from a docblock (the acceptance grep counts comments). src/utils/authStorage.js lost one line of its storage-policy note that still listed a stored theme preference. src/pages/Profile/Profile.js:697 lost the word "appearance" from the Settings row subtitle, which promised a control this prompt removed.`
- `03 · 2026-09-06 · The old brand name was cleared from all 17 touched files that still carried it in a docblock, ahead of Prompt 35 · The guardrail forbids leaving Meghali's Silk identifiers "in touched files", and every one of these was a one-line header title. Prompt 35's sweep now has less to do, not more.`

## Open TODOs

Carry-overs that a later prompt (or the developer/owner) must pick up (format: `NN · item · owner · target prompt`).

- `01 · Baseline works: add to cart from a card (guest, 0 → 1) and from the PDP (5 → 6 items); quantity + in the drawer (6 → 7); remove line (7 → 2); coupon MUGA500 (−₹500.00 — savings −₹3,500 → −₹4,000, total ₹18,500 → ₹18,000); checkout through all four steps to an order confirmation on COD (ORD-MTPU49W5-8QEA); that order then listed in /orders (4 rows) and in Admin → Orders (12 rows); wishlist toggle as guest (0 → 1) and as a signed-in user (1 → 0 → 1, both directions); search "Muga" (26 product links); light/dark toggle (body "dark react-loaded" ↔ "react-loaded light" — to be removed by Prompt 03); review from a delivered order (created review id 13, product 22, rating 4, status "pending"); cancel a processing order (ORD-MTPU49W5-8QEA → fulfillmentStatus "cancelled", paymentStatus "voided" — the cascade ran); address book in /profile → Addresses: add, edit (city Guwahati → Jorhat, persisted) and delete all confirmed against the API. · developer · —`
- `01 · db.json product 1 ("Sualkuchi Muga Mekhela Chador — Natural Gold") carries corrupted prices in the committed seed: price 41, comparePrice 380000000000, variants ₹3,25,00,00,000 and ₹3,35,00,00,00,000 (the PDP renders them). Left as-is — Prompt 06 reseeds db.json wholesale — but do not treat these numbers as a pricing reference. · Prompt 06 · 06`
- `01 · No user has a delivered order in the committed seed (user 1: shipped ×2, cancelled ×1). To exercise "review from a delivered order" the baseline had to PATCH one order to shippingStatus "delivered" (OrderHistory.js:72 derives the status from that field, :313 gates reviewing on it). Worth seeding at least one delivered order so the review path is reachable out of the box. · Prompt 06 · 06`
- `01 · Storefront placeholder images are served from placehold.co; a first capture run logged intermittent ERR_NAME_NOT_RESOLVED for them at 1280 px (clean on re-run). Not a code defect — but the Prompt 06 seed should prefer the hosts verified below. · Prompt 06 · 06`
- `02 · Eight files still carry the literal "Meghali" in a comment or a header docblock: AuthModal.module.css:12, BottomNav.module.css:2, ErrorBoundary.js:42, Footer.module.css:2, Header.module.css:2, SidebarMenu.module.css:2, storefront/ProductCard.js:17, theme/tokens.js:59. None was touched by Prompt 02 (the prompt's own verification grep excludes them), and each belongs to the prompt that rewrites its file — but Prompt 35's sweep must close all eight. storefront-tokens.css keeps two more (palette headings) which Prompt 03 rewrites. · Prompt 35 · 35`
- `02 · db.json still seeds the old identity, so mock mode shows Meghali contact rows, tagline, store name and social marks, and the document title comes from settings.seo.metaTitle. Every one of those resolves to the brand.js values (or hides) the moment the API is unreachable, which is how it was verified. · Prompt 06 · 06`
- `02 · TrustStrip and the Home promises row still render the old four badges rather than brand.trustBadges (TrustStrip keeps its own list; Home maps TRUST_BADGES, which is now the three LAMIKAA badges). The Footer promise row was switched to brand.trustBadges[0] in this prompt. · Prompt 15 · 15`
- `03 · The AnnouncementBar is now a full-bleed CHAMPAGNE GOLD band (it paints --sf-color-primary with --sf-color-primary-contrast type). That is the token mapping DESIGN_SYSTEM §2 mandates and it reads at 13.4:1, but a gold strip across the top of every page overspends the §2 balance budget (gold ≈ 10%). --sf-gradient-announce is already declared for it; re-point AnnouncementBar.module.css:15-16 at that gradient + --sf-color-text when the bar is rebuilt. · Prompt 09 · 09`
- `03 · Eight files still carry the literal "Meghali" in a comment or docblock, down from the sixteen Prompt 02 recorded: AuthModal.module.css and ErrorBoundary.js and theme/tokens.js and the five module headers listed there are now clean (this prompt touched them). What remains is in files this prompt did not touch — Header.module.css:2, storefront/ProductCard.js:17 and the six page docblocks under src/pages that carry no theme code. Prompt 35's sweep still owns them. · Prompt 35 · 35`
- `03 · adminTheme.js still builds the indigo/slate admin palette from a (mode) ternary whose light half is now unreachable. Prompt 32 recolours the palette to LAMIKAA and should drop the parameter at the same time (both callers pass the literal "dark"). · Prompt 32 · 32`
- `03 · Two aliases exist only to keep un-rebuilt components compiling and must die with them: --sf-color-brand-green-deep (Footer, HeroSection, CTASection, Newsletter) and --brand-logo-bg (declared, currently consumed by nothing). --sf-gradient-heritage, --sf-gradient-announce-1/2/3 and --sf-cat-* are in the same position. · Prompt 35 · 35`
- `03 · colors.js exports `DARK = PALETTE` purely for compatibility; nothing imports DARK any more (ThemeContext moved to PALETTE in this prompt). Drop the alias. · Prompt 04 · 04`
- `03 · The type scale, font families and --sf-font-light are unchanged on purpose — DESIGN_SYSTEM §6 is Prompt 04's contract. storefront-tokens.css still names Cormorant Garamond and Inter, and index.html still loads them. · Prompt 04 · 04`

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

## Prompt 03 record (2026-09-06)

### The token layer

`src/theme/storefront-tokens.css` is 318 lines and declares **one** `:root` block (`color-scheme: dark`), plus a `max-width: 768px` block that halves `--sf-glass-blur` and the unchanged `prefers-reduced-motion` block. The `body.dark` block is gone.

| Group | Tokens |
|---|---|
| New this prompt | `--sf-color-pink` `#FF4FD8`, `--sf-color-violet` `#8B5CF6`, `--sf-color-cyan` `#5DE7FF`, `--sf-gradient-signature`, `--sf-gradient-brand`, `--sf-gradient-announce`, `--sf-glass-bg/-bg-strong/-border/-blur/-fallback`, `--sf-glow-pink/-violet/-gold`, `--sf-shadow-1/-2`, `--sf-section-y`, `--sf-container-wide`, `--sf-z-header` 50, `--sf-z-toast` 1200, `--sf-concern-pink/-violet/-cyan/-gold/-mint/-rose` |
| Re-valued | every colour token (§2), radii 2/4/8/12 → 8/14/20/28, `--sf-ease` → `cubic-bezier(.2,.7,.2,1)`, durations .2/.35/.6 → .16/.32/.6, `--sf-shadow-focus` → `0 0 0 3px rgba(245,215,110,.55)`, `--sf-shadow-md/-lg` re-pointed onto `--sf-shadow-1/-2` |
| Kept as aliases (Prompt 35 removes) | `--sf-color-emerald/-hover/-contrast`, `--sf-gradient-heritage`, `--sf-gradient-announce-1/2/3`, `--sf-cat-pink/purple/orange/blue/teal/red`, `--sf-color-brand-green-deep`, `--brand-logo-bg` |
| Deleted | `--sf-color-brand-green` (no consumer) |
| Untouched (Prompt 04 owns them) | every `--sf-font-*`, `--sf-text-*`, `--sf-leading-*`, `--sf-tracking-*` |

`colors.js` → `PALETTE` (+ `DARK = PALETTE` for one prompt). `tokens.js` → `radius {8,14,20,28,999}`, `containerWide: 1440`, `sectionY`. `motion.js` → `EASE = [0.2, 0.7, 0.2, 1]`, `DURATION = {fast:.16, base:.32, slow:.6}`. `ThemeContext.js` builds one `createTheme` at module scope (`mode: "dark"`, `shape.borderRadius: 14`, MuiButton pill/gold/no-elevation, MuiCard, MuiTextField gold focus on `#1C1C20`, MuiDrawer/MuiAppBar/MuiPaper/MuiMenu on `#141416` with `backgroundImage: none` and `rgba(255,255,255,.08)` hairlines, MuiIconButton touch override) and clears `localStorage.theme` once on mount.

### The 21 mode consumers, and what came out of each

| File | Removed |
|---|---|
| `components/Header/Header.js` | `useTheme` import, `{ isDarkMode, toggleTheme }`, the toggle `IconButton` (was 455-465), the `DarkModeOutlined`/`LightModeOutlined` imports |
| `components/SidebarMenu/SidebarMenu.js` | same three, plus the "Dark mode" switch row (was 601-628). The Settings section keeps its Help-centre row |
| `components/AdminLayout/AdminLayout.js` | `useThemeContext` import + `{ mode, toggleTheme }`, the theme `IconButton`/`Tooltip` (was 492-505); `buildAdminTheme(mode)` → `useMemo(() => buildAdminTheme("dark"), [])` |
| `pages/Profile/Profile.js` | `useTheme`, the Appearance switch block inside `renderSettingsSection` (was 1066-1084), 2 `styles.dark` reads; the Settings row subtitle lost "appearance" |
| `pages/Admin/AdminLogin.js` | `useTheme` import + `{ isDarkMode }`; `buildAdminTheme(isDarkMode ? …)` → `useMemo(() => buildAdminTheme("dark"), [])` (`useMemo` added to the React import) |
| `components/CartDrawer/CartDrawer.js`, `BottomNav/BottomNav.js`, `AuthModal/AuthModal.js` | `useTheme`, `{ isDarkMode }`, the `themeClass` variable and its use in the className template |
| `components/CTASection/CTASection.js`, `Newsletter/Newsletter.js` | `useTheme`, `{ isDarkMode }`, `${isDarkMode ? styles.dark : ""}` |
| `pages/OrderConfirmation` (4), `SpecialOffers` (3), `OrderHistory` (2), `Checkout` (2), `HelpCenter`, `Support`, `PrivacyPolicy`, `CookiePolicy`, `RefundPolicy`, `TermsOfService` (1 each) | `useTheme`, `{ isDarkMode }`, N × `${isDarkMode ? styles.dark : ""}` → `className={styles.page}` |
| `pages/ProductDetails/ProductDetails.js` | the same, in its `${(isDarkMode && styles.dark) || ""}` form |

### CSS

27 modules lost a `.dark` rule and/or a `body.dark` sentence. The rules were: `color-scheme: dark` markers (11 pages + CartDrawer + AuthModal, which also had a `.light` twin), `.bottomNav.light, .bottomNav.dark` (folded into the base `.bottomNav`, which already set the same two properties), and `.dark.cta` / `.dark.newsletter` (a `--sf-color-primary-dark` background override). `storefront-primitives.css` lost its `body.dark` comment and had `.sf-btn--gold` re-labelled. `App.css` collapsed to one `body.admin-area` ground rule, one set of admin scrollbar rules, one `body:not(.admin-area) .swal2-popup` block (gold confirm, pill action buttons) and one `body.admin-area .swal2-popup` block carrying the previous dark-admin values verbatim; its three dead `transition: background-color` declarations went with the toggle.

### Verification

| Check | Result |
|---|---|
| `grep -rn "isDarkMode\|toggleTheme\|useThemeContext\|localStorage.getItem(\"theme\")\|setItem(\"theme\"" src public` | **0** |
| `grep -rn "\.dark\b\|body\.light" src --include=*.css` | **0** |
| `grep -rn "\.dark\b\|body\.light\|prefers-color-scheme" src public --include=*.css --include=*.html --include=*.js` | **1** — `adminTheme.js:106 palette.primary.dark` (MUI palette API, documented) |
| `grep -n "prefers-color-scheme\|localStorage" public/index.html` | **0** |
| Every consumed `--sf-*`/`--brand-*` resolves | yes (26 are component-scoped aliases in Footer/HeroSection modules, by design) |
| `CI=true npm run build` | exit 0, no warnings |
| `npm test -- --watchAll=false` | exit 0 — 1 suite / 45 tests skipped (the live-API suite; unchanged from the Prompt 01 baseline) |

Browser QA (Chromium, production build in mock mode against JSON Server on a scratchpad copy of `db.json`, `prefers-color-scheme: light` emulated throughout):

- Every page: `getComputedStyle(body).backgroundColor === "rgb(11, 11, 13)"`, `document.documentElement`'s `color-scheme` is `dark`, `--sf-color-bg` is `#0b0b0d`, `--sf-color-gold` is `#f5d76e`, `body.className === "react-loaded"` (no `dark`, no `light`), `meta[name=theme-color]` is `#0B0B0D`.
- A `theme=light` seeded into `localStorage` before the load is **`null` after one reload** and nothing about the page changes.
- No toggle anywhere: `aria-label` sweep for /light mode|dark mode|switch to/ returns `[]` on the storefront header and on `/admin/dashboard`; `"Dark mode"` is absent from the expanded mobile-drawer Settings section; `"Appearance"` is absent from `/profile`.
- Flows exercised on the new palette: PDP → Add to cart → cart drawer (gold "Proceed to checkout" pill, near-black label), `/checkout` (gold step marks, gold totals), `/products`, `/profile` signed in → Settings (Change password only — `document.querySelectorAll("[role=switch]").length === 0`), the mobile drawer's expanded Settings section, admin login → `/admin/dashboard` → `/admin/orders` (indigo tables, soft status chips, all legible).
- **No horizontal scroll** at any of 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 on `/`, `/products`, a PDP, `/checkout`, `/profile` and `/admin` — 42 combinations, `documentElement.scrollWidth <= clientWidth` on every one.
- `prefers-reduced-motion: reduce` emulated: `--sf-duration` resolves to `0s` and the ground is unchanged at `rgb(11, 11, 13)`.
- **Zero non-network console errors** across that walk. The only console noise is `ERR_CONNECTION_RESET` for the seeded placehold.co / Cloudinary images, which this sandbox cannot reach.
