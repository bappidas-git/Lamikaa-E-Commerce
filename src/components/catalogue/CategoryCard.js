import React from "react";
import { Link } from "react-router-dom";
import { categoryPath } from "../../utils/categories";
import { categoryThumbSrc } from "../../utils/catalogue";
import { onImageError } from "../../utils/helpers";
import { GlassCard } from "../ui";
import styles from "./CategoryCard.module.css";

// =============================================================================
// CategoryCard — one way into the range
// =============================================================================
//
// A glass card carrying a 1:1 plate with the category's own picture on it, the
// category's display name in Fraunces, its one-line description and a count
// chip. Nothing on it is written here: the name, the description and the
// picture all come from the catalogue the admin edits, and the count is counted
// rather than typed.
//
// THE WHOLE CARD IS ONE LINK. A category tile has exactly one destination, so
// splitting it into an image link and a name link would give a keyboard visitor
// two stops to the same place and a screen reader the same words twice. The
// anchor wraps everything and carries the full name ("Face Care, 6 products");
// the plate image is therefore decorative and takes `alt=""`.
//
// WHICH PICTURE. `categoryThumbSrc()` takes the category's own "Card image"
// from the admin first and only borrows `product`'s cover when the category has
// none — the same rule the mega panel and the mobile drawer apply, so a picture
// set in Categories > Edit is the picture on every surface at every width.
//
// THE THUMBNAIL IS STILL OPTIONAL. A category with no image of its own and no
// members yet resolves to "", and the plate then renders empty rather than
// falling back to a stand-in photograph — an empty shelf is honest, a borrowed
// one is not. The caller decides what "first" means by the order it passes its
// products in (see utils/catalogue.js).
//
// Props:
//   category  object   the category record (name/displayName, description,
//                      slug, image)
//   product   object   the product whose cover stands in when the category has
//                      no picture of its own (may be null)
//   count     number   how many things are in the category
//   countNoun string   what those things are — "products" for a product
//                      category, "rituals" for the Rituals route, which counts
//                      routines rather than SKUs
// =============================================================================

const CategoryCard = ({
  category,
  product = null,
  count = 0,
  countNoun = "products",
  className = "",
}) => {
  if (!category) return null;

  const name = category.displayName || category.name || "";
  const thumb = categoryThumbSrc(category, product, { w: 480 });
  // "1 product", not "1 products". The noun is the caller's, the plural is not.
  const countLabel =
    count > 0 ? `${count} ${count === 1 ? countNoun.replace(/s$/, "") : countNoun}` : "";

  return (
    <GlassCard
      as="article"
      interactive
      glow="violet"
      padding="sm"
      className={[styles.card, className].filter(Boolean).join(" ")}
    >
      <Link
        to={categoryPath(category)}
        className={styles.link}
        aria-label={countLabel ? `${name}, ${countLabel}` : name}
      >
        <span className={`sf-plate ${styles.plate}`}>
          {thumb ? (
            <img
              src={thumb}
              alt=""
              loading="lazy"
              decoding="async"
              onError={onImageError}
            />
          ) : null}
        </span>

        <span className={styles.body}>
          <span className={styles.name}>{name}</span>
          {category.description ? (
            <span className={styles.description}>{category.description}</span>
          ) : null}
          {countLabel ? (
            <span className={styles.count}>{countLabel}</span>
          ) : null}
        </span>
      </Link>
    </GlassCard>
  );
};

export default CategoryCard;
