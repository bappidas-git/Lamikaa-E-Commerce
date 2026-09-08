// The two decisions the cart makes on its own — which bar the free-shipping
// meter races towards, and what "Complete your ritual" offers next — are pure
// functions so they can be pinned down here rather than by clicking.
//
// `services/api` is mocked because importing the component would otherwise build
// a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import { freeShippingThreshold } from "./CartDrawer";
// The ranking moved to components/cart/CrossSell in Prompt 29 (the /cart page
// renders the same list); the tests for it move with it rather than reaching
// back through the drawer that no longer owns it.
import { crossSellFor } from "../cart/CrossSell";

// A miniature of the seeded catalogue: two priced products, one still on
// "Price on launch", and a ritual that runs cleanse → polish → treat.
const FACE_WASH = {
  id: 1,
  name: "Black Rice Face Wash",
  categoryId: 1,
  price: 390,
  heroOrder: 1,
  ritualStep: { order: 1, label: "Cleanse" },
  frequentlyBoughtTogetherIds: [5, 6],
};
const SOAP = {
  id: 2,
  name: "Black Rice Goat Milk Soap",
  categoryId: 2,
  price: 90,
  heroOrder: 2,
  ritualStep: { order: 1, label: "Body cleanse" },
  frequentlyBoughtTogetherIds: [],
};
const SCRUB = {
  id: 6,
  name: "Black Rice Exfoliating Face Scrub",
  categoryId: 1,
  price: 349,
  heroOrder: 6,
  ritualStep: { order: 2, label: "Polish" },
  frequentlyBoughtTogetherIds: [],
};
const MIST = {
  id: 5,
  name: "Black Rice Face Mist",
  categoryId: 1,
  price: null,
  priceTBA: true,
  heroOrder: 5,
  ritualStep: { order: 2, label: "Refresh" },
  frequentlyBoughtTogetherIds: [],
};
const CATALOGUE = [FACE_WASH, SOAP, MIST, SCRUB];

const line = (product) => ({
  id: `${product.id}-default`,
  productId: product.id,
  name: product.name,
  price: product.price,
  quantity: 1,
});

describe("freeShippingThreshold", () => {
  test("is the lowest positive freeAbove across the active methods", () => {
    expect(
      freeShippingThreshold([
        { name: "Express", freeAbove: 1499, isActive: true },
        { name: "Standard", freeAbove: 999, isActive: true },
      ])
    ).toBe(999);
  });

  test("ignores inactive methods and non-figures", () => {
    expect(
      freeShippingThreshold([
        { name: "Retired", freeAbove: 1, isActive: false },
        { name: "Standard", freeAbove: null, isActive: true },
        { name: "Odd", freeAbove: 0, isActive: true },
        { name: "Broken", freeAbove: "soon", isActive: true },
        { name: "Express", freeAbove: 1499, isActive: true },
      ])
    ).toBe(1499);
  });

  test("is null — never zero — when nothing commits to a bar", () => {
    expect(freeShippingThreshold([{ name: "Standard", freeAbove: null }])).toBeNull();
    expect(freeShippingThreshold([])).toBeNull();
    expect(freeShippingThreshold(undefined)).toBeNull();
  });
});

describe("crossSellFor", () => {
  test("offers what the cart's lines are bought with, first", () => {
    // Face Wash pairs with the Mist (unpriced, skipped) and the Scrub.
    expect(crossSellFor(CATALOGUE, [line(FACE_WASH)]).map((p) => p.id)).toEqual([
      6, 2,
    ]);
  });

  test("falls through to the next ritual step in the same category", () => {
    const noPairs = { ...FACE_WASH, frequentlyBoughtTogetherIds: [] };
    const [first] = crossSellFor([noPairs, SOAP, MIST, SCRUB], [line(noPairs)]);
    // The Mist is step 2 in the same category but has no price; the Scrub is
    // the next step that can actually be added.
    expect(first.id).toBe(6);
  });

  test("never offers a product already in the cart", () => {
    const ids = crossSellFor(CATALOGUE, [line(FACE_WASH), line(SCRUB)]).map(
      (p) => p.id
    );
    expect(ids).not.toContain(1);
    expect(ids).not.toContain(6);
  });

  test("never offers a product whose price is not committed", () => {
    const ids = crossSellFor(CATALOGUE, [line(SOAP)]).map((p) => p.id);
    expect(ids).not.toContain(5);
  });

  test("stops at the limit", () => {
    expect(crossSellFor(CATALOGUE, [line(SOAP)])).toHaveLength(2);
    expect(crossSellFor(CATALOGUE, [line(SOAP)], 1)).toHaveLength(1);
  });

  test("falls back to hero order for an empty cart — the 'Start with' rows", () => {
    expect(crossSellFor(CATALOGUE, []).map((p) => p.id)).toEqual([1, 2]);
  });

  test("returns nothing when the catalogue offers nothing eligible", () => {
    expect(crossSellFor([MIST], [])).toEqual([]);
    expect(crossSellFor([], [line(FACE_WASH)])).toEqual([]);
    expect(crossSellFor(undefined, undefined)).toEqual([]);
  });
});
