import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Skeleton,
  Tooltip,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import apiService from "../../services/api";
import { ADMIN_PALETTE } from "../../theme/adminTheme";
import ListEditor from "./components/ListEditor";
// The markdown-lite textarea + <ContentBlocks> preview, and the grammar/token
// cheat-sheet beside it. Shared with Admin → Rituals, which writes the same kind
// of copy into `ritual.story`.
import MarkdownField, { ContentHelp } from "./components/MarkdownField";
import { notifySiteContentUpdated } from "../../hooks/useSiteContent";
import { isPlaceholder } from "../../utils/placeholders";

// =============================================================================
// Admin → Storefront → Content
// =============================================================================
//
// The editorial copy behind /about, /why-lamikaa, /contact, the four policies,
// the FAQ page's headings and the home page's own sections — one keyed record
// (`siteContent`), one section at a time, saved with
// `admin.updateSiteContent(key, data)`.
//
// THE FORM IS GENERATED FROM THE BLOCK'S SHAPE, not hard-coded per section.
// Five kinds cover the whole record and every kind is decided by the VALUE plus
// the field name:
//
//   string, long          `body` / `text` / `story` / `intro` — the markdown-lite
//                         fields — get a textarea and a Preview toggle that runs
//                         the copy through the real <ContentBlocks>
//   string, image URL     any `*image*` key — a field with a thumbnail beside it
//   string                everything else — a one-line TextField
//   string[]              ListEditor (Prompt 33), reused as-is
//   object[]              a repeatable sub-form per row, each row's fields
//                         rendered by the same rules one level down
//
// A key the record grows later needs no edit here: it renders by its shape. A
// value of a kind this screen cannot edit (a nested object, a number inside an
// array) is shown read-only rather than silently dropped on save.
//
// SAVING IS PER SECTION AND MERGES. `updateSiteContent` merges `data` into the
// stored section, so the `policies` and `home` sub-blocks — which the rail
// presents as their own entries — each save `{ [sub]: block }` into their
// parent key and cannot delete their siblings.
//
// TWO THINGS THE EDITOR REFUSES TO LET AN OWNER DO QUIETLY
//
//   1. THE LEGAL QUALIFIER (BRAND.md §3.9 rule 2). Wherever profits or dividends
//      are mentioned the copy must keep its qualifier — "subject to applicable
//      laws and the company's dividend declaration", or the equivalent wording
//      the brief itself uses. A block that mentions a dividend with no qualifier
//      left in it raises a warning in the editor AND a confirmation on save. It
//      is never blocked outright — the owner may be mid-rewrite — but it can
//      never happen silently, which is the guardrail.
//
//   2. AN UNRESOLVED TOKEN. `{{TOKENS}}` are legal in this copy and render
//      harmlessly, but PLACEHOLDERS.md's authoring rule binds where they may
//      sit: `stripPlaceholderSentences` removes a token's WHOLE SENTENCE, so a
//      token in the first sentence after a heading carries the heading's title
//      away with it, and one in a paragraph's last sentence takes the blank line
//      that separated the next heading. The cheat-sheet says so, and any block
//      carrying a token wears a chip that names it.
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

// ─── The rail ────────────────────────────────────────────────────────────────
// `key` is the `siteContent` key `updateSiteContent` is called with; `sub` is
// the property inside it when one record holds several editable blocks.
const SECTIONS = [
  {
    id: "about",
    group: "Pages",
    label: "About",
    icon: "mdi:information-outline",
    key: "about",
    where: "/about",
  },
  {
    id: "whyLamikaa",
    group: "Pages",
    label: "Why LAMIKAA",
    icon: "mdi:hand-heart-outline",
    key: "whyLamikaa",
    where: "/why-lamikaa",
  },
  {
    id: "impact",
    group: "Pages",
    label: "Impact",
    icon: "mdi:earth",
    key: "impact",
    where: "/about and /why-lamikaa",
  },
  {
    id: "contact",
    group: "Pages",
    label: "Contact",
    icon: "mdi:email-outline",
    key: "contact",
    where: "/contact",
  },
  {
    id: "faqPage",
    group: "Pages",
    label: "FAQ page",
    icon: "mdi:comment-question-outline",
    key: "faqPage",
    where: "/faq — its heading and its group names",
  },
  {
    id: "home.aboutTeaser",
    group: "Home page",
    label: "About teaser",
    icon: "mdi:card-text-outline",
    key: "home",
    sub: "aboutTeaser",
    where: "the home page's About band",
  },
  {
    id: "home.whyBlackRice",
    group: "Home page",
    label: "Why black rice",
    icon: "mdi:rice",
    key: "home",
    sub: "whyBlackRice",
    where: "the home page's ingredient spotlight",
  },
  {
    id: "home.fullPageCta",
    group: "Home page",
    label: "Full-page CTA",
    icon: "mdi:bullseye-arrow",
    key: "home",
    sub: "fullPageCta",
    where: "the home page's full-page call to action",
  },
  {
    id: "policies.privacy",
    group: "Policies",
    label: "Privacy",
    icon: "mdi:shield-lock-outline",
    key: "policies",
    sub: "privacy",
    where: "/policies/privacy",
  },
  {
    id: "policies.terms",
    group: "Policies",
    label: "Terms",
    icon: "mdi:gavel",
    key: "policies",
    sub: "terms",
    where: "/policies/terms",
  },
  {
    id: "policies.shippingReturns",
    group: "Policies",
    label: "Shipping & returns",
    icon: "mdi:truck-outline",
    key: "policies",
    sub: "shippingReturns",
    where: "/policies/shipping-returns",
  },
  {
    id: "policies.cookies",
    group: "Policies",
    label: "Cookies",
    icon: "mdi:cookie-outline",
    key: "policies",
    sub: "cookies",
    where: "/policies/cookies",
  },
];

const RAIL_GROUPS = ["Pages", "Home page", "Policies"];

// ─── Field classification ────────────────────────────────────────────────────

/** Markdown-lite fields: a textarea plus a Preview toggle. */
const MARKDOWN_FIELDS = new Set(["body", "text", "story", "intro"]);

/** Prose that is one paragraph, not a document: multiline, but no block grammar. */
const PLAIN_MULTILINE_FIELDS = new Set(["lede", "description", "tagline", "hoursNote"]);

const isImageField = (name) => /image|photo|thumbnail|logo/i.test(name);

// The record's three arrays-of-objects, named so an EMPTIED one is still edited
// as an object list. Shape alone cannot answer for `[]` — and the wrong answer
// would let a `ListEditor` write bare strings into `impact.items`, which every
// reader of that block would then choke on.
const OBJECT_LIST_FIELDS = new Set(["items", "pillars", "groups"]);

// What a new row in an emptied list starts from, when there is no row left to
// copy the shape off. Keyed by field name, and kept in step with `db.json`.
const OBJECT_LIST_TEMPLATES = {
  items: { key: "", title: "", image: "", points: [], body: "" },
  pillars: { key: "", title: "", text: "" },
  groups: { key: "", label: "" },
};

const kindOf = (name, value) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return OBJECT_LIST_FIELDS.has(name) ? "objectList" : "stringList";
    return value.every((row) => typeof row === "string") ? "stringList" : "objectList";
  }
  if (typeof value === "string") {
    if (MARKDOWN_FIELDS.has(name)) return "markdown";
    if (isImageField(name)) return "image";
    if (PLAIN_MULTILINE_FIELDS.has(name)) return "multiline";
    return "text";
  }
  return "readonly";
};

/** "heroImage" -> "Hero image"; "ctaTo" -> "Cta to". */
const humanise = (name) => {
  const spaced = String(name)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** Rows a new item in an object list starts from: the shape already in use,
    else the named template for that field. */
const templateFor = (rows, name) => {
  const first = rows.find((row) => row && typeof row === "object");
  if (!first) return OBJECT_LIST_TEMPLATES[name] ? { ...OBJECT_LIST_TEMPLATES[name] } : null;
  return Object.keys(first).reduce(
    (acc, key) => ({ ...acc, [key]: Array.isArray(first[key]) ? [] : "" }),
    {}
  );
};

// ─── The two content checks ──────────────────────────────────────────────────

const collectStrings = (value, out = []) => {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((row) => collectStrings(row, out));
  else if (value && typeof value === "object")
    Object.values(value).forEach((row) => collectStrings(row, out));
  return out;
};

const MENTIONS_DIVIDEND = /dividends?\b/i;

// The qualifier, in every wording BRAND.md and the seeded copy actually use.
// The canonical one is the first; the other two are how §3.4 and §3.7 phrase the
// same limitation, and a check that accepted only the canonical string would cry
// wolf on copy that has never been wrong — which is how a warning gets ignored.
const HAS_QUALIFIER =
  /subject to applicable laws|in accordance with applicable laws|dividend declaration|declared dividends?/i;

/**
 * Does this block promise a dividend with no qualifier left on it?
 * BRAND.md §3.9 rule 2 — never a guaranteed payout, a percentage or a figure.
 */
export const missingDividendQualifier = (block) => {
  const text = collectStrings(block).join("\n");
  return MENTIONS_DIVIDEND.test(text) && !HAS_QUALIFIER.test(text);
};

const blockHasPlaceholder = (block) => collectStrings(block).some(isPlaceholder);

// ─── Field controls ──────────────────────────────────────────────────────────

const ImageField = ({ label, value, onChange, helperText }) => (
  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
    <TextField
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      fullWidth
      size="small"
      placeholder="https://..."
      helperText={helperText}
    />
    <Box
      sx={{
        width: 72,
        height: 72,
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
      {value ? (
        <Box
          component="img"
          src={value}
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
  </Box>
);

const ObjectListEditor = ({ label, name, path, value, onChange, renderField }) => {
  const rows = Array.isArray(value) ? value : [];
  const template = templateFor(rows, name);

  const setRow = (index, next) =>
    onChange(rows.map((row, i) => (i === index ? next : row)));

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 1,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>
        <Tooltip
          title={template ? "" : "Nothing to copy the shape from — add the first row in db.json"}
        >
          <span>
            <Button
              size="small"
              startIcon={<Icon icon="mdi:plus" />}
              onClick={() => onChange([...rows, { ...template }])}
              disabled={!template}
            >
              Add row
            </Button>
          </span>
        </Tooltip>
      </Box>

      {rows.length === 0 ? (
        <Box sx={{ p: 1.5, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Nothing here yet.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {rows.map((row, index) => (
            <Paper
              /* eslint-disable-next-line react/no-array-index-key */
              key={index}
              elevation={0}
              sx={{ p: 2, border: "1px solid", borderColor: "divider" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1.5,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  {String(index + 1).padStart(2, "0")}
                  {row?.title || row?.label ? ` · ${row.title || row.label}` : ""}
                </Typography>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${label} ${index + 1} up`}
                  >
                    <Icon icon="mdi:chevron-up" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1}
                    aria-label={`Move ${label} ${index + 1} down`}
                  >
                    <Icon icon="mdi:chevron-down" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onChange(rows.filter((_, i) => i !== index))}
                    aria-label={`Remove ${label} ${index + 1}`}
                  >
                    <Icon icon="mdi:close" />
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: "grid", gap: 2 }}>
                {Object.keys(row || {}).map((field) =>
                  renderField({
                    name: field,
                    value: row[field],
                    path: `${path}.${index}.${field}`,
                    onChange: (next) => setRow(index, { ...row, [field]: next }),
                  })
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────
const AdminContent = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionId, setSectionId] = useState(SECTIONS[0].id);
  // One working copy per section, so switching in the rail never loses a
  // half-written paragraph and the rail can mark what is unsaved.
  const [drafts, setDrafts] = useState({});
  const [previewing, setPreviewing] = useState({});
  const [helpOpen, setHelpOpen] = useState(false);

  const blockAt = useCallback((record, section) => {
    const parent = record?.[section.key];
    const raw = section.sub ? parent?.[section.sub] : parent;
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const record = await apiService.admin.getSiteContent();
      const safe = record && typeof record === "object" ? record : {};
      setContent(safe);
      setDrafts(
        SECTIONS.reduce(
          (acc, section) => ({ ...acc, [section.id]: blockAt(safe, section) }),
          {}
        )
      );
    } catch (error) {
      console.error("Error loading site content:", error);
      toast("error", "Could not load the site content", error.message);
      setContent({});
    } finally {
      setLoading(false);
    }
  }, [blockAt]);

  useEffect(() => {
    load();
  }, [load]);

  const section = useMemo(
    () => SECTIONS.find((s) => s.id === sectionId) || SECTIONS[0],
    [sectionId]
  );

  const draft = drafts[sectionId] || {};
  const saved = useMemo(
    () => (content ? blockAt(content, section) : {}),
    [content, section, blockAt]
  );

  const dirtyIds = useMemo(() => {
    if (!content) return [];
    return SECTIONS.filter(
      (s) => JSON.stringify(drafts[s.id] ?? {}) !== JSON.stringify(blockAt(content, s))
    ).map((s) => s.id);
  }, [content, drafts, blockAt]);

  const dirty = dirtyIds.includes(sectionId);
  const qualifierMissing = missingDividendQualifier(draft);
  const hasToken = blockHasPlaceholder(draft);

  const setFieldValue = (name, value) =>
    setDrafts((prev) => ({ ...prev, [sectionId]: { ...(prev[sectionId] || {}), [name]: value } }));

  const togglePreview = (path) =>
    setPreviewing((prev) => ({ ...prev, [path]: !prev[path] }));

  const handleRevert = () =>
    setDrafts((prev) => ({ ...prev, [sectionId]: saved }));

  const handleSave = async () => {
    if (qualifierMissing) {
      const result = await Swal.fire({
        title: "The legal qualifier is missing",
        html:
          "This section mentions a <strong>dividend</strong> but no longer carries the qualifier that goes with it — " +
          "&ldquo;subject to applicable laws and the company&rsquo;s dividend declaration&rdquo;.<br/><br/>" +
          "LAMIKAA may never promise a guaranteed payout, a percentage or a figure. Save anyway?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: ADMIN_PALETTE.error.main,
        confirmButtonText: "Save anyway",
        cancelButtonText: "Go back and fix it",
      });
      if (!result.isConfirmed) return;
    }
    try {
      setSaving(true);
      // A sub-block saves `{ [sub]: block }` into its parent key, and
      // updateSiteContent MERGES — so the sibling policies (or the other two
      // home bands) are untouched by this write.
      const data = section.sub ? { [section.sub]: draft } : draft;
      await apiService.admin.updateSiteContent(section.key, data);
      setContent((prev) => {
        const base = prev && typeof prev === "object" ? prev : {};
        const parent = base[section.key] && typeof base[section.key] === "object" ? base[section.key] : {};
        return {
          ...base,
          [section.key]: section.sub ? { ...parent, [section.sub]: draft } : { ...parent, ...draft },
        };
      });
      // The storefront refetches on focus anyway; this reaches a storefront open
      // in the same tab without waiting for one.
      notifySiteContentUpdated();
      toast("success", `${section.label} saved`);
    } catch (error) {
      console.error("Error saving site content:", error);
      toast("error", "Could not save the section", error.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Field rendering ────────────────────────────────────────────────────────
  const renderField = ({ name, value, path, onChange }) => {
    const kind = kindOf(name, value);
    const label = humanise(name);

    if (kind === "markdown") {
      return (
        <Box key={path}>
          <MarkdownField
            label={label}
            value={value}
            onChange={onChange}
            previewing={!!previewing[path]}
            onTogglePreview={() => togglePreview(path)}
          />
        </Box>
      );
    }
    if (kind === "image") {
      return (
        <Box key={path}>
          <ImageField label={label} value={value} onChange={onChange} />
        </Box>
      );
    }
    if (kind === "multiline") {
      return (
        <TextField
          key={path}
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          size="small"
          multiline
          minRows={3}
        />
      );
    }
    if (kind === "text") {
      return (
        <TextField
          key={path}
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          size="small"
        />
      );
    }
    if (kind === "stringList") {
      return (
        <Box key={path}>
          <ListEditor
            value={value}
            onChange={onChange}
            label={label}
            multiline
            addLabel="Add line"
            emptyText="Nothing here yet."
          />
        </Box>
      );
    }
    if (kind === "objectList") {
      return (
        <Box key={path}>
          <ObjectListEditor
            label={label}
            name={name}
            path={path}
            value={value}
            onChange={onChange}
            renderField={renderField}
          />
        </Box>
      );
    }
    // Anything this editor cannot type into is shown rather than hidden: an
    // invisible field is one an owner cannot know they need a developer for.
    return (
      <Box key={path}>
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Not editable here — {JSON.stringify(value)}
        </Typography>
      </Box>
    );
  };

  const fields = Object.keys(draft);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Content
        </Typography>
        <Typography color="text.secondary">
          The editorial copy behind the storefront&rsquo;s pages. Saved one section at a time; a
          storefront left open picks the change up when you go back to it.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ── Rail ────────────────────────────────────────────────────────── */}
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
            <List dense disablePadding>
              {RAIL_GROUPS.map((group) => (
                <React.Fragment key={group}>
                  <ListSubheader
                    disableSticky
                    sx={{
                      bgcolor: "transparent",
                      lineHeight: "36px",
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      fontSize: 11,
                    }}
                  >
                    {group}
                  </ListSubheader>
                  {SECTIONS.filter((s) => s.group === group).map((s) => (
                    <ListItemButton
                      key={s.id}
                      selected={s.id === sectionId}
                      onClick={() => setSectionId(s.id)}
                      sx={{ pl: 2 }}
                    >
                      <Box sx={{ display: "flex", mr: 1.5, color: "text.secondary" }}>
                        <Icon icon={s.icon} style={{ fontSize: 20 }} />
                      </Box>
                      <ListItemText
                        primary={s.label}
                        primaryTypographyProps={{ variant: "body2", fontWeight: 500 }}
                      />
                      {dirtyIds.includes(s.id) && (
                        <Tooltip title="Unsaved changes">
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                              flexShrink: 0,
                            }}
                          />
                        </Tooltip>
                      )}
                    </ListItemButton>
                  ))}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* ── Editor ──────────────────────────────────────────────────────── */}
        <Grid item xs={12} md={9}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, border: "1px solid", borderColor: "divider" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "flex-start" },
                gap: 2,
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {section.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Read on {section.where}.
                </Typography>
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1 }}>
                  <Chip
                    size="small"
                    variant="outlined"
                    icon={<Icon icon="mdi:key-outline" />}
                    label={section.sub ? `${section.key}.${section.sub}` : section.key}
                    sx={{ fontFamily: "monospace" }}
                  />
                  {hasToken && (
                    <Chip
                      size="small"
                      color="warning"
                      variant="outlined"
                      icon={<Icon icon="mdi:code-braces" />}
                      label="Carries a placeholder"
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
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                <Button
                  size="small"
                  onClick={handleRevert}
                  disabled={!dirty || saving}
                  sx={{ color: "text.primary" }}
                >
                  Revert
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={!dirty || saving}
                  startIcon={
                    saving ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <Icon icon="mdi:content-save" />
                    )
                  }
                >
                  {saving ? "Saving…" : "Save section"}
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            {qualifierMissing && (
              <Alert severity="warning" icon={<Icon icon="mdi:scale-balance" />} sx={{ mb: 2.5 }}>
                <strong>The legal qualifier is missing.</strong> This section mentions a dividend
                without the wording that must travel with it — &ldquo;subject to applicable laws and
                the company&rsquo;s dividend declaration&rdquo;. Profits <em>can</em> reach member
                farmers; they are never promised.
              </Alert>
            )}

            {/* Help */}
            <Box sx={{ mb: 2.5 }}>
              <Button
                size="small"
                onClick={() => setHelpOpen((open) => !open)}
                startIcon={<Icon icon={helpOpen ? "mdi:chevron-up" : "mdi:help-circle-outline"} />}
                sx={{ color: "text.primary" }}
              >
                {helpOpen ? "Hide formatting help" : "Formatting & tokens"}
              </Button>
              {helpOpen && (
                <Paper
                  elevation={0}
                  sx={{
                    mt: 1.5,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                  }}
                >
                  <ContentHelp />
                </Paper>
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: "grid", gap: 2 }}>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} variant="rounded" height={72} />
                ))}
              </Box>
            ) : fields.length === 0 ? (
              <Alert severity="info" icon={<Icon icon="mdi:text-box-outline" />}>
                This section is empty. It is created the first time it is saved from here — but
                there are no fields to type into yet, so it is seeded in <code>db.json</code>.
              </Alert>
            ) : (
              <Box sx={{ display: "grid", gap: 2.5 }}>
                {fields.map((name) =>
                  renderField({
                    name,
                    value: draft[name],
                    path: `${sectionId}.${name}`,
                    onChange: (value) => setFieldValue(name, value),
                  })
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default AdminContent;
