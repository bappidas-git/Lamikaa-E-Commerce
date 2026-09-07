// The chain's two copy decisions and the teaser's fallback are pure functions,
// so the rules that matter — how a step numbers itself, which label is the
// brand's, and what the section says when the CMS has nothing to say — are
// pinned down here rather than by scrolling the home page.
//
// `services/api` is mocked because importing AboutTeaser would otherwise build
// a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import brand from "../../config/brand";
import { isBrandStep, stepNumeral } from "./ValueChain";
import { gradientWordIndex, teaserCopy } from "../home/AboutTeaser";

describe("stepNumeral", () => {
  it("is 1-based and padded", () => {
    expect(stepNumeral(0)).toBe("01");
    expect(stepNumeral(6)).toBe("07");
  });
});

describe("isBrandStep", () => {
  it("finds the brand's own step in the canonical chain", () => {
    expect(brand.valueChain.filter(isBrandStep)).toEqual(["LAMIKAA Naturals"]);
  });

  it("matches the brand under any of its names, and ignores case and padding", () => {
    expect(isBrandStep("  lamikaa naturals ")).toBe(true);
    expect(isBrandStep(brand.name)).toBe(true);
    expect(isBrandStep(brand.shortName)).toBe(true);
  });

  it("leaves every other step alone", () => {
    expect(isBrandStep("Farmer Members")).toBe(false);
    expect(isBrandStep("")).toBe(false);
    expect(isBrandStep(null)).toBe(false);
  });
});

describe("gradientWordIndex", () => {
  it("finds the word past its punctuation", () => {
    expect(gradientWordIndex("When LAMIKAA grows, our farmers grow with us.")).toBe(4);
  });

  it("says nothing when the word is not in the headline", () => {
    expect(gradientWordIndex("Beauty that creates value.")).toBeUndefined();
    expect(gradientWordIndex(undefined)).toBeUndefined();
  });
});

describe("teaserCopy", () => {
  const block = {
    eyebrow: "About LAMIKAA",
    title: "When LAMIKAA grows, our farmers grow with us.",
    text: "One paragraph.\n\nAnd a second.",
    image: "https://example.test/farm.jpg",
    ctaLabel: "Our Story",
    ctaTo: "/about",
  };

  it("uses the published block as written", () => {
    expect(teaserCopy(block)).toEqual(block);
  });

  // The long copy is BRAND.md §3.1 and lives in the API, never in the bundle:
  // with no block there are no paragraphs and no image to show, and the quote
  // falls back to the brand's own signature line.
  it("keeps only what brand config can state when there is no block", () => {
    const copy = teaserCopy(null);
    expect(copy.text).toBe("");
    expect(copy.image).toBe("");
    expect(copy.title).toBe(brand.signatureLines[3]);
    expect(copy.ctaLabel).toBe("Our Story");
    expect(copy.ctaTo).toBe("/about");
  });

  it("treats an unpublished block as no block at all", () => {
    expect(teaserCopy({ ...block, published: false }).text).toBe("");
  });
});
