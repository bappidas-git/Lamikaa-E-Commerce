// The player's one branch: a hosted link becomes the provider's iframe, a file
// link stays the <video> the hand-rolled chrome was built for.
//
// THE BUG. Every video row used to go into `<video src>`, which decodes a media
// FILE. A YouTube watch URL is an HTML page, so the element errored on sight and
// the gallery printed "Video unavailable" over a link that plays fine in a tab.
import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import VideoPlayer from "./VideoPlayer";

// useInView observes; jsdom has no IntersectionObserver. A stub that never
// fires is enough — nothing here asserts on scrolling out of view.
beforeAll(() => {
  global.IntersectionObserver =
    global.IntersectionObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

const YT = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
const FILE = "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4";

const frame = (container) => container.querySelector("iframe");
const video = (container) => container.querySelector("video");

describe("a hosted link", () => {
  it("does not hand a YouTube URL to <video>", () => {
    const { container } = render(<VideoPlayer src={YT} title="How to use" />);
    expect(video(container)).toBeNull();
  });

  // No third-party frame, script or cookie for a shopper who only scrolled past.
  it("renders no iframe until it is pressed", () => {
    const { container } = render(<VideoPlayer src={YT} title="How to use" />);
    expect(frame(container)).toBeNull();
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });

  it("frames the provider's player once pressed, and autoplays because the press asked", () => {
    const { container } = render(<VideoPlayer src={YT} title="How to use" />);
    fireEvent.click(screen.getByRole("button", { name: /play/i }));

    const el = frame(container);
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("src", expect.stringContaining("youtube-nocookie.com/embed/dQw4w9WgXcQ"));
    expect(el.getAttribute("src")).toContain("autoplay=1");
    expect(el).toHaveAttribute("allowfullscreen");
  });

  it("falls back to the provider's own still when the row has no poster", () => {
    const { container } = render(<VideoPlayer src={YT} title="How to use" />);
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
    );
  });

  // Priority: the row's poster, THEN the provider's still, THEN the pack.
  it("prefers the row's own poster over the provider's", () => {
    const { container } = render(
      <VideoPlayer src={YT} poster="https://cdn.test/mine.jpg" posterFallback="https://cdn.test/pack.jpg" />
    );
    expect(container.querySelector("img")).toHaveAttribute("src", "https://cdn.test/mine.jpg");
  });

  it("names the provider, so nobody is surprised by whose player opens", () => {
    render(<VideoPlayer src={YT} title="How to use" />);
    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play How to use on YouTube" })
    ).toBeInTheDocument();
  });

  it("opens from the keyboard as well as the badge", () => {
    const { container } = render(<VideoPlayer src={YT} title="How to use" />);
    fireEvent.keyDown(screen.getByRole("group"), { key: "k" });
    expect(frame(container)).toBeInTheDocument();
  });

  it.each([
    ["https://vimeo.com/123456789", "player.vimeo.com/video/123456789"],
    ["https://www.dailymotion.com/video/x8abcde", "dailymotion.com/embed/video/x8abcde"],
    ["https://www.loom.com/share/abc123", "loom.com/embed/abc123"],
    ["https://drive.google.com/file/d/1AbC/view", "drive.google.com/file/d/1AbC/preview"],
  ])("frames %s", (src, expected) => {
    const { container } = render(<VideoPlayer src={src} title="Film" />);
    fireEvent.click(screen.getByRole("button", { name: /play/i }));
    expect(frame(container).getAttribute("src")).toContain(expected);
  });
});

describe("a file link", () => {
  // The regression guard for the eight seeded products, all of which are .mp4.
  it("still gets the <video> element and none of the embed chrome", () => {
    const { container } = render(<VideoPlayer src={FILE} title="Brand story" />);
    expect(video(container)).toHaveAttribute("src", FILE);
    expect(frame(container)).toBeNull();
    expect(screen.queryByText("YouTube")).not.toBeInTheDocument();
  });

  it("keeps the hand-rolled controls", () => {
    render(<VideoPlayer src={FILE} title="Brand story" />);
    // Two of them while paused, by design: the centre badge over the poster and
    // the one in the control bar.
    expect(screen.getAllByRole("button", { name: "Play Brand story" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Unmute Brand story" })).toBeInTheDocument();
  });

  it("takes posterFallback when the row has no poster", () => {
    const { container } = render(
      <VideoPlayer src={FILE} posterFallback="https://cdn.test/pack.jpg" />
    );
    expect(video(container)).toHaveAttribute("poster", "https://cdn.test/pack.jpg");
  });

  // An unrecognised host is a file, not a blank frame: <video> tries it and its
  // own error state reports honestly if it cannot.
  it("treats an unrecognised link as a file", () => {
    const { container } = render(<VideoPlayer src="https://cdn.example.test/x.webm" />);
    expect(video(container)).toBeInTheDocument();
    expect(frame(container)).toBeNull();
  });
});
