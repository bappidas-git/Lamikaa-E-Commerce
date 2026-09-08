import { seoOrigin } from "../hooks/useSeo";
import { productPath } from "./helpers";

// =============================================================================
// PAGE-LEVEL STRUCTURED DATA
// =============================================================================
//
// `hooks/useSeo.js` owns the two SITE-level graphs (`Organization`, `WebSite`)
// because the home page publishes them once for the whole storefront. This file
// owns the graphs that belong to a PAGE — the ones whose content changes with
// the route. Prompt 23 opened it with `ItemList`, which is what a listing is;
// Prompt 24 adds `BreadcrumbList` — the category pages and the ritual pages both
// sit at the end of a trail — and Prompt 27 adds the `Product` graph.
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
 * @param {Array<{label: string, to?: string}>} items  the trail, Home first
 * @returns {object|null} schema.org BreadcrumbList, or null for a trail with
 *          nothing on it — `useSeo` publishes no <script> for a null graph.
 */
export const breadcrumbJsonLd = (items) => {
  const origin = seoOrigin();
  const trail = (Array.isArray(items) ? items : []).filter(
    (item) => item && typeof item.label === "string" && item.label.trim() !== ""
  );
  if (trail.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.to ? { item: `${origin}${item.to}` } : {}),
    })),
  };
};
