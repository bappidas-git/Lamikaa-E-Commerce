// =============================================================================
// Testimonials — the band's three promises
// =============================================================================
//   1. it carries REAL approved reviews, with the writer's own photograph;
//   2. it says nothing when the store has nothing to say;
//   3. it never repeats, on a product page, the reviews printed above it.
//
// `services/api` is mocked: the band reads two collections through it, and the
// point of these tests is what it does with the answers.
jest.mock("../../services/api", () => ({
  __esModule: true,
  default: {
    reviews: { getPublished: jest.fn() },
    products: { getAll: jest.fn() },
  },
}));

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import apiService from "../../services/api";
import Testimonials, { TESTIMONIALS_HEADING, currentProductId } from "./Testimonials";

// jsdom ships none of these and all three are read during a first paint:
// matchMedia by framer-motion's reduced-motion hook, ResizeObserver by the
// rail, and IntersectionObserver by BOTH the band's own "am I near the
// viewport" probe and the cards' reveal. The stub reports "yes, visible" the
// moment it is asked, which is the state every assertion here is about.
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
  global.ResizeObserver =
    global.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

const FACE_WASH = { id: 1, name: "Black Rice Face Wash", slug: "black-rice-face-wash" };
const SERUM = { id: 2, name: "Black Rice Face Serum", slug: "black-rice-face-serum" };

// ONE catalogue for the whole file. The hook memoises the catalogue read for
// the session (it is the half that does not change), so varying it between
// tests would be testing the mock, not the band.
const CATALOGUE = [FACE_WASH, SERUM];

const review = (over = {}) => ({
  id: 1,
  productId: 1,
  userName: "Ritu Bora",
  rating: 5,
  title: "Softer in two weeks",
  body: "It smells of rice and nothing else, which is exactly what I wanted.",
  status: "approved",
  isVerifiedPurchase: true,
  createdAt: "2026-09-01T00:00:00.000Z",
  ...over,
});

// ALWAYS BY ROLE, never by text: the heading sets one word in the signature
// gradient, so it is three nodes in the DOM and a plain text match would find
// nothing — including in the two tests that assert the band is ABSENT, which
// would then pass for the wrong reason.
const heading = (query = "find") => screen[`${query}ByRole`]("heading", { name: TESTIMONIALS_HEADING });

const renderBand = (reviews, route = "/") => {
  apiService.reviews.getPublished.mockResolvedValue(reviews);
  apiService.products.getAll.mockResolvedValue(CATALOGUE);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Testimonials />
    </MemoryRouter>
  );
};

afterEach(() => jest.clearAllMocks());

describe("the band", () => {
  it("prints the quote, the name and the product it is about", async () => {
    renderBand([review()]);

    expect(await heading()).toBeInTheDocument();
    expect(screen.getByText(/It smells of rice/)).toBeInTheDocument();
    expect(screen.getByText("Ritu Bora")).toBeInTheDocument();
    expect(screen.getByText("Softer in two weeks")).toBeInTheDocument();
    expect(screen.getByText("Verified purchase")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Black Rice Face Wash/ })).toHaveAttribute(
      "href",
      "/product/black-rice-face-wash"
    );
  });

  it("shows the customer's own photograph, and their initial when there is none", async () => {
    const { container } = renderBand([
      review({ id: 1, avatar: "https://cdn.example/ritu.jpg" }),
      review({ id: 2, userName: "Pallabi Das", avatar: undefined }),
    ]);

    await heading();
    expect(container.querySelector('img[src="https://cdn.example/ritu.jpg"]')).toBeTruthy();
    // The monogram is the normal state, not a failure state: a review is
    // published with or without a face.
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("says nothing at all when the store has no approved reviews", async () => {
    renderBand([]);

    await waitFor(() => expect(apiService.reviews.getPublished).toHaveBeenCalled());
    expect(heading("query")).not.toBeInTheDocument();
  });

  it("drops a review with no words rather than drawing an empty card", async () => {
    renderBand([review({ body: "" })]);

    await waitFor(() => expect(apiService.reviews.getPublished).toHaveBeenCalled());
    expect(heading("query")).not.toBeInTheDocument();
  });

  it("never repeats, on a product page, the reviews printed above it", async () => {
    renderBand(
      [
        review({ id: 1, productId: 1, body: "The face wash one." }),
        review({ id: 2, productId: 2, userName: "Pallabi Das", body: "The serum one." }),
      ],
      "/product/black-rice-face-wash"
    );

    expect(await screen.findByText("The serum one.")).toBeInTheDocument();
    expect(screen.queryByText("The face wash one.")).not.toBeInTheDocument();
  });
});

describe("currentProductId", () => {
  it("resolves the product page's slug against the catalogue", () => {
    expect(currentProductId("/product/black-rice-face-serum", CATALOGUE)).toBe(2);
    // The legacy numeric URL the PDP still answers on.
    expect(currentProductId("/product/1", CATALOGUE)).toBe(1);
  });

  it("excludes nothing anywhere else, or for a slug nobody has", () => {
    expect(currentProductId("/shop", CATALOGUE)).toBeNull();
    expect(currentProductId("/", CATALOGUE)).toBeNull();
    expect(currentProductId("/product/not-a-product", CATALOGUE)).toBeNull();
    expect(currentProductId("/product/black-rice-face-serum", null)).toBeNull();
  });
});
