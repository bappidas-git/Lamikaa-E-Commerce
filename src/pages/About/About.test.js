import { aboutCopy, splitAtChain } from "./About";

// =============================================================================
// The story, broken around the value chain (Prompt 28)
// =============================================================================
// The About body is rendered in RUNS so the `::steps` fence can be drawn by
// `ValueChain` rather than by the generic stepper. A split that loses a block,
// emits an empty run or drops the chain shows up as missing copy, not as an
// error, so it is asserted here.
// =============================================================================

describe("splitAtChain", () => {
  it("returns one run for a body with no fence", () => {
    const runs = splitAtChain("One paragraph.\n\nAnd another.");
    expect(runs).toHaveLength(1);
    expect(runs[0].kind).toBe("blocks");
    expect(runs[0].blocks).toHaveLength(2);
  });

  it("breaks the body at the fence and keeps the steps in order", () => {
    const runs = splitAtChain(
      [
        "Opening paragraph.",
        "",
        "## The farmer-owned value chain",
        "",
        "::steps",
        "- Farmer",
        "- FPC",
        "- Farmer Members",
        "::",
        "",
        "> A closing quote.",
      ].join("\n")
    );

    expect(runs.map((run) => run.kind)).toEqual(["blocks", "chain", "blocks"]);
    expect(runs[0].blocks.map((block) => block.type)).toEqual(["p", "h2"]);
    expect(runs[1].steps).toEqual(["Farmer", "FPC", "Farmer Members"]);
    expect(runs[2].blocks[0].type).toBe("quote");
  });

  it("emits no empty run when the body opens on the fence", () => {
    const runs = splitAtChain("::steps\n- Farmer\n- FPC\n::\n\nAfter.");
    expect(runs.map((run) => run.kind)).toEqual(["chain", "blocks"]);
  });

  // An empty chain is not a chain: seven numbered blanks would be worse than
  // the picture being absent.
  it("drops a fence with nothing in it", () => {
    const runs = splitAtChain("Before.\n\n::steps\n::\n\nAfter.");
    expect(runs).toHaveLength(1);
    expect(runs[0].blocks).toHaveLength(2);
  });

  it("has nothing to split when there is no body", () => {
    expect(splitAtChain("")).toEqual([]);
    expect(splitAtChain(undefined)).toEqual([]);
  });
});

describe("aboutCopy", () => {
  it("gives the page's own furniture a default", () => {
    const copy = aboutCopy(null);
    expect(copy.eyebrow).toBe("Our Story");
    expect(copy.ctaTo).toBe("/shop");
  });

  // The company's copy has no fallback, deliberately: a story with a fallback
  // is a story this component wrote.
  it("invents no story when the record is missing", () => {
    const copy = aboutCopy(null);
    expect(copy.title).toBe("");
    expect(copy.lede).toBe("");
    expect(copy.body).toBe("");
  });
});
