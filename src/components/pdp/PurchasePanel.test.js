// The purchase panel's and the chapter stack's pure rules, pinned down here
// rather than by clicking through eight products and reading a stock line.
//
// `services/api` is mocked because importing anything that reaches the page
// would otherwise build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import { ritualStepLabel, stockLabel } from "./PurchasePanel";
import { chapterHeadingId, chapterNumeral } from "./Chapter";
import { hasDeliveryEstimate } from "../storefront/DeliveryReturnsInfo";
import { productSeoTitle } from "../../pages/ProductDetails/ProductDetails";
import { hidesBottomNav } from "../BottomNav/BottomNav";

describe("stockLabel", () => {
  it("says out of stock before anything else", () => {
    expect(
      stockLabel({ hasStockInfo: true, isOutOfStock: true, isLowStock: true, stock: 0 })
    ).toBe("Out of stock");
  });

  it("counts down only when the product's own threshold says it is low", () => {
    expect(
      stockLabel({ hasStockInfo: true, isOutOfStock: false, isLowStock: true, stock: 3 })
    ).toBe("Only 3 left");
    expect(
      stockLabel({ hasStockInfo: true, isOutOfStock: false, isLowStock: false, stock: 90 })
    ).toBe("In stock");
  });

  // A product nobody has counted claims nothing: the quantity stepper still
  // works (capped at STOCK_UNKNOWN_MAX), the line simply is not printed.
  it("is silent when the stock is unknown", () => {
    expect(stockLabel({ hasStockInfo: false })).toBe("");
  });

  // "In stock" beside a button that says "Coming soon" is two answers to one
  // question — and neither is about anything a shopper can buy yet.
  it("is silent for a product with no price yet, whatever its stock", () => {
    expect(
      stockLabel({ hasStockInfo: true, isOutOfStock: false, isLowStock: false, stock: 90, comingSoon: true })
    ).toBe("");
    expect(
      stockLabel({ hasStockInfo: true, isOutOfStock: true, stock: 0, comingSoon: true })
    ).toBe("");
  });
});

describe("ritualStepLabel", () => {
  it("pads the numeral so the eyebrow keeps one shape down the range", () => {
    expect(ritualStepLabel({ ritualStep: { order: 1, label: "Cleanse" } })).toBe(
      "01 — Cleanse"
    );
    expect(ritualStepLabel({ ritualStep: { order: 5, label: "Moisturise" } })).toBe(
      "05 — Moisturise"
    );
  });

  it("prints the label alone when there is no usable order", () => {
    expect(ritualStepLabel({ ritualStep: { label: "Treat" } })).toBe("Treat");
    expect(ritualStepLabel({ ritualStep: { order: 0, label: "Treat" } })).toBe("Treat");
  });

  it("is empty for a product with no ritual step", () => {
    expect(ritualStepLabel({})).toBe("");
    expect(ritualStepLabel(null)).toBe("");
  });
});

describe("Chapter ids", () => {
  it("numbers chapters from 01, so the eyebrow reads as a book", () => {
    expect(chapterNumeral(0)).toBe("01");
    expect(chapterNumeral(9)).toBe("10");
  });

  // ChapterNav links to the SECTION id and the section is labelled by its
  // heading; the two ids have to be derivable from one another.
  it("derives the heading id from the chapter id", () => {
    expect(chapterHeadingId("overview")).toBe("overview-title");
  });
});

describe("hasDeliveryEstimate", () => {
  // A method with a zero flat rate and no ETA is not "Free · same day", it is
  // an unconfigured row — and the seeded LAMIKAA method is exactly that.
  it("keeps a method off the panel until its delivery time is known", () => {
    expect(hasDeliveryEstimate({ name: "Standard", estimatedDays: "" })).toBe(false);
    expect(hasDeliveryEstimate({ name: "Standard", estimatedDays: "   " })).toBe(false);
    expect(hasDeliveryEstimate({ name: "Standard" })).toBe(false);
    expect(hasDeliveryEstimate(null)).toBe(false);
  });

  it("prints one that carries an estimate, same day included", () => {
    expect(hasDeliveryEstimate({ estimatedDays: "3-5" })).toBe(true);
    expect(hasDeliveryEstimate({ estimatedDays: "0" })).toBe(true);
  });
});

describe("productSeoTitle", () => {
  // useSeo owns the "%s · LAMIKAA NATURALS" template and the seed's metaTitle
  // is a WHOLE title, so the suffix has to come off or the brand prints twice.
  it("strips a brand suffix the admin's override already carries", () => {
    expect(
      productSeoTitle({ name: "Black Rice Face Wash", metaTitle: "Black Rice Face Wash · LAMIKAA NATURALS" })
    ).toBe("Black Rice Face Wash");
  });

  it("passes an override that does not carry it through untouched", () => {
    expect(
      productSeoTitle({ name: "Black Rice Face Wash", metaTitle: "Gentle black rice cleanser" })
    ).toBe("Gentle black rice cleanser");
  });

  it("falls back to the product's own name", () => {
    expect(productSeoTitle({ name: "Black Rice Face Mist" })).toBe("Black Rice Face Mist");
    expect(productSeoTitle({ name: "Black Rice Face Mist", metaTitle: "   " })).toBe(
      "Black Rice Face Mist"
    );
  });
});

describe("hidesBottomNav", () => {
  // The PDP grows its own sticky purchase bar below 769px; two stacked bars
  // take 128px off a 640px screen.
  it("stands the tab bar down on a product page and nowhere else", () => {
    expect(hidesBottomNav("/product/black-rice-face-wash")).toBe(true);
    expect(hidesBottomNav("/shop")).toBe(false);
    expect(hidesBottomNav("/products")).toBe(false);
    expect(hidesBottomNav("/")).toBe(false);
    expect(hidesBottomNav(undefined)).toBe(false);
  });
});
