import React, { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { overlay, panel as panelMotion } from "../../theme/motion";
import useFocusTrap from "../../hooks/useFocusTrap";
import useScrollLock from "../../hooks/useScrollLock";
import useOverlayFlag from "../../hooks/useOverlayFlag";
import Button from "./Button";
import styles from "./Drawer.module.css";

// =============================================================================
// Drawer — a panel that arrives from an edge
// =============================================================================
//
// The same dialog contract as Modal (portal, role="dialog" aria-modal, focus
// trap and restore, Escape, scroll lock, close on navigation) with three
// differences that matter:
//
//   SIDE      left / right / bottom, each entering from its own edge through
//             `panel(reduce, side)` — the same factory the cart tray uses.
//   SIZE      full width at 480px and below; `width` (420px) from 481px up. A
//             `bottom` drawer is a sheet: 85svh at most, with a grab handle,
//             and `svh` rather than `vh` so the mobile browser's collapsing
//             address bar cannot push its foot off screen.
//   THE HEADER'S BLUR   opening a drawer sets `body[data-drawer-open]`. The
//             sticky header reads that attribute and drops its own backdrop
//             filter while a drawer is up, which is how the two-blurred-layers
//             budget (DESIGN_SYSTEM §4) is kept without either component
//             knowing about the other. The reference-counted flag moved to
//             `useOverlayFlag` in Prompt 11, when `Modal` became the second
//             component that raises it — one counter, or a modal closing over
//             an open drawer un-blurs the header while the drawer is still up.
// =============================================================================

const Drawer = ({
  open = false,
  onClose,
  side = "right",
  title,
  labelledBy,
  width = "420px",
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

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const close = useCallback(() => onCloseRef.current?.(), []);

  useScrollLock(open);
  useOverlayFlag(open);
  useFocusTrap(panelRef, { active: open, onEscape: close });

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

  const isBottom = side === "bottom";

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className={[styles.root, styles[side] || styles.right].join(" ")}>
          <motion.div
            className={styles.backdrop}
            {...overlay(reduce)}
            onClick={closeOnBackdrop ? close : undefined}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy || (title ? titleId : undefined)}
            tabIndex={-1}
            /* THE SCRIM IS NOT OPTIONAL ON A DRAWER (Prompt 38). A drawer is
               glass over whatever page it opened from, so its ground is
               whatever that page happens to be showing — and on a product page
               that is a lit pack shot. Measured over the PDP, the cart tray's
               12px muted note ("Shipping and taxes calculated at checkout")
               composited to 3.82:1 against a gold-lit rgb(91, 83, 57): a
               serious `color-contrast` failure that no colour on the text side
               could fix, because the background is the photograph. The scrim
               (`--sf-color-bg` at 35%, the design system's own answer for text
               on glass over imagery) takes the same pair to 5.7:1 and holds for
               every drawer over every page, which is why it lives here and not
               on one tray's stylesheet. */
            className={[
              "sf-glass",
              "sf-glass--strong",
              "sf-glass--scrim",
              styles.panel,
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            style={isBottom ? undefined : { "--sf-drawer-width": width }}
            {...panelMotion(reduce, side)}
            {...rest}
          >
            {/* The grab handle is a visual affordance for a sheet that can be
                dismissed by tapping away — decorative, so it is hidden from
                assistive tech, which has the close button and Escape. */}
            {isBottom ? <span className={styles.handle} aria-hidden="true" /> : null}

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

export default Drawer;
