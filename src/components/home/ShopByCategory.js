import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { concernPath } from "../../utils/categories";
import { firstProductForCategory, productsForCategory } from "../../utils/catalogue";
import { reveal } from "../../theme/motion";
import { Chip, SectionHeading, Skeleton } from "../ui";
import CategoryCard from "../catalogue/CategoryCard";
import styles from "./ShopByCategory.module.css";

// =============================================================================
// ShopByCategory — "Find your step": the seven ways into the Black Rice range
// =============================================================================
//
// The second thing the home page says, directly under the hero's trust strip.
// Seven glass cards, each with a real product's label on its plate and a real
// count under its name, then a row of the eleven concern chips for the shopper
// who arrives with a problem rather than with a product in mind.
//
// EVERY NUMBER IS COUNTED, NEVER TYPED. A category's count is the size of its
// membership under `utils/catalogue.js` (listed in `categoryIds`, or the
// primary `categoryId`) — the same rule the mega panel, the mobile drawer and
// `api.getByCategorySlug()` all apply, so no two surfaces can disagree about
// how big a category is. The Rituals category is the exception and says so:
// it holds no products at all, so it counts ROUTINES, from `rituals.getAll()`,
// and borrows the first step of the first ritual for its plate.
//
// FOUR READS, ONE ROUND TRIP EACH, IN PARALLEL. Categories, concerns, products
// (for the thumbnails and the counts) and rituals (for the one count products
// cannot supply). `Promise.all`, because the section wants the whole grid or
// nothing — a half-drawn "seven ways in" reads as broken. Any rejection, or an
// empty category list, and the section renders NOTHING: the page below it is
// complete without it, and an error panel here would be louder than the loss.
//
// The products come from `getHeroProducts()`, which returns them in `heroOrder`
// — so "the first product in this category" is the one the owner ordered first,
// not whichever row the database happened to hand back.
// =============================================================================

// The seven cards are the whole point of the section; while they load, seven
// skeletons hold exactly their shape so nothing below moves when data lands.
const SKELETON_COUNT = 7;

/**
 * @param {object} props
 * @param {object[]|null|undefined} props.categories  the seven ways in
 * @param {object[]|null|undefined} props.concerns    the chips under the grid
 * @param {object[]|null|undefined} props.products    the hero-ordered catalogue
 * @param {object[]|null|undefined} props.rituals     the routines the last card counts
 *
 * All four come from useHomeData(). `undefined` anywhere is "still in flight"
 * (skeletons); `null` anywhere is a read that failed, and the section takes
 * itself off the page — the same answer the combined `Promise.all` gave when
 * this component owned the requests.
 */
const ShopByCategory = ({
  categories: categoryRows,
  concerns: concernRows,
  products: productRows,
  rituals: ritualRows,
}) => {
  const reduceMotion = useReducedMotion();

  // Memoised so it is the same object between renders: `cards` below is a pass
  // over the whole catalogue per category, and an identity that changed every
  // render would re-run it every render.
  const data = useMemo(() => {
    const slices = [categoryRows, concernRows, productRows, ritualRows];
    if (slices.some((slice) => slice === null || slice === undefined)) return null;
    return {
      categories: categoryRows,
      concerns: concernRows,
      products: productRows,
      rituals: ritualRows,
    };
  }, [categoryRows, concernRows, productRows, ritualRows]);

  const failed = [categoryRows, concernRows, productRows, ritualRows].some(
    (slice) => slice === null
  );
  const loading = !failed && !data;

  // One pass over the catalogue per category: its plate product and its count.
  const cards = useMemo(() => {
    if (!data) return [];
    const { categories, products, rituals } = data;
    // The routine that opens the Rituals card — the first step of the first
    // ritual, resolved against the catalogue. Real data, or nothing.
    const firstRitualStep = rituals[0]?.steps?.[0];
    const ritualProduct = firstRitualStep
      ? products.find((p) => String(p.id) === String(firstRitualStep.productId)) || null
      : null;

    return categories.map((category) => {
      const isRituals = category.kind === "rituals";
      return {
        category,
        product: isRituals
          ? ritualProduct
          : firstProductForCategory(products, category),
        count: isRituals ? rituals.length : productsForCategory(products, category).length,
        countNoun: isRituals ? "rituals" : "products",
      };
    });
  }, [data]);

  const concerns = data?.concerns || [];

  // Nothing to say, or nothing to say it with.
  if (failed || (data && cards.length === 0)) return null;

  return (
    <section className={`sf-section ${styles.section}`} aria-labelledby="shop-by-category">
      <div className="sf-container">
        <SectionHeading
          id="shop-by-category"
          eyebrow="Shop by category"
          title="Find your step"
          // "step" — the one gradient keyword this section is allowed.
          gradientWord={2}
          lede="Seven ways into the Black Rice range."
          rule
        />

        {loading ? (
          <div className={styles.grid} aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div className={styles.cell} key={index}>
                <Skeleton variant="card" className={styles.skeleton} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {cards.map(({ category, product, count, countNoun }, index) => (
              <motion.div
                className={styles.cell}
                key={category.id ?? category.slug ?? index}
                {...reveal(reduceMotion, { index, inView: true, amount: 0.1 })}
              >
                <CategoryCard
                  category={category}
                  product={product}
                  count={count}
                  countNoun={countNoun}
                />
              </motion.div>
            ))}
          </div>
        )}

        {concerns.length > 0 && (
          <div className={styles.concerns}>
            <p className={`sf-eyebrow ${styles.concernsEyebrow}`}>Shop by concern</p>
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
            <ul className={styles.concernList} role="list">
              {concerns.map((concern) => (
                <li key={concern.id ?? concern.slug}>
                  <Chip
                    variant="concern"
                    as={Link}
                    to={concernPath(concern.slug)}
                    tone={concern.slug}
                  >
                    {concern.name}
                  </Chip>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopByCategory;
