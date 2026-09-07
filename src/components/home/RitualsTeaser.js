import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { reveal } from "../../theme/motion";
import { ROUTES } from "../../utils/constants";
import { Button, SectionHeading, Skeleton } from "../ui";
import RitualCard from "../catalogue/RitualCard";
import styles from "./RitualsTeaser.module.css";

// =============================================================================
// RitualsTeaser — "Build your ritual"
// =============================================================================
//
// The spotlight above says the eight products share one ingredient; this says
// what order to use them in. Three curated routines as cards, then one way
// through to the rituals index.
//
// TWO READS, ONE ROUND TRIP EACH, IN PARALLEL. `rituals.getAll()` (live only,
// in the admin's order, in both api modes) and `products.getAll()` — the whole
// catalogue rather than the hero list, because a step may name any product and
// a routine missing its middle thumb is worse than no thumbs at all.
// `Promise.all`, because the section wants the whole triptych or nothing.
// Any rejection, or no live rituals, and the section renders NOTHING: the page
// above and below it is complete without it, and an error panel here would be
// louder than the loss.
//
// THE STEPS ARE ATTACHED BY THE CARD, from the catalogue this section hands it
// — `apiService.rituals.resolveSteps` is pure, so where it runs is a question
// of who has the products, and the card is reused by Prompt 24's index with the
// same two inputs.
//
// The copy here is the section's own. Not one word of a ROUTINE's copy — its
// name, tagline, story or duration — is typed in this file or in RitualCard.
// =============================================================================

// Three seeded rituals; three skeletons hold exactly their shape so nothing
// below moves when the data lands.
const SKELETON_COUNT = 3;

/**
 * @param {object} props
 * @param {object[]|null|undefined} props.rituals   the routines, from useHomeData()
 * @param {object[]|null|undefined} props.products  the catalogue the steps resolve against
 *
 * `undefined` is "still in flight" (skeletons); `null` is a read that failed
 * (the section takes itself off the page, exactly as it did when it owned the
 * request and caught the rejection).
 */
const RitualsTeaser = ({ rituals: ritualRows, products: productRows }) => {
  const reduceMotion = useReducedMotion();
  const failed = ritualRows === null || productRows === null;
  const loading = !failed && (ritualRows === undefined || productRows === undefined);
  const data = loading || failed ? null : { rituals: ritualRows, products: productRows };

  const rituals = data?.rituals || [];

  // Nothing to say, or nothing to say it with.
  if (failed || (data && rituals.length === 0)) return null;

  return (
    <section className={`sf-section ${styles.section}`} aria-labelledby="rituals-teaser">
      <div className="sf-container">
        <SectionHeading
          id="rituals-teaser"
          eyebrow="Rituals"
          title="Build your ritual"
          // "ritual" — the one gradient keyword this section is allowed.
          gradientWord={2}
          lede="Three curated routines, in the order the range was designed to be used."
          rule
        />

        {loading ? (
          <div className={styles.grid} aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div className={styles.cell} key={index}>
                <Skeleton variant="card" className={styles.skeleton} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {rituals.map((ritual, index) => (
              <motion.div
                className={styles.cell}
                key={ritual.id ?? ritual.slug ?? index}
                {...reveal(reduceMotion, { index, inView: true, amount: 0.1 })}
              >
                <RitualCard ritual={ritual} products={data.products} />
              </motion.div>
            ))}
          </div>
        )}

        <div className={styles.close}>
          <Button variant="primary" to={ROUTES.RITUALS}>
            Build your ritual
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RitualsTeaser;
