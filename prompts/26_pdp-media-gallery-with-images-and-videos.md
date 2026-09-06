# Prompt 26 — PDP: media gallery with images and videos

- **Phase:** 3 — Catalogue
- **Depends on:** 25
- **Unlocks:** 27, 33
- **Scope:** L
- **Expected files to change/create:** create `src/components/pdp/MediaGallery.js` (+ `MediaGallery.module.css`), `src/components/pdp/Lightbox.js` (+ `.module.css`), `src/hooks/useSwipe.js`; delete `src/components/storefront/ProductGallery.js` and `ProductGallery.module.css`; change `src/components/storefront/index.js` (remove the export), `src/pages/ProductDetails/ProductDetails.js` (mount the gallery), `src/theme/tokens.js` (`STOREFRONT_CONFIG.gallery` → `{ zoom: true, lightbox: true }`).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`, `PACKAGING_NOTES.md`. Confirm that prompts 01–25 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Build the product media gallery from `product.media`: a thumbnail rail mixing image and video thumbnails, a main stage with contain-fit label images on a plate (front-panel crop with a "Full label" toggle) and an inline video player, a keyboard-operable lightbox with zoom and swipe, a "3 / 7" counter, and graceful handling of products with zero videos.

## Pre-flight checks

```bash
grep -n "export const productMedia\|export const productVideos\|export const productAlt" src/utils/product.js
grep -n "VideoPlayer\|CloudinaryImage" src/components/ui/index.js
grep -rn "ProductGallery" src --include=*.js | grep -v "components/storefront/ProductGallery"   # consumers: ProductDetails (placeholder from 25), storefront/index.js
node -e "const db=require('./db.json'); console.log(db.products.map(p=>[p.slug, p.media.filter(m=>m.type==='video').length]))"
```

## Tasks

1. **`useSwipe(ref, { onLeft, onRight, threshold = 40 })`** — pointer-event based, ignores vertical gestures (`touch-action: pan-y` on the element), works with mouse drag too.
2. **`MediaGallery`** — props `{ product, media = productMedia(product), initialIndex = 0 }`. State: `index`, `showFull` (per-image "Full label" toggle for rows that carry `crop`), `lightboxOpen`.
   - **Stage**: 4:5 `.sf-plate` (`aspect-ratio: 4/5`; 1:1 on mobile) with `GlowWrap tone="gold" intensity={0.14}` behind; image rows render `CloudinaryImage` with `crop` + `ar` + `pad` when `!showFull && row.crop`, otherwise the uncropped image `fit="contain"`; `sizes="(max-width: 768px) 100vw, 48vw"`, `priority` for the first image (LCP on the PDP), lazy otherwise; a small glass toggle "Full label / Front panel" (only when `row.crop`), a "Zoom" icon button (opens the lightbox), the counter chip `"{index+1} / {media.length}"` (`aria-live="polite"`), prev/next 44px glass arrows on hover/focus (always visible on touch); video rows render `VideoPlayer` (poster = `row.poster || primary image`, `title = row.title`, `preload="metadata"`, muted by default, mute toggle, click-to-play; the video pauses when the index changes or the tab hides). Keyboard on the stage (`tabIndex=0`, `role="group"`, `aria-roledescription="carousel"`, `aria-label="{name} media"`): ←/→ change item, Enter/Space on an image opens the lightbox, Home/End. Swipe via `useSwipe`.
   - **Rail**: `role="tablist" aria-label="Product media"`; thumbnails `role="tab" aria-selected aria-controls`, 72px squares on desktop in a vertical column left of the stage (grid `72px 1fr`, gap 16px), horizontal 56px strip below the stage on ≤ 1024px (snap scrolling, active thumb scrolls into view); image thumbs use the crop (`stageSrc`-style, `w: 144`); video thumbs use the poster with a gold play badge (`aria-label="Video: {title}"`); ←/→ on the rail move selection (roving tabindex).
   - **Zero videos**: nothing special renders; one image → no rail, no arrows, counter hidden.
3. **`Lightbox`** — `Modal size="full"`-based: dark scrim (`rgba(11,11,13,.96)`, no blur), the current media at full resolution (`cld(url,{ w: 2000 })` uncropped for images; `VideoPlayer` for videos), close (Esc / button), ←/→ (keys, buttons, swipe), counter, zoom for images: wheel/pinch (pointer events, two-pointer distance) and +/− buttons between 1× and 4×, drag to pan when zoomed, double-tap/double-click toggles 2×; `aria-modal`, focus trap, focus restore to the "Zoom" button; body scroll lock; keyboard hints on desktop.
4. **Mobile strip** — on ≤ 768px the stage itself is the swipeable strip (already via `useSwipe`); dots under it (`aria-hidden`) plus the counter; thumbnails rail below.
5. **Wire into `ProductDetails`** — replace the placeholder from Prompt 25 with `<MediaGallery product={product} />`; the media column stays sticky on desktop.
6. **Delete** `ProductGallery` (both files) and its export; `STOREFRONT_CONFIG.gallery = { zoom: true, lightbox: true }` (`thumbnailPosition` removed; grep consumers).
7. **Performance** — first image eager+priority; thumbs `w:144`; videos `preload="metadata"`; no video element mounted for non-active rows (render only the active video); `aspect-ratio` everywhere (no CLS).

## Design and content specification

- Stage plate radius `--sf-radius-xl`, hairline, `--sf-shadow-2`; arrows glass circles 44px; counter chip glass 12px; toggle 32px pill; play badge 64px gold circle with near-black glyph on the poster; thumbs radius `--sf-radius-md` with a 2px gold ring when active.
- Lightbox: full screen, image `max-height: 92svh`, controls 48px, counter top-left, close top-right; zoom cursor states.
- Motion: stage crossfade 320 ms; lightbox fade 320 ms; reduced motion instant.
- Copy: "Full label", "Front panel", "Zoom", "Previous", "Next", "Close", "Video: {title}", "Video unavailable".

## Data and API changes

Reads `product.media` (normalised). None new. The admin media manager (Prompt 33) writes what this reads.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: no lightbox/carousel library; never autoplay video with sound; label images are never cropped by CSS (`object-fit: contain` on plates; crops only via Cloudinary); the rail must be usable with keyboard alone.

## Acceptance criteria

- [ ] Face Wash gallery: 3 images + 2 videos; rail shows 5 thumbs (video thumbs with play badges); stage swaps by click/keys/swipe; counter updates; "Full label" toggle works on the cover; videos play inline muted with a mute toggle and stop when leaving the item.
- [ ] Lightbox: opens on Zoom/Enter, ←/→/Esc work, wheel/pinch zoom and pan work, focus returns.
- [ ] A product with one image and no video renders cleanly (temporarily edit one in the admin to test, then restore).
- [ ] Screen reader: tablist semantics, counter announcements, video titles.
- [ ] Lighthouse PDP mobile: LCP = the first stage image; no CLS.
- [ ] `ProductGallery` deleted; `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
test ! -f src/components/storefront/ProductGallery.js && echo "old gallery removed"
grep -rn "ProductGallery\|thumbnailPosition" src | wc -l    # 0
npm run dev
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440; touch emulation swipe; keyboard-only run; reduced motion.

## Handoff

1. `PROGRESS.md`: row 26 → `complete`; Decisions log: zoom limits, toggle default.
2. `REPO_MAP.md` §5 "Updated by Prompt 26" (MediaGallery, Lightbox; ProductGallery removed).
3. Commit: `feat(lamikaa): 26 pdp media gallery with images and videos`.
