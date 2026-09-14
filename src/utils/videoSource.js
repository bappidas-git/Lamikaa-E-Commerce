// =============================================================================
// VIDEO SOURCE  —  one reading of "a video link", whatever the merchant pasted
// =============================================================================
//
// THE BUG THIS EXISTS TO FIX. `media[]` has always held video rows, and every
// one of them went straight into `<video src>`. That element plays a FILE — an
// .mp4, a .webm, a Cloudinary delivery URL — and a YouTube watch page is not a
// file, it is an HTML document. So a pasted YouTube link decoded as nothing,
// fired `error`, and the gallery showed "Video unavailable" on a link that
// plays perfectly well in a browser tab. Same for Vimeo, Drive and the rest:
// they all publish an EMBED, and an embed is an iframe, not a source.
//
// So a video row now resolves to one of two kinds, and the player branches once:
//
//   kind: "file"   -> <video src>, the hand-rolled chrome, everything as before
//   kind: "embed"  -> the provider's iframe, behind our own poster and badge
//
// ADDING A PROVIDER IS ONE ENTRY in PROVIDERS below — a matcher that returns an
// id, an embed builder, optionally a thumbnail builder and the postMessage that
// pauses it. Nothing outside this file learns a provider's name.
//
// UNKNOWN LINKS STAY FILES. A URL no matcher claims is handed to <video>, which
// is what a Cloudinary delivery, an S3 object or a link this file has never
// heard of actually needs. A genuinely dead link still lands on the player's
// error state — the fallback is the old behaviour, never a blank frame.
//
// NO NETWORK, NO REACT, NO STATE. Pure string work, called inside render and
// inside tests. Thumbnails are URLs a provider serves at a PREDICTABLE address
// (YouTube, Dailymotion, Drive); Vimeo and Loom mint theirs behind an oEmbed
// call, so they report none and the gallery falls back to the product's own
// primary image — which is why `thumbnail` may be "" for a perfectly good row.
// =============================================================================

/** Trim to a string, tolerating the nulls a hand-edited record can hold. */
const clean = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * The `t` / `start` parameter as whole seconds.
 * YouTube writes it three ways — `90`, `90s`, `1m30s` — and all three have to
 * survive a paste from the "Copy link at current time" menu item.
 */
const startSeconds = (raw) => {
  const value = clean(raw);
  if (!value) return 0;
  if (/^\d+$/.test(value)) return Number(value);
  const parts = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!parts || !parts.slice(1).some(Boolean)) return 0;
  const [, h, m, s] = parts;
  return Number(h || 0) * 3600 + Number(m || 0) * 60 + Number(s || 0);
};

/** `URL`, or null for anything that is not a parseable absolute address. */
const parseUrl = (value) => {
  try {
    return new URL(clean(value));
  } catch {
    return null;
  }
};

/** Does `host` equal `name`, or sit directly beneath it? */
const hostIs = (host, name) => host === name || host.endsWith(`.${name}`);

const query = (params, extra = {}) => {
  const search = new URLSearchParams(params);
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const text = search.toString();
  return text ? `?${text}` : "";
};

// ---- The registry ----------------------------------------------------------
//
// `match(url)` gets a parsed URL and returns the provider's own identifiers, or
// null to pass. Order matters only in that the first match wins.

const PROVIDERS = [
  {
    name: "youtube",
    label: "YouTube",
    // youtu.be/ID · /watch?v=ID · /embed/ID · /shorts/ID · /live/ID, on any of
    // the youtube hosts including the nocookie one an earlier paste may carry.
    match: (url) => {
      const host = url.hostname.replace(/^www\.|^m\./, "");
      const youtube = hostIs(host, "youtube.com") || hostIs(host, "youtube-nocookie.com");
      if (!youtube && host !== "youtu.be") return null;

      const path = url.pathname.split("/").filter(Boolean);
      const id =
        host === "youtu.be"
          ? path[0]
          : url.searchParams.get("v") ||
            (["embed", "shorts", "live", "v"].includes(path[0]) ? path[1] : "");

      // A YouTube id is exactly eleven url-safe characters. Checking it is what
      // stops `youtube.com/results?search_query=…` from becoming an embed of
      // nothing, and what keeps `/playlist?list=…` a file (so it errors
      // honestly) rather than a silently blank frame.
      if (!/^[A-Za-z0-9_-]{11}$/.test(id || "")) return null;
      return {
        id,
        start: startSeconds(url.searchParams.get("t") || url.searchParams.get("start")),
        list: url.searchParams.get("list") || "",
      };
    },
    // youtube-nocookie.com is the same player without the tracking cookies it
    // would otherwise set on a storefront that never asked the shopper.
    embed: ({ id, start, list }, { autoplay }) =>
      `https://www.youtube-nocookie.com/embed/${id}${query(
        {
          rel: "0",
          modestbranding: "1",
          playsinline: "1",
          // The pause-on-scroll postMessage below is only listened for when the
          // player is told to expect it.
          enablejsapi: "1",
        },
        { start: start || "", list: list || "", autoplay: autoplay ? "1" : "" }
      )}`,
    // hqdefault, not maxresdefault: every video has the former, only some have
    // the latter, and a 404 here is a broken thumbnail in the rail.
    thumbnail: ({ id }) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    pauseMessage: JSON.stringify({ event: "command", func: "pauseVideo", args: "" }),
  },

  {
    name: "vimeo",
    label: "Vimeo",
    // vimeo.com/ID · vimeo.com/ID/HASH (unlisted) · player.vimeo.com/video/ID
    // · channels/…/ID · groups/…/videos/ID
    match: (url) => {
      if (!hostIs(url.hostname.replace(/^www\./, ""), "vimeo.com")) return null;
      const path = url.pathname.split("/").filter(Boolean);
      const index = path.findIndex((part) => /^\d+$/.test(part));
      if (index < 0) return null;
      const id = path[index];
      // The unlisted hash rides either as the next path segment or as `?h=`.
      const next = path[index + 1] || "";
      const hash = url.searchParams.get("h") || (/^[A-Za-z0-9]+$/.test(next) ? next : "");
      return { id, hash };
    },
    embed: ({ id, hash }, { autoplay }) =>
      `https://player.vimeo.com/video/${id}${query({}, {
        h: hash || "",
        autoplay: autoplay ? "1" : "",
      })}`,
    // Vimeo mints thumbnails through oEmbed, which is a network call this file
    // is not allowed to make. The gallery falls back to the primary image.
    thumbnail: () => "",
    pauseMessage: JSON.stringify({ method: "pause" }),
  },

  {
    name: "dailymotion",
    label: "Dailymotion",
    match: (url) => {
      const host = url.hostname.replace(/^www\./, "");
      if (!hostIs(host, "dailymotion.com") && host !== "dai.ly") return null;
      const path = url.pathname.split("/").filter(Boolean);
      const id = host === "dai.ly" ? path[0] : path[0] === "video" ? path[1] : "";
      if (!/^[A-Za-z0-9]+$/.test(id || "")) return null;
      return { id };
    },
    embed: ({ id }, { autoplay }) =>
      `https://www.dailymotion.com/embed/video/${id}${query({}, {
        autoplay: autoplay ? "1" : "",
      })}`,
    thumbnail: ({ id }) => `https://www.dailymotion.com/thumbnail/video/${id}`,
    pauseMessage: JSON.stringify({ command: "pause" }),
  },

  {
    name: "drive",
    label: "Google Drive",
    // A merchant's own film, uploaded where their other files already live.
    match: (url) => {
      if (!hostIs(url.hostname.replace(/^www\./, ""), "drive.google.com")) return null;
      const path = url.pathname.split("/").filter(Boolean);
      const id = path[0] === "file" && path[1] === "d" ? path[2] : url.searchParams.get("id");
      if (!id) return null;
      return { id };
    },
    // `/preview` is the embeddable player; `/view` is the Drive page and
    // refuses to frame.
    embed: ({ id }) => `https://drive.google.com/file/d/${id}/preview`,
    thumbnail: ({ id }) => `https://drive.google.com/thumbnail?id=${id}&sz=w640`,
    pauseMessage: "",
  },

  {
    name: "loom",
    label: "Loom",
    match: (url) => {
      if (!hostIs(url.hostname.replace(/^www\./, ""), "loom.com")) return null;
      const path = url.pathname.split("/").filter(Boolean);
      const id = ["share", "embed"].includes(path[0]) ? path[1] : "";
      if (!id) return null;
      return { id: id.split("?")[0] };
    },
    embed: ({ id }, { autoplay }) =>
      `https://www.loom.com/embed/${id}${query({}, { autoplay: autoplay ? "1" : "" })}`,
    thumbnail: () => "",
    pauseMessage: "",
  },
];

/** The one file shape, for every URL no provider claims. */
const asFile = (url) => ({
  kind: "file",
  provider: "file",
  label: "Video file",
  url,
  id: "",
  thumbnail: "",
  pauseMessage: "",
  embedUrl: () => "",
});

/**
 * Read a video URL.
 *
 * @param {string} raw
 * @returns {{
 *   kind: "file"|"embed",
 *   provider: string,
 *   label: string,
 *   url: string,
 *   id: string,
 *   thumbnail: string,
 *   pauseMessage: string,
 *   embedUrl: (opts?: {autoplay?: boolean}) => string,
 * }}
 *   `embedUrl()` is a FUNCTION rather than a string because the same row is
 *   framed twice with different answers: the admin's preview wants it idle, the
 *   storefront wants `autoplay=1` the instant a shopper presses the badge.
 *   A file row returns "" from it and is never asked.
 */
export const parseVideoSource = (raw) => {
  const url = clean(raw);
  if (!url) return asFile("");

  const parsed = parseUrl(url);
  if (!parsed || !/^https?:$/.test(parsed.protocol)) return asFile(url);

  for (const provider of PROVIDERS) {
    let parts = null;
    try {
      parts = provider.match(parsed);
    } catch {
      // A matcher must never take the page down over a strange URL.
      parts = null;
    }
    if (!parts) continue;
    return {
      kind: "embed",
      provider: provider.name,
      label: provider.label,
      url,
      id: parts.id,
      thumbnail: provider.thumbnail(parts) || "",
      pauseMessage: provider.pauseMessage,
      embedUrl: (opts = {}) => provider.embed(parts, opts),
    };
  }

  return asFile(url);
};

/** Does this URL need an iframe rather than a `<video>`? */
export const isEmbedVideo = (url) => parseVideoSource(url).kind === "embed";

/**
 * The still a provider already publishes for a video, or "".
 * The caller's own fallback chain — the row's `poster`, then the product's
 * primary image — still applies; this only saves a merchant from hunting down
 * a poster for a link that ships with one.
 */
export const videoThumbnail = (url) => parseVideoSource(url).thumbnail;

/** "YouTube", "Vimeo", … — for the admin's chip. "" for a plain file. */
export const videoProviderLabel = (url) => {
  const source = parseVideoSource(url);
  return source.kind === "embed" ? source.label : "";
};

/** The provider names this build understands, for docs and tests. */
export const VIDEO_PROVIDERS = PROVIDERS.map((provider) => provider.name);

const videoSource = {
  parseVideoSource,
  isEmbedVideo,
  videoThumbnail,
  videoProviderLabel,
  VIDEO_PROVIDERS,
};

export default videoSource;
