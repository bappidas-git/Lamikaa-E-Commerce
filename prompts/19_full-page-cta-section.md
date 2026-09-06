# Prompt 19 — Full-page CTA section

- **Phase:** 2 — Home page
- **Depends on:** 18
- **Unlocks:** 20
- **Scope:** S
- **Expected files to change/create:** create `src/components/home/FullPageCta.js` (+ `.module.css`), `src/components/brand/NewsletterForm.js` (+ `.module.css`, extracted from the footer); change `src/components/Footer/Footer.js` (use `NewsletterForm`), `src/pages/Home/Home.js`.

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–18 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Build the immersive full-viewport CTA: a gradient-tinted dark ground over a placeholder photograph with a slow breathing glow, the three signature lines as a display headline, the primary "Shop the Black Rice Range" and secondary "Meet the farmer-owners" actions, and the existing newsletter capture reused from the footer.

## Pre-flight checks

```bash
node -e "const db=require('./db.json'); console.log(db.siteContent.home.fullPageCta)"
grep -n "handleSubscribe\|createNewsletter" src/components/Footer/Footer.js
grep -n "sf-glow--breathe" src/theme/storefront-primitives.css
```

## Tasks

1. **`NewsletterForm`** — extract the footer's form (state, `isEmailValid`, `apiService.leads.createNewsletter`, success/error/`role="status"|"alert"` handling) into `src/components/brand/NewsletterForm.js` with props `{ variant: "footer" | "cta", label, hint, buttonLabel = "Subscribe", id }`; the footer imports it (behaviour identical). Inputs are labelled, 48px tall, glass; button pill primary.
2. **`FullPageCta`** — data `siteContent.home.fullPageCta` (`lines[3]`, `primaryLabel/To`, `secondaryLabel/To`, `image`); fallback to `brand.signatureLines.slice(0,3)` and the two default links when the content is missing. Section: `min-height: 100svh` (`100vh` fallback) on desktop, `min-height: 80svh` on mobile; background = the placeholder image (`img` with `.sf-placeholder-media`, `object-fit: cover`, `loading="lazy"`, `alt=""`) under a wash `linear-gradient(180deg, rgba(11,11,13,.82), rgba(11,11,13,.94))` and the signature gradient at 12 % opacity (`mix-blend-mode: screen`); one `.sf-glow--duo.sf-glow--breathe` behind the content (the second breathing element on the page, never in the same viewport as the hero's).
3. **Content** — centred `GlassCard strong padding="lg"` (max-width 760px): eyebrow "Beauty with a purpose"; headline = the three lines, each on its own line in Fraunces `--sf-text-4xl` (`gradientWord` on "value" in the first line only); lede = `brand.tagline`; CTA row: `Button variant="primary" size="lg"` `primaryLabel` → `primaryTo` (`/shop`), `Button variant="secondary" size="lg"` `secondaryLabel` → `secondaryTo` (`/about`); below, `NewsletterForm variant="cta"` with label "Stay close to the farm" and hint "New products, farm stories and the occasional offer — no noise."; `LegalNote compact` at the bottom.
4. **Home wiring** — `<FullPageCta/>` after `<RitualsTeaser/>`.

## Design and content specification

- Ground: photo + wash + 12 % gradient; card glass strong with hairline; text warm white; lines separated by 8px; on mobile the headline is `--sf-text-3xl` and the CTAs stack full-width.
- Glow: duo, intensity .22, breathe 10 s; reduced motion → static.
- Copy: exactly `brand.signatureLines[0..2]`, "Shop the Black Rice Range", "Meet the farmer-owners", "Beauty with a purpose".

## Data and API changes

Reads `siteContent.home.fullPageCta`; writes a newsletter lead via the existing endpoint.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: no backdrop blur on the full-page background (the card blurs, the background does not); text contrast on the card ≥ 4.5:1 with the scrim.

## Acceptance criteria

- [ ] Section fills the viewport on desktop with the wash, glow and card; CTAs navigate; newsletter subscribes (lead appears in Admin → Leads) with success/error states; the footer form still works through the shared component.
- [ ] Only one breathing glow is visible at any scroll position (hero vs CTA).
- [ ] Reduced motion → no breathing; Lighthouse: the background image is lazy and does not affect LCP.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "NewsletterForm" src/components/Footer/Footer.js src/components/home/FullPageCta.js
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440; keyboard: both CTAs and the form reachable; contrast check with DevTools on the lede.

## Handoff

1. `PROGRESS.md`: row 19 → `complete`.
2. `REPO_MAP.md` §5 "Updated by Prompt 19" (FullPageCta, NewsletterForm).
3. Commit: `feat(lamikaa): 19 full-page cta section`.
