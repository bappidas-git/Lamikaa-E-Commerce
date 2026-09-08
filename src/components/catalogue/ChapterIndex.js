import React, { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { Button } from "../ui";
import { chapterNumeral } from "./ProductChapter";
import styles from "./ChapterIndex.module.css";

// =============================================================================
// ChapterIndex — where you are in the range, and how to get anywhere else
// =============================================================================
//
// The shop has no filters, no sort and no pagination (brief §7.3), so the ONE
// piece of chrome the listing keeps is a way to see the whole range at a glance
// and jump inside it. Two shapes of the same list, chosen by width:
//
//   variant="rail"    >= 1025px. A 220px sticky column beside the chapters:
//                     the eight short names, a gradient progress track that
//                     fills as you read, and a way back to the top.
//   variant="strip"   <= 1024px. A sticky horizontal band under the masthead:
//                     numeral + short name pills that scroll their active one
//                     into view.
//
// BOTH ARE RENDERED, ONE IS SHOWN. The two live in different places in the
// document — the rail in the page's second grid column, the strip above the
// chapters — so they cannot be one node moved by CSS. The hidden one is
// `display: none`, which takes it out of the accessibility tree as well as off
// the screen, so a screen reader is never offered the same eight links twice.
//
// THE ACTIVE CHAPTER IS NOT DECIDED HERE. Each `ProductChapter` reports its own
// crossing of the 50 % line (IntersectionObserver, `onVisible`) and the page
// holds the answer; this component is told. That is what keeps the rail honest
// on a fast scroll: the chapter itself is the only thing that knows how much of
// it is on screen.
//
// THE PROGRESS TRACK IS THE ONE THING IT MEASURES. `(activeIndex + intra) / n`,
// where `intra` is how far INTO the active chapter the viewport has travelled,
// read from that chapter's own `getBoundingClientRect()` on scroll. Without the
// intra-chapter part the fill would jump one eighth at a time and read as a
// step counter rather than as progress. The read is rAF-throttled and passive,
// and it writes one custom property — no React state, so a scroll never costs a
// render.
//
// A JUMP MOVES FOCUS, not just the scroll position. `scrollIntoView` alone
// leaves a keyboard visitor's focus on the button they pressed, so the next Tab
// walks the rail again instead of the chapter they asked for. The chapter
// heading carries `tabIndex={-1}` for exactly this (see ProductChapter), and
// `preventScroll` keeps the smooth scroll from being cut short by the focus.
//
// Props:
//   products     array   the chapters, in the order they are laid out
//   activeIndex  number   which one is being read
//   variant      "rail" | "strip"
//   topId        string  the id focus lands on after "Back to top"
// =============================================================================

/** The chapter section's id — the same one `pages/Shop` gives it. */
export const chapterId = (product, index) =>
  `chapter-${product?.slug || product?.id || index}`;

/** The chapter heading's id, which is the chapter's id plus ProductChapter's suffix. */
export const chapterHeadingId = (product, index) => `${chapterId(product, index)}-title`;

/**
 * How far the viewport has travelled INTO a chapter, 0 → 1.
 *
 * Measured from the chapter's top edge against the top of the viewport, so it
 * reaches 1 exactly as the chapter's last pixel leaves the top of the screen.
 * A zero-height element (not laid out yet) is 0 rather than a division by zero.
 *
 * Exported for the unit test: it is the arithmetic behind the progress track.
 */
export const intraChapterProgress = (rect) => {
  const height = rect?.height || 0;
  if (height <= 0) return 0;
  const travelled = -(rect.top || 0) / height;
  return Math.min(1, Math.max(0, travelled));
};

/** The fill of the whole track: chapters read, plus the fraction of this one. */
export const trackProgress = (activeIndex, intra, total) => {
  if (!Number.isFinite(total) || total <= 0) return 0;
  const index = Math.min(Math.max(Number(activeIndex) || 0, 0), total - 1);
  return Math.min(1, Math.max(0, (index + intra) / total));
};

/** Land on an element without letting the focus cancel the smooth scroll. */
const focusQuietly = (element) => {
  if (!element) return;
  element.focus({ preventScroll: true });
};

const ChapterIndex = ({
  products = [],
  activeIndex = 0,
  variant = "rail",
  topId = "main-content",
  className = "",
}) => {
  const reduceMotion = useReducedMotion();
  const behavior = reduceMotion ? "auto" : "smooth";

  const total = products.length;
  const isRail = variant === "rail";

  // ---- The progress track (rail only) --------------------------------------
  // Written straight onto the node as a custom property. React state here would
  // re-render the whole rail on every scroll frame to move one gradient.
  const fillRef = useRef(null);
  useEffect(() => {
    if (!isRail || total === 0 || typeof window === "undefined") return undefined;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const node = fillRef.current;
      if (!node) return;
      const chapter = document.getElementById(
        chapterId(products[Math.min(activeIndex, total - 1)], activeIndex)
      );
      const intra = chapter ? intraChapterProgress(chapter.getBoundingClientRect()) : 0;
      node.style.setProperty("--sf-chapter-progress", String(trackProgress(activeIndex, intra, total)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isRail, products, activeIndex, total]);

  // ---- The strip keeps its active pill in view ------------------------------
  // `scrollTo` on the strip itself rather than `scrollIntoView` on the pill: the
  // latter walks up every scrollable ancestor and would drag the PAGE sideways
  // (and vertically) to satisfy a band the visitor is not looking at.
  const listRef = useRef(null);
  const pillRefs = useRef([]);
  useEffect(() => {
    if (isRail) return;
    const list = listRef.current;
    const pill = pillRefs.current[activeIndex];
    if (!list || !pill) return;
    const left = pill.offsetLeft - (list.clientWidth - pill.offsetWidth) / 2;
    if (typeof list.scrollTo === "function") {
      list.scrollTo({ left: Math.max(0, left), behavior });
    } else {
      list.scrollLeft = Math.max(0, left);
    }
  }, [isRail, activeIndex, behavior]);

  const jumpTo = useCallback(
    (product, index) => {
      const section = document.getElementById(chapterId(product, index));
      if (!section) return;
      section.scrollIntoView({ behavior, block: "start" });
      focusQuietly(document.getElementById(chapterHeadingId(product, index)));
    },
    [behavior]
  );

  const backToTop = useCallback(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior });
    const target = document.getElementById(topId);
    if (target) {
      // The page heading is not a focusable element in its own right; it is made
      // one for the duration of the jump, exactly as the chapter headings are.
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      focusQuietly(target);
    }
  }, [behavior, topId]);

  if (total === 0) return null;

  // ---- Rail (>= 1025px) -----------------------------------------------------
  if (isRail) {
    return (
      <nav
        aria-label="Products on this page"
        className={[styles.rail, className].filter(Boolean).join(" ")}
      >
        <div className={styles.railBody}>
          {/* The 2px gradient track. Decoration: the list beside it carries the
              same information as text, and `aria-current` says where you are. */}
          <div className={styles.track} aria-hidden="true">
            <span ref={fillRef} className={styles.fill} />
          </div>

          {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
          <ol className={styles.list} role="list">
            {products.map((product, index) => {
              const active = index === activeIndex;
              return (
                <li key={product.id ?? product.slug ?? index} className={styles.item}>
                  <button
                    type="button"
                    className={[styles.link, active ? styles.linkActive : ""]
                      .filter(Boolean)
                      .join(" ")}
                    aria-current={active ? "true" : undefined}
                    onClick={() => jumpTo(product, index)}
                  >
                    <span className={styles.dot} aria-hidden="true" />
                    <span className={styles.label}>
                      {product.shortName || product.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <Button
          variant="ghost"
          size="sm"
          icon="mdi:arrow-up"
          className={styles.top}
          onClick={backToTop}
        >
          Back to top
        </Button>
      </nav>
    );
  }

  // ---- Strip (<= 1024px) ----------------------------------------------------
  return (
    <nav
      aria-label="Products on this page"
      className={["sf-glass", styles.strip, className].filter(Boolean).join(" ")}
    >
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ol ref={listRef} className={styles.pills} role="list">
        {products.map((product, index) => {
          const active = index === activeIndex;
          return (
            <li key={product.id ?? product.slug ?? index} className={styles.pillItem}>
              <button
                type="button"
                ref={(node) => {
                  pillRefs.current[index] = node;
                }}
                className={[styles.pill, active ? styles.pillActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={active ? "true" : undefined}
                onClick={() => jumpTo(product, index)}
              >
                <span className={`sf-numeral ${styles.pillNumeral}`} aria-hidden="true">
                  {chapterNumeral(index)}
                </span>
                {product.shortName || product.name}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ChapterIndex;
