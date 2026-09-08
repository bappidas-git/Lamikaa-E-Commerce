import React, { useMemo } from "react";
import { parseBlocks, renderInline } from "../../utils/contentBlocks";
import Chip from "./Chip";
import styles from "./ContentBlocks.module.css";

// =============================================================================
// ContentBlocks — admin-authored copy, rendered
// =============================================================================
//
// The other half of utils/contentBlocks.js: that file turns text into a block
// list, this one turns a block list into elements. Pass `text` and it parses;
// pass `blocks` and it renders what you hand it (the admin preview parses once
// per keystroke and passes the result).
//
// NOTHING HERE TOUCHES innerHTML. Every block is a real element and every
// inline run is a React node, so the worst a store owner can do by pasting
// markup into the admin is publish some visible angle brackets.
//
// TWO VARIANTS
//   prose      the default: 68ch measure, the reading column of a policy page,
//              an FAQ answer or a PDP chapter
//   editorial  a wider measure, a drop cap on the opening paragraph and quotes
//              set as pull-quotes — for the About and Why LAMIKAA pages, where
//              the text IS the page rather than support for something else
//
// `steps` is the value-chain stepper: a gradient-ringed numeral per step with a
// connector running between them, which is the same visual language the ritual
// steps use on a PDP. It is a real <ol>, so the order is in the markup and not
// only in the picture.
//
// `dropCap` (editorial only) exists for a body rendered in more than one run.
// The About page (Prompt 28) breaks its copy around the `::steps` block so the
// value chain can be drawn by `ValueChain` rather than by the generic stepper,
// which leaves a second, third and fourth <ContentBlocks> further down the same
// article — and each of them would open its first paragraph on a drop cap. A
// page opens once; the continuation runs pass `dropCap={false}`.
// =============================================================================

const ContentBlocks = ({
  text,
  blocks,
  variant = "prose",
  dropCap = true,
  className = "",
  ...rest
}) => {
  // Parsing is pure and cheap, but it runs on every keystroke in the admin's
  // live preview — memoising on the text is what keeps that typing smooth.
  const parsed = useMemo(
    () => (Array.isArray(blocks) ? blocks : parseBlocks(text)),
    [blocks, text]
  );

  if (!parsed.length) return null;

  // The first paragraph is the one that takes the drop cap in editorial. Found
  // by index rather than by CSS `:first-of-type` because a page may open on a
  // heading, and a drop cap belongs to the opening PROSE. `-1` is "no paragraph
  // here", which is also what a continuation run asks for with `dropCap={false}`
  // — no index can match it, so no letter is set.
  const firstParagraph = dropCap
    ? parsed.findIndex((block) => block.type === "p")
    : -1;

  return (
    <div
      className={[styles.root, styles[variant] || styles.prose, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {parsed.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "h2":
            return (
              <h2 key={key} className={styles.h2}>
                {renderInline(block.text, key)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={key} className={styles.h3}>
                {renderInline(block.text, key)}
              </h3>
            );
          case "ul":
            return (
              <ul key={key} className={styles.list}>
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className={`${styles.list} ${styles.ordered}`}>
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={key} className={styles.quote}>
                {renderInline(block.text, key)}
              </blockquote>
            );
          case "callout":
            return (
              <aside key={key} className={`sf-glass ${styles.callout}`}>
                {block.title ? (
                  <p className={`sf-eyebrow ${styles.calloutTitle}`}>{block.title}</p>
                ) : null}
                {block.items.map((item, i) => (
                  <p key={`${key}-${i}`} className={styles.calloutBody}>
                    {renderInline(item, `${key}-${i}`)}
                  </p>
                ))}
              </aside>
            );
          case "steps":
            return (
              <ol key={key} className={styles.steps}>
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`} className={styles.step}>
                    <Chip variant="step" className={styles.stepChip}>
                      {i + 1}
                    </Chip>
                    <span className={styles.stepText}>
                      {renderInline(item, `${key}-${i}`)}
                    </span>
                  </li>
                ))}
              </ol>
            );
          case "hr":
            return <hr key={key} className={`sf-hairline ${styles.rule}`} />;
          case "p":
          default:
            return (
              <p
                key={key}
                className={[
                  styles.p,
                  index === firstParagraph ? styles.lead : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {renderInline(block.text, key)}
              </p>
            );
        }
      })}
    </div>
  );
};

export default ContentBlocks;
