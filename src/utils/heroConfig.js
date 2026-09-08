// =============================================================================
// Hero section configuration — shared shape, defaults & normalizers
// =============================================================================
//
// The storefront hero is fully admin-managed. Two things drive it:
//
//   • `heroConfig` — a singleton (json-server object in mock mode,
//     `GET/PUT /hero/config` on Laravel) holding everything that belongs to the
//     SECTION rather than to one slide: the master toggle, autoplay and its
//     timer, the transition and which chrome is shown (hairlines / counter /
//     progress / arrows / pause).
//
//   • the SLIDES — one per PRODUCT. A product joins the carousel by carrying a
//     `heroOrder` and prints its own `heroHeadline`/`heroSubtext`
//     (`heroConfig.source === "products"`). apiService.products.getHeroProducts()
//     returns them in order, and Admin → Home & Hero writes that order back
//     through apiService.admin.setHeroOrder().
//
// Nothing about the hero is hardcoded in the component: it reads the config and
// the catalogue and renders them.
//
// UPDATED BY PROMPT 34 — THE SLIDE STORE IS GONE
//   Prompt 07 left a shelf of deprecated slide-store machinery here
//   (`HERO_BACKGROUND_TYPES`, `HERO_TEXT_ALIGNMENTS`, `HERO_IMAGE_POSITIONS`,
//   `HERO_DEVICES`, `DEFAULT_HERO_HEIGHTS`, `DEFAULT_HERO_SECONDARY_CTA`,
//   `DEFAULT_HERO_OPENERS`, `DEFAULT_HERO_SLIDE`, `HERO_MIN/MAX_DURATION_MS`,
//   `HERO_FALLBACK_SLIDES`, `normalizeHeroHeights`, `normalizeHeroSlide(s)`,
//   `heroSlideDuration`, `heroSlideOverlay`, `heroStageVars`) because the
//   temporary Admin → Hero screen still imported it. That screen is now the real
//   Home & Hero editor and imports none of it, so all of it is DELETED. A slide
//   is a product; its copy lives on the product; its picture is the product's
//   own media; the stage height is `HeroCarousel.module.css`'s business; and
//   `HeroCarousel` draws its own brand fallback when nothing resolves.
//
//   What survives is the section record and its guard rails — the ten keys
//   `HeroCarousel` actually reads, `HERO_TRANSITIONS`, the interval clamps and
//   `clampInt`. `normalizeHeroConfig()` stays deliberately tolerant: a record
//   written by an older build (or a hand-edited `db.json`) resolves every
//   missing key to its designed default rather than to `undefined`.
//
//   TWO KEYS THE CAROUSEL TREATS AS BEHAVIOUR, NOT DECORATION
//     • `showPause` (default on) is the pause/play control. Turning it OFF stops
//       the hero autoplaying rather than leaving it unstoppable — motion that
//       starts by itself must be stoppable (WCAG 2.2.2).
//     • `intervalMs` defaults to 6500 and is clamped to 3000–15000. A slide that
//       carries a headline, a price and two CTAs cannot be read in one second,
//       and one that sits for a minute is not a carousel.
// =============================================================================

// ─── Vocabularies (shared by the admin select and the renderer) ──────────────

// "slide" was dropped in Prompt 34: the carousel crossfades or swaps, and a
// horizontal travel between two centred product plates read as a glitch.
// `normalizeHeroConfig` resolves an older record's "slide" to the default.
export const HERO_TRANSITIONS = [
  { value: "fade", label: "Crossfade", hint: "Slides dissolve into each other" },
  { value: "none", label: "None", hint: "Instant swap, no motion" },
];

// ─── Defaults ────────────────────────────────────────────────────────────────

// The slides' origin. "products" is the only source there is — the carousel is
// the catalogue, ordered by `heroOrder` — but the key is stored and normalised
// so a future source (a curated collection, a campaign) is a data change rather
// than a code change.
export const HERO_SOURCE_PRODUCTS = "products";

export const DEFAULT_HERO_CONFIG = {
  enabled: true,
  source: HERO_SOURCE_PRODUCTS,
  autoplay: true,
  // Long enough to read a headline, a price, one line of subtext and reach a
  // CTA before the slide moves on.
  intervalMs: 6500,
  transition: "fade",
  pauseOnHover: true,
  showControls: true,
  showCounter: true,
  showProgress: true,
  showArrows: false,
  // The pause/play control. Turning it OFF turns autoplay off with it — see
  // normalizeHeroConfig() below and HeroCarousel's `autoplayOn`.
  showPause: true,
};

// The product carousel's timer guard rails, shared by the admin input and the
// runtime, so a hand-edited db.json can never leave the hero strobing.
export const HERO_INTERVAL_MIN_MS = 3000;
export const HERO_INTERVAL_MAX_MS = 15000;

// ─── Coercion helpers ────────────────────────────────────────────────────────

const toInt = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};

export const clampInt = (value, min, max, fallback) => {
  const n = toInt(value, NaN);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const oneOf = (value, allowed, fallback) =>
  allowed.some((o) => o.value === value) ? value : fallback;

// ─── heroConfig ──────────────────────────────────────────────────────────────

// Fill in any missing fields so the storefront and admin always work against a
// complete shape, even on an older db.json or a partial API response.
export const normalizeHeroConfig = (raw) => {
  const cfg = raw && typeof raw === "object" ? raw : {};
  return {
    // Every toggle defaults to ON unless explicitly false, so a config written
    // by an older build never silently hides part of the hero.
    enabled: cfg.enabled !== false,
    // Only one source exists today, so anything unrecognised resolves to it —
    // a config that predates the key still drives a product carousel.
    source: HERO_SOURCE_PRODUCTS,
    autoplay: cfg.autoplay !== false,
    intervalMs: clampInt(
      cfg.intervalMs,
      HERO_INTERVAL_MIN_MS,
      HERO_INTERVAL_MAX_MS,
      DEFAULT_HERO_CONFIG.intervalMs
    ),
    transition: oneOf(cfg.transition, HERO_TRANSITIONS, DEFAULT_HERO_CONFIG.transition),
    pauseOnHover: cfg.pauseOnHover !== false,
    showControls: cfg.showControls !== false,
    showCounter: cfg.showCounter !== false,
    showProgress: cfg.showProgress !== false,
    // The arrows are the one piece of chrome that is off by default — the
    // hairline controls carried the whole affordance before this screen existed.
    showArrows: cfg.showArrows === true,
    // WCAG 2.2.2. This is not merely "draw the button": HeroCarousel refuses to
    // autoplay while it is false, so switching the control off can only ever
    // make the hero quieter, never make it unstoppable.
    showPause: cfg.showPause !== false,
  };
};
