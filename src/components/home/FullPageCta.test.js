// Prompt 19's two copy decisions are pure functions, so the rules that matter —
// which glyphs of the first line carry the signature gradient, and what the
// full-page CTA says when the CMS has nothing to say — are pinned down here
// rather than by scrolling the home page.
//
// `services/api` is mocked because importing the component would otherwise
// build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import { ctaCopy, splitOnWord } from "./FullPageCta";
import brand from "../../config/brand";

describe("splitOnWord", () => {
  it("leaves the sentence's own punctuation out of the gradient", () => {
    expect(splitOnWord("Beauty that creates value.")).toEqual({
      before: "Beauty that creates ",
      match: "value",
      after: ".",
    });
  });

  it("matches a whole word, never one inside another", () => {
    expect(splitOnWord("Beauty that is valuable.")).toBeNull();
  });

  it("says nothing about a line that does not carry the word", () => {
    expect(splitOnWord("Value that reaches farmers.", "prosperity")).toBeNull();
    expect(splitOnWord(null)).toBeNull();
    expect(splitOnWord("Beauty that creates value.", "")).toBeNull();
  });

  it("cannot be turned into a pattern by the word it is given", () => {
    expect(splitOnWord("Beauty (that) creates value.", "(that)")).toBeNull();
  });
});

describe("ctaCopy", () => {
  const block = {
    lines: ["One.", "Two.", "Three."],
    primaryLabel: "Shop the Black Rice Range",
    primaryTo: "/shop",
    secondaryLabel: "Meet the farmer-owners",
    secondaryTo: "/about",
    image: "https://example.test/cta.jpg",
  };

  it("prefers the owner's block", () => {
    expect(ctaCopy(block)).toEqual({
      lines: ["One.", "Two.", "Three."],
      primaryLabel: "Shop the Black Rice Range",
      primaryTo: "/shop",
      secondaryLabel: "Meet the farmer-owners",
      secondaryTo: "/about",
      image: "https://example.test/cta.jpg",
    });
  });

  // Unlike the ingredient spotlight, this section CAN speak without the CMS:
  // the fallback is the brand's own signature lines, not an invented claim.
  it("falls back to the brand's first three signature lines", () => {
    const copy = ctaCopy(null);
    expect(copy.lines).toEqual(brand.signatureLines.slice(0, 3));
    expect(copy.primaryLabel).toBe("Shop the Black Rice Range");
    expect(copy.primaryTo).toBe("/shop");
    expect(copy.secondaryLabel).toBe("Meet the farmer-owners");
    expect(copy.secondaryTo).toBe("/about");
    expect(copy.image).toBe("");
  });

  it("treats an unpublished block as no block at all", () => {
    expect(ctaCopy({ ...block, published: false }).lines).toEqual(
      brand.signatureLines.slice(0, 3)
    );
  });

  it("keeps the composition a triplet", () => {
    expect(ctaCopy({ lines: ["a", "b", "c", "d"] }).lines).toEqual(["a", "b", "c"]);
  });

  it("ignores blank lines rather than printing them", () => {
    expect(ctaCopy({ lines: ["   ", ""] }).lines).toEqual(
      brand.signatureLines.slice(0, 3)
    );
  });
});
