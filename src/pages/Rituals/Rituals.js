import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import apiService, { resolveRitualSteps } from "../../services/api";
import useSeo from "../../hooks/useSeo";
import { reveal } from "../../theme/motion";
import { groupRitualsByCategory, ritualPath } from "../../utils/categories";
import { ROUTES } from "../../utils/constants";
import { onImageError } from "../../utils/helpers";
import { responsiveImage } from "../../utils/cloudinary";
import { stageSrc } from "../../utils/product";
import {
  Button,
  Chip,
  EmptyState,
  ErrorState,
  GlassCard,
  SectionHeading,
  Skeleton,
} from "../../components/ui";
import { stepCountLabel } from "../../components/catalogue/RitualCard";
import { stepNumeral } from "../../components/catalogue/RitualStep";
import styles from "./Rituals.module.css";

// =============================================================================
// /rituals — the three curated routines
// =============================================================================
//
// The range answers "what is in here?" one product at a time on `/shop`. This
// page answers "in what ORDER?", which is the question the eight chapters leave
// behind — and it answers it three times, because a morning is not an evening
// and neither is a shower.
//
// FULL-WIDTH ROWS, NOT A GRID OF CARDS. `RitualCard` already exists for the
// grid form (the home teaser and the shop's closing panel use it, `compact`),
// and repeating it here would make the index of the rituals look exactly like
// the two places that link TO the index. A row gets the routine's photograph a
// 16:10 stage, its story two paragraphs of room and its step strip a whole line
// — which is the only place on the site where all three fit at once.
//
// ONE CONTROL PER ROW. The row is not a link: it holds a button, and a button
// inside an anchor is invalid markup that swallows the tap. So the heading is
// text, the plates are decoration, and "See the ritual" is the single stop —
// named for the routine it opens, because three identical link names in a
// screen reader's link list are three links to nowhere in particular.
//
// COLLECTIONS. A ritual can be filed (Admin → Rituals → Category) under the
// Rituals root — it opens the page, in the first list — or under a ritual
// SUB-category, which gets a section of its own further down with
// `id={category.slug}`. The header's Rituals tab links each collection as
// `/rituals#<slug>`, and this page scrolls to that section once the data is in
// (ScrollToTop only waits a few frames, which a network read can outlast).
//
// EVERY WORD OF A ROUTINE IS THE ROUTINE'S OWN — name, tagline, story and
// duration come from the record the admin edits. The page types its heading,
// its lede, its CTA and its two empty-state sentences, and nothing else.
// =============================================================================

// The seeded set is three; the skeletons hold exactly that shape so nothing
// below moves when the data lands.
const SKELETON_COUNT = 3;

// 48px on the page, so 96 covers a 2x screen.
const THUMB_WIDTH = 96;

/** "1 ritual", "3 rituals" — the count a collection's heading carries. */
export const ritualCountLabel = (count) => {
  const n = Number.isFinite(Number(count)) ? Math.max(0, Number(count)) : 0;
  return `${n} ${n === 1 ? "ritual" : "rituals"}`;
};

// ── The page's one read ──────────────────────────────────────────────────────

/**
 * The rituals and the catalogue they run over, in two parallel requests.
 *
 * BOTH OR NEITHER. A step names any product in the range, so a step strip
 * resolved against a failed product read would draw four empty plates under a
 * routine that is perfectly fine — worse than saying the page could not be
 * loaded, which is what `Promise.all` lets this do.
 *
 * @returns {{status: "loading"|"ready"|"failed", rituals: object[],
 *            products: object[]}}
 */
const useRituals = () => {
  const [state, setState] = useState({
    status: "loading",
    rituals: [],
    products: [],
    categories: [],
  });
  // Bumped by the error state's "Try again", which re-runs the effect below
  // with its own guards rather than duplicating the fetch.
  const [reloadKey, setReloadKey] = useState(0);
  const retry = useCallback(() => setReloadKey((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    setState((prev) => ({ ...prev, status: "loading" }));
    Promise.all([
      apiService.rituals.getAll(),
      apiService.products.getAll(),
      // Only for the collection headings — without them every ritual simply
      // lists in the first section, which is still the whole page.
      apiService.categories.getAll().catch(() => []),
    ])
      .then(([rituals, products, categories]) => {
        if (!alive) return;
        setState({
          status: "ready",
          rituals: Array.isArray(rituals) ? rituals : [],
          products: Array.isArray(products) ? products : [],
          categories: Array.isArray(categories) ? categories : [],
        });
      })
      .catch((error) => {
        if (!alive) return;
        console.error("Failed to load the rituals:", error);
        setState({ status: "failed", rituals: [], products: [], categories: [] });
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  return { ...state, retry };
};

// ── One row ──────────────────────────────────────────────────────────────────

const RitualRow = ({ ritual, products, index, headingAs: Heading = "h2" }) => {
  const reduceMotion = useReducedMotion();
  const steps = resolveRitualSteps(ritual, products);
  const name = ritual.name || "";
  const headingId = `ritual-${ritual.slug || ritual.id || index}`;

  return (
    <motion.li
      className={styles.row}
      {...reveal(reduceMotion, { index, inView: true, amount: 0.15 })}
    >
      <GlassCard
        as="article"
        strong
        glow={index % 2 ? "violet" : "pink"}
        padding="none"
        className={styles.card}
        aria-labelledby={headingId}
      >
        {ritual.image ? (
          <div className={`sf-placeholder-media ${styles.media}`}>
            <img
              className={styles.image}
              {...responsiveImage(ritual.image, {
                sizes: "(min-width: 1280px) 540px, (min-width: 900px) 42vw, 100vw",
              })}
              alt=""
              loading="lazy"
              decoding="async"
              onError={onImageError}
            />
          </div>
        ) : (
          <div className={styles.media} aria-hidden="true" />
        )}

        <div className={styles.body}>
          <p className={`sf-eyebrow sf-eyebrow--rule ${styles.eyebrow}`}>
            {stepCountLabel(steps.length)}
          </p>

          <Heading id={headingId} className={styles.name}>
            {name}
          </Heading>

          {ritual.tagline ? <p className={styles.tagline}>{ritual.tagline}</p> : null}
          {ritual.story ? <p className={styles.story}>{ritual.story}</p> : null}

          {/* The sequence, drawn. Decoration: the eyebrow above already says
              how many steps there are, and the plates carry no words. */}
          {steps.length > 0 && (
            <div className={styles.strip} aria-hidden="true">
              {steps.map((step, position) => (
                <span className={styles.stripStep} key={`${step.order}-${position}`}>
                  <span className={`sf-plate ${styles.thumb}`}>
                    {step.product ? (
                      <img
                        src={stageSrc(step.product, { w: THUMB_WIDTH })}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={onImageError}
                      />
                    ) : null}
                  </span>
                  <Chip variant="step" className={styles.stripNumeral}>
                    {stepNumeral(step.order, position)}
                  </Chip>
                </span>
              ))}
            </div>
          )}

          <div className={styles.foot}>
            {ritual.duration ? (
              <p className={styles.duration}>{ritual.duration}</p>
            ) : null}
            <Button
              variant="primary"
              to={ritualPath(ritual)}
              /* "See the ritual" three times over is three links a screen
                 reader cannot tell apart; the routine's name is what does. */
              aria-label={`See the ritual: ${name}`}
            >
              See the ritual
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.li>
  );
};

// ── One collection's heading ─────────────────────────────────────────────────

/**
 * How a ritual collection opens: a seam (the "Collection" label, a hairline
 * the width of the list, the count), then the collection's own name and
 * description.
 *
 * NEVER LOUDER THAN THE PAGE TITLE. The name is an h2 under "Curated
 * routines", so it takes that heading's --sf-text-2xl and no more. At
 * --sf-text-3xl it out-sized the page's own h1 and matched the routine names
 * in the cards, and nothing on the page said which heading was in charge.
 *
 * THE SEAM IS THE DIVIDER. Without it a collection was loose text in the gap
 * between two cards; with it the section visibly starts, and the count at the
 * rule's far end fills the row a left-aligned heading would leave empty.
 *
 * From 900px the name and the description split on the card's own 42/58 line,
 * so the description starts exactly where the story in the card below does.
 */
const CollectionHead = ({ category, count, titleId }) => {
  const reduceMotion = useReducedMotion();
  const description = String(category.description || "").trim();

  return (
    <motion.header
      className={styles.collectionHead}
      {...reveal(reduceMotion, { inView: true, amount: 0.5 })}
    >
      <div className={styles.collectionMeta}>
        <p className={`sf-eyebrow ${styles.collectionEyebrow}`}>Collection</p>
        <span className={styles.collectionRule} aria-hidden="true" />
        <p className={styles.collectionCount}>{ritualCountLabel(count)}</p>
      </div>
      <h2 id={titleId} className={styles.collectionTitle}>
        {category.displayName || category.name}
      </h2>
      {description ? <p className={styles.collectionLede}>{description}</p> : null}
    </motion.header>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// RITUALS
// ══════════════════════════════════════════════════════════════════════════════

const Rituals = () => {
  const { status, rituals, products, categories, retry } = useRituals();
  const { hash } = useLocation();
  const reduceMotion = useReducedMotion();

  const { main, groups } = useMemo(
    () => groupRitualsByCategory(rituals, categories),
    [rituals, categories]
  );

  useSeo({
    title: "Rituals",
    description:
      "Three curated routines that put the LAMIKAA Naturals Black Rice range in the order it was designed for.",
  });

  const loading = status === "loading";
  const failed = status === "failed";

  // `/rituals#<collection>` — go to that collection once it is on the page.
  useEffect(() => {
    if (status !== "ready" || !hash) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    const raf = window.requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (target.tabIndex < 0) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(raf);
  }, [status, hash, reduceMotion]);

  return (
    <div className={styles.page}>
      <section className={`sf-section ${styles.head}`} aria-labelledby="rituals-title">
        <div className="sf-container">
          <SectionHeading
            as="h1"
            id="rituals-title"
            eyebrow="Rituals"
            title="Curated routines"
            // "routines" — the one gradient keyword this page is allowed.
            gradientWord={1}
            lede="Three ways to use the Black Rice range in the order it was designed for."
            rule
          />
        </div>
      </section>

      <div className={`sf-container ${styles.list}`}>
        {loading && (
          <div aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div className={styles.skeleton} key={index}>
                <Skeleton variant="block" aspectRatio="16 / 10" />
                <div className={styles.skeletonBody}>
                  <Skeleton variant="text" lines={2} />
                  <Skeleton variant="text" lines={3} />
                </div>
              </div>
            ))}
          </div>
        )}

        {failed && (
          <ErrorState
            className={styles.panel}
            text="Nothing was changed — the routines are intact, they just didn't reach this page. Check your connection and try again."
            onRetry={retry}
            actions={
              <Button variant="ghost" to={ROUTES.SHOP}>
                Shop the range
              </Button>
            }
          />
        )}

        {!loading && !failed && rituals.length === 0 && (
          <EmptyState
            className={styles.panel}
            title="No routines yet"
            text="The curated routines are being written. The whole range is ready in the meantime."
            icon="mdi:playlist-remove"
            actions={<Button to={ROUTES.SHOP}>Shop the range</Button>}
          />
        )}

        {!loading && !failed && main.length > 0 && (
          /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
          <ul className={styles.rows} role="list">
            {main.map((ritual, index) => (
              <RitualRow
                key={ritual.id ?? ritual.slug ?? index}
                ritual={ritual}
                products={products}
                index={index}
              />
            ))}
          </ul>
        )}

        {/* One section per ritual collection, each the target of
            /rituals#<slug> from the header's Rituals tab. */}
        {!loading &&
          !failed &&
          groups.map(({ category, rituals: list }, groupIndex) => {
            const slug = String(category.slug || category.id);
            const titleId = `collection-${slug}-title`;
            // The glow keeps alternating across sections, not restarting.
            const offset =
              main.length +
              groups.slice(0, groupIndex).reduce((n, g) => n + g.rituals.length, 0);
            return (
              <section
                key={category.id ?? slug}
                id={slug}
                className={styles.collection}
                aria-labelledby={titleId}
              >
                <CollectionHead
                  category={category}
                  count={list.length}
                  titleId={titleId}
                />
                {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
                <ul className={styles.rows} role="list">
                  {list.map((ritual, index) => (
                    <RitualRow
                      key={ritual.id ?? ritual.slug ?? index}
                      ritual={ritual}
                      products={products}
                      index={offset + index}
                      headingAs="h3"
                    />
                  ))}
                </ul>
              </section>
            );
          })}
      </div>

      {/* One way back into the range, for a visitor who has read all three and
          would rather assemble their own. */}
      {!loading && !failed && rituals.length > 0 && (
        <section className={`sf-section ${styles.close}`}>
          <div className="sf-container">
            <hr className="sf-hairline sf-hairline--gradient" />
            <p className={styles.closeText}>
              Or read the range one product at a time.
            </p>
            <Button variant="secondary" to={ROUTES.SHOP}>
              Shop all products
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Rituals;
