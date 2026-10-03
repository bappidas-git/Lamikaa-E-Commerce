// =============================================================================
// /special-offers — the voucher's Copy control
// =============================================================================
// The button used to call `navigator.clipboard` and nothing else, so on a page
// served over plain HTTP (no Clipboard API) a click changed nothing: no copy,
// no "Copied", the failure spoken only to a screen reader. These click through
// the real page:
//   1. a copy lands, and the button says so with its own label and the polite
//      status line — on HTTPS and on plain HTTP alike;
//   2. the code chip copies too, and "Copied" follows the code last copied;
//   3. a refused copy is never silent: the code is selected and the button
//      says what to do with it;
//   4. the confirmation clears itself.
//
// The page's providers are stood in for: it reads its config, cart and
// wishlist through hooks, and none of them is what is under test here.
// =============================================================================

jest.mock("../../services/api", () => ({
  __esModule: true,
  default: {
    products: { getAll: jest.fn() },
    categories: { getAll: jest.fn() },
    coupons: { getActive: jest.fn() },
  },
}));
jest.mock("../../hooks/useCart", () => ({ useCart: () => ({ addToCart: jest.fn() }) }));
jest.mock("../../context/WishlistContext", () => ({
  useWishlist: () => ({ toggleWishlist: jest.fn(), isInWishlist: () => false }),
}));
jest.mock("../../context/DealsConfigContext", () => ({
  useDealsConfig: () => ({
    loading: false,
    config: {
      enabled: true,
      hero: { tag: "Offers", title: "Offers", subtitle: "" },
      timer: { enabled: false },
      featuredCouponIds: [],
      dealOfTheDayIds: [],
      featuredProductIds: [],
    },
  }),
}));
jest.mock("../../hooks/useSeo", () => () => {});

import React from "react";
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import apiService from "../../services/api";
import SpecialOffers from "./SpecialOffers";

const coupon = (id, code) => ({
  id,
  code,
  description: `Coupon ${code}`,
  type: "percentage",
  value: 10,
  minOrderAmount: 0,
  isActive: true,
  expiresAt: null,
  usageLimit: null,
  usedCount: 0,
});

// jsdom ships neither: matchMedia is read by framer-motion's reduced-motion
// hook (and by the refusal hint), IntersectionObserver by the in-view reveals.
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    ((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
  global.IntersectionObserver =
    global.IntersectionObserver ||
    class {
      constructor(callback) {
        this.callback = callback;
      }
      observe(target) {
        this.callback([{ isIntersecting: true, intersectionRatio: 1, target }], this);
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
});

// What a browser's execCommand("copy") would have put on the clipboard.
let pasted;

const httpsPage = () => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: jest.fn((text) => Promise.resolve().then(() => (pasted = text))) },
  });
};

// Plain HTTP: no `navigator.clipboard`; the select-and-copy path still works.
const httpPage = ({ refuses = false } = {}) => {
  document.execCommand = jest.fn((command) => {
    if (command !== "copy" || refuses) return false;
    const event = new Event("copy", { bubbles: true, cancelable: true });
    event.clipboardData = { setData: (type, data) => (pasted = data) };
    document.body.dispatchEvent(event);
    return true;
  });
};

const renderPage = async () => {
  apiService.products.getAll.mockResolvedValue([]);
  apiService.categories.getAll.mockResolvedValue([]);
  apiService.coupons.getActive.mockResolvedValue([coupon(1, "SAMPLE10"), coupon(2, "444")]);
  render(
    <MemoryRouter initialEntries={["/special-offers"]}>
      <SpecialOffers />
    </MemoryRouter>
  );
  return screen.findByRole("button", { name: "Copy coupon code SAMPLE10" });
};

const status = () => screen.getByText(/copied to your clipboard|could not copy/i);

beforeEach(() => {
  pasted = undefined;
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  delete navigator.clipboard;
  delete document.execCommand;
  document.getSelection().removeAllRanges();
  console.error.mockRestore();
  jest.useRealTimers();
});

describe("the voucher Copy control", () => {
  it("copies the code and says so, where the page has the Clipboard API", async () => {
    httpsPage();
    const button = await renderPage();

    fireEvent.click(button);

    expect(await screen.findByText("Copied")).toBeInTheDocument();
    expect(pasted).toBe("SAMPLE10");
    expect(button).toHaveTextContent("Copied");
    expect(status()).toHaveTextContent("Code SAMPLE10 copied to your clipboard.");
  });

  it("copies on a plain-HTTP page too, where there is no Clipboard API", async () => {
    httpPage();
    const button = await renderPage();
    expect(navigator.clipboard).toBeUndefined();

    fireEvent.click(button);

    expect(await screen.findByText("Copied")).toBeInTheDocument();
    expect(pasted).toBe("SAMPLE10");
    expect(button).toHaveTextContent("Copied");
  });

  it("copies from the chip as well, and 'Copied' follows the last code copied", async () => {
    httpPage();
    const first = await renderPage();
    const second = screen.getByRole("button", { name: "Copy coupon code 444" });

    fireEvent.click(first);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
    expect(first).toHaveTextContent("Copied");

    fireEvent.click(screen.getByText("444"));
    await screen.findByText("Code 444 copied to your clipboard.");
    expect(pasted).toBe("444");
    expect(second).toHaveTextContent("Copied");
    expect(first).toHaveTextContent("Copy");
    expect(first).not.toHaveTextContent("Copied");
  });

  it("never goes quiet on a refusal: the code is selected and the button says what to do", async () => {
    httpPage({ refuses: true });
    const button = await renderPage();

    fireEvent.click(button);

    expect(await screen.findByText(/press (ctrl\+c|⌘c)/i)).toBeInTheDocument();
    expect(button).not.toHaveTextContent("Copied");
    expect(pasted).toBeUndefined();
    expect(document.getSelection().toString()).toBe("SAMPLE10");
    expect(status()).toHaveTextContent(
      "Could not copy SAMPLE10 automatically. The code is selected, ready for you to copy."
    );
  });

  it("returns to Copy once the confirmation has been seen", async () => {
    // Before the render, so the countdown's interval is a fake one too.
    jest.useFakeTimers();
    httpsPage();
    const button = await renderPage();

    await act(async () => {
      fireEvent.click(button);
    });
    expect(button).toHaveTextContent("Copied");

    act(() => {
      jest.advanceTimersByTime(2400);
    });
    expect(button).toHaveTextContent("Copy");
    expect(button).not.toHaveTextContent("Copied");
    expect(screen.queryByText(/copied to your clipboard/i)).not.toBeInTheDocument();
  });
});
