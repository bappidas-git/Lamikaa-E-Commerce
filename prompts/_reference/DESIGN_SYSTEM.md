# DESIGN_SYSTEM — "Luxury Skincare After Dark", adapted to this repository

> ## ⚠ AMENDED — the storefront is LIGHT now ("Black Rice in Daylight")
>
> Everything below records the original brief and the prompts that built it, and
> it is still the right reference for **structure**: the token NAMES, the glass
> and glow recipes, the type scale, the component behaviours and the budgets are
> all unchanged. What changed is the **values**.
>
> The storefront ground is a warm cream (`#F8F3EA`) under espresso type
> (`#1B1714`), and the accent that carries every role champagne gold used to
> carry — eyebrows, prices, links, the CTA fill — is an antique gold
> (`#8C6410`) deep enough to read on it. Champagne gold at 1.4:1 on cream is a
> watermark, so it did not survive the move as an ink.
>
> It did survive as the CHROME. `.sf-on-dark` is a token scope declared
> alongside `:root` in `src/theme/storefront-tokens.css`: it re-points the
> colour half of the token set back onto `#0B0B0D` with `#F5D76E` on it — the
> exact palette in §2 below — and it is worn by the announcement band, the
> masthead and its mega panel, the mobile nav drawer, the bottom bar, the footer
> and the PDP lightbox. The golden LAMIKAA lockup has no light-ground variant,
> so wherever it appears the ground comes to it: inside that scope for the
> chrome, and on `.sf-lockup-plate` for the two places it lands on the page (the
> auth dialog and the empty-catalogue brand hero).
>
> **Read §2 below as the values of `.sf-on-dark`, not of `:root`.** The live and
> authoritative table for both surfaces is the comment block at the top of
> `src/theme/storefront-tokens.css`; `src/theme/colors.js` mirrors the light set
> for MUI. Three sentences in §1 are simply superseded — `html { color-scheme }`
> is `light`, `:root` is the light set, and `--sf-color-overlay` has split into
> a page-following label plate (`--sf-color-overlay`) and an always-dark modal
> backdrop (`--sf-color-scrim`). `meta[name=theme-color]` stays `#0B0B0D`
> because it colours the browser chrome above the near-black band, not the page.
>
> Unchanged and still non-negotiable: one theme, no toggle, no stored
> preference, no `body.light` / `body.dark`, no hard-coded colour in a component.

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

**Updated by Prompt 04.** Implemented as specified, with three recorded departures and one measurement:

- **`font-variation-settings: "SOFT" 30` is NOT shipped.** The font link this section specifies requests `Fraunces:opsz,wght@…`, and the file Google serves for it carries exactly those two axes (verified with fontTools: `fvar` = `opsz 9–144`, `wght 100–900`) — no `SOFT`. Declaring it would be inert CSS that reads as a promise. Delivering it means requesting the axis (`family=Fraunces:opsz,wght,SOFT@9..144,400,30;9..144,500,30;9..144,600,30`), which returns a genuine three-axis file and takes the **latin subset from 67 KB to 121 KB** — +54 KB on the storefront's largest font asset for a terminal rounding visible only at `h1`/`h2` sizes. Not taken; the trade is documented at the heading block in `src/index.css` and reverses in two lines.
- **Weight tokens.** `--sf-font-light` deleted, its 29 consumers moved to `--sf-font-normal` (400). Remaining tiers: `normal 400` · `medium 500` (the display weight) · `semibold 600` (the UI weight) · `bold 700`.
- **Base layer** (`src/index.css`): `html { color-scheme: dark; scroll-behavior: smooth }` with `scroll-behavior: auto` under `prefers-reduced-motion`; `body` = Manrope 400 / `--sf-text-base` / `--sf-leading-normal` on `--sf-color-bg`; **all six heading levels default to `--sf-font-display` at weight 500 with `font-optical-sizing: auto` and `overflow-wrap: anywhere`** (`anywhere`, not `break-word`, so a heading also stops forcing a flex/grid track wider than the viewport); `h1, h2` add `--sf-tracking-tight`; `::selection` = gold ground / near-black type, storefront only; `body[data-scroll-lock] { overflow: hidden }` is the shared overlay hook.
- **MUI typography reads the tokens directly** (`fontFamily: "var(--sf-font-family)"`, `h1–h4` at `var(--sf-text-5xl/4xl/3xl/2xl)`) rather than mirroring the values as numbers. `src/index.css` is imported by `src/index.js` before React mounts, and MUI passes a typography `fontSize` through to CSS untouched — unlike `palette`, which computes alpha variants and therefore still mirrors `colors.js`. `button` = `textTransform: none`, weight 600, `letter-spacing .02em`. `adminTheme.js` takes the Manrope stack literally (the admin never reads storefront tokens); its palette is untouched until Prompt 32.
- **Measured at 360 px with the real faces loaded** (Fraunces + Manrope served locally to defeat a sandboxed font CDN): no horizontal document overflow on home, shop, PDP, checkout, about or admin at 360 / 390 / 768 / 1280 px, and **no scale token needed adjusting**. Display sizes at 360 px land at `4xl` 44 px (hero headline 40 px, its own clamp) and `5xl` 53.6 px; every `h1`/`h2` measured `scrollWidth === clientWidth`.

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

**Updated by Prompt 04.** The global primitive layer these React components will compose on now exists in `src/theme/storefront-primitives.css` and is documented in that file's header comment. Final class list — the names are the contract; restyle in place, never rename:

| Group | Classes |
|---|---|
| Layout | `.sf-section` · `.sf-section--tight` (60 % of `--sf-section-y`) · `.sf-container` · `.sf-container--wide` |
| Surface | `.sf-glass` · `.sf-glass--strong` · `.sf-glass--scrim` · `.sf-plate` · `.sf-hairline` · `.sf-hairline--gradient` |
| Glow | `.sf-glow` · `.sf-glow--violet` · `.sf-glow--gold` · `.sf-glow--duo` · `.sf-glow--breathe` |
| Type | `.sf-gradient-text` · `.sf-eyebrow` · `.sf-eyebrow--rule` · `.sf-numeral` · `.sf-visually-hidden` |
| Media | `.sf-placeholder-media` |
| Buttons | `.sf-btn` · `--emerald` · `--gold` · `--outline-gold` · `--ghost` · `--sm` · `--lg` · `--block` |
| Chips | `.sf-chip` · `.sf-chip--active` · `.sf-badge-discount` · `.sf-pill-save` · `.sf-ribbon-premium` · `.sf-flag` · `.sf-flag-trending` · `.sf-flag-hot` |
| Card | `.sf-card` · `.sf-card--hover` |
| Skeleton | `.sf-skeleton` · `.sf-skeleton--text` · `.sf-skeleton--block` |
| Toast | `.sf-toast` · `--success` · `--error` · `--info` · `.sf-toast__title` · `.sf-toast__body` |

Notes that bind later prompts:

- **Pills, sentence case.** Every button, chip, badge, ribbon and flag is `--sf-radius-pill`; `.sf-btn` is Manrope 600 at `letter-spacing .02em` with `text-transform: none`. The tracked uppercase label survives in exactly one place — `.sf-eyebrow`.
- **`.sf-btn--gold` is an alias of `.sf-btn--emerald`**, not a second look. Both are the gold fill under `--sf-color-primary-contrast`, hovering to `--sf-color-gold-light` with `0 8px 24px` of 25 % gold. Every button hovers `translateY(-1px)` and presses back to `translateY(0)` at 92 % opacity.
- **Glow offsets are custom properties** (`--sf-glow-x` / `--sf-glow-y`) so the `sf-breathe` keyframe can scale a glow without discarding where it was placed; intensity is `--sf-glow-opacity` (default `.22`), which is the hook `GlowWrap` sets for `intensity`.
- **`.sf-flag-hot` lightens its label** — `color-mix(in srgb, var(--sf-concern-violet) 78%, var(--sf-color-text))`. Violet is the one concern accent that fails AA as 12 px text on its own 10 % tint (4.1:1 measured on `--sf-color-surface`); the mix restores 5.9:1 at the same hue, and the tint and hairline stay pure violet.
- **`.sf-chip` is 13 px / weight 500 / 36 px tall**, but `button.sf-chip` and `a.sf-chip` keep `min-height: var(--sf-tap-target)`. An interactive chip is 44 px, deliberately taller than its resting height.
- **The ≤ 768 px blur reduction is not restated in the primitives** — `--sf-glass-blur` itself drops to 12 px under that breakpoint in `storefront-tokens.css`, which reaches every consumer at once.
- **SweetAlert2** (`App.css`): popup ground `color-mix(in srgb, var(--sf-color-surface) 94%, transparent)` behind `backdrop-filter: blur(16px)` (16 px, not `--sf-glass-blur`: the popup already sits on its own scrim), `--sf-glass-border` hairline, `--sf-radius-lg`, gold confirm pill / glass cancel pill, Fraunces title, gold timer bar, and a toast that is one radius step down with the gold left rule from `.sf-toast`. `@supports not (backdrop-filter)` falls back to `--sf-glass-fallback`. `.swal2-container` stacks at `max(var(--sf-z-toast), 2000)` — the toast tier stays in the expression, and 2000 is the floor Swal needs to clear MUI's Dialog at 1300.


**Updated by Prompt 05.** The React layer now exists in `src/components/ui/*` (thirteen components, one `index.js` barrel, twelve CSS modules — `Price` has none, see below). These are the FINAL prop contracts; a later prompt restyles in place and never renames a prop.

| Component | Props |
|---|---|
| `Button` | `variant: "primary"\|"secondary"\|"ghost"\|"addToCart"\|"icon"` · `size: "sm"\|"md"\|"lg"` · `as` · `to` · `href` · `loading` · `success` · `disabled` · `icon` (Iconify id or node) · `iconPosition: "left"\|"right"` · `block` · `srLabel` (**required** for `icon`) · `className` · `ref` |
| `Chip` | `variant: "trust"\|"concern"\|"step"\|"status"\|"glass"` · `tone` · `icon` · `as` · `active` · `className` · `ref` |
| `SectionHeading` | `eyebrow` · `title` · `lede` · `align: "left"\|"center"\|"right"` · `as` (`h1`–`h3`, default `h2`) · `id` · `rule` · `gradientWord` (word INDEX, at most one) · `actions` · `className` |
| `GlassCard` | `as` · `strong` · `scrim` · `interactive` · `padding: "none"\|"sm"\|"md"\|"lg"` · `glow: "pink"\|"violet"\|"gold"\|"duo"\|null` · `className` · `ref` |
| `GlowWrap` | `as` · `tone: "pink"\|"violet"\|"gold"\|"duo"` · `intensity` (clamped to 0.15–0.30) · `breathe` · `offset: {x, y}` in % · `size` (% of the box, default 110) · `className` · `ref` |
| `Accordion` | `items: [{ id, title, content }]` · `multiple` · `defaultOpen` (id or id[]) · `onToggle(id, isOpen)` · `headingLevel` (default `h3`) · `className` |
| `Modal` | `open` · `onClose` · `title` · `labelledBy` · `describedBy` · `size: "sm"\|"md"\|"lg"` (420 / 640 / 880) · `closeOnBackdrop` · `showClose` · `footer` · `className` |
| `Drawer` | `open` · `onClose` · `side: "left"\|"right"\|"bottom"` · `title` · `labelledBy` · `width` (default `420px`) · `closeOnBackdrop` · `showClose` · `footer` · `className` |
| `Skeleton` | `variant: "text"\|"block"\|"circle"\|"card"` · `lines` · `aspectRatio` · `width` · `height` · `className` |
| `Price` | `product` **or** `price`/`comparePrice` · `size: "sm"\|"md"\|"lg"` · `showSavings` · `taxNote` · `className` |
| `VideoPlayer` | `src` · `poster` · `title` · `preload` (default `"metadata"`) · `muted` (default `true`) · `controlsVariant: "inline"\|"minimal"` · `className` |
| `CloudinaryImage` | `src` · `alt` · `widths` (default `SRCSET_WIDTHS`) · `sizes` · `aspectRatio` · `fit: "contain"\|"cover"` · `plate` · `crop` · `ar` · `pad` · `priority` · `placeholder` · `className` · `imgClassName` · `onError` · `ref` |
| `ContentBlocks` | `text` **or** `blocks` · `variant: "prose"\|"editorial"` · `className` |

Hooks (`src/hooks/*`): `useScrollLock(active)` — reference-counted `body[data-scroll-lock]` plus scrollbar-width compensation, so nested overlays cannot unlock early. `useFocusTrap(ref, { active, onEscape, initialFocus })` — the CartDrawer trap lifted verbatim, including its edge case (the panel itself holds focus on open and counts as outside the ring, so the first Tab lands on the FIRST control). `useInView(ref, { once, amount })` — reports `true` where IntersectionObserver is unavailable.

Departures and additions to the sections above, all recorded in `PROGRESS.md`:

- **Where a card's glow lives.** `.sf-card--hover` already owns the card's `::before` (its gold hover lamp), and an element has only one. `GlassCard`'s `glow` prop therefore renders a DEDICATED inert `z-index: -1` child; putting `.sf-glow` on the card itself made the two rules fight over one pseudo-element and the hover rule — declared later in the sheet — won, silently disabling the tone. The child is clipped by `.sf-card`'s `overflow: hidden`, exactly as the hover lamp already is: a card wants light inside it, not a halo around it.
- **A glow bleeds, so its host clips.** `.sf-glow::before` extends past its box by design, and wherever the container fills the viewport that bleed becomes document overflow (measured: 443px of scroll at a 360px viewport). **Any section that hosts a `GlowWrap` sets `overflow-x: clip`** — `clip`, not `hidden`, so no scroll container is created and `position: sticky` inside still works. It is deliberately NOT on `.sf-section` / `.sf-container`: a full-bleed hero or a deliberately overflowing carousel inside one would be clipped with it.
- **The glow's offsets are now overridable from the host element.** `.sf-glow::before` DECLARED `--sf-glow-x/-y` on the pseudo-element, which beats anything inherited, so §5's promise that `GlowWrap` can place a lamp could not be kept. The per-tone values are now `var(--sf-glow-offset-x, <the same default>)`, and `inset` is `var(--sf-glow-inset, -12% -8%)`. A bare `.sf-glow` is unchanged; `--sf-glow--duo`'s second lamp MIRRORS the caller's offset so the pair separates rather than stacking.
- **`PriceBlock` defaults to "Price on launch" for any non-positive price**, not only when `unknown` is passed. Its legacy call sites hand it `getProductMinPrice().sellingPrice`, which is `0` for an unpriced product, so an opt-in prop would have covered none of them until each was migrated. Nothing on this storefront is free; a caller that genuinely means zero passes `unknown={false}`.
- **`Price` is the one component with no CSS module.** It is a thin adapter over `PriceBlock` and renders no markup of its own, so its styles — the "Price on launch" chip included — live in `PriceBlock.module.css`, beside the markup that uses them.
- **Markdown-lite** (`src/utils/contentBlocks.js`): `## ` h2 · `### ` h3 · `- ` ul · `1. ` ol · `> ` quote (consecutive lines join) · `---` hr · `::callout Title` … `::` · `::steps` … `::` · blank line ends a block · inline `**bold**` and `[label](href)`. A safe `href` starts with `/`, `#`, `mailto:`, `tel:` or `https://`; anything else (`http://` included) renders as its own SOURCE TEXT, so the author sees the mistake in the admin preview rather than shipping a dead link. Off-site links get `rel="noreferrer"` and no `target`. No raw markup is ever produced — every node is a React element, which is what the zero-result grep in the Prompt 05 verification checks.
- **A collapsed `Accordion` panel is `visibility: hidden`**, not `inert`: its links and buttons must leave the tab order in every browser, and visibility transitions discretely so it can be delayed until the collapse finishes.
- **`Chip variant="concern"`** hashes an unrecognised `tone` onto the six `--sf-concern-*` accents (stable across pages and reloads). There is no slug→colour table because concerns are owner-editable data; Prompt 15 passes an explicit `tone` where it wants one.
- **`Drawer` sets `body[data-drawer-open]`** (reference-counted). Prompt 09's header reads it and drops its backdrop blur while a drawer is up — that is how the two-blurred-layers budget in §4 is kept without either component knowing about the other.
- **`VideoPlayer`'s progress hairline is decorative** (`aria-hidden`); the keyboard set — Space/K play-pause, M mute, ←/→ ±5s, F fullscreen where supported — is the real interface. It never autoplays, pauses when it scrolls out of view and when the tab is hidden, and on `error` shows the poster under a "Video unavailable" line WITH the browser's native controls handed over.
- **`CloudinaryImage` writes `fetchpriority` in lowercase.** React 18.2 does not know the camelCase prop and warns on it; the lowercase attribute passes straight through, as `HeroSection.js:384` already does.

## 8. Motion principles (`src/theme/motion.js` retuned in Prompt 03)

Durations 160/320/600 ms on `--sf-ease`; scroll-triggered entrances = `reveal()` (fade + 16–24px rise, once, `whileInView`, amount 0.15); hero transitions = crossfade + scale 1.02→1 over 600 ms; parallax ≤ 8px (hero label card on pointer move, desktop only); no bounces; page transition = `pageMotion` (fade + 10px rise) kept. Everything non-essential is disabled under `prefers-reduced-motion: reduce` (the token layer zeroes durations; `useReducedMotion()` gates JS; the hero stops autoplay and crossfades only; `.sf-glow--breathe` stops; confetti is skipped).

## 9. Accessibility on dark (checked in Prompt 38 with axe)

Contrast: `#F7F5F0` on `#0B0B0D` 18.9:1; `#B8B5B0` on `#0B0B0D` 10.5:1; `#F5D76E` on `#0B0B0D` 13.4:1; `#0B0B0D` on `#F5D76E` 13.4:1; `rgba(247,245,240,.62)` ≈ `#9C9B98` on `#0B0B0D` 7.4:1; `#FF4FD8` on `#0B0B0D` 6.9:1 (usable as text, but only for the rare cyan/pink micro-label); never gold on pink/violet. Visible focus everywhere (`--sf-shadow-focus`); carousel `aria-roledescription="carousel"` + `aria-live` region for slide changes + pause control; gallery thumbnails as `role="tablist"`; accordions `aria-expanded`; dialogs `aria-modal`; touch targets ≥ 44×44; one `<h1>` per page, ordered headings, landmarks (`header`, `nav[aria-label]`, `main`, `footer`), alt text from product data (`media[].alt`), skip link retained.

## 10. MUI (storefront) and admin

- Storefront MUI usage is limited to `Header` controls (IconButton, Badge, Avatar, Menu) and `CssBaseline`. ThemeContext builds **one** `createTheme({ palette: { mode: "dark", primary: { main: "#F5D76E", contrastText: "#0B0B0D" }, secondary: { main: "#FF4FD8" }, background: { default: "#0B0B0D", paper: "#141416" }, text: { primary: "#F7F5F0", secondary: "#B8B5B0" } }, shape: { borderRadius: 14 }, typography… })` from `colors.js → DARK` (the `LIGHT` export is deleted).
- Admin: `buildAdminTheme("dark")` only; palette in Prompt 32: `background.default #0B0B0D`, `paper #141416`, `primary #F5D76E` (contrast `#0B0B0D`), `secondary #8B5CF6`, `divider rgba(255,255,255,.08)`, text as above, chips soft-tinted; radius 8/6 kept for density; Inter → Manrope. `App.css` admin blocks collapse to a single `body.admin-area` set. The admin is visually a quieter sibling of the storefront (no glow, no glass except the login card), fully isolated — it never reads storefront tokens.

---

**Updated by Prompt 37.** The responsive and mobile QA pass changed four things the rest of the
programme has to know about. The measurements behind each are in `QA_MATRIX.md`.

1. **The token layer now has a PRINT half.** `storefront-tokens.css` closes with an `@media print`
   block that re-points the whole `--sf-*` palette to ink on paper — white grounds, three grey ink
   tiers, one deep gold at 7.9:1 on white (champagne gold is 1.5:1 there and prints as nothing),
   semantic inks without their tints, and `none` for every shadow, glow and gradient. Every module
   therefore prints correctly through the tokens it already reads, and **no component may add a print
   rule that hardcodes a colour**. Two consequences are handled where they arise: `.sf-gradient-text`
   un-clips itself in print (a `-webkit-text-fill-color: transparent` headline over an unprinted
   background is a blank line), and `App.css` re-states the ink at `html body`, because MUI's
   `CssBaseline` emits a bare `body` rule after that sheet carrying the palette's literal warm white.
   Each piece of fixed chrome hides itself on paper in its own stylesheet — masthead, announcement
   band, mega panel, trust strip, footer, tab bar, PDP purchase bar, cart bar.

2. **The touch-target idiom has a rule now.** Growing a small control's hit area with an inert
   absolutely-positioned `::before`/`::after` is still the default, but it only works where **nothing
   between the control and the viewport clips**. Measurement found three places where it silently did
   not: a horizontal scroller (`overflow-x: auto` makes the Y axis `auto` too), a `GlassCard` (which
   clips to its radius) and any `-webkit-line-clamp` box (which *requires* `overflow: hidden`). In
   those, the control takes a real `min-height`/`min-width` instead — an element's own border box
   cannot be clipped out of existence. And state the band's `height`/`width` outright rather than
   insetting it: `inset` resolves against the positioned ancestor's PADDING box, so a bordered control
   gets a band two pixels short of the figure the code says.

3. **`env(safe-area-inset-top)` has an owner.** The announcement band takes it (it is the first thing
   in the document, so it is what a notch covers) and the header takes it while pinned, through a
   `.pinned` class `Header.js` sets from the `scrolled` state it already tracks. Every gutter that has
   to survive a device inset is written as a **longhand** — a later `padding` shorthand silently zeroes
   it, which is exactly what the band's phone rule was doing.

4. **The admin's touch floor is keyed to the pointer, not the width.** `@media (pointer: coarse)` at
   44px across `Button`, `IconButton`, `ListItemButton`, `InputBase`, `Chip` (clickable and deletable
   only), `ToggleButton`, `Tab`, `FormControlLabel` and `Switch`. A 1024px tablet is touched; a narrow
   desktop window is not. The field's floor goes on the `InputBase` **root**, which is the visible
   control and focuses the field from anywhere inside it.

One structural figure moved and is worth knowing: the shop/category chapter strip keeps its 52px
(≥769) and 48px (≤768) heights, but its inner `padding-block` drops to 4px/2px so the pill rail can
reserve the full 44px its touch overlay needs. **The sticky offsets measured against that band — the
chapter media's `top: 112px`, the FAQ and policy indexes' `calc(100vh - 132px)` — are unchanged.**
