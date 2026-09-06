# Prompt 28 — Content pages from siteContent

- **Phase:** 3 — Catalogue
- **Depends on:** 17, 20, 27
- **Unlocks:** 29
- **Scope:** L
- **Expected files to change/create:** create `src/pages/About/About.js` (+ `.module.css`), `src/pages/WhyLamikaa/WhyLamikaa.js` (+ `.module.css`), `src/pages/Faq/Faq.js` (+ `.module.css`), `src/pages/Contact/Contact.js` (+ `.module.css`), `src/pages/Policies/PolicyPage.js` (+ `.module.css`), `src/utils/policyClauses.js`; delete `src/pages/AboutUs/`, `src/pages/HelpCenter/`, `src/pages/Support/`, `src/pages/PrivacyPolicy/`, `src/pages/TermsOfService/`, `src/pages/CookiePolicy/`, `src/pages/RefundPolicy/`; change `src/App.js`, `src/pages/_ComingSoon/ComingSoon.js` (one fewer route).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–27 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Build the standalone content pages — About (long-form story with impact sections and the value chain), Why LAMIKAA, FAQ (grouped, searchable, with `FAQPage` JSON-LD), Contact (placeholder details + the existing lead form) and the four policies — all rendered from `siteContent` data through `ContentBlocks`, never hard-coded, replacing the seven Meghali pages.

## Pre-flight checks

```bash
node -e "const db=require('./db.json'); console.log(Object.keys(db.siteContent), Object.keys(db.siteContent.policies))"
grep -n "codClause\|currencyName\|taxIncluded" src/pages/TermsOfService/TermsOfService.js | head
grep -n "EMPTY_LEAD\|MESSAGE_MIN\|validate = \|createContact" src/pages/Support/Support.js | head
grep -n "ComingSoon" src/App.js     # /why-lamikaa and /cart remain
```

## Tasks

1. **`About`** (`/about`) — data `siteContent.get("about")`: opening band (heroImage placeholder with wash, breadcrumb, eyebrow, `h1` title, lede), body `ContentBlocks variant="editorial"` (the seeded 3.1 paragraphs, `::steps` value chain rendered by `ValueChain`, the "LAMIKAA Difference" callout, the vision quote), an image band (`image2` placeholder), `ImpactTriptych showImages` from `siteContent.impact`, `Pillars compact`, `LegalNote`, closing CTA row (`ctaLabel` → `ctaTo`, secondary "Why LAMIKAA" → `/why-lamikaa`). `useSeo({ title: "Our Story", description: lede })`.
2. **`WhyLamikaa`** (`/why-lamikaa`) — data `siteContent.get("whyLamikaa")` + `impact`: opening band (`heroImage`, eyebrow "Why LAMIKAA", `h1` "Indigenous Wisdom. Modern Science. Responsible Beauty."), intro `ContentBlocks`, `Pillars` (from `brand.pillars`), section `id="difference"` "The LAMIKAA Difference" (`ContentBlocks` with the `::steps` chain), section `id="impact"` "Our impact" with `ImpactTriptych showImages` and each item's full `body` in an `Accordion` ("Read more"), section `id="vision"` (quote), CTA "Shop the Black Rice Range". `useSeo`. Replaces the `ComingSoon` stub.
3. **`Faq`** (`/faq`, replaces HelpCenter) — data `useFaqs()` + `siteContent.get("faqPage")` groups: head (eyebrow, `h1`, lede), search field (filters question + filled answer, `role="status"` count — port from `HelpCenter.js:181-236`), a sticky group index (desktop left rail / mobile chip strip) with anchors `#group-<key>`, one `FAQ` accordion per group (`faqsForGroup`, only groups with rows; rows with placement `help`), a contact band at the end (channels only when resolved + "Write to us" → `/contact`), `FAQPage` JSON-LD from the rendered rows (answers with placeholder sentences stripped). Deep links `/faq#faq-<id>` open the row.
4. **`Contact`** (`/contact`, replaces Support) — data `siteContent.get("contact")` + `useStoreSettings()`: head (eyebrow, `h1`, lede), channels grid (`buildChannels` logic ported: Email / Call / WhatsApp cards only when the href resolves; hours only when `!isPlaceholder`), the lead form **unchanged in behaviour** (fields `name, email, phone, subject, message` + hidden `orderNumber: "", category: "general"`; validation incl. `MESSAGE_MIN = 20`; first-invalid focus; success panel with focus; email pre-fill for signed-in users; `apiService.leads.createContact`), restyled with the `ui` inputs; right rail: "Why LAMIKAA" pillars (compact), social marks, "Read the FAQ" → `/faq`; a "Visit" card only when the address resolves (Maps link built from the address). `useSeo({ title: "Contact" })`.
5. **`PolicyPage`** (`/policies/:policy`) — one component reading `useParams().policy` ∈ `privacy | terms | shipping-returns | cookies` (else NotFound) and `siteContent.get("policies")[key]` (`shippingReturns` key for `shipping-returns`): document layout (breadcrumb, kicker, `h1`, "Last updated {updatedAt}", standfirst), a table of contents generated from the `h2` blocks (desktop sticky rail, mobile inline list), body via `ContentBlocks` with clause numbering `01, 02 …` on `h2`s, and for `terms` an appended data-driven block "Pricing, tax and payment" built by `src/utils/policyClauses.js` (port `codClause`, the tax clause and `currencyName` from `TermsOfService.js:70-116`, plus a returns sentence using `STOREFRONT_CONFIG.returnsWindowDays` when > 0); for `shipping-returns` append the live shipping-method rows from `shipping.getMethods()` (name, description, estimatedDays when set). Colophon with contact rows when resolved. `useSeo({ title })`. Cross-links between policies.
6. **Routes** — `App.js`: `/about` → About, `/why-lamikaa` → WhyLamikaa, `/faq` → Faq, `/contact` → Contact, `/policies/:policy` → PolicyPage (the four explicit routes collapse into one param route; `LegacyRedirects` still maps old paths). Delete the seven old page folders; `grep` for any import of them.
7. **Copy discipline** — nothing on these pages is typed in JSX except UI strings; all narrative comes from `siteContent`; profit/dividend sentences retain their qualifiers (verify with `grep -n "dividend" db.json` → every hit contains "subject to applicable laws").

## Design and content specification

- Opening bands: `clamp(280px, 36vw, 480px)` image with wash + glass panel; body measure 68ch; editorial variant with drop cap; section rhythm `--sf-section-y`; policy pages use the document look (numbered clauses, hairlines, 16px body, TOC rail 220px).
- Contact form: two-column fields ≥ 769px, single column below; 48px inputs; error text with icon; success panel glass with a gold check.
- FAQ page: group rail 200px sticky at 112px; search 52px; accordions as in Prompt 21.
- Copy (UI): "Our Story", "Why LAMIKAA", "Frequently asked questions", "Search the answers", "Write to us", "Send message", "Message sent", "Send another", "Contents", "Last updated".

## Data and API changes

Reads `siteContent.*`, `faqs`, `settings`, `shipping.getMethods`; writes contact leads (existing). Admin: siteContent editing arrives in Prompt 34.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: no hard-coded rupee shipping rates (the old Terms had three) — live data or nothing; the contact payload keys stay exactly the seven the API expects.

## Acceptance criteria

- [ ] `/about`, `/why-lamikaa` (with `#impact` anchor), `/faq` (search + groups + deep link), `/contact` (form submits a lead; channels hidden while placeholders), `/policies/privacy|terms|shipping-returns|cookies` render from data; `/policies/other` → NotFound; old routes redirect.
- [ ] `FAQPage` JSON-LD valid; policy TOC works; Terms shows the live tax/COD clause; Shipping & Returns lists the seeded shipping method.
- [ ] Seven old page folders deleted; `grep -rn "Galleria\|Kolkata, West\|Sualkuchi\|National Handloom" src` → 0.
- [ ] Only `/cart` still uses `ComingSoon`.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
for d in AboutUs HelpCenter Support PrivacyPolicy TermsOfService CookiePolicy RefundPolicy; do test ! -d src/pages/$d && echo "$d removed"; done
grep -n "ComingSoon" src/App.js
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 on all five page types; keyboard through the FAQ search and the contact form; reduced motion.

## Handoff

1. `PROGRESS.md`: row 28 → `complete`; Open TODOs: remove the why-lamikaa stub entry.
2. `REPO_MAP.md` §6 "Updated by Prompt 28" (content pages; removed pages).
3. Commit: `feat(lamikaa): 28 content pages from sitecontent`.
