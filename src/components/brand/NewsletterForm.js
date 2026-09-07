import React, { useEffect, useId, useRef, useState } from "react";
import apiService from "../../services/api";
import { isEmailValid } from "../../utils/helpers";
import { Button } from "../ui";
import styles from "./NewsletterForm.module.css";

// =============================================================================
// NewsletterForm — one newsletter capture, wherever the brand asks for an email
// =============================================================================
//
// Lifted verbatim out of the footer's invitation band (Prompt 13) so the
// full-page CTA (Prompt 19) can ask the same question without a second copy of
// the contract. THE CONTRACT IS UNCHANGED and is the whole reason this is a
// component rather than two forms:
//
//   `isEmailValid()` gate  ->  apiService.leads.createNewsletter(email)
//   ->  success (role="status") | error (role="alert")
//
// and the success line reverts to the field after six seconds so a second
// visitor on the same screen can subscribe too. The lead lands in Admin → Leads
// as a `newsletter` row, exactly as it did from the footer alone.
//
// WHY A GENUINE FAILURE IS SHOWN. A network or 5xx error must not look like a
// win: a fake "success" hides real failures and records nothing. We still do
// not reveal whether an address was already subscribed — the API answers
// uniformly for that — so the only thing surfaced is that the attempt failed.
//
// TWO VARIANTS, ONE FIELD.
//   footer   the close of the page: left-aligned, the field capped at 34rem.
//   cta      inside the full-page CTA's card: centred, the hint held to a
//            measure, the row stacking full-width sooner because the card is
//            narrower than a footer column.
// The FIELD ITSELF is identical in both — 48px, the surface-2 ground behind a
// glass hairline the design system names for every input (DESIGN_SYSTEM.md §7),
// with the pill primary beside it. One field design, two placements: a
// storefront where the same question is asked twice in two different shapes is
// a storefront that looks assembled rather than designed.
//
// LABELLING. `label` is the VISIBLE heading above the field (the gold eyebrow),
// and the input additionally carries its own visually-hidden <label> — the
// eyebrow is a section label, not a form label, and an input whose only name is
// a placeholder loses it the moment typing starts. `hint` is wired through
// `aria-describedby`, and the error joins it there while it stands.
//
// IDS. `id` is the BASE for the three ids this form owns (`-email`, `-hint`,
// `-error`). Two of these on one page must not collide, so a caller that does
// not pass one gets React's own generated id instead.
// =============================================================================

const SUCCESS_MESSAGE = "Thank you — you are on the list.";
const INVALID_MESSAGE = "Please enter a valid email address.";
const FAILURE_MESSAGE = "Something went wrong. Please try again.";

// How long the thank-you holds before the field comes back.
const RESET_DELAY = 6000;

const NewsletterForm = ({
  variant = "footer",
  label,
  hint,
  buttonLabel = "Subscribe",
  id,
  className = "",
}) => {
  const generatedId = useId();
  const baseId = id || `newsletter-${generatedId}`;
  const inputId = `${baseId}-email`;
  const hintId = `${baseId}-hint`;
  const errorId = `${baseId}-error`;

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState("idle"); // idle | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = email.trim();
    if (!isEmailValid(trimmed)) {
      setSubscribeStatus("error");
      setErrorMsg(INVALID_MESSAGE);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.leads.createNewsletter(trimmed);
      setSubscribeStatus("success");
      setEmail("");
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setSubscribeStatus("idle"), RESET_DELAY);
    } catch {
      setSubscribeStatus("error");
      setErrorMsg(FAILURE_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  const describedBy = [hint ? hintId : "", subscribeStatus === "error" ? errorId : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={[styles.wrap, styles[variant] || styles.footer, className]
        .filter(Boolean)
        .join(" ")}
    >
      {label ? <p className={`sf-eyebrow ${styles.label}`}>{label}</p> : null}
      {hint ? (
        <p className={styles.hint} id={hintId}>
          {hint}
        </p>
      ) : null}

      {subscribeStatus === "success" ? (
        <p className={styles.success} role="status">
          {SUCCESS_MESSAGE}
        </p>
      ) : (
        <form className={styles.form} onSubmit={handleSubscribe} noValidate>
          <label className="sf-visually-hidden" htmlFor={inputId}>
            Email address
          </label>
          <div className={styles.field}>
            <input
              id={inputId}
              type="email"
              name="email"
              autoComplete="email"
              className={`${styles.input} ${
                subscribeStatus === "error" ? styles.inputError : ""
              }`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (subscribeStatus === "error") {
                  setSubscribeStatus("idle");
                }
              }}
              disabled={isSubmitting}
              aria-invalid={subscribeStatus === "error"}
              aria-describedby={describedBy || undefined}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className={styles.submit}
            >
              {isSubmitting ? "Sending" : buttonLabel}
            </Button>
          </div>
          {subscribeStatus === "error" && (
            <p className={styles.error} id={errorId} role="alert">
              {errorMsg}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default NewsletterForm;
