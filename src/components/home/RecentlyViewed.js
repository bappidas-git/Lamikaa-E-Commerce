import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";
import { SectionHeading } from "../ui";
import ProductCard from "../storefront/ProductCard";
import styles from "./RecentlyViewed.module.css";

// =============================================================================
// RecentlyViewed — "Where you left off"
// =============================================================================
//
// The ONE secondary section the brief's home page keeps (§7.2 allows a section
// "only if your repository analysis justifies it"). The justification is that
// this is EXISTING STOREFRONT FUNCTIONALITY, not a new idea: the PDP has always
// written a `recentlyViewed` list to localStorage and the old home page has
// always read it back. Removing the rail would have deleted a shipped feature
// to make a redesign tidier, which the programme's first guardrail forbids.
// Everything else on the old page — the collection stories, the edit grid, the
// offers rail, the craft interlude, the trending rail — was Meghali-era
// merchandising with no such claim, and Prompt 22 deletes all of it.
//
// WHAT WAS PORTED, unchanged in behaviour, from the old Home.js:
//
//   • the localStorage key, which must keep matching the one ProductDetails.js
//     writes or the feature silently stops working end-to-end;
//   • the RECONCILIATION. The stored list is a snapshot of ids, so it goes on
//     naming products that have since been set to Draft or deleted in
//     Admin > Products — the rail offered them and every click landed on the
//     404. It is reconciled against the live catalogue (already
//     visibility-filtered): browsing order kept, unreachable products dropped,
//     the CURRENT record rendered instead of the stale snapshot. localStorage
//     itself is never rewritten, so a product that comes back from Draft
//     reappears in the rail;
//   • `useRail`, with its ResizeObserver — the hook that keeps a horizontal
//     track and its separately placed arrows in step.
//
// WHAT CHANGED. It is quiet now: an eyebrow, a title, no lede, no "View all"
// (there is no page of "things you looked at"), a compact track, and the
// surface band rather than the page ground so it reads as a footnote between
// the pillars above it and the questions below.
//
// FEWER THAN TWO ITEMS AND THERE IS NO SECTION. One card under a heading that
// says "where you left off" is not a rail, it is a repeat of the page the
// visitor just came from. (The old page's threshold was one; Prompt 22 raises
// it to two, which is the smallest number that makes the heading true.)
// =============================================================================

/** Must match the key ProductDetails.js writes. */
export const RECENTLY_VIEWED_KEY = "recentlyViewed";

/** Under this many live products the section does not render at all. */
export const MINIMUM = 2;

/** The stored ids, in browsing order. Never throws: storage can be denied. */
export const readStoredIds = () => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * The stored list, reconciled against the live catalogue.
 *
 * Exported for the unit test: dropping a product a shopper can no longer reach
 * is the one piece of logic in this file, and it is exactly what a rail off a
 * stale snapshot gets wrong.
 *
 * @param {Array<{id: string|number}>} stored  what localStorage remembers
 * @param {object[]} catalogue                 the live, visible products
 * @returns {object[]} the current records, in the stored order
 */
export const reconcile = (stored, catalogue) => {
  const live = new Map(
    (Array.isArray(catalogue) ? catalogue : []).map((product) => [String(product.id), product])
  );
  return (Array.isArray(stored) ? stored : [])
    .map((item) => live.get(String(item?.id)))
    .filter(Boolean);
};

// ── Rail plumbing ────────────────────────────────────────────────────────────
// Ported from the old Home.js. One hook drives the track so it and its
// (separately placed) controls stay in sync: the arrows live up in the section
// header rather than floating over the cards, which keeps them in reading order
// and off the photographs.

const useRail = (itemCount = 0) => {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // A few pixels of slack: the track is padded so a card's focus ring is not
    // clipped, and scroll-snap parks the first card a hair off zero.
    setEdges({
      atStart: el.scrollLeft <= 8,
      atEnd: max <= 8 || el.scrollLeft >= max - 8,
    });
  }, []);

  // Re-measure when the rail is filled (data arrives) and when it is resized.
  // Both listeners earn their keep: the observer catches the container changing
  // width on its own (a drawer opening), the window event catches the viewport
  // and fires even where observer callbacks are starved.
  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    const el = ref.current;
    const observer =
      el && typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    if (observer) observer.observe(el);
    return () => {
      window.removeEventListener("resize", sync);
      if (observer) observer.disconnect();
    };
  }, [sync, itemCount]);

  const nudge = useCallback((direction, smooth = true) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  return { ref, edges, sync, nudge };
};

/** Two hairline arrows, disabled at the ends of the travel. */
const RailControls = ({ rail, reduced }) => (
  <div className={styles.controls}>
    <button
      type="button"
      className={styles.arrow}
      onClick={() => rail.nudge(-1, !reduced)}
      disabled={rail.edges.atStart}
      aria-label="Scroll recently viewed products backwards"
    >
      <span aria-hidden="true">&#8249;</span>
    </button>
    <button
      type="button"
      className={styles.arrow}
      onClick={() => rail.nudge(1, !reduced)}
      disabled={rail.edges.atEnd}
      aria-label="Scroll recently viewed products forwards"
    >
      <span aria-hidden="true">&#8250;</span>
    </button>
  </div>
);

/**
 * @param {object} props
 * @param {object[]|null|undefined} props.products  the live catalogue, from
 *        useHomeData(). Until it arrives there is nothing to reconcile against
 *        and the section renders nothing — no skeleton: a placeholder for a
 *        band that will usually not exist is a promise the page cannot keep.
 */
const RecentlyViewed = ({ products }) => {
  const reduceMotion = useReducedMotion();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Read once, on mount: localStorage is written by the PDP, and the visitor
  // cannot be on a product page and on the home page at the same time.
  const [storedIds] = useState(readStoredIds);

  const items = useMemo(() => reconcile(storedIds, products), [storedIds, products]);

  const rail = useRail(items.length);

  // The shared ProductCard calls onAddToCart(buildCartItem(product)) internally,
  // so this receives a ready cart item — do NOT rebuild it.
  const handleAddToCart = useCallback((cartItem) => addToCart(cartItem, 1), [addToCart]);

  // Wishlist works for guests (persisted to localStorage), matching the product
  // detail page — no auth gate, no dead-end redirect.
  const handleToggleWishlist = useCallback(
    (product) => toggleWishlist(product),
    [toggleWishlist]
  );

  if (items.length < MINIMUM) return null;

  return (
    <section
      className={`sf-section--tight ${styles.section}`}
      aria-labelledby="recently-viewed"
    >
      <div className="sf-container">
        <SectionHeading
          id="recently-viewed"
          eyebrow="Recently viewed"
          title="Where you left off"
          className={styles.heading}
          actions={<RailControls rail={rail} reduced={reduceMotion} />}
        />

        {/* Focusable so a keyboard user can reach and arrow-scroll the overflow
            region itself, not only the cards inside it. */}
        <div
          className={styles.track}
          ref={rail.ref}
          onScroll={rail.sync}
          tabIndex={0}
          role="group"
          aria-label="Recently viewed products"
        >
          {items.map((product) => (
            <div className={styles.cell} key={product.id}>
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={isInWishlist(product.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
