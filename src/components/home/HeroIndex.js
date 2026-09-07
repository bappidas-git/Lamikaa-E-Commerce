import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import styles from "./HeroCarousel.module.css";

// =============================================================================
// HeroIndex — the hero's control rail
// =============================================================================
//
// Everything the visitor can do to the carousel, in one row under the copy
// (desktop, left column) or under the card (mobile):
//
//   ‹ ›        prev / next, 44px glass circles, shown when `showArrows`
//   ⏸ / ▶      pause / play — present whenever autoplay can run (WCAG 2.2.2)
//   01 / 08    the counter, decorative: the eyebrow above already says it in
//              words a screen reader can use
//   ───────    the progress hairline: a signature-gradient fill that runs for
//              exactly one interval, FREEZES on pause in step with the banked
//              timer, and restarts with each slide
//   names      one plain button per product — no tablist, because the media it
//              controls is not a tabpanel and a half-implemented tablist is
//              worse for a screen reader than a labelled button
//
// It shares HeroCarousel.module.css deliberately: the rail is part of the hero's
// composition (it aligns to the copy column's grid, inherits its rhythm and its
// breakpoints), and a second stylesheet would be two files to keep in step.
//
// The rail scrolls horizontally with snap on mobile and wraps to two rows on
// desktop. When the active product moves off-screen in the scrolling rail, the
// rail — and only the rail — is scrolled to bring it back; the page is never
// moved under the visitor.
// =============================================================================

/** "3" -> "03". Declared here rather than imported from HeroCarousel, which
    imports this file — a two-line helper is not worth a module cycle. */
const padIndex = (value) => String(value).padStart(2, "0");

const HeroIndex = ({
  index,
  total,
  names = [],
  shortNames = [],
  intervalMs,
  autoplayOn = false,
  paused = false,
  userPaused = false,
  showArrows = true,
  showCounter = true,
  showProgress = true,
  showIndex = true,
  onSelect,
  onPrev,
  onNext,
  onTogglePause,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const railRef = useRef(null);
  const buttonsRef = useRef([]);

  // Keep the active name in view inside the scrolling rail without touching the
  // page's own scroll position.
  useEffect(() => {
    const rail = railRef.current;
    const button = buttonsRef.current[index];
    if (!rail || !button) return;
    if (rail.scrollWidth <= rail.clientWidth) return;
    const left = button.offsetLeft - (rail.clientWidth - button.offsetWidth) / 2;
    const target = Math.max(0, left);
    if (typeof rail.scrollTo === "function") {
      rail.scrollTo({
        left: target,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    } else {
      rail.scrollLeft = target;
    }
  }, [index, prefersReducedMotion]);

  // Before the catalogue answers there is nothing to control — but the rail's
  // BOX still renders, because .rail reserves its height in CSS and an element
  // that is not there cannot reserve anything. The page below the hero would
  // otherwise drop by the rail's height the moment the products arrive.
  if (total < 1) return <div className={styles.rail} />;

  const multiple = total > 1;
  const showRail = showIndex && multiple;
  const showSteppers = showArrows && multiple;

  return (
    <div className={styles.rail}>
      {(showSteppers || autoplayOn || showCounter || showProgress) && (
        <div className={styles.railControls}>
          {showSteppers && (
            <>
              <button
                type="button"
                className={styles.stepper}
                onClick={onPrev}
                aria-label="Previous product"
              >
                <Icon icon="mdi:chevron-left" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.stepper}
                onClick={onNext}
                aria-label="Next product"
              >
                <Icon icon="mdi:chevron-right" aria-hidden="true" />
              </button>
            </>
          )}

          {/* Never rendered without autoplay, and autoplay is never run without
              it — HeroCarousel turns autoplay off when this control is hidden. */}
          {autoplayOn && (
            <button
              type="button"
              className={styles.stepper}
              onClick={onTogglePause}
              aria-pressed={userPaused}
              aria-label={
                userPaused ? "Play the carousel" : "Pause the carousel"
              }
            >
              <Icon
                icon={userPaused ? "mdi:play" : "mdi:pause"}
                aria-hidden="true"
              />
            </button>
          )}

          {showCounter && multiple && (
            <span className={styles.counter} aria-hidden="true">
              {padIndex(index + 1)}
              <i className={styles.counterRule} />
              {padIndex(total)}
            </span>
          )}

          {showProgress && autoplayOn && (
            <span className={styles.progress} aria-hidden="true">
              {/* Keyed on the slide so every change restarts the fill; the
                  play state — not a remount — is what freezes it on pause, so
                  it resumes exactly where the banked timer does. */}
              <span
                key={`${index}-${total}`}
                className={styles.progressFill}
                style={{
                  animationDuration: `${intervalMs}ms`,
                  animationPlayState: paused ? "paused" : "running",
                }}
              />
            </span>
          )}
        </div>
      )}

      {showRail && (
        <div
          ref={railRef}
          className={styles.names}
          role="group"
          aria-label="Choose a product"
        >
          {names.map((name, i) => (
            <button
              key={`${name}-${i}`}
              type="button"
              ref={(el) => {
                buttonsRef.current[i] = el;
              }}
              className={[styles.name, i === index ? styles.nameActive : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect?.(i)}
              aria-label={`Show slide ${i + 1}: ${name}`}
              aria-current={i === index ? "true" : undefined}
            >
              {shortNames[i] || name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroIndex;
