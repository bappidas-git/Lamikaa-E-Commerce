import brand, { LOGO_URL, ICON_URL } from "./brand";

// =============================================================================
// brand.js — the facts nothing else in the repository is allowed to restate
// =============================================================================
// Every name, badge, logo URL and legal sentence the storefront and the admin
// render comes from this one object, so a wrong value here is wrong on every
// page at once and shows up nowhere as an error. Four things are asserted, and
// each has a specific way of going quietly wrong:
//
//   1. THE NAME'S CASING. "LAMIKAA NATURALS" is not interchangeable with
//      "Lamikaa Naturals" (BRAND.md §3.9 rule 1) — and the name is also the
//      `alt` on the wordmark, which is what src/App.test.js looks for.
//   2. THE LEGAL QUALIFIER. Wherever profits or dividends are mentioned the
//      "subject to applicable laws" wording must survive editing. A tidy-up
//      that shortens `legalNote` into a promise of a payout is the single
//      most damaging edit anyone can make to this file, and it would still
//      render perfectly.
//   3. THE BADGES. `trustBadges` is rendered as chips on cards and the trust
//      strip; a blank or non-string entry paints an empty chip rather than
//      throwing.
//   4. THE TWO ASSET URLs, character for character, against PRODUCTS.md §1.
//      A wrong version segment still returns an image from Cloudinary — the
//      WRONG image — so only an exact-string assertion catches it.
// =============================================================================

describe("brand identity", () => {
  it("keeps the brand name in its mandated casing", () => {
    expect(brand.name).toBe("LAMIKAA NATURALS");
    expect(brand.shortName).toBe("LAMIKAA");
    expect(brand.legalName).toBe("Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL)");
  });

  it("keeps the legal qualifier in the ownership sentence", () => {
    expect(brand.legalNote).toContain("subject to applicable laws");
    // The qualifier is only a qualifier if it still qualifies a "can", not a
    // "will": a dividend is declared, never promised.
    expect(brand.legalNote).toContain("can reach member farmers as dividends");
    expect(brand.legalNote).not.toMatch(/\bguarantee/i);
  });

  it("carries no empty trust badge", () => {
    expect(Array.isArray(brand.trustBadges)).toBe(true);
    expect(brand.trustBadges.length).toBeGreaterThan(0);
    brand.trustBadges.forEach((badge) => {
      expect(typeof badge).toBe("string");
      expect(badge.trim().length).toBeGreaterThan(0);
    });
  });

  // PRODUCTS.md §1 — the two real assets, quoted character for character.
  it("points at the exact Cloudinary logo and icon", () => {
    expect(brand.logoUrl).toBe(
      "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670626/logo.png"
    );
    expect(brand.iconUrl).toBe(
      "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670625/icon.png"
    );
    // The named exports and the object must not drift apart: components import
    // whichever is closer to hand.
    expect(LOGO_URL).toBe(brand.logoUrl);
    expect(ICON_URL).toBe(brand.iconUrl);
  });

  // A token is legal in this file (the owner has not supplied the fact yet);
  // a token in a field the UI prints unconditionally is not. These four are
  // printed with no `resolveOrNull` guard anywhere, so they must stay real.
  it("holds no placeholder in a field that always renders", () => {
    [brand.name, brand.tagline, brand.legalNote, brand.seo.defaultTitle].forEach((value) => {
      expect(value).not.toMatch(/\{\{[A-Z0-9_]+\}\}/);
    });
  });
});
