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
| 09 | Header, mega panel and announcement bar | complete | 2026-09-06 | (this commit) | The masthead is the LAMIKAA sticky glass header: one 64px row (56px ≤768px) inside `.sf-container`, `transparent` over `#hero-sentinel` → `.sf-glass` → `.sf-glass--strong` past 24px, blur withdrawn while any overlay is up. `Header.js` 683 → 437 lines; the priority-nav machinery (hidden twin list, `ResizeObserver`, `measureOverflow`, overflow count) and the per-category collection panels are **gone** — `grep -rn "navMeasure\|measureOverflow" src` → **0**. `CategoriesDrawer/` deleted (2 files, 1 071 lines); `grep -rn "CategoriesDrawer\|TrustStrip" src/components/Header` → **0**. New: `MegaPanel.{js,module.css}` (7 categories with real product thumbnails + counts, 11 concern chips, a featured glow card, module-level data cache) and `HeaderActions.js` (search · account · wishlist · cart, the MUI account menu moved verbatim). `AnnouncementBar` is data-driven (`announcements.getAll` → `brand.announcements` fallback), drops placeholder rows and remembers dismissal in **`sessionStorage`** — `grep -rn "localStorage\|FREE_SHIPPING_THRESHOLD" src/components/AnnouncementBar` → **0**. axe (axe-core 4.x, wcag2a/2aa/21a/21aa + best-practice) on the header at 1280 (closed and panel-open) and 390: **0 violations**. `CI=true npm run build` exit 0 **no warnings**; `npm test -- --watchAll=false` exit 0 (3 passed / 1 skipped). Browser QA at 320/360/390/414/768/1024/1280/1440 — 0px horizontal overflow at every width, 0 console errors. See "Prompt 09 record" below. |
| 10 | Mobile navigation drawer and bottom nav | complete | 2026-09-06 | (this commit) | `SidebarMenu` is the first feature on the `ui/Drawer` primitive — its hand-rolled focus trap, Escape handler, `body.style.overflow` lock and close-on-navigate effect are **deleted**, not duplicated (`grep useFocusTrap|useScrollLock` in the file → 0; the primitive owns all four). 632 → 521 lines of JS, the 725-line stylesheet replaced wholesale by 377 (`toggleTheme|Dark mode` → **0**, no `.dark`, no logo swap, no hex). Four labelled navs — Catalogue (a one-item accordion over the seven categories at 48px behind 32px `.sf-plate` thumbnails, default-open on `/shop` and `/category/*`), Brand, Account, Contact — over a pinned **"Shop the Black Rice Range"** CTA and the clamped legal note. `BottomNav` is a five-tab glass bar (64px + safe area, gold + a 20px gradient hairline for active, hide-on-scroll suspended while an overlay is up). `src/utils/catalogue.js` extracts the category-membership rule the mega panel and the drawer now share. **Browser QA: 109/109 checks at 360/390/414/768/1024/1280 + reduced motion + a simulated notch; axe-core 0 violations** on the drawer (open and closed), the bar and the whole document. One pre-existing defect fixed on the way: `AddToCartBar`'s raw `z-index: 1300` painted the PDP purchase bar over every drawer and modal — deleted, so the reserved order 40 < 60 < 1000 < 1100 is now real. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (3 passed / 1 skipped). `db.json` and `api.js` untouched — reads only. |
| 11 | Search overlay and search results | complete | 2026-09-06 | (this commit) | `SearchModal` is the first feature on `ui/Modal` — its hand-rolled focus trap, Escape handler, `document.body.style.overflow` lock and focus-restore are **deleted** (`grep "focusable\|body.style.overflow" SearchModal.js` → 0), and the primitive gains `size="full"` + `initialFocus`. 850 → 642 lines of JS, 813 → 420 of CSS. Ranking moved out to **`src/utils/search.js`** (+ `search.test.js`, 10 tests) so the overlay and `/search` cannot disagree: `"serum"` → Face Serum first, `"hydration"` → Mist/Gel/Body Wash and nothing else, `"goat"` → the soap, `"black rice"` → all eight with the three priced ones leading, nonsense → the empty state (all five verified in Chromium AND pinned in the suite). Recent searches are **`sessionStorage["lk-recent-searches"]`** — `grep -rn "localStorage" src/components/SearchModal src/pages/Search` → **0**. `/search?q=` is a real page (`noindex`), `ComingSoon` is gone from the route (`grep -rn "ComingSoon" src/App.js | grep -i search | wc -l` → **0**), and `/products?search=x` still lands on it. `grep -rn "Muga\|Mekhela\|Eri \|Pat silk\|weave" src/components/SearchModal src/pages/Search` → **0**. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` = **4 suites passed / 1 skipped** (44 passed, 50 skipped). Browser QA at 360/390/414/768/1024/1280/1440 + reduced motion: 0 horizontal overflow, 0 page errors, header backdrop-filter `none` throughout. |
| 12 | Cart drawer with cross-sell | complete | 2026-09-07 | (this commit) | `CartDrawer` is the second feature on `ui/Drawer` — its hand-rolled focus trap, `FOCUSABLE_SELECTOR`, Escape handler and `document.body.style.overflow` lock are all **deleted** (the only hits left for `grep -n "FOCUSABLE_SELECTOR\|body.style.overflow\|onCloseRef" src/components/CartDrawer/CartDrawer.js` are the **2 inside the docblock that records what moved to the primitive** — no code hit). 440px glass tray: measured **65px** masthead (64 + hairline), **96px** lines (72px plate + 12px), **129px** foot (128 + hairline), no horizontal overflow at 360/390/414/768/1024/1280 and the panel at 360/390/414/**440**/440/440. **No invented shipping figure survives**: `FREE_SHIPPING_THRESHOLD` and `FLAT_SHIPPING = 99` are gone, the meter's bar is the lowest `freeAbove` across the active `shipping_methods` (cached in a ref, one request per mount) and hides when none is set; no delivery charge is previewed at all. Measured with `freeAbove: 999` seeded through the API: ₹390 → "₹609 away from free shipping", `aria-valuenow=390 aria-valuemax=999`, fill 39.04%; ₹1 170 → "You've unlocked free shipping", 999/999. `CartContext` gains **`addMany`** (one toast, one drawer opening, skips uncommitted prices) and both add paths now share one `mergeLine` reducer; toasts are sentence case. **17 new unit tests** (`CartContext.test.js` 7, `CartDrawer.test.js` 10). Browser QA: PDP add auto-opens the tray with "Added to cart"; cross-sell Add keeps it open; coupon `SAMPLE10` applies −₹39.00 and a bad code shows "Invalid coupon code"; Tab cycles 11 stops and wraps; Escape closes and restores focus to "Cart, 1 item"; backdrop click closes; Checkout → `/checkout` with the cart intact, scroll unlocked and `body[data-drawer-open]` cleared; View cart → `/cart`; removing the last line falls to the empty state and the foot disappears with it. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (**6 suites / 61 tests passed**, 1 suite / 50 skipped). `grep -rn "FREE_SHIPPING_THRESHOLD\|FLAT_SHIPPING\|Sualkuchi\|looms" src/components/CartDrawer src/context/CartContext.js` → **0**. See "Prompt 12 record" below. |
| 13 | Footer | complete | 2026-09-07 | (this commit) | The close of every page is rebuilt as **four bands on `--sf-color-surface`** under one `.sf-hairline--gradient`: invitation (220px wordmark, master tagline, `signatureLines[3]`, "Stay close to the farm" + the untouched newsletter flow) · directory (`LegalNote` in the wide track, then **four data-fed columns** — the seven categories and three rituals the admin publishes, Company, Help) · assurances (`<address>`, social marks, payment marks) · colophon (BAOPCL copyright, the brand-of line, GSTIN/CIN when resolved, policy micro-links). **One grid, twice** (`--sf-footer-grid`: `1.6fr repeat(4,1fr)`/48px ≥1280, `1.2fr repeat(4,1fr)`/32px ≥1024, 2-up ≥481, single column below), and at ≤480 the four headings become one multi-open `ui/Accordion`, all closed. `src/components/Newsletter/` **deleted** (0 importers) and `FREE_SHIPPING_THRESHOLD` **removed from `constants.js`** with its dead fallback in `fillStoreCopy` — the `{freeShipping}` sentence-dropping stays (FAQ 6 still carries it). New `src/components/brand/LegalNote.{js,module.css}` renders `brand.legalNote` **verbatim** and is the component Prompts 17/25/28 reuse. Browser QA at 360/390/414/480/768/1024/1280/1440 in mock mode: **no horizontal scroll at any width**, ground `rgb(20,20,22)`, outline `h2 "LAMIKAA NATURALS"` → four `h3`, four labelled `nav` landmarks (one "Footer directory" at ≤480), **no `{{` anywhere**, contrast floor **7.0:1**. Newsletter verified end to end (invalid → `aria-invalid` + `role=alert`; valid → lead `id 3` written as `type: "newsletter", status: "subscribed"`, then reverted). Contact rows, the Instagram mark and the GSTIN/CIN rows verified to appear when resolved and to vanish again. `CI=true npm run build` exit 0 **no warnings**; `npm test -- --watchAll=false` exit 0 (6 passed / 1 skipped, 61 / 50 of 111). `db.json`, `api.js` and the admin untouched. See "Prompt 13 record" below. |
| 14 | Home hero product carousel | complete | 2026-09-07 | (this commit) | The admin banner hero is gone: `components/HeroSection/` is deleted and `components/home/HeroCarousel.js` (+`HeroIndex.js`, one shared `HeroCarousel.module.css`) opens the home page on **eight product slides** in `heroOrder` — label card on a duo-glow plate on one side, the product's own `heroHeadline`/`heroSubtext`, `Price`, Explore → PDP, Add to Cart (disabled **"Coming soon"** on the five `priceTBA` products) and its three trust chips on the other. Autoplay 6.5s with banked-time pause on hover / focus-within / hidden tab / the pause button / `body[data-drawer-open]`; swipe, ←/→, Home/End, the product-name index and a signature-gradient progress hairline. Media crossfades (600ms + 1.02→1) while the copy is rendered ONCE and swapped in place, so the page keeps a single `h1`. **Measured in Chromium at 360/390/414/768/1024/1280/1440**: LCP is the first label card (`loading=eager`, `fetchpriority=high`, `ar_1:1` ≤768 / `ar_4:5` above), CLS **0.040 at 390 and 0.029 at 1280 on load** and **0.004 / 0.003 across a full eight-slide walk** (the copy block measures itself against every slide — see the decisions), no horizontal overflow anywhere, zero console errors. Reduced motion: no autoplay, no breathe, no parallax, no progress bar, crossfade only, arrows + index kept. `heroConfig.js` gains `showPause` and a 3000–15000ms interval clamp (default 6500) and marks eleven slide-store exports `@deprecated — removed in Prompt 34`; `db.json` + Admin → Hero Section carry `showPause` in step. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (7 suites / 72 tests, +11 new). |
| 15 | Trust strip and shop-by-category/concern | complete | 2026-09-07 | (this commit) | Three surfaces, one card contract. **`TrustStrip`** is rewritten as the hero's bottom edge: a `.sf-glass` band, 56px (48px ≤639px), four promises from the brand config — `brand.trustBadges` ×3 plus the new `brand.originBadge` ("Rooted in Assam & Northeast India", BRAND.md §3.1) — gold 20px Iconify glyphs, Manrope 600 13px, one `<ul aria-label="Our promises">`; it scrolls-and-snaps under 640px with edge fades and drops its backdrop blur entirely ≤768px. `Home.js` hangs it off the hero with `margin-top: -28px` at ≥769px and 0 below. **`home/ShopByCategory`** (new) + **`catalogue/CategoryCard`** (new, plus a `catalogue/index.js` barrel): SectionHeading "Shop by category / Find your **step** / Seven ways into the Black Rice range.", seven `GlassCard interactive glow="violet"` cards with a real product's label crop on a 1:1 `.sf-plate`, one-line description and a counted chip (Face Care 6 · Body Care 2 · Cleansers 3 · Serums **1 product** · Moisturizers & Mists 2 · Masks & Scrubs 2 · Rituals **3 rituals**), then the 11 concern chips as `Chip variant="concern" as={Link}` → `/shop?concern=…`. Grid 4+3 centred at ≥1280 (eight tracks, `span 2`, 5th card at track 2 — measured: both rows centre on 640px at a 1280 viewport), 3 at ≥1024, 2 at ≥481, a 76vw snap scroller ≤480. **`storefront/ProductCard`** is rebuilt on `GlassCard interactive glow="pink"` with the prop contract and the media→body→action DOM order intact: label plate (crop + `c_pad`, four-width srcSet, `sizes`), ritual step + ≤2 concern chips, Fraunces 20px name, `promise` clamped to 2 lines, `product.badges` as trust chips at 11px, `Price`, a 44px glass heart with `aria-pressed`, and `Button variant="addToCart" block` reading Add to Cart / Coming soon / Out of stock. **PREMIUM, `isPremium`/bridal, `truncateText(…,48)` and the "No ratings yet" line are gone**; stars appear only when `totalReviews > 0`. `TRUST_BADGE_CATALOG` gains `farmerOwned`/`organic`/`resultOriented` whose labels READ `brand.trustBadges[i]`, `STOREFRONT_CONFIG.trustBadges` becomes those three + `securePayment`, and `TrustBadges.js` gains the sprout/leaf/spark paths (and now drops a badge with no resolvable label). Home's old closing PROMISES row was **deleted** — the strip is that row, from the same config. `CI=true npm run build` exit 0 **no warnings**; `npm test -- --watchAll=false` 9 suites / 85 passed (13 new). Browser QA at 360/390/414/768/1024/1280/1440 + a touch phone + reduced motion: 0 console errors, 0 horizontal scroll on 10 routes. See "Prompt 15 record" below. |
| 16 | Home product showcase sections | complete | 2026-09-07 | (this commit) | Every product now has its own full editorial spread on the home page. **`catalogue/ProductChapter`** (new, shared with Prompt 23 through `variant`) renders `<section id data-chapter aria-labelledby class="sf-section">`: a `GlowWrap` (violet/pink by parity) around a 4:5 `.sf-plate` on one side and a `GlassCard` panel on the other carrying the 36px numeral chip, the ritual eyebrow, the `h2` name, the promise, the description at 52ch, up to five `keyIngredients` as glass chips, `product.badges` as trust chips, `fragranceNote`, `Price size="lg"` and the two 48px CTAs ("Explore more" → `productPath`, "Add to Cart" → `useCart().addToCart(buildCartItem(p),1)`, disabled as "Coming soon"/"Out of stock"). Desktop: media 42% at ≥769px then 1fr 1fr with a 64px gutter at ≥1280px, `flip` swapping the columns by `grid-column` so the DOM order stays media → words; the pack is `position: sticky; top: 112px` inside a grid floored at `min-height: 80svh`. Mobile: one column, pack first at 92vw, CTAs stacked full width ≤560px, and the panel drops its backdrop blur ≤768px. **`home/ProductShowcase`** (new) opens with one `SectionHeading` ("The Black Rice range" / "Eight steps. One **ritual.**" / the BRAND.md §3.1 lede) and then eight chapters with a hairline between them; `getHeroProducts()` with a `getAll()`+`heroOrder ?? 99` fallback, two skeleton chapters while loading, nothing at all on error. Mounted in `Home.js` right after `<ShopByCategory/>`. **Two fixes the browser found, both recorded in the decisions log:** a full-width 4:5 plate is exactly as tall as its own grid row, so the sticky never engaged until the pack was capped at `max-width: calc(0.8 * 62svh)`; and the plate's lamp bleeds 5% past its box, which widened the document by 22–69px until the section took `overflow-x: clip`. **Five `media[0].crop` rectangles corrected** after checking all eight at 4:5/900px against their originals — soap (white carton canvas at the foot), body wash (white in all four rounded corners), face mask (white rules at rows 0–8 and 397–400), face scrub (a 1px light-grey rim that made `b_auto` pad the whole frame light grey), face serum (the gold band ran edge to edge); face wash, face mist and moisturizer gel verified unchanged. `CI=true npm run build` exit 0 **no warnings**; `npm test -- --watchAll=false` 10 suites / 95 passed (10 new). Browser QA at 360/390/414/768/1024/1280/1440: 8 chapters, **0 horizontal overflow at every width**, sticky measured at exactly 112px through 1440/1280/1024 and `static` on a phone, quick add opens the drawer with a toast, 5 TBA products disabled as "Coming soon", both CTAs keyboard-reachable per chapter, reduced motion static, **CLS 0.038 desktop / 0.040 mobile with every recorded shift attributed to the hero and header — none to a chapter**. See "Prompt 16 record" below. |
| 17 | About LAMIKAA section and value-chain visual | complete | 2026-09-07 | (this commit) | The farmer-owned story now has a surface. **`brand/ValueChain`** draws BRAND.md §3.3's journey as a real `<ol role="list" aria-label="How value reaches farmers">` of seven `motion.li` — a 32px `Chip variant="step"` numeral, a 14px Manrope 600 label ("LAMIKAA Naturals" in gold, matched against `brand.runningName` rather than by index) and a 60%-opacity signature-gradient connector with an 8px arrow, `aria-hidden`. Three layouts from ONE markup: one row ≥1025px, 4 + 3 at 769–1024px, a 40px vertical rail ≤768px — **measured at 360/390/414/768/1024/1025/1060/1100/1200/1280/1366/1440/1920: rows 7/7/7/7/2/1/1/1/1/1/1/1/1, connectors 24→48px, no overflow at any of them and no element past the section's box.** Zero tab stops (the band's only stop is its CTA); the aria tree reads "01 Farmer" … "07 Farmer Members". **`home/AboutTeaser`** mounts it under the pull-quote, the placeholder landscape and the two BRAND.md §3.1 paragraphs, over `LegalNote` and "Our Story". **Not one word of company copy is in the component** — it is `siteContent.home.aboutTeaser`, and a missing/unpublished/unreachable block leaves only the signature line and the legal note (exercised by aborting the request: quote + chain + note + CTA, no image, no paragraphs). **Two real defects found and fixed in the browser, not by reading:** the global `overflow-wrap: anywhere` on `li` was inherited by the labels and let flex shrink split "FPC" over two lines; and `AnimatePresence initial={false}` in App.js silently disables `reveal(…, { inView: true })` for anything that ships with the route, so the chain landed finished — naming the resting state as `animate` as well restores the sequential wave (measured: opacity 0 → 1 across all seven over ~0.7s; under reduced motion, no style attribute at all, at any point). `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (11 suites, **104 passed**, 9 new). Contrast on the band: labels 16.5:1, gold 13.0:1, legal note 9.0:1. |
| 18 | Why Black Rice spotlight and rituals teaser | complete | 2026-09-07 | (this commit) | Two sections and the card the rituals pages will reuse. **`home/WhyBlackRice`** is the ingredient spotlight: a 1:1 placeholder under `GlowWrap tone="gold" intensity={0.16}` on the left, and on the right the `SectionHeading` ("The hero ingredient" / "Why black rice?", the gradient on **black**, found in the headline rather than pinned to an index), the THREE seeded `siteContent.home.whyBlackRice` points at 17px behind 20px gold `mdi:check-circle-outline` glyphs, and a "Carried by" row of the eight `products.getHeroProducts()` as 56px `.sf-plate` links to their PDPs. **No fallback copy for the points** — an unpublished or unreachable block renders NOTHING, because a spotlight that invents a cosmetic claim is worse than no spotlight. **`catalogue/RitualCard`** is ONE `<Link>` per routine (verified: one tab stop, zero nested controls) carrying a 16:10 photograph, "Ritual · N steps", the name at 22px Fraunces, the tagline (or the story's first WHOLE sentence), a step strip of up to five 40px plates at −8px overlap with 24px gradient-ring numerals — the body ritual's `alternativeProductId` peeking out from behind step 01 — the duration and a ghost "See the ritual →". It resolves its own steps through the pure `resolveRitualSteps`, so Prompt 24's index needs only the same two inputs. **`home/RitualsTeaser`** is the triptych: `rituals.getAll()` + `products.getAll()` in one `Promise.all`, three cards at 769px+, one column 481–768, an 84vw snap scroller ≤480, and a primary "Build your ritual" → `/rituals` under the grid. Measured at 360/390/414/480/481/768/769/1024/1280/1440: **document overflow 0 at every width**; media 1:1 (533² at 1280) and 16:10 (355×222); the desktop body `532.8px 651.2px` (0.9fr/1.1fr) at 56px gutter from 1025px. 12 tab stops across both sections (8 PDP thumbs, 3 cards, 1 CTA). Under `prefers-reduced-motion: reduce` no reveal wrapper carries a non-1 opacity. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` 12 suites / 118 passed (15 new in `RitualCard.test.js`, 1 suite / 50 tests skipped — the live-API suite). No `db.json` or `api.js` change: reads only. |
| 19 | Full-page CTA section | complete | 2026-09-07 | (this commit) | The page now stops for one screen and asks. **`brand/NewsletterForm`** is the footer's capture, extracted: the `isEmailValid()` gate, `apiService.leads.createNewsletter`, the six-second success revert and the `role="status"` / `role="alert"` pair move out of `Footer.js` whole, and both surfaces mount the same component (`variant="footer" | "cta"`, own `id` base so the two forms' ids cannot collide). Both were subscribed for real in Chromium and both leads landed in `/leads` as `type: "newsletter"`, `status: "subscribed"` rows the admin table renders. **`home/FullPageCta`** is four layers — a lazy `alt=""` photograph, the 82%→94% `--sf-color-bg` wash, the signature gradient at 12% `screen`, and a `GlassCard strong scrim padding="lg"` (max 760px) under one `GlowWrap tone="duo" intensity={0.22} breathe` — with **no backdrop blur on the ground** (measured: section `backdrop-filter: none`, card `blur(20px)`). `min-height` **100svh from 769px, 80svh below**, `vh` fallback above each. **Two defects found in the primitives and fixed**: `prefers-reduced-motion` never stopped a DUO glow's second lamp (`.sf-glow--duo.sf-glow--breathe::after` out-specificities the one-class reset — the hero has had this since Prompt 14; `document.getAnimations()` 2 → 0), and `.sf-glass--scrim::before` painted **over** the content it exists to make legible (a warm-white headline capped at rgb(165,163,161); now `z-index: -1` inside an isolated context, headline back to rgb(247,245,240)). Contrast on the card, measured against a deliberately near-white photograph: headline **12.9:1**, eyebrow 9.9, lede 6.9, hint 6.9, ownership note 5.9, and the one gradient keyword's darkest stop **3.1:1** — inside the large-text floor at 72px/36px. One breathing glow visible at every one of the 176 scroll positions scanned. `CI=true npm run build` **exit 0, Compiled successfully, no warnings**; `npm test -- --watchAll=false` 13 suites / **127 passed** (9 new). No `db.json` and no `api.js` change. |
| 20 | Why LAMIKAA section (pillars and impact) | complete | 2026-09-07 | (this commit) | The band that says what the brand stands on, built as two components the Why LAMIKAA page (Prompt 28) mounts unchanged. **`brand/Pillars`** is BRAND.md §3.2's four pillars as one `<ul role="list">` of four `GlassCard as={motion.li}` — a 44px glass circle carrying a 24px gold glyph (`mdi:leaf`, `mdi:flask-outline`, `mdi:account-group-outline`, `mdi:earth`, resolved by KEY with a positional fallback so a renamed key cannot silently swap two icons), a `Chip variant="step"` numeral 01–04, the title in Fraunces 22px and the sentence in Manrope 15px secondary — **every word of it from `brand.pillars`, none of it typed in the component**. 4 columns ≥1025px / 2 at 769–1024 / 1 stacked ≤768, 16px gaps, measured at all seven widths. **The cards are deliberately NOT `interactive`**: a card that lifts 4px and shows a focus ring promises a destination it does not have, so the alternating gold/violet tone glow is faded in by a hover rule of the module's own (`:global(.sf-glow)` held at 0 → 1) and the grid stays keyboard-transparent — **measured: one tab stop in the whole section, the CTA, and `transform: none` on every card at every hover**. **`brand/ImpactTriptych`** is `siteContent.impact.items` as three columns under a 60% signature-gradient hairline: the eyebrow DERIVED from the key (Financial / Social / Environmental), the title with that category prefix taken off — but only when a dash follows it, so "Financially Sustainable" keeps its first word — and the three points at 15px behind 18px gold bullets. **A bullet, not a tick**: these are aims, and a check mark in front of "Farmers can benefit from the profitability of their own enterprise" reads as a claim that it has already happened. Points render **verbatim** — no truncation, no summarising — which is what preserves the BRAND.md §3.9 qualifiers; asserted in the suite and re-checked against the seed (0 dividend mentions without "can reach the member farmers through dividends"). `showImages` false here, true on the page. **`home/WhyLamikaaSection`** fetches `siteContent.get("impact")` and composes the two: `brand.philosophy` as the h2 over the new `brand.philosophyLede` (BRAND.md §3.2's first sentence), the pillars, a second heading row, the triptych and `Button variant="secondary"` → `/why-lamikaa`. **The two halves fail separately** — the pillars come from a module the bundle always has and always render; a missing, unpublished or unreachable impact block takes its own heading with it rather than standing over an empty space (exercised for real: the first QA run reached the live host and the section rendered philosophy + 4 cards + CTA, nothing invented). **One defect the test found and reading did not:** `impactColumns` filtered rows before normalising them, so a row carrying three blank strings passed a `points.length` check and rendered as an empty column; the filter now runs after. Outline verified in the browser: 1 page `h1`, this section's `h2` at 52px, 4 pillar `h3` at 22px, the impact `h3` at 40px, 3 column `h4` at 20px, 4 `role="list"` lists, 0 nested landmarks. Contrast on the page ground 18.05 / 13.88 / 9.62:1 and on the card ground 15.95 / 12.27 / 8.5:1. Under `prefers-reduced-motion` framer-motion attaches **no style attribute at all** and 0 animations run. `CI=true npm run build` exit 0 **no warnings**; `npm test -- --watchAll=false` 14 suites / **151 passed** (24 new). No `db.json` and no `api.js` change: reads only. See "Prompt 20 record" below. |
| 21 | Home FAQs section and accordion | complete | 2026-09-07 | (this commit) | `components/FAQ/*` rewritten onto the `ui/Accordion` primitive and turned into a **props-driven** block (`faqs, limit, defaultOpen, multiple, id, headingLevel`), so the home band, `/faq` (28) and the PDP panel (27) can all mount one accordion; `home/HomeFaqs.js` is the band around it. `utils/faqs.js` gained `faqLimit()` and a `{ limit }` option on `faqsForPlacement` (applied AFTER the filters and the de-dupe); `FaqContext.forPlacement` passes the options through. `db.json` `faqs` rows 6–8 gained the `"home"` placement — **3 JSON values** — so the block carries the 6–8 rows the prompt asks for (the Prompt 06 seed had put `home` on rows 1–5 only). Browser QA at 360/390/768/1024/1025/1280: **8 rows at every width**, 0 horizontal overflow, no `{{TOKEN}}` anywhere on the page, two columns + sticky aside from exactly 1025px, question Manrope 600 17px over a 44px floor, 20px gold chevron, answer Manrope 16px secondary at 20px inset, open row wearing a 2px signature-gradient rule at 0.6, separators `rgba(255,255,255,.08)`. Deep link `/#faq-3` opens **and focuses** row 3; ↑/↓/Home/End walk the headers and wrap; Enter opens, Space closes; panel `transition-duration: 0s` under reduced motion. Admin → FAQs still lists all eight with the Shared/Help/Product vocabulary, and a `PATCH /faqs/1` reached the open storefront on the next focus refetch. `CI=true npm run build` exit 0 **Compiled successfully, 0 warnings**; `npm test -- --watchAll=false` **173 passed** (17 suites, 1 skipped), 22 of them new. See "Prompt 21 record" below. |
| 22 | Home assembly, performance and SEO | complete | 2026-09-07 | (this commit) | The home page is assembled: **eleven sections in the brief's order**, `ShopByCategory` moved from under the trust strip to **after** the eight product chapters (brief §7.2 item 4), and every pre-rebuild section deleted — collection stories, featured grid, offers rail + countdown, craft interlude, trending rail, promises row — along with `components/FeaturedProducts/*` and `components/CTASection/*` (0 consumers) and the now-unused `TRUST_BADGES` alias in `constants.js` (`WHY_CHOOSE_US` **kept** — `pages/Support/Support.js:594` still maps over it). `Home.js` 742 → 279 lines, `Home.module.css` 779 → 105 (page rhythm only: ground, hero, trust edge, deferral). **One data load:** new `components/home/useHomeData.js` reads `products.getAll` · `getHeroProducts` · `categories` · `concerns` · `rituals` · `siteContent` **once each, in parallel**, and the nine sections take their slices as props — the naively assembled page issued **15 requests for 6 collections**, it now issues **6**. Tri-state slices (`undefined` = in flight, `null` = failed, value = loaded). **Nine lazy chunks** behind a `DeferredSection` (`useInView` + `rootMargin: 600px`, measured reserve heights, `content-visibility: auto` on the six sections that draw no glow). New `components/home/RecentlyViewed.{js,module.css,test.js}` ports the localStorage reconciliation and the `useRail`/ResizeObserver logic verbatim; threshold raised 1 → 2 (8 new tests). `organizationJsonLd()` + `websiteJsonLd()` added to `hooks/useSeo.js` — **schema.org validator: 0 errors, 0 warnings**. **Lighthouse mobile (production build, median of 3): Performance 68, Accessibility 100, Best Practices 100, SEO 100** — three of four targets met; Performance is **below the ≥85 target** and the cause is measured and recorded below. CLS 0.174 → **0.042**; Speed Index 20.7s → **3.2s**; total JS on `/` **253 kB gzipped** (≤350 budget ✓). `CI=true npm run build` exit 0 **no warnings**; `npm test -- --watchAll=false` exit 0 (18 suites / 181 passed, 1 suite / 50 skipped). See the Prompt 22 record below.
| 23 | Shop page — chaptered editorial listing | complete | 2026-09-08 | (this commit) | `/shop` is the chaptered listing: **eight full editorial chapters in hero order, no filter, no sort, no pagination, no sidebar** (brief §7.3 — the removal is an owner decision, recorded below). `pages/Products/*` (1 687 + 1 335 lines) is **deleted**; `pages/Shop/Shop.js` is 380. New: `catalogue/ChapterIndex.{js,module.css}` (a 220px sticky rail at ≥1025px, a sticky pill strip at ≤1024px) and `catalogue/BuildRitualPanel.{js,module.css}` (the closing `GlassCard strong glow="duo"`), plus `utils/seo.js` with `itemListJsonLd`. `ProductChapter` gained `variant="shop"` proper — 88svh floor on the split screen, no floor on a phone, `scroll-margin-top: 96px`, `data-slug`, a focusable `h2` and an `onVisible(index)` IntersectionObserver at threshold 0.5. **`/category/:slug` now routes to `<Shop mode="category" />`**, which is what kept the category listing alive when `Products` went (Prompt 24 adds its head, breadcrumb and 404). `utils/categories.js` lost `getCategoryScopeIds` and `orderCategoriesHierarchically`; `utils/helpers.js` lost `getDeviceType`; `getDescendantIds` stays for the admin. **Scroll-snap was KEPT** after measurement (see the decisions log). `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (19 suites / 197 passed, 1 suite / 50 skipped — 16 of the passing tests are new, `ChapterIndex.test.js`). Browser QA in Chromium 1194 at 360/390/414/768/1024/1280/1440 + reduced motion: **no horizontal scroll at any width, zero page errors**. See the Prompt 23 record below. |
| 24 | Category pages and rituals pages | complete | 2026-09-08 | (this commit) | The seven categories have their heads and the rituals have their two pages. **`pages/Shop/Shop.js` is split in two**: `Shop` holds the route's two exits — a `kind: "rituals"` category (or the literal slug) → `<Navigate to="/rituals" replace/>`, an unknown slug → `<NotFound/>` — and `ShopView` holds every other hook and the JSX. The split is load-bearing, not tidy: `useSeo` BORROWS the head's existing tags and restores what it displaced, so two of them mounted at once (the page's and `NotFound`'s) restore child-then-parent and strand the child's description in the head. `RitualDetail` is split the same way for the same reason. New: **`catalogue/CategoryHead`** (full-bleed `.sf-placeholder-media` band — 4:3 phone / 21:9 + `clamp(260px,32vw,420px)` from 769px — under a `GlassCard strong scrim` panel on a NEGATIVE MARGIN, never `position:absolute`, so a long description grows the panel instead of being clipped), **`pages/Rituals/Rituals`** (three full-width rows, image left from 900px), **`pages/Rituals/RitualDetail`** (head → `RitualStep` rows → CTA panel → `LegalNote compact`) and **`catalogue/RitualStep`** (`72px 1fr` phone / `96px 240px 1fr auto` desktop, a 36px numeral, a 240px label plate, the promise, the note in display italics, a frequency chip, `Price` and one add-to-cart). `Breadcrumb` was **rewritten** — it had zero consumers — onto the FULL `{label, to}` trail, and `utils/seo.js` gained `breadcrumbJsonLd(items)` over **the same array**, so the crumb a visitor reads and the crumb a crawler is told cannot drift. Verified in Chromium 1194 at 360/390/414/768/1024/1280/1440: `/category/face-care` **6** chapters · `body-care` **2** · `cleansers` **3** · `serums` **1 PRODUCT** (singular) · `moisturizers` **2** · `masks` **2** · `rituals` → `/rituals`; `/category/nope` and `/rituals/nope` → a real 404 with the URL kept. `/rituals` lists three; `morning-glow` shows its four products in order; `black-rice-body` offers the soap/wash `radiogroup` (**one** tab stop, arrows both ways, the gold focus ring) which swaps the name, promise, plate, PDP link, price, add button AND the panel's total together. **With `enableRitualBundles: true` locally**: one press, ONE toast ("2 items added to your cart"), a cart holding exactly the two priced steps of five — the three TBA products never entered it; **reverted to `false` before the commit** (`git diff src/config/brand.js` empty). Both JSON-LD graphs valid on every page. **0 horizontal overflow at all seven widths**; reduced motion computes `opacity: 1 / transform: none` on the step rows and `scroll-snap-type: none`. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` **20 suites / 218 passed** (21 new in `RitualStep.test.js`; 1 suite / 50 skipped — the live-API suite). `grep -n "ComingSoon" src/App.js` → **only `/why-lamikaa` and `/cart`**. Reads only: no `db.json` and no `api.js` change. |
| 25 | PDP — layout, chapters, purchase panel, mobile bar | complete | 2026-09-08 | (this commit) | The product page is the two-column composition: a **sticky media column** (`top: 96px` from 1025px) beside a scrolling column holding `PurchasePanel` and then the story as numbered **chapters**. `pages/ProductDetails/ProductDetails.js` 1143 → 693 and its stylesheet 1109 → 161: the tab strip, `SILK_SPEC_LABELS`/`deriveSilkSpecRows`/`deriveGenericSpecRows`/`deriveFabricCraft`/`deriveKeyFeatures`/`isPremiumProduct`, the promises band and the hand-rolled `setPageTitle` + `meta[name=description]` effect are all gone; `useSeo({title, description, image, type:"product"})` owns the head (JSON-LD in 27). Three new components in `components/pdp/`: **`PurchasePanel`** (trail → eyebrow → h1 → promise → rating → price → size/fragrance/SKU → trust chips → variants → quantity+stock → Add to Cart / Buy now / wishlist / share → delivery → the ownership note), **`ChapterNav`** (a glass pill bar after 320px of scroll, IntersectionObserver-tracked, `aria-current`, sticky at 72/56px) and **`Chapter`**. `AddToCartBar` rebuilt on `Button`/`Price`/`CloudinaryImage`; **`BottomNav` stands down on `/product/*`** so the two bars never stack. Everything the old page could do still works — reviews, FAQs, the bundle and the related rail are in the column, awaiting Prompt 27's chapters. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` 21 suites / 233 passed (1 suite / 50 skipped), 15 of them new. |
| 26 | PDP — media gallery with images and videos | complete | 2026-09-08 | (this commit) | The media column is the real gallery. **`pdp/MediaGallery`** (441 + 324) is one list of images and videos behind one index: a 4:5 plate (1:1 ≤768px) on a gold `GlowWrap`, a crossfaded stage that mounts **only the active row** (so a five-frame product never puts five `<video>` elements on the page), the "Full label / Front panel" toggle wherever a row carries a Cloudinary crop, a "Zoom" button, a live counter, 44px glass arrows and **one** rail — `role="tablist"` with roving tabindex, a 72px column beside the stage from 1025px and a 56px snap strip below it under that. **`pdp/Lightbox`** (448 + 249) is `ui/Modal size="full"` repainted as a flat 96% scrim: the picture at `w_2000` uncropped, wheel / pinch / ± / double-tap zoom from 1× to 4× with the pan clamped to the picture's own edges, ←/→/Esc, swipe, and focus back on the Zoom button. **`hooks/useSwipe`** (108) is pointer-based, ignores vertical gestures (`touch-action: pan-y`), **cancels the browser's native image drag** (without which a mouse drag across a photograph never completes) and works with a mouse. `storefront/ProductGallery.*` **deleted** with its export; `STOREFRONT_CONFIG.gallery` is now `{zoom, lightbox}`. One shared-primitive fix on the way: `Modal`'s `.full .body` had no `flex: 1`, so a full-screen dialog's body was content-height and the lightbox's picture region collapsed to 0 (the search overlay had the same latent bug). 17 new tests. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (22 suites / 250 passed). Browser QA at 360/390/414/768/1024/1280/1440 + touch swipe + keyboard-only + reduced motion: no horizontal scroll, no page errors. |
| 27 | PDP — supporting content, reviews, cross-sell, JSON-LD | complete | 2026-09-08 | (this commit) | The product page is finished: **nine chapters**, every one of them optional and every one of them printing DATA. `overview · benefits · ingredients · how-to-use · farmer-story · full-ingredients · faqs · reviews · complete-the-ritual`, with the chapter index and the chapter markup reading **one** set of booleans so `ChapterNav` and the document can never disagree. Four new components (`pdp/PackClaims`, `IngredientChapter`, `HowToUse`, `FarmerStory`, 487 lines + 4 modules), `utils/seo.js` 93 → 245 with **`productJsonLd`**, and the three retained blocks rewritten. **Claims discipline held**: `offers` only where `isPriceKnown`, `availability` only where `stock` is a real number, `aggregateRating` only where a real average AND count exist — so on a fresh install **no** graph carries a rating and five of eight carry no offer; the carton's "anti-ageing" line appears exactly once on the page, inside "As printed on the pack". Reviews empty state is now "No reviews yet — Reviews are written by customers from My Orders after delivery."; the flag flip was exercised and reverted. `CI=true npm run build` **exit 0 with no warnings**; `npm test -- --watchAll=false` 276 passed / 50 skipped (26 new). Browser QA at 360/390/414/768/1024/1280/1440 — **`scrollWidth === clientWidth` at every one** after two container-vs-viewport fixes the browser found. See "Prompt 27 record" below. |
| 28 | Content pages from siteContent | complete | 2026-09-08 | (this commit) | **Five pages, one source of copy.** `/about`, `/why-lamikaa`, `/faq`, `/contact` and `/policies/:policy` are built from `siteContent` and render **not one narrative sentence typed into JSX** — only UI furniture ("Our Story", "Contents", "Send message"). **Seven old page folders deleted** (6,844 lines of Meghali-era JSX + CSS, four of them four copies of one document stylesheet); the four policy routes collapse into **one param route** and `/policies/other` renders a real 404. New: `utils/policyClauses.js` (the tax / COD / returns / shipping-method clauses a policy cannot carry in stored prose), `hooks/useSiteContent.js`, `utils/seo.js` + `faqPageJsonLd`. **The old Terms page's three hard-coded rupee shipping rates are gone and cannot come back** — rates are live data or nothing. Browser QA in Chromium at 360/390/414/768/1024/1280/1440: **no horizontal scroll on any of the five page types**, deep links `/faq#faq-7` and `#group-orders` open and focus the right row, the contact form posts a lead with the same seven keys, and the Terms clause re-words itself when Settings change (verified against a patched settings record, then reverted). `CI=true npm run build` **exit 0 with no warnings**; `npm test -- --watchAll=false` 313 passed / 50 skipped (**37 new**). See "Prompt 28 record" below. |
| 29 | Cart page and checkout restyle | complete | 2026-09-08 | (this commit) | `/cart` is a real page and `ComingSoon` has no route left (`grep -n "ComingSoon" src/App.js` → **0**). `components/cart/CrossSell.{js,module.css}` is "Complete your ritual" lifted out of the drawer whole — `crossSellFor` and the row markup now have ONE home and the tray and the page cannot disagree about what comes next. `pages/Cart/Cart.{js,module.css}` (482 + 508) is the two-column page: line items at 96px→112px of plate on the left, a sticky `GlassCard strong` summary on the right (subtotal · the drawer's coupon disclosure verbatim · discount · "Shipping and taxes calculated at checkout" · Checkout · Continue shopping · `LegalNote compact`), the cross-sell under the items, and below 769px one column with a 64px glass thumb bar — **`BottomNav` now stands down on `/cart` as well as `/product/*`** (verified: BottomNav nodes = 0 on `/cart`, 1 on `/shop` and `/checkout`). `Checkout.module.css` **rewritten from scratch**, 2 107 → 1 492 lines, on the shared primitives; `Checkout.js` edited for markup, classes and copy ONLY — the money block, the `orderData` payload, `STEPS`, `couponDiscountFor`, `etaFor`, `applyCoupon`/`removeCoupon`, `validateAddress`, `PAYMENT_OPTIONS` and `assurances` were diffed byte-for-byte and are **IDENTICAL**. Two additive guards only: the step-0 TBA drop and the order-failure alert. `grep -n "silk\|weave\|loom\|&#8377;" src/pages/Checkout/Checkout.js` → **0**. Measured live: inputs 48px, option cards 64px, CTA 52px, step chips 36px, `scrollWidth === clientWidth` at 360/390/414/768/1024/1280/1440 on both pages. `CI=true npm run build` **exit 0, no warnings**; `npm test -- --watchAll=false` **27 suites passed / 1 skipped (313 passed)**. Two real orders placed end to end in mock mode (COD, then coupon + store credit) — see the Prompt 29 record. **`git status db.json` clean.** |
| 30 | Auth, account, orders and wishlist restyle | complete | 2026-09-08 | (this commit) | `src/utils/orderStatus.js` is the one home for `deriveOrderStatus` + `STATUS_CONFIG` — the two byte-identical copies in `OrderHistory.js:18-47` and `Profile.js:18-47` are gone and both pages read `orderStatusInfo(order)` (`grep -rn "deriveOrderStatus" src --include=*.js | grep -v utils/orderStatus.js` → **2**, both docblock references; `grep -rln "utils/orderStatus" src` → **2 importers**). The config now carries a semantic **tone** instead of a per-page CSS-module class name, so a status is coloured once: `Chip variant="status"` on both screens. **`AuthModal` (1049 → 875) and `ReviewModal` (337 → 250) are on `ui/Modal`** — four hand-rolled overlays, focus traps, Escape handlers and body locks deleted, and both gained the route-change close and the scrollbar compensation they never had; the **disabled Google/Facebook buttons and their five brand hexes are removed** (Decisions), which leaves `ErrorBoundary` and `Footer`'s payment marks as the storefront's only documented hard-coded colours. `Profile` is a `320px 1fr` dashboard from 1025px (initials in a signature-gradient ring, three figures, a 52-55px index, recent orders); `OrderHistory` records are `GlassCard`s with 56px plates, a `Chip variant="step"` passage on a gradient hairline and pill actions; `Wishlist` is "Your wishlist" on a 1/2/3/4 grid with `Button variant="secondary" block` under each card. `RETURN_WINDOW_DAYS` now reads `STOREFRONT_CONFIG.returnsWindowDays`. All five stylesheets rewritten on the tokens (5 030 → 3 345 lines, **no colour hex and no `rgba()`**, every `var(--sf-*)` resolves). Logic diffed against HEAD: **Profile's 374-line effect+handler block is byte-identical**; OrderHistory's differs only in the four `orderStatusInfo` call sites and the deleted local `getStatusInfo` wrapper. `grep -rn "Muga\|Eri\|weave\|loom\|Collection" src/pages/Profile src/pages/OrderHistory src/pages/Wishlist src/components/AuthModal src/components/ReviewModal` → **0**. `CI=true npm run build` **exit 0, no warnings**; `npm test -- --watchAll=false` **27 suites passed / 1 skipped (313 passed)**. Driven end to end in Chromium against mock mode — login, register validation, strength meter, address CRUD with the default rules, wallet ledger, order cancel (COD copy), reorder, and a review written from a delivered order → pending in Admin → approved → live on the PDP → the chip flips to "Review published". No horizontal scroll at 360/390/414/768/1024/1280/1440 on any of the four surfaces; zero page errors. **`git status db.json` clean.** See the Prompt 30 record below. |
| 31 | Order confirmation, offers, search results and state consistency | complete | 2026-09-08 | (this commit) | **`ui/EmptyState` + `ui/ErrorState` are the storefront's two state cards** (87 + 150 + 64 lines; `ErrorState` composes `EmptyState`, so there is one stylesheet and a failure can never look like a different application). **20 `<EmptyState>` and 7 `<ErrorState>` call sites across 12 pages** replace 27 hand-rolled state blocks, five bespoke SVG marks (`EmptyMark`, `BagMark`, `SealedMark`, `AlertMark`, `TagMark`) and eight `.state*` / `.empty*` / `.panel*` class families (**−661 CSS lines net** across 13 stylesheets). Empty and failed stay DIFFERENT components everywhere, and `SpecialOffers` and `Search` gained the failed branch they never had (both `catch`es used to write `[]`, i.e. a dropped read read as "no offers" / "nothing matched"). `OrderConfirmation` keeps every behaviour — `getByOrderNumber`, the `paymentStatus`-driven chip + lede, estimated/real arrival, clipboard-verified copy, confetti, the store-credit ledger, the honest invoice placeholder — and is restyled to a 96px `GlowWrap tone="gold"` seal over a signature-gradient ring, a Fraunces "Thank you, {firstName}", a glass record card (`1fr 1fr` ≥769px), 15px hairline ledger rows, `Chip variant="status"` and three pill `Button`s (Continue shopping → **`/shop`**, was `/`). **`SpecialOffers` lost its 110-line copy of the shared card** (`grep -rn "const ProductCard" src/pages/SpecialOffers` → **0**): the markdown wall is `storefront/ProductCard`, the vouchers are `GlassCard glow="gold"` 3/2/1-up with the code in monospace gold, and the seed's disabled page is `EmptyState` "No offers right now" → `/shop`. `src/pages/_ComingSoon/` **deleted** (`grep -rn "ComingSoon" src` → **0**), and the now-unreferenced global `.loading-spinner` + `@keyframes spin` went with it (`grep -rn "loading-spinner" src/pages` → **0**; the four surviving spinners are all inside buttons). `DEFAULT_DEALS_HERO`/`DEFAULT_DEALS_TIMER` were the previous brand's promo voice and are now the seed's neutral wording with the clock off (Decisions). `CI=true npm run build` **exit 0, no warnings**; `npm test -- --watchAll=false` **27 suites passed / 1 skipped (313 passed)**. Driven in Chromium against mock mode at 390 and 1280: COD and store-credit confirmations, the not-found and failed branches, `/special-offers` disabled and enabled (SAMPLE10 voucher + auto-derived deals), no-results search, the 404, empty cart/checkout/orders/wishlist, Profile's five compact states, and every error state with JSON Server stopped. Confetti fires once with `aria-hidden`/`role=presentation` on its canvas and does not fire at all under `prefers-reduced-motion`. No horizontal scroll and no `{{` at any width. **`git status db.json` clean.** See the Prompt 31 record and its state checklist below. |
| 32 | Admin rebrand and shell | complete | 2026-09-08 | (this commit) | `buildAdminTheme()` recoloured to the LAMIKAA palette (DESIGN_SYSTEM §10) and its `mode` argument retired to a no-op; `CHIP_TONES` re-derived as one dark map; radius 6 → 8; gold focus ring on every `MuiButtonBase`; glass-like AppBar. **`grep -rn "#[0-9a-fA-F]\{6\}" src/pages/Admin src/components/AdminLayout | grep -v "AdminOrders.js" | wc -l` → 0** (was 78; the five that remain are the invoice PRINT stylesheet — ink on white paper, logged in Decisions), and the seven short-hex/`common.white` literals the acceptance grep does not catch went too — three of them were white on the gold plate (1.6:1). **`grep -rn "MOCK_REVIEWERS\|My E-Commerce Store\|16GB\|laptop\|mekhela\|Muga\|Bihu\|Sualkuchi" src/pages/Admin src/components/AdminLayout` → 0.** Shell: `<Logo width={150}>` in the permanent drawer and `variant="mark" width={36}` in the temporary one, drawer ground `#0B0B0D`, gold active item with a 3px gradient rule, "Hero Section" → "Home & Hero" (route unchanged), `document.title = "{screen} · Admin · LAMIKAA NATURALS"` through the `documentTitle` claim/release protocol — **all 15 screens verified**. Login: one pane of glass, "Admin Console" / "Sign in to manage LAMIKAA NATURALS", gold button, no demo hints. Products table gains **Hero** and **Media** columns and a "Price on launch" chip; Reviews lost the eight fabricated reviewer chips and gained a **Sample** chip; the invoice prints the wordmark, `brand.name`, `brand.legalName` and GSTIN only when resolved. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (27 suites / 313 tests passed, 1 suite / 50 tests skipped). Browser QA (Chromium 1194, mock mode): **15 screens × 360/768/1280 = 45 loads, 0 horizontal overflow, 0 console errors**; a 24-step regression walk (product/category/coupon/shipping/FAQ/review create→edit→delete, order fulfil→deliver→cancel, refund initiate+complete, return create→approve→received→refund, payment refund, user deactivate→activate, lead update, settings save, deals save) **passed 24/24 with 0 console errors**; `git status db.json` clean afterwards. See "Prompt 32 record" below. |
| 33 | Admin product form — media manager and new fields | complete | 2026-09-08 | (this commit) | `"Image URLs (one per line)"` is gone (**grep → 0**) and the form now edits **every one of the 50 fields `PRODUCTS.md` §6 defines** — it edited 20. Four new files: `components/MediaManager.js` (image links + video links: add / remove / reorder / preview / validate / primary, 64px live thumbnails, `<video preload="metadata">` as the reachability check, a Cloudinary-only "Advanced: stage crop" disclosure, a "Placeholder" chip, drag handles **and** up/down buttons with focus restoration, a `3 images · 2 videos · primary: #1` summary), `components/ListEditor.js`, `components/KeyValueListEditor.js`, `components/ProductFormSections.js` (ten MUI `Accordion`s, first open, counts in the headers, error-bearing sections open themselves). `validateMedia()` added to `src/utils/product.js` (≥1 image, exactly one primary, http(s) URLs, no duplicates, video posters) with **8 new test cases**; `api.js` unchanged. Validation gained `priceTBA || price > 0 || variants.length`, media, `categoryIds ⊇ categoryId` and hero-position uniqueness ("Hero position 1 is already used by Black Rice Face Wash"). Table gained the **Hero / Price on launch / Drafts** chips and a **New** flag chip; the dialog is full-screen below `sm`. **Round trip verified in a real browser (Chromium 1194, mock mode, json-server on a scratch copy): all 8 seeded products opened → saved unchanged → the ONLY fields that differ are `updatedAt` and the derived `image` mirror the api layer writes** (see Decisions). Media edits (add image, reorder, re-primary, add video) land as `media[]` + derived `images[]`/`image` and are reflected on the PDP gallery, /shop, /category, /search, /wishlist, the home hero and the cart thumbnail. Creating a 9th product from scratch produces the full schema. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (27 suites / **321** tests passed, 1 suite / 50 skipped). Browser QA at 360/768/1280: 0 horizontal overflow, 10/10 sections reachable, 200 focusable controls, 0 console errors. See "Prompt 33 record" below. |
| 34 | Admin content management | complete | 2026-09-08 | (this commit) | **Every new collection is now editable, and the admin's temporary scaffolding is gone.** Five new screens: `AdminAnnouncements` (table + full-screen-on-mobile editor: text, link, `datetime-local` schedule, on/off, up-down reorder, a live "on the bar right now" strip and a placeholder chip that names the token), `AdminRituals` (table + steps editor: product `Autocomplete`, optional alternative product, note, frequency, up/down; `order` is written from the ROW POSITION, never from a field, so it is always dense; slug auto-generated on create and left alone on edit because `/rituals/<slug>` is a live URL), `AdminConcerns` (small: name/slug/order; delete refused while any product names the slug, and a slug CHANGE warns with the count it would orphan), `AdminContent` (a keyed editor over `siteContent`: a 12-entry rail — About, Why LAMIKAA, Impact, Contact, FAQ page, the three home bands, the four policies — and a form **generated from the block's shape**: markdown-lite `body`/`text`/`story`/`intro` get a textarea and a real `<ContentBlocks>` preview, `*image*` keys get a thumbnail, `string[]` reuses Prompt 33's `ListEditor`, `object[]` gets repeatable sub-forms, and anything else is shown read-only rather than dropped on save), and `components/MarkdownField.js` (the shared textarea + preview + grammar/token cheat-sheet, so Content and Rituals cannot drift). `AdminHeroSection` **rewritten**: two tabs (Hero products — thumbnail, inline `heroHeadline`/`heroSubtext` per row with dirty tracking, up/down, add via `Autocomplete`, remove, and a live slide preview showing the label crop, eyebrow, headline, price, subtext, badges and both CTAs; Section settings — the ten `heroConfig` keys). The temporary announcements tab and the `rowToSlide`/`slideToRow` adapters are deleted. `heroConfig.js` lost **18 slide-store exports** (17 marked `@deprecated`, plus the unmarked and unused `DEFAULT_HERO_EYEBROW`; the 7 that remain are the ones `HeroCarousel` reads) (`grep -n "@deprecated" → 0`): `HERO_BACKGROUND_TYPES`, `HERO_TEXT_ALIGNMENTS`, `HERO_IMAGE_POSITIONS`, `HERO_DEVICES`, `DEFAULT_HERO_HEIGHTS/SECONDARY_CTA/OPENERS/SLIDE`, `HERO_MIN/MAX_DURATION_MS`, `HERO_FALLBACK_SLIDES`, `DEFAULT_HERO_EYEBROW`, `normalizeHeroHeights`, `normalizeHeroSlide(s)`, `heroSlideDuration`, `heroSlideOverlay`, `heroStageVars` — plus `overlayOpacity`/`heights`/`secondaryCta`/`openers` from `normalizeHeroConfig` (HeroCarousel reads none of them) and the `slide` transition (the prompt specifies fade/none; an older record normalises to fade, which is what the carousel already did). `AdminCategories` gained `displayName`, `heroImage` (both with previews) and `kind` (products|rituals), a **Lists** and a **Products** column, a full-screen-on-mobile dialog and `aria-label`s on its two icon-only actions; **its delete rule now counts `categoryIds[]` membership, not only `categoryId`** — and so does `api.deleteCategory`'s mock guard, which is the actual fix: "Serums" has **0** products by `categoryId` and **1** by `categoryIds`, so it was deletable out from under the Face Serum until now. `AdminFaqs` gained a **group** `Select` (options from `siteContent.faqPage.groups` + General, built from the record so a renamed heading needs no deploy; a row filed under a deleted heading keeps its value as an option and is chipped "no such heading"), a group chip per row and a heading filter (which also gates reordering, like the search). Placement labels renamed per the prompt: `help` → **"FAQ page (/faq)"**, `home` → **"Home FAQ block"**. `AdminDashboard` gained the four counts (**Hero products 8 · Rituals 3 · Announcements live 1 · Price on launch 5**, each tile linking to the screen that owns it) and the **Edit Home Hero** / **Manage Content** quick actions. `AdminSettings`' single hero pointer card became a three-card **Storefront** tab (Home & Hero / Announcements / Content) with live summaries. `AdminLayout` nav: Catalogue → Products, Categories, **Concerns**, **Rituals**, Reviews; Storefront → Home & Hero, **Announcements**, **Content**, FAQs. `App.js` mounts the four new routes (relative children of `/admin`). `api.js`: `getDashboardStats` (mock) extended with the four counts — `liveAnnouncements` applies the BAR's whole gate (active + in window + printable), so the figure agrees with what a shopper reads rather than with what is merely switched on; the live branch reads them off the documented response and the dashboard reads every key with `?? 0`, so a backend that has not added them yet leaves four zeroes rather than `undefined`. `useSiteContent` gained refetch-on-focus + a `site-content:updated` event (the same contract `FaqContext`/`StoreSettingsContext` already had); a failed REFETCH keeps the words already on the page. **Browser QA (Chromium 1194, mock mode, json-server):** 39 assertions, all passing — dashboard counts match `db.json`; hero reorder and inline copy persist and **the edited headline appears on `/`**; announcement CRUD + reorder persist and the new line reaches the bar while `{{FREE_SHIPPING_THRESHOLD}}` and `{{LAUNCH_OFFER_TEXT}}` stay hidden (`document.body.innerText` on `/` carries **no** `{{…}}`); ritual tagline + step reorder persist and **`/rituals/morning-glow` shows them**; the About lede edit **appears on `/about`**; the dividend warning fires on the bad edit, the save asks first, cancelling leaves the record untouched and Revert clears it; concern delete blocked ("2 products still name cleansing"); category delete blocked via `categoryIds` ("1 product is filed under Serums"). **Zero console errors** on all nine screens; **no horizontal scroll at 360/390/414/768/1024/1280/1440**; every editor dialog fills a 360px viewport. `db.json` restored after QA (`git checkout`) — this prompt changes no seed data. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (27 suites / 321 passed, 1 suite / 50 skipped = the live-API test). |
| 35 | Brand cleanup I — code identifiers | complete | 2026-09-08 | (this commit) | **Every Meghali-era identifier is out of the code, and the temporary scaffolding with it.** **Tokens:** `--sf-color-emerald/-hover/-contrast` → **`--sf-color-cta/-hover/-contrast`** (13 call sites across 5 files, mechanical `sed`); `--sf-gradient-heritage`, `--sf-gradient-announce-1/2/3`, `--sf-cat-pink/purple/orange/blue/teal/red`, `--sf-color-brand-green-deep` and `--brand-logo-bg` **deleted outright** — every one had **zero `var()` consumers** at the time of the sweep (Prompts 03–34 had already moved the consumers onto `--sf-gradient-brand` / `--sf-gradient-announce` / `--sf-concern-*`), so nothing needed re-pointing. `storefront-tokens.css` is 300 lines and declares no alias; its "NOTE ON LEGACY TOKEN NAMES" block is replaced by "TOKEN NAMES ARE ROLES, NOT COLOURS". **Classes:** `.sf-btn--emerald` + `.sf-btn--gold` collapse into the single **`.sf-btn--primary`** (no alias kept — `Button.js`'s `VARIANT_CLASS.primary` points at it); `.sf-ribbon-premium` **deleted** (18 lines, unrendered since Prompt 15) and the `.sf-flag` comment that counted it corrected from "the third kind of mark" to "the second". **Identifiers/comments:** 23 brand-term hits cleared across 15 files — `LegacyRedirects.js`, `TrustStrip.test.js`, `RecentlyViewed.js`, `categories.js`, `documentTitle.js`, `constants.js`, `search.test.js`, `policyClauses.js`, `routes.test.js`, `helpers.js`, `Contact.js`, `Home.js`, `Home.module.css`, `ProductDetails.js`, `colors.js`. Two test fixtures that used old-catalogue copy as arbitrary strings were re-fixtured (`rank("mekhela chador")` → `rank("cordless drill")`; `clauseTitle("100 years of the weave")` → `"100 percent cold-pressed"`), and `TrustStrip`'s "carries no Meghali-era wording" test became a stronger positive assertion — every promise label must be a string the owner wrote in `brand.js`. **Dangling doc references deleted** (5, all pointing at files that do not exist): `STOREFRONT_UX_GUIDELINES.md` ×3 (`SocialProof.js`, `storefront/index.js`, `theme/tokens.js`), `prompt_testing/09_authentication_and_session.md` (`authStorage.js`), `backend-developer-guideline/postman-api-collection.json` (`api.live.test.js`) — `grep -rn "STOREFRONT_UX_GUIDELINES\|prompt_testing\|backend-developer-guideline" src` → **0**. **Deleted:** `src/pages/_Playground/` (2 files, 592+ lines) + its `/_playground` route + its `React.lazy` import + the `robots.txt` Disallow; `src/hooks/useSound.js` + `src/assets/click-sound-1.wav` + the now-empty `src/assets/`; `src/components/BottomDrawer/` (2 files — zero consumers; `ui/Drawer` with `side="bottom"` supersedes it and adds the focus trap, scroll lock and Escape it never had). **Nothing else was dead:** no `window.__cart` / `window.apiService` debug exposure exists (`grep` → 0); **no dead CSS rules** — the 21 module classes a naive scan flagged are all live, either `:global()` primitives (`.sf-glow`, `.sf-numeral`, `.sf-glass`, `.sf-btn`, `.sf-container`) or reached by dynamic `styles[...]` indexing (size/variant/orientation/align/side/strength/feedback keys in 15 components); **no orphan modules** — every `.module.css` is imported and every `.js` is reachable once `React.lazy(() => import(…))` is counted. **Storage keys:** the full inventory is now documented in REPO_MAP §8. `theme` is **write-only** — `ThemeContext` calls `localStorage.removeItem("theme")` once on mount as a migration and nothing reads or writes it; the seven user-data keys (`user`, `token`, `admin`, `adminToken`, `cart`, `wishlist`, `recentlyViewed`) and the two session keys (`lk-recent-searches`, `lk-announcement-dismissed`) were **not renamed**. **Verification:** `grep -rhoE "var\(--sf-[a-z0-9-]+" src | sort -u` contains no `emerald|heritage|brand-green|announce-[123]|cat-` name and **every remaining name resolves** (global, component-scoped, or set from JS and always read with a fallback — the seven JS-set ones are listed in REPO_MAP §2); `grep -rn -i -E "meghali|mekhela|chador|saree|\bsari\b|handloom|muga|sualkuchi|galleria|ivory|evening gallery|silk" src --include=*.js --include=*.css` → **0** (was 23). BRAND_FOOTPRINT §3 re-run **repo-wide and over `build/`: both return zero**, so no group carries an outstanding hit — Prompt 36 confirms rather than clears. `CI=true npm run build` exit 0 **with no warnings**; `npm test -- --watchAll=false` exit 0 (**27 suites / 321 passed**, 1 suite / 50 skipped = the live-API test). **Browser smoke (Chromium 1194, mock mode, json-server), 6 routes × 2 viewports (390 / 1280) = 12 runs:** home, shop, PDP, cart, checkout, admin login — **zero console errors**, **no horizontal scroll**, no brand term in `document.body.innerText`, no `{{…}}`; `.sf-btn--primary` computes to `rgb(245,215,110)` on `rgb(11,11,13)` on every route (identical to what `--sf-color-emerald` produced), and `getComputedStyle(:root)` returns **empty** for `--sf-color-emerald` and `--sf-gradient-heritage`. The shop's six concern chips still render in their six accents, confirming `--sf-concern-*` survived the `--sf-cat-*` deletion. `db.json` untouched (`git diff --stat -- db.json` empty). |
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

- `09 · 2026-09-06 · The mega panel is rendered INSIDE the Shop <li>, not as a sibling of the nav list · The prompt asks for two keyboard behaviours — Tab order categories → concerns → featured, and Shift+Tab from the first link returning to the Shop button. Both are free when the panel follows its trigger in the DOM, and both need JS to fake when it does not (the panel would otherwise sit after the four nav links and the four actions). It still spans the full width because its containing block is the sticky `<header>`: nothing between the two claims `position`, which is why `.navItem` deliberately does NOT set `position: relative`. Verified in Chromium: Enter on Shop then six Tabs walks the seven category rows; six Shift+Tabs return to "Shop".`
- `09 · 2026-09-06 · Hover intent is 200ms, opened on the Shop <li> and dismissed on the <header>'s mouseleave · 200ms is long enough that a pointer crossing the row on its way to the cart never opens the panel and short enough to read as a hover rather than a wait (measured: closed at 120ms, open at 520ms). The CLOSE has to be bound to the header rather than the item because the sheet hangs below the row — the gap between the button's bottom edge and the panel's top belongs to neither, so a `mouseleave` on the item would fire mid-journey. The panel is a descendant of the header, so travelling into it is not leaving. Hovering a sibling entry ("Rituals") also dismisses it. Every hover path is gated on `matchMedia("(pointer: fine)")`; touch gets click only.`
- `09 · 2026-09-06 · The mark replaces the wordmark at ≤340px, and the breakpoint is enforced twice · PACKAGING_NOTES §1 puts the tagline's legibility floor at ~150px of lockup and says to switch to the icon below ~120px; the masthead's 140px mobile wordmark clears that until the row itself runs out of width, which is at 340px (44px hamburger + 140px wordmark + two 44px actions + gutters = 316px, and 320px is the narrowest screen in the QA set). `useMediaQuery("(max-width:340px)")` picks the `variant`, and a `@media (max-width: 340px)` rule sizes the slot — the JS gate is a matchMedia listener and the CSS one is not, so a viewport that narrows before React re-renders cannot paint a 140px wordmark into a 320px row. Verified at 320px: 40px mark, 0px overflow.`
- `09 · 2026-09-06 · A category with no product in the hero-ordered catalogue shows the BARE plate, with no fallback image · `Rituals` (`kind: "rituals"`) is a route, not a product home: no product lists it in `categoryIds`, so `stageSrc()` has nothing to render. The obvious fallback — the category's own `image` field — is a picsum placeholder for all seven rows (PLACEHOLDER_ASSETS.md), and a random stock photograph in the masthead is worse than a quiet `--sf-color-surface` square. The plate is the empty state. It fills itself the moment a product joins the category or the owner uploads real category art.`
- `09 · 2026-09-06 · The category count chip counts HERO-ORDERED products, which is every product in the catalogue today · The prompt's data budget for this panel is five reads and `products.getHeroProducts` is the only product one; adding `products.getAll` for a count would double the panel's payload for a number. All eight seeded products carry a `heroOrder`, so the counts (6·2·3·1·2·2) are exact. If a future product ships without one the chip undercounts by one rather than lying about a category — and the chip is `aria-hidden`, so no screen reader is told a total it could hold against the listing.`
- `09 · 2026-09-06 · The panel wears `.sf-glass--strong` but lays its own 97% near-black wash under the content, and carries NO `backdrop-filter` · 8% white is a surface when something dims the page beneath it; a modal has its scrim and this sheet has nothing — it opens straight over the hero, and the hero's 56px headline read straight through it. `.sf-glass` was tried and is INERT here: the panel is a descendant of the blurred header, so its backdrop root is the header's already-filtered result rather than the page, and the sheet stayed exactly as sharp with the declaration as without it (verified by screenshot, both ways). A blur that cannot blur is a promise in the stylesheet and a cost on the compositor, so it is not shipped. What a SHARP ghost behind menu text needs is opacity: `color-mix(in srgb, var(--sf-color-bg) 97%, transparent)` on a `z-index: -1` pseudo-element, between the glass ground and every child. One blurred layer, in the header, is also the budget (DESIGN_SYSTEM §4).`
- `09 · 2026-09-06 · The announcement band does NOT wear `.sf-glass`; it restates the recipe at 4% white with the blur left off · The prompt asks for "`.sf-glass` at 4% white, no blur". Applying the class and then un-declaring its background, blur, border and shadow would leave four overrides whose winner depends on CSS-module bundle order (the same trap `Logo.module.css` documents with `:where()`). Four honest declarations in the module are deterministic and shorter. The ground is `color-mix(in srgb, var(--sf-color-text) 4%, transparent)` — the brand's warm white rather than a pure one — over a `--sf-glass-border` hairline. This also closes the Prompt 03 TODO: the bar is no longer a full-bleed champagne-gold strip and the §2 balance budget is back within its 10% gold.`
- `09 · 2026-09-06 · The rotating message ITSELF carries `row.link`; the gold dot is a leading decorative marker, not a separator between two affordances · `announcements[]` has a `link` but no label for it, so a "Shop now" beside the message would be copy nobody wrote (BRAND.md §3.9). Making the sentence the link keeps one affordance and the store's own words. The dot is `aria-hidden` punctuation that holds the line's left edge steady across the crossfade.`
- `09 · 2026-09-06 · The featured card's product name is a `<p>`, not a heading · The panel is a MENU that exists on every page; an `<h3>` there put "Black Rice Face Wash" at the top of the storefront's whole heading outline, ahead of each page's own `<h1>` (observed: the first heading in the document was the card, not the hero). The region's `aria-label="Shop menu"` is what makes it findable. Verified after the change: the home page's heading list starts `H1 Begin again, every morning.`
- `09 · 2026-09-06 · The header's own four overlays get the same blur withdrawal as `body[data-drawer-open]` · Only `ui/Drawer` sets that flag, and the CartDrawer, SidebarMenu, AuthModal and SearchModal this header mounts keep their own traps until Prompts 10-12 migrate them. The header therefore ORs its own `isCartOpen || sidebarOpen || searchModalOpen || authModalOpen` into a `.noBlur` class beside the `:global(body[data-drawer-open])` rule, rather than writing to the shared attribute and fighting `ui/Drawer`'s reference count. Verified: opening the cart drawer takes the header's `backdrop-filter` from `blur(20px)` to `none` with `body.dataset.drawerOpen` still unset.`
- `09 · 2026-09-06 · `sheet()` supplies the panel's shape and reduced-motion behaviour; its durations are re-tiered to 320ms in / 160ms out · The factory animates on `DURATION.slow` (600ms), and the prompt's design spec asks for 320ms. Rather than hand-write a second set of variants, the component spreads `sheet(reduce)` and replaces the two transitions with `t(reduce, DURATION.base)` and `t(reduce, DURATION.fast)` — slower in than out, which is the house rule that makes a sheet feel placed. Under `prefers-reduced-motion` the factory already returns zero travel and zero duration; verified in Chromium with `reducedMotion: "reduce"`, the panel's first frame is `opacity: 1, transform: none`.`
- `09 · 2026-09-06 · The icon actions keep `ui/Button variant="icon"`'s glass circle instead of being flattened to bare marks · A first pass overrode the fill to `transparent`, which put `Header.module.css` and `Button.module.css` at identical specificity and let CSS bundle order decide the masthead's look. The design system already defines the variant as a 44px glass circle (§7), the discs carry no backdrop filter of their own (`--sf-glass-bg` is a plain rgba), and over the transparent-on-hero state they are what keeps the marks legible against a photograph. Taken as it comes; `.action` adds only the positioning context the count badge hangs off.`

- `10 · 2026-09-06 · The Shop group is ONE `Accordion` item, and it opens by default only on `/shop` and `/category/*` · `Accordion` is single-open by default, so a group that can only ever have one panel open is exactly one item — seven items would have promised six more panels that do not exist. The default-open rule is "open where the visitor already is": arriving at the menu from the shop or a category page, the seven category rows are what they came back for; on the home page, a policy page or an order page the menu opens as one short list of nine rows that fits a 360px screen without scrolling. `/product/*` deliberately does NOT open it — a shopper on a product page is more likely to be leaving the catalogue than moving sideways inside it, and the accordion is one tap away either way. The drawer unmounts on close (`AnimatePresence`), so `defaultOpen` is re-evaluated on every open rather than remembering the last one. Verified in Chromium: `aria-expanded` is `false` on `/`, `true` on `/shop` and on `/category/face-care`.`
- `10 · 2026-09-06 · BottomNav tab activation: Home is exact, Shop covers the whole catalogue, Account is `/profile` alone, Search is lit by its own modal · `NavLink` can only match a tab against its OWN path, so "Shop" is resolved in JS: `/shop` OR `/category/*` OR `/product/*` OR `/rituals` OR `/rituals/*`. A visitor who taps Shop, opens a category and then a product must never watch the bar go dark under them — the tab says which SECTION you are in, not which URL. Home takes `end` so it is not lit by every path. Account is `/profile` only: Orders and Wishlist have their own homes (Wishlist has its own tab), and lighting Account for them would light two tabs at once. Search is a `<button>`, not a route, and marks itself active while its dialog is open so the bar always says where you are. `aria-current="page"` still comes from NavLink and appears on `/shop` and `/wishlist` etc., but NOT on `/category/*` or `/product/*` — the tab is visibly active there without claiming to BE that page, which is the honest reading of `aria-current`.`
- `10 · 2026-09-06 · `ui/Drawer.module.css` gains five `--sf-drawer-*` custom properties rather than SidebarMenu reaching into the primitive's class names · The design spec asks for a 64px masthead, an 8px/20px body and `calc(16px + env(safe-area-inset-bottom))` under the CTA; the primitive ships 20px of air all round and `max(16px, env(...))`, which is right for the cart tray and wrong for a list of rows. The alternatives were both worse: forking the primitive duplicates the trap and the lock this prompt exists to delete, and matching its scoped classes by position (`.panel > :nth-child(2)`) breaks the first time a drawer renders a grab handle. Every hook DEFAULTS TO THE VALUE IT REPLACED, so `Drawer.js` is untouched and CartDrawer, and every drawer after it, are byte-identical in behaviour and in pixels. `max` → `calc` for the footer is the substantive change: the bar sits ON the home indicator rather than instead of it.`
- `10 · 2026-09-06 · The dialog is named "Menu" by a visually-hidden span inside the `title` slot, not by `aria-label` · The prompt asks for both `title={<Logo/>}` and `aria-label="Menu"`, and they conflict: `Drawer` sets `aria-labelledby` from the title's id, which WINS over any `aria-label` spread in beside it. Passing `aria-labelledby={undefined}` to unset it would have been a trick that reads as a bug. Instead the `<h2>` carries `<span class="sf-visually-hidden">Menu</span>` plus a DECORATIVE `<Logo alt="">`, and `labelledBy` points at the span: the accessible name is exactly "Menu", the drawer's heading in the document outline is "Menu", and the wordmark is what you see. Verified: `document.getElementById(dialog.ariaLabelledBy).textContent === "Menu"`.`
- `10 · 2026-09-06 · The four body sections are labelled `Catalogue`, `Brand`, `Account`, `Contact` — not `Shop` · The masthead's desktop nav is already `aria-label="Shop"` and BottomNav is `aria-label="Primary"`; two navigation landmarks with the same name are indistinguishable in a screen reader's landmark list, which is the `landmark-unique` finding Prompt 09 logged against the header/footer pair. "Shop" survives as the accordion's visible header row, which is what the copy spec pins. axe-core reports 0 violations on the whole document with the drawer open.`
- `10 · 2026-09-06 · `BottomNav` wears `.sf-glass--scrim` on top of `.sf-glass--strong` · DESIGN_SYSTEM §4's own rule: "text on glass over imagery gets `.sf-glass--scrim`". Unlike the drawer, this bar has NO `--sf-color-overlay` behind it — the live page scrolls directly under 8% white and a 12px blur, and the home page's gold "WHERE TO BEGIN" heading read straight through the 11px labels (screenshot before/after in the QA run). The scrim is the primitive's inert `::before` at 35% of `--sf-color-bg`, so the tabs stay clickable (`pointer-events: none`, verified by clicking Shop through it) and the bar still reads as glass.`
- `10 · 2026-09-06 · The legal note is clamped with `-webkit-line-clamp: 3`, which is the prompt's own CSS value; its prose says "two lines max" · The two do not agree, and the concrete declaration wins because it is the one that can be checked. Three lines is also the right number for this sentence: `brand.legalNote` is 253 characters and renders in five lines at 360px, so a two-line clamp would cut it mid-clause after "…a Farmer Producer Company. Profits" while three carries the ownership statement whole and truncates only the dividend qualifier — which the footer (Prompt 13) states in full. `line-clamp` is declared beside the prefixed property.`
- `10 · 2026-09-06 · The catalogue is fetched on the FIRST OPEN and refetched on window focus, not fetched on mount · `SidebarMenu` is mounted on every storefront route and most visits never open it, so two requests on mount would be two requests wasted on every page load. The old file fetched lazily too (on expanding "Collections"), but the accordion now opens by default on `/shop` and `/category/*`, so the trigger moved up to the drawer's own open. The focus refetch is the freshness rule `StoreSettingsContext` already applies: a category renamed or retired in the admin in another tab is right the next time the menu is opened. A failed load leaves the accordion empty and every other section untouched — the drawer is still the way to the shop.`
- `10 · 2026-09-06 · `AddToCartBar.module.css`'s `@media (max-width: 768px) { z-index: 1300 }` was deleted · Task 6 asks this prompt to "reserve the z-index order now: bottom nav `--sf-z-sticky`, sticky bar `--sf-z-stickybar`". The tokens already said 40 < 60, but the PDP bar overrode itself to 1300 on phones — above `--sf-z-overlay` (1000) and `--sf-z-modal` (1100) — so on a product page the new navigation drawer and the cart drawer both opened UNDERNEATH a floating "Buy now" (reproduced: `elementFromPoint` at the foot of the screen with the drawer open returned `AddToCartBar_buyNow`). The comment justifying it cited "the global BottomNav (z 1200)", which no BottomNav in this repository has ever been. Removing the override leaves the base `var(--sf-z-stickybar)`, which still puts the bar above the tab bar — its actual purpose, verified by hit test — and under every dialog. Add to cart from the bar still works (cart line created). Prompt 25 rebuilds the bar and inherits a correct order.`
- `10 · 2026-09-06 · `TrustStrip` is removed from the drawer and now has no consumer at all · The prompt forbids it here and Prompt 15 gives it a home page section, so the component and its stylesheet are left in place, unimported, rather than deleted and re-created three prompts later. Only the import was removed, so `CI=true npm run build` stays warning-free.`
- `11 · 2026-09-06 · Focus STAYS IN THE FIELD while ↑/↓ move the highlight; a focused ROW moves focus with the arrows instead · The prompt's own wording settles it — "on Enter in the field with no active row" only makes sense if a row can be active while the field holds focus. So ↑/↓ from the field move `data-active` only (the next keystroke still types, which is the point of an instant overlay), and ↑/↓ from a row that has been Tabbed to move focus row to row, with ↑ off the top returning to the field. Both paths were walked in Chromium.`
- `11 · 2026-09-06 · No `aria-activedescendant` and no `role="listbox"` — the list is `<ul role="list">` of links, as the prompt specifies · The combobox pattern would be the textbook answer for a highlight the field controls, but `role="option"` may not contain interactive descendants and every row here carries a quick-add button as well as a link. Declaring it anyway would be ARIA that lies about the markup. What assistive tech gets instead is real: the `role="status"` count line, real links, and roving `tabIndex` that puts the highlighted row one Tab away.`
- `11 · 2026-09-06 · Roving `tabIndex` covers the row's LINK and its add button together; with nothing highlighted the FIRST row is the tab stop · Eight rows × two controls would be sixteen tab stops between the field and "See all N results". Measured walk with a query typed: field → clear → close → the one row link → its add button → See all → back to the field.`
- `11 · 2026-09-06 · The reference-counted `body[data-drawer-open]` flag moved out of `ui/Drawer` into `hooks/useOverlayFlag.js` · The prompt asks `Modal` to set the same attribute. Two module-level counters would each delete it on their own way out, so a modal closing over an open drawer would un-blur the header while the drawer was still up. One counter, two callers. The attribute NAME is unchanged — `Header.module.css` and `BottomNav` select on it by name.`
- `11 · 2026-09-06 · `size="full"` hands `Modal`'s body padding and scrolling to its child · A full-screen overlay wants a fixed head and one scrolling region under it, not one scrollport around everything — the field has to stay reachable while the results scroll, and a virtual keyboard must not be able to push it off the top. `.full .body` is therefore a bare flex column. Shown as-is in `/_playground` (the section lede says so) rather than hidden behind a padded demo wrapper.`
- `11 · 2026-09-06 · `PriceBlock`/`Price` gain a `live` prop (default `true`) and the overlay's rows pass `live={false}` · The "Price on launch" chip is `role="status"` so the PDP's variant switch announces the change. In a LIST the chip is created and destroyed with its row and never changes in place, so eight of them arriving at once are eight announcements over the result count — the one thing the visitor needed to hear. Default unchanged, so no existing surface moves.`
- `11 · 2026-09-06 · The catalogue cache is marked STALE on tab focus and refetched on the next OPEN, rather than refetched on focus · The prompt calls this "existing behaviour"; it was not (Prompt 10's drawer does it, `SearchModal` did not). Implemented as staleness because a background tab regaining focus is not evidence that anyone is about to search — the next open pays for the refresh. A failed refresh keeps the last good cache rather than emptying the overlay.`
- `11 · 2026-09-06 · `rankProducts` takes an optional `concerns` list as well as `categories` · Task 2 requires `concerns.getAll()` to be fetched and the reference files do not say what for. Concern SLUGS already normalize to their display names for the seeded set ("even-tone" → "even tone"), so the lookup buys one real thing: a concern the owner RENAMES in the admin stays findable by its new wording without reseeding a single product.`
- `11 · 2026-09-06 · Result rows are `min-height` floors, not fixed heights — measured 71px at ≤768px and 79px above it against the spec's 64/72 · The row carries a name, a one-line promise and a price, and that stack measures 63px on its own; hitting 64px exactly would mean dropping one of the three pieces Task 4 asks for. The floors are set at the spec's numbers and the padding tightens on a phone, so a row is never SMALLER than specified.`
- `11 · 2026-09-06 · "See all N results" renders whenever there are results, not only past the eight-row cap · With eight products in the range the cap can never be exceeded, so gating on it would leave `/search` unreachable by pointer from the overlay and the whole link untested. Enter in the field goes there too; the link is the mouse's equivalent.`
- `11 · 2026-09-06 · `role="list"` is restated on every `<ul>` with an `eslint-disable-next-line jsx-a11y/no-redundant-roles` · Safari drops the list semantics of a `<ul>` whose `list-style` is `none`, which is every list in this design system. The rule does not know about that bug, and `CI=true npm run build` treats its warning as an error.`
- `11 · 2026-09-06 · The overlay calls `onClose()` itself on every navigation instead of relying on `Modal`'s close-on-route-change · `Modal` compares PATHNAMES, so submitting from `/search?q=a` to `/search?q=b` is not a navigation as far as the dialog is concerned and the overlay would sit over the results it had just produced. Verified: opened on `/search?q=face`, submitted "serum", overlay closed and the `<h1>` became "Results for “serum”".`
- `12 · 2026-09-07 · Cross-sell selection is one pure exported function, `crossSellFor(products, cartItems, limit)`, and the EMPTY-cart "Start with" rows are the same call with no lines · The prompt describes two lists ("Complete your ritual" for a cart, "Start with" for an empty one) whose only stated difference is the eyebrow. Written as one function, the empty cart falls through preferences 1 and 2 (which need cart lines) straight into hero order, which is exactly what "fed by hero order" asks for — and one function is one thing to test.`
- `12 · 2026-09-07 · Preference 2 ("the next `ritualStep.order` in the same category") is matched on `categoryId`, not on `categoryIds[]` · `ritualStep.order` is a position within ONE ritual, and `categoryId` is the primary category that names it (INDEX §3). Widening to `categoryIds[]` would make a face wash (cats 1 and 3) suggest the next step of the body ritual, which is not a next step at all.`
- `12 · 2026-09-07 · The tray shows NO "Total" row — subtotal, the discount, any real compare-at saving, then "Shipping and taxes calculated at checkout" · The prompt's Task 7 lists exactly these, and the reason is the guardrail above it: the delivery charge is unknown until checkout has an address, so a "Total" here would silently omit it and be beaten two screens later. The compare-at "You save" row is KEPT (it was existing behaviour and is computed only from real `comparePrice` values); the old flat-rate "Shipping" row and grand total are gone with the constant that fabricated them.`
- `12 · 2026-09-07 · The pinned foot is NOT rendered for an empty cart · Task 9 does not condition it, but a Checkout button over an empty cart is a dead end, and Task 10's empty state already carries the one CTA that makes sense ("Shop the Black Rice Range"). `Drawer` renders no footer at all for a falsy `footer` prop, so this costs nothing. Verified: removing the last line drops the foot with it.`
- `12 · 2026-09-07 · `addMany` opens the drawer only when it actually added something, and reports `{ added, skipped }` · "Opens the drawer once" is unambiguous for a list that added lines; a tray sliding in over an unchanged cart is a lie about what just happened. A list of nothing-but-unpriced products gets the "Coming soon" toast and no drawer. The return value is what lets a ritual page tell the difference without re-deriving it.`
- `12 · 2026-09-07 · The "Have a code?" disclosure is hand-rolled (`button[aria-expanded][aria-controls]` + a `hidden` panel), not `ui/Accordion` · The prompt says "`Accordion`-like". `Accordion` is an items array of heading + region with its own chevron and single-open logic, and the applied state here REPLACES the row with a chip rather than filling a panel — so the primitive would have been configured away to nothing. The ARIA contract (expanded/controls, panel out of the tab order when closed) is the same.`
- `12 · 2026-09-07 · A message the shopper has not read keeps its own panel open (`couponOpen || couponError || couponNote`) · A code auto-dropped for falling under its minimum explains itself in that panel. Collapsing it would hide the explanation behind the very control the shopper just used.`
- `12 · 2026-09-07 · `ui/Drawer.module.css` gains TWO more composition hooks — `--sf-drawer-footer-pad-t` and `--sf-drawer-footer-gap`, both defaulting to the values they replaced · The spec reserves 128px for the foot. Two 44px pill buttons plus a micro-line come to 128 only on 8/4/8 padding-and-gap, and the primitive hard-coded `--sf-space-4` and `--sf-space-3`. Adding hooks is the pattern Prompt 10 established for exactly this; the alternative was matching the footer by position, which that prompt's own comment forbids. Nothing bought the height by shrinking a touch target. No existing drawer moves.`
- `12 · 2026-09-07 · The cart line's remove mark is absolutely positioned rather than sitting beside the name · In the flow it made the row 140px: a 36px circle stacked over a 42px stepper is 78px of column before the name is measured. Out of the flow the 72px plate sets the height again and the row measures exactly 96px. `.lineName` keeps a `--sf-space-8` right padding so a long name wraps clear of the mark instead of under it.`
- `12 · 2026-09-07 · The unit price moved from its own line into a right-hand column beside the stepper · Same reason: "₹390.00 each" on its own line cost 19px the 96px row does not have, and two short lines beside a 42px control cost nothing.`
- `12 · 2026-09-07 · `QuantityStepper`'s "glass pill" is `--sf-glass-bg` over `--sf-glass-border` with NO `backdrop-filter` · DESIGN_SYSTEM §4 allows two blurred layers in view, not two plus one per cart line. The stepper always sits inside something already blurred (the tray, the purchase panel); the tint and the hairline are what read as glass. `md` stays at 44px for the PDP, `sm` is the prompt's 36px and is promoted back to 44px under `@media (pointer: coarse)` — the same rule `.sf-btn--sm` and `.iconSm` already follow.`
- `12 · 2026-09-07 · The meter's figure prints with `decimals: 0`, the money rows with the store default (2) · The meter states a DISTANCE ("₹609 away"), which is the same reading `resolveTrustBadgeDetail` gives the trust badge; the money rows are charges and match Checkout, as they did before.`
- `12 · 2026-09-07 · `addMany` was verified by unit tests rather than by a temporary `window.__cart` · The acceptance criterion suggests exposing the context on `window` and then removing it. Seven tests in `src/context/CartContext.test.js` prove the same behaviours (merge by line key, one toast, the skip rule, the stock clamp, `openDrawer: false`, the return value) and keep proving them, and nothing temporary has to be remembered out of the source.`
- `12 · 2026-09-07 · Cart lines still do not carry `slug`, so a line links to `/product/<productId>` and the route redirects to the slug · `buildCartItem` sets a slug and `normalizeCartItem` drops it — an inconsistency that predates this prompt. Adding the field is a `localStorage.cart` FORMAT change, which this prompt's Data section forbids ("no persistence change"). Verified: the tray's product link lands on `/product/black-rice-face-wash`.`
- `12 · 2026-09-07 · `SearchModal`'s add still passes `openDrawer: false` and was left alone · The acceptance criterion reads "add from a card/search → drawer opens", but Prompt 11 chose this deliberately so a tray cannot slide in under an open full-screen modal. Changing it would remove existing, reasoned behaviour. The card and PDP paths do open the tray, and that is what was measured.`
- `13 · 2026-09-07 · The prompt's px figures were mapped to the nearest TYPE TOKEN rather than written as literals — legal note 13px → `--sf-text-sm` (14px), footer links 15px → `--sf-text-sm`, tagline 28/24px → `--sf-text-xl` · The tokens are the only styling source (00_INDEX §2), and storefront-tokens.css states the rule this prompt would otherwise break: "nothing below --sf-text-sm (14px) is ever allowed to carry a sentence". `--sf-text-xl` clamps 22px→28px and MEASURES 28px at 1280 (verified), so the tagline hits the spec exactly and degrades on a phone instead of shrinking a sentence below the floor.`
- `13 · 2026-09-07 · The prompt lists FIVE bullets under "four bands"; the farmer-owned note was folded into the DIRECTORY band's wide first track rather than given a band of its own · That is what makes the count work AND what the shared grid is for: the note lands directly under the wordmark and the four columns directly under the newsletter, so `1.6fr repeat(4, 1fr)` describes both bands instead of leaving an empty first track under the columns. Four hairline-separated bands, every listed element present.`
- `13 · 2026-09-07 · At ≤480 the four columns are ONE `<Accordion multiple>` inside one `<nav aria-label="Footer directory">`, not four single-item accordions in four navs · "Accordion primitive, multi-open" is one accordion by definition, and the primitive's ArrowUp/Down/Home/End roving only works between headers of the same instance — four instances would give four separate rings. Four collapsed navigation landmarks on a phone is landmark spam for no new destination. `headingLevel="h3"` keeps the h2 → h3 outline identical at every width.`
- `13 · 2026-09-07 · The social marks take the glass PALETTE (`--sf-glass-bg` over `--sf-glass-border`) with NO `backdrop-filter`, though the prompt says "44px glass circles" · The footer ground is OPAQUE `--sf-color-surface`, so a backdrop filter over it produces identical pixels at real GPU cost — and the sticky glass masthead is in view at the foot of the page, which already spends one of the two blurred layers DESIGN_SYSTEM §4 allows. Same reasoning, and the same resolution, as Prompt 12's QuantityStepper pill.`
- `13 · 2026-09-07 · The colophon's copyright name is DERIVED from `brand.legalName` (`replace(/\s*\([^)]*\)\s*$/, "")`), not retyped · brand.js is the single source (BRAND.md §3.9 rule 1) and the spec line wants the registered name without the "(BAOPCL)" the sentence after it introduces. The first render read "Co. Ltd.. All rights reserved." — the name already ends in a full stop — so `COPYRIGHT_NAME` adds one only when it is missing.`
- `13 · 2026-09-07 · "Policies last updated <date>" was dropped from the colophon · The prompt enumerates the colophon's contents and it is not among them, and all four policy pages already print `POLICY_LAST_UPDATED` at the top of the page a reader is actually consulting. The constant keeps its four consumers.`
- `13 · 2026-09-07 · The footer fetches `categories.getAll` + `rituals.getAll` itself, module-cached, rather than importing `loadMegaPanelData` · The mega panel's promise also pulls `concerns.getAll` and `products.getHeroProducts`; sharing it would cost every page two collections the close of the page never renders. Both columns keep a static entry ("All products", "Build your ritual") so an unreachable API is a SHORTER footer, not a broken one.`
- `13 · 2026-09-07 · The mobile disclosure triggers keep `ui/Accordion`'s own 16px/600 warm-white look instead of the desktop columns' gold 12px eyebrow · The eyebrow is a column HEADING; a disclosure is a 44px control, and it reads (and taps) like the mobile drawer's Shop group, which is the same primitive. Restyling it would mean reaching into another module's hashed class names.`

- `14 · 2026-09-07 · The interval clamp is 3000–15000ms with a 6500ms default, and the old 1000–60000ms pair stays for the deprecated per-slide `durationMs` · The prompt names the hero range; the wider pair was written for hand-authored banner slides. A slide now carries an eyebrow, a headline, a price, one or two lines and two CTAs — nobody reads that in a second, and a slide that sits for a minute is not a carousel. `HERO_INTERVAL_MIN_MS`/`HERO_INTERVAL_MAX_MS` are new constants rather than a rewrite of `HERO_MIN_DURATION_MS`/`HERO_MAX_DURATION_MS`, because the admin's per-slide field still guards against the old pair until Prompt 34 deletes it. AdminHeroSection's section-interval input was repointed at the new pair (3–15s, "Between 3 and 15 seconds") so the screen cannot save a value the storefront would silently clamp.`
- `14 · 2026-09-07 · `showPause: false` turns AUTOPLAY off; it does not merely hide the button · WCAG 2.2.2 and the prompt's own guardrail ("no autoplay without a visible pause control") make an unstoppable moving hero the one outcome the switch must not have. Reading it as a plain chrome toggle would have made that outcome one click away in the admin. So `autoplayOn = enabled && autoplay && showPause && n > 1 && !reducedMotion`, and the pause button renders exactly when `autoplayOn` — the control and the motion cannot be separated.`
- `14 · 2026-09-07 · The BRAND SLIDE is the render for BOTH "no products resolved" and `enabled: false` · The prompt's line reads "render only a visually hidden h1 with brand.name (existing behaviour) plus the brand slide": the brand slide's headline IS the wordmark image, so the page's single `h1` has to be the hidden one beside it. One `brandOnly` branch therefore serves both — a static wordmark, `brand.tagline` and "Shop the Black Rice Range" → `/shop`, with no carousel chrome, no autoplay and no photography. `#hero-sentinel` still renders, so a switched-off hero keeps the transparent masthead rather than jumping to glass. Verified both ways in Chromium: `heroConfig.enabled = false`, and json-server stopped.`
- `14 · 2026-09-07 · The copy block MEASURES ITSELF against every slide instead of reserving `3.2em / 2.4em` · The prompt's fixed min-heights were implemented first and measured at 0.178 CLS over an eight-slide walk at 390px: 3.2em is 2.86 lines of `--sf-leading-display`, so a three-line headline (four of the eight, at every breakpoint) pushed the CTAs 16px; the price swapping between an amount and the "Price on launch" chip moved them 5px more; and at 1024 the long "Explore the Exfoliating Face Scrub" wrapped the CTA row, moving the badges and rail 66px. A reservation in ems can only ever be right for the copy that happens to be seeded, and hero copy is edited on the PRODUCTS. So `.copySizer` renders every slide's whole copy block — eyebrow, headline, `Price`, subtext, both `Button`s and the badge chips — stacked in ONE grid cell, `visibility: hidden` + `aria-hidden`, with the live copy laid over it. The block is always the tallest slide's height at any width for any copy: the walk now measures **0.004 (390) / 0.003 (1280)**, all of it sub-0.001 horizontal drift as a CTA label changes width. The em min-heights survive as the pre-data FLOOR (headline exactly 3 lines, subtext 3 lines ≤768 / 2 above, price 36px), computed from the leading tokens rather than written flat, because a floor a hair under one full line is a layout shift with extra steps.`
- `14 · 2026-09-07 · `HeroIndex` renders an empty `.rail` div instead of `null` while there are no products, and `.rail` reserves its own height in CSS · An element that is not in the document cannot reserve anything, and the rail is 116px (one names row) or 168px (two, from 1025px) of the copy column. Returning `null` was worth 0.46 of load CLS at 390px on its own. The rail is the one part of the column the sizer cannot measure — it does not exist until the products do — but its height is pure geometry (`--sf-space-2` + `--sf-tap-target` + `--sf-space-4` + the rows), so it is written as that `calc()` and not as a magic number. `.names` was narrowed to `max-width: 32rem` at ≥1025px so the eight launch products fall into the TWO rows the prompt specifies (46ch gave three).`
- `14 · 2026-09-07 · One `GlowWrap tone="duo" intensity={0.24} breathe` wraps the whole media STACK, not each slide's `CloudinaryImage` · The prompt puts the image inside the glow. Eight layers each carrying their own lamp would be eight animated `blur(60px)` compositing layers painting one picture (only one layer is ever opaque), and gating `breathe` on the active layer instead would restart the 10s loop on every slide change. The layers are identically sized and identically placed, so a single lamp behind the stack is the same image at an eighth of the cost — and it is still "the only breathing glow above the fold" (DESIGN_SYSTEM §5). The pointer parallax rides on that same wrapper.`
- `14 · 2026-09-07 · Pointer parallax is ±8px, written to CSS custom properties on the section rather than to React state · DESIGN_SYSTEM §7 caps hero parallax at 8px; the card leans INTO the pointer (inverted offset), the way a lit object would. A `setState` per `pointermove` would re-render the whole carousel sixty times a second to move one card eight pixels. Gated on `(min-width: 1025px) and (pointer: fine)` AND `!prefersReducedMotion`, and the offset is zeroed the moment either stops being true, so a stale lean cannot survive a visitor turning reduced motion on.`
- `14 · 2026-09-07 · `#hero-sentinel` is the hero's opening 140px, not the whole section · Header.js watches it with `threshold: 0` and drops ALL glass while it intersects. Covering the whole hero would have kept a transparent masthead over hero copy scrolling beneath it — the header is `position: sticky` in normal flow, so once the page moves it is over content, not beside it. 140px keeps the opening frame clean and hands the header its glass as soon as anything passes under it. Verified: transparent at scroll 0, `sf-glass sf-glass--strong` at 400, transparent again on the way back.`
- `14 · 2026-09-07 · The CTAs sit OUTSIDE the `aria-live` region, which wraps only the eyebrow, headline, price and subtext · Both CTA labels change with the slide, and `Button variant="addToCart"` already carries its own `aria-live` on its label. Leaving them inside would have nested live regions and narrated "Explore the Face Serum… Coming soon" over the headline the visitor asked to hear. The region is `polite` only while the timer is stopped, so an announcement is always the answer to something the visitor just did.`
- `14 · 2026-09-07 · `-webkit-user-drag: none` on the stage image, found by testing the swipe with a mouse · A mouse drag across the card started the browser's native image drag, which fires `pointercancel` and leaves a ghost under the cursor — the swipe never completed. Touch was unaffected (verified through CDP `Input.dispatchTouchEvent`: 120px left advances, 120px right returns, a 25px drag is ignored and a vertical drag scrolls the page without changing the slide).`
- `14 · 2026-09-07 · `HERO_FALLBACK_IMAGE` could not be rewritten because Prompt 07 had already DELETED it · The prompt asks for its Meghali placeholder text to be replaced with a neutral picsum URL "right now". There is nothing left to rewrite (`grep -rn "HERO_FALLBACK_IMAGE" src` → 0), and the new hero's fallback carries no photography at all by design (Task 8: no imagery behind the hero). Re-adding the constant would have created an unused export for Prompt 34 to delete. `PLACEHOLDER_ASSETS.md`'s row for it is marked retired instead, so the inventory does not claim a placeholder the code no longer has.`
- `14 · 2026-09-07 · Three files outside the prompt's expected list were touched, each a one-line consequence · `db.json` and `AdminHeroSection.js` carry `showPause` and the new interval bounds (the guardrail: an api/db change is reflected in the admin). `CloudinaryImage.js:28` and `Home.module.css:65` cited `HeroSection.js` by name in their docblocks, which the acceptance grep counts. `src/components/home/HeroCarousel.test.js` is new — the repo's convention since Prompt 05 is that a component's pure decisions are pinned by tests rather than by clicking.`
- `14 · 2026-09-07 · The one-time load shift is ~2–4px everywhere except a 769–1279px band, where it is up to one headline line · The pre-data floor reserves three headline lines; between 769 and 1279 the copy column is narrow enough that the seeded headlines take FOUR (the column is capped by `--sf-container-max`, so ≥1280 is back to three). Closing it would need the floor to know the copy, which is exactly the data-dependence the sizer exists to avoid — and reserving four lines there would trade a growth for an equal shrink at ~900px, where three is right. Mobile (the Lighthouse target) and ≥1280 measure 0.040 and 0.029; the band is a one-time load shift only — the recurring, every-6.5-seconds shift is 0.004 at every width.`

- `15 · 2026-09-07 · The fourth trust-strip promise lives in `brand.js` as `originBadge`, not as a string literal in TrustStrip.js · The prompt calls it "a fourth fixed item" and hands over the wording ("Rooted in Assam & Northeast India"), but brand.js's own header is the rule this repository already follows — "every name, tagline, pillar, badge … comes from this object" — and the prompt's guardrail says badge copy never lives in a component. One line in the brand config keeps both true: the wording is the prompt's, its HOME is the config, and the owner can adjust it for compliance beside the three badges it sits next to. The condensation is from BRAND.md §3.1 ("Rooted in the indigenous knowledge and rich natural heritage of Assam and Northeast India"), which is why it is a fact and not an invention.`
- `15 · 2026-09-07 · The tone glow on BOTH new cards is revealed on hover/focus-within, never at rest · The prompt says "glow on hover only" for `CategoryCard` and "hover lift 4px + glow .2" for `ProductCard`; `GlassCard`'s `glow` prop renders a resting lamp. Seven violet lamps in a row, or eight pink ones down a search grid, read as wallpaper rather than as a response. So `--sf-glow-opacity: 0.2` sets the strength and the glow NODE's own opacity is animated 0 -> 1 by `:hover, :focus-within` — a real element, because a transition needs a property on a node, not a custom property on a pseudo-element. `:focus-within` is in the selector so a keyboard visitor gets the same answer a pointer does. The card's built-in gold `.sf-card--hover` lamp is left alone: it is the shared card vocabulary, and suppressing it would make these two cards the only ones on the storefront that do not answer a pointer the way every other card does.`
- `15 · 2026-09-07 · The add affordance's hover-reveal rule is `(hover: hover) and (pointer: fine)` for the reveal and `(any-pointer: coarse)` to opt back out · Carried over verbatim from the card this one replaces, because the reasoning still holds: a touchscreen laptop answers the first query (that describes its PRIMARY input) but a finger on that same screen would have to tap once to raise the hover state and again to add. Measured on an emulated touch phone: `grid-row: 3`, `opacity: 1`, `pointer-events: auto`, button 44px, heart 44px. On a fine pointer: opacity 0 at rest -> 1 on hover, and the button stays in the tab order while hidden (tab order measured: plate link -> heart -> name -> Add to Cart -> next card).`
- `15 · 2026-09-07 · `ProductCard` reads its product through `normalizeProduct()` rather than off the raw prop · Four of the five consumers hand it a catalogue row, but `Wishlist` hands it a FLAT SNAPSHOT — `image` and no `media[]`, no `badges`, no `concerns`, no `priceTBA`. Normalising in the card is what lets one component render both without asking which it was given: media derived from `images[]`, badges defaulted to `brand.trustBadges` (the normaliser's own rule, BRAND.md §3.9 rule 4), `priceTBA` computed from the price that is actually there. Memoised on the `product` identity, and pure — it returns a copy and never mutates.`
- `15 · 2026-09-07 · The section fetches FOUR collections, not the three the prompt lists: `rituals.getAll()` joins categories/concerns/products in the same `Promise.all` · The prompt asks the Rituals card to say "3 rituals", and no product carries `categoryId: 7` — a count derived from `categoryIds` membership is 0 there. Typing "3" would have been a fabricated number in a component; the fourth read makes it a counted one, and it also supplies the card's plate (the product named by the FIRST STEP of the first ritual, resolved against the catalogue). One extra round trip, in parallel, on a section that already makes three.`
- `15 · 2026-09-07 · A concern SLUG is turned into a label inside the card (`concernLabel`), not looked up in the `concerns` collection · The card is a leaf that must never fetch, and it is rendered eight at a time inside grids that have already made their own round trip. `"even-tone" -> "Even tone"` matches all ELEVEN seeded concern names exactly (the collection is sentence case), and a slug the owner adds later still reads correctly. Surfaces that hold the collection — the mega panel, `ShopByCategory`'s own chip row — keep using the record's `name`.`
- `15 · 2026-09-07 · TRENDING / HOT (`productFlagMarks`) stay on the card even though the prompt's card spec does not list them · They are a merchant switch in Admin -> Products -> Visibility & Flags, and the guardrail forbids removing a feature to make styling easier. They render NOTHING in the seed (no product is flagged), so the LAMIKAA card looks exactly as specified today and the switch still has a surface tomorrow. They sit at the end of the eyebrow row, after the step and the concerns.`
- `15 · 2026-09-07 · Home's closing "PROMISES" section was DELETED rather than left for Prompt 22 · The prompt says the remaining old sections stay until 22, and sections 1-6 do. Section 7 is different: it printed `brand.trustBadges` under `aria-label="Our promises"`, which is precisely what `TrustStrip` now does at the top of the same page from the same config. Keeping both would have printed the three promises twice on one page and given it two identically named regions. Its `PROMISE_DETAIL` map was also four blocks of dead Meghali copy ("Genuine handloom silk, woven by master artisans") keyed on badge strings that no longer exist, so it had already degraded to bare labels. Nothing was lost: the function moved, it did not go.`
- `15 · 2026-09-07 · `text-decoration: none` was added to `button.sf-chip, a.sf-chip` in the PRIMITIVES, closing the Prompt 09 TODO · A chip is a pill, never an underlined phrase, and `MegaPanel.module.css` had already had to work around it locally. The concern chips this prompt adds would have been the second workaround. One line in the file that owns the geometry; MegaPanel's local rule is now redundant but harmless and is left for Prompt 35's sweep.`
- `15 · 2026-09-07 · The card's trust chips drop to `letter-spacing: .06em` from the primitive's `.14em`, and both chip kinds lose a step of horizontal padding · Measured, not guessed: at 11px with the full tracking the three owner-mandated badges are ~155px each, so ALL THREE stacked in a 254px card and the badge block was taller than the promise above it. At .06em with `--sf-space-2` padding two of the three share a line (measured: 2 rows at 1280, 768 and 390). The hero's and the PDP's trust chips, which have the width for it, keep the full tracking.`
- `15 · 2026-09-07 · Four files outside the prompt's expected list were touched, each a one-line consequence · `src/config/brand.js` gains `originBadge` (above); `src/components/storefront/TrustBadges.js` gains the three icon paths the prompt asks for PLUS a `&& b.label` in its filter, so a catalogue entry whose label is read from a shortened `brand.trustBadges` is dropped rather than drawn blank; `src/theme/storefront-primitives.css` gains the chip underline reset (above); `src/pages/Home/Home.module.css` swaps the retired promises block for `.trustEdge`. Two test files were added (`TrustStrip.test.js`, `ProductCard.test.js`, 13 tests) following the Prompt 14 convention of unit-testing a component's pure exports.`

- `16 · 2026-09-07 · The pack is capped at `max-width: calc(0.8 * 62svh)` on desktop — `min-height: 80svh` alone does NOT make the sticky media work · Measured, not assumed: a full-width 4:5 plate in half of a 1280 container is 735px tall, the text panel is ~700px and 80svh at a 900px viewport is 720px — so the ROW is 735px, exactly the height of the plate, and a sticky element the height of its own containing block has nowhere to stick. The first browser run confirmed it (the plate scrolled straight past: tops 64 → -135 → -335). Capping the pack at 62% of the viewport height leaves at least 18svh of travel at every desktop size; after the cap the plate holds at exactly 112px through 1440, 1280 and 1024. The cap is written as the WIDTH that produces that height so the 4:5 box — and the space it reserves before the bytes land — is never broken, which is why CLS stayed at 0.`
- `16 · 2026-09-07 · The chapter section takes `overflow-x: clip` · GlowWrap's lamp bleeds 5% past its box by design (`size=110`) and on a phone the plate is already ~92vw, so the eight lamps widened the document by 69px at 768 and 22-26px at 360-414 (isolated by hiding `[data-chapter]` and re-measuring: 0). `body { overflow-x: hidden }` in App.css was already swallowing the scroll, but `scrollWidth > clientWidth` is a real defect and Prompt 37 would have found it. `clip`, not `hidden`, because `hidden` would make the section the sticky media's scroll container; this is the same guard, with the same reasoning, that `HeroCarousel.module.css` already carries.`
- `16 · 2026-09-07 · The chapter name is `--sf-text-2xl`, not the `--sf-text-3xl` the task text names · The prompt's own design spec gives the measured figures — "name 40px" at 1280/1440 and "name `--sf-text-2xl`" at 360-414 — and `--sf-text-2xl` is the token that clamps to EXACTLY those two values (40px at ≥1233px, its 28px floor at ≤414px). `--sf-text-3xl` renders 52px at both desktop widths, which contradicts the same spec's "40px" and, in a half-width panel, wraps "Black Rice Exfoliating Face Scrub" onto four lines. Verified in the browser: 40px at 1280, 28px at 360.`
- `16 · 2026-09-07 · The chapter carries `padding-block: calc(var(--sf-section-y) * 0.5)`, overriding `.sf-section` · The spec asks for "`--sf-section-y` per chapter". A full unit at each END would put TWO units between every pair of chapters; half at each end puts exactly one unit between them, which is the rhythm as written. `.sf-section` is a global class and this is a module class, so they tie on specificity and CSS Modules ship last — the override is deterministic, not a race. `ProductShowcase` gives its heading a quarter unit below for the same reason.`
- `16 · 2026-09-07 · The media is `CloudinaryImage src={media.url} crop ar="4:5" pad`, not `src={stageSrc(p, {w: 900, ar: "4:5"})}` · The two produce the identical URL at a given width, but `stageSrc` returns a string that ALREADY carries a transform chain, and `CloudinaryImage` runs `cld()` over whatever it is given — so passing the pre-built URL would have inserted `f_auto,q_auto,w_N` BEFORE the `c_crop`, resizing the image and then cropping the wrong pixels out of it, and would have suppressed the srcSet. Passing the raw url plus the crop is the idiom `HeroCarousel` already uses for the same plate.`
- `16 · 2026-09-07 · The description is printed WHOLE, not clamped to the "2-3 lines" the spec describes · The seeded `description` runs 4-5 lines at the specified 52ch measure. Clamping would silently hide packaging-derived copy, which is the failure mode Prompt 15 removed `truncateText(…, 48)` for. The 52ch measure is kept; the line count follows the copy.`
- `16 · 2026-09-07 · A body ritual step reads "Body 01 - Body cleanse", the qualifier derived from the label · The soap and the body wash are both step ONE of the body routine, so an unqualified "01 - Body cleanse" sits two chapters away from the face wash's "01 - Cleanse" and reads as a contradiction rather than as a second sequence. The prefix is triggered by the step's own label beginning "Body", so a routine the owner adds later needs no code change. Unit-tested (`stepEyebrow`).`
- `16 · 2026-09-07 · The numeral chip is `aria-hidden` and the chapter's position is announced once, in the eyebrow, as "Chapter 3 of 8" · Eight decorative "01" pills in a screen reader's output are eight repetitions of a number with no noun. The visible numeral stays visible; the count is said once, where the ritual step is already being read.`
- `16 · 2026-09-07 · "Explore more" carries an `aria-label` naming the product; "Add to Cart" deliberately does NOT · Eight identical "Explore more" links fail WCAG 2.4.4 in a link list. The add-to-cart button is the opposite case: `Button variant="addToCart"` makes its LABEL the live region ("Adding…" -> "Added"), so an `aria-label` would freeze the accessible name and silence the confirmation. `ProductCard` sets the same precedent, and the chapter's `<section>` supplies the context either way.`
- `16 · 2026-09-07 · The chapter panel is 40px of padding at ≥769px, overriding `GlassCard padding="lg"` (32px) · The spec asks for both `padding="lg"` and 40px, and `--sf-space-8` is 32. The component keeps `padding="lg"` (so ≤480px still steps down with the shared scale) and `.text .panel` raises the desktop value — a compound selector, so it outranks the shared `.padLg` rather than depending on which module ships last.`
- `16 · 2026-09-07 · Five crop rectangles were corrected in `db.json`; three were verified and left alone · The showcase is the first surface that renders all eight crops large, and the estimates from the Phase-A review did not survive it. Soap: the last 21 rows fell past the gold band into the carton's WHITE canvas (a white stripe across the foot of the plate) -> `h_1248`. Body wash: the panel is a rounded rectangle on white and the old rectangle enclosed all four corners -> inset to `x_716,y_43,w_391,h_688`, where the panel is already full width. Face mask: the file carries a white rule at rows 0-8 and 397-400 despite the "full-bleed black" note -> `x_478,y_12,w_356,h_382`, also re-centred on the panel's ink. Face scrub: rows 0 and 743 are a ONE-PIXEL light-grey rim, which `b_auto` sampled and used to letterboard the whole 4:5 frame in light grey -> `x_1767,y_2,w_1428,h_740`, which also sets the pack larger. Face serum: the gold ingredient band had 2px of margin and read as clipped at both edges -> `x_432,y_12,w_464,h_534`. Face wash, face mist and moisturizer gel were checked and are unchanged. Every rectangle now satisfies: no white on any edge or corner, no clipped text, and a border dark enough that `b_auto` pads with the label's own ground. Data only, no schema change, so both api modes and the admin product form read them unchanged — but **the live Laravel database must be reseeded from `PRODUCTS.md` §2**.`
- `16 · 2026-09-07 · Two blurred chapter panels can be in view at once on a desktop, which is the DESIGN_SYSTEM §4 budget · The prompt specifies a glass panel on desktop and a solid one on a phone, and that is what ships. On a desktop the chapters are ≥80svh apart so at most two panels overlap the viewport during a scroll; the masthead's own glass is the third layer only for the instant a chapter passes beneath it. On a phone — where the budget actually costs frames — the panel is opaque, so eight chapters is zero blurred layers.`

- `17 · `ValueChain`, `LegalNote` and the CTA sit BELOW the two-column body, not inside its right column · The prompt reads "right = the two short paragraphs …, then `ValueChain`, then `LegalNote`, then `Button`", which could be a sequence inside the right column. It cannot be: the right column of a `1fr 1.1fr` grid is ~640px at 1280, and seven steps whose labels alone measure ~560px cannot be a single row in it at ANY desktop width — and "horizontal ≥ 1025px (single row)" is the whole point of the drawing. The chain, the note and the CTA therefore run the full measure under the grid, which also produces exactly the mobile order the prompt specifies.`
- `17 · The steps carry `animate: { opacity: 0, y: RISE.reveal }` in ADDITION to `reveal(reduce, { index, inView: true })` · `App.js:157` wraps every route in `<AnimatePresence mode="wait" initial={false}>`, and `initial={false}` tells framer-motion to ignore the `initial` prop of everything present at the route's first paint — it mounts those elements at their `animate` state instead. `reveal(…, { inView: true })` returns `initial`/`whileInView`/`viewport`/`transition` and NO `animate`, so a component that ships with the route mounts straight at the whileInView target and never plays its reveal. (The sections around it look fine only because they mount their revealed items after a fetch, i.e. on a later commit.) Verified in Chromium: before the fix the seven `<li>` carried no style attribute at any moment, before or after scrolling into view; after it they rest at `opacity: 0; translateY(16px)` and animate to `opacity: 1; transform: none` in a left-to-right wave. One prop, no remount, no flash, and reduced motion still attaches nothing. **The same one-liner is applied to the section's image and copy** — they mount after the fetch today, but a warm cache can land them on the first render. Worth knowing for every later prompt that reveals something mounted with its page.`
- `17 · The value-chain labels carry `overflow-wrap: break-word` · `src/index.css:139` sets `overflow-wrap: anywhere` on `p, li, dd, figcaption, blockquote` as the global long-token guard, and it is INHERITED by the label spans inside each `<li>`. `anywhere` also lowers the intrinsic min-content size to one character, so the first 8px of flex shrink at 1280 broke "FPC" and "Profit" across two lines (seen in the first QA capture). `break-word` breaks only a word that would otherwise overflow and leaves the minimum at the longest word, which is what now stops a step being squeezed narrower than the word it names — at 1025px the three long labels wrap at their spaces instead, and nothing overflows.`
- `17 · The connector's flex BASIS is its floor (24px), not its ceiling · With `flex: 1 1 48px` the six connectors contributed 288px to the row's base size, which pushed the natural row past the 1232px measure at 1280 and forced a shrink pass that squeezed the labels. `flex: 1 1 var(--vc-link)` + `max-width: var(--vc-link-max)` with the STEPS growing (`flex: 1 1 auto`, and `0 1 auto` on the last, which has no connector) gives the designed 24→48px range and finishes the row flush on the final label: measured 24px at 1025, 28px at 1100, 44px at 1200, 48px from 1366 up.`
- `17 · The fourth connector is KEPT in the 769–1024 two-row layout · Seven items in a four-track grid fill it 4 + 3 with no arithmetic, and the connector after step 04 runs to the right edge of the first row while step 05 opens the second. Hiding it would close the first row flush and lose the sense of continuation; keeping it is the wrap every left-to-right reader already follows.`
- `17 · `overflow-x: clip` on the section · `GlowWrap`'s lamp is 110% of its box with a 6% offset, so it reaches ~11% past the photograph — that is what makes it light rather than a border. On the stacked layouts (≤1024px) the photograph is the full measure, so the lamp reached past the VIEWPORT and gave the whole document 22–94px of horizontal scroll (measured; removing the section removed the scroll). `clip` rather than `hidden`, so no scroll container is created — the same guard `Footer`, `HeroCarousel` and `ProductChapter` already use.`
- `17 · An "unpublished" block is `published === false`, not a missing key · The prompt's fallback covers "missing or unpublished", and `siteContent.home.aboutTeaser` has no publish flag today (Prompt 34 owns the editor). Treating only an explicit `false` as unpublished means the seeded block renders now and a future flag works without touching this component; anything else — `null`, `undefined`, a rejected fetch — already lands on the same thin fallback.`
- `17 · `gradientWord` is FOUND in the headline, not pinned to index 4 · The title is owner-editable data. `gradientWordIndex(title)` locates "farmers" past its punctuation and returns `undefined` when the word is gone, so an edited headline keeps the emphasis on the right word or drops it — rather than gilding whatever word happens to be fourth.`
- `17 · The image is a plain `<img>`, not `CloudinaryImage`, and its `alt` is "" · The placeholder is `https://picsum.photos/seed/lamikaa-farm/1600/1000`; a Cloudinary transform does not apply to it, so `CloudinaryImage` would only wrap a URL it cannot resize. `.sf-placeholder-media` needs a WRAPPER (its wash is an `::after`), so the `<img>` sits inside a div that carries the class. `alt=""` because the picture is decorative and describing a scene the brand has not photographed would be inventing one — `onImageError` still swaps in the shared placeholder if the host is unreachable (exercised by aborting the request).`
- `17 · The `editorial` drop cap sets the opening word as "L" + "AMIKAA" · The prompt specifies `ContentBlocks variant="editorial"` and the seeded paragraph opens on the wordmark, so the Prompt 05 drop cap takes its first letter. Left as designed: a drop cap is a typographic convention the reader reconstructs, it changes no casing (BRAND.md §3.9 rule 1), and overriding a spec'd component's own device from outside would be second-guessing it. Flagged for the owner in Open TODOs — the same copy opens the About page in Prompt 28, so the decision is worth making once.`
- `18 · 2026-09-07 · The spotlight has NO fallback copy for its three points; a missing, unpublished or unreachable block renders the section not at all · Every other section on the page degrades to thinner copy, and this one cannot: its subject IS three cosmetic ingredient claims, and BRAND.md §3.9 makes the qualifiers part of the sentence ("antioxidant-rich", "traditionally valued in Northeast India"). A claim hard-coded as a fallback is a claim nobody can edit, review or withdraw. The section's own furniture — its eyebrow, its headline, "Carried by" — is copy ABOUT the section rather than about the ingredient, so that keeps defaults, exactly as AboutTeaser's does.
- `18 · 2026-09-07 · The check glyph's box belongs to a WRAPPER `<span>`, not to `<Icon>` · `@iconify/react` renders an unstyled, unsized `<span></span>` placeholder until the icon data resolves and forwards neither `className` nor `aria-hidden` to it. A bare `<Icon className={styles.glyph}>` therefore measured 0×0 in `--sf-color-text` (confirmed in Chromium) and would have shoved each point sideways the moment the icon landed. The wrapper reserves 20px and carries the gold; the svg inside is 1em, so the glyph's size IS the wrapper's font-size. Every other `<Icon>` in the repo is unstyled, which is why nothing hit this before.
- `18 · 2026-09-07 · `RitualCard` resolves its own steps, and imports the PURE `resolveRitualSteps` rather than taking resolved steps as a prop · The prompt fixes the card's props as `{ ritual, products, compact }`, and `apiService.rituals.resolveSteps` IS `resolveRitualSteps` — no fetching, no mode branch — so where it runs is only a question of who holds the catalogue. Resolving inside means Prompt 24's rituals index feeds the card the same two inputs the teaser does and cannot disagree with it about what a step shows.
- `18 · 2026-09-07 · The ritual card is one link and nothing inside it is interactive — including the step thumbnails, which do NOT link to their PDPs · A routine has one destination. Five thumbs linking onward would nest anchors inside an anchor and give a keyboard visitor six stops to five places inside one tile. The strip is `aria-hidden`, every image takes `alt=""`, and the link carries the whole name ("The Morning Glow Ritual, 4 steps"). Verified: 3 cards = 3 tab stops. The eight PDP thumbnails in the SPOTLIGHT are links, because there each destination is genuinely different.
- `18 · 2026-09-07 · The blurb is the tagline, else the story's first WHOLE sentence — never a truncation at N characters · A cut at a character count breaks mid-word and promises an ellipsis the copy never earned. `ritualBlurb` finds the first terminator followed by a space or the end of the string, so a story with no terminator comes through whole rather than empty.
- `18 · 2026-09-07 · The card takes `padding="none"` and sets 20px itself · The prompt specifies 20px; `GlassCard`'s scale is 16 / 24 / 32. Passing `padding="sm"` and overriding would have left two single-class rules fighting over stylesheet order. `none` emits no class at all, so the module's `--sf-space-5` is the only rule in play.
- `18 · 2026-09-07 · The overlapping step thumbs carry a 2px `--sf-color-bg` ring on top of `.sf-plate`'s own hairline · At −8px of overlap a plate's `--sf-color-surface` ground sits on the card's glass, which is within a few percent of it; without the ring the five plates read as one smear. The ring is the page ground, so it reads as the gap between two plates rather than as a second border.
- `18 · 2026-09-07 · The 40px step thumbs opt OUT of `.sf-card--hover:hover img`'s 1.03 breath · The gesture is written for a card's photograph; five 40px plates twitching together reads as a glitch, not as a response. The opt-out is three classes deep (`.card:hover .strip .thumb img`) so it wins over the primitive whatever order the sheets load in. The card's own 16:10 photograph keeps the breath.
- `18 · 2026-09-07 · Three ritual columns from 769px, not from 1024px · The prompt fixes 3 columns at 1024+ and one column ≤768 and leaves 769–1023 open. Three routines are a triptych; two columns there would strand the third on a row of its own. Measured at 769px: cards 227px, the longest strip (5 steps) 172px inside 187px of content width — it fits, with no overflow at any width.
- `18 · 2026-09-07 · `gradientWordIndex` is duplicated in `WhyBlackRice.js` rather than shared with `AboutTeaser.js` · Six lines against pulling `AboutTeaser`'s whole import graph (`ValueChain`, `LegalNote`, `ContentBlocks`) into a section that needs none of it. Two call sites is not yet a utility; Prompt 22's assembly pass is where a third would move it to `src/utils/`.
- `18 · 2026-09-07 · Both new sections sit on the page ground (`.sf-section`), not on `--sf-color-surface` · `AboutTeaser` immediately above IS a full-bleed surface band, and a second band butted against it would merge into one. The alternation the home page reads by is band → ground, which is what these two continue.
- `18 · 2026-09-07 · Sections 1–6 of `pages/Home/Home.js` are left untouched, pre-rebuild copy included · The file is touched only to import and mount the two new sections and to extend its own section map. Those sections are Prompt 22's to delete (00_INDEX §3.13, and the note the file itself carries); removing them here would drop functionality — recently viewed, the deals countdown — that Prompt 22 decides the fate of. Same posture Prompts 15–17 took.

- `19 · 2026-09-07 · The full-page CTA DOES have fallback copy — `brand.signatureLines.slice(0, 3)` and the two default links — where the ingredient spotlight deliberately has none · The two sections look symmetrical and are not. Prompt 18's subject is three cosmetic ingredient claims, which must never be hard-coded. This section's subject is the brand's own signature lines (BRAND.md §3.8), which `config/brand.js` already states verbatim and which the CMS block only mirrors. A fallback here restates the brand to itself; a fallback there would invent a claim. The PHOTOGRAPH is the one part with no fallback: no image is simply the wash over the page ground, which is a composition in its own right.
- `19 · 2026-09-07 · `prefers-reduced-motion` did not stop the second lamp of a `duo` breathing glow, and the fix is in the primitives · `.sf-glow--duo.sf-glow--breathe::after` (two classes) out-specificities the reset's `.sf-glow--breathe::after` (one class), so the violet lamp kept its 10s loop with reduced motion on — measured in Chromium as `getAnimations().length === 2` and `animationName: sf-breathe` on the `::after`. The hero has carried this since Prompt 14; this section would have been the second. A third selector at matching specificity was added to the reduced-motion block. Now 0 animations and `animation: none` on both pseudo-elements.
- `19 · 2026-09-07 · `.sf-glass--scrim::before` painted OVER the card's own text, not under it, and the fix is in the primitives · An absolutely-positioned pseudo-element paints in the positioned-descendant layer, above the host's in-flow inline text — so the wash dimmed the very type it exists to make legible (measured: the brightest headline pixel capped at rgb(165,163,161) instead of `--sf-color-text` rgb(247,245,240), and every "improved" contrast figure was both text and ground being dimmed together). `z-index: -1` plus `isolation: isolate` puts it where the class name has always promised — over the glass, under the content — which is exactly what `.sf-card--hover::before` already does with its lamp. This section is the `scrim` prop's first real consumer; `BottomNav` is the other user of the class and its labels were being dimmed the same way, and are now not.
- `19 · 2026-09-07 · The card takes `scrim` although the prompt's composition line names only `strong padding="lg"` · The prompt's own acceptance criterion says "text contrast on the card ≥ 4.5:1 **with the scrim**", and DESIGN_SYSTEM.md §4 names `.sf-glass--scrim` for exactly this case (text on glass over imagery). Without it, over a near-white photograph the signature gradient's violet stop measures 1.6:1 on the headline — the palette's quoted 4.65:1 for `#8B5CF6` is against the PAGE GROUND (`#0B0B0D`), and 8% white glass over a bright photo is not that ground. With the scrim the card's ground measures rgb(57,44,54) and the three gradient stops read 9.3 / 4.6 / 3.1:1.
- `19 · 2026-09-07 · The 48px glass field is now the newsletter's field in BOTH placements, so the footer's hairline-underline input from Prompt 13 is gone · The prompt states the shared component's field as "labelled, 48px tall, glass" and scopes the footer's preservation guarantee to "behaviour identical" — which it is, contract for contract. DESIGN_SYSTEM.md §7 already specifies every storefront input as a `--sf-color-surface-2` ground behind a 1px `--sf-glass-border`, so the extraction moves the footer ONTO the system rather than off it. One field design asked twice beats two, and `variant` is left to carry only what differs: alignment, measure, and the width at which the pill drops below the field.
- `19 · 2026-09-07 · `variant` changes layout only — never the control · `footer` is left-aligned with the field capped at 34rem and stacking at 480px (the breakpoint the footer's own grid collapses on); `cta` is centred inside a 760px card and stacks at 639px, because a pill and a field sharing 296px of a 360px phone leaves the field too short to show an address being typed. The input, the button, the error and the success line are byte-identical between them.
- `19 · 2026-09-07 · The background `<img>` uses a local `onError` that DROPS the photograph, not the shared `onImageError` · `onImageError` swaps in `PLACEHOLDER_IMG`, a "No Image" plate — right for a product plate, and wrong for a decorative ground the size of a screen, where it would print those two words across the viewport behind the headline. The state records the URL that failed rather than a boolean, so it resets itself the moment the owner publishes a different photograph.
- `19 · 2026-09-07 · The section's own padding is `--sf-space-16` (64px), not `--sf-section-y` · The 100svh floor is what gives this section its air; the padding's only job is to keep the card off the edges once the composition outgrows that floor, and the full fluid rhythm (140px at desktop) pushes a card that is already taller than the screen 152px further past it.
- `19 · 2026-09-07 · The three signature lines WRAP at `--sf-text-4xl` inside a 760px card, and that is left as specified · At 72px the longest line needs about 1150px and the card's measure is 696px, so each of the three renders as two — the spec's 4xl, its 760px card and "each on its own line" cannot all hold at once for 33-character sentences. "Each on its own line" is honoured as composition (three blocks, 8px apart, `text-wrap: balance`), which is the part that is a markup decision. The consequence is that the card runs 1060px at desktop and a 900px laptop scrolls once through the section; flagged for Prompt 22's assembly pass rather than decided here by moving off the specified token.
- `19 · 2026-09-07 · The wash and the gradient are absolutely-positioned layers, not cells of a shared grid · `align-self: stretch` does nothing to an `<img>` — a replaced element with an intrinsic ratio treats it as `start` (CSS Box Alignment §6.5) — so the photograph would have sat at its natural size in the middle of the section. Absolute positioning over the section's box makes the card the only child in flow, which is what lets the section's height be the card's.
- `19 · 2026-09-07 · Sections 1–6 of `pages/Home/Home.js` are again left untouched · `Home.js` is touched only to import and mount `<FullPageCta/>` after `<RitualsTeaser/>` and to extend its own section map with `0h`. Same posture as Prompts 15–18; those sections are Prompt 22's to delete.

- `20 · 2026-09-07 · The philosophy lede is a NEW `brand.philosophyLede` key rather than a string in the component · The prompt makes `brand.philosophy` the band's headline, which leaves its lede — BRAND.md §3.2's first sentence, qualifier included ("can be inspired") — with nowhere to live. `config/brand.js` is where the programme puts brand copy (Prompt 15 added `originBadge` for exactly this reason: "brand copy is edited in this file, never inside a component"), and the pillars this lede introduces already come from there. `siteContent.whyLamikaa.body` also opens on the same sentence, but the prompt's data contract for this section is `siteContent.get("impact")` alone, and fetching a second block to quote one sentence would make the band's own heading depend on the CMS being reachable.`
- `20 · 2026-09-07 · The pillar cards do NOT take `GlassCard interactive`, and the alternating glow is a hover rule in the module instead · The brief asks for "`glow` alternating gold/violet on hover" on cards that are explicitly "not links". `interactive` is the only thing in the primitives that gives a card a hover lamp, and it also gives it a 4px lift, a firmed hairline and a `:focus-visible` ring — three affordances promising a destination that does not exist, on a surface whose acceptance criterion is "keyboard-transparent". So `glow` supplies the tone node and `.grid .card:hover :global(.sf-glow) { opacity: 1 }` supplies the hover. Measured: `transform: none` on all four cards under hover, one tab stop in the section, tones gold/violet/gold/violet. `:focus-within` is included for Prompt 28's page variant; nothing inside a card is focusable today.`
- `20 · 2026-09-07 · The impact bullet is `mdi:circle-medium`, not the `mdi:check-circle-outline` the ingredient spotlight uses · The spotlight's three points are statements about black rice; these three are AIMS ("Farmers can benefit from the profitability of their own enterprise"). A tick in front of an aim reads as a claim that it has already happened, which is the class of statement BRAND.md §3.9 and this prompt's own guardrail ("no percentages, counts or promises") exist to prevent. A dot carries the list structure and claims nothing.`
- `20 · 2026-09-07 · The eyebrow is derived from `item.key` and the same word is stripped off the title, matched by hand rather than by a RegExp built from the data · The seed writes the category into the title as well ("Financial — From Raw Produce to Shared Value") because the CMS field is one string, and printing both would set "Financial" twice in a 20px stack. A key is owner-editable, so compiling it into a pattern would let a key change what the expression means; the prefix is matched with `startsWith` and only comes off when a dash follows it, which is what keeps "Financially Sustainable Farming" whole.`
- `20 · 2026-09-07 · 22px and 15px are declared as named custom properties on each grid, not as bare numbers · The scale (DESIGN_SYSTEM §6) steps 14 → 16 → 17 → 20 → clamp(22…28), and neither size the brief names is a step. 22px IS the floor of `--sf-text-xl`, but that token reaches 28px by 1440 and a four-up card cannot carry a headline that grows with the viewport. `--pl-title` / `--pl-text` / `--it-point` / `--it-glyph` keep the departure in one documented place per module and give `compact` four values to change, the shape `ValueChain.module.css` already uses.`
- `20 · 2026-09-07 · The pillar cards drop their backdrop blur ≤768px; the impact columns never had one · Stacked, each card is most of the screen, and four blurred panels in one scroll is what DESIGN_SYSTEM §4's two-layer budget is against — the sticky masthead has already spent one. Below the breakpoint the card paints `--sf-glass-fallback`, the same ground `@supports not (backdrop-filter)` gives it, exactly as `ProductChapter` does for its eight panels. The impact columns are a hairline and words on the page ground, so the section adds no second blurred layer at any width. The icon circle inside a card takes the glass GROUND and HAIRLINE without the filter, for the same reason.`
- `20 · 2026-09-07 · The impact half renders nothing — heading included — when its block is missing, unpublished or unreachable, while the pillars always render · The two sources fail differently and the section is built to let them: `brand.pillars` is a module the bundle always has, so the philosophy, the four cards and the CTA are always true; `siteContent.impact` can be absent, and an impact heading standing over nothing is a promise the page cannot keep. Same rule `WhyBlackRice` states for the ingredient claims. Exercised for real rather than by reading: the first browser run served a build pointed at the live host, and the section rendered philosophy + 4 pillars + CTA with the impact half absent and no console error.`
- `20 · 2026-09-07 · The stacked impact columns take a 32px gap where the three-column row takes the specified 24px · At ≥1025px the 24px gutter separates three columns that are already separated by their hairlines and their own width. Stacked, each column is full-width and 24px between two full-width blocks reads as one block that lost its rhythm; `--sf-space-8` is the distance the rest of the page uses between stacked editorial blocks.`
- `20 · 2026-09-07 · `Pillars` and `ImpactTriptych` take `titleAs` beyond the prompt's two-prop contract · The home band's outline is h2 → h3 (pillars, impact heading) → h4 (columns); Prompt 28's page makes the same content the page's subject and shifts the whole run up one level. A hard-coded tag would force that page either to skip a level or to fork the component. `className` is the same shape `ValueChain` already exposes.`
- `20 · 2026-09-07 · Sections 1–6 of `pages/Home/Home.js` are again left untouched · `Home.js` is touched only to import and mount `<WhyLamikaaSection/>` after `<FullPageCta/>` and to extend its own section map with `0i`. Same posture as Prompts 15–19; those sections are Prompt 22's to delete.`
- `21 · 2026-09-07 · `db.json` `faqs` rows 6–8 gained the `"home"` placement, so all eight site FAQs are on the shared block · The prompt's objective calls for **6–8 rows** on placement `home` and its first acceptance criterion names the `{{RETURN_WINDOW_DAYS}}` row on the HOME page — but the Prompt 06 seed (and `06_data-model-and-seed.md` §5) put `home` on rows 1–5 only, which leaves five. The alternative was to fail the criterion or to fake it from the constants fallback. Three JSON values in `placements[]`, the one field the admin FAQ manager already edits and both api modes already read: no schema change, no `api.js` change, `/admin/faqs` unaffected, and the diff is 3 added lines.`
- `21 · 2026-09-07 · The answer prints at `--sf-text-base` (16px), not the 15px the prompt's design spec sketches · There is no 15px token, and DESIGN_SYSTEM §6 fixes the scale at 14 / 16 / 17 / 20 with `--sf-text-base` as "the body floor (min 16px body on mobile)". An FAQ answer is body copy, not a UI label, so the 14px step is not available to it either, and a bare `0.9375rem` would be exactly the hard-coded value the guardrail ("the design system tokens are the only styling source") forbids. 16px is still one step under the 17px question, so the hierarchy the spec wanted survives. Measured: Manrope 16px `rgb(184,181,176)` at 20px inline padding.`
- `21 · 2026-09-07 · `FAQ.module.css` dresses the primitive through its ARIA CONTRACT plus one structural selector, rather than by adding a `variant` prop to `ui/Accordion` · A CSS-Modules class cannot be named from outside the module that owns it. `button[aria-expanded]` and `[role="region"]` are what `Accordion` documents as its interface and cannot change without changing what it is; `.faq > div` is the row, which carries no attribute of its own, and `:has(button[aria-expanded="true"])` is the only route from the published open state to it. Both are DECORATIVE — a browser without `:has()` simply draws no gradient rule and nothing moves. A `variant` prop would have put one surface's dress inside a component four surfaces share.`
- `21 · 2026-09-07 · The accordion is re-KEYED on the URL hash instead of `ui/Accordion` gaining a controlled-open API · The primitive owns its open set from mount, which is the right default for a click. A hash is a NAVIGATION: re-keying is what makes an in-page link to `#faq-3` open row 3 and not only a cold load on `/#faq-3`. The cost is that arriving at a new hash closes whatever the visitor had open, which is what they asked for; the alternative was a controlled API on a component Prompts 25, 27, 28 and 34 all mount.`
- `21 · 2026-09-07 · The anchor id sits on a `<span>` INSIDE the trigger, not on the accordion row · Each row's item id is `faq-<id>`, but the primitive prefixes its DOM ids with its own `useId()`, so `#faq-3` would name nothing in the document. `title` accepts a node, so the question is wrapped in `<span id="faq-3">`: a legal target for the browser's native jump, findable by `getElementById`, scrolls the whole row into view, and costs the primitive no new prop. It carries `scroll-margin-top: 112px` for the sticky masthead.`
- `21 · 2026-09-07 · A row whose answer empties out is dropped ENTIRELY, question included · `stripPlaceholderSentences` can take every sentence off an answer (seed FAQ 6 is exactly this while no shipping method sets a `freeAbove`). Rendering the question over an empty drawer advertises an answer the site does not have, which is worse than not asking. Asserted in both new suites.`
- `21 · 2026-09-07 · `FaqContext.forPlacement` was widened to pass an options object through, rather than `HomeFaqs` slicing after the call · `context/FaqContext.js` is outside the prompt's expected-files list, but a slice counts rows the live/placement/targeting filters and the de-dupe were about to drop and can hand back six for a limit of eight. Two lines in the context; `forProduct` and every other consumer are untouched.`
- `21 · 2026-09-07 · The FAQ page's and the PDP's hand-rolled accordions were NOT migrated here · "One accordion implementation only" is this prompt's guardrail and `pages/HelpCenter/HelpCenter.js` and `pages/ProductDetails/ProductDetails.js` each still hold one. Both files are owned by prompts that rewrite them wholesale — 27 (PDP supporting content) and 28 (`/faq` from `siteContent`) — and doing it here would re-do work those prompts specify differently (the help centre's list is searchable and filtered; the PDP's is a tab panel with tracked ordinals). The rewrite this prompt DID do is what makes both migrations a one-line mount. Carried into Open TODOs.`
- `21 · 2026-09-07 · Sections 1–6 of `pages/Home/Home.js` are again left untouched · `Home.js` is touched only to import and mount `<HomeFaqs/>` after `<WhyLamikaaSection/>` and to extend its own section map with `0j`. Same posture as Prompts 15–20; those sections (and the four Meghali-era strings a word-boundary sweep still finds in them) are Prompt 22's to delete.`
- `21 · 2026-09-07 · The section's lede is written in `HomeFaqs.js` rather than sourced from a reference file · The prompt fixes three strings ("Good to know", "Questions, answered", "All questions") and asks for a lede without supplying one. "The things worth knowing before you buy — the full set lives on the FAQ page." states no brand fact, no figure and no claim: it says what the list is and where the rest of it is, which is also what justifies the button beside it. Nothing is invented and nothing needs a source.`
- `22 · 2026-09-07 · "Recently viewed" is KEPT as the one secondary section; the home offers rail is REMOVED (the deals page remains) · The brief (§7.2) allows a secondary section "only if your repository analysis justifies it". Recently-viewed is not a section idea, it is EXISTING STOREFRONT FUNCTIONALITY: `pages/ProductDetails/ProductDetails.js:370-386` has always written the `recentlyViewed` localStorage list and the old home page has always read it back, so deleting the rail would have deleted a shipped feature to make a redesign tidier — which the programme's first guardrail forbids. The offers rail has no such claim: `/special-offers` is still a full admin-driven page, still routed, and still in the nav as "Offers" when `dealsConfig` is enabled, so the home rail was duplicating a page rather than providing a feature. Everything else on the old page (collection stories, featured grid, craft interlude, trending rail, promises row) was Meghali-era merchandising and is deleted.
- `22 · 2026-09-07 · The threshold for the recently-viewed rail is raised from 1 live product to 2 · One card under a heading that says "Where you left off" is not a rail, it is a repeat of the page the visitor just arrived from. Two is the smallest number that makes the heading true. Exported as `MINIMUM` and unit-tested.
- `22 · 2026-09-07 · `useHomeData()` orchestrates the fetches itself; NO `useAsync`/cache helper was used or written · The prompt names "the `useAsync`/cache helpers from Prompt 05". Prompt 05 shipped three hooks — `useInView`, `useFocusTrap`, `useScrollLock` — and no async helper, and `services/api.js` has no request cache either (`grep -n "cache" src/services/api.js` finds only the wallet's storeCredit denormalisation). Rather than invent a general-purpose async primitive for a single caller, the orchestration lives in `useHomeData` beside the tri-state contract it exists to serve. A module-level map de-duplicates requests that are IN FLIGHT (React 18 StrictMode double-mounts every effect in development) and drops the entry once settled — caching results for the session would have meant an owner editing a product in the admin and returning to `/` saw stale data, a freshness regression the old per-section fetches did not have.
- `22 · 2026-09-07 · `useHomeData` also returns `homeContent` and `impactContent`, beyond the seven keys the prompt lists · Three sections (`AboutTeaser`, `WhyBlackRice`, `FullPageCta`) each read `siteContent.get("home")` and a fourth read `siteContent.get("impact")` — four requests for one collection, which the prompt's own guardrail ("no section may fetch the same collection twice") forbids as much as it forbids four reads of `products`. `siteContent.get()` with no key answers the whole record, so the hook makes ONE request and hands out `record.home` / `record.impact`.
- `22 · 2026-09-07 · `HeroCarousel` takes `heroProducts` as a prop but KEEPS its own `hero.getConfig()` and its `getFeatured` fallback · `getHeroProducts` was read by four sections and is now read once. `hero.getConfig()` is read by nothing else on the page, and the `getFeatured(8)` fallback is the one CONDITIONAL read on `/` — it fires only when a merchant has arranged no hero order at all, so asking for it up front would be a request the page almost never needs.
- `22 · 2026-09-07 · The empty pre-mount reservation renders NOTHING, not a `<Skeleton>` · The prompt asks for "a `Skeleton` of the section's reserved height" while a deferred section waits. Measured, that cost **20.7 s of Speed Index**: `.sf-skeleton` is `animation: … infinite` over a 200 %-wide gradient, and nine of them (one 3200 px tall) repainted for the life of the page — for placeholders that are BY CONSTRUCTION at least 600 px outside the viewport and therefore never seen. The real `<Skeleton>` is kept for the Suspense fallback, which is the state a visitor CAN see (scrolling toward a section whose chunk is still downloading). Both hold the identical reserved height. Speed Index 20.7 s → 3.2 s.
- `22 · 2026-09-07 · The reservation is dropped the moment a section mounts · Holding `min-height` for the life of the page made `reserve` a FLOOR on each section's height. Measured at 390 px, that padded three bands with dead space (ShopByCategory 980 px forced to 1400, WhyBlackRice 953 → 1000, RitualsTeaser 849 → 1200) and left a **420 px blank hole** where `RecentlyViewed` had correctly rendered nothing — the normal case for a first-time visitor. `.reserving` is now applied only while the section is still >600 px away.
- `22 · 2026-09-07 · `content-visibility: auto` is applied to six deferred sections, NOT to about / spotlight / full-page-CTA · `content-visibility` applies PAINT CONTAINMENT at all times (not only while skipping), and `.sf-glow::before` deliberately bleeds past its host box (`inset: -12% -8%` under a 60 px blur). Those three sections draw a glow, and containing them would clip it to a hard edge. Skipping the rendering of three more sections is not worth cutting the page's atmosphere in half. Verified by screenshot at 390 px.
- `22 · 2026-09-07 · `hooks/useInView.js` gained a `rootMargin` option · The prompt specifies `useInView` with `rootMargin: "600px"` and the hook had no such option. Added with a `"0px"` default, so every existing caller (VideoPlayer, the hero's autoplay gate) is unchanged.
- `22 · 2026-09-07 · The JSON-LD helpers live in `hooks/useSeo.js`, and read `brand.name`/`brand.legalName` rather than the prompt's literals · The prompt allows either `useSeo.js` or `utils/seo.js`; `utils/seo.js` does not exist yet and Prompt 27 creates it for the PRODUCT graph, so the two site-level graphs sit with the hook that publishes them. The prompt spells the name "LAMIKAA Naturals" and the legal name without "(BAOPCL)"; `src/config/brand.js` is the single source of brand truth established in Prompt 02, so `brand.name` ("LAMIKAA NATURALS") and `brand.legalName` ("Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL)") are used instead of re-typing either. `sameAs` takes the LIVE `settings.social` map through `normalizeSocialLinks` (which blanks every `{{TOKEN}}`), so today it resolves to nothing and the property is dropped rather than published empty.
- `22 · 2026-09-07 · The dead Material Icons stylesheet was removed from `public/index.html` · Lighthouse flagged a SECOND render-blocking stylesheet from fonts.googleapis.com with no `display=swap`; the prompt's own rule is one render-blocking font link. Its comment claimed the admin's MUI icon set required it, which is false: `@mui/icons-material` ships SVG React components, MUI's ligature-based `<Icon>` is used nowhere, and the three storefront files with a local `Icon` (`Profile`, `OrderHistory`, `DeliveryReturnsInfo`) each draw their own inline SVG. `grep -rn "material-icons" src public` → 0. Best Practices 96 → 100.
- `22 · 2026-09-07 · A `preconnect` to res.cloudinary.com was added to `public/index.html` · The LCP element on `/` is the hero's first product image, and because the hero is product-driven its URL is not known until the catalogue read returns — so it cannot be preloaded and a cold DNS+TCP+TLS handshake lands on the critical path at the worst moment. Measured FCP 3.2 s → 2.6 s. No `crossorigin`: these are no-CORS `<img>` loads and a crossorigin preconnect opens a connection they cannot reuse.
- `22 · 2026-09-07 · `components/AdminLayout/AdminLayout` was made lazy in `App.js` — outside this prompt's expected-files list · Source-map analysis of the main bundle showed **~630 kB (uncompressed) of `@mui/*` plus the admin shell in the chunk every STOREFRONT visitor downloads**, for a layout only a signed-in administrator ever sees. It was the last eager import on the admin side; every admin PAGE was already lazy, and it is a layout route inside the same `<Suspense fallback={<RouteFallback/>}>` as the pages it wraps. Main bundle 285 → 249 kB gzipped. Verified afterwards by signing in and walking `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/settings`: drawer, app bar and navigation all present, **zero console errors**.

- `23 · 2026-09-08 · THE FILTERS, SORT AND PAGINATION ARE REMOVED — an explicit owner decision (brief §7.3), not a simplification made here · The deleted `pages/Products/Products.js` carried a category tree with parent-includes-children, a price range, rating/discount/in-stock/brand facets, six sort orders with twelve aliases, and `page`/`per_page` — over EIGHT products. `/shop` narrows by ROUTE only (`?concern=` and `/category/<slug>`), and search stays where it was: the overlay and `/search` (Prompt 11). Every one of those URL params still resolves: `components/routing/LegacyRedirects.js` sends `/products?category=x` to `/category/x` and `/products?search=x` to `/search?q=x`, verified in the browser.`
- `23 · 2026-09-08 · SCROLL-SNAP WAS KEPT, not dropped · The prompt makes it optional and asks for it to be dropped if it fights the sticky rail. Measured in Chromium 1194 at 1280 and 1440: with `scroll-snap-type: y proximity` on `<html>`, the rail still pins at exactly `top: 112px` through the whole listing, a rail click still lands the chapter at 96px (its `scroll-margin-top`) and still moves focus to the chapter `h2`, and "Back to top" still reaches `y: 0`. The decisive probe is mid-chapter: stopping half way down chapter 4 settles at **delta 0** — the visitor is never moved away from where they stopped. Near a boundary the settle is ≤ ~165px and always ONTO a chapter start, which is the chaptered feel the page is for. It is scoped to a `data-chapter-snap` attribute the page sets on `<html>` while mounted (a document-scrolled page snaps on the document; there is no div to put it on), and it is off below 1025px and off under `prefers-reduced-motion` — both verified as computed `scroll-snap-type: none`.`
- `23 · 2026-09-08 · `/category/:slug` was moved onto `<Shop mode="category" />` HERE, one prompt earlier than the file list expects · Prompt 08's `CategoryRoute` bridge rendered `<Products categorySlug={slug} />`, and this prompt deletes `Products`. Leaving the route on a `ComingSoon` stub would have removed working storefront functionality for a whole prompt (and would have broken Prompt 24's own pre-flight, which expects exactly four `ComingSoon` routes: `/rituals`, `/rituals/:slug`, `/why-lamikaa`, `/cart`). `Shop` therefore reads `useParams().slug` and calls `products.getByCategorySlug`, giving the category its chapters, its index and its closing panel now. Verified: `/category/face-care` 6 chapters, `/category/body-care` 2, `/category/rituals` → `/rituals`. Prompt 24 adds `CategoryHead`, the breadcrumb, the JSON-LD and the unknown-slug 404 (today an unknown slug renders the empty panel).`
- `23 · 2026-09-08 · `itemListJsonLd` opens a real `src/utils/seo.js`, rather than joining the two graphs in `hooks/useSeo.js` · Prompt 22 left `utils/seo.js` free "for Prompt 27's product graph" and `useSeo.js` says in its own header that page-level graphs belong there. `ItemList` is a page-level graph and Prompt 24 needs it too (plus `breadcrumbJsonLd`), so the file exists from today with one export and the site-level pair stays where Prompt 22 put it.`
- `23 · 2026-09-08 · The index rail is written FIRST in the DOM and painted SECOND (`grid-column: 2`) · The first keyboard walk in Chromium put the rail after all sixteen chapter CTAs and the closing panel — an index a visitor reaches only at the end of the page it indexes is a footnote, not a shortcut. Mirroring the grid rather than the DOM is the rule `ProductChapter`'s `flip` already follows. After the change: chips → rail buttons → chapters, and Enter on a rail button lands focus on the chapter `h2` with the next Tab reaching that chapter's "Explore more".`
- `23 · 2026-09-08 · `align-items: start` was REMOVED from the shop grid, and that is what makes the rail sticky at all · With `start`, the rail's grid item shrink-wraps to the rail's own 408px, and a `position: sticky` element whose containing block is its own height has nowhere to travel: measured, the rail scrolled away with the second chapter. Stretched, the item is as tall as the chapters column and the `<nav>` inside pins at 112px for the whole listing (measured at 1280 and 1440 across four scroll positions).`
- `23 · 2026-09-08 · Both index forms are rendered and one is `display: none`, rather than one node moved by a media query · The rail belongs in the page's second grid column and the strip is a full-bleed band above the chapters — two places in the document, so they cannot be one element. `display: none` takes the hidden one out of the accessibility tree as well as off the screen, so the eight products are never offered twice. Verified in the browser: at 1440 the strip computes `display: none` and the rail `flex`; at 1024 and below, the reverse.`
- `23 · 2026-09-08 · The mobile pill is 36px tall with a 44px hit area, not a 44px pill · The spec fixes both the pill (36px) and the band (48px at ≤768), which cannot both hold a 44px control. The pill keeps its 36px of ink and grows an inert `::after { inset: -4px 0 }` overlay to the full tap target — so the house 44px rule and the spec's band height are both satisfied, and WCAG 2.2 AA target size (24×24 minimum) has margin. Measured band height: 48px at ≤768, 52px at 769–1024.`
- `23 · 2026-09-08 · The strip sits at `top: 56px` only at ≤768px; between 769 and 1024 it sits at 64px · The spec names 56px, which is the masthead's height at ≤768px. The masthead is 64px above that, so a fixed 56px would have tucked the band under it for the whole tablet band. Both offsets verified against the rendered header.`
- `23 · 2026-09-08 · The empty state does NOT repeat the concern chips · The spec asks for "Nothing here yet + concern chips + All products". The chips are already the page's head, directly above the panel, so rendering them again would give a screen reader twenty-four links to twelve places. The panel carries the statement, one sentence and the "All products" button; the chips stay where they are.`
- `23 · 2026-09-08 · `BuildRitualPanel` fetches the WHOLE catalogue itself instead of taking the listing's rows · `RitualCard` resolves each step against the products it is handed, so on `/shop?concern=hydration` the panel's own three products would have drawn a four-step routine with one thumbnail and three empty plates. Two parallel reads (`rituals.getAll`, `products.getAll`) inside the panel; any rejection or an empty ritual list and it renders nothing at all, the same rule `RitualsTeaser` follows.`
- `23 · 2026-09-08 · `onVisible` fires only on the crossing INTO half-visibility, and the page's `activeIndex` is simply the last chapter to cross · Reporting the exit as well would make the rail flicker between two answers wherever two chapters are both ≥50% visible. Scrolling down, the arriving chapter crosses and becomes active; scrolling up, the one above does. Measured across four scroll positions at 1280 and 1440 and three at 390: the rail named the right chapter every time.`
- `23 · 2026-09-08 · `resolveCategory` and `categoryParam` were KEPT although the listing was their last storefront caller · The prompt names two helpers to remove and these are not among them; `categoryParam` is still called by `categoryPath` (and covered by `utils/routes.test.js`), and `resolveCategory` is a generic slug-or-id resolver Prompt 24's category work may want. `getMainMenuCategories` is likewise left alone — it was already unread before this prompt and belongs to the Prompt 35 sweep.`
- `24 · 2026-09-08 · `Shop` and `RitualDetail` were each SPLIT INTO TWO COMPONENTS so the 404 branch can return before `useSeo` · Both pages have to answer "this does not exist" for an unknown slug, and the obvious shape — render `<NotFound/>` inside the page — mounts TWO `useSeo` calls at once. That is not harmless here: `useSeo` BORROWS a tag it did not create, remembers what it displaced and puts it back on unmount. The child (`NotFound`) claims first and remembers the original; the parent claims second and remembers the CHILD's value; React unmounts child-first, so the child restores the original and the parent then overwrites it with the child's — a stale description left in the head of whatever page came next. The outer component therefore holds only `useParams`/the read hook and both exits (`<Navigate>` for the rituals category, `<NotFound/>` for an unknown slug), and the inner one owns the head. Exactly one `useSeo` is mounted on either route.`
- `24 · 2026-09-08 · The static `/category/rituals` route was REMOVED from `App.js` and the rule moved into the page · Prompt 23 added it as a literal route beside `/category/:slug`. But the real test is `category.kind === "rituals"`, not the slug — the owner can rename that slug in Admin → Categories, and `categoryPath()` already routes by `kind` — so the page has to check `kind` regardless. Two places to keep one rule in step is one too many: the page now owns both (`slug === "rituals"` short-circuits before the fetch, `kind` catches a renamed one), and `useShopData` gained a `skip` flag so the short-circuit costs no round trip.`
- `24 · 2026-09-08 · `Breadcrumb` was rewritten to take the FULL trail including Home, rather than keeping its Home-implicit `items` tail · It had **zero importers** (every page that shows a trail rolls its own `<nav>`), so there was no contract to preserve — and the reason to change it is that `breadcrumbJsonLd` must publish the same crumbs the page draws. With Home hard-coded in the component, the structured-data half had to retype it, which is precisely the drift a BreadcrumbList is famous for. One array now feeds both. The last crumb is never a link, carries `aria-current="page"`, and drops any `to` a caller passes by mistake.`
- `24 · 2026-09-08 · The choice labels are the CATALOGUE's `shortName`, not the brief's "Bar / Wash" · The brief illustrates the segmented control with the two words the seeded pair happens to suggest. `alternativeProductId` is admin-editable data — any two products can be paired behind one step — so a component that typed "Bar"/"Wash" would be describing today's seed rather than reading the record. `choiceLabel()` takes `shortName` (then `name`), and the seeded body ritual therefore reads **"Goat Milk Soap / Body Wash"** with the full product name as each radio's accessible name (WCAG 2.5.3 holds: the visible label is contained in it).`
- `24 · 2026-09-08 · The bundle button is gated on `priced > 0` as well as on the flag · With the flag on and the body ritual's WASH chosen, both steps are "Price on launch": the first build offered "Add the whole ritual to cart" and pressing it did nothing at all. A button whose only possible answer is "none of these are on sale yet" is a dead control, and the panel already prints no total in that state — so the CTA falls back to "Shop each step", live, the moment the choice makes the bundle empty. Verified in both directions: choose the wash → the bundle button is gone and "Shop each step" is there; choose the soap → the bundle returns and adds exactly the one priced step.`
- `24 · 2026-09-08 · The category panel takes `scrim` as well as `strong` · `GlassCard strong` is 8% white at 20px blur — a FILTER on whatever is behind it, and nobody has chosen what that is: `heroImage` is an unrelated Picsum seed (face-care currently serves a bright sky). Warm-white Fraunces on 8% white over a bright frame is a contrast failure waiting for a reseed. `scrim` is exactly the primitive for this — an inner `--sf-color-bg` wash under the content — and it costs nothing where the panel sits on the page ground (below 769px). Two blurred layers in view at most is still satisfied: the band is a filtered image, not a backdrop-filter.`
- `24 · 2026-09-08 · The head's overlap is a NEGATIVE MARGIN, not `position: absolute` · An absolutely positioned panel is measured against the band, so a category whose description runs three lines either overflows it or is clipped by it. On `margin-top: clamp(-140px, -9vw, -72px)` the panel stays in flow: it takes exactly the height its copy needs and pushes the page down when it grows, and the only thing the number controls is how far it rises. Below 769px (and in a short landscape viewport, `max-height: 520px`) the margin goes positive and the panel sits under the band with no overlap at all, which is what the spec asks for on a phone.`
- `24 · 2026-09-08 · The step connector is ONE hairline per row at full row height with the numeral punched over it, not a stub hanging below each numeral · Rows differ in height (a step with a choice control is 90px taller than one without), so a fixed-length stub either falls short or overshoots. Drawn edge to edge, every row's line meets the next row's at the shared boundary whatever either contains; `data-first` starts it at the first numeral's centre and `data-last` stops it at the last one's, so the thread never promises a step that is not there. The row's own seam is inset past the numeral column for the same reason — a hairline through the numerals' centre line cuts the one thing on the row that is meant to be continuous.`
- `24 · 2026-09-08 · The rituals index image is ABSOLUTELY POSITIONED inside its stage · The seeded ritual photographs are 1200×1500. Left in flow at 42% of a desktop card, the picture made itself 670px tall and left 200px of empty card beside a 470px story. Out of flow it contributes no intrinsic height, so the ROW decides the picture (`height: 100%`, `min-height: 280px`) rather than the other way round — which is the right way round for an editorial band, and is why every card is now exactly as tall as it has something to say.`
- `24 · 2026-09-08 · The concern chips on a category head are read off the PRODUCTS, not printed from the collection · A category record has no concerns of its own. Printing the whole eleven-chip set under a two-product category would offer nine links to lists that category is not in. `concernsOf(products, concerns)` collects the slugs the listed products actually name and consults the collection only for the display NAME and the editorial ORDER; a slug with no record still gets a chip through `concernLabel()`, because the products are the truth here and the collection is only the dictionary. `/shop` keeps the full set — there the chips are the way to NARROW the range, not a description of what is in it.`
- `24 · 2026-09-08 · The rituals index rows are built in the page, not on `RitualCard` · `RitualCard` is the grid form and already has two consumers (the home teaser and the shop's closing panel), both of which link TO this index. Reusing it here would make the index of the rituals look exactly like the two places that point at it, and a full-width row is the only place on the site where the photograph, two paragraphs of story and a whole line of step plates all fit at once. The page reuses `stepCountLabel` and `stepNumeral` rather than retyping either.`
- `24 · 2026-09-08 · The row's heading is plain text and "See the ritual" is the single control, named for its routine · A row holds a button, and a button inside an anchor is invalid markup that swallows the tap — so the whole-card link `RitualCard` uses is not available here. Rather than give each row two stops to one place, the name stays text and the button carries `aria-label="See the ritual: {name}"`: three identical link names in a screen reader's link list are three links to nowhere in particular, and the visible label is contained in the accessible one.`
- `24 · 2026-09-08 · `stepNumeral` requires a POSITIVE order, and the unit test is what found it · The obvious `Number.isFinite(Number(order)) ? … : index + 1` prints "00" for a step whose order is `null`, because `Number(null)` is 0 and 0 is finite. `resolveRitualSteps` fills the field in for every seeded step so nothing on screen showed it, but the fallback exists for the case where it has not — and a step numbered 00 is worse than one numbered by its position. `RitualCard`'s own copy of the expression has the same shape and the same practical immunity; it belongs to Prompt 18's file and is left for the Prompt 35 sweep.`
- `25 · 2026-09-08 · The BOTTOM NAV stands down on `/product/*` below 769px, and its SearchModal goes with it · Two sticky bars take 128px off a 640px screen, and the labels of the lower one read as part of the buy control above it. The rule lives in the bar (`hidesBottomNav(pathname)`, exported and unit-tested) rather than in `App.js`, so the component that knows it is 64px tall is the one that decides — and it returns `null` AFTER every hook, so React's hook order is untouched. The bar mounts the search overlay and therefore takes it along; navigation is still a tap away in the masthead (menu, search, cart) at every width, and the tab bar is back the moment you leave the route (verified with Back). This is Adaptation 18 in `00_INDEX.md`, now implemented.`
- `25 · 2026-09-08 · The retained content blocks (FAQs, reviews, the bundle, the related rail) stay ON THE PAGE, in the content column, rather than waiting for Prompt 27 · The prompt says "chapters in this prompt: `overview` only", and its own task 1 keeps the `useFaqs` read in the list of things to preserve verbatim. Deleting four working features for one prompt would break the global guardrail ("never remove a feature to make styling easier"), so `overview` is the only chapter written from product fields, and the three blocks that already had headings — FAQs, reviews and the cross-sell — keep theirs. FAQs and reviews are rendered THROUGH `Chapter` (they are titled sections with ids, which is all a chapter is) so `ChapterNav` has more than one target and can be seen doing its job; the two rails keep their own `<section>`s and stay out of the index. Prompt 27 rewrites all four and adds benefits / ingredients / directions / farmer story / full INCI around them.`
- `25 · 2026-09-08 · The h1 stays at `--sf-text-3xl`, and the design spec's "price 24px gold" is NOT delivered · The prompt names both `--sf-text-3xl` for the name (task 3) and "name 40/32px · price 24px gold" (design spec). Those cannot both hold: `PriceBlock`'s `lg` size — which the same task mandates — is itself `--sf-text-3xl`, and `PriceBlock` is not in this prompt's file list. Taking the name down to `--sf-text-2xl` (which is exactly 40/28px) would therefore have made the PRICE larger than the product's name. The token the task names wins; the two sit at the same size, separated by the promise and the rating, and the price is gold where the name is warm white. Re-open when a prompt owns `PriceBlock`.`
- `25 · 2026-09-08 · A shipping method with no `estimatedDays` is DROPPED from the delivery panel, not printed without its ETA · The one seeded method is `{flatRate: 0, freeAbove: null, estimatedDays: ""}` and its own description says "Delivery time and charges will be confirmed before launch". `describeCost()` renders a zero flat rate as "Free", so keeping the row would have printed a free-shipping promise nobody has configured — the exact failure the retired `FREE_SHIPPING_THRESHOLD` constant was removed for in Prompt 02. The predicate is `hasDeliveryEstimate()`, exported and unit-tested; COD, the returns window and the tax note follow the same rule, and the tax line now comes from `fillCopy("Prices are {taxNote}.")` so an unresolved rate loses its sentence rather than printing a token.`
- `25 · 2026-09-08 · The media placeholder requests a 4:5 PADDED tile and lets the plate letterbox it on a phone, rather than the square `stageSrc()` builds · The covers crop tall (the face wash is 1500×3200). Delivered square, the pack set as a narrow strip down the middle of a very wide mount at BOTH the desktop 4:5 plate and the phone 1:1 one — measured and photographed before the change. At 4:5 the desktop plate is filled exactly and the phone letterboxes by 36px a side. One request, correct at the ratio that matters most; Prompt 26 replaces the whole placeholder with the real gallery.`
- `25 · 2026-09-08 · `ChapterNav` and `AddToCartBar` take a FIRMER ground than `.sf-glass` gives them · Both are slim bars that a live page scrolls under, and 6–8% white is a tint rather than a ground: a gold headline or a pack shot passing beneath them takes the pills or the price with it, and where a compositor declares `backdrop-filter` and then skips it there is nothing behind the text at all (which is exactly what the QA renderer did). Each keeps `.sf-glass` for the blur, the hairline and the shadow, and overrides only the background with a `color-mix()` of `--sf-color-surface` (88% for the nav, 92% for the purchase bar) — the treatment DESIGN_SYSTEM §7 already gives the SweetAlert popup at 94%. Written with a doubled class so it beats the primitive whichever order the sheets land in.`
- `25 · 2026-09-08 · The stock line is SILENT for a product with no price yet · "In stock" beside a button that says "Coming soon" is two answers to one question, and neither "Only 3 left" nor "Out of stock" means anything about a thing nobody can buy. `stockLabel({comingSoon: true})` returns `""` for every stock value; the quantity stepper is still disabled and the price chip still says "Price on launch".`
- `25 · 2026-09-08 · `ChapterNav` renders NOTHING with fewer than two chapters, and its pills are `<a href="#id">` · An index that offers only the place you are already standing in is chrome, not a shortcut. The pills are anchors so they are keyboard-reachable, middle-clickable and still work if the click handler never runs; the handler only upgrades the jump to a smooth one and moves focus into the chapter. The SECTION is the focus target (`tabIndex={-1}` on `Chapter`, labelled by its own heading) rather than the heading, so a keyboard visitor lands IN the chapter and the next Tab stays there — and `.chapter:focus{outline:none}` with a `:focus-visible` ring keeps a mouse click from drawing one.`
- `25 · 2026-09-08 · The PDP's `metaTitle` has the site suffix taken off before it reaches `useSeo` · The seed writes `metaTitle` as a WHOLE title ("Black Rice Face Wash · LAMIKAA NATURALS") because Prompt 06 wrote it for the hand-rolled title effect this page used to run; `useSeo` applies `brand.seo.titleTemplate` on top, so the first run printed the brand twice. `productSeoTitle()` (exported, unit-tested) strips a trailing suffix if the override already carries one. Fixed in the PAGE, not the seed: the admin's field keeps meaning "the title I want", whatever an owner types into it.`
- `25 · 2026-09-08 · Two components outside the prompt's expected-files list changed by one line each of substance · `Breadcrumb.js` no longer gives the `.current` STYLE to a linkless crumb in the middle of a trail (only the last crumb is the current page); `TrustBadges.js` gained a third `variant` ("chips") beside `grid` and `row`. Both were named for restyle by the prompt; neither changes an existing call site's rendering (`CategoryHead` and the ritual head pass full trails and no PDP-only variant).`
- `26 · 2026-09-08 · The zoom range is 1×–4×, the double-tap step is 2×, and the buttons move in 0.5× · Four is where a 2000px delivery stops being sharp on a 1440px stage (a 500px-wide crop of a 2000px file painted at 2000px is already 1:1), so a fifth power would only magnify the JPEG. 1× is the floor because a lightbox that can shrink its own picture has invented a state with no purpose. The double-tap goes straight to 2× rather than stepping, because a tap is a decision, not a dial; the ± buttons step 0.5× because a button IS the dial. `clampScale` and `panBounds` are exported and unit-tested — the pan is clamped to half of what the picture overflows its frame by, each way, which is what makes a zoomed picture impossible to lose off screen.`
- `26 · 2026-09-08 · "Full label" defaults OFF — every image opens on its front-panel crop, and the toggle resets on every frame change · The crop recorded per product in PRODUCTS.md is what makes the pack fill the plate; the uncropped cover is a studio frame with the bottle small in the middle of it. The front panel is therefore what the plate is FOR, and the whole shot is the thing you ask for. It resets with the index (`useEffect` on `index`) because carrying the state across would show the NEXT pack in a state nobody chose for it — and because only some rows have a crop at all, so the pill would otherwise vanish mid-gallery with the state still set.`
- `26 · 2026-09-08 · `GlowWrap intensity={0.14}` is passed as the prompt asks and CLAMPED to 0.15 by the primitive · `GlowWrap` clamps intensity to 0.15–0.30 (Prompt 05, DESIGN_SYSTEM §5) so the lamp can never be invisible or a wash. The call site says what the design asked for; the primitive holds the floor it was given. Nothing to fix in either — recorded so the 0.01 is not read as a typo later.`
- `26 · 2026-09-08 · The "Zoom" button and the lightbox are for IMAGE rows; a video row keeps the player's own full-screen control · "Zoom" over a film means nothing, and the player already offers `F` and a fullscreen button where the browser supports it. The lightbox still RENDERS a video (←/→ inside it can reach one) — it simply hides the zoom bar there. Focus restore follows: the Zoom button when there is one, the stage itself when the item you closed on is a film.`
- `26 · 2026-09-08 · ONE rail element, repositioned by CSS grid — not one per breakpoint · A second `role="tablist"` would give a screen reader two galleries for one product and a keyboard visitor two copies of every thumbnail. The stage comes first in the DOM (reading order: the pack, then its other frames) and desktop places the rail into column 1 with explicit `grid-column`/`grid-row`. `aria-orientation` is deliberately NOT set: the rail is a column at 1025px and a row below it, one element cannot claim both, and the arrow handler answers ←/→ AND ↑/↓ (plus Home/End) so neither orientation is the wrong guess.`
- `26 · 2026-09-08 · The stage answers keys only while the STAGE itself holds focus (`event.target !== event.currentTarget → return`) · `VideoPlayer` sits inside the stage and owns Space, M and ←/→ (seek ±5s) whenever IT is focused; without the guard both handlers would fire and an arrow would seek the film and change the item at once. The same rule keeps the arrows on the rail belonging to the rail.`
- `26 · 2026-09-08 · The 32px toggle pill carries a 44px hit area rather than becoming a 44px pill · The design names a 32px pill and WCAG 2.5.5 names a 44px target; an invisible `::after { inset: -6px }` gives both, which is the technique `.sf-chip` already implies by keeping `button.sf-chip` at `--sf-tap-target` while the resting chip is shorter. The prev/next arrows and every lightbox control are 44px and 48px respectively, unextended.`
- `26 · 2026-09-08 · `Modal`'s `.full .body` gained `flex: 1 1 auto` — a shared primitive changed outside this prompt's file list · A `size="full"` panel is a whole `100svh`, but its body had no flex grow, so it was content-height and any `flex: 1` region inside it (the lightbox's picture, `SearchModal`'s result list) had nothing to grow into and resolved to **zero**. Measured: the lightbox viewport was `1440×0` and every wheel, pan and double-click landed on the foot instead of the picture. The fix is one declaration in the component whose own comment already promised "one scrolling region beneath it"; `SearchModal` was re-checked in the browser after it (body 959 of a 960 dialog, no visual change).`
- `26 · 2026-09-08 · `useSwipe` cancels `dragstart` on its element · A gallery stage IS a photograph, and an `<img>` is draggable by default: a mouse drag across it starts the browser's own image drag, the ghost thumbnail follows the cursor, the pointer stream stops dead and no swipe ever completes. Found by the browser QA hanging mid-drag — twice — before the cause was read correctly. The cancel lives in the hook, not in the gallery, because "works with mouse drag too" is the hook's promise to every future consumer.`
- `26 · 2026-09-08 · The lightbox picture is capped at `min(92svh, 100%)`, not at `92svh` · 92svh is the design's cap; the FRAME is what is left after the 48px head and the zoom-bar foot, which at 960px is 79svh. Capping at the design number alone would have let the picture overflow a frame whose `overflow: hidden` then clips it — a clipped edge being the exact thing a lightbox exists to undo.`
- `28 · 2026-09-08 · `hooks/useSiteContent.js` was added, outside the prompt's expected-files list · Five pages needed the same effect (read one section of `siteContent`, tri-state it, de-duplicate the StrictMode double mount). Five copies of it would have been five places for the "not yet" vs "not there" distinction to be got wrong — the distinction the whole no-invented-copy rule rests on. It follows `useHomeData`'s contract exactly (`undefined` in flight, `null` missing or unreadable, value ready) and caches nothing, so an owner who edits the About copy in the admin and clicks back sees today's words.`
- `28 · 2026-09-08 · `ContentBlocks` gained an additive `dropCap` prop (default `true`) — a shared primitive changed outside the file list · `/about` renders its body in RUNS broken at the `::steps` fence, so the value chain can be drawn by `ValueChain` rather than by the generic stepper. Every run after the first would otherwise open on its own drop cap. One prop, one line in the component, no change to any existing call site.`
- `28 · 2026-09-08 · Clause numbers are generated BY POSITION and the author's own ordinal is stripped off the heading · The seeded bodies write "## 01. Dispatch", and the Terms document has an ELEVENTH clause that no stored prose can carry (the live pricing block). Numbering by position is what lets a generated clause continue the run, and what keeps the document right when an owner reorders two clauses in the admin without renumbering them by hand. `clauseTitle` strips at most TWO digits, so "2026 in review" keeps its year.`
- `28 · 2026-09-08 · The Shipping & Returns clause lists method NAMES and descriptions and **never a rate** · The prompt forbids hard-coded rupee rates; it would have been equally wrong to print `flatRate`/`freeAbove` from the live record into a legal document, because a policy that quotes money is a policy a customer can hold the checkout to at a moment when the checkout has already recomputed it. The rate belongs at checkout. Asserted in `policyClauses.test.js`.`
- `28 · 2026-09-08 · A policy `standfirst` is READ but not seeded · The design calls for one under the revision stamp; `siteContent.policies.*` carries `title`, `updatedAt` (privacy only) and `body`, and writing four standfirsts here would have been four paragraphs of brand copy invented by a component. The page renders `record.standfirst` when the owner adds one in Prompt 34's editor and lays out correctly without it. Same rule for `siteContent.faqPage.lede`.`
- `28 · 2026-09-08 · The FAQ page adds a trailing "More questions" group for rows no configured heading claims · `siteContent.faqPage.groups` is owner-editable, so renaming or deleting a heading in the admin would otherwise silently drop every answer filed under the old key. An answer the store has written must be visible somewhere. Claimed BY KEY rather than by the rows a group returned, so a de-duplicated row cannot reappear under "More questions" as if nobody had filed it. Unit-tested.`
- `28 · 2026-09-08 · The Why LAMIKAA ownership chain is rendered by `ContentBlocks`' own stepper, NOT by `ValueChain` · `siteContent.whyLamikaa.difference` carries a six-step OWNERSHIP chain, and `ValueChain` exists precisely so the seven canonical VALUE steps (`brand.valueChain`) cannot be invented — handing it a different list would defeat its one job. `/about`'s `::steps` IS the canonical chain, and there it is drawn by `ValueChain`.`
- `28 · 2026-09-08 · `WHY_CHOOSE_US` and `POLICY_LAST_UPDATED` were deleted from `utils/constants.js` · Both had exactly one consumer each among the seven deleted pages. `WHY_CHOOSE_US` re-shaped `brand.pillars` for the Contact rail, which now mounts `<Pillars compact/>` reading the same config and owning its own glyphs; `POLICY_LAST_UPDATED` was one hard-coded date shared by four hard-coded documents, replaced by each record's own `updatedAt`. Comments left in place of both, per the file's own habit.`
- `28 · 2026-09-08 · `ROUTES.POLICY` (`/policies/:policy`) was ADDED and the four explicit policy constants KEPT · App.js mounts one route; every link still names its document (`ROUTES.POLICY_TERMS`) rather than building a path, and `LegacyRedirects` still maps `/privacy`, `/terms`, `/refund`, `/cookies` onto those same four constants. One route, four names, no path typed at a call site.`
- `28 · 2026-09-08 · `PolicyPage` splits into a route component and a document component · The unknown-slug case has to return `NotFound` BEFORE anything reads a record or claims the document head; a guard inside one component would have to run after every hook, so `/policies/other` would publish the policy page's `<title>` and canonical for a frame and then let `NotFound`'s own `useSeo` overwrite them.`
- `29 · 2026-09-08 · The mobile cart carries a 64px sticky glass bar and the BottomNav STANDS DOWN on /cart — the summary CTA is not duplicated · The prompt allowed either a hidden tab bar (as the PDP does) or stacking with the CTA duplicated "only if the page is taller than 2 viewports". Measured at 390x844 with the seeded catalogue: a two-line cart plus the summary card plus the cross-sell is 2 848px = 3.4 viewports, so the duplication clause was live — but stacking is what it buys, and two 64px bars take 128px off a 640px screen, leave the tab labels reading as part of the Checkout control, and put the same word twice within 60px of itself. `hidesBottomNav()` (components/BottomNav/BottomNav.js) therefore gained `pathname === ROUTES.CART` beside `/product/*`, and the summary card's own Checkout button is the SECOND appearance the clause asked for — it sits in the flow, not in a second bar. Navigation stays a tap away in the masthead at every width, exactly as on a product page. Unit-tested in PurchasePanel.test.js.`
- `29 · 2026-09-08 · Country stays a read-only "India" on the checkout address form — recorded as an OWNER decision to revisit before shipping abroad · Pre-existing behaviour, preserved verbatim (`#ship-country` is `readOnly` with `value={shippingAddress.country}` seeded "India"). It is honest today: the only seeded shipping method quotes no international rate, `settings.payment` describes COD "across most pin codes in India", and `validateAddress` has no country rule to enforce. The field is annotated in `Checkout.js` at the input. Turning it into a select is a data change (shipping methods per country, tax treatment per country), not a markup change, so it is out of this prompt's scope.`
- `29 · 2026-09-08 · `crossSellFor` moved to `components/cart/CrossSell.js` and the drawer's test import moved with it · `CartDrawer.test.js` imported both pure functions from `./CartDrawer`; `freeShippingThreshold` is still the tray's own (the meter is a drawer feature), but the ranking now belongs to the shared component. Re-exporting it from the drawer would have left two import paths for one function and no reason to prefer either.`
- `29 · 2026-09-08 · `CrossSell` takes `products` as a PROP and never fetches · The drawer reads the catalogue once per mount into a ref (Header keeps the tray mounted for the whole session, so forty opens cost one request); the page reads it with its own mount lifecycle. A fetch inside the shared component would have replaced one cached read with two uncoordinated ones and made the function untestable without mocking axios.`
- `29 · 2026-09-08 · The cart page's line row is NOT the drawer's row extracted · The two share an anatomy, not a layout: 72px of plate inside 440px of tray versus 96–112px inside a 1.4fr column, a name that clamps at two lines in both but at `--sf-text-sm` in one and `--sf-text-base` in the other. One component parameterised over both would be two layouts wearing one name. What genuinely IS one thing — the ranking, the plate/name/price/Add row, the coupon disclosure's gestures — is shared.`
- `29 · 2026-09-08 · The step-0 CTA reads "Sign in to continue" for a guest, not one of the four step labels · The prompt's copy list names "Continue to shipping" for step 0, but the auth gate is a PRESERVED behaviour: pressing the button opens `openAuthModal("login")` and does not advance. A button that says where it is going and then does not go there is the one copy change worth making against the list. The four step labels are exact everywhere they are honest.`
- `29 · 2026-09-08 · The order-failure alert also covers `result.success === false`, not only a thrown error · `OrderContext.createOrder` catches its own failures and returns `{ success: false }` — it does not throw — so an alert wired only to the `catch` would never have fired, and the acceptance criterion ("shows when JSON Server is stopped at the last step") would have failed. Verified by killing the API between the review step and Place order: the panel appears, the CTA stays put, and the page never navigates. `createOrder`'s own SweetAlert modal is untouched; the panel is the part that persists after it is dismissed.`
- `29 · 2026-09-08 · The TBA guard drops the line and BLOCKS the step rather than dropping it silently and continuing · A cart that changes under the shopper between one press and the next screen is worse than a press that does nothing. It fires one toast naming what left and why, and the second press then advances. Nothing in the UI can create such a line (`buildCartItem` throws PRICE_TBA and every Add is disabled before it) — a cart restored from localStorage or merged from the API can.`
- `29 · 2026-09-08 · The rail's tax line is "Tax" + the amount with `fillCopy("Prices are {taxNote}.")` under the total, replacing "Tax (0%, included)" · The seeded store is tax-inclusive at rate 0, and "Tax (0%, included)" is a receipt line that states a rate the packs deliberately do not state. `{taxNote}` is the store's own sentence and already reads "inclusive of all taxes" for that pair, "inclusive of 18% tax" or "exclusive of 18% tax, which is calculated at checkout" for the others — the same words the PDP and the policies use. The `taxAmount` row itself is unchanged and still always rendered.`
- `29 · 2026-09-08 · Every radio and checkbox keeps a REAL control, visually hidden inside its own label · The option cards are `<label>`s carrying a clipped `<input>` plus a drawn `.box`; the card shows the focus ring through `:focus-within`, the selection through a gold ring AND a filled indicator (never colour alone). Verified with the keyboard: 16 tabs to the step-0 CTA with a visible ring, Enter advances the step, ArrowDown moves the payment selection card to card.`
- `29 · 2026-09-08 · `.card` / `.railCard` / `.credit` drop their backdrop filter under 769px · DESIGN_SYSTEM §4 allows two blurred layers in view; a full-height step card, a summary card and a violet credit card all blurring a live scrolling page is three. Below 769px they sit on `--sf-color-surface` with their hairline. Each selector is doubled (`.card.card`) so the ground beats GlassCard's own whichever order the two sheets land in.`
- `29 · 2026-09-08 · `/checkout` gained `padding-bottom: 64px + safe-area` below 769px · The BottomNav does NOT stand down on `/checkout` (its CTA is in the flow, not pinned), and the old sheet cleared the bar with `--sf-space-24` on `.page`. The rewrite states the reason instead of the number.`

- `30 · 2026-09-08 · The disabled Google and Facebook buttons are DELETED, not restyled · They were rendered `disabled` with a "Soon" badge and wired to nothing — no provider config, no OAuth callback, no `social` branch in `api.js`. A control that cannot be pressed is not a feature, it is a promise, and it was carrying the only five hard-coded brand hexes on the storefront (`#4285F4 #34A853 #FBBC05 #EA4335 #1877F2`, the documented exception in REPO_MAP §2). Social sign-in is a backend feature: when the provider table and the callback exist it comes back as working buttons with real marks. The dialog now offers exactly what it can do. (00_INDEX §3.19 anticipates this removal.)`
- `30 · 2026-09-08 · The shared `STATUS_CONFIG` carries a semantic TONE, not a CSS-module class name · The two copies each mapped a status onto a class (`statusProcessing`, `statusDelivered` …) that only existed inside the page that declared it — one status, two unrelated names, two sets of colour rules. What a status actually has is a tone, and the design system already names those (`--sf-color-warning/-info/-success/-danger`), which is exactly what `Chip variant="status"` consumes. Neither page needs a status class any more and no colour is written down twice. `returned` keeps `danger`, the tone its old `statusCancelled` class already painted.`
- `30 · 2026-09-08 · The shared module exports `orderStatusInfo(order)` and both pages use IT, not `deriveOrderStatus` directly · Every consumer needed the key AND the word (the timeline stage, the cancel guard and the filter all read one order), so returning `{ status, label, tone }` from one call is what the callers actually wanted; calling `deriveOrderStatus` and then indexing `STATUS_CONFIG` was the duplicated shape, not just the duplicated function. `deriveOrderStatus`, `STATUS_CONFIG` and `getStatusInfo(status)` are still exported for anything that needs a piece. The prompt's `grep -rn "deriveOrderStatus" src --include=*.js | grep -v utils/orderStatus.js` returns **2** as specified — both are the docblock lines in the two pages that name what moved.`
- `30 · 2026-09-08 · "Forms via `ui` inputs" was read as "forms to the design system's field spec", because there is no input primitive · `src/components/ui/*` is the thirteen components of Prompt 05 and none of them is a field (DESIGN_SYSTEM §7 specifies inputs as a RULE — 48px, `--sf-color-surface-2`, one `--sf-glass-border` hairline, a gold focus ring, a label that is always visible — not as a component). Profile, AuthModal and ReviewModal therefore wear that rule in their own modules, written identically to `Checkout.module.css`'s `.formGroup` from Prompt 29. Extracting `ui/Input` is a real piece of work with four call sites to migrate and belongs to a prompt that says so.`
- `30 · 2026-09-08 · `Modal`'s phone treatment is a FULL-HEIGHT sheet, not a bottom sheet · The spec asks for "bottom sheet ≤ 480px" and `ui/Modal` already turns every size into a full-screen sheet at 480px and below (Modal.module.css:118-137, Prompt 05's contract, shared with SearchModal). Measured at 390×844 the auth dialog is 390×844 at y=0. Re-deciding that inside AuthModal would give the storefront two different mobile dialog behaviours; the primitive's is the one every dialog gets.`
- `30 · 2026-09-08 · The feedback toast stays the existing `collapse()` motion.js toast; it was not moved to the SweetAlert2 skin · The prompt allows either and asks for the simpler with no behaviour change. The existing one is four lines of JSX with a dismiss button and a 4-second timer that the page already owns; routing it through Swal would add a second toast system to a page that already raises Swal for the three CONFIRMS (delete address, log out) and make the "Profile updated successfully." line un-dismissable by the same control.`
- `30 · 2026-09-08 · Three CSS-module classes are written doubled (`.plate.plate`, `.actionDanger.actionDanger`, `.recentPlate.recentPlate`) · Each recolours or re-radiuses an element that also carries a single global class from `storefront-primitives.css` (`.sf-plate`, `.sf-btn--outline-gold`). Both are specificity 0-1-0, so which one wins depends on the order the bundler emits two stylesheets in — not something a component should be betting on. Doubling is the same fix `Checkout.module.css` already uses (`.credit.credit`, Prompt 29) and it beats `!important`, which would take the property away from every later caller.`
- `30 · 2026-09-08 · The Order History empty-state mark is a shopping bag, not the old bound ledger · The prompt's copy sweep asks for "a simple hairline heart / bag" in place of the loom drawing. The loom was the WISHLIST's (`EmptyIllustration`, with the gold weft and the shuttle) and is now a plain hairline heart; Order History's `LedgerMark` was a bound page — not textile, but a ledger of woven goods is not what a skincare brand records either, so it is a bag in one line with a gold handle. `SealedMark` and `AlertMark` are unchanged.`

- `31 · 2026-09-08 · ErrorState is a thin wrapper over EmptyState, not a second component with its own stylesheet · The prompt asks for "the same anatomy". Two stylesheets is how the two states drift apart, and a failure that looks like a different application is exactly what the sweep was for. ErrorState therefore adds only the three things a failure needs and an empty list must never have: `role="alert"`, the "Try again" that calls `onRetry` FIRST in the action row, and the honest copy ("We couldn't load this" / "Nothing was changed…"). That is also why the prompt's own file list has `ErrorState.js` with no `.module.css`.`
- `31 · 2026-09-08 · EmptyState's title is a <p> by default, with an opt-in `titleAs` · Most of these sit inside a section that already has its heading, so a second <h2> saying "Nothing here yet" adds a phantom entry to the document outline. `titleAs` is passed only where the state IS the page and does own the level: the 404 (h1), the disabled offers page (h1), OrderConfirmation's failed and not-found branches (h1 — the first browser pass caught that the not-found page had NO h1 at all), and the three account states that replace a real <h2>.`
- `31 · 2026-09-08 · The ring and the eyebrow are BLOCK-level inside the state card, overriding `.sf-eyebrow`'s inline-flex · Caught in Chromium, not by reading: `.sf-eyebrow` is an inline-flex pill and the ring was inline-flex too, so in a `text-align: center` column the two shared a line and every eyebrow rendered BESIDE its glyph. Both are promoted with a two-class selector (`.card .eyebrow`) so they outrank the primitive whichever order the sheets land in. The same bug, same fix, in OrderConfirmation's `.head .eyebrow` under the seal.`
- `31 · 2026-09-08 · SpecialOffers' local ProductCard was deleted rather than kept "in step by eye" · Its own docblock said the two were to be matched by hand, and they had already drifted: the copy cropped the packaging to a 3:4 `object-fit: cover` plate (the house rule is a CONTAINED 1:1 `.sf-plate` — a bottle whose cap is sliced off is a defect) and it knew nothing about `priceTBA`, so five of the eight launch products would have offered an Add to Cart for a price that does not exist yet. The wall now renders `storefront/ProductCard` inside a `motion.div` cell that owns the reveal and the filter exit. The tab strip and the Deal-of-the-Day feature stay local — nothing else on the storefront has them.`
- `31 · 2026-09-08 · SpecialOffers and Search gained a `failed` state; the offers page also gained a retry · Both `catch` blocks used to set `[]` and fall through to the empty branch, which is the one mistake the prompt forbids: a dropped read told a shopper "no offers are running" or "nothing matched your search". Each now sets a `failed` flag that is branched on BEFORE `length === 0`, and a `reloadKey` counter re-runs the existing effect (no second copy of the fetch). Rituals got the same retry — its failed panel previously offered only a link to the shop.`
- `31 · 2026-09-08 · `DEFAULT_DEALS_HERO` and `DEFAULT_DEALS_TIMER` in `utils/dealsConfig.js` were rewritten, outside the prompt's file list · They are what `/special-offers` PRINTS before the config arrives and after the read fails, and they held the previous brand's promo voice plus three claims nobody has made — "Limited Time", "Special Offers & Deals" and "Discover unbeatable prices on top products. New deals drop daily — don't miss out!" — over a live countdown to end-of-day that no admin had set. Both now match the seed exactly (tag/title "Offers", subtitle "Launch offers will appear here.") and the timer defaults to `enabled: false`. `normalizeDealsConfig` is untouched, so a real admin record behaves exactly as before; only the pre-fetch and failed-fetch values change.`
- `31 · 2026-09-08 · OrderConfirmation's "Continue shopping" now goes to `/shop`, not `/` · The prompt specifies it. It was the one action on the page that sent a shopper back to the homepage rather than to the range.`
- `31 · 2026-09-08 · The global `.loading-spinner` and its `@keyframes spin` were removed from App.css · OrderConfirmation's loading branch was the last page-level spinner and is now a `Skeleton` silhouette, which left the class with ZERO consumers (`grep -rn "loading-spinner" src` → the rule itself and its own comments). The prompt's rule is "no page may show a spinner as its main loading state"; leaving a global class that only a future page could misuse is how that rule gets broken later. The four spinners that remain (AuthModal, ReviewModal, OrderHistory ×2) are all inside a working button and each keeps its own keyframe next to the control.`
- `31 · 2026-09-08 · Profile's five "coming soon / nothing saved" panels were converted too, not just the three the prompt lists · The prompt names recent orders, wallet and addresses; payment methods and notifications used the SAME five `.state*` classes, so converting three of five would have left the local card family alive to be copied again. All five are `EmptyState compact` (24px padding, in-page), and `.state` is now one rule.`
- `31 · 2026-09-08 · OrderHistory's signed-out screen is `EmptyState` as well · Not on the prompt's list, but it shared the same `.state*` family as the empty/no-match/error branches and it IS an empty state ("there is nothing to show you until you sign in"). Its two actions are unchanged. Wishlist's guest BAND is different and stays as it was, exactly as the prompt says: it sits above a populated list and invites a sign-in rather than reporting an absence.`
- `31 · 2026-09-08 · Faq's empty card lost its `role="status"` · The page already announces the result count in a `role="status"` region directly above the results (`Faq.js:210`). Two live regions saying the same thing is two announcements for one fact. `EmptyState` is deliberately silent by default for the same reason — an empty list is ordinary content, not an event — which is why `role="alert"` belongs to `ErrorState` alone.`
- `31 · 2026-09-08 · `EmptyState`'s default glyph is `mdi:tray-remove`, not the `mdi:leaf-off-outline` first written · Every Iconify name used here was checked against the MDI set through the API; `leaf-off-outline` does not exist (MDI has `leaf-off`), and an icon name that resolves to nothing renders an empty ring with no error. The other fifteen names were confirmed present.`
- `32 · 2026-09-08 · The invoice print stylesheet in `AdminOrders.js` keeps its neutral ink-on-paper colours — the ONE hex exception in the admin · The sheet is injected into a print window, where the ground is white paper. Painting `#0B0B0D`/`#F5D76E` there would come out of the printer as a black rectangle with yellow text, and a tax invoice is a document, not a screen. Five literals remain (`#1a1a1a` body ink, `#ddd` cell rules, `#f5f5f5` head fill, `#666` muted, and the `#1a1a1a` total rule) and the acceptance grep excludes this file for exactly that reason. A comment above the template says so, so nobody "finishes the job" later.`
- `32 · 2026-09-08 · `MOCK_REVIEWERS` and the eight one-click reviewer-name chips under the Add-a-Review form were DELETED, not renamed · They were fabricated shoppers ("Aarav Sharma", "Priya Menon"…), which BRAND.md 3.9 rule 6 forbids outright; renaming them to Assamese-neutral names would have kept the defect. The free-text "Reviewer name" field stays and now carries a helper line ("The name the review is published under."). Verified in the browser: the create dialog holds **0** clickable chips and a typed name still posts.`
- `32 · 2026-09-08 · Rows with `isSample: true` wear an outlined "Sample" chip beside the reviewer name · The two seeded reviews are hidden from the storefront by `brand.flags.showSampleReviews`, so the admin was the only place they could be seen at all — and nothing said they were seed data. Two rows carry it on the tracked fixture.`
- `32 · 2026-09-08 · `buildAdminTheme` keeps a parameter it ignores rather than becoming zero-arity · The prompt asks for the `mode` argument to be dropped; a hard removal would silently change nothing for `buildAdminTheme("dark")` but a linter/reviewer reading the signature would think the mode still exists. Both call sites were updated to `buildAdminTheme()`; the parameter survives only as a commented placeholder so an un-migrated caller cannot break.`
- `32 · 2026-09-08 · The palette is EXPORTED as `ADMIN_PALETTE` (plus `ADMIN_FOCUS_RING`, `ADMIN_GOLD_GRADIENT`, `ADMIN_BRAND_WASH`) · SweetAlert2 renders directly under `<body>`, outside both ThemeProviders, so a per-call `confirmButtonColor` has to be a literal from somewhere. It is now `ADMIN_PALETTE.error.main` at all eight destructive confirms (products, categories, coupons, reviews, FAQs, shipping, leads, hero) plus the logout confirm — one definition, no hex at the call site.`
- `32 · 2026-09-08 · Screen-level accent colours became a `tone` prop naming a PALETTE CHANNEL, never a hex · The dashboard stat cards, the payments summary, the FAQ stat tiles and the lead type badge all took a `color="#6366f1"`-style prop. They now take `tone="primary" | "success" | "info" | "warning" | "error" | "secondary"` and resolve it as `theme.palette[tone].main` / `alpha(…, .12)` at the call site, so the admin has exactly one file that names colours. Cyan (`info`) is spent at most once per screen, per DESIGN_SYSTEM §2's budget.`
- `32 · 2026-09-08 · The three `color: "#fff"` icon labels on gold plates and the two `color: "#fff"` count chips became `primary.contrastText` · The acceptance grep only matches six-digit hex, so these would have survived it — and they are the one class of literal the palette flip actually BREAKS: white on `#F5D76E` is 1.6:1. `primary.contrastText` is `#0B0B0D` (13.4:1). `AdminSettings`' two `grey.400` / `common.white` social-icon tones moved to `text.secondary` / `text.primary` for the same reason.`
- `32 · 2026-09-08 · `AdminHeroSection.js` was recoloured even though it is not in the prompt's file list · The acceptance grep covers ALL of `src/pages/Admin`, and the slide preview held seven literals plus two `var(--sf-*)` reads — the second of which breaks the prompt's own isolation rule ("the admin never imports storefront tokens"). The preview now paints from `ADMIN_PALETTE` (`ADMIN_BRAND_WASH` is the admin's own copy of the brand wash). **The four gradient PRESETS keep their `var(--sf-gradient-*)` values**: those are DATA written into `announcements[].gradient` and resolved by the STOREFRONT, not admin styling. Only the visible title changed ("Home & Hero"); the temporary announcements tab label stays for Prompt 34.`
- `32 · 2026-09-08 · `AdminShipping`'s default carrier ("Shiprocket") and default SLA ("5-7") were blanked · Both are invented facts on a LAMIKAA method — `{{DISPATCH_SLA}}` is an unresolved token and no carrier has been named — and the new-method form pre-filled them into every row an admin created. The table now prints "—" for either when blank rather than a bare chip or the words "days" with no figure. The Shiprocket INTEGRATION card is untouched: that is a real feature, not a default.`
- `32 · 2026-09-08 · Page titles are set through `utils/documentTitle`'s claim/release protocol, not a bare `document.title =` · `StoreSettingsContext` writes the store title on its own schedule; a plain assignment in `AdminLayout` would be overwritten the moment the settings request resolved. `setPageTitle` claims the tab and the claim is released ONCE on unmount (through a ref, so a settings save mid-session cannot hand the tab back while an admin is still on the screen). `AdminLogin` claims "Sign in · Admin · LAMIKAA NATURALS" and does not release — signing in unmounts it straight into `AdminLayout`, which claims the screen it lands on.`
- `32 · 2026-09-08 · `App.css`'s `body.admin-area` block re-states the palette as literals instead of reading tokens · CSS cannot read a JS module, and reading `--sf-*` would breach the isolation rule the prompt sets. The block carries a comment naming `src/theme/adminTheme.js` as the file to keep it in step with. `--swal2-confirm-button-color` is pinned to the ink `#0b0b0d` THERE rather than per call, so a destructive confirm that overrides only the background (`error.main`, `#ff8a80`) still gets a readable label.`
- `32 · 2026-09-08 · The login card is the admin's one pane of glass; the AppBar is "glass-like" but the drawer is not · DESIGN_SYSTEM §10 allows glass on the login card only, and the prompt asks for a glass-like AppBar. The card is `alpha(paper, .72)` + 20px blur, the AppBar `alpha(paper, .88)` + 12px blur (defined once in the theme's `MuiAppBar` override, so no screen re-states it), and both carry an opaque `@supports not (backdrop-filter)` fallback. Nothing else in the admin blurs.`
- `32 · 2026-09-08 · The Products table's two new columns read `heroOrder` and `media[]` off the NORMALISED record, and the old form was left alone · `admin.getProducts()` runs `normalizeProducts`, so both fields are present on every row whatever the stored shape. The Price cell shows a "Price on launch" chip when `priceTBA`. The FORM is Prompt 33's — its `editable` payload still omits `media`/`heroOrder`/`priceTBA`, which survive an edit only because `updateProduct` merges over `editingProduct`. Table `minWidth` 980 → 1160; it scrolls inside its `TableContainer` and the page does not (verified at 360px).`
- `33 · 2026-09-08 · Drag-and-drop is native HTML5 by the HANDLE only, and the DROP reads its source from the dataTransfer, not from React state · A `draggable` row would fight text selection inside its own inputs, which is where a merchant spends every second of their time, so only the 24px handle carries `draggable`. The list is encoded as a custom MIME type (`application/x-lamikaa-media-image` / `-video`) because `dragover` may only read `dataTransfer.types` — that is what lets an image row refuse a video — and the source index rides in `text/plain`, read back at the drop. The earlier version kept the source in React state and would have dropped a reorder whenever dragstart and dragover landed in the same tick; `dragging` now only dims the row being carried. No drag library was added (guardrail: no new dependencies) and the up/down buttons remain the contract for a keyboard, with focus restored onto the moved row's button (its twin when the row has reached an end and the button it pressed is now disabled).
- `33 · 2026-09-08 · The stage-crop fields are exposed, but only behind a disclosure and only on Cloudinary URLs · `crop` is source-PIXEL geometry against a specific multi-megapixel original (`{x:1050,y:100,w:1500,h:3200}` on the face wash): meaningful to whoever measured it, meaningless typed at a picsum link, and `cld()` ignores it on any non-Cloudinary host anyway, so offering the boxes there would be offering a control that does nothing. `isCloudinary(url)` gates the whole disclosure; it is collapsed by default, and an untouched crop is passed through by object spread rather than rebuilt, so the five seeded rectangles survive a round trip byte for byte.
- `33 · 2026-09-08 · The round trip changes `updatedAt` AND adds `image` — the second one is the api layer's, not the form's · `syncProductMedia()` (Prompt 07's contract, called inside `admin.createProduct/updateProduct`) writes the derived `image` mirror next to `media`/`images`, and Prompt 06 seeded db.json without it. So the first save of each seeded product adds `"image": "<primary url>"` and every later save leaves it alone. Every one of the other fifty fields — `media[]` with its crops, posters and `placeholder` flags, `keyIngredients` key order, `priceSource: null`, `ritualStep`, `dimensions: null` — comes back byte-identical, verified in a browser against all eight products. Removing `image` from the write side would have satisfied the acceptance wording exactly, and was rejected: it is Prompt 07's contract, the prompt says `api.js` takes no contract change, and `normalizeProduct()` derives the same field on every read, so the twin invariant in `utils/product.js` would have been the only casualty.
- `33 · 2026-09-08 · The manager edits two lists but always persists ONE array, images first then videos · The PDP gallery reads `media[]` as a single authored sequence, while "which picture leads the card" and "which film opens the story" are two separate decisions, so the UI splits and the record does not. Every commit re-emits `[...images, ...videos]`, which is exactly the shape all eight seeded products already have — the reason opening one and saving it rewrites the same array. Reordering therefore never moves an image past a video, and a video dragged at the image list is refused.
- `33 · 2026-09-08 · Live row validation wins over the save attempt's message on any row that has a URL · The first version preferred the save-time error, and a row fixed one keystroke after a failed save went on insisting "Enter an image URL" — caught in browser QA. A row that is still BLANK is the one case the live pass deliberately stays quiet about (a row added ten seconds ago is not yet a mistake), and that is the only case the save attempt's `errors` now answers.
- `33 · 2026-09-08 · A ritual step with no label and no frequency is saved as `null`, whatever its order number · `emptyProduct` seeds `ritualStep.order = 1` so the field is not blank on a new product, and the first version kept the object whenever any of the three was set. The PDP and the card already skip a labelless step, but `components/cart/CrossSell.js` sorts candidates by `ritualStep.order` — an untouched new product would have joined the routine as its first step and started suggesting what comes next. The order alone is not a name.
- `33 · 2026-09-08 · Tags live at the foot of the Basic section · The prompt lists ten sections and says only that tags stay comma-separated. They are a catalogue/discovery attribute like brand and category, not metadata, so they sit with identity rather than under SEO.
- `33 · 2026-09-08 · Both MUI `Select`s on this screen gained a `labelId` · The `<InputLabel>` alone leaves the control unnamed for a screen reader (WCAG 4.1.2) — found because Playwright's `getByLabel` could not resolve the category select either. Fixed on the new primary-category select and on the pre-existing table filter beside it.
- `34 · 2026-09-08 · The dividend-qualifier check accepts every wording BRAND.md and the SEED actually use, not only the canonical string · Implemented literally ("mentions dividend without 'subject to applicable laws'") the warning fires on TWO blocks that have never been wrong: `whyLamikaa` ("Profits **can** return to members through **declared dividends**", §3.7's ladder) and `impact` ("when **declared** for distribution **in accordance with applicable laws** and company decisions", §3.4 verbatim). A warning that cries wolf on shipped copy is a warning an owner learns to dismiss, which would defeat the guardrail it exists to serve. So `HAS_QUALIFIER` matches `subject to applicable laws` | `in accordance with applicable laws` | `dividend declaration` | `declared dividend(s)`. Verified both ways: **zero** false positives across all twelve seeded blocks, and the warning fires on the exact bad edit the acceptance criterion names (deleting ", subject to applicable laws and the company's dividend declaration" from the About body). The canonical phrase is the one the warning tells the owner to restore.`
- `34 · 2026-09-08 · `MarkdownField` + `ContentHelp` were extracted to `pages/Admin/components/`, not exported from `AdminContent.js` · The prompt says Rituals reuses "the token/preview helper reused from AdminContent". Importing it from the page module would make AdminRituals pull the whole Content screen — its rail, its twelve sections, its generated form — into the rituals chunk, and would couple two sibling pages. `pages/Admin/components/` is where Prompt 33 already put `ListEditor` and `KeyValueListEditor`, so the shared editors stay in one place and neither page imports the other.`
- `34 · 2026-09-08 · `ContentBlocks` is imported from its FILE, not from the `components/ui` barrel · The prompt names `components/ui` as its location. The barrel re-exports all fifteen primitives (Drawer, Modal, VideoPlayer, CloudinaryImage…), so importing it would drag every one into the admin's content chunk for a single component. It is the only storefront component the admin imports besides `Logo`, and it is deliberate: the preview must be the REAL renderer or it is not a preview. It reads `--sf-*` from `:root` (index.css declares them document-wide), so it renders inside its neutral frame exactly as it renders on /about — and the admin's own palette is untouched.`
- `34 · 2026-09-08 · The category delete rule was widened in `api.js` as well as in the screen, and the mock guard now fetches the whole catalogue · The api guard filtered `GET /products?categoryId=<id>`, which cannot see `categoryIds[]` membership at all. That was not theoretical: **"Serums" has 0 products by `categoryId` and 1 by `categoryIds`**, so it was deletable out from under the Black Rice Face Serum. The screen's own check (which names the blocking products before the destructive confirm, as the subcategory check already did) and the api guard now apply the same rule — the one `products.getByCategorySlug` and REPO_MAP §3.4 #2 already document. A stale catalogue in the screen can therefore only ever be less strict than the server, never more permissive.`
- `34 · 2026-09-08 · The "Announcements live" count applies the BAR's gate, not the `isActive` switch · Two of the three seeded rows carry `{{FREE_SHIPPING_THRESHOLD}}` / `{{LAUNCH_OFFER_TEXT}}` and are `isActive: true`, so a switch-only count would report 3 live while a shopper reads 1. `getDashboardStats` (mock) and the Settings summary both apply active + in-window + printable, which is exactly what `AnnouncementBar.isPrintable` does. Verified: the tile reads **1**.`
- `34 · 2026-09-08 · Hero add / reorder / remove all go through ONE `setHeroOrder(ids)` call · Its contract renumbers the list from 1 AND clears `heroOrder` on every product left out of it, so removing a product from the hero is the same gesture as reordering it and no path can strand a stale position or leave a gap. Only the two copy fields save per row (`updateProduct`, spread over the product the way AdminProducts does, because the mock PUT replaces the whole record).`
- `34 · 2026-09-08 · The `slide` transition was dropped from `HERO_TRANSITIONS`; `overlayOpacity`, `heights`, `secondaryCta` and `openers` were dropped from `normalizeHeroConfig` · The prompt specifies `transition (fade/none)`, and `HeroCarousel` only ever special-cases `"none"` — everything else already behaved as a crossfade, so an older record normalising `"slide"` → `"fade"` changes nothing a visitor sees. The four removed keys are read by nothing: `HeroCarousel` reads exactly the ten that remain. `db.json`'s `heroConfig` never carried any of them.`
- `34 · 2026-09-08 · `useSiteContent` refetches on focus and on `site-content:updated`, and a failed REFETCH keeps the words already on the page · The prompt allows either. Focus alone leaves a storefront open in the same tab stale; the event alone misses a second tab. Both together are ~15 lines and the same contract `FaqContext`/`StoreSettingsContext` already have. Only the FIRST read may fall back to the empty state — a refetch that fails must not replace a rendered page with "nothing here yet".`
- `34 · 2026-09-08 · `AdminCategories`' two icon-only row actions gained `aria-label`s · A `Tooltip` labels the pointer, not a screen reader (WCAG 4.1.2) — the same defect Prompt 33 fixed on that screen's selects. Found because Playwright could not address the buttons by name either, which is the same problem stated twice.`


- `35 · 2026-09-08 · The five legacy token aliases were DELETED rather than re-pointed, because every one had zero consumers · The prompt's Task 1 says to grep the consumers of --sf-color-brand-green / --sf-color-brand-green-deep / --brand-logo-bg and replace them with --sf-color-surface, and to rewrite the --sf-cat-* / --sf-gradient-announce-1/2/3 / --sf-gradient-heritage consumers onto their new names. There were none: Prompts 03–34 had already moved every consumer as they rebuilt each component, leaving the aliases declared but unread (`grep -rn -- "--sf-gradient-heritage\|--sf-gradient-announce-\|--sf-cat-\|--sf-color-brand-green\|brand-logo-bg" src` outside storefront-tokens.css → 0). So the rename was a no-op and only the declarations came out. `--sf-color-emerald*` was the one alias with live consumers (13 call sites) and it WAS renamed.`
- `35 · 2026-09-08 · .sf-btn--gold was merged into .sf-btn--primary and NOT kept as an alias · The prompt asks the question and answers it itself ("keep .sf-btn--gold as an alias for one more prompt? No: rename all usages now and delete the alias"). Both class names only ever existed in storefront-primitives.css's own rule; the single JS consumer is Button.js's VARIANT_CLASS.primary. Nothing outside the primitive named either one, so the merge cost nothing.`
- `35 · 2026-09-08 · RETIRED_CATEGORY_SLUGS and the /sarees redirect were deleted; /collections and /collections/* were kept · The three slugs ("muga-silk", "pat-silk", "eri-silk") and "/sarees" are literal Meghali catalogue identifiers, which is precisely what this prompt sweeps, and the acceptance grep must reach zero with them present. Behaviour change is confined to four URLs: /products?category=<one of the three> now lands on /category/<slug>, which Prompt 24 already answers with a real 404 — the same answer every other unknown slug and every typo already got, so the rule is now uniform rather than special-cased for three of infinitely many dead slugs; /sarees now 404s instead of redirecting to /shop. The alternative — an allowlist of live LAMIKAA slugs — was rejected because categories are admin-editable and API-loaded, so a hard-coded list would be a second source of truth that drifts the moment a merchant renames one. /collections and /collections/* name no brand and stay. routes.test.js's slug assertion became a rule assertion (the redirect table names no category slug at all). Recorded because it is the one user-visible behaviour change in this prompt.`
- `35 · 2026-09-08 · api.live.test.js's BASE_URL assertion was LEFT as the generic /^https:\/\/.+\/api\/v1$/ pattern instead of being pinned to https://core.lamikanaturals.com/api/v1 · The stale assertion this prompt targets (`toBe("https://core.meghalisilk.in/api/v1")`, BRAND_FOOTPRINT §1) was already replaced by a later prompt, so no Meghali host survives — the brand-cleanup objective is met either way. Pinning the production host would actively contradict two standing rules: the suite WRITES to whatever it is pointed at, and baseURL.js:21-22 says never to point it at production. The production URL is now named in the assertion's comment instead, so the .env.production link the prompt wants is documented without demanding a destructive run against production. Task 4's other items were already satisfied by Prompts 07/34: the API resource is `announcements` (no `banners` anywhere in src), products assert `media`/`images`, and category slugs and hero keys are derived from live data rather than hard-coded.`
- `35 · 2026-09-08 · The four "Prompt 12" comment references were KEPT · The acceptance grep asks for `grep -rn "…\|Prompt 12\|Prompt 01" src` → 0, but Task 3 names the actual target: "the retired prompt programme (\"Prompt 12 hero\", \"Prompt 01 demoted\")". No such comment exists. All 234 "Prompt NN" references in src cite THIS programme, including the four Prompt 12 ones (CartDrawer.js:39 "IT IS ui/Drawer NOW (Prompt 12)", QuantityStepper.module.css:4, constants.js:158, SpecialOffers.module.css:69) — every one accurate. Deleting four of 234 identical, correct citations would strip real history for a grep proxy; the retired-programme references the criterion was written for are genuinely absent. Flagged here rather than silently satisfied.`
- `35 · 2026-09-08 · Unused cross-module named exports were NOT pruned · Task 6 scopes this to "unused exports flagged by npx eslint src --rule 'no-unused-vars: error' (CRA's config already errors on unused vars under CI — run the build)", which is an IN-FILE check; the build is clean with no warnings, so that check passes. A separate scan for named exports with no importer anywhere in src returns ~33 files' worth, but they are overwhelmingly deliberate shared-library surface (utils/helpers.js alone has 20: throttle, groupBy, formatRelativeTime, validateForm…), test-support hooks (__resetScrollLock, __resetOverlayFlag) and cross-context event names. Pruning them is a functionality decision, not a brand cleanup, and the guardrail forbids removing a feature for tidiness — left for Prompt 39's parity pass. PRODUCT_FLAG_MARKS is on that list and the prompt explicitly says to keep it.`
- `35 · 2026-09-08 · The BRAND_FOOTPRINT §2 status column is a per-FILE line, not a per-hit column · §2 is 700 lines of bullets, not a table; adding a column to each of the 531 hit bullets would have meant rewriting the whole section for no added signal. Instead §0's summary table gained a Status column with a legend, and each of the 62 `#### file` headings in §2 gained a bold status line — "done (35)" for the code groups D–J, "cleared — verify in 36" for the content/asset groups A–C, which Prompt 36 owns. Every group is in fact at zero: §3's verification was re-run repo-wide and over build/ and both return nothing.`

## Open TODOs

Carry-overs that a later prompt (or the developer/owner) must pick up (format: `NN · item · owner · target prompt`).

- `16 · The live Laravel database still holds the PRE-CORRECTION `media[0].crop` rectangles for five products (soap, body wash, face mask, face scrub, face serum). Mock mode reads the fixed values from db.json; live mode will still show a white stripe on the soap plate, white corners on the body wash, white rules on the face mask, a light-grey letterbox on the scrub and a clipped gold band on the serum until it is reseeded from PRODUCTS.md §2. No schema change — five JSON values. · backend/owner · 39`

- ~~`20 · `ImpactTriptych showImages` is shipped but only exercised as `false` …` · **RESOLVED by Prompt 28**~~ — `showImages` is on in two places now (`/about` §4 and `/why-lamikaa#impact`) and both were walked at 360–1440 with no horizontal scroll. The photographs themselves still cannot be SEEN in this sandbox (see the Prompt 28 entry below).
- ~~`21 · `pages/HelpCenter/HelpCenter.js` and `pages/ProductDetails/ProductDetails.js` still hand-roll their own FAQ accordions …` · **RESOLVED by Prompts 27 and 28**~~ — the PDP mounts `<FAQ faqs={faqs} headingLevel={3}/>` (27) and `pages/HelpCenter/` is deleted, replaced by `pages/Faq/Faq.js`, which mounts one `<FAQ>` per group (28). **One accordion implementation now holds for the whole site.**
- `21 · `{{RETURN_WINDOW_DAYS}}` resolves from `STOREFRONT_CONFIG.returnsWindowDays`, which still holds the boilerplate **7**, so "You can request a return … within 7 days of delivery" now prints on the HOME page as well as on `/faq`, the PDP panel and the refund policy. The token itself never prints either way (verified: no `{{` anywhere on the page). Owner to confirm the window, or set 0 for "no returns" — at 0 the sentence drops and the answer keeps its second half. · owner · 39`
- `20 · No placeholder photograph could be seen rendered in the browser in this sandbox — `res.cloudinary.com` and `picsum.photos` reset Chromium's TLS tunnel through the agent proxy (curl gets 200), the same limitation Prompt 19 recorded. Nothing in this section depends on one, but the home page's images as a whole want one run on a developer machine. · developer · 37`

- `01 · Baseline works: add to cart from a card (guest, 0 → 1) and from the PDP (5 → 6 items); quantity + in the drawer (6 → 7); remove line (7 → 2); coupon MUGA500 (−₹500.00 — savings −₹3,500 → −₹4,000, total ₹18,500 → ₹18,000); checkout through all four steps to an order confirmation on COD (ORD-MTPU49W5-8QEA); that order then listed in /orders (4 rows) and in Admin → Orders (12 rows); wishlist toggle as guest (0 → 1) and as a signed-in user (1 → 0 → 1, both directions); search "Muga" (26 product links); light/dark toggle (body "dark react-loaded" ↔ "react-loaded light" — to be removed by Prompt 03); review from a delivered order (created review id 13, product 22, rating 4, status "pending"); cancel a processing order (ORD-MTPU49W5-8QEA → fulfillmentStatus "cancelled", paymentStatus "voided" — the cascade ran); address book in /profile → Addresses: add, edit (city Guwahati → Jorhat, persisted) and delete all confirmed against the API. · developer · —`
- `01 · db.json product 1 ("Sualkuchi Muga Mekhela Chador — Natural Gold") carries corrupted prices in the committed seed: price 41, comparePrice 380000000000, variants ₹3,25,00,00,000 and ₹3,35,00,00,00,000 (the PDP renders them). Left as-is — Prompt 06 reseeds db.json wholesale — but do not treat these numbers as a pricing reference. · Prompt 06 · 06`
- `01 · No user has a delivered order in the committed seed (user 1: shipped ×2, cancelled ×1). To exercise "review from a delivered order" the baseline had to PATCH one order to shippingStatus "delivered" (OrderHistory.js:72 derives the status from that field, :313 gates reviewing on it). Worth seeding at least one delivered order so the review path is reachable out of the box. · Prompt 06 · 06`
- `01 · Storefront placeholder images are served from placehold.co; a first capture run logged intermittent ERR_NAME_NOT_RESOLVED for them at 1280 px (clean on re-run). Not a code defect — but the Prompt 06 seed should prefer the hosts verified below. · Prompt 06 · 06`
- `02 · Eight files still carry the literal "Meghali" in a comment or a header docblock: AuthModal.module.css:12, BottomNav.module.css:2, ErrorBoundary.js:42, Footer.module.css:2, Header.module.css:2, SidebarMenu.module.css:2, storefront/ProductCard.js:17, theme/tokens.js:59. None was touched by Prompt 02 (the prompt's own verification grep excludes them), and each belongs to the prompt that rewrites its file — but Prompt 35's sweep must close all eight. storefront-tokens.css keeps two more (palette headings) which Prompt 03 rewrites. · Prompt 35 · 35`
- `02 · db.json still seeds the old identity, so mock mode shows Meghali contact rows, tagline, store name and social marks, and the document title comes from settings.seo.metaTitle. Every one of those resolves to the brand.js values (or hides) the moment the API is unreachable, which is how it was verified. · Prompt 06 · 06`
- `02 · TrustStrip and the Home promises row still render the old four badges rather than brand.trustBadges (TrustStrip keeps its own list; Home maps TRUST_BADGES, which is now the three LAMIKAA badges). The Footer promise row was switched to brand.trustBadges[0] in this prompt. · Prompt 15 · 15`
- ~~`03 · The AnnouncementBar is now a full-bleed CHAMPAGNE GOLD band …` · **RESOLVED by Prompt 09**~~ — the bar is a 36px 4%-white glass band on `--sf-color-text-secondary` type with one gold dot, so gold is back inside the §2 balance budget. `--sf-gradient-announce` stays declared and unused; Prompt 35 can retire it.
- `03 · Eight files still carry the literal "Meghali" in a comment or docblock, down from the sixteen Prompt 02 recorded: AuthModal.module.css and ErrorBoundary.js and theme/tokens.js and the five module headers listed there are now clean (this prompt touched them). What remains is in files this prompt did not touch — Header.module.css:2, storefront/ProductCard.js:17 and the six page docblocks under src/pages that carry no theme code. Prompt 35's sweep still owns them. · Prompt 35 · 35`
- `03 · adminTheme.js still builds the indigo/slate admin palette from a (mode) ternary whose light half is now unreachable. Prompt 32 recolours the palette to LAMIKAA and should drop the parameter at the same time (both callers pass the literal "dark"). · Prompt 32 · 32`
- `03 · Two aliases exist only to keep un-rebuilt components compiling and must die with them: --sf-color-brand-green-deep (**Footer and Newsletter came off it in Prompt 13** — the footer now grounds on `--sf-color-surface` and `components/Newsletter/` is deleted; HeroSection and CTASection remain, and both die with Prompts 14 and 22) and --brand-logo-bg (declared, currently consumed by nothing). --sf-gradient-heritage, --sf-gradient-announce-1/2/3 and --sf-cat-* are in the same position. · Prompt 35 · 35`
- `03 · colors.js exports `DARK = PALETTE` purely for compatibility; nothing imports DARK any more (ThemeContext moved to PALETTE in this prompt). Drop the alias. · Prompt 04 · 04`
- `03 · The type scale, font families and --sf-font-light are unchanged on purpose — DESIGN_SYSTEM §6 is Prompt 04's contract. storefront-tokens.css still names Cormorant Garamond and Inter, and index.html still loads them. · Prompt 04 · 04`
- `04 · Small UI labels below 14px survive in component CSS this prompt may not touch (Task 8 restricts fixes to the scale tokens and the base layer). Measured at 1280px: Header .navLink 11px/500 and .navMoreCount 11px/500 (Header.module.css:269,323 — hardcoded 0.6875rem, not a token); AnnouncementBar .message, TrustStrip .label, the section eyebrows and Footer .colTitle at 12px/500 (--sf-text-xs, which DESIGN_SYSTEM §6 fixes at .75rem); breadcrumbs, "We accept" and "Secure payment" at 12px/400. None is body copy and none is light-weight (the 300 tier is gone), so the acceptance criteria hold — but the 11px pair in particular should not survive the header rebuild. · Prompts 09 / 13 / 23 / 28 · 09`
- `04 · The "SOFT" 30 decision is reversible in two lines and is the owner's call: swap the Fraunces URL in public/index.html for family=Fraunces:opsz,wght,SOFT@9..144,400,30;9..144,500,30;9..144,600,30 and add font-variation-settings: "SOFT" 30 to the h1,h2 rule in src/index.css. Cost: +54KB on the latin subset. · owner · 38 (perf audit decides)`
- `04 · .gradient-text in App.css is superseded by the .sf-gradient-text primitive (which clips the SIGNATURE gradient and carries a background-clip fallback) and has zero consumers under src/. Kept unrenamed because it is a global class name; delete it with the rest of the legacy layer. · Prompt 35 · 35`
- ~~`04 · … three components still carry their own hand-rolled clamps for display type …` · **RESOLVED**~~ — `HeroSection` died with Prompt 14, `ProductDetails .productName` moved onto the tokens in Prompt 25, and the AboutUs hero went with the folder in Prompt 28. `pages/About` and `pages/WhyLamikaa` set their titles from `--sf-text-3xl`/`-4xl` and clamp only the BAND HEIGHT, which is a layout figure and not a second type scale.
- `04 · The QA in this prompt ran against a build made with REACT_APP_USE_MOCK_API=true forced in the shell, because CRA loads .env.production over .env for `npm run build` and the committed .env.production points at the live Laravel API (unreachable from here). The tree ships unchanged — the final verification build used the normal config. Worth knowing before anyone tries to reproduce the screenshots. · developer · —`

- `05 · `/_playground` (route in App.js + `src/pages/_Playground/`) is TEMPORARY scaffolding and must be deleted with its route and its import. · Prompt 35 · 35`
- `05 · Nothing has been migrated onto the primitives yet, deliberately (prompt guardrail) — only `PriceBlock` was touched. `CartDrawer`, `AuthModal` and `ReviewModal` still carry hand-rolled copies of the focus trap (`SidebarMenu`'s went in Prompt 10, `SearchModal`'s in Prompt 11) (`CategoriesDrawer`'s went with the file in Prompt 09) that `useFocusTrap` now owns, and their own scroll locks (`document.body.style.overflow`) rather than `useScrollLock`'s reference-counted `body[data-scroll-lock]`. Each migrates in its own feature prompt. · Prompts 09–12, 30 · 09`
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
- `07 · faqsForGroup() now HAS its consumer — `/faq` renders one section per `siteContent.faqPage.groups[]` entry (Prompt 28), and the seeded `brand`/`products`/`orders` keys each become a heading (`account` has no rows and is skipped). What is still missing is the ADMIN CONTROL that sets a row's `group`: until Prompt 34 an owner cannot re-file an answer, and a row filed under a key nobody has configured lands in the page's trailing "More questions" section. · Prompt 34 · 34`
- `07 · The twenty live routes in REPO_MAP §3.4 do not exist on the Laravel side yet, so Mode B is INCOMPLETE until the backend team ships them. Until then `npm run test:live` will fail on the new tests even against a correct staging host — that is the point of writing them now. · Backend team / owner · 39`
- `07 · No .env.local and no staging host exist, so no api.js function has ever executed against a real Laravel API in this programme. Every "both modes" claim from here on rests on the mock run plus the §3 review. The first staging URL the owner provides should be spent on a full `npm run test:live`. · Owner · 39`
- `07 · products.search() is still json-server's `?q=` in mock mode, which matches ANY field of a record (a query can hit an ingredient list or a meta description and rank as highly as a name). Ranking is deliberately left to the caller — **`src/utils/search.js` exists as of Prompt 11**, and BOTH search surfaces (overlay and `/search`) rank client-side from `products.getAll()` rather than calling `products.search()` at all. The function is now unused by the storefront; a server-side `GET /products?search=` is still the answer if the range ever outgrows a linear pass, and its field list is documented at the function. · Prompt 39 / backend team · 39`
- `07 · admin.setHeroOrder clears `heroOrder` on every product not in the list it is given. That is the documented contract (dropping a product out of the carousel is the same gesture as reordering it), but it means a caller that passes a PARTIAL list silently empties the rest of the hero. The Prompt 34 editor must always send the full order. · Prompt 34 · 34`

- `08 · **ONE** ComingSoon stub is left, at **/cart**. /search left the list in Prompt 11, /rituals + /rituals/:slug in Prompt 24, and **/why-lamikaa in Prompt 28** (`pages/WhyLamikaa/WhyLamikaa.js`). It renders "This page is being built (Prompt 29)" and is noindex; Prompt 29 takes the last one, then Prompt 35 verifies no route still points at pages/_ComingSoon and deletes the folder. · Prompt 29 · 29`
- ~~`08 · /search is a stub, so the search OVERLAY is the only search surface until Prompt 11 …` · **RESOLVED by Prompt 11**~~ — `/search?q=` is a real results page and Enter (or "See all N results") lands on it. The one temporarily reduced storefront capability is restored.
- ~~`08 · pages/AboutUs/AboutUs.js still carries the Meghali silk story end to end …` · **RESOLVED by Prompt 28**~~ — the folder is deleted along with six more (`HelpCenter`, `Support`, `PrivacyPolicy`, `TermsOfService`, `CookiePolicy`, `RefundPolicy`), and `grep -rn "Galleria\|Kolkata, West\|Sualkuchi\|National Handloom" src` returns **0**.
- `08 · pages/Products/Products.js still carries FABRIC_FAMILIES (Muga/Pat/Eri/Toss Silk) and its "Fabric" facet. It renders NOTHING with the LAMIKAA seed (availableFabrics is empty, so the chip group and the drawer section are both hidden) — it is dead code that Prompt 23 deletes with the page. · Prompt 23 · 23`
- ~~`08 · The temporary `categorySlug` prop on pages/Products/Products (and the CategoryRoute wrapper in App.js) …`~~ · **RESOLVED by Prompt 23** — `pages/Products/` is deleted and the route is `<Shop mode="category" />`; Prompt 24 gave it its head, its breadcrumb, its JSON-LD and its 404.
- `08 · RouteFallback is a STOREFRONT-token skeleton and it is also what the admin's <Suspense> shows while an admin chunk loads. It reads correctly (the tokens are global) but it is not the admin's own idiom. Give the admin its own fallback when the shell is rebuilt. · Prompt 32 · 32`
- `08 · The PDP still runs its own hand-rolled title + meta[name=description] effect (ProductDetails.js), which is NOT `data-seo`-tagged and so is the one writer outside useSeo. The prompt says to leave it; Prompt 25 replaces it (and Prompt 27 adds the product JSON-LD). Until then the PDP has no canonical, no og:* and no JSON-LD. · Prompt 25 · 25`
- `08 · /_playground has no useSeo call, so it shows the store title from settings and the static index.html og:* set. Deliberate — it is scaffolding, and Prompt 35 deletes it. · Prompt 35 · 35`
- `08 · Home's ?highlight= rails and the shop's ?sort=/?page=/?per_page= params still work because /shop IS the old listing. Prompt 23's chaptered shop has no sort, filters or pagination — it must also decide what happens to a bookmarked /shop?sort=newest (drop the param, or 404 it). · Prompt 23 · 23`
- ~~`08 · … the TrustStrip still reads "AUTHENTIC SILK" …`~~ — **RESOLVED by Prompt 15** for the strip: `TRUST_ITEMS` is gone and the four promises are `brand.trustBadges` + `brand.originBadge`. (`grep -n "Authentic Silk\|Handwoven" src/components/TrustStrip/TrustStrip.js src/theme/tokens.js` → 0.) The AnnouncementBar half was closed by Prompt 09.
- ~~`09 · `.sf-chip` never declares `text-decoration: none` … every later chip-as-link will hit the same thing. · Prompt 35`~~ — **RESOLVED by Prompt 15**: the reset is now on `button.sf-chip, a.sf-chip` in `storefront-primitives.css`, where the geometry lives. `MegaPanel.module.css .concernChip` keeps its local copy; it is redundant, not wrong, and Prompt 35 can drop it.
- `09 · Two `nav` landmarks are named "Shop": the header's (`aria-label="Shop"`, which this prompt's spec mandates) and the Footer's shop link column (`aria-labelledby` → its own `<h2>Shop</h2>`). axe flags `landmark-unique` (moderate) on the WHOLE document; scoped to the header it is clean, and the pair predates this prompt — the old masthead used the same label. The Footer is rewritten by Prompt 13, which should name its columns something a landmark list can tell apart (e.g. "Footer — Shop"). · Prompt 13 · 13`
- `11 · `ui/Modal` now raises `body[data-drawer-open]` for EVERY modal, not only the search overlay. Today the only other consumer is `/_playground`, but `AuthModal` and `ReviewModal` migrate onto the primitive in Prompt 30 and will start withdrawing the header's blur too — which is correct, and worth seeing once when it happens. · Prompt 30 · 30`
- ~~`11 · `PriceBlock`'s `role="status"` fires for EVERY "Price on launch" chip … the card should too when Prompt 15 rebuilds it · Prompts 15 / 38`~~ — **RESOLVED by Prompt 15**: `ProductCard` renders `<Price product={p} size="sm" live={false} />`, so a grid of eight unpriced products is now zero live regions. The Prompt 38 half (confirm nothing else announces a static price) stands.
- `11 · The overlay ranks the WHOLE catalogue on every keystroke with no debounce, which is right for eight products and wrong for eight hundred. The threshold is a linear pass over nine fields per product; past a few hundred products the answer is the server endpoint documented at `products.search()` (REPO_MAP §3.4), not an index in `utils/search.js`. · Owner / backend team · 39`
- `11 · `stageSrc(p, { w: 112 })` requests a 112px-wide crop for a 56px plate (2× for retina) but no `srcSet`, because the row thumbnail is one fixed size at every breakpoint. If the row ever becomes fluid, it should move onto `ui/CloudinaryImage` like the rest of the media layer. · Prompt 37 · 37`
- `11 · The Iconify sets the overlay uses (`mdi:magnify`, `mdi:close`, `mdi:cart-plus`, `mdi:arrow-right`) are fetched from the Iconify API at runtime, so in the sandbox used for this prompt's QA they did not paint — the screenshots were re-taken with the assets relayed through the agent proxy. Every icon-only control carries an `srLabel`, so nothing loses its accessible name offline; whether to bundle the set is still Prompt 38's call (carried from Prompt 05). · Prompt 38 · 38`
- ~~`12 · `src/config/brand.js:109` still carries the announcement string "Free shipping over ₹{{FREE_SHIPPING_THRESHOLD}}" … Confirm the announcement row hides correctly once the footer band is rebuilt on the live read.`~~ — **PARTLY RESOLVED by Prompt 13.** The footer half is gone: the promises band was deleted with the rest of the old footer, so no footer surface quotes a threshold at all. `AnnouncementBar` filters that row out through `isPlaceholder` (AnnouncementBar.js:50, unchanged), and the token string is still the only `FREE_SHIPPING_THRESHOLD` hit in `src/` besides `fillStoreCopy`'s own emit — the CONSTANT is now deleted (see the Prompt 13 record). What is left is the trust-strip half below.
- `12/13 · The free-shipping promise row has NO home right now. Prompt 13's spec deletes the `TRUST_ITEMS` band from the footer outright ("the trust strip lives on the home page"), so nothing on the storefront currently states the promise. Prompt 15 builds `TrustStrip` and should re-attach it to `shipping.getMethods()` the way the cart tray's meter does — `freeShippingThreshold()` is exported from `CartDrawer.js` and should move to a shared util when that second consumer appears. · Prompt 15 · 15`
- `12 · Any `@testing-library/react` render in this repo makes Jest print "Jest did not exit one second after the test run" / "A worker process has failed to exit gracefully". Reproduced with a one-line `render(<span>hi</span>)` test, so it is React 18's scheduler holding a jsdom `MessageChannel`, not the new tests. Exit code is 0 and CI passes. Prompt 39 owns the test harness and should add `src/setupTests.js` (jest-dom + the MessageChannel teardown) before it adds the App smoke test. · developer · 39`
- `12 · The tray's shipping and catalogue reads are cached for the life of the MOUNT (Header keeps `CartDrawer` mounted for the session). An admin changing `freeAbove` or activating a product mid-session is not seen until a reload. Acceptable for the meter; revisit with the cart PAGE, which will want the same reads. · developer · 29`
- `13 · `PHONE_QUERY = "(max-width:480px)"` in `Footer.js` and the `@media (max-width: 480px)` / `@media (min-width: 481px)` pair in `Footer.module.css` are the SAME breakpoint written twice, in two languages, with nothing to keep them in step: change one and the disclosures render inside a two-column grid. `BREAKPOINTS.XS` in constants.js is already 480 and is not consumed by either. The responsive pass should give the repo one place to express a breakpoint for JS and CSS together. · Prompt 37 · 37`
- `13 · The footer's `categories.getAll` + `rituals.getAll` are cached for the life of the PAGE LOAD (a module-level promise), so an admin publishing a category or a ritual mid-session does not see it in the footer until a reload — unlike the contact block and the social marks, which refetch on focus through `StoreSettingsContext`. Same trade-off `MegaPanel.loadMegaPanelData` already makes, and the same fix would serve both: a shared catalogue context with the contexts' focus-refetch. · developer · 39`
- `13 · The footer fires two GETs at MOUNT on every page, for a band that is below the fold everywhere. `hooks/useInView.js` exists and would defer them to first approach; it was not used here because the columns are the site's link graph and a crawler executing JS should meet them without scrolling. Worth measuring in the performance audit before changing. · Prompt 38 · 38`
- `13 · `LegalNote`'s `compact` variant is written and styled but has no consumer yet — Prompts 17, 25 and 28 are the ones the prompt names for it. If none of them wants it, delete the branch rather than leave dead CSS. · Prompts 17 / 25 / 28 · 28`
- `15 · The `12/13` free-shipping TODO is NOT closed by this strip and could not be: the prompt fixes its four items as `brand.trustBadges` ×3 plus the provenance line, none of which is shipping, and `shipping_methods[0].freeAbove` is still `null` so a shipping promise would hide anyway. The announcement bar and the cart tray's meter remain the two surfaces that state it, both hiding while the threshold is unknown. Re-decide when the owner sets `freeAbove` in Admin → Shipping (a fifth strip item, or a fifth `STOREFRONT_CONFIG.trustBadges` id — `freeShipping` is already in `TRUST_BADGE_CATALOG` with its `dynamic` resolver). · Owner / Prompt 22 · 22`
- `15 · The WISHLIST's plates show the WHOLE cover shot letterboxed, not the label crop. `buildWishlistItem` snapshots `image` (the raw cover URL) and not `media[].crop`, so `stageSrc` has no crop to apply and `c_pad,ar_1:1,b_auto` letterboxes the full frame onto a light sampled ground — honest (the pack is never sliced) but the pack reads small and the plate is a pale block on a dark card. Two fixes, both outside this prompt: reconcile the wishlist rows against the live catalogue exactly as `Home.js` already does for recently-viewed (also fixes the stale-snapshot 404 the Home comment describes), or snapshot the primary `crop` in `WishlistContext.buildWishlistItem`. The first is the smaller change and belongs with the wishlist restyle. · Prompt 30 · 30`
- `15 · `/shop?concern=<slug>` is a live link from eleven chips but the listing does not read the param yet — every chip lands on the unfiltered `/shop`. Expected (Prompt 23's chaptered listing reads it), recorded because the chips are now a prominent home-page surface rather than one column of the mega panel. · Prompt 23 · 23`
- `15 · `ShopByCategory` fetches on MOUNT, not on approach, and does not cache. It is the first section under the fold and it makes four GETs on every home render; `hooks/useInView.js` exists and `MegaPanel`'s module-level `loadMegaPanelData()` already caches three of the same four collections for the life of the page load. Sharing that cache (or lifting it to a small `catalogueCache` util) would take the section to zero extra requests on a page whose header has already fetched them. Not done here because the mega panel's cache is `Header`-owned and lifting it is a change to a shipped component. · Prompt 22 · 22`
- `15 · The `.sf-flag` TRENDING / HOT marks in `ProductCard`'s eyebrow row have never been SEEN in the LAMIKAA palette — no seeded product carries either flag, so the QA pass could not exercise them. Flip `trending: true` on one product in `db.json` (or in Admin → Products) and check the mark against the gold step numeral and the concern chips beside it. · Prompt 37 · 37`
- `15 · `sizes` on the card's plate is ONE string for every grid the card lands in ("(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 768px) 45vw, 50vw"). It is right for the 4-up walls and the two-up phone grids and slightly generous for the PDP's related rail and the home snap rails, which are narrower. Worth re-measuring once Prompt 16's showcases and Prompt 23's shop fix the final column counts. · Prompt 23 · 23`
- `15 · Sections 1-6 of `pages/Home/Home.js` still carry pre-rebuild copy — the collections lede ("From everyday Eri to heirloom Muga — start with the drape that suits the day.") and the whole OUR CRAFT band ("Muga is reared nowhere else on earth…", "a handloom in Sualkuchi, Assam's silk village"). Left deliberately: the prompt's own wording is "the remaining old sections stay until Prompt 22", and replacing them now would be that prompt's work done blind. Five lines, all inside `Home.js`. · Prompt 22 · 22`

- `17 · The `ContentBlocks variant="editorial"` drop cap sets the About copy's opening word as a large gold "L" followed by "AMIKAA Naturals is a farmer-owned…". It reads correctly as a drop cap, but the wordmark is the one word in the brand where splitting the first letter is worth a second opinion — and the same paragraph opens the About page. Show the owner the home band at 1280 and the About page side by side; if it should go, the fix is a `.copy .blocks p:first-of-type::first-letter` reset (0,2,2 beats the variant's 0,2,0) rather than dropping to `variant="prose"`, which would also lose the wider measure. · owner/Prompt 28 · 28`
- `17 · At 769–1024px the About band's photograph is the full measure (984×615 at 1024) because the two-column grid only starts at 1025px, which is what the prompt specifies. It reads as an editorial opener and the placeholder is standing in for real Assam landscape photography, so it was left — but it is the largest single image on the home page at that width and is worth a look with the real photograph before the responsive pass signs it off. · developer · 37`
- `17 · External images (picsum.photos, res.cloudinary.com) are blocked from the BROWSER in this sandbox even though `curl` reaches them (200) — no request is issued and no error fires, so the About band's landscape could not be seen with the real asset. Every geometry check was run against a locally-served stand-in of the same 16:10 shape, and the broken-image path was exercised separately by aborting the request (`onImageError` swapped in the shared placeholder). Re-check the wash and the gold lamp against the real Picsum frame on a developer machine. · developer · 37`
- `18 · The eight "Carried by" plates and the ritual step thumbs render EMPTY in this sandbox: `res.cloudinary.com` answers `net::ERR_CONNECTION_RESET` to the browser (curl reaches it), so `onImageError` swaps in `PLACEHOLDER_IMG`. Same for the gold check glyphs — `@iconify/react` fetches `mdi:check-circle-outline` at runtime and its API is unreachable here, so the reserved 20px boxes stay empty. Both are environment limits, not defects: the geometry, the colour and the box reservation were all measured in Chromium and are correct. Re-look at both on a machine with outbound HTTPS · developer · 37
- ~~`18 · A ritual card links to `/rituals/<slug>`, which is a stub until Prompt 24 builds the page`~~ · **RESOLVED by Prompt 24** — `/rituals/:slug` is `pages/Rituals/RitualDetail`, and every `RitualCard` on the home teaser and in the shop's closing panel now lands on a real page.
- ~~`18 · `RitualCard`'s `compact` variant (no photograph) has no consumer yet`~~ · **RESOLVED by Prompt 23** — `catalogue/BuildRitualPanel` renders three of them as the shop's closing panel. (Prompt 24's rituals INDEX deliberately does not use the card at all: see the decision above.)

- `19 · The full-page CTA's background photograph could not be seen with the real asset: `picsum.photos` answers `net::ERR_CONNECTION_RESET` to the browser in this sandbox (curl reaches it with a 200). Every measurement — the wash, the 12% gradient, the card ground, all six contrast figures — was taken against a locally-served stand-in chosen to be the WORST case (near-white with dark bands), so the real frame can only improve them. Look at the composition once against `picsum.photos/seed/lamikaa-cta/1920/1080` on a machine with outbound HTTPS · developer · 37`
- `19 · At desktop the card measures 1060px and the section 1188px, so a 900px laptop scrolls ~290px through a section whose floor is 100svh. It is inherent to `--sf-text-4xl` inside a 760px card (each signature line wraps to two), not to the implementation — see the decision above. If the owner wants the whole card on one screen, the levers are the card's max-width or the headline token, and Prompt 22's assembly pass is where the home page's vertical budget is decided as a whole · Prompt 22 · 22`
- `19 · `NewsletterForm`'s `buttonLabel` prop has no consumer yet — both call sites take the "Subscribe" default. It is built to the prompt's contract for a later surface (a policy page footer, a post-purchase capture) · owner of 28 · 28`
- `19 · The reduced-motion and scrim fixes both landed in `theme/storefront-primitives.css`, which is shared. Neither changes a look that any component asked for — one stops an animation with reduced motion on, the other stops a wash dimming its own text — and `BottomNav` (the only other `.sf-glass--scrim` user) was re-checked in Chromium at 390px. Worth one pass over the hero with reduced motion on during the responsive/a11y sweeps · developer · 37`

- `22 · **Lighthouse mobile Performance on `/` is 68, not the ≥85 the prompt targets.** The cause is measured, not guessed: with every asset served locally (<150 ms per request) the LCP image itself loads in **3.5 ms**, and LCP ≈ FCP + 0.5 s — the page is bounded entirely by time-to-first-render of the **249 kB gzipped main bundle** under Lighthouse's simulated slow-4G + 4× CPU. Source-map analysis of that bundle: framer-motion 381 kB, `@mui/material` 225 kB + `@mui/system` 80 kB, `@remix-run/router` 213 kB, sweetalert2 169 kB, `services/api.js` 143 kB, axios 105 kB, `@iconify/react` 53 kB (uncompressed source bytes). MUI is still there because the STOREFRONT shell imports it — `components/Header/Header.js`, `Header/HeaderActions.js`, `Footer/Footer.js`, `context/ThemeContext.js` and `App.js`'s `<CssBaseline/>`. Getting to 85 means taking MUI / sweetalert2 / framer-motion off the storefront's eager path, which is a refactor of Prompts 03/09/13's work spanning the whole shell, not this page. Everything inside this page's own scope was done and is measured above (nine lazy chunks, the shimmer fix, the dead font stylesheet, the Cloudinary preconnect, the lazy admin shell) · owner of 38 · 38
- `22 · `@iconify/react` fetches its icon data from a THIRD-PARTY API at runtime, on the storefront's critical path. The Lighthouse trace shows six such requests on `/` (`api.simplesvg.com`, `api.unisvg.com`, `api.iconify.design` — the library's fallback chain), issued by components that are above the fold (`Header`, `BottomNav`, `AnnouncementBar`, `TrustStrip`). Bundling the icons offline (`addCollection`, or the `@iconify-icons/*` packages) would remove the dependency entirely; it touches 18+ files built by Prompts 09–21, so it is not this prompt's to do · owner of 38 · 38
- `22 · Footer link targets are 18–21 px tall (`Footer_footerLink`, `Footer_microLink`) and the header logo link is 40 px, below the 44 px the QA sweep checks for. WCAG 2.2 AA (2.5.8 Target Size Minimum) is 24 px WITH a spacing exception these rows may well satisfy, and axe/Lighthouse a11y scores 100, so this is a review item rather than a known failure. Outside this prompt's files (`Footer/*` is Prompt 13, `Header/*` is Prompt 09) · owner of 37 · 37
- `22 · The Lighthouse Performance figure was measured through a local caching mirror for the external hosts (Cloudinary, Google Fonts, Iconify), because this sandbox's agent proxy adds **~12.5 s of latency to every request that leaves the container** — which put Speed Index at ~20 s and made the score a measurement of the sandbox rather than of the page. The mirror scaffolding lives in the scratchpad and is NOT committed. Accessibility / Best Practices / SEO are unaffected by network latency and were the same (100/100/100) with and without it. The numbers should be re-taken on a normal network in Prompt 38 · owner of 38 · 38
- `23 · `/category/nope` renders the shop's "Nothing here yet" panel instead of a 404. Prompt 24 owns the unknown-slug branch (`NotFound`) together with `CategoryHead`, the breadcrumb and the category JSON-LD; the route, the data read and the chapters are already in place. · developer · 24`
- `23 · The category head is the shop's `SectionHeading` with eyebrow "Category", the category name as the `h1` and its `description` as the lede — no image band, no breadcrumb, no `BreadcrumbList` graph. Prompt 24 replaces that block with `CategoryHead`. · developer · 24`
- `23 · No product photograph could be seen rendered in this sandbox: `res.cloudinary.com` resets Chromium's TLS tunnel through the agent proxy, so every chapter plate and every ritual thumbnail painted as an empty `.sf-plate`. Layout, sticky travel and the 4:5 reservation were verified against the reserved boxes; the CROPS themselves still want one pass on a machine that can reach Cloudinary. Same limitation recorded by Prompts 20 and 22. · developer · 37`

- `24 · Every remaining sub-24px link target on these pages is in the FOOTER, not in Prompt 24's files: the four policy links measure 18px at 360/390/414 and the eight category/rituals links 21px from 768px up (measured at all seven widths on `/category/face-care`, `/rituals` and `/rituals/black-rice-body`). WCAG 2.2 AA 2.5.8 asks for 24×24. Prompt 13 owns `components/Footer`; the a11y audit should either grow the rows or record the "inline" exception deliberately. Everything Prompt 24 added clears it — breadcrumb crumbs 44px ≤768 and 24px above, step name links 25px, `.sf-btn--sm` 36px with the primitives' own `@media (pointer: coarse)` bump to 44px. · Prompt 38 · 38`
- `24 · `brand.flags.enableRitualBundles` is committed as `false`, which is the brief §8.1 default: bundles wait until the range has prices. Both halves of the panel are built and were exercised with the flag flipped locally (see the table row). The owner flips it in `src/config/brand.js` once more than one or two of the eight products carry an MRP — nothing else has to change. · owner · 39`
- `24 · `RitualStep` supports an UNCONTROLLED choice (omit `selectedProductId`/`onSelect` and the row keeps its own) but no caller uses it — `RitualDetail` always lifts the selection, because the CTA panel has to spend it. The path is covered by the component's own default state rather than by a test; the PDP's "part of this ritual" cross-link (Prompt 27) is the surface most likely to want it. · owner of 27 · 27`
- `24 · The category `heroImage` seeds are unrelated stock frames (`/category/face-care` currently serves the Statue of Liberty). That is expected — they are inventoried in PLACEHOLDER_ASSETS.md and wear `.sf-placeholder-media` — but it is the first prompt where a placeholder photograph is the largest thing on the page, and the glass panel's legibility over it now depends on `scrim` rather than on luck. Re-check the band once real category photography exists. · owner · 39`
- `24 · Chromium in this sandbox has no outbound HTTPS, so the placeholder photography was rendered by fetching each remote URL in NODE (which does reach picsum/cloudinary through the agent proxy) and fulfilling the browser's request with the bytes. Every screenshot in this prompt's QA is therefore of the REAL seeded frames — the first time in the programme that has been possible — but it is a harness trick, not the app's own path. The `onImageError` fallback was exercised separately by aborting the same requests. · developer · 37`

- `28 · A policy `standfirst` and a `siteContent.faqPage.lede` are READ by the pages and seeded by nobody. Both render when present and cost no layout when absent; neither was written here because a standfirst is brand copy and a component that invents one is exactly what this prompt removed. The admin editor should offer both fields. · Prompt 34 / owner · 34`
- `28 · Only `siteContent.policies.privacy` carries an `updatedAt`, so Terms, Shipping & Returns and Cookies show no revision stamp. The page prints one only where a record has a date — correct, but three legal documents with no visible "last updated" is a compliance gap the owner should close. Prompt 34's editor should STAMP `updatedAt` on every save. · Prompt 34 / owner · 34`
- `28 · `siteContent.faqPage.groups[3]` ("Account") has no rows in the seed, so the page renders three headings, not four. Nothing is broken — the page skips an empty heading by design — but the seed promises a section that does not exist. Either write the account answers or drop the group. · owner · 39`
- `28 · The placeholder photographs on `/about` (heroImage, image2) and `/why-lamikaa` (heroImage, the three impact frames) still could not be SEEN in this sandbox: `picsum.photos` and `res.cloudinary.com` reset Chromium's TLS tunnel through the agent proxy (the same limitation Prompts 19, 20 and 26 recorded; `curl` gets 200). The bands were verified with the images blocked — the wash, the glass panel, the overlap and the aspect ratios all hold on the empty plate — but the composition over a real photograph wants one pass on a developer machine. · developer · 37`
- `28 · The Terms document's live clause was verified against a PATCHED settings record (tax 18% exclusive, COD ceiling ₹5,000, resolved email/phone/address/WhatsApp) and the patch was then reverted — `git status db.json` is clean. The seeded state prints "inclusive of all taxes" with no rate and hides every contact channel, which is the correct unresolved state, but it means the COD ceiling, the exclusive-tax wording and the three channel cards are code paths **no committed fixture exercises**. · Prompt 39 · 39`

- `31 · The admin's Special Offers hero editor still offers `placeholder="Limited Time"` on the eyebrow field (`pages/Admin/AdminSpecialOffers.js:466`) — the previous brand's promo voice, now the only place it survives. The storefront defaults it feeds were rewritten in this prompt; the admin file belongs to the admin phase. · Prompt 34 / 35 · 34`
- `31 · Every Iconify glyph on the storefront — including the sixteen this prompt introduced — renders as an EMPTY ring in this sandbox: `@iconify/react` fetches its icon data from `api.iconify.design` / `api.simplesvg.com` / `api.unisvg.com` at runtime and all three reset Chromium's TLS tunnel through the agent proxy. The names were verified against the MDI set with `curl` instead (all sixteen present). This is the same runtime-fetch dependency Prompt 22 logged for the audit; bundling the collections offline would fix both the icons and the critical-path requests. · owner of 38 · 38`
- `31 · `EmptyState` renders a `GlassCard`, so the four `compact` states inside Profile's own `GlassCard` sections are two nested blurred layers — the ceiling DESIGN_SYSTEM §4 sets, not a breach, but the a11y/perf sweep should confirm it costs nothing on a phone. The other eighteen call sites sit on a plain section. · owner of 38 · 38`
- `31 · `SpecialOffers`' Deal-of-the-Day feature still draws its own card (plate, badge, stock tag, price cluster, add button) — deliberately, it is a 4:5 editorial feature the shared card cannot be, and nothing else on the storefront has one. If a later prompt wants a second feature surface, that is the moment to promote it rather than copy it. · owner · 39`
- `31 · The `dealsConfig.timer` window, the voucher wall at 2- and 3-up, and the markdown grid were exercised against a SCRATCHPAD db (`JSON_SERVER_DB` override) carrying `enabled: true`, `featuredCouponIds: [1]` and three products given a `comparePrice`. The committed seed has `enabled: false` and no `comparePrice` anywhere, so on the tracked fixture `/special-offers` shows only its disabled state and those code paths have no committed coverage. `git status db.json` is clean. · Prompt 39 · 39`
- `32 · `AdminSpecialOffers.js:466` still offers `placeholder="Limited Time"` on the deals hero eyebrow field — the last of the previous brand's promo voice in the admin. Prompt 31 assigned it to 34, Prompt 32's copy sweep does not list that screen, and the file is untouched here; leaving the assignment where 31 put it rather than moving the boundary. · Prompt 34 / 35 · 34`
- `32 · `AdminProducts`' OLD form still forces a selling price > 0, so editing one of the five `priceTBA` products through it writes a price the packaging does not carry (`form.price = p.price || 0` → validation). The table now flags them ("Price on launch") but the form is Prompt 33's to rewrite — nothing in this prompt touched the payload. · Prompt 33 · 33`
- `32 · Iconify glyphs still fetch their data from `api.iconify.design` at runtime, so every admin icon renders as an empty box in this sandbox (same finding as Prompts 22 and 31). The rebrand was verified on layout, colour, copy and behaviour; the icon ART is unverified here. · owner of 38 · 38`

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
- `21 · {{RETURN_WINDOW_DAYS}} / {freeShipping} · NEW SURFACE, no new token · Giving `faqs` rows 6–8 the `home` placement puts both answers on the home page. `{{RETURN_WINDOW_DAYS}}` still resolves to 7 and prints as "within 7 days"; `{freeShipping}` is still unresolvable (`shipping_methods[0].freeAbove` is null), so FAQ 6 loses that sentence and prints its first one only. Verified in the browser: `document.body.innerText` carries no `{{`, no `{freeShipping}`, no `{codSentence}` and no `{taxNote}` at 360 / 390 / 768 / 1280.`
- `06 · {{PRICE_FACE_WASH}} / {{PRICE_GOAT_MILK_SOAP}} / {{PRICE_FACE_SCRUB}} · resolved · Seeded as 390 / 90 / 349 with priceSource: "packaging-mrp". Owner to confirm before launch.`
- `06 · {{PRICE_BODY_WASH}} / {{PRICE_FACE_MASK}} / {{PRICE_FACE_MIST}} / {{PRICE_FACE_SERUM}} / {{PRICE_MOISTURIZER_GEL}} · introduced · price: null + priceTBA: true on products 3, 4, 5, 7, 8 — the MRP is masked on those packs. Renders "Price on launch" with Add to Cart disabled.`
- `06 · {{SIZE_FACE_WASH}} … {{SIZE_MOISTURIZER_GEL}} (8) · resolved · products[*].size, all eight from the packs: 200 ml · 100 g · 250 ml · 100 g · 100 ml · 100 g · 30 ml · 100 ml.`
- `06 · {{INCI_FACE_WASH}} … {{INCI_MOISTURIZER_GEL}} (8) · resolved · products[*].ingredientsList, verbatim from PRODUCTS.md §5. Owner to proof-read against final artwork.`
- `13 · {{GSTIN}} / {{CIN}} · FIRST RENDERED · `brand.legal.*` reaches type for the first time, in the footer colophon (`GSTIN <n>` / `CIN <n>` rows). Both go through `resolveOrNull`, so while they are tokens the rows cost no line at all; verified in the browser by temporarily resolving both (rows appeared, `innerText.includes("{{")` stayed false) and reverting. `PLACEHOLDERS.md`'s "Not rendered anywhere yet" note is updated.`
- `13 · {{LAMIKAA_EMAIL}} / {{LAMIKAA_PHONE}} / {{LAMIKAA_ADDRESS}} / {{SUPPORT_HOURS}} · unchanged, re-verified · The footer's contact block is now a single `<address>` of up to four rows, each rendered only when `resolveOrNull` returns a value. With the seed's tokens the `<address>` is not rendered at all; PATCHing real values into `settings.store` made all three rows appear with working `mailto:` / `tel:` hrefs (then reverted). `{{SUPPORT_HOURS}}` still comes from `constants.js`, not from settings — it has no admin field yet.`
- `13 · {{FREE_SHIPPING_THRESHOLD}} · one consumer fewer · The footer's promise row is deleted and `constants.js`'s `FREE_SHIPPING_THRESHOLD` export is gone with it. The token itself is untouched in `brand.js → announcements[1].text` and is still what `fillStoreCopy` emits when `{freeShipping}` cannot be resolved, so FAQ 6 keeps losing its sentence exactly as before.`

---
- `15 · (none introduced, none resolved) · The five `{{PRICE_*}}` products render the "Price on launch" chip on the rebuilt card with Add to Cart disabled and labelled "Coming soon" — the rule PLACEHOLDERS.md states, now visible in search, wishlist and the PDP rails. `brand.originBadge` is BRAND copy from BRAND.md §3.1, not a token: it needs no owner input.`


- `18 · (none introduced) · — · Both images the two sections render — `siteContent.home.whyBlackRice.image` (`picsum.photos/seed/lamikaa-black-rice/1200/1200`) and `rituals[*].image` (`…/lamikaa-ritual-{morning,evening,body}/1200/1500`) — were seeded and inventoried by Prompt 06 and are already listed in `PLACEHOLDER_ASSETS.md`. No `{{…}}` token is read or rendered by either section.

- `19 · (none introduced, none resolved) · — · The only asset this section reads is `siteContent.home.fullPageCta.image` (`picsum.photos/seed/lamikaa-cta/1920/1080`), seeded and inventoried by Prompt 06 and already listed in `PLACEHOLDER_ASSETS.md` as "Full-page CTA background". No `{{…}}` token is read or rendered by either new component; the ownership note under the card is `brand.legalNote` through `LegalNote`, verbatim.

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


## Prompt 09 record (2026-09-06)

### The masthead, top to bottom

| Band | What | Height | Pinned? |
|---|---|---|---|
| `AnnouncementBar` | one data-driven line, gold dot, dismiss | 36px | no — normal flow, scrolls away |
| `Header` | hamburger (≤1024) + wordmark · nav (≥1025) · actions | 64px / 56px ≤768 | **yes**, `position: sticky; top: 0; z-index: var(--sf-z-header)` |
| `MegaPanel` | full-width sheet under the header, `role="region" aria-label="Shop menu"` | `max-height: calc(100vh - 100px)` | with the header |

Page chrome before the first scroll = **100px**; pinned chrome after it =
**64px** (measured 65px and 57px including the 1px hairline). The guardrail
("never more than 100px of pinned height including the announcement bar") holds
with 36px to spare, because the band is in flow rather than pinned.

### Files

| File | Change |
|---|---|
| `components/Header/Header.js` | rewritten, 683 → 437 lines |
| `components/Header/Header.module.css` | rewritten, 690 → 444 lines |
| `components/Header/MegaPanel.js` | **new** |
| `components/Header/MegaPanel.module.css` | **new** |
| `components/Header/HeaderActions.js` | **new** (uses `Header.module.css`, as the prompt's file list implies) |
| `components/AnnouncementBar/AnnouncementBar.js` | rewritten |
| `components/AnnouncementBar/AnnouncementBar.module.css` | rewritten |
| `components/CategoriesDrawer/` | **deleted** (2 files, 1 071 lines) |
| `App.css` | `.main-content` spacer comment corrected (there is no spacer — the header is sticky, in flow); skip-link comments rewritten for the new masthead |
| `index.css` | new base-layer rule `:where([id]) { scroll-margin-top: 80px }` |
| `App.js` | unchanged — the skip link already targets `#main-content`, verified |
| `components/brand/Logo.js` | unchanged, as expected |

### Contracts a later prompt depends on

- `MegaPanel` exports **`loadMegaPanelData()`** — a module-level promise over
  `categories.getAll` + `concerns.getAll` + `products.getHeroProducts` +
  `rituals.getAll`, the same shape as `SearchModal`'s `loadSearchData`. The
  header calls it on the Shop button's `pointerenter`/`focus` so the panel is
  drawn from memory on the first hover. A rejection clears the promise, so the
  next open retries.
- `MegaPanel` props: `id` (default `"mega-panel"`, which the trigger's
  `aria-controls` names) and `onNavigate` (called by every link, closes the
  panel).
- `HeaderActions` props: `cartCount`, `wishlistCount`, `onSearch`, `onCart`.
  Auth comes from `useAuth()` directly — the account menu owns its own anchor
  state and nothing else.
- `#hero-sentinel` is the id the hero must render (Prompt 14) for the
  transparent state. Absent, the header is glass from the first pixel. The
  lookup retries for up to 30 animation frames after each route change, so a
  lazily-loaded chunk still gets the observer.
- The four overlay mounts (`CartDrawer`, `SidebarMenu`, `AuthModal`,
  `SearchModal`) keep their existing props exactly, so Prompts 10-12 can
  migrate them one at a time.

### Verification (Chromium 141, mock mode, real Cloudinary art and Google fonts)

- **Widths 320 / 360 / 390 / 414 / 768 / 1024 / 1280 / 1440** — header 57px up
  to 768 and 65px from 1024; wordmark 140px ≤768, 168px ≥1024, the 40px **mark**
  at 320; **0px horizontal document overflow at every width**; 0 console errors,
  0 page errors.
- **Nav** — `["Shop","Rituals","Our Story","Why LAMIKAA"]` at 1280/1440; not
  rendered at all at 768/1024 (`header nav` count 0, `#mega-panel` count 0), the
  hamburger opens `SidebarMenu` there. With `dealsConfig.enabled` stubbed true
  the row becomes `[…,"Offers"]` → `/special-offers`; the seed has it **false**,
  so the entry is correctly absent by default.
- **Mega panel at 1280** — `grid-template-columns: 392px 356.4px 427.6px`
  (1.1 : 1 : 1.2), 40px block padding, `max-height: 850px` at a 950px viewport
  (`100vh - 100px`), `role="region"`, `aria-label="Shop menu"`. 7 category rows
  (6 with a 96×96 product thumbnail, `Rituals` with the bare plate) + counts
  6·2·3·1·2·2 + **All products** → `/shop`; **11** concern chips →
  `/shop?concern=<slug>`; the featured card at 600×600 with the eyebrow, name,
  promise, ₹390.00 and **Explore** → `/product/black-rice-face-wash`.
- **Open/close** — closed at 120ms of hover, open at 520ms (the 200ms intent);
  click toggles; Enter opens; Escape closes and focus returns to **Shop**;
  outside click closes; a panel link closes it and navigates; hovering a sibling
  entry closes it.
- **Keyboard** — Enter then six Tabs walks the seven category rows in order; six
  Shift+Tabs return to "Shop"; one more leaves the header at the wordmark.
- **Header states** — no sentinel → `sf-glass` (`rgba(255,255,255,.06)`,
  `blur(20px)`); sentinel on screen → `.transparent` (`rgba(0,0,0,0)`,
  `backdrop-filter: none`, transparent hairline); scrolled past →
  `sf-glass sf-glass--strong` (`rgba(255,255,255,.08)`). Opening the cart drawer
  takes the blur to **none** (with `body[data-drawer-open]` still unset, which
  is why the header ORs in its own overlay state).
- **Announcement bar** — 36px, `"Farmer-owned. Assam-grown."`; dismissal writes
  `sessionStorage["lk-announcement-dismissed"] = "1"` and **nothing** to
  `localStorage`; it survives a route change and a reload and comes back in a
  new context (a new tab). With the API stubbed to `[]` it falls back to
  `brand.announcements`; fed two token rows and one real row it shows only the
  real one, `hasToken: false`, and honours its `link`. Two real rows rotate
  within 6.5s and hold while hovered.
- **Skip link** — first Tab stop, `:focus-visible`, slides to `top: 8px`;
  Enter focuses `#main-content`, whose top lands at **80px** — exactly the
  header's bottom edge, so the sticky header does not cover the target.
  `scroll-margin-top: 80px` computed on `#main-content`.
- **Reduced motion** — with `reducedMotion: "reduce"` the panel's first frame is
  `opacity: 1, transform: none`: no sheet motion at all.
- **API unreachable** — header, nav and the brand-fallback announcement all
  render; the mega panel shows "The catalogue could not be loaded just now." and
  a **Go to the shop** button; 0 page errors.
- **axe-core** (`wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice`) on the
  header — **0 violations** at 1280 closed, 1280 with the panel open, and 390;
  the announcement bar 0 at both widths. Whole-document: one pre-existing
  `landmark-unique` (moderate) from the header/footer "Shop" pair, logged as an
  Open TODO against Prompt 13.
- **Greps** — `CategoriesDrawer` 0 in `src`; `CategoriesDrawer|TrustStrip` 0 in
  `src/components/Header`; `navMeasure|measureOverflow` 0 in `src`;
  `FREE_SHIPPING_THRESHOLD` 0 and `localStorage` 0 in
  `src/components/AnnouncementBar`; no Meghali-era string in any touched file.

### Gates

`CI=true npm run build` exit 0, **no warnings**. `npm test -- --watchAll=false`
exit 0 — 3 suites passed / 1 skipped, 34 passed / 50 skipped. `db.json`
untouched; no dependency added; `src/services/api.js` untouched (reads only).


## Prompt 10 record (2026-09-06)

### What the mobile navigation now is

`SidebarMenu` is the FIRST feature to sit on the `ui/Drawer` primitive Prompt 05
built. Everything the old file hand-rolled is deleted rather than duplicated:

| Was, in `SidebarMenu.js` | Is, in `ui/Drawer` |
|---|---|
| a 60-line `keydown` handler cycling Tab and catching Escape | `useFocusTrap(panelRef, { active, onEscape })` |
| `document.body.style.overflow = "hidden"` | `useScrollLock(open)` — reference-counted, so the auth modal opening over the drawer cannot unlock early |
| `opener.focus()` in the effect's cleanup | the hook's own restore |
| nothing (the drawer stayed open across a navigation unless a handler closed it) | `pathAtOpen` vs `location.pathname` |
| a hand-drawn `motion.div` backdrop + panel | `overlay(reduce)` + `panel(reduce, "left")` at 600ms in / 320ms out, on a `--sf-color-overlay` scrim |
| nothing | `body[data-drawer-open]`, which is how the sticky header drops its blur |

`grep -n "useFocusTrap\|useScrollLock\|Drawer" src/components/SidebarMenu/SidebarMenu.js`
returns only the `ui` import, the comment block and the `<Drawer>` element — the
hooks are not named in the file because it does not need to name them.

### The drawer, top to bottom

- **Masthead 64px** (10 + a 44px close target + 10, over a 1px hairline):
  `<Logo width={132} alt="">` on the left, `Button variant="icon"` on the right.
  The close button is the FIRST TAB STOP (it precedes the body in the DOM);
  verified by pressing Tab once from the freshly-opened panel.
- **`<nav aria-label="Catalogue">`** — a one-item `ui/Accordion`, header row
  "Shop" in Fraunces 22px at 52px, `aria-expanded` on a real `<button>`,
  expanding to the seven categories at 48px each behind a 32px `.sf-plate`
  (`stageSrc(firstProductForCategory(heroProducts, cat), { w: 64 })`, requested
  at 2x) and closing on **All products** → `/shop`. Six of the seven plates
  carry a product; **Rituals** has none by design (`kind: "rituals"` is an
  editorial index, no product lists it) and shows the bare plate — the same
  empty state the mega panel settled on in Prompt 09.
- **`<nav aria-label="Brand">`** — Rituals · Our Story · Why LAMIKAA · Offers
  (only while `useDealsConfig().enabled`; verified BOTH ways against the mock
  API) · FAQ · Contact. Fraunces 22px, 52px rows, hairline separators, gold
  `aria-current="page"`.
- **`<nav aria-label="Account">`** — signed out: `Log in` (`onOpenAuth`) and
  `Create account` (`openAuthModal("signup")`); signed in: a 40px initials
  avatar, the name, the email, then My Profile · My Orders · My Wishlist (gold
  count disc, `aria-hidden`, the number spoken by a visually-hidden sentence so
  the visible name stays "My Wishlist" — WCAG 2.5.3) · Log out.
- **`<nav aria-label="Contact">`** — the email and phone rows and the
  `socialLinks` marks, each gated on a resolved value. Today all three are
  `{{TOKENS}}`, so the whole nav is absent and `innerText` contains no `{{`.
- **Pinned footer** — `Button variant="primary" block` **"Shop the Black Rice
  Range"** at 52px over `brand.legalNote` at 12px `--sf-color-text-muted`,
  clamped to three lines, on `calc(16px + env(safe-area-inset-bottom))`.

### The bar

`sf-glass sf-glass--strong sf-glass--scrim` at `--sf-z-sticky`, one hairline on
top, a 64px tab row plus `env(safe-area-inset-bottom)` INSIDE the element (so
`translateY(100%)` still clears the screen). Five tabs, every one with a visible
11px Manrope 600 label: Home · Shop · Search · Wishlist · Account. Active =
`--sf-color-gold` type **plus** a 20px `--sf-gradient-signature` hairline above
the icon — two differences, never colour alone — with `aria-current` from
`NavLink` on top. The hairline is rendered on every tab (transparent when
inactive) so the row's height never depends on where you are.

### Browser QA (Chromium 1194, mock mode) — 109/109

Run at 390x844 unless stated. Every line below is an assertion the script made,
not an impression.

- **Open/close cycles** — hamburger opens it; **Escape**, the **close button**,
  a **route change** and (where the panel does not fill the viewport) the
  **scrim** all close it. Focus returns to the hamburger (`aria-label="Open
  menu"`) every time. `body[data-drawer-open]="1"` and `body[data-scroll-lock]="1"`
  while open, `overflow: hidden` on `<body>`, both released on close.
- **The blur budget** — with the drawer up the header's `backdrop-filter` is
  `none` and the drawer's is `blur(12px)`. Two blurred layers, never three.
- **Tab cycle** — 40 consecutive Tab presses, **0 escapes** from the panel.
- **Every row ≥ 44px** — measured across every rendered `<a>` and `<button>` in
  the drawer: 0 under. Category rows exactly 48px, thumbnails exactly 32x32,
  the Shop trigger 52px, the masthead 64px + hairline.
- **The accordion** — 7 categories + "All products", 6 thumbnails that actually
  load (`naturalWidth > 0`), `aria-expanded` `false` on `/`, `true` on `/shop`
  and `/category/face-care`. Every link navigates AND closes.
- **Auth** — "Log in" opens the modal on the sign-in tab ("Welcome back"),
  "Create account" on the sign-up tab ("Join LAMIKAA NATURALS"). Signed in as
  the seeded customer the section becomes `SC` / `Sample Customer` /
  `sample.customer@example.com` + the four rows; "My Wishlist" navigates;
  "Log out" clears the session, lands on `/` and restores the guest pair.
- **The bar** — 5 tabs, labels `Home Shop Search Wishlist Account`, height ≥64,
  `position: fixed`, `z-index: 40`, `border-top: 1px` and `border-left: 0`,
  `backdrop-filter: blur(12px)`. Active tab `rgb(245, 215, 110)` with
  `linear-gradient(135deg, #F5D76E, #FF4FD8, #8B5CF6)` on its rule. Hides on
  scroll down (`translateY(65px)`), returns on scroll up, and **does not move
  while the drawer is open**.
- **Shop tab activation** — lit on `/shop`, `/category/face-care`, `/rituals`
  and `/product/black-rice-face-wash`; dark on `/wishlist`.
- **`/checkout`** — `main.main-content` computes `padding-bottom: 80px`, so the
  page's last CTA clears the bar.
- **Widths** — 360 / 390 / 414: drawer full width. 768 and 1024: 420px, with a
  scrim that closes it. 1024: hamburger visible, **no bottom nav**. 1280: no
  hamburger, no bottom nav. **No horizontal scroll at any width**, drawer open
  or closed.
- **Reduced motion** (`reducedMotion: "reduce"`) — the panel's first frame is
  already `transform: none` and the bar's `transition-duration` is `0s`.
- **Safe area** — with a 34px inset injected (Chromium has no notch), the bar
  measures 99px and `.main-content` computes `114px` — 80 + 34, the `calc`, not
  a `max` that would have swallowed one of them.
- **axe-core** (`wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice`) — **0
  violations** on the bar, on the drawer with the accordion closed AND open, on
  the drawer at 768, and on the whole document with the drawer open and closed.
- **Console** — 0 errors across the whole 390px run.

### The defect found on the way

On a product page the PDP purchase bar painted OVER the new drawer:
`AddToCartBar.module.css` raised itself to a raw `z-index: 1300` inside its
`@media (max-width: 768px)` block — above `--sf-z-overlay` (1000) and
`--sf-z-modal` (1100) — justified by a comment about "the global BottomNav
(z 1200)" that no BottomNav in this repository has ever matched. Reproduced:
`elementFromPoint(195, innerHeight - 40)` with the menu open returned
`AddToCartBar_buyNow`. The override is deleted; the base
`z-index: var(--sf-z-stickybar)` stands at every width. Re-verified: the bar is
still on top where it overlaps the tab bar (hit test returns
`AddToCartBar_buyNow` at their overlap), Add to Cart from the bar still creates
a cart line, and both the navigation drawer and the cart drawer now paint over
it. This is the z-index order Task 6 asked to reserve, made true.

### Greps

`useFocusTrap|useScrollLock` in `SidebarMenu.js` → **0**.
`toggleTheme|Dark mode` in `src/components/SidebarMenu` → **0**.
`.dark` or a hex literal in either new stylesheet → **0**.
`Meghali|silk|saree|muga` in every touched file → **0**.
`TrustStrip` in `src/components/SidebarMenu` → **0** (the component is left in
place, unimported, for Prompt 15).

### Gates

`CI=true npm run build` exit 0, **no warnings**. `npm test -- --watchAll=false`
exit 0 — 3 suites passed / 1 skipped, 34 passed / 50 skipped. `db.json`
untouched (the Offers gating check patched the mock API and restored it;
`git status --short db.json` is empty). `src/services/api.js` untouched — reads
only. No dependency added.

---

## Prompt 11 record (2026-09-06)

### What search now is

Two surfaces, ONE ranking. `src/utils/search.js` is the only thing on the
storefront that decides what a query means, and both the overlay and `/search`
call it with the same three collections — so "serum" cannot return one list in
the dialog and a different one on the page it links to. Neither surface calls
`apiService.products.search()`: json-server's `?q=` matches any field of any
record (an INCI list scores like a name), and the Laravel `?search=` does not
exist yet. Eight products across nine fields is a linear pass with no index to
build, so there is no debounce either — the list is under the keystroke.

`SearchModal` is the FIRST feature to sit on `ui/Modal`, and everything the old
file hand-rolled is deleted rather than duplicated:

| Was, in `SearchModal.js` | Is, in `ui/Modal` |
|---|---|
| a 38-line `keydown` handler cycling Tab and catching Escape | `useFocusTrap(panelRef, { active, onEscape, initialFocus })` |
| `document.body.style.overflow = "hidden"` | `useScrollLock(open)` — reference-counted |
| a `triggerRef` effect calling `trigger.focus()` on close | the hook's own restore |
| nothing | close on route change (`pathAtOpen` vs `location.pathname`) |
| a hand-drawn `motion.div` scrim + sheet | `overlay(reduce)` + `sheet(reduce)` |
| nothing | `body[data-drawer-open]` — new to `Modal` in this prompt |

`grep -n "focusable\|body.style.overflow\|triggerRef" src/components/SearchModal/SearchModal.js` → **0**.

### The primitive changes this needed

- **`Modal size="full"`** — 100svw × 100svh, no radius, `.sf-glass--strong` over
  the `--sf-color-overlay` scrim, `padding-top: env(safe-area-inset-top)`, and
  `.full .body` handed to the child (no padding, no scrollport, a bare flex
  column). `svh`, not `vh`: a mobile address bar that collapses mid-scroll must
  not move the foot of a dialog you are typing in.
- **`Modal initialFocus`** — passed through to `useFocusTrap`, which already
  took it. Without it the trap focuses the panel and the field would need a
  second, racing `setTimeout` of its own.
- **`hooks/useOverlayFlag.js`** — the reference-counted `body[data-drawer-open]`
  flag, lifted out of `ui/Drawer` so `Modal` and `Drawer` share ONE counter.
  Two counters would each delete the attribute on their own way out. The
  attribute name is unchanged; `Header.module.css:60` and `BottomNav` select on
  it by name. Measured: `getComputedStyle(header).backdropFilter === "none"` for
  as long as the overlay is up, at every breakpoint.
- **`PriceBlock`/`Price` `live` prop** (default `true`) — see the decisions log.

### `src/utils/search.js`

`normalize()` → NFD, drop `\u0300-\u036f`, lower case, non-alphanumerics to
spaces, trim. `tokenize()` → its words. `rankProducts(products, query, {
categories, concerns })` → `[{ product, score, matchedOn }]`, best first.

| Field | Weight | Note |
|---|---|---|
| `name` | 10 | **14** when the name opens with the whole query |
| `shortName` | 10 | |
| `tags[]` | 6 | |
| `concerns[]` | 6 | slugs **and** the concern records' display names |
| `keyIngredients[].name` | 5 | |
| `benefits[]` | 4 | |
| category `displayName` | 4 | membership by `categoryIds[] || categoryId` |
| `promise` | 3 | |
| `shortDescription` + `description` | 2 | |

A word answers a token when it IS it or STARTS with it, plus a singular fallback
for a 4+ character token ending in "s" ("serums" finds "serum"). A field scores
`hits × weight`, +6 when a multi-word query is found verbatim in one of its
values. Ties break **known-price first** (`isPriceKnown`) then alphabetically, so
the same query always returns the same order — a list that reshuffles between
keystrokes is unusable. `[]` for an empty query or an empty catalogue.

`src/utils/search.test.js` — 10 tests over the eight seeded products, copied
verbatim from `db.json`: the five the prompt names, plus normalize/tokenize, the
category-display-name path, the concern path, and a missing catalogue.

### The overlay, top to bottom

- **Head (does not scroll)** — a 52px glass field with a 2px bottom hairline
  that warms to `--sf-color-gold` on focus (no boxy border), a flat 44px clear
  mark inside it and a 44px glass close circle beside it, then the count line.
  `role="search" aria-label="Search products"` on the form, autofocus on open,
  16px input text so iOS cannot zoom the page on focus.
- **Empty query** — "Popular searches" from `brand.search.popular` (6 chips),
  "Recent" from `sessionStorage["lk-recent-searches"]` (max 6, with a "Clear"
  text button), "Shop by category" (7 chips through `categoryPath()`, so Rituals
  goes to `/rituals`). One column; two from 1024px, terms | destinations.
- **≥ 1 character** — `role="status" aria-live="polite"`: "8 results for
  “black rice”" / "1 result for “goat”" / "No results for “zzzq”". Then up to
  **8** rows, then "See all N results" → `/search?q=`.
- **A row** — a `Link` (min 64px, 72px from 769px; measured 71px/79px because the
  name + one-line promise + price stack is 63px on its own) with a 56px
  `.sf-plate` thumbnail from `stageSrc(p, { w: 112 })`, the name in Manrope 600,
  the `promise` clamped to one line, `Price` (or "Price on launch"), and a 40px
  `Button variant="icon"` quick add — `mdi:cart-plus`, `disabled` +
  `srLabel="Coming soon"` when `priceTBA`, otherwise
  `addToCart(buildCartItem(p), 1, { openDrawer: false })` and CartContext's own
  toast. The overlay stays open and the cart tray stays shut.
- **Nothing matched** — "Nothing matched “{q}”." + "Try one of these:" + the
  popular chips + "Browse all products" → `/shop`. A failed catalogue read says
  "Search is unavailable right now." instead of claiming nothing matched.
- **Keyboard hints** — "↑ ↓ to move · Enter to open · Esc to close", only at
  ≥1025px with a fine pointer, only while there are results.

### `/search?q=`

`SectionHeading as="h1"` (eyebrow "Search", title `Results for “{q}”`, lede with
the count) over a `ProductCard` grid at **1 / 2 / 3 / 4** columns from 360 / 640
/ 1024 / 1280 — all four measured. `useSeo({ title: q ? "Search: {q}" : "Search",
noindex: true })`. The field at the top writes `?q=` with `replace: true` (so
editing a query does not stack history) and mirrors the URL back, so Back and
Forward move the query. Four `Skeleton variant="card"` while the catalogue
loads. `ProductCard` is the current card; Prompt 15 restyles it.

### Verified in Chromium

| Check | Result |
|---|---|
| `"serum"` | Black Rice Face Serum, first and only |
| `"hydration"` | Moisturizer Gel · Body Wash · Face Mist — nothing else |
| `"goat"` | Black Rice Goat Milk Soap, alone |
| `"black rice"` | all 8; Scrub, Face Wash, Goat Milk Soap (the three priced) lead |
| nonsense | "No results for “zzzqqq”" + the empty state |
| ↑/↓ from the field | `data-active` moves, `document.activeElement` stays the INPUT |
| ↑/↓ from a focused row | focus moves row to row; ↑ off the top returns to the field |
| Enter, nothing active | `/search?q=black%20rice`, overlay closed, `<h1>` correct |
| Enter, 3rd row active | `/product/black-rice-face-mist` |
| Escape | overlay closed, `body[data-drawer-open]` cleared, focus back on the header's Search button |
| Tab walk (query typed) | field → clear → close → **one** row link → its add button → See all → field |
| Quick add | cart label "Cart, 1 item", toast shown, only the search dialog still open |
| priceTBA rows | 5 buttons `disabled` with the name "Coming soon"; 3 enabled |
| Recent | `sessionStorage["lk-recent-searches"] = ["black rice"]`; no localStorage key |
| Submitting from `/search?q=face` | `/search?q=serum`, overlay closed (query-only change) |
| `/products?search=serum` | → `/search?q=serum` |
| `/search` with no `q` | `<h1>` "Search", title "Search · LAMIKAA NATURALS" |
| 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 + reduced motion | field 52px, thumb 56px, add 40px (44px on coarse pointers), close 44px, **0** horizontal overflow, **0** page errors |
| header while open | `backdrop-filter: none` at every width |

### Greps

`Muga|Mekhela|Eri |Pat silk|weave` in `src/components/SearchModal src/pages/Search` → **0**.
`localStorage` in the same two → **0**; `sessionStorage` → 3 (read/write/remove).
`ComingSoon` in `src/App.js` filtered by `search` → **0**.
`focusable|body.style.overflow|triggerRef` in `SearchModal.js` → **0**.
`getTrending|CURATED_|descendantSlugs|FALLBACK_IMAGE` in `SearchModal.js` → **0**.

### Files touched beyond the prompt's expected list

Four, each for a reason recorded in the decisions log: `hooks/useOverlayFlag.js`
(new — the shared `body[data-drawer-open]` counter `Modal` needed),
`ui/Drawer.js` (moved onto that hook; its own counter deleted),
`storefront/PriceBlock.js` + `ui/Price.js` (the additive `live` prop), and
`pages/_Playground/Playground.js` (`size="full"` added to the modal size row, so
the primitive playground still shows every state it claims to).

### Gates

`CI=true npm run build` exit 0, **no warnings**. `npm test -- --watchAll=false`
exit 0 — **4 suites passed / 1 skipped, 44 passed / 50 skipped**. `db.json`
untouched; `src/services/api.js` untouched (reads only — `products.getAll`,
`categories.getAll`, `concerns.getAll`). No dependency added. `ComingSoon.js`
unchanged, with one fewer usage. `Header.js` and `BottomNav.js` unchanged — the
overlay's `open`/`onClose` contract is the same.


## Prompt 12 record (2026-09-07)

### What the cart tray now is

A 440px glass tray on `ui/Drawer` — the SECOND feature on the primitive, and,
like `SidebarMenu` before it, everything it used to hand-roll is deleted rather
than duplicated:

| Was, in `CartDrawer.js` | Is, in `ui/Drawer` |
|---|---|
| a 40-line `keydown` handler cycling `FOCUSABLE_SELECTOR` and catching Escape | `useFocusTrap(panelRef, { active, onEscape })` |
| `document.body.style.overflow = "hidden"` | `useScrollLock(open)` — reference-counted |
| an `opener`/`onCloseRef` dance to restore focus | the hook's own restore |
| nothing | close on route change (`pathAtOpen` vs `location.pathname`) |
| a hand-drawn `motion.div` scrim + tray | `overlay(reduce)` + `panel(reduce, "right")` |
| nothing | `body[data-drawer-open]` — the header drops its blur while the tray is up |

`grep -n "FOCUSABLE_SELECTOR\|body.style.overflow\|onCloseRef" src/components/CartDrawer/CartDrawer.js`
returns **2** — both inside the docblock above, which names what moved to the
primitive; there is no code hit.
The PUBLIC PROPS are unchanged: `Header.js` still mounts `<CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />`,
and `Header.js` itself was not touched.

The tray reads top to bottom as one document: a 64px masthead with a count chip,
then a body of five full-bleed sections — the free-shipping meter, the 96px
lines, "Complete your ritual", "Have a code?", the money — over a 128px pinned
foot. `--sf-drawer-body-pad: 0` is what lets the hairlines run edge to edge; each
section owns its own air.

### No invented shipping figure survives

This is the point of the prompt, so it is worth stating plainly. The old tray
quoted a `FLAT_SHIPPING = 99` delivery charge in its summary and raced a meter
towards `FREE_SHIPPING_THRESHOLD` — a figure the store had never committed to.
Both are gone, and nothing replaced the charge:

- the meter's bar is `freeShippingThreshold(methods)` — the LOWEST positive
  `freeAbove` across the ACTIVE methods from `shipping.getMethods()`, the same
  rule `resolveTrustBadgeDetail` uses, so the meter and the trust badge can
  never quote different numbers;
- when no method sets one, `hasMeter` is false and the meter is not rendered at
  all — unknown means unknown, not free;
- **the delivery charge is not previewed in the tray in any form.** The summary
  ends "Shipping and taxes calculated at checkout", which is the first screen
  that knows an address.

Measured in the browser with `freeAbove: 999` PATCHed onto Standard Delivery
through the API (and restored to `null` afterwards — `git status db.json` clean):

| Subtotal | Text | `aria-valuenow` / `aria-valuemax` | Fill |
|---|---|---|---|
| ₹390 | "₹609 away from free shipping" | 390 / 999 | 39.039% |
| ₹1 170 | "You've unlocked free shipping" | 999 / 999 | 100% |

With the committed seed (`freeAbove: null`) the meter does not render.

### `CartContext` — `addMany`, and one merge rule

`addMany(items, { openDrawer = true } = {}) -> { added, skipped }`. Both add
paths now fold an item in through ONE private reducer:

```js
const mergeLine = (prev, incoming) => { /* line-key merge + clampQty */ };
addToCart : setCartItems((prev) => mergeLine(prev, incoming));
addMany   : setCartItems((prev) => incoming.reduce(mergeLine, prev));
```

so the two cannot drift on the merge or the stock clamp, and a list is folded in
inside ONE functional update — two entries for the same line sum rather than
race. An entry whose price is not committed (`isPriceKnown` → `priceTBA`, or no
price at all) is SKIPPED, never added at ₹0: five of the eight products ship
before their MRP is set, and a ₹0 line checks out. One toast, whatever the
length of the list ("3 items added to your cart", or "2 added · 1 coming soon"),
and at most one drawer opening — none at all when nothing was added.

Toasts are sentence case throughout: **"Added to cart" / "Cart updated" /
"Removed from cart" / "Cart cleared"**, still on the SweetAlert2 toast skinned
in Prompt 04. `removeFromCart` now names the line it removed (read from
`cartItemsRef` before the state change), which is the difference between "did I
just delete the wrong thing?" and knowing.

`localStorage.cart` is byte-for-byte the same format; nothing about persistence
or the API mirror changed.

### Cross-sell

`crossSellFor(products, cartItems, limit = 2)` is pure and exported. Preference
order, best answer first:

1. `frequentlyBoughtTogetherIds` of the cart's own lines, walked in cart order —
   the merchant's own pairing;
2. the NEXT `ritualStep.order` in the same `categoryId`, nearest step first;
3. `heroOrder` — the house's running order.

Never offered: anything already in the cart, and anything `!isPriceKnown` (an
Add button beside a "Price on launch" product is an invitation to a dead end).
An EMPTY cart is the same call with no lines, so it falls straight through to
hero order — which is exactly the "Start with" list Task 10 asks for. The
section is not rendered when nothing qualifies.

With the committed seed and a cart of Face Wash + Scrub, only the Goat Milk Soap
qualifies (every other product is `priceTBA`), so one row renders — "up to 2",
honestly.

### `QuantityStepper`, restyled

From a hairline box cut into three by two internal rules, to one pill: a glass
ground (`--sf-glass-bg` over `--sf-glass-border`, and deliberately **no**
`backdrop-filter` — see the decisions log), round controls at each end, tabular
figures between them, the `aria-live` value unchanged. `md` keeps its 44px for
the PDP purchase panel; `sm` is the prompt's 36px and returns to 44px under
`@media (pointer: coarse)`.

### Measured

Chromium, `npm run dev`, cart of two lines unless stated.

| Check | Result |
|---|---|
| Panel width at 360 / 390 / 414 / 768 / 1024 / 1280 | 360 / 390 / 414 / **440** / 440 / 440 |
| Horizontal overflow, every width | none |
| `body[data-scroll-lock]` while open | set at every width |
| `body[data-drawer-open]` while open | set at every width |
| Masthead / line / foot height | 65 / **96** / 129 px (64 / 96 / 128 + hairlines) |
| Line height, name wrapping to two lines + variant | 134 px |
| Plate | 72 × 72 px (cross-sell rows 56 px) |
| PDP "Add to cart" | tray auto-opens; toast "Added to cart · Black Rice Face Wash is in your cart" |
| Cross-sell "Add" | line added, tray stays open |
| Coupon `SAMPLE10` | applied chip + "Discount (SAMPLE10) −₹39.00"; bad code → "Invalid coupon code" |
| Tab ring | 11 stops, wraps to the close button; the disabled − is skipped |
| Escape | closes, focus restored to "Cart, 1 item" |
| Backdrop click | closes |
| Checkout | `/checkout`, cart intact, scroll unlocked, `data-drawer-open` cleared |
| View cart | `/cart` |
| In-tray product link | `/product/black-rice-face-wash` (id → slug redirect), tray closed |
| Remove the last line | empty state renders, the pinned foot disappears with it |
| `prefers-reduced-motion: reduce` | tray renders at 440px, no travel |

### Tests

17 new, all green: `src/context/CartContext.test.js` (7 — the merge, the single
toast, the skip rule, the "nothing added" path, `openDrawer: false` and the
return value, the stock clamp, and the four sentence-case toasts) and
`src/components/CartDrawer/CartDrawer.test.js` (10 — `freeShippingThreshold` for
the lowest bar, inactive/zero/non-numeric methods and the null case;
`crossSellFor` for each preference, the two exclusions, the limit, the empty-cart
fallback and the nothing-qualifies case).

### Verification

`CI=true npm run build` → **Compiled successfully**, exit 0, no warnings.
`npm test -- --watchAll=false` → exit 0, **6 suites passed / 1 skipped, 61
passed / 50 skipped of 111**.
`grep -rn "FREE_SHIPPING_THRESHOLD\|FLAT_SHIPPING\|Sualkuchi\|looms" src/components/CartDrawer src/context/CartContext.js` → **0**.
`grep -rn "FREE_SHIPPING_THRESHOLD" src --include=*.js | grep -v "constants.js\|storeSettings.js\|tokens.js"` → **1**, and it is
`src/config/brand.js:109`'s `{{FREE_SHIPPING_THRESHOLD}}` placeholder TOKEN, not
the constant (see Open TODOs).
`db.json` untouched. `src/services/api.js` untouched — reads only
(`shipping.getMethods`, `products.getAll`, `coupons.validate`). No dependency
added. No admin change. `Header.js` unchanged.

---

## Prompt 13 record (2026-09-07)

### What the close of the page now is

Four bands on `--sf-color-surface` — a shade above the page ground, so the
footer is its own room rather than a tint — opened by one
`.sf-hairline--gradient` and divided by plain `--sf-color-border` hairlines:

| Band | Left | Right |
|---|---|---|
| 1 Invitation | `<Logo variant="wordmark" width={220}>` under a visually-hidden `h2#footer-heading`, `brand.tagline` in Fraunces, `brand.signatureLines[3]` | "Stay close to the farm", the note, the email field and the Subscribe pill |
| 2 Directory | `LegalNote` — `brand.legalNote`, verbatim | four `<nav>` columns: Shop by category · Rituals · Company · Help |
| 3 Assurances | `<address>` rows + the social marks | "We accept" + the four payment marks at 60% |
| 4 Colophon | BAOPCL copyright, the brand-of line, GSTIN/CIN when resolved | Privacy · Terms · Cookies · Shipping & Returns |

The old band's `TRUST_ITEMS` promises strip is **gone** (the trust strip is
Prompt 15's, on the home page), and with it the last surface that could have
quoted a free-shipping figure the store has never set.

### One grid, twice

`--sf-footer-grid` is declared on `.footer` and consumed by BOTH band 1 and
band 2, so the newsletter starts exactly where the link columns start and the
ownership note sits exactly under the wordmark. Mobile first, four steps:

| Viewport | `--sf-footer-grid` | gap | Layout |
|---|---|---|---|
| ≤480 | `minmax(0, 1fr)` | 32px | one column; the four headings are ONE `<Accordion multiple>`, all closed |
| ≥481 | `repeat(2, minmax(0, 1fr))` | 32px | brand / newsletter / note rows span; link columns 2×2 |
| ≥1024 | `1.2fr repeat(4, minmax(0, 1fr))` | 32px | note in track 1, four columns beside it; newsletter `3 / -1` |
| ≥1280 | `1.6fr repeat(4, minmax(0, 1fr))` | 48px | the same, wider |

That is also why the prompt's five bullets fit into four bands: the farmer-owned
note is the directory band's wide first track, not a strip of its own.

### The four columns are DATA

`loadFooterData()` is a module-level promise over `categories.getAll()` +
`rituals.getAll()` — the two reads the mega panel already makes, but not the
four, so a page does not fetch concerns and hero products for a band that never
renders them. Seven categories through `categoryPath()` (which sends the
`kind: "rituals"` category to `/rituals`, so the two columns cannot disagree)
plus **All products**; three rituals through `ritualPath()` plus **Build your
ritual**; Company (Our Story · Why LAMIKAA · Impact `#impact` · Contact ·
Offers, deals-gated — dropped in the seed, whose `deals_config.enabled` is
`false`); Help (FAQ · Shipping & Returns · Privacy · Terms · Cookies · My
Orders · Wishlist). A failed load leaves the two static entries standing: a
footer that cannot reach the API is shorter, not broken.

### Nothing unresolved reaches type

Every row that could carry a `{{TOKEN}}` goes through `resolveOrNull`:

| Row | With the committed seed | With a value set |
|---|---|---|
| `<address>` (address / email / phone / hours) | not rendered at all | three rows, `mailto:` and `tel:` hrefs — verified by PATCHing `settings.store` and reverting |
| social marks | row absent (all five blank or tokens) | one 44px Instagram circle with the real href — verified by PATCHing `settings.social` and reverting |
| GSTIN / CIN | rows absent | `GSTIN <n>` / `CIN <n>` — verified by temporarily resolving `brand.legal` and reverting |

`document.querySelector("footer").innerText.includes("{{")` was **false** in
every one of those states, and no `href` ever carried a token.

### The newsletter contract is untouched

`isEmailValid()` gate → `apiService.leads.createNewsletter(email)` → success or
error, with the six-second revert to the field. Only the copy changed
("Letters from LAMIKAA" → **"Stay close to the farm"**, and the note to "New
products, farm stories and the occasional offer — no noise."). Verified live in
mock mode: an invalid address set `aria-invalid="true"` and a `role="alert"`
line (`aria-describedby` then naming both the note and the error), typing
cleared it, and a valid address wrote lead **id 3** as
`{ type: "newsletter", status: "subscribed" }` — the shape Admin → Leads
renders. `db.json` was reverted afterwards and is untouched in this commit.

### Deletions

- `src/components/Newsletter/{Newsletter.js,Newsletter.module.css}` —
  `grep -rn "components/Newsletter" src --include=*.js` was **0** before the
  delete and is **0** after. It was a second, worse copy of this same flow.
- `FREE_SHIPPING_THRESHOLD` in `constants.js`, and its dead
  `?? positive(FREE_SHIPPING_THRESHOLD)` fallback in `fillStoreCopy`. The
  `{freeShipping}` handling **stays** — FAQ 6 still carries the token and still
  loses its whole sentence while no shipping method sets `freeAbove`.
  `grep -rn "FREE_SHIPPING_THRESHOLD" src` returns **2**, both the
  `{{FREE_SHIPPING_THRESHOLD}}` placeholder STRING (`brand.js:109`, and
  `storeSettings.js:183` where `fillStoreCopy` emits it).
- The old footer's four `--sf-footer-*` aliases over
  `--sf-color-brand-green-deep`, which the band no longer needs now that its
  ground is a first-class token.

### New: `src/components/brand/LegalNote.{js,module.css}`

Takes no `children` and no text prop on purpose — a caller that could pass its
own string is a caller that can drop a legal qualifier (BRAND.md §3.9 rule 2).
It renders `brand.legalNote` verbatim behind a small gold leaf (`aria-hidden`),
with a `compact` variant for a tight slot. Prompts 17, 25 and 28 reuse it.

### Accessibility

- Outline: `h2` "LAMIKAA NATURALS" (visually hidden, `id="footer-heading"`,
  `aria-labelledby` on the `<footer>`) → four `h3`. Identical at every width:
  the accordion is given `headingLevel="h3"`. The wordmark carries `alt=""`, so
  the brand is announced once, not twice.
- Landmarks: four `<nav aria-labelledby>` above 480px; one
  `<nav aria-label="Footer directory">` at or below it. The colophon is
  deliberately NOT a landmark — its four links are the Help column again.
- The disclosures come from `ui/Accordion`: real `<button>`s in headings with
  `aria-expanded` / `aria-controls`, `role="region"` panels, ArrowUp/Down/Home/
  End between headers, and `visibility: hidden` on a collapsed panel so its
  links leave the tab order. `multiple`, `defaultOpen` unset → all closed.
- Newsletter: labelled field, `aria-describedby` to the note (and to the error
  when there is one), `aria-invalid`, `role="alert"` on the error and
  `role="status"` on the success line.
- Social links carry the platform name as `aria-label`; the payment SVGs are
  `role="img"` with their own labels.
- 44px everywhere: disclosure rows and social circles are 44px in the flow;
  the small type in the columns, the colophon and the contact block takes an
  invisible 44px band under `@media (pointer: coarse)`.

### Browser QA (Chromium 1194, mock mode, `npm run dev`)

360 · 390 · 414 · 480 · 768 · 1024 · 1280 · 1440.

- **No horizontal scroll at any width** (`scrollWidth === clientWidth` at all
  eight). `.footer { overflow-x: clip }` is what holds the `.sf-glow` bleed in —
  `clip`, not `hidden`, so no scroll container is created.
- Ground measured `rgb(20, 20, 22)` = `--sf-color-surface`.
- ≤480: four `button[aria-expanded="false"]`, one nav. ≥768: zero buttons,
  four navs. The wordmark paints 160px at ≤480 and 220px from 768.
- Contrast over the band, measured: eyebrow **12.99:1**, column link
  **9.00:1**, contact row **9.00:1**, colophon and micro-links **7.00:1**,
  tagline **16.89:1**. Floor 7.00:1, all clear of 4.5:1.
- Tagline measured **28px** at 1280 (`--sf-text-xl` at the top of its clamp) —
  the spec figure, from the token rather than a literal.
- `prefers-reduced-motion: reduce` zeroes the link underline's transition
  (`0s, 0s` vs `0.32s, 0.16s`); the token layer does it, nothing here re-asks.
- At ≤768 the colophon reserves `64px + 32px + env(safe-area-inset-bottom)` so
  the fixed `BottomNav` never covers the last line.
- The console errors in the sandbox are `ERR_CONNECTION_RESET` on
  `res.cloudinary.com` and the Iconify API — network, not the app (the wordmark
  and the accordion chevrons are the only things affected, and both are served
  in a normal environment). Carried from Prompt 11's TODO.

### Verification

`CI=true npm run build` → **Compiled successfully**, exit 0, no warnings.
`npm test -- --watchAll=false` → exit 0, **6 suites passed / 1 skipped, 61
passed / 50 skipped of 111**.
`test ! -d src/components/Newsletter` → true.
`grep -rn "Letters from the loom\|Authentic Assamese\|Sualkuchi" src/components/Footer` → **0**
(and 0 for "Meghali" and "silk" across `Footer/` and `brand/LegalNote.js`).
`grep -rn "FREE_SHIPPING_THRESHOLD" src | wc -l` → **2**, both the placeholder
token string.
`db.json`, `src/services/api.js` and every admin screen are **untouched** — this
prompt reads two existing storefront endpoints and writes through one existing
lead endpoint. No dependency added.


## Prompt 14 record (2026-09-07)

### What the top of the home page now is

The admin-managed banner is gone. `src/components/HeroSection/` is deleted and
`src/pages/Home/Home.js:421` renders `<HeroCarousel />` — **one slide per hero
product**, eight at launch, in the merchant's `heroOrder`.

| Region | Contents |
|---|---|
| Copy (left ≥769px, second on mobile) | `sf-eyebrow` `Black Rice Ritual · 03 / 08` · the `h1` from `p.heroHeadline` (falls back to `p.promise`) · `Price product={p} size="sm"` · `p.heroSubtext` (falls back to `p.shortDescription`) · `Button variant="primary" size="lg"` **Explore the {shortName}** → `productPath(p)` · `Button variant="addToCart" size="lg"` **Add to Cart**, `disabled` and **"Coming soon"** when `p.priceTBA` · a `Chip variant="trust"` per `p.badges` |
| Rail (`HeroIndex`) | ‹ › 44px glass circles · pause/play · `01 — 08` counter · a signature-gradient progress hairline · eight product-name buttons (`aria-current`, gold gradient underline, scroll-snap ≤1024 / two wrapped rows ≥1025) |
| Media (right ≥769px, FIRST on mobile) | one absolutely-positioned layer per slide inside one `GlowWrap tone="duo" intensity={0.24} breathe`; each layer is `CloudinaryImage` with the product's `crop`, `pad`, `fit="contain"`, `plate`, `widths=[480,768,1080]`, `sizes="(max-width: 768px) 80vw, 40vw"` |
| Ground | the page ground, plus a non-breathing `.sf-glow--gold` at `--sf-glow-opacity: .12` behind the copy, ≥1025px only. No imagery, no scrim. |

`<div id="hero-sentinel">` is the hero's opening 140px; `Header.js`'s observer
needed no change.

### Composition

- **≤768** card first (80vw, max 420px, `ar_1:1`), then the copy; headline
  `--sf-text-4xl`, subtext 16px, CTAs stacked (capped at 30rem so a 768px pill
  is not a banner); section height content-driven.
- **769–1024** `1.05fr 1fr`, card 420px at `ar_4:5`, subtext 18px,
  `min-height: calc(100svh - 100px)` with a `100vh` fallback under it.
- **≥1025** the same split, card up to 560px, headline `--sf-text-5xl`, the
  ground glow on, the name index wrapped to two rows.

### Motion

Crossfade `--sf-duration-slow` (600ms) `--sf-ease` + scale 1.02→1; copy replaced,
never slid; progress hairline linear, frozen with `animation-play-state` in step
with the banked timer; index underline `--sf-transition-fast` (160ms); ≤8px
pointer parallax on `(min-width: 1025px) and (pointer: fine)`.

Autoplay is `intervalMs` (6500) per slide, and BANKS its remainder on every
pause — hover (when `pauseOnHover`), focus within, `document.visibilitychange`
hidden, the pause button, and `body[data-drawer-open]` (a `MutationObserver` on
the flag `hooks/useOverlayFlag` reference-counts). Under
`prefers-reduced-motion` it never starts, the pause button and the progress bar
are not rendered, the plate does not breathe, the parallax is not attached and
the layers lose their scale — arrows and the index stay.

### `heroConfig.js`

- **New:** `HERO_INTERVAL_MIN_MS` (3000), `HERO_INTERVAL_MAX_MS` (15000),
  `DEFAULT_HERO_CONFIG.intervalMs` 5000 → **6500**, `showPause: true`.
  `normalizeHeroConfig` clamps `intervalMs` to the new pair and resolves
  `showPause: cfg.showPause !== false`.
- **`@deprecated — removed in Prompt 34`** (the temporary admin screen is the
  only importer): `HERO_BACKGROUND_TYPES`, `HERO_TEXT_ALIGNMENTS`,
  `HERO_IMAGE_POSITIONS`, `HERO_DEVICES`, `DEFAULT_HERO_HEIGHTS`,
  `DEFAULT_HERO_SECONDARY_CTA`, `DEFAULT_HERO_OPENERS`, `DEFAULT_HERO_SLIDE`,
  `HERO_MIN_DURATION_MS`, `HERO_MAX_DURATION_MS`, `HERO_FALLBACK_SLIDES`,
  `normalizeHeroHeights`, `normalizeHeroSlide`, `normalizeHeroSlides`,
  `heroSlideDuration`, `heroSlideOverlay`, `heroStageVars`.
- `HERO_FALLBACK_IMAGE` no longer exists (deleted in Prompt 07) — see the
  decisions log.

`db.json → heroConfig` and Admin → Storefront → Hero Section → Section settings
carry `showPause` and the 3–15s bound in step; `admin.updateHeroConfig` replaces
the whole record, so no write path needed a change.

### Verification (Chromium 1194, mock mode, real Cloudinary covers and fonts)

| Check | Result |
|---|---|
| `CI=true npm run build` | exit 0, **no warnings** |
| `npm test -- --watchAll=false` | exit 0 — 7 suites / 72 tests (11 new in `HeroCarousel.test.js`) |
| `test ! -d src/components/HeroSection` | passes |
| `grep -rn "HeroSection\|banners" src` | 4 lines, all `AdminHeroSection` (the admin screen + its two routes) — the deleted storefront component has no references left |
| LCP element | the first label card `<img>`, `loading="eager"`, `fetchpriority="high"`, `ar_1:1` at 390 / `ar_4:5` at 1280; slides 2–8 `loading="lazy"` and mounted in a `requestIdleCallback` pass |
| CLS — load | **0.040** at 390, **0.029** at 1280 |
| CLS — eight-slide walk | **0.004** at 390, **0.003** at 1280 (was 0.178 / 0.025 with flat em reservations) |
| Autoplay | advances at ~6.5s; held through hover, focus, the pause button (`aria-pressed`) and an open cart drawer |
| Keyboard | ←/→ step, Home/End jump, index buttons jump; 12 hero tab stops in DOM order (Explore → Add to Cart → ‹ → › → pause → the eight names); the sizer contributes none |
| Touch (CDP) | 120px left advances, 120px right returns, 25px ignored, a vertical drag scrolls the page and holds the slide |
| Add to Cart | slide 1 opens the drawer with "Black Rice Face Wash · 1 · ₹390.00"; slide 3 (`priceTBA`) is a disabled "Coming soon" |
| Header | transparent at scroll 0, `sf-glass sf-glass--strong` at 400px, transparent again on return |
| Reduced motion | no autoplay over 8s, no breathe animation, no progress bar, no pause button, layer transform `none`; arrows + 8 index buttons kept |
| Fallbacks | `enabled: false` → hidden `h1` "LAMIKAA NATURALS" + wordmark + tagline + "Shop the Black Rice Range" → `/shop`, no carousel role. json-server stopped → identical render |
| 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 | `document.scrollWidth === innerWidth` at every width; headline ≤3 lines at 12ch; card 288/312/331/420/420/560/560px; right gutter 41px at 1280 and 1440 |
| Admin | Hero Section → Section settings shows "Pause / play button" and a 3–15s interval at 6.5; zero console errors |

### Observation for a later prompt

The scrub's and the soap's `crop` rectangles are wider than 4:5, so `c_pad,b_auto`
letterboxes them onto a light ground sampled from the label's own edges — correct
behaviour (the artwork is never sliced), but it reads as pale bands on the dark
plate where the face wash's taller crop fills it. Worth a look when the crops are
reviewed in Prompt 26/33; no code change belongs here.


## Prompt 15 record (2026-09-07)

### What was built

| File | Lines | What it is |
|---|---|---|
| `components/TrustStrip/TrustStrip.js` | 86 (was 43) | **Rewritten.** The four promises, from `brand.trustBadges` + `brand.originBadge`. One named export, `trustPromises()`. |
| `components/TrustStrip/TrustStrip.module.css` | 161 (was 106) | **Rewritten.** The `.sf-glass` band: 56px, centred; 48px snap scroller with edge fades under 640px; no backdrop blur ≤768px. |
| `components/TrustStrip/TrustStrip.test.js` | 29 | **New.** 3 tests pinning the words to the config and the icons to their positions. |
| `components/catalogue/CategoryCard.js` | 94 | **New.** `GlassCard interactive glow="violet"`, one anchor, 1:1 plate, count chip. |
| `components/catalogue/CategoryCard.module.css` | 114 | **New.** |
| `components/catalogue/index.js` | 9 | **New.** The barrel for the folder Prompts 18, 23 and 24 fill. |
| `components/home/ShopByCategory.js` | 170 | **New.** The section: one `Promise.all`, seven cards, eleven concern chips. |
| `components/home/ShopByCategory.module.css` | 143 | **New.** The 4+3 / 3 / 2 / snap-scroller grid. |
| `components/storefront/ProductCard.js` | 304 (was 213) | **Rewritten.** Same props, same DOM order, new card. Three named exports: `concernLabel`, `stepLabel`, `plateSources`. |
| `components/storefront/ProductCard.module.css` | 370 (was 415) | **Rewritten.** |
| `components/storefront/ProductCard.test.js` | 112 | **New.** 10 tests over the three pure exports + the badge default. |
| `theme/tokens.js` | +16/−2 | `TRUST_BADGE_CATALOG` +3, `STOREFRONT_CONFIG.trustBadges` re-pointed. |
| `components/storefront/TrustBadges.js` | +25/−1 | sprout / leaf / spark paths; drops a badge with no resolvable label. |
| `config/brand.js` | +6/−0 | `originBadge`. |
| `theme/storefront-primitives.css` | +4/−1 | `text-decoration: none` on an interactive chip (closes the Prompt 09 TODO). |
| `pages/Home/Home.js` | +31/−57 | Mounts `<TrustStrip/>` and `<ShopByCategory/>` under the hero; the old closing PROMISES row and its dead `PROMISE_DETAIL` map are deleted. |
| `pages/Home/Home.module.css` | +16/−78 | `.trustEdge` replaces the retired promises block. |

### Where the four promises come from

`brand.trustBadges` = `["Farmer to Consumer", "100% Organic", "Result Oriented"]` (BRAND.md §3.9 rule 4) and
`brand.originBadge` = `"Rooted in Assam & Northeast India"` (condensed from BRAND.md §3.1). The SAME three words
now print in four places from that one array: the trust strip, the hero's chips (Prompt 14), every product card's
badge row (via `normalizeProduct`'s `toArray(raw.badges, brand.trustBadges)`) and the PDP's `TrustBadges` (via the
new `TRUST_BADGE_CATALOG` entries, whose labels are `brand.trustBadges[i]`, not literals). Changing the wording is
one edit in `brand.js`.

### The card, state by state

| Product | Step | Concerns | Price | Action |
|---|---|---|---|---|
| Face Wash | `01 · Cleanse` | Cleansing, Brightening | ₹390.00 | Add to Cart |
| Goat Milk Soap | `01 · Body cleanse` | Nourishing, Cleansing | ₹90.00 | Add to Cart |
| Exfoliating Face Scrub | `02 · Polish` | Exfoliation, Texture | ₹349.00 | Add to Cart |
| Body Wash · Face Mask · Face Mist · Face Serum · Moisturizer Gel | their own | ≤2 | "Price on launch" | **Coming soon**, disabled |
| any with `stock === 0` | — | — | — | **Out of stock**, disabled, plate scrim |
| any with `totalReviews > 0` | — | — | — | stars + count; **nothing at all** otherwise |

`Price` is passed `live={false}`, so eight unpriced cards are zero live regions (Prompt 11's TODO). The discount
badge is `resolvePrice(p).discount` — a real `comparePrice` above the selling price, nothing else; no seeded product
has one, so it is unexercised in this pass.

### Verification

- `CI=true npm run build` — **exit 0, "Compiled successfully", no warnings.**
- `npm test -- --watchAll=false` — **9 suites passed / 1 skipped, 85 passed / 50 skipped**, up from 72 (13 new).
- `grep -rn "bridal\|Premium\|No ratings yet" src/components/storefront/ProductCard.js` → **0**.
- `grep -n "Authentic Silk\|Handwoven" src/components/TrustStrip/TrustStrip.js src/theme/tokens.js | wc -l` → **0**.
- Meghali sweep over every file this prompt touched (`meghali|silk|saree|handloom|muga|sualkuchi|bridal|drape|weav`) → **0**, except the five pre-existing lines in `Home.js` sections 1–6 that Prompt 22 owns (logged as a TODO).

### Browser QA (Chromium 1194, mock mode, real Cloudinary crops and real faces)

Chromium could not reach the sandbox's egress proxy directly, so every cross-origin request was fulfilled through a
Node `fetch` (`NODE_USE_ENV_PROXY=1`) — the label crops, the wordmark and both font families are the real files.

- **Ten routes** (`/`, `/shop`, `/products`, `/category/face-care`, `/rituals`, `/shop?concern=hydration`,
  `/search?q=black`, `/wishlist`, a PDP, `/special-offers`): **0 console errors, 0 page errors, 0 horizontal scroll,
  no `{{` anywhere, no 404s.**
- **Seven widths** (360 / 390 / 414 / 768 / 1024 / 1280 / 1440) on the home page: `scrollWidth === clientWidth` at
  every one.
- **The strip.** 1280: band 58px, list 56px, `backdrop-filter: blur(20px)`, wrapper `margin-top: -28px`. Touch 390:
  48px, `backdrop-filter: none`, `margin-top: 0`, `scrollWidth 755 > clientWidth 390` (it scrolls).
- **The grid.** 1280: row 1 spans x=20→1260, row 2 spans x=178→1102 — **both centre on 640px.** 1024: 3 + 3 + 1.
  768: 2 columns. 390: a 76vw snap scroller.
- **The counts, from the API, not from this file:** Face Care 6 · Body Care 2 · Cleansers 3 · Serums **1 product**
  (singular) · Moisturizers & Mists 2 · Masks & Scrubs 2 · Rituals **3 rituals** → `/rituals`. Concern chips →
  `/shop?concern=cleansing` … eleven of them.
- **The card's handlers.** Heart: `aria-pressed` false → true, and the header's wishlist count follows. Add: the
  label walks "Add to Cart" → **"Added"** (measured at 350ms, in the `aria-live` node) → back at ~1.5s, and the cart
  count goes to 1. Both call the handler the call site passed — the card wires nothing itself.
- **Tab order inside a card:** plate link → heart → name link → Add to Cart → the next card's plate. The action is
  last in the DOM at every breakpoint.
- **The reveal.** Fine pointer: the action is `opacity: 0` at rest and `1` on hover, and it stays in the tab order
  while hidden. Emulated touch phone: `grid-row: 3`, `opacity: 1`, `pointer-events: auto`, button 44px, heart 44px.
- **Reduced motion:** cards arrive at `opacity: 1` with `transform: none` (the reveal is skipped), the glow's
  transition is `none`, no errors.
- **The plate's delivery URL** on a catalogue row:
  `…/c_crop,x_1700,y_0,w_1600,h_744/c_pad,ar_1:1,b_auto/f_auto,q_auto,w_640/…` with a four-candidate srcSet
  (320/480/640/900w) and the card's `sizes`. On a wishlist snapshot (no Cloudinary crop recorded): the padded URL
  and **no srcSet**.

### The one thing worth looking at again

The wishlist's plates show the whole cover shot letterboxed rather than the label crop, because the wishlist
snapshot stores `image` and not `media[].crop`. It is correct behaviour (the pack is never sliced) and it is a
pre-existing property of the snapshot, not of this card — but it reads as a pale block beside the catalogue cards
that do have crops. Logged as a Prompt 30 TODO with the two candidate fixes.


## Prompt 16 record (2026-09-07)

### What was built

| File | Lines | What it is |
|---|---|---|
| `src/components/catalogue/ProductChapter.js` | 292 | One product as a full editorial spread. Shared with the shop page (Prompt 23) through `variant`; already writes the `data-chapter` attribute that page's index rail will read. |
| `src/components/catalogue/ProductChapter.module.css` | 298 | The alternating split screen, the sticky media, the two overflow/rhythm guards, and the ≤768px de-blur. |
| `src/components/catalogue/ProductChapter.test.js` | 75 | 10 tests over the three pure exports (`chapterNumeral`, `stepEyebrow`, `showcaseProducts`). |
| `src/components/home/ProductShowcase.js` | 149 | The heading, the eight chapters, the seams, the skeletons, the fetch. |
| `src/components/home/ProductShowcase.module.css` | 66 | The seam, the heading's rhythm, and the loading shape. |
| `src/components/catalogue/index.js` | +1 | `ProductChapter` added to the barrel. |
| `src/pages/Home/Home.js` | +5 | `<ProductShowcase/>` mounted after `<ShopByCategory/>`; the page's own section map updated. |
| `db.json` | 5 crops | Corrected `media[0].crop` rectangles — data only, no schema change. |

### The crop verification (Task 4)

All eight covers were downloaded at their original resolution and each rectangle was measured against the file
rather than eyeballed: for every candidate crop, the four border rows/columns and the four 12×12 corners were
tested for near-white pixels, and the border's average colour was checked because that is what Cloudinary's
`b_auto` samples to pick the pad. Each final rectangle was then rendered at `c_pad,ar_4:5,b_auto,w_900` and read
on screen.

| # | Product | Result |
|---|---|---|
| 1 | Face Wash | verified, unchanged (`x_1050,y_100,w_1500,h_3200`) |
| 2 | Goat Milk Soap | `h_1269 → h_1248` — 21 rows of **white carton canvas** below the gold band |
| 3 | Body Wash | `x_715,y_30,w_395,h_710 → x_716,y_43,w_391,h_688` — **white in all four rounded corners** |
| 4 | Face Mask | `x_480,y_0,w_370,h_401 → x_478,y_12,w_356,h_382` — **white rules at rows 0–8 and 397–400**, and re-centred |
| 5 | Face Mist | verified, unchanged (`x_320,y_20,w_410,h_710`) |
| 6 | Exfoliating Face Scrub | `x_1700,y_0,w_1600,h_744 → x_1767,y_2,w_1428,h_740` — a **1px light-grey rim** made `b_auto` letterbox the whole frame light grey |
| 7 | Face Serum | `x_460,y_15,w_410,h_530 → x_432,y_12,w_464,h_534` — the **gold band ran edge to edge** with 2px of margin |
| 8 | Moisturizer Gel | verified, unchanged (`x_240,y_40,w_330,h_680`) |

The scrub was the worst of them: a 6.67:1 wrap label padded onto a `#C5C5C5` ground because one row of pixels at
the top and bottom of the raw file is a light rim. It is the reason the audit checks the border's *colour* and
not only its whiteness.

### Verification run

- `CI=true npm run build` — exit 0, **Compiled successfully, no warnings**.
- `npm test -- --watchAll=false` — 11 suites (1 skipped: the live API), **95 passed**, 10 of them new.
- Browser QA (Chromium 1194, mock mode, the eight pack shots served from locally rendered crops because this
  environment's proxy resets Cloudinary):

| Check | Result |
|---|---|
| 8 chapters, hero order, alternating sides | pass — media in column 1 / column 2 alternating, names in `heroOrder` |
| horizontal overflow at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 | **0px at every width** (69px at 768 before `overflow-x: clip`) |
| sticky media on desktop | **exactly 112px** through a 600px scroll at 1440, 1280 and 1024 |
| sticky on a phone | `position: static`, one column, media first, no 80svh floor |
| panel blur ≤768px | `backdrop-filter: none` |
| quick add | cart drawer opens, SweetAlert toast fires, one line stored |
| price states | 3 products "Add to Cart", **5 "Coming soon" and disabled** |
| keyboard | two stops per chapter, "Explore more" then "Add to Cart", in DOM order |
| reduced motion | every panel and plate at opacity 1, `transform: none` |
| headings | one `h1` on the page, **exactly one `h2` per chapter** |
| CLS while scrolling all 8 chapters with the images delayed 400ms each | **0.038 desktop / 0.040 mobile — every recorded shift attributed to `HeroCarousel` and the header, none to a chapter** |
| measurements at 1280 | numeral 36px · name 40px · gap 64px · CTAs 48px · promise 18px · fragrance 13px · description 52ch (462px) · panel radius 28px / padding 40px |
| measurements at 360 | numeral 28px · name 28px · CTAs stacked, full width, 48px |
| unresolved `{{TOKENS}}` on the home page | none |

### The one thing worth looking at again

The sticky beat is short — about 170px of travel at a 900px-tall viewport, because the row is only as tall as the
text panel and the pack is capped at 62svh. It reads correctly (the pack holds still for the whole time the panel
is being read and only leaves as the chapter itself leaves), and it gets longer on a shorter browser window, but
if the effect wants more room the lever is the cap, not `min-height`: dropping the pack to 55svh buys another
60px at the cost of a visibly smaller label card. Worth a look with real eyes at 1440×900 before Prompt 23 reuses
the component for the shop page, where `variant="shop"` removes the floor entirely.


## Prompt 17 record (2026-09-07)

### What was built

| File | Lines | What it is |
|---|---|---|
| `src/components/brand/ValueChain.js` | 153 | The seven-step chain as a real ordered list. Reusable by Prompts 20 and 28. |
| `src/components/brand/ValueChain.module.css` | 296 | Three layouts from one markup, every distance a custom property on the list. |
| `src/components/brand/ValueChain.test.js` | 79 | 9 tests over the four pure exports (`stepNumeral`, `isBrandStep`, `gradientWordIndex`, `teaserCopy`). |
| `src/components/home/AboutTeaser.js` | 176 | The band: heading, landscape, paragraphs, chain, legal note, CTA — all of the copy from the API. |
| `src/components/home/AboutTeaser.module.css` | 121 | The surface band, the pull-quote, the `1fr 1.1fr` body and the glow guard. |
| `src/pages/Home/Home.js` | +5 | `<AboutTeaser/>` mounted after `<ProductShowcase/>`; the page's own section map updated. |

No `db.json` or `api.js` change: the section READS `siteContent.home.aboutTeaser`, seeded in Prompt 06 and
already served identically by both api modes (`GET /siteContent` in mock, `GET /content/home` live). The admin
editor for it is Prompt 34's.

### The two defects the browser found, and reading did not

Both were invisible in the source and obvious on screen, which is why the QA pass measured rather than looked.

**1. "FPC" broke across two lines at 1280px.** `src/index.css:139` applies `overflow-wrap: anywhere` to
`p, li, dd, figcaption, blockquote` as the global long-token guard, and the label spans inherit it from their
`<li>`. `anywhere` (unlike `break-word`) also lowers an element's intrinsic min-content size to a single
character, so when the row's base size overshot the 1232px measure by 8px, flex shrink was free to split every
label mid-word. Two changes fixed it: `overflow-wrap: break-word` on the label (breaks only what would overflow,
leaves the minimum at the longest word), and moving the connector's flex basis from its 48px CEILING to its 24px
FLOOR so the natural row fits the measure and the steps — not the labels — absorb the slack.

**2. The sequential reveal never played.** `App.js:157` is `<AnimatePresence mode="wait" initial={false}>`.
`initial={false}` tells framer-motion to ignore the `initial` prop of every descendant present at the route's
first paint and mount it at its `animate` state instead. `reveal(reduce, { inView: true })` returns
`initial` / `whileInView` / `viewport` / `transition` and **no `animate`** — so a component that ships WITH the
route mounts straight at the whileInView target and its reveal is a no-op. The sections around it look fine only
because they mount their revealed items after a fetch, on a later commit. Bisected in Chromium against a control
`motion.div` in the same component: `initial`+`animate` rendered inline styles, every `whileInView` variant
rendered none, at any position in the tree, in either file. Naming the resting state as `animate` as well is one
prop, no remount and no flash, and reduced motion still attaches nothing.

Before: the seven `<li>` carried no `style` attribute at any moment, before or after scrolling into view.
After (viewport 1280, instant scroll, opacity sampled every 80ms):

```
   0ms  0.00 0.00 0.00 0.00 0.00 0.00 0.00
 160ms  0.48 0.26 0.02 0.00 0.00 0.00 0.00
 320ms  0.90 0.86 0.80 0.72 0.59 0.40 0.16
 640ms  1.00 1.00 1.00 0.99 0.99 0.98 0.96
```

Under `prefers-reduced-motion: reduce` the same seven elements have **no `style` attribute at all**, off screen,
mid-scroll and settled.

### Responsive measurements (Chromium 1194, mock mode, dev server)

`rows` counts visual rows (an item starts a new one only when its top clears every previous item's bottom, so a
wrapped label does not read as a second row); `conn` is the measured connector width; `ovf` is any `<li>` outside
the `<ol>`'s box.

| Viewport | rows | connectors | labels on 2 lines | ovf |
|---|---|---|---|---|
| 360 / 390 / 414 | 7 | 24px (vertical) | — | none |
| 768 | 7 | 24px (vertical) | — | none |
| 1024 | 2 (4 + 3) | 48px | — | none |
| 1025 / 1060 | 1 | 24px (the floor) | Value Addition, LAMIKAA Naturals, Farmer Members | none |
| 1100 | 1 | 28px | — | none |
| 1200 | 1 | 44px | — | none |
| 1280 / 1366 / 1440 / 1920 | 1 | 48px | — | none |

Document-level horizontal scroll was measured with the section shown and hidden at 360/390/414/768/1024: equal at
every width (`scrollWidth === clientWidth`). Before `overflow-x: clip` was added, the section alone was adding
22–94px of it — the gold lamp is 110% of its box plus a 6% offset, and on the stacked layouts the photograph is
the full measure.

### Accessibility

- Aria tree of the chain: `list "How value reaches farmers"` → seven `listitem`s, `01 Farmer` … `07 Farmer Members`.
- **Zero focusables in the chain.** The whole band has ONE tab stop: the "Our Story" link.
- Contrast on `--sf-color-surface` (#141416): labels 16.48:1, the gold "LAMIKAA Naturals" step 12.99:1, the legal
  note 9.00:1 — all far past AA.
- The connectors and their arrows are `aria-hidden`; the numerals are read as part of each item, which is the
  order the diagram is drawing.

### The three data states, all exercised in the browser

| State | What renders |
|---|---|
| Seeded block | eyebrow, pull-quote with **farmers** gilded, landscape, two paragraphs, chain, legal note, CTA |
| Image host unreachable (request aborted) | identical, with `onImageError` swapping in the shared placeholder |
| `siteContent` unreachable (request aborted) | quote (`brand.signatureLines[3]`), chain, legal note, CTA — **no image, no paragraphs, no invented copy** |

### Verification run

- `CI=true npm run build` — exit 0, **Compiled successfully, no warnings**.
- `npm test -- --watchAll=false` — 11 suites (1 skipped: the live API), **104 passed**, 9 of them new.
- `grep -rn "subject to applicable laws" src/components/brand/LegalNote.js src/config/brand.js` → 3 (≥ 1).
- No hard-coded colour, `rgb()` or `hsl()` in either new stylesheet; no Meghali-era name, asset or identifier in
  any touched file; no `dangerouslySetInnerHTML`; no value-chain label typed in a component (the only occurrence
  of "Farmer →" in `src/` is a section comment).
- Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440, plus 1025 / 1060 / 1100 / 1200 / 1366 / 1920 for the
  single-row layout, each with and without `prefers-reduced-motion`.

### Left for later

The external image hosts are blocked from the browser in this environment (`curl` reaches picsum.photos with a
200, the browser issues no request at all and fires no error), so the geometry was verified against a locally
served stand-in of the same 16:10 shape and the broken-image path was exercised separately. The wash and the gold
lamp still want one look at the real Picsum frame on a developer machine — carried into Open TODOs, with the
drop-cap question and the full-measure photograph at 769–1024px.

## Prompt 18 record (2026-09-07)

### What was built

| File | Lines | What it is |
|---|---|---|
| `src/components/catalogue/RitualCard.js` | 178 | One routine as one link: photograph, eyebrow, name, blurb, numbered step strip, duration, CTA. Reusable by Prompt 24. |
| `src/components/catalogue/RitualCard.module.css` | 215 | 20px glass card, 16:10 media, the overlapping strip and its 24px numerals, the ghost CTA. |
| `src/components/catalogue/RitualCard.test.js` | 111 | 15 tests over the four pure exports (`ritualBlurb`, `stepCountLabel`, `gradientWordIndex`, `spotlightCopy`). |
| `src/components/home/WhyBlackRice.js` | 225 | The ingredient spotlight: the three seeded points, and the eight labels that carry the ingredient. |
| `src/components/home/WhyBlackRice.module.css` | 173 | The `0.9fr 1.1fr` body, the 20px gold glyphs, the scrolling "Carried by" row, the glow guard. |
| `src/components/home/RitualsTeaser.js` | 114 | The triptych and the way through to `/rituals`. |
| `src/components/home/RitualsTeaser.module.css` | 93 | Three columns from 769px, one below, an 84vw snap scroller ≤480. |
| `src/components/catalogue/index.js` | +1 | `RitualCard` joins the barrel. |
| `src/pages/Home/Home.js` | +10 | `<WhyBlackRice/>` then `<RitualsTeaser/>` after `<AboutTeaser/>`; the page's own section map extended with 0f and 0g. |

No `db.json` or `api.js` change. Both sections READ: `siteContent.home.whyBlackRice` and
`products.getHeroProducts()` for the spotlight, `rituals.getAll()` + `products.getAll()` for the teaser — all
seeded in Prompt 06 and served identically by both api modes (`GET /siteContent`, `GET /rituals`,
`GET /products` in mock; `GET /content/home`, `GET /rituals`, `GET /products/hero` live). The admin editors for
the ritual and content records are Prompt 34's.

### The one defect the browser found, and reading did not

**The gold check glyphs measured 0×0 in the wrong colour.** `@iconify/react` fetches its icon data at runtime and
renders a bare, unstyled `<span></span>` until the data lands — it forwards neither `className` nor
`aria-hidden` to that placeholder. `<Icon className={styles.glyph} icon="mdi:check-circle-outline" />` therefore
computed to `20px`-wide nothing (`width: 0px`, `color: rgb(247, 245, 240)` — inherited body text, not gold) and
would have shoved each point sideways the moment the icon resolved. Every other `<Icon>` in the repo is
unstyled, which is why no earlier prompt hit it. Fixed by giving the glyph a wrapper `<span>` that owns the box
and the colour; the svg inside is `1em`, so the wrapper's `font-size` IS the glyph's size.

```
before   <li …><span></span><span>Antioxidant-rich, …</span></li>     box 0×0    rgb(247,245,240)
after    <li …><span class=glyph aria-hidden><svg…></span><span>…</span></li>   box 20×20  rgb(245,215,110)
```

### Responsive measurements (Chromium 1194, mock mode, dev server)

`ovf` is `documentElement.scrollWidth - clientWidth`. Every row measured with both sections scrolled into view.

| Viewport | ovf | spotlight body | "Carried by" row | rituals grid | card |
|---|---|---|---|---|---|
| 360 | 0 | 1 col, 328px | scrolls (532 in 328) | flex, `x mandatory` | 302px (84vw) |
| 390 | 0 | 1 col, 358px | scrolls (532 in 358) | flex, `x mandatory` | 328px (84vw) |
| 414 | 0 | 1 col, 382px | scrolls (532 in 382) | flex, `x mandatory` | 340px (max-width) |
| 480 | 0 | 1 col, 448px | scrolls (532 in 448) | flex, `x mandatory` | 340px |
| 481 | 0 | 1 col, 449px | scrolls (532 in 449) | grid, 1 col | 449px |
| 768 | 0 | 1 col, 736px | fits (532 in 532) | grid, 1 col | 736px |
| 769 | 0 | 1 col, 729px | fits | grid, 3 cols | 227px |
| 1024 | 0 | 1 col, 984px | fits | grid, 3 cols | 312px |
| 1280 | 0 | **532.8 / 651.2**, gap 56px | fits | grid, 3 cols | 397px |
| 1440 | 0 | **532.8 / 651.2**, gap 56px | fits | grid, 3 cols | 397px |

Fixed geometry, identical at every width: spotlight media **533×533** (`aspect-ratio: 1`, radius 28px,
`--sf-glow-opacity: 0.16`) · card media **355×222** (16:10) · card padding **20px** · name **Fraunces 22px** ·
points **17px** · glyphs **20×20 gold** · "Carried by" plates **56×56** · step thumbs **40×40**, radius 8px,
`-8px` overlap, 2px `--sf-color-bg` ring · numerals **24×24**.

### Keyboard and reduced motion

Twelve tab stops across both sections, in this order, at every width and under both motion settings:

```
why-black-rice   8 × <a>  "Black Rice Face Wash" … "Black Rice Moisturizer Gel"  → /product/<slug>
rituals-teaser   <a> "The Morning Glow Ritual, 4 steps"    → /rituals/morning-glow
rituals-teaser   <a> "The Evening Renewal Ritual, 5 steps" → /rituals/evening-renewal
rituals-teaser   <a> "The Black Rice Body Ritual, 2 steps" → /rituals/black-rice-body
rituals-teaser   <a> "Build your ritual"                   → /rituals
```

**Each ritual card is exactly one stop** — no nested control, no focusable thumbnail. Under
`prefers-reduced-motion: reduce` no reveal wrapper in either section carries a non-1 opacity, off screen or on.

### The step strips, against the seed

| Ritual | steps | plates rendered | numerals |
|---|---|---|---|
| The Morning Glow Ritual | 4 | 4 | 01 02 03 04 |
| The Evening Renewal Ritual | 5 | 5 | 01 02 03 04 05 |
| The Black Rice Body Ritual | 2 | **3** — step 01's `alternativeProductId` (the body wash behind the soap) | 01 02 |

### Verification run

- `CI=true npm run build` — exit 0, **Compiled successfully, no warnings**.
- `npm test -- --watchAll=false` — 12 suites (1 skipped: the live API), **118 passed**, 15 of them new.
- `grep -n "WhyBlackRice\|RitualsTeaser" src/pages/Home/Home.js` → 4 (2 imports, 2 mounts).
- No hard-coded colour, `rgb()` or `hsl()` in any of the three new stylesheets; no Meghali-era name, asset or
  identifier in any touched file; no `dangerouslySetInnerHTML`; no ingredient claim typed in a component (the
  three points exist in `db.json` only).
- Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440, plus the 480 / 481 / 769 breakpoint edges, each with
  and without `prefers-reduced-motion`.

### Left for later

`res.cloudinary.com` and `api.iconify.design` are unreachable from the browser in this environment, so the eight
"Carried by" plates, the step thumbs and the gold check glyphs all render as correctly sized empty boxes here.
The boxes, the ring, the overlap and the colour were measured; the pictures themselves want one look on a
machine with outbound HTTPS. Carried into Open TODOs, with the `/rituals/<slug>` stub and the unused `compact`
variant, both of which are Prompt 24's.

## Prompt 19 record (2026-09-07)

### What was built

| File | Lines | What it is |
|---|---|---|
| `src/components/brand/NewsletterForm.js` | 172 | The footer's newsletter capture, extracted whole. `{ variant, label, hint, buttonLabel, id, className }`. |
| `src/components/brand/NewsletterForm.module.css` | 175 | One 48px glass field + pill, and the two placements' alignment and stacking widths. |
| `src/components/home/FullPageCta.js` | 252 | The full-viewport stop: photograph, wash, gradient, breathing duo lamp, and the card. |
| `src/components/home/FullPageCta.module.css` | 235 | The four layers, the svh floors, the headline stack and the two-way action row. |
| `src/components/home/FullPageCta.test.js` | 85 | 9 tests over the two pure exports (`splitOnWord`, `ctaCopy`). |
| `src/components/Footer/Footer.js` | +22 / −117 | Mounts `NewsletterForm`; its own form, state, timer and `isEmailValid` import are gone. |
| `src/components/Footer/Footer.module.css` | +9 / −89 | The field's rules move with the field; `.newsletter` keeps only its grid placement. |
| `src/pages/Home/Home.js` | +10 | `<FullPageCta/>` after `<RitualsTeaser/>`; the section map extended with `0h`. |
| `src/theme/storefront-primitives.css` | +19 / −1 | Two fixes: the reduced-motion reset for a duo breather, and the scrim's paint order. |

No `db.json` and no `api.js` change. The section READS `siteContent.home.fullPageCta` (seeded in Prompt 06;
`GET /siteContent` in mock, `GET /content/home` live) and WRITES through the existing
`apiService.leads.createNewsletter` (`POST /leads` in mock, `POST /leads/newsletter` live). The content editor
for the block and the Leads table are Prompt 34's and the admin's respectively.

### The two defects the browser found, and reading did not

Both are in `theme/storefront-primitives.css`, both predate this prompt, and both are exactly what this
section's acceptance criteria are about.

**1. Reduced motion never stopped a duo glow's second lamp.** The reset is written
`.sf-glow--breathe::before, .sf-glow--breathe::after` (one class, specificity 0,1,1); the duo's second lamp is
declared `.sf-glow--duo.sf-glow--breathe::after` (0,2,1) and wins. With `prefers-reduced-motion: reduce` the
violet lamp kept its 10s loop — on this section, and on the hero, which has carried it since Prompt 14.

```
before   ::before animation: none   ::after animation: sf-breathe   document.getAnimations() → 2
after    ::before animation: none   ::after animation: none         document.getAnimations() → 0
```

**2. `.sf-glass--scrim::before` painted over the content, not under it.** An absolutely-positioned
pseudo-element paints in the positioned-descendant layer, which is above the host's in-flow inline text, so the
wash dimmed the very type it exists to make legible. The class is documented — in `GlassCard.js` and in
`BottomNav.js` — as sitting *under* the content. This section is the `scrim` prop's first real consumer.

```
before   brightest headline pixel  rgb(165,163,161)   ( = --sf-color-text under a 35% --sf-color-bg wash )
after    brightest headline pixel  rgb(247,245,240)   ( = --sf-color-text )
```

`z-index: -1` on the pseudo-element plus `isolation: isolate` on the host — the same device `.sf-glow` uses, and
what `.sf-card--hover::before` already does with its lamp. `BottomNav`, the only other user of the class, was
re-checked at 390px: its labels are no longer dimmed and the wash still darkens the page passing beneath it.

### Contrast on the card (Chromium 1194, sampled from the composited page)

Measured against the WORST ground this section can produce: a near-white photograph, desaturated and dimmed by
`.sf-placeholder-media`, under the 82%→94% wash, the 12% screened gradient and 8% white glass. The card ground
sampled **rgb(57,44,54)**. The "no scrim" column is the same measurement with `scrim` off.

| Element | Colour | With scrim | No scrim | Floor |
|---|---|---|---|---|
| Headline (72px / 36px) | `--sf-color-text` | **12.9:1** | 10.0:1 | 3:1 (large) |
| Gradient keyword, gold stop | `#F5D76E` | **9.3:1** | 6.8:1 | 3:1 (large) |
| Gradient keyword, pink stop | `#FF4FD8` | **4.6:1** | 3.3:1 | 3:1 (large) |
| Gradient keyword, violet stop | `#8B5CF6` | **3.1:1** | **1.6:1** | 3:1 (large) |
| Eyebrow | `--sf-color-gold` | **9.9:1** | 7.7:1 | 4.5:1 |
| Lede (`brand.tagline`) | `--sf-color-text-secondary` | **6.9:1** | 5.3:1 | 4.5:1 |
| Newsletter hint | `--sf-color-text-secondary` | **6.9:1** | 5.3:1 | 4.5:1 |
| Ownership note | `--sf-color-text-muted` | **5.9:1** | 4.9:1 | 4.5:1 |

The violet stop at 1.6:1 is the row that made `scrim` non-optional. The palette's own quoted figure for
`#8B5CF6` is 4.65:1 — against the PAGE GROUND `#0B0B0D`, which 8% white glass over a bright photograph is not.

### Responsive measurements (Chromium 1194, mock mode, dev server)

`ovf` is `documentElement.scrollWidth - clientWidth`; `secH` includes the section's 64px of padding.

| Viewport | ovf | min-height | secH | card | headline | actions |
|---|---|---|---|---|---|---|
| 360 × 640 | 0 | 512px (80svh) | 1151 | 347 | 36px | column, full width |
| 390 × 844 | 0 | 675px (80svh) | 1151 | 358 | 36px | column, full width |
| 414 × 896 | 0 | 717px (80svh) | 1154 | 382 | 36.4px | column, full width |
| 768 × 1024 | 0 | 819px (80svh) | 857 | 736 | 45.6px | row, centred |
| 1024 × 768 | 0 | 768px (100svh) | 1173 | 760 | 69.8px | row, centred |
| 1280 × 800 | 0 | 800px (100svh) | 1188 | 760 | 72px | row, centred |
| 1440 × 900 | 0 | 900px (100svh) | 1188 | 760 | 72px | row, centred |
| 1440 × 1080 | 0 | 1080px (100svh) | 1188 | 760 | 72px | row, centred |

Fixed geometry: card max-width **760px**, radius 28px, `backdrop-filter: blur(20px)` — and the SECTION's
`backdrop-filter` is **`none`**, which is the prompt's own guardrail. Field **48px**, pill radius. Glow
`tone="duo" intensity={0.22} size={130} breathe`, 10s with a 2s stagger on the second lamp.

### The glow budget, scanned rather than eyeballed

`.sf-glow--breathe` exists twice on the home page (the hero's stage, this section's card). Every 100px of the
18 410px document was checked against a 900px viewport — **176 positions, maximum 1 breathing glow visible, 0
offenders**. Eight product chapters, the About band, the spotlight and the rituals triptych sit between them, so
no viewport height brings the two together.

### Keyboard and the two forms

Four tab stops in the section, in this order and at every width:

```
<a> "Shop the Black Rice Range"   → /shop     (Button variant="primary" size="lg")
<a> "Meet the farmer-owners"      → /about    (Button variant="secondary" size="lg")
<input id="cta-newsletter-email" type="email">   labelled by a visually-hidden <label>
<button type="submit"> "Subscribe"
```

Both forms were driven for real against JSON Server:

| Surface | Input | Result | Lead |
|---|---|---|---|
| CTA | a valid address | `role="status"` — "Thank you — you are on the list." | `POST /leads` → `type: "newsletter"`, `status: "subscribed"` |
| CTA | `nope` | `role="alert"` — "Please enter a valid email address.", `aria-invalid="true"`, `aria-describedby="cta-newsletter-hint cta-newsletter-error"` | none — the gate fires before the request |
| Footer | a valid address | `role="status"` — the same line, from the same component | `POST /leads` → the same shape |

The two forms' ids are derived from their own `id` base (`cta-newsletter-*`, `footer-newsletter-*`), so the two
mounts on one page cannot collide; a caller that passes no base gets `useId()`. The four QA leads were removed
from `db.json` afterwards (`git diff --stat db.json` → empty).

### Verification run

- `CI=true npm run build` — exit 0, **Compiled successfully, no warnings**.
- `npm test -- --watchAll=false` — 13 suites (1 skipped: the live API), **127 passed**, 9 of them new.
- `grep -n "NewsletterForm" src/components/Footer/Footer.js src/components/home/FullPageCta.js` → 5 (2 imports,
  2 mounts, 1 header note).
- No hard-coded colour, `rgb()` or `hsl()` in either new stylesheet — the wash's `rgba(11,11,13,.82→.94)` is
  written as `color-mix(in srgb, var(--sf-color-bg) 82%|94%, transparent)`, the idiom the primitives sheet
  names. No Meghali-era name, asset or identifier in any touched file; no `dangerouslySetInnerHTML`.
- Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 (and 1440×1080), each with and without
  `prefers-reduced-motion`. Zero page errors in the console across every run.

### Left for later

`picsum.photos` is unreachable from the browser in this sandbox (curl gets a 200, the browser gets
`net::ERR_CONNECTION_RESET`), so every measurement above was taken against a locally-served near-white
stand-in — deliberately the worst case for the wash, so the real frame can only improve the figures. The
composition wants one look at the real photograph, and the desktop card's 1060px height wants Prompt 22's
verdict. Both carried into Open TODOs.

## Prompt 20 record (2026-09-07)

### What was built

Three components, two of them shared with the Why LAMIKAA page (Prompt 28), and one new brand-config key.

- **`brand/Pillars.js` + `.module.css` + `.test.js`** — BRAND.md §3.2's four pillars as one
  `<ul role="list">` of four `GlassCard as={motion.li}`. Each card: a 44px glass circle carrying a
  24px gold glyph, a `Chip variant="step"` numeral 01–04 pushed to the opposite edge, the title in
  Fraunces 22px and the sentence in Manrope 15px `--sf-color-text-secondary`, at 24px padding.
  **Contract:** `pillars` (default `brand.pillars`) · `compact` (drops the circle to 36px, the glyph
  to 20px, the title to `--sf-text-lg` and the padding to 16px) · `titleAs` (default `h3`) ·
  `className` · rest spread onto the `<ul>`.
  **Copy:** every title and every sentence is `brand.pillars`; not one word is typed in the component.
  **Icons** are matched by KEY (`indigenous-knowledge` → `mdi:leaf`, `modern-science` →
  `mdi:flask-outline`, `farmer-ownership` → `mdi:account-group-outline`, `responsible-beauty` →
  `mdi:earth`) with a positional fallback and a neutral `mdi:star-four-points-outline` for a fifth
  pillar this file has never seen — so a renamed key degrades to the right glyph in the right slot
  rather than silently swapping two.
  **Three exported pure functions:** `pillarIcon`, `pillarNumeral`, `pillarTone`.
- **`brand/ImpactTriptych.js` + `.module.css`** — `siteContent.impact.items` as three columns, each
  opening on a 1px signature-gradient hairline at 60%, then an optional 4:3 `.sf-placeholder-media`
  photograph (`showImages`), the eyebrow, the title in Fraunces 20px and the three points at 15px
  behind 18px gold bullets.
  **Contract:** `items` · `showImages` (false on the home band, true on the page) · `titleAs`
  (default `h3`) · `className` · rest.
  **Two exported pure functions plus the normaliser:** `impactEyebrow`, `impactTitle`,
  `impactColumns`.
- **`home/WhyLamikaaSection.js` + `.module.css`** — `siteContent.get("impact")`, then:
  `SectionHeading` (eyebrow "Why LAMIKAA", `brand.philosophy` as the `h2` at `--sf-text-3xl` with **no
  gradient word** — it is the philosophy line, and lighting one of its three sentences would be an
  argument the brand has not made, lede `brand.philosophyLede`) → `Pillars` → a second heading row at
  `h3` → `ImpactTriptych showImages={false} titleAs="h4"` → `Button variant="secondary"` "Why LAMIKAA"
  → `/why-lamikaa`. One exported pure function: `impactCopy`.
- **`config/brand.js`** — one new key, `philosophyLede`, BRAND.md §3.2's first sentence verbatim,
  beside `philosophy` and `pillars`. See the decisions log.
- **`pages/Home/Home.js`** — `<WhyLamikaaSection/>` mounts directly after `<FullPageCta/>`, and the
  file's own section map gains `0i`. Nothing else on the page changed.

### The defect the test found, and reading did not

`impactColumns` filtered its rows **before** normalising them: a row whose `points` array carried
three blank strings passed the `points.length > 0` check, then lost all three to the per-point filter
and rendered as a column with a hairline, no title and no list — a hole in the triptych rather than a
missing column. The filter now runs after the map, on the normalised shape, so "nothing to say" is
decided on what would actually be printed. Caught by
`it("drops empty points and rows with nothing to say")` on the first run of the new suite.

### The empty state, exercised rather than reasoned about

The first browser pass ran against a production build, which reads `.env.production` and therefore
points at `https://core.lamikanaturals.com/api/v1` — unreachable from this sandbox. That is the exact
failure the section is designed for, so it was measured rather than discarded: the band rendered the
philosophy line, its lede, four pillar cards and the CTA, with the impact heading and triptych absent
and no console error from this section. The pillars come from a module the bundle always has; the
impact half is the only part that can go missing, and it takes its own heading with it.

### Measurements (Chromium 1194, mock mode, 7 widths)

Google Fonts and the Iconify API reset Chromium's TLS tunnels through the sandbox proxy (curl gets
200), so both were fetched with curl and served to the browser through `page.route` — same bytes,
real Fraunces + Manrope, real `mdi` SVGs (4 distinct pillar glyphs, 3 bullets per column, verified per
run).

| width | pillar grid | impact grid | card blur | doc overflow | tab stops |
|---|---|---|---|---|---|
| 360 | 1 × 4 | 1 × 3 | none | 0 | 1 |
| 390 | 1 × 4 | 1 × 3 | none | 0 | 1 |
| 414 | 1 × 4 | 1 × 3 | none | 0 | 1 |
| 768 | 1 × 4 | 1 × 3 | none | 0 | 1 |
| 1024 | 2 × 2 | 1 × 3 | blur(20px) | 0 | 1 |
| 1280 | 4 × 1 | 3 × 1, 24px gutter | blur(20px) | 0 | 1 |
| 1440 | 4 × 1 | 3 × 1, 24px gutter | blur(20px) | 0 | 1 |

`document.scrollWidth === window.innerWidth` at every width, and no descendant of the section extends
past the section's own box (widest child 1360 of 1440). Card gap 16px throughout; card padding 24px;
icon circle exactly 44 × 44 with a 24px glyph in `rgb(245,215,110)`; pillar title 22px Fraunces;
pillar text and impact points 15px; bullets 18px gold; section ground `rgb(11,11,13)` with
`--sf-section-y` = 140px at 1440.

### The hover glow, and what it is not

Hovering each card in turn: tones `gold`, `violet`, `gold`, `violet`, each going from
`opacity: 0` to `1`, each lamp the matching `--sf-glow-*` radial — and `transform: none` on all four,
at rest and hovered. The section's whole tab order is one stop, the CTA link; the cards contain no
anchor, no button and no `tabindex`.

### Heading outline and list semantics

`h1` count on the page: 1 (the hero's). Inside the section: `h2` 52px "Indigenous Wisdom. Modern
Science. Responsible Beauty." (the section's `aria-labelledby` target) → four `h3` 22px, the pillar
titles → one `h3` 40px "Beauty That Creates Prosperity for Farmers" → three `h4` 20px, the column
titles. Four `role="list"` lists (pillars ×4 items, points ×3 ×3) and **zero** nested landmarks.

### Contrast (WCAG AA, computed against the rendered grounds)

| text | on page ground `#0B0B0D` | on card ground (6% white composited, `rgb(26,26,28)`) |
|---|---|---|
| philosophy `h2` / pillar titles / impact `h3`, `h4` / CTA label | 18.05 | 15.95 |
| gold eyebrow, numeral, bullets | 13.88 | 12.27 |
| lede / pillar text / impact points (15px) | 9.62 | 8.50 |

All far above the 4.5:1 floor; the smallest text on the lightest ground still measures 8.5:1.

### Reduced motion

With `prefers-reduced-motion: reduce`, framer-motion attaches **no `style` attribute at all** to any
element in the section (`reveal()` returns `{}`), `document.getAnimations()` reports 0 inside it, and
nothing is left below full opacity. Without it, the staggered reveals all land at
`opacity: 1; transform: none` — 0 elements stuck hidden after the scroll.

### The legal qualifiers

The points render verbatim: no truncation, no summarising, no "and 3 more". Asserted in the suite
(`keeps every point WORD FOR WORD`) and re-checked against the seed — every string in
`siteContent.impact` that mentions dividends carries "can reach the member farmers through dividends"
(0 offenders). `grep -rn "guarantee\|% of profits\|percent"` over both new components: 0. No digit,
`%`, "percent", "guarantee" or "promise" appears anywhere in `brand.pillars` either (asserted).

### Verification run

- `CI=true npm run build` — exit 0, **Compiled successfully, 0 warnings**.
- `npm test -- --watchAll=false` — 14 suites (1 skipped: the live API), **151 passed**, 24 of them new.
- `grep -n "WhyLamikaaSection" src/pages/Home/Home.js` → 2 (the import and the mount).
- No hard-coded colour, `rgb()` or `hsl()` in either new stylesheet; every value is a `--sf-*` token or
  a documented local custom property built from one. No Meghali-era name, asset, colour or identifier
  in any touched file (word-boundary sweep: 0). No `dangerouslySetInnerHTML`.
- No `db.json` and no `api.js` change. The section READS `siteContent.impact`, which both api modes
  already serve identically (`GET /siteContent` in mock, `GET /content/impact` live).

### Left for later

`showImages` is exercised only as `false` here — the three 4:3 placeholder photographs it turns on are
the page's (Prompt 28), and their composition wants one look at that layout. `res.cloudinary.com` and
`picsum.photos` remain unreachable from the browser in this sandbox (the same tunnel resets Prompt 19
recorded), so no placeholder photograph on the home page was seen rendered in this run; nothing in
this section depends on one. Carried into Open TODOs.


## Prompt 21 record (2026-09-07)

### What was built

One rewrite, one new section, one selector option, and three JSON values.

- **`components/FAQ/FAQ.js` (159, was 55) + `.module.css` (112, was 25) + `.test.js` (196)** —
  rebuilt on the `ui/Accordion` primitive and turned into a **props-driven** block. The old file read
  `FaqContext` itself and hard-coded `forPlacement("home")`, which is why it could only ever be the
  home block; rows are now a prop, so the same accordion serves the home band, `/faq` (Prompt 28) and
  the PDP's FAQs panel (Prompt 27).
  **Contract:** `faqs` · `limit` · `defaultOpen` · `multiple` (default `false`) · `id` ·
  `headingLevel` (a NUMBER, 2–6, default 3) · `className` · rest.
  **Rows → items:** `id: "faq-<id>"`, `title` the question, `content` a
  `<ContentBlocks variant="prose">` over the resolved answer.
  **Two exported pure functions:** `faqAnchorId(faq)`, `faqAnswerText(answer, fillCopy)`.
  Everything the disclosure pattern owes a visitor — a real `<button>` in a heading,
  `aria-expanded`/`aria-controls`, ↑/↓/Home/End between headers, the `0fr → 1fr` height animation, the
  collapsed panel's `visibility: hidden` — is the primitive's and is not restated.
- **`components/home/HomeFaqs.js` (89) + `.module.css` (79) + `.test.js` (101)** — **new**.
  `SectionHeading` (eyebrow "Good to know", `rule`, "Questions, answered" with `gradientWord={1}`, one
  lede) + `Button variant="secondary"` "All questions" → `ROUTES.FAQ`, then `<FAQ headingLevel={3}/>`
  over `useFaqs().forPlacement("home", { limit: 8 })`. Two columns from 1025px with the left column
  sticky, stacked below. Renders `null` under two answers. Exports `HOME_FAQ_LIMIT` (8) and
  `HOME_FAQ_MINIMUM` (2).
- **`utils/faqs.js`** — `faqLimit(rows, limit)` (new, exported) and
  `faqsForPlacement(faqs, placement, { limit })`. **`context/FaqContext.js`** passes the options
  object through. **`pages/Home/Home.js`** mounts `<HomeFaqs/>` after `<WhyLamikaaSection/>` and its
  section map gains `0j`. **`db.json`** `faqs` rows 6–8 gained `"home"`.

### The two defects the run found, and reading did not

1. **`faqLimit(rows, null)` returned an empty list.** `Number(null)` is `0`, which is finite and not
   negative, so an explicit `{ limit: null }` — "no cap" in every other option bag in this codebase —
   sliced the list to nothing. The guard now tests `null`/`undefined`/`""` before the coercion. Caught
   by `it("leaves the list alone when there is no sensible cap")` on the first run of the new suite.
2. **The answer printed at 17px, the same size as the question.** `ContentBlocks`' prose paragraphs
   are `--sf-text-md`, so the hierarchy the design spec asks for did not exist until
   `.answer :is(p, li)` brought it to `--sf-text-base`. Found by measuring the composited page, not by
   reading the module — the FAQ stylesheet said nothing about it either way.

### Measurements (Chromium 1194, mock mode, dev server)

| width | columns | aside | rows | row height | doc overflow |
|---|---|---|---|---|---|
| 360 | 1 (328px) | static | 8 | 44px floor | 0 |
| 390 | 1 (358px) | static | 8 | 44px floor | 0 |
| 768 | 1 (736px) | static | 8 | 44px floor | 0 |
| 1024 | 1 (984px) | static | 8 | 44px floor | 0 |
| 1025 | 2 (412.9 / 516.1) | **sticky, top 112px** | 8 | 44px floor | 0 |
| 1280 | 2 (526.2 / 657.8) | **sticky, top 112px** | 8 | 66px rendered | 0 |

Section ground `rgb(11,11,13)`, `--sf-section-y` 128px at 1280. Question **Manrope 600 17px**,
`min-height: 44px`, resting colour `rgb(247,245,240)`. Chevron **20px `rgb(245,215,110)`**, rotating
180°. Answer **Manrope 16px `rgb(184,181,176)`** at **20px** inline inset. Separators
**`rgba(255,255,255,0.08)`** — the glass hairline, not the neutral one. The open row's rule:
**2px wide, `linear-gradient(135deg, rgb(245,215,110), rgb(255,79,216)…)` at `opacity: .6`,
`inset-inline-start: -12px`** — inside the container's own padding, so opening an answer moves no word
sideways.

### Accessibility

`h1` count on the page: **1** (the hero's). Inside the section: `h2` 40px "Questions, answered" (the
`aria-labelledby` target) → eight `h3`, one per question. **Eight `role="region"` panels**, each
`aria-labelledby` its own trigger; **zero nested landmarks**. Tab walk: "All questions" → the eight
triggers → out of the section (**9 stops, no trap**). ↑/↓ move between headers and **wrap** (last →
first, first → last), Home/End jump to the ends, Enter opens and Space closes — all measured in the
browser, not asserted.

| text | on `#0B0B0D` |
|---|---|
| `h2`, question, CTA label (`#F7F5F0`) | 18.05:1 |
| eyebrow, chevron (`#F5D76E`) | 13.88:1 |
| lede, answer (`#B8B5B0`) | 9.62:1 |

### Tokens, and the row the criterion names

`document.body.innerText` carries **no `{{`, no `{freeShipping}`, no `{codSentence}`, no `{taxNote}`**
at any of the four widths. FAQ 7 (`{{RETURN_WINDOW_DAYS}}`) prints as *"You can request a return from
My Orders within **7** days of delivery for unopened products in their original packaging. Opened
skincare cannot be returned for hygiene reasons unless it arrived damaged."* — the token resolves from
`STOREFRONT_CONFIG.returnsWindowDays`, which still holds the boilerplate 7 (carried into Open TODOs
for the owner; at 0 the sentence drops and the second one stands alone). FAQ 6 (`{freeShipping}`)
prints its first sentence only, because no shipping method sets a `freeAbove` — the sentence, not the
row, is what goes.

### The admin, exercised rather than assumed

Signed in at `/admin`, `/admin/faqs` lists all eight rows with the `Shared` / `Help` / `Product`
placement vocabulary intact and **no console error**. `PATCH /faqs/1` through the same endpoint the
screen saves on, then a `focus` event on an already-open storefront tab: the first question changed
from "Who owns LAMIKAA Naturals?" to "Who owns LAMIKAA Naturals? (edited)" **without a reload**. The
edit was reverted; `git diff db.json` is the three `"home"` lines and nothing else.

### Reduced motion

With `prefers-reduced-motion: reduce` the panel's `transition-duration` computes to **`0s`** (the token
layer zeroes `--sf-duration`), the chevron and the open row's rule stop with it, and the deep-link
scroll switches from `smooth` to `auto`.

### Verification run

- `CI=true npm run build` — exit 0, **Compiled successfully, 0 warnings**. The emitted CSS keeps the
  `:has()` rule and `:is(p,li)` intact.
- `npm test -- --watchAll=false` — **17 suites (1 skipped: the live API), 173 passed**, 22 of them new
  across `FAQ.test.js` (14), `HomeFaqs.test.js` (3) and `utils/faqs.test.js` (5, the last of which is a
  regression on the two selectors this prompt did NOT change).
- `grep -n "HomeFaqs" src/pages/Home/Home.js` → 2 (the import and the mount).
- No hard-coded colour, `rgb()` or `hsl()` in either new stylesheet (`grep -nE "#[0-9a-f]{3,8}|rgb\(|hsl\("`
  → 0); every value is a `--sf-*` token or a local custom property built from one. No
  `dangerouslySetInnerHTML` (the answers go through `ContentBlocks`, which cannot emit markup at all).
  No new dependency.
- Word-boundary Meghali-era sweep (`meghali|silk|muga|eri|mekhela|chador|sualkuchi|emerald|paat`) over
  every file this prompt authored — `FAQ.{js,module.css,test.js}`, `HomeFaqs.{js,module.css,test.js}`,
  `FaqContext.js`, `utils/faqs.{js,test.js}` — **0 hits**. `pages/Home/Home.js` still returns 4, all of
  them in the pre-rebuild sections 1–6 (the collection stories' lede and the heritage interlude); this
  prompt did not touch a line of them, and Prompt 22 deletes the sections whole. `db.json` changed by
  exactly 3 lines.
- `db.json` changed in one field (`faqs[5..7].placements`), which both api modes already read and the
  admin already edits — no `api.js` change was needed in either mode.

### Left for later

The guardrail "one accordion implementation only" holds for the home page, not yet for the site:
`pages/HelpCenter/HelpCenter.js` and `pages/ProductDetails/ProductDetails.js` still hand-roll theirs,
and both files belong to prompts that rewrite them wholesale (28 and 27). The rewrite done here is
what makes each migration a one-line mount. Carried into Open TODOs, together with the returns-window
figure for the owner.

---

## Prompt 22 record (2026-09-07)

### What the page is now

Eleven sections, in the brief's order. Two are eager (they are above the fold);
the other nine are lazy chunks mounted by `DeferredSection` when they come
within 600px of the viewport.

| # | Section | Chunk | Data it receives | Ground |
|---|---|---|---|---|
| 1 | `HeroCarousel` | eager | `heroProducts` (+ its own `hero.getConfig()`) | bg |
| 2 | `TrustStrip` | eager | brand config | glass edge |
| 3 | `ProductShowcase` | lazy | `heroProducts`, `products` | bg |
| 4 | `ShopByCategory` | lazy | `categories`, `concerns`, `heroProducts`, `rituals` | bg |
| 5 | `AboutTeaser` | lazy | `homeContent.aboutTeaser` | surface band |
| 6 | `WhyBlackRice` | lazy | `homeContent.whyBlackRice`, `heroProducts` | bg |
| 7 | `RitualsTeaser` | lazy | `rituals`, `products` | bg |
| 8 | `FullPageCta` | lazy | `homeContent.fullPageCta` | photo |
| 9 | `WhyLamikaaSection` | lazy | `impactContent` | bg |
| 10 | `RecentlyViewed` | lazy | `products` (+ localStorage) | surface band, tight |
| 11 | `HomeFaqs` | lazy | `FaqContext` | bg |

`ShopByCategory` **moved**: Prompt 15 mounted it directly under the trust strip,
the brief (§7.2 item 4) places it after the product chapters, and that is where
it is. Verified in the browser — the accessible-name order at 390px reads
`Black Rice range → Eight steps. One ritual. → [8 product chapters] → Find your
step → When LAMIKAA grows… → Why black rice? → Build your ritual → Beauty that
creates value… → Indigenous Wisdom… → Where you left off → Questions, answered`.

### One data load

`components/home/useHomeData.js` is called once, in `Home.js`. Assembled
naively the page issued **fifteen requests for six collections**:

| Collection | Was | Now |
|---|---|---|
| `products.getHeroProducts()` | 4 (hero, showcase, categories, spotlight) | 1 |
| `products.getAll()` | 3 (showcase fallback, rituals, recently viewed) | 1 |
| `siteContent.get("home")` | 3 (about, spotlight, CTA) | 1 (whole record) |
| `siteContent.get("impact")` | 1 | — (same record) |
| `categories` / `concerns` / `rituals` | 1 / 1 / 2 | 1 / 1 / 1 |
| **Total** | **15** | **6** |

Slices are tri-state — `undefined` in flight, `null` failed, value loaded — the
convention `AboutTeaser` and `WhyLamikaaSection` already used for their content
block, lifted to the whole page. A module-level map de-duplicates requests that
are in flight and drops the entry once settled, so a return visit to `/` reads
fresh data exactly as the per-section fetches did.

### Lighthouse (mobile, production build, median of 3 runs)

| Metric | Target | Result |
|---|---|---|
| **Performance** | ≥ 85 | **68** — below target, see below |
| **Accessibility** | ≥ 95 | **100** ✓ |
| **Best Practices** | ≥ 95 | **100** ✓ |
| **SEO** | ≥ 95 | **100** ✓ |
| CLS | < 0.1 | **0.042** ✓ |
| Total JS on `/` | ≤ 350 kB gz | **253 kB** ✓ |
| FCP / LCP / TBT / SI | — | 3.2 s / 5.9 s / 230 ms / 3.2 s |

What this prompt's work moved, measured on the same build and harness:

| Fix | Before | After |
|---|---|---|
| Nine perpetual skeleton shimmers on off-screen reservations | SI **20.7 s** | SI **3.2 s** |
| Deferral reserve heights (vs. no reservation) | CLS **0.174** | CLS **0.042** |
| Dead Material Icons stylesheet removed | Best Practices **96** | **100** |
| `preconnect` to res.cloudinary.com | FCP **3.2 s** | FCP **2.6 s** |
| `AdminLayout` made lazy | main **285 kB** gz | **249 kB** gz |

**Why Performance is 68 and not ≥85.** It is not this page's content. With
every asset served locally (<150 ms per request) the LCP image loads in **3.5
ms** and LCP ≈ FCP + 0.5 s: the page is bounded entirely by time-to-first-render
of the main bundle under simulated slow-4G + 4× CPU. Source-map analysis of that
bundle (uncompressed source bytes): framer-motion 381 kB, `@mui/material` 225 kB
+ `@mui/system` 80 kB, `@remix-run/router` 213 kB, sweetalert2 169 kB,
`services/api.js` 143 kB, axios 105 kB, `@iconify/react` 53 kB. MUI survives the
lazy admin shell because the STOREFRONT shell imports it (`Header.js`,
`HeaderActions.js`, `Footer.js`, `ThemeContext.js`, `App.js`'s `<CssBaseline/>`).
Taking MUI / sweetalert2 / framer-motion off the storefront's eager path is a
refactor of Prompts 03/09/13's work across the whole shell — carried to Prompt
38, which owns the performance audit. Everything inside this page's scope was
done and is in the table above.

**Measurement harness.** This sandbox's agent proxy adds **~12.5 s of latency to
every request that leaves the container**, which put Speed Index at ~20 s and
made the raw score a measurement of the sandbox. The four numbers were therefore
taken with a local caching mirror standing in for Cloudinary / Google Fonts /
Iconify (Chrome started with `--host-resolver-rules`, `--no-proxy-server`), so
Lighthouse's own throttling models a normal network instead of a pathological
one. The mirror's first version cached Google Fonts' **TTF** variant (curl's
user-agent gets TTF, Chrome gets WOFF2) and charged the page ~350 kB of fonts it
never downloads — fixed, and worth 5 points and 0.6 s of FCP. The scaffolding
lives in the scratchpad and is **not committed**. Accessibility, Best Practices
and SEO are unaffected by network latency and scored 100/100/100 with and
without the mirror. Also note `.env.production` points at the live Laravel API,
unreachable from here: the audited build used a temporary, git-ignored
`.env.production.local` pointing at the local JSON Server, since the first run
otherwise measured the API-unreachable fallback page (a hero with no products).

### Structured data

`hooks/useSeo.js` gained `organizationJsonLd()` and `websiteJsonLd()`. Both are
published by `/` only. Verified against the official validator
(`validator.schema.org`): **0 errors, 0 warnings**.

- `Organization` — `name`, `legalName`, `url`, `logo` (`cld(brand.logoUrl,{w:600})`).
  `sameAs` reads the LIVE `settings.social` map through `normalizeSocialLinks`,
  which blanks every `{{TOKEN}}`; today every profile is unresolved, so the
  property is **dropped rather than published empty**. It will appear by itself
  once the owner fills Admin > Settings > Social Links.
- `WebSite` — `name`, `url`, and a `SearchAction` targeting
  `/search?q={search_term_string}` (the results page Prompt 11 built, so the
  target is a route that actually answers).

`url` resolves to `seoOrigin()`, which is the serving origin while
`brand.seo.siteUrl` is still `{{LAMIKAA_DOMAIN}}` — correct on the real domain,
harmless on localhost, and never a placeholder in the markup.

### Browser QA

Driven over CDP at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440, walking the full
page so every deferred section mounts.

- `document.documentElement.scrollWidth === window.innerWidth` at **360, 390 and
  414** ✓. At 1024+ scrollWidth is 8px *less* than innerWidth — the vertical
  scrollbar, not horizontal overflow. The elements whose boxes exceed the
  viewport are all inside `overflow-x` tracks (the hero index, the trust strip),
  which is what those tracks are for.
- Exactly **one `<h1>`** at every width (the hero's).
- Announcement + header = **92px** at ≤768, **100px** at ≥1024 (budget ≤100) ✓.
- The bottom nav does not cover the last section's CTA (the FAQ band ends above
  it; `main` carries the bottom-nav padding from Prompt 10).
- **Recently viewed, end to end**: 0 stored → hidden; 1 stored → hidden (the
  raised threshold); 3 stored → 3 cards in browsing order; `[2, 9999, 1]` →
  **2 cards, the unreachable id dropped**, current records rendered.
- Screenshots at 390 confirm no glow is clipped on the about / spotlight / CTA
  bands, and that the grounds alternate as specified.
- Admin re-verified after the lazy-shell change: signed in, walked
  `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/settings` —
  drawer, app bar and full navigation present, **zero console errors**.

### The acceptance grep

`grep -rn "FeaturedProducts\|CTASection\|Where to begin\|Chosen this season" src`
→ **0** ✓.

`heritage` is **not** 0, and cannot be at this point in the programme. All five
remaining files are pre-existing and owned by later prompts:

- `config/brand.js` ×2 — LAMIKAA's own copy ("the natural heritage of our
  region", from BRAND.md). Not Meghali, and not to be removed.
- `theme/storefront-tokens.css` ×2 — the `--sf-gradient-heritage` legacy alias,
  which `00_INDEX.md` §3.2 schedules for removal in **Prompt 35**.
- `theme/colors.js` ×1 — a comment, same prompt.
- `pages/AboutUs/AboutUs.{js,module.css}` ×6 — the old About page, replaced
  wholesale in **Prompt 28**.

Every occurrence this prompt was responsible for is gone, including a stale
comment in `utils/helpers.js` that still described the featured grid this prompt
deleted.


## Prompt 23 record (2026-09-08)

### What `/shop` is now

`pages/Products/Products.js` (1 687 lines) + `Products.module.css` (1 335) are
**deleted**. In their place, `pages/Shop/Shop.js` (380) + `Shop.module.css`
(220): eight full editorial chapters in hero order, a page-level index, a
closing "Build your ritual" panel, and **no filter, no sort, no pagination and
no sidebar** (brief §7.3 — see the decisions log).

The two ways the listing narrows are both routes, and neither is a control:

- `/shop?concern=<slug>` → `products.getByConcern` → `{ concern, products }`
- `/category/<slug>` → `products.getByCategorySlug` → `{ category, products }`

Plain `/shop` reads `products.getAll()` and sorts it here (`shopOrder`, exported
and unit-tested) by `heroOrder ?? 99` then name — the other two reads already
answer sorted, and the order of a listing must not depend on which of the three
produced it. `concerns.getAll()` is a second, deliberately tolerant read: the
chips are a way to narrow the range, not the range itself, so a `/concerns`
failure costs the chips and nothing else.

### The three components

- **`catalogue/ChapterIndex.{js,module.css}`** (new) — one component, two
  shapes. `variant="rail"` from 1025px: a 220px column, `position: sticky;
  top: 112px`, holding a 2px `--sf-color-surface-2` track with a
  `--sf-gradient-signature` fill, the eight `shortName`s at 14px with
  `aria-current="true"` and a gradient dot on the active one, and a "Back to
  top" ghost button. `variant="strip"` to 1024px: a full-bleed `.sf-glass` band
  under the masthead (48px at ≤768 / 52px above, `top: 56px` / `64px`) of 36px
  numeral + name pills with `scroll-snap-type: x proximity`, whose active pill
  is centred by writing the strip's own `scrollLeft` (never `scrollIntoView`,
  which would walk up and drag the page). Both are rendered; the wrong one is
  `display: none`, which is off the screen AND out of the accessibility tree.
  The band hides under `body[data-drawer-open]` (`visibility`, so nothing
  moves). Four pure functions are exported and unit-tested: `chapterId`,
  `chapterHeadingId`, `intraChapterProgress`, `trackProgress`.
- **`catalogue/BuildRitualPanel.{js,module.css}`** (new) — the closing
  `GlassCard strong glow="duo"`: eyebrow "Finish the ritual", `h2` "Build your
  **ritual**" (the one gradient keyword), lede "Three routines that put the
  range in order.", three `RitualCard compact`, and `Button variant="primary"`
  "See all rituals" → `/rituals`. It reads the whole catalogue itself so a
  concern-narrowed page still draws complete routines.
- **`catalogue/ProductChapter`** — `variant="shop"` is now a real variant
  rather than a floor removal: `min-height: 88svh` on the split screen and
  **none at all on a phone**, `scroll-margin-top: 96px` (the 64px masthead plus
  air, which is what makes every jump land clear of it), `data-slug`, a
  `tabIndex={-1}` `h2` so the rail can move focus to it, and an
  `IntersectionObserver` at `threshold: 0.5` behind an `onVisible(index)` prop.
  The home page passes no `onVisible`, so it builds no observer.

### Where the active chapter is decided

In the CHAPTERS, not in the index. Each one reports its own crossing of the
half-visible line; `Shop` holds `activeIndex` and hands it to both index forms.
The index measures exactly one thing for itself — how far into the active
chapter the viewport has travelled, from that chapter's `getBoundingClientRect()`
on a rAF-throttled passive scroll listener — and writes it as one custom
property (`--sf-chapter-progress`), so a scroll frame costs a style write and
**no React render**.

### Removals

| Removed | Where it was | Why nothing broke |
|---|---|---|
| `pages/Products/*` | the old listing | `/shop` and `/category/:slug` both render `Shop`; every legacy URL still redirects |
| `getCategoryScopeIds` | `utils/categories.js` | its only caller was the listing's category facet |
| `orderCategoriesHierarchically` | `utils/categories.js` | same |
| `getDeviceType` | `utils/helpers.js` | its only caller was the listing's scroll offset |
| `CategoryRoute` | `App.js` | replaced by `<Shop mode="category" />` |

`getDescendantIds` **stays** — `pages/Admin/AdminCategories.js` still walks the
tree with it.

### Verification

- `CI=true npm run build` → exit 0, **"Compiled successfully"**, no warnings.
- `npm test -- --watchAll=false` → exit 0. 19 suites / 197 tests passed, 1 suite
  / 50 skipped (the live-API suite). 16 of the passing tests are new
  (`components/catalogue/ChapterIndex.test.js`).
- `test ! -d src/pages/Products` ✓ · `grep -n "pages/Shop/Shop" src/App.js` ✓ ·
  `grep -rn "FABRIC_FAMILIES\|All Silk\|Nothing woven" src` → **0** ✓ ·
  `grep -n "ComingSoon" src/App.js` → the four Prompt 24 expects ✓.

### Browser QA (Chromium 1194, mock mode, `npm run dev`)

`/shop` renders eight chapters, ids `chapter-<slug>`, `data-chapter` 0–7, `h1`
"Shop", lede "8 products · one ritual", CTAs "Explore more" / "Add to Cart" (and
"Coming soon" on the five `priceTBA` products).

- **Rail follows the scroll**: Face Wash → Goat Milk Soap → Body Wash → Face
  Mask → … → Moisturizer Gel across five scroll positions, with the track at
  0 → 0.125 → 0.26 → 0.58 → 0.95. It pins at exactly `top: 112px` at 1280 and
  1440 for the whole listing.
- **Rail jump**: click chapter 5 → the section's top rests at **96px** (its
  `scroll-margin-top`) and `document.activeElement` is
  `H2#chapter-black-rice-face-mist-title`. "Back to top" → `y: 0`, focus on
  `H1#shop-title`.
- **Keyboard**: Tab reaches the rail buttons (with the champagne ring) directly
  after the concern chips and BEFORE the chapters; Enter jumps and moves focus;
  the next Tab is that chapter's own "Explore more". Escape changes nothing.
- **Mobile strip** at 390: follows the scroll (01 Face Wash → 02 Goat Milk Soap
  → 05 Face Mist) and scrolls its active pill into view (`scrollLeft` 0 → 22 →
  360), pinned at 56px.
- **Scroll snap**: `y proximity` at 1280/1440, `none` at ≤1024 and `none` under
  reduced motion. Mid-chapter settle **delta 0**; boundary settles ≤ ~165px onto
  chapter starts.
- **`/shop?concern=hydration`**: `h1` "For **Hydration**", lede "3 products for
  Hydration", chapters body-wash / face-mist / moisturizer-gel, the Hydration
  chip `aria-current="page"`, tab title "Shop · Hydration · LAMIKAA NATURALS",
  and an `ItemList` graph of the three product URLs.
- **`/shop?concern=nope`**: "Nothing here yet" + "All products", zero chapters,
  and the chips still offered — the failed branch says something else
  ("The range could not be loaded." + "Try again"), so a dropped network never
  reads as an empty range.
- **Routes preserved**: `/products` → `/shop` (8) · `/products?category=face-care`
  → `/category/face-care` (6) · `/category/body-care` (2) · `/category/rituals`
  → `/rituals`.
- **360 / 390 / 414 / 768 / 1024 / 1280 / 1440**: `scrollWidth === clientWidth`
  at every width — **no horizontal scroll** — and the chapter floor measures
  `0px` at ≤768, `704px` at 1024 (88% of 800) and `792px` at 1280/1440 (88% of
  900). **Zero page errors and zero console errors.**

The only thing that could not be seen is photography: `res.cloudinary.com`
resets Chromium's TLS tunnel through this sandbox's proxy, so every plate
painted empty. Logged as an Open TODO.


## Prompt 24 record (2026-09-08)

### What was built

| File | Lines | What it is |
|---|---|---|
| `src/components/catalogue/CategoryHead.js` | 130 | The band + glass panel a category page opens on. |
| `src/components/catalogue/CategoryHead.module.css` | 136 | 4:3 phone / 21:9 desktop; the panel rises on a negative margin. |
| `src/components/catalogue/RitualStep.js` | 260 | One `<li>` of a routine: numeral, plate, words, price, one action. |
| `src/components/catalogue/RitualStep.module.css` | 280 | `72px 1fr` → `96px 240px 1fr auto`; the thread and the seam. |
| `src/pages/Rituals/Rituals.js` | 290 | `/rituals` — three full-width routine rows. |
| `src/pages/Rituals/Rituals.module.css` | 265 | Stacked, then split at 900px. |
| `src/pages/Rituals/RitualDetail.js` | 390 | `/rituals/:slug` — head, steps, CTA panel, legal note. |
| `src/pages/Rituals/RitualDetail.module.css` | 197 | Three bands; the head splits at 1025px. |
| `src/components/catalogue/RitualStep.test.js` | 182 | 21 tests over this prompt's pure decisions. |
| `src/components/Breadcrumb/Breadcrumb.js` | 67 | **Rewritten** — the full trail, `aria-current`, an `<ol>`. |
| `src/components/Breadcrumb/Breadcrumb.module.css` | 90 | **Rewritten** — tokens only; 44px targets ≤768px. |

Changed: `src/pages/Shop/Shop.js` (380 → 581, split in two), `Shop.module.css`
(220 → 228), `src/utils/seo.js` (+35, `breadcrumbJsonLd`), `src/App.js` (two lazy
pages in, one static redirect and two stubs out), `catalogue/index.js` (+2).
**No `db.json` and no `api.js` change — this prompt reads only.**

### The routes, measured (Chromium 1194, mock mode)

| URL | h1 | Chapters / steps | Head count | Lands on |
|---|---|---|---|---|
| `/category/face-care` | Face Care | 6 | 6 PRODUCTS | itself |
| `/category/body-care` | Body Care | 2 | 2 PRODUCTS | itself |
| `/category/cleansers` | Cleansers | 3 | 3 PRODUCTS | itself |
| `/category/serums` | Serums | 1 | **1 PRODUCT** (singular) | itself |
| `/category/moisturizers` | Moisturizers & Mists | 2 | 2 PRODUCTS | itself |
| `/category/masks` | Masks & Scrubs | 2 | 2 PRODUCTS | itself |
| `/category/rituals` | Curated routines | — | — | **`/rituals`** |
| `/category/nope` | This page has wandered off | — | — | 404, URL kept |
| `/rituals` | Curated **routines** | 3 rows | — | itself |
| `/rituals/morning-glow` | The Morning Glow Ritual | 4 | — | itself |
| `/rituals/evening-renewal` | The Evening Renewal Ritual | 5 | — | itself |
| `/rituals/black-rice-body` | The Black Rice Body Ritual | 2 (+ choice) | — | itself |
| `/rituals/nope` | This page has wandered off | — | — | 404, URL kept |

Step products resolve in the seeded order: morning-glow = face wash · mist ·
serum · gel; evening-renewal = face wash · scrub · mask · serum · gel;
black-rice-body = goat milk soap (or body wash) · mist.

### Head and structured data

- `/category/face-care` — title `Face Care · LAMIKAA NATURALS`, description the
  category's own, canonical the current path, and **two** graphs in one
  `ld+json` block: a `BreadcrumbList` (Home → Shop → Face Care, the last
  positioned but URL-less) and an `ItemList` of the six product URLs in hero
  order. The visible trail is the same array.
- `/rituals/morning-glow` — title `The Morning Glow Ritual · LAMIKAA NATURALS`,
  description the ritual's tagline, `BreadcrumbList` Home → Rituals → the name,
  `ItemList` of the four **chosen** step products.
- `/rituals` — `useSeo({ title: "Rituals" })`, no page-level graph (an index of
  three editorial rows is not an `ItemList` of products).
- Breadcrumb `aria-current="page"` sits on the last crumb and nowhere else.

### The bar / wash choice

A real `role="radiogroup"` labelled "Choose the product for step 1", two
`role="radio"` buttons with roving tabindex (`0` on the checked one, `-1` on the
other) — **one tab stop for the pair**, verified by tabbing out of it straight
into "Add to Cart". ArrowRight/Down and ArrowLeft/Up move and select in both
directions and carry focus; Home/End jump to the ends. Focus shows
`rgba(245,215,110,.55) 0 0 0 3px` — the champagne ring. Labels come from the
catalogue (`shortName`): **"Goat Milk Soap" / "Body Wash"**, each radio's
accessible name the full product name.

Choosing the wash swaps, in one gesture: the name (`Black Rice Goat Milk Soap` →
`Black Rice Body Wash`), the promise, the plate image and its `alt`, the plate's
`href` (`/product/black-rice-goat-milk-soap` → `/product/black-rice-body-wash`),
the price (`₹90.00` → `Price on launch`), the button (`Add to Cart` →
`Coming soon`, disabled) **and** the panel — "From ₹90 for the priced steps"
disappears and the CTA becomes "Shop each step". Choosing the soap again
restores all of it.

### The bundle, with the flag flipped locally

`enableRitualBundles: true` in `src/config/brand.js`, dev server reloaded:

- `/rituals/evening-renewal` (2 priced of 5): "Shop each step" is gone, "Add the
  whole ritual to cart" is there. One press → **one** `.swal2-toast`
  ("Added to cart · 2 items added to your cart"), **one** drawer opening, and a
  cart holding exactly `Black Rice Face Wash ₹390` and
  `Black Rice Exfoliating Face Scrub ₹349`. The three `priceTBA` products never
  entered it.
- `/rituals/black-rice-body` with the WASH chosen (nothing priced): no bundle
  button at all, "Shop each step" in its place, no total. Switch back to the
  soap → the bundle returns and adds the single priced step ("1 item added").
- **Reverted to `false` before the commit**; `git diff src/config/brand.js` is
  empty.

`Shop each step` (the committed path) scrolls the first row to the top
(`window.scrollY` 0 → 989 at 1280) and moves focus into it — onto step 1's plate
link, accessible name "Black Rice Face Wash by LAMIKAA Naturals — label".

### Responsive and a11y

- **360 / 390 / 414 / 768 / 1024 / 1280 / 1440** on `/category/face-care`,
  `/rituals` and `/rituals/black-rice-body`: `scrollWidth === clientWidth` at
  every width — **no horizontal scroll anywhere**. The only elements crossing
  the viewport edge are `ChapterIndex`'s pills, inside their own scroller
  (Prompt 23, by design).
- Targets: breadcrumb crumbs **44px** at ≤768px and **24px** above; step name
  links 25px (with the 240px plate link to the same PDP beside them); the
  segmented options 44px; `.sf-btn--sm` 36px, which the primitives already grow
  to 44px under `@media (pointer: coarse)`. Every sub-24px target left on these
  pages belongs to the **footer** — logged for Prompt 38.
- Reduced motion: the step rows compute `opacity: 1` / `transform: none` (no
  reveal waiting below the fold), and `scroll-snap-type` is `none` on a category
  page. Without the preference the rows sit at `opacity 0` / `translateY(16px)`
  until they scroll in, and the category page snaps `y proximity` at 1280.
- One `<h1>` per page, `id="shop-title"` still on the category head's so
  `ChapterIndex`'s "Back to top" reaches it.

### Regressions checked

`/shop` unchanged (8 chapters, `ItemList` of 8, the concern chip row);
`/shop?concern=hydration` still `h1` "For **Hydration**", 3 chapters, the
Hydration chip `aria-current="page"`, title "Shop · Hydration · LAMIKAA
NATURALS". `CI=true npm run build` exit 0 **with no warnings**;
`npm test -- --watchAll=false` 20 suites / 218 passed (1 suite / 50 skipped).
`grep -n "ComingSoon" src/App.js` → `/why-lamikaa` and `/cart` only.

### Photography, for the first time

Chromium has no outbound HTTPS in this sandbox, so every prompt since 17 has
measured geometry against empty plates. This run fetched each remote URL in
**Node** (which does reach `picsum.photos` and `res.cloudinary.com` through the
agent proxy) and fulfilled the browser's request with the bytes — so the QA
screenshots are of the real seeded frames, product labels included. Two things
were found that way and fixed: the ritual stage was 200px taller than its story
(the 1200×1500 image was driving the row), and the category panel needed `scrim`
to stay legible over a bright Picsum seed. It is a harness trick, not the app's
own path; `onImageError` was exercised separately by aborting the same requests.


## Prompt 25 record (2026-09-08)

### What was built

Three new components, one page rewritten around them, and five restyles.

- **`components/pdp/PurchasePanel.js` (387) + `.module.css` (286)** — **new**. Every commerce control
  the page has, in the order a shopper makes the decisions: `Breadcrumb` (Home / Shop / {category
  displayName} / {shortName}) → the eyebrow (the category as a link, the ritual step "01 — Cleanse" in
  Fraunces tabular figures, and whatever flags the merchant has actually set) → `h1`
  (`--sf-text-3xl`) → `promise` → `SocialProof` **only when a real rating or review exists** →
  `Price product size="lg"` with the tax note from `fillCopy` → size / fragrance / SKU as a two-column
  `<dl>` → `TrustBadges variant="chips"` → `VariantSelector` (only where variants exist) →
  `QuantityStepper` + the stock line → `Button variant="addToCart"` and `variant="primary"` "Buy now",
  with the wishlist and share circles → `DeliveryReturnsInfo` → `LegalNote compact` + "Read our
  story". `GlassCard padding="lg"` at every width, with the ground, blur, border and padding taken
  OFF below 769px — on a phone the panel is the page.
  **It owns no data.** Price, stock, the variant, the quantity and the cart wiring are the page's,
  because the sticky bar, the head tags and the chapters need the same answers. Its two local things
  are the share gesture (`navigator.share`, else the clipboard, with a "Link copied" toast either way)
  and the tab order.
- **`components/pdp/ChapterNav.js` (204) + `.module.css` (150)** — **new**. A glass pill bar that
  arrives after **320px** of scroll (`visibility`/`opacity`, never `display`, so nothing reflows),
  sticks at `top: 72px` from 1025px and `56px` below it, scrolls sideways on a phone with the active
  pill kept in view, and steps aside entirely while `body[data-drawer-open]` is set. The active
  chapter is **observed, not computed**: one IntersectionObserver with a reading band for a root
  margin (`-30% 0px -55% 0px`), and the first chapter in document order that is in the band wins —
  nothing is measured on scroll.
- **`components/pdp/Chapter.js` (73)** — **new**, and deliberately without a stylesheet: the rhythm is
  `.sf-section--tight` and the type is `SectionHeading`'s, so the only thing left is the scroll offset
  under the sticky chrome, which is the page's (`scroll-margin-top: 120/148px`). It owns the three ids
  that have to agree — the section's, the heading's (`chapterHeadingId`) and the numeral
  (`chapterNumeral`).
- **`pages/ProductDetails/ProductDetails.js` (693, was 1143) + `.module.css` (161, was 1109)** —
  rewritten as `useProductPage()` (data + handlers) / `ProductDetailsView` (the head and the markup) /
  `ProductDetails` (the three states), the same split `/shop` uses so **exactly one `useSeo` is ever
  mounted on the route** and `<NotFound/>` can restore the head it borrowed.
- **`components/pdp/PurchasePanel.test.js` (131)** — 15 tests over the six pure rules this prompt
  added: `stockLabel`, `ritualStepLabel`, `chapterNumeral`/`chapterHeadingId`, `hasDeliveryEstimate`,
  `productSeoTitle` and `hidesBottomNav`.

### The restyles

- **`AddToCartBar`** rebuilt on `Button` / `Price` / `CloudinaryImage`: a strong-glass band with a
  **56px plate** of the pack, the name on one line, the live price (TBA-aware) and the same
  three-state Add to Cart the panel carries, plus a Buy-now icon button when there is something to
  buy. It still reveals itself through the existing `anchorRef` IntersectionObserver contract — the
  anchor is now the panel's own CTA row — at `--sf-z-stickybar` with
  `padding-bottom: env(safe-area-inset-bottom)`.
- **`DeliveryReturnsInfo`** — 14px rows with gold glyphs (they were 12px with the SUCCESS green, the
  only place a policy was inked in an outcome's colour), and every line dropped until its fact is
  known: `hasDeliveryEstimate()` for a method, `codEnabled` for COD, a positive window for returns,
  and `fillCopy("Prices are {taxNote}.")` for tax.
- **`TrustBadges`** — a third variant, `chips`: glass pills that wrap, with a 16px gold mark.
- **`SocialProof`** — the figure goes gold (13.4:1) so it belongs to the marks beside it rather than
  reading as a second headline; the count moves from muted to secondary (10.5:1).
- **`Breadcrumb`** — 12px, and a linkless crumb in the middle of a trail no longer takes the
  current-page style. The last crumb keeps `aria-current="page"` and drops any `to` it is handed.
- **`BottomNav`** — `hidesBottomNav("/product/...")`, after every hook.

### Verification run

- `CI=true npm run build` — exit 0, **Compiled successfully, 0 warnings**.
- `npm test -- --watchAll=false` — 21 suites (1 skipped: the live API), **233 passed**, 15 new.
- `grep -n "SILK_SPEC\|Fabric\|weave\|handloom\|Tabs" src/pages/ProductDetails/ProductDetails.js` → **0**.
- Word-boundary Meghali sweep over every touched file → **0**. No hard-coded colour in any new
  stylesheet; the one non-token length is the 56px desktop gutter the prompt specifies (the 4px scale
  has 48 and 64, not 56) and it says so at the declaration.
- No `db.json` and no `api.js` change (`git diff --stat db.json` empty after the state QA below).

### Browser QA (Chromium 1194, mock mode, real seeded frames)

`document.title` "Black Rice Face Wash · LAMIKAA NATURALS", description and `og:type=product` set,
canonical written. `/products/1` and `/product/1` both land on `/product/black-rice-face-wash`;
an unknown slug and a product with `isActive:false` both render `<NotFound/>` with
`robots: noindex,nofollow` and the URL kept. The TBA product (`black-rice-face-mist`) shows "Price on
launch", a disabled "Coming soon", **no** Buy now and **no** stock line. Quantity clamps at the real
stock (set to 3: "Only 3 left", + disabled at 3) and a zero-stock product reads "Out of stock" in
three places. Add to Cart → "Added"; wishlist → `aria-pressed="true"`; share → the URL on the
clipboard and the "Link copied" toast; Buy now → `/checkout`.

`ChapterNav`: hidden at scroll 0, visible past 320px, `aria-current` on exactly one pill, Enter on a
pill lands focus on the target section (`document.activeElement.id === "faqs"`) and moves the mark;
the champagne focus ring is present on the pills; `body[data-drawer-open]` hides the bar. Heading
outline `h1 → h2 Delivery & Returns → h2 Overview → h2 Questions, answered → h3 …`, and every
`section[data-chapter]` resolves its own `aria-labelledby`.

| width | document overflow | layout | media plate | bottom nav | sticky bar |
|---|---|---|---|---|---|
| 360 / 390 / 414 | 0 | 1 col, media first | 1:1 | hidden | present, 56px thumb dropped < 400 |
| 768 | 0 | 1 col, media first | 1:1 | hidden | present |
| 1024 | 0 | 44 / 56, gap 32px | 4:5 | n/a | not rendered |
| 1280 / 1440 | 0 | 1.05fr / 1fr, gap 56px, media sticky at 96px | 4:5 | n/a | not rendered |

Under `prefers-reduced-motion: reduce` both the bar and the nav compute `transition-duration: 0s`.
`/`, `/shop`, `/category/face-care` and `/rituals/morning-glow` re-checked after the shared restyles:
0 overflow, 0 page errors, trails unchanged; the tab bar returns the moment the route leaves
`/product/*` (verified with Back).

### Three things the browser found

1. **The container had no gutter.** `sf-container--wide` is a MODIFIER (it sets `max-width` only);
   without `sf-container` beside it the page bled to the viewport edges and the related rail's -4px
   focus-ring margins pushed the document 4px wide at every width. Both call sites now carry the pair.
2. **The title printed the brand twice** — see the decision above.
3. **"FRAGRANCE" ran under its own value.** The size/fragrance/SKU rows were a flex list with a fixed
   `9ch` label; they are now a two-column grid (`max-content minmax(0,1fr)`) with the rows as
   `display: contents`, so the labels form their own column whatever they are called.

### Left for Prompt 26 / 27

The media column is a single `CloudinaryImage` on a plate — no thumbnails, no video, no lightbox, no
swipe (26). The chapters are `overview` plus the three retained blocks; benefits, key ingredients, how
to use, the farmer story, the full INCI list, the pack claims, `caution` and the ritual cross-sell are
27's, as is the product JSON-LD and the `BreadcrumbList` (the trail is already built as one array for
exactly that). `FrequentlyBoughtTogether` still says "Completes the look" — its own copy, in 27's file
list.

## Prompt 26 record (2026-09-08)

### What was built

Two components, one hook, one suite — and the last of the old brand's storefront atoms deleted.

- **`components/pdp/MediaGallery.js` (441) + `.module.css` (324)** — **new**. One list, two kinds:
  `product.media` is an ordered mix of images and videos and the gallery gives it ONE index, one
  counter, one rail, one set of arrows. A separate "video tab" would ask a shopper to know, before
  they look, which of the two they wanted.
  - **Stage** — `.sf-plate` at 4:5 (1:1 ≤768px), `--sf-radius-xl`, hairline, `--sf-shadow-2`, on a
    `GlowWrap tone="gold" intensity={0.14}`. `role="group" aria-roledescription="carousel"
    aria-label="{name} media"`, `tabIndex=0`, ←/→/Home/End and Enter/Space, and `useSwipe`.
    **Only the active row is mounted**: the swap is an `AnimatePresence` crossfade over
    `DURATION.base`, and a VIDEO leaving takes `INSTANT` instead, so the element (and its audio) is
    gone the moment the index moves rather than a third of a second later.
  - **Furniture** — the "Full label / Front panel" pill (top-left, 32px, `aria-pressed`, only where
    the row carries a `crop`), the "Zoom" circle (top-right, image rows), the `aria-live="polite"`
    counter (bottom-right) and 44px glass arrows that arrive with the pointer (`opacity`, never
    `visibility`, so a keyboard visitor can Tab to one and `:focus-within` reveals it; always on under
    `@media (hover: none)`).
  - **Rail** — `role="tablist" aria-label="Product media"`, tabs with `aria-selected` +
    `aria-controls` on the stage, roving tabindex, ←/→/↑/↓/Home/End, and the active thumb scrolled
    into view (`block/inline: "nearest"`, and never on first paint). Image thumbs carry the row's own
    crop at `w_144`; video thumbs take the poster (or the pack) with a gold play mark and
    `aria-label="Video: {title}"`.
  - **Performance** — the first image is `priority` (eager + `fetchpriority="high"`, the PDP's LCP),
    everything else lazy; thumbnails 144px; `preload="metadata"`; `aspect-ratio` everywhere, so
    nothing shifts.
- **`components/pdp/Lightbox.js` (448) + `.module.css` (249)** — **new**, and **no library**:
  `ui/Modal size="full"` already owns the portal, `aria-modal`, the focus trap and restore, Escape,
  the scroll lock and closing on navigation. What is added is the picture — the panel repainted as a
  flat `color-mix(--sf-color-bg 96%)` scrim with **no** backdrop filter, the image at
  `cld(url,{w:2000})` **uncropped**, 48px controls with the counter top-left and Close top-right, the
  ± bar and the keyboard hints on desktop. Zoom is wheel, pinch (two pointers, their distance ratio),
  ± and double-click/double-tap, 1×–4×, with the pan clamped by `panBounds()`. `index` /
  `onIndexChange` are the GALLERY's state, so the two can never drift apart.
- **`hooks/useSwipe.js` (108)** — pointer events (one path for finger, mouse and stylus), `pan-y`
  written onto the element so vertical scrolling stays the browser's, a gesture counted only when it
  travelled further across than down and cleared 40px, the release read on `window` (a flick ends
  past the element's edge), `dragstart` cancelled, and `enabled: false` to stand down entirely — which
  is how the lightbox stops a swipe from fighting a pan while the picture is zoomed.
- **`components/pdp/MediaGallery.test.js` (226)** — 17 tests: the four pure copy/URL rules
  (`counterLabel`, `stepIndex`, `toggleLabel`, `thumbLabel`, `thumbSource`), the lightbox's
  `clampScale`/`panBounds`, and four walks through the rendered gallery (five tabs with the clips
  named, the stage moved from rail/arrows/keyboard, the toggle appearing only where there is a crop,
  and a one-image no-video product rendering with no rail, arrows or counter).

### What changed around them

- **`pages/ProductDetails/ProductDetails.js`** — the Prompt 25 placeholder is gone; the media column
  is `<MediaGallery key={product.id} product={product} />`. The `key` is the reset: walking from one
  product to the next starts the gallery at frame one with the toggle off and the lightbox shut,
  without a single reset effect.
- **`theme/tokens.js`** — `STOREFRONT_CONFIG.gallery` is `{ zoom: true, lightbox: true }`. The old
  side/below thumbnail setting went with the gallery that had one: the rail's position is a
  breakpoint, not something an owner should have to decide.
- **`components/storefront/ProductGallery.{js,module.css}`** — **deleted**, with its `index.js`
  export. `grep -rn "ProductGallery\|thumbnailPosition" src` → **0**.
- **`components/ui/Modal.module.css`** — `.full .body` gained `flex: 1 1 auto`. See the decision; it
  is the one shared primitive this prompt had to touch, and `SearchModal` was re-verified after it.

### Verification

- `CI=true npm run build` → exit 0, **"Compiled successfully." with no warnings**.
- `npm test -- --watchAll=false` → exit 0, 22 suites / 250 tests passed (1 suite / 50 tests skipped:
  the live API).
- `test ! -f src/components/storefront/ProductGallery.js` → removed;
  `grep -rn "ProductGallery|thumbnailPosition" src | wc -l` → **0**.

### Browser QA (Chromium 1194, mock mode, `npm run dev`)

- **Semantics** — stage `role="group" aria-roledescription="carousel" aria-label="Black Rice Face
  Wash media"`, rail `tablist` with 5 tabs, the two clips named "Video: How to use (placeholder
  video)" / "Video: Brand story (placeholder video)", `aria-controls` on every tab pointing at the
  stage id, roving tabindex `0,-1,-1,-1,-1`, counter "1 / 5", first stage image `loading="eager"
  fetchpriority="high"`.
- **The one video rule** — 0 `<video>` elements at rest, 1 on a video row (`muted`, `preload
  "metadata"`, playing after a press), **0 again** after moving off it.
- **Interaction** — rail click, arrows, ←/→/Home/End on the stage, ←/→ + Home/End on the rail (focus
  follows selection), swipe left/right at 390px, a 20px drag ignored, a vertical drag ignored, and a
  drag that starts on an arrow still swiping.
- **Lightbox** — opens on Zoom and on Enter, `aria-modal="true"`, `w_2000` and no `c_crop`, ←/→ move
  the shared index, wheel → 2.46×, ± → 1.5× → 1× with "Zoom out" disabling itself at the floor,
  double-click toggling, the pan clamped exactly as `panBounds` predicts, `body[data-scroll-lock]`
  raised and released, Esc closing and **focus back on the Zoom button** (on the stage when the item
  closed on was a film).
- **Responsive** 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 — no horizontal scroll at any width;
  stage 1.00 ratio to 768 and 0.80 from 1024; rail below the stage to 1024 (56px thumbs) and to the
  left from 1280 (72px); toggle pill 88×32 throughout; the sticky media column still holds at
  `top: 96px` after 900px of scroll (`overflow-x: clip` on the gallery, not `hidden`).
- **A one-image, no-video product** — the goat milk soap was cut to a single media row through the
  mock API, checked (no rail, no arrows, no counter, no dots, one image, Zoom and the label toggle
  still there, no console errors), and **restored**; `git diff db.json` is empty.
- **Reduced motion** — the stage swaps instantly and the dialog is present within a frame.
- **Scrim** — measured off the screenshot: the headline behind the lightbox reads rgb(14,14,16)
  against a rgb(11,11,13) ground, i.e. 3/255. The page is not visible through it.
- Images and icons themselves still cannot be SEEN in this sandbox — `res.cloudinary.com`,
  `picsum.photos`, `fonts.googleapis.com` and `api.iconify.design` reset Chromium's TLS tunnel
  through the agent proxy (curl gets 200), the same limitation Prompts 19–25 recorded. Every
  measurement above is of the real DOM, and the delivery URLs are asserted in the unit tests.

### Three things the browser found

1. **`Modal`'s full-size body did not fill its panel**, so the lightbox's picture region measured
   `1440×0` and every wheel, pan and double-click landed on the foot beneath it. One declaration.
2. **A mouse drag across the stage started the browser's native image drag** and killed the gesture
   (it hung Playwright's input queue mid-drag, twice, which is how it was found). `useSwipe` now
   cancels `dragstart`.
3. **`92svh` was the wrong cap for the lightbox picture** once the head and foot were in the layout;
   `min(92svh, 100%)` keeps the design's ceiling without letting the frame clip the picture.

### Left for Prompt 27 / 33

Nothing of the gallery. Prompt 27 writes the chapters around it and the product JSON-LD; Prompt 33's
admin media manager writes the `media[]` — `crop`, `poster`, `title`, order and the primary flag —
that everything above reads.


## Prompt 27 record (2026-09-08)

### What was built

Nine chapters on `/product/:slug`, in document order, each one absent from the page **and** from
`ChapterNav` when the product has nothing to put in it. The two lists read one set of booleans
computed once in the view, which is the whole reason they cannot drift:

| # | id | Heading | Present when |
|---|---|---|---|
| 01 | `overview` | Overview | always |
| 02 | `benefits` | Benefits | `benefits[]` |
| 03 | `ingredients` | Key ingredients | `keyIngredients[]` or any pack field |
| 04 | `how-to-use` | How to use | `howToUse[]`, `ritualStep`, or a routine |
| 05 | `farmer-story` | The farmer story | `siteContent` gave a sentence |
| 06 | `full-ingredients` | Full ingredients | `ingredientsList` or a "Good to know" row |
| 07 | `faqs` | FAQs | `useFaqs().forProduct(product)` |
| 08 | `reviews` | Reviews | always — the empty state is the point |
| 09 | `complete-the-ritual` | Complete the ritual | a bundle or a related rail |

Four new components under `components/pdp/`:

- **`PackClaims`** (114 + 74) — the "As printed on the pack" block, and the only place on the
  storefront where the carton's *"Enriched with Anti-Ageing Antioxidants"* line is printed. The
  eyebrow is what makes it honest: everything under it is a QUOTATION of the packaging, which is a
  verifiable fact, rather than a promise the shop is making. Claims are set quiet (14px, muted, no
  ticks and no gold — a tick would read as endorsement); `brand.packBadges` are `Chip variant="trust"`
  with every `isPlaceholder` badge dropped; the caution goes through `ContentBlocks`' own
  `::callout Caution` fence (one callout recipe in the design system, not a second copy) with a gold
  left hairline.
- **`IngredientChapter`** (97 + 71) — `keyIngredients[]` as `GlassCard`s, name in Fraunces at 20px
  over a 14px benefit, 1-up ≤768 / 2-up 769–1024 / 3-up ≥1025. Black rice opens the row and takes
  the gold hairline; the lift is a **stable partition**, so an admin's ordering survives around it.
- **`HowToUse`** (132 + 108) — the directions as a real `<ol>` with `Chip variant="step"` numerals,
  the "Ritual step" plate, and "Part of these rituals": the routines whose `steps[].productId` **or**
  `alternativeProductId` names this product (the soap and the body wash are both step one of the body
  ritual), as `RitualCard compact`. Nothing about which rituals exist is typed here — an admin who
  adds a step adds the link.
- **`FarmerStory`** (144 + 44) — two sentences from `siteContent`, `ValueChain compact vertical`,
  `LegalNote` (which takes no text prop, so no surface can state the ownership benefit without the
  qualifier) and a ghost button to `/about`.

### The structured data, and what it refuses to say

`utils/seo.js` 93 → 245. `productJsonLd(product, { url, category, rating, ratingCount })` publishes
`name`, `image`, `description`, `sku`, `brand`, `category` — and three claims only when the shop can
back them:

- **`offers`** only where `isPriceKnown(product)`. Five of the eight products are `priceTBA`; an
  Offer at ₹0 is a lie a search engine prints in a result card. Same predicate as the disabled Add
  to Cart, so the page and the graph agree by construction.
- **`availability`** only where `stock` is an actual number. `Number(null)` is `0`, and `0` would
  have published "out of stock" for a product nobody has counted — caught by the unit test, not by
  reading the code.
- **`aggregateRating`** only where a real average AND a real count exist. On a fresh install that is
  **none of the eight**. Flipping `showSampleReviews` locally produced
  `{ ratingValue: 5, reviewCount: 1 }` on the serum, which is the blended pair the page itself
  prints, rounded to the one decimal it prints it at.

`breadcrumbJsonLd` now also accepts `{ name, url }` beside the trail's `{ label, to }`; the PDP hands
it the same array the visible `Breadcrumb` draws, so the crumb a visitor reads and the crumb a
crawler is told cannot drift.

Measured on the running app (mock mode):

| Product | offers | aggregateRating |
|---|---|---|
| `black-rice-goat-milk-soap` (₹90) | `price 90 · INR · InStock · NewCondition` | absent |
| `black-rice-face-serum` (TBA) | **absent** | absent |
| `black-rice-face-serum`, flag on | absent | `5 / 1 rating` |

### The restyles

- **`ReviewsSection`** — summary plate is `.sf-glass` (the section's ONE blurred layer; the review
  cards stay `--sf-color-surface` behind a hairline, because a page of blurred cards is a scroll-jank
  machine), distribution bars take `--sf-gradient-gold`, each review is a hairline card. Empty state
  is now **"No reviews yet — Reviews are written by customers from My Orders after delivery."**,
  which is the normal state on this range and therefore the most important copy in the file: it
  explains the blank space and describes the only path that can fill it. A sample row wears a dashed
  border and a "Sample" mark — that mark is what makes the flag safe to flip at all. Props unchanged.
- **`FrequentlyBoughtTogether`** — retitled **"Complete the ritual"** with the copy "The next steps
  of the routine, chosen for this product." and new `title`/`note` props (the PDP passes
  `title={null}`; the chapter's own h2 carries it). A companion with no price is **unticked and
  disabled** behind the shared "Price on launch" chip, and the total sums the ticked rows only; with
  nothing ticked the total row is dropped and the button reads "Nothing to add yet" rather than
  offering ₹0.00. Plates take `.sf-plate` (contain, not cover — a bottle with its cap sliced off is
  a defect), and each `+` travels with the tile it adds.
- **`RelatedProducts`** — new `headingLevel` (the PDP passes `h3`), and the edge fades the brief asks
  for, implemented as a **`mask-image` lifted under `:focus-within`**. Prompt 25 had deliberately
  refused a gradient veil because it would dim a card's focus ring exactly when a keyboard visitor
  scrolled that card to the edge; a mask keeps the affordance and can be removed for the one visitor
  it would have hurt.

### One fix outside the brief

`utils/faqs.js` — `faqsForProduct` now gives an inline `product.faqs` row an id
(`p<productId>-<index>`). Inline rows carry no id, `faqAnchorId` is `faq-${id}`, and moving the PDP
onto the shared `FAQ` component would therefore have given every inline row the anchor `faq-`:
duplicate React keys, and opening one answer opens all of them. Confirmed fixed — the rendered page
reports **zero duplicate ids**.

### Verification

```
CI=true npm run build              exit 0, "Compiled successfully.", no warnings
npm test -- --watchAll=false       23 suites passed / 1 skipped · 276 passed / 50 skipped
                                   (+26 new in components/pdp/PdpChapters.test.js)
grep -rn "piece\b|weave|loom" ReviewsSection.js FrequentlyBoughtTogether.js RelatedProducts.js   → 0
grep -rn "studio" (same three)                                                                   → 0
```

### Browser QA (Chromium 1194, mock mode, `npm run dev`)

- All nine chapters render on `/product/black-rice-face-serum` and
  `/product/black-rice-goat-milk-soap`; `ChapterNav` lists all nine; a nav jump lands **focus** on
  the section (`document.activeElement.id === "farmer-story"`).
- Heading outline is clean: `h1` product → `h2` per chapter → `h3` for the INCI disclosure, each FAQ
  and "You may also like". **Zero duplicate ids, zero images without `alt`, zero empty links.**
- `document.body.innerText` contains **no `{{TOKEN}}`**.
- **`scrollWidth === clientWidth` at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440.**
- Keyboard: the INCI disclosure opens on Enter (`aria-expanded` false → true, the list appears); the
  FAQ accordion moves on ArrowDown and opens on Enter; Space on the one enabled bundle checkbox took
  the total from "TOTAL (2 ITEMS) ₹480.00 / Add 2 to Cart" to "TOTAL (1 ITEM) ₹90.00 / Add 1 to Cart".
- Bundle checkbox states on the soap, read from the DOM:
  `[{checked:true,disabled:true}, {checked:false,disabled:true}, {checked:true,disabled:false}]` —
  anchor locked, the TBA face mist unticked and disabled, the priced face wash the only live row.
- `prefers-reduced-motion: reduce`: all nine chapters present, the value chain's first step at
  `opacity: 1, transform: none` on frame one, no console errors.
- Sample reviews: flag off → the empty state; flag flipped locally → the seeded row appears as a
  dashed card with the "Sample" mark and the plate reads 5.0 / 1 rating. **Reverted** — `git diff`
  on `src/config/brand.js` is empty.

### Two things the browser found, both the same bug

Both were components asking a **viewport** media query a question only their **container** could
answer. The PDP's content column is roughly half a viewport at every width above 769px, so a query
that reads "≥1025px, therefore wide" is simply wrong inside it.

1. **`ValueChain` at `orientation="auto"`** laid seven steps in one row from 1025px and ran 83px past
   the column — the whole page took a horizontal scrollbar. Fixed by naming `orientation="vertical"`
   in `FarmerStory`: a narrow column gets the vertical chain, and a media query cannot know it is in
   one.
2. **`FrequentlyBoughtTogether`'s 900px split** gave the plates about 220px to run in and stacked
   them into a totem beside the ledger — the exact layout the query existed to avoid. The split is
   gone; the block is one column at every width, plates over ledger.

A third, smaller: on a 360px phone the plate row wrapped after two tiles and left a `+` dangling at
the end of the first line. Each `+` now travels with the tile it adds.

### Decisions logged

1. **`suitableFor` moved** out of the Overview chapter into the "Good to know" row of Full
   ingredients, where the brief puts it. Printing the same line twice on one page is worse than
   printing it lower.
2. **The shelf-life row stays hidden.** `brand.productDefaults.shelfLife` is still `{{SHELF_LIFE}}`
   (the cartons print a Mfg → Exp pair about 23 months apart, but that is an inference, not a
   confirmed figure). The row appears the moment an owner supplies one — no code change needed.
   Still tracked in `PLACEHOLDERS.md`.
3. **The farmer story deduplicates its own source.** `siteContent.home.aboutTeaser.text`'s first
   paragraph is `siteContent.about.lede` with "(FPC)" dropped — the two differ in the MIDDLE, so a
   substring test cannot catch it. `farmerStoryLines` compares word sets and skips a paragraph that
   shares ≥80% of the shorter one's vocabulary, taking the next instead. Measured on the seed: the
   echo scores 1.00 and is skipped, the purpose paragraph scores 0.36 and is printed.
4. **`RitualCard`'s step thumbnails resolve against `[product, ...related, ...bundle]`** rather than
   a seventh request for the catalogue. `getRelated`'s last pass sweeps the brand, so on an
   eight-product catalogue that list IS the catalogue; where one outgrows it, a step whose product is
   missing keeps its numeral and shows an empty plate, which is `RitualCard`'s own documented
   degradation ("an empty shelf is honest, a borrowed one is not").
5. **`aggregateRating` carries `"@type": "AggregateRating"`** and `offers` carries `"@type": "Offer"`,
   which the brief's shorthand omits — schema.org requires them, and a graph without them is not the
   thing the acceptance criterion asks to validate.
6. **The Rich Results test could not be run from this environment** (outbound HTTPS to Google is
   blocked here). The graphs were validated structurally instead — every URL absolute and built from
   `seoOrigin()`, every `@type` present, and the three conditional keys pinned by unit tests against
   a priced product, a TBA product and a rated product. Worth one pass through
   `search.google.com/test/rich-results` on a machine with network before launch.

### Left for Prompt 28

Nothing of the PDP. Prompt 28 builds the content pages from the same `siteContent` record this
chapter reads two sections of, and `/about` is where the "Read our story" button already points.

---

## Prompt 28 record (2026-09-08)

### What the content pages now are

Five pages, one source of copy. Nothing narrative is typed into JSX on any of them — every
paragraph, heading, callout, quote, answer and clause comes from `siteContent`, and what the
components own is UI furniture ("Our Story", "Contents", "Search the answers", "Send message").
That is a legal rule and not a preference: BRAND.md §3.9 rule 2 makes the qualifiers part of the
sentence ("profits distributed by BAOPCL **can** reach its member farmers as dividends, **subject
to** applicable laws and the company's dividend declaration"), and a paragraph hard-coded in a
component is a paragraph nobody can edit, review or withdraw.

| Route | Component | Reads | Shape |
|---|---|---|---|
| `/about` | `pages/About/About.js` | `siteContent.about` + `.impact` | Opening band → editorial body (drop cap, the `::steps` chain drawn by `ValueChain`, the LAMIKAA Difference callout, the vision pull-quote) → second plate → `ImpactTriptych showImages` → `Pillars compact` + `LegalNote` → CTA row |
| `/why-lamikaa` | `pages/WhyLamikaa/WhyLamikaa.js` | `siteContent.whyLamikaa` + `.impact` | Opening band → philosophy + `Pillars` → `#difference` (ownership chain + `LegalNote`) → `#impact` (triptych + three "Read more" disclosures) → `#vision` → CTA row |
| `/faq` | `pages/Faq/Faq.js` | `useFaqs()` + `siteContent.faqPage` | Head + 52px search (`role="status"` count) → sticky group rail / mobile chip strip → one `<FAQ>` per group → contact band. `FAQPage` JSON-LD |
| `/contact` | `pages/Contact/Contact.js` | `siteContent.contact` + `useStoreSettings()` | Head → channels grid → the lead form (behaviour unchanged) → rail (Visit, `Pillars compact`, socials, FAQ) |
| `/policies/:policy` | `pages/Policies/PolicyPage.js` | `siteContent.policies[key]` (+ `settings`, `shipping.getMethods`) | Breadcrumb → kicker → title → revision stamp → TOC rail → numbered clauses → colophon + cross-links |

### What was deleted

Seven page folders, **6,844 lines**: `AboutUs/`, `HelpCenter/`, `Support/`, `PrivacyPolicy/`,
`TermsOfService/`, `CookiePolicy/`, `RefundPolicy/`. Four of those were four copies of one
"document" stylesheet whose own header said *"this block is deliberately identical in all four
modules… Any change here gets copied into the other three"* — collapsing the four routes into one
param route collapsed the four copies with it, so a change to the document look is now a change to
all four documents by construction.

The Terms page is the reason this mattered. It stated **three hard-coded rupee shipping rates**
(₹99 / ₹199 / ₹499), a Kolkata jurisdiction and a company name none of which this store runs on,
and because they were JSX, correcting them was a deploy.

Two constants went with the pages: `WHY_CHOOSE_US` (one consumer, the Contact rail, which now
mounts `<Pillars compact/>`) and `POLICY_LAST_UPDATED` (one hard-coded date shared by four
hard-coded documents, replaced by each record's own `updatedAt`).

### The clauses a policy cannot carry in stored prose

`src/utils/policyClauses.js` — the whole of the old Terms page's live-clause logic, lifted out and
extended, emitting markdown-lite so a generated clause typesets exactly like a stored one and takes
a number in the same run:

| Builder | Source | Appended to |
|---|---|---|
| `taxClause` | `settings.store.currency / currencySymbol / taxRate / taxIncluded` | Terms |
| `codClause` | `settings.payment.codEnabled / codMaxOrder` | Terms |
| `returnsClause` | `STOREFRONT_CONFIG.returnsWindowDays` | Terms |
| `shippingMethodsBlock` | `apiService.shipping.getMethods()` | Shipping & Returns |

**Every builder returns `""` when it has nothing true to say**, and the page drops the block rather
than printing a heading over an empty space. The tax clause says "inclusive of all taxes" for the
seeded 0-rate/inclusive pair rather than claiming a 0% rate — the packs print "M.R.P (incl. of all
taxes)", and a stated 0% would be false. `shippingMethodsBlock` prints method **names** and
descriptions and **never a rate**: money in a policy belongs where the checkout can be held to it.

### Numbering, anchors and the table of contents

The stored bodies open their clauses `## 01. Dispatch`. The ordinal is **stripped off the heading**
(`clauseTitle`, at most two digits so "2026 in review" keeps its year) and **re-generated by
position** (`clauseNumeral`), hung into the left gutter from 1280px. That is what lets the Terms
document's generated pricing clause be **11** after ten stored ones, and what keeps the document
right when an owner reorders two clauses in the admin without renumbering them by hand. Anchors are
slugified titles (`#your-account`), de-duplicated by number, and the TOC is generated from the
clauses **actually on the page** — so a generated clause is in it and a clause whose every sentence
was stripped is not.

### Tokens still never print

Every policy body goes through `fillCopy` (which fills `{freeShipping}` / `{codSentence}` /
`{taxNote}` / `{{RETURN_WINDOW_DAYS}}` and then drops any sentence still quoting an unsupplied
`{{TOKEN}}`) before it is parsed. Verified on the page: the GSTIN/CIN line, the `{{JURISDICTION}}`
sentence and the `{{DISPATCH_SLA}}` sentence are **absent**, and the sentences either side of each
survive. The `FAQPage` graph is built from the same prepared text the accordion renders — a graph
built from the raw answer would publish `{{DISPATCH_SLA}}` to a crawler while the page quietly
dropped the line.

### Files

**Created (13)** — `pages/About/About.{js,module.css,test.js}`,
`pages/WhyLamikaa/WhyLamikaa.{js,module.css}`, `pages/Faq/Faq.{js,module.css,test.js}`,
`pages/Contact/Contact.{js,module.css}`, `pages/Policies/PolicyPage.{js,module.css,test.js}`,
`utils/policyClauses.{js,test.js}`, `hooks/useSiteContent.js`.

**Changed (6)** — `App.js` (five routes, four policy routes → one param route, seven lazy imports
retired), `components/ui/ContentBlocks.js` (`dropCap` prop), `utils/seo.js` (+`faqPageJsonLd`),
`utils/constants.js` (+`ROUTES.POLICY`, −`WHY_CHOOSE_US`, −`POLICY_LAST_UPDATED`),
`utils/socialLinks.js` and `pages/_ComingSoon/ComingSoon.js` (comments that named deleted files).

**Deleted (14)** — the seven folders above.

### Verification

- `CI=true npm run build` — **exit 0, "Compiled successfully.", no warnings** (two
  `react-hooks/exhaustive-deps` warnings were found and fixed: `content?.groups` and
  `impact?.items` are fresh arrays on every render and are now read inside their memos).
- `npm test -- --watchAll=false` — **313 passed / 50 skipped, 27 suites**. 37 new assertions across
  four files: `policyClauses.test.js` (the "" answers, the no-rate rule, the FAQ graph),
  `PolicyPage.test.js` (numbering by position, the stripped ordinal, unique anchors, the four-slug
  map), `About.test.js` (`splitAtChain`), `Faq.test.js` (no answer disappears when a heading is
  renamed).
- Greps: `grep -rn "Galleria\|Kolkata, West\|Sualkuchi\|National Handloom" src` → **0**; all seven
  folders gone; `grep -n "ComingSoon" src/App.js` → **`/cart` only**.

### Browser QA (Chromium 1194, mock mode, dev server)

Every route rendered, one `<h1>` each, **no `{{TOKEN}}` anywhere**, no console error but the
expected `ERR_CONNECTION_RESET` on the external placeholder images:

- `/about` — 7 value-chain steps, **one** drop cap, 4 pillars, the ownership sentence present.
- `/why-lamikaa` — `#difference`, `#impact`, `#vision` all real ids; 3 "Read more" disclosures, and
  opening "Financial" reveals the full §3.4 body.
- `/faq` — 3 group headings (Account is empty and is skipped), 8 questions, rail hrefs
  `#group-brand #group-products #group-orders`; search "black rice" → **"2 answers for "black
  rice""** and 2 rows; a miss shows the empty state; `FAQPage` graph carries 8 questions and no
  token. **Cold load on `/faq#faq-7` opens, focuses and scrolls to that row**; `#group-orders`
  scrolls.
- `/contact` — with the seed (all placeholders) **0 channel cards and no Visit card**, which is the
  required behaviour; against a patched settings record, `mailto:`/`tel:`/`wa.me` cards, the Visit
  card and a Maps link built from the address. Invalid submit focuses `#name` and writes 4 errors; a
  valid submit posts a lead carrying all seven keys (`category: "general"`, `orderNumber: ""`) and
  moves focus to "Message sent". **The QA lead and the settings patch were both reverted —
  `git status db.json` is clean.**
- `/policies/*` — Privacy's TOC has 9 entries and **every target exists**; Terms has 11 clauses
  numbered `01…11` with the generated "Pricing, tax and payment" last, and it re-worded itself from
  "inclusive of all taxes" to "exclusive of 18% tax" + "up to ₹5,000" when the settings changed.
  Shipping & Returns lists the seeded "Standard Delivery" and **no ₹ figure**. `/policies/other` →
  the real 404. `/help`, `/support`, `/refund` still redirect.
- **360 / 390 / 414 / 768 / 1024 / 1280 / 1440 on all five page types: `scrollWidth === clientWidth`
  at every one.**

### Left for Prompt 29

Nothing of the content pages. `/cart` is the last `ComingSoon` stub, and the cart drawer's
"View cart" is already pointing at it.


## Prompt 29 record (2026-09-08)

### What was built

**`src/components/cart/CrossSell.{js,module.css}` (216 + 111) — new.** "Complete your ritual" /
"Start with", lifted out of `CartDrawer` whole: `crossSellFor` (the three-tier ranking — the
merchant's own `frequentlyBoughtTogetherIds` first, then the next step of the same ritual, then
hero order; never a line already in the cart and never an uncommitted price) plus the row markup
(56px plate → name → price → one compact Add). Props: `products`, `items`, `limit`, `title`,
`headingLevel`, `variant: "drawer" | "page"`, `onNavigate`, `className`. The caller owns the
CATALOGUE (`products` is a prop — the tray's ref cache and the page's mount lifecycle both survive)
and the FRAME (`.cross` sets no padding and draws no seam; `CartDrawer.module.css .crossSlot` and
`Cart.module.css .cross` supply those). `addToCart(buildCartItem(p), 1, { openDrawer: false })`
moved in with it, so neither surface pops a drawer over the thing the shopper is already reading.

**`src/pages/Cart/Cart.{js,module.css}` (482 + 508) — new, replacing the last `ComingSoon` stub.**
`useSeo({ title: "Your cart", noindex: true })`; `SectionHeading as="h1"` with eyebrow "Cart",
title "Your cart" and the live "{n} items" lede. From 1025px the layout is `1.4fr 1fr`: on the left
the line items (96px plate → 112px at 1025px, name as a link to the PDP, variant, unit price,
`QuantityStepper` capped by real stock, line total, one remove mark taken out of the flow so the
plate sets the row height, `AnimatePresence` collapse on removal), then the cross-sell; on the right
a sticky `GlassCard strong` at `top: 96px` carrying subtotal, the drawer's coupon disclosure
GESTURE FOR GESTURE (collapsed until asked for, held open while it has something unread to say,
auto-dropped with a note when the cart falls under the coupon's minimum), the discount row,
"Shipping and taxes calculated at checkout", `Button primary block` Checkout, `Button ghost block`
Continue shopping and `LegalNote compact`. **There is no Total** — the same refusal the tray makes,
for the same reason. Below 769px: one column, the summary card after the items, and a 64px
`sf-glass sf-glass--strong` thumb bar (Subtotal + Checkout) at `--sf-z-stickybar`. Empty state:
eyebrow "Your cart is empty", a `GlassCard` (Prompt 31 formalises `ui/EmptyState`), "Continue
shopping" to `/shop`, and the cross-sell's "Start with".

**`src/pages/Checkout/Checkout.module.css` — rewritten from scratch, 2 107 → 1 492 lines.** The old
sheet dressed a hand-rolled stepper, hand-rolled buttons and hand-rolled cards; this one dresses
`ui/Button`, `ui/Chip`, `ui/GlassCard`, `ui/SectionHeading`, `.sf-plate` and `.sf-hairline` and adds
only what a shared class cannot know. `grid-template-areas` states once that the nav row sits under
the CONTENT column and never under the rail: `"steps rail" / "nav rail"` at
`minmax(0,1fr) 320px` from 769px and `minmax(0,1fr) 380px` (48px column gap) from 1025px, one
column with the collapsible summary band below.

**`src/pages/Checkout/Checkout.js` — markup, classes and copy only.** Step line: four
`Chip variant="step"` numerals at 36px joined by hairlines that carry the signature gradient behind
you, a gold check on a completed step, `aria-current="step"` on the current one. Each step is a
`GlassCard padding="lg"`. Inputs are 48px on `--sf-color-surface-2` with a gold focus ring and an
error said in words beside `mdi:alert-circle-outline` (`aria-invalid` unchanged). Every radio and
checkbox is a real control clipped inside a `<label>` option card of at least 64px, which shows the
focus ring through `:focus-within` and the selection through a gold ring AND a filled indicator.
Store credit is the page's one violet-glow card; payment methods are cards that open their own mock
form. The rail is a sticky `GlassCard strong` on a desktop and the same markup as a collapsible
glass bar below 769px, showing item plates, subtotal, discount, shipping, tax, the COD fee, the
total, store credit and the amount payable. Nav row: `Button ghost` Back + one primary 52px CTA
("Continue to shipping" / "Continue to payment" / "Review order" / "Place order"), `aria-busy` and
a `role="status"` line while processing.

**Copy fixes.** "Delivered across India in insured silk packaging.", "Choose a weave and it waits
here" and the loom illustration (and its `--empty-*` aliases) are gone; "pieces" is "items";
`currencySymbol` from settings replaces the hard-coded `&#8377;` on the store-credit field; the
phone placeholder is "+91 …"; the tax line is "Tax" + `fillCopy("Prices are {taxNote}.")`.
`grep -n "silk\|weave\|loom\|&#8377;" src/pages/Checkout/Checkout.js` → **0**.

**Routes.** `/cart` → `Cart` (lazy). `ComingSoon` has no route left —
`grep -n "ComingSoon" src/App.js | wc -l` → **0** (Prompt 31 deletes the folder).

### The two additive guards (the only logic added)

1. **The TBA guard, step 0.** `isChargeable(item)` is `Number.isFinite(price) && price > 0`;
   `dropUnpricedLines()` removes every failing line, fires one toast naming what left and why, and
   returns `true`, which stops `handleNext` advancing. Nothing in the UI can create such a line
   (`buildCartItem` throws `PRICE_TBA`, every Add is disabled before it), but a cart restored from
   localStorage or merged from the API can — and a zero-price line would check out free.
   **Verified**: a seeded cart of one priced line and one at `price: 0` shows 2 rows, the first
   press drops the bad one and stays on step 0 with the toast "Removed from your order — One item
   has no price yet and cannot be checked out.", the second press advances.
2. **The order-failure alert.** `orderFailed` state → a `role="alert"` `GlassCard` reading "We
   couldn't place your order. Nothing was charged. Please try again." with a Try again button that
   re-runs `placeOrder`. Wired to BOTH the `catch` and `result.success === false`, because
   `OrderContext.createOrder` catches its own failures and returns rather than throwing.

### What did NOT change, proved rather than asserted

Diffed byte-for-byte against `HEAD:src/pages/Checkout/Checkout.js`, all **IDENTICAL**: the money
block (`subtotal` → `couponDiscount` → `shippingCost` → `taxableBase` → `taxAmount` → `total` →
`maxApplicableCredit` → `storeCreditApplied` → `amountPayable` → `fullyCovered` → the COD bounds →
`codFee` → `amountDue`), the whole `orderData` payload, `STEPS`, `couponDiscountFor`, `describedBy`,
`etaFor`, `applyCoupon`/`removeCoupon`, `validateAddress` (all seven required fields),
`PAYMENT_OPTIONS` and `assurances`. Every remaining hunk in the file is an import, a presentational
helper (`lineThumb`, `stockCap`, `isChargeable`, `FieldError`), markup, a class name, copy, the
extracted `ctaLabel`, or one of the two guards above.

### Verification (mock mode, JSON Server on :3001, Chromium)

- **Two real orders placed end to end**, both landing on `/order-confirmation/<orderNumber>`:
  - COD: `subtotal 739 · discount 0 · shipping 0 · tax 0 · codFee 0 · total 739 · storeCreditUsed 0
    · amountPayable 739 · cod / pending / unfulfilled / pending`, with the matching `payments` row.
  - Coupon + store credit: `SAMPLE10` → `discountAmount 74`, `total 665`, `storeCreditUsed 390`,
    `amountPayable 275`, `card / paid`. **`coupons[0].usedCount` 0 → 1**, `users[0].storeCredit`
    390 → 0, and a `walletTransactions` debit of 390 quoting the order number.
- **COD rules.** With the seeded `codMaxOrder: 0` (normalised to "no maximum") COD is selectable and
  its form reads "collected at the door". Setting `codMaxOrder: 100` in settings put a 665 order out
  of range: the COD row went disabled with "Available for orders up to ₹100.00" and the selection
  **reset itself to card**.
- **Address validation.** Clearing the three prefilled fields and pressing Continue produced
  **7 `aria-invalid="true"` controls and 7 "Required" messages**; `#ship-country` is `readOnly` and
  reads "India"; `#ship-phone` placeholder is "+91 …". Saved-address radios and "Add new address"
  behave as before (the seeded customer's Home address is preselected and carries the Default chip).
- **Tax wording.** With the seed (`taxIncluded: true`, `taxRate: 0`) the rail prints "Prices are
  inclusive of all taxes."
- **The failure alert.** JSON Server killed between the review step and Place order: the panel
  appears with its Try again button, the URL stays `/checkout`, nothing navigates.
- **`/cart`.** Empty state, line editing, `SAMPLE10` (chip + "Discount (SAMPLE10)" row, both
  surviving a quantity change), the cross-sell, and the link to `/checkout`.
- **BottomNav.** Nodes on the page: `/shop` 1, `/checkout` 1, `/cart` **0**, `/product/*` **0**.
- **Measured live**: inputs `48px`, option cards `min-height 64px`, CTA `min-height 52px`, step chips
  `36px`. `scrollWidth === clientWidth` at **360 / 390 / 414 / 768 / 1024 / 1280 / 1440** on both
  `/cart` and `/checkout`.
- **Keyboard only**: 16 tabs reach the step-0 CTA with a visible ring, Enter advances to Shipping,
  a focused shipping radio lights its option card's ring, ArrowDown moves the payment selection.
- **`prefers-reduced-motion: reduce`**: both pages render and swap steps instantly.
- `CI=true npm run build` **exit 0 with no warnings**; `npm test -- --watchAll=false`
  **27 suites passed / 1 skipped — 313 passed, 50 skipped**. `CartDrawer.test.js` now imports
  `crossSellFor` from `../cart/CrossSell` and `PurchasePanel.test.js` asserts `hidesBottomNav`
  covers `/cart`.
- **`git status db.json` clean** — the QA orders, payments, wallet rows and the `codMaxOrder` change
  were all reverted.

### Left for Prompt 30

Nothing of the cart or the checkout. `pages/_ComingSoon/` is now unreferenced and is Prompt 31's to
delete; the empty states on both pages are the `GlassCard` that Prompt 31 will formalise as
`ui/EmptyState`.

---

## Prompt 30 record (2026-09-08)

### What was built

**`src/utils/orderStatus.js` (84 lines, new).** `deriveOrderStatus` and `STATUS_CONFIG` were byte-identical
in `OrderHistory.js:18-47` and `Profile.js:18-47` — two homes for one truth, and the moment one of them
learned about a new state the other quietly disagreed about the same order. They now live here once, with
`getStatusInfo(status)` and `orderStatusInfo(order)` (which returns `{ status, label, tone }`, because every
caller needed the key AND the word). `STATUS_CONFIG` is the union of the two old tables — the five canonical
states plus the four legacy `status` aliases OrderHistory carried (`pending`, `completed`, `failed`,
`refunded`) — so neither page lost a row.

**`AuthModal` on `ui/Modal`** (1 049 → 875 JS, 777 → 502 CSS). Deleted: the overlay, the `FOCUSABLE_SELECTOR`
tab-cycling trap, the Escape listener, the `document.body.style.overflow` lock, the `isMobile` resize
listener and its desktop/mobile motion branch, the close button, and `CloseIcon`. `Modal` owns all of them
and adds two the dialog never had (close on navigation, scrollbar-width compensation). Kept exactly:
`{ open, onClose, defaultTab }`, the tablist with its roving tabindex and Home/End, the directional pane
slide, the password-strength meter, the three show/hide toggles, both validators, `login`/`register`, every
`aria-invalid`/`aria-describedby` pair, remember-me, the forgot-password note, and the three legal links.
Name placeholders are now neutral ("First name" / "Last name"). Copy: **"Welcome back"** and
**"Create your account"**.

**`ReviewModal` on `ui/Modal`** (337 → 248 JS, 425 → 247 CSS). Same four deletions. Props, the star
radiogroup with its words, both counters, the edit note and the moderation notice are unchanged; the product
sits on a `.sf-plate` through `CloudinaryImage` (packaging is contained, never cropped) and Cancel/Submit
moved into Modal's footer rail. New placeholder: *"How does it feel on your skin? How does it smell? What
would you tell a friend?"*

**`Profile`** (1 415 → 1 398 JS, 1 757 → 1 352 CSS). The dashboard is a `320px 1fr` grid from 1025px — an
identity `GlassCard` (initials inside a signature-gradient ring, greeting, email, membership badge, "Edit
details") over the three figures on the left; the 52px index and the recent orders on the right. Sections are
`GlassCard`s at 24px; addresses wear a gold `Chip variant="trust"` "Default" and a gold hairline; the wallet
is a glowing balance band over hairline ledger rows with credit/debit tones; fields are the 48px sunken input
the checkout already wears. Settings is the password block alone.

**`OrderHistory`** (1 185 → 1 159 JS, 1 439 → 908 CSS). Each record is a `GlassCard`: number + copy control +
date + `Chip variant="status"` on the head row, a 56px `CloudinaryImage` plate strip with the total, three
`Chip variant="step"` numerals joined by a hairline that turns into the signature gradient behind you, and
pill `Button`s that wrap. The two disclosures keep the `grid-template-rows: 0fr → 1fr` technique (the same
one `ui/Accordion` uses) and now read the shared `--sf-transition` instead of a local duration variable.

**`Wishlist`** (499 → 496 JS, 632 → 336 CSS). "Your wishlist" through `SectionHeading`; a glass guest band
and a glass toolbar; `Button variant="secondary" block` under every `ProductCard`; a 1/2/3/4-column grid at
360/640/1024/1280 (measured); the empty state is the shared `GlassCard` pattern with a hairline heart.

### What did NOT change, proved rather than asserted

- **Profile's effects and handlers are byte-identical to HEAD.** The 374-line block from
  `// Populate form data from user` to `// ---- Logged-out guard ----` — the two fetch effects, the feedback
  timer, `handleProfileSave`, `getPasswordStrength`, `handlePasswordSubmit`, the whole address CRUD with its
  default-promotion rules and legacy-row normalisation, and `handleLogout` — compares equal.
- **OrderHistory's handler block differs in exactly five places**, all of them the deduplication: the local
  `getStatusInfo` wrapper is gone and `isReturnEligible`, `isCancellable`, `isReviewable` and the filter now
  call `orderStatusInfo(order)`. `fetchOrders`, `handleCopy`, `reorderableItems`, `handleReorder`,
  `reviewFor`, `openReviewModal`, `handleSubmitReview` and `handleCancelOrder` are untouched.
- **`RETURN_WINDOW_DAYS` is the only value that moved**: a local `7` became
  `STOREFRONT_CONFIG.returnsWindowDays`, which is the same 7 the PDP's "Easy returns" badge and the Delivery
  & Returns panel already print. One policy, one number.
- **`git status db.json` clean.** Every browser run wrote to a scratchpad copy through the supported
  `JSON_SERVER_DB` override (`server.js:47-49`).

### Verification

- `CI=true npm run build` → **exit 0, "Compiled successfully.", no warnings**.
- `npm test -- --watchAll=false` → **27 suites passed, 1 skipped; 313 tests passed, 50 skipped**.
- `grep -rn "Muga\|Eri\|weave\|loom\|Collection" src/pages/Profile src/pages/OrderHistory src/pages/Wishlist src/components/AuthModal src/components/ReviewModal` → **0**. A wider sweep
  (`silk|muga|eri|weav|loom|textile|garment|woven|saree|fabric|drape`, case-insensitive) returns three hits,
  all of them the word *fabricate* in a comment about not inventing data.
- `grep -rn "deriveOrderStatus" src --include=*.js | grep -v utils/orderStatus.js | wc -l` → **2**;
  `grep -rln "utils/orderStatus" src --include=*.js` → **2 files**.
- Token audit: every `var(--sf-*)` in all five stylesheets resolves against
  `storefront-tokens.css` + `storefront-primitives.css` (script, 0 missing). **No colour hex and no `rgba()`
  in any of the five modules**; the only `#` in all 3 345 lines is the two `linear-gradient(#000 0 0)` mask
  stencils on the avatar's gradient ring — the opacity mask `Chip.module.css` already uses for the step
  numeral's ring, not a palette value. The two `DANGER_HEX = "#FF8A80"` constants in the JS are the
  pre-existing, documented SweetAlert2 exception (it renders outside the React tree and takes a colour
  value, not a token) and are unchanged.

### Browser QA (Chromium 1194, mock mode, `npm run dev`, scratchpad db)

- **Auth**: modal opens on "Welcome back"; **0 elements matching /Google|Facebook/**; tab click and the Home
  key both move the tablist; strength reads "Weak password" → "Strong password"; empty submit raises both
  field errors; login lands and closes the dialog. At 390×844 the panel measures **390×844 at y=0** (a
  full sheet); focus starts inside it and is still inside after 25 Tabs; Escape closes it.
- **Profile**: dashboard grid is `320px 880px` at 1280 and one column at 1024; index rows measure
  **54–55px**; figures read 3 / 1 / 1; edit name + phone persisted (`users/1.phone` → `9876543210`); add an
  address (1 → 2), promote it to default, edit (form pre-filled), delete with its confirm (2 → 1) and
  **exactly one `isDefault: true` survives**; the wallet shows ₹390.00 over one credit row; the password
  checklist reports 5 of 5 met; **0 elements matching /appearance/i**.
- **Orders**: 3 records, five filter chips, plates measure **56×56**; the Delivered filter narrows to 1;
  both disclosures animate open; cancelling the processing order raises *"Order ORD-20260904-0002 will be
  cancelled. No payment has been collected, so there's nothing to refund."* (the COD branch) and the chip
  flips to Cancelled; Reorder opens the tray with an "Added to cart" toast.
- **The review round trip**: written from the delivered order → `reviews/3` is `pending` → the chip reads
  "Review pending approval" → approved in Admin → Reviews → `reviews/3` is `approved` → the title and
  "Sample C." render on `/product/black-rice-face-wash` → back in Orders the chip reads **"Review
  published"** and the button reads **"Edit review"**.
- **Wishlist**: hearts from `/search` persist as a guest; the band invites without gating; **columns measure
  1 / 2 / 3 / 4 at 360 / 640 / 1024 / 1280** (and 4 at 1440); the Move-to-cart pill is exactly as wide as its
  card; sort re-orders; move-to-cart removes one line silently; heart-remove drains 3 → 2 → 1 → 0 and lands
  on "Your wishlist is empty"; Clear all raises the context's own confirm; signing in merges the guest list
  and drops the band.
- **Responsive**: `scrollWidth === clientWidth` at **360 / 390 / 414 / 768 / 1024 / 1280 / 1440** on
  `/profile`, `/orders` and `/wishlist`, signed in and signed out. **Zero page errors** across every run.
- **Reduced motion**: with `prefers-reduced-motion: reduce` every computed `transition-duration` on
  `/wishlist` is `0s` and no animation runs; the two keyframe spinners (refresh, in-button) slow to 2.4s
  rather than stopping — they are the only "something is happening" signal either control has.

### Left for Prompt 31

The empty states on all four surfaces are still the ad-hoc `GlassCard` that Prompt 31 formalises as
`ui/EmptyState`; `pages/_ComingSoon/` is still unreferenced and still Prompt 31's to delete. Nothing else of
the auth, account, orders or wishlist surfaces.

---

## Prompt 31 record (2026-09-08)

### What was built

**`src/components/ui/EmptyState.js` (87) + `.module.css` (150) + `src/components/ui/ErrorState.js` (64)**, both exported
from `ui/index.js`.

`EmptyState` is `{ eyebrow, title, titleAs, text, icon, actions, compact }` over a `GlassCard`: a 520px centred column
(40px padding, 24px in `compact` and below 481px), a 56px ring drawn as a **signature-gradient seam** — a filled circle
with its middle masked out, because a border cannot take a gradient — around a 24px hairline Iconify glyph, the gold
`.sf-eyebrow`, a Fraunces 24px title and 15px secondary text held to 44ch, then pill actions that stack full-width on a
phone and wrap centred from 481px. It is a plain `<section>` with **no live region**: an empty list is the page's
ordinary content, not an announcement.

`ErrorState` composes it — one stylesheet, so a failure can never look like a different application — and adds only the
three things a failure needs and an empty list must never have: `role="alert"`, a **"Try again"** first in the action
row that calls `onRetry`, and honest copy (`"We couldn't load this"` / `"Nothing was changed. Check your connection and
try again."`). Callers append their own actions after the retry; a caller with nothing to re-run passes only `actions`
and gets no false promise.

**`OrderConfirmation`** keeps every behaviour it had — `getByOrderNumber`, the `paymentStatus`-driven chip **and** lede,
`createdAt + 5 days` labelled an estimate unless `shippingStatus === "delivered"`, the clipboard-verified copy button
with its `role="status"` announcement, the one-shot confetti, the money ledger with its Store credit / Amount paid pair,
the address block, and the invoice placeholder still drawn as the muted "Coming soon" row it is. Restyled to: a 96px
seal (`GlowWrap tone="gold"` → gradient ring → ink check → one halo that expands once), the gold eyebrow "Order
confirmed" between two gradient hairlines, a Fraunces **"Thank you, {firstName}"**, a **glass record card** that is
`1fr 1fr` from 769px and stacked with a hairline below it, hairline ledger rows at 15px, `Chip variant="status"` for the
payment state, and three pill `Button`s — **"Continue shopping" now goes to `/shop`**, not `/`. Its loading branch is a
`Skeleton` silhouette of the page (96px circle, title bar, two lines, three panels at the real heights); its failed and
not-found branches are `ErrorState` and `EmptyState`, each taking the `h1`.

**`SpecialOffers`** keeps the `enabled` gate, `dealsConfig.hero`, `resolveCountdownTarget`, the coupon vouchers with
their honest copy failure, Deal of the Day, the category tabs derived from present categories, the discount-derived
fallbacks, `useAddedFlash` and the `buildCartItem` adds. **Its 110-line copy of the shared card is gone** — the
markdown wall renders `storefront/ProductCard` in a `motion.div` cell that owns the reveal and the filter exit
(`grep -rn "const ProductCard" src/pages/SpecialOffers` → **0**). Vouchers are `GlassCard glow="gold"` at a fixed
3/2/1-up with the code on a dashed chip in **monospace gold**; the seed's disabled page and the "nothing is reduced"
branch are `EmptyState`; a failed read is a new `ErrorState` with a retry. `useSeo({ title: "Offers" })`.

**`Search`** adopts `EmptyState` (with the popular-term chips as its children) and gains the `ErrorState` it never had.
**`NotFound`** is `EmptyState` with the "404" eyebrow and `titleAs="h1"`. **`RouteFallback`** was already the loading
member of the family and only gained the cross-reference.

**`src/pages/_ComingSoon/` deleted** (52 lines; `grep -rn "ComingSoon" src` → **0**), and with the last page-level
spinner gone the now-unreferenced global `.loading-spinner` + `@keyframes spin` came out of `App.css`.

### The sweep, by the numbers

| | |
|---|---|
| `<EmptyState>` call sites | **20** across 12 pages (+ 3 in the playground) |
| `<ErrorState>` call sites | **7** across 7 pages (+ 1 in the playground) |
| Hand-rolled state blocks replaced | **27** |
| Bespoke state artwork deleted | `EmptyMark`, `BagMark`, `SealedMark`, `AlertMark` (OrderHistory/Wishlist), `TagMark` (SpecialOffers), `HeartMark` + the local `ProductCard` + `CardSkeleton` (SpecialOffers) |
| `.state*` / `.empty*` / `.panel*` class families retired | 13 stylesheets, **−661 lines net** |
| CSS lines | SpecialOffers 1330 → 1024, OrderConfirmation 870 → 752, Profile 1352 → 1319, OrderHistory 908 → 875, NotFound 40 → 15, Wishlist 336 → 308, Shop 242 → 217, App.css 396 → 373, Rituals 265 → 246, Faq 435 → 420, Cart 508 → 494, Checkout 1492 → 1478, Search 145 → 139, RitualDetail 197 → 195 |

### The state-consistency checklist

`—` means the state cannot occur on that surface, with the reason. Every list page branches on **failed BEFORE
`length === 0`**, so a dropped read is never reported as an empty answer.

| Page | Loading | Empty | Error | Not found |
|---|---|---|---|---|
| `/` Home | `Skeleton variant="block"` per lazy section (reserved heights) | — (sections self-hide when their data is absent) | — (each section renders nothing rather than a page-level failure) | — |
| `/shop`, `/category/:slug` | 3 × `Skeleton` chapter (4:5 plate + 2 text blocks) | **`EmptyState`** "Nothing here yet" → All products | **`ErrorState`** + `onRetry={retry}` | `NotFound` for an unknown slug (`getByCategorySlug` → null) |
| `/rituals` | 3 × `Skeleton` (16:10 + text) | **`EmptyState`** "No routines yet" | **`ErrorState`** + retry (new: the panel had no retry) | — |
| `/rituals/:slug` | `Skeleton` head + steps | — (a ritual with no steps renders its story) | **`ErrorState`** + retry, taking the `h1` | `NotFound` (`getBySlug` → null) |
| `/product/:slug` | `PageSkeleton` (stage + panel + chapters) | — | `NotFound` (a failed read and a missing product are both "not this page") | `NotFound` |
| `/search` | 4 × `Skeleton variant="card"` | **`EmptyState`** + popular-term chips | **`ErrorState`** + retry (**new**) | — |
| `/cart` | — (cart is local state) | **`EmptyState`** "Nothing here yet" + the cross-sell rail | — | — |
| `/checkout` | — | **`EmptyState`** (the cart page's own card, one screen apart) | inline per-field + per-step errors, `role="alert"` | — |
| `/order-confirmation/:n` | `Skeleton` page silhouette (**was a spinner**) | — | **`ErrorState`** + retry + View orders | **`EmptyState`** "We couldn't find that order" |
| `/orders` | 3 × `GlassCard` + `Skeleton` rows | **`EmptyState`** ×3 — signed out, no orders, no match | **`ErrorState`** + `onRetry={fetchOrders}` | — |
| `/profile` | `sf-skeleton` rows in the recent-orders and wallet panels | **`EmptyState compact`** ×5 — recent orders, wallet, addresses, payment, notifications | — (a failed stats read shows "—", never a fabricated 0) | — |
| `/wishlist` | `SkeletonCell` grid + rail | **`EmptyState`** "Your wishlist is empty"; the guest band above it is unchanged | — (the context keeps the last-known local list; the suggestion rail simply hides) | — |
| `/special-offers` | `HeadSkeleton`, `VoucherSkeleton` ×3, `Skeleton variant="card"` ×8 | **`EmptyState`** ×2 — offers off (the seed's state, `h1`), nothing reduced | **`ErrorState`** + retry (**new**) | — |
| `/faq` | — (`FaqContext` seeds the built-in answers) | **`EmptyState`** "Nothing here matches …" → Write to us | — (the context falls back to the built-in set, so the page is never blank because of the network) | — |
| `/contact` | — | — | **inline**, `role="alert"` — per-field and the submit error, as the prompt specifies | — |
| `/about`, `/why-lamikaa` | `Skeleton variant="text"` per band | — (a band with no record renders nothing) | — (`useSiteContent` reports a bad shape as a failed read, and the band hides) | — |
| `/policies/:slug` | `Skeleton variant="text" lines={10}` | **inline** — "This policy has not been published yet", one sentence in the prose column (a card would out-shout the document) | — | `NotFound` for an unknown slug |
| 404 | — | **`EmptyState`** eyebrow "404", `titleAs="h1"` | — | — |
| `RouteFallback` | `Skeleton` page shape, `role="status"` | — | — | — |

**No page shows a spinner as its main loading state.** `grep -rn "loading-spinner" src/pages` → **0**; the four
spinners left in the app (`AuthModal`, `ReviewModal`, `OrderHistory` reorder + cancel) are all inside a button that is
working, which the prompt allows, and each keeps its own keyframe beside the control it belongs to.

### Verification

```
CI=true npm run build            exit 0, no warnings
npm test -- --watchAll=false     27 suites passed / 1 skipped · 313 passed / 50 skipped
test ! -d src/pages/_ComingSoon  stub removed
grep -rn "ComingSoon" src                          0
grep -rn "const ProductCard" src/pages/SpecialOffers 0
grep -rn "loading-spinner" src/pages               0
grep -rn "loading-spinner\|@keyframes spin" src    0 (the global class went with it)
```

### Browser QA (Chromium 1194, mock mode, scratchpad db via `JSON_SERVER_DB`)

At **390** and **1280**, with a second pass at 1280 under `prefers-reduced-motion: reduce`:

- **Order confirmation** — COD (`ORD-20260904-0002`, chip "Payment pending — pay on delivery", warning tone) and a
  **store-credit-covered** order (`paymentMethod: "store_credit"`, `storeCreditUsed === total`; the ledger prints
  Store credit −₹570.00 and **Amount paid ₹0.00**, chip "Payment successful"). The seal, the eyebrow, the Fraunces
  thank-you addressed by first name, the glass record card at `1fr 1fr` and stacked, and the copy button all render;
  `h1` is "Thank you, Sample".
- **Confetti** — fires once with `aria-hidden="true"` and `role="presentation"` set on its canvas; under
  `prefers-reduced-motion: reduce` **no canvas is created at all** and the seal's `sealIn`/`sealHalo` are off.
- **`/special-offers`** — the committed seed (`enabled: false`) shows the `EmptyState` "No offers right now" → Browse
  the collection, as its `h1`. With `enabled: true` and `SAMPLE10` featured: the voucher renders (10% off, the three
  real conditions, `SAMPLE10` on the dashed chip in monospace gold, Copy) and the deals sections are **honestly empty**
  — no product in the seed carries a `comparePrice`, so "Nothing is reduced today" shows instead of padding. With three
  products given a `comparePrice` in the scratchpad db, the Deal-of-the-Day features and the shared-card wall both
  render, and the category tabs derive from the two categories actually present.
- **Failed reads** — with JSON Server stopped, `/shop`, `/rituals`, `/search` and `/special-offers` each show
  `ErrorState` with "Try again", not an empty list.
- **The rest** — 404, no-results search (with the popular chips inside the card), empty cart and checkout, signed-out
  and no-match orders, and Profile's Payment methods / Store credit / Notifications compact states.
- No horizontal scroll and no `{{` on any page at either width.

**`git status db.json` clean** — every fixture change was made in a scratchpad copy through the `JSON_SERVER_DB`
override (`server.js:47-49`).

### Two things the browser found

1. **Every eyebrow rendered beside its glyph, not under it.** `.sf-eyebrow` is an inline-flex pill and the ring was
   inline-flex too, so in a `text-align: center` column the two shared a line box. Both are now block-level, promoted
   with a two-class selector so they outrank the primitive whichever order the sheets land in — and the same bug, with
   the same fix, was in `OrderConfirmation`'s eyebrow under the seal.
2. **The not-found confirmation had no `h1` at all** (`EmptyState`'s title is a `<p>` by default, which is right inside
   a section that already has a heading and wrong when the state IS the page). `titleAs` now promotes it on the five
   surfaces that own their heading level.

A third, caught before the browser: `mdi:leaf-off-outline` — the default glyph as first written — **does not exist**
(MDI has `leaf-off`), and Iconify renders a missing name as an empty ring with no error. All sixteen names in use were
checked against the MDI set.

### Left for Prompt 32

Nothing from the storefront's state layer. The admin is untouched by this prompt and still carries the previous brand's
`placeholder="Limited Time"` on `AdminSpecialOffers`' hero eyebrow field (Open TODOs) — the storefront defaults it feeds
were rewritten here.

---

## Prompt 32 record (2026-09-08)

### The theme (`src/theme/adminTheme.js`, 240 → 299)

`buildAdminTheme()` now builds ONE dark theme on the LAMIKAA palette. The `mode` argument is a commented no-op and both
call sites (`AdminLayout`, `AdminLogin`) pass nothing.

| | before (slate/indigo) | after (DESIGN_SYSTEM §10) |
|---|---|---|
| `background.default` / `paper` | `#0b1220` / `#111927` | `#0B0B0D` / `#141416` |
| `primary` main / light / dark / contrast | `#818cf8` / `#a5b4fc` / `#6366f1` / `#ffffff` | `#F5D76E` / `#FFEFA6` / `#B88924` / `#0B0B0D` |
| `secondary` | `#94a3b8` | `#8B5CF6` (light `#C4B5FD`) |
| `success` / `warning` / `error` / `info` | `#34d399` / `#fbbf24` / `#f87171` / `#60a5fa` | `#7ED9A6` / `#F5C76E` / `#FF8A80` / `#5DE7FF` |
| `divider` | `rgba(148,163,184,.16)` | `rgba(255,255,255,.08)` |
| `text` primary / secondary / disabled | `#f1f5f9` / `#94a3b8` / `#64748b` | `#F7F5F0` / `#B8B5B0` / `rgba(247,245,240,.62)` |
| `shape.borderRadius` | 6 | **8** (chips 6, nothing is a pill) |

Added: `palette.surface = { sunken: "#1C1C20", hover: "#222228" }` (MUI has no name for a sunken input plate — outlined
inputs now sit on `sunken`); `ADMIN_FOCUS_RING` = `0 0 0 3px rgba(245,215,110,.55)`, applied on `MuiButtonBase`
`&.Mui-focusVisible` **and** repeated on `MuiButton` so it still wins on a focused-and-hovered control; `ADMIN_GOLD_GRADIENT`
(the active nav rule and the CTA preview); `ADMIN_BRAND_WASH` (the hero preview's fallback ground). `CHIP_TONES` collapsed
from `{light, dark}` to one map, each foreground stepped up where the palette tone would not clear 4.5:1 on `#0B0B0D`
(violet `#8B5CF6` → `#C4B5FD` for chip text). `MuiAppBar` carries the glass-like paper (88 % + 12px blur + an opaque
`@supports not` fallback) so no screen re-states it. Table heads keep their uppercase tracking, now in `#B8B5B0` on a
3 % white plate.

### The shell (`AdminLayout.js`, 997 → 1054)

- Drawer head: `<Logo width={150}>` in the permanent drawer, `<Logo variant="mark" width={36}>` in the temporary one.
- Drawer ground `background.default` (`#0B0B0D`) with a hairline right edge; the AppBar is the glass-like paper above it.
- Active nav item: `action.selected` (gold at 12 %), gold label, and a 3px `ADMIN_GOLD_GRADIENT` rule down its leading
  edge (`::before`, `insetInlineStart`). Section captions Catalogue / Sales / Storefront / Operations and "Back to Store"
  are untouched, as are the notification poll and the avatar menu.
- "Hero Section" → **"Home & Hero"**; `path` stays `/admin/hero-section` until Prompt 34.
- `document.title` = `` `${screen} · Admin · ${brand.name}` `` derived from the `menuItems` entry matching
  `location.pathname`, written with `setPageTitle` and released once on unmount with `releasePageTitle`.
- The logout confirm's `confirmButtonColor` is `ADMIN_PALETTE.error.main`.

### The login (`AdminLogin.js`)

Centred `Paper` at `alpha(background.paper, .72)` + 20px blur + a 24/64 shadow — the admin's only glass. Wordmark at 210,
"Admin Console", "Sign in to manage LAMIKAA NATURALS" (from `brand.name`), gold contained button, `useAdminBodyClass`,
`Sign in · Admin · LAMIKAA NATURALS` in the tab, and still no demo credentials anywhere on the screen.

### Colour literals — 78 → 0 outside the invoice

| file | what went |
|---|---|
| `AdminDashboard` | 13 → 0. `StatCard` takes `tone` (`primary`/`success`/`secondary`/`info`); the four secondary tiles take `warning`/`error`/`warning`/`secondary`; the "well stocked" glyph is `success.main`. |
| `AdminPayments` | 5 → 0. Summary cards → `success` / `info` / `warning` / `primary` / `error`. |
| `AdminFaqs` | 5 → 0. Stat tiles → `primary` / `success` / `info` / `warning`; `Mekhela Chador` placeholder → "e.g. Does the face wash suit sensitive skin?" (and the same example in the file's docblock). |
| `AdminLeads` | 5 → 0. `getTypeColor` → `getTypeTone` (`primary` / `success`); the two tinted tiles and the "new" row tint use `alpha(palette…, .10/.06)`. |
| `AdminShipping` | 4 → 0. Integration plate → `alpha(primary, .12)`, feature ticks → `success.main`. |
| `AdminHeroSection` | 7 → 0 (+2 `var(--sf-*)` reads). Preview ground, scrim, copy, eyebrow and CTA chip all from `ADMIN_PALETTE`. |
| `AdminProducts` / `AdminCategories` / `AdminCoupons` / `AdminReviews` / `AdminOrders` / `AdminLeads` / `AdminFaqs` / `AdminShipping` / `AdminLayout` | 9 destructive `confirmButtonColor` literals → `ADMIN_PALETTE.error.main`. |
| `AdminSettings` / `AdminUsers` / `AdminOrders` | 5 `#fff` labels on gold → `primary.contrastText`; 2 `grey.400`/`common.white` → `text.secondary`/`text.primary`. |
| `AdminOrders` (invoice) | **kept** — 5 print literals, see Decisions. |

`grep -rn "palette.mode\|isDarkMode" src/pages/Admin src/components/AdminLayout src/theme/adminTheme.js` → 0.

### Copy and data sweep

- `AdminProducts`: SKU placeholder `e.g. LK-BR-XX-000` (matches the seeded `LK-BR-FW-001` shape), variant placeholder
  "e.g. 100 ml / 200 ml", tags "e.g. black rice, face wash, cleanser", "Weight (kg)" → **"Shipping weight (kg)"**
  (dimensions kept — shipping needs them). Table: **Hero** (`#n` chip or "—") and **Media** ("3 img · 2 vid" from
  `media[]`, "—" when empty) columns, and a "Price on launch" chip wherever `priceTBA`. `minWidth` 980 → 1160.
- `AdminReviews`: `MOCK_REVIEWERS` and the chip row deleted; free-text name kept with a helper line; outlined **Sample**
  chip on `isSample` rows; the pending-row tint is `alpha(warning, .12)` (it was a light/dark branch).
- `AdminOrders`: the invoice header is the Cloudinary wordmark at `w_400`, `brand.name`, `brand.legalName`, the store
  address when it resolves, and `GSTIN` only when `brand.legal.gstin` is not a token; the store-name fallback is
  `brand.name`, not "My E-Commerce Store". Verified in a real print window — the head renders exactly those four rows with
  no GSTIN line and no `{{…}}`.
- `AdminHeroSection`: visible title → "Home & Hero". `AdminSettings`: the tab, the pointer card and its button → "Home & Hero".
- `AdminShipping`: carrier placeholder "e.g. Delhivery, Blue Dart, India Post", default carrier and SLA blank.

### `App.css` admin block

`body.admin-area` ground `#0b1220` → **`#0b0b0d`**; scrollbar track `rgba(255,255,255,.04)`, thumb `#2a2a30`, hover
`#3a3a42`. The SweetAlert2 admin skin is the LAMIKAA palette: `#141416` ground, `#f7f5f0` text, an 8px radius, a gold
confirm with `#0b0b0d` ink (pinned as `--swal2-confirm-button-color` so a per-call destructive background still reads),
a white-8 % cancel, the gold focus ring and a gold timer bar, plus Manrope on the popup and its buttons (Swal renders
outside the MUI tree). The storefront block is unchanged.

### Verification

- `CI=true npm run build` → **Compiled successfully, no warnings**.
- `npm test -- --watchAll=false` → **27 suites / 313 tests passed**, 1 suite / 50 tests skipped (the live-API suite).
- Acceptance greps: hex outside `AdminOrders.js` → **0**; `MOCK_REVIEWERS|My E-Commerce Store|16GB|laptop|mekhela|Muga|Bihu|Sualkuchi` → **0**;
  `buildAdminTheme(` → the definition plus two `buildAdminTheme()` call sites.
- Browser walk (Chromium 1194, mock mode, `npm run dev`): 15 screens × 360 / 768 / 1280 = **45 loads, 0 page-level
  horizontal overflow** (every wide table scrolls inside its own `TableContainer`) and **0 console/page errors**. All 15
  tab titles read `{screen} · Admin · LAMIKAA NATURALS`; the login reads `Sign in · Admin · LAMIKAA NATURALS`.
- Regression walk, driven through the real UI and asserted against JSON Server — **24/24, 0 console errors**:
  product create → edit → delete · category create → delete · coupon create → delete · shipping method create → delete
  (and the carrier field confirmed blank on open) · FAQ create → delete · review create → delete (create dialog holds
  **0** name chips; 2 seeded rows show the Sample chip) · user deactivate → activate · lead status + notes update ·
  settings General save · deals config save · order fulfil → deliver · order refund initiate → complete
  (₹100 partial; payment → `partially_refunded`) · return create → approve → received → **refunded** · payment refund
  (₹100 → ₹150) · order cancel (on a scratch order POSTed for the purpose and deleted after).
- `db.json` was restored from the pre-walk copy afterwards: `git status --short db.json` is clean.

### Left for Prompt 33

The product FORM is untouched — this prompt changed the Products TABLE, the three placeholders and the two labels only.
`emptyProduct`, the validation, the image textarea and the `editable` payload are all still Prompt 33's to replace, and
the payload still omits `media` / `heroOrder` / `priceTBA` (they survive an edit through the `{...editingProduct, ...editable}`
merge). The admin theme, `ADMIN_PALETTE` and the chip tones are stable — Prompt 33's media manager should read
`theme.palette.*` and add no colour of its own.

## Prompt 33 record (2026-09-08)

### What the form could not do before

`AdminProducts.js` edited **20** of the **50** fields `PRODUCTS.md` §6 defines. The other thirty — the hero copy, the
ritual step, the promise, the benefits, the key ingredients, the directions, the INCI list, the pack claims, the
fragrance note, the caution, the size, the badges, the FAQs and the whole of `media[]` — were seeded once by Prompt 06
and then unreachable. Two consequences, both now closed: nobody could add a ninth product (it would have been born
without half a record), and images were a textarea of URLs with no alt text, no primary picker, no video, no preview and
no validation.

### `validateMedia()` (`src/utils/product.js`, 308 → 384)

The gate between the manager and the API. Pure, order-independent, and the SAME function runs live in the manager and
blocking in `handleSave`, so there is one rule set and one answer.

| Rule | Reported as |
|---|---|
| every row has a fetchable `http(s)` URL | `errors[rowIndex]` — "Enter an image URL" / "The URL has to start with http:// or https://" |
| a video's poster, when it has one, is a URL too | `errors[rowIndex]` — "The poster URL has to start with…" |
| no URL appears twice (case-insensitive) | `errors[rowIndex]` — "Same URL as row 1 — every link must be different" |
| at least one image | `message` — "Add at least one image link — a product cannot go out without a picture." |
| exactly one image is `primary` | `message` — "Choose the primary image…" / "Only one image can be the primary…" |

The return is `{ ok, errors, message }`: a superset of the documented `{ ok, errors }`, because rules 4–5 belong to the
LIST and inventing a row-0 error for them would point at the wrong field. 8 new cases in `product.test.js` (21 total in
that file), including one that pins `validateMedia` and `syncProductMedia` against each other: what the first passes,
the second saves unchanged.

### `components/MediaManager.js` (new, 675)

Two ordered lists, one array. Images and videos are separate decisions — which picture leads a card, which film opens
the story — but they persist as one `media[]`, images first, then videos, which is exactly the shape all eight seeded
products already have.

- **Image row** — 24px drag handle · 64px live thumbnail (`cld(url,{w:128})` for Cloudinary, the raw URL otherwise;
  `onError` → "Invalid image URL") · URL · alt (placeholder defaults to `{productName} — image N`) · **Primary** `Radio`
  (exactly one, `name="media-primary"`) · a "Placeholder" chip when the row carries `placeholder` · an
  "Advanced: stage crop" disclosure with X/Y/W/H, rendered only for Cloudinary URLs · up / down / remove.
- **Video row** — handle · 64px `<video preload="metadata" muted playsInline>` with the poster and a play badge, which
  IS the reachability check (`onLoadedMetadata` ✓ / `onError` → "Video could not be loaded") · URL · title (defaults to
  `Video N`) · poster URL, "the primary image is used when this is empty" · up / down / remove.
- **Reorder three ways, one operation**: native HTML5 drag by the handle (drop target outlined in `primary.main`),
  up/down buttons, and the same buttons for a keyboard — after a move the focus is put back on the button that moved the
  row, or on its twin when that one has just become disabled at an end.
- **Remove asks only for the primary** ("It leads the gallery, the product cards and the cart. The next image takes its
  place."), and the first survivor inherits the flag; the first image a product ever gets is primary automatically.
- Summary line `4 images · 3 videos · primary: #2`, and the list-level message in 12px `error.main` beneath it.

### `components/ListEditor.js` (new, 165) and `components/KeyValueListEditor.js` (new, 175)

Six string lists (`benefits`, `howToUse`, `packClaims`, `suitableFor`, `badges`, plus `concerns` as chips) and two
two-field lists (`keyIngredients` name/benefit, `faqs` q/a) are the same two controls, so they are two components.
`keyField`/`valueField` name the keys WRITTEN INTO THE RECORD and have no defaults; edits go through
`{ ...row, [field]: text }`, so a seeded `{name, benefit}` round-trips as `{name, benefit}`. Blank rows are never an
error while typing — `cleanList`/`cleanPairs` drop them at save. `badges` carries a "Reset to brand defaults" action
(`brand.trustBadges`, BRAND.md §3.9 rule 4).

### `components/ProductFormSections.js` (new, 886)

Ten MUI `Accordion`s — Basic · Story · Pricing · Inventory & shipping · Details · FAQs · Media · Variants ·
Visibility & flags · SEO — first open, counts in the headers (`Media 7`, `Details 21`, `FAQs 2`, `Variants 0`), and a
section holding a validation error opens itself (`ERROR_SECTIONS`). Notable behaviour:

- **Categories**: the primary `Select` is limited to `kind === "products"` (a category seeded before `kind` existed
  counts as a product shelf) and adds itself to the multi-select; removing it from the multi-select puts it back.
- **Concerns**: `Autocomplete multiple` over `admin.getConcerns()`, stored as slugs. A slug the vocabulary no longer
  lists still shows as a chip rather than vanishing on the next save.
- **Hero position**: 1–99, helper "Blank = not in the home hero".
- **Price to be announced**: a `Switch` that disables the price field and stores `price: null, priceTBA: true`; turning
  it off restores a zero rather than leaving a null in a numeric field.
- Tags stay comma-separated, at the foot of Basic.

### `AdminProducts.js` (603 → 683)

`emptyProduct` carries all 50 keys. `openEdit` maps through `normalizeProduct` FIRST, so an images-only record
hand-edited into db.json arrives in the manager instead of being dropped by the next save. `handleSave` adds four rules
to the existing three: `priceTBA || price > 0 || variants.length`, `validateMedia().ok`, `categoryIds ⊇ categoryId`, and
hero-position uniqueness across the current list ("Hero position 1 is already used by Black Rice Face Wash"). Video
posters default to the primary image at save, where the primary is finally known. The payload deliberately omits
`images`: it is derived by `syncProductMedia(...)` here and again inside the api layer, and a second opinion is how the
two get out of step. Table: **Hero / Price on launch / Drafts** filter chips (AND, beside the existing search and
category select) and a **New** flag chip; the dialog is `fullScreen` below `sm`.

### Verification (Chromium 1194, mock mode, json-server against a scratch copy of db.json)

| Check | Result |
|---|---|
| Round trip: 8 seeded products opened → saved unchanged | **only `updatedAt` and the derived `image` differ** (see Decisions); every other field byte-identical, no other collection touched |
| `p.media.length`, `p.images[0] === p.media.find(m=>m.primary).url` | `5 true`, and true for all eight |
| Media edit: add image → reorder → re-primary → add video | `media[]` = 4 images + 3 videos, `images[]` primary-first, new video's poster = the primary image, `placeholder` flags kept |
| Storefront after that edit | PDP gallery 7 thumbnails in authored order (stage opens on `media[0]` by design; thumb 2 is the new image, thumb 7 mounts the new `<video>`), and the new primary on /shop, /category/face-care, /search, /wishlist, the home hero and the cart thumbnail |
| Blank URL / duplicate URL / zero images / two primaries | save blocked, row errors under the right fields, list message in the toast |
| Hero clash, no price without a variant or TBA | blocked with the specified messages; the TBA switch clears and disables the field and unblocks the save; `price: null, priceTBA: true` round-trips |
| Drag: image 3 → position 1; a video dragged at the image list | reordered by insertion, gold drop outline; the video is refused (`defaultPrevented === false`) |
| Create a 9th product from scratch | full 50-field record: brand badges, `media` with a primary, derived `images`/`image`, `categoryIds` holding the primary, `priceSource: null` |
| 360 / 768 / 1280 | 0 page overflow, 0 dialog side-scroll, dialog full-screen at 360, 10/10 sections reachable, 200 focusable controls, **0 console errors** at every size |
| `CI=true npm run build` | exit 0, **no warnings** |
| `npm test -- --watchAll=false` | exit 0 — 27 suites / **321** tests passed, 1 suite / 50 skipped |
| `grep -n "Image URLs (one per line)" src/pages/Admin/AdminProducts.js` | **0** |
| `grep -rn "#[0-9a-fA-F]\{6\}" src/pages/Admin/AdminProducts.js src/pages/Admin/components/` | **0** — the manager reads `theme.palette.*` only |

The repository's own `db.json` was never written to: json-server ran with `JSON_SERVER_DB` pointed at a scratch copy, and
`git status db.json` is clean.

### For Prompt 34

`ListEditor`, `KeyValueListEditor` and the `Section` accordion pattern are the editors Prompt 34 was scheduled to reuse
for categories, rituals, concerns, FAQ groups, site content and announcements. `MediaManager` takes
`{ value, onChange, productName, errors }` and knows nothing about products — a ritual or a category hero image can be
edited with it as it stands. `validateMedia` is exported from `utils/product` and from its default object.
