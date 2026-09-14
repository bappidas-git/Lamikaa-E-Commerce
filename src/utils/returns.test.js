import {
  RETURN_REASONS,
  REFUND_METHODS,
  CUSTOMER_REFUND_METHODS,
  RETURN_STATUS,
  returnStatusInfo,
  reasonLabel,
  methodLabel,
  lineKey,
  countsAgainstOrder,
  returnedUnitsByLine,
  netRefundForItems,
  payableRefund,
  isFullReturn,
} from "./returns";

// =============================================================================
// The two halves of a return have to agree
// =============================================================================
// A return is RAISED by the shopper in My Orders and WORKED by the desk in
// Admin → Returns. Everything in this module is a fact both screens read, so
// what is pinned here is the agreement itself: the same words for a reason and
// a status, the same money for a set of lines, and the same answer to "how much
// of this order has already been sent back".
// =============================================================================

describe("the shared vocabulary", () => {
  it("offers the shopper only the methods that need no account details", () => {
    // Bank transfer and UPI are settlement routes the desk picks; asking a
    // shopper to type an account number into a return form is not the job.
    expect(CUSTOMER_REFUND_METHODS.map((m) => m.value)).toEqual([
      "original_payment",
      "store_credit",
    ]);
    // …and every one of them is a real method the admin screen also knows.
    CUSTOMER_REFUND_METHODS.forEach((m) => {
      expect(REFUND_METHODS).toContainEqual(m);
    });
  });

  it("gives every status both a MUI colour and a storefront tone", () => {
    Object.entries(RETURN_STATUS).forEach(([key, cfg]) => {
      expect(cfg.label).toBeTruthy();
      expect(cfg.color).toBeTruthy();
      expect(cfg.tone).toBeTruthy();
      expect(typeof cfg.open).toBe("boolean");
      expect(key).toMatch(/^[a-z_]+$/);
    });
    // Only the two terminal states are closed.
    const closed = Object.entries(RETURN_STATUS)
      .filter(([, c]) => !c.open)
      .map(([k]) => k);
    expect(closed.sort()).toEqual(["refunded", "rejected"]);
  });

  it("never renders a raw slug at the shopper or the desk", () => {
    expect(reasonLabel("size_issue")).toBe("Size / Fit Issue");
    expect(methodLabel("store_credit")).toBe("Store Credit");
    // A code from a future release still reads as words, not as `wrong_size`.
    expect(reasonLabel("wrong_size")).toBe("wrong size");
    expect(methodLabel("cheque")).toBe("cheque");
    expect(returnStatusInfo("awaiting_qc").label).toBe("awaiting qc");
    expect(returnStatusInfo(undefined).label).toBe("Unknown");
  });

  it("keeps every reason the form offers addressable by label", () => {
    RETURN_REASONS.forEach((r) => {
      expect(reasonLabel(r.value)).toBe(r.label);
    });
  });
});

describe("lineKey", () => {
  it("separates two variants of one product", () => {
    expect(lineKey({ productId: 7, variantId: "50ml" })).not.toBe(
      lineKey({ productId: 7, variantId: "100ml" })
    );
  });

  it("treats a missing variant as one stable line", () => {
    expect(lineKey({ productId: 7, variantId: null })).toBe(
      lineKey({ productId: 7 })
    );
  });
});

describe("returnedUnitsByLine", () => {
  const order = { id: 1 };
  const rows = [
    {
      orderId: 1,
      status: "approved",
      items: [{ productId: 2, variantId: null, quantity: 1 }],
    },
    {
      orderId: 1,
      status: "refunded",
      items: [{ productId: 2, variantId: null, quantity: 1 }],
    },
    // Another order entirely — must not touch this one's ledger.
    {
      orderId: 9,
      status: "approved",
      items: [{ productId: 2, variantId: null, quantity: 5 }],
    },
  ];

  it("sums every un-rejected return against that order, and no other", () => {
    expect(returnedUnitsByLine(rows, order.id)).toEqual({ "2::": 2 });
  });

  it("matches an id whichever type it arrives as", () => {
    // json-server hands back numbers, a Laravel payload can hand back strings.
    expect(returnedUnitsByLine(rows, "1")).toEqual({ "2::": 2 });
  });

  it("releases the units of a REJECTED request", () => {
    // The desk said no; the shopper must be able to ask again for that item.
    const withRejection = [
      ...rows,
      {
        orderId: 1,
        status: "rejected",
        items: [{ productId: 3, variantId: null, quantity: 4 }],
      },
    ];
    expect(returnedUnitsByLine(withRejection, 1)["3::"]).toBeUndefined();
    expect(countsAgainstOrder({ status: "rejected" })).toBe(false);
    expect(countsAgainstOrder({ status: "requested" })).toBe(true);
  });

  it("answers an empty ledger rather than throwing", () => {
    expect(returnedUnitsByLine(undefined, 1)).toEqual({});
    expect(returnedUnitsByLine([{ orderId: 1, status: "approved" }], 1)).toEqual({});
  });
});

describe("netRefundForItems", () => {
  const items = [
    { price: 390, quantity: 1 },
    { price: 90, quantity: 2 },
  ];

  it("counts only the ticked lines, at the quantity picked", () => {
    const picks = [
      { checked: false, quantity: 1 },
      { checked: true, quantity: 1 },
    ];
    expect(netRefundForItems({ subtotal: 570 }, picks, items)).toEqual({
      gross: 90,
      discountShare: 0,
      net: 90,
    });
  });

  it("takes back the returned items' SHARE of a coupon, not the whole of it", () => {
    // ₹570 of goods bought with ₹57 off; ₹90 of it comes back, so ₹9 of the
    // discount comes back out with it — the shopper is refunded what they paid.
    const picks = [
      { checked: false, quantity: 1 },
      { checked: true, quantity: 1 },
    ];
    const order = { subtotal: 570, discountAmount: 57 };
    expect(netRefundForItems(order, picks, items)).toEqual({
      gross: 90,
      discountShare: 9,
      net: 81,
    });
  });

  it("gives the whole discount back when the whole order goes back", () => {
    const picks = [
      { checked: true, quantity: 1 },
      { checked: true, quantity: 2 },
    ];
    const order = { subtotal: 570, discountAmount: 57 };
    const { gross, discountShare, net } = netRefundForItems(order, picks, items);
    expect(gross).toBe(570);
    expect(discountShare).toBe(57);
    expect(net).toBe(513);
  });

  it("never refunds a negative amount, and never more than the items", () => {
    const picks = [{ checked: true, quantity: 1 }, { checked: false, quantity: 0 }];
    // A discount larger than the subtotal (a fully-comped order) must floor at 0.
    const order = { subtotal: 390, discountAmount: 10000 };
    const { net, discountShare } = netRefundForItems(order, picks, items);
    expect(discountShare).toBe(390);
    expect(net).toBe(0);
  });

  it("survives a missing order, missing picks and missing items", () => {
    expect(netRefundForItems(null, [], [])).toEqual({
      gross: 0,
      discountShare: 0,
      net: 0,
    });
    expect(netRefundForItems({ subtotal: 100 }, undefined, items).gross).toBe(0);
  });
});

describe("payableRefund", () => {
  it("is the ask minus what the desk deducted on inspection", () => {
    // The number the shopper checks against their bank is the SETTLED one.
    expect(payableRefund({ refundAmount: 570, deductionAmount: 50 })).toBe(520);
  });

  it("is the whole ask when nothing was deducted", () => {
    expect(payableRefund({ refundAmount: 570 })).toBe(570);
    expect(payableRefund({ refundAmount: 570, deductionAmount: 0 })).toBe(570);
  });

  it("takes a deduction still being typed, for the live worksheet total", () => {
    // The admin's Process Refund box passes the in-progress field value.
    expect(payableRefund({ refundAmount: 570, deductionAmount: 0 }, "120")).toBe(450);
    expect(payableRefund({ refundAmount: 570 }, "")).toBe(570);
  });

  it("never goes below zero", () => {
    expect(payableRefund({ refundAmount: 100, deductionAmount: 900 })).toBe(0);
    expect(payableRefund(null)).toBe(0);
  });
});

describe("isFullReturn", () => {
  const order = { items: [{ quantity: 1 }, { quantity: 2 }] };

  it("is true only when every ordered unit is coming back", () => {
    expect(isFullReturn({ items: [{ quantity: 3 }] }, order)).toBe(true);
    expect(isFullReturn({ items: [{ quantity: 2 }] }, order)).toBe(false);
  });

  it("is false for an order or a return we do not have", () => {
    expect(isFullReturn(null, order)).toBe(false);
    expect(isFullReturn({ items: [{ quantity: 3 }] }, null)).toBe(false);
    expect(isFullReturn({ items: [{ quantity: 1 }] }, { items: [] })).toBe(false);
  });
});
