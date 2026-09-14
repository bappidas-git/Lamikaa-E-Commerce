// The hero's copy decisions are pure functions, so the rules that matter — what
// a slide falls back to when a merchant has not written its hero line, which
// products become slides when the hero order is empty, and what a screen reader
// is told about slide 3 of 8 — are pinned down here rather than by clicking.
//
// `services/api` is mocked because importing the component would otherwise
// build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import { readFileSync } from "fs";
import { join } from "path";

import {
  exploreLabel,
  heroEyebrow,
  heroHeadline,
  heroSlideEyebrow,
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

describe("heroSlideEyebrow — the slide's tagline", () => {
  it("prints the slide's own tagline, and prints it alone", () => {
    // The brand's philosophy line opens the carousel. No position after it: a
    // sentence written for one slide is not a label that needs one, and the
    // rail's counter and the slide's aria-label both still carry the position.
    expect(
      heroSlideEyebrow({ eyebrow: "Ancient Wisdom. Modern Beauty." }, 0, 8)
    ).toBe("Ancient Wisdom. Modern Beauty.");
    expect(heroSlideEyebrow({ eyebrow: "Old Rituals. New Mornings." }, 2, 8)).toBe(
      "Old Rituals. New Mornings."
    );
  });

  it("falls back to the section's label and position when the slide has no tagline", () => {
    expect(heroSlideEyebrow({ eyebrow: "" }, 2, 8)).toBe(
      "Black Rice Ritual · 03 / 08"
    );
    expect(heroSlideEyebrow({}, 2, 8)).toBe("Black Rice Ritual · 03 / 08");
    expect(heroSlideEyebrow(null, 2, 8)).toBe("Black Rice Ritual · 03 / 08");
    // A renamed section label reaches the fallback, and only the fallback.
    expect(heroSlideEyebrow({ eyebrow: "" }, 0, 3, "New in")).toBe(
      "New in · 01 / 03"
    );
    expect(heroSlideEyebrow({ eyebrow: "Handed Down. Made New." }, 0, 3, "New in")).toBe(
      "Handed Down. Made New."
    );
  });

  it("treats a whitespace-only tagline as no tagline", () => {
    expect(heroSlideEyebrow({ eyebrow: "   " }, 0, 8)).toBe(
      "Black Rice Ritual · 01 / 08"
    );
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

// =============================================================================
// The two rules in HeroCarousel.module.css that nothing else can hold down
// =============================================================================
// Both are geometry the component depends on and neither can fail loudly: the
// stylesheet is a CSS module, so jsdom never computes it, and a rule deleted by
// an unrelated edit takes the hero down on a real browser with every test still
// green. That is exactly how each of these was lost once.
describe("HeroCarousel.module.css", () => {
  const css = readFileSync(join(__dirname, "HeroCarousel.module.css"), "utf8");
  // The base rule — a nested copy inside an @media block is indented.
  const headline = (/^\.headline\s*\{([\s\S]*?)\}/m.exec(css) || [])[1] || "";

  // `HeroSlide` renders the ACTIVE slide's headline as an <h1> and every other
  // slide's as a <p>, so anything this class does not state is a different
  // typeface, size and leading on seven of the eight slides — and the stage is
  // sized from the tallest of them, so the band's height, and the whole page
  // under it, moves on every advance.
  it("typesets the headline on the class rather than on the h1", () => {
    expect(headline).toMatch(/font-family:\s*var\(--sf-font-display\)/);
    expect(headline).toMatch(/font-size:\s*var\(--sf-text-/);
    expect(headline).toMatch(/line-height:\s*var\(--sf-leading-/);
    expect(headline).toMatch(/letter-spacing:/);
  });

  // THE CARD'S BUDGET IS THE BAND'S OWN HEIGHT, and the rail is not taken off
  // it. Subtracting the rail and the slide's padding has been tried twice and
  // shrank the pack both times — a 900px laptop lost a fifth of its card — for
  // height that is properly found in the short-screen bracket's leading and
  // padding instead. Pinned here because it is a DECISION, and a decision only
  // a comment holds down is a decision the next edit reverses.
  const budget = (
    /\.hero\.heightStandard,\s*\n\s*\.hero\.heightCompact\s*\{([\s\S]*?)\}/m.exec(
      css
    ) || []
  )[1];

  it("bounds the card by the band's own height", () => {
    expect(budget).toMatch(
      /--sf-hero-card-fit:\s*calc\(\(100svh - var\(--sf-hero-chrome\)\) \* 0\.8\)/
    );
  });

  it("does not pay for the control rail out of the card", () => {
    expect(budget).not.toMatch(/--sf-hero-rail\b|--sf-hero-slide-pad\b/);
  });

  // THE PLATE UNDER THE COPY IS AN ABSPOS `::before`, so the column it belongs
  // to has to be its containing block. `isolation: isolate` is NOT that — it
  // opens a stacking context and leaves the containing block alone — and
  // without `position: relative` beside it the bloom resolved against `.stage`
  // and washed the whole carousel, with a hard edge across the photograph where
  // the stage ends. jsdom computes no CSS module, so nothing else can catch it.
  // `.copy` is written twice — once in the handover block for the crossfade,
  // once for the column itself — so the rule is taken from the one that carries
  // `isolation`, not from whichever comes first.
  const copy =
    [...css.matchAll(/^\.copy\s*\{([\s\S]*?)^\}/gm)]
      .map((m) => m[1])
      .find((body) => /isolation/.test(body)) || "";

  it("gives the copy column a containing block for its plate", () => {
    expect(copy).toMatch(/position:\s*relative/);
    expect(copy).toMatch(/isolation:\s*isolate/);
  });
});
