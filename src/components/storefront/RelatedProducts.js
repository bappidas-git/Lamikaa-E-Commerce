import React from "react";
import ProductCard from "./ProductCard";
import Rail from "../ui/Rail";
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
// THE SCROLLER IS THE SHARED `ui/Rail`, AND THAT IS THE POINT. This file used
// to size its own cards against the VIEWPORT — "four and a bit across at 1024px
// and up". That rule is true for the wishlist, where the rail is the width of
// the page, and catastrophic here: on the PDP this rail lives inside a 537px
// chapter column, where `(100% - gaps) / 4.4` resolved to NINETY-ONE PIXEL
// cards — the product name clipped to "Black Ric…", one chip per line, the
// promise reading one word per row. Rail measures a card against the RAIL
// instead, with a floor no host can push it under, so the same component gives
// four cards on the wishlist, two and a bit in the PDP chapter, and one and a
// bit on a phone. It also brings the arrows, the directional edge fade, the
// touch progress bar and the keyboard handling this rail never had.
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
      {/* The rail's own label is the SCROLL REGION's name and the stem of its
          arrows' labels ("Scroll products you may also like forwards"), so it
          is a noun phrase rather than the heading verbatim. */}
      <Rail
        label="products you may also like"
        cardMin="248px"
        cardMax="300px"
        perView={4.2}
      >
        {items.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            isWishlisted={isInWishlist ? isInWishlist(p.id) : false}
          />
        ))}
      </Rail>
    </section>
  );
};

export default RelatedProducts;
