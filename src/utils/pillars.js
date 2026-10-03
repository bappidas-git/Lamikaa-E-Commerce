// =============================================================================
// pillars — the brand pillars as data: where they come from, which glyph each
// one wears, and how many to a row
// =============================================================================
//
// Admin → Content → Why LAMIKAA edits `siteContent.whyLamikaa.pillars`, and
// that list is what the storefront draws: the home band, /about, /why-lamikaa
// and the /contact rail all read it through `pillarsFrom()`. It used to be the
// other way round — every surface read `brand.pillars` from the config and the
// CMS list was edited into a record nothing displayed, so a pillar the owner
// added (or reworded, reordered or removed) never reached the site.
//
// `brand.pillars` is still here, as the FALLBACK: it is what the site draws
// when the record cannot be read or predates the list, so the pillars are never
// missing from a page just because the CMS did not answer. An EMPTY list is
// different — an owner who removes every pillar has said "no pillars", and the
// site says nothing rather than putting back four the owner took away.
//
// Pure functions, no React: the storefront component and the admin editor both
// import this module, and the admin must not pull the storefront's UI kit into
// its chunk to learn which glyph a pillar wears.
// =============================================================================
import brand from "../config/brand";

// ─── Glyphs ──────────────────────────────────────────────────────────────────

/** The glyph each of the four brand pillars wears, keyed by its `key`. */
export const PILLAR_ICONS = {
  "indigenous-knowledge": "mdi:leaf",
  "modern-science": "mdi:flask-outline",
  "farmer-ownership": "mdi:account-group-outline",
  "responsible-beauty": "mdi:earth",
};

// The same four, in the order the brief lists them — the fallback for a pillar
// whose key the owner has renamed, so a config edit degrades to the right icon
// in the right slot instead of to the generic one. A slot glyph another pillar
// is already wearing is NOT handed out a second time (see `pillarIcons`).
const ICON_ORDER = [
  "mdi:leaf",
  "mdi:flask-outline",
  "mdi:account-group-outline",
  "mdi:earth",
];

// A pillar this file has never seen, with no glyph chosen for it, gets the
// neutral mark the trust strip uses for the same case rather than a guess at
// its meaning. The admin's picker is how it gets a meaningful one.
export const FALLBACK_PILLAR_ICON = "mdi:star-four-points-outline";

/**
 * The glyphs Admin → Content offers for a pillar. Every one is a Material
 * Design Icons name the storefront already loads through Iconify; the first
 * four are the brand pillars' own.
 */
export const PILLAR_ICON_CHOICES = [
  { icon: "mdi:leaf", label: "Leaf" },
  { icon: "mdi:flask-outline", label: "Science" },
  { icon: "mdi:account-group-outline", label: "Community" },
  { icon: "mdi:earth", label: "Earth" },
  { icon: "mdi:sprout-outline", label: "Sprout" },
  { icon: "mdi:flower-outline", label: "Flower" },
  { icon: "mdi:rice", label: "Rice" },
  { icon: "mdi:barley", label: "Grain" },
  { icon: "mdi:tree-outline", label: "Tree" },
  { icon: "mdi:water-outline", label: "Water" },
  { icon: "mdi:spa-outline", label: "Wellbeing" },
  { icon: "mdi:hand-heart-outline", label: "Care" },
  { icon: "mdi:heart-outline", label: "Heart" },
  { icon: "mdi:handshake-outline", label: "Partnership" },
  { icon: "mdi:home-heart", label: "Family" },
  { icon: "mdi:school-outline", label: "Education" },
  { icon: "mdi:recycle", label: "Recycling" },
  { icon: "mdi:microscope", label: "Research" },
  { icon: "mdi:shield-check-outline", label: "Quality" },
  { icon: "mdi:check-decagram-outline", label: "Certified" },
  { icon: "mdi:scale-balance", label: "Fairness" },
  { icon: "mdi:lightbulb-on-outline", label: "Innovation" },
  { icon: FALLBACK_PILLAR_ICON, label: "Star" },
];

// An Iconify name: `prefix:name`, lower-case words joined by hyphens. Anything
// else in the field (a typo, a URL, markup) is ignored rather than handed to
// the icon loader.
const ICON_NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** True for a usable Iconify name such as `"mdi:leaf"`. */
export const isIconName = (value) =>
  typeof value === "string" && ICON_NAME_RE.test(value.trim());

const clean = (value) => (typeof value === "string" ? value.trim() : "");

/** The glyph a pillar asks for itself: its chosen icon, else its key's. */
const ownIcon = (pillar) =>
  isIconName(pillar?.icon) ? pillar.icon.trim() : PILLAR_ICONS[clean(pillar?.key)] || "";

/**
 * The glyph for one pillar: the icon chosen in the admin, else the one its key
 * maps to, else its slot's (unless `taken` says another pillar already wears
 * it), else the neutral mark.
 */
export const pillarIcon = (pillar, index, taken) => {
  const own = ownIcon(pillar);
  if (own) return own;
  const slot = ICON_ORDER[index];
  const isTaken = taken && typeof taken.has === "function" && taken.has(slot);
  return slot && !isTaken ? slot : FALLBACK_PILLAR_ICON;
};

/**
 * Every pillar's glyph, decided over the whole list so a slot glyph is never
 * handed to a second pillar: a new pillar dragged to the top must not wear the
 * leaf "Indigenous Knowledge" is already wearing two cards along.
 */
export const pillarIcons = (pillars) => {
  const list = Array.isArray(pillars) ? pillars : [];
  const taken = new Set(list.map(ownIcon).filter(Boolean));
  return list.map((pillar, index) => pillarIcon(pillar, index, taken));
};

/**
 * What each row would wear with NO icon of its own — the "Automatic" choice the
 * admin's picker previews, given everything else in the list.
 */
export const automaticPillarIcons = (pillars) => {
  const list = Array.isArray(pillars) ? pillars : [];
  return list.map(
    (_, index) =>
      pillarIcons(list.map((row, i) => (i === index ? { ...row, icon: "" } : row)))[index]
  );
};

// ─── The list ────────────────────────────────────────────────────────────────

const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * The rows as the storefront draws them: strings trimmed, a row with no title
 * dropped (a pillar with no title is not a thinner pillar, it is a hole in the
 * row), an unusable icon name cleared, and every row given an `id` no other
 * row shares — the owner's key where there is one, so two rows the owner keyed
 * alike (a copied row) cannot collide as React keys.
 */
export const normalizePillars = (list) => {
  const seen = new Set();
  return (Array.isArray(list) ? list : []).reduce((rows, row) => {
    if (!row || typeof row !== "object") return rows;
    const title = clean(row.title);
    if (!title) return rows;

    const key = clean(row.key);
    const base = key || slug(title) || `pillar-${rows.length + 1}`;
    let id = base;
    for (let n = 2; seen.has(id); n += 1) id = `${base}-${n}`;
    seen.add(id);

    rows.push({
      id,
      key,
      title,
      text: clean(row.text),
      icon: isIconName(row.icon) ? row.icon.trim() : "",
    });
    return rows;
  }, []);
};

/**
 * The pillars a surface should draw, from the `whyLamikaa` content block.
 *
 *   block.pillars is a list   the owner's list, as published (an emptied list
 *                             stays empty — see the header)
 *   anything else             `brand.pillars`: the record is still in flight,
 *                             could not be read, or predates the list
 *
 * A caller that is still waiting for the record passes `loading` to <Pillars>
 * as well, which draws skeleton cards in place of these.
 */
export const pillarsFrom = (block) =>
  normalizePillars(
    block && typeof block === "object" && Array.isArray(block.pillars)
      ? block.pillars
      : brand.pillars
  );

// ─── Rows and columns ────────────────────────────────────────────────────────

/** The widest row each breakpoint allows: tablet, laptop, desktop. */
export const PILLAR_ROW_MAX = { md: 2, lg: 4, xl: 5 };

/**
 * Cards to a row, for `count` cards in a row that fits at most `max`.
 *
 * BALANCED, so the last row is never a lone card under a full one: five on a
 * laptop are 3 + 2, not 4 + 1; seven are 4 + 3. And never thinner than a third
 * of the row where the row has room for three: one or two pillars sit as cards
 * in the middle of the band rather than as banners across the whole of it.
 */
export const pillarColumns = (count, max) => {
  if (!(count > 0) || !(max > 1)) return 1;
  const rows = Math.ceil(count / max);
  const balanced = Math.ceil(count / rows);
  return Math.max(balanced, Math.min(max, 3));
};

const BREAKPOINTS = Object.keys(PILLAR_ROW_MAX);

/**
 * The grid each breakpoint draws for `count` cards, as CSS custom properties.
 *
 * The grid has TWO tracks per card, so a short last row can start half a card
 * in and sit centred under the full one: `--pl-tracks-*` goes on the list, and
 * the first card of a short last row carries `--pl-start-*`, the grid line it
 * starts on. Every other card is auto-placed after it.
 *
 * @param {number} count       cards in the grid
 * @param {number} [maxColumns] a ceiling of the caller's own (the /contact rail
 *                             is one column at every width)
 * @returns {{ list: object, items: object[] }} inline styles
 */
export const pillarLayout = (count, maxColumns = Infinity) => {
  const list = {};
  const items = Array.from({ length: Math.max(0, count) }, () => ({}));

  BREAKPOINTS.forEach((bp) => {
    const columns = pillarColumns(count, Math.min(PILLAR_ROW_MAX[bp], maxColumns));
    list[`--pl-tracks-${bp}`] = columns * 2;
    const short = count % columns;
    if (short > 0) items[count - short][`--pl-start-${bp}`] = columns - short + 1;
  });

  return { list, items };
};

// ─── Counting them in words ──────────────────────────────────────────────────

const COUNT_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

const titleCase = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/** "Four pillars", "Five pillars" — the heading the /about section wears. */
export const pillarsTitle = (count) => {
  if (count === 1) return "Our pillar";
  const word = COUNT_WORDS[count];
  return count > 1 && word ? `${titleCase(word)} pillars` : "Our pillars";
};

const STATED_COUNT_RE = new RegExp(`\\b(\\d+|${COUNT_WORDS.join("|")})\\s+pillars?\\b`, "i");

/**
 * The count a sentence states — "built on four pillars" is 4 — or `null` when
 * the copy names no count. Admin → Content compares it with the list, because
 * the sentence is the owner's copy and only the owner can correct it.
 */
export const statedPillarCount = (text) => {
  if (typeof text !== "string") return null;
  const match = text.match(STATED_COUNT_RE);
  if (!match) return null;
  const word = match[1].toLowerCase();
  return /^\d+$/.test(word) ? Number(word) : COUNT_WORDS.indexOf(word);
};

/** The count as the copy would write it: "four", "five", or "13". */
export const countWord = (count) => COUNT_WORDS[count] || String(count);
