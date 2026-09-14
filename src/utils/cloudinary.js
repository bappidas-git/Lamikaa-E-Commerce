// =============================================================================
// Cloudinary — URL transformation helpers
// =============================================================================
// Every LAMIKAA image (the wordmark, the mark, the eight product covers) is
// delivered from one Cloudinary cloud. The delivery rule for the whole rebuild
// is: NEVER serve a raw upload URL at full size. The wordmark master is
// 2073x758 and the covers are multi-megapixel — painting those into a 168px
// masthead slot costs the visitor bandwidth for pixels no screen will ever show.
//
// `cld()` inserts a transformation chain immediately after `/upload/`:
//
//   cld(brand.logoUrl, { trim: true, w: 480 })
//     → …/upload/e_trim/f_auto,q_auto,w_480/v…/new_logo.png
//
//   cld(cover, { crop: { x: 700, y: 10, w: 425, h: 750 }, ar: "1:1",
//                pad: true, w: 900 })
//     → …/upload/c_crop,x_700,y_10,w_425,h_750/c_pad,ar_1:1,b_auto/f_auto,q_auto,w_900/v…
//
//   cld(brand.iconUrl, { trim: true, ar: "1:1", pad: true,
//                        background: "transparent", w: 72 })
//     → …/upload/e_trim/c_pad,ar_1:1,b_transparent/f_auto,q_auto,w_72/v…
//
// Chained components are `/`-separated and Cloudinary applies them in order, so
// the trim happens first, then the crop, then the aspect-ratio pad, and the
// delivery (format/quality/width) last. `f_auto` and `q_auto` are always
// emitted: they are what turn a 400 KB PNG into a 30 KB AVIF/WebP for the
// browsers that can take one, and cost nothing for the browsers that cannot.
//
// A URL that is not a Cloudinary upload URL (a placeholder host, a data URI, an
// admin-typed link) is returned EXACTLY as given. Callers therefore never have
// to ask where an image came from before rendering it.
// =============================================================================

// Matches the delivery URLs this cloud serves: any cloud name, image assets,
// upload delivery type. Fetch/private/video URLs are deliberately not matched —
// they take a different path shape and nothing in the storefront uses them.
export const isCloudinary = (url) =>
  typeof url === "string" && /res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url);

// The widths every responsive <img> in the rebuild offers. Chosen for the real
// layout breakpoints (a 480px phone plate, a 768px tablet column, 1080/1440 for
// desktop stages, 1920 for the full-bleed hero) rather than for round numbers.
//
// 640 AND 900 ARE THE PHONE'S DEVICE PIXELS, added by Prompt 38's Lighthouse
// pass. A candidate list is a set of steps, and the browser takes the first one
// at least as wide as it needs — so a gap in the ladder is paid for in bytes.
// The hero plate is 80vw, which on the phones this store is built for lands at
// 576-660 device px at DPR 2 and 864-1032 at DPR 3: both fell into the 480->768
// and 768->1080 gaps and were served the rung above. Measured on the home page
// that was 32 KiB of over-delivery on two hero frames alone. Extra rungs cost
// nothing but a longer attribute — a candidate the browser does not choose is
// never fetched.
export const SRCSET_WIDTHS = [480, 640, 768, 900, 1080, 1440, 1920];

const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};

/**
 * Build a transformed Cloudinary URL.
 *
 * @param {string} url  a Cloudinary `/image/upload/` URL (anything else is
 *                      returned unchanged)
 * @param {object} [opts]
 * @param {number} [opts.w]        target width in px
 * @param {number} [opts.h]        target height in px
 * @param {boolean|number} [opts.trim]  strip the uniform border (a transparent bleed
 *                                      around a lockup) before anything else; a number
 *                                      is the tolerance, e.g. `20`
 * @param {object} [opts.crop]     `{ x, y, w, h }` source-pixel crop, applied first
 * @param {string} [opts.ar]       aspect ratio for the pad/fill step, e.g. "1:1"
 * @param {boolean} [opts.pad]     with `ar`, pad to the ratio on an auto-picked ground
 * @param {string} [opts.background]  the `b_` value for the pad step — "transparent"
 *                                    keeps a transparent-ground logo transparent,
 *                                    where the default `auto` would fill an opaque
 *                                    plate behind it
 * @param {boolean} [opts.fit]     with both `w` and `h`, letterbox rather than crop (default true)
 * @param {boolean} [opts.limit]   with `w` alone, scale down only — never upscale past the source
 * @param {string} [opts.quality]  `q_` value (default "auto")
 * @param {string} [opts.format]   `f_` value (default "auto")
 * @param {string} [opts.gravity]  switches the `ar` step to a fill — "auto" finds the
 *                                 subject, "center" takes the middle of the frame
 * @returns {string}
 */
export function cld(
  url,
  {
    w,
    h,
    trim,
    crop,
    ar,
    pad,
    background,
    fit = true,
    limit = false,
    quality = "auto",
    format = "auto",
    gravity,
  } = {}
) {
  if (!isCloudinary(url)) return url;

  const chain = [];

  // 0. Trim the uniform border off the source, BEFORE every other step, so a
  //    crop or a pad below measures the artwork rather than the artwork plus
  //    its bleed. This is what the brand lockups are delivered with: both
  //    master files are exported with a wide transparent margin (the wordmark
  //    is 2073x758 around 1923x502 of ink), and an <img> of the raw canvas
  //    reserves a box a third of which is empty — so the lockup reads small in
  //    a masthead sized for the art. `e_trim` gives back the tight framing the
  //    slots were measured against; see brand.logoAspect.
  if (trim) chain.push(typeof trim === "number" ? `e_trim:${trim}` : "e_trim");

  // 1. Source crop, in the original image's own pixels. Used by the PDP stage
  //    crops recorded per product in PRODUCTS.md.
  if (crop && num(crop.w) && num(crop.h)) {
    chain.push(
      `c_crop,x_${num(crop.x) ?? 0},y_${num(crop.y) ?? 0},w_${num(crop.w)},h_${num(crop.h)}`
    );
  }

  // 2. Aspect-ratio step. A `gravity` FILLS the frame: "auto" lets Cloudinary
  //    hunt for the subject, "center" simply takes the middle — which is what a
  //    centred pack in a lifestyle scene wants, and it is deterministic, so the
  //    eight products in a row crop the same way. Without a gravity the art is
  //    padded onto a ground sampled from its own edges (`b_auto`), which is
  //    what keeps a flat label or a transparent-corner shot from being sliced.
  //    `background` overrides that sampled ground: the brand mark is gold line
  //    art on nothing at all, and squaring it up on `b_auto` would paint an
  //    opaque plate behind a logo whose whole point is that it has none.
  if (ar) {
    if (gravity) chain.push(`c_fill,g_${gravity},ar_${ar}`);
    else if (pad) chain.push(`c_pad,ar_${ar},b_${background || "auto"}`);
  }

  // 3. Delivery. `c_fit` only makes sense once both dimensions are known — with
  //    a single dimension Cloudinary already scales proportionally. `c_limit`
  //    is that same proportional scale with a floor: it will shrink a source to
  //    the asked-for width but never stretch one past its own pixels, so a
  //    request for more than the master holds returns the master rather than an
  //    interpolated blur that costs more bytes than the sharp original.
  const width = num(w);
  const height = num(h);
  const delivery = [`f_${format}`, `q_${quality}`];
  if (width) delivery.push(`w_${width}`);
  if (height) delivery.push(`h_${height}`);
  if (width && height && fit) delivery.push("c_fit");
  else if (width && limit) delivery.push("c_limit");
  chain.push(delivery.join(","));

  const [origin, rest] = url.split("/upload/");
  return `${origin}/upload/${chain.join("/")}/${rest}`;
}

/**
 * A `srcset` string for the given widths. `opts` is passed through to `cld()`,
 * so a crop or an aspect ratio applies identically at every width.
 */
export const srcSet = (url, widths = SRCSET_WIDTHS, opts) =>
  widths.map((w) => `${cld(url, { ...opts, w })} ${w}w`).join(", ");

const cloudinary = { isCloudinary, cld, srcSet, SRCSET_WIDTHS };
export default cloudinary;
