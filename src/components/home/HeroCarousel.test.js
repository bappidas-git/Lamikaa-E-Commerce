// The hero's copy decisions are pure functions, so the rules that matter — what
// a slide falls back to when a merchant has not written its hero line, which
// products become slides when the hero order is empty, and what a screen reader
// is told about slide 3 of 8 — are pinned down here rather than by clicking.
//
// `services/api` is mocked because importing the component would otherwise
// build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import {
  exploreLabel,
  heroEyebrow,
  heroHeadline,
  heroSubtext,
  padIndex,
  resolveHeroSlides,
  slideLabel,
} from "./HeroCarousel";

const FACE_WASH = {
  id: 1,
  name: "Black Rice Face Wash",
  shortName: "Face Wash",
  heroOrder: 1,
  heroHeadline: "Begin again, every morning.",
  heroSubtext: "A gentle black rice cleanse.",
  promise: "A gentle daily cleanse.",
  shortDescription: "A gentle daily cleanse.",
};

// A product a merchant has added to the range but not yet written hero copy for.
const UNWRITTEN = {
  id: 2,
  name: "Black Rice Goat Milk Soap",
  shortName: "Goat Milk Soap",
  promise: "A luxurious cleansing bar.",
  shortDescription: "A bar that nourishes as it cleans.",
};

describe("padIndex / heroEyebrow", () => {
  it("pads to two digits", () => {
    expect(padIndex(1)).toBe("01");
    expect(padIndex(8)).toBe("08");
    expect(padIndex(12)).toBe("12");
  });

  it("prints the ritual eyebrow with a 1-based position", () => {
    expect(heroEyebrow(0, 8)).toBe("Black Rice Ritual · 01 / 08");
    expect(heroEyebrow(7, 8)).toBe("Black Rice Ritual · 08 / 08");
  });
});

describe("slide copy", () => {
  it("prints the product's own hero copy when it has some", () => {
    expect(heroHeadline(FACE_WASH)).toBe("Begin again, every morning.");
    expect(heroSubtext(FACE_WASH)).toBe("A gentle black rice cleanse.");
  });

  it("falls back to the promise and the short description, never to invented copy", () => {
    expect(heroHeadline(UNWRITTEN)).toBe("A luxurious cleansing bar.");
    expect(heroSubtext(UNWRITTEN)).toBe("A bar that nourishes as it cleans.");
  });

  it("renders nothing rather than a placeholder when a product has no copy at all", () => {
    expect(heroHeadline({ name: "Bare" })).toBe("");
    expect(heroSubtext({ name: "Bare" })).toBe("");
    expect(heroHeadline(null)).toBe("");
  });

  it("uses the short name in the explore CTA", () => {
    expect(exploreLabel(FACE_WASH)).toBe("Explore the Face Wash");
    // No short name: the full name still reads correctly.
    expect(exploreLabel({ name: "Black Rice Face Mist" })).toBe(
      "Explore the Black Rice Face Mist"
    );
    expect(exploreLabel(null)).toBe("Explore the range");
  });

  it("labels a slide with its position and the product's full name", () => {
    expect(slideLabel(FACE_WASH, 2, 8)).toBe("3 of 8: Black Rice Face Wash");
  });
});

describe("resolveHeroSlides", () => {
  it("uses the hero products when there are any", () => {
    expect(resolveHeroSlides([FACE_WASH, UNWRITTEN], [])).toEqual([
      FACE_WASH,
      UNWRITTEN,
    ]);
  });

  it("falls back to the featured list, capped at the launch range", () => {
    const featured = Array.from({ length: 12 }, (_, i) => ({ id: i + 1 }));
    expect(resolveHeroSlides([], featured)).toHaveLength(8);
    expect(resolveHeroSlides(null, featured)[0]).toEqual({ id: 1 });
  });

  it("returns nothing — the brand slide — rather than inventing a product", () => {
    expect(resolveHeroSlides([], [])).toEqual([]);
    expect(resolveHeroSlides(null, null)).toEqual([]);
    expect(resolveHeroSlides(undefined, undefined)).toEqual([]);
  });

  it("drops empty rows from either source", () => {
    expect(resolveHeroSlides([null, FACE_WASH, undefined], null)).toEqual([
      FACE_WASH,
    ]);
  });
});
