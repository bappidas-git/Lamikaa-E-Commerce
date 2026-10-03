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
//   /rituals#<slug>      one ritual collection   categoryPath(ritualSubCat)
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
  if (cat.kind === "rituals") {
    // The Rituals root IS the index. A ritual SUB-category is a collection on
    // that same page, so its link lands on the index and scrolls to the
    // collection's section (Rituals.js renders it with `id={slug}`).
    const token = categoryParam(cat);
    return isRitualSubcategory(cat) && token
      ? `${ROUTES.RITUALS}#${encodeURIComponent(token)}`
      : ROUTES.RITUALS;
  }
  const token = categoryParam(cat);
  return token ? `/category/${token}` : ROUTES.SHOP;
};

/** True for a parent id that actually names a parent. */
const hasParent = (cat) =>
  cat != null && cat.parentId != null && cat.parentId !== "" && cat.parentId !== 0;

/**
 * A ritual SUB-category: a `kind: "rituals"` category that sits under another
 * category. It is a collection of rituals — it belongs under the header's
 * Rituals tab and on the /rituals page, never in the Shop menu.
 */
export const isRitualSubcategory = (cat) => cat?.kind === "rituals" && hasParent(cat);

/** The Rituals root: a `kind: "rituals"` category with no parent. */
export const isRitualsRoot = (cat) => cat?.kind === "rituals" && !hasParent(cat);

/** The order the admin set for the main menu, then the catalogue order. */
const byMenuOrder = (a, b) =>
  (a.menuOrder ?? 0) - (b.menuOrder ?? 0) ||
  (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
  String(a.name).localeCompare(String(b.name));

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
 * `showInMainMenu`, ordered by `menuOrder` (then sortOrder, then name).
 */
export const getMainMenuCategories = (categories = []) =>
  categories
    .filter((c) => c.showInMainMenu === true && c.isActive !== false)
    .sort(byMenuOrder);

/**
 * The Shop menu as a TWO-LEVEL TREE: `[{ cat, children: [cat, …] }]`.
 *
 * Every surface that lists the catalogue as a menu (the desktop mega panel,
 * the mobile drawer, the footer) reads this, so a sub-category always shows
 * UNDER its parent and never as a parent of its own.
 *
 *   - Ritual SUB-categories are left out — they live under the Rituals tab
 *     (`getRitualMenuCategories`). The Rituals root stays, as the way in.
 *   - A child is filed under its TOP-LEVEL ancestor, so a grandchild still
 *     reads as one indented row rather than a third level a menu cannot hold.
 *   - A product category whose parent is missing, inactive or a rituals
 *     category has no usable parent, and is shown at the top level.
 *   - `menuOnly` (default) honours the admin's "Show in main menu" switch. A
 *     parent that is hidden hides its whole branch.
 */
export const getShopMenuTree = (categories = [], { menuOnly = true } = {}) => {
  const live = (Array.isArray(categories) ? categories : []).filter(
    (c) => c && c.isActive !== false && !isRitualSubcategory(c)
  );
  const byId = new Map(live.map((c) => [String(c.id), c]));

  const topOf = (cat) => {
    let current = cat;
    const seen = new Set([String(cat.id)]);
    while (hasParent(current)) {
      const parent = byId.get(String(current.parentId));
      if (!parent || parent.kind === "rituals" || seen.has(String(parent.id))) break;
      seen.add(String(parent.id));
      current = parent;
    }
    return current;
  };

  const shown = menuOnly ? live.filter((c) => c.showInMainMenu === true) : live;
  const tops = shown.filter((c) => topOf(c) === c).sort(byMenuOrder);
  return tops.map((top) => ({
    cat: top,
    children: shown
      .filter((c) => c !== top && topOf(c) === top)
      .sort(byMenuOrder),
  }));
};

/**
 * The entries under the header's Rituals tab: active ritual sub-categories the
 * admin put in the main menu that have at least one live ritual filed under
 * them (`ritual.categoryId`). An empty collection would scroll to nothing, so
 * it is not offered.
 */
export const getRitualMenuCategories = (
  categories = [],
  rituals = [],
  { menuOnly = true } = {}
) => {
  const filed = new Set(
    (Array.isArray(rituals) ? rituals : [])
      .filter((r) => r && r.isActive !== false && r.categoryId != null)
      .map((r) => String(r.categoryId))
  );
  return (Array.isArray(categories) ? categories : [])
    .filter(
      (c) =>
        c &&
        c.isActive !== false &&
        isRitualSubcategory(c) &&
        (!menuOnly || c.showInMainMenu === true) &&
        filed.has(String(c.id))
    )
    .sort(byMenuOrder);
};

/**
 * The /rituals page, split into its sections:
 *   `main`   — rituals filed under the Rituals root (or under nothing, or under
 *              a collection that is gone/inactive). They open the page.
 *   `groups` — one `{ category, rituals }` per ritual sub-category that has
 *              rituals, in menu order. Each is the target of `/rituals#<slug>`.
 */
export const groupRitualsByCategory = (rituals = [], categories = []) => {
  const list = Array.isArray(rituals) ? rituals : [];
  const subs = (Array.isArray(categories) ? categories : [])
    .filter((c) => c && c.isActive !== false && isRitualSubcategory(c))
    .sort(byMenuOrder);
  const subIds = new Set(subs.map((c) => String(c.id)));
  return {
    main: list.filter((r) => r.categoryId == null || !subIds.has(String(r.categoryId))),
    groups: subs
      .map((category) => ({
        category,
        rituals: list.filter((r) => String(r.categoryId) === String(category.id)),
      }))
      .filter((group) => group.rituals.length > 0),
  };
};

/**
 * The ids a category page lists products for: the category itself and every
 * category below it, so a parent shows its sub-categories' products too.
 */
export const categoryScopeIds = (cat, categories = []) => {
  if (!cat) return [];
  return [cat.id, ...getDescendantIds(cat.id, categories)];
};
