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
- Hard-coded colours now: `ErrorBoundary.js` (12, intentional fallback), `Footer.js` (payment-network marks) and `AuthModal.js` (social brand marks) — documented exceptions; `SearchModal.js:55-56` data-URI (`#141416` / `#B8B5B0`), `helpers.js` `PLACEHOLDER_IMG` fill `#8E8B86`, `DANGER_HEX = "#FF8A80"` ×3, `OrderConfirmation.js` `CONFETTI_COLORS = ["#F5D76E", "#FFEFA6", "#FF4FD8", "#8B5CF6"]`, `index.js` crash-screen inline styles, admin JS files (indigo/slate literals — see §7).

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
- `SearchModal.js` (848): module-level catalogue cache, `scoreProduct()` relevance, category chips, recent searches (localStorage-free? it uses its own storage helpers), trending rail; hard-coded silk terms at 20-34, 633, 688.
- `CartDrawer.js` (659 → 736, **rewritten by Prompt 12**): a 440px glass tray on `ui/Drawer` (its own trap, Escape handler and scroll lock deleted). 64px masthead with a count chip; body = free-shipping meter → 96px lines → "Complete your ritual" → "Have a code?" → the money; 128px pinned foot (Checkout / View cart / "Secure checkout"). The meter's bar is the lowest `freeAbove` across the ACTIVE `shipping_methods`, read live and cached in a ref, and is not rendered at all when no method sets one — `FREE_SHIPPING_THRESHOLD` and the `FLAT_SHIPPING=99` flat rate are both gone, and no delivery charge is previewed (checkout owns it). Coupon apply/remove via `apiService.coupons.validate` and the auto-drop-below-minimum rule are unchanged. Two pure exports, `freeShippingThreshold()` and `crossSellFor()`, are unit-tested in `CartDrawer.test.js`.
- `SidebarMenu.js` (682): mobile drawer with recursive category accordion, account links, **theme switch** at 609-636, TrustStrip, legal links.
- `Footer.js` (445): newsletter (`apiService.leads.createNewsletter`), brand+contact, four columns, promises + payment marks, colophon; old white logo at 45.
- `storefront/*` (13 atoms exported from `index.js`): `ProductCard` (props `product, onAddToCart, onToggleWishlist, isWishlisted, showAddToCart`), `ProductGallery` (props `images, alt, discount, zoom, ribbon, inStock` — images only), `AddToCartBar` (mobile sticky), `PriceBlock`, `QuantityStepper`, `VariantSelector` (+ `variantUtils.js`), `TrustBadges` (config-driven from `tokens.js`), `DeliveryReturnsInfo`, `ReviewsSection`, `RelatedProducts`, `FrequentlyBoughtTogether`, `SocialProof`, `StarRating`.
- Unused/duplicate: `FeaturedProducts` (private card copy), `CTASection`, `Newsletter`, `BottomDrawer` — none imported by Home/Products/PDP.


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

## 6. Pages (`src/pages/*`) — see §11 for verdicts

- `Home.js` (710): hero + collection stories + featured grid + offers rail (with admin countdown) + heritage band + trending rail + recently-viewed rail (localStorage `recentlyViewed`, reconciled against the live catalogue) + promises row.
- `Products.js` (1661): URL-backed catalogue — params `category` (slug or legacy id, parent-includes-children via `getCategoryScopeIds`), `search`, `sort` (`relevance|price-low|price-high|newest|rating|popularity` + 12 aliases), `page`, `per_page`, `min_price`, `max_price`, `highlight` (featured/trending/hot); session-only facets rating/discount/in-stock/brand/**fabric** (`FABRIC_FAMILIES` Muga/Pat/Eri/Toss/Cotton); filter drawer with focus trap; skeleton/error/empty states; heading default "All Silk".
- `ProductDetails.js` (1146): slug + legacy numeric-id resolution with canonical redirect; `ProductGallery` from `product.images`; buy box (SocialProof, PriceBlock, key features, VariantSelector, QuantityStepper, Buy Now/Add to Cart/wishlist, TrustBadges, DeliveryReturnsInfo); promises band; tabs Description / Specifications (`SILK_SPEC_LABELS`) / Fabric & Craft (conditional) / Reviews / FAQs (`useFaqs().forProduct`); FBT + Related rails; `AddToCartBar`; writes `recentlyViewed`; owns the tab title via `setPageTitle` and hand-writes `meta[name=description]`.
- `Checkout.js` (1656): 4 steps Cart → Shipping → Payment → Review; address book + inline form (required: firstName, lastName, phone, addressLine1, city, state, postalCode; country fixed "India"); shipping methods from API (free above `freeAbove`); coupon; tax inclusive/exclusive; store credit (`wallet.getBalance`); COD rules from settings (`codEnabled/codMinOrder/codMaxOrder/codFee`); payment methods `card|upi|net_banking|wallet|cod` (mock forms, no gateway); `createOrder()` from OrderContext then `navigate('/order-confirmation/'+orderNumber)`.
- `OrderConfirmation.js` (548): `/order-confirmation/:orderNumber`, payment-status-aware, confetti (reduced-motion aware), loading/error/not-found branches.
- `OrderHistory.js` (1179): search/filter/paginate (5/page), 3-stage timeline, tracking drawer, details drawer, cancel (`orders.cancel`), return (→ `/support` within 7 days), reorder, **review submission** via `ReviewModal` (`reviews.submit`), refund states.
- `Profile.js` (1429): dashboard + sections Profile (edit; email read-only), Addresses (CRUD via `updateUser({addresses})`), Payment (empty state), Wallet (`wallet.getBalance/getTransactions`), Notifications (coming soon), Settings (**Appearance theme switch** at 1064-1080 + password change with strength meter). Duplicates `deriveOrderStatus` from OrderHistory.
- `Wishlist.js` (490): guest-capable, 5 sorts, Move to Cart, recommendations (`getRelated` → `getFeatured`).
- `SpecialOffers.js` (985): admin `dealsConfig`-driven deals page with vouchers, deal of the day, category tabs; local `ProductCard` copy.
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
| FaqContext | `useFaqs()` | `faqs`, `loading`, `refresh`, `forPlacement(p)`, `forProduct(product)`; fallback `DEFAULT_FAQS` (= `FAQ_ITEMS` constants) | refetch on focus + `faqs:updated` event |

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
| `/shop` | `pages/Products/Products` | 23 → `pages/Shop/Shop` |
| `/category/:slug` | `pages/Products/Products` via `CategoryRoute` (passes `categorySlug`) | 24 → `<Shop mode="category" />` |
| `/category/rituals` | `<Navigate to="/rituals" replace />` | — |
| `/product/:slug` | `pages/ProductDetails/ProductDetails` (numeric id resolves, then rewrites to the slug) | 25–27 |
| `/rituals`, `/rituals/:slug` | `ComingSoon prompt="24"` | 24 |
| `/about` | `pages/AboutUs/AboutUs` | 28 → `pages/About/About` |
| `/why-lamikaa` | `ComingSoon prompt="28"` | 28 |
| `/faq` | `pages/HelpCenter/HelpCenter` | 28 → `pages/Faq/Faq` |
| `/contact` | `pages/Support/Support` | 28 → `pages/Contact/Contact` |
| `/policies/privacy` | `pages/PrivacyPolicy/PrivacyPolicy` | 28 → `pages/Policies/PolicyPage` |
| `/policies/terms` | `pages/TermsOfService/TermsOfService` | 28 |
| `/policies/shipping-returns` | `pages/RefundPolicy/RefundPolicy` | 28 |
| `/policies/cookies` | `pages/CookiePolicy/CookiePolicy` | 28 |
| `/cart` | `ComingSoon prompt="29"` (the drawer is still the cart) | 29 |
| `/checkout` | `pages/Checkout/Checkout` | 29 |
| `/order-confirmation/:orderNumber` | `pages/OrderConfirmation/OrderConfirmation` | 31 |
| `/special-offers` | `pages/SpecialOffers/SpecialOffers` | 31 |
| `/orders` | `pages/OrderHistory/OrderHistory` | 30 |
| `/profile` | `pages/Profile/Profile` | 30 |
| `/wishlist` | `pages/Wishlist/Wishlist` | 30 |
| `/login`, `/register` | `components/routing/AuthRoute` — opens `AuthModal` on the `login`/`signup` tab, then `<Navigate to={state?.from \|\| "/"} replace />` | 30 |
| `/search` | `ComingSoon prompt="11"` (reads `?q=`; the overlay still searches in place) | 11 |
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

`React.lazy` on every page except `Home` — 34 dynamic imports (18 storefront +
16 admin) producing 51 JS chunks. Both `<Routes>` blocks sit inside
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
Wishlist, Checkout, OrderConfirmation, NotFound and ComingSoon carry `noindex`.
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
| `src/utils/{helpers,categories,faqs,heroConfig,dealsConfig,storeSettings,socialLinks,documentTitle,authStorage}.js` | K | Prompt 07: `faqs.js` gained `group` + `faqsForGroup()`; `heroConfig.js` gained `source` and lost its Meghali fallback slide. `heroConfig.js` loses the remaining slide helpers when the hero is rebuilt (Prompt 14/34); `productPath` → `/product/`. |
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
| `src/components/FAQ/*` | K | Glass accordion (Prompt 21). |
| `src/components/AuthModal/*`, `ReviewModal/*`, `Breadcrumb/*`, `ScrollToTop/*`, `ErrorBoundary/*` | K | Restyle; ErrorBoundary literals re-synced (03). |
| `src/components/BottomDrawer/*`, `CTASection/*`, `FeaturedProducts/*`, `Newsletter/*` | X | Unused duplicates (Prompt 35 deletes; Footer keeps the newsletter). |
| `src/components/AdminLayout/*` | K | Rebrand, single theme (Prompts 03, 32). |
| `src/components/storefront/ProductCard.*` | R | Glass label-card (Prompt 15/16 shared card). |
| `src/components/storefront/ProductGallery.*` | R | Media gallery with videos (Prompt 26). |
| `src/components/storefront/{AddToCartBar,PriceBlock,QuantityStepper,VariantSelector,variantUtils,TrustBadges,DeliveryReturnsInfo,ReviewsSection,RelatedProducts,FrequentlyBoughtTogether,SocialProof,StarRating}.*` | K | Restyle; PriceBlock becomes placeholder-aware (05). |
| `src/pages/Home/*` | R | New home composition (Prompts 14–22). |
| `src/pages/Products/*` | R → `src/pages/Shop/*` | Filter-free chaptered listing (Prompt 23); old file deleted. |
| `src/pages/ProductDetails/*` | R | New PDP (Prompts 25–27). |
| `src/pages/Checkout/*`, `OrderConfirmation/*`, `OrderHistory/*`, `Profile/*`, `Wishlist/*`, `SpecialOffers/*` | K | Restyle, logic preserved (Prompts 29–31). |
| `src/pages/AboutUs/*` | R | siteContent-driven story (Prompt 28). |
| `src/pages/HelpCenter/*` → `src/pages/Faq/*`, `Support/*` → `Contact/*`, policies → `src/pages/Policies/*` | R | siteContent-driven (Prompt 28); old routes redirect. |
| `src/pages/Admin/*` | K | Rebrand + new fields/screens (Prompts 32–34). |
| `public/index.html`, `manifest.json`, favicons, `robots.txt` | R | LAMIKAA identity (Prompt 02), sitemap/robots (38). |
| `db.json` | R | New seed (Prompt 06). |
| `.env`, `.env.example`, `.env.production`, `package.json` | K (edited) | Name/description/comments (02, 36). |
