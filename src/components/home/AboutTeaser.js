import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import apiService from "../../services/api";
import brand from "../../config/brand";
import { RISE, reveal } from "../../theme/motion";
import { ROUTES } from "../../utils/constants";
import { onImageError } from "../../utils/helpers";
import { Button, ContentBlocks, GlowWrap, SectionHeading, Skeleton } from "../ui";
import LegalNote from "../brand/LegalNote";
import ValueChain from "../brand/ValueChain";
import styles from "./AboutTeaser.module.css";

// =============================================================================
// AboutTeaser — the farmer-owned story, in short form, on the home page
// =============================================================================
//
// One surface answers the question the rest of the page cannot: who owns this.
// A landscape standing in for photography nobody has shot yet, the brand's own
// line as a pull-quote, two paragraphs of BRAND.md §3.1, the seven-step value
// chain, the ownership sentence and one way through to the full story.
//
// THE COPY IS DATA (`siteContent.home.aboutTeaser`, seeded in Prompt 06), and
// none of it is typed here. That is not a preference: BRAND.md §3.9 makes the
// qualifiers part of the sentence — profits "can" reach member farmers "as
// dividends, subject to applicable laws and the company's dividend declaration"
// — and a paragraph hard-coded in a component is a paragraph that drifts from
// the one the owner edits. The section's OWN furniture (its eyebrow, its CTA
// label) is copy about the section rather than about the company, so it has
// defaults; the company's copy has none.
//
// THE FALLBACK IS DELIBERATELY THIN. If the block is missing, unpublished or
// unreachable, the section keeps only what it can state from `src/config/brand`
// — the signature line as the quote, and `LegalNote` — and the paragraphs do
// not render at all. A teaser with no story is still true; a teaser with an
// invented story is not.
//
// The value chain, the legal note and the CTA sit BELOW the two-column body
// rather than inside its right column: seven steps in a 1.1fr column cannot be
// a single row at any desktop width, and the chain being one row from 1025px up
// is the whole point of the drawing.
//
// The image is a plain <img>, not `CloudinaryImage`: the placeholder is a Picsum
// URL and Cloudinary transformations do not apply to it. It carries
// `.sf-placeholder-media` (desaturated, under the bottom-weighted wash) and
// `alt=""` — it is decorative, and describing a scene the brand has not
// photographed would be inventing one.
// =============================================================================

/** The one word of the quote set in the signature gradient, found in the copy
 *  rather than pinned to an index, so an edited headline keeps its emphasis on
 *  the right word — or, when the word is gone, on none. */
export const gradientWordIndex = (title, word = "farmers") => {
  if (typeof title !== "string") return undefined;
  const target = word.toLowerCase();
  const index = title
    .split(" ")
    .findIndex((w) => w.toLowerCase().replace(/[^a-z]/g, "") === target);
  return index >= 0 ? index : undefined;
};

/**
 * The section's copy, from the published block or from the brand config alone.
 *
 * Exported for the unit test: "what does this section say when the CMS has
 * nothing to say" is the one decision in this file that can go quietly wrong.
 */
export const teaserCopy = (block) => {
  const published =
    block && typeof block === "object" && block.published !== false ? block : null;
  return {
    eyebrow: published?.eyebrow || "About LAMIKAA",
    // The seeded title IS this line; the fallback is not a second copy of it.
    title: published?.title || brand.signatureLines[3],
    text: published?.text || "",
    image: published?.image || "",
    ctaLabel: published?.ctaLabel || "Our Story",
    ctaTo: published?.ctaTo || ROUTES.ABOUT,
  };
};

// Where the image and the copy wait before they arrive — see ValueChain.js.
const RESTING = { opacity: 0, y: RISE.reveal };

const AboutTeaser = () => {
  const reduceMotion = useReducedMotion();
  const [block, setBlock] = useState(undefined);

  useEffect(() => {
    let active = true;
    // `siteContent.get` never rejects — it answers null for a section it cannot
    // reach, which is the same answer as "the owner has not written one", and
    // both land on the same thin fallback.
    apiService.siteContent.get("home").then((home) => {
      if (active) setBlock(home?.aboutTeaser || null);
    });
    return () => {
      active = false;
    };
  }, []);

  const loading = block === undefined;
  const copy = teaserCopy(block);

  return (
    <section className={styles.section} aria-labelledby="about-lamikaa">
      <div className="sf-container">
        <SectionHeading
          id="about-lamikaa"
          eyebrow={copy.eyebrow}
          title={copy.title}
          gradientWord={gradientWordIndex(copy.title)}
          rule
          className={styles.heading}
        />

        <div className={styles.body}>
          {/* ---- The landscape ------------------------------------------- */}
          {loading ? (
            <Skeleton variant="block" aspectRatio="16 / 10" className={styles.media} />
          ) : copy.image ? (
            <motion.div
              className={styles.mediaWrap}
              // The resting state is named as `animate` too, for the reason
              // ValueChain.js spells out: the route's <AnimatePresence
              // initial={false}> drops `initial` for anything present at the
              // first paint, and a warm cache can land this block that early.
              {...(reduceMotion ? {} : { animate: RESTING })}
              {...reveal(reduceMotion, { inView: true, amount: 0.1 })}
            >
              <GlowWrap tone="gold" intensity={0.16} className={styles.glow}>
                <div className={`sf-placeholder-media ${styles.media}`}>
                  <img
                    className={styles.image}
                    src={copy.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={onImageError}
                  />
                </div>
              </GlowWrap>
            </motion.div>
          ) : null}

          {/* ---- The two paragraphs -------------------------------------- */}
          {loading ? (
            <Skeleton variant="text" lines={6} className={styles.copySkeleton} />
          ) : copy.text ? (
            <motion.div
              className={styles.copy}
              {...(reduceMotion ? {} : { animate: RESTING })}
              {...reveal(reduceMotion, { index: 1, inView: true, amount: 0.1 })}
            >
              <ContentBlocks text={copy.text} variant="editorial" />
            </motion.div>
          ) : null}
        </div>

        {/* ---- Farmer → … → Farmer Members ------------------------------- */}
        <div className={styles.chain}>
          <ValueChain />
        </div>

        {/* ---- The ownership sentence, and one way through --------------- */}
        <div className={styles.close}>
          <LegalNote className={styles.legalNote} />
          <Button variant="secondary" to={copy.ctaTo} className={styles.cta}>
            {copy.ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AboutTeaser;
