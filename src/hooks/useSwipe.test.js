// The two rules that decide whether a drag across a gallery is a swipe: one
// finger, and mostly sideways. The second was always here; the first is the one
// the PDP lightbox needed — spreading two fingers to zoom moves each of them
// sideways, well past the threshold and mostly across, so without the guard the
// release of a pinch read as a flick and the gallery paged instead of
// magnifying. That was the lightbox's zoom "not coming out" on a phone.
//
// The gesture is driven with real PointerEvents rather than with fireEvent's
// shorthand, because `pointerId` is what the hook keys everything on and jsdom
// does not synthesise one.

import React, { useRef } from "react";
import { act, render, screen } from "@testing-library/react";
import useSwipe from "./useSwipe";

// jsdom has no PointerEvent, and MouseEvent drops `pointerId`/`pointerType`.
class TestPointerEvent extends window.MouseEvent {
  constructor(type, { pointerId = 1, pointerType = "touch", ...rest } = {}) {
    super(type, { bubbles: true, cancelable: true, ...rest });
    this.pointerId = pointerId;
    this.pointerType = pointerType;
  }
}

const Surface = ({ onLeft, onRight, ...options }) => {
  const ref = useRef(null);
  useSwipe(ref, { onLeft, onRight, ...options });
  return <div ref={ref} data-testid="surface" style={{ width: 400, height: 400 }} />;
};

/** A pointer going down ON the element — where the hook listens for the start. */
const down = (node, { id, x, y = 100, type = "touch", button = 0 }) =>
  act(() => {
    node.dispatchEvent(
      new TestPointerEvent("pointerdown", {
        pointerId: id,
        pointerType: type,
        button,
        clientX: x,
        clientY: y,
      })
    );
  });

/** A pointer coming up on the WINDOW — a flick usually leaves the element. */
const up = ({ id, x, y = 100, type = "touch" }) =>
  act(() => {
    window.dispatchEvent(
      new TestPointerEvent("pointerup", {
        pointerId: id,
        pointerType: type,
        clientX: x,
        clientY: y,
      })
    );
  });

describe("useSwipe", () => {
  let onLeft;
  let onRight;

  beforeEach(() => {
    onLeft = jest.fn();
    onRight = jest.fn();
  });

  it("reads a one-finger flick, in the direction it travelled", () => {
    render(<Surface onLeft={onLeft} onRight={onRight} />);
    const node = screen.getByTestId("surface");

    down(node, { id: 1, x: 300 });
    up({ id: 1, x: 100 });
    expect(onLeft).toHaveBeenCalledTimes(1);
    expect(onRight).not.toHaveBeenCalled();

    down(node, { id: 2, x: 100 });
    up({ id: 2, x: 300 });
    expect(onRight).toHaveBeenCalledTimes(1);
  });

  it("ignores a drag that is shorter than the threshold, or mostly vertical", () => {
    render(<Surface onLeft={onLeft} onRight={onRight} />);
    const node = screen.getByTestId("surface");

    down(node, { id: 1, x: 300 });
    up({ id: 1, x: 280 }); // 20px — a tap that wobbled
    down(node, { id: 2, x: 300, y: 100 });
    up({ id: 2, x: 200, y: 400 }); // 100 across, 300 down — a scroll
    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });

  // THE PINCH. Two fingers spreading apart both clear the threshold and both
  // travel further across than down, so each release looks exactly like a flick
  // unless the second finger is what disqualifies the gesture.
  it("takes nothing from a gesture a second finger joined", () => {
    render(<Surface onLeft={onLeft} onRight={onRight} />);
    const node = screen.getByTestId("surface");

    down(node, { id: 1, x: 190 });
    down(node, { id: 2, x: 210 });
    up({ id: 1, x: 60 }); // spread left
    up({ id: 2, x: 340 }); // spread right

    expect(onLeft).not.toHaveBeenCalled();
    expect(onRight).not.toHaveBeenCalled();
  });

  it("is listening again on the next single-finger gesture", () => {
    render(<Surface onLeft={onLeft} onRight={onRight} />);
    const node = screen.getByTestId("surface");

    down(node, { id: 1, x: 190 });
    down(node, { id: 2, x: 210 });
    up({ id: 1, x: 60 });
    up({ id: 2, x: 340 });

    down(node, { id: 3, x: 300 });
    up({ id: 3, x: 100 });
    expect(onLeft).toHaveBeenCalledTimes(1);
  });

  it("leaves secondary mouse buttons to the context menu", () => {
    render(<Surface onLeft={onLeft} onRight={onRight} />);
    const node = screen.getByTestId("surface");

    down(node, { id: 1, x: 300, type: "mouse", button: 2 });
    up({ id: 1, x: 100, type: "mouse" });
    expect(onLeft).not.toHaveBeenCalled();
  });

  // `touch-action` is part of the hook's contract, not the consumer's, and the
  // lightbox needs a different one from the PDP stage: it IS the page, so it
  // keeps every gesture rather than leaving vertical panning to the browser.
  it("writes the caller's touch-action, and gives it back on the way out", () => {
    const { rerender } = render(<Surface onLeft={onLeft} />);
    const node = screen.getByTestId("surface");
    expect(node.style.touchAction).toBe("pan-y");

    rerender(<Surface onLeft={onLeft} touchAction="none" />);
    expect(node.style.touchAction).toBe("none");

    // Switching the hook off runs its cleanup, which hands the element back
    // whatever it had before — the stylesheet's value, here nothing at all.
    rerender(<Surface onLeft={onLeft} touchAction="none" enabled={false} />);
    expect(node.style.touchAction).toBeFalsy();
  });

  it("attaches nothing while disabled", () => {
    render(<Surface onLeft={onLeft} onRight={onRight} enabled={false} />);
    const node = screen.getByTestId("surface");
    expect(node.style.touchAction).toBeFalsy();

    down(node, { id: 1, x: 300 });
    up({ id: 1, x: 100 });
    expect(onLeft).not.toHaveBeenCalled();
  });
});
