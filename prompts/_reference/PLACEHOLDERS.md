# PLACEHOLDERS — every unknown fact, tokenised

> Brief §12. A token is a literal `{{UPPER_SNAKE}}` string. Rule: a token is **never** a value to invent. Where it lives in data or config it must render harmlessly (see "Rendering rules"). Each build prompt that introduces or resolves a token updates this file in its Handoff step; Prompt 39 regenerates the inventory from the real `db.json` and `src/` (`grep -rn "{{[A-Z_]*}}"`).

## Rendering rules (implemented in Prompt 02 → `src/utils/placeholders.js`)

- `isPlaceholder(value)` → `true` when a string contains `{{…}}`.
- `resolveOrNull(value)` → `null` for placeholders, the value otherwise.
- Contact rows (email/phone/address), social links, GSTIN/CIN lines, announcement messages, shipping SLA lines: **hidden** while unresolved (never printed raw). `normalizeSocialUrl()` returns `""` for placeholder values so no `https://{{…}}` link is ever rendered.
- Prices: `price: null` + `priceTBA: true` → "Price on launch" chip; Add to Cart / Buy Now disabled ("Coming soon"); excluded from "Add the whole ritual" bundles.
- Copy tokens inside FAQ answers/siteContent (`{{RETURN_WINDOW_DAYS}}`, `{{DISPATCH_SLA}}`, `{{FREE_SHIPPING_THRESHOLD}}`) are filled by `fillStoreCopy()` when the setting is known and the sentence is dropped when it is not.
- The admin shows a small "Placeholder — owner to supply" chip beside any field whose value is a token (product price TBA, settings contact fields).

## Inventory

| Token | Where it lives (file → key) | Rendered where | Owner supplies | Candidate / source notes |
|---|---|---|---|---|
| `{{LAMIKAA_EMAIL}}` | `src/config/brand.js → contact.email`; `db.json → settings.store.email` | Footer contact, Contact page, policies colophon, order emails (n/a) | Customer-care email | Packaging prints **info@baopcl.com** (company email) — confirm it is the storefront care address |
| `{{LAMIKAA_PHONE}}` | `brand.js → contact.phone`; `settings.store.phone` | Footer, Contact page channels (Call), WhatsApp channel if no URL | Customer-care number | Packaging prints **+91 97076 91169** — confirm |
| `{{LAMIKAA_ADDRESS}}` | `brand.js → contact.address`; `settings.store.address` | Footer, Contact page, policies colophon, admin invoice | Registered/contact address | Packaging prints **Bokakhat Agro Organic Producer Co. Ltd., Bachagaon, Kaziranga National Park, Golaghat, Assam – 785609** (context: Bokakhat, Assam) — confirm the address to publish |
| `{{LAMIKAA_INSTAGRAM_URL}}` | `brand.js → social.instagram`; `settings.social.instagram` | Footer social row, Contact page | Instagram profile URL | — |
| `{{LAMIKAA_FACEBOOK_URL}}` | `brand.js → social.facebook`; `settings.social.facebook` | same | Facebook page URL | — |
| `{{LAMIKAA_YOUTUBE_URL}}` | `brand.js → social.youtube`; `settings.social.youtube` | same | YouTube channel URL | — |
| `{{LAMIKAA_WHATSAPP_URL}}` *(added — the settings schema has a `whatsapp` key)* | `settings.social.whatsapp` | Footer social row, Contact "WhatsApp" channel | `https://wa.me/<number>` | Could be derived from `{{LAMIKAA_PHONE}}` once confirmed |
| `{{LAMIKAA_DOMAIN}}` | `brand.js → seo.siteUrl`; `public/index.html` OG/Twitter URLs; `public/robots.txt` sitemap line; canonical tags (`useSeo`) | `<link rel=canonical>`, `og:url`, JSON-LD `url`, `robots.txt` | Public storefront domain | `.env.production` points the API at `core.lamikanaturals.com` → candidate **lamikanaturals.com** (note the single "a" in the host) — confirm; until then canonicals use `window.location.origin` |
| `{{GSTIN}}` | `brand.js → legal.gstin`; `siteContent.policies.terms` | Footer legal line, Terms, admin invoice | GST registration number | — |
| `{{CIN}}` | `brand.js → legal.cin`; `siteContent.policies.terms` | Footer legal line, Terms | Corporate Identification Number of BAOPCL | — |
| `{{FREE_SHIPPING_THRESHOLD}}` | `db.json → shipping_methods[0].freeAbove` (null until set); announcement row 2 | Announcement bar, cart-drawer free-shipping meter, trust badge "Free shipping", FAQ answer | Order value above which shipping is free (₹) | Admin → Shipping; meter/badge/announcement hidden while null |
| `{{LAUNCH_OFFER_TEXT}}` | `db.json → announcements[2].text` (inactive until edited) | Announcement bar | Launch offer wording | Admin → Announcements |
| `{{PRICE_FACE_WASH}}` | `products[0].price` | Cards, hero, PDP, cart | Selling price | **Resolved from packaging MRP ₹390** (`priceSource: "packaging-mrp"`) — confirm |
| `{{PRICE_GOAT_MILK_SOAP}}` | `products[1].price` | same | Selling price | **Resolved from packaging MRP ₹90** — confirm |
| `{{PRICE_BODY_WASH}}` | `products[2].price = null, priceTBA: true` | "Price on launch" | Selling price | MRP masked on the pack |
| `{{PRICE_FACE_MASK}}` | `products[3]` TBA | same | Selling price | MRP masked |
| `{{PRICE_FACE_MIST}}` | `products[4]` TBA | same | Selling price | MRP masked |
| `{{PRICE_FACE_SCRUB}}` | `products[5].price` | Cards, hero, PDP, cart | Selling price | **Resolved from packaging MRP ₹349** — confirm |
| `{{PRICE_FACE_SERUM}}` | `products[6]` TBA | "Price on launch" | Selling price | MRP masked |
| `{{PRICE_MOISTURIZER_GEL}}` | `products[7]` TBA | same | Selling price | MRP masked |
| `{{SIZE_FACE_WASH}}` … `{{SIZE_MOISTURIZER_GEL}}` (8) | `products[*].size` | PDP purchase panel, cards | Net volume/weight | **All eight resolved from packaging**: 200 ml · 100 g · 250 ml · 100 g · 100 ml · 100 g · 30 ml · 100 ml |
| `{{INCI_FACE_WASH}}` … `{{INCI_MOISTURIZER_GEL}}` (8) | `products[*].ingredientsList` | PDP "Full ingredients" | INCI list | **All eight resolved from packaging** (verbatim in `PRODUCTS.md`) — owner to proof-read against the final artwork |
| `{{SHELF_LIFE}}` | `brand.js → productDefaults.shelfLife`; PDP "Good to know" row | PDP | Period-after-opening / shelf life | Packs print Mfg → Exp about 23 months apart (e.g. Aug-2026 → July-2028) — do **not** state a figure until confirmed; row hidden while unresolved |
| `{{CERTIFICATIONS}}` | `brand.js → packBadges[]` | PDP "As printed on the pack" chips | Confirmation that the roundels are valid | Packaging prints ISO Certified · GMP Certified · Non-GMO · Cruelty-Free — seeded as those four labels *as printed*; remove any the owner cannot substantiate |
| `{{RETURN_WINDOW_DAYS}}` | `src/theme/tokens.js → STOREFRONT_CONFIG.returnsWindowDays`; `siteContent.policies.shippingReturns` | Trust badge, PDP delivery panel, Order History return eligibility, Refund policy, FAQ | Return window in days | Seeded with the boilerplate default **7** (flagged `// PLACEHOLDER {{RETURN_WINDOW_DAYS}}`); confirm or set 0 for "no returns" |
| `{{DISPATCH_SLA}}` | `db.json → shipping_methods[0].estimatedDays` ("" until set); `siteContent.policies.shippingReturns` | Checkout shipping option, delivery panel, FAQ | Dispatch/delivery time | Admin → Shipping |
| `{{TAX_RATE_PERCENT}}` *(added)* | `db.json → settings.store.taxRate` (0) with `taxIncluded: true` | Checkout tax line, Terms tax clause, FAQ | GST rate if prices are to be shown exclusive | Packs print "M.R.P (incl. of all taxes)" → seeded as tax-inclusive with rate 0 and the wording "inclusive of all taxes" |
| `{{SUPPORT_HOURS}}` *(added — introduced by Prompt 02)* | `brand.js → contact.hours`; `siteContent.contact.hoursNote` | Contact page channels, footer contact block | Customer-care hours (days + time zone) | — (packaging prints no hours) |
| `{{JURISDICTION}}` *(added — introduced by Prompt 06)* | `siteContent.policies.terms` (jurisdiction sentence) | Terms of Service | Courts/jurisdiction named in the terms | The sentence is dropped by `stripPlaceholderSentences` until resolved |
| `{{REFUND_TIMELINE}}` *(added — introduced by Prompt 06)* | `siteContent.policies.shippingReturns` (refund sentence) | Shipping & Returns policy, returns FAQ | Refund processing time after inspection | The sentence is dropped until resolved; never seed a number |

## Not tokens, but flagged sample data (replace before launch)

- `db.json → users[0]` "Sample Customer" (`sample.customer@example.com` / `password123`), `admins[0]` (`admin@store.com` / `admin123` — change in production), sample orders/payments/refunds/wallet rows, `coupons[0]` `SAMPLE10` (description says sample), two reviews with `isSample: true` (hidden by `brand.flags.showSampleReviews`), `leads` fixtures. All listed in Prompt 06 and again in Prompt 39's release notes.
- Placeholder media: see `PLACEHOLDER_ASSETS.md`.
