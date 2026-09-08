import React, { useCallback, useId, useMemo } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import {
  buildCartItem,
  onImageError,
  PLACEHOLDER_IMG,
  productPath,
} from "../../utils/helpers";
import { isPriceKnown, resolvePrice, stageSrc } from "../../utils/product";
import { Button } from "../ui";
import styles from "./CrossSell.module.css";

// =============================================================================
// CrossSell — "Complete your ritual", wherever the cart is looked at
// =============================================================================
//
// Lifted out of CartDrawer by Prompt 29 so the tray and the /cart page make the
// SAME suggestion, in the same words, from the same rule. Two surfaces asking
// "what next?" and answering differently is the fastest way to make a shop feel
// assembled rather than designed — and the ranking below is the part that would
// have drifted first.
//
// THE CALLER OWNS THE CATALOGUE. `products` is a prop, not a fetch: the drawer
// reads the range once per mount and caches it in a ref (Header keeps the tray
// mounted for the whole session), the page reads it with its own lifecycle. A
// fetch inside here would replace one cached read with two uncoordinated ones.
//
// THE CALLER OWNS THE FRAME. This module styles the LIST — the plate, the name,
// the price, the Add. The padding and the seam around it belong to the surface
// it is sitting in, which is why `.cross` sets neither and the drawer's own
// `.crossSlot` supplies both.
//
// Props:
//   products      array    the catalogue to choose from
//   items         array    the current cart lines (excluded from the answer)
//   limit         number   how many to offer (default 2)
//   title         string   overrides the heading, which is otherwise
//                          "Start with" for an empty cart and
//                          "Complete your ritual" for a full one
//   headingLevel  string   the element for that heading (default "h3")
//   variant       "drawer" | "page"   rows in a column, or a responsive grid
//   onNavigate    fn       fires when a link is followed (the drawer closes)
//   className     string
// =============================================================================

/** The house's own running order, with unranked products last. */
const heroRank = (product) => {
  const order = Number(product?.heroOrder);
  return Number.isFinite(order) && order > 0 ? order : Number.MAX_SAFE_INTEGER;
};

/**
 * "Complete your ritual" — up to `limit` products worth suggesting next.
 *
 * THE ORDER OF PREFERENCE, best answer first:
 *   1. `frequentlyBoughtTogetherIds` of what is already in the cart — the
 *      merchant's own pairing, walked in cart order.
 *   2. The NEXT step of the ritual in the same category: a cleanse suggests the
 *      polish, the polish suggests the treatment. Nearest step first.
 *   3. Hero order — the house's running order, for a cart that has exhausted
 *      both, and for an EMPTY cart ("Start with"), which reaches this function
 *      with no lines and therefore falls straight through to here.
 *
 * NEVER SUGGESTED: anything already in the cart, and anything whose price is
 * not committed yet. A "Price on launch" product cannot be added, so offering
 * an Add button beside it is an invitation to a dead end.
 */
export const crossSellFor = (products, cartItems, limit = 2) => {
  const all = Array.isArray(products) ? products : [];
  const byId = new Map(all.map((product) => [String(product.id), product]));
  const inCart = new Set(
    (cartItems || []).map((line) => String(line.productId))
  );
  const lines = (cartItems || [])
    .map((line) => byId.get(String(line.productId)))
    .filter(Boolean);

  const picked = [];
  const seen = new Set();
  const take = (product) => {
    if (picked.length >= limit || !product) return;
    const key = String(product.id);
    if (seen.has(key) || inCart.has(key) || !isPriceKnown(product)) return;
    seen.add(key);
    picked.push(product);
  };

  // 1. Bought together with what is already there.
  lines.forEach((product) =>
    (product.frequentlyBoughtTogetherIds || []).forEach((id) =>
      take(byId.get(String(id)))
    )
  );

  // 2. The next step of the same ritual.
  lines.forEach((product) => {
    const step = Number(product.ritualStep?.order);
    if (!Number.isFinite(step)) return;
    all
      .filter(
        (candidate) =>
          candidate.categoryId === product.categoryId &&
          Number(candidate.ritualStep?.order) > step
      )
      .sort(
        (a, b) => Number(a.ritualStep.order) - Number(b.ritualStep.order)
      )
      .forEach((candidate) => take(candidate));
  });

  // 3. The house's running order.
  [...all]
    .sort((a, b) => heroRank(a) - heroRank(b))
    .forEach((candidate) => take(candidate));

  return picked;
};

const CrossSell = ({
  products,
  items,
  limit = 2,
  title,
  headingLevel: Heading = "h3",
  variant = "drawer",
  onNavigate,
  className = "",
}) => {
  const { addToCart } = useCart();
  const { formatPrice } = useStoreSettings();
  const headingId = useId();

  const cart = useMemo(() => items || [], [items]);
  const picks = useMemo(
    () => crossSellFor(products, cart, limit),
    [products, cart, limit]
  );

  // Adding from here must not open (or close) the tray — the shopper is already
  // looking at the thing they just changed.
  const addSuggestion = useCallback(
    (product) => {
      try {
        addToCart(buildCartItem(product), 1, { openDrawer: false });
      } catch (error) {
        // buildCartItem throws PRICE_TBA for an uncommitted price — which
        // crossSellFor has already excluded, so reaching here is a bug in the
        // filter, not something to surface to the shopper.
        console.error("Cross-sell add failed:", error);
      }
    },
    [addToCart]
  );

  if (!picks.length) return null;

  const heading = title || (cart.length ? "Complete your ritual" : "Start with");

  return (
    <section
      className={[styles.cross, styles[variant] || "", className]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={headingId}
    >
      <Heading id={headingId} className={`sf-eyebrow ${styles.eyebrow}`}>
        {heading}
      </Heading>
      <ul className={styles.list}>
        {picks.map((product) => {
          const href = productPath(product);
          const { price } = resolvePrice(product);
          return (
            <li key={product.id} className={styles.row}>
              {/* The plate repeats the destination of the name beside it, so it
                  is taken out of the tab ring rather than doubling every stop. */}
              <Link
                to={href}
                className={`sf-plate ${styles.plate}`}
                onClick={onNavigate}
                tabIndex={-1}
                aria-hidden="true"
              >
                <img
                  src={stageSrc(product, { w: 160 }) || PLACEHOLDER_IMG}
                  alt=""
                  loading="lazy"
                  onError={onImageError}
                />
              </Link>
              <span className={styles.body}>
                <Link to={href} className={styles.name} onClick={onNavigate}>
                  {product.name}
                </Link>
                <span className={styles.price}>{formatPrice(price)}</span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                className={styles.add}
                aria-label={`Add ${product.name} to cart`}
                onClick={() => addSuggestion(product)}
              >
                Add
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default CrossSell;
