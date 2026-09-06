import React from "react";
import PriceBlock from "../storefront/PriceBlock";
import { resolvePrice } from "../../utils/product";

// =============================================================================
// Price — the placeholder-aware price, for callers that hold a product
// =============================================================================
//
// PriceBlock owns the typography and the compare/discount arithmetic. This is
// the thin adapter above it: hand it a `product` and it resolves the price the
// same way every other surface does (variants, compare-at, the priceTBA flag)
// through utils/product.js — so a card, the PDP and the offers page can never
// disagree about what a product costs, or about whether it costs anything yet.
//
// Callers that already hold numbers (a cart line, an order row — records where
// the price was captured at the time, not derived now) pass `price` and
// `comparePrice` directly and skip the resolution entirely.
//
// When the price is unknown the whole component is the chip: no struck compare,
// no "you save", no tax note. There is nothing to be transparent ABOUT yet, and
// a tax note under a missing price implies a price exists.
// =============================================================================

const Price = ({
  product,
  price,
  comparePrice,
  size = "md",
  showSavings,
  taxNote,
  className = "",
  ...rest
}) => {
  const resolved = product
    ? resolvePrice(product)
    : {
        known: price != null && price !== "" && Number.isFinite(Number(price)) && Number(price) > 0,
        price: Number(price) || 0,
        comparePrice: Number(comparePrice) || 0,
        discount: 0,
      };

  return (
    <PriceBlock
      unknown={!resolved.known}
      price={resolved.price ?? 0}
      comparePrice={resolved.comparePrice}
      size={size}
      showSavings={showSavings}
      taxNote={resolved.known ? taxNote : undefined}
      className={className}
      {...rest}
    />
  );
};

export default Price;
