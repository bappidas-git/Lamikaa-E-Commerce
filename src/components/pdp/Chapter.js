import React from "react";
import { SectionHeading } from "../ui";

// =============================================================================
// Chapter — one numbered section of a product's story
// =============================================================================
//
// The PDP below the purchase panel is not a tab strip any more; it is a
// document. Every part of it — the overview, and the benefits, ingredients,
// directions, farmer story, FAQs and reviews Prompt 27 adds — is one of these:
// a titled section with an id, a heading and a place in `ChapterNav`.
//
// WHY A COMPONENT AND NOT A DIV. Three things have to agree across every
// chapter or the nav breaks: the section's `id` (what the nav links to), the
// heading's id (what `aria-labelledby` points at) and the numeral in the
// eyebrow. Written once here, they cannot drift; written per chapter, they
// would.
//
// IT HAS NO STYLESHEET OF ITS OWN. The rhythm is `.sf-section--tight` (60% of
// --sf-section-y, DESIGN_SYSTEM §3) and the type is `SectionHeading`'s — the
// same cluster the home sections, the shop chapters and the content pages use.
// What is left is the scroll offset under the sticky nav, which belongs to the
// PAGE (only it knows how tall its own chrome is) and arrives as `className`.
//
// THE SECTION IS THE FOCUS TARGET, not the heading. `ChapterNav` moves focus
// when it jumps, so a keyboard visitor lands IN the chapter rather than being
// left on the pill they pressed; focusing the region (labelled by its own
// heading) announces the chapter's name and puts the next Tab inside it.
// =============================================================================

/** "01", "02", … — the numeral in a chapter's eyebrow. */
export const chapterNumeral = (index) => String(Number(index) + 1).padStart(2, "0");

/** The heading id derived from a chapter id — the `aria-labelledby` contract. */
export const chapterHeadingId = (id) => `${id}-title`;

const Chapter = ({
  id,
  index = 0,
  title,
  eyebrow,
  lede,
  className = "",
  children,
}) => {
  if (!id || !title) return null;

  const headingId = chapterHeadingId(id);

  return (
    <section
      id={id}
      /* Programmatically focusable so a jump lands here; never in the tab
         order, because a chapter is a place, not a control. */
      tabIndex={-1}
      aria-labelledby={headingId}
      data-chapter={id}
      className={["sf-section--tight", className].filter(Boolean).join(" ")}
    >
      <SectionHeading
        as="h2"
        id={headingId}
        eyebrow={eyebrow ?? `Chapter ${chapterNumeral(index)}`}
        title={title}
        lede={lede}
        rule
      />
      {children}
    </section>
  );
};

export default Chapter;
