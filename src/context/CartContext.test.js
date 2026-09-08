import React from "react";
import { act, render } from "@testing-library/react";

// The provider is exercised in isolation: no HTTP (the API mirror is only
// reached for a logged-in user, which `useAuth` below never is), and no real
// SweetAlert, whose toasts are the thing being counted.
//
// The mock moved from `sweetalert2` to `utils/alerts` in Prompt 38: the context
// no longer imports the library at all, it calls `fireAlert`, which loads it on
// first use. Mocking the seam the context actually uses is also what keeps this
// suite from pulling 79 kB of SweetAlert into a unit test.
jest.mock("../utils/alerts", () => ({
  __esModule: true,
  fireAlert: jest.fn(() => Promise.resolve({})),
  closeAlert: jest.fn(),
  default: jest.fn(() => Promise.resolve({})),
}));

jest.mock("../services/api", () => ({
  __esModule: true,
  default: {
    cart: {
      getCart: jest.fn(() => Promise.resolve([])),
      addToCart: jest.fn(() => Promise.resolve({})),
      removeFromCart: jest.fn(() => Promise.resolve({})),
    },
  },
}));

jest.mock("./AuthContext", () => ({ useAuth: () => ({ user: null }) }));

// eslint-disable-next-line import/first
import { fireAlert } from "../utils/alerts";
// eslint-disable-next-line import/first
import { CartProvider, useCart } from "./CartContext";

const FACE_WASH = { id: 1, name: "Black Rice Face Wash", price: 390 };
const SOAP = { id: 2, name: "Black Rice Goat Milk Soap", price: 90 };
// Five of the eight products ship before their MRP is set. This is one of them.
const BODY_WASH = { id: 3, name: "Black Rice Body Wash", price: null, priceTBA: true };

let cart;

const Probe = () => {
  cart = useCart();
  return null;
};

const mount = () => render(
  <CartProvider>
    <Probe />
  </CartProvider>
);

const lastToast = () => fireAlert.mock.calls[fireAlert.mock.calls.length - 1][0];

beforeEach(() => {
  localStorage.clear();
  fireAlert.mockClear();
  cart = undefined;
});

describe("CartContext.addMany", () => {
  test("folds a list into the cart in one commit, under one toast", () => {
    mount();

    act(() => {
      cart.addMany([FACE_WASH, SOAP, FACE_WASH]);
    });

    // Same lineKey twice sums instead of forking a second line.
    expect(cart.cartItems).toHaveLength(2);
    expect(cart.cartItems.map((line) => line.id)).toEqual(["1-default", "2-default"]);
    expect(cart.cartItems[0].quantity).toBe(2);
    expect(cart.getCartItemCount()).toBe(3);

    expect(fireAlert).toHaveBeenCalledTimes(1);
    expect(lastToast().title).toBe("Added to cart");
    expect(lastToast().text).toBe("3 items added to your cart");
    expect(cart.isCartOpen).toBe(true);
  });

  test("merges into a line an earlier addToCart created, same lineKey", async () => {
    mount();

    await act(async () => {
      await cart.addToCart(FACE_WASH, 1);
    });
    act(() => {
      cart.addMany([FACE_WASH, SOAP]);
    });

    expect(cart.cartItems).toHaveLength(2);
    expect(cart.cartItems[0].quantity).toBe(2);
  });

  test("never adds a product whose price is not committed yet", () => {
    mount();

    act(() => {
      cart.addMany([FACE_WASH, SOAP, BODY_WASH]);
    });

    expect(cart.cartItems.map((line) => line.productId)).toEqual([1, 2]);
    expect(fireAlert).toHaveBeenCalledTimes(1);
    expect(lastToast().text).toBe("2 added · 1 coming soon");
  });

  test("adds nothing, and opens nothing, for a list of unpriced products", () => {
    mount();

    act(() => {
      cart.addMany([BODY_WASH]);
    });

    expect(cart.cartItems).toHaveLength(0);
    expect(cart.isCartOpen).toBe(false);
    expect(lastToast().title).toBe("Coming soon");
  });

  test("honours openDrawer: false and reports what it did", () => {
    mount();

    let result;
    act(() => {
      result = cart.addMany([FACE_WASH, BODY_WASH], { openDrawer: false });
    });

    expect(result).toEqual({ added: 1, skipped: 1 });
    expect(cart.isCartOpen).toBe(false);
  });

  test("clamps a line to real stock, exactly as addToCart does", () => {
    mount();

    act(() => {
      cart.addMany([
        { ...SOAP, stock: 2 },
        { ...SOAP, stock: 2 },
        { ...SOAP, stock: 2 },
      ]);
    });

    expect(cart.cartItems).toHaveLength(1);
    expect(cart.cartItems[0].quantity).toBe(2);
  });
});

describe("CartContext toasts", () => {
  test("read in sentence case", async () => {
    mount();

    await act(async () => {
      await cart.addToCart(FACE_WASH, 1);
    });
    expect(lastToast().title).toBe("Added to cart");

    await act(async () => {
      await cart.addToCart(FACE_WASH, 1);
    });
    expect(lastToast().title).toBe("Cart updated");

    act(() => {
      cart.removeFromCart("1-default");
    });
    expect(lastToast().title).toBe("Removed from cart");
    expect(lastToast().text).toBe(FACE_WASH.name);

    act(() => {
      cart.addMany([SOAP], { openDrawer: false });
    });
    act(() => {
      cart.clearCart();
    });
    expect(lastToast().title).toBe("Cart cleared");
  });
});
