// =============================================================================
// Constants — the shared vocabularies, plus the brand-bound copy
// =============================================================================
// Everything that names the brand now reads from src/config/brand.js. The
// exports below are re-exported from there so the call sites that already
// import from this file keep working, but brand.js is the ONLY place the name,
// the tagline, the contact block or a social handle is written down.
//
// The rest of the file (routes, statuses, reasons, currencies, motion variants,
// breakpoints) is vocabulary, not brand, and is unchanged.
// =============================================================================
import brand from "../config/brand";

// App Info. Deliberately NOT read from the environment any more: a store name
// that a build flag can change is a store name that can differ between the tab
// title, the invoice and the transactional email.
export const APP_NAME = brand.name;
export const APP_TAGLINE = brand.tagline;
export const APP_DESCRIPTION = brand.seo.defaultDescription;

// Routes — the canonical LAMIKAA route map (Prompt 08)
//
// One table, so a link, a redirect and a <Route path> can never disagree about
// where a page lives. The paths with a `:param` are ROUTE PATTERNS (they are
// what <Route path> takes); build a real URL with the helpers next to them —
// `productPath()` in utils/helpers.js, `categoryPath()` / `ritualPath()` /
// `concernPath()` in utils/categories.js.
//
// Every pre-rebuild path (/products, /products/:slug, /help, /support,
// /privacy, /terms, /refund, /cookies and the collection URLs) now lives ONLY
// in components/routing/LegacyRedirects.js, which redirects it here.
export const ROUTES = {
  HOME: "/",

  // Catalogue
  SHOP: "/shop",
  CATEGORY: "/category/:slug",
  PRODUCT: "/product/:slug",
  RITUALS: "/rituals",
  RITUAL: "/rituals/:slug",

  // Brand and content
  ABOUT: "/about",
  WHY: "/why-lamikaa",
  FAQ: "/faq",
  CONTACT: "/contact",
  // The four documents are one route (Prompt 28): `POLICY` is what App.js
  // mounts, and the four constants below are what every LINK to a policy uses,
  // so a caller still names the document rather than building a path.
  POLICY: "/policies/:policy",
  POLICY_PRIVACY: "/policies/privacy",
  POLICY_TERMS: "/policies/terms",
  POLICY_SHIPPING_RETURNS: "/policies/shipping-returns",
  POLICY_COOKIES: "/policies/cookies",

  // Commerce
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_CONFIRMATION: "/order-confirmation",
  SPECIAL_OFFERS: "/special-offers",

  // Account
  ORDERS: "/orders",
  PROFILE: "/profile",
  WISHLIST: "/wishlist",
  LOGIN: "/login",
  REGISTER: "/register",

  // Utility
  SEARCH: "/search",
  // The catch-all PATTERN, not a URL: nothing links to it, App.js matches it.
  NOT_FOUND: "*",
};

// Product flags
export const PRODUCT_FLAGS = {
  FEATURED: "featured",
  TRENDING: "trending",
  HOT: "hot",
  NEW: "new",
  SALE: "sale",
};

// Payment methods
export const PAYMENT_METHODS = {
  CARD: "card",
  UPI: "upi",
  COD: "cod",
  WALLET: "wallet",
  NET_BANKING: "net_banking",
};

// Order statuses
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
  REFUNDED: "refunded",
};

// Fulfillment statuses
export const FULFILLMENT_STATUS = {
  UNFULFILLED: "unfulfilled",
  PARTIALLY_FULFILLED: "partially_fulfilled",
  FULFILLED: "fulfilled",
  RETURNED: "returned",
};

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  PARTIALLY_PAID: "partially_paid",
  REFUNDED: "refunded",
  VOIDED: "voided",
};

// Return statuses
export const RETURN_STATUS = {
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
  RECEIVED: "received",
  REFUNDED: "refunded",
};

// Return reasons
export const RETURN_REASONS = [
  { value: "defective", label: "Defective / Damaged" },
  { value: "wrong_item", label: "Wrong Item Received" },
  { value: "not_as_described", label: "Not As Described" },
  { value: "changed_mind", label: "Changed Mind" },
  { value: "size_fit", label: "Size / Fit Issue" },
  { value: "quality", label: "Quality Not Satisfactory" },
  { value: "other", label: "Other" },
];

// Currencies
export const CURRENCIES = {
  INR: { symbol: "₹", code: "INR", name: "Indian Rupee" },
  USD: { symbol: "$", code: "USD", name: "US Dollar" },
  EUR: { symbol: "€", code: "EUR", name: "Euro" },
  GBP: { symbol: "£", code: "GBP", name: "British Pound" },
};
export const DEFAULT_CURRENCY = CURRENCIES.INR;

// Shipping
// ---------------------------------------------------------------------------
// THERE IS NO FREE-SHIPPING THRESHOLD CONSTANT ANY MORE (Prompt 13).
//
// The old constant (999) was a figure the store had never actually committed
// to, yet it was quoted on the announcement bar, in the cart meter, in the
// footer promise row and inside a FAQ answer. Prompt 02 retired its value to
// null; Prompt 12 took the last component off it, and Prompt 13 removed both
// the footer promise row and the export itself.
//
// THE THRESHOLD NOW HAS EXACTLY ONE HOME: `freeAbove` on the active
// `shipping_methods` (Admin > Shipping), read live. The real threshold is the
// lowest `freeAbove` across those methods (resolveTrustBadgeDetail in
// theme/tokens.js reads it that way, and CartDrawer's meter reads it directly),
// and it reaches shared copy as `fillStoreCopy`'s `freeAbove` option.
//
// EVERY CONSUMER MUST TREAT AN ABSENT THRESHOLD AS "unknown -> hide" — not as
// zero, and not as "everything ships free". `fillStoreCopy` keeps its
// {freeShipping} handling for exactly that reason: FAQ 6 still carries the
// token, and the whole sentence is dropped while nobody has set a figure.

// Social links — the SEED values only. Where the marks actually point is owned
// by the admin (Settings > Social Links, persisted as `settings.social`); these
// are what a store starts with, and what utils/socialLinks.js falls back to when
// a settings record carries no `social` section at all. Every LAMIKAA profile is
// still a placeholder, and normalizeSocialUrl() turns a placeholder into "" — so
// no https:// link built from a token can ever reach the page.
export const SOCIAL_LINKS = {
  FACEBOOK: brand.social.facebook,
  TWITTER: brand.social.twitter,
  INSTAGRAM: brand.social.instagram,
  YOUTUBE: brand.social.youtube,
  WHATSAPP: brand.social.whatsapp,
};

// Store contact. Single source so the Footer, Help Centre and Contact page all
// stay in sync. All four are unresolved placeholders until the owner supplies
// them; every surface that reads one hides the row rather than print a token.
export const SUPPORT_EMAIL = brand.contact.email;
export const SUPPORT_PHONE = brand.contact.phone;
export const SUPPORT_ADDRESS = brand.contact.address;
export const SUPPORT_HOURS = brand.contact.hours;

// POLICY_LAST_UPDATED was here. It was one hard-coded date shared by four
// hard-coded policy pages, and it had to be, because a date typed into a
// component cannot know when the CLAUSES beside it were edited. Prompt 28 moved
// the four documents into `siteContent.policies`, where each record carries its
// own `updatedAt` — written when the owner saves that document in the admin —
// and the page prints the stamp only for a document that actually has one.

// FAQs — one shared set, read on three surfaces: the Help Centre (/faq), the
// home FAQ block and the PDP's FAQ panel. This is also the set FaqContext falls
// back to when the API is unreachable, and Prompt 06 seeds the same rows into
// db.json.
//
// The copy is quoted from BRAND.md and from the packaging. Nothing is invented:
// the ownership answers keep their legal qualifiers word for word, and the two
// answers that would need a figure the store has not set carry a token instead —
// fillStoreCopy fills it when the setting exists and drops the whole sentence
// when it does not.
export const FAQ_ITEMS = [
  {
    id: 1,
    question: "Who owns LAMIKAA Naturals?",
    answer:
      "LAMIKAA Naturals is owned by Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL), a Farmer Producer Company owned by its farmer members. The value created through LAMIKAA contributes to the farmer-owned enterprise, and profits distributed by BAOPCL can reach its member farmers as dividends, subject to applicable laws and the company's dividend declaration.",
  },
  {
    id: 2,
    question: "Does buying LAMIKAA products benefit farmers?",
    answer:
      "LAMIKAA Naturals is part of a farmer-owned value chain: farmer, FPC, value addition, LAMIKAA Naturals, consumer. When the business succeeds and profits are distributed by BAOPCL, its farmer members can benefit through dividends, subject to applicable laws and the company's dividend declaration. Your choice of LAMIKAA can help create value beyond the product — value that may ultimately return to the farming community.",
  },
  {
    id: 3,
    question: "Why is black rice in every product?",
    answer:
      "Black rice is the hero ingredient of the range: antioxidant-rich and traditionally valued in Northeast India. Each product pairs it with botanicals chosen for a specific step of your routine.",
  },
  {
    id: 4,
    question: "Are the products suitable for all skin types?",
    answer:
      "The range is formulated for everyday use. As printed on the packs, do a patch test before first use, keep away from the eyes and discontinue use if irritation occurs.",
  },
  {
    id: 5,
    question: "Do the products have a fragrance?",
    answer:
      "The Black Rice range carries a mild sandalwood fragrance, as printed on the packs.",
  },
  {
    id: 6,
    question: "How long does delivery take, and is shipping free?",
    // The second sentence is the {freeShipping} sentence: fillStoreCopy drops
    // it whole while no shipping method carries a free-shipping threshold, so
    // the answer never quotes a figure the store has not set.
    answer:
      "Dispatch and delivery times are shown at checkout for your address. Shipping is free on orders above {freeShipping}.",
  },
  {
    id: 7,
    question: "What is your return policy?",
    answer:
      "You can request a return from My Orders within {{RETURN_WINDOW_DAYS}} days of delivery for unopened products in their original packaging. Opened skincare cannot be returned for hygiene reasons unless it arrived damaged.",
  },
  {
    id: 8,
    question: "How do I track my order?",
    answer:
      "You will receive an email with a tracking number as soon as your order is dispatched. You can also follow it at any time from the My Orders section of your account, where the current stage of every order is shown.",
  },
];

// Framer Motion animation variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -50, opacity: 0 },
  },
  slideDown: {
    initial: { y: -50, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 50, opacity: 0 },
  },
  slideLeft: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  },
  slideRight: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 },
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
};

// Breakpoints
export const BREAKPOINTS = {
  XS: 480,
  SM: 768,
  MD: 1024,
  LG: 1280,
  XL: 1440,
};

// TRUST_BADGES was here. It was a one-line re-export of `brand.trustBadges`,
// and its last consumer was the home page's closing "Promises" row, which
// Prompt 15 replaced with <TrustStrip/> — reading the same four promises from
// the same config, at the top of the page. Prompt 22 deleted the row's last
// remnants, so the alias had nothing left to alias for. `brand.trustBadges` is
// unchanged and is what every surface reads.
//
// WHY_CHOOSE_US was here too, and went the same way in Prompt 28: it re-shaped
// `brand.pillars` into `{id, title, description, icon}` rows for the Contact
// page's rail, and that rail now mounts <Pillars compact/>, which reads the
// pillars from the config and owns its own glyphs. One shape, one owner.
