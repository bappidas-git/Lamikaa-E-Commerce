# AUDIT — accessibility, performance and SEO (Prompt 38)

> The storefront and the admin, driven in Chromium against the **production build** and audited
> with axe-core 4.13.0, Lighthouse 13.4.1 (mobile preset) and a keyboard-only harness. Nothing in
> this file is asserted from reading the source: every number is the output of a script that drove
> the page and read the DOM, the accessibility tree or the trace back. The harnesses, how to
> re-run them and the raw JSON are described in §2.
>
> **Result: 0 axe violations across 47 states at 390 px and 47 states at 1280 px · 36/36
> keyboard-only checks pass, including the full purchase flow and the full review flow ·
> 0 running animations, 0 autoplay and 0 video playback under `prefers-reduced-motion: reduce`
> across 9 surfaces · 22/22 routes clean on the SEO checklist with every JSON-LD graph parsed and
> shape-checked · Lighthouse Accessibility, Best Practices and SEO meet their targets on all four
> pages. Lighthouse Performance does not reach 85 on this stack; §7 records what it does reach,
> what moved it, and what is left.**
>
> 31 defects were found and fixed. They are listed in §4 with the file that changed. Four findings
> were reviewed and deliberately **not** changed; each is argued in §9.

---

## 1. Targets, and whether they were met

| # | Target (prompt §Acceptance) | Result | Where |
|---|---|---|---|
| 1 | axe: 0 violations on every listed page | **Met** — 0 nodes across 47 states × 2 viewports | §3 |
| 2 | Keyboard-only purchase and review flows complete | **Met** — 36/36 checks | §5 |
| 3 | Reduced motion: no autoplay, glow, parallax, confetti or video | **Met** — 0 on 9 surfaces | §6 |
| 4 | Lighthouse mobile Accessibility ≥ 95 | **Met** — 100 on all four pages | §7 |
| 5 | Lighthouse mobile Best Practices ≥ 95 | **Met** — 100 on all four pages | §7 |
| 6 | Lighthouse mobile SEO ≥ 95 | **Met** on `/`, `/shop`, the PDP (100). **69 on `/checkout`**, and that is correct — see §7.3 | §7 |
| 7 | Lighthouse mobile Performance ≥ 85 | **NOT met.** Medians **56–75** after the work, from **42–63** before. §7.4 records the measured gap and its two structural causes | §7.4 |
| 8 | SEO checklist; JSON-LD validates; `noindex` on private pages | **Met** — 22/22 routes | §8 |
| 9 | Sitemap script works, writing only with a resolved domain | **Met** — verified both branches | §10 |

---

## 2. The harnesses

All four run against `serve -s build -l 5000` with `npm run server` on :3001, in the pre-installed
Chromium, at 390 × 844 (and 1280 × 900 for the second axe pass).

| Harness | What it does | Output |
|---|---|---|
| **axe** | Loads each of 47 states — every route in the prompt's list plus every overlay, every checkout step, the lightbox, and all 20 admin screens — signs in where the state needs it, injects `axe.min.js` and runs the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` and `best-practice` tag sets. Also records the heading list, the landmark list, `<h1>` count, title, canonical, robots and JSON-LD types per state. | `axe-report-390.json`, `axe-report-1280.json` |
| **keyboard** | Drives the storefront with **nothing but** Tab / Shift+Tab / Enter / Escape / arrows. Walks the home page's whole focus order recording a ring and a size for every stop; completes the purchase flow and the review flow end to end; opens each overlay, proves the trap holds, presses Escape and checks where focus lands; reads the live regions before and after each action. | `keyboard-report.txt` |
| **reduced motion** | Loads 9 surfaces twice — `reducedMotion: "reduce"` and `"no-preference"` — and reports every running animation (`document.getAnimations()` with a non-zero duration), every playing or `autoplay` video, any confetti `<canvas>`, and whether the hero advanced on its own over a full autoplay interval. | stdout |
| **SEO** | Loads 22 routes and checks title (present, unique, templated), description, canonical (present and absolute), the OG and Twitter sets, `html[lang]`, exactly one `<h1>`, the robots directive against an expected-`noindex` list, no `{{TOKEN}}` anywhere in `<head>`, and every JSON-LD graph: parsed, `@context` correct, required keys present, `ListItem` positions and absolute URLs, `Question`/`acceptedAnswer` shape, and no `Offer` at price 0 or rating with no ratings. | `seo-report.json` |

**WHICH BUILD.** Everything here was measured against `react-scripts build` — the real production
webpack config, minified, code-split, source-maps off — with `REACT_APP_API_URL` pointed at the
local JSON Server instead of the Laravel host, because the live API is not reachable from this
environment. The bundle, the CSS, the chunking and the markup are the shipping ones; only the API's
address differs. Where that mattered it was controlled for: the CLS traces were re-run with every
API response delayed by 120 ms and 300 ms to imitate a remote host, and the numbers moved by
0.0001.

Lighthouse runs through the same browser on the same build: mobile preset (412 × 823 @ DPR 1.75,
4× CPU throttle, simulated Slow 4G), categories `performance`, `accessibility`, `best-practices`,
`seo`. The host's `benchmarkIndex` was **1175** — mid-range, so the scores are comparable to a
mid-tier phone rather than inflated or crushed by the runner.

**Reproducing it.** The harnesses are audit tooling, not application code, so they are not
committed: they need `playwright`, `axe-core` and `lighthouse`, and the programme adds no
dependency to this repository for an audit (`00_INDEX.md` §2 — CLI tools via `npx` only). To
re-run: `CI=true npm run build`, `npx --yes serve -s build -l 5000`, `npm run server`, then
`npx --yes @axe-core/cli http://localhost:5000/<route>` per route and
`npx --yes lighthouse http://localhost:5000/<route> --preset=desktop|--form-factor=mobile`.

---

## 3. axe totals

| Pass | States | Violation nodes | Note |
|---|---|---|---|
| Round 1 — storefront + 3 admin screens, before any fix, 390 px | 29 | **31** | §4 rows 1–10 |
| Round 2 — extended to all 20 admin screens, after round 1's fixes, 390 px | 47 | **25** | §4 rows 11–22 |
| Round 3 — after those, 390 px | 47 | **0** | — |
| Round 4 — the same states at 1280 px, where the docked admin drawer exists | 47 | **20** | §4 rows 28–29 |
| Round 5 — after those, 1280 px | 47 | **0** | — |
| **Round 6 — final, both viewports** | **47 + 47** | **0** | — |

The 1280 px pass was worth running on its own: 19 of its 20 nodes were one defect on a component
that **only renders at desktop widths** (the admin's docked navigation drawer), which a phone-width
sweep can never see.

Distribution of the 76 nodes found across rounds 1, 2 and 4:

| Rule | Impact | Nodes | Where |
|---|---|---|---|
| `image-alt` | critical | 8 | admin product table avatars |
| `label` | critical | 1 | the Shiprocket switch |
| `region` | moderate | 10 | the admin sign-in screen (9) and a portalled tooltip (1) |
| `aria-input-field-name` | serious | 6 | 17 admin `<Select>`s |
| `color-contrast` | serious | 2 | cart tray and auth modal over live content |
| `scrollable-region-focusable` | serious | 2 | two read-only admin tables |
| `list` | serious | 20 | the admin Content rail (1) and the docked nav drawer on every screen (19) |
| `aria-progressbar-name` | serious | 1 | the coupon usage bar |
| `aria-prohibited-attr` | serious | 1 | a tooltip's icon span |
| `heading-order` | moderate | 12 | MUI's variant→element mapping, and one storefront band |
| `landmark-unique` | moderate | 4 | PDP chapter and ritual panel |
| `landmark-one-main` / `page-has-heading-one` | moderate | 4 | the admin sign-in screen, admin screens |
| `image-redundant-alt` | minor | 4 | "Complete the ritual" tiles |
| `aria-allowed-role` | minor | 1 | the auth modal's tab panels |

Two further accessibility findings came from **Lighthouse's** own category, which runs axe rules
this project's tag set does not (`target-size` is WCAG 2.2, `label-content-name-mismatch` is
experimental), and two more from the keyboard harness. All four were real; all four are fixed —
§4 rows 23–26.

---

## 4. Findings and fixes

Every row was found by a tool, reproduced, fixed, and re-run to green. All of them ship in the one
commit this prompt makes (`feat(lamikaa): 38 accessibility, performance and seo audit`).

| # | Page / state | Tool | Finding | Fix |
|---|---|---|---|---|
| 1 | PDP, PDP + lightbox | axe `landmark-unique` (moderate) | The "Complete the ritual" chapter and the `FrequentlyBoughtTogether` section inside it were both `region` landmarks named "Complete the ritual" — the same section announced twice. | `FrequentlyBoughtTogether` no longer falls back to `FBT_TITLE` for its `aria-label` when the caller passes `title={null}`; a nameless `<section>` is not a landmark, so the chapter's heading is the only name. `src/components/storefront/FrequentlyBoughtTogether.js` |
| 2 | PDP, PDP + lightbox | axe `image-redundant-alt` (minor) | The bundle tiles put the product name in the `<img alt>` **and** in the caption inside the same `<a>` — WCAG H2's case: the link read its name twice. | Image is decorative (`alt=""`, `decoding="async"` added); the link states its own name once via `aria-label`, in full — the caption truncates at 26 characters and the anchor tile's caption says "This item" rather than naming the product. Same file. |
| 3 | `/rituals/morning-glow` | axe `landmark-unique` (moderate) | The opening band (`aria-labelledby="ritual-title"`) and the summary panel (headline = the ritual name again) were two regions with the same name. | The panel is named by its own visible eyebrow, "Everything you need" — the half of the cluster that is unique. Nothing on screen changed. `src/pages/Rituals/RitualDetail.js` |
| 4 | `/why-lamikaa` | axe `heading-order` (moderate) | The philosophy band has no headline by design, so its pillars' `h3`s followed the page `h1` directly. | A visually-hidden `<h2>Our philosophy</h2>` — the name the section already gave itself — published as a real heading, the same idiom the ritual steps use. `src/pages/WhyLamikaa/WhyLamikaa.js` |
| 5 | Auth modal | axe `aria-allowed-role` (minor) | `role="tabpanel"` sat on the `<form>` elements, which ARIA does not allow on a form. | The animated wrapper is the tabpanel; a plain `<form>` lives inside it. Same ids, same `aria-controls`, same animation. `src/components/AuthModal/AuthModal.js` |
| 6 | Cart drawer over a PDP | axe `color-contrast` (serious) | The tray's 12 px muted note composited to **3.82:1** against a gold-lit `rgb(91, 83, 57)` — the product photograph reading through the glass. No colour on the text side could fix it. | `sf-glass--scrim` on the shared drawer panel: the design system's own answer for text on glass over imagery (`--sf-color-bg` at 35%). Takes the same pair to **5.7:1**, for every drawer over every page. `src/components/ui/Drawer.js` |
| 7 | Auth modal over `/checkout` | axe `color-contrast` (serious) | Same class: the backdrop darkens the page to 72 %, but the panel is glass on top of that, so the field labels failed over live content. | The same scrim on the shared modal panel. `src/components/ui/Modal.js` |
| 8 | `/admin` sign-in | axe `landmark-one-main`, `region` ×9 (moderate) | The screen renders outside `AdminLayout`, so the whole sign-in card sat in no landmark at all. | `component="main"` on the outer box. `src/pages/Admin/AdminLogin.js` |
| 9 | `/admin` sign-in, all 19 admin screens | axe `page-has-heading-one` (moderate) | No admin screen had an `<h1>`: MUI maps `variant="h4"`/`"h5"` to `<h4>`/`<h5>`. | `component="h1"` on every screen's page title (20 screens), keeping the `variant` so the type does not move. |
| 10 | `/admin/products` | axe `image-alt` (critical) ×8 | MUI's `<Avatar src>` renders an `<img>` with **no** `alt` attribute. | `alt=""` on all six admin avatars — the row's name is right beside each one, so the picture is decorative. |
| 11 | `/admin/products` (form open) | axe `heading-order` (moderate) | The product form's accordion labels are `variant="subtitle2"`, which MUI renders as `<h6>` — headings nested inside a `role="button"`. | `component="span"`. `src/pages/Admin/components/ProductFormSections.js` |
| 12 | 9 admin screens | axe `heading-order` (moderate) ×12 | The same mapping published every stat figure ("₹1,309", "8", "2"), every product name in a hero row and every card label as a document heading four or five levels below the page `h1`. | A `MuiTypography.variantMapping` default in the admin theme: only `h1`/`h2`/`h3` are headings; everything else keeps its size and becomes a `<p>`. Real section headings then opt in explicitly with `component="h2"` (13 of them). `src/theme/adminTheme.js` + the screens. |
| 13 | 7 admin screens | axe `aria-input-field-name` (serious) ×6 | MUI's `TextField` generates its own label id; a bare `FormControl` + `InputLabel` + `Select` does not, so 17 `<div role="combobox">`s shipped unnamed. | The documented MUI idiom, applied mechanically: an `id` on each `InputLabel` and the matching `labelId` on its `Select`. |
| 14 | `/admin/shipping` | axe `label` (critical) | The Shiprocket switch's visible label is the heading beside it, which is not wired to the input. | `inputProps={{ "aria-label": "Shiprocket integration" }}`. |
| 15 | `/admin/coupons` | axe `aria-progressbar-name` (serious) | MUI gives `LinearProgress` a `role="progressbar"` and a value but no name. | `aria-label={\`Usage of coupon ${coupon.code}\`}`. |
| 16 | `/admin/coupons` | axe `aria-prohibited-attr` (serious) | `Tooltip` puts its title on the child as `aria-label`, which ARIA forbids on a generic element. | `role="img"` on the icon span — which is what it is, and a role that may carry a name. |
| 17 | `/admin/content` | axe `list` (serious) | `ListItemButton` renders a `<div role="button">`, so the section rail's `<ul>` was a list of divs. | MUI's own navigation pattern: `<ListItem disablePadding>` wrapping the button, so the `<ul>` has only `<li>` children. |
| 18 | `/admin`, `/admin/returns` | axe `scrollable-region-focusable` (serious) ×2 | Two tables are wider than their container at phone width and, unlike the admin's other tables, hold nothing focusable — so their horizontal scroll was unreachable from the keyboard. | `tabIndex={0}` plus `role="region"` and a label, so the container is a stop that announces what it is. The other 13 tables have focusable cells and already passed. |
| 19 | `/shop` | Lighthouse CLS **0.229** | Three inserts pushed the listing down after load: the announcement band (36 px), the concern chip row (200 px) and the chapter strip (48 px). | Each slot is now reserved by the thing that owns it — §7.1. |
| 20 | every route | Lighthouse CLS 0.041 | The announcement band rendered `null` until `announcements.getAll()` returned, then appeared at the very top of the document. | `AnnouncementBar` seeds its first frame from `brand.announcements`, the module the bundle already has and already its fallback. `src/components/AnnouncementBar/AnnouncementBar.js` |
| 21 | every route | Lighthouse `render-blocking-resources`, est. 2.19 s | The Google Fonts stylesheet blocked the first paint from a third origin, before a single pixel of LAMIKAA was on screen. | `media="print"` + `onload="this.media='all'"` with a `preload` beside it and a `<noscript>` copy — still one request, no longer render-blocking. `display=swap` already described the intended behaviour. **FCP 2.8 s → 1.6 s.** `public/index.html` |
| 22 | every route | Lighthouse `unused-javascript`, 42 % of `main.js` | Five providers that mount on every route imported `sweetalert2` eagerly — 79 kB parsed for a library whose every use is a reaction to a click. | `src/utils/alerts.js`: one memoised `import()` behind `fireAlert()`. **main.js 247.8 → 233.1 kB gzipped.** |
| 23 | PDP | Lighthouse `target-size` (WCAG 2.2 SC 2.5.8) | The purchase panel's category link and the breadcrumb above it overlapped by 4 px: a crumb grows to a full 44 px target on the phone layout, and `.crumbs` pulled the next row 8 px closer. | The negative pull is dropped **on this panel only** — the other four `.crumbs` rules keep theirs, because nothing under them is a target. `src/components/pdp/PurchasePanel.module.css` |
| 24 | PDP | Lighthouse `label-content-name-mismatch` (WCAG 2.5.3) | `RitualCard`'s `aria-label` ("The Morning Glow Ritual, 4 steps") did not contain the card's visible text, so a speech-input user saying what they can see could not activate it. | The label is gone and the content names the link; the "See the ritual" pill — the card's own look, not a second control — is `aria-hidden`, as the step plates already were. `src/components/catalogue/RitualCard.js` |
| 25 | Footer, every route | keyboard harness | The four policy micro-links are a standalone row, not phrases in a sentence, so SC 2.5.8's inline exception does not cover them — they were 18 px tall. | `min-height: 24px` on an inline-flex box around the same type. The row's 8 px gap keeps wrapped rows a clear 32 px apart. `src/components/Footer/Footer.module.css` |
| 26 | `/checkout` | keyboard harness | Every address field carries `aria-invalid` and an `aria-describedby` message, which satisfies 3.3.1 — but focus stayed on the button, so a screen-reader user was told nothing and a keyboard visitor had to hunt back up the form. | `validateAddress()` moves focus to the first invalid input after the paint, which reads its label, its invalid state and its message in one go. `src/pages/Checkout/Checkout.js` |
| 28 | Every admin screen ≥ 1280 px | axe `list` (serious) ×19 | The docked navigation drawer's group labels are `Typography variant="caption"`, which MUI renders as a `<span>`, sitting straight inside `<List>` — so the admin's whole nav was a `<ul>` of spans. Only visible at desktop widths, where the docked drawer is shown, which is why the 390 px sweep never saw it. | `component="li"`. The `sx` block carries every pixel of the styling; only the element changes. `src/components/AdminLayout/AdminLayout.js` |
| 29 | `/admin/announcements` ≥ 1280 px | axe `region` (moderate) | MUI renders a `Tooltip`'s popper into `document.body`, so an open tooltip is page content outside every landmark. | Every admin tooltip now portals into the shell's own `<main>` (`ADMIN_MAIN_ID`), set once as a `MuiTooltip` default. Not `disablePortal`, which would let the tables' `overflow-x: auto` clip it. Verified by hovering: the popper's parent is `#admin-main` and `closest("main")` is truthy. `src/theme/adminTheme.js`, `src/components/AdminLayout/AdminLayout.js` |
| 30 | `/shop`, and every wrapping line of text | Lighthouse CLS, traced | Finding 21 cut FCP by moving the fonts stylesheet off the critical path — and moved the `display=swap` re-render to **after** the first paint. Text laid out in a fallback and re-laid-out in Manrope reflows, and where it wraps that reflow is a shift: the concern row re-wrapped from three lines to four, **0.16 on its own**. Reserving the row cannot help — the row itself changes size. | Two metric-matched fallback faces (`"Manrope Fallback"`, `"Fraunces Fallback"`) declared in the tokens: no file, no request, `local()` anchors whose metrics are stable across platforms, and `size-adjust` ratios **measured** in Chromium against the loaded webfaces (Manrope/Arial 1.011, Fraunces/Times 1.1328). `src/theme/storefront-tokens.css` |
| 31 | `/shop` | Lighthouse CLS, traced | The chip-row reservation was written in `ch`, which is the advance of a *zero* and therefore changes with the font FAMILY — so the reservation was still in the fallback's metrics when the row it reserved had switched to Manrope, and held three lines against the real row's four. | The widths are in `em` — the font SIZE, which both faces share — and were measured off the rendered row. Verified reserve-against-real at three widths: **200/200, 96/96, 44/44, delta 0**. A second bug surfaced in the same measurement: the empty reserve pill was `inline-flex`, so each wrapped row carried a text baseline's leading (+6 px × 4 rows); it is `display: block` now. `src/pages/Shop/Shop.js`, `Shop.module.css` |
| 27 | Home, hero | Lighthouse `image-delivery`, 32 KiB | The srcset ladder (480 · 768 · 1080 · 1440 · 1920) has gaps where phones actually land: the 80vw hero plate needs 576–660 device px at DPR 2 and 864–1032 at DPR 3, and both fell into a gap and were served the rung above. | Two rungs added — 640 and 900. A candidate the browser does not choose is never fetched. `src/utils/cloudinary.js` |

---

## 5. The keyboard-only run

36 checks, **0 failures**. Driven with no pointer events at all.

**The purchase flow.** Skip link is the first stop and paints a ring · 45 stops walked from header
through hero, chapters and footer with **0 missing focus indicators and 0 targets under 24 × 24** ·
Add to cart reached in 18 tabs and announced through a polite live region ("Added to cart — Black
Rice Face Wash is in your cart") · the cart tray traps focus across 11 stops, Escape closes it and
returns focus to Add to Cart · quantity stepper reachable and operable · Checkout reached in 7 tabs
and Enter navigates · 22 stops on checkout, all with a ring · step 1 cleared in 13 tabs · an empty
address form returns 4 `aria-invalid` fields, each with its own `aria-describedby` message, and
focus lands on the first of them (`ship-line1`).

**The review flow.** There is no "write a review" control on the PDP, and that is the design: a
review is written by a customer from My Orders after delivery, which is exactly what the reviews
section's empty state tells every visitor. Walked from there: Delivered filter in 12 tabs → the
order's Details panel in 6 → "Write a review" in 1 → the modal opens on Enter and carries Close,
five star buttons (`role="radio"`), a headline field, a body textarea, Cancel and Submit review,
all reachable → Escape closes it and focus returns to "Write a review".

**Overlays.** Search overlay, mobile drawer, cart tray, PDP lightbox and auth modal: each opens on
Enter, holds focus, closes on Escape and returns focus to the control that opened it. The auth
modal's tablist answers arrow keys (APG tab pattern).

**Live regions.** Cart additions, search results ("8 results for "black rice""), gallery slide
changes, quantity changes and the hero's slide counter all announce; the hero's counter is
`aria-live="polite"` only while autoplay is paused or absent, which is what stops it chattering.

**`aria-current`.** Present and correct on `/shop` (`page` on the nav item and the "All" chip,
`true` on the active chapter pill) and on `/about`.

---

## 6. Reduced motion

Nine surfaces — hero, home CTA and chapters, shop, PDP, PDP lightbox, cart drawer, mobile drawer,
ritual detail, why-lamikaa — loaded twice.

| `prefers-reduced-motion` | Running animations | Autoplay | Videos playing | Confetti canvas |
|---|---|---|---|---|
| `reduce` | **0** on all nine | **hero static** (`01 / 08` after a full interval) | **0** | **0** |
| `no-preference` | 3 on the hero page (progress fill 6.5 s, two 10 s breathing glows), 2 on the mobile drawer | hero advanced `01 / 08` → `02 / 08` | 0 (video never autoplays, by design) | 0 |

The second row matters as much as the first: it proves the harness is measuring something real
rather than a page with no motion in it. Video never autoplays in either mode — `VideoPlayer`
carries no `autoPlay` and every frame is `preload="metadata"`; the gallery mounts exactly one
`<video>`, and only when the current frame is one.

---

## 7. Lighthouse (mobile, production build)

Median of three runs per page. `benchmarkIndex` 1175.

### 7.1 Scores

| Page | Perf before | Perf after | A11y before → after | BP | SEO |
|---|---|---|---|---|---|
| `/` | 53 | **73** | 100 → **100** | **100** | **100** |
| `/shop` | 42 | **61** | 100 → **100** | **100** | **100** |
| `/product/black-rice-face-wash` | 52 | **56** | **97 → 100** | **100** | **100** |
| `/checkout` | 63 | **75** | 100 → **100** | **100** | **69** (§7.3) |

### 7.2 Metrics

| Page | FCP before → after | LCP before → after | TBT before → after | CLS before → after |
|---|---|---|---|---|
| `/` | 2.8 s → **0.9 s** | 6.2 s → **4.5 s** | 810 ms → **450 ms** | 0.041 → **0** |
| `/shop` | 2.9 s → **2.0 s** | 6.0 s → **5.7 s** | 810 ms → **650 ms** | **0.229 → 0** |
| PDP | 3.1 s → **2.1 s** | 6.3 s → **6.4 s** | 790 ms → **760 ms** | 0.041 → **0** |
| `/checkout` | 3.0 s → **2.0 s** | 4.4 s → **3.6 s** | 610 ms → **520 ms** | 0.041 → **0** |

**CLS is the clearest win: 0.229 → 0 on all four pages as Lighthouse measures it**, and
0.229 → 0.0008 on `/shop` under a direct `PerformanceObserver` trace, which is the harsher of the
two readings — it watches for a full 7 s on an unthrottled network, where the local API answers
instantly and the webfont still has to cross the wire, so it catches shifts Lighthouse's simulation
orders away. Three consecutive traces on `/shop`: 0.0008, 0.0007, 0.0007. The trace is what found
the causes, and there were two — the second appearing only *because* of finding 21.

**Three late inserts**, each now reserved by whatever owns it:

- the **announcement band** paints its first frame from `brand.announcements` instead of appearing
  after the fetch (finding 20 — this one was on every route);
- the **concern chip row** holds its slot while the concerns are on the wire, and the reservation
  is tied to the *concerns* request rather than to the products one, because they are two
  independent fetches: reserving against the wrong one made the head shrink when the products
  landed and grow again when the concerns did, which is two shifts where there had been one. The
  reserved row measures **200 px against the real row's 200 px**;
- the **chapter strip** reserves its constant 48/52 px slot while the range loads, and only while
  loading — a failed fetch and an empty range both end with no band, and reserving a strip that
  will never come is its own empty gap.

**And the font swap itself**, which finding 21 moved from before the first paint to after it. Text
laid out in a fallback and re-laid-out in the webfont reflows, and where it wraps the reflow is a
shift: the concern row went from three lines to four when Manrope landed, 0.16 on its own —
a reservation cannot help, because the row it reserves is the thing that changes size. Two
metric-matched fallback faces fixed it (finding 30), and a second bug surfaced while verifying
them: the reservation was written in `ch`, the advance of a *zero*, which changes with the font
FAMILY — so the reservation was still in the fallback's metrics when the real row had already
switched. In `em` it is family-independent, and the reserved row now measures **200/200 px at
412 px, 96/96 at 768 px and 44/44 at 1280 px** against the real one (finding 31).

What remains, under the trace, is the 2 px the swap still moves a line of text where nothing wraps
— 0.0001 on `/`, 0.0004 on `/checkout`, 0.0007 on `/shop`. The PDP's 0.017 is the purchase panel
settling as the product record arrives and is the largest residual anywhere; Lighthouse saw it once
in three runs. The general remedy for the residual, if it is ever worth it, is the vertical half of
what finding 30 did: `ascent-override` / `descent-override` / `line-gap-override` on the two
fallback faces so the line BOXES match as well as the advances.

### 7.3 `/checkout` SEO 69 is the correct score

The only SEO audit that fails on `/checkout` is `is-crawlable`, and it fails **because the page
carries `noindex,nofollow` — which this prompt requires** (task 4) and which is right: a checkout
is a step in one visitor's transaction. Lighthouse cannot tell a deliberate `noindex` from an
accidental one, so the audit is a false negative here. Every other SEO audit on the page passes,
and `/checkout` is `Disallow`-ed in `robots.txt` as well. Removing the directive to make a number
go up would be the wrong trade, and is not done.

### 7.4 Performance: what was done, and why 85 is not reached

Four measured improvements shipped, in descending order of effect:

1. **The Google Fonts stylesheet no longer blocks the first paint** (finding 21). Lighthouse put
   2.19 s of render-blocking on the critical path, ~950 ms of it this one file from a third origin.
   **FCP fell from 2.8–3.1 s to 0.9–2.1 s across all four pages** — the single largest change here,
   and the one a visitor feels.
2. **CLS went from 0.229/0.041 to 0** as Lighthouse measures it, ≤0.0008 under the harsher direct
   trace (§7.2).
3. **`main.js` fell 247.8 → 233.1 kB gzipped** by moving `sweetalert2` behind a dynamic import
   (finding 22), taking its parse and evaluation off the boot path.
4. **32 KiB of over-delivered hero imagery** removed by filling two gaps in the srcset ladder
   (finding 27).

Together those moved the medians to **73 / 61 / 56 / 75** from **53 / 42 / 52 / 63**, and made
Accessibility, Best Practices and SEO perfect on every page. It is not enough to reach 85, and the
remaining gap is structural rather than a list of missed opportunities. Two causes, both measured:

- **LCP is gated on the SPA booting.** The LCP element is the hero's first product image, and its
  URL is not known until the catalogue read returns — the hero is product-driven by design
  (`heroOrder`). Lighthouse's own breakdown attributes almost the whole of LCP to
  `resourceLoadDelay` (910 ms observed, ~5 s simulated) against 78 ms of `resourceLoadDuration`
  and 75 ms of `elementRenderDelay`: the image is fast, the wait before anyone can ask for it is
  not. Nothing inside a client-rendered CRA app closes that; it needs the HTML to arrive knowing
  the hero — server rendering, a prerender step, or a build-time hero manifest that lets
  `index.html` carry `<link rel=preload as=image>` for the first slide.
- **TBT is the eager bundle's evaluation under a 4× CPU throttle.** `main.js` is 233 kB gzipped and
  Lighthouse measures ~1.0–1.4 s of script evaluation on it. Its three largest passengers are
  `react-dom` (127 kB parsed), `framer-motion` (107 kB) and `@mui/material` + `@mui/system` +
  `@mui/utils` (105 kB). The MUI weight is the one that is genuinely avoidable: the storefront uses
  it for `useMediaQuery` in the header and footer, five components in the account dropdown
  (`Menu`, `MenuItem`, `Avatar`, `Typography`, `Divider`) and the `createTheme`/`ThemeProvider` pair
  in `ThemeContext` — everything else on the storefront is CSS Modules and this repository's own
  primitives. Replacing those and dropping the storefront's MUI theme would take roughly 33 kB
  gzipped off the eager path.

A third, smaller item is recorded here rather than changed: **`@iconify/react` fetches its icon data
from `api.iconify.design` at runtime** — three requests on the home page, the first 544 ms under
throttling, from an origin that is otherwise not on the critical path. Bundling the ~114 statically
named icons with `addCollection()` would remove them, but it cannot be done blindly: another ~118
call sites take their icon name from a **prop**, and some of those names come from admin-managed
data (`category.icon`, `siteContent` section icons, deal tiles), so the API must remain the
fallback for anything not bundled. That is a change with its own design decisions and its own
regression surface, and it belongs in a change of its own rather than inside an audit.

Each of these three is a deliberate architectural choice of the rebuild (client-rendered CRA,
product-driven hero, MUI-backed admin sharing one bundle boundary with the storefront), not a
defect this audit introduced or can responsibly reverse in passing. They are listed in §11 as owner
decisions.

---

## 8. SEO checklist

**22/22 routes clean.** Every row below was read out of the live DOM after the SPA mounted.

| Check | Result |
|---|---|
| Unique `<title>` via `brand.seo.titleTemplate` | 22/22, no duplicates |
| Meta description | 22/22 |
| Canonical, absolute | 22/22 |
| `og:title` / `og:description` / `og:url` / `og:image` | 22/22 |
| `twitter:card` / `twitter:title` / `twitter:image` | 22/22 |
| `html[lang="en"]`, exactly one `<h1>` | 22/22 |
| No `{{TOKEN}}` anywhere in `<head>` | 22/22 |
| `noindex,nofollow` on `/cart`, `/checkout`, `/order-confirmation`, `/profile`, `/orders`, `/wishlist`, `/search`, 404 | 8/8 — and **not** on any public route |
| `/login`, `/register` | Not `noindex` because they are **not pages**: `AuthRoute` opens the modal and immediately `<Navigate replace>`s back, so there is nothing to index. Added to `robots.txt` this prompt, so a crawler does not spend a fetch discovering that. |
| JSON-LD parses, `@context` correct, no placeholder token in any graph | every graph on every route |
| `Organization` + `WebSite` on `/` | ✓ (`sameAs` correctly absent — every social URL is still a token) |
| `ItemList` on `/shop`, `/category/*`, ritual pages | ✓ — every `ListItem` has a `position` and an absolute `url` |
| `Product` (+ `BreadcrumbList`) on PDPs | ✓ — no `Offer` at price 0 on the five `priceTBA` products, no `aggregateRating` with zero ratings |
| `FAQPage` on `/faq` | ✓ — every `Question` has a `name` and an `acceptedAnswer.text` |
| `BreadcrumbList` on rituals, categories, policies, about, why | ✓ — the same array the visible trail renders, so the two cannot drift |
| `manifest.json` complete and valid | ✓ — `name`, `short_name`, `description`, `lang`, `categories`, `start_url`, `display: standalone`, `theme_color` and `background_color` (both `#0B0B0D`, matching the `theme-color` meta), and three icons: 192 `any`, 512 `any`, 512 `maskable`, all present on disk and all generated from the LAMIKAA mark. **Not "installable" in Chrome's sense, and deliberately so:** an install prompt also needs a fetch-handling service worker, and this project ships none — a storefront that serves stale prices and stale stock from a cache is worse than one that waits for the network. Lighthouse 13 has no PWA category, so the audits that remain are the manifest's own, and they pass. |
| Favicons | ✓ — `favicon.ico` (48 px), 16, 32, 180 (apple-touch), 192, 512, 512-maskable, all present and all generated from the LAMIKAA mark |
| `robots.txt` | ✓ — `Allow: /` plus the private paths; `/wishlist`, `/search`, `/login`, `/register` added this prompt |

---

## 9. Reviewed and deliberately not changed

Four findings were investigated and left alone. Each is recorded so the next audit does not
re-open it.

1. **`p-as-heading` (axe experimental, 7 nodes on the PDP).** The heuristic flags a `<p>` that
   *looks* like a heading. The nodes are the reviews section's "No reviews yet" state line and the
   product-card name rows. A product name in a card is not a document heading — making every card
   name one would flood the outline with a dozen peers of the page's own sections — and the empty
   state is a sentence. Not in any WCAG tag set; not run by Lighthouse.
2. **`focus-order-semantics` (axe experimental, 1 node on the PDP).** The gallery stage is a
   focusable `role="group"` with `aria-roledescription="carousel"` and a key handler. That is the
   WAI-ARIA APG carousel pattern; the rule's preference for an interactive role does not apply to a
   keyboard-navigable group.
3. **`bf-cache` (Lighthouse, every page).** The page is held out of the back/forward cache. This is
   a property of the dev server used for the audit, not of the application.
4. **`cache-insight` / "Use efficient cache lifetimes" (Lighthouse).** `serve` sets no far-future
   `Cache-Control` on the hashed build assets. That is a hosting configuration for the owner's
   web server, listed in §11, not something the repository can set.

`unused-css-rules` (est. 17–18 KiB) is also left: the storefront ships one stylesheet per lazy
route plus a shared `main.css`, and what Lighthouse counts as unused on a given page is the other
routes' rules in that shared file — the price of shipping one design system.

---

## 10. The sitemap

`scripts/generate-sitemap.js` (`npm run sitemap`) reads `db.json` and the static route table and
writes `public/sitemap.xml` with absolute URLs built from `brand.seo.siteUrl`. Both branches were
verified:

- **Domain unresolved (the state this repository is in).** `seo.siteUrl` is `{{LAMIKAA_DOMAIN}}`,
  so the script prints what it needs and **exits 0 without writing**. Exit 0 rather than 1 on
  purpose: an unresolved placeholder is the project's current, expected state and must not fail a
  CI chain. A real failure — unreadable `db.json`, unwritable `public/` — still exits 1.
- **Domain resolved (verified by temporarily setting `siteUrl` and reverting).** Wrote 30 URLs:
  12 static (`/`, `/shop`, `/rituals`, `/about`, `/why-lamikaa`, `/faq`, `/contact`,
  `/special-offers` and the four policies) · 8 visible products · 7 active categories · 3 active
  rituals. Well-formed XML (parsed), no duplicate `<loc>`, and `<lastmod>` only where a record
  actually carries `updatedAt`/`createdAt` — inventing today's date for a page that has not changed
  is the noise that makes search engines ignore the element.

Nothing private is listed: `/cart`, `/checkout`, `/order-confirmation`, `/profile`, `/orders`,
`/wishlist`, `/search`, `/login`, `/register` and `/admin` are all `noindex` in the app and
`Disallow`-ed in `robots.txt`, and a sitemap that contradicts those is one a crawler learns to
distrust.

**`robots.txt` carries the `Sitemap:` line commented out, with the host spelled out.** The file is
served verbatim to crawlers, so a literal `{{LAMIKAA_DOMAIN}}` there is a broken directive — worse
than none — and there is no `sitemap.xml` for it to point at either while the script refuses to
write one. The two are therefore in step, and resolving the domain resolves both:

```
1. src/config/brand.js  →  seo.siteUrl: "lamikanaturals.com"
2. npm run sitemap                      # writes public/sitemap.xml
3. uncomment the Sitemap: line in public/robots.txt, same host
```

No page changes are needed at step 1: `seoOrigin()` has read `brand.seo.siteUrl` since Prompt 08
and falls back to `window.location.origin` only while it is a token, so no canonical, `og:url` or
JSON-LD `url` has ever carried the placeholder.

---

## 11. Open items for the owner

| # | Item | Blocks | Where |
|---|---|---|---|
| 1 | **The public domain.** `brand.seo.siteUrl` is `{{LAMIKAA_DOMAIN}}`. Candidate `lamikanaturals.com` (`.env.production` points the API at `core.lamikanaturals.com`) — confirm. | `public/sitemap.xml`, the `Sitemap:` line in `robots.txt`, and canonical/`og:url`/JSON-LD `url` on the real host | §10, `PLACEHOLDERS.md` |
| 2 | **The social profile URLs.** Instagram, Facebook, YouTube and WhatsApp are all tokens, so the `Organization` graph publishes no `sameAs` — correctly, but it is the one structured-data field the store is missing. Fill them in Admin → Settings → Social Links. | `sameAs` on `/` | §8, `PLACEHOLDERS.md` |
| 3 | **Cache headers on the hosting.** The hashed files under `build/static/` should be served `Cache-Control: public, max-age=31536000, immutable`, and `index.html` `no-cache`. Nothing in the repository can set this. | Lighthouse `cache-insight`; repeat-visit performance | §9.4 |
| 4 | **Performance beyond this audit.** Three named, costed levers, in order of effect: prerender or server-render the shell so the hero image can be preloaded from `index.html`; take `@mui/material` off the storefront's eager path (≈33 kB gzipped); bundle the statically named Iconify icons with the API kept as the fallback for admin-chosen names. | Lighthouse Performance ≥ 85 | §7.4 |

---

## 12. What changed, by file

| File | Why |
|---|---|
| `scripts/generate-sitemap.js` *(new)* | The sitemap generator (§10) |
| `src/utils/alerts.js` *(new)* | `fireAlert()` — SweetAlert behind one memoised `import()` (finding 22) |
| `package.json` | `"sitemap": "node scripts/generate-sitemap.js"` |
| `public/robots.txt` | `/wishlist`, `/search`, `/login`, `/register` disallowed; the `Sitemap:` line written out and commented, with the three steps that enable it |
| `public/index.html` | The fonts stylesheet made non-render-blocking (finding 21) |
| `src/components/ui/Drawer.js`, `Modal.js` | `sf-glass--scrim` on the shared panels (findings 6, 7) |
| `src/components/AnnouncementBar/AnnouncementBar.js` | First frame from the brand fallback (finding 20) |
| `src/components/AuthModal/AuthModal.js` | `role="tabpanel"` moved off the `<form>`s (finding 5) |
| `src/components/storefront/FrequentlyBoughtTogether.js` | Landmark name and tile alt (findings 1, 2) |
| `src/components/catalogue/RitualCard.js` | Label in Name (finding 24) |
| `src/components/catalogue/ChapterIndex.js`, `.module.css` | `ChapterIndexReserve` — the strip's slot (finding 19) |
| `src/components/pdp/PurchasePanel.module.css` | Target spacing under the trail (finding 23) |
| `src/components/Footer/Footer.module.css` | 24 px micro-link targets (finding 25) |
| `src/pages/Shop/Shop.js`, `.module.css` | The concern row's reservation and its own loading flag (finding 19) |
| `src/pages/Rituals/RitualDetail.js` | Region name (finding 3) |
| `src/pages/WhyLamikaa/WhyLamikaa.js` | The philosophy band's heading (finding 4) |
| `src/pages/Checkout/Checkout.js` | Focus to the first invalid field (finding 26) |
| `src/utils/cloudinary.js` | Two srcset rungs (finding 27) |
| `src/theme/adminTheme.js` | `variantMapping`: type size is not document structure (finding 12); `MuiTooltip` portals into the shell's `<main>` (finding 29) |
| `src/components/AdminLayout/AdminLayout.js` | The nav's group labels are `<li>`s (finding 28); `<main>` carries the tooltips' portal id (finding 29) |
| `src/theme/storefront-tokens.css` | The two metric-matched fallback faces (finding 30) |
| `src/pages/Admin/*` (20 files), `src/pages/Admin/components/ProductFormSections.js` | `h1` per screen, real `h2`s, decorative avatar alts, `labelId` on every `Select`, the switch label, the progressbar name, the tooltip role, the `<li>` in the content rail, the two scrollable tables (findings 8–18) |
| `src/context/{Auth,Cart,Wishlist,Order,Admin}Context.js`, `src/components/pdp/PurchasePanel.js`, `src/pages/{Checkout,OrderHistory,Profile}` | `fireAlert()` in place of the eager `Swal` import (finding 22) |
| `src/context/CartContext.test.js` | Mocks `utils/alerts` — the seam the context now uses |
