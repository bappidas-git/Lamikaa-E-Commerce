import { faqSections } from "./Faq";

// =============================================================================
// The FAQ page's sections (Prompt 28)
// =============================================================================
// The groups are DATA — an owner renames or deletes a heading in the admin
// without touching a row's `group`. The one behaviour a help page cannot have
// is dropping an answer it holds, and that is exactly what a rename would do
// without the trailing group. It fails silently, so it is asserted here.
// =============================================================================

const row = (id, group, question = `Question ${id}`) => ({
  id,
  group,
  question,
  answer: "An answer.",
  placements: ["help"],
  isActive: true,
  productIds: [],
  sortOrder: id,
});

const GROUPS = [
  { key: "brand", label: "The farmer-owned brand" },
  { key: "orders", label: "Orders, shipping & returns" },
  { key: "account", label: "Account" },
];

describe("faqSections", () => {
  it("keeps the owner's order and drops a heading with no rows", () => {
    const sections = faqSections([row(1, "orders"), row(2, "brand")], GROUPS);
    expect(sections.map((section) => section.key)).toEqual(["brand", "orders"]);
    expect(sections[0].label).toBe("The farmer-owned brand");
  });

  it("files a row nobody has configured a heading for rather than losing it", () => {
    const sections = faqSections([row(1, "brand"), row(2, "payments")], GROUPS);
    expect(sections.map((section) => section.key)).toEqual(["brand", "general"]);
    expect(sections[1].rows.map((r) => r.id)).toEqual([2]);
  });

  it("files an ungrouped row too", () => {
    const sections = faqSections([row(1, "")], GROUPS);
    expect(sections).toHaveLength(1);
    expect(sections[0].key).toBe("general");
  });

  it("never shows one answer twice", () => {
    const sections = faqSections([row(1, "brand"), row(2, "brand")], GROUPS);
    const ids = sections.flatMap((section) => section.rows.map((r) => r.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("falls back to no sections rather than throwing on a missing record", () => {
    expect(faqSections([], GROUPS)).toEqual([]);
    expect(faqSections(null, null)).toEqual([]);
    // No configured headings at all: every row still has somewhere to be.
    expect(faqSections([row(1, "brand")], []).map((s) => s.key)).toEqual(["general"]);
  });
});
