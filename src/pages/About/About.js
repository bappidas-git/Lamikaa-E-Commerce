import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import LegalNote from "../../components/brand/LegalNote";
import ImpactTriptych from "../../components/brand/ImpactTriptych";
import Pillars from "../../components/brand/Pillars";
import ValueChain from "../../components/brand/ValueChain";
import {
  Button,
  ContentBlocks,
  GlassCard,
  SectionHeading,
  Skeleton,
} from "../../components/ui";
import useSeo from "../../hooks/useSeo";
import useSiteContent from "../../hooks/useSiteContent";
import { RISE, reveal } from "../../theme/motion";
import { parseBlocks } from "../../utils/contentBlocks";
import { ROUTES } from "../../utils/constants";
import { onImageError } from "../../utils/helpers";
import { breadcrumbJsonLd } from "../../utils/seo";
import styles from "./About.module.css";

// =============================================================================
// /about — the farmer-owned story, in full
// =============================================================================
//
// The home page's `AboutTeaser` says who owns this brand in two paragraphs and
// then offers a way through. This is what it offers a way through TO: BRAND.md
// §3.1 entire, the value chain drawn rather than described, the LAMIKAA
// Difference as a callout, the vision as a pull-quote, the three impacts with
// their photographs, and the four pillars underneath.
//
// NOT ONE WORD OF THE STORY IS IN THIS FILE. Every paragraph, the heading over
// the chain, the callout, the quote and the CTA label come from
// `siteContent.about`; the impact copy comes from `siteContent.impact`; the
// pillars come from `brand.pillars` and the ownership sentence from
// `brand.legalNote`. What the page types is FURNITURE — "Home", "Our Story",
// "Why LAMIKAA" — labels about the page rather than claims about the company.
//
// That distinction is legal, not stylistic. BRAND.md §3.9 rule 2 makes the
// qualifiers part of the sentence ("profits distributed by BAOPCL CAN reach its
// member farmers as dividends, SUBJECT TO applicable laws and the company's
// dividend declaration"), and a paragraph hard-coded in a component is a
// paragraph nobody can edit, review or withdraw.
//
// THE CHAIN IS DRAWN BY `ValueChain`, NOT BY THE GENERIC STEPPER. The seeded
// body carries the seven steps as a `::steps` fence, which `ContentBlocks`
// would render as its own numbered list — correct, and not the picture the
// brand cannot do without. So the body is parsed once and rendered in RUNS
// broken at each `::steps` fence, with the chain component in the gaps. The
// runs after the first pass `dropCap={false}`: a page opens on one drop cap,
// not on one per run.
//
// FAILURE IS QUIET AND HONEST. A record that cannot be read leaves the page
// with its heading, its pillars and its ownership note — the things the bundle
// itself can state — and no invented story underneath.
// =============================================================================

/** Where the band and the plate wait before they arrive — see ValueChain.js. */
const RESTING = { opacity: 0, y: RISE.reveal };

/**
 * The parsed body as an alternating list of runs and chains:
 *
 *   [{ kind: "blocks", blocks: [...] }, { kind: "chain", steps: [...] }, …]
 *
 * Exported for the unit test. The interesting cases are a body with no fence at
 * all (one run), a body that OPENS on one (no empty run before it) and a fence
 * with nothing in it (dropped — an empty chain is not a chain).
 *
 * @param {string} body markdown-lite
 * @returns {Array<{kind: "blocks"|"chain", blocks?: object[], steps?: string[]}>}
 */
export const splitAtChain = (body) => {
  const runs = [];
  let open = [];
  const closeOpen = () => {
    if (open.length) runs.push({ kind: "blocks", blocks: open });
    open = [];
  };

  parseBlocks(body).forEach((block) => {
    if (block.type === "steps") {
      const steps = (block.items || []).filter(Boolean);
      if (steps.length === 0) return;
      closeOpen();
      runs.push({ kind: "chain", steps });
      return;
    }
    open.push(block);
  });
  closeOpen();

  return runs;
};

/**
 * The page's copy, from the published record or from nothing at all.
 *
 * The furniture has defaults because it is the page's own; the story has none,
 * because a story with a fallback is a story this file wrote.
 */
export const aboutCopy = (block) => {
  const published = block && typeof block === "object" ? block : null;
  return {
    eyebrow: published?.eyebrow || "Our Story",
    title: published?.title || "",
    lede: published?.lede || "",
    body: published?.body || "",
    heroImage: published?.heroImage || "",
    image2: published?.image2 || "",
    ctaLabel: published?.ctaLabel || "Shop the range",
    ctaTo: published?.ctaTo || ROUTES.SHOP,
  };
};

const About = () => {
  const reduceMotion = useReducedMotion();
  // One request for both sections: the story and the impact live in the same
  // record, and two `get(key)` calls would be two round trips for one page.
  const { content, loading } = useSiteContent();

  const about = content === undefined ? undefined : content?.about ?? null;
  const impact = content === undefined ? undefined : content?.impact ?? null;

  const copy = aboutCopy(about);
  const runs = useMemo(() => splitAtChain(copy.body), [copy.body]);

  const trail = [
    { label: "Home", to: ROUTES.HOME },
    { label: "Our Story" },
  ];

  useSeo({
    title: "Our Story",
    description: copy.lede,
    jsonLd: breadcrumbJsonLd(trail),
  });

  const impactItems = Array.isArray(impact?.items) ? impact.items : [];

  return (
    <div className={styles.page}>
      {/* ── 1. THE OPENING BAND ──────────────────────────────────────────
          A landscape standing in for photography nobody has shot yet, with the
          trail, the eyebrow, the title and the lede on a glass panel resting in
          its lower-left corner from 769px and stacked below it on a phone. */}
      <header className={styles.head}>
        <div className={`sf-placeholder-media ${styles.band}`}>
          {copy.heroImage ? (
            <img
              className={styles.bandImage}
              src={copy.heroImage}
              alt=""
              /* Above the fold at every width — the one image on this route
                 that must not wait for a lazy pass. */
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
            {loading ? (
              <Skeleton variant="text" lines={3} />
            ) : (
              <>
                {copy.title ? <h1 className={styles.title}>{copy.title}</h1> : null}
                {copy.lede ? <p className={styles.lede}>{copy.lede}</p> : null}
              </>
            )}
          </GlassCard>
        </div>
      </header>

      {/* ── 2. THE STORY ─────────────────────────────────────────────────
          Editorial measure, one drop cap, the chain drawn where the copy asks
          for it. */}
      <section className={`sf-section ${styles.story}`} aria-label="Our story">
        <div className={`sf-container ${styles.column}`}>
          {loading && <Skeleton variant="text" lines={8} />}

          {!loading &&
            runs.map((run, index) =>
              run.kind === "chain" ? (
                <ValueChain
                  key={`chain-${index}`}
                  steps={run.steps}
                  className={styles.chain}
                />
              ) : (
                <ContentBlocks
                  key={`blocks-${index}`}
                  blocks={run.blocks}
                  variant="editorial"
                  /* One opening letter per page, not one per run. */
                  dropCap={index === 0}
                  className={styles.prose}
                />
              )
            )}
        </div>
      </section>

      {/* ── 3. THE SECOND PLATE ──────────────────────────────────────────
          A breath between the story and the claims it leads to. Decorative, so
          it is skipped entirely when the record carries no second image. */}
      {copy.image2 ? (
        <motion.div
          className={`sf-placeholder-media ${styles.plate}`}
          aria-hidden="true"
          {...(reduceMotion ? {} : { animate: RESTING })}
          {...reveal(reduceMotion, { inView: true, amount: 0.2 })}
        >
          <img
            className={styles.plateImage}
            src={copy.image2}
            alt=""
            loading="lazy"
            decoding="async"
            onError={onImageError}
          />
        </motion.div>
      ) : null}

      {/* ── 4. THE IMPACT ────────────────────────────────────────────────
          The same three columns the home page shows in words, here with their
          photographs. The heading goes with the block: an impact section that
          invents an impact is worse than no impact section. */}
      {impactItems.length > 0 && (
        <section className={`sf-section ${styles.impact}`} aria-labelledby="about-impact">
          <div className="sf-container">
            <SectionHeading
              id="about-impact"
              eyebrow={impact.eyebrow}
              title={impact.title}
              rule
              className={styles.heading}
            />
            <ImpactTriptych items={impactItems} showImages />
          </div>
        </section>
      )}

      {/* ── 5. THE PILLARS AND THE NOTE ──────────────────────────────────
          `brand.pillars` is a module the bundle always has, so this half of the
          page is true whether or not the CMS answered. */}
      <section className={`sf-section ${styles.pillars}`} aria-labelledby="about-pillars">
        <div className="sf-container">
          <SectionHeading
            id="about-pillars"
            as="h2"
            eyebrow="Our philosophy"
            title="Four pillars"
            rule
            className={styles.heading}
          />
          <Pillars compact />
          <LegalNote className={styles.legal} />
        </div>
      </section>

      {/* ── 6. THE WAY ONWARD ────────────────────────────────────────────── */}
      <section className={`sf-section ${styles.close}`}>
        <div className="sf-container">
          <hr className="sf-hairline sf-hairline--gradient" />
          <div className={styles.actions}>
            <Button variant="primary" size="lg" to={copy.ctaTo}>
              {copy.ctaLabel}
            </Button>
            <Button variant="secondary" to={ROUTES.WHY}>
              Why LAMIKAA
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
