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
| Admin | MUI 5 on its own isolated dark theme (`src/theme/adminTheme.js`) |
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
schema). Five things are worth knowing before you touch it:

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
- **`heroOrder`** (1…n, or `null`) drives the home hero: the slides *are* the
  products, ordered by this field, with `heroHeadline`/`heroSubtext` per slide.
  There is no `banners` collection any more — it became `announcements`.
- **`heroBackground`** is the picture behind one slide —
  `{ url, mobileUrl, position, overlay, blur, showContent }`, all optional but
  the URL, and `null`/absent when the slide has none. `heroConfig.background`
  holds the same shape for the whole section, and a slide falls back to it.
  Pasting one link in Admin → Home & Hero → Section settings therefore dresses
  every slide at once; `showContent: false` makes a slide the picture alone.
  Every rule about them (the fallbacks, the clamps, the scrim) lives in
  `src/utils/heroConfig.js`.
- **`priceTBA`** with `price: null` is the honest unpriced state: the card and
  the PDP show "Price on launch", Add to Cart and Buy now are disabled, and the
  product is excluded from ritual bundles. Five of the eight products ship this
  way — their MRP is not legible on the packaging and nothing invents one.
- **`rituals`** are ordered routines: `steps[{ order, productId,
  alternativeProductId?, note, frequency }]` resolved against the live catalogue
  at read time, so a product going to Draft degrades a step instead of breaking
  the page.
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
