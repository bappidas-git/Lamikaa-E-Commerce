import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { cld } from "../../utils/cloudinary";
import { onImageError, PLACEHOLDER_IMG } from "../../utils/helpers";
import { productAlt } from "../../utils/product";
import useSwipe from "../../hooks/useSwipe";
import Modal from "../ui/Modal";
import VideoPlayer from "../ui/VideoPlayer";
import styles from "./Lightbox.module.css";

// =============================================================================
// Lightbox — the gallery, full screen, at full resolution
// =============================================================================
//
// NO LIBRARY. A lightbox is a dialog with a big picture in it, and `ui/Modal`
// already owns every hard part of a dialog: the portal, `aria-modal`, the focus
// trap, the focus restore, Escape, the body scroll lock and closing on
// navigation. What is left is the picture — which is the part a packaged
// lightbox would style for us, and the one part this storefront will not hand
// over.
//
// IT IS THE SAME GALLERY, not a second one. `index` and `onIndexChange` are the
// PARENT's state: whatever you arrived on is what opens, whatever you move to
// here is what the stage shows when you close. Two carousels that drift apart
// is the classic lightbox defect and it is designed out rather than patched.
//
// THE SCRIM IS NEARLY OPAQUE AND IS NOT BLURRED. `Modal`'s panel is glass; a
// 20px backdrop filter over a full-screen photograph costs a compositing pass
// on every frame of every pan for a blur nobody can see behind an image that
// covers the viewport. The panel is repainted here as a flat 96% ground.
//
// ZOOM (images only, and only while STOREFRONT_CONFIG.gallery.zoom is on):
//   wheel, pinch (two pointers, their distance ratio), the +/- buttons, and
//   double-click / double-tap for a straight 1x <-> 2x. 1x to 4x, clamped, and
//   the pan offset is clamped to the picture's own edges so a zoomed image can
//   never be dragged off screen and lost. Zooming resets on every item change.
//
// THE GESTURE IS EXCLUSIVE. `useSwipe` is disabled the moment the picture is
// zoomed: the same drag means "next" at 1x and "pan" above it, and guessing
// between them is how a lightbox ends up doing neither.
// =============================================================================

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
const DOUBLE_ZOOM = 2;

/** The delivered width for a full-screen frame — uncropped, whatever the crop. */
const FULL_WIDTH = 2000;

/** Two taps this close together, in time and in space, are one double-tap. */
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_PX = 20;

const REST = { scale: MIN_ZOOM, x: 0, y: 0 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Any wheel delta, pinch ratio or button press, held inside 1x-4x. */
export const clampScale = (value) => {
  const scale = Number(value);
  return Number.isFinite(scale) ? clamp(scale, MIN_ZOOM, MAX_ZOOM) : MIN_ZOOM;
};

/**
 * How far a magnified picture may travel on one axis before its own edge would
 * come inside the frame — which is the whole rule behind "drag to pan": a
 * picture that fits (or is not zoomed) cannot be dragged at all, and one that
 * overflows may be dragged by exactly half of what it overflows by, each way.
 */
export const panBounds = (pictureSize, viewportSize, scale) =>
  Math.max(0, (pictureSize * scale - viewportSize) / 2);

const distanceBetween = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

const Lightbox = ({
  open = false,
  onClose,
  media = [],
  index = 0,
  onIndexChange,
  product,
  zoom: zoomEnabled = true,
}) => {
  const viewportRef = useRef(null);
  const imageRef = useRef(null);
  // Live pointers, by id: one is a drag, two are a pinch.
  const pointersRef = useRef(new Map());
  const pinchRef = useRef(null);
  const panRef = useRef(null);
  const lastTapRef = useRef(null);

  const [zoom, setZoom] = useState(REST);

  const count = media.length;
  const row = media[index] || null;
  const isImage = !!row && row.type !== "video";
  const canZoom = zoomEnabled && isImage;
  const zoomed = zoom.scale > MIN_ZOOM;

  const step = useCallback(
    (delta) => {
      if (count < 2) return;
      onIndexChange?.((index + delta + count) % count);
    },
    [count, index, onIndexChange]
  );

  // Every item arrives at 1x. A picture that opens already panned somewhere the
  // previous one was dragged to is a picture nobody asked for.
  useEffect(() => {
    setZoom(REST);
    pinchRef.current = null;
    panRef.current = null;
    pointersRef.current.clear();
  }, [index, open]);

  /**
   * Move to `nextScale`, keeping `anchor` (a viewport point) over the same
   * pixel of the picture, and clamp the offset to the picture's own edges.
   */
  const zoomTo = useCallback((nextScale, anchor) => {
    setZoom((current) => {
      const scale = clampScale(nextScale);
      if (scale === current.scale) return current;
      if (scale === MIN_ZOOM) return REST;

      const view = viewportRef.current;
      const picture = imageRef.current;
      const ratio = scale / current.scale;

      let { x, y } = current;
      if (anchor && view) {
        const rect = view.getBoundingClientRect();
        // The anchor relative to the centre the transform pivots around.
        const px = anchor.x - (rect.left + rect.width / 2);
        const py = anchor.y - (rect.top + rect.height / 2);
        x = px - (px - x) * ratio;
        y = py - (py - y) * ratio;
      } else {
        x *= ratio;
        y *= ratio;
      }

      // `offsetWidth` is the UNtransformed box; the rect would already carry
      // the scale we are in the middle of changing.
      const maxX = picture && view ? panBounds(picture.offsetWidth, view.clientWidth, scale) : 0;
      const maxY = picture && view ? panBounds(picture.offsetHeight, view.clientHeight, scale) : 0;

      return { scale, x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
    });
  }, []);

  const panBy = useCallback((dx, dy, origin) => {
    setZoom((current) => {
      const view = viewportRef.current;
      const picture = imageRef.current;
      const maxX =
        picture && view ? panBounds(picture.offsetWidth, view.clientWidth, current.scale) : 0;
      const maxY =
        picture && view ? panBounds(picture.offsetHeight, view.clientHeight, current.scale) : 0;
      return {
        ...current,
        x: clamp(origin.x + dx, -maxX, maxX),
        y: clamp(origin.y + dy, -maxY, maxY),
      };
    });
  }, []);

  // ---- Wheel ---------------------------------------------------------------
  // Registered by hand because it must be NON-passive: a wheel over a zoomable
  // picture belongs to the picture, and only `preventDefault()` stops the page
  // behind the dialog from taking it as well.
  useEffect(() => {
    const view = viewportRef.current;
    if (!open || !canZoom || !view) return undefined;

    const onWheel = (event) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      zoomTo(zoom.scale * factor, { x: event.clientX, y: event.clientY });
    };

    view.addEventListener("wheel", onWheel, { passive: false });
    return () => view.removeEventListener("wheel", onWheel);
  }, [open, canZoom, zoom.scale, zoomTo]);

  // ---- Pointers: pinch, pan, double-tap ------------------------------------
  const onPointerDown = (event) => {
    if (!canZoom) return;
    const pointers = pointersRef.current;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture?.(event.pointerId);

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchRef.current = { distance: distanceBetween(a, b), scale: zoom.scale };
      panRef.current = null;
    } else if (pointers.size === 1 && zoomed) {
      panRef.current = { x: event.clientX, y: event.clientY, origin: { x: zoom.x, y: zoom.y } };
    }
  };

  const onPointerMove = (event) => {
    if (!canZoom) return;
    const pointers = pointersRef.current;
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size >= 2 && pinchRef.current) {
      const [a, b] = [...pointers.values()];
      const distance = distanceBetween(a, b);
      if (pinchRef.current.distance > 0) {
        zoomTo(pinchRef.current.scale * (distance / pinchRef.current.distance), {
          x: (a.x + b.x) / 2,
          y: (a.y + b.y) / 2,
        });
      }
      return;
    }

    if (panRef.current) {
      panBy(
        event.clientX - panRef.current.x,
        event.clientY - panRef.current.y,
        panRef.current.origin
      );
    }
  };

  const endPointer = (event) => {
    const pointers = pointersRef.current;
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinchRef.current = null;
    if (pointers.size === 0) panRef.current = null;
  };

  const onPointerUp = (event) => {
    if (!canZoom) {
      endPointer(event);
      return;
    }
    const wasPinching = pointersRef.current.size >= 2;
    endPointer(event);
    if (wasPinching || event.pointerType === "mouse") return;

    // Double-TAP. A touch device gets no reliable `dblclick` once the element
    // has claimed the gesture with `touch-action`, so the pair is timed here.
    const now = Date.now();
    const last = lastTapRef.current;
    lastTapRef.current = { at: now, x: event.clientX, y: event.clientY };
    if (
      last &&
      now - last.at < DOUBLE_TAP_MS &&
      Math.abs(event.clientX - last.x) < DOUBLE_TAP_PX &&
      Math.abs(event.clientY - last.y) < DOUBLE_TAP_PX
    ) {
      lastTapRef.current = null;
      zoomTo(zoomed ? MIN_ZOOM : DOUBLE_ZOOM, { x: event.clientX, y: event.clientY });
    }
  };

  const onDoubleClick = (event) => {
    if (!canZoom) return;
    zoomTo(zoomed ? MIN_ZOOM : DOUBLE_ZOOM, { x: event.clientX, y: event.clientY });
  };

  // A swipe is a swipe only at 1x — above it the same drag is a pan.
  useSwipe(viewportRef, {
    onLeft: () => step(1),
    onRight: () => step(-1),
    enabled: open && count > 1 && !zoomed,
  });

  // ---- Keyboard ------------------------------------------------------------
  // Scoped to the panel rather than the document: Escape is already the focus
  // trap's, and a key the video player has claimed (it calls preventDefault on
  // its own seek keys) must not also move the gallery.
  const onKeyDown = (event) => {
    if (event.defaultPrevented) return;
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
        onIndexChange?.(0);
        break;
      case "End":
        event.preventDefault();
        onIndexChange?.(Math.max(0, count - 1));
        break;
      case "+":
      case "=":
        if (!canZoom) return;
        event.preventDefault();
        zoomTo(zoom.scale + ZOOM_STEP);
        break;
      case "-":
      case "_":
        if (!canZoom) return;
        event.preventDefault();
        zoomTo(zoom.scale - ZOOM_STEP);
        break;
      default:
        break;
    }
  };

  if (!row) return null;

  const alt = productAlt(product, row);
  const title = row.title || alt;
  const source = isImage ? cld(row.url, { w: FULL_WIDTH }) : row.url;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="full"
      showClose={false}
      closeOnBackdrop={false}
      aria-label={`${product?.name || "Product"} media viewer`}
      className={styles.panel}
      onKeyDown={onKeyDown}
    >
      <div className={styles.head}>
        {count > 1 ? (
          <p className={`sf-glass ${styles.counter}`} aria-live="polite">
            {index + 1} / {count}
          </p>
        ) : (
          <span />
        )}
        <button
          type="button"
          className={`sf-glass ${styles.control}`}
          onClick={onClose}
          aria-label="Close"
        >
          <Icon icon="mdi:close" aria-hidden="true" />
        </button>
      </div>

      <div
        ref={viewportRef}
        className={[
          styles.viewport,
          canZoom && !zoomed ? styles.zoomable : "",
          zoomed ? styles.grabbing : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={endPointer}
        onDoubleClick={onDoubleClick}
      >
        {isImage ? (
          <img
            ref={imageRef}
            src={source || PLACEHOLDER_IMG}
            alt={alt}
            className={styles.image}
            draggable={false}
            onError={onImageError}
            style={{
              transform: `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.scale})`,
            }}
          />
        ) : (
          <VideoPlayer
            key={row.url}
            src={row.url}
            poster={row.poster || undefined}
            title={title}
            preload="metadata"
            className={styles.video}
          />
        )}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            className={`sf-glass ${styles.control} ${styles.prev}`}
            onClick={() => step(-1)}
            aria-label="Previous"
          >
            <Icon icon="mdi:chevron-left" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`sf-glass ${styles.control} ${styles.next}`}
            onClick={() => step(1)}
            aria-label="Next"
          >
            <Icon icon="mdi:chevron-right" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className={styles.foot}>
        {canZoom ? (
          <div className={`sf-glass ${styles.zoomBar}`}>
            <button
              type="button"
              className={styles.zoomButton}
              onClick={() => zoomTo(zoom.scale - ZOOM_STEP)}
              disabled={zoom.scale <= MIN_ZOOM}
              aria-label="Zoom out"
            >
              <Icon icon="mdi:minus" aria-hidden="true" />
            </button>
            <span className={styles.zoomLevel} aria-live="polite">
              {Math.round(zoom.scale * 100) / 100}×
            </span>
            <button
              type="button"
              className={styles.zoomButton}
              onClick={() => zoomTo(zoom.scale + ZOOM_STEP)}
              disabled={zoom.scale >= MAX_ZOOM}
              aria-label="Zoom in"
            >
              <Icon icon="mdi:plus" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {/* The shortcuts, for the pointer that has a keyboard beside it. */}
        <p className={styles.hints}>
          <span>← → browse</span>
          {canZoom ? <span>+ − zoom</span> : null}
          <span>Esc close</span>
        </p>
      </div>
    </Modal>
  );
};

export default Lightbox;
