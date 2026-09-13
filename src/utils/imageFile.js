// =============================================================================
// imageFile — a picture off a phone, small enough to travel with a review
// =============================================================================
//
// The storefront's own images are LINKS: the catalogue, the hero and the
// editorial bands all point at Cloudinary, and `MediaManager` is deliberately
// "links only" because the owner's assets live there. A REVIEW is the one
// surface where that is not true — the person writing it has a photograph on
// their phone and no asset pipeline to put it in — so this module exists for
// exactly that case and nothing else.
//
// WHAT IT DOES. Takes a `File` off an `<input type="file">`, draws it into a
// canvas no bigger than `maxEdge` on its longest side, and hands back a data
// URL. The rest of the app needs no new plumbing for that: `cld()` returns a
// non-Cloudinary URL untouched, `CloudinaryImage` simply omits the srcset, and
// an `<img src="data:…">` renders like any other picture.
//
// WHY IT DOWNSCALES. A modern phone photograph is 3-6 MB and 4000px wide; the
// largest box any of these pictures is ever painted into is a 640px review
// thumbnail. Sent raw it would be a multi-megabyte string in one JSON row, so
// the resize is not a nicety — it is what makes attaching a photo safe. A 1200px
// JPEG at q0.78 lands around 150-250 KB, and a 320px avatar around 20 KB.
//
// WHY IT RE-ENCODES TO JPEG. One predictable size for any input, including the
// screenshot-shaped PNGs people attach. Transparency is flattened onto white
// first, because a transparent PNG drawn into a JPEG's opaque canvas would
// otherwise come back with black where the alpha was. The one exception is
// built in below: if the original is already small enough AND already smaller
// than the re-encode, the original bytes are kept.
//
// EVERY FAILURE IS A SENTENCE, not an exception type: the callers put the
// returned message straight under the field, so a picker that refuses a file
// always says why in words a customer can act on.
// =============================================================================

/** The biggest file worth accepting at all — anything larger is a mistake. */
export const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB

/** What the file dialog offers, and what `readImageFile` will accept. */
export const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";

/** Longest edge (px) for a picture ATTACHED TO a review. */
export const REVIEW_PHOTO_MAX_EDGE = 1200;

/** Longest edge (px) for the person's own photograph. It is only ever a circle. */
export const AVATAR_MAX_EDGE = 320;

/** How many pictures one review may carry. */
export const REVIEW_PHOTO_LIMIT = 3;

const isImageFile = (file) =>
  !!file && typeof file.type === "string" && file.type.startsWith("image/");

/** "2.4 MB" — for the "that file is too big" sentence. */
export const formatBytes = (bytes) => {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
};

/** Roughly how many bytes a base64 data URL stands for. */
export const dataUrlBytes = (dataUrl) => {
  if (typeof dataUrl !== "string") return 0;
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.round((base64.length * 3) / 4);
};

/** The file, as a data URL, exactly as it was given. */
const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });

/** A decoded <img>, so the canvas has real pixel dimensions to work from. */
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode-failed"));
    img.src = src;
  });

/**
 * Read one picked image file and hand back a small data URL.
 *
 * Resolves to `{ dataUrl, bytes }` on success and `{ error }` on refusal — the
 * caller renders `error` verbatim. It never throws for a bad file.
 *
 * @param {File} file
 * @param {{maxEdge?: number, quality?: number}} [options]
 */
export async function readImageFile(file, { maxEdge = REVIEW_PHOTO_MAX_EDGE, quality = 0.78 } = {}) {
  if (!isImageFile(file)) {
    return { error: "That file isn’t an image. Pick a JPG, PNG or WebP." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      error: `That image is ${formatBytes(file.size)} — please pick one under ${formatBytes(MAX_IMAGE_BYTES)}.`,
    };
  }

  let original = "";
  try {
    original = await readAsDataUrl(file);
  } catch (e) {
    return { error: "That image couldn’t be read. Please try another one." };
  }
  if (!original) return { error: "That image couldn’t be read. Please try another one." };

  try {
    const img = await loadImage(original);
    const longest = Math.max(img.naturalWidth || 0, img.naturalHeight || 0);
    if (!longest) throw new Error("no-dimensions");

    const scale = Math.min(1, maxEdge / longest);
    const width = Math.max(1, Math.round((img.naturalWidth || 1) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || 1) * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx || typeof canvas.toDataURL !== "function") throw new Error("no-canvas");
    // Alpha flattened onto the page's own warm white rather than onto black.
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const resized = canvas.toDataURL("image/jpeg", quality);
    // A small PNG icon can survive a JPEG round-trip LARGER than it started.
    // When the source needed no resizing and was already the smaller file, it
    // is the one that is kept.
    const keepOriginal = scale === 1 && original.length <= resized.length;
    const dataUrl = keepOriginal ? original : resized;
    return { dataUrl, bytes: dataUrlBytes(dataUrl) };
  } catch (e) {
    // No canvas (an old browser, a hardened environment): the picture is still
    // usable, it simply has not been shrunk — so it is accepted only if it is
    // already small enough to sit in a row.
    if (file.size <= 1.5 * 1024 * 1024) {
      return { dataUrl: original, bytes: dataUrlBytes(original) };
    }
    return {
      error: `This browser can’t resize images, so please pick one under ${formatBytes(1.5 * 1024 * 1024)}.`,
    };
  }
}

const imageFile = {
  readImageFile,
  dataUrlBytes,
  formatBytes,
  IMAGE_ACCEPT,
  MAX_IMAGE_BYTES,
  REVIEW_PHOTO_MAX_EDGE,
  REVIEW_PHOTO_LIMIT,
  AVATAR_MAX_EDGE,
};

export default imageFile;
