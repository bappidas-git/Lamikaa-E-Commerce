import React, { useState, useEffect, useRef } from "react";
import { Button, Modal } from "../ui";
import CloudinaryImage from "../ui/CloudinaryImage";
import {
  readImageFile,
  IMAGE_ACCEPT,
  REVIEW_PHOTO_LIMIT,
  REVIEW_PHOTO_MAX_EDGE,
  AVATAR_MAX_EDGE,
} from "../../utils/imageFile";
import styles from "./ReviewModal.module.css";

// =============================================================================
// ReviewModal — rate, review and SHOW a product you actually bought
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
//
// TWO KINDS OF PICTURE, and they are not interchangeable:
//
//   YOUR PHOTO   one portrait, the face that sits beside the name — on the
//                product page's reviews and in the "What our customers say"
//                band, which reads the same review rows. Optional, always: a
//                monogram stands in, and nobody is asked for a face to be heard.
//   YOUR PHOTOS  up to three pictures OF THE PRODUCT, the strip under the
//                review. This is the evidence half — the texture, the shade,
//                the pack on a real shelf.
//
// The reviews list has rendered `photos[]` since it was built and the band puts
// `avatar` beside every quote; until now there was simply no way for a customer
// to fill either in. Both are read through `utils/imageFile`, which resizes the
// picture in a canvas before it is ever attached, so a 5 MB phone photograph
// travels as a ~200 KB data URL.
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

/**
 * A file input that never shows itself, plus the button that opens it.
 *
 * The input is `display: none` rather than visually hidden on purpose: a
 * sr-only input is still in the tab order, and a keyboard visitor would land on
 * a control they cannot see and cannot tell the state of. The BUTTON is the
 * control — it is focusable, it is labelled, and it is 44px.
 */
const FilePickButton = ({ id, label, onPick, disabled }) => {
  const inputRef = useRef(null);
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files || []);
          // The same file picked twice in a row must still fire `change`.
          event.target.value = "";
          if (files.length) onPick(files);
        }}
      />
    </>
  );
};

/** First letter of the name the review is published under. */
const monogram = (name) => (name || "?").trim().charAt(0).toUpperCase() || "?";

const ReviewModal = ({
  open,
  onClose,
  product,
  existing,
  onSubmit,
  authorName = "",
  defaultAvatar = null,
}) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [reading, setReading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [photoNote, setPhotoNote] = useState("");

  useEffect(() => {
    if (open) {
      setRating(existing?.rating || 0);
      setTitle(existing?.title || "");
      setBody(existing?.body || "");
      // An edit shows what is already on the row; a first review starts from
      // the picture on the account, when there is one.
      setAvatar(existing?.avatar || defaultAvatar || null);
      setPhotos(Array.isArray(existing?.photos) ? existing.photos.filter(Boolean) : []);
      setError("");
      setPhotoNote("");
    }
  }, [open, existing, defaultAvatar]);

  // ── The two pickers ───────────────────────────────────────────────────────
  // Both read through `utils/imageFile`, which resizes in a canvas and answers
  // `{ dataUrl }` or `{ error }` — a refused file always says why, in words.

  const pickAvatar = async (files) => {
    setPhotoNote("");
    setReading(true);
    const result = await readImageFile(files[0], { maxEdge: AVATAR_MAX_EDGE, quality: 0.82 });
    setReading(false);
    if (result.error) setPhotoNote(result.error);
    else setAvatar(result.dataUrl);
  };

  const pickPhotos = async (files) => {
    setPhotoNote("");
    const room = REVIEW_PHOTO_LIMIT - photos.length;
    if (room <= 0) {
      setPhotoNote(`You can add up to ${REVIEW_PHOTO_LIMIT} photos.`);
      return;
    }
    setReading(true);
    const picked = files.slice(0, room);
    const results = [];
    for (const file of picked) {
      // Sequential on purpose: three 4000px decodes in parallel is how a
      // mid-range phone drops the whole dialog.
      // eslint-disable-next-line no-await-in-loop
      results.push(await readImageFile(file, { maxEdge: REVIEW_PHOTO_MAX_EDGE }));
    }
    setReading(false);
    const added = results.filter((r) => r.dataUrl).map((r) => r.dataUrl);
    const refused = results.find((r) => r.error);
    if (added.length) setPhotos((current) => [...current, ...added].slice(0, REVIEW_PHOTO_LIMIT));
    if (refused) setPhotoNote(refused.error);
    else if (files.length > room) {
      setPhotoNote(`Only the first ${room} ${room === 1 ? "photo was" : "photos were"} added — the limit is ${REVIEW_PHOTO_LIMIT}.`);
    }
  };

  const removePhoto = (index) =>
    setPhotos((current) => current.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    if (!rating) {
      setError("Choose a star rating to continue.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        rating,
        title: title.trim(),
        body: body.trim(),
        avatar: avatar || null,
        photos,
      });
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
        disabled={submitting || reading}
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

      {/* ── Your photo — the face beside the name ───────────────────────────
          Optional, and said so twice: in the label and in the note. */}
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Your photo</span>
          <span className={styles.counter}>Optional</span>
        </div>
        <div className={styles.avatarRow}>
          <span className={styles.avatarPreview}>
            {avatar ? (
              <img className={styles.avatarImg} src={avatar} alt="" />
            ) : (
              <span className={styles.avatarMonogram} aria-hidden="true">
                {monogram(authorName)}
              </span>
            )}
          </span>
          <div className={styles.avatarActions}>
            <FilePickButton
              id="review-avatar-input"
              label={avatar ? "Change photo" : "Add your photo"}
              onPick={pickAvatar}
              disabled={reading || submitting}
            />
            {avatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={reading || submitting}
                onClick={() => setAvatar(null)}
              >
                Remove
              </Button>
            )}
            <p className={styles.pickerNote}>
              Shown beside your name here and in “What our customers say”.
            </p>
          </div>
        </div>
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

      {/* ── Photos of the product — the evidence half ───────────────────────── */}
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <span className={styles.label}>Add photos</span>
          <span className={styles.counter}>
            {photos.length}/{REVIEW_PHOTO_LIMIT}
          </span>
        </div>

        {photos.length > 0 && (
          <ul className={styles.thumbs}>
            {photos.map((src, index) => (
              <li key={`${index}-${src.slice(-24)}`} className={styles.thumb}>
                <img src={src} alt={`Your upload ${index + 1}`} className={styles.thumbImg} />
                <button
                  type="button"
                  className={styles.thumbRemove}
                  onClick={() => removePhoto(index)}
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.pickerRow}>
          <FilePickButton
            id="review-photos-input"
            label={photos.length ? "Add another photo" : "Add photos"}
            onPick={pickPhotos}
            disabled={reading || submitting || photos.length >= REVIEW_PHOTO_LIMIT}
          />
          <p className={styles.pickerNote}>
            Up to {REVIEW_PHOTO_LIMIT} pictures of the product, straight from your camera roll.
          </p>
        </div>

        {/* One live region for both pickers: a resize is quick but not free, and
            a refused file has to be heard, not just seen. */}
        <p className={styles.pickerStatus} role="status">
          {reading ? "Adding your photo…" : photoNote}
        </p>
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
