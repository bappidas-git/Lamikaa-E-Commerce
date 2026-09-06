# Prompt 04 — Typography and global styles

- **Phase:** 0 — Foundations
- **Depends on:** 03
- **Unlocks:** 05
- **Scope:** M
- **Expected files to change/create:** `public/index.html` (font links), `src/theme/storefront-tokens.css` (font + type-scale tokens), `src/theme/storefront-primitives.css`, `src/index.css`, `src/App.css`, `src/context/ThemeContext.js` (MUI typography), `src/theme/adminTheme.js` (font family only).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–03 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Install the LAMIKAA type system (Fraunces display + Manrope UI), the fluid type scale, and the global CSS layer the rebuild composes on: glass, glow, gradient-text, eyebrow, section-rhythm and container primitives, focus ring, selection, scrollbar, reduced-motion behaviour and the SweetAlert2 skin.

## Pre-flight checks

```bash
grep -n "fonts.googleapis.com/css2" public/index.html                   # one link (Cormorant Garamond + Inter) to replace
grep -n "\-\-sf-font-display\|\-\-sf-font-family\|\-\-sf-text-" src/theme/storefront-tokens.css
grep -c "" src/theme/storefront-primitives.css                          # ~438
curl -sI "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap" | head -1   # 200
```

## Tasks

1. **Fonts (`public/index.html`)** — replace the Google Fonts `<link>` with one request: `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap`; keep both `preconnect`s and the Material Icons link (admin). Remove Inter/Cormorant references from the inline splash CSS (splash tagline → Fraunces 500, body → Manrope). Update the comment block that documents "the only load path".
2. **Font tokens** (`storefront-tokens.css`): `--sf-font-display: "Fraunces", "Playfair Display", Georgia, "Times New Roman", serif;` `--sf-font-family: "Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;` type scale and leading/tracking exactly as `DESIGN_SYSTEM.md` §6; delete `--sf-font-light` (grep consumers: replace with `--sf-font-normal`).
3. **Base layer** (`src/index.css`, `src/App.css`): `html { color-scheme: dark; scroll-behavior: smooth; } @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`; `body { background: var(--sf-color-bg); color: var(--sf-color-text); font-family: var(--sf-font-family); font-size: var(--sf-text-base); line-height: var(--sf-leading-normal); -webkit-font-smoothing: antialiased; }`; headings default to `var(--sf-font-display)` with `font-optical-sizing: auto` and `font-variation-settings: "SOFT" 30` for `h1, h2`; `::selection { background: var(--sf-color-gold); color: var(--sf-color-bg); }`; scrollbars 8px, track `var(--sf-color-bg)`, thumb `var(--sf-color-surface-hover)` → hover `var(--sf-color-text-muted)`; `.skip-link` restyled (gold fill, near-black text, pill); `.container` → `max-width: var(--sf-container-max)`; keep `.main-content` mechanics (padding-bottom for BottomNav); `body[data-scroll-lock] { overflow: hidden; }`.
4. **Primitives** (`storefront-primitives.css`) — restyle and extend, keeping every existing class name as a contract:
   - `.sf-btn` → pill, Manrope 600, `letter-spacing: .02em`, no uppercase (sentence case system-wide), 44px min height, hover lift 1px; `.sf-btn--emerald` = gold fill + near-black label, hover `--sf-color-gold-light` + `box-shadow: 0 8px 24px rgba(245,215,110,.25)`; `.sf-btn--gold` = alias of the same look (kept for compatibility); `.sf-btn--outline-gold` = glass secondary (background `--sf-glass-bg`, 1px `--sf-color-border-strong`, warm-white label, hover border gold); `.sf-btn--ghost` = text with gradient underline reveal (`background-image: var(--sf-gradient-signature)`, `background-size: 0 1px → 100% 1px`); `.sf-btn--sm/--lg/--block` kept; press = `translateY(0)` + 92 % opacity; focus-visible = `--sf-shadow-focus`.
   - New `.sf-glass`, `.sf-glass--strong`, `.sf-glass--scrim` with the `@supports` fallback and the ≤768px blur reduction (recipe in `DESIGN_SYSTEM.md` §4); `.sf-glow`, `.sf-glow--violet`, `.sf-glow--gold`, `.sf-glow--duo` (two pseudo-elements: pink top-right, violet bottom-left), `.sf-glow--breathe` (§5) with the reduced-motion stop.
   - New `.sf-gradient-text` (signature gradient clipped to text, `-webkit-text-fill-color: transparent`, falls back to gold when `background-clip: text` is unsupported), `.sf-eyebrow` (gold, uppercase, `--sf-tracking-wide`, `--sf-text-xs`, optional `.sf-eyebrow--rule` with a 24px gradient hairline before it), `.sf-section` (`padding-block: var(--sf-section-y)`), `.sf-section--tight` (60 %), `.sf-container` / `.sf-container--wide`, `.sf-hairline` (1px `--sf-color-border`), `.sf-hairline--gradient` (1px signature gradient at 60 % opacity), `.sf-visually-hidden`, `.sf-placeholder-media` (`filter: saturate(.6) brightness(.85)` + `::after` wash `linear-gradient(180deg, rgba(11,11,13,.15), rgba(11,11,13,.5))`), `.sf-plate` (`background: var(--sf-color-surface); border: 1px solid var(--sf-glass-border); border-radius: var(--sf-radius-lg); aspect-ratio: 1; display:grid; place-items:center; overflow:hidden` — images inside `object-fit: contain`).
   - Chips: `.sf-chip` → glass pill (`--sf-glass-bg`, hairline, Manrope 500, 13px, 36px tall; `.sf-chip--active` gold fill); `.sf-badge-discount`, `.sf-pill-save` → success tint; `.sf-ribbon-premium` → gold hairline pill (kept); `.sf-flag-trending/hot` → concern-pink/violet tints.
   - `.sf-card` → glass surface, radius `--sf-radius-lg`, hover: 4px lift + `--sf-color-border-strong` + glow fade (`.sf-card--hover:hover::before` opacity 0→.22 over `--sf-transition`); image breathing kept at 1.03; `.sf-skeleton` → `--sf-color-surface-2 → --sf-color-surface-hover` shimmer; `.sf-toast` → glass, gold left rule.
5. **SweetAlert2 skin** (`App.css`, single block from Prompt 03): popup `--swal2-background: rgba(20,20,22,.94)` with `backdrop-filter: blur(16px)` (via `.swal2-popup { -webkit-backdrop-filter…; backdrop-filter…; }`), 1px `--sf-glass-border`, radius `--sf-radius-lg`, confirm = gold/near-black pill, cancel = glass pill, timer bar gold, toast `box-shadow: var(--sf-shadow-1)`, z-index `var(--sf-z-toast)` (keep the existing `.swal2-container { z-index: 2000 !important }` since MUI dialogs sit at 1300). Admin block unchanged.
6. **Reduced motion** — the token layer already zeroes durations; add `@media (prefers-reduced-motion: reduce) { .sf-btn, .sf-card, .sf-chip { transition: none; } .sf-card--hover:hover { transform: none; } .sf-glow--breathe::before, .sf-glow--breathe::after { animation: none; } }`.
7. **MUI typography** (`ThemeContext.js`): `fontFamily` Manrope; `h1/h2/h3` Fraunces 500 at `--sf-text-5xl/4xl/3xl` rem equivalents, `lineHeight 1.12`; `button { textTransform: "none", fontWeight: 600, letterSpacing: ".02em" }`. `adminTheme.js`: `fontFamily` Manrope (palette unchanged until Prompt 32).
8. **Legibility sweep**: because component layouts are still the old ones, check that Fraunces at the old sizes does not overflow the header lockup, hero headline, product card name, PDP title, checkout step labels or admin headings at 360 px; fix by adjusting the *scale tokens* (never component CSS) or by wrapping with `overflow-wrap: anywhere` in the base layer.

## Design and content specification

- Display headlines: Fraunces 500, `--sf-leading-display 1.12`, `letter-spacing -0.01em` at ≥ 40px; uppercase tracked eyebrows in gold above them; ledes in `--sf-color-text-secondary`.
- Body: Manrope 400/500, 16px minimum on mobile, 1.6 line-height; UI labels Manrope 600.
- Numerals for chapter numbers: Fraunces with `font-variant-numeric: tabular-nums` (utility `.sf-numeral`).
- Buttons are pill-shaped system-wide from now on (the brief allows pill or 14px; pill is the decision — record it).
- Glass: 6 % white at 20px blur, hairline 8 % white; glow opacity .22; gradient text only for one keyword per section.

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
- Prompt-specific: no `@import` of fonts in CSS; no self-hosting unless the Google Fonts request fails in the build environment (then self-host under `public/fonts/` with `@font-face` in `index.css` and record it); do not rename primitive classes; do not add Tailwind or any CSS library.

## Acceptance criteria

- [ ] Network panel shows exactly one Google Fonts CSS request loading Fraunces + Manrope; no Inter/Cormorant requests; fonts render with `font-display: swap`.
- [ ] `grep -n "Cormorant\|Inter" src public --include=*.css --include=*.html --include=*.js -r` → only the fallback stack entries.
- [ ] `.sf-glass`, `.sf-glow*`, `.sf-gradient-text`, `.sf-eyebrow`, `.sf-section`, `.sf-container`, `.sf-plate`, `.sf-placeholder-media`, `.sf-visually-hidden` exist and are documented in the primitives header comment.
- [ ] Buttons are pills with gold primary/glass secondary/ghost underline; focus ring visible with keyboard; SweetAlert2 toasts render as glass.
- [ ] No text below 16px in body copy on a 360px viewport; no light-weight text below 14px anywhere.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass; no console errors.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -n "family=Fraunces" public/index.html && ! grep -n "Cormorant+Garamond\|family=Inter" public/index.html
grep -n "^\.sf-glass\|^\.sf-glow\|^\.sf-gradient-text\|^\.sf-eyebrow\|^\.sf-section\|^\.sf-plate\|^\.sf-placeholder-media" src/theme/storefront-primitives.css
grep -rn "sf-font-light" src | wc -l   # 0
```

Manual QA at 360 / 390 / 768 / 1280: home hero headline (old layout) wraps without overflow; product card names; PDP title; checkout; `/admin/products` table headings; toast after "Add to Cart"; Tab through the header — every focus ring visible; Rendering → `prefers-reduced-motion: reduce` → no breathing glow, no lifts.

## Handoff

1. `PROGRESS.md`: row 04 → `complete`; Decisions log: "pill buttons system-wide", font hosting path, any scale-token adjustments.
2. `DESIGN_SYSTEM.md` §6–§7: append "Updated by Prompt 04" with the final primitive class list.
3. Commit: `feat(lamikaa): 04 typography and global styles`.
