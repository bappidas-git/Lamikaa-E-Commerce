# Prompt 21 — Home FAQs section and accordion

- **Phase:** 2 — Home page
- **Depends on:** 20
- **Unlocks:** 22
- **Scope:** S
- **Expected files to change/create:** rewrite `src/components/FAQ/FAQ.js` and `FAQ.module.css` (onto the `Accordion` primitive), create `src/components/home/HomeFaqs.js`; change `src/pages/Home/Home.js`, `src/utils/faqs.js` (`faqsForPlacement` limit option).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–20 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Render the site-level FAQs on the home page as a glass accordion driven by the admin-managed `faqs` collection (placement `home`, 6–8 rows), with a link to the FAQ page, and make the shared `FAQ` component the single accordion used everywhere FAQs appear.

## Pre-flight checks

```bash
grep -n "forPlacement\|fillCopy" src/components/FAQ/FAQ.js
grep -n "export const faqsForPlacement\|export const faqsForGroup" src/utils/faqs.js
grep -n "Accordion" src/components/ui/index.js
```

## Tasks

1. **`FAQ` (shared)** — props `{ faqs, limit, defaultOpen, multiple = false, id, headingLevel = 3 }`; maps rows to `Accordion items` (`title: question`, `content: <ContentBlocks text={fillCopy(answer)} variant="prose" />` — answers are plain text; `ContentBlocks` handles the paragraph split), each row's id `faq-<id>`; deep-link support: if `location.hash === "#faq-<id>"` open that row and scroll to it. Uses `useStoreSettings().fillCopy` for `{freeShipping}`/`{codSentence}`/`{taxNote}` and strips placeholder sentences (`stripPlaceholderSentences`) so `{{RETURN_WINDOW_DAYS}}`-style tokens never print — until the owner sets the value, the sentence is dropped.
2. **`HomeFaqs`** — `SectionHeading` eyebrow "Good to know", title "Questions, answered" (`gradientWord` "answered"), two-column layout ≥ 1025px (heading + lede + `Button variant="secondary"` "All questions" → `/faq` on the left, sticky; accordion right), stacked ≤ 1024px; rows from `useFaqs().forPlacement("home")` limited to 8 (add a `limit` option to `faqsForPlacement`); hidden when fewer than 2 rows.
3. **Home wiring** — `<HomeFaqs/>` after `<WhyLamikaaSection/>`.
4. **JSON-LD** — not here (the FAQ page owns `FAQPage` in Prompt 28) to avoid duplicate structured data.

## Design and content specification

- Accordion rows: glass hairline separators, question Manrope 600 17px, chevron 20px gold rotating 180°, answer Manrope 15px secondary with 20px padding; open row gets a gradient left hairline; 44px minimum row height.
- Copy: "Good to know", "Questions, answered", "All questions".
- Motion: 320 ms height; reduced motion instant.

## Data and API changes

Reads `faqs` through `FaqContext` (unchanged). Admin FAQ manager keeps working (placements `home/help/product`).

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: answers are data; tokens never print; one accordion implementation only.

## Acceptance criteria

- [ ] Home shows up to 8 FAQs from the API (edit one in Admin → FAQs and see it change after focus refetch); the row with `{{RETURN_WINDOW_DAYS}}` prints without the token sentence.
- [ ] Keyboard: Enter/Space toggle, ↑/↓/Home/End move; `aria-expanded`/`aria-controls` correct; deep link `/#faq-3` opens row 3.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "HomeFaqs" src/pages/Home/Home.js
npm run dev
```

Manual QA at 360 / 390 / 768 / 1280; reduced motion.

## Handoff

1. `PROGRESS.md`: row 21 → `complete`.
2. `REPO_MAP.md` §5 "Updated by Prompt 21" (FAQ on Accordion; HomeFaqs).
3. Commit: `feat(lamikaa): 21 home faqs section and accordion`.
