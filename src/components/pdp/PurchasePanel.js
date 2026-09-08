import React, { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import LegalNote from "../brand/LegalNote";
import { Button, GlassCard, Price } from "../ui";
import {
  DeliveryReturnsInfo,
  QuantityStepper,
  SocialProof,
  TrustBadges,
  VariantSelector,
} from "../storefront";
import { categoryPath } from "../../utils/categories";
import { productFlagMarks } from "../../utils/helpers";
import { ROUTES } from "../../utils/constants";
import { STOREFRONT_CONFIG } from "../../theme/tokens";
import styles from "./PurchasePanel.module.css";

// =============================================================================
// PurchasePanel — every commerce control the product page has, in one order
// =============================================================================
//
// The old buy box was a stack of eight unrelated blocks in the right-hand
// column. This is the same eight decisions in the order a shopper actually
// makes them: where am I, what is this, does anyone rate it, what does it cost,
// what do I get, who stands behind it, which one, how many, and finally — buy.
// Everything below the CTA row (delivery, returns, the ownership note) answers
// the questions that come AFTER the decision, which is why it comes after it.
//
// IT OWNS NO DATA. Price, stock, the variant, the quantity and the cart wiring
// all live on the page (ProductDetails), because the sticky mobile bar, the
// SEO tags and the chapters need the same answers and two derivations would
// eventually disagree. This is presentation plus two purely local things: the
// share gesture and the tab order.
//
// THE CTA ROW IS THE ANCHOR the sticky mobile bar watches (`ctaRef`). The bar
// appears only once these buttons have left the screen, which is the promise
// that it can never cover the controls it duplicates.
//
// NO RATING UI WITHOUT RATINGS. `SocialProof` renders "No ratings yet" when
// asked, and on a range where every product is at 0 reviews that line is nine
// words of nothing. The summary is therefore rendered only when a real rating
// or a real review exists — the page decides, and passes `showRating`.
//
// GLASS ON A DESKTOP, PLAIN ON A PHONE. The panel is a `GlassCard` at every
// width, but under 769px the stylesheet takes its ground, blur and border away:
// on a phone the panel IS the page, and a blurred card the width of the screen
// is a filter over the page's own background for no gain.
//
// SHARE: `navigator.share` where the platform has it (the OS sheet is what a
// visitor expects on a phone), the clipboard everywhere else, and a toast
// either way so the gesture is never silent. A browser with neither simply
// keeps the button inert rather than pretending.
// =============================================================================

/** Copy — the strings this panel owns, in one place. */
const COPY = {
  addToCart: "Add to Cart",
  buyNow: "Buy now",
  comingSoon: "Coming soon",
  outOfStock: "Out of stock",
  inStock: "In stock",
  share: "Share",
  linkCopied: "Link copied",
  readStory: "Read our story",
};

/**
 * The one-line stock status under the quantity stepper.
 *
 * A product with no price yet has NO status. Its warehouse may well hold a
 * hundred of them, but "In stock" beside a button that says "Coming soon" is
 * two answers to one question, and neither "Only 3 left" nor "Out of stock"
 * means anything about a thing nobody can buy yet.
 */
export const stockLabel = ({
  hasStockInfo,
  isOutOfStock,
  isLowStock,
  stock,
  comingSoon,
}) => {
  if (comingSoon) return "";
  if (isOutOfStock) return COPY.outOfStock;
  if (isLowStock) return `Only ${stock} left`;
  return hasStockInfo ? COPY.inStock : "";
};

/** The ritual eyebrow: "01 — Cleanse", the product's place in its routine. */
export const ritualStepLabel = (product) => {
  const step = product?.ritualStep;
  if (!step?.label) return "";
  const order = Number(step.order);
  if (!Number.isFinite(order) || order <= 0) return step.label;
  return `${String(order).padStart(2, "0")} — ${step.label}`;
};

const PurchasePanel = ({
  product,
  category,
  trail = [],
  titleId,
  // Selection
  selectedVariant,
  onVariantChange,
  quantity = 1,
  onQuantityChange,
  maxQuantity = 1,
  // Stock + availability
  hasStockInfo = false,
  isOutOfStock = false,
  isLowStock = false,
  stock,
  comingSoon = false,
  // Actions
  onAddToCart,
  onBuyNow,
  added = false,
  wishlisted = false,
  onToggleWishlist,
  // Ratings
  showRating = false,
  rating = 0,
  ratingsCount = 0,
  onReviewsClick,
  // Store data
  shipping = [],
  settings,
  fillCopy,
  ctaRef,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const canShare =
    typeof navigator !== "undefined" &&
    (typeof navigator.share === "function" ||
      typeof navigator.clipboard?.writeText === "function");

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = product?.name || "";
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        icon: "success",
        title: COPY.linkCopied,
      });
    } catch (error) {
      // A cancelled share sheet and a denied clipboard both land here, and
      // neither is a failure worth a dialog.
    }
  }, [product?.name]);

  if (!product) return null;

  const flagMarks = productFlagMarks(product);
  const categoryName = category?.displayName || category?.name || "";
  const stepLabel = ritualStepLabel(product);
  const unavailable = comingSoon || isOutOfStock;

  // The price follows the SELECTION. A chosen variant replaces the product's
  // own price and takes the variant list off the subject, so `resolvePrice`
  // reads the one price on screen rather than the range's minimum.
  const priceSubject = selectedVariant
    ? { ...product, price: selectedVariant.price, variants: [] }
    : product;

  const sku = selectedVariant?.sku || product.sku || "";
  const status = stockLabel({
    hasStockInfo,
    isOutOfStock,
    isLowStock,
    stock,
    comingSoon,
  });

  const addLabel = comingSoon
    ? COPY.comingSoon
    : isOutOfStock
    ? COPY.outOfStock
    : COPY.addToCart;

  return (
    <GlassCard
      as="section"
      padding="lg"
      aria-labelledby={titleId}
      className={[styles.panel, className].filter(Boolean).join(" ")}
    >
      <Breadcrumb items={trail} className={styles.crumbs} />

      {/* ── The eyebrow: where this sits in the range, and in the ritual ── */}
      {(categoryName || stepLabel || flagMarks.length > 0) && (
        <p className={styles.eyebrow}>
          {categoryName ? (
            <Link to={categoryPath(category)} className={styles.categoryLink}>
              {categoryName}
            </Link>
          ) : null}
          {stepLabel ? (
            <span className={`sf-numeral ${styles.step}`}>{stepLabel}</span>
          ) : null}
          {/* The merchant's own switches — featured / trending / hot / new. */}
          {flagMarks.map((flag) => (
            <span key={flag.key} className={`sf-flag ${flag.className}`}>
              {flag.label}
            </span>
          ))}
        </p>
      )}

      <h1 id={titleId} className={styles.name}>
        {product.name}
      </h1>

      {product.promise ? <p className={styles.promise}>{product.promise}</p> : null}

      {showRating ? (
        <SocialProof
          rating={rating}
          count={ratingsCount}
          onReviewsClick={onReviewsClick}
          className={styles.rating}
        />
      ) : null}

      <Price
        product={priceSubject}
        size="lg"
        showSavings
        taxNote={fillCopy ? fillCopy("Prices are {taxNote}.") : undefined}
        className={styles.price}
      />

      {/* ── The two quiet facts every pack prints, plus the SKU ─────────── */}
      {(product.size || product.fragranceNote || sku) && (
        <dl className={styles.facts}>
          {product.size ? (
            <div className={styles.fact}>
              <dt className={styles.factLabel}>Size</dt>
              <dd className={styles.factValue}>{product.size}</dd>
            </div>
          ) : null}
          {product.fragranceNote ? (
            <div className={styles.fact}>
              <dt className={styles.factLabel}>Fragrance</dt>
              <dd className={styles.factValue}>{product.fragranceNote}</dd>
            </div>
          ) : null}
          {sku ? (
            <div className={styles.fact}>
              <dt className={styles.factLabel}>SKU</dt>
              <dd className={`${styles.factValue} ${styles.sku}`}>{sku}</dd>
            </div>
          ) : null}
        </dl>
      )}

      <TrustBadges
        ids={STOREFRONT_CONFIG.trustBadges}
        settings={settings}
        shipping={shipping}
        variant="chips"
      />

      {/* ── Which one (only a product that has variants has a choice) ───── */}
      {product.variants?.length > 0 && (
        <div className={styles.variants}>
          <VariantSelector
            variants={product.variants}
            value={selectedVariant}
            onChange={onVariantChange}
            productStock={product.stock}
          />
        </div>
      )}

      {/* ── How many, and how many there are ────────────────────────────── */}
      <div className={styles.quantityRow}>
        <div className={styles.quantity}>
          <span className={styles.quantityLabel} id="pdp-quantity-label">
            Quantity
          </span>
          <QuantityStepper
            value={quantity}
            onChange={onQuantityChange}
            min={1}
            max={maxQuantity}
            disabled={unavailable}
          />
        </div>
        {status ? (
          <p
            className={[
              styles.stock,
              isOutOfStock ? styles.stockOut : "",
              isLowStock ? styles.stockLow : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {status}
          </p>
        ) : null}
      </div>

      {/* ── Buy. This row is the anchor the sticky mobile bar watches. ──── */}
      <div className={styles.actions} ref={ctaRef}>
        <Button
          variant="addToCart"
          size="lg"
          success={added}
          disabled={unavailable}
          onClick={onAddToCart}
          className={styles.add}
        >
          {addLabel}
        </Button>

        {/* Nothing to buy now when there is no price yet or no stock — the
            button is not disabled, it is absent, because a second dead control
            beside the first says nothing the first has not already said. */}
        {!unavailable && (
          <Button
            variant="primary"
            size="lg"
            onClick={onBuyNow}
            className={styles.buy}
          >
            {COPY.buyNow}
          </Button>
        )}

        <div className={styles.marks}>
          <Button
            variant="icon"
            icon={wishlisted ? "mdi:heart" : "mdi:heart-outline"}
            srLabel={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wishlisted}
            onClick={onToggleWishlist}
            className={wishlisted ? styles.wishlisted : undefined}
          />
          {canShare && (
            <Button
              variant="icon"
              icon={copied ? "mdi:check" : "mdi:share-variant-outline"}
              srLabel={COPY.share}
              onClick={handleShare}
            />
          )}
        </div>
      </div>

      <hr className="sf-hairline" />

      <DeliveryReturnsInfo
        shipping={shipping}
        settings={settings}
        fillCopy={fillCopy}
      />

      {/* ── Who this belongs to. The qualifier is LegalNote's, verbatim. ── */}
      <div className={styles.ownership}>
        <LegalNote compact />
        <Link to={ROUTES.ABOUT} className={styles.story}>
          {COPY.readStory}
        </Link>
      </div>
    </GlassCard>
  );
};

export default PurchasePanel;
