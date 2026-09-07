import React, { forwardRef } from "react";
import { cld, isCloudinary, srcSet, SRCSET_WIDTHS } from "../../utils/cloudinary";
import { PLACEHOLDER_IMG, onImageError } from "../../utils/helpers";
import styles from "./CloudinaryImage.module.css";

// =============================================================================
// CloudinaryImage — one responsive <img>, with the delivery rules built in
// =============================================================================
//
// The delivery rule for the whole rebuild is that a raw upload URL is never
// served at full size: the covers are multi-megapixel and the wordmark is
// 1400x400. `cld()` inserts `f_auto,q_auto,w_…` after `/upload/`, and `srcSet()`
// offers the five real layout widths, so the browser picks the file it needs.
// Anything that is not a Cloudinary upload URL — a placeholder host, an
// admin-typed link, a data URI — passes through untouched and simply gets no
// srcset. Callers never have to ask where an image came from.
//
// LAYOUT SHIFT. The wrapper takes `aspectRatio` and reserves the box before the
// bytes arrive, which is the whole reason this renders a wrapper at all. `plate`
// wraps it in `.sf-plate` instead — the 1:1 surface product photography is
// CENTRED on, never cropped to, because packaging is the product and a bottle
// with its cap sliced off by `object-fit: cover` is a defect.
//
// `priority` is for the one image above the fold (the hero, a PDP stage): eager
// loading plus `fetchpriority="high"`. The attribute is spelled in LOWERCASE
// deliberately — React 18.2 does not know the camelCase `fetchPriority` prop and
// warns on it, while the lowercase spelling passes straight through to the DOM.
// `home/HeroCarousel` passes `priority` on its first slide for exactly this.
//
// A broken URL falls back to the inline SVG placeholder once (`onImageError` is
// loop-guarded), so a dead link degrades to an on-palette well rather than to a
// browser's broken-image glyph.
// =============================================================================

const CloudinaryImage = forwardRef(function CloudinaryImage(
  {
    src,
    alt = "",
    widths = SRCSET_WIDTHS,
    sizes = "100vw",
    aspectRatio,
    fit = "contain",
    plate = false,
    crop,
    ar,
    pad,
    priority = false,
    placeholder = false,
    className = "",
    imgClassName = "",
    style,
    onError,
    ...rest
  },
  ref
) {
  const transform = { crop, ar, pad };
  const cloudinary = isCloudinary(src);

  // The `src` fallback is a MIDDLE width, not the largest: it is only used by
  // browsers that ignore srcset, and handing those the 1920 file is a penalty
  // paid by exactly the clients least able to afford it.
  const fallbackWidth = widths[Math.floor(widths.length / 2)] || widths[0];
  const resolved = src ? cld(src, { ...transform, w: fallbackWidth }) : PLACEHOLDER_IMG;
  const set = src && cloudinary ? srcSet(src, widths, transform) : undefined;

  const handleError = (event) => {
    onImageError(event);
    onError?.(event);
  };

  return (
    <span
      className={[
        plate ? "sf-plate" : "",
        placeholder ? "sf-placeholder-media" : "",
        styles.wrap,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      // `.sf-plate` brings its own 1:1; an explicit ratio still wins, which is
      // what a 4:5 editorial plate needs.
      style={{ aspectRatio, ...style }}
    >
      <img
        ref={ref}
        src={resolved}
        srcSet={set}
        sizes={set ? sizes : undefined}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchpriority={priority ? "high" : undefined}
        onError={handleError}
        className={[styles.img, fit === "cover" ? styles.cover : styles.contain, imgClassName]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
    </span>
  );
});

export default CloudinaryImage;
