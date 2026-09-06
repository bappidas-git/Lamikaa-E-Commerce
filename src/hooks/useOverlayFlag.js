import { useEffect } from "react";

// =============================================================================
// useOverlayFlag(active) — "an overlay is up", for the components behind it
// =============================================================================
// The flag is one attribute on <body>:
//
//   body[data-drawer-open]
//
// read by the sticky header (which withdraws its own backdrop filter, so a
// glass panel over a glass masthead never spends the two-blurred-layers budget
// in DESIGN_SYSTEM §4 twice) and by the mobile bottom bar (which suspends its
// hide-on-scroll while an overlay is up).
//
// THE NAME IS THE CONTRACT, not a description: it was minted by `ui/Drawer` in
// Prompt 05 and both readers select on it by name, so a modal raises the same
// flag rather than a second one nobody reads. Prompt 11 lifted the counter out
// of Drawer.js into this hook the moment `ui/Modal` became the second raiser —
// two module-level counters would each delete the attribute on their own way
// out, and a modal closing over an open drawer would have un-blurred the
// header while the drawer was still there.
//
// REFERENCE COUNTED for exactly that reason, the same way `useScrollLock`
// counts its lock: set when the count goes 0 -> 1, cleared only back at 0.
// =============================================================================

let overlayCount = 0;

const canFlag = () => typeof document !== "undefined" && !!document.body;

/**
 * Raise `body[data-drawer-open]` while `active` is true.
 *
 * @param {boolean} active
 */
export default function useOverlayFlag(active) {
  useEffect(() => {
    if (!active || !canFlag()) return undefined;
    overlayCount += 1;
    if (overlayCount === 1) document.body.dataset.drawerOpen = "1";
    return () => {
      overlayCount = Math.max(0, overlayCount - 1);
      if (overlayCount === 0) delete document.body.dataset.drawerOpen;
    };
  }, [active]);
}

// Test-only: the counter is module state, so a suite that mounts overlays needs
// a way back to zero. Never called by the application.
export const __resetOverlayFlag = () => {
  overlayCount = 0;
  if (canFlag()) delete document.body.dataset.drawerOpen;
};
