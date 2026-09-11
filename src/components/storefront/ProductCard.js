import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";
import { Button, Chip, GlassCard, Price } from "../ui";
import { isCloudinary } from "../../utils/cloudinary";
import {
  normalizeProduct,
  primaryImage,
  productAlt,
  resolvePrice,
  stageSrc,
} from "../../utils/product";
import {
  buildCartItem,
  onImageError,
  PLACEHOLDER_IMG,
  productFlagMarks,
  productPath,
} from "../../utils/helpers";
import styles from "./ProductCard.module.css";

// =============================================================================
// ProductCard — the LAMIKAA label card
// =============================================================================
// One card, used by every product surface (the home showcases, the shop grid,
// search results, the wishlist wall and the PDP's related rail). Domain-agnostic
// and presentational: it renders whatever real product data it is given and
// wires nothing itself — the call site passes `onAddToCart` (CartContext +
// buildCartItem) and `onToggleWishlist` (WishlistContext).
//
// THE CARD IS THE LABEL
//   Glass, radius lg, and inside it a 1:1 `.sf-plate` with the pack's label
//   crop CONTAINED on it — packaging is the product, so a bottle is never
//   sliced to fill a square (utils/product.js `stageSrc` letterboxes it on a
//   ground sampled from the shot's own edges). Then a quiet stack: the ritual
//   step and up to two concerns, the name in Fraunces, the product's own
//   promise, the owner-mandated badges, the price.
//
// THE DOM IS media -> body -> action, ALWAYS
//   The action is LAST so it is the last tab stop and keyboard order reads
//   image, heart, name, add. On a fine pointer the stylesheet moves it back
//   into the media row, where it is revealed over the foot of the plate on
//   hover or focus-within; on any device with a coarse pointer it stays in its
//   own row, always visible, always tappable. Explicit `grid-row` is what lets
//   one button live in two places without a second DOM node.
//
// EVERY CLAIM IS THE DATA'S
//   • Stars show ONLY when `totalReviews > 0`. No reviews means NO rating row —
//     not a hollow "(0)", not a muted apology for having none. (Nothing in the
//     LAMIKAA catalogue is rated yet: `brand.flags.showSampleReviews` is off.)
//   • The badges are `product.badges`, which normalizeProduct defaults to
//     `brand.trustBadges` — the owner edits the wording in one file
//     (BRAND.md §3.9 rule 4). No badge copy is typed in this component.
//   • The discount badge derives from a real `comparePrice` above the selling
//     price, through the same `resolvePrice()` the PDP and the cart read.
//   • "Coming soon" is `priceTBA` (five of the eight launch products have no
//     legible MRP); "Out of stock" is `stock === 0`. Those are the only two
//     things this card knows how to withhold.
//   • TRENDING / HOT appear only when the merchant has thrown that switch in
//     Admin -> Products -> Visibility & Flags. A merchant's note, not scarcity
//     theatre — and nothing in the seed carries one.
//
// Props (stable contract — consumed by Home, Shop, Wishlist, Search, PDP rails):
//   product           object  (required)
//   onAddToCart       fn      (cartItem) => void  — omit to hide the button
//   onToggleWishlist  fn      (product) => void   — omit to hide the heart
//   isWishlisted      boolean
//   showAddToCart     boolean default true (when onAddToCart given)
// =============================================================================

// The plate's real layout widths. A wishlist snapshot or an admin-typed link is
// not a Cloudinary upload and gets no srcSet — `cld()` would hand back the same
// URL for every width, and four identical candidates is a lie the browser then
// has to pick from.
const PLATE_WIDTHS = [320, 480, 640, 900];

// One `sizes` for every grid this card lands in: ~300px in the 4-up desktop
// wall, a third of the viewport on a laptop, about half on a tablet, and most
// of the width in a phone's two-up or its snap rail.
const PLATE_SIZES =
  "(min-width: 1280px) 300px, (min-width: 1024px) 30vw, (min-width: 768px) 45vw, 50vw";

// At most two concerns on a card. A third is a third line, and the PDP is where
// the full list belongs.
const MAX_CONCERNS = 2;

/**
 * A concern SLUG as a label: "even-tone" -> "Even tone".
 *
 * A product names its concerns by slug and the display names live in the
 * `concerns` collection — but this card is a leaf that must never fetch, and it
 * is rendered eight at a time in grids that already made their own round trip.
 * The derivation matches every seeded concern exactly (the collection is
 * sentence case), and a slug the owner adds later still reads correctly;
 * surfaces that hold the collection (the mega panel, the shop facets) keep
 * using the record's own `name`.
 */
export const concernLabel = (slug) => {
  const words = String(slug || "").replace(/[-_]+/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "";
};

/** "01 - Cleanse" from `ritualStep`, or null when the product has no step. */
export const stepLabel = (product) => {
  const step = product?.ritualStep;
  if (!step || !step.label) return null;
  const order = Number(step.order);
  return {
    numeral: Number.isFinite(order) && order > 0 ? String(order).padStart(2, "0") : null,
    label: step.label,
  };
};

/** The plate's `src` and (Cloudinary only) its `srcSet`. */
export const plateSources = (product) => {
  const src = stageSrc(product, { w: 640 });
  if (!src) return { src: PLACEHOLDER_IMG, srcSet: undefined };
  if (!isCloudinary(primaryImage(product)?.url)) return { src, srcSet: undefined };
  return {
    src,
    srcSet: PLATE_WIDTHS.map((w) => `${stageSrc(product, { w })} ${w}w`).join(", "),
  };
};

const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  showAddToCart = true,
}) => {
  // A brief "Added" confirmation on a successful add (the Button variant owns
  // the label and the live region; this only holds the flag).
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);
  useEffect(() => () => clearTimeout(addedTimer.current), []);

  // Read every product through the one normaliser, so a wishlist snapshot
  // (flat, `image` only, no media[] and no badges) renders exactly like a
  // catalogue row: media derived from `images[]`, badges defaulted from the
  // brand config, `priceTBA` computed from the price that is actually there.
  const p = useMemo(() => (product ? normalizeProduct(product) : null), [product]);

  if (!p) return null;

  const { discount } = resolvePrice(p);
  const ratingCount = Number(p.totalReviews) || 0;
  const outOfStock = p.stock === 0;
  const comingSoon = p.priceTBA === true;
  const unavailable = outOfStock || comingSoon;

  const step = stepLabel(p);
  const concerns = p.concerns.slice(0, MAX_CONCERNS);
  const flagMarks = productFlagMarks(p);
  const badges = Array.isArray(p.badges) ? p.badges : [];
  const { src, srcSet } = plateSources(p);
  const to = productPath(p);

  const handleAdd = () => {
    if (unavailable) return;
    onAddToCart(buildCartItem(p));
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1400);
  };

  const actionLabel = comingSoon
    ? "Coming soon"
    : outOfStock
    ? "Out of stock"
    : "Add to Cart";

  return (
    <GlassCard
      as="article"
      interactive
      glow="pink"
      padding="sm"
      className={`${styles.card} ${unavailable ? styles.isUnavailable : ""}`.trim()}
    >
      <div className={styles.inner}>
        {/* ---- media ------------------------------------------------------ */}
        <div className={styles.mediaWrap}>
          {/* The plate is a link and the name is a link: two stops, one
              destination, which is the existing card's contract (the buttons
              are siblings — a button inside an anchor is invalid markup and
              swallows the tap). The image carries the real alt text, so the
              link takes its accessible name from it rather than repeating it. */}
          <Link to={to} className={`sf-plate ${styles.plate}`}>
            <img
              src={src}
              srcSet={srcSet}
              sizes={srcSet ? PLATE_SIZES : undefined}
              alt={productAlt(p, primaryImage(p))}
              loading="lazy"
              decoding="async"
              onError={onImageError}
            />
          </Link>

          {discount > 0 && (
            <span className={`sf-badge-discount ${styles.discountBadge}`}>
              {discount}% off
            </span>
          )}

          {outOfStock && <span className={styles.stockTag}>Out of stock</span>}

          {onToggleWishlist && (
            <Button
              variant="icon"
              className={`${styles.wishlist} ${isWishlisted ? styles.wishlisted : ""}`.trim()}
              icon={isWishlisted ? "mdi:heart" : "mdi:heart-outline"}
              srLabel={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={isWishlisted}
              onClick={() => onToggleWishlist(p)}
            />
          )}
        </div>

        {/* ---- body ------------------------------------------------------- */}
        <div className={styles.body}>
          {/* TWO ROWS, ALWAYS — the step (with any merchant flags) and then the
              concerns, each holding its line whether or not this product fills
              it. One wrapping row was the reason a rail of cards read as
              ragged: a product whose step and chips happened to share a line
              started its name a row above the product next to it, and the
              promise, the badges and the price all inherited the offset.
              Reserved space is the cost of a run of cards that line up. */}
          {(step || concerns.length > 0 || flagMarks.length > 0) && (
            <div className={styles.eyebrow}>
              <span className={styles.stepRow}>
                {step && (
                  <span className={`sf-eyebrow ${styles.step}`}>
                    {step.numeral && (
                      <span className="sf-numeral">{step.numeral}</span>
                    )}
                    {step.numeral ? " · " : ""}
                    {step.label}
                  </span>
                )}
                {flagMarks.map((flag) => (
                  <span key={flag.key} className={`sf-flag ${flag.className}`}>
                    {flag.label}
                  </span>
                ))}
              </span>

              <span className={styles.concernRow}>
                {concerns.map((concern) => (
                  <Chip
                    variant="concern"
                    tone={concern}
                    key={concern}
                    className={styles.concernChip}
                  >
                    {concernLabel(concern)}
                  </Chip>
                ))}
              </span>
            </div>
          )}

          <p className={styles.nameRow}>
            <Link to={to} className={styles.name}>
              {p.name}
            </Link>
          </p>

          {p.promise && <p className={styles.promise}>{p.promise}</p>}

          {badges.length > 0 && (
            <ul className={styles.badges}>
              {badges.map((badge) => (
                <li key={badge}>
                  <Chip variant="trust" className={styles.badgeChip}>
                    {badge}
                  </Chip>
                </li>
              ))}
            </ul>
          )}

          <Price product={p} size="sm" live={false} className={styles.price} />

          {/* Real ratings only. No reviews means nothing at all here. */}
          {ratingCount > 0 && (
            <span className={styles.rating}>
              <StarRating rating={Number(p.rating) || 0} size={12} />
              <span className={styles.ratingCount}>
                ({ratingCount.toLocaleString()})
              </span>
            </span>
          )}
        </div>

        {/* ---- action (last in the DOM, wherever the stylesheet paints it) - */}
        {showAddToCart && onAddToCart && (
          <div className={styles.action}>
            <Button
              variant="addToCart"
              block
              disabled={unavailable}
              success={added}
              onClick={handleAdd}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default ProductCard;
