import React, { useMemo } from "react";
import brand from "../../config/brand";
import { ROUTES } from "../../utils/constants";
import { Button, SectionHeading, Skeleton } from "../ui";
import Pillars, { pillarsFrom } from "../brand/Pillars";
import ImpactTriptych from "../brand/ImpactTriptych";
import styles from "./WhyLamikaaSection.module.css";

// =============================================================================
// WhyLamikaaSection — the philosophy, the pillars and the three impacts
// =============================================================================
//
// The page has shown what the range is, who owns it and where the value goes.
// This is the band that says what the brand stands on: BRAND.md §3.2's
// philosophy line over the brand's pillars, then §3.4–3.6's impact as a
// triptych, then one way through to the full story at /why-lamikaa.
//
// WHERE EACH HALF COMES FROM. The philosophy line is a BRAND fact, so it lives
// in `src/config/brand.js`. The pillars are the list Admin → Content edits
// (`siteContent.whyLamikaa.pillars`, handed in as `whyContent`) — the same list
// /about, /why-lamikaa and /contact draw. The impact copy is EDITORIAL and
// carries the legal qualifiers, so it is `siteContent.impact`, handed to
// `ImpactTriptych` untouched. Neither half has a word of copy in this file.
//
// THE TWO HALVES FAIL SEPARATELY, and that is the point. The pillars fall back
// to `brand.pillars` — a module the bundle always has — when the record cannot
// be read, so the philosophy, the cards and the CTA always render. The impact
// block can be missing,
// unpublished or unreachable — and when it is, its heading goes with it rather
// than standing over an empty space. An impact section that invents an impact
// is worse than no impact section (the rule WhyBlackRice states for the
// ingredient claims, applied to the one other place the storefront makes a
// claim about the world).
//
// HEADING OUTLINE. The hero owns the page's <h1>; this section's <h2> is the
// philosophy line, the pillar titles and the impact headline are <h3>, and
// the three column titles are <h4>. Prompt 28's page shifts the whole run up
// one level through the same `as` / `titleAs` props — which is why both
// components take them rather than hard-coding a tag.
//
// `showImages={false}` here: the home band is words, and the page (Prompt 28)
// is where the three photographs earn their bytes.
// =============================================================================

/**
 * The impact half's copy: the section's own furniture has defaults, the owner's
 * claims have none.
 *
 * Exported for the unit test — "what does this section claim when the CMS has
 * nothing to say" is the one decision in this file that can go quietly wrong.
 */
export const impactCopy = (block) => {
  const published =
    block && typeof block === "object" && block.published !== false ? block : null;
  return {
    // Furniture: a signpost to a heading, not a statement about the company.
    eyebrow: published?.eyebrow || "Our impact",
    title: published?.title || "Beauty That Creates Prosperity for Farmers",
    // No fallback, deliberately. See the header.
    items: Array.isArray(published?.items) ? published.items : [],
  };
};

/**
 * @param {object} props
 * @param {object|null|undefined} props.content  the `impact` record, from
 *        useHomeData(): `undefined` while it is in flight, `null` for a record
 *        that could not be read or one the owner has not written — and both
 *        land on the same empty state.
 * @param {object|null|undefined} props.whyContent  the `whyLamikaa` record,
 *        on the same three states: skeleton cards while it is in flight, the
 *        config's pillars when it is `null` or carries no list.
 */
const WhyLamikaaSection = ({ content, whyContent }) => {
  const block = content === undefined ? undefined : content || null;

  const loading = block === undefined;
  const copy = impactCopy(block);
  const showImpact = loading || copy.items.length > 0;

  const pillars = useMemo(() => pillarsFrom(whyContent), [whyContent]);

  return (
    <section className={`sf-section ${styles.section}`} aria-labelledby="why-lamikaa">
      <div className="sf-container">
        {/* ---- The philosophy ------------------------------------------- */}
        {/* No gradient word: this line IS the brand's philosophy, three
            sentences of equal weight, and picking one of the three to light up
            would be an argument the brand has not made. */}
        <SectionHeading
          id="why-lamikaa"
          eyebrow="Why LAMIKAA"
          title={brand.philosophy}
          lede={brand.philosophyLede}
          rule
          className={styles.heading}
        />

        <Pillars
          pillars={pillars}
          loading={whyContent === undefined}
          className={styles.pillars}
        />

        {/* ---- The impact ----------------------------------------------- */}
        {showImpact ? (
          <div className={styles.impact}>
            <SectionHeading
              as="h3"
              id="why-lamikaa-impact"
              eyebrow={copy.eyebrow}
              title={copy.title}
              rule
              className={styles.impactHeading}
            />

            {loading ? (
              <div className={styles.skeleton} aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <Skeleton key={index} variant="text" lines={5} />
                ))}
              </div>
            ) : (
              <ImpactTriptych
                items={copy.items}
                showImages={false}
                titleAs="h4"
              />
            )}
          </div>
        ) : null}

        {/* ---- One way onward -------------------------------------------- */}
        <div className={styles.close}>
          <Button variant="secondary" to={ROUTES.WHY} className={styles.cta}>
            Why LAMIKAA
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhyLamikaaSection;
