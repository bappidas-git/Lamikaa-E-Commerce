# Prompt 39 — Final QA, parity, README and release notes

- **Phase:** 6 — Cleanup and QA
- **Depends on:** 38
- **Unlocks:** — (programme complete)
- **Scope:** L
- **Expected files to change/create:** create `scripts/placeholder-inventory.js`, `src/App.test.js`, `src/config/brand.test.js`, `RELEASE_NOTES.md`; rewrite `README.md`; update `prompts/_reference/PLACEHOLDERS.md`, `prompts/_reference/PLACEHOLDER_ASSETS.md`, `prompts/_reference/REPO_MAP.md` (final), `prompts/PROGRESS.md`; `package.json` (`"placeholders"` script).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`, `PLACEHOLDER_ASSETS.md`, `QA_MATRIX.md`, `AUDIT.md`. Confirm that prompts 01–38 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Run the full regression of the storefront and the admin in mock mode, review the live-mode contract end to end, regenerate the placeholder inventories from the real data and code, add smoke tests, write the LAMIKAA README and release notes, compare against the baseline screenshots, and declare the programme's Definition of Done.

## Pre-flight checks

```bash
grep -c "complete" prompts/PROGRESS.md      # 38 rows complete
git status --short                           # clean
ls prompts/_baseline | head -3               # baseline screenshots from Prompt 01 (local)
```

## Tasks

1. **Storefront regression (mock mode)** — execute and tick in `PROGRESS.md`: home (hero autoplay/pause/swipe/keys, all sections), trust strip, categories + concern chips, eight chapters with quick add, about/why/rituals teasers, full-page CTA newsletter (lead in admin), FAQs accordion, recently viewed; shop + concern subsets + rail; category pages; rituals index/detail (+ bundle with the flag on, then off); PDP: gallery (images/videos/lightbox/full-label toggle), purchase panel (qty, add, buy now, wishlist, share), chapters, reviews empty/sample, cross-sell, JSON-LD; search overlay + page; cart drawer/page; checkout all paths (guest gate, addresses, shipping, coupon `SAMPLE10`, store credit, COD rules, review edits, place order); confirmation; orders (filters, cancel, reorder, review submit); profile (edit, password, addresses, wallet); wishlist; auth modal; content pages; policies; offers (enable in admin); 404; legacy redirects; announcement bar (session dismiss); mobile drawer/bottom nav; reduced motion.
2. **Admin regression (mock mode)** — every screen: dashboard counts; products (media manager round-trips, price TBA, hero uniqueness, drafts hidden from the storefront); categories (new fields, delete rules); concerns; rituals; Home & Hero (order/copy/settings); announcements; content (edit + qualifier warning); FAQs (groups/placements/reorder); reviews (approve/reject/create/sample chip); orders (fulfil/deliver/paid/cancel variants/refund initiate→complete/fail/recall/address edit/invoice print/CSV); returns (create→approve→pickup→transit→received→refund with restock); payments (issue refund; ledger); coupons; shipping methods (set `freeAbove` and see the meter); users (deactivate blocks login); leads; settings (store/currency/tax/COD/social — storefront reflects each); special offers config.
3. **Live-mode contract review** — read `REPO_MAP.md` §3 against `src/services/api.js` once more: every function has a live branch, every new endpoint is listed for the backend, envelopes are unwrapped by `extractData`; write a one-page "Backend hand-off" section in `REPO_MAP.md` (endpoint · method · payload · response) for the Laravel team; optional: run `npm run test:live` **only** against an owner-supplied staging URL in `.env.local`.
4. **Placeholder inventories** — `scripts/placeholder-inventory.js`: scans `db.json` and `src/` for `{{[A-Z0-9_]+}}` tokens (file, key path or line) and for placeholder media (`media[].placeholder === true`, `picsum.photos`, `mdn.mozilla.net`, `res.cloudinary.com/demo`) and prints two Markdown tables; `package.json` script `"placeholders"`; paste the output into `PLACEHOLDERS.md` (section "Current inventory — generated") and `PLACEHOLDER_ASSETS.md` (same), keeping the hand-written guidance above them; confirm every token in the code is documented and every documented token still exists (or is marked resolved).
5. **Smoke tests** — `src/App.test.js`: renders `<App />` (mock `apiService` modules with `jest.mock` returning the seed slices) and asserts the header shows the LAMIKAA wordmark `alt` and no `{{` text; `src/config/brand.test.js`: `brand.name === "LAMIKAA NATURALS"`, `legalNote` contains "subject to applicable laws", every `trustBadges` entry is a non-empty string, `logoUrl`/`iconUrl` are the exact Cloudinary URLs from `PRODUCTS.md` §1; keep existing unit tests; `npm test -- --watchAll=false` → all suites pass, live suite skipped.
6. **README.md (full)** — LAMIKAA NATURALS storefront: what it is (one paragraph from the brand brief with the legal qualifier), stack, prerequisites, `npm ci`, mock mode (`npm run dev`, ports 3000/3001, `server.js` safe-delete note), live mode (env switch, `core.lamikanaturals.com`), admin (`/admin`, change the seeded credentials), data model overview (`media[]`, `heroOrder`, `priceTBA`, rituals, siteContent, announcements), brand config (`src/config/brand.js`), placeholders (link to `PLACEHOLDERS.md`; how to resolve prices/contact/social/domain from the admin or config), scripts (`sitemap`, `placeholders`, `test:live` warning), deployment notes (static build; env at build time), programme note (the `prompts/` folder documents the rebuild and may be deleted or archived outside the repo once the programme is complete; git history is out of scope).
7. **Release notes** — `RELEASE_NOTES.md` at the root: version `1.0.0-lamikaa`, date, highlights (single dark theme, product hero, chaptered shop, PDP media gallery with videos, rituals, farmer-owned story, admin media manager and content management), owner to-dos (the placeholder tokens grouped: prices, contact, social, domain, legal, policies, certifications, media), known limitations (live backend endpoints to implement, sample data to remove, `enableRitualBundles` flag), the cleanup verification statement (zero-result grep at commit X).
8. **Before/after** — capture the same routes/widths as Prompt 01 into `prompts/_baseline/after-*.png` (local, ignored) and note in `PROGRESS.md` that the storefront is recognisably different (navigation pattern, hero, chaptered shop, PDP, footer) with three one-line comparisons.
9. **Definition of Done check** (from `00_INDEX.md`): Appendix A coverage confirmed per requirement (tick the matrix in `PROGRESS.md`), zero-result greps (re-run Prompt 36's), both api modes + admin verified, Lighthouse targets met (`AUDIT.md`), placeholder inventories current, `CI=true npm run build` and tests green, `git status` clean. Optionally tag `v1.0.0-lamikaa`.

## Design and content specification

None (verification prompt). Any defect found is fixed in the smallest correct way and listed.

## Data and API changes

None expected; if the regression finds a data issue, fix `db.json` and record it.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: never run `test:live` against production; never delete `prompts/` in this prompt (the developer decides after review).

## Acceptance criteria

- [ ] Storefront and admin regression checklists fully ticked in `PROGRESS.md` (defects fixed and listed).
- [ ] `REPO_MAP.md` contains the backend hand-off section; contract review done.
- [ ] `npm run placeholders` output pasted; inventories current; every token documented.
- [ ] `npm test -- --watchAll=false`: smoke + unit suites pass, live suite skipped; `CI=true npm run build` clean.
- [ ] `README.md` and `RELEASE_NOTES.md` complete; before/after comparison noted.
- [ ] Definition of Done ticked; `git status` clean after the commit.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
npm run placeholders | head -40
grep -riIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts -e "meghali" -e "mekhela" -e "chador" -e "saree" -e "handloom" -e "muga" -e "silk" . | wc -l   # 0
git status --short
```

Manual QA: the two regression checklists.

## Handoff

1. `PROGRESS.md`: row 39 → `complete`; Definition of Done section ticked; final Decisions/TODOs for the owner.
2. `REPO_MAP.md` final "As built" note; `PLACEHOLDERS.md`/`PLACEHOLDER_ASSETS.md` regenerated sections.
3. Commit: `feat(lamikaa): 39 final qa, parity, readme and release notes` (and optionally `git tag v1.0.0-lamikaa`).
