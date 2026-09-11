// The rail's contract is small and easy to break by accident: every child gets
// a cell of its own, the scroll region keeps LIST semantics and an accessible
// name, the arrows are disabled at the ends of the travel, and the keyboard
// pages the track rather than the page.
//
// The card WIDTH — the clamp that is the reason this component exists — is a
// layout fact and cannot be asserted in jsdom, which reports every box as zero.
// It is checked in the browser instead; what is pinned down here is everything
// a refactor could silently drop.
//
// The repo has no src/setupTests.js, so the DOM matchers are registered here
// rather than globally.
import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import Rail from "./Rail";

const items = ["Face Wash", "Goat Milk Soap", "Body Wash"];

const renderRail = (props = {}) =>
  render(
    <Rail label="recently viewed products" {...props}>
      {items.map((name) => (
        <article key={name}>{name}</article>
      ))}
    </Rail>
  );

describe("Rail", () => {
  it("gives every child a cell of its own, in order", () => {
    renderRail();
    const cells = screen.getAllByRole("listitem");
    expect(cells).toHaveLength(items.length);
    cells.forEach((cell, index) => {
      expect(within(cell).getByText(items[index])).toBeInTheDocument();
    });
  });

  it("keeps the cards a named, focusable list", () => {
    renderRail();
    // A list, NOT a `role="group"`: the cards are a list of products, and a
    // group role here would take the list-item role off every cell under it.
    const track = screen.getByRole("list", { name: "recently viewed products" });
    expect(track).toHaveAttribute("tabindex", "0");
  });

  it("renders nothing at all for an empty set", () => {
    const { container } = render(<Rail label="products">{[]}</Rail>);
    expect(container).toBeEmptyDOMElement();
  });

  it("names its arrows after the rail, and disables them at the ends", () => {
    renderRail();
    // jsdom reports no layout, so the rail measures itself as not overflowing —
    // which is the state in which BOTH ends have been reached.
    expect(
      screen.getByRole("button", { name: "Scroll recently viewed products backwards" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Scroll recently viewed products forwards" })
    ).toBeDisabled();
  });

  it("omits the arrows entirely when the caller does not want them", () => {
    renderRail({ controls: false });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("pages the track on the arrow keys and jumps on Home/End", () => {
    renderRail();
    const track = screen.getByRole("list", { name: "recently viewed products" });
    const scrollBy = jest.fn();
    const scrollTo = jest.fn();
    track.scrollBy = scrollBy;
    track.scrollTo = scrollTo;
    // jsdom gives every element a zero clientWidth, so the distance is zero —
    // the DIRECTION is the part this owns, and the part a refactor can invert.
    fireEvent.keyDown(track, { key: "ArrowRight" });
    expect(scrollBy).toHaveBeenCalledWith(
      expect.objectContaining({ left: 0, behavior: "smooth" })
    );

    fireEvent.keyDown(track, { key: "End" });
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });

    fireEvent.keyDown(track, { key: "Home" });
    expect(scrollTo).toHaveBeenLastCalledWith({ left: 0, behavior: "smooth" });
  });

  it("leaves keys it does not own to the browser", () => {
    renderRail();
    const track = screen.getByRole("list", { name: "recently viewed products" });
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    track.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("hands the card sizing to CSS as custom properties", () => {
    const { container } = render(
      <Rail label="products" cardMin="248px" cardMax="300px" perView={4.2}>
        <article>One</article>
      </Rail>
    );
    const rail = container.firstChild;
    expect(rail.style.getPropertyValue("--rail-card-min")).toBe("248px");
    expect(rail.style.getPropertyValue("--rail-card-max")).toBe("300px");
    expect(rail.style.getPropertyValue("--rail-per-view")).toBe("4.2");
  });
});
