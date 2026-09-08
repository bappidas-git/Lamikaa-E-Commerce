# QA_MATRIX — responsive and mobile QA (Prompt 37)

> Every storefront route, every overlay and every admin screen, measured at the seven reference
> widths (`360 · 390 · 414 · 768 · 1024 · 1280 · 1440`), plus phone landscape, an emulated notch,
> reduced motion, print and a long-content stress pass. Nothing in this file is asserted from
> reading the CSS: every cell is the result of a script that drove the page in Chromium and read
> the DOM back. The harness, the raw JSON and the reproduction instructions are in §2.
>
> **Result: 364 route × width states, 39 overlay states, 160 tap-target states (10 603 controls
> hit-tested), 936 keyboard focus stops, 49 long-content states — 0 horizontal overflow, 0 clipped
> text, 0 stretched or broken images, 0 tap targets under 44 px, 0 missing focus indicators, 0
> console errors.** The 15 defects the pass found are listed in §11 with the commit that fixed each.

---

## 1. Legend

| Mark | Meaning |
|---|---|
| ✓ | Every check in §3 passed at that width. |
| ✗ | A check failed. Every ✗ in this file was fixed in `feat(lamikaa): 37 responsive and mobile qa pass`; §11 names the file and the cause. |
| n/a | The thing does not exist at that width by design (the mega panel below 1025, the mobile drawer above 768, the tab bar on `/product/*` and `/cart`, …). The reason is always given. |

## 2. Method

| Item | Value |
|---|---|
| Browser | Chromium **141.0.7390.37**, driven by Playwright (installed in the scratchpad only — `package.json` is untouched). |
| Server | `npm start` on `:3000` in mock mode against `node server.js` on `:3001`, pointed at a **scratch copy** of `db.json` through the supported `JSON_SERVER_DB` override. `git status db.json` stayed clean throughout. |
| Widths | 360 / 390 / 414 / 768 / 1024 / 1280 / 1440. `isMobile` below 415; **`hasTouch` at and below 768**, so the repo's own `@media (pointer: coarse)` rules are in force at every width a finger actually reaches — a 768 px tablet is touched. |
| Remote media | `res.cloudinary.com`, `picsum.photos` and `api.iconify.design` are unreachable from Chromium in this sandbox (the agent proxy's TLS tunnel resets), which is the limitation `PROGRESS.md` recorded against Prompts 19/20 and deferred to this one. The harness fetches each URL with `curl` — which does have the CA — caches it on disk and fulfils the request from the cache. **Every product photograph, placeholder photograph and icon therefore rendered for real**, and the aspect-ratio and icon-sized-control checks below are measurements rather than assumptions. That open TODO is now closed. |
| Seeds | Cart and wishlist through `localStorage`, the session through the same `user`/`token` pair the app writes, the admin through `sessionStorage`. `/special-offers` (enabled) is produced by rewriting the `dealsConfig` singleton **in flight** — the QA run never writes to the database. |
| Raw output | `results/audit-all.json` (route × width), `overlays.json`, `taps.json`, `focus.json`, `stress.json`, `extras.json`, `print.json`, plus `confirmation-print.pdf`. Scratchpad only; not committed. |

## 3. The checks, and how each was measured

| # | Check | Measurement |
|---|---|---|
| 1 | No horizontal scroll | `document.documentElement.scrollWidth <= window.innerWidth`, **and then the same reading with `body { overflow-x }` neutralised**, so the page guard cannot hide a real overflow (Task 3). Any element whose right edge passes the viewport and is not already clipped by a scroll container is named. |
| 2 | No clipped text | Every element that owns its own text and sits in an `overflow: hidden`/`clip` box, excluding deliberate truncation (`text-overflow: ellipsis`, `-webkit-line-clamp`) and `.sf-visually-hidden`: flagged when `scrollWidth > clientWidth` or `scrollHeight > clientHeight`. |
| 3 | Images keep aspect | Every `<img>` forced to `loading="eager"` and awaited, then `naturalWidth/naturalHeight` compared with the rendered box for any `object-fit` that can distort (`fill`, `none`, `scale-down`); `naturalWidth === 0` reported as broken. |
| 4 | Sticky elements never cover a CTA or a focused input | Every field and button on `/checkout`, `/contact` and `/profile` focused in turn at 360/390/768/1280, then `elementFromPoint` at its centre: a hit on a `header`, `nav` or `*bar*` ancestor is a cover. |
| 5 | Overlays lock and restore scroll and focus | §5. The lock is proved with a **wheel and a synthetic touch drag** — `window.scrollTo` is programmatic, and `overflow: hidden` is specified not to block that. |
| 6 | Safe-area insets | `Emulation.setSafeAreaInsetsOverride` over CDP with the iPhone 14 Pro figures, portrait (top 59 / bottom 34) and landscape (left 59 / right 59 / bottom 21). §8. |
| 7 | `svh`/`dvh` with the URL bar | Every viewport-height declaration audited for a fallback that is correct where `svh` is unsupported, and the overlay primitives re-expressed against their own fixed root. §10. |
| 8 | Tap targets ≥ 44 px | **Hit testing, not geometry.** For every interactive element the centre and the four edge midpoints of a 44 px box are pressed with `document.elementFromPoint`; a pseudo-element hit answers with its originating element, so an inert touch band counts, and a `<label>` that wraps a native control counts as the control's target. Computing the band from `getComputedStyle` was tried first and is **unsound** — the values are pre-transform, so a band centred with `translateY(-50%)` reads as offset. That change alone uncovered four of the defects in §11. |
| 9 | Body text ≥ 16 px at ≤ 414; no light text < 14 px | Computed `font-size` and `font-weight` of every element that owns ≥ 45 characters of its own text. "Light" is read as the design system defines it (`DESIGN_SYSTEM.md` §6: the 300 tier is deleted), so weight < 400 under 14 px. §9 lists the caption tiers that are 12–14 px by design. |
| 10 | Keyboard focus visible | Tab through every stop on 17 routes and compare a signature (outline, shadow, border, ground, underline over the control, its subtree and four ancestors) against the same signature snapshotted before any tabbing. It has to be a comparison: two search fields draw the ring on the wrapping row through `:focus-within`, and one product tile draws it on the plate inside it. |
| 11 | `prefers-reduced-motion` respected | `reducedMotion: "reduce"` on the context, then `document.getAnimations()` for anything still running after the page settles, plus the computed `scroll-behavior`. |
| 12 | No console errors | Every `console.error` and `pageerror` captured for the life of each page. |

---

## 4. Storefront routes × widths

All 33 rows the prompt lists, at all seven widths: **231 states, every one ✓.** A cell is ✓ when the
page has no horizontal scroll (measured twice — see §10), no clipped text, no broken or stretched
image, no type defect (§9) and no console error. Tap targets (§12) and keyboard focus (§13) needed
their own instrumentation and have their own tables.

| Route | 360 | 390 | 414 | 768 | 1024 | 1280 | 1440 |
|---|---|---|---|---|---|---|---|
| `/about` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/cart (empty)` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/cart (filled)` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/category/body-care` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/category/face-care` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/checkout step 1` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/checkout step 2` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/checkout step 3` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/checkout step 4` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/order-confirmation/<sample>` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/contact` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/faq` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/login` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/nope (404)` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/special-offers (disabled)` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/special-offers (enabled)` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/orders` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/product/black-rice-face-mist (TBA)` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/product/black-rice-face-wash` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/policies/cookies` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/policies/privacy` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/policies/shipping-returns` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/policies/terms` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/profile` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/rituals/black-rice-body` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/rituals/morning-glow` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/rituals` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/search?q=serum` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/shop` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/shop?concern=hydration` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/why-lamikaa` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/wishlist` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 5. Overlays × widths

Each overlay is opened with the control the width actually offers, then measured for: a `role="dialog"`
panel, `body[data-scroll-lock]`, focus inside the panel, **the page not moving under a wheel or a touch
drag**, Escape closing it, the lock released, focus returned to the opener, and no horizontal overflow
while open. All eight checks passed in all 39 states.

| Overlay | 360 | 390 | 414 | 768 | 1024 | 1280 | 1440 |
|---|---|---|---|---|---|---|---|
| mobile drawer | ✓ | ✓ | ✓ | ✓ | n/a | n/a | n/a |
| search overlay | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| cart drawer | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| auth modal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| review modal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| lightbox | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| mega panel | n/a | n/a | n/a | n/a | n/a | ✓ | ✓ |

Notes:

- **Mobile drawer** is `n/a` from 1025 up: `Header.js` renders the hamburger only below 1025, where the
  mega panel is the Shop menu instead. Below 769 the masthead hides the account and wishlist actions by
  design (Prompt 09/10 — they live in the drawer and the tab bar), so the **auth modal** is opened from
  the tab bar at those widths and from the masthead above them. Both paths were exercised.
- **Mega panel** is `n/a` at and below 1024 for the same reason, and is additionally measured at the two
  widths the prompt calls out — **1025 and 1100** — plus 1200: full-bleed, `max-height: 800px`,
  `scrollHeight === clientHeight` (nothing to scroll), no document overflow, Escape closes it and focus
  returns to the Shop button.
- **Review modal** is reached through a delivered order's Details panel on `/orders`; the `Accordion`
  primitive parks a closed panel at `visibility: hidden`, so every panel is opened first.

## 6. Admin screens × widths

All nineteen admin screens, at all seven widths: **133 states, every one ✓.** The admin is a
back-office on a dark MUI theme; below 1024 the shell collapses to a drawer and every table scrolls
inside its own `TableContainer` (all fourteen table screens verified — `grep -c TableContainer` ≥ 3 in
each), which is why no admin screen scrolls the document sideways at 360.

| Route | 360 | 390 | 414 | 768 | 1024 | 1280 | 1440 |
|---|---|---|---|---|---|---|---|
| `/admin/announcements` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/categories` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/concerns` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/content` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/coupons` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/dashboard` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/faqs` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/hero-section` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/leads` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/orders` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/payments` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/products` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/returns` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/reviews` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/rituals` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/settings` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/shipping` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/special-offers` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin/users` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

## 7. Landscape — 844 × 390 (phone landscape, left/right notch insets applied)

| Route | Horizontal scroll | Page scrolls (no fixed-height trap) | Overlay behaviour |
|---|---|---|---|
| `/` | ✓ none (`scrollWidth 844`) | ✓ 24 529 px of page, reachable | Search overlay: 390 px tall, fits the viewport exactly, its own body scrolls |
| `/product/black-rice-face-wash` | ✓ none | ✓ 10 361 px | Lightbox: dialog 390 px (fits), picture 359 px and visible, every control inside the viewport |
| `/cart` | ✓ none | ✓ 2 957 px | — |
| `/checkout` | ✓ none | ✓ 2 717 px | — |
| `/shop` | ✓ none | ✓ 11 023 px | — |

No fixed-height trap anywhere: every page is taller than the 390 px viewport and scrolls to its end,
and the two full-viewport overlays size to the viewport rather than to a fixed figure.

## 8. Safe-area insets — iPhone 14 Pro emulation

Measured through `Emulation.setSafeAreaInsetsOverride`, both orientations, at rest and after scrolling.

| Element | Portrait (top 59 / bottom 34) | Landscape (left 59 / right 59 / bottom 21) |
|---|---|---|
| Announcement band (first in flow) | `padding-top: 59px` ✓ | `padding-left/right: 59px` ✓ |
| Header, pinned (band scrolled away) | `padding-top: 59px`, top edge at 0 ✓ | `padding-top: 0` ✓ (no top inset in landscape) |
| Bottom nav | `padding-bottom: 34px` ✓ | `padding-bottom: 21px` ✓ |
| PDP purchase bar | `padding-bottom: 42px` (8 + 34) ✓ | ✓ |
| Cart checkout bar | `padding-bottom: 42px` ✓ | ✓ |
| `.main-content` | `padding-bottom: 114px` (80 + 34) ✓ | ✓ |
| Drawers / modals / lightbox | `env(safe-area-inset-*)` on panel edges and on the modal root ✓ | ✓ |

The top inset was **missing** before this pass — see §11, defect 11. Note that
`public/index.html` does not set `viewport-fit=cover`, so on a real device every inset resolves to `0`
and the browser insets the layout viewport itself; the declarations cost nothing today and are what
makes the chrome correct the moment that viewport meta changes.

## 9. Type sizes

Measured on every element that owns its own text, at every width. **0 elements below font-weight 400
at any size** — `--sf-font-light` (the 300 tier) is deleted from the token layer, so "light text under
14 px" cannot occur. **0 elements of running body copy below 16 px at ≤ 414** after the two fixes below.

| Finding | Verdict |
|---|---|
| `Pillars .text` and `EmptyState .text`, both `0.9375rem` (15 px) | **✗ fixed.** Both are running body copy — the four philosophy pillars on `/about` and `/why-lamikaa`, and the one sentence an empty state or the 404 page says — and both were **off-scale**: 15 px is neither the 16 px reading tier nor the 14 px support tier. Both take `--sf-text-base` at ≤ 414. §11, defect 12. |
| Footer signature, newsletter hint, `LegalNote`, `ProductCard .promise`, `Contact` hints and form note, `AuthModal` subtitle, `SpecialOffers` lede and voucher description, `ReviewsSection` state note, `FrequentlyBoughtTogether` note, `IngredientChapter` benefit, admin `Typography body2` — all 14 px | **n/a, by design.** Every one is `--sf-text-sm`, the design system's own support tier (`DESIGN_SYSTEM.md` §6), at weight 400 or 500. These are captions, hints, small print and card blurbs, not the page's reading column. |
| Eyebrows, breadcrumbs, "We accept", the colophon, purchase-panel fact labels, checkout option meta, chapter fragrance note, admin captions — 12–13 px | **n/a, by design.** The `--sf-text-xs` label tier (and three documented 13 px asides), weight ≥ 400. |
| Cart and wishlist count badges — 10 px | **n/a.** A numeral in a chip at weight 600, not text. |
| The other off-scale sizes in the repo — `Header .navLink` and `SidebarMenu` row 15 px, the confirmation ledger's 15 px figures, five 13 px labels | **n/a.** Navigation labels and tabular figures, none of them a reading column. Audited by grep over all 94 stylesheets: 15 off-scale declarations, none in body copy. |

## 10. Global checks (Task 3)

| Check | Result |
|---|---|
| `overflow-x: hidden` is not hiding a real overflow | ✓ Every one of the 364 states was measured **twice** — once with `body { overflow-x: hidden }` in force and once with it neutralised. Both readings agree at every width: `scrollWidth === innerWidth`. The guard in `App.css` is a guard, not a cover. |
| `100vw` never used where scrollbars exist | ✓ `grep -rn "100vw" src --include=*.css` → **3 hits, all prose** in comments explaining why `100%` is used instead. Zero declarations. The full-screen modal's fallback pair is `width/height: 100%` of its own `position: fixed; inset: 0` root — the viewport, in every engine — never `100vw`. |
| `env(safe-area-inset-*)` on header (top), bottom nav, sticky bars, drawers | ✓ after defect 11. §8. |
| `min-height: 100svh` with `100vh` fallbacks | ✓ Hero and full-page CTA already declared the pair. The three overlay primitives (drawer sheet, full modal, lightbox picture and video) used `svh` **with no fallback at all** — a declaration an engine without the unit drops entirely — and now lead with `%` of their own fixed root, which is the viewport everywhere and is a *better* fallback than `vh` (on a phone `vh` is the LARGE viewport and overflows). Nine further bare-`vh` caps on media plates and sticky indexes gained an `svh` refinement after the `vh` fallback. §11, defect 1. |
| `pointer: coarse` states — no hover-only affordance | ✓ 12 stylesheets carry `@media (pointer: coarse)` / `(hover: none)` blocks; every `opacity: 0` reveal in the repo has a `:focus-within` or `any-pointer: coarse` twin (checked by script over all 94 stylesheets). The product card's quick-add is the pattern: hidden on a fine pointer, always visible on a coarse one. |
| No importance overrides | ✓ `grep -rn "!important" src --include=*.css` → **0**. It was 45 declarations before this pass. §11, defect 2. |
| No hard-coded colours introduced | ✓ Every rule added here reads `var(--sf-*)`. The one new block of literals is the print palette in the token layer, which is where colour is declared and is the same documented exception the admin's invoice stylesheet already takes (§11, defect 13). |

## 11. Defects found, and the fix

Every row was found by measurement, not by reading. All are in the single commit
`feat(lamikaa): 37 responsive and mobile qa pass`.

| # | Defect | Where it showed | Fix |
|---|---|---|---|
| 1 | `svh` declared with **no fallback**: an engine without the unit drops the whole declaration, leaving the bottom sheet uncapped, the full-screen modal unsized and the lightbox picture unbounded. | `ui/Drawer`, `ui/Modal`, `pdp/Lightbox` | Lead with `%` of the primitive's own `position: fixed; inset: 0` root, then refine with `svh`/`svw`. Nine bare-`vh` caps elsewhere gained an `svh` refinement. |
| 2 | 45 importance overrides, 28 of them fighting MUI's emotion classes in the masthead. | `Header.module.css` (28), `App.css` (4), four print rules, one MUI `@supports` twin | The repo's own idiom: a **doubled class** out-ranks a single-class rule on specificity, so emission order stops mattering. `body .swal2-container` for the SweetAlert2 stack. Proved neutral: a before/after computed-style snapshot of the account menu, its paper, avatar, divider, items and hover state is **byte-identical**. |
| 2b | The doubled `.userMenuPaper` then won an argument it used to lose: `overflow: hidden` beat MUI's `overflow-y: auto`, and a menu longer than the viewport could no longer scroll. | Account menu | Say it as the axis pair — `overflow-x: hidden; overflow-y: auto` — which is the value that was computing before, now stated rather than inherited by accident. |
| 3 | The masthead lockup is a 40 px link in a 56 px bar. | Every route, ≤ 768 | `min-height: var(--sf-tap-target)` on `.logoLink`; the artwork is centred and does not move. |
| 4 | Footer touch bands had no **width** floor ("Terms" is 42 px of type) and their row gaps were narrower than the band, so two bands overlapped. | Footer colophon, directory and contact rows, coarse pointers | Band centred in both axes at `max(100%, 44px)`; row gaps set from the ink height each has to clear (24 px for a 21 px row, 32 px for a 12 px one). |
| 5 | The chapter index pill's documented "44 px overlay" measured **42 px** — `inset` resolves against the padding box and the pill has a 1 px border — and was then **clipped back to 36 px** by the pill rail, because `overflow-x: auto` makes the Y axis `auto` too. | `/shop`, `/category/*`, `/shop?concern=*`, all coarse widths | State the band's height instead of insetting it, and give `.pills` a `min-height` of 44 px so the band fits inside the scroller. The strip's own `padding-block` drops by the same amount, so the sticky band is still 52/48 px and every offset measured against it is unchanged. |
| 6 | The breadcrumb's width band was clipped away by the glass panel the trail is rendered in (a card clips to its radius). | PDP, ≤ 768 | A real `min-width: var(--sf-tap-target)` with the label centred. An element's own border box cannot be clipped out of existence. |
| 7 | The PDP ownership note's "Read our story" link is 21 px, and its band was clipped by the purchase panel's bottom edge. | PDP, coarse pointers | A real 44 px box (`inline-flex` + `min-height`); the row grows and the card grows with it. |
| 8 | The cart line name (40 px) and the cross-sell name (18 px) could not use a band at all: `-webkit-line-clamp` requires `overflow: hidden`, which clips a `::after` with everything else. | `/cart`, coarse pointers | A real `min-height`. The cart row also reserves the remove button's true width (`--cart-remove-gutter` = 44 + 8 px, was 32 px), so the name and the button never claimed the same corner. |
| 9 | The gallery's front-panel/whole-shot toggle: the same `inset` arithmetic, 42 px instead of 44. | PDP media gallery | Height stated rather than inset. |
| 10 | The FAQ search **row** is the 52 px control a thumb aims at, but only the 24 px `<input>` inside it took the tap. | `/faq`, every width | `align-self: stretch` on the field. |
| 11 | **No top safe-area inset anywhere.** The announcement band is the first thing in the document and the header is what pins at `y = 0`; neither cleared a notch. The band's phone rule also re-stated `padding` as a shorthand, which would have zeroed the inset again. | Emulated iPhone 14 Pro, portrait | `padding-top: env(safe-area-inset-top)` on the band (longhands only, plus `max()` side gutters for the landscape cut-outs) and on the header through a new `.pinned` class driven by the scroll state the component already tracks. |
| 12 | Running body copy under 16 px on a phone. | `/about`, `/why-lamikaa`, `/nope`, empty states, ≤ 414 | 16 px at ≤ 414 for the pillar sentence and the empty-state sentence. |
| 13 | `/order-confirmation/*` printed as **warm-white ink on white paper** — a blank receipt. Backgrounds are not printed unless the reader asks for them; the text colour is. | Print media, every width | The token layer flips the whole palette to ink-on-paper inside its own `@media print`, so every module prints correctly through the tokens it already reads. `App.css` adds the page box and hides the skip link; the masthead, band, mega panel, trust strip, footer, tab bar, purchase bar and cart bar each hide themselves in their own stylesheet. `html body` re-states the ink at a specificity MUI's `CssBaseline` cannot beat. `.sf-gradient-text` un-clips itself, or a gradient-filled headline would print as nothing. **The admin invoice needed no change** — it already opens in its own window with a neutral stylesheet — and was verified end to end: opened from Admin → Orders → View & Update → Print Invoice, audited under `media: print` (`bodyColor rgb(26,26,26)`, 0 pale-ink runs, 0 dark grounds, the items table and the totals intact) and rendered to `invoice-print.pdf`. |
| 14 | The admin's touch density was keyed to `max-width: 768px` and stopped at 40 px, and the floor reached only icon buttons and small buttons. Hit-testing all nineteen screens found seven more classes short: contained buttons (37 px), text fields and selects (40 px), clickable chips (24 px), toggle-button segmented controls (39 px), labelled switches (38 px) and the bare switch on Shipping (38 px, 24 px in the small size). | Every admin screen on a touch device | Keyed to `@media (pointer: coarse)` instead — a 1024 px tablet is touched, a narrow desktop window is not — and a 44 px floor added for `Button`, `IconButton`, `ListItemButton`, `InputBase`, `Chip` (clickable and deletable only — a status chip is a label), `ToggleButton` and `FormControlLabel`. The bare `Switch` grows its own hidden input to a centred 44 px band, so nothing painted moves and the thumb keeps its alignment with the track. |
| 15 | The admin theme had a duplicate `MuiListItemButton` key, then a duplicate `MuiChip` key, from adding the floors as new blocks. `CI=true npm run build` treats `no-dupe-keys` as an error. | Build | Merged into the single existing override for each component. |

## 12. Tap targets — hit-tested

84 page states (21 routes × 360/390/414/768, all with a coarse pointer), **8 818 controls pressed at
five points each: 0 short of 44 px, 0 target conflicts.** The five points are the centre and the four
edge midpoints of a 44 px box; a hit on an inert touch band answers with the band's originating
element, and a `<label>` that wraps a native control counts as that control's target.

| Route | 360 | 390 | 414 | 768 |
|---|---|---|---|---|
| `/`, `/shop`, `/shop?concern=hydration`, `/category/face-care` | ✓ | ✓ | ✓ | ✓ |
| `/product/black-rice-face-wash`, `/product/black-rice-face-mist` | ✓ | ✓ | ✓ | ✓ |
| `/cart`, `/checkout`, `/orders`, `/profile`, `/wishlist` | ✓ | ✓ | ✓ | ✓ |
| `/search?q=serum`, `/faq`, `/contact`, `/about`, `/why-lamikaa` | ✓ | ✓ | ✓ | ✓ |
| `/rituals`, `/rituals/morning-glow`, `/policies/privacy`, `/special-offers`, `/nope` | ✓ | ✓ | ✓ | ✓ |

Seven of the fifteen defects in §11 are here, and every one of them was invisible to a
geometry-based check: three were arithmetic (`inset` resolves against the padding box, so a bordered
control's band is 2 px short), three were clipping (a horizontal scroller, a card's radius, a
line-clamp's `overflow: hidden`), and one was a control that only looked 52 px tall.

**The admin, on the same test:** 19 screens × 360/390/414/768 = **76 states, 1 785 controls, 0 short
of 44 px** — after defect 14. Every screen ✓ at every one of the four touch widths.

## 13. Keyboard focus — every stop on 17 routes

**1 060 focusable elements, 936 tab stops walked, 0 without a visible focus indicator.** The test is a
before/after signature comparison rather than a look at the focused element, because three patterns on
this storefront draw the ring somewhere else on purpose: the FAQ, orders and search fields ring the
wrapping row through `:focus-within`, and a `FrequentlyBoughtTogether` tile rings the plate inside it.
Two of those transition the ring in, so the walk waits 140 ms after each Tab — read in the same tick,
a ring on its way reads as absent.

| Route | Stops | Without an indicator |
|---|---|---|
| `/` · `/shop` · `/product/black-rice-face-wash` | 65 · 76 · 80 | 0 · 0 · 0 |
| `/cart` · `/checkout` · `/faq` · `/contact` | 52 · 48 · 54 · 49 | 0 · 0 · 0 · 0 |
| `/orders` · `/profile` · `/wishlist` · `/search?q=serum` | 61 · 54 · 75 · 45 | 0 · 0 · 0 · 0 |
| `/about` · `/rituals` · `/rituals/morning-glow` | 43 · 44 · 53 | 0 · 0 · 0 |
| `/policies/privacy` · `/special-offers` · `/nope` | 54 · 41 · 42 | 0 · 0 · 0 |

## 14. Long-content stress pass

Every product name on the API replaced in flight with a 128-character name, every hero headline and
short description with a 100-character unbroken token, and the same strings seeded into the cart and
the wishlist. **49 states (7 routes × 7 widths): 0 horizontal scroll, 0 clipped text.** The guard that
makes this hold is `overflow-wrap: anywhere` on all six heading levels in the base layer — `anywhere`
and not `break-word`, because only `anywhere` also shrinks `min-content` and so stops a heading forcing
a flex or grid track wider than the screen.

## 15. Observations (not defects, recorded for later prompts)

- **`api.js` logs an already-handled cart 404.** `cart.removeFromCart` writes to `console.error` before
  re-throwing, and `CartContext`'s mirror-to-server path deliberately swallows the throw. It surfaced
  only when eight concurrent sweep sessions signed in as the same seeded user and raced each other's
  cart rows; the real flow — add to cart through the UI as a signed-in user, then walk the checkout —
  produces **0** console errors, verified both with an injected cart and without. Worth a look in
  Prompt 39, not a responsive defect.
- **`wishlist` rows are keyed by `productId`.** Two rows for the same product and the same user (which
  the API permits, and which the sweep's own repeated runs created in a scratch database) produce a
  duplicate-key warning. The tracked `db.json` seeds `wishlist: []`, and a clean database produces no
  warning. A data-integrity question for the API, not a layout one.
- **`viewport-fit=cover` is not set**, so every `env(safe-area-inset-*)` resolves to 0 on a real device
  today. §8 and §16.
- **The invoice's logo did not render in the sandbox capture.** The invoice window is built with
  `document.write`, so its image request fires before any interception can attach and Cloudinary is
  unreachable from Chromium here. The `<img>` carries the store name as its `alt` and the `<h1>`
  beneath it repeats the name, so nothing is lost from the printed sheet either way; the URL itself
  returns 200 to `curl`. Worth one look on a developer's machine.

## 16. What was NOT changed, and why

- **The 36 px chapter pill, the 32 px gallery toggle, the 18 px colophon links.** The design asks for
  small ink; WCAG 2.5.5 asks for a large target. Both are satisfied by growing the target past the ink,
  which is the repo's existing idiom — this pass made that idiom actually measure 44 px rather than
  replacing it.
- **Card image link + the wishlist heart on top of it.** They overlap by design: the heart is a 44 px
  control painted over the plate, and it is on top, so a tap in that corner reaches the heart. Zero
  target conflicts remain once fixed and sticky layers are excluded, which is what they are.
- **Admin desktop density (40 px rows and icon buttons on a fine pointer).** A back-office table is a
  mouse surface; the 44 px floor now applies on any coarse pointer, which is what the rule is for.
- **`viewport-fit=cover`.** Adding it would change how the page paints on notched devices and is a
  design decision, not a QA fix. The inset declarations are complete and correct for the day it is
  taken; §8 records the measurement.

## 17. Reproducing

```bash
npm ci
node server.js &                      # or JSON_SERVER_DB=<scratch copy> node server.js &
BROWSER=none npm start &
# harness: scratchpad/qa/{run,overlays,taps,focus,stress,extras,print}.js
```

Acceptance greps:

```bash
CI=true npm run build && npm test -- --watchAll=false
grep -rn "100vw" src --include=*.css | wc -l          # 3 — all prose, 0 declarations
grep -rn "!important" src --include=*.css | wc -l     # 0
```
