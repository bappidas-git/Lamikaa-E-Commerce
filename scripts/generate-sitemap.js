#!/usr/bin/env node
/* eslint-disable no-console */
// =============================================================================
// generate-sitemap.js — public/sitemap.xml from db.json + the static routes
// =============================================================================
//
//   npm run sitemap
//
// WHAT IT WRITES. One <urlset> covering every LAMIKAA page a crawler should
// know about: the static routes, one URL per visible product, one per active
// category, one per active ritual, and the four policy documents. Nothing
// private is listed — /cart, /checkout, /order-confirmation, /profile,
// /orders, /wishlist, /search, /login, /register and /admin are all `noindex`
// in the app (hooks/useSeo.js) and Disallow-ed in robots.txt, and a sitemap
// that contradicts those is a sitemap a crawler learns to distrust.
//
// IT REFUSES TO WRITE WITHOUT A DOMAIN. `brand.seo.siteUrl` is still
// `{{LAMIKAA_DOMAIN}}` — the owner has not named the public host (see
// prompts/_reference/PLACEHOLDERS.md). A sitemap is a file of ABSOLUTE URLs
// with no relative form to fall back on, so there is nothing honest to emit
// until that token resolves: the script prints what it needs and exits 0
// WITHOUT writing. Exit 0 and not 1 on purpose — an unresolved placeholder is
// the project's current, expected state, and a `npm run sitemap` in a CI chain
// must not fail the build over it. A real failure (unreadable db.json,
// unwritable public/) still exits 1.
//
//   Resolving it is a one-line edit in src/config/brand.js:
//       seo: { siteUrl: "lamikanaturals.com", … }
//   then `npm run sitemap` writes public/sitemap.xml, and the `Sitemap:` line
//   in public/robots.txt (commented out today, for the same reason) is
//   uncommented with that host.
//
// NO DEPENDENCIES, BY THE PROGRAMME'S RULE (00_INDEX.md §2). Node's own fs and
// path, and `src/config/brand.js` read as TEXT rather than imported: brand.js
// is an ES module that pulls in `utils/cloudinary`, and this script runs under
// plain `node` with no build step, so a `require()` of it would throw on the
// `import` line. The one field needed here is a string literal on a line of
// its own, so a tight regex over the file is both sufficient and stable — and
// it fails loudly rather than quietly guessing if the shape ever changes.
//
// LASTMOD IS A FACT OR IT IS ABSENT. A product carries `updatedAt`/`createdAt`
// in db.json and gets a real <lastmod>; a static route has no such record, so
// it gets none. Inventing today's date for eleven pages that have not changed
// is exactly the noise that makes search engines ignore the element.
// =============================================================================

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DB_PATH = path.join(ROOT, "db.json");
const BRAND_PATH = path.join(ROOT, "src", "config", "brand.js");
const OUT_PATH = path.join(ROOT, "public", "sitemap.xml");

/** The placeholder grammar, mirrored from src/utils/placeholders.js. */
const PLACEHOLDER_RE = /\{\{[A-Z0-9_]+\}\}/;

// ---- Inputs -----------------------------------------------------------------

/**
 * `brand.seo.siteUrl`, read out of the brand module's source.
 *
 * @returns {string} the literal as authored — the placeholder included, so the
 *          caller decides what an unresolved domain means.
 */
const readSiteUrl = () => {
  const source = fs.readFileSync(BRAND_PATH, "utf8");
  const match = source.match(/siteUrl:\s*"([^"]*)"/);
  if (!match) {
    throw new Error(
      `Could not find \`siteUrl: "…"\` in ${path.relative(ROOT, BRAND_PATH)}. ` +
        "The sitemap builds every URL from brand.seo.siteUrl and will not guess a host."
    );
  }
  return match[1].trim();
};

/** `https://host`, with any trailing slash removed. */
const normalizeOrigin = (value) => {
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withScheme.replace(/\/+$/, "");
};

// ---- The route table --------------------------------------------------------

/**
 * The public, indexable static routes, in the order a visitor meets them.
 *
 * `changefreq`/`priority` are deliberately absent: Google has ignored both for
 * years, and a made-up weekly/0.8 on eleven pages is decoration, not data.
 */
const STATIC_ROUTES = [
  "/",
  "/shop",
  "/rituals",
  "/about",
  "/why-lamikaa",
  "/faq",
  "/contact",
  "/special-offers",
  "/policies/privacy",
  "/policies/terms",
  "/policies/shipping-returns",
  "/policies/cookies",
];

/** A row counts as live unless it says otherwise. `isActive: false` hides it. */
const isLive = (row) => Boolean(row) && row.isActive !== false;

/** The most recent date a record admits to, as YYYY-MM-DD, or "". */
const lastmod = (row) => {
  const stamp = row?.updatedAt || row?.createdAt;
  if (typeof stamp !== "string" || !stamp) return "";
  const date = new Date(stamp);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

/**
 * Every URL the sitemap should carry.
 *
 * @param {object} db  the parsed db.json
 * @returns {Array<{loc: string, lastmod: string}>} paths (not yet absolute)
 */
const collectRoutes = (db) => {
  const rows = STATIC_ROUTES.map((loc) => ({ loc, lastmod: "" }));

  const push = (collection, prefix) =>
    (Array.isArray(db[collection]) ? db[collection] : [])
      .filter((row) => isLive(row) && row.slug)
      .forEach((row) => rows.push({ loc: `${prefix}/${row.slug}`, lastmod: lastmod(row) }));

  push("products", "/product");
  push("categories", "/category");
  push("rituals", "/rituals");

  // A duplicate <loc> is a crawl budget spent twice; first writer wins.
  const seen = new Set();
  return rows.filter((row) => !seen.has(row.loc) && seen.add(row.loc));
};

// ---- Output -----------------------------------------------------------------

/** The five characters XML will not take raw inside an element. */
const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const buildSitemap = (origin, rows) => {
  const urls = rows
    .map(({ loc, lastmod: date }) => {
      const lines = [`    <loc>${escapeXml(origin + loc)}</loc>`];
      if (date) lines.push(`    <lastmod>${date}</lastmod>`);
      return `  <url>\n${lines.join("\n")}\n  </url>`;
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
};

// ---- Main -------------------------------------------------------------------

const main = () => {
  const siteUrl = readSiteUrl();

  if (!siteUrl || PLACEHOLDER_RE.test(siteUrl)) {
    console.log(
      [
        "",
        "  No sitemap written — the public domain is still a placeholder.",
        "",
        `    src/config/brand.js  →  seo.siteUrl: ${JSON.stringify(siteUrl)}`,
        "",
        "  Every <loc> in a sitemap is an absolute URL, so there is nothing to",
        "  write until the owner names the host. Set seo.siteUrl (for example",
        '  "lamikanaturals.com"), re-run `npm run sitemap`, and uncomment the',
        "  Sitemap: line in public/robots.txt with the same host.",
        "",
      ].join("\n")
    );
    return;
  }

  const origin = normalizeOrigin(siteUrl);
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  const rows = collectRoutes(db);

  fs.writeFileSync(OUT_PATH, buildSitemap(origin, rows), "utf8");

  const counted = (collection) =>
    (Array.isArray(db[collection]) ? db[collection] : []).filter(
      (row) => isLive(row) && row.slug
    ).length;

  console.log(
    `  Wrote ${path.relative(ROOT, OUT_PATH)} — ${rows.length} URLs on ${origin}\n` +
      `    ${STATIC_ROUTES.length} static · ${counted("products")} products · ` +
      `${counted("categories")} categories · ${counted("rituals")} rituals\n` +
      "    Remember the Sitemap: line in public/robots.txt."
  );
};

try {
  main();
} catch (error) {
  console.error(`  Sitemap generation failed: ${error.message}`);
  process.exitCode = 1;
}
