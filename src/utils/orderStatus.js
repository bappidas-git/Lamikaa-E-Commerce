// =============================================================================
// ORDER STATUS — one derivation, one vocabulary
// =============================================================================
//
// An order carries three independent server fields — `paymentStatus`,
// `fulfillmentStatus` and `shippingStatus` (the shape Checkout writes and the
// admin manages) — and every customer-facing surface has to collapse them into
// the single word a shopper reads. Order History and the account dashboard used
// to carry a byte-for-byte copy of that collapse each, which is two places for
// one truth: the moment one of them learned about a new state the other quietly
// disagreed about the same order.
//
// So it lives here, once, and both pages import it (Prompt 30).
//
// THE TONE, NOT A CLASS NAME. The old copies mapped a status onto a CSS-module
// class (`statusProcessing`, `statusDelivered` …) which only existed inside the
// page that declared it — the same status therefore had two unrelated names.
// What a status actually has is a SEMANTIC TONE, and the design system already
// names those: --sf-color-warning / -info / -success / -danger, which is exactly
// what `Chip variant="status" tone={…}` consumes. No page needs a class of its
// own any more, and no colour is written down twice.
//
// A legacy bare `status` string is still honoured — but only when none of the
// three canonical fields is present, so a real order is never read from a field
// the server stopped writing. The aliases below (`pending`, `completed`,
// `failed`, `refunded`) are the words such a legacy row can carry.
// =============================================================================

/**
 * The one display status for an order: processing | shipped | delivered |
 * cancelled | returned.
 */
export const deriveOrderStatus = (order) => {
  if (order?.paymentStatus || order?.fulfillmentStatus || order?.shippingStatus) {
    // A returned order is its own outcome — show it honestly rather than
    // collapsing it into "Cancelled" (full refund) or "Delivered" (partial).
    if (order.fulfillmentStatus === "returned") return "returned";
    if (
      order.fulfillmentStatus === "cancelled" ||
      order.paymentStatus === "failed" ||
      order.paymentStatus === "refunded"
    ) {
      return "cancelled";
    }
    if (order.shippingStatus === "delivered") return "delivered";
    if (order.shippingStatus === "shipped") return "shipped";
    return "processing";
  }
  return order?.status || "processing";
};

/**
 * The word and the tone for every status a row can resolve to, canonical and
 * legacy alike. `tone` is a `Chip variant="status"` tone, i.e. one of the
 * semantic tokens; nothing here knows a hex.
 */
export const STATUS_CONFIG = {
  processing: { label: "Processing", tone: "warning" },
  shipped: { label: "Shipped", tone: "info" },
  delivered: { label: "Delivered", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  // A return ends the same way a cancellation does for the shopper — the money
  // comes back — so it wears the same tone under its own word.
  returned: { label: "Returned", tone: "danger" },
  // Legacy `status` values, mapped onto the five above.
  pending: { label: "Processing", tone: "warning" },
  completed: { label: "Delivered", tone: "success" },
  failed: { label: "Cancelled", tone: "danger" },
  refunded: { label: "Cancelled", tone: "danger" },
};

/** The config for a status string, never undefined. */
export const getStatusInfo = (status) =>
  STATUS_CONFIG[status] || STATUS_CONFIG.processing;

/**
 * The config for an ORDER, plus the key it derived from — so a caller that
 * needs both the word and the state (the timeline, the cancel guard) reads the
 * order once.
 */
export const orderStatusInfo = (order) => {
  const status = deriveOrderStatus(order);
  return { status, ...getStatusInfo(status) };
};
