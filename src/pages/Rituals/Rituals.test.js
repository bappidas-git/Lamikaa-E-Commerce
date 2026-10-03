// =============================================================================
// /rituals — how a ritual collection opens
// =============================================================================
//   1. a routine filed under a ritual sub-category is listed in that
//      collection's section, under an h2 that names the collection, and the
//      routine's own name drops to h3 beneath it;
//   2. the heading carries the count and the admin's description, and a blank
//      description leaves no empty paragraph behind;
//   3. the section is the target of /rituals#<slug>.
//
// `services/api` is mocked: the page reads three collections through it, and the
// point of these tests is what it does with the answers.
jest.mock("../../services/api", () => ({
  __esModule: true,
  default: {
    rituals: { getAll: jest.fn() },
    products: { getAll: jest.fn() },
    categories: { getAll: jest.fn() },
  },
  resolveRitualSteps: () => [],
}));

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import apiService from "../../services/api";
import Rituals, { ritualCountLabel } from "./Rituals";

// jsdom ships neither: matchMedia is read by framer-motion's reduced-motion
// hook, IntersectionObserver by the in-view reveals. The stub reports "visible"
// the moment it is asked, which is the state every assertion here is about.
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

const ROOT = { id: 7, name: "Rituals", slug: "rituals", kind: "rituals", parentId: null };
const WEEKEND = {
  id: 8,
  name: "Weekend Rituals",
  slug: "weekend",
  kind: "rituals",
  parentId: 7,
  description: "Slower routines for the days you have time.",
};

const ritual = (id, name, categoryId = null) => ({
  id,
  name,
  slug: `ritual-${id}`,
  categoryId,
  steps: [],
});

const renderPage = ({ rituals, categories }) => {
  apiService.rituals.getAll.mockResolvedValue(rituals);
  apiService.products.getAll.mockResolvedValue([]);
  apiService.categories.getAll.mockResolvedValue(categories);
  return render(
    <MemoryRouter initialEntries={["/rituals"]}>
      <Rituals />
    </MemoryRouter>
  );
};

describe("ritualCountLabel", () => {
  it("reads '3 rituals'", () => {
    expect(ritualCountLabel(3)).toBe("3 rituals");
  });

  it("does not misspell one", () => {
    expect(ritualCountLabel(1)).toBe("1 ritual");
  });

  it("treats nonsense as none", () => {
    expect(ritualCountLabel(undefined)).toBe("0 rituals");
    expect(ritualCountLabel(-2)).toBe("0 rituals");
  });
});

describe("a ritual collection", () => {
  it("opens on an h2 that names it, with its routines as h3 beneath", async () => {
    renderPage({
      rituals: [
        ritual(1, "The Morning Glow Ritual"),
        ritual(2, "The Evening Renewal Ritual", 8),
        ritual(3, "The Weekend Mask", 8),
      ],
      categories: [ROOT, WEEKEND],
    });

    const section = await screen.findByRole("region", { name: "Weekend Rituals" });
    expect(section).toHaveAttribute("id", "weekend");
    expect(
      within(section).getByRole("heading", { level: 2, name: "Weekend Rituals" })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", { level: 3, name: "The Evening Renewal Ritual" })
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("heading", { level: 3, name: "The Weekend Mask" })
    ).toBeInTheDocument();

    // The routine filed under the root opens the page, outside any collection.
    expect(within(section).queryByText("The Morning Glow Ritual")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "The Morning Glow Ritual" })
    ).toBeInTheDocument();
  });

  it("carries the count and the admin's description", async () => {
    renderPage({
      rituals: [ritual(2, "The Evening Renewal Ritual", 8), ritual(3, "The Weekend Mask", 8)],
      categories: [ROOT, WEEKEND],
    });

    const section = await screen.findByRole("region", { name: "Weekend Rituals" });
    expect(within(section).getByText("Collection")).toBeInTheDocument();
    expect(within(section).getByText("2 rituals")).toBeInTheDocument();
    expect(
      within(section).getByText("Slower routines for the days you have time.")
    ).toBeInTheDocument();
  });

  it("leaves no empty paragraph behind for a blank description", async () => {
    renderPage({
      rituals: [ritual(2, "The Evening Renewal Ritual", 8)],
      categories: [ROOT, { ...WEEKEND, description: "   " }],
    });

    const section = await screen.findByRole("region", { name: "Weekend Rituals" });
    // Every paragraph in the head, blank ones included: the eyebrow and the
    // count, and no third, empty, line.
    const lines = within(section).getAllByText((_, element) =>
      element.matches("header p")
    );
    expect(lines.map((line) => line.textContent)).toEqual(["Collection", "1 ritual"]);
  });
});
