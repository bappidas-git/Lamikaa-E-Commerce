// The index's two pieces of arithmetic — where a chapter's id comes from, and
// how far the progress track is filled — are pure functions, so the rules that
// matter are pinned down here rather than by scrolling eight chapters and
// squinting at a 2px gradient.
//
// `services/api` is mocked because importing the component would otherwise
// build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import {
  chapterHeadingId,
  chapterId,
  intraChapterProgress,
  trackProgress,
} from "./ChapterIndex";
import { productCountLabel, shopOrder } from "../../pages/Shop/Shop";

describe("chapterId", () => {
  it("is the slug, because that is what the URL hash has to survive as", () => {
    expect(chapterId({ slug: "black-rice-face-wash", id: 1 }, 0)).toBe(
      "chapter-black-rice-face-wash"
    );
  });

  it("falls back to the id, then to the position, so it is never 'chapter-undefined'", () => {
    expect(chapterId({ id: 7 }, 3)).toBe("chapter-7");
    expect(chapterId({}, 3)).toBe("chapter-3");
    expect(chapterId(null, 0)).toBe("chapter-0");
  });

  // The rail jumps to the SECTION and moves focus to the HEADING; the two ids
  // have to agree with the ones ProductChapter writes.
  it("derives the heading id from the chapter id", () => {
    expect(chapterHeadingId({ slug: "black-rice-face-mist" }, 4)).toBe(
      "chapter-black-rice-face-mist-title"
    );
  });
});

describe("intraChapterProgress", () => {
  it("is 0 while the chapter's top edge is still below the fold", () => {
    expect(intraChapterProgress({ top: 400, height: 800 })).toBe(0);
  });

  it("is half way when half the chapter has scrolled past the top", () => {
    expect(intraChapterProgress({ top: -400, height: 800 })).toBe(0.5);
  });

  it("clamps at 1 once the chapter is entirely above the viewport", () => {
    expect(intraChapterProgress({ top: -2000, height: 800 })).toBe(1);
  });

  it("is 0 rather than NaN for an element that has not been laid out", () => {
    expect(intraChapterProgress({ top: 0, height: 0 })).toBe(0);
    expect(intraChapterProgress(null)).toBe(0);
  });
});

describe("trackProgress", () => {
  it("fills one eighth per chapter read, plus the part of this one", () => {
    expect(trackProgress(0, 0, 8)).toBe(0);
    expect(trackProgress(0, 0.5, 8)).toBeCloseTo(0.0625);
    expect(trackProgress(4, 0, 8)).toBe(0.5);
    expect(trackProgress(7, 1, 8)).toBe(1);
  });

  it("survives an active index that outran the list it is measured against", () => {
    expect(trackProgress(99, 1, 3)).toBe(1);
    expect(trackProgress(-4, 0, 3)).toBe(0);
  });

  it("is 0 rather than Infinity when there are no chapters", () => {
    expect(trackProgress(0, 0.5, 0)).toBe(0);
  });
});

describe("shopOrder", () => {
  it("is hero order, and a product with no hero position sorts last", () => {
    const rows = [
      { id: 3, heroOrder: 2, name: "C" },
      { id: 4, name: "D" },
      { id: 5, heroOrder: 1, name: "A" },
    ];
    expect(shopOrder(rows).map((p) => p.id)).toEqual([5, 3, 4]);
  });

  it("breaks a tie on the name, so the order never depends on the response", () => {
    const rows = [
      { id: 1, name: "Moisturizer Gel" },
      { id: 2, name: "Face Mist" },
    ];
    expect(shopOrder(rows).map((p) => p.id)).toEqual([2, 1]);
  });

  it("does not mutate the list it was handed", () => {
    const rows = [{ id: 3, heroOrder: 2 }, { id: 5, heroOrder: 1 }];
    shopOrder(rows);
    expect(rows.map((p) => p.id)).toEqual([3, 5]);
  });

  it("is empty rather than undefined when there is nothing to list", () => {
    expect(shopOrder(null)).toEqual([]);
    expect(shopOrder([null, undefined])).toEqual([]);
  });
});

describe("productCountLabel", () => {
  it("does not misspell one", () => {
    expect(productCountLabel(1)).toBe("1 product");
    expect(productCountLabel(8)).toBe("8 products");
    expect(productCountLabel(0)).toBe("0 products");
  });

  it("never prints NaN into the page's lede", () => {
    expect(productCountLabel(undefined)).toBe("0 products");
    expect(productCountLabel(-3)).toBe("0 products");
  });
});
