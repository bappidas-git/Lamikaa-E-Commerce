// =============================================================================
// SEARCH  —  the one ranking function behind the overlay and /search
// =============================================================================
//
// The transport does not rank. `apiService.products.search()` is json-server's
// `?q=` in mock mode (which matches ANY field of a record — an INCI list scores
// as highly as a product name) and a `?search=` the Laravel side has yet to
// build. So the storefront reads the whole catalogue once and ranks it HERE,
// which means the overlay and the results page can never disagree about what
// "serum" returns, and neither can drift from the other when the backend lands.
//
// EIGHT PRODUCTS. That is the number this file is sized for, and it is why a
// linear pass over every field of every product is the right shape: no index to
// build, no index to invalidate, no dependency. If the range grows past a few
// hundred the answer is a server endpoint (REPO_MAP §3.4), not a trie here.
//
// WHAT A SHOPPER TYPES, and where the answer lives:
//
//   "serum"        the product name and its short form
//   "black rice"   the hero ingredient — the name, the tags, keyIngredients[]
//   "hydration"    a concern slug, and the promise line
//   "goat"         part of a name, and a tag
//   "face care"    a category's display name
//
// Each of those is a FIELD with a weight, and a product's score is the sum of
// what its fields can answer. The weights are the editorial judgement in this
// file: a name is worth five descriptions, because someone typing a name knows
// what they want and someone matching a description probably does not.
//
// TIES GO TO A PRODUCT THAT CAN BE BOUGHT. Five of the eight ship `priceTBA`
// ("Price on launch", Add to Cart disabled). On an equal score a priced product
// sorts first — a result list that opens on three products nobody can order is
// a worse answer to the same query.
//
// PURE. No React, no fetching, no module state; called inside render and inside
// tests (`search.test.js`).
// =============================================================================

import { isPriceKnown } from "./product";

/**
 * Fold a string to its comparable form: no case, no diacritics, no
 * punctuation.
 *
 * Decomposing to NFD and dropping the combining marks is what makes "Aloe"
 * and "Áloe" the same word, and it costs one regex rather than a lookup table.
 * Everything that is not a letter or a digit becomes a space, so "kaji-nemu",
 * "kaji nemu" and "Kaji Nemu." all tokenize identically.
 *
 * @param {*} str
 * @returns {string} lower case, space-separated, trimmed
 */
export const normalize = (str) =>
  String(str ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/**
 * A normalized string as its words.
 *
 * @param {*} str
 * @returns {string[]} no empties, in the order typed
 */
export const tokenize = (str) => {
  const normalized = normalize(str);
  return normalized ? normalized.split(" ") : [];
};

// ---- Matching --------------------------------------------------------------

/**
 * Does one word answer one query token?
 *
 * A word answers a token when it IS the token or STARTS with it — "serums"
 * answers "serum", and typing "moist" finds the moisturizer before the word is
 * finished, which is the whole point of an instant overlay.
 *
 * The plural fallback runs the other way for a token that ends in "s": someone
 * who types "serums" or "masks" means the singular the catalogue stores. Held
 * to tokens of four characters or more so it cannot turn "gel" into "ge".
 */
const wordAnswers = (word, token) => {
  if (word === token || word.startsWith(token)) return true;
  if (token.length >= 4 && token.endsWith("s")) {
    const singular = token.slice(0, -1);
    return word === singular || word.startsWith(singular);
  }
  return false;
};

// ---- The fields ------------------------------------------------------------
//
// `weight` is what one matched token in this field is worth. `prefix` is the
// higher weight the field takes when its value OPENS with the whole query —
// the autocomplete boost, and the reason typing "face" ranks "Face Mask" above
// a product that only mentions the face in its description.
//
// Order is documentation, not behaviour: the sum is commutative, but reading
// the list top to bottom should read as "what this storefront thinks a query
// is about".

const PHRASE_BONUS = 6;

const ingredientNames = (product) =>
  (Array.isArray(product.keyIngredients) ? product.keyIngredients : []).map(
    (row) => (row && typeof row === "object" ? row.name : row)
  );

const FIELDS = [
  { key: "name", weight: 10, prefix: 14, values: (p) => [p.name] },
  { key: "shortName", weight: 10, values: (p) => [p.shortName] },
  { key: "tags", weight: 6, values: (p) => p.tags },
  { key: "concerns", weight: 6, values: (p, names) => names.concerns },
  { key: "keyIngredients", weight: 5, values: ingredientNames },
  { key: "benefits", weight: 4, values: (p) => p.benefits },
  { key: "categories", weight: 4, values: (p, names) => names.categories },
  { key: "promise", weight: 3, values: (p) => [p.promise] },
  {
    key: "description",
    weight: 2,
    values: (p) => [p.shortDescription, p.description],
  },
];

/** The normalized, non-empty values a field offers for one product. */
const valuesOf = (field, product, names) => {
  const raw = field.values(product, names);
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(normalize).filter(Boolean);
};

/**
 * The display names of the categories a product belongs to.
 *
 * Membership is `categoryIds[]` with `categoryId` as the fallback — the same
 * rule `utils/catalogue.js` applies everywhere else — and the name is the
 * merchant-facing `displayName` when there is one ("Moisturizers & Mists"),
 * because that is the wording a shopper has seen in the menu and will type.
 */
const categoryNamesFor = (product, categories) => {
  if (!categories.length) return [];
  const ids = (
    Array.isArray(product.categoryIds) && product.categoryIds.length
      ? product.categoryIds
      : [product.categoryId]
  ).map(String);
  return categories
    .filter((category) => category && ids.includes(String(category.id)))
    .map((category) => category.displayName || category.name)
    .filter(Boolean);
};

/**
 * A product's concerns, as slugs AND as the names the shopper has read.
 *
 * `product.concerns[]` holds slugs ("even-tone"), which normalize to the same
 * words as most display names for free. The lookup earns its place on the ones
 * that do not: a concern the owner renames in the admin ("Comfort" becoming
 * "Barrier comfort") stays findable by the new wording without reseeding a
 * single product. Both forms are kept — the slug is still what the data says.
 */
const concernNamesFor = (product, concerns) => {
  const slugs = Array.isArray(product.concerns) ? product.concerns : [];
  if (!slugs.length || !concerns.length) return slugs;
  const names = concerns
    .filter((concern) => concern && slugs.some((slug) => String(slug) === String(concern.slug)))
    .map((concern) => concern.displayName || concern.name)
    .filter(Boolean);
  return [...slugs, ...names];
};

/**
 * Score one product against one already-tokenized query.
 *
 * @returns {{score: number, matchedOn: string[]}}
 */
const scoreProduct = (product, tokens, phrase, names) => {
  let score = 0;
  const matchedOn = [];

  FIELDS.forEach((field) => {
    const values = valuesOf(field, product, names);
    if (!values.length) return;

    // One bag of words per field: a two-word query whose halves live in two
    // different tags ("black" in one, "rice" in another) still counts as two
    // matched tokens, which is what a shopper means by typing both.
    const words = values.join(" ").split(" ");
    const hits = tokens.filter((token) =>
      words.some((word) => wordAnswers(word, token))
    ).length;
    if (!hits) return;

    // The prefix boost is a property of the VALUE, not of the bag: "Black Rice
    // Face Serum" opens with "black rice", so the whole field is promoted.
    const opensWithQuery =
      field.prefix != null && values.some((value) => value.startsWith(phrase));

    let fieldScore = hits * (opensWithQuery ? field.prefix : field.weight);

    // A multi-word query found verbatim beats the same words found apart.
    if (tokens.length > 1 && values.some((value) => value.includes(phrase))) {
      fieldScore += PHRASE_BONUS;
    }

    score += fieldScore;
    matchedOn.push(field.key);
  });

  return { score, matchedOn };
};

/**
 * Rank a catalogue against a query.
 *
 * @param {object[]} products    normalized products (`normalizeProduct`)
 * @param {string}   query       raw, as typed
 * @param {object}  [options]
 * @param {object[]} [options.categories]  the category records, so a product
 *        can be found by the name of a category it lives in
 * @param {object[]} [options.concerns]    the concern records, so a renamed
 *        concern stays findable by its new display name as well as its slug
 * @returns {Array<{product: object, score: number, matchedOn: string[]}>}
 *          best first; `[]` for an empty query or an empty catalogue
 */
export const rankProducts = (
  products,
  query,
  { categories = [], concerns = [] } = {}
) => {
  const tokens = tokenize(query);
  const list = Array.isArray(products) ? products : [];
  if (!tokens.length || !list.length) return [];

  const phrase = tokens.join(" ");
  const categoryList = Array.isArray(categories) ? categories : [];
  const concernList = Array.isArray(concerns) ? concerns : [];

  return list
    .filter(Boolean)
    .map((product) => ({
      product,
      ...scoreProduct(product, tokens, phrase, {
        categories: categoryNamesFor(product, categoryList),
        concerns: concernNamesFor(product, concernList),
      }),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      // A tie is broken by what the shopper can actually do with the result.
      const buyable = Number(isPriceKnown(b.product)) - Number(isPriceKnown(a.product));
      if (buyable !== 0) return buyable;
      // And then alphabetically, so the same query always returns the same
      // order — a list that reshuffles between keystrokes is unusable.
      return String(a.product.name || "").localeCompare(String(b.product.name || ""));
    });
};

const search = { normalize, tokenize, rankProducts };

export default search;
