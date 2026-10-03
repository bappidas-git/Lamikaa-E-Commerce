import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import brand from "../../config/brand";
import { RISE, reveal } from "../../theme/motion";
import {
  normalizePillars,
  pillarIcons,
  pillarLayout,
} from "../../utils/pillars";
import { Chip, GlassCard, Skeleton } from "../ui";
import styles from "./Pillars.module.css";

// The data half — where the list comes from and which glyph each pillar wears —
// lives in `utils/pillars.js`, which the admin's editor imports too. Re-exported
// so a surface that mounts this component can import both from one place.
export {
  PILLAR_ICONS,
  pillarIcon,
  pillarIcons,
  pillarsFrom,
} from "../../utils/pillars";

// =============================================================================
// Pillars — the things the brand says it is built on
// =============================================================================
//
// The pillars BRAND.md §3.2 names — Indigenous Knowledge, Modern Cosmetic
// Science, Farmer Ownership, Responsible Beauty — and any the owner adds, as a
// row of glass cards. The home section, /about, /why-lamikaa and the /contact
// rail all mount this component, so the four surfaces cannot drift apart on
// the wording, the order or the icons.
//
// THE LIST IS THE OWNER'S. Every surface hands this component
// `pillarsFrom(siteContent.whyLamikaa)` — the list Admin → Content edits — and
// passes `loading` while that record is in flight, which draws skeleton cards
// rather than the config's copy: a page that showed `brand.pillars` first and
// then swapped in the owner's list would flash yesterday's pillars at every
// visitor. `brand.pillars` is the default and the fallback for a record that
// could not be read; no word of the copy is typed in this file. What this file
// owns is the PRESENTATION — which glyph a pillar wears, which lamp it lights on
// hover, and how any number of cards behave between 360px and 1440px.
//
// ANY NUMBER OF CARDS, IN BALANCED ROWS. One column on a phone, at most two on
// a tablet, four on a laptop and five on a desktop — and the rows are balanced
// so the last one is never a lone card under a full row: five pillars are one
// row of five on a desktop and 3 + 2 on a laptop, with a short last row centred
// under the one above it. `pillarLayout()` works the grid out; the stylesheet
// draws it.
//
// THE CARDS ARE NOT LINKS, AND THEY DO NOT PRETEND TO BE. They carry no `to`,
// no `onClick` and — deliberately — not GlassCard's `interactive`, whose 4px
// lift, hover lamp and focus ring together promise a destination that does not
// exist. The section's one way onward is its CTA. So a keyboard walk passes
// straight through this grid: zero tab stops, one <li> a pillar and nothing
// else.
//
// WHICH LEAVES THE GLOW WITH NOWHERE TO LIVE except a hover rule of the card's
// own. GlassCard's `glow` prop renders an inert, negative-z-index tone node; the
// module holds it at zero and fades it in when the card is hovered, alternating
// gold and violet down the row. Under `prefers-reduced-motion` the shared token
// block zeroes `--sf-transition`, so the lamp appears rather than fades — and
// nothing here moves, loops or lifts at any setting.
//
// SEMANTICS. One <ul>, one <li> a pillar; `role="list"` is written out because
// Safari drops list semantics the moment a list loses its bullets. The numerals
// are `aria-hidden`: "01" is a visual ordinal on an unordered list, and a
// screen reader that has already announced "list, 5 items" gains nothing from
// it. The skeleton is `aria-hidden` as a whole and is not a list at all.
// =============================================================================

/** "01", "02", … — padded so a column of numerals lines up on the digit. */
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
  loading = false,
  compact = false,
  maxColumns,
  titleAs: Title = "h3",
  className = "",
  style,
  ...rest
}) => {
  const reduceMotion = useReducedMotion();

  const items = useMemo(() => normalizePillars(pillars), [pillars]);
  const icons = useMemo(() => pillarIcons(items), [items]);
  const layout = useMemo(
    () => pillarLayout(items.length, maxColumns),
    [items.length, maxColumns]
  );

  if (items.length === 0) return null;

  const classes = [styles.grid, compact ? styles.compact : "", className]
    .filter(Boolean)
    .join(" ");

  // The record is in flight: the shapes of the cards, as many as the fallback
  // list has, in the same grid — so the band does not reflow when the copy
  // lands in the common case of an unchanged list.
  if (loading) {
    return (
      <div
        className={classes}
        style={{ ...layout.list, ...style }}
        aria-hidden="true"
        data-loading="true"
        {...rest}
      >
        {items.map((pillar, index) => (
          <GlassCard
            key={pillar.id}
            padding={compact ? "sm" : "md"}
            className={styles.card}
            style={layout.items[index]}
          >
            <div className={styles.head}>
              <Skeleton variant="circle" className={styles.iconSkeleton} />
            </div>
            <Skeleton variant="text" lines={1} className={styles.titleSkeleton} />
            <Skeleton variant="text" lines={3} />
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
    <ul role="list" className={classes} style={{ ...layout.list, ...style }} {...rest}>
      {items.map((pillar, index) => (
        <GlassCard
          as={motion.li}
          key={pillar.id}
          glow={pillarTone(index)}
          padding={compact ? "sm" : "md"}
          className={styles.card}
          style={layout.items[index]}
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
              <Icon icon={icons[index]} />
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
