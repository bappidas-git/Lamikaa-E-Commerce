import { useEffect, useState } from "react";
import apiService from "../services/api";

// =============================================================================
// useTestimonials — the one read behind the "What our customers say" band
// =============================================================================
//
// The band is mounted ONCE, in the storefront shell, so it survives every route
// change: this hook therefore reads once per visit rather than once per page,
// and a visitor who walks through six pages costs the store one request for the
// quotes, not six.
//
// TWO COLLECTIONS, READ DIFFERENTLY, because they change at different rates:
//
//   reviews   read on mount, again on window focus, and immediately when the
//             admin fires `reviews:updated` in this tab. This is the one that
//             moves — a moderator approves a review and the band should carry
//             it without a deploy or a hard reload.
//   products  read ONCE and kept for the session. The band needs three fields
//             from it (id, name, slug) to say WHICH product a quote is about
//             and to link to it; re-reading the whole catalogue on every focus
//             event would be the expensive half of a cheap refresh. If a quote
//             ever names a product the map has not got (a catalogue row added
//             since), the map is re-read — once per unknown id, so a review
//             pointing at a deleted product can never loop.
//
// NOTHING HERE IS FETCHED UNTIL IT IS WANTED. `enabled` is the band's own
// "am I near the viewport yet" answer: on a first paint the hook does nothing at
// all, which is what keeps a social-proof band at the foot of the page from
// competing with the page's own images for bandwidth.
//
// FAILURE IS SILENCE. `reviews.getPublished` resolves to `[]` rather than
// rejecting, and a failed catalogue read resolves to `[]` too — the band is
// furniture on twenty-odd routes, and an error panel repeated under every one
// of them would be louder than the loss.
// =============================================================================

/** Fired by Admin → Reviews after any change that can alter what is published. */
export const REVIEWS_UPDATED_EVENT = "reviews:updated";

export const notifyReviewsUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(REVIEWS_UPDATED_EVENT));
  }
};

/** The catalogue, read once for the session. Cleared when a read fails. */
let productsPromise = null;

/** Product ids a quote named that the map did not have; each is retried once. */
const retriedProductIds = new Set();

const loadProducts = () => {
  if (!productsPromise) {
    productsPromise = Promise.resolve()
      .then(() => apiService.products.getAll())
      .then((rows) => (Array.isArray(rows) ? rows : []))
      .catch((error) => {
        console.error("Testimonials: catalogue read failed:", error);
        // Drop the memo so the next focus can try again; the band simply shows
        // its quotes without a product line until then.
        productsPromise = null;
        return [];
      });
  }
  return productsPromise;
};

/** The published reviews. In-flight de-duplication only — never cached. */
let reviewsPromise = null;

const loadReviews = () => {
  if (reviewsPromise) return reviewsPromise;
  reviewsPromise = Promise.resolve()
    .then(() => apiService.reviews.getPublished())
    .then((rows) => (Array.isArray(rows) ? rows : []))
    .catch(() => [])
    .finally(() => {
      reviewsPromise = null;
    });
  return reviewsPromise;
};

const read = async () => {
  const reviews = await loadReviews();
  let products = await loadProducts();

  const known = new Set(products.map((product) => String(product?.id)));
  const unknown = reviews
    .map((review) => String(review?.productId))
    .filter((id) => id && id !== "undefined" && !known.has(id) && !retriedProductIds.has(id));

  if (unknown.length) {
    unknown.forEach((id) => retriedProductIds.add(id));
    productsPromise = null;
    products = await loadProducts();
  }

  return { reviews, products };
};

/**
 * @param {boolean} [enabled]  start reading (the band passes its own in-view flag)
 * @returns {{reviews: object[], products: object[], loading: boolean}}
 */
export default function useTestimonials(enabled = true) {
  const [state, setState] = useState({ reviews: [], products: [], loading: true });

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;

    const run = () => {
      read().then((value) => {
        if (alive) setState({ ...value, loading: false });
      });
    };

    run();

    window.addEventListener("focus", run);
    window.addEventListener(REVIEWS_UPDATED_EVENT, run);
    return () => {
      alive = false;
      window.removeEventListener("focus", run);
      window.removeEventListener(REVIEWS_UPDATED_EVENT, run);
    };
  }, [enabled]);

  return state;
}
