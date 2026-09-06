# Prompt 20 — Why LAMIKAA section (pillars and impact)

- **Phase:** 2 — Home page
- **Depends on:** 19
- **Unlocks:** 21, 28
- **Scope:** M
- **Expected files to change/create:** create `src/components/brand/Pillars.js` (+ `.module.css`), `src/components/brand/ImpactTriptych.js` (+ `.module.css`), `src/components/home/WhyLamikaaSection.js` (+ `.module.css`); change `src/pages/Home/Home.js`.

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–19 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Present the four pillars (Indigenous Knowledge · Modern Cosmetic Science · Farmer Ownership · Responsible Beauty) as glass cards and the impact triptych (Financial · Social · Environmental) with three concise points each, copied faithfully from the brand brief, with a CTA to the Why LAMIKAA page — as reusable components the page in Prompt 28 shares.

## Pre-flight checks

```bash
node -e "const db=require('./db.json'); const i=db.siteContent.impact; console.log(i.items.map(x=>[x.key,x.title,x.points.length]))"
grep -n "pillars:" src/config/brand.js
grep -n "FullPageCta" src/pages/Home/Home.js
```

## Tasks

1. **`Pillars`** — props `{ pillars = brand.pillars, compact }`: four `GlassCard`s (`glow` alternating `gold`/`violet` on hover), each with an icon (`mdi:leaf`, `mdi:flask-outline`, `mdi:account-group-outline`, `mdi:earth`), numeral chip 01–04, title (Fraunces 22px), text (Manrope 15px secondary); grid 4 columns ≥ 1025px, 2 at 769–1024px, 1 (stacked) ≤ 768px with 16px gaps. Semantics: `<ul>`/`<li>`; not links.
2. **`ImpactTriptych`** — props `{ items, showImages }` from `siteContent.impact.items` (`key`, `title`, `points[3]`, `image`, `body`): three columns ≥ 1025px (`1fr 1fr 1fr`, 24px gap), stacked ≤ 1024px; each column: optional placeholder image 4:3 (`.sf-placeholder-media`), eyebrow from the key ("Financial" / "Social" / "Environmental"), title (Fraunces 20px — e.g. "From Raw Produce to Shared Value"), the three points as a `<ul>` with gold glyphs; `showImages` false in the home section, true on the page. Legal qualifiers: the Financial column's points must keep "can reach the member farmers through dividends" wording when they mention dividends (the seed does).
3. **`WhyLamikaaSection`** — `SectionHeading` eyebrow "Why LAMIKAA", title "Indigenous Wisdom. Modern Science. Responsible Beauty." (Fraunces `--sf-text-3xl`, no gradient word — it is the philosophy line), lede `brand.philosophy` is the title itself so the lede is `BRAND.md` 3.2's first sentence ("LAMIKAA Naturals believes that the future of beauty can be inspired by the wisdom of the past."); then `Pillars`; then a second heading row (eyebrow "Our impact", title "Beauty That Creates Prosperity for Farmers"); then `ImpactTriptych showImages={false}`; then `Button variant="secondary"` "Why LAMIKAA" → `/why-lamikaa`. Data: `siteContent.get("impact")`; pillars from `brand.js`.
4. **Home wiring** — `<WhyLamikaaSection/>` after `<FullPageCta/>`.

## Design and content specification

- Section ground `--sf-color-bg`; `--sf-section-y`; pillar cards 24px padding, icon 24px gold in a 44px glass circle; impact columns with a top gradient hairline; points 15px with 18px glyphs.
- Copy: pillar titles/texts verbatim from `brand.pillars`; impact titles/points from the seed (derived from `BRAND.md` 3.4–3.6); CTA "Why LAMIKAA".
- Motion: staggered `reveal` on cards; reduced motion static.

## Data and API changes

Reads `siteContent.impact`. None new.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: no percentages, counts or promises in the impact points; qualifiers preserved.

## Acceptance criteria

- [ ] Four pillar cards and the three impact columns render from config/data with the exact wording; CTA links to `/why-lamikaa` (stub until 28).
- [ ] Layout at all seven widths without overflow; cards keyboard-transparent.
- [ ] `grep -rn "guarantee\|% of profits\|percent" src/components/brand/ImpactTriptych.js src/components/home/WhyLamikaaSection.js` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "WhyLamikaaSection" src/pages/Home/Home.js
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440; reduced motion.

## Handoff

1. `PROGRESS.md`: row 20 → `complete`.
2. `REPO_MAP.md` §5 "Updated by Prompt 20" (Pillars, ImpactTriptych, WhyLamikaaSection).
3. Commit: `feat(lamikaa): 20 why lamikaa section pillars and impact`.
