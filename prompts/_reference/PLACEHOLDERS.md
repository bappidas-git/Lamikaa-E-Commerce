# PLACEHOLDERS — every unknown fact, tokenised

> Brief §12. A token is a literal `{{UPPER_SNAKE}}` string. Rule: a token is **never** a value to invent. Where it lives in data or config it must render harmlessly (see "Rendering rules"). Each build prompt that introduces or resolves a token updates this file in its Handoff step; Prompt 39 regenerates the inventory from the real `db.json` and `src/` (`grep -rn "{{[A-Z_]*}}"`).

## Rendering rules (implemented in Prompt 02 → `src/utils/placeholders.js`)

- `PLACEHOLDER_RE` = `/\{\{[A-Z0-9_]+\}\}/` — upper case only, so ordinary prose in braces is never mistaken for a token.
- `isPlaceholder(value)` → `true` when a string contains at least one `{{…}}`.
- `resolveOrNull(value)` → `null` for a non-string, a blank/whitespace-only string, or anything carrying a token; the trimmed value otherwise. Call sites render with `{resolved && <row/>}`.
- `placeholderToken(value)` → the token's NAME without the braces (`"{{GSTIN}}"` → `"GSTIN"`), for the admin's "Placeholder — owner to supply" chip.
- `stripPlaceholderSentences(text)` → drops every sentence carrying a token and keeps the rest (sentences end at a `.` followed by a space, a newline, or end-of-string, so decimals and "Co. Ltd." survive).
- Contact rows (email/phone/address/hours), social links, GSTIN/CIN lines, announcement messages, shipping SLA lines: **hidden** while unresolved (never printed raw).
  - **Centralised since Prompt 02:** `normalizeStoreSettings()` (`src/utils/storeSettings.js`) resolves `store.email` / `store.phone` / `store.address` to `""` when they are tokens, so no storefront surface reading `useStoreSettings()` can print one by forgetting to check. `normalizeSocialUrl()` returns `""` for a placeholder, so no `https://{{…}}` link is ever rendered — `DEFAULT_SOCIAL_LINKS` therefore resolves to an all-blank map until the owner fills Admin → Settings → Social Links.
- Prices: `price: null` + `priceTBA: true` → "Price on launch" chip; Add to Cart / Buy Now disabled ("Coming soon"); excluded from "Add the whole ritual" bundles.
- Copy tokens inside FAQ answers / siteContent are filled by `fillStoreCopy()` (`src/utils/storeSettings.js`) when the setting is known and the whole sentence is dropped when it is not. Two shapes:
  - `{singleBrace}` — a figure the function computes: `{freeShipping}`, `{codSentence}`, `{taxNote}`. `{freeShipping}` degrades to `{{FREE_SHIPPING_THRESHOLD}}` when neither `options.freeAbove` nor `FREE_SHIPPING_THRESHOLD` carries a positive number, and the sentence around it is then dropped.
  - `{{DOUBLE_BRACE}}` — `{{RETURN_WINDOW_DAYS}}` is resolved from `options.returnWindowDays` (passed by `StoreSettingsContext` from `STOREFRONT_CONFIG.returnsWindowDays`); every other token reaching `fillStoreCopy` loses its sentence.
- The admin shows a small "Placeholder — owner to supply" chip beside any field whose value is a token (product price TBA, settings contact fields).

## Inventory

Status column: `introduced (NN)` = the token exists in the codebase as of Prompt NN. `planned (NN)` = the prompt that will create it.

| Token | Status | Where it lives (file → key) | Rendered where | Owner supplies | Candidate / source notes |
|---|---|---|---|---|---|
| `{{LAMIKAA_EMAIL}}` | introduced (02) | `src/config/brand.js → contact.email` → `utils/constants.js SUPPORT_EMAIL` → `DEFAULT_STORE_SETTINGS.store.email`; `db.json → settings.store.email` (06) | Footer contact block, Help Centre "Still need help?", Contact page, policies colophon | Customer-care email | Packaging prints **info@baopcl.com** (company email) — confirm it is the storefront care address. Blanked by `normalizeStoreSettings` while unresolved |
| `{{LAMIKAA_PHONE}}` | introduced (02) | `brand.js → contact.phone` → `constants.js SUPPORT_PHONE` → `DEFAULT_STORE_SETTINGS.store.phone`; `settings.store.phone` (06) | Footer, Help Centre, Contact page channels (Call), WhatsApp channel if no URL | Customer-care number | Packaging prints **+91 97076 91169** — confirm |
| `{{LAMIKAA_ADDRESS}}` | introduced (02) | `brand.js → contact.address` → `constants.js SUPPORT_ADDRESS` → `DEFAULT_STORE_SETTINGS.store.address`; `settings.store.address` (06) | Footer, Contact page "Visit us" card (and its Get-directions link), policies colophon, admin invoice | Registered/contact address | Packaging prints **Bokakhat Agro Organic Producer Co. Ltd., Bachagaon, Kaziranga National Park, Golaghat, Assam – 785609** — confirm the address to publish |
| `{{SUPPORT_HOURS}}` | introduced (02) | `brand.js → contact.hours` → `constants.js SUPPORT_HOURS`; `siteContent.contact.hoursNote` (06) | Footer contact block ("Hours" row), Help Centre lede, Contact page (form lede, sent confirmation, "Visit us" card) | Customer-care hours (days + time zone) | Packaging prints no hours. Every surface reads it through `resolveOrNull` and drops the clause/row while unresolved |
| `{{LAMIKAA_INSTAGRAM_URL}}` | introduced (02) | `brand.js → social.instagram` → `constants.js SOCIAL_LINKS.INSTAGRAM` → `DEFAULT_SOCIAL_LINKS`; `settings.social.instagram` (06) | Footer social row, Contact page | Instagram profile URL | Blanked by `normalizeSocialUrl` while unresolved |
| `{{LAMIKAA_FACEBOOK_URL}}` | introduced (02) | `brand.js → social.facebook`; same chain | same | Facebook page URL | — |
| `{{LAMIKAA_YOUTUBE_URL}}` | introduced (02) | `brand.js → social.youtube`; same chain | same | YouTube channel URL | — |
| `{{LAMIKAA_WHATSAPP_URL}}` | introduced (02) | `brand.js → social.whatsapp`; same chain | Footer social row, Contact "WhatsApp" channel | `https://wa.me/<number>` | Could be derived from `{{LAMIKAA_PHONE}}` once confirmed. A bare number is also accepted and repaired into a `wa.me` link |
| `{{LAMIKAA_DOMAIN}}` | introduced (02) | `brand.js → seo.siteUrl`; `public/index.html` `og:url` + `twitter:url`; `public/robots.txt` sitemap line (38); canonical tags via `useSeo` (08) | `<link rel=canonical>`, `og:url`, JSON-LD `url`, `robots.txt` | Public storefront domain | `.env.production` points the API at `core.lamikanaturals.com` → candidate **lamikanaturals.com** (single "a" in the host) — confirm. A raw token is tolerated in static HTML until Prompt 36 verifies it is resolved or removed; canonicals use `window.location.origin` meanwhile |
| `{{GSTIN}}` | introduced (02) | `brand.js → legal.gstin`; `siteContent.policies.terms` (06) | Footer legal line, Terms, admin invoice | GST registration number | Not rendered anywhere yet (the footer legal line arrives in Prompt 13) |
| `{{CIN}}` | introduced (02) | `brand.js → legal.cin`; `siteContent.policies.terms` (06) | Footer legal line, Terms | Corporate Identification Number of BAOPCL | As above |
| `{{FREE_SHIPPING_THRESHOLD}}` | introduced (02) | `brand.js → announcements[1].text`; emitted by `fillStoreCopy` when `{freeShipping}` cannot be resolved; `db.json → shipping_methods[0].freeAbove` (null until set, 06) | Announcement bar, cart-drawer free-shipping meter, footer promise row, trust badge "Free shipping", FAQ 6 | Order value above which shipping is free (₹) | Admin → Shipping. `FREE_SHIPPING_THRESHOLD` in `constants.js` is now **`null`**; every consumer (AnnouncementBar, CartDrawer, Footer, `fillStoreCopy`) treats null as "unknown → hide" |
| `{{LAUNCH_OFFER_TEXT}}` | introduced (02) | `brand.js → announcements[2].text`; `db.json → announcements[2].text` (inactive until edited, 06) | Announcement bar | Launch offer wording | Admin → Announcements |
| `{{PRICE_FACE_WASH}}` | planned (06) | `products[0].price` | Cards, hero, PDP, cart | Selling price | **Resolved from packaging MRP ₹390** (`priceSource: "packaging-mrp"`) — confirm |
| `{{PRICE_GOAT_MILK_SOAP}}` | planned (06) | `products[1].price` | same | Selling price | **Resolved from packaging MRP ₹90** — confirm |
| `{{PRICE_BODY_WASH}}` | planned (06) | `products[2].price = null, priceTBA: true` | "Price on launch" | Selling price | MRP masked on the pack |
| `{{PRICE_FACE_MASK}}` | planned (06) | `products[3]` TBA | same | Selling price | MRP masked |
| `{{PRICE_FACE_MIST}}` | planned (06) | `products[4]` TBA | same | Selling price | MRP masked |
| `{{PRICE_FACE_SCRUB}}` | planned (06) | `products[5].price` | Cards, hero, PDP, cart | Selling price | **Resolved from packaging MRP ₹349** — confirm |
| `{{PRICE_FACE_SERUM}}` | planned (06) | `products[6]` TBA | "Price on launch" | Selling price | MRP masked |
| `{{PRICE_MOISTURIZER_GEL}}` | planned (06) | `products[7]` TBA | same | Selling price | MRP masked |
| `{{SIZE_FACE_WASH}}` … `{{SIZE_MOISTURIZER_GEL}}` (8) | planned (06) | `products[*].size` | PDP purchase panel, cards | Net volume/weight | **All eight resolved from packaging**: 200 ml · 100 g · 250 ml · 100 g · 100 ml · 100 g · 30 ml · 100 ml |
| `{{INCI_FACE_WASH}}` … `{{INCI_MOISTURIZER_GEL}}` (8) | planned (06) | `products[*].ingredientsList` | PDP "Full ingredients" | INCI list | **All eight resolved from packaging** (verbatim in `PRODUCTS.md`) — owner to proof-read against the final artwork |
| `{{SHELF_LIFE}}` | introduced (02) | `brand.js → productDefaults.shelfLife`; PDP "Good to know" row (25) | PDP | Period-after-opening / shelf life | Packs print Mfg → Exp about 23 months apart (e.g. Aug-2026 → July-2028) — do **not** state a figure until confirmed; row hidden while unresolved |
| `{{CERTIFICATIONS}}` | introduced (02) | `brand.js → packBadges[]` (marker in the comment above it) | PDP "As printed on the pack" chips | Confirmation that the roundels are valid | Packaging prints ISO Certified · GMP Certified · Non-GMO · Cruelty-Free — seeded as those four labels *as printed*; remove any the owner cannot substantiate |
| `{{RETURN_WINDOW_DAYS}}` | introduced (02) | `constants.js FAQ_ITEMS[6].answer`; `src/theme/tokens.js → STOREFRONT_CONFIG.returnsWindowDays`; `siteContent.policies.shippingReturns` (06) | Returns FAQ, trust badge, PDP delivery panel, Order History return eligibility, Refund policy | Return window in days | `STOREFRONT_CONFIG.returnsWindowDays` still holds the boilerplate default **7**; `fillStoreCopy` substitutes it into the FAQ answer and drops the sentence if it is ever 0/unset. Confirm, or set 0 for "no returns" |
| `{{DISPATCH_SLA}}` | planned (06) | `db.json → shipping_methods[0].estimatedDays` ("" until set); `siteContent.policies.shippingReturns` | Checkout shipping option, delivery panel, FAQ | Dispatch/delivery time | Admin → Shipping |
| `{{TAX_RATE_PERCENT}}` | planned (06) | `db.json → settings.store.taxRate` (0) with `taxIncluded: true` | Checkout tax line, Terms tax clause, FAQ | GST rate if prices are to be shown exclusive | Packs print "M.R.P (incl. of all taxes)" → seeded tax-inclusive with rate 0. `fillStoreCopy`'s `{taxNote}` already prints **"inclusive of all taxes"** for that combination (Prompt 02) |
| `{{JURISDICTION}}` | planned (06) | `siteContent.policies.terms` (jurisdiction sentence) | Terms of Service | Courts/jurisdiction named in the terms | The sentence is dropped by `stripPlaceholderSentences` until resolved |
| `{{REFUND_TIMELINE}}` | planned (06) | `siteContent.policies.shippingReturns` (refund sentence) | Shipping & Returns policy, returns FAQ | Refund processing time after inspection | The sentence is dropped until resolved; never seed a number |

## Not tokens, but flagged sample data (replace before launch)

- `db.json → users[0]` "Sample Customer" (`sample.customer@example.com` / `password123`), `admins[0]` (`admin@store.com` / `admin123` — change in production), sample orders/payments/refunds/wallet rows, `coupons[0]` `SAMPLE10` (description says sample), two reviews with `isSample: true` (hidden by `brand.flags.showSampleReviews`), `leads` fixtures. All listed in Prompt 06 and again in Prompt 39's release notes.
- Placeholder media: see `PLACEHOLDER_ASSETS.md`.
