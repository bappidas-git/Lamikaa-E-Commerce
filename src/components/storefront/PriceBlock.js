import React from "react";
import { formatCurrency } from "../../utils/helpers";
import styles from "./PriceBlock.module.css";

// =============================================================================
// PriceBlock — honest, transparent pricing
// =============================================================================
// Shows the current/sale price and, ONLY when the compare-at price is genuinely
// higher, the struck-through original + a computed discount and savings. The
// discount can never be fabricated: it is derived from (compare − current), so a
// component author cannot type in a fake "% off". If compare ≤ current, nothing
// but the price renders.
//
// The editorial treatment lives entirely in the stylesheet: the price is set in
// the display serif at lg/md, the compare is struck in muted ink, and the
// "% off" / "You save" lines are quiet tracked text rather than pills. Nothing
// about the markup or the arithmetic below changes with the skin.
//
// NO PRICE IS NOT A PRICE OF ZERO. Updated by Prompt 05: several products ship
// before their MRP is set, and a storefront that sells nothing for free must
// never print "₹0.00" — it reads as a promise, and it used to be exactly what
// an absent price rendered as. So a price that is not a positive number renders
// the "Price on launch" chip instead, and every legacy call site (the product
// card, the PDP buy box, the offers page) is covered without being touched:
// they pass `getProductMinPrice().sellingPrice`, which is 0 for such a product.
// A caller that genuinely means zero passes `unknown={false}`.
//
// Props:
//   price        number   current/selling price
//   comparePrice number   original price (optional)
//   currency     string   ISO code (defaults to the store's own currency)
//   size         "sm"|"md"|"lg"  visual scale (default "lg" for the PDP)
//   showSavings  boolean  show "You save ₹X" line (default true on lg)
//   taxNote      string   optional transparency note, e.g. "Inclusive of all taxes"
//   unknown      boolean  force/deny the "Price on launch" chip
//   live         boolean  announce the "Price on launch" chip (default true)
//   className    string   pass-through for the wrapper
// =============================================================================
const PriceBlock = ({
  price = 0,
  comparePrice = 0,
  currency,
  size = "lg",
  showSavings,
  taxNote,
  unknown,
  live = true,
  className = "",
}) => {
  const current = Number(price) || 0;
  const isUnknown = unknown ?? !(current > 0);
  const wrapperClass = [styles.block, styles[size], className]
    .filter(Boolean)
    .join(" ");

  // `role="status"` rather than a bare span: on a PDP where the variant switch
  // moves a product in and out of "price on launch", the change has to be
  // announced, and it is the same node either way.
  //
  // `live={false}` is for a LIST, where the chip is created and destroyed with
  // its row and never changes in place — eight of them arriving at once in the
  // search overlay is eight announcements over the result count, which is the
  // one thing the visitor actually needed to hear (Prompt 11).
  if (isUnknown) {
    return (
      <div className={wrapperClass}>
        <span className={styles.tba} role={live ? "status" : undefined}>
          Price on launch
        </span>
      </div>
    );
  }

  const compare = Number(comparePrice) || 0;
  const hasDiscount = compare > current && current > 0;
  const discount = hasDiscount
    ? Math.round(((compare - current) / compare) * 100)
    : 0;
  const savings = hasDiscount ? compare - current : 0;
  const wantSavings = showSavings ?? size === "lg";

  return (
    <div className={wrapperClass}>
      <div className={styles.row}>
        <span className={styles.price}>{formatCurrency(current, currency)}</span>
        {hasDiscount && (
          <>
            <span className={styles.compare}>
              {formatCurrency(compare, currency)}
            </span>
            <span className={styles.discount}>{discount}% off</span>
          </>
        )}
      </div>
      {hasDiscount && wantSavings && (
        <div className={styles.savings}>
          You save {formatCurrency(savings, currency)}
        </div>
      )}
      {taxNote && <div className={styles.taxNote}>{taxNote}</div>}
    </div>
  );
};

export default PriceBlock;
