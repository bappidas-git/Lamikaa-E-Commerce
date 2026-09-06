// =============================================================================
// Catalogue helpers — how a product is matched to a category
// =============================================================================
//
// A LAMIKAA product lives in SEVERAL categories: the Black Rice Face Wash is
// both "Face Care" and "Cleansers". `categoryIds[]` is the full membership list
// and `categoryId` stays the primary home every older consumer (cart lines,
// wishlist snapshots, the admin table) still reads — so membership is "listed
// in categoryIds, OR the primary category", exactly the rule
// `api.getByCategorySlug()` applies on the server side of the same question.
//
// This module exists because TWO surfaces now ask it: the header's mega panel
// (Prompt 09) and the mobile drawer's Shop accordion (Prompt 10) both draw a
// category row with a thumbnail of a real product from that category. Written
// twice they would have drifted the first time a product gained a second
// category; written here they cannot.
//
// The "first" product is the lowest `heroOrder` when the list came from
// `products.getHeroProducts()` (which returns them in that order) and simply
// the first row otherwise — the caller decides what "first" means by choosing
// what it passes in. Pure functions, no React, no API.
// =============================================================================

/** Does this product belong to this category (by id or by category record)? */
export const inCategory = (product, category) => {
  const target = String(
    category && typeof category === "object" ? category.id : category
  );
  if (!product || target === "undefined" || target === "null" || target === "") {
    return false;
  }
  const ids = Array.isArray(product.categoryIds) ? product.categoryIds : [];
  return ids.some((id) => String(id) === target) || String(product.categoryId) === target;
};

/** Every product in a category, in the order the caller supplied them. */
export const productsForCategory = (products, category) =>
  (Array.isArray(products) ? products : []).filter((p) => inCategory(p, category));

/**
 * The product that represents a category on a menu row — the first member of
 * the list handed in, or `null` when the category has none yet (a new category,
 * or a catalogue that has not loaded). Callers render the thumbnail plate empty
 * rather than falling back to a stand-in image.
 */
export const firstProductForCategory = (products, category) =>
  productsForCategory(products, category)[0] || null;
