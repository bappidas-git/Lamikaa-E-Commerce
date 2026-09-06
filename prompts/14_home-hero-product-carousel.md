# Prompt 14 — Home hero product carousel

- **Phase:** 2 — Home page
- **Depends on:** 13
- **Unlocks:** 15
- **Scope:** L
- **Expected files to change/create:** create `src/components/home/HeroCarousel.js` (+ `HeroCarousel.module.css`), `src/components/home/HeroIndex.js`; delete `src/components/HeroSection/HeroSection.js` and `HeroSection.module.css`; change `src/pages/Home/Home.js` (render `HeroCarousel` in place of `HeroSection`; nothing else yet), `src/utils/heroConfig.js` (`normalizeHeroConfig` gains `source`, `showPause`; slide helpers marked `@deprecated` — removed in Prompt 34), `src/components/Header/Header.js` (verify the `#hero-sentinel` observer works).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`, `PACKAGING_NOTES.md`. Confirm that prompts 01–13 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Replace the admin-banner hero with a product-driven carousel: one slide per hero product (eight at launch), each with the label card on a glowing plate, an emotional headline, a one-to-two-line subtext and two CTAs (Explore → PDP, Add to Cart → quick add), with autoplay, swipe, arrow keys, an index of product names, full ARIA, LCP-optimised first image and reduced-motion behaviour.

## Pre-flight checks

```bash
grep -n "getHeroProducts\|hero: {" src/services/api.js
node -e "const db=require('./db.json'); console.log(db.products.map(p=>[p.heroOrder,p.slug,p.priceTBA]).sort((a,b)=>a[0]-b[0]))"
grep -n "HeroSection" src/pages/Home/Home.js src/components/Header/Header.js
grep -n "stageSrc\|export const productVideos" src/utils/product.js
```

## Tasks

1. **Data** — `HeroCarousel` loads `apiService.products.getHeroProducts()` and `apiService.hero.getConfig()` in parallel; config through `normalizeHeroConfig` (add `source: "products"`, `showPause: true`; keep `enabled`, `autoplay`, `intervalMs` (default 6500, clamp 3000–15000 for this hero), `transition` (`fade`|`none`), `pauseOnHover`, `showControls`, `showCounter`, `showProgress`, `showArrows`). Fallbacks: no hero products → `products.getFeatured(8)`; still none → a single **brand slide** (wordmark, master tagline, "Shop the Black Rice Range" → `/shop`) — never a fake product. `enabled: false` → render only a visually hidden `h1` with `brand.name` (existing behaviour) plus the brand slide.
2. **Slide anatomy** (per product `p`, index `i`, total `n`): eyebrow `Black Rice Ritual · {String(i+1).padStart(2,"0")} / {String(n).padStart(2,"0")}`; headline `p.heroHeadline` (fallback `p.promise`); subtext `p.heroSubtext` (fallback `p.shortDescription`); CTAs: `Button variant="primary" size="lg"` **"Explore the {p.shortName}"** → `productPath(p)`; `Button variant="addToCart" size="lg"` **"Add to Cart"** → `addToCart(buildCartItem(p), 1)` (toast + drawer via CartContext), `disabled` with label **"Coming soon"** when `p.priceTBA`; `Price product={p}` beneath the headline (small); trust badges row (`Chip variant="trust"` × `p.badges`). Media: the label card — `CloudinaryImage` with `crop={primary.crop}`, `ar="4:5"`, `pad`, `fit="contain"`, `plate`, `widths=[480,768,1080]`, `sizes="(max-width: 768px) 80vw, 40vw"`, inside `GlowWrap tone="duo" intensity={0.24} breathe` (the only breathing glow above the fold), plus a `≤ 8px` pointer parallax on desktop (`pointer: fine`, not reduced motion). Alt from `productAlt(p, primary)`.
3. **Copy rendering strategy** — media stacks per slide (crossfade + 1.02→1 scale, 600 ms), copy rendered **once** and updated in place (the pattern the old hero used, `HeroSection.js:396-433`): the headline is the page's single `h1`; the copy container is `aria-live="polite"` only while autoplay is paused/stopped. Each media layer is `role="group" aria-roledescription="slide" aria-label="{i+1} of {n}: {p.name}"`; the section is `aria-roledescription="carousel" aria-label="Black Rice range"`.
4. **Controls (`HeroIndex`)** — a rail under the copy on desktop (left column) and under the card on mobile: prev/next arrows (44px glass circles, shown when `showArrows`), a **pause/play** button (always present when autoplay is on — WCAG 2.2.2), the counter `01 / 08` (when `showCounter`), the progress hairline (gradient, restarts per slide, frozen while paused, hidden when `showProgress` is false or under reduced motion), and the product-name index: eight `button`s (`aria-current` on the active one, gold gradient underline) — horizontal scroll with snap on mobile, wrapped two rows on desktop. Keyboard: ←/→ move slides when focus is inside the carousel; Home/End jump; the index buttons are `role="tab"`-free plain buttons (simpler, robust) with `aria-label="Show slide 3: Black Rice Body Wash"`.
5. **Autoplay** — timer = `intervalMs`; banked-time pause (reuse the old `remainingRef` logic) on hover (when `pauseOnHover`), on focus within, on `document.visibilitychange` hidden, while the pause button is toggled, and while any drawer/overlay is open (`body[data-drawer-open]`). Never autoplays under `prefers-reduced-motion` (crossfade only; the pause button is hidden; arrows/index remain).
6. **Touch** — pointer-event swipe on the media stage (40px horizontal threshold, vertical scroll unaffected via `touch-action: pan-y`); the media stage itself is not focusable (controls are).
7. **Layout** — desktop (≥ 1025px): two columns `1.05fr 1fr`, copy left, card right (card max 560px, centred vertically), section `min-height: calc(100svh - 100px)` with `calc(100vh - 100px)` fallback, `padding-top: 24px`; tablet (769–1024): same split with the card at 420px; mobile (≤ 768): card first (80vw, max 420px, 1:1 plate via `ar="1:1"`), then copy (headline `--sf-text-4xl`, subtext 16px), CTAs full-width stacked, index rail below; `min-height` unset on mobile (content-driven). A `<div id="hero-sentinel" aria-hidden>` sits at the very top so the header goes transparent while it is in view.
8. **Ground** — the page ground shows through; a faint radial gold glow (`.sf-glow--gold`, opacity .12, non-breathing) top-left behind the copy on desktop only; no imagery behind the hero; no scrim.
9. **Performance** — first slide media `priority` (eager + `fetchpriority="high"`), other slides `loading="lazy"` and rendered only after first paint (mount them in a `requestIdleCallback`/`setTimeout(0)` pass); `aspect-ratio` on the plate to avoid CLS; the copy block reserves min-heights for headline/subtext (`min-height: 3.2em / 2.4em`) so slide changes do not shift the CTAs.
10. **Removal** — delete `src/components/HeroSection/*`; `Home.js` renders `<HeroCarousel />` at the top (keep the rest of the old home for now); `heroConfig.js`: mark `DEFAULT_HERO_SLIDE`, `normalizeHeroSlide(s)`, `HERO_FALLBACK_SLIDES`, `HERO_FALLBACK_IMAGE`, `HERO_BACKGROUND_TYPES`, `HERO_IMAGE_POSITIONS`, `HERO_TEXT_ALIGNMENTS`, `HERO_DEVICES`, `heroStageVars`, `heroSlideDuration`, `heroSlideOverlay` as `@deprecated — removed in Prompt 34` (the temporary admin screen still imports them) and rewrite `HERO_FALLBACK_IMAGE`'s Meghali placeholder text to a neutral `https://picsum.photos/seed/lamikaa-hero-fallback/1600/900` right now.

## Design and content specification

- Type: eyebrow gold tracked 12px; headline Fraunces `--sf-text-5xl` (desktop) / `--sf-text-4xl` (mobile), `max-width: 12ch`; subtext Manrope 18/16px `--sf-color-text-secondary`, `max-width: 42ch`; CTAs pill 52px; badges row 12px.
- Card: `.sf-plate` (surface, hairline, radius `--sf-radius-xl`), contain-fit label crop, `--sf-shadow-2`, glow duo behind (pink top-right, violet bottom-left) at .24.
- Motion: crossfade 600 ms `--sf-ease` + scale 1.02→1; copy swap = fade 320 ms (text is replaced, never slid); progress hairline linear; index underline 160 ms.
- Copy source: `PRODUCTS.md` §4 lives in the products' `heroHeadline/heroSubtext` (seeded) — do not hard-code copy in the component.
- Breakpoint checks: 360 (headline 3 lines max at 12ch), 390, 414, 768, 1024, 1280, 1440 (card ≤ 560px, no empty right gutter > 96px).

## Data and API changes

Reads: `products.getHeroProducts`, `hero.getConfig`, `products.getFeatured`. Writes: none (Add to Cart is client state). Admin: the hero order/copy are edited on products (Prompt 33/34).

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: no carousel library; the label artwork is never cropped by CSS (only by the Cloudinary `crop` rectangle, then padded); one `h1` on the page; no autoplay without a visible pause control.

## Acceptance criteria

- [ ] Eight slides in `heroOrder`, each with the correct headline/subtext/CTAs; Explore lands on the PDP; Add to Cart opens the drawer with the right line (disabled "Coming soon" for TBA products).
- [ ] Autoplay every ~6.5 s; pauses on hover/focus/hidden tab/pause button/drawer open; swipe and arrow keys work; index buttons jump; progress hairline reflects the timer.
- [ ] Screen reader: carousel role description, slide labels, live headline when paused, controls labelled.
- [ ] Lighthouse mobile (DevTools, `/`): LCP element is the first label card image, loaded eagerly with high priority; CLS < 0.05 for the hero.
- [ ] Reduced motion: no autoplay, crossfade only, no breathing/parallax.
- [ ] Header is transparent over the hero and glass once scrolled past the sentinel.
- [ ] `src/components/HeroSection` deleted; `grep -rn "HeroSection\|banners" src` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
test ! -d src/components/HeroSection && echo "old hero removed"
grep -rn "HeroSection" src | wc -l    # 0
npm run dev   # Lighthouse (mobile) on /; DevTools Performance: confirm fetchpriority=high on the first image
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 as specified; keyboard-only run; VoiceOver/NVDA pass on the carousel; `prefers-reduced-motion`.

## Handoff

1. `PROGRESS.md`: row 14 → `complete`; Decisions log: interval clamp, fallback behaviour, parallax amount.
2. `REPO_MAP.md` §5 "Updated by Prompt 14" (HeroCarousel/HeroIndex contracts; HeroSection removed).
3. Commit: `feat(lamikaa): 14 home hero product carousel`.
