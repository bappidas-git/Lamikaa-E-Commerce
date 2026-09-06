import React from "react";
import styles from "./Skeleton.module.css";

// =============================================================================
// Skeleton — the shape of the thing that has not arrived yet
// =============================================================================
//
// `.sf-skeleton` in the primitives is the shimmer (a sweep across the sunken
// panel, switched off under reduced motion). This component is the SHAPES:
//
//   text    `lines` bars, the last one short, like a paragraph
//   block   a filled rectangle at `aspectRatio` — a plate, a hero, a banner
//   circle  an avatar or an icon button
//   card    a plate with a name, a line and a price under it
//
// A skeleton must claim the same space its content will, or the page reflows
// the moment the data lands. That is why `block` takes an aspect ratio rather
// than a height: the ratio is what the image will have.
//
// It is `aria-hidden` and carries no live region. A loading placeholder that
// announces itself interrupts a screen reader with nothing to say; the region
// that owns the fetch reports the outcome instead.
// =============================================================================

const Skeleton = ({
  variant = "text",
  lines = 3,
  aspectRatio,
  width,
  height,
  className = "",
  style,
  ...rest
}) => {
  const shared = {
    "aria-hidden": "true",
    style: { width, height, aspectRatio, ...style },
    ...rest,
  };

  if (variant === "text") {
    return (
      <div className={[styles.lines, className].filter(Boolean).join(" ")} {...shared}>
        {Array.from({ length: Math.max(1, lines) }, (_, index) => (
          <span
            key={index}
            className={`sf-skeleton sf-skeleton--text ${styles.line}`}
            // A paragraph does not end flush; the last bar stops short so the
            // block reads as text rather than as a filled box.
            style={index === lines - 1 && lines > 1 ? { width: "62%" } : undefined}
          />
        ))}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={[styles.card, className].filter(Boolean).join(" ")} {...shared}>
        <span className={`sf-skeleton ${styles.plate}`} />
        <span className={`sf-skeleton sf-skeleton--text ${styles.line}`} style={{ width: "72%" }} />
        <span className={`sf-skeleton sf-skeleton--text ${styles.line}`} style={{ width: "46%" }} />
        <span className={`sf-skeleton sf-skeleton--text ${styles.line}`} style={{ width: "34%" }} />
      </div>
    );
  }

  return (
    <span
      className={[
        "sf-skeleton",
        variant === "block" ? "sf-skeleton--block" : "",
        variant === "circle" ? styles.circle : "",
        styles[variant] || "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...shared}
    />
  );
};

export default Skeleton;
