// Prompt 18's copy decisions are pure functions, so the rules that matter — how
// a ritual card finds its one line, how it counts its steps, which headline word
// carries the gradient, and what the spotlight is allowed to claim when the CMS
// has nothing to say — are pinned down here rather than by scrolling the home
// page.
//
// `services/api` is mocked because importing either component would otherwise
// build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import { ritualBlurb, stepCountLabel } from "./RitualCard";
import { gradientWordIndex, spotlightCopy } from "../home/WhyBlackRice";

describe("ritualBlurb", () => {
  it("prefers the owner's tagline", () => {
    expect(
      ritualBlurb({ tagline: "Clear, refreshed, quietly radiant.", story: "Four steps." })
    ).toBe("Clear, refreshed, quietly radiant.");
  });

  // Never a truncation at N characters: that cuts mid-word and promises an
  // ellipsis the copy never earned.
  it("falls back to the first sentence of the story, whole", () => {
    expect(
      ritualBlurb({
        story: "Five steps to undo the day. The scrub is a weekly pleasure.",
      })
    ).toBe("Five steps to undo the day.");
  });

  it("keeps a one-sentence story that never terminates", () => {
    expect(ritualBlurb({ story: "The same black rice, from the shower out" })).toBe(
      "The same black rice, from the shower out"
    );
  });

  it("says nothing when the ritual has neither", () => {
    expect(ritualBlurb({ tagline: "   " })).toBe("");
    expect(ritualBlurb(null)).toBe("");
  });
});

describe("stepCountLabel", () => {
  it("reads 'Ritual · 4 steps'", () => {
    expect(stepCountLabel(4)).toBe("Ritual · 4 steps");
  });

  it("does not misspell one", () => {
    expect(stepCountLabel(1)).toBe("Ritual · 1 step");
  });

  it("treats nonsense as none", () => {
    expect(stepCountLabel(undefined)).toBe("Ritual · 0 steps");
    expect(stepCountLabel(-3)).toBe("Ritual · 0 steps");
  });
});

describe("gradientWordIndex", () => {
  it("finds the word rather than trusting a position", () => {
    expect(gradientWordIndex("Why black rice?")).toBe(1);
  });

  it("ignores case and punctuation around it", () => {
    expect(gradientWordIndex("Black rice, and why it matters")).toBe(0);
  });

  // An edited headline that dropped the word gets NO gradient rather than one
  // on whatever happens to sit at that index.
  it("is undefined when the word is gone", () => {
    expect(gradientWordIndex("Our hero ingredient")).toBeUndefined();
    expect(gradientWordIndex(null)).toBeUndefined();
  });
});

describe("spotlightCopy", () => {
  it("keeps the section's own furniture when the block is missing", () => {
    const copy = spotlightCopy(null);
    expect(copy.eyebrow).toBe("The hero ingredient");
    expect(copy.title).toBe("Why black rice?");
  });

  // The whole point of the section is the three seeded claims; there is no
  // fallback copy for them, and a component must never invent one.
  it("claims nothing about the ingredient without published points", () => {
    expect(spotlightCopy(null).points).toEqual([]);
    expect(spotlightCopy({ points: "antioxidant-rich" }).points).toEqual([]);
    expect(spotlightCopy({ published: false, points: ["Antioxidant-rich."] }).points)
      .toEqual([]);
  });

  it("drops blank points rather than rendering an empty bullet", () => {
    expect(spotlightCopy({ points: ["Antioxidant-rich.", "  ", ""] }).points).toEqual([
      "Antioxidant-rich.",
    ]);
  });

  it("takes the published eyebrow, title and image when there is one", () => {
    const copy = spotlightCopy({
      eyebrow: "The one ingredient",
      title: "Why black rice, then?",
      points: ["Antioxidant-rich."],
      image: "https://example.com/rice.jpg",
    });
    expect(copy).toEqual({
      eyebrow: "The one ingredient",
      title: "Why black rice, then?",
      points: ["Antioxidant-rich."],
      image: "https://example.com/rice.jpg",
    });
  });
});
