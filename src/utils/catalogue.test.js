import {
  inCategory,
  productsForCategory,
  firstProductForCategory,
  categoryImage,
  categoryThumbSrc,
} from "./catalogue";

// =============================================================================
// catalogue — membership, and whose picture a category tile shows
// =============================================================================
// The membership rule is shared by four surfaces and the api's category read,
// so it is pinned here rather than in any one of them.
//
// The picture rule is newer and pinned harder, because the bug it fixes was
// silent: the mega panel, the mobile drawer and the home rail all drew a
// category with the cover of the first product in it and never looked at the
// `image` the admin set in Categories > Edit. A category's own picture must
// WIN, on every surface, at every width — the product cover is the last resort,
// not the default.
// =============================================================================

const CLOUDINARY_COVER =
  "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/cover.jpg";
const CLOUDINARY_TILE =
  "https://res.cloudinary.com/v8vrixwq/image/upload/v1789000000/face-care-tile.jpg";
const PLAIN_TILE = "https://picsum.photos/seed/lamikaa-cat-face-care/1600/1000";

const faceCare = (overrides = {}) => ({
  id: 1,
  slug: "face-care",
  name: "Face Care",
  kind: "products",
  ...overrides,
});

const faceWash = () => ({
  id: 10,
  name: "Black Rice Face Wash",
  categoryId: 3,
  categoryIds: [1, 3],
  images: [CLOUDINARY_COVER],
  image: CLOUDINARY_COVER,
});

const bodyWash = () => ({
  id: 11,
  name: "Black Rice Body Wash",
  categoryId: 2,
  categoryIds: [2, 3],
  images: [CLOUDINARY_COVER],
  image: CLOUDINARY_COVER,
});

describe("membership", () => {
  it("counts a product listed in categoryIds and one filed by its primary categoryId", () => {
    // The face wash lives in Face Care through `categoryIds`, never through
    // `categoryId` — the case that broke when a product gained a second home.
    expect(inCategory(faceWash(), faceCare())).toBe(true);
    expect(inCategory(bodyWash(), { id: 2 })).toBe(true);
    expect(inCategory(bodyWash(), faceCare())).toBe(false);
  });

  it("takes an id as readily as a record, and refuses an empty target", () => {
    expect(inCategory(faceWash(), 3)).toBe(true);
    expect(inCategory(faceWash(), null)).toBe(false);
    expect(inCategory(null, faceCare())).toBe(false);
  });

  it("keeps the order it was handed, so 'first' is the caller's own", () => {
    const catalogue = [bodyWash(), faceWash()];
    expect(productsForCategory(catalogue, { id: 3 })).toHaveLength(2);
    expect(firstProductForCategory(catalogue, { id: 3 }).id).toBe(11);
    expect(firstProductForCategory(catalogue, faceCare()).id).toBe(10);
  });

  it("returns null for a category with no members yet", () => {
    expect(firstProductForCategory([faceWash()], { id: 99 })).toBeNull();
    expect(firstProductForCategory([], faceCare())).toBeNull();
  });
});

describe("categoryImage", () => {
  it("prefers the card image the admin set", () => {
    expect(
      categoryImage(faceCare({ image: PLAIN_TILE, heroImage: CLOUDINARY_TILE }))
    ).toBe(PLAIN_TILE);
  });

  it("falls back to the hero banner when only that was filled", () => {
    expect(categoryImage(faceCare({ image: "", heroImage: PLAIN_TILE }))).toBe(
      PLAIN_TILE
    );
  });

  it("treats a whitespace-only field as unset", () => {
    expect(categoryImage(faceCare({ image: "   " }))).toBe("");
    expect(categoryImage(faceCare())).toBe("");
    expect(categoryImage(null)).toBe("");
  });

  it("trims a pasted URL so a stray space cannot break the tile", () => {
    expect(categoryImage(faceCare({ image: ` ${PLAIN_TILE} ` }))).toBe(PLAIN_TILE);
  });
});

describe("categoryThumbSrc", () => {
  it("shows the admin's image even when the category has products", () => {
    // THE REGRESSION THIS FILE EXISTS FOR. Both are present; the category's own
    // picture wins, so editing it in the admin changes the menu.
    const src = categoryThumbSrc(faceCare({ image: CLOUDINARY_TILE }), faceWash(), {
      w: 96,
    });
    expect(src).toContain("face-care-tile.jpg");
    expect(src).not.toContain("cover.jpg");
  });

  it("borrows the product cover only when the category has no picture", () => {
    const src = categoryThumbSrc(faceCare(), faceWash(), { w: 96 });
    expect(src).toContain("cover.jpg");
  });

  it("is empty when there is neither — the plate stays empty, never borrowed", () => {
    expect(categoryThumbSrc(faceCare(), null, { w: 96 })).toBe("");
    expect(categoryThumbSrc(null, null)).toBe("");
  });

  it("delivers a Cloudinary tile sized, formatted and padded to the plate", () => {
    const src = categoryThumbSrc(faceCare({ image: CLOUDINARY_TILE }), null, {
      w: 96,
    });
    // c_pad letterboxes a wide banner into the square rather than cutting it.
    expect(src).toContain("c_pad,ar_1:1,b_auto");
    expect(src).toContain("f_auto,q_auto,w_96");
  });

  it("hands back a non-Cloudinary URL untouched", () => {
    // An admin-typed link on another host has no transform API; `cld()` returns
    // it exactly as given rather than inventing a URL that 404s.
    expect(categoryThumbSrc(faceCare({ image: PLAIN_TILE }), null, { w: 96 })).toBe(
      PLAIN_TILE
    );
  });

  it("sizes to the surface that asked — 40px menu row, 480px home card", () => {
    const cat = faceCare({ image: CLOUDINARY_TILE });
    expect(categoryThumbSrc(cat, null, { w: 64 })).toContain("w_64");
    expect(categoryThumbSrc(cat, null, { w: 480 })).toContain("w_480");
  });
});
