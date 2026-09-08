# REPO_MAP — Meghali's Silk → LAMIKAA NATURALS

> Phase A findings 1–8 plus the file-by-file verdict table. Every path, identifier and line number below was read from the repository on 2026-09-06 (branch `claude/lamikaa-naturals-prompts-chreia`, HEAD `828522b`). Build prompts cite this file; when a build prompt changes a contract it must append an "Updated by Prompt NN" note to the relevant section here.

## 1. Project setup

| Item | Value |
|---|---|
| Framework | Create React App — `react-scripts@5.0.1` (webpack 5), React `18.2`, `react-dom` 18.2, `react-router-dom@6.20` |
| `package.json` name | `ecommerce-boilerplate` (no description/author/homepage fields) |
| Node / npm seen in the analysis container | Node v22.22.2, npm 10.9.7 (no `.nvmrc`, no `engines` field). CRA 5 runs on Node ≥ 14; Node 18/20/22 all work. |
| Scripts | `start` (react-scripts start, port 3000) · `build` · `test` (react-scripts test) · `eject` · `server` (`node server.js` → JSON Server on **3001**) · `dev` (`concurrently "npm start" "npm run server"`) · `test:live` (`LIVE_API=1 CI=true NODE_USE_ENV_PROXY=1 react-scripts test --watchAll=false --testPathPattern=api.live --testTimeout=90000`) |
| Dependencies | `@emotion/react` + `@emotion/styled` (MUI peer), `@iconify/react` 4 (icons, 20 files), `@mui/material` 5.14 + `@mui/icons-material` (admin UI, Header controls, ThemeContext), `axios` 1.6, `canvas-confetti` (OrderConfirmation only), `framer-motion` 10 (route transition, drawers, reveals; 25 files), `json-server` 0.17 (mock backend), `sweetalert2` 11 (toasts/confirms, 20 files), `web-vitals` (unused: `reportWebVitals` is commented out), testing-library trio. DevDependency: `concurrently`. |
| Styling approach | **CSS Modules** (`*.module.css`, one per component/page) consuming **CSS custom properties** (`--sf-*`) declared in `src/theme/storefront-tokens.css`; global primitives in `src/theme/storefront-primitives.css` (`.sf-btn`, `.sf-chip`, `.sf-card`, `.sf-skeleton`, `.sf-toast`, `.sf-badge-discount`, `.sf-ribbon-premium`, `.sf-flag*`); `src/index.css` imports both; `src/App.css` holds page ground, skip link, scrollbars, SweetAlert2 skin (storefront + admin blocks). **Zero hard-coded hex in any CSS module** (one, inside a comment, at `src/components/BottomNav/BottomNav.module.css:172`); all 135 hex values live in `storefront-tokens.css`, 17 in `App.css`. MUI is styled through `createTheme` in `src/context/ThemeContext.js` (storefront) and `src/theme/adminTheme.js` (admin). No Sass, no styled-components usage, no Tailwind. |
| Animation | `framer-motion` via the vocabulary in `src/theme/motion.js` (`pageMotion`, `overlay()`, `panel()`, `sheet()`, `reveal()`, `collapse()`, `EASE`, `DURATION`); CSS transitions on `--sf-transition*` tokens; reduced motion handled by zeroing the duration tokens (`storefront-tokens.css:349-358`) and by `useReducedMotion()` in JS. |
| Icons | `@iconify/react` (`mdi:*`) on the storefront + admin; `@mui/icons-material` in BottomNav, SidebarMenu, and (Prompt 09) only the Header's account-menu rows — CategoriesDrawer is deleted and the masthead's own marks are Iconify. |
| Forms / HTTP / SEO | Hand-rolled forms (no form lib); `axios` instance in `src/services/api.js`; **no helmet** — `src/utils/documentTitle.js` owns `document.title`; the PDP writes `meta[name=description]` by hand; no JSON-LD anywhere. |
| ESLint / Prettier | `eslintConfig: { extends: ["react-app", "react-app/jest"] }` in package.json; no `.eslintrc`, no Prettier config. |
| Env files (committed) | `.env`: `REACT_APP_API_URL=http://localhost:3001`, `REACT_APP_USE_MOCK_API=true`, `REACT_APP_NAME=Meghali's Silk`, `REACT_APP_VERSION=1.0.0`, `REACT_APP_ENABLE_ANALYTICS=false`, `GENERATE_SOURCEMAP=true`; commented `REACT_APP_RAZORPAY_KEY_ID`, `REACT_APP_SHIPROCKET_EMAIL`; comment mentions `https://core.meghalisilk.in`. `.env.production`: `REACT_APP_API_URL=https://core.lamikanaturals.com/api/v1`, `REACT_APP_USE_MOCK_API=false`, `REACT_APP_NAME=Meghali's Silk`, `REACT_APP_ENABLE_ANALYTICS=true`, `GENERATE_SOURCEMAP=false`. `.env.example`: template (`My E-Commerce Store`). `process.env.*` read in code: `REACT_APP_API_URL`, `REACT_APP_USE_MOCK_API`, `REACT_APP_NAME` (`src/utils/constants.js:2`), `NODE_ENV`; `REACT_APP_ENABLE_ANALYTICS`/`REACT_APP_VERSION` are **never read**. |
| `public/` | `index.html` (492 lines: preload of the old logo, favicon links, `theme-color #14120F`, full Meghali meta/OG/Twitter set, Google Fonts link for **Cormorant Garamond + Inter**, Material Icons link, inline splash-screen CSS with hard-coded palette literals, pre-mount theme script reading `localStorage.theme` and adding `body.dark/light`, loader-hide script keyed on `body.react-loaded`), `manifest.json` (Meghali's Silk, `theme_color/background_color #FAF6EC`, icons 32/192/512), `robots.txt` (allow all; no sitemap), favicon set: `favicon.ico` (16/32/48), `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180), `android-chrome-192x192.png`, `android-chrome-512x512.png` — all old artwork. |
| Deployment config | None in the repo (no Netlify/Vercel/nginx files, no CI workflows, no Dockerfile). `.gitignore` is CRA default. `.gitattributes` = LF normalisation. |
| Tests | Exactly one test file: `src/services/api.live.test.js` (888 lines, `@jest-environment node`, `describe.skip` unless `LIVE_API=1`; writes to the real Laravel DB; asserts `BASE_URL === "https://core.meghalisilk.in/api/v1"` at line 152 — **out of date with `.env.production`**). No snapshots, no `setupTests.js`, no component tests. `npm test -- --watchAll=false` therefore passes with 1 skipped suite. |
| Docs | No README, no `.md` files at all. Code comments reference three documents that do **not** exist: `STOREFRONT_UX_GUIDELINES.md`, `prompt_testing/09_authentication_and_session.md`, `backend-developer-guideline/postman-api-collection.json`. |
| Other root files | `server.js` (JSON Server wrapper with a safe non-cascading DELETE; `JSON_SERVER_DB` / `JSON_SERVER_PORT` env overrides; serves `./public` statically), `db.json` (96 KB), `package-lock.json`. `node_modules` not installed in the analysis container. |

## 2. Theme token system (`src/theme/*`) and mode switching

**Files:** `storefront-tokens.css` (357 lines), `storefront-primitives.css` (438), `tokens.js` (469 — `TOKENS`, `STOREFRONT_CONFIG`, `TRUST_BADGE_CATALOG`, `resolveTrustBadgeDetail`), `colors.js` (`LIGHT`/`DARK` MUI mirrors), `motion.js`, `adminTheme.js` (`buildAdminTheme(mode)`).

**Token families in `storefront-tokens.css` (`:root`, light values; `body.dark` overrides the colour tokens only):**
- Brand: `--sf-color-primary`, `-primary-dark`, `-primary-light`, `-primary-contrast`, `-primary-soft`, `--sf-color-secondary`, `--sf-color-accent`, `--sf-gradient-primary`, `--sf-gradient-primary-hover`.
- Surfaces/text: `--sf-color-bg`, `-surface`, `-surface-2`, `-surface-hover`, `-text`, `-text-secondary`, `-text-muted`, `-border`, `-border-strong`, `-overlay`.
- Semantic: `--sf-color-success/-bg`, `-warning/-bg`, `-danger/-bg`, `-info/-bg`.
- Commerce: `--sf-color-star`, `-price`, `-compare`, `-discount`, `-discount-bg`, `-badge-bg`.
- Brand system (Meghali names): `--sf-color-brand-green`, `--brand-logo-bg`, `--sf-color-brand-green-deep`, `--sf-color-gold`, `-gold-light`, `-gold-deep`, **`--sf-color-emerald`, `-emerald-hover`, `-emerald-contrast`** (legacy name for the primary CTA — 188 usages), `--sf-gradient-gold`, `--sf-gradient-heritage`, `--sf-gradient-announce-1/2/3`, `--sf-cat-pink/purple/orange/blue/teal/red`.
- Structure: `--sf-radius-sm/md/lg/xl/pill` (2/4/8/12/999px), `--sf-space-1…32` (4px base; 20/24/32 = 80/96/128px), `--sf-shadow-xs/sm/md/lg`, `--sf-color-focus-ring`, `--sf-shadow-focus`, typography `--sf-font-display` ("Cormorant Garamond"), `--sf-font-family` ("Inter"), `--sf-text-xs…5xl` (4xl/5xl are `clamp()`), `--sf-font-light…bold`, `--sf-leading-*`, `--sf-tracking-*`, motion `--sf-ease` (`cubic-bezier(.22,1,.36,1)`), `--sf-duration-fast/-/-slow` (0.2/0.35/0.6s), `--sf-transition*`, layout `--sf-container-max` (1280), `--sf-tap-target` (44), z-index `--sf-z-sticky` 40, `-stickybar` 60, `-overlay` 1000, `-modal` 1100.
- Hero-only inline vars: `--sf-hero-h-min/-vh/-max(-tablet/-mobile)` and `--sf-hero-scrim` set from JS (`heroStageVars`).

**How mode switching works today (to be removed):**
- `src/context/ThemeContext.js` — `ThemeContextProvider` holds `isDarkMode` (default **dark**; light only when `localStorage.theme === "light"`), persists `localStorage.setItem("theme", …)`, writes `document.body.style.backgroundColor`, rewrites `meta[name=theme-color]` (`#14120F` / `#FAF6EC`), toggles `body.dark` / `body.light`, and builds **two MUI themes** (`lightTheme`/`darkTheme`) from `colors.js`. Exports `useTheme()` → `{ isDarkMode, toggleTheme, theme }` and `useThemeContext()` → `{ mode, toggleTheme }`.
- Consumers of `isDarkMode`/`toggleTheme` (21 files): toggles rendered in `Header.js:466-477`, `SidebarMenu.js:609-636`, `Profile.js:1071-1079`, `AdminLayout.js:495-507`; class reads (`${isDarkMode ? styles.dark : ""}`) in CartDrawer, CTASection, BottomNav, Newsletter, AuthModal, OrderHistory, HelpCenter, SpecialOffers, Support, OrderConfirmation, PrivacyPolicy, Checkout, ProductDetails, CookiePolicy, RefundPolicy, TermsOfService; logo swaps by mode in SidebarMenu/AuthModal/AdminLogin/AdminLayout; `AdminLogin.js:83` builds `buildAdminTheme(isDarkMode ? "dark" : "light")`.
- `public/index.html:455-476` pre-mount script mirrors the rule; `src/components/ErrorBoundary/ErrorBoundary.js:6-12` re-implements it (`isDarkTheme()`) with 20 palette literals at lines 50-75.
- `src/App.css` has `body.admin-area.light/.dark` blocks (scrollbars, ground, SweetAlert2 skin).
- **The admin shares the storefront toggle**: `AdminLayout.js:33,155` uses `useThemeContext()` and its header button calls the same `toggleTheme`; there is no admin-owned storage key.

**How tokens reach components:** CSS Modules use `var(--sf-*)` directly (100 %); JS reads `TOKENS` from `tokens.js` for the rare inline value; MUI reads `colors.js` via ThemeContext. Hard-coded colours outside tokens: `ErrorBoundary.js` (20, intentional fallback), `Footer.js:380-401` (payment-network marks), `AuthModal.js:81-89` (social brand marks), `SearchModal.js:55-56` (data-URI), `helpers.js` (`PLACEHOLDER_IMG` fill `#807867`), `WishlistContext.js:14` / `OrderHistory.js:31` / `Profile.js:53` (`DANGER_HEX` for SweetAlert2), `OrderConfirmation.js:46` (confetti colours), `index.js` (crash-screen inline styles), admin JS files (indigo/slate literals — see §7).

**Updated by Prompt 03 — single dark theme; `body.dark` removed; ThemeContext exports `{ theme }` only.** Everything above this line describes the pre-Prompt-03 repository and is kept as the historical record. What is true now:

- `storefront-tokens.css` (318 lines) declares **one** `:root` block with `color-scheme: dark` and the LAMIKAA "Luxury Skincare After Dark" values (`DESIGN_SYSTEM.md` §2/§3). The `body.dark` block is gone. New tokens: `--sf-color-pink/-violet/-cyan`, `--sf-gradient-signature/-brand/-announce`, `--sf-glass-bg/-bg-strong/-border/-blur/-fallback`, `--sf-glow-pink/-violet/-gold`, `--sf-shadow-1/-2`, `--sf-section-y`, `--sf-container-wide`, `--sf-z-header/-toast`, `--sf-concern-pink/-violet/-cyan/-gold/-mint/-rose`. Legacy names kept as aliases until Prompt 35: `--sf-color-emerald*` (= gold CTA), `--sf-gradient-heritage` (= `--sf-gradient-brand`), `--sf-gradient-announce-1/2/3` (all = `--sf-gradient-announce`), `--sf-cat-*` (→ `--sf-concern-*`), `--sf-color-brand-green-deep` (= `#0B0B0D`), `--brand-logo-bg` (= `var(--sf-color-surface)`). `--sf-color-brand-green` is deleted (no consumer). Structure changed: radii 8/14/20/28/999px, `--sf-ease: cubic-bezier(.2,.7,.2,1)`, durations 0.16/0.32/0.6s. A `@media (max-width: 768px)` block halves `--sf-glass-blur` to 12px; the `prefers-reduced-motion` block is unchanged.
- `colors.js` exports `PALETTE` (one dark MUI mirror) plus `export const DARK = PALETTE` for one prompt of compatibility; `LIGHT` is deleted.
- `tokens.js`: `TOKENS.radius = {sm:8, md:14, lg:20, xl:28, pill:999}`, plus `containerWide: 1440` and `sectionY`. `motion.js`: `EASE = [0.2, 0.7, 0.2, 1]`, `DURATION = {fast:.16, base:.32, slow:.6}`.
- `ThemeContext.js` builds **one** `createTheme({ palette: { mode: "dark", …PALETTE }, shape: { borderRadius: 14 }, … })` at module scope. `ThemeContextProvider` wraps `ThemeProvider` only and, on mount, runs `localStorage.removeItem("theme")` once as a migration. It no longer writes `document.body.style.backgroundColor` or the theme-color meta (both static). **Exports:** `ThemeContextProvider` and `useTheme()` → `{ theme }`. `isDarkMode`, `toggleTheme` and `useThemeContext` are gone — `grep -rn "isDarkMode\|toggleTheme\|useThemeContext" src` returns 0.
- No toggle exists anywhere (header, mobile drawer, profile settings, admin header), and no CSS module carries a `.dark` rule — `grep -rn "\.dark\b\|body\.light" src --include=*.css` returns 0.
- `public/index.html` has no pre-mount theme script and no `localStorage` read; `body` is painted `#0b0b0d` statically and `meta[name=theme-color]` is `#0B0B0D`. `ErrorBoundary.js` carries one literal palette (no `isDarkTheme()`).
- `App.css`: one `body.admin-area { background-color: #0b1220 !important }` rule, one set of admin scrollbar rules, one storefront SweetAlert2 block (`body:not(.admin-area) .swal2-popup`) and one admin block (`body.admin-area .swal2-popup`).
- Admin: `AdminLayout.js` and `AdminLogin.js` both call `useMemo(() => buildAdminTheme("dark"), [])`. `buildAdminTheme(mode)` keeps its signature and its light branch (dead code until Prompt 32 recolours the palette); `useAdminBodyClass.js` is unchanged.
- Hard-coded colours now: `ErrorBoundary.js` (12, intentional fallback) and `Footer.js` (payment-network marks) — documented exceptions. **`AuthModal.js`'s five social brand hexes went with the disabled buttons in Prompt 30**; `SearchModal.js:55-56` data-URI (`#141416` / `#B8B5B0`), `helpers.js` `PLACEHOLDER_IMG` fill `#8E8B86`, `DANGER_HEX = "#FF8A80"` ×3, `OrderConfirmation.js` `CONFETTI_COLORS = ["#F5D76E", "#FFEFA6", "#FF4FD8", "#8B5CF6"]`, `index.js` crash-screen inline styles, admin JS files (indigo/slate literals — see §7).

## 3. `src/services/api.js` — dual-mode contract

> **Final contract — rewritten by Prompt 07.** This section is the whole of it: every namespace, every function, its mock path and its live endpoint. §3.4 is the hand-off list for the backend team — the routes Laravel must implement for the live branch to work.

### 3.1 Mode selection, transport and named exports

**Mode selection** (`src/services/baseURL.js`): `IS_MOCK_API = BASE_URL === "http://localhost:3001" || REACT_APP_USE_MOCK_API === "true"`; `BASE_URL` = mock URL when the flag is on, else `REACT_APP_API_URL`, else mock in development. Logged to the console in development. **Mode A = JSON Server over `db.json` on :3001 (via `server.js`). Mode B = live Laravel API (`/api/v1`) on Cloudways — response envelope `{ success, data, meta }` unwrapped by `extractData()`; pagination meta via `extractMeta()`.** There is no in-memory mock: "mock mode" *is* JSON Server. (Adaptation to the brief recorded in `00_INDEX.md`.)

**Axios instance** `api`: `baseURL`, JSON headers, 30 s timeout. Request interceptor attaches `Authorization: Bearer` — admin token from `sessionStorage.adminToken` when the URL contains `/admin/`, else the customer token from `authStorage.get("token")`. Response interceptor: on 401 (not on `/auth/login`) clears the matching session (`admin`+`adminToken` or `user`+`token`).

**Named exports:** `extractData`, `extractMeta`, `isVisibleProduct` (`isActive !== false`), `visibleProducts`, `getErrorMessage`, `resolveRitualSteps` *(new — Prompt 07)*, `api`. Default export `apiService`, whose namespaces are §3.2 and §3.3.

**Every product is normalised on the way out.** `products.*` and `admin.getProducts/getProduct` run each record through `normalizeProduct()` (`src/utils/product.js`) in **both** modes, so every consumer is handed `media[]`, `images[]` (the derived mirror, primary first), `image`, `categoryIds[]`, `concerns[]`, `benefits[]`, `howToUse[]`, `keyIngredients[]`, `faqs[]`, `packClaims[]`, `suitableFor[]`, `badges[]`, `priceTBA`, `heroOrder` and `shortName`, whatever shape the backend stored. The write side is its twin: `admin.createProduct/updateProduct` run `syncProductMedia()` **before** sending, so `images[]`/`image` are rebuilt from the admin's edited `media[]` in both branches (Laravel derives them server-side as well; sending both is harmless).

### 3.2 Storefront namespaces

| Namespace | Functions (signature → returns) | Mock-mode path | Live path |
|---|---|---|---|
| `auth` | `login({email,password,remember})` → safe user (stores token via `authStorage`) · `register(userData)` (mock checks duplicate email, code `EMAIL_TAKEN`) · `logout()` · `getUser()` · `updateUser(updates)` · `changePassword({currentPassword,newPassword,confirmPassword})` | `GET /users?email&password`, `POST /users`, `PATCH /users/:id` | `POST /auth/login`, `/auth/register`, `/auth/logout`, `GET/PUT /auth/user`, `PUT /auth/password` |
| `products` | `getAll(params)` (visible only) · `getById(id)` (null if hidden) · `getBySlug(slug)` · `getFeatured(limit=10)` · `getTrending(limit=10)` · `getByCategory(categoryId)` · `search(query)` · `getFrequentlyBoughtTogether(product, limit=3)` (only `frequentlyBoughtTogetherIds`) — **all normalised** | `GET /products`, `?slug=`, `?featured=true`, `?trending=true`, `?categoryId=`, `?q=` (json-server full text) | `GET /products`, `/products/:id`, `/products/slug/:slug`, `/products/featured`, `/products/trending`, `/products/category/:id`, `/products?search=` |
| `products` *(new — 07)* | `getHeroProducts()` → visible products with a `heroOrder`, ascending. The hero is product-driven; there is no slide collection. | `GET /products` → filter `isActive !== false && heroOrder != null` → sort `heroOrder` | `GET /products/hero` (sorted client-side too, so order cannot depend on the backend) |
| `products` *(new — 07)* | `getByCategorySlug(slug)` → `{ category, products }`. Membership is `categoryIds[].includes(id) \|\| categoryId === id`; visible only; ordered by `heroOrder` then `name`. Unknown slug → `{ category: null, products: [] }`. | `categories.getBySlug(slug)` then `GET /products` | `GET /products/category/slug/:slug` → `{ category, products }` |
| `products` *(new — 07)* | `getByConcern(slug)` → `{ concern, products }`. `product.concerns[]` holds **slugs**, so no join; the concern record is resolved through `concerns.getAll()` for its display name and that lookup is tolerant (a missing collection costs the name, never the products). Same ordering as above. | `GET /products` → filter `concerns.includes(slug)` | `GET /products?concern=:slug` |
| `products` *(changed — 07)* | `getRelated(product, limit=10)` — tier 1 curated `relatedProductIds` (merchant's order), tier 2 **any shared `categoryIds[]`** (falls back to `categoryId`), tier 3 shared `tags`/`brand`. Never the product itself; deduped; then **stable-partitioned known-price first** so a rail never opens on "Price on launch"; then sliced to `limit`. Never throws (`[]`). | one `products.getAll()` | one `products.getAll()` |
| `products` *(changed — 07)* | `getReviews(productId, { includeSample = brand.flags.showSampleReviews } = {})` — approved rows; `isSample` rows dropped unless asked for. Backward compatible: the second argument is optional. | `GET /reviews?productId&status=approved` then filter | `GET /products/:id/reviews?includeSample=0\|1` |
| `categories` | `getAll()` (active, sorted by `sortOrder`) · `getById(id)` · `getBySlug(slug)` | `GET /categories`, `?slug=` | `GET /categories`, `/categories/:id`, `/categories/slug/:slug` |
| `concerns` *(new — 07)* | `getAll()` → sorted by `order` **in both modes** | `GET /concerns` | `GET /concerns` |
| `rituals` *(new — 07)* | `getAll()` → active only, by `sortOrder`, **in both modes** · `getBySlug(slug)` → row or `null` · `resolveSteps(ritual, products)` — **pure**, also exported as `resolveRitualSteps`: returns the steps in `order` with `product` / `alternativeProduct` attached (`null` when the id resolves to nothing) | `GET /rituals`, `GET /rituals?slug=` | `GET /rituals`, `GET /rituals/slug/:slug` |
| `siteContent` *(new — 07)* | `get(key?)` → the section, or the whole record when `key` is omitted. **Never throws:** `{}` for the record, `null` for an unknown section. | `GET /siteContent` (singleton), `[key]` picked client-side | `GET /content`, `GET /content/:key` |
| `announcements` *(new — 07)* | `getAll()` → `isActive !== false` **and** inside the optional `startsAt`/`endsAt` window, sorted by `sortOrder` — filtered **in both modes** so the two backends cannot disagree about what is showing. **Never throws** (`[]`). Replaces the removed `banners` namespace. | `GET /announcements` | `GET /announcements` |
| `hero` | `getConfig()` (never throws, `{}` fallback). Behaviour only — the slides are `products.getHeroProducts()`. | `GET /heroConfig` | `GET /hero/config` |
| `cart` | `getCart(userId)` · `addToCart(item)` · `updateCartItem(id, updates)` · `removeFromCart(id)` · `clearCart()` | `/cart` (+`?userId`) | `/cart` |
| `orders` | `create(orderData)` (mock: seeds `statusHistory`, creates the payment row, bumps coupon `usedCount`, debits wallet) · `getByUserId(userId)` · `getById(id)` · `getByOrderNumber(orderNumber)` · `cancel(id, reason)` (shared `performCancel` cascade) | `/orders` | `/orders`, `/orders/number/:n`, `POST /orders/:id/cancel` |
| `wallet` | `getBalance(userId)` · `getTransactions(userId)` | `/walletTransactions` ledger | `/wallet/balance`, `/wallet/transactions` |
| `reviews` | `getMine(userId)` · `submit({productId,userId,userName,rating,title,body,orderId,orderNumber,isVerifiedPurchase})` (one per user+product, re-enters `pending`) | `/reviews` | `/reviews/mine`, `POST /products/:id/reviews` |
| `returns` | `create(data)` · `getByUserId(userId)` · `getById(id)` | `/returns` | `/returns` |
| `coupons` | `getActive(params)` · `validate(code, orderAmount)` (expiry, `usageLimit`, `perUserLimit` counted from the user's orders, `minOrderAmount`; rejects with code `COUPON_INVALID`) | `/coupons?code&isActive=true` | `POST /coupons/validate` |
| `wishlist` | `get(userId)` · `add(item)` · `remove(id)` | `/wishlist` | `/wishlist` |
| `shipping` | `getMethods()` (active) | `/shipping_methods?isActive=true` | `/shipping/methods` |
| `settings` | `get()` | `/settings` (singleton) | `/settings` |
| `faqs` | `getAll()` (never throws). Rows are shaped by `src/utils/faqs.js`, which gained `group` (default `"general"`) and `faqsForGroup(faqs, group)` in Prompt 07 — `placements[]` is *which surface*, `group` is *which heading on the FAQ page*, keyed to `siteContent.faqPage.groups[].key`. | `/faqs` | `/faqs` |
| `deals` | `getConfig()` (`{enabled:true}` fallback) | `/dealsConfig` | `/deals/config` |
| `leads` | `createContact(leadData)` · `createNewsletter(email)` (+ aliases `createContactLead`, `createNewsletterLead`) | `POST /leads` | `POST /leads/contact`, `/leads/newsletter` |

### 3.3 `admin` namespace

Admin reads return **drafts too** (no visibility gate) but are normalised exactly like the storefront's.

| Area | Functions | Mock-mode path | Live path |
|---|---|---|---|
| Auth / dashboard | `login`, `logout`, `getDashboardStats` | `/admins`, derived counts | `/admin/auth/login`, `/admin/dashboard/stats` |
| Products | `getProducts(params)` · `getProduct(id)` — **normalised** · `createProduct(data)` · `updateProduct(id, data)` (PUT) — both run `syncProductMedia(data)` first · `deleteProduct(id)` | `/products` | `/admin/products` |
| Categories | `getCategories` · `createCategory` · `updateCategory` (PUT) · `deleteCategory` (refuses while children/products reference it, code `CATEGORY_IN_USE`). `data` passes through untouched, which is how the new `displayName`, `heroImage` and `kind` fields reach both backends. | `/categories` | `/admin/categories` |
| Concerns *(new — 07)* | `getConcerns` · `createConcern` · `updateConcern` (PUT) · `deleteConcern` | `/concerns` | `/admin/concerns` |
| Rituals *(new — 07)* | `getRituals` (inactive included) · `createRitual` · `updateRitual` (PUT) · `deleteRitual` · `reorderRituals(orderedIds, current)` | `/rituals`; reorder PATCHes only the rows whose `sortOrder` changes | `/admin/rituals`, `PUT /admin/rituals/reorder` |
| Site content *(new — 07)* | `getSiteContent()` · `updateSiteContent(key, data)` — `data` is **merged** into the stored section, so a partial editor cannot delete the rest of it | `GET /siteContent`, then `PUT /siteContent` with the merged object (json-server singleton, mirrors `updateSettings`) | `GET /admin/content`, `PATCH /admin/content/:key` |
| Announcements *(new — 07)* | `getAnnouncements` (inactive included) · `createAnnouncement` · `updateAnnouncement` (PUT) · `deleteAnnouncement` · `reorderAnnouncements(orderedIds, current)` — replaces the five removed banner functions one-for-one | `/announcements`; reorder PATCHes only moved rows | `/admin/announcements`, `PUT /admin/announcements/reorder` |
| Hero | `getHeroConfig` · `updateHeroConfig` (whole object replaced) · **`setHeroOrder(orderedProductIds)`** *(new — 07)*: each product's `heroOrder` becomes its 1-based position and **every product not in the list has `heroOrder` cleared to `null`**, so dropping a product out of the carousel is the same gesture as reordering it | `GET/PUT /heroConfig`; `setHeroOrder` PATCHes only the products whose value changes | `GET/PUT /admin/hero/config`, `PUT /admin/hero/order` |
| Orders | `getOrders` (joins users → `customerEmail/customerName`), `getOrder`, `updateOrder(id, updates, event)`, `updateOrderStatus`, `cancelOrder(id, options)`, `initiateOrderRefund`, `completeOrderRefund`, `failOrderRefund` | `/orders` + the payment/refund/wallet cascade | `/admin/orders/...` |
| Returns | `getReturns/getReturn/createReturn/updateReturn(id, updates, {event, restock})`, `scheduleReturnPickup`, `markReturnInTransit` | `/returns` | `/admin/returns/...` |
| Payments | `getPayments/getPayment/getRefunds/issueRefund` | `/payments`, `/refunds` | `/admin/payments`, `/admin/refunds` |
| Shipping | `getShippingMethods/create/update/delete`; `shiprocketCreateOrder/shiprocketTrack` (live only) | `/shipping_methods` | `/admin/shipping/methods`, `/admin/shiprocket/...` |
| Coupons | `getCoupons/create/update(PATCH)/delete` | `/coupons` | `/admin/coupons` |
| Reviews | `getReviews/createReview/updateReview/deleteReview` | `/reviews` | `/admin/reviews` |
| Users / leads | `getUsers/getUser/updateUser`, `getLeads/getLead/updateLead/deleteLead` | `/users`, `/leads` | `/admin/users`, `/admin/leads` |
| Settings / deals | `getSettings`, `updateSettings(section, data)` (mock: PUT whole singleton), `getDealsConfig/updateDealsConfig` | `/settings`, `/dealsConfig` | `/admin/settings/:section`, `/admin/deals/config` |
| FAQs | `getFaqs/createFaq/updateFaq/deleteFaq/reorderFaqs(orderedIds, current)` | `/faqs` | `/admin/faqs`, `PUT /admin/faqs/reorder` |

**Conventions:** ids are json-server auto-increment numbers (products, categories, users…) — string ids only for variants (`v1`, `v-<ts>-<rand>`) and local wishlist rows (`local-…`); timestamps are ISO strings written client-side in mock mode; deletes use `deleteWithVerify` (tolerates json-server's delete-then-500); there is **no pagination** in mock mode (lists are fetched whole; pages/filters are client-side); search in mock mode is json-server `?q=` full text across all fields; images and videos are **URL strings only** (`product.media[].url`, the derived `product.images: string[]`, `category.image/heroImage`, `ritual.image`, review `photos[]`) — there is **no upload endpoint in either mode**, and the admin manages media as links. The three `reorder*` functions and `setHeroOrder` share one contract: the argument is the **full** id list, top first, and mock mode PATCHes only the rows whose stored value actually changes. Rejections that are *expected outcomes* rather than faults carry an `err.code` (`ACCOUNT_DISABLED`, `EMAIL_TAKEN`, `COUPON_INVALID`, `CATEGORY_IN_USE`) and are kept out of the console; everything else is logged with a labelled `console.error` and rethrown, except the four reads that must never take a page down — `siteContent.get`, `announcements.getAll`, `faqs.getAll`, `hero.getConfig` (and `deals.getConfig`) — which log and return their empty shape.

### 3.4 Laravel endpoints to implement

Everything below is what the **live branch of `api.js` already calls**. Mock mode is complete and exercised; these are the routes the backend must add for Mode B to match it. Response envelope is the existing `{ success, data, meta }` — the shapes below are the contents of `data`. Admin routes sit behind the admin bearer token; the rest are public.

| # | Method & path | Params | `data` response | Notes |
|---|---|---|---|---|
| 1 | `GET /products/hero` | — | `Product[]` | Visible products with `heroOrder != null`, ascending. Each must carry `heroHeadline`, `heroSubtext`, `heroOrder`, `shortName` and `media[]`. |
| 2 | `GET /products/category/slug/{slug}` | — | `{ category: Category, products: Product[] }` | Membership: `categoryIds[]` contains the id **or** `categoryId` equals it. Visible only. 404 for an unknown slug. |
| 3 | `GET /products` | `concern=<slug>` | `Product[]` | Products whose `concerns[]` contains the slug. Visible only. |
| 4 | `GET /products` | `search=<q>` | `Product[]` | Must search at least `name`, `shortName`, `tags[]`, `concerns[]`, `keyIngredients[].name`, `benefits[]`, `description`. |
| 5 | `GET /products/{id}/reviews` | `includeSample=0\|1` | `Review[]` | Approved only. `includeSample=0` (the storefront default) must drop rows flagged `isSample`. |
| 6 | `GET /concerns` | — | `Concern[]` | `{ id, slug, name, order }`. |
| 7 | `GET /rituals` | — | `Ritual[]` | Active only (the client re-filters and re-sorts regardless). |
| 8 | `GET /rituals/slug/{slug}` | — | `Ritual` | 404 for an unknown slug. `steps[]` = `{ order, productId, alternativeProductId?, note, frequency }`. |
| 9 | `GET /content` | — | `SiteContent` | The whole keyed record (`about`, `whyLamikaa`, `impact`, `home`, `contact`, `policies`, `faqPage`). |
| 10 | `GET /content/{key}` | — | `object` | One section. |
| 11 | `GET /announcements` | — | `Announcement[]` | `{ id, text, link, isActive, sortOrder, startsAt, endsAt }`. Serve the live, in-window rows; the client applies the same gate. |
| 12 | `GET /hero/config` | — | `HeroConfig` | `{ enabled, source: "products", autoplay, intervalMs, transition, pauseOnHover, showControls, showCounter, showProgress, showArrows, updatedAt }`. |
| 13 | `GET/POST /admin/concerns`, `PUT/DELETE /admin/concerns/{id}` | — | `Concern` / `Concern[]` | Full CRUD. `slug` is the key products point at — renaming a concern must not change it. |
| 14 | `GET/POST /admin/rituals`, `PUT/DELETE /admin/rituals/{id}` | — | `Ritual` / `Ritual[]` | `GET` returns inactive rituals too. |
| 15 | `PUT /admin/rituals/reorder` | body `{ order: id[] }` | `true` | Full list, first first; `sortOrder` = index. |
| 16 | `GET /admin/content` | — | `SiteContent` | The whole record, for the content editor. |
| 17 | `PATCH /admin/content/{key}` | body = the section | `object` | **Merge**, do not replace: the editor may hold only part of a section. |
| 18 | `GET/POST /admin/announcements`, `PUT/DELETE /admin/announcements/{id}` | — | `Announcement` / `Announcement[]` | `GET` returns hidden rows too. |
| 19 | `PUT /admin/announcements/reorder` | body `{ order: id[] }` | `true` | As #15. |
| 20 | `PUT /admin/hero/order` | body `{ order: productId[] }` | `true` | Set `heroOrder` = index + 1 for the listed products and **`null` for every product not listed**. |

**Product payload (both directions).** A product carries its gallery in `media[]`:

```
media: [{ type: "image"|"video", url, alt?, primary?: true, crop?: {x,y,w,h}, poster?, title?, placeholder?: true }]
```

Exactly one **image** row is `primary`; videos never carry the flag; the authored order of `media[]` is preserved (the gallery is authored, not sorted). `images: string[]` and `image: string` are the **derived mirrors** — the image URLs with the primary first — and must be stored and returned alongside `media[]`, because cart lines, wishlist snapshots and order items keep a copy of `images[0]` that cannot be re-derived later. The client sends all three on write (`syncProductMedia`) and rebuilds them on read (`normalizeProduct`), so a server that derives them itself will simply agree.

The other new product fields the live API must round-trip: `shortName`, `categoryIds[]`, `concerns[]` (slugs), `ritualStep{order,label,frequency}`, `heroHeadline`, `heroSubtext`, `heroOrder` (int|null), `promise`, `benefits[]`, `keyIngredients[{name,benefit}]`, `howToUse[]`, `ingredientsList`, `packClaims[]`, `fragranceNote`, `caution`, `suitableFor[]`, `size`, `price` (**nullable**), `priceTBA`, `priceSource`, `currency`, `badges[]`, `faqs[{q,a}]`, `isNew`. A FAQ row additionally carries `group` (a `siteContent.faqPage.groups[].key`), and a category carries `displayName`, `heroImage` and `kind` (`"products"|"rituals"`).

**Removed:** the `banners` namespace and `admin.getBanners/createBanner/updateBanner/deleteBanner/reorderBanners`, together with `GET /banners` and `/admin/banners*`. The collection became `announcements`; the hero's slides became the products. No reference to it remains in `src/`.

## 4. `db.json` schema (as seeded — Prompt 06)

Rewritten for LAMIKAA NATURALS. **23 collections in this order**; `banners` is gone (renamed `announcements`, and its hero role is taken over by the products themselves), `concerns`, `rituals` and `siteContent` are new, every other collection name the api layer reads is unchanged (`shipping_methods` keeps its underscore). Ids are integers; timestamps are ISO `2026-09-06T00:00:00.000Z` unless a sample order needs a sequence.

| Collection | Rows | Fields (type) | Notes / LAMIKAA values |
|---|---|---|---|
| `products` | 8 | **kept:** `id, slug, name, sku, brand ("LAMIKAA Naturals"), categoryId (number), shortDescription, description, images[] (derived from media, primary first), price (number\|null), comparePrice, costPrice, stock, lowStockThreshold, weight, dimensions (null), variants[] (empty), tags[], featured, trending, hot, isActive, rating (0), totalReviews (0), metaTitle, metaDescription, relatedProductIds[], frequentlyBoughtTogetherIds[], createdAt, updatedAt`. **new:** `shortName, categoryIds[], concerns[] (slugs), ritualStep{order,label,frequency}, heroHeadline, heroSubtext, heroOrder (1–8), promise, benefits[], keyIngredients[{name,benefit}], howToUse[], ingredientsList, packClaims[], fragranceNote, caution, suitableFor[], size, priceTBA, priceSource, currency ("INR"), badges[] (= brand.trustBadges), media[], faqs[{q,a}], isNew` | The Black Rice range, ids 1–8 in `PRODUCTS.md` §2 order. Covers are the real Cloudinary URLs; gallery images and videos are placeholders. Prices: 390 / 90 / 349 with `priceSource: "packaging-mrp"` (ids 1, 2, 6); the other five are `price: null, priceTBA: true`. `rating`/`totalReviews` are 0 for all eight — no fabricated social proof. SKUs `LK-BR-{FW,GS,BW,FM,MI,SC,SE,MG}-00n`. Product 6 (scrub) carries `fragranceNote: ""` — its pack does not print the sandalwood line. |
| `products[].media[]` | 4–5 per product | `{ type: "image"\|"video", url, alt?, primary?, crop?{x,y,w,h} (image, Cloudinary pixels), poster? (video), title? (video), placeholder?: true }` | Row 0 is the real cover: `primary: true` + the `stageCrop` from `PRODUCTS.md` §2. Rows 1–2 are Picsum stand-ins, row 3 a CC0 video (products 1, 4, 7 carry a second one). Exactly one image is `primary`; `images[0]` always equals `media[0].url`; every video carries a `poster` (the cover) and a `title`. |
| `categories` | 7 | `id, slug, name, displayName, description, image (= heroImage), heroImage, kind ("products"\|"rituals"), parentId (null), isActive, sortOrder, showInMainMenu, menuOrder, createdAt, updatedAt` | face-care · body-care · cleansers · serums · moisturizers · masks · rituals. `kind: "rituals"` marks the one category that routes to `/rituals` rather than a product listing. |
| `concerns` | 11 | `id, slug, name, order` | cleansing · brightening · hydration · refresh · glow · revive · exfoliation · texture · even-tone · comfort · nourishing. "Shop by concern" links to `/shop?concern=<slug>`. |
| `rituals` | 3 | `id, slug, name, tagline, story, image, duration, steps[{order, productId, alternativeProductId?, note, frequency}], isActive, sortOrder, createdAt, updatedAt` | morning-glow (4 steps) · evening-renewal (5) · black-rice-body (2, step 1 offers the bar **or** the wash via `alternativeProductId`). `story` is derived from `BRAND.md` — no new facts. |
| `faqs` | 8 | `id, question, answer, group ("brand"\|"products"\|"orders"\|"account"), placements[] (home/help/product), productIds[], isActive, sortOrder, createdAt, updatedAt` | The eight site FAQs from `constants.js → FAQ_ITEMS`, same ids and order. `group` is new and must be one of `siteContent.faqPage.groups[].key`; rows 1–2 `brand`, 3–5 `products`, 6–8 `orders`. Answers keep the `{freeShipping}` and `{{RETURN_WINDOW_DAYS}}` copy tokens `fillStoreCopy()` resolves. |
| `siteContent` | singleton | `about{heroImage,image2,eyebrow,title,lede,body,ctaLabel,ctaTo}`, `whyLamikaa{heroImage,eyebrow,title,body,pillars[{key,title,text}],difference,vision}`, `impact{eyebrow,title,intro,items[{key,title,image,points[],body}]}`, `home{aboutTeaser{…},whyBlackRice{…},fullPageCta{lines[],primaryLabel,primaryTo,secondaryLabel,secondaryTo,image}}`, `contact{eyebrow,title,lede,hoursNote}`, `policies{privacy{title,updatedAt,body},terms{title,body},shippingReturns{title,body},cookies{title,body}}`, `faqPage{eyebrow,title,groups[{key,label}]}` | Every long `body`/`text`/`intro`/`difference` field is plain text in the markdown-lite grammar of `src/utils/contentBlocks.js` (`## `, `### `, `- `, `1. `, `> `, `---`, `::callout Title` … `::`, `::steps` … `::`, `**bold**`, `[label](/href)`). Copy traces to `BRAND.md` §3 or to packaging; the four policies are generic templates carrying `{{TOKENS}}`. |
| `announcements` | 3 | `id, text, link ("" \| "/shop"), isActive, sortOrder, startsAt (null), endsAt (null), createdAt, updatedAt` | Replaces `banners`. From `brand.announcements`: "Farmer-owned. Assam-grown." then two token-carrying rows (`{{FREE_SHIPPING_THRESHOLD}}`, `{{LAUNCH_OFFER_TEXT}}`) left `isActive: true` — the bar hides an unresolved text rather than printing it. |
| `heroConfig` | singleton | `enabled, source ("products"), autoplay, intervalMs (6500), transition, pauseOnHover, showControls, showCounter, showProgress, showArrows, updatedAt` | Product-driven: the slides are the eight products ordered by `heroOrder`, so the old `overlayOpacity`, `heights{}`, `secondaryCta{}` and `openers{}` keys are dropped. |
| `settings` | singleton | `store{name,tagline,email,phone,address,currency,currencySymbol,timezone,logo,favicon,taxRate,taxIncluded}, shipping{shiprocketEnabled,shiprocketEmail,shiprocketPassword,defaultWeight,defaultDimensions{}}, payment{razorpayEnabled,razorpayKeyId,stripeEnabled,stripePublishableKey,codEnabled,codFee,codMinOrder,codMaxOrder}, notifications{orderConfirmationEmail,shippingUpdateEmail,adminNewOrderEmail,adminEmail,lowStockAlert,lowStockEmail}, seo{metaTitle,metaDescription,googleAnalyticsId,facebookPixelId}, social{facebook,instagram,twitter,youtube,whatsapp}` | Contact, notification and social fields are `{{TOKENS}}` (blanked by `normalizeStoreSettings`/`normalizeSocialUrl` until the owner fills Admin → Settings). `taxRate: 0` with `taxIncluded: true` — packs print "M.R.P (incl. of all taxes)". Gateway credentials blank, COD on with no cap. |
| `dealsConfig` | singleton | `enabled (false), hero{tag,title,subtitle}, timer{enabled,endAt,onExpiry}, featuredCouponIds[], dealOfTheDayIds[], featuredProductIds[], updatedAt` | Offers page stays hidden until the owner enables it. |
| `admins` | 1 | `id, email, password (plain!), firstName, lastName, role, isActive, createdAt` | `admin@store.com / admin123` (super_admin) — **change before launch**. |
| `users` | 1 | `id, email, password (plain!), firstName, lastName, phone, avatar, addresses[{id,label,firstName,lastName,phone,addressLine1,addressLine2,city,state,postalCode,country,isDefault}], isActive, storeCredit, createdAt, updatedAt` | `sample.customer@example.com / password123`, Guwahati address. `storeCredit: 390` — the settled refund on order C. |
| `shipping_methods` | 1 | `id, name, carrier, description, rateType, flatRate, freeAbove (null), estimatedDays (""), isActive, createdAt` | One "Standard Delivery" row with everything unset: `freeAbove: null` is what makes `{freeShipping}` unresolvable, and `estimatedDays: ""` is `{{DISPATCH_SLA}}`. |
| `coupons` | 1 | `id, code, description, type, value, minOrderAmount, maxDiscount, usageLimit, usedCount, perUserLimit, isActive, expiresAt, createdAt, updatedAt` | `SAMPLE10` — 10 % off, description says sample. |
| `orders` | 3 | `id, orderNumber, userId, items[{productId,variantId,name,image,sku,price,quantity,subtotal}], billingAddress, shippingAddress, subtotal, discountAmount, couponCode, shippingAmount, taxAmount, total, amountPayable, storeCreditUsed, paymentStatus, paymentMethod, fulfillmentStatus, shippingStatus, trackingNumber, trackingUrl, shiprocketOrderId, notes, statusHistory[{at,by,action,note}], createdAt, updatedAt` + on the cancelled row `cancelledAt, cancelReason, refundStatus, refundMethod, pendingRefund (null), refundedAmount, refundCompletedAt`, and on the delivered row `deliveredAt` | Only the three priced products are used. **A** `ORD-20260901-0001` ₹570 delivered (Face Wash ×1 + Soap ×2, UPI captured, tracking `LK-TRACK-0001`, 4 timeline events). **B** `ORD-20260904-0002` ₹349 processing (Scrub ×1, COD pending). **C** `ORD-20260903-0003` ₹390 cancelled with a completed store-credit refund. All tax-inclusive: `taxAmount: 0`, `shippingAmount: 0`, `discountAmount: 0`, `amountPayable === total`. |
| `payments` | 3 | `id, orderId, orderNumber, userId, amount, currency, paymentMethod, gateway, transactionId, gatewayOrderId, status, storeCreditApplied, gatewayResponse{}, createdAt, updatedAt` + on the refunded row `refundAmount, refundReason, refunds[{id,amount,reason,at,by}]` | One per order, in the shape `createPaymentForOrder()` writes: A captured upi/razorpay, B pending cod, C refunded card with a single `ref_seed0001` entry. |
| `refunds` | 1 | `id, refundNumber, type, orderId, orderNumber, returnId (null), returnNumber (null), paymentId, amount, method, reason, reference (null), status, couponRestored, initiatedAt, settledAt, by, createdAt, updatedAt` | `REF-20260903-C001`, `type: "order_cancellation"`, `method: "store_credit"`, `status: "completed"` — the ledger row behind order C. |
| `walletTransactions` | 1 | `id, userId, type, amount, reason, orderId, orderNumber, refundId, refundNumber, balanceBefore, balanceAfter, createdAt` | The ₹390 credit from that refund; `balanceAfter` equals `users[0].storeCredit`. |
| `returns` | 0 | — | Empty: nothing has been returned. |
| `reviews` | 2 | `id, productId, userId (null), userName, rating, title, body, status, source ("admin"), isSample (true), isVerifiedPurchase, helpfulCount, photos[], createdAt, updatedAt` | Products 1 and 7, 5 stars, text marked "Sample review — replace before launch". Hidden from the storefront by `brand.flags.showSampleReviews === false`; the null `userId` is exactly the null-FK case `server.js`'s safe DELETE exists for. |
| `wishlist` | 0 | — | Empty. |
| `cart` | 0 | — | Empty. |
| `leads` | 2 | `id, type (contact/newsletter), name, email, phone, orderNumber, category, subject, message, status, notes, createdAt, updatedAt` | One `contact` "Sample enquiry" (`new`), one `newsletter` `sample.subscriber@example.com` (`subscribed`). |

Relationships: `products.categoryId → categories.id`; `products.categoryIds[] → categories.id`; `products.concerns[] → concerns.slug`; `products.{relatedProductIds,frequentlyBoughtTogetherIds}[] → products.id`; `rituals.steps[].{productId,alternativeProductId} → products.id`; `faqs.group → siteContent.faqPage.groups[].key`; `faqs.productIds[] → products.id`; `orders.userId → users.id`; `orders.items[].productId → products.id`; `payments.orderId → orders.id`; `refunds.{orderId,returnId,paymentId}`; `walletTransactions.{userId,orderId,refundId}` (and its ledger sum → `users[].storeCredit`); `reviews.{productId,userId,orderId}`; `wishlist/cart.{userId,productId}`; `dealsConfig.*Ids[] → coupons/products`. `categories.parentId → categories.id` is kept in the schema but every seeded category is top-level.

**Wired by Prompt 07.** Every collection above is now reachable from `api.js` in both modes — see §3 for the final contract. `announcements`, `concerns`, `rituals` and `siteContent` have storefront readers and admin CRUD; the hero reads `products.getHeroProducts()`; the `banners` namespace and its five admin functions are gone. The `db.json` seed itself is unchanged by Prompt 07.

## 5. Storefront components (`src/components/*`) — see the verdict table in §11

Highlights that shape the prompts:
- `Header.js` (709): sticky masthead + measured **priority nav** (category links from `getMainMenuCategories`, editorial links `?sort=newest|popular|discount`, "Today's Deals"), hover/focus **collection panels**, MUI user menu, hosts `AnnouncementBar`, `TrustStrip`, `CartDrawer`, `SidebarMenu`, `AuthModal`, `SearchModal`, `CategoriesDrawer`. Theme toggle at 466-477. Logo constant `LOGO_SRC` (old wordmark).
- `HeroSection.js` (Prompt 07: ~575): the pre-rebuild carousel (gradient/image/video backgrounds, banked-time autoplay, ←/→ keys, `aria-roledescription="carousel"`, reduced-motion aware, "openers" category row). **Its slides now come from `products.getHeroProducts()`** through a temporary `productSlide()` adapter — headline `heroHeadline`, subtitle `heroSubtext`, CTA "Explore the {shortName}" → `productPath(p)`, background `stageSrc(p, { w: 1600, ar: "16:9" })`. Prompt 14 deletes the file.
- `AuthModal.js` (875; **rebuilt on `ui/Modal` by Prompt 30**) and `ReviewModal.js` (248; same): both dialogs dropped their
  hand-rolled overlay, focus trap, Escape handler, body-scroll lock and close button — `ui/Modal` owns all of them, plus the
  route-change close and the scrollbar compensation neither had. `AuthModal` keeps `{ open, onClose, defaultTab }`, the two
  tabs with their roving tabindex and Home/End, the directional pane slide, the password-strength meter (word + four rules),
  the show/hide toggles, the validation with `aria-invalid`/`aria-describedby`, remember-me, the forgot-password note and the
  legal links. **The disabled Google/Facebook buttons and their five brand hexes are deleted** — they were wired to nothing;
  social sign-in is a backend feature. `ReviewModal` keeps `{ open, onClose, product, existing, onSubmit }`, the star
  radiogroup with its words, the two counters and the moderation notice, and puts Cancel/Submit in Modal's footer rail.
- `SearchModal.js` (848): module-level catalogue cache, `scoreProduct()` relevance, category chips, recent searches (localStorage-free? it uses its own storage helpers), trending rail; hard-coded silk terms at 20-34, 633, 688.
- `CartDrawer.js` (659 → 736, **rewritten by Prompt 12**): a 440px glass tray on `ui/Drawer` (its own trap, Escape handler and scroll lock deleted). 64px masthead with a count chip; body = free-shipping meter → 96px lines → "Complete your ritual" → "Have a code?" → the money; 128px pinned foot (Checkout / View cart / "Secure checkout"). The meter's bar is the lowest `freeAbove` across the ACTIVE `shipping_methods`, read live and cached in a ref, and is not rendered at all when no method sets one — `FREE_SHIPPING_THRESHOLD` and the `FLAT_SHIPPING=99` flat rate are both gone, and no delivery charge is previewed (checkout owns it). Coupon apply/remove via `apiService.coupons.validate` and the auto-drop-below-minimum rule are unchanged. Two pure exports, `freeShippingThreshold()` and `crossSellFor()`, are unit-tested in `CartDrawer.test.js`. **Updated by Prompt 29**: the cross-sell (markup and `crossSellFor` both) moved to `components/cart/CrossSell` and is now shared with the `/cart` page — the tray renders `<CrossSell products={catalogue} items={cart} limit={2} onNavigate={close} className={styles.crossSlot}/>` and keeps only the padding and the seam around it. 736 → 600 lines, its sheet 569 → 514; `freeShippingThreshold()` stays here (the meter is a tray feature) and the test file imports each function from its own home.
- `SidebarMenu.js` (682): mobile drawer with recursive category accordion, account links, **theme switch** at 609-636, TrustStrip, legal links.
- `Footer.js` (445): newsletter (`apiService.leads.createNewsletter`), brand+contact, four columns, promises + payment marks, colophon; old white logo at 45.
- `storefront/*` (13 atoms exported from `index.js` — 12 from Prompt 26, which deleted `ProductGallery`): `ProductCard` (props `product, onAddToCart, onToggleWishlist, isWishlisted, showAddToCart`), `ProductGallery` (props `images, alt, discount, zoom, ribbon, inStock` — images only; **deleted by Prompt 26**, replaced by `pdp/MediaGallery`), `AddToCartBar` (mobile sticky), `PriceBlock`, `QuantityStepper`, `VariantSelector` (+ `variantUtils.js`), `TrustBadges` (config-driven from `tokens.js`), `DeliveryReturnsInfo`, `ReviewsSection`, `RelatedProducts`, `FrequentlyBoughtTogether`, `SocialProof`, `StarRating`.
- Unused/duplicate: `FeaturedProducts` (private card copy), `CTASection`, `Newsletter`, `BottomDrawer` — none imported by Home/Products/PDP.

**Updated by Prompt 31.** `components/ui/` gains the two state cards — 15 components, one import.

- `ui/EmptyState.js` (87) + `.module.css` (150): props `{ eyebrow, title, titleAs, text, icon, actions, compact }` over a
  `GlassCard`. A 520px centred column (40px padding; 24px in `compact` and below 481px), a 56px ring drawn as a
  **signature-gradient seam** — a filled circle with its middle masked out, since a border cannot take a gradient, with
  the `.sf-color-border-strong` hairline underneath as the `@supports` fallback — around a 24px hairline Iconify glyph,
  then `.sf-eyebrow`, a Fraunces 24px title and 15px secondary text at 44ch, then pill actions that stack full-width on a
  phone and wrap centred from 481px. **No live region**: an empty list is ordinary content. The title is a `<p>` unless
  `titleAs` promotes it, because most of these sit inside a section that already has its heading. Note that the ring and
  the eyebrow are forced BLOCK-level with a two-class selector — `.sf-eyebrow` is inline-flex, and two inline boxes in a
  centred column share a line.
- `ui/ErrorState.js` (64): composes `EmptyState` — one stylesheet, so a failure can never look like a different
  application — and adds the three things a failure needs and an empty list must never have: `role="alert"`, a
  **"Try again"** first in the action row calling `onRetry`, and honest copy ("We couldn't load this" / "Nothing was
  changed. Check your connection and try again."). Callers append their own actions after the retry; a caller with
  nothing to re-run passes only `actions` and gets no false promise. No `.module.css` of its own, by design.


**Updated by Prompt 09.** The masthead is rebuilt; `CategoriesDrawer/` is
deleted (nothing imports it) and `TrustStrip` no longer renders from the header
(the mobile drawer still does; Prompt 15 gives it a home page section).

- `Header.js` (437): `position: sticky; top: 0; z-index: var(--sf-z-header)`,
  ONE row inside `.sf-container` — 64px, 56px at ≤768px. Three zones: hamburger
  (rendered <1025px, also CSS-hidden ≥1025) + `<Logo>` (wordmark 168 / 140
  ≤768px, `variant="mark"` 40 at ≤340px) · `<nav aria-label="Shop">` (≥1025px
  only) · `<HeaderActions>`. Surface classes are composed in JS:
  `.transparent` while `#hero-sentinel` intersects (IntersectionObserver
  re-attached on every `pathname` change, retried for up to 30 frames so a lazy
  chunk's sentinel is still caught), otherwise `sf-glass`, plus
  `sf-glass--strong` past 24px of scroll. `.noBlur` (its own four overlays) and
  `:global(body[data-drawer-open])` (everything on `ui/Drawer`) both withdraw
  the backdrop filter. Still hosts the unchanged `AnnouncementBar`,
  `CartDrawer`, `SidebarMenu`, `AuthModal` and `SearchModal` mounts with their
  existing props.
  **Nav contract:** `Shop` is a `<button>` carrying `aria-haspopup`,
  `aria-expanded` and `aria-controls="mega-panel"`; then `Rituals` → `/rituals`,
  `Our Story` → `/about`, `Why LAMIKAA` → `/why-lamikaa`, and `Offers` →
  `/special-offers` only while `useDealsConfig().enabled`. `aria-current="page"`
  on the active entry. No measurement, no overflow button, no collection panels.
- `Header/MegaPanel.js` (318) + `.module.css`: the Shop sheet — `role="region"
  aria-label="Shop menu"`, `id="mega-panel"`, `max-height: calc(100vh - 100px)`,
  a `1.1fr 1fr 1.2fr` grid at 40px padding inside `.sf-container`. Rendered
  INSIDE the Shop `<li>` (tab order) but positioned against the `<header>` (full
  width) — nothing between the two may take `position`. Columns: seven
  categories (40px `.sf-plate` thumbnail from `stageSrc(firstHeroProduct,
  {w:96})`, `displayName`, one-line `description`, count chip, `categoryPath()`)
  closing on **All products** → `/shop`; `Chip variant="concern"` per concern →
  `concernPath()`; a `GlassCard glow="duo" interactive` featuring
  `products.getHeroProducts()[0]` (falls back to `rituals[0]`).
  Exports **`loadMegaPanelData()`**, a module-level promise over
  `categories.getAll` + `concerns.getAll` + `products.getHeroProducts` +
  `rituals.getAll` (the `SearchModal.loadSearchData` shape); the header warms it
  on the Shop button's hover and focus. Props: `id`, `onNavigate`.
  Opens on 200ms hover intent (fine pointers only) or click/Enter/Space; closes
  on Escape (focus returns to the trigger), outside pointerdown, focus leaving
  the header, a sibling nav entry being hovered, and any route change.
  NOT rendered below 1025px.
- `Header/HeaderActions.js` (243): search (`mdi:magnify` → `SearchModal`),
  account (the MUI `Menu` moved verbatim — greeting, My Profile, My Orders, My
  Wishlist, Logout / Login, Register — its paper restyled to glass through
  `PaperProps.className`), wishlist → `/wishlist`, cart → `CartDrawer`. All four
  are `ui/Button variant="icon"`. Account and wishlist are CSS-hidden at ≤768px
  (the drawer and BottomNav carry them). The count badge is an 18px gold disc
  with near-black numerals, capped at `99+`, `aria-hidden` — the button's
  `aria-label` ("Cart, 3 items") is the accessible name. Props: `cartCount`,
  `wishlistCount`, `onSearch`, `onCart`.
- `AnnouncementBar.js` (217): `announcements.getAll()` on mount, falling back to
  `brand.announcements` when the API answers empty or throws; every row whose
  `text` is `isPlaceholder()` is dropped; 6s opacity crossfade paused on
  hover/focus and while the tab is hidden, held under reduced motion;
  `role="status" aria-live="polite"`; dismissal in
  **`sessionStorage["lk-announcement-dismissed"]`**. A 36px band at 4% warm
  white with NO backdrop filter (it sits above the blurred header), Manrope 500
  at 13px, a gold dot marker, the message itself carrying `row.link`, and a
  44px dismiss target around a 16px glyph. Renders in normal flow ABOVE the
  sticky header, so it scrolls away.
- Base layer: `src/index.css` now gives every `[id]` `scroll-margin-top: 80px`
  through `:where()`, so the skip link's `#main-content` and every in-page
  anchor clear the sticky header. `App.css`'s `.main-content` has no spacer and
  no `padding-top` — the header is sticky and occupies its own flow.


**Updated by Prompt 10.** The mobile navigation is rebuilt. `SidebarMenu` is the
first feature to sit on the `ui/Drawer` primitive (its hand-rolled trap, Escape
handler, `body.style.overflow` lock and close-on-navigate effect are gone);
`BottomNav` is a glass tab bar; `TrustStrip` is no longer rendered anywhere and
waits for its home page section in Prompt 15.

- `SidebarMenu/SidebarMenu.js` (632 → 521) + `.module.css` (725 → 377, rewritten
  wholesale): **props unchanged** — `{ open, onClose, onOpenAuth }`, mounted by
  `Header` exactly as before. `<Drawer side="left" width="min(100vw, 420px)">`
  supplies `role="dialog" aria-modal`, the focus trap and restore, Escape, the
  reference-counted scroll lock, the `--sf-color-overlay` scrim, close on route
  change and the `body[data-drawer-open]` flag; the panel is
  `sf-glass sf-glass--strong`. Full width ≤480px, 420px above it, never rendered
  ≥1025px (the hamburger is hidden there). The dialog's accessible name is
  **"Menu"** — a `sf-visually-hidden` span inside the `title` slot beside a
  decorative `<Logo width={132} alt="">`, pointed at by `labelledBy`.
  **Body — four `<nav aria-label>`s, in order:** `Catalogue` (a one-item
  `ui/Accordion`, header row "Shop" in Fraunces 22px/52px, expanding the seven
  categories at 48px behind a 32px `.sf-plate` from
  `stageSrc(firstProductForCategory(heroProducts, cat), { w: 64 })` plus
  **All products** → `/shop`; `defaultOpen` when the path is `/shop` or
  `/category/*`) · `Brand` (Rituals · Our Story · Why LAMIKAA · Offers, gated on
  `useDealsConfig().enabled` · FAQ · Contact — Fraunces 22px, 52px rows,
  hairline separators, gold `aria-current="page"`) · `Account` (signed out: `Log
  in` → `onOpenAuth`, `Create account` → `openAuthModal("signup")`; signed in:
  initials avatar + name + email, then My Profile · My Orders · My Wishlist with
  a count · Log out → `logout()` + navigate home) · `Contact` (email/phone rows
  and the `socialLinks` marks, each rendered only when resolved — the whole nav
  is absent while all three are `{{TOKENS}}`).
  **Footer (pinned):** `Button variant="primary" block` **"Shop the Black Rice
  Range"** → `/shop` at 52px, over `brand.legalNote` at 12px
  `--sf-color-text-muted`, clamped to three lines.
  **Data:** `categories.getAll()` + `products.getHeroProducts()` on the FIRST
  open (not on mount) and again on every `window` focus. Every link also calls
  `onClose` so navigating to the route you are already on still closes the
  drawer.
- `ui/Drawer.module.css` gains **seven composition hooks** (five in Prompt 10,
  two more in Prompt 12), each defaulting to the value it replaced, so no
  existing drawer moves:
  `--sf-drawer-header-pad-y` · `--sf-drawer-header-pad-b` ·
  `--sf-drawer-close-margin` · `--sf-drawer-body-pad` ·
  `--sf-drawer-footer-pad-t` · `--sf-drawer-footer-pad-b` ·
  `--sf-drawer-footer-gap`. `SidebarMenu` sets five on `.panel` for a 64px
  masthead, an 8px/20px body and `calc(16px + env(safe-area-inset-bottom))`
  under the CTA; `CartDrawer` sets six for a 64px masthead, a flush body and a
  128px foot that still gives both controls a 44px touch target.
  `Drawer.js` itself is unchanged.
- `BottomNav/BottomNav.js` (174 → 217) + `.module.css` (198 → 212): a
  `sf-glass sf-glass--strong sf-glass--scrim` bar at `--sf-z-sticky`, one
  `--sf-glass-border` hairline on top, a 64px tab row plus
  `env(safe-area-inset-bottom)` inside the element (so `translateY(100%)` still
  clears the viewport). `aria-label="Primary"`, hidden ≥769px. Five tabs, all
  with visible 11px Manrope 600 labels and Iconify glyphs: Home `/`
  (`mdi:home-outline`, `end`) · **Shop** `/shop` (`mdi:shopping-outline`, active
  on `/shop`, `/category/*`, `/product/*`, `/rituals` and `/rituals/*`) · Search
  (`mdi:magnify`, a `<button aria-haspopup="dialog">` opening the unchanged
  `SearchModal` mount) · Wishlist `/wishlist` (`mdi:heart-outline`, gold count
  disc, `aria-hidden`, the count spoken by the tab's `aria-label`) · Account
  `/profile` (`mdi:account-outline`). The active tab is `--sf-color-gold` type
  PLUS a 20px `--sf-gradient-signature` hairline above the icon (rendered on
  every tab, painted on the active one, so nothing reflows). Hide on scroll
  down past 80px / show on scroll up is kept and **suspended while
  `body[data-drawer-open]` or `body[data-scroll-lock]` is set**, and the bar is
  forced back before its own SearchModal opens.
- `src/utils/catalogue.js` (new): `inCategory(product, category)` ·
  `productsForCategory(products, category)` · `firstProductForCategory(products,
  category)`. The `categoryIds[] || categoryId` membership rule, extracted from
  `Header/MegaPanel.js` (which now imports it) so the mega panel and the drawer
  draw the same category row from one implementation.
- `App.css`: `.main-content` keeps `padding-bottom: 80px` at desktop widths and
  takes `calc(80px + env(safe-area-inset-bottom))` at ≤768px — `calc`, not
  `max`, because the bar sits ON the inset rather than instead of it.
- `storefront/AddToCartBar.module.css`: the `@media (max-width: 768px)` block's
  raw `z-index: 1300` is deleted, leaving the base
  `z-index: var(--sf-z-stickybar)`. **The reserved stacking order is now real:**
  BottomNav `--sf-z-sticky` (40) < PDP purchase bar `--sf-z-stickybar` (60) <
  `--sf-z-overlay` (1000) < `--sf-z-modal` (1100). At 1300 the bar painted over
  every drawer and modal on a product page. Prompt 25 rebuilds the bar and
  inherits the order.


**Updated by Prompt 11.** The search overlay is rebuilt on `ui/Modal` and the
ranking it runs is now a shared, tested utility.

- `SearchModal/SearchModal.js` (850 → 642) + `.module.css` (813 → 420): a
  `Modal size="full"` (`showClose={false}`, `labelledBy` a visually-hidden
  `<h2>Search products</h2>`, `initialFocus` the field) holding a fixed head —
  52px glass field with a 2px gold bottom hairline on focus, a flat 44px clear
  mark inside it, a 44px glass close circle beside it, and the count line — over
  one scrolling region, both inside an 880px centred `.inner`. Its hand-rolled
  focus trap, Escape handler, `document.body.style.overflow` lock and
  focus-restore are **deleted**: the primitive owns all four
  (`grep "focusable\|body.style.overflow" SearchModal.js` → 0).
  **Empty:** `brand.search.popular` chips · `Recent` chips from
  **`sessionStorage["lk-recent-searches"]`** (max 6, with a "Clear" text button)
  · seven category chips through `categoryPath()`. One column, two from 1024px
  (terms | destinations).
  **Typed:** a `role="status" aria-live="polite"` count line ("3 results for
  “serum”"), up to **8** rows and a "See all N results" link to `/search?q=`.
  A row is a `Link` (≥64px, 72px from 769px) with a 56px `.sf-plate` thumbnail
  from `stageSrc(p, { w: 112 })`, the name, a one-line `promise`, `Price` and a
  40px `Button variant="icon"` quick add (`mdi:cart-plus`;
  `disabled` + `srLabel="Coming soon"` when `priceTBA`; on add
  `addToCart(buildCartItem(p), 1, { openDrawer: false })` and the overlay stays
  open).
  **Keyboard:** ↑/↓ move a `data-active` highlight while focus stays in the
  field; roving `tabIndex` puts exactly ONE row in the tab order (the highlighted
  one, else the first); ↑/↓ from a focused row move focus, and ↑ off the top
  returns to the field; Enter opens the highlighted row, or submits to
  `/search?q=` and remembers the term; Escape closes (the primitive's).
  **Deleted:** `CURATED_SUGGESTIONS`/`CURATED_TRENDING` (silk terms), the
  category-chip filter with its descendant-slug walk (categories are flat), the
  trending rail and its `products.getTrending()` call, and the data-URI fallback
  image (a plate simply renders empty).
  Exports nothing; props `open`/`onClose` are unchanged, so `Header` and
  `BottomNav` mount it exactly as before.
- `src/utils/search.js` (new) + `search.test.js` (10 tests): `normalize()`
  (NFD, drop combining marks, lower case, non-alphanumerics to spaces),
  `tokenize()`, and `rankProducts(products, query, { categories, concerns })` →
  `[{ product, score, matchedOn }]`, best first. Field weights: `name` 10 (14
  when the name OPENS with the whole query) · `shortName` 10 · `tags` 6 ·
  `concerns` 6 (slugs **and** the concern records' display names) ·
  `keyIngredients[].name` 5 · `benefits` 4 · category `displayName` 4 ·
  `promise` 3 · `description`+`shortDescription` 2; a word answers a token when
  it is or starts with it (plus a singular fallback for a token of 4+ characters
  ending in "s"); +6 per field for a multi-word query found verbatim. Ties break
  known-price-first (`isPriceKnown`) then alphabetically. `[]` for an empty query.
- `ui/Modal.js` + `.module.css`: new **`size="full"`** (100svw × 100svh, no
  radius, `padding-top: env(safe-area-inset-top)`, and its `.body` handed to the
  child — no padding, no scrollport) and a new **`initialFocus`** prop passed
  through to `useFocusTrap`. A Modal now also raises `body[data-drawer-open]`.
- `hooks/useOverlayFlag.js` (new): the reference-counted `body[data-drawer-open]`
  flag, **lifted out of `ui/Drawer`** so `Modal` and `Drawer` share one counter —
  two counters would each delete the attribute on their own way out, and a modal
  closing over an open drawer would un-blur the header while the drawer was still
  up. `Drawer.js` now calls the hook; its `drawerCount`/`markDrawerOpen`/
  `markDrawerClosed` are gone. Exports `__resetOverlayFlag()` for tests.
- `storefront/PriceBlock.js` + `ui/Price.js`: new **`live`** prop (default
  `true`, so the PDP's variant switch still announces). `live={false}` drops the
  `role="status"` from the "Price on launch" chip — in a list the chip is created
  and destroyed with its row rather than changing in place, and eight live
  regions arriving at once talk over the result count. The search overlay's rows
  pass it.

**Updated by Prompt 13.** The footer is rebuilt, `components/Newsletter/` is
deleted (nothing imported it) and the ownership sentence becomes a shared
component.

- `Footer/Footer.js` (445 → 470) + `.module.css` (rewritten): FOUR bands on
  `--sf-color-surface` under one `.sf-hairline--gradient`, `<footer
  aria-labelledby="footer-heading">`, `overflow-x: clip` (it hosts a
  `.sf-glow--violet` lamp at `--sf-glow-opacity: .12`, painted from 1024px
  only).
  **1 Invitation** — `<Logo variant="wordmark" width={220} alt="">` under a
  visually-hidden `h2#footer-heading` (the store name, so an admin rename still
  reaches it), `brand.tagline` in Fraunces `--sf-text-xl` (28px at 1280),
  `brand.signatureLines[3]`; on the right "Stay close to the farm", "New
  products, farm stories and the occasional offer — no noise.", the email field
  and a `Button variant="primary"` "Subscribe".
  **2 Directory** — `brand/LegalNote` in the wide first track, then four
  `<nav aria-labelledby>` with `h3` eyebrows: *Shop by category* (every
  `categories.getAll()` row through `categoryPath()`, so the `kind: "rituals"`
  one goes to `/rituals`, + **All products** → `/shop`), *Rituals* (every
  `rituals.getAll()` row through `ritualPath()` + **Build your ritual** →
  `/rituals`), *Company* (`/about`, `/why-lamikaa`, `/why-lamikaa#impact`,
  `/contact`, and `/special-offers` only while `useDealsConfig().enabled`),
  *Help* (`/faq`, `/policies/shipping-returns`, `/policies/privacy`,
  `/policies/terms`, `/policies/cookies`, `/orders`, `/wishlist`).
  **3 Assurances** — an `<address>` whose four rows (address, email, phone,
  `SUPPORT_HOURS`) each render only when `resolveOrNull` returns a value; the
  `socialLinks` marks as 44px circles in the glass PALETTE (no
  `backdrop-filter`: the ground is opaque and the masthead already spends a
  blurred layer); the four inline payment SVGs, unchanged, held at 60% opacity —
  still the file's only hex literals and still the documented exception.
  **4 Colophon** — `© <year> <brand.legalName minus the parenthetical>. All
  rights reserved.`, `<brand.name> is a brand of <brand.legalShort>.`, then
  `GSTIN`/`CIN` rows from `brand.legal` when resolved, then four policy
  micro-links. Not a landmark.
  **`--sf-footer-grid`** is declared on `.footer` and consumed by bands 1 and 2
  so their tracks align: `minmax(0,1fr)` → `repeat(2, …)` at 481px →
  `1.2fr repeat(4, …)` / 32px at 1024px → `1.6fr repeat(4, …)` / 48px at
  1280px. At ≤480 (`useMediaQuery("(max-width:480px)")`) the four columns become
  ONE `<Accordion multiple headingLevel="h3">` — all closed — inside a single
  `<nav aria-label="Footer directory">`.
  Exports **`loadFooterData()`**, a module-level promise over
  `categories.getAll` + `rituals.getAll` (the `loadMegaPanelData` shape, two
  reads not four). A failed load keeps "All products" and "Build your ritual".
  The newsletter contract is byte-for-byte the old one:
  `isEmailValid` → `apiService.leads.createNewsletter` → success/error with a
  6s revert. **Deleted:** the `TRUST_ITEMS` promises band (the trust strip is
  Prompt 15's, on the home page), the `--sf-footer-*` aliases over
  `--sf-color-brand-green-deep`, and the "Policies last updated" line (all four
  policy pages still print `POLICY_LAST_UPDATED` themselves).
- `brand/LegalNote.js` (new, 50) + `.module.css`: renders `brand.legalNote`
  **verbatim** behind an `aria-hidden` gold leaf, `--sf-text-sm` in
  `--sf-color-text-secondary`. Props `compact` (drops the leaf and the indent),
  `as` (default `p`), `className`. It takes NO children and no text prop — a
  caller that could pass its own string could drop a legal qualifier. Reused by
  Prompts 17, 25 and 28.
- `Newsletter/` — **deleted**, both files. A second, worse copy of the footer's
  own flow with no importer (`grep -rn "components/Newsletter" src` → 0).
- `utils/constants.js`: `FREE_SHIPPING_THRESHOLD` is **removed** (it was `null`
  and unread since Prompt 12). `utils/storeSettings.js` drops the import and the
  `?? positive(FREE_SHIPPING_THRESHOLD)` fallback; `fillStoreCopy` keeps its
  `{freeShipping}` handling, because FAQ 6 still carries the token and still
  loses its whole sentence while no shipping method sets `freeAbove`.

**Updated by Prompt 14.** The hero is rebuilt as a product carousel;
`components/HeroSection/` is deleted (both files).

- `home/HeroCarousel.js` (new) + `home/HeroCarousel.module.css` (new): the home
  page's opening spread. Reads `products.getHeroProducts()` and
  `hero.getConfig()` in ONE `Promise.allSettled`, then falls back
  `getFeatured(8)` → a **brand slide** (wordmark, `brand.tagline`, "Shop the
  Black Rice Range" → `/shop`) — never a fabricated product. Config goes through
  `normalizeHeroConfig`; the component reads only `enabled`, `autoplay`,
  `intervalMs`, `transition`, `pauseOnHover`, `showControls`, `showCounter`,
  `showProgress`, `showArrows`, `showPause`.
  **Contract:** no props, no context beyond `useCart`; renders
  `<div id="hero-sentinel">` (the hero's opening 140px — `Header.js`'s observer
  is unchanged) and the page's single `h1`.
  **Named exports, all pure and unit-tested:** `padIndex(n)`,
  `heroEyebrow(index, total)`, `heroHeadline(p)` (`heroHeadline` → `promise`),
  `heroSubtext(p)` (`heroSubtext` → `shortDescription`), `exploreLabel(p)`,
  `slideLabel(p, i, n)`, `resolveHeroSlides(heroProducts, featured)`.
  **The copy is rendered ONCE and swapped in place** (single `h1`, no off-screen
  CTA in the tab order); only the MEDIA is stacked, one absolutely-positioned
  `role="group" aria-roledescription="slide"` layer per product inside ONE
  `GlowWrap tone="duo" intensity={0.24} breathe`. Slide 1 is `priority`; the
  rest mount in a `requestIdleCallback` pass and load lazily.
  **`.copySizer`** is the CLS mechanism and the thing to preserve: every slide's
  full copy block (eyebrow, headline, `Price`, subtext, both `Button`s, the
  badge chips) stacked in one grid cell at `visibility: hidden` + `aria-hidden`,
  with the live copy laid over it — so the copy column is always the tallest
  slide's height for ANY copy, at any width, and nothing below it moves when a
  slide changes. A fixed em reservation cannot do this: hero copy is edited on
  the products. The em min-heights that remain (headline 3 lines, subtext 3/2,
  price 36px, `.rail` 116/168px) are the PRE-DATA floor only.
  Autoplay banks its remaining time (`remainingRef`) and stops on hover
  (`pauseOnHover`), focus within, hidden tab, the pause button and
  `body[data-drawer-open]` (a `MutationObserver` on the flag
  `hooks/useOverlayFlag` reference-counts). `showPause: false` turns autoplay
  OFF rather than hiding the control (WCAG 2.2.2). Pointer swipe on the stage
  (40px, `touch-action: pan-y`), ←/→ + Home/End anywhere inside the section,
  ≤8px parallax written to `--sf-hero-parallax-x/-y` on
  `(min-width: 1025px) and (pointer: fine)` and never under reduced motion.
- `home/HeroIndex.js` (new): the control rail, and the **only** consumer of
  `HeroCarousel.module.css` besides the carousel (deliberate — the rail is part
  of the hero's composition and shares its grid, rhythm and breakpoints).
  Props: `index`, `total`, `names`, `shortNames`, `intervalMs`, `autoplayOn`,
  `paused`, `userPaused`, `showArrows`, `showCounter`, `showProgress`,
  `showIndex`, `onSelect`, `onPrev`, `onNext`, `onTogglePause`. Prev/next and
  pause are 44px glass circles; the counter is `aria-hidden` (the eyebrow says
  it in words); the progress hairline is keyed on the slide so it restarts, and
  freezes with `animation-play-state` in step with the banked timer. The index
  is plain `<button>`s with `aria-current` and
  `aria-label="Show slide 3: Black Rice Body Wash"` — **not** a tablist, because
  the media it controls is not a tabpanel. With `total < 1` it returns an EMPTY
  `.rail` div, not `null`: the CSS reservation needs an element to sit on.
- `HeroSection/` — **deleted**, both files. Its two stale citations went with it
  (`ui/CloudinaryImage.js:28`, `pages/Home/Home.module.css:65`);
  `grep -rn "HeroSection" src` now returns only `AdminHeroSection`, which
  Prompt 34 replaces.
- `utils/heroConfig.js`: `showPause` (default true) and
  `HERO_INTERVAL_MIN_MS`/`HERO_INTERVAL_MAX_MS` (3000/15000) are new;
  `DEFAULT_HERO_CONFIG.intervalMs` is 6500 and `normalizeHeroConfig` clamps to
  the new pair. Seventeen slide-store exports are marked
  `@deprecated — removed in Prompt 34`. `db.json → heroConfig` and
  `Admin → Hero Section → Section settings` carry `showPause` and the 3–15s
  bound in step.
- `pages/Home/Home.js`: imports `components/home/HeroCarousel` and renders it in
  the existing `.heroSection` wrapper. Nothing else on the page changed.

**Updated by Prompt 15.** The trust strip, the shop-by-category/concern section
and the shared product card. `components/catalogue/` is a NEW folder (the
components that present the SHAPE of the range — Prompts 18, 23 and 24 fill it).

- `TrustStrip/TrustStrip.js` (86) + `.module.css` (161) + `.test.js` (29) —
  **rewritten**. A `.sf-glass` band, 56px tall (48px ≤639px), carrying FOUR
  promises read from the brand config and never typed in the component:
  `brand.trustBadges` ×3 plus `brand.originBadge` ("Rooted in Assam & Northeast
  India", new in `config/brand.js`, condensed from BRAND.md §3.1). Icons are the
  component's own, matched by POSITION — `mdi:sprout-outline`, `mdi:leaf`,
  `mdi:star-four-points-outline`, `mdi:map-marker-outline`, with
  `mdi:check-decagram-outline` as the fallback if the owner adds a fifth
  promise. Gold 20px glyph + Manrope 600 13px label, centred inside
  `--sf-container-max`.
  **Contract:** `items` (override) and `className`; one named export
  `trustPromises()`. Markup is `<div class="sf-glass">` > `<ul
  aria-label="Our promises" tabIndex={0}>` — the name is on the LIST (an
  `aria-label` on a role-less `<div>` is ignored) and the list is focusable
  because below 640px it is an overflow region (WCAG 2.1.1), the same rule
  `Home.js`'s `ScrollRow` follows.
  **Below 640px** it is a horizontal snap scroller (`x proximity`) with edge
  fades painted on the WRAPPER so they stay pinned while the content moves; the
  labels never wrap (`white-space: nowrap`). **At ≤768px it drops its backdrop
  blur entirely** and paints `--sf-glass-fallback` — a blurred surface that also
  scrolls is the one combination that janks on a phone.
- `catalogue/CategoryCard.js` (94) + `.module.css` (114) — **new**. `GlassCard
  as="article" interactive glow="violet" padding="sm"` wrapping ONE `<Link>`
  (a category tile has one destination; two links would be two tab stops and two
  announcements of the same words). Inside: a 1:1 `.sf-plate` with
  `stageSrc(product, { w: 480 })`, the `displayName` in Fraunces 20px, the
  category's own description clamped to ONE line, and a count chip.
  `aria-label="{displayName}, N products"`; the plate image is decorative
  (`alt=""`).
  **Props:** `category` · `product` (may be null — the plate then renders empty
  rather than borrowing a stand-in) · `count` · `countNoun` (default
  `"products"`; the Rituals card passes `"rituals"`) · `className`. The noun is
  singularised for a count of 1 ("1 product").
  **The glow is a HOVER event**, not a resting lamp: `--sf-glow-opacity: .2` on
  the card and the glow NODE's own opacity animated 0 → 1 by `:hover` and
  `:focus-within`.
- `catalogue/index.js` (9) — **new** barrel.
- `home/ShopByCategory.js` (170) + `.module.css` (143) — **new**. `SectionHeading`
  ("Shop by category" / "Find your **step**" with `gradientWord={2}` / "Seven
  ways into the Black Rice range." / `rule`), the seven cards, then a hairline
  and the eleven concern chips (`Chip variant="concern" as={Link}
  to={concernPath(slug)} tone={slug}`).
  **Data: FOUR reads in ONE `Promise.all`** — `categories.getAll`,
  `concerns.getAll`, `products.getHeroProducts` (so "the first product in this
  category" is the one the owner ordered first) and `rituals.getAll`. The fourth
  is not decoration: no product carries `categoryId: 7`, so the Rituals card's
  count would be 0 and "3 rituals" would have had to be a typed number. It also
  supplies that card's plate — the product named by the FIRST STEP of the first
  ritual, resolved against the catalogue. Counts for the other six come from
  `productsForCategory()` in `utils/catalogue.js`, the same membership rule the
  mega panel, the mobile drawer and `api.getByCategorySlug()` apply.
  Seven `Skeleton variant="card"` while loading; **any rejection, or an empty
  category list, and the section renders NOTHING**.
  **Grid:** ≥1280 is EIGHT tracks with every card `span 2` and the 5th card
  starting at track 2 — that is 4 + 3 with the second row centred, which a
  four-track grid cannot express (measured: both rows centre on 640px at a 1280
  viewport). ≥1024 three columns, ≥481 two, ≤480 a 76vw snap scroller that
  breaks the container's padding and puts it back inside the track.
- `storefront/ProductCard.js` (304) + `.module.css` (370) + `.test.js` (112) —
  **rewritten**. **The prop contract is unchanged** (`product`, `onAddToCart`,
  `onToggleWishlist`, `isWishlisted`, `showAddToCart`) and so is the DOM order
  (media → body → action last), so Home, Shop, Search, Wishlist and
  `RelatedProducts`/`FrequentlyBoughtTogether` needed no change at all.
  `GlassCard as="article" interactive glow="pink" padding="sm"` with the grid on
  an INNER element (GlassCard owns `display` on the card node).
  **Composition:** 1:1 `.sf-plate` with the label crop → eyebrow row (ritual step
  `01 · Cleanse` + up to 2 concern chips + whatever `productFlagMarks` the
  merchant has switched on) → Fraunces 20px name → `promise` clamped to 2 lines
  → `product.badges` as `Chip variant="trust"` at 11px → `Price product size="sm"
  live={false}` → the rating row **only when `totalReviews > 0`**. A 44px glass
  heart (`Button variant="icon"`, `aria-pressed`) and the discount badge sit on
  the plate; `Button variant="addToCart" block` is last.
  **Gone:** `isPremium`/`bridal`/`featured` ribbon logic, `.sf-ribbon-premium`,
  `truncateText(…, 48)` and the "No ratings yet" line.
  **Named exports, all pure and unit-tested:** `concernLabel(slug)`
  (`"even-tone"` → `"Even tone"`; matches all eleven seeded concern names, and
  exists because the card is a leaf that must never fetch), `stepLabel(product)`
  and `plateSources(product)` (`stageSrc` at 640 plus a 320/480/640/900w srcSet —
  **only when the primary image is a Cloudinary upload**, because `cld()` returns
  a non-Cloudinary URL unchanged and four identical candidates is a lie).
  **It normalises its own input** (`normalizeProduct`, memoised): four consumers
  hand it a catalogue row and `Wishlist` hands it a flat snapshot with `image`
  and no `media[]`, `badges`, `concerns` or `priceTBA`.
  **The action's two homes** are carried over verbatim from the card it replaces:
  `(hover: hover) and (pointer: fine)` moves it into the media row and reveals it
  on `:hover`/`:focus-within` (it stays in the tab order while hidden);
  `(any-pointer: coarse)`, declared after, puts it back in row 3 for hybrids.
  Labels: "Add to Cart" / **"Coming soon"** when `priceTBA` / **"Out of stock"**
  when `stock === 0`, the last two disabled and the plate dimmed.
- `theme/tokens.js`: `TRUST_BADGE_CATALOG` gains `farmerOwned` / `organic` /
  `resultOriented`, whose **labels are `brand.trustBadges[i]`, not literals**;
  `STOREFRONT_CONFIG.trustBadges` becomes
  `["farmerOwned", "organic", "resultOriented", "securePayment"]`. `easyReturns`
  keeps its `dynamic: "returns"` rule untouched. The module now imports
  `config/brand` (no cycle: brand → cloudinary only).
- `storefront/TrustBadges.js`: three new 24×24 stroke paths (`sprout`, `leaf`,
  `spark`) on the existing grid, and its filter is now `b.icon && b.label` so a
  catalogue entry whose label is read from a shortened `brand.trustBadges` is
  dropped rather than drawn blank.
- `theme/storefront-primitives.css`: `button.sf-chip, a.sf-chip` now reset
  `text-decoration` — a chip is a pill, never an underlined phrase, and
  `MegaPanel.module.css` had already had to work around it locally.
- `pages/Home/Home.js` / `.module.css`: `<TrustStrip/>` (inside `.trustEdge`,
  `margin-top: -28px` at ≥769px, 0 below) then `<ShopByCategory/>`, both directly
  under the hero. The page's **closing "PROMISES" section is deleted** — it
  printed the same `brand.trustBadges` under the same
  `aria-label="Our promises"`, so keeping it would have stated the promises twice
  and given the page two identically named regions. Sections 1–6 are untouched;
  Prompt 22 replaces them.

**Updated by Prompt 16.** The home product showcase, and the chapter component
the shop page (Prompt 23) will reuse.

- `catalogue/ProductChapter.js` (292) + `.module.css` (298) + `.test.js` (75) —
  **new**. ONE product as a full editorial spread, shared by the home showcase
  and — through `variant` — by the shop listing.
  **Contract:** `product` (required) · `index` (0-based; the chapter numeral and
  the glow tone) · `total` (for the "Chapter 3 of 8" a screen reader hears) ·
  `variant` `"home" | "shop"` · `flip` (swap the columns) · `id` · `className`.
  It renders `<section id={id} data-chapter={index} aria-labelledby=…
  class="sf-section">` — **`data-chapter` is the hook Prompt 23's index rail
  reads, and it is written now**; `variant="shop"` already drops the 80svh floor
  and is where the rail's remaining hooks go.
  **Composition (text column, in order):** a 36px `Chip variant="step"` numeral
  (28px ≤414px, `aria-hidden` — decoration) beside the `.sf-eyebrow` ritual line
  → the `h2` name (Fraunces, `--sf-text-2xl`) → `promise` at 18px →
  `description` at 16px secondary, held to 52ch → "Key ingredients" +
  `Chip variant="glass"` × `keyIngredients[].name` (max 5) → `product.badges` as
  `Chip variant="trust"` → `fragranceNote` as a quiet 13px line when present →
  `Price product size="lg" live={false}` → `Button variant="secondary"` **Explore
  more** → `productPath(p)` and `Button variant="addToCart"` **Add to Cart**
  (`useCart().addToCart(buildCartItem(p), 1)`), 48px pills, stacked full width
  ≤560px. Labels "Coming soon" (`priceTBA`) / "Out of stock" (`stock === 0`)
  and their disabled state are ProductCard's, spelled identically.
  **Media column:** `GlowWrap tone={index % 2 ? "violet" : "pink"}
  intensity={0.2}` → `CloudinaryImage` on a 4:5 `.sf-plate` with the product's
  own `crop` (`ar="4:5" pad`, `sizes="(max-width: 768px) 92vw, 44vw"`, lazy).
  It passes the RAW `media.url` plus `crop`/`ar`/`pad` rather than a
  pre-transformed `stageSrc()` string — identical output per width, but
  `CloudinaryImage` can then build a real srcSet instead of re-wrapping a URL
  that already carries a transform (which would resize BEFORE the crop).
  **Layout:** one column with the pack FIRST below 769px; two columns above,
  media 42% (≥769px) then 1fr 1fr with a 64px gutter (≥1280px). `flip` moves
  the columns with `grid-column`, so the DOM order is media → words at every
  width and a keyboard walks the same order the phone paints.
  **Sticky media:** `align-self: start; position: sticky; top: 112px` with the
  grid floored at `min-height: 80svh` (`80vh` first, as the fallback). The pack
  is additionally capped at `max-width: calc(0.8 * 62svh)` — **without that cap
  a full-width 4:5 plate is as tall as its own grid row and the sticky never
  engages** (measured: 735px plate in a 735px row at 1280). The cap is written
  as the WIDTH that produces the height so the 4:5 box, and the space it
  reserves before the bytes land, is never broken.
  **Two guards worth keeping:** `overflow-x: clip` on the section (the lamp
  bleeds 5% past its box and the plate is already 92vw on a phone — `clip`, not
  `hidden`, so no scroll container is created and the sticky still works), and
  `padding-block: calc(var(--sf-section-y) * 0.5)` overriding `.sf-section` so
  two adjacent chapters are separated by exactly ONE rhythm unit rather than two.
  **The panel drops its backdrop blur ≤768px** (`--sf-glass-fallback`): eight
  chapters is eight blurred panels in one scroll and DESIGN_SYSTEM §4 budgets two.
  **Motion:** `reveal(reduce, { inView: true })` on the panel, a slower opacity
  fade (`DURATION.slow * 1.5`) on the media, no parallax; both factories return
  nothing under reduced motion.
  **Named exports, pure and unit-tested:** `chapterNumeral(index)` (`0` → `"01"`)
  and `stepEyebrow(product)` — `"01 — Cleanse"`, but **`"Body 01 — Body cleanse"`**
  when the step's label begins "Body", because the soap and the body wash are
  both step one of a different routine and an unqualified second "01" beside the
  face wash reads as a contradiction. The qualifier is derived from the label,
  so a ritual the owner adds later needs no code change.
- `home/ProductShowcase.js` (149) + `.module.css` (66) — **new**. `SectionHeading`
  ("The Black Rice range" / "Eight steps. One **ritual.**" with
  `gradientWord={3}` / "Every product carries a bigger purpose — beauty that
  creates value for farmers." from BRAND.md §3.1 / `rule`) rendered ONCE, then a
  `ProductChapter` per product with `flip={i % 2 === 1}` and
  `id={`product-${slug}`}`, a `.sf-hairline` between chapters.
  **Data:** `products.getHeroProducts()` (already visible-only and already
  `heroOrder`-sorted in both api modes), falling back to `products.getAll()`
  sorted by `heroOrder ?? 99` for a merchant who has not arranged the hero yet.
  **On error the section renders NOTHING**; two skeleton chapters hold the
  first spread's shape while it loads (not eight — that is a page of shimmer).
  One named export, `showcaseProducts(hero, all)`, unit-tested.
- `catalogue/index.js`: `ProductChapter` added to the barrel.
- `pages/Home/Home.js`: `<ProductShowcase/>` mounts directly after
  `<ShopByCategory/>`. Sections 1–6 still follow; Prompt 22 replaces them.
- `db.json`: five `media[0].crop` rectangles corrected after checking all eight
  at 4:5/900px — data only, no schema change, so both api modes and the admin
  product form read them unchanged. The final rectangles and the reason for each
  are in `PACKAGING_NOTES.md` §2 and `PRODUCTS.md` §2; the live backend must be
  reseeded from those values.

**Updated by Prompt 17.** The About LAMIKAA band on the home page, and the
value-chain stepper the About and Why LAMIKAA pages (Prompts 20, 28) reuse.

- `brand/ValueChain.js` (153) + `.module.css` (296) + `.test.js` (79) — **new**.
  BRAND.md §3.3's journey, drawn: Farmer → FPC → Value Addition → LAMIKAA
  Naturals → Consumer → Profit → Farmer Members.
  **Contract:** `steps` (default `brand.valueChain`; a caller may pass a SHORTER
  run of the same list, never a different one) · `orientation`
  `"auto" | "horizontal" | "vertical"` · `compact` · `label` (the list's
  accessible name, default "How value reaches farmers") · `className` · rest
  spread onto the `<ol>`.
  **Markup:** `<ol role="list" aria-label=…>` of `motion.li`, each a
  `Chip variant="step"` numeral ("01"–"07"), a 14px Manrope 600 label and — on
  every step but the last — a gradient hairline connector with an 8px arrow,
  both `aria-hidden`. `role="list"` is the Safari/VoiceOver repair for
  `list-style: none`, which is removed because the numerals ARE the markers.
  **Nothing in it is focusable** — the chain adds no tab stops (verified: the
  About band's only stop is its CTA), and it reads as seven ordered items,
  "01 Farmer" … "07 Farmer Members".
  **Layout is CSS, not measurement.** `auto` = a single row ≥1025px, two rows of
  4 + 3 at 769–1024px (a four-track grid; seven items fill it 4 + 3, and the
  fourth connector is kept — it runs to the row's edge and the fifth step opens
  the next), vertical ≤768px (a 40px rail, 48px rows, the connector down the
  left). `horizontal` and `vertical` pin one of those; forced `horizontal`
  WRAPS rather than overflowing.
  **Every distance is a custom property on the list** (`--vc-numeral` 32px,
  `--vc-row` 48px, `--vc-rail` 40px, `--vc-link` 24px, `--vc-link-max` 48px), so
  `compact` is four value changes rather than a second stylesheet.
  **Two measurements worth keeping:** the vertical connector's
  `margin-block: calc((var(--vc-numeral) - var(--vc-row)) / 2)` pulls its ends
  onto the two circles it joins, so the line touches both instead of floating
  between them; and in the horizontal layouts the connector's flex BASIS is its
  floor (`flex: 1 1 var(--vc-link)`, `max-width: var(--vc-link-max)`) while the
  steps grow — measured 24px at 1025px, 28px at 1100, 44px at 1200, 48px from
  1366 up. The label carries `overflow-wrap: break-word` to undo the global
  `overflow-wrap: anywhere` on `li` (index.css), which otherwise let flex shrink
  split "FPC" over two lines; its automatic minimum then stops a step being
  squeezed narrower than the word it names, so a tight row wraps the three long
  labels at their spaces and never overflows.
  **Motion:** `reveal(reduce, { index, inView: true, amount: 0.4 })` per step —
  a left-to-right wave, settled in ~0.7s — PLUS `animate: { opacity: 0, y:
  RISE.reveal }` as the resting state. **That second prop is load-bearing:**
  App.js wraps every route in `<AnimatePresence mode="wait" initial={false}>`,
  and `initial={false}` makes framer-motion ignore the `initial` prop of
  anything present at the route's first paint, mounting it at its `animate`
  state instead — so a `reveal(…, { inView: true })` on a component that ships
  WITH the route (rather than mounting after a fetch, as the sections around it
  do) silently never plays. Naming the resting state as `animate` too costs one
  prop and makes the reveal behave the same on a cold load of `/` and on a click
  through to it. Under reduced motion `reveal` returns `{}` and the resting
  state is not applied either: seven finished steps on frame one, no style
  attribute at all.
  **Named exports, pure and unit-tested:** `stepNumeral(index)` (`0` → `"01"`)
  and `isBrandStep(label)` — matched against `brand.runningName`/`name`/
  `shortName` rather than by index, so a shorter `steps` run keeps the gold on
  the right word.
- `home/AboutTeaser.js` (176) + `.module.css` (121) — **new**. `SectionHeading`
  ("About LAMIKAA" / the title as a Fraunces pull-quote at `--sf-text-3xl`,
  `text-wrap: balance`, 24ch / `rule`), then a two-column body (`1fr 1.1fr`,
  56px = `--sf-space-12 + --sf-space-2`, ≥1025px; stacked below), then
  `ValueChain`, `LegalNote` and `Button variant="secondary"` → `/about`.
  **Copy is DATA** — `siteContent.get("home")?.aboutTeaser` — and not one word of
  it is typed in the component; only the section's own furniture (its eyebrow,
  its CTA label) has defaults. **The fallback is thin on purpose:** a missing,
  unpublished (`published === false`) or unreachable block leaves the quote
  (`brand.signatureLines[3]`) and `LegalNote`, and the paragraphs and the image
  do not render at all.
  **`gradientWord` is FOUND, not pinned:** `gradientWordIndex(title)` locates
  "farmers" past its punctuation, so an edited headline keeps the emphasis on
  the right word — or, when the word is gone, on none.
  **Media:** a plain `<img loading="lazy" alt="">` inside
  `GlowWrap tone="gold" intensity={0.16}` on a `.sf-placeholder-media` box
  (16/10, `--sf-radius-xl`) — NOT `CloudinaryImage`, because the placeholder is
  a Picsum URL and a Cloudinary transform does not apply to it; `alt=""` because
  describing a scene the brand has not photographed would be inventing one.
  `overflow-x: clip` on the section is the guard for the lamp, which bleeds
  ~11% past its box (110% inset plus its own 6% offset) and, on the stacked
  layouts, past the viewport with it.
  **Two named exports, pure and unit-tested:** `gradientWordIndex(title, word)`
  and `teaserCopy(block)`.
- `pages/Home/Home.js`: `<AboutTeaser/>` mounts directly after
  `<ProductShowcase/>`. Sections 1–6 still follow; Prompt 22 replaces them.

**Updated by Prompt 18.** The ingredient spotlight, the rituals teaser, and the
ritual card the rituals pages (Prompt 24) will reuse.

- `catalogue/RitualCard.js` (178) + `.module.css` (215) + `.test.js` (111) —
  **new**. ONE routine as a card, shared by the home teaser and the rituals
  index.
  **Contract:** `ritual` (required) · `products` (the catalogue the steps
  resolve against) · `compact` (drop the photograph) · `className`.
  **The whole card is ONE `<Link>` and nothing inside it is interactive.**
  `GlassCard as="article" interactive glow="violet" padding="none"` (20px is off
  the 16/24/32 scale, so the module sets it) wrapping a single anchor to
  `ritualPath(ritual)` that carries the full name ("The Morning Glow Ritual,
  4 steps"). Five thumbnails linking onward would nest anchors and give a
  keyboard visitor six stops to five places inside one tile; verified, three
  cards are three tab stops.
  **Composition:** a 16:10 `.sf-placeholder-media` photograph (omitted when
  `compact`) → `.sf-eyebrow` "Ritual · N steps" → the name in Fraunces at
  **22px** (no token sits on it: `--sf-text-lg` is 20 and `--sf-text-xl` clamps
  22→28, which outgrows a three-across card) → the blurb → the step strip →
  `duration` → a ghost "See the ritual →" whose gradient underline animates on
  `:hover` / `:focus-within`, as an inert `<span>`.
  **The step strip** is up to **5** resolved steps as 40px `.sf-plate` thumbs
  (`stageSrc(product, { w: 80 })`) at **−8px** overlap, each with a 24px
  `Chip variant="step"` numeral pinned to its bottom-left, and each with a 2px
  `--sf-color-bg` ring on top of the plate's own hairline (at that overlap two
  `--sf-color-surface` grounds on glass read as one smear). A step's
  `alternativeProductId` renders as a SECOND thumb pulled back 28px so 12px of
  it shows from behind the primary — the soap and the body wash are both step
  one of the body ritual. A step whose product is missing keeps its numeral and
  shows an empty plate. The whole strip is `aria-hidden` (decoration — the
  link's name already says how many steps there are) and opts out of
  `.sf-card--hover:hover img`'s 1.03 breath.
  **The steps are resolved HERE**, through the pure `resolveRitualSteps`
  (= `apiService.rituals.resolveSteps` — no fetching, no mode branch), so
  Prompt 24's index feeds the card the same two inputs the teaser does.
  **The tone glow is a HOVER event**, held at 0 and faded in on `:hover` /
  `:focus-within` at `--sf-glow-opacity: .2`, exactly as `CategoryCard`'s is.
  **Two named exports, pure and unit-tested:** `ritualBlurb(ritual)` (the
  tagline, else the story's first WHOLE sentence — never a truncation at N
  characters) and `stepCountLabel(count)` ("Ritual · 1 step", not "1 steps").
- `home/WhyBlackRice.js` (225) + `.module.css` (173) — **new**. Left: a 1:1
  `.sf-placeholder-media` box (`--sf-radius-xl`) inside
  `GlowWrap tone="gold" intensity={0.16}`, a plain `<img alt="">` for the same
  reason `AboutTeaser`'s is. Right: `SectionHeading` ("The hero ingredient" /
  "Why black rice?", `rule`), the three points, then "Carried by".
  **Two columns `0.9fr 1.1fr` at 56px from 1025px**, one column below, image
  first in the DOM at every width. `overflow-x: clip` on the section guards the
  lamp's ~11% bleed.
  **The three points are `siteContent.home.whyBlackRice.points`, and there is NO
  fallback for them** — a missing, unpublished (`published === false`) or
  unreachable block renders the section not at all. Its subject is three
  cosmetic ingredient claims; a claim hard-coded as a fallback is a claim nobody
  can edit, review or withdraw. The section's own furniture (eyebrow, headline,
  "Carried by") keeps defaults. Points are 17px (`--sf-text-md`) behind **20px**
  gold `mdi:check-circle-outline` glyphs — the box belongs to a wrapper `<span>`
  because `@iconify/react` renders an unstyled, unsized placeholder until the
  icon resolves and forwards neither `className` nor `aria-hidden` to it.
  **"Carried by"** is `products.getHeroProducts()` — the owner's own
  `heroOrder`, so it cannot disagree with the hero or the showcase — as eight
  **56px** `.sf-plate` `<Link>`s to `productPath(p)`, `aria-label` the product
  name and `alt=""` on the image. The row scrolls sideways inside itself
  (532px of plates) rather than pushing the page.
  **Two named exports, pure and unit-tested:** `gradientWordIndex(title, word)`
  (finds "black" rather than pinning index 1; a six-line twin of
  `AboutTeaser`'s, kept local so this section does not pull in `ValueChain`,
  `LegalNote` and `ContentBlocks`) and `spotlightCopy(block)`.
- `home/RitualsTeaser.js` (114) + `.module.css` (93) — **new**. `SectionHeading`
  ("Rituals" / "Build your ritual", gradient on "ritual", lede "Three curated
  routines, in the order the range was designed to be used.", `rule`), three
  `RitualCard`s, then `Button variant="primary"` "Build your ritual" →
  `ROUTES.RITUALS`, centred under the grid.
  **Data:** `rituals.getAll()` + `products.getAll()` in one `Promise.all` — the
  WHOLE catalogue, not the hero list, because a step may name any product.
  Any rejection, or no live ritual, and the section renders NOTHING.
  **Grid:** three columns from **769px** (three routines are a triptych; two
  columns would strand the third, and at 769px the longest strip measures 172px
  inside 187px of content), one column 481–768, and an 84vw horizontal snap
  scroller ≤480 built the same way `ShopByCategory`'s is (the track breaks the
  container's padding and puts it back inside itself).
- `pages/Home/Home.js`: `<WhyBlackRice/>` then `<RitualsTeaser/>` mount directly
  after `<AboutTeaser/>`. Sections 1–6 still follow; Prompt 22 replaces them.
- `catalogue/index.js`: `RitualCard` joins the barrel.

No `db.json` or `api.js` change — both sections read only
(`siteContent.home.whyBlackRice`, `rituals.getAll`, `products.getAll`,
`products.getHeroProducts`), all already served identically by both api modes.

**Updated by Prompt 19.** The full-page CTA, and the newsletter capture the
footer and the CTA now share.

- `brand/NewsletterForm.js` (172) + `.module.css` (175) — **new**, extracted
  from `Footer.js`. ONE newsletter contract, asked in two places.
  **Contract:** `variant` `"footer" | "cta"` · `label` (the visible gold
  eyebrow) · `hint` (wired through `aria-describedby`) · `buttonLabel`
  (default `"Subscribe"`) · `id` (the BASE for `-email`, `-hint`, `-error`;
  `useId()` when omitted, so two mounts on one page cannot collide) ·
  `className`.
  **The behaviour is the footer band's, unchanged:** `isEmailValid()` gate →
  `apiService.leads.createNewsletter(email)` → a `role="status"` thank-you that
  reverts to the field after **6 s**, or a `role="alert"` message with
  `aria-invalid` and the error id appended to `aria-describedby`. A network or
  5xx failure is surfaced, never dressed as a success. The lead lands in
  Admin → Leads as a `newsletter` / `subscribed` row.
  **The field is the design system's input** (§7): `--sf-color-surface-2`
  behind a 1px `--sf-glass-border`, pill radius, **48px** (`--sf-space-12`),
  with the pill primary on the same baseline. It replaces the footer's Prompt 13
  hairline-underline field, so the storefront has ONE field design; `variant`
  changes only alignment, measure and the width at which the pill drops below
  the field (footer ≤480px, cta ≤639px).
  **Footer.js keeps only the grid placement** (`.newsletter`) — its form, state,
  reset timer and `isEmailValid` import are gone, and `.eyebrow` there is now
  the four directory headings' class alone.
- `home/FullPageCta.js` (252) + `.module.css` (235) + `.test.js` (85) —
  **new**. One full-viewport stop, **four layers**: a `loading="lazy"`
  `alt=""` `<img class="sf-placeholder-media">` at `object-fit: cover` → the
  wash `color-mix(--sf-color-bg 82% → 94%)` → `--sf-gradient-signature` at
  **12% `mix-blend-mode: screen`** (the section sets `isolation: isolate` so the
  blend stays inside it) → the card. The three grounds are absolutely
  positioned, not grid cells: `align-self: stretch` does nothing to an `<img>`.
  **NO backdrop blur on the ground** (DESIGN_SYSTEM §4) — verified
  `backdrop-filter: none` on the section, `blur(20px)` on the card.
  **Height:** `min-height: 100svh` from **769px**, `80svh` below, each with a
  `vh` line above it as the fallback. Section padding is `--sf-space-16`, not
  `--sf-section-y`: the floor is what gives the section its air.
  **Card:** `GlassCard strong scrim padding="lg"`, max-width **760px**, centred,
  inside `GlowWrap tone="duo" intensity={0.22} size={130} breathe` — the page's
  **second and last** breathing glow (the hero owns the first; scanned at 176
  scroll positions, never two in one viewport). `scrim` is not optional: without
  it the signature gradient's violet stop measures 1.6:1 on the headline over a
  bright photograph, against 3.1:1 with it.
  **Composition:** `.sf-eyebrow` "Beauty with a purpose" → an `<h2>` of three
  `<span>` blocks 8px apart in Fraunces `--sf-text-4xl` (`--sf-text-3xl` below
  769px), the FIRST carrying the section's one gradient keyword → `brand.tagline`
  as the lede → `Button variant="primary" size="lg"` and
  `variant="secondary" size="lg"`, stacked full-width below 640px →
  `NewsletterForm variant="cta"` under a `--sf-glass-border` rule →
  `LegalNote compact`.
  **Copy is `siteContent.home.fullPageCta` with a real fallback** —
  `brand.signatureLines.slice(0, 3)` plus `/shop` and `/about` — unlike the
  ingredient spotlight, which has none: these are the brand's own signature
  lines, not a cosmetic claim. Only the photograph has no fallback.
  **Two named exports, pure and unit-tested:** `splitOnWord(line, word)` (splits
  around a whole-word, regex-escaped match so the sentence's own full stop stays
  out of the gradient; `null` when the word is gone) and `ctaCopy(block)`.
- `pages/Home/Home.js`: `<FullPageCta/>` mounts directly after
  `<RitualsTeaser/>`. Sections 1–6 still follow; Prompt 22 replaces them.
- `theme/storefront-primitives.css`: **two pre-existing defects fixed**, both in
  the contract this section depends on.
  `.sf-glow--duo.sf-glow--breathe::after` (0,2,1) out-specificities the
  reduced-motion reset `.sf-glow--breathe::after` (0,1,1), so a duo glow's
  second lamp kept breathing with reduced motion on — the hero has carried this
  since Prompt 14. A third selector at matching specificity was added.
  `.sf-glass--scrim::before` was absolutely positioned with no `z-index`, so it
  painted in the positioned-descendant layer, ABOVE the host's in-flow text —
  the wash dimmed the type it exists to make legible (a warm-white headline
  capped at `rgb(165,163,161)`). It now takes `z-index: -1` inside an
  `isolation: isolate` host, which is what `.sf-card--hover::before` already
  does and what the class name has always promised. `BottomNav` is the only
  other consumer and was re-checked.

No `db.json` or `api.js` change. The section READS
`siteContent.home.fullPageCta` and WRITES through the existing
`apiService.leads.createNewsletter` — `POST /leads` in mock,
`POST /leads/newsletter` live — so both api modes are unchanged.

**Updated by Prompt 20.** The Why LAMIKAA band on the home page, and the two brand
components the Why LAMIKAA page (Prompt 28) mounts unchanged.

- `brand/Pillars.js` (142) + `.module.css` (158) + `.test.js` (196, shared with the
  other two components of this prompt) — **new**. BRAND.md §3.2's four pillars as
  glass cards.
  **Contract:** `pillars` (default `brand.pillars`) · `compact` · `titleAs`
  (default `"h3"`) · `className` · rest spread onto the `<ul>`.
  **Markup:** one `<ul role="list">` of four `GlassCard as={motion.li}` at
  `padding="md"` (16px when `compact`), each carrying a 44px glass circle with a
  24px gold glyph, a `Chip variant="step"` numeral "01"–"04" (`aria-hidden` — a
  visual ordinal on an unordered list), the title in Fraunces 22px and the text in
  Manrope 15px `--sf-color-text-secondary`. **Not one word of copy is in the
  component**; it is all `brand.pillars`.
  **Icons** resolve by KEY first (`indigenous-knowledge` → `mdi:leaf`,
  `modern-science` → `mdi:flask-outline`, `farmer-ownership` →
  `mdi:account-group-outline`, `responsible-beauty` → `mdi:earth`), then by
  position, then to `mdi:star-four-points-outline`.
  **The cards are NOT links and never take `interactive`** — its 4px lift, firmed
  hairline and focus ring promise a destination that does not exist. The
  `glow` tone node is instead held at `opacity: 0` and faded in by
  `.grid .card:hover :global(.sf-glow)`, alternating gold/violet by index.
  **Measured: one tab stop in the whole section (the CTA) and `transform: none` on
  every card, hovered or not.**
  **Layout:** 4 columns ≥1025px, 2 at 769–1024px, 1 stacked ≤768px, 16px gaps,
  `minmax(0, 1fr)` at every step. Backdrop blur is dropped ≤768px
  (`--sf-glass-fallback`), the same guard `ProductChapter` uses.
  **Exports:** default plus `PILLAR_ICONS`, `pillarIcon(pillar, index)`,
  `pillarNumeral(index)`, `pillarTone(index)` — all pure, all unit-tested.
- `brand/ImpactTriptych.js` (184) + `.module.css` (128) — **new**.
  `siteContent.impact.items` as three columns.
  **Contract:** `items` · `showImages` (false on the home band, true on the page) ·
  `titleAs` (default `"h3"`) · `className` · rest.
  **Each column:** a 1px signature-gradient hairline at 60% opacity across the top
  (a `::before`, so it stays out of the accessibility tree), an optional 4:3
  `.sf-placeholder-media` photograph with `alt=""`, the eyebrow, the title in
  Fraunces `--sf-text-lg`, and the points as a `<ul role="list">` at 15px behind
  18px gold `mdi:circle-medium` bullets. **A bullet, not a tick**: these are aims,
  and a check mark in front of one reads as a claim it has already happened.
  **Layout:** `repeat(3, minmax(0, 1fr))` at a 24px gutter from 1025px, stacked at
  32px below. No blurred layer at any width.
  **The eyebrow is DERIVED from `item.key`** ("financial" → "Financial") and the
  same word is stripped off `item.title` — but only when a dash follows it, so
  "Financially Sustainable" keeps its first word. The seed writes the category into
  both fields because the CMS field is one string.
  **The points render VERBATIM** — no truncation, no summarising — which is what
  preserves BRAND.md §3.9's qualifiers ("can reach the member farmers through
  dividends"). There is no fallback copy: a missing, unpublished or unreachable
  block renders `null`.
  **Exports:** default plus `impactEyebrow(item)`, `impactTitle(item)`,
  `impactColumns(items)` — pure and unit-tested, including the verbatim property.
- `home/WhyLamikaaSection.js` (141) + `.module.css` (85) — **new**. The band that
  composes the two, mounted between the full-page CTA and Prompt 22's remaining
  sections.
  **Composition:** `SectionHeading` (eyebrow "Why LAMIKAA", `brand.philosophy` as
  the `h2` at `--sf-text-3xl`, **no gradient word** — the headline is the
  philosophy, and lighting one of its three sentences would be an argument the
  brand has not made; lede `brand.philosophyLede`) → `Pillars` → a second
  `SectionHeading as="h3"` (eyebrow and title from the fetched block, defaults
  "Our impact" / "Beauty That Creates Prosperity for Farmers") →
  `ImpactTriptych showImages={false} titleAs="h4"` → `Button variant="secondary"`
  "Why LAMIKAA" → `ROUTES.WHY` (`/why-lamikaa`, a stub until Prompt 28).
  **The two halves fail separately:** the philosophy, the pillars and the CTA come
  from `config/brand.js` and always render; the impact half renders nothing —
  heading included — when its block is missing, unpublished or unreachable. While
  loading it shows its heading over three text skeletons at the column widths.
  **Outline:** page `h1` (hero) → this `h2` → pillar `h3` ×4 and the impact `h3` →
  column `h4` ×3. Prompt 28 shifts the run up one level through `as` / `titleAs`.
  **Exports:** default plus `impactCopy(block)`.
- `config/brand.js`: one new key, **`philosophyLede`** — BRAND.md §3.2's first
  sentence verbatim, qualifier included ("can be inspired"). `philosophy` IS the
  band's headline, so its lede is brand copy too, and brand copy lives in this file
  (the rule `originBadge` was added under in Prompt 15). Nothing else in the file
  changed.
- `pages/Home/Home.js`: `<WhyLamikaaSection/>` mounts directly after
  `<FullPageCta/>`, and the file's section map gains `0i`. Sections 1–6 still
  follow; Prompt 22 replaces them.

No `db.json` and no `api.js` change. The section READS `siteContent.impact` —
`GET /siteContent` in mock, `GET /content/impact` live — which both modes already
serve identically, and writes nothing.

**Updated by Prompt 21.** The shared `FAQ` block is rebuilt on the `Accordion`
primitive and becomes the one accordion answers are read in; `HomeFaqs` is the
home page's band around it.

- `FAQ/FAQ.js` (159, was 55) + `.module.css` (112, was 25) + `.test.js` (196) —
  **rewritten onto `ui/Accordion`**. The disclosure pattern — a real `<button>`
  inside a heading, `aria-expanded`/`aria-controls`, ArrowUp/ArrowDown/Home/End
  between headers, the `grid-template-rows: 0fr → 1fr` height animation, the
  collapsed panel's `visibility: hidden` — is entirely the primitive's and is not
  restated. The component no longer reads `FaqContext` itself: **rows are a prop**,
  so the same accordion serves the home band, the FAQ page (Prompt 28) and the
  PDP's FAQs panel (Prompt 27).
  **Contract:** `faqs` · `limit` · `defaultOpen` · `multiple` (default `false`) ·
  `id` · `headingLevel` (a NUMBER, 2–6, default 3 — mapped to the primitive's tag)
  · `className` · rest spread onto the accordion root.
  **Rows → items:** `id: "faq-<id>"`, `title` the question, `content` a
  `<ContentBlocks variant="prose">` over the resolved answer (answers are plain
  text; `ContentBlocks` splits the paragraphs and cannot emit markup).
  **The copy is data and the figures in it are live:** `useStoreSettings().fillCopy`
  resolves `{freeShipping}` / `{codSentence}` / `{taxNote}` /
  `{{RETURN_WINDOW_DAYS}}` at render time, and `stripPlaceholderSentences` runs
  again on the result so a sentence still quoting an unsupplied token leaves the
  page while its neighbours stay. **A row whose answer empties out is dropped
  entirely** — question included.
  **Deep links:** the question is wrapped in `<span id="faq-<id>">`, so `/#faq-3`
  and `/faq#faq-7` are legal targets. The hash is read through
  `useLocation()`; when it names one of this block's rows the accordion is
  **re-keyed** on it, which opens that row from an in-page link as well as on a
  cold load, then focuses its trigger (`preventScroll`) and centres it with
  `scrollIntoView` (`behavior: "auto"` under `prefers-reduced-motion`).
  **Dress:** glass hairline separators (`--sf-glass-border`), the question in
  Manrope 600 `--sf-text-md` (17px) over the primitive's 44px floor, a 20px
  `--sf-color-gold` chevron rotating 180°, the answer at `--sf-text-base` (16px,
  the design system's body floor — see the decisions log) in
  `--sf-color-text-secondary` at 20px inline inset, and a 2px signature-gradient
  rule at 60% down the OPEN row, hung at −12px so it sits in the container's own
  padding and opening an answer moves no word sideways. The module reaches the
  primitive through its **ARIA contract** (`button[aria-expanded]`,
  `[role="region"]`) plus one structural selector for the row
  (`.faq > div`, and `:has(button[aria-expanded="true"])` for its open state) —
  both decorative, both documented in the file.
  **Exports:** default plus `faqAnchorId(faq)` and `faqAnswerText(answer, fillCopy)`.
- `home/HomeFaqs.js` (89) + `.module.css` (79) + `.test.js` (101) — **new**. The
  band: `SectionHeading` (eyebrow "Good to know", `rule`, title "Questions,
  answered" with `gradientWord={1}`, a one-line lede) + `Button variant="secondary"`
  "All questions" → `ROUTES.FAQ`, then `<FAQ headingLevel={3}/>` over
  `useFaqs().forPlacement("home", { limit: 8 })`.
  **Layout:** two columns from 1025px (`1fr 1.25fr`, 56px gutter) with the left
  column `position: sticky; top: 112px` so the signpost holds still for the length
  of the accordion; stacked ≤1024px in reading order.
  **It renders `null` under two answers** — one lonely drawer under a headline
  promising "questions" reads as broken rather than as brief.
  **No `FAQPage` JSON-LD here**: /faq owns it (Prompt 28), and publishing it twice
  would give a search engine two competing answers to one question.
  **Exports:** default plus `HOME_FAQ_LIMIT` (8) and `HOME_FAQ_MINIMUM` (2).
- `utils/faqs.js`: **`faqLimit(rows, limit)`** (new, exported) and
  `faqsForPlacement(faqs, placement, { limit })`. The cap is applied AFTER the
  live/placement/targeting filters and the de-dupe, because "the first eight
  answers a visitor should see" and "eight rows off the top of the collection" are
  different lists. `null`, `undefined`, `""`, a negative and a non-number all mean
  "no cap" (`Number(null)` is 0, so the guard runs before the coercion).
  `faqsForGroup` and `faqsForProduct` are unchanged.
- `context/FaqContext.js`: `forPlacement(placement, options)` passes the options
  object straight through to `faqsForPlacement`. Nothing else changed.
- `pages/Home/Home.js`: `<HomeFaqs/>` mounts directly after
  `<WhyLamikaaSection/>`, and the file's section map gains `0j`.
- `db.json`: `faqs` rows 6–8 gained the **`"home"`** placement, so all eight site
  FAQs are on the shared block (the prompt asks for 6–8 there; the Prompt 06 seed
  had put `"home"` on rows 1–5 only). Three JSON values in the one field the admin
  FAQ manager already edits and both api modes already read — no schema change, no
  `api.js` change, and `/admin/faqs` keeps its `home`/`help`/`product` vocabulary.

## 6. Pages (`src/pages/*`) — see §11 for verdicts

- `Home.js` (710): hero + collection stories + featured grid + offers rail (with admin countdown) + heritage band + trending rail + recently-viewed rail (localStorage `recentlyViewed`, reconciled against the live catalogue) + promises row.
- `Products.js` (1661): URL-backed catalogue — params `category` (slug or legacy id, parent-includes-children via `getCategoryScopeIds`), `search`, `sort` (`relevance|price-low|price-high|newest|rating|popularity` + 12 aliases), `page`, `per_page`, `min_price`, `max_price`, `highlight` (featured/trending/hot); session-only facets rating/discount/in-stock/brand/**fabric** (`FABRIC_FAMILIES` Muga/Pat/Eri/Toss/Cotton); filter drawer with focus trap; skeleton/error/empty states; heading default "All Silk".
- `ProductDetails.js` (1146): slug + legacy numeric-id resolution with canonical redirect; `ProductGallery` from `product.images`; buy box (SocialProof, PriceBlock, key features, VariantSelector, QuantityStepper, Buy Now/Add to Cart/wishlist, TrustBadges, DeliveryReturnsInfo); promises band; tabs Description / Specifications (`SILK_SPEC_LABELS`) / Fabric & Craft (conditional) / Reviews / FAQs (`useFaqs().forProduct`); FBT + Related rails; `AddToCartBar`; writes `recentlyViewed`; owns the tab title via `setPageTitle` and hand-writes `meta[name=description]`.
- `Checkout.js` (1656; **restyled by Prompt 29 — see the block below; every rule listed here still holds**): 4 steps Cart → Shipping → Payment → Review; address book + inline form (required: firstName, lastName, phone, addressLine1, city, state, postalCode; country fixed "India"); shipping methods from API (free above `freeAbove`); coupon; tax inclusive/exclusive; store credit (`wallet.getBalance`); COD rules from settings (`codEnabled/codMinOrder/codMaxOrder/codFee`); payment methods `card|upi|net_banking|wallet|cod` (mock forms, no gateway); `createOrder()` from OrderContext then `navigate('/order-confirmation/'+orderNumber)`.
- `OrderConfirmation.js` (557; **restyled by Prompt 31**): `/order-confirmation/:orderNumber`, payment-status-aware, confetti (reduced-motion aware), loading/error/not-found branches — every one of them kept. **Updated by Prompt 31**: a 96px seal (`GlowWrap tone="gold"` → a masked signature-gradient ring → an ink check → one halo), the gold eyebrow "Order confirmed", a Fraunces "Thank you, {firstName}", a glass record card that is `1fr 1fr` from 769px, hairline 15px ledger rows, `Chip variant="status"` for the payment state and three pill `Button`s (**Continue shopping → `/shop`**, was `/`). Loading is a `Skeleton` page silhouette (**the page's spinner is gone**); the failed and not-found branches are `ui/ErrorState` and `ui/EmptyState`, each taking the `h1`. `useSeo({ title: "Order confirmed", noindex: true })`.
- `OrderHistory.js` (1159; **restyled by Prompt 30**): search/filter/paginate (5/page), 3-stage timeline, tracking drawer, details drawer, cancel (`orders.cancel`), return (→ `ROUTES.CONTACT` within the window), reorder, **review submission** via `ReviewModal` (`reviews.submit`), refund states — every one of them unchanged. **Updated by Prompt 30**: each order is a `GlassCard` (56px `CloudinaryImage` plate strip, `Chip variant="status"`, three `Chip variant="step"` numerals joined by a gradient hairline, pill `Button`s that wrap, two `grid-template-rows: 0fr→1fr` disclosures). `deriveOrderStatus`/`STATUS_CONFIG` moved to `utils/orderStatus` and are read through `orderStatusInfo(order)`; `RETURN_WINDOW_DAYS` is now `STOREFRONT_CONFIG.returnsWindowDays` (was a local `7`). The handler block was diffed against HEAD: the only changes are those four call sites.
- `Profile.js` (1398; **restyled by Prompt 30**): dashboard + sections Profile (edit; email read-only), Addresses (CRUD via `updateUser({addresses})`), Payment (empty state), Wallet (`wallet.getBalance/getTransactions`), Notifications (coming soon), Settings (password change with strength meter and the live checklist — the Appearance switch went in Prompt 03). **Updated by Prompt 30**: the dashboard is a `320px 1fr` grid from 1025px (identity `GlassCard` with the initials in a signature-gradient ring + the three figures on the left, the 52px index and the recent orders on the right); sections are `GlassCard`s at 24px; addresses wear a gold `Chip variant="trust"` "Default"; the wallet ledger is hairline rows with credit/debit tones; forms are 48px fields on `--sf-color-surface-2`. It no longer duplicates `deriveOrderStatus` — it imports `orderStatusInfo` from `utils/orderStatus`, the same module Order History reads. Every effect and handler from `useEffect(populate)` to `handleLogout` is byte-identical to HEAD (diffed, 374 lines).
- `Wishlist.js` (496; **restyled by Prompt 30**): guest-capable, 5 sorts, Move to cart (add + silent remove), heart-remove with its exit animation, Clear all (the context raises the confirm), recommendations (`getRelated` → `getFeatured`, deduped), stock gating. **Updated by Prompt 30**: title "Your wishlist" through `SectionHeading`, a glass guest band and a glass toolbar, `Button variant="secondary" block` under each `ProductCard`, and a 1/2/3/4-column grid at 360/640/1024/1280.
- `SpecialOffers.js` (872; **restyled by Prompt 31**): admin `dealsConfig`-driven deals page — the `enabled` gate, `hero` copy, `resolveCountdownTarget`, the coupon vouchers with their honest copy failure, Deal of the Day, the category tabs derived from present categories, the discount-derived fallbacks and the `buildCartItem` adds are all unchanged. **Updated by Prompt 31**: the **local `ProductCard` copy is deleted** — the markdown wall renders `storefront/ProductCard` in a `motion.div` cell that owns the reveal and the filter exit, so the page no longer carries a card, a heart, an add button or a card skeleton. Vouchers are `GlassCard glow="gold"` at a fixed 3/2/1-up with the code on a dashed chip in monospace gold; the disabled page (the seed's state) and "nothing is reduced" are `ui/EmptyState`, and a **new** failed branch is `ui/ErrorState` with a retry (the `catch` used to write `[]`, so a dropped read read as "no offers"). `useSeo({ title: "Offers" })`; the nav label was already "Offers".
- `AboutUs.js` (552): static magazine story, 95 % silk copy (rebuild).
- `HelpCenter.js` (354): searchable FAQs (`forPlacement("help")`) + topic tiles + contact band.
- `Support.js` (592): contact channels + lead form (`leads.createContact`, 7-key payload) + showroom/social/why-us rail.
- Policies `PrivacyPolicy`, `TermsOfService` (live tax/COD clauses from settings; hard-coded ₹ shipping defs), `CookiePolicy`, `RefundPolicy` (`STOREFRONT_CONFIG.returnsWindowDays`): static typeset documents, Galleria/Kolkata/handloom copy.
- **No 404 page** (`*` → `/`), only the PDP's inline "Product Not Found". **No lazy loading** (all pages imported eagerly in `App.js`).


**Updated by Prompt 11.** `/search` is a real page; the `ComingSoon` stub it
used is gone from `App.js` (four remain: `/rituals`, `/rituals/:slug`,
`/why-lamikaa`, `/cart`).

- `pages/Search/Search.js` (242) + `.module.css` (145): reads `?q=`, ranks the
  catalogue with the SAME `rankProducts()` the overlay uses (so a query cannot
  mean two things), and renders `SectionHeading as="h1"` — eyebrow "Search",
  title `Results for “{q}”` (plain "Search" with no query), lede carrying the
  count — over a `ProductCard` grid at **1 / 2 / 3 / 4 columns from 360 / 640 /
  1024 / 1280**. `useSeo({ title: q ? "Search: {q}" : "Search", noindex: true })`.
  A 52px field at the top (the overlay's treatment plus a submit pill) writes
  `?q=` with `replace: true`, so editing a query does not stack history entries;
  the field mirrors the URL, so Back and Forward move the query. Loading is four
  `Skeleton variant="card"`; empty is "Nothing matched “{q}”." + the popular
  chips + "Browse all products" → `/shop`; a failed catalogue read says so
  instead of claiming nothing matched. `role="status"` announces the count.
  `/products?search=x` already redirects here (`LegacyRedirects`, Prompt 08).

**Updated by Prompt 22.** The home page is assembled. `pages/Home/Home.js`
742 → 279 lines and `Home.module.css` 779 → 105; the page is now a composition
of `components/home/*` and owns nothing but the ground, the hero/trust-strip
relationship and the deferral machinery.

- `pages/Home/Home.js` (279): **eleven sections in the brief's order** —
  `HeroCarousel` and `TrustStrip` eager, then nine lazy chunks: `ProductShowcase`
  → `ShopByCategory` → `AboutTeaser` → `WhyBlackRice` → `RitualsTeaser` →
  `FullPageCta` → `WhyLamikaaSection` → `RecentlyViewed` → `HomeFaqs`.
  `ShopByCategory` moved from under the trust strip to after the product
  chapters (brief §7.2 item 4). One `useHomeData()` call feeds every section by
  prop. `useSeo({ jsonLd: [organizationJsonLd({social}), websiteJsonLd()] })`.
  A local `DeferredSection` wraps each lazy section: `useInView` with
  `rootMargin: "600px"`, a measured `reserve` height held only until the section
  mounts, and `content-visibility: auto` on the six sections that draw no glow
  (about / spotlight / CTA opt out — paint containment would clip
  `.sf-glow::before`).
- `components/home/useHomeData.js` (new): the page's ONE read of the catalogue.
  `products.getAll` · `products.getHeroProducts` · `categories.getAll` ·
  `concerns.getAll` · `rituals.getAll` · `siteContent.get()` (the whole record,
  split into `homeContent` / `impactContent`), all in parallel from the first
  effect. Returns tri-state slices — `undefined` in flight, `null` failed, value
  loaded — plus `loading` and `error`. The naive assembly issued **15 requests
  for 6 collections**; this issues **6**. A module-level map de-duplicates only
  requests that are IN FLIGHT, so freshness is unchanged.
- `components/home/RecentlyViewed.{js,module.css}` (new): the one secondary
  section kept, because it is existing storefront functionality — the localStorage
  key `recentlyViewed` written by `pages/ProductDetails/ProductDetails.js` and the
  reconciliation against the live catalogue (browsing order kept, unreachable
  products dropped, current record rendered) are ported verbatim from the old
  `Home.js`, as is the `useRail`/ResizeObserver hook. Quiet compact rail on the
  surface band; hidden below **two** live products (was one). `reconcile` and
  `readStoredIds` are exported and unit-tested (`RecentlyViewed.test.js`, 8 tests).
- **Deleted**: `components/FeaturedProducts/*` and `components/CTASection/*` (no
  consumers), and with them the old page's collection stories, featured grid,
  offers rail + countdown, craft interlude, trending rail and promises row.
  `TRUST_BADGES` is gone from `utils/constants.js` (its last consumer was the
  promises row); `WHY_CHOOSE_US` **stays** — `pages/Support/Support.js:594` maps
  over it.
- **Sections switched from self-fetching to props** (Prompts 14–21):
  `HeroCarousel` (`heroProducts`; keeps its own `hero.getConfig()` and the
  conditional `getFeatured` fallback), `ProductShowcase`, `ShopByCategory`,
  `AboutTeaser`, `WhyBlackRice`, `RitualsTeaser`, `FullPageCta`,
  `WhyLamikaaSection`. `HomeFaqs` is unchanged (it reads `FaqContext`).
- **Outside `src/pages`**: `hooks/useInView.js` gained a `rootMargin` option
  (default `"0px"`, existing callers unaffected); `hooks/useSeo.js` gained the
  `organizationJsonLd()` / `websiteJsonLd()` helpers (validator: 0 errors, 0
  warnings) — `utils/seo.js` is left free for Prompt 27's product graph;
  `public/index.html` lost the dead Material Icons stylesheet and gained a
  `preconnect` to res.cloudinary.com; `App.js` made `AdminLayout` lazy, which
  took the admin's MUI shell out of the bundle every storefront visitor
  downloads (main 285 → 249 kB gzipped).

**Updated by Prompt 23.** The catalogue is the chaptered listing. `pages/Products/*`
is **deleted** (`Products.js` 1 687 + `Products.module.css` 1 335) and with it
every filter, sort and pagination control the storefront had; `pages/Shop/*` is
what `/shop` AND `/category/:slug` now render.

- `pages/Shop/Shop.js` (380) + `Shop.module.css` (220): `SectionHeading as="h1"`
  (eyebrow "The Black Rice range" / "Shop by concern" / "Category", title "Shop"
  / "For {concern}" / the category name, lede "{n} products · one ritual"), a
  wrapped chip row of "All" + the eleven concerns (`Chip variant="concern"`,
  `active` + `aria-current="page"` on the current one, each a `<Link>` to
  `concernPath()`), then one `ProductChapter variant="shop"` per product with
  `flip` alternating and an `.sf-hairline` between, then `BuildRitualPanel`.
  Page grid at ≥1025px is `minmax(0,1fr) 220px` on the **wide** track with a
  48px gap; `.layout` IS the container (the chapters' own `.sf-container` is
  neutralised inside it, so the measure is declared once) and it must NOT carry
  `align-items: start` — that shrink-wraps the rail's grid item and its sticky
  `<nav>` then has nowhere to travel. The rail is written FIRST in the DOM and
  placed with `grid-column: 2`, so a keyboard visitor meets the index before the
  chapters. `mode="category"` reads `useParams().slug` and calls
  `products.getByCategorySlug` (Prompt 24 adds `CategoryHead`, the breadcrumb,
  the JSON-LD and the unknown-slug 404). Three states: 3 skeleton chapters
  loading · a glass panel + "Try again" on a failed read (never "nothing here")
  · "Nothing here yet" + "All products" on an empty one.
  `useSeo({ title: "Shop" | "Shop · {concern}", description, jsonLd: itemListJsonLd(products) })`.
  Exports `shopOrder` and `productCountLabel` for the unit test.
- `components/catalogue/ChapterIndex.{js,module.css}` (new): the page's only
  chrome, in two shapes. `variant="rail"` (≥1025px) is a `<nav aria-label=
  "Products on this page">` — `position: sticky; top: 112px`, a 2px
  `--sf-color-surface-2` track with a `--sf-gradient-signature` fill at
  `(activeIndex + intraChapterProgress) / n`, an `<ol>` of 14px `shortName`
  buttons (`aria-current="true"`, gold, gradient dot) and a "Back to top" ghost
  button. `variant="strip"` (≤1024px) is a full-bleed `.sf-glass` band at
  `top: 56px` (64px at 769–1024) of 36px numeral + name pills with `x proximity`
  snapping, a 44px `::after` hit area, and its active pill centred by writing
  the strip's own `scrollLeft`; it hides under `body[data-drawer-open]`. Both
  render; the wrong one is `display: none` (out of the a11y tree too). A jump is
  `scrollIntoView` + focus on the chapter `h2`. The progress read is
  rAF-throttled, passive, and writes one custom property — no React state.
  Exports `chapterId`, `chapterHeadingId`, `intraChapterProgress`,
  `trackProgress` (16 unit tests in `ChapterIndex.test.js`).
- `components/catalogue/BuildRitualPanel.{js,module.css}` (new): the closing
  `GlassCard strong glow="duo"` — "Finish the ritual" / "Build your **ritual**" /
  "Three routines that put the range in order.", three `RitualCard compact`, and
  "See all rituals" → `/rituals`. It reads `rituals.getAll()` AND
  `products.getAll()` itself (a step names any product, so a concern-narrowed
  page must not resolve its strip against three rows) and renders nothing at all
  on a rejection or an empty ritual list.
- `components/catalogue/ProductChapter`: `variant="shop"` is now a real variant —
  `min-height: 88svh` from 769px and **no floor at all on a phone**,
  `scroll-margin-top: 96px`, `data-slug`, a `tabIndex={-1}` `h2` (the rail's
  focus target) and an `onVisible(index)` prop backed by an IntersectionObserver
  at `threshold: 0.5`, fired only on the crossing INTO view. Passing no
  `onVisible` (the home page) builds no observer.
- `utils/seo.js` (new): `itemListJsonLd(products)` — a schema.org `ItemList` of
  absolute product URLs built on `seoOrigin()`, dropping any row with neither
  slug nor id, and `null` for an empty list. `useSeo.js` keeps the two
  site-level graphs; Prompt 24 adds `breadcrumbJsonLd` here and Prompt 27 the
  `Product` graph.
- **Scroll snap** is on, desktop only: `scroll-snap-type: y proximity` on
  `<html>` behind a `data-chapter-snap` attribute `Shop` sets while mounted,
  with `scroll-snap-align: start` on the chapters. Off below 1025px and off
  under `prefers-reduced-motion`. Measured: mid-chapter settle delta 0, boundary
  settle ≤ ~165px onto chapter starts, and the sticky rail unaffected.
- **`App.js`**: `Products` → `Shop`; the Prompt 08 `CategoryRoute` wrapper is
  gone and `/category/:slug` renders `<Shop mode="category" />`. Four
  `ComingSoon` routes remain (`/rituals`, `/rituals/:slug`, `/why-lamikaa`,
  `/cart`).
- **Removed with the listing**: `getCategoryScopeIds` and
  `orderCategoriesHierarchically` from `utils/categories.js` (the category facet
  was their only caller) and `getDeviceType` from `utils/helpers.js`.
  `getDescendantIds` **stays** — `pages/Admin/AdminCategories.js` reads it.
  `resolveCategory`, `categoryParam` and `getMainMenuCategories` are left for
  the Prompt 35 sweep.

**Updated by Prompt 24.** The seven categories have their heads and the rituals
have their two pages. `/rituals` and `/rituals/:slug` are real; **two**
`ComingSoon` routes remain (`/why-lamikaa` → 28, `/cart` → 29).

- `pages/Shop/Shop.js` (380 → 581) + `Shop.module.css` (220 → 228): **split in
  two**. `Shop` now holds only `useSearchParams`/`useParams`/`useShopData` and
  the route's two exits — `/category/rituals` (or any category with
  `kind: "rituals"`, so renaming the slug in the admin cannot strand it) →
  `<Navigate to="/rituals" replace/>`, and `status === "ready" && !category` →
  `<NotFound/>`; `ShopView` holds every other hook and the JSX. **The split is
  load-bearing**: `useSeo` borrows the head's existing tags and restores what it
  displaced, so two of them mounted at once (the page's and `NotFound`'s)
  restore in child-then-parent order and leave a stale description behind —
  exactly one `useSeo` is ever mounted on this route. `useShopData` gained a
  `skip` flag so the rituals redirect costs no round trip. In category mode the
  page renders `CategoryHead` instead of the `SectionHeading` + concern-chip row,
  and publishes `jsonLd: [breadcrumbJsonLd(trail), itemListJsonLd(products)]`
  with `description` from the category record. Exports `concernsOf` alongside
  `shopOrder` and `productCountLabel`.
- `components/catalogue/CategoryHead.{js,module.css}` (new): a full-bleed
  `.sf-placeholder-media` band (4:3 on a phone; 21:9 with
  `min-height: clamp(260px, 32vw, 420px)` and `max-height: 520px` from 769px)
  under a `GlassCard strong scrim` panel (max 640px) holding `Breadcrumb`,
  eyebrow "Category", the `<h1>` (`--sf-text-3xl`, `4xl` from 1025px), the
  description, the count and the concern chips. The overlap is a NEGATIVE MARGIN
  (`clamp(-140px, -9vw, -72px)`), never `position: absolute` — the panel stays
  in flow, so a long description grows it instead of being clipped. Below 769px
  (and in a short landscape viewport) the panel sits BELOW the band with no
  overlap. `scrim` is not decoration: category photography is an unchosen
  Picsum seed, and 8% white at 20px blur over a bright one is a contrast failure
  waiting for a reseed. Props `category, trail, countLabel, concerns, titleId`.
- `pages/Rituals/Rituals.{js,module.css}` (new): `/rituals`. `SectionHeading
  as="h1"` — eyebrow "Rituals", "Curated **routines**" (`gradientWord={1}`),
  lede "Three ways to use the Black Rice range in the order it was designed
  for." — then one full-width `GlassCard strong` per routine: a 16:10 stage on
  the left from 900px (stacked above on a phone), and on the right the
  "Ritual · N steps" eyebrow, the name, the tagline in gold italic, the story, a
  strip of numbered step plates, the duration and `Button variant="primary"`
  "See the ritual" (`aria-label` "See the ritual: {name}" — three identical link
  names are three links to nowhere in particular). The stage's `<img>` is
  ABSOLUTE so it contributes no intrinsic height: the seeded 1200×1500 images
  left in flow made a 470px story into a 670px card. One `Promise.all` over
  `rituals.getAll()` + `products.getAll()`; three states (3 skeletons · a failed
  panel · "No routines yet").
- `pages/Rituals/RitualDetail.{js,module.css}` (new): `/rituals/:slug`, split
  the same way as `Shop` and for the same `useSeo` reason — `RitualDetail` reads
  and 404s, `RitualDetailView` owns the head. Head: `Breadcrumb`, eyebrow
  `ritualEyebrow()` ("Ritual · 4 steps · About five minutes"), `<h1>`, the
  tagline, the story through `ContentBlocks variant="editorial"` and a 4:5
  placeholder photograph on the right from 1025px. Then the steps as an `<ol>`
  of `RitualStep`, then the CTA panel, then `LegalNote compact`.
  **THE PAGE OWNS THE CHOICES**: a `{stepOrder: productId}` map, reset when the
  ritual changes, so the panel spends whatever the visitor picked.
  `GlassCard strong glow="duo"` — eyebrow "Everything you need", the ritual's
  name, "From ₹X for the priced steps" (only when `priced > 0`; TBA products are
  never summed), then **"Add the whole ritual to cart"** behind
  `brand.flags.enableRitualBundles` **AND** `priced > 0` — a bundle button that
  can only answer "none of these are on sale yet" is a dead control — calling
  `useCart().addMany(chosen.filter(isPriceKnown).map(buildCartItem))`, else
  **"Shop each step"**, which scrolls to the first row and moves focus into it.
  Secondary "Browse all rituals". `jsonLd: [breadcrumbJsonLd, itemListJsonLd]`
  over the CHOSEN step products. Exports `ritualEyebrow` and `ritualTotal`.
- `components/catalogue/RitualStep.{js,module.css}` (new): one `<li>` per step —
  grid `72px 1fr` on a phone, `96px 240px minmax(0,1fr) auto` from 769px. A 36px
  `Chip variant="step"` numeral, a 1:1 `.sf-plate` label crop linking to the PDP
  (`stageSrc(product,{w:480})`), the name in Fraunces 22 (also a link — the
  plate-and-name contract `ProductCard` already follows), the product's
  `promise`, the step's `note` in display italics, a `frequency` chip, `Price`
  and `Button variant="addToCart" size="sm"` (disabled, "Coming soon", when
  TBA). **The connector** is one absolutely positioned gradient hairline per row
  running the full row height at the numerals' centre line, with the opaque
  numeral punched over it — drawn that way rather than as a stub under each
  numeral so it meets the next row's at the shared edge whatever either row
  contains; `data-first`/`data-last` trim the two ends, and the row's own seam
  is inset past the numeral column so the thread crosses it unbroken.
  **The alternative** is a real `radiogroup` (roving tabindex, arrows, Home/End)
  whose labels come from the catalogue's `shortName` — the seeded pair reads
  "Goat Milk Soap / Body Wash", and a component that typed "Bar / Wash" would be
  describing today's seed. Controlled via `selectedProductId` + `onSelect`, with
  its own state when nobody lifts it. Exports `stepNumeral`, `stepActionLabel`,
  `choiceLabel`.
- `components/Breadcrumb/Breadcrumb.{js,module.css}` (rewritten; it had **no
  consumers** — every page rolled its own `<nav>`): `items` is now the FULL
  trail including Home, as `{label, to}`, rendered as an `<ol>` whose last crumb
  is never a link and carries `aria-current="page"`; separators are
  pseudo-elements. **The same array is passed to `breadcrumbJsonLd`**, so the
  crumb a visitor reads and the crumb a crawler is told about cannot drift.
  Targets: 24px at every width, 44px ≤768px.
- `utils/seo.js`: adds `breadcrumbJsonLd(items)` — a `BreadcrumbList` over the
  same `{label, to}` array, absolute URLs on `seoOrigin()`, the final crumb
  positioned but URL-less, `null` for an empty trail. Prompt 27 adds `Product`.
- **`App.js`**: `/rituals` → `pages/Rituals/Rituals`, `/rituals/:slug` →
  `pages/Rituals/RitualDetail`, both lazy. The static `/category/rituals`
  redirect route is **gone** — the page owns that rule now (by slug AND by
  `kind`), so there is one place to keep it in step rather than two.
- `components/catalogue/index.js`: `CategoryHead` and `RitualStep` exported.
- **Tests**: `components/catalogue/RitualStep.test.js` (21) covers
  `stepNumeral`, `stepActionLabel`, `choiceLabel`, `ritualEyebrow`,
  `ritualTotal`, `concernsOf` and `breadcrumbJsonLd`.

**Updated by Prompt 25.** The PDP skeleton. `/product/:slug` is a **sticky media
column beside a scrolling column of chapters**; the tab strip, the textile spec
machinery, the promises band and the app's last hand-rolled `<head>` effect are
gone. Prompt 26 replaces the media placeholder with the real gallery; Prompt 27
writes the remaining chapters and the product JSON-LD.

- `pages/ProductDetails/ProductDetails.js` (1143 → 693) +
  `ProductDetails.module.css` (1109 → 161): **split in three**, the same shape
  `/shop` uses. `useProductPage()` holds the slug/legacy-id resolution with its
  canonical redirect, the `recentlyViewed` write (cap 20), the reviews and AOV
  reads, the variant/stock/quantity derivation and the cart handlers;
  `ProductDetailsView` owns `useSeo` and the markup; `ProductDetails` takes the
  three states (skeleton · `<NotFound/>` · the page) so **exactly one `useSeo`
  is ever mounted on the route**. Head:
  `useSeo({ title: productSeoTitle(product), description: metaDescription ||
  promise || shortDescription, image: stageSrc(product,{w:1200,ar:"1:1"}),
  type: "product" })` — `productSeoTitle()` strips the site suffix a stored
  `metaTitle` already carries, because `useSeo` applies
  `brand.seo.titleTemplate` itself. **Layout**: `sf-container sf-container--wide`
  (BOTH classes — `--wide` only raises `max-width`), one column below 769px with
  the media first, `44fr / 56fr` at 32px from 769px, `1.05fr / 1fr` at 56px from
  1025px where the media column is `position: sticky; top: 96px`. The media is a
  local `MediaGalleryPlaceholder` — one `CloudinaryImage` with the product's own
  crop padded to **4:5** on a `.sf-plate` (1:1 box on a phone, 4:5 from 769px).
  Chapters: `overview` (description through `ContentBlocks`, then the
  `suitableFor` line), plus the retained FAQ accordion (`ui/Accordion` over
  `useFaqs().forProduct`), `ReviewsSection` and the two cross-sell rails.
  Exports `productSeoTitle`.
- `components/pdp/PurchasePanel.{js,module.css}` (new): the commerce column —
  `Breadcrumb` · category link + ritual step + flag marks · `h1`
  (`--sf-text-3xl`) · `promise` · `SocialProof` **only when
  `totalReviews > 0 || reviews.length > 0`** · `Price product size="lg"` with
  the `fillCopy` tax note · size / fragrance / SKU as a two-column `<dl>` ·
  `TrustBadges variant="chips"` · `VariantSelector` (only where variants exist) ·
  `QuantityStepper` + the stock line · `Button variant="addToCart"` (idle /
  success / "Coming soon" / "Out of stock") and `variant="primary"` "Buy now"
  (absent, not disabled, when there is nothing to buy) · wishlist and share
  `variant="icon"` circles · `DeliveryReturnsInfo` · `LegalNote compact` +
  "Read our story" → `/about`. `GlassCard padding="lg"`, with the glass taken
  off below 769px. **It owns no data** — everything arrives as props, because
  the sticky bar, the head and the chapters need the same answers. `ctaRef` is
  the anchor the sticky bar observes. Share is `navigator.share`, else the
  clipboard, with a "Link copied" toast either way. Exports `stockLabel`,
  `ritualStepLabel`.
- `components/pdp/ChapterNav.{js,module.css}` (new): `chapters=[{id,label}]`,
  rendering nothing below two. A glass pill bar (40px pills, 13px, active gold
  over a gradient underline) revealed past **320px** of scroll
  (`visibility`/`opacity`, so nothing reflows), sticky at `top: 72px` from
  1025px and `56px` below, horizontally scrolling with the active pill kept in
  view, hidden while `body[data-drawer-open]`. Pills are `<a href="#id">` with
  `aria-current`; the click handler upgrades the jump and moves focus into the
  section. The active chapter comes from ONE IntersectionObserver with a reading
  band (`rootMargin: "-30% 0px -55% 0px"`), first-in-document-order wins.
  Exports `REVEAL_AFTER`.
- `components/pdp/Chapter.js` (new, no stylesheet): `<section id tabIndex={-1}
  aria-labelledby>` on `.sf-section--tight` with a `SectionHeading as="h2"`
  (eyebrow "Chapter 0N", `rule`). The SECTION is the focus target, so a jump
  lands inside the chapter. Exports `chapterNumeral`, `chapterHeadingId`.
- `components/storefront/AddToCartBar.{js,module.css}` (rewritten): strong glass
  over a `color-mix(--sf-color-surface 92%)` ground, a **56px plate**
  thumbnail (dropped below 400px), the name on one line, `Price` (TBA-aware) and
  `Button variant="addToCart"` with an optional Buy-now icon button. New props
  `product` · `variant` · `outOfStock` · `comingSoon` · `added` (the numeric
  `price`/`comparePrice` pair still works for a caller with no product record).
  The `anchorRef` IntersectionObserver contract is unchanged; `--sf-z-stickybar`
  and `env(safe-area-inset-bottom)` are unchanged. **≤ 768px only.**
- `components/storefront/DeliveryReturnsInfo.js`: every line is dropped until
  its fact is known — a method needs `hasDeliveryEstimate()` (exported), COD
  needs `codEnabled`, returns need a positive window, and the tax line is
  `fillCopy("Prices are {taxNote}.")` (new optional `fillCopy` prop) so an
  unresolved rate loses its sentence. Rows restyled to 14px with gold glyphs.
- `components/storefront/TrustBadges.js`: third variant **`chips`** — glass
  pills that wrap, 16px gold mark, beside the existing `grid` and `row`.
- `components/storefront/SocialProof.module.css`: the figure is gold, the count
  moves to `--sf-color-text-secondary`.
- `components/Breadcrumb/{Breadcrumb.js,.module.css}`: 12px; only the LAST crumb
  takes the current-page style (a linkless crumb mid-trail is plain text); the
  last crumb wraps rather than truncating below 769px.
- `components/BottomNav/BottomNav.js`: exports `hidesBottomNav(pathname)` and
  returns `null` on `/product/*` (after every hook) so the tab bar and the PDP's
  sticky purchase bar can never stack — Adaptation 18 in `00_INDEX.md`. The
  SearchModal it mounts goes with it; the masthead still carries search.
- **Tests**: `components/pdp/PurchasePanel.test.js` (15) covers `stockLabel`,
  `ritualStepLabel`, `chapterNumeral`, `chapterHeadingId`, `hasDeliveryEstimate`,
  `productSeoTitle` and `hidesBottomNav`.

**Updated by Prompt 26.** The PDP's media column is the real gallery, and the old
brand's `ProductGallery` is gone with it. `product.media` — one ordered mix of
images and videos — is rendered by **one** index, **one** counter, **one** rail
and **one** set of arrows; the lightbox shares that index rather than keeping a
second one.

- `components/pdp/MediaGallery.js` (441) + `.module.css` (324): **new**. Props
  `{ product, media = productMedia(product), initialIndex = 0 }`; state `index`,
  `showFull`, `lightboxOpen`. Mount it with `key={product.id}` (ProductDetails
  does) — that is the whole reset story for a walk between products. Exports the
  four pure rules `counterLabel`, `toggleLabel`, `thumbLabel`, `thumbSource` and
  `stepIndex`.
  - **Stage**: `.sf-plate` at `aspect-ratio: 1` to 768px and `4 / 5` from 769px,
    `--sf-radius-xl` + hairline + `--sf-shadow-2`, inside
    `GlowWrap tone="gold" intensity={0.14}` (the primitive clamps to 0.15).
    `role="group" aria-roledescription="carousel" aria-label="{name} media"`,
    `tabIndex=0`; ←/→/Home/End and Enter/Space, and ONLY while the stage itself
    holds focus (`event.target !== event.currentTarget → return`), because
    `VideoPlayer` inside it owns Space/M/←/→ when IT is focused.
  - **One row mounted at a time**: an `AnimatePresence` crossfade keyed on the
    index, `DURATION.base` for a photograph and `INSTANT` for a film leaving, so
    a video element (and its audio) is gone the instant the index moves. Images
    take `CloudinaryImage` with `crop` + `ar="4:5"` + `pad` while
    `!showFull && row.crop`, otherwise the uncropped file, `fit="contain"`,
    `sizes="(max-width: 768px) 100vw, 48vw"`, `priority` on the first image
    (the PDP's LCP). Videos take `VideoPlayer` with
    `poster = row.poster || primaryImage(product).url`, `preload="metadata"`,
    muted, with the player's own mute toggle and click-to-play.
  - **Furniture**: the "Full label / Front panel" pill (32px, `aria-pressed`,
    only where the row has a `crop`, reset on every index change, with a 44px
    hit area from an inset `::after`), the "Zoom" circle (image rows only), the
    `aria-live="polite"` counter `"{i+1} / {n}"`, and 44px `Button variant="icon"`
    arrows revealed by `:hover` / `:focus-within` (`opacity` only, never
    `visibility`, so they stay tabbable) and always visible under
    `@media (hover: none)`.
  - **Rail** (one element, placed by grid): `role="tablist" aria-label="Product
    media"`, tabs with `aria-selected` and `aria-controls` on the stage id,
    roving tabindex, ←/→/↑/↓/Home/End moving selection AND focus, the active
    thumb scrolled into view with `block/inline: "nearest"` (never on first
    paint). 56px snap strip below the stage to 1024px; 72px column in
    `grid-template-columns: 72px minmax(0,1fr)` with a 16px gutter from 1025px.
    Image thumbs carry the row's own crop at `w_144`; video thumbs take the
    poster with a gold play mark and `aria-label="Video: {title}"`.
  - **Degrades**: one image and no video → no rail, no arrows, no counter, no
    dots. Zero videos needs nothing special.
- `components/pdp/Lightbox.js` (448) + `.module.css` (249): **new**, no library.
  Built on `ui/Modal size="full"` (portal, `aria-modal`, focus trap + restore,
  Escape, scroll lock, close on navigation) with the panel repainted flat —
  `color-mix(in srgb, var(--sf-color-bg) 96%, transparent)`, **no** backdrop
  filter — through a doubled class (`.panel.panel`). Props
  `{ open, onClose, media, index, onIndexChange, product, zoom }`; `index` and
  `onIndexChange` are the gallery's own state. Images at `cld(url,{w:2000})`
  **uncropped**, `max-height: min(92svh, 100%)`; videos take `VideoPlayer`.
  Controls are 48px: counter top-left, Close top-right, Previous/Next at the
  sides, the ± bar and the keyboard hints at the foot (desktop only). Zoom is
  wheel (non-passive listener), pinch (two pointers, their distance ratio), the
  ± buttons and double-click/double-tap, **1×–4×**, anchored on the pointer, with
  the pan offset clamped by `panBounds()`. Exports `clampScale` and `panBounds`.
  Focus returns to the gallery's "Zoom" button (the stage when the item closed on
  was a film).
- `hooks/useSwipe.js` (108): **new**.
  `useSwipe(ref, { onLeft, onRight, threshold = 40, enabled = true })`. Pointer
  events, so a mouse drag and a finger swipe are one path; writes
  `touch-action: pan-y` onto the element and restores it on cleanup; cancels
  `dragstart` (an `<img>` is draggable by default and a native image drag kills
  the gesture); reads the release on `window` because a flick ends past the
  element's edge; counts a gesture only when `|dx| > |dy|` and `|dx| >=
  threshold`. `enabled: false` removes the listeners — the lightbox stands the
  swipe down while a picture is zoomed, where the same drag means "pan".
- `components/ui/Modal.module.css`: `.full .body` gained `flex: 1 1 auto`. A
  `size="full"` panel is a whole `100svh` but its body was content-height, so any
  `flex: 1` region inside it (the lightbox's picture, `SearchModal`'s result
  list) had nothing to grow into and collapsed to zero.
- `theme/tokens.js`: `STOREFRONT_CONFIG.gallery` is now
  `{ zoom: true, lightbox: true }` — `zoom` gates the lightbox's zoom controls,
  `lightbox` gates the viewer and the "Zoom" button that opens it. The old
  `thumbnailPosition` is gone: the rail's position is a breakpoint.
- `pages/ProductDetails/ProductDetails.js` (693 → 662): the Prompt 25
  `MediaGalleryPlaceholder` is deleted; the media column is
  `<MediaGallery key={product.id} product={product} />`. `.stage` in the page's
  module is now the loading skeleton's block only.
- **Deleted**: `components/storefront/ProductGallery.js` and
  `ProductGallery.module.css`, and their `storefront/index.js` export.
  `grep -rn "ProductGallery|thumbnailPosition" src` → 0.
- **Tests**: `components/pdp/MediaGallery.test.js` (17) covers `counterLabel`,
  `stepIndex`, `toggleLabel`, `thumbLabel`, `thumbSource`, `clampScale`,
  `panBounds`, and four renders of the gallery itself (tablist semantics and the
  named clips; the stage moved by rail/arrow/keyboard; the toggle appearing only
  where a crop exists; a one-image no-video product).

**Updated by Prompt 27.** The PDP is finished: **nine chapters**, the three
retained blocks rewritten, and the `Product` + `BreadcrumbList` graphs in the
head. Every chapter is optional and every one of them prints DATA — the only
copy this prompt types is section furniture.

- `pages/ProductDetails/ProductDetails.js` (662 → 957) +
  `ProductDetails.module.css` (161 → 218). **Chapters**, in document order and
  each absent from the page AND from `ChapterNav` when the product has nothing
  for it (both lists read one set of booleans, computed once):
  `overview` · `benefits` · `ingredients` "Key ingredients" · `how-to-use` ·
  `farmer-story` "The farmer story" · `full-ingredients` · `faqs` · `reviews`
  (always) · `complete-the-ritual`. Benefits are a two-column list from 769px
  with gold `mdi:check-circle-outline` marks; full ingredients are the INCI
  string inside a closed `Accordion` ("Read the full INCI list") over a "Good to
  know" row — `suitableFor[]` plus the shelf life ONLY once
  `brand.productDefaults.shelfLife` stops being `{{SHELF_LIFE}}`. The
  `suitableFor` line moved out of `overview` into that row rather than printing
  twice. FAQs now mount `components/FAQ/FAQ` (the storefront's one accordion)
  instead of a local `Accordion`, so the PDP gets its keyboard model, its
  `#faq-<id>` deep links and its store-figure tokens.
- **One `Promise.all`, six independent catches** (`fetchChapterData`, replacing
  `fetchAov`): reviews, `getRelated`, `getFrequentlyBoughtTogether`,
  `rituals.getAll()` and `siteContent.get("about"|"home")`. A failure degrades
  its own chapter only. `RitualCard`'s step thumbnails resolve against
  `[product, ...related, ...bundle]` — `getRelated`'s last pass sweeps the brand,
  so on a catalogue this size that IS the catalogue and the page needs no
  seventh request.
- **Head**: `useSeo({ …, jsonLd: [breadcrumbJsonLd(trail), productJsonLd(…)] })`.
  `trail` is the same array the visible `Breadcrumb` draws.
- `utils/seo.js` (93 → 245): **`productJsonLd(product, { url, category, rating,
  ratingCount })`** — `name`/`image`/`description`/`sku`/`brand`/`category`, and
  three claims that are published only when the shop can back them: `offers`
  only where `isPriceKnown(product)` (five of eight products are `priceTBA`),
  `availability` only where `stock` is an actual number (`Number(null)` is 0, and
  0 would publish "out of stock" for a product nobody counted), `aggregateRating`
  only where a real average AND a real count exist — so on a fresh install no
  graph carries it. The rating is the PAGE's blended pair, rounded to the one
  decimal the page prints. `breadcrumbJsonLd` now accepts `{ name, url }`
  alongside the trail's `{ label, to }`; both spellings produce the same graph.
- `components/pdp/PackClaims.{js,module.css}` (new): the **"As printed on the
  pack"** block — the one place on the storefront that quotes rather than
  claims, and therefore the only place the carton's "anti-ageing antioxidants"
  line appears. `packClaims[]` as a 14px muted ledger (no ticks, no gold — a tick
  would read as endorsement), `fragranceNote`, `brand.packBadges` as
  `Chip variant="trust"` with every `isPlaceholder` badge dropped, and `caution`
  through `ContentBlocks`' own `::callout Caution` fence with a gold left
  hairline. Exports `packBadgesToShow`, `cautionMarkup`, `PACK_EYEBROW`.
- `components/pdp/IngredientChapter.{js,module.css}` (new): `keyIngredients[]`
  as `GlassCard`s — name in the display serif at 20px, benefit at 14px — 1-up to
  768px, 2-up to 1024, 3-up from 1025. Black rice is lifted to the front of the
  row by a STABLE partition (the admin's order survives around it) and wears the
  gold hairline; then `PackClaims`. Exports `orderedIngredients`,
  `isHeroIngredient`.
- `components/pdp/HowToUse.{js,module.css}` (new): `howToUse[]` as an `<ol>` with
  `Chip variant="step"` numerals, the "Ritual step" plate
  (`ritualStep.order/label/frequency`, gold leading edge), and "Part of these
  rituals" — the routines whose `steps[].productId` **or**
  `alternativeProductId` names this product, as `RitualCard compact`. Exports
  `ritualsWithProduct`, `stepOrderLabel`.
- `components/pdp/FarmerStory.{js,module.css}` (new): two sentences from
  `siteContent.about.lede` + the About teaser, `ValueChain compact
  orientation="vertical"`, `LegalNote`, `Button variant="ghost"` → `/about`. Two
  decisions: the teaser's FIRST paragraph is the lede with "(FPC)" dropped, so
  `farmerStoryLines` skips a paragraph whose WORD SET is ≥80% the lede's and
  takes the next (a substring test cannot catch it — the two differ in the
  middle); and the orientation is named because `auto` decides from the VIEWPORT
  and at ≥1025px would lay seven steps in a row inside a half-viewport column,
  which gave the whole page a horizontal scrollbar. Exports `farmerStoryLines`.
- `components/storefront/ReviewsSection.{js,module.css}`: summary plate is now
  `.sf-glass` (the section's ONE blurred layer), the distribution bars take
  `--sf-gradient-gold`, and each review is a hairline card on
  `--sf-color-surface`. Empty state — the normal state on this range — is "No
  reviews yet / Reviews are written by customers from My Orders after delivery."
  A row that arrives with `brand.flags.showSampleReviews` on wears a dashed
  border and a "Sample" mark, which is what makes the flag safe to flip. Exports
  `NO_REVIEWS_LINE`, `NO_REVIEWS_NOTE`. Props unchanged.
- `components/storefront/FrequentlyBoughtTogether.{js,module.css}`: retitled
  **"Complete the ritual"** ("The next steps of the routine, chosen for this
  product."), with new `title`/`note` props — the PDP passes `title={null}`
  because its chapter heading already carries it. A companion with no price is
  rendered **unticked and disabled** behind the shared "Price on launch" chip
  (`ui/Price`), and the total is the sum of the TICKED rows only; with nothing
  ticked the total row is dropped entirely and the button reads "Nothing to add
  yet" rather than offering ₹0.00. The plates take `.sf-plate` (contain, not
  cover), each `+` travels with the tile it adds so a wrapped row never ends on a
  dangling mark, and the 900px viewport split is gone for the same reason the
  value chain's was. Exports `FBT_TITLE`, `FBT_NOTE`, `FBT_EYEBROW`.
- `components/storefront/RelatedProducts.{js,module.css}`: new `headingLevel`
  (the PDP passes `h3` under the chapter's `h2`) and `className`. The rail gains
  edge fades as a **`mask-image`, lifted under `:focus-within`** — a painted veil
  would dim a card's focus ring exactly when a keyboard visitor scrolled it to
  the edge, which is why the rail had none.
- `utils/faqs.js`: `faqsForProduct` gives an inline `product.faqs` row an id
  (`p<productId>-<index>`) when it has none. Every inline row previously
  answered to the anchor `faq-`, so under the shared `FAQ` component opening one
  would have opened all of them.
- **Tests**: `components/pdp/PdpChapters.test.js` (26) covers
  `packBadgesToShow`, `cautionMarkup`, `orderedIngredients`, `isHeroIngredient`,
  `ritualsWithProduct`, `stepOrderLabel`, `farmerStoryLines`, `productJsonLd`
  (offers/availability/aggregateRating gating, image order) and
  `breadcrumbJsonLd`'s two vocabularies.

**Updated by Prompt 28.** The content pages are `siteContent`, typeset. Five
routes, **not one narrative sentence in JSX**, and **seven old page folders
deleted** (6,844 lines).

- `pages/About/About.{js,module.css}` (new): opening band —
  `clamp(280px, 36vw, 480px)` letterbox from 769px with a `GlassCard strong
  scrim` panel risen into its lower-left corner on a negative margin (the same
  composition as `CategoryHead`), stacked below a 4:3 plate on a phone. Then the
  story: `siteContent.about.body` parsed once and rendered in **runs broken at
  the `::steps` fence**, so the seven-step chain is drawn by `ValueChain` and not
  by the generic stepper; runs after the first pass `dropCap={false}` (a page
  opens on one drop cap, not one per run). Then the `image2` plate,
  `ImpactTriptych showImages` from `siteContent.impact`, `Pillars compact`,
  `LegalNote`, and a CTA row (`ctaLabel` → `ctaTo`, secondary → `/why-lamikaa`).
  `useSeo({ title: "Our Story", description: lede, jsonLd: breadcrumbJsonLd })`.
  Exports `splitAtChain`, `aboutCopy`.
- `pages/WhyLamikaa/WhyLamikaa.{js,module.css}` (new): the same opening band,
  then the philosophy + `Pillars` (from `brand.pillars`, not from the record —
  pillars are BRAND facts), `#difference` (the six-step **ownership** chain
  through `ContentBlocks`' own stepper, because it is not `brand.valueChain` and
  `ValueChain` exists so the canonical seven cannot be invented) + `LegalNote`,
  `#impact` (`ImpactTriptych showImages` + an `Accordion` carrying each item's
  FULL body, named "Read more: Financial/Social/Environmental"), `#vision` as a
  pull-quote, and the CTA row. The three ids are real ids on real `<section>`s
  and `#impact` renders its heading while the copy is in flight, so a cold load
  on `/why-lamikaa#impact` has something to scroll to. Exports `whyCopy`,
  `impactDisclosures`. **Replaces the `ComingSoon` stub.**
- `pages/Faq/Faq.{js,module.css,test.js}` (new, replaces `HelpCenter/`): head +
  a **52px search** filtering question OR the FILLED answer with a
  `role="status"` count (ported unchanged); a **200px group rail sticky at
  112px** from 1025px, a horizontally scrolling chip strip below that, anchors
  `#group-<key>`; one `<FAQ>` per group over `faqsForGroup` on
  `forPlacement("help")`, only for groups with rows; a closing band whose email
  and phone appear only when they resolve. `FAQPage` JSON-LD built from the same
  prepared text the accordion renders, describing the whole page rather than the
  current search. `faqSections()` (exported, tested) adds a trailing **"More
  questions"** group so renaming a heading in the admin cannot drop an answer.
- `pages/Contact/Contact.{js,module.css}` (new, replaces `Support/`): head,
  channel cards (Email / Call / WhatsApp, each rendered **only when its href
  resolves**), the lead form **unchanged in behaviour** — the seven-key payload
  (`name, email, phone, orderNumber: "", category: "general", subject,
  message`), `MESSAGE_MIN = 20`, optional phone checked only once typed,
  first-invalid focus, email pre-fill for a signed-in visitor, a glass success
  panel that takes focus — restyled onto the design system's 48px input; and a
  rail carrying a Visit card (only when the address resolves, with a Maps link
  built from it), `Pillars compact`, the social marks and "Read the FAQ".
  Exports `buildChannels`.
- `pages/Policies/PolicyPage.{js,module.css,test.js}` (new, replaces the four
  policy folders): **one component for four documents**, `useParams().policy` ∈
  `privacy | terms | shipping-returns | cookies` → `siteContent.policies[key]`
  (`shippingReturns` for `shipping-returns`), anything else → `NotFound`. The
  document look — kicker, serif title over a hairline, "Last updated" (only
  where a record HAS an `updatedAt`), a **220px TOC rail sticky at 112px**,
  clauses numbered `01…` with the ordinal hung into the gutter from 1280px, a
  colophon and cross-links to the other three. The route component is split from
  the document component so the 404 can return before any hook claims the head.
  Exports `POLICIES`, `policyBySlug`, `clauseTitle`, `clauseNumeral`,
  `toClauses`.
- `utils/policyClauses.js` (new) + `.test.js`: the clauses a policy cannot carry
  in stored prose, emitted as markdown-lite so they typeset and number like the
  stored ones. `taxClause` / `codClause` / `returnsClause` →
  `termsPricingBlock()` appended to **Terms** (clause 11);
  `shippingMethodsBlock(methods)` appended to **Shipping & Returns** from
  `shipping.getMethods()`. **Every builder returns `""` when it has nothing true
  to say**, and no builder prints a rate — the old Terms page's three hard-coded
  rupee rows (₹99 / ₹199 / ₹499) are gone and cannot come back.
- `hooks/useSiteContent.js` (new): the five pages' shared read of `siteContent`,
  on `useHomeData`'s tri-state contract (`undefined` in flight, `null` missing or
  unreadable, value ready), de-duplicating the StrictMode double mount and
  caching nothing.
- `ui/ContentBlocks.js`: additive `dropCap` prop (default `true`) for a body
  rendered in more than one run. `utils/seo.js` (245 → 288): **`faqPageJsonLd`**,
  which drops any row with no question or nothing publishable left in its answer.
- `App.js`: `/about` · `/why-lamikaa` · `/faq` · `/contact` and **one param
  route** `ROUTES.POLICY` (`/policies/:policy`) for the four documents; seven
  lazy imports retired, five added. The four explicit `ROUTES.POLICY_*`
  constants stay — every LINK still names its document, and `LegacyRedirects`
  still maps `/privacy`, `/terms`, `/refund`, `/cookies` onto them.
  `utils/constants.js` loses `WHY_CHOOSE_US` and `POLICY_LAST_UPDATED` with the
  pages that were their only consumers.
- **Deleted**: `pages/{AboutUs,HelpCenter,Support,PrivacyPolicy,TermsOfService,CookiePolicy,RefundPolicy}/`.
  Four of those shared one "document" stylesheet as four copies whose own header
  said any change had to be pasted into the other three; there is one now.
- **Tests**: `utils/policyClauses.test.js`, `pages/Policies/PolicyPage.test.js`,
  `pages/About/About.test.js`, `pages/Faq/Faq.test.js` — 37 assertions covering
  the "" answers, the no-rate rule, clause numbering by position, anchor
  uniqueness, the chain split and "no answer disappears when a heading is
  renamed".


**Updated by Prompt 29.** The cart has a page, and the checkout wears the design
system without a single number moving.

- `pages/Cart/Cart.{js,module.css}` (482 + 508, **new** — it replaces the last
  `ComingSoon` stub, so `grep -n "ComingSoon" src/App.js` is now **0** and the
  folder is Prompt 31's to delete). `useSeo({ title: "Your cart", noindex: true })`;
  `SectionHeading as="h1"` — eyebrow "Cart", title "Your cart", lede "{n} items".
  From 1025px a `1.4fr 1fr` grid: the lines on the left (a 96px plate, 112px from
  1025px; the name links to the PDP; variant, unit price, `QuantityStepper` capped
  by real stock, line total, and a remove mark taken OUT of the flow so the plate
  sets the row height; `AnimatePresence` collapses a removed row rather than
  letting the list jump), then the cross-sell; on the right a sticky
  `GlassCard strong` at `top: 96px` carrying subtotal, the drawer's coupon
  disclosure gesture for gesture (collapsed until asked for, held open while it
  has something unread to say, auto-dropped with a note below the coupon's
  minimum), the discount row, "Shipping and taxes calculated at checkout",
  `Button primary block` Checkout → `/checkout`, `Button ghost block` Continue
  shopping → `/shop`, and `LegalNote compact`. **No Total** — the page does not
  know the delivery address, and the tray already refuses for the same reason.
  Below 769px: one column, the summary card after the items, and a 64px
  `sf-glass sf-glass--strong` thumb bar (Subtotal + Checkout) at
  `--sf-z-stickybar`. Empty: eyebrow "Your cart is empty", a `GlassCard` (Prompt
  31 formalises `ui/EmptyState`), "Continue shopping", and the cross-sell's
  "Start with".
- `components/cart/CrossSell.{js,module.css}` (216 + 111, **new**): "Complete
  your ritual" extracted from `CartDrawer` — `crossSellFor` (the three-tier
  ranking, still unit-tested, now imported by `CartDrawer.test.js` from here) and
  the 56px-plate row, plus the `addToCart(…, { openDrawer: false })` that keeps a
  drawer from popping over the surface the shopper is already reading. The caller
  owns the CATALOGUE (`products` is a prop, so the tray keeps its ref cache) and
  the FRAME (`.cross` sets no padding and draws no seam; the tray's `.crossSlot`
  and the page's `.cross` supply those). `variant: "drawer" | "page"` picks a
  column or an `auto-fit` 260px grid. `CartDrawer.js` 736 → 600 and its sheet
  569 → 514; **its public props, its motion and its money are untouched.**
- `pages/Checkout/Checkout.module.css` **rewritten from scratch**, 2 107 → 1 492.
  It dresses `ui/Button`, `ui/Chip`, `ui/GlassCard`, `ui/SectionHeading`,
  `.sf-plate` and `.sf-hairline` and adds only what a shared class cannot know.
  `grid-template-areas` says once that the nav row is under the CONTENT column
  and never under the rail: `"steps rail" / "nav rail"` at `minmax(0,1fr) 320px`
  from 769px, `minmax(0,1fr) 380px` with a 48px column gap from 1025px, one
  column with the collapsible summary band below. Step chips 36px, option cards
  64px, inputs 48px, CTAs 52px pills. `.card` / `.railCard` / `.credit` drop
  their backdrop filter under 769px (three blurred cards over a scrolling page is
  one more than DESIGN_SYSTEM §4 allows).
- `pages/Checkout/Checkout.js` (1 662 → 1 715): **markup, class names and copy
  only.** Four `Chip variant="step"` numerals joined by gradient hairlines with a
  gold check behind you and `aria-current="step"`; one `GlassCard padding="lg"`
  per step; every radio and checkbox a real control clipped inside a `<label>`
  option card that shows focus through `:focus-within` and selection through a
  gold ring AND a filled indicator; store credit as the page's one violet-glow
  card; payment methods as cards that open their own mock form; the rail as a
  sticky `GlassCard strong` / collapsible glass bar with item plates, subtotal,
  discount, shipping, tax, COD fee, total, store credit and amount payable; a
  `Button ghost` Back beside one primary CTA ("Continue to shipping" /
  "Continue to payment" / "Review order" / "Place order"). Copy: the silk-
  packaging line, the "choose a weave" empty state and the loom illustration are
  gone, "pieces" is "items", `currencySymbol` from settings replaces the
  hard-coded `&#8377;`, the phone placeholder is "+91 …", and the tax line is
  "Tax" + `fillCopy("Prices are {taxNote}.")`.
- **PRESERVED, and diffed byte-for-byte to prove it**: the money block (subtotal
  → coupon → shipping → taxable base → tax inclusive/exclusive → total →
  `maxApplicableCredit` → `storeCreditApplied` → `amountPayable` → `fullyCovered`
  → the COD bounds and force-reset → `codFee` → `amountDue`), the whole
  `orderData` payload, `STEPS`, `couponDiscountFor`, `describedBy`, `etaFor`,
  `applyCoupon`/`removeCoupon`, `validateAddress` (all seven required fields),
  `PAYMENT_OPTIONS` and `assurances` — all **IDENTICAL**. Country is still a
  read-only "India" (an owner decision logged in `PROGRESS.md` to revisit before
  shipping abroad).
- **Two additive guards, the only logic added.** (1) A TBA guard at step 0 —
  `isChargeable()` is `Number.isFinite(price) && price > 0`; a failing line is
  removed with a toast and the step does not advance. The UI cannot create one
  (`buildCartItem` throws `PRICE_TBA`), a cart restored from localStorage or
  merged from the API can, and a zero-price line would check out free. (2) A
  `role="alert"` failure panel — "We couldn't place your order. Nothing was
  charged. Please try again." with a Try again button, wired to BOTH the `catch`
  and `result.success === false`, because `OrderContext.createOrder` catches its
  own failures and returns rather than throwing.
- `components/BottomNav/BottomNav.js`: `hidesBottomNav()` now covers
  `pathname === ROUTES.CART` as well as `/product/*` — `/cart` grows its own
  64px bar below 769px and two stacked bars take 128px off a 640px screen.
  Asserted in `PurchasePanel.test.js`.


**Updated by Prompt 31.** Three shared states, one vocabulary, across every page.

- `components/ui/EmptyState.js` + `.module.css` and `components/ui/ErrorState.js`
  (both exported from `ui/index.js`) are **the** empty and failed cards. See §5
  for the anatomy. Every list page branches on **failed before `length === 0`**,
  so a dropped read is never reported as an empty answer — `SpecialOffers`,
  `Search`, `Rituals` and `RitualDetail` each gained the failed branch (or the
  retry) they did not have.
- The states now read, page by page: **Shop/Category** `EmptyState` + `ErrorState`
  + `NotFound` for an unknown slug · **Rituals** both, with a retry ·
  **RitualDetail** `ErrorState` taking the `h1` + `NotFound` · **Search** both,
  the popular-term chips now living inside the empty card · **Cart** and
  **Checkout** the same `EmptyState` (they are one screen apart and used to say
  the same thing in two type scales) · **OrderConfirmation** `ErrorState` +
  `EmptyState` · **OrderHistory** `EmptyState` ×3 (signed out, no orders, no
  match) + `ErrorState` · **Profile** `EmptyState compact` ×5 (recent orders,
  wallet, addresses, payment, notifications) · **Wishlist** `EmptyState`, the
  guest band above it unchanged · **SpecialOffers** `EmptyState` ×2 +
  `ErrorState` · **Faq** `EmptyState` (no error twin: `FaqContext` falls back to
  the built-in answers) · **NotFound** `EmptyState` with the "404" eyebrow ·
  **Contact** keeps its inline `role="alert"` errors, and **PolicyPage** its
  one-sentence "not published yet" note — both are prose registers a card would
  out-shout. The full checklist, with what each state cannot occur for and why,
  is in `PROGRESS.md`'s Prompt 31 record.
- **Loading is always a `Skeleton`.** `OrderConfirmation` was the last page-level
  spinner; with it gone the unreferenced global `.loading-spinner` and
  `@keyframes spin` came out of `App.css`. The four spinners left in the app
  (`AuthModal`, `ReviewModal`, `OrderHistory` reorder + cancel) are all inside a
  working button and keep their own keyframes beside the control.
- `src/pages/_ComingSoon/` is **deleted** — the Phase 0 scaffolding stub had had
  no route since Prompt 29. `grep -rn "ComingSoon" src` → 0.
- `src/utils/dealsConfig.js`: `DEFAULT_DEALS_HERO` and `DEFAULT_DEALS_TIMER` —
  what `/special-offers` prints before its config arrives and after a failed read
  — were the previous brand's promo voice over a countdown nobody set. They now
  match the seed ("Offers" / "Offers" / "Launch offers will appear here.") with
  `timer.enabled: false`. `normalizeDealsConfig` is untouched, so a real admin
  record behaves exactly as before.

## 7. Admin panel

- Shell `src/components/AdminLayout/AdminLayout.js` (1015): guard `useAdmin().isAuthenticated` → `<Navigate to="/admin" />`; 260 px MUI Drawer (temporary < 900 px, permanent ≥ 900) with sections Dashboard · Catalogue (Products, Categories, Reviews) · Sales (Orders, Returns, Payments, Coupons, Special Offers) · Storefront (Hero Section, FAQs) · Operations (Shipping, Users, Leads, Settings) · "Back to Store"; AppBar with theme toggle (shared `useThemeContext`), notifications (polls orders+leads every 30 s), avatar menu; `useAdminBodyClass()` adds `body.admin-area`; MUI theme from `buildAdminTheme(mode)` (indigo/slate, `#4f46e5`, `#0b1220`…); logo constants `LOGO_LIGHT/LOGO_WHITE` (old wordmark).
- `AdminLogin.js`: email/password, `useAdmin().login`, no demo hints, old logo, `buildAdminTheme(isDarkMode ? …)`.
- `AdminDashboard.js`: stats cards (`getDashboardStats`), recent orders, low-stock list, quick actions; 13 hex literals.
- `AdminProducts.js` (569): table (Product/SKU/Category/Price/Stock/Flags/Status/Actions), search by name/SKU/brand, category select, **no sort/pagination**; form `emptyProduct` = `{ name, slug, sku, shortDescription, description, categoryId, brand, images: [], price, comparePrice, costPrice, stock, lowStockThreshold: 10, weight, dimensions{length,width,height}, variants: [], tags: [], featured, trending, hot, isActive: true, metaTitle, metaDescription }`; **images = one multiline textarea "Image URLs (one per line)" → `images[]`** (unlimited, no preview, no primary picker, no alt text); tags comma-separated; variants rows `{id,name,price,stock,sku}`; validation: name, unique slug (`makeUniqueSlug`), price > 0 unless variants; save = `admin.createProduct` / `admin.updateProduct(id, {...editingProduct, ...editable})`; **no `relatedProductIds`/`frequentlyBoughtTogetherIds` UI**; placeholders "16GB / 512GB", "laptop, gaming, ultrabook".
- `AdminCategories.js`: name/slug/description/image URL/parent/sortOrder/isActive/showInMainMenu/menuOrder; cycle guard; delete blocked by children (client) or products (`CATEGORY_IN_USE`).
- `AdminHeroSection.js` (Prompt 07: ~1610): "Announcements (temporary)" tab + Section settings tab (`heroConfig`). Prompt 07 repointed the first tab at the `announcements` collection (CRUD, duplicate, up/down reorder, live preview) through `rowToSlide`/`slideToRow` adapters that preserve each row's `text` and its `startsAt`/`endsAt` window across a PUT, and replaced the Meghali gradient presets with the four design-system gradient tokens. Prompt 34 replaces the screen with a hero product-ordering editor plus a real announcements manager.
- `AdminFaqs.js` (1018): question/answer (+ token chips `{freeShipping}`, `{codSentence}`, `{taxNote}`), placements product/help/home, product Autocomplete, filters, reorder, `notifyFaqsUpdated()`.
- `AdminSettings.js` (920): General (store name/tagline/email/phone/address, currency + symbol, tax rate/included, COD) → `updateSettings("store")` + `("payment")` + `notifyStoreSettingsUpdated()`; Categories/Hero/FAQs pointer cards; Social Links → `updateSettings("social")`. **No logo/favicon field.**
- Orders/Returns/Payments/Users/Shipping/Coupons/SpecialOffers/Reviews/Leads: full CRUD/status flows as listed in the api table (refund lifecycle initiate/complete/fail, cancel with restock/refund/void/recall, returns approve/reject/pickup/in-transit/received/refund, payments issue refund, coupons with duplicate-code guard, reviews approve/reject/create with `MOCK_REVIEWERS` names, leads with `TablePagination`).
- Admin brand text: only the logo URLs, the hero gradient presets, `mekhela-chador` helper text and the FAQ placeholder (see `BRAND_FOOTPRINT.md`).

## 8. Contexts (`src/context/*`) — state, persistence, order

Provider order in `App.js`: `ErrorBoundary > ThemeContextProvider > StoreSettingsProvider > AuthProvider > AdminProvider > WishlistProvider > CartProvider > OrderProvider > Router > (admin routes | StorefrontShell > DealsConfigProvider > FaqProvider)`.

| Context | Hook | State / API | Persistence |
|---|---|---|---|
| ThemeContext | `useTheme()`, `useThemeContext()` | `isDarkMode`, `toggleTheme`, MUI `theme` | `localStorage.theme`; `body.dark/.light`; `meta[theme-color]` |
| StoreSettingsContext | `useStoreSettings()` | `store`, `payment`, `social`, `socialLinks`, `storeName`, `tagline`, `email`, `phone`, `address`, `currency`, `currencySymbol`, `taxRate`, `taxIncluded`, `phoneHref`, `emailHref`, `formatPrice()`, `fillCopy()`, `refresh()`; sets `setActiveCurrency`, applies the store document title | refetch on window focus + `store-settings:updated` event (`notifyStoreSettingsUpdated`) |
| AuthContext | `useAuth()` (also `hooks/useAuth`) | `user`, `isLoading`, `isAuthenticated`, `login`, `register`, `logout`, `updateUser`, `authModalOpen`, `authModalTab`, `openAuthModal(tab)`, `closeAuthModal` | `authStorage` (`user`, `token`) — sessionStorage by default, localStorage with "Remember me" |
| AdminContext | `useAdmin()` | `admin`, `isLoading`, `isAuthenticated`, `login`, `logout` | `sessionStorage.admin`, `sessionStorage.adminToken` (`mock-admin-token` in mock mode) |
| WishlistContext | `useWishlist()` | `wishlistItems`, `isLoading`, `addToWishlist`, `removeFromWishlist(id,{silent})`, `toggleWishlist`, `isInWishlist`, `clearWishlist` (Swal confirm), `getWishlistCount` | `localStorage.wishlist`; server sync on login |
| CartContext | `useCart()` (also `hooks/useCart`) | `cartItems`, `isCartOpen`, `isLoading`, `addToCart(product, qty, {openDrawer})`, **`addMany(items, {openDrawer}) -> {added, skipped}`**, `removeFromCart`, `updateQuantity`, `clearCart({silent})`, `getCartTotal`, `getCartItemCount`, `toggleCart`, `setIsCartOpen`; line id = `${productId}-${variantId ?? "default"}`; SweetAlert toasts, sentence case ("Added to cart" / "Cart updated" / "Removed from cart" / "Cart cleared") | `localStorage.cart` (format unchanged); debounced replace-sync to `/cart` for logged-in users |
| OrderContext | `useOrder()` | `orders`, `currentOrder`, `isLoading`, `createOrder(orderData)` (generates `ORD-<ts>-<rand>`), `loadUserOrders`, `getOrderById` | — |
| DealsConfigContext | `useDealsConfig()` | `config`, `enabled`, `loading`, `refresh` | refetch on focus |
| FaqContext | `useFaqs()` | `faqs`, `loading`, `refresh`, `forPlacement(p, { limit })` (Prompt 21), `forProduct(product)`; fallback `DEFAULT_FAQS` (= `FAQ_ITEMS` constants) | refetch on focus + `faqs:updated` event |

**Updated by Prompt 12.** `addMany(items, { openDrawer = true } = {})` is the multi-add helper the rituals and the cart tray's cross-sell share. Both add paths now fold an item in through one private reducer (`mergeLine`), so `addToCart` and `addMany` cannot drift on the line-key merge or the stock clamp. `addMany` normalises each entry in the order given inside ONE functional update, SKIPS any entry whose price is not committed (`isPriceKnown`, so a `priceTBA` product can never become a ₹0 line), fires exactly one toast ("3 items added to your cart", or "2 added · 1 coming soon" when it skipped some), opens the drawer at most once — and not at all when nothing was added — and returns `{ added, skipped }`. Covered by `src/context/CartContext.test.js`.

Other storage keys: `localStorage.recentlyViewed` (PDP writes, Home reads, cap 20). `useSound` hook (unused) references `/assets/click-sound-1.wav` (file lives at `src/assets/`, so the path is wrong — dead code).

## 9. Routing (`src/App.js`)

**Rewritten by Prompt 08.** The Meghali route map is gone; every one of its URLs
now redirects. Route-level code splitting, a real 404 and a dependency-free SEO
hook arrived with it.

### 9.1 The route table

Storefront routes live inside `StorefrontShell` (`DealsConfigProvider` →
`FaqProvider` → skip link → `Header` → `<main id="main-content">` →
`AnimatePresence` keyed on `pathname` → `<Suspense fallback={<RouteFallback />}>`
→ `<Routes>` → `Footer` → `BottomNav`). Paths come from `ROUTES`
(`src/utils/constants.js`) — nothing types a path inline.

| Path | Element | Owner of the real page |
|---|---|---|
| `/` | `pages/Home/Home` (**eagerly imported** — the LCP page) | 14–22 |
| `/shop` | `pages/Shop/Shop` *(23)* | — |
| `/category/:slug` | `<Shop mode="category" />` + `CategoryHead` *(24)* — a `kind: "rituals"` category redirects to `/rituals`, an unknown slug renders `NotFound` | — |
| `/product/:slug` | `pages/ProductDetails/ProductDetails` (numeric id resolves, then rewrites to the slug) | 25–27 |
| `/rituals` | `pages/Rituals/Rituals` *(24)* | — |
| `/rituals/:slug` | `pages/Rituals/RitualDetail` *(24)* | — |
| `/about` | `pages/AboutUs/AboutUs` | 28 → `pages/About/About` |
| `/why-lamikaa` | `ComingSoon prompt="28"` | 28 |
| `/faq` | `pages/HelpCenter/HelpCenter` | 28 → `pages/Faq/Faq` |
| `/contact` | `pages/Support/Support` | 28 → `pages/Contact/Contact` |
| `/policies/privacy` | `pages/PrivacyPolicy/PrivacyPolicy` | 28 → `pages/Policies/PolicyPage` |
| `/policies/terms` | `pages/TermsOfService/TermsOfService` | 28 |
| `/policies/shipping-returns` | `pages/RefundPolicy/RefundPolicy` | 28 |
| `/policies/cookies` | `pages/CookiePolicy/CookiePolicy` | 28 |
| `/cart` | `pages/Cart/Cart` *(29)* | — |
| `/checkout` | `pages/Checkout/Checkout` | 29 |
| `/order-confirmation/:orderNumber` | `pages/OrderConfirmation/OrderConfirmation` | 31 |
| `/special-offers` | `pages/SpecialOffers/SpecialOffers` | 31 |
| `/orders` | `pages/OrderHistory/OrderHistory` | 30 |
| `/profile` | `pages/Profile/Profile` | 30 |
| `/wishlist` | `pages/Wishlist/Wishlist` | 30 |
| `/login`, `/register` | `components/routing/AuthRoute` — opens `AuthModal` on the `login`/`signup` tab, then `<Navigate to={state?.from \|\| "/"} replace />` | 30 |
| `/search` | `pages/Search/Search` *(11)* | — |
| `/_playground` | `pages/_Playground/Playground` — TEMPORARY | 35 deletes |
| `*` | `pages/NotFound/NotFound` — a real 404, `noindex` | — |

Admin routes are **unchanged**: `/admin` (`AdminLogin`, index) and `/admin/*`
under `AdminLayout` — `dashboard, products, categories, orders, returns,
payments, users, shipping, coupons, special-offers, hero-section, faqs, reviews,
leads, settings`.

### 9.2 Legacy redirects (`src/components/routing/LegacyRedirects.js`)

Every Meghali-era URL is written down **once**, in this module, and the default
export is an ARRAY of `<Route>` elements spread into `<Routes>` (React Router 6
rejects a wrapper component there). All redirects `replace`.

| Old | New |
|---|---|
| `/products` | `/shop` |
| `/products?search=<q>` | `/search?q=<q>` (wins over `?category=`) |
| `/products?category=<slug>` | `/category/<slug>` |
| `/products?category=muga-silk\|pat-silk\|eri-silk` | `/shop` (retired catalogue) |
| `/products?sort=` `?highlight=` `?page=` … | dropped → `/shop` |
| `/products/:slug` | `/product/:slug` |
| `/help` | `/faq` |
| `/support` | `/contact` |
| `/privacy` `/terms` `/refund` `/cookies` | `/policies/privacy` `/policies/terms` `/policies/shipping-returns` `/policies/cookies` |
| `/sarees`, `/collections`, `/collections/*` | `/shop` |

### 9.3 Link builders

- `productPath(product)` (`utils/helpers.js`) → `/product/<slug\|productId\|id>`; `/shop` for a missing product.
- `categoryPath(cat)` (`utils/categories.js`) → `/category/<slug>`; a `kind: "rituals"` category → `/rituals`.
- `ritualPath(ritual\|slug)` → `/rituals/<slug>`.
- `concernPath(slug)` → `/shop?concern=<slug>` (a concern is a facet of the shop, not a place).
- `categoryParam(cat)` survives as the listing's **filter token** builder only — it is no longer a URL builder.
- `ROUTES` (`utils/constants.js`) is the one route table; `ROUTES.NOT_FOUND` is the `*` pattern, not a URL.

### 9.4 Code splitting and the fallback

`React.lazy` on every page except `Home` — **36** dynamic imports (19 storefront
+ 17 admin, the admin shell included) producing **68** JS chunks. (Prompt 28
added `PolicyPage` and removed six; Prompt 29 added `Cart` and left `ComingSoon`
unrouted — it is still lazily imported nowhere and Prompt 31 deletes it.) Both `<Routes>` blocks sit inside
`<Suspense fallback={<RouteFallback />}>`; the storefront's is INSIDE the keyed
`motion.div`, so the skeleton fades exactly like a page.
`components/routing/RouteFallback.js` is a `role="status" aria-label="Loading"`
glass skeleton (heading bar + three `Skeleton` blocks, `min-height: 70svh`).

### 9.5 Scroll restoration (`components/ScrollToTop/ScrollToTop.js`)

Instant `window.scrollTo({ top: 0, behavior: "auto" })` on a `pathname` change —
the page fade covers it. Three exceptions: a `hash` (the target is looked up by
id across up to 30 frames, so a lazily-loaded chunk still gets the jump, then
`scrollIntoView` — smooth, or instant under `prefers-reduced-motion` — and takes
focus with `preventScroll`); `location.state.preserveScroll`; and a query-only
change, which never fires the effect.

### 9.6 `useSeo` (`src/hooks/useSeo.js`)

`useSeo({ title, description, canonical, image, type, noindex, jsonLd })` owns
the head of a page: the tab (through the `setPageTitle`/`releasePageTitle` claim
protocol in `utils/documentTitle.js`, so the store default from Admin → Settings
stands aside and comes back), `meta[name=description]`, `og:title|description|
type|url|image`, `twitter:title|description|image`, `meta[name=robots]`
(`noindex,nofollow`, only when asked), `link[rel=canonical]`, and a
`script[type="application/ld+json"]`. No library.

Every element it writes carries `data-seo="page"`. A tag it did not create (the
static `og:*` block in `public/index.html`) is **borrowed**: the original value
is restored and the mark removed on unmount, so the head never carries two
`og:title` tags and a route without a `useSeo()` call still finds the site-wide
defaults. Canonical origin = `brand.seo.siteUrl` when it is not a placeholder,
else `window.location.origin` (`{{LAMIKAA_DOMAIN}}` is unresolved; Prompt 38
revisits).

Applied by Prompt 08 to: Home (site defaults), Products (`Shop`, or the category
name under `/category/:slug`), Wishlist, Orders, Profile, Checkout,
OrderConfirmation, HelpCenter (`FAQ`), Support (`Contact`), AboutUs,
SpecialOffers, the four policy pages, NotFound and ComingSoon. Orders, Profile,
Wishlist, Cart, Checkout, OrderConfirmation and NotFound carry `noindex`
(**`ComingSoon` is deleted — Prompt 31**; it lost its last route in Prompt 29).
The PDP still runs its own hand-rolled title/description effect — Prompt 25
moves it onto this hook.

`public/robots.txt` allows everything except `/admin`, `/checkout`,
`/order-confirmation`, `/profile`, `/orders`, `/cart`, `/_playground`, and names
`https://{{LAMIKAA_DOMAIN}}/sitemap.xml` (Prompt 38 generates the sitemap and
resolves or removes that line).

## 10. Cross-cutting facts the prompts rely on

- Brand strings are centralised in **three** places today: `src/utils/constants.js` (`APP_NAME`, `APP_TAGLINE`, `APP_DESCRIPTION`, `SOCIAL_LINKS`, `SUPPORT_*`, `FAQ_ITEMS`, `WHY_CHOOSE_US`, `TRUST_BADGES`, `POLICY_LAST_UPDATED`, `FREE_SHIPPING_THRESHOLD`), `db.json → settings`, and hard-coded logo URL constants in 5 components + `public/index.html`.
- `formatCurrency()` (helpers) follows the admin currency via `setActiveCurrency`; `useStoreSettings().formatPrice` is the reactive form.
- SweetAlert2 popups are themed in `App.css` per `body.light/.dark` and `body.admin-area`.
- `src/theme/tokens.js → STOREFRONT_CONFIG` holds `trustBadges` ids, `returnsWindowDays: 7`, AOV toggles, gallery zoom.
- Visibility gate `isActive !== false` applies to products, categories, coupons, shipping methods, FAQs.

## 11. File-by-file verdict table

Legend: **K** keep & restyle (logic kept, tokens/copy/layout re-skinned) · **R** rebuild (new component replaces it; old file deleted or fully rewritten) · **X** remove (delete; nothing imports it after the rebuild).

| File | Verdict | Reason / notes |
|---|---|---|
| `src/App.js` | K→R (routing rewritten in Prompt 08) | Providers kept; routes, lazy loading, redirects, 404 added. |
| `src/App.css`, `src/index.css`, `src/index.js` | K | Re-token, remove light/dark blocks, `color-scheme: dark`. |
| `src/theme/storefront-tokens.css` | R (values) | Single dark token set + glass/glow/gradient/neon tokens; names kept (Prompt 03). |
| `src/theme/storefront-primitives.css` | K + extend | Add `.sf-glass`, `.sf-glow*`, `.sf-gradient-text`, `.sf-eyebrow`, `.sf-section` (Prompt 04). |
| `src/theme/tokens.js`, `colors.js`, `motion.js` | K | Mirror new values; `TRUST_BADGE_CATALOG` gains LAMIKAA badges. |
| `src/theme/adminTheme.js` | K (recoloured) | Single dark LAMIKAA admin palette (Prompt 32). |
| `src/context/ThemeContext.js` | R | Single dark MUI theme, no toggle (Prompt 03). |
| `src/context/{Auth,Admin,Cart,Wishlist,Order,DealsConfig,Faq,StoreSettings}Context.js` | K | Untouched logic; Cart gains `addMany` for rituals (Prompt 07/24). |
| `src/services/api.js`, `baseURL.js` | K + extend | New namespaces (Prompt 07); comments/URLs cleaned (36). |
| `src/services/api.live.test.js` | K | Prompt 07 did the BASE_URL assertion (now a pattern, so a staging host passes), announcements/concerns/rituals/content coverage, `setHeroOrder`, the nullable-price + `media[]`/`categoryIds[]` product assertions and the new product reads. Remaining: whatever Prompts 36/39 add. |
| `src/utils/constants.js` | K (gutted) | Brand values move to `src/config/brand.js`; keep enums/routes. |
| `src/utils/orderStatus.js` (**new, Prompt 30**) | — | `deriveOrderStatus` + `STATUS_CONFIG` (label + semantic tone) + `getStatusInfo`/`orderStatusInfo`, lifted out of the byte-identical copies in `OrderHistory.js` and `Profile.js`. |
| `src/utils/{helpers,categories,faqs,heroConfig,dealsConfig,storeSettings,socialLinks,documentTitle,authStorage}.js` | K | Prompt 07: `faqs.js` gained `group` + `faqsForGroup()`; Prompt 21: `faqLimit()` + a `{ limit }` option on `faqsForPlacement`; `heroConfig.js` gained `source` and lost its Meghali fallback slide. `heroConfig.js` loses the remaining slide helpers when the hero is rebuilt (Prompt 14/34); `productPath` → `/product/`. |
| `src/hooks/useSound.js`, `src/assets/click-sound-1.wav` | X | Dead code, wrong path. |
| `src/components/Header/*` | R (layout) / K (overflow + menus logic) | Glass header, mega panel (Prompt 09). |
| `src/components/SidebarMenu/*` | R | Glass mobile drawer (Prompt 10). |
| `src/components/BottomNav/*` | K | Restyle (Prompt 10). |
| `src/components/CategoriesDrawer/*` | X | Replaced by the mega panel (Prompt 09). |
| `src/components/SearchModal/*` | K | **Done (Prompt 11)** — rebuilt on `ui/Modal size="full"`; ranking moved to `src/utils/search.js`. |
| `src/components/CartDrawer/*` | K | Glass drawer + cross-sell (Prompt 12). |
| `src/components/Footer/*` | R | New four-column glass footer (Prompt 13). |
| `src/components/AnnouncementBar/*`, `TrustStrip/*` | K | Data from brand config / announcements (Prompts 09, 15). |
| `src/components/HeroSection/*` | R | Product-driven hero carousel (Prompt 14). |
| `src/components/FAQ/*` | K | **Done (Prompt 21)** — rewritten onto `ui/Accordion`; rows are a prop, so the home band, `/faq` and the PDP panel share one accordion. |
| `src/components/AuthModal/*`, `ReviewModal/*`, `Breadcrumb/*`, `ScrollToTop/*`, `ErrorBoundary/*` | K | **AuthModal + ReviewModal done (Prompt 30)** — both on `ui/Modal`, the social buttons and their brand hexes deleted; ErrorBoundary literals re-synced (03). |
| `src/components/BottomDrawer/*`, `CTASection/*`, `FeaturedProducts/*`, `Newsletter/*` | X | Unused duplicates (Prompt 35 deletes; `Newsletter/` was deleted by Prompt 13, and the capture now lives in `brand/NewsletterForm` — Prompt 19). |
| `src/components/AdminLayout/*` | K | Rebrand, single theme (Prompts 03, 32). |
| `src/components/storefront/ProductCard.*` | R | Glass label-card (Prompt 15/16 shared card). |
| `src/components/storefront/ProductGallery.*` | R | **DELETED by Prompt 26** — replaced by `components/pdp/MediaGallery.*` + `Lightbox.*`. |
| `src/components/storefront/{AddToCartBar,PriceBlock,QuantityStepper,VariantSelector,variantUtils,TrustBadges,DeliveryReturnsInfo,ReviewsSection,RelatedProducts,FrequentlyBoughtTogether,SocialProof,StarRating}.*` | K | Restyle; PriceBlock becomes placeholder-aware (05). |
| `src/pages/Home/*` | R | New home composition (Prompts 14–22). |
| `src/pages/Products/*` | **DONE (23)** → `src/pages/Shop/*` | Filter-free chaptered listing; the old page and its CSS are deleted. |
| `src/pages/ProductDetails/*` | R | New PDP (Prompts 25–27). |
| `src/pages/Checkout/*` | **DONE (29)** | Restyled onto the primitives; `Checkout.module.css` rewritten from scratch (2 107 → 1 492) and `Checkout.js` edited for markup, classes and copy only — the money block and the `orderData` payload are byte-identical. Two additive guards (the step-0 TBA drop, the order-failure alert). |
| `src/pages/Cart/*` | **DONE (29)** — new | The full cart page `/cart` replaces the `ComingSoon` stub; `components/cart/CrossSell` is shared with the drawer. |
| `src/pages/OrderConfirmation/*`, `OrderHistory/*`, `Profile/*`, `Wishlist/*`, `SpecialOffers/*` | K | **DONE** — OrderHistory + Profile + Wishlist restyled by Prompt 30, OrderConfirmation + SpecialOffers by Prompt 31; logic preserved and diffed on all five. SpecialOffers' local `ProductCard` copy is gone (one shared card). |
| `src/pages/_ComingSoon/` | **DELETED (31)** | The Phase 0 scaffolding stub. Routeless since Prompt 29; `grep -rn "ComingSoon" src` → 0. |
| `src/components/ui/EmptyState.{js,module.css}`, `ui/ErrorState.js` (**new, Prompt 31**) | — | The storefront's two state cards — see §5. `ErrorState` composes `EmptyState`, so one stylesheet holds both and a failed read can never look like a different application. 20 + 7 call sites across 12 pages. |
| `src/pages/AboutUs/*` | **DONE (28)** → `src/pages/About/*` | siteContent-driven story; the old folder and its 861-line stylesheet are deleted. |
| `src/pages/HelpCenter/*` → `src/pages/Faq/*`, `Support/*` → `Contact/*`, the four policies → `src/pages/Policies/PolicyPage` | **DONE (28)** | siteContent-driven; the four policy routes collapse into one param route, `/policies/other` is a real 404, and `/help` `/support` `/privacy` `/terms` `/refund` `/cookies` still redirect. Six folders deleted. |
| `src/pages/Admin/*` | K | Rebrand + new fields/screens (Prompts 32–34). |
| `public/index.html`, `manifest.json`, favicons, `robots.txt` | R | LAMIKAA identity (Prompt 02), sitemap/robots (38). |
| `db.json` | R | New seed (Prompt 06). |
| `.env`, `.env.example`, `.env.production`, `package.json` | K (edited) | Name/description/comments (02, 36). |
