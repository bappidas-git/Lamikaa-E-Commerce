# Prompt 36 — Brand cleanup II: content, assets, seeds and verification

- **Phase:** 6 — Cleanup and QA
- **Depends on:** 35
- **Unlocks:** 37
- **Scope:** M
- **Expected files to change/create:** `db.json` (only if a hit remains), `public/index.html`, `public/manifest.json`, `public/robots.txt`, `public/*` icons (verify), `package.json`, `package-lock.json` (name field via `npm install --package-lock-only`), `README.md`, `.env`, `.env.example`, `.env.production`, `server.js` (comments), `src/**` (any content hit left), `prompts/_reference/BRAND_FOOTPRINT.md` (final status).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`, **`BRAND_FOOTPRINT.md`**. Confirm that prompts 01–35 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Remove every remaining Meghali's Silk trace from content and assets — copy, seed data, `public/`, package metadata, README, env files, templates, error pages, analytics/domain/social handles — and prove it with the zero-result grep over the source tree **and** the production build.

## Pre-flight checks

```bash
grep -rinI --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts -e "meghali" -e "mekhela" -e "mekhla" -e "chador" -e "saree" -e "sari\b" -e "handloom" -e "muga" . | wc -l
grep -rinI --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts -e "silk" . | wc -l
grep -n "\"name\"" package.json package-lock.json | head -3
```

## Tasks

1. **`db.json`** — re-run the seed validation from Prompt 06 and the brand grep on the file; the only permitted "Kolkata" is `Asia/Kolkata`; `Assam` appears only in LAMIKAA copy and the sample address; no `placehold.co`, no `v1787592407/…`, `v1788289312/…` Cloudinary assets.
2. **`public/`** — `index.html`: no old copy/comments; OG/Twitter URL placeholders resolved to `brand.seo.siteUrl` if the owner has supplied it (check `PLACEHOLDERS.md`), otherwise **remove** the `og:url`/`twitter:url` tags (a literal `{{…}}` must not ship) and note it; `manifest.json` verified; icons: `file public/*.png public/favicon.ico` sizes; confirm each icon file differs from the old artwork (`git diff --stat HEAD~40 -- public/` shows every icon changed) and delete any file not referenced by `index.html`/`manifest.json`; `robots.txt` — keep the sitemap line only if Prompt 38 will resolve the domain, else drop it now and let 38 re-add.
3. **Package metadata** — `package.json` name/description/author already set (Prompt 02); run `npm install --package-lock-only` so `package-lock.json`'s root `name` matches; no other lockfile change is expected (`git diff --stat package-lock.json` → only the name lines; if more changes appear, revert and record).
4. **README / env / server** — `README.md` mentions only LAMIKAA (full README lands in Prompt 39); `.env*` comments clean; `server.js` header comment generic ("Development mock backend"); no old domain (`meghalisilk`, `meghalissilk`), email, phone, address, social handle, GST text or coupon code anywhere.
5. **Templates, error pages, analytics** — `ErrorBoundary` copy and `index.js` crash screens (neutral text, dark palette); admin invoice (brand); `NotFound`; `settings.seo.googleAnalyticsId/facebookPixelId` empty; `REACT_APP_ENABLE_ANALYTICS` (unused) may stay.
6. **Source content sweep** — any remaining copy hit in `src/` (the §2 groups I/J of `BRAND_FOOTPRINT.md`), including alt texts, `aria-label`s, placeholders, toast copy, SweetAlert titles, comments in CSS modules.
7. **Verification (source)** — run exactly:
   ```bash
   grep -riIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts \
     -e "meghali" -e "mekhela" -e "mekhla" -e "chador" -e "saree" -e "sari\b" -e "handloom" -e "muga" .          # must print nothing
   grep -riIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts -e "silk" .    # must print nothing
   grep -riIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts \
     -e "sualkuchi" -e "galleria" -e "meghalisilk" -e "meghalissilk" -e "gamosa" -e "blouse" -e "v1787592407" -e "v1787592405" -e "v1788289312" -e "v1788289308" -e "v1788289311" -e "placehold.co" .   # must print nothing
   grep -riIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts -e "kolkata" . | grep -v "Asia/Kolkata"   # must print nothing
   ```
8. **Verification (build)** — `CI=true npm run build` then `grep -riIl -e "meghali" -e "mekhela" -e "chador" -e "saree" -e "handloom" -e "muga" -e "silk" -e "sualkuchi" build/` → nothing; also `grep -rl "{{" build/static/js | head` → check that any `{{TOKEN}}` in the bundle is one of the documented placeholders (they are allowed in code as tokens, but they must never render — verified by the storefront walk).
9. **`BRAND_FOOTPRINT.md`** — every §2 entry marked `done (NN)`; §1 identifiers marked; add a final "Verified zero on <date> at commit <sha>" line.
10. **Storefront walk** — every route from `REPO_MAP.md` §9 at 390 and 1280: `document.body.innerText.includes("{{")` is `false` on each; no old logo anywhere (search the DOM for `v17875924`).

## Design and content specification

None.

## Data and API changes

`db.json` only if a hit remains (both modes unaffected).

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: `prompts/` is excluded from the greps on purpose (it legitimately documents the old brand); never edit git history; never resolve a placeholder with a guessed value to make a grep pass.

## Acceptance criteria

- [ ] All four source greps print nothing; the build grep prints nothing.
- [ ] `package-lock.json` root name matches `package.json`; no other lock changes.
- [ ] No `{{` renders on any storefront or admin route; no old asset URL in the DOM.
- [ ] `BRAND_FOOTPRINT.md` fully ticked with the verification line.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

Run the four greps from Task 7 (each must print nothing), then the consolidated zero-result checks below — the programme's brand-cleanup gate for **source and build**:

```bash
git status --short          # only the files listed in the header
CI=true npm run build && npm test -- --watchAll=false
# source (everything except node_modules, .git, build and prompts/) — must print 0
grep -riIl --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts \
  -e "meghali" -e "mekhela" -e "mekhla" -e "chador" -e "saree" -e "handloom" -e "muga" -e "silk" -e "sualkuchi" -e "galleria" \
  -e "v1787592407" -e "v1787592405" -e "placehold.co" . | wc -l
# build output — must print 0
grep -riIl -e "meghali" -e "mekhela" -e "chador" -e "saree" -e "handloom" -e "muga" -e "silk" -e "sualkuchi" -e "galleria" \
  -e "v1787592407" -e "v1787592405" -e "placehold.co" build/ | wc -l
# placeholder tokens may exist in the bundle only as documented tokens; none may render (Task 10)
grep -rhoE "\{\{[A-Z0-9_]+\}\}" build/static/js | sort -u   # every line must be a row of prompts/_reference/PLACEHOLDERS.md
```

Manual QA: the route walk from Task 10 (`document.body.innerText.includes("{{")` is `false` on every route; no `v17875924` in the DOM).

## Handoff

1. `PROGRESS.md`: row 36 → `complete`; Decisions log: OG URL handling, lockfile note.
2. `BRAND_FOOTPRINT.md` final; `PLACEHOLDERS.md` if the OG URL decision changed a token's location.
3. Commit: `feat(lamikaa): 36 brand cleanup II content, assets, seeds and verification`.
