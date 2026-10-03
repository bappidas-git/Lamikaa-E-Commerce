// Prompt 20's copy decisions are pure functions, so the rules that matter — how
// a pillar finds its glyph, how the impact eyebrow is derived from a key, where
// the category prefix comes off a title, and what either half says when the CMS
// has nothing to say — are pinned down here rather than by scrolling the home
// page. The list and layout maths behind the cards are in utils/pillars.test.js;
// the render tests at the bottom are the regression for the bug that sent them
// there: a pillar added in Admin → Content never reached the site.
//
// The one rule that is not about presentation is the LEGAL one: the impact
// points render verbatim, qualifiers and all. `impactColumns` is where a future
// edit could quietly start tidying a sentence, so the property is asserted.
//
// `services/api` is mocked because importing WhyLamikaaSection would otherwise
// build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import React from "react";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import brand from "../../config/brand";
import Pillars, {
  PILLAR_ICONS,
  pillarIcon,
  pillarNumeral,
  pillarTone,
  pillarsFrom,
} from "./Pillars";
import { impactColumns, impactEyebrow, impactTitle } from "./ImpactTriptych";
import WhyLamikaaSection, { impactCopy } from "../home/WhyLamikaaSection";

// jsdom ships neither: matchMedia is read by framer-motion's reduced-motion
// hook, IntersectionObserver by the cards' in-view reveal. The stub reports
// "visible" the moment it is asked.
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

// The admin's list as the owner left it: the four the brand shipped and the
// fifth they added.
const PUBLISHED = {
  title: "Indigenous Wisdom. Modern Science. Responsible Beauty.",
  pillars: [...brand.pillars, { key: "test", title: "test", text: "test" }],
};

describe("pillarIcon", () => {
  it("gives each of the four brand pillars its own glyph", () => {
    const icons = brand.pillars.map(pillarIcon);
    expect(icons).toEqual([
      "mdi:leaf",
      "mdi:flask-outline",
      "mdi:account-group-outline",
      "mdi:earth",
    ]);
    expect(new Set(icons).size).toBe(4);
  });

  it("covers every key the brand config ships", () => {
    brand.pillars.forEach((pillar) => {
      expect(PILLAR_ICONS[pillar.key]).toBeDefined();
    });
  });

  it("falls back to the slot's glyph when a key is renamed", () => {
    expect(pillarIcon({ key: "traditional-knowledge" }, 0)).toBe("mdi:leaf");
    expect(pillarIcon({}, 3)).toBe("mdi:earth");
  });

  it("gives a fifth pillar a neutral mark rather than a guess", () => {
    expect(pillarIcon({ key: "packaging" }, 4)).toBe("mdi:star-four-points-outline");
    expect(pillarIcon(undefined, 9)).toBe("mdi:star-four-points-outline");
  });
});

describe("pillarNumeral", () => {
  it("is 1-based and padded", () => {
    expect(pillarNumeral(0)).toBe("01");
    expect(pillarNumeral(3)).toBe("04");
  });
});

describe("pillarTone", () => {
  it("alternates gold and violet down the row", () => {
    expect([0, 1, 2, 3].map(pillarTone)).toEqual(["gold", "violet", "gold", "violet"]);
  });
});

describe("impactEyebrow", () => {
  it("title-cases the key", () => {
    expect(impactEyebrow({ key: "financial" })).toBe("Financial");
    expect(impactEyebrow({ key: "social" })).toBe("Social");
    expect(impactEyebrow({ key: "environmental" })).toBe("Environmental");
  });

  it("reads a multi-word key as words", () => {
    expect(impactEyebrow({ key: "farmer-ownership" })).toBe("Farmer Ownership");
    expect(impactEyebrow({ key: "RURAL_employment" })).toBe("Rural Employment");
  });

  it("says nothing about a row with no key", () => {
    expect(impactEyebrow({})).toBe("");
    expect(impactEyebrow(null)).toBe("");
  });
});

describe("impactTitle", () => {
  it("takes the category prefix off, because the eyebrow already says it", () => {
    expect(
      impactTitle({ key: "financial", title: "Financial — From Raw Produce to Shared Value" })
    ).toBe("From Raw Produce to Shared Value");
    expect(
      impactTitle({ key: "social", title: "Social — When Farmers Prosper, Families Prosper" })
    ).toBe("When Farmers Prosper, Families Prosper");
  });

  it("only strips a prefix a DASH separates", () => {
    expect(impactTitle({ key: "financial", title: "Financially Sustainable Farming" })).toBe(
      "Financially Sustainable Farming"
    );
  });

  it("leaves a title that does not repeat its key alone", () => {
    expect(impactTitle({ key: "financial", title: "From Raw Produce to Shared Value" })).toBe(
      "From Raw Produce to Shared Value"
    );
  });

  it("never returns nothing when there was a title", () => {
    expect(impactTitle({ key: "financial", title: "Financial —" })).toBe("Financial —");
    expect(impactTitle({ key: "financial" })).toBe("");
  });
});

describe("impactColumns", () => {
  const seedRow = () => ({
    key: "financial",
    title: "Financial — From Raw Produce to Shared Value",
    image: "https://example.test/financial.jpg",
    points: [
      "Greater value realization from agricultural produce.",
      "Farmers participate in value addition, not only in supply.",
      "Farmers can benefit from the profitability of their own enterprise.",
    ],
  });

  it("splits a seed row into its eyebrow and its title", () => {
    const [column] = impactColumns([seedRow()]);
    expect(column.eyebrow).toBe("Financial");
    expect(column.title).toBe("From Raw Produce to Shared Value");
    expect(column.image).toBe("https://example.test/financial.jpg");
  });

  it("keeps every point WORD FOR WORD — the legal qualifiers are the sentence", () => {
    const row = seedRow();
    row.points = [
      "Profits, when declared for distribution in accordance with applicable laws and company decisions, can reach the member farmers through dividends.",
    ];
    const [column] = impactColumns([row]);
    expect(column.points).toEqual(row.points);
    expect(column.points[0]).toContain("can reach the member farmers through dividends");
  });

  it("keeps all three points, and never truncates or reorders them", () => {
    const row = seedRow();
    expect(impactColumns([row])[0].points).toEqual(row.points);
  });

  it("drops empty points and rows with nothing to say", () => {
    expect(impactColumns([{ key: "financial", points: ["  ", ""] }])).toEqual([]);
    expect(impactColumns([null, undefined, {}])).toEqual([]);
    expect(impactColumns(undefined)).toEqual([]);
  });

  it("gives a keyless row a stable key so React can list it", () => {
    expect(impactColumns([{ title: "One" }, { title: "Two" }]).map((c) => c.key)).toEqual([
      "impact-0",
      "impact-1",
    ]);
  });
});

describe("impactCopy", () => {
  const block = {
    eyebrow: "Our Impact",
    title: "Beauty That Creates Prosperity for Farmers",
    items: [{ key: "financial", title: "Financial — One", points: ["A point."] }],
  };

  it("uses the published block as written", () => {
    expect(impactCopy(block)).toEqual(block);
  });

  it("keeps its own furniture when the block is missing", () => {
    expect(impactCopy(null).eyebrow).toBe("Our impact");
    expect(impactCopy(null).title).toBe("Beauty That Creates Prosperity for Farmers");
  });

  it("claims NOTHING about impact when the block is missing or unpublished", () => {
    expect(impactCopy(null).items).toEqual([]);
    expect(impactCopy(undefined).items).toEqual([]);
    expect(impactCopy({ ...block, published: false }).items).toEqual([]);
    expect(impactCopy({ ...block, items: "three" }).items).toEqual([]);
  });

  it("treats a block with no `published` flag as published", () => {
    expect(impactCopy({ ...block, published: undefined }).items).toHaveLength(1);
  });
});

describe("the section's own copy", () => {
  it("takes the philosophy and its lede from the brand config, not from a component", () => {
    expect(brand.philosophy).toBe("Indigenous Wisdom. Modern Science. Responsible Beauty.");
    expect(brand.philosophyLede).toBe(
      "LAMIKAA Naturals believes that the future of beauty can be inspired by the wisdom of the past."
    );
  });

  it("states no number, share or promise anywhere in the four pillars", () => {
    const copy = brand.pillars.map((p) => `${p.title} ${p.text}`).join(" ");
    expect(copy).not.toMatch(/\d|%|percent|guarantee|promise/i);
  });
});

describe("<Pillars>", () => {
  it("draws every pillar Admin → Content publishes — the new fifth included", () => {
    render(<Pillars pillars={pillarsFrom(PUBLISHED)} />);

    const cards = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(cards).toHaveLength(5);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Indigenous Knowledge",
      "Modern Cosmetic Science",
      "Farmer Ownership",
      "Responsible Beauty",
      "test",
    ]);
  });

  it("hands the grid five cards' worth of tracks and centres the short row", () => {
    render(<Pillars pillars={pillarsFrom(PUBLISHED)} />);

    const list = screen.getByRole("list");
    expect(list.style.getPropertyValue("--pl-tracks-lg")).toBe("6");
    expect(list.style.getPropertyValue("--pl-tracks-xl")).toBe("10");
    const cards = within(list).getAllByRole("listitem");
    // 3 + 2 on a laptop: the fourth card opens the centred second row.
    expect(cards[3].style.getPropertyValue("--pl-start-lg")).toBe("2");
    expect(cards[0].style.getPropertyValue("--pl-start-lg")).toBe("");
  });

  it("draws skeleton cards, not the config's copy, while the record is in flight", () => {
    const { container } = render(<Pillars pillars={pillarsFrom(undefined)} loading />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.queryByText("Indigenous Knowledge")).not.toBeInTheDocument();
    const skeleton = container.querySelector('[data-loading="true"]');
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton.children).toHaveLength(brand.pillars.length);
  });

  it("draws nothing once the owner has removed every pillar", () => {
    const { container } = render(<Pillars pillars={pillarsFrom({ pillars: [] })} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("still draws the brand's four with no list handed to it", () => {
    render(<Pillars />);
    expect(screen.getAllByRole("listitem")).toHaveLength(brand.pillars.length);
  });
});

describe("<WhyLamikaaSection> (the home band)", () => {
  const renderBand = (whyContent) =>
    render(
      <MemoryRouter>
        <WhyLamikaaSection content={null} whyContent={whyContent} />
      </MemoryRouter>
    );

  it("draws the pillars from the content record, not from the config", () => {
    renderBand(PUBLISHED);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("heading", { level: 3, name: "test" })).toBeInTheDocument();
  });

  it("waits for the record with skeleton cards", () => {
    renderBand(undefined);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("falls back to the config's pillars when the record could not be read", () => {
    renderBand(null);
    expect(screen.getAllByRole("listitem")).toHaveLength(brand.pillars.length);
  });
});
