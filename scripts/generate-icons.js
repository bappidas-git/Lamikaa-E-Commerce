#!/usr/bin/env node
/* eslint-disable no-console */
// =============================================================================
// generate-icons.js — public/'s seven favicon and PWA icon files, from the mark
// =============================================================================
//
//   npm run icons
//
// WHAT IT WRITES. Every icon file public/index.html and public/manifest.json
// reference, all of them derived from ONE source — `brand.iconUrl`, the square
// LAMIKAA mark — through Cloudinary. Nothing here is hand-exported, so the tab
// favicon, the iOS home-screen icon, the Android launcher icons and the
// maskable icon can never drift apart or drift from the wordmark in the
// masthead: change the mark in src/config/brand.js, run this, commit the seven
// files.
//
// WHY THE CHAIN IS WHAT IT IS.
//
//   e_trim            The master carries a wide transparent bleed — 1254x1254
//                     around 1024x1126 of ink, sitting low in the frame. Resized
//                     raw, a 16px favicon would spend a quarter of its pixels on
//                     nothing and sit visibly off-centre in the tab strip.
//
//   c_lpad,w,h        Squares the trimmed art up and gives it back a MEASURED
//                     margin, rather than the arbitrary one the export had.
//                     `lpad` never upscales, so the art lands at its own size
//                     inside the frame and the ratio of the two is the margin:
//                     1126 of ink in 1200 is the ~94% fill the transparent icons
//                     want, and 1126 in 1480 is the ~76% the maskable one needs
//                     to survive Android's mask (the safe zone is the middle
//                     80%, and art that bleeds past it comes back with its
//                     leaves clipped).
//
//   b_transparent     NOT `b_auto`. The mark is gold line art drawn for no
//                     ground at all; padding it on a sampled colour would print
//                     an opaque plate behind every icon. The maskable one is the
//                     single exception — a mask has to have something to cut, so
//                     it takes the chrome's own espresso ground, which is also
//                     `theme_color`/`background_color` in manifest.json and
//                     `<meta name="theme-color">` in index.html. Keep the three
//                     in step: an installed PWA paints the icon's ground, the
//                     splash and the status bar edge to edge.
//
//   f_ico             favicon.ico is a real ICO container (one 48x48 entry),
//                     emitted by Cloudinary rather than assembled here.
//
// IT VERIFIES WHAT IT WROTE. Every response is parsed back out of the bytes —
// PNG dimensions from the IHDR chunk, ICO dimensions from the directory entry —
// and a file whose size does not match what was asked for fails the run rather
// than landing in public/. A silently wrong icon is not something a build step
// or a test would ever catch.
//
// NO DEPENDENCIES, BY THE PROGRAMME'S RULE (00_INDEX.md §2). Node's own fs,
// path and global fetch, and `src/config/brand.js` read as TEXT rather than
// imported: brand.js is an ES module that pulls in `utils/cloudinary`, and this
// script runs under plain `node`. The one URL it needs is the icon's, and the
// regex below is anchored to the exported constant so a rename fails loudly
// instead of quietly generating from a stale literal.
// =============================================================================

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");
const BRAND_FILE = path.join(ROOT, "src", "config", "brand.js");

// The espresso chrome ground. Mirrors --sf-color-bg inside `.sf-on-dark`,
// `theme_color` in manifest.json and `<meta name="theme-color">` in index.html.
const CHROME_GROUND = "17120F";

// The trimmed art's own pixels are 1024x1126. These two frames are what turn
// that into a margin — see the note above.
const TRANSPARENT_FRAME = 1200; // 1126/1200 ≈ 94% fill
const MASKABLE_FRAME = 1480; //    1126/1480 ≈ 76% fill, inside the 80% safe zone

/** `export const ICON_URL = "…";` out of brand.js, without importing it. */
function readIconUrl() {
  const source = fs.readFileSync(BRAND_FILE, "utf8");
  const match = source.match(/export const ICON_URL\s*=\s*"([^"]+)"/);
  if (!match) {
    throw new Error(
      `Could not find "export const ICON_URL" in ${path.relative(ROOT, BRAND_FILE)}. ` +
        "If it was renamed, update the regex in this script — do not hard-code the URL here."
    );
  }
  return match[1];
}

/** Insert a transformation chain immediately after `/upload/`. */
function transform(url, chain) {
  const [origin, rest] = url.split("/upload/");
  if (!rest) throw new Error(`Not a Cloudinary upload URL: ${url}`);
  return `${origin}/upload/${chain}/${rest}`;
}

const pngChain = (size, ground) =>
  ground
    ? `e_trim/c_lpad,w_${MASKABLE_FRAME},h_${MASKABLE_FRAME},b_rgb:${ground}/f_png,q_auto,w_${size}`
    : `e_trim/c_lpad,w_${TRANSPARENT_FRAME},h_${TRANSPARENT_FRAME},b_transparent/f_png,q_auto,w_${size}`;

const icoChain = (size) =>
  `e_trim/c_lpad,w_${TRANSPARENT_FRAME},h_${TRANSPARENT_FRAME},b_transparent/f_ico,w_${size}`;

// Every file public/index.html and public/manifest.json name, in the order they
// are referenced there.
const ICONS = [
  { file: "favicon.ico", size: 48, kind: "ico", chain: icoChain(48) },
  { file: "favicon-16x16.png", size: 16, kind: "png", chain: pngChain(16) },
  { file: "favicon-32x32.png", size: 32, kind: "png", chain: pngChain(32) },
  { file: "apple-touch-icon.png", size: 180, kind: "png", chain: pngChain(180) },
  { file: "android-chrome-192x192.png", size: 192, kind: "png", chain: pngChain(192) },
  { file: "android-chrome-512x512.png", size: 512, kind: "png", chain: pngChain(512) },
  {
    file: "maskable-512x512.png",
    size: 512,
    kind: "png",
    chain: pngChain(512, CHROME_GROUND),
    note: `${MASKABLE_FRAME}px frame on #${CHROME_GROUND}`,
  },
];

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** `{ width, height }` from a PNG's IHDR, which is always the first chunk. */
function readPngSize(buffer) {
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_MAGIC)) {
    throw new Error("response is not a PNG");
  }
  if (buffer.subarray(12, 16).toString("ascii") !== "IHDR") {
    throw new Error("PNG has no IHDR where one must be");
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/** `{ width, height }` from an ICO's single directory entry. 0 means 256. */
function readIcoSize(buffer) {
  if (buffer.length < 22 || buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) {
    throw new Error("response is not an ICO");
  }
  if (buffer.readUInt16LE(4) !== 1) {
    throw new Error(`ICO carries ${buffer.readUInt16LE(4)} images, expected exactly 1`);
  }
  return { width: buffer[6] || 256, height: buffer[7] || 256 };
}

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function main() {
  const iconUrl = readIconUrl();
  console.log(`Source mark: ${iconUrl}\n`);

  if (!fs.existsSync(PUBLIC_DIR)) {
    throw new Error(`No public/ directory at ${PUBLIC_DIR}`);
  }

  const written = [];

  for (const icon of ICONS) {
    const url = transform(iconUrl, icon.chain);
    const bytes = await download(url);

    const { width, height } =
      icon.kind === "ico" ? readIcoSize(bytes) : readPngSize(bytes);

    // A wrong-sized icon is worse than a missing one: it installs, it renders,
    // and nobody notices until it is on somebody's home screen.
    if (width !== icon.size || height !== icon.size) {
      throw new Error(
        `${icon.file}: asked for ${icon.size}x${icon.size}, got ${width}x${height}\n  ${url}`
      );
    }

    fs.writeFileSync(path.join(PUBLIC_DIR, icon.file), bytes);
    written.push({ ...icon, bytes: bytes.length, width, height });

    const label = `${icon.file}`.padEnd(28);
    const dims = `${icon.kind.toUpperCase()} ${width}x${height}`.padEnd(16);
    const size = `${bytes.length.toLocaleString("en-US")} b`.padStart(10);
    console.log(`  ${label}${dims}${size}${icon.note ? `   (${icon.note})` : ""}`);
  }

  console.log(`\n${written.length} icons written to public/.`);
}

main().catch((error) => {
  console.error(`\ngenerate-icons failed: ${error.message}`);
  process.exitCode = 1;
});
