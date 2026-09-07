import {
  faqLimit,
  faqsForPlacement,
  faqsForGroup,
  faqsForProduct,
} from "./faqs";

// =============================================================================
// utils/faqs — the `limit` option Prompt 21 added
// =============================================================================
// The cap has to be applied to the FILTERED list, not to the raw collection:
// "the first eight answers a visitor should see" and "eight rows off the top of
// the table" are different lists whenever a row is inactive, targeted at one
// product, off this placement or a duplicate question — and the second one
// quietly hands back six.

const row = (id, over = {}) => ({
  id,
  question: `Q${id}`,
  answer: `A${id}`,
  group: "general",
  placements: ["home", "help", "product"],
  productIds: [],
  isActive: true,
  sortOrder: id,
  ...over,
});

describe("faqLimit", () => {
  const rows = [1, 2, 3].map((id) => row(id));

  it("caps to the number given", () => {
    expect(faqLimit(rows, 2).map((r) => r.id)).toEqual([1, 2]);
    expect(faqLimit(rows, 0)).toEqual([]);
  });

  it("leaves the list alone when there is no sensible cap", () => {
    expect(faqLimit(rows, undefined)).toHaveLength(3);
    expect(faqLimit(rows, null)).toHaveLength(3);
    expect(faqLimit(rows, "eight")).toHaveLength(3);
    expect(faqLimit(rows, -1)).toHaveLength(3);
    expect(faqLimit(rows, 99)).toHaveLength(3);
  });
});

describe("faqsForPlacement", () => {
  // Two rows the home block must never show — one switched off, one written for
  // a single product — sitting where a naive slice would count them.
  const collection = [
    row(1),
    row(2, { isActive: false }),
    row(3, { productIds: [4] }),
    row(4),
    row(5, { placements: ["help"] }),
    row(6, { question: "Q4" }),
    row(7),
  ];

  it("filters before it caps", () => {
    expect(faqsForPlacement(collection, "home", { limit: 3 }).map((r) => r.id)).toEqual([
      1, 4, 7,
    ]);
  });

  it("still answers with everything when no limit is given", () => {
    expect(faqsForPlacement(collection, "home").map((r) => r.id)).toEqual([1, 4, 7]);
  });

  it("keeps the other selectors' behaviour untouched", () => {
    // `faqsForGroup` is deliberately NOT gated on placement — a heading on the
    // FAQ page shows what was filed under it — so row 5 belongs in this list and
    // not in the one above.
    expect(faqsForGroup(collection, "general").map((r) => r.id)).toEqual([1, 4, 5, 7]);
    // The targeted row first, then the general ones — row 6 repeats row 4's
    // question and is de-duped away, on this surface as on the other.
    expect(faqsForProduct(collection, { id: 4 }).map((r) => r.id)).toEqual([3, 1, 4, 7]);
  });
});
