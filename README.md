# LAMIKAA NATURALS — storefront and admin

LAMIKAA Naturals is a farmer-owned skincare brand rooted in the indigenous
wisdom and natural heritage of Assam and Northeast India: a Black Rice range
that cleanses, refreshes, treats and moisturises, made by a company its farmers
own. LAMIKAA Naturals is owned by Bokakhat Agro Organic Producer Co. Ltd.
(BAOPCL), a Farmer Producer Company — profits distributed by BAOPCL *can* reach
member farmers as dividends, subject to applicable laws and the company's
dividend declaration. This repository is the shop that sells it: a React
storefront and a full admin console over one dual-mode API layer, served either
by a local JSON Server mock or by the live Laravel backend.

That qualifier is not decoration. Wherever this application mentions profits or
dividends the "can" and the "subject to applicable laws" wording is part of the
copy and must survive editing (`src/config/brand.js → brand.legalNote`).

---

## Stack

| Layer | What |
|---|---|
| App | Create React App 5 (`react-scripts@5.0.1`), React 18, React Router 6 |
| Styling | CSS Modules over the `--sf-*` design tokens in `src/theme/` — **one light theme** (warm cream page, espresso type, antique gold) with a single opt-in `.sf-on-dark` scope for the near-black chrome, no light/dark toggle, no hard-coded colours |
| Admin | MUI 5 on its own isolated theme (`src/theme/adminTheme.js`) — **two modes, dark by default**, chosen per administrator in the app bar and stored in their browser |
| Motion | framer-motion, every animation gated on `prefers-reduced-motion` |
| Data | `src/services/api.js` — one contract, two modes (JSON Server / Laravel) |
| Mock API | `json-server` via `server.js` over `db.json` |
| Tests | Jest + React Testing Library (CRA's runner) |

No state library, no CMS, no UI kit on the storefront side: the shared
primitives live in `src/components/ui/` and the markdown-lite content parser in
`src/utils/contentBlocks.js`.

## Prerequisites

- Node 18, 20 or 22 (built and tested on 22) and npm 10+
- Nothing else — the mock backend is a dependency, not a service you install

```bash
npm ci
```

Use `npm ci`, not `npm install`: the lockfile pins `react-scripts@5.0.1` and its
Babel/webpack tree, and a floating install of that tree is the usual cause of a
build that works on one machine and not the next.

---

## Mock mode (the committed default)

```bash
npm run dev
```

`concurrently` starts both halves:

| | URL | What |
|---|---|---|
| Storefront + admin | http://localhost:3000 | `npm start` (CRA dev server) |
| Mock API | http://localhost:3001 | `npm run server` → `server.js` over `db.json` |

`.env` ships with `REACT_APP_USE_MOCK_API=true` and
`REACT_APP_API_URL=http://localhost:3001`, so a fresh clone runs end to end with
no backend. Writes from the storefront and the admin land in `db.json` — it is a
real, mutable database, so `git checkout db.json` is how you undo an afternoon of
clicking.

**`server.js` is not `json-server --watch`, and deleting it breaks DELETE.** It
wraps json-server to replace one handler: stock json-server's DELETE runs a
"dependent rows" scan that calls `.toString()` on every `*Id` field in the whole
database. Legitimate NULL foreign keys in the seed (`refunds.returnId`,
`reviews.userId`, `walletTransactions.refundId`) make that throw — the row is
already gone from memory but the write never happens, so the store and the file
desync and the next read 404s. `server.js` deletes only the addressed row, with
no cascade, and neutralises the scan. Keep it. Two environment variables are
honoured, which is what makes a throwaway QA database easy:

```bash
JSON_SERVER_DB=/tmp/qa-db.json JSON_SERVER_PORT=3001 node server.js
```

### Pulling and merging `db.json`

**Cannot pull? Use `npm run pull`.**

```bash
npm run pull
```

Because `db.json` is a real database rather than source, the running app keeps it
modified — place an order, approve a review, drag a hero slide, and json-server
rewrites the file. So a plain `git pull` does not conflict; it refuses to start:

```
error: Your local changes to the following files would be overwritten by merge:
	db.json
Please commit your changes or stash them before you merge. Aborting
```

That is every pull, on every machine that has ever been clicked in, and no merge
setting can reach it — git aborts before any merge begins. `npm run pull` sets
the live copy aside (kept at `.git/db.json.before-pull` until it is safely back),
lets git move a clean tree, then folds the local data back in **as data**: your
orders survive, the incoming changes arrive, and `db.json` is left modified in
the working tree, which is where live data belongs. Pass git's own arguments
after `--`, e.g. `npm run pull -- origin main`. If the pull fails before git has
moved anything, the live file goes back byte for byte; if it stops part way, the
live data is folded onto as much as git did move, and the command exits non-zero
so you know the pull itself is unfinished.

Once a merge does begin — pulling a branch you have committed `db.json` on —
`scripts/merge-db-json.js` is also registered as git's **merge driver** for the
file (`.gitattributes` points at it; `npm install` arms it in every clone through
`prepare`). Git then merges `db.json` as DATA rather than by LINE: collections
merge **by record `id`** rather than by position, so rows added on either side all
survive and an insert never shifts its neighbours into a false conflict; a field
only one side touched is simply taken from that side; and the review aggregates
are **recomputed** from the merged reviews by the same rule `src/services/api.js`
applies, rather than picked from a side — `"rating": 4.7` against `"rating": 0`
cannot be settled as text at all, because the number is derived from the
`reviews` collection further down the same file and neither side holds it.

What is left is only what a person genuinely has to decide — the same field
changed to two different values on both sides. Those are printed with both values
and their path, git still marks the file for review, and the file it leaves
behind is always valid JSON with no conflict markers in it.

Git will not run a command a repository supplied, so the driver lives in each
clone's `.git/config`. `npm install` puts it there; `npm run setup:git` re-arms it
by hand if it is ever removed. A clone that has neither is not broken — git falls
back to its built-in text merge and keeps producing the line conflicts. If you are
already staring at one, `npm run db:resolve` settles it from the three sides git
has staged, then `git add db.json && git commit`.

## Live mode

Edit `.env` — comment out the mock pair, uncomment the live pair — and restart
the dev server (CRA reads `.env` once, at boot):

```
# REACT_APP_API_URL=http://localhost:3001
# REACT_APP_USE_MOCK_API=true
REACT_APP_API_URL=https://core.lamikanaturals.com/api/v1
REACT_APP_USE_MOCK_API=false
```

`.env.production` already carries the live pair, so `npm run build` targets
`core.lamikanaturals.com` without further edits. Live responses are the envelope
`{ success, data, meta }`, unwrapped by `extractData()`/`extractMeta()`.

**The Laravel backend lives outside this repository.** Every function in
`src/services/api.js` has a live branch, and the routes those branches call are
specified — method, payload, response — in
[`prompts/_reference/REPO_MAP.md` §3](prompts/_reference/REPO_MAP.md) (§3.4 is
the list of new endpoints, §3.5 the complete hand-off sheet for the backend
team). Until those exist, live mode will 404 on the newer screens.

`npm run test:live` runs the one live-API suite (skipped by default). **It
writes to whatever database `.env.local` points at — never run it against
production.** Point it at a staging host in `.env.local` or leave it alone.

## Admin

The console is at [`/admin`](http://localhost:3000/admin) — same app, its own
theme, its own token. Seeded mock credentials:

```
admin@store.com / admin123
```

**Change both before production.** The seed stores the password in plain text
(`db.json → admins[0]`) because json-server has no hashing; the Laravel side
must not.

Nineteen screens: Dashboard · Products · Categories · Concerns · Rituals ·
Reviews · Orders · Returns · Payments · Coupons · Special Offers · Home & Hero ·
Announcements · Content · FAQs · Shipping · Users · Leads · Settings. Everything
a shopper reads — the hero, the categories, the rituals, the story pages, the
policies, the FAQs, the announcement bar — is edited here, not deployed.

## Data model, in one page

`db.json` holds 23 collections (`prompts/_reference/REPO_MAP.md` §4 is the full
schema). A few things are worth knowing before you touch it:

- **`media[]`** is the product gallery: an ordered list of
  `{ type: "image"|"video", url, alt?, primary?, poster?, title?, placeholder? }`.
  Exactly one *image* row is `primary`; videos never carry the flag; the
  authored order is the display order. A row is a picture and its labels and
  **nothing crops it** — swapping a row's `url` can never leave stale framing
  behind, because there is no framing to leave. (Rows written before this rule
  may still hold a `crop`; `normalizeProduct` drops it on the way in.) `images[]` and `image` are **derived
  mirrors** kept in step by `normalizeProduct`/`syncProductMedia`, because cart
  lines, wishlist snapshots and order items keep a copy of `images[0]` that
  cannot be re-derived later. Edit `media[]`; never edit the mirrors by hand.
- **A video row's `url` may be a file or a hosted link.** A direct file
  (`.mp4`, `.webm`, a Cloudinary delivery URL) plays in the storefront's own
  player, with its own controls. A YouTube, Vimeo, Dailymotion, Google Drive or
  Loom link plays in that provider's embedded player instead —
  `utils/videoSource.js` decides which, and is the one place a provider is
  added. Hosted links are recognised in every shape they are shared in
  (`youtu.be/…`, `/shorts/…`, a `?t=` start time, an unlisted Vimeo hash), and
  a hosted row needs no `poster`: the provider's own thumbnail is used, falling
  back to the product's primary image. Nothing third-party loads until the
  shopper presses play. Anything unrecognised is treated as a file.
- **`heroConfig.slides[]`** is the home carousel, in order. An entry is either
  `{ kind: "product", productId }` or `{ kind: "custom", … }` — a **poster**: a
  picture with as much or as little on it as the merchant wants (an eyebrow, a
  headline, two lines, some marks, a card of its own, up to two buttons, or
  none of them). Every entry may carry its own `background`, its own `layout`
  and its own ground, and the list is saved with the rest of the section in one
  `PUT /heroConfig`.
- **`heroConfig.slides[].eyebrow`** is the slide's **tagline** — the tracked
  gold line over the headline, where the brand's philosophy is said on the
  opening spread ("Ancient Wisdom. Modern Beauty."). It is read on a product
  slide as well as on a poster, and it is the one word of a product slide's copy
  that is stored on the SLIDE rather than on the product: it is this slide's line
  in the carousel's argument, not a fact about the product. A slide that has
  written none falls back to `heroConfig.eyebrowLabel` with its position after it
  ("Black Rice Ritual · 03 / 08"); a tagline is printed on its own, because the
  rail's counter and the slide's `aria-label` already carry the position.
- **`heroOrder`** (1…n, or `null`) is how a product joins that carousel from
  the Products screen, and it is still what `products.getHeroProducts()`
  returns. `heroConfig.slides` is the authority on order and composition; a
  hero product the list does not name is **appended** rather than dropped, so
  the two screens can never disagree about what is on the home page.
  (`buildHeroSlides()` is that reconciliation.) There is no `banners`
  collection any more — it became `announcements`.
- **`layout`** is the composition, held at both levels
  (`heroConfig.layout` is the default every slide inherits, key by key):
  `{ preset, align, vertical, panel, panelStrength, mediaScale, showCopy,
  showMedia, showActions, theme }`. `preset` is one of `text-left` ·
  `text-right` · `text-center` · `split` (card centred, copy either side) ·
  `poster`, and `theme` is `light` | `dark` | `inherit` — the hero is the one
  CONTENT section that may wear the `.sf-on-dark` scope, and it wears it alone.
  `layout.theme` is a SLIDE's ground; the BAND's is `heroConfig.theme`, and the
  section layout's own is `inherit` by construction — a ground found there (the
  admin's Ground select used to write the band's answer onto it) is lifted into
  `heroConfig.theme` by `normalizeHeroConfig`, so the record never says it
  twice and the storefront paints exactly what it painted before.
  A SLIDE stores only the keys it actually overrides — `{ preset: "split" }` is
  a complete, legal slide layout — and every key it is silent about is still the
  section's to answer. That is what "key by key" means, and it is enforced on
  the way in (`normalizeHeroLayoutPatch`) and on the way out of the editor
  (`diffHeroLayout`), so a slide opened once in the admin does not quietly stop
  listening to the default composition.
- **`layout.mediaScale`** is how big the card is, per device:
  `{ desktop, tablet, mobile }` as percentages of the size each composition was
  drawn at (50–150, `100` = the drawing), matching the stylesheet's own
  breakpoints — 1025px and wider, 769–1024px, 768px and narrower. A bare number
  is read as all three. What is stored is the PERCENTAGE and never a width: the
  six compositions each have their own designed width at each breakpoint, those
  stay in `HeroCarousel.module.css`, and this scales whichever one the visitor's
  screen lands on — so one setting keeps the proportions on every device. A card
  is still never taller than the band it sits in, which is what keeps a
  full-screen hero on a short laptop from having to be scrolled past.
- **`background`** is the picture behind one slide —
  `{ url, mobileUrl, position, overlay, blur, showContent }`, all optional but
  the URL, and `null`/absent when the slide has none. A slide falls back to
  `product.heroBackground` (where every slide background lived before the slide
  list existed) and then to `heroConfig.background`, so pasting one link in
  Admin → Home & Hero → Section settings dresses every slide at once.
  `showContent: false` is the legacy spelling of the `poster` preset and is
  still read. **The scrim is not what keeps the copy readable** — the layout's
  `panel` is, and at its default (`auto`) it is computed from how much work the
  scrim and the blur are already doing, so a scrim of 0 cannot cost a merchant
  their headline. Every rule about all of this — the fallbacks, the clamps, the
  inheritance, the legibility floor — lives in `src/utils/heroConfig.js`.
- **`priceTBA`** with `price: null` is the honest unpriced state: the card and
  the PDP show "Price on launch", Add to Cart and Buy now are disabled, and the
  product is excluded from ritual bundles. Five of the eight products ship this
  way — their MRP is not legible on the packaging and nothing invents one.
- **`rituals`** are ordered routines: `steps[{ order, productId,
  alternativeProductId?, note, frequency }]` resolved against the live catalogue
  at read time, so a product going to Draft degrades a step instead of breaking
  the page.
- **`reviews`** carry both halves of the store's social proof in ONE
  collection. A row holds the words (`rating`, `title`, `body`), who wrote them
  (`userName`, plus `avatar` — their own photograph, always optional), what they
  photographed (`photos[]`, up to three pictures of the product), whether the
  purchase was verified, the moderation `status`, and `featured`. The product
  page prints every approved row for that product; the **"What our customers
  say"** band at the foot of every other storefront page reads the same rows
  without a productId and leads with the featured ones
  (`src/utils/testimonials.js` decides which, and a product's own reviews are
  dropped from the band on its own page so nothing appears twice on one screen).
  **A testimonial is therefore never written twice** — there is no second
  collection and no second admin screen; Admin → Reviews is where one is typed,
  photographed and featured. `avatar` and `photos[]` are ordinary image links,
  except that a picture chosen from a phone or a laptop — by the customer in
  My Orders, or by the owner in the admin — is resized in the browser and stored
  inline as a data URL (`src/utils/imageFile.js`). That is the one place in the
  app that does not point at Cloudinary, and it exists because the person
  writing a review has a photograph and no asset pipeline.
- **`siteContent`** is one keyed record (`about`, `whyLamikaa`, `impact`,
  `home`, `contact`, `policies`, `faqPage`) of markdown-lite prose — `##`, `-`,
  `1.`, `>`, `---`, `::callout`, `::steps`, `**bold**`, `[label](/href)` —
  parsed by `src/utils/contentBlocks.js`. And `announcements` are the
  announcement-bar rows, each with an active window.

## Brand configuration

`src/config/brand.js` is the single source of brand truth: names and casing,
tagline, philosophy, pillars, value chain, trust badges, pack badges, the logo
and icon URLs, contact and social fields, SEO defaults, and two feature flags
(`showSampleReviews`, `enableRitualBundles`). **No other file in `src/`
hard-codes the brand name, the legal name, the logo URL or the icon URL** — the
owner rebrands by editing one file. `src/config/brand.test.js` pins the parts
that must not drift.

## Placeholders — what the owner still has to supply

Facts nobody has supplied yet are carried as literal `{{UPPER_SNAKE}}` tokens,
never as invented values, and every surface that reads one **hides the row
rather than printing it** (`src/utils/placeholders.js`). The full register is
[`prompts/_reference/PLACEHOLDERS.md`](prompts/_reference/PLACEHOLDERS.md); the
stand-in photography and video are in
[`PLACEHOLDER_ASSETS.md`](prompts/_reference/PLACEHOLDER_ASSETS.md). Both carry a
generated inventory you can refresh at any time:

```bash
npm run placeholders
```

Where each kind is resolved:

| Unknown | Resolve it in |
|---|---|
| Prices (5 products) | Admin → Products → the product → Price (clear "Price to be announced") |
| Contact email / phone / address / hours | Admin → Settings → Store |
| Social profiles | Admin → Settings → Social Links |
| Free-shipping threshold, dispatch SLA | Admin → Shipping (`freeAbove`, `estimatedDays`) |
| Launch offer, announcement copy | Admin → Announcements |
| GSTIN, CIN, jurisdiction, refund timeline, return window | Admin → Content (the policy bodies) and `src/theme/tokens.js → STOREFRONT_CONFIG` |
| Shelf life, certifications | `src/config/brand.js` (`productDefaults.shelfLife`, `packBadges`) |
| Public domain | `src/config/brand.js → seo.siteUrl`, then `npm run sitemap`, then uncomment the `Sitemap:` line in `public/robots.txt` |
| Placeholder photography and video | Admin → Products → Media (product galleries) and Admin → Content (category, ritual and story imagery) |

## Scripts

| Script | What it does |
|---|---|
| `npm start` | Storefront + admin dev server on :3000 |
| `npm run server` | Mock API on :3001 (`server.js` over `db.json`) |
| `npm run dev` | Both of the above |
| `npm run build` | Production build. Use `CI=true npm run build` — it turns warnings into errors, which is the gate the project holds itself to |
| `npm test` | Jest in watch mode; `npm test -- --watchAll=false` for one pass |
| `npm run sitemap` | Writes `public/sitemap.xml` from `db.json` + the static routes. **No-ops with a notice while `brand.seo.siteUrl` is a placeholder** — a sitemap has no relative form to fall back on |
| `npm run placeholders` | Regenerates the two placeholder inventories (tokens, stand-in media) as Markdown tables |
| `npm run pull` | **Pulls over a live `db.json`.** Plain `git pull` aborts because the running app keeps the file modified (see *Pulling and merging `db.json`*). Git's own arguments go after `--` |
| `npm run setup:git` | Re-arms the structural `db.json` merge driver. `npm install` already does this in every clone via `prepare` |
| `npm run db:resolve` | Resolves a `db.json` conflict git is already holding, in a clone with no driver armed |
| `npm run test:live` | The live-API suite. **Writes to the real database — staging URLs only, never production** |

## Deployment

`CI=true npm run build` emits a static `build/` — HTML, hashed JS/CSS chunks,
the manifest, favicons and `robots.txt` — that any static host or CDN can serve.
Two things to get right:

1. **Environment variables are read at build time, not run time.** CRA inlines
   every `REACT_APP_*` value into the bundle, so the API URL and mode are fixed
   when you build. A build made in mock mode will talk to `localhost:3001` in
   production. Build with `.env.production` (the committed live pair) or export
   the variables in CI.
2. **Serve it as an SPA**: every unknown path must fall back to `/index.html`, or
   deep links like `/product/black-rice-face-wash` will 404 at the edge before
   React ever sees them. The app's own 404 page handles genuinely unknown routes.

Before a first public deploy: change the admin credentials, replace the sample
data listed in [`RELEASE_NOTES.md`](RELEASE_NOTES.md), set
`brand.seo.siteUrl` and run `npm run sitemap`.

## The `prompts/` folder

The rebuild from the previous storefront to LAMIKAA NATURALS was delivered as 39
sequential prompts. [`prompts/00_INDEX.md`](prompts/00_INDEX.md) is the
programme, [`prompts/PROGRESS.md`](prompts/PROGRESS.md) the running log of what
each one did and decided, and `prompts/_reference/` the shared source of truth —
the repository map and API contract, the brand and product briefs, the design
system, the placeholder registers, and the QA and audit records.

**The programme is complete.** The folder is documentation of how the store came
to be, not something the application reads: nothing in `src/`, `public/` or
`db.json` imports from it, and `CI=true npm run build` never looks at it. It can
be deleted or archived outside the repository whenever the developer is ready —
`REPO_MAP.md`, `PLACEHOLDERS.md` and `PLACEHOLDER_ASSETS.md` are the three worth
keeping, because the backend hand-off and the owner's to-do list live in them.
Rewriting git history to remove it is out of scope and is not recommended.
