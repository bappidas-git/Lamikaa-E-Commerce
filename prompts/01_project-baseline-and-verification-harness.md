# Prompt 01 — Project baseline and verification harness

- **Phase:** 0 — Foundations
- **Depends on:** none (first prompt)
- **Unlocks:** 02
- **Scope:** S
- **Expected files to change/create:** `.gitignore` (add `prompts/_baseline/`), `prompts/PROGRESS.md`, `prompts/_reference/BRAND_FOOTPRINT.md` (only if the hit count changed), `prompts/_baseline/*` (local, untracked). No application source changes.

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. This is the first prompt, so nothing needs to be marked complete in `PROGRESS.md`; if `PROGRESS.md` already shows prompts complete, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Establish the working branch, prove that both `services/api.js` modes and the admin panel run today, capture a visual baseline of the Meghali's Silk storefront for later "recognisably different" comparisons, and confirm the reference inventories are current before any code changes begin.

## Pre-flight checks

```bash
git status --short                      # must be clean apart from prompts/
git branch --show-current               # note the current branch
node -v && npm -v                       # Node 18/20/22 all work with react-scripts 5
test -f db.json && test -f server.js && test -f src/services/api.js && echo "layout ok"
grep -c "" prompts/_reference/BRAND_FOOTPRINT.md   # exists and is non-empty
```

## Tasks

1. **Branch.** Create and switch to `feat/lamikaa-naturals` from the current HEAD (`git checkout -b feat/lamikaa-naturals`). All 39 prompts commit to this branch, one commit per prompt.
2. **Install and build baseline.** Run `npm ci` (use `npm install` only if `package-lock.json` is out of sync and record that). Then run `CI=true npm run build`. CRA treats ESLint warnings as errors under `CI=true`; if the baseline build fails only because of pre-existing warnings, fix them with the smallest mechanical change (unused import, missing hook dependency wrapped in `// eslint-disable-next-line` only when a real fix would change behaviour) and record each fix in `PROGRESS.md` → Decisions log. The programme requires a clean `CI=true npm run build` from here on.
3. **Tests baseline.** Run `npm test -- --watchAll=false`. Expected: the only suite (`src/services/api.live.test.js`) is skipped (`describe.skip` unless `LIVE_API=1`). Record the summary line.
4. **Mock mode (JSON Server).** In one terminal `npm run server`; confirm `curl -s http://localhost:3001/products | head -c 300` returns the silk products and `curl -s http://localhost:3001/settings | head -c 200` returns the settings singleton. In a second terminal `npm start` (the committed `.env` already selects mock mode: `REACT_APP_USE_MOCK_API=true`). Open `http://localhost:3000`.
5. **Live-mode configuration check (no writes).** Do **not** run `npm run test:live` (it writes to the production database). Instead verify the wiring only: `grep -n "REACT_APP_API_URL\|REACT_APP_USE_MOCK_API" .env .env.production` and `sed -n 1,60p src/services/baseURL.js`. Record in `PROGRESS.md` that live mode is selected by `.env` (`REACT_APP_USE_MOCK_API=false` + `REACT_APP_API_URL=https://core.lamikanaturals.com/api/v1`) and that the Laravel backend is outside this repository — every later "both api modes" check means: exercised in mock mode + the live branch implemented and reviewed against the documented endpoint contract.
6. **Admin baseline.** Log in at `http://localhost:3000/admin` with the seeded admin (`admin@store.com` / `admin123`, from `db.json → admins`). Walk Dashboard → Products (open the product form and note the "Image URLs (one per line)" textarea) → Categories → Orders → Returns → Payments → Coupons → Special Offers → Hero Section → FAQs → Reviews → Users → Shipping → Leads → Settings. Note anything broken in `PROGRESS.md` (the repo is expected to be fully working; a broken screen is a baseline fact, not something to fix here).
7. **Visual baseline.** Create `prompts/_baseline/` and add the line `prompts/_baseline/` to `.gitignore` (screenshots stay local). Using the browser device toolbar, capture the storefront at 390 px and 1280 px for: home, `/products`, `/products/sualkuchi-muga-mekhela-chador-natural-gold`, cart drawer open, `/checkout` (with one item), `/about`, `/help`, `/support`, `/orders` (logged in as `user@example.com` / `password123`), `/profile`, and the admin dashboard. Name files `<route>-<width>.png`. These are the "before" images Prompt 39 compares against.
8. **Storefront feature checklist (baseline).** Exercise and tick in `PROGRESS.md` → Open TODOs as a "Baseline works: …" note: add to cart from a card and from the PDP; quantity change and remove in the drawer; coupon `MUGA500` in the drawer; checkout through all four steps to an order confirmation (COD); order appears in `/orders` and in Admin → Orders; wishlist toggle as guest and as a user; search (`Muga`); light/dark toggle (note: to be removed); review from a delivered order; cancel a processing order; address book add/edit/delete in `/profile`.
9. **Brand footprint currency.** Re-run the inventory count and compare with the 531 recorded in `prompts/_reference/BRAND_FOOTPRINT.md`:
   ```bash
   grep -rinI --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts \
     -E "meghali|silk|mekhela|mekhla|chador|sador|saree|\bsari\b|handloom|weav|\bloom\b|\bmuga\b|\beri\b|\bpat\b|assam|gamosa|blouse|sualkuchi|kolkata|galleria" . | wc -l
   ```
   If the number differs from 531, regenerate §2 of `BRAND_FOOTPRINT.md` from the fresh hit list (same grouping: db.json / public / env / theme / utils / services / contexts / admin / components / pages; one bullet per hit `line — kind — excerpt`) and note the delta in `PROGRESS.md`.
10. **Asset reachability.** Confirm every real asset URL in `prompts/_reference/PRODUCTS.md` §1–§2 (logo, icon, eight covers) returns HTTP 200 with a HEAD request, and that a transformation URL works: `curl -sI "https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_600/v1788670626/logo.png" | head -1`. Record the results.
11. **Placeholder host reachability.** Ranged GET (`-r 0-0`) against one Picsum URL, one MDN CC0 video and one Cloudinary demo video from `prompts/_reference/PLACEHOLDER_ASSETS.md`; also try one `commondatastorage.googleapis.com/gtv-videos-bucket` URL. Record which hosts answer from your machine — Prompt 06 seeds only hosts that answered.

## Design and content specification

None — this prompt changes no UI. Keep the baseline screenshots honest (no dev-tool overlays, default zoom).

## Data and API changes

None.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: **do not change any file under `src/`, `public/`, `db.json` or `package.json`** except the minimal ESLint fixes allowed in Task 2. Do not run `npm run test:live`. Do not delete `prompts/`.

## Acceptance criteria

- [ ] Branch `feat/lamikaa-naturals` exists and is checked out.
- [ ] `CI=true npm run build` exits 0 (warnings fixed and logged if any).
- [ ] `npm test -- --watchAll=false` exits 0 with the live suite skipped.
- [ ] JSON Server answers on :3001 and the storefront renders in mock mode on :3000.
- [ ] Admin login works and all 15 admin screens open.
- [ ] Baseline screenshots exist locally under `prompts/_baseline/` and the folder is git-ignored.
- [ ] `BRAND_FOOTPRINT.md` hit count matches the repo (or was regenerated).
- [ ] All ten real asset URLs return 200; placeholder host results recorded.
- [ ] `PROGRESS.md` row 01 is `complete` with the baseline notes.

## Verification

```bash
git branch --show-current            # feat/lamikaa-naturals
CI=true npm run build                # exit 0
npm test -- --watchAll=false         # exit 0, 1 skipped suite
curl -s http://localhost:3001/products | head -c 120
ls prompts/_baseline | wc -l         # ≥ 22 files
git check-ignore prompts/_baseline/home-390.png && echo "ignored ok"
git status --short                   # only .gitignore, prompts/PROGRESS.md (and BRAND_FOOTPRINT.md if regenerated)
```

Manual QA: none beyond the checklist in Task 8.

## Handoff

1. Update `prompts/PROGRESS.md`: row 01 → `complete`, date, commit hash, notes (Node/npm versions, build warnings fixed, baseline feature checklist, placeholder-host results). Add a Decisions-log entry for the "live mode = documented contract" rule from Task 5.
2. Commit: `git add .gitignore prompts/PROGRESS.md prompts/_reference/BRAND_FOOTPRINT.md && git commit -m "feat(lamikaa): 01 project baseline and verification harness"`.
