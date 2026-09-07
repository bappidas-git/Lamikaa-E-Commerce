import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import brand from "../../config/brand";
import { ROUTES } from "../../utils/constants";
import { reveal } from "../../theme/motion";
import { Button, GlassCard, GlowWrap } from "../ui";
import LegalNote from "../brand/LegalNote";
import NewsletterForm from "../brand/NewsletterForm";
import styles from "./FullPageCta.module.css";

// =============================================================================
// FullPageCta — the page stops, and asks
// =============================================================================
//
// One screen that does nothing but hold the brand's three signature lines, the
// two ways on from them, and the one question the storefront asks of a visitor
// who is not buying today. It is the only full-viewport moment below the hero,
// and it is deliberately the quietest: a photograph nobody is meant to look at,
// under a near-opaque wash, under a card.
//
// THE GROUND IS FOUR LAYERS, bottom to top:
//   1. the placeholder photograph — `object-fit: cover`, `loading="lazy"`,
//      `alt=""`. It is decorative and it is a stand-in; describing a photograph
//      the brand has not taken would be inventing one, and a lazy background is
//      a background that cannot become the page's LCP.
//   2. the wash — --sf-color-bg at 82% over the top edge, 94% over the bottom.
//   3. the signature gradient at 12%, `mix-blend-mode: screen`, so the pink and
//      the violet come through the dark rather than sitting on it.
//   4. the card, and one duo lamp breathing behind it.
// NO BACKDROP BLUR ON THE GROUND (DESIGN_SYSTEM.md §4: never on a full-page
// scrolling background). The CARD blurs — that is the one blurred layer this
// section spends, and the sticky masthead is the other.
//
// THE SECOND BREATHING GLOW ON THE PAGE. The budget is one per viewport: the
// hero owns it at the top, this owns it here. Nothing between them breathes,
// and eight product chapters, the About band, the ingredient spotlight and the
// rituals triptych sit in between — the two can never share a viewport at any
// scroll position or any height.
//
// THE COPY IS THE OWNER'S, AND FALLS BACK TO THE BRAND'S OWN LINES.
// `siteContent.home.fullPageCta` carries the three lines, the two labels and
// their destinations, and the photograph. When the block is missing,
// unpublished or unreachable, the section still stands: the lines fall back to
// `brand.signatureLines[0..2]` — the same three sentences, from the config
// rather than from the CMS — and the two actions to /shop and /about. That is
// the opposite of the ingredient spotlight's rule, and deliberately so: these
// are the brand's own signature lines, not a cosmetic claim, so a fallback here
// cannot state anything the brand has not already said of itself.
// =============================================================================

const EYEBROW = "Beauty with a purpose";
const NEWSLETTER_LABEL = "Stay close to the farm";
const NEWSLETTER_HINT =
  "New products, farm stories and the occasional offer — no noise.";

// The base for the form's own ids. The footer's copy of the same form uses
// "footer-newsletter", so the two never collide on the home page.
const NEWSLETTER_ID = "cta-newsletter";

const HEADING_ID = "full-page-cta";

const DEFAULT_PRIMARY = {
  label: "Shop the Black Rice Range",
  to: ROUTES.SHOP,
};
const DEFAULT_SECONDARY = {
  label: "Meet the farmer-owners",
  to: ROUTES.ABOUT,
};

// The one gradient keyword this section is allowed (DESIGN_SYSTEM.md §5), and
// it is in the FIRST line only: "Beauty that creates value."
const GRADIENT_WORD = "value";

/**
 * Split a line around the first occurrence of `word`, matched on letters alone
 * so the sentence's own punctuation stays out of the gradient — "value." keeps
 * its full stop in the warm white the rest of the line is set in.
 *
 * @returns {{before: string, match: string, after: string} | null}
 *          `null` when the line does not contain the word, which is the answer
 *          an edited headline gets: no emphasis rather than emphasis on
 *          whatever happens to sit at that index.
 *
 * Exported for the unit test — "which glyphs carry the gradient" is the one
 * decision in this file that can go quietly wrong.
 */
export const splitOnWord = (line, word = GRADIENT_WORD) => {
  if (typeof line !== "string" || typeof word !== "string" || !word) return null;
  // Escaped so a word carrying regex punctuation cannot become a pattern, and
  // bounded so "value" never matches inside "valuable".
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`\\b${escaped}\\b`, "i").exec(line);
  if (!match) return null;
  return {
    before: line.slice(0, match.index),
    match: match[0],
    after: line.slice(match.index + match[0].length),
  };
};

/**
 * The section's copy, from the owner's block or from the brand config.
 *
 * Exported for the unit test — the fallback is the whole reason this section
 * can be rendered before an admin has ever opened the Content screen.
 */
export const ctaCopy = (block) => {
  const published =
    block && typeof block === "object" && block.published !== false ? block : null;

  const lines = Array.isArray(published?.lines)
    ? published.lines.filter((line) => typeof line === "string" && line.trim())
    : [];

  return {
    // Three lines, always: the owner's if there are any, the brand's otherwise.
    // A block that publishes four gets the first three — the composition is a
    // triplet, and a fourth line would set the card's headline against the
    // measure it was drawn for.
    lines: (lines.length ? lines : brand.signatureLines).slice(0, 3),
    primaryLabel: published?.primaryLabel || DEFAULT_PRIMARY.label,
    primaryTo: published?.primaryTo || DEFAULT_PRIMARY.to,
    secondaryLabel: published?.secondaryLabel || DEFAULT_SECONDARY.label,
    secondaryTo: published?.secondaryTo || DEFAULT_SECONDARY.to,
    // The photograph is the only part with no fallback: no image is simply the
    // wash over the page ground, which is a composition in its own right.
    image: published?.image || "",
  };
};

/**
 * @param {object} props
 * @param {object|null|undefined} props.content  the home record's `fullPageCta`
 *        block, from useHomeData(): `undefined` while the record is in flight,
 *        `null` for a record that could not be read or a block the owner has
 *        not written — and both land on the brand's own three lines.
 */
const FullPageCta = ({ content }) => {
  const reduceMotion = useReducedMotion();
  const block = content === undefined ? undefined : content || null;
  // The URL that failed to load, rather than a boolean: a background that 404s
  // drops out and leaves the wash over the page ground, and the state resets by
  // itself the moment the owner publishes a different photograph. The shared
  // `onImageError` is deliberately NOT used — its "No Image" plate is right for
  // a product plate and wrong for a decorative ground the size of a screen.
  const [failedImage, setFailedImage] = useState(null);

  const copy = ctaCopy(block);
  const image = copy.image && copy.image !== failedImage ? copy.image : "";

  return (
    <section className={styles.section} aria-labelledby={HEADING_ID}>
      {/* ---- 1. The photograph ------------------------------------------ */}
      {image ? (
        <img
          className={`sf-placeholder-media ${styles.photo}`}
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          aria-hidden="true"
          onError={() => setFailedImage(image)}
        />
      ) : null}

      {/* ---- 2 & 3. The wash and the signature gradient ------------------ */}
      <span className={styles.wash} aria-hidden="true" />
      <span className={styles.gradient} aria-hidden="true" />

      {/* ---- 4. The card ------------------------------------------------- */}
      <div className={`sf-container ${styles.inner}`}>
        <GlowWrap
          tone="duo"
          intensity={0.22}
          breathe
          size={130}
          className={styles.glow}
        >
          <motion.div
            className={styles.cardWrap}
            {...reveal(reduceMotion, { inView: true, amount: 0.2 })}
          >
            {/* `scrim` is the design system's answer to text on glass over
                imagery (DESIGN_SYSTEM.md §4): an inner --sf-color-bg wash that
                takes the card's ground back down to something near the page's
                own, which is the ground the palette's contrast figures were
                measured against. Without it the signature gradient's violet
                tail measures 1.6:1 on the headline over a bright photograph;
                with it, 3.2:1 — inside the large-text floor — and every other
                line on the card clears 4.5:1 with room to spare. */}
            <GlassCard strong scrim padding="lg" className={styles.card}>
              <p className={`sf-eyebrow ${styles.eyebrow}`}>{EYEBROW}</p>

              {/* Three lines, three blocks — the break is the composition, so
                  it is markup rather than a <br> the copy has to carry. */}
              <h2 id={HEADING_ID} className={styles.headline}>
                {copy.lines.map((line, index) => {
                  // The gradient keyword lives in the FIRST line only.
                  const parts = index === 0 ? splitOnWord(line) : null;
                  return (
                    <span className={styles.line} key={`${line}-${index}`}>
                      {parts ? (
                        <>
                          {parts.before}
                          <span className="sf-gradient-text">{parts.match}</span>
                          {parts.after}
                        </>
                      ) : (
                        line
                      )}
                    </span>
                  );
                })}
              </h2>

              <p className={styles.lede}>{brand.tagline}</p>

              <div className={styles.actions}>
                <Button variant="primary" size="lg" to={copy.primaryTo}>
                  {copy.primaryLabel}
                </Button>
                <Button variant="secondary" size="lg" to={copy.secondaryTo}>
                  {copy.secondaryLabel}
                </Button>
              </div>

              <NewsletterForm
                variant="cta"
                id={NEWSLETTER_ID}
                label={NEWSLETTER_LABEL}
                hint={NEWSLETTER_HINT}
                className={styles.newsletter}
              />

              <LegalNote compact className={styles.legal} />
            </GlassCard>
          </motion.div>
        </GlowWrap>
      </div>
    </section>
  );
};

export default FullPageCta;
