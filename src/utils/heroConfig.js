// =============================================================================
// Hero section configuration — shared shape, defaults & normalizers
// =============================================================================
//
// The storefront hero is fully admin-managed, and everything the carousel can
// be told to do is declared in this one file: the section record, the slide
// list, the per-slide composition, the artwork behind it and the rules that
// keep type readable on top of that artwork. `HeroCarousel` renders what these
// functions resolve; `Admin → Home & Hero` writes it and previews it through
// the same functions, so the admin can never show a composition the storefront
// would not paint.
//
// THREE LEVELS, ONE VOCABULARY
//
//   • `heroConfig`        the SECTION — the master toggle, autoplay and its
//     timer, the transition, which chrome is drawn, the band's height, the
//     overlay THEME (light or dark), the DEFAULT layout every slide inherits,
//     the DEFAULT background every slide falls back to, and `slides`: the
//     ordered slide list itself.
//
//   • a SLIDE             one entry of `heroConfig.slides`. Two kinds:
//       – `kind: "product"` — a product opens the page. Its copy stays on the
//         product (`heroHeadline`/`heroSubtext`), because that is where a
//         merchant edits a product's words; its COMPOSITION (layout, theme,
//         background) lives on the slide.
//       – `kind: "custom"` — a POSTER. No product, no price, no add-to-cart:
//         a picture, and whatever of an eyebrow, a headline, two lines, some
//         marks and up to two buttons the merchant wants on top of it. A
//         poster with nothing but a background is valid; so is one with
//         nothing but a background and one button.
//
//   • the PRODUCTS        a product still joins the carousel by carrying a
//     `heroOrder`, so a catalogue arranged before slides existed still opens
//     the page in the order it was arranged. `buildHeroSlides()` below is what
//     reconciles the two: `heroConfig.slides` is the authority on order and
//     composition, and any hero product it does not name is appended rather
//     than dropped.
//
// WHY THE SLIDE LIST LIVES IN THE SECTION RECORD. A slide is not a product —
// a poster has no product to hang off — so the list cannot be derived from the
// catalogue alone, and a second collection would need endpoints on both
// backends. `heroConfig` is already a singleton that is PUT whole, so the list
// rides with it: one write saves the whole composition, in mock mode and on
// Laravel alike.
//
// LEGIBILITY IS NOT LEFT TO THE ARTWORK (see `resolveHeroPanel`). The scrim
// over a background goes all the way to zero, blur is optional, and the next
// upload is entitled to be a white studio frame. So the COPY carries its own
// ground: a wash, a pane of frosted glass or a solid card behind the words,
// whose strength is computed from how much work the picture's own scrim and
// blur are already doing. At `panel: "auto"` — the default — a merchant who
// drops the scrim to 0 does not lose the headline; the plate under it comes up
// to meet them.
//
// THE CARD'S SIZE IS THREE NUMBERS, AND THEY ARE PERCENTAGES. `layout.
// mediaScale` holds one for the desktop, one for the tablet and one for the
// phone, because a pack that reads on a 27" monitor can dominate a 13" laptop
// and drown a 390px screen. Each is a percentage of the size that composition
// was DRAWN at rather than a width: six compositions at three breakpoints is
// eighteen widths, none of them a merchant's decision, so they stay in
// `HeroCarousel.module.css` and what crosses over from here is how much bigger
// or smaller than the drawing the merchant wants it (`heroMediaVars`).
//
// THEMES. The hero is the one section of a cream storefront that may be dark:
// `theme: "dark"` puts the band in the `.sf-on-dark` token scope, so the ink,
// the hairlines, the buttons, the chips and the scrim all re-point to the
// near-black ladder together. Set per section and overridable per slide, and
// it is the hero ONLY — the page around it is untouched.
//
// EVERY NORMALIZER IS DELIBERATELY TOLERANT. `db.json` is hand-editable, the
// Laravel side may answer with a partial record, and a record written by an
// older build must resolve to the designed default rather than to `undefined`.
// =============================================================================

// ─── Vocabularies (shared by the admin selects and the renderer) ─────────────

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

/**
 * THE COMPOSITION. Where the words sit, where the card sits, and whether the
 * band is a spread or a poster. Five answers rather than a free grid, because
 * each one is a composition that has been drawn at every breakpoint — a pair of
 * free "text side" / "card side" dropdowns can be set to nine things, six of
 * which are the same thing and two of which are broken.
 */
export const HERO_LAYOUTS = [
  {
    value: "text-left",
    label: "Copy left · card right",
    hint: "The classic spread — words on the left, the pack on the right",
  },
  {
    value: "text-right",
    label: "Card left · copy right",
    hint: "The spread mirrored — the pack leads, the words answer",
  },
  {
    value: "text-center",
    label: "Centred",
    hint: "Words centred over the picture, the card beneath them",
  },
  {
    value: "split",
    label: "Card centred · copy either side",
    hint: "An editorial spread: headline one side, the lines and buttons the other",
  },
  {
    value: "poster",
    // Not "Poster": a slide's KIND is already called that, and a poster slide
    // with a "Poster" composition told a merchant nothing. This names what the
    // composition does — and a product slide can wear it too.
    label: "Picture only",
    hint: "The picture, and only the buttons you switch on over it",
  },
];

/** Which way the copy reads. `auto` takes its answer from the layout. */
export const HERO_TEXT_ALIGNMENTS = [
  { value: "auto", label: "Match the layout", hint: "Left, right or centred to suit the composition" },
  { value: "start", label: "Left" },
  { value: "center", label: "Centred" },
  { value: "end", label: "Right" },
];

/** Where the content sits in the band. */
export const HERO_VERTICAL_ALIGNMENTS = [
  { value: "center", label: "Middle" },
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
];

/**
 * THE GROUND UNDER THE COPY — the fix for type on an unscrimmed photograph.
 *
 *   auto    a wash, as strong as the picture's own scrim and blur leave it —
 *           the default, and the reason a 0% scrim is safe
 *   none    nothing at all: for a picture chosen to have empty space in it
 *   scrim   a soft feathered wash, always at the strength you set
 *   glass   a frosted pane — the storefront's own glass, behind the words
 *   solid   an opaque card
 */
export const HERO_PANELS = [
  {
    value: "auto",
    label: "Automatic",
    hint: "A wash as strong as the picture needs — drops away as you raise the scrim",
  },
  { value: "none", label: "None", hint: "Nothing behind the words" },
  { value: "scrim", label: "Soft wash", hint: "A feathered gradient behind the copy" },
  { value: "glass", label: "Frosted glass", hint: "A blurred pane behind the copy" },
  { value: "solid", label: "Solid card", hint: "An opaque card behind the copy" },
];

/** The two grounds the hero may be composed on. The section picks one; a slide
    may overrule it. `inherit` is the slide-level answer, never the section's. */
export const HERO_THEMES = [
  { value: "light", label: "Light", hint: "Cream ground, espresso ink — the storefront's own" },
  { value: "dark", label: "Dark", hint: "Near-black ground, warm white ink and gold" },
];

export const HERO_SLIDE_THEMES = [
  { value: "inherit", label: "Section default" },
  ...HERO_THEMES,
];

/** How tall the band is. A section decision: the slides share one stage. */
export const HERO_HEIGHTS = [
  { value: "auto", label: "Fit the content", hint: "As tall as the tallest slide needs" },
  { value: "compact", label: "Compact", hint: "About two thirds of the screen" },
  { value: "standard", label: "Full screen", hint: "The screen, less the header — the default" },
  { value: "tall", label: "Tall", hint: "Taller than the screen, for editorial posters" },
];

/** The two kinds of slide. */
export const HERO_SLIDE_KINDS = [
  { value: "product", label: "Product" },
  { value: "custom", label: "Poster" },
];

/**
 * THE THREE DEVICES THE CARD IS SIZED FOR, and the breakpoints they mean.
 *
 * The card's size is the one measurement a merchant cannot take from the
 * preview alone — a pack that reads on a 27" monitor can dominate a 13" laptop
 * and drown a phone — so it is set per device rather than once. The values are
 * the stylesheet's own breakpoints: nothing here is a fourth number that CSS
 * would then have to be taught.
 */
export const HERO_MEDIA_DEVICES = [
  { value: "desktop", label: "Desktop", hint: "1025px and wider" },
  { value: "tablet", label: "Tablet", hint: "769–1024px" },
  { value: "mobile", label: "Phone", hint: "768px and narrower" },
];

// ─── Defaults ────────────────────────────────────────────────────────────────

// The slides' origin. "products" is the only source there is — the carousel is
// the catalogue, ordered by `heroOrder`, plus whatever posters a merchant has
// added — but the key is stored and normalised so a future source (a curated
// collection, a campaign) is a data change rather than a code change.
export const HERO_SOURCE_PRODUCTS = "products";

/** The eyebrow over a product slide's headline. Admin-editable. */
export const DEFAULT_HERO_EYEBROW = "Black Rice Ritual";

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
  // How hard the scrim over the picture is, 0–100. Unlike the build this
  // replaces, this is no longer the only thing standing between a photograph
  // and the copy — `resolveHeroPanel()` gives the words their own ground — so
  // it is free to be an artistic decision, 0 included.
  overlay: 55,
  // Optional soft focus, 0–24px, for a busy photograph behind sharp type.
  blur: 0,
  // LEGACY. Superseded by the layout's `showCopy`/`showMedia`/`showActions`,
  // and still read: a record written before layouts existed said "picture and
  // nothing else" here, and it still means that (see `resolveHeroLayout`).
  showContent: true,
};

// Guard rails shared by the admin inputs and the runtime, so a hand-edited
// db.json can never blur the hero into fog or scrim it into a black rectangle.
export const HERO_OVERLAY_MIN = 0;
export const HERO_OVERLAY_MAX = 100;
export const HERO_BLUR_MIN = 0;
export const HERO_BLUR_MAX = 24;
export const HERO_PANEL_MIN = 0;
export const HERO_PANEL_MAX = 100;

/**
 * THE CARD'S SIZE, as a percentage of the composition's designed width.
 *
 * 100 is the size the composition was drawn at, per device and per preset —
 * 560px for a classic spread on a desktop, 420px on a tablet, 80vw on a phone.
 * The percentage scales THAT number rather than replacing it, so one setting
 * keeps the proportions the compositions were drawn with on every screen.
 *
 * The floor is a card that still reads as the hero's subject; the ceiling is
 * the point past which the copy beside it has no column left. Both are shared
 * by the admin slider and the runtime, so a hand-edited `db.json` cannot put a
 * 400% pack over the headline.
 */
export const HERO_MEDIA_SCALE_MIN = 50;
export const HERO_MEDIA_SCALE_MAX = 150;
export const HERO_MEDIA_SCALE_DEFAULT = 100;

/** The designed size, on all three devices. */
export const DEFAULT_HERO_MEDIA_SCALE = {
  desktop: HERO_MEDIA_SCALE_DEFAULT,
  tablet: HERO_MEDIA_SCALE_DEFAULT,
  mobile: HERO_MEDIA_SCALE_DEFAULT,
};

/**
 * THE COMPOSITION RECORD — the section default, and one slide's override.
 *
 * Held at both levels with one shape. A slide's record is layered ON TOP of the
 * section's key by key (`normalizeHeroLayout(raw, sectionLayout)`), so a slide
 * that only wants its copy on the other side does not have to restate the
 * scrim, the alignment and the panel to get it.
 */
export const DEFAULT_HERO_LAYOUT = {
  // One of HERO_LAYOUTS.
  preset: "text-left",
  // One of HERO_TEXT_ALIGNMENTS. `auto` is the layout's own answer.
  align: "auto",
  // One of HERO_VERTICAL_ALIGNMENTS.
  vertical: "center",
  // The ground under the copy — one of HERO_PANELS.
  panel: "auto",
  // 0 = let the panel choose (automatic for `auto`, the designed weight for the
  // named kinds); 1–100 sets it by hand.
  panelStrength: 0,
  // How big the card is on each device, as a percentage of the size the
  // composition was drawn at. One number per breakpoint, because the card is
  // the one element whose right size is a different answer on a monitor, a
  // tablet and a phone.
  mediaScale: { ...DEFAULT_HERO_MEDIA_SCALE },
  // What is drawn. All three on is a full slide; all three off is the picture
  // and nothing else. A poster with one button is `showActions` alone.
  showCopy: true,
  showMedia: true,
  showActions: true,
  // `inherit` (the section's theme), `light` or `dark`.
  theme: "inherit",
};

/** A poster slide, complete. Only a background makes it worth showing. */
export const DEFAULT_HERO_SLIDE = {
  id: "",
  kind: "custom",
  enabled: true,
  // What the admin list and the storefront's index rail call it.
  label: "",
  // The copy. Every one of these may be blank: a poster is allowed to be
  // nothing but a picture.
  eyebrow: "",
  headline: "",
  subtext: "",
  badges: [],
  // The card over the picture — a pack shot, a lockup, a device frame. Optional.
  media: { url: "", mobileUrl: "", alt: "" },
  // Up to two buttons. A blank label is no button.
  primaryCta: { label: "", href: "" },
  secondaryCta: { label: "", href: "" },
  // This slide's own picture and composition. `null` inherits the section's.
  background: null,
  layout: null,
  theme: "inherit",
};

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
  // The ground the whole band is composed on.
  theme: "light",
  // How tall the stage is. Every slide shares it.
  height: "standard",
  // The tracked line over a product slide's headline.
  eyebrowLabel: DEFAULT_HERO_EYEBROW,
  showEyebrow: true,
  // The composition every slide inherits.
  layout: { ...DEFAULT_HERO_LAYOUT },
  // The picture behind EVERY slide that has not been given one of its own.
  // Empty by design: a storefront with no artwork uploaded yet opens on the
  // page's own ground, exactly as it did before backgrounds existed.
  background: { ...DEFAULT_HERO_BACKGROUND },
  // The ordered slide list. Empty means "every hero product, in `heroOrder`" —
  // which is exactly what the carousel did before posters existed.
  slides: [],
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

/** A boolean that defaults to the fallback rather than to `false`. */
const bool = (value, fallback) => (typeof value === "boolean" ? value : fallback);

/** A list of non-empty trimmed strings, whatever was stored. */
const stringList = (value) =>
  Array.isArray(value)
    ? value.map((item) => trimmed(item)).filter(Boolean)
    : [];

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
 * The background one SLIDE draws, with the product it may be standing on as the
 * last stop before the section default.
 *
 * The order is the order a merchant edits in: the picture typed on the slide,
 * then the legacy `product.heroBackground` (where every slide background lived
 * before the slide list existed), then the section's own.
 *
 * @param {object|null} slide    a slide record (reads `.background`)
 * @param {object|null} product  the product behind a product slide
 * @param {object|null} config   the normalized hero config
 */
export const resolveSlideBackground = (slide, product, config) => {
  const own = normalizeHeroBackground(slide?.background);
  if (hasHeroBackground(own)) return own;
  return resolveHeroBackground(product, config);
};

/**
 * Is this slide the picture and nothing else?
 *
 * LEGACY, and still honoured: this is how a record written before layouts said
 * "poster". "Hide the product" only means something when there IS art to see,
 * so a `showContent: false` left behind on a slide with no background is
 * ignored rather than rendering an empty stage.
 */
export const isHeroBackgroundOnly = (background) =>
  hasHeroBackground(background) && background.showContent === false;

/**
 * The four custom properties `HeroCarousel.module.css` styles the picture layer
 * with. Returned as a React style object so the presentation stays in the
 * stylesheet and only the VALUES cross over from the admin's record.
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

// ─── Layout ──────────────────────────────────────────────────────────────────

/**
 * Fill in the card's three sizes, layered over `fallback`.
 *
 * Tolerant in the two directions a stored record can be thin:
 *
 *   • a BARE NUMBER is all three devices — `mediaScale: 120` is a legal,
 *     complete answer for a merchant hand-editing `db.json`, and it is what a
 *     single-number future record would mean anyway;
 *   • a partial object keeps the fallback's answer for the devices it does not
 *     name, which is what makes a SLIDE's override per-device rather than
 *     all-or-nothing: a slide that only wants a bigger card on the desktop
 *     inherits the section's phone and tablet sizes untouched.
 *
 * @param {object|number|null} raw
 * @param {object} [fallback]  the section's sizes, when normalising a slide's
 * @returns {typeof DEFAULT_HERO_MEDIA_SCALE}
 */
export const normalizeHeroMediaScale = (raw, fallback = DEFAULT_HERO_MEDIA_SCALE) => {
  const base = { ...DEFAULT_HERO_MEDIA_SCALE, ...(fallback || {}) };
  const flat = typeof raw === "number" || typeof raw === "string" ? raw : null;
  const scale = raw && typeof raw === "object" ? raw : {};
  const read = (device) =>
    clampInt(
      flat ?? scale[device],
      HERO_MEDIA_SCALE_MIN,
      HERO_MEDIA_SCALE_MAX,
      clampInt(
        base[device],
        HERO_MEDIA_SCALE_MIN,
        HERO_MEDIA_SCALE_MAX,
        HERO_MEDIA_SCALE_DEFAULT
      )
    );
  return {
    desktop: read("desktop"),
    tablet: read("tablet"),
    mobile: read("mobile"),
  };
};

/**
 * Fill in a composition record, layered over `fallback`.
 *
 * `fallback` is what makes a slide's override PARTIAL: the section's resolved
 * layout is passed in, so a slide record holding nothing but
 * `{ preset: "text-right" }` keeps the section's alignment, panel and switches.
 */
export const normalizeHeroLayout = (raw, fallback = DEFAULT_HERO_LAYOUT) => {
  const base = { ...DEFAULT_HERO_LAYOUT, ...(fallback || {}) };
  const l = raw && typeof raw === "object" ? raw : {};
  return {
    preset: oneOf(l.preset, HERO_LAYOUTS, base.preset),
    align: oneOf(l.align, HERO_TEXT_ALIGNMENTS, base.align),
    vertical: oneOf(l.vertical, HERO_VERTICAL_ALIGNMENTS, base.vertical),
    panel: oneOf(l.panel, HERO_PANELS, base.panel),
    panelStrength: clampInt(
      l.panelStrength,
      HERO_PANEL_MIN,
      HERO_PANEL_MAX,
      base.panelStrength
    ),
    mediaScale: normalizeHeroMediaScale(l.mediaScale, base.mediaScale),
    showCopy: bool(l.showCopy, base.showCopy),
    showMedia: bool(l.showMedia, base.showMedia),
    showActions: bool(l.showActions, base.showActions),
    theme: oneOf(l.theme, HERO_SLIDE_THEMES, base.theme),
  };
};

/**
 * Everything a `poster` preset implies, applied.
 *
 * The preset is not a fourth switch beside the three below it — it IS the three
 * switches off, and saying so here means the renderer and the admin preview
 * cannot disagree about what "poster" draws. `showActions` survives: "a picture
 * and one button" is the whole point of a poster.
 */
const applyPoster = (layout) =>
  layout.preset === "poster"
    ? { ...layout, showCopy: false, showMedia: false }
    : layout;

/**
 * The composition ONE slide is drawn with.
 *
 * @param {object|null} slide       a slide record (reads `.layout`)
 * @param {object|null} config      the normalized hero config (reads `.layout`)
 * @param {object|null} background  the slide's RESOLVED background, for the
 *        legacy `showContent: false` ("picture and nothing else") rule
 */
export const resolveHeroLayout = (slide, config, background) => {
  const section = normalizeHeroLayout(config?.layout);
  const own = slide?.layout;
  const layout = applyPoster(normalizeHeroLayout(own, section));
  // LEGACY. Before layouts, "picture and nothing else" was a switch on the
  // background record. A slide that has never been given a layout of its own
  // still obeys it — and a slide that HAS is governed by what the merchant
  // typed there, because that screen shows them the three switches directly.
  if (!own && background && background.showContent === false && hasHeroBackground(background)) {
    return { ...layout, showCopy: false, showMedia: false };
  }
  return layout;
};

/** Is this composition the picture and nothing but the picture? */
export const isHeroPoster = (layout) =>
  Boolean(layout) && !layout.showCopy && !layout.showMedia && !layout.showActions;

/** Does this composition draw any of the slide's own content? */
export const heroLayoutDrawsContent = (layout) =>
  Boolean(layout) && (layout.showCopy || layout.showMedia || layout.showActions);

/**
 * The ground the slide is composed on: its own answer, else the section's.
 *
 * The ground is part of the COMPOSITION, so `layout.theme` is where the admin
 * writes it and it wins. `slideTheme` is the same decision spelled on the slide
 * record itself — which is where a hand-written `db.json` or an older build
 * would put it — and it is read as a fallback rather than ignored.
 */
export const resolveHeroTheme = (layout, config, slideTheme) => {
  const own = layout?.theme;
  if (own === "light" || own === "dark") return own;
  if (slideTheme === "light" || slideTheme === "dark") return slideTheme;
  return config?.theme === "dark" ? "dark" : "light";
};

/**
 * Which way the copy reads, with `auto` resolved.
 *
 * `split` is the one composition with two copy columns, and they hug the card
 * between them: the first reads to its right edge, the second from its left.
 * `side` is "a" or "b" for that layout and ignored everywhere else.
 */
export const resolveHeroAlign = (layout, side = "a") => {
  if (!layout) return "start";
  if (layout.align !== "auto") return layout.align;
  switch (layout.preset) {
    case "text-right":
      return "start";
    case "text-center":
    case "poster":
      return "center";
    case "split":
      return side === "b" ? "start" : "end";
    default:
      return "start";
  }
};

// ─── Legibility: the ground under the copy ───────────────────────────────────

/**
 * The strength the automatic plate aims for, on the same 0–100 scale as the
 * scrim. Chosen by measurement rather than by taste: warm white display type
 * over a mid-tone photograph clears 4.5:1 (WCAG 1.4.3) once roughly this much
 * of the ground colour is between the two, and it is the figure the designed
 * default (`overlay: 55` with no plate) already effectively had.
 */
export const HERO_PANEL_FLOOR = 62;

/** How much of that floor the picture's OWN scrim is credited with. */
const SCRIM_CREDIT = 0.85;

/** A blurred picture is a softer ground; 1px of blur is worth this much scrim. */
const BLUR_CREDIT = 2;

/** What each named panel weighs when the merchant has not said. */
const PANEL_WEIGHT = { scrim: 55, glass: 70, solid: 94 };

/**
 * THE FIX FOR TYPE ON AN UNSCRIMMED PHOTOGRAPH.
 *
 * The artwork is the merchant's and so is the scrim, and the scrim goes to
 * zero — so no default over the whole picture can keep the copy readable. This
 * gives the COPY its own ground instead, and sizes it from what the picture is
 * already doing:
 *
 *   scrim 0,  no blur   → a strong wash behind the words (62)
 *   scrim 30, no blur   → a moderate one (36)
 *   scrim 55, no blur   → a whisper (15) — the composition this shipped with
 *   scrim 55, 8px blur  → nothing: the blur has already done it
 *   scrim 80+           → nothing
 *
 * A merchant who wants the picture untouched behind the words says
 * `panel: "none"`; one who wants a card says `glass` or `solid`. `auto` is the
 * default because it is the answer that cannot be got wrong.
 *
 * @returns {{kind: "none"|"scrim"|"glass"|"solid", strength: number}}
 */
export const resolveHeroPanel = (background, layout) => {
  const none = { kind: "none", strength: 0 };
  if (!hasHeroBackground(background)) return none;

  const panel = oneOf(layout?.panel, HERO_PANELS, DEFAULT_HERO_LAYOUT.panel);
  if (panel === "none") return none;

  const explicit = clampInt(
    layout?.panelStrength,
    HERO_PANEL_MIN,
    HERO_PANEL_MAX,
    0
  );

  if (panel === "auto") {
    // A hand-set strength on `auto` is a floor the merchant chose themselves.
    if (explicit > 0) return { kind: "scrim", strength: explicit };
    const overlay = clampInt(background.overlay, HERO_OVERLAY_MIN, HERO_OVERLAY_MAX, 0);
    const blur = clampInt(background.blur, HERO_BLUR_MIN, HERO_BLUR_MAX, 0);
    const covered = overlay * SCRIM_CREDIT + blur * BLUR_CREDIT;
    const strength = Math.max(0, Math.round(HERO_PANEL_FLOOR - covered));
    return strength > 0 ? { kind: "scrim", strength } : none;
  }

  return { kind: panel, strength: explicit > 0 ? explicit : PANEL_WEIGHT[panel] };
};

/**
 * The card's three sizes as MULTIPLIERS — `120` is written out as `1.2`.
 *
 * The stylesheet keeps the designed width (it is a different number per preset
 * and per breakpoint, and that is a design decision, not a stored one) and
 * multiplies it by whichever of these three the device matches. So the only
 * value that crosses over from the admin's record is the merchant's percentage.
 */
export const heroMediaVars = (layout) => {
  const scale = normalizeHeroMediaScale(layout?.mediaScale);
  return {
    "--sf-hero-card-desktop": String(scale.desktop / 100),
    "--sf-hero-card-tablet": String(scale.tablet / 100),
    "--sf-hero-card-mobile": String(scale.mobile / 100),
  };
};

/**
 * Every custom property one slide's layers are styled with: the picture's four,
 * the plate's strength as a fraction, and the card's size on each device.
 */
export const heroSlideVars = (background, panel, layout) => ({
  ...heroBackgroundVars(background),
  ...heroMediaVars(layout),
  "--sf-hero-panel": String(
    clampInt(panel?.strength, HERO_PANEL_MIN, HERO_PANEL_MAX, 0) / 100
  ),
});

// ─── Links ───────────────────────────────────────────────────────────────────

/**
 * The props a poster's button needs, from one typed link.
 *
 * A merchant types a destination, not a routing decision: an in-app path goes
 * through react-router (so the page does not reload), anything else is a plain
 * anchor, and an off-site one opens in its own tab with the `rel` that makes
 * that safe. A blank destination is a button that does nothing, which is
 * rendered as no button at all by the caller.
 */
export const heroLinkProps = (href) => {
  const value = trimmed(href);
  if (!value) return null;
  if (value.startsWith("/")) return { to: value };
  const external = /^(https?:)?\/\//i.test(value);
  return external
    ? { href: value, target: "_blank", rel: "noopener noreferrer" }
    : { href: value };
};

/** Is this button worth drawing? A label and a destination, or nothing. */
export const hasHeroCta = (cta) => Boolean(trimmed(cta?.label) && trimmed(cta?.href));

// ─── Slides ──────────────────────────────────────────────────────────────────

let slideSeq = 0;

/** A stable id for a new poster. Never reuses one within a session. */
export const newHeroSlideId = () => {
  slideSeq += 1;
  return `hs-${Date.now().toString(36)}-${slideSeq.toString(36)}`;
};

const normalizeCta = (raw) => {
  const cta = raw && typeof raw === "object" ? raw : {};
  return { label: trimmed(cta.label), href: trimmed(cta.href) };
};

const normalizeSlideMedia = (raw) => {
  if (typeof raw === "string") {
    return { ...DEFAULT_HERO_SLIDE.media, url: raw.trim() };
  }
  const media = raw && typeof raw === "object" ? raw : {};
  return {
    url: trimmed(media.url) || trimmed(media.image),
    mobileUrl: trimmed(media.mobileUrl) || trimmed(media.mobileImage),
    alt: trimmed(media.alt),
  };
};

/**
 * Fill in one slide record.
 *
 * Both kinds share the shape; a product slide simply leaves the poster's copy
 * blank and carries a `productId` instead. `background` and `layout` stay
 * `null` when the slide has none of its own, because `null` is what
 * `resolveSlideBackground`/`resolveHeroLayout` read as "inherit" — a shelf of
 * defaults stored on every slide would make every slide an override.
 */
export const normalizeHeroSlide = (raw) => {
  const s = raw && typeof raw === "object" ? raw : {};
  const kind = oneOf(s.kind, HERO_SLIDE_KINDS, "custom");
  const productId = s.productId ?? s.product_id ?? null;
  return {
    id: trimmed(s.id) || newHeroSlideId(),
    kind,
    productId: kind === "product" ? productId : null,
    enabled: s.enabled !== false,
    label: trimmed(s.label),
    eyebrow: trimmed(s.eyebrow),
    headline: trimmed(s.headline),
    subtext: trimmed(s.subtext),
    badges: stringList(s.badges),
    media: normalizeSlideMedia(s.media),
    primaryCta: normalizeCta(s.primaryCta),
    secondaryCta: normalizeCta(s.secondaryCta),
    background: s.background ? normalizeHeroBackground(s.background) : null,
    layout: s.layout ? normalizeHeroLayout(s.layout) : null,
    theme: oneOf(s.theme, HERO_SLIDE_THEMES, "inherit"),
  };
};

/** The stored slide list, cleaned. A product slide with no id is dropped. */
export const normalizeHeroSlides = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((row) => row && typeof row === "object")
    .map(normalizeHeroSlide)
    .filter((slide) => slide.kind !== "product" || slide.productId != null);
};

/** Does this poster have anything at all to show? */
export const heroSlideHasContent = (slide, background) =>
  Boolean(
    hasHeroBackground(background) ||
      hasHeroBackground(slide?.media) ||
      slide?.headline ||
      slide?.subtext ||
      slide?.eyebrow ||
      hasHeroCta(slide?.primaryCta) ||
      hasHeroCta(slide?.secondaryCta)
  );

const sameId = (a, b) => String(a) === String(b);

/**
 * THE CAROUSEL, RECONCILED.
 *
 * Two sources have to agree on one list: `heroConfig.slides` (the ordered
 * composition a merchant arranged, posters included) and the PRODUCTS carrying
 * a `heroOrder` (how the hero worked before posters existed, and still how a
 * product joins it from the Products screen).
 *
 *   • `heroConfig.slides` is the authority on ORDER and COMPOSITION.
 *   • A product slide naming a product that is no longer in the hero list — it
 *     was unpublished, deleted, or dropped from the hero — is skipped rather
 *     than rendered as an empty stage.
 *   • A hero product the list does not name is APPENDED, in `heroOrder`. This
 *     is the rule that keeps the two screens honest: adding a product to the
 *     hero from Products puts it on the home page without an editor having to
 *     come here and rebuild the list.
 *   • An empty list resolves to every hero product in order, which is exactly
 *     what the carousel did before this function existed.
 *
 * Returns one RESOLVED entry per slide, with the composition already decided,
 * so the storefront and the admin preview draw from the same answer.
 *
 * @param {object[]} products  the hero products, already in `heroOrder`
 * @param {object}   config    the normalized hero config
 */
export const buildHeroSlides = (products, config) => {
  const rows = Array.isArray(products) ? products.filter(Boolean) : [];
  const stored = normalizeHeroSlides(config?.slides);

  const byId = new Map(rows.map((p) => [String(p.id), p]));
  const named = new Set(
    stored.filter((s) => s.kind === "product").map((s) => String(s.productId))
  );

  const list = stored.length > 0 ? [...stored] : [];
  // Every hero product the list forgot, in the order the catalogue holds them.
  rows.forEach((product) => {
    if (!named.has(String(product.id))) {
      list.push(
        normalizeHeroSlide({
          id: `product-${product.id}`,
          kind: "product",
          productId: product.id,
        })
      );
    }
  });

  return list
    .filter((slide) => slide.enabled)
    .map((slide) => {
      const product =
        slide.kind === "product"
          ? byId.get(String(slide.productId)) ||
            rows.find((p) => sameId(p.id, slide.productId)) ||
            null
          : null;
      if (slide.kind === "product" && !product) return null;
      const background = resolveSlideBackground(slide, product, config);
      const layout = resolveHeroLayout(slide, config, background);
      return {
        key: slide.id,
        kind: slide.kind,
        slide,
        product,
        background,
        layout,
        theme: resolveHeroTheme(layout, config, slide.theme),
        panel: resolveHeroPanel(background, layout),
      };
    })
    .filter(Boolean)
    // A poster with nothing on it and nothing behind it is a blank stage.
    .filter(
      (entry) =>
        entry.kind === "product" || heroSlideHasContent(entry.slide, entry.background)
    );
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
    // The ground the band is composed on. Light unless a merchant asked for the
    // dark one, so a record written before themes existed looks unchanged.
    theme: oneOf(cfg.theme, HERO_THEMES, DEFAULT_HERO_CONFIG.theme),
    height: oneOf(cfg.height, HERO_HEIGHTS, DEFAULT_HERO_CONFIG.height),
    eyebrowLabel:
      trimmed(cfg.eyebrowLabel) || DEFAULT_HERO_CONFIG.eyebrowLabel,
    showEyebrow: cfg.showEyebrow !== false,
    // The composition every slide inherits. Always complete, so the admin form
    // and the carousel can read `config.layout.preset` without asking whether
    // a layout was ever configured.
    layout: normalizeHeroLayout(cfg.layout),
    // The section-wide picture. Always a complete record, for the same reason.
    background: normalizeHeroBackground(cfg.background),
    // The ordered slide list, posters included.
    slides: normalizeHeroSlides(cfg.slides),
  };
};
