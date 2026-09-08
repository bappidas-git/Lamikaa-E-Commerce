import React, { useEffect, useState } from "react";
import {
  Accordion, AccordionDetails, AccordionSummary, Autocomplete, Box, Button, Chip,
  FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Select,
  Switch, TextField, Tooltip, Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import brand from "../../../config/brand";
import ListEditor from "./ListEditor";
import KeyValueListEditor from "./KeyValueListEditor";
import MediaManager from "./MediaManager";

// =============================================================================
// ProductFormSections — every field the storefront reads, in ten accordions
// =============================================================================
//
// Before this, the product form edited twenty of the fifty fields a LAMIKAA
// product carries. The other thirty — the hero copy, the ritual step, the
// benefits, the ingredients, the pack claims, the FAQs, the media — were
// seeded once by Prompt 06 and then unreachable: a merchant could not add a
// ninth product, and editing the eighth would have quietly dropped the half of
// the record the form did not know about. So this component's job is coverage
// first and layout second.
//
// FIFTY FIELDS ARE NOT A FORM, they are ten. Each accordion is one decision a
// merchant makes at one moment — "what is this thing", "what does it say",
// "what does it cost" — and only the first is open, so the dialog opens on
// something a person can read rather than on a wall. Sections carrying a
// validation error open themselves; nobody should have to hunt for the red.
//
// ORDER OF THE SECTIONS IS THE ORDER OF THE WORK: identity, story, price,
// stock, the editorial detail, the questions, the pictures, the variants, the
// switches, the metadata. It is also, deliberately, the order the PDP reads
// them back out in.
//
// THE FORM OWNS NOTHING. Every value comes from `form` and every edit goes
// straight back out through `setField` — AdminProducts holds the state, does
// the validation and builds the payload, because it is the one that knows the
// other products (unique slugs, unique hero positions).
// =============================================================================

/** Which accordion a save-time error belongs to, so it can open itself. */
const ERROR_SECTIONS = {
  name: "basic",
  slug: "basic",
  categoryIds: "basic",
  heroOrder: "story",
  price: "pricing",
  media: "media",
  mediaRows: "media",
  variantRows: "variants",
};

const Section = ({ id, title, count, expanded, onToggle, children }) => (
  <Accordion
    expanded={expanded}
    onChange={onToggle}
    disableGutters
    elevation={0}
    square
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      "&:not(:last-of-type)": { mb: 1 },
      "&::before": { display: "none" },
    }}
  >
    <AccordionSummary
      expandIcon={<Icon icon="mdi:chevron-down" />}
      aria-controls={`${id}-content`}
      id={`${id}-header`}
      sx={{ minHeight: 56, "& .MuiAccordionSummary-content": { alignItems: "center", gap: 1 } }}
    >
      {/* NOT A HEADING (Prompt 38). MUI maps `subtitle2` to an <h6> element by
          default, so this label — which lives INSIDE the summary's
          role="button" — was published as a level-6 heading directly under the
          page's h1: axe `heading-order`, and a heading nested in a button that
          no screen-reader outline should ever have listed. `component="span"`
          keeps the type and drops the false heading; the accordion still names
          itself through the button's own text. */}
      <Typography variant="subtitle2" component="span" fontWeight={700}>
        {title}
      </Typography>
      {count != null && (
        <Chip label={count} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
      )}
    </AccordionSummary>
    <AccordionDetails id={`${id}-content`} sx={{ pt: 0 }}>
      {children}
    </AccordionDetails>
  </Accordion>
);

const ProductFormSections = ({
  form,
  errors,
  setField,
  setDimension,
  setRitualStep,
  categories,
  concerns,
  currencySymbol,
  tagsInput,
  setTagsInput,
  onNameChange,
  onSlugBlur,
  clampNum,
  addVariant,
  updateVariant,
  removeVariant,
}) => {
  const [expanded, setExpanded] = useState({ basic: true });

  // A field can only be fixed once it is on screen.
  useEffect(() => {
    const open = {};
    Object.keys(errors || {}).forEach((key) => {
      const section = ERROR_SECTIONS[key];
      if (section) open[section] = true;
    });
    if (Object.keys(open).length) setExpanded((prev) => ({ ...prev, ...open }));
  }, [errors]);

  const toggle = (id) => (event, isExpanded) =>
    setExpanded((prev) => ({ ...prev, [id]: isExpanded }));

  const sectionProps = (id, title, count) => ({
    id,
    title,
    count,
    expanded: !!expanded[id],
    onToggle: toggle(id),
  });

  // ── Categories and concerns ───────────────────────────────────────────────
  // Only `kind: "products"` categories can be PICKED for a product; "rituals" is
  // a route target, not a shelf. A category seeded before `kind` existed counts
  // as a product shelf, which is what every category in db.json was.
  //
  // WHAT IS ALREADY ON THE RECORD IS SHOWN WHATEVER ITS KIND. An id the pick
  // list does not offer — a rituals category, one deleted since — is appended to
  // the options so it renders as its own chip: an Autocomplete cannot show a
  // value that is not an option, and a value it cannot show is one the next edit
  // silently deletes.
  const allCategories = categories || [];
  const pickableCategories = allCategories.filter((c) => (c.kind || "products") === "products");
  const categoryById = (id) =>
    allCategories.find((c) => String(c.id) === String(id)) || { id, name: `Category ${id}` };
  const selectedCategories = (form.categoryIds || []).map(categoryById);
  const categoryOptions = [
    ...pickableCategories,
    ...selectedCategories.filter(
      (c) => !pickableCategories.some((p) => String(p.id) === String(c.id))
    ),
  ];

  const setCategoryIds = (ids) => {
    // The primary is always a member of its own set — the storefront resolves
    // "which shelves is this on" from `categoryIds` alone.
    const next = [...ids];
    if (form.categoryId !== "" && form.categoryId != null &&
        !next.some((id) => String(id) === String(form.categoryId))) {
      next.unshift(form.categoryId);
    }
    setField("categoryIds", next);
  };

  const setPrimaryCategory = (value) => {
    setField("categoryId", value);
    if (value === "" || value == null) return;
    const current = form.categoryIds || [];
    if (!current.some((id) => String(id) === String(value))) {
      setField("categoryIds", [...current, value]);
    }
  };

  // Same rule for concerns: one the vocabulary no longer lists still shows as a
  // chip rather than vanishing from the record on the first save.
  const selectedConcerns = (form.concerns || []).map(
    (slug) => (concerns || []).find((c) => c.slug === slug) || { slug, name: slug }
  );
  const concernOptions = [
    ...(concerns || []),
    ...selectedConcerns.filter((c) => !(concerns || []).some((k) => k.slug === c.slug)),
  ];

  const detailCount =
    (form.benefits?.length || 0) +
    (form.keyIngredients?.length || 0) +
    (form.howToUse?.length || 0) +
    (form.packClaims?.length || 0) +
    (form.suitableFor?.length || 0) +
    (form.badges?.length || 0);

  return (
    <Box sx={{ pt: 1 }}>
      {/* ── Basic ──────────────────────────────────────────────────────── */}
      <Section {...sectionProps("basic", "Basic")}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Product Name *"
              value={form.name}
              onChange={onNameChange}
              fullWidth
              size="small"
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Short name"
              value={form.shortName}
              onChange={(e) => setField("shortName", e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. Face Wash"
              helperText="Used on cards and breadcrumbs"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Slug"
              value={form.slug}
              onChange={(e) => setField("slug", e.target.value)}
              onBlur={onSlugBlur}
              fullWidth
              size="small"
              error={!!errors.slug}
              helperText={errors.slug || "URL-friendly; auto-generated from the name"}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="SKU"
              value={form.sku}
              onChange={(e) => setField("sku", e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. LK-BR-XX-000"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Brand"
              value={form.brand}
              onChange={(e) => setField("brand", e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl size="small" fullWidth error={!!errors.categoryIds}>
              {/* `labelId` is what actually names the control for a screen
                  reader — the visible <InputLabel> alone leaves it unnamed. */}
              <InputLabel id="product-primary-category-label">Primary category</InputLabel>
              <Select
                labelId="product-primary-category-label"
                value={form.categoryId ?? ""}
                label="Primary category"
                onChange={(e) => setPrimaryCategory(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {pickableCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              size="small"
              options={categoryOptions}
              value={selectedCategories}
              onChange={(e, value) => setCategoryIds(value.map((c) => c.id))}
              getOptionLabel={(option) => option.name || ""}
              isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="All categories"
                  error={!!errors.categoryIds}
                  helperText={
                    errors.categoryIds ||
                    "Every shelf this product sits on. The primary category is always included."
                  }
                />
              )}
              noOptionsText="No categories found"
            />
          </Grid>
          <Grid item xs={12}>
            <Autocomplete
              multiple
              size="small"
              options={concernOptions}
              value={selectedConcerns}
              onChange={(e, value) => setField("concerns", value.map((c) => c.slug))}
              getOptionLabel={(option) => option.name || option.slug || ""}
              isOptionEqualToValue={(option, value) => option.slug === value.slug}
              renderOption={(props, option) => (
                <li {...props} key={option.slug}>
                  {option.name}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Concerns"
                  helperText="What this product is for — powers “shop by concern”."
                />
              )}
              noOptionsText="No concerns found"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Tags (comma separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. black rice, face wash, cleanser"
            />
          </Grid>
        </Grid>
      </Section>

      {/* ── Story ──────────────────────────────────────────────────────── */}
      <Section {...sectionProps("story", "Story")}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Promise"
              value={form.promise}
              onChange={(e) => setField("promise", e.target.value)}
              fullWidth
              size="small"
              helperText="One line, the product's whole argument. Read on the card and above the price."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Short Description"
              value={form.shortDescription}
              onChange={(e) => setField("shortDescription", e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Full Description"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Hero headline"
              value={form.heroHeadline}
              onChange={(e) => setField("heroHeadline", e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Hero position"
              type="number"
              value={form.heroOrder ?? ""}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setField("heroOrder", Number.isNaN(n) ? null : Math.min(99, Math.max(1, n)));
              }}
              fullWidth
              size="small"
              inputProps={{ min: 1, max: 99 }}
              error={!!errors.heroOrder}
              helperText={errors.heroOrder || "Blank = not in the home hero"}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Hero subtext"
              value={form.heroSubtext}
              onChange={(e) => setField("heroSubtext", e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" fontWeight={600}>
              Ritual step
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Where this product falls in a routine. Read by the rituals pages and the PDP.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Step order"
              type="number"
              value={form.ritualStep?.order ?? ""}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                setRitualStep("order", Number.isNaN(n) ? "" : Math.max(1, n));
              }}
              fullWidth
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Step label"
              value={form.ritualStep?.label ?? ""}
              onChange={(e) => setRitualStep("label", e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. Cleanse"
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Frequency"
              value={form.ritualStep?.frequency ?? ""}
              onChange={(e) => setRitualStep("frequency", e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. Morning and evening"
            />
          </Grid>
        </Grid>
      </Section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <Section {...sectionProps("pricing", "Pricing")}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={!!form.priceTBA}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setField("priceTBA", on);
                    // A price and a "no price yet" cannot both be true. Clearing
                    // it is the point: the storefront shows "Price on launch"
                    // and refuses to build a cart line.
                    if (on) setField("price", null);
                    else if (form.price == null) setField("price", 0);
                  }}
                />
              }
              label="Price to be announced"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              Shows “Price on launch” on the storefront and disables Add to Cart.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label={`Selling Price (${currencySymbol})`}
              type="number"
              value={form.price ?? ""}
              onChange={(e) => setField("price", clampNum(e.target.value))}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
              disabled={!!form.priceTBA}
              error={!!errors.price}
              helperText={errors.price}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Price source"
              value={form.priceSource}
              onChange={(e) => setField("priceSource", e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. packaging-mrp"
              helperText="Where this figure came from. Internal note; never shown to shoppers."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={`Compare-at Price (${currencySymbol})`}
              type="number"
              value={form.comparePrice}
              onChange={(e) => setField("comparePrice", clampNum(e.target.value))}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
              helperText="Strikethrough price"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={`Cost Price (${currencySymbol})`}
              type="number"
              value={form.costPrice}
              onChange={(e) => setField("costPrice", clampNum(e.target.value))}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
              helperText="For margin calculation"
            />
          </Grid>
        </Grid>
      </Section>

      {/* ── Inventory & shipping ───────────────────────────────────────── */}
      <Section {...sectionProps("inventory", "Inventory & shipping")}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Stock Quantity"
              type="number"
              value={form.stock}
              onChange={(e) => setField("stock", clampNum(e.target.value, { int: true }))}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Low Stock Threshold"
              type="number"
              value={form.lowStockThreshold}
              onChange={(e) =>
                setField("lowStockThreshold", clampNum(e.target.value, { int: true, fallback: 10 }))
              }
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Size"
              value={form.size}
              onChange={(e) => setField("size", e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. 200 ml"
              helperText="As printed on the pack"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Shipping weight (kg)"
              type="number"
              value={form.weight}
              onChange={(e) => setField("weight", clampNum(e.target.value))}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Length (cm)"
              type="number"
              value={form.dimensions.length}
              onChange={(e) => setDimension("length", clampNum(e.target.value))}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Width (cm)"
              type="number"
              value={form.dimensions.width}
              onChange={(e) => setDimension("width", clampNum(e.target.value))}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Height (cm)"
              type="number"
              value={form.dimensions.height}
              onChange={(e) => setDimension("height", clampNum(e.target.value))}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
          </Grid>
        </Grid>
      </Section>

      {/* ── Details ────────────────────────────────────────────────────── */}
      <Section {...sectionProps("details", "Details", detailCount)}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ListEditor
              label="Benefits"
              value={form.benefits}
              onChange={(v) => setField("benefits", v)}
              helperText="Cosmetic benefits only, in the order they should read."
              placeholder="e.g. Deeply cleanses"
              addLabel="Add benefit"
              emptyText="No benefits yet."
            />
          </Grid>
          <Grid item xs={12}>
            <KeyValueListEditor
              label="Key ingredients"
              value={form.keyIngredients}
              onChange={(v) => setField("keyIngredients", v)}
              keyField="name"
              valueField="benefit"
              keyLabel="Ingredient"
              valueLabel="What it does"
              keyPlaceholder="e.g. Black Rice"
              valuePlaceholder="e.g. antioxidant-rich"
              addLabel="Add ingredient"
              emptyText="No key ingredients yet."
            />
          </Grid>
          <Grid item xs={12}>
            <ListEditor
              label="How to use"
              value={form.howToUse}
              onChange={(v) => setField("howToUse", v)}
              helperText="One step per row, in order. Use the pack directions verbatim."
              placeholder="e.g. Apply on wet face."
              addLabel="Add step"
              ordered
              emptyText="No steps yet."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Full ingredients (INCI)"
              value={form.ingredientsList}
              onChange={(e) => setField("ingredientsList", e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={4}
              helperText="Copied from the pack, verbatim."
            />
          </Grid>
          <Grid item xs={12}>
            <ListEditor
              label="Pack claims"
              value={form.packClaims}
              onChange={(v) => setField("packClaims", v)}
              helperText="Printed on the pack, word for word. Shown only in “As printed on the pack”."
              placeholder="e.g. Enriched with Anti-Ageing Antioxidants"
              addLabel="Add claim"
              emptyText="No pack claims yet."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fragrance note"
              value={form.fragranceNote}
              onChange={(e) => setField("fragranceNote", e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. Mild sandalwood fragrance"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Caution"
              value={form.caution}
              onChange={(e) => setField("caution", e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
              helperText="From the pack, verbatim."
            />
          </Grid>
          <Grid item xs={12}>
            <ListEditor
              label="Suitable for"
              value={form.suitableFor}
              onChange={(v) => setField("suitableFor", v)}
              placeholder="e.g. All skin types — patch test recommended"
              addLabel="Add row"
              emptyText="Nothing yet."
            />
          </Grid>
          <Grid item xs={12}>
            <ListEditor
              label="Badges"
              value={form.badges}
              onChange={(v) => setField("badges", v)}
              helperText="Shown on the card and the product page. The brand defaults apply to every product."
              placeholder="e.g. Farmer to Consumer"
              addLabel="Add badge"
              emptyText="No badges — the card shows none."
              action={
                <Button
                  size="small"
                  startIcon={<Icon icon="mdi:backup-restore" />}
                  onClick={() => setField("badges", [...brand.trustBadges])}
                >
                  Reset to brand defaults
                </Button>
              }
            />
          </Grid>
        </Grid>
      </Section>

      {/* ── FAQs ───────────────────────────────────────────────────────── */}
      <Section {...sectionProps("faqs", "FAQs", form.faqs?.length || 0)}>
        <KeyValueListEditor
          label="Product questions"
          value={form.faqs}
          onChange={(v) => setField("faqs", v)}
          helperText="Read on this product's page, above the general answers."
          keyField="q"
          valueField="a"
          keyLabel="Question"
          valueLabel="Answer"
          keyPlaceholder="e.g. How often should I use it?"
          valuePlaceholder="Answer in the brand's voice."
          addLabel="Add question"
          valueMultiline
          emptyText="No product questions yet."
        />
      </Section>

      {/* ── Media ──────────────────────────────────────────────────────── */}
      <Section {...sectionProps("media", "Media", form.media?.length || 0)}>
        <MediaManager
          value={form.media}
          onChange={(v) => setField("media", v)}
          productName={form.name}
          errors={errors.mediaRows}
        />
      </Section>

      {/* ── Variants ───────────────────────────────────────────────────── */}
      <Section {...sectionProps("variants", "Variants", form.variants?.length || 0)}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1,
            mb: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Add options like size with their own price, stock &amp; SKU. Shown on the product page.
          </Typography>
          <Button
            size="small"
            startIcon={<Icon icon="mdi:plus" />}
            onClick={addVariant}
            sx={{ flexShrink: 0 }}
          >
            Add Variant
          </Button>
        </Box>
        {form.variants.length === 0 ? (
          <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              No variants — this product is sold as a single option.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {form.variants.map((v, idx) => (
              <Box
                key={v.id}
                sx={{ display: "flex", gap: 1, flexWrap: { xs: "wrap", md: "nowrap" }, alignItems: "flex-start" }}
              >
                <TextField
                  label={`Variant ${idx + 1} name`}
                  value={v.name}
                  onChange={(e) => updateVariant(idx, "name", e.target.value)}
                  size="small"
                  sx={{ flex: 2, minWidth: 150 }}
                  error={!!errors.variantRows?.[idx]}
                  helperText={errors.variantRows?.[idx]}
                  placeholder="e.g. 100 ml"
                />
                <TextField
                  label={`Price (${currencySymbol})`}
                  type="number"
                  value={v.price}
                  onChange={(e) => updateVariant(idx, "price", clampNum(e.target.value))}
                  size="small"
                  sx={{ flex: 1, minWidth: 100 }}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Stock"
                  type="number"
                  value={v.stock}
                  onChange={(e) => updateVariant(idx, "stock", clampNum(e.target.value, { int: true }))}
                  size="small"
                  sx={{ flex: 1, minWidth: 90 }}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="SKU"
                  value={v.sku}
                  onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                  size="small"
                  sx={{ flex: 1.5, minWidth: 120 }}
                />
                <Tooltip title="Remove variant">
                  <IconButton color="error" onClick={() => removeVariant(idx)} sx={{ mt: 0.25 }}>
                    <Icon icon="mdi:delete-outline" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
          </Box>
        )}
      </Section>

      {/* ── Visibility & flags ─────────────────────────────────────────── */}
      <Section {...sectionProps("flags", "Visibility & flags")}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControlLabel
            control={
              <Switch checked={form.isActive} onChange={(e) => setField("isActive", e.target.checked)} />
            }
            label="Active (visible on store)"
          />
          <FormControlLabel
            control={
              <Switch checked={form.featured} onChange={(e) => setField("featured", e.target.checked)} />
            }
            label="Featured"
          />
          <FormControlLabel
            control={<Switch checked={form.isNew} onChange={(e) => setField("isNew", e.target.checked)} />}
            label="New"
          />
          <FormControlLabel
            control={
              <Switch checked={form.trending} onChange={(e) => setField("trending", e.target.checked)} />
            }
            label="Trending"
          />
          <FormControlLabel
            control={<Switch checked={form.hot} onChange={(e) => setField("hot", e.target.checked)} />}
            label="Hot"
          />
        </Box>
      </Section>

      {/* ── SEO ────────────────────────────────────────────────────────── */}
      <Section {...sectionProps("seo", "SEO")}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Meta Title"
              value={form.metaTitle}
              onChange={(e) => setField("metaTitle", e.target.value)}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Meta Description"
              value={form.metaDescription}
              onChange={(e) => setField("metaDescription", e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </Section>
    </Box>
  );
};

export default ProductFormSections;
