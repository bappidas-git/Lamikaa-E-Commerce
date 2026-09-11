# Release notes

## 1.1.1-lamikaa — 2026-09-11

Product pictures are never cut again. Whatever a product's image is — a pack
shot, a carton dieline, a finished lifestyle photograph — every surface now
delivers the WHOLE frame and lets the plate letterbox it.

### Fixed

- **A stored crop could outlive the picture it was measured against.** Each
  seeded product carried a `crop` in its cover's own source pixels, recorded to
  pull a front panel out of a carton dieline. Those coordinates describe one
  specific upload and nothing else, so the moment a row's `url` changed — a new
  photograph pasted over the old link in **Admin → Products → Media** — the same
  numbers went on cutting, and every card, hero, chapter, gallery stage,
  thumbnail, cart bar and search hit showed a narrow strip of the new picture
  with 60–75% of it thrown away. The eight seeded rectangles kept between 25.7%
  and 39.0% of their frames.

- **The whole frame, everywhere.** `stageSrc()` and the PDP gallery now deliver
  `c_pad,ar_…,b_auto` only: the complete picture, letterboxed to the plate's
  ratio on a ground sampled from the shot's own edges, at every breakpoint.
  Nothing in the storefront emits `c_crop`.

- **The Deal of the Day plate.** `/offers` rendered the raw `images[0]` — the
  full multi-megapixel upload — and then let CSS cut a 4:5 window out of it. It
  goes through `stageSrc()` like every other product plate now: sized for its
  box, padded rather than cropped, and `object-fit: contain`.

- **The admin's row preview** shows the whole asset (`contain`, not `cover`), so
  a merchant sees before saving exactly what the storefront will show.

### Removed

- **The stored crop, at the boundary.** `normalizeProduct` drops any `crop` a
  record still holds, so a stale rectangle from *any* backend — `db.json`, the
  Laravel API, a months-old wishlist snapshot — cannot reach a delivery URL. The
  eight rectangles are gone from `db.json` as well.

- **"Advanced: stage crop"** in the admin media manager, and the PDP's
  **"Full label" / "Front panel"** toggle. With nothing cropped there is no
  second version of a frame to offer, and a control that claimed otherwise would
  be a lie.

---

## 1.0.0-lamikaa — 2026-09-08

The complete rebuild of this repository from the previous storefront into
**LAMIKAA NATURALS**: a farmer-owned Black Rice skincare store and its admin
console. Delivered as 39 sequential prompts (`prompts/00_INDEX.md`); this is the
last of them. Every existing storefront and admin capability was preserved, the
previous brand was removed from source, seeds, assets and the production build,
and nothing about the brand was invented — facts nobody has supplied yet are
carried as placeholder tokens that render as nothing.

---

### Highlights

**One dark theme, one token layer.** The light/dark toggle is gone from both the
storefront and the admin. `src/theme/` is the only styling source — colour,
type, space, radius, shadow, glass, glow and the signature gradient all come
from `--sf-*` tokens; no component hard-codes a colour. The admin runs its own
isolated dark MUI theme so the two can never bleed into each other. Fraunces for
display, Manrope for UI, pill buttons throughout.

**A product-driven hero.** The home page opens on the range itself: one slide
per product, ordered by `heroOrder`, each with its own headline and subtext and
two CTAs, with autoplay, pause, swipe, arrows, keyboard and a counter — all of
it off under `prefers-reduced-motion`. The old admin-managed banner slides are
gone; the `banners` collection became `announcements`, and the hero is now
ordered and copy-edited in Admin → Home & Hero.

**A chaptered shop.** No filters, no sort, no pagination — an explicit brief
decision. `/shop` is eight full editorial chapters, one per product, with a
sticky chapter index, quick add, and the same chapters constrained by route on
the category pages. Search moved to a proper overlay plus a `/search` results
page.

**A rebuilt PDP with a real media gallery.** Images *and* videos in one authored
`media[]` list: thumbnails, an inline player, a lightbox, swipe and full
keyboard control, plus a "Full label" toggle that swaps the Cloudinary crop for
the uncropped pack shot. Below it, chaptered supporting content (overview,
benefits, key ingredients, how to use, the farmer story, full INCI list, FAQs),
reviews, cross-sell and Product + BreadcrumbList JSON-LD.

**Rituals.** Three curated routines as data (`rituals`), rendered as an index,
per-ritual detail pages with numbered steps and alternates, a home teaser, and
full CRUD in Admin → Rituals.

**The farmer-owned story, told with its qualifiers.** About, Why LAMIKAA, the
value chain, the four pillars and the impact triptych are all driven by
`siteContent` and edited in Admin → Content. Wherever profits or dividends
appear, the "can" / "subject to applicable laws and the company's dividend
declaration" wording is part of the copy and is asserted by a test.

**An admin that manages the shop, not just the catalogue.** Nineteen screens.
The product form gained a media manager (add, remove, reorder, preview, set the
primary, crop, per-row placeholder chips) that round-trips `media[]` and keeps
the derived `images[]` mirror in step. New screens for Concerns, Rituals,
Content, Announcements, FAQs (groups, placements, reordering) and Home & Hero;
Reviews grew approve/reject/create with a sample-data chip; the dashboard gained
hero, ritual, live-announcement and price-on-launch tiles.

---

### For the owner — what still has to be supplied

Nothing below is broken. Each is a fact this project refused to invent, carried
as a `{{TOKEN}}` that renders as nothing until you fill it in. Run
`npm run placeholders` at any time for the current, generated inventory; the
full register with candidates and sources is `prompts/_reference/PLACEHOLDERS.md`.

| Group | Tokens | Where to resolve |
|---|---|---|
| **Prices** | `{{PRICE_BODY_WASH}}`, `{{PRICE_FACE_MASK}}`, `{{PRICE_FACE_MIST}}`, `{{PRICE_FACE_SERUM}}`, `{{PRICE_MOISTURIZER_GEL}}` — five of the eight products ship as `price: null, priceTBA: true` ("Price on launch", purchase disabled) because their MRP is not legible on the packaging. The other three are seeded from the printed MRP (₹390 / ₹90 / ₹349, `priceSource: "packaging-mrp"`) and still want confirming. | Admin → Products |
| **Contact** | `{{LAMIKAA_EMAIL}}`, `{{LAMIKAA_PHONE}}`, `{{LAMIKAA_ADDRESS}}`, `{{SUPPORT_HOURS}}` — the footer address block, the contact page, the policies colophon and the admin invoice all hide their rows until these are real. The packaging prints `info@baopcl.com`, `+91 97076 91169` and the Bokakhat address; confirm they are the customer-care ones. | Admin → Settings → Store |
| **Social** | `{{LAMIKAA_INSTAGRAM_URL}}`, `{{LAMIKAA_FACEBOOK_URL}}`, `{{LAMIKAA_YOUTUBE_URL}}`, `{{LAMIKAA_WHATSAPP_URL}}` — no `https://{{…}}` link is ever rendered; the row simply is not there. | Admin → Settings → Social Links |
| **Domain** | `{{LAMIKAA_DOMAIN}}` — three ordered steps, no page changes: set `seo.siteUrl` in `src/config/brand.js`, run `npm run sitemap`, then uncomment the `Sitemap:` line already written into `public/robots.txt` with the same host. Candidate `lamikanaturals.com` (`.env.production` points the API at `core.lamikanaturals.com`). | `src/config/brand.js` |
| **Legal** | `{{GSTIN}}`, `{{CIN}}`, `{{JURISDICTION}}` — the footer colophon rows and the Terms jurisdiction sentence are dropped while unresolved. | Admin → Settings, Admin → Content → Terms |
| **Policies** | `{{DISPATCH_SLA}}`, `{{REFUND_TIMELINE}}`, `{{RETURN_WINDOW_DAYS}}`, `{{FREE_SHIPPING_THRESHOLD}}`, `{{LAUNCH_OFFER_TEXT}}` — the four policy documents are generic templates; sentences carrying an unresolved token are removed, not printed. The return window currently uses the boilerplate default of 7 days (`STOREFRONT_CONFIG.returnsWindowDays`). | Admin → Shipping, Admin → Announcements, Admin → Content |
| **Certifications** | `{{CERTIFICATIONS}}` — the packaging roundels (ISO Certified · GMP Certified · Non-GMO · Cruelty-Free) are shown **as printed**, only inside the PDP's "As printed on the pack" block. Remove any you cannot substantiate. `{{SHELF_LIFE}}` is unset and its row is hidden. | `src/config/brand.js → packBadges`, `productDefaults.shelfLife` |
| **Media** | 53 stand-in assets: 42 photographs (Picsum, Unsplash licence) and 11 videos (MDN CC0 and Cloudinary demo). 27 are product gallery rows flagged `"placeholder": true`; the rest are category, ritual and story imagery. Full list in `prompts/_reference/PLACEHOLDER_ASSETS.md`. | Admin → Products → Media, Admin → Content |

**Sample data to remove before launch** (real rows, not tokens):

- `admins[0]` — `admin@store.com` / `admin123`, stored in plain text. **Change both.**
- `users[0]` — `sample.customer@example.com` / `password123` with a Guwahati address and ₹390 of store credit.
- Three seeded orders, their three payments, one refund and one wallet transaction — the money trail behind them must stay in agreement if any row is edited.
- `coupons[0]` — `SAMPLE10`.
- `shipping_methods[0]` — "Standard Delivery" with `freeAbove: null` and `estimatedDays: ""` (the unresolved state of two tokens above).
- `reviews` — two rows flagged `isSample: true`, hidden from the storefront by `brand.flags.showSampleReviews === false`. Every product's `rating` and `totalReviews` are 0; nothing fabricates social proof.
- `leads` — one sample contact and one sample newsletter subscriber.

---

### Known limitations

- **The Laravel backend is not in this repository.** Every function in
  `src/services/api.js` has a live branch, but the newer routes it calls have to
  be implemented before live mode is complete: the hero, category-by-slug,
  concern and search product queries, product reviews with the sample filter,
  concerns, rituals, site content, announcements, hero config, and their admin
  CRUD and reorder counterparts. The full sheet — method, path, payload,
  response — is `prompts/_reference/REPO_MAP.md` §3.4 and §3.5. Mock mode is
  complete and exercised.
- **Sample data ships enabled**, as listed above, so the admin has something to
  show on a fresh clone.
- **`brand.flags.enableRitualBundles` is `false`.** "Add the whole ritual"
  bundling is built and works, but a bundle price cannot be stated while five of
  eight products have no price. Turn it on once the range is priced.
- **`brand.flags.showSampleReviews` is `false`**, which is why the PDP shows an
  empty reviews state on a fresh clone.
- **`brand.seo.siteUrl` is unresolved**, so `public/sitemap.xml` is not written
  and `robots.txt` carries its `Sitemap:` line commented out. Canonicals,
  `og:url` and JSON-LD `url` fall back to the runtime origin, so nothing is
  broken and nothing prints a token.
- **`npm run test:live` writes to the database it points at.** It is skipped by
  default and must never be run against production.

---

### Cleanup verification

The previous brand is absent from source, seeds, public assets and the
production build. Three greps establish it, and all three are **defined in
`prompts/_reference/BRAND_FOOTPRINT.md`** and were introduced by Prompt 36 at
commit `5cc9d3f`:

1. the previous brand's name and its six product-vocabulary words, over the
   whole repository except `node_modules/`, `.git/`, `build/` and `prompts/`;
2. the same list over the built `build/` directory;
3. the retired pre-rebrand CSS token names — the old emerald colours, the
   heritage gradient, the logo-background variable and the per-category colour
   family, all four spelled out in `BRAND_FOOTPRINT.md`.

Re-run on the tree this release is cut from, in the working copy and against a
fresh `CI=true npm run build`: **all three return zero results.** Copy the
commands from `BRAND_FOOTPRINT.md` rather than from here — spelling the search
terms in a committed file is exactly what would make grep 1 stop returning zero.

The only surviving mentions of the previous brand are inside `prompts/`, which
documents the rebuild and is not part of the application (see the README's
closing section).

### Gates

- `CI=true npm run build` — clean, no warnings.
- `npm test -- --watchAll=false` — 30 suites, 328 tests passing; the live-API
  suite (50 tests) skipped, as designed.
- Full storefront and admin regression in mock mode — 99 automated checks
  across home, catalogue, PDP, commerce, account, content, admin and the
  order/return lifecycles. Recorded in `prompts/PROGRESS.md`.

### Fixed in this release

- **Cash on Delivery was silently unavailable at checkout.** `codMaxOrder: 0` is
  what Admin → Settings → Payment calls "no maximum" and is the field's own
  default, but the checkout read a stored `0` as a real ₹0 cap, so COD was shown
  disabled ("Available for orders up to ₹0.00") on every order that cost
  anything — while the assurance rail still promised "Cash on delivery
  available". Zero now means no maximum, as documented.

---

## 1.0.1-lamikaa — 2026-09-10

A full-surface QA pass over the storefront and the admin console in mock mode:
every route, every tab, every button and every write path driven in a real
browser at four viewport widths, plus the keyboard, the accessibility tree and
the API-down case. Six defects were found and fixed; nothing else changed.

### Fixed

- **Changing your password did nothing, and said it had.** In mock mode
  `auth.changePassword` returned `{ success: true }` without checking anything
  or writing anything, so Profile → Settings accepted a WRONG current password
  and reported "Password updated successfully" — while the account kept the old
  password, locking the shopper out of the one they thought they had just set.
  The mock branch now verifies the current password against the stored user and
  writes the new one, and the screen prints the reason a change was refused.

- **A coupon applied in the cart was lost at checkout.** The tray, `/cart` and
  Checkout each held their own `couponApplied` state, so a code applied on one
  screen was simply gone on the next: the shopper was shown a discount and then
  charged the full price, and the order recorded no coupon. The applied coupon
  now lives on the cart (`CartContext`), shared by all three, persisted with the
  cart, re-validated when it is restored (a code that has since expired or been
  switched off is dropped rather than honoured), and cleared with the cart when
  the order is placed.

- **The admin was unusable on a phone after one tap.** Closing the navigation
  drawer in the same commit as `navigate()` interrupted MUI's exit transition,
  so `onExited` never fired, the modal never returned to `visibility: hidden`,
  and its backdrop stayed at full opacity over the whole panel — the screen
  looked fine and swallowed every tap. The drawer now closes from an effect on
  the route, in the commit after the swap, so the transition completes.

- **"Move to cart" threw on a saved product with no price.** The wishlist's own
  button ignored `priceTBA` — the card directly above it did not — so clicking
  it on any of the five unpriced products threw `PRICE_TBA` out of the click
  handler: nothing added, no toast, nothing said. It now reads "Coming soon" and
  is disabled, exactly like every other Add button in the storefront.

- **A product page reported a network failure as a 404.** Any failed read — a
  dropped connection, a 5xx, a timeout — set `notFound`, so a shopper on a
  flaky connection was told the product they had clicked does not exist. A
  genuine miss (an unknown slug, an unknown id, a drafted product) is still a
  real 404; a failed read now gets the error state and a "Try again", the same
  rule `/shop` already followed.

- **"Return / exchange" handed the care desk nothing.** The button in My Orders
  navigated to a blank contact form, and the lead reached Admin → Leads with an
  empty `orderNumber` — the field that screen prints. The order now travels with
  the visitor and seeds the subject, the order number and the category.

Two accessibility defects in the admin's tab sets were fixed alongside them:
Home & Hero's two panels had no `role="tabpanel"` at all, and Settings' five
panels were named by `aria-labelledby` ids that did not exist.

### Gates

- `CI=true npm run build` — clean, no warnings.
- `npm test -- --watchAll=false` — 29 suites, 328 tests passing; the live-API
  suite skipped, as designed.

---

## 1.1.0-lamikaa — 2026-09-10

The home page hero can now carry artwork behind its slides, set from the admin
console. Nothing else changed, and a storefront with no picture uploaded opens
exactly as it did before.

### Added

- **Slide backgrounds, at two levels.** The hero carousel drew its slides on the
  page's own ground — there was no artwork behind them and nowhere in the admin
  to put any. There are now two places a picture can come from, sharing one
  shape: `heroConfig.background`, the SECTION picture behind every slide, and
  `product.heroBackground`, ONE slide's own, which overrides it. Both are edited
  in **Admin → Home & Hero** — the section picture on *Section settings*, a
  slide's own inside its row on *Hero products* — and both are stored, read and
  rendered like every other admin-managed value: nothing about the hero's
  artwork is hardcoded.

- **One link is a whole background.** Only the image URL is a decision. The
  focal point, the scrim strength and the soft focus all have designed defaults
  and sit behind a "Framing & scrim" disclosure, so pasting a link and pressing
  save is a complete edit — and one link on *Section settings* dresses all eight
  slides at once. `normalizeHeroBackground()` accepts a bare URL string as well
  as a record, so a hand-edited `db.json` may say `"heroBackground": "https://…"`
  and mean it.

- **A slide can be its picture and nothing else.** Switching off "Show the
  product over the picture" hides that slide's copy, its two CTAs and its label
  plate, leaving the artwork and the control rail. The heading stays in the
  accessibility tree (the page keeps exactly one `h1`), the sizer keeps the
  column's height so nothing below the hero moves, and the plate for that slide
  is never fetched.

- **Every device.** A separate phone picture (`mobileUrl`) may be given for
  screens up to 768px, chosen in JS off the same media flag the plate's ratio
  already reads, so a browser downloads one file and not both; either URL alone
  is enough and each falls back to the other. The scrim turns with the
  composition — over the foot of the frame on a phone, over the copy column from
  the tablet up — and keeps a fixed wash under the transparent masthead so the
  header's type always has ground. Cloudinary links are delivered responsively
  (`f_auto,q_auto` + a five-rung `srcset`); any other host is used as given.

- **The carousel's existing budgets are unchanged.** Only the first slide's
  background is `priority`; the rest mount in the same `requestIdleCallback`
  pass the plates use. The crossfade follows the configured transition and stops
  under `prefers-reduced-motion`; an unblurred layer emits `filter: none` rather
  than `blur(0px)`, so it is never promoted to its own viewport-sized
  compositing layer; and the whole backdrop is dropped in print.

### Changed

- `Admin → Home & Hero`: a row's disclosure is now **Edit slide** and its button
  **Save slide** — it saves the two lines and the picture together. Rows are
  chipped with what backs them ("Own background", "Section background",
  "Background only"), and the live preview paints the resolved picture and its
  scrim. The "no primary image" warning no longer fires for a slide that shows
  nothing but its background, and it says what actually happens (the slide opens
  without its label plate) rather than that the slide is skipped.

