import React, { useState, useEffect } from "react";
import { Button, Modal } from "../ui";
import CloudinaryImage from "../ui/CloudinaryImage";
import styles from "./ReviewModal.module.css";

// =============================================================================
// ReviewModal — rate and review a product you actually bought
// =============================================================================
//
// ON THE SHARED PRIMITIVE (Prompt 30). The hand-rolled overlay, focus trap,
// Escape handler, body lock and close button are gone; `ui/Modal` owns them,
// and owns the route-change close and the scrollbar compensation this dialog
// never had. What is left here is the form.
//
// ELIGIBILITY IS THE CALLER'S. Order History decides who may write (a delivered
// order, a line that carries a productId); this component is purely the form,
// and it says out loud that a submission — new or edited — re-enters moderation.
//
// THE RATING IS NEVER THE GOLD ALONE. The stars are a radiogroup, each star a
// real radio, and the score is repeated in words beside them, so the value
// survives a colour-blind reading and a keyboard-only one.
// =============================================================================

const TITLE_MAX = 80;
const BODY_MAX = 1000;

// The score in words — the rating is never carried by the gold alone.
const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

const StarGlyph = ({ filled }) =>
  filled ? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <polygon points="12 2.6 14.9 9 21.6 9.6 16.5 14.1 18 20.8 12 17.3 6 20.8 7.5 14.1 2.4 9.6 9.1 9" />
    </svg>
  ) : (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="12 2.6 14.9 9 21.6 9.6 16.5 14.1 18 20.8 12 17.3 6 20.8 7.5 14.1 2.4 9.6 9.1 9" />
    </svg>
  );

// Interactive 1–5 star picker with hover preview.
const StarInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className={styles.ratingRow}>
      <div className={styles.starInput} role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((s) => {
          const active = shown >= s;
          return (
            <button
              key={s}
              type="button"
              className={`${styles.starBtn} ${active ? styles.starActive : ""}`}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(s)}
              aria-label={`${s} star${s > 1 ? "s" : ""}`}
              aria-checked={value === s}
              role="radio"
            >
              <StarGlyph filled={active} />
            </button>
          );
        })}
      </div>
      <span className={`${styles.ratingWord} ${shown ? "" : styles.ratingWordEmpty}`}>
        {shown ? RATING_WORDS[shown] : "Tap a star"}
      </span>
    </div>
  );
};

const ReviewModal = ({ open, onClose, product, existing, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setRating(existing?.rating || 0);
      setTitle(existing?.title || "");
      setBody(existing?.body || "");
      setError("");
    }
  }, [open, existing]);

  const handleSubmit = async () => {
    if (!rating) {
      setError("Choose a star rating to continue.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ rating, title: title.trim(), body: body.trim() });
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // The two controls live in Modal's own footer rail, which keeps them on the
  // sheet while the form above scrolls.
  const footer = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={submitting}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={submitting}
        aria-busy={submitting || undefined}
      >
        {submitting && <span className={styles.btnSpinner} aria-hidden="true" />}
        {submitting ? "Submitting…" : existing ? "Update review" : "Submit review"}
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      labelledBy="review-modal-title"
      footer={footer}
      className={styles.dialog}
    >
      <p className="sf-eyebrow">{existing ? "Edit your review" : "Write a review"}</p>
      <h2 className={styles.heading} id="review-modal-title">
        Share your thoughts
      </h2>

      {/* The product on a plate — the packaging is never cropped. */}
      <div className={styles.productRow}>
        <CloudinaryImage
          src={product?.image}
          alt={product?.name || "Product"}
          plate
          ar="1:1"
          pad
          aspectRatio="1 / 1"
          widths={[120, 180, 240]}
          sizes="60px"
          className={styles.productThumb}
        />
        <span className={styles.productName}>{product?.name}</span>
      </div>

      {existing && (
        <p className={styles.editNote}>
          Editing sends your review back for approval before it shows on the
          product page again.
        </p>
      )}

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <span className={styles.label} id="review-rating-label">
            Your rating *
          </span>
        </div>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor="review-title">
            Title
          </label>
          <span className={styles.counter}>
            {title.length}/{TITLE_MAX}
          </span>
        </div>
        <input
          id="review-title"
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum it up in a line"
          maxLength={TITLE_MAX}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label} htmlFor="review-body">
            Review
          </label>
          <span className={styles.counter}>
            {body.length}/{BODY_MAX}
          </span>
        </div>
        <textarea
          id="review-body"
          className={styles.textarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="How does it feel on your skin? How does it smell? What would you tell a friend?"
          rows={4}
          maxLength={BODY_MAX}
        />
      </div>

      <p className={styles.moderationNote}>
        Reviews are read before they are published — yours will appear on the
        product page after approval.
      </p>

      {error && (
        <p className={styles.error} role="alert">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="13" />
            <line x1="12" y1="16.5" x2="12" y2="16.5" />
          </svg>
          {error}
        </p>
      )}
    </Modal>
  );
};

export default ReviewModal;
