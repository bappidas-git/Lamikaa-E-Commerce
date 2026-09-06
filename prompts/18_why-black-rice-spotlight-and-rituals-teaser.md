# Prompt 18 — Why Black Rice spotlight and rituals teaser

- **Phase:** 2 — Home page
- **Depends on:** 17
- **Unlocks:** 19
- **Scope:** M
- **Expected files to change/create:** create `src/components/home/WhyBlackRice.js` (+ `.module.css`), `src/components/home/RitualsTeaser.js` (+ `.module.css`), `src/components/catalogue/RitualCard.js` (+ `.module.css`); change `src/pages/Home/Home.js`.

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–17 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Add the ingredient spotlight ("Why black rice?" — three cosmetic-safe points and the product family that carries it) and the rituals teaser (three glass ritual cards with step thumbnails and a "Build your ritual" CTA), with a reusable `RitualCard`.

## Pre-flight checks

```bash
node -e "const db=require('./db.json'); console.log(db.siteContent.home.whyBlackRice.points, db.rituals.map(r=>[r.slug, r.steps.length]))"
grep -n "rituals: {\|resolveSteps" src/services/api.js
grep -n "AboutTeaser" src/pages/Home/Home.js
```

## Tasks

1. **`WhyBlackRice`** — data `siteContent.home.whyBlackRice` (`eyebrow`, `title`, `points[3]`, `image`); layout: left = square placeholder image (`.sf-placeholder-media`, 1:1, radius xl, `GlowWrap tone="gold"` .16), right = `SectionHeading` (eyebrow "The hero ingredient", title "Why black rice?" with `gradientWord` "black"), three points as a `<ul>` with gold `mdi:check-circle-outline` glyphs (Manrope 17px), then "Carried by" eyebrow and a horizontal row of the eight products as 56px `.sf-plate` thumbnails linking to their PDPs (`aria-label` = product name; data `products.getHeroProducts()`); the copy is limited to the three seeded points — no claims beyond "antioxidant-rich" / "traditionally valued in Northeast India".
2. **`RitualCard`** — props `{ ritual, products, compact }`: `GlassCard interactive glow="violet"` linking to `/rituals/${slug}` (card-level `Link` with `aria-label`); top: placeholder image 16:10 (`.sf-placeholder-media`) or, when `compact`, no image; body: eyebrow "Ritual · {steps.length} steps", name (Fraunces 22px), `tagline`/first sentence of `story`, a step strip = up to 5 `.sf-plate` 40px thumbnails of the step products (`stageSrc(product,{w:80})`, `alternativeProductId` shown as a second stacked thumb) with a small `Chip variant="step"` numeral, `duration` line, CTA text "See the ritual →" (ghost style, part of the link).
3. **`RitualsTeaser`** — `SectionHeading` eyebrow "Rituals", title "Build your ritual" (`gradientWord` "ritual"), lede "Three curated routines, in the order the range was designed to be used."; three `RitualCard`s in a 3-column grid (1024+), 1 column stacked ≤ 768 (horizontal snap at ≤ 480 with 84vw cards); primary CTA `Button variant="primary"` "Build your ritual" → `/rituals` under the grid. Data: `rituals.getAll()` + `products.getAll()`; `apiService.rituals.resolveSteps` to attach products.
4. **Home wiring** — `<WhyBlackRice/>` then `<RitualsTeaser/>` after `<AboutTeaser/>`.

## Design and content specification

- Spotlight: two columns `0.9fr 1.1fr` gap 56px ≥ 1025px; image first on mobile; points 17px with 20px gold glyphs; thumbnails row scrolls horizontally on mobile.
- Ritual cards: glass, 20px padding, image 16:10, name 22px, step strip thumbs 40px with −8px overlap and hairline rings, numerals 24px; hover lift + violet glow .2.
- Copy: "The hero ingredient", "Why black rice?", "Carried by", "Rituals", "Build your ritual", "Three curated routines, in the order the range was designed to be used.", "Ritual · N steps", "See the ritual →".

## Data and API changes

Reads only (`siteContent.home`, `rituals.getAll`, `products.getAll`, `products.getHeroProducts`).

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: the ingredient points are the seeded ones only; a ritual card is one link (no nested interactive elements).

## Acceptance criteria

- [ ] Spotlight shows the three points and the eight product thumbnails linking to PDPs.
- [ ] Three ritual cards with correct step thumbnails (Morning 4, Evening 5, Body 2 with the alternative) link to `/rituals/<slug>` (stub until Prompt 24); the CTA links to `/rituals`.
- [ ] Mobile snap scroll for ritual cards ≤ 480px; no horizontal page scroll.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "WhyBlackRice\|RitualsTeaser" src/pages/Home/Home.js
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440; keyboard: each ritual card is one Tab stop; reduced motion.

## Handoff

1. `PROGRESS.md`: row 18 → `complete`.
2. `REPO_MAP.md` §5 "Updated by Prompt 18" (WhyBlackRice, RitualsTeaser, RitualCard).
3. Commit: `feat(lamikaa): 18 why black rice spotlight and rituals teaser`.
