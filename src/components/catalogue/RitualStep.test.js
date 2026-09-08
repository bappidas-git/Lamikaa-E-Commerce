// Prompt 24's decisions are pure functions, so the rules that matter — what a
// step's add button is allowed to say, which word a choice button shows, how a
// routine's total behaves when half the range has no price, which concerns a
// category page prints and what a BreadcrumbList publishes — are pinned down
// here rather than by clicking through /rituals and /category/face-care.
//
// `services/api` is mocked because importing any of these modules would
// otherwise build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({
  __esModule: true,
  default: {},
  resolveRitualSteps: () => [],
}));

import { choiceLabel, stepActionLabel, stepNumeral } from "./RitualStep";
import { ritualEyebrow, ritualTotal } from "../../pages/Rituals/RitualDetail";
import { concernsOf } from "../../pages/Shop/Shop";
import { breadcrumbJsonLd } from "../../utils/seo";

describe("stepNumeral", () => {
  it("pads the step's own order", () => {
    expect(stepNumeral(1)).toBe("01");
    expect(stepNumeral(4)).toBe("04");
    expect(stepNumeral(12)).toBe("12");
  });

  // A step with no order still has a position in the list it is being rendered
  // in — a numeral is never blank.
  it("falls back to the row's position", () => {
    expect(stepNumeral(undefined, 2)).toBe("03");
    expect(stepNumeral(null, 0)).toBe("01");
  });
});

describe("stepActionLabel", () => {
  it("offers the cart only when there is something to charge", () => {
    expect(stepActionLabel({ price: 390 })).toBe("Add to Cart");
  });

  // Five of the eight products ship before their MRP is set. The label is the
  // honest half of the disabled state.
  it("says coming soon for a product with no price yet", () => {
    expect(stepActionLabel({ priceTBA: true, price: null })).toBe("Coming soon");
  });

  it("tells out of stock apart from unpriced", () => {
    expect(stepActionLabel({ price: 349, stock: 0 })).toBe("Out of stock");
  });

  it("says coming soon for a step whose product has left the catalogue", () => {
    expect(stepActionLabel(null)).toBe("Coming soon");
  });
});

describe("choiceLabel", () => {
  // The bar-or-wash labels come from the CATALOGUE, never from this file: the
  // admin can pair any two products behind one step.
  it("prefers the catalogue's short name", () => {
    expect(
      choiceLabel({ shortName: "Goat Milk Soap", name: "Black Rice Goat Milk Soap" })
    ).toBe("Goat Milk Soap");
  });

  it("falls back to the full name", () => {
    expect(choiceLabel({ name: "Black Rice Body Wash" })).toBe("Black Rice Body Wash");
  });

  it("says nothing about a product that is not there", () => {
    expect(choiceLabel(null)).toBe("");
    expect(choiceLabel({ shortName: "   " })).toBe("");
  });
});

describe("ritualEyebrow", () => {
  it("reads 'Ritual · 4 steps · About five minutes'", () => {
    expect(ritualEyebrow(4, "About five minutes")).toBe(
      "Ritual · 4 steps · About five minutes"
    );
  });

  it("does not misspell one step", () => {
    expect(ritualEyebrow(1, "")).toBe("Ritual · 1 step");
  });

  // A duration is copy the owner writes, so a routine without one simply has
  // one fewer thing to say.
  it("drops a duration nobody has written", () => {
    expect(ritualEyebrow(2)).toBe("Ritual · 2 steps");
    expect(ritualEyebrow(2, "   ")).toBe("Ritual · 2 steps");
  });
});

describe("ritualTotal", () => {
  it("adds up only the steps that have a price", () => {
    const result = ritualTotal([
      { price: 390 },
      { price: null, priceTBA: true },
      { price: 349 },
    ]);
    expect(result).toEqual({ total: 739, priced: 2, unpriced: 1 });
  });

  // The signal the panel reads to print no total at all: a routine of entirely
  // unpriced steps must never show a confident ₹0.
  it("reports nothing priced when the whole routine is coming soon", () => {
    expect(ritualTotal([{ priceTBA: true }, { price: null }])).toEqual({
      total: 0,
      priced: 0,
      unpriced: 2,
    });
  });

  it("survives nonsense", () => {
    expect(ritualTotal(null)).toEqual({ total: 0, priced: 0, unpriced: 0 });
  });
});

describe("concernsOf", () => {
  const collection = [
    { slug: "cleansing", name: "Cleansing" },
    { slug: "brightening", name: "Brightening" },
    { slug: "hydration", name: "Hydration" },
  ];

  it("prints only the concerns the products on the page answer to", () => {
    const products = [
      { concerns: ["cleansing", "brightening"] },
      { concerns: ["brightening"] },
    ];
    expect(concernsOf(products, collection)).toEqual([
      { slug: "cleansing", name: "Cleansing" },
      { slug: "brightening", name: "Brightening" },
    ]);
  });

  // The collection is the dictionary and the editorial order; the products are
  // the truth. A slug the owner has not described yet still gets a chip.
  it("names a slug with no record from the slug itself", () => {
    expect(concernsOf([{ concerns: ["even-tone"] }], collection)).toEqual([
      { slug: "even-tone", name: "Even tone" },
    ]);
  });

  it("keeps the collection's order, not the products'", () => {
    const products = [{ concerns: ["hydration"] }, { concerns: ["cleansing"] }];
    expect(concernsOf(products, collection).map((row) => row.slug)).toEqual([
      "cleansing",
      "hydration",
    ]);
  });

  it("says nothing for products with no concerns", () => {
    expect(concernsOf([{}, { concerns: [] }], collection)).toEqual([]);
    expect(concernsOf(null, collection)).toEqual([]);
  });
});

describe("breadcrumbJsonLd", () => {
  const origin = window.location.origin;

  it("publishes the same trail the page draws", () => {
    const graph = breadcrumbJsonLd([
      { label: "Home", to: "/" },
      { label: "Shop", to: "/shop" },
      { label: "Face Care" },
    ]);
    expect(graph["@type"]).toBe("BreadcrumbList");
    expect(graph.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${origin}/shop` },
      // The page itself takes a position but no URL — schema.org's own rule for
      // the final crumb.
      { "@type": "ListItem", position: 3, name: "Face Care" },
    ]);
  });

  it("publishes nothing for a trail with nothing on it", () => {
    expect(breadcrumbJsonLd([])).toBeNull();
    expect(breadcrumbJsonLd(null)).toBeNull();
    expect(breadcrumbJsonLd([{ label: "  " }])).toBeNull();
  });
});
