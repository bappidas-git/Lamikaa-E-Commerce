# Prompt 02 — Brand config module and identity assets

- **Phase:** 0 — Foundations
- **Depends on:** 01
- **Unlocks:** 03, 06
- **Scope:** M
- **Expected files to change/create:** create `src/config/brand.js`, `src/utils/placeholders.js`, `src/utils/cloudinary.js`, `src/components/brand/Logo.js`, `src/components/brand/Logo.module.css`, `README.md`; change `src/utils/constants.js`, `src/utils/storeSettings.js`, `src/utils/socialLinks.js`, `src/components/Header/Header.js`, `src/components/SidebarMenu/SidebarMenu.js`, `src/components/Footer/Footer.js`, `src/components/AuthModal/AuthModal.js`, `src/components/AdminLayout/AdminLayout.js`, `src/pages/Admin/AdminLogin.js`, `public/index.html`, `public/manifest.json`, `public/favicon.ico`, `public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/apple-touch-icon.png`, `public/android-chrome-192x192.png`, `public/android-chrome-512x512.png`, new `public/maskable-512x512.png`, `package.json`, `.env`, `.env.example`, `.env.production`, `prompts/_reference/PLACEHOLDERS.md`.

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompt 01 is marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Create the single source of brand truth (`src/config/brand.js`), the placeholder and Cloudinary helpers, a `Logo` component, and re-point every hard-coded identity surface (constants, `public/index.html`, manifest, favicons, package metadata, env files) at LAMIKAA NATURALS — without touching layout or theme yet.

## Pre-flight checks

```bash
grep -n "meghali-silk-logo" -r src public | wc -l          # 10 (5 components ×2 + index.html ×3 = the old logo constants)
grep -n "APP_NAME\|APP_TAGLINE\|SUPPORT_EMAIL\|SOCIAL_LINKS\|TRUST_BADGES\|FAQ_ITEMS\|WHY_CHOOSE_US\|FREE_SHIPPING_THRESHOLD" src/utils/constants.js
grep -rn "FREE_SHIPPING_THRESHOLD" src --include=*.js | grep -v constants.js   # AnnouncementBar, CartDrawer, Footer, storeSettings.js, tokens.js consumers
curl -sI "https://res.cloudinary.com/v8vrixwq/image/upload/w_32,h_32,c_fit,f_png/v1788670625/icon.png" | head -1   # 200
```

## Tasks

1. **`src/config/brand.js`** — export a default `brand` object (also named export) with exactly these keys (values from `BRAND.md`, `PRODUCTS.md` §1, `PLACEHOLDERS.md`):
   ```js
   import { cld } from "../utils/cloudinary";
   export const LOGO_URL = "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670626/logo.png";
   export const ICON_URL = "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670625/icon.png";
   export const brand = {
     name: "LAMIKAA NATURALS", shortName: "LAMIKAA", runningName: "LAMIKAA Naturals",
     legalName: "Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL)", legalShort: "BAOPCL",
     tagline: "Indigenous Wisdom. Modern Beauty. Shared Prosperity.",
     philosophy: "Indigenous Wisdom. Modern Science. Responsible Beauty.",
     signatureLines: ["Beauty that creates value.", "Value that reaches farmers.", "Prosperity that reaches families.", "When LAMIKAA grows, our farmers grow with us."],
     legalNote: "LAMIKAA Naturals is owned by Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL), a Farmer Producer Company. Profits distributed by BAOPCL can reach member farmers as dividends, subject to applicable laws and the company's dividend declaration.",
     valueChain: ["Farmer", "FPC", "Value Addition", "LAMIKAA Naturals", "Consumer", "Profit", "Farmer Members"],
     pillars: [ { key: "indigenous-knowledge", title: "Indigenous Knowledge", text: "Respecting the traditional wisdom and natural heritage of our region." }, { key: "modern-science", title: "Modern Cosmetic Science", text: "Combining traditional ingredients and knowledge with modern formulation, research and quality standards." }, { key: "farmer-ownership", title: "Farmer Ownership", text: "Creating a business where farmers participate not only in supplying raw materials but also in the economic value created by the enterprise." }, { key: "responsible-beauty", title: "Responsible Beauty", text: "Building products and processes that respect people, communities and the environment." } ],
     logoUrl: LOGO_URL, iconUrl: ICON_URL, logoAspect: 3.5, currency: "INR", locale: "en-IN",
     trustBadges: ["Farmer to Consumer", "100% Organic", "Result Oriented"],
     packBadges: ["ISO Certified", "GMP Certified", "Non-GMO", "Cruelty-Free"],   // as printed on packaging — owner to confirm ({{CERTIFICATIONS}})
     announcements: [ { id: "farmer-owned", text: "Farmer-owned. Assam-grown." }, { id: "free-shipping", text: "Free shipping over ₹{{FREE_SHIPPING_THRESHOLD}}" }, { id: "launch", text: "{{LAUNCH_OFFER_TEXT}}" } ],
     contact: { email: "{{LAMIKAA_EMAIL}}", phone: "{{LAMIKAA_PHONE}}", address: "{{LAMIKAA_ADDRESS}}", hours: "{{SUPPORT_HOURS}}" },
     social: { instagram: "{{LAMIKAA_INSTAGRAM_URL}}", facebook: "{{LAMIKAA_FACEBOOK_URL}}", youtube: "{{LAMIKAA_YOUTUBE_URL}}", whatsapp: "{{LAMIKAA_WHATSAPP_URL}}", twitter: "" },
     legal: { gstin: "{{GSTIN}}", cin: "{{CIN}}" },
     search: { popular: ["Face Wash", "Face Serum", "Moisturizer Gel", "Black Rice", "Morning ritual", "Goat Milk Soap"] },
     seo: { siteUrl: "{{LAMIKAA_DOMAIN}}", defaultTitle: "LAMIKAA NATURALS — Black Rice Skincare, Farmer-Owned", titleTemplate: "%s · LAMIKAA NATURALS", defaultDescription: "Farmer-owned skincare rooted in the indigenous wisdom of Assam and Northeast India. The Black Rice range: cleanse, refresh, treat and moisturise — beauty that creates value for farmers.", ogImage: cld(LOGO_URL, { w: 1200 }) },
     productDefaults: { shelfLife: "{{SHELF_LIFE}}", suitableFor: "All skin types — patch test recommended", brand: "LAMIKAA Naturals" },
     flags: { showSampleReviews: false, enableRitualBundles: false },
   };
   export default brand;
   ```
   Every component, page, meta tag and admin screen reads from here from now on. No other file may hard-code the name, legal name, logo or icon URL.
2. **`src/utils/placeholders.js`** — `export const PLACEHOLDER_RE = /\{\{[A-Z0-9_]+\}\}/;` `isPlaceholder(value)`, `resolveOrNull(value)` (null for non-strings, placeholders and blanks), `stripPlaceholderSentences(text)` (drops any sentence containing a token; sentences split on `. `/`.\n`), `placeholderToken(value)` (returns the token name or null). Pure functions, unit-testable, no React.
3. **`src/utils/cloudinary.js`** — `export const isCloudinary = (url) => /res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url)`; `export function cld(url, { w, h, crop, ar, pad, fit = true, quality = "auto", format = "auto", gravity } = {})` building `…/upload/<chain>/v…` where the chain is: `c_crop,x_,y_,w_,h_` when `crop` is `{x,y,w,h}`; then `c_pad,ar_<ar>,b_auto` when `pad && ar` (or `c_fill,g_auto,ar_` when `gravity === "auto"`); then `f_<format>,q_<quality>` plus `w_<w>` / `h_<h>` and `c_fit` when both given and `fit`. Non-Cloudinary URLs are returned unchanged. Also `export const srcSet = (url, widths = [480, 768, 1080, 1440, 1920], opts) => widths.map(w => `${cld(url, { ...opts, w })} ${w}w`).join(", ")` and `export const SRCSET_WIDTHS`. Chained segments are `/`-separated exactly like `c_crop,x_700,y_10,w_425,h_750/c_pad,ar_1:1,b_auto/f_auto,q_auto,w_900`.
4. **`src/components/brand/Logo.js`** — `<Logo variant="wordmark" | "mark" width={168} className alt />`: renders `<img>` with `src={cld(brand.logoUrl, { w: Math.ceil(width * 2) })}` (2× for retina), explicit `width`/`height` (`height = width / brand.logoAspect` for the wordmark; square for the mark), `alt={alt ?? brand.name}`, `loading="eager"`, `decoding="async"`. The mark variant uses `brand.iconUrl`. Minimal CSS module (`display:block; height:auto`). Replace the ten old logo usages: `Header.js:57` (`LOGO_SRC`), `SidebarMenu.js:40-42`, `Footer.js:45`, `AuthModal.js:26-28`, `AdminLayout.js:43-46`, `AdminLogin.js:25-28` — delete the constants, render `<Logo …/>` (or `brand.logoUrl` through `cld`) in place. Where a component picks a logo by `isDarkMode` (SidebarMenu 362, AuthModal 553, AdminLayout 372-376, AdminLogin 154-158) both branches now render the same `<Logo>`; the `isDarkMode` reads themselves are removed in Prompt 03.
5. **`src/utils/constants.js`** — rewrite the brand-bound exports: `APP_NAME = brand.name`, `APP_TAGLINE = brand.tagline`, `APP_DESCRIPTION = brand.seo.defaultDescription`; `SOCIAL_LINKS = { FACEBOOK: brand.social.facebook, TWITTER: brand.social.twitter, INSTAGRAM: brand.social.instagram, YOUTUBE: brand.social.youtube, WHATSAPP: brand.social.whatsapp }`; `SUPPORT_EMAIL/PHONE/ADDRESS/HOURS` from `brand.contact`; `POLICY_LAST_UPDATED` = today's date in the same long format; `FREE_SHIPPING_THRESHOLD = null` (the threshold now comes only from live shipping methods `freeAbove`; every consumer must treat `null` as "unknown → hide"); `TRUST_BADGES = brand.trustBadges`; `WHY_CHOOSE_US` = the four pillars (`{ id, title, description, icon }` with icons `mdi:leaf`, `mdi:flask-outline`, `mdi:account-group-outline`, `mdi:earth`); `FAQ_ITEMS` = the eight site FAQs below (this is also the fallback set `FaqContext` uses when the API is unreachable, and Prompt 06 seeds the same rows):
   1. "Who owns LAMIKAA Naturals?" — from `BRAND.md` 3.1 (two sentences, keep "can reach its member farmers as dividends, subject to applicable laws and the company's dividend declaration").
   2. "Does buying LAMIKAA products benefit farmers?" — from 3.3 (keep "can"/"may" and the dividend qualifier).
   3. "Why is black rice in every product?" — "Black rice is the hero ingredient of the range: antioxidant-rich and traditionally valued in Northeast India. Each product pairs it with botanicals chosen for a specific step of your routine."
   4. "Are the products suitable for all skin types?" — "The range is formulated for everyday use. As printed on the packs, do a patch test before first use, keep away from the eyes and discontinue use if irritation occurs."
   5. "Do the products have a fragrance?" — "The Black Rice range carries a mild sandalwood fragrance, as printed on the packs."
   6. "How long does delivery take, and is shipping free?" — "Dispatch and delivery times are shown at checkout for your address. {freeShipping}" (the `{freeShipping}` sentence is dropped while the threshold is unknown — see Task 6).
   7. "What is your return policy?" — "You can request a return from My Orders within {{RETURN_WINDOW_DAYS}} days of delivery for unopened products in their original packaging. Opened skincare cannot be returned for hygiene reasons unless it arrived damaged." (token rendered via `fillStoreCopy`).
   8. "How do I track my order?" — keep the existing generic answer.
   Keep every non-brand export (`ROUTES`, statuses, `RETURN_REASONS`, `CURRENCIES`, `ANIMATION_VARIANTS`, `BREAKPOINTS`, `PRODUCT_FLAGS`, `PAYMENT_METHODS`) unchanged; `ROUTES` is updated in Prompt 08.
6. **`src/utils/storeSettings.js`** — `fillStoreCopy`: when `FREE_SHIPPING_THRESHOLD` is `null` and no `shipping` argument carries a `freeAbove`, replace the whole sentence containing `{freeShipping}` with `""` (use `stripPlaceholderSentences`-style logic on `{freeShipping}`); accept an optional third argument `{ freeAbove }` so later prompts can pass the live threshold. `taxNote`: when `taxIncluded && !taxRate` → `"inclusive of all taxes"`. `DEFAULT_STORE_SETTINGS` now reads brand values through the constants (already the case) — verify `store.name === "LAMIKAA NATURALS"`.
7. **`src/utils/socialLinks.js`** — `normalizeSocialUrl` returns `""` for any value where `isPlaceholder(value)` is true, so no `https://{{…}}` link can render; `DEFAULT_SOCIAL_LINKS` therefore resolves to all-blank until the owner fills the admin.
8. **`public/index.html`** — replace every Meghali line: `<title>` = `brand.seo.defaultTitle`; `meta[name=description]`, `keywords` ("black rice skincare, farmer-owned beauty, Assam skincare, LAMIKAA Naturals, face serum, face wash, moisturizer gel, Northeast India"), `author` = "LAMIKAA Naturals"; OG/Twitter: `og:site_name` "LAMIKAA NATURALS", `og:url`/`twitter:url` → `https://{{LAMIKAA_DOMAIN}}/` (a placeholder is acceptable in static HTML for now; Prompt 36 verifies it is either resolved or removed), `og:title`, `og:description`, `og:image` → `https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_1200/v1788670626/logo.png` (1200×343, `og:image:width/height` accordingly), `twitter:card` stays `summary`; preload the new logo at `f_auto,q_auto,w_520`; splash screen: one `<img class="loader-logo">` (the wordmark, `width="1400" height="400"`), tagline text = master tagline, palette literals in the inline CSS switched to the dark set (`#0B0B0D` ground, `#141416`, `#F7F5F0`, `#B8B5B0`, `#F5D76E`, hairline `rgba(255,255,255,.08)`) — the light/dark branches and the `.loader-logo-dark` element are deleted here; the pre-mount theme script is removed in Prompt 03 (leave it for now but make its dark branch the only visible outcome: set both gradients to the dark ground so no ivory flash can occur). Keep `#loading-screen`, `.fade-out`, `body.react-loaded` and the hide script intact. Favicon `<link>`s point at the regenerated files; add `<link rel="manifest">` (exists) and `<meta name="theme-color" content="#0B0B0D">`.
9. **Favicons from the icon (Cloudinary-resized, no local image tooling needed):**
   ```bash
   B="https://res.cloudinary.com/v8vrixwq/image/upload"; V="v1788670625/icon.png"
   curl -sL "$B/w_16,h_16,c_fit,f_png/$V"  -o public/favicon-16x16.png
   curl -sL "$B/w_32,h_32,c_fit,f_png/$V"  -o public/favicon-32x32.png
   curl -sL "$B/w_48,h_48,c_fit,f_ico/$V"  -o public/favicon.ico
   curl -sL "$B/w_180,h_180,c_fit,f_png/$V" -o public/apple-touch-icon.png
   curl -sL "$B/w_192,h_192,c_fit,f_png/$V" -o public/android-chrome-192x192.png
   curl -sL "$B/w_512,h_512,c_fit,f_png/$V" -o public/android-chrome-512x512.png
   curl -sL "$B/w_410,h_410,c_fit/w_512,h_512,c_lpad,b_rgb:0B0B0D,f_png/$V" -o public/maskable-512x512.png
   file public/favicon.ico public/*.png   # every file must be a real PNG/ICO of the stated size
   ```
   If `f_ico` is refused, build the ICO from the 32 px PNG with a 20-line Node script (ICO header + PNG payload — ICO supports embedded PNG) and note it.
10. **`public/manifest.json`** — `short_name: "LAMIKAA"`, `name: "LAMIKAA NATURALS"`, `description` = `brand.seo.defaultDescription`, `lang: "en-IN"`, `categories: ["shopping", "beauty", "lifestyle"]`, icons 192 (`any`), 512 (`any`), `maskable-512x512.png` (`maskable`), `theme_color: "#0B0B0D"`, `background_color: "#0B0B0D"`, `display: "standalone"`, `start_url: "."`.
11. **`package.json`** — `name: "lamikaa-naturals-storefront"`, add `description: "LAMIKAA NATURALS — farmer-owned Black Rice skincare storefront and admin (CRA + JSON Server / Laravel API)"`, `author: "Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL)"`. Do not touch dependencies or scripts.
12. **Env files** — remove `REACT_APP_NAME` (the name now lives in `brand.js`; `constants.js` no longer reads it) and `REACT_APP_VERSION` from `.env`, `.env.example`, `.env.production`; rewrite the header comments for LAMIKAA (mock vs live Laravel at `https://core.lamikanaturals.com/api/v1`); keep every API/feature/build/payment/shipping line as is. `grep -n meghali .env*` → 0.
13. **`README.md`** (stub; Prompt 39 completes it): title, one paragraph from `brand.seo.defaultDescription`, "Run in mock mode" (`npm run dev`), "Run against the live API" (env switch), "Admin" (`/admin`), "Programme" (link to `prompts/00_INDEX.md`).
14. **Placeholder inventory** — `{{SUPPORT_HOURS}}` is already listed in `PLACEHOLDERS.md`; update its row to `introduced (02)` and keep the rest of the inventory accurate (constants → `SUPPORT_HOURS` → Footer/Contact; hidden while unresolved) and mark the tokens now living in `brand.js` with their new locations.

## Design and content specification

No layout changes. The header/footer/auth/admin logos simply switch to the LAMIKAA wordmark at the sizes the current CSS gives them; if the old CSS assumes a 1454×454 (3.2:1) image the new 3.5:1 wordmark still fits (`height:auto`). The splash screen shows the wordmark on `#0B0B0D` with the master tagline in the current serif (fonts change in Prompt 04).

## Data and API changes

None in `db.json` or `api.js`. Note for Prompt 06: `settings.store.name/tagline/email/phone/address` and `settings.social.*` will be seeded from `brand.js` values (placeholders included).

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: never inline the logo/icon URLs outside `brand.js` and `public/index.html`; do not resolve any `{{TOKEN}}` with a guessed value; do not start the theme removal (Prompt 03).

## Acceptance criteria

- [ ] `src/config/brand.js` exports the object above; `grep -rn "meghali-silk-logo\|v1787592407\|v1787592405" src public` → 0.
- [ ] Header, mobile menu, footer, auth modal, admin shell and admin login all render the LAMIKAA wordmark from `<Logo>`.
- [ ] Browser tab shows the LAMIKAA favicon; `public/` contains 7 regenerated icon files of the correct sizes; manifest validates (Chrome → Application → Manifest shows no errors).
- [ ] `<title>` and meta/OG tags in `public/index.html` carry LAMIKAA copy; the splash screen shows the new wordmark on `#0B0B0D` with no ivory flash.
- [ ] Footer/contact surfaces show **no** `{{…}}` text and no `https://{{` links (contact rows and social marks are hidden while unresolved).
- [ ] `FAQ_ITEMS` contains the eight LAMIKAA FAQs; the help page shows them when the API is unreachable (stop JSON Server and reload `/help`).
- [ ] `package.json` name/description/author updated; env files carry no `REACT_APP_NAME`.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
grep -rn "meghali\|Meghali" src public package.json .env .env.example .env.production | grep -v "^src/pages\|^src/components/\(Search\|Cart\|Announcement\|Trust\|Hero\)\|storefront-tokens\|colors.js\|App.css\|ThemeContext\|categories.js\|documentTitle\|heroConfig\|api\.\|baseURL"   # expect 0 lines from the files this prompt touched
node -e "const {cld}=require('./src/utils/cloudinary.js');" 2>/dev/null || echo "ESM — verify cld() in the browser console via a temporary import instead"
CI=true npm run build && npm test -- --watchAll=false
npm run dev   # then check: tab title, favicon, header/footer logo, /help fallback with server stopped
file public/favicon.ico public/favicon-16x16.png public/favicon-32x32.png public/apple-touch-icon.png public/android-chrome-192x192.png public/android-chrome-512x512.png public/maskable-512x512.png
```

Manual QA at 390 / 768 / 1280: header logo legible and not clipped; footer logo legible; auth modal logo; admin login and shell logo; no raw `{{` anywhere (search the DOM: `document.body.innerText.includes("{{")` must be `false`).

## Handoff

1. `PROGRESS.md`: row 02 → `complete`; Decisions log (ICO generation path used, any placeholder sentence-dropping edge cases); Placeholders section (`{{SUPPORT_HOURS}}` introduced; locations moved to `brand.js`).
2. `PLACEHOLDERS.md` updated per Task 14.
3. Commit: `feat(lamikaa): 02 brand config module and identity assets`.
