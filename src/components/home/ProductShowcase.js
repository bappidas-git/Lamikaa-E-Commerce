import React, { useEffect, useState } from "react";
import apiService from "../../services/api";
import { SectionHeading, Skeleton } from "../ui";
import ProductChapter from "../catalogue/ProductChapter";
import styles from "./ProductShowcase.module.css";

// =============================================================================
// ProductShowcase — "Eight steps. One ritual."
// =============================================================================
//
// The heart of the home page: after the seven ways in, every product gets its
// own full editorial chapter, in the order the owner arranged the hero. One
// heading opens the run and then the page belongs to the products — alternating
// split-screen spreads with the pack sticky beside its own words on a desktop,
// pack-first stacks on a phone.
//
// ONE HEADING, EIGHT CHAPTERS. The `SectionHeading` is rendered ONCE, above the
// run, and each chapter owns its own `h2`. Repeating the section's title per
// product would give the page eight headings that say the same thing, and the
// chapter names are the outline a screen-reader visitor actually wants.
//
// DATA. `products.getHeroProducts()` — already visible-only and already sorted
// by `heroOrder` in both api modes, so the showcase can never disagree with the
// hero about the order of the range. The fallback is the whole catalogue sorted
// the same way (`heroOrder ?? 99`), for a merchant who has not arranged the hero
// yet; a product with no `heroOrder` sorts to the end by name-stable order
// rather than jumping the queue. On ERROR the section renders NOTHING: the page
// above and below it is complete without it, and an error panel here would be
// louder than the loss.
//
// WHILE IT LOADS, two skeleton chapters hold the shape of the first spread —
// not eight, because eight full-height skeletons is a page of shimmer, and the
// two below the fold have not been scrolled to yet.
//
// The copy here is the section's own (BRAND.md §3.1 for the lede); not one word
// of PRODUCT copy is typed in this file or in ProductChapter.
// =============================================================================

// Two skeletons, matching the first two chapters' layout. See above.
const SKELETON_COUNT = 2;

// A product that has not been given a hero position sorts after every product
// that has. Same rule `utils/catalogue.js` applies to category listings.
const HERO_LAST = 99;

/**
 * The chapters, in order.
 *
 * Exported for the unit test: it is the one piece of logic in this file, and
 * "which products, in which order" is exactly what a showcase can get wrong.
 */
export const showcaseProducts = (heroProducts, all) => {
  const hero = Array.isArray(heroProducts) ? heroProducts.filter(Boolean) : [];
  if (hero.length > 0) return hero;
  return (Array.isArray(all) ? all.filter(Boolean) : [])
    .slice()
    .sort((a, b) => (a.heroOrder ?? HERO_LAST) - (b.heroOrder ?? HERO_LAST));
};

const ChapterSkeleton = () => (
  <div className={styles.skeleton} aria-hidden="true">
    <Skeleton variant="block" aspectRatio="4 / 5" className={styles.skeletonPlate} />
    <div className={styles.skeletonPanel}>
      <Skeleton variant="text" lines={2} />
      <Skeleton variant="text" lines={4} />
    </div>
  </div>
);

const ProductShowcase = () => {
  const [products, setProducts] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    apiService.products
      .getHeroProducts()
      .then((hero) => {
        if (!active) return;
        // An empty hero list is not a failure — it is a merchant who has not
        // arranged one. Fall back to the catalogue before giving up.
        if (Array.isArray(hero) && hero.length > 0) {
          setProducts(showcaseProducts(hero));
          return null;
        }
        return apiService.products.getAll().then((all) => {
          if (active) setProducts(showcaseProducts(null, all));
        });
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  // Nothing to say, or nothing to say it with.
  if (failed || (products && products.length === 0)) return null;

  const loading = !products;
  const total = products?.length || 0;

  return (
    <div className={styles.showcase}>
      <section className={`sf-section ${styles.intro}`} aria-labelledby="product-showcase">
        <div className="sf-container">
          <SectionHeading
            id="product-showcase"
            eyebrow="The Black Rice range"
            title="Eight steps. One ritual."
            // "ritual" — the one gradient keyword this section is allowed.
            gradientWord={3}
            lede="Every product carries a bigger purpose — beauty that creates value for farmers."
            rule
          />
        </div>
      </section>

      {loading ? (
        <div className="sf-container">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <ChapterSkeleton key={index} />
          ))}
        </div>
      ) : (
        products.map((product, index) => (
          <React.Fragment key={product.id ?? product.slug ?? index}>
            {index > 0 && (
              <div className="sf-container">
                <hr className={`sf-hairline ${styles.rule}`} />
              </div>
            )}
            <ProductChapter
              product={product}
              index={index}
              total={total}
              variant="home"
              flip={index % 2 === 1}
              id={`product-${product.slug || product.id}`}
            />
          </React.Fragment>
        ))
      )}
    </div>
  );
};

export default ProductShowcase;
