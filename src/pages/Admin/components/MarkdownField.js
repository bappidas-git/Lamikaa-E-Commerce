import React from "react";
import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
// The REAL renderer, so a preview cannot drift from the page. Imported from the
// file rather than through `components/ui`'s barrel: the barrel would pull all
// fifteen primitives (Drawer, Modal, VideoPlayer…) into the admin chunk for one
// component. It is styled by the global `--sf-*` tokens, which index.css
// declares on :root for the whole document, so it renders here exactly as it
// renders on /about — inside a neutral frame that says so.
import ContentBlocks from "../../../components/ui/ContentBlocks";

// =============================================================================
// MarkdownField + ContentHelp — the admin's markdown-lite editor
// =============================================================================
//
// Prompt 34. Three screens write the same kind of copy — Content (`body`,
// `text`, `story`, `intro`), Rituals (a ritual's `story`) and any block the
// content record grows later — and all three need the same two affordances:
//
//   • a textarea that can be flipped to a PREVIEW rendered by the storefront's
//     own <ContentBlocks>, so "what does `::steps` look like?" is answered here
//     rather than by publishing and looking;
//   • the grammar and the placeholder tokens on the screen, because neither is
//     guessable and both are small enough to print in full.
//
// Living in `pages/Admin/components/` beside Prompt 33's ListEditor and
// KeyValueListEditor keeps every admin editor in one place, and keeps one page
// from importing another page's module to borrow a control.
// =============================================================================

// The whole grammar — anything that is not one of these is a paragraph. Kept in
// step with `utils/contentBlocks.js`, which is the parser it describes.
export const CONTENT_GRAMMAR = [
  ["## Heading", "A section heading"],
  ["### Heading", "A sub-heading"],
  ["- item", "A bulleted list"],
  ["1. item", "A numbered list"],
  ["> quoted", "A pull quote"],
  ["---", "A dividing rule"],
  ["::callout Title … ::", "A highlighted aside, closed by a line of just ::"],
  ["::steps … ::", "A numbered stepper, one step per line"],
  ["**bold**", "Bold, anywhere in a line"],
  ["[label](/path)", "A link — /, #, mailto:, tel: or https:// only"],
];

// Straight from PLACEHOLDERS.md. A token is never a value to invent: it renders
// harmlessly and the owner fills it in when the fact is known.
export const CONTENT_TOKENS = [
  ["{{LAMIKAA_EMAIL}}", "Customer-care email"],
  ["{{LAMIKAA_PHONE}}", "Customer-care number"],
  ["{{LAMIKAA_ADDRESS}}", "Registered / contact address"],
  ["{{SUPPORT_HOURS}}", "Customer-care hours"],
  ["{{GSTIN}}", "GST registration number"],
  ["{{CIN}}", "Corporate Identification Number"],
  ["{{JURISDICTION}}", "The courts named in the Terms"],
  ["{{DISPATCH_SLA}}", "Dispatch / delivery time"],
  ["{{REFUND_TIMELINE}}", "Refund processing time"],
  ["{{RETURN_WINDOW_DAYS}}", "Return window, in days"],
  ["{{FREE_SHIPPING_THRESHOLD}}", "Free-shipping threshold"],
  ["{{SHELF_LIFE}}", "Period after opening / shelf life"],
];

const HelpColumn = ({ title, blurb, rows }) => (
  <Grid item xs={12} md={6}>
    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
      {title}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
      {blurb}
    </Typography>
    <Box sx={{ display: "grid", gap: 0.75 }}>
      {rows.map(([syntax, meaning]) => (
        <Box key={syntax} sx={{ display: "flex", gap: 1.5, alignItems: "baseline", flexWrap: "wrap" }}>
          <Typography
            variant="caption"
            sx={{ fontFamily: "monospace", color: "primary.main", minWidth: { sm: 178 } }}
          >
            {syntax}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {meaning}
          </Typography>
        </Box>
      ))}
    </Box>
  </Grid>
);

/** The grammar and the token cheat-sheet, side by side. */
export const ContentHelp = () => (
  <Grid container spacing={2}>
    <HelpColumn
      title="Formatting"
      blurb="Anything that is not one of these is a paragraph. A blank line ends one."
      rows={CONTENT_GRAMMAR}
    />
    <HelpColumn
      title="Placeholder tokens"
      blurb={
        "A token stands in for a fact nobody has confirmed yet. It is never printed raw — the " +
        "whole SENTENCE around it is dropped until the fact is known, so keep a token out of the " +
        "first sentence after a heading and out of the last sentence of a paragraph, or the " +
        "heading loses its title."
      }
      rows={CONTENT_TOKENS}
    />
  </Grid>
);

/**
 * A markdown-lite textarea with a Preview toggle.
 *
 * `previewing` / `onTogglePreview` are lifted so a screen can remember the state
 * per field (Content has several on one form) without this component keeping a
 * map of its own.
 */
const MarkdownField = ({
  label,
  value,
  onChange,
  previewing,
  onTogglePreview,
  helperText,
  minRows = 10,
}) => {
  const text = typeof value === "string" ? value : "";
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 0.5,
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>
        <Button
          size="small"
          startIcon={<Icon icon={previewing ? "mdi:pencil-outline" : "mdi:eye-outline"} />}
          onClick={onTogglePreview}
          sx={{ color: "text.primary" }}
        >
          {previewing ? "Edit" : "Preview"}
        </Button>
      </Box>

      {previewing ? (
        // The neutral frame: the storefront's own renderer, on the page's own
        // ground, framed so nobody mistakes it for part of the admin's chrome.
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "background.default",
            minHeight: 160,
          }}
        >
          {text.trim() ? (
            <ContentBlocks text={text} />
          ) : (
            <Typography variant="caption" color="text.secondary">
              Nothing written yet.
            </Typography>
          )}
        </Paper>
      ) : (
        <TextField
          value={text}
          onChange={(e) => onChange(e.target.value)}
          fullWidth
          size="small"
          multiline
          minRows={minRows}
          inputProps={{ "aria-label": label, style: { lineHeight: 1.7 } }}
        />
      )}

      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default MarkdownField;
