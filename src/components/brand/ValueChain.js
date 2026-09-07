import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import brand from "../../config/brand";
import { RISE, reveal } from "../../theme/motion";
import { Chip } from "../ui";
import styles from "./ValueChain.module.css";

// =============================================================================
// ValueChain — Farmer → FPC → Value Addition → LAMIKAA Naturals → Consumer →
//              Profit → Farmer Members
// =============================================================================
//
// The one picture the brand cannot do without: BRAND.md §3.3 states the journey
// as a sentence, and this is that sentence drawn. It is the reusable half of
// Prompt 17 — the home page's About section mounts it, and the About and Why
// LAMIKAA pages (Prompts 20, 28) mount the same component rather than redrawing
// the chain, so the seven steps can never disagree across three surfaces.
//
// THE STEPS ARE `brand.valueChain`, IN ORDER, AND ARE NOT TYPED HERE. The
// canonical order is a brand fact (BRAND.md §3.3); `steps` exists so a caller
// can pass a *shorter* run of the same list, never so it can invent one.
//
// IT IS A REAL <ol>. The order is the whole message, so it lives in the markup
// and not only in the picture: a screen reader hears seven list items in the
// order value travels, with its position ("01", "02", …) read as part of each
// item. `role="list"` is the Safari/VoiceOver repair for `list-style: none`,
// which otherwise drops the list semantics the numerals are standing in for.
//
// NOTHING IN IT IS FOCUSABLE. No step links anywhere — a chain of seven links
// to the same About page would add seven tab stops that all say the same thing.
// The connectors, arrows included, are `aria-hidden`: they are the drawing of a
// relationship the ordered list already states.
//
// ORIENTATION IS CSS, NOT MEASUREMENT (`auto`, the default):
//   ≥ 1025px   one row, seven steps, connectors flexing 24–48px
//   769–1024   two rows of 4 + 3 (a four-track grid; seven items fill it 4 + 3)
//   ≤ 768px    vertical — a 40px left rail with the connector running down it
// `horizontal` and `vertical` pin one of those for a caller that knows its slot
// better than the viewport does; forced `horizontal` WRAPS rather than
// overflowing, because a chain nobody can read to the end is worse than a
// chain on two lines.
//
//   compact   the same chain at sidebar scale — 28px numerals, 13px labels,
//             tighter rails — for a slot beside something else rather than a
//             band of its own.
// =============================================================================

// WHERE A STEP RESTS BEFORE IT ARRIVES.
// `reveal()` says how a step arrives; this says where it waits. App.js wraps
// every route in <AnimatePresence mode="wait" initial={false}>, and
// `initial={false}` tells framer-motion to ignore the `initial` prop of
// everything already on the page at the route's first paint — it mounts those
// elements at their `animate` state instead. A chain that ships with the route
// therefore has no `animate` to mount at, lands on the whileInView target and
// never plays its sequence (a chain mounted later, after a fetch, does play it,
// which is why the sections around it look fine). Naming the resting state as
// `animate` as well costs one prop and makes the reveal behave the same on a
// cold load of / and on a click through to it. `whileInView` outranks `animate`
// the moment the step is on screen, so nothing else changes.
const RESTING = { opacity: 0, y: RISE.reveal };

/** "01" … "07". Two digits, because a column of numerals should line up. */
export const stepNumeral = (index) => String(index + 1).padStart(2, "0");

/**
 * Is this step the brand itself? That one label is set in gold — the chain's
 * single emphasis, and the point in the journey where the storefront sits.
 * Matched against the config rather than by index so a shorter `steps` run, or
 * a future rename in `brand`, keeps the highlight on the right word.
 */
export const isBrandStep = (label) => {
  const value = String(label || "").trim().toLowerCase();
  return (
    value === brand.runningName.toLowerCase() ||
    value === brand.name.toLowerCase() ||
    value === brand.shortName.toLowerCase()
  );
};

// The arrow between two steps. One right-pointing glyph, rotated a quarter turn
// by CSS in the vertical rail — a second path would be a second thing to keep
// in step with the first.
const Arrow = () => (
  <svg
    className={styles.arrow}
    viewBox="0 0 8 8"
    width="8"
    height="8"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M2 0.6 5.4 4 2 7.4 1.1 6.5 3.6 4 1.1 1.5z" />
  </svg>
);

const ValueChain = ({
  steps = brand.valueChain,
  orientation = "auto",
  compact = false,
  label = "How value reaches farmers",
  className = "",
  ...rest
}) => {
  const reduceMotion = useReducedMotion();
  const items = (Array.isArray(steps) ? steps : []).filter(Boolean);
  if (items.length === 0) return null;

  const classes = [
    styles.chain,
    styles[orientation] || styles.auto,
    compact ? styles.compact : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <ol className={classes} role="list" aria-label={label} {...rest}>
      {items.map((step, index) => (
        <motion.li
          key={`${step}-${index}`}
          className={styles.step}
          // In sequence, so the eye travels the chain the way the value does.
          // Under reduced motion `reveal` returns {} and RESTING is not applied
          // either — no props, no timeline, seven finished steps on frame one.
          {...(reduceMotion ? {} : { animate: RESTING })}
          {...reveal(reduceMotion, { index, inView: true, amount: 0.4 })}
        >
          <Chip variant="step" className={styles.marker}>
            {stepNumeral(index)}
          </Chip>
          <span
            className={[styles.label, isBrandStep(step) ? styles.brandLabel : ""]
              .filter(Boolean)
              .join(" ")}
          >
            {step}
          </span>
          {index < items.length - 1 && (
            <span className={styles.connector} aria-hidden="true">
              <span className={styles.line} />
              <Arrow />
            </span>
          )}
        </motion.li>
      ))}
    </ol>
  );
};

export default ValueChain;
