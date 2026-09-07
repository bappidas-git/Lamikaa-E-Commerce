import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import { stripPlaceholderSentences } from "../../utils/placeholders";
import { faqLimit } from "../../utils/faqs";
import { Accordion, ContentBlocks } from "../ui";
import styles from "./FAQ.module.css";

// =============================================================================
// FAQ — the one accordion every answered question on the storefront is read in
// =============================================================================
//
// The home block (Prompt 21), the FAQ page (28) and the PDP's FAQs panel (27)
// all mount THIS component over the `Accordion` primitive. That is the whole
// point of the rewrite: an accordion is one of the easiest components to ship
// inaccessibly, and a storefront that hand-rolls it three times ships three
// different keyboard models. Everything the pattern owes a visitor — a real
// <button> in a heading, `aria-expanded`/`aria-controls`, ArrowUp/ArrowDown/
// Home/End between headers, a collapsed panel that leaves the tab order — comes
// from the primitive and is not restated here.
//
// This file owns the three things that are about ANSWERS rather than about
// disclosure:
//
//   1. THE COPY IS DATA, AND THE FIGURES IN IT ARE LIVE. An answer is stored
//      with `{freeShipping}` / `{codSentence}` / `{taxNote}` where a store
//      figure belongs, and `useStoreSettings().fillCopy` resolves them at render
//      time — so one edit in Settings re-words every answer that quotes a
//      threshold instead of leaving a contradiction on the page.
//
//   2. A TOKEN NEVER PRINTS. `stripPlaceholderSentences` takes the whole
//      SENTENCE off the page when it still quotes a `{{TOKEN}}` nobody has
//      supplied, keeping the sentences either side of it. A row left with no
//      answer at all is dropped rather than rendered as an empty drawer: a
//      question the site cannot answer is worse than a question it does not ask.
//      (`fillCopy` already ends on the same strip; running it again here is what
//      makes the invariant true for a caller who hands us raw rows.)
//
//   3. DEEP LINKS. Every row carries the anchor id `faq-<id>`, so `/faq#faq-7`
//      and `/#faq-3` open that answer and bring it into view. The hash is read
//      through react-router, so an in-app link to another row works as well as a
//      cold load on one.
//
// ANSWERS ARE PLAIN TEXT, rendered through `ContentBlocks` — which splits the
// paragraphs, understands the markdown-lite the rest of the site content is
// written in, and cannot produce markup, so the worst an admin can do by pasting
// HTML into an answer is publish some visible angle brackets.
// =============================================================================

/** The anchor a row is linkable at. One place, because the CSS and the hash
 *  handler and any future "copy link" control all have to agree on it. */
export const faqAnchorId = (faq) => `faq-${faq?.id ?? ""}`;

/**
 * One answer, ready to print: store figures filled in, sentences that still
 * quote an unsupplied fact removed, and "" when nothing publishable is left.
 *
 * Exported for the unit test — this is the rule the whole prompt turns on.
 */
export const faqAnswerText = (answer, fillCopy) =>
  stripPlaceholderSentences(
    typeof fillCopy === "function" ? fillCopy(answer) : answer
  ).trim();

// `h1` is never offered: a page has one, and it is never a FAQ question.
const headingTag = (level) => {
  const n = Math.trunc(Number(level));
  return `h${Number.isFinite(n) && n >= 2 && n <= 6 ? n : 3}`;
};

const FAQ = ({
  faqs = [],
  limit,
  defaultOpen,
  multiple = false,
  id,
  headingLevel = 3,
  className = "",
  ...rest
}) => {
  // The shipping, COD and tax figures in the answers are the store's own.
  const { fillCopy } = useStoreSettings();
  const { hash } = useLocation();
  const reduce = useReducedMotion();

  const items = useMemo(
    () =>
      faqLimit(Array.isArray(faqs) ? faqs : [], limit)
        .map((faq) => ({ faq, answer: faqAnswerText(faq?.answer, fillCopy) }))
        // Both halves have to survive: a row with no question cannot be opened,
        // and a row whose every sentence quoted a token has nothing to open on.
        .filter(({ faq, answer }) => faq?.question && answer)
        .map(({ faq, answer }) => ({
          id: faqAnchorId(faq),
          title: (
            // The anchor sits on the question rather than on the row, because
            // the row is the primitive's markup and this is not: a <span> inside
            // the trigger is a legal target for `#faq-7`, scrolls the whole row
            // into view, and costs the primitive nothing.
            <span id={faqAnchorId(faq)} className={styles.anchor}>
              {faq.question}
            </span>
          ),
          content: (
            <ContentBlocks
              text={answer}
              variant="prose"
              className={styles.answer}
            />
          ),
        })),
    [faqs, limit, fillCopy]
  );

  // The row the URL is asking for, but only when it is one of ours — a hash
  // meant for another section must not open an unrelated answer.
  const target = typeof hash === "string" ? hash.replace(/^#/, "") : "";
  const deepLink =
    target && items.some((item) => item.id === target) ? target : null;

  useEffect(() => {
    if (!deepLink) return;
    const anchor = document.getElementById(deepLink);
    if (!anchor) return;
    // Focus first, scroll second: a visitor who arrived on a deep link asked for
    // THIS answer, so the keyboard should already be on its trigger. Scrolling
    // is left to `scrollIntoView` (centred, and clear of the sticky masthead)
    // rather than to the focus call, which would only just clear the top edge.
    anchor.closest("button")?.focus({ preventScroll: true });
    // Guarded: jsdom has no scrollIntoView, and neither does every embedded
    // browser — the row is open and focused either way.
    anchor.scrollIntoView?.({
      block: "center",
      behavior: reduce ? "auto" : "smooth",
    });
  }, [deepLink, reduce]);

  if (!items.length) return null;

  return (
    <Accordion
      // The primitive owns its open set from mount, which is the right default
      // for a click. A hash is a NAVIGATION, though, so re-keying on it is what
      // makes a link to `#faq-3` open row 3 from elsewhere on the same page and
      // not only on a cold load.
      key={deepLink || "faq"}
      id={id}
      items={items}
      multiple={multiple}
      defaultOpen={deepLink || defaultOpen}
      headingLevel={headingTag(headingLevel)}
      className={[styles.faq, className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
};

export default FAQ;
