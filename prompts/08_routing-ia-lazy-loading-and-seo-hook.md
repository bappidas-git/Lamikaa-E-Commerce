# Prompt 08 — Routing, IA, lazy loading and SEO hook

- **Phase:** 0 — Foundations
- **Depends on:** 07
- **Unlocks:** 09–13 (shell), 14 (home), 23 (shop)
- **Scope:** M
- **Expected files to change/create:** `src/App.js`, `src/utils/constants.js` (`ROUTES`), `src/utils/helpers.js` (`productPath`), `src/utils/categories.js` (`categoryPath`), create `src/hooks/useSeo.js`, `src/pages/NotFound/NotFound.js` (+ `.module.css`), `src/pages/_ComingSoon/ComingSoon.js`, `src/components/routing/LegacyRedirects.js`, `src/components/routing/RouteFallback.js`, `src/components/ScrollToTop/ScrollToTop.js`; link sweeps in `src/components/Header/Header.js`, `SidebarMenu/SidebarMenu.js`, `BottomNav/BottomNav.js`, `Footer/Footer.js`, `CartDrawer/CartDrawer.js`, `SearchModal/SearchModal.js`, `CategoriesDrawer/CategoriesDrawer.js`, `AuthModal/AuthModal.js`, `HeroSection/HeroSection.js`, `src/pages/Home/Home.js`, `Wishlist/Wishlist.js`, `OrderHistory/OrderHistory.js`, `Profile/Profile.js`, `HelpCenter/HelpCenter.js`, `RefundPolicy/RefundPolicy.js`, `PrivacyPolicy/PrivacyPolicy.js`, `TermsOfService/TermsOfService.js`, `CookiePolicy/CookiePolicy.js`, `Checkout/Checkout.js`, `OrderConfirmation/OrderConfirmation.js`, `Products/Products.js`, `ProductDetails/ProductDetails.js`, `Support/Support.js`, `AboutUs/AboutUs.js`, `src/components/AdminLayout/AdminLayout.js`, `src/pages/Admin/AdminHeroSection.js` (helper text), `public/robots.txt`.

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–07 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Install the LAMIKAA route map with route-level code splitting, redirects from every old Meghali route, a real 404, a reduced-motion-aware scroll restoration, and a dependency-free `useSeo` hook that owns title, meta, Open Graph, canonical and JSON-LD per page.

## Pre-flight checks

```bash
grep -n "<Route path" src/App.js                                     # the current 16 storefront + 16 admin routes
grep -n "React.lazy\|Suspense" src/App.js | wc -l                    # 0
grep -rn -E "\"/(products|help|support|privacy|terms|cookies|refund)" src --include=*.js | wc -l   # the old-route links to sweep (~60)
grep -n "export const productPath" src/utils/helpers.js
```

## Tasks

1. **Route table (`src/App.js`)** — storefront routes inside `StorefrontShell` (keep the shell: `DealsConfigProvider`, `FaqProvider`, skip link, `Header`, `main#main-content`, `Footer`, `BottomNav`, `AnimatePresence` keyed on `pathname`):

   | Path | Element (file) | Notes |
   |---|---|---|
   | `/` | `pages/Home/Home` | |
   | `/shop` | `pages/Products/Products` for now (Prompt 23 replaces with `pages/Shop/Shop`) | reads `?concern=` later |
   | `/category/:slug` | `pages/Products/Products` for now (Prompt 24 → `pages/Shop/Shop` with `mode="category"`) | `/category/rituals` → `<Navigate to="/rituals" />` |
   | `/product/:slug` | `pages/ProductDetails/ProductDetails` | legacy numeric id keeps redirecting to the slug URL |
   | `/rituals`, `/rituals/:slug` | `pages/_ComingSoon/ComingSoon` (Prompt 24) | |
   | `/about` | `pages/AboutUs/AboutUs` (Prompt 28 replaces with `pages/About/About`) | |
   | `/why-lamikaa` | `ComingSoon` (Prompt 28) | |
   | `/faq` | `pages/HelpCenter/HelpCenter` (Prompt 28 → `pages/Faq/Faq`) | |
   | `/contact` | `pages/Support/Support` (Prompt 28 → `pages/Contact/Contact`) | |
   | `/policies/privacy`, `/policies/terms`, `/policies/shipping-returns`, `/policies/cookies` | existing policy pages (Prompt 28 → `pages/Policies/PolicyPage`) | `shipping-returns` → `RefundPolicy` for now |
   | `/cart` | `ComingSoon` (Prompt 29) | |
   | `/checkout`, `/order-confirmation/:orderNumber`, `/orders`, `/profile`, `/wishlist`, `/special-offers` | unchanged | |
   | `/search` | `ComingSoon` (Prompt 11) | reads `?q=` |
   | `/login`, `/register` | `components/routing/AuthRoute` — opens the existing `AuthModal` via `useAuth().openAuthModal("login"|"signup")` and renders `<Navigate to={state?.from || "/"} replace />` | deep-linkable auth |
   | `/_playground` | Playground (temporary, Prompt 35 deletes) | |
   | `*` | `pages/NotFound/NotFound` | real 404 with `useSeo({ title: "Page not found", noindex: true })` |

   Admin routes unchanged (`/admin`, `/admin/*`). Wrap every page import in `React.lazy(() => import(...))` and every `<Routes>` block in `<Suspense fallback={<RouteFallback />}>` (a glass skeleton page: header spacer + three `Skeleton` blocks; `role="status"`, `aria-label="Loading"`). Keep `Home` eagerly imported (LCP page) — lazy-load everything else including admin pages.
2. **`LegacyRedirects`** — a component mounted before the storefront routes that maps the old URLs: `/products` → `/shop` (preserving `?search=` → `/search?q=`, `?category=<slug>` → `/category/<slug>`, `?highlight=` and `?sort=` dropped); `/products/:slug` → `/product/:slug`; `/help` → `/faq`; `/support` → `/contact`; `/privacy` → `/policies/privacy`; `/terms` → `/policies/terms`; `/refund` → `/policies/shipping-returns`; `/cookies` → `/policies/cookies`; plus the Meghali collection URLs `/sarees`, `/collections/*`, `/products?category=muga-silk|pat-silk|eri-silk` → `/shop`. Implement as `<Route path="/products" element={<Navigate … />}>` entries plus a small `useLegacyQueryRedirect()` for the query-string cases; all redirects use `replace`.
3. **Link builders** — `productPath()` → `/product/${slug || productId || id}`; new `categoryPath(cat)` in `src/utils/categories.js` → `/category/${slug}` (rituals kind → `/rituals`); `conceptPath`? no — `concernPath(slug)` → `/shop?concern=${slug}`; `ROUTES` in `constants.js` updated to the table above (`SHOP`, `CATEGORY`, `PRODUCT`, `RITUALS`, `RITUAL`, `ABOUT`, `WHY`, `FAQ`, `CONTACT`, `POLICY_PRIVACY`, `POLICY_TERMS`, `POLICY_SHIPPING_RETURNS`, `POLICY_COOKIES`, `CART`, `SEARCH`, `LOGIN`, `REGISTER`, …).
4. **Link sweep** — replace every literal old path in the files listed in the header (use the grep from Pre-flight, then `grep -rn "to=\"/products\|navigate(\"/products\|\"/help\"\|\"/support\"\|\"/privacy\"\|\"/terms\"\|\"/cookies\"\|\"/refund\"" src`), including `Header.js` editorial links (`?sort=…` links become `/shop`), `BottomNav` (`/products` → `/shop`, active alias list), `Footer` columns, `SidebarMenu`, `CartDrawer` ("Continue shopping" → `/shop`), `SearchModal` (`/products?search=` → `/search?q=`), `HelpCenter` topic tiles, `OrderHistory` return button → `/contact`, policy cross-links, `AuthModal` legal links, `AdminLayout` "Back to Store" stays `/`, `AdminHeroSection` helper text `e.g. /category/face-care`.
5. **`ScrollToTop`** — scroll to top on `pathname` change unless the location has a `hash` (then scroll the target into view with `scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" })` after the route renders) or `location.state?.preserveScroll`; use `window.scrollTo({ top: 0, behavior: "auto" })` (instant — the page fade covers it).
6. **`useSeo(options)`** (`src/hooks/useSeo.js`) — `{ title, description, canonical, image, type = "website", noindex, jsonLd }`: sets the tab via `setPageTitle(brand.seo.titleTemplate.replace("%s", title))` (falls back to `brand.seo.defaultTitle` when `title` is empty) and `releasePageTitle(storeDocumentTitle(store))` on unmount (read the store from `useStoreSettings()`); upserts `meta[name=description]`, `meta[property=og:title|og:description|og:image|og:url|og:type]`, `meta[name=twitter:title|twitter:description|twitter:image]`, `meta[name=robots]` (`noindex,nofollow` only when `noindex`), `link[rel=canonical]` (`canonical` or `siteUrl + pathname` when `brand.seo.siteUrl` is not a placeholder, else `window.location.origin + pathname`), and a `<script type="application/ld+json" data-seo="page">` element with `jsonLd` (object or array; removed on unmount). Elements are tagged `data-seo` so only this hook mutates them. The PDP's hand-rolled meta code (`ProductDetails.js:466-499`) is replaced by `useSeo` in Prompt 25; for now leave it.
7. **Apply `useSeo`** to the pages that already exist with static titles: Home ("Home" → uses default title), Products/Shop ("Shop"), Wishlist, Orders, Profile, Checkout (`noindex`), OrderConfirmation (`noindex`), HelpCenter ("FAQ"), Support ("Contact"), About, policies, SpecialOffers, NotFound.
8. **`NotFound` page** — glass card centred in a `min-height: 70svh` section: eyebrow "404", Fraunces headline "This page has wandered off", lede, primary `Button` → `/shop` "Shop the Black Rice Range", ghost → `/`; `useSeo({ noindex: true })`.
9. **`ComingSoon` stub** — one component `<ComingSoon prompt="24" title="Rituals" />` rendering a glass card "This page is being built (Prompt 24)"; `noindex`. Prompt 35 verifies that no route references it any more.
10. **`public/robots.txt`** — keep `Allow`; add `Disallow: /admin`, `/checkout`, `/order-confirmation`, `/profile`, `/orders`, `/cart`, `/_playground`; add `Sitemap: https://{{LAMIKAA_DOMAIN}}/sitemap.xml` (Prompt 38 generates the sitemap and resolves/removes the line).
11. **Page transition** — keep `getPageMotion` on the keyed wrapper; make sure `Suspense` sits *inside* the `motion.div` so the fallback also fades.

## Design and content specification

`RouteFallback` and `NotFound` follow `DESIGN_SYSTEM.md` §7 (glass card, gold eyebrow, pill buttons). Breakpoints: NotFound card full-width ≤ 480px with 24px padding, 560px max width above.

## Data and API changes

None. (Routing only.)

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: no `react-helmet` or similar; keep every admin route path unchanged; keep `/special-offers`, `/checkout`, `/orders`, `/profile`, `/wishlist`, `/order-confirmation/:orderNumber` exactly as they are; do not delete `pages/Products` yet (Prompt 23 does).

## Acceptance criteria

- [ ] Every path in the table renders (real page, stub or redirect); unknown paths render `NotFound` (not Home).
- [ ] Old URLs redirect: `/products` → `/shop`, `/products?category=face-care` → `/category/face-care`, `/products?search=serum` → `/search?q=serum`, `/products/black-rice-face-wash` → `/product/black-rice-face-wash`, `/products/1` → `/product/black-rice-face-wash`, `/help` → `/faq`, `/support` → `/contact`, `/privacy|/terms|/refund|/cookies` → `/policies/*`, `/sarees` → `/shop`.
- [ ] `npm run build` output shows separate chunks per page (`build/static/js/*.chunk.js` count ≥ 20).
- [ ] `document.title` follows `"%s · LAMIKAA NATURALS"` on every page; `link[rel=canonical]`, OG and description tags exist and update on navigation; NotFound/Checkout/OrderConfirmation carry `noindex`.
- [ ] `grep -rn -E "\"/(products|help|support|privacy|terms|cookies|refund)(\"|\?)" src --include=*.js` → 0 (outside `LegacyRedirects.js`).
- [ ] Hash links (`/faq#orders`) scroll to the target; reduced motion → instant.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && ls build/static/js | wc -l && npm test -- --watchAll=false
grep -rn -E "\"/(products|help|support|privacy|terms|cookies|refund)(\"|\?)" src --include=*.js | grep -v LegacyRedirects
grep -n "React.lazy" src/App.js | wc -l     # ≥ 30
npm run dev   # walk the table + the redirect list; check document.title and <head> tags in DevTools on each route
```

Manual QA at 390 / 1280: NotFound layout; RouteFallback skeleton visible on slow 3G (DevTools throttling) when navigating to `/orders`; Back button behaviour after redirects (no loops); admin still works at `/admin/*`.

## Handoff

1. `PROGRESS.md`: row 08 → `complete`; Open TODOs: "ComingSoon stubs at /rituals, /rituals/:slug, /why-lamikaa, /cart, /search → owners 24, 28, 29, 11"; Decisions log: canonical strategy while `{{LAMIKAA_DOMAIN}}` is unresolved.
2. `REPO_MAP.md` §9: rewrite as the new route table ("Updated by Prompt 08").
3. Commit: `feat(lamikaa): 08 routing, ia, lazy loading and seo hook`.
