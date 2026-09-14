// =============================================================================
// RETURNS — one vocabulary, one arithmetic
// =============================================================================
//
// A return is raised in one place and worked in another: the shopper asks for
// it from My Orders, the admin approves, collects, receives and refunds it in
// Admin → Returns. Both screens therefore have to agree about three things, and
// none of them can be written down twice:
//
//   THE REASONS      the customer picks a code; the admin reads it back. Two
//                    lists would let a shopper file `size_issue` onto a screen
//                    that only knows `wrong_size` and render a raw slug.
//   THE STATUSES     the seven states a return passes through, and the word for
//                    each. The admin colours them with MUI palette keys, the
//                    storefront with the semantic `Chip` tones — so each state
//                    carries BOTH, and the label stays single.
//   THE MONEY        what a set of picked lines is actually worth back, net of
//                    any coupon the order carried. The refund the shopper is
//                    quoted must be the refund the admin is asked to approve.
//
// Nothing here talks to the network or to React: it is the shared meaning the
// two screens import.
// =============================================================================

/** Why the parcel is coming back. The customer picks one; the admin reads it. */
export const RETURN_REASONS = [
  { value: "defective", label: "Defective / Damaged" },
  { value: "wrong_item", label: "Wrong Item Received" },
  { value: "not_as_described", label: "Not As Described" },
  { value: "size_issue", label: "Size / Fit Issue" },
  { value: "changed_mind", label: "Changed Mind" },
  { value: "other", label: "Other" },
];

/** Where the money goes back to. */
export const REFUND_METHODS = [
  { value: "original_payment", label: "Original Payment Method" },
  { value: "store_credit", label: "Store Credit" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "upi", label: "UPI" },
];

/**
 * The two a SHOPPER may choose between. Bank transfer and UPI are settlement
 * routes the desk picks when the original method can no longer take the money
 * (an expired card, a closed wallet) — they need account details nobody should
 * be asked to type into a return form, so they stay admin-only.
 */
export const CUSTOMER_REFUND_METHODS = REFUND_METHODS.filter((m) =>
  ["original_payment", "store_credit"].includes(m.value)
);

/**
 * Every state a return can be in.
 *   `label`  the word both screens print
 *   `color`  a MUI palette key, for the admin's <Chip color>
 *   `tone`   a semantic storefront tone, for `ui/Chip variant="status"`
 *   `open`   still in flight — neither refunded nor rejected
 */
export const RETURN_STATUS = {
  requested: { label: "Requested", color: "warning", tone: "warning", open: true },
  approved: { label: "Approved", color: "info", tone: "info", open: true },
  pickup_scheduled: { label: "Pickup Scheduled", color: "info", tone: "info", open: true },
  in_transit: { label: "In Transit", color: "primary", tone: "info", open: true },
  rejected: { label: "Rejected", color: "error", tone: "danger", open: false },
  received: { label: "Received", color: "secondary", tone: "info", open: true },
  refunded: { label: "Refunded", color: "success", tone: "success", open: false },
};

/** The config for a status string, never undefined. */
export const returnStatusInfo = (status) =>
  RETURN_STATUS[status] || {
    label: String(status || "Unknown").replace(/_/g, " "),
    color: "default",
    tone: "info",
    open: true,
  };

/** A reason code in words — falls back to the de-slugged code. */
export const reasonLabel = (value) =>
  RETURN_REASONS.find((r) => r.value === value)?.label ||
  String(value || "").replace(/_/g, " ");

/** A refund method in words — falls back to the de-slugged code. */
export const methodLabel = (value) =>
  REFUND_METHODS.find((m) => m.value === value)?.label ||
  String(value || "").replace(/_/g, " ");

/**
 * The identity of an ORDER LINE across the order and every return raised
 * against it. A product bought in two variants is two lines, so the variant has
 * to be part of the key — otherwise returning one would lock the other.
 */
export const lineKey = (item) =>
  `${item?.productId ?? item?.id ?? "?"}::${item?.variantId ?? ""}`;

/**
 * A return still counts against the order unless it was REJECTED — a rejected
 * request releases its units so the customer can ask again (with a better
 * reason, or for the right line).
 */
export const countsAgainstOrder = (ret) => ret?.status !== "rejected";

/**
 * How many units of each order line are already spoken for by earlier returns.
 * `returns` is this customer's rows; only those against `orderId` are counted.
 * Returns a plain object keyed by `lineKey`.
 */
export const returnedUnitsByLine = (returns, orderId) => {
  const out = {};
  (returns || [])
    .filter((r) => countsAgainstOrder(r) && String(r.orderId) === String(orderId))
    .forEach((r) => {
      (r.items || []).forEach((it) => {
        const k = lineKey(it);
        out[k] = (out[k] || 0) + (Number(it.quantity) || 0);
      });
    });
  return out;
};

/**
 * Allocate the order's coupon discount proportionally to the selected items so
 * the refund reflects what the customer actually PAID (net), not the pre-coupon
 * list price. A full return refunds the whole discount back out; a partial one
 * only the returned items' share.
 *
 * `picks` is parallel to `items`: `[{ checked, quantity }, …]`.
 * Returns `{ gross, discountShare, net }`.
 */
export const netRefundForItems = (order, picks, items) => {
  const gross = (items || []).reduce((sum, it, i) => {
    const pick = picks?.[i];
    if (!pick?.checked) return sum;
    return sum + (Number(it.price) || 0) * (Number(pick.quantity) || 0);
  }, 0);
  const orderSubtotal = Number(order?.subtotal) || 0;
  const orderDiscount = Number(order?.discountAmount) || 0;
  const discountShare =
    orderSubtotal > 0 && orderDiscount > 0
      ? Math.min(gross, Math.round((gross / orderSubtotal) * orderDiscount))
      : 0;
  return { gross, discountShare, net: Math.max(0, gross - discountShare) };
};

/**
 * What the customer actually gets: the requested refund MINUS whatever the desk
 * deducted on inspection (a restocking or shipping fee). `refundAmount` is the
 * ASK, never the settlement — printing it after a deduction tells the shopper
 * they were paid more than they were, which is the one number on this screen
 * they will check against their bank.
 */
export const payableRefund = (ret, deduction = ret?.deductionAmount) =>
  Math.max(0, (Number(ret?.refundAmount) || 0) - (Number(deduction) || 0));

/**
 * Does this return cover every unit the order carried? Drives the admin's
 * coupon-restoration note.
 */
export const isFullReturn = (ret, order) => {
  if (!ret || !order) return false;
  const ordered = (order.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  const returned = (ret.items || []).reduce((s, it) => s + (Number(it.quantity) || 0), 0);
  return ordered > 0 && returned >= ordered;
};
