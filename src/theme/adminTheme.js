import { createTheme, alpha } from "@mui/material/styles";

// =============================================================================
// Admin design system — LAMIKAA, the quieter sibling
// =============================================================================
// The storefront is the showroom: glass, ambient glow, gradient hairlines, pill
// buttons, Fraunces display type. The admin is the back office. It shares the
// palette — the same charcoal grounds, the same champagne gold — and nothing
// else: no glass (except the login card), no glow, 8px controls, hairline
// borders, soft tinted status badges and uppercase table heads.
//
// ONE THEME, ONE MODE. The light/dark toggle went with Prompt 03; this file
// stopped having a light half in Prompt 32. `buildAdminTheme()` still takes a
// parameter so a caller that has not been updated (`buildAdminTheme("dark")`)
// keeps working — the argument is ignored.
//
// FULLY ISOLATED. Every value below is spelled out rather than read from a
// `--sf-*` custom property: the admin never reads storefront tokens, so its
// theme has to name its own palette. `ADMIN_PALETTE` is exported for the few
// places that need a colour outside a React tree (a SweetAlert2
// `confirmButtonColor`); everything inside one reads `theme.palette.*`.
// =============================================================================

/** Champagne gold ramp — the one accent the admin spends. */
const GOLD = "#F5D76E";
const GOLD_LIGHT = "#FFEFA6";
const GOLD_DEEP = "#B88924";
/** Near-black: the label colour on a gold fill (13.4:1). */
const INK = "#0B0B0D";

/** The gold focus ring, `--sf-shadow-focus`'s admin twin. */
export const ADMIN_FOCUS_RING = `0 0 0 3px ${alpha(GOLD, 0.55)}`;

/** The gradient the active nav item and the CTA preview paint with. */
export const ADMIN_GOLD_GRADIENT = `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD} 50%, ${GOLD_DEEP})`;

/**
 * The ground a hero-slide preview falls back to when the slide carries no
 * gradient of its own. The admin's own copy of the brand wash — deliberately
 * not `var(--sf-gradient-brand)`: the admin never reads storefront tokens.
 */
export const ADMIN_BRAND_WASH =
  "linear-gradient(135deg, #0B0B0D, #1C1C20 55%, #2A2330)";

// Status hues for the soft chip variants — a translucent tint behind a light
// label, the "badge" look modern dashboards use instead of solid pill chips.
// Re-derived for the dark LAMIKAA palette: each foreground clears 4.5:1 on the
// #0B0B0D ground, so violet and cyan are stepped up from their palette tone.
export const CHIP_TONES = {
  default: { fg: "#B8B5B0", bg: "rgba(255, 255, 255, 0.08)" },
  primary: { fg: GOLD, bg: "rgba(245, 215, 110, 0.14)" },
  secondary: { fg: "#C4B5FD", bg: "rgba(139, 92, 246, 0.18)" },
  success: { fg: "#7ED9A6", bg: "rgba(126, 217, 166, 0.14)" },
  warning: { fg: "#F5C76E", bg: "rgba(245, 199, 110, 0.14)" },
  error: { fg: "#FF8A80", bg: "rgba(255, 138, 128, 0.14)" },
  info: { fg: "#5DE7FF", bg: "rgba(93, 231, 255, 0.12)" },
};

/**
 * The admin palette, per DESIGN_SYSTEM §10. Exported so a screen can reach a
 * colour where `useTheme()` cannot follow — SweetAlert2 renders under <body>,
 * outside the ThemeProvider, so its per-call `confirmButtonColor` has to be a
 * literal from somewhere, and this is that somewhere.
 */
export const ADMIN_PALETTE = {
  mode: "dark",
  primary: {
    main: GOLD,
    dark: GOLD_DEEP,
    light: GOLD_LIGHT,
    contrastText: INK,
  },
  secondary: { main: "#8B5CF6", light: "#C4B5FD", contrastText: "#FFFFFF" },
  success: { main: "#7ED9A6", contrastText: INK },
  warning: { main: "#F5C76E", contrastText: INK },
  error: { main: "#FF8A80", contrastText: INK },
  info: { main: "#5DE7FF", contrastText: INK },
  background: {
    default: "#0B0B0D",
    paper: "#141416",
  },
  // Sunken surfaces the MUI palette has no name for: inputs and thumbnails sit
  // on `sunken`, a row lifts to `hover`. Extra keys ride along on the palette
  // untouched by augmentColor, which is exactly what we want from them.
  surface: {
    sunken: "#1C1C20",
    hover: "#222228",
  },
  divider: "rgba(255, 255, 255, 0.08)",
  text: {
    primary: "#F7F5F0",
    secondary: "#B8B5B0",
    disabled: "rgba(247, 245, 240, 0.62)",
  },
  action: {
    hover: "rgba(255, 255, 255, 0.05)",
    selected: "rgba(245, 215, 110, 0.12)",
  },
};

const buildAdminTheme = (/* mode — ignored, one dark theme since Prompt 32 */) => {
  const palette = ADMIN_PALETTE;

  // One soft-badge override per chip color, for both filled and outlined.
  const chipColorOverrides = Object.fromEntries(
    Object.entries(CHIP_TONES).flatMap(([key, tone]) => {
      const cap = key.charAt(0).toUpperCase() + key.slice(1);
      return [
        [`filled${cap}`, { backgroundColor: tone.bg, color: tone.fg }],
        [`outlined${cap}`, { borderColor: alpha(tone.fg, 0.4), color: tone.fg }],
      ];
    })
  );

  return createTheme({
    palette,
    // 8px surfaces and 8px controls — square enough to read as a tool, soft
    // enough to belong to the same brand. Nothing in the admin is a pill.
    shape: { borderRadius: 8 },
    typography: {
      // Manrope, the same UI family as the storefront — the admin is a quieter
      // sibling, not a different product. Spelled out rather than read from
      // --sf-font-family on purpose: the admin never reads storefront tokens.
      fontFamily:
        '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      button: { textTransform: "none", fontWeight: 600 },
      // Match the compact heading scale the admin pages were laid out against.
      h4: { fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.01em" },
      h5: { fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em" },
      h6: { fontSize: "1rem", fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
    },
    components: {
      // Every focusable control in the admin — button, icon button, nav item,
      // tab, switch — wears the same gold ring. One rule, so no screen can
      // forget it.
      MuiButtonBase: {
        styleOverrides: {
          root: {
            "&.Mui-focusVisible": {
              outline: "none",
              boxShadow: ADMIN_FOCUS_RING,
            },
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: "none",
            "&:hover": { boxShadow: "none", transform: "none" },
            // Repeated here so the ring still wins on a focused control that is
            // also hovered (MuiButton's own rule is later in the cascade).
            "&.Mui-focusVisible": { boxShadow: ADMIN_FOCUS_RING },
          },
          containedPrimary: {
            "&:hover": { backgroundColor: palette.primary.light },
          },
          outlined: {
            borderColor: palette.divider,
            "&:hover": {
              borderColor: alpha(palette.primary.main, 0.35),
              backgroundColor: palette.action.hover,
            },
          },
          sizeSmall: {
            padding: "4px 12px",
            // compact on desktop, comfortably tappable on phones
            "@media (max-width: 768px)": { minHeight: 40 },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
          rounded: { borderRadius: 8 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            border: `1px solid ${palette.divider}`,
            boxShadow: "none",
            "&:hover": { transform: "none" },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            border: `1px solid ${palette.divider}`,
            backgroundImage: "none",
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            border: `1px solid ${palette.divider}`,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            border: `1px solid ${palette.divider}`,
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 600 },
          ...chipColorOverrides,
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: palette.surface.sunken,
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: alpha(palette.primary.main, 0.35),
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: palette.primary.main,
              borderWidth: "1.5px",
            },
          },
          notchedOutline: { borderColor: palette.divider },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: palette.divider },
          head: {
            fontWeight: 600,
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: palette.text.secondary,
            whiteSpace: "nowrap",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { backgroundImage: "none" },
        },
      },
      // The one borrowed storefront device: the bar over the content reads as
      // a pane of the ground rather than a slab on top of it. Subtle — 88% and
      // a 12px blur, nothing like the storefront masthead — and it falls back
      // to the opaque paper where backdrop-filter is unsupported.
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            backgroundImage: "none",
            backgroundColor: alpha(palette.background.paper, 0.88),
            WebkitBackdropFilter: "blur(12px)",
            backdropFilter: "blur(12px)",
            "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))":
              {
                backgroundColor: palette.background.paper,
              },
          },
        },
      },
      // Small icon buttons (table row actions) keep their compact desktop
      // density but stay tappable (≥40px) on touch-sized screens.
      MuiIconButton: {
        styleOverrides: {
          sizeSmall: {
            "@media (max-width: 768px)": {
              padding: 11,
            },
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: { rounded: { borderRadius: 8 } },
      },
    },
  });
};

export default buildAdminTheme;
