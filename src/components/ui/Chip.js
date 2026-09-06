import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "./Chip.module.css";

// =============================================================================
// Chip — the small labels: trust marks, concerns, ritual steps, statuses
// =============================================================================
//
// One component, five jobs, because a chip is a chip: a pill, 13px at weight
// 500, 36px tall at rest and a full 44px whenever it is interactive. That
// geometry is `.sf-chip` in the primitives; the variants below only recolour it.
//
//   trust    the three owner-mandated badges — gold hairline, tracked uppercase
//   concern  a skin concern — glass with one --sf-concern-* accent
//   step     a ritual numeral — a 28px circle inside a signature-gradient ring
//   status   order/admin semantics — success, warning, danger, info, neutral
//   glass    the bare pill, for a filter or a tag
//
// TONE. `status` tones are the semantic tokens and are fixed. `concern` tones
// name one of the six concern accents (pink, violet, cyan, gold, mint, rose);
// anything else — a concern slug straight out of the data, "brightening" — is
// hashed onto those six. Hashing is deliberate: the concern list is owner-
// editable data, so a hard-coded slug->colour table here would either invent
// facts about concerns nobody has defined yet or silently drop new ones. The
// hash is stable, so a concern keeps its colour across pages and reloads.
//
// An interactive chip must be a real control: pass `as={Link}` with `to`, or
// `as="button"` with `onClick`. The default is an inert <span>, which is what a
// badge should be.
// =============================================================================

const CONCERN_TONES = ["pink", "violet", "cyan", "gold", "mint", "rose"];

const TONE_CLASS = {
  pink: styles.tonePink,
  violet: styles.toneViolet,
  cyan: styles.toneCyan,
  gold: styles.toneGold,
  mint: styles.toneMint,
  rose: styles.toneRose,
  success: styles.toneSuccess,
  warning: styles.toneWarning,
  danger: styles.toneDanger,
  info: styles.toneInfo,
  neutral: "",
};

/** Stable index for a concern slug: the same word always gets the same accent. */
const hashTone = (value) => {
  const key = String(value);
  let sum = 0;
  for (let i = 0; i < key.length; i += 1) sum = (sum * 31 + key.charCodeAt(i)) >>> 0;
  return CONCERN_TONES[sum % CONCERN_TONES.length];
};

const renderIcon = (icon) =>
  typeof icon === "string" ? <Icon icon={icon} aria-hidden="true" /> : icon;

const Chip = forwardRef(function Chip(
  {
    variant = "glass",
    tone,
    icon,
    as,
    active = false,
    className = "",
    children,
    ...rest
  },
  ref
) {
  const Component = as || (rest.to ? Link : rest.onClick ? "button" : "span");

  // A concern always resolves to one of the six accents; a status uses its own
  // semantic tone and falls back to neutral.
  const concernSeed =
    typeof tone === "string" ? tone : typeof children === "string" ? children : "";
  const resolvedTone =
    variant === "concern"
      ? CONCERN_TONES.includes(tone)
        ? tone
        : hashTone(concernSeed)
      : tone;

  const classes = [
    "sf-chip",
    styles.chip,
    styles[variant] || "",
    variant === "concern" || variant === "status" ? TONE_CLASS[resolvedTone] || "" : "",
    active ? "sf-chip--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      ref={ref}
      className={classes}
      {...(Component === "button" ? { type: "button" } : {})}
      {...rest}
    >
      {renderIcon(icon)}
      {variant === "step" ? (
        <span className={`sf-numeral ${styles.numeral}`}>{children}</span>
      ) : (
        children
      )}
    </Component>
  );
});

export default Chip;
