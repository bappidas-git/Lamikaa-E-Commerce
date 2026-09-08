import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import apiService from "../../services/api";
import useSeo from "../../hooks/useSeo";
import { itemListJsonLd } from "../../utils/seo";
import { concernPath } from "../../utils/categories";
import { ROUTES } from "../../utils/constants";
import { Button, Chip, GlassCard, SectionHeading, Skeleton } from "../../components/ui";
import ProductChapter from "../../components/catalogue/ProductChapter";
import ChapterIndex, { chapterId } from "../../components/catalogue/ChapterIndex";
import BuildRitualPanel from "../../components/catalogue/BuildRitualPanel";
import styles from "./Shop.module.css";

// =============================================================================
// /shop — the range, as chapters
// =============================================================================
//
// THE FILTERS ARE GONE, and their absence is the design. The old catalogue was
// a facet sidebar over a grid: category tree, price range, rating, discount,
// in-stock, brand, fabric, six sort orders and pagination — the machinery a
// thousand-SKU store needs, over EIGHT products. The brief (§7.3) replaces it
// outright: no filter, no sort, no pagination, no sidebar. What is left is the
// range itself, one full editorial chapter at a time, in the order the owner
// arranged the hero.
//
// The two ways to narrow it are both ROUTES, not controls:
//
//   /shop?concern=hydration   the three products that answer one concern
//   /category/<slug>          the products in one category  (Prompt 24 gives
//                             this its own head; the chapters are these)
//
// and the way to search is still the overlay and `/search` (Prompt 11), which
// is where a shopper who knows what they want was always going to go.
//
// WHAT REPLACES THE CHROME is an INDEX rather than a toolbar: the eight short
// names, always in view, with the one being read marked and every other one a
// click away. `ChapterIndex` renders it as a 220px sticky rail beside the
// chapters on a desktop and as a sticky pill strip under the masthead on a
// phone. Which chapter is being read is decided by the CHAPTERS — each one
// reports its own crossing of the half-visible line — so the index never has to
// re-derive from scroll offsets what the sections already know.
//
// ONE HEADING, EIGHT CHAPTERS, ONE <h1>. The page's heading is the only h1;
// every chapter owns its own h2, and those eight names are the outline a screen
// reader visitor actually wants.
//
// THREE STATES, ALL DISTINCT. Loading is three skeleton chapters. A FAILED READ
// says so and offers "Try again" — it never renders as "nothing here", because
// telling a shopper the range is empty when the network dropped is the one
// mistake a listing must not make. An empty answer (a concern nobody is on yet)
// says "Nothing here yet" and offers the other concerns and the whole range.
// =============================================================================

// Three, not eight: eight full-height skeletons is a page of shimmer, and the
// five below the fold have not been scrolled to yet.
const SKELETON_COUNT = 3;

// A product with no hero position sorts after every product that has one — the
// same rule `api.js`'s `byHeroOrderThenName` and the home showcase both apply.
const HERO_LAST = 99;

/**
 * The catalogue in reading order: hero order first, then name.
 *
 * `products.getByConcern` and `getByCategorySlug` already answer sorted; a plain
 * `getAll()` does not, and the order of a listing must not depend on which of
 * the three reads produced it. Exported for the unit test.
 */
export const shopOrder = (products) =>
  (Array.isArray(products) ? products.filter(Boolean) : []).slice().sort((a, b) => {
    const ao = a.heroOrder ?? HERO_LAST;
    const bo = b.heroOrder ?? HERO_LAST;
    if (ao !== bo) return ao - bo;
    return String(a.name || "").localeCompare(String(b.name || ""), undefined, {
      numeric: true,
    });
  });

/** "8 products", "1 product" — a listing should not misspell one. */
export const productCountLabel = (count) => {
  const n = Number.isFinite(Number(count)) ? Math.max(0, Number(count)) : 0;
  return `${n} ${n === 1 ? "product" : "products"}`;
};

// ── The page's one read ──────────────────────────────────────────────────────

/**
 * Everything `/shop` needs, in two parallel requests.
 *
 * The concern list is deliberately TOLERANT: the chips are a way to narrow the
 * range, not the range itself, so a `/concerns` collection that fails costs the
 * shopper the chips and nothing else. The product read is the page — its
 * failure is the page's failure.
 *
 * @returns {{status: "loading"|"ready"|"failed", products: object[],
 *            concern: object|null, category: object|null, concerns: object[],
 *            retry: function}}
 */
const useShopData = ({ concernSlug, categorySlug }) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    status: "loading",
    products: [],
    concern: null,
    category: null,
  });
  const [concerns, setConcerns] = useState([]);

  useEffect(() => {
    let alive = true;
    setState((prev) => ({ ...prev, status: "loading" }));

    const read = categorySlug
      ? apiService.products
          .getByCategorySlug(categorySlug)
          .then(({ category, products }) => ({ category, concern: null, products }))
      : concernSlug
      ? apiService.products
          .getByConcern(concernSlug)
          .then(({ concern, products }) => ({ category: null, concern, products }))
      : apiService.products
          .getAll()
          .then((products) => ({ category: null, concern: null, products }));

    read
      .then(({ category, concern, products }) => {
        if (!alive) return;
        setState({
          status: "ready",
          products: shopOrder(products),
          concern: concern || null,
          category: category || null,
        });
      })
      .catch((error) => {
        if (!alive) return;
        console.error("Failed to load the shop:", error);
        setState({ status: "failed", products: [], concern: null, category: null });
      });

    return () => {
      alive = false;
    };
  }, [concernSlug, categorySlug, attempt]);

  useEffect(() => {
    let alive = true;
    apiService.concerns
      .getAll()
      .then((rows) => {
        if (alive) setConcerns(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (alive) setConcerns([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, concerns, retry };
};

// ══════════════════════════════════════════════════════════════════════════════
// SHOP
// ══════════════════════════════════════════════════════════════════════════════

/**
 * @param {object} props
 * @param {"shop"|"category"} [props.mode]  `"category"` reads `:slug` from the
 *        path instead of `?concern=` and lists that category. Prompt 24 gives
 *        the category form its full head (the image band, the breadcrumb and
 *        the not-found branch); the chapters, the index and the closing panel
 *        are these, which is why the two are one page rather than two.
 */
const Shop = ({ mode = "shop" }) => {
  const [params] = useSearchParams();
  const { slug } = useParams();

  const concernSlug = mode === "category" ? "" : (params.get("concern") || "").trim();
  const categorySlug = mode === "category" ? slug || "" : "";

  const { status, products, concern, category, concerns, retry } = useShopData({
    concernSlug,
    categorySlug,
  });

  const loading = status === "loading";
  const failed = status === "failed";
  const total = products.length;

  // ---- Which chapter is being read ----------------------------------------
  // Set by the chapters themselves (IntersectionObserver at 0.5) and read by
  // the index. `useCallback` with no dependencies keeps the identity stable, so
  // a chapter never rebuilds its observer because the page re-rendered.
  const [activeIndex, setActiveIndex] = useState(0);
  const handleVisible = useCallback((index) => setActiveIndex(index), []);

  // A different set of chapters is a different index. Without this a jump from
  // the eighth chapter of `/shop` to `/shop?concern=hydration` (three chapters)
  // would leave the rail pointing at a chapter that is not there.
  useEffect(() => {
    setActiveIndex(0);
  }, [concernSlug, categorySlug]);

  // ---- SCROLL SNAP, desktop only, and only while this page is mounted ------
  // The snap container of a page that scrolls with the document IS the document,
  // so the property has to go on <html>; scoping it to an attribute this page
  // sets and removes is what keeps it from leaking onto every other route. The
  // CSS behind the attribute is `proximity` (never `mandatory`) and is switched
  // off below 1025px and under `prefers-reduced-motion` — see Shop.module.css.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const root = document.documentElement;
    root.setAttribute("data-chapter-snap", "");
    return () => root.removeAttribute("data-chapter-snap");
  }, []);

  // ---- Copy ---------------------------------------------------------------

  const concernName = concern?.name || "";
  const categoryName = category?.displayName || category?.name || "";

  const heading = useMemo(() => {
    if (categorySlug) {
      return {
        eyebrow: "Category",
        title: categoryName || "Shop",
        gradientWord: undefined,
        lede: category?.description || `${productCountLabel(total)} · one ritual`,
      };
    }
    if (concernName) {
      return {
        eyebrow: "Shop by concern",
        title: `For ${concernName}`,
        // "For {concern}" — the concern is the one gradient word here.
        gradientWord: 1,
        lede: `${productCountLabel(total)} for ${concernName}`,
      };
    }
    return {
      eyebrow: "The Black Rice range",
      title: "Shop",
      gradientWord: undefined,
      lede: `${productCountLabel(total)} · one ritual`,
    };
  }, [categorySlug, categoryName, category, concernName, total]);

  // While the range is loading or unreachable the lede must not claim a count.
  const lede = loading
    ? "Loading the range…"
    : failed
    ? "The range could not be loaded."
    : heading.lede;

  const seoTitle = concernName
    ? `Shop · ${concernName}`
    : categoryName || "Shop";

  useSeo({
    title: seoTitle,
    description:
      "Eight Black Rice skincare products from a farmer-owned brand. Cleanse, refresh, treat and moisturise.",
    jsonLd: itemListJsonLd(products),
  });

  const showChapters = !loading && !failed && total > 0;

  return (
    <div className={styles.page}>
      {/* ── The head ────────────────────────────────────────────────────────
          One <h1>, and the eleven concerns as the page's only "narrow this"
          control — chips that are LINKS, because each one is a URL. */}
      <section className={`sf-section ${styles.head}`} aria-labelledby="shop-title">
        <div className="sf-container">
          <SectionHeading
            as="h1"
            id="shop-title"
            eyebrow={heading.eyebrow}
            title={heading.title}
            gradientWord={heading.gradientWord}
            lede={lede}
            rule
          />

          {concerns.length > 0 && (
            /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
            <ul className={styles.concerns} role="list">
              <li>
                <Chip
                  variant="glass"
                  as={Link}
                  to={ROUTES.SHOP}
                  active={!concernSlug && !categorySlug}
                  aria-current={!concernSlug && !categorySlug ? "page" : undefined}
                >
                  All
                </Chip>
              </li>
              {concerns.map((row) => {
                const active = row.slug === concernSlug;
                return (
                  <li key={row.id ?? row.slug}>
                    <Chip
                      variant="concern"
                      as={Link}
                      to={concernPath(row.slug)}
                      tone={row.slug}
                      active={active}
                      aria-current={active ? "page" : undefined}
                    >
                      {row.name}
                    </Chip>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ── The index, mobile form ──────────────────────────────────────────
          Full-bleed and sticky under the masthead; hidden from 1025px, where
          the rail below takes over. Outside `.layout` because the band spans
          the viewport while its pills keep the container's gutter. */}
      {showChapters && (
        <ChapterIndex
          variant="strip"
          products={products}
          activeIndex={activeIndex}
          topId="shop-title"
        />
      )}

      <div className={styles.layout}>
        {/* ── The index, desktop form ───────────────────────────────────────
            FIRST IN THE DOM, second in the grid. An index a keyboard visitor
            reaches only after tabbing through all sixteen chapter CTAs is not
            a shortcut, it is a footnote — so the rail is written before the
            chapters it indexes and `grid-column` puts it on the right, exactly
            the way a flipped chapter moves its own two columns. It also puts
            the two forms of the index in the same place: the strip above is
            before the chapters too. */}
        {showChapters && (
          <div className={styles.rail}>
            <ChapterIndex
              variant="rail"
              products={products}
              activeIndex={activeIndex}
              topId="shop-title"
            />
          </div>
        )}

        <div className={styles.chapters}>
          {loading && (
            <div aria-hidden="true">
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <div className={styles.skeleton} key={index}>
                  <Skeleton
                    variant="block"
                    aspectRatio="4 / 5"
                    className={styles.skeletonPlate}
                  />
                  <div className={styles.skeletonPanel}>
                    <Skeleton variant="text" lines={2} />
                    <Skeleton variant="text" lines={4} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {failed && (
            <GlassCard padding="lg" className={styles.panel} role="alert">
              <p className={styles.panelTitle}>The range could not be loaded.</p>
              <p className={styles.panelBody}>
                Something went wrong on the way to the catalogue. Nothing is
                missing from the range — only from this page.
              </p>
              <Button variant="primary" onClick={retry}>
                Try again
              </Button>
            </GlassCard>
          )}

          {!loading && !failed && total === 0 && (
            /* The concern chips the spec asks for here are the ones directly
               above, in the head — rendering a second set would give a screen
               reader twenty-four links to the same twelve places. */
            <GlassCard padding="lg" className={styles.panel}>
              <p className={styles.panelTitle}>Nothing here yet</p>
              <p className={styles.panelBody}>
                {concernSlug
                  ? "No product in the range answers to that concern yet. Try another one above, or read the whole range."
                  : "There is nothing to show here yet. Read the whole range instead."}
              </p>
              <Button variant="primary" to={ROUTES.SHOP}>
                All products
              </Button>
            </GlassCard>
          )}

          {showChapters &&
            products.map((product, index) => (
              <React.Fragment key={product.id ?? product.slug ?? index}>
                {index > 0 && <hr className={`sf-hairline ${styles.rule}`} />}
                <ProductChapter
                  product={product}
                  index={index}
                  total={total}
                  variant="shop"
                  flip={index % 2 === 1}
                  id={chapterId(product, index)}
                  onVisible={handleVisible}
                />
              </React.Fragment>
            ))}

          {/* The listing's closing statement. It reads the whole catalogue for
              itself, so a concern-narrowed page still draws complete routines. */}
          {showChapters && <BuildRitualPanel />}
        </div>
      </div>
    </div>
  );
};

export default Shop;
