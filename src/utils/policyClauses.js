import { STOREFRONT_CONFIG } from "../theme/tokens";
import { formatCurrency } from "./helpers";
import { SUPPORTED_CURRENCIES } from "./storeSettings";

// =============================================================================
// policyClauses — the clauses a policy cannot be written down in advance
// =============================================================================
//
// The four policies live in `siteContent.policies` and are edited in the admin
// (Prompt 34). Most of what they say is prose the owner writes once. Three
// sentences are not: what currency prices are in, whether tax is inside them,
// whether cash on delivery is offered and up to what value, how long a return
// window runs, and which shipping methods the checkout is actually going to
// offer. Every one of those is a live setting, and a policy that STATES one in
// stored prose is a policy that goes out of date the next time an admin edits
// Settings > General or Shipping — silently, and in a legal document.
//
// So they are BUILT, here, from the same records the checkout reads, and
// appended to the stored body as markdown-lite (the grammar in
// utils/contentBlocks.js) so they typeset exactly like the clauses above them.
// This is the whole of the live-clause logic from the Terms page this
// replaced — `currencyName`, the tax sentence and `codClause` — lifted out of a
// component that also carried nine hard-coded Meghali-era clauses. The three
// hard-coded rupee shipping rates it printed are NOT lifted: rates come from
// `shipping.getMethods()` or they do not appear at all.
//
// EVERY BUILDER RETURNS "" WHEN IT HAS NOTHING TRUE TO SAY, and the page drops
// the block rather than printing a heading over an empty space. A policy that
// invents a figure is worse than a policy that is quiet about one.
// =============================================================================

/** A number that is actually a number and actually positive. */
const positive = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

const text = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * "Indian Rupee" from "INR" — the currency's name without the symbol the label
 * carries in brackets, because the clause prints the symbol separately.
 *
 * Ported verbatim from the Terms page this replaced. An unknown code falls
 * back to the code itself, which is still true.
 *
 * @param {string} currency ISO code from `settings.store.currency`
 * @returns {string}
 */
export const currencyName = (currency) => {
  const known = SUPPORTED_CURRENCIES.find((c) => c.code === currency);
  // The label reads "Indian Rupee (₹)"; the bracketed symbol comes off.
  return known ? known.label.replace(/\s*\([^)]*\)\s*$/, "") : currency || "";
};

/**
 * What the store's prices include, as a sentence.
 *
 * A tax-inclusive store with a 0 rate is the LAMIKAA case — the packs print
 * "M.R.P (incl. of all taxes)" and no rate has been supplied — so it says
 * "inclusive of all taxes" rather than claiming a 0% rate.
 *
 * @param {object} store `settings.store`
 * @returns {string}
 */
export const taxClause = ({ currency, currencySymbol, taxRate, taxIncluded } = {}) => {
  const name = currencyName(currency);
  const symbol = text(currencySymbol);
  const where = name
    ? `Prices are shown in ${name}${symbol ? ` (${symbol})` : ""}`
    : "Prices are shown in the store's currency";
  const rate = positive(taxRate);

  if (taxIncluded) {
    return rate
      ? `${where} and are inclusive of ${rate}% tax. The tax already inside the price is broken out on the order summary and on your invoice.`
      : `${where} and are inclusive of all taxes, as printed on the pack.`;
  }
  return rate
    ? `${where} and are exclusive of ${rate}% tax. Tax is calculated at checkout and appears as its own line on the order summary and on your invoice.`
    : `${where}. Any tax that applies is calculated at checkout and appears as its own line on the order summary and on your invoice.`;
};

/**
 * The cash-on-delivery rule the checkout is currently running, as a sentence.
 *
 * Ported from the Terms page this replaced, including the "may be withheld"
 * clause — the three shapes are: not offered, offered up to a ceiling, and
 * offered without one.
 *
 * @param {object} payment `settings.payment`
 * @returns {string}
 */
export const codClause = ({ codEnabled, codMaxOrder } = {}) => {
  if (codEnabled === false) return "Cash on delivery is not currently offered.";
  const ceiling = positive(codMaxOrder);
  if (ceiling) {
    return `Cash on delivery is available on orders up to ${formatCurrency(ceiling, null, {
      decimals: 0,
    })} and may be withheld for addresses with a history of refused deliveries.`;
  }
  return "Cash on delivery is available and may be withheld for addresses with a history of refused deliveries.";
};

/**
 * The returns window, as a sentence — or "" where the store advertises none.
 *
 * `STOREFRONT_CONFIG.returnsWindowDays` is the same value the buy-box badge,
 * the delivery panel and the FAQ answer read, so the four cannot drift. Zero
 * means "no returns advertised", and the sentence is simply not written.
 *
 * @param {number} [days]
 * @returns {string}
 */
export const returnsClause = (days = STOREFRONT_CONFIG.returnsWindowDays) => {
  const window = positive(days);
  if (!window) return "";
  return `Eligible products may be returned within ${window} days of delivery; what qualifies and how a return is processed are set out in the Shipping & Returns policy, which forms part of these terms.`;
};

/**
 * The block appended to the TERMS: what a price is in, what tax it carries,
 * how it can be paid and how long a return runs.
 *
 * Returned as markdown-lite so the page renders it through the same
 * `ContentBlocks` as the stored clauses and it takes a clause number in the
 * same run — a reader cannot tell which sentences were typed and which were
 * computed, which is the point.
 *
 * @param {object} options
 * @param {object} options.store    `settings.store`
 * @param {object} options.payment  `settings.payment`
 * @param {number} [options.returnWindowDays]
 * @param {string} [options.title]  the clause heading (a UI string)
 * @returns {string} markdown-lite, or "" when there is nothing to state
 */
export const termsPricingBlock = ({
  store,
  payment,
  returnWindowDays,
  title = "Pricing, tax and payment",
} = {}) => {
  const paragraphs = [
    taxClause(store),
    codClause(payment),
    returnsClause(returnWindowDays),
  ].filter(Boolean);

  if (paragraphs.length === 0) return "";
  return [`## ${title}`, ...paragraphs].join("\n\n");
};

/**
 * One shipping method as a sentence: its description, then its delivery
 * estimate when the admin has recorded one.
 *
 * No rate is printed. `flatRate`/`freeAbove` are money, and money in a policy
 * belongs where the checkout can be held to it — the same rule that retired the
 * old Terms page's three hard-coded rupee rows.
 */
const methodLine = (method) => {
  const description = text(method?.description);
  const days = text(method?.estimatedDays);
  if (!description && !days) return "";
  return [description, days ? `Estimated delivery: ${days}.` : ""]
    .filter(Boolean)
    .join(" ");
};

/**
 * The block appended to SHIPPING & RETURNS: the methods the checkout will
 * actually offer, named and described from `shipping.getMethods()`.
 *
 * A method with neither a description nor an estimate still appears — its name
 * IS the fact that it is offered — and the clause disappears entirely when no
 * method is active, rather than promising a delivery option that does not
 * exist.
 *
 * @param {Array<object>} methods rows from `apiService.shipping.getMethods()`
 * @param {object} [options]
 * @param {string} [options.title] the clause heading (a UI string)
 * @returns {string} markdown-lite, or "" when there is nothing to list
 */
export const shippingMethodsBlock = (
  methods,
  { title = "Delivery options" } = {}
) => {
  const rows = (Array.isArray(methods) ? methods : [])
    .map((method) => ({ name: text(method?.name), line: methodLine(method) }))
    .filter((row) => row.name);

  if (rows.length === 0) return "";

  return [
    `## ${title}`,
    // A definition-style list: the method's name in bold, then what it is.
    // `ContentBlocks` renders `**bold**` inline, so this needs no new grammar.
    ...rows.map((row) => `- **${row.name}**${row.line ? ` — ${row.line}` : ""}`),
  ].join("\n");
};

const policyClauses = {
  currencyName,
  taxClause,
  codClause,
  returnsClause,
  termsPricingBlock,
  shippingMethodsBlock,
};

export default policyClauses;
