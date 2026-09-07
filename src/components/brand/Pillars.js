import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import brand from "../../config/brand";
import { RISE, reveal } from "../../theme/motion";
import { Chip, GlassCard } from "../ui";
import styles from "./Pillars.module.css";

// =============================================================================
// Pillars — the four things the brand says it is built on
// =============================================================================
//
// BRAND.md §3.2's four pillars — Indigenous Knowledge, Modern Cosmetic Science,
// Farmer Ownership, Responsible Beauty — as four glass cards. The home section
// (Prompt 20) and the Why LAMIKAA page (Prompt 28) mount the same component, so
// the two surfaces cannot drift apart on the wording, the order or the icons.
//
// THE COPY IS CONFIG, NOT COMPONENT. Every title and every sentence comes from
// `brand.pillars` and not one word of it is typed here — the same rule the
// trust strip and the value chain follow, and for the same reason: brand copy
// is edited in `src/config/brand.js`, reviewed once, and used everywhere. What
// this file owns is the PRESENTATION — which glyph a pillar wears, which lamp
// it lights on hover, and how four cards behave between 360px and 1440px.
//
// THE CARDS ARE NOT LINKS, AND THEY DO NOT PRETEND TO BE. They carry no `to`,
// no `onClick` and — deliberately — not GlassCard's `interactive`, whose 4px
// lift, hover lamp and focus ring together promise a destination that does not
// exist. The section's one way onward is its CTA. So a keyboard walk passes
// straight through this grid: zero tab stops, four <li> and nothing else.
//
// WHICH LEAVES THE GLOW WITH NOWHERE TO LIVE except a hover rule of the card's
// own. GlassCard's `glow` prop renders an inert, negative-z-index tone node; the
// module holds it at zero and fades it in when the card is hovered, alternating
// gold and violet down the row. Under `prefers-reduced-motion` the shared token
// block zeroes `--sf-transition`, so the lamp appears rather than fades — and
// nothing here moves, loops or lifts at any setting.
//
// SEMANTICS. One <ul> of four <li>; `role="list"` is written out because Safari
// drops list semantics the moment a list loses its bullets. The numerals are
// `aria-hidden`: "01" is a visual ordinal on an unordered list, and a screen
// reader that has already announced "list, 4 items" gains nothing from it.
// =============================================================================

/** The glyph each pillar wears, keyed by the id `brand.pillars` gives it. */
export const PILLAR_ICONS = {
  "indigenous-knowledge": "mdi:leaf",
  "modern-science": "mdi:flask-outline",
  "farmer-ownership": "mdi:account-group-outline",
  "responsible-beauty": "mdi:earth",
};

// The same four, in the order the brief lists them — the fallback for a pillar
// whose key the owner has renamed, so a config edit degrades to the right icon
// in the right slot instead of to the generic one.
const ICON_ORDER = [
  "mdi:leaf",
  "mdi:flask-outline",
  "mdi:account-group-outline",
  "mdi:earth",
];

// A FIFTH pillar is a pillar this file has never seen. It gets the neutral mark
// the trust strip uses for the same case rather than a guess at its meaning.
const FALLBACK_ICON = "mdi:star-four-points-outline";

/**
 * The glyph for a pillar: by key, else by position, else the neutral mark.
 * Exported for the unit test — a renamed key must not silently swap two icons.
 */
export const pillarIcon = (pillar, index) =>
  PILLAR_ICONS[pillar?.key] || ICON_ORDER[index] || FALLBACK_ICON;

/** "01"–"04", padded so a column of numerals lines up on the digit. */
export const pillarNumeral = (index) => String(index + 1).padStart(2, "0");

/** The hover lamp, alternating down the row: gold, violet, gold, violet. */
export const pillarTone = (index) => (index % 2 === 0 ? "gold" : "violet");

// Where a card waits before it arrives — see AboutTeaser.js: the route's
// <AnimatePresence initial={false}> drops `initial` for anything present at the
// first paint, so the resting state has to be named as `animate` as well or a
// warm cache lands the whole grid already finished.
const RESTING = { opacity: 0, y: RISE.reveal };

const Pillars = ({
  pillars = brand.pillars,
  compact = false,
  titleAs: Title = "h3",
  className = "",
  ...rest
}) => {
  const reduceMotion = useReducedMotion();

  // A pillar with no title is not a thinner pillar, it is a hole in the row.
  const items = (Array.isArray(pillars) ? pillars : []).filter(
    (pillar) => pillar && typeof pillar.title === "string" && pillar.title.trim()
  );

  if (items.length === 0) return null;

  return (
    /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
    <ul
      role="list"
      className={[styles.grid, compact ? styles.compact : "", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {items.map((pillar, index) => (
        <GlassCard
          as={motion.li}
          key={pillar.key || pillar.title}
          glow={pillarTone(index)}
          padding={compact ? "sm" : "md"}
          className={styles.card}
          {...(reduceMotion ? {} : { animate: RESTING })}
          {...reveal(reduceMotion, { index, inView: true, amount: 0.2 })}
        >
          <div className={styles.head}>
            {/* The glyph's box is the WRAPPER's, not the icon's: @iconify/react
                renders an unsized <span> placeholder until the icon resolves
                and forwards neither className nor aria-hidden to it, so a bare
                <Icon> would collapse to 0px and then shove the row sideways
                when it landed. The svg is 1em, so 24px is one font-size here. */}
            <span className={styles.icon} aria-hidden="true">
              <Icon icon={pillarIcon(pillar, index)} />
            </span>
            <Chip variant="step" className={styles.numeral} aria-hidden="true">
              {pillarNumeral(index)}
            </Chip>
          </div>

          <Title className={styles.title}>{pillar.title}</Title>
          {pillar.text ? <p className={styles.text}>{pillar.text}</p> : null}
        </GlassCard>
      ))}
    </ul>
  );
};

export default Pillars;
