# Prompt 27 — PDP: supporting content, reviews, cross-sell and JSON-LD

- **Phase:** 3 — Catalogue
- **Depends on:** 26
- **Unlocks:** 28
- **Scope:** M
- **Expected files to change/create:** change `src/pages/ProductDetails/ProductDetails.js` (+ `.module.css`); create `src/components/pdp/PackClaims.js`, `src/components/pdp/IngredientChapter.js`, `src/components/pdp/HowToUse.js`, `src/components/pdp/FarmerStory.js` (+ module CSS each), `src/utils/seo.js` (`productJsonLd`, `breadcrumbJsonLd`); change `src/components/storefront/ReviewsSection.js` (+ `.module.css`, restyle, sample gating copy), `src/components/storefront/FrequentlyBoughtTogether.js` (+ `.module.css`, retitle/restyle), `src/components/storefront/RelatedProducts.js` (+ `.module.css`, restyle).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`, `PACKAGING_NOTES.md`. Confirm that prompts 01–26 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Fill the product page chapters — Benefits, Key Ingredients (with the "as printed on the pack" block), How to Use / ritual step, The Farmer Story, Full Ingredients, FAQs, Reviews (existing feature preserved) and "Complete the ritual" cross-sell — and add `Product` and `BreadcrumbList` JSON-LD.

## Pre-flight checks

```bash
grep -n "Chapter id=\"overview\"\|ChapterNav" src/pages/ProductDetails/ProductDetails.js | head
grep -n "getReviews\|getRelated\|getFrequentlyBoughtTogether\|forProduct" src/pages/ProductDetails/ProductDetails.js
grep -n "packClaims\|packBadges" src/config/brand.js db.json | head -3
```

## Tasks

1. **Chapters (in order after Overview)** — each a `Chapter` with a stable id and only rendered when it has content:
   - `benefits` "Benefits": `<ul>` of `product.benefits` with gold `mdi:check-circle-outline` glyphs, two columns ≥ 769px.
   - `ingredients` "Key ingredients" (`IngredientChapter`): a row of `GlassCard`s (one per `keyIngredients[]`: name Fraunces 20px, benefit 14px; black rice first with a gold hairline), then `PackClaims`: eyebrow "As printed on the pack", the `packClaims[]` as a quiet list, `packBadges` from `brand.packBadges` as `Chip variant="trust"` (only when `!isPlaceholder`), `fragranceNote`, and `caution` in a callout (`ContentBlocks` callout style) titled "Caution".
   - `how-to-use` "How to use" (`HowToUse`): `<ol>` of `howToUse[]` with `Chip variant="step"` numerals; a "Ritual step" card: `ritualStep.order/label/frequency`, and links to the rituals that include this product (`rituals.getAll()` filtered by `steps[].productId`/`alternativeProductId`) as `RitualCard compact`.
   - `farmer-story` "The farmer story" (`FarmerStory`): two sentences from `siteContent.about.lede` + `siteContent.home.aboutTeaser.text` first paragraph (data), `ValueChain compact`, `LegalNote`, `Button variant="ghost"` "Read our story" → `/about`.
   - `full-ingredients` "Full ingredients": `ingredientsList` in a `<details>`-style disclosure (`Accordion` single item, closed by default) in 14px `--sf-color-text-secondary`; a "Good to know" row with `suitableFor[]` and the shelf-life line **only** when `brand.productDefaults.shelfLife` is not a placeholder.
   - `faqs` "FAQs": `FAQ faqs={useFaqs().forProduct(product)}` (inline `product.faqs` first, then targeted, then general product-page rows — existing `faqsForProduct` logic).
   - `reviews` "Reviews": `ReviewsSection` with the existing props (`reviews`, `displayAvg`, `totalRatingsCount`, `loading`, `error`, `onRetry`) fed by `products.getReviews(product.id)` (sample rows gated by the flag); restyle to glass; keep the blended-average logic; empty state "No reviews yet — reviews are written by customers from My Orders after delivery."; keep the reviews-tab scroll target for `SocialProof` clicks.
   - `complete-the-ritual` "Complete the ritual": `FrequentlyBoughtTogether` (retitled "Complete the ritual", copy "The next steps of the routine, chosen for this product."; anchor + companions from `frequentlyBoughtTogetherIds`, real-price total only over known prices, TBA companions shown unticked and disabled) and `RelatedProducts` (title "You may also like", `getRelated`).
   `ChapterNav` labels update automatically from the rendered chapters.
2. **JSON-LD** (`src/utils/seo.js`) — `productJsonLd(product, { url, category })` → `{ "@context": "https://schema.org", "@type": "Product", name, image: [stageSrc(...w 1200), ...gallery images], description, sku, brand: { "@type": "Brand", name: "LAMIKAA Naturals" }, category, offers: <only when price known> { "@type": "Offer", priceCurrency: "INR", price, availability: stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url, itemCondition: "https://schema.org/NewCondition" }, aggregateRating: <only when totalRatingsCount > 0> { ratingValue, reviewCount } }`; `breadcrumbJsonLd([{name, url}...])`. Pass both through `useSeo({ jsonLd })` in `ProductDetails`.
3. **Restyles** — `ReviewsSection`: summary plate glass, distribution bars gradient, review cards hairline; `FrequentlyBoughtTogether`: plates + tick list + total; `RelatedProducts`: rail of `ProductCard`s with edge fades; copy free of "piece/weave/studio".
4. **Chapter data** — one `Promise.all` for reviews, related, FBT, rituals, siteContent (`about`, `home`) after the product resolves; each independent failure degrades its own chapter.

## Design and content specification

- Chapter rhythm `--sf-section--tight`; chapter eyebrows "Chapter 02" …; ingredient cards 3-up ≥ 1025 / 2-up 769–1024 / 1-up ≤ 768; pack claims 14px muted list; caution callout glass with a gold left hairline.
- Copy: "Benefits", "Key ingredients", "As printed on the pack", "Caution", "How to use", "Ritual step", "Part of these rituals", "The farmer story", "Read our story", "Full ingredients", "Good to know", "FAQs", "Reviews", "Complete the ritual", "You may also like".
- Claims discipline: chapters print data only; the only "anti-ageing" text on the page is inside `packClaims` under "As printed on the pack".

## Data and API changes

Reads only. Sample reviews stay hidden unless `brand.flags.showSampleReviews` is true.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: no `aggregateRating`/`offers` in JSON-LD without real data; the reviews feature (submission from My Orders, moderation in admin) stays intact; no medical language anywhere.

## Acceptance criteria

- [ ] All chapters render with seeded data on `/product/black-rice-face-serum`; the ChapterNav lists them; anchors work.
- [ ] Reviews: empty state shown (sample hidden); flip the flag locally → the sample review appears; revert.
- [ ] Complete the ritual: FBT total counts only priced products; related rail renders.
- [ ] JSON-LD validates (Rich Results test) for a priced product (offers) and a TBA product (no offers).
- [ ] `grep -rn "piece\b\|weave\|loom" src/components/storefront/ReviewsSection.js src/components/storefront/FrequentlyBoughtTogether.js src/components/storefront/RelatedProducts.js` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "productJsonLd\|breadcrumbJsonLd" src/pages/ProductDetails/ProductDetails.js
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440; keyboard through accordions and disclosures; reduced motion.

## Handoff

1. `PROGRESS.md`: row 27 → `complete`.
2. `REPO_MAP.md` §6 "Updated by Prompt 27" (PDP chapters; seo utils).
3. Commit: `feat(lamikaa): 27 pdp supporting content, reviews, cross-sell and json-ld`.
