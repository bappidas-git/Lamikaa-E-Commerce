import { useEffect, useState } from "react";

// =============================================================================
// useInView(ref, { once, amount }) — "is this element on screen?"
// =============================================================================
// A thin IntersectionObserver wrapper for the handful of places that need the
// ANSWER rather than an animation: VideoPlayer pauses when it scrolls away,
// the hero stops autoplaying off-screen, lazy sections decide whether to fetch.
// Scroll-triggered ENTRANCES do not belong here — those are framer-motion's
// `whileInView` through `reveal()` in theme/motion.js, which already batches
// its own observers.
//
// `amount` is the fraction of the element that must be visible (the same name
// framer-motion's viewport option uses, so the two read alike). `once` freezes
// the answer at true after the first intersection, which is what a reveal wants
// and what a "pause when hidden" player must NOT have.
//
// Where IntersectionObserver is unavailable (jsdom in the test run, very old
// browsers) the hook reports `true`: content is visible, videos are playable,
// nothing is gated behind an API that never answers.
// =============================================================================

const hasIO = () =>
  typeof window !== "undefined" && typeof window.IntersectionObserver === "function";

/**
 * @param {React.RefObject<Element>} ref
 * @param {object}  [options]
 * @param {boolean} [options.once]    stop observing after the first entry (default true)
 * @param {number}  [options.amount]  visible fraction that counts as "in view" (default 0.15)
 * @returns {boolean}
 */
export default function useInView(ref, { once = true, amount = 0.15 } = {}) {
  const [inView, setInView] = useState(() => !hasIO());

  useEffect(() => {
    const node = ref.current;
    if (!node || !hasIO()) {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: amount }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, once, amount]);

  return inView;
}
