import React from "react";
import ProductCard from "./ProductCard";
import styles from "./RelatedProducts.module.css";

// =============================================================================
// RelatedProducts — data-driven AOV rail ("You may also like")
// =============================================================================
// A horizontally scrollable row of real products. It is purely data-driven: if
// the caller has no real related products to pass, the whole section renders
// nothing (no filler, no fabricated "recommended" items). Helpful, not pushy.
//
// The shell is a serif heading and the cards; the heading is only ever the
// caller's `title` — the rail adds no copy of its own, so it can never announce
// something the data does not support. `headingLevel` exists because the rail
// is mounted inside the PDP's "Complete the ritual" chapter, whose own <h2>
// heads it: a second h2 there would put two peers under one section.
//
// THE EDGE FADES ARE A MASK, AND THEY LIFT ON FOCUS. A veil painted over the
// scroller would fade out a card's focus ring exactly when a keyboard visitor
// scrolled that card to the edge, which is why this rail had none. A
// `mask-image` costs nothing to paint and can be removed under `:focus-within`,
// so a pointer visitor gets the "there is more to the right" affordance and a
// keyboard visitor gets an unclipped ring. The peek of the next card and the
// hairline scrollbar do the rest.
//
// Props:
//   title            string
//   headingLevel     "h2" | "h3" | …  the element the title renders as
//   products         array   real products to recommend
//   onAddToCart      fn
//   onToggleWishlist fn
//   isInWishlist     fn (productId) => boolean
// =============================================================================
const RelatedProducts = ({
  title = "You may also like",
  headingLevel: Heading = "h2",
  products = [],
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  className = "",
}) => {
  const items = Array.isArray(products) ? products : [];
  if (items.length === 0) return null;

  return (
    <section
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-label={title}
    >
      <Heading className={styles.title}>{title}</Heading>
      <div className={styles.rail}>
        <div className={styles.scroller}>
          {items.map((p) => (
            <div className={styles.cell} key={p.id}>
              <ProductCard
                product={p}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={isInWishlist ? isInWishlist(p.id) : false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedProducts;
