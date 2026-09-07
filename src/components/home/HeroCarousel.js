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
import { normalizeHeroConfig } from "../../utils/heroConfig";
import { Button, Chip, CloudinaryImage, GlowWrap, Price } from "../ui";
import Logo from "../brand/Logo";
import HeroIndex from "./HeroIndex";
import styles from "./HeroCarousel.module.css";

// =============================================================================
// HeroCarousel — the home page opens on the products, not on a banner
// =============================================================================
//
// One slide per HERO PRODUCT (eight at launch): the label card on a glowing
// plate on one side, and on the other the product's own emotional headline, its
// price, one or two quiet lines, two CTAs and its trust badges. There is no
// slide store and no admin artwork any more — a product joins the carousel by
// carrying a `heroOrder`, and it prints the `heroHeadline`/`heroSubtext` seeded
// from PRODUCTS.md. Nothing here hard-codes a word of product copy.
//
// DATA (both api modes, one round trip each, in parallel)
//   • products.getHeroProducts()  the slides, already in `heroOrder`
//   • hero.getConfig()            section behaviour only, through
//     normalizeHeroConfig(): enabled, autoplay, intervalMs, transition,
//     pauseOnHover and which chrome shows.
//   Fallbacks, in order: hero products → products.getFeatured(8) → the BRAND
//   SLIDE (wordmark, tagline, one CTA). Never a fabricated product: an
//   unreachable catalogue must not be the one surface that invents a listing.
//
// THE COPY IS RENDERED ONCE and updated in place — the pattern the banner hero
// this replaced used. Only the MEDIA is stacked. That is what keeps the page to
// a single `h1` and stops eight off-screen CTAs being tabbed into. The copy
// block becomes an `aria-live="polite"` region only while autoplay is paused or
// stopped: a change the visitor asked for is worth announcing, one the timer
// made would talk over whatever they were reading.
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

// The eyebrow's fixed half. The variable half is the slide's position, and the
// headline/subtext under it are the product's own words.
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

/** "Black Rice Ritual · 03 / 08" */
export const heroEyebrow = (index, total) =>
  `${EYEBROW_LABEL} · ${padIndex(index + 1)} / ${padIndex(total)}`;

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

const HeroCarousel = () => {
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
  // Slides after the first are mounted in an idle pass, so the first paint
  // carries exactly one image: the LCP element.
  const [restMounted, setRestMounted] = useState(false);

  const heroRef = useRef(null);
  const swipeRef = useRef(null);

  const isMobile = useMediaFlag(MOBILE_QUERY);
  const parallaxAllowed = useMediaFlag(PARALLAX_QUERY);
  const parallaxOn = parallaxAllowed && !prefersReducedMotion;

  // ── Data ─────────────────────────────────────────────────────────────────
  // Both reads go out together; neither can fail the other. hero.getConfig()
  // never throws by contract (it resolves to {}), and a catalogue that does
  // throw simply leaves the brand slide standing.
  useEffect(() => {
    let alive = true;

    const load = async () => {
      const [heroResult, configResult] = await Promise.allSettled([
        apiService.products.getHeroProducts(),
        apiService.hero.getConfig(),
      ]);
      if (!alive) return;

      if (configResult.status === "fulfilled" && configResult.value) {
        setRawConfig(configResult.value);
      }

      const hero =
        heroResult.status === "fulfilled" && Array.isArray(heroResult.value)
          ? heroResult.value
          : [];

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
  }, []);

  const config = useMemo(() => normalizeHeroConfig(rawConfig), [rawConfig]);

  const total = products.length;
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
  // Slide one is the LCP element. The other seven are mounted in an idle pass
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
  // Shown when the hero is switched off, and when neither the hero order nor
  // the featured list resolved to a product. It carries no photography and no
  // claim that is not already in brand.js. Its "headline" is the wordmark, so
  // the page's single h1 is the visually hidden one beside it.
  const brandOnly = !config.enabled || (loaded && total === 0);

  if (brandOnly) {
    return (
      <section className={`${styles.hero} ${styles.heroBrand}`} aria-label={brand.name}>
        <div id="hero-sentinel" aria-hidden="true" className={styles.sentinel} />
        <div className={`sf-container ${styles.brandInner}`}>
          <h1 className="sf-visually-hidden">{brand.name}</h1>
          <GlowWrap tone="duo" intensity={0.2} className={styles.brandGlow}>
            <Logo variant="wordmark" width={280} alt="" className={styles.brandMark} />
          </GlowWrap>
          <p className={styles.brandTagline}>{brand.tagline}</p>
          <Button variant="primary" size="lg" to={ROUTES.SHOP}>
            Shop the Black Rice Range
          </Button>
        </div>
      </section>
    );
  }

  const active = products[index] || null;
  const headline = heroHeadline(active);
  const subtext = heroSubtext(active);
  const badges = Array.isArray(active?.badges) ? active.badges : [];
  const names = products.map((p) => p?.name || "");
  const shortNames = products.map((p) => p?.shortName || p?.name || "");

  const stageClasses = [
    styles.stage,
    config.transition === "none" || prefersReducedMotion ? styles.stageInstant : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      ref={heroRef}
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label="Black Rice range"
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handlePointerLeave}
      onFocus={() => setFocusWithin(true)}
      onBlur={() => setFocusWithin(false)}
    >
      {/* The header watches this: transparent while the hero's opening band is
          on screen, glass the moment content starts passing beneath it. */}
      <div id="hero-sentinel" aria-hidden="true" className={styles.sentinel} />

      {/* Desktop-only ground light behind the copy. Non-breathing — the plate
          owns the one breathing glow above the fold (DESIGN_SYSTEM §5). */}
      <GlowWrap tone="gold" className={styles.groundGlow} aria-hidden="true" />

      <div className={`sf-container ${styles.inner}`}>
        {/* ---- Copy: rendered ONCE, updated in place -------------------- */}
        <div className={styles.copy}>
          <div className={styles.copyText}>
            {/* THE SIZER. Every slide's copy block, stacked in one grid cell and
                left invisible, so the copy column is always as tall as the
                TALLEST slide and nothing below it moves when the copy swaps.
                Reserving a fixed number of ems instead would only hold for the
                copy that happened to be seeded — hero lines are edited on the
                products, and one word more would put the shift straight back.
                It renders the real Button and Chip so the mirror cannot drift
                from the thing it is measuring. `visibility: hidden` takes it out
                of the tab order and `aria-hidden` out of the accessibility tree:
                it is furniture, not content. */}
            <div className={styles.copySizer} aria-hidden="true">
              {/* The floor, present from the first frame: the copy column has a
                  height BEFORE the catalogue answers, so the page below the hero
                  does not drop when the first slide's words arrive. */}
              <div className={styles.copyBlock}>
                <div className={styles.copyLines}>
                  <p className={`sf-eyebrow ${styles.eyebrow}`}>{EYEBROW_LABEL}</p>
                  <p className={styles.headline} />
                  <span className={styles.price} />
                  <p className={styles.subtext} />
                </div>
                <div className={styles.actions}>
                  <Button variant="primary" size="lg" as="span" className={styles.cta} />
                  <Button variant="addToCart" size="lg" as="span" className={styles.cta} />
                </div>
                <ul className={styles.badges}>
                  {brand.trustBadges.map((badge) => (
                    <li key={badge}>
                      <Chip variant="trust">{badge}</Chip>
                    </li>
                  ))}
                </ul>
              </div>

              {products.map((product, i) => (
                <div key={product.id ?? i} className={styles.copyBlock}>
                  <div className={styles.copyLines}>
                    <p className={`sf-eyebrow ${styles.eyebrow}`}>{heroEyebrow(i, total)}</p>
                    <p className={styles.headline}>{heroHeadline(product)}</p>
                    <Price product={product} size="sm" live={false} className={styles.price} />
                    <p className={styles.subtext}>{heroSubtext(product)}</p>
                  </div>
                  <div className={styles.actions}>
                    <Button variant="primary" size="lg" as="span" className={styles.cta}>
                      {exploreLabel(product)}
                    </Button>
                    <Button variant="addToCart" size="lg" as="span" className={styles.cta}>
                      {product.priceTBA ? "Coming soon" : "Add to Cart"}
                    </Button>
                  </div>
                  <ul className={styles.badges}>
                    {(Array.isArray(product.badges) ? product.badges : []).map((badge) => (
                      <li key={badge}>
                        <Chip variant="trust">{badge}</Chip>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* The copy itself: ONE block, laid over the sizer. */}
            <div className={styles.copyBlock}>
              {/* Live only while the timer is not running, so an announcement is
                  always the answer to something the visitor just did. The CTAs
                  sit outside it: their labels change with the slide too, and a
                  button that narrates itself mid-sentence is noise. */}
              <div
                className={styles.copyLines}
                aria-live={running ? "off" : "polite"}
              >
                <p className={`sf-eyebrow ${styles.eyebrow}`}>
                  {loaded ? heroEyebrow(index, total) : EYEBROW_LABEL}
                </p>

                {headline ? (
                  <h1 className={styles.headline}>{headline}</h1>
                ) : (
                  <div className={styles.headline} aria-hidden="true">
                    <span className={`sf-skeleton ${styles.skeletonLine}`} />
                  </div>
                )}

                {active && (
                  <Price
                    product={active}
                    size="sm"
                    live={false}
                    className={styles.price}
                  />
                )}

                <p className={styles.subtext}>{subtext}</p>
              </div>

              <div className={styles.actions}>
                {active && (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      to={productPath(active)}
                      className={styles.cta}
                    >
                      {exploreLabel(active)}
                    </Button>
                    <Button
                      variant="addToCart"
                      size="lg"
                      className={styles.cta}
                      disabled={Boolean(active.priceTBA)}
                      onClick={() => handleAddToCart(active)}
                    >
                      {active.priceTBA ? "Coming soon" : "Add to Cart"}
                    </Button>
                  </>
                )}
              </div>

              <ul className={styles.badges}>
                {badges.map((badge) => (
                  <li key={badge}>
                    <Chip variant="trust">{badge}</Chip>
                  </li>
                ))}
              </ul>
            </div>
          </div>

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

        {/* ---- Media: one layer per slide, crossfaded -------------------- */}
        <div
          className={stageClasses}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <GlowWrap
            tone="duo"
            intensity={0.24}
            breathe
            className={styles.stageGlow}
          >
            {!loaded && <span className={`sf-skeleton ${styles.stageSkeleton}`} />}
            {products.map((product, i) => {
              // Everything past the first slide waits for the idle pass; the
              // active slide is always mounted in case a control ran first.
              if (i !== 0 && i !== index && !restMounted) return null;
              const media = primaryImage(product);
              if (!media) return null;
              return (
                <div
                  key={product.id ?? i}
                  className={[styles.layer, i === index ? styles.layerActive : ""]
                    .filter(Boolean)
                    .join(" ")}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={slideLabel(product, i, total)}
                  aria-hidden={i === index ? undefined : "true"}
                >
                  <CloudinaryImage
                    src={media.url}
                    alt={productAlt(product, media)}
                    crop={media.crop}
                    ar={isMobile ? "1:1" : "4:5"}
                    pad
                    fit="contain"
                    plate
                    widths={[480, 768, 1080]}
                    sizes="(max-width: 768px) 80vw, 40vw"
                    priority={i === 0}
                    className={styles.plate}
                  />
                </div>
              );
            })}
          </GlowWrap>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
