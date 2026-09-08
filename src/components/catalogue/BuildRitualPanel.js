import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import apiService from "../../services/api";
import { reveal } from "../../theme/motion";
import { ROUTES } from "../../utils/constants";
import { Button, GlassCard, SectionHeading, Skeleton } from "../ui";
import RitualCard from "./RitualCard";
import styles from "./BuildRitualPanel.module.css";

// =============================================================================
// BuildRitualPanel — how a listing ends
// =============================================================================
//
// The shop's last chapter is not a product: it is the question the eight
// chapters leave behind. Having seen the range one product at a time, the
// visitor is offered the range in ORDER — the three curated routines — and one
// way through to the rituals index.
//
// IT READS THE WHOLE CATALOGUE, NEVER THE PAGE'S. A ritual step names any
// product in the range, so resolving the step strip against `/shop?concern=
// hydration`'s three products would draw a four-step routine with one thumb and
// three empty plates. The panel therefore fetches `products.getAll()` itself
// rather than taking the listing's rows as a prop — the one place on this page
// where "all of them" is the right answer regardless of what is being listed.
//
// TWO READS, IN PARALLEL, AND IT NEVER TAKES THE PAGE DOWN. `Promise.all`,
// because the panel wants the whole triptych or nothing; any rejection, or no
// live rituals, and it renders NOTHING. A listing that ends one section early
// is still a listing; an error box where the closing panel should be is louder
// than the loss. (Same rule, and the same reason, as the home page's
// RitualsTeaser.)
//
// The copy here is the panel's own. Not one word of a ROUTINE's copy — its
// name, tagline, story or duration — is typed in this file or in RitualCard.
// =============================================================================

// Three seeded rituals; three skeletons hold exactly their shape so nothing
// below moves when the data lands.
const SKELETON_COUNT = 3;

const BuildRitualPanel = ({ className = "" }) => {
  const reduceMotion = useReducedMotion();

  // `undefined` in flight, `null` failed, an object when both reads landed —
  // the tri-state convention every section on the home page already uses.
  const [data, setData] = useState(undefined);

  useEffect(() => {
    let alive = true;
    Promise.all([apiService.rituals.getAll(), apiService.products.getAll()])
      .then(([rituals, products]) => {
        if (!alive) return;
        setData({
          rituals: Array.isArray(rituals) ? rituals : [],
          products: Array.isArray(products) ? products : [],
        });
      })
      .catch((error) => {
        if (!alive) return;
        console.error("Failed to load the rituals panel:", error);
        setData(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  const loading = data === undefined;
  const rituals = data?.rituals || [];

  // Nothing to say, or nothing to say it with.
  if (data === null || (data && rituals.length === 0)) return null;

  return (
    <section
      className={`sf-section ${styles.section} ${className}`.trim()}
      aria-labelledby="build-your-ritual"
    >
      <GlassCard strong glow="duo" padding="lg" className={styles.panel}>
        <SectionHeading
          id="build-your-ritual"
          eyebrow="Finish the ritual"
          title="Build your ritual"
          // "ritual" — the one gradient keyword this panel is allowed.
          gradientWord={2}
          lede="Three routines that put the range in order."
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
                <RitualCard ritual={ritual} products={data.products} compact />
              </motion.div>
            ))}
          </div>
        )}

        <div className={styles.close}>
          <Button variant="primary" to={ROUTES.RITUALS}>
            See all rituals
          </Button>
        </div>
      </GlassCard>
    </section>
  );
};

export default BuildRitualPanel;
