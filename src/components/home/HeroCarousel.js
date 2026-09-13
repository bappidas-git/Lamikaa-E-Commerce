import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "framer-motion";
import apiService from "../../services/api";
import brand from "../../config/brand";
import { useCart } from "../../hooks/useCart";
import { ROUTES } from "../../utils/constants";
import { buildCartItem, productPath } from "../../utils/helpers";
import { primaryImage, productAlt } from "../../utils/product";
import {
  buildHeroSlides,
  hasHeroBackground,
  hasHeroCta,
  heroBackgroundSrc,
  heroLinkProps,
  heroSlideVars,
  normalizeHeroBackground,
  normalizeHeroConfig,
  normalizeHeroLayout,
  resolveHeroAlign,
  resolveHeroPanel,
  resolveHeroTheme,
} from "../../utils/heroConfig";
import { Button, Chip, CloudinaryImage, GlowWrap, Price } from "../ui";
import Logo from "../brand/Logo";
import HeroIndex from "./HeroIndex";
import styles from "./HeroCarousel.module.css";

// =============================================================================
// HeroCarousel — the home page's opening spread, composed by the admin
// =============================================================================
//
// A STAGE OF SLIDES, AND EVERY SLIDE IS ITS OWN COMPOSITION. Two kinds share
// the stage:
//
//   • a PRODUCT slide — the label card on its glowing plate, the product's own
//     headline, its price, two quiet lines, its trust marks and two CTAs;
//   • a POSTER (`kind: "custom"`) — a picture with nothing on it but what the
//     merchant switched on: an eyebrow, a headline, two lines, some marks, up
//     to two buttons, a card of its own, or none of the above.
//
// and each slide carries its own LAYOUT (copy left, copy right, centred, or
// split either side of a centred card), its own GROUND (light or dark), its own
// ARTWORK and its own legibility PLATE. `utils/heroConfig` owns every one of
// those rules; this file stacks the layers and crossfades them.
//
// WHY THE SLIDES ARE A CSS GRID, ALL IN ONE CELL
//   Every slide is placed in `grid-area: 1 / 1` of the stage, so the stage is
//   exactly as tall as the TALLEST slide and every slide is in flow. That is
//   what buys arbitrary per-slide layouts for nothing: there is no absolutely
//   positioned layer to measure, no invisible mirror of the copy to keep in
//   step with it, and nothing below the hero can move when the slide changes.
//   (The build this replaces rendered the copy once and stacked a hidden
//   "sizer" of every slide's copy behind it to reserve the height. With the
//   copy in a different place on every slide, one shared copy block was no
//   longer possible — and the grid does the sizer's job by construction.)
//
//   Only the ACTIVE slide is visible: `visibility: hidden` takes the other
//   slides out of the tab order and out of the accessibility tree, and is
//   delayed on the way out so the crossfade still runs. The page keeps ONE
//   `h1` — the active slide's headline, or a visually hidden wordmark on a
//   slide that prints no headline at all.
//
// DATA (both api modes)
//   • `heroProducts` PROP     the hero-ordered range, from `useHomeData`.
//   • hero.getConfig()        the section record: the master toggle, autoplay,
//     the timer, the transition, the chrome, the height, the theme, the default
//     layout, the default background AND the slide list itself. Read HERE: no
//     other section wants it.
//   `buildHeroSlides()` reconciles the two — the stored list is the authority
//   on order and composition, and any hero product it does not name is
//   appended, so a product added to the hero from the Products screen still
//   opens the page without anybody rebuilding the list.
//   Fallbacks, in order: the resolved slides → products.getFeatured(8) → the
//   BRAND SLIDE (wordmark, tagline, one CTA). Never a fabricated product: an
//   unreachable catalogue must not be the one surface that invents a listing.
//
// LEGIBILITY. The copy never depends on the scrim alone. Each slide's plate
// (`resolveHeroPanel`) is a wash, a pane of glass or a card behind the words
// whose strength rises as the scrim falls, so a merchant who sets the scrim to
// 0 on a bright photograph still has a readable headline. The controls under it
// carry their own contrast too — see the stylesheet's "controls over a
// photograph" block.
//
// HOW BIG THE CARD IS is the admin's answer, not this component's: each slide
// carries three multipliers (`heroMediaVars` — one for the desktop, one for the
// tablet, one for the phone) and the stylesheet multiplies the width the
// composition was drawn at by whichever one the screen matches. Nothing here
// measures a card; a percentage is all that crosses over.
//
// MOTION is CSS, not a timeline, so the first slide is painted at full strength
// on the first frame: crossfade + 1.02 -> 1 scale over --sf-duration-slow. Under
// `prefers-reduced-motion` the token layer zeroes that duration, autoplay never
// starts, the plate stops breathing and the pointer parallax is not attached.
//
// WCAG 2.2.2. Autoplay is only ever offered WITH its pause button — see
// `autoplayOn` below, where hiding the control turns the autoplay off rather
// than leaving it unstoppable.
// =============================================================================

// The eyebrow's fixed half, when the admin has not renamed it. The variable
// half is the slide's position, and the headline/subtext under it are the
// product's own words.
const EYEBROW_LABEL = "Black Rice Ritual";

// How many products the featured fallback may borrow — the launch range.
const FALLBACK_LIMIT = 8;

// A horizontal drag has to beat this many pixels, and beat its own vertical
// travel, before it counts as a swipe. Below it the gesture was a scroll.
const SWIPE_THRESHOLD = 40;

// DESIGN_SYSTEM §7: parallax never exceeds 8px.
const PARALLAX_MAX = 8;

// The two breakpoints this component reads in JS rather than in CSS: the plate
// changes Cloudinary ratio at 768px (the artwork is re-padded, never cropped),
// and the parallax is a desktop pointer affordance.
const MOBILE_QUERY = "(max-width: 768px)";
const PARALLAX_QUERY = "(min-width: 1025px) and (pointer: fine)";

// ─── Pure helpers (exported for the unit test) ───────────────────────────────

/** "3" -> "03". The counter, the eyebrow and the index rail all read this. */
export const padIndex = (value) => String(value).padStart(2, "0");

/** "Black Rice Ritual · 03 / 08" — the label is the admin's, the position ours. */
export const heroEyebrow = (index, total, label = EYEBROW_LABEL) =>
  `${label} · ${padIndex(index + 1)} / ${padIndex(total)}`;

/** The slide's headline: the product's hero line, else its promise. */
export const heroHeadline = (product) =>
  product?.heroHeadline || product?.promise || "";

/** The slide's subtext: the product's hero line, else its short description. */
export const heroSubtext = (product) =>
  product?.heroSubtext || product?.shortDescription || "";

/** "Explore the Face Wash" — the short name, because every product in the
    range opens on the same two words and repeating them is noise. */
export const exploreLabel = (product) =>
  `Explore the ${product?.shortName || product?.name || "range"}`.trim();

/** The label a screen reader hears for slide `i`, and the media layer's own. */
export const slideLabel = (product, index, total) =>
  `${index + 1} of ${total}: ${product?.name || ""}`.trim();

/**
 * Which products become slides.
 *
 * The hero products win outright. An empty catalogue of them falls back to the
 * featured list (a merchant who has not arranged the hero yet still opens on
 * real products), and an empty featured list falls back to nothing at all —
 * which the component renders as the brand slide.
 */
export const resolveHeroSlides = (heroProducts, featured) => {
  const hero = Array.isArray(heroProducts) ? heroProducts.filter(Boolean) : [];
  if (hero.length > 0) return hero;
  const backup = Array.isArray(featured) ? featured.filter(Boolean) : [];
  return backup.slice(0, FALLBACK_LIMIT);
};

/** What the index rail and a screen reader call one resolved slide. */
export const heroSlideName = (entry, index) => {
  if (!entry) return "";
  if (entry.kind === "product") return entry.product?.name || "";
  return entry.slide.label || entry.slide.headline || `Slide ${index + 1}`;
};

/** The same, shortened for the rail's chips. */
export const heroSlideShortName = (entry, index) => {
  if (!entry) return "";
  if (entry.kind === "product") {
    return entry.product?.shortName || entry.product?.name || "";
  }
  return entry.slide.label || entry.slide.headline || `Slide ${index + 1}`;
};

// ─── Class-name helpers ─────────────────────────────────────────────────────

const cx = (...parts) => parts.filter(Boolean).join(" ");

const PRESET_CLASS = {
  "text-left": styles.presetTextLeft,
  "text-right": styles.presetTextRight,
  "text-center": styles.presetTextCenter,
  split: styles.presetSplit,
  poster: styles.presetPoster,
};

const ALIGN_CLASS = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
};

const VERTICAL_CLASS = {
  top: styles.verticalTop,
  center: styles.verticalCenter,
  bottom: styles.verticalBottom,
};

const GLOW_CLASS = {
  start: styles.glowStart,
  center: styles.glowCenter,
  end: styles.glowEnd,
};

const PANEL_CLASS = {
  scrim: styles.panelScrim,
  glass: styles.panelGlass,
  solid: styles.panelSolid,
};

const HEIGHT_CLASS = {
  auto: styles.heightAuto,
  compact: styles.heightCompact,
  standard: styles.heightStandard,
  tall: styles.heightTall,
};

/** The token scope a slide's ground is painted in. `.sf-on-dark` is global. */
const themeClass = (theme) =>
  theme === "dark" ? cx("sf-on-dark", styles.themeDark) : styles.themeLight;

// ─── The backdrop ───────────────────────────────────────────────────────────
//
// One absolutely positioned layer per slide, crossfaded by the same `index` the
// slides are, plus its scrim. Rendered ONCE for the carousel and once (single
// layer) for the brand slide, which is why it is a component rather than a
// branch inside the JSX below.
//
// It is `aria-hidden` in full: a background is decoration by definition — the
// slide is already labelled by its product, and a screen reader gaining a
// second, wordless "image" per slide would only be noise. That is also why the
// `<img>` carries an empty alt rather than an admin-typed one.
//
// A layer only exists where a picture resolved, so a carousel where one slide
// has art and seven do not costs seven nothing.
const HeroBackdrop = ({ layers, index, isMobile, instant, mounted }) => {
  const drawn = layers
    .map((layer, i) => ({ ...layer, i, src: heroBackgroundSrc(layer.background, isMobile) }))
    .filter((layer) => layer.src);

  if (drawn.length === 0) return null;

  return (
    <div className={cx(styles.backdrop, instant && styles.backdropInstant)} aria-hidden="true">
      {drawn.map(({ background, panel, theme, i, src }) => {
        // Same first-paint rule as the plate: everything past the opening slide
        // waits for the idle pass, so one background image competes for the
        // connection that paints the LCP rather than eight.
        if (i !== 0 && i !== index && !mounted) return null;
        return (
          <div
            key={i}
            className={cx(
              styles.backdropLayer,
              i === index && styles.backdropLayerActive,
              // The scrim mixes from the ground token, so the layer has to sit
              // in the same scope its slide is composed in — a dark slide's
              // picture is veiled in espresso, a light one's in cream.
              theme === "dark" ? "sf-on-dark" : ""
            )}
            style={heroSlideVars(background, panel)}
          >
            <CloudinaryImage
              src={src}
              alt=""
              fit="cover"
              // A full-bleed frame: the phone rungs and the two desktop ones.
              // 480 is dropped — no viewport this paints is that narrow once
              // the device pixel ratio is counted.
              widths={[640, 900, 1080, 1440, 1920]}
              sizes="100vw"
              priority={i === 0}
              className={styles.backdropImage}
            />
            <span className={styles.backdropScrim} />
          </div>
        );
      })}
    </div>
  );
};

// ─── One slide ──────────────────────────────────────────────────────────────
//
// The whole composition for one entry of the stage: the card, the words, the
// buttons and the plate under them, arranged by the entry's own layout.
//
// `split` is the one layout with TWO copy columns — the eyebrow, the headline
// and the price on one side of the centred card, the lines, the marks and the
// buttons on the other. Every other layout puts all of it in one column; the
// DOM order (copy A, card, copy B) is the reading order in both cases.
const HeroSlide = ({
  entry,
  index,
  total,
  active,
  mounted,
  isMobile,
  eyebrowLabel,
  showEyebrow,
  onAddToCart,
}) => {
  const { kind, slide, product, background, layout, panel, theme } = entry;
  const onArt = hasHeroBackground(background);
  const split = layout.preset === "split";
  const panelClass = PANEL_CLASS[panel.kind] || "";

  /**
   * Which way a copy column reads.
   *
   * The split layout's automatic answer has its two columns hugging the card
   * between them — the first reads to its right edge, the second from its left.
   * On a PHONE there is no card between them: the composition is one stacked
   * column, so both blocks take the second column's answer and the slide reads
   * as one piece of copy instead of one block flush right above another flush
   * left. An align the merchant set BY HAND is returned untouched either way.
   */
  const alignOf = (side) => resolveHeroAlign(layout, isMobile ? "b" : side);

  // ---- What this slide prints -------------------------------------------
  const isProduct = kind === "product";
  const eyebrow = isProduct
    ? heroEyebrow(index, total, eyebrowLabel)
    : slide.eyebrow;
  const headline = isProduct ? heroHeadline(product) : slide.headline;
  const subtext = isProduct ? heroSubtext(product) : slide.subtext;
  const badges = isProduct
    ? Array.isArray(product?.badges)
      ? product.badges
      : []
    : slide.badges;

  const primaryLink = isProduct ? null : heroLinkProps(slide.primaryCta.href);
  const secondaryLink = isProduct ? null : heroLinkProps(slide.secondaryCta.href);
  const hasPrimary = isProduct ? Boolean(product) : hasHeroCta(slide.primaryCta);
  const hasSecondary = isProduct
    ? Boolean(product)
    : hasHeroCta(slide.secondaryCta);
  const actions = layout.showActions && (hasPrimary || hasSecondary);

  // ---- The card over the picture ----------------------------------------
  const productMedia = isProduct ? primaryImage(product) : null;
  const posterSrc = isProduct
    ? ""
    : heroBackgroundSrc(slide.media, isMobile) || "";
  const mediaSrc = isProduct ? productMedia?.url || "" : posterSrc;
  const mediaAlt = isProduct
    ? productAlt(product, productMedia)
    : slide.media.alt || "";
  const media = layout.showMedia && Boolean(mediaSrc);

  // Everything past the opening slide waits for the idle pass; the active slide
  // is always loaded in case a control ran before the idle callback did.
  const loadMedia = index === 0 || active || mounted;

  // The headline is the page's heading on the slide that is on screen, and a
  // paragraph on the ones that are not — so the document keeps exactly one h1
  // however many slides the merchant has arranged.
  const Heading = active && headline ? "h1" : "p";

  const copyLines = (which) => {
    const first = !split || which === "a";
    const second = !split || which === "b";
    return (
      <>
        {first && showEyebrow && eyebrow && (
          <p className={cx("sf-eyebrow", styles.eyebrow)}>{eyebrow}</p>
        )}
        {first && headline && (
          <Heading className={styles.headline}>{headline}</Heading>
        )}
        {first && isProduct && product && (
          <Price product={product} size="sm" live={false} className={styles.price} />
        )}
        {second && subtext && <p className={styles.subtext}>{subtext}</p>}
      </>
    );
  };

  const actionRow = (
    <div className={styles.actions}>
      {isProduct && product ? (
        <>
          <Button
            variant="primary"
            size="lg"
            to={productPath(product)}
            className={styles.cta}
            tabIndex={active ? undefined : -1}
          >
            {exploreLabel(product)}
          </Button>
          <Button
            variant="addToCart"
            size="lg"
            className={styles.cta}
            disabled={Boolean(product.priceTBA)}
            tabIndex={active ? undefined : -1}
            onClick={() => onAddToCart(product)}
          >
            {product.priceTBA ? "Coming soon" : "Add to Cart"}
          </Button>
        </>
      ) : (
        <>
          {hasPrimary && primaryLink && (
            <Button
              variant="primary"
              size="lg"
              className={styles.cta}
              tabIndex={active ? undefined : -1}
              {...primaryLink}
            >
              {slide.primaryCta.label}
            </Button>
          )}
          {hasSecondary && secondaryLink && (
            <Button
              variant="secondary"
              size="lg"
              className={styles.cta}
              tabIndex={active ? undefined : -1}
              {...secondaryLink}
            >
              {slide.secondaryCta.label}
            </Button>
          )}
        </>
      )}
    </div>
  );

  const badgeRow = badges.length > 0 && (
    <ul className={styles.badges}>
      {badges.map((badge) => (
        <li key={badge}>
          <Chip variant="trust">{badge}</Chip>
        </li>
      ))}
    </ul>
  );

  // A copy column is only drawn when it has something in it — an empty plate
  // over a poster is a grey rectangle nobody asked for.
  const columnA =
    (layout.showCopy && (eyebrow || headline || isProduct || (!split && subtext))) ||
    (!split && layout.showCopy && badges.length > 0) ||
    (!split && actions);
  const columnB = split && ((layout.showCopy && (subtext || badges.length > 0)) || actions);

  const mediaNode = media && (
    <div className={styles.media}>
      <GlowWrap
        tone="duo"
        intensity={0.24}
        breathe={active}
        className={styles.mediaGlow}
      >
        {loadMedia && (
          <CloudinaryImage
            src={mediaSrc}
            alt={mediaAlt}
            ar={isMobile ? "1:1" : "4:5"}
            gravity="center"
            fit="cover"
            plate
            widths={[480, 768, 1080]}
            sizes="(max-width: 768px) 80vw, 40vw"
            priority={index === 0}
            className={styles.plate}
          />
        )}
      </GlowWrap>
    </div>
  );

  return (
    <div
      className={cx(
        styles.slide,
        active && styles.slideActive,
        PRESET_CLASS[layout.preset] || PRESET_CLASS["text-left"],
        VERTICAL_CLASS[layout.vertical] || VERTICAL_CLASS.center,
        onArt && styles.slideOnArt,
        themeClass(theme)
      )}
      style={heroSlideVars(background, panel, layout)}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}: ${heroSlideName(entry, index)}`}
      aria-hidden={active ? undefined : "true"}
    >
      <div className={cx("sf-container", styles.slideInner)}>
        {columnA && (
          <div
            className={cx(
              styles.copy,
              styles.copyA,
              panelClass,
              ALIGN_CLASS[alignOf("a")]
            )}
          >
            {layout.showCopy && <div className={styles.copyLines}>{copyLines("a")}</div>}
            {!split && layout.showCopy && badgeRow}
            {!split && actions && actionRow}
          </div>
        )}

        {mediaNode}

        {columnB && (
          <div
            className={cx(
              styles.copy,
              styles.copyB,
              panelClass,
              ALIGN_CLASS[alignOf("b")]
            )}
          >
            {layout.showCopy && <div className={styles.copyLines}>{copyLines("b")}</div>}
            {layout.showCopy && badgeRow}
            {actions && actionRow}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Media queries, as state ────────────────────────────────────────────────
// Read synchronously on the first render so the LCP image is requested at the
// right ratio the FIRST time — a post-mount correction would download it twice.

const readQuery = (query) =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;

const useMediaFlag = (query) => {
  const [matches, setMatches] = useState(() => readQuery(query));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const mql = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);
    setMatches(mql.matches);
    // Safari < 14 only has the deprecated listener API.
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
};

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {object[]|null|undefined} props.heroProducts  the hero-ordered range,
 *        from useHomeData() — `undefined` while it is in flight, `null` when
 *        the read failed. Prompt 22 lifted this read out of the component so
 *        the four sections that wanted it share one request; the hero keeps its
 *        own `hero.getConfig()` (no other section reads it) and its own
 *        `getFeatured` fallback, because both are the hero's business alone.
 */
const HeroCarousel = ({ heroProducts }) => {
  const prefersReducedMotion = useReducedMotion();
  const { addToCart } = useCart();

  const [rawConfig, setRawConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  // Slide artwork after the first is fetched in an idle pass, so the first
  // paint carries exactly one image: the LCP element. The slides' LAYOUT is
  // never deferred — the stage is as tall as its tallest slide from the first
  // frame, and deferring a slide's box would move the page under the visitor.
  const [restMounted, setRestMounted] = useState(false);

  const heroRef = useRef(null);
  const swipeRef = useRef(null);

  const isMobile = useMediaFlag(MOBILE_QUERY);
  const parallaxAllowed = useMediaFlag(PARALLAX_QUERY);
  const parallaxOn = parallaxAllowed && !prefersReducedMotion;

  // ── Config ───────────────────────────────────────────────────────────────
  // The hero's own collection — the master toggle, autoplay, timer, chrome,
  // theme, height, the default composition and the slide list. Nothing else on
  // the page reads it, so it stays here. It never throws by contract (it
  // resolves to {}), and its failure only costs the defaults.
  useEffect(() => {
    let alive = true;
    apiService.hero.getConfig().then(
      (value) => {
        if (alive && value) setRawConfig(value);
      },
      () => {
        // Defaults are the answer; nothing to recover.
      }
    );
    return () => {
      alive = false;
    };
  }, []);

  // ── Products ─────────────────────────────────────────────────────────────
  // The range arrives as a prop. An empty (or unreadable) hero order is not the
  // end of the hero: the featured products stand in, and only if THAT is empty
  // too — and no poster has been arranged either — does the brand slide carry
  // the band on its own. The fallback is fetched here rather than in
  // useHomeData because it is the one read on this page that is conditional.
  useEffect(() => {
    if (heroProducts === undefined) return undefined;
    let alive = true;

    const load = async () => {
      const hero = Array.isArray(heroProducts) ? heroProducts : [];

      let slides = resolveHeroSlides(hero, null);
      if (slides.length === 0) {
        try {
          const featured = await apiService.products.getFeatured(FALLBACK_LIMIT);
          slides = resolveHeroSlides(null, featured);
        } catch {
          // The brand slide is the answer; nothing to recover.
        }
      }

      if (!alive) return;
      setProducts(slides);
      setLoaded(true);
    };

    load();
    return () => {
      alive = false;
    };
  }, [heroProducts]);

  const config = useMemo(() => normalizeHeroConfig(rawConfig), [rawConfig]);

  // ── The stage ────────────────────────────────────────────────────────────
  // One resolved entry per slide: its kind, its product, its picture, its
  // composition, its ground and its legibility plate — all decided in
  // `utils/heroConfig` so the admin's preview and this stage cannot disagree.
  const slides = useMemo(() => buildHeroSlides(products, config), [products, config]);

  // The section default on its own — what the BRAND slide is backed by, since
  // it has no product and no poster record to carry a picture of its own.
  const sectionBackground = useMemo(
    () => normalizeHeroBackground(config.background),
    [config]
  );
  const sectionLayout = useMemo(() => normalizeHeroLayout(config.layout), [config]);

  const total = slides.length;
  const multiple = total > 1;

  // Keep the cursor in range if the slide count changes under it.
  useEffect(() => {
    setIndex((prev) => (prev >= total ? 0 : prev));
  }, [total]);

  const goTo = useCallback(
    (next) => {
      setIndex((prev) => {
        if (total < 1) return 0;
        const target = typeof next === "function" ? next(prev) : next;
        return ((target % total) + total) % total;
      });
    },
    [total]
  );

  // ── Autoplay ─────────────────────────────────────────────────────────────
  // WCAG 2.2.2: motion that starts on its own must be stoppable. So the pause
  // control is not merely shown when autoplay is on — autoplay is OFF whenever
  // the control is hidden. `showPause: false` reads as "no moving hero", which
  // is the only safe way for that switch to fail.
  const autoplayOn =
    config.enabled &&
    config.autoplay &&
    config.showPause &&
    multiple &&
    !prefersReducedMotion;

  const paused =
    userPaused ||
    (config.pauseOnHover && hovering) ||
    focusWithin ||
    tabHidden ||
    overlayOpen;

  const running = autoplayOn && !paused;

  // The tab going away is a pause, not a wasted slide: a visitor who comes back
  // must not find the carousel four products further on.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const read = () => setTabHidden(document.visibilityState === "hidden");
    read();
    document.addEventListener("visibilitychange", read);
    return () => document.removeEventListener("visibilitychange", read);
  }, []);

  // `body[data-drawer-open]` is the reference-counted flag every drawer, modal
  // and search overlay raises (hooks/useOverlayFlag.js). The hero is behind all
  // of them, so it stops while one is up.
  useEffect(() => {
    if (typeof document === "undefined" || !document.body) return undefined;
    const read = () =>
      setOverlayOpen(document.body.hasAttribute("data-drawer-open"));
    read();
    if (typeof MutationObserver === "undefined") return undefined;
    const observer = new MutationObserver(read);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-drawer-open"],
    });
    return () => observer.disconnect();
  }, []);

  // Pausing BANKS the time left rather than discarding it, so the CSS progress
  // hairline (frozen with animation-play-state) and this timer resume together.
  const remainingRef = useRef(null);
  const startedAtRef = useRef(0);

  // A new slide always starts a full run. Declared BEFORE the timer effect so
  // it clears the bank before the timer reads it.
  useEffect(() => {
    remainingRef.current = null;
  }, [index]);

  useEffect(() => {
    if (!running) return undefined;
    const ms = remainingRef.current ?? config.intervalMs;
    startedAtRef.current = Date.now();
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % total);
    }, ms);
    return () => {
      clearTimeout(timer);
      // On an advance the effect above wipes this again before the next run
      // reads it, so only a genuine pause keeps the banked remainder.
      remainingRef.current = Math.max(0, ms - (Date.now() - startedAtRef.current));
    };
  }, [running, index, total, config.intervalMs]);

  // ── First paint ──────────────────────────────────────────────────────────
  // Slide one is the LCP element. The rest fetch their artwork in an idle pass
  // so their <img> tags cannot compete for the connection that paints it.
  useEffect(() => {
    if (restMounted || typeof window === "undefined") return undefined;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setRestMounted(true));
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setRestMounted(true), 0);
    return () => window.clearTimeout(id);
  }, [restMounted]);

  // ── Pointer ──────────────────────────────────────────────────────────────
  // Parallax is written straight to custom properties on the section: a React
  // state update per pointermove would re-render the whole carousel 60 times a
  // second to move one card 8 pixels.
  const setParallax = useCallback((x, y) => {
    const el = heroRef.current;
    if (!el) return;
    el.style.setProperty("--sf-hero-parallax-x", `${x}px`);
    el.style.setProperty("--sf-hero-parallax-y", `${y}px`);
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      if (!parallaxOn) return;
      const el = heroRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const clamp = (n) => Math.max(-1, Math.min(1, n));
      const dx = clamp((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2));
      const dy = clamp((event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2));
      // Inverted: the card leans INTO the pointer, the way a lit object would.
      setParallax(
        Number((-dx * PARALLAX_MAX).toFixed(2)),
        Number((-dy * PARALLAX_MAX).toFixed(2))
      );
    },
    [parallaxOn, setParallax]
  );

  const handlePointerLeave = useCallback(() => {
    setHovering(false);
    setParallax(0, 0);
  }, [setParallax]);

  // The parallax offset is stale the moment the affordance is withdrawn (a
  // visitor turns reduced motion on, or the pointer becomes coarse).
  useEffect(() => {
    if (!parallaxOn) setParallax(0, 0);
  }, [parallaxOn, setParallax]);

  // ── Swipe ────────────────────────────────────────────────────────────────
  // Pointer events, so one path covers touch, pen and a mouse drag. The stage
  // keeps `touch-action: pan-y`, so a vertical scroll is never intercepted.
  const handlePointerDown = useCallback(
    (event) => {
      if (!multiple) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      swipeRef.current = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
      };
    },
    [multiple]
  );

  const handlePointerUp = useCallback(
    (event) => {
      const start = swipeRef.current;
      swipeRef.current = null;
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;
      goTo((prev) => prev + (dx < 0 ? 1 : -1));
    },
    [goTo]
  );

  const handlePointerCancel = useCallback(() => {
    swipeRef.current = null;
  }, []);

  // ── Keyboard ─────────────────────────────────────────────────────────────
  // Bound to the section, so it answers whenever focus is anywhere inside the
  // carousel. Nothing in the hero takes typed input, so the arrows are free.
  const handleKeyDown = useCallback(
    (event) => {
      if (!multiple || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goTo((prev) => prev - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goTo((prev) => prev + 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(total - 1);
      }
    },
    [multiple, goTo, total]
  );

  // ── Cart ─────────────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(
    (product) => {
      if (!product || product.priceTBA) return;
      try {
        // CartContext shows the toast and opens the drawer.
        addToCart(buildCartItem(product), 1);
      } catch {
        // buildCartItem throws PRICE_TBA for an uncommitted price. The button
        // is disabled for exactly that product, so this only guards the race
        // between a merchant clearing a price and this tab reloading.
      }
    },
    [addToCart]
  );

  // ── The brand slide ──────────────────────────────────────────────────────
  // Shown when the hero is switched off, and when neither the slide list, the
  // hero order nor the featured list resolved to anything. It carries no
  // photography and no claim that is not already in brand.js. Its "headline" is
  // the wordmark, so the page's single h1 is the visually hidden one beside it.
  const brandOnly = !config.enabled || (loaded && total === 0);
  const brandTheme = resolveHeroTheme(sectionLayout, config);

  if (brandOnly) {
    return (
      <section
        className={cx(
          styles.hero,
          styles.heroBrand,
          HEIGHT_CLASS[config.height] || HEIGHT_CLASS.standard,
          hasHeroBackground(sectionBackground) && styles.heroBackdrop,
          themeClass(brandTheme)
        )}
        aria-label={brand.name}
      >
        {/* The brand slide has no product, so it takes the SECTION picture —
            the wordmark still lands on whatever the merchant chose for the
            band, rather than the hero losing its art the moment it is switched
            off or the catalogue cannot be reached. */}
        <HeroBackdrop
          layers={[
            {
              background: sectionBackground,
              panel: resolveHeroPanel(sectionBackground, sectionLayout),
              theme: brandTheme,
            },
          ]}
          index={0}
          isMobile={isMobile}
          instant={prefersReducedMotion}
          mounted
        />
        <div id="hero-sentinel" aria-hidden="true" className={styles.sentinel} />
        <div className={`sf-container ${styles.brandInner}`}>
          <h1 className="sf-visually-hidden">{brand.name}</h1>
          {/* The lockup on its plate: the wordmark is champagne gold with no
              light-ground variant, so its plate is the same near-black the
              masthead above it is, on either theme. */}
          <GlowWrap tone="duo" intensity={0.2} className={styles.brandGlow}>
            <span className={`sf-on-dark sf-lockup-plate ${styles.brandPlate}`}>
              <Logo variant="wordmark" width={280} alt="" className={styles.brandMark} />
            </span>
          </GlowWrap>
          <p className={styles.brandTagline}>{brand.tagline}</p>
          {/* `.cta` is what the backdrop's contrast rules key off (the CSS's
              "controls over a photograph" block). It carries no layout of its
              own outside `.actions`, so the one button on the brand slide takes
              the treatment without taking the CTA row's full-width geometry. */}
          <Button
            variant="primary"
            size="lg"
            to={ROUTES.SHOP}
            className={styles.cta}
          >
            Shop the Black Rice Range
          </Button>
        </div>
      </section>
    );
  }

  const activeEntry = slides[index] || null;
  const activeTheme = activeEntry ? activeEntry.theme : brandTheme;
  const anyBackdrop = slides.some((entry) => hasHeroBackground(entry.background));
  const names = slides.map(heroSlideName);
  const shortNames = slides.map(heroSlideShortName);
  const instant = config.transition === "none" || prefersReducedMotion;
  // A slide that prints no headline (a poster) still leaves the page a heading:
  // the wordmark, spoken but not seen. Exactly one h1 either way.
  const activeHeadline = activeEntry
    ? activeEntry.kind === "product"
      ? heroHeadline(activeEntry.product)
      : activeEntry.slide.headline
    : "";
  // The rail and the ground light both follow the composition on screen.
  const activeAlign = activeEntry
    ? resolveHeroAlign(activeEntry.layout, isMobile ? "b" : "a")
    : "start";

  return (
    <section
      ref={heroRef}
      className={cx(
        styles.hero,
        HEIGHT_CLASS[config.height] || HEIGHT_CLASS.standard,
        anyBackdrop && styles.heroBackdrop,
        instant && styles.heroInstant,
        // The band's ground follows the slide on screen, so a dark poster can
        // sit in a cream carousel and take its ink, hairlines, buttons and
        // scrim with it. `.sf-on-dark` is the storefront's own token scope —
        // the hero is the only content section that ever wears it.
        themeClass(activeTheme)
      )}
      aria-roledescription="carousel"
      aria-label="Black Rice range"
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handlePointerLeave}
      onFocus={() => setFocusWithin(true)}
      onBlur={() => setFocusWithin(false)}
    >
      {/* The admin's artwork, one crossfading layer per slide, behind
          everything else the section draws. */}
      <HeroBackdrop
        layers={slides}
        index={index}
        isMobile={isMobile}
        instant={instant}
        mounted={restMounted}
      />

      {/* The header watches this: transparent while the hero's opening band is
          on screen, glass the moment content starts passing beneath it. */}
      <div id="hero-sentinel" aria-hidden="true" className={styles.sentinel} />

      {/* Desktop-only ground light behind the copy. Non-breathing — the plate
          owns the one breathing glow above the fold (DESIGN_SYSTEM §5). */}
      <GlowWrap
        tone="gold"
        className={cx(styles.groundGlow, GLOW_CLASS[activeAlign] || GLOW_CLASS.start)}
        aria-hidden="true"
      />

      {!activeHeadline && <h1 className="sf-visually-hidden">{brand.name}</h1>}

      {/* Announced only while the timer is not running, so what a screen reader
          hears is always the answer to something the visitor just did — never
          the carousel talking over whatever they were reading. */}
      <p className="sf-visually-hidden" aria-live={running ? "off" : "polite"}>
        {loaded && activeEntry
          ? `Slide ${index + 1} of ${total}: ${names[index]}`
          : ""}
      </p>

      <div
        className={styles.stage}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {!loaded && (
          <div className={cx("sf-container", styles.skeletonInner)} aria-hidden="true">
            <span className={`sf-skeleton ${styles.skeletonCopy}`} />
            <span className={`sf-skeleton ${styles.skeletonPlate}`} />
          </div>
        )}
        {slides.map((entry, i) => (
          <HeroSlide
            key={entry.key}
            entry={entry}
            index={i}
            total={total}
            active={i === index}
            mounted={restMounted}
            isMobile={isMobile}
            eyebrowLabel={config.eyebrowLabel}
            showEyebrow={config.showEyebrow}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* The control rail sits under the stage and follows the active slide's
          alignment, so it reads as part of whichever composition is on screen
          rather than as furniture bolted to one corner. */}
      <div
        className={cx(
          "sf-container",
          styles.railWrap,
          ALIGN_CLASS[activeAlign]
        )}
      >
        <HeroIndex
          index={index}
          total={total}
          names={names}
          shortNames={shortNames}
          intervalMs={config.intervalMs}
          autoplayOn={autoplayOn}
          paused={paused}
          userPaused={userPaused}
          showArrows={config.showArrows}
          showCounter={config.showCounter}
          showProgress={config.showProgress && !prefersReducedMotion}
          showIndex={config.showControls}
          onSelect={goTo}
          onPrev={() => goTo((prev) => prev - 1)}
          onNext={() => goTo((prev) => prev + 1)}
          onTogglePause={() => setUserPaused((prev) => !prev)}
        />
      </div>
    </section>
  );
};

export default HeroCarousel;
