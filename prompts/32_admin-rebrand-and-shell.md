# Prompt 32 — Admin rebrand and shell

- **Phase:** 5 — Admin
- **Depends on:** 31
- **Unlocks:** 33
- **Scope:** M
- **Expected files to change/create:** change `src/theme/adminTheme.js`, `src/components/AdminLayout/AdminLayout.js`, `src/pages/Admin/AdminLogin.js`, `src/pages/Admin/AdminDashboard.js`, `src/pages/Admin/AdminProducts.js` (table + placeholders only; the form is Prompt 33), `src/pages/Admin/AdminReviews.js`, `src/pages/Admin/AdminOrders.js` (invoice), `src/pages/Admin/AdminPayments.js`, `src/pages/Admin/AdminLeads.js`, `src/pages/Admin/AdminFaqs.js`, `src/pages/Admin/AdminShipping.js`, `src/pages/Admin/AdminCategories.js`, `src/pages/Admin/AdminCoupons.js`, `src/pages/Admin/AdminUsers.js`, `src/pages/Admin/AdminSettings.js`, `src/App.css` (admin block).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–31 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Rebrand the admin panel to LAMIKAA (single dark palette, wordmark/icon, page titles, invoice), remove every Meghali-specific label, placeholder and sample value from admin screens, and keep every admin capability working unchanged.

## Pre-flight checks

```bash
grep -rn "#[0-9a-fA-F]\{6\}" src/pages/Admin src/components/AdminLayout src/theme/adminTheme.js | wc -l   # ~110 literals to route through the theme
grep -n "MOCK_REVIEWERS" src/pages/Admin/AdminReviews.js
grep -n "My E-Commerce Store" src/pages/Admin/AdminOrders.js
grep -n "16GB\|laptop, gaming\|PRD-001" src/pages/Admin/AdminProducts.js
grep -n "menuItems" src/components/AdminLayout/AdminLayout.js | head -2
```

## Tasks

1. **`adminTheme.js`** — `buildAdminTheme()` (drop the `mode` argument; keep the export name and a no-op parameter for callers): palette per `DESIGN_SYSTEM.md` §10 (`background.default #0B0B0D`, `paper #141416`, `primary #F5D76E` with `contrastText #0B0B0D`, `secondary #8B5CF6`, `success #7ED9A6`, `warning #F5C76E`, `error #FF8A80`, `info #5DE7FF`, `divider rgba(255,255,255,.08)`, text warm white/`#B8B5B0`), `CHIP_TONES` re-derived for the dark palette (soft tints), typography Manrope, `shape.borderRadius 8`, table heads uppercase tracked in `--sf-color-text-secondary`, buttons pill-free (radius 8, admin density), focus ring gold. Export the palette object so screens can read `theme.palette.*`.
2. **Hex literals in admin screens** — replace every UI colour literal (dashboard stat cards, FAQ stat tiles, payments summary cards, leads tiles, shipping cards, SweetAlert confirm colours `#d32f2f`/`#ef4444`) with theme palette values (`useTheme()` from `@mui/material/styles` or the exported palette; SweetAlert `confirmButtonColor: palette.error.main`). Invoice print CSS in `AdminOrders.js` keeps neutral print colours (paper is white when printed — allowed; note it).
3. **`AdminLayout`** — wordmark `<Logo width={150}>` in the drawer head (mark `<Logo variant="mark" width={36}>` when the drawer is narrow/mobile), drawer ground `#0B0B0D`, hairline dividers, gold active item with a 3px gradient bar; AppBar glass-like paper; page titles `document.title = "{screen} · Admin · LAMIKAA NATURALS"` (set in `AdminLayout` from the route); notifications and avatar menu unchanged; "Back to Store" stays; section captions Catalogue / Sales / Storefront / Operations stay; rename "Hero Section" → "Home & Hero" (route unchanged until Prompt 34); no theme toggle (already gone).
4. **`AdminLogin`** — centred `GlassCard`-like MUI Paper with the wordmark, "Admin Console", "Sign in to manage LAMIKAA NATURALS", gold primary button; `useAdminBodyClass`; no demo credentials on screen (keep it that way).
5. **Copy/placeholder sweep** — `AdminProducts`: SKU placeholder `LK-BR-XX-000`, variant placeholder "e.g. 100 ml / 200 ml", tags placeholder "e.g. black rice, face wash, cleanser", labels "Weight (kg)" → "Shipping weight (kg)" and dimensions kept (shipping needs them); table gains columns **Hero** (`heroOrder` or "—") and **Media** (`media.length` with an image/video split, e.g. "3 img · 1 vid") and the Price cell shows a "Price on launch" chip for `priceTBA`; `AdminReviews`: delete `MOCK_REVIEWERS` and the one-click name chips (fabricated names); keep the free-text reviewer name; show a "Sample" chip on rows with `isSample`; `AdminOrders`: invoice header uses `brand.name`, `brand.legalName`, the wordmark (`cld(brand.logoUrl,{w:400})`), GSTIN only when resolved; fallback store name `brand.name`; `AdminHeroSection`: rename the visible title to "Home & Hero" and the temporary announcements tab label stays until 34; `AdminFaqs`: placeholder "e.g. Does the face wash suit sensitive skin?"; `AdminShipping`: carrier placeholder "e.g. Delhivery, Blue Dart, India Post", default carrier blank; `AdminSettings`: General tab copy neutral; the "Hero Section" pointer card → "Home & Hero".
6. **`App.css` admin block** — `body.admin-area` ground `#0B0B0D`, scrollbars `#2A2A30` thumb, SweetAlert2 admin skin on the dark palette (gold confirm, error red from the palette).
7. **Admin table density** — keep MUI defaults; ensure every table scrolls horizontally inside `TableContainer` at 360px (no page overflow).

## Design and content specification

- Admin is a quieter sibling: no glass except the login card, no glow; charcoal grounds, gold primary actions, hairlines; Manrope throughout; icons Iconify as today.
- Copy: "Admin Console", "Sign in to manage LAMIKAA NATURALS", "Home & Hero", "Price on launch", "Sample".

## Data and API changes

None. All CRUD flows unchanged.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: the admin never imports storefront tokens/components except `Logo`, `brand` and `cloudinary`; every admin action (orders, returns, payments, refunds, coupons, users, leads, settings, deals) is re-tested after the palette change.

## Acceptance criteria

- [ ] Admin login/shell/dashboard rebranded; page titles per screen; no toggle.
- [ ] `grep -rn "#[0-9a-fA-F]\{6\}" src/pages/Admin src/components/AdminLayout | grep -v "AdminOrders.js" | wc -l` → 0 (only invoice print CSS remains).
- [ ] `grep -rn "MOCK_REVIEWERS\|My E-Commerce Store\|16GB\|laptop\|mekhela\|Muga\|Bihu\|Sualkuchi" src/pages/Admin src/components/AdminLayout` → 0.
- [ ] Regression walk: create/edit/delete product (old form), category, coupon, shipping method, FAQ; order fulfil/deliver/cancel/refund initiate+complete; return create→refund; payment refund; user deactivate/activate; lead update; settings save; deals config save — all succeed in mock mode.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -rn "buildAdminTheme(" src --include=*.js
npm run dev   # /admin walk-through at 360 / 768 / 1280
```

Manual QA: every admin screen at 360 / 768 / 1280; table horizontal scroll at 360; keyboard focus rings on MUI controls.

## Handoff

1. `PROGRESS.md`: row 32 → `complete`; Decisions log: invoice print palette exception, reviewer chips removed.
2. `REPO_MAP.md` §7 "Updated by Prompt 32".
3. Commit: `feat(lamikaa): 32 admin rebrand and shell`.
