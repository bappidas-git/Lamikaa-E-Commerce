import React from "react";
import { Link } from "react-router-dom";
import { resolveRitualSteps } from "../../services/api";
import { ritualPath } from "../../utils/categories";
import { onImageError } from "../../utils/helpers";
import { stageSrc } from "../../utils/product";
import { Chip, GlassCard } from "../ui";
import styles from "./RitualCard.module.css";

// =============================================================================
// RitualCard — one routine, as a card
// =============================================================================
//
// A ritual is an ORDERED run over real catalogue products, so the card has to
// show the order rather than describe it: a strip of the step products' own
// labels, numbered, in the sequence the range was designed to be used. Shared
// by the home teaser (Prompt 18) and, through `compact`, by the rituals index
// and the cross-links Prompt 24 adds — a card that reads differently in two
// places is two cards to keep in step.
//
// THE WHOLE CARD IS ONE LINK, and nothing inside it is interactive. A routine
// has exactly one destination; a thumbnail that linked to its own PDP would
// give a keyboard visitor six stops to five different places inside one tile,
// and nest an anchor inside an anchor doing it. The `<Link>` carries the full
// accessible name ("The Morning Glow Ritual, 4 steps"), every image takes
// `alt=""`, and the step strip is `aria-hidden` — it is the sequence drawn, and
// the sequence is already in the name.
//
// THE STEPS ARE RESOLVED HERE, not by the caller. `resolveRitualSteps` (the
// pure half of `apiService.rituals.resolveSteps` — no fetching, no mode branch)
// attaches each step's product, and its ALTERNATIVE where one exists: the soap
// and the body wash are both step one of the body ritual, so that step shows
// two thumbs, the alternative peeking out from behind the primary. A step whose
// product is missing keeps its numeral and shows an empty plate — an empty
// shelf is honest, a borrowed one is not (the same rule CategoryCard follows).
//
// EVERY WORD IS THE RITUAL'S OWN. Name, tagline, story and duration come from
// the record the admin edits. The only strings this file types are the section
// furniture: the "Ritual · N steps" eyebrow and the "See the ritual" CTA.
//
// Props:
//   ritual    object   the ritual record (required)
//   products  array    the catalogue the steps resolve against
//   compact   boolean  drop the photograph — for a rail or a sidebar where the
//                      card is one of several and the images would stack up
// =============================================================================

// Five thumbs is the longest strip that stays a glance. The seeded rituals run
// to five steps; a sixth would wrap the row and turn the sequence into a list.
const MAX_STRIP_STEPS = 5;

// 40px on the page, so 80 covers a 2x screen.
const THUMB_WIDTH = 80;

/**
 * The one line under the ritual's name.
 *
 * The tagline when the owner has written one, otherwise the first sentence of
 * the story — never a truncation at N characters, which cuts mid-word and
 * promises a "…" the copy never earned. A ritual with neither says nothing.
 *
 * Exported for the unit test: it is the only copy decision in this file.
 */
export const ritualBlurb = (ritual) => {
  const tagline = typeof ritual?.tagline === "string" ? ritual.tagline.trim() : "";
  if (tagline) return tagline;
  const story = typeof ritual?.story === "string" ? ritual.story.trim() : "";
  if (!story) return "";
  // The first terminator followed by a space or the end of the string — so
  // "5 p.m." style abbreviations inside a sentence do not end it early.
  const end = story.search(/[.!?](\s|$)/);
  return end === -1 ? story : story.slice(0, end + 1);
};

/** "Ritual · 4 steps" — and "1 step", because a card should not misspell one. */
export const stepCountLabel = (count) => {
  const n = Number.isFinite(Number(count)) ? Math.max(0, Number(count)) : 0;
  return `Ritual · ${n} ${n === 1 ? "step" : "steps"}`;
};

/** "01" — the strip's numerals, padded like every other numeral on the site. */
const numeral = (order, index) =>
  String(Number.isFinite(Number(order)) ? Number(order) : index + 1).padStart(2, "0");

/** One 40px plate, or an empty one where the step's product is unknown. */
const Thumb = ({ product, className = "" }) => (
  <span className={`sf-plate ${styles.thumb} ${className}`.trim()}>
    {product ? (
      <img
        src={stageSrc(product, { w: THUMB_WIDTH })}
        alt=""
        loading="lazy"
        decoding="async"
        onError={onImageError}
      />
    ) : null}
  </span>
);

const RitualCard = ({ ritual, products = [], compact = false, className = "" }) => {
  if (!ritual) return null;

  const steps = resolveRitualSteps(ritual, products);
  const strip = steps.slice(0, MAX_STRIP_STEPS);
  const blurb = ritualBlurb(ritual);
  const name = ritual.name || "";

  return (
    <GlassCard
      as="article"
      interactive
      glow="violet"
      // 20px is not on the padding scale (16 / 24 / 32), so the card takes
      // none and sets its own — see the module.
      padding="none"
      className={[styles.card, compact ? styles.compact : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      <Link
        to={ritualPath(ritual)}
        className={styles.link}
        aria-label={`${name}, ${steps.length} ${steps.length === 1 ? "step" : "steps"}`}
      >
        {!compact && ritual.image ? (
          <span className={`sf-placeholder-media ${styles.media}`}>
            <img
              className={styles.image}
              src={ritual.image}
              alt=""
              loading="lazy"
              decoding="async"
              onError={onImageError}
            />
          </span>
        ) : null}

        <span className={styles.body}>
          <span className={`sf-eyebrow ${styles.eyebrow}`}>
            {stepCountLabel(steps.length)}
          </span>
          <span className={styles.name}>{name}</span>
          {blurb ? <span className={styles.blurb}>{blurb}</span> : null}

          {/* The sequence, drawn. Decoration: the link's name already says how
              many steps there are, and the plates carry no words of their own. */}
          {strip.length > 0 ? (
            <span className={styles.strip} aria-hidden="true">
              {strip.map((step, index) => (
                <span className={styles.step} key={`${step.order}-${index}`}>
                  <Thumb product={step.product} />
                  {step.alternativeProduct ? (
                    <Thumb product={step.alternativeProduct} className={styles.alt} />
                  ) : null}
                  <Chip variant="step" className={styles.numeral}>
                    {numeral(step.order, index)}
                  </Chip>
                </span>
              ))}
            </span>
          ) : null}

          {ritual.duration ? (
            <span className={styles.duration}>{ritual.duration}</span>
          ) : null}

          {/* A ghost button's look without its role: the card is the control,
              and a second one inside it would be a second tab stop. */}
          <span className={styles.cta}>
            See the ritual <span aria-hidden="true">→</span>
          </span>
        </span>
      </Link>
    </GlassCard>
  );
};

export default RitualCard;
