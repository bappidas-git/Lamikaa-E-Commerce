import React, { forwardRef } from "react";
import styles from "./GlassCard.module.css";

// =============================================================================
// GlassCard — the storefront's one card surface
// =============================================================================
//
// `.sf-card` in the primitives is the surface (6% white behind a 20px blur, an
// 8% hairline, radius lg) and `.sf-card--hover` is the whole four-part hover
// gesture: 4px lift, hairline firms, glow fades in, photograph breathes. This
// component picks between them and adds the padding scale and the glow tone —
// nothing about the look is duplicated here.
//
// GLASS BUDGET (DESIGN_SYSTEM §4): at most two blurred layers in view. Inside a
// long list — shop chapters, search results — pass `glow={null}` and let the
// card sit on `--sf-color-surface` with a hairline; a hundred blurred cards is
// a scroll-jank machine, which is what `strong={false} scrim={false}` plus the
// `.sf-card` base already gives.
//
// `scrim` is for a card whose text sits over a photograph: it drops an inner
// --sf-color-bg wash under the content so the type keeps its contrast whatever
// the image behind it happens to be.
//
// WHY THE GLOW IS ITS OWN ELEMENT. `.sf-card--hover` already owns the card's
// `::before` — that is the gold lamp it fades in on hover — and an element has
// only one of those. Putting `.sf-glow` on the same node made the two rules
// fight over one pseudo-element, and the hover rule (declared later in the
// sheet) won: the tone was ignored and the lamp stayed at opacity 0. So the
// tone glow gets a node of its own, inert and negative-z-index, which also
// lets an interactive card carry both — its own hover lamp AND a resting tone.
// =============================================================================

const PADDING_CLASS = {
  none: "",
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
};

const GLOW_CLASS = {
  pink: "sf-glow",
  violet: "sf-glow sf-glow--violet",
  gold: "sf-glow sf-glow--gold",
  duo: "sf-glow sf-glow--duo",
};

const GlassCard = forwardRef(function GlassCard(
  {
    as: Component = "div",
    strong = false,
    scrim = false,
    interactive = false,
    padding = "md",
    glow = null,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const classes = [
    "sf-card",
    interactive ? "sf-card--hover" : "",
    strong ? "sf-glass--strong" : "",
    scrim ? "sf-glass--scrim" : "",
    styles.card,
    PADDING_CLASS[padding] ?? PADDING_CLASS.md,
    interactive ? styles.interactive : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const glowClass = glow ? GLOW_CLASS[glow] : "";

  return (
    <Component ref={ref} className={classes} {...rest}>
      {glowClass ? (
        <span className={`${glowClass} ${styles.glow}`} aria-hidden="true" />
      ) : null}
      {children}
    </Component>
  );
});

export default GlassCard;
