// The rail's one piece of logic is reconciling a localStorage snapshot against
// the live catalogue, and it is exactly what a rail off a stale snapshot gets
// wrong: it goes on offering products that have since been set to Draft or
// deleted in Admin > Products, and every click lands on the 404. That rule is
// pinned down here rather than by clicking through the admin.
//
// `services/api` is mocked because importing the component reaches ProductCard,
// which would otherwise build a real axios client; nothing in this file calls it.
jest.mock("../../services/api", () => ({ __esModule: true, default: {} }));

import { MINIMUM, RECENTLY_VIEWED_KEY, readStoredIds, reconcile } from "./RecentlyViewed";

const FACE_WASH = { id: 1, name: "Black Rice Face Wash" };
const SERUM = { id: 2, name: "Black Rice Face Serum" };
const SOAP = { id: 3, name: "Black Rice Goat Milk Soap" };

const CATALOGUE = [FACE_WASH, SERUM, SOAP];

describe("reconcile", () => {
  it("keeps the browsing order, not the catalogue order", () => {
    const stored = [{ id: 3 }, { id: 1 }, { id: 2 }];
    expect(reconcile(stored, CATALOGUE)).toEqual([SOAP, FACE_WASH, SERUM]);
  });

  it("drops a product the shopper can no longer reach", () => {
    // 99 was viewed, then set to Draft (or deleted) in the admin — so it is not
    // in the live catalogue any more and must not be offered again.
    const stored = [{ id: 1 }, { id: 99 }, { id: 2 }];
    expect(reconcile(stored, CATALOGUE)).toEqual([FACE_WASH, SERUM]);
  });

  it("renders the CURRENT record, not the stored snapshot", () => {
    const stored = [{ id: 1, name: "Old name", price: 111 }];
    expect(reconcile(stored, CATALOGUE)).toEqual([FACE_WASH]);
  });

  it("matches ids across types, because localStorage and the API disagree", () => {
    // A JSON Server id is a number; a Laravel id arrives as a string. The rail
    // must not empty itself because of that.
    expect(reconcile([{ id: "1" }], CATALOGUE)).toEqual([FACE_WASH]);
    expect(reconcile([{ id: 2 }], [{ id: "2", name: "Black Rice Face Serum" }])).toEqual([
      { id: "2", name: "Black Rice Face Serum" },
    ]);
  });

  it("survives a missing, empty or malformed list on either side", () => {
    expect(reconcile(null, CATALOGUE)).toEqual([]);
    expect(reconcile([{ id: 1 }], null)).toEqual([]);
    expect(reconcile([{ id: 1 }], undefined)).toEqual([]);
    expect(reconcile([null, undefined, {}], CATALOGUE)).toEqual([]);
  });
});

describe("readStoredIds", () => {
  afterEach(() => localStorage.clear());

  it("reads the same key ProductDetails writes", () => {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify([{ id: 1 }, { id: 2 }]));
    expect(readStoredIds()).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("answers an empty list for nothing stored, and never throws on junk", () => {
    expect(readStoredIds()).toEqual([]);
    localStorage.setItem(RECENTLY_VIEWED_KEY, "not json");
    expect(readStoredIds()).toEqual([]);
    // A value of the wrong shape is not a list of products either.
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify({ id: 1 }));
    expect(readStoredIds()).toEqual([]);
  });
});

describe("MINIMUM", () => {
  it("is two — one card under 'where you left off' is not a rail", () => {
    expect(MINIMUM).toBe(2);
  });
});
