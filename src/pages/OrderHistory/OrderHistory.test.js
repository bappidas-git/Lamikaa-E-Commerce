// =============================================================================
// /orders — copying an order or tracking number
// =============================================================================
// Both Copy buttons on an order card used to call `navigator.clipboard` and
// nothing else. That API exists only on HTTPS (or localhost), so on a page
// served over plain HTTP the click threw, was caught, and nothing happened.
// They now go through `copyToClipboard`, and these click the real buttons:
//   1. the order number and the tracking number land on the clipboard, and
//      the clicked button says "Copied";
//   2. "Copied" follows the number last copied, and that confirmation is not
//      cut short by the previous copy's timer;
//   3. a refused copy never claims "Copied".
//
// The page reads its session, cart and records through hooks and
// `services/api`, which are stood in for; none of them is under test here.
// =============================================================================

jest.mock("../../services/api", () => ({
  __esModule: true,
  default: {
    orders: { getByUserId: jest.fn() },
    reviews: { getMine: jest.fn() },
    returns: { getByUserId: jest.fn() },
  },
}));
jest.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: 1, firstName: "Sample" },
    isAuthenticated: true,
    isLoading: false,
    openAuthModal: () => {},
  }),
}));
jest.mock("../../context/CartContext", () => ({
  useCart: () => ({ addToCart: () => {}, setIsCartOpen: () => {} }),
}));
jest.mock("../../hooks/useSeo", () => () => {});

import React from "react";
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import apiService from "../../services/api";
import OrderHistory from "./OrderHistory";

const ADDRESS = {
  firstName: "Sample",
  lastName: "Customer",
  phone: "+91 90000 00000",
  addressLine1: "12 Sample Lane",
  addressLine2: "",
  city: "Guwahati",
  state: "Assam",
  postalCode: "781001",
  country: "India",
};

// Seed order 2's shape — on its way — with the carrier's number on it.
const ORDER = {
  id: 2,
  orderNumber: "ORD-20260904-0002",
  userId: 1,
  items: [
    {
      productId: 1,
      variantId: null,
      name: "Black Rice Face Wash",
      image: "",
      sku: "LK-BR-FW-001",
      price: 390,
      quantity: 1,
      subtotal: 390,
    },
  ],
  subtotal: 390,
  total: 390,
  amountPayable: 390,
  paymentStatus: "pending",
  paymentMethod: "cod",
  fulfillmentStatus: "fulfilled",
  shippingStatus: "shipped",
  trackingNumber: "LK-TRACK-0002",
  trackingUrl: "",
  shippingAddress: ADDRESS,
  billingAddress: ADDRESS,
  statusHistory: [],
  createdAt: "2026-09-04T09:00:00.000Z",
  updatedAt: "2026-09-04T09:00:00.000Z",
};

// What the clipboard ended up holding.
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
  apiService.orders.getByUserId.mockResolvedValue([ORDER]);
  apiService.reviews.getMine.mockResolvedValue([]);
  apiService.returns.getByUserId.mockResolvedValue([]);
  render(
    <MemoryRouter initialEntries={["/orders"]}>
      <OrderHistory />
    </MemoryRouter>
  );
  const card = await screen.findByRole("article", { name: `Order ${ORDER.orderNumber}` });
  return {
    card,
    orderNumber: within(card).getByRole("button", { name: "Copy order number" }),
    trackingNumber: within(card).getByRole("button", { name: "Copy tracking number" }),
  };
};

beforeEach(() => {
  pasted = undefined;
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  delete navigator.clipboard;
  delete document.execCommand;
  console.error.mockRestore();
  jest.useRealTimers();
});

describe("copying from an order card", () => {
  // The reported bug: there is no `navigator.clipboard` on a plain-HTTP page.
  it("copies the order number on a plain-HTTP page, where there is no Clipboard API", async () => {
    httpPage();
    const { card, orderNumber } = await renderPage();
    expect(navigator.clipboard).toBeUndefined();

    fireEvent.click(orderNumber);

    expect(
      await within(card).findByRole("button", { name: "Copied order number" })
    ).toHaveTextContent("Copied");
    expect(pasted).toBe(ORDER.orderNumber);
  });

  it("copies the tracking number from the tracking drawer", async () => {
    httpPage();
    const { card, trackingNumber } = await renderPage();
    fireEvent.click(within(card).getByRole("button", { name: /tracking/i, expanded: false }));

    fireEvent.click(trackingNumber);

    expect(
      await within(card).findByRole("button", { name: "Copied tracking number" })
    ).toHaveTextContent("Copied");
    expect(pasted).toBe(ORDER.trackingNumber);
  });

  it("copies where the page has the Clipboard API", async () => {
    httpsPage();
    const { card, orderNumber } = await renderPage();

    fireEvent.click(orderNumber);

    await within(card).findByRole("button", { name: "Copied order number" });
    expect(pasted).toBe(ORDER.orderNumber);
  });

  it("moves 'Copied' to the number copied last, and keeps it up its full time", async () => {
    jest.useFakeTimers();
    httpPage();
    const { orderNumber, trackingNumber } = await renderPage();

    await act(async () => {
      fireEvent.click(orderNumber);
    });
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    await act(async () => {
      fireEvent.click(trackingNumber);
    });
    expect(pasted).toBe(ORDER.trackingNumber);
    expect(orderNumber).not.toHaveTextContent("Copied");
    expect(trackingNumber).toHaveTextContent("Copied");

    // 2s after the first copy, the second one's confirmation is still up.
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(trackingNumber).toHaveTextContent("Copied");

    // …and it clears 2s after the second copy.
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(trackingNumber).not.toHaveTextContent("Copied");
  });

  it("never claims 'Copied' when the browser refused the copy", async () => {
    httpPage({ refuses: true });
    const { card, orderNumber } = await renderPage();

    await act(async () => {
      fireEvent.click(orderNumber);
    });

    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(pasted).toBeUndefined();
    expect(orderNumber).toHaveTextContent("Copy");
    expect(orderNumber).not.toHaveTextContent("Copied");
    expect(within(card).queryByRole("button", { name: /^Copied/ })).not.toBeInTheDocument();
  });
});
