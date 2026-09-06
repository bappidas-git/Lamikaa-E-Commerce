# Prompt 38 — Accessibility, performance and SEO audit

- **Phase:** 6 — Cleanup and QA
- **Depends on:** 37
- **Unlocks:** 39
- **Scope:** M
- **Expected files to change/create:** create `scripts/generate-sitemap.js`, `public/sitemap.xml` (only when the domain is resolved), `prompts/_reference/AUDIT.md`; change `public/robots.txt`, `public/index.html` (only if flagged), any `src/**` file an audit finding requires (listed in `PROGRESS.md`), `package.json` (`"sitemap": "node scripts/generate-sitemap.js"` script).

## Preamble

You are Claude Code continuing the LAMIKAA NATURALS rebuild of this repository. Before doing anything, read `prompts/00_INDEX.md`, `prompts/PROGRESS.md` and `prompts/_reference/REPO_MAP.md`, `BRAND.md`, `PRODUCTS.md`, `DESIGN_SYSTEM.md`, `PLACEHOLDERS.md`. Confirm that prompts 01–37 are marked complete in `PROGRESS.md`; if not, stop and report. Do not ask clarifying questions unless truly blocked — make decisions consistent with the reference files and log them in `PROGRESS.md`.

## Objective

Audit the storefront for WCAG 2.1 AA, keyboard completeness, reduced motion, Lighthouse performance and SEO (meta/OG/JSON-LD/canonical/manifest/robots/sitemap), fix every finding, and record the numbers.

## Pre-flight checks

```bash
npx --yes @axe-core/cli --version 2>/dev/null || echo "axe CLI unavailable — use the browser extension"
CI=true npm run build && npx --yes serve -s build -l 5000 &   # production server for Lighthouse
grep -n "siteUrl" src/config/brand.js prompts/_reference/PLACEHOLDERS.md | head -3
```

## Tasks

1. **Accessibility (axe + manual)** — run axe on: `/`, `/shop`, `/category/face-care`, `/product/black-rice-face-wash` (gallery + lightbox open), `/rituals/morning-glow`, `/cart`, `/checkout` (each step), `/orders`, `/profile`, `/wishlist`, `/faq`, `/contact`, `/about`, `/why-lamikaa`, `/policies/terms`, `/login` (modal open), `/admin/products` (form open). Fix every violation and serious best-practice finding. Manual: heading order (one `h1`), landmarks, carousel/gallery ARIA, live regions (cart count, search results, slide changes), focus order across the header → hero → chapters → footer, focus visibility on every control (glass surfaces included), colour contrast of muted text on glass over imagery (use the scrim), `aria-current` on nav, form errors announced, drawers/modals/lightbox traps, `Escape` everywhere, touch targets. Keyboard-only run of the full purchase flow and the review flow.
2. **Reduced motion** — with `prefers-reduced-motion: reduce`: no autoplay, no breathing glows, no parallax, instant transitions, confetti skipped, video never autoplays; verify on hero, CTA, chapters, drawers, lightbox.
3. **Performance (Lighthouse mobile on the production build)** — `/`, `/shop`, `/product/black-rice-face-wash`, `/checkout`: targets Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95. Common fixes: `sizes` attributes, `fetchpriority` on the LCP image only, `preload` of the Fraunces/Manrope CSS (already via link), `content-visibility: auto` on deferred sections, avoid layout thrash in scroll handlers (rAF), image `decoding="async"`, `preload="metadata"` on videos and none mounted off-screen, chunk sizes (`build/static/js`), unused MUI icons (import individual icons), `framer-motion` only where used. Record the four scores per page in `AUDIT.md`.
4. **SEO** — every page: unique `<title>` via `titleTemplate`, meta description, canonical, OG/Twitter (image = product stage or logo), `noindex` on checkout/confirmation/cart/profile/orders/wishlist/search/404/login; JSON-LD validated (`Organization` + `WebSite` on `/`, `ItemList` on shop/category, `Product` (+`BreadcrumbList`) on PDPs, `FAQPage` on `/faq`, `BreadcrumbList` on rituals/categories); `manifest.json` installable (Lighthouse PWA checks that apply); favicons; `robots.txt`.
5. **Sitemap** — `scripts/generate-sitemap.js`: reads `db.json` (visible products, active categories, active rituals) + the static routes (`/`, `/shop`, `/rituals`, `/about`, `/why-lamikaa`, `/faq`, `/contact`, `/policies/*`) and writes `public/sitemap.xml` with absolute URLs built from `brand.seo.siteUrl`; exits without writing (and prints a notice) while `siteUrl` is a placeholder. `package.json` script `"sitemap"`. `robots.txt` carries the `Sitemap:` line only when the file exists (decide per the placeholder state; record it).
6. **`AUDIT.md`** — findings table (page · tool · finding · fix · commit), Lighthouse scores before/after, axe totals, the keyboard-run notes, and open items the owner must supply (domain for canonical/sitemap, social URLs for `sameAs`).

## Design and content specification

Fixes must not alter the design language; contrast fixes use the scrim/`--sf-color-text-secondary` route, not colour changes outside the tokens.

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
- Prompt-specific: no runtime dependency may be added for the audit (CLI tools via `npx` only); no `aria-hidden` on focusable content; no JSON-LD claims beyond the data.

## Acceptance criteria

- [ ] axe: 0 violations on every listed page; keyboard-only purchase and review flows complete.
- [ ] Lighthouse mobile scores meet the targets on the four pages (recorded).
- [ ] SEO checklist complete; JSON-LD validates; `noindex` on private pages; sitemap script works (writes only with a resolved domain).
- [ ] `AUDIT.md` committed.
- [ ] `CI=true npm run build` and `npm test -- --watchAll=false` pass.

## Verification

```bash
CI=true npm run build && npm test -- --watchAll=false
node scripts/generate-sitemap.js      # notice or sitemap.xml
ls public/sitemap.xml 2>/dev/null; grep -n Sitemap public/robots.txt
```

Manual QA: the audit itself; re-run axe after fixes.

## Handoff

1. `PROGRESS.md`: row 38 → `complete`; scores and open owner items.
2. `AUDIT.md` under `prompts/_reference/`; `PLACEHOLDERS.md` (domain dependency noted).
3. Commit: `feat(lamikaa): 38 accessibility, performance and seo audit`.
