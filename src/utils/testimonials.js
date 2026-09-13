// =============================================================================
// testimonials — which approved reviews become "What our customers say"
// =============================================================================
//
// THE ONE RULE THIS FILE EXISTS FOR: a testimonial is not a second kind of
// content. There is no `testimonials` collection, no second admin screen, no
// second place for the owner to paste the same paragraph. The band on every
// page and the reviews chapter on a product page read the SAME `reviews` rows —
// the band simply reads them without a productId — so a review written once (by
// a customer from My Orders, or by the owner in Admin → Reviews) is already
// both. What is left to decide is WHICH of them the band carries, and that
// decision is here, as pure functions, so it can be tested and so the band
// itself stays a rendering component.
//
// NOTHING IS INVENTED. Every row that reaches these functions is a real,
// approved review; sample rows are dropped by the API before this sees them
// (BRAND.md §3.9 rule 6). A store with no approved reviews yields an empty
// array, and the band takes itself off the page — an empty band is honest,
// fabricated praise is not.
//
// THE ORDER, in one sentence: what the owner curated, then the ones with a face
// on them, then the most recent. Each step is a tie-break for the one above it,
// so the sequence is deterministic — the same rows in the same order on every
// page and every reload, rather than a shuffle that makes the band feel like a
// slot machine.
// =============================================================================

/** How many testimonials the band will carry at most. */
export const TESTIMONIAL_LIMIT = 9;

/**
 * The rating floor for an UNCURATED testimonial.
 *
 * The band is the one surface that chooses which reviews to repeat, and
 * repeating a two-star review as a testimonial would be odd — but the product
 * page still shows every approved review it has, unfiltered, which is what
 * keeps this a curation rule rather than a way to hide criticism. An owner who
 * ticks "Feature" on a three-star review overrides this on purpose.
 */
export const TESTIMONIAL_MIN_RATING = 4;

/** A review's words, whichever field the backend kept them in. */
export const testimonialBody = (review) =>
  (review?.body || review?.comment || review?.text || "").trim();

/** The name it is published under. */
export const testimonialName = (review) =>
  (review?.userName || review?.name || "").trim() || "Anonymous";

/** The writer's own photograph, if the row carries one. */
export const testimonialPhoto = (review) =>
  typeof review?.avatar === "string" && review.avatar.trim() ? review.avatar.trim() : "";

/** The owner's curation mark, set in Admin → Reviews. */
export const isFeaturedTestimonial = (review) => review?.featured === true;

/**
 * Can this review stand on its own as a testimonial?
 *
 * It needs WORDS. A five-star rating with no sentence is a perfectly good
 * rating — it counts towards the average on the product page — but a quote card
 * with nothing in the quote is a hole in the band, so a bodyless review is not
 * a candidate here.
 */
export const isTestimonialCandidate = (review) => {
  if (!review) return false;
  // Defensive: the storefront read already asks for approved rows only, but a
  // caller handing this an unfiltered list must not publish a pending one.
  if (review.status && review.status !== "approved") return false;
  if (!testimonialBody(review)) return false;
  if (isFeaturedTestimonial(review)) return true;
  return (Number(review.rating) || 0) >= TESTIMONIAL_MIN_RATING;
};

/** Newest first; a row with no date sorts last rather than first. */
const writtenAt = (review) => {
  const time = Date.parse(review?.createdAt || review?.updatedAt || "");
  return Number.isFinite(time) ? time : 0;
};

/**
 * Pick the testimonials for one surface.
 *
 * @param {object[]} reviews                approved reviews, any product
 * @param {object}   [options]
 * @param {number}   [options.limit]        how many to keep (default 9)
 * @param {number|string} [options.excludeProductId]
 *        the product whose own page is being read. Its reviews are printed in
 *        full a few hundred pixels above, so repeating them in the band under
 *        the same page would be the one place this really WOULD say the same
 *        thing twice.
 * @returns {object[]}
 */
export const selectTestimonials = (reviews, { limit = TESTIMONIAL_LIMIT, excludeProductId } = {}) => {
  const rows = Array.isArray(reviews) ? reviews : [];
  const excluded =
    excludeProductId === undefined || excludeProductId === null
      ? null
      : String(excludeProductId);

  const seen = new Set();
  const candidates = rows.filter((review) => {
    if (!isTestimonialCandidate(review)) return false;
    if (excluded !== null && String(review.productId) === excluded) return false;
    // One row per id — a backend that pages could hand the same review twice.
    const key = review.id ?? `${review.productId}-${testimonialName(review)}-${testimonialBody(review)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return candidates
    .sort((a, b) => {
      const featured = Number(isFeaturedTestimonial(b)) - Number(isFeaturedTestimonial(a));
      if (featured) return featured;
      const withFace = Number(!!testimonialPhoto(b)) - Number(!!testimonialPhoto(a));
      if (withFace) return withFace;
      return writtenAt(b) - writtenAt(a);
    })
    .slice(0, Math.max(0, limit));
};

const testimonials = {
  TESTIMONIAL_LIMIT,
  TESTIMONIAL_MIN_RATING,
  testimonialBody,
  testimonialName,
  testimonialPhoto,
  isFeaturedTestimonial,
  isTestimonialCandidate,
  selectTestimonials,
};

export default testimonials;
