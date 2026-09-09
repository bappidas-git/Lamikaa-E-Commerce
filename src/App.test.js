// =============================================================================
// App.test.js — the whole storefront renders, and it renders as LAMIKAA
// =============================================================================
// The one test in the programme that mounts <App /> for real: every provider,
// the masthead, the announcement bar, the home page and the footer, over the
// seed. It is a smoke test, so it asserts two things and no styling:
//
//   1. THE MASTHEAD IS LAMIKAA'S. The wordmark is an <img alt="LAMIKAA
//      NATURALS"> rendered by components/brand/Logo from src/config/brand.js.
//      A rebrand that misses a call site, or a brand.js edit that changes the
//      name's casing, both surface here rather than on a screenshot.
//
//   2. NOTHING UNRESOLVED PRINTS. The seed deliberately carries placeholder
//      tokens in the places an owner has not filled in yet — two of the three
//      announcement rows, the store's contact fields, a policy body — and the
//      rule (PLACEHOLDERS.md, "Rendering rules") is that a `{{TOKEN}}` is
//      HIDDEN, never printed. So the fixtures below keep those tokens exactly
//      as db.json holds them, and the assertion is that no "{{" survives into
//      the DOM. Seeding the fixtures with clean copy instead would make the
//      test pass and prove nothing.
//
// WHY api IS MOCKED THE WAY IT IS. `jest.requireActual` keeps the module's
// pure named exports real (`resolveRitualSteps`, `visibleProducts`,
// `getErrorMessage` …) — they are ordinary functions the components call, and
// re-implementing them here would be a second, drifting copy. Only the default
// export, whose every method is an axios round trip, is replaced: a Proxy
// answers ANY namespace and ANY method name, so a future context that fetches
// something new gets an empty result instead of an unhandled rejection, and
// this smoke test never becomes the reason a feature prompt fails.
// =============================================================================

/* eslint-disable no-undef */

// ---- The seed slices, as db.json holds them ---------------------------------
// Small, but never sanitised: rows 2 and 3 of the announcements and the three
// store contact fields are the unresolved-placeholder cases assertion 2 exists
// to catch.
const mockSeed = {
  products: [
    {
      id: 1,
      name: "Black Rice Face Wash",
      shortName: "Face Wash",
      slug: "black-rice-face-wash",
      description: "A gentle daily cleanse.",
      shortDescription: "A gentle daily cleanse.",
      promise: "Cleanses without stripping.",
      price: 390,
      size: "200 ml",
      stock: 50,
      isActive: true,
      categoryId: 1,
      categoryIds: [1, 3],
      concerns: ["dullness"],
      heroOrder: 1,
      heroHeadline: "Begin again, every morning.",
      heroSubtext: "A gentle black rice cleanse.",
      badges: ["Farmer to Consumer"],
      image: "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Black-Rice-Face-Wash-Cover.jpg",
      images: [
        "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Black-Rice-Face-Wash-Cover.jpg",
      ],
      media: [
        {
          type: "image",
          url: "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Black-Rice-Face-Wash-Cover.jpg",
          alt: "Black Rice Face Wash",
          primary: true,
        },
      ],
      rating: 0,
      totalReviews: 0,
    },
    {
      id: 2,
      name: "Black Rice Face Serum",
      shortName: "Face Serum",
      slug: "black-rice-face-serum",
      description: "A concentrated night treatment.",
      shortDescription: "A concentrated night treatment.",
      promise: "Targets dullness overnight.",
      price: null,
      priceTBA: true,
      size: "30 ml",
      stock: 30,
      isActive: true,
      categoryId: 4,
      categoryIds: [1, 4],
      concerns: ["dullness"],
      heroOrder: 2,
      badges: [],
      image: "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670692/Face-Serum-Cover.jpg",
      images: ["https://res.cloudinary.com/v8vrixwq/image/upload/v1788670692/Face-Serum-Cover.jpg"],
      media: [
        {
          type: "image",
          url: "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670692/Face-Serum-Cover.jpg",
          alt: "Black Rice Face Serum",
          primary: true,
        },
      ],
      rating: 0,
      totalReviews: 0,
    },
  ],
  categories: [
    { id: 1, name: "Face Care", displayName: "Face Care", slug: "face-care", isActive: true, kind: "products", sortOrder: 0 },
    { id: 4, name: "Serums", displayName: "Serums", slug: "serums", isActive: true, kind: "products", sortOrder: 1 },
  ],
  concerns: [{ id: 1, slug: "dullness", name: "Dullness", order: 0 }],
  rituals: [
    {
      id: 1,
      slug: "morning-glow",
      name: "The Morning Glow ritual",
      title: "The Morning Glow ritual",
      summary: "Three steps to start the day.",
      isActive: true,
      sortOrder: 0,
      steps: [{ order: 1, productId: 1, note: "Cleanse.", frequency: "Daily" }],
    },
  ],
  // Rows 2 and 3 are the unresolved state, verbatim from db.json.
  announcements: [
    { id: 1, text: "Farmer-owned. Assam-grown.", link: "", isActive: true, sortOrder: 0, startsAt: null, endsAt: null },
    { id: 2, text: "Free shipping over ₹{{FREE_SHIPPING_THRESHOLD}}", link: "/shop", isActive: true, sortOrder: 1, startsAt: null, endsAt: null },
    { id: 3, text: "{{LAUNCH_OFFER_TEXT}}", link: "/shop", isActive: true, sortOrder: 2, startsAt: null, endsAt: null },
  ],
  faqs: [
    { id: 1, question: "Are the products suitable for all skin types?", answer: "Yes — patch test first.", isActive: true, placement: "home", sortOrder: 0 },
    {
      id: 2,
      question: "Can I return an order?",
      // The token sentence must be dropped, not printed.
      answer: "You can request a return within {{RETURN_WINDOW_DAYS}} days of delivery. Opened skincare cannot be returned for hygiene reasons.",
      isActive: true,
      placement: "home",
      sortOrder: 1,
    },
  ],
  siteContent: {
    home: {
      aboutTeaser: { eyebrow: "Our Story", title: "Farmer-owned, Assam-grown", body: "A company owned by the farmers who grow its ingredients." },
      whyBlackRice: { eyebrow: "The ingredient", title: "Why black rice", body: "An antioxidant-rich grain." },
      fullPageCta: { eyebrow: "Join us", title: "Beauty that creates value", body: "Be first to hear when the range launches." },
    },
    about: { title: "Our story", body: "Farmer-owned skincare from Assam." },
    whyLamikaa: { title: "Why LAMIKAA", body: "Four pillars." },
    impact: { title: "Impact", items: [] },
    contact: { title: "Contact", hoursNote: "{{SUPPORT_HOURS}}" },
    faqPage: { title: "FAQs", groups: [] },
    policies: {},
  },
  heroConfig: {
    enabled: true,
    source: "products",
    autoplay: false,
    intervalMs: 6500,
    transition: "fade",
    pauseOnHover: true,
    showControls: true,
    showCounter: true,
    showProgress: true,
    showArrows: true,
  },
  settings: {
    store: {
      name: "LAMIKAA NATURALS",
      // Unresolved, exactly as seeded.
      email: "{{LAMIKAA_EMAIL}}",
      phone: "{{LAMIKAA_PHONE}}",
      address: "{{LAMIKAA_ADDRESS}}",
      currency: "INR",
      taxRate: 0,
      taxIncluded: true,
      codEnabled: true,
    },
    social: {
      instagram: "{{LAMIKAA_INSTAGRAM_URL}}",
      facebook: "{{LAMIKAA_FACEBOOK_URL}}",
      youtube: "{{LAMIKAA_YOUTUBE_URL}}",
      whatsapp: "{{LAMIKAA_WHATSAPP_URL}}",
    },
  },
  dealsConfig: { enabled: false },
  shipping_methods: [{ id: 1, name: "Standard Delivery", flatRate: 0, freeAbove: null, estimatedDays: "", isActive: true }],
};

// The named result map. Anything not listed answers with an empty array, which
// is what every consumer already handles for "the merchant has none of these".
const mockResults = {
  "products.getAll": mockSeed.products,
  "products.getFeatured": mockSeed.products,
  "products.getHeroProducts": mockSeed.products,
  "products.getBySlug": mockSeed.products[0],
  "products.getById": mockSeed.products[0],
  "categories.getAll": mockSeed.categories,
  "concerns.getAll": mockSeed.concerns,
  "rituals.getAll": mockSeed.rituals,
  "siteContent.get": mockSeed.siteContent,
  "announcements.getAll": mockSeed.announcements,
  "hero.getConfig": mockSeed.heroConfig,
  "faqs.getAll": mockSeed.faqs,
  "settings.get": mockSeed.settings,
  "deals.getConfig": mockSeed.dealsConfig,
  "shipping.getMethods": mockSeed.shipping_methods,
  "cart.getCart": [],
  "wishlist.get": [],
  "orders.getByUserId": [],
};

jest.mock("./services/api", () => {
  const actual = jest.requireActual("./services/api");
  // One Proxy per namespace, so an unlisted method is an empty result rather
  // than a TypeError — this file must not be the thing a later prompt breaks.
  const namespace = (nsName) =>
    new Proxy(
      {},
      {
        get: (_target, method) => {
          if (typeof method !== "string") return undefined;
          const key = `${nsName}.${method}`;
          return (...args) =>
            Promise.resolve(
              Object.prototype.hasOwnProperty.call(mockResults, key) ? mockResults[key] : []
            );
        },
      }
    );
  const service = new Proxy(
    {},
    {
      get: (_target, nsName) => (typeof nsName === "string" ? namespace(nsName) : undefined),
    }
  );
  return { ...actual, __esModule: true, default: service };
});

import "@testing-library/jest-dom";
import React from "react";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import App from "./App";
import brand from "./config/brand";

// jsdom ships neither of these and both are read during a first paint:
// matchMedia by MUI and framer-motion's reduced-motion hook, IntersectionObserver
// by the sections that reveal on scroll.
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    ((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
  // jsdom DOES define scrollTo, as a stub that logs "Not implemented" on
  // every route change, so this one is assigned unconditionally.
  window.scrollTo = () => {};
  global.IntersectionObserver =
    global.IntersectionObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
  global.ResizeObserver =
    global.ResizeObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});

// Every provider under <App /> loads asynchronously, so a bare render() leaves
// a dozen state updates in flight and React logs an act() warning for each.
// Rendering inside act and flushing once settles the tree before any assertion.
const renderApp = async () => {
  await act(async () => {
    render(<App />);
  });
  await act(async () => {
    await Promise.resolve();
  });
};

describe("<App />", () => {
  it("renders the LAMIKAA masthead", async () => {
    await renderApp();
    const header = await screen.findByRole("banner");
    // The wordmark's alt IS brand.name — one string, one source (brand.js).
    const wordmark = within(header).getAllByAltText(brand.name)[0];
    expect(wordmark).toBeInTheDocument();
    expect(wordmark.getAttribute("src")).toContain("res.cloudinary.com/v8vrixwq");
    expect(brand.name).toBe("LAMIKAA NATURALS");
  });

  // Two announcement rows, three store contact fields and an FAQ answer in the
  // fixtures above carry live tokens. None of them may reach the page.
  it("prints no unresolved placeholder anywhere on the page", async () => {
    await renderApp();
    await screen.findByRole("banner");
    await waitFor(() => {
      expect(document.body.textContent).not.toContain("{{");
    });
    expect(document.body.textContent).not.toMatch(/\{\{[A-Z0-9_]+\}\}/);
    // The one announcement row that IS resolved still shows, so the assertion
    // above is not passing because the bar rendered nothing at all.
    expect(await screen.findByText(/Farmer-owned\. Assam-grown\./)).toBeInTheDocument();
  });
});
