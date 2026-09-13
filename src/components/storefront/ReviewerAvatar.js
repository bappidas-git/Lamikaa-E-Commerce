import React, { useEffect, useState } from "react";
import styles from "./ReviewerAvatar.module.css";

// =============================================================================
// ReviewerAvatar — the face beside a review, or the letter that stands in
// =============================================================================
//
// ONE COMPONENT, TWO SURFACES. The product page's reviews list and the "What
// our customers say" band read the SAME review rows, so they have to answer
// "who wrote this?" the same way: the customer's own photograph when the row
// carries one, and a monogram on the tinted disc when it does not.
//
// NOBODY IS REQUIRED TO HAVE A FACE. The photo is optional at every point it
// can be set (the review dialog, Admin → Reviews), so the monogram is the
// normal state, not an error state — it is drawn as a deliberate mark in the
// display serif rather than as a grey silhouette apologising for a gap.
//
// A DEAD LINK FALLS BACK, it does not leave a hole: an `onError` flips this to
// the monogram, and the flag is cleared whenever the src changes so a later,
// working picture is still tried. (The shared `onImageError` is deliberately
// NOT used here — its placeholder is a landscape well, which is the wrong
// shape and the wrong idea inside a 56px circle.)
//
// ALWAYS DECORATIVE. Every caller prints the reviewer's name as text beside
// this, so the picture is hidden from assistive tech rather than announced as
// a second copy of the name.
//
// Props
//   name       string  the reviewer's name — only its first letter is used
//   src        string  the photograph, or nothing
//   size       "sm" | "md" | "lg"
//   className  string  applied to the circle
// =============================================================================

/** First letter of the name the review is published under. */
export const reviewerInitial = (name) =>
  (typeof name === "string" ? name : "").trim().charAt(0).toUpperCase() || "?";

const ReviewerAvatar = ({ name, src, size = "md", className = "" }) => {
  const [failed, setFailed] = useState(false);

  // A new row (or a freshly picked photo) deserves its own attempt.
  useEffect(() => setFailed(false), [src]);

  const photo = src && !failed;

  return (
    <span
      className={[styles.avatar, styles[size] || "", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    >
      {photo ? (
        <img
          className={styles.img}
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.monogram}>{reviewerInitial(name)}</span>
      )}
    </span>
  );
};

export default ReviewerAvatar;
