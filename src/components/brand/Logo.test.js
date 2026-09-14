// The brand masters carry a wide transparent bleed (2073x758 around 1923x502 of
// ink for the wordmark; 1254x1254 around 1024x1126, sitting low in frame, for
// the mark). Every slot in the storefront and the admin is sized for the ART,
// not for the bleed, so `Logo` trims at delivery — and the mark is squared up
// afterwards because its ink is taller than it is wide and the slots that take
// it are square.
//
// Delete the trim and nothing throws: the mastheads just quietly paint a lockup
// floating in a box a third empty, and the admin's collapsed drawer squashes a
// 0.91:1 mark into a 36px square. That is exactly the class of regression a
// render test catches and a code review does not, so the delivery chain is
// asserted here rather than eyeballed.
import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import brand from "../../config/brand";
import Logo from "./Logo";

const version = (url) => url.split("/upload/")[1];

describe("Logo", () => {
  it("delivers the wordmark trimmed, at 2x the painted width", () => {
    render(<Logo width={168} />);
    const img = screen.getByAltText(brand.name);

    expect(img.getAttribute("src")).toContain("e_trim");
    expect(img.getAttribute("src")).toContain("f_auto,q_auto,w_336");
    // Still the master this brand config names — trimmed, not substituted.
    expect(img.getAttribute("src")).toContain(version(brand.logoUrl));
  });

  it("reserves the wordmark's box from the trimmed aspect", () => {
    render(<Logo width={168} alt="" />);
    const img = document.querySelector("img");

    // 168 / 3.83 — the box is written before the art lands, which is what keeps
    // the masthead from shifting when it does (CLS).
    expect(img).toHaveAttribute("width", "168");
    expect(img).toHaveAttribute("height", String(Math.round(168 / brand.logoAspect)));
  });

  it("squares the mark on a transparent ground, never on b_auto", () => {
    render(<Logo variant="mark" width={36} alt="" />);
    const src = document.querySelector("img").getAttribute("src");

    expect(src).toContain("e_trim");
    expect(src).toContain("c_pad,ar_1:1,b_transparent");
    // b_auto would sample the artwork's edges and paint an opaque plate behind
    // gold line art drawn for a transparent ground.
    expect(src).not.toContain("b_auto");
    expect(src).toContain(version(brand.iconUrl));
  });

  it("gives the mark a square box", () => {
    render(<Logo variant="mark" width={40} alt="" />);
    const img = document.querySelector("img");

    expect(img).toHaveAttribute("width", "40");
    expect(img).toHaveAttribute("height", "40");
  });
});
