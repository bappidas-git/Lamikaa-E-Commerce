# Prompt 22 — Home assembly, performance and SEO

- **Phase:** 2 — Home page
- **Depends on:** 21
- **Unlocks:** 23
- **Scope:** M
- **Expected files to change/create:** rewrite `src/pages/Home/Home.js` and `Home.module.css`; create `src/components/home/RecentlyViewed.js` and `src/components/home/useHomeData.js` (single data hook for the home sections); delete `src/components/FeaturedProducts/` and `src/components/CTASection/`; change `src/utils/constants.js` (remove `TRUST_BADGES`/`WHY_CHOOSE_US` if unused), `src/hooks/useSeo.js` (Organization JSON-LD helper), `prompts/00_INDEX.md` is **not** edited by build prompts — record the "recently viewed kept" justification in `PROGRESS.md`.

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–21 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Assemble the final home page in the brief's order, remove every old Meghali section, keep "Recently viewed" as the one justified secondary section, defer below-the-fold work, and add page SEO with `Organization` JSON-LD — then prove the page meets the mobile Lighthouse targets.

## Pre-flight checks

```bash
grep -n "Where to begin\|THE EDIT\|ON OFFER\|OUR CRAFT\|TRENDING\|RECENTLY VIEWED\|PROMISES" src/pages/Home/Home.js | head
grep -rn "components/FeaturedProducts\|components/CTASection" src --include=*.js | grep -v "^src/components/\(FeaturedProducts\|CTASection\)"   # 0 consumers
grep -n "recentlyViewed" src/pages/ProductDetails/ProductDetails.js | head -3
```

## Tasks

1. **`useHomeData()`** — create `src/components/home/useHomeData.js`: one hook that loads `products.getAll()`, `getHeroProducts()`, `categories.getAll()`, `concerns.getAll()` and `rituals.getAll()` once (in parallel, with the `useAsync`/cache helpers from Prompt 05), returns `{ products, heroProducts, categories, concerns, rituals, loading, error }`, and is called once in `Home.js`; the sections receive their slices as props (or through a small `HomeDataContext` if prop drilling exceeds two levels). Sections built in Prompts 14–21 that fetch on their own are switched to props here.
2. **Final order in `Home.js`** (each section a lazy chunk except the hero and trust strip, mounted through a `DeferredSection` wrapper that renders its child once `useInView` fires with `rootMargin: "600px"` and otherwise a `Skeleton` of the section's reserved height):
   1. `HeroCarousel` (eager)
   2. `TrustStrip` (eager)
   3. `ProductShowcase`
   4. `ShopByCategory`
   5. `AboutTeaser`
   6. `WhyBlackRice`
   7. `RitualsTeaser`
   8. `FullPageCta`
   9. `WhyLamikaaSection`
   10. `RecentlyViewed` (only when the localStorage list resolves to ≥ 2 live products)
   11. `HomeFaqs`
   (Footer follows from the shell.) The brief's order places Shop-by-category after the showcase; keep `ShopByCategory` **after** the eight chapters as listed here (the brief §7.2 item 4) — Prompt 15 mounted it before; move it now.
3. **`RecentlyViewed`** — port the existing reconciliation logic (`Home.js:292-307`: localStorage `recentlyViewed`, reconciled against `products.getAll()`, order kept, drafts dropped) into a compact rail of `ProductCard`s (`useRail` hook ported from the old file with its `ResizeObserver` logic), eyebrow "Recently viewed", title "Where you left off", quiet; hidden with < 2 items. Justification to log: existing storefront functionality preserved (brief §7.2 "only if your repository analysis justifies it").
4. **Delete** the old sections and files: collection stories, edit grid, offers rail + countdown (the deals page still exists at `/special-offers`; the home no longer duplicates it — record this), heritage band, trending rail, promises row; delete `src/components/FeaturedProducts/*` and `src/components/CTASection/*`; remove `PROMISE_DETAIL`, `FEATURED_LINK`, `TRENDING_LINK`, `ALL_PRODUCTS_LINK`, `COLLECTION_STORIES`, `CountdownTimer`, `SectionHeader` (replaced by `SectionHeading`) from `Home.js`; `Home.module.css` becomes the page rhythm only. If `TRUST_BADGES`/`WHY_CHOOSE_US` in `constants.js` have no remaining consumer, delete them.
5. **SEO** — `useSeo({ title: "", description: brand.seo.defaultDescription, image: brand.seo.ogImage, jsonLd: [organizationJsonLd(), websiteJsonLd()] })` where `organizationJsonLd()` (new helper in `src/hooks/useSeo.js` or `src/utils/seo.js`) returns `{ "@context": "https://schema.org", "@type": "Organization", name: "LAMIKAA Naturals", legalName: "Bokakhat Agro Organic Producer Co. Ltd.", url: <siteUrl or origin>, logo: cld(brand.logoUrl,{w:600}), sameAs: [resolved social URLs only] }` and `websiteJsonLd()` returns `WebSite` with a `SearchAction` targeting `/search?q={search_term_string}`.
6. **Performance** — measure with Lighthouse (mobile, DevTools, `npm run build` + `npx serve -s build` or the CRA preview): targets Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. Fix what the audit flags within this page's scope: image `sizes`, `aspect-ratio` on every media box, `content-visibility: auto` + `contain-intrinsic-size` on deferred sections, no render-blocking font CSS beyond the one link (it is `display=swap`), total JS on `/` ≤ 350 kB gzipped (check `build/static/js`), no layout shift from fonts (`font-display: swap` + `size-adjust` fallback metrics if CLS > 0.05: add `@font-face` overrides for the fallback families in `index.css`).
7. **Mobile polish** — walk the whole page at 360/390/414: no horizontal scroll (`document.documentElement.scrollWidth === innerWidth`), tap targets ≥ 44px, sticky elements never cover CTAs, the bottom nav does not overlap the last section's CTA (padding), announcement + header ≤ 100px.
8. **Old CSS** — `Home.module.css` rewritten; no `.dark`, no heritage weave, no rail styles except the compact recently-viewed rail.

## Design and content specification

Vertical rhythm `--sf-section-y` between sections; alternate grounds: hero (bg) → showcase (bg) → categories (bg) → about (surface band) → why black rice (bg) → rituals (bg) → full-page CTA (photo) → why LAMIKAA (bg) → recently viewed (surface band, tight) → FAQs (bg). Scroll reveals: fade + 16px rise once per section; hero and trust strip do not reveal (they are above the fold). Only two breathing glows exist (hero, CTA) and never share a viewport.

## Data and API changes

None.

## Guardrails

- Preserve every existing storefront and admin functionality; never remove a feature to make styling easier.
- No Meghali's Silk names, copy, assets, sample data, colours, fonts or identifiers may be introduced or left behind in touched files.
- No light/dark toggle in the storefront; the design system tokens are the only styling source; no hard-coded colours.
- Any `db.json`/`api.js` change is made in both api modes and reflected in the admin.
- Mobile first; all breakpoints verified; WCAG AA; reduced motion respected.
- No new heavy dependencies without justification; `npm run build` clean; tests pass.
- Do not invent brand facts; use placeholder tokens and log them.
- Products and LAMIKAA branding stay the visual focus; effects stay subtle.
- Prompt-specific: the deals page stays reachable (`/special-offers`, nav "Offers" when enabled) even though the home rail is gone; no section may fetch the same collection twice — lift `products.getAll()`/`getHeroProducts()`/`categories`/`concerns`/`rituals` into one `useHomeData()` hook (`src/components/home/useHomeData.js`) that the sections consume via props/context.

## Acceptance criteria

- [ ] Home renders the eleven sections in order with one data load per collection; old sections and the two unused components are deleted.
- [ ] Lighthouse mobile on the production build: Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 (record the four numbers).
- [ ] `Organization` and `WebSite` JSON-LD present and valid (paste into the Schema.org validator or Google's Rich Results test).
- [ ] No horizontal scroll at 360/390/414; CLS < 0.1; one `h1`.
- [ ] `grep -rn "FeaturedProducts\|CTASection\|heritage\|Where to begin\|Chosen this season" src` → 0.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
test ! -d src/components/FeaturedProducts && test ! -d src/components/CTASection && echo "unused components removed"
du -ch build/static/js/*.js | tail -1
npx serve -s build -l 5000 &   # then Lighthouse mobile on http://localhost:5000/
```

Manual QA at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440: full scroll, deferred sections appear without flashes, reduced motion, keyboard walk of every CTA.

## Handoff

1. `PROGRESS.md`: row 22 → `complete`; Decisions log: "Recently viewed kept (existing functionality); home offers rail removed (deals page remains)"; Lighthouse numbers.
2. `REPO_MAP.md` §6 "Updated by Prompt 22" (final home composition; removed components).
3. Commit: `feat(lamikaa): 22 home assembly, performance and seo`.
