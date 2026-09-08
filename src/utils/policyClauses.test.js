import {
  codClause,
  currencyName,
  returnsClause,
  shippingMethodsBlock,
  taxClause,
  termsPricingBlock,
} from "./policyClauses";
import { faqPageJsonLd } from "./seo";
import { parseBlocks } from "./contentBlocks";

// =============================================================================
// The clauses a policy cannot be written down in advance (Prompt 28)
// =============================================================================
// The old Terms page STATED three rupee shipping rates, a 0% tax treatment it
// did not run and a jurisdiction from another company. These builders exist so
// that cannot happen again — which is only true while they keep answering "" to
// a question the store cannot answer. That is what most of this file pins.
// =============================================================================

describe("currencyName", () => {
  it("drops the bracketed symbol the label carries", () => {
    expect(currencyName("INR")).toBe("Indian Rupee");
    expect(currencyName("GBP")).toBe("British Pound");
  });

  it("falls back to the code itself, which is still true", () => {
    expect(currencyName("XYZ")).toBe("XYZ");
    expect(currencyName(undefined)).toBe("");
  });
});

describe("taxClause", () => {
  // The LAMIKAA case: the packs print "M.R.P (incl. of all taxes)" and no rate
  // has been supplied, so the clause must not claim a 0% rate.
  it("says 'all taxes' for a tax-inclusive store with no rate", () => {
    const clause = taxClause({
      currency: "INR",
      currencySymbol: "₹",
      taxRate: 0,
      taxIncluded: true,
    });
    expect(clause).toContain("Indian Rupee (₹)");
    expect(clause).toContain("inclusive of all taxes");
    expect(clause).not.toContain("0%");
  });

  it("states the rate when there is one", () => {
    expect(
      taxClause({ currency: "INR", currencySymbol: "₹", taxRate: 18, taxIncluded: true })
    ).toContain("inclusive of 18% tax");
    expect(
      taxClause({ currency: "INR", currencySymbol: "₹", taxRate: 18, taxIncluded: false })
    ).toContain("exclusive of 18% tax");
  });

  it("never promises a tax line it cannot break out", () => {
    const clause = taxClause({ currency: "INR", currencySymbol: "₹", taxIncluded: false });
    expect(clause).not.toContain("%");
    expect(clause).toContain("calculated at checkout");
  });
});

describe("codClause", () => {
  it("has three shapes, and the ceiling is the store's own", () => {
    expect(codClause({ codEnabled: false })).toBe(
      "Cash on delivery is not currently offered."
    );
    expect(codClause({ codEnabled: true, codMaxOrder: 5000 })).toContain("5,000");
    expect(codClause({ codEnabled: true, codMaxOrder: null })).toContain(
      "Cash on delivery is available"
    );
  });

  it("treats a zero ceiling as no ceiling rather than as a limit of zero", () => {
    expect(codClause({ codEnabled: true, codMaxOrder: 0 })).not.toContain("0");
  });
});

describe("returnsClause", () => {
  it("states the window the rest of the storefront reads", () => {
    expect(returnsClause(7)).toContain("within 7 days");
  });

  it("writes nothing at all where no window is advertised", () => {
    expect(returnsClause(0)).toBe("");
    expect(returnsClause(null)).toBe("");
  });
});

describe("termsPricingBlock", () => {
  const store = { currency: "INR", currencySymbol: "₹", taxRate: 0, taxIncluded: true };

  it("is markdown-lite the shared renderer understands", () => {
    const blocks = parseBlocks(
      termsPricingBlock({ store, payment: { codEnabled: true }, returnWindowDays: 7 })
    );
    expect(blocks[0]).toEqual({ type: "h2", text: "Pricing, tax and payment" });
    expect(blocks.filter((block) => block.type === "p")).toHaveLength(3);
  });

  it("keeps its heading when only some of the clauses can be stated", () => {
    const blocks = parseBlocks(
      termsPricingBlock({ store, payment: { codEnabled: false }, returnWindowDays: 0 })
    );
    expect(blocks[0].type).toBe("h2");
    expect(blocks.filter((block) => block.type === "p")).toHaveLength(2);
  });
});

describe("shippingMethodsBlock", () => {
  it("lists the live methods and nothing else", () => {
    const text = shippingMethodsBlock([
      {
        name: "Standard Delivery",
        description: "Delivery time and charges will be confirmed before launch.",
        estimatedDays: "",
        flatRate: 0,
        freeAbove: null,
      },
      { name: "Express", description: "", estimatedDays: "2-3 business days" },
    ]);
    expect(text).toContain("**Standard Delivery**");
    expect(text).toContain("Estimated delivery: 2-3 business days.");
  });

  // The one rule the old Terms page broke: three rupee rates typed into JSX.
  it("never prints a rate, even when the method carries one", () => {
    const text = shippingMethodsBlock([
      { name: "Express", description: "Fast.", flatRate: 199, freeAbove: 4999 },
    ]);
    expect(text).not.toContain("199");
    expect(text).not.toContain("4999");
  });

  it("renders no clause at all when no method is active", () => {
    expect(shippingMethodsBlock([])).toBe("");
    expect(shippingMethodsBlock(null)).toBe("");
    expect(shippingMethodsBlock([{ name: "" }])).toBe("");
  });
});

describe("faqPageJsonLd", () => {
  it("publishes one Question per answered row", () => {
    const graph = faqPageJsonLd([
      { question: "Who owns LAMIKAA Naturals?", answer: "A Farmer Producer Company." },
    ]);
    expect(graph["@type"]).toBe("FAQPage");
    expect(graph.mainEntity).toHaveLength(1);
    expect(graph.mainEntity[0].acceptedAnswer).toEqual({
      "@type": "Answer",
      text: "A Farmer Producer Company.",
    });
  });

  // A row whose every sentence quoted an unsupplied fact reaches this with an
  // empty answer. An empty `acceptedAnswer` is an invalid entity, not an empty
  // one — and publishing the question alone would be a question the page does
  // not answer.
  it("drops a row with nothing publishable left in it", () => {
    expect(faqPageJsonLd([{ question: "How long does dispatch take?", answer: "" }])).toBeNull();
    expect(faqPageJsonLd([{ question: "", answer: "Something." }])).toBeNull();
    expect(faqPageJsonLd([])).toBeNull();
  });
});
