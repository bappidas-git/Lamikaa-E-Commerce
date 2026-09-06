import brand from "../config/brand";
import {
  normalizeProduct,
  syncProductMedia,
  primaryImage,
  productVideos,
  stageSrc,
  resolvePrice,
  isPriceKnown,
} from "./product";
import { buildCartItem, getProductMinPrice } from "./helpers";

// =============================================================================
// product — the media mirror and the placeholder-aware price
// =============================================================================
// Two record shapes have to render identically for the whole rebuild to hold
// together: the boilerplate shape still in db.json (a flat `images[]`, no
// `media[]`) and the seeded shape (`media[]` with crops, posters and one
// primary). Everything here pins that equivalence, plus the rule that an
// unpriced product can never become money.
// =============================================================================

const COVER = "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/cover.jpg";
const SHOT_2 = "https://picsum.photos/seed/lamikaa-2/1200/1500";
const CLIP = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

/** The shape every product in db.json has today: images[], no media[]. */
const imagesOnlyProduct = () => ({
  id: 1,
  name: "Black Rice Face Wash",
  slug: "black-rice-face-wash",
  categoryId: 3,
  price: 390,
  comparePrice: 0,
  stock: 100,
  variants: [],
  images: [COVER, SHOT_2],
  image: COVER,
});

/** The seeded shape: an ordered mixed gallery with exactly one primary. */
const mediaProduct = () => ({
  id: 3,
  name: "Black Rice Body Wash",
  slug: "black-rice-body-wash",
  categoryId: 4,
  categoryIds: [4, 2],
  price: null,
  variants: [],
  media: [
    { type: "image", url: SHOT_2, alt: "Lifestyle", placeholder: true },
    { type: "image", url: COVER, alt: "Label", primary: true, crop: { x: 715, y: 30, w: 395, h: 710 } },
    { type: "video", url: CLIP, poster: COVER, title: "How to use" },
  ],
});

describe("normalizeProduct", () => {
  it("builds media[] from an images-only record and flags the first image primary", () => {
    const product = normalizeProduct(imagesOnlyProduct());

    expect(product.media).toEqual([
      { type: "image", url: COVER, alt: "Black Rice Face Wash", primary: true },
      { type: "image", url: SHOT_2, alt: "Black Rice Face Wash" },
    ]);
    // `image` repeats images[0] in the source record — it must not become a
    // duplicate third frame in the gallery.
    expect(product.media).toHaveLength(2);
    expect(product.images).toEqual([COVER, SHOT_2]);
    expect(product.image).toBe(COVER);
  });

  it("re-orders images[] so the flagged primary leads, whatever its media position", () => {
    const product = normalizeProduct(mediaProduct());

    expect(product.images).toEqual([COVER, SHOT_2]);
    expect(product.image).toBe(COVER);
    // media[] itself keeps its AUTHORED order — the PDP gallery is authored,
    // not sorted — and the video never enters images[].
    expect(product.media.map((row) => row.url)).toEqual([SHOT_2, COVER, CLIP]);
    expect(product.media.filter((row) => row.primary === true)).toHaveLength(1);
    expect(primaryImage(product).crop).toEqual({ x: 715, y: 30, w: 395, h: 710 });
    expect(productVideos(product)).toHaveLength(1);
  });

  it("defaults the editorial lists, the badges and the derived fields", () => {
    const product = normalizeProduct(imagesOnlyProduct());

    expect(product.concerns).toEqual([]);
    expect(product.faqs).toEqual([]);
    expect(product.keyIngredients).toEqual([]);
    expect(product.badges).toEqual(brand.trustBadges);
    expect(product.categoryIds).toEqual([3]);
    expect(product.heroOrder).toBeNull();
    expect(product.ritualStep).toBeNull();
    // "Black Rice Face Wash" reads as "Face Wash" once the range is the context.
    expect(product.shortName).toBe("Face Wash");
  });

  it("marks a record with no price as priceTBA and leaves a priced one alone", () => {
    expect(normalizeProduct(mediaProduct()).priceTBA).toBe(true);
    expect(normalizeProduct(imagesOnlyProduct()).priceTBA).toBe(false);
    // Multi-home categories survive; the single categoryId is not re-imposed.
    expect(normalizeProduct(mediaProduct()).categoryIds).toEqual([4, 2]);
  });

  it("does not mutate the record it was given", () => {
    const raw = imagesOnlyProduct();
    normalizeProduct(raw);
    expect(raw.media).toBeUndefined();
    expect(raw.images).toEqual([COVER, SHOT_2]);
  });
});

describe("syncProductMedia", () => {
  it("drops blank rows, guarantees one primary and rebuilds images[] primary-first", () => {
    const edited = syncProductMedia({
      id: 3,
      name: "Black Rice Body Wash",
      media: [
        { type: "image", url: "   " },
        { type: "image", url: SHOT_2 },
        { type: "image", url: COVER, primary: true },
        { type: "video", url: CLIP, primary: true },
        { type: "image", url: "" },
      ],
    });

    expect(edited.media.map((row) => row.url)).toEqual([SHOT_2, COVER, CLIP]);
    expect(edited.media.filter((row) => row.primary === true)).toEqual([
      { type: "image", url: COVER, alt: "Black Rice Body Wash", primary: true },
    ]);
    expect(edited.images).toEqual([COVER, SHOT_2]);
    expect(edited.image).toBe(COVER);
  });

  it("promotes the first image when the admin has flagged none", () => {
    const edited = syncProductMedia({
      name: "Black Rice Face Mist",
      media: [{ type: "video", url: CLIP }, { type: "image", url: SHOT_2 }],
    });

    expect(edited.images).toEqual([SHOT_2]);
    expect(edited.media[1].primary).toBe(true);
  });
});

describe("stageSrc", () => {
  it("crops and pads a Cloudinary cover to the stage ratio", () => {
    const src = stageSrc(normalizeProduct(mediaProduct()), { w: 900 });
    expect(src).toContain("c_crop,x_715,y_30,w_395,h_710");
    expect(src).toContain("c_pad,ar_1:1,b_auto");
    expect(src).toContain("f_auto,q_auto,w_900");
  });

  it("leaves a non-Cloudinary URL untouched", () => {
    expect(stageSrc(normalizeProduct({ name: "X", images: [SHOT_2] }))).toBe(SHOT_2);
  });
});

describe("price", () => {
  it("reports an unpriced product as unknown everywhere", () => {
    const tba = normalizeProduct(mediaProduct());

    expect(isPriceKnown(tba)).toBe(false);
    expect(resolvePrice(tba)).toEqual({
      known: false,
      price: null,
      comparePrice: 0,
      discount: 0,
    });
    // The arithmetic helper stays safe to call — zeroes, plus the flag.
    expect(getProductMinPrice(tba)).toEqual({
      sellingPrice: 0,
      originalPrice: 0,
      discount: 0,
      unknown: true,
    });
  });

  it("resolves a real price, its compare-at and its discount", () => {
    const product = normalizeProduct({ ...imagesOnlyProduct(), comparePrice: 500 });

    expect(resolvePrice(product)).toEqual({
      known: true,
      price: 390,
      comparePrice: 500,
      discount: 22,
    });
    // A compare-at that is not actually higher is not a compare-at.
    expect(resolvePrice(normalizeProduct(imagesOnlyProduct())).comparePrice).toBe(0);
  });

  it("refuses to build a cart line for a product with no price", () => {
    expect(() => buildCartItem(normalizeProduct(mediaProduct()))).toThrow("PRICE_TBA");
    expect(buildCartItem(normalizeProduct(imagesOnlyProduct()))).toMatchObject({
      id: "1",
      productId: 1,
      price: 390,
      image: COVER,
    });
  });

  it("honours an explicit priceTBA on a record that still carries a number", () => {
    expect(isPriceKnown({ price: 390, priceTBA: true })).toBe(false);
    expect(isPriceKnown({ price: 390 })).toBe(true);
    expect(isPriceKnown({ price: null, variants: [{ id: 1, price: 249 }] })).toBe(true);
  });
});
