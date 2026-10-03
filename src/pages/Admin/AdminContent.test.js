// =============================================================================
// Admin → Content → Why LAMIKAA → Pillars
// =============================================================================
// The list here is what every storefront surface draws, so the editor has to
// write it back exactly: a glyph chosen for one pillar lands on that row and
// no other, going back to "Auto" leaves the row as it was saved, and a sentence
// that counts the pillars ("built on four pillars") is flagged the moment the
// list stops agreeing with it.
//
// `services/api` is mocked — the screen reads and writes one record through it,
// and the point is what it sends — and so is sweetalert2, whose toasts are not
// what is under test. Clicks go through RTL's `fireEvent`, as everywhere else
// in this repo: it is wrapped in act(), so each assertion sees the render the
// click caused.
jest.mock("../../services/api", () => ({
  __esModule: true,
  default: {
    admin: { getSiteContent: jest.fn(), updateSiteContent: jest.fn() },
    siteContent: { get: jest.fn() },
  },
}));
jest.mock("sweetalert2", () => ({
  __esModule: true,
  default: { fire: jest.fn(() => Promise.resolve({ isConfirmed: true })) },
}));

import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import apiService from "../../services/api";
import brand from "../../config/brand";
import AdminContent, { pillarCountMismatch, rowFields } from "./AdminContent";

const RECORD = {
  about: { title: "Our story" },
  whyLamikaa: {
    eyebrow: "Why LAMIKAA",
    body: "Our philosophy is built on four pillars:",
    pillars: [...brand.pillars, { key: "test", title: "test", text: "test" }],
  },
};

describe("rowFields", () => {
  it("offers a pillar every field, title first and the key last", () => {
    expect(rowFields({ key: "test", title: "test", text: "test" }, "pillars")).toEqual([
      "title",
      "text",
      "icon",
      "key",
    ]);
  });

  it("keeps a row's own extra fields, and a list with no template as it is", () => {
    expect(rowFields({ key: "k", title: "t", extra: "x" }, "groups")).toEqual([
      "key",
      "label",
      "title",
      "extra",
    ]);
    expect(rowFields({ a: 1, b: 2 }, "unknown")).toEqual(["a", "b"]);
  });
});

describe("pillarCountMismatch", () => {
  it("names the field whose count disagrees with the cards", () => {
    expect(pillarCountMismatch(RECORD.whyLamikaa, 5)).toEqual({ field: "body", stated: 4 });
  });

  it("is quiet when the count agrees, or none is stated", () => {
    expect(pillarCountMismatch(RECORD.whyLamikaa, 4)).toBeNull();
    expect(pillarCountMismatch({ body: "What we stand on." }, 5)).toBeNull();
    expect(pillarCountMismatch(null, 5)).toBeNull();
  });
});

describe("the pillars editor", () => {
  // The whole content screen renders on every click — MUI's fields, the rail,
  // five pillar rows — and jsdom takes a second or two over it. The default
  // five seconds is too close for a slower machine.
  jest.setTimeout(20000);

  beforeEach(() => {
    jest.clearAllMocks();
    apiService.admin.getSiteContent.mockResolvedValue(JSON.parse(JSON.stringify(RECORD)));
    apiService.admin.updateSiteContent.mockResolvedValue({});
  });

  const openWhyLamikaa = async () => {
    render(<AdminContent />);
    fireEvent.click(screen.getByRole("button", { name: "Why LAMIKAA" }));
    await screen.findByText("05 · test");
  };

  const fifthRow = () => screen.getByText("05 · test").closest(".MuiPaper-root");

  // A save is settled when the editor reads "saved" again: the request has
  // gone, the merged record is the new baseline and the button is idle.
  const saved = async () => {
    await waitFor(() => expect(apiService.admin.updateSiteContent).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole("button", { name: "Save section" })).toBeDisabled());
    return apiService.admin.updateSiteContent.mock.calls[0];
  };

  it("says so when the copy counts four pillars over five cards", async () => {
    await openWhyLamikaa();
    expect(screen.getByText("The copy and the cards disagree.")).toBeInTheDocument();
  });

  it("writes a chosen glyph onto that pillar and no other", async () => {
    await openWhyLamikaa();

    fireEvent.click(within(fifthRow()).getByRole("button", { name: "Change icon" }));
    fireEvent.click(within(fifthRow()).getByRole("button", { name: "Sprout" }));
    fireEvent.click(screen.getByRole("button", { name: "Save section" }));

    const [key, data] = await saved();
    expect(key).toBe("whyLamikaa");
    expect(data.pillars).toHaveLength(5);
    expect(data.pillars[4]).toEqual({
      key: "test",
      title: "test",
      text: "test",
      icon: "mdi:sprout-outline",
    });
    // The four untouched rows are written back exactly as they were read.
    expect(data.pillars.slice(0, 4)).toEqual(brand.pillars);
  });

  it("leaves the row as saved when a glyph is tried and Auto chosen again", async () => {
    await openWhyLamikaa();
    const save = screen.getByRole("button", { name: "Save section" });
    expect(save).toBeDisabled();

    // The palette folds away until it is asked for, and again once a glyph is
    // picked.
    expect(within(fifthRow()).queryByRole("button", { name: "Sprout" })).not.toBeInTheDocument();
    fireEvent.click(within(fifthRow()).getByRole("button", { name: "Change icon" }));
    fireEvent.click(within(fifthRow()).getByRole("button", { name: "Sprout" }));
    expect(save).toBeEnabled();
    expect(within(fifthRow()).getByText("Sprout — chosen for this pillar.")).toBeInTheDocument();

    fireEvent.click(within(fifthRow()).getByRole("button", { name: "Change icon" }));
    fireEvent.click(within(fifthRow()).getByRole("button", { name: "Auto" }));
    expect(save).toBeDisabled();
  });

  it("edits a pillar a backend handed back with nulls for its empty fields", async () => {
    const record = JSON.parse(JSON.stringify(RECORD));
    record.whyLamikaa.pillars[4] = { key: null, title: "test", text: null, icon: null };
    apiService.admin.getSiteContent.mockResolvedValue(record);
    await openWhyLamikaa();

    expect(within(fifthRow()).queryByText(/Not editable here/)).not.toBeInTheDocument();
    expect(within(fifthRow()).getByText("Auto — a neutral star until a glyph is chosen.")).toBeInTheDocument();
    fireEvent.change(within(fifthRow()).getByLabelText("Text"), { target: { value: "Now it says something." } });
    fireEvent.click(screen.getByRole("button", { name: "Save section" }));

    const [, data] = await saved();
    expect(data.pillars[4]).toEqual({ key: null, title: "test", text: "Now it says something.", icon: null });
  });

  it("starts a new pillar without an icon key, and warns until it has a title", async () => {
    await openWhyLamikaa();

    fireEvent.click(screen.getByRole("button", { name: "Add pillar" }));
    expect(screen.getByText("Not shown on the site until it has a title")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save section" }));
    const [, data] = await saved();
    expect(data.pillars[5]).toEqual({ title: "", text: "", key: "" });
  });
});
