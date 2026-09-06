import React from "react";

// =============================================================================
// CONTENT BLOCKS  —  markdown-lite for admin-authored copy
// =============================================================================
//
// Site content (About, Why LAMIKAA, policies, FAQ answers, product chapters) is
// edited as PLAIN TEXT in the admin and stored as plain text in the API. This
// module is the whole rendering pipeline for it, and it is deliberately tiny:
//
//   parseBlocks(text)   text  -> [{ type, text?, items?, title? }]   (pure, testable)
//   renderInline(text)  text  -> React nodes for **bold** and [label](href)
//
// NO HTML EVER CROSSES THE BOUNDARY. Neither this file nor ui/ContentBlocks.js
// injects raw markup — React's escape hatch for it appears in neither, which is
// what the zero-result grep in the Prompt 05 verification checks — and there is
// no markdown library to add. A store owner typing into an admin textarea is
// the untrusted input here, and the only way to be certain a pasted `<script>`
// cannot execute is for markup never to be a thing this code can produce.
// Everything below emits React elements.
//
// THE GRAMMAR (all of it — anything else is a paragraph):
//
//   ## Heading            h2
//   ### Heading           h3
//   Plain lines           paragraph; consecutive lines join, a blank line ends it
//   - item                unordered list (consecutive `- ` lines)
//   1. item               ordered list (consecutive `N. ` lines)
//   > quoted              blockquote; consecutive `> ` lines join
//   ---                   horizontal rule
//   ::callout Title       callout, closed by a line that is exactly `::`;
//   …                     its body is paragraphs
//   ::
//   ::steps               numbered value-chain stepper, closed by `::`;
//   - Sow the seed        one step per line (a `- ` or `N. ` prefix is optional)
//   ::
//
//   **bold**              inline, anywhere
//   [label](href)         inline; href MUST start with / # mailto: tel: https://
//
// UNSAFE LINKS RENDER AS THEIR OWN SOURCE TEXT. `[Tap](javascript:…)` prints
// literally as `[Tap](javascript:…)` rather than silently becoming an unlinked
// word: the author sees the mistake in the admin preview instead of shipping a
// link that quietly stopped working. `http://` is excluded from the safe list
// on purpose — a mixed-content link on an https storefront is broken anyway.
// =============================================================================

const SAFE_HREF = /^(\/|#|mailto:|tel:|https:\/\/)/;
const LINK_RE = /\[([^\]\n]+)\]\(([^)\s]*)\)/g;
const BOLD_RE = /\*\*([^*\n]+)\*\*/g;

const ORDERED_ITEM = /^\d+[.)]\s+/;
const UNORDERED_ITEM = /^[-*]\s+/;

// ---- Inline ----------------------------------------------------------------

/** `**bold**` -> <strong>. Runs inside link labels too, hence the key prefix. */
const renderBold = (text, keyPrefix) => {
  const nodes = [];
  let cursor = 0;
  let n = 0;
  BOLD_RE.lastIndex = 0;
  let match = BOLD_RE.exec(text);
  while (match) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    nodes.push(<strong key={`${keyPrefix}-b${n}`}>{match[1]}</strong>);
    cursor = match.index + match[0].length;
    n += 1;
    match = BOLD_RE.exec(text);
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
};

/**
 * Inline markup as React nodes: `**bold**` and `[label](href)`.
 *
 * @param {string} text
 * @param {string} [keyPrefix] disambiguates keys when several runs share a parent
 * @returns {Array<React.ReactNode>|null}
 */
export const renderInline = (text, keyPrefix = "i") => {
  if (typeof text !== "string" || text === "") return null;

  const nodes = [];
  let cursor = 0;
  let n = 0;
  LINK_RE.lastIndex = 0;
  let match = LINK_RE.exec(text);

  while (match) {
    const [raw, label, href] = match;
    if (match.index > cursor) {
      nodes.push(...renderBold(text.slice(cursor, match.index), `${keyPrefix}-${n}`));
    }
    if (SAFE_HREF.test(href)) {
      nodes.push(
        <a
          key={`${keyPrefix}-a${n}`}
          href={href}
          // Off-site links leak the reader's current page in the referer
          // header otherwise. No `target`: a link that opens a window the
          // visitor did not ask for is a surprise, not a feature.
          {...(href.startsWith("https://") ? { rel: "noreferrer" } : {})}
        >
          {renderBold(label, `${keyPrefix}-a${n}`)}
        </a>
      );
    } else {
      // Not a link we will render. The source text stands in for it.
      nodes.push(raw);
    }
    cursor = match.index + raw.length;
    n += 1;
    match = LINK_RE.exec(text);
  }

  if (cursor < text.length) {
    nodes.push(...renderBold(text.slice(cursor), `${keyPrefix}-${n}`));
  }
  return nodes;
};

// ---- Blocks ----------------------------------------------------------------

/** Split a fenced body into paragraphs on blank lines, joining wrapped lines. */
const paragraphsOf = (lines) => {
  const out = [];
  let buffer = [];
  const flush = () => {
    if (buffer.length) out.push(buffer.join(" ").trim());
    buffer = [];
  };
  lines.forEach((line) => {
    if (line.trim() === "") flush();
    else buffer.push(line.trim());
  });
  flush();
  return out.filter(Boolean);
};

/** One step per non-empty line; a `- ` or `1. ` prefix is optional sugar. */
const stepsOf = (lines) =>
  lines
    .map((line) => line.trim().replace(UNORDERED_ITEM, "").replace(ORDERED_ITEM, "").trim())
    .filter(Boolean);

/**
 * Parse markdown-lite into a flat block list.
 *
 * The scanner is a single pass with one open block at a time — there is no
 * nesting in this grammar beyond the two `::` fences, and refusing to add any
 * is what keeps the renderer a `switch` rather than a tree walk.
 *
 * @param {string} text
 * @returns {Array<{type: string, text?: string, items?: string[], title?: string}>}
 */
export const parseBlocks = (text) => {
  if (typeof text !== "string" || text.trim() === "") return [];

  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];

  // The block currently being accumulated: paragraph lines, list items or
  // quote lines. `null` between blocks.
  let open = null;
  const closeOpen = () => {
    if (!open) return;
    if (open.type === "p" || open.type === "quote") {
      const joined = open.lines.join(" ").trim();
      if (joined) blocks.push({ type: open.type, text: joined });
    } else if (open.items.length) {
      blocks.push({ type: open.type, items: open.items });
    }
    open = null;
  };

  // Fence state for `::callout` / `::steps`.
  let fence = null;

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();

    if (fence) {
      if (line === "::") {
        blocks.push(
          fence.type === "callout"
            ? { type: "callout", title: fence.title, items: paragraphsOf(fence.lines) }
            : { type: "steps", items: stepsOf(fence.lines) }
        );
        fence = null;
      } else {
        fence.lines.push(raw);
      }
      continue;
    }

    // ---- fence openers
    if (line === "::steps") {
      closeOpen();
      fence = { type: "steps", lines: [] };
      continue;
    }
    if (line === "::callout" || line.startsWith("::callout ")) {
      closeOpen();
      fence = { type: "callout", title: line.slice("::callout".length).trim(), lines: [] };
      continue;
    }

    // ---- blank line ends whatever is open
    if (line === "") {
      closeOpen();
      continue;
    }

    // ---- rule (three or more dashes on their own)
    if (/^-{3,}$/.test(line)) {
      closeOpen();
      blocks.push({ type: "hr" });
      continue;
    }

    // ---- headings (### before ##, or "###" matches "##" first)
    if (line.startsWith("### ")) {
      closeOpen();
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith("## ")) {
      closeOpen();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      continue;
    }

    // ---- quote: consecutive `> ` lines are ONE quote
    if (line.startsWith(">")) {
      const body = line.replace(/^>\s?/, "");
      if (open?.type !== "quote") {
        closeOpen();
        open = { type: "quote", lines: [] };
      }
      open.lines.push(body);
      continue;
    }

    // ---- lists
    if (UNORDERED_ITEM.test(line)) {
      if (open?.type !== "ul") {
        closeOpen();
        open = { type: "ul", items: [] };
      }
      open.items.push(line.replace(UNORDERED_ITEM, "").trim());
      continue;
    }
    if (ORDERED_ITEM.test(line)) {
      if (open?.type !== "ol") {
        closeOpen();
        open = { type: "ol", items: [] };
      }
      open.items.push(line.replace(ORDERED_ITEM, "").trim());
      continue;
    }

    // ---- anything else is prose
    if (open?.type !== "p") {
      closeOpen();
      open = { type: "p", lines: [] };
    }
    open.lines.push(line);
  }

  // A fence left unclosed at the end of the text still renders — an author who
  // forgot the trailing `::` loses nothing but the closing marker.
  if (fence) {
    blocks.push(
      fence.type === "callout"
        ? { type: "callout", title: fence.title, items: paragraphsOf(fence.lines) }
        : { type: "steps", items: stepsOf(fence.lines) }
    );
  }
  closeOpen();

  return blocks;
};

const contentBlocks = { parseBlocks, renderInline };

export default contentBlocks;
