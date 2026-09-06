# Prompt 17 — About LAMIKAA section and value-chain visual

- **Phase:** 2 — Home page
- **Depends on:** 16
- **Unlocks:** 18, 28
- **Scope:** M
- **Expected files to change/create:** create `src/components/brand/ValueChain.js` (+ `.module.css`), `src/components/home/AboutTeaser.js` (+ `.module.css`); change `src/pages/Home/Home.js`.

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`, `PLACEHOLDER_ASSETS.md`. Confirm that prompts 01–16 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Tell the farmer-owned story on the home page in short form — a placeholder Assam landscape, the quote "When LAMIKAA grows, our farmers grow with us.", the legal note — and build the reusable value-chain stepper (Farmer → FPC → Value Addition → LAMIKAA Naturals → Consumer → Profit → Farmer Members).

## Pre-flight checks

```bash
node -e "const db=require('./db.json'); console.log(JSON.stringify(db.siteContent.home.aboutTeaser,null,1).slice(0,600))"
grep -n "valueChain\|legalNote" src/config/brand.js
grep -n "LegalNote" src/components/brand/LegalNote.js
```

## Tasks

1. **`ValueChain`** — props `{ steps = brand.valueChain, orientation: "auto" | "horizontal" | "vertical", compact }`. Renders `<ol aria-label="How value reaches farmers">` of 7 steps: `Chip variant="step"` numeral (01–07), label (Manrope 600 14px; "LAMIKAA Naturals" in gold), and between steps a gradient hairline connector with a small arrow glyph (`aria-hidden`). `auto` = horizontal ≥ 1025px (single row, connectors 24–48px flexible), two rows of 4 + 3 at 769–1024px, vertical (connector down the left, 48px rows) ≤ 768px. Steps reveal in sequence (`reveal` with `index`), static under reduced motion. Exported for reuse by Prompts 20 and 28.
2. **`AboutTeaser`** — data from `apiService.siteContent.get("home")?.aboutTeaser` (if the block is missing or unpublished, fall back to `brand.legalNote` + `brand.signatureLines[3]` only and hide the paragraphs; never hard-code the long copy in the component). Layout: `SectionHeading` (eyebrow "About LAMIKAA", title from data — "When LAMIKAA grows, our farmers grow with us." rendered as a Fraunces pull-quote with the word "farmers" as `gradientWord`), two-column body on desktop: left = image (`CloudinaryImage`-free `img` via `.sf-placeholder-media` since Picsum is not Cloudinary; `aspect-ratio: 16/10`, radius `--sf-radius-xl`, `loading="lazy"`), right = the two short paragraphs from data (`ContentBlocks variant="editorial"`), then `ValueChain`, then `LegalNote`, then `Button variant="secondary"` "Our Story" → `/about`. Mobile: image, paragraphs, value chain (vertical), legal note, CTA.
3. **Home wiring** — mount `<AboutTeaser/>` after `<ProductShowcase/>`.
4. **Copy checks** — the section must quote `BRAND.md` 3.1 faithfully (the seeded text); every profit/dividend sentence keeps "can … through dividends, subject to applicable laws and the company's dividend declaration"; no numbers.

## Design and content specification

- Section on `--sf-color-surface` band (full-bleed) to alternate rhythm with the chapters; `--sf-section-y`; grid `1fr 1.1fr` gap 56px at ≥ 1025px; image with a faint gold glow behind (`GlowWrap tone="gold" intensity={0.16}`).
- Value chain: numerals 32px, labels 14px, connectors 1px gradient at 60 %; vertical variant with 40px left rail.
- Copy: eyebrow "About LAMIKAA"; CTA "Our Story"; value-chain labels exactly `brand.valueChain`.

## Data and API changes

Reads `siteContent.home.aboutTeaser` (seeded in 06). No admin change (siteContent editor is Prompt 34).

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: placeholder image carries `.sf-placeholder-media` and `alt=""` (decorative) — never describe a scene that is not real; the legal note is `LegalNote`, not retyped.

## Acceptance criteria

- [ ] Section renders data-driven copy, the quote, the placeholder image with the dark wash, the value chain (horizontal ≥ 1025, vertical ≤ 768), the legal note and the CTA.
- [ ] `ValueChain` is keyboard-transparent (no focusables) and reads as an ordered list of 7 items to a screen reader.
- [ ] Reduced motion: no sequential reveal.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -rn "subject to applicable laws" src/components/brand/LegalNote.js src/config/brand.js | wc -l   # ≥ 1
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440: value-chain wrapping (no overflow at 1024 two-row layout), image wash, quote line breaks, reduced motion.

## Handoff

1. `PROGRESS.md`: row 17 → `complete`.
2. `REPO_MAP.md` §5 "Updated by Prompt 17" (ValueChain, AboutTeaser).
3. Commit: `feat(lamikaa): 17 about lamikaa section and value chain visual`.
