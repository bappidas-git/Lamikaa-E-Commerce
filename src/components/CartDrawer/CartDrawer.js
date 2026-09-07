import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useCart } from "../../hooks/useCart";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import apiService from "../../services/api";
import {
  buildCartItem,
  onImageError,
  PLACEHOLDER_IMG,
  productPath,
} from "../../utils/helpers";
import { isPriceKnown, resolvePrice, stageSrc } from "../../utils/product";
import { cld } from "../../utils/cloudinary";
import { ROUTES } from "../../utils/constants";
import { DURATION, INSTANT, t, tween } from "../../theme/motion";
import { Button, Drawer, GlassCard } from "../ui";
import QuantityStepper from "../storefront/QuantityStepper";
import styles from "./CartDrawer.module.css";

// =============================================================================
// CartDrawer — the glass tray
// =============================================================================
//
// A 440px tray on `ui/Drawer`: a 64px masthead with the count, a scrolling body
// (free-shipping meter → lines → "Complete your ritual" → a code → the money)
// and a pinned foot carrying the two ways out.
//
// IT IS `ui/Drawer` NOW (Prompt 12). The hand-rolled focus trap, the Escape
// handler, the `document.body.style.overflow` lock and the tab-cycling
// FOCUSABLE_SELECTOR this file used to carry are the primitive's — including
// the reference counting that stops a modal opening over the tray from
// unlocking the page early, and the `body[data-drawer-open]` flag the sticky
// header reads to drop its own blur (DESIGN_SYSTEM §4: two blurred layers,
// ever). THE PUBLIC PROPS ARE UNCHANGED: Header still mounts
// `<CartDrawer open onClose />`, and `addToCart` still opens it.
//
// NO SHIPPING FIGURE IS INVENTED HERE. The old tray quoted a hard-coded ₹99
// flat rate and raced a meter towards a hard-coded ₹999 the store had never
// committed to. Both are gone. The bar the meter races towards is the lowest
// `freeAbove` across the ACTIVE shipping methods, read live from
// `shipping.getMethods()`; when no method sets one there is no meter at all.
// The delivery CHARGE is not previewed in the tray in any form — checkout owns
// it, because checkout is the first screen that knows the address.
//
// THE MONEY IS DELIBERATELY NOT A TOTAL. Subtotal, the coupon's discount, any
// real compare-at saving, and then one line saying shipping and taxes are
// calculated at checkout. A "Total" that silently excludes delivery is a
// number the shopper will be asked to beat two screens later.
// =============================================================================

// Discount for an applied coupon at the current subtotal. Derived (never
// stored), so qty changes can't leave a stale amount and re-applying a coupon
// can't stack. Mirrors Checkout's couponDiscountFor so the drawer and Checkout
// always agree on the number.
const couponDiscountFor = (coupon, amount) => {
  if (!coupon) return 0;
  const raw =
    coupon.type === "percentage"
      ? Math.round((amount * coupon.value) / 100)
      : coupon.value;
  const cap = coupon.maxDiscount || Infinity;
  return Math.max(0, Math.min(raw, cap, amount));
};

/**
 * The free-shipping bar the store has actually committed to: the LOWEST
 * positive `freeAbove` across the active shipping methods, or null when no
 * method sets one. Same rule as `resolveTrustBadgeDetail` in theme/tokens.js,
 * so the meter, the trust badge and the shared copy can never quote different
 * figures. null means UNKNOWN — never "free", and never a bar of zero.
 */
export const freeShippingThreshold = (methods) => {
  const bars = (Array.isArray(methods) ? methods : [])
    .filter((method) => method && method.isActive !== false)
    .map((method) => Number(method.freeAbove))
    .filter((value) => Number.isFinite(value) && value > 0);
  return bars.length ? Math.min(...bars) : null;
};

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

/** The plate image for a cart LINE, which stores a bare URL and nothing else. */
const lineThumb = (item) =>
  item?.image
    ? cld(item.image, { w: 160, ar: "1:1", pad: true })
    : PLACEHOLDER_IMG;

/** The stepper's ceiling: real stock when the line carries it, else none. */
const stockCap = (item) =>
  typeof item?.stock === "number" && item.stock > 0 ? item.stock : Infinity;

const CartDrawer = ({ open, onClose }) => {
  const reduceMotion = useReducedMotion();
  const { formatPrice } = useStoreSettings();
  const {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
  } = useCart();

  const cart = useMemo(() => cartItems || [], [cartItems]);
  const cartCount = getCartItemCount ? getCartItemCount() : 0;
  const subtotal = getCartTotal ? getCartTotal() : 0;
  const isEmpty = cart.length === 0;

  const close = useCallback(() => onClose?.(), [onClose]);

  const couponPanelId = useId();
  const crossSellId = useId();

  // ---- Coupon state --------------------------------------------------------
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

  // Line savings = summed (comparePrice − price) across lines, computed only
  // from real comparePrice values (never fabricated).
  const lineSavings = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const compare = Number(item.comparePrice) || 0;
        return compare > item.price
          ? sum + (compare - item.price) * item.quantity
          : sum;
      }, 0),
    [cart]
  );

  // ---- Live shipping + catalogue ------------------------------------------
  // Both reads are made ONCE and cached in a ref for the life of the mount —
  // Header keeps this component mounted for the whole session, so opening the
  // tray forty times costs one request each. A FAILED read clears its own cache
  // so a later open may retry; a successful one never refetches.
  const shippingRef = useRef(null);
  const catalogueRef = useRef(null);
  const [freeAbove, setFreeAbove] = useState(null);
  const [catalogue, setCatalogue] = useState([]);

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;

    if (!shippingRef.current) {
      shippingRef.current = apiService.shipping
        .getMethods()
        .then((rows) => (Array.isArray(rows) ? rows : []))
        .catch(() => {
          shippingRef.current = null;
          return [];
        });
    }
    const shipping = shippingRef.current;
    shipping.then((rows) => {
      if (!cancelled) setFreeAbove(freeShippingThreshold(rows));
    });

    if (!catalogueRef.current) {
      catalogueRef.current = apiService.products
        .getAll()
        .then((rows) => (Array.isArray(rows) ? rows : []))
        .catch(() => {
          catalogueRef.current = null;
          return [];
        });
    }
    const products = catalogueRef.current;
    products.then((rows) => {
      if (!cancelled) setCatalogue(rows);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  // ---- Free-shipping meter -------------------------------------------------
  const hasMeter = Number.isFinite(freeAbove) && freeAbove > 0;
  const awayFromFree = hasMeter ? Math.max(0, freeAbove - subtotal) : 0;
  const meterValue = hasMeter ? Math.min(subtotal, freeAbove) : 0;
  const meterPercent = hasMeter ? (meterValue / freeAbove) * 100 : 0;

  // ---- Cross-sell ----------------------------------------------------------
  const crossSell = useMemo(
    () => crossSellFor(catalogue, cart, 2),
    [catalogue, cart]
  );

  // A coupon only stays applied while the cart still meets its minimum — drop
  // it (with a note) if the subtotal falls below, mirroring Checkout.
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

  // Adding from the cross-sell must not close the tray or re-open it — the
  // shopper is already looking at the thing they just changed.
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

  // ---------------------------------------------------------------------------
  // MOTION — the tray is the primitive's `panel(reduce, "right")`. Rows arrive
  // quietly and leave by collapsing their own height over the base tier, so the
  // list closes the gap instead of jumping; `opacity: 0` takes the row's
  // hairline with it, which a zero-height row would otherwise keep for a frame.
  // ---------------------------------------------------------------------------
  const lineMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: INSTANT },
        exit: { opacity: 0, height: 0, transition: INSTANT },
      }
    : {
        initial: { opacity: 0, x: 16 },
        animate: { opacity: 1, x: 0, transition: tween(DURATION.base) },
        exit: {
          opacity: 0,
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          overflow: "hidden",
          transition: tween(DURATION.base),
        },
      };

  const suggestions = crossSell.length ? (
    <section className={styles.cross} aria-labelledby={crossSellId}>
      <h3 id={crossSellId} className={`sf-eyebrow ${styles.eyebrow}`}>
        {isEmpty ? "Start with" : "Complete your ritual"}
      </h3>
      <ul className={styles.crossList}>
        {crossSell.map((product) => {
          const href = productPath(product);
          const { price } = resolvePrice(product);
          return (
            <li key={product.id} className={styles.crossRow}>
              {/* The plate repeats the destination of the name beside it, so it
                  is taken out of the tab ring rather than doubling every stop. */}
              <Link
                to={href}
                className={`sf-plate ${styles.crossPlate}`}
                onClick={close}
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
              <span className={styles.crossBody}>
                <Link to={href} className={styles.crossName} onClick={close}>
                  {product.name}
                </Link>
                <span className={styles.crossPrice}>{formatPrice(price)}</span>
              </span>
              <Button
                variant="secondary"
                size="sm"
                className={styles.crossAdd}
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
  ) : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="right"
      width="min(100vw, 440px)"
      className={styles.panel}
      title={
        <span className={styles.heading}>
          Your cart
          {cartCount > 0 ? (
            <span className={styles.count}>
              {cartCount}
              <span className="sf-visually-hidden">
                {cartCount === 1 ? " item" : " items"}
              </span>
            </span>
          ) : null}
        </span>
      }
      footer={
        // An empty cart has nothing to check out and no cart page worth
        // visiting; its own card carries the one way forward instead.
        isEmpty ? null : (
          <>
            <Button
              variant="primary"
              block
              to={ROUTES.CHECKOUT}
              onClick={close}
            >
              Checkout
            </Button>
            <Button variant="ghost" block to={ROUTES.CART} onClick={close}>
              View cart
            </Button>
            <p className={styles.secure}>
              <Icon icon="mdi:lock-outline" aria-hidden="true" />
              Secure checkout
            </p>
          </>
        )
      }
    >
      {isEmpty ? (
        <div className={styles.emptyWrap}>
          <GlassCard padding="lg" glow="gold" className={styles.empty}>
            <p className={`sf-eyebrow ${styles.eyebrow}`}>Your cart is empty</p>
            <p className={styles.emptyLine}>Nothing chosen yet.</p>
            <Button
              variant="primary"
              to={ROUTES.SHOP}
              onClick={close}
              className={styles.emptyCta}
            >
              Shop the Black Rice Range
            </Button>
          </GlassCard>
          {suggestions}
        </div>
      ) : (
        <>
          {/* ---- Free-shipping meter — rendered only when a shipping method
                  actually sets a bar to race towards. ------------------------ */}
          {hasMeter ? (
            <div className={styles.meter}>
              <p className={styles.meterText}>
                {awayFromFree > 0 ? (
                  <>
                    <strong className={styles.meterAmount}>
                      {formatPrice(awayFromFree, { decimals: 0 })}
                    </strong>{" "}
                    away from free shipping
                  </>
                ) : (
                  "You’ve unlocked free shipping"
                )}
              </p>
              <div
                className={styles.meterTrack}
                role="progressbar"
                aria-label="Progress towards free shipping"
                aria-valuemin={0}
                aria-valuemax={Math.round(freeAbove)}
                aria-valuenow={Math.round(meterValue)}
                aria-valuetext={
                  awayFromFree > 0
                    ? `${formatPrice(awayFromFree, {
                        decimals: 0,
                      })} away from free shipping`
                    : "Free shipping unlocked"
                }
              >
                <motion.span
                  className={styles.meterFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${meterPercent}%` }}
                  transition={t(reduceMotion, DURATION.slow)}
                />
              </div>
            </div>
          ) : null}

          {/* ---- Lines --------------------------------------------------- */}
          <ul className={styles.lines}>
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
                      onClick={close}
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
                      <Link
                        to={href}
                        className={styles.lineName}
                        onClick={close}
                      >
                        {item.name}
                      </Link>

                      {item.variantName ? (
                        <span className={styles.lineVariant}>
                          {item.variantName}
                        </span>
                      ) : null}

                      <div className={styles.lineFoot}>
                        <QuantityStepper
                          size="sm"
                          value={item.quantity}
                          min={1}
                          max={stockCap(item)}
                          onChange={(next) => updateQuantity(item.id, next)}
                        />
                        <span className={styles.linePrices}>
                          <span className={styles.lineUnit}>
                            {formatPrice(item.price)} each
                          </span>
                          <span className={styles.lineTotal}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Taken out of the body's flow so the row's height is set
                        by the 72px plate, not by a 36px mark stacked above the
                        stepper. `.lineName` keeps its own right padding, so a
                        long name wraps clear of it rather than under it. */}
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

          {suggestions}

          {/* ---- Code ---------------------------------------------------- */}
          <div className={styles.coupon}>
            {couponApplied ? (
              <div className={styles.couponChip}>
                <Icon
                  icon="mdi:ticket-confirmation-outline"
                  aria-hidden="true"
                />
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

          {/* ---- The money ----------------------------------------------- */}
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span className={styles.summaryValue}>
                {formatPrice(subtotal)}
              </span>
            </div>
            {couponDiscount > 0 ? (
              <div className={styles.summaryRow}>
                <span>Discount ({couponApplied.code})</span>
                <span
                  className={`${styles.summaryValue} ${styles.summarySaving}`}
                >
                  &minus;{formatPrice(couponDiscount)}
                </span>
              </div>
            ) : null}
            {lineSavings > 0 ? (
              <div className={styles.summaryRow}>
                <span>You save</span>
                <span
                  className={`${styles.summaryValue} ${styles.summarySaving}`}
                >
                  &minus;{formatPrice(lineSavings)}
                </span>
              </div>
            ) : null}
            <p className={styles.summaryNote}>
              Shipping and taxes calculated at checkout
            </p>
          </div>
        </>
      )}
    </Drawer>
  );
};

export default CartDrawer;
