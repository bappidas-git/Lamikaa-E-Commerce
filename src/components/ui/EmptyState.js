import React from "react";
import { Icon } from "@iconify/react";
import GlassCard from "./GlassCard";
import styles from "./EmptyState.module.css";

// =============================================================================
// EmptyState — the shape of "there is genuinely nothing here"
// =============================================================================
//
// Every list on the storefront can come back with nothing in it, and until
// Prompt 31 each one said so in its own words, its own type sizes and its own
// markup. That is how an empty wishlist ends up looking like a bug and an empty
// search result ends up looking like a wishlist. One component, one anatomy:
//
//   eyebrow   the tracked gold signpost — WHERE the emptiness is ("Wishlist")
//   icon      one hairline Iconify glyph inside a signature-gradient ring
//   title     the plain fact, in Fraunces ("Nothing here yet")
//   text      one quiet line of what to do about it
//   actions   the ways out, as pills — passed in, never guessed here
//
// EMPTY IS NOT AN ERROR. This component says "we looked, and there is nothing";
// `ErrorState` says "we could not look". Rendering the first when the second is
// true is the one mistake a list must never make — a dropped request would tell
// a shopper the whole range is gone — so the two are separate components and
// every list page branches on `failed` BEFORE it branches on `length === 0`.
//
// THE RING. A gradient ring drawn as a 1px conic seam (`::before` under a
// masked inset) rather than a border, because a border cannot take a gradient
// without a second element. Inside it the glyph sits at 24px, hairline weight,
// in muted text — the artwork is a signpost, not the subject.
//
// `compact` is the in-page variant: the same anatomy at 24px padding, for a
// state that sits inside a section (a profile panel, a rail) rather than
// standing in for the whole page.
//
// A11Y. The default is a plain <section> with no live region: an empty list is
// the page's ordinary content, not an announcement. `role`/`aria-live` are
// forwarded so `ErrorState` can make itself an alert, and so a caller that
// swaps a populated list for this one in place can announce the change.
//
// The title is a <p> by DEFAULT because most of these sit inside a section that
// already has its heading — a second <h2> saying "Nothing here yet" adds a
// phantom entry to the document outline. `titleAs` promotes it where the state
// IS the page (the 404, an empty cart), which is the only time it owns a level.
// =============================================================================

const EmptyState = ({
  eyebrow,
  title = "Nothing here yet",
  titleAs: Title = "p",
  text,
  icon = "mdi:tray-remove",
  actions,
  compact = false,
  as = "section",
  className = "",
  children,
  ...rest
}) => (
  <GlassCard
    as={as}
    padding="none"
    glow={compact ? null : "gold"}
    className={[styles.card, compact ? styles.compact : "", className]
      .filter(Boolean)
      .join(" ")}
    {...rest}
  >
    {icon ? (
      <span className={styles.ring} aria-hidden="true">
        <span className={styles.glyph}>
          {typeof icon === "string" ? <Icon icon={icon} /> : icon}
        </span>
      </span>
    ) : null}

    {eyebrow ? <p className={`sf-eyebrow ${styles.eyebrow}`}>{eyebrow}</p> : null}
    {title ? <Title className={styles.title}>{title}</Title> : null}
    {text ? <p className={styles.text}>{text}</p> : null}

    {children}

    {actions ? <div className={styles.actions}>{actions}</div> : null}
  </GlassCard>
);

export default EmptyState;
