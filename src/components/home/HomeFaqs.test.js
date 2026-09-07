// =============================================================================
// HomeFaqs — the two decisions the section makes on its own
// =============================================================================
// Everything else in the band is furniture (a heading, a button) or borrowed
// (the accordion is `FAQ`, tested next door). What is this file's own is WHICH
// rows it asks for and WHEN it declines to render at all.
//
// `services/api` is mocked because the ui barrel builds a real axios client on
// import; nothing here calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomeFaqs, { HOME_FAQ_LIMIT, HOME_FAQ_MINIMUM } from "./HomeFaqs";
import { faqsForPlacement } from "../../utils/faqs";

// The store has no figures to quote, so `fillCopy` is identity here — the
// token-stripping half is FAQ's own test.
jest.mock("../../context/StoreSettingsContext", () => ({
  __esModule: true,
  useStoreSettings: () => ({ fillCopy: (text) => text }),
}));

// The real selector over a collection the test controls, so "limited to 8" is
// asserted against the code the storefront actually runs. The name has to start
// with `mock` for jest to let the factory close over it.
let mockCollection = [];
jest.mock("../../context/FaqContext", () => {
  const { faqsForPlacement } = jest.requireActual("../../utils/faqs");
  return {
    __esModule: true,
    useFaqs: () => ({
      forPlacement: (placement, options) =>
        faqsForPlacement(mockCollection, placement, options),
    }),
  };
});

const row = (id, over = {}) => ({
  id,
  question: `Question ${id}?`,
  answer: `Answer ${id}.`,
  group: "general",
  placements: ["home", "help", "product"],
  productIds: [],
  isActive: true,
  sortOrder: id,
  ...over,
});

const renderHome = (rows) => {
  mockCollection = rows;
  return render(
    <MemoryRouter>
      <HomeFaqs />
    </MemoryRouter>
  );
};

describe("<HomeFaqs/>", () => {
  it("shows the section's copy over the admin's answers", () => {
    renderHome([row(1), row(2), row(3)]);

    expect(screen.getByText("Good to know")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Questions, answered" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All questions" })).toHaveAttribute(
      "href",
      "/faq"
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("caps the home band at eight answers", () => {
    const rows = Array.from({ length: 12 }, (_, i) => row(i + 1));
    renderHome(rows);
    expect(screen.getAllByRole("button")).toHaveLength(HOME_FAQ_LIMIT);
    // The cap is on the FILTERED list, which is what the selector guarantees.
    expect(
      faqsForPlacement(mockCollection, "home", { limit: HOME_FAQ_LIMIT })
    ).toHaveLength(HOME_FAQ_LIMIT);
  });

  it("takes itself off the page rather than showing a lone drawer", () => {
    const { container, unmount } = renderHome([row(1)]);
    expect(container).toBeEmptyDOMElement();
    expect(HOME_FAQ_MINIMUM).toBe(2);
    unmount();

    const empty = renderHome([]);
    expect(empty.container).toBeEmptyDOMElement();
    empty.unmount();

    // …and rows the placement excludes do not count towards the two.
    const off = renderHome([row(1), row(2, { placements: ["help"] })]);
    expect(off.container).toBeEmptyDOMElement();
  });
});
