# PROGRESS — LAMIKAA NATURALS rebuild

Update this file at the end of every prompt (Handoff step). Status values: `pending` · `in-progress` · `complete` · `blocked` · `skipped (reason)`. Commit hashes are short SHAs on branch `feat/lamikaa-naturals`.

| # | Prompt | Status | Date | Commit | Notes |
|---|---|---|---|---|---|
| 01 | Project baseline and verification harness | complete | 2026-09-06 | (this commit) | Node v22.17.0 / npm 10.9.2. `npm ci` clean; `CI=true npm run build` **exit 0 with no warnings — no ESLint fixes were needed**; `npm test -- --watchAll=false` exit 0 (1 suite / 45 tests skipped). Both api modes checked (Task 5). All 15 admin screens open, zero console errors. 22 baseline screenshots in `prompts/_baseline/` (git-ignored). Brand footprint re-counted at **531 — matches `BRAND_FOOTPRINT.md`, not regenerated**. 10/10 real asset URLs + the transformation URL return 200. See "Baseline record" below. |
| 02 | Brand config module and identity assets | complete | 2026-09-06 | (this commit) | `src/config/brand.js` is now the single source of brand truth; `src/utils/{placeholders,cloudinary}.js` and `src/components/brand/Logo.{js,module.css}` added. All **10** old logo constants replaced by `<Logo>` (header, mobile drawer, footer, auth modal, admin shell, admin login) — `grep -rn "meghali-silk-logo\|v1787592407\|v1787592405" src public` → **0** (was 15: 10 constants + 2 token comments + 3 in index.html). Favicons regenerated from the LAMIKAA mark via Cloudinary (`f_ico` accepted — **no Node ICO fallback needed**); 7 files verified by header at 16/32/48/180/192/512/512. `index.html`, `manifest.json`, `package.json`, `.env*` re-pointed; `README.md` stubbed. `FREE_SHIPPING_THRESHOLD` retired to `null` and all four consumers hide rather than promise. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (1 suite / 45 tests skipped). Browser QA at 390/768/1280 + API-unreachable run: `document.body.innerText.includes("{{")` **false** on `/`, `/help`, `/support`; no `a[href*="{{"]`. See "Prompt 02 record" below. |
| 03 | Design tokens and single dark theme | complete | 2026-09-06 | (this commit) | Token layer rewritten to the LAMIKAA "Luxury Skincare After Dark" set — **one** `:root` block with `color-scheme: dark`; `body.dark` deleted. All **21** mode consumers + `ThemeContext` cleaned: `grep -rn "isDarkMode\|toggleTheme\|useThemeContext\|localStorage.getItem(\"theme\")\|setItem(\"theme\"" src public` → **0**. **27** CSS modules lost their `.dark` rules/comments; `grep -rn "\.dark\b\|body\.light" src --include=*.css` → **0**. Pre-mount theme IIFE deleted from `index.html` (static `#0b0b0d` ground, `theme-color` `#0B0B0D`); `ErrorBoundary` down to one literal palette. A scripted contrast audit (`scratchpad/contrast2.py`, 4 950 CSS rule blocks) found **4** fill/label pairs below 4.5:1 after the palette flip — all fixed in the token layer, all re-verified. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (1 suite / 45 tests skipped — unchanged baseline). Browser QA in mock mode with `prefers-color-scheme: light` emulated throughout: body ground `rgb(11,11,13)` and `color-scheme: dark` on every page, `body.className === "react-loaded"`, a seeded `theme=light` is **gone after one reload**, no toggle in header / mobile drawer / profile settings / admin header, **no horizontal scroll** at 360/390/414/768/1024/1280/1440 across six routes (42 combinations), `--sf-duration` → `0s` under reduced motion, and **zero non-network console errors** on home, PDP, cart drawer, checkout, profile → Settings, `/admin/dashboard` and `/admin/orders`. See "Prompt 03 record" below. |
| 04 | Typography and global styles | complete | 2026-09-06 | (this commit) | Fraunces (display) + Manrope (UI) installed through **one** Google Fonts `<link>` — no `@import`, no `@font-face`, no self-hosting; `grep -rn "Cormorant\|Inter" src public --include=*.css --include=*.html --include=*.js` leaves only the four Manrope fallback-stack entries (plus `isIntersecting`, an unrelated identifier). Type scale, leading and tracking are DESIGN_SYSTEM §6 verbatim; `--sf-font-light` deleted and its **29** consumers moved to `--sf-font-normal` (`grep -rn "sf-font-light" src | wc -l` → 0). New base layer in `index.css` (document, body, all six heading levels on Fraunces, selection, `body[data-scroll-lock]`); `storefront-primitives.css` 437 → 880 lines with **16 new classes** and every existing name kept. SweetAlert2 re-skinned to glass. MUI typography now reads the tokens directly. Browser-verified at 360/390/768/1280 with the real faces loaded: **zero horizontal overflow, every `h1`/`h2` fits, no scale token needed adjusting**; 14 focus stops walked, all visibly ringed; reduced motion confirmed dead (glow animation `none`, all transitions 0s, `scroll-behavior: auto`). `CI=true npm run build` exit 0 with no warnings; `npm test -- --watchAll=false` exit 0 (1 suite / 45 tests skipped). One departure from the brief — the `"SOFT" 30` axis — recorded in Decisions. See "Prompt 04 record" below. |
| 05 | Shared UI primitives and media helpers | complete | 2026-09-06 | (this commit) | 13 components in `src/components/ui` (+12 CSS modules), 3 hooks, `utils/{product,contentBlocks}.js` with 2 test suites. `CI=true npm run build` **exit 0, no warnings**; `npm test -- --watchAll=false` = **2 suites passed / 1 skipped** (20 passed, 45 skipped). `grep -rn "dangerouslySetInnerHTML" src` → **0** (whole tree). `normalizeProduct` verified against **all 6 current db.json products** (images-only shape: `images[]` identical round-trip, one primary, `image === images[0]`) and against the seeded `media[]` shape. Browser QA on `/_playground` at **360 / 390 / 414 / 768 / 1024 / 1280 / 1440**: no horizontal overflow, **zero React console warnings** (no `fetchPriority` warning). Focus traps, Escape, focus restore, `body[data-scroll-lock]` and `body[data-drawer-open]` all verified in Chromium; accordion ↑/↓/Home/End verified; VideoPlayer Space/K/M/←/→ verified against a range-serving host. Reduced motion measured: every transition 0s, `sf-breathe` and the skeleton shimmer `animation-name: none`. One real defect found and fixed on the way (`.sf-card--hover` and `.sf-glow` fighting over one `::before`) — see the record below. `/_playground` is **temporary**; Prompt 35 deletes it. |
| 06 | Data model and seed (db.json) | complete | 2026-09-06 | (this commit) | `db.json` rewritten from 20 Meghali collections to **23 LAMIKAA collections** (96 KB → 118 KB): 8 products with `media[]`, 7 categories, 11 concerns, 3 rituals, 8 grouped FAQs, `siteContent` (7 blocks), 3 `announcements` (ex-`banners`), a product-driven `heroConfig`, tokenised `settings`, and neutral fixtures for every commerce collection. All **8 cover URLs verified character-exact** against `PRODUCTS.md` §2 by parsing that table. `grep -c "meghali\|Meghali\|silk\|Silk\|mekhela\|saree\|Sualkuchi\|Kolkata, West Bengal" db.json` → **0** (the single `Asia/Kolkata` is the timezone). A 150-assertion validation script passed every check, and **all 48 distinct URLs in the seed returned 206** — **no host swap was needed**. JSON Server starts clean; all 24 collection endpoints answer 200; `DELETE /reviews/2` → **200** (not the old 500) and a re-`POST` restored the file byte-identical, on a `JSON_SERVER_DB` copy so the committed seed stayed untouched. `CI=true npm run build` exit 0, no warnings; `npm test` exit 0 (2 suites / 20 passed, the live suite skipped as in every prior baseline). Browser QA over 16 routes: **no runtime crashes**, the only 404 is the expected `GET /banners` (Prompt 07). `server.js` unchanged. See "Prompt 06 record" below. |
| 07 | api.js contract extension in both modes | complete | 2026-09-06 | (this commit) | `api.js` 2 797 → 3 314 lines. **`banners` is gone from `src/` entirely** — `grep -rn "banners\|Banner" src --include=*.js` → **0** (was 51), and `grep -rni "banners" src` over every file type → **0**. Every product read in both namespaces now goes through `normalizeProduct()` and every product write through `syncProductMedia()`. New: `products.{getHeroProducts,getByCategorySlug,getByConcern}`, a re-tiered `getRelated`, a gated `getReviews(id, {includeSample})`, the `concerns`/`rituals`/`siteContent`/`announcements` namespaces (+ the exported pure `resolveRitualSteps`), and 19 admin functions (concerns ×4, rituals ×5, site content ×2, announcements ×5, `setHeroOrder`, plus normalised product reads). **No existing signature changed** — the two additions are optional parameters — and `extractData/extractMeta/isVisibleProduct/visibleProducts/getErrorMessage` plus the wallet/refund/return/cancel cascades are untouched. Mock mode was exercised for real against JSON Server through the actual module: **21 assertions, all passing**, covering every acceptance check (8 ordered hero products, `serums` → 1, `hydration` → 3, `morning-glow` → 4 resolved steps with the body ritual's alternative product, `siteContent.get("about")`, 3 announcements, `getReviews(1)` → `[]` / `[1 sample]`, `setHeroOrder` reversed and restored, `updateProduct` rewriting `images[]` from `media[]`) plus the schedule window, the draft gate, the CRUD round-trips and the site-content merge. Browser QA in Chromium: the home hero renders **all eight products** through the shim (eight distinct headlines, eight `Explore the …` CTAs on the right `productPath`), **zero console errors** on `/`, `/products`, a PDP, `/admin/hero-section` and `/admin/settings`; no horizontal overflow at 390. `CI=true npm run build` exit 0 with no warnings; `npm test -- --watchAll=false` exit 0 (2 suites / 20 passed, live suite skipped). `db.json` unchanged (`git diff --stat db.json` empty). `REPO_MAP.md` §3 rewritten as the final contract with §3.4 "Laravel endpoints to implement" (20 routes + the product payload). See "Prompt 07 record" below. |
| 08 | Routing, IA, lazy loading and SEO hook | complete | 2026-09-06 | (this commit) | The LAMIKAA route map is live: 25 storefront paths + the 16 unchanged admin paths, **every** Meghali URL redirected (16/16 verified in Chromium), a real 404 instead of `<Navigate to="/">`, `React.lazy` on all 34 pages but Home (**51 JS chunks**, was 2), and a dependency-free `useSeo` on 15 pages. Link sweep: 26 files; `grep -rn -E '"/(products|help|support|privacy|terms|cookies|refund)("|\?)' src --include=*.js` → **18, and not one is a link**: 16 are `api.get("/products")` REST endpoint paths in `services/api.js` and 2 are the new `utils/routes.test.js` assertions that those paths are gone. Zero in `LegacyRedirects.js`'s own exclusion, zero storefront links (see the Decisions log). New: `hooks/useSeo.js`, `components/routing/{LegacyRedirects,RouteFallback,AuthRoute}.js`, `pages/NotFound/*`, `pages/_ComingSoon/ComingSoon.js`, `utils/routes.test.js` (14 tests). `CI=true npm run build` exit 0 **no warnings**; `npm test` exit 0 (3 suites / 34 passed). |
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
- `04 · 2026-09-06 · PILL BUTTONS SYSTEM-WIDE, and sentence case with them · The brief allowed "pill or 14px"; pill is the decision and it is now the whole system — .sf-btn, .sf-chip, .sf-badge-discount, .sf-pill-save, .sf-ribbon-premium, .sf-flag*, the skip link, the SweetAlert2 confirm/cancel and the MUI button override are all --sf-radius-pill. Labels went with it: text-transform: none in Manrope 600 at letter-spacing .02em. The tracked uppercase label survives in exactly ONE place, .sf-eyebrow, which is what makes it read as a signpost rather than as chrome.`
- `04 · 2026-09-06 · FONT HOSTING: Google Fonts <link>, one request, no self-hosting · The prompt allows self-hosting under public/fonts/ only if the Google request fails in the build environment. It does not: the exact css2 URL returns 200 with both families and font-display: swap on every face. So public/index.html keeps two preconnects + ONE css2 link + the Material Icons link (admin), src/index.css keeps its "do not @import fonts" rule and declares no @font-face, and nothing is vendored. NOTE for whoever runs the browser QA here: this sandbox's egress proxy RESETS fonts.gstatic.com, so a headless run falls back to Georgia unless the faces are served locally — the QA scripts in the scratchpad fulfil both font URLs from a local copy for exactly that reason. The <link> itself is correct and was fetched successfully with curl.`
- `04 · 2026-09-06 · font-variation-settings: "SOFT" 30 is NOT shipped, deliberately, and the reason is measured · DESIGN_SYSTEM §6 asks for it on headlines ≥ 40px. The font link §6 also specifies requests Fraunces:opsz,wght@…, and the file Google serves for that request carries exactly those two axes — fontTools reports fvar = [opsz 9–144, wght 100–900], no SOFT — so the declaration would be inert. Getting a real SOFT axis means requesting it (family=Fraunces:opsz,wght,SOFT@9..144,400,30;9..144,500,30;9..144,600,30, verified 200 and verified to return fvar = [opsz, wght, SOFT 0–100]), which takes the latin subset from 67,304 to 120,788 bytes — +54KB on the storefront's largest font asset, for a terminal rounding visible only at h1/h2 sizes. On a mobile-first storefront with a Lighthouse target that is the wrong trade. The finding, the exact replacement URL and the two lines that reverse it are written at the heading block in src/index.css; DESIGN_SYSTEM §6 carries the same note. Owner's call to flip it.`
- `04 · 2026-09-06 · NO scale token needed adjusting for Fraunces (Task 8), and that is a measurement rather than an assumption · Fraunces sets materially wider than the Cormorant it replaces and the display tier grew at the small end (--sf-text-4xl 40px → 44px at 360px, -5xl 48px → 53.6px), so the sweep was run for real: Chromium at 360/390/768/1280 across home, shop, PDP, checkout, about and admin, with the actual woff2 faces served locally. Result: document scrollWidth === innerWidth everywhere, every h1/h2 scrollWidth === clientWidth, and the only element extending past the viewport is .chipGroup inside .chipScroller, which is a deliberate overflow-x: auto rail (Products.module.css:260). The guard that makes this safe under a longer product name is `overflow-wrap: anywhere` on all six heading levels in the base layer — `anywhere` and not `break-word`, because only `anywhere` also shrinks min-content and so stops a heading forcing a flex/grid track wider than the screen.`
- `04 · 2026-09-06 · MUI typography READS the tokens (var(--sf-text-*)) instead of mirroring them as rem literals · The prompt says "h1/h2/h3 … at --sf-text-5xl/4xl/3xl rem equivalents". Those tokens are clamps, so there is no rem equivalent — and MUI passes a typography fontSize straight through to CSS, so var() is as valid as a length. src/index.css is imported by src/index.js before React mounts, so the custom properties are always resolved by the time MUI paints. This keeps ONE definition of the scale (the guardrail: tokens are the only styling source). `palette` still mirrors colors.js, because MUI has to compute alpha variants from real colour values and cannot do that with a var().`
- `04 · 2026-09-06 · Two literal values the prompt spells out are written as color-mix() of the token that produces them · SweetAlert2's popup ground (specified rgba(20,20,22,.94)) is `color-mix(in srgb, var(--sf-color-surface) 94%, transparent)` — --sf-color-surface IS #141416 = rgb(20,20,22), so the computed value is identical (verified in the browser: color(srgb 0.0784314 0.0784314 0.0862745 / 0.94)) — and the gold button shadow (specified rgba(245,215,110,.25)) is `color-mix(in srgb, var(--sf-color-gold) 25%, transparent)`. Same pixels, no hardcoded colour, and both follow the palette if it moves. The 16px popup blur stays a literal length: it is deliberately NOT --sf-glass-blur (20px), because a popup already sits on its own backdrop scrim.`
- `04 · 2026-09-06 · .sf-flag-hot lightens its label; every other concern tint keeps the pure accent · Violet is the one --sf-concern-* value that fails AA as 12px text on its own 10% tint: measured 4.11:1 over --sf-color-surface (the pink equivalent is 5.73:1 and the ribbon's champagne is 10.5:1). The label is `color-mix(in srgb, var(--sf-concern-violet) 78%, var(--sf-color-text))` — same hue, 5.9:1 — while the tint and the hairline stay pure violet. .sf-ribbon-premium moved its label from --sf-color-gold-deep (4.69:1) to --sf-color-gold (10.5:1) for the same reason: the deep gold was chosen for a light-plate era that no longer exists.`
- `04 · 2026-09-06 · .sf-chip is 13px (0.8125rem), off the type scale, as the prompt specifies · It sits deliberately between --sf-text-xs (12px, the eyebrow) and --sf-text-sm (14px, the UI label): a chip is a control and has to read as one, but a row of them at 14px crowds a 360px screen. Weight 500 keeps it legible. The prompt's 36px resting height is kept, and so is the pre-existing `button.sf-chip, a.sf-chip { min-height: var(--sf-tap-target) }` — an INTERACTIVE chip is 44px, taller than its resting height, because WCAG 2.5.5 outranks the visual spec.`
- `04 · 2026-09-06 · .swal2-container moved from index.css to App.css and is now `z-index: max(var(--sf-z-toast), 2000) !important` · The prompt asks for the toast tier to be var(--sf-z-toast) AND for the existing 2000 !important override to stay, which are in tension — the token is 1200 and MUI's Dialog sits at 1300. max() resolves it honestly: the design-system tier stays in the declaration (so raising --sf-z-toast later carries this rule with it) and 2000 is the floor Swal needs to clear MUI's stack. SweetAlert2 11.26.3 exposes no --swal2-container-z-index variable — the 1060 is hardcoded in its stylesheet — so this rule is the only place it can be said. Moving it puts the whole Swal skin in one file, as Task 5 asks.`
- `04 · 2026-09-06 · The skip link's focus indicator is TWO rings, not one · It restyles to a gold pill (as specified) and it lands in the top-left corner — which is exactly where the AnnouncementBar sits, and that bar is filled with --sf-color-primary, the same champagne gold. A gold pill under a gold focus ring on a gold band is invisible; the keyboard walk caught it. `box-shadow: inset 0 0 0 2px var(--sf-color-primary-contrast), var(--sf-shadow-focus)` fixes it: the inset near-black hairline draws the pill's edge on the bar (13.4:1), the outer gold ring reads once the bar is dismissed and the pill sits on the page ground. One of the two is always doing the work. (The bar itself is already logged as an open TODO for Prompt 09.)`
- `04 · 2026-09-06 · Files outside the prompt's expected-files list were touched, in four groups, all mechanical · (a) 29 --sf-font-light consumers across 11 module stylesheets, rewritten to --sf-font-normal — the token was deleted, so this is the deletion. (b) src/components/ErrorBoundary/ErrorBoundary.js:82,105 — the only two hardcoded font stacks in JS; it renders when the app has failed, so it cannot use var() and has to name the families. Its h1 also moved 600/1.1 → 500/1.12 to match the display tier. (c) 11 files whose docblocks named Inter or Cormorant as the storefront's families — comments only, and the acceptance grep counts them. (d) src/theme/colors.js lost `export const DARK = PALETTE`, which Prompt 03's own Open TODO assigns to this prompt; it had no importers left.`

- `05 · 2026-09-06 · PriceBlock treats a price that is not a POSITIVE number as unknown by default, not just an explicitly passed `unknown` · The prompt asks for an `unknown` prop "so every legacy call site (cards, PDP, offers) is covered". Those call sites pass `getProductMinPrice(product).sellingPrice`, which is **0** for a product with no price — so an `unknown` prop alone would have covered nothing until each site was migrated (which this prompt may not do). The default is `unknown ?? !(current > 0)`. Nothing on this storefront is free, and "₹0.00" was never a correct render for an absent price; a caller that genuinely means zero passes `unknown={false}`.`
- `05 · 2026-09-06 · `isPriceKnown` is broader than the priceTBA formula the prompt gives, in two ways · The prompt defines `priceTBA = price == null || !Number.isFinite(Number(price))`. Added: (a) `price === ""` counts as unknown — `Number("")` is 0, which is finite, and an admin form's cleared field submits exactly that; (b) an explicit `priceTBA: true` on a record that still carries a number is honoured, so a merchant can hold a listing back without deleting its price (PRODUCTS.md stores `priceTBA` as a real field); (c) a VARIANT price counts as known even when the base price is absent, so `getProductMinPrice` and `isPriceKnown` can never disagree about a variant-priced product.`
- `05 · 2026-09-06 · An unsafe `[label](href)` renders as its own SOURCE TEXT, not as the bare label · The prompt says "anything else renders as text" without saying which text. Printing `[Tap](javascript:…)` verbatim makes the mistake visible to the author in the admin preview (Prompt 34) instead of silently shipping a link that stopped being one. `http://` is deliberately outside the safe list too — a mixed-content link on an https storefront is broken anyway. Pinned by `contentBlocks.test.js`.`
- `05 · 2026-09-06 · Off-site links from ContentBlocks get `rel="noreferrer"` and NO `target` · The prompt is silent on both. `noreferrer` costs nothing and stops the reader's current page leaking in the referer header; a `target="_blank"` the visitor did not ask for is a surprise, and announcing it accessibly costs more than it buys.`
- `05 · 2026-09-06 · `normalizeProduct` sets `image` as well as `images`, and does NOT reorder `media[]` · The prompt specifies `images` (primary first) only. `image` is the other derived mirror (order thumbnails, the admin table and `buildCartItem` read it), so leaving it stale would let the two disagree; it is always `images[0]`, empty string rather than undefined. `media[]` keeps its AUTHORED order because the PDP gallery (Prompt 26) is authored, not sorted — only `images` is re-ordered.`
- `05 · 2026-09-06 · `utils/product.js` and `utils/helpers.js` import each other, deliberately · `product.js` needs `getProductMinPrice` (pricing arithmetic has one home) and `helpers.js` needs `isPriceKnown` (the "is there a price at all?" predicate has one home). Both references are read at CALL time inside function bodies, never during module evaluation, so the cycle is inert under both webpack ESM and Jest's CJS interop. Verified by both test suites and a clean build.`
- `05 · 2026-09-06 · `GlassCard`'s `glow` renders a DEDICATED child node instead of putting `.sf-glow` on the card · A real defect, found in browser QA. `.sf-card--hover::before` (the hover lamp) and `.sf-glow::before` (the tone lamp) are the same pseudo-element on the same node; `.sf-card--hover` is declared later in the primitives, so it won on `opacity` (0), `inset` and `background` — the tone was silently ignored and the glow never appeared. The tone now gets an inert `z-index: -1` child, which also lets an interactive card carry both lamps. `.sf-card`'s `overflow: hidden` clips it, exactly as it already clips the hover lamp.`
- `05 · 2026-09-06 · `storefront-primitives.css` gained three overridable custom properties on the glow (a Prompt 04 file, extended rather than restyled) · DESIGN_SYSTEM §5 promises `GlowWrap` can set the tone's offset and intensity, but `.sf-glow::before` DECLARED `--sf-glow-x/-y` on the pseudo-element, which beats anything inherited from the host. The per-tone values are now `var(--sf-glow-offset-x, <same default>)` and `inset: var(--sf-glow-inset, -12% -8%)`, so a bare `.sf-glow` is byte-for-byte unchanged and `GlowWrap` can drive offset and size. `--sf-glow-opacity` already worked (no local declaration). The `--duo` second lamp MIRRORS the caller's offset so the pair separates rather than stacking.`
- `05 · 2026-09-06 · A glow BLEEDS, so its host must clip horizontally — recorded as a contract, not fixed globally · `.sf-glow::before` extends past its box by design, and at any width where the container fills the viewport that bleed becomes document overflow (measured: 443px of scroll at a 360px viewport before the fix). `/_playground` sets `overflow-x: clip` on the page (`clip`, not `hidden`, so no scroll container is created and sticky still works). NOT applied to `.sf-section` / `.sf-container` in the primitives: a full-bleed hero or a deliberately overflowing carousel inside a container would be clipped too, and that call belongs to the prompts that build them. Written into DESIGN_SYSTEM §7 as part of the GlowWrap contract.`
- `05 · 2026-09-06 · A collapsed Accordion panel is `visibility: hidden`, not `inert` · Its links and buttons must leave the tab order. `inert` is the modern answer but is unsupported on older Safari and forces an attribute React 18.2 warns about unless it is passed as a string; `visibility` removes the content from the tab order in every browser and transitions discretely, so it can be delayed until the collapse finishes. Verified in Chromium: the closed panel's link computes `visibility: hidden`.`
- `05 · 2026-09-06 · `Price.js` is the one component with no CSS module of its own · Task 5 asks for "one CSS module per component". Price is a thin adapter over PriceBlock and renders no markup of its own, so every style it could own — the "Price on launch" chip included — belongs in `PriceBlock.module.css`, beside the markup that uses it. A module holding one unused class is worse than no module.`
- `05 · 2026-09-06 · `Chip variant="concern"` HASHES an unrecognised tone onto the six concern accents · The six values exist (`--sf-concern-*`) but no slug→colour table does, and concerns are owner-editable data (Prompt 06). A hard-coded table here would either invent facts about concerns nobody has defined or silently drop new ones; the hash is stable, so a concern keeps its colour across pages and reloads, and Prompt 15 can pass an explicit `tone` to override.`
- `05 · 2026-09-06 · `VideoPlayer`'s progress hairline is decorative (`aria-hidden`), and the error path turns the NATIVE controls on · The prompt asks for both "a progress hairline" and "falls back to native controls if HTMLMediaElement errors (onError → show poster + 'Video unavailable')". A `role="progressbar"` updating four times a second is noise, not information, so the bar is decorative and the keyboard set is the real interface. On error the poster stays up under the notice AND `controls` is set, so the browser can still offer whatever it can do with the source.`
- `06 · 2026-09-06 · frequentlyBoughtTogetherIds for product 1 is [5, 8] — the PRODUCTS.md §6 example verbatim — while the other seven use "the next two steps of the product's primary ritual" · The prompt says "2 ids: the next ritual steps", which for the Face Wash would be [5, 7] (mist, serum), but the §6 JSON example the prompt calls the template for every row prints [5, 8]. The example is the more specific instruction, so product 1 keeps it and the rule is applied consistently everywhere else. Where a product is the LAST step of its ritual (8) or its ritual has fewer than two later steps (2, 3, 7), the list is topped up with the immediately PRECEDING step, and for the two-step body ritual with the range's step-1 cleanse (1).`
- `06 · 2026-09-06 · relatedProductIds is "the other steps of the product's primary ritual, in ritual order, first three" · PRODUCTS.md gives no explicit list. The rule reproduces the §6 example for product 1 ([5, 7, 8]) exactly. The Body Ritual has only two other members, so products 2 and 3 are topped up with the Face Wash (1) — the nearest cleansing step — rather than padded with an unrelated product.`
- `06 · 2026-09-06 · No heroEyebrow field was seeded · PRODUCTS.md §4 gives an eyebrow per slide ("Black Rice Ritual · 01 / 08") but §6's field list does not include it, and the string is fully derivable from heroOrder plus the slide count. Prompt 14 composes it; seeding a denormalised copy would have to be re-edited every time a product is added or deactivated.`
- `06 · 2026-09-06 · The scrub (product 6) carries fragranceNote: "" rather than the key being absent · PRODUCTS.md §5 says the field is "omitted" for this product because its pack does not print the sandalwood line. An empty string is falsy for every consumer (so nothing renders) AND keeps all eight records the same shape, which is what the admin product form and normalizeProduct expect. The distinction "no sandalwood line on this pack" is preserved either way.`
- `06 · 2026-09-06 · siteContent.about.body opens at BRAND.md §3.1 paragraph 2, not paragraph 1 · Paragraph 1 is already the `lede` field, and the prompt asks for both. Repeating it would print the same sentence twice on the page.`
- `06 · 2026-09-06 · The §3.2 closing line ("LAMIKAA is where the wisdom of nature meets the science of modern beauty…") was placed at the end of whyLamikaa.difference, not of whyLamikaa.body · In the brief it follows the four pillars, and the pillars render from the `pillars` ARRAY between `body` and `difference`. Leaving it in `body` would have printed the summary before the thing it summarises.`
- `06 · 2026-09-06 · impact.intro keeps the value chain as BRAND.md's verbatim bold run ("The journey is: **Farmer → FPC → …**") while about.body renders the same chain as a ::steps stepper · The prompt asks about.body for "the value chain as a ::steps block" and impact.intro for "3.3 paragraphs". Verbatim wins where verbatim was asked for; the stepper is used where a component was specified.`
- `06 · 2026-09-06 · siteContent.policies bodies use headings, lists and paragraphs but NO tables · The cookie policy's four cookie families were a real <table> in CookiePolicy.js, and contentBlocks.js has no table production (adding one would mean adding a nesting level to a grammar that deliberately has none). Each family became an h3 with its purpose and lifetime in prose. The light/dark line was dropped with it — the storefront has one theme.`
- `06 · 2026-09-06 · The seeded order timeline uses the action "Delivered", as the prompt lists, although AdminOrders.js writes "Marked delivered" for that transition · Both are display strings in the same statusHistory feed and neither is matched on anywhere. The prompt names the exact set of strings to seed, so it wins; the divergence is recorded here in case a later prompt starts keying off the action text.`
- `06 · 2026-09-06 · In every siteContent prose field, the FIRST sentence after a heading and the LAST sentence of a paragraph are token-free · Not a style preference — a correctness constraint the two transforms impose together, found by testing rather than by reading (see "The defect found on the way"). Token sentences are placed in the middle of a paragraph, or paired with a token-free sentence that carries the structure. The validation script now checks it.`
- `06 · 2026-09-06 · No host swap was made and no alternate URL was seeded · The pre-flight and the full 48-URL post-seed pass both returned 206 for every host (Picsum answers 302 → 206 once followed, which is normal for that service). The gtv-videos-bucket / w3schools alternates in PLACEHOLDER_ASSETS.md remain unverified from this environment and unseeded.`
- `06 · 2026-09-06 · The DELETE/POST exercise was run against a JSON_SERVER_DB copy of the seed rather than the tracked file · The prompt allows either; a copy means the committed db.json is provably byte-identical to what the generator wrote (md5 checked before and after), instead of relying on a round-trip restoring it. The round-trip was verified anyway: the copy came back deep-equal to the seed after the re-POST.`

- `07 · 2026-09-06 · NO live run: npm run test:live was NOT executed, because no staging URL exists · Task 9 permits it only if the owner has provided one in .env.local. There is no .env.local in the repository and .env.production points at the PRODUCTION host (https://core.lamikanaturals.com/api/v1), which the suite would WRITE to. The live branch was therefore reviewed by reading it line by line against the REPO_MAP §3 table — this is the Prompt 01 rule for "both api modes" — and the live suite was EXTENDED so the review is executable the moment a staging host exists: announcements/concerns/rituals/siteContent reads, the three new product reads, `getReviews(includeSample)`, `setHeroOrder` (set → read back → restore), admin CRUD for concerns/rituals/content/announcements, and the `images[] === image rows of media[]` invariant. It also lost its hardcoded old host (see below), so it can now be pointed at staging at all.`
- `07 · 2026-09-06 · The Laravel envelope for the two composite reads is `{ category, products }` / `{ concern, products }`, not a bare array · getByCategorySlug and getByConcern each need TWO records to render a page header plus a grid, and mock mode resolves both anyway. One request beats two, and the client tolerates a null first member so an unknown slug renders a 404 page rather than throwing. `products` is unwrapped through visibleNormalized() and re-sorted client-side, so a backend that returns them unordered still produces the documented order. Written up as endpoints 2 and 3 in REPO_MAP §3.4.`
- `07 · 2026-09-06 · Filtering and sorting that the prompt specifies for the mock branch only is applied in BOTH branches · concerns.getAll (order), rituals.getAll (isActive + sortOrder), announcements.getAll (isActive + start/end window + sortOrder), getHeroProducts (heroOrder), getByCategorySlug/getByConcern (heroOrder then name). The whole point of this prompt is that a caller cannot tell which backend answered; a rail whose order depends on the mode fails that. The gate is a no-op against a server that does the same thing server-side, and the documented contract asks the backend to do it too. Precedent: categories.getAll already filtered and sorted in both branches before this prompt.`
- `07 · 2026-09-06 · getRelated sorts the WHOLE candidate list known-price-first, then slices to limit · "Never returns priceTBA products first (stable-sort known-price first)" can be read as sort-then-slice or slice-then-sort. Sort-then-slice is the reading that actually delivers the intent — with five of eight products priceTBA, slicing first can leave a rail of four "Price on launch" cards. The partition is explicit (two filters concatenated) rather than a comparator, so curation order provably survives inside each group instead of depending on sort stability. Verified: the serum's rail returns products 1,2,6 (priced) before 3,4,5,8 (TBA).`
- `07 · 2026-09-06 · The temporary admin screen ADAPTS announcement rows rather than writing slides straight onto them · A literal one-for-one swap of the five banner functions would have destroyed data: admin.updateAnnouncement PUTs the whole row, so saving from a screen that has no `text`, `startsAt` or `endsAt` control would have emptied all three and silently broken the announcement bar. AdminHeroSection.js therefore reads rows through rowToSlide() (announcement `text` → the headline field, so the three seeded rows are recognisable instead of "Untitled slide" ×3) and writes them back through slideToRow() (headline → `text`, schedule window preserved). The slide-only fields are still carried onto the row exactly as the prompt specifies; they are simply inert. Verified in the browser: the tab reads "Announcements (temporary) (3)" and lists the three seeded texts.`
- `07 · 2026-09-06 · Four files outside the prompt's expected-files list were touched, each forced by an acceptance criterion or a guardrail · AdminSettings.js:138 is the SECOND admin consumer of getBanners (the prompt names only AdminHeroSection) — its dashboard card would have thrown; it now reads getAnnouncements and counts announcements. api.live.test.js carried six banner calls and the acceptance grep counts it. AuthModal.{js,module.css} and AdminSpecialOffers.js carried the only other `Banner` identifiers in src — an unrelated inline alert strip (errorBanner/infoBanner/infoBannerLink → errorNote/infoNote/infoNoteLink, renamed in both files together) and one "Hero Banner" section label (→ "Hero copy"). Pure renames; no behaviour, layout or token changed.`
- `07 · 2026-09-06 · api.live.test.js lost its hardcoded old host in THIS prompt, not in Prompt 35 · 00_INDEX §3 adaptation 17 schedules the fix for 35, but the assertion names the Meghali backend and the guardrail forbids leaving that identifier in a touched file. It is now `expect(BASE_URL).toMatch(/^https:\/\/.+\/api\/v1$/)` — the suite still refuses to run against the mock server and still insists on the versioned prefix, but it can be pointed at a staging host, which is exactly what Task 9's safety rule requires. Prompt 35 has one less item.`
- `07 · 2026-09-06 · heroConfig.js normalises `source` to the literal "products" rather than reading it from the record · The seeded singleton carries `source: "products"` and it is the only source that exists, so the normalizer returns it unconditionally (exported as HERO_SOURCE_PRODUCTS): a config that predates the key, or one hand-edited to a source with no implementation, still drives a product carousel instead of an empty stage. The key is kept in the shape so adding a second source later is a data change plus one branch, not a schema change.`
- `07 · 2026-09-06 · HERO_FALLBACK_SLIDES was rewritten to brand.name + brand.tagline on a gradient, and HERO_FALLBACK_IMAGE was DELETED · The offline fallback carried "Handwoven Assamese Silk", "Muga, Pat and Eri from the looms of Sualkuchi" and a placehold.co image reading "Handwoven in Assam" in the old ink/gold palette — Meghali copy, in a file this prompt touches. It now carries no photography and no fact that is not already in brand.js, because an unreachable API must not be the one surface that invents a claim. AdminHeroSection's five gradient presets went the same way: "Heritage/Bridal Muga/Sualkuchi/Bihu Night/Eri Warmth" with hardcoded hex values became four design-system tokens (brand/announce/signature/gold), which also settles the "no hard-coded colours" guardrail for that screen.`
- `07 · 2026-09-06 · faqs.js treats `group` as a free string with a guaranteed "general" member, not an enum · The vocabulary lives in data (`siteContent.faqPage.groups[].key`) so the owner can rename or reorder the headings without a deploy. Validating against a hardcoded list would make a renamed heading empty its own section. DEFAULT_FAQ_GROUP = "general" is deliberately NOT one of the four seeded keys: an unfiled answer must be visible somewhere, but it must not silently claim to be part of a curated section. faqsForGroup() does not also filter by placement — a heading shows what was filed under it — and returns [] for an empty key. Verified against the seed: brand 2, products 3, orders 3, account 0, general 0.`
- `07 · 2026-09-06 · The mock-mode acceptance checks were run as a TEMPORARY jest suite driving the real api.js against JSON Server, not as browser-console pokes behind a temporary window.apiService · The prompt suggests exposing apiService from index.js for the run. The suite loads the same module against the same server and asserts every result instead of printing it, which is strictly stronger evidence and leaves no temporary export to forget. src/services/api.mock.check.test.js was deleted after the run (21/21 passing) and is not in the commit; `git status` is clean and no window.apiService exists anywhere in src. The two acceptance items that genuinely need a browser — the hero rendering eight product slides and /admin/hero-section opening — were done in Chromium.`
- `07 · 2026-09-06 · JSON Server ran against a scratchpad COPY of db.json (JSON_SERVER_DB), as in Prompt 01 · The verification writes: setHeroOrder rewrites eight products, the CRUD checks create and delete rows, updateProduct rewrites media. The prompt states db.json is unchanged by Prompt 07, so the tracked seed stayed byte-identical (verified: `git diff --stat db.json` empty) while the flows were still exercised for real. One finding from the copy worth recording: syncProductMedia ADDS an `image` key to products that go through admin.updateProduct — the seed has none, since `image` is a derived mirror `normalizeProduct` supplies on read. That is the documented contract (REPO_MAP §3.4, "Product payload"), not drift.`

- `08 · 2026-09-06 · The acceptance grep cannot literally reach 0, and is reported as "0 LINKS" instead · The prompt's own command matches the bare string "/products", which is also the REST RESOURCE path the JSON Server / Laravel client calls sixteen times (api.get("/products", …), api.post("/products", …)). Those are the API's URLs, not the site's; renaming them would break both api modes. Full result: 18 hits — 16 in src/services/api.js and 2 in the new src/utils/routes.test.js, whose whole job is to assert that no ROUTES entry is one of those paths. Excluding LegacyRedirects.js, services/api.js and routes.test.js the grep returns **nothing**: every storefront link is swept.`
- `08 · 2026-09-06 · /category/:slug renders pages/Products/Products with a new `categorySlug` prop rather than redirecting to /shop?category=<slug> · The route table puts the category in the PATH; redirecting back to a query string would undo the URL the sweep just introduced (and /products?category=<slug> redirects the other way, so the two would loop). The prop LOCKS the listing: the category facet and its chip group step aside, "Clear all" clears back to the route rather than out of it, the active-filter count ignores it, and syncUrlParams never writes `category` (which would produce /category/face-care?category=face-care). ~25 lines, all removed with the page by Prompt 24.`
- `08 · 2026-09-06 · useSeo BORROWS the static og:* tags from public/index.html instead of adding a second set · The prompt asks for `data-seo`-tagged elements; creating them unconditionally would leave two og:title tags in the head on every page (index.html's plus the hook's) and a crawler picking whichever it saw first. The hook now records the original content, stamps the element while it holds it, and restores it on unmount — so a route with no useSeo() call (today: /_playground) finds the site-wide defaults intact. Verified in Chromium: /checkout has 11 `[data-seo]` elements, one og:title and one description; navigating away leaves 0 and restores the static values.`
- `08 · 2026-09-06 · Canonical origin falls back to window.location.origin · brand.seo.siteUrl is still `{{LAMIKAA_DOMAIN}}`, and a canonical pointing at a literal placeholder is worse than none. `seoOrigin()` (exported from the hook) uses the configured host the moment it stops being a placeholder — the switch is one edit in brand.js, no page changes. robots.txt keeps the token in its Sitemap line, which Prompt 38 resolves or removes.`
- `08 · 2026-09-06 · The three `?sort=` editorial links (New Arrivals / Bestsellers / Sale) were COLLAPSED, not repointed one-for-one · The LAMIKAA shop has no sort (the owner's decision, brief §7.3), so all three resolve to the same page. Three identical links with three different names is worse than one: the header's editorial group becomes a single "Shop all", and the mobile drawer's whole "Discover" group is gone because the drawer already carries "Shop All" at the top. The footer's shop column lost the same two duplicates. Prompts 09, 10 and 13 rebuild all three navigations.`
- `08 · 2026-09-06 · /orders, /profile and /wishlist carry `noindex` too, beyond the three the prompt names · They are one visitor's own pages and robots.txt already disallows two of the three; a Disallow stops the crawl but not the indexing of a URL someone else links to, so the meta tag is the belt to that braces. No acceptance criterion is affected (the three the prompt names — NotFound, Checkout, OrderConfirmation — all carry it).`
- `08 · 2026-09-06 · The Meghali body copy in AboutUs.js (72 references), the FABRIC_FAMILIES facet in Products.js and the "All Silk" heading were NOT rewritten wholesale · The guardrail bars Meghali copy being LEFT BEHIND in a touched file, but this prompt touched those files for links and a useSeo call only, and both pages are DELETED by their own prompts (23 deletes pages/Products, 28 deletes pages/AboutUs and writes pages/About from siteContent). Rewriting an About page now would be Prompt 28's deliverable, discarded when 28 lands. What WAS fixed is every string this prompt's own edits sat on: the "All Silk" results heading → "All products", the listing breadcrumb → Home / Shop, SearchModal's "Try another weave — Muga, Pat or Eri" empty hint, and CartDrawer's "The looms of Sualkuchi are waiting" + "Explore the collection" → "Continue shopping". The rest is logged as an Open TODO against 23/28.`
- `08 · 2026-09-06 · Home's two `?highlight=` rails were repointed to /shop?highlight=…, not flattened to /shop · The facet still works (the /shop element IS the old listing until Prompt 23), so flattening would have LOST a working destination — the opposite of the ?sort= case, where the destination no longer exists. Prompt 23 retires the param with the page.`


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
- `04 · Small UI labels below 14px survive in component CSS this prompt may not touch (Task 8 restricts fixes to the scale tokens and the base layer). Measured at 1280px: Header .navLink 11px/500 and .navMoreCount 11px/500 (Header.module.css:269,323 — hardcoded 0.6875rem, not a token); AnnouncementBar .message, TrustStrip .label, the section eyebrows and Footer .colTitle at 12px/500 (--sf-text-xs, which DESIGN_SYSTEM §6 fixes at .75rem); breadcrumbs, "We accept" and "Secure payment" at 12px/400. None is body copy and none is light-weight (the 300 tier is gone), so the acceptance criteria hold — but the 11px pair in particular should not survive the header rebuild. · Prompts 09 / 13 / 23 / 28 · 09`
- `04 · The "SOFT" 30 decision is reversible in two lines and is the owner's call: swap the Fraunces URL in public/index.html for family=Fraunces:opsz,wght,SOFT@9..144,400,30;9..144,500,30;9..144,600,30 and add font-variation-settings: "SOFT" 30 to the h1,h2 rule in src/index.css. Cost: +54KB on the latin subset. · owner · 38 (perf audit decides)`
- `04 · .gradient-text in App.css is superseded by the .sf-gradient-text primitive (which clips the SIGNATURE gradient and carries a background-clip fallback) and has zero consumers under src/. Kept unrenamed because it is a global class name; delete it with the rest of the legacy layer. · Prompt 35 · 35`
- `04 · --sf-text-xl/-2xl/-3xl became FLUID clamps in this prompt, but three components still carry their own hand-rolled clamps for display type: HeroSection .headline clamp(2.5rem, 5.4vw, 4.5rem), ProductDetails .productName clamp(2rem, 3.2vw, 2.75rem) and the AboutUs hero. They fit at every measured width, but each is a second definition of the scale and should move onto the tokens when its component is rebuilt. · Prompts 14 / 25 / 28 · 14`
- `04 · The QA in this prompt ran against a build made with REACT_APP_USE_MOCK_API=true forced in the shell, because CRA loads .env.production over .env for `npm run build` and the committed .env.production points at the live Laravel API (unreachable from here). The tree ships unchanged — the final verification build used the normal config. Worth knowing before anyone tries to reproduce the screenshots. · developer · —`

- `05 · `/_playground` (route in App.js + `src/pages/_Playground/`) is TEMPORARY scaffolding and must be deleted with its route and its import. · Prompt 35 · 35`
- `05 · Nothing has been migrated onto the primitives yet, deliberately (prompt guardrail) — only `PriceBlock` was touched. `CartDrawer`, `SidebarMenu`, `CategoriesDrawer`, `AuthModal`, `ReviewModal` and `SearchModal` still carry five hand-rolled copies of the focus trap that `useFocusTrap` now owns, and their own scroll locks (`document.body.style.overflow`) rather than `useScrollLock`'s reference-counted `body[data-scroll-lock]`. Each migrates in its own feature prompt. · Prompts 09–12, 30 · 09`
- `05 · `body[data-drawer-open]` is SET by `ui/Drawer` but nothing reads it yet — the header must drop its backdrop blur while it is present, which is what keeps the two-blurred-layers budget (DESIGN_SYSTEM §4). · Prompt 09 · 09`
- `05 · The three storefront `@iconify/react` icon sets used by the new primitives (`mdi:close`, `mdi:chevron-down`, `mdi:play`, `mdi:pause`, `mdi:volume-off`, `mdi:volume-high`, `mdi:fullscreen`, `mdi:check`) are fetched from the Iconify API at runtime, like every existing consumer. In an offline or restricted network the icon simply does not paint — every icon-only control already carries an `srLabel`/`aria-label`, so nothing loses its accessible name, but the audit prompt should decide whether to bundle the set. · Prompt 38 · 38`
- `05 · `Modal`/`Drawer` release the scroll lock the instant `open` goes false, so the page can move for the ~320ms of the exit animation. Imperceptible in QA; revisit only if it shows up on a long page. · Prompt 37 · 37`
- `05 · `GlassCard`'s tone glow is clipped by `.sf-card`'s `overflow: hidden` (a card wants light INSIDE it). A section that wants a halo AROUND a card wraps it in `GlowWrap` and clips at the section — see the DESIGN_SYSTEM §7 note. · Prompts 14–19 · 14`
- `06 · api.js still calls GET /banners … CLOSED by Prompt 07: the namespace is gone, the hero reads products.getHeroProducts(), and /admin/hero-section opens clean. · (closed) · 07`
- `06 · concerns, rituals and siteContent are seeded but have no api.js methods … the API half is CLOSED by Prompt 07 (public readers + admin CRUD, both modes). The ADMIN SCREENS are still missing — nothing in the UI can create a concern, edit a ritual or write site content yet. · Prompt 34 · 34`
- `06 · The three trust badges are seeded per product in products[].badges as a copy of brand.trustBadges. If the owner edits the wording in brand.js, the eight seeded copies do not follow. Components should read brand.trustBadges and treat the field as an optional per-product override. · Prompt 16/25 · 25`
- `06 · settings.shipping.defaultWeight (0.5 kg) and defaultDimensions (15x12x8 cm) are carried over unchanged as generic parcel defaults; every product carries weight: 0 and dimensions: null. Real shipping weights are an owner input. · Owner · 39`
- `06 · Five of the eight products are priceTBA, so the cart, checkout, coupon and free-shipping paths can only be exercised with products 1, 2 and 6. Any later QA that needs a multi-product cart has to use those three. · Prompt 29/31 · 29`
- `06 · Prompt 01's TODO about product 1's corrupted prices (price 41 / comparePrice 380000000000) and Prompt 02's about db.json seeding the old identity are both CLOSED by this rewrite. Prompt 01's "no user has a delivered order" is closed too — order ORD-20260901-0001 is delivered. · (closed) · 06`

- `07 · AdminHeroSection.js is a STAND-IN and its first tab is mislabelled by design: it edits `announcements` through slide-shaped controls. Only the headline (saved as the row's `text`), the link, the on/off switch and the order reach the storefront; subtitle, eyebrow, CTAs, background, alignment, scrim and timer are written onto the row and ignored. Prompt 34 must split it into a hero product-ordering screen (admin.setHeroOrder) and a real announcements manager (text + link + isActive + sortOrder + the startsAt/endsAt window, which currently has NO control anywhere in the admin — the adapters only preserve it). · Prompt 34 · 34`
- `07 · HeroSection.js keeps the pre-rebuild carousel alive on product data through the temporary productSlide() adapter, and heroConfig.js still carries the slide-era shape (heights, openers, secondaryCta, overlayOpacity, HERO_BACKGROUND_TYPES, HERO_TEXT_ALIGNMENTS, normalizeHeroSlide(s), HERO_FALLBACK_SLIDES). The seeded heroConfig no longer stores any of those keys — the normalizer supplies them as defaults. Delete the adapter, the component and the dead half of heroConfig.js with the rebuild. · Prompt 14 · 14`
- `07 · faqsForGroup() and normalizeFaq's `group` have no consumer yet — the FAQ page that renders headings from siteContent.faqPage.groups[] is Prompt 28's, and the admin control that sets a row's group is Prompt 34's. Until then every seeded row keeps the group Prompt 06 gave it and nothing reads it. · Prompts 28 / 34 · 28`
- `07 · The twenty live routes in REPO_MAP §3.4 do not exist on the Laravel side yet, so Mode B is INCOMPLETE until the backend team ships them. Until then `npm run test:live` will fail on the new tests even against a correct staging host — that is the point of writing them now. · Backend team / owner · 39`
- `07 · No .env.local and no staging host exist, so no api.js function has ever executed against a real Laravel API in this programme. Every "both modes" claim from here on rests on the mock run plus the §3 review. The first staging URL the owner provides should be spent on a full `npm run test:live`. · Owner · 39`
- `07 · products.search() is still json-server's `?q=` in mock mode, which matches ANY field of a record (a query can hit an ingredient list or a meta description and rank as highly as a name). Ranking is deliberately left to the caller — src/utils/search.js does not exist yet. · Prompt 11 · 11`
- `07 · admin.setHeroOrder clears `heroOrder` on every product not in the list it is given. That is the documented contract (dropping a product out of the carousel is the same gesture as reordering it), but it means a caller that passes a PARTIAL list silently empties the rest of the hero. The Prompt 34 editor must always send the full order. · Prompt 34 · 34`

- `08 · ComingSoon stubs are live at /rituals, /rituals/:slug, /why-lamikaa, /cart and /search. Each renders "This page is being built (Prompt NN)" and is noindex. Prompt 35 verifies no route still points at pages/_ComingSoon and deletes the folder (Prompt 31 in the index's plan). · Prompts 24, 28, 29, 11 · 11`
- `08 · /search is a stub, so the search OVERLAY is the only search surface until Prompt 11: it still lists live results in place, but "see all results" (Enter, or the submit button) now lands on the stub instead of the old /products?search= listing. This is the one storefront capability that is temporarily reduced, and it is the route table's own instruction. · Prompt 11 · 11`
- `08 · pages/AboutUs/AboutUs.js still carries the Meghali silk story end to end (72 matches for silk/saree/weave/Sualkuchi/Mekhela/loom — headline "Three silks, one river, and the families who weave them", the SILKS table, META ["Est. 2010", "Kolkata", …], the placehold.co loom imagery). Prompt 08 touched it for links + useSeo only. Prompt 28 deletes the folder and writes pages/About/About from siteContent. · Prompt 28 · 28`
- `08 · pages/Products/Products.js still carries FABRIC_FAMILIES (Muga/Pat/Eri/Toss Silk) and its "Fabric" facet. It renders NOTHING with the LAMIKAA seed (availableFabrics is empty, so the chip group and the drawer section are both hidden) — it is dead code that Prompt 23 deletes with the page. · Prompt 23 · 23`
- `08 · The temporary `categorySlug` prop on pages/Products/Products (and the CategoryRoute wrapper in App.js) exists only to make /category/:slug real before the Shop page lands. Both go when the element becomes `<Shop mode="category" />`. · Prompt 24 · 24`
- `08 · RouteFallback is a STOREFRONT-token skeleton and it is also what the admin's <Suspense> shows while an admin chunk loads. It reads correctly (the tokens are global) but it is not the admin's own idiom. Give the admin its own fallback when the shell is rebuilt. · Prompt 32 · 32`
- `08 · The PDP still runs its own hand-rolled title + meta[name=description] effect (ProductDetails.js), which is NOT `data-seo`-tagged and so is the one writer outside useSeo. The prompt says to leave it; Prompt 25 replaces it (and Prompt 27 adds the product JSON-LD). Until then the PDP has no canonical, no og:* and no JSON-LD. · Prompt 25 · 25`
- `08 · /_playground has no useSeo call, so it shows the store title from settings and the static index.html og:* set. Deliberate — it is scaffolding, and Prompt 35 deletes it. · Prompt 35 · 35`
- `08 · Home's ?highlight= rails and the shop's ?sort=/?page=/?per_page= params still work because /shop IS the old listing. Prompt 23's chaptered shop has no sort, filters or pagination — it must also decide what happens to a bookmarked /shop?sort=newest (drop the param, or 404 it). · Prompt 23 · 23`
- `08 · The AnnouncementBar still reads "COMPLIMENTARY GIFT WRAPPING" and the TrustStrip still reads "AUTHENTIC SILK" in mock mode (both are seeded/component copy in files this prompt did not touch). Visible on every route in the QA screenshots. · Prompts 09 / 15 · 09`

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
- `06 · {{JURISDICTION}} · introduced · db.json → siteContent.policies.terms §09: "The courts of {{JURISDICTION}} have exclusive jurisdiction over any dispute arising from them." stripPlaceholderSentences drops that one sentence; the "governed by the laws of India" sentence before it stands on its own.`
- `06 · {{REFUND_TIMELINE}} · introduced · db.json → siteContent.policies.shippingReturns §05: "Refunds are processed {{REFUND_TIMELINE}}." No number was seeded — "5–7 business days after inspection" stays a candidate for the owner, not a fact. The following sentence ("Your bank may take a few days more…") survives the strip.`
- `06 · {{DISPATCH_SLA}} · introduced · db.json → shipping_methods[0].estimatedDays ("") and siteContent.policies.shippingReturns §01 ("Our dispatch time is {{DISPATCH_SLA}}.").`
- `06 · {{TAX_RATE_PERCENT}} · introduced · db.json → settings.store.taxRate = 0 with taxIncluded: true, and taxAmount: 0 on all three seeded orders. No token string is stored — the 0/true pair IS the unresolved state, and fillStoreCopy's {taxNote} already prints "inclusive of all taxes" for it.`
- `06 · {{LAMIKAA_EMAIL}} / {{LAMIKAA_PHONE}} / {{LAMIKAA_ADDRESS}} · carried into data · settings.store.{email,phone,address} plus settings.notifications.{adminEmail,lowStockEmail} and the contact clause of all four policies. normalizeStoreSettings blanks the first three; the policy sentences are dropped by stripPlaceholderSentences.`
- `08 · {{LAMIKAA_DOMAIN}} · carried into public/robots.txt · The Sitemap: line is seeded as https://{{LAMIKAA_DOMAIN}}/sitemap.xml for Prompt 38 to resolve or remove. Nothing RENDERED carries the token: useSeo's seoOrigin() uses brand.seo.siteUrl only when it stops being a placeholder and falls back to window.location.origin, so every canonical, og:url and twitter URL is a real absolute URL today.`
- `06 · {{LAMIKAA_FACEBOOK_URL}} / {{LAMIKAA_INSTAGRAM_URL}} / {{LAMIKAA_YOUTUBE_URL}} / {{LAMIKAA_WHATSAPP_URL}} · carried into data · settings.social.*. twitter is "" (deliberately absent, not unknown).`
- `06 · {{SUPPORT_HOURS}} · carried into data · siteContent.contact.hoursNote.`
- `06 · {{GSTIN}} / {{CIN}} · carried into data · siteContent.policies.terms §01, one per sentence so each is dropped independently.`
- `06 · {{FREE_SHIPPING_THRESHOLD}} · carried into data · announcements[1].text and shipping_methods[0].freeAbove = null (the null is what makes {freeShipping} unresolvable in FAQ 6).`
- `06 · {{LAUNCH_OFFER_TEXT}} · carried into data · announcements[2].text, seeded isActive: true — the bar hides a row whose text is unresolved rather than the owner having to remember to switch it on.`
- `06 · {{RETURN_WINDOW_DAYS}} · carried into data · faqs[6].answer and siteContent.policies.shippingReturns §04. Still resolved by fillStoreCopy from STOREFRONT_CONFIG.returnsWindowDays (7).`
- `06 · {{PRICE_FACE_WASH}} / {{PRICE_GOAT_MILK_SOAP}} / {{PRICE_FACE_SCRUB}} · resolved · Seeded as 390 / 90 / 349 with priceSource: "packaging-mrp". Owner to confirm before launch.`
- `06 · {{PRICE_BODY_WASH}} / {{PRICE_FACE_MASK}} / {{PRICE_FACE_MIST}} / {{PRICE_FACE_SERUM}} / {{PRICE_MOISTURIZER_GEL}} · introduced · price: null + priceTBA: true on products 3, 4, 5, 7, 8 — the MRP is masked on those packs. Renders "Price on launch" with Add to Cart disabled.`
- `06 · {{SIZE_FACE_WASH}} … {{SIZE_MOISTURIZER_GEL}} (8) · resolved · products[*].size, all eight from the packs: 200 ml · 100 g · 250 ml · 100 g · 100 ml · 100 g · 30 ml · 100 ml.`
- `06 · {{INCI_FACE_WASH}} … {{INCI_MOISTURIZER_GEL}} (8) · resolved · products[*].ingredientsList, verbatim from PRODUCTS.md §5. Owner to proof-read against final artwork.`

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

---

## Prompt 04 record (2026-09-06)

### The two families, and the one request that loads them

`public/index.html` keeps both `preconnect`s and the Material Icons link (admin), and its single `css2` link is now:

```
https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap
```

`Cormorant+Garamond` and `family=Inter` are gone from it. The inline splash CSS moved with it — body to the Manrope stack, `.loader-tagline` to Fraunces 500 — and the "TOKEN DISCIPLINE" comment block now lists the two family stacks alongside the palette literals it already mirrored, because that stylesheet is parsed before any `var(--sf-*)` exists.

No `@import` of a font anywhere, no `@font-face`, nothing vendored under `public/fonts/`.

### Tokens

| | Before | After |
|---|---|---|
| `--sf-font-display` | `"Cormorant Garamond", "Playfair Display", Georgia, serif` | `"Fraunces", "Playfair Display", Georgia, "Times New Roman", serif` |
| `--sf-font-family` | `"Inter", -apple-system, …` | `"Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| `--sf-text-xl` | `1.5rem` | `clamp(1.375rem, 1.1rem + 1vw, 1.75rem)` |
| `--sf-text-2xl` | `1.875rem` | `clamp(1.75rem, 1.3rem + 1.8vw, 2.5rem)` |
| `--sf-text-3xl` | `2.25rem` | `clamp(2.25rem, 1.6rem + 2.6vw, 3.25rem)` |
| `--sf-text-4xl` | `clamp(2.5rem, 5vw, 3.5rem)` | `clamp(2.75rem, 1.8rem + 4vw, 4.5rem)` |
| `--sf-text-5xl` | `clamp(3rem, 7vw, 4.5rem)` | `clamp(3.25rem, 2rem + 6vw, 6rem)` |
| `--sf-leading-display` | `1.1` | `1.12` |
| `--sf-leading-relaxed` | `1.7` | `1.65` |
| `--sf-font-light` | `300` | **deleted** (29 consumers → `--sf-font-normal`) |

`-xs .75rem`, `-sm .875rem`, `-base 1rem`, `-md 1.0625rem`, `-lg 1.25rem`, the tracking values and `-tight`/`-normal` leading are unchanged and already matched §6.

### The base layer (`src/index.css`, rewritten)

`html` gets `color-scheme: dark` and `scroll-behavior: smooth`, with `scroll-behavior: auto` under `prefers-reduced-motion` (that one is UA-driven, so it cannot be switched off per element). `body` is Manrope 400 at `--sf-text-base` over `--sf-leading-normal`, warm white on `--sf-color-bg`, antialiased. **All six heading levels** default to `--sf-font-display` at weight 500 with `font-optical-sizing: auto` and `overflow-wrap: anywhere`; `h1, h2` add `--sf-tracking-tight`. `p, li, dd, figcaption, blockquote` get `overflow-wrap: break-word`. `::selection` is gold ground / near-black type, still scoped `:not(.admin-area)`. `body[data-scroll-lock] { overflow: hidden }` is the new shared overlay hook.

`.swal2-container` moved out of this file into `App.css`, so the whole SweetAlert2 skin now lives in one place.

### The primitives (`storefront-primitives.css`, 437 → 880 lines)

Every pre-existing class name is still there; 16 are new. The header comment carries the full list, grouped, as the contract.

New: `.sf-section` `.sf-section--tight` `.sf-container` `.sf-container--wide` `.sf-glass` `.sf-glass--strong` `.sf-glass--scrim` `.sf-plate` `.sf-hairline` `.sf-hairline--gradient` `.sf-glow` (+ `--violet` `--gold` `--duo` `--breathe`) `.sf-gradient-text` `.sf-eyebrow` `.sf-eyebrow--rule` `.sf-numeral` `.sf-visually-hidden` `.sf-placeholder-media`.

Restyled: `.sf-btn` and its five variants (pill, Manrope 600, `.02em`, sentence case, 44px, hover `translateY(-1px)`, press `translateY(0)` at 92%); `.sf-btn--gold` is now an alias of `--emerald` rather than a second look; `--outline-gold` became the glass secondary; `--ghost` grew the signature-gradient underline reveal (`background-size: 0 1px → 100% 1px`). `.sf-chip` is a glass pill. `.sf-card` is a glass surface at `--sf-radius-lg` with the 4px lift, the firming hairline and a pre-placed `::before` glow that only animates its opacity (0 → .22). `.sf-skeleton` shimmers `--sf-color-surface-2 → --sf-color-surface-hover`. `.sf-toast` is glass with the gold left rule. Every badge, pill, ribbon and flag became a pill.

The reduced-motion block at the foot cancels what zeroed durations cannot: the hover transforms on `.sf-btn` and `.sf-card--hover` (and its image), and the `sf-breathe` loop on both glow pseudo-elements. Press states deliberately survive — they dim rather than move.

### Verification

- `CI=true npm run build` → exit 0, **no warnings**. `npm test -- --watchAll=false` → exit 0, 1 suite / 45 tests skipped (the unchanged live-API baseline).
- `grep -n "family=Fraunces" public/index.html` → 1 hit; `grep -n "Cormorant+Garamond\|family=Inter" public/index.html` → 0.
- `grep -rn "sf-font-light" src | wc -l` → **0**.
- `grep -n "^\.sf-glass\|^\.sf-glow\|^\.sf-gradient-text\|^\.sf-eyebrow\|^\.sf-section\|^\.sf-plate\|^\.sf-placeholder-media" src/theme/storefront-primitives.css` → all present at column 0.
- Fonts: the `css2` URL returns **200** with `font-display: swap` on every face (curl). `fontTools` on the served woff2: Fraunces `fvar` = `opsz 9–144`, `wght 100–900`; Manrope `wght 200–800`.

### Browser QA (Chromium 1194, mock-mode build, real faces served locally)

Widths **360 / 390 / 768 / 1280** × home, `/products`, PDP, `/checkout`, `/about`, `/admin/products`.

- **Horizontal overflow: none**, on any page at any width (`document.scrollingElement.scrollWidth === innerWidth` in all 24 combinations). The only element extending past the viewport is `.chipGroup`, inside the deliberate `overflow-x: auto` rail at `Products.module.css:260`.
- **Every `h1`/`h2` fits** (`scrollWidth === clientWidth`). Samples at 360px: hero `Fraunces 500 40px`, shop `36px`, PDP `Sualkuchi Muga Mekhela Chador — Natural Gold` at `32px`, about `Fraunces 400 53.6px`. At 1280px the about hero reaches the `--sf-text-5xl` ceiling, 96px, and still fits.
- **Fonts genuinely loaded** — `document.fonts` reports `Fraunces 500 loaded` / `Manrope loaded`, `body` computes `Manrope 16px`.
- **Keyboard walk, 14 stops from the top of `/`**: every stop has a visible indicator. The skip link needed the two-ring fix (see Decisions); the AnnouncementBar close button carries its own near-black 1px inset outline, which reads on the gold band.
- **Primitives smoke-tested in the live document**: glass `rgba(255,255,255,.06)` + `blur(20px)` + hairline; gradient-text clipping the signature gradient with `-webkit-text-fill-color: transparent`; eyebrow gold / uppercase / `1.68px` tracking / 12px with a 24px gradient rule; `.sf-section` 128px and `--tight` 76.8px at 1280; plate `1/1` grid at `--sf-radius-lg` on `--sf-color-surface`; `.sf-numeral` Fraunces + `tabular-nums`; containers 1280 / 1440; hairline gradient at `.6`; `.sf-glow--duo` pink `::before` + violet `::after`; primary button `999px` / gold / near-black / `none` / 600 / 44px / `.28px`; secondary glass + `--sf-color-border-strong`; ghost underline at `0px 1px`; chip pill 13px/500/44px; `body[data-scroll-lock]` → `overflow: hidden`.
- **SweetAlert2 toast after "Add to Cart"**: `background color(srgb .078 .078 .086 / .94)`, `backdrop-filter blur(16px)`, `--sf-radius-md`, `box-shadow` = `--sf-shadow-1`, 2px gold left rule, container `z-index 2000`.
- **`prefers-reduced-motion: reduce`**: `scroll-behavior auto`, `--sf-duration 0s`, `.sf-card`/`.sf-btn` `transition-duration 0s`, `.sf-glow--breathe::before` `animation-name none`.
- **Admin** (`/admin/products`, login screen): `body.admin-area`, MUI Typography and Buttons resolve to **Manrope**, `text-transform: none`, no overflow at 360px. Palette untouched — Prompt 32's job.

---

## Prompt 05 record (2026-09-06)

### What was built

| Group | Files |
|---|---|
| Hooks | `src/hooks/useScrollLock.js` · `useFocusTrap.js` · `useInView.js` |
| Data helpers | `src/utils/product.js` (+ `product.test.js`, 13 tests) · `src/utils/contentBlocks.js` (+ `contentBlocks.test.js`, 7 tests) |
| Components | `src/components/ui/` — `Button` · `Chip` · `SectionHeading` · `GlassCard` · `GlowWrap` · `Accordion` · `Modal` · `Drawer` · `Skeleton` · `Price` · `VideoPlayer` · `CloudinaryImage` · `ContentBlocks` · `index.js` (12 CSS modules; `Price` has none — see the decisions log) |
| Changed | `src/components/storefront/PriceBlock.{js,module.css}` (the `unknown` state) · `src/utils/helpers.js` (`getProductMinPrice` → `unknown: true`; `buildCartItem` throws `PRICE_TBA`) · `src/theme/storefront-primitives.css` (three overridable glow custom properties) · `src/App.js` (the temporary route) |
| Temporary | `src/pages/_Playground/Playground.{js,module.css}` at `/_playground` — **Prompt 35 deletes it** |

`src/components/storefront/index.js` is unchanged, as the prompt requires — nothing new is re-exported from there.

### The two mirrors, and who keeps them in step

`media[]` is the authored gallery; `images[]` is a derived mirror of its image URLs with the primary first, and `image` is the primary URL. The mirror is not legacy debt: cart lines, wishlist snapshots, order items, the admin table, search and the live API test store or read `images[0]`, and a snapshot taken last month cannot be re-derived.

- **Read side** — `normalizeProduct(raw)` builds `media[]` from whatever the record has (`media[]` wins; otherwise `images[]` + the single `image`, deduplicated so a record whose `image` repeats `images[0]` does not gain a duplicate first frame), guarantees exactly one primary image, and derives `images`/`image` from it.
- **Write side** — `syncProductMedia(product)` takes the admin's edited `media[]`, drops rows with an empty URL, re-decides the single primary AFTER the blanks are gone (two flagged rows, a flagged row that was blank, a flagged video — all collapse to one answer), and rebuilds the two mirrors. Prompt 33's media manager calls it before the request, so both api modes get a consistent record.

### Verification

- `CI=true npm run build` — **exit 0, "Compiled successfully.", no warnings** (warnings are errors under CI).
- `npm test -- --watchAll=false` — **Test Suites: 1 skipped, 2 passed, 2 of 3**; Tests: 45 skipped, 20 passed, 65 total.
- `grep -rn "dangerouslySetInnerHTML" src` → **0** across the whole tree (the two prose mentions were reworded so the guardrail grep stays a real check).
- `grep -rniE "#[0-9a-f]{3,8}" src/components/ui src/pages/_Playground src/hooks` → **0** hard-coded colours (the one `#000` is inside a mask gradient, where the colour is the mask channel and not a colour).
- `normalizeProduct` round-tripped against **all 6 products currently in db.json** (the images-only shape) in a throwaway suite: `images` identical to the source array, exactly one `primary`, `image === images[0]`, `categoryIds`/`badges`/`priceTBA`/`shortName` all correct types. The seeded `media[]` shape is covered by `product.test.js`.
- Existing pages re-checked for regressions after the `PriceBlock`/`helpers` change — `/`, `/products`, `/products/1`, `/special-offers`, `/wishlist`, `/admin`: **zero console errors**, prices render exactly as before, no spurious TBA chips, no `{{` tokens.

### Browser QA (Chromium 1194, mock mode, `/_playground`)

- **No horizontal overflow** at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440, resizing in both directions (`document.documentElement.scrollWidth === clientWidth` at every width).
- **Zero React console warnings**, including no `fetchPriority` warning — `CloudinaryImage` writes the attribute in lowercase, as `HeroSection.js:384` already does. (`fetchpriority="high" loading="eager"` confirmed on the `priority` image.)
- **Modal**: focus moves to the panel, four Tabs and a Shift+Tab all stayed inside the dialog, Escape closed it, focus returned to the exact button that opened it; `body[data-scroll-lock]` set on open and gone on close.
- **Drawer**, each of the three sides: labelled dialog, `body[data-drawer-open]` set and cleared, Tab stayed inside, Escape closed, focus returned.
- **Accordion**: ArrowDown/ArrowUp (wrapping), Home and End move between headers; Enter toggles `aria-expanded`; a collapsed panel's link computes `visibility: hidden`, so it is out of the tab order.
- **VideoPlayer**, against a range-serving host: `+5s` / `-5s` clamp at `0` and at `duration`, Space plays, K pauses, M toggles mute both ways; the play badge is `aria-label="Play {title}"`; `muted`, `playsInline`, `preload="metadata"`, `autoplay === false` all confirmed on the element; scrolling the player out of view paused it. **This headless Chromium has no H.264** (`canPlayType('video/mp4; codecs="avc1.42E01E"')` → `""`), so the seeded MDN `.mp4` can only ever show the error path here — that path was verified too (poster at 35% under a "Video unavailable" pill, native `controls` handed over), and the playing path was proved with the WebM twin of the same clip.
- **Plate contain-fit, no white edges**: the padded Cloudinary output was fetched and its corner pixels sampled. Face Wash pads to `rgb(43,42,40)`, Body Wash (the transparent-corner crop) to `rgb(20,22,21)` — the latter is within one step of `--sf-color-surface` `#141416`. Both are 400×400 with the pack fully contained.
- **Content measure**: prose `max-width` resolves to 642.9px at 17px (68ch), editorial to 845.4px at 20px (76ch).
- **Reduced motion** (`prefers-reduced-motion: reduce`): button, card and accordion-panel `transition-duration` all `0s`; `.sf-glow--breathe::before` `animation-name: none`; `.sf-skeleton` `animation-name: none`.

### The defect found on the way

`GlassCard` originally put `.sf-glow` on the same node as `.sf-card--hover`. Both rules style that node's single `::before`, and `.sf-card--hover::before` is declared later in `storefront-primitives.css`, so it won on `opacity` (0 until hover), `inset` and `background`: the `glow` prop was silently inert and the QA screenshot showed four identical cards. The tone lamp now has its own inert `z-index: -1` child, so an interactive card can carry both its hover lamp and a resting tone. Confirmed in the browser: `opacity: 0.22` with the correct per-tone `background-image` on all four cards.

---

## Prompt 06 record (2026-09-06)

### What the seed now is

`db.json` went from **20 collections / 96 KB of Meghali's Silk** to **23 collections / 118 KB of LAMIKAA NATURALS**, written in the order Prompt 06 specifies:

`products · categories · concerns · rituals · faqs · siteContent · announcements · heroConfig · settings · dealsConfig · admins · users · shipping_methods · coupons · orders · payments · refunds · walletTransactions · returns · reviews · wishlist · cart · leads`

`banners` is gone — renamed `announcements` (3 rows) with the hero itself now driven by `heroConfig.source: "products"` + `products[].heroOrder`. `concerns`, `rituals` and `siteContent` are new. Every other collection name `api.js` reads survives, `shipping_methods` underscore included. `server.js` is untouched.

| Collection | Rows | Notes |
|---|---|---|
| `products` | 8 | ids 1–8 in `PRODUCTS.md` §2 order, `media[]` 4 or 5 rows each (5 for the Face Wash, Face Mask and Face Serum, which carry a second video) |
| `categories` | 7 | six `kind: "products"` + `rituals`; `image` seeded equal to `heroImage` so the existing admin category manager keeps working |
| `concerns` | 11 | `{id, slug, name, order}` |
| `rituals` | 3 | morning-glow (4 steps) · evening-renewal (5) · black-rice-body (2, with `alternativeProductId: 3` on step 1) |
| `faqs` | 8 | `FAQ_ITEMS` verbatim, same ids, plus `group` (2 brand / 3 products / 3 orders) |
| `siteContent` | 7 blocks | about · whyLamikaa · impact · home · contact · policies · faqPage |
| `announcements` | 3 | rows 2–3 carry tokens and stay `isActive: true` |
| commerce fixtures | 3 orders · 3 payments · 1 refund · 1 wallet row · 0 returns · 2 reviews · 2 leads · 1 coupon · 1 shipping method · 1 admin · 1 user | |

### The eight covers

Verified **character-exact** by parsing the `PRODUCTS.md` §2 table with a regex and comparing each captured URL against `products[n].media[0].url` **and** `products[n].images[0]` — 8/8 identical, slugs matched too. Nothing about them was normalised, re-hosted or transformed; `cld()` applies transformations at render time.

### The validation script (task 18, run, not committed)

**257 assertions, all passing.** Run from the repo root against the finished file:

- JSON parses; the 23 collections are present **in the specified order**.
- Per product: `media[0].primary === true`, exactly one primary, the primary is an image, `images[0] === media[0].url`, `images[]` mirrors the media images in order, 3–5 media rows, every video has a `poster` and a `title`, `categoryId` + every `categoryIds` id exists, every `concerns` slug exists, `relatedProductIds`/`frequentlyBoughtTogetherIds` resolve and never point at the product itself, 4–6 lowercase tags, `price`/`priceTBA` consistent, `metaTitle` and `metaDescription` match their specified patterns.
- 5 `priceTBA` / 3 priced; 8 distinct `heroOrder` values; 8 distinct SKUs.
- Every `rituals[].steps[].productId` **and** `alternativeProductId` exists; every `faqs[].group` is a `faqPage` group key; faq ids are 1–8 in order.
- Money agrees across the fixtures: items sum to `subtotal`, `total = subtotal − discount + shipping + tax`, `amountPayable === total`, each payment's `amount` equals its order's `amountPayable`, the refund's `amount` equals the order's `refundedAmount` and the payment's `refundAmount`, and the wallet ledger sums to `users[0].storeCredit` (₹390) with `balanceAfter === balanceBefore + amount`.
- `grep`-equivalent brand check inside the script (`meghali|silk|mekhela|saree|sari|Sualkuchi|Kolkata, West Bengal|muga|tussar`) → no match, and exactly one `Kolkata`, inside `Asia/Kolkata`.
- **Content transforms**: all 17 `siteContent` prose fields are parsed through the real `parseBlocks` (lifted out of `src/utils/contentBlocks.js`, which is pure) and through the real `stripPlaceholderSentences`, and must come back with the same h2/h3 list, no empty block, no heading left with an empty body, and no surviving token. This is the check that caught the defect below.

### URL reachability — 48/48, no swaps

Every distinct URL in the finished `db.json` was walked out of the parsed object and fetched with a ranged GET following redirects: **48 URLs, all 206**. That is 8 real covers (each appearing as `media[0].url`, `images[0]`, 11 video posters and 4 order-item images), 16 product gallery placeholders, 5 distinct video files, 7 category heroes, 3 ritual images and 9 story/impact images. **No host failed, so no alternate from `PLACEHOLDER_ASSETS.md` was substituted and no swap was recorded.** Picsum's `302 → 206` redirect is normal for that service and was verified with `curl -L`.

### JSON Server (task 19)

Started clean on :3001 against the tracked file (`npm run server`, no `--watch` warnings, no errors in the log). All **24 collection endpoints answered 200**, including the ten the prompt names:

```
200 /products/1            200 /products?slug=black-rice-face-serum   200 /categories?slug=serums
200 /rituals?slug=morning-glow   200 /announcements   200 /siteContent (22.5 KB)   200 /heroConfig
200 /settings             200 /faqs?group=orders     200 /concerns
```

`GET /rituals` → `[ 'morning-glow', 'evening-renewal', 'black-rice-body' ]`.

**Safe-delete proof.** Run on a `JSON_SERVER_DB=<scratchpad>/db.copy.json` copy at :3002 so the tracked seed could not be dirtied: `DELETE /reviews/2` → **200** (the stock json-server handler returns 500 here, because `reviews[].userId` is `null` and the `getRemovable` cascade calls `null.toString()` — the new seed hits that path on purpose), the row disappeared from `GET /reviews`, `GET /reviews/2` → 404, and a `POST /reviews` of the same object → **201** restored it. The copy then compared **deep-equal to the committed seed**. `md5sum db.json` was identical before and after the whole exercise, so `git checkout db.json` was never needed.

### Build, tests and browser QA

- `CI=true npm run build` — **exit 0, no warnings**. 465.86 kB JS / 65.67 kB CSS gzipped.
- `npm test -- --watchAll=false` — **exit 0**, 2 suites / 20 tests passed, `api.live.test.js` skipped (45 tests) exactly as in the 01/02/05 baselines: it targets the Laravel backend and writes to a real database.
- **Chromium 1194, mock mode, 16 routes** (`/`, `/products`, `/products/black-rice-face-wash`, `/checkout`, `/admin` and 11 admin screens): **zero `pageerror`s, zero crashed routes**. The only 4xx anywhere is `GET /banners 404`, which is the documented one-commit gap Prompt 07 closes. `ERR_CONNECTION_RESET` lines in the console are the sandbox's egress proxy refusing browser-initiated requests to the placeholder image hosts and Google Fonts — the same URLs return 206 over curl, and they are not application errors.

### Manual QA against the admin

| Screen | Result |
|---|---|
| `/admin/products` | 8 products listed; **11 cover thumbnails** rendering from `res.cloudinary.com/v8vrixwq`; SKU `LK-BR-FW-001` visible |
| `/admin/orders` | `ORD-20260901-0001`, `ORD-20260904-0002`, `ORD-20260903-0003` all listed |
| `/admin/payments` | toggle reads **Transactions (3)** / **Refunds (1)**; `pay_SEED0001`/`pay_SEED0003` in the ledger, `REF-20260903-C001` in the Refunds view, linked to `ORD-20260903-0003` |
| `/admin/reviews` | both sample rows, "Sample review — replace before launch" |
| `/admin/faqs` | 8 rows, "Who owns LAMIKAA Naturals?" first. The raw `{{RETURN_WINDOW_DAYS}}` shows here **by design** — the admin edits the stored answer, `fillStoreCopy` resolves it on the storefront |
| `/admin/settings` | inputs read `LAMIKAA NATURALS`, the tagline, `{{LAMIKAA_EMAIL}}`, `{{LAMIKAA_PHONE}}`, `{{LAMIKAA_ADDRESS}}`, `INR`, `₹` — the tokens are expected, and the values live in inputs rather than in text |
| `/admin/categories` · `/admin/users` · `/admin/coupons` · `/admin/leads` · `/admin/returns` | all load with their seeded rows (returns is legitimately empty) |

### The defect found on the way

The first draft of `siteContent.policies` lost four headings the moment the placeholders were stripped — a defect no amount of reading the copy would have found, because it only exists in the interaction of the two transforms the text is read through.

`stripPlaceholderSentences()` is **sentence-based and knows nothing about the block grammar**: it splits the whole field into sentences with their trailing separators and drops the ones carrying a token, separator included. `splitSentences` ends a sentence at a `.` followed by whitespace — and `## 09. Contact` contains exactly that. So a numbered heading is split into `## 09.` and a sentence that begins `Contact\n\n` and **runs on into the first sentence of the body**. Put a token in that first body sentence and the strip takes the heading's own title with it; `parseBlocks` is then handed a bare `## 09.` and the section loses its name. The same mechanism, one paragraph later, means a token sentence that ENDS a paragraph carries away the blank line that separated it from the next heading, so that heading stops being a heading at all (this is how `## 10. Changes and contact` disappeared out of Terms).

Four sections were affected: Privacy → Contact, Shipping & Returns → Returns and → Contact, Cookies → Contact, plus the Terms → Governing law paragraph that swallowed `## 10.`. All five were rewritten so that the first sentence after a heading and the last sentence of a paragraph are token-free, with the tokens moved into the middle or paired with a sentence that carries the structure — for example Shipping & Returns → Returns now opens "A return is requested from My Orders." and only then says "You have {{RETURN_WINDOW_DAYS}} days from delivery to ask for one."

The check is now part of the validation script, over all 17 prose fields: parse each field, parse it again after `stripPlaceholderSentences`, and require that the h2/h3 list is **identical**, that no heading is left with an empty body, and that no token survives the strip. Reading the four policies in their degraded (nothing-resolved) state confirms they still read as complete documents — every clause keeps a sentence, and the Terms still say they are governed by the laws of India even with the jurisdiction unnamed.

### Copy discipline

Every sentence in `siteContent` traces to `BRAND.md` §3 or to packaging text. The legal qualifiers survive intact wherever profits or dividends appear ("can", "subject to applicable laws and the company's dividend declaration"). No testimonial, count, award, founding year, percentage or named farmer appears anywhere in the file; `rating` and `totalReviews` are 0 on all eight products, and the two seeded reviews are `isSample: true`. Product copy quotes the pack: `packClaims`, `ingredientsList`, `howToUse` and `caution` are verbatim, and every product FAQ answer is drawn from the pack's own directions or claims — the Face Mask's "how often" question was dropped for that reason, because its pack prints no frequency (the weekly cadence lives in `ritualStep`, which is our editorial framing, not a pack claim).

## Prompt 07 record (2026-09-06)

### What changed

| File | Change |
|---|---|
| `src/services/api.js` | 2 797 → 3 314 lines. Imports `brand` and `normalizeProduct`/`syncProductMedia`. New module helpers: `normalizeProducts`, `visibleNormalized`, `byHeroOrderThenName`, `knownPriceFirst`, `isLiveAnnouncement`, `bySortOrder` and the exported pure `resolveRitualSteps`. `products` gained `getHeroProducts`, `getByCategorySlug`, `getByConcern`, a re-tiered `getRelated` and a gated `getReviews`; all nine existing reads normalise. `banners` deleted; `concerns`, `rituals`, `siteContent`, `announcements` added. `admin` gained 19 functions and normalises/syncs products. |
| `src/services/baseURL.js` | Comments only — the docblock named the old backend host and mislabelled which mode is the default; it now names both env files and points at REPO_MAP §3. |
| `src/utils/heroConfig.js` | `HERO_SOURCE_PRODUCTS` + `source` on `DEFAULT_HERO_CONFIG` and `normalizeHeroConfig`. Docblock rewritten for the product-driven hero. `HERO_FALLBACK_IMAGE` deleted; `HERO_FALLBACK_SLIDES` rewritten from `brand.name`/`brand.tagline` on `--sf-gradient-brand`. |
| `src/utils/faqs.js` | `DEFAULT_FAQ_GROUP = "general"`, `group` on `DEFAULT_FAQ` and `normalizeFaq`, new `faqsForGroup(faqs, group)` reader. |
| `src/context/FaqContext.js` | **Verified, not changed** — it reads `apiService.faqs.getAll()` and normalises through `normalizeFaqs`, so the new `group` field arrives on every row with no edit. Confirmed by the mock run (8 rows, groups intact). |
| `src/components/HeroSection/HeroSection.js` | Temporary `productSlide()` adapter; the slide fetch now calls `products.getHeroProducts()`. |
| `src/pages/Admin/AdminHeroSection.js` | First tab repointed at `announcements` through `rowToSlide`/`slideToRow`; tab label "Announcements (temporary)"; an explanatory `Alert`; gradient presets replaced with design tokens. |
| `src/pages/Admin/AdminSettings.js` | The second `getBanners` consumer — now `getAnnouncements`, with the summary chip and the hero blurb reworded. |
| `src/pages/Admin/AdminSpecialOffers.js` | One section label, "Hero Banner" → "Hero copy" (acceptance grep). |
| `src/components/AuthModal/AuthModal.{js,module.css}` | `errorBanner`/`infoBanner`/`infoBannerLink`/`bannerInner`/`bannerMotion` → `errorNote`/`infoNote`/`infoNoteLink`/`noteInner`/`noteMotion` (acceptance grep). Unrelated to the collection; a pure rename in both files. |
| `src/services/api.live.test.js` | banners → announcements; BASE_URL assertion is now a pattern; coverage added for the new reads, `getReviews(includeSample)`, `setHeroOrder` and the four new admin areas; product assertions updated for nullable prices, `media[]`, `categoryIds[]`, `concerns[]` and the `images[]` mirror. |
| `prompts/_reference/REPO_MAP.md` | §3 rewritten as the final contract (3.1 transport + normalisation, 3.2 storefront, 3.3 admin, 3.4 the 20 Laravel routes + the product payload). §4's "Not yet wired" note, the §5/§7 component notes and two verdict rows updated. |

### Verification

- **Acceptance greps.** `grep -rn "banners\|Banner" src --include=*.js` → **0** (51 before). `grep -rni "banners" src` over every file type → **0**.
- **Mock mode**, driven through the real `src/services/api.js` against JSON Server on a scratchpad copy of `db.json` — **21/21 assertions passing**:
  `getHeroProducts()` → 8 with `heroOrder` `[1…8]`, every one carrying `media[]`/`images[]`/`categoryIds[]`/`shortName`/`priceTBA` and `image === images[0]` · `getByCategorySlug("serums")` → 1 (the serum, via `categoryIds`, whose primary category is face-care) and `("face-care")` → 6 in `heroOrder` order, unknown slug → `{category:null,products:[]}` · `getByConcern("hydration")` → 3 (ids 3, 5, 8) with the concern record resolved · `concerns.getAll()` → 11 ordered · `rituals.getAll()` → 3 active in order; `getBySlug("morning-glow")` → 4 steps resolved to products 1, 5, 7, 8; the body ritual's step 1 resolves its `alternativeProduct`; `resolveSteps` is `resolveRitualSteps` and stays pure (empty product list → every `product: null`; `null` ritual → `[]`) · `siteContent.get("about")` → the section, `get()` → all 7 keys, unknown key → `null` · `announcements.getAll()` → 3 in order, and a seeded past/future/open window trio proves the schedule gate · `getReviews(1)` → `[]`, `{includeSample:true}` → the 1 sample row · `getRelated(serum)` → 7 products, priced ones first, self excluded, tier 2 resolving over `categoryIds` · `setHeroOrder([8…1])` → reversed, `[1,2,3]` → the other five products' `heroOrder` cleared to `null`, restore → `[1…8]` · `updateProduct` with an added media row → the URL appears in `media[]` **and** `images[]`, the mirror still equals the image rows primary-first, restore verified · admin CRUD + reorder round-trips for announcements, concerns and rituals, each proving the storefront reader hides the inactive row · `updateSiteContent` merges one section without dropping a key or another section · a draft product disappears from `getById`/`getBySlug`/`getAll`/`getHeroProducts`/`getByConcern` while `admin.getProducts` still shows it · 8 FAQ rows group as brand 2 / products 3 / orders 3 / account 0, and an ungrouped row falls to `"general"` · the seeded `heroConfig` has no `heights`/`openers`/`secondaryCta` and normalises to the designed defaults with `source: "products"` and `intervalMs: 6500`.
  The suite was `src/services/api.mock.check.test.js`, **deleted after the run** — it is not in the commit.
- **Browser (Chromium, mock mode).** Home: the hero carousel renders **eight** slides, one per product, each with its own headline ("Begin again, every morning.", "Softness, handed down.", "Let the day wash off you.", "Ten quiet minutes. Visibly yours.", "A breath of Assam, anywhere.", "Reveal what was always there.", "The glow that grows with you.", "Weightless. Endless. Hydration.") and its own CTA ("Explore the Face Wash" → `/products/black-rice-face-wash`, and so on for all eight). `/products` → 16 product links; a PDP renders. `/admin/hero-section` opens with the tab reading **"Announcements (temporary) (3)"**, the three seeded announcement texts listed, and the explanatory alert. `/admin/settings` → Hero Section tab shows "3 live of 3 announcements". **Zero console errors and zero application network failures on all five pages**; no horizontal overflow at 390px.
  The only failed requests are `fonts.googleapis.com`, `res.cloudinary.com`, `api.iconify.design` and `picsum.photos` — this sandbox's egress proxy resets them, as recorded for Prompt 04. The seeded URLs themselves were verified 206 in Prompt 06.
- **Live mode.** Not executed — no staging host exists (see the Decisions log). Each live branch was read against the §3 table, and the live suite now asserts the new contract for whenever a host appears.
- `CI=true npm run build` exit 0, **no warnings**. `npm test -- --watchAll=false` exit 0 — 2 suites passed / 1 skipped, 20 passed / 50 skipped (45 live tests before, 50 now).
- `git diff --stat db.json` **empty**: the seed is byte-identical. JSON Server ran against a scratchpad copy via `JSON_SERVER_DB`.


## Prompt 08 record (2026-09-06)

### What the route map now is

25 storefront paths, all built from `ROUTES` (`src/utils/constants.js`) — the old
table typed its paths inline, which is how `/products?sort=…` links survived in
five files after the sort they pointed at was retired.

`/` Home (**eager**) · `/shop` · `/category/:slug` · `/category/rituals` →
`/rituals` · `/product/:slug` · `/rituals` · `/rituals/:slug` · `/about` ·
`/why-lamikaa` · `/faq` · `/contact` · `/policies/{privacy,terms,
shipping-returns,cookies}` · `/cart` · `/checkout` ·
`/order-confirmation/:orderNumber` · `/orders` · `/profile` · `/wishlist` ·
`/special-offers` · `/login` · `/register` · `/search` · `/_playground` · `*` →
`NotFound`. The sixteen admin paths are byte-identical.

Five of those are `ComingSoon` stubs (`/rituals`, `/rituals/:slug`,
`/why-lamikaa`, `/cart`, `/search`) and three are bridges to a page a later
prompt replaces (`/shop` and `/category/:slug` → `pages/Products`, the four
`/policies/*` → the four old policy pages). Full table in `REPO_MAP.md` §9.

### The four new modules

- **`src/hooks/useSeo.js`** — title (through the `documentTitle` claim protocol),
  description, `og:title|description|type|url|image`, `twitter:title|
  description|image`, `robots` (only when `noindex`), `link[rel=canonical]` and
  an `application/ld+json` block. Everything it writes is stamped `data-seo="page"`;
  a tag it did not create is borrowed and restored on unmount. No dependency —
  no react-helmet, as the guardrail requires.
- **`src/components/routing/LegacyRedirects.js`** — the ONLY place an old path is
  written down. Exports `LEGACY_PATH_REDIRECTS` (data), `RETIRED_CATEGORY_SLUGS`,
  `useLegacyQueryRedirect()` for the `/products?…` cases, and by default an ARRAY
  of `<Route>` elements (React Router 6's `createRoutesFromChildren` accepts
  `<Route>` and fragments of them, and throws on a wrapper component).
- **`src/components/routing/RouteFallback.js`** (+ module) — `role="status"
  aria-label="Loading"` glass skeleton, `min-height: 70svh`.
- **`src/components/routing/AuthRoute.js`** — `/login` and `/register` open the
  existing `AuthModal` on the right tab and `<Navigate to={state?.from || "/"}
  replace />`, so Back never returns to the door.

Plus `pages/NotFound/NotFound.{js,module.css}`, `pages/_ComingSoon/ComingSoon.js`
(which borrows NotFound's stylesheet — scaffolding should not leave a stylesheet
behind) and a rewritten `components/ScrollToTop/ScrollToTop.js`.

### Link builders

`productPath()` → `/product/<slug>`; new `categoryPath()` → `/category/<slug>`
(`kind: "rituals"` → `/rituals`), `ritualPath()`, `concernPath()` →
`/shop?concern=<slug>`. `categoryParam()` survives as the listing's filter-token
builder only. `src/utils/routes.test.js` pins all of it plus the redirect table
(14 tests).

### The sweep — 26 files

Components: `Header`, `SidebarMenu`, `BottomNav` (path + the active-alias list,
which now lights the tab for `/shop`, `/category/*`, `/product/*` and
`/rituals*`), `Footer`, `CartDrawer`, `SearchModal`, `CategoriesDrawer`,
`AuthModal`, `HeroSection`, `FeaturedProducts`, `CTASection`.
Pages: `Home`, `Products`, `ProductDetails`, `Wishlist`, `OrderHistory`,
`Profile`, `Checkout`, `HelpCenter`, `Support`, `AboutUs`, `SpecialOffers`, the
four policy pages, `Admin/AdminHeroSection` (chip default + the helper text, now
`e.g. /category/face-care`). Utils: `constants`, `helpers`, `categories`,
`heroConfig`, `faqs`, `socialLinks`. `AdminLayout`'s "Back to Store" stays `/`.

### Verification (Chromium 1194, mock mode, dev server)

- **Route table — 25/25 render.** Titles all follow `"%s · LAMIKAA NATURALS"`
  (Home and `/_playground` excepted by design: Home takes `brand.seo.defaultTitle`,
  `/_playground` has no `useSeo`). `/category/face-care` titles itself from the
  API's category name ("Face Care · LAMIKAA NATURALS"). No duplicate
  `description`/`og:title` on any route; no `{{TOKEN}}` in any body.
- **Redirects — 16/16.** `/products`→`/shop`; `?category=face-care`→
  `/category/face-care`; `?category=muga-silk`→`/shop`; `?search=serum`→
  `/search?q=serum`; `?sort=newest` and `?highlight=featured`→`/shop`;
  `/products/black-rice-face-wash` and `/products/1` (numeric) →
  `/product/black-rice-face-wash`; `/help`→`/faq`; `/support`→`/contact`;
  the four policies; `/sarees` and `/collections/muga`→`/shop`.
- **Back after a redirect** lands on the page before it (`/` after `/help`) — no
  bounce loop, because every redirect is `replace`.
- **Hash scroll** `/faq#help-faqs` → `scrollY 1324`; under
  `prefers-reduced-motion: reduce` the same 1324 at 400 ms and at 2 s (instant,
  not animated). An in-app navigation resets to 0.
- **RouteFallback** seen for 117 consecutive polls while the `/orders` chunk
  loaded over a 50 kbps / 2 s-latency CDP throttle, then `/orders` rendered.
- **`useSeo` hand-back**: `/checkout` carries 11 `[data-seo]` elements, one
  `og:title`, `robots: noindex,nofollow`; navigating to `/_playground` leaves
  **0** and restores index.html's own `og:title` and description.
- **Auth doors**: `/login` → `/` with the dialog open on "Sign in"; `/register` →
  `/` on "Create account"; Back does not re-open.
- **Layout**: NotFound and ComingSoon at 390 px and 1280 px — 0 px horizontal
  overflow at both; the card is full-width with 24 px padding at 390 and 560 px
  centred above 480.
- **Admin** `/admin` loads its (now lazily-loaded) login screen; the sixteen
  paths are untouched.
- The only console errors are `ERR_CONNECTION_RESET` on `res.cloudinary.com`,
  `fonts.googleapis.com`, `api.iconify.design` and `placehold.co` — this
  sandbox's egress proxy, as recorded for Prompts 04–07.

### Gates

`CI=true npm run build` exit 0, **no warnings**; **51 JS chunks** (53 files in
`build/static/js`), was 2. `npm test -- --watchAll=false` exit 0 — 3 suites
passed / 1 skipped, 34 passed / 50 skipped. `grep -c "React.lazy" src/App.js` →
**34** — every page but Home (18 storefront + 16 admin).
`db.json` untouched; no dependency added.

