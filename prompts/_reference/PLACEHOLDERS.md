# PLACEHOLDERS — every unknown fact, tokenised

> Brief §12. A token is a literal `{{UPPER_SNAKE}}` string. Rule: a token is **never** a value to invent. Where it lives in data or config it must render harmlessly (see "Rendering rules"). Each build prompt that introduces or resolves a token updates this file in its Handoff step; Prompt 39 regenerates the inventory from the real `db.json` and `src/` (`grep -rn "{{[A-Z_]*}}"`).

## Rendering rules (implemented in Prompt 02 → `src/utils/placeholders.js`)

- `PLACEHOLDER_RE` = `/\{\{[A-Z0-9_]+\}\}/` — upper case only, so ordinary prose in braces is never mistaken for a token.
- `isPlaceholder(value)` → `true` when a string contains at least one `{{…}}`.
- `resolveOrNull(value)` → `null` for a non-string, a blank/whitespace-only string, or anything carrying a token; the trimmed value otherwise. Call sites render with `{resolved && <row/>}`.
- `placeholderToken(value)` → the token's NAME without the braces (`"{{GSTIN}}"` → `"GSTIN"`), for the admin's "Placeholder — owner to supply" chip.
- `stripPlaceholderSentences(text)` → drops every sentence carrying a token and keeps the rest (sentences end at a `.` followed by a space, a newline, or end-of-string, so decimals and "Co. Ltd." survive).
  - **Authoring constraint for markdown-lite copy (found and fixed in Prompt 06).** The function is sentence-based and knows nothing about the block grammar: it removes a sentence **together with its trailing separator**, and a numbered heading like `## 09. Contact` is itself split at `09.`, so the heading's *title* belongs to the sentence that follows it. Two consequences bind anyone writing `siteContent`, a policy body or an FAQ answer:
    1. **The first sentence after a heading must be token-free** — otherwise the strip carries the heading's title away with it and the section loses its name.
    2. **The last sentence of a paragraph must be token-free** — otherwise the strip carries away the blank line that separated the paragraph from the next heading, and that heading stops parsing as a heading.
    Put token sentences in the MIDDLE of a paragraph, or pair each with a token-free sentence that carries the structure. Prompt 06's validation script enforces this over every prose field: parse, strip, parse again, and require an identical h2/h3 list, no heading left with an empty body, and no surviving token.
- Contact rows (email/phone/address/hours), social links, GSTIN/CIN lines, announcement messages, shipping SLA lines: **hidden** while unresolved (never printed raw).
  - **Centralised since Prompt 02:** `normalizeStoreSettings()` (`src/utils/storeSettings.js`) resolves `store.email` / `store.phone` / `store.address` to `""` when they are tokens, so no storefront surface reading `useStoreSettings()` can print one by forgetting to check. `normalizeSocialUrl()` returns `""` for a placeholder, so no `https://{{…}}` link is ever rendered — `DEFAULT_SOCIAL_LINKS` therefore resolves to an all-blank map until the owner fills Admin → Settings → Social Links.
- Prices: `price: null` + `priceTBA: true` → "Price on launch" chip; Add to Cart / Buy Now disabled ("Coming soon"); excluded from "Add the whole ritual" bundles.
- Copy tokens inside FAQ answers / siteContent are filled by `fillStoreCopy()` (`src/utils/storeSettings.js`) when the setting is known and the whole sentence is dropped when it is not. Two shapes:
  - `{singleBrace}` — a figure the function computes: `{freeShipping}`, `{codSentence}`, `{taxNote}`. `{freeShipping}` degrades to `{{FREE_SHIPPING_THRESHOLD}}` when neither `options.freeAbove` nor `FREE_SHIPPING_THRESHOLD` carries a positive number, and the sentence around it is then dropped.
  - `{{DOUBLE_BRACE}}` — `{{RETURN_WINDOW_DAYS}}` is resolved from `options.returnWindowDays` (passed by `StoreSettingsContext` from `STOREFRONT_CONFIG.returnsWindowDays`); every other token reaching `fillStoreCopy` loses its sentence.
- The admin shows a small "Placeholder — owner to supply" chip beside any field whose value is a token (product price TBA, settings contact fields).

## Inventory

Status column: `introduced (NN)` = the token exists in the codebase as of Prompt NN. `resolved (NN)` = the fact became known (from the packaging) and a real value is seeded instead of the token — the row is kept so the owner can still audit and change it. `planned (NN)` = the prompt that will create it.

| Token | Status | Where it lives (file → key) | Rendered where | Owner supplies | Candidate / source notes |
|---|---|---|---|---|---|
| `{{LAMIKAA_EMAIL}}` | introduced (02) | `src/config/brand.js → contact.email` → `utils/constants.js SUPPORT_EMAIL` → `DEFAULT_STORE_SETTINGS.store.email`; `db.json → settings.store.email` (06) | Footer `<address>`, Help Centre "Still need help?", Contact page, policies colophon | Customer-care email | Packaging prints **info@baopcl.com** (company email) — confirm it is the storefront care address. Blanked by `normalizeStoreSettings` while unresolved |
| `{{LAMIKAA_PHONE}}` | introduced (02) | `brand.js → contact.phone` → `constants.js SUPPORT_PHONE` → `DEFAULT_STORE_SETTINGS.store.phone`; `settings.store.phone` (06) | Footer `<address>`, Help Centre, Contact page channels (Call), WhatsApp channel if no URL | Customer-care number | Packaging prints **+91 97076 91169** — confirm |
| `{{LAMIKAA_ADDRESS}}` | introduced (02) | `brand.js → contact.address` → `constants.js SUPPORT_ADDRESS` → `DEFAULT_STORE_SETTINGS.store.address`; `settings.store.address` (06) | Footer `<address>`, Contact page "Visit us" card (and its Get-directions link), policies colophon, admin invoice | Registered/contact address | Packaging prints **Bokakhat Agro Organic Producer Co. Ltd., Bachagaon, Kaziranga National Park, Golaghat, Assam – 785609** — confirm the address to publish |
| `{{SUPPORT_HOURS}}` | introduced (02) | `brand.js → contact.hours` → `constants.js SUPPORT_HOURS`; `siteContent.contact.hoursNote` (06) | Footer `<address>` (fourth row), Help Centre lede, Contact page (form lede, sent confirmation, "Visit us" card) | Customer-care hours (days + time zone) | Packaging prints no hours. Every surface reads it through `resolveOrNull` and drops the clause/row while unresolved |
| `{{LAMIKAA_INSTAGRAM_URL}}` | introduced (02) | `brand.js → social.instagram` → `constants.js SOCIAL_LINKS.INSTAGRAM` → `DEFAULT_SOCIAL_LINKS`; `settings.social.instagram` (06) | Footer social row, Contact page | Instagram profile URL | Blanked by `normalizeSocialUrl` while unresolved |
| `{{LAMIKAA_FACEBOOK_URL}}` | introduced (02) | `brand.js → social.facebook`; same chain | same | Facebook page URL | — |
| `{{LAMIKAA_YOUTUBE_URL}}` | introduced (02) | `brand.js → social.youtube`; same chain | same | YouTube channel URL | — |
| `{{LAMIKAA_WHATSAPP_URL}}` | introduced (02) | `brand.js → social.whatsapp`; same chain | Footer social row, Contact "WhatsApp" channel | `https://wa.me/<number>` | Could be derived from `{{LAMIKAA_PHONE}}` once confirmed. A bare number is also accepted and repaired into a `wa.me` link |
| `{{LAMIKAA_DOMAIN}}` | introduced (02) | **`brand.js → seo.siteUrl` — and nowhere else since Prompt 36**; canonical / `og:url` / JSON-LD `url` are derived from it at runtime by `useSeo` (08) | `<link rel=canonical>`, `og:url`, JSON-LD `url` | Public storefront domain | `.env.production` points the API at `core.lamikanaturals.com` → candidate **lamikanaturals.com** (single "a" in the host) — confirm. **Prompt 36 moved the token out of every static file.** It had been tolerated raw in `public/index.html`'s `og:url` + `twitter:url` and in `public/robots.txt`'s `Sitemap:` line; a literal token in a crawled surface is a broken directive, so both tags and the sitemap line were **removed** — Prompt 38 re-adds the `Sitemap:` line with the real host when it writes `public/sitemap.xml`. Nothing was lost: **since Prompt 08** `useSeo`'s `seoOrigin()` uses `brand.seo.siteUrl` the moment it stops being a placeholder and falls back to `window.location.origin` until then, so no canonical, `og:url` or JSON-LD `url` ever carries the token — resolving the domain stays a one-line edit in `brand.js` with no page changes. **Prompt 38 made the dependency explicit and mechanical.** `scripts/generate-sitemap.js` (`npm run sitemap`) refuses to write `public/sitemap.xml` while this is a token — it prints what it needs and exits 0, because an unresolved placeholder is the expected state and must not fail a build — and `robots.txt` now carries the `Sitemap:` line **commented out with the candidate host spelled in**, so the two never disagree. Resolving the domain is three steps, in this order: (1) `seo.siteUrl: "lamikanaturals.com"` here, (2) `npm run sitemap`, (3) uncomment that line with the same host. Verified in both directions: with the token, no file and a notice; with a real host, 30 URLs (12 static, 8 products, 7 categories, 3 rituals), well-formed, no duplicates. See `AUDIT.md` §10 |
| `{{GSTIN}}` | introduced (02) | `brand.js → legal.gstin`; `siteContent.policies.terms` (06) | Footer colophon (`GSTIN <n>` row), Terms, admin invoice | GST registration number | **Rendered since Prompt 13** through `resolveOrNull`, so the row costs no line while it is a token |
| `{{CIN}}` | introduced (02) | `brand.js → legal.cin`; `siteContent.policies.terms` (06) | Footer colophon (`CIN <n>` row), Terms | Corporate Identification Number of BAOPCL | As above — rendered since Prompt 13, hidden while unresolved |
| `{{FREE_SHIPPING_THRESHOLD}}` | introduced (02) | `brand.js → announcements[1].text`; emitted by `fillStoreCopy` when `{freeShipping}` cannot be resolved; `db.json → shipping_methods[0].freeAbove` (null until set, 06) | Announcement bar, cart-drawer free-shipping meter, trust badge "Free shipping", FAQ 6 (the footer promise row was deleted by Prompt 13) | Order value above which shipping is free (₹) | Admin → Shipping. `FREE_SHIPPING_THRESHOLD` in `constants.js` is **deleted** (Prompt 13; it had been `null` and unread since Prompt 12). The threshold's one home is `freeAbove` on the active `shipping_methods`, read live; every consumer (AnnouncementBar, CartDrawer, `fillStoreCopy`) treats an absent one as "unknown → hide" |
| `{{LAUNCH_OFFER_TEXT}}` | introduced (02) | `brand.js → announcements[2].text`; `db.json → announcements[2].text` (seeded `isActive: true`, 06 — the bar hides the row while the text is unresolved) | Announcement bar | Launch offer wording | Admin → Announcements |
| `{{PRICE_FACE_WASH}}` | resolved (06) | `products[0].price = 390` | Cards, hero, PDP, cart | Selling price | **Resolved from packaging MRP ₹390** (`priceSource: "packaging-mrp"`) — owner to confirm before launch |
| `{{PRICE_GOAT_MILK_SOAP}}` | resolved (06) | `products[1].price = 90` | same | Selling price | **Resolved from packaging MRP ₹90** (`priceSource: "packaging-mrp"`) — owner to confirm |
| `{{PRICE_BODY_WASH}}` | introduced (06) | `products[2].price = null, priceTBA: true` | "Price on launch" | Selling price | MRP masked on the pack. Add to Cart is disabled while `priceTBA` |
| `{{PRICE_FACE_MASK}}` | introduced (06) | `products[3].price = null, priceTBA: true` | same | Selling price | MRP masked |
| `{{PRICE_FACE_MIST}}` | introduced (06) | `products[4].price = null, priceTBA: true` | same | Selling price | MRP masked |
| `{{PRICE_FACE_SCRUB}}` | resolved (06) | `products[5].price = 349` | Cards, hero, PDP, cart | Selling price | **Resolved from packaging MRP ₹349** (`priceSource: "packaging-mrp"`) — owner to confirm |
| `{{PRICE_FACE_SERUM}}` | introduced (06) | `products[6].price = null, priceTBA: true` | "Price on launch" | Selling price | MRP masked |
| `{{PRICE_MOISTURIZER_GEL}}` | introduced (06) | `products[7].price = null, priceTBA: true` | same | Selling price | MRP masked |
| `{{SIZE_FACE_WASH}}` … `{{SIZE_MOISTURIZER_GEL}}` (8) | resolved (06) | `products[*].size` | PDP purchase panel, cards | Net volume/weight | **All eight seeded from packaging**: 200 ml · 100 g · 250 ml · 100 g · 100 ml · 100 g · 30 ml · 100 ml. No token remains in `db.json` |
| `{{INCI_FACE_WASH}}` … `{{INCI_MOISTURIZER_GEL}}` (8) | resolved (06) | `products[*].ingredientsList` | PDP "Full ingredients" | INCI list | **All eight seeded verbatim from packaging** (`PRODUCTS.md` §5) — owner to proof-read against the final artwork. No token remains in `db.json` |
| `{{SHELF_LIFE}}` | introduced (02) | `brand.js → productDefaults.shelfLife`; PDP "Good to know" row, in the Full ingredients chapter (27) | PDP | Period-after-opening / shelf life | Packs print Mfg → Exp about 23 months apart (e.g. Aug-2026 → July-2028) — do **not** state a figure until confirmed; row hidden while unresolved |
| `{{CERTIFICATIONS}}` | introduced (02) | `brand.js → packBadges[]` (marker in the comment above it) | PDP "As printed on the pack" chips | Confirmation that the roundels are valid | Packaging prints ISO Certified · GMP Certified · Non-GMO · Cruelty-Free — seeded as those four labels *as printed*; remove any the owner cannot substantiate |
| `{{RETURN_WINDOW_DAYS}}` | introduced (02) | `constants.js FAQ_ITEMS[6].answer`; `src/theme/tokens.js → STOREFRONT_CONFIG.returnsWindowDays`; `db.json → faqs[6].answer` and `siteContent.policies.shippingReturns` §04 (06) | Returns FAQ, trust badge, PDP delivery panel, Order History return eligibility, Refund policy | Return window in days | `STOREFRONT_CONFIG.returnsWindowDays` still holds the boilerplate default **7**; `fillStoreCopy` substitutes it into the FAQ answer and drops the sentence if it is ever 0/unset. Confirm, or set 0 for "no returns" |
| `{{DISPATCH_SLA}}` | introduced (06) | `db.json → shipping_methods[0].estimatedDays` (`""` until set); `siteContent.policies.shippingReturns` §01 | Checkout shipping option, delivery panel, FAQ | Dispatch/delivery time | Admin → Shipping. The policy sentence "Our dispatch time is {{DISPATCH_SLA}}." is dropped by `stripPlaceholderSentences` until resolved |
| `{{TAX_RATE_PERCENT}}` | introduced (06) | `db.json → settings.store.taxRate` (**0**) with `taxIncluded: true` | Checkout tax line, Terms tax clause, FAQ | GST rate if prices are to be shown exclusive | Packs print "M.R.P (incl. of all taxes)" → seeded tax-inclusive with rate 0, and the seeded orders carry `taxAmount: 0`. `fillStoreCopy`'s `{taxNote}` already prints **"inclusive of all taxes"** for that combination (Prompt 02). No token string is stored — the 0/true pair *is* the unresolved state |
| `{{JURISDICTION}}` | introduced (06) | `db.json → siteContent.policies.terms` §09 ("The courts of {{JURISDICTION}} have exclusive jurisdiction…") | Terms of Service | Courts/jurisdiction named in the terms | The sentence is dropped by `stripPlaceholderSentences` until resolved; the "governed by the laws of India" sentence before it survives on its own |
| `{{REFUND_TIMELINE}}` | introduced (06) | `db.json → siteContent.policies.shippingReturns` §05 ("Refunds are processed {{REFUND_TIMELINE}}.") | Shipping & Returns policy, returns FAQ | Refund processing time after inspection | The sentence is dropped until resolved; **never seed a number** — "5–7 business days after inspection" is a candidate for the owner to confirm, not a fact. The "your bank may take a few days more" sentence after it survives |

## Current inventory — generated

> **Generated, not hand-maintained.** `npm run placeholders`
> (`scripts/placeholder-inventory.js`) scans `db.json` and `src/` for the
> `{{UPPER_SNAKE}}` grammar and prints this table. Everything above it is the
> hand-written guidance — what each fact is, who supplies it, what the packaging
> suggests — and stays. Re-run the script after resolving a token and paste the
> output here.
>
> **Last regenerated: Prompt 39, 2026-09-08.**
>
> How to read the `Kinds` column: `data` = a value in the `db.json` seed;
> `config` = a value in `src/config/brand.js`; `copy-default` = a token inside
> the boilerplate copy in `src/utils/constants.js`; `helper` = a fallback
> `src/utils/storeSettings.js` *emits* when a setting is missing (resolving the
> setting removes it — it is not itself an unsupplied fact); `admin-hint` = a
> row in the admin's insert-a-token palette (`MarkdownField.js`), which is a menu
> for editors, not an unresolved fact; `test-fixture` = a token inside a unit
> test.

### Table 1 — `{{TOKEN}}` occurrences in `db.json` and `src/`

| Token | Live hits | Kinds | Where (file → key path / line) |
|---|---|---|---|
| `{{CERTIFICATIONS}}` | 1 | test-fixture | `src/components/pdp/PdpChapters.test.js:33` |
| `{{CIN}}` | 3 | admin-hint, config, data | `db.json` → `siteContent.policies.terms.body`; `src/config/brand.js:146`; `src/pages/Admin/components/MarkdownField.js:54` |
| `{{DISPATCH_SLA}}` | 2 | admin-hint, data | `db.json` → `siteContent.policies.shippingReturns.body`; `src/pages/Admin/components/MarkdownField.js:56` |
| `{{FREE_SHIPPING_THRESHOLD}}` | 5 | admin-hint, config, data, helper, test-fixture | `db.json` → `announcements[1].text`; `src/App.test.js:126`; `src/config/brand.js:123`; `src/pages/Admin/components/MarkdownField.js:59`; `src/utils/storeSettings.js:183` |
| `{{GSTIN}}` | 3 | admin-hint, config, data | `db.json` → `siteContent.policies.terms.body`; `src/config/brand.js:145`; `src/pages/Admin/components/MarkdownField.js:53` |
| `{{JURISDICTION}}` | 2 | admin-hint, data | `db.json` → `siteContent.policies.terms.body`; `src/pages/Admin/components/MarkdownField.js:55` |
| `{{LAMIKAA_ADDRESS}}` | 5 | admin-hint, config, data, test-fixture | `db.json` → `siteContent.policies.privacy.body`; `db.json` → `settings.store.address`; `src/App.test.js:172`; `src/config/brand.js:132`; `src/pages/Admin/components/MarkdownField.js:51` |
| `{{LAMIKAA_DOMAIN}}` | 1 | config | `src/config/brand.js:165` |
| `{{LAMIKAA_EMAIL}}` | 10 | admin-hint, config, data, test-fixture | `db.json` → `siteContent.policies.privacy.body`; `db.json` → `siteContent.policies.terms.body`; `db.json` → `siteContent.policies.shippingReturns.body`; `db.json` → `siteContent.policies.cookies.body`; `db.json` → `settings.store.email`; `db.json` → `settings.notifications.adminEmail`; `db.json` → `settings.notifications.lowStockEmail`; `src/App.test.js:170`; `src/config/brand.js:130`; `src/pages/Admin/components/MarkdownField.js:49` |
| `{{LAMIKAA_FACEBOOK_URL}}` | 3 | config, data, test-fixture | `db.json` → `settings.social.facebook`; `src/App.test.js:180`; `src/config/brand.js:137` |
| `{{LAMIKAA_INSTAGRAM_URL}}` | 3 | config, data, test-fixture | `db.json` → `settings.social.instagram`; `src/App.test.js:179`; `src/config/brand.js:136` |
| `{{LAMIKAA_PHONE}}` | 4 | admin-hint, config, data, test-fixture | `db.json` → `settings.store.phone`; `src/App.test.js:171`; `src/config/brand.js:131`; `src/pages/Admin/components/MarkdownField.js:50` |
| `{{LAMIKAA_WHATSAPP_URL}}` | 3 | config, data, test-fixture | `db.json` → `settings.social.whatsapp`; `src/App.test.js:182`; `src/config/brand.js:139` |
| `{{LAMIKAA_YOUTUBE_URL}}` | 3 | config, data, test-fixture | `db.json` → `settings.social.youtube`; `src/App.test.js:181`; `src/config/brand.js:138` |
| `{{LAUNCH_OFFER_TEXT}}` | 3 | config, data, test-fixture | `db.json` → `announcements[2].text`; `src/App.test.js:127`; `src/config/brand.js:124` |
| `{{REFUND_TIMELINE}}` | 2 | admin-hint, data | `db.json` → `siteContent.policies.shippingReturns.body`; `src/pages/Admin/components/MarkdownField.js:57` |
| `{{RETURN_WINDOW_DAYS}}` | 8 | admin-hint, copy-default, data, helper, test-fixture | `db.json` → `faqs[6].answer`; `db.json` → `siteContent.policies.shippingReturns.body`; `src/App.test.js:135`; `src/components/FAQ/FAQ.test.js:49`; `src/pages/Admin/components/MarkdownField.js:58`; `src/utils/constants.js:255`; `src/utils/storeSettings.js:188`; `src/utils/storeSettings.js:189` |
| `{{SHELF_LIFE}}` | 2 | admin-hint, config | `src/config/brand.js:178`; `src/pages/Admin/components/MarkdownField.js:60` |
| `{{SUPPORT_HOURS}}` | 4 | admin-hint, config, data, test-fixture | `db.json` → `siteContent.contact.hoursNote`; `src/App.test.js:150`; `src/config/brand.js:133`; `src/pages/Admin/components/MarkdownField.js:52` |

**19 distinct tokens · 67 live occurrences.** 18 are unresolved facts an owner must supply (kinds `data`, `config`, `copy-default`); the rest are a helper fallback, the admin's insert-a-token palette or a test fixture.

39 further mentions sit inside code comments and are NOT inventory (`{{ADDRESS_2}}`, `{{CERTIFICATIONS}}`, `{{DISPATCH_SLA}}`, `{{DOUBLE_BRACE}}`, `{{GSTIN}}`, `{{LAMIKAA_DOMAIN}}`, `{{LAMIKAA_EMAIL}}`, `{{LAMIKAA_INSTAGRAM_URL}}`, `{{RETURN_WINDOW_DAYS}}`, `{{SHELF_LIFE}}`, `{{SUPPORT_HOURS}}`, `{{TAX_RATE_PERCENT}}`, `{{TOKENS}}`, `{{TOKEN}}`, `{{UPPER_SNAKE}}`, `{{X}}` — 6 of those names are generic, used only to describe the convention).

**Cross-check against the hand-written inventory above — Prompt 39.**

- **Every token in the code is documented.** All 19 names the scan finds appear
  in the inventory table above, with an owner and a resolution path.
- **Every documented token still exists, or is marked resolved.** The rows marked
  `resolved (06)` — the three packaging MRPs, the eight sizes, the eight INCI
  lists — correctly return **no** hits: those facts were seeded as real values
  and the token strings are gone from `db.json`, which is what "resolved" means.
- **Three documented names deliberately hold no live token, and that is correct:**
  - `{{TAX_RATE_PERCENT}}` — no token string is stored; the seeded
    `taxRate: 0` + `taxIncluded: true` pair *is* the unresolved state, and
    `fillStoreCopy`'s `{taxNote}` prints "inclusive of all taxes" for it.
  - `{{CERTIFICATIONS}}` — a marker in the comment above `brand.packBadges`; the
    four roundels are seeded as printed, so the only live hit is a test fixture.
  - `{{FREE_SHIPPING_THRESHOLD}}` in `constants.js` — deleted in Prompt 13. The
    threshold's one home is `shipping_methods[0].freeAbove`, read live; the token
    survives only as the string `fillStoreCopy` emits when that is unknown.
- **39 further mentions sit inside code comments** and are not inventory. Six of
  the names used there (`{{TOKEN}}`, `{{TOKENS}}`, `{{UPPER_SNAKE}}`,
  `{{DOUBLE_BRACE}}`, `{{X}}`, `{{ADDRESS_2}}`) are generic, used only to
  describe the convention, and no owner will ever supply them.
- **Nothing unresolved renders.** `src/App.test.js` mounts the whole application
  over a seed that keeps two token-carrying announcement rows, three token
  contact fields and a token FAQ answer, and asserts that no `{{` reaches the
  DOM; the Prompt 39 browser regression asserts the same on every storefront
  route.

## Not tokens, but flagged sample data (replace before launch)

Seeded by Prompt 06 and re-listed in Prompt 39's release notes. Nothing here is a token — each row is real data that has to be **replaced or removed** before the store goes live.

| Where | What | Why it exists |
|---|---|---|
| `db.json → admins[0]` | `admin@store.com` / `admin123`, "Store Admin", `super_admin` | The only way into `/admin`. **Change the email and password in production** — the password is stored in plain text. |
| `db.json → users[0]` | `sample.customer@example.com` / `password123`, "Sample Customer", a Guwahati address, `storeCredit: 390` | Gives Admin → Users, Orders and the wallet ledger a customer to hang off. The store credit is the settled refund on order C, not a gift. |
| `db.json → orders` (3) | `ORD-20260901-0001` delivered ₹570 · `ORD-20260904-0002` COD processing ₹349 · `ORD-20260903-0003` cancelled + refunded ₹390 | Admin → Orders needs one order in each state. Uses only the three priced products. |
| `db.json → payments` (3), `refunds` (1), `walletTransactions` (1) | `pay_SEED0001` / `pay_SEED0003`, `ref_seed0001`, `REF-20260903-C001`, the ₹390 wallet credit | The money trail behind those three orders; amounts must stay in agreement if any row is edited. |
| `db.json → coupons[0]` | `SAMPLE10` — 10 % off, description says "Sample coupon … Replace before launch" | Admin → Coupons and the checkout coupon field need one code. |
| `db.json → shipping_methods[0]` | "Standard Delivery", `flatRate: 0`, `freeAbove: null`, `estimatedDays: ""` | A method must exist for checkout to offer one. Its blank fields are the unresolved state of `{{DISPATCH_SLA}}` and `{{FREE_SHIPPING_THRESHOLD}}`. |
| `db.json → reviews` (2) | Products 1 and 7, 5 stars, `isSample: true`, `userName: "Sample reviewer"`, text reading "Sample review — replace before launch" | Admin → Reviews needs rows. **Hidden from the storefront** by `brand.flags.showSampleReviews === false` (BRAND.md §3.9 rule 6), and `rating`/`totalReviews` stay 0 on every product. |
| `db.json → leads` (2) | One `contact` "Sample enquiry" (`new`), one `newsletter` `sample.subscriber@example.com` (`subscribed`) | Admin → Leads needs one row of each type. |
| Placeholder media | Every `"placeholder": true` row in `products[].media[]`, plus category/ritual/story imagery | See `PLACEHOLDER_ASSETS.md`. |

`cart`, `wishlist` and `returns` are seeded **empty** on purpose — there is no such thing as a plausible sample cart.
- Placeholder media: see `PLACEHOLDER_ASSETS.md`.
