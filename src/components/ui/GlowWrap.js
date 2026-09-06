import React, { forwardRef } from "react";
import styles from "./GlowWrap.module.css";

// =============================================================================
// GlowWrap — the ambient lamp behind a product, a card or a CTA
// =============================================================================
//
// The "Luxury Skincare After Dark" glow is a SMALL BLURRED ELEMENT sitting
// behind its content, never a second backdrop filter and never a wash over the
// top: `.sf-glow` sets `isolation: isolate` and its `::before` takes a negative
// z-index, so the lamp paints above the element's own background and below
// everything inside it. Children need no z-index of their own.
//
// PROPS map onto the custom properties the primitive already reads:
//   tone       pink | violet | gold | duo   -> the .sf-glow--* class
//   intensity  0.15–0.30                    -> --sf-glow-opacity (clamped)
//   offset     { x, y } in percent          -> --sf-glow-offset-x / -y
//   size       percent of the box, def. 110 -> --sf-glow-inset
//   breathe    the 10s scale loop           -> .sf-glow--breathe
//
// AT MOST ONE BREATHING GLOW PER VIEWPORT (DESIGN_SYSTEM §5): the hero owns it
// at the top of the home page, the full-page CTA owns it further down. It is a
// component prop rather than a default precisely so that budget is a decision
// somebody makes, and `prefers-reduced-motion` stops it in the primitives.
//
// `size` is the lamp's size as a percentage of the box, so the inset on each
// edge is half of what is left over: 110% -> -5%. Larger than 100 is the point
// — a lamp that stops at the box edge reads as a border, not as light.
// =============================================================================

const TONE_CLASS = {
  pink: "sf-glow",
  violet: "sf-glow sf-glow--violet",
  gold: "sf-glow sf-glow--gold",
  duo: "sf-glow sf-glow--duo",
};

const clampIntensity = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.min(0.3, Math.max(0.15, n));
};

const GlowWrap = forwardRef(function GlowWrap(
  {
    as: Component = "div",
    tone = "pink",
    intensity,
    breathe = false,
    offset,
    size = 110,
    className = "",
    style,
    children,
    ...rest
  },
  ref
) {
  const opacity = clampIntensity(intensity);
  const inset = Number.isFinite(Number(size))
    ? `calc((100% - ${Number(size)}%) / 2)`
    : undefined;

  const vars = {
    ...(opacity != null ? { "--sf-glow-opacity": opacity } : {}),
    ...(offset?.x != null ? { "--sf-glow-offset-x": `${Number(offset.x)}%` } : {}),
    ...(offset?.y != null ? { "--sf-glow-offset-y": `${Number(offset.y)}%` } : {}),
    ...(inset ? { "--sf-glow-inset": inset } : {}),
    ...style,
  };

  const classes = [
    TONE_CLASS[tone] || TONE_CLASS.pink,
    breathe ? "sf-glow--breathe" : "",
    styles.wrap,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component ref={ref} className={classes} style={vars} {...rest}>
      {children}
    </Component>
  );
});

export default GlowWrap;
