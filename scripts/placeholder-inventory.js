#!/usr/bin/env node
/* eslint-disable no-console */
// =============================================================================
// placeholder-inventory.js — the two inventories, regenerated from the repo
// =============================================================================
//
//   npm run placeholders            # both tables, Markdown, to stdout
//   npm run placeholders -- --json  # the same facts as JSON, for tooling
//
// WHY IT EXISTS. `prompts/_reference/PLACEHOLDERS.md` and
// `PLACEHOLDER_ASSETS.md` are hand-written guidance — what each unknown fact
// is, who supplies it, what the packaging suggests. That prose is worth
// keeping and cannot be derived. What CAN drift is the list underneath it:
// a token resolved in `db.json` but still listed as open, a placeholder photo
// swapped for a real one, a new token introduced by a later edit. This script
// derives that list from the two places tokens can actually live — `db.json`
// (the seed) and `src/` (config, copy defaults and the admin's token palette)
// — so the inventories are re-generated rather than remembered. Paste the
// output under the "Current inventory — generated" heading in each file.
//
// WHAT A TOKEN IS. The grammar is `src/utils/placeholders.js`'s, mirrored
// here character for character: `{{UPPER_SNAKE}}`, upper case, digits and
// underscores only, so ordinary prose in braces is never mistaken for one.
//
// COMMENTS ARE NOT INVENTORY. Twenty-odd files explain the convention in
// their headers, and those sentences quote generic names — `{{TOKEN}}`,
// `{{TOKENS}}`, `{{UPPER_SNAKE}}`, `{{X}}` — that no owner will ever supply.
// Counting them as unresolved facts would bury the fourteen real ones, so
// every source file is run through a small string-aware comment scanner
// (`commentRanges`) and a hit inside a comment is summarised under the table
// rather than listed in it. Nothing is silently dropped: the count and the
// distinct names are printed, so a real token that somehow ends up commented
// out is still visible.
//
// KINDS. A live hit is classified by WHERE it sits, because the four kinds
// need different actions from the owner:
//   data         db.json — the seed the store actually serves.
//   config       src/config/brand.js — the single source of brand truth.
//   copy-default a token inside boilerplate copy in src/utils/constants.js.
//   helper       a fallback a helper EMITS when a setting is missing
//                (src/utils/storeSettings.js) — resolving the setting
//                removes it; the token is not itself an unsupplied fact.
//   admin-hint   the admin's insert-a-token palette
//                (pages/Admin/components/MarkdownField.js) — a menu of the
//                tokens an editor may type, not an unresolved fact.
//   test-fixture a token or placeholder URL inside a *.test.js fixture.
//
// PLACEHOLDER MEDIA. Two independent signals, unioned:
//   1. `media[].placeholder === true` — the flag Prompt 06 seeded and the
//      admin's media manager round-trips, which is authoritative for product
//      galleries.
//   2. The four stand-in hosts, anywhere in `db.json` or `src/`:
//      picsum.photos · interactive-examples.mdn.mozilla.net ·
//      res.cloudinary.com/demo · mdn.mozilla.net. Category, ritual and story
//      imagery is NOT inside `media[]` and carries no flag, so the host test
//      is the only thing that finds it.
//   A row found by both is reported once, with both signals named.
//
// NO DEPENDENCIES, BY THE PROGRAMME'S RULE (00_INDEX.md §2): Node's own fs
// and path only. `db.json` is parsed as JSON (so every hit carries a real key
// path); `src/` is read as text (so every hit carries a file and a line).
//
// EXIT CODE. 0 whenever the scan completes — an unresolved placeholder is the
// project's expected state and must never fail a build. A real failure
// (unreadable db.json, missing src/) exits 1.
// =============================================================================

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DB_PATH = path.join(ROOT, "db.json");
const SRC_DIR = path.join(ROOT, "src");

/** The placeholder grammar, mirrored from src/utils/placeholders.js. */
const TOKEN_RE = /\{\{[A-Z0-9_]+\}\}/g;

/** Hosts that only ever serve a stand-in (PLACEHOLDER_ASSETS.md). */
const PLACEHOLDER_HOSTS = [
  "picsum.photos",
  "interactive-examples.mdn.mozilla.net",
  "mdn.mozilla.net",
  "res.cloudinary.com/demo",
];
const HOST_RE = new RegExp(
  PLACEHOLDER_HOSTS.map((h) => h.replace(/[.]/g, "\\.").replace(/\//g, "\\/")).join("|")
);

/** Generic names that only ever appear in prose about the convention. */
const META_TOKENS = new Set([
  "{{TOKEN}}",
  "{{TOKENS}}",
  "{{UPPER_SNAKE}}",
  "{{DOUBLE_BRACE}}",
  "{{X}}",
  "{{ADDRESS_2}}",
]);

const SCANNED_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".css", ".json", ".html"]);

// ---- Source scanning --------------------------------------------------------

/**
 * Byte ranges of `//` and block comments in `text`, skipping anything inside a
 * string or a template literal so a `"https://…"` is never read as a comment.
 * JS and CSS share both comment forms, so one scanner covers every file here.
 */
function commentRanges(text) {
  const ranges = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    const next = text[i + 1];
    if (c === "/" && next === "/") {
      const end = text.indexOf("\n", i);
      ranges.push([i, end === -1 ? text.length : end]);
      i = end === -1 ? text.length : end;
    } else if (c === "/" && next === "*") {
      const end = text.indexOf("*/", i + 2);
      ranges.push([i, end === -1 ? text.length : end + 2]);
      i = end === -1 ? text.length : end + 2;
    } else if (c === '"' || c === "'" || c === "`") {
      i += 1;
      while (i < text.length && text[i] !== c) {
        if (text[i] === "\\") i += 1;
        // An unterminated single/double quote is a line, not a file: bail at
        // the newline so one stray apostrophe cannot swallow the rest.
        if ((c === '"' || c === "'") && text[i] === "\n") break;
        i += 1;
      }
      i += 1;
    } else {
      i += 1;
    }
  }
  return ranges;
}

const inRanges = (index, ranges) => ranges.some(([a, b]) => index >= a && index < b);

/** Every scannable file under `dir`, depth first, repo-relative. */
function walkFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  )) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, acc);
    else if (SCANNED_EXTENSIONS.has(path.extname(entry.name))) acc.push(full);
  }
  return acc;
}

/** The `kind` column for a live (non-comment) hit in a source file. */
function classify(relPath) {
  if (/\.test\.[jt]sx?$/.test(relPath)) return "test-fixture";
  if (relPath === "src/config/brand.js") return "config";
  if (relPath === "src/utils/storeSettings.js") return "helper";
  if (relPath === "src/pages/Admin/components/MarkdownField.js") return "admin-hint";
  if (relPath === "src/utils/constants.js") return "copy-default";
  return "code";
}

function scanSource() {
  const tokens = [];
  const media = [];
  const commented = [];
  for (const file of walkFiles(SRC_DIR)) {
    const rel = path.relative(ROOT, file).split(path.sep).join("/");
    const text = fs.readFileSync(file, "utf8");
    if (!TOKEN_RE.test(text) && !HOST_RE.test(text)) {
      TOKEN_RE.lastIndex = 0;
      continue;
    }
    TOKEN_RE.lastIndex = 0;
    const ranges = commentRanges(text);
    const lineOf = (index) => text.slice(0, index).split("\n").length;

    let match;
    while ((match = TOKEN_RE.exec(text)) !== null) {
      const record = { token: match[0], file: rel, line: lineOf(match.index) };
      if (inRanges(match.index, ranges)) commented.push(record);
      else tokens.push({ ...record, kind: classify(rel) });
    }
    text.split("\n").forEach((lineText, i) => {
      // The scheme is optional: a fixture may carry a bare host string.
      const hostMatch = lineText.match(
        /(?:https?:\/\/)?[^\s"'`)]*(?:picsum\.photos|mdn\.mozilla\.net|res\.cloudinary\.com\/demo)[^\s"'`)]*/
      );
      if (!hostMatch) return;
      const index = text.split("\n").slice(0, i).join("\n").length + (i ? 1 : 0);
      if (inRanges(index + lineText.indexOf(hostMatch[0]), ranges)) return;
      media.push({
        where: `${rel}:${i + 1}`,
        url: hostMatch[0],
        signal: "host",
        kind: classify(rel),
      });
    });
  }
  return { tokens, media, commented };
}

// ---- db.json scanning -------------------------------------------------------

/** Every string in `value`, with the dotted/indexed key path that reaches it. */
function walkJson(value, keyPath, visit) {
  if (typeof value === "string") visit(value, keyPath);
  else if (Array.isArray(value)) value.forEach((v, i) => walkJson(v, `${keyPath}[${i}]`, visit));
  else if (value && typeof value === "object")
    Object.entries(value).forEach(([k, v]) => walkJson(v, keyPath ? `${keyPath}.${k}` : k, visit));
}

function scanDb(db) {
  const tokens = [];
  walkJson(db, "", (str, keyPath) => {
    const found = str.match(TOKEN_RE);
    if (!found) return;
    [...new Set(found)].forEach((token) =>
      tokens.push({ token, file: "db.json", line: keyPath, kind: "data" })
    );
  });

  // Signal 1 — the flag, which is authoritative for product galleries. Keyed
  // by LOCATION, never by URL: one stand-in clip is reused by four products,
  // and each of those four rows is a separate swap for the owner to make.
  const flagged = new Map();
  const flaggedUrls = new Set();
  (db.products || []).forEach((product) => {
    (product.media || []).forEach((row, i) => {
      if (row.placeholder !== true) return;
      const where = `products[${product.slug || product.id}].media[${i}]`;
      flagged.set(where, {
        where,
        url: row.url,
        type: row.type || "image",
        signals: HOST_RE.test(row.url || "") ? ["flag", "host"] : ["flag"],
      });
      flaggedUrls.add(row.url);
    });
  });

  // Signal 2 — the stand-in hosts, which also reach category / ritual /
  // story imagery that lives outside `media[]` and carries no flag. A URL the
  // flag already caught is not repeated; a second key path holding the same
  // URL (a category's `image` AND its `heroImage`) is, because both fields
  // have to be edited.
  const byHost = new Map();
  walkJson(db, "", (str, keyPath) => {
    if (!HOST_RE.test(str)) return;
    // `products[n].media[i].url` is signal 1's own row; `products[n].images[]`
    // and `products[n].image` are the derived mirrors of it (REPO_MAP §3.4),
    // not a second asset to swap.
    if (/\.media\[\d+\]\.(url|poster)$/.test(keyPath)) return;
    if (/^products\[\d+\]\.(images(\[\d+\])?|image)$/.test(keyPath) && flaggedUrls.has(str)) return;
    if (byHost.has(keyPath)) return;
    byHost.set(keyPath, {
      where: keyPath,
      url: str,
      type: /\.mp4($|\?)/.test(str) ? "video" : "image",
      signals: ["host"],
    });
  });

  const byWhere = (a, b) => a.where.localeCompare(b.where);
  return {
    tokens,
    media: [...[...flagged.values()].sort(byWhere), ...[...byHost.values()].sort(byWhere)],
  };
}

// ---- Rendering --------------------------------------------------------------

const esc = (s) => String(s).replace(/\|/g, "\\|");
/** The host of a URL, whether or not it carries a scheme. */
const host = (url) => {
  const withScheme = url.match(/^https?:\/\/([^/]+)/);
  if (withScheme) return withScheme[1];
  const bare = url.match(/^([a-z0-9.-]+\.[a-z]{2,})(?:\/|$)/i);
  return bare ? bare[1] : url;
};

function tokenTable(rows) {
  const byToken = new Map();
  rows.forEach((row) => {
    if (!byToken.has(row.token)) byToken.set(row.token, []);
    byToken.get(row.token).push(row);
  });
  const lines = [
    "| Token | Live hits | Kinds | Where (file → key path / line) |",
    "|---|---|---|---|",
  ];
  [...byToken.keys()].sort().forEach((token) => {
    const hits = byToken.get(token);
    const kinds = [...new Set(hits.map((h) => h.kind))].sort().join(", ");
    const where = hits
      .map((h) => (h.file === "db.json" ? `\`db.json\` → \`${h.line}\`` : `\`${h.file}:${h.line}\``))
      .join("; ");
    lines.push(`| \`${esc(token)}\` | ${hits.length} | ${esc(kinds)} | ${esc(where)} |`);
  });
  return lines.join("\n");
}

function mediaTable(rows) {
  const lines = [
    "| # | Type | Host | Signal | Where | URL |",
    "|---|---|---|---|---|---|",
  ];
  rows.forEach((row, i) => {
    lines.push(
      `| ${i + 1} | ${row.type} | \`${esc(host(row.url))}\` | ${row.signals.join(" + ")} | \`${esc(
        row.where
      )}\` | \`${esc(row.url)}\` |`
    );
  });
  return lines.join("\n");
}

// ---- Main -------------------------------------------------------------------

function main() {
  const asJson = process.argv.includes("--json");
  let db;
  try {
    db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch (error) {
    console.error(`placeholder-inventory: cannot read ${DB_PATH} — ${error.message}`);
    process.exitCode = 1;
    return;
  }
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`placeholder-inventory: ${SRC_DIR} does not exist`);
    process.exitCode = 1;
    return;
  }

  const source = scanSource();
  const seed = scanDb(db);

  const tokenRows = [...seed.tokens, ...source.tokens].sort(
    (a, b) => a.token.localeCompare(b.token) || a.file.localeCompare(b.file)
  );
  const mediaRows = [
    ...seed.media.map((m) => ({ ...m, source: "db.json" })),
    ...source.media.map((m) => ({ ...m, type: /\.mp4($|\?)/.test(m.url) ? "video" : "image", signals: [m.signal], source: "src" })),
  ];

  const distinctTokens = [...new Set(tokenRows.map((r) => r.token))];
  const ownerTokens = distinctTokens.filter(
    (t) =>
      tokenRows.some((r) => r.token === t && ["data", "config", "copy-default"].includes(r.kind))
  );
  const commentedNames = [...new Set(source.commented.map((c) => c.token))].sort();
  const metaOnly = commentedNames.filter((t) => META_TOKENS.has(t));

  if (asJson) {
    console.log(
      JSON.stringify(
        { tokens: tokenRows, media: mediaRows, commented: source.commented, generatedAt: null },
        null,
        2
      )
    );
    return;
  }

  console.log("### Table 1 — `{{TOKEN}}` occurrences in `db.json` and `src/`\n");
  console.log(tokenTable(tokenRows));
  console.log(
    `\n**${distinctTokens.length} distinct tokens · ${tokenRows.length} live occurrences.** ` +
      `${ownerTokens.length} are unresolved facts an owner must supply ` +
      `(kinds \`data\`, \`config\`, \`copy-default\`); the rest are a helper fallback, ` +
      `the admin's insert-a-token palette or a test fixture.`
  );
  console.log(
    `\n${source.commented.length} further mentions sit inside code comments and are NOT inventory ` +
      `(${commentedNames.map((t) => `\`${t}\``).join(", ")}` +
      `${metaOnly.length ? ` — ${metaOnly.length} of those names are generic, used only to describe the convention` : ""}).`
  );

  console.log("\n### Table 2 — placeholder media\n");
  console.log(mediaTable(mediaRows));
  const dbMedia = mediaRows.filter((r) => r.source === "db.json");
  const hosts = [...new Set(dbMedia.map((r) => host(r.url)))].sort();
  console.log(
    `\n**${dbMedia.length} placeholder assets in \`db.json\`** ` +
      `(${dbMedia.filter((r) => r.type === "image").length} images, ` +
      `${dbMedia.filter((r) => r.type === "video").length} videos) across ${hosts.length} hosts: ` +
      `${hosts.map((h) => `\`${h}\``).join(", ")}. ` +
      `${dbMedia.filter((r) => r.signals.includes("flag")).length} carry \`"placeholder": true\` in ` +
      `\`products[].media[]\`; the rest are category, ritual and story imagery, which lives outside ` +
      `\`media[]\` and is found by host alone. ` +
      `${mediaRows.length - dbMedia.length} further stand-in URLs are test fixtures under \`src/\`.`
  );
}

main();
