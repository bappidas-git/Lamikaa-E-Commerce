// The hero's section record and its slide backgrounds are pure data rules, so
// the ones that decide what a shopper actually sees — which picture a slide
// resolves to, how tolerant "just paste a link" really is, and what a value out
// of range degrades to — are pinned down here rather than by clicking through
// the admin.
//
// The rules that matter most are the tolerant ones: `db.json` is hand-editable,
// the Laravel side may answer with a partial record, and a merchant is expected
// to fill in ONE field of six. Every test below is a case where the answer must
// be a complete, sane background rather than `undefined`.

import {
  DEFAULT_HERO_BACKGROUND,
  DEFAULT_HERO_CONFIG,
  HERO_BLUR_MAX,
  HERO_OVERLAY_MAX,
  hasHeroBackground,
  heroBackgroundSrc,
  heroBackgroundVars,
  isHeroBackgroundOnly,
  normalizeHeroBackground,
  normalizeHeroConfig,
  resolveHeroBackground,
} from "./heroConfig";

const DESKTOP = "https://res.cloudinary.com/v8vrixwq/image/upload/v1/hero-wide.jpg";
const PHONE = "https://res.cloudinary.com/v8vrixwq/image/upload/v1/hero-tall.jpg";

describe("normalizeHeroBackground", () => {
  it("fills in a complete record from nothing at all", () => {
    expect(normalizeHeroBackground(undefined)).toEqual(DEFAULT_HERO_BACKGROUND);
    expect(normalizeHeroBackground(null)).toEqual(DEFAULT_HERO_BACKGROUND);
    expect(normalizeHeroBackground(42)).toEqual(DEFAULT_HERO_BACKGROUND);
  });

  it("takes a bare string as the picture — one link is a whole background", () => {
    expect(normalizeHeroBackground(`  ${DESKTOP}  `)).toEqual({
      ...DEFAULT_HERO_BACKGROUND,
      url: DESKTOP,
    });
  });

  it("resolves every other key when only the URL was set", () => {
    const bg = normalizeHeroBackground({ url: DESKTOP });
    expect(bg.position).toBe("center");
    expect(bg.overlay).toBe(55);
    expect(bg.blur).toBe(0);
    expect(bg.showContent).toBe(true);
  });

  it("reads the older key spellings a hand-written record may carry", () => {
    const bg = normalizeHeroBackground({ image: DESKTOP, mobileImage: PHONE });
    expect(bg.url).toBe(DESKTOP);
    expect(bg.mobileUrl).toBe(PHONE);
  });

  it("clamps the scrim and the blur instead of trusting them", () => {
    expect(normalizeHeroBackground({ overlay: 400 }).overlay).toBe(HERO_OVERLAY_MAX);
    expect(normalizeHeroBackground({ overlay: -20 }).overlay).toBe(0);
    expect(normalizeHeroBackground({ blur: 99 }).blur).toBe(HERO_BLUR_MAX);
    // A deliberate zero is a decision, not a missing value.
    expect(normalizeHeroBackground({ overlay: 0 }).overlay).toBe(0);
    // Junk resolves to the designed default rather than to NaN.
    expect(normalizeHeroBackground({ overlay: "loud" }).overlay).toBe(55);
  });

  it("refuses a focal point it does not know", () => {
    expect(normalizeHeroBackground({ position: "left" }).position).toBe("left");
    expect(normalizeHeroBackground({ position: "diagonally" }).position).toBe("center");
  });

  it("only hides the product when it was asked to in so many words", () => {
    expect(normalizeHeroBackground({ url: DESKTOP }).showContent).toBe(true);
    expect(normalizeHeroBackground({ url: DESKTOP, showContent: false }).showContent).toBe(
      false
    );
  });
});

describe("hasHeroBackground / heroBackgroundSrc", () => {
  it("is a background as soon as either picture is set", () => {
    expect(hasHeroBackground(normalizeHeroBackground({ url: DESKTOP }))).toBe(true);
    expect(hasHeroBackground(normalizeHeroBackground({ mobileUrl: PHONE }))).toBe(true);
    expect(hasHeroBackground(normalizeHeroBackground({}))).toBe(false);
    expect(hasHeroBackground(null)).toBe(false);
  });

  it("hands the phone its own picture when there is one", () => {
    const bg = normalizeHeroBackground({ url: DESKTOP, mobileUrl: PHONE });
    expect(heroBackgroundSrc(bg, true)).toBe(PHONE);
    expect(heroBackgroundSrc(bg, false)).toBe(DESKTOP);
  });

  it("lets one picture stand in for the other, so a single upload is enough", () => {
    const wideOnly = normalizeHeroBackground({ url: DESKTOP });
    expect(heroBackgroundSrc(wideOnly, true)).toBe(DESKTOP);
    const tallOnly = normalizeHeroBackground({ mobileUrl: PHONE });
    expect(heroBackgroundSrc(tallOnly, false)).toBe(PHONE);
    expect(heroBackgroundSrc(normalizeHeroBackground({}), false)).toBe("");
    expect(heroBackgroundSrc(null, false)).toBe("");
  });
});

describe("resolveHeroBackground", () => {
  const config = normalizeHeroConfig({ background: { url: DESKTOP, overlay: 20 } });

  it("gives a slide the section picture when it has none of its own", () => {
    const bg = resolveHeroBackground({ id: 1 }, config);
    expect(bg.url).toBe(DESKTOP);
    expect(bg.overlay).toBe(20);
  });

  it("lets a slide's own picture win, framed by its OWN settings", () => {
    const bg = resolveHeroBackground(
      { id: 1, heroBackground: { url: PHONE, overlay: 90 } },
      config
    );
    expect(bg.url).toBe(PHONE);
    // Not a mixture of the two records: 20 belonged to the section's picture.
    expect(bg.overlay).toBe(90);
  });

  it("still honours a slide that hides its product over the section picture", () => {
    const bg = resolveHeroBackground({ id: 1, heroBackground: { showContent: false } }, config);
    expect(bg.url).toBe(DESKTOP);
    expect(bg.showContent).toBe(false);
  });

  it("resolves to no background at all when neither level has a picture", () => {
    expect(hasHeroBackground(resolveHeroBackground({ id: 1 }, normalizeHeroConfig(null)))).toBe(
      false
    );
    expect(hasHeroBackground(resolveHeroBackground(null, null))).toBe(false);
  });
});

describe("isHeroBackgroundOnly", () => {
  it("is only true when there is a picture to show instead", () => {
    expect(isHeroBackgroundOnly(normalizeHeroBackground({ url: DESKTOP, showContent: false }))).toBe(
      true
    );
    // Hiding the product with nothing behind it would leave an empty stage, so
    // the flag is ignored rather than obeyed.
    expect(isHeroBackgroundOnly(normalizeHeroBackground({ showContent: false }))).toBe(false);
    expect(isHeroBackgroundOnly(normalizeHeroBackground({ url: DESKTOP }))).toBe(false);
  });
});

describe("heroBackgroundVars", () => {
  it("hands the stylesheet the focal point and the scrim as a fraction", () => {
    const vars = heroBackgroundVars(
      normalizeHeroBackground({ url: DESKTOP, position: "top", overlay: 40 })
    );
    expect(vars["--sf-hero-bg-position"]).toBe("top");
    expect(vars["--sf-hero-bg-overlay"]).toBe("0.4");
  });

  it("says `none` rather than an identity filter when nothing is blurred", () => {
    const vars = heroBackgroundVars(normalizeHeroBackground({ url: DESKTOP }));
    expect(vars["--sf-hero-bg-filter"]).toBe("none");
    expect(vars["--sf-hero-bg-transform"]).toBe("none");
  });

  it("blurs with an overscan, so the softened edges stay off-frame", () => {
    const vars = heroBackgroundVars(normalizeHeroBackground({ url: DESKTOP, blur: 8 }));
    expect(vars["--sf-hero-bg-filter"]).toBe("blur(8px)");
    expect(vars["--sf-hero-bg-transform"]).toBe("scale(1.08)");
  });
});

describe("normalizeHeroConfig", () => {
  it("carries a complete background record whether or not one was stored", () => {
    expect(normalizeHeroConfig(null).background).toEqual(DEFAULT_HERO_BACKGROUND);
    expect(normalizeHeroConfig({ background: DESKTOP }).background.url).toBe(DESKTOP);
  });

  it("leaves the behaviour keys exactly as they were", () => {
    const cfg = normalizeHeroConfig(null);
    expect(cfg.enabled).toBe(DEFAULT_HERO_CONFIG.enabled);
    expect(cfg.intervalMs).toBe(DEFAULT_HERO_CONFIG.intervalMs);
    expect(cfg.transition).toBe(DEFAULT_HERO_CONFIG.transition);
    expect(cfg.showPause).toBe(true);
    expect(normalizeHeroConfig({ intervalMs: 100 }).intervalMs).toBe(3000);
    expect(normalizeHeroConfig({ intervalMs: 99000 }).intervalMs).toBe(15000);
  });
});
