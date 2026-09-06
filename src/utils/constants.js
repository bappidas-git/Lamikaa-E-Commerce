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
// Every Meghali-era path (/products, /products/:slug, /help, /support,
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
// THERE IS NO BUILT-IN FREE-SHIPPING THRESHOLD ANY MORE.
//
// The old constant (999) was a figure the store had never actually committed
// to, yet it was quoted on the announcement bar, in the cart meter, in the
// footer promise row and inside a FAQ answer. LAMIKAA has not set one, so the
// only honest value is "unknown": null.
//
// EVERY CONSUMER MUST TREAT null AS "unknown → hide" — not as zero, and not as
// "everything ships free". The real threshold, once the owner sets one in
// Admin > Shipping, is the lowest `freeAbove` across the active shipping
// methods (resolveTrustBadgeDetail in theme/tokens.js already reads it that
// way), and it reaches shared copy through fillStoreCopy's `freeAbove` option.
export const FREE_SHIPPING_THRESHOLD = null;

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

// Date the legal/policy pages were last reviewed. Single source so the Privacy,
// Terms, Cookie and Refund pages never show contradictory "last updated" dates.
export const POLICY_LAST_UPDATED = "September 6, 2026";

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

// Why choose us — the four brand pillars (BRAND.md 3.2), in canonical order.
// Title and description come from brand.pillars so the pillar copy is written
// down once; only the glyph is chosen here, because it belongs to this surface
// rather than to the brand.
const PILLAR_ICONS = {
  "indigenous-knowledge": "mdi:leaf",
  "modern-science": "mdi:flask-outline",
  "farmer-ownership": "mdi:account-group-outline",
  "responsible-beauty": "mdi:earth",
};

export const WHY_CHOOSE_US = brand.pillars.map((pillar, index) => ({
  id: index + 1,
  title: pillar.title,
  description: pillar.text,
  icon: PILLAR_ICONS[pillar.key],
}));

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

// Trust badges — owner-mandated wording, configurable in brand.js so it can be
// adjusted for compliance without touching a component (BRAND.md 3.9 rule 4).
export const TRUST_BADGES = brand.trustBadges;
