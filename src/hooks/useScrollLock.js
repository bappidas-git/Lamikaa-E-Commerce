import { useEffect } from "react";

// =============================================================================
// useScrollLock(active) — freeze the page behind an overlay
// =============================================================================
// The lock itself is one CSS rule, declared once in src/index.css:
//
//   body[data-scroll-lock] { overflow: hidden; }
//
// so this hook only owns the ATTRIBUTE and the layout compensation. Hiding the
// overflow removes a classic scrollbar from the page, and the page under the
// overlay jumps sideways by its width unless the same number is handed back as
// padding. Overlay scrollbars (every phone, and macOS by default) measure 0 and
// no padding is added.
//
// REFERENCE COUNTING is the point of the module-level counter. Overlays nest —
// a confirmation modal opens over the cart drawer, a lightbox over the PDP
// gallery inside a modal — and each one runs its own effect. Without a count
// the inner overlay's cleanup would unlock the body while the outer one is
// still open, and the page would start scrolling under a drawer. The lock is
// applied when the count goes 0 -> 1 and released only when it returns to 0.
//
// The pre-lock `padding-right` is captured on the way in and restored on the
// way out, so a component that sets its own padding on <body> keeps it.
// =============================================================================

let lockCount = 0;
let previousPaddingRight = "";

const canLock = () => typeof document !== "undefined" && !!document.body;

const applyLock = () => {
  const { body, documentElement } = document;
  // The scrollbar's width: what the viewport has that the document element
  // does not. 0 with overlay scrollbars, ~15px with classic ones.
  const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
  previousPaddingRight = body.style.paddingRight;
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
  body.dataset.scrollLock = "1";
};

const releaseLock = () => {
  const { body } = document;
  delete body.dataset.scrollLock;
  body.style.paddingRight = previousPaddingRight;
  previousPaddingRight = "";
};

/**
 * Lock body scrolling while `active` is true.
 *
 * @param {boolean} active
 */
export default function useScrollLock(active) {
  useEffect(() => {
    if (!active || !canLock()) return undefined;
    lockCount += 1;
    if (lockCount === 1) applyLock();
    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) releaseLock();
    };
  }, [active]);
}

// Test-only: the counter is module state, so a suite that mounts overlays needs
// a way back to zero. Never called by the application.
export const __resetScrollLock = () => {
  lockCount = 0;
  previousPaddingRight = "";
  if (canLock()) {
    delete document.body.dataset.scrollLock;
    document.body.style.paddingRight = "";
  }
};
