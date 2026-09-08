import React from "react";
import { Skeleton } from "../ui";
import styles from "./RouteFallback.module.css";

// =============================================================================
// RouteFallback — what a lazily-loaded page shows while its chunk arrives
// =============================================================================
//
// Every storefront and admin page below Home is a separate chunk (Prompt 08), so
// on a slow connection there is a real gap between the click and the page. This
// is what fills it: a page-shaped skeleton, not a spinner, so the layout does
// not jump twice (once to the spinner, once to the content).
//
// It sits INSIDE the keyed <motion.div> in App.js, which means the fallback
// fades in and out with the same page transition every route uses — the visitor
// sees one motion, not a flash of empty <main>.
//
// A11Y. The region announces itself once, politely, as "Loading" (role=status
// is an implicit aria-live="polite"); the shapes below it are aria-hidden by
// Skeleton itself, so a screen reader hears the state, not the scaffolding.
// The shimmer is switched off under prefers-reduced-motion by `.sf-skeleton`.
//
// It is the LOADING member of the storefront's three shared states (Prompt 31),
// alongside `ui/EmptyState` and `ui/ErrorState`: skeletons for "not here yet",
// EmptyState for "we looked and there is nothing", ErrorState for "we could not
// look". No page shows a spinner as its main loading state — a spinner is only
// ever allowed inside a button that is working.
// =============================================================================

const RouteFallback = () => (
  <div className={`sf-section ${styles.fallback}`} role="status" aria-label="Loading">
    {/* Stands in for the page heading block, so the first real paragraph lands
        at roughly the height the skeleton left it at. */}
    <div className={`sf-container ${styles.inner}`}>
      <Skeleton variant="block" className={styles.spacer} />
      <Skeleton variant="block" aspectRatio="16 / 9" />
      <Skeleton variant="block" aspectRatio="16 / 5" />
      <Skeleton variant="block" aspectRatio="16 / 5" />
    </div>
  </div>
);

export default RouteFallback;
