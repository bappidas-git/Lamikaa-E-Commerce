import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "./Button";
import styles from "./Rail.module.css";

// =============================================================================
// Rail — the one horizontal card scroller
// =============================================================================
// Every "swipe through a row of cards" surface on the storefront is this
// component: the PDP's "You may also like", the home page's "Where you left
// off", the wishlist's recommendations. Before it existed each rail invented
// its own track, its own card width and its own (or no) affordance, and the two
// that mattered most were broken in the same way:
//
//   THE CARD WIDTH WAS MEASURED AGAINST THE VIEWPORT, NOT AGAINST THE RAIL.
//   "Show 4.4 cards at 1024px and up" is a sound rule for a page-wide rail and
//   a disaster for a rail inside a column: on the PDP, where the related rail
//   lives in a 537px chapter, `(100% - gaps) / 4.4` produced NINETY-ONE PIXEL
//   cards — a product name clipped to "Black Ric…", one chip per line, a
//   promise reading one word per row. A phone hit the mirror image of the same
//   bug: `minmax(150px, 62%)` on a track that already overflows has no free
//   space to grow into, so every card sat at its 150px floor.
//
// So the rule here is a CLAMP, and the clamp is what makes the rail portable:
//
//     flex-basis: clamp(card-min, (100% - gaps) / per-view, card-max)
//
// `100%` in a flex-basis resolves against the TRACK's own content box, so the
// same declaration shows four cards in a 1240px band, two and a bit in a 537px
// chapter column and one and a bit on a phone — and the floor guarantees that
// whatever the rail is asked to fit into, a card is never narrower than its
// content can survive. Nothing here reads the viewport.
//
// WHAT A VISITOR GETS
//   • a peek of the next card, always — the cheapest "there is more" there is;
//   • arrows on a fine pointer, disabled at the ends of the travel and gone
//     entirely when the row fits;
//   • a fade on the side that HAS more content, so the first card is not
//     dimmed while the rail is parked at its start (and no fade at all under
//     :focus-within, where it would dim a card's focus ring);
//   • a scroll progress bar on a touch device, which is where the arrows are
//     not — a swipe is the gesture, the bar is the position;
//   • snap points, a focusable track, and Arrow/Home/End keys on it.
//
// Props
//   label        string   accessible name for the scroll region (required-ish)
//   cardMin      CSS len  narrowest a card may get          (default 240px)
//   cardMax      CSS len  widest a card may get             (default 300px)
//   perView      number   cards the rail AIMS at, at its own width (default 4.2)
//   gap          CSS len  space between cards               (default token)
//   controls     bool     arrows on fine pointers           (default true)
//   progress     bool     progress bar on touch             (default true)
//   snap         "start"|"center"|"none"
//   className    string   applied to the outer element
//   trackClassName string applied to the scrolling track
// =============================================================================

/** Nothing to scroll past this many pixels of slack — snap parks a hair off 0. */
const EDGE_SLACK = 4;

/** A nudge moves most of a rail-width, keeping one card of context on screen. */
const NUDGE_RATIO = 0.85;

/**
 * The scroll state of a track: which edges it is parked against, whether it
 * overflows at all, and how far along it is.
 *
 * Exported so a surface that wants to place its own controls somewhere the rail
 * cannot reach — a section heading, a sticky toolbar — drives them off the same
 * numbers the rail's own arrows use, rather than starting a second, subtly
 * different copy of this.
 */
export const useRailScroll = () => {
  const ref = useRef(null);
  const [state, setState] = useState({
    atStart: true,
    atEnd: true,
    overflowing: false,
    progress: 0,
  });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    // A right-to-left track scrolls negative; the affordances care about
    // distance travelled, not about its sign.
    const left = Math.abs(el.scrollLeft);
    const overflowing = max > EDGE_SLACK;
    setState((prev) => {
      const next = {
        overflowing,
        atStart: !overflowing || left <= EDGE_SLACK,
        atEnd: !overflowing || left >= max - EDGE_SLACK,
        progress: overflowing ? Math.min(1, Math.max(0, left / max)) : 0,
      };
      return prev.overflowing === next.overflowing &&
        prev.atStart === next.atStart &&
        prev.atEnd === next.atEnd &&
        Math.abs(prev.progress - next.progress) < 0.001
        ? prev
        : next;
    });
  }, []);

  // Three things change the answer and none of them is a scroll: the cards
  // arriving, the rail being resized by something other than the window (a
  // drawer opening, a chapter expanding), and the window itself — which still
  // earns its listener where ResizeObserver callbacks are starved.
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    sync();

    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    if (observer) {
      observer.observe(el);
      // The first cell too: a card that grows a line changes the scroll width
      // without changing the track's.
      if (el.firstElementChild) observer.observe(el.firstElementChild);
    }

    const mutation =
      typeof MutationObserver !== "undefined" ? new MutationObserver(sync) : null;
    if (mutation) mutation.observe(el, { childList: true });

    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      if (observer) observer.disconnect();
      if (mutation) mutation.disconnect();
    };
  }, [sync]);

  /**
   * Scroll one "page" in `direction` (-1 back, 1 forward).
   *
   * `scroll-behavior` is set in the stylesheet and already zeroed under
   * prefers-reduced-motion, so this asks for "smooth" and lets the cascade
   * decide — no component has to thread a reduced-motion flag through.
   */
  const nudge = useCallback((direction) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * NUDGE_RATIO, behavior: "smooth" });
  }, []);

  /** Arrow keys page the rail; Home and End jump to its ends. */
  const onKeyDown = useCallback(
    (event) => {
      const el = ref.current;
      if (!el) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        nudge(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudge(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else if (event.key === "End") {
        event.preventDefault();
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
      }
    },
    [nudge]
  );

  return { ref, ...state, sync, nudge, onKeyDown };
};

/**
 * The two arrows. Rendered by the rail itself at the edges of the row on a fine
 * pointer, and exported for a caller that would rather place them elsewhere.
 */
export const RailArrows = ({ rail, label, className = "" }) => (
  <div className={`${styles.controls} ${className}`.trim()}>
    {/* `Button variant="icon"` is already the 44px glass circle with the focus
        ring and the press — the same control the PDP gallery's arrows are.
        Only the placement is this file's business. */}
    <Button
      variant="icon"
      className={styles.arrow}
      icon="mdi:chevron-left"
      srLabel={`Scroll ${label} backwards`}
      disabled={rail.atStart}
      onClick={() => rail.nudge(-1)}
    />
    <Button
      variant="icon"
      className={styles.arrow}
      icon="mdi:chevron-right"
      srLabel={`Scroll ${label} forwards`}
      disabled={rail.atEnd}
      onClick={() => rail.nudge(1)}
    />
  </div>
);

const Rail = ({
  children,
  label = "products",
  cardMin = "240px",
  cardMax = "300px",
  perView = 4.2,
  gap,
  controls = true,
  progress = true,
  snap = "start",
  className = "",
  trackClassName = "",
  style,
  ...rest
}) => {
  const rail = useRailScroll();

  const items = useMemo(
    () => React.Children.toArray(children).filter(Boolean),
    [children]
  );

  // The custom properties the stylesheet does its arithmetic with. They are
  // written here rather than in a dozen per-rail media queries because the
  // clamp above is what adapts the rail — the caller only says how big a card
  // wants to be and how many it would like to show.
  const vars = {
    "--rail-card-min": cardMin,
    "--rail-card-max": cardMax,
    "--rail-per-view": perView,
    ...(gap ? { "--rail-gap": gap } : null),
    ...style,
  };

  if (items.length === 0) return null;

  return (
    <div
      className={`${styles.rail} ${className}`.trim()}
      style={vars}
      data-overflowing={rail.overflowing ? "true" : "false"}
      data-at-start={rail.atStart ? "true" : "false"}
      data-at-end={rail.atEnd ? "true" : "false"}
      {...rest}
    >
      {/* Before the track in the DOM, so reaching them does not mean tabbing
          past every card in the rail first. They are placed at its edges by
          the stylesheet, which is where a pointer expects them. */}
      {controls && (
        <RailArrows rail={rail} label={label} className={styles.overlayControls} />
      )}

      {/* The fade lives on this wrapper rather than on the track: a mask on a
          scrolling box is resolved against its padding box, so the gradient
          would travel with the cards instead of staying at the window onto
          them. The arrows and the progress bar are its siblings, so neither is
          ever faded by the treatment meant for the cards. */}
      <div className={styles.viewport}>
        {/* A real list, kept as one: the cards ARE a list of products, and a
            `role="group"` here would take that away from every `li` under it.
            It is focusable as well, so a keyboard visitor can reach the
            overflow region itself and arrow through it rather than tabbing
            card by card. */}
        <ul
          ref={rail.ref}
          className={`${styles.track} ${trackClassName}`.trim()}
          data-snap={snap}
          onScroll={rail.sync}
          onKeyDown={rail.onKeyDown}
          tabIndex={0}
          aria-label={label}
        >
          {items.map((child, index) => (
            <li className={styles.cell} key={child.key ?? index}>
              {child}
            </li>
          ))}
        </ul>
      </div>

      {/* The touch affordance. Inert and hidden from assistive tech: the track
          above it is already a labelled, focusable, keyboard-driven region, and
          a progress bar would only repeat what a screen reader is being told by
          the scroll position itself. */}
      {progress && (
        <div className={styles.progress} aria-hidden="true">
          <span
            className={styles.progressThumb}
            style={{
              // The thumb is the visible share of the track, and it travels
              // across the remaining room — the same arithmetic a native
              // scrollbar does, at a size a thumb can actually see.
              width: `${Math.max(18, 100 / Math.max(perView, 1.2))}%`,
              left: `calc(${rail.progress * 100}% - ${
                rail.progress * Math.max(18, 100 / Math.max(perView, 1.2))
              }%)`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Rail;
