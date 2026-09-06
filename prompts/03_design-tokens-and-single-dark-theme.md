# Prompt 03 — Design tokens and single dark theme

- **Phase:** 0 — Foundations
- **Depends on:** 02
- **Unlocks:** 04
- **Scope:** L
- **Expected files to change/create:** `src/theme/storefront-tokens.css`, `src/theme/colors.js`, `src/theme/tokens.js`, `src/theme/motion.js`, `src/context/ThemeContext.js`, `src/components/ErrorBoundary/ErrorBoundary.js`, `src/App.css`, `src/index.css`, `public/index.html`, `src/components/AdminLayout/AdminLayout.js`, `src/pages/Admin/AdminLogin.js`, `src/theme/adminTheme.js` (mode plumbing only), the 21 `isDarkMode` consumers (`src/components/Header/Header.js`, `SidebarMenu/SidebarMenu.js`, `CartDrawer/CartDrawer.js`, `CTASection/CTASection.js`, `BottomNav/BottomNav.js`, `Newsletter/Newsletter.js`, `AuthModal/AuthModal.js`, `src/pages/OrderHistory/OrderHistory.js`, `HelpCenter/HelpCenter.js`, `SpecialOffers/SpecialOffers.js`, `Profile/Profile.js`, `Support/Support.js`, `OrderConfirmation/OrderConfirmation.js`, `PrivacyPolicy/PrivacyPolicy.js`, `Checkout/Checkout.js`, `ProductDetails/ProductDetails.js`, `CookiePolicy/CookiePolicy.js`, `RefundPolicy/RefundPolicy.js`, `TermsOfService/TermsOfService.js`), the 28 CSS modules with `.dark` rules, `src/context/WishlistContext.js`, `src/pages/OrderConfirmation/OrderConfirmation.js` (confetti colours).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–02 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Rewrite the token layer to the "Luxury Skincare After Dark" palette as a **single dark theme** and remove every trace of light/dark switching from the storefront and the admin: the toggles, the persisted preference, the `body.dark/.light` classes, the `prefers-color-scheme`/pre-mount branching, and every component that reads a mode.

## Pre-flight checks

```bash
grep -rn "isDarkMode\|toggleTheme\|useThemeContext" src --include=*.js | wc -l     # ~63 lines across 21 files + ThemeContext
grep -rlc "\.dark\b" src --include=*.css | wc -l                                    # 28 CSS modules + App.css + tokens/primitives
grep -n "localStorage.getItem(\"theme\")" -r src public                             # ThemeContext.js:47, ErrorBoundary.js:8, index.html
sed -n 85,100p src/theme/storefront-tokens.css                                      # current :root brand block
```

## Tasks

1. **`src/theme/storefront-tokens.css`** — replace the whole file: keep the file header (rewrite the comment for LAMIKAA; no Meghali text), declare **one** `:root` block containing every token in `DESIGN_SYSTEM.md` §2 and §3 with those exact values, keep every existing token *name* that components consume (run `grep -rhoE "var\(--sf-[a-z0-9-]+" src | sort -u` first and make sure each name is still declared — including `--sf-color-emerald*`, `--sf-color-gold*`, `--sf-color-star`, `--sf-color-price`, `--sf-gradient-gold`, `--sf-gradient-primary*`, `--brand-logo-bg` (declare it as `var(--sf-color-surface)` for now; removed in Prompt 35), `--sf-gradient-heritage` (declare as the new `--sf-gradient-brand` value for now), `--sf-gradient-announce-1/2/3` (all = the new single announce gradient), `--sf-cat-*` (point each at a `--sf-concern-*` value)), add the new tokens (`--sf-color-pink`, `--sf-color-violet`, `--sf-color-cyan`, `--sf-gradient-signature`, `--sf-gradient-brand`, `--sf-gradient-announce`, `--sf-glass-*`, `--sf-glow-*`, `--sf-shadow-1/2`, `--sf-section-y`, `--sf-container-wide`, `--sf-z-header`, `--sf-z-toast`, `--sf-concern-*`), **delete the `body.dark` block entirely**, keep the `prefers-reduced-motion` block. Add `:root { color-scheme: dark; }`. Font tokens keep their current family values (Prompt 04 changes fonts).
2. **`src/theme/colors.js`** — export `PALETTE` (the single dark MUI mirror per `DESIGN_SYSTEM.md` §10: `primary { main:#F5D76E, light:#FFEFA6, dark:#B88924, contrastText:#0B0B0D }`, `secondary { main:#FF4FD8 }`, `background { default:#0B0B0D, paper:#141416 }`, `text { primary:#F7F5F0, secondary:#B8B5B0 }`, `gradient { primary, primaryReverse, hero: var-free equivalents }`, `bodyBackground: "#0B0B0D"`) and keep `export const DARK = PALETTE` for one prompt of compatibility; delete `LIGHT`.
3. **`src/theme/tokens.js`** — `TOKENS.radius = { sm: 8, md: 14, lg: 20, xl: 28, pill: 999 }`; add `TOKENS.sectionY`, `TOKENS.containerWide = 1440`; keep everything else. **`src/theme/motion.js`** — `EASE = [0.2, 0.7, 0.2, 1]`, `DURATION = { fast: 0.16, base: 0.32, slow: 0.6 }`; update the header comment.
4. **`src/context/ThemeContext.js`** — rewrite: build **one** MUI theme with `createTheme({ palette: { mode: "dark", …PALETTE }, shape: { borderRadius: 14 }, typography (keep current families until Prompt 04), components: MuiButton (pill radius 999, contained = gold with near-black label, hover gold-light, no elevation), MuiCard, MuiTextField (gold focus), MuiDrawer/MuiAppBar/MuiPaper (`backgroundImage: none`, paper `#141416`, hairline borders `rgba(255,255,255,.08)`), MuiMenu paper (glass-like: `#141416` + hairline), MuiIconButton touch override })`. Export `ThemeContextProvider` (wraps `ThemeProvider` only), `useTheme()` returning `{ theme }`, and **remove** `isDarkMode`, `toggleTheme`, `useThemeContext`. On mount run `try { localStorage.removeItem("theme"); } catch {}` once (migration). Do not write `document.body.style.backgroundColor` or the theme-color meta any more (both are static now).
5. **Remove every mode read** (the 21 files in the header list): delete `useTheme`/`useThemeContext` imports where only `isDarkMode` was used, delete `const { isDarkMode… } = useTheme()`, replace `${isDarkMode ? styles.dark : ""}` / `${(isDarkMode && styles.dark) || ""}` with nothing (keep `className={styles.page}`), delete the toggle controls in `Header.js` (the IconButton block around lines 466-477 and the `DarkModeOutlined`/`LightModeOutlined` imports), `SidebarMenu.js` (the "Dark mode" switch row around 609-636 and its icon imports), `Profile.js` (the Appearance switch block around 1064-1080 inside `renderSettingsSection`; keep the rest of Settings), `AdminLayout.js` (the theme IconButton around 495-507; import `buildAdminTheme` and use `const adminTheme = useMemo(() => buildAdminTheme("dark"), [])`; remove `useThemeContext`), `AdminLogin.js` (`buildAdminTheme("dark")` memoised; remove `useTheme`). `CartDrawer.js`/`BottomNav.js`/`AuthModal.js` used `themeClass` — remove the variable and its usage. After this, `grep -rn "isDarkMode\|toggleTheme\|useThemeContext" src` must return **0** lines.
6. **CSS modules** — delete every `.dark …` rule (rules whose selector starts with or contains `.dark`) in the 28 module files listed by `grep -rl "\.dark\b" src --include=*.module.css`; also delete the `body.dark`/`body.light` selectors in `src/App.css` (collapse the SweetAlert2 skin to one storefront block `body:not(.admin-area) .swal2-popup {…}` using the new tokens, and one admin block `body.admin-area .swal2-popup {…}` using the dark admin values) and in `src/theme/storefront-primitives.css` (its one `body.dark` mention is a comment — rewrite). `grep -rn "\.dark\b\|body\.light" src --include=*.css` → 0.
7. **`public/index.html`** — delete the pre-mount theme script (the IIFE that reads `localStorage.theme` and adds `body.dark/light`); set `body { background: #0B0B0D }` statically; keep the loader-hide script; ensure `meta[name=theme-color]` is `#0B0B0D`.
8. **`src/components/ErrorBoundary/ErrorBoundary.js`** — delete `isDarkTheme()` and the `dark` branches; keep a single literal palette that mirrors the new tokens (`#0B0B0D`, `#141416`, `#F7F5F0`, `#B8B5B0`, `#F5D76E`, `#B88924`, `rgba(255,255,255,.08)`) with a comment naming each token; no Meghali text.
9. **Danger/confetti literals** — `src/context/WishlistContext.js:14`, `src/pages/OrderHistory/OrderHistory.js:31`, `src/pages/Profile/Profile.js:53`: `DANGER_HEX = "#FF8A80"` (mirrors `--sf-color-danger`); `src/pages/OrderConfirmation/OrderConfirmation.js:46` `CONFETTI_COLORS = ["#F5D76E", "#FFEFA6", "#FF4FD8", "#8B5CF6"]`.
10. **Admin isolation** — `src/theme/adminTheme.js`: keep `buildAdminTheme(mode)` but make `"dark"` the only value callers pass (palette recolour happens in Prompt 32). `src/App.css`: `body.admin-area { background-color: #0b1220 !important }` (single rule; the light rule is deleted) and single admin scrollbar rules. `src/hooks/useAdminBodyClass.js` unchanged.
11. **Sanity pass on contrast-sensitive hard-codes**: `src/components/Footer/Footer.js` payment marks and `AuthModal.js` social marks keep their brand hexes (documented exceptions); `src/utils/helpers.js → PLACEHOLDER_IMG` fill `#807867` → `#8E8B86` (≥ 3:1 on `#141416`); `src/components/SearchModal/SearchModal.js:55-56` data-URI colours → `#141416` / `#B8B5B0`.
12. **Sweep for pre-mount/theme comments** mentioning "light mode", "evening gallery", "ivory" in `src/index.css`, `src/App.css`, `public/index.html`, `src/theme/*` and rewrite them.

## Design and content specification

After this prompt the whole site is dark: page `#0B0B0D`, surfaces `#141416`/`#1C1C20`, warm-white text, champagne-gold accents. Layout is unchanged (the old components still render with their old geometry — that is expected; they are rebuilt from Prompt 09 on). Buttons that used `--sf-color-emerald` now render gold with near-black labels; links/eyebrows/prices render gold. Nothing may look washed out: check the header, product cards, drawer, checkout and admin tables for legibility and fix token mappings (not component CSS) where a surface/text pair falls below 4.5:1.

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
- Prompt-specific: do not rename any token consumed by components in this prompt (renames happen in Prompt 35); do not restyle component layouts; do not touch fonts (Prompt 04); the admin keeps its indigo palette until Prompt 32 — only its mode plumbing changes here.

## Acceptance criteria

- [ ] `grep -rn "isDarkMode\|toggleTheme\|useThemeContext\|localStorage.getItem(\"theme\")\|setItem(\"theme\"" src public` → 0 lines.
- [ ] `grep -rn "\.dark\b\|body\.light\|prefers-color-scheme" src public --include=*.css --include=*.html --include=*.js` → 0 lines.
- [ ] No toggle is visible in the header, mobile menu, profile settings or admin header.
- [ ] Every token name consumed anywhere (`grep -rhoE "var\(--sf-[a-z0-9-]+" src | sort -u`) is declared in `storefront-tokens.css` (script this check).
- [ ] The MUI theme is dark (inspect a Header IconButton and the admin dialog surfaces).
- [ ] A visitor with a stored `theme=light` from before sees dark and the key is removed.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass; no console errors on home, PDP, checkout, `/admin/dashboard`.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -rn "isDarkMode\|toggleTheme\|useThemeContext" src | wc -l        # 0
grep -rn "\.dark\b\|body\.light" src --include=*.css | wc -l            # 0
grep -rhoE "var\(--sf-[a-z0-9-]+" src | sort -u | sed 's/var(//' | while read t; do grep -q -- "$t:" src/theme/storefront-tokens.css || echo "MISSING $t"; done
grep -n "prefers-color-scheme\|localStorage" public/index.html          # 0
```

Manual QA at 360 / 390 / 768 / 1024 / 1280: home, `/products`, a PDP, cart drawer, `/checkout`, `/profile` → Settings (no Appearance switch), `/admin/dashboard` (no toggle). DevTools → Application → Local Storage: `theme` absent after reload. Rendering → Emulate `prefers-color-scheme: light` → nothing changes.

## Handoff

1. `PROGRESS.md`: row 03 → `complete`; Decisions log: any token pair remapped for contrast; list of the 21 files edited.
2. `REPO_MAP.md` §2: append "Updated by Prompt 03 — single dark theme; `body.dark` removed; ThemeContext exports `{ theme }` only".
3. Commit: `feat(lamikaa): 03 design tokens and single dark theme`.
