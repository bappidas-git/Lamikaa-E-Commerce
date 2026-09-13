import React, { useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { reveal } from "../../theme/motion";
import useInView from "../../hooks/useInView";
import useTestimonials from "../../hooks/useTestimonials";
import {
  selectTestimonials,
  testimonialBody,
  testimonialName,
  TESTIMONIAL_LIMIT,
} from "../../utils/testimonials";
import { formatDate, onImageError, productPath } from "../../utils/helpers";
import { Rail, SectionHeading } from "../ui";
import StarRating from "./StarRating";
import ReviewerAvatar from "./ReviewerAvatar";
import styles from "./Testimonials.module.css";

// =============================================================================
// Testimonials — "What our customers say", on every page
// =============================================================================
//
// WRITTEN ONCE, READ IN TWO PLACES. This band is not a second collection of
// quotes: it reads the same approved `reviews` rows the product page prints,
// without a productId (`reviews.getPublished`). A review typed once — by a
// customer in My Orders, or by the owner in Admin → Reviews — is therefore
// already a product review AND a candidate testimonial, and there is nowhere to
// paste the same paragraph a second time. `utils/testimonials` owns which of
// them the band carries: the owner's featured rows first, then the ones with a
// face on them, then the most recent.
//
// AND IT NEVER REPEATS ITSELF ON ONE PAGE. On a product page the reviews of
// THAT product are printed in full a few hundred pixels above; the band drops
// them (`excludeProductId`, resolved from the URL against the catalogue it has
// already read) and carries what other customers said about the rest of the
// range. If that leaves nothing, the band renders nothing — the page is
// complete without it.
//
// MOUNTED ONCE, IN THE SHELL. It lives between <main> and the footer in App.js,
// so every storefront route gets it and the read happens once per VISIT rather
// than once per page. Checkout is the one exclusion, and the shell owns that
// decision (see `HIDE_ON` there): nothing may interrupt a payment.
//
// IT COSTS NOTHING UNTIL IT IS NEARLY ON SCREEN. The band sits at the foot of
// the page, so it waits for `useInView` (600px of warning, the same figure the
// home page's deferred sections use) before it fetches anything at all.
//
// AND IT SHOWS NOTHING WHILE IT WAITS — no skeleton, no reserved band. A store
// with no approved reviews yet is the NORMAL state of a fresh install, and a
// shimmering placeholder that resolves to nothing, at the foot of every one of
// twenty-odd routes, would be a promise the page cannot keep. The 600px of
// warning is what buys the quotes time to arrive before they are looked at.
//
// NOTHING FABRICATED, EVER. Every card is a real approved review with a real
// name; the photograph is the customer's own if they gave one and a monogram if
// they did not (BRAND.md §3.9 rule 6 — no invented customers, no stock faces).
// A store with no approved reviews shows no band.
// =============================================================================

/** How far ahead of the viewport the band starts its read. */
const ROOT_MARGIN = "600px";

export const TESTIMONIALS_HEADING = "What our customers say";

/** `/product/black-rice-face-wash` → "black-rice-face-wash"; anything else → "". */
export const productSlugFromPath = (pathname = "") => {
  const match = /^\/product\/([^/?#]+)/.exec(pathname);
  return match ? decodeURIComponent(match[1]) : "";
};

/**
 * The id of the product whose page we are on, resolved against the catalogue.
 *
 * The URL carries a slug (and, for old links, a numeric id); reviews carry a
 * productId. This is the one place the two are matched up.
 */
export const currentProductId = (pathname, products) => {
  const slug = productSlugFromPath(pathname);
  if (!slug) return null;
  const rows = Array.isArray(products) ? products : [];
  const match = rows.find(
    (product) => String(product?.slug) === slug || String(product?.id) === slug
  );
  // A slug the catalogue has not got yet: exclude nothing rather than guess.
  return match ? match.id : null;
};

// ── One quote ────────────────────────────────────────────────────────────────
// A <figure> with a <blockquote> and a <figcaption>, which is what a quotation
// with an attribution IS — not a div stack with a big letter in it.

const TestimonialCard = ({ review, product }) => {
  const name = testimonialName(review);
  const body = testimonialBody(review);
  const verified = review.isVerifiedPurchase || review.verified;
  const photos = (Array.isArray(review.photos) ? review.photos : []).filter(Boolean).slice(0, 3);
  const sample = review.isSample === true;

  return (
    <figure className={`sf-card ${styles.card}`}>
      {/* The mark, not a character in the sentence: it is decorative, so it is
          drawn behind the words and hidden from assistive tech. */}
      <span className={styles.quoteMark} aria-hidden="true">
        &ldquo;
      </span>

      <div className={styles.cardHead}>
        <StarRating rating={Number(review.rating) || 0} size={15} />
        {sample && <span className={styles.sampleMark}>Sample</span>}
      </div>

      <blockquote className={styles.quote}>
        {review.title && <p className={styles.quoteTitle}>{review.title}</p>}
        <p className={styles.quoteBody}>{body}</p>
      </blockquote>

      {/* What they photographed, when they photographed anything. */}
      {photos.length > 0 && (
        <ul className={styles.shots}>
          {photos.map((src, index) => (
            <li key={index}>
              <img
                className={styles.shot}
                src={src}
                alt={`Customer upload ${index + 1} from ${name}`}
                loading="lazy"
                decoding="async"
                onError={onImageError}
              />
            </li>
          ))}
        </ul>
      )}

      <figcaption className={styles.person}>
        <ReviewerAvatar name={name} src={review.avatar} size="lg" />
        <span className={styles.who}>
          <span className={styles.name}>{name}</span>
          <span className={styles.meta}>
            {verified && (
              <span className={styles.verified}>
                <span className={styles.verifiedMark} aria-hidden="true">
                  &#10003;
                </span>
                Verified purchase
              </span>
            )}
            {review.createdAt && (
              <span className={styles.date}>{formatDate(review.createdAt, "short")}</span>
            )}
          </span>
        </span>
      </figcaption>

      {/* Which product it is about — and the way to it. */}
      {product && (
        <Link className={styles.product} to={productPath(product)}>
          <span className={styles.productLabel}>on</span>
          <span className={styles.productName}>{product.shortName || product.name}</span>
        </Link>
      )}
    </figure>
  );
};

// ── The band ─────────────────────────────────────────────────────────────────

const Testimonials = ({ limit = TESTIMONIAL_LIMIT }) => {
  const ref = useRef(null);
  const near = useInView(ref, { once: true, amount: 0, rootMargin: ROOT_MARGIN });
  const reduceMotion = useReducedMotion();
  const { pathname } = useLocation();
  const { reviews, products, loading } = useTestimonials(near);

  const byId = useMemo(() => {
    const map = new Map();
    (Array.isArray(products) ? products : []).forEach((product) => {
      if (product?.id !== undefined) map.set(String(product.id), product);
    });
    return map;
  }, [products]);

  const items = useMemo(
    () =>
      selectTestimonials(reviews, {
        limit,
        excludeProductId: currentProductId(pathname, products),
      }),
    [reviews, products, pathname, limit]
  );

  // Nothing to say yet — the band is still far from the viewport, the read is
  // in flight, or this store has no approved review that is not already printed
  // on the page above. All three render the same thing: the 1px element the
  // in-view observer watches, and no band.
  //
  // (1px, not 0: a zero-area target is a coin toss across IntersectionObserver
  // implementations, and a probe that never reports would be a band that never
  // loads.)
  if (!near || loading || items.length === 0) {
    return <div ref={ref} className={styles.probe} aria-hidden="true" />;
  }

  return (
    <section
      ref={ref}
      className={`sf-section ${styles.section}`}
      aria-labelledby="testimonials-heading"
    >
      <div className="sf-container">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Testimonials"
          title={TESTIMONIALS_HEADING}
          // "customers" — the one gradient keyword this section is allowed.
          gradientWord={2}
          lede="Real words from the people who use the range, published after moderation — the same reviews you'll find on the product pages."
          rule
        />

        <Rail
          label="customer testimonials"
          cardMin="268px"
          cardMax="380px"
          perView={3.2}
          className={styles.rail}
        >
          {items.map((review, index) => (
            <motion.div
              key={review.id ?? index}
              className={styles.cell}
              {...reveal(reduceMotion, { index, inView: true })}
            >
              <TestimonialCard
                review={review}
                product={byId.get(String(review.productId))}
              />
            </motion.div>
          ))}
        </Rail>
      </div>
    </section>
  );
};

export default Testimonials;
