# Prompt 13 — Footer

- **Phase:** 1 — Storefront shell
- **Depends on:** 12
- **Unlocks:** 14
- **Scope:** M
- **Expected files to change/create:** rewrite `src/components/Footer/Footer.js` and `Footer.module.css`; create `src/components/brand/LegalNote.js`; delete `src/components/Newsletter/` (unused duplicate); change `src/utils/constants.js` (delete `FREE_SHIPPING_THRESHOLD` if no consumer remains).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–12 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Build the LAMIKAA footer: a large wordmark and the master tagline, the newsletter capture (existing lead flow), four link columns fed by data, the farmer-owned legal note with its qualifiers, contact and social placeholders that hide until resolved, payment marks, and the BAOPCL copyright line.

## Pre-flight checks

```bash
grep -n "createNewsletter\|handleSubscribe\|TRUST_ITEMS\|payment" src/components/Footer/Footer.js | head
grep -n "legalNote\|signatureLines\|legal: {" src/config/brand.js
grep -rn "components/Newsletter" src --include=*.js | wc -l   # 0 → safe to delete
```

## Tasks

1. **Structure** — `<footer aria-labelledby="footer-heading">` on `--sf-color-surface` with a top gradient hairline (`.sf-hairline--gradient`), four bands:
   - **Invitation**: `<Logo variant="wordmark" width={220}>` (`h2#footer-heading` visually hidden "LAMIKAA NATURALS"), master tagline in Fraunces 28px, one signature line rotating? No — static: `brand.signatureLines[3]` ("When LAMIKAA grows, our farmers grow with us.") in `--sf-color-text-secondary`; newsletter row on the right: label "Letters from the farm" → rename to "Stay close to the farm", email input (`type="email"`, `aria-describedby`, `aria-invalid`), pill "Subscribe", status `role="status"`/`role="alert"` — keep the existing `apiService.leads.createNewsletter` flow, validation (`isEmailValid`) and success/error states verbatim.
   - **Columns** (four `<nav aria-labelledby>` with `h3`): *Shop by category* — the seven categories from `apiService.categories.getAll()` (`categoryPath`; Rituals → `/rituals`) + "All products"; *Rituals* — the three rituals from `apiService.rituals.getAll()` (`/rituals/<slug>`) + "Build your ritual" → `/rituals`; *Company* — Our Story `/about`, Why LAMIKAA `/why-lamikaa`, Impact `/why-lamikaa#impact`, Contact `/contact`, Offers `/special-offers` (only when enabled); *Help* — FAQ `/faq`, Shipping & Returns `/policies/shipping-returns`, Privacy `/policies/privacy`, Terms `/policies/terms`, Cookies `/policies/cookies`, My Orders `/orders`, Wishlist `/wishlist`.
   - **Farmer-owned note**: `LegalNote` component (`src/components/brand/LegalNote.js`, reused by Prompts 17, 25, 28): renders `brand.legalNote` in 13px `--sf-color-text-secondary` with a small gold leaf glyph; optional `compact` prop.
   - **Contact & social**: `<address>` with email/phone/address rows **only when** `!isPlaceholder(value)` (from `useStoreSettings()`), hours when resolved; social marks from `socialLinks` (already blank-filtered) as 44px glass circles; payment marks: keep the existing inline SVG set (they are network marks, documented exception) at 60 % opacity.
   - **Colophon**: `© {currentYear} Bokakhat Agro Organic Producer Co. Ltd. All rights reserved.` then "LAMIKAA NATURALS is a brand of BAOPCL." then GSTIN/CIN rows only when resolved (`brand.legal`), then policy micro-links.
2. **Delete** `src/components/Newsletter/` (both files) and the `TRUST_ITEMS` promises band from the old footer (the trust strip lives on the home page); remove `FREE_SHIPPING_THRESHOLD` from `constants.js` if `grep -rn FREE_SHIPPING_THRESHOLD src` shows no consumer left (also drop the `{freeShipping}` handling in `fillStoreCopy` **only if** no FAQ text still uses it — it does, so keep the sentence-dropping logic and delete only the constant export).
3. **Responsive** — 1280/1440: grid `1.6fr repeat(4, 1fr)` with 48px gaps; 1024: `1.2fr repeat(4, 1fr)` 32px; 768: brand row full width, columns 2×2; ≤ 480: single column, each column heading becomes a disclosure (`Accordion` primitive, multi-open, all closed by default) so the footer is scannable; links 44px tall.
4. **A11y** — headings hierarchy `h2` (hidden) → `h3` per column; `nav` landmarks labelled; the colophon is not a landmark; social links have `aria-label` with the platform name; newsletter input labelled.

## Design and content specification

- Ground `--sf-color-surface`, padding `--sf-section-y` top / 32px bottom; wordmark 220px (160 on mobile); tagline Fraunces 28/24px; column headings eyebrow style (gold, tracked, 12px); links Manrope 15px warm-white → gold on hover with the gradient underline; hairlines between bands; a faint `.sf-glow--violet` (opacity .12) behind the invitation band on desktop only.
- Copy: "Stay close to the farm", "New products, farm stories and the occasional offer — no noise.", "Subscribe", "Shop by category", "All products", "Rituals", "Build your ritual", "Company", "Help".

## Data and API changes

Reads: `categories.getAll`, `rituals.getAll`, `leads.createNewsletter` (write, existing). None new.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: the legal note must be verbatim `brand.legalNote`; never print a `{{…}}`; the payment marks are the only hex literals allowed in the file.

## Acceptance criteria

- [ ] Footer renders the wordmark, tagline, newsletter (subscribe writes a `newsletter` lead visible in Admin → Leads), four data-fed columns, legal note, colophon with the current year.
- [ ] Contact/social/GSTIN rows are absent while placeholders; set a value in Admin → Settings → Social Links and the mark appears after refresh.
- [ ] Mobile accordion columns work with keyboard and screen reader (`aria-expanded`).
- [ ] `src/components/Newsletter` deleted; `grep -rn "Letters from the loom\|Authentic Assamese\|Sualkuchi" src/components/Footer` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
test ! -d src/components/Newsletter && echo "newsletter removed"
grep -rn "FREE_SHIPPING_THRESHOLD" src | wc -l    # 0 (or only fillStoreCopy handling of {freeShipping})
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440: column layout, accordion on mobile, newsletter success and error, no horizontal scroll, contrast of muted colophon text (≥ 4.5:1), reduced motion.

## Handoff

1. `PROGRESS.md`: row 13 → `complete`; Decisions log: newsletter copy, accordion default state.
2. `REPO_MAP.md` §5 "Updated by Prompt 13" (Footer, LegalNote; Newsletter removed).
3. Commit: `feat(lamikaa): 13 footer`.
