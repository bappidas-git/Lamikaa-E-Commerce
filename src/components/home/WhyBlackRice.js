import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import { RISE, reveal } from "../../theme/motion";
import { onImageError, productPath } from "../../utils/helpers";
import { stageSrc } from "../../utils/product";
import { GlowWrap, SectionHeading, Skeleton } from "../ui";
import styles from "./WhyBlackRice.module.css";

// =============================================================================
// WhyBlackRice — the ingredient spotlight
// =============================================================================
//
// Eight products, one hero ingredient. The showcase above says what each thing
// is; this says what they have in common, and then shows the eight labels that
// carry it in one row of plates.
//
// THE CLAIMS ARE DATA, AND THERE ARE EXACTLY THREE OF THEM.
// `siteContent.home.whyBlackRice.points` (seeded in Prompt 06) is the whole of
// what this section is allowed to say about black rice: antioxidant-rich and
// traditionally valued in Northeast India, the one ingredient the range is
// built around, paired with botanicals per step. Not one word beyond those
// three lines is typed here — a cosmetic ingredient claim written into a
// component is a claim nobody can edit, review or withdraw, and BRAND.md §3.9
// makes the qualifiers part of the sentence. If the block is missing,
// unpublished or unreachable, the section renders NOTHING: a spotlight with no
// points is not a thinner spotlight, it is a different promise.
//
// The section's OWN furniture — its eyebrow, its headline, the "Carried by"
// label — is copy about the section rather than about the ingredient, so it has
// defaults.
//
// "CARRIED BY" IS COUNTED, NOT LISTED. The row is `products.getHeroProducts()`
// in the owner's own `heroOrder`, so it can never disagree with the hero or the
// showcase about what is in the range or in what order. Each plate is a real
// link to its PDP carrying the product's name — the one place in this section
// where a tab stop is warranted, because each destination is different.
//
// The photograph is a plain <img>, not `CloudinaryImage`: the placeholder is a
// Picsum URL and Cloudinary transformations do not apply to it. It carries
// `.sf-placeholder-media` and `alt=""` — it is decorative, and describing a
// macro shot the brand has not taken would be inventing one.
// =============================================================================

/** The one word of the headline set in the signature gradient, found in the
 *  copy rather than pinned to an index, so an edited headline keeps its
 *  emphasis on the right word — or, when the word is gone, on none. The same
 *  one-liner AboutTeaser uses on its own quote; two call sites is not yet a
 *  shared utility, and Prompt 22's assembly pass is where a third would move it.
 */
export const gradientWordIndex = (title, word = "black") => {
  if (typeof title !== "string") return undefined;
  const target = word.toLowerCase();
  const index = title
    .split(" ")
    .findIndex((w) => w.toLowerCase().replace(/[^a-z]/g, "") === target);
  return index >= 0 ? index : undefined;
};

/**
 * The section's copy: the furniture's defaults, the ingredient's claims as
 * published or not at all.
 *
 * Exported for the unit test — "what does this section claim when the CMS has
 * nothing to say" is the one decision in this file that can go quietly wrong.
 */
export const spotlightCopy = (block) => {
  const published =
    block && typeof block === "object" && block.published !== false ? block : null;
  return {
    eyebrow: published?.eyebrow || "The hero ingredient",
    title: published?.title || "Why black rice?",
    // No fallback, deliberately. See the header.
    points: Array.isArray(published?.points)
      ? published.points.filter((p) => typeof p === "string" && p.trim())
      : [],
    image: published?.image || "",
  };
};

// 56px on the page, so 112 covers a 2x screen.
const THUMB_WIDTH = 112;

// Where the image and the copy wait before they arrive — see AboutTeaser.js.
const RESTING = { opacity: 0, y: RISE.reveal };

/**
 * @param {object} props
 * @param {object|null|undefined} props.content  the home record's `whyBlackRice`
 *        block, from useHomeData(): `undefined` while the record is in flight,
 *        `null` for a record that could not be read or a block the owner has
 *        not written — and both land on the same empty state.
 * @param {object[]|null|undefined} props.products  the hero-ordered catalogue.
 *        The row of labels is the section's EVIDENCE, not its subject: a
 *        catalogue that could not be read leaves the three points standing on
 *        their own rather than taking the band off the page.
 */
const WhyBlackRice = ({ content, products: productRows }) => {
  const reduceMotion = useReducedMotion();
  const block = content === undefined ? undefined : content || null;
  const products = Array.isArray(productRows) ? productRows : [];

  const loading = block === undefined;
  const copy = spotlightCopy(block);

  // Nothing to say, and nothing this section is allowed to say instead.
  if (!loading && copy.points.length === 0) return null;

  return (
    <section className={`sf-section ${styles.section}`} aria-labelledby="why-black-rice">
      <div className="sf-container">
        <div className={styles.body}>
          {/* ---- The macro shot ------------------------------------------ */}
          {loading ? (
            <Skeleton variant="block" aspectRatio="1" className={styles.media} />
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

          {/* ---- The three points ---------------------------------------- */}
          <motion.div
            className={styles.copy}
            {...(reduceMotion ? {} : { animate: RESTING })}
            {...reveal(reduceMotion, { index: 1, inView: true, amount: 0.1 })}
          >
            <SectionHeading
              id="why-black-rice"
              eyebrow={copy.eyebrow}
              title={copy.title}
              gradientWord={gradientWordIndex(copy.title)}
              rule
              className={styles.heading}
            />

            {loading ? (
              <Skeleton variant="text" lines={4} />
            ) : (
              /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
              <ul className={styles.points} role="list">
                {copy.points.map((point, index) => (
                  <li className={styles.point} key={index}>
                    {/* The glyph's box is the WRAPPER's, not the icon's:
                        @iconify/react renders an unstyled, unsized <span>
                        placeholder until the icon resolves and forwards
                        neither className nor aria-hidden to it, so a bare
                        <Icon> here would collapse to 0px and then shove the
                        line sideways when it landed. The svg is 1em, so the
                        20px is one font-size on the span. */}
                    <span className={styles.glyph} aria-hidden="true">
                      <Icon icon="mdi:check-circle-outline" />
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            {products.length > 0 && (
              <div className={styles.carriedBy}>
                <p className={`sf-eyebrow ${styles.carriedByLabel}`}>Carried by</p>
                {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
                <ul className={styles.thumbs} role="list">
                  {products.map((product) => (
                    <li key={product.id ?? product.slug}>
                      <Link
                        to={productPath(product)}
                        className={`sf-plate ${styles.thumb}`}
                        aria-label={product.name}
                      >
                        <img
                          src={stageSrc(product, { w: THUMB_WIDTH })}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          onError={onImageError}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyBlackRice;
