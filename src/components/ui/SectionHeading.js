import React from "react";
import styles from "./SectionHeading.module.css";

// =============================================================================
// SectionHeading — the eyebrow / headline / lede cluster every section opens on
// =============================================================================
//
// Three lines of type with one rule between them, used identically by the home
// sections, the shop chapters, the PDP chapters and the content pages. Having
// it in one place is what makes those pages read as one document rather than as
// twelve teams' headings stacked.
//
//   eyebrow   gold, tracked, uppercase (`.sf-eyebrow`), optionally preceded by
//             a 24px signature-gradient hairline (`rule`)
//   title     Fraunces, at the level `as` names — h2 by default. A page has one
//             <h1>, so a section that is not the page's subject must not take it.
//   lede      one quiet line in --sf-color-text-secondary, held to 60ch
//   actions   a "View all" or a filter row: right-aligned beside the cluster on
//             a desktop, stacked underneath on a phone
//
// GRADIENT WORD. `gradientWord` is the INDEX of the one headline word to set in
// the signature gradient. One word — the budget in DESIGN_SYSTEM §5 is one
// gradient keyword per section, and a whole headline in gradient is a
// screensaver. Out-of-range indices simply do nothing.
// =============================================================================

const SectionHeading = ({
  eyebrow,
  title,
  lede,
  align = "left",
  as: Heading = "h2",
  id,
  rule = false,
  gradientWord,
  actions,
  className = "",
  children,
  ...rest
}) => {
  // The headline, with at most one word wrapped. Splitting on spaces keeps the
  // words as they were authored — no re-wrapping, no lost punctuation.
  const renderTitle = () => {
    if (typeof title !== "string" || !Number.isInteger(gradientWord)) return title;
    const words = title.split(" ");
    if (gradientWord < 0 || gradientWord >= words.length) return title;
    return words.map((word, index) => (
      <React.Fragment key={`${word}-${index}`}>
        {index > 0 ? " " : ""}
        {index === gradientWord ? (
          <span className="sf-gradient-text">{word}</span>
        ) : (
          word
        )}
      </React.Fragment>
    ));
  };

  return (
    <div
      className={[styles.wrap, styles[align] || "", className].filter(Boolean).join(" ")}
      {...rest}
    >
      <div className={styles.cluster}>
        {eyebrow ? (
          <p className={`sf-eyebrow ${rule ? "sf-eyebrow--rule" : ""} ${styles.eyebrow}`}>
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <Heading id={id} className={styles.title}>
            {renderTitle()}
          </Heading>
        ) : null}
        {lede ? <p className={styles.lede}>{lede}</p> : null}
        {children}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
};

export default SectionHeading;
