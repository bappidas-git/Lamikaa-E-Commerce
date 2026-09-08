import { seoOrigin } from "../hooks/useSeo";
import brand from "../config/brand";
import { cld } from "./cloudinary";
import { productPath } from "./helpers";
import { isPriceKnown, productMedia, resolvePrice, stageSrc } from "./product";

// =============================================================================
// PAGE-LEVEL STRUCTURED DATA
// =============================================================================
//
// `hooks/useSeo.js` owns the two SITE-level graphs (`Organization`, `WebSite`)
// because the home page publishes them once for the whole storefront. This file
// owns the graphs that belong to a PAGE — the ones whose content changes with
// the route. Prompt 23 opened it with `ItemList`, which is what a listing is;
// Prompt 24 adds `BreadcrumbList` — the category pages and the ritual pages both
// sit at the end of a trail — and Prompt 27 adds `Product`, which is the one
// graph on the storefront a search engine will render as a rich result.
//
// EVERY URL IS ABSOLUTE, and built from `seoOrigin()` — the same origin the
// canonical link uses, so a crawler is never told about two spellings of one
// page. While `brand.seo.siteUrl` is still the `{{LAMIKAA_DOMAIN}}` placeholder
// that origin is `window.location.origin`, which is correct on the real host
// and harmless on localhost.
//
// NOTHING UNRESOLVED IS PUBLISHED. A structured-data field is a claim; a
// half-filled one is a fabricated fact as far as a crawler is concerned. A
// product with no slug and no id has no URL, so it is dropped from the list
// rather than published pointing at `/product/undefined`.
// =============================================================================

// ─── Shared helpers ──────────────────────────────────────────────────────────

/** A trimmed string, or "" for anything that is not one. */
const crumbText = (value) => (typeof value === "string" ? value.trim() : "");

/** A path becomes absolute on the site origin; an absolute URL is left alone. */
const absoluteUrl = (value, origin) => {
  const url = crumbText(value);
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `${origin}${url}`;
};

/** Drop the keys a graph should not carry rather than emit empty ones. */
const compact = (object) =>
  Object.fromEntries(
    Object.entries(object).filter(([, value]) =>
      Array.isArray(value) ? value.length > 0 : value != null && value !== ""
    )
  );

/**
 * An `ItemList` of product URLs — the shape a listing page has.
 *
 * The position is the order the visitor actually reads (hero order on `/shop`),
 * 1-based, which is what `ListItem.position` means. `name` rides along so the
 * list is legible in a rich-results test without a second fetch per item; the
 * full `Product` graph belongs to the PDP, not to eight summaries of it.
 *
 * @param {object[]} products  the catalogue rows, in the order they are shown
 * @returns {object|null} schema.org ItemList, or null when there is nothing to
 *          list — `useSeo` skips the <script> entirely for a null graph.
 */
export const itemListJsonLd = (products) => {
  const origin = seoOrigin();
  const rows = (Array.isArray(products) ? products : []).filter(
    (product) => product && (product.slug || product.id)
  );
  if (rows.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: rows.length,
    itemListElement: rows.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${origin}${productPath(product)}`,
      ...(product.name ? { name: product.name } : {}),
    })),
  };
};

/**
 * A `BreadcrumbList` of the trail a page sits at the end of.
 *
 * SAME ARRAY AS THE VISIBLE TRAIL. `components/Breadcrumb` renders one list of
 * `{ label, to }` and this publishes the same one, so the crumb a visitor reads
 * and the crumb a crawler is told about cannot drift apart — the failure mode
 * of every hand-written BreadcrumbList.
 *
 * The last item is the page itself and normally carries no `to`; it still takes
 * a position (a BreadcrumbList that stops one short of the page it describes is
 * a trail to somewhere else) and its `item` URL is simply omitted, which is what
 * schema.org asks for on the final crumb.
 *
 * TWO VOCABULARIES, ONE FUNCTION. The visible trail speaks `{ label, to }` —
 * that is `components/Breadcrumb`'s prop shape and the reason this takes the
 * page's own array. A caller with nothing to draw (a graph assembled from
 * schema.org's own words) may pass `{ name, url }` instead. Neither spelling is
 * translated at the call site, because a trail retyped for the crawler is a
 * trail that drifts.
 *
 * @param {Array<{label?: string, name?: string, to?: string, url?: string}>} items
 *        the trail, Home first
 * @returns {object|null} schema.org BreadcrumbList, or null for a trail with
 *          nothing on it — `useSeo` publishes no <script> for a null graph.
 */
export const breadcrumbJsonLd = (items) => {
  const origin = seoOrigin();
  const trail = (Array.isArray(items) ? items : [])
    .map((item) =>
      item && typeof item === "object"
        ? { name: crumbText(item.label ?? item.name), to: item.to ?? item.url }
        : null
    )
    .filter((item) => item && item.name);
  if (trail.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.to ? { item: absoluteUrl(item.to, origin) } : {}),
    })),
  };
};

/**
 * The `Product` graph — the PDP's own description of what is on the page.
 *
 * THIS IS THE GRAPH A CRAWLER TURNS INTO A RICH RESULT, which is exactly why it
 * is the one that must not overstate. Two of its properties are claims about
 * commerce rather than descriptions of a product, and each is published only
 * when the shop can actually back it:
 *
 *   offers            only for a product whose price is KNOWN. Five of the
 *                     eight products ship before their MRP is set
 *                     (`priceTBA`), and an Offer with `price: 0` on one of
 *                     those is a lie a search engine will print in a result
 *                     card. `isPriceKnown` is the same predicate the disabled
 *                     Add to Cart uses, so the page and the graph agree.
 *   availability      only where a stock number was actually recorded. "In
 *                     stock" and "out of stock" are both statements; a product
 *                     nobody has counted deserves neither.
 *   aggregateRating   only where a real rating exists. Every seeded product is
 *                     at zero reviews and the two sample rows are hidden
 *                     (BRAND.md §3.9 rule 6), so on a fresh install this key is
 *                     absent from all eight graphs — which is correct, and is
 *                     what a fabricated 4.8 would have destroyed.
 *
 * THE RATING IS THE PAGE'S, NOT THE RECORD'S. `ProductDetails` blends the
 * stored aggregate with the approved reviews it fetched into one average shown
 * once on the page; the graph takes that same pair so the number a visitor
 * reads and the number a crawler is told cannot differ. Omitted, the product
 * record's own `rating`/`totalReviews` stand in.
 *
 * @param {object} product            the product record
 * @param {object} [options]
 * @param {string} [options.url]      the PDP's URL or path; defaults to the
 *                                    canonical `/product/:slug`
 * @param {string} [options.category] the category's display name
 * @param {number} [options.rating]      average rating shown on the page
 * @param {number} [options.ratingCount] number of ratings behind it
 * @returns {object|null} schema.org Product, or null when there is no product
 */
export const productJsonLd = (product, { url, category, rating, ratingCount } = {}) => {
  if (!product) return null;

  const origin = seoOrigin();
  const pageUrl = absoluteUrl(url || productPath(product), origin);

  // The stage image first (the crop the page itself opens on), then the rest of
  // the gallery in authored order. Deduped, because the stage image IS one of
  // the gallery rows whenever the product carries no crop.
  const gallery = productMedia(product)
    .filter((row) => row.type === "image" && row.url)
    .map((row) => cld(row.url, { w: 1200 }));
  const image = Array.from(
    new Set([stageSrc(product, { w: 1200 }), ...gallery].filter(Boolean))
  );

  const description =
    crumbText(product.metaDescription) ||
    crumbText(product.promise) ||
    crumbText(product.shortDescription) ||
    crumbText(product.description);

  const brandName = crumbText(product.brand) || brand.productDefaults.brand;

  const price = resolvePrice(product);
  // `Number(null)` is 0 and `Number("")` is 0, and both would publish "out of
  // stock" for a product nobody has counted. Only an actual number counts.
  const stock =
    product.stock === null || product.stock === undefined || product.stock === ""
      ? NaN
      : Number(product.stock);
  const availability = Number.isFinite(stock)
    ? stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock"
    : "";

  const ratingValue = Number(rating ?? product.rating);
  const reviewCount = Number(ratingCount ?? product.totalReviews);
  // Both halves have to be real: a count with no average is a rating nobody
  // can print, and an average with no count is one nobody can check.
  const hasRating =
    Number.isFinite(reviewCount) &&
    reviewCount > 0 &&
    Number.isFinite(ratingValue) &&
    ratingValue > 0;

  return compact({
    "@context": "https://schema.org",
    "@type": "Product",
    name: crumbText(product.name),
    image,
    description,
    sku: crumbText(product.sku),
    brand: { "@type": "Brand", name: brandName },
    category: crumbText(category),
    offers: isPriceKnown(product)
      ? compact({
          "@type": "Offer",
          priceCurrency: crumbText(product.currency) || brand.currency,
          price: price.price,
          availability,
          url: pageUrl,
          itemCondition: "https://schema.org/NewCondition",
        })
      : null,
    aggregateRating: hasRating
      ? {
          "@type": "AggregateRating",
          // One decimal is what the page prints; a graph carrying 4.666666667
          // says the shop measured something it did not.
          ratingValue: Number(ratingValue.toFixed(1)),
          reviewCount,
        }
      : null,
  });
};
