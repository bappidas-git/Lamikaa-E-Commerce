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
| Icons | `@iconify/react` (`mdi:*`) on the storefront + admin; `@mui/icons-material` in Header, BottomNav, SidebarMenu, CategoriesDrawer. |
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

**Mode selection** (`src/services/baseURL.js`): `IS_MOCK_API = BASE_URL === "http://localhost:3001" || REACT_APP_USE_MOCK_API === "true"`; `BASE_URL` = mock URL when the flag is on, else `REACT_APP_API_URL`, else mock in development. Logged to the console in development. **Mode A = JSON Server over `db.json` on :3001 (via `server.js`). Mode B = live Laravel API (`/api/v1`) on Cloudways — response envelope `{ success, data, meta }` unwrapped by `extractData()`; pagination meta via `extractMeta()`.** There is no in-memory mock: "mock mode" *is* JSON Server. (Adaptation to the brief recorded in `00_INDEX.md`.)

**Axios instance** `api`: `baseURL`, JSON headers, 30 s timeout. Request interceptor attaches `Authorization: Bearer` — admin token from `sessionStorage.adminToken` when the URL contains `/admin/`, else the customer token from `authStorage.get("token")`. Response interceptor: on 401 (not on `/auth/login`) clears the matching session (`admin`+`adminToken` or `user`+`token`).

**Named exports:** `extractData`, `extractMeta`, `isVisibleProduct` (`isActive !== false`), `visibleProducts`, `getErrorMessage`, `api`. Default export `apiService` with these namespaces:

| Namespace | Functions (signature → returns) | Mock-mode path | Live path |
|---|---|---|---|
| `auth` | `login({email,password,remember})` → safe user (stores token via `authStorage`) · `register(userData)` (mock checks duplicate email, code `EMAIL_TAKEN`) · `logout()` · `getUser()` · `updateUser(updates)` · `changePassword({currentPassword,newPassword,confirmPassword})` | `GET /users?email&password`, `POST /users`, `PATCH /users/:id` | `POST /auth/login`, `/auth/register`, `/auth/logout`, `GET/PUT /auth/user`, `PUT /auth/password` |
| `products` | `getAll(params)` (visible only) · `getById(id)` (null if hidden) · `getBySlug(slug)` · `getFeatured(limit=10)` · `getTrending(limit=10)` · `getByCategory(categoryId)` · `search(query)` · `getReviews(productId)` (approved) · `getRelated(product, limit=10)` (curated `relatedProductIds` → same `categoryId` → shared `tags`/`brand`) · `getFrequentlyBoughtTogether(product, limit=3)` (only `frequentlyBoughtTogetherIds`) | `GET /products`, `/products?slug=`, `?featured=true`, `?trending=true`, `?categoryId=`, `?q=` (json-server full-text), `GET /reviews?productId&status=approved` | `GET /products`, `/products/:id`, `/products/slug/:slug`, `/products/featured`, `/products/trending`, `/products/category/:id`, `/products?search=`, `/products/:id/reviews` |
| `categories` | `getAll()` (active, sorted by `sortOrder`) · `getById(id)` · `getBySlug(slug)` | `GET /categories`, `?slug=` | `GET /categories`, `/categories/:id`, `/categories/slug/:slug` |
| `banners` | `getAll()` (never throws) | `GET /banners` | `GET /banners` |
| `hero` | `getConfig()` (never throws, `{}` fallback) | `GET /heroConfig` | `GET /hero/config` |
| `cart` | `getCart(userId)` · `addToCart(item)` · `updateCartItem(id, updates)` · `removeFromCart(id)` · `clearCart()` | `/cart` (+`?userId`) | `/cart` |
| `orders` | `create(orderData)` (mock: seeds `statusHistory`, creates the payment row, bumps coupon `usedCount`, debits wallet) · `getByUserId(userId)` · `getById(id)` · `getByOrderNumber(orderNumber)` · `cancel(id, reason)` (shared `performCancel` cascade) | `/orders` | `/orders`, `/orders/number/:n`, `POST /orders/:id/cancel` |
| `wallet` | `getBalance(userId)` · `getTransactions(userId)` | `/walletTransactions` ledger | `/wallet/balance`, `/wallet/transactions` |
| `reviews` | `getMine(userId)` · `submit({productId,userId,userName,rating,title,body,orderId,orderNumber,isVerifiedPurchase})` (one per user+product, re-enters `pending`) | `/reviews` | `/reviews/mine`, `POST /products/:id/reviews` |
| `returns` | `create(data)` · `getByUserId(userId)` · `getById(id)` | `/returns` | `/returns` |
| `coupons` | `getActive(params)` · `validate(code, orderAmount)` (expiry, `usageLimit`, `perUserLimit` counted from the user's orders, `minOrderAmount`; rejects with code `COUPON_INVALID`) | `/coupons?code&isActive=true` | `POST /coupons/validate` |
| `wishlist` | `get(userId)` · `add(item)` · `remove(id)` | `/wishlist` | `/wishlist` |
| `shipping` | `getMethods()` (active) | `/shipping_methods?isActive=true` | `/shipping/methods` |
| `settings` | `get()` | `/settings` (singleton) | `/settings` |
| `faqs` | `getAll()` (never throws) | `/faqs` | `/faqs` |
| `deals` | `getConfig()` (`{enabled:true}` fallback) | `/dealsConfig` | `/deals/config` |
| `leads` | `createContact(leadData)` · `createNewsletter(email)` (+ aliases `createContactLead`, `createNewsletterLead`) | `POST /leads` | `POST /leads/contact`, `/leads/newsletter` |
| `admin` | `login`, `logout`, `getDashboardStats`, `getProducts/getProduct/createProduct/updateProduct(PUT)/deleteProduct`, `getCategories/create/update/deleteCategory` (refuses when children/products reference it, code `CATEGORY_IN_USE`), `getOrders` (joins users → `customerEmail/customerName`), `getOrder`, `updateOrder(id, updates, event)`, `updateOrderStatus`, `cancelOrder(id, options)`, `initiateOrderRefund`, `completeOrderRefund`, `failOrderRefund`, `getReturns/getReturn/createReturn/updateReturn(id, updates, {event, restock})`, `scheduleReturnPickup`, `markReturnInTransit`, `getPayments/getPayment/getRefunds/issueRefund`, `getShippingMethods/create/update/delete`, `shiprocketCreateOrder/shiprocketTrack` (live only), `getCoupons/create/update(PATCH)/delete`, `getReviews/createReview/updateReview/deleteReview`, `getUsers/getUser/updateUser`, `getLeads/getLead/updateLead/deleteLead`, `getSettings`, `updateSettings(section, data)` (mock: PUT whole singleton), `getDealsConfig/updateDealsConfig`, `getHeroConfig/updateHeroConfig`, `getBanners/create/update/delete/reorderBanners(orderedIds, current)`, `getFaqs/create/update/delete/reorderFaqs` | plain collections | `/admin/...` prefixed endpoints |

**Conventions:** ids are json-server auto-increment numbers (products, categories, users…) — string ids only for variants (`v1`, `v-<ts>-<rand>`) and local wishlist rows (`local-…`); timestamps are ISO strings written client-side in mock mode; deletes use `deleteWithVerify` (tolerates json-server's delete-then-500); there is **no pagination** in mock mode (lists are fetched whole; pages/filters are client-side); search in mock mode is json-server `?q=` full text across all fields; images are **URL strings only** (`product.images: string[]`, `category.image`, `banner.image/videoUrl/videoPoster`, review `photos[]`) — there is no upload endpoint in either mode.

## 4. `db.json` schema (as shipped)

| Collection | Rows | Fields (type) | Notes / Meghali-specific values |
|---|---|---|---|
| `banners` | 6 | `id, title, subtitle, cta, link, gradient, eyebrow, secondaryCtaLabel, secondaryCtaLink, backgroundType (gradient/image/video), image, imagePosition, videoUrl, videoPoster, overlayOpacity (null/0-100), textAlign, durationMs, isActive, sortOrder, createdAt, updatedAt` | Hero slides: "The Bridal Muga Edit", "Mekhela Chador from Sualkuchi", "New In: Eri Shawls & Stoles" … links to `/products?category=muga-silk` etc. |
| `heroConfig` | singleton | `enabled, autoplay, intervalMs (1500!), transition, pauseOnHover, showControls, showCounter, showProgress, showArrows, overlayOpacity, heights{desktop,tablet,mobile}{min,vh,max}, secondaryCta{enabled,label,link}, openers{enabled,label,limit}, updatedAt` | Section-wide hero behaviour. |
| `faqs` | 8 | `id, question, answer, placements[] (product/help/home), productIds[], isActive, sortOrder, createdAt, updatedAt` | All silk-care/Mekhela FAQs (row 1 has test garbage `###`/`####bhbhhjh`). |
| `users` | 4 | `id, email, password (plain!), firstName, lastName, phone, avatar, addresses[{id,label,firstName,lastName,phone,addressLine1,addressLine2,city,state,postalCode,country,isDefault}], isActive, storeCredit, createdAt, updatedAt` | `user@example.com/password123`, `shubendu@assamdigital…`, Mumbai/Assam addresses. |
| `admins` | 1 | `id, email, password, firstName, lastName, role, isActive, createdAt` | `admin@store.com / admin123` (super_admin). |
| `categories` | 3 | `id, name, slug, description, image, parentId (null), isActive, sortOrder, showInMainMenu, menuOrder, createdAt, updatedAt` | Muga Silk / Pat Silk / Eri Silk with Cloudinary `muga_2_V1.png` images. Code also reads optional `icon`, `title`, `productCount`. |
| `products` | 6 | `id, name, slug, sku, shortDescription, description, categoryId (number), brand ("Meghali's Silk"), images[] (URLs), price, comparePrice, costPrice, stock, lowStockThreshold, weight, dimensions{length,width,height}, variants[{id,name,price,stock,sku,attributes{Fabric,Color},swatchHex}], tags[], featured, trending, hot, isActive, rating, totalReviews, metaTitle, metaDescription, relatedProductIds[], frequentlyBoughtTogetherIds[], createdAt, updatedAt` | All Mekhela Chador / sarees / shawls; broken test prices (`comparePrice: 380000000000`). Storefront also reads optional `image`, `features[]`, `highlights[]`, `specifications/specs/attributes`, `weaveType`, `origin`, `craftTime`, `occasion`, `fabricAndCraft`, `craftStory`, `faqs[]` (inline), `category` (string). |
| `cart` | 1 | `id, userId, productId, variantId, variantName, name, image, price, comparePrice, currency, quantity, stock` | Eri shawl line. |
| `orders` | 11 | `id, orderNumber (ORD-…), userId, items[{productId,variantId,name,image,sku,price,quantity,subtotal}], billingAddress, shippingAddress, subtotal, discountAmount, couponCode, shippingAmount, taxAmount, codFee?, total, storeCreditUsed, amountPayable, paymentStatus, paymentMethod, fulfillmentStatus, shippingStatus, trackingNumber, trackingUrl, shiprocketOrderId, notes, statusHistory[{at,by,action,note}], cancelledAt, cancelReason, deliveredAt, refundStatus, refundMethod, pendingRefund, refundedAmount, refundCompletedAt, recall{}, storeCreditReturned, couponRestored, createdAt, updatedAt` | Item names are silk products (some legacy electronics/lehenga names). |
| `returns` | 4 | `id, returnNumber (RET-…), orderId, orderNumber, userId, items[], reason, reasonDetails, status, refundAmount, refundStatus, refundMethod, deductionAmount, restocked, images[], notes, returnTrackingNumber, returnTrackingUrl, returnCarrier, pickupScheduledAt, statusHistory[], storeCreditCredited?, createdAt, updatedAt` | Sample items include "SoundWave Pro Wireless Earbuds". |
| `payments` | 9 | `id, orderId, orderNumber, userId, amount, currency, paymentMethod, gateway, transactionId, gatewayOrderId, status, gatewayResponse{}, refundAmount, refundReason, refunds[], pendingRefund, storeCreditApplied, createdAt, updatedAt` | — |
| `refunds` | 7 | `id, refundNumber (REF-…), type, orderId, orderNumber, returnId, returnNumber, paymentId, amount, method, reason, reference, status, couponRestored, initiatedAt, settledAt, by, createdAt, updatedAt` | One reason names "Bengal Handloom Silk Saree". |
| `shipping_methods` | 5 | `id, name, carrier, description, rateType (flat/free/calculated), flatRate, freeAbove, estimatedDays, isActive, createdAt` | "insured silk packaging", "select Kolkata pin codes". |
| `coupons` | 7 | `id, code, description, type (percentage/fixed), value, minOrderAmount, maxDiscount, usageLimit, usedCount, perUserLimit, isActive, expiresAt, createdAt, updatedAt` | `MUGA500`, `SUALKUCHI1000`, bridal Muga descriptions. |
| `reviews` | 8 | `id, productId, userId, userName, rating, title, body, status (pending/approved/rejected), isVerifiedPurchase, helpfulCount, photos[], source ("admin"), orderId?, orderNumber?, createdAt, updatedAt` | All silk-specific. |
| `wishlist` | 3 | `id, userId, productId, slug, name, image, brand, category?, price, comparePrice, rating, totalReviews, shortDescription, variants[], stock, trending, hot, addedAt` | Product snapshots. |
| `leads` | 6 | `id, type (contact/newsletter), name, email, phone, orderNumber, category, subject, message, status, notes, createdAt, updatedAt` | — |
| `settings` | singleton | `store{name,tagline,email,phone,address,currency,currencySymbol,timezone,logo,favicon,taxRate,taxIncluded}, shipping{shiprocketEnabled,shiprocketEmail,shiprocketPassword,defaultWeight,defaultDimensions}, payment{razorpayEnabled,razorpayKeyId,stripeEnabled,stripePublishableKey,codEnabled,codFee,codMinOrder,codMaxOrder}, notifications{…}, seo{metaTitle,metaDescription,googleAnalyticsId,facebookPixelId}, social{facebook,instagram,twitter,youtube,whatsapp}` | Meghali name/tagline/email/address (Galleria Producer Company, Kolkata), meghalisilk social URLs. |
| `walletTransactions` | 4 | `id, userId, type (credit/debit), amount, reason, orderId, orderNumber, refundId, refundNumber, balanceBefore, balanceAfter, createdAt` | — |
| `dealsConfig` | singleton | `enabled, hero{tag,title,subtitle}, timer{enabled,endAt,onExpiry}, featuredCouponIds[], dealOfTheDayIds[], featuredProductIds[], updatedAt` | "Bihu Offers", "Honest Markdowns on Handwoven Assamese Silk". |

Relationships: `products.categoryId → categories.id`; `categories.parentId → categories.id`; `orders.userId → users.id`; `orders.items[].productId → products.id`; `returns.orderId → orders.id`; `payments.orderId → orders.id`; `refunds.{orderId,returnId,paymentId}`; `walletTransactions.{userId,orderId,refundId}`; `reviews.{productId,userId,orderId}`; `wishlist/cart.{userId,productId}`; `faqs.productIds[] → products.id`; `dealsConfig.*Ids[] → coupons/products`.

## 5. Storefront components (`src/components/*`) — see the verdict table in §11

Highlights that shape the prompts:
- `Header.js` (709): sticky masthead + measured **priority nav** (category links from `getMainMenuCategories`, editorial links `?sort=newest|popular|discount`, "Today's Deals"), hover/focus **collection panels**, MUI user menu, hosts `AnnouncementBar`, `TrustStrip`, `CartDrawer`, `SidebarMenu`, `AuthModal`, `SearchModal`, `CategoriesDrawer`. Theme toggle at 466-477. Logo constant `LOGO_SRC` (old wordmark).
- `HeroSection.js` (557): fully admin-driven slides from `banners` + `heroConfig` (gradient/image/video backgrounds, banked-time autoplay, ←/→ keys, `aria-roledescription="carousel"`, reduced-motion aware, "openers" category row).
- `SearchModal.js` (848): module-level catalogue cache, `scoreProduct()` relevance, category chips, recent searches (localStorage-free? it uses its own storage helpers), trending rail; hard-coded silk terms at 20-34, 633, 688.
- `CartDrawer.js` (659): dialog with focus trap, qty steppers, free-shipping meter (`FREE_SHIPPING_THRESHOLD=999`, `FLAT_SHIPPING=99`), coupon apply/remove via `apiService.coupons.validate`, summary, Checkout CTA.
- `SidebarMenu.js` (682): mobile drawer with recursive category accordion, account links, **theme switch** at 609-636, TrustStrip, legal links.
- `Footer.js` (445): newsletter (`apiService.leads.createNewsletter`), brand+contact, four columns, promises + payment marks, colophon; old white logo at 45.
- `storefront/*` (13 atoms exported from `index.js`): `ProductCard` (props `product, onAddToCart, onToggleWishlist, isWishlisted, showAddToCart`), `ProductGallery` (props `images, alt, discount, zoom, ribbon, inStock` — images only), `AddToCartBar` (mobile sticky), `PriceBlock`, `QuantityStepper`, `VariantSelector` (+ `variantUtils.js`), `TrustBadges` (config-driven from `tokens.js`), `DeliveryReturnsInfo`, `ReviewsSection`, `RelatedProducts`, `FrequentlyBoughtTogether`, `SocialProof`, `StarRating`.
- Unused/duplicate: `FeaturedProducts` (private card copy), `CTASection`, `Newsletter`, `BottomDrawer` — none imported by Home/Products/PDP.

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

## 7. Admin panel

- Shell `src/components/AdminLayout/AdminLayout.js` (1015): guard `useAdmin().isAuthenticated` → `<Navigate to="/admin" />`; 260 px MUI Drawer (temporary < 900 px, permanent ≥ 900) with sections Dashboard · Catalogue (Products, Categories, Reviews) · Sales (Orders, Returns, Payments, Coupons, Special Offers) · Storefront (Hero Section, FAQs) · Operations (Shipping, Users, Leads, Settings) · "Back to Store"; AppBar with theme toggle (shared `useThemeContext`), notifications (polls orders+leads every 30 s), avatar menu; `useAdminBodyClass()` adds `body.admin-area`; MUI theme from `buildAdminTheme(mode)` (indigo/slate, `#4f46e5`, `#0b1220`…); logo constants `LOGO_LIGHT/LOGO_WHITE` (old wordmark).
- `AdminLogin.js`: email/password, `useAdmin().login`, no demo hints, old logo, `buildAdminTheme(isDarkMode ? …)`.
- `AdminDashboard.js`: stats cards (`getDashboardStats`), recent orders, low-stock list, quick actions; 13 hex literals.
- `AdminProducts.js` (569): table (Product/SKU/Category/Price/Stock/Flags/Status/Actions), search by name/SKU/brand, category select, **no sort/pagination**; form `emptyProduct` = `{ name, slug, sku, shortDescription, description, categoryId, brand, images: [], price, comparePrice, costPrice, stock, lowStockThreshold: 10, weight, dimensions{length,width,height}, variants: [], tags: [], featured, trending, hot, isActive: true, metaTitle, metaDescription }`; **images = one multiline textarea "Image URLs (one per line)" → `images[]`** (unlimited, no preview, no primary picker, no alt text); tags comma-separated; variants rows `{id,name,price,stock,sku}`; validation: name, unique slug (`makeUniqueSlug`), price > 0 unless variants; save = `admin.createProduct` / `admin.updateProduct(id, {...editingProduct, ...editable})`; **no `relatedProductIds`/`frequentlyBoughtTogetherIds` UI**; placeholders "16GB / 512GB", "laptop, gaming, ultrabook".
- `AdminCategories.js`: name/slug/description/image URL/parent/sortOrder/isActive/showInMainMenu/menuOrder; cycle guard; delete blocked by children (client) or products (`CATEGORY_IN_USE`).
- `AdminHeroSection.js` (1590): Slides tab (banners CRUD, duplicate, up/down reorder, live preview, gradient presets "Heritage/Bridal Muga/Sualkuchi/Bihu Night/Eri Warmth") + Section settings tab (`heroConfig`).
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
| CartContext | `useCart()` (also `hooks/useCart`) | `cartItems`, `isCartOpen`, `isLoading`, `addToCart(product, qty, {openDrawer})`, `removeFromCart`, `updateQuantity`, `clearCart({silent})`, `getCartTotal`, `getCartItemCount`, `toggleCart`, `setIsCartOpen`; line id = `${productId}-${variantId ?? "default"}`; SweetAlert toasts | `localStorage.cart`; debounced replace-sync to `/cart` for logged-in users |
| OrderContext | `useOrder()` | `orders`, `currentOrder`, `isLoading`, `createOrder(orderData)` (generates `ORD-<ts>-<rand>`), `loadUserOrders`, `getOrderById` | — |
| DealsConfigContext | `useDealsConfig()` | `config`, `enabled`, `loading`, `refresh` | refetch on focus |
| FaqContext | `useFaqs()` | `faqs`, `loading`, `refresh`, `forPlacement(p)`, `forProduct(product)`; fallback `DEFAULT_FAQS` (= `FAQ_ITEMS` constants) | refetch on focus + `faqs:updated` event |

Other storage keys: `localStorage.recentlyViewed` (PDP writes, Home reads, cap 20). `useSound` hook (unused) references `/assets/click-sound-1.wav` (file lives at `src/assets/`, so the path is wrong — dead code).

## 9. Routing (`src/App.js`)

- Storefront (inside `StorefrontShell` with `AnimatePresence` keyed on `pathname`, skip link, `Header`, `<main id="main-content">`, `Footer`, `BottomNav`): `/` Home · `/products` Products · `/products/:slug` ProductDetails (legacy numeric id redirects) · `/checkout` · `/order-confirmation/:orderNumber` · `/orders` · `/profile` · `/wishlist` · `/special-offers` · `/help` · `/support` · `/about` · `/privacy` · `/terms` · `/cookies` · `/refund` · `*` → `<Navigate to="/" />`.
- Admin: `/admin` (AdminLogin, index) and `/admin/*` under `AdminLayout`: `dashboard, products, categories, orders, returns, payments, users, shipping, coupons, special-offers, hero-section, faqs, reviews, leads, settings`.
- No `/cart`, `/login`, `/register`, `/search` routes (cart = drawer, auth = modal, search = `/products?search=`). `ScrollToTop` is global (instant `window.scrollTo(0,0)`). Page titles: store default from settings; PDP claims the tab. No lazy loading, no error routes.
- Link builders: `productPath(product)` (`src/utils/helpers.js`) → `/products/<slug|id>`; `categoryParam(cat)` (`src/utils/categories.js`) → `?category=<slug>`; `ROUTES` constants in `src/utils/constants.js`.

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
| `src/services/api.live.test.js` | K | Update BASE_URL assertion, banners→announcements, product fields (Prompt 36/39). |
| `src/utils/constants.js` | K (gutted) | Brand values move to `src/config/brand.js`; keep enums/routes. |
| `src/utils/{helpers,categories,faqs,heroConfig,dealsConfig,storeSettings,socialLinks,documentTitle,authStorage}.js` | K | `heroConfig.js` loses banner slide helpers when hero becomes product-driven (Prompt 14/34); `productPath` → `/product/`. |
| `src/hooks/useSound.js`, `src/assets/click-sound-1.wav` | X | Dead code, wrong path. |
| `src/components/Header/*` | R (layout) / K (overflow + menus logic) | Glass header, mega panel (Prompt 09). |
| `src/components/SidebarMenu/*` | R | Glass mobile drawer (Prompt 10). |
| `src/components/BottomNav/*` | K | Restyle (Prompt 10). |
| `src/components/CategoriesDrawer/*` | X | Replaced by the mega panel (Prompt 09). |
| `src/components/SearchModal/*` | K | Restyle + skincare terms + new fields (Prompt 11). |
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
