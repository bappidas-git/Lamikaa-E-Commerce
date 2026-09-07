// =============================================================================
// brand.js — the single source of brand truth
// =============================================================================
// Every name, tagline, pillar, badge, logo URL, contact field and meta string
// the storefront and the admin render comes from this object. No other file in
// the repository may hard-code the brand name, the legal name, the logo URL or
// the icon URL — components read `brand`, and the owner changes the brand by
// editing one file.
//
// Copy is quoted from prompts/_reference/BRAND.md (§3, verbatim) and the asset
// URLs from PRODUCTS.md §1. Facts that are genuinely unknown before launch are
// `{{TOKENS}}` (see prompts/_reference/PLACEHOLDERS.md and utils/placeholders.js):
// they are never guessed, and every surface that reads one hides the row while
// it is unresolved.
//
// LEGAL QUALIFIERS ARE PART OF THE COPY, NOT DECORATION. Wherever profits or
// dividends are mentioned the "can" / "subject to applicable laws and the
// company's dividend declaration" wording must survive editing (BRAND.md §3.9
// rule 2). Never promise a guaranteed payout, a percentage or a figure.
// =============================================================================
import { cld } from "../utils/cloudinary";

// The two real brand assets, character-exact (PRODUCTS.md §1). Raw upload URLs:
// every consumer runs them through `cld()` for the size it actually paints.
// Wordmark 1400x400 (3.5:1), mark 696x696, both on transparent grounds.
export const LOGO_URL =
  "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670626/logo.png";
export const ICON_URL =
  "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670625/icon.png";

export const brand = {
  // ---- Names (BRAND.md §3.9 rule 1 — casing is not interchangeable) --------
  name: "LAMIKAA NATURALS",
  shortName: "LAMIKAA",
  runningName: "LAMIKAA Naturals",
  legalName: "Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL)",
  legalShort: "BAOPCL",

  // ---- Voice (BRAND.md §3.8, §3.2) ----------------------------------------
  tagline: "Indigenous Wisdom. Modern Beauty. Shared Prosperity.",
  philosophy: "Indigenous Wisdom. Modern Science. Responsible Beauty.",
  // The sentence the philosophy line opens on — BRAND.md §3.2's first sentence,
  // verbatim. It lives here beside `philosophy` and `pillars` for the reason
  // `originBadge` does: `philosophy` IS the heading of the Why LAMIKAA band, so
  // the band's lede is brand copy too, and brand copy is edited in this file,
  // never inside a component. Note the qualifier ("can be inspired") — BRAND.md
  // §3.9 makes it part of the sentence.
  philosophyLede:
    "LAMIKAA Naturals believes that the future of beauty can be inspired by the wisdom of the past.",
  signatureLines: [
    "Beauty that creates value.",
    "Value that reaches farmers.",
    "Prosperity that reaches families.",
    "When LAMIKAA grows, our farmers grow with us.",
  ],

  // The canonical footer sentence. Quoted verbatim wherever ownership is stated.
  legalNote:
    "LAMIKAA Naturals is owned by Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL), a Farmer Producer Company. Profits distributed by BAOPCL can reach member farmers as dividends, subject to applicable laws and the company's dividend declaration.",

  // ---- Story structures (BRAND.md §3.3, §3.2 — canonical order) -----------
  valueChain: [
    "Farmer",
    "FPC",
    "Value Addition",
    "LAMIKAA Naturals",
    "Consumer",
    "Profit",
    "Farmer Members",
  ],
  pillars: [
    {
      key: "indigenous-knowledge",
      title: "Indigenous Knowledge",
      text: "Respecting the traditional wisdom and natural heritage of our region.",
    },
    {
      key: "modern-science",
      title: "Modern Cosmetic Science",
      text: "Combining traditional ingredients and knowledge with modern formulation, research and quality standards.",
    },
    {
      key: "farmer-ownership",
      title: "Farmer Ownership",
      text: "Creating a business where farmers participate not only in supplying raw materials but also in the economic value created by the enterprise.",
    },
    {
      key: "responsible-beauty",
      title: "Responsible Beauty",
      text: "Building products and processes that respect people, communities and the environment.",
    },
  ],

  // ---- Identity assets ----------------------------------------------------
  logoUrl: LOGO_URL,
  iconUrl: ICON_URL,
  // Intrinsic 1400x400. Components derive their height from this so a future
  // wordmark with different proportions needs one number changed here.
  logoAspect: 3.5,
  currency: "INR",
  locale: "en-IN",

  // ---- Badges -------------------------------------------------------------
  // Owner-mandated card badges (BRAND.md §3.9 rule 4): configurable here, never
  // hard-coded in a component, so the wording can be adjusted for compliance.
  trustBadges: ["Farmer to Consumer", "100% Organic", "Result Oriented"],
  // The fourth promise on the home trust strip. Not a product badge — it is the
  // brand's provenance line, condensed from BRAND.md §3.1 ("Rooted in the
  // indigenous knowledge and rich natural heritage of Assam and Northeast
  // India"), and it lives here for the same reason the three above do: brand
  // copy is edited in this file, never inside a component.
  originBadge: "Rooted in Assam & Northeast India",
  // As printed on the packaging roundels — quoted, not claimed. Shown only in
  // the PDP's "As printed on the pack" block. Owner to confirm ({{CERTIFICATIONS}});
  // remove any the owner cannot substantiate.
  packBadges: ["ISO Certified", "GMP Certified", "Non-GMO", "Cruelty-Free"],

  // ---- Announcement bar ---------------------------------------------------
  // Rows 2 and 3 carry tokens and stay off the bar until the owner resolves
  // them (the threshold in Admin > Shipping, the offer in Admin > Announcements).
  announcements: [
    { id: "farmer-owned", text: "Farmer-owned. Assam-grown." },
    { id: "free-shipping", text: "Free shipping over ₹{{FREE_SHIPPING_THRESHOLD}}" },
    { id: "launch", text: "{{LAUNCH_OFFER_TEXT}}" },
  ],

  // ---- Contact and social (all unresolved — hidden until the owner fills in
  //      Admin > Settings; see PLACEHOLDERS.md for the packaging candidates) --
  contact: {
    email: "{{LAMIKAA_EMAIL}}",
    phone: "{{LAMIKAA_PHONE}}",
    address: "{{LAMIKAA_ADDRESS}}",
    hours: "{{SUPPORT_HOURS}}",
  },
  social: {
    instagram: "{{LAMIKAA_INSTAGRAM_URL}}",
    facebook: "{{LAMIKAA_FACEBOOK_URL}}",
    youtube: "{{LAMIKAA_YOUTUBE_URL}}",
    whatsapp: "{{LAMIKAA_WHATSAPP_URL}}",
    // No X/Twitter presence has been named. Blank, not tokenised: an empty
    // string is how a mark is deliberately left off the footer row.
    twitter: "",
  },
  legal: {
    gstin: "{{GSTIN}}",
    cin: "{{CIN}}",
  },

  // ---- Search -------------------------------------------------------------
  // The suggestions the empty search overlay offers. Product names and one
  // ritual — nothing here claims popularity it cannot evidence.
  search: {
    popular: [
      "Face Wash",
      "Face Serum",
      "Moisturizer Gel",
      "Black Rice",
      "Morning ritual",
      "Goat Milk Soap",
    ],
  },

  // ---- SEO ----------------------------------------------------------------
  seo: {
    siteUrl: "{{LAMIKAA_DOMAIN}}",
    defaultTitle: "LAMIKAA NATURALS — Black Rice Skincare, Farmer-Owned",
    titleTemplate: "%s · LAMIKAA NATURALS",
    defaultDescription:
      "Farmer-owned skincare rooted in the indigenous wisdom of Assam and Northeast India. The Black Rice range: cleanse, refresh, treat and moisturise — beauty that creates value for farmers.",
    // 1200px wide wordmark for share cards; 1200x343 at the 3.5:1 aspect.
    ogImage: cld(LOGO_URL, { w: 1200 }),
  },

  // ---- Product defaults ---------------------------------------------------
  productDefaults: {
    // Packs print Mfg → Exp about 23 months apart, but the owner has not
    // confirmed a shelf life, so the PDP row stays hidden.
    shelfLife: "{{SHELF_LIFE}}",
    suitableFor: "All skin types — patch test recommended",
    brand: "LAMIKAA Naturals",
  },

  // ---- Feature flags ------------------------------------------------------
  flags: {
    // The two seeded reviews are flagged `isSample: true`; nothing fabricated
    // reaches a visitor while this is false (BRAND.md §3.9 rule 6).
    showSampleReviews: false,
    // "Add the whole ritual" bundles wait until the range has prices.
    enableRitualBundles: false,
  },
};

export default brand;
