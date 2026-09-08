import {
  POLICIES,
  clauseNumeral,
  clauseTitle,
  policyBySlug,
  toClauses,
} from "./PolicyPage";
import { parseBlocks } from "../../utils/contentBlocks";

// =============================================================================
// The document, split into clauses (Prompt 28)
// =============================================================================
// The table of contents, the hanging ordinals and the `#your-account` anchors
// all read the same structure, and all three fail QUIETLY when it is wrong — a
// contents list that points at nothing still renders. These pin it.
// =============================================================================

describe("policyBySlug", () => {
  it("knows exactly four documents", () => {
    expect(POLICIES.map((row) => row.slug)).toEqual([
      "privacy",
      "terms",
      "shipping-returns",
      "cookies",
    ]);
    expect(policyBySlug("shipping-returns").key).toBe("shippingReturns");
  });

  // What makes `/policies/other` a real 404 rather than a blank document.
  it("does not know anything else", () => {
    expect(policyBySlug("other")).toBeNull();
    expect(policyBySlug("")).toBeNull();
    expect(policyBySlug(undefined)).toBeNull();
  });
});

describe("clauseTitle", () => {
  it("takes the author's ordinal off the heading", () => {
    expect(clauseTitle("01. Dispatch")).toBe("Dispatch");
    expect(clauseTitle("2) Your account")).toBe("Your account");
    expect(clauseTitle("10 Governing law")).toBe("Governing law");
  });

  it("leaves a heading that never carried one alone", () => {
    expect(clauseTitle("Pricing, tax and payment")).toBe("Pricing, tax and payment");
    // A title that legitimately opens on a number keeps it: an ordinal is two
    // digits at most, so a year leading a heading is not one.
    expect(clauseTitle("2026 and after")).toBe("2026 and after");
    expect(clauseTitle("100 percent cold-pressed")).toBe("100 percent cold-pressed");
  });
});

describe("clauseNumeral", () => {
  it("pads so a column of numerals lines up on the digit", () => {
    expect(clauseNumeral(0)).toBe("01");
    expect(clauseNumeral(9)).toBe("10");
  });
});

describe("toClauses", () => {
  const body = [
    "A sentence before any heading.",
    "",
    "## 01. Dispatch",
    "",
    "Orders are packed Monday to Saturday.",
    "",
    "## 02. Your account",
    "",
    "You are responsible for what happens under it.",
  ].join("\n");

  it("opens a clause on every h2 and keeps the preamble out of it", () => {
    const { preamble, clauses } = toClauses(parseBlocks(body));
    expect(preamble).toHaveLength(1);
    expect(clauses.map((clause) => clause.title)).toEqual([
      "Dispatch",
      "Your account",
    ]);
    expect(clauses[0].blocks).toHaveLength(1);
  });

  // The whole reason the ordinal is stripped and re-derived: a GENERATED clause
  // has no stored number, and it has to continue the run.
  it("numbers by position, so an appended clause continues the run", () => {
    const { clauses } = toClauses(
      parseBlocks(`${body}\n\n## Pricing, tax and payment\n\nPrices are in rupees.`)
    );
    expect(clauses.map((clause) => clause.number)).toEqual(["01", "02", "03"]);
    expect(clauses[2].title).toBe("Pricing, tax and payment");
  });

  it("gives every clause a unique anchor, even when two share a title", () => {
    const { clauses } = toClauses(parseBlocks("## Contact\n\nA.\n\n## Contact\n\nB."));
    expect(clauses[0].id).toBe("contact");
    expect(clauses[1].id).toBe("contact-02");
  });

  it("survives a document with no headings at all", () => {
    const { preamble, clauses } = toClauses(parseBlocks("Just a paragraph."));
    expect(clauses).toHaveLength(0);
    expect(preamble).toHaveLength(1);
    expect(toClauses(null)).toEqual({ preamble: [], clauses: [] });
  });
});
