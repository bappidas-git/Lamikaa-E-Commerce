import React from "react";
import brand from "../../config/brand";
import styles from "./LegalNote.module.css";

// =============================================================================
// LegalNote — the farmer-ownership sentence, wherever ownership is stated
// =============================================================================
// One component owns the qualifier so it cannot drift: the footer, the About
// section (Prompt 17), the PDP (Prompt 25) and the content pages (Prompt 28)
// all render THIS, and none of them retypes the sentence.
//
// THE TEXT IS `brand.legalNote`, VERBATIM. BRAND.md §3.9 rule 2 makes the
// qualifiers part of the copy rather than decoration: profits "can" reach
// member farmers "as dividends", "subject to applicable laws and the company's
// dividend declaration". This component therefore takes no `children` and no
// text prop — there is nothing to override, and a caller that could pass its
// own string is a caller that can drop a qualifier.
//
// The leaf is `aria-hidden`: it marks the note visually and says nothing a
// screen reader needs to hear before the sentence itself.
//
//   compact   drops the leaf and the indent, for a tight slot (a drawer foot,
//             a sidebar rail) where the note is a footnote rather than a block.
//   as        the element to render — <p> by default; pass "div" when the note
//             already sits inside a paragraph-level container.
// =============================================================================

const LegalNote = ({ compact = false, as: Component = "p", className = "" }) => (
  <Component
    className={[styles.note, compact ? styles.compact : "", className]
      .filter(Boolean)
      .join(" ")}
  >
    {!compact && (
      <svg
        className={styles.leaf}
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        {/* A single leaf on its stem — the same drawing language as the rest of
            the brand marks: one solid path, no strokes, no second colour. */}
        <path d="M20.5 3.5c-7.4-.6-12.2 1.5-14.7 4.6-2.3 2.9-2.2 6.6-.5 9.1L3 19.5l1.4 1.4 2.3-2.3c2.5 1.7 6.2 1.8 9.1-.5 3.1-2.5 5.2-7.3 4.6-14.7zM8.7 16.9c-1-1.6-1-3.9.4-5.7 1.6-2 4.6-3.6 9.4-3.6-.9 3.9-2.5 6.4-4.3 7.9-1.8 1.4-4 1.5-5.5.5l4.9-4.9-1.4-1.4-4.9 4.9z" />
      </svg>
    )}
    <span className={styles.text}>{brand.legalNote}</span>
  </Component>
);

export default LegalNote;
