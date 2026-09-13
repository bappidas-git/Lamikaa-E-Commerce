// =============================================================================
// Which approved reviews become "What our customers say"
// =============================================================================
// The band and the product page read the SAME rows, so the only thing that
// makes them different surfaces is this selection — and the two rules a store
// owner would notice first if they broke are pinned here: the featured row
// leads, and a product's own reviews never appear twice on its own page.
import {
  selectTestimonials,
  isTestimonialCandidate,
  TESTIMONIAL_MIN_RATING,
} from "./testimonials";

const review = (over = {}) => ({
  id: 1,
  productId: 1,
  userName: "Ritu B.",
  rating: 5,
  title: "Lovely",
  body: "Two weeks in and my skin feels softer.",
  status: "approved",
  createdAt: "2026-09-01T00:00:00.000Z",
  ...over,
});

describe("isTestimonialCandidate", () => {
  it("needs words — a bare rating is a rating, not a quote", () => {
    expect(isTestimonialCandidate(review())).toBe(true);
    expect(isTestimonialCandidate(review({ body: "" }))).toBe(false);
    expect(isTestimonialCandidate(review({ body: "   " }))).toBe(false);
  });

  it("reads whichever field the backend kept the words in", () => {
    expect(isTestimonialCandidate(review({ body: undefined, comment: "Lovely stuff." }))).toBe(true);
    expect(isTestimonialCandidate(review({ body: undefined, text: "Lovely stuff." }))).toBe(true);
  });

  it("never publishes an unapproved row, whoever hands it over", () => {
    expect(isTestimonialCandidate(review({ status: "pending" }))).toBe(false);
    expect(isTestimonialCandidate(review({ status: "rejected" }))).toBe(false);
  });

  it("keeps a low rating off the band unless the owner featured it", () => {
    const low = review({ rating: TESTIMONIAL_MIN_RATING - 1 });
    expect(isTestimonialCandidate(low)).toBe(false);
    // The owner's own call overrides the floor — and the product page shows
    // the review either way, so this is curation, not concealment.
    expect(isTestimonialCandidate({ ...low, featured: true })).toBe(true);
  });
});

describe("selectTestimonials", () => {
  it("leads with what the owner featured, then a face, then the newest", () => {
    const rows = [
      review({ id: 1, createdAt: "2026-09-05T00:00:00.000Z" }),
      review({ id: 2, avatar: "https://cdn/face.jpg", createdAt: "2026-09-02T00:00:00.000Z" }),
      review({ id: 3, featured: true, createdAt: "2026-01-01T00:00:00.000Z" }),
    ];
    expect(selectTestimonials(rows).map((r) => r.id)).toEqual([3, 2, 1]);
  });

  it("drops the reviews the page above it is already printing", () => {
    const rows = [
      review({ id: 1, productId: 7 }),
      review({ id: 2, productId: 3 }),
      review({ id: 3, productId: 7 }),
    ];
    // On /product/<the one with id 7>, those two are in the reviews chapter.
    expect(selectTestimonials(rows, { excludeProductId: 7 }).map((r) => r.id)).toEqual([2]);
    // Ids cross the mock/live type boundary as string and number alike.
    expect(selectTestimonials(rows, { excludeProductId: "7" }).map((r) => r.id)).toEqual([2]);
  });

  it("caps the band, and never repeats one row", () => {
    const rows = [1, 2, 3, 4, 5].map((id) => review({ id }));
    expect(selectTestimonials(rows, { limit: 3 })).toHaveLength(3);
    expect(selectTestimonials([review({ id: 9 }), review({ id: 9 })])).toHaveLength(1);
  });

  it("answers an empty list for anything unusable, and never throws", () => {
    expect(selectTestimonials(null)).toEqual([]);
    expect(selectTestimonials(undefined)).toEqual([]);
    expect(selectTestimonials([null, undefined, {}])).toEqual([]);
    expect(selectTestimonials([review()], { limit: 0 })).toEqual([]);
  });
});
