# Prompt 24 — Category pages and rituals pages

- **Phase:** 3 — Catalogue
- **Depends on:** 23
- **Unlocks:** 25
- **Scope:** M
- **Expected files to change/create:** change `src/pages/Shop/Shop.js` (`mode="category"`), `src/App.js`; create `src/pages/Rituals/Rituals.js` (+ `.module.css`), `src/pages/Rituals/RitualDetail.js` (+ `.module.css`), `src/components/catalogue/RitualStep.js` (+ `.module.css`), `src/components/catalogue/CategoryHead.js` (+ `.module.css`).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–23 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Give the seven categories their routes (the same chaptered component constrained by the URL, with a category head) and build the rituals pages: the index of three curated routines and the ritual detail with numbered steps, product cards, timing notes and a per-ritual CTA (including "Add the whole ritual to cart" behind the brand flag).

## Pre-flight checks

```bash
grep -n "getByCategorySlug\|rituals: {\|resolveSteps" src/services/api.js
grep -n "addMany" src/context/CartContext.js
grep -n "ComingSoon" src/App.js     # /rituals, /rituals/:slug, /why-lamikaa, /cart remain
grep -n "enableRitualBundles" src/config/brand.js
```

## Tasks

1. **`Shop mode="category"`** — `App.js` routes `/category/:slug` to `<Shop mode="category" />`; the page reads `useParams().slug`, calls `products.getByCategorySlug(slug)` → `{ category, products }`; `slug === "rituals"` (or `category.kind === "rituals"`) → `<Navigate to="/rituals" replace />`; unknown slug → `NotFound`. Head = `CategoryHead`: full-bleed band with the category `heroImage` (placeholder, `.sf-placeholder-media`, `aspect-ratio 21/9` desktop, `4/3` mobile, wash) and a glass panel: breadcrumb (Home / Shop / {displayName} — `Breadcrumb` component restyled; `aria-current`), eyebrow "Category", `h1` `displayName`, `description`, count, and the concern chips of the products in this category. Chapters, rail/strip and the closing panel are identical to `/shop`. `useSeo({ title: displayName, description, jsonLd: [breadcrumbJsonLd, itemListJsonLd] })`.
2. **`Rituals` index** (`/rituals`) — `useSeo({ title: "Rituals" })`; `SectionHeading as="h1"` eyebrow "Rituals", title "Curated routines" (`gradientWord` "routines"), lede "Three ways to use the Black Rice range in the order it was designed for."; three full-width `GlassCard`s (image 16:10 placeholder left, content right: name, tagline, story, step strip of plates with numerals, duration, `Button variant="primary"` "See the ritual" → `/rituals/<slug>`); stacked on mobile.
3. **`RitualDetail`** (`/rituals/:slug`) — data `rituals.getBySlug(slug)` + `products.getAll()` → `resolveSteps`; unknown → `NotFound`. Layout: head (breadcrumb Home / Rituals / {name}; eyebrow "Ritual · {n} steps · {duration}"; `h1` name; `story` via `ContentBlocks variant="editorial"`; placeholder image right on desktop) then the steps as `RitualStep` rows, then the CTA panel, then `LegalNote compact`.
4. **`RitualStep`** — props `{ step, index }`: numeral (`Chip variant="step"`), a 1:1 `.sf-plate` label crop (`stageSrc(product,{w:480})`) linking to the PDP, name (Fraunces 22, link), `promise`, the step `note` in italics, `frequency` chip ("Weekly", "2–3 times weekly"), `Price product`, `Button variant="addToCart" size="sm"` (disabled "Coming soon" when TBA); when `alternativeProduct` exists render a segmented choice "Bar / Wash" (two `role="radio"` buttons) that swaps the card and the add action. Connectors: a vertical gradient hairline joins the numerals (desktop and mobile).
5. **Per-ritual CTA panel** — `GlassCard strong glow="duo"`: eyebrow "Everything you need", title "{name}", the total for known-price steps ("From ₹X for the priced steps" — only when at least one price is known, and never adding TBA products), then: if `brand.flags.enableRitualBundles` → `Button variant="primary"` **"Add the whole ritual to cart"** calling `useCart().addMany(stepsWithKnownPrice.map(buildCartItem))` (uses the chosen alternative), else → `Button variant="primary"` **"Shop each step"** that scrolls to the first step; secondary "Browse all rituals" → `/rituals`. JSON-LD: `ItemList` of the step products + `BreadcrumbList`.
6. **Replace stubs** — `/rituals`, `/rituals/:slug` in `App.js`; `RitualsTeaser`/`RitualCard`/Footer links now resolve.

## Design and content specification

- CategoryHead: band height `clamp(260px, 32vw, 420px)`, glass panel bottom-left (max 640px), `h1` `--sf-text-4xl`; mobile: image 4:3, panel below (no overlap).
- RitualStep rows: grid `72px 1fr` mobile / `96px 240px 1fr auto` desktop; plates 96–240px; numerals 36px; connector 1px gradient.
- Copy: "Category", "Rituals", "Curated routines", "See the ritual", "Everything you need", "Add the whole ritual to cart", "Shop each step", "Browse all rituals"; step notes/frequency from data.
- Motion: step rows reveal in sequence; reduced motion static.

## Data and API changes

Reads only. `addMany` from Prompt 12 (cart). The `enableRitualBundles` flag stays `false` by default (brief §8.1); the button is implemented and verified with the flag flipped locally, then reverted.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: category constraint is routing only (no filter UI); TBA products never enter a bundle; durations are copy, not claims.

## Acceptance criteria

- [ ] `/category/face-care` shows six chapters with the head; `/category/body-care` two; `/category/rituals` redirects; `/category/nope` → NotFound.
- [ ] `/rituals` lists three rituals; `/rituals/morning-glow` shows four steps with correct products; `/rituals/black-rice-body` offers the bar/wash choice.
- [ ] With `enableRitualBundles: true` the bundle button adds only priced steps with one toast; reverted to `false` before commit.
- [ ] Breadcrumb/ItemList JSON-LD valid; `useSeo` titles correct.
- [ ] No `ComingSoon` route remains for rituals; `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "ComingSoon" src/App.js     # only /why-lamikaa and /cart remain
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440; keyboard on the bar/wash choice; reduced motion.

## Handoff

1. `PROGRESS.md`: row 24 → `complete`; Open TODOs: remove the rituals stub entries.
2. `REPO_MAP.md` §6 "Updated by Prompt 24".
3. Commit: `feat(lamikaa): 24 category pages and rituals pages`.
