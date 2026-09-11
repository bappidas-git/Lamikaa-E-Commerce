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
// This module exists because THREE surfaces now ask it: the header's mega panel
// (Prompt 09), the mobile drawer's Shop accordion (Prompt 10) and the home
// page's "Shop by category" rail all draw a category with a picture on it.
// Written three times they would have drifted the first time a product gained a
// second category; written here they cannot.
//
// The "first" product is the lowest `heroOrder` when the list came from
// `products.getHeroProducts()` (which returns them in that order) and simply
// the first row otherwise — the caller decides what "first" means by choosing
// what it passes in. Pure functions, no React, no API.
//
// WHOSE PICTURE IS IT? A category OWNS its picture — `image` is the "Card image
// URL" field in Categories > Edit, and the admin has always described it as the
// tile those three surfaces show. They did not read it: each borrowed the cover
// of the first product in the category instead, so changing a category's image
// in the admin moved the category page's banner and nothing else, and the
// Rituals category — which holds no products at all — had no tile anywhere.
// `categoryThumbSrc()` below is the one rule that fixes that everywhere at
// once, and the product cover stays as the LAST resort, so a category with no
// picture of its own still gets a tile rather than an empty plate.
// =============================================================================
import { plateSrc, stageSrc } from "./product";

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

/** A string field that actually carries something, trimmed. */
const trimmed = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * The picture a category carries itself, as the admin typed it — or "".
 *
 * `image` is the card/tile field and wins. `heroImage` is the category page's
 * wide banner and stands in when only it was filled: an admin who uploaded one
 * picture for a category meant it to be that category's picture, and a banner
 * letterboxed into a 40px plate is a far better answer than the cover of
 * whichever product happens to sort first. Nothing is invented here — a
 * category with neither field set returns "" and the caller falls back.
 */
export const categoryImage = (category) =>
  trimmed(category?.image) || trimmed(category?.heroImage);

/**
 * The delivery URL for a category's tile, at the size the surface asks for.
 *
 * THE ORDER IS THE WHOLE POINT: the admin's own image, then its banner, then
 * the first product in the category, then nothing. Every category surface calls
 * this — the mega panel, the mobile drawer and the home rail — so a picture
 * changed in Categories > Edit changes all three, on every device, and the
 * fallback can never quietly shadow an image the admin actually set.
 *
 * @param {object}  category           the category record
 * @param {object}  [fallbackProduct]  the product whose cover stands in when
 *                                     the category has no picture of its own;
 *                                     the caller chooses it (the home rail
 *                                     hands the Rituals tile the first step of
 *                                     the first ritual, which is not a member
 *                                     of the category at all)
 * @param {object}  [opts]             `{ w, ar }`, passed to `plateSrc()`
 * @returns {string} a delivery URL, or "" when there is nothing to show
 */
export const categoryThumbSrc = (category, fallbackProduct = null, opts) => {
  const own = categoryImage(category);
  if (own) return plateSrc(own, opts);
  return fallbackProduct ? stageSrc(fallbackProduct, opts) : "";
};
