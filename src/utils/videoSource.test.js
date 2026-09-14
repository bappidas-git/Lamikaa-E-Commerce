// The URL reading behind every video row: which links become an embed, which
// stay a file, and what each one is framed with. The bug this whole module
// exists for is the last group — a YouTube link handed to <video src>.
import {
  isEmbedVideo,
  parseVideoSource,
  videoProviderLabel,
  videoThumbnail,
  VIDEO_PROVIDERS,
} from "./videoSource";

const ID = "dQw4w9WgXcQ";

describe("YouTube", () => {
  // Every shape the Share menu, the address bar and a phone can produce.
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/live/${ID}`,
  ])("reads %s", (url) => {
    const source = parseVideoSource(url);
    expect(source.kind).toBe("embed");
    expect(source.provider).toBe("youtube");
    expect(source.id).toBe(ID);
  });

  it("embeds through the no-cookie host", () => {
    expect(parseVideoSource(`https://youtu.be/${ID}`).embedUrl()).toContain(
      `https://www.youtube-nocookie.com/embed/${ID}`
    );
  });

  it("only autoplays when the press asks it to", () => {
    const source = parseVideoSource(`https://youtu.be/${ID}`);
    expect(source.embedUrl()).not.toContain("autoplay");
    expect(source.embedUrl({ autoplay: true })).toContain("autoplay=1");
  });

  it.each([
    ["?t=90", 90],
    ["?t=90s", 90],
    ["?t=1m30s", 90],
    ["?t=1h1m1s", 3661],
  ])("carries the start time %s", (suffix, seconds) => {
    expect(parseVideoSource(`https://youtu.be/${ID}${suffix}`).embedUrl()).toContain(
      `start=${seconds}`
    );
  });

  it("publishes a thumbnail", () => {
    expect(videoThumbnail(`https://youtu.be/${ID}`)).toBe(
      `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`
    );
  });

  // A page that is not a video must NOT become an embed of nothing — it stays a
  // file so the player's own error state tells the truth about it.
  it.each([
    "https://www.youtube.com/results?search_query=black+rice",
    "https://www.youtube.com/playlist?list=PLabc",
    "https://www.youtube.com/@lamikaa",
    "https://youtu.be/tooshort",
  ])("leaves %s a file", (url) => {
    expect(parseVideoSource(url).kind).toBe("file");
  });
});

describe("the other hosts", () => {
  it.each([
    ["https://vimeo.com/123456789", "vimeo", "123456789"],
    ["https://vimeo.com/channels/staffpicks/76979871", "vimeo", "76979871"],
    ["https://player.vimeo.com/video/123456789?h=abc123", "vimeo", "123456789"],
    ["https://www.dailymotion.com/video/x8abcde", "dailymotion", "x8abcde"],
    ["https://dai.ly/x8abcde", "dailymotion", "x8abcde"],
    ["https://drive.google.com/file/d/1AbC_dEf/view?usp=sharing", "drive", "1AbC_dEf"],
    ["https://www.loom.com/share/abc123def456", "loom", "abc123def456"],
  ])("%s -> %s", (url, provider, id) => {
    const source = parseVideoSource(url);
    expect(source.kind).toBe("embed");
    expect(source.provider).toBe(provider);
    expect(source.id).toBe(id);
  });

  // An unlisted Vimeo is unplayable without its hash, whichever way it was
  // pasted — as a path segment or as ?h=.
  it.each([
    "https://vimeo.com/123456789/abc123def",
    "https://player.vimeo.com/video/123456789?h=abc123def",
  ])("keeps the unlisted hash of %s", (url) => {
    expect(parseVideoSource(url).embedUrl()).toContain("h=abc123def");
  });

  // Drive serves /preview; /view is the Drive page and refuses to frame.
  it("frames a Drive file through /preview", () => {
    expect(
      parseVideoSource("https://drive.google.com/file/d/1AbC_dEf/view").embedUrl()
    ).toBe("https://drive.google.com/file/d/1AbC_dEf/preview");
  });
});

describe("files", () => {
  // The regression guard: everything that worked before this module existed
  // must still be handed to <video>, untouched.
  it.each([
    "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    "https://cdn.example.test/brand/story.webm",
    "https://example.test/clip.mov",
  ])("keeps %s a file", (url) => {
    const source = parseVideoSource(url);
    expect(source.kind).toBe("file");
    expect(source.url).toBe(url);
    expect(source.thumbnail).toBe("");
  });

  // Nothing here may throw: these run inside render, on whatever a merchant
  // typed half of.
  it.each([["", ""], ["not a url", "not a url"], ["   ", ""], ["ftp://x/y.mp4", "ftp://x/y.mp4"]])(
    "survives %p",
    (url, expected) => {
      const source = parseVideoSource(url);
      expect(source.kind).toBe("file");
      expect(source.url).toBe(expected);
    }
  );

  it("survives null and undefined", () => {
    expect(parseVideoSource(null).kind).toBe("file");
    expect(parseVideoSource(undefined).kind).toBe("file");
  });
});

describe("the helpers the gallery and the admin read", () => {
  it("answers isEmbedVideo", () => {
    expect(isEmbedVideo(`https://youtu.be/${ID}`)).toBe(true);
    expect(isEmbedVideo("https://example.test/a.mp4")).toBe(false);
  });

  it("names a provider, and names nothing for a file", () => {
    expect(videoProviderLabel(`https://youtu.be/${ID}`)).toBe("YouTube");
    expect(videoProviderLabel("https://vimeo.com/1")).toBe("Vimeo");
    expect(videoProviderLabel("https://example.test/a.mp4")).toBe("");
  });

  it("reports no thumbnail for the hosts that mint them behind oEmbed", () => {
    expect(videoThumbnail("https://vimeo.com/123456789")).toBe("");
    expect(videoThumbnail("https://www.loom.com/share/abc123")).toBe("");
  });

  it("ships the providers the admin copy promises", () => {
    expect(VIDEO_PROVIDERS).toEqual(
      expect.arrayContaining(["youtube", "vimeo", "dailymotion", "drive", "loom"])
    );
  });
});
