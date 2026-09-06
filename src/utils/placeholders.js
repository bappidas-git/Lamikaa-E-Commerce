// =============================================================================
// Placeholders — the `{{TOKEN}}` convention and how it renders
// =============================================================================
// LAMIKAA is a pre-launch brand: the customer-care email, the phone number, the
// social profiles, the GSTIN and the free-shipping threshold do not exist yet.
// The rebuild's rule is that an unknown fact is NEVER invented and NEVER left
// blank in the data — it is carried as a literal `{{UPPER_SNAKE}}` token
// (inventoried in prompts/_reference/PLACEHOLDERS.md) that the UI recognises
// and hides.
//
// Three shapes of "hide", one helper each:
//
//   resolveOrNull()             a whole field. Contact rows, social URLs, the
//                               GSTIN line: `null` means "do not render this
//                               row", which is different from an empty string
//                               the owner typed on purpose.
//   stripPlaceholderSentences() one sentence inside a paragraph. A policy or FAQ
//                               answer keeps every sentence whose facts are
//                               known and silently loses the one that quotes a
//                               token.
//   placeholderToken()          the token's name, for the admin's
//                               "Placeholder — owner to supply" chip.
//
// Pure functions, no React, no DOM — the unit tests added in Prompt 05 import
// this module directly.
// =============================================================================

// One token. Digits are allowed because a few inventoried names carry them
// (e.g. an eventual {{ADDRESS_2}}); lower case is not, so ordinary prose in
// braces is never mistaken for a placeholder.
export const PLACEHOLDER_RE = /\{\{[A-Z0-9_]+\}\}/;

// Deliberately NOT a /g regex shared across calls: a global regex carries
// `lastIndex` between `.test()` calls and would return false every other time.
const TOKEN_NAME_RE = /\{\{([A-Z0-9_]+)\}\}/;

/** True when `value` is a string containing at least one `{{TOKEN}}`. */
export const isPlaceholder = (value) =>
  typeof value === "string" && PLACEHOLDER_RE.test(value);

/**
 * The value, or `null` when there is nothing publishable: a non-string, a blank
 * (or whitespace-only) string, or anything still carrying a token.
 *
 * Callers render with `{resolved && <row/>}` — so an unresolved field costs no
 * label, no hairline and no empty <dd>.
 */
export const resolveOrNull = (value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (PLACEHOLDER_RE.test(trimmed)) return null;
  return trimmed;
};

/**
 * The token's NAME without the braces (`"{{GSTIN}}"` → `"GSTIN"`), or `null`
 * when the value carries no token. The first token wins if a string has several.
 */
export const placeholderToken = (value) => {
  if (typeof value !== "string") return null;
  const match = value.match(TOKEN_NAME_RE);
  return match ? match[1] : null;
};

// Sentences end at a "." that is followed by a space, a newline, or the end of
// the string. Splitting this way (rather than on /[.!?]/) keeps decimals,
// "Co. Ltd." style abbreviations and URLs intact, which matters because the
// legal note quotes a company name full of them.
const splitSentences = (text) => {
  const out = [];
  let start = 0;
  let i = 0;

  while (i < text.length) {
    const isBoundary =
      text[i] === "." &&
      (i + 1 >= text.length || text[i + 1] === " " || text[i + 1] === "\n");

    if (!isBoundary) {
      i += 1;
      continue;
    }

    // Swallow the whole whitespace run into the separator, so dropping a
    // sentence cannot leave a double space or an orphaned blank line behind.
    let j = i + 1;
    while (j < text.length && (text[j] === " " || text[j] === "\n")) j += 1;

    out.push({ body: text.slice(start, i + 1), sep: text.slice(i + 1, j) });
    start = j;
    i = j;
  }

  // A trailing fragment with no full stop (a heading, a list item) is a
  // sentence too, and is dropped on the same rule as the rest.
  if (start < text.length) out.push({ body: text.slice(start), sep: "" });

  return out;
};

/**
 * Drop every sentence that quotes a `{{TOKEN}}`, keep the rest.
 *
 * Used by policy copy and FAQ answers, where one unknown fact must not take a
 * whole paragraph off the page: "You can request a return within {{X}} days.
 * Opened skincare cannot be returned." keeps its second sentence.
 */
export const stripPlaceholderSentences = (text) => {
  if (typeof text !== "string") return "";
  if (!PLACEHOLDER_RE.test(text)) return text;

  const kept = splitSentences(text).filter((s) => !PLACEHOLDER_RE.test(s.body));
  if (!kept.length) return "";

  return kept
    .map((s, index) =>
      index === kept.length - 1 ? s.body : `${s.body}${s.sep || " "}`
    )
    .join("")
    .trim();
};

const placeholders = {
  PLACEHOLDER_RE,
  isPlaceholder,
  resolveOrNull,
  placeholderToken,
  stripPlaceholderSentences,
};
export default placeholders;
