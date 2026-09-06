import React from "react";
import { Navigate, Route, useParams, useSearchParams } from "react-router-dom";
import { ROUTES } from "../../utils/constants";

// =============================================================================
// LegacyRedirects — every Meghali-era URL, pointed at its LAMIKAA home
// =============================================================================
//
// The rebuild moves the whole information architecture (Prompt 08): /products
// becomes /shop, a category stops being a query param and becomes a path, the
// four policy pages move under /policies/*, and the Meghali collection URLs
// (/sarees, /collections/*) stop existing. Links to the old URLs live in the
// wild — bookmarks, order emails, whatever a search engine has already indexed
// — so none of them may 404, and none may land on the homepage either: a
// redirect that loses the visitor's intent is a 404 with better manners.
//
// This module is the ONLY place an old path is written down. That is what makes
// the sweep verifiable: `grep -rn '"/(products|help|support|privacy|terms|
// cookies|refund)("|\?)' src` finds this file and nothing else (bar the REST
// endpoint paths in services/api.js, which are the API's URLs, not the site's).
//
// WHY AN ARRAY AND NOT A COMPONENT. React Router 6 reads the children of
// <Routes> with createRoutesFromChildren, which accepts <Route> elements and
// fragments of them and throws on anything else — a <LegacyRedirects /> wrapper
// would be "not a <Route> component". An array of <Route> elements is flattened
// by React.Children, so App.js spreads `{legacyRoutes}` into its table.
//
// Every redirect is `replace`: the old URL must not sit in the history stack,
// or Back from the new page bounces straight through it again.
// =============================================================================

/**
 * The one-to-one path moves. Data rather than JSX so a later prompt (38's SEO
 * audit, 39's parity check) can assert over the table instead of the markup.
 */
export const LEGACY_PATH_REDIRECTS = [
  // Content pages
  { from: "/help", to: ROUTES.FAQ },
  { from: "/support", to: ROUTES.CONTACT },
  { from: "/privacy", to: ROUTES.POLICY_PRIVACY },
  { from: "/terms", to: ROUTES.POLICY_TERMS },
  { from: "/refund", to: ROUTES.POLICY_SHIPPING_RETURNS },
  { from: "/cookies", to: ROUTES.POLICY_COOKIES },
  // Meghali's Silk collection URLs. The catalogue they described does not
  // exist any more, so the honest destination is the shop, not a category.
  { from: "/sarees", to: ROUTES.SHOP },
  { from: "/collections", to: ROUTES.SHOP },
  { from: "/collections/*", to: ROUTES.SHOP },
];

/**
 * Legacy `?category=` slugs from the Meghali catalogue. They resolve to nothing
 * in the LAMIKAA seed, so they go to the shop rather than to /category/<slug>,
 * which would render an empty listing for a category that no longer exists.
 */
export const RETIRED_CATEGORY_SLUGS = ["muga-silk", "pat-silk", "eri-silk"];

/**
 * Where a legacy `/products?…` URL should land.
 *
 * The old listing carried its whole state in the query string; the new IA
 * splits that state across three destinations, so the query is what decides:
 *
 *   ?search=<q>          → /search?q=<q>        (the search results page)
 *   ?category=<slug>     → /category/<slug>     (a category page)
 *   ?category=<retired>  → /shop                (Meghali's collections)
 *   ?highlight= ?sort=   → dropped              (the new shop has no sort or
 *                                                merchandising facets — §7.3)
 *   anything else        → /shop
 *
 * `?search=` wins over `?category=`: someone who typed a query was looking for
 * the query, and the search page can show the category among its results.
 */
export const useLegacyQueryRedirect = () => {
  const [searchParams] = useSearchParams();

  const search = (searchParams.get("search") || "").trim();
  if (search) return `${ROUTES.SEARCH}?q=${encodeURIComponent(search)}`;

  // The old param accepted a comma-separated list; only a single category can
  // become a path, so a multi-select deep link falls back to the shop.
  const category = (searchParams.get("category") || "").trim();
  if (category && !category.includes(",") && !RETIRED_CATEGORY_SLUGS.includes(category)) {
    return `/category/${encodeURIComponent(category)}`;
  }

  return ROUTES.SHOP;
};

/** `/products` and its query string. */
const LegacyProductsRedirect = () => (
  <Navigate to={useLegacyQueryRedirect()} replace />
);

/** `/products/:slug` (and the legacy numeric `/products/:id`) → `/product/:slug`. */
const LegacyProductRedirect = () => {
  const { slug } = useParams();
  // The PDP itself still resolves a numeric id and then rewrites the URL to the
  // canonical slug, so a numeric legacy link survives both hops.
  return <Navigate to={slug ? `/product/${slug}` : ROUTES.SHOP} replace />;
};

/**
 * The legacy table as <Route> elements, for App.js to spread into <Routes>.
 */
const legacyRoutes = [
  <Route key="legacy-products" path="/products" element={<LegacyProductsRedirect />} />,
  <Route key="legacy-product" path="/products/:slug" element={<LegacyProductRedirect />} />,
  ...LEGACY_PATH_REDIRECTS.map(({ from, to }) => (
    <Route key={`legacy-${from}`} path={from} element={<Navigate to={to} replace />} />
  )),
];

export default legacyRoutes;
