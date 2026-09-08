import React from "react";
import LegalNote from "../brand/LegalNote";
import ValueChain from "../brand/ValueChain";
import { Button } from "../ui";
import { ROUTES } from "../../utils/constants";
import styles from "./FarmerStory.module.css";

// =============================================================================
// FarmerStory — the ownership chapter, on the page where the money is spent
// =============================================================================
//
// The reason to buy a LAMIKAA product is not only what is in the bottle: the
// brand is owned by the farmers who grow what is in it, and the value the sale
// creates goes back into that company. That argument has a whole page (/about)
// and a home section, but the moment it matters most is here — at the point of
// purchase — so the PDP carries a two-sentence version of it.
//
// TWO SENTENCES, BOTH FROM THE DATA. `siteContent.about.lede` says who owns the
// company; the About teaser's prose says what that ownership is for. Neither is
// retyped in this file, so an owner editing the copy in Admin → Content edits
// it here too, and the page cannot end up making a claim the About page has
// since been corrected out of.
//
// AND THEY ARE DEDUPLICATED. The two records open on nearly the same sentence
// (the teaser is the lede with "(FPC)" dropped), and printing both would give
// the chapter a stutter. `farmerStoryLines` therefore skips a teaser paragraph
// that merely restates the lede and takes the next one instead — which is the
// paragraph about purpose, and the better second line anyway.
//
// THE QUALIFIER IS NOT OPTIONAL. `LegalNote` carries BRAND.md §3.9 rule 2
// verbatim ("can reach … as dividends, subject to applicable laws and the
// company's dividend declaration") and takes no text prop, so no surface —
// including this one — can state the ownership benefit without it.
//
// `ValueChain compact vertical` draws the seven links between a farmer and a
// customer. The orientation is NAMED rather than left to `auto`, which decides
// from the VIEWPORT: at 1025px `auto` lays the chain out as one row of seven,
// and the PDP's content column is half a viewport wide at every width above
// that — the row would run past the column's edge and give the whole page a
// horizontal scrollbar. A narrow column gets the vertical chain, and a viewport
// query cannot know it is in one.
//
// The ghost button hands the rest of the argument to /about rather than
// retelling it in a product page's margin.
//
// Props:
//   about   `siteContent.about`
//   home    `siteContent.home`
// =============================================================================

export const READ_MORE_LABEL = "Read our story";

/** The distinct lower-case words in a paragraph — punctuation discarded. */
const wordsOf = (text) =>
  new Set(
    String(text || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean)
  );

/** How much of the shorter paragraph's vocabulary the longer one also uses. */
const OVERLAP = 0.8;

/** Below this many words a paragraph is a fragment, and overlap means nothing. */
const MIN_WORDS = 6;

/**
 * Is `candidate` a restatement of `first` rather than a second sentence?
 *
 * A SUBSTRING TEST WOULD NOT CATCH IT. The seeded pair differs in the middle —
 * the lede says "Farmer Producer Company (FPC)" where the teaser says "Farmer
 * Producer Company" — so neither string contains the other. What they do share
 * is their vocabulary: measure how much of the shorter paragraph's word set the
 * longer one also uses, and the pair scores 1.0 while the teaser's SECOND
 * paragraph (the one about purpose) scores about a third.
 *
 * Two short fragments are exempt: five words in common says nothing.
 */
const restates = (first, candidate) => {
  const a = wordsOf(first);
  const b = wordsOf(candidate);
  const smaller = a.size <= b.size ? a : b;
  const larger = smaller === a ? b : a;
  if (smaller.size < MIN_WORDS) return false;
  let shared = 0;
  smaller.forEach((word) => {
    if (larger.has(word)) shared += 1;
  });
  return shared / smaller.size >= OVERLAP;
};

/**
 * The two sentences the chapter prints, in order.
 *
 * Returns 0, 1 or 2 paragraphs — never a placeholder, never an invented line.
 * Exported for the unit test: the deduplication is the decision here.
 *
 * @param {object} about  siteContent.about
 * @param {object} home   siteContent.home
 * @returns {string[]}
 */
export const farmerStoryLines = (about, home) => {
  const lede = typeof about?.lede === "string" ? about.lede.trim() : "";
  const teaser =
    typeof home?.aboutTeaser?.text === "string" ? home.aboutTeaser.text : "";
  const paragraphs = teaser
    .split(/\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lede) return paragraphs.slice(0, 1);

  const second = paragraphs.find((line) => !restates(lede, line)) || "";
  return second ? [lede, second] : [lede];
};

const FarmerStory = ({ about, home, className = "" }) => {
  const lines = farmerStoryLines(about, home);

  return (
    <div className={[styles.block, className].filter(Boolean).join(" ")}>
      {lines.length > 0 && (
        <div className={styles.prose}>
          {lines.map((line) => (
            <p key={line} className={styles.line}>
              {line}
            </p>
          ))}
        </div>
      )}

      <ValueChain compact orientation="vertical" className={styles.chain} />

      <LegalNote className={styles.note} />

      <Button variant="ghost" to={ROUTES.ABOUT} className={styles.cta}>
        {READ_MORE_LABEL}
      </Button>
    </div>
  );
};

export default FarmerStory;
