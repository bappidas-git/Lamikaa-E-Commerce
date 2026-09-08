import React from "react";
import RitualCard from "../catalogue/RitualCard";
import { Chip } from "../ui";
import styles from "./HowToUse.module.css";

// =============================================================================
// HowToUse — the directions, the ritual step, and where this fits
// =============================================================================
//
// Three answers to one question, in the order a shopper asks them: how do I use
// this, when in the routine does it come, and what else is in that routine.
//
//   1. THE DIRECTIONS are the pack's own `howToUse[]`, as an ordered list with
//      the shared step numeral in front of each line. A real <ol>, so the
//      sequence survives a screen reader and a stylesheet that never loads;
//      the numerals are `aria-hidden` because the list already numbers itself.
//   2. THE RITUAL STEP is the product's place in the LAMIKAA routine —
//      "Step 01 · Cleanse", and how often. It is one card rather than a line of
//      prose because it is the fact most likely to be scanned for.
//   3. PART OF THESE RITUALS lists the routines that actually name this
//      product, as compact `RitualCard`s. The list is DERIVED, not authored:
//      a ritual belongs here when one of its steps points at this product,
//      either as the step's product or as its alternative (the soap and the
//      body wash are both step one of the body ritual). Nothing is typed here
//      about which rituals exist — an admin who adds a step adds the link.
//
// EVERY SECTION IS OPTIONAL AND SILENT WHEN EMPTY. A product with no
// directions, no ritual step and no routine renders nothing at all, which is
// what lets the page decide whether the chapter exists.
//
// Props:
//   product   the product record
//   rituals   every live ritual (`apiService.rituals.getAll()`)
//   products  the catalogue the ritual cards resolve their steps against
// =============================================================================

/** The three headings this block owns. */
const RITUAL_STEP_TITLE = "Ritual step";
const RITUALS_TITLE = "Part of these rituals";

/**
 * The rituals that name this product, in the admin's own order.
 *
 * A step counts whether the product is its primary or its alternative — a
 * routine that offers the bar OR the wash includes both of them.
 *
 * Exported for the unit test: it is the only rule in this file.
 */
export const ritualsWithProduct = (rituals, productId) => {
  if (productId == null || productId === "") return [];
  const id = String(productId);
  return (Array.isArray(rituals) ? rituals : []).filter((ritual) =>
    (Array.isArray(ritual?.steps) ? ritual.steps : []).some(
      (step) =>
        String(step?.productId) === id || String(step?.alternativeProductId) === id
    )
  );
};

/** "Step 01" — the numeral a ritual step is announced with. */
export const stepOrderLabel = (order) => {
  const n = Number(order);
  return Number.isFinite(n) && n > 0 ? `Step ${String(n).padStart(2, "0")}` : "";
};

const HowToUse = ({ product, rituals = [], products = [], className = "" }) => {
  const directions = (Array.isArray(product?.howToUse) ? product.howToUse : [])
    .map((line) => (typeof line === "string" ? line.trim() : ""))
    .filter(Boolean);

  const step = product?.ritualStep || null;
  const stepLabel = typeof step?.label === "string" ? step.label.trim() : "";
  const stepOrder = stepOrderLabel(step?.order);
  const stepFrequency =
    typeof step?.frequency === "string" ? step.frequency.trim() : "";
  const hasStep = Boolean(stepLabel || stepOrder || stepFrequency);

  const routines = ritualsWithProduct(rituals, product?.id);

  if (!directions.length && !hasStep && !routines.length) return null;

  return (
    <div className={[styles.block, className].filter(Boolean).join(" ")}>
      {directions.length > 0 && (
        <ol className={styles.steps}>
          {directions.map((line, index) => (
            <li key={line} className={styles.step}>
              <Chip variant="step" className={styles.numeral} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </Chip>
              <span className={styles.direction}>{line}</span>
            </li>
          ))}
        </ol>
      )}

      {hasStep && (
        <div className={styles.ritualStep}>
          <p className={`sf-eyebrow ${styles.eyebrow}`}>{RITUAL_STEP_TITLE}</p>
          <p className={styles.ritualStepLine}>
            {stepOrder ? (
              <span className={`sf-numeral ${styles.ritualStepOrder}`}>
                {stepOrder}
              </span>
            ) : null}
            {stepLabel ? (
              <span className={styles.ritualStepLabel}>{stepLabel}</span>
            ) : null}
          </p>
          {stepFrequency ? (
            <p className={styles.ritualStepFrequency}>{stepFrequency}</p>
          ) : null}
        </div>
      )}

      {routines.length > 0 && (
        <div className={styles.rituals}>
          <p className={`sf-eyebrow ${styles.eyebrow}`}>{RITUALS_TITLE}</p>
          <ul className={styles.ritualList}>
            {routines.map((ritual) => (
              <li key={ritual.id ?? ritual.slug}>
                <RitualCard ritual={ritual} products={products} compact />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HowToUse;
