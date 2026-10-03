// =============================================================================
// pillars — where the list comes from, which glyph each pillar wears, and how
// many cards go to a row
// =============================================================================
// The bug these pin down: Admin → Content edited `siteContent.whyLamikaa.pillars`
// and every storefront surface drew `brand.pillars` instead, so a fifth pillar
// added in the admin never reached the site. `pillarsFrom` is now the one road
// from the record to the cards, and the layout maths is what keeps a fifth card
// from sitting alone under a full row.
// =============================================================================
import brand from "../config/brand";
import {
  FALLBACK_PILLAR_ICON,
  PILLAR_ICON_CHOICES,
  automaticPillarIcons,
  isIconName,
  normalizePillars,
  pillarColumns,
  pillarIcons,
  pillarLayout,
  pillarsFrom,
  pillarsTitle,
  statedPillarCount,
} from "./pillars";

const SEEDED = brand.pillars.map((pillar) => ({ ...pillar }));
const WITH_FIFTH = [...SEEDED, { key: "test", title: "test", text: "test" }];

describe("pillarsFrom", () => {
  it("draws the list Admin → Content publishes, a new fifth pillar included", () => {
    const rows = pillarsFrom({ title: "Why", pillars: WITH_FIFTH });
    expect(rows.map((row) => row.title)).toEqual([
      "Indigenous Knowledge",
      "Modern Cosmetic Science",
      "Farmer Ownership",
      "Responsible Beauty",
      "test",
    ]);
    expect(rows[4]).toEqual({ id: "test", key: "test", title: "test", text: "test", icon: "" });
  });

  it("keeps the owner's order and wording, not the config's", () => {
    const reordered = [
      { key: "farmer-ownership", title: "Owned by Farmers", text: "Reworded." },
      { key: "indigenous-knowledge", title: "Indigenous Knowledge", text: "Same." },
    ];
    expect(pillarsFrom({ pillars: reordered }).map((row) => row.title)).toEqual([
      "Owned by Farmers",
      "Indigenous Knowledge",
    ]);
  });

  it("falls back to the config's pillars when the record has no list", () => {
    const titles = brand.pillars.map((pillar) => pillar.title);
    expect(pillarsFrom(undefined).map((row) => row.title)).toEqual(titles);
    expect(pillarsFrom(null).map((row) => row.title)).toEqual(titles);
    expect(pillarsFrom({ title: "Why LAMIKAA" }).map((row) => row.title)).toEqual(titles);
    expect(pillarsFrom({ pillars: "four" }).map((row) => row.title)).toEqual(titles);
  });

  it("leaves an emptied list empty — the owner removed them, the site does not put them back", () => {
    expect(pillarsFrom({ pillars: [] })).toEqual([]);
  });
});

describe("normalizePillars", () => {
  it("drops a row with no title, and junk rows", () => {
    const rows = normalizePillars([
      { key: "a", title: "  ", text: "No title." },
      null,
      "Farmer Ownership",
      { key: "b", title: " Real ", text: " Trimmed. " },
    ]);
    expect(rows).toEqual([{ id: "b", key: "b", title: "Real", text: "Trimmed.", icon: "" }]);
  });

  it("reads a backend's nulls as empty fields", () => {
    expect(normalizePillars([{ key: null, title: "Farmer Ownership", text: null, icon: null }])).toEqual([
      { id: "farmer-ownership", key: "", title: "Farmer Ownership", text: "", icon: "" },
    ]);
  });

  it("gives every row an id no other row shares", () => {
    const rows = normalizePillars([
      { key: "dup", title: "One" },
      { key: "dup", title: "Two" },
      { title: "Farmer Ownership" },
      { title: "Farmer Ownership" },
      { title: "অসমীয়া" },
    ]);
    const ids = rows.map((row) => row.id);
    expect(ids).toEqual(["dup", "dup-2", "farmer-ownership", "farmer-ownership-2", "pillar-5"]);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps a usable icon name and clears anything else", () => {
    const [good, bad] = normalizePillars([
      { title: "A", icon: " mdi:sprout-outline " },
      { title: "B", icon: "https://example.test/x.svg" },
    ]);
    expect(good.icon).toBe("mdi:sprout-outline");
    expect(bad.icon).toBe("");
  });
});

describe("isIconName", () => {
  it("accepts an Iconify name and nothing else", () => {
    expect(isIconName("mdi:leaf")).toBe(true);
    expect(isIconName("mdi:check-decagram-outline")).toBe(true);
    expect(isIconName("leaf")).toBe(false);
    expect(isIconName("mdi:<script>")).toBe(false);
    expect(isIconName("")).toBe(false);
    expect(isIconName(undefined)).toBe(false);
  });

  it("is true of every glyph the admin offers", () => {
    PILLAR_ICON_CHOICES.forEach((choice) => expect(isIconName(choice.icon)).toBe(true));
    expect(new Set(PILLAR_ICON_CHOICES.map((c) => c.icon)).size).toBe(PILLAR_ICON_CHOICES.length);
  });
});

describe("pillarIcons", () => {
  it("wears the glyph chosen in the admin, over the key's", () => {
    const rows = [{ key: "modern-science", title: "Science", icon: "mdi:microscope" }];
    expect(pillarIcons(rows)).toEqual(["mdi:microscope"]);
  });

  it("gives the seeded four their own glyphs and a new fifth the neutral mark", () => {
    expect(pillarIcons(pillarsFrom({ pillars: WITH_FIFTH }))).toEqual([
      "mdi:leaf",
      "mdi:flask-outline",
      "mdi:account-group-outline",
      "mdi:earth",
      FALLBACK_PILLAR_ICON,
    ]);
  });

  it("never hands a slot's glyph to a second pillar", () => {
    // A new pillar dragged to the top must not take the leaf the first brand
    // pillar is already wearing two cards along.
    const rows = [{ key: "new", title: "New" }, ...SEEDED];
    const icons = pillarIcons(rows);
    expect(icons[0]).toBe(FALLBACK_PILLAR_ICON);
    expect(icons.filter((icon) => icon === "mdi:leaf")).toHaveLength(1);
  });

  it("still lends a renamed brand pillar its slot's glyph when nobody wears it", () => {
    const rows = SEEDED.map((p, i) => (i === 2 ? { ...p, key: "farmer-owned" } : p));
    expect(pillarIcons(rows)[2]).toBe("mdi:account-group-outline");
  });
});

describe("automaticPillarIcons", () => {
  it("previews what Auto resolves to on each row", () => {
    const rows = [...SEEDED, { key: "test", title: "test", icon: "mdi:sprout-outline" }];
    expect(automaticPillarIcons(rows)).toEqual([
      "mdi:leaf",
      "mdi:flask-outline",
      "mdi:account-group-outline",
      "mdi:earth",
      FALLBACK_PILLAR_ICON,
    ]);
  });
});

describe("pillarColumns", () => {
  it.each([
    // count, the row's maximum, cards to a row
    [4, 4, 4], // the seeded grid is unchanged
    [4, 5, 4],
    [4, 2, 2],
    [5, 5, 5], // a desktop takes all five in one row
    [5, 4, 3], // a laptop takes 3 + 2, never 4 + 1
    [5, 2, 2], // a tablet: 2 + 2 + 1, the one centred
    [6, 5, 3], // 3 + 3
    [7, 4, 4], // 4 + 3
    [9, 5, 5], // 5 + 4
    [3, 4, 3],
    [2, 4, 3], // two pillars are cards, not banners: a third of the row each
    [1, 4, 3],
    [5, 1, 1], // a one-column rail
    [0, 4, 1],
  ])("%i pillars in a row of at most %i → %i to a row", (count, max, columns) => {
    expect(pillarColumns(count, max)).toBe(columns);
  });
});

describe("pillarLayout", () => {
  it("draws the seeded four exactly as before: no short row anywhere", () => {
    const { list, items } = pillarLayout(4);
    expect(list).toEqual({ "--pl-tracks-md": 4, "--pl-tracks-lg": 8, "--pl-tracks-xl": 8 });
    expect(items).toEqual([{}, {}, {}, {}]);
  });

  it("centres a short last row under the full one", () => {
    const { list, items } = pillarLayout(5);
    expect(list).toEqual({ "--pl-tracks-md": 4, "--pl-tracks-lg": 6, "--pl-tracks-xl": 10 });
    // Tablet, 2 + 2 + 1: the fifth card starts one track in (line 2 of 4 tracks).
    expect(items[4]).toEqual({ "--pl-start-md": 2 });
    // Laptop, 3 + 2: the fourth card starts one track in (line 2 of 6 tracks).
    expect(items[3]).toEqual({ "--pl-start-lg": 2 });
    // Desktop, one row of five: nothing to centre.
    expect(items.slice(0, 3)).toEqual([{}, {}, {}]);
  });

  it("caps the row at the caller's ceiling", () => {
    const { list, items } = pillarLayout(5, 1);
    expect(list).toEqual({ "--pl-tracks-md": 2, "--pl-tracks-lg": 2, "--pl-tracks-xl": 2 });
    expect(items.every((style) => Object.keys(style).length === 0)).toBe(true);
  });

  it("puts a lone pillar in the middle of the band", () => {
    expect(pillarLayout(1).items[0]).toEqual({
      "--pl-start-md": 2,
      "--pl-start-lg": 3,
      "--pl-start-xl": 3,
    });
  });
});

describe("pillarsTitle", () => {
  it("counts the cards it stands over", () => {
    expect(pillarsTitle(4)).toBe("Four pillars");
    expect(pillarsTitle(5)).toBe("Five pillars");
    expect(pillarsTitle(12)).toBe("Twelve pillars");
    expect(pillarsTitle(1)).toBe("Our pillar");
    expect(pillarsTitle(13)).toBe("Our pillars");
  });
});

describe("statedPillarCount", () => {
  it("reads the count the seeded copy states", () => {
    expect(statedPillarCount("Our philosophy is built on four pillars:")).toBe(4);
    expect(statedPillarCount("Built on 5 pillars.")).toBe(5);
    expect(statedPillarCount("Eleven Pillars hold it up.")).toBe(11);
    expect(statedPillarCount("one pillar")).toBe(1);
  });

  it("finds nothing where no count is stated", () => {
    expect(statedPillarCount("Our pillars are simple.")).toBeNull();
    expect(statedPillarCount("someone pillars")).toBeNull();
    expect(statedPillarCount(undefined)).toBeNull();
  });
});
