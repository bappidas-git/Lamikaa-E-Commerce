// The gallery's decisions — what a thumbnail is called, which file it is
// delivered, what the counter reads and what the label toggle offers next —
// plus one walk through the rendered gallery, because "click the third thumb
// and the counter says 3 / 5" is a claim about wiring, not about a function.
//
// `services/api` is mocked because importing the page's component tree would
// otherwise build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import React from "react";
// The repo has no src/setupTests.js, so the DOM matchers are registered here
// rather than globally.
import "@testing-library/jest-dom";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MediaGallery, {
  counterLabel,
  stepIndex,
  thumbLabel,
  thumbSource,
} from "./MediaGallery";
import { clampScale, panBounds } from "./Lightbox";

// A miniature of the seeded Face Wash: the cover, two placeholder stills, and
// two clips — 3 images + 2 videos, the shape the whole range ships in. The cover
// still carries a legacy source-pixel `crop` on purpose: a stored record can
// hold one, and nothing downstream may act on it.
const COVER = {
  type: "image",
  url: "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Face-Wash-Cover.jpg",
  alt: "Black Rice Face Wash — label",
  primary: true,
  crop: { x: 1050, y: 100, w: 1500, h: 3200 },
};
const STILL_2 = {
  type: "image",
  url: "https://picsum.photos/seed/face-wash-2/1200/1500",
  alt: "Black Rice Face Wash — lifestyle",
};
const STILL_3 = {
  type: "image",
  url: "https://picsum.photos/seed/face-wash-3/1200/1500",
  alt: "Black Rice Face Wash — texture",
};
const HOW_TO = {
  type: "video",
  url: "https://example.test/how-to.mp4",
  poster: "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Face-Wash-Cover.jpg",
  title: "How to use",
};
const STORY = {
  type: "video",
  url: "https://example.test/story.mp4",
  title: "Brand story",
};

const FACE_WASH = {
  id: 1,
  name: "Black Rice Face Wash",
  media: [COVER, STILL_2, STILL_3, HOW_TO, STORY],
};

/** A product an owner has photographed once and not filmed at all. */
const SINGLE = {
  id: 2,
  name: "Black Rice Goat Milk Soap",
  media: [{ type: "image", url: "https://picsum.photos/seed/soap/1200/1200", primary: true }],
};

const renderGallery = (product) =>
  render(
    <MemoryRouter>
      <MediaGallery product={product} />
    </MemoryRouter>
  );

describe("counterLabel / stepIndex", () => {
  it("counts from one", () => {
    expect(counterLabel(0, 5)).toBe("1 / 5");
    expect(counterLabel(4, 5)).toBe("5 / 5");
  });

  it("wraps at both ends", () => {
    expect(stepIndex(4, 1, 5)).toBe(0);
    expect(stepIndex(0, -1, 5)).toBe(4);
    expect(stepIndex(1, 1, 5)).toBe(2);
  });

  // An empty gallery has no index to move to, and `% 0` is NaN.
  it("stays at zero when there is nothing to step through", () => {
    expect(stepIndex(0, 1, 0)).toBe(0);
  });
});

describe("thumbLabel", () => {
  it("says a video is a video, by its own title", () => {
    expect(thumbLabel(FACE_WASH, HOW_TO)).toBe("Video: How to use");
  });

  // A clip nobody titled still has to be told apart from the stills beside it.
  it("falls back to the product's name for an untitled clip", () => {
    expect(thumbLabel(FACE_WASH, { type: "video", url: "x.mp4" })).toBe(
      "Video: Black Rice Face Wash"
    );
  });

  it("leaves an image to its own alt text", () => {
    expect(thumbLabel(FACE_WASH, COVER)).toBeUndefined();
  });
});

describe("thumbSource", () => {
  // Even handed a row that still carries one, the thumbnail never cuts: the
  // whole frame is padded into the square.
  it("delivers a 144px square holding the whole frame", () => {
    const url = thumbSource(COVER);
    expect(url).not.toContain("c_crop");
    expect(url).toContain("c_pad,ar_1:1,b_auto");
    expect(url).toContain("w_144");
  });

  it("shows a video's poster, square and uncropped", () => {
    const url = thumbSource(HOW_TO);
    expect(url).not.toContain("c_crop");
    expect(url).toContain("c_pad,ar_1:1,b_auto");
  });

  it("falls back to the pack when a clip has no poster", () => {
    expect(thumbSource(STORY, COVER.url)).toContain("Face-Wash-Cover.jpg");
    expect(thumbSource(STORY, "")).toBe("");
  });

  // A placeholder host has no transformation API; the URL comes back as given
  // rather than mangled into a 404.
  it("leaves a non-Cloudinary URL exactly as it is", () => {
    expect(thumbSource(STILL_2)).toBe(STILL_2.url);
  });
});

describe("clampScale / panBounds (Lightbox)", () => {
  it("holds the zoom inside 1x-4x", () => {
    expect(clampScale(0.2)).toBe(1);
    expect(clampScale(2.5)).toBe(2.5);
    expect(clampScale(9)).toBe(4);
    expect(clampScale(undefined)).toBe(1);
  });

  // A picture that fits cannot be dragged; one twice the frame may be dragged
  // by half its overflow each way, which is what keeps it from being lost.
  it("lets a picture travel by half of what it overflows by", () => {
    expect(panBounds(800, 1000, 1)).toBe(0);
    expect(panBounds(1000, 1000, 1)).toBe(0);
    expect(panBounds(1000, 1000, 2)).toBe(500);
  });
});

describe("<MediaGallery> — the rendered gallery", () => {
  it("puts every image and every video in one rail, and names the clips", () => {
    renderGallery(FACE_WASH);

    const rail = screen.getByRole("tablist", { name: "Product media" });
    const tabs = within(rail).getAllByRole("tab");
    expect(tabs).toHaveLength(5);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");

    expect(within(rail).getByRole("tab", { name: "Video: How to use" })).toBeInTheDocument();
    expect(within(rail).getByRole("tab", { name: "Video: Brand story" })).toBeInTheDocument();
  });

  it("moves the stage from the rail, from the arrows and from the keyboard", () => {
    renderGallery(FACE_WASH);

    expect(screen.getByText("1 / 5")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("tab")[2]);
    expect(screen.getByText("3 / 5")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("4 / 5")).toBeInTheDocument();

    // The stage answers keys only while the stage itself holds focus.
    const stage = screen.getByRole("group", { name: "Black Rice Face Wash media" });
    stage.focus();
    fireEvent.keyDown(stage, { key: "ArrowLeft" });
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
    fireEvent.keyDown(stage, { key: "Home" });
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
    fireEvent.keyDown(stage, { key: "End" });
    expect(screen.getByText("5 / 5")).toBeInTheDocument();
  });

  // The whole shot is the ONLY shot. A record carrying a legacy crop gets it
  // dropped in normalisation, so the stage delivers an uncut frame and there is
  // no "Full label" pill offering a second version that no longer exists.
  it("delivers the whole frame, with no front-panel toggle to offer", () => {
    renderGallery(FACE_WASH);

    expect(screen.queryByRole("button", { name: /Full label|Front panel/ })).toBeNull();

    // Scoped to the stage: the rail carries the same frame under the same alt.
    const plate = within(
      screen.getByRole("group", { name: "Black Rice Face Wash media" })
    ).getByRole("img", { name: "Black Rice Face Wash — label" });
    expect(plate.getAttribute("src")).not.toContain("c_crop");
    expect(plate.getAttribute("src")).toContain("c_pad,ar_4:5,b_auto");
    expect(plate.getAttribute("srcset") || "").not.toContain("c_crop");

    // And the rail shows the same uncut frame in miniature.
    const thumb = within(screen.getByRole("tablist")).getAllByRole("img")[0];
    expect(thumb.getAttribute("src")).not.toContain("c_crop");
  });

  it("renders a one-image, no-video product with no rail, arrows or counter", () => {
    renderGallery(SINGLE);

    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Previous" })).toBeNull();
    expect(screen.queryByText(/^\d+ \/ \d+$/)).toBeNull();
    // The pack itself is still there, on its plate, with its Zoom button.
    expect(screen.getByRole("group", { name: /media$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zoom" })).toBeInTheDocument();
  });
});
