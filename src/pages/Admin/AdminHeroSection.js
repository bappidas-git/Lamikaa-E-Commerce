import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Skeleton,
  Slider,
  Switch,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import apiService from "../../services/api";
import { ADMIN_PALETTE } from "../../theme/adminTheme";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import { primaryImage, resolvePrice, stageSrc } from "../../utils/product";
import ListEditor from "./components/ListEditor";
import {
  DEFAULT_HERO_BACKGROUND,
  DEFAULT_HERO_CONFIG,
  DEFAULT_HERO_LAYOUT,
  DEFAULT_HERO_SLIDE,
  HERO_BACKGROUND_POSITIONS,
  HERO_BLUR_MAX,
  HERO_HEIGHTS,
  HERO_INTERVAL_MAX_MS,
  HERO_INTERVAL_MIN_MS,
  HERO_LAYOUTS,
  HERO_MEDIA_DEVICES,
  HERO_MEDIA_SCALE_DEFAULT,
  HERO_MEDIA_SCALE_MAX,
  HERO_MEDIA_SCALE_MIN,
  HERO_OVERLAY_MAX,
  HERO_PANELS,
  HERO_PANEL_MAX,
  HERO_SLIDE_THEMES,
  HERO_TEXT_ALIGNMENTS,
  HERO_THEMES,
  HERO_TRANSITIONS,
  HERO_VERTICAL_ALIGNMENTS,
  clampInt,
  hasHeroBackground,
  hasHeroCta,
  heroBackgroundSrc,
  heroSlideHasContent,
  newHeroSlideId,
  normalizeHeroBackground,
  normalizeHeroConfig,
  normalizeHeroLayout,
  normalizeHeroSlide,
  resolveHeroAlign,
  resolveHeroLayout,
  resolveHeroPanel,
  resolveHeroTheme,
  resolveSlideBackground,
} from "../../utils/heroConfig";

// =============================================================================
// Admin → Storefront → Home & Hero
// =============================================================================
//
// THE WHOLE OPENING BAND OF THE STOREFRONT, EDITED IN ONE PLACE. The screen
// this replaces could do two things: choose which products open the page, and
// put one picture behind them. Everything else about the composition was in the
// stylesheet — the copy was always on the left, the pack was always on the
// right, a slide was always a product, and the only defence a headline had
// against a bright photograph was a scrim slider that also went to zero.
//
// THREE TABS
//
//   SLIDES        the ordered carousel. A slide is a PRODUCT or a POSTER, and
//                 both are in the same list, reordered with the same arrows.
//                 Each row opens onto its copy, its composition, its picture
//                 and its ground.
//
//   SECTION       the `heroConfig` singleton's behaviour: the master toggle,
//                 autoplay and its timer, the transition, which chrome is
//                 drawn, how tall the band is, the eyebrow's wording — plus
//                 the DEFAULT composition and the DEFAULT picture every slide
//                 inherits until it is given its own.
//
//   PREVIEW       beside the list on a desktop, and switchable between the
//                 desktop and the phone composition, because they are not the
//                 same composition and a merchant choosing "card centred, copy
//                 either side" is entitled to see what a phone will do with it.
//
// A POSTER (`kind: "custom"`) is the answer to "I want a picture with a button
// on it". It has no product, no price and no add-to-cart: a background, and
// whatever of an eyebrow, a headline, two lines, some marks, a card of its own
// and two buttons the merchant switches on. All of it may be blank — a poster
// that is nothing but a picture is a valid slide, and so is one that is a
// picture and a single button.
//
// ONE SAVE. Everything on this screen is one write of `heroConfig` (the slide
// list rides in the record), plus `setHeroOrder` to keep the products' own
// `heroOrder` in step for the rest of the admin, plus one `updateProduct` per
// product whose HERO COPY changed — because a product's words belong on the
// product, where every other screen edits them. The button in the header does
// all of it and says how much is waiting.
//
// EVERY RULE IS `utils/heroConfig`'s, NOT THIS SCREEN'S. The layout resolution,
// the background inheritance, the theme inheritance and — above all — the
// legibility plate are all computed by the same functions the storefront calls,
// so the preview below cannot drift from the page it is previewing. The one
// thing this file does name for itself is the STOREFRONT's ink (see
// `STOREFRONT_INK`): a picture of the storefront has to be painted in the
// storefront's colours, not in the admin's.
//
// WHAT THE SCREEN REFUSES TO LET AN ADMIN SHIP QUIETLY
//   • a product slide with no primary image, while it is still drawing a card;
//   • a poster with nothing on it and nothing behind it;
//   • an empty carousel while the section is switched on;
//   • a slide whose scrim, blur and plate are all off over a picture — which is
//     the one combination that can cost the copy its contrast.
// =============================================================================

const toast = (icon, title, text) =>
  Swal.fire({
    icon,
    title,
    text,
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: icon === "error" ? 4000 : 2500,
  });

// Seconds in the input, milliseconds in the record — one place to convert.
const msToSeconds = (ms) => Math.round((Number(ms) || 0) / 100) / 10;
const secondsToMs = (s) => Math.round((Number(s) || 0) * 1000);

/** "3" -> "03". Mirrors HeroCarousel's `padIndex`. */
const padIndex = (value) => String(value).padStart(2, "0");

/** The slide's headline: the product's hero line, else its promise. */
const previewHeadline = (product) => product?.heroHeadline || product?.promise || "";

/** The slide's subtext: the product's hero line, else its short description. */
const previewSubtext = (product) =>
  product?.heroSubtext || product?.shortDescription || "";

/** "Explore the Face Wash" — the short name, because every product in the range
    opens on the same two words and repeating them is noise. */
const exploreLabel = (product) =>
  `Explore the ${product?.shortName || product?.name || "range"}`.trim();

const byHeroOrder = (a, b) => (a.heroOrder ?? 0) - (b.heroOrder ?? 0);

/**
 * THE STOREFRONT'S OWN INK, named here and nowhere else in the admin.
 *
 * The admin never reads `--sf-*` tokens and never borrows the storefront's
 * palette — except in a PICTURE OF the storefront, which is what the preview
 * below is. Painting it in the admin's palette would make it a lie: the whole
 * point of the panel/scrim/theme controls is that a merchant can see what a
 * headline will look like on their photograph, and that answer is different on
 * cream than it is on charcoal. These are `theme/storefront-tokens.css`'s
 * values for the two grounds the hero can be composed on — keep them in step.
 */
const STOREFRONT_INK = {
  light: {
    bg: "#F8F3EA",
    bgRgb: "248, 243, 234",
    surface: "#FFFDF9",
    text: "#1B1714",
    secondary: "#544C42",
    muted: "rgba(27, 23, 20, 0.68)",
    gold: "#825C0E",
    goldInk: "#FFFCF5",
    border: "rgba(27, 23, 20, 0.12)",
    plate: "#F1E9DA",
  },
  dark: {
    bg: "#17120F",
    bgRgb: "23, 18, 15",
    surface: "#201A15",
    text: "#F7F5F0",
    secondary: "#BDB5A8",
    muted: "rgba(247, 245, 240, 0.62)",
    gold: "#F5D76E",
    goldInk: "#17120F",
    border: "rgba(247, 243, 234, 0.10)",
    plate: "#29221B",
  },
};

/** Two records, compared the way they are stored. */
const sameShape = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** What actually reaches the record: a background, or nothing at all. A picture
    is what makes a background exist, so a slide with no URL stores `null`
    rather than a shelf of defaults. */
const backgroundToStore = (background) =>
  hasHeroBackground(background)
    ? // `showContent` is legacy: the composition's three switches own that
      // decision now, so anything this screen writes says "yes" and the layout
      // does the hiding. (The key is still READ, for records written before
      // layouts existed.)
      { ...background, showContent: true }
    : null;

/**
 * ONE-TIME MIGRATION, applied on load rather than on save.
 *
 * A background written before layouts existed could say "picture and nothing
 * else" with `showContent: false`. That is a COMPOSITION decision, so it moves
 * to the layout as the Poster preset and the background key is cleared — which
 * means the switch a merchant flipped a month ago shows up in the new editor as
 * the thing it always meant, rather than as an invisible override of it.
 */
const migrateLegacyPoster = (background, layout) => {
  const bg = normalizeHeroBackground(background);
  if (bg.showContent !== false || !hasHeroBackground(bg)) {
    return { background: bg, layout };
  }
  return {
    background: { ...bg, showContent: true },
    layout: normalizeHeroLayout(
      { preset: "poster", showCopy: false, showMedia: false },
      layout || DEFAULT_HERO_LAYOUT
    ),
  };
};

/** A blank poster, ready to be typed into. */
const newPoster = (count) =>
  normalizeHeroSlide({
    ...DEFAULT_HERO_SLIDE,
    id: newHeroSlideId(),
    kind: "custom",
    label: `Poster ${count + 1}`,
    // A poster inherits the section composition like any other slide, and the
    // one thing it almost certainly wants changed is that there is no product
    // card to put on one side. Centred is the honest starting point.
    layout: normalizeHeroLayout({ preset: "text-center", showMedia: false }),
  });

/**
 * Bring the stored slide list and the catalogue into agreement.
 *
 * The same reconciliation `buildHeroSlides()` does on the storefront, done here
 * so the LIST a merchant edits is the list that will be rendered:
 *   • a product slide whose product has gone (deleted, or dropped from the
 *     hero) is dropped;
 *   • a hero product the list does not name is appended, so a product added to
 *     the hero from the Products screen appears here rather than silently
 *     opening the page from the end of the carousel;
 *   • an EMPTY list is seeded from the hero products, with each one's legacy
 *     `heroBackground` carried onto its slide — which is how a hero arranged
 *     before this screen existed becomes an editable list without anybody
 *     retyping it.
 */
const reconcileSlides = (stored, heroProducts) => {
  const heroIds = new Set(heroProducts.map((p) => String(p.id)));

  if (!stored || stored.length === 0) {
    return heroProducts.map((product) => {
      const migrated = migrateLegacyPoster(product.heroBackground, null);
      return normalizeHeroSlide({
        id: `product-${product.id}`,
        kind: "product",
        productId: product.id,
        background: hasHeroBackground(migrated.background)
          ? migrated.background
          : null,
        layout: migrated.layout,
      });
    });
  }

  const kept = stored.filter(
    (slide) => slide.kind !== "product" || heroIds.has(String(slide.productId))
  );
  const named = new Set(
    kept.filter((s) => s.kind === "product").map((s) => String(s.productId))
  );
  const appended = heroProducts
    .filter((product) => !named.has(String(product.id)))
    .map((product) =>
      normalizeHeroSlide({
        id: `product-${product.id}`,
        kind: "product",
        productId: product.id,
        background: hasHeroBackground(normalizeHeroBackground(product.heroBackground))
          ? normalizeHeroBackground(product.heroBackground)
          : null,
      })
    );
  return [...kept, ...appended];
};

// ─── The composition picker ──────────────────────────────────────────────────
//
// Five wireframes rather than a dropdown. A composition is a SHAPE, and the
// fastest way to say "the card is in the middle and the copy is either side of
// it" is to draw it — a merchant recognises the tile they want before they have
// finished reading the label under it.
//
// The tiles are Boxes, not images: they are drawn from the same three parts the
// real slide is (a copy block, a card, a second copy block), so a preset added
// to `HERO_LAYOUTS` needs a diagram here and nothing else.
const PRESET_DIAGRAMS = {
  "text-left": [
    { kind: "copy", flex: 1.1 },
    { kind: "card", flex: 1 },
  ],
  "text-right": [
    { kind: "card", flex: 1 },
    { kind: "copy", flex: 1.1 },
  ],
  "text-center": [{ kind: "stack", flex: 1 }],
  split: [
    { kind: "copy", flex: 1 },
    { kind: "card", flex: 0.8 },
    { kind: "copy", flex: 1 },
  ],
  poster: [{ kind: "poster", flex: 1 }],
};

const PresetDiagram = ({ preset, active }) => {
  const theme = useTheme();
  const ink = active ? theme.palette.primary.main : theme.palette.text.disabled;
  const parts = PRESET_DIAGRAMS[preset] || PRESET_DIAGRAMS["text-left"];

  const line = (width) => (
    <Box sx={{ height: 3, width, borderRadius: 2, bgcolor: ink, opacity: 0.85 }} />
  );

  const copyBlock = (key, centred = false) => (
    <Box
      key={key}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        alignItems: centred ? "center" : "flex-start",
        justifyContent: "center",
      }}
    >
      {line("52%")}
      {line("86%")}
      {line("68%")}
    </Box>
  );

  const cardBlock = (key) => (
    <Box
      key={key}
      sx={{
        flex: 1,
        alignSelf: "stretch",
        borderRadius: 1,
        border: "1.5px solid",
        borderColor: ink,
        opacity: 0.85,
      }}
    />
  );

  return (
    <Box
      aria-hidden
      sx={{
        width: "100%",
        height: 46,
        display: "flex",
        gap: 0.75,
        alignItems: "center",
        px: 0.5,
      }}
    >
      {parts.map((part, i) => {
        if (part.kind === "copy") return copyBlock(i);
        if (part.kind === "card") return cardBlock(i);
        if (part.kind === "poster") {
          return (
            <Box
              key={i}
              sx={{
                flex: 1,
                alignSelf: "stretch",
                borderRadius: 1,
                border: "1.5px dashed",
                borderColor: ink,
                opacity: 0.85,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                pb: 0.75,
              }}
            >
              <Box
                sx={{ height: 6, width: "34%", borderRadius: 3, bgcolor: ink }}
              />
            </Box>
          );
        }
        // The centred stack. `alignItems: stretch` rather than `center`:
        // centring the cross axis would collapse the copy block to its content
        // width, and its rules are percentages OF that width — so they would be
        // percentages of nothing and the tile would draw an empty box.
        return (
          <Box
            key={i}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              alignItems: "stretch",
            }}
          >
            {copyBlock(`${i}-copy`, true)}
            <Box
              sx={{
                width: "38%",
                mx: "auto",
                height: 12,
                flexShrink: 0,
                borderRadius: 1,
                border: "1.5px solid",
                borderColor: ink,
                opacity: 0.85,
              }}
            />
          </Box>
        );
      })}
    </Box>
  );
};

const PresetPicker = ({ value, onChange, disabled }) => (
  <Grid container spacing={1.25}>
    {HERO_LAYOUTS.map((layout) => {
      const active = value === layout.value;
      return (
        <Grid item xs={6} sm={4} key={layout.value}>
          <Box
            component="button"
            type="button"
            disabled={disabled}
            onClick={() => onChange(layout.value)}
            aria-pressed={active}
            sx={(t) => ({
              width: "100%",
              p: 1,
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
              cursor: disabled ? "default" : "pointer",
              borderRadius: 1,
              border: "1px solid",
              borderColor: active ? "primary.main" : "divider",
              bgcolor: active
                ? alpha(t.palette.primary.main, 0.08)
                : "transparent",
              color: "text.primary",
              textAlign: "left",
              font: "inherit",
              transition: "border-color .16s, background-color .16s",
              "&:hover": {
                borderColor: disabled
                  ? "divider"
                  : alpha(t.palette.primary.main, 0.5),
              },
              "&.Mui-focusVisible, &:focus-visible": {
                outline: "none",
                boxShadow: t.palette.focusRing,
              },
            })}
          >
            <PresetDiagram preset={layout.value} active={active} />
            <Typography
              variant="caption"
              sx={{ fontWeight: active ? 700 : 500, lineHeight: 1.25 }}
            >
              {layout.label}
            </Typography>
          </Box>
        </Grid>
      );
    })}
  </Grid>
);

// ─── The composition editor ─────────────────────────────────────────────────
//
// ONE editor, rendered twice: once for the section default and once inside a
// slide's row. A slide's record is layered over the section's key by key, so a
// row that changes nothing but the preset keeps the section's alignment, plate
// and switches — which is why the fields below are the same fields at both
// levels and none of them has to be "unset".
const LayoutEditor = ({
  value,
  onChange,
  disabled = false,
  scope = "slide",
  kind = "product",
  background,
}) => {
  const isSection = scope === "section";
  const set = (patch) => onChange({ ...value, ...patch });
  const panel = resolveHeroPanel(background, value);
  const poster = value.preset === "poster";
  const onArt = hasHeroBackground(background);

  // The card's size is only a question while there IS a card: the `poster`
  // composition switches it off, and so can the switch below.
  const scale = value.mediaScale || {};
  const drawsCard = !poster && value.showMedia;
  const sizeOn = (device) => scale[device] ?? HERO_MEDIA_SCALE_DEFAULT;
  const sizedAlike = HERO_MEDIA_DEVICES.every(
    (d) => sizeOn(d.value) === sizeOn("desktop")
  );
  const setScale = (device, size) =>
    set({ mediaScale: { ...scale, [device]: size } });

  return (
    <Box sx={{ display: "grid", gap: 2.5 }}>
      <Box>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Composition
        </Typography>
        <PresetPicker
          value={value.preset}
          onChange={(preset) => set({ preset })}
          disabled={disabled}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
          {HERO_LAYOUTS.find((l) => l.value === value.preset)?.hint}
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="Text alignment"
            value={value.align}
            disabled={disabled}
            onChange={(e) => set({ align: e.target.value })}
            helperText={
              value.align === "auto"
                ? "Left, right or centred to suit the composition"
                : "Overrides the composition's own answer"
            }
          >
            {HERO_TEXT_ALIGNMENTS.map((a) => (
              <MenuItem key={a.value} value={a.value}>
                {a.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="Vertical position"
            value={value.vertical}
            disabled={disabled}
            onChange={(e) => set({ vertical: e.target.value })}
            helperText="Where the content sits in the band"
          >
            {HERO_VERTICAL_ALIGNMENTS.map((v) => (
              <MenuItem key={v.value} value={v.value}>
                {v.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="Ground"
            value={value.theme}
            disabled={disabled}
            onChange={(e) => set({ theme: e.target.value })}
            helperText={
              isSection
                ? "The band's own ground — the rest of the page is untouched"
                : "This slide's ground, over the section's"
            }
          >
            {(isSection ? HERO_THEMES : HERO_SLIDE_THEMES).map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="Ground under the copy"
            value={value.panel}
            disabled={disabled}
            onChange={(e) => set({ panel: e.target.value })}
            helperText={HERO_PANELS.find((p) => p.value === value.panel)?.hint}
          >
            {HERO_PANELS.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {value.panel !== "none" && (
          <Grid item xs={12}>
            <Typography variant="body2" gutterBottom>
              Strength of that ground
            </Typography>
            <Slider
              size="small"
              value={value.panelStrength}
              min={0}
              max={HERO_PANEL_MAX}
              step={5}
              disabled={disabled}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => (v === 0 ? "Auto" : `${v}%`)}
              onChange={(e, v) => set({ panelStrength: v })}
              aria-label="Strength of the ground under the copy"
            />
            <Typography variant="caption" color="text.secondary">
              {value.panelStrength === 0
                ? `Automatic — currently ${
                    onArt
                      ? panel.kind === "none"
                        ? "nothing, because the scrim and blur already carry the copy"
                        : `${panel.strength}%, computed from the scrim and the blur`
                      : "nothing, because there is no picture behind this slide"
                  }.`
                : "Set by hand. Drag back to 0 to let it follow the scrim again."}
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* ---- HOW BIG THE CARD IS, per device -------------------------------
          Three numbers rather than one, because the card is the element whose
          right size is a genuinely different answer on a 27" monitor, on a
          tablet and on a phone — and a single figure would have a merchant
          choosing which of the three to get wrong. What is stored is a
          PERCENTAGE of the size each composition was drawn at, so the
          storefront keeps its own widths (six compositions × three
          breakpoints) and a slide set to 120% is 120% of whichever of those
          eighteen numbers the visitor's screen lands on. */}
      {drawsCard && (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography variant="body2" fontWeight={600}>
              How big the card is
            </Typography>
            <Button
              size="small"
              disabled={disabled || sizedAlike}
              startIcon={<Icon icon="mdi:link-variant" />}
              onClick={() =>
                set({
                  mediaScale: {
                    desktop: sizeOn("desktop"),
                    tablet: sizeOn("desktop"),
                    mobile: sizeOn("desktop"),
                  },
                })
              }
            >
              Match the desktop size
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            100% is the size this composition was drawn at on that device. Above it
            the card takes room from the copy beside it; below it, the copy takes
            the room back.
          </Typography>
          <Grid container spacing={2.5}>
            {HERO_MEDIA_DEVICES.map((device) => {
              const size = sizeOn(device.value);
              return (
                <Grid item xs={12} sm={4} key={device.value}>
                  <Typography variant="caption" color="text.secondary">
                    {device.label} · {device.hint}
                  </Typography>
                  <Slider
                    size="small"
                    value={size}
                    min={HERO_MEDIA_SCALE_MIN}
                    max={HERO_MEDIA_SCALE_MAX}
                    step={5}
                    marks={[{ value: HERO_MEDIA_SCALE_DEFAULT }]}
                    disabled={disabled}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v}%`}
                    onChange={(e, v) => setScale(device.value, v)}
                    aria-label={`Card size on ${device.label.toLowerCase()}`}
                  />
                  <Typography
                    variant="caption"
                    color={
                      size === HERO_MEDIA_SCALE_DEFAULT ? "text.secondary" : "text.primary"
                    }
                  >
                    {size === HERO_MEDIA_SCALE_DEFAULT
                      ? "The designed size"
                      : `${size}% — ${
                          size > HERO_MEDIA_SCALE_DEFAULT ? "bigger" : "smaller"
                        } than designed`}
                  </Typography>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      <Divider />

      <Box>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          What this slide draws
        </Typography>
        <Grid container spacing={0.5}>
          {[
            {
              key: "showCopy",
              label: "The words",
              hint:
                kind === "custom"
                  ? "Eyebrow, headline, lines and marks"
                  : "Eyebrow, headline, price, lines and trust marks",
            },
            {
              key: "showMedia",
              label: kind === "custom" ? "The card" : "The product card",
              hint:
                kind === "custom"
                  ? "The picture you upload under “Card over the picture”"
                  : "The label plate on its glow",
            },
            {
              key: "showActions",
              label: "The buttons",
              hint:
                kind === "custom"
                  ? "Your two links — a poster with nothing but a button is a valid slide"
                  : "Explore and Add to Cart",
            },
          ].map((row) => (
            <Grid item xs={12} key={row.key}>
              <FormControlLabel
                sx={{ display: "flex", alignItems: "flex-start", m: 0 }}
                control={
                  <Switch
                    size="small"
                    checked={poster && row.key !== "showActions" ? false : value[row.key]}
                    disabled={disabled || (poster && row.key !== "showActions")}
                    onChange={(e) => set({ [row.key]: e.target.checked })}
                  />
                }
                label={
                  <Box sx={{ pt: 0.5 }}>
                    <Typography variant="body2">{row.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.hint}
                    </Typography>
                  </Box>
                }
              />
            </Grid>
          ))}
        </Grid>
        {poster && (
          <Alert severity="info" icon={<Icon icon="mdi:information-outline" />} sx={{ mt: 1.5 }}>
            The Poster composition is the words and the card switched off. Pick another
            composition above to bring either of them back.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

// ─── Background editor ───────────────────────────────────────────────────────
//
// ONE editor, rendered twice: once for the section-wide picture and once inside
// a slide's row. The wording changes with `scope`; the fields do not.
//
// THE FIRST FIELD IS THE WHOLE FEATURE. A merchant who pastes an image link and
// presses save has a working background — the scrim, the focal point and the
// blur all have designed answers, and they are folded away behind "Framing &
// scrim" so they never read as things that must be filled in first.
//
// LINKS, NOT FILE PICKERS, exactly as Products → Media works: assets live on
// Cloudinary (a Cloudinary link is delivered responsively — f_auto/q_auto and a
// srcset — and any other host is used as given), and the admin's job is to
// point at them. The preview beside each field is therefore the safety net: it
// renders the real asset from the real URL, so a mis-pasted link is visibly
// broken here rather than on the home page.
const BackgroundEditor = ({
  value,
  onChange,
  disabled = false,
  scope = "slide",
  panel,
}) => {
  const [open, setOpen] = useState(false);
  const isSection = scope === "section";
  const set = (patch) => onChange({ ...value, ...patch });
  const live = hasHeroBackground(value);

  const thumb = (url) => (
    <Box
      sx={{
        width: 84,
        height: 56,
        flexShrink: 0,
        borderRadius: 1,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "action.hover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.disabled",
      }}
    >
      {url ? (
        <Box
          component="img"
          src={url}
          alt=""
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <Icon icon="mdi:image-outline" style={{ fontSize: 22 }} />
      )}
    </Box>
  );

  const urlField = (field, label, helper) => (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      <TextField
        label={label}
        value={value[field]}
        onChange={(e) => set({ [field]: e.target.value })}
        fullWidth
        size="small"
        disabled={disabled}
        placeholder="https://..."
        helperText={helper}
      />
      {thumb(value[field])}
    </Box>
  );

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {urlField(
        "url",
        "Background image URL",
        isSection
          ? "One picture behind every slide that has not been given its own. Paste a link — nothing else here has to be filled in."
          : "This slide's own picture, in place of the section background. Paste a link — nothing else here has to be filled in."
      )}

      {urlField(
        "mobileUrl",
        "Phone image URL (optional)",
        "Used on screens up to 768px. Leave it blank and the picture above is used on every device."
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
        <Button
          size="small"
          onClick={() => setOpen((prev) => !prev)}
          startIcon={<Icon icon={open ? "mdi:chevron-up" : "mdi:tune-variant"} />}
          sx={{ color: "text.primary" }}
        >
          {open ? "Hide framing & scrim" : "Framing & scrim"}
        </Button>
        {!open && live && (
          <Typography variant="caption" color="text.secondary">
            {HERO_BACKGROUND_POSITIONS.find((p) => p.value === value.position)?.label} ·{" "}
            {value.overlay}% scrim
            {value.blur > 0 ? ` · ${value.blur}px blur` : ""}
            {panel && panel.kind !== "none"
              ? ` · ${panel.strength}% under the copy`
              : ""}
          </Typography>
        )}
        <Box sx={{ flex: 1 }} />
        {live && (
          <Button
            size="small"
            color="error"
            disabled={disabled}
            startIcon={<Icon icon="mdi:image-remove-outline" />}
            onClick={() => onChange({ ...DEFAULT_HERO_BACKGROUND })}
          >
            Remove picture
          </Button>
        )}
      </Box>

      <Collapse in={open} unmountOnExit>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Focal point"
              value={value.position}
              disabled={disabled}
              onChange={(e) => set({ position: e.target.value })}
              helperText={
                HERO_BACKGROUND_POSITIONS.find((p) => p.value === value.position)?.hint
              }
            >
              {HERO_BACKGROUND_POSITIONS.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" gutterBottom>
              Scrim over the picture
            </Typography>
            <Slider
              size="small"
              value={value.overlay}
              min={0}
              max={HERO_OVERLAY_MAX}
              step={5}
              disabled={disabled}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}%`}
              onChange={(e, v) => set({ overlay: v })}
              aria-label="Scrim over the picture"
            />
            <Typography variant="caption" color="text.secondary">
              How much of the picture is veiled. It is an artistic decision now, not a
              safety net: take it to 0 and the ground under the copy comes up to meet you,
              so the headline stays readable either way.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="body2" gutterBottom>
              Soft focus
            </Typography>
            <Slider
              size="small"
              value={value.blur}
              min={0}
              max={HERO_BLUR_MAX}
              step={1}
              disabled={disabled}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}px`}
              onChange={(e, v) => set({ blur: v })}
              aria-label="Soft focus"
            />
            <Typography variant="caption" color="text.secondary">
              Blurs a busy photograph so sharp type can sit on it. 0 leaves it as shot.
            </Typography>
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );
};

// ─── A poster's button ───────────────────────────────────────────────────────
// A label and a destination. Both blank is no button — which is the point: "a
// picture with one button on it" and "a picture with nothing on it" are both
// slides a merchant is allowed to ship.
const CtaFields = ({ value, onChange, disabled, label, helper }) => {
  const set = (patch) => onChange({ ...value, ...patch });
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={5}>
        <TextField
          fullWidth
          size="small"
          label={`${label} — button text`}
          value={value.label}
          disabled={disabled}
          onChange={(e) => set({ label: e.target.value })}
          placeholder="Shop the range"
          helperText={helper}
        />
      </Grid>
      <Grid item xs={12} sm={7}>
        <TextField
          fullWidth
          size="small"
          label={`${label} — link`}
          value={value.href}
          disabled={disabled}
          onChange={(e) => set({ href: e.target.value })}
          placeholder="/shop"
          helperText={
            value.href && !value.href.startsWith("/")
              ? "An off-site link — it will open in a new tab."
              : "A path on this site (/shop, /rituals) or a full https:// link."
          }
        />
      </Grid>
    </Grid>
  );
};

// ─── Live slide preview ──────────────────────────────────────────────────────
//
// The REAL composition, painted in the storefront's own ink. Everything it
// draws is decided by `utils/heroConfig` — the same functions the carousel
// calls — so the picture, its scrim, the plate under the copy, the layout, the
// alignment and the ground are what the home page will paint, not an
// impression of them.
//
// `device` switches between the desktop composition and the phone's single
// column (which also swaps in the phone's own picture, if one was given),
// because the two are genuinely different compositions and a merchant choosing
// "card centred, copy either side" should see what a phone does with it.
const SlidePreview = ({
  entry,
  index,
  total,
  formatPrice,
  eyebrowLabel,
  showEyebrow,
  device = "desktop",
}) => {
  const { kind, slide, product, background, layout, panel, theme } = entry;
  const ink = STOREFRONT_INK[theme] || STOREFRONT_INK.light;
  const mobile = device === "mobile";
  const isProduct = kind === "product";

  const backdropSrc = heroBackgroundSrc(background, mobile);
  const scrim = (weight) =>
    `rgba(${ink.bgRgb}, ${Math.min(1, (background.overlay / 100) * weight)})`;
  const plateAlpha = panel.strength / 100;

  const media = isProduct ? primaryImage(product) : null;
  const cardSrc = isProduct
    ? stageSrc(product, { w: 520, ar: "4:5" })
    : heroBackgroundSrc(slide.media, mobile);
  const drawCard = layout.showMedia && Boolean(cardSrc);

  const { known, price } = resolvePrice(product);
  const eyebrow = isProduct
    ? `${eyebrowLabel} · ${padIndex(index + 1)} / ${padIndex(total)}`
    : slide.eyebrow;
  const headline = isProduct ? previewHeadline(product) : slide.headline;
  const subtext = isProduct ? previewSubtext(product) : slide.subtext;
  const badges = isProduct
    ? Array.isArray(product?.badges)
      ? product.badges
      : []
    : slide.badges;

  const split = !mobile && layout.preset === "split";
  // On a phone the split's two blocks are stacked rather than either side of the
  // card, so both take the second column's alignment — exactly as the storefront
  // does (see `alignOf` in HeroCarousel).
  const alignA = resolveHeroAlign(layout, mobile ? "b" : "a");
  const alignB = resolveHeroAlign(layout, "b");
  const flexAlign = (a) =>
    a === "center" ? "center" : a === "end" ? "flex-end" : "flex-start";
  const textAlign = (a) => (a === "center" ? "center" : a === "end" ? "right" : "left");

  const centred = layout.preset === "text-center" || layout.preset === "poster";

  // THE CARD AT THE SIZE THE MERCHANT SET, in the preview's own scale. The
  // storefront multiplies each composition's designed width by the percentage
  // for the device; so does this, against the width this small picture of the
  // composition was drawn at — which is what makes dragging the slider visible
  // here rather than only on the live page.
  const cardScale =
    ((mobile ? layout.mediaScale?.mobile : layout.mediaScale?.desktop) ??
      HERO_MEDIA_SCALE_DEFAULT) / HERO_MEDIA_SCALE_DEFAULT;
  const cardWidth =
    Math.round((mobile ? 150 : centred ? 120 : split ? 130 : 180) * cardScale);

  // The grid, mirroring the stylesheet's presets. One column on the phone
  // preview, whatever the preset asks for on the desktop one — and the card's
  // column is the card's own width, capped at its share of the spread, exactly
  // as `--sf-hero-card-track` caps it on the storefront.
  const cardTrack = `min(${cardWidth}px, ${((split ? 28 : 47) * cardScale).toFixed(
    1
  )}%, ${split ? 50 : 66}%)`;
  const columns = mobile
    ? "minmax(0, 1fr)"
    : {
        "text-left": `minmax(0, 1fr) minmax(0, ${cardTrack})`,
        "text-right": `minmax(0, ${cardTrack}) minmax(0, 1fr)`,
        "text-center": "minmax(0, 1fr)",
        split: `minmax(0, 1fr) minmax(0, ${cardTrack}) minmax(0, 1fr)`,
        poster: "minmax(0, 1fr)",
      }[layout.preset] || `minmax(0, 1fr) minmax(0, ${cardTrack})`;
  const verticalAlign =
    layout.vertical === "top"
      ? "flex-start"
      : layout.vertical === "bottom"
      ? "flex-end"
      : "center";

  const button = (text, filled) => (
    <Box
      sx={{
        px: 1.5,
        py: 0.5,
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 999,
        whiteSpace: "nowrap",
        ...(filled
          ? { color: ink.goldInk, backgroundColor: ink.gold }
          : {
              color: ink.text,
              backgroundColor: ink.surface,
              border: `1px solid ${ink.gold}`,
            }),
      }}
    >
      {text}
    </Box>
  );

  const actionRow = layout.showActions && (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        flexWrap: "wrap",
        justifyContent: flexAlign(split ? alignB : alignA),
      }}
    >
      {isProduct ? (
        <>
          {button(exploreLabel(product), true)}
          {button(known ? "Add to Cart" : "Coming soon", false)}
        </>
      ) : (
        <>
          {hasHeroCta(slide.primaryCta) && button(slide.primaryCta.label, true)}
          {hasHeroCta(slide.secondaryCta) && button(slide.secondaryCta.label, false)}
        </>
      )}
    </Box>
  );

  const badgeRow = layout.showCopy && badges.length > 0 && (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        flexWrap: "wrap",
        justifyContent: flexAlign(split ? alignB : alignA),
      }}
    >
      {badges.slice(0, 4).map((badge) => (
        <Box
          key={badge}
          sx={{
            px: 0.75,
            py: 0.25,
            fontSize: 9.5,
            fontWeight: 600,
            borderRadius: 999,
            color: ink.gold,
            border: `1px solid ${ink.gold}`,
            backgroundColor: backdropSrc ? ink.bg : "transparent",
          }}
        >
          {badge}
        </Box>
      ))}
    </Box>
  );

  // The plate under the copy — the same three kinds the stylesheet draws.
  const panelSx =
    panel.kind === "glass" || panel.kind === "solid"
      ? {
          p: 1.5,
          borderRadius: 1.5,
          border: `1px solid ${ink.border}`,
          backgroundColor: `rgba(${ink.bgRgb}, ${Math.max(
            plateAlpha,
            panel.kind === "glass" ? 0.4 : plateAlpha
          )})`,
        }
      : panel.kind === "scrim"
      ? {
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: "-10px -14px",
            borderRadius: 3,
            zIndex: -1,
            background: `radial-gradient(124% 104% at 50% 50%, rgba(${ink.bgRgb}, ${plateAlpha}) 0%, rgba(${ink.bgRgb}, ${
              plateAlpha * 0.74
            }) 48%, rgba(${ink.bgRgb}, 0) 100%)`,
          },
        }
      : {};

  const copyColumn = (which) => {
    const first = !split || which === "a";
    const second = !split || which === "b";
    const align = which === "b" ? alignB : alignA;
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
          minWidth: 0,
          isolation: "isolate",
          alignItems: flexAlign(align),
          textAlign: textAlign(align),
          ...panelSx,
        }}
      >
        {first && layout.showCopy && showEyebrow && eyebrow && (
          <Typography
            sx={{
              fontSize: 9.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: ink.gold,
              fontWeight: 700,
            }}
          >
            {eyebrow}
          </Typography>
        )}
        {first && layout.showCopy && (
          <Typography
            sx={{
              fontWeight: 500,
              lineHeight: 1.15,
              fontSize: mobile ? 17 : 21,
              color: ink.text,
              maxWidth: centred ? "26ch" : "18ch",
            }}
          >
            {headline || (isProduct ? product?.name : slide.label) || "No headline"}
          </Typography>
        )}
        {first && layout.showCopy && isProduct && (
          known ? (
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: ink.gold }}>
              {formatPrice(price)}
            </Typography>
          ) : (
            <Typography sx={{ fontSize: 11, color: ink.secondary }}>
              Price on launch
            </Typography>
          )
        )}
        {second && layout.showCopy && subtext && (
          <Typography
            sx={{ fontSize: 11.5, color: ink.secondary, maxWidth: centred ? "56ch" : "40ch" }}
          >
            {subtext}
          </Typography>
        )}
        {second && badgeRow}
        {second && actionRow}
      </Box>
    );
  };

  const cardNode = drawCard && (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: cardWidth,
        mx: mobile || centred || split ? "auto" : layout.preset === "text-right" ? "0 auto" : 0,
        aspectRatio: mobile ? "1 / 1" : "4 / 5",
        borderRadius: 1.5,
        overflow: "hidden",
        border: `1px solid ${ink.border}`,
        backgroundColor: ink.plate,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        component="img"
        src={cardSrc}
        alt=""
        sx={{ width: "100%", height: "100%", objectFit: isProduct ? "contain" : "cover" }}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </Box>
  );

  const nothingDrawn =
    !layout.showCopy && !layout.showMedia && !layout.showActions;

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: ink.bg,
          width: mobile ? 300 : "100%",
          mx: mobile ? "auto" : 0,
          minHeight: mobile ? 380 : 240,
          display: "flex",
          alignItems: verticalAlign,
        }}
      >
        {backdropSrc && (
          <>
            <Box
              component="img"
              src={backdropSrc}
              alt=""
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: background.position,
                filter: background.blur > 0 ? `blur(${background.blur}px)` : "none",
                transform: background.blur > 0 ? "scale(1.08)" : "none",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: scrim(0.86),
                backgroundImage: `linear-gradient(to bottom, rgba(${ink.bgRgb}, ${
                  0.2 + (background.overlay / 100) * 0.4
                }) 0%, rgba(${ink.bgRgb}, 0) 24%), linear-gradient(to top, ${scrim(
                  0.45
                )} 0%, rgba(${ink.bgRgb}, 0) 40%)`,
              }}
            />
          </>
        )}

        <Box
          sx={{
            position: "relative",
            width: "100%",
            display: "grid",
            gridTemplateColumns: columns,
            justifyItems: centred || mobile ? "center" : "stretch",
            alignItems: "center",
            gap: mobile ? 1.5 : 2,
            p: { xs: 1.75, sm: 2.25 },
          }}
        >
          {nothingDrawn ? (
            <Box sx={{ textAlign: "center", py: 3 }}>
              <Chip
                size="small"
                variant="outlined"
                icon={<Icon icon="mdi:image-outline" />}
                label="The picture and nothing else"
              />
            </Box>
          ) : mobile ? (
            <>
              {cardNode}
              {copyColumn("a")}
            </>
          ) : layout.preset === "text-right" ? (
            <>
              {cardNode}
              {copyColumn("a")}
            </>
          ) : split ? (
            <>
              {copyColumn("a")}
              {cardNode}
              {copyColumn("b")}
            </>
          ) : (
            <>
              {copyColumn("a")}
              {cardNode}
            </>
          )}
        </Box>
      </Box>

      {isProduct && !media && layout.showMedia && (
        <Alert severity="warning" icon={<Icon icon="mdi:image-off-outline" />} sx={{ mt: 2 }}>
          This product has no primary image, so the slide opens without its label plate. Add
          one in Products → Media, or switch “The product card” off for this slide.
        </Alert>
      )}
    </Box>
  );
};

// ─── One slide in the list ───────────────────────────────────────────────────
const SlideRow = ({
  entry,
  index,
  total,
  copyDraft,
  dirty,
  busy,
  expanded,
  sectionHasBackground,
  onToggle,
  onPatch,
  onCopyChange,
  onMove,
  onRemove,
  onDuplicate,
}) => {
  const { kind, slide, product, background, layout, panel, theme } = entry;
  const isProduct = kind === "product";
  const media = isProduct ? primaryImage(product) : null;
  const thumbSrc = isProduct
    ? stageSrc(product, { w: 200, ar: "1:1" })
    : heroBackgroundSrc(slide.media, false) || heroBackgroundSrc(background, false);
  const label = isProduct
    ? product?.name || `Product #${slide.productId}`
    : slide.label || slide.headline || `Poster ${index + 1}`;
  const ownBackground = hasHeroBackground(normalizeHeroBackground(slide.background));
  const layoutLabel = HERO_LAYOUTS.find((l) => l.value === layout.preset)?.label;
  // The one combination that can still cost the copy its contrast: a picture
  // with no scrim, no blur AND no ground under the words.
  const risky =
    hasHeroBackground(background) &&
    layout.showCopy &&
    panel.kind === "none" &&
    background.overlay < 25 &&
    background.blur === 0;

  const setLayout = (next) => onPatch(slide.id, { layout: next });
  const setBackground = (next) => onPatch(slide.id, { background: next });
  const setSlide = (patch) => onPatch(slide.id, patch);

  return (
    <Card
      sx={{
        borderLeft: "3px solid",
        borderLeftColor: !slide.enabled
          ? "divider"
          : isProduct && !media && layout.showMedia
          ? "warning.main"
          : isProduct
          ? "primary.main"
          : "secondary.main",
        opacity: slide.enabled ? 1 : 0.6,
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          {/* Order controls */}
          <Grid item xs="auto">
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <IconButton
                size="small"
                disabled={index === 0 || busy}
                onClick={() => onMove(index, -1)}
                aria-label={`Move up: ${label}`}
              >
                <Icon icon="mdi:chevron-up" />
              </IconButton>
              <Typography variant="caption" color="primary.main" fontWeight={700}>
                {padIndex(index + 1)}
              </Typography>
              <IconButton
                size="small"
                disabled={index === total - 1 || busy}
                onClick={() => onMove(index, 1)}
                aria-label={`Move down: ${label}`}
              >
                <Icon icon="mdi:chevron-down" />
              </IconButton>
            </Box>
          </Grid>

          {/* Thumbnail */}
          <Grid item xs="auto">
            <Box
              sx={{
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                borderRadius: 1,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "action.hover",
                color: "text.disabled",
              }}
            >
              {thumbSrc ? (
                <Box
                  component="img"
                  src={thumbSrc}
                  alt=""
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: isProduct ? "contain" : "cover",
                  }}
                />
              ) : (
                <Icon
                  icon={isProduct ? "mdi:image-off-outline" : "mdi:image-outline"}
                  style={{ fontSize: 22 }}
                />
              )}
            </Box>
          </Grid>

          {/* Identity */}
          <Grid item xs md>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
              <Icon
                icon={isProduct ? "mdi:package-variant" : "mdi:image-text"}
                style={{ fontSize: 16, opacity: 0.7 }}
              />
              <Typography variant="subtitle2" fontWeight={700}>
                {label}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              <Chip size="small" variant="outlined" label={layoutLabel} />
              <Chip
                size="small"
                variant="outlined"
                color={theme === "dark" ? "secondary" : "default"}
                icon={
                  <Icon
                    icon={theme === "dark" ? "mdi:weather-night" : "mdi:weather-sunny"}
                  />
                }
                label={theme === "dark" ? "Dark ground" : "Light ground"}
              />
              {!isProduct && (
                <Chip size="small" color="secondary" variant="outlined" label="Poster" />
              )}
              {isProduct && product?.sku && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={product.sku}
                  sx={{ fontFamily: "monospace" }}
                />
              )}
              {isProduct && !media && layout.showMedia && (
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  icon={<Icon icon="mdi:image-off-outline" />}
                  label="No image — no label plate"
                />
              )}
              {ownBackground ? (
                <Chip
                  size="small"
                  color="info"
                  variant="outlined"
                  icon={<Icon icon="mdi:image-outline" />}
                  label="Own background"
                />
              ) : (
                sectionHasBackground && (
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<Icon icon="mdi:image-multiple-outline" />}
                    label="Section background"
                  />
                )
              )}
              {risky && (
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  icon={<Icon icon="mdi:contrast-circle" />}
                  label="Copy has no ground"
                />
              )}
              {!slide.enabled && (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<Icon icon="mdi:eye-off-outline" />}
                  label="Hidden"
                />
              )}
              {isProduct && product?.isActive === false && (
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  icon={<Icon icon="mdi:eye-off-outline" />}
                  label="Draft — not on the storefront"
                />
              )}
              {dirty && (
                <Chip
                  size="small"
                  color="info"
                  variant="outlined"
                  icon={<Icon icon="mdi:pencil-outline" />}
                  label="Unsaved"
                />
              )}
            </Box>
          </Grid>

          {/* Row actions */}
          <Grid item xs={12} md="auto">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "space-between", md: "flex-end" },
                gap: 0.5,
              }}
            >
              <Button
                size="small"
                onClick={() => onToggle(slide.id)}
                startIcon={<Icon icon={expanded ? "mdi:chevron-up" : "mdi:pencil-outline"} />}
                sx={{ color: "text.primary" }}
              >
                {expanded ? "Close" : "Edit slide"}
              </Button>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Tooltip title={slide.enabled ? "Hide this slide" : "Show this slide"}>
                  <span>
                    <IconButton
                      size="small"
                      aria-label={
                        slide.enabled ? `Hide slide: ${label}` : `Show slide: ${label}`
                      }
                      disabled={busy}
                      onClick={() => setSlide({ enabled: !slide.enabled })}
                    >
                      <Icon
                        icon={slide.enabled ? "mdi:eye-outline" : "mdi:eye-off-outline"}
                      />
                    </IconButton>
                  </span>
                </Tooltip>
                {!isProduct && (
                  <Tooltip title="Duplicate this poster">
                    <span>
                      <IconButton
                        size="small"
                        aria-label={`Duplicate: ${label}`}
                        disabled={busy}
                        onClick={() => onDuplicate(slide.id)}
                      >
                        <Icon icon="mdi:content-duplicate" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
                <Tooltip title={isProduct ? "Remove from the hero" : "Delete this poster"}>
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Remove from the hero: ${label}`}
                      onClick={() => onRemove(entry)}
                      disabled={busy}
                    >
                      <Icon icon="mdi:close-circle-outline" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </Grid>

          {/* The editor */}
          {expanded && (
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />

              {/* ---- COPY ------------------------------------------------- */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                <Icon icon="mdi:format-text" style={{ fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Words
                </Typography>
              </Box>

              {isProduct ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      label="Hero headline"
                      value={copyDraft.heroHeadline}
                      onChange={(e) =>
                        onCopyChange(product.id, "heroHeadline", e.target.value)
                      }
                      fullWidth
                      size="small"
                      helperText={
                        copyDraft.heroHeadline.trim()
                          ? "Saved on the product, like the rest of its copy."
                          : `Blank — the hero will print the product's promise: “${
                              product.promise || "nothing written yet"
                            }”`
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Hero subtext"
                      value={copyDraft.heroSubtext}
                      onChange={(e) =>
                        onCopyChange(product.id, "heroSubtext", e.target.value)
                      }
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      helperText={
                        copyDraft.heroSubtext.trim()
                          ? "One or two quiet lines under the price."
                          : "Blank — the hero will print the product's short description."
                      }
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Slide name (admin + slide index)"
                      value={slide.label}
                      onChange={(e) => setSlide({ label: e.target.value })}
                      fullWidth
                      size="small"
                      helperText="What this slide is called in this list and in the carousel's index."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Eyebrow (optional)"
                      value={slide.eyebrow}
                      onChange={(e) => setSlide({ eyebrow: e.target.value })}
                      fullWidth
                      size="small"
                      placeholder="New this season"
                      helperText="The small tracked line over the headline."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Headline (optional)"
                      value={slide.headline}
                      onChange={(e) => setSlide({ headline: e.target.value })}
                      fullWidth
                      size="small"
                      helperText="Leave it blank for a poster with no words on it at all."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Lines under the headline (optional)"
                      value={slide.subtext}
                      onChange={(e) => setSlide({ subtext: e.target.value })}
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ListEditor
                      value={slide.badges}
                      onChange={(badges) => setSlide({ badges })}
                      label="Marks (optional)"
                      helperText="Small pills under the copy — “Farmer-owned”, “Free delivery”."
                      placeholder="Farmer-owned"
                      addLabel="Add mark"
                      emptyText="No marks on this slide."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                      <Icon icon="mdi:gesture-tap-button" style={{ fontSize: 20 }} />
                      <Typography variant="subtitle2" fontWeight={700}>
                        Buttons
                      </Typography>
                    </Box>
                    <Box sx={{ display: "grid", gap: 2 }}>
                      <CtaFields
                        value={slide.primaryCta}
                        onChange={(primaryCta) => setSlide({ primaryCta })}
                        disabled={busy}
                        label="Main button"
                        helper="Both fields blank means no button."
                      />
                      <CtaFields
                        value={slide.secondaryCta}
                        onChange={(secondaryCta) => setSlide({ secondaryCta })}
                        disabled={busy}
                        label="Second button"
                        helper="Optional."
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Icon icon="mdi:card-outline" style={{ fontSize: 20 }} />
                      <Typography variant="subtitle2" fontWeight={700}>
                        Card over the picture
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 2 }}
                    >
                      Optional. A pack shot, a lockup or a device frame, drawn where the
                      composition puts the product card. Leave it blank for a poster with
                      nothing but its background.
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Card image URL"
                          value={slide.media.url}
                          onChange={(e) =>
                            setSlide({ media: { ...slide.media, url: e.target.value } })
                          }
                          fullWidth
                          size="small"
                          placeholder="https://..."
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone card image URL (optional)"
                          value={slide.media.mobileUrl}
                          onChange={(e) =>
                            setSlide({
                              media: { ...slide.media, mobileUrl: e.target.value },
                            })
                          }
                          fullWidth
                          size="small"
                          placeholder="https://..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Card image description"
                          value={slide.media.alt}
                          onChange={(e) =>
                            setSlide({ media: { ...slide.media, alt: e.target.value } })
                          }
                          fullWidth
                          size="small"
                          helperText="What the picture shows, for a shopper using a screen reader. Leave blank if it is pure decoration."
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* ---- COMPOSITION ------------------------------------------ */}
              <Divider sx={{ my: 2.5 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Icon icon="mdi:view-dashboard-variant-outline" style={{ fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Composition
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 2 }}
              >
                {slide.layout
                  ? "This slide's own composition. Anything you have not changed still follows Section settings."
                  : "This slide currently follows the section's composition. Change anything below and it becomes its own."}
              </Typography>
              <LayoutEditor
                value={layout}
                onChange={setLayout}
                disabled={busy}
                scope="slide"
                kind={kind}
                background={background}
              />

              {/* ---- BACKGROUND ------------------------------------------- */}
              <Divider sx={{ my: 2.5 }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Icon icon="mdi:image-outline" style={{ fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Background
                </Typography>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 2 }}
              >
                {ownBackground
                  ? "This slide's own picture. Remove it and the slide falls back to the section background."
                  : sectionHasBackground
                  ? "This slide currently shows the section background. Paste a link here to give it one of its own."
                  : "Paste an image link to put a picture behind this slide. Nothing else on this screen has to be filled in."}
              </Typography>
              <BackgroundEditor
                value={normalizeHeroBackground(slide.background)}
                onChange={setBackground}
                disabled={busy}
                scope="slide"
                panel={panel}
              />

              {risky && (
                <Alert
                  severity="warning"
                  icon={<Icon icon="mdi:contrast-circle" />}
                  sx={{ mt: 2 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => setLayout({ ...layout, panel: "auto", panelStrength: 0 })}
                    >
                      Fix it
                    </Button>
                  }
                >
                  This slide has a picture with almost no scrim, no blur and no ground under
                  the copy, so the headline is riding bare on the photograph. Set “Ground under
                  the copy” back to Automatic and it will size itself.
                </Alert>
              )}
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────
const AdminHeroSection = () => {
  const { formatPrice } = useStoreSettings();

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [device, setDevice] = useState("desktop");

  // The hero record, slide list included. This IS the editor's state: there is
  // one save, and it writes this.
  const [config, setConfig] = useState(() => normalizeHeroConfig(null));
  const [products, setProducts] = useState([]);
  // Hero copy per product id. It lives on the PRODUCT, not in the hero record,
  // so it is drafted separately and saved with `updateProduct`.
  const [copyDrafts, setCopyDrafts] = useState({});
  // What the server last confirmed, for dirty detection.
  const [baseline, setBaseline] = useState({ config: null, copy: {} });
  const [expandedId, setExpandedId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [toAdd, setToAdd] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [cfg, rows] = await Promise.all([
        apiService.admin.getHeroConfig().catch(() => null),
        apiService.admin.getProducts().catch(() => []),
      ]);
      const catalogue = Array.isArray(rows) ? rows : [];
      const normalized = normalizeHeroConfig(cfg);
      const heroProducts = catalogue
        .filter((p) => p.heroOrder != null)
        .sort(byHeroOrder);

      // The section's own legacy "picture only" switch becomes the Poster
      // composition, once, on the way in.
      const section = migrateLegacyPoster(normalized.background, normalized.layout);
      const seeded = {
        ...normalized,
        background: section.background,
        layout: normalizeHeroLayout(section.layout),
        slides: reconcileSlides(normalized.slides, heroProducts),
      };

      const copy = catalogue.reduce(
        (acc, product) => ({
          ...acc,
          [product.id]: {
            heroHeadline: product.heroHeadline || "",
            heroSubtext: product.heroSubtext || "",
          },
        }),
        {}
      );

      setConfig(seeded);
      setProducts(catalogue);
      setCopyDrafts(copy);
      setBaseline({ config: seeded, copy });
    } catch (error) {
      console.error("Error loading the hero:", error);
      toast("error", "Could not load the hero", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setCfg = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

  const byId = useMemo(
    () => new Map(products.map((p) => [String(p.id), p])),
    [products]
  );

  /** Products not yet in the carousel, for the "add" picker. */
  const rest = useMemo(() => {
    const used = new Set(
      config.slides
        .filter((s) => s.kind === "product")
        .map((s) => String(s.productId))
    );
    return products
      .filter((p) => !used.has(String(p.id)))
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }, [products, config.slides]);

  /**
   * THE RESOLVED CAROUSEL — one entry per slide, composed exactly as the
   * storefront will compose it. Every screen below reads this rather than the
   * raw records, which is what keeps the list's chips, the warnings and the
   * preview telling the same story.
   */
  const entries = useMemo(
    () =>
      config.slides.map((slide) => {
        const product =
          slide.kind === "product" ? byId.get(String(slide.productId)) || null : null;
        const drafted =
          product && copyDrafts[product.id]
            ? { ...product, ...copyDrafts[product.id] }
            : product;
        const background = resolveSlideBackground(slide, product, config);
        const layout = resolveHeroLayout(slide, config, background);
        return {
          key: slide.id,
          kind: slide.kind,
          slide,
          product: drafted,
          background,
          layout,
          theme: resolveHeroTheme(layout, config, slide.theme),
          panel: resolveHeroPanel(background, layout),
        };
      }),
    [config, byId, copyDrafts]
  );

  const sectionBackground = useMemo(
    () => normalizeHeroBackground(config.background),
    [config.background]
  );
  const sectionLayout = useMemo(() => normalizeHeroLayout(config.layout), [config.layout]);
  const sectionPanel = useMemo(
    () => resolveHeroPanel(sectionBackground, sectionLayout),
    [sectionBackground, sectionLayout]
  );

  // ── Warnings the screen will not let an admin ship quietly ────────────────
  const visible = entries.filter((e) => e.slide.enabled);

  const missingImages = visible.filter(
    (e) => e.kind === "product" && e.layout.showMedia && !primaryImage(e.product)
  ).length;

  const emptyPosters = visible.filter(
    (e) => e.kind === "custom" && !heroSlideHasContent(e.slide, e.background)
  ).length;

  const riskySlides = visible.filter(
    (e) =>
      hasHeroBackground(e.background) &&
      e.layout.showCopy &&
      e.panel.kind === "none" &&
      e.background.overlay < 25 &&
      e.background.blur === 0
  ).length;

  const dirtyCopyIds = useMemo(
    () =>
      Object.keys(copyDrafts).filter((id) => {
        const base = baseline.copy[id];
        if (!base) return false;
        return (
          copyDrafts[id].heroHeadline !== base.heroHeadline ||
          copyDrafts[id].heroSubtext !== base.heroSubtext
        );
      }),
    [copyDrafts, baseline.copy]
  );

  const configDirty = baseline.config
    ? !sameShape(config, baseline.config)
    : false;
  const dirty = configDirty || dirtyCopyIds.length > 0;

  /** Which product rows are showing unsaved copy, for the row chip. */
  const dirtySlideIds = useMemo(() => {
    const ids = new Set();
    const baseSlides = baseline.config?.slides || [];
    const baseById = new Map(baseSlides.map((s) => [s.id, s]));
    config.slides.forEach((slide, index) => {
      const base = baseById.get(slide.id);
      if (!base || !sameShape(slide, base) || baseSlides[index]?.id !== slide.id) {
        ids.add(slide.id);
      }
      if (slide.kind === "product" && dirtyCopyIds.includes(String(slide.productId))) {
        ids.add(slide.id);
      }
    });
    return ids;
  }, [config.slides, baseline.config, dirtyCopyIds]);

  // The preview follows the row being edited, then the first slide — an admin
  // should never have to hunt for the picture of what they are typing.
  const previewEntry = useMemo(() => {
    const chosen =
      entries.find((e) => e.slide.id === expandedId) ||
      entries.find((e) => e.slide.id === previewId);
    return chosen || entries[0] || null;
  }, [entries, expandedId, previewId]);

  const previewIndex = previewEntry
    ? entries.findIndex((e) => e.slide.id === previewEntry.slide.id)
    : 0;

  // ── Slide list edits ──────────────────────────────────────────────────────
  const patchSlide = (id, patch) =>
    setConfig((prev) => ({
      ...prev,
      slides: prev.slides.map((slide) =>
        slide.id === id
          ? // Normalised on the way in, so an out-of-range value can never
            // reach the record and the preview is always drawing what the
            // storefront would.
            normalizeHeroSlide({
              ...slide,
              ...patch,
              // A background with no picture is stored as `null`, which is what
              // "inherit the section's" means — so clearing the URL hands the
              // slide back to the section rather than pinning it to an empty
              // record.
              ...(patch.background !== undefined
                ? { background: backgroundToStore(normalizeHeroBackground(patch.background)) }
                : {}),
            })
          : slide
      ),
    }));

  const handleCopyChange = (id, field, value) =>
    setCopyDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { heroHeadline: "", heroSubtext: "" }), [field]: value },
    }));

  const handleMove = (index, direction) => {
    const target = index + direction;
    setConfig((prev) => {
      if (target < 0 || target >= prev.slides.length) return prev;
      const next = [...prev.slides];
      // Swap rather than splice: a swap is its own inverse, so an admin who
      // over-shoots gets back exactly where they were with the other arrow.
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, slides: next };
    });
  };

  const handleAddProduct = () => {
    if (!toAdd) return;
    const product = toAdd;
    setToAdd(null);
    setConfig((prev) => ({
      ...prev,
      slides: [
        ...prev.slides,
        normalizeHeroSlide({
          id: `product-${product.id}`,
          kind: "product",
          productId: product.id,
          background: hasHeroBackground(normalizeHeroBackground(product.heroBackground))
            ? normalizeHeroBackground(product.heroBackground)
            : null,
        }),
      ],
    }));
    toast("success", `${product.name} added`, "Press Save to publish the carousel.");
  };

  const handleAddPoster = () => {
    const poster = newPoster(config.slides.filter((s) => s.kind === "custom").length);
    setConfig((prev) => ({ ...prev, slides: [...prev.slides, poster] }));
    setExpandedId(poster.id);
    setPreviewId(poster.id);
  };

  const handleDuplicate = (id) => {
    setConfig((prev) => {
      const index = prev.slides.findIndex((s) => s.id === id);
      if (index < 0) return prev;
      const source = prev.slides[index];
      const copy = normalizeHeroSlide({
        ...source,
        id: newHeroSlideId(),
        label: `${source.label || "Poster"} copy`,
      });
      const next = [...prev.slides];
      next.splice(index + 1, 0, copy);
      return { ...prev, slides: next };
    });
  };

  const handleRemove = async (entry) => {
    const isProduct = entry.kind === "product";
    const name = isProduct
      ? entry.product?.name || "This product"
      : entry.slide.label || "This poster";
    const lastOne = config.slides.filter((s) => s.enabled).length === 1;
    const result = await Swal.fire({
      title: isProduct ? "Remove from the hero?" : "Delete this poster?",
      html: isProduct
        ? `<strong>${name}</strong> will keep its hero headline and subtext, but it will no longer open the home page.${
            lastOne
              ? "<br/><br/>It is the only slide — the home page will open on the brand slide until you add another."
              : ""
          }`
        : `<strong>${name}</strong> and everything on it will be deleted.${
            lastOne
              ? "<br/><br/>It is the only slide — the home page will open on the brand slide until you add another."
              : ""
          }`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: ADMIN_PALETTE.error.main,
      confirmButtonText: isProduct ? "Remove" : "Delete",
    });
    if (!result.isConfirmed) return;
    if (expandedId === entry.slide.id) setExpandedId(null);
    setConfig((prev) => ({
      ...prev,
      slides: prev.slides.filter((s) => s.id !== entry.slide.id),
    }));
  };

  // ── ONE SAVE ──────────────────────────────────────────────────────────────
  // The hero record (slide list included), the products' own `heroOrder` so the
  // rest of the admin agrees with it, and the hero copy of every product whose
  // words changed. In that order: the record is the thing the storefront reads,
  // so it is written first and a failure after it leaves the carousel correct.
  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = normalizeHeroConfig({
        ...config,
        background: normalizeHeroBackground(config.background),
        layout: normalizeHeroLayout(config.layout),
      });
      await apiService.admin.updateHeroConfig(payload);

      const productIds = payload.slides
        .filter((s) => s.kind === "product")
        .map((s) => s.productId);
      await apiService.admin.setHeroOrder(productIds);

      // updateProduct PUTs the whole record in mock mode — spread the product
      // the way AdminProducts does so nothing it does not manage is destroyed.
      const savedCopy = { ...baseline.copy };
      for (const id of dirtyCopyIds) {
        const product = byId.get(String(id));
        if (!product) continue;
        const heroHeadline = (copyDrafts[id]?.heroHeadline || "").trim();
        const heroSubtext = (copyDrafts[id]?.heroSubtext || "").trim();
        // eslint-disable-next-line no-await-in-loop
        await apiService.admin.updateProduct(product.id, {
          ...product,
          heroHeadline,
          heroSubtext,
        });
        savedCopy[id] = { heroHeadline, heroSubtext };
      }

      const savedDrafts = { ...copyDrafts };
      dirtyCopyIds.forEach((id) => {
        savedDrafts[id] = savedCopy[id];
      });

      setProducts((prev) =>
        prev.map((p) => {
          const position = productIds.findIndex((pid) => String(pid) === String(p.id));
          const heroOrder = position >= 0 ? position + 1 : null;
          const copy = savedCopy[p.id];
          return copy ? { ...p, ...copy, heroOrder } : { ...p, heroOrder };
        })
      );
      setConfig(payload);
      setCopyDrafts(savedDrafts);
      setBaseline({ config: payload, copy: savedCopy });
      toast("success", "Hero saved");
    } catch (error) {
      console.error("Error saving the hero:", error);
      toast("error", "Could not save the hero", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    const result = await Swal.fire({
      title: "Discard changes?",
      text: "Everything you have changed since the last save will be reloaded from the server.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: ADMIN_PALETTE.error.main,
      confirmButtonText: "Discard",
    });
    if (!result.isConfirmed) return;
    load();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const sectionHeader = (icon, title, description) => (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Icon icon={icon} style={{ fontSize: 22 }} />
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
      </Box>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
      )}
      <Divider sx={{ mb: 2.5 }} />
    </>
  );

  const renderSkeleton = () => (
    <Box sx={{ display: "grid", gap: 2 }}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} variant="rounded" height={112} />
      ))}
    </Box>
  );

  const previewPanel = (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, sm: 2.5 }, border: "1px solid", borderColor: "divider" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 0.5,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon icon="mdi:eye-outline" style={{ fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={700}>
            Live preview
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={device}
          onChange={(e, next) => next && setDevice(next)}
          aria-label="Preview width"
        >
          <ToggleButton value="desktop" aria-label="Desktop preview" sx={{ gap: 0.5, px: 1.25 }}>
            <Icon icon="mdi:monitor" />
            <Typography variant="caption" fontWeight={600}>
              Desktop
            </Typography>
          </ToggleButton>
          <ToggleButton value="mobile" aria-label="Phone preview" sx={{ gap: 0.5, px: 1.25 }}>
            <Icon icon="mdi:cellphone" />
            <Typography variant="caption" fontWeight={600}>
              Phone
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        The slide as the home page composes it — the picture and its scrim, the ground under
        the copy, the layout, the buttons and the band's own light or dark ground. On a phone
        every composition becomes one column, which is what the phone view shows.
      </Typography>
      {previewEntry ? (
        <SlidePreview
          entry={previewEntry}
          index={previewIndex < 0 ? 0 : previewIndex}
          total={entries.length}
          formatPrice={formatPrice}
          eyebrowLabel={config.eyebrowLabel}
          showEyebrow={config.showEyebrow}
          device={device}
        />
      ) : (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Add a slide to preview it.
          </Typography>
        </Box>
      )}
    </Paper>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ maxWidth: 760 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Home &amp; Hero
          </Typography>
          <Typography color="text.secondary">
            The opening band of the storefront home page. Its slides are your products and
            your own posters, in one order — and each of them carries its own composition
            (where the copy sits, where the card sits), its own picture, and its own light or
            dark ground.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {dirty && (
            <Button
              size="small"
              onClick={handleDiscard}
              disabled={saving}
              sx={{ color: "text.primary" }}
            >
              Discard
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || loading || !dirty}
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Icon icon="mdi:content-save" />
              )
            }
          >
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </Button>
        </Box>
      </Box>

      {!loading && !config.enabled && (
        <Alert
          severity="warning"
          icon={<Icon icon="mdi:eye-off-outline" />}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => setTab(1)}>
              Section settings
            </Button>
          }
        >
          The hero section is switched off — the home page currently opens straight into its
          first content section.
        </Alert>
      )}

      {!loading && config.enabled && visible.length === 0 && (
        <Alert severity="warning" icon={<Icon icon="mdi:alert-outline" />} sx={{ mb: 3 }}>
          There are no visible slides, so the home page opens on the brand slide. Add a
          product or a poster below.
        </Alert>
      )}

      {!loading && missingImages > 0 && (
        <Alert severity="warning" icon={<Icon icon="mdi:image-off-outline" />} sx={{ mb: 3 }}>
          {missingImages === 1
            ? "One product slide is drawing a card for a product with no primary image."
            : `${missingImages} product slides are drawing a card for a product with no primary image.`}{" "}
          Add one in Products → Media, or switch the card off for those slides.
        </Alert>
      )}

      {!loading && emptyPosters > 0 && (
        <Alert severity="warning" icon={<Icon icon="mdi:image-off-outline" />} sx={{ mb: 3 }}>
          {emptyPosters === 1
            ? "One poster has nothing on it and nothing behind it, so the carousel will skip it."
            : `${emptyPosters} posters have nothing on them and nothing behind them, so the carousel will skip them.`}
        </Alert>
      )}

      {!loading && riskySlides > 0 && (
        <Alert severity="warning" icon={<Icon icon="mdi:contrast-circle" />} sx={{ mb: 3 }}>
          {riskySlides === 1
            ? "One slide prints its copy over a picture with no scrim, no blur and no ground under the words."
            : `${riskySlides} slides print their copy over a picture with no scrim, no blur and no ground under the words.`}{" "}
          Set “Ground under the copy” to Automatic on those slides and it will size itself.
        </Alert>
      )}

      <Paper sx={{ mb: 3, border: "1px solid", borderColor: "divider" }} elevation={0}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
          }}
        >
          <Tab
            id="hero-tab-0"
            aria-controls="hero-tabpanel-0"
            icon={<Icon icon="mdi:view-carousel-outline" style={{ fontSize: 20 }} />}
            iconPosition="start"
            label={`Slides${loading ? "" : ` (${config.slides.length})`}`}
          />
          <Tab
            id="hero-tab-1"
            aria-controls="hero-tabpanel-1"
            icon={<Icon icon="mdi:tune-variant" style={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Section settings"
          />
        </Tabs>
      </Paper>

      {/* ── SLIDES ────────────────────────────────────────────────────────── */}
      {/* The two panels each sit in a real role="tabpanel", named by the tab
          above them (the pattern AdminSettings already uses). Without it the
          tabs announce as tabs that control nothing, and everything below them
          reads as loose page content. */}
      <div role="tabpanel" id="hero-tabpanel-0" aria-labelledby="hero-tab-0" hidden={tab !== 0}>
        {tab === 0 &&
          (loading ? (
            renderSkeleton()
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    mb: 2.5,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 1.5,
                    alignItems: { xs: "stretch", sm: "center" },
                  }}
                >
                  <Autocomplete
                    size="small"
                    sx={{ flex: 1 }}
                    options={rest}
                    value={toAdd}
                    onChange={(e, value) => setToAdd(value)}
                    getOptionLabel={(option) => option.name || ""}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderOption={(props, option) => (
                      <li {...props} key={option.id}>
                        {option.name}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Add a product slide"
                        placeholder="Search the catalogue"
                      />
                    )}
                    noOptionsText="Every product is already in the carousel"
                    disabled={saving}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Icon icon="mdi:plus" />}
                    onClick={handleAddProduct}
                    disabled={!toAdd || saving}
                    sx={{ flexShrink: 0 }}
                  >
                    Add product
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Icon icon="mdi:image-plus-outline" />}
                    onClick={handleAddPoster}
                    disabled={saving}
                    sx={{ flexShrink: 0 }}
                  >
                    Add poster
                  </Button>
                </Paper>

                {config.slides.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 4, sm: 6 },
                      textAlign: "center",
                      border: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    <Icon icon="mdi:view-carousel-outline" style={{ fontSize: 48, opacity: 0.4 }} />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      No slides yet
                    </Typography>
                    <Typography color="text.secondary">
                      Add a product above, or a poster — a picture with as much or as little
                      on it as you like.
                    </Typography>
                  </Paper>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      Read in this order, first slide first.
                      {dirty && " Nothing is live until you press Save."}
                    </Typography>
                    <Box sx={{ display: "grid", gap: 2 }}>
                      {entries.map((entry, index) => (
                        <SlideRow
                          key={entry.slide.id}
                          entry={entry}
                          index={index}
                          total={entries.length}
                          copyDraft={
                            copyDrafts[entry.product?.id] || {
                              heroHeadline: "",
                              heroSubtext: "",
                            }
                          }
                          dirty={dirtySlideIds.has(entry.slide.id)}
                          busy={saving}
                          expanded={expandedId === entry.slide.id}
                          sectionHasBackground={hasHeroBackground(sectionBackground)}
                          onToggle={(id) => {
                            setExpandedId((prev) => (prev === id ? null : id));
                            setPreviewId(id);
                          }}
                          onPatch={patchSlide}
                          onCopyChange={handleCopyChange}
                          onMove={handleMove}
                          onRemove={handleRemove}
                          onDuplicate={handleDuplicate}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Grid>

              {/* Live preview — sticky beside the list on a desktop, stacked
                  under it on a phone, where the list is the thing being worked
                  on. */}
              <Grid item xs={12} lg={5}>
                <Box sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>{previewPanel}</Box>
              </Grid>
            </Grid>
          ))}
      </div>

      {/* ── SECTION SETTINGS ──────────────────────────────────────────────── */}
      <div role="tabpanel" id="hero-tabpanel-1" aria-labelledby="hero-tab-1" hidden={tab !== 1}>
        {tab === 1 &&
          (loading ? (
            renderSkeleton()
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  These apply to the hero as a whole. The composition and the picture below
                  are the DEFAULTS every slide inherits — a slide that has been given its own
                  keeps it.
                </Typography>
              </Grid>

              {/* The default composition. First, because it is the setting that
                  decides what the whole carousel LOOKS like. */}
              <Grid item xs={12} lg={7}>
                <Card>
                  <CardContent>
                    {sectionHeader(
                      "mdi:view-dashboard-variant-outline",
                      "Default composition",
                      "Where the copy sits, where the card sits, how tall the band is, and which ground it is composed on. Every slide starts from this."
                    )}
                    <LayoutEditor
                      value={sectionLayout}
                      onChange={(next) => setCfg({ layout: normalizeHeroLayout(next) })}
                      disabled={saving}
                      scope="section"
                      kind="product"
                      background={sectionBackground}
                    />
                    <Divider sx={{ my: 2.5 }} />
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Band height"
                          value={config.height}
                          onChange={(e) => setCfg({ height: e.target.value })}
                          helperText={
                            HERO_HEIGHTS.find((h) => h.value === config.height)?.hint
                          }
                        >
                          {HERO_HEIGHTS.map((h) => (
                            <MenuItem key={h.value} value={h.value}>
                              {h.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Eyebrow over a product headline"
                          value={config.eyebrowLabel}
                          onChange={(e) => setCfg({ eyebrowLabel: e.target.value })}
                          disabled={!config.showEyebrow}
                          helperText="The slide's position is added after it — “… · 03 / 08”."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={config.showEyebrow}
                              onChange={(e) => setCfg({ showEyebrow: e.target.checked })}
                            />
                          }
                          label="Show the eyebrow line"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* A preview of the section defaults, so the two are read
                  together rather than one after the other. */}
              <Grid item xs={12} lg={5}>
                <Box sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>{previewPanel}</Box>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    {sectionHeader(
                      "mdi:image-outline",
                      "Default background",
                      "One picture behind every slide. A slide with a background of its own — set on the Slides tab — uses that instead."
                    )}
                    <BackgroundEditor
                      value={sectionBackground}
                      onChange={(next) => setCfg({ background: normalizeHeroBackground(next) })}
                      disabled={saving}
                      scope="section"
                      panel={sectionPanel}
                    />
                    {!hasHeroBackground(sectionBackground) && (
                      <Alert severity="info" icon={<Icon icon="mdi:information-outline" />} sx={{ mt: 2 }}>
                        No picture yet, so a slide without one of its own opens on the band's
                        own ground. Paste a link above and every such slide has a background;
                        nothing else needs to change.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Visibility + playback */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    {sectionHeader(
                      "mdi:play-circle-outline",
                      "Visibility & playback",
                      "Whether the hero shows at all, and how it moves between slides."
                    )}
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.enabled}
                          onChange={(e) => setCfg({ enabled: e.target.checked })}
                        />
                      }
                      label="Show the hero section on the storefront"
                    />
                    <FormControlLabel
                      sx={{ display: "flex" }}
                      control={
                        <Switch
                          checked={config.autoplay}
                          onChange={(e) => setCfg({ autoplay: e.target.checked })}
                        />
                      }
                      label="Advance slides automatically"
                    />
                    <FormControlLabel
                      sx={{ display: "flex", mb: 2 }}
                      control={
                        <Switch
                          checked={config.pauseOnHover}
                          disabled={!config.autoplay}
                          onChange={(e) => setCfg({ pauseOnHover: e.target.checked })}
                        />
                      }
                      label="Pause while the pointer is over the hero"
                    />
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Slide duration"
                          value={msToSeconds(config.intervalMs)}
                          disabled={!config.autoplay}
                          onChange={(e) => setCfg({ intervalMs: secondsToMs(e.target.value) })}
                          onBlur={() =>
                            setCfg({
                              intervalMs: clampInt(
                                config.intervalMs,
                                HERO_INTERVAL_MIN_MS,
                                HERO_INTERVAL_MAX_MS,
                                DEFAULT_HERO_CONFIG.intervalMs
                              ),
                            })
                          }
                          InputProps={{
                            endAdornment: <InputAdornment position="end">sec</InputAdornment>,
                          }}
                          inputProps={{ min: 3, max: 15, step: 0.5 }}
                          helperText="Between 3 and 15 seconds"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Transition"
                          value={config.transition}
                          onChange={(e) => setCfg({ transition: e.target.value })}
                          helperText={
                            HERO_TRANSITIONS.find((t) => t.value === config.transition)?.hint
                          }
                        >
                          {HERO_TRANSITIONS.map((t) => (
                            <MenuItem key={t.value} value={t.value}>
                              {t.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                    <Alert severity="info" icon={<Icon icon="mdi:human-cane" />} sx={{ mt: 2 }}>
                      Shoppers who ask their device for reduced motion always get a still first
                      slide, whatever is set here.
                    </Alert>
                  </CardContent>
                </Card>
              </Grid>

              {/* Chrome */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    {sectionHeader(
                      "mdi:gesture-tap-button",
                      "Controls",
                      "The furniture drawn around the slides."
                    )}
                    {[
                      {
                        key: "showControls",
                        label: "Slide selector hairlines",
                        hint: "The row of names that jumps between slides",
                      },
                      {
                        key: "showCounter",
                        label: "Slide counter",
                        hint: "The 01 — 08 marker beside the hairlines",
                      },
                      {
                        key: "showProgress",
                        label: "Autoplay progress bar",
                        hint: "A gold hairline that fills over the slide duration",
                      },
                      {
                        key: "showArrows",
                        label: "Previous / next arrows",
                        hint: "Extra arrow buttons in the control rail",
                      },
                      {
                        key: "showPause",
                        label: "Pause / play button",
                        hint:
                          "Required while autoplay is on — switching it off " +
                          "stops the hero autoplaying rather than leaving it " +
                          "unstoppable",
                      },
                    ].map((row) => (
                      <FormControlLabel
                        key={row.key}
                        sx={{ display: "flex", alignItems: "flex-start", mb: 1 }}
                        control={
                          <Switch
                            checked={config[row.key]}
                            disabled={row.key === "showCounter" && !config.showControls}
                            onChange={(e) => setCfg({ [row.key]: e.target.checked })}
                          />
                        }
                        label={
                          <Box sx={{ pt: 0.75 }}>
                            <Typography variant="body2">{row.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {row.hint}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ))}
      </div>
    </motion.div>
  );
};

export default AdminHeroSection;
