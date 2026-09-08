import React from "react";
import { Box, Button, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

// =============================================================================
// ListEditor — an ordered list of one-line strings
// =============================================================================
// Six product fields are plain string lists — benefits, howToUse, packClaims,
// suitableFor, badges — and every one of them used to be unreachable from the
// admin. They are all the same control, so they are one component: a row per
// entry, add at the bottom, remove at the right, move with the arrows.
//
// ORDER IS CONTENT for some of these lists (howToUse is a numbered procedure
// printed on the pack; benefits read as a rhythm) and incidental for others, so
// the arrows are always there and `ordered` only changes whether the row wears
// its number.
//
// BLANK ROWS ARE NOT AN ERROR while typing — a merchant clicks "Add" before
// they have the words. They are dropped on save (`cleanList` in AdminProducts),
// which is why nothing here validates anything.
// =============================================================================

const ListEditor = ({
  value,
  onChange,
  label,
  helperText,
  placeholder,
  ordered = false,
  addLabel = "Add item",
  multiline = false,
  action = null,
  emptyText = "Nothing here yet.",
}) => {
  const rows = Array.isArray(value) ? value : [];

  const emit = (next) => onChange(next);

  const setRow = (index, text) =>
    emit(rows.map((row, i) => (i === index ? text : row)));

  const addRow = () => emit([...rows, ""]);

  const removeRow = (index) => emit(rows.filter((_, i) => i !== index));

  // Swap rather than splice: a swap is its own inverse, so a merchant who
  // over-shoots gets back exactly where they were with the opposite arrow.
  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    emit(next);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
          mb: helperText ? 0.5 : 1,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          {action}
          <Button size="small" startIcon={<Icon icon="mdi:plus" />} onClick={addRow}>
            {addLabel}
          </Button>
        </Box>
      </Box>

      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          {helperText}
        </Typography>
      )}

      {rows.length === 0 ? (
        <Box
          sx={{
            p: 1.5,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {emptyText}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {rows.map((row, index) => (
            /* eslint-disable-next-line react/no-array-index-key */
            <Box key={index} sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
              {ordered && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ width: 20, textAlign: "right", mt: 1.25, flexShrink: 0 }}
                >
                  {index + 1}.
                </Typography>
              )}
              <TextField
                value={row}
                onChange={(e) => setRow(index, e.target.value)}
                size="small"
                fullWidth
                multiline={multiline}
                placeholder={placeholder}
                inputProps={{ "aria-label": `${label} ${index + 1}` }}
              />
              <Tooltip title="Move up">
                {/* A disabled IconButton drops its tooltip, so the span carries it. */}
                <span>
                  <IconButton
                    size="small"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${label} ${index + 1} up`}
                  >
                    <Icon icon="mdi:chevron-up" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move down">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => move(index, 1)}
                    disabled={index === rows.length - 1}
                    aria-label={`Move ${label} ${index + 1} down`}
                  >
                    <Icon icon="mdi:chevron-down" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeRow(index)}
                  aria-label={`Remove ${label} ${index + 1}`}
                >
                  <Icon icon="mdi:close" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ListEditor;
