import { ROUTES } from "./constants";
import { productPath } from "./helpers";
import { categoryPath, categoryParam, concernPath, ritualPath } from "./categories";
import {
  LEGACY_PATH_REDIRECTS,
  RETIRED_CATEGORY_SLUGS,
} from "../components/routing/LegacyRedirects";

// =============================================================================
// The LAMIKAA route map (Prompt 08)
// =============================================================================
// Twenty-odd files now build their links through four helpers instead of typing
// a path. That is only an improvement while the helpers agree with the <Route>
// table in App.js — so these pin the shapes both sides depend on, and pin that
// the Meghali-era paths exist nowhere but the redirect table.
// =============================================================================

describe("ROUTES", () => {
  it("has no Meghali-era path left in the table", () => {
    const retired = ["/products", "/help", "/support", "/privacy", "/terms", "/refund", "/cookies"];
    Object.values(ROUTES).forEach((path) => {
      expect(retired).not.toContain(path);
    });
  });

  it("keeps the paths the programme froze", () => {
    expect(ROUTES.CHECKOUT).toBe("/checkout");
    expect(ROUTES.ORDERS).toBe("/orders");
    expect(ROUTES.PROFILE).toBe("/profile");
    expect(ROUTES.WISHLIST).toBe("/wishlist");
    expect(ROUTES.SPECIAL_OFFERS).toBe("/special-offers");
    expect(ROUTES.ORDER_CONFIRMATION).toBe("/order-confirmation");
  });
});

describe("productPath", () => {
  it("prefers the slug", () => {
    expect(productPath({ id: 1, slug: "black-rice-face-wash" })).toBe(
      "/product/black-rice-face-wash"
    );
  });

  it("falls back to the product id, not a cart line's composite id", () => {
    // A cart line's `id` can be "1-v2" (productId-variantId); the PDP resolves
    // the product id, so productId has to win.
    expect(productPath({ id: "1-v2", productId: 1 })).toBe("/product/1");
    expect(productPath({ id: 7 })).toBe("/product/7");
  });

  it("never returns a dead link", () => {
    expect(productPath(null)).toBe(ROUTES.SHOP);
  });
});

describe("categoryPath", () => {
  it("builds a path of slugs", () => {
    expect(categoryPath({ id: 1, slug: "face-care", kind: "products" })).toBe(
      "/category/face-care"
    );
  });

  it("sends the rituals category to the rituals index", () => {
    expect(categoryPath({ id: 7, slug: "rituals", kind: "rituals" })).toBe(ROUTES.RITUALS);
  });

  it("falls back to the numeric id, then to the shop", () => {
    expect(categoryPath({ id: 3 })).toBe("/category/3");
    expect(categoryPath(null)).toBe(ROUTES.SHOP);
    expect(categoryPath({})).toBe(ROUTES.SHOP);
  });

  it("still exposes categoryParam as the FILTER token, not a URL", () => {
    expect(categoryParam({ id: 1, slug: "face-care" })).toBe("face-care");
  });
});

describe("ritualPath and concernPath", () => {
  it("takes an object or a bare slug", () => {
    expect(ritualPath({ slug: "morning-glow" })).toBe("/rituals/morning-glow");
    expect(ritualPath("evening-renewal")).toBe("/rituals/evening-renewal");
    expect(ritualPath("")).toBe(ROUTES.RITUALS);
  });

  it("keeps a concern a facet of the shop", () => {
    expect(concernPath("brightening")).toBe("/shop?concern=brightening");
    expect(concernPath({ slug: "even-tone" })).toBe("/shop?concern=even-tone");
    expect(concernPath("")).toBe(ROUTES.SHOP);
  });
});

describe("the legacy redirect table", () => {
  it("moves every retired path to a route that exists", () => {
    const live = new Set(Object.values(ROUTES));
    LEGACY_PATH_REDIRECTS.forEach(({ to }) => {
      expect(live.has(to)).toBe(true);
    });
  });

  it("covers each old content path exactly once", () => {
    const from = LEGACY_PATH_REDIRECTS.map((r) => r.from);
    ["/help", "/support", "/privacy", "/terms", "/refund", "/cookies"].forEach((p) => {
      expect(from.filter((f) => f === p)).toHaveLength(1);
    });
  });

  it("retires the Meghali collection slugs rather than routing them at a category", () => {
    expect(RETIRED_CATEGORY_SLUGS).toEqual(["muga-silk", "pat-silk", "eri-silk"]);
  });
});
