# Prompt 06 — Data model and seed (db.json)

- **Phase:** 0 — Foundations
- **Depends on:** 02, 05
- **Unlocks:** 07
- **Scope:** L
- **Expected files to change/create:** `db.json` (rewritten), `prompts/_reference/PLACEHOLDER_ASSETS.md`, `prompts/_reference/PLACEHOLDERS.md`, `prompts/_reference/REPO_MAP.md` (§4 update). `server.js` unchanged.

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`, `PLACEHOLDER_ASSETS.md`, `PACKAGING_NOTES.md`. Confirm that prompts 01–05 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Replace the Meghali's Silk seed with the LAMIKAA NATURALS dataset: eight Black Rice products with `media[]` (images and videos), seven categories, concerns, three rituals, grouped FAQs, `siteContent`, `announcements` (repurposed from `banners`), a product-driven `heroConfig`, brand-true `settings`, and neutral sample fixtures for every commerce collection — so JSON Server starts cleanly and every admin screen has data.

## Pre-flight checks

```bash
node -e "const db=require('./db.json'); console.log(Object.keys(db).join(', '))"
# banners, heroConfig, faqs, users, admins, categories, products, cart, orders, returns, payments, refunds, shipping_methods, coupons, reviews, wishlist, leads, settings, walletTransactions, dealsConfig
for u in "https://picsum.photos/seed/lamikaa-farm/1600/1000" "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4" "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4" "https://res.cloudinary.com/demo/video/upload/elephants.mp4" "https://res.cloudinary.com/demo/video/upload/dog.mp4"; do printf "%s  " "$(curl -sS -o /dev/null -w '%{http_code}' -r 0-0 --max-time 20 "$u")"; echo "$u"; done   # all 206/200
grep -n "export const FAQ_ITEMS" src/utils/constants.js       # the eight site FAQs from Prompt 02
```

## Tasks

Write the new `db.json` by hand (or with a one-off Node script kept out of the repo) with **exactly** these collections, in this order, keeping every collection name the api layer and admin already use (`shipping_methods` keeps its underscore; `banners` is renamed `announcements`; `concerns`, `rituals`, `siteContent` are new). Ids are integers unless noted. Timestamps ISO `2026-09-06T00:00:00.000Z` unless a story needs a sequence.

1. **`products`** (8 rows, ids 1–8 in the `PRODUCTS.md` §2 order). Every row follows the `PRODUCTS.md` §6 example: all existing fields + all new fields. Sources: names/slugs/covers/sizes/prices/`stageCrop` from `PRODUCTS.md` §2 (crop → `media[0].crop`), category/concern/ritual/hero mapping from §3, hero copy from §4, `promise/description/benefits/keyIngredients/howToUse/ingredientsList/packClaims/fragranceNote/caution/suitableFor` from §5, media placeholders from `PLACEHOLDER_ASSETS.md` (2 Picsum images + 1 video each; products 1, 4, 7 get the second video), `images[]` derived (primary first), `sku` `LK-BR-{FW,GS,BW,FM,MI,SC,SE,MG}-00{n}`, `brand: "LAMIKAA Naturals"`, `price` 390/90/349 with `priceSource: "packaging-mrp"` for products 1/2/6 and `price: null, priceTBA: true` for 3/4/5/7/8, `comparePrice: 0`, `costPrice: 0`, `stock: 100`, `lowStockThreshold: 10`, `weight: 0`, `dimensions: null`, `variants: []`, `tags` (4–6 lowercase skincare terms per product: "black rice", product type, category words, hero ingredient), `relatedProductIds` (3 ids from the same ritual), `frequentlyBoughtTogetherIds` (2 ids: the next ritual steps), `featured: true` for all eight (they are the range), `trending: false`, `hot: false`, `isNew: true`, `isActive: true`, `rating: 0`, `totalReviews: 0`, `metaTitle: "<name> · LAMIKAA NATURALS"`, `metaDescription` = hero subtext + " Farmer-owned, rooted in Assam.", `faqs` (1–2 product FAQs each, answers only from pack directions/claims), `createdAt/updatedAt`.
2. **`categories`** (7 rows, `PRODUCTS.md` §3): `id, slug, name, displayName, description, image` (= `heroImage`), `heroImage`, `kind` (`"products"`|`"rituals"`), `parentId: null`, `isActive: true`, `sortOrder`, `showInMainMenu: true`, `menuOrder`, `createdAt`, `updatedAt`.
3. **`concerns`** (11 rows): `{ id, slug, name, order }` from `PRODUCTS.md` §3.
4. **`rituals`** (3 rows): `{ id, slug, name, tagline, story, image, duration, steps: [{ order, productId, alternativeProductId?, note, frequency }], isActive, sortOrder, createdAt, updatedAt }` per `PRODUCTS.md` §3; `story` derived from `BRAND.md` (no new facts), e.g. Morning Glow: "Four unhurried steps to start the day clear, refreshed and quietly radiant — the Black Rice range in the order it was designed to be used."
5. **`faqs`** (8 site rows from `src/utils/constants.js → FAQ_ITEMS`, same order, same `id`s 1–8) with the existing fields (`question, answer, placements, productIds: [], isActive: true, sortOrder`) **plus** `group`: rows 1–2 `"brand"`, 3–5 `"products"`, 6–8 `"orders"`. `placements`: rows 1–5 `["home","help","product"]`, 6–8 `["help","product"]`.
6. **`siteContent`** (singleton object keyed by block name; text in the markdown-lite grammar of `src/utils/contentBlocks.js`):
   - `about`: `{ heroImage, image2, eyebrow: "Our Story", title: "A beauty brand owned by farmers", lede: <3.1 first sentence>, body: <3.1 verbatim paragraphs as "p" blocks; the value chain as a ::steps block; 3.7 as a callout titled "The LAMIKAA Difference"; 3.8 vision as a quote>, ctaLabel: "Shop the Black Rice Range", ctaTo: "/shop" }`.
   - `whyLamikaa`: `{ heroImage, eyebrow: "Why LAMIKAA", title: "Indigenous Wisdom. Modern Science. Responsible Beauty.", body: <3.2 intro paragraphs>, pillars: brand pillars (copy from `brand.js`), difference: <3.7 chain as ::steps + closing paragraphs>, vision: <3.8 vision> }`.
   - `impact`: `{ eyebrow: "Our Impact", title: "Beauty That Creates Prosperity for Farmers", intro: <3.3 paragraphs>, items: [ { key: "financial", title: "Financial — From Raw Produce to Shared Value", image, points: [3 concise points from 3.4], body: <3.4 verbatim> }, { key: "social", …3.5 }, { key: "environmental", …3.6 } ] }`.
   - `home`: `{ aboutTeaser: { eyebrow: "About LAMIKAA", title: "When LAMIKAA grows, our farmers grow with us.", text: <3.1 short form, 2 paragraphs>, image, ctaLabel: "Our Story", ctaTo: "/about" }, whyBlackRice: { eyebrow: "The hero ingredient", title: "Why black rice?", points: ["Antioxidant-rich, traditionally valued in Northeast India.", "The one ingredient every product in the range is built around.", "Paired with botanicals chosen for each step of your routine."], image }, fullPageCta: { lines: brand.signatureLines.slice(0,3), primaryLabel: "Shop the Black Rice Range", primaryTo: "/shop", secondaryLabel: "Meet the farmer-owners", secondaryTo: "/about", image } }`.
   - `contact`: `{ eyebrow: "Contact", title: "Write to us", lede: "Questions about a product, an order or the farmer-owned story — we read every message.", hoursNote: "{{SUPPORT_HOURS}}" }`.
   - `policies`: `{ privacy: { title: "Privacy Policy", updatedAt: <today>, body: <generic e-commerce privacy text rewritten for LAMIKAA with `{{LAMIKAA_EMAIL}}`, `{{LAMIKAA_ADDRESS}}` tokens; no Galleria/Kolkata> }, terms: { title: "Terms of Service", body: <generic terms; company = BAOPCL; jurisdiction sentence uses `{{JURISDICTION}}` (already listed in `PLACEHOLDERS.md`; mark it `introduced (06)`); GSTIN/CIN lines use tokens> }, shippingReturns: { title: "Shipping & Returns", body: <dispatch `{{DISPATCH_SLA}}`, returns `{{RETURN_WINDOW_DAYS}}` days, hygiene rule for opened skincare, refund timeline "5–7 business days after inspection" only as a placeholder sentence `{{REFUND_TIMELINE}}` (listed in `PLACEHOLDERS.md`; mark it `introduced (06)`)> }, cookies: { title: "Cookie Policy", body: <the existing cookie table content rewritten without weaves/saris> } }`.
   - `faqPage`: `{ eyebrow: "Help", title: "Frequently asked questions", groups: [ { key: "brand", label: "The farmer-owned brand" }, { key: "products", label: "Products & ingredients" }, { key: "orders", label: "Orders, shipping & returns" }, { key: "account", label: "Account" } ] }`.
7. **`announcements`** (3 rows, replaces `banners`): `{ id, text, link: "" | "/shop", isActive, sortOrder, startsAt: null, endsAt: null, createdAt, updatedAt }` from `brand.announcements` — rows 2 and 3 carry tokens and are `isActive: true` (the bar hides unresolved texts).
8. **`heroConfig`** (singleton): `{ enabled: true, source: "products", autoplay: true, intervalMs: 6500, transition: "fade", pauseOnHover: true, showControls: true, showCounter: true, showProgress: true, showArrows: true, updatedAt }` — the old `overlayOpacity/heights/secondaryCta/openers` keys are dropped.
9. **`settings`** (singleton): `store { name: "LAMIKAA NATURALS", tagline: brand.tagline, email: "{{LAMIKAA_EMAIL}}", phone: "{{LAMIKAA_PHONE}}", address: "{{LAMIKAA_ADDRESS}}", currency: "INR", currencySymbol: "₹", timezone: "Asia/Kolkata", logo: null, favicon: null, taxRate: 0, taxIncluded: true }`, `shipping` (as now, credentials blank), `payment { razorpayEnabled: false, razorpayKeyId: "", stripeEnabled: false, stripePublishableKey: "", codEnabled: true, codFee: 0, codMinOrder: 0, codMaxOrder: 0 }`, `notifications { …, adminEmail: "{{LAMIKAA_EMAIL}}", lowStockEmail: "{{LAMIKAA_EMAIL}}" }`, `seo { metaTitle: brand.seo.defaultTitle, metaDescription: brand.seo.defaultDescription, googleAnalyticsId: "", facebookPixelId: "" }`, `social { facebook: "{{LAMIKAA_FACEBOOK_URL}}", instagram: "{{LAMIKAA_INSTAGRAM_URL}}", twitter: "", youtube: "{{LAMIKAA_YOUTUBE_URL}}", whatsapp: "{{LAMIKAA_WHATSAPP_URL}}" }`.
10. **`dealsConfig`** (singleton): `{ enabled: false, hero: { tag: "Offers", title: "Offers", subtitle: "Launch offers will appear here." }, timer: { enabled: false, endAt: "", onExpiry: "hide" }, featuredCouponIds: [], dealOfTheDayIds: [], featuredProductIds: [], updatedAt }` (page hidden until the owner enables it).
11. **`admins`** (1): `{ id: 1, email: "admin@store.com", password: "admin123", firstName: "Store", lastName: "Admin", role: "super_admin", isActive: true, createdAt }` (flagged in `PLACEHOLDERS.md` as "change before launch").
12. **`users`** (1): `{ id: 1, email: "sample.customer@example.com", password: "password123", firstName: "Sample", lastName: "Customer", phone: "+91 90000 00000", avatar: null, addresses: [ { id: 1, label: "Home", firstName: "Sample", lastName: "Customer", phone: "+91 90000 00000", addressLine1: "12 Sample Lane", addressLine2: "", city: "Guwahati", state: "Assam", postalCode: "781001", country: "India", isDefault: true } ], isActive: true, storeCredit: 0, createdAt, updatedAt }`.
13. **`shipping_methods`** (1): `{ id: 1, name: "Standard Delivery", carrier: "", description: "Delivery time and charges will be confirmed before launch.", rateType: "flat", flatRate: 0, freeAbove: null, estimatedDays: "", isActive: true, createdAt }`.
14. **`coupons`** (1): `{ id: 1, code: "SAMPLE10", description: "Sample coupon — 10% off for testing. Replace before launch.", type: "percentage", value: 10, minOrderAmount: 0, maxDiscount: 100, usageLimit: 1000, usedCount: 0, perUserLimit: 0, isActive: true, expiresAt: "2027-12-31T23:59:59.000Z", createdAt, updatedAt }`.
15. **`orders`** (3, for user 1, using products 1, 2, 6 — the priced ones): A `ORD-20260901-0001` delivered (Face Wash ×1 + Soap ×2, paid UPI, `fulfillmentStatus: "fulfilled"`, `shippingStatus: "delivered"`, `deliveredAt`, tracking placeholder `LK-TRACK-0001`, timeline of 4 events); B `ORD-20260904-0002` processing (Scrub ×1, COD pending, `unfulfilled`/`pending`); C `ORD-20260903-0003` cancelled with a completed refund to store credit (Face Wash ×1, paid card → `refundStatus: "completed"`, `paymentStatus: "refunded"`, `refundedAmount`). Money: `subtotal`, `discountAmount: 0`, `shippingAmount: 0`, `taxAmount: 0` (tax-inclusive), `total`, `amountPayable = total`, `storeCreditUsed: 0`, addresses = the user's address, `statusHistory` consistent with `api.js` event wording ("Order placed", "Payment captured", "Fulfilled & shipped", "Delivered", "Order cancelled", "Refund initiated", "Refund completed").
16. **`payments`** (3, one per order, shapes as `createPaymentForOrder` writes them: A captured upi, B pending cod, C refunded card with `refunds: [ { id: "ref_seed0001", amount, reason: "Order cancelled", at, by: "Store Admin" } ]`, `refundAmount`), **`refunds`** (1, `REF-20260903-C001`, `type: "order_cancellation"`, `status: "completed"`, `method: "store_credit"`, linked to order C), **`walletTransactions`** (1 credit for user 1 from that refund, `balanceAfter` = amount; set `users[0].storeCredit` to the same amount), **`returns`** (0 rows — `[]`).
17. **`reviews`** (2 sample rows, `isSample: true`, `status: "approved"`, `source: "admin"`, `userId: null`, `userName: "Sample reviewer"`, product 1 and 7, 5 stars, title/body clearly marked "Sample review — replace before launch"), **`wishlist`** `[]`, **`cart`** `[]`, **`leads`** (2: one contact "Sample enquiry", one newsletter `sample.subscriber@example.com`, statuses `new`/`subscribed`).
18. **Validation script** (run, do not commit): JSON parses; every `products[].media[0].primary === true`; `images[0] === media[0].url`; every `categoryIds` id exists in `categories`; every `rituals[].steps[].productId` exists; every `faqs[].group` ∈ faqPage groups; every URL in `media`, `categories.heroImage`, `rituals.image`, `siteContent.*image*` answers a ranged GET (skip a host that failed in Pre-flight and swap in the alternate listed in `PLACEHOLDER_ASSETS.md`, recording the swap).
19. Start `npm run server`; confirm `GET /products/1`, `/products?slug=black-rice-face-serum`, `/categories?slug=serums`, `/rituals?slug=morning-glow`, `/announcements`, `/siteContent`, `/heroConfig`, `/settings`, `/faqs?group=orders`, `/concerns` respond; `DELETE /reviews/2` then re-add via `POST` to prove the safe-delete wrapper still works; restore the file from git if the exercise dirtied it (`git checkout db.json` **after** you have committed your seed — or exercise deletes on a copy: `JSON_SERVER_DB=/tmp/db.copy.json npm run server`).
20. Update `REPO_MAP.md` §4 with the new schema table (collections, fields, relationships), `PLACEHOLDER_ASSETS.md` with the exact seeded URLs (and any host swaps), `PLACEHOLDERS.md` (mark `{{JURISDICTION}}` and `{{REFUND_TIMELINE}}` as introduced, refresh the "sample data" list).

## Design and content specification

Copy discipline: every sentence in `siteContent` must trace to `BRAND.md` or to packaging text; policies are generic e-commerce templates carrying tokens where LAMIKAA-specific facts are unknown; no testimonials, counts, awards, founding years, percentages or named farmers. Tone per `BRAND.md` 3.9.

## Data and API changes

This prompt defines the data. `api.js` still references `banners` until Prompt 07; the storefront hero will show its fallback and the admin Hero screen will error on `/banners` between this commit and the next — acceptable within the same session; Prompt 07 follows immediately.

**Primary media — copy these URLs character-exact into `products[].media[0].url` (and therefore `images[0]`), in id order:**

| id | slug | `media[0].url` |
|---|---|---|
| 1 | `black-rice-face-wash` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Black-Rice-Face-Wash-Cover.jpg` |
| 2 | `black-rice-goat-milk-soap` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670693/Black-Rice-Goat-Milk-Soap-Cover.jpg` |
| 3 | `black-rice-body-wash` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670690/Body-Wash-Cover.jpg` |
| 4 | `black-rice-face-mask` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670690/Face-Mask-Cover.jpg` |
| 5 | `black-rice-face-mist` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670691/Face-Mist-Cover.jpg` |
| 6 | `black-rice-exfoliating-face-scrub` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670694/Face-Scrub-Cover.jpg` |
| 7 | `black-rice-face-serum` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670692/Face-Serum-Cover.jpg` |
| 8 | `black-rice-moisturizer-gel` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670693/Moisturizer-Gel-Cover.jpg` |

Brand identity (already in `src/config/brand.js` from Prompt 02, repeated for `settings`/`siteContent` seeds): logo `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670626/logo.png`, icon `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670625/icon.png`. Ids, slugs and URLs above are identical to `PRODUCTS.md` §2 (same order).

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: the eight cover URLs must be **character-exact** copies from `PRODUCTS.md`; never replace a cover with a placeholder; never seed a numeric price the packaging does not show; keep `shipping_methods` (underscore) and every other collection name that `api.js` reads.

## Acceptance criteria

- [ ] `node -e "require('./db.json')"` succeeds; the validation script passes every check.
- [ ] `grep -c "meghali\|Meghali\|silk\|Silk\|mekhela\|saree\|Sualkuchi\|Kolkata, West Bengal" db.json` → 0 (the `Asia/Kolkata` timezone is the only permitted "Kolkata").
- [ ] Eight products with `media[]` (3–5 rows each, exactly one primary), covers character-exact; three with numeric prices, five `priceTBA`.
- [ ] Seven categories, 11 concerns, 3 rituals, 8 grouped FAQs, `siteContent` with the seven keys, 3 announcements, product-driven `heroConfig`, tokenised `settings`.
- [ ] Sample commerce fixtures are internally consistent (order/payment/refund/wallet amounts agree) and the admin Orders/Payments/Returns/Users/Coupons/Leads/Reviews screens load with them.
- [ ] JSON Server starts cleanly on :3001 and the storefront still renders the existing (old) components against the new data (expect visual roughness — that is fine; no runtime crashes on `/`, `/products`, `/products/black-rice-face-wash`, `/checkout`, `/admin/*`).

## Verification

```bash
node -e "const db=require('./db.json'); console.log(db.products.length, db.categories.length, db.concerns.length, db.rituals.length, db.faqs.length, db.announcements.length, Object.keys(db.siteContent).join(','))"
npm run server &   # then:
curl -s "http://localhost:3001/products?slug=black-rice-face-serum" | head -c 400
curl -s http://localhost:3001/rituals | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).map(r=>r.slug)))"
grep -c "res.cloudinary.com/v8vrixwq/image/upload/v17886706" db.json   # ≥ 8 (covers) + posters
CI=true npm run build && npm test -- --watchAll=false
```

Manual QA: `/admin/products` lists the eight products with the cover thumbnails; `/admin/orders` shows three orders; `/admin/payments` three payments and one refund; `/admin/reviews` two sample reviews; `/admin/faqs` eight rows; `/admin/settings` shows the tokenised store fields (they are placeholders — expected).

## Handoff

1. `PROGRESS.md`: row 06 → `complete`; Decisions log: any host swaps, any copy decision for `siteContent`; Placeholders: `{{JURISDICTION}}`, `{{REFUND_TIMELINE}}` introduced.
2. `REPO_MAP.md` §4, `PLACEHOLDER_ASSETS.md`, `PLACEHOLDERS.md` updated.
3. Commit: `feat(lamikaa): 06 data model and seed`.
