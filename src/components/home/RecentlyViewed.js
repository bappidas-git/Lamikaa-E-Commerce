import React, { useCallback, useMemo, useState } from "react";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";
import { SectionHeading } from "../ui";
import Rail from "../ui/Rail";
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
// offers rail, the craft interlude, the trending rail — was merchandising from
// the previous catalogue with no such claim, and Prompt 22 deletes all of it.
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
//     reappears in the rail.
//
// WHAT NO LONGER LIVES HERE. The old page's `useRail` hook and its two hairline
// arrows were ported into this file with the feature; they are now `ui/Rail`,
// shared with the PDP's "You may also like" and the wishlist's recommendations
// so all three scroll, fade, snap and answer the keyboard the same way.
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

// ── The rail ────────────────────────────────────────────────────────────────
// The track, its arrows, its edge fade, its snap points and its keyboard
// handling are `ui/Rail` — the same scroller the PDP's "You may also like" and
// the wishlist's recommendations use. This file used to carry its own copy of
// all of it (a `useRail` hook with a ResizeObserver, two hairline arrows in the
// section heading), which is how the two rails drifted into behaving
// differently: only this one had arrows, only the other one had a fade, and
// neither contained a sideways overscroll, so a swipe could walk the phone
// back a page.

/**
 * @param {object} props
 * @param {object[]|null|undefined} props.products  the live catalogue, from
 *        useHomeData(). Until it arrives there is nothing to reconcile against
 *        and the section renders nothing — no skeleton: a placeholder for a
 *        band that will usually not exist is a promise the page cannot keep.
 */
const RecentlyViewed = ({ products }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Read once, on mount: localStorage is written by the PDP, and the visitor
  // cannot be on a product page and on the home page at the same time.
  const [storedIds] = useState(readStoredIds);

  const items = useMemo(() => reconcile(storedIds, products), [storedIds, products]);

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
        />

        <Rail
          label="recently viewed products"
          cardMin="248px"
          cardMax="272px"
          perView={4.6}
        >
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              isWishlisted={isInWishlist(product.id)}
            />
          ))}
        </Rail>
      </div>
    </section>
  );
};

export default RecentlyViewed;
