// =====================================================================
// GLOBAL COLOR THEME — Edit this file to restyle the entire storefront
// =====================================================================
// All colors used by the front-end come from here. The admin panel builds
// its own palette in `adminTheme.js` and is NOT affected by this file.
//
// This is the MUI mirror of `storefront-tokens.css`. That file is the
// source of truth (and documents the role of every hex — see
// prompts/_reference/DESIGN_SYSTEM.md §2); keep the two in sync.
//
// There is ONE palette: "Luxury Skincare After Dark". Deep near-black
// grounds, warm-white type, champagne gold as the single accent that may
// fill a button — `primary` IS the gold, and `primary.contrastText` is the
// near-black label that sits on it (13.4:1). There is no light mode, no
// stored preference and no toggle.
//
// HOW TO USE:
//   1. Change the hex values below.
//   2. Save the file — hot-reload picks up the changes instantly in dev.
//   3. Rebuild for production: `npm run build`.
// =====================================================================

export const PALETTE = {
  // Primary — champagne gold. Fills the contained button; its label is the
  // page ground, which is why `contrastText` is near-black rather than white.
  primary: {
    main: "#F5D76E", // --sf-color-primary / --sf-color-gold
    light: "#FFEFA6", // --sf-color-gold-light — hover
    dark: "#B88924", // --sf-color-gold-deep — pressed
    contrastText: "#0B0B0D", // --sf-color-primary-contrast
  },
  // Secondary accent — neon pink. Ambient only (glows, gradient stops, the
  // rare micro-label); never a large fill and never under gold text.
  secondary: {
    main: "#FF4FD8", // --sf-color-pink
    light: "#FF8AE6",
    dark: "#C21FA4",
  },
  // Page and component backgrounds
  background: {
    default: "#0B0B0D", // --sf-color-bg — never pure black
    paper: "#141416", // --sf-color-surface
  },
  // Text colors
  text: {
    primary: "#F7F5F0", // --sf-color-text — warm white, 18.9:1
    secondary: "#B8B5B0", // --sf-color-text-secondary — 10.5:1
  },
  // Gradients. `primary` fills contained buttons and stays gold (a near-black
  // label needs a light ground); `hero` mirrors --sf-gradient-brand, the deep
  // wash behind the hero and the heritage bands.
  gradient: {
    primary: "linear-gradient(135deg, #FFEFA6 0%, #F5D76E 50%, #B88924 100%)",
    primaryReverse:
      "linear-gradient(135deg, #B88924 0%, #F5D76E 50%, #FFEFA6 100%)",
    hero: "linear-gradient(135deg, #0B0B0D 0%, #1C1C20 55%, #2A2330 100%)",
  },
  // Body background. Static — the same ground the pre-mount markup in
  // public/index.html paints, so there is nothing to reconcile at mount.
  bodyBackground: "#0B0B0D",
};

// Compatibility alias for the one prompt it takes the remaining importers to
// move onto PALETTE. Prompt 04 drops it.
export const DARK = PALETTE;
