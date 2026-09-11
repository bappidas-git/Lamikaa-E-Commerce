// =====================================================================
// GLOBAL COLOR THEME — Edit this file to restyle the entire storefront
// =====================================================================
// All colors used by the front-end come from here. The admin panel builds
// its own palette in `adminTheme.js` and is NOT affected by this file.
//
// This is the MUI mirror of `storefront-tokens.css`. That file is the
// source of truth (and documents the role of every hex); keep the two in
// sync.
//
// There is ONE palette: "Black Rice in Daylight". Warm cream grounds,
// near-white plates, espresso type, and an ANTIQUE gold as the single
// accent that may fill a button — `primary` IS that gold, and
// `primary.contrastText` is the warm-white label that sits on it (5.2:1).
// There is no light/dark mode, no stored preference and no toggle.
//
// WHY THE GOLD IS NOT #F5D76E HERE. The champagne gold the brand's
// lockup is drawn in measures 1.4:1 on cream — it is a colour for a
// near-black ground and it vanishes on this one. It is still in the
// system, but only inside the `.sf-on-dark` scope (the masthead, the
// footer, the mobile nav, the lightbox), where the wordmark lives and
// where it reads at 13.4:1. Everything MUI paints here is page-side, so
// page-side is the palette it gets.
//
// HOW TO USE:
//   1. Change the hex values below.
//   2. Save the file — hot-reload picks up the changes instantly in dev.
//   3. Rebuild for production: `npm run build`.
// =====================================================================

export const PALETTE = {
  // Primary — antique gold. Fills the contained button; its label is warm
  // white, because on a cream page the fill has to be the dark half of the
  // pair (a pale fill on a pale ground is not a button).
  primary: {
    main: "#8C6410", // --sf-color-primary / --sf-color-gold
    light: "#6E4E0A", // --sf-color-gold-light — hover (DEEPER on cream)
    dark: "#513707", // --sf-color-gold-deep — pressed
    contrastText: "#FFFCF5", // --sf-color-primary-contrast
  },
  // Secondary accent — berry. A gradient stop and a concern accent; never a
  // large fill and never under gold text.
  secondary: {
    main: "#A63D6A", // --sf-color-pink
    light: "#C4658C",
    dark: "#7E2A4C",
  },
  // Page and component backgrounds
  background: {
    default: "#F8F3EA", // --sf-color-bg — warm cream
    paper: "#FFFDF9", // --sf-color-surface
  },
  // Text colors
  text: {
    primary: "#1B1714", // --sf-color-text — espresso, 16.1:1
    secondary: "#544C42", // --sf-color-text-secondary — 7.6:1
  },
  // Gradients. `primary` fills contained buttons; `hero` mirrors
  // --sf-gradient-brand, the pale wash behind full-bleed bands.
  gradient: {
    primary: "linear-gradient(135deg, #A87C14 0%, #8C6410 50%, #6E4E0A 100%)",
    primaryReverse:
      "linear-gradient(135deg, #6E4E0A 0%, #8C6410 50%, #A87C14 100%)",
    hero: "linear-gradient(135deg, #FFFDF9 0%, #F4ECDD 55%, #EFE4DC 100%)",
  },
  // Body background. Static — the same ground the pre-mount markup in
  // public/index.html paints, so there is nothing to reconcile at mount.
  bodyBackground: "#F8F3EA",
};
