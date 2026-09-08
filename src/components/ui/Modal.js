import React, { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { overlay, sheet } from "../../theme/motion";
import useFocusTrap from "../../hooks/useFocusTrap";
import useScrollLock from "../../hooks/useScrollLock";
import useOverlayFlag from "../../hooks/useOverlayFlag";
import Button from "./Button";
import styles from "./Modal.module.css";

// =============================================================================
// Modal — a centred dialog, with the whole a11y contract attached
// =============================================================================
//
// PORTALLED to <body>, so a modal is never clipped by an ancestor's `overflow`
// or trapped under a lower `z-index` — the two ways a dialog rendered in place
// fails, both of them silently.
//
// The contract, none of which is optional:
//   role="dialog" aria-modal="true", labelled by its own title
//   focus moves in, cycles inside, and returns to the opener      (useFocusTrap)
//   Escape closes; the backdrop closes unless `closeOnBackdrop` is false
//   the page behind cannot scroll, and does not shift              (useScrollLock)
//   a route change closes it — a dialog that survives navigation is a dialog
//   nobody can dismiss
//
// SIZES are sm 420 / md 640 / lg 880, plus `full` — the whole viewport, no
// radius, no scrim showing (Prompt 11's search overlay). At 480px and below
// every size becomes the same full-screen sheet anyway: a centred 640px card on
// a 390px phone is a card with no margins pretending to be a dialog. A `full`
// modal also hands its body's padding and scrolling to its child, because a
// full-screen overlay wants a fixed head and one scrolling region under it, not
// one scrollport around everything.
//
// THE HEADER'S BLUR. An open modal raises `body[data-drawer-open]` through
// `useOverlayFlag`, the same reference-counted flag `Drawer` raises — a glass
// panel over a glass masthead is two blurred layers, and DESIGN_SYSTEM §4
// allows two in view at most, so the header withdraws its own while a dialog
// is up (Prompt 11).
//
// Motion is `overlay()` for the scrim and `sheet()` for the panel, both from
// theme/motion.js, both taking `useReducedMotion()` — so reduced motion is one
// boolean threaded through rather than a second JSX branch.
// =============================================================================

const Modal = ({
  open = false,
  onClose,
  title,
  labelledBy,
  describedBy,
  size = "md",
  initialFocus,
  closeOnBackdrop = true,
  showClose = true,
  footer,
  className = "",
  children,
  ...rest
}) => {
  const panelRef = useRef(null);
  const titleId = useId();
  const location = useLocation();
  const reduce = useReducedMotion();

  // The latest onClose, without making every effect below depend on the
  // caller's render identity.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const close = useCallback(() => onCloseRef.current?.(), []);

  useScrollLock(open);
  useOverlayFlag(open);
  useFocusTrap(panelRef, { active: open, onEscape: close, initialFocus });

  // Close on navigation. The path is captured when the dialog opens, so opening
  // one does not immediately close it, and a query-string or hash change (a
  // filter, an anchor) is not a navigation as far as the dialog is concerned.
  const pathAtOpen = useRef(null);
  useEffect(() => {
    if (!open) {
      pathAtOpen.current = null;
      return;
    }
    if (pathAtOpen.current === null) {
      pathAtOpen.current = location.pathname;
      return;
    }
    if (pathAtOpen.current !== location.pathname) close();
  }, [open, location.pathname, close]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          className={[styles.root, size === "full" ? styles.rootFull : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <motion.div
            className={styles.backdrop}
            {...overlay(reduce)}
            onClick={closeOnBackdrop ? close : undefined}
            // The scrim is a click target, not a control: the dialog's own
            // close button is what assistive tech is offered.
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy || (title ? titleId : undefined)}
            aria-describedby={describedBy}
            tabIndex={-1}
            /* THE SCRIM IS NOT OPTIONAL ON A MODAL EITHER (Prompt 38, the same
               finding as Drawer.js). The backdrop above darkens the page to
               72%, but the panel is glass on top of that, so 28% of whatever
               the modal opened over still reads through it. Measured with the
               auth modal over the checkout page, the field labels
               (--sf-color-text-secondary, 14px) fell to a serious
               `color-contrast` failure. The design system's own remedy for text
               on glass over live content is the scrim, and putting it on the
               shared panel fixes every dialog over every page at once. */
            className={[
              "sf-glass",
              "sf-glass--strong",
              "sf-glass--scrim",
              styles.panel,
              styles[size] || styles.md,
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...sheet(reduce)}
            {...rest}
          >
            {title || showClose ? (
              <div className={styles.header}>
                {title ? (
                  <h2 id={titleId} className={styles.title}>
                    {title}
                  </h2>
                ) : (
                  <span />
                )}
                {showClose ? (
                  <Button
                    variant="icon"
                    icon="mdi:close"
                    srLabel="Close"
                    onClick={close}
                    className={styles.close}
                  />
                ) : null}
              </div>
            ) : null}
            <div className={styles.body}>{children}</div>
            {footer ? <div className={styles.footer}>{footer}</div> : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
