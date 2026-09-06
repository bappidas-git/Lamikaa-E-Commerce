import { useEffect } from "react";

// =============================================================================
// useFocusTrap(ref, { active, onEscape, initialFocus })
// =============================================================================
// The keyboard contract every dialog on the storefront owes its visitor:
//
//   - focus moves INTO the panel when it opens (nothing behind it is reachable),
//   - Tab and Shift+Tab cycle inside the panel and never escape it,
//   - Escape asks the owner to close,
//   - focus returns to whatever opened the panel when it closes.
//
// This is the trap that has been running in CartDrawer.js since the boilerplate
// was written, lifted verbatim so the edge handling is identical rather than
// re-derived: the panel itself holds focus on open, so it is treated as
// "outside" the ring and the first Tab lands on the first control (not the
// second). Prompt 05 introduces it as a hook for ui/Modal and ui/Drawer;
// CartDrawer, SidebarMenu, AuthModal, SearchModal and ReviewModal keep their
// own copies until their feature prompts migrate them.
//
// The 60ms delay before focusing is not superstition: the panel animates in,
// and focusing an element that is still off-screen makes some browsers scroll
// the page to chase it.
// =============================================================================

export const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Focusable descendants that are actually rendered (a hidden tab panel isn't). */
const focusableIn = (panel) =>
  Array.from(panel.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (node) => node.offsetParent !== null || node === document.activeElement
  );

/**
 * @param {React.RefObject<HTMLElement>} ref  the panel to trap focus inside
 * @param {object}  [options]
 * @param {boolean} [options.active]        trap only while true
 * @param {Function}[options.onEscape]      called on Escape
 * @param {React.RefObject<HTMLElement>} [options.initialFocus]
 *        element to focus on activate; defaults to the panel itself
 */
export default function useFocusTrap(
  ref,
  { active = false, onEscape, initialFocus } = {}
) {
  useEffect(() => {
    if (!active) return undefined;

    const opener = document.activeElement;
    const focusTimer = setTimeout(() => {
      const target = initialFocus?.current || ref.current;
      target?.focus();
    }, 60);

    const onKey = (e) => {
      if (e.key === "Escape") {
        onEscape?.();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = ref.current;
      if (!panel) return;

      const nodes = focusableIn(panel);
      if (nodes.length === 0) {
        // Nothing to cycle through: hold focus on the panel rather than let it
        // fall back out to the page behind.
        e.preventDefault();
        panel.focus();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const activeEl = document.activeElement;
      // The panel itself holds focus on open, so it counts as outside the ring:
      // the first Tab must land on the first control.
      const outside = activeEl === panel || !panel.contains(activeEl);

      if (e.shiftKey && (outside || activeEl === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (outside || activeEl === last)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
      if (opener && typeof opener.focus === "function") opener.focus();
    };
    // `onEscape` is read through a fresh closure on every keydown, but it is
    // listed so a caller that swaps the handler mid-open gets the new one.
  }, [active, ref, onEscape, initialFocus]);
}
