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
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import apiService from "../../services/api";
import { ADMIN_GOLD_GRADIENT, ADMIN_PALETTE } from "../../theme/adminTheme";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import { primaryImage, resolvePrice, stageSrc } from "../../utils/product";
import {
  DEFAULT_HERO_BACKGROUND,
  DEFAULT_HERO_CONFIG,
  HERO_BACKGROUND_POSITIONS,
  HERO_BLUR_MAX,
  HERO_INTERVAL_MAX_MS,
  HERO_INTERVAL_MIN_MS,
  HERO_OVERLAY_MAX,
  HERO_TRANSITIONS,
  clampInt,
  hasHeroBackground,
  heroBackgroundSrc,
  isHeroBackgroundOnly,
  normalizeHeroBackground,
  normalizeHeroConfig,
  resolveHeroBackground,
} from "../../utils/heroConfig";

// =============================================================================
// Admin → Storefront → Home & Hero
// =============================================================================
//
// REBUILT BY PROMPT 34. The screen this replaces was scaffolding: the hero
// became product-driven in Prompt 14 but had no editor, so Prompt 07 pointed the
// old slide list at the `announcements` collection to keep the screen open and
// its data intact. Both halves of that arrangement are now gone — announcements
// have their own manager at /admin/announcements, and the slides are edited here
// as what they actually are: PRODUCTS.
//
// TWO TABS, TWO KINDS OF DECISION
//
//   HERO PRODUCTS   which products open the home page, in which order, and the
//                   two lines each of them prints. A product is a slide when it
//                   carries a `heroOrder`; its copy is its own `heroHeadline`
//                   and `heroSubtext`. Order is written with
//                   `admin.setHeroOrder(ids)` — one call that renumbers the list
//                   from 1 AND clears `heroOrder` on every product left out of
//                   it, so adding, reordering and removing are the same gesture
//                   and none of them can leave a stale position behind. The copy
//                   is saved per row with `admin.updateProduct`, spread over the
//                   product the way AdminProducts does, because the mock PUT
//                   replaces the whole record.
//
//   SECTION SETTINGS  the `heroConfig` singleton: the master toggle, autoplay
//                   and its timer, the transition, which chrome is drawn — and
//                   the SLIDE BACKGROUND every slide falls back to.
//
// BACKGROUNDS (added after the rebuild). The carousel had no artwork behind its
// slides and this screen had nowhere to put any. It now edits the picture at
// both levels, through ONE editor rendered twice:
//
//   • Section settings -> "Slide background"   one picture behind EVERY slide.
//   • Hero products -> a row -> "Background"   that slide's own, overriding it.
//
// ONLY THE URL IS A DECISION. Paste an image link and the slide has a
// background: the focal point, the scrim and the blur all have designed
// defaults, and they sit behind a disclosure so they are never in the way of
// the one field that matters. Everything the storefront does with those values
// lives in `utils/heroConfig` — this screen writes the record and previews it,
// it does not re-implement the rules.
//
//   A slide may also be told to show NOTHING BUT its picture ("Show the product
//   over the picture", switched off). The copy, the CTAs and the label plate
//   then step aside for that slide alone.
//
// THE PREVIEW IS THE REAL COMPOSITION, PAINTED IN THE ADMIN'S OWN PALETTE. It
// shows the label plate on its glow (the recorded crop, through `stageSrc`, so
// the pack is pulled out of the studio frame exactly as the storefront pulls
// it), then the eyebrow, headline, price, subtext, badges and the two CTAs. It
// imports NOTHING from the storefront's component tree — the admin has its own
// theme and must not read `--sf-*` tokens — so the two copy fallbacks below are
// restated here; `components/home/HeroCarousel` exports the originals and is the
// source of truth if they ever change.
//
// WHAT THE SCREEN REFUSES TO LET AN ADMIN SHIP QUIETLY
//   • a hero product with no primary image — `HeroCarousel` skips such a slide,
//     so the carousel would silently be one shorter than this list;
//   • an empty hero while the section is switched on — the storefront then opens
//     on its brand-only fallback slide;
//   • a headline or subtext left blank, which falls back to the product's
//     `promise` / `shortDescription` rather than to nothing.
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

const draftOf = (product) => ({
  heroHeadline: product?.heroHeadline || "",
  heroSubtext: product?.heroSubtext || "",
  // Always a complete record, so every field below can be a controlled input
  // whether or not this product has ever had a background.
  background: normalizeHeroBackground(product?.heroBackground),
});

/** Two background records, compared the way they are stored. */
const sameBackground = (a, b) =>
  Object.keys(DEFAULT_HERO_BACKGROUND).every((key) => a?.[key] === b?.[key]);

/** What actually reaches the product: a record, or nothing at all. A picture is
    what makes a background exist, so a row with no URL is stored as `null`
    rather than as a shelf of defaults on every product in the catalogue. */
const backgroundToStore = (background) =>
  hasHeroBackground(background) ? background : null;

// ─── Background editor ───────────────────────────────────────────────────────
//
// ONE editor, rendered twice: once for the section-wide picture and once inside
// a slide's row. The wording changes with `scope`; the fields do not.
//
// THE FIRST FIELD IS THE WHOLE FEATURE. A merchant who pastes an image link and
// presses save has a working background — the scrim, the focal point and the
// blur all have designed answers, and they are folded away behind "Framing &
// scrim" so they never read as things that must be filled in first. Everything
// under that disclosure is refinement.
//
// LINKS, NOT FILE PICKERS, exactly as Products -> Media works: assets live on
// Cloudinary (a Cloudinary link is delivered responsively — f_auto/q_auto and a
// srcset — and any other host is used as given), and the admin's job is to
// point at them. The preview beside each field is therefore the safety net: it
// renders the real asset from the real URL, so a mis-pasted link is visibly
// broken here rather than on the home page.
const BackgroundEditor = ({ value, onChange, disabled = false, scope = "slide" }) => {
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
            {value.showContent ? "" : " · background only"}
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
              How much of the picture is darkened so the headline, the price and the buttons
              stay readable. Below about 30% a bright photograph will fight the copy.
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

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              sx={{ display: "flex", alignItems: "flex-start", m: 0 }}
              control={
                <Switch
                  checked={value.showContent}
                  disabled={disabled || !live}
                  onChange={(e) => set({ showContent: e.target.checked })}
                />
              }
              label={
                <Box sx={{ pt: 0.75 }}>
                  <Typography variant="body2">Show the product over the picture</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Switched off, {isSection ? "a slide using this picture" : "this slide"} is the
                    picture and nothing else — no headline, no price, no buttons and no label
                    plate.
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>
      </Collapse>
    </Box>
  );
};

// ─── Live slide preview ──────────────────────────────────────────────────────
// A miniature of the real stage, in the admin's palette: the plate on its glow,
// then the copy column. Everything it prints is what the storefront will print,
// fallbacks included, so an empty headline shows the `promise` here too.
const SlidePreview = ({ product, index, total, formatPrice, background }) => {
  const media = primaryImage(product);
  const src = stageSrc(product, { w: 520, ar: "4:5" });
  const { known, price } = resolvePrice(product);
  const badges = Array.isArray(product?.badges) ? product.badges : [];
  const headline = previewHeadline(product);
  const subtext = previewSubtext(product);

  // The picture the storefront would resolve for this slide, framed the way the
  // storefront frames it: the same focal point, the same blur, and a scrim
  // built from the same multiples of the admin's own slider. The ink is the
  // admin's `background.default`, which is the storefront's ground colour too,
  // so what is previewed here is what will be painted there.
  const backdrop = background || DEFAULT_HERO_BACKGROUND;
  const backdropSrc = heroBackgroundSrc(backdrop, false);
  const scrim = (weight) => alpha("#0B0B0D", Math.min(1, (backdrop.overlay / 100) * weight));
  const backdropOnly = isHeroBackgroundOnly(backdrop);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 1,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
        p: { xs: 2, sm: 2.5 },
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
              objectPosition: backdrop.position,
              filter: backdrop.blur > 0 ? `blur(${backdrop.blur}px)` : "none",
              transform: backdrop.blur > 0 ? "scale(1.08)" : "none",
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
              bgcolor: scrim(0.55),
              backgroundImage: `linear-gradient(to right, ${scrim(0.95)} 0%, ${scrim(
                0.5
              )} 46%, ${alpha("#0B0B0D", 0)} 82%)`,
            }}
          />
        </>
      )}

      {backdropOnly && (
        <Box
          sx={{
            position: "relative",
            aspectRatio: "16 / 9",
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <Chip
            size="small"
            variant="outlined"
            icon={<Icon icon="mdi:image-outline" />}
            label="Background only — no copy, no plate"
          />
        </Box>
      )}

      <Grid
        container
        spacing={2}
        alignItems="center"
        sx={{ position: "relative", display: backdropOnly ? "none" : undefined }}
      >
        <Grid item xs={5} sm={4}>
          {/* The plate: the label crop on a soft gold wash, contained rather
              than cropped — a bottle is never sliced to fill a frame. */}
          <Box
            sx={{
              position: "relative",
              aspectRatio: "4 / 5",
              borderRadius: 1,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {src ? (
              <Box
                component="img"
                src={src}
                alt=""
                sx={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <Box sx={{ textAlign: "center", p: 1, color: "text.disabled" }}>
                <Icon icon="mdi:image-off-outline" style={{ fontSize: 28 }} />
                <Typography variant="caption" sx={{ display: "block" }}>
                  No image
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={7} sm={8}>
          <Typography
            sx={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "primary.main",
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            Black Rice Ritual · {padIndex(index + 1)} / {padIndex(total)}
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              lineHeight: 1.15,
              fontSize: { xs: 18, sm: 22 },
              // The real headline is capped at a short measure; keep the
              // preview honest about how much text fits.
              maxWidth: "18ch",
              mb: 0.75,
            }}
          >
            {headline || product?.name || "Untitled product"}
          </Typography>
          {known ? (
            <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
              {formatPrice(price)}
            </Typography>
          ) : (
            <Chip size="small" variant="outlined" label="Price on launch" />
          )}
          {subtext && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.75, maxWidth: "46ch" }}
            >
              {subtext}
            </Typography>
          )}
          {badges.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1.25 }}>
              {badges.map((badge) => (
                <Chip key={badge} size="small" variant="outlined" label={badge} />
              ))}
            </Box>
          )}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 0.5,
                color: "primary.contrastText",
                backgroundImage: ADMIN_GOLD_GRADIENT,
              }}
            >
              {exploreLabel(product)}
            </Box>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 0.5,
                border: "1px solid",
                borderColor: "divider",
                color: known ? "text.primary" : "text.disabled",
              }}
            >
              {known ? "Add to Cart" : "Coming soon"}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {!media && !backdropOnly && (
        <Alert
          severity="warning"
          icon={<Icon icon="mdi:image-off-outline" />}
          sx={{ mt: 2, position: "relative" }}
        >
          This product has no primary image, so the slide opens without its label plate. Add
          one in Products → Media.
        </Alert>
      )}
    </Box>
  );
};

// ─── One hero product in the list ────────────────────────────────────────────
const HeroProductRow = ({
  product,
  index,
  total,
  draft,
  dirty,
  busy,
  saving,
  expanded,
  sectionBackground,
  onToggle,
  onDraftChange,
  onBackgroundChange,
  onSave,
  onRevert,
  onMove,
  onRemove,
}) => {
  const media = primaryImage(product);
  const thumb = stageSrc(product, { w: 200, ar: "1:1" });
  const label = product.name || `Product #${product.id}`;
  // The row reads the DRAFT, not the saved product: a background someone is
  // still typing should already be described by the chips beside its name.
  const ownBackground = hasHeroBackground(draft.background);
  const backdropOnly = isHeroBackgroundOnly(draft.background);

  return (
    <Card sx={{ borderLeft: "3px solid", borderLeftColor: media ? "primary.main" : "warning.main" }}>
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
              {thumb ? (
                <Box
                  component="img"
                  src={thumb}
                  alt=""
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <Icon icon="mdi:image-off-outline" style={{ fontSize: 22 }} />
              )}
            </Box>
          </Grid>

          {/* Identity */}
          <Grid item xs md>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.25 }}>
              {label}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              {product.sku && (
                <Chip size="small" variant="outlined" label={product.sku} sx={{ fontFamily: "monospace" }} />
              )}
              {!media && !backdropOnly && (
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
                  icon={<Icon icon={backdropOnly ? "mdi:image-filter-hdr" : "mdi:image-outline"} />}
                  label={backdropOnly ? "Background only" : "Own background"}
                />
              ) : (
                hasHeroBackground(sectionBackground) && (
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<Icon icon="mdi:image-multiple-outline" />}
                    label="Section background"
                  />
                )
              )}
              {product.isActive === false && (
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
                  label="Unsaved changes"
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
                onClick={() => onToggle(product.id)}
                startIcon={<Icon icon={expanded ? "mdi:chevron-up" : "mdi:pencil-outline"} />}
                sx={{ color: "text.primary" }}
              >
                {expanded ? "Close" : "Edit slide"}
              </Button>
              <Tooltip title="Remove from the hero">
                <span>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label={`Remove from the hero: ${label}`}
                    onClick={() => onRemove(product)}
                    disabled={busy}
                  >
                    <Icon icon="mdi:close-circle-outline" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Grid>

          {/* Inline copy editor */}
          {expanded && (
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Hero headline"
                    value={draft.heroHeadline}
                    onChange={(e) => onDraftChange(product.id, "heroHeadline", e.target.value)}
                    fullWidth
                    size="small"
                    helperText={
                      draft.heroHeadline.trim()
                        ? "Keep it short — the stage sets it at about 18 characters a line."
                        : `Blank — the hero will print the product's promise: “${
                            product.promise || "nothing written yet"
                          }”`
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Hero subtext"
                    value={draft.heroSubtext}
                    onChange={(e) => onDraftChange(product.id, "heroSubtext", e.target.value)}
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    helperText={
                      draft.heroSubtext.trim()
                        ? "One or two quiet lines under the price."
                        : "Blank — the hero will print the product's short description."
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Icon icon="mdi:image-outline" style={{ fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Background
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    {ownBackground
                      ? "This slide's own picture. Remove it and the slide falls back to the section background."
                      : hasHeroBackground(sectionBackground)
                      ? "This slide currently shows the section background. Paste a link here to give it one of its own."
                      : "Paste an image link to put a picture behind this slide. Nothing else on this screen has to be filled in."}
                  </Typography>
                  <BackgroundEditor
                    value={draft.background}
                    onChange={(next) => onBackgroundChange(product.id, next)}
                    disabled={busy}
                    scope="slide"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => onSave(product)}
                      disabled={!dirty || saving || busy}
                      startIcon={
                        saving ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <Icon icon="mdi:content-save" />
                        )
                      }
                    >
                      {saving ? "Saving…" : "Save slide"}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => onRevert(product)}
                      disabled={!dirty || saving}
                      sx={{ color: "text.primary" }}
                    >
                      Revert
                    </Button>
                  </Box>
                </Grid>
              </Grid>
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
  const [busy, setBusy] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const [config, setConfig] = useState(() => normalizeHeroConfig(null));
  const [products, setProducts] = useState([]);
  // Draft copy per product id, so a half-typed headline survives a re-render and
  // an unsaved row is visibly unsaved rather than silently lost.
  const [drafts, setDrafts] = useState({});
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
      setConfig(normalizeHeroConfig(cfg));
      setProducts(catalogue);
      setDrafts(
        catalogue.reduce((acc, product) => ({ ...acc, [product.id]: draftOf(product) }), {})
      );
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

  // A product is a slide when it carries a hero position; the order IS the
  // position, so the list is sorted by it and never by anything else.
  const heroProducts = useMemo(
    () => products.filter((p) => p.heroOrder != null).sort(byHeroOrder),
    [products]
  );

  const rest = useMemo(
    () =>
      products
        .filter((p) => p.heroOrder == null)
        .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""))),
    [products]
  );

  const heroIds = useMemo(() => heroProducts.map((p) => p.id), [heroProducts]);

  // The preview follows the row being edited, then the first slide — an admin
  // should never have to hunt for the picture of what they are typing.
  const previewProduct = useMemo(() => {
    const chosen =
      heroProducts.find((p) => String(p.id) === String(expandedId)) ||
      heroProducts.find((p) => String(p.id) === String(previewId));
    return chosen || heroProducts[0] || null;
  }, [heroProducts, expandedId, previewId]);

  const previewIndex = previewProduct
    ? heroProducts.findIndex((p) => p.id === previewProduct.id)
    : 0;

  // The section-wide picture, live: the settings tab edits it in place, so the
  // rows and the preview follow an unsaved change straight away.
  const sectionBackground = useMemo(
    () => normalizeHeroBackground(config.background),
    [config.background]
  );

  /** The background this slide will actually be drawn with, drafts included. */
  const backgroundOf = useCallback(
    (product) =>
      resolveHeroBackground(
        { heroBackground: drafts[product?.id]?.background ?? product?.heroBackground },
        config
      ),
    [drafts, config]
  );

  // A slide with no primary image is only a problem while it is still drawing a
  // label plate — one showing nothing but its background has no plate to miss.
  const missingImages = useMemo(
    () =>
      heroProducts.filter((p) => !primaryImage(p) && !isHeroBackgroundOnly(backgroundOf(p)))
        .length,
    [heroProducts, backgroundOf]
  );

  const dirtyIds = useMemo(
    () =>
      heroProducts
        .filter((p) => {
          const draft = drafts[p.id];
          if (!draft) return false;
          return (
            draft.heroHeadline !== (p.heroHeadline || "") ||
            draft.heroSubtext !== (p.heroSubtext || "") ||
            !sameBackground(draft.background, normalizeHeroBackground(p.heroBackground))
          );
        })
        .map((p) => p.id),
    [heroProducts, drafts]
  );

  // ── The slide: its two lines and its picture ───────────────────────────────
  const handleDraftChange = (id, field, value) =>
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || draftOf(null)), [field]: value },
    }));

  const handleBackgroundChange = (id, background) =>
    setDrafts((prev) => ({
      ...prev,
      // Normalised on the way in, so an out-of-range value can never reach the
      // record and the preview is always drawing what the storefront would.
      [id]: { ...(prev[id] || draftOf(null)), background: normalizeHeroBackground(background) },
    }));

  const handleRevert = (product) =>
    setDrafts((prev) => ({ ...prev, [product.id]: draftOf(product) }));

  const handleSaveSlide = async (product) => {
    const draft = drafts[product.id] || draftOf(product);
    const heroHeadline = draft.heroHeadline.trim();
    const heroSubtext = draft.heroSubtext.trim();
    const background = normalizeHeroBackground(draft.background);
    const heroBackground = backgroundToStore(background);
    try {
      setSavingId(product.id);
      // updateProduct PUTs the whole record in mock mode — spread the product
      // the way AdminProducts does so nothing it does not manage is destroyed.
      await apiService.admin.updateProduct(product.id, {
        ...product,
        heroHeadline,
        heroSubtext,
        heroBackground,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, heroHeadline, heroSubtext, heroBackground } : p
        )
      );
      setDrafts((prev) => ({
        ...prev,
        [product.id]: { heroHeadline, heroSubtext, background },
      }));
      toast("success", "Slide saved");
    } catch (error) {
      console.error("Error saving the hero slide:", error);
      toast("error", "Could not save the slide", error.message);
    } finally {
      setSavingId(null);
    }
  };

  // ── Order ──────────────────────────────────────────────────────────────────
  // One write for every order change. `setHeroOrder` renumbers the list from 1
  // and clears `heroOrder` on everything left out of it, so adding, moving and
  // removing all go through here and none of them can strand a position.
  const writeOrder = async (orderedIds, { optimistic, message }) => {
    const before = products;
    setProducts(optimistic);
    try {
      setBusy(true);
      await apiService.admin.setHeroOrder(orderedIds);
      if (message) toast("success", message);
    } catch (error) {
      console.error("Error writing the hero order:", error);
      setProducts(before); // roll back to what the server still holds
      toast("error", "Could not save the hero order", error.message);
      load();
    } finally {
      setBusy(false);
    }
  };

  const applyOrder = (orderedIds) => {
    const position = new Map(orderedIds.map((id, i) => [String(id), i + 1]));
    return products.map((p) => ({ ...p, heroOrder: position.get(String(p.id)) ?? null }));
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= heroIds.length) return;
    const next = [...heroIds];
    [next[index], next[target]] = [next[target], next[index]];
    writeOrder(next, { optimistic: applyOrder(next) });
  };

  const handleAdd = () => {
    if (!toAdd) return;
    const next = [...heroIds, toAdd.id];
    setToAdd(null);
    writeOrder(next, {
      optimistic: applyOrder(next),
      message: `${toAdd.name} added to the hero`,
    });
  };

  const handleRemove = async (product) => {
    const lastOne = heroIds.length === 1;
    const result = await Swal.fire({
      title: "Remove from the hero?",
      html: `<strong>${product.name}</strong> will keep its hero headline, subtext and background, but it will no longer open the home page.${
        lastOne
          ? "<br/><br/>It is the only hero product — the home page will open on the brand slide until you add another."
          : ""
      }`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: ADMIN_PALETTE.error.main,
      confirmButtonText: "Remove",
    });
    if (!result.isConfirmed) return;
    const next = heroIds.filter((id) => id !== product.id);
    if (expandedId === product.id) setExpandedId(null);
    writeOrder(next, {
      optimistic: applyOrder(next),
      message: `${product.name} removed from the hero`,
    });
  };

  // ── Section settings ───────────────────────────────────────────────────────
  const setCfg = (patch) => setConfig((prev) => ({ ...prev, ...patch }));

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      // Normalise before sending so the record on disk is always in range,
      // whatever a half-typed number field held at the moment of saving.
      const payload = normalizeHeroConfig(config);
      await apiService.admin.updateHeroConfig(payload);
      setConfig(payload);
      toast("success", "Hero settings saved");
    } catch (error) {
      console.error("Error saving hero config:", error);
      toast("error", "Could not save the settings", error.message);
    } finally {
      setSavingConfig(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const sectionHeader = (icon, title, description) => (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Icon icon={icon} style={{ fontSize: 22 }} />
        <Typography variant="h6" component="h2">{title}</Typography>
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Home &amp; Hero
        </Typography>
        <Typography color="text.secondary">
          The opening band of the storefront home page. Its slides are the products themselves —
          choose which ones open the page, in which order, the two lines each of them prints and
          the picture behind them. One background link in Section settings dresses every slide;
          a slide can also carry its own, or show nothing but its picture.
        </Typography>
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
          The hero section is switched off — the home page currently opens straight into its first
          content section.
        </Alert>
      )}

      {!loading && config.enabled && heroProducts.length === 0 && (
        <Alert severity="warning" icon={<Icon icon="mdi:alert-outline" />} sx={{ mb: 3 }}>
          No product carries a hero position, so the home page opens on the brand slide. Add one
          below.
        </Alert>
      )}

      {!loading && missingImages > 0 && (
        <Alert severity="warning" icon={<Icon icon="mdi:image-off-outline" />} sx={{ mb: 3 }}>
          {missingImages === 1
            ? "One hero product has no primary image, so the carousel skips it."
            : `${missingImages} hero products have no primary image, so the carousel skips them.`}{" "}
          Add one in Products → Media.
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
            label={`Hero products${loading ? "" : ` (${heroProducts.length})`}`}
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

      {/* ── HERO PRODUCTS ─────────────────────────────────────────────────── */}
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
                    <TextField {...params} label="Add product to hero" placeholder="Search the catalogue" />
                  )}
                  noOptionsText="Every product is already in the hero"
                  disabled={busy}
                />
                <Button
                  variant="contained"
                  startIcon={<Icon icon="mdi:plus" />}
                  onClick={handleAdd}
                  disabled={!toAdd || busy}
                  sx={{ flexShrink: 0 }}
                >
                  Add to hero
                </Button>
              </Paper>

              {heroProducts.length === 0 ? (
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
                    No hero products yet
                  </Typography>
                  <Typography color="text.secondary">
                    Pick a product above to open the home page with it.
                  </Typography>
                </Paper>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    Read in this order, first slide first.
                    {dirtyIds.length > 0 &&
                      ` ${dirtyIds.length} row${
                        dirtyIds.length === 1 ? " has" : "s have"
                      } unsaved changes.`}
                  </Typography>
                  <Box sx={{ display: "grid", gap: 2 }}>
                    {heroProducts.map((product, index) => (
                      <HeroProductRow
                        key={product.id}
                        product={product}
                        index={index}
                        total={heroProducts.length}
                        draft={drafts[product.id] || draftOf(product)}
                        dirty={dirtyIds.includes(product.id)}
                        busy={busy}
                        saving={savingId === product.id}
                        expanded={expandedId === product.id}
                        sectionBackground={sectionBackground}
                        onToggle={(id) => {
                          setExpandedId((prev) => (prev === id ? null : id));
                          setPreviewId(id);
                        }}
                        onDraftChange={handleDraftChange}
                        onBackgroundChange={handleBackgroundChange}
                        onSave={handleSaveSlide}
                        onRevert={handleRevert}
                        onMove={handleMove}
                        onRemove={handleRemove}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Grid>

            {/* Live preview — sticky beside the list on a desktop, stacked under
                it on a phone, where the list is the thing being worked on. */}
            <Grid item xs={12} lg={5}>
              <Box sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
                <Paper
                  elevation={0}
                  sx={{ p: { xs: 2, sm: 2.5 }, border: "1px solid", borderColor: "divider" }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Icon icon="mdi:eye-outline" style={{ fontSize: 20 }} />
                    <Typography variant="subtitle2" fontWeight={700}>
                      Live preview
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                    The slide as the home page composes it — the background picture and its
                    scrim, the label crop, the copy, the price and the two CTAs. Blank copy
                    shows the fallback the storefront would print.
                  </Typography>
                  {previewProduct ? (
                    <SlidePreview
                      product={{
                        ...previewProduct,
                        // Preview the DRAFT, not the saved record: the point of a
                        // live preview is to answer "does this line fit?" before
                        // the save, not after it.
                        heroHeadline: (drafts[previewProduct.id] || draftOf(previewProduct))
                          .heroHeadline,
                        heroSubtext: (drafts[previewProduct.id] || draftOf(previewProduct))
                          .heroSubtext,
                      }}
                      // Same rule for the picture, and it resolves through the
                      // SECTION default — including one typed on the other tab
                      // and not yet saved.
                      background={backgroundOf(previewProduct)}
                      index={previewIndex < 0 ? 0 : previewIndex}
                      total={heroProducts.length}
                      formatPrice={formatPrice}
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
                        Add a product to the hero to preview it.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
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
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                mb: 3,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                These apply to the hero as a whole, whichever products are in it.
              </Typography>
              <Button
                variant="contained"
                onClick={handleSaveConfig}
                disabled={savingConfig}
                startIcon={
                  savingConfig ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Icon icon="mdi:content-save" />
                  )
                }
              >
                {savingConfig ? "Saving..." : "Save Changes"}
              </Button>
            </Box>

            <Grid container spacing={3}>
              {/* The picture behind every slide. First, because it is the one
                  setting on this tab that changes what the section LOOKS like
                  rather than how it behaves — and because it is the fastest way
                  to give the whole carousel artwork: one link, every slide. */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    {sectionHeader(
                      "mdi:image-outline",
                      "Slide background",
                      "One picture behind every slide. A slide with a background of its own — set on the Hero products tab — uses that instead."
                    )}
                    <BackgroundEditor
                      value={sectionBackground}
                      onChange={(next) => setCfg({ background: normalizeHeroBackground(next) })}
                      disabled={savingConfig}
                      scope="section"
                    />
                    {!hasHeroBackground(sectionBackground) && (
                      <Alert severity="info" icon={<Icon icon="mdi:information-outline" />} sx={{ mt: 2 }}>
                        No picture yet, so the hero opens on the page's own ground — which is
                        exactly how it looks today. Paste a link above and every slide has a
                        background; nothing else needs to change.
                      </Alert>
                    )}
                    {hasHeroBackground(sectionBackground) && !sectionBackground.showContent && (
                      <Alert severity="warning" icon={<Icon icon="mdi:eye-off-outline" />} sx={{ mt: 2 }}>
                        Every slide that uses this picture will show it ALONE — no headline, no
                        price, no buttons and no label plate. Switch “Show the product over the
                        picture” back on to bring the copy back.
                      </Alert>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                      Saved with the rest of this tab — press “Save Changes” above.
                    </Typography>
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
                        hint: "The row of rules that jumps between slides",
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
                        hint: "Extra arrow buttons at the stage edges",
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
          </>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminHeroSection;
