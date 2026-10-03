// =============================================================================
// /order-confirmation/:orderNumber — copying the order number
// =============================================================================
// The Copy button used to call `navigator.clipboard` and nothing else. That API
// exists only on HTTPS (or localhost), so on a page served over plain HTTP the
// click returned silently: no copy, no "Copied". It now goes through
// `copyToClipboard`, and these click the real button:
//   1. the number lands on the clipboard and the button says "Copied", with no
//      Clipboard API at all and with one;
//   2. a refused copy never claims "Copied";
//   3. a second copy restarts the confirmation rather than being cut short by
//      the first copy's timer.
//
// The order is read through `services/api`, which is stood in for. So are the
// confetti (a canvas jsdom cannot draw) and the head tags.
// =============================================================================

jest.mock("../../services/api", () => ({
  __esModule: true,
  default: { orders: { getByOrderNumber: jest.fn() } },
}));
jest.mock("canvas-confetti", () => jest.fn());
jest.mock("../../hooks/useSeo", () => () => {});

import React from "react";
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import apiService from "../../services/api";
import OrderConfirmation from "./OrderConfirmation";

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

// Seed order 2's shape: placed, paid on delivery, on its way.
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
  discountAmount: 0,
  shippingAmount: 0,
  taxAmount: 0,
  storeCreditUsed: 0,
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

const renderPage = () => {
  apiService.orders.getByOrderNumber.mockResolvedValue(ORDER);
  render(
    <MemoryRouter initialEntries={[`/order-confirmation/${ORDER.orderNumber}`]}>
      <Routes>
        <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
      </Routes>
    </MemoryRouter>
  );
  return screen.findByRole("button", { name: `Copy order number ${ORDER.orderNumber}` });
};

const announcement = () => `Order number ${ORDER.orderNumber} copied to clipboard`;

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

describe("copying the order number", () => {
  // The reported bug: there is no `navigator.clipboard` on a plain-HTTP page.
  it("copies on a plain-HTTP page, where there is no Clipboard API", async () => {
    httpPage();
    const button = await renderPage();
    expect(navigator.clipboard).toBeUndefined();

    fireEvent.click(button);

    expect(await screen.findByText(announcement())).toBeInTheDocument();
    expect(pasted).toBe(ORDER.orderNumber);
    expect(button).toHaveTextContent("Copied");
  });

  it("copies where the page has the Clipboard API", async () => {
    httpsPage();
    const button = await renderPage();

    fireEvent.click(button);

    expect(await screen.findByText(announcement())).toBeInTheDocument();
    expect(pasted).toBe(ORDER.orderNumber);
    expect(button).toHaveTextContent("Copied");
  });

  it("never claims 'Copied' when the browser refused the copy", async () => {
    httpPage({ refuses: true });
    const button = await renderPage();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(pasted).toBeUndefined();
    expect(button).toHaveTextContent("Copy");
    expect(button).not.toHaveTextContent("Copied");
    expect(screen.queryByText(announcement())).not.toBeInTheDocument();
  });

  it("restarts the confirmation on a second copy instead of cutting it short", async () => {
    jest.useFakeTimers();
    httpPage();
    const button = await renderPage();

    await act(async () => {
      fireEvent.click(button);
    });
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    await act(async () => {
      fireEvent.click(button);
    });

    // 2s after the first copy, the second one's confirmation is still up.
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(button).toHaveTextContent("Copied");

    // …and it clears 2s after the second copy.
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(button).not.toHaveTextContent("Copied");
  });
});
