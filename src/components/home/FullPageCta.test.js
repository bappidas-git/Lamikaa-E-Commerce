// Prompt 19's two copy decisions are pure functions, so the rules that matter —
// which glyphs of the first line carry the signature gradient, and what the
// full-page CTA says when the CMS has nothing to say — are pinned down here
// rather than by scrolling the home page. The render tests at the bottom are
// the regression for the bug that held the headline to three lines: a line
// added in Admin → Content was saved and never reached the page.
//
// `services/api` is mocked because importing the component would otherwise
// build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FullPageCta, { ctaCopy, headlineLength, splitOnWord } from "./FullPageCta";
import brand from "../../config/brand";

// jsdom ships neither: matchMedia is read by framer-motion's reduced-motion
// hook, IntersectionObserver by the card's in-view reveal. The stub reports
// "visible" the moment it is asked.
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    ((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
  global.IntersectionObserver =
    global.IntersectionObserver ||
    class {
      constructor(callback) {
        this.callback = callback;
      }
      observe(target) {
        this.callback([{ isIntersecting: true, intersectionRatio: 1, target }], this);
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
});

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

  it("prints every line the owner publishes, in their order", () => {
    expect(ctaCopy({ lines: ["a", "b", "c", "d"] }).lines).toEqual(["a", "b", "c", "d"]);
    expect(ctaCopy({ lines: ["1", "2", "3", "4", "5", "6", "7"] }).lines).toHaveLength(7);
  });

  it("ignores blank lines rather than printing them, and trims the rest", () => {
    expect(ctaCopy({ lines: ["  One. ", "   ", "", "Two.\n", null] }).lines).toEqual([
      "One.",
      "Two.",
    ]);
    expect(ctaCopy({ lines: ["   ", ""] }).lines).toEqual(
      brand.signatureLines.slice(0, 3)
    );
  });
});

describe("headlineLength", () => {
  it("sets up to three lines at the display size and a longer headline smaller", () => {
    expect([1, 2, 3].map(headlineLength)).toEqual(["standard", "standard", "standard"]);
    expect([4, 5].map(headlineLength)).toEqual(["long", "long"]);
    expect([6, 8, 12].map(headlineLength)).toEqual(["longer", "longer", "longer"]);
  });
});

describe("FullPageCta", () => {
  const renderCta = (content) =>
    render(
      <MemoryRouter>
        <FullPageCta content={content} />
      </MemoryRouter>
    );

  const headlineLines = () =>
    Array.from(screen.getByRole("heading", { level: 2 }).children).map(
      (line) => line.textContent
    );

  // The record from the bug report: the three seeded lines and the fourth the
  // owner added in Admin → Content, which the old code cut.
  it("prints a line the owner added after the seeded three", () => {
    const lines = [...brand.signatureLines.slice(0, 3), "acchaa"];
    renderCta({ lines, primaryLabel: "Shop the Black Rice Range", primaryTo: "/shop" });

    expect(headlineLines()).toEqual(lines);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("data-length", "long");
  });

  it("keeps the gradient on the first line's keyword, whatever follows it", () => {
    const { container } = renderCta({ lines: [...brand.signatureLines] });

    const gradient = container.querySelectorAll(".sf-gradient-text");
    expect(gradient).toHaveLength(1);
    expect(gradient[0]).toHaveTextContent(/^value$/);
  });

  it("sets the brand's own triplet at the display size", () => {
    renderCta(null);

    expect(headlineLines()).toEqual(brand.signatureLines.slice(0, 3));
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("data-length", "standard");
  });
});
