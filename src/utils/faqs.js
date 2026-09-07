// =============================================================================
// FAQs — shared shape, defaults and normalizers
// =============================================================================
//
// Every answered question on the storefront now comes from ONE admin-managed
// collection, `faqs`, and three surfaces read it:
//
//   PRODUCT PAGES  the "FAQs" tab on the PDP. A row with no product targeting
//                  appears on every product; a row targeted at specific
//                  products appears only on those, above the general ones.
//   HELP CENTRE    /faq — the searchable list of answers.
//   SHARED BLOCK   the reusable "Frequently Asked Questions" section.
//
// A row carries its own placements, so an answer written for one product page
// need not turn up in the Help Centre, and a policy answer need not be repeated
// on every listing.
//
// PLACEMENT IS WHERE, GROUP IS WHICH HEADING
//   `placements[]` decides which SURFACES a row appears on; `group` decides
//   which HEADING it sits under once it is there, on the FAQ page that renders
//   the collection in sections ("The farmer-owned brand", "Products &
//   ingredients", "Orders, shipping & returns", "Account"). The two are
//   independent: a row can be on the help centre and the shared block and still
//   belong to exactly one group. The vocabulary is data, not code — it lives in
//   `siteContent.faqPage.groups[].key` so the owner can rename or reorder the
//   headings without a deploy — so `group` is normalised as a free string with
//   one guaranteed member, DEFAULT_FAQ_GROUP, which every ungrouped row falls
//   into rather than disappearing off the page.
//
// FALLING BACK TO THE CONSTANTS IS DELIBERATE
//   DEFAULT_FAQS is FAQ_ITEMS — the set the site shipped with. An unreachable
//   API therefore degrades to the same answers the visitor read yesterday
//   rather than to an empty accordion (the same rule storeSettings.js follows).
//
// THE ANSWERS QUOTE THE STORE'S OWN FIGURES
//   {freeShipping}, {codSentence} and {taxNote} are filled from Settings >
//   General at render time by fillStoreCopy, so one edit there re-words every
//   answer that quotes a threshold instead of leaving a contradiction on the
//   page. Admins can type those tokens into an answer here too.
// =============================================================================

import { FAQ_ITEMS } from "./constants";

// ─── Vocabularies (shared by the admin controls and the readers) ─────────────

export const FAQ_PLACEMENTS = [
  {
    value: "product",
    label: "Product pages",
    short: "Product",
    icon: "mdi:package-variant-closed",
    hint: "The FAQs tab on a product page",
  },
  {
    value: "help",
    label: "Help centre",
    short: "Help",
    icon: "mdi:lifebuoy",
    hint: "The searchable answers at /faq",
  },
  {
    value: "home",
    label: "Shared FAQ block",
    short: "Shared",
    icon: "mdi:frequently-asked-questions",
    hint: "The reusable Frequently Asked Questions section",
  },
];

export const FAQ_PLACEMENT_VALUES = FAQ_PLACEMENTS.map((p) => p.value);

export const faqPlacementMeta = (value) =>
  FAQ_PLACEMENTS.find((p) => p.value === value) || null;

// The tokens an answer may carry. Surfaced in the editor so an admin can quote
// a figure without freezing today's number into the copy.
export const FAQ_COPY_TOKENS = [
  { token: "{freeShipping}", hint: "Free-shipping threshold" },
  { token: "{codSentence}", hint: "The current Cash on Delivery rule, as a sentence" },
  { token: "{taxNote}", hint: "Whether prices include tax, and at what rate" },
];

// Where a row with no group of its own belongs. Not one of the seeded headings
// on purpose: an answer that has never been filed must be visible somewhere,
// but it must not silently claim to be part of a curated section.
export const DEFAULT_FAQ_GROUP = "general";

export const DEFAULT_FAQ = {
  question: "",
  answer: "",
  group: DEFAULT_FAQ_GROUP,
  placements: [...FAQ_PLACEMENT_VALUES],
  productIds: [],
  isActive: true,
  sortOrder: 0,
};

// The built-in set, in the order it has always been read.
export const DEFAULT_FAQS = FAQ_ITEMS.map((item, index) => ({
  ...DEFAULT_FAQ,
  id: item.id,
  question: item.question,
  answer: item.answer,
  sortOrder: index,
}));

// ─── Normalisation ───────────────────────────────────────────────────────────

const text = (value) => (typeof value === "string" ? value.trim() : "");

const idList = (value) =>
  Array.isArray(value)
    ? value.filter((id) => id !== null && id !== undefined && id !== "")
    : [];

// One row, defensive about every field: an older record (or a half-saved one)
// still renders rather than throwing somewhere down in an accordion.
export const normalizeFaq = (raw, index = 0) => {
  const source = raw && typeof raw === "object" ? raw : {};
  const placements = Array.isArray(source.placements)
    ? source.placements.filter((p) => FAQ_PLACEMENT_VALUES.includes(p))
    : // A record written before placements existed belongs everywhere, which is
      // exactly how the constants behaved.
      [...FAQ_PLACEMENT_VALUES];

  const sortOrder = Number(source.sortOrder);

  return {
    ...(source.id !== undefined ? { id: source.id } : {}),
    // `q`/`a` are accepted because product-inline FAQs have always allowed them.
    question: text(source.question || source.q),
    answer: text(source.answer || source.a),
    // A row written before groups existed, or filed under a heading the owner
    // has since deleted, still renders — under the general heading.
    group: text(source.group) || DEFAULT_FAQ_GROUP,
    placements,
    productIds: idList(source.productIds),
    isActive: source.isActive !== false,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : index,
    ...(source.createdAt ? { createdAt: source.createdAt } : {}),
    ...(source.updatedAt ? { updatedAt: source.updatedAt } : {}),
  };
};

// The whole collection, in the order the admin arranged it. Ties fall back to
// id so the list can never shuffle between two reads.
export const normalizeFaqs = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row, index) => normalizeFaq(row, index))
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return String(a.id ?? "").localeCompare(String(b.id ?? ""), undefined, {
        numeric: true,
      });
    });
};

// ─── Reading ─────────────────────────────────────────────────────────────────

const isAnswered = (faq) => !!(faq.question && faq.answer);

export const isFaqLive = (faq) => !!faq && faq.isActive && isAnswered(faq);

export const faqHasPlacement = (faq, placement) =>
  Array.isArray(faq?.placements) && faq.placements.includes(placement);

// Whether a row is aimed at one product in particular.
export const faqIsTargeted = (faq) =>
  Array.isArray(faq?.productIds) && faq.productIds.length > 0;

export const faqTargetsProduct = (faq, product) => {
  if (!faqIsTargeted(faq)) return false;
  const ids = new Set(faq.productIds.map((id) => String(id)));
  return (
    ids.has(String(product?.id)) ||
    (product?.slug ? ids.has(String(product.slug)) : false)
  );
};

// Drop questions the same wording has already answered, keeping the first —
// which is why the caller orders product-specific rows ahead of general ones.
const dedupe = (faqs) => {
  const seen = new Set();
  return faqs.filter((faq) => {
    const key = faq.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// How many rows to keep, or null for "all of them". Written once because both
// `faqsForPlacement` and the shared `FAQ` component take the same option and
// must agree on what a nonsense value means: nothing is capped by a negative, a
// fraction or a word.
export const faqLimit = (rows, limit) => {
  // `null`/`undefined`/"" are "no cap" and must be tested before Number(), which
  // reads all three as 0 and would answer with an empty list.
  if (limit == null || limit === "") return rows;
  const cap = Number(limit);
  if (!Number.isFinite(cap) || cap < 0) return rows;
  return rows.slice(0, Math.floor(cap));
};

// The Help Centre and the shared block: live rows carrying that placement, and
// never a row written for one product in particular.
//
// `{ limit }` caps the result AFTER the filtering and the de-dupe, which is the
// only order that answers the question a caller is actually asking. The home
// block wants "the first eight answers a visitor should see", not "eight rows
// off the top of the collection, some of which will be dropped" — a cap applied
// first would quietly hand back six.
export const faqsForPlacement = (faqs, placement, { limit } = {}) =>
  faqLimit(
    dedupe(
      (Array.isArray(faqs) ? faqs : [])
        .filter(isFaqLive)
        .filter((faq) => faqHasPlacement(faq, placement))
        .filter((faq) => !faqIsTargeted(faq))
    ),
    limit
  );

// The FAQ page's sections: the live, untargeted rows filed under one heading,
// in the admin's order. `group` is compared as a trimmed string, so a heading
// key and a row's group agree exactly or not at all — there is no fuzzy match
// that could file an answer under the wrong section.
//
// Rows are NOT filtered by placement here: a heading on the FAQ page shows what
// was filed under it. Pass `faqsForPlacement(faqs, "help")` in if a caller
// wants both gates.
export const faqsForGroup = (faqs, group) => {
  const key = typeof group === "string" ? group.trim() : "";
  if (!key) return [];
  return dedupe(
    (Array.isArray(faqs) ? faqs : [])
      .filter(isFaqLive)
      .filter((faq) => !faqIsTargeted(faq))
      .filter((faq) => (faq.group || DEFAULT_FAQ_GROUP) === key)
  );
};

// A product page: the product's own inline FAQs first (a legacy `product.faqs`
// array still works), then the rows aimed at this product, then the general
// product-page rows — de-duped by question, so the most specific answer wins.
export const faqsForProduct = (faqs, product) => {
  const managed = (Array.isArray(faqs) ? faqs : [])
    .filter(isFaqLive)
    .filter((faq) => faqHasPlacement(faq, "product"));
  const inline = (Array.isArray(product?.faqs) ? product.faqs : [])
    .map((faq, index) => normalizeFaq(faq, index))
    .filter(isAnswered);

  return dedupe([
    ...inline,
    ...managed.filter((faq) => faqTargetsProduct(faq, product)),
    ...managed.filter((faq) => !faqIsTargeted(faq)),
  ]);
};
