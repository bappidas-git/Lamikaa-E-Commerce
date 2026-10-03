// =============================================================================
// ReviewPhotos — a review's pictures open full screen
// =============================================================================
// The tiles under a review are 46-78px: proof that there is a picture, not the
// picture. What is pinned down here:
//   1. every photo is a button, named for what it opens;
//   2. pressing one opens THAT photo full screen in the viewer, with the
//      review's other photos an arrow away, and Close / Esc put it away again
//      with focus back on the tile;
//   3. the keys the viewer takes stay in the viewer, so a strip inside a
//      `Rail` (the testimonial band) cannot page the row behind the dialog;
//   4. the product page's reviews print this strip too.

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Rail } from "../ui";
import ReviewPhotos, { reviewPhotoMedia } from "./ReviewPhotos";
import ReviewsSection from "./ReviewsSection";

// A customer's own upload arrives as a data URL; an owner may link one from
// Cloudinary. The strip has to handle both.
const SHELF = "data:image/jpeg;base64,c2hlbGY=";
const TEXTURE = "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/reviews/texture.jpg";
const LATHER = "data:image/jpeg;base64,bGF0aGVy";

const renderStrip = (props) =>
  render(
    <MemoryRouter>
      <ReviewPhotos name="Ritu Bora" {...props} />
    </MemoryRouter>
  );

const openViewer = async (buttonName) => {
  const tile = screen.getByRole("button", { name: buttonName });
  // A real click focuses the button; jsdom's does not, and the focus trap
  // returns focus to whatever held it when the viewer opened.
  tile.focus();
  fireEvent.click(tile);
  return { tile, viewer: await screen.findByRole("dialog") };
};

describe("reviewPhotoMedia", () => {
  it("turns the photos into image rows that say whose they are", () => {
    expect(reviewPhotoMedia([SHELF, TEXTURE], "Ritu Bora")).toEqual([
      { type: "image", url: SHELF, alt: "Photo 1 of 2 from Ritu Bora" },
      { type: "image", url: TEXTURE, alt: "Photo 2 of 2 from Ritu Bora" },
    ]);
  });

  it("drops blanks, and does not count a lone photo as 1 of 1", () => {
    expect(reviewPhotoMedia(["", null, `  ${SHELF} `], "Ritu Bora")).toEqual([
      { type: "image", url: SHELF, alt: "Photo from Ritu Bora" },
    ]);
    expect(reviewPhotoMedia(undefined, "Ritu Bora")).toEqual([]);
  });
});

describe("<ReviewPhotos>", () => {
  it("draws nothing for a review without photos", () => {
    const { container } = renderStrip({ photos: [] });
    expect(container).toBeEmptyDOMElement();
  });

  it("makes every photo a button that says what it opens", () => {
    renderStrip({ photos: [SHELF, TEXTURE] });

    const tiles = screen.getAllByRole("button", { name: /^View photo \d of 2 from Ritu Bora/ });
    expect(tiles).toHaveLength(2);
    tiles.forEach((tile) => expect(tile).toHaveAttribute("aria-haspopup", "dialog"));
    // Nothing is mounted until somebody asks for it.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("delivers a linked photo as a small square tile, and in full in the viewer", async () => {
    renderStrip({ photos: [TEXTURE] });

    const tile = screen.getByRole("button", { name: "View photo from Ritu Bora at full size" });
    // alt="": the button around it carries the name.
    const thumb = within(tile).getByRole("img", { name: "" });
    expect(thumb.getAttribute("src")).toContain("c_fill,g_center,ar_1:1");
    expect(thumb.getAttribute("src")).toContain("w_240");

    const { viewer } = await openViewer("View photo from Ritu Bora at full size");
    const picture = within(viewer).getByRole("img", { name: "Photo from Ritu Bora" });
    expect(picture.getAttribute("src")).toContain("w_2000,c_limit");
    expect(picture.getAttribute("src")).not.toContain("ar_1:1");
    // One photo: no counter and no arrows to browse with.
    expect(within(viewer).queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(within(viewer).queryByText(/^\d+ \/ \d+$/)).not.toBeInTheDocument();
  });

  it("opens the photo that was pressed, full screen, and browses the others", async () => {
    renderStrip({ photos: [SHELF, TEXTURE, LATHER], productName: "Face Wash" });

    const { viewer } = await openViewer("View photo 2 of 3 from Ritu Bora at full size");

    expect(viewer).toHaveAccessibleName("Photos from Ritu Bora");
    expect(viewer).toHaveTextContent("Photo by Ritu Bora · Face Wash");
    expect(within(viewer).getByText("2 / 3")).toBeInTheDocument();
    expect(within(viewer).getByRole("img", { name: "Photo 2 of 3 from Ritu Bora" })).toBeInTheDocument();
    // And it can be magnified, not only enlarged.
    expect(within(viewer).getByRole("button", { name: "Zoom in" })).toBeInTheDocument();

    fireEvent.click(within(viewer).getByRole("button", { name: "Next" }));
    expect(within(viewer).getByText("3 / 3")).toBeInTheDocument();
    expect(within(viewer).getByRole("img", { name: "Photo 3 of 3 from Ritu Bora" })).toHaveAttribute(
      "src",
      LATHER
    );

    fireEvent.keyDown(viewer, { key: "ArrowRight" });
    expect(within(viewer).getByText("1 / 3")).toBeInTheDocument();
  });

  it("closes from its button and from Esc, handing focus back to the tile", async () => {
    renderStrip({ photos: [SHELF, TEXTURE] });

    const first = await openViewer("View photo 1 of 2 from Ritu Bora at full size");
    fireEvent.click(within(first.viewer).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(first.tile).toHaveFocus();

    const second = await openViewer("View photo 2 of 2 from Ritu Bora at full size");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(second.tile).toHaveFocus();
  });

  // The testimonial band puts this strip inside a Rail, and the dialog is only
  // portalled out of it in the DOM: React still bubbles its events through the
  // rail, whose own Arrow/Home/End keys scroll the row.
  it("keeps the viewer's keys from paging a rail behind it", async () => {
    render(
      <MemoryRouter>
        <Rail label="customer testimonials">
          <ReviewPhotos key="ritu" photos={[SHELF, TEXTURE]} name="Ritu Bora" />
        </Rail>
      </MemoryRouter>
    );
    const track = screen.getByRole("list", { name: "customer testimonials" });
    track.scrollBy = jest.fn();
    track.scrollTo = jest.fn();

    const { viewer } = await openViewer("View photo 1 of 2 from Ritu Bora at full size");
    ["ArrowRight", "ArrowLeft", "Home", "End"].forEach((key) => fireEvent.keyDown(viewer, { key }));

    expect(track.scrollBy).not.toHaveBeenCalled();
    expect(track.scrollTo).not.toHaveBeenCalled();
    // The keys did their job in the viewer instead: End landed on the last photo.
    expect(within(viewer).getByText("2 / 2")).toBeInTheDocument();
  });
});

describe("<ReviewsSection> — the product page's reviews", () => {
  it("opens a review's photo full screen", async () => {
    render(
      <MemoryRouter>
        <ReviewsSection
          reviews={[
            {
              id: 7,
              userName: "Pallabi Das",
              rating: 5,
              body: "The lather is fine and it rinses clean.",
              status: "approved",
              photos: [SHELF, LATHER],
            },
          ]}
          displayAvg={5}
          totalRatingsCount={1}
        />
      </MemoryRouter>
    );

    const { viewer } = await openViewer("View photo 2 of 2 from Pallabi Das at full size");
    expect(viewer).toHaveAccessibleName("Photos from Pallabi Das");
    expect(within(viewer).getByRole("img", { name: "Photo 2 of 2 from Pallabi Das" })).toHaveAttribute(
      "src",
      LATHER
    );
  });
});
