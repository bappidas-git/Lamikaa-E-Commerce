// The chapter's two copy decisions are pure functions, so the rules that matter
// — how a chapter numbers itself, and how a BODY step is told apart from a face
// step that shares its number — are pinned down here rather than by scrolling
// eight spreads.
//
// `services/api` is mocked because importing the component would otherwise build
// a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import { chapterNumeral, stepEyebrow } from "./ProductChapter";
import { showcaseProducts } from "../home/ProductShowcase";

describe("chapterNumeral", () => {
  it("is 1-based and padded", () => {
    expect(chapterNumeral(0)).toBe("01");
    expect(chapterNumeral(7)).toBe("08");
  });

  it("keeps two digits past nine", () => {
    expect(chapterNumeral(9)).toBe("10");
  });
});

describe("stepEyebrow", () => {
  it("reads '01 — Cleanse' for a face step", () => {
    expect(stepEyebrow({ ritualStep: { order: 1, label: "Cleanse" } })).toBe(
      "01 — Cleanse"
    );
  });

  // The soap and the body wash are both step one of the BODY routine; without
  // the qualifier they would read as a second "01 — …" beside the face wash's.
  it("qualifies a body step so two ritual ones do not collide", () => {
    expect(stepEyebrow({ ritualStep: { order: 1, label: "Body cleanse" } })).toBe(
      "Body 01 — Body cleanse"
    );
  });

  it("falls back to the label alone when there is no usable order", () => {
    expect(stepEyebrow({ ritualStep: { label: "Treat" } })).toBe("Treat");
    expect(stepEyebrow({ ritualStep: { order: 0, label: "Treat" } })).toBe("Treat");
  });

  it("says nothing at all when the product has no step", () => {
    expect(stepEyebrow({})).toBe("");
    expect(stepEyebrow(null)).toBe("");
  });
});

describe("showcaseProducts", () => {
  const hero = [{ id: 1, heroOrder: 1 }, { id: 2, heroOrder: 2 }];

  it("keeps the hero order exactly as the api handed it back", () => {
    expect(showcaseProducts(hero)).toEqual(hero);
  });

  it("falls back to the catalogue sorted by heroOrder", () => {
    const all = [
      { id: 3, heroOrder: 2 },
      { id: 4 },
      { id: 5, heroOrder: 1 },
    ];
    expect(showcaseProducts([], all).map((p) => p.id)).toEqual([5, 3, 4]);
  });

  it("does not mutate the list it was handed", () => {
    const all = [{ id: 3, heroOrder: 2 }, { id: 5, heroOrder: 1 }];
    showcaseProducts(null, all);
    expect(all.map((p) => p.id)).toEqual([3, 5]);
  });

  it("is empty rather than undefined when there is nothing to show", () => {
    expect(showcaseProducts(null, null)).toEqual([]);
  });
});
