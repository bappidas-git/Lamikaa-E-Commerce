import React, { useMemo } from "react";
import { useFaqs } from "../../context/FaqContext";
import { ROUTES } from "../../utils/constants";
import { Button, SectionHeading } from "../ui";
import FAQ from "../FAQ/FAQ";
import styles from "./HomeFaqs.module.css";

// =============================================================================
// HomeFaqs — the last thing the home page says before the footer
// =============================================================================
//
// The page has made its case: the range, the people who own it, the ingredient,
// the rituals, the pillars. What is left is the small print a visitor actually
// wants before they buy — who owns this, does buying it reach a farmer, will it
// suit my skin, when does it arrive — and this band answers it in the open
// rather than making them go looking.
//
// EVERY WORD HERE IS THE ADMIN'S. The rows come from the `faqs` collection
// through `FaqContext` (placement "home"), so an answer edited in Admin > FAQs
// is on the home page as soon as the tab regains focus. This file contributes
// the section's furniture — eyebrow, headline, lede, one way onward — and not a
// single answer.
//
// THE TWO COLUMNS. From 1025px the heading, the lede and the "All questions"
// button hold still on the left while the answers scroll past on the right:
// the signpost stays in view for the whole band, which is the one thing a long
// accordion tends to lose. Below that the section stacks in reading order —
// what it is, then the answers, then where the rest of them are.
//
// WHY IT CAN VANISH. Under two answers there is no list to make: one lonely
// drawer under a headline promising "questions" reads as a page that is broken
// rather than as a page that is brief. The owner emptying the placement in the
// admin is a decision, and the section respects it by disappearing.
//
// NO JSON-LD HERE, deliberately. `FAQPage` structured data belongs to /faq
// (Prompt 28), which carries the full set; publishing it from two pages would
// hand a search engine two competing answers to the same question.
// =============================================================================

/** As many answers as a home band can carry before it stops being a summary. */
export const HOME_FAQ_LIMIT = 8;

/** Fewer than this and the section is not rendered at all. */
export const HOME_FAQ_MINIMUM = 2;

const HomeFaqs = () => {
  const { forPlacement } = useFaqs();

  // Capped inside the selector rather than sliced afterwards, so the eight are
  // eight rows a visitor will actually see — not eight taken off the top of the
  // collection, some of which the placement and de-dupe filters were about to
  // drop.
  const rows = useMemo(
    () => forPlacement("home", { limit: HOME_FAQ_LIMIT }),
    [forPlacement]
  );

  if (rows.length < HOME_FAQ_MINIMUM) return null;

  return (
    <section className={`sf-section ${styles.section}`} aria-labelledby="home-faqs">
      <div className={`sf-container ${styles.grid}`}>
        <div className={styles.aside}>
          <SectionHeading
            id="home-faqs"
            eyebrow="Good to know"
            title="Questions, answered"
            // "answered" — the section's one gradient keyword.
            gradientWord={1}
            lede="The things worth knowing before you buy — the full set lives on the FAQ page."
            rule
            className={styles.heading}
          />

          <Button variant="secondary" to={ROUTES.FAQ} className={styles.cta}>
            All questions
          </Button>
        </div>

        {/* h2 above, so the questions are h3 — the default, stated anyway
            because the outline is the reason this section is legible without
            styles at all. */}
        <FAQ faqs={rows} headingLevel={3} className={styles.accordion} />
      </div>
    </section>
  );
};

export default HomeFaqs;
