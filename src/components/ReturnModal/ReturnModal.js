import React, { useState, useEffect, useMemo } from "react";
import { Button, Modal } from "../ui";
import CloudinaryImage from "../ui/CloudinaryImage";
import QuantityStepper from "../storefront/QuantityStepper";
import { formatCurrency } from "../../utils/helpers";
import {
  RETURN_REASONS,
  CUSTOMER_REFUND_METHODS,
  netRefundForItems,
  returnedUnitsByLine,
  lineKey,
} from "../../utils/returns";
import styles from "./ReturnModal.module.css";

// =============================================================================
// ReturnModal — the shopper raises the return themselves
// =============================================================================
//
// THE GAP THIS CLOSES. Admin → Returns has always been able to approve, collect,
// receive and refund a return — restocking the inventory, restoring the coupon,
// writing the refund ledger row and depositing store credit. What it never had
// was an INTAKE: the storefront's "Return / exchange" opened a blank contact
// form, so a request became a support lead and never a return. The admin's list
// could therefore only ever be filled by an admin typing an order number in by
// hand, which is why it read "No returns found" with every counter at zero.
// This dialog is the missing half. It writes the same record the admin's own
// "New Return" writes (see `returns.create` in services/api.js), so a shopper's
// request lands in the queue already countable, searchable and actionable.
//
// ELIGIBILITY IS THE CALLER'S. My Orders decides WHO may open this (a delivered
// order, inside the return window); this component is the form and the
// arithmetic.
//
// WHAT IT WILL NOT LET YOU DO. You cannot return more units than you bought,
// and you cannot return the same unit twice — every line is capped at the
// quantity ordered MINUS whatever an earlier, un-rejected return already claimed
// (`returnedUnitsByLine`). A line with nothing left says so and takes itself out
// of the form rather than failing on submit.
//
// THE MONEY IS THE TRUTH. The estimate is `netRefundForItems` — the same
// function the admin's screen quotes — so a coupon's share comes off here
// exactly as it will come off there. The shopper is never quoted a list price
// they will not receive. It is still labelled an estimate: the desk may deduct
// a restocking or shipping fee when the parcel is inspected, and saying that up
// front is cheaper than an argument later.
//
// EVERY DEVICE. The sheet is `ui/Modal`, which is already a full-screen sheet at
// 480px and below; the form inside it is a single column that never sets a
// fixed width, the quantity control is `QuantityStepper` (thumb targets, no
// number spinner to fight on a phone), and the selects are native — a phone's
// own wheel beats any listbox we could draw.
// =============================================================================

const DETAILS_MAX = 500;
// "Other" says nothing on its own — the desk cannot action it without words.
const DETAILS_REQUIRED_FOR = ["other"];

const ReturnModal = ({ open, order, existingReturns = [], onClose, onSubmitted }) => {
  const items = useMemo(() => order?.items || [], [order]);

  // How many units of each line an earlier request already claimed. A rejected
  // return releases its units, so this shrinks when the desk says no.
  const claimed = useMemo(
    () => returnedUnitsByLine(existingReturns, order?.id),
    [existingReturns, order?.id]
  );

  /** Units still returnable on a line: ordered − already claimed. */
  const remainingFor = React.useCallback(
    (item) => Math.max(0, (Number(item?.quantity) || 0) - (claimed[lineKey(item)] || 0)),
    [claimed]
  );

  const [picks, setPicks] = useState([]);
  const [reason, setReason] = useState("defective");
  const [details, setDetails] = useState("");
  const [method, setMethod] = useState("original_payment");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Re-seed whenever a different order opens the sheet: everything returnable
  // is ticked, because the common case is "this whole parcel goes back".
  useEffect(() => {
    if (!open) return;
    setPicks(
      items.map((it) => {
        const max = remainingFor(it);
        return { checked: max > 0, quantity: max > 0 ? max : 0, max };
      })
    );
    setReason("defective");
    setDetails("");
    setMethod("original_payment");
    setError("");
    setSubmitting(false);
  }, [open, items, remainingFor]);

  const setPick = (i, patch) =>
    setPicks((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const refund = netRefundForItems(order, picks, items);
  const selectedCount = picks.reduce(
    (n, p) => n + (p.checked && p.quantity > 0 ? 1 : 0),
    0
  );
  // Nothing left to return anywhere on this order — an earlier request took it
  // all. Say so instead of showing a form that cannot be submitted.
  const nothingReturnable = picks.length > 0 && picks.every((p) => p.max <= 0);
  const detailsRequired = DETAILS_REQUIRED_FOR.includes(reason);

  const handleSubmit = async () => {
    setError("");
    const chosen = items
      .map((it, i) => ({ it, pick: picks[i] }))
      .filter(({ pick }) => pick?.checked && Number(pick.quantity) > 0);

    if (chosen.length === 0) {
      setError("Pick at least one item to send back.");
      return;
    }
    if (detailsRequired && !details.trim()) {
      setError("Tell us a little about what went wrong, so we can act on it.");
      return;
    }

    try {
      setSubmitting(true);
      const created = await onSubmitted?.({
        orderId: order.id,
        orderNumber: order.orderNumber || String(order.id),
        userId: order.userId ?? null,
        items: chosen.map(({ it, pick }) => ({
          productId: it.productId,
          variantId: it.variantId ?? null,
          name: it.name,
          sku: it.sku || "",
          price: it.price,
          quantity: Number(pick.quantity),
          subtotal: (Number(it.price) || 0) * Number(pick.quantity),
          image: it.image || null,
        })),
        reason,
        reasonDetails: details.trim(),
        refundAmount: refund.net,
        refundMethod: method,
      });
      if (created !== false) onClose?.();
    } catch (e) {
      // The request did not land. Keep the sheet open with everything the
      // shopper typed still in it — a return form is not worth filling twice.
      setError(
        e?.message ||
          "We couldn't file that request. Nothing was sent — please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const footer = (
    <>
      <Button variant="ghost" onClick={onClose} disabled={submitting}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        disabled={submitting || nothingReturnable || selectedCount === 0}
        aria-busy={submitting || undefined}
      >
        {submitting && <span className={styles.btnSpinner} aria-hidden="true" />}
        {submitting ? "Sending…" : "Request return"}
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      size="sm"
      labelledBy="return-modal-title"
      footer={footer}
      className={styles.dialog}
    >
      <p className="sf-eyebrow">Return or exchange</p>
      <h2 className={styles.heading} id="return-modal-title">
        Send something back
      </h2>

      <p className={styles.orderLine}>
        Order <strong>{order?.orderNumber || `#${order?.id}`}</strong>
      </p>

      {nothingReturnable ? (
        <p className={styles.note}>
          Every piece on this order is already covered by a return request.
          Track it from this page — we'll email you as it moves.
        </p>
      ) : (
        <>
          <p className={styles.note}>
            Tick what's coming back. We'll review the request, arrange the
            pickup and refund you once the parcel reaches us.
          </p>

          {/* ── What's going back ─────────────────────────────────────────── */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>What are you sending back?</legend>
            <ul className={styles.items}>
              {items.map((it, i) => {
                const pick = picks[i] || { checked: false, quantity: 0, max: 0 };
                const exhausted = pick.max <= 0;
                const inputId = `return-item-${i}`;
                return (
                  <li
                    key={`${lineKey(it)}-${i}`}
                    className={`${styles.item} ${exhausted ? styles.itemOff : ""}`}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      className={styles.checkbox}
                      checked={pick.checked}
                      disabled={exhausted}
                      onChange={(e) =>
                        setPick(i, {
                          checked: e.target.checked,
                          quantity: e.target.checked
                            ? Math.max(1, pick.quantity || 1)
                            : 0,
                        })
                      }
                    />
                    <CloudinaryImage
                      src={it.image}
                      alt=""
                      plate
                      ar="1:1"
                      pad
                      aspectRatio="1 / 1"
                      widths={[96, 144, 192]}
                      sizes="48px"
                      className={styles.thumb}
                    />
                    <div className={styles.itemText}>
                      <label className={styles.itemName} htmlFor={inputId}>
                        {it.name}
                      </label>
                      <span className={styles.itemMeta}>
                        {formatCurrency(it.price)} · ordered ×{it.quantity}
                        {exhausted ? " · already requested" : ""}
                      </span>
                    </div>
                    {!exhausted && (
                      <div className={styles.qty}>
                        <QuantityStepper
                          size="sm"
                          value={pick.quantity || 1}
                          min={1}
                          max={pick.max}
                          maxHint="That's all you bought of this one"
                          disabled={!pick.checked}
                          onChange={(next) => setPick(i, { quantity: next })}
                        />
                        <span className="sf-visually-hidden">
                          {`Quantity to return for ${it.name}, at most ${pick.max}`}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </fieldset>

          {/* ── Why ───────────────────────────────────────────────────────── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="return-reason">
              Reason
            </label>
            <select
              id="return-reason"
              className={styles.select}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {RETURN_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="return-details">
                Tell us more{" "}
                {detailsRequired ? (
                  <span className={styles.req}>(required)</span>
                ) : (
                  <span className={styles.counter}>Optional</span>
                )}
              </label>
              <span className={styles.counter}>
                {details.length}/{DETAILS_MAX}
              </span>
            </div>
            <textarea
              id="return-details"
              className={styles.textarea}
              value={details}
              maxLength={DETAILS_MAX}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="What went wrong? The more we know, the faster we can put it right."
              rows={3}
            />
          </div>

          {/* ── Where the money goes ──────────────────────────────────────── */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="return-method">
              Refund to
            </label>
            <select
              id="return-method"
              className={styles.select}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {CUSTOMER_REFUND_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* ── The estimate ──────────────────────────────────────────────── */}
          <div className={styles.summary}>
            {refund.discountShare > 0 && (
              <>
                <p className={styles.summaryRow}>
                  <span>Items</span>
                  <span>{formatCurrency(refund.gross)}</span>
                </p>
                <p className={`${styles.summaryRow} ${styles.summaryDiscount}`}>
                  <span>
                    Coupon{order?.couponCode ? ` (${order.couponCode})` : ""} —
                    these items' share
                  </span>
                  <span>−{formatCurrency(refund.discountShare)}</span>
                </p>
              </>
            )}
            <p className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Estimated refund</span>
              <span>{formatCurrency(refund.net)}</span>
            </p>
            <p className={styles.fineprint}>
              An estimate — the final amount is confirmed once we've inspected
              the parcel, and any restocking or shipping fee is shown before
              it's paid.
            </p>
          </div>
        </>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </Modal>
  );
};

export default ReturnModal;
