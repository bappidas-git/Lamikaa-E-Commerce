import React, { useEffect, useState } from "react";
import { Button, CloudinaryImage, Price } from "../ui";
import { primaryImage, productAlt } from "../../utils/product";
import styles from "./AddToCartBar.module.css";

// =============================================================================
// AddToCartBar — the sticky purchase bar (phones and large phones)
// =============================================================================
//
// On a phone the primary CTA has to stay a thumb away once the purchase panel
// has scrolled off, and this is that CTA: a strong-glass band holding a 56px
// plate of the pack, the name, the live price and the same three-state Add to
// Cart button the panel carries.
//
// IT APPEARS ONLY WHEN THE PANEL'S OWN CTA IS GONE. `anchorRef` points at the
// panel's CTA row and an IntersectionObserver watches it; while those buttons
// are on screen this bar is not. That is the contract that stops it covering
// the controls it duplicates — the one thing a sticky bar must never do.
//
// IT SAYS WHAT THE PANEL SAYS. `Price` is handed the same product, so a product
// with no MRP yet shows "Price on launch" here too and the button reads "Coming
// soon"; a product at zero stock reads "Out of stock". The bar asserts nothing
// the panel does not.
//
// Z-ORDER (settled in Prompt 10, kept here): --sf-z-sticky (40) BottomNav <
// --sf-z-stickybar (60) this bar < --sf-z-overlay (1000) < --sf-z-modal (1100).
// From Prompt 25 the BottomNav hides itself on /product/* below 769px anyway,
// so the two bars can never stack — but the order stands for the cart page and
// anything else that grows a sticky foot later.
//
// Props:
//   anchorRef    ref       the element whose visibility toggles the bar
//   product      object    the product — `Price` and the thumbnail read it
//   variant      object    the selected variant, when there is one
//   name         string    the label (the variant's name, or the product's)
//   price/comparePrice     numbers, for a caller that has no product record
//   outOfStock   boolean
//   comingSoon   boolean   no price yet (`priceTBA`)
//   added        boolean   the panel's "Added" flash, mirrored here
//   onAddToCart  fn
//   onBuyNow     fn        optional — omitted when there is nothing to buy
// =============================================================================
const AddToCartBar = ({
  anchorRef,
  product,
  variant,
  name,
  price,
  comparePrice,
  outOfStock = false,
  comingSoon = false,
  added = false,
  ctaLabel = "Add to Cart",
  onAddToCart,
  onBuyNow,
}) => {
  const [showBar, setShowBar] = useState(false);

  // Reveal the bar only after the in-page CTA row has scrolled away.
  useEffect(() => {
    const el = anchorRef?.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShowBar(true); // graceful fallback: always available on a phone
      return undefined;
    }
    const obs = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      { rootMargin: "0px 0px -10% 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [anchorRef]);

  const media = primaryImage(product);
  const label = name || product?.name || "";
  const unavailable = comingSoon || outOfStock;

  // The price follows the selection, exactly as the panel's does.
  const priceSubject = variant
    ? { ...product, price: variant.price, variants: [] }
    : product;

  const buttonLabel = comingSoon
    ? "Coming soon"
    : outOfStock
    ? "Out of stock"
    : ctaLabel;

  return (
    <div
      className={`sf-glass sf-glass--strong ${styles.bar} ${
        showBar ? styles.visible : ""
      }`}
      aria-hidden={!showBar}
    >
      <div className={styles.info}>
        {media ? (
          <CloudinaryImage
            src={media.url}
            alt={productAlt(product, media)}
            plate
            widths={[160, 240]}
            sizes="56px"
            className={styles.thumb}
          />
        ) : null}
        <div className={styles.text}>
          {label ? <span className={styles.name}>{label}</span> : null}
          <Price
            product={product ? priceSubject : undefined}
            price={price}
            comparePrice={comparePrice}
            size="sm"
            live={false}
            className={styles.price}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="addToCart"
          success={added}
          disabled={unavailable}
          onClick={onAddToCart}
          tabIndex={showBar ? undefined : -1}
          className={styles.add}
        >
          {buttonLabel}
        </Button>
        {onBuyNow && !unavailable && (
          <Button
            variant="icon"
            icon="mdi:flash-outline"
            srLabel="Buy now"
            onClick={onBuyNow}
            tabIndex={showBar ? undefined : -1}
          />
        )}
      </div>
    </div>
  );
};

export default AddToCartBar;
