import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useCart } from "../../hooks/useCart";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import apiService from "../../services/api";
import useSeo from "../../hooks/useSeo";
import {
  onImageError,
  PLACEHOLDER_IMG,
  productPath,
} from "../../utils/helpers";
import { cld } from "../../utils/cloudinary";
import { ROUTES } from "../../utils/constants";
import { DURATION, INSTANT, tween } from "../../theme/motion";
import { Button, GlassCard, SectionHeading } from "../../components/ui";
import LegalNote from "../../components/brand/LegalNote";
import CrossSell from "../../components/cart/CrossSell";
import QuantityStepper from "../../components/storefront/QuantityStepper";
import styles from "./Cart.module.css";

// =============================================================================
// /cart — the full page the tray's "View cart" points at
// =============================================================================
//
// The drawer answers "what did I just add?"; this page answers "is this the
// order I want to place?". Same lines, same code field, same suggestion — more
// room, and a summary that stays in view while the list is edited.
//
// ONE ROW ANATOMY, TWO SURFACES. The line here is the tray's line at a larger
// scale: a plate, the name as a link, the variant, the unit price, a
// QuantityStepper, the line total, and one remove. It is deliberately NOT a
// second component — the drawer's row is 72px of plate inside 440px of tray and
// this one is 96px inside a 1.4fr column, and a single component parameterised
// over both would be two layouts wearing one name.
//
// WHAT IS SHARED IS SHARED PROPERLY: "Complete your ritual" is
// `components/cart/CrossSell`, extracted from the drawer by this prompt, and
// the coupon disclosure is the drawer's, gesture for gesture — collapsed until
// asked for, held open while it has something unread to say.
//
// NO TOTAL. Subtotal, the coupon's discount, and one line saying shipping and
// taxes are calculated at checkout — the same refusal the tray makes, for the
// same reason: this page does not know the delivery address, and a "Total" that
// quietly omits delivery is a number the shopper is asked to beat one screen
// later.
//
// THE MOBILE CTA IS A STICKY BAR and the BottomNav stands down on /cart, the
// way it already does on a product page (components/BottomNav/BottomNav.js).
// Two 64px bars on a 640px screen leave the tab labels reading as part of the
// Checkout control; stacking them and duplicating the CTA was the alternative,
// and it costs 128px of a phone to say one thing twice.
// =============================================================================

/** The plate image for a cart LINE, which stores a bare URL and nothing else. */
const lineThumb = (item) =>
  item?.image
    ? cld(item.image, { w: 240, ar: "1:1", pad: true })
    : PLACEHOLDER_IMG;

/** The stepper's ceiling: real stock when the line carries it, else none. */
const stockCap = (item) =>
  typeof item?.stock === "number" && item.stock > 0 ? item.stock : Infinity;

// Discount for an applied coupon at the current subtotal. Derived (never
// stored), so qty changes can't leave a stale amount and re-applying a coupon
// can't stack. Mirrors CartDrawer's and Checkout's, so all three agree.
const couponDiscountFor = (coupon, amount) => {
  if (!coupon) return 0;
  const raw =
    coupon.type === "percentage"
      ? Math.round((amount * coupon.value) / 100)
      : coupon.value;
  const cap = coupon.maxDiscount || Infinity;
  return Math.max(0, Math.min(raw, cap, amount));
};

const Cart = () => {
  useSeo({ title: "Your cart", noindex: true });

  const reduceMotion = useReducedMotion();
  const { formatPrice } = useStoreSettings();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
  } = useCart();

  const cart = useMemo(() => cartItems || [], [cartItems]);
  const itemCount = getCartItemCount ? getCartItemCount() : 0;
  const subtotal = getCartTotal ? getCartTotal() : 0;
  const isEmpty = cart.length === 0;

  const couponPanelId = useId();

  // ---- Coupon state (the drawer's, gesture for gesture) --------------------
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponNote, setCouponNote] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [applying, setApplying] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);

  // A message the shopper has not read yet keeps its own panel open — a code
  // that was dropped for falling under its minimum must not be explained
  // behind a collapsed disclosure.
  const couponPanelOpen = couponOpen || Boolean(couponError || couponNote);
  const couponDiscount = couponDiscountFor(couponApplied, subtotal);

  // ---- The catalogue, for the suggestion ----------------------------------
  const [catalogue, setCatalogue] = useState([]);

  useEffect(() => {
    let cancelled = false;
    apiService.products
      .getAll()
      .then((rows) => {
        if (!cancelled) setCatalogue(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        // A suggestion nobody can make is a section that does not render.
        if (!cancelled) setCatalogue([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // A coupon only stays applied while the cart still meets its minimum — drop
  // it (with a note) if the subtotal falls below, mirroring the drawer.
  useEffect(() => {
    if (couponApplied && subtotal < (couponApplied.minOrderAmount || 0)) {
      const { code, minOrderAmount } = couponApplied;
      setCouponApplied(null);
      setCouponCode("");
      setCouponError("");
      setCouponNote(
        `${code} was removed — it needs a minimum order of ${formatPrice(
          minOrderAmount
        )}.`
      );
    }
  }, [subtotal, couponApplied, formatPrice]);

  const applyCoupon = async () => {
    setCouponError("");
    setCouponNote("");
    const code = couponCode.trim();
    if (!code) {
      setCouponError("Enter a code first.");
      return;
    }
    setApplying(true);
    try {
      const coupon = await apiService.coupons.validate(code, subtotal);
      setCouponApplied(coupon);
      setCouponError("");
    } catch (error) {
      setCouponApplied(null);
      setCouponError(error.message || "That code isn't valid.");
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
    setCouponNote("");
  };

  const toggleCoupon = useCallback(() => {
    const next = !couponPanelOpen;
    setCouponOpen(next);
    if (!next) {
      setCouponError("");
      setCouponNote("");
    }
  }, [couponPanelOpen]);

  // Rows arrive quietly and leave by collapsing their own height, so the list
  // closes the gap instead of jumping. The drawer's `lineMotion`, at page scale.
  const lineMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: INSTANT },
        exit: { opacity: 0, height: 0, transition: INSTANT },
      }
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0, transition: tween(DURATION.base) },
        exit: {
          opacity: 0,
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          overflow: "hidden",
          transition: tween(DURATION.base),
        },
      };

  // ═══════════════════════════════════════════════════════════════════════════
  // EMPTY — one card, one way forward, and the house's opening suggestion
  // ═══════════════════════════════════════════════════════════════════════════
  if (isEmpty) {
    return (
      <div className={styles.page}>
        <section className={`sf-section ${styles.head}`}>
          <div className="sf-container">
            <SectionHeading
              as="h1"
              eyebrow="Your cart is empty"
              title="Your cart"
              lede="Nothing chosen yet."
            />
            {/* Prompt 31 formalises this as `ui/EmptyState`; until then it is
                the card that state will be built from. */}
            <GlassCard padding="lg" glow="gold" className={styles.empty}>
              <p className={styles.emptyLine}>
                Your cart is waiting for its first ritual.
              </p>
              <Button variant="primary" to={ROUTES.SHOP} className={styles.emptyCta}>
                Continue shopping
              </Button>
            </GlassCard>
            <CrossSell
              products={catalogue}
              items={cart}
              limit={2}
              variant="page"
              headingLevel="h2"
              className={styles.cross}
            />
          </div>
        </section>
      </div>
    );
  }

  const summaryCard = (
    <GlassCard strong padding="lg" className={styles.summaryCard}>
      <h2 className={styles.summaryTitle}>Order summary</h2>

      <div className={styles.summaryRow}>
        <span>Subtotal</span>
        <span className={styles.summaryValue}>{formatPrice(subtotal)}</span>
      </div>

      {/* ---- Code — the drawer's disclosure, unchanged ------------------- */}
      <div className={styles.coupon}>
        {couponApplied ? (
          <div className={styles.couponChip}>
            <Icon icon="mdi:ticket-confirmation-outline" aria-hidden="true" />
            <span className={styles.couponCode}>{couponApplied.code}</span>
            <span className={styles.couponValue}>
              &minus;{formatPrice(couponDiscount)}
            </span>
            <Button
              variant="icon"
              size="sm"
              icon="mdi:close"
              srLabel={`Remove code ${couponApplied.code}`}
              className={styles.couponRemove}
              onClick={removeCoupon}
            />
          </div>
        ) : (
          <>
            <button
              type="button"
              className={styles.couponToggle}
              aria-expanded={couponPanelOpen}
              aria-controls={couponPanelId}
              onClick={toggleCoupon}
            >
              <span>Have a code?</span>
              <Icon
                icon="mdi:chevron-down"
                className={styles.couponChevron}
                aria-hidden="true"
              />
            </button>
            <div
              id={couponPanelId}
              className={styles.couponPanel}
              hidden={!couponPanelOpen}
            >
              <div className={styles.couponField}>
                <input
                  type="text"
                  className={styles.couponInput}
                  placeholder="Enter code"
                  value={couponCode}
                  aria-label="Discount code"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck="false"
                  onChange={(event) => {
                    setCouponCode(event.target.value.toUpperCase());
                    setCouponError("");
                    setCouponNote("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applyCoupon();
                  }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className={styles.couponApply}
                  loading={applying}
                  disabled={applying || !couponCode.trim()}
                  onClick={applyCoupon}
                >
                  Apply
                </Button>
              </div>
              {couponError ? (
                <p className={styles.couponError} role="alert">
                  <Icon icon="mdi:alert-circle-outline" aria-hidden="true" />
                  {couponError}
                </p>
              ) : null}
              {couponNote ? (
                <p className={styles.couponNote} role="status">
                  {couponNote}
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>

      {couponDiscount > 0 ? (
        <div className={styles.summaryRow}>
          <span>Discount ({couponApplied.code})</span>
          <span className={`${styles.summaryValue} ${styles.summarySaving}`}>
            &minus;{formatPrice(couponDiscount)}
          </span>
        </div>
      ) : null}

      <p className={styles.summaryNote}>
        Shipping and taxes calculated at checkout
      </p>

      <div className={styles.summaryActions}>
        <Button variant="primary" block to={ROUTES.CHECKOUT}>
          Checkout
        </Button>
        <Button variant="ghost" block to={ROUTES.SHOP}>
          Continue shopping
        </Button>
      </div>

      <LegalNote compact className={styles.legal} />
    </GlassCard>
  );

  return (
    <div className={styles.page}>
      <section className={`sf-section ${styles.head}`}>
        <div className="sf-container">
          <SectionHeading
            as="h1"
            eyebrow="Cart"
            title="Your cart"
            lede={`${itemCount} ${itemCount === 1 ? "item" : "items"}`}
          />

          <div className={styles.layout}>
            {/* ---- The lines ------------------------------------------- */}
            <div className={styles.lines}>
              <h2 className="sf-visually-hidden">Items in your cart</h2>
              <ul className={styles.lineList}>
                <AnimatePresence initial={false}>
                  {cart.map((item) => {
                    const href = productPath(item);
                    return (
                      <motion.li
                        key={item.id}
                        className={styles.line}
                        layout={!reduceMotion}
                        {...lineMotion}
                      >
                        <Link
                          to={href}
                          className={`sf-plate ${styles.plate}`}
                          tabIndex={-1}
                          aria-hidden="true"
                        >
                          <img
                            src={lineThumb(item)}
                            alt=""
                            loading="lazy"
                            onError={onImageError}
                          />
                        </Link>

                        <div className={styles.lineBody}>
                          <Link to={href} className={styles.lineName}>
                            {item.name}
                          </Link>
                          {item.variantName ? (
                            <span className={styles.lineVariant}>
                              {item.variantName}
                            </span>
                          ) : null}
                          <span className={styles.lineUnit}>
                            {formatPrice(item.price)} each
                          </span>

                          <div className={styles.lineFoot}>
                            <QuantityStepper
                              value={item.quantity}
                              min={1}
                              max={stockCap(item)}
                              onChange={(next) => updateQuantity(item.id, next)}
                            />
                            <span className={styles.lineTotal}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>

                        {/* Out of the body's flow so the row's height is set by
                            the 96px plate, not by a mark stacked above the
                            stepper. `.lineName` keeps its own right padding, so
                            a long name wraps clear of it rather than under. */}
                        <Button
                          variant="icon"
                          size="sm"
                          icon="mdi:close"
                          srLabel={`Remove ${item.name}`}
                          className={styles.remove}
                          onClick={() => removeFromCart(item.id)}
                        />
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>

              <CrossSell
                products={catalogue}
                items={cart}
                limit={2}
                variant="page"
                headingLevel="h2"
                className={styles.cross}
              />
            </div>

            {/* ---- The summary ----------------------------------------- */}
            <aside className={styles.summary} aria-label="Order summary">
              {summaryCard}
            </aside>
          </div>
        </div>
      </section>

      {/* ---- The thumb rail (≤768px) --------------------------------------
          The BottomNav stands down on /cart, so this is the only bar at the
          foot of the screen and the tab labels never read as part of it. */}
      <div className={`sf-glass sf-glass--strong ${styles.bar}`}>
        <span className={styles.barTotal}>
          <span className={styles.barLabel}>Subtotal</span>
          <span className={styles.barValue}>{formatPrice(subtotal)}</span>
        </span>
        <Button variant="primary" to={ROUTES.CHECKOUT} className={styles.barCta}>
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default Cart;
