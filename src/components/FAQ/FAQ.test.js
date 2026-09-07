// =============================================================================
// FAQ — the rules that are about ANSWERS rather than about disclosure
// =============================================================================
// The keyboard model, the ARIA wiring and the height animation belong to
// `ui/Accordion` and are its to prove. What is pinned down here is what Prompt
// 21 added on top: a store figure is filled in, a sentence quoting an unsupplied
// token never reaches the page, every row is linkable at `faq-<id>`, and a hash
// opens the row it names.
//
// `services/api` is mocked because the store-settings module builds a real axios
// client on import; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import React from "react";
// The repo has no src/setupTests.js, so the DOM matchers are registered here
// rather than globally.
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import FAQ, { faqAnchorId, faqAnswerText } from "./FAQ";
import { fillStoreCopy } from "../../utils/storeSettings";

// The one thing the component asks of the store-settings context.
const fillCopy = (text) =>
  fillStoreCopy(
    text,
    {
      store: { currency: "INR", currencySymbol: "₹", taxIncluded: true, taxRate: 0 },
      payment: { codEnabled: true, codMaxOrder: 0 },
    },
    // No free-shipping threshold and no returns window: both sentences are
    // asked to quote a fact nobody has supplied.
    {}
  );

jest.mock("../../context/StoreSettingsContext", () => ({
  __esModule: true,
  useStoreSettings: () => ({ fillCopy: (text) => globalThis.__fillCopy(text) }),
}));
globalThis.__fillCopy = fillCopy;

const ROWS = [
  { id: 1, question: "Who owns LAMIKAA Naturals?", answer: "A Farmer Producer Company owned by its farmer members." },
  { id: 3, question: "Why is black rice in every product?", answer: "It is the hero ingredient of the range." },
  {
    id: 7,
    question: "What is your return policy?",
    answer:
      "You can request a return within {{RETURN_WINDOW_DAYS}} days of delivery. Opened skincare cannot be returned for hygiene reasons.",
  },
  { id: 9, question: "Is this row answerable?", answer: "Shipping is free on orders above {freeShipping}." },
];

const renderFaq = (props = {}, { route = "/" } = {}) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <FAQ faqs={ROWS} {...props} />
    </MemoryRouter>
  );

describe("faqAnchorId", () => {
  it("is the id the CSS, the hash and any copy-link control all agree on", () => {
    expect(faqAnchorId({ id: 7 })).toBe("faq-7");
    expect(faqAnchorId({ id: "shipping" })).toBe("faq-shipping");
  });
});

describe("faqAnswerText", () => {
  it("drops the sentence that still quotes a token, and keeps its neighbours", () => {
    const answer = faqAnswerText(ROWS[2].answer, fillCopy);
    expect(answer).not.toMatch(/\{\{/);
    expect(answer).toBe("Opened skincare cannot be returned for hygiene reasons.");
  });

  it("is empty when nothing publishable is left", () => {
    expect(faqAnswerText(ROWS[3].answer, fillCopy)).toBe("");
    expect(faqAnswerText(undefined, fillCopy)).toBe("");
  });

  it("passes a token-free answer through untouched", () => {
    expect(faqAnswerText(ROWS[0].answer, fillCopy)).toBe(ROWS[0].answer);
  });
});

describe("<FAQ/>", () => {
  it("renders one trigger per answerable row and drops the rest", () => {
    renderFaq();
    const triggers = screen.getAllByRole("button");
    expect(triggers.map((b) => b.textContent)).toEqual([
      "Who owns LAMIKAA Naturals?",
      "Why is black rice in every product?",
      "What is your return policy?",
    ]);
    // Row 9's only sentence quoted a threshold nobody has set, so the question
    // is not asked either.
    expect(screen.queryByText("Is this row answerable?")).toBeNull();
  });

  it("never prints a placeholder token", () => {
    const { container } = renderFaq();
    expect(container.textContent).not.toMatch(/\{\{|\{freeShipping\}/);
  });

  it("caps the list at `limit`", () => {
    renderFaq({ limit: 2 });
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("wires aria-expanded/aria-controls and toggles on click", () => {
    renderFaq();
    const trigger = screen.getByRole("button", { name: "Who owns LAMIKAA Naturals?" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    expect(panel).toHaveAttribute("role", "region");
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("opens only one row at a time unless asked for `multiple`", () => {
    const { unmount } = renderFaq();
    const open = () => screen.getAllByRole("button").filter((b) => b.getAttribute("aria-expanded") === "true");

    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(open()).toHaveLength(1);
    unmount();

    renderFaq({ multiple: true });
    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(open()).toHaveLength(2);
  });

  it("gives every row the anchor a deep link can name, and opens the one the hash names", () => {
    renderFaq({}, { route: "/#faq-3" });
    expect(document.getElementById("faq-1")).not.toBeNull();
    expect(document.getElementById("faq-7")).not.toBeNull();

    const row3 = screen.getByRole("button", { name: "Why is black rice in every product?" });
    expect(row3).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Who owns LAMIKAA Naturals?" })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("ignores a hash that belongs to another section", () => {
    renderFaq({}, { route: "/#hero" });
    screen
      .getAllByRole("button")
      .forEach((b) => expect(b).toHaveAttribute("aria-expanded", "false"));
  });

  // The pattern's own keys, on top of Tab. Enter/Space are not synthesised here:
  // the trigger is a real <button>, so the browser turns both into the click the
  // test above already exercises.
  it("moves between headers on ArrowDown/ArrowUp/Home/End", () => {
    renderFaq();
    const [first, second, last] = screen.getAllByRole("button");

    first.focus();
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(second);

    fireEvent.keyDown(second, { key: "End" });
    expect(document.activeElement).toBe(last);

    // …and it wraps, rather than stopping at the ends.
    fireEvent.keyDown(last, { key: "ArrowDown" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: "ArrowUp" });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(last, { key: "Home" });
    expect(document.activeElement).toBe(first);
  });

  it("sets the heading level the page's outline needs", () => {
    renderFaq({ headingLevel: 4 });
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(3);
  });

  it("renders nothing at all when no row survives", () => {
    const { container } = render(
      <MemoryRouter>
        <FAQ faqs={[ROWS[3]]} />
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });
});
