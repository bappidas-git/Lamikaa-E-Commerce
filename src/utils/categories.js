// =============================================================================
// Category helpers — single source of truth for the storefront category system
// =============================================================================
//
// Every storefront entry point that links into the catalogue (the header top
// menu, the mega panel, the mobile sidebar, the homepage "Shop by Category"
// cards and the product breadcrumb) builds its link through `categoryPath()`
// here. That keeps ONE canonical URL scheme across the whole app so a category
// expressed in one place can always be understood in another.
//
// CANONICAL URL SCHEME = A PATH OF SLUGS  (Prompt 08)
// ---------------------------------------------------
//   /category/<slug>     a product category      categoryPath(cat)
//   /rituals             the rituals index       categoryPath(ritualsCat)
//   /rituals/<slug>      one ritual              ritualPath(ritual)
//   /shop?concern=<slug> the shop, one concern   concernPath(slug)
//
// Slugs make for readable, shareable URLs and never change when ids are
// reseeded. The numeric id is only ever used as a defensive fallback for a
// category that is somehow missing a slug. The pre-rebuild
// `/products?category=<slug>` form is redirected to `/category/<slug>` by
// components/routing/LegacyRedirects.js.
//
// WHAT PROMPT 23 TOOK OUT. `getCategoryScopeIds()` and
// `orderCategoriesHierarchically()` existed for the old listing's category
// facet — the parent-includes-children checkbox tree in its filter sidebar. The
// shop has no filters (brief §7.3), the category constraint is a ROUTE that
// `api.getByCategorySlug()` resolves, and neither helper had another consumer,
// so both are gone. `getDescendantIds()` stays: the admin still needs it.
// =============================================================================
import { ROUTES } from "./constants";

/**
 * Build the canonical `?category=` token for a category. Returns the slug
 * (preferred) and falls back to the numeric id only when no slug exists.
 */
export const categoryParam = (cat) => {
  if (!cat) return "";
  return String(cat.slug || cat.id || "");
};

/**
 * The canonical storefront URL for a category (Prompt 08).
 *
 * A category carries a `kind`: "products" categories are listings under
 * /category/<slug>; the single "rituals" category IS the rituals index, which
 * has a route of its own. Returns /shop for a category with no usable token, so
 * a link is never dead.
 */
export const categoryPath = (cat) => {
  if (!cat) return ROUTES.SHOP;
  if (cat.kind === "rituals") return ROUTES.RITUALS;
  const token = categoryParam(cat);
  return token ? `/category/${token}` : ROUTES.SHOP;
};

/** The canonical URL for one ritual — accepts a ritual object or a slug. */
export const ritualPath = (ritual) => {
  const token =
    typeof ritual === "string" ? ritual : String(ritual?.slug || ritual?.id || "");
  return token ? `${ROUTES.RITUALS}/${token}` : ROUTES.RITUALS;
};

/**
 * The shop, narrowed to one concern. Concerns are a facet of the shop rather
 * than a place of their own, so they stay a query param on /shop — the
 * chaptered listing reads it in Prompt 23.
 */
export const concernPath = (concern) => {
  const token =
    typeof concern === "string" ? concern : String(concern?.slug || concern?.id || "");
  return token ? `${ROUTES.SHOP}?concern=${encodeURIComponent(token)}` : ROUTES.SHOP;
};

/**
 * Resolve a `?category=` token — a slug OR a legacy numeric id — to its category
 * object from a loaded list. Returns null when nothing matches.
 */
export const resolveCategory = (token, categories = []) => {
  if (token == null || token === "") return null;
  return (
    categories.find(
      (c) => c.slug === token || String(c.id) === String(token)
    ) || null
  );
};

/**
 * Collect the ids of every descendant of a category (children, grandchildren…)
 * by walking the `parentId` links.
 *
 * KEPT FOR THE ADMIN (Prompt 23). Its storefront consumers were the listing's
 * category facet — `getCategoryScopeIds` and `orderCategoriesHierarchically`,
 * both deleted with the filter sidebar the shop no longer has. `AdminCategories`
 * still walks the tree to stop a category being reparented under its own child.
 */
export const getDescendantIds = (rootId, categories = []) => {
  const ids = new Set();
  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop();
    categories.forEach((c) => {
      if (String(c.parentId) === String(current) && !ids.has(c.id)) {
        ids.add(c.id);
        stack.push(c.id);
      }
    });
  }
  return ids;
};

/**
 * The admin-curated main-menu category list: active categories flagged
 * `showInMainMenu`, ordered by `menuOrder` (then sortOrder, then name). This is
 * the single rule the storefront top menu renders from — no hardcoded list.
 */
export const getMainMenuCategories = (categories = []) =>
  categories
    .filter((c) => c.showInMainMenu === true && c.isActive !== false)
    .sort(
      (a, b) =>
        (a.menuOrder ?? 0) - (b.menuOrder ?? 0) ||
        (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
        String(a.name).localeCompare(String(b.name))
    );
