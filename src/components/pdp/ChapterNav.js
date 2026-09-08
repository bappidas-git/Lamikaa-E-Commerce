import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./ChapterNav.module.css";

// =============================================================================
// ChapterNav — the product page's own index
// =============================================================================
//
// The PDP's story runs long: overview now, and benefits, ingredients,
// directions, the farmer story, the full INCI list, FAQs, reviews and the
// ritual cross-sell as Prompt 27 adds them. A slim glass pill bar is what
// replaces the tab strip that used to hide eight of those behind one — every
// chapter is on the page, and this says where you are in it and how to get
// anywhere else.
//
// IT IS NOT THERE UNTIL IT IS USEFUL. Below 320px of scroll the purchase panel
// is still the whole point of the page and the bar would only crowd it, so the
// nav is hidden — `visibility`/`opacity`, never `display`, so nothing on the
// page moves when it arrives. It steps aside again while a drawer, modal or
// search overlay is up (`body[data-drawer-open]`, the reference-counted flag
// from ui/Drawer), because two sticky layers over a scrim is one too many.
//
// THE ACTIVE CHAPTER IS OBSERVED, NOT COMPUTED. One IntersectionObserver with a
// reading band for a root margin (the middle of the viewport, roughly) reports
// which sections are being read; the first one in document order wins. Nothing
// is measured on scroll, so the bar costs one style write per crossing rather
// than a layout read per frame.
//
// THEY ARE LINKS, because they are addresses. `href="#chapter"` means the pills
// are keyboard-reachable, middle-clickable and still work if the click handler
// never runs; the handler only upgrades the jump to a smooth one and moves
// focus into the chapter it landed on (the section carries tabIndex={-1} for
// exactly that — see Chapter.js). `aria-current` marks the one being read.
//
// ONE CHAPTER IS NOT AN INDEX. With fewer than two targets the bar renders
// nothing at all: a navigation offering the place you are already standing in
// is chrome, not a shortcut.
//
// Props:
//   chapters  array   `[{ id, label }]` in document order — the page owns it,
//                     because the page decides which chapters exist
//   className string
// =============================================================================

/** How far down the page the bar earns its place. */
export const REVEAL_AFTER = 320;

/**
 * The reading band: the top 30% and bottom 55% of the viewport are excluded, so
 * a chapter counts as "being read" only while it crosses the upper-middle of
 * the screen — where a reader's eye actually is.
 */
const READING_BAND = "-30% 0px -55% 0px";

const ChapterNav = ({ chapters = [], className = "" }) => {
  const reduceMotion = useReducedMotion();
  const behavior = reduceMotion ? "auto" : "smooth";

  const rows = useMemo(
    () =>
      (Array.isArray(chapters) ? chapters : []).filter(
        (row) => row && row.id && row.label
      ),
    [chapters]
  );
  // A string, not the array: the effects below must not tear down and rebuild
  // an observer because a parent re-rendered and handed back a new array with
  // the same chapters in it.
  const idKey = rows.map((row) => row.id).join("|");

  const [activeId, setActiveId] = useState("");
  const [revealed, setRevealed] = useState(false);

  // ---- Reveal after REVEAL_AFTER px ---------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onScroll = () => setRevealed(window.scrollY > REVEAL_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---- Which chapter is being read ----------------------------------------
  const visibleRef = useRef(null);
  if (visibleRef.current === null) visibleRef.current = new Set();

  useEffect(() => {
    const ids = idKey ? idKey.split("|") : [];
    if (
      ids.length === 0 ||
      typeof document === "undefined" ||
      typeof window === "undefined" ||
      typeof window.IntersectionObserver !== "function"
    ) {
      // No observer (jsdom, an old browser): the first chapter is the honest
      // answer, and every pill still works as a link.
      setActiveId(ids[0] || "");
      return undefined;
    }

    const nodes = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (nodes.length === 0) {
      setActiveId(ids[0]);
      return undefined;
    }

    const visible = visibleRef.current;
    visible.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        // The first chapter in DOCUMENT order that is in the band. Reading down
        // the page, that is the one whose heading you have just passed.
        const next = ids.find((id) => visible.has(id));
        if (next) setActiveId(next);
      },
      { rootMargin: READING_BAND, threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    setActiveId((current) => current || ids[0]);

    return () => {
      observer.disconnect();
      visible.clear();
    };
  }, [idKey]);

  // ---- The strip keeps its active pill in view -----------------------------
  // `scrollTo` on the list rather than `scrollIntoView` on the pill: the latter
  // walks up every scrollable ancestor and would drag the PAGE sideways to
  // satisfy a bar the visitor is not looking at.
  const listRef = useRef(null);
  const pillRefs = useRef({});
  useEffect(() => {
    const list = listRef.current;
    const pill = pillRefs.current[activeId];
    if (!list || !pill || typeof list.scrollTo !== "function") return;
    const left = pill.offsetLeft - (list.clientWidth - pill.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior });
  }, [activeId, behavior]);

  const jumpTo = useCallback(
    (event, id) => {
      const section = typeof document !== "undefined" && document.getElementById(id);
      if (!section) return; // let the browser follow the href
      event.preventDefault();
      section.scrollIntoView({ behavior, block: "start" });
      // `preventScroll` so landing focus does not cut the smooth scroll short.
      section.focus({ preventScroll: true });
      setActiveId(id);
    },
    [behavior]
  );

  if (rows.length < 2) return null;

  return (
    <nav
      aria-label="On this page"
      className={[
        "sf-glass",
        styles.nav,
        revealed ? styles.revealed : styles.hidden,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ol ref={listRef} className={styles.list} role="list">
        {rows.map((row) => {
          const active = row.id === activeId;
          return (
            <li key={row.id} className={styles.item}>
              <a
                ref={(node) => {
                  pillRefs.current[row.id] = node;
                }}
                href={`#${row.id}`}
                className={[styles.pill, active ? styles.pillActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                aria-current={active ? "true" : undefined}
                /* Out of the tab order while the bar is invisible: a hidden
                   control a keyboard visitor can still land on is a trap. */
                tabIndex={revealed ? undefined : -1}
                onClick={(event) => jumpTo(event, row.id)}
              >
                {row.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ChapterNav;
