import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import apiService from "../../services/api";
import useSeo from "../../hooks/useSeo";
import { breadcrumbJsonLd, itemListJsonLd } from "../../utils/seo";
import { concernPath } from "../../utils/categories";
import { ROUTES } from "../../utils/constants";
import {
  Button,
  Chip,
  EmptyState,
  ErrorState,
  SectionHeading,
  Skeleton,
} from "../../components/ui";
import CategoryHead from "../../components/catalogue/CategoryHead";
import ProductChapter from "../../components/catalogue/ProductChapter";
import ChapterIndex, {
  ChapterIndexReserve,
  chapterId,
} from "../../components/catalogue/ChapterIndex";
import BuildRitualPanel from "../../components/catalogue/BuildRitualPanel";
import { concernLabel } from "../../components/storefront/ProductCard";
import NotFound from "../NotFound/NotFound";
import styles from "./Shop.module.css";

// =============================================================================
// /shop and /category/:slug — the range, as chapters
// =============================================================================
//
// THE FILTERS ARE GONE, and their absence is the design. The old catalogue was
// a facet sidebar over a grid: category tree, price range, rating, discount,
// in-stock, brand, material, six sort orders and pagination — the machinery a
// thousand-SKU store needs, over EIGHT products. The brief (§7.3) replaces it
// outright: no filter, no sort, no pagination, no sidebar. What is left is the
// range itself, one full editorial chapter at a time, in the order the owner
// arranged the hero.
//
// The two ways to narrow it are both ROUTES, not controls:
//
//   /shop?concern=hydration   the three products that answer one concern
//   /category/<slug>          the products in one category
//
// and the way to search is still the overlay and `/search` (Prompt 11), which
// is where a shopper who knows what they want was always going to go.
//
// A CATEGORY IS THE SAME PAGE WEARING A HEAD (Prompt 24). `/category/face-care`
// is this listing constrained by its URL: the same chapters, the same index,
// the same closing panel, under `CategoryHead` — the full-bleed band with the
// category's own photograph and a glass panel carrying the trail, the name, the
// description, the count and the concerns those products answer to. Making it a
// second page would have meant two listings to keep in step; making the
// constraint a FILTER would have meant a control that does what a URL already
// does. Prompt 23 built the constraint, this is its head.
//
// WHAT REPLACES THE CHROME is an INDEX rather than a toolbar: the eight short
// names, always in view, with the one being read marked and every other one a
// click away. `ChapterIndex` renders it as a 220px sticky rail beside the
// chapters on a desktop and as a sticky pill strip under the masthead on a
// phone. Which chapter is being read is decided by the CHAPTERS — each one
// reports its own crossing of the half-visible line — so the index never has to
// re-derive from scroll offsets what the sections already know.
//
// ONE HEADING, EIGHT CHAPTERS, ONE <h1>. The page's heading is the only h1 —
// the section heading on `/shop`, `CategoryHead`'s on a category — and every
// chapter owns its own h2, which is the outline a screen reader visitor wants.
//
// THREE STATES, ALL DISTINCT. Loading is three skeleton chapters. A FAILED READ
// says so and offers "Try again" — it never renders as "nothing here", because
// telling a shopper the range is empty when the network dropped is the one
// mistake a listing must not make. An empty answer (a concern nobody is on yet)
// says "Nothing here yet" and offers the other concerns and the whole range.
// A category slug nobody has is neither: it is a 404, and it says so.
// =============================================================================

// Three, not eight: eight full-height skeletons is a page of shimmer, and the
// five below the fold have not been scrolled to yet.
const SKELETON_COUNT = 3;

/**
 * The concern row's SHAPE while the concerns are still on the wire (Prompt 38).
 *
 * The chips are admin-managed data, so the page cannot know them synchronously
 * — and rendering nothing until they arrived meant a wrapped row of a dozen
 * pills appeared above the listing after the fetch and pushed the whole page
 * down. Measured on the production build at 412px that was a 0.149 layout
 * shift, by far the largest on the route.
 *
 * These are not labels and they are not data: they are the label WIDTHS a row
 * of concern pills occupies, in `em` of the pill's own type, so the slot opens
 * at the height the real row will want. Each was MEASURED off the rendered row
 * rather than counted off the strings. The count and the spread are the shipped
 * collection's — "All" plus eleven concerns; if the merchant renames or adds
 * one, the reservation is a fraction of a row out for a single paint instead of
 * five rows out.
 *
 * `em` AND NOT `ch`, which is what this was first written in and why it did not
 * work. `ch` is the advance of a ZERO, so it changes with the font FAMILY — the
 * reservation was still rendering in the fallback when the row it reserves had
 * already switched to Manrope, and it wrapped to three lines against the real
 * row's four. `em` is the font SIZE, which the fallback and the webfont share,
 * so the slot is the same width whichever face is painting it, and it still
 * follows the type scale if the tier ever moves.
 */
const CONCERN_RESERVE_EM = [
  1.23, 4.92, 5.69, 4.77, 3.85, 2.38, 3.23, 5.23, 3.77, 4.85, 4.08, 5.31,
];

// A product with no hero position sorts after every product that has one — the
// same rule `api.js`'s `byHeroOrderThenName` and the home showcase both apply.
const HERO_LAST = 99;

// The one category that is not a listing. Its `kind` is the real test (the
// owner can rename the slug in the admin); the literal is the cheap one, and
// it saves the redirect a round trip it would only throw away.
const RITUALS_SLUG = "rituals";

// The page's <h1> id, shared with the chapter index's "Back to top" target and
// written by whichever head this route is wearing.
const TITLE_ID = "shop-title";

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

/**
 * The concerns the products on this page actually answer to, named.
 *
 * READ OFF THE PRODUCTS, not off the category. A category record has no
 * concerns of its own, and printing the whole eleven-chip collection under a
 * two-product category would offer nine links to lists this category is not in.
 * The `concerns` collection is consulted only for the display NAME and the
 * editorial ORDER; a slug with no record still gets a chip, because the
 * products are the truth here and the collection is only the dictionary.
 *
 * Exported for the unit test.
 */
export const concernsOf = (products, concerns = []) => {
  const present = new Set();
  (Array.isArray(products) ? products : []).forEach((product) =>
    (product?.concerns || []).forEach((slug) => present.add(String(slug)))
  );
  if (present.size === 0) return [];

  const named = (Array.isArray(concerns) ? concerns : [])
    .filter((row) => present.has(String(row?.slug)))
    .map((row) => ({ slug: String(row.slug), name: row.name || concernLabel(row.slug) }));

  const known = new Set(named.map((row) => row.slug));
  const orphans = [...present]
    .filter((slug) => !known.has(slug))
    .sort()
    .map((slug) => ({ slug, name: concernLabel(slug) }));

  return [...named, ...orphans];
};

// ── The page's one read ──────────────────────────────────────────────────────

/**
 * Everything the listing needs, in two parallel requests.
 *
 * The concern list is deliberately TOLERANT: the chips are a way to narrow the
 * range, not the range itself, so a `/concerns` collection that fails costs the
 * shopper the chips and nothing else. The product read is the page — its
 * failure is the page's failure.
 *
 * `skip` is for the one route that is going to redirect before it renders
 * anything (`/category/rituals`): asking the API for a listing nobody will see
 * is a round trip spent on a page that is already leaving.
 *
 * @returns {{status: "loading"|"ready"|"failed", products: object[],
 *            concern: object|null, category: object|null, concerns: object[],
 *            retry: function}}
 */
const useShopData = ({ concernSlug, categorySlug, skip = false }) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({
    status: "loading",
    products: [],
    concern: null,
    category: null,
  });
  const [concerns, setConcerns] = useState([]);
  // The concerns are a SECOND, independent request (below), so "the range has
  // arrived" says nothing about whether the chip row is known yet. Tracking it
  // separately is what lets the head reserve that row for exactly as long as it
  // is actually unknown — reserving it against `status` instead made the head
  // shrink the moment the products landed and grow again when the concerns did,
  // which is two layout shifts where there had been one (Prompt 38).
  const [concernsLoading, setConcernsLoading] = useState(true);

  useEffect(() => {
    if (skip) return undefined;
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
  }, [concernSlug, categorySlug, attempt, skip]);

  useEffect(() => {
    if (skip) return undefined;
    let alive = true;
    apiService.concerns
      .getAll()
      .then((rows) => {
        if (!alive) return;
        setConcerns(Array.isArray(rows) ? rows : []);
        setConcernsLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setConcerns([]);
        setConcernsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [skip]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...state, concerns, concernsLoading, retry };
};

// ══════════════════════════════════════════════════════════════════════════════
// THE LISTING
// ══════════════════════════════════════════════════════════════════════════════

/**
 * The page, once the route has decided that there IS one.
 *
 * @param {object} props
 * @param {"shop"|"category"} props.mode
 */
const ShopView = ({
  mode,
  concernSlug,
  categorySlug,
  status,
  products,
  concern,
  category,
  concerns,
  concernsLoading,
  retry,
}) => {
  const isCategory = mode === "category";
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
  }, [concernName, total]);

  // While the range is loading or unreachable the lede must not claim a count.
  const lede = loading
    ? "Loading the range…"
    : failed
    ? "The range could not be loaded."
    : heading.lede;

  // The category head's own count line follows the same rule.
  const countLabel = loading || failed ? "" : productCountLabel(total);

  // The concerns THESE products answer to — the category head's chip row. On
  // `/shop` the chips are the whole collection instead: there, they are the way
  // to narrow the range rather than a description of what is in it.
  const headConcerns = useMemo(
    () => (isCategory && !loading && !failed ? concernsOf(products, concerns) : []),
    [isCategory, loading, failed, products, concerns]
  );

  // ONE ARRAY, TWO RENDERINGS: the visible trail and the BreadcrumbList.
  const trail = useMemo(
    () =>
      isCategory
        ? [
            { label: "Home", to: ROUTES.HOME },
            { label: "Shop", to: ROUTES.SHOP },
            ...(categoryName ? [{ label: categoryName }] : []),
          ]
        : [],
    [isCategory, categoryName]
  );

  const seoTitle = isCategory
    ? categoryName || "Shop"
    : concernName
    ? `Shop · ${concernName}`
    : "Shop";

  const seoDescription =
    (isCategory && category?.description) ||
    "Eight Black Rice skincare products from a farmer-owned brand. Cleanse, refresh, treat and moisturise.";

  useSeo({
    title: seoTitle,
    description: seoDescription,
    jsonLd: isCategory
      ? [breadcrumbJsonLd(trail), itemListJsonLd(products)].filter(Boolean)
      : itemListJsonLd(products),
  });

  const showChapters = !loading && !failed && total > 0;

  return (
    <div className={styles.page}>
      {/* ── The head ────────────────────────────────────────────────────────
          Two shapes, one <h1>. A category wears the band and the glass panel;
          `/shop` and `/shop?concern=` wear the section heading and the eleven
          concerns as the page's only "narrow this" control — chips that are
          LINKS, because each one is a URL. */}
      {isCategory ? (
        <CategoryHead
          category={category}
          trail={trail}
          countLabel={countLabel}
          concerns={headConcerns}
          titleId={TITLE_ID}
          className={styles.categoryHead}
        />
      ) : (
        <section className={`sf-section ${styles.head}`} aria-labelledby={TITLE_ID}>
          <div className="sf-container">
            <SectionHeading
              as="h1"
              id={TITLE_ID}
              eyebrow={heading.eyebrow}
              title={heading.title}
              gradientWord={heading.gradientWord}
              lede={lede}
              rule
            />

            {concerns.length === 0 && concernsLoading && (
              /* The row's slot, held at the height the chips will want. Inert
                 and unannounced: there is nothing here to read yet. */
              <ul className={styles.concerns} aria-hidden="true">
                {CONCERN_RESERVE_EM.map((em, index) => (
                  <li key={index}>
                    <span
                      className={`sf-chip ${styles.concernReserve}`}
                      style={{
                        /* the label, plus the pill's own padding and hairline */
                        width: `calc(${em}em + var(--sf-space-4) * 2 + 2px)`,
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}

            {concerns.length > 0 && (
              /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
              <ul className={styles.concerns} role="list">
                <li>
                  <Chip
                    variant="glass"
                    as={Link}
                    to={ROUTES.SHOP}
                    active={!concernSlug}
                    aria-current={!concernSlug ? "page" : undefined}
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
      )}

      {/* ── The index, mobile form ──────────────────────────────────────────
          Full-bleed and sticky under the masthead; hidden from 1025px, where
          the rail below takes over. Outside `.layout` because the band spans
          the viewport while its pills keep the container's gutter. */}
      {showChapters ? (
        <ChapterIndex
          variant="strip"
          products={products}
          activeIndex={activeIndex}
          topId={TITLE_ID}
        />
      ) : loading ? (
        /* The band's slot, so the listing does not jump 48px down the moment
           the range arrives (Prompt 38 — CLS). Only while LOADING: a failed
           fetch and an empty range both end with no band at all, and reserving
           a strip that will never come is its own empty gap. */
        <ChapterIndexReserve />
      ) : null}

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
              topId={TITLE_ID}
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
            <ErrorState
              className={styles.panel}
              text="Nothing was changed — the range is intact, it just didn't reach this page. Check your connection and try again."
              onRetry={retry}
            />
          )}

          {!loading && !failed && total === 0 && (
            /* The concern chips the spec asks for here are the ones directly
               above, in the head — rendering a second set would give a screen
               reader twenty-four links to the same twelve places. */
            <EmptyState
              className={styles.panel}
              title="Nothing here yet"
              text={
                concernSlug
                  ? "No product in the range answers to that concern yet. Try another one above, or read the whole range."
                  : isCategory
                  ? "There is nothing in this category yet. Read the whole range instead."
                  : "There is nothing to show here yet. Read the whole range instead."
              }
              actions={<Button to={ROUTES.SHOP}>All products</Button>}
            />
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

// ══════════════════════════════════════════════════════════════════════════════
// SHOP
// ══════════════════════════════════════════════════════════════════════════════

/**
 * The route's two decisions, and nothing else.
 *
 * THE SPLIT IS NOT COSMETIC. `useSeo` claims the tab, the description, the
 * Open Graph set and the canonical, and remembers what it displaced so it can
 * put it back. Two of them mounted at once — this page's, and the one inside
 * <NotFound/> — restore in the wrong order and leave a stale description
 * behind. So both exits are taken BEFORE the view that owns the head, and
 * exactly one useSeo is ever mounted on this route.
 *
 * @param {object} props
 * @param {"shop"|"category"} [props.mode]  `"category"` reads `:slug` from the
 *        path instead of `?concern=` and lists that category. The chapters, the
 *        index and the closing panel are identical to `/shop`, which is why the
 *        two are one page rather than two.
 */
const Shop = ({ mode = "shop" }) => {
  const [params] = useSearchParams();
  const { slug } = useParams();

  const isCategory = mode === "category";
  const concernSlug = isCategory ? "" : (params.get("concern") || "").trim();
  const categorySlug = isCategory ? slug || "" : "";

  // The rituals "category" is an editorial index of its own, not a listing —
  // `categoryPath()` already sends every link in the app to /rituals, so this
  // is for the typed URL and the old bookmark.
  const toRituals = isCategory && categorySlug === RITUALS_SLUG;

  const data = useShopData({ concernSlug, categorySlug, skip: toRituals });

  if (toRituals || (isCategory && data.category?.kind === "rituals")) {
    return <Navigate to={ROUTES.RITUALS} replace />;
  }

  // A slug nobody has is a 404, not an empty listing: `getByCategorySlug`
  // answers `{category: null, products: []}` for one rather than rejecting, so
  // the page can tell "no such category" from "the catalogue is unreachable".
  if (isCategory && data.status === "ready" && !data.category) return <NotFound />;

  return (
    <ShopView
      mode={mode}
      concernSlug={concernSlug}
      categorySlug={categorySlug}
      {...data}
    />
  );
};

export default Shop;
