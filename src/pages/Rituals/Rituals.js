import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import apiService, { resolveRitualSteps } from "../../services/api";
import useSeo from "../../hooks/useSeo";
import { reveal } from "../../theme/motion";
import { ritualPath } from "../../utils/categories";
import { ROUTES } from "../../utils/constants";
import { onImageError } from "../../utils/helpers";
import { stageSrc } from "../../utils/product";
import { Button, Chip, GlassCard, SectionHeading, Skeleton } from "../../components/ui";
import { stepCountLabel } from "../../components/catalogue/RitualCard";
import { stepNumeral } from "../../components/catalogue/RitualStep";
import styles from "./Rituals.module.css";

// =============================================================================
// /rituals — the three curated routines
// =============================================================================
//
// The range answers "what is in here?" one product at a time on `/shop`. This
// page answers "in what ORDER?", which is the question the eight chapters leave
// behind — and it answers it three times, because a morning is not an evening
// and neither is a shower.
//
// FULL-WIDTH ROWS, NOT A GRID OF CARDS. `RitualCard` already exists for the
// grid form (the home teaser and the shop's closing panel use it, `compact`),
// and repeating it here would make the index of the rituals look exactly like
// the two places that link TO the index. A row gets the routine's photograph a
// 16:10 stage, its story two paragraphs of room and its step strip a whole line
// — which is the only place on the site where all three fit at once.
//
// ONE CONTROL PER ROW. The row is not a link: it holds a button, and a button
// inside an anchor is invalid markup that swallows the tap. So the heading is
// text, the plates are decoration, and "See the ritual" is the single stop —
// named for the routine it opens, because three identical link names in a
// screen reader's link list are three links to nowhere in particular.
//
// EVERY WORD OF A ROUTINE IS THE ROUTINE'S OWN — name, tagline, story and
// duration come from the record the admin edits. The page types its heading,
// its lede, its CTA and its two empty-state sentences, and nothing else.
// =============================================================================

// The seeded set is three; the skeletons hold exactly that shape so nothing
// below moves when the data lands.
const SKELETON_COUNT = 3;

// 48px on the page, so 96 covers a 2x screen.
const THUMB_WIDTH = 96;

// ── The page's one read ──────────────────────────────────────────────────────

/**
 * The rituals and the catalogue they run over, in two parallel requests.
 *
 * BOTH OR NEITHER. A step names any product in the range, so a step strip
 * resolved against a failed product read would draw four empty plates under a
 * routine that is perfectly fine — worse than saying the page could not be
 * loaded, which is what `Promise.all` lets this do.
 *
 * @returns {{status: "loading"|"ready"|"failed", rituals: object[],
 *            products: object[]}}
 */
const useRituals = () => {
  const [state, setState] = useState({ status: "loading", rituals: [], products: [] });

  useEffect(() => {
    let alive = true;
    Promise.all([apiService.rituals.getAll(), apiService.products.getAll()])
      .then(([rituals, products]) => {
        if (!alive) return;
        setState({
          status: "ready",
          rituals: Array.isArray(rituals) ? rituals : [],
          products: Array.isArray(products) ? products : [],
        });
      })
      .catch((error) => {
        if (!alive) return;
        console.error("Failed to load the rituals:", error);
        setState({ status: "failed", rituals: [], products: [] });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
};

// ── One row ──────────────────────────────────────────────────────────────────

const RitualRow = ({ ritual, products, index }) => {
  const reduceMotion = useReducedMotion();
  const steps = resolveRitualSteps(ritual, products);
  const name = ritual.name || "";
  const headingId = `ritual-${ritual.slug || ritual.id || index}`;

  return (
    <motion.li
      className={styles.row}
      {...reveal(reduceMotion, { index, inView: true, amount: 0.15 })}
    >
      <GlassCard
        as="article"
        strong
        glow={index % 2 ? "violet" : "pink"}
        padding="none"
        className={styles.card}
        aria-labelledby={headingId}
      >
        {ritual.image ? (
          <div className={`sf-placeholder-media ${styles.media}`}>
            <img
              className={styles.image}
              src={ritual.image}
              alt=""
              loading="lazy"
              decoding="async"
              onError={onImageError}
            />
          </div>
        ) : (
          <div className={styles.media} aria-hidden="true" />
        )}

        <div className={styles.body}>
          <p className={`sf-eyebrow sf-eyebrow--rule ${styles.eyebrow}`}>
            {stepCountLabel(steps.length)}
          </p>

          <h2 id={headingId} className={styles.name}>
            {name}
          </h2>

          {ritual.tagline ? <p className={styles.tagline}>{ritual.tagline}</p> : null}
          {ritual.story ? <p className={styles.story}>{ritual.story}</p> : null}

          {/* The sequence, drawn. Decoration: the eyebrow above already says
              how many steps there are, and the plates carry no words. */}
          {steps.length > 0 && (
            <div className={styles.strip} aria-hidden="true">
              {steps.map((step, position) => (
                <span className={styles.stripStep} key={`${step.order}-${position}`}>
                  <span className={`sf-plate ${styles.thumb}`}>
                    {step.product ? (
                      <img
                        src={stageSrc(step.product, { w: THUMB_WIDTH })}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={onImageError}
                      />
                    ) : null}
                  </span>
                  <Chip variant="step" className={styles.stripNumeral}>
                    {stepNumeral(step.order, position)}
                  </Chip>
                </span>
              ))}
            </div>
          )}

          <div className={styles.foot}>
            {ritual.duration ? (
              <p className={styles.duration}>{ritual.duration}</p>
            ) : null}
            <Button
              variant="primary"
              to={ritualPath(ritual)}
              /* "See the ritual" three times over is three links a screen
                 reader cannot tell apart; the routine's name is what does. */
              aria-label={`See the ritual: ${name}`}
            >
              See the ritual
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.li>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// RITUALS
// ══════════════════════════════════════════════════════════════════════════════

const Rituals = () => {
  const { status, rituals, products } = useRituals();

  useSeo({
    title: "Rituals",
    description:
      "Three curated routines that put the LAMIKAA Naturals Black Rice range in the order it was designed for.",
  });

  const loading = status === "loading";
  const failed = status === "failed";

  return (
    <div className={styles.page}>
      <section className={`sf-section ${styles.head}`} aria-labelledby="rituals-title">
        <div className="sf-container">
          <SectionHeading
            as="h1"
            id="rituals-title"
            eyebrow="Rituals"
            title="Curated routines"
            // "routines" — the one gradient keyword this page is allowed.
            gradientWord={1}
            lede="Three ways to use the Black Rice range in the order it was designed for."
            rule
          />
        </div>
      </section>

      <div className={`sf-container ${styles.list}`}>
        {loading && (
          <div aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div className={styles.skeleton} key={index}>
                <Skeleton variant="block" aspectRatio="16 / 10" />
                <div className={styles.skeletonBody}>
                  <Skeleton variant="text" lines={2} />
                  <Skeleton variant="text" lines={3} />
                </div>
              </div>
            ))}
          </div>
        )}

        {failed && (
          <GlassCard padding="lg" className={styles.panel} role="alert">
            <p className={styles.panelTitle}>The rituals could not be loaded.</p>
            <p className={styles.panelBody}>
              Something went wrong on the way to them. Nothing is missing from the
              range — only from this page.
            </p>
            <Button variant="primary" to={ROUTES.SHOP}>
              Shop the range
            </Button>
          </GlassCard>
        )}

        {!loading && !failed && rituals.length === 0 && (
          <GlassCard padding="lg" className={styles.panel}>
            <p className={styles.panelTitle}>No routines yet</p>
            <p className={styles.panelBody}>
              The curated routines are being written. The whole range is ready in
              the meantime.
            </p>
            <Button variant="primary" to={ROUTES.SHOP}>
              Shop the range
            </Button>
          </GlassCard>
        )}

        {!loading && !failed && rituals.length > 0 && (
          /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
          <ul className={styles.rows} role="list">
            {rituals.map((ritual, index) => (
              <RitualRow
                key={ritual.id ?? ritual.slug ?? index}
                ritual={ritual}
                products={products}
                index={index}
              />
            ))}
          </ul>
        )}
      </div>

      {/* One way back into the range, for a visitor who has read all three and
          would rather assemble their own. */}
      {!loading && !failed && rituals.length > 0 && (
        <section className={`sf-section ${styles.close}`}>
          <div className="sf-container">
            <hr className="sf-hairline sf-hairline--gradient" />
            <p className={styles.closeText}>
              Or read the range one product at a time.
            </p>
            <Button variant="secondary" to={ROUTES.SHOP}>
              Shop all products
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Rituals;
