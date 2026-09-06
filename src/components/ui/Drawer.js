import React, { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { overlay, panel as panelMotion } from "../../theme/motion";
import useFocusTrap from "../../hooks/useFocusTrap";
import useScrollLock from "../../hooks/useScrollLock";
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
//             knowing about the other. Reference-counted, so a drawer opening
//             over a drawer cannot clear the flag early.
// =============================================================================

let drawerCount = 0;

const markDrawerOpen = () => {
  drawerCount += 1;
  if (drawerCount === 1) document.body.dataset.drawerOpen = "1";
};

const markDrawerClosed = () => {
  drawerCount = Math.max(0, drawerCount - 1);
  if (drawerCount === 0) delete document.body.dataset.drawerOpen;
};

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
  useFocusTrap(panelRef, { active: open, onEscape: close });

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;
    markDrawerOpen();
    return markDrawerClosed;
  }, [open]);

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
            className={[
              "sf-glass",
              "sf-glass--strong",
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
