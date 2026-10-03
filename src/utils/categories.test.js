import {
  categoryPath,
  getRitualMenuCategories,
  getShopMenuTree,
  groupRitualsByCategory,
  isRitualSubcategory,
} from "./categories";
import { productsForCategoryTree } from "./catalogue";
import { ROUTES } from "./constants";

// The shape of the catalogue in the bug report: "yoo" is a products
// sub-category of Face Care, "on the way" a ritual collection.
const cat = (over) => ({ isActive: true, showInMainMenu: true, kind: "products", parentId: null, ...over });
const categories = [
  cat({ id: 1, slug: "face-care", name: "Face Care", menuOrder: 1 }),
  cat({ id: 2, slug: "body-care", name: "Body Care", menuOrder: 2 }),
  cat({ id: 7, slug: "rituals", name: "Rituals", kind: "rituals", menuOrder: 7 }),
  cat({ id: 8, slug: "yoo", name: "yoo", parentId: 1, menuOrder: 8 }),
  cat({ id: 9, slug: "on-the-way", name: "on the way", kind: "rituals", parentId: 7, menuOrder: 9 }),
  cat({ id: 10, slug: "deep", name: "Deep", parentId: 8, menuOrder: 10 }),
];

describe("getShopMenuTree", () => {
  it("nests sub-categories under their top-level parent", () => {
    const tree = getShopMenuTree(categories);
    expect(tree.map((r) => r.cat.slug)).toEqual(["face-care", "body-care", "rituals"]);
    expect(tree[0].children.map((c) => c.slug)).toEqual(["yoo", "deep"]);
  });

  it("keeps ritual collections out of the Shop menu", () => {
    const slugs = getShopMenuTree(categories).flatMap((r) => [r.cat, ...r.children]).map((c) => c.slug);
    expect(slugs).not.toContain("on-the-way");
  });

  it("honours the main-menu switch, hiding a hidden parent's branch", () => {
    const hidden = categories.map((c) => (c.id === 1 ? { ...c, showInMainMenu: false } : c));
    const slugs = getShopMenuTree(hidden).flatMap((r) => [r.cat, ...r.children]).map((c) => c.slug);
    expect(slugs).toEqual(["body-care", "rituals"]);
    expect(getShopMenuTree(hidden, { menuOnly: false })[0].children).toHaveLength(2);
  });

  it("puts a child whose parent is missing at the top level", () => {
    const orphan = [cat({ id: 3, slug: "orphan", parentId: 99 })];
    expect(getShopMenuTree(orphan).map((r) => r.cat.slug)).toEqual(["orphan"]);
  });
});

describe("ritual collections", () => {
  const rituals = [
    { id: 1, slug: "morning", categoryId: 7 },
    { id: 2, slug: "evening" },
    { id: 3, slug: "travel", categoryId: 9 },
  ];

  it("links a ritual collection to its section of /rituals", () => {
    expect(isRitualSubcategory(categories[4])).toBe(true);
    expect(categoryPath(categories[4])).toBe(`${ROUTES.RITUALS}#on-the-way`);
    expect(categoryPath(categories[2])).toBe(ROUTES.RITUALS);
  });

  it("lists only collections with rituals under the Rituals tab", () => {
    expect(getRitualMenuCategories(categories, rituals).map((c) => c.slug)).toEqual(["on-the-way"]);
    expect(getRitualMenuCategories(categories, rituals.slice(0, 2))).toEqual([]);
  });

  it("splits the rituals page into the main list and collection sections", () => {
    const { main, groups } = groupRitualsByCategory(rituals, categories);
    expect(main.map((r) => r.slug)).toEqual(["morning", "evening"]);
    expect(groups).toHaveLength(1);
    expect(groups[0].category.slug).toBe("on-the-way");
    expect(groups[0].rituals.map((r) => r.slug)).toEqual(["travel"]);
  });
});

describe("productsForCategoryTree", () => {
  it("includes the products of a parent's sub-categories", () => {
    const products = [
      { id: "a", categoryId: 1 },
      { id: "b", categoryId: 8 },
      { id: "c", categoryIds: [10] },
      { id: "d", categoryId: 2 },
    ];
    expect(productsForCategoryTree(products, categories[0], categories).map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
});
