# Prompt 35 — Brand cleanup I: code identifiers

- **Phase:** 6 — Cleanup and QA
- **Depends on:** 34
- **Unlocks:** 36
- **Scope:** M
- **Expected files to change/create:** `src/theme/storefront-tokens.css`, every `*.module.css` and `*.js` that consumes a renamed token (mechanical `sed`), `src/theme/tokens.js`, `src/theme/colors.js`, `src/theme/motion.js`, `src/services/api.js`, `src/services/baseURL.js`, `src/services/api.live.test.js`, `src/utils/*.js` comments, `src/index.css`, `src/App.css`; delete `src/hooks/useSound.js`, `src/assets/click-sound-1.wav`, `src/components/BottomDrawer/` (if unused), `src/pages/_Playground/`, `src/theme/tokens.js` legacy comments; `prompts/_reference/BRAND_FOOTPRINT.md` (tick-off column).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`, **`BRAND_FOOTPRINT.md`**. Confirm that prompts 01–34 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Remove every Meghali-era identifier from the code: token names, CSS class prefixes, variables and functions, comments, test names, storage keys, dead files and temporary scaffolding — consuming `BRAND_FOOTPRINT.md` §1 and the code groups of §2 line by line.

## Pre-flight checks

```bash
grep -rn -i "meghali\|mekhela\|chador\|saree\|sari\b\|handloom\|muga\|sualkuchi\|galleria\|ivory\|evening gallery\|silk" src --include=*.js --include=*.css | wc -l
grep -rhoE "var\(--sf-(color-emerald[a-z-]*|gradient-heritage|color-brand-green[a-z-]*|gradient-announce-[123]|cat-[a-z]+)" src | sort | uniq -c
grep -rn "brand-logo-bg" src | wc -l
ls src/hooks/useSound.js src/assets/click-sound-1.wav src/components/BottomDrawer src/pages/_Playground 2>&1
```

## Tasks

1. **Token renames (mechanical, repo-wide `sed` over `src/**/*.css` and `src/**/*.js`)** — `--sf-color-emerald` → `--sf-color-cta`, `--sf-color-emerald-hover` → `--sf-color-cta-hover`, `--sf-color-emerald-contrast` → `--sf-color-cta-contrast`; `.sf-btn--emerald` → `.sf-btn--primary` (and `.sf-btn--gold` merged into it — keep `.sf-btn--gold` as an alias for one more prompt? No: rename all usages now and delete the alias); `--sf-gradient-heritage` → `--sf-gradient-brand`; `--sf-gradient-announce-1/2/3` → `--sf-gradient-announce`; `--sf-cat-pink/purple/orange/blue/teal/red` → the `--sf-concern-*` names they alias; delete `--brand-logo-bg`, `--sf-color-brand-green`, `--sf-color-brand-green-deep` (grep consumers → replace with `--sf-color-surface`). Declare only the new names in `storefront-tokens.css`; run the "every consumed token is declared" script from Prompt 03 afterwards.
2. **Identifiers** — grep `src` for `heritage`, `weave`, `loom`, `silk`, `saree`, `mekhela`, `bridal`, `premium` (ribbon), `fabric`, `artisan`, `ivory`, `emerald`, `evening` as identifiers or class names (`grep -rn -i -E "(heritage|weave|loom|silk|saree|mekhela|bridal|premium|fabric|artisan|ivory|emerald|evening)" src --include=*.js --include=*.css`) and rename or delete each; `.sf-ribbon-premium` → delete (unused since Prompt 15); `PRODUCT_FLAG_MARKS`/`productFlagMarks` keep (generic); `isColorAttribute` keep.
3. **Comments** — rewrite every comment naming the old brand, palette ("ivory", "ink", "evening gallery", "warm sand"), the old catalogue or the retired prompt programme ("Prompt 12 hero", "Prompt 01 demoted") in `src/theme/*`, `src/index.css`, `src/App.css`, `src/utils/*.js`, `src/services/*.js`, `src/context/*.js`, `src/components/**`, `src/pages/**`, `public/index.html`; delete the dangling references to `STOREFRONT_UX_GUIDELINES.md`, `prompt_testing/09_authentication_and_session.md`, `backend-developer-guideline/postman-api-collection.json`.
4. **Tests** — `src/services/api.live.test.js`: BASE_URL assertion → `https://core.lamikanaturals.com/api/v1` (matches `.env.production`), rename banner tests to announcements (`admin.getAnnouncements` etc.), product-field assertions (`media`, `images`), category slug expectations (`face-care`), hero config keys, any silk product names; keep it `describe.skip`-gated. Ensure `npm test -- --watchAll=false` still passes (skipped suite + the unit suites).
5. **Storage keys** — confirm no `theme` key is read/written; `cart`, `wishlist`, `recentlyViewed`, `user`, `token`, `admin`, `adminToken` stay; `lk-recent-searches`, `lk-announcement-dismissed` (session) documented in `REPO_MAP.md` §8.
6. **Dead files and scaffolding** — delete `src/hooks/useSound.js` + `src/assets/click-sound-1.wav` (and the empty `src/assets/` folder), `src/components/BottomDrawer/` if `grep -rn BottomDrawer src` shows no consumer, `src/pages/_Playground/` and its route, any `window.__cart`/`window.apiService` debug exposure, unused exports flagged by `npx eslint src --rule 'no-unused-vars: error'` (CRA's config already errors on unused vars under CI — run the build).
7. **Old CSS remnants** — search `*.module.css` for selectors no longer referenced by their JS (`grep -o "styles\.[a-zA-Z0-9_]*"` per component vs class names in the module) and remove dead rules in files touched by the programme (mechanical; do not restyle).
8. **Tick off** — add a "Status" column to `BRAND_FOOTPRINT.md` §2 marking each code-group hit `done (35)`; leave content/asset groups for Prompt 36.

## Design and content specification

None (no visual change; run the visual smoke to confirm nothing regressed: home, shop, PDP, cart, checkout, admin).

## Data and API changes

None. (`db.json` untouched here.)

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: renames are mechanical and verified by the build plus the token-declaration script; never rename a `localStorage`/`sessionStorage` key that holds user data.

## Acceptance criteria

- [ ] `grep -rhoE "var\(--sf-[a-z0-9-]+" src | sort -u` contains no `emerald|heritage|brand-green|announce-[123]|cat-` names and every remaining name is declared.
- [ ] `grep -rn -i -E "meghali|mekhela|chador|saree|\bsari\b|handloom|muga|sualkuchi|galleria|ivory|evening gallery|silk" src --include=*.js --include=*.css` → 0.
- [ ] `grep -rn "STOREFRONT_UX_GUIDELINES\|prompt_testing\|backend-developer-guideline\|Prompt 12\|Prompt 01" src` → 0.
- [ ] Dead files/scaffolding deleted; `/_playground` route gone.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass; visual smoke identical.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -rhoE "var\(--sf-[a-z0-9-]+" src | sort -u | sed 's/var(//' | while read t; do grep -q -- "$t:" src/theme/storefront-tokens.css || echo "MISSING $t"; done
grep -rn -i -E "meghali|mekhela|chador|saree|\bsari\b|handloom|muga|sualkuchi|galleria|ivory|evening gallery|silk" src --include=*.js --include=*.css | wc -l   # 0
test ! -d src/pages/_Playground && test ! -f src/hooks/useSound.js && echo "scaffolding removed"
```

Manual QA: smoke the main flows at 390 and 1280 (no visual change expected).

## Handoff

1. `PROGRESS.md`: row 35 → `complete`; Decisions log: files deleted, alias decisions.
2. `BRAND_FOOTPRINT.md` status column; `REPO_MAP.md` §2/§8 "Updated by Prompt 35" (final token names, storage keys).
3. Commit: `feat(lamikaa): 35 brand cleanup I code identifiers`.
