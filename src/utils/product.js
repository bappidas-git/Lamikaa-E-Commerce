import brand from "../config/brand";
import { cld, isCloudinary } from "./cloudinary";
import { getProductMinPrice } from "./helpers";

// =============================================================================
// PRODUCT  —  the one normaliser every surface reads a product through
// =============================================================================
//
// A LAMIKAA product carries its gallery in `media[]` — an ordered mixed list of
// images and videos, exactly one image flagged `primary` — while `images[]`
// stays a DERIVED mirror of the image URLs with the primary first. The mirror
// is not legacy debt to be paid off: cart lines, wishlist snapshots, order
// items, the admin table, search results and the live API test all store or
// read `images[0]`, and a snapshot taken last month cannot be re-derived.
//
//   normalizeProduct()  READ side  — media[] built from whatever the record has
//   syncProductMedia()  WRITE side — images[]/image rebuilt from the admin's media[]
//
// The two are twins: whatever normalizeProduct() would derive for a record,
// syncProductMedia() has already written into it. That is what lets the same
// components render a current db.json product (images-only, no media[]) and a
// seeded one (media[] with crops, posters and placeholder flags) without ever
// asking which shape they were handed.
//
// EVERYTHING HERE IS PURE. No React, no fetching, no module state — these are
// called inside render, inside reducers and inside tests, and none of those can
// afford a surprise.
//
// NOTE ON THE helpers.js CYCLE. This module imports getProductMinPrice() from
// helpers.js, and helpers.js imports isPriceKnown() from here. The cycle is
// deliberate and safe: both references are read at CALL time, inside function
// bodies, never while either module is still evaluating. Pricing arithmetic
// (variants, compare-at, discount) has exactly one home — helpers.js — and the
// "is there a price at all?" predicate has exactly one home: this file.
// =============================================================================

// ---- Small coercions -------------------------------------------------------

/** A number the storefront can actually print: not null, not "", not NaN. */
const finite = (value) =>
  value != null && value !== "" && Number.isFinite(Number(value));

/**
 * Anything -> array. An array is copied, null/undefined/"" become the fallback,
 * and a lone scalar is wrapped — an admin field that should hold a list but
 * holds one string renders as a list of one rather than as nothing.
 */
const toArray = (value, fallback = []) => {
  if (Array.isArray(value)) return [...value];
  if (value == null || value === "") return [...fallback];
  return [value];
};

const trimmedUrl = (value) => (typeof value === "string" ? value.trim() : "");

// ---- Media -----------------------------------------------------------------

/**
 * One media row, cleaned. Returns null for a row with no usable URL — that is
 * what "drops rows with empty url" means, and it is applied on both sides so an
 * admin who clears a field cannot leave a hole in the gallery.
 */
const normalizeRow = (row, name) => {
  if (!row) return null;
  // A bare URL string is accepted so a hand-edited record still loads.
  const source = typeof row === "string" ? { url: row } : row;
  if (typeof source !== "object") return null;

  const url = trimmedUrl(source.url);
  if (!url) return null;

  const type = source.type === "video" ? "video" : "image";
  const out = { ...source, type, url };
  // A video can never be the primary IMAGE, however the record is flagged.
  if (type === "video" || out.primary !== true) delete out.primary;
  if (type === "image" && !out.alt) out.alt = name;
  return out;
};

/**
 * The gallery for a product in ANY shape.
 *
 * `media[]` wins when present. Otherwise it is built from `images[]` plus the
 * single `image` field the old records use, in that order, deduplicated — a
 * boilerplate product whose `image` repeats `images[0]` must not gain a
 * duplicate first frame.
 *
 * Exactly one image row comes back flagged `primary`: the first one the record
 * flagged, or the first image there is. Videos never carry the flag, and the
 * authored ORDER of media[] is preserved (the PDP gallery is authored, not
 * sorted) — only `images[]` is re-ordered, primary first.
 */
const buildMedia = (raw) => {
  const name = raw?.name || "";
  const authored = Array.isArray(raw?.media) && raw.media.length ? raw.media : null;

  let rows;
  if (authored) {
    rows = authored.map((row) => normalizeRow(row, name)).filter(Boolean);
  } else {
    const urls = [...toArray(raw?.images), raw?.image]
      .map(trimmedUrl)
      .filter(Boolean);
    rows = Array.from(new Set(urls)).map((url) => ({
      type: "image",
      url,
      alt: name,
    }));
  }

  // Exactly one primary, decided AFTER the empty rows are gone: the first row
  // still flagged, otherwise the first image. Two flagged rows, a flagged row
  // that was blank, a flagged video — all collapse to the same one answer.
  const flagged = rows.findIndex((row) => row.primary === true);
  const firstImage = rows.findIndex((row) => row.type === "image");
  const primaryIndex = flagged >= 0 ? flagged : firstImage;

  return rows.map((row, index) => {
    if (index === primaryIndex) return { ...row, primary: true };
    if (!("primary" in row)) return row;
    const { primary, ...rest } = row;
    return rest;
  });
};

/** The image URLs of a media list, primary first, in authored order after it. */
const imageUrlsOf = (media) => {
  const images = media.filter((row) => row.type === "image");
  const primary = images.find((row) => row.primary);
  const rest = images.filter((row) => row !== primary).map((row) => row.url);
  return primary ? [primary.url, ...rest] : rest;
};

// ---- READ side -------------------------------------------------------------

/**
 * Normalise a product record for rendering.
 *
 * Tolerates the boilerplate shape (numeric `categoryId`, `images[]`, no
 * `media[]`, no concerns) and the seeded LAMIKAA shape alike, and guarantees
 * every field a storefront component reads is the type that component expects.
 * Returns a COPY; the argument is never mutated.
 *
 * @param {object} raw
 * @returns {object}
 */
export const normalizeProduct = (raw) => {
  if (!raw || typeof raw !== "object") return raw;

  const media = buildMedia(raw);
  const images = imageUrlsOf(media);
  const name = raw.name || "";

  // Category: the numeric `categoryId` stays primary (every existing consumer
  // reads it); `categoryIds[]` is the multi-home list, defaulting to the one.
  const categoryIds = Array.isArray(raw.categoryIds)
    ? raw.categoryIds.filter((id) => id != null && id !== "")
    : raw.categoryId != null && raw.categoryId !== ""
    ? [raw.categoryId]
    : [];

  return {
    ...raw,
    media,
    images,
    // `image` is the other derived mirror: order thumbnails and the admin table
    // read it directly. Empty string, never undefined, so `||` chains resolve.
    image: images[0] || "",
    categoryIds,

    // Editorial lists. Absent means "not written yet", which renders as nothing
    // — never as a crash and never as invented copy.
    concerns: toArray(raw.concerns),
    benefits: toArray(raw.benefits),
    howToUse: toArray(raw.howToUse),
    keyIngredients: toArray(raw.keyIngredients),
    faqs: toArray(raw.faqs),
    packClaims: toArray(raw.packClaims),
    suitableFor: toArray(raw.suitableFor),
    // The three owner-mandated card badges are the default, from brand config
    // (BRAND.md §3.9 rule 4) — never hard-coded in the component that shows them.
    badges: toArray(raw.badges, brand.trustBadges),

    // Five of the eight products ship without a legible MRP. `priceTBA` is the
    // single flag the whole storefront reads: it disables Add to Cart and swaps
    // the price for "Price on launch". A merchant may also SET it by hand on a
    // priced product (a pre-launch listing), so a stored `true` is honoured.
    priceTBA: !isPriceKnown(raw),

    heroOrder: finite(raw.heroOrder) ? Number(raw.heroOrder) : null,
    ritualStep:
      raw.ritualStep && typeof raw.ritualStep === "object" ? raw.ritualStep : null,

    // "Black Rice Face Wash" -> "Face Wash". Every product in the range opens
    // with the same two words; repeating them down a card grid or a breadcrumb
    // is noise, so the short form is derived once here.
    shortName: raw.shortName || name.replace(/^Black Rice\s+/i, ""),
  };
};

// ---- WRITE side ------------------------------------------------------------

/**
 * The admin's media manager hands back a `media[]` it has reordered, re-flagged
 * and possibly left blank rows in. This rebuilds the derived mirrors from it so
 * the record that reaches the API is already consistent — in BOTH api modes,
 * because the sync happens before the request, not inside one branch of it.
 *
 * @param {object} product  the form's product, with its edited `media[]`
 * @returns {object} a copy with `media`, `images` and `image` in step
 */
export const syncProductMedia = (product) => {
  if (!product || typeof product !== "object") return product;
  const media = buildMedia(product);
  const images = imageUrlsOf(media);
  return { ...product, media, images, image: images[0] || "" };
};

// ---- Accessors -------------------------------------------------------------

/** The normalised media list for a product in any shape. */
export const productMedia = (product) => (product ? buildMedia(product) : []);

/** The primary image ROW (`{ type, url, alt, crop?, … }`), or null. */
export const primaryImage = (product) =>
  productMedia(product).find((row) => row.type === "image" && row.primary) || null;

/** The video rows, in authored order. */
export const productVideos = (product) =>
  productMedia(product).filter((row) => row.type === "video");

/**
 * The delivery URL for a product's hero/stage image.
 *
 * The cover shots are photographs of packaging on a studio ground, so the crop
 * recorded per product in PRODUCTS.md pulls the pack out of the frame first and
 * `c_pad` letterboxes it to the stage ratio on a ground sampled from its own
 * edges — a bottle is never sliced to fill a square. A non-Cloudinary URL (a
 * placeholder host, an admin-typed link) has no crop to apply, so it takes the
 * plain width transform, which `cld()` returns unchanged for such hosts.
 */
export const stageSrc = (product, { w = 900, ar = "1:1" } = {}) => {
  const primary = primaryImage(product);
  if (!primary) return "";
  if (!isCloudinary(primary.url)) return cld(primary.url, { w });
  return cld(primary.url, { crop: primary.crop, ar, pad: true, w });
};

/** Alt text for one media row: the row's own, then the product name. */
export const productAlt = (product, media) =>
  media?.alt || media?.title || product?.name || "";

// ---- Price -----------------------------------------------------------------

/**
 * Is there a real price to show?
 *
 * The ONE predicate behind every "Price on launch" chip and every disabled Add
 * to Cart in the storefront. A variant price counts — a product may price only
 * its sizes — and an explicit `priceTBA: true` overrides a stored number so a
 * merchant can hold a listing back without deleting its price.
 */
export const isPriceKnown = (product) => {
  if (!product) return false;
  if (product.priceTBA === true) return false;
  if (finite(product.price)) return true;
  return (
    Array.isArray(product.variants) &&
    product.variants.some((variant) => finite(variant?.price))
  );
};

/**
 * Everything a price surface needs, in one read.
 *
 * @returns {{known: boolean, price: number|null, comparePrice: number, discount: number}}
 *          `known: false` carries nulls and zeroes — there is no price to round,
 *          discount or compare against, and inventing one is the failure mode
 *          this whole path exists to prevent.
 */
export const resolvePrice = (product) => {
  if (!isPriceKnown(product)) {
    return { known: false, price: null, comparePrice: 0, discount: 0 };
  }
  const { sellingPrice, originalPrice, discount } = getProductMinPrice(product);
  return {
    known: true,
    price: sellingPrice,
    // Only a genuinely higher compare-at is a compare-at. PriceBlock enforces
    // the same rule; agreeing here means no surface can disagree with another.
    comparePrice: originalPrice > sellingPrice ? originalPrice : 0,
    discount,
  };
};

const product = {
  normalizeProduct,
  syncProductMedia,
  productMedia,
  primaryImage,
  productVideos,
  stageSrc,
  productAlt,
  isPriceKnown,
  resolvePrice,
};

export default product;
