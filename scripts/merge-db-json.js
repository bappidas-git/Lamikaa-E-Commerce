#!/usr/bin/env node
/* eslint-disable no-console */
// =============================================================================
// merge-db-json.js — a STRUCTURAL three-way merge for db.json
// =============================================================================
//
//   npm run pull            pull, though the running app has db.json modified
//   npm run db:resolve      resolve the conflict git is sitting on right now
//   npm run setup:git       re-arm the driver by hand (npm install arms it)
//
// WHY THIS EXISTS
// ---------------
// db.json is not source. README "Mock API" says it plainly: writes from the
// storefront and the admin land in it, so it is "a real, mutable database".
// Place an order, approve a review, drag a hero slide — json-server rewrites
// the file (server.js -> db.write()). Every machine's copy therefore drifts on
// its own, and the drift is spread across 3,000+ lines of one-field-per-line
// JSON.
//
// Git merges that file the only way it knows how: by LINE. Two machines that
// each appended an order, or each let a review aggregate tick, collide on lines
// that have nothing to do with each other — and a `"rating": 4.7,` against a
// `"rating": 0,` is unresolvable as text because NEITHER SIDE IS RIGHT: the
// number is DERIVED from the reviews collection further down the same file.
// That is the conflict this repository keeps hitting (see commit 767e1e5,
// "Resolve the hero conflict left unmerged in db.json").
//
// The file is not the problem; merging it as text is. So merge it as DATA.
//
// AND A MERGE DRIVER IS NOT ENOUGH ON ITS OWN. A driver only runs once git has
// begun a merge, but the running app keeps db.json modified in the working
// tree, so `git pull` refuses to begin at all:
//
//     error: Your local changes to the following files would be overwritten by
//     merge: db.json — Please commit your changes or stash them. Aborting
//
// That is every pull, on every machine that has ever placed an order, and no
// merge configuration can reach it. `npm run pull` does: it sets the live copy
// aside so git has a clean tree to move, then folds the live edits back in with
// the same three-way merge below — ancestor HEAD, ours the live file, theirs
// what arrived. See pull() at the foot of this file.
//
// WHAT IT DOES
// ------------
//   1. Parses the ancestor, ours and theirs as JSON.
//   2. Walks them together. A value only one side moved away from the ancestor
//      is taken from that side — no conflict, whatever line it sits on.
//      Collections (arrays of records carrying `id`) are merged BY ID, not by
//      position, so records added on either side all survive and an insert
//      never shifts a neighbour into a false conflict.
//   3. Recomputes the review aggregates (`products[].rating` / `.totalReviews`)
//      from the MERGED reviews, by the same rule the app applies in
//      src/services/api.js -> syncProductRating(). A derived field is never
//      "resolved" by picking a side; it is recalculated from the data that
//      defines it, which is the only answer that is correct rather than merely
//      chosen.
//   4. Writes db.json in its own formatting — two-space indent, trailing
//      newline — which is byte-for-byte what JSON.stringify(…, null, 2) already
//      produces for this file, so the merge adds no formatting noise.
//
// WHAT IT REFUSES TO DECIDE. When both sides changed the SAME scalar to two
// different values — an admin here retitled a hero slide, an admin there
// retitled the same slide — there is no derivation to fall back on. It settles
// on `--prefer` (theirs, i.e. the incoming shared branch, by default), PRINTS
// every such decision with its path and both values, and in driver mode exits
// non-zero so git still flags the file for a human. The file it leaves behind
// is always valid JSON with no conflict markers in it.
//
// NO DEPENDENCIES, BY THE PROGRAMME'S RULE (00_INDEX.md section 2). Node's own
// fs, path and child_process. `src/config/brand.js` is read as TEXT for the one
// flag needed here, for the reason generate-sitemap.js reads it that way: it is
// an ES module and this script runs under plain `node` with no build step.
// =============================================================================

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DB_PATH = path.join(ROOT, "db.json");
const BRAND_PATH = path.join(ROOT, "src", "config", "brand.js");

/** A key that is absent, as opposed to one that is present and holds null. */
const MISSING = Symbol("missing");

/**
 * The fields nobody edits and everybody's machine rewrites: the review
 * aggregates on a product, recomputed from the reviews collection after the
 * merge (reconcileReviewAggregates). Matched on the merge PATH — `products` is
 * keyed by record id, so this is `products[7].rating`, not an array index.
 */
const DERIVED_FIELD = /^products\[[^\]]+\]\.(rating|totalReviews)$/;

// ---- Shapes -----------------------------------------------------------------

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Is this an array of RECORDS — the shape every db.json collection has, and the
 * only shape that can be merged by identity rather than by position?
 *
 * An empty array answers true: `returns: []` on one side and one return row on
 * the other is a collection, not a scalar swap.
 */
const isRecordArray = (value) =>
  Array.isArray(value) &&
  value.every((row) => isPlainObject(row) && row.id !== undefined && row.id !== null);

/**
 * A collection needs identity on every side that HAS it. One positional array
 * anywhere (a list of strings, a list of ids) makes the whole node positional,
 * because merging half of it by id would silently reorder the other half — and
 * a side that is not an array at all is a type change, never a collection.
 */
const isCollection = (...sides) => {
  const present = sides.filter((side) => side !== MISSING);
  if (!present.length || !present.every(Array.isArray)) return false;
  return present.every(isRecordArray) && present.some((side) => side.length > 0);
};

// ---- Equality ---------------------------------------------------------------
//
// Key ORDER is not meaning. json-server rewrites a record through JSON.parse ->
// JSON.stringify on every save, and a reordered object that compared unequal
// here would be reported as a change on both sides and conflict against itself.
// So comparison sorts keys; only the OUTPUT preserves order (see mergeObject).

const memo = new WeakMap();

const sortKeys = (value) => {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (!isPlainObject(value)) return value;
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = sortKeys(value[key]);
  return out;
};

const fingerprint = (value) => {
  if (value === MISSING) return "\\0missing";
  if (value === null || typeof value !== "object") {
    const text = JSON.stringify(value);
    return text === undefined ? "\\0undefined" : text;
  }
  if (memo.has(value)) return memo.get(value);
  const print = JSON.stringify(sortKeys(value));
  memo.set(value, print);
  return print;
};

const same = (a, b) => fingerprint(a) === fingerprint(b);

// ---- The merge --------------------------------------------------------------

/**
 * Three-way merge of one node.
 *
 * The first three tests are the whole reason a structural merge beats a textual
 * one: a value only one side moved away from the ancestor is simply taken from
 * that side, no matter how many neighbouring lines also moved.
 *
 * @param {*} base   the value in the merge ancestor, or MISSING
 * @param {*} ours   the value on the branch being merged INTO
 * @param {*} theirs the value on the branch being merged IN
 * @param {string} where  dotted path, for the report
 * @param {object} ctx    { prefer, conflicts[], notes[] }
 */
const merge3 = (base, ours, theirs, where, ctx) => {
  if (same(ours, theirs)) return ours; // nobody disagrees
  if (same(base, ours)) return theirs; // only they touched it
  if (same(base, theirs)) return ours; // only we touched it

  // Both sides moved it, and they moved it somewhere different.

  // One side deleted what the other edited. Keep the edit: a merge may leave a
  // row that should have gone, and that is recoverable; it may not throw away
  // an edit nobody can reconstruct.
  if (ours === MISSING || theirs === MISSING) {
    const from = ours === MISSING ? "theirs" : "ours";
    ctx.notes.push({ where, from });
    return ours === MISSING ? theirs : ours;
  }

  // Both added the same key or record independently: there is no ancestor to
  // compare against, so compare them against an empty one. Two records that
  // agree on nine fields and differ on the tenth then report ONE conflict
  // rather than ten.
  if (base === MISSING) {
    if (isCollection(ours, theirs)) return mergeCollection([], ours, theirs, where, ctx);
    if (isPlainObject(ours) && isPlainObject(theirs)) return mergeObject({}, ours, theirs, where, ctx);
  }

  if (isCollection(base, ours, theirs)) return mergeCollection(base, ours, theirs, where, ctx);
  if (isPlainObject(ours) && isPlainObject(theirs)) return mergeObject(base, ours, theirs, where, ctx);

  // A DERIVED field is never a conflict, because neither side is the authority
  // on it: reconcileReviewAggregates() below recomputes it from the merged
  // reviews and overwrites whatever is chosen here. Reporting it would mark the
  // file conflicted over a number the tool is about to settle by arithmetic —
  // and this pair is the most common conflict in the file, so that alone would
  // undo the point of merging structurally.
  if (ctx.recomputesAggregates && DERIVED_FIELD.test(where)) {
    return ctx.prefer === "ours" ? ours : theirs;
  }

  // A scalar, or two arrays whose meaning IS their order. Nothing left to
  // derive from — record it and settle it.
  ctx.conflicts.push({ where, ours, theirs });
  return ctx.prefer === "ours" ? ours : theirs;
};

/**
 * Merge two objects key by key.
 *
 * Output order follows THEIRS — the incoming branch is the shared one, so its
 * key order is what every other clone converges on too — with keys only we have
 * appended after. A key the ancestor had and one side dropped is already gone
 * by construction: the side that kept it wins the `same(base, …)` test above.
 */
function mergeObject(base, ours, theirs, where, ctx) {
  const baseObj = isPlainObject(base) ? base : {};
  const order = [...Object.keys(theirs), ...Object.keys(ours).filter((key) => !(key in theirs))];
  const out = {};
  for (const key of order) {
    const merged = merge3(
      key in baseObj ? baseObj[key] : MISSING,
      key in ours ? ours[key] : MISSING,
      key in theirs ? theirs[key] : MISSING,
      where ? `${where}.${key}` : key,
      ctx
    );
    if (merged !== MISSING) out[key] = merged;
  }
  return out;
}

/**
 * Merge two collections BY RECORD ID.
 *
 * This is what stops an order appended on one machine from conflicting with an
 * order appended on another: different ids are different records, and both
 * survive. Position is not identity here — nothing in db.json reads a
 * collection's array order (ordering is carried by fields such as `heroOrder`),
 * so the output takes theirs' order with our own additions after it.
 */
function mergeCollection(base, ours, theirs, where, ctx) {
  const index = (rows) => {
    const map = new Map();
    if (Array.isArray(rows)) for (const row of rows) map.set(String(row.id), row);
    return map;
  };
  const b = index(base);
  const o = index(ours);
  const t = index(theirs);

  const ids = [...t.keys(), ...[...o.keys()].filter((id) => !t.has(id))];
  const out = [];
  for (const id of ids) {
    const merged = merge3(
      b.has(id) ? b.get(id) : MISSING,
      o.has(id) ? o.get(id) : MISSING,
      t.has(id) ? t.get(id) : MISSING,
      `${where}[${id}]`,
      ctx
    );
    if (merged !== MISSING) out.push(merged);
  }
  return out;
}

// ---- Derived data -----------------------------------------------------------

/**
 * `brand.flags.showSampleReviews`, read out of the brand module's source — the
 * one input the aggregate rule takes that does not live in db.json.
 *
 * Returns null rather than throwing if the shape ever changes: a merge that
 * cannot verify the aggregates must still hand back a merged file. The caller
 * says so out loud instead of quietly guessing.
 */
const readShowSampleReviews = () => {
  try {
    const source = fs.readFileSync(BRAND_PATH, "utf8");
    const match = source.match(/showSampleReviews:\s*(true|false)/);
    return match ? match[1] === "true" : null;
  } catch {
    return null;
  }
};

/**
 * Recompute `products[].rating` / `.totalReviews` from the merged reviews.
 *
 * MIRRORS src/services/api.js -> syncProductRating(): approved reviews only,
 * sample rows counted only while `brand.flags.showSampleReviews` is on, the
 * mean to one decimal, and a clean 0/0 when nothing qualifies. Those two fields
 * are what every card, rail, search hit and wishlist row prints, and they are
 * exactly the lines a textual merge cannot settle — because the answer is not
 * on either side of the conflict, it is in the reviews collection.
 */
const reconcileReviewAggregates = (db, showSample) => {
  if (!Array.isArray(db?.products) || !Array.isArray(db?.reviews)) return [];

  const byProduct = new Map();
  for (const review of db.reviews) {
    if (!isPlainObject(review) || review.status !== "approved") continue;
    if (!showSample && review.isSample === true) continue;
    const key = String(review.productId);
    if (!byProduct.has(key)) byProduct.set(key, []);
    byProduct.get(key).push(Number(review.rating) || 0);
  }

  const changed = [];
  for (const product of db.products) {
    if (!isPlainObject(product)) continue;
    const scores = byProduct.get(String(product.id)) || [];
    const total = scores.length;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const rating = total > 0 ? Math.round((sum / total) * 10) / 10 : 0;

    if (product.rating !== rating || product.totalReviews !== total) {
      changed.push({
        id: product.id,
        name: product.name || "",
        was: `${product.rating ?? 0}/${product.totalReviews ?? 0}`,
        now: `${rating}/${total}`,
      });
      product.rating = rating;
      product.totalReviews = total;
    }
  }
  return changed;
};

// ---- I/O --------------------------------------------------------------------

const MARKERS = /^(<{7}|={7}|>{7})/m;

const parseJson = (raw, label, where) => {
  if (MARKERS.test(raw)) {
    throw new Error(
      `the ${label} copy still has conflict markers in it (${where}).\n` +
        "  This tool merges the three clean sides git kept, not a marked-up file."
    );
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`the ${label} copy is not valid JSON (${where}): ${error.message}`);
  }
};

const readJson = (file, label) => {
  let raw;
  try {
    raw = fs.readFileSync(file, "utf8");
  } catch (error) {
    throw new Error(`cannot read the ${label} copy of db.json (${file}): ${error.message}`);
  }
  return parseJson(raw, label, file);
};

/** db.json's own formatting: two-space indent, one trailing newline. */
const writeDb = (file, db) => fs.writeFileSync(file, `${JSON.stringify(db, null, 2)}\n`);

/** A value, short enough to print in a report line. */
const brief = (value) => {
  if (value === MISSING) return "(absent)";
  const text = JSON.stringify(value);
  if (text === undefined) return "(undefined)";
  return text.length > 72 ? `${text.slice(0, 69)}...` : text;
};

/** One of the three sides git stages while a merge is unresolved. */
const readStage = (stage, label) => {
  let raw;
  try {
    raw = execFileSync("git", ["show", `:${stage}:db.json`], {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    // Stage 1 is absent when both sides ADDED db.json. An empty ancestor is the
    // correct reading of that: every field then merges add-against-add.
    if (stage === 1) return {};
    throw new Error(
      `git has no ${label} copy of db.json staged.\n` +
        "  Run this while a merge is actually unresolved — `git status` should say\n" +
        '  "both modified: db.json". Nothing has been changed.'
    );
  }
  return parseJson(raw, label, `git stage ${stage}`);
};

// ---- Installing the driver --------------------------------------------------

/**
 * Register the driver in THIS clone's .git/config.
 *
 * .gitattributes can say `db.json merge=dbjson`, but it cannot say what dbjson
 * IS — git deliberately refuses to run a command a repository supplied. So the
 * one-time opt-in lives here, and until it is run git simply falls back to its
 * built-in text merge. Nothing breaks in a clone that never runs it; that clone
 * just keeps getting the line conflicts.
 */
const install = ({ quiet = false } = {}) => {
  const driver = "node scripts/merge-db-json.js --driver %O %A %B";
  try {
    // stderr is captured rather than inherited: when \`npm install\` runs this in a
    // working copy that is no git clone, git’s "fatal: not in a git directory" is
    // ours to swallow, not the install log’s to carry.
    const quietly = { cwd: ROOT, stdio: ["ignore", "ignore", "pipe"] };
    execFileSync("git", ["config", "merge.dbjson.name", "structural three-way merge for db.json"], quietly);
    execFileSync("git", ["config", "merge.dbjson.driver", driver], quietly);
  } catch (error) {
    // `npm install` runs this through `prepare`, and an install has to survive a
    // working copy that is not a git clone at all — a downloaded tarball, a build
    // image, a vendored copy. Nothing is registered; nothing is broken either.
    if (quiet) return 0;
    throw error;
  }
  if (quiet) {
    console.log("  db.json merge driver armed. `npm run pull` pulls over a live database.");
    return 0;
  }
  console.log("\n  Registered the db.json merge driver in this clone.\n");
  console.log(`    merge.dbjson.driver = ${driver}\n`);
  console.log("  git — and GitHub Desktop, which drives the same git — will now merge");
  console.log("  db.json structurally instead of line by line.\n");
  console.log("  `npm install` arms this in every clone, so this command is only needed");
  console.log("  if the driver was taken back out of .git/config by hand.\n");
  return 0;
};

// ---- Pulling over a live db.json --------------------------------------------

/**
 * Run git, returning its stdout. `soft: true` returns null instead of throwing
 * when git exits non-zero — used for the questions git answers with an exit
 * code (is there a HEAD? is this path unmerged?).
 */
const git = (args, { soft = false, inherit = false } = {}) => {
  try {
    return execFileSync("git", args, {
      cwd: ROOT,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: inherit ? ["ignore", "inherit", "inherit"] : ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    if (soft) return null;
    const detail = (error.stderr || error.message || "").trim();
    throw new Error(`git ${args.join(" ")} failed: ${detail}`);
  }
};

/** Is db.json unmerged — i.e. does git hold conflicting stages for it? */
const isUnmerged = () => {
  const listing = git(["ls-files", "--unmerged", "--", "db.json"], { soft: true });
  return Boolean(listing && listing.trim());
};

/** Is a merge, rebase or cherry-pick sitting half finished? */
const midOperation = () =>
  ["MERGE_HEAD", "REBASE_HEAD", "CHERRY_PICK_HEAD"].some((ref) =>
    Boolean(git(["rev-parse", "--verify", "--quiet", ref], { soft: true }))
  );

/** Has the working tree's db.json moved away from the commit it came from? */
const isDirty = () => {
  const status = git(["status", "--porcelain", "--", "db.json"], { soft: true });
  return Boolean(status && status.trim());
};

/**
 * `npm run pull` — pull with a live database in the working tree.
 *
 * THE PROBLEM THE MERGE DRIVER CANNOT REACH. A merge driver only runs once git
 * has begun a merge. But db.json is rewritten by the running app, so the
 * working tree copy is nearly always modified, and git refuses to START:
 *
 *     error: Your local changes to the following files would be overwritten
 *     by merge: db.json
 *     Please commit your changes or stash them before you merge. Aborting
 *
 * Every pull, on every machine that has ever placed an order. Committing the
 * live data to pull is not an answer (it is not source), and stashing it means
 * popping the stash straight back into the line conflict.
 *
 * So: set the live copy aside, let git have a clean tree to move, then fold the
 * live edits back in AS DATA with the same three-way merge the driver uses —
 * ancestor is the commit the live edits were made on top of, "ours" is the live
 * file, "theirs" is what the pull brought in. The local orders survive, the
 * incoming changes arrive, and db.json is left modified in the working tree
 * exactly as it was before: live data, uncommitted.
 */
const pull = (passthrough, prefer) => {
  if (!git(["rev-parse", "--git-dir"], { soft: true })) {
    throw new Error("this is not a git repository, so there is nothing to pull.");
  }
  if (isUnmerged()) {
    throw new Error(
      "git is already holding an unresolved merge of db.json.\n" +
        "  Settle that one first with `npm run db:resolve`, then\n" +
        "  `git add db.json && git commit` — and pull again after."
    );
  }

  // Not ROOT/.git: in a worktree or a submodule that is a FILE pointing
  // elsewhere, and the backup has to land in the directory git actually uses.
  const backup = path.join(git(["rev-parse", "--absolute-git-dir"]).trim(), "db.json.before-pull");
  const shown = path.relative(ROOT, backup);

  if (!isDirty()) {
    // Nothing live to protect — this is just a pull.
    try {
      git(["pull", ...passthrough], { inherit: true });
    } catch {
      return 1;
    }
    console.log("\n  db.json had no local changes to fold back in.\n");
    return 0;
  }

  const headBefore = git(["rev-parse", "HEAD"]).trim();
  const live = readJson(DB_PATH, "live");
  // The commit the live edits sit on top of, and so the ancestor of both the
  // live file and whatever the pull is about to bring in.
  const base = parseJson(git(["show", "HEAD:db.json"]), "ancestor", "HEAD:db.json");

  // On disk, not just in memory: if anything below fails, or this process is
  // killed outright, the afternoon of clicking is still sitting there.
  fs.copyFileSync(DB_PATH, backup);
  git(["checkout", "HEAD", "--", "db.json"]);
  console.log(`\n  db.json was modified; set aside (${shown}) so git has a clean tree to move.\n`);

  let pulled = false;
  try {
    git(["pull", ...passthrough], { inherit: true });
    pulled = true;
  } catch {
    // git has printed its own diagnosis. What is ours to report is the live data.
  }

  if (!pulled && isUnmerged()) {
    // git is holding db.json itself. Overwriting that would only bury the merge
    // it has started, so leave every side of it alone and say where the data is.
    console.error(
      `\n  The pull stopped on db.json itself, so it has been left exactly as git\n` +
        `  left it. YOUR LIVE DATA IS SAFE at\n\n    ${shown}\n\n` +
        `  Settle the merge with \`npm run db:resolve\`, then fold that file back in.\n` +
        `  It is not deleted.\n`
    );
    return 1;
  }

  const wentNowhere = git(["rev-parse", "HEAD"]).trim() === headBefore && !midOperation();

  if (!pulled && wentNowhere) {
    // The pull never started. Put the live database back: the working tree is
    // then byte for byte what it was before this command ran.
    fs.copyFileSync(backup, DB_PATH);
    fs.unlinkSync(backup);
    console.error("\n  The pull failed, so db.json has been put back untouched.\n");
    return 1;
  }

  // Fold the live edits back onto whatever db.json now holds: what the pull
  // brought in, or — if it stopped on some OTHER file — git's merge of it. The
  // index keeps git's own version either way, so a merge commit finished from
  // here still carries data nobody has been clicking on.
  const incoming = readJson(DB_PATH, "incoming");
  const showSample = readShowSampleReviews();
  const ctx = { prefer, conflicts: [], notes: [], recomputesAggregates: showSample !== null };
  const merged = mergeObject(base, live, incoming, "", ctx);
  const rerated = showSample === null ? [] : reconcileReviewAggregates(merged, showSample);
  writeDb(DB_PATH, merged);
  fs.unlinkSync(backup);

  report(merged, ctx, rerated, showSample, prefer, "db.json pulled and merged structurally.");
  console.log("  Your local db.json data was folded back in. It is modified in the working");
  console.log("  tree, which is where live data belongs.\n");

  if (!pulled) {
    console.error("  The pull itself did NOT finish — git stopped on something else above.\n");
    return 1;
  }
  return 0;
};

// ---- Reporting --------------------------------------------------------------

/**
 * What the merge did, in the one shape every mode prints it: the size of the
 * result, the aggregates that were recomputed rather than chosen, the values
 * kept against a delete, and — the only part a person has to read — the fields
 * both sides changed to different values.
 */
const report = (merged, ctx, rerated, showSample, prefer, headline) => {
  const collections = Object.entries(merged).filter(([, value]) => Array.isArray(value));
  const records = collections.reduce((total, [, value]) => total + value.length, 0);

  console.log(`\n  ${headline}`);
  console.log(`  ${collections.length} collections, ${records} records.\n`);

  if (showSample === null) {
    console.log("  ! Could not read brand.flags.showSampleReviews from src/config/brand.js, so");
    console.log("    products[].rating / .totalReviews were merged as ordinary fields rather");
    console.log("    than recomputed. Check them by hand.\n");
  } else if (rerated.length) {
    console.log(`  Review aggregates recomputed from the merged reviews (${rerated.length}):`);
    for (const row of rerated) console.log(`    #${row.id} ${row.name} — ${row.was} -> ${row.now}`);
    console.log("");
  }

  if (ctx.notes.length) {
    console.log(`  Kept ${ctx.notes.length} value(s) one side deleted and the other edited:`);
    for (const note of ctx.notes) console.log(`    ${note.where} — kept the ${note.from} edit`);
    console.log("");
  }

  if (ctx.conflicts.length) {
    console.log(`  ${ctx.conflicts.length} field(s) changed on BOTH sides. Settled on --prefer=${prefer}; check these:`);
    for (const conflict of ctx.conflicts) {
      console.log(`    ${conflict.where}`);
      console.log(`      ours   ${brief(conflict.ours)}`);
      console.log(`      theirs ${brief(conflict.theirs)}`);
    }
    console.log("");
  } else {
    console.log("  No field was changed on both sides — nothing had to be chosen.\n");
  }
};

// ---- Entry point ------------------------------------------------------------

const HELP = `
  merge-db-json.js — structural three-way merge for db.json

    npm run pull                    pull, though db.json is live and modified
    npm run db:resolve              resolve the conflict git is holding now
    npm run setup:git               re-arm the driver (npm install already does)

    node scripts/merge-db-json.js [--prefer=theirs|ours] [--dry-run]
    node scripts/merge-db-json.js --pull [-- <git pull args>]
    node scripts/merge-db-json.js --driver <ancestor> <ours> <theirs>
    node scripts/merge-db-json.js --install [--quiet]

  --prefer  which side wins a field BOTH sides changed to different values.
            Default "theirs" — the branch being merged in, i.e. the shared one.
  --dry-run report what would happen; write nothing.
`;

const main = () => {
  const argv = process.argv.slice(2);

  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(HELP);
    return 0;
  }
  if (argv.includes("--install")) {
    return install({ quiet: argv.includes("--quiet") });
  }

  const prefer = (argv.find((arg) => arg.startsWith("--prefer=")) || "--prefer=theirs").split("=")[1];
  if (prefer !== "ours" && prefer !== "theirs") {
    console.error(`  --prefer takes "ours" or "theirs", not ${JSON.stringify(prefer)}.`);
    return 2;
  }
  if (argv.includes("--pull")) {
    // npm eats the separator it is given, so the `pull` script supplies its own:
    // `npm run pull -- origin main` arrives here as `--pull -- origin main`. What
    // follows is git’s, minus any of our own flags npm appended past it.
    const separator = argv.indexOf("--");
    const passthrough = (separator === -1 ? [] : argv.slice(separator + 1)).filter(
      (arg) => arg !== "--pull" && !arg.startsWith("--prefer=")
    );
    return pull(passthrough, prefer);
  }

  const dryRun = argv.includes("--dry-run");
  const driverIndex = argv.indexOf("--driver");
  const asDriver = driverIndex !== -1;

  let base;
  let ours;
  let theirs;
  let out;

  if (asDriver) {
    const [ancestorFile, oursFile, theirsFile] = argv.slice(driverIndex + 1, driverIndex + 4);
    if (!ancestorFile || !oursFile || !theirsFile) {
      console.error("  --driver needs three paths: <ancestor> <ours> <theirs>.");
      return 2;
    }
    base = readJson(ancestorFile, "ancestor");
    ours = readJson(oursFile, "ours");
    theirs = readJson(theirsFile, "theirs");
    out = oursFile; // git takes the result from %A
  } else {
    base = readStage(1, "ancestor");
    ours = readStage(2, "ours");
    theirs = readStage(3, "theirs");
    out = DB_PATH;
  }

  // Read the flag BEFORE merging: whether the aggregates can be recomputed
  // decides whether a disagreement about one is a conflict or a non-event.
  const showSample = readShowSampleReviews();

  const ctx = { prefer, conflicts: [], notes: [], recomputesAggregates: showSample !== null };
  const merged = mergeObject(base, ours, theirs, "", ctx);

  const rerated = showSample === null ? [] : reconcileReviewAggregates(merged, showSample);

  if (!dryRun) writeDb(out, merged);

  // ---- Report ---------------------------------------------------------------

  report(merged, ctx, rerated, showSample, prefer, `db.json merged structurally${dryRun ? " (dry run — nothing written)" : ""}.`);

  if (!asDriver && !dryRun) {
    console.log("  db.json is written and valid. Finish the merge with:\n");
    console.log("    git add db.json && git commit\n");
  }

  // In driver mode a real conflict exits non-zero so git still marks the path
  // for a human. The file it leaves behind is merged, valid and marker-free.
  return asDriver && ctx.conflicts.length ? 1 : 0;
};

try {
  process.exit(main());
} catch (error) {
  console.error(`\n  db.json merge failed: ${error.message}\n`);
  process.exit(2);
}
