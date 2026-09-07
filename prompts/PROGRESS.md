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

## Open TODOs

Carry-overs that a later prompt (or the developer/owner) must pick up (format: `NN · item · owner · target prompt`).

- `16 · The live Laravel database still holds the PRE-CORRECTION `media[0].crop` rectangles for five products (soap, body wash, face mask, face scrub, face serum). Mock mode reads the fixed values from db.json; live mode will still show a white stripe on the soap plate, white corners on the body wash, white rules on the face mask, a light-grey letterbox on the scrub and a clipped gold band on the serum until it is reseeded from PRODUCTS.md §2. No schema change — five JSON values. · backend/owner · 39`

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
- `04 · --sf-text-xl/-2xl/-3xl became FLUID clamps in this prompt, but three components still carry their own hand-rolled clamps for display type: HeroSection .headline clamp(2.5rem, 5.4vw, 4.5rem), ProductDetails .productName clamp(2rem, 3.2vw, 2.75rem) and the AboutUs hero. They fit at every measured width, but each is a second definition of the scale and should move onto the tokens when its component is rebuilt. · Prompts 14 / 25 / 28 · 14`
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
- `07 · faqsForGroup() and normalizeFaq's `group` have no consumer yet — the FAQ page that renders headings from siteContent.faqPage.groups[] is Prompt 28's, and the admin control that sets a row's group is Prompt 34's. Until then every seeded row keeps the group Prompt 06 gave it and nothing reads it. · Prompts 28 / 34 · 28`
- `07 · The twenty live routes in REPO_MAP §3.4 do not exist on the Laravel side yet, so Mode B is INCOMPLETE until the backend team ships them. Until then `npm run test:live` will fail on the new tests even against a correct staging host — that is the point of writing them now. · Backend team / owner · 39`
- `07 · No .env.local and no staging host exist, so no api.js function has ever executed against a real Laravel API in this programme. Every "both modes" claim from here on rests on the mock run plus the §3 review. The first staging URL the owner provides should be spent on a full `npm run test:live`. · Owner · 39`
- `07 · products.search() is still json-server's `?q=` in mock mode, which matches ANY field of a record (a query can hit an ingredient list or a meta description and rank as highly as a name). Ranking is deliberately left to the caller — **`src/utils/search.js` exists as of Prompt 11**, and BOTH search surfaces (overlay and `/search`) rank client-side from `products.getAll()` rather than calling `products.search()` at all. The function is now unused by the storefront; a server-side `GET /products?search=` is still the answer if the range ever outgrows a linear pass, and its field list is documented at the function. · Prompt 39 / backend team · 39`
- `07 · admin.setHeroOrder clears `heroOrder` on every product not in the list it is given. That is the documented contract (dropping a product out of the carousel is the same gesture as reordering it), but it means a caller that passes a PARTIAL list silently empties the rest of the hero. The Prompt 34 editor must always send the full order. · Prompt 34 · 34`

- `08 · ComingSoon stubs are live at /rituals, /rituals/:slug, /why-lamikaa and /cart. **/search left the list in Prompt 11** (`pages/Search/Search`). Each of the four renders "This page is being built (Prompt NN)" and is noindex; Prompt 35 verifies no route still points at pages/_ComingSoon and deletes the folder (Prompt 31 in the index's plan). · Prompts 24, 28, 29 · 24`
- ~~`08 · /search is a stub, so the search OVERLAY is the only search surface until Prompt 11 …` · **RESOLVED by Prompt 11**~~ — `/search?q=` is a real results page and Enter (or "See all N results") lands on it. The one temporarily reduced storefront capability is restored.
- `08 · pages/AboutUs/AboutUs.js still carries the Meghali silk story end to end (72 matches for silk/saree/weave/Sualkuchi/Mekhela/loom — headline "Three silks, one river, and the families who weave them", the SILKS table, META ["Est. 2010", "Kolkata", …], the placehold.co loom imagery). Prompt 08 touched it for links + useSeo only. Prompt 28 deletes the folder and writes pages/About/About from siteContent. · Prompt 28 · 28`
- `08 · pages/Products/Products.js still carries FABRIC_FAMILIES (Muga/Pat/Eri/Toss Silk) and its "Fabric" facet. It renders NOTHING with the LAMIKAA seed (availableFabrics is empty, so the chip group and the drawer section are both hidden) — it is dead code that Prompt 23 deletes with the page. · Prompt 23 · 23`
- `08 · The temporary `categorySlug` prop on pages/Products/Products (and the CategoryRoute wrapper in App.js) exists only to make /category/:slug real before the Shop page lands. Both go when the element becomes `<Shop mode="category" />`. · Prompt 24 · 24`
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
- `13 · {{GSTIN}} / {{CIN}} · FIRST RENDERED · `brand.legal.*` reaches type for the first time, in the footer colophon (`GSTIN <n>` / `CIN <n>` rows). Both go through `resolveOrNull`, so while they are tokens the rows cost no line at all; verified in the browser by temporarily resolving both (rows appeared, `innerText.includes("{{")` stayed false) and reverting. `PLACEHOLDERS.md`'s "Not rendered anywhere yet" note is updated.`
- `13 · {{LAMIKAA_EMAIL}} / {{LAMIKAA_PHONE}} / {{LAMIKAA_ADDRESS}} / {{SUPPORT_HOURS}} · unchanged, re-verified · The footer's contact block is now a single `<address>` of up to four rows, each rendered only when `resolveOrNull` returns a value. With the seed's tokens the `<address>` is not rendered at all; PATCHing real values into `settings.store` made all three rows appear with working `mailto:` / `tel:` hrefs (then reverted). `{{SUPPORT_HOURS}}` still comes from `constants.js`, not from settings — it has no admin field yet.`
- `13 · {{FREE_SHIPPING_THRESHOLD}} · one consumer fewer · The footer's promise row is deleted and `constants.js`'s `FREE_SHIPPING_THRESHOLD` export is gone with it. The token itself is untouched in `brand.js → announcements[1].text` and is still what `fillStoreCopy` emits when `{freeShipping}` cannot be resolved, so FAQ 6 keeps losing its sentence exactly as before.`

---
- `15 · (none introduced, none resolved) · The five `{{PRICE_*}}` products render the "Price on launch" chip on the rebuilt card with Add to Cart disabled and labelled "Coming soon" — the rule PLACEHOLDERS.md states, now visible in search, wishlist and the PDP rails. `brand.originBadge` is BRAND copy from BRAND.md §3.1, not a token: it needs no owner input.`


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
