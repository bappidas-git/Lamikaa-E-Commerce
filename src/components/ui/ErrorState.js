import React from "react";
import Button from "./Button";
import EmptyState from "./EmptyState";

// =============================================================================
// ErrorState — "we could not look", said in the same anatomy as "nothing here"
// =============================================================================
//
// The same card, ring, Fraunces title and pill actions as `EmptyState` — one
// stylesheet, so a failure never looks like a different application — with the
// three things a failure needs and an empty list must never have:
//
//   role="alert"   a failed read is a change the visitor did not ask for, so it
//                  is announced. (`EmptyState` deliberately is not: an empty
//                  list is ordinary content.)
//   Try again      the retry is FIRST, because it is the thing that might work.
//                  `onRetry` is what makes it appear; a caller with nothing to
//                  re-run passes only `actions` and gets no false promise.
//   honest copy    "We couldn't load this. Nothing was changed." — it names the
//                  read that failed and, crucially, says the shopper's cart,
//                  order or wishlist was not touched by it. A failure that
//                  leaves someone wondering what it did to their data is worse
//                  than the failure.
//
// WHAT IT MUST NOT SAY. No "oops", no apology theatre, no invented cause ("the
// server is busy") — the page does not know why. It says what happened, what is
// unaffected, and offers the retry.
//
// Props: { title, text, onRetry, retryLabel, actions, ...EmptyState props }.
// `actions` is appended AFTER the retry, so a page can add "View orders" or
// "Back to shop" without losing it.
// =============================================================================

const ErrorState = ({
  title = "We couldn't load this",
  text = "Nothing was changed. Check your connection and try again.",
  icon = "mdi:cloud-off-outline",
  onRetry,
  retryLabel = "Try again",
  actions,
  ...rest
}) => (
  <EmptyState
    role="alert"
    title={title}
    text={text}
    icon={icon}
    actions={
      onRetry || actions ? (
        <>
          {onRetry ? (
            <Button variant="secondary" onClick={onRetry} icon="mdi:refresh">
              {retryLabel}
            </Button>
          ) : null}
          {actions}
        </>
      ) : null
    }
    {...rest}
  />
);

export default ErrorState;
