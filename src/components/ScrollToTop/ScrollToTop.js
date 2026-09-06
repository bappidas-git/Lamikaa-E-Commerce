import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";

// =============================================================================
// ScrollToTop — scroll restoration, with the three exceptions that matter
// =============================================================================
//
// A single-page app keeps the window's scroll position across a route change,
// which means arriving at a new page halfway down it. Resetting the scroll is
// the default, but three cases must NOT reset (Prompt 08):
//
//   1. A HASH LINK (`/faq#orders`, a PDP chapter jump). The visitor asked for a
//      place inside the page, so we scroll THAT into view instead — smoothly,
//      unless the visitor has asked for reduced motion, in which case the jump
//      is instant. The target may belong to a lazily-loaded chunk that has not
//      painted yet, so we look for it across a few frames before giving up.
//   2. `state.preserveScroll`. A page that navigates to itself to record state
//      in the URL (a filter, a tab, a step) passes this so the list does not
//      jump to the top under the visitor's hands.
//   3. A QUERY-ONLY change. The effect keys on `pathname`, so `?concern=glow`
//      or `?page=2` never triggers it — those pages scroll themselves where
//      they want to.
//
// The reset itself is INSTANT (`behavior: "auto"`), not smooth: the page
// transition in App.js already fades the old page out and the new one in, and a
// 600ms smooth scroll underneath that reads as a second, competing animation.
// =============================================================================

/** How many frames to keep looking for a hash target before giving up. */
const HASH_TARGET_FRAMES = 30;

const ScrollToTop = () => {
  const { pathname, hash, state } = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (state?.preserveScroll) return undefined;

    if (hash) {
      // `#a-b` is a valid id but not a valid unescaped selector in every
      // browser, so look the element up by id rather than by querySelector.
      const id = decodeURIComponent(hash.slice(1));
      if (!id) return undefined;

      let frame = 0;
      let raf = 0;
      const look = () => {
        const target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });
          // The visitor asked to go somewhere; a keyboard visitor should
          // continue FROM there, not from the top of the document.
          if (target.tabIndex < 0) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
          return;
        }
        if (frame < HASH_TARGET_FRAMES) {
          frame += 1;
          raf = window.requestAnimationFrame(look);
        }
      };
      raf = window.requestAnimationFrame(look);
      return () => window.cancelAnimationFrame(raf);
    }

    window.scrollTo({ top: 0, behavior: "auto" });
    return undefined;
  }, [pathname, hash, state, reduceMotion]);

  return null;
};

export default ScrollToTop;
