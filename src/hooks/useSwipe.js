import { useEffect, useRef } from "react";

// =============================================================================
// useSwipe(ref, { onLeft, onRight, threshold, enabled })
// =============================================================================
// The one horizontal gesture the storefront reads: a flick across a gallery.
//
// POINTER EVENTS, not touch events, which is what makes "works with mouse drag
// too" a property of the implementation rather than a second code path — a
// mouse, a finger and a stylus all arrive as the same three events, and a
// desktop visitor can drag the PDP stage exactly as a phone visitor swipes it.
//
// IT IGNORES VERTICAL GESTURES, and it has to. A gallery on a phone sits in the
// middle of a page the visitor is scrolling THROUGH; a swipe handler that
// answers to a downward drag steals every scroll that happens to start on the
// pack. Two things enforce that:
//
//   • `touch-action: pan-y` is written onto the element by this hook, so the
//     browser keeps handling vertical panning natively and never waits on us.
//     It is set here rather than left to a stylesheet because it is part of the
//     contract — a consumer that forgets it gets a gallery that eats scrolls.
//   • A gesture only counts when it travelled further across than down
//     (|dx| > |dy|) AND cleared `threshold`. A 40px floor is about a thumb's
//     width: shorter than that is a tap that wobbled, not a swipe.
//
// THE RELEASE IS READ ON `window`. A drag that starts on the stage and ends
// past its edge — which is most of them, because a flick keeps going — never
// fires `pointerup` on the element. Pointer capture would fix that too, but
// capturing on a container full of buttons changes where their clicks land, so
// the listener goes on the window and the element stays untouched.
//
// NATIVE DRAG IS CANCELLED. An <img> is draggable by default, so a mouse drag
// across a gallery would otherwise start the browser's own image drag — a ghost
// thumbnail follows the cursor, the pointer stream stops dead, and no swipe ever
// completes. Cancelling `dragstart` on the element is what makes "works with
// mouse drag too" true of a surface whose whole content is a photograph.
//
// `enabled: false` removes the listeners entirely (and restores the element's
// own `touch-action`) — the lightbox turns the gesture off while an image is
// zoomed in, because there the same drag means "pan", not "next".
// =============================================================================

/**
 * @param {React.RefObject<HTMLElement>} ref  the element the gesture is read on
 * @param {object}   [options]
 * @param {Function} [options.onLeft]     leftward swipe — conventionally "next"
 * @param {Function} [options.onRight]    rightward swipe — conventionally "previous"
 * @param {number}   [options.threshold]  px of horizontal travel required (40)
 * @param {boolean}  [options.enabled]    listen at all (true)
 */
export default function useSwipe(
  ref,
  { onLeft, onRight, threshold = 40, enabled = true } = {}
) {
  // The callbacks are read at gesture time, so a consumer that rebuilds them
  // every render does not re-bind a listener every render.
  const handlers = useRef({ onLeft, onRight });
  useEffect(() => {
    handlers.current = { onLeft, onRight };
  }, [onLeft, onRight]);

  useEffect(() => {
    const node = ref?.current;
    if (!node || !enabled || typeof window === "undefined") return undefined;

    const previousTouchAction = node.style.touchAction;
    node.style.touchAction = "pan-y";

    let start = null;

    const onPointerDown = (event) => {
      // Secondary mouse buttons are menus, not gestures.
      if (event.pointerType === "mouse" && event.button !== 0) return;
      start = { x: event.clientX, y: event.clientY, id: event.pointerId };
    };

    const onPointerUp = (event) => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) < threshold) return;
      // A diagonal that is mostly vertical belongs to the page's scroll.
      if (Math.abs(dx) <= Math.abs(dy)) return;
      if (dx < 0) handlers.current.onLeft?.();
      else handlers.current.onRight?.();
    };

    const forget = () => {
      start = null;
    };

    const cancelNativeDrag = (event) => event.preventDefault();

    node.addEventListener("pointerdown", onPointerDown);
    node.addEventListener("dragstart", cancelNativeDrag);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", forget);

    return () => {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("dragstart", cancelNativeDrag);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", forget);
      node.style.touchAction = previousTouchAction;
    };
  }, [ref, threshold, enabled]);
}
