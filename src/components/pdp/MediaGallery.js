import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DURATION, INSTANT, t } from "../../theme/motion";
import { cld } from "../../utils/cloudinary";
import { onImageError, PLACEHOLDER_IMG } from "../../utils/helpers";
import { primaryImage, productAlt, productMedia } from "../../utils/product";
import { STOREFRONT_CONFIG } from "../../theme/tokens";
import useSwipe from "../../hooks/useSwipe";
import { Button, CloudinaryImage, GlowWrap, VideoPlayer } from "../ui";
import Lightbox from "./Lightbox";
import styles from "./MediaGallery.module.css";

// =============================================================================
// MediaGallery — the pack, its other frames, and its films
// =============================================================================
//
// ONE LIST, TWO KINDS. `product.media` is an ordered mix of images and videos
// (`utils/product.js` normalises whatever the record holds into it), and the
// gallery treats them as one sequence: one index, one counter, one rail, one
// set of arrows. A separate "video tab" would ask a shopper to know, before
// they look, which of the two things they wanted.
//
// THE PLATE NEVER CROPS — AND NEITHER DOES CLOUDINARY. Every product cover is a
// photograph of packaging, and packaging IS the product: a bottle with its cap
// sliced off by `object-fit: cover` is a defect, not a composition. So the stage
// contains, always, and the delivery does the same. The ONLY transform on the
// way down is `c_pad,b_auto`, which letterboxes the COMPLETE frame to the
// stage's ratio on a ground sampled from the shot's own edges — the plate is
// filled edge to edge and not one pixel of the pack is lost. Whatever a record
// holds, `utils/product.js` has already dropped any stored source-pixel crop
// before the gallery sees a row, so there is no second version of a frame to
// offer and no toggle to offer it with.
//
// THE RAIL IS ONE ELEMENT, moved by CSS — a vertical column of 72px squares to
// the left of the stage from 1025px, a horizontal 56px snap strip beneath it
// below that. Rendering it twice would give a screen reader two tablists for
// one gallery and a keyboard visitor two copies of every thumbnail.
//
// ONLY THE ACTIVE ROW IS MOUNTED. A five-frame gallery must not put five
// <video> elements on a product page — even at `preload="metadata"` that is
// five network round trips nobody asked for — so the stage renders exactly one
// item and the crossfade is an `AnimatePresence` swap. A VIDEO leaving takes
// the instant exit rather than the 320ms one: the element has to be gone (and
// its audio with it) the moment the index moves, not a third of a second later.
//
// FIRST IMAGE IS THE LCP. It is the one image on this page that loads eagerly
// with `fetchpriority="high"`; every thumbnail and every later frame is lazy,
// and the thumbnails are delivered at 144px rather than at cover resolution.
// Everything reserves its box with `aspect-ratio`, so nothing here shifts.
//
// STATE THAT BELONGS TO THE PRODUCT, NOT TO THE COMPONENT: mount this with
// `key={product.id}` (ProductDetails does) and a navigation between two
// products resets the index and the lightbox the way a new page should,
// without a single reset effect.
// =============================================================================

/**
 * The stage ratio Cloudinary delivers into. The desktop plate is 4:5 and the
 * phone plate is 1:1, and ONE delivered file serves both: the covers are tall,
 * so a square tile would have set every pack as a narrow strip down the middle
 * of a very wide mount at both sizes, while the 4:5 tile letterboxes only on
 * the phone, by a few dozen pixels a side.
 */
const STAGE_AR = "4:5";

/** Thumbnails are 72px at most, on a 2x screen. */
const THUMB_WIDTH = 144;

// ---- The gallery's three copy/URL decisions, as functions ------------------
// Pinned down here so they can be read (and tested) without clicking through
// five frames of eight products.

/** "3 / 7". 1-based, because a shopper counts from one. */
export const counterLabel = (index, count) => `${index + 1} / ${count}`;

/**
 * A thumbnail's accessible name. A video says so — its poster is a frame of the
 * pack and would otherwise be indistinguishable from the image beside it — and
 * an image needs none, because its own `alt` already names it.
 */
export const thumbLabel = (product, row) =>
  row?.type === "video" ? `Video: ${row.title || productAlt(product, row)}` : undefined;

/**
 * The delivered thumbnail: a square, 144px for a 72px tile on a 2x screen,
 * holding the whole frame padded onto its own sampled ground — so the rail
 * reads as the stage in miniature and a shopper can tell two frames apart by
 * what is actually in them. A video shows its poster, or the pack itself when
 * the record has not been given one.
 */
export const thumbSource = (row, posterFallback = "") => {
  if (!row) return "";
  const source = row.type === "video" ? row.poster || posterFallback : row.url;
  if (!source) return "";
  return cld(source, { ar: "1:1", pad: true, w: THUMB_WIDTH });
};

/** The next index in a gallery that wraps at both ends. */
export const stepIndex = (current, delta, count) =>
  count > 0 ? (current + delta + count) % count : 0;

const MediaGallery = ({
  product,
  media = productMedia(product),
  initialIndex = 0,
}) => {
  const stageRef = useRef(null);
  const zoomRef = useRef(null);
  const thumbRefs = useRef([]);
  const railScrolled = useRef(false);
  const lightboxWasOpen = useRef(false);

  const reduce = useReducedMotion();
  const baseId = useId();
  const stageId = `${baseId}-stage`;

  const count = media.length;
  const [rawIndex, setIndex] = useState(() =>
    Math.min(Math.max(0, Number(initialIndex) || 0), Math.max(0, count - 1))
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // A record whose media shrank under us (an admin deleting a row while the
  // page is open) must not leave the stage pointing past the end.
  const index = Math.min(rawIndex, Math.max(0, count - 1));
  const row = media[index] || null;

  const step = useCallback(
    (delta) => {
      if (count < 2) return;
      setIndex((current) => stepIndex(current, delta, count));
    },
    [count]
  );

  // The active thumbnail comes into view in the rail — `nearest`, so a rail
  // that already shows it does not move, and the PAGE never scrolls because of
  // a gallery the visitor has not touched yet.
  useEffect(() => {
    if (!railScrolled.current) {
      railScrolled.current = true;
      return;
    }
    thumbRefs.current[index]?.scrollIntoView?.({
      block: "nearest",
      inline: "nearest",
    });
  }, [index]);

  // Focus returns to the Zoom button the lightbox was opened from. `useFocusTrap`
  // has already restored focus to whatever opened the dialog — which is the
  // stage itself when it was opened with Enter — so this runs after it and
  // lands focus where the visitor can re-open the picture.
  useEffect(() => {
    if (lightboxOpen) {
      lightboxWasOpen.current = true;
      return undefined;
    }
    if (!lightboxWasOpen.current) return undefined;
    lightboxWasOpen.current = false;
    const timer = window.setTimeout(() => {
      (zoomRef.current || stageRef.current)?.focus?.();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [lightboxOpen]);

  useSwipe(stageRef, {
    onLeft: () => step(1),
    onRight: () => step(-1),
    enabled: count > 1,
  });

  if (!row) return null;

  const isVideo = row.type === "video";
  const posterFallback = primaryImage(product)?.url || "";
  const name = product?.name || "Product";
  const multi = count > 1;
  const canLightbox = STOREFRONT_CONFIG.gallery.lightbox && !isVideo;
  // The first image in the list is the page's largest paint. Anything else
  // reaching the stage has been asked for, so it can load lazily.
  const firstImageIndex = media.findIndex((item) => item.type !== "video");

  const openLightbox = () => {
    if (!STOREFRONT_CONFIG.gallery.lightbox) return;
    setLightboxOpen(true);
  };

  // The stage answers keys only when the STAGE holds focus: the video player
  // inside it owns Space, M and the arrows while it is focused, and the arrows
  // on the rail belong to the rail.
  const onStageKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        step(1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        step(-1);
        break;
      case "Home":
        event.preventDefault();
        setIndex(0);
        break;
      case "End":
        event.preventDefault();
        setIndex(Math.max(0, count - 1));
        break;
      case "Enter":
      case " ":
        if (!canLightbox) return;
        event.preventDefault();
        openLightbox();
        break;
      default:
        break;
    }
  };

  // Roving tabindex: one thumbnail is in the tab order, the arrows move both
  // the selection and the focus, so the rail is walkable with the keyboard
  // alone in either orientation it is drawn in.
  const selectThumb = (next) => {
    setIndex(next);
    thumbRefs.current[next]?.focus?.();
  };

  const onRailKeyDown = (event) => {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? -1
        : 0;
    if (delta) {
      event.preventDefault();
      selectThumb(stepIndex(index, delta, count));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      selectThumb(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectThumb(count - 1);
    }
  };

  const frameMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: t(reduce, DURATION.base) },
    // A film leaves at once; a photograph crossfades.
    exit: { opacity: 0, transition: isVideo ? INSTANT : t(reduce, DURATION.base) },
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.stageWrap}>
        <GlowWrap tone="gold" intensity={0.14} className={styles.glow}>
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
          <div
            ref={stageRef}
            id={stageId}
            className={`sf-plate ${styles.stage}`}
            role="group"
            aria-roledescription="carousel"
            aria-label={`${name} media`}
            tabIndex={0}
            onKeyDown={onStageKeyDown}
          >
            <AnimatePresence initial={false}>
              <motion.div key={index} className={styles.frame} {...frameMotion}>
                {isVideo ? (
                  <VideoPlayer
                    src={row.url}
                    poster={row.poster || posterFallback || undefined}
                    title={row.title || `${name} video`}
                    preload="metadata"
                    className={styles.videoFrame}
                  />
                ) : (
                  <CloudinaryImage
                    src={row.url}
                    alt={productAlt(product, row)}
                    ar={STAGE_AR}
                    pad
                    fit="contain"
                    priority={index === firstImageIndex}
                    sizes="(max-width: 768px) 100vw, 48vw"
                    className={styles.media}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {canLightbox ? (
              <Button
                ref={zoomRef}
                variant="icon"
                icon="mdi:magnify-plus-outline"
                srLabel="Zoom"
                onClick={openLightbox}
                className={styles.zoom}
              />
            ) : null}

            {multi ? (
              <>
                <Button
                  variant="icon"
                  icon="mdi:chevron-left"
                  srLabel="Previous"
                  onClick={() => step(-1)}
                  className={`${styles.arrow} ${styles.arrowPrev}`}
                />
                <Button
                  variant="icon"
                  icon="mdi:chevron-right"
                  srLabel="Next"
                  onClick={() => step(1)}
                  className={`${styles.arrow} ${styles.arrowNext}`}
                />
                <p className={`sf-glass ${styles.counter}`} aria-live="polite">
                  {counterLabel(index, count)}
                </p>
              </>
            ) : null}
          </div>
        </GlowWrap>

        {/* Dots repeat the counter for the eye on a phone; the counter is what
            a screen reader is given, so these are inert. */}
        {multi ? (
          <div className={styles.dots} aria-hidden="true">
            {media.map((item, i) => (
              <span
                key={`${item.url}-dot-${i}`}
                className={[styles.dot, i === index ? styles.dotActive : ""]
                  .filter(Boolean)
                  .join(" ")}
              />
            ))}
          </div>
        ) : null}
      </div>

      {multi ? (
        <div
          className={styles.rail}
          role="tablist"
          aria-label="Product media"
          onKeyDown={onRailKeyDown}
        >
          {media.map((item, i) => {
            const active = i === index;
            const video = item.type === "video";
            return (
              <button
                key={`${item.url}-${i}`}
                ref={(node) => {
                  thumbRefs.current[i] = node;
                }}
                type="button"
                role="tab"
                id={`${baseId}-tab-${i}`}
                aria-selected={active}
                aria-controls={stageId}
                tabIndex={active ? 0 : -1}
                aria-label={thumbLabel(product, item)}
                className={[styles.thumb, active ? styles.thumbActive : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setIndex(i)}
              >
                <img
                  src={thumbSource(item, posterFallback) || PLACEHOLDER_IMG}
                  alt={video ? "" : productAlt(product, item)}
                  loading="lazy"
                  decoding="async"
                  onError={onImageError}
                />
                {video ? (
                  <span className={styles.playBadge} aria-hidden="true">
                    <Icon icon="mdi:play" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}

      {STOREFRONT_CONFIG.gallery.lightbox ? (
        <Lightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          media={media}
          index={index}
          onIndexChange={setIndex}
          product={product}
          zoom={STOREFRONT_CONFIG.gallery.zoom}
        />
      ) : null}
    </div>
  );
};

export default MediaGallery;
