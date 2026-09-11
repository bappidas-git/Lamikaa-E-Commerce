// The card's three copy decisions are pure functions, so the rules that matter —
// what a ritual step reads as, how a concern SLUG becomes a label, and when a
// plate is allowed to offer a srcset — are pinned down here rather than by
// clicking through eight grids.
//
// `services/api` is mocked because importing the component would otherwise build
// a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import { concernLabel, plateSources, stepLabel } from "./ProductCard";
import { normalizeProduct } from "../../utils/product";
import brand from "../../config/brand";

const COVER =
  "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Black-Rice-Face-Wash-Cover.jpg";

const catalogueProduct = () =>
  normalizeProduct({
    id: 1,
    name: "Black Rice Face Wash",
    ritualStep: { order: 1, label: "Cleanse" },
    concerns: ["cleansing", "even-tone"],
    price: 390,
    media: [
      {
        type: "image",
        url: COVER,
        alt: "label",
        primary: true,
        crop: { x: 1050, y: 100, w: 1500, h: 3200 },
      },
    ],
  });

// What the wishlist stores: a flat snapshot with one plain `image` and none of
// the editorial fields.
const wishlistSnapshot = () =>
  normalizeProduct({
    id: 1,
    productId: 1,
    name: "Black Rice Face Wash",
    image: "https://picsum.photos/seed/x/1200/1500",
    price: 390,
  });

describe("stepLabel", () => {
  it("pads the order and keeps the merchant's own label", () => {
    expect(stepLabel(catalogueProduct())).toEqual({ numeral: "01", label: "Cleanse" });
  });

  it("keeps a label that has no order, and pads nothing", () => {
    expect(stepLabel({ ritualStep: { label: "Polish" } })).toEqual({
      numeral: null,
      label: "Polish",
    });
  });

  it("is null for a product with no step, so the eyebrow row is not drawn", () => {
    expect(stepLabel({ ritualStep: null })).toBeNull();
    expect(stepLabel({ ritualStep: { order: 2 } })).toBeNull();
    expect(stepLabel(undefined)).toBeNull();
  });
});

describe("concernLabel", () => {
  it("matches the seeded concern names exactly", () => {
    expect(concernLabel("cleansing")).toBe("Cleansing");
    expect(concernLabel("even-tone")).toBe("Even tone");
    expect(concernLabel("nourishing")).toBe("Nourishing");
  });

  it("returns an empty string rather than printing a slug it cannot read", () => {
    expect(concernLabel("")).toBe("");
    expect(concernLabel(null)).toBe("");
  });
});

describe("plateSources", () => {
  // The fixture's cover still carries a legacy source-pixel crop; the card must
  // deliver the WHOLE pack regardless, padded onto its own sampled ground.
  it("pads the whole pack to the plate and offers the card's four widths", () => {
    const { src, srcSet } = plateSources(catalogueProduct());
    expect(src).not.toContain("c_crop");
    expect(src).toContain("c_pad,ar_1:1");
    expect(src).toContain("w_640");
    expect(srcSet).not.toContain("c_crop");
    expect(srcSet.split(", ")).toHaveLength(4);
    expect(srcSet).toContain(" 320w");
    expect(srcSet).toContain(" 900w");
  });

  it("offers NO srcset for a non-Cloudinary URL — four identical candidates is a lie", () => {
    const { src, srcSet } = plateSources(wishlistSnapshot());
    expect(src).toBe("https://picsum.photos/seed/x/1200/1500");
    expect(srcSet).toBeUndefined();
  });

  it("falls back to the inline placeholder when a product has no media at all", () => {
    const { src, srcSet } = plateSources(normalizeProduct({ id: 9, name: "Unphotographed" }));
    expect(src.startsWith("data:image/svg+xml")).toBe(true);
    expect(srcSet).toBeUndefined();
  });
});

describe("badges are the owner's, never the component's", () => {
  it("defaults a record with no badges to brand.trustBadges", () => {
    expect(normalizeProduct({ id: 1, name: "X" }).badges).toEqual(brand.trustBadges);
  });

  it("keeps a product's own badges when it carries them", () => {
    expect(normalizeProduct({ id: 1, name: "X", badges: ["Only this"] }).badges).toEqual([
      "Only this",
    ]);
  });
});
