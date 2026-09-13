// Everything the hero can be told to do is a pure data rule, so the ones that
// decide what a shopper actually sees are pinned down here rather than by
// clicking through the admin: which picture a slide resolves to, WHERE its copy
// and its card are drawn, which ground it is drawn on, how much plate goes
// under the words — and what the carousel does when the stored slide list and
// the catalogue disagree.
//
// The rules that matter most are the tolerant ones: `db.json` is hand-editable,
// the Laravel side may answer with a partial record, and a merchant is expected
// to fill in ONE field of a dozen. Every normalizer test below is a case where
// the answer must be a complete, sane record rather than `undefined`.
//
// And the one that matters more than any of them is `resolveHeroPanel`: the
// scrim over a background picture goes all the way to zero, so the COPY has to
// carry its own ground or a merchant can lose the headline with one slider.

import {
  DEFAULT_HERO_BACKGROUND,
  DEFAULT_HERO_CONFIG,
  DEFAULT_HERO_EYEBROW,
  DEFAULT_HERO_LAYOUT,
  HERO_BLUR_MAX,
  HERO_OVERLAY_MAX,
  HERO_PANEL_FLOOR,
  buildHeroSlides,
  hasHeroBackground,
  hasHeroCta,
  heroBackgroundSrc,
  heroBackgroundVars,
  heroLinkProps,
  heroSlideVars,
  isHeroBackgroundOnly,
  isHeroPoster,
  normalizeHeroBackground,
  normalizeHeroConfig,
  normalizeHeroLayout,
  normalizeHeroSlide,
  normalizeHeroSlides,
  resolveHeroAlign,
  resolveHeroBackground,
  resolveHeroLayout,
  resolveHeroPanel,
  resolveHeroTheme,
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

// =============================================================================
// THE COMPOSITION, THE GROUND AND THE SLIDE LIST
// =============================================================================
// Everything below is a rule a merchant can reach from Admin → Home & Hero, and
// every one of them is a pure function precisely so it can be pinned down here
// rather than by clicking: which slide is drawn where, which ground it is drawn
// on, how much plate goes under the copy, and what the carousel does when the
// stored list and the catalogue disagree.

describe("normalizeHeroLayout", () => {
  it("fills in a complete composition from nothing at all", () => {
    expect(normalizeHeroLayout(undefined)).toEqual(DEFAULT_HERO_LAYOUT);
    expect(normalizeHeroLayout(null)).toEqual(DEFAULT_HERO_LAYOUT);
    expect(normalizeHeroLayout("split")).toEqual(DEFAULT_HERO_LAYOUT);
  });

  it("layers a PARTIAL record over the fallback, key by key", () => {
    const section = normalizeHeroLayout({ preset: "split", panel: "glass" });
    const slide = normalizeHeroLayout({ preset: "text-right" }, section);
    // The slide only changed the preset…
    expect(slide.preset).toBe("text-right");
    // …so it keeps the section's plate rather than resetting to the default.
    expect(slide.panel).toBe("glass");
  });

  it("refuses a preset, alignment, panel or theme it does not know", () => {
    const l = normalizeHeroLayout({
      preset: "diagonal",
      align: "sideways",
      vertical: "middling",
      panel: "marble",
      theme: "sepia",
    });
    expect(l.preset).toBe("text-left");
    expect(l.align).toBe("auto");
    expect(l.vertical).toBe("center");
    expect(l.panel).toBe("auto");
    expect(l.theme).toBe("inherit");
  });

  it("only switches a part off when it was asked to in so many words", () => {
    expect(normalizeHeroLayout({}).showCopy).toBe(true);
    expect(normalizeHeroLayout({ showCopy: false }).showCopy).toBe(false);
    // A truthy-looking string is not a decision; the designed answer stands.
    expect(normalizeHeroLayout({ showMedia: "no" }).showMedia).toBe(true);
  });

  it("clamps the plate's strength", () => {
    expect(normalizeHeroLayout({ panelStrength: 400 }).panelStrength).toBe(100);
    expect(normalizeHeroLayout({ panelStrength: -5 }).panelStrength).toBe(0);
  });
});

describe("resolveHeroLayout", () => {
  const config = normalizeHeroConfig({
    layout: { preset: "text-right", vertical: "bottom" },
  });

  it("gives a slide the section composition when it has none of its own", () => {
    const l = resolveHeroLayout({ id: "a" }, config, null);
    expect(l.preset).toBe("text-right");
    expect(l.vertical).toBe("bottom");
  });

  it("lets a slide override one key and inherit the rest", () => {
    const l = resolveHeroLayout({ layout: { preset: "split" } }, config, null);
    expect(l.preset).toBe("split");
    expect(l.vertical).toBe("bottom");
  });

  it("makes the poster preset mean the words and the card are off", () => {
    const l = resolveHeroLayout({ layout: { preset: "poster" } }, config, null);
    expect(l.showCopy).toBe(false);
    expect(l.showMedia).toBe(false);
    // The buttons survive: "a picture and one button" is the whole point.
    expect(l.showActions).toBe(true);
    expect(isHeroPoster({ ...l, showActions: false })).toBe(true);
  });

  it("still honours the LEGACY 'picture and nothing else' background switch", () => {
    const background = normalizeHeroBackground({ url: DESKTOP, showContent: false });
    const l = resolveHeroLayout({ id: "a" }, config, background);
    expect(l.showCopy).toBe(false);
    expect(l.showMedia).toBe(false);
  });

  it("but a slide that HAS a composition is governed by it, not by the old key", () => {
    const background = normalizeHeroBackground({ url: DESKTOP, showContent: false });
    const l = resolveHeroLayout({ layout: { preset: "text-left" } }, config, background);
    expect(l.showCopy).toBe(true);
  });

  it("ignores the legacy switch when there is no picture to show instead", () => {
    const background = normalizeHeroBackground({ showContent: false });
    expect(resolveHeroLayout({ id: "a" }, config, background).showCopy).toBe(true);
  });
});

describe("resolveHeroTheme", () => {
  it("takes the section's ground by default", () => {
    expect(resolveHeroTheme(normalizeHeroLayout(null), { theme: "dark" })).toBe("dark");
    expect(resolveHeroTheme(normalizeHeroLayout(null), { theme: "light" })).toBe("light");
    expect(resolveHeroTheme(null, null)).toBe("light");
  });

  it("reads a ground spelled on the slide record as a fallback", () => {
    const inherit = normalizeHeroLayout(null);
    expect(resolveHeroTheme(inherit, { theme: "light" }, "dark")).toBe("dark");
    // The composition's own answer still wins over it.
    expect(
      resolveHeroTheme(normalizeHeroLayout({ theme: "light" }), { theme: "dark" }, "dark")
    ).toBe("light");
  });

  it("lets one slide overrule it in either direction", () => {
    expect(
      resolveHeroTheme(normalizeHeroLayout({ theme: "light" }), { theme: "dark" })
    ).toBe("light");
    expect(
      resolveHeroTheme(normalizeHeroLayout({ theme: "dark" }), { theme: "light" })
    ).toBe("dark");
  });
});

describe("resolveHeroAlign", () => {
  it("reads its answer off the composition when nobody has said", () => {
    expect(resolveHeroAlign(normalizeHeroLayout({ preset: "text-left" }))).toBe("start");
    expect(resolveHeroAlign(normalizeHeroLayout({ preset: "text-right" }))).toBe("start");
    expect(resolveHeroAlign(normalizeHeroLayout({ preset: "text-center" }))).toBe("center");
    expect(resolveHeroAlign(normalizeHeroLayout({ preset: "poster" }))).toBe("center");
  });

  it("hugs the card from both sides in the split composition", () => {
    const split = normalizeHeroLayout({ preset: "split" });
    expect(resolveHeroAlign(split, "a")).toBe("end");
    expect(resolveHeroAlign(split, "b")).toBe("start");
  });

  it("hands an explicit alignment straight back, for both columns", () => {
    const split = normalizeHeroLayout({ preset: "split", align: "center" });
    expect(resolveHeroAlign(split, "a")).toBe("center");
    expect(resolveHeroAlign(split, "b")).toBe("center");
  });
});

describe("resolveHeroPanel — the ground under the copy", () => {
  const layout = normalizeHeroLayout(null); // panel: "auto"
  const withBg = (over, blur = 0) =>
    normalizeHeroBackground({ url: DESKTOP, overlay: over, blur });

  it("is nothing at all when there is no picture to be read over", () => {
    expect(resolveHeroPanel(normalizeHeroBackground({}), layout)).toEqual({
      kind: "none",
      strength: 0,
    });
  });

  it("CARRIES THE COPY WHEN THE SCRIM DOES NOT — the whole point", () => {
    // A merchant takes the scrim to zero on a bright photograph. The plate
    // under the words comes up to the designed floor instead of the headline
    // riding bare on the picture.
    expect(resolveHeroPanel(withBg(0), layout)).toEqual({
      kind: "scrim",
      strength: HERO_PANEL_FLOOR,
    });
  });

  it("drops away as the scrim rises, and is gone once the scrim is doing the work", () => {
    expect(resolveHeroPanel(withBg(30), layout).strength).toBe(37);
    expect(resolveHeroPanel(withBg(55), layout).strength).toBe(15);
    expect(resolveHeroPanel(withBg(80), layout)).toEqual({ kind: "none", strength: 0 });
  });

  it("credits a blurred picture too — soft focus is a ground of its own", () => {
    expect(resolveHeroPanel(withBg(55, 8), layout)).toEqual({ kind: "none", strength: 0 });
    expect(resolveHeroPanel(withBg(0, 10), layout).strength).toBe(42);
  });

  it("obeys `none` even over a bare photograph — it is a decision, not a mistake", () => {
    const off = normalizeHeroLayout({ panel: "none" });
    expect(resolveHeroPanel(withBg(0), off)).toEqual({ kind: "none", strength: 0 });
  });

  it("gives each named plate its designed weight, and a hand-set one wins", () => {
    expect(resolveHeroPanel(withBg(55), normalizeHeroLayout({ panel: "glass" }))).toEqual({
      kind: "glass",
      strength: 70,
    });
    expect(resolveHeroPanel(withBg(55), normalizeHeroLayout({ panel: "solid" }))).toEqual({
      kind: "solid",
      strength: 94,
    });
    expect(
      resolveHeroPanel(withBg(55), normalizeHeroLayout({ panel: "glass", panelStrength: 40 }))
        .strength
    ).toBe(40);
    // A strength set on `auto` is a floor the merchant chose themselves.
    expect(
      resolveHeroPanel(withBg(90), normalizeHeroLayout({ panelStrength: 25 }))
    ).toEqual({ kind: "scrim", strength: 25 });
  });

  it("hands the stylesheet the strength as a fraction", () => {
    const vars = heroSlideVars(withBg(0), resolveHeroPanel(withBg(0), layout));
    expect(vars["--sf-hero-panel"]).toBe("0.62");
    expect(vars["--sf-hero-bg-overlay"]).toBe("0");
  });
});

describe("heroLinkProps / hasHeroCta", () => {
  it("routes an in-app path through the router and an off-site one through an anchor", () => {
    expect(heroLinkProps("/shop")).toEqual({ to: "/shop" });
    expect(heroLinkProps("https://example.com")).toEqual({
      href: "https://example.com",
      target: "_blank",
      rel: "noopener noreferrer",
    });
    expect(heroLinkProps("mailto:hello@example.com")).toEqual({
      href: "mailto:hello@example.com",
    });
  });

  it("is no button at all without both a label and a destination", () => {
    expect(heroLinkProps("")).toBeNull();
    expect(heroLinkProps(null)).toBeNull();
    expect(hasHeroCta({ label: "Shop", href: "/shop" })).toBe(true);
    expect(hasHeroCta({ label: "Shop", href: "" })).toBe(false);
    expect(hasHeroCta({ label: "", href: "/shop" })).toBe(false);
    expect(hasHeroCta(null)).toBe(false);
  });
});

describe("normalizeHeroSlide", () => {
  it("fills in a complete poster, and gives it an id if it has none", () => {
    const slide = normalizeHeroSlide({ kind: "custom" });
    expect(slide.id).toMatch(/^hs-/);
    expect(slide.enabled).toBe(true);
    expect(slide.badges).toEqual([]);
    expect(slide.media).toEqual({ url: "", mobileUrl: "", alt: "" });
    expect(slide.primaryCta).toEqual({ label: "", href: "" });
    // Nothing of its own means "inherit", which is what `null` reads as.
    expect(slide.background).toBeNull();
    expect(slide.layout).toBeNull();
  });

  it("keeps a product slide's product and drops one from a poster", () => {
    expect(normalizeHeroSlide({ kind: "product", productId: 7 }).productId).toBe(7);
    expect(normalizeHeroSlide({ kind: "custom", productId: 7 }).productId).toBeNull();
  });

  it("cleans the marks list rather than trusting it", () => {
    expect(normalizeHeroSlide({ badges: ["  Farmer-owned ", "", 4, null] }).badges).toEqual([
      "Farmer-owned",
    ]);
    expect(normalizeHeroSlide({ badges: "Farmer-owned" }).badges).toEqual([]);
  });

  it("drops a product slide with no product from the stored list", () => {
    const rows = normalizeHeroSlides([
      { kind: "product", productId: 1 },
      { kind: "product" },
      { kind: "custom", headline: "Poster" },
      "nonsense",
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[0].productId).toBe(1);
    expect(rows[1].headline).toBe("Poster");
  });
});

describe("buildHeroSlides", () => {
  const FACE = { id: 1, name: "Face Wash", heroOrder: 1 };
  const SOAP = { id: 2, name: "Soap", heroOrder: 2 };
  const MIST = { id: 3, name: "Mist", heroOrder: 3 };

  it("falls back to every hero product, in order, when nothing is stored", () => {
    const built = buildHeroSlides([FACE, SOAP], normalizeHeroConfig(null));
    expect(built.map((s) => s.product.id)).toEqual([1, 2]);
    expect(built.every((s) => s.kind === "product")).toBe(true);
  });

  it("lets the stored list decide the ORDER, posters and products together", () => {
    const config = normalizeHeroConfig({
      slides: [
        { id: "p2", kind: "product", productId: 2 },
        { id: "poster", kind: "custom", headline: "Harvest" },
        { id: "p1", kind: "product", productId: 1 },
      ],
    });
    const built = buildHeroSlides([FACE, SOAP], config);
    expect(built.map((s) => s.key)).toEqual(["p2", "poster", "p1"]);
    expect(built[1].kind).toBe("custom");
  });

  it("APPENDS a hero product the stored list has never heard of", () => {
    // The rule that keeps the two admin screens honest: a product given a hero
    // position from Products still opens the page.
    const config = normalizeHeroConfig({
      slides: [{ id: "p1", kind: "product", productId: 1 }],
    });
    const built = buildHeroSlides([FACE, SOAP, MIST], config);
    expect(built.map((s) => s.product.id)).toEqual([1, 2, 3]);
  });

  it("skips a product slide whose product has gone, rather than drawing an empty stage", () => {
    const config = normalizeHeroConfig({
      slides: [
        { id: "gone", kind: "product", productId: 99 },
        { id: "p1", kind: "product", productId: 1 },
      ],
    });
    expect(buildHeroSlides([FACE], config).map((s) => s.key)).toEqual(["p1"]);
  });

  it("skips a hidden slide and a poster with nothing on it", () => {
    const config = normalizeHeroConfig({
      slides: [
        { id: "p1", kind: "product", productId: 1, enabled: false },
        { id: "blank", kind: "custom" },
        { id: "button-only", kind: "custom", primaryCta: { label: "Shop", href: "/shop" } },
      ],
    });
    // A poster that is nothing but a button IS a slide; one that is nothing is not.
    expect(buildHeroSlides([FACE], config).map((s) => s.key)).toEqual(["button-only"]);
  });

  it("resolves each slide's picture, composition, ground and plate up front", () => {
    const config = normalizeHeroConfig({
      theme: "dark",
      background: { url: DESKTOP, overlay: 0 },
      slides: [{ id: "p1", kind: "product", productId: 1, layout: { preset: "split" } }],
    });
    const [slide] = buildHeroSlides([FACE], config);
    expect(slide.background.url).toBe(DESKTOP);
    expect(slide.layout.preset).toBe("split");
    expect(slide.theme).toBe("dark");
    expect(slide.panel).toEqual({ kind: "scrim", strength: HERO_PANEL_FLOOR });
  });

  it("prefers a slide's own picture, then the product's, then the section's", () => {
    const config = normalizeHeroConfig({ background: { url: DESKTOP } });
    const withOwn = buildHeroSlides(
      [FACE],
      normalizeHeroConfig({
        ...config,
        slides: [{ id: "a", kind: "product", productId: 1, background: { url: PHONE } }],
      })
    );
    expect(withOwn[0].background.url).toBe(PHONE);
    // Legacy: the background that used to live on the product itself.
    const legacy = buildHeroSlides([{ ...FACE, heroBackground: PHONE }], config);
    expect(legacy[0].background.url).toBe(PHONE);
    // Neither: the section's.
    expect(buildHeroSlides([FACE], config)[0].background.url).toBe(DESKTOP);
  });
});

describe("normalizeHeroConfig — the new section keys", () => {
  it("defaults to the light ground, a full-screen band and the seeded eyebrow", () => {
    const cfg = normalizeHeroConfig(null);
    expect(cfg.theme).toBe("light");
    expect(cfg.height).toBe("standard");
    expect(cfg.eyebrowLabel).toBe(DEFAULT_HERO_EYEBROW);
    expect(cfg.showEyebrow).toBe(true);
    expect(cfg.layout).toEqual(DEFAULT_HERO_LAYOUT);
    expect(cfg.slides).toEqual([]);
  });

  it("refuses a ground or a height it does not know, and never an empty eyebrow", () => {
    expect(normalizeHeroConfig({ theme: "sepia" }).theme).toBe("light");
    expect(normalizeHeroConfig({ height: "enormous" }).height).toBe("standard");
    expect(normalizeHeroConfig({ eyebrowLabel: "   " }).eyebrowLabel).toBe(
      DEFAULT_HERO_EYEBROW
    );
    expect(normalizeHeroConfig({ eyebrowLabel: " New in " }).eyebrowLabel).toBe("New in");
  });
});
