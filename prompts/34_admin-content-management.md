# Prompt 34 — Admin content management

- **Phase:** 5 — Admin
- **Depends on:** 33
- **Unlocks:** 35
- **Scope:** L
- **Expected files to change/create:** rewrite `src/pages/Admin/AdminHeroSection.js` (→ Home & Hero); create `src/pages/Admin/AdminRituals.js`, `src/pages/Admin/AdminContent.js`, `src/pages/Admin/AdminAnnouncements.js`, `src/pages/Admin/AdminConcerns.js` (small); change `src/pages/Admin/AdminCategories.js`, `src/pages/Admin/AdminFaqs.js`, `src/pages/Admin/AdminDashboard.js`, `src/pages/Admin/AdminSettings.js`, `src/components/AdminLayout/AdminLayout.js` (nav), `src/App.js` (admin routes), `src/utils/heroConfig.js` (remove deprecated slide helpers), `src/utils/faqs.js` (placement labels).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–33 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Give the admin control of the new content: hero product ordering and settings, categories' new fields, rituals, concerns, grouped FAQs, site content blocks and announcements — through the api functions from Prompt 07 in both modes — and bring the dashboard to parity with the new data.

## Pre-flight checks

```bash
grep -n "getRituals\|updateSiteContent\|getAnnouncements\|reorderAnnouncements\|setHeroOrder\|getConcerns" src/services/api.js | head
grep -n "@deprecated" src/utils/heroConfig.js | wc -l
grep -n "hero-section\|faqs\|categories" src/App.js | head
```

## Tasks

1. **Home & Hero** (`/admin/hero-section`, rewrite `AdminHeroSection.js`) — two tabs: **Hero products**: the hero-ordered product list (from `admin.getProducts()` filtered `heroOrder != null`, plus an "Add product to hero" `Autocomplete` of the rest), rows with thumbnail, name, inline-editable `heroHeadline` and `heroSubtext` (save per row via `admin.updateProduct`), up/down reorder → `admin.setHeroOrder(orderedIds)`, remove from hero (sets `heroOrder: null`), a live preview card (label crop + copy); **Section settings**: `heroConfig` fields `enabled, autoplay, intervalMs (seconds input, 3–15), transition (fade/none), pauseOnHover, showControls, showCounter, showProgress, showArrows, showPause` → `admin.updateHeroConfig`. Delete the temporary announcements tab and remove the deprecated slide helpers from `heroConfig.js` (keep `normalizeHeroConfig`, `HERO_TRANSITIONS`, clamps).
2. **Announcements** (`/admin/announcements`, new) — table + form: `text`, `link`, `isActive`, `startsAt`/`endsAt` (`datetime-local`, optional), reorder (up/down → `reorderAnnouncements`), placeholder warning chip when the text contains `{{`; live preview strip. CRUD via the announcement functions.
3. **Rituals** (`/admin/rituals`, new) — table (name, steps count, active, order) + form: `name`, `slug` (auto), `tagline`, `story` (multiline markdown-lite with the token/preview helper reused from `AdminContent`), `image` URL with preview, `duration`, `isActive`, steps editor (ordered rows: product `Autocomplete`, optional alternative product, `note`, `frequency`, up/down), reorder rituals; CRUD + `reorderRituals`.
4. **Concerns** (`/admin/concerns`, new, small) — table + form (`name`, `slug`, `order`); delete blocked while any product references the slug (client check over `admin.getProducts()`), mirroring the category rule.
5. **Categories** — add `displayName`, `heroImage` (URL + preview), `kind` (`products` | `rituals`) to the form/table; delete rule extends to `categoryIds` membership (not only `categoryId`).
6. **FAQs** — add `group` `Select` (options from `siteContent.faqPage.groups` + "general"), a group column and filter; placement labels: `product` "Product pages", `help` "FAQ page (/faq)", `home` "Home FAQ block".
7. **Site content** (`/admin/content`, new) — a keyed editor over `admin.getSiteContent()`: left rail of keys (about, whyLamikaa, impact, home, contact, policies.*, faqPage), right a form generated from the block's shape: strings → `TextField`, long strings (`body`, `text`, `story`, `intro`) → multiline textarea with a "Preview" toggle rendering `ContentBlocks` (import from `components/ui`), arrays of strings → `ListEditor`, arrays of objects (impact items, groups) → repeatable sub-forms, image URLs → field + preview; a token cheat-sheet (`{{LAMIKAA_EMAIL}}` etc.) and the markdown-lite grammar help; save per key via `admin.updateSiteContent(key, data)`; storefront refetch on focus (no live event needed; optionally dispatch `site-content:updated` mirrored in a small `useSiteContent` hook — keep simple).
8. **Dashboard parity** — stats add "Hero products", "Rituals", "Announcements live", "Price on launch" counts (mock: computed from the collections in `getDashboardStats`; live: extend the documented `/admin/dashboard/stats` response in `REPO_MAP.md` §3); quick actions add "Edit home hero", "Manage content".
9. **Navigation & routes** — `AdminLayout.menuItems`: Storefront section → Home & Hero, Announcements, Content, FAQs; Catalogue → Products, Categories, Concerns, Rituals, Reviews; `App.js` admin routes for `rituals`, `content`, `announcements`, `concerns`; `AdminSettings` pointer cards → Home & Hero / Content / Announcements.
10. **Both modes** — every screen uses the api functions (mock verified; live paths documented); no direct `axios` calls.

## Design and content specification

MUI admin components on the Prompt 32 palette; editors reuse `ListEditor`/`KeyValueListEditor` from Prompt 33; previews use storefront `ContentBlocks`/label plates inside a neutral frame; mobile: dialogs full-screen, tables scroll.

## Data and API changes

Uses Prompt 07's admin functions; `getDashboardStats` (mock) extended with the four counts; live endpoint contract updated in `REPO_MAP.md` §3.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: the content editor must never strip the legal qualifiers silently — show a warning when a saved block mentions "dividend" without "subject to applicable laws".

## Acceptance criteria

- [ ] Hero order and copy edited in the admin appear on the home hero after refresh; heroConfig settings apply.
- [ ] Announcements CRUD/reorder reflected in the bar; a `{{…}}` text stays hidden on the storefront and flagged in the admin.
- [ ] Rituals CRUD with steps; `/rituals/<slug>` reflects changes; delete works via the safe-delete server.
- [ ] Concerns/categories/FAQ groups editable; the mega panel, shop chips and FAQ page reflect edits.
- [ ] Site content edits (e.g. the About lede) appear on `/about`; the dividend-qualifier warning fires on a bad edit.
- [ ] Dashboard shows the new counts; nav and routes complete; deprecated hero helpers removed (`grep -n "@deprecated" src/utils/heroConfig.js` → 0).
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "admin/rituals\|admin/content\|admin/announcements\|admin/concerns" src/App.js src/components/AdminLayout/AdminLayout.js
npm run dev
```

Manual QA of each new screen at 360 / 768 / 1280; storefront cross-check after each edit.

## Handoff

1. `PROGRESS.md`: row 34 → `complete`.
2. `REPO_MAP.md` §3 (dashboard stats), §7 "Updated by Prompt 34".
3. Commit: `feat(lamikaa): 34 admin content management`.
