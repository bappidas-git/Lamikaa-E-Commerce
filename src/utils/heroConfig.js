// =============================================================================
// Hero section configuration — shared shape, defaults & normalizers
// =============================================================================
//
// The storefront hero is fully admin-managed. Two things drive it:
//
//   • `heroConfig` — a singleton (json-server object in mock mode,
//     `GET/PUT /hero/config` on Laravel) holding everything that belongs to the
//     SECTION rather than to one slide: the master toggle, the slide source,
//     autoplay + default timer, the transition and which chrome is shown
//     (counter / hairlines / progress / arrows). The seeded record stops there;
//     the presentation keys below it (scrim strength, per-device stage height,
//     the shared secondary CTA, the collection-openers row) are defaults this
//     module supplies until Prompt 14 rebuilds the hero.
//
//   • the SLIDES — one per PRODUCT. A product joins the carousel by carrying a
//     `heroOrder` and prints its own `heroHeadline`/`heroSubtext`
//     (`heroConfig.source === "products"`). apiService.products.getHeroProducts()
//     returns them in order, and Admin → Hero writes that order back through
//     apiService.admin.setHeroOrder().
//
// Nothing about the hero is hardcoded in the component any more: it reads the
// config and the catalogue and renders them. `HERO_FALLBACK_SLIDES` exists only
// so the storefront still opens on something branded if the API is unreachable.
//
// BACKWARD COMPATIBILITY
//   normalizeHeroSlide() takes a slide in ANY shape — the product-derived one
//   the storefront builds today, or a hand-written row carrying only
//   { title, subtitle, cta, link, gradient, image } — infers the background
//   type from whatever media is present, defaults the row to active, and falls
//   back to the array index for order.
//
//   normalizeHeroConfig() is the same kind of tolerant: the seeded record is
//   now much smaller (behaviour only — no `heights`, `openers`, `secondaryCta`
//   or `overlayOpacity`), and every one of those missing keys resolves to the
//   designed default rather than to undefined.
//
// UPDATED BY PROMPT 14
//   `components/home/HeroCarousel` is the hero now, and it reads exactly seven
//   keys: `enabled`, `autoplay`, `intervalMs`, `transition`, `pauseOnHover`,
//   and the chrome flags `showControls` / `showCounter` / `showProgress` /
//   `showArrows` / `showPause`. Two things changed for it:
//
//     • `showPause` (new, default on) is the pause/play control. The carousel
//       does not merely hide the button when it is off — it stops autoplaying,
//       because motion that starts by itself must be stoppable (WCAG 2.2.2).
//     • `intervalMs` defaults to 6500 and is clamped to 3000–15000. The old
//       1000–60000 guard rail was for hand-written banner slides; a slide that
//       carries a headline, a price and two CTAs cannot be read in one second,
//       and one that sits for a minute is not a carousel.
//
//   EVERYTHING BELOW MARKED `@deprecated` IS SLIDE-STORE MACHINERY. The hero no
//   longer reads any of it; only the temporary Admin → Hero screen still
//   imports it, and Prompt 34 rebuilds that screen and deletes these exports.
// =============================================================================

import brand from "../config/brand";
import { APP_NAME, ROUTES } from "./constants";

// ─── Vocabularies (shared by the admin selects and the renderer) ─────────────

/** @deprecated — removed in Prompt 34. Slide backgrounds; the hero renders
    product media through `CloudinaryImage`, which has no background type. */
export const HERO_BACKGROUND_TYPES = [
  { value: "gradient", label: "Gradient", icon: "mdi:gradient-horizontal" },
  { value: "image", label: "Image", icon: "mdi:image-outline" },
  { value: "video", label: "Video", icon: "mdi:video-outline" },
];

export const HERO_TRANSITIONS = [
  { value: "fade", label: "Crossfade", hint: "Slides dissolve into each other" },
  { value: "slide", label: "Slide", hint: "Slides travel in from the side" },
  { value: "none", label: "None", hint: "Instant swap, no motion" },
];

/** @deprecated — removed in Prompt 34. The carousel's copy column has one
    alignment: the one the two-column composition gives it. */
export const HERO_TEXT_ALIGNMENTS = [
  { value: "left", label: "Left", icon: "mdi:format-align-left" },
  { value: "center", label: "Centre", icon: "mdi:format-align-center" },
  { value: "right", label: "Right", icon: "mdi:format-align-right" },
];

/** @deprecated — removed in Prompt 34. object-position for a cover-cropped
    background; the label card is contained and padded, never cropped. */
export const HERO_IMAGE_POSITIONS = [
  { value: "right center", label: "Right" },
  { value: "center center", label: "Centre" },
  { value: "left center", label: "Left" },
  { value: "center top", label: "Top" },
  { value: "center bottom", label: "Bottom" },
];

/** @deprecated — removed in Prompt 34. Per-device stage heights are gone: the
    hero is `calc(100svh - 100px)` from 769px up and content-driven below. */
export const HERO_DEVICES = [
  { key: "desktop", label: "Desktop", icon: "mdi:monitor", hint: "1025px and wider" },
  { key: "tablet", label: "Tablet", icon: "mdi:tablet", hint: "769px to 1024px" },
  { key: "mobile", label: "Mobile", icon: "mdi:cellphone", hint: "768px and below" },
];

// ─── Defaults ────────────────────────────────────────────────────────────────

/** @deprecated — removed in Prompt 34, with HERO_DEVICES. */
export const DEFAULT_HERO_HEIGHTS = {
  desktop: { min: 520, vh: 78, max: 780 },
  tablet: { min: 480, vh: 70, max: 640 },
  mobile: { min: 460, vh: 66, max: 600 },
};

/** @deprecated — removed in Prompt 34. The carousel's second CTA is Add to
    Cart, which is a product action, not an editable link. */
export const DEFAULT_HERO_SECONDARY_CTA = {
  enabled: true,
  label: "Our Story",
  link: "/about",
};

/** @deprecated — removed in Prompt 34. The index under the hero lists the
    hero PRODUCTS now; the collection openers moved to the mega panel. */
export const DEFAULT_HERO_OPENERS = {
  enabled: true,
  label: "Collections",
  limit: 8,
};

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
  // Scrim strength as a percentage of the stylesheet's designed gradient.
  // 100 = as designed, 0 = no scrim at all (bare media).
  overlayOpacity: 100,
  heights: DEFAULT_HERO_HEIGHTS,
  secondaryCta: DEFAULT_HERO_SECONDARY_CTA,
  openers: DEFAULT_HERO_OPENERS,
};

/** @deprecated — removed in Prompt 34. There is no slide record any more: a
    slide IS a product, and its copy lives on the product. */
export const DEFAULT_HERO_SLIDE = {
  title: "",
  subtitle: "",
  // Blank = derive from the category the slide links to (falling back to the
  // store name), which is what the hero did before the eyebrow was editable.
  eyebrow: "",
  cta: "Shop the Collection",
  link: ROUTES.SHOP,
  // Blank = inherit the section-wide secondary CTA.
  secondaryCtaLabel: "",
  secondaryCtaLink: "",
  backgroundType: "gradient",
  gradient: "var(--sf-gradient-brand)",
  image: "",
  imagePosition: "right center",
  videoUrl: "",
  videoPoster: "",
  // null = inherit heroConfig.overlayOpacity.
  overlayOpacity: null,
  textAlign: "left",
  // 0 = inherit heroConfig.intervalMs.
  durationMs: 0,
  isActive: true,
  sortOrder: 0,
};

/** @deprecated — removed in Prompt 34, with the per-slide `durationMs` they
    guard. The SECTION timer uses HERO_INTERVAL_MIN/MAX_MS below. */
export const HERO_MIN_DURATION_MS = 1000;
/** @deprecated — removed in Prompt 34. See HERO_INTERVAL_MAX_MS. */
export const HERO_MAX_DURATION_MS = 60000;

// The product carousel's own timer guard rails, tighter than the old banner
// pair because a slide now carries a headline, a price, two CTAs and a badge
// row: under three seconds nobody finishes reading it, and over fifteen the
// hero has stopped being a carousel. Shared by the admin input and the runtime,
// so a hand-edited db.json can never leave the hero strobing.
export const HERO_INTERVAL_MIN_MS = 3000;
export const HERO_INTERVAL_MAX_MS = 15000;

/** @deprecated — removed in Prompt 34. HeroCarousel renders its own brand
    slide (wordmark + `brand.tagline` + one CTA) when nothing resolves; it needs
    no slide record to do it. */
// Shown only when the catalogue is unreachable, so the storefront never opens
// on an empty stage. The real slides are the products themselves.
//
// It carries NO photography and NO fact that is not already in brand.js: a
// gradient ground, the brand name and the brand's own tagline. An offline
// storefront must not be the one surface that invents a claim.
export const HERO_FALLBACK_SLIDES = [
  {
    id: "fallback-1",
    title: brand.name,
    subtitle: brand.tagline,
    cta: "Shop the range",
    link: ROUTES.SHOP,
    backgroundType: "gradient",
    gradient: "var(--sf-gradient-brand)",
    image: "",
  },
];

// Eyebrow shown when a slide has no explicit one and points somewhere that
// isn't a category (e.g. the offers page).
export const DEFAULT_HERO_EYEBROW = APP_NAME;

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

const toText = (value, fallback = "") =>
  typeof value === "string" ? value : value == null ? fallback : String(value);

const oneOf = (value, allowed, fallback) =>
  allowed.some((o) => o.value === value) ? value : fallback;

// ─── heroConfig ──────────────────────────────────────────────────────────────

/** @deprecated — removed in Prompt 34, with HERO_DEVICES. */
export const normalizeHeroHeights = (raw) => {
  const src = raw && typeof raw === "object" ? raw : {};
  const out = {};
  HERO_DEVICES.forEach(({ key }) => {
    const d = src[key] && typeof src[key] === "object" ? src[key] : {};
    const fallback = DEFAULT_HERO_HEIGHTS[key];
    const min = clampInt(d.min, 200, 1200, fallback.min);
    const max = clampInt(d.max, 200, 1600, fallback.max);
    out[key] = {
      min,
      vh: clampInt(d.vh, 20, 100, fallback.vh),
      // A max below the min would collapse clamp() onto the max — keep them sane.
      max: Math.max(min, max),
    };
  });
  return out;
};

// Fill in any missing fields so the storefront and admin always work against a
// complete shape, even on an older db.json or a partial API response.
export const normalizeHeroConfig = (raw) => {
  const cfg = raw && typeof raw === "object" ? raw : {};
  const cta =
    cfg.secondaryCta && typeof cfg.secondaryCta === "object" ? cfg.secondaryCta : {};
  const openers = cfg.openers && typeof cfg.openers === "object" ? cfg.openers : {};
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
    overlayOpacity: clampInt(cfg.overlayOpacity, 0, 100, DEFAULT_HERO_CONFIG.overlayOpacity),
    heights: normalizeHeroHeights(cfg.heights),
    secondaryCta: {
      enabled: cta.enabled !== false,
      label:
        toText(cta.label, DEFAULT_HERO_SECONDARY_CTA.label) ||
        DEFAULT_HERO_SECONDARY_CTA.label,
      link:
        toText(cta.link, DEFAULT_HERO_SECONDARY_CTA.link) ||
        DEFAULT_HERO_SECONDARY_CTA.link,
    },
    openers: {
      enabled: openers.enabled !== false,
      label: toText(openers.label, DEFAULT_HERO_OPENERS.label),
      limit: clampInt(openers.limit, 1, 20, DEFAULT_HERO_OPENERS.limit),
    },
  };
};

// ─── Slides ──────────────────────────────────────────────────────────────────

// What media does this row actually carry? Used to type legacy rows that
// predate the `backgroundType` field.
const inferBackgroundType = (raw) => {
  if (raw.videoUrl) return "video";
  if (raw.image || raw.imageUrl) return "image";
  return "gradient";
};

/** @deprecated — removed in Prompt 34, with DEFAULT_HERO_SLIDE. */
export const normalizeHeroSlide = (raw, index = 0) => {
  const slide = raw && typeof raw === "object" ? raw : {};
  // `imageUrl` is the legacy field name; both have always been read.
  const image = toText(slide.image || slide.imageUrl, "");
  const backgroundType = oneOf(
    slide.backgroundType,
    HERO_BACKGROUND_TYPES,
    inferBackgroundType(slide)
  );
  const rawOverlay = slide.overlayOpacity;
  return {
    ...DEFAULT_HERO_SLIDE,
    ...slide,
    id: slide.id ?? `slide-${index}`,
    title: toText(slide.title, ""),
    subtitle: toText(slide.subtitle, ""),
    eyebrow: toText(slide.eyebrow, ""),
    cta: toText(slide.cta, ""),
    link: toText(slide.link, "") || DEFAULT_HERO_SLIDE.link,
    secondaryCtaLabel: toText(slide.secondaryCtaLabel, ""),
    secondaryCtaLink: toText(slide.secondaryCtaLink, ""),
    backgroundType,
    gradient: toText(slide.gradient, "") || DEFAULT_HERO_SLIDE.gradient,
    image,
    imagePosition: oneOf(
      slide.imagePosition,
      HERO_IMAGE_POSITIONS,
      DEFAULT_HERO_SLIDE.imagePosition
    ),
    videoUrl: toText(slide.videoUrl, ""),
    videoPoster: toText(slide.videoPoster, ""),
    overlayOpacity:
      rawOverlay === null || rawOverlay === undefined || rawOverlay === ""
        ? null
        : clampInt(rawOverlay, 0, 100, null),
    textAlign: oneOf(slide.textAlign, HERO_TEXT_ALIGNMENTS, DEFAULT_HERO_SLIDE.textAlign),
    // 0 means "inherit the section default" — anything else is clamped so one
    // bad row can neither stall nor strobe the carousel.
    durationMs: slide.durationMs
      ? clampInt(slide.durationMs, HERO_MIN_DURATION_MS, HERO_MAX_DURATION_MS, 0)
      : 0,
    isActive: slide.isActive !== false,
    sortOrder: toInt(slide.sortOrder, index),
  };
};

/** @deprecated — removed in Prompt 34. The storefront's slides come from
    apiService.products.getHeroProducts(), already ordered. */
export const normalizeHeroSlides = (list, { activeOnly = false } = {}) => {
  if (!Array.isArray(list)) return [];
  return list
    .map((row, i) => normalizeHeroSlide(row, i))
    .filter((s) => (activeOnly ? s.isActive : true))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
};

/** @deprecated — removed in Prompt 34. Every slide runs for the section's
    `intervalMs`; a per-product timer is a setting nobody asked for. */
export const heroSlideDuration = (slide, config) =>
  clampInt(
    slide?.durationMs || config?.intervalMs,
    HERO_MIN_DURATION_MS,
    HERO_MAX_DURATION_MS,
    DEFAULT_HERO_CONFIG.intervalMs
  );

/** @deprecated — removed in Prompt 34. There is no scrim: the page ground
    shows through the hero and nothing is laid over the media. */
export const heroSlideOverlay = (slide, config) => {
  const own = slide?.overlayOpacity;
  const value = own === null || own === undefined ? config?.overlayOpacity : own;
  return clampInt(value, 0, 100, DEFAULT_HERO_CONFIG.overlayOpacity);
};

/** @deprecated — removed in Prompt 34, with HERO_DEVICES/DEFAULT_HERO_HEIGHTS.
    HeroCarousel.module.css owns its own height budget. */
export const heroStageVars = (config) => {
  const h = normalizeHeroHeights(config?.heights);
  const vars = {};
  HERO_DEVICES.forEach(({ key }) => {
    // "desktop" owns the unsuffixed names (they are the base rule).
    const suffix = key === "desktop" ? "" : `-${key}`;
    vars[`--sf-hero-h-min${suffix}`] = `${h[key].min}px`;
    vars[`--sf-hero-h-vh${suffix}`] = `${h[key].vh}vh`;
    vars[`--sf-hero-h-max${suffix}`] = `${h[key].max}px`;
  });
  return vars;
};
