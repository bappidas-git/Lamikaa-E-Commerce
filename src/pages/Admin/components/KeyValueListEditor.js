import React from "react";
import { Box, Button, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

// =============================================================================
// KeyValueListEditor — an ordered list of two-field rows
// =============================================================================
// `keyIngredients` is `[{ name, benefit }]` and `faqs` is `[{ q, a }]`. Same
// control, different field names, so the field names are props: `keyField` /
// `valueField` name the KEYS WRITTEN INTO THE RECORD, and getting them wrong
// would quietly rewrite the seed's shape. That is why they have no defaults.
//
// KEY ORDER IS PRESERVED on edit (`{ ...row, [field]: text }`), so a seeded
// `{ name, benefit }` round-trips as `{ name, benefit }` and not as
// `{ benefit, name }` — a diff nobody wants to read in db.json.
//
// Rows with both fields blank are dropped on save by AdminProducts, never here:
// a half-typed row must survive a re-render.
// =============================================================================

const KeyValueListEditor = ({
  value,
  onChange,
  label,
  helperText,
  keyField,
  valueField,
  keyLabel,
  valueLabel,
  keyPlaceholder,
  valuePlaceholder,
  addLabel = "Add row",
  valueMultiline = false,
  emptyText = "Nothing here yet.",
}) => {
  const rows = Array.isArray(value) ? value : [];

  const emit = (next) => onChange(next);

  const setField = (index, field, text) =>
    emit(rows.map((row, i) => (i === index ? { ...row, [field]: text } : row)));

  const addRow = () => emit([...rows, { [keyField]: "", [valueField]: "" }]);

  const removeRow = (index) => emit(rows.filter((_, i) => i !== index));

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
        <Button
          size="small"
          startIcon={<Icon icon="mdi:plus" />}
          onClick={addRow}
          sx={{ flexShrink: 0 }}
        >
          {addLabel}
        </Button>
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
            <Box
              /* eslint-disable-next-line react/no-array-index-key */
              key={index}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                flexWrap: { xs: "wrap", md: "nowrap" },
              }}
            >
              <TextField
                label={`${keyLabel} ${index + 1}`}
                value={row?.[keyField] ?? ""}
                onChange={(e) => setField(index, keyField, e.target.value)}
                size="small"
                placeholder={keyPlaceholder}
                sx={{ flex: 1, minWidth: 160 }}
              />
              <TextField
                label={valueLabel}
                value={row?.[valueField] ?? ""}
                onChange={(e) => setField(index, valueField, e.target.value)}
                size="small"
                placeholder={valuePlaceholder}
                multiline={valueMultiline}
                sx={{ flex: 2, minWidth: 200 }}
              />
              <Box sx={{ display: "flex", flexShrink: 0 }}>
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
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default KeyValueListEditor;
