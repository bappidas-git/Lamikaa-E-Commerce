import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { cld } from "../../utils/cloudinary";
import { onImageError } from "../../utils/helpers";
import { STOREFRONT_CONFIG } from "../../theme/tokens";
import styles from "./ReviewPhotos.module.css";

// =============================================================================
// ReviewPhotos — a customer's pictures of the product, and the way into them
// =============================================================================
//
// THE THUMBNAIL IS A DOOR, NOT THE PICTURE. A review photograph is printed at
// 46-78px: enough to show that there IS a picture, not enough to see the
// texture, the shade or the pack on a real shelf, which is the whole reason a
// customer took it. So every tile is a button, and it opens the photograph full
// screen in the SAME viewer the product gallery uses (`pdp/Lightbox`): pinch,
// wheel, double-tap and the +/- bar zoom it 1x-4x, a drag pans it, the arrows,
// a swipe or ← → move through the review's other photos, and Esc closes it
// with focus back on the tile it was opened from.
//
// ONE COMPONENT, TWO SURFACES. The product page's reviews and the "What our
// customers say" band print the same rows, so they print the same strip, and
// the two can never disagree about whether a photograph opens.
//
// THE VIEWER IS LOADED AND MOUNTED ON FIRST USE. The band rides in the shell on
// every route, and the viewer (gestures, zoom, the video player it can host) is
// code nobody needs until they press a photograph, so it is fetched as its own
// chunk: asked for as soon as a pointer or the keyboard reaches a tile, so a
// press rarely waits on it. That is also what keeps the band's CSS chunk from
// importing the viewer's styles in a different order than the product page,
// which a CI build rejects. A page of reviews is a page of strips and most
// visitors open none, so nothing is mounted until one is pressed, and once
// opened the viewer stays mounted so that closing plays the exit. Offline, a
// press that cannot fetch the viewer leaves the tile as it was.
//
// A TILE IS DELIVERED AT TILE SIZE. A photo the owner linked from Cloudinary is
// fetched as a 240px square (the 78px tile on a 3x screen) rather than as its
// master; the viewer asks for the full frame. A customer's own upload is a data
// URL that was resized on the way in, and `cld()` hands it back untouched.
// =============================================================================

/** The largest tile (78px) on a 3x screen. */
const THUMB_WIDTH = 240;

/** The viewer's chunk. The bundler keeps the module, so a second ask is free. */
const loadViewer = () => import("../pdp/Lightbox").then((module) => module.default);

/** Fetch ahead of a press. A failure is retried by the press itself. */
const preloadViewer = () => {
  loadViewer().catch(() => {});
};

/**
 * Review photos as viewer rows: images only, each carrying its own alt text,
 * because the viewer's fallback (the product's name) would say whose pack it
 * is rather than whose photograph.
 */
export const reviewPhotoMedia = (photos, name = "a customer") => {
  const urls = (Array.isArray(photos) ? photos : [])
    .filter((src) => typeof src === "string" && src.trim())
    .map((src) => src.trim());
  return urls.map((url, index) => ({
    type: "image",
    url,
    alt:
      urls.length > 1
        ? `Photo ${index + 1} of ${urls.length} from ${name}`
        : `Photo from ${name}`,
  }));
};

/**
 * @param {string[]} photos       the review's `photos[]`
 * @param {string}   name         who took them, as the review is published
 * @param {string}   [productName] what they are of — the band says; the product
 *                                 page is already about one product
 * @param {"sm"|"md"} [size]      52px (the band's card) or 78px (the product page)
 */
const ReviewPhotos = ({ photos, name = "a customer", productName = "", size = "md", className = "" }) => {
  const media = useMemo(() => reviewPhotoMedia(photos, name), [photos, name]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  // The viewer component itself, once this strip has asked for it.
  const [Viewer, setViewer] = useState(null);

  if (media.length === 0) return null;

  const count = media.length;
  const show = (next) => {
    setIndex(next);
    if (Viewer) {
      setOpen(true);
      return;
    }
    loadViewer()
      .then((component) => {
        // A function, so React stores the component rather than calling it.
        setViewer(() => component);
        setOpen(true);
      })
      .catch(() => {});
  };

  return (
    <>
      <ul className={[styles.strip, className].filter(Boolean).join(" ")}>
        {media.map((row, i) => (
          <li key={i}>
            <button
              type="button"
              className={`${styles.thumb} ${styles[size] || styles.md}`}
              onPointerEnter={preloadViewer}
              onFocus={preloadViewer}
              onClick={() => show(i)}
              aria-haspopup="dialog"
              aria-label={
                count > 1
                  ? `View photo ${i + 1} of ${count} from ${name} at full size`
                  : `View photo from ${name} at full size`
              }
            >
              {/* Named by the button around it, so the picture itself is
                  silent rather than announced twice. */}
              <img
                className={styles.image}
                src={cld(row.url, { ar: "1:1", gravity: "center", w: THUMB_WIDTH })}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
                onError={onImageError}
              />
              <span className={styles.badge} aria-hidden="true">
                <Icon icon="mdi:magnify-plus-outline" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {Viewer ? (
        <Viewer
          open={open}
          onClose={() => setOpen(false)}
          media={media}
          index={Math.min(index, count - 1)}
          onIndexChange={setIndex}
          label={`Photos from ${name}`}
          caption={
            <>
              Photo by <strong>{name}</strong>
              {productName ? <> &middot; {productName}</> : null}
            </>
          }
          zoom={STOREFRONT_CONFIG.gallery.zoom}
        />
      ) : null}
    </>
  );
};

export default ReviewPhotos;
