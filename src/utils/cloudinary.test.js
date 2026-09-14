// `cld()` builds every image URL the store serves, so its chain ORDER is load-
// bearing: Cloudinary applies components left to right, and a trim that lands
// after a pad measures the padded frame instead of the artwork. The two options
// added for the brand lockups (`trim`, `background`) are pinned here alongside
// the invariants the rest of the catalogue already depends on.
import { cld, isCloudinary, srcSet } from "./cloudinary";

const UPLOAD = "https://res.cloudinary.com/v8vrixwq/image/upload";
const LOGO = `${UPLOAD}/v1789379844/new_logo.png`;

// The transformation components only — everything after `/upload/` bar the
// trailing `v<version>/<file>.png` the chain is applied to.
const chain = (url) => url.split("/upload/")[1].split("/").slice(0, -2);

describe("isCloudinary", () => {
  it("matches an upload URL and nothing else", () => {
    expect(isCloudinary(LOGO)).toBe(true);
    expect(isCloudinary("https://example.com/logo.png")).toBe(false);
    expect(isCloudinary("data:image/png;base64,iVBOR")).toBe(false);
    expect(isCloudinary(undefined)).toBe(false);
  });
});

describe("cld", () => {
  it("returns a non-Cloudinary URL exactly as given", () => {
    const raw = "https://example.com/logo.png";
    expect(cld(raw, { trim: true, w: 400 })).toBe(raw);
  });

  it("always emits f_auto and q_auto", () => {
    expect(cld(LOGO)).toContain("f_auto,q_auto");
  });

  it("puts e_trim FIRST, before the pad that would otherwise measure the bleed", () => {
    const url = cld(LOGO, {
      trim: true,
      ar: "1:1",
      pad: true,
      background: "transparent",
      w: 512,
    });

    expect(chain(url)).toEqual([
      "e_trim",
      "c_pad,ar_1:1,b_transparent",
      "f_auto,q_auto,w_512",
    ]);
  });

  it("takes a numeric trim as a tolerance", () => {
    expect(cld(LOGO, { trim: 20 })).toContain("/e_trim:20/");
  });

  it("omits e_trim entirely when trim is not asked for", () => {
    expect(cld(LOGO, { w: 400 })).not.toContain("e_trim");
  });

  it("still pads on b_auto when no background is named", () => {
    expect(cld(LOGO, { ar: "1:1", pad: true })).toContain("c_pad,ar_1:1,b_auto");
  });

  it("keeps the crop before the aspect step", () => {
    const url = cld(LOGO, {
      crop: { x: 700, y: 10, w: 425, h: 750 },
      ar: "1:1",
      pad: true,
      w: 900,
    });

    expect(chain(url)).toEqual([
      "c_crop,x_700,y_10,w_425,h_750",
      "c_pad,ar_1:1,b_auto",
      "f_auto,q_auto,w_900",
    ]);
  });

  it("carries the trim through every rung of a srcSet", () => {
    const set = srcSet(LOGO, [480, 960], { trim: true });

    expect(set).toBe(
      `${UPLOAD}/e_trim/f_auto,q_auto,w_480/v1789379844/new_logo.png 480w, ` +
        `${UPLOAD}/e_trim/f_auto,q_auto,w_960/v1789379844/new_logo.png 960w`
    );
  });
});
