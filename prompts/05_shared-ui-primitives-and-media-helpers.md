# Prompt 05 — Shared UI primitives and media helpers

- **Phase:** 0 — Foundations
- **Depends on:** 04
- **Unlocks:** 06, 07, 09
- **Scope:** L
- **Expected files to change/create:** create `src/components/ui/Button.js` (+ `.module.css`), `Chip.js`, `SectionHeading.js`, `GlassCard.js`, `GlowWrap.js`, `Accordion.js`, `Modal.js`, `Drawer.js`, `Skeleton.js`, `Price.js`, `VideoPlayer.js`, `CloudinaryImage.js`, `ContentBlocks.js`, `index.js`; `src/hooks/useScrollLock.js`, `src/hooks/useFocusTrap.js`, `src/hooks/useInView.js`; `src/utils/product.js`, `src/utils/contentBlocks.js`; change `src/components/storefront/PriceBlock.js`, `src/components/storefront/PriceBlock.module.css`, `src/components/storefront/index.js` (re-export nothing new; keep), `src/utils/helpers.js` (`buildCartItem` / `getProductMinPrice` placeholder-aware).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–04 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Build the reusable React layer every later prompt composes on: buttons, chips, section headings, glass cards, glows, accordion, modal, drawer, skeletons, a placeholder-aware price, a keyboard-operable video player, a Cloudinary-aware responsive image, a markdown-lite content renderer, and the product normaliser that keeps `media[]` and `images[]` in sync.

## Pre-flight checks

```bash
ls src/components/ui 2>/dev/null && echo "ui folder already exists — inspect before creating" || echo "ui folder absent (expected)"
grep -n "export const buildCartItem\|export const getProductMinPrice\|export const productPath" src/utils/helpers.js
grep -n "^\.sf-glass\|^\.sf-glow\|^\.sf-plate" src/theme/storefront-primitives.css | head   # primitives from Prompt 04 exist
sed -n 1,60p src/components/storefront/PriceBlock.js
```

## Tasks

1. **Hooks.**
   - `useScrollLock(active)` — sets `document.body.dataset.scrollLock = "1"` and compensates scrollbar width with `padding-right`; restores on cleanup; reference-counted so nested overlays do not unlock early.
   - `useFocusTrap(ref, { active, onEscape, initialFocus })` — Tab/Shift+Tab cycle inside `ref`, Escape → `onEscape`, focus moved into the container on activate and restored to the previously focused element on deactivate. Model it on the existing trap in `src/components/CartDrawer/CartDrawer.js:123-163` (same edge handling).
   - `useInView(ref, { once = true, amount = 0.15 })` — IntersectionObserver wrapper returning `inView`; falls back to `true` where IO is unavailable.
2. **`src/utils/product.js`** (pure functions):
   - `normalizeProduct(raw)` → returns a copy where `media` is an array (built from `images[]` + optional `image` when `media` is missing: each URL → `{ type: "image", url, alt: name }`, first `primary: true`), exactly one `primary` image exists (first image if none flagged), `images` = ordered image URLs with the primary first, `categoryIds` = array (falls back to `[categoryId]`), `concerns/benefits/howToUse/keyIngredients/faqs/badges/packClaims/suitableFor` = arrays (default `[]`; `badges` defaults to `brand.trustBadges`), `priceTBA` = `price == null || !Number.isFinite(Number(price))`, `heroOrder` = number or `null`, `ritualStep` = object or `null`, `shortName` = provided or `name` with a leading "Black Rice " stripped.
   - `syncProductMedia(product)` → the write-side twin: given the admin form's `media[]`, returns `{ ...product, images: <ordered image urls, primary first>, image: <primary url> }`; guarantees one primary; drops rows with empty `url`.
   - `primaryImage(product)`, `productMedia(product)` (normalised list), `productVideos(product)`, `stageSrc(product, { w = 900, ar = "1:1" })` → `cld(primary.url, { crop: primary.crop, ar, pad: true, w })` (falls back to `cld(url, { w })` for non-Cloudinary URLs), `resolvePrice(product)` → `{ known: boolean, price: number|null, comparePrice: number, discount: number }` (uses `getProductMinPrice` when known), `isPriceKnown(product)`, `productAlt(product, media)`.
   - Update `src/utils/helpers.js`: `getProductMinPrice` returns `{ sellingPrice: 0, originalPrice: 0, discount: 0, unknown: true }` when the price is not finite; `buildCartItem` throws `new Error("PRICE_TBA")` when `isPriceKnown(product)` is false (callers disable the button before this can happen); `productPath` unchanged here (Prompt 08).
3. **`src/utils/contentBlocks.js`** — `parseBlocks(text)` turning markdown-lite into `[{ type: "h2"|"h3"|"p"|"ul"|"ol"|"quote"|"callout"|"steps"|"hr", text?, items?, title? }]`. Grammar: `## ` h2, `### ` h3, `> ` quote (consecutive lines join), `- ` unordered items, `1. ` ordered items, `---` hr, `::callout Title` … `::` callout (title + inner paragraphs), `::steps` … `::` (ordered items rendered as the numbered value-chain style), blank line = paragraph break, inline `**bold**` and `[label](href)` (href must start with `/`, `#`, `mailto:`, `tel:` or `https://` — anything else renders as text). `renderInline(text)` returns React nodes (no `dangerouslySetInnerHTML`). Unit-test the parser with a small `src/utils/contentBlocks.test.js` (six cases; runs under `npm test`).
4. **UI components** (each a default export, CSS Modules on tokens/primitives, `className` pass-through, `forwardRef` where a DOM node is useful):
   - `Button` — props `variant: "primary"|"secondary"|"ghost"|"addToCart"|"icon"`, `size: "sm"|"md"|"lg"`, `as` (`"button"`|`"a"`|`Link`), `to`/`href`, `loading`, `success`, `disabled`, `icon` (Iconify id or node), `iconPosition`, `block`, `srLabel` (required for `icon`). `addToCart` renders the three states with `aria-live="polite"` text ("Adding…", "Added"); `loading` sets `aria-busy`. Uses `.sf-btn` classes from the primitives (do not duplicate CSS).
   - `Chip` — `variant: "trust"|"concern"|"step"|"status"|"glass"`, `tone` (concern key or status key), `icon`, `as` (`span`|`button`|`Link`), `active`.
   - `SectionHeading` — `eyebrow`, `title`, `lede`, `align`, `as` (`h1`…`h3`, default `h2`), `id`, `rule` (gradient hairline before eyebrow), `gradientWord` (index of the headline word to wrap in `.sf-gradient-text`, max one), `actions` (right-aligned slot on desktop, stacked on mobile).
   - `GlassCard` — `as`, `strong`, `scrim`, `interactive` (hover lift + glow), `padding: "sm"|"md"|"lg"|"none"`, `glow: "pink"|"violet"|"gold"|"duo"|null`.
   - `GlowWrap` — `tone`, `intensity` (0.15–0.30 → CSS var `--sf-glow-opacity`), `breathe`, `offset: { x, y }` (percent), `size` (percent of the box, default 110), children rendered above the glow (`isolation: isolate`).
   - `Accordion` — `items: [{ id, title, content }]`, `multiple`, `defaultOpen`, `onToggle`; WAI-ARIA: buttons with `aria-expanded`/`aria-controls`, panels `role="region"` `aria-labelledby`, ↑/↓/Home/End move between headers; height animation via `grid-template-rows: 0fr → 1fr` (zero duration under reduced motion). The existing `src/components/FAQ/FAQ.js` is migrated onto it in Prompt 21.
   - `Modal` — `open`, `onClose`, `title` (or `labelledBy`), `size`, `closeOnBackdrop`, portal to `document.body`, `role="dialog" aria-modal="true"`, `useFocusTrap`, `useScrollLock`, framer-motion `overlay()` + `sheet()`, closes on route change (`useLocation`), glass surface, close button (`Button variant="icon"`).
   - `Drawer` — `open`, `onClose`, `side: "left"|"right"|"bottom"`, `title`, `width`, `footer` slot, same a11y as Modal, `panel(reduce, side)` motion, `env(safe-area-inset-*)` padding, sets `body[data-drawer-open]` (the header drops its blur while any drawer is open — Prompt 09 reads it).
   - `Skeleton` — `variant: "text"|"block"|"circle"|"card"`, `lines`, `aspectRatio`; uses `.sf-skeleton`.
   - `Price` — `product` **or** `{ price, comparePrice }`, `size`, `showSavings`, `taxNote`; when the price is unknown renders `<span class="…tba" role="status">Price on launch</span>` and nothing else. Internally uses `PriceBlock`; update `PriceBlock` itself to accept `unknown` and render the same TBA chip so every legacy call site (cards, PDP, offers) is covered.
   - `VideoPlayer` — `src`, `poster`, `title`, `preload="metadata"`, `muted` default true, `controlsVariant: "inline"|"minimal"`, custom overlay: play badge (gold circle, `aria-label="Play {title}"`), mute toggle, progress hairline; keyboard: Space/K play-pause, M mute, ←/→ ±5s, F fullscreen where supported; pauses when scrolled out of view (`useInView`) and on `visibilitychange`; never autoplays with sound; `playsInline`; falls back to native controls if `HTMLMediaElement` errors (`onError` → show poster + "Video unavailable").
   - `CloudinaryImage` — `src`, `alt`, `widths` (default `SRCSET_WIDTHS`), `sizes`, `aspectRatio` (renders a wrapper with `aspect-ratio` to prevent CLS), `fit: "contain"|"cover"`, `plate` (wraps in `.sf-plate`), `crop`, `ar`, `pad`, `priority` (→ `loading="eager"`, `fetchpriority="high"`; React 18.2 warns on the camelCase prop — use the lowercase attribute `fetchpriority` exactly as `HeroSection.js:361` already does), `placeholder` (adds `.sf-placeholder-media`), `onError` → `PLACEHOLDER_IMG`.
   - `ContentBlocks` — `text` (markdown-lite) or `blocks`, `variant: "prose"|"editorial"` (editorial = wider measure, drop-cap on the first paragraph, pull-quote style for `quote`), renders `steps` as the numbered stepper look (`Chip variant="step"` numerals + gradient connectors).
   - `src/components/ui/index.js` re-exports all of the above.
5. **Style sheet** — one CSS module per component, tokens only; shared glass/glow rules come from the primitives (`className="sf-glass"` etc.), not copied.
6. **Playground route (temporary, deleted in Prompt 35)** — add `src/pages/_Playground/Playground.js` rendered at `/_playground` (registered directly in `App.js` inside `StorefrontShell` for now) that mounts every primitive in every state (buttons ×5 variants ×3 states, chips, heading, cards with each glow, accordion, modal/drawer triggers, skeletons, price known/unknown, video player with a placeholder MP4 from `PLACEHOLDER_ASSETS.md`, CloudinaryImage with the Face Wash cover cropped/padded, ContentBlocks with every grammar rule). This is the visual QA surface for Prompts 05–08.

## Design and content specification

Follow `DESIGN_SYSTEM.md` §7 exactly (sizes, radii, states). Breakpoints: components are fluid; `Drawer` is full-width ≤ 480px, 420px wide ≥ 481px (`bottom` side = 85svh max with a grab handle); `Modal` sizes sm 420 / md 640 / lg 880, full-screen sheet ≤ 480px. Focus ring `--sf-shadow-focus` on every interactive element. Motion via `src/theme/motion.js` factories only.

## Data and API changes

None (data helpers only). `normalizeProduct` must tolerate the *current* silk products and the *future* seed alike — verify against both shapes.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: no `dangerouslySetInnerHTML`; no new npm packages (the video player and lightbox are hand-rolled); do not migrate existing components onto the primitives yet (that happens per feature prompt) except `PriceBlock`.

## Acceptance criteria

- [ ] `/_playground` renders every primitive with no console warnings (incl. no React `fetchPriority` warning).
- [ ] Keyboard: Modal/Drawer trap focus, Escape closes, focus returns; Accordion arrow keys work; VideoPlayer keys work; every control has a visible focus ring.
- [ ] `Price` shows "Price on launch" for `{ price: null }` and a formatted price for numbers; `PriceBlock` legacy call sites still render.
- [ ] `normalizeProduct` round-trips a current db.json product (images-only) and a `media[]` product; `syncProductMedia` rebuilds `images[]` with the primary first (add cases to `src/utils/product.test.js`, ≥ 6 assertions).
- [ ] `contentBlocks.test.js` passes; `npm test -- --watchAll=false` shows 2 suites passing, 1 skipped.
- [ ] Reduced motion: no transitions on cards/buttons, accordion height snaps, glow static.
- [ ] `CI=true npm run build` passes.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
ls src/components/ui | sort | tr '\n' ' '
grep -rn "dangerouslySetInnerHTML" src/components/ui src/utils | wc -l   # 0
npm run dev   # open http://localhost:3000/_playground
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440 on `/_playground`: drawer from each side, modal sizes, video player controls reachable with thumb, plate images contain-fit without white edges (Body Wash crop), content blocks measure ≤ 68ch.

## Handoff

1. `PROGRESS.md`: row 05 → `complete`; Decisions log: any prop-contract changes vs this prompt; note `/_playground` as a temporary route (owner: Prompt 35 deletes it).
2. `DESIGN_SYSTEM.md` §7: append the final prop contracts ("Updated by Prompt 05").
3. Commit: `feat(lamikaa): 05 shared ui primitives and media helpers`.
