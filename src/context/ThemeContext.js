import React, { createContext, useContext, useEffect, useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { PALETTE } from "../theme/colors";

// =============================================================================
// THEME CONTEXT — one theme, built once
// =============================================================================
// The storefront has a SINGLE dark theme ("Luxury Skincare After Dark"). There
// is no mode state, no toggle, no stored preference and no pre-mount branching:
// `storefront-tokens.css` declares one `:root` token set with
// `color-scheme: dark`, `public/index.html` paints the same ground before any
// bundle arrives, and `meta[name=theme-color]` is static in the markup. This
// provider exists only to build the MUI theme for the handful of MUI-based
// storefront bits (the Header controls, CssBaseline) and hand it down.
//
// MUI consumes `src/theme/colors.js`; the CSS Modules consume the `--sf-*`
// tokens. The two are mirrors of each other — retune them together.
// =============================================================================

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};

// Small icon buttons (admin table actions, input adornments, dialog controls)
// keep their compact desktop density but get a padded ≥40px hit area on
// touch-sized screens.
const iconButtonTouchOverrides = {
  styleOverrides: {
    sizeSmall: {
      "@media (max-width: 768px)": {
        padding: 11,
      },
    },
  },
};

// --sf-color-border — the hairline every dark surface is drawn with.
const HAIRLINE = "rgba(255, 255, 255, 0.08)";
// --sf-ease / --sf-duration-fast, spelled out because MUI takes strings.
const TRANSITION = "0.16s cubic-bezier(0.2, 0.7, 0.2, 1)";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: PALETTE.primary,
    secondary: PALETTE.secondary,
    background: PALETTE.background,
    text: PALETTE.text,
    divider: HAIRLINE,
    action: {
      hover: "rgba(245, 215, 110, 0.10)", // --sf-color-primary-soft
    },
  },
  typography: {
    // Families are Prompt 04's job (Fraunces + Manrope); they mirror
    // --sf-font-family / --sf-font-display as those tokens stand today.
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: {
      fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
      fontSize: "3.5rem",
      fontWeight: 600,
      lineHeight: 1.1,
    },
    h2: {
      fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
      fontSize: "2.75rem",
      fontWeight: 600,
      lineHeight: 1.15,
    },
    h3: {
      fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
      fontSize: "2.25rem",
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h4: { fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.4 },
    h5: { fontSize: "1.25rem", fontWeight: 500, lineHeight: 1.5 },
    h6: { fontSize: "1rem", fontWeight: 500, lineHeight: 1.6 },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 14, // --sf-radius-md
  },
  components: {
    // Pills everywhere, and the one solid accent is gold under a near-black
    // label. Surfaces stay flat: no elevation tint, no coloured glow.
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999, // --sf-radius-pill
          minHeight: 44, // --sf-tap-target
          padding: "12px 28px",
          fontSize: "0.9375rem",
          letterSpacing: "0.01em",
          boxShadow: "none",
          transition: `background ${TRANSITION}, color ${TRANSITION}, border-color ${TRANSITION}`,
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          backgroundColor: PALETTE.primary.main,
          color: PALETTE.primary.contrastText, // near-black on gold — 13.4:1
          boxShadow: "none",
          "&:hover": {
            backgroundColor: PALETTE.primary.light,
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: "rgba(245, 215, 110, 0.35)", // --sf-color-border-strong
          color: PALETTE.text.primary,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20, // --sf-radius-lg
          backgroundColor: PALETTE.background.paper,
          backgroundImage: "none",
          border: `1px solid ${HAIRLINE}`,
          boxShadow: "none",
          transition: `border-color ${TRANSITION}`,
          "&:hover": {
            borderColor: "rgba(245, 215, 110, 0.35)", // --sf-color-border-strong
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 14, // --sf-radius-md
            backgroundColor: "#1C1C20", // --sf-color-surface-2
            "& fieldset": {
              borderColor: HAIRLINE,
            },
            "&:hover fieldset": {
              borderColor: "rgba(245, 215, 110, 0.35)",
            },
            "&.Mui-focused fieldset": {
              borderColor: PALETTE.primary.main, // gold focus
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: PALETTE.background.paper,
          backgroundImage: "none",
          borderColor: HAIRLINE,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)", // --sf-shadow-2
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: PALETTE.background.paper,
          backgroundImage: "none",
          color: PALETTE.text.primary,
          borderBottom: `1px solid ${HAIRLINE}`,
          boxShadow: "none",
        },
      },
    },
    // MUI tints dark Paper by elevation; these surfaces stay flat and are
    // separated by hairlines instead.
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: PALETTE.background.paper,
        },
      },
    },
    // The header account menu reads as glass: the same surface, a hairline,
    // and the shadow that lifts it off the page.
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: PALETTE.background.paper,
          backgroundImage: "none",
          border: `1px solid ${HAIRLINE}`,
          borderRadius: 14, // --sf-radius-md
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)", // --sf-shadow-2
        },
      },
    },
    MuiIconButton: iconButtonTouchOverrides,
  },
});

export const ThemeContextProvider = ({ children }) => {
  useEffect(() => {
    // Migration: the storefront used to persist a light/dark choice here. The
    // key is meaningless now, so a returning visitor gets it cleared once and
    // sees the one theme either way.
    try {
      localStorage.removeItem("theme");
    } catch {
      // Storage can be unavailable (private mode, blocked) — nothing to clear.
    }
  }, []);

  const value = useMemo(() => ({ theme }), []);

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
