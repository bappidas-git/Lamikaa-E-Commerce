# DESIGN_SYSTEM — "Luxury Skincare After Dark", adapted to this repository

> Brief §6 in full, translated into the repo's real styling approach: **CSS Modules consuming `--sf-*` custom properties** declared once in `src/theme/storefront-tokens.css`, global primitives in `src/theme/storefront-primitives.css`, a JS mirror in `src/theme/tokens.js` / `colors.js` / `motion.js`, and one MUI theme built in `src/context/ThemeContext.js` (storefront) plus `src/theme/adminTheme.js` (admin). The `--lk-*` names in the brief are **not** adopted: 100+ CSS modules consume tokens by name, so the `--sf-` prefix (it means "storefront", not the old brand) stays and the values change. The mapping table in §2 is the contract every prompt uses.

## 1. Non-negotiables (repo form)

- **Single dark theme.** `storefront-tokens.css` declares one token set in `:root`; the `body.dark` block, `body.light`, `localStorage.theme`, the toggles (`Header.js:466-477`, `SidebarMenu.js:609-636`, `Profile.js:1064-1080`, `AdminLayout.js:495-507`) and every `${isDarkMode ? styles.dark : ""}` read are removed in Prompt 03. `html { color-scheme: dark; }`. `meta[name=theme-color]` = `#0B0B0D` (static). The admin uses `buildAdminTheme("dark")` only, recoloured to the LAMIKAA palette in Prompt 32. No toggle may remain anywhere.
- Products and the LAMIKAA lockup are the visual focus; glass, glow and gradient are supporting devices with hard budgets (§4–§5).
- Never `#000` as a page ground; never more than two blurred layers in view; never gold text on pink/violet; never thin light text on glass over imagery; no bounces, no spinners as decoration, no autoplaying sound, no cyberpunk grids or neon outlines.

## 2. Colour tokens — brief name → repo token → value

Prompt 03 rewrites `:root` in `src/theme/storefront-tokens.css` to exactly these values (structural tokens in §3 unchanged unless listed).

| Brief (`--lk-*`) | Repo token (`--sf-*`) | Value | Role |
|---|---|---|---|
| `--lk-bg` | `--sf-color-bg` | `#0B0B0D` | Page ground (also `body`, `.App`, `.main-content`) |
| `--lk-bg-2` | `--sf-color-surface` | `#141416` | Sections, cards, drawers, image plates |
| `--lk-bg-3` | `--sf-color-surface-2` | `#1C1C20` | Inputs, sunken panels, thumbnails |
| — | `--sf-color-surface-hover` | `#222228` | Hover fill |
| `--lk-text` | `--sf-color-text` | `#F7F5F0` | Primary text (warm white) |
| `--lk-text-2` | `--sf-color-text-secondary` | `#B8B5B0` | Secondary text |
| `--lk-text-3` | `--sf-color-text-muted` | `rgba(247,245,240,.62)` | Muted text, captions (≥ 4.5:1 on `#0B0B0D`) |
| `--lk-gold` | `--sf-color-gold` **and** `--sf-color-accent`, `--sf-color-secondary`, `--sf-color-price`, `--sf-color-star` | `#F5D76E` | Champagne gold — primary accent, eyebrows, prices, links |
| `--lk-gold-hi` | `--sf-color-gold-light` | `#FFEFA6` | Hover/active gold, highlights |
| `--lk-gold-dk` | `--sf-color-gold-deep` | `#B88924` | Pressed gold, gradient stop, borders on light plates |
| — | `--sf-color-primary` | `#F5D76E` | MUI/primitive "primary" = gold fill |
| — | `--sf-color-primary-contrast` | `#0B0B0D` | Near-black text on gold (passes 12:1) |
| — | `--sf-color-primary-dark` / `-light` | `#B88924` / `#FFEFA6` | Pressed / hover |
| — | `--sf-color-primary-soft` | `rgba(245,215,110,.10)` | Tinted fills |
| — | `--sf-color-emerald` / `-hover` / `-contrast` (**legacy CTA name, 188 usages; renamed to `--sf-color-cta*` in Prompt 35**) | `#F5D76E` / `#FFEFA6` / `#0B0B0D` | Primary CTA fill / hover / label |
| `--lk-pink` | `--sf-color-pink` (new) | `#FF4FD8` | Neon pink accent, glow |
| `--lk-violet` | `--sf-color-violet` (new) | `#8B5CF6` | Neon violet accent, glow |
| `--lk-cyan` | `--sf-color-cyan` (new) | `#5DE7FF` | Rare accent (info states, one micro-detail per page) |
| `--lk-gradient` | `--sf-gradient-signature` (new; `--sf-gradient-gold` re-pointed to `linear-gradient(135deg,#FFEFA6,#F5D76E 50%,#B88924)`) | `linear-gradient(135deg, #F5D76E, #FF4FD8, #8B5CF6)` | Hairlines, eyebrow underlines, active indicators, one gradient-text keyword per section, full-page CTA wash |
| — | `--sf-gradient-primary` / `-hover` | gold gradient / reversed | MUI contained buttons |
| `--lk-glass-bg` | `--sf-glass-bg` (new) | `rgba(255,255,255,.06)` | Glass surface |
| `--lk-glass-bg-strong` | `--sf-glass-bg-strong` (new) | `rgba(255,255,255,.08)` | Header after scroll, modals |
| `--lk-glass-border` | `--sf-glass-border` (new) | `rgba(255,255,255,.08)` | Glass hairline |
| `--lk-glass-blur` | `--sf-glass-blur` (new) | `20px` (`12px` under `max-width: 768px`) | Backdrop blur |
| — | `--sf-glass-fallback` (new) | `rgba(20,20,22,.92)` | `@supports not (backdrop-filter)` |
| `--lk-glow-pink` | `--sf-glow-pink` (new) | `radial-gradient(closest-side, rgba(255,79,216,.22), transparent 70%)` | Ambient glow |
| `--lk-glow-violet` | `--sf-glow-violet` (new) | `radial-gradient(closest-side, rgba(139,92,246,.22), transparent 70%)` | Ambient glow |
| `--lk-glow-gold` | `--sf-glow-gold` (new) | `radial-gradient(closest-side, rgba(245,215,110,.16), transparent 70%)` | Ambient glow |
| `--lk-focus` | `--sf-shadow-focus` (`--sf-color-focus-ring: #F5D76E`) | `0 0 0 3px rgba(245,215,110,.55)` | Focus-visible ring everywhere |
| — | `--sf-color-border` / `-border-strong` | `rgba(255,255,255,.08)` / `rgba(245,215,110,.35)` | Hairlines / emphasised hairlines |
| — | `--sf-color-overlay` | `rgba(11,11,13,.72)` | Scrims |
| — | `--sf-color-success` / `-bg` | `#7ED9A6` / `rgba(126,217,166,.12)` | Semantic (≥ 4.5:1) |
| — | `--sf-color-warning` / `-bg` | `#F5C76E` / `rgba(245,199,110,.12)` | Semantic |
| — | `--sf-color-danger` / `-bg` | `#FF8A80` / `rgba(255,138,128,.12)` | Semantic (SweetAlert2 `DANGER_HEX` mirrors `#FF8A80`) |
| — | `--sf-color-info` / `-bg` | `#5DE7FF` / `rgba(93,231,255,.10)` | Semantic = cyan |
| — | `--sf-color-compare` | `#B8B5B0` | Struck-through compare price |
| — | `--sf-color-discount` / `-bg` | `#7ED9A6` / `rgba(126,217,166,.12)` | Savings |
| — | `--sf-color-badge-bg` | `rgba(255,255,255,.06)` | Neutral chip |
| — | `--sf-concern-*` (replaces `--sf-cat-*`, six values) | `#FF4FD8`, `#8B5CF6`, `#5DE7FF`, `#F5D76E`, `#7ED9A6`, `#F7A8C4` | Concern chip accents (used as borders/text at ≥ 4.5:1) |

Removed tokens (Prompt 03 + 35): `--sf-color-brand-green`, `--sf-color-brand-green-deep`, `--brand-logo-bg`, `--sf-gradient-heritage` (→ `--sf-gradient-brand` = `linear-gradient(135deg,#0B0B0D,#1C1C20 55%,#2A2330)`), `--sf-gradient-announce-1/2/3` (→ one `--sf-gradient-announce`), `--sf-cat-*` (→ `--sf-concern-*`).

**Visual balance budget** (checked in Prompt 38): ≈ 60 % dark grounds · 20 % warm white · 10 % champagne gold · 5 % pink · 3 % violet · 2 % cyan. Gold is the only accent allowed as a solid button fill; pink/violet appear only as glows, hairlines and gradient stops; cyan at most once per page.

## 3. Structural tokens (updated values)

| Token | Value |
|---|---|
| `--sf-radius-sm / md / lg / xl / pill` | `8px / 14px / 20px / 28px / 999px` (`tokens.js TOKENS.radius` mirrors) |
| `--sf-space-*` | unchanged 4px scale (1–16) + `20:80px`, `24:96px`, `32:128px` |
| `--sf-section-y` (new) | `clamp(64px, 10vw, 140px)` — vertical rhythm of every home/shop section |
| `--sf-shadow-1` / `--sf-shadow-2` (new; `--sf-shadow-xs/sm/md/lg` kept and re-pointed) | `0 8px 30px rgba(0,0,0,.35)` / `0 20px 60px rgba(0,0,0,.5)` |
| `--sf-ease` | `cubic-bezier(.2,.7,.2,1)` (`motion.js EASE = [0.2, 0.7, 0.2, 1]`) |
| `--sf-duration-fast / - / -slow` | `160ms / 320ms / 600ms` (`motion.js DURATION = { fast: .16, base: .32, slow: .6 }`) |
| `--sf-container-max` / `--sf-container-wide` (new) | `1280px` / `1440px` |
| `--sf-tap-target` | `44px` |
| `--sf-z-*` | unchanged (`sticky 40`, `stickybar 60`, `overlay 1000`, `modal 1100`) + `--sf-z-header: 50`, `--sf-z-toast: 1200` |
| Breakpoints (`tokens.js TOKENS.breakpoints`) | `xs 480 · sm 768 · md 1024 · lg 1280 · xl 1440`; QA widths `360, 390, 414, 768, 1024, 1280, 1440` |

## 4. Glassmorphism recipe (`.sf-glass` primitive, Prompt 04)

```css
.sf-glass {
  background: var(--sf-glass-bg);
  -webkit-backdrop-filter: blur(var(--sf-glass-blur));
  backdrop-filter: blur(var(--sf-glass-blur));
  border: 1px solid var(--sf-glass-border);
  box-shadow: var(--sf-shadow-1);
}
.sf-glass--strong { background: var(--sf-glass-bg-strong); }
.sf-glass--scrim::before { /* darker inner scrim for text over imagery */ content: ""; position: absolute; inset: 0; background: rgba(11,11,13,.35); pointer-events: none; }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .sf-glass, .sf-glass--strong { background: var(--sf-glass-fallback); }
}
@media (max-width: 768px) { :root { --sf-glass-blur: 12px; } }
```

Where glass is used: sticky header (transparent over the hero → `.sf-glass--strong` after 24px scroll), product/category/ritual cards, sticky purchase bar, back-to-top, quick-add, search overlay panel, cart drawer, mobile nav drawer, modals, CTA and promo containers, announcement bar (subtle). Rules: max two blurred layers in view (a drawer over a glass header counts as two — the header drops its blur while a drawer is open via `body[data-drawer-open]`); no backdrop blur on full-page scrolling backgrounds; inside long lists (shop chapters) cards use `--sf-color-surface` with a hairline instead of blur; text on glass over imagery gets `.sf-glass--scrim`.

## 5. Ambient glow recipe (`GlowWrap` + `.sf-glow-*`, Prompts 04–05)

```css
.sf-glow { position: relative; isolation: isolate; }
.sf-glow::before { content: ""; position: absolute; z-index: -1; inset: -12% -8%; border-radius: 50%;
  background: var(--sf-glow-pink); filter: blur(60px); opacity: .22; transform: translate(6%, -8%); pointer-events: none; }
.sf-glow--violet::before { background: var(--sf-glow-violet); transform: translate(-8%, 10%); }
.sf-glow--gold::before { background: var(--sf-glow-gold); }
.sf-glow--breathe::before { animation: sf-breathe 10s var(--sf-ease) infinite alternate; }
@keyframes sf-breathe { from { transform: scale(1) translate(6%, -8%); } to { transform: scale(1.06) translate(6%, -8%); } }
@media (prefers-reduced-motion: reduce) { .sf-glow--breathe::before { animation: none; } }
```

`GlowWrap` (`src/components/ui/GlowWrap.js`) props: `tone: "pink" | "violet" | "gold" | "duo"`, `intensity: 0.15–0.30` (sets `--sf-glow-opacity`), `breathe: boolean` (at most one per viewport — the hero owns it on the home page, the full-page CTA owns it further down), `offset: { x, y }`. Glow is placed **behind** hero products, featured products, cards on hover (fade-in 320 ms), CTA containers and the full-page CTA. It is a small blurred element, never another backdrop filter.

## 6. Typography (Prompt 04)

- Display: **Fraunces** (variable; `opsz` 9–144, `wght` 400–600; Google Fonts, `display=swap`), fallback `"Playfair Display", Georgia, "Times New Roman", serif`. Chosen after the packaging review (`PACKAGING_NOTES.md` §0.4): a warm, high-contrast serif that echoes the swash wordmark and stays legible on `#0B0B0D`; set `font-optical-sizing: auto`, `font-variation-settings: "SOFT" 30` for headlines ≥ 40px.
- UI/body: **Manrope** (`wght` 400–700), fallback `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`. (Inter is removed from the font link; Cormorant Garamond is removed.) Material Icons link stays for the admin.
- Load once in `public/index.html` (`<link rel="preconnect">` ×2 + one `css2` link with `display=swap`); `src/index.css` keeps its "do not @import fonts" rule.
- Tokens: `--sf-font-display: "Fraunces", …`, `--sf-font-family: "Manrope", …`. Fluid scale: `--sf-text-xs .75rem`, `-sm .875rem`, `-base 1rem` (min 16px body on mobile), `-md 1.0625rem`, `-lg 1.25rem`, `-xl clamp(1.375rem, 1.1rem + 1vw, 1.75rem)`, `-2xl clamp(1.75rem, 1.3rem + 1.8vw, 2.5rem)`, `-3xl clamp(2.25rem, 1.6rem + 2.6vw, 3.25rem)`, `-4xl clamp(2.75rem, 1.8rem + 4vw, 4.5rem)`, `-5xl clamp(3.25rem, 2rem + 6vw, 6rem)`. Leading: `--sf-leading-display 1.12`, `-tight 1.25`, `-normal 1.5`, `-relaxed 1.65`. Tracking: eyebrows `--sf-tracking-wide .14em` / `-wider .2em`, uppercase, gold. No light-weight text below 14px (`--sf-font-light` is deleted). Chapter numerals ("01 — Cleanse") use Fraunces tabular figures (`font-variant-numeric: tabular-nums`).
- MUI theme typography (ThemeContext): `fontFamily` Manrope; `h1–h3` Fraunces at the token sizes; `button.textTransform: none`, weight 600.

## 7. Components (behaviour + look; React primitives live in `src/components/ui/*`, Prompt 05)

- **Button** (`ui/Button.js`, replaces ad-hoc `.sf-btn--*` usage progressively; primitives keep `.sf-btn` classes): pill radius (`--sf-radius-pill`) system-wide; min-height 44px; variants `primary` (solid gold `--sf-color-cta`, near-black label, hover → `--sf-color-gold-light` + `translateY(-1px)` + `0 8px 24px rgba(245,215,110,.25)`), `secondary` (glass + 1px `--sf-color-border-strong` hairline, warm-white label), `ghost` (text with gradient underline reveal, `background-size` animation), `addToCart` (secondary style whose hairline animates to the signature gradient on hover; states `idle | loading | success` with `aria-live` text "Added"), `icon` (44px glass circle). Focus-visible ring `--sf-shadow-focus`. Disabled = 45 % opacity, `aria-disabled`.
- **Cards** (`ui/GlassCard.js` + `storefront/ProductCard.js`): glass surface, radius `--sf-radius-lg`; product image on a `--sf-color-surface` plate at 1:1 (label card via `cld(url,{crop, ar:"1:1", pad:true})`, `object-fit: contain` — packaging is never cropped by CSS), gold price, concern chips, the three trust badges; hover → 4px lift, border → `--sf-color-border-strong`, glow fade-in; the whole card is not a link — the image and the name are, the buttons are siblings (existing ProductCard DOM order stays).
- **Chips/Badges** (`ui/Chip.js`): `trust` (outlined gold hairline, uppercase tracked `--sf-text-xs`), `concern` (glass, `--sf-concern-*` border/text), `step` (28px circle with a 1px signature-gradient ring via `border-image`/mask, numeral inside), `status` (existing admin/order semantics).
- **SectionHeading** (`ui/SectionHeading.js`): eyebrow (gold, tracked, optional 24px gradient hairline before it) + Fraunces headline + optional one-line lede in `--sf-color-text-secondary`; `align: "left" | "center"`; `as` heading level; consistent `--sf-section-y` rhythm applied by the `.sf-section` primitive.
- **Accordion** (`ui/Accordion.js`): single or multi open, `aria-expanded`/`aria-controls`, chevron rotates, height animates via grid-rows (existing FAQ technique), keyboard ↑/↓/Home/End.
- **Modal** (`ui/Modal.js`) and **Drawer** (`ui/Drawer.js`): `role="dialog" aria-modal`, focus trap + restore, Escape, body scroll lock (`document.body.style.overflow` + `padding-right` compensation), `panel()`/`sheet()` motion, glass surface, close on route change. Existing CartDrawer/SidebarMenu/AuthModal/SearchModal keep their own traps until they migrate.
- **SearchOverlay**, **Toast** (SweetAlert2 skin in `App.css` re-tokenised: glass popup, gold confirm, `--sf-z-toast`), **Skeleton** (`.sf-skeleton` shimmer over `--sf-color-surface-2` → `--sf-color-surface-hover`), **VideoPlayer** (`ui/VideoPlayer.js`: poster, click-to-play badge, mute toggle, `preload="metadata"`, `playsInline`, never autoplay with sound, keyboard: Space/K play-pause, M mute, ←/→ seek 5 s), **CloudinaryImage** (`ui/CloudinaryImage.js`: `src`/`srcSet`/`sizes` from `cld()`, `loading`, `fetchpriority`, explicit `aspectRatio`, `objectFit: "contain"` default for product media on a plate, `onError` → `PLACEHOLDER_IMG`).
- **Forms/inputs**: `--sf-color-surface-2` fields, 1px `--sf-glass-border`, gold focus ring, warm-white text, error text + icon (never colour alone), 44px min height, labels always visible.
- **Price** (`ui/Price.js` wraps `PriceBlock`): numeric → `formatPrice`; `null`/non-numeric → styled "Price on launch" chip (`--sf-color-text-secondary`, hairline) and any Add to Cart it accompanies is disabled with the label "Coming soon".

## 8. Motion principles (`src/theme/motion.js` retuned in Prompt 03)

Durations 160/320/600 ms on `--sf-ease`; scroll-triggered entrances = `reveal()` (fade + 16–24px rise, once, `whileInView`, amount 0.15); hero transitions = crossfade + scale 1.02→1 over 600 ms; parallax ≤ 8px (hero label card on pointer move, desktop only); no bounces; page transition = `pageMotion` (fade + 10px rise) kept. Everything non-essential is disabled under `prefers-reduced-motion: reduce` (the token layer zeroes durations; `useReducedMotion()` gates JS; the hero stops autoplay and crossfades only; `.sf-glow--breathe` stops; confetti is skipped).

## 9. Accessibility on dark (checked in Prompt 38 with axe)

Contrast: `#F7F5F0` on `#0B0B0D` 18.9:1; `#B8B5B0` on `#0B0B0D` 10.5:1; `#F5D76E` on `#0B0B0D` 13.4:1; `#0B0B0D` on `#F5D76E` 13.4:1; `rgba(247,245,240,.62)` ≈ `#9C9B98` on `#0B0B0D` 7.4:1; `#FF4FD8` on `#0B0B0D` 6.9:1 (usable as text, but only for the rare cyan/pink micro-label); never gold on pink/violet. Visible focus everywhere (`--sf-shadow-focus`); carousel `aria-roledescription="carousel"` + `aria-live` region for slide changes + pause control; gallery thumbnails as `role="tablist"`; accordions `aria-expanded`; dialogs `aria-modal`; touch targets ≥ 44×44; one `<h1>` per page, ordered headings, landmarks (`header`, `nav[aria-label]`, `main`, `footer`), alt text from product data (`media[].alt`), skip link retained.

## 10. MUI (storefront) and admin

- Storefront MUI usage is limited to `Header` controls (IconButton, Badge, Avatar, Menu) and `CssBaseline`. ThemeContext builds **one** `createTheme({ palette: { mode: "dark", primary: { main: "#F5D76E", contrastText: "#0B0B0D" }, secondary: { main: "#FF4FD8" }, background: { default: "#0B0B0D", paper: "#141416" }, text: { primary: "#F7F5F0", secondary: "#B8B5B0" } }, shape: { borderRadius: 14 }, typography… })` from `colors.js → DARK` (the `LIGHT` export is deleted).
- Admin: `buildAdminTheme("dark")` only; palette in Prompt 32: `background.default #0B0B0D`, `paper #141416`, `primary #F5D76E` (contrast `#0B0B0D`), `secondary #8B5CF6`, `divider rgba(255,255,255,.08)`, text as above, chips soft-tinted; radius 8/6 kept for density; Inter → Manrope. `App.css` admin blocks collapse to a single `body.admin-area` set. The admin is visually a quieter sibling of the storefront (no glow, no glass except the login card), fully isolated — it never reads storefront tokens.
