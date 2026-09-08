// Prompt 27's decisions are pure functions, so the rules that matter — which
// pack badges may be quoted, which ingredient opens the row, which rituals a
// product belongs to, which two sentences the farmer story prints, and above
// all what the `Product` graph is and is not allowed to claim — are pinned down
// here rather than by reading a rich-results test.
//
// `services/api` is mocked because importing any of these modules would
// otherwise build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({
  __esModule: true,
  default: {},
  resolveRitualSteps: () => [],
}));

import { cautionMarkup, packBadgesToShow } from "./PackClaims";
import { isHeroIngredient, orderedIngredients } from "./IngredientChapter";
import { ritualsWithProduct, stepOrderLabel } from "./HowToUse";
import { farmerStoryLines } from "./FarmerStory";
import { breadcrumbJsonLd, productJsonLd } from "../../utils/seo";

describe("packBadgesToShow", () => {
  it("quotes the roundels the carton actually prints", () => {
    expect(packBadgesToShow(["ISO Certified", "GMP Certified"])).toEqual([
      "ISO Certified",
      "GMP Certified",
    ]);
  });

  // A badge nobody has named is not a badge — it is a token that must never
  // reach a visitor.
  it("drops an unresolved token and anything blank", () => {
    expect(
      packBadgesToShow(["ISO Certified", "{{CERTIFICATIONS}}", "  ", null])
    ).toEqual(["ISO Certified"]);
  });

  it("has nothing to show for a missing list", () => {
    expect(packBadgesToShow(undefined)).toEqual([]);
  });
});

describe("cautionMarkup", () => {
  it("wraps the caution in the shared callout fence", () => {
    expect(cautionMarkup("For external use only.")).toBe(
      "::callout Caution\nFor external use only.\n::"
    );
  });

  // No caution, no heading: a callout with nothing under it is worse than none.
  it("says nothing for a product with no caution", () => {
    expect(cautionMarkup("")).toBe("");
    expect(cautionMarkup("   ")).toBe("");
    expect(cautionMarkup(undefined)).toBe("");
  });
});

describe("orderedIngredients", () => {
  const rows = [
    { name: "Aloe Vera", benefit: "soothing hydration" },
    { name: "Black Rice Extract", benefit: "antioxidant-rich" },
    { name: "Green Tea", benefit: "antioxidant-rich" },
  ];

  it("lifts the hero ingredient to the front", () => {
    expect(orderedIngredients(rows).map((r) => r.name)).toEqual([
      "Black Rice Extract",
      "Aloe Vera",
      "Green Tea",
    ]);
  });

  // A stable partition, not a sort: the admin's order survives around the hero.
  it("keeps the authored order inside each group", () => {
    const many = [{ name: "Neem" }, { name: "Turmeric" }, { name: "Black Rice" }];
    expect(orderedIngredients(many).map((r) => r.name)).toEqual([
      "Black Rice",
      "Neem",
      "Turmeric",
    ]);
  });

  it("drops a row that has no name to print", () => {
    expect(orderedIngredients([{ benefit: "nothing" }, { name: "  " }])).toEqual([]);
    expect(orderedIngredients(null)).toEqual([]);
  });

  it("recognises the hero however the seed spells it", () => {
    expect(isHeroIngredient("Black Rice")).toBe(true);
    expect(isHeroIngredient("black rice bran oil")).toBe(true);
    expect(isHeroIngredient("Rice Bran")).toBe(false);
  });
});

describe("ritualsWithProduct", () => {
  const rituals = [
    { id: 1, steps: [{ productId: 1 }, { productId: 5 }] },
    { id: 2, steps: [{ productId: 3, alternativeProductId: 2 }] },
    { id: 3, steps: [] },
  ];

  it("finds a ritual that names the product as a step", () => {
    expect(ritualsWithProduct(rituals, 5).map((r) => r.id)).toEqual([1]);
  });

  // The soap and the body wash are both step one of the body ritual: an
  // alternative is a membership, not a footnote.
  it("counts a step's alternative too", () => {
    expect(ritualsWithProduct(rituals, 2).map((r) => r.id)).toEqual([2]);
  });

  it("matches across the string/number boundary the api leaves behind", () => {
    expect(ritualsWithProduct(rituals, "1").map((r) => r.id)).toEqual([1]);
  });

  it("answers nothing for a product in no routine, or no product at all", () => {
    expect(ritualsWithProduct(rituals, 99)).toEqual([]);
    expect(ritualsWithProduct(rituals, undefined)).toEqual([]);
    expect(ritualsWithProduct(null, 1)).toEqual([]);
  });

  it("numbers a ritual step, and only a real one", () => {
    expect(stepOrderLabel(1)).toBe("Step 01");
    expect(stepOrderLabel(12)).toBe("Step 12");
    expect(stepOrderLabel(0)).toBe("");
    expect(stepOrderLabel(undefined)).toBe("");
  });
});

describe("farmerStoryLines", () => {
  // The seeded pair, near-verbatim: the teaser's first paragraph IS the lede
  // with "(FPC)" dropped, so printing both would give the chapter a stutter.
  const about = {
    lede:
      "LAMIKAA Naturals is a farmer-owned beauty brand of Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL), a Farmer Producer Company (FPC) established to create greater value and better opportunities for farmers.",
  };
  const home = {
    aboutTeaser: {
      text:
        "LAMIKAA Naturals is a farmer-owned beauty brand of Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL), a Farmer Producer Company established to create greater value and better opportunities for farmers.\n\nRooted in the indigenous knowledge and rich natural heritage of Assam and Northeast India, we combine traditional wisdom with modern cosmetic science.",
    },
  };

  it("skips the paragraph that restates the lede and takes the next", () => {
    const lines = farmerStoryLines(about, home);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe(about.lede);
    expect(lines[1]).toMatch(/^Rooted in the indigenous knowledge/);
  });

  it("prints the lede alone when the teaser only repeats it", () => {
    const onlyEcho = { aboutTeaser: { text: home.aboutTeaser.text.split("\n\n")[0] } };
    expect(farmerStoryLines(about, onlyEcho)).toEqual([about.lede]);
  });

  it("falls back to the teaser when there is no lede", () => {
    expect(farmerStoryLines(null, home)).toEqual([
      home.aboutTeaser.text.split("\n\n")[0],
    ]);
  });

  it("prints nothing when siteContent could not be read", () => {
    expect(farmerStoryLines(null, null)).toEqual([]);
  });
});

describe("productJsonLd", () => {
  const origin = window.location.origin;
  const priced = {
    id: 1,
    slug: "black-rice-face-wash",
    name: "Black Rice Face Wash",
    sku: "LK-BR-FW-001",
    promise: "A gentle daily cleanse.",
    price: 390,
    currency: "INR",
    stock: 100,
    rating: 0,
    totalReviews: 0,
    images: ["https://example.test/face-wash.jpg"],
  };

  it("describes the product and offers it at its real price", () => {
    const graph = productJsonLd(priced, { category: "Face Care" });
    expect(graph["@type"]).toBe("Product");
    expect(graph.name).toBe("Black Rice Face Wash");
    expect(graph.sku).toBe("LK-BR-FW-001");
    expect(graph.category).toBe("Face Care");
    expect(graph.brand).toEqual({ "@type": "Brand", name: "LAMIKAA Naturals" });
    expect(graph.offers).toEqual({
      "@type": "Offer",
      priceCurrency: "INR",
      price: 390,
      availability: "https://schema.org/InStock",
      url: `${origin}/product/black-rice-face-wash`,
      itemCondition: "https://schema.org/NewCondition",
    });
  });

  // Five of the eight products ship before their MRP is set. An Offer at ₹0 is
  // a lie a search engine will print in a result card.
  it("publishes no offer for a product whose price is not set yet", () => {
    const graph = productJsonLd({ ...priced, price: null, priceTBA: true });
    expect(graph.offers).toBeUndefined();
  });

  it("says out of stock only when the count says so", () => {
    expect(productJsonLd({ ...priced, stock: 0 }).offers.availability).toBe(
      "https://schema.org/OutOfStock"
    );
    // Nobody counted this one: neither claim is available to make.
    expect(
      productJsonLd({ ...priced, stock: null }).offers.availability
    ).toBeUndefined();
  });

  // Every product is at zero reviews and the sample rows are hidden, so this
  // key must be absent from all eight graphs on a fresh install.
  it("publishes no rating until a real one exists", () => {
    expect(productJsonLd(priced).aggregateRating).toBeUndefined();
    expect(
      productJsonLd(priced, { rating: 4.5, ratingCount: 0 }).aggregateRating
    ).toBeUndefined();
    expect(
      productJsonLd(priced, { rating: 0, ratingCount: 3 }).aggregateRating
    ).toBeUndefined();
  });

  it("publishes the page's own blended average, rounded the way the page prints it", () => {
    expect(
      productJsonLd(priced, { rating: 4.666666667, ratingCount: 3 }).aggregateRating
    ).toEqual({ "@type": "AggregateRating", ratingValue: 4.7, reviewCount: 3 });
  });

  it("leads the image list with the stage image", () => {
    const graph = productJsonLd(priced);
    expect(graph.image[0]).toContain("face-wash.jpg");
    // Deduped — the stage image IS a gallery row for a product with no crop.
    expect(graph.image).toHaveLength(1);
  });

  it("has nothing to say about no product", () => {
    expect(productJsonLd(null)).toBeNull();
  });
});

describe("breadcrumbJsonLd", () => {
  const origin = window.location.origin;

  // The PDP hands it the same `{ label, to }` array the visible trail draws;
  // a caller with nothing to draw may speak schema.org's own words instead.
  it("accepts both the trail's vocabulary and schema.org's", () => {
    const fromTrail = breadcrumbJsonLd([
      { label: "Home", to: "/" },
      { label: "Black Rice Face Wash" },
    ]);
    const fromGraph = breadcrumbJsonLd([
      { name: "Home", url: "/" },
      { name: "Black Rice Face Wash" },
    ]);
    expect(fromTrail).toEqual(fromGraph);
    expect(fromTrail.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: "Black Rice Face Wash" },
    ]);
  });
});
