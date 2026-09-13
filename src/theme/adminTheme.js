import { createTheme, alpha } from "@mui/material/styles";

// =============================================================================
// Admin design system — LAMIKAA, the quieter sibling
// =============================================================================
// The storefront is the showroom: glass, ambient glow, gradient hairlines, pill
// buttons, Fraunces display type. The admin is the back office. It shares the
// palette — the same champagne/antique gold, the same warm neutrals — and
// nothing else: no glass (except the login card), no glow, 8px controls,
// hairline borders, soft tinted status badges and uppercase table heads.
//
// TWO MODES, ONE DESIGN LANGUAGE. `buildAdminTheme(mode)` takes "dark" or
// "light" and DARK IS THE DEFAULT — a back office is looked at for eight hours
// at a time, and this one was drawn on charcoal. The light half is the same
// design language on the storefront's own warm paper: identical radii, identical
// density, identical component overrides, a different ladder of neutrals and a
// gold that has been re-picked for a pale ground.
//
// WHY THE GOLD IS NOT THE SAME IN BOTH. Champagne (#F5D76E) measures 13.4:1 on
// #0B0B0D and 1.4:1 on cream — it is a colour for a near-black ground and it
// vanishes on a pale one. So the light mode spends the storefront's ANTIQUE gold
// (#825C0E) instead, and the fill/label pair runs the other way round: a pale
// fill under a near-black label in the dark, a deep fill under a warm-white
// label in the light. `primary.contrastText` moves with it, so every consumer
// that uses the pair — and they all do — stays legible without a second rule.
//
// FULLY ISOLATED. Every value below is spelled out rather than read from a
// `--sf-*` custom property: the admin never reads storefront tokens, so its
// theme has to name its own palette. The light ladder is deliberately a MIRROR
// of `theme/storefront-tokens.css` (same hexes, same contrast figures) so the
// two products look like one company — but it is a copy, not a reference. Keep
// them in step.
//
// `ADMIN_PALETTE` is exported for the few places that need a colour outside a
// React tree — SweetAlert2 renders under <body>, outside the ThemeProvider, so
// its per-call `confirmButtonColor` has to be a literal from somewhere. It is a
// LIVE object: `buildAdminTheme()` re-points its contents at the mode being
// built, so a red confirm button is the red that reads on the ground the dialog
// will actually land on. Every consumer reads a property off it at call time
// (inside a click handler), which is what makes that safe; do not destructure
// it at module scope.
// =============================================================================

/** Champagne gold ramp — the dark mode's one accent. */
const GOLD = "#F5D76E";
const GOLD_LIGHT = "#FFEFA6";
const GOLD_DEEP = "#B88924";
/** Near-black: the label colour on a champagne fill (13.4:1). */
const INK = "#0B0B0D";

/** Antique gold ramp — the light mode's one accent, text-safe on paper. */
const OCHRE = "#825C0E";
const OCHRE_LIGHT = "#A87C14";
const OCHRE_DEEP = "#513707";
/** Warm white: the label colour on an antique-gold fill (5.2:1). */
const PAPER_INK = "#FFFCF5";
/** Espresso — the light mode's type colour (16.1:1 on the cream ground). */
const ESPRESSO = "#1B1714";

/** The gold focus ring, `--sf-shadow-focus`'s admin twin, per mode. */
export const ADMIN_FOCUS_RINGS = {
  dark: `0 0 0 3px ${alpha(GOLD, 0.55)}`,
  light: `0 0 0 3px ${alpha(OCHRE, 0.38)}`,
};

/** LEGACY, dark. Prefer the theme's own focus ring inside a React tree. */
export const ADMIN_FOCUS_RING = ADMIN_FOCUS_RINGS.dark;

/** The gradient the active nav item and the CTA preview paint with, per mode. */
export const ADMIN_GOLD_GRADIENTS = {
  dark: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD} 50%, ${GOLD_DEEP})`,
  light: `linear-gradient(135deg, ${OCHRE_LIGHT}, ${OCHRE} 50%, ${OCHRE_DEEP})`,
};

/** LEGACY, dark. Inside a React tree read `theme.palette.gradient.gold`. */
export const ADMIN_GOLD_GRADIENT = ADMIN_GOLD_GRADIENTS.dark;

/**
 * The ground a hero-slide preview falls back to when the slide carries no
 * picture of its own. The admin's own copy of the brand wash — deliberately
 * not `var(--sf-gradient-brand)`: the admin never reads storefront tokens.
 */
export const ADMIN_BRAND_WASHES = {
  dark: "linear-gradient(135deg, #0B0B0D, #1C1C20 55%, #2A2330)",
  light: "linear-gradient(135deg, #FFFDF9, #F4ECDD 55%, #EFE4DC)",
};

/** LEGACY, dark. */
export const ADMIN_BRAND_WASH = ADMIN_BRAND_WASHES.dark;

// Status hues for the soft chip variants — a translucent tint behind a coloured
// label, the "badge" look modern dashboards use instead of solid pill chips.
// Each foreground clears 4.5:1 on its own mode's ground: the dark set is
// stepped UP from the palette tone, the light set is the storefront's own
// deepened semantics (which were picked against #F8F3EA for exactly this).
export const CHIP_TONE_SETS = {
  dark: {
    default: { fg: "#B8B5B0", bg: "rgba(255, 255, 255, 0.08)" },
    primary: { fg: GOLD, bg: "rgba(245, 215, 110, 0.14)" },
    secondary: { fg: "#C4B5FD", bg: "rgba(139, 92, 246, 0.18)" },
    success: { fg: "#7ED9A6", bg: "rgba(126, 217, 166, 0.14)" },
    warning: { fg: "#F5C76E", bg: "rgba(245, 199, 110, 0.14)" },
    error: { fg: "#FF8A80", bg: "rgba(255, 138, 128, 0.14)" },
    info: { fg: "#5DE7FF", bg: "rgba(93, 231, 255, 0.12)" },
  },
  light: {
    default: { fg: "#544C42", bg: "rgba(27, 23, 20, 0.07)" },
    primary: { fg: OCHRE, bg: "rgba(130, 92, 14, 0.12)" },
    secondary: { fg: "#5B3E96", bg: "rgba(91, 62, 150, 0.12)" },
    success: { fg: "#1D6B42", bg: "rgba(29, 107, 66, 0.12)" },
    warning: { fg: "#8A5B08", bg: "rgba(138, 91, 8, 0.14)" },
    error: { fg: "#B0261C", bg: "rgba(176, 38, 28, 0.10)" },
    info: { fg: "#12626F", bg: "rgba(18, 98, 111, 0.10)" },
  },
};

/** LEGACY, dark. */
export const CHIP_TONES = CHIP_TONE_SETS.dark;

/**
 * The two palettes, per DESIGN_SYSTEM §10.
 *
 * `surface` is a pair of sunken/lifted grounds the MUI palette has no name for:
 * inputs and thumbnails sit on `sunken`, a row lifts to `hover`. Extra keys
 * ride along on the palette untouched by augmentColor, which is exactly what we
 * want from them — and the same is true of `gradient` and `shadow`.
 */
export const ADMIN_PALETTES = {
  dark: {
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
    gradient: {
      gold: ADMIN_GOLD_GRADIENTS.dark,
      brandWash: ADMIN_BRAND_WASHES.dark,
    },
    shadow: {
      // On a charcoal ground only black reads as depth.
      popover: "0 8px 24px rgba(0, 0, 0, 0.5)",
      dialog: "0 12px 40px rgba(0, 0, 0, 0.5)",
    },
    focusRing: ADMIN_FOCUS_RINGS.dark,
    tableHead: "rgba(255, 255, 255, 0.03)",
  },
  light: {
    mode: "light",
    primary: {
      main: OCHRE,
      // Hover goes DEEPER, not lighter: on paper the fill is the dark half of
      // the pair, so lifting it would walk towards the ground.
      light: OCHRE_LIGHT,
      dark: OCHRE_DEEP,
      contrastText: PAPER_INK,
    },
    secondary: { main: "#5B3E96", light: "#7A5FC0", contrastText: PAPER_INK },
    success: { main: "#1D6B42", contrastText: PAPER_INK },
    warning: { main: "#8A5B08", contrastText: PAPER_INK },
    error: { main: "#B0261C", contrastText: PAPER_INK },
    info: { main: "#12626F", contrastText: PAPER_INK },
    background: {
      // A step deeper than the storefront page, so a near-white card separates
      // from it without a shadow — the admin has no elevation to spend.
      default: "#F4EFE4",
      paper: "#FFFDF9",
    },
    surface: {
      sunken: "#F1E9DA",
      hover: "#EAE0CD",
    },
    divider: "rgba(27, 23, 20, 0.12)",
    text: {
      primary: ESPRESSO,
      secondary: "#544C42",
      disabled: "rgba(27, 23, 20, 0.55)",
    },
    action: {
      hover: "rgba(27, 23, 20, 0.045)",
      selected: "rgba(130, 92, 14, 0.10)",
    },
    gradient: {
      gold: ADMIN_GOLD_GRADIENTS.light,
      brandWash: ADMIN_BRAND_WASHES.light,
    },
    shadow: {
      // Warm ink rather than black: a neutral shadow on cream reads blue.
      popover: "0 8px 24px rgba(74, 58, 32, 0.16)",
      dialog: "0 12px 40px rgba(74, 58, 32, 0.20)",
    },
    focusRing: ADMIN_FOCUS_RINGS.light,
    tableHead: "rgba(27, 23, 20, 0.035)",
  },
};

/** The two modes, for a toggle's own labels. */
export const ADMIN_THEME_MODES = ["dark", "light"];

/** Dark unless a signed-in administrator has asked for the other one. */
export const ADMIN_DEFAULT_MODE = "dark";

/**
 * THE LIVE PALETTE. Outside a React tree there is no `useTheme()` to ask, and
 * SweetAlert2 is exactly that case. Its contents are re-pointed by
 * `buildAdminTheme()` so a dialog fired from a light admin gets light-mode
 * colours; it starts as the dark palette, which is the default mode, so nothing
 * that reads it before a theme is built sees an empty object.
 */
export const ADMIN_PALETTE = { ...ADMIN_PALETTES.dark };

const applyLivePalette = (palette) => {
  Object.keys(ADMIN_PALETTE).forEach((key) => {
    delete ADMIN_PALETTE[key];
  });
  Object.assign(ADMIN_PALETTE, palette);
};

/**
 * The admin shell's <main> element id (set by `components/AdminLayout`).
 *
 * Exported because the `MuiTooltip` default below needs it: a popper rendered
 * into `document.body` — MUI's default — is page content sitting outside every
 * landmark, which is what axe reports as `region` (Prompt 38). Pointing the
 * portal at the shell's own <main> keeps it inside a landmark without making it
 * an inline popper, which the tables' `overflow-x: auto` would clip.
 */
export const ADMIN_MAIN_ID = "admin-main";

/** "dark" | "light", tolerant of anything else. */
export const adminThemeMode = (mode) =>
  mode === "light" ? "light" : ADMIN_DEFAULT_MODE;

/**
 * Build the admin's MUI theme.
 *
 * @param {"dark"|"light"} [mode]  defaults to dark
 */
const buildAdminTheme = (mode) => {
  const resolved = adminThemeMode(mode);
  const palette = ADMIN_PALETTES[resolved];
  const focusRing = palette.focusRing;
  const tones = CHIP_TONE_SETS[resolved];

  // Keep the out-of-tree palette pointed at the mode actually on screen.
  applyLivePalette(palette);

  // One soft-badge override per chip color, for both filled and outlined.
  const chipColorOverrides = Object.fromEntries(
    Object.entries(tones).flatMap(([key, tone]) => {
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
      // Every admin tooltip portals into the shell's <main> rather than into
      // document.body — see ADMIN_MAIN_ID above. `container` is read at mount;
      // a null return (the sign-in screen, which has no shell) makes MUI fall
      // back to document.body exactly as before.
      MuiTooltip: {
        defaultProps: {
          slotProps: {
            popper: {
              container: () =>
                typeof document === "undefined"
                  ? null
                  : document.getElementById(ADMIN_MAIN_ID),
            },
          },
        },
      },
      // ------------------------------------------------------------------
      // TYPE SIZE IS NOT DOCUMENT STRUCTURE (Prompt 38)
      // ------------------------------------------------------------------
      // MUI's default variantMapping renders `variant="h4"` as an <h4>
      // element, `subtitle2` as an <h6>, and so on — so every admin screen
      // published its stat figures ("₹1,309", "8", "2"), its accordion
      // labels and its product names as document headings, four and five
      // levels below the page's single <h1>. axe reported it as
      // `heading-order` on nine of the nineteen screens; a screen-reader
      // user navigating by heading got a list of numbers.
      //
      // The mapping below says: only h1/h2/h3 are headings by default.
      // Everything else keeps its type size and becomes a paragraph, and a
      // heading is now something a screen states on purpose —
      // `<Typography variant="h5" component="h1">` for a page title,
      // `component="h2"` for a panel. Visual output is unchanged: `variant`
      // still picks the size, `component` only picks the tag.
      MuiTypography: {
        defaultProps: {
          variantMapping: {
            h1: "h1",
            h2: "h2",
            h3: "h3",
            h4: "p",
            h5: "p",
            h6: "p",
            subtitle1: "p",
            subtitle2: "p",
            body1: "p",
            body2: "p",
            inherit: "p",
          },
        },
      },
      // Every focusable control in the admin — button, icon button, nav item,
      // tab, switch — wears the same gold ring. One rule, so no screen can
      // forget it.
      MuiButtonBase: {
        styleOverrides: {
          root: {
            "&.Mui-focusVisible": {
              outline: "none",
              boxShadow: focusRing,
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
            // MUI's medium button is 36-37px, which is a mouse size. A finger
            // gets the full 44 (WCAG 2.5.5) on any coarse pointer; a mouse keeps
            // the density the admin was designed at.
            "@media (pointer: coarse)": { minHeight: 44 },
            "&:hover": { boxShadow: "none", transform: "none" },
            // Repeated here so the ring still wins on a focused control that is
            // also hovered (MuiButton's own rule is later in the cascade).
            "&.Mui-focusVisible": { boxShadow: focusRing },
          },
          containedPrimary: {
            // Champagne lifts towards the light on charcoal; antique gold has
            // to go the other way on paper. `primary.light` carries whichever
            // direction the mode's ramp runs, so this is one rule.
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
            // Compact for a mouse, a full 44px target for a finger. Keyed off
            // the POINTER rather than the width: a 1024px tablet is touched
            // too, and a narrow desktop window is not.
            "@media (pointer: coarse)": { minHeight: 44 },
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
            boxShadow: palette.shadow.dialog,
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            border: `1px solid ${palette.divider}`,
            boxShadow: palette.shadow.popover,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
            border: `1px solid ${palette.divider}`,
            boxShadow: palette.shadow.popover,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            fontWeight: 600,
            // Only the chips that DO something — a status chip is a label, not
            // a target, and growing every one of them would loosen the tables
            // for no one's benefit.
            "@media (pointer: coarse)": {
              "&.MuiChip-clickable, &.MuiChip-deletable": { minHeight: 44 },
            },
          },
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
            backgroundColor: palette.tableHead,
          },
        },
      },
      // The shell's navigation rows and the content screen's document list are
      // list buttons, and MUI sizes those from their own density rather than
      // from the button theme above — so the touch floor is stated here too.
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            "@media (pointer: coarse)": { minHeight: 44 },
          },
        },
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
      // density but clear the full 44px target on any coarse pointer. 12px of
      // padding around a 20px icon is exactly 44.
      MuiIconButton: {
        styleOverrides: {
          root: {
            "@media (pointer: coarse)": {
              minWidth: 44,
              minHeight: 44,
            },
          },
          sizeSmall: {
            "@media (pointer: coarse)": {
              padding: 12,
            },
          },
        },
      },
      // A field is a target too, and MUI's `size="small"` input and select are
      // 40px. The ROOT is the visible control — a click anywhere on it focuses
      // the field — so the floor goes there and MUI's own `align-items: center`
      // keeps the field centred in it. (Stretching the field instead was tried
      // and is worse: MUI gives it an explicit height, so it stayed 40px and
      // merely moved to the top of the box, leaving the target off-centre.)
      MuiInputBase: {
        styleOverrides: {
          root: {
            "@media (pointer: coarse)": { minHeight: 44 },
          },
        },
      },
      // Segmented controls (Payments' Transactions/Refunds, FAQs' All/Live/…)
      // are ToggleButtons, not Tabs, and MUI sizes them at 39px.
      MuiToggleButton: {
        styleOverrides: {
          root: {
            "@media (pointer: coarse)": { minHeight: 44 },
          },
        },
      },
      // Settings and Home & Hero are the two screens with real MUI Tabs; MUI's
      // own minimum is 48px, but a `Tab` with no icon can come in under it.
      MuiTab: {
        styleOverrides: {
          root: {
            "@media (pointer: coarse)": { minHeight: 44 },
          },
        },
      },
      // A switch's target is the row it is labelled by — MUI's FormControlLabel
      // is a real <label>, so a tap anywhere on it toggles the control.
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            "@media (pointer: coarse)": { minHeight: 44 },
          },
        },
      },
      // …and a switch rendered WITHOUT a label (Shipping's row toggles) is 38px
      // of its own. MUI's hidden input is the switch's hit area and is already
      // absolutely positioned over it, so it is grown past the ink rather than
      // the control being resized: nothing painted moves, and the thumb keeps
      // its alignment with the track.
      MuiSwitch: {
        styleOverrides: {
          input: {
            // Centred at a flat 44px rather than grown by a fixed amount: the
            // default switch is 38px of hit area and the `size="small"` one on
            // Rituals is 24, so one figure has to cover both.
            "@media (pointer: coarse)": {
              top: "50%",
              height: 44,
              transform: "translateY(-50%)",
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
