import { parseBlocks, renderInline } from "./contentBlocks";

// =============================================================================
// contentBlocks — the markdown-lite parser behind every admin-authored page
// =============================================================================
// The parser is the only thing standing between a store owner's textarea and
// the rendered page, so its grammar is pinned here rather than discovered by
// looking at a page. Six cases, one per rule group.
// =============================================================================

describe("parseBlocks", () => {
  it("reads headings and joins wrapped prose until a blank line", () => {
    const blocks = parseBlocks(
      [
        "## Rooted in Assam",
        "### The co-operative",
        "Farmer-owned, and every rupee",
        "returns to the people who grew it.",
        "",
        "A second paragraph.",
      ].join("\n")
    );

    expect(blocks).toEqual([
      { type: "h2", text: "Rooted in Assam" },
      { type: "h3", text: "The co-operative" },
      {
        type: "p",
        text: "Farmer-owned, and every rupee returns to the people who grew it.",
      },
      { type: "p", text: "A second paragraph." },
    ]);
  });

  it("collects unordered and ordered items into their own lists", () => {
    const blocks = parseBlocks(
      ["- Cleanse", "- Treat", "", "1. Morning", "2. Evening"].join("\n")
    );

    expect(blocks).toEqual([
      { type: "ul", items: ["Cleanse", "Treat"] },
      { type: "ol", items: ["Morning", "Evening"] },
    ]);
  });

  it("joins consecutive quote lines and recognises a rule", () => {
    const blocks = parseBlocks(
      ["> Skincare that pays", "> the farmer first.", "", "---", "", "After."].join("\n")
    );

    expect(blocks).toEqual([
      { type: "quote", text: "Skincare that pays the farmer first." },
      { type: "hr" },
      { type: "p", text: "After." },
    ]);
  });

  it("reads a ::callout fence as a title plus inner paragraphs", () => {
    const blocks = parseBlocks(
      [
        "::callout Patch test first",
        "Apply to the inner arm.",
        "",
        "Wait twenty-four hours.",
        "::",
        "Back to prose.",
      ].join("\n")
    );

    expect(blocks).toEqual([
      {
        type: "callout",
        title: "Patch test first",
        items: ["Apply to the inner arm.", "Wait twenty-four hours."],
      },
      { type: "p", text: "Back to prose." },
    ]);
  });

  it("reads a ::steps fence, with or without list prefixes, and survives a missing close", () => {
    const blocks = parseBlocks(
      ["::steps", "- Sow the seed", "2. Harvest", "Formulate"].join("\n")
    );

    expect(blocks).toEqual([
      { type: "steps", items: ["Sow the seed", "Harvest", "Formulate"] },
    ]);
  });
});

describe("renderInline", () => {
  it("emits bold and safe links as elements, and an unsafe link as its own source text", () => {
    const nodes = renderInline(
      "Read the [policy](/policies/refunds) — **farmer-owned** — [bad](javascript:x)"
    );

    const link = nodes.find((node) => node?.type === "a");
    expect(link.props.href).toBe("/policies/refunds");
    // No `rel` on an internal link; it is not leaving the site.
    expect(link.props.rel).toBeUndefined();

    const bold = nodes.find((node) => node?.type === "strong");
    expect(bold.props.children).toBe("farmer-owned");

    // The unsafe href never reaches an element: it survives only as plain text.
    expect(nodes.filter((node) => node?.type === "a")).toHaveLength(1);
    expect(nodes.filter((node) => typeof node === "string").join("")).toContain(
      "[bad](javascript:x)"
    );
  });

  it("marks an off-site link noreferrer and returns null for empty input", () => {
    const [node] = renderInline("[Assam](https://example.org/assam)");
    expect(node.props.rel).toBe("noreferrer");
    expect(renderInline("")).toBeNull();
  });
});
