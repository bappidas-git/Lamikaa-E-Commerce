// =============================================================================
// ORDER CONFIRMATION  —  the thank-you moment
// =============================================================================
// The quiet end of the flow. A gold seal, a serif thank-you addressed by name,
// one warm line, then the order said back plainly: number, date, arrival, lines,
// money, address, payment.
//
// WHAT IS DERIVED, NEVER DECORATED
//   • The money ledger is the placed order's own numbers, in the order the
//     order records them — Subtotal, Discount, Shipping, Tax, Total, and then
//     Store Credit + Amount Paid only when credit was actually spent.
//   • The payment chip's LABEL comes from `order.paymentStatus`, never from a
//     hardcoded "successful"; its TONE follows that label (a refund is not a
//     failure, so it reads neutral rather than red).
//   • The lede follows the same real state, so a failed or refunded order is
//     never congratulated for a payment that did not happen.
//   • Arrival is `createdAt + 5 days` and is LABELLED an estimate, unless the
//     order has actually been delivered — then it is the real `deliveredAt`.
//   • "Download invoice" builds the document from the order already on the
//     page and hands it to the browser's print dialog, where "Save as PDF" is
//     the download. No gateway, no round trip, no new dependency.
//
// THE THREE OTHER STATES (Prompt 31)
//   Loading is the page's own silhouette in `Skeleton` — never a spinner, so
//   the layout settles once rather than twice. A FAILED READ is `ErrorState`
//   with the retry, and a MISSING order is `EmptyState`: a dropped request must
//   never be reported as "no such order", because the two ask for completely
//   different things from the person reading them.
//
// MOTION
//   One-shot confetti — a brief gold shimmer, guarded by `confettiFiredRef` and
//   skipped entirely under `prefers-reduced-motion`. The seal's own flourish is
//   CSS and purely additive: its resting state is its finished state.
//
// Nothing is read from ThemeContext: there is one theme, and the `color-scheme`
// hint that makes native scrollbars and controls render dark is global.
// =============================================================================

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import apiService from "../../services/api";
import {
  formatCurrency,
  formatDate,
  normalizeOrderAddress,
  onImageError,
  PLACEHOLDER_IMG,
} from "../../utils/helpers";
import {
  Button,
  Chip,
  EmptyState,
  ErrorState,
  GlassCard,
  GlowWrap,
  Skeleton,
} from "../../components/ui";
import { ROUTES } from "../../utils/constants";
import brand from "../../config/brand";
import useSeo from "../../hooks/useSeo";
import styles from "./OrderConfirmation.module.css";

// The one documented hex exception on this page: canvas-confetti paints to a
// <canvas>, so it cannot read CSS custom properties. These are the storefront's
// own accents, copied from src/theme/storefront-tokens.css — keep in sync:
//   #F5D76E  --sf-color-gold         (champagne gold)
//   #FFEFA6  --sf-color-gold-light   (the lifted highlight)
//   #FF4FD8  --sf-color-pink         (neon pink)
//   #8B5CF6  --sf-color-violet       (neon violet)
// Gold leads and the two neons flicker through it — the signature gradient,
// scattered. Every one of them reads on the #0B0B0D ground.
const CONFETTI_COLORS = ["#F5D76E", "#FFEFA6", "#FF4FD8", "#8B5CF6"];

// The customer's own name, taken off the order so it works for guests and for
// a deep-linked order alike. Returns "" when the order carries no name.
const firstNameOf = (order) => {
  const raw =
    order?.shippingAddress?.firstName ||
    order?.billingAddress?.firstName ||
    normalizeOrderAddress(order?.shippingAddress)?.name ||
    normalizeOrderAddress(order?.billingAddress)?.name ||
    "";
  return String(raw).trim().split(/\s+/)[0] || "";
};

/** The page frame every branch renders inside, so a state is still the page. */
const Page = ({ children, narrow = false }) => (
  <div className={styles.page}>
    <div className={`${styles.container} ${narrow ? styles.containerNarrow : ""}`}>
      {children}
    </div>
  </div>
);

const OrderConfirmation = () => {
  useSeo({
    title: "Order confirmed",
    description: "Thank you — your LAMIKAA Naturals order is confirmed.",
    noindex: true,
  });

  const { orderNumber } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [copied, setCopied] = useState(false);
  // Guards the celebratory confetti to a single one-shot burst per mount.
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  // One-shot gold shimmer on first successful load. Fired from an effect so it
  // never blocks render, and skipped entirely when the user prefers reduced
  // motion. Low count, low velocity, small scalar — a seal being stamped, not
  // a party popper.
  useEffect(() => {
    if (!order || confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReducedMotion) return;
    confetti({
      particleCount: 34,
      spread: 58,
      startVelocity: 26,
      gravity: 0.85,
      decay: 0.92,
      scalar: 0.8,
      ticks: 140,
      origin: { y: 0.32 },
      colors: CONFETTI_COLORS,
      disableForReducedMotion: true,
    });
    // canvas-confetti appends its own fixed, full-viewport <canvas> to <body>,
    // outside every landmark and with no way to configure attributes on it. To
    // assistive tech that is a stray region of unclassified content sitting
    // over the page; it is pure decoration, so label it as such once it exists.
    const shimmer = document.querySelector("body > canvas");
    if (shimmer) {
      shimmer.setAttribute("aria-hidden", "true");
      shimmer.setAttribute("role", "presentation");
    }
  }, [order]);

  const fetchOrder = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const response = await apiService.orders.getByOrderNumber(orderNumber);
      const data = response?.data || response?.order || response;
      setOrder(data || null);
    } catch (err) {
      // A failed request is not "order not found" — offer a retry instead.
      console.error("Failed to fetch order:", err);
      setOrder(null);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOrderNumber = () => {
    const text = order?.orderNumber || orderNumber;
    // Only claim "Copied" once the write has actually resolved. An unfocused
    // tab or an insecure context rejects, and announcing a copy that never
    // happened would be a lie the customer only finds out about on paste.
    const write = navigator.clipboard?.writeText(text);
    if (!write) return;
    write
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Clipboard write failed:", err));
  };

  const formatDeliveryDate = (date) =>
    date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getEstimatedDelivery = () => {
    const created = new Date(order?.createdAt || Date.now());
    const delivery = new Date(created);
    delivery.setDate(delivery.getDate() + 5);
    return formatDeliveryDate(delivery);
  };

  // ── The invoice ───────────────────────────────────────────────────────────
  // Built from the order already on the page — the same lines, the same money,
  // the same addresses — and opened in its own window for the browser's print
  // dialog, where "Save as PDF" is the customer's download. No gateway, no
  // server round trip and no new dependency: everything the document needs has
  // already been fetched.
  //
  // It used to be an alert() reading "Invoice download will be available soon."
  // A button on a paid order that apologises instead of producing the document
  // is worse than no button, so it now produces the document.
  const handleDownloadInvoice = () => {
    if (!order) return;

    const esc = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      }[c]));

    // Derived here rather than read from the render scope: the summary's copies
    // are declared after the early returns, and this closure must not depend on
    // which branch the current render took.
    const tax = order.taxAmount ?? order.tax ?? 0;
    const shipping = order.shippingAmount ?? order.shipping ?? 0;
    const discount = order.discountAmount ?? 0;

    const address = normalizeOrderAddress(order.shippingAddress || order.billingAddress);
    const addressLines = [
      address?.name,
      address?.line1,
      address?.line2,
      [address?.city, address?.state, address?.pincode].filter(Boolean).join(", "),
      address?.country,
      address?.phone,
    ].filter(Boolean);

    const rows = (order.items || [])
      .map(
        (item) => `<tr>
          <td>${esc(item.name)}${item.variantName ? `<br><span class="muted">${esc(item.variantName)}</span>` : ""}</td>
          <td class="num">${esc(item.quantity)}</td>
          <td class="num">${esc(formatCurrency(item.price, item.currency))}</td>
          <td class="num">${esc(formatCurrency(item.price * item.quantity, item.currency))}</td>
        </tr>`
      )
      .join("");

    // Only the lines this order actually has — the same rule the summary on the
    // page follows, so the document never invents a tax or a discount row.
    const totals = [
      ["Subtotal", formatCurrency(order.subtotal)],
      discount > 0 ? ["Discount", `-${formatCurrency(discount)}`] : null,
      ["Shipping", shipping > 0 ? formatCurrency(shipping) : "Free"],
      tax > 0 ? ["Tax", formatCurrency(tax)] : null,
      ["Total", formatCurrency(order.total)],
      order.storeCreditUsed > 0 ? ["Store credit", `-${formatCurrency(order.storeCreditUsed)}`] : null,
      order.storeCreditUsed > 0 ? ["Amount paid", formatCurrency(order.amountPayable ?? order.total)] : null,
    ]
      .filter(Boolean)
      .map(
        ([label, value], index, all) =>
          `<tr class="${index === all.length - 1 ? "grand" : ""}"><th>${esc(label)}</th><td class="num">${esc(value)}</td></tr>`
      )
      .join("");

    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Invoice ${esc(order.orderNumber)} — ${esc(brand.name)}</title>
<style>
  *{box-sizing:border-box}
  body{font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#1c1a17;margin:0;padding:40px;background:#fff}
  .wrap{max-width:760px;margin:0 auto}
  header{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;border-bottom:2px solid #1c1a17;padding-bottom:20px;margin-bottom:28px;flex-wrap:wrap}
  h1{font-size:26px;letter-spacing:.04em;margin:0 0 4px}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:.12em;margin:0 0 8px;color:#6b6257}
  .muted{color:#6b6257;font-size:12px}
  .meta{text-align:right}
  .cols{display:flex;gap:40px;flex-wrap:wrap;margin-bottom:28px}
  .cols>div{flex:1;min-width:220px}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  th,td{padding:9px 8px;text-align:left;border-bottom:1px solid #e6e1d9;vertical-align:top}
  thead th{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#6b6257}
  .num{text-align:right;white-space:nowrap}
  .totals{width:300px;margin-left:auto}
  .totals th{font-weight:400;color:#6b6257;border:0}
  .totals td{border:0}
  .totals .grand th,.totals .grand td{border-top:2px solid #1c1a17;font-weight:700;color:#1c1a17;font-size:16px;padding-top:12px}
  footer{border-top:1px solid #e6e1d9;padding-top:16px;margin-top:32px;font-size:12px;color:#6b6257}
  @media print{body{padding:0}}
</style></head>
<body><div class="wrap">
  <header>
    <div>
      <h1>${esc(brand.name)}</h1>
      <div class="muted">${esc(brand.legalName)}</div>
    </div>
    <div class="meta">
      <h2>Invoice</h2>
      <div><strong>${esc(order.orderNumber)}</strong></div>
      <div class="muted">${esc(formatDate(order.createdAt, "long"))}</div>
    </div>
  </header>
  <div class="cols">
    <div>
      <h2>Billed to</h2>
      ${addressLines.length ? addressLines.map((line) => `<div>${esc(line)}</div>`).join("") : '<div class="muted">—</div>'}
    </div>
    <div>
      <h2>Payment</h2>
      <div>${esc(order.paymentMethod || "—")}</div>
      <div class="muted">${esc(order.paymentStatus || "")}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <table class="totals"><tbody>${totals}</tbody></table>
  <footer>${esc(brand.legalNote)}</footer>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;

    // A blocked pop-up must not fail silently: fall back to printing from a
    // hidden frame in this window, which no blocker can intercept.
    const win = window.open("", "_blank", "noopener,width=880,height=1000");
    if (win) {
      win.document.write(html);
      win.document.close();
      return;
    }
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    frame.srcdoc = html;
    frame.onload = () => {
      // Give the document a tick to lay out before the dialog takes a snapshot,
      // then drop the frame once the dialog has been dismissed.
      setTimeout(() => frame.remove(), 60000);
    };
    document.body.appendChild(frame);
  };

  // ── Loading — the page's own silhouette, never a spinner ──────────────────
  if (loading) {
    return (
      <Page>
        <div className={styles.skeleton} role="status" aria-label="Loading your order">
          <div className={styles.skeletonHead}>
            {/* The seal, the thank-you and its line — at the sizes the real
                ones take, so the page settles once rather than twice. */}
            <Skeleton variant="circle" width="96px" height="96px" />
            <Skeleton variant="block" height="64px" className={styles.skeletonTitle} />
            <Skeleton variant="text" lines={2} className={styles.skeletonLede} />
          </div>
          <Skeleton variant="block" height="168px" className={styles.skeletonRounded} />
          <div className={styles.skeletonGrid}>
            <Skeleton variant="block" height="420px" className={styles.skeletonRounded} />
            <Skeleton variant="block" height="260px" className={styles.skeletonRounded} />
          </div>
        </div>
      </Page>
    );
  }

  // ── Fetch failed — distinct from "not found", so a flaky network never
  //    claims the order doesn't exist ──────────────────────────────────────
  if (fetchError) {
    return (
      <Page narrow>
        <ErrorState
          className={styles.state}
          title="We couldn't load this"
          titleAs="h1"
          text={`Order ${orderNumber} didn't come back to us. Nothing was changed — your order itself is safe.`}
          onRetry={fetchOrder}
          actions={
            <Button variant="ghost" to={ROUTES.ORDERS}>
              View orders
            </Button>
          }
        />
      </Page>
    );
  }

  // ── Order not found ───────────────────────────────────────────────────────
  if (!order) {
    return (
      <Page narrow>
        <EmptyState
          className={styles.state}
          eyebrow="Not on our books"
          title="We couldn't find that order"
          titleAs="h1"
          text={`Nothing here matches ${orderNumber}. It may have been placed in a different session, or signed in as someone else.`}
          icon="mdi:package-variant-closed-remove"
          actions={
            <>
              <Button to={ROUTES.ORDERS}>View orders</Button>
              <Button variant="ghost" to={ROUTES.SHOP}>
                Continue shopping
              </Button>
            </>
          }
        />
      </Page>
    );
  }

  const orderItems = order.items || [];
  // Orders store taxAmount/shippingAmount/discountAmount (the canonical shape
  // checkout writes); older field names are kept as fallbacks.
  const taxAmount = order.taxAmount ?? order.tax ?? 0;
  const shippingAmount = order.shippingAmount ?? order.shipping ?? 0;
  const discountAmount = order.discountAmount ?? 0;
  const shippingAddr = normalizeOrderAddress(order.shippingAddress);
  const isDelivered = order.shippingStatus === "delivered";
  const orderNo = order.orderNumber || orderNumber;
  const firstName = firstNameOf(order);

  // Chip text mirrors the order's real paymentStatus — never a hardcoded
  // "successful". The tone follows the label: a refund is a fact, not a fault,
  // so it reads neutral rather than red.
  const paymentStatusInfo = (() => {
    switch (order.paymentStatus) {
      case "paid":
        return { label: "Payment successful", tone: "success" };
      case "failed":
        return { label: "Payment failed", tone: "danger" };
      case "refunded":
        return { label: "Payment refunded", tone: "info" };
      case "partially_refunded":
        return { label: "Payment partially refunded", tone: "warning" };
      default:
        return {
          label:
            order.paymentMethod === "cod"
              ? "Payment pending — pay on delivery"
              : "Payment pending",
          tone: "warning",
        };
    }
  })();

  // The one warm line, said honestly for the state the order is actually in.
  const lede = (() => {
    switch (order.paymentStatus) {
      case "paid":
        return "Your payment is settled and your order is with our studio now. We'll write to you as soon as it's on its way.";
      case "failed":
        return "Your order is placed, but the payment didn't go through. Write to us and we'll help you settle it.";
      case "refunded":
        return "This order has been refunded in full. Nothing further is owed.";
      case "partially_refunded":
        return "Part of this order has been refunded. The amounts below are the order as it was placed.";
      default:
        return order.paymentMethod === "cod"
          ? "Nothing to pay now — you'll settle the amount when the parcel reaches your door."
          : "Your order is placed. We'll confirm here as soon as the payment settles.";
    }
  })();

  return (
    <Page>
      {/* ── The seal & the thank-you ─────────────────────────────────── */}
      <header className={styles.head}>
        {/* The gold lamp is the seal's own light — one glow, at the top of a
            page that has no other. The ring, the check and the halo are all
            drawn at their finished state; the animation only adds to it. */}
        <GlowWrap tone="gold" intensity={0.22} size={190} className={styles.sealGlow}>
          <span className={styles.seal}>
            <span className={styles.sealRing} aria-hidden="true" />
            <svg
              className={styles.sealCheck}
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="4.5 12.5 9.5 17.5 19.5 6.5" />
            </svg>
            <span className={styles.sealHalo} aria-hidden="true" />
          </span>
        </GlowWrap>

        <p className={`sf-eyebrow ${styles.eyebrow}`}>Order confirmed</p>
        <h1 className={styles.title}>
          {firstName ? `Thank you, ${firstName}` : "Thank you"}
        </h1>
        <p className={styles.lede}>{lede}</p>
      </header>

      {/* ── The record: number, date, arrival ────────────────────────── */}
      <GlassCard
        as="section"
        padding="none"
        glow="gold"
        className={styles.record}
        aria-label="Order record"
      >
        <div className={styles.recordCell}>
          <p className={styles.recordLabel}>Order number</p>
          <div className={styles.recordNumberRow}>
            <span className={styles.recordNumber}>{orderNo}</span>
            <button
              type="button"
              className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ""}`}
              onClick={handleCopyOrderNumber}
              aria-label={`Copy order number ${orderNo}`}
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied
                </>
              ) : (
                "Copy"
              )}
            </button>
          </div>
          <p className={styles.recordMeta}>Placed on {formatDate(order.createdAt)}</p>
          {/* The copy result, announced rather than only coloured. */}
          <span role="status" aria-live="polite" className="sf-visually-hidden">
            {copied ? `Order number ${orderNo} copied to clipboard` : ""}
          </span>
        </div>

        <div className={styles.recordCell}>
          <p className={styles.recordLabel}>
            {isDelivered ? "Delivered" : "Estimated arrival"}
          </p>
          <p className={styles.recordDate}>
            {isDelivered
              ? formatDeliveryDate(new Date(order.deliveredAt || order.updatedAt))
              : getEstimatedDelivery()}
          </p>
          {!isDelivered && (
            <p className={styles.recordNote}>
              An estimate, counted five days from the date you ordered — not a
              guaranteed date.
            </p>
          )}
        </div>
      </GlassCard>

      <div className={styles.grid}>
        <div className={styles.main}>
          {/* ── Order summary ───────────────────────────────────────── */}
          <section aria-labelledby="oc-summary-title">
            <div className={styles.blockHead}>
              <h2 className={styles.blockTitle} id="oc-summary-title">
                Order summary
              </h2>
              <span className={styles.blockCount}>
                {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            <ul className={styles.lines}>
              {orderItems.map((item, index) => (
                <li key={index} className={styles.line}>
                  <span className={`sf-plate ${styles.thumb}`}>
                    <img
                      src={item.image || PLACEHOLDER_IMG}
                      alt={item.name || "Product"}
                      loading="lazy"
                      onError={onImageError}
                    />
                  </span>
                  <div className={styles.lineBody}>
                    <h3 className={styles.lineName}>
                      {item.name || item.productName}
                    </h3>
                    {item.variantName && (
                      <span className={styles.lineVariant}>{item.variantName}</span>
                    )}
                    <span className={styles.lineQty}>Qty {item.quantity}</span>
                  </div>
                  <p className={styles.lineTotal}>
                    {formatCurrency(item.price * item.quantity, item.currency)}
                  </p>
                </li>
              ))}
            </ul>

            {/* The order's own money, in the order the order records it. */}
            <dl className={styles.ledger}>
              <div className={styles.ledgerRow}>
                <dt>Subtotal</dt>
                <dd>{formatCurrency(order.subtotal)}</dd>
              </div>
              {discountAmount > 0 && (
                <div className={`${styles.ledgerRow} ${styles.ledgerDiscount}`}>
                  <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                  <dd>-{formatCurrency(discountAmount)}</dd>
                </div>
              )}
              <div className={styles.ledgerRow}>
                <dt>Shipping</dt>
                <dd>{shippingAmount > 0 ? formatCurrency(shippingAmount) : "Free"}</dd>
              </div>
              <div className={styles.ledgerRow}>
                <dt>Tax</dt>
                <dd>{formatCurrency(taxAmount)}</dd>
              </div>
              <div className={`${styles.ledgerRow} ${styles.ledgerTotal}`}>
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
              {(order.storeCreditUsed ?? 0) > 0 && (
                <>
                  <div className={styles.ledgerRow}>
                    <dt>Store credit</dt>
                    <dd>-{formatCurrency(order.storeCreditUsed)}</dd>
                  </div>
                  <div className={`${styles.ledgerRow} ${styles.ledgerTotal}`}>
                    <dt>Amount paid</dt>
                    <dd>
                      {formatCurrency(
                        order.amountPayable ??
                          Math.max(0, order.total - order.storeCreditUsed)
                      )}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </section>

          {/* ── Shipping address ────────────────────────────────────── */}
          <section aria-labelledby="oc-address-title">
            <div className={styles.blockHead}>
              <h2 className={styles.blockTitle} id="oc-address-title">
                Shipping address
              </h2>
            </div>
            {shippingAddr ? (
              /* A plain block, not <address> — that element is for the page's
                 own contact details, and its UA italic isn't the house voice. */
              <div>
                {shippingAddr.name && (
                  <p className={styles.addrName}>{shippingAddr.name}</p>
                )}
                {shippingAddr.line1 && <p className={styles.addrLine}>{shippingAddr.line1}</p>}
                {shippingAddr.line2 && <p className={styles.addrLine}>{shippingAddr.line2}</p>}
                {shippingAddr.cityLine && <p className={styles.addrLine}>{shippingAddr.cityLine}</p>}
                {shippingAddr.country && <p className={styles.addrLine}>{shippingAddr.country}</p>}
                {shippingAddr.phone && (
                  <p className={styles.addrPhone}>{shippingAddr.phone}</p>
                )}
              </div>
            ) : (
              <p className={styles.muted}>Shipping address not available.</p>
            )}
          </section>
        </div>

        <div className={styles.side}>
          {/* ── Payment ─────────────────────────────────────────────── */}
          <section aria-labelledby="oc-payment-title">
            <div className={styles.blockHead}>
              <h2 className={styles.blockTitle} id="oc-payment-title">
                Payment
              </h2>
            </div>
            <p className={styles.payMethod}>
              {order.paymentMethod
                ? order.paymentMethod.replace(/_/g, " ").toUpperCase()
                : "N/A"}
            </p>
            <Chip variant="status" tone={paymentStatusInfo.tone}>
              {paymentStatusInfo.label}
            </Chip>
          </section>

          {/* ── Actions ─────────────────────────────────────────────── */}
          <div className={styles.actions}>
            <Button to={ROUTES.SHOP} block>
              Continue shopping
            </Button>
            <Button variant="secondary" to={ROUTES.ORDERS} block>
              View orders
            </Button>
            <Button variant="ghost" to={ROUTES.ORDERS} block>
              Track order
            </Button>
            {/* Opens the invoice in the print dialog — "Save as PDF" there is
                the customer's download. */}
            <button type="button" className={styles.invoiceBtn} onClick={handleDownloadInvoice}>
              Download invoice
              <span className={styles.invoiceSoon}>PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default OrderConfirmation;
