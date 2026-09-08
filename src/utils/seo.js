import { seoOrigin } from "../hooks/useSeo";
import { productPath } from "./helpers";

// =============================================================================
// PAGE-LEVEL STRUCTURED DATA
// =============================================================================
//
// `hooks/useSeo.js` owns the two SITE-level graphs (`Organization`, `WebSite`)
// because the home page publishes them once for the whole storefront. This file
// owns the graphs that belong to a PAGE — the ones whose content changes with
// the route. Prompt 23 opens it with `ItemList`, which is what a listing is;
// Prompt 24 adds `BreadcrumbList` and Prompt 27 the `Product` graph.
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
