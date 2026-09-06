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
| Hero fallback (only when no hero product resolves) | `https://picsum.photos/seed/lamikaa-hero-fallback/1600/900` | `src/utils/heroConfig.js → HERO_FALLBACK_IMAGE` (Prompt 14) | Any brand photograph; the fallback is never shown once products are seeded. **Not in `db.json`** — it lives in code, so it is the one row here Prompt 06 did not seed |
| Contact page | none | — | — |
| OG default image | real logo (`brand.logoUrl`, `cld(…,{w:1200})`) | `brand.seo.ogImage` | A 1200×630 branded share image (optional) |

## Placeholder text media

- Loading/splash screen: real logo. Favicons: generated from the real icon.
- Newsletter/CTA sections use no imagery other than the above.
