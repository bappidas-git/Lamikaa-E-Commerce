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
//   SLIDE BACKGROUNDS (added after the rebuild)
//     The carousel shipped with no artwork behind the slides: the stage plate
//     sat on the page's own ground and there was nowhere in the admin to change
//     that. `background` is that missing layer, and it exists at TWO levels
//     which share one shape (`DEFAULT_HERO_BACKGROUND`):
//
//       • `heroConfig.background`      the SECTION default — one picture behind
//         every slide, set once in Admin -> Home & Hero -> Section settings.
//       • `product.heroBackground`     ONE slide's own picture, which overrides
//         the section default for that slide only.
//
//     A background is nothing but a URL until a merchant says otherwise: paste
//     an image link and the slide has a background, with the designed scrim,
//     focal point and no blur. `normalizeHeroBackground()` therefore accepts a
//     bare STRING as well as a record, and resolves every other key to its
//     default — so "only the background image" is a complete, valid answer and
//     nothing else on the screen has to be filled in for it to render.
//
//     `mobileUrl` is the one key that is about devices rather than art: a wide
//     editorial frame cropped to a phone loses its subject, so a merchant may
//     hand the phone its own picture. Either URL alone is enough — each falls
//     back to the other — so a one-picture hero stays a one-field decision.
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

// Which part of a background picture survives when the frame is narrower or
// shorter than the art. These are `object-position` keywords, passed through to
// CSS untranslated — the hero never crops the file, it only chooses what the
// cover fit keeps.
export const HERO_BACKGROUND_POSITIONS = [
  { value: "center", label: "Centre", hint: "Keeps the middle of the picture" },
  { value: "top", label: "Top", hint: "Keeps the top — skies, faces, headroom" },
  { value: "bottom", label: "Bottom", hint: "Keeps the foot of the picture" },
  { value: "left", label: "Left", hint: "Keeps the left — the copy side" },
  { value: "right", label: "Right", hint: "Keeps the right — the plate side" },
];

// ─── Defaults ────────────────────────────────────────────────────────────────

// The slides' origin. "products" is the only source there is — the carousel is
// the catalogue, ordered by `heroOrder` — but the key is stored and normalised
// so a future source (a curated collection, a campaign) is a data change rather
// than a code change.
export const HERO_SOURCE_PRODUCTS = "products";

// ─── The background record (section default AND per-slide) ───────────────────
//
// ONE shape, used at both levels. Only `url` is a decision a merchant has to
// make; every other key has a designed answer, which is what lets a background
// be uploaded on its own with nothing else filled in.
export const DEFAULT_HERO_BACKGROUND = {
  // The picture. Any http(s) image link — a Cloudinary asset is delivered
  // responsively (f_auto/q_auto + srcset), anything else is used as given.
  url: "",
  // Optional phone frame (≤768px). Blank means "use `url` on every device".
  mobileUrl: "",
  // Which part of the picture the cover fit keeps. An `object-position` keyword.
  position: "center",
  // How hard the scrim over the picture is, 0–100. The hero prints a headline,
  // a price and two CTAs over this, so the default is a real scrim rather than
  // a hint: art must never cost the copy its contrast (WCAG 1.4.3).
  overlay: 55,
  // Optional soft focus, 0–24px, for a busy photograph behind sharp type.
  blur: 0,
  // Whether the slide still draws its product — the copy column, the CTAs and
  // the label plate. Switched off, the slide is the picture and nothing else.
  showContent: true,
};

// Guard rails shared by the admin inputs and the runtime, so a hand-edited
// db.json can never blur the hero into fog or scrim it into a black rectangle.
export const HERO_OVERLAY_MIN = 0;
export const HERO_OVERLAY_MAX = 100;
export const HERO_BLUR_MIN = 0;
export const HERO_BLUR_MAX = 24;

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
  // The picture behind EVERY slide that has not been given one of its own.
  // Empty by design: a storefront with no artwork uploaded yet opens on the
  // page's own ground, exactly as it did before backgrounds existed.
  background: { ...DEFAULT_HERO_BACKGROUND },
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

/** A trimmed string, whatever was stored (a number, null, an object). */
const trimmed = (value) => (typeof value === "string" ? value.trim() : "");

// ─── Background ──────────────────────────────────────────────────────────────

/**
 * Fill in a background record.
 *
 * Deliberately tolerant in three directions, because this is the one field a
 * merchant is expected to fill in ALONE:
 *
 *   • a bare STRING is a URL — `heroBackground: "https://…"` is a complete,
 *     valid background;
 *   • `null`/`undefined`/a stray type is "no background", never a crash;
 *   • the older key spellings a hand-written record might carry (`image`,
 *     `mobileImage`) are read, so nothing has to be migrated by hand.
 *
 * @param {object|string|null} raw
 * @returns {typeof DEFAULT_HERO_BACKGROUND}
 */
export const normalizeHeroBackground = (raw) => {
  if (typeof raw === "string") {
    return { ...DEFAULT_HERO_BACKGROUND, url: raw.trim() };
  }
  const bg = raw && typeof raw === "object" ? raw : {};
  return {
    url: trimmed(bg.url) || trimmed(bg.image),
    mobileUrl: trimmed(bg.mobileUrl) || trimmed(bg.mobileImage),
    position: oneOf(
      bg.position,
      HERO_BACKGROUND_POSITIONS,
      DEFAULT_HERO_BACKGROUND.position
    ),
    overlay: clampInt(
      bg.overlay,
      HERO_OVERLAY_MIN,
      HERO_OVERLAY_MAX,
      DEFAULT_HERO_BACKGROUND.overlay
    ),
    blur: clampInt(bg.blur, HERO_BLUR_MIN, HERO_BLUR_MAX, DEFAULT_HERO_BACKGROUND.blur),
    showContent: bg.showContent !== false,
  };
};

/** Is there a picture to draw at all? The gate every background rule sits behind. */
export const hasHeroBackground = (background) =>
  Boolean(background && (background.url || background.mobileUrl));

/**
 * The file this device should fetch.
 *
 * Each URL stands in for the other, so ONE upload is always enough: a merchant
 * who only ever sets `url` gets it on a phone too, and one who only has a
 * portrait frame gets it on a desktop rather than getting nothing.
 */
export const heroBackgroundSrc = (background, isMobile = false) => {
  if (!background) return "";
  return isMobile
    ? background.mobileUrl || background.url
    : background.url || background.mobileUrl;
};

/**
 * The background ONE slide draws: its own if it names a picture, otherwise the
 * section default.
 *
 * The slide's record wins WHOLE rather than key by key — a merchant who gives a
 * slide its own art expects that slide to be framed by the settings they typed
 * beside it, not by a mix of two screens. `showContent` is the exception, and
 * it is not a mixture but an AND: either level may hide the product, and
 * neither can force it back on over the other's decision.
 *
 * @param {object|null} product  a hero product (reads `product.heroBackground`)
 * @param {object|null} config   the normalized hero config (reads `.background`)
 */
export const resolveHeroBackground = (product, config) => {
  const own = normalizeHeroBackground(product?.heroBackground);
  if (hasHeroBackground(own)) return own;
  const section = normalizeHeroBackground(config?.background);
  return { ...section, showContent: section.showContent && own.showContent };
};

/**
 * Is this slide the picture and nothing else?
 *
 * "Hide the product" only means something when there IS art to see, so a
 * `showContent: false` left behind on a slide with no background is ignored
 * rather than rendering an empty stage.
 */
export const isHeroBackgroundOnly = (background) =>
  hasHeroBackground(background) && background.showContent === false;

/**
 * The four custom properties `HeroCarousel.module.css` styles the layer with.
 * Returned as a React style object so the presentation stays in the stylesheet
 * and only the VALUES cross over from the admin's record.
 */
export const heroBackgroundVars = (background) => {
  const bg = background || DEFAULT_HERO_BACKGROUND;
  const blur = clampInt(bg.blur, HERO_BLUR_MIN, HERO_BLUR_MAX, 0);
  return {
    "--sf-hero-bg-position": bg.position || DEFAULT_HERO_BACKGROUND.position,
    "--sf-hero-bg-overlay": String(
      clampInt(bg.overlay, HERO_OVERLAY_MIN, HERO_OVERLAY_MAX, 0) / 100
    ),
    // `none` rather than `blur(0px)`/`scale(1)`: an IDENTITY filter or transform
    // still promotes the element it is on to its own compositing layer, and
    // this element is the size of the viewport. The unblurred case — which is
    // every background until a merchant asks otherwise — must cost nothing.
    "--sf-hero-bg-filter": blur > 0 ? `blur(${blur}px)` : "none",
    // A blurred image has soft edges; the overscan hides them off-frame.
    "--sf-hero-bg-transform": blur > 0 ? "scale(1.08)" : "none",
  };
};

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
    // The section-wide picture. Always a complete record, so both the admin
    // form and the carousel can read `config.background.overlay` without ever
    // asking whether a background was configured.
    background: normalizeHeroBackground(cfg.background),
  };
};
