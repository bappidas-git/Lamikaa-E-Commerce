import React, { useMemo } from "react";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import LegalNote from "../../components/brand/LegalNote";
import ImpactTriptych, {
  impactEyebrow,
} from "../../components/brand/ImpactTriptych";
import Pillars from "../../components/brand/Pillars";
import {
  Accordion,
  Button,
  ContentBlocks,
  GlassCard,
  SectionHeading,
  Skeleton,
} from "../../components/ui";
import useSeo from "../../hooks/useSeo";
import useSiteContent from "../../hooks/useSiteContent";
import brand from "../../config/brand";
import { ROUTES } from "../../utils/constants";
import { onImageError } from "../../utils/helpers";
import { breadcrumbJsonLd } from "../../utils/seo";
import styles from "./WhyLamikaa.module.css";

// =============================================================================
// /why-lamikaa — the philosophy, the difference, the impact and the vision
// =============================================================================
//
// The nav item the brief asks for, and the page the home band (Prompt 20) has
// been pointing at since it was built. Where `/about` tells the STORY — who
// owns this and how the value travels — this page makes the ARGUMENT: the four
// pillars the brand stands on, what makes a farmer-owned beauty brand different
// from one that merely buys from farmers, what that difference is meant to
// achieve, and where it is going.
//
// FOUR ANCHORED SECTIONS. `#difference`, `#impact` and `#vision` are real ids
// on real <section> elements, because the header's mega panel, the footer and
// the home band all deep-link into this page and a link into a section that
// does not exist is a link to the top of a long page. The impact section
// therefore renders its heading and its skeleton WHILE THE COPY IS IN FLIGHT,
// so `/why-lamikaa#impact` has something to scroll to on a cold load.
//
// TWO SOURCES, EACH IN ITS RIGHT PLACE — the split `WhyLamikaaSection` already
// makes on the home page, kept here so the two surfaces cannot drift:
//
//   brand.pillars       BRAND facts. They change when the brand changes, not
//                       when a merchandiser edits a page, so `Pillars` reads
//                       them from `src/config/brand.js` and no CMS record can
//                       quietly reword one.
//   siteContent         EDITORIAL copy, and the half that carries the legal
//                       qualifiers (BRAND.md §3.9 rule 2). Every paragraph of
//                       the difference, the impact and the vision comes from
//                       the record and is rendered VERBATIM.
//
// THE THREE IMPACT BODIES ARE FULL TEXT, not summaries. The triptych shows
// three points a column; the whole of BRAND.md §3.4–3.6 sits behind a
// disclosure under it, because the qualifier that makes the dividend sentence
// lawful lives in the long form and truncating it would leave the claim without
// its condition.
//
// THE OWNERSHIP CHAIN in the difference section is rendered by `ContentBlocks`'
// own stepper rather than by `ValueChain`: it is a DIFFERENT chain from
// `brand.valueChain` (ownership, not value), and `ValueChain` exists so the
// seven canonical steps cannot be invented — passing it six other steps would
// defeat the component's one job.
// =============================================================================

/** A stored sentence as markdown-lite quote, so it takes the pull-quote set. */
const asQuote = (text) =>
  typeof text === "string" && text.trim()
    ? text
        .trim()
        .split("\n")
        .map((line) => `> ${line.trim()}`)
        .join("\n")
    : "";

/**
 * The page's copy. Furniture has defaults (it is the page's own); the brand's
 * claims have none — a claim with a fallback is a claim this file wrote.
 */
export const whyCopy = (block) => {
  const published = block && typeof block === "object" ? block : null;
  return {
    eyebrow: published?.eyebrow || "Why LAMIKAA",
    // The seeded title IS `brand.philosophy`; the fallback is the same line
    // from the config rather than a second copy of it typed here.
    title: published?.title || brand.philosophy,
    body: published?.body || "",
    difference: published?.difference || "",
    vision: published?.vision || "",
    heroImage: published?.heroImage || "",
  };
};

/** The three disclosure rows under the triptych: "Read more: Financial". */
export const impactDisclosures = (items) =>
  (Array.isArray(items) ? items : [])
    .map((item, index) => {
      const body = typeof item?.body === "string" ? item.body.trim() : "";
      if (!body) return null;
      const eyebrow = impactEyebrow(item);
      return {
        id: `impact-${item?.key || index}`,
        // Three rows all named "Read more" are three links a screen reader
        // cannot tell apart; the category is what distinguishes them.
        title: `Read more: ${eyebrow || item?.title || ""}`.trim(),
        content: <ContentBlocks text={body} variant="prose" />,
      };
    })
    .filter(Boolean);

const WhyLamikaa = () => {
  // One request for both sections — the argument and the impact behind it live
  // in the same record.
  const { content, loading } = useSiteContent();

  const why = content === undefined ? undefined : content?.whyLamikaa ?? null;
  const impact = content === undefined ? undefined : content?.impact ?? null;

  const copy = whyCopy(why);
  // Read off the record inside the memo: `impact?.items` is a fresh array on
  // every render of a record that has none, and a dependency that changes every
  // render is a memo that never memoises.
  const impactItems = useMemo(
    () => (Array.isArray(impact?.items) ? impact.items : []),
    [impact]
  );
  const disclosures = useMemo(
    () => impactDisclosures(impactItems),
    [impactItems]
  );

  const trail = [{ label: "Home", to: ROUTES.HOME }, { label: "Why LAMIKAA" }];

  useSeo({
    title: "Why LAMIKAA",
    description: brand.philosophyLede,
    jsonLd: breadcrumbJsonLd(trail),
  });

  return (
    <div className={styles.page}>
      {/* ── 1. THE OPENING BAND ─────────────────────────────────────────── */}
      <header className={styles.head}>
        <div className={`sf-placeholder-media ${styles.band}`}>
          {copy.heroImage ? (
            <img
              className={styles.bandImage}
              src={copy.heroImage}
              alt=""
              loading="eager"
              decoding="async"
              onError={onImageError}
            />
          ) : null}
        </div>

        <div className={`sf-container ${styles.panelWrap}`}>
          <GlassCard strong scrim padding="lg" className={styles.panel}>
            <Breadcrumb items={trail} className={styles.crumbs} />
            <p className={`sf-eyebrow sf-eyebrow--rule ${styles.eyebrow}`}>
              {copy.eyebrow}
            </p>
            <h1 className={styles.title}>{copy.title}</h1>
          </GlassCard>
        </div>
      </header>

      {/* ── 2. THE PHILOSOPHY AND THE PILLARS ───────────────────────────── */}
      {/* The band is designed without a headline — the lede IS the opening — but
          the pillars under it are h3s, so with nothing between them and the
          page's h1 the outline jumped a level (axe `heading-order`, and a
          screen-reader outline that reads the pillars as children of the page
          rather than of this section). The heading it was missing is the name
          the section already gave itself, published as a real h2 the same way
          the ritual steps do it: visually hidden, so nothing on screen moves. */}
      <section className={`sf-section ${styles.intro}`} aria-labelledby="why-philosophy">
        <div className="sf-container">
          <h2 id="why-philosophy" className="sf-visually-hidden">
            Our philosophy
          </h2>
          <div className={styles.column}>
            {loading ? (
              <Skeleton variant="text" lines={5} />
            ) : copy.body ? (
              <ContentBlocks text={copy.body} variant="editorial" />
            ) : null}
          </div>

          {/* `brand.pillars` is a module the bundle always has, so this half of
              the page is true whether or not the CMS answered. */}
          <Pillars className={styles.pillars} />
        </div>
      </section>

      {/* ── 3. THE DIFFERENCE ───────────────────────────────────────────── */}
      <section
        id="difference"
        className={`sf-section ${styles.difference}`}
        aria-labelledby="why-difference"
      >
        <div className="sf-container">
          <SectionHeading
            id="why-difference"
            eyebrow="A beauty brand owned by farmers"
            title="The LAMIKAA Difference"
            rule
            className={styles.heading}
          />
          <div className={styles.column}>
            {loading ? (
              <Skeleton variant="text" lines={6} />
            ) : copy.difference ? (
              <ContentBlocks text={copy.difference} variant="editorial" />
            ) : null}
          </div>
          <LegalNote className={styles.legal} />
        </div>
      </section>

      {/* ── 4. THE IMPACT ───────────────────────────────────────────────── */}
      {(loading || impactItems.length > 0) && (
        <section
          id="impact"
          className={`sf-section ${styles.impact}`}
          aria-labelledby="why-impact"
        >
          <div className="sf-container">
            <SectionHeading
              id="why-impact"
              eyebrow={impact?.eyebrow || "Our impact"}
              title={impact?.title || "Our impact"}
              rule
              className={styles.heading}
            />

            {loading ? (
              <Skeleton variant="text" lines={6} />
            ) : (
              <>
                <ImpactTriptych items={impactItems} showImages />
                {disclosures.length > 0 && (
                  <Accordion
                    items={disclosures}
                    multiple
                    headingLevel="h3"
                    className={styles.disclosures}
                  />
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* ── 5. THE VISION ───────────────────────────────────────────────── */}
      {copy.vision ? (
        <section
          id="vision"
          className={`sf-section ${styles.vision}`}
          aria-label="Our vision"
        >
          <div className="sf-container">
            {/* An eyebrow rather than a heading: the vision IS one sentence,
                and a 40px headline over it would say the same thing twice at
                two sizes. The section's accessible name carries it instead. */}
            <p className={`sf-eyebrow sf-eyebrow--rule ${styles.visionEyebrow}`}>
              Our vision
            </p>
            <ContentBlocks
              text={asQuote(copy.vision)}
              variant="editorial"
              className={styles.visionQuote}
            />
          </div>
        </section>
      ) : null}

      {/* ── 6. THE WAY ONWARD ───────────────────────────────────────────── */}
      <section className={`sf-section ${styles.close}`}>
        <div className="sf-container">
          <hr className="sf-hairline sf-hairline--gradient" />
          <div className={styles.actions}>
            <Button variant="primary" size="lg" to={ROUTES.SHOP}>
              Shop the Black Rice Range
            </Button>
            <Button variant="secondary" to={ROUTES.ABOUT}>
              Our Story
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyLamikaa;
