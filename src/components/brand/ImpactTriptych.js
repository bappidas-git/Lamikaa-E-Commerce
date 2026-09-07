import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import { RISE, reveal } from "../../theme/motion";
import { onImageError } from "../../utils/helpers";
import styles from "./ImpactTriptych.module.css";

// =============================================================================
// ImpactTriptych — financial, social, environmental, in three columns
// =============================================================================
//
// `siteContent.impact.items` (seeded in Prompt 06 from BRAND.md §3.4–3.6) as a
// triptych. The home section (Prompt 20) shows the three columns as words alone;
// the Why LAMIKAA page (Prompt 28) turns the photographs on with `showImages`
// and mounts the same component, so the two surfaces cannot say different
// things about what the brand claims its impact is.
//
// NOT ONE WORD OF THE COPY IS IN THIS FILE, and here that is a legal rule
// rather than a preference. BRAND.md §3.9 makes the qualifier part of the
// sentence — profits, "when declared for distribution in accordance with
// applicable laws and company decisions, can reach the member farmers through
// dividends" — and a claim hard-coded in a component is a claim nobody can
// edit, review or withdraw. Every point renders VERBATIM, exactly as the owner
// wrote it: no truncation, no summarising, no "and 3 more". A qualifier that
// survives the CMS survives the render.
//
// There is no fallback copy either. A missing, unpublished or unreachable block
// renders NOTHING — an impact section that invents an impact is worse than no
// impact section.
//
// THE EYEBROW IS DERIVED FROM THE KEY, NOT TYPED. The seed writes the category
// into the title as well ("Financial — From Raw Produce to Shared Value")
// because the CMS field is a single string; showing both would print
// "Financial" twice in a 20px stack. So the eyebrow comes from `key` and the
// title is that same string with the prefix taken off — and only when a DASH
// separates the two, so a title that merely starts with the word keeps it.
//
// THE GLYPH IS A BULLET, deliberately. These are aims, not achievements: a tick
// in front of "Farmers can benefit from the profitability of their own
// enterprise" reads as a claim that it has already happened, which is precisely
// what BRAND.md §3.9 forbids. A dot is a dot.
//
// The photographs are plain <img>, not `CloudinaryImage`: the placeholders are
// Picsum URLs and Cloudinary transformations do not apply to them. Each carries
// `.sf-placeholder-media` and `alt=""` — they are decorative, and describing a
// scene the brand has not photographed would be inventing one.
// =============================================================================

/**
 * "financial" → "Financial", "farmer-ownership" → "Farmer Ownership".
 *
 * Exported for the unit test: the eyebrow is the one string on this surface
 * that the owner does not write, so what it does with an unexpected key is a
 * decision worth pinning down.
 */
export const impactEyebrow = (item) => {
  const key = typeof item?.key === "string" ? item.key.trim() : "";
  if (!key) return "";
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * The title with its category prefix removed — "Financial — From Raw Produce to
 * Shared Value" becomes "From Raw Produce to Shared Value", because the eyebrow
 * above it already says "Financial".
 *
 * Matched by hand rather than by a pattern built from the data: a key is
 * owner-editable, and a key compiled into a RegExp is a key that can change
 * what the expression means. The prefix only comes off when a dash follows it,
 * so "Financially Sustainable" keeps its first word.
 */
export const impactTitle = (item) => {
  const title = typeof item?.title === "string" ? item.title.trim() : "";
  const eyebrow = impactEyebrow(item);
  if (!title || !eyebrow) return title;
  if (!title.toLowerCase().startsWith(eyebrow.toLowerCase())) return title;
  const rest = title.slice(eyebrow.length).trimStart();
  if (!/^[—–-]/.test(rest)) return title;
  return rest.slice(1).trim() || title;
};

/**
 * The seed rows as columns: the junk dropped, the eyebrow derived, the prefix
 * taken off the title, the points kept WORD FOR WORD.
 *
 * Exported for the unit test — this is where a future edit could quietly start
 * paraphrasing a qualifier, so the "verbatim" property is asserted rather than
 * assumed.
 */
export const impactColumns = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item, index) =>
      item && typeof item === "object"
        ? {
            key: item.key || `impact-${index}`,
            eyebrow: impactEyebrow(item),
            title: impactTitle(item),
            image: typeof item.image === "string" ? item.image : "",
            points: (Array.isArray(item.points) ? item.points : []).filter(
              (point) => typeof point === "string" && point.trim()
            ),
          }
        : null
    )
    // Emptied AFTER normalising, not before: a row carrying three blank strings
    // passes a `points.length` test and then renders as a hole in the triptych.
    // A column with neither a title nor a point is not a thinner column.
    .filter((column) => column && (column.title || column.points.length > 0));

// Where a column waits before it arrives — see Pillars.js for why the resting
// state has to be named as `animate` as well.
const RESTING = { opacity: 0, y: RISE.reveal };

const ImpactTriptych = ({
  items,
  showImages = false,
  titleAs: Title = "h3",
  className = "",
  ...rest
}) => {
  const reduceMotion = useReducedMotion();
  const columns = impactColumns(items);

  if (columns.length === 0) return null;

  return (
    <div
      className={[styles.grid, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {columns.map((column, index) => (
        <motion.div
          key={column.key}
          className={styles.column}
          {...(reduceMotion ? {} : { animate: RESTING })}
          {...reveal(reduceMotion, { index, inView: true, amount: 0.2 })}
        >
          {showImages && column.image ? (
            <div className={`sf-placeholder-media ${styles.media}`}>
              <img
                className={styles.image}
                src={column.image}
                alt=""
                loading="lazy"
                decoding="async"
                onError={onImageError}
              />
            </div>
          ) : null}

          {column.eyebrow ? (
            <p className={`sf-eyebrow ${styles.eyebrow}`}>{column.eyebrow}</p>
          ) : null}

          {column.title ? (
            <Title className={styles.title}>{column.title}</Title>
          ) : null}

          {column.points.length > 0 ? (
            /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
            <ul role="list" className={styles.points}>
              {column.points.map((point, pointIndex) => (
                <li className={styles.point} key={pointIndex}>
                  {/* The glyph's box is the wrapper's, not the icon's — see
                      Pillars.js. The svg is 1em, so 18px is one font-size. */}
                  <span className={styles.glyph} aria-hidden="true">
                    <Icon icon="mdi:circle-medium" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </motion.div>
      ))}
    </div>
  );
};

export default ImpactTriptych;
