import { normalize, tokenize, rankProducts } from "./search";

// =============================================================================
// search — the five queries the overlay is judged on
// =============================================================================
// The fixtures are the eight seeded LAMIKAA products, cut down to the fields
// `rankProducts` actually reads and copied VERBATIM from db.json. Nothing here
// is invented: if a benefit line or a concern slug changes in the seed, this
// suite should be updated to match rather than the other way round.
//
// Each case pins a different route into the catalogue — a name ("serum"), the
// hero ingredient across every field ("black rice"), a concern slug that is not
// in any product name ("hydration"), one word out of the middle of a name
// ("goat"), and a query the catalogue cannot answer at all.
// =============================================================================

const CONCERNS = [
  { id: 3, slug: "hydration", name: "Hydration", displayName: "Hydration" },
  { id: 9, slug: "even-tone", name: "Even tone", displayName: "Even tone" },
  { id: 10, slug: "comfort", name: "Comfort", displayName: "Comfort" },
];

const CATEGORIES = [
  { id: 1, slug: "face-care", name: "Face Care", displayName: "Face Care" },
  { id: 2, slug: "body-care", name: "Body Care", displayName: "Body Care" },
  { id: 3, slug: "cleansers", name: "Cleansers", displayName: "Cleansers" },
  { id: 4, slug: "serums", name: "Serums", displayName: "Serums" },
  { id: 5, slug: "moisturizers", name: "Moisturizers", displayName: "Moisturizers & Mists" },
  { id: 6, slug: "masks", name: "Masks", displayName: "Masks & Scrubs" },
  { id: 7, slug: "rituals", name: "Rituals", displayName: "Rituals" },
];

const PRODUCTS = [
  {
    id: 1, name: "Black Rice Face Wash", shortName: "Face Wash",
    price: 390, priceTBA: false, categoryId: 1, categoryIds: [1, 3],
    tags: ["black rice", "face wash", "cleanser", "face care"],
    concerns: ["cleansing", "brightening"],
    keyIngredients: [{ name: "Black Rice" }, { name: "Aloe Vera" }, { name: "Green Tea" }, { name: "Neem" }, { name: "Turmeric" }],
    benefits: ["Deeply cleanses", "Helps brighten the look of skin", "Hydrates", "Refreshes"],
    promise: "A gentle daily cleanse that leaves skin clean, refreshed and quietly bright.",
  },
  {
    id: 2, name: "Black Rice Goat Milk Soap", shortName: "Goat Milk Soap",
    price: 90, priceTBA: false, categoryId: 2, categoryIds: [2, 3],
    tags: ["black rice", "soap bar", "cleanser", "body care", "goat milk"],
    concerns: ["nourishing", "cleansing"],
    keyIngredients: [{ name: "Goat Milk" }, { name: "Black Rice" }, { name: "Shea Butter" }, { name: "Coconut Oil" }],
    benefits: ["Nourishes", "Cleanses", "Softens skin"],
    promise: "A luxurious cleansing bar that nourishes as it cleans.",
  },
  {
    id: 3, name: "Black Rice Body Wash", shortName: "Body Wash",
    price: null, priceTBA: true, categoryId: 2, categoryIds: [2, 3],
    tags: ["black rice", "body wash", "cleanser", "body care", "sandalwood"],
    concerns: ["hydration", "refresh"],
    keyIngredients: [{ name: "Black Rice" }, { name: "Sandalwood" }, { name: "Shea Butter & Squalane" }, { name: "Niacinamide" }],
    benefits: ["Nourishes", "Cleanses", "Hydrates"],
    promise: "A nourishing wash that turns a quick shower into a slow, fragrant ritual.",
  },
  {
    id: 4, name: "Black Rice Face Mask", shortName: "Face Mask",
    price: null, priceTBA: true, categoryId: 1, categoryIds: [1, 6],
    tags: ["black rice", "face mask", "clay mask", "face care", "kaolin"],
    concerns: ["glow", "revive"],
    keyIngredients: [{ name: "Black Rice" }, { name: "Sandalwood" }, { name: "Kaolin & Bentonite" }, { name: "Aloe Vera" }],
    benefits: ["Helps absorb excess oil", "Refreshes", "Smooths the feel of skin"],
    promise: "Ten quiet minutes for skin that looks refreshed and smooth.",
  },
  {
    id: 5, name: "Black Rice Face Mist", shortName: "Face Mist",
    price: null, priceTBA: true, categoryId: 1, categoryIds: [1, 5],
    tags: ["black rice", "face mist", "hydrating mist", "face care", "aloe vera"],
    concerns: ["hydration", "refresh"],
    keyIngredients: [{ name: "Black Rice" }, { name: "Aloe Vera" }, { name: "Hyaluronic Acid (Sodium Hyaluronate)" }, { name: "Niacinamide" }],
    benefits: ["Refreshes", "Hydrates", "Revitalizes the feel of skin"],
    promise: "An instant refresh you can reach for anywhere.",
  },
  {
    id: 6, name: "Black Rice Exfoliating Face Scrub", shortName: "Exfoliating Face Scrub",
    price: 349, priceTBA: false, categoryId: 1, categoryIds: [1, 6],
    tags: ["black rice", "face scrub", "exfoliator", "face care", "rice powder"],
    concerns: ["exfoliation", "texture"],
    keyIngredients: [{ name: "Black Rice" }, { name: "Rice Powder & Walnut Shell Powder" }, { name: "Jojoba & Almond Oil" }, { name: "Green Tea & Cucumber" }],
    benefits: ["Gently exfoliates", "Helps unclog pores", "Reveals smoother, brighter-looking skin"],
    promise: "A fine polish that reveals smoother, brighter-looking skin.",
  },
  {
    id: 7, name: "Black Rice Face Serum", shortName: "Face Serum",
    price: null, priceTBA: true, categoryId: 1, categoryIds: [1, 4],
    tags: ["black rice", "face serum", "serum", "face care", "niacinamide"],
    concerns: ["brightening", "even-tone"],
    keyIngredients: [{ name: "Black Rice" }, { name: "Niacinamide" }, { name: "Alpha-Arbutin" }, { name: "Hyaluronic Acid" }, { name: "Panthenol" }],
    benefits: ["Helps improve the look of dull, uneven skin", "Hydrates", "Leaves skin feeling soft and smooth"],
    promise: "A daily drop of light for skin that looks rested, even and luminous.",
  },
  {
    id: 8, name: "Black Rice Moisturizer Gel", shortName: "Moisturizer Gel",
    price: null, priceTBA: true, categoryId: 1, categoryIds: [1, 5],
    tags: ["black rice", "moisturizer", "gel moisturizer", "face care", "hyaluronic acid"],
    concerns: ["hydration", "comfort"],
    keyIngredients: [{ name: "Black Rice" }, { name: "Hyaluronic Acid" }, { name: "Aloe Vera" }, { name: "Niacinamide" }],
    benefits: ["Hydrates", "Softens", "Refreshes"],
    promise: "Weightless hydration that keeps skin soft, smooth and comfortable all day.",
  },
];

/** Rank the seeded catalogue and return the short names, best first. */
const rank = (query) =>
  rankProducts(PRODUCTS, query, {
    categories: CATEGORIES,
    concerns: CONCERNS,
  }).map((entry) => entry.product.shortName);

describe("normalize / tokenize", () => {
  it("folds case, diacritics and punctuation, and splits on the rest", () => {
    expect(normalize("  Áloe-Vera, 100% ")).toBe("aloe vera 100");
    expect(tokenize("Black Rice — Face Serum!")).toEqual([
      "black",
      "rice",
      "face",
      "serum",
    ]);
    expect(tokenize("   ")).toEqual([]);
    expect(tokenize(null)).toEqual([]);
  });
});

describe("rankProducts", () => {
  it("returns nothing for an empty query", () => {
    expect(rankProducts(PRODUCTS, "", { categories: CATEGORIES })).toEqual([]);
    expect(rankProducts(PRODUCTS, "   ", { categories: CATEGORIES })).toEqual([]);
    expect(rankProducts(PRODUCTS, "-", { categories: CATEGORIES })).toEqual([]);
  });

  it('"serum" puts the Face Serum first', () => {
    const results = rank("serum");
    expect(results[0]).toBe("Face Serum");
    // The name and the short name are both hit, which is what earns the lead.
    const [top] = rankProducts(PRODUCTS, "serum", { categories: CATEGORIES });
    expect(top.matchedOn).toEqual(expect.arrayContaining(["name", "shortName"]));
    expect(top.score).toBeGreaterThan(0);
  });

  it('"black rice" matches the whole range, priced products first', () => {
    const results = rank("black rice");
    expect(results).toHaveLength(PRODUCTS.length);
    // Every product opens with the phrase, so the tie-break decides the order:
    // the three products with a legible MRP lead the five that ship priceTBA.
    expect(results.slice(0, 3).sort()).toEqual(
      ["Exfoliating Face Scrub", "Face Wash", "Goat Milk Soap"].sort()
    );
  });

  it('"hydration" finds the Mist, the Gel and the Body Wash — and nothing else', () => {
    expect(rank("hydration").sort()).toEqual(
      ["Body Wash", "Face Mist", "Moisturizer Gel"].sort()
    );
  });

  it('"goat" finds the soap by one word out of the middle of its name', () => {
    expect(rank("goat")).toEqual(["Goat Milk Soap"]);
  });

  it("returns nothing for a query the catalogue cannot answer", () => {
    expect(rank("qwertyuiop")).toEqual([]);
    expect(rank("mekhela chador")).toEqual([]);
  });

  it("finds a product by the display name of a category it lives in", () => {
    // "Moisturizers & Mists" is category 5's display name; the Face Mist is not
    // called a moisturizer anywhere on its own record.
    expect(rank("moisturizers")).toEqual(
      expect.arrayContaining(["Face Mist", "Moisturizer Gel"])
    );
    // Without the categories the same query can only reach the Gel.
    expect(rankProducts(PRODUCTS, "moisturizers").map((e) => e.product.shortName)).toEqual([
      "Moisturizer Gel",
    ]);
  });

  it("finds a product by a concern, slug or display name", () => {
    // "even-tone" is the slug on the record; "even tone" is what the menu says.
    expect(rank("even tone")).toEqual(expect.arrayContaining(["Face Serum"]));
    expect(rank("even-tone")).toEqual(expect.arrayContaining(["Face Serum"]));
  });

  it("survives an empty or missing catalogue", () => {
    expect(rankProducts([], "serum")).toEqual([]);
    expect(rankProducts(undefined, "serum")).toEqual([]);
    expect(rankProducts([null, undefined], "serum")).toEqual([]);
  });
});
