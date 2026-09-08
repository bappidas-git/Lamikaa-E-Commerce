import React from "react";
import StarRating from "./StarRating";
import { formatDate, onImageError } from "../../utils/helpers";
import styles from "./ReviewsSection.module.css";

// =============================================================================
// ReviewsSection — what buyers actually wrote
// =============================================================================
// Renders ONLY the real, approved reviews it is handed (the API already filters
// to status="approved"). It shows verified-purchase marks, titles, bodies and
// customer photos (UGC) when present — and HONEST empty / error / loading states
// otherwise. The summary average + count are passed in by the parent (a blend of
// the store's recorded aggregate and approved reviews), never invented here.
//
// EDITORIAL SET
//   The section is a letters page, not a stack of cards. One glass summary
//   plate — the average in the display serif beside five gradient bars — then
//   each review as a hairline card: who wrote it in a narrow left column, what
//   they wrote in the measure beside it. No tinted panels and no derived
//   statistics ("92% recommend" and friends): every number on this surface is
//   either a real count or a real average.
//
// THE EMPTY STATE IS THE COMMON ONE, and it is the most important copy in this
// file. Every LAMIKAA product is at zero reviews and the two seeded rows are
// flagged `isSample` and hidden by `brand.flags.showSampleReviews` (BRAND.md
// §3.9 rule 6), so on a fresh install this is what every product page shows.
// It therefore has to do more than apologise: it says where a review comes
// from — a real customer, from My Orders, after their order was delivered —
// which is both an honest explanation of the blank space and a description of
// the only path that can fill it.
//
// A SAMPLE ROW SAYS SO. With the flag on, the seeded rows arrive here mixed in
// with real ones; each carries a "Sample" mark so nobody reviewing the site
// mistakes the placeholder for a customer. The mark is the whole reason the
// flag is safe to flip.
//
// Props (unchanged contract):
//   reviews            array   approved reviews (real)
//   displayAvg         number  aggregate rating to show (real)
//   totalRatingsCount  number  number of ratings behind the average (real)
//   loading, error     boolean
//   onRetry            fn
// =============================================================================

/** The empty state — see the note above; this is the page's normal state. */
export const NO_REVIEWS_LINE = "No reviews yet";
export const NO_REVIEWS_NOTE =
  "Reviews are written by customers from My Orders after delivery.";

// One row of the distribution. The bar is decorative — the row carries its own
// sentence for assistive tech, so nothing here is conveyed by the fill alone.
const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel} aria-hidden="true">
        {star}
        <span className={styles.barStar}>&#9733;</span>
      </span>
      <span className={styles.barTrack} aria-hidden="true">
        <span className={styles.barFill} style={{ width: `${pct}%` }} />
      </span>
      <span className={styles.barCount} aria-hidden="true">
        {count}
      </span>
      <span className={styles.srOnly}>
        {star} star{star !== 1 ? "s" : ""}: {count} of {total} written review
        {total !== 1 ? "s" : ""}
      </span>
    </div>
  );
};

const ReviewsSection = ({
  reviews = [],
  displayAvg = 0,
  totalRatingsCount = 0,
  loading = false,
  error = false,
  onRetry,
}) => {
  const list = Array.isArray(reviews) ? reviews : [];
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: list.filter((r) => Math.round(Number(r.rating)) === star).length,
  }));

  return (
    <div className={styles.section}>
      {/* ── The summary plate: the average, then the distribution ────────── */}
      <div className={`sf-glass ${styles.summary}`}>
        <div className={styles.avgBlock}>
          {totalRatingsCount > 0 ? (
            <>
              <span className={styles.avgNumber}>{displayAvg.toFixed(1)}</span>
              <span className={styles.avgOutOf}>out of 5</span>
              <StarRating rating={displayAvg} size={18} />
              <span className={styles.avgTotal}>
                {totalRatingsCount.toLocaleString()} rating
                {totalRatingsCount !== 1 ? "s" : ""}
              </span>
            </>
          ) : (
            <span className={styles.avgEmpty}>No ratings yet</span>
          )}
        </div>

        <div className={styles.bars}>
          {list.length > 0 ? (
            <>
              {breakdown.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={list.length} />
              ))}
              <span className={styles.barsCaption}>
                Across {list.length} written review{list.length !== 1 ? "s" : ""}
              </span>
            </>
          ) : error ? null : (
            <span className={styles.barsEmpty}>No written reviews yet.</span>
          )}
        </div>
      </div>

      {/* ── The letters themselves, or an honest state ───────────────────── */}
      {loading ? (
        <p className={styles.state} role="status">
          Loading reviews&hellip;
        </p>
      ) : error ? (
        <div className={styles.state}>
          <p className={styles.stateLine}>
            Sorry, we couldn&rsquo;t load reviews right now.
          </p>
          {onRetry && (
            <button
              type="button"
              className={`sf-btn sf-btn--sm ${styles.retry}`}
              onClick={onRetry}
            >
              Retry
            </button>
          )}
        </div>
      ) : list.length === 0 ? (
        <div className={styles.state}>
          <p className={styles.stateLine}>{NO_REVIEWS_LINE}</p>
          <p className={styles.stateNote}>{NO_REVIEWS_NOTE}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {list.map((review, idx) => {
            const name = review.userName || review.name || "Anonymous";
            const verified = review.isVerifiedPurchase || review.verified;
            const body = review.body || review.comment || review.text;
            const photos = Array.isArray(review.photos) ? review.photos : [];
            // Only reachable with brand.flags.showSampleReviews on — the API
            // filters these rows out otherwise.
            const sample = review.isSample === true;
            return (
              <article
                key={review.id || idx}
                className={[styles.review, sample ? styles.sample : ""]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Who wrote it — the narrow left column of the letters page */}
                <header className={styles.reviewAside}>
                  <span className={styles.avatar} aria-hidden="true">
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.who}>
                    <span className={styles.userName}>{name}</span>
                    {review.createdAt && (
                      <span className={styles.date}>
                        {formatDate(review.createdAt, "short")}
                      </span>
                    )}
                    {verified && (
                      <span className={styles.verified}>
                        <span className={styles.verifiedMark} aria-hidden="true">
                          &#10003;
                        </span>
                        Verified purchase
                      </span>
                    )}
                    {sample && <span className={styles.sampleMark}>Sample</span>}
                  </span>
                </header>

                {/* What they wrote */}
                <div className={styles.reviewMain}>
                  <StarRating rating={Number(review.rating) || 0} size={14} />
                  {review.title && (
                    <h4 className={styles.reviewTitle}>{review.title}</h4>
                  )}
                  {body && <p className={styles.reviewBody}>{body}</p>}

                  {/* Customer photos (UGC) — only when the review really has them */}
                  {photos.length > 0 && (
                    <ul className={styles.photos}>
                      {photos.map((src, i) => (
                        <li key={i}>
                          <img
                            src={src}
                            alt={`Customer upload ${i + 1} from ${name}`}
                            loading="lazy"
                            onError={onImageError}
                            className={styles.photo}
                          />
                        </li>
                      ))}
                    </ul>
                  )}

                  {Number(review.helpfulCount) > 0 && (
                    <p className={styles.helpful}>
                      {review.helpfulCount} found this helpful
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
