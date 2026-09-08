import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import apiService, { resolveRitualSteps } from "../../services/api";
import brand from "../../config/brand";
import useSeo from "../../hooks/useSeo";
import { useCart } from "../../hooks/useCart";
import { breadcrumbJsonLd, itemListJsonLd } from "../../utils/seo";
import { ROUTES } from "../../utils/constants";
import { buildCartItem, formatCurrency, onImageError } from "../../utils/helpers";
import { isPriceKnown, resolvePrice } from "../../utils/product";
import {
  Button,
  ContentBlocks,
  GlassCard,
  SectionHeading,
  Skeleton,
} from "../../components/ui";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import LegalNote from "../../components/brand/LegalNote";
import RitualStep from "../../components/catalogue/RitualStep";
import NotFound from "../NotFound/NotFound";
import styles from "./RitualDetail.module.css";

// =============================================================================
// /rituals/:slug — one routine, step by step
// =============================================================================
//
// The index says what the three routines ARE. This page is the routine itself:
// the story, then every step as a row a shopper can act on without leaving it —
// the product, what it does, when to use it, what it costs and one add to cart.
//
// THE PAGE OWNS THE CHOICES, NOT THE ROWS. A step with an alternative (the body
// ritual's soap or wash) draws a segmented control, and the CTA panel at the
// foot has to spend whatever the visitor chose — so the selection is lifted
// here, keyed by step order, and both the row and the panel read the same map.
// A row still works on its own (it keeps its own choice when nobody lifts it),
// which is what makes it testable and reusable.
//
// THE BUNDLE IS BEHIND A FLAG, AND THE FLAG IS OFF (brand.flags.
// enableRitualBundles, brief §8.1: bundles wait until the range has prices).
// Both halves are built: with the flag on, one press adds every priced step in
// one gesture — `addMany` folds them into ONE commit with ONE toast and skips
// anything unpriced rather than enqueue a ₹0 line. With the flag off the panel
// offers "Shop each step", which takes the visitor to the first row instead.
//
// NOTHING UNPRICED IS EVER COUNTED. Five of the eight products have no MRP yet.
// The total is "From ₹X for the priced steps" and it appears only when at least
// one step has a price — a routine whose steps are all "Price on launch" gets
// no total at all rather than a confident ₹0, and "From" plus "the priced
// steps" is the honest reading of a sum that is missing rows.
//
// The only durations on this page are the ritual's own copy ("About five
// minutes"), printed as written. They are not a claim about anything.
// =============================================================================

const SKELETON_STEPS = 4;

/** "Ritual · 4 steps · About five minutes" — the head's one line of metadata. */
export const ritualEyebrow = (stepCount, duration) => {
  const n = Number.isFinite(Number(stepCount)) ? Math.max(0, Number(stepCount)) : 0;
  const parts = ["Ritual", `${n} ${n === 1 ? "step" : "steps"}`];
  const time = typeof duration === "string" ? duration.trim() : "";
  if (time) parts.push(time);
  return parts.join(" · ");
};

/**
 * The routine's total, over the steps that have a price.
 *
 * @returns {{total: number, priced: number, unpriced: number}} `priced: 0` is
 *          the signal the panel reads to print no total at all.
 */
export const ritualTotal = (products = []) =>
  (Array.isArray(products) ? products : []).reduce(
    (acc, product) => {
      if (!isPriceKnown(product)) return { ...acc, unpriced: acc.unpriced + 1 };
      return {
        total: acc.total + (resolvePrice(product).price || 0),
        priced: acc.priced + 1,
        unpriced: acc.unpriced,
      };
    },
    { total: 0, priced: 0, unpriced: 0 }
  );

// ── The page's one read ──────────────────────────────────────────────────────

/**
 * One ritual and the catalogue its steps resolve against.
 *
 * `rituals.getBySlug` answers `null` for a slug nobody has, which is a 404 and
 * not an error — the two are told apart here so the page can render a real
 * NotFound for the first and "could not be loaded" for the second.
 */
const useRitual = (slug) => {
  const [state, setState] = useState({ status: "loading", ritual: null, products: [] });

  useEffect(() => {
    let alive = true;
    setState((prev) => ({ ...prev, status: "loading" }));
    Promise.all([apiService.rituals.getBySlug(slug), apiService.products.getAll()])
      .then(([ritual, products]) => {
        if (!alive) return;
        setState({
          status: "ready",
          ritual: ritual || null,
          products: Array.isArray(products) ? products : [],
        });
      })
      .catch((error) => {
        if (!alive) return;
        console.error("Failed to load the ritual:", error);
        setState({ status: "failed", ritual: null, products: [] });
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  return state;
};

// ══════════════════════════════════════════════════════════════════════════════
// The page, once there is something to show
// ══════════════════════════════════════════════════════════════════════════════

const RitualDetailView = ({ status, ritual, products }) => {
  const reduceMotion = useReducedMotion();
  const { addMany } = useCart();

  const loading = status === "loading";
  const failed = status === "failed";

  const steps = useMemo(
    () => (ritual ? resolveRitualSteps(ritual, products) : []),
    [ritual, products]
  );

  // stepKey -> the chosen product id. Only a step with an alternative ever
  // appears in here; everything else resolves to its own product below.
  const [choices, setChoices] = useState({});
  useEffect(() => {
    // A different routine is a different set of choices — without this, step 1
    // of the body ritual would keep the selection made on another page.
    setChoices({});
  }, [ritual?.id, ritual?.slug]);

  const chosenFor = useCallback(
    (step) => {
      const picked = choices[step.order];
      if (picked && step.alternativeProduct && String(step.alternativeProduct.id) === picked) {
        return step.alternativeProduct;
      }
      return step.product || step.alternativeProduct || null;
    },
    [choices]
  );

  const chosenProducts = useMemo(
    () => steps.map(chosenFor).filter(Boolean),
    [steps, chosenFor]
  );

  const { total, priced } = useMemo(() => ritualTotal(chosenProducts), [chosenProducts]);

  // ---- The one control that is not a link ---------------------------------
  const stepsRef = useRef(null);
  const goToFirstStep = () => {
    const first = stepsRef.current?.firstElementChild;
    if (!first) return;
    first.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
    // A scroll a keyboard visitor cannot follow is not a jump: focus goes with
    // it, to the first thing in the row that can take it.
    first.querySelector("a, button")?.focus({ preventScroll: true });
  };

  // Every unpriced step is dropped BEFORE the cart sees it. `addMany` would
  // skip it too (`buildCartItem` throws PRICE_TBA rather than enqueue a ₹0
  // line), but filtering here is what makes the toast's count — "2 items added
  // to your cart" — the number of things that actually joined it.
  const addWholeRitual = () =>
    addMany(chosenProducts.filter(isPriceKnown).map(buildCartItem));

  // ---- Copy and structured data -------------------------------------------

  const name = ritual?.name || "";
  const trail = useMemo(
    () => [
      { label: "Home", to: ROUTES.HOME },
      { label: "Rituals", to: ROUTES.RITUALS },
      ...(name ? [{ label: name }] : []),
    ],
    [name]
  );

  useSeo({
    title: name || "Rituals",
    description:
      ritual?.tagline ||
      ritual?.story ||
      "A curated LAMIKAA Naturals routine, step by step.",
    jsonLd: [breadcrumbJsonLd(trail), itemListJsonLd(chosenProducts)].filter(Boolean),
  });

  // The bundle is offered only when there is a bundle to add. A routine whose
  // every step is still "Price on launch" — or one whose alternative the
  // visitor has just switched to the unpriced half — gets "Shop each step"
  // instead: a button that can only ever answer "none of these are on sale
  // yet" is a dead control, and the panel already prints no total for it.
  const bundles = brand.flags.enableRitualBundles === true && priced > 0;

  return (
    <div className={styles.page}>
      {/* ── The head ─────────────────────────────────────────────────────── */}
      <section className={`sf-section ${styles.head}`} aria-labelledby="ritual-title">
        <div className={`sf-container ${styles.headGrid}`}>
          <div className={styles.headText}>
            {/* Held back until the name is known: a trail whose last crumb
                says "Rituals" would mark the INDEX as the current page, and
                then swap under the reader a moment later. */}
            {!loading && <Breadcrumb items={trail} className={styles.crumbs} />}

            {loading ? (
              <Skeleton variant="text" lines={3} />
            ) : failed ? (
              <>
                <h1 id="ritual-title" className={styles.title}>
                  This ritual could not be loaded
                </h1>
                <p className={styles.failed}>
                  Something went wrong on the way to it. The routines are all still
                  there.
                </p>
                <Button variant="primary" to={ROUTES.RITUALS}>
                  Browse all rituals
                </Button>
              </>
            ) : (
              <>
                <p className={`sf-eyebrow sf-eyebrow--rule ${styles.eyebrow}`}>
                  {ritualEyebrow(steps.length, ritual?.duration)}
                </p>
                <h1 id="ritual-title" className={styles.title}>
                  {name}
                </h1>
                {ritual?.tagline ? (
                  <p className={styles.tagline}>{ritual.tagline}</p>
                ) : null}
                {ritual?.story ? (
                  <ContentBlocks
                    text={ritual.story}
                    variant="editorial"
                    className={styles.story}
                  />
                ) : null}
              </>
            )}
          </div>

          {!failed && ritual?.image ? (
            <div className={styles.headMedia}>
              <div className={`sf-placeholder-media ${styles.mediaFrame}`}>
                <img
                  className={styles.image}
                  src={ritual.image}
                  alt=""
                  loading="eager"
                  decoding="async"
                  onError={onImageError}
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ── The steps ────────────────────────────────────────────────────── */}
      {!failed && (
        <section
          className={`sf-section ${styles.stepsSection}`}
          aria-labelledby="ritual-steps-title"
        >
          <div className="sf-container">
            <h2 id="ritual-steps-title" className="sf-visually-hidden">
              The steps
            </h2>

            {loading ? (
              <div className={styles.skeletons} aria-hidden="true">
                {Array.from({ length: SKELETON_STEPS }, (_, index) => (
                  <div className={styles.skeletonStep} key={index}>
                    <Skeleton variant="block" aspectRatio="1 / 1" />
                    <Skeleton variant="text" lines={3} />
                  </div>
                ))}
              </div>
            ) : (
              /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
              <ol className={styles.steps} role="list" ref={stepsRef}>
                {steps.map((step, index) => (
                  <RitualStep
                    key={`${step.order}-${step.productId ?? index}`}
                    step={step}
                    index={index}
                    total={steps.length}
                    selectedProductId={chosenFor(step)?.id ?? null}
                    onSelect={(id) =>
                      setChoices((prev) => ({ ...prev, [step.order]: String(id) }))
                    }
                  />
                ))}
              </ol>
            )}
          </div>
        </section>
      )}

      {/* ── The panel ────────────────────────────────────────────────────── */}
      {!loading && !failed && steps.length > 0 && (
        <section className={`sf-section ${styles.ctaSection}`} aria-labelledby="ritual-cta">
          <div className="sf-container">
            <GlassCard strong glow="duo" padding="lg" className={styles.cta}>
              <SectionHeading
                id="ritual-cta"
                eyebrow="Everything you need"
                title={name}
                rule
              />

              {priced > 0 ? (
                <p className={styles.total}>
                  From {formatCurrency(total, null, { decimals: 0 })} for the priced
                  steps
                </p>
              ) : null}

              <div className={styles.ctaActions}>
                {bundles ? (
                  <Button variant="primary" size="lg" onClick={addWholeRitual}>
                    Add the whole ritual to cart
                  </Button>
                ) : (
                  <Button variant="primary" size="lg" onClick={goToFirstStep}>
                    Shop each step
                  </Button>
                )}
                <Button variant="secondary" to={ROUTES.RITUALS}>
                  Browse all rituals
                </Button>
              </div>
            </GlassCard>

            {/* The ownership qualifier, once, at the foot of the page that
                asks for the sale — the same sentence the footer carries. */}
            <LegalNote compact className={styles.legal} />
          </div>
        </section>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// RITUAL DETAIL
// ══════════════════════════════════════════════════════════════════════════════

/**
 * The read and the 404, and nothing else.
 *
 * THE SPLIT IS NOT COSMETIC. `useSeo` claims the tab, the description, the
 * Open Graph set and the canonical, and remembers what it displaced so it can
 * put it back. Two of them mounted at once — this page's, and the one inside
 * <NotFound/> — restore in the wrong order and leave a stale description
 * behind. So the not-found branch returns BEFORE the view that owns the head,
 * and exactly one useSeo is ever mounted on this route.
 */
const RitualDetail = () => {
  const { slug } = useParams();
  const state = useRitual(slug);

  if (state.status === "ready" && !state.ritual) return <NotFound />;

  return <RitualDetailView {...state} />;
};

export default RitualDetail;
