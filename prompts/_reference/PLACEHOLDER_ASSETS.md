# PLACEHOLDER_ASSETS — every stand-in image and video (replace in one pass)

> Brief §11. Product covers and the logo/icon are **real** (see `PRODUCTS.md`) and never listed here. Everything below is a stable, openly usable stand-in **seeded into `db.json` by Prompt 06**. Prompt 39 regenerates this inventory from `db.json` + `src/` so the owner can swap URLs later — product media from Admin → Products → Media, everything else from Admin → Content.

**Seeded and verified (Prompt 06, 2026-09-06).** Every URL below is now in `db.json` character-for-character as written here, and all **48 distinct URLs in the seed** (8 real covers + 11 video posters + these placeholders) answered a ranged GET with **206** from the build environment. **No host swap was needed** — every host in the pre-flight list held up, so no alternate from the list at the end of this file was substituted. Picsum answers the first request with a `302` to its CDN and `206` once the redirect is followed; that is normal and is not a failure. Re-verify before re-seeding with:

```bash
node -e 'const db=require("./db.json");const u=new Set();(function w(n){if(typeof n==="string"){if(/^https?:\/\//.test(n))u.add(n)}else if(Array.isArray(n))n.forEach(w);else if(n&&typeof n==="object")Object.values(n).forEach(w)})(db);console.log([...u].sort().join("\n"))' \
  | while read u; do printf "%s  %s\n" "$(curl -sSL -o /dev/null -w '%{http_code}' -r 0-0 --max-time 25 "$u")" "$u"; done
```

Licence notes: **Picsum** (`picsum.photos/seed/<seed>/<w>/<h>`) serves Unsplash photographs under the Unsplash licence (free for commercial use, no attribution required; each seed is a fixed random photo — content is unrelated to skincare and must be treated as a layout stand-in). **MDN CC0 videos** (`interactive-examples.mdn.mozilla.net/media/cc0-videos/*.mp4`) are CC0. **Cloudinary demo videos** (`res.cloudinary.com/demo/video/upload/*.mp4`) are Cloudinary's public sample media (verify terms before any public launch — listed only as fallbacks). The brief's Google `gtv-videos-bucket` samples and `w3schools.com/html/mov_bbb.mp4` returned **403** from the analysis environment (a proxy restriction is likely); they are listed as alternates to verify from the developer's machine, not seeded.

Every placeholder is rendered with the `.sf-placeholder-media` treatment (CSS `filter: saturate(.6) brightness(.85)` + a `--sf-color-bg` gradient overlay at 35 %) so it sits inside the palette, and every `media[]` row carries `"placeholder": true` so the admin can show a "Placeholder" chip.

## Product gallery images (2 per product, 1200×1500)

Seeded at `products[n].media[1]` and `media[2]`, each `"placeholder": true`, with `alt` "<name> — placeholder lifestyle image" / "— placeholder texture image". The seed pattern is `https://picsum.photos/seed/lamikaa-<product slug>-2|3/1200/1500`.

| Product | Slot | URL | Should become |
|---|---|---|---|
| Face Wash | media[1], media[2] | `https://picsum.photos/seed/lamikaa-black-rice-face-wash-2/1200/1500`, `https://picsum.photos/seed/lamikaa-black-rice-face-wash-3/1200/1500` | Lifestyle photo; texture/swatch photo |
| Goat Milk Soap | media[1], media[2] | `https://picsum.photos/seed/lamikaa-black-rice-goat-milk-soap-2/1200/1500`, `https://picsum.photos/seed/lamikaa-black-rice-goat-milk-soap-3/1200/1500` | Bar photo; lather/texture |
| Body Wash | media[1], media[2] | `https://picsum.photos/seed/lamikaa-black-rice-body-wash-2/1200/1500`, `https://picsum.photos/seed/lamikaa-black-rice-body-wash-3/1200/1500` | Bottle photo; in-use |
| Face Mask | media[1], media[2] | `https://picsum.photos/seed/lamikaa-black-rice-face-mask-2/1200/1500`, `https://picsum.photos/seed/lamikaa-black-rice-face-mask-3/1200/1500` | Jar photo; clay texture |
| Face Mist | media[1], media[2] | `https://picsum.photos/seed/lamikaa-black-rice-face-mist-2/1200/1500`, `https://picsum.photos/seed/lamikaa-black-rice-face-mist-3/1200/1500` | Bottle photo; mist |
| Exfoliating Face Scrub | media[1], media[2] | `https://picsum.photos/seed/lamikaa-black-rice-exfoliating-face-scrub-2/1200/1500`, `https://picsum.photos/seed/lamikaa-black-rice-exfoliating-face-scrub-3/1200/1500` | Tube/jar photo; grain texture |
| Face Serum | media[1], media[2] | `https://picsum.photos/seed/lamikaa-black-rice-face-serum-2/1200/1500`, `https://picsum.photos/seed/lamikaa-black-rice-face-serum-3/1200/1500` | Dropper bottle; drop |
| Moisturizer Gel | media[1], media[2] | `https://picsum.photos/seed/lamikaa-black-rice-moisturizer-gel-2/1200/1500`, `https://picsum.photos/seed/lamikaa-black-rice-moisturizer-gel-3/1200/1500` | Jar photo; gel texture |

## Product videos (1 per product + a second on the three hero-leading products)

Seeded as `{ type: "video", url, poster: <the product's real cover URL>, title, placeholder: true }`. Products 1 (Face Wash), 4 (Face Mask) and 7 (Face Serum) carry the second row; every other product has exactly one video, so `media[]` is 5 rows for those three and 4 rows for the rest.

| Product | Slot | URL | Poster | Should become |
|---|---|---|---|---|
| Face Wash | media[3] | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` | the product cover (stage crop) | "How to use" clip |
| Face Wash | media[4] | `https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4` | cover | Brand/farm story clip |
| Goat Milk Soap | media[3] | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4` | cover | How to use |
| Body Wash | media[3] | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` | cover | How to use |
| Face Mask | media[3] | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4` | cover | How to use |
| Face Mask | media[4] | `https://res.cloudinary.com/demo/video/upload/elephants.mp4` | cover | Ritual clip |
| Face Mist | media[3] | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` | cover | How to use |
| Exfoliating Face Scrub | media[3] | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4` | cover | How to use |
| Face Serum | media[3] | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` | cover | How to use |
| Face Serum | media[4] | `https://res.cloudinary.com/demo/video/upload/dog.mp4` | cover | Ritual clip |
| Moisturizer Gel | media[3] | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4` | cover | How to use |

Alternates to verify from the developer machine (brief §11): `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`, `…/ElephantsDream.mp4`, `…/ForBiggerBlazes.mp4`, `https://www.w3schools.com/html/mov_bbb.mp4`.

## Category hero images (1600×1000)

`https://picsum.photos/seed/lamikaa-cat-face-care/1600/1000` · `…/lamikaa-cat-body-care/1600/1000` · `…/lamikaa-cat-cleansers/1600/1000` · `…/lamikaa-cat-serums/1600/1000` · `…/lamikaa-cat-moisturizers/1600/1000` · `…/lamikaa-cat-masks/1600/1000` · `…/lamikaa-cat-rituals/1600/1000` → `db.json → categories[*].heroImage` **and** `categories[*].image` (seeded to the same URL, so the existing admin category manager keeps working); shown on category page heads and the mega-panel featured card. Should become: styled product/lifestyle photography per category.

## Ritual images (1200×1500)

`https://picsum.photos/seed/lamikaa-ritual-morning/1200/1500`, `…/lamikaa-ritual-evening/1200/1500`, `…/lamikaa-ritual-body/1200/1500` → `db.json → rituals[*].image` (morning-glow, evening-renewal, black-rice-body in that order); home rituals teaser cards and `/rituals` pages. Should become: routine photography.

## Brand story / impact imagery

| Slot | URL | Where | Should become |
|---|---|---|---|
| Home "About LAMIKAA" landscape | `https://picsum.photos/seed/lamikaa-farm/1600/1000` | `siteContent.home.aboutTeaser.image` | Farm / Assam landscape with farmer-members |
| About page opening | `https://picsum.photos/seed/lamikaa-assam-landscape/1920/1080` | `siteContent.about.heroImage` | Assam landscape |
| About page "farmer-owners" | `https://picsum.photos/seed/lamikaa-farmers/1600/1000` | `siteContent.about.image2` | BAOPCL farmer members |
| Impact triptych | `https://picsum.photos/seed/lamikaa-impact-financial/1200/900`, `…-social/1200/900`, `…-environmental/1200/900` | `siteContent.impact.items[*].image` | Financial / social / environmental photography |
| Why Black Rice spotlight | `https://picsum.photos/seed/lamikaa-black-rice/1200/1200` | `siteContent.home.whyBlackRice.image` | Black rice macro photo |
| Full-page CTA background | `https://picsum.photos/seed/lamikaa-cta/1920/1080` | `siteContent.home.fullPageCta.image` (behind a 70 % `--sf-color-bg` wash + gradient) | Editorial brand photograph |
| Why LAMIKAA page opening | `https://picsum.photos/seed/lamikaa-why/1920/1080` | `siteContent.whyLamikaa.heroImage` | Brand photograph |
| ~~Hero fallback~~ **RETIRED (Prompt 14)** | — | — | `HERO_FALLBACK_IMAGE` was deleted in Prompt 07 and never restored: `home/HeroCarousel`'s fallback is a BRAND SLIDE (wordmark + `brand.tagline` + one CTA) and the hero carries no background imagery at all, so there is no placeholder photograph to inventory |
| Contact page | none | — | — |
| OG default image | real logo (`brand.logoUrl`, `cld(…,{w:1200})`) | `brand.seo.ogImage` | A 1200×630 branded share image (optional) |

## Current inventory — generated

> **Generated, not hand-maintained.** `npm run placeholders`
> (`scripts/placeholder-inventory.js`) finds every stand-in asset by two
> independent signals and unions them: the `"placeholder": true` flag that
> Prompt 06 seeded and the admin's media manager round-trips, which is
> authoritative for product galleries; and the four stand-in hosts
> (`picsum.photos`, `interactive-examples.mdn.mozilla.net`, `mdn.mozilla.net`,
> `res.cloudinary.com/demo`) anywhere in `db.json` or `src/`, which is the only
> thing that reaches the category, ritual and story imagery — that lives outside
> `media[]` and carries no flag. A row found by both names both signals. The
> hand-written tables above (what each slot *should become*, and the licence
> notes) stay; re-run the script after a swap and paste the output here.
>
> **Last regenerated: Prompt 39, 2026-09-08.**
>
> The derived mirrors `products[].images[]` and `products[].image` are excluded
> on purpose: they are copies of `media[]` kept in step by `syncProductMedia`,
> not a second asset to replace. Video `poster` fields are excluded for the same
> reason — every poster is the product's REAL cover, not a stand-in.

### Table 2 — placeholder media

| # | Type | Host | Signal | Where | URL |
|---|---|---|---|---|---|
| 1 | image | `picsum.photos` | flag + host | `products[black-rice-body-wash].media[1]` | `https://picsum.photos/seed/lamikaa-black-rice-body-wash-2/1200/1500` |
| 2 | image | `picsum.photos` | flag + host | `products[black-rice-body-wash].media[2]` | `https://picsum.photos/seed/lamikaa-black-rice-body-wash-3/1200/1500` |
| 3 | video | `interactive-examples.mdn.mozilla.net` | flag + host | `products[black-rice-body-wash].media[3]` | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` |
| 4 | image | `picsum.photos` | flag + host | `products[black-rice-exfoliating-face-scrub].media[1]` | `https://picsum.photos/seed/lamikaa-black-rice-exfoliating-face-scrub-2/1200/1500` |
| 5 | image | `picsum.photos` | flag + host | `products[black-rice-exfoliating-face-scrub].media[2]` | `https://picsum.photos/seed/lamikaa-black-rice-exfoliating-face-scrub-3/1200/1500` |
| 6 | video | `interactive-examples.mdn.mozilla.net` | flag + host | `products[black-rice-exfoliating-face-scrub].media[3]` | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4` |
| 7 | image | `picsum.photos` | flag + host | `products[black-rice-face-mask].media[1]` | `https://picsum.photos/seed/lamikaa-black-rice-face-mask-2/1200/1500` |
| 8 | image | `picsum.photos` | flag + host | `products[black-rice-face-mask].media[2]` | `https://picsum.photos/seed/lamikaa-black-rice-face-mask-3/1200/1500` |
| 9 | video | `interactive-examples.mdn.mozilla.net` | flag + host | `products[black-rice-face-mask].media[3]` | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4` |
| 10 | video | `res.cloudinary.com` | flag + host | `products[black-rice-face-mask].media[4]` | `https://res.cloudinary.com/demo/video/upload/elephants.mp4` |
| 11 | image | `picsum.photos` | flag + host | `products[black-rice-face-mist].media[1]` | `https://picsum.photos/seed/lamikaa-black-rice-face-mist-2/1200/1500` |
| 12 | image | `picsum.photos` | flag + host | `products[black-rice-face-mist].media[2]` | `https://picsum.photos/seed/lamikaa-black-rice-face-mist-3/1200/1500` |
| 13 | video | `interactive-examples.mdn.mozilla.net` | flag + host | `products[black-rice-face-mist].media[3]` | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` |
| 14 | image | `picsum.photos` | flag + host | `products[black-rice-face-serum].media[1]` | `https://picsum.photos/seed/lamikaa-black-rice-face-serum-2/1200/1500` |
| 15 | image | `picsum.photos` | flag + host | `products[black-rice-face-serum].media[2]` | `https://picsum.photos/seed/lamikaa-black-rice-face-serum-3/1200/1500` |
| 16 | video | `interactive-examples.mdn.mozilla.net` | flag + host | `products[black-rice-face-serum].media[3]` | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` |
| 17 | video | `res.cloudinary.com` | flag + host | `products[black-rice-face-serum].media[4]` | `https://res.cloudinary.com/demo/video/upload/dog.mp4` |
| 18 | image | `picsum.photos` | flag + host | `products[black-rice-face-wash].media[1]` | `https://picsum.photos/seed/lamikaa-black-rice-face-wash-2/1200/1500` |
| 19 | image | `picsum.photos` | flag + host | `products[black-rice-face-wash].media[2]` | `https://picsum.photos/seed/lamikaa-black-rice-face-wash-3/1200/1500` |
| 20 | video | `interactive-examples.mdn.mozilla.net` | flag + host | `products[black-rice-face-wash].media[3]` | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` |
| 21 | video | `res.cloudinary.com` | flag + host | `products[black-rice-face-wash].media[4]` | `https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4` |
| 22 | image | `picsum.photos` | flag + host | `products[black-rice-goat-milk-soap].media[1]` | `https://picsum.photos/seed/lamikaa-black-rice-goat-milk-soap-2/1200/1500` |
| 23 | image | `picsum.photos` | flag + host | `products[black-rice-goat-milk-soap].media[2]` | `https://picsum.photos/seed/lamikaa-black-rice-goat-milk-soap-3/1200/1500` |
| 24 | video | `interactive-examples.mdn.mozilla.net` | flag + host | `products[black-rice-goat-milk-soap].media[3]` | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4` |
| 25 | image | `picsum.photos` | flag + host | `products[black-rice-moisturizer-gel].media[1]` | `https://picsum.photos/seed/lamikaa-black-rice-moisturizer-gel-2/1200/1500` |
| 26 | image | `picsum.photos` | flag + host | `products[black-rice-moisturizer-gel].media[2]` | `https://picsum.photos/seed/lamikaa-black-rice-moisturizer-gel-3/1200/1500` |
| 27 | video | `interactive-examples.mdn.mozilla.net` | flag + host | `products[black-rice-moisturizer-gel].media[3]` | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4` |
| 28 | image | `picsum.photos` | host | `categories[0].heroImage` | `https://picsum.photos/seed/lamikaa-cat-face-care/1600/1000` |
| 29 | image | `picsum.photos` | host | `categories[0].image` | `https://picsum.photos/seed/lamikaa-cat-face-care/1600/1000` |
| 30 | image | `picsum.photos` | host | `categories[1].heroImage` | `https://picsum.photos/seed/lamikaa-cat-body-care/1600/1000` |
| 31 | image | `picsum.photos` | host | `categories[1].image` | `https://picsum.photos/seed/lamikaa-cat-body-care/1600/1000` |
| 32 | image | `picsum.photos` | host | `categories[2].heroImage` | `https://picsum.photos/seed/lamikaa-cat-cleansers/1600/1000` |
| 33 | image | `picsum.photos` | host | `categories[2].image` | `https://picsum.photos/seed/lamikaa-cat-cleansers/1600/1000` |
| 34 | image | `picsum.photos` | host | `categories[3].heroImage` | `https://picsum.photos/seed/lamikaa-cat-serums/1600/1000` |
| 35 | image | `picsum.photos` | host | `categories[3].image` | `https://picsum.photos/seed/lamikaa-cat-serums/1600/1000` |
| 36 | image | `picsum.photos` | host | `categories[4].heroImage` | `https://picsum.photos/seed/lamikaa-cat-moisturizers/1600/1000` |
| 37 | image | `picsum.photos` | host | `categories[4].image` | `https://picsum.photos/seed/lamikaa-cat-moisturizers/1600/1000` |
| 38 | image | `picsum.photos` | host | `categories[5].heroImage` | `https://picsum.photos/seed/lamikaa-cat-masks/1600/1000` |
| 39 | image | `picsum.photos` | host | `categories[5].image` | `https://picsum.photos/seed/lamikaa-cat-masks/1600/1000` |
| 40 | image | `picsum.photos` | host | `categories[6].heroImage` | `https://picsum.photos/seed/lamikaa-cat-rituals/1600/1000` |
| 41 | image | `picsum.photos` | host | `categories[6].image` | `https://picsum.photos/seed/lamikaa-cat-rituals/1600/1000` |
| 42 | image | `picsum.photos` | host | `rituals[0].image` | `https://picsum.photos/seed/lamikaa-ritual-morning/1200/1500` |
| 43 | image | `picsum.photos` | host | `rituals[1].image` | `https://picsum.photos/seed/lamikaa-ritual-evening/1200/1500` |
| 44 | image | `picsum.photos` | host | `rituals[2].image` | `https://picsum.photos/seed/lamikaa-ritual-body/1200/1500` |
| 45 | image | `picsum.photos` | host | `siteContent.about.heroImage` | `https://picsum.photos/seed/lamikaa-assam-landscape/1920/1080` |
| 46 | image | `picsum.photos` | host | `siteContent.about.image2` | `https://picsum.photos/seed/lamikaa-farmers/1600/1000` |
| 47 | image | `picsum.photos` | host | `siteContent.home.aboutTeaser.image` | `https://picsum.photos/seed/lamikaa-farm/1600/1000` |
| 48 | image | `picsum.photos` | host | `siteContent.home.fullPageCta.image` | `https://picsum.photos/seed/lamikaa-cta/1920/1080` |
| 49 | image | `picsum.photos` | host | `siteContent.home.whyBlackRice.image` | `https://picsum.photos/seed/lamikaa-black-rice/1200/1200` |
| 50 | image | `picsum.photos` | host | `siteContent.impact.items[0].image` | `https://picsum.photos/seed/lamikaa-impact-financial/1200/900` |
| 51 | image | `picsum.photos` | host | `siteContent.impact.items[1].image` | `https://picsum.photos/seed/lamikaa-impact-social/1200/900` |
| 52 | image | `picsum.photos` | host | `siteContent.impact.items[2].image` | `https://picsum.photos/seed/lamikaa-impact-environmental/1200/900` |
| 53 | image | `picsum.photos` | host | `siteContent.whyLamikaa.heroImage` | `https://picsum.photos/seed/lamikaa-why/1920/1080` |
| 54 | image | `picsum.photos` | host | `src/components/pdp/MediaGallery.test.js:37` | `https://picsum.photos/seed/face-wash-2/1200/1500` |
| 55 | image | `picsum.photos` | host | `src/components/pdp/MediaGallery.test.js:42` | `https://picsum.photos/seed/face-wash-3/1200/1500` |
| 56 | image | `picsum.photos` | host | `src/components/pdp/MediaGallery.test.js:67` | `https://picsum.photos/seed/soap/1200/1200` |
| 57 | image | `picsum.photos` | host | `src/components/storefront/ProductCard.test.js:42` | `https://picsum.photos/seed/x/1200/1500` |
| 58 | image | `picsum.photos` | host | `src/components/storefront/ProductCard.test.js:91` | `https://picsum.photos/seed/x/1200/1500` |
| 59 | image | `picsum.photos` | host | `src/utils/product.test.js:25` | `https://picsum.photos/seed/lamikaa-2/1200/1500` |
| 60 | video | `interactive-examples.mdn.mozilla.net` | host | `src/utils/product.test.js:26` | `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` |
| 61 | video | `res.cloudinary.com` | host | `src/utils/product.test.js:185` | `res.cloudinary.com/demo/video/upload/x.mp4` |

**53 placeholder assets in `db.json`** (42 images, 11 videos) across 3 hosts: `interactive-examples.mdn.mozilla.net`, `picsum.photos`, `res.cloudinary.com`. 27 carry `"placeholder": true` in `products[].media[]`; the rest are category, ritual and story imagery, which lives outside `media[]` and is found by host alone. 8 further stand-in URLs are test fixtures under `src/`.

**Cross-check against the tables above — Prompt 39.** The generated figures
agree with what Prompt 06 seeded and this file documents: 16 product gallery
images (2 per product), 11 product videos (1 each, plus a second on products 1,
4 and 7) — 27 rows flagged in `products[].media[]` — plus 14 category slots
(7 categories × `image` and `heroImage`, seeded to the same URL so the existing
admin category manager keeps working), 3 ritual images and 9 story/impact
images: **53 in `db.json`**. The 8 further hits under `src/` are unit-test
fixtures, not shipped assets. Nothing has drifted, nothing has been swapped
for a real asset yet, and the retired hero-fallback row correctly finds no
match.

## Placeholder text media

- Loading/splash screen: real logo. Favicons: generated from the real icon.
- Newsletter/CTA sections use no imagery other than the above.
