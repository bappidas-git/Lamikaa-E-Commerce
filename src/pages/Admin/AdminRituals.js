import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import apiService from "../../services/api";
import { ADMIN_PALETTE } from "../../theme/adminTheme";
import MarkdownField, { ContentHelp } from "./components/MarkdownField";
import { ROUTES } from "../../utils/constants";

// =============================================================================
// Admin → Catalogue → Rituals
// =============================================================================
//
// A ritual is a ROUTINE BUILT OUT OF THE CATALOGUE: a name, a tagline, a story,
// a picture, and an ordered list of steps that each name a product. The
// storefront reads them at /rituals and /rituals/:slug, the home page teases
// them, and a PDP can point back at the ritual a product belongs to.
//
// STEPS ARE THE POINT, so the editor treats them as content rather than as a
// field: one row per step, the product chosen from the catalogue by
// Autocomplete (never typed as an id), an optional ALTERNATIVE product for the
// step ("or the bar, if you prefer"), a note and a frequency, and arrows to
// move a step without retyping it. `order` is written from the row's position on
// save, so it is always dense and always agrees with what the editor showed.
//
// THE SLUG IS A URL. It is generated from the name while creating and then left
// alone: /rituals/<slug> is linkable, and an edit that silently moved it would
// break every link to the page — so an existing slug is only ever changed on
// purpose, and the field says what that costs.
//
// The story is markdown-lite, edited with the same MarkdownField as Admin →
// Content, so `## headings`, `::steps` and the placeholder tokens behave
// identically wherever an owner writes copy.
//
// A DELETED RITUAL LEAVES ITS PRODUCTS ALONE. `steps[].productId` points AT the
// catalogue, not the other way round, so deleting a ritual is safe — it removes
// a page, never a product. That is why this screen has no in-use guard where
// Concerns and Categories do; the delete still goes through the safe-delete mock
// server, which removes exactly the addressed row and never cascades.
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

const slugify = (name) =>
  String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const EMPTY_STEP = {
  productId: null,
  alternativeProductId: null,
  note: "",
  frequency: "",
};

const EMPTY_FORM = {
  name: "",
  slug: "",
  tagline: "",
  story: "",
  image: "",
  duration: "",
  isActive: true,
  steps: [],
};

const bySortOrder = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

// ─── One step row ────────────────────────────────────────────────────────────
const StepRow = ({ step, index, total, products, onChange, onMove, onRemove }) => {
  const productOf = (id) => products.find((p) => String(p.id) === String(id)) || null;

  return (
    <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography variant="caption" color="primary.main" fontWeight={700}>
          Step {String(index + 1).padStart(2, "0")}
        </Typography>
        <Box>
          <IconButton
            size="small"
            onClick={() => onMove(index, -1)}
            disabled={index === 0}
            aria-label={`Move step ${index + 1} up`}
          >
            <Icon icon="mdi:chevron-up" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onMove(index, 1)}
            disabled={index === total - 1}
            aria-label={`Move step ${index + 1} down`}
          >
            <Icon icon="mdi:chevron-down" />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => onRemove(index)}
            aria-label={`Remove step ${index + 1}`}
          >
            <Icon icon="mdi:close" />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            size="small"
            options={products}
            value={productOf(step.productId)}
            onChange={(e, value) => onChange(index, { ...step, productId: value ? value.id : null })}
            getOptionLabel={(option) => option.name || ""}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.name}
              </li>
            )}
            renderInput={(params) => <TextField {...params} label="Product *" />}
            noOptionsText="No products found"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            size="small"
            options={products}
            value={productOf(step.alternativeProductId)}
            onChange={(e, value) =>
              onChange(index, { ...step, alternativeProductId: value ? value.id : null })
            }
            getOptionLabel={(option) => option.name || ""}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.name}
              </li>
            )}
            renderInput={(params) => (
              <TextField {...params} label="Or, instead" placeholder="Optional alternative" />
            )}
            noOptionsText="No products found"
          />
        </Grid>
        <Grid item xs={12} sm={7}>
          <TextField
            label="Note"
            value={step.note || ""}
            onChange={(e) => onChange(index, { ...step, note: e.target.value })}
            fullWidth
            size="small"
            placeholder="e.g. Begin with a clean slate"
          />
        </Grid>
        <Grid item xs={12} sm={5}>
          <TextField
            label="Frequency"
            value={step.frequency || ""}
            onChange={(e) => onChange(index, { ...step, frequency: e.target.value })}
            fullWidth
            size="small"
            placeholder="e.g. Morning and evening"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────
const AdminRituals = () => {
  const fullScreenDialog = useMediaQuery("(max-width:899.95px)");

  const [rituals, setRituals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [storyPreview, setStoryPreview] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [rows, catalogue] = await Promise.all([
        apiService.admin.getRituals().catch(() => []),
        apiService.admin.getProducts().catch(() => []),
      ]);
      setRituals((Array.isArray(rows) ? rows : []).slice().sort(bySortOrder));
      setProducts(Array.isArray(catalogue) ? catalogue : []);
    } catch (error) {
      console.error("Error loading rituals:", error);
      toast("error", "Could not load the rituals", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const productName = useCallback(
    (id) => products.find((p) => String(p.id) === String(id))?.name || null,
    [products]
  );

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, steps: [] });
    setStoryPreview(false);
    setDialogOpen(true);
  };

  const openEdit = (ritual) => {
    setEditing(ritual);
    setForm({
      name: ritual.name || "",
      slug: ritual.slug || "",
      tagline: ritual.tagline || "",
      story: ritual.story || "",
      image: ritual.image || "",
      duration: ritual.duration || "",
      isActive: ritual.isActive !== false,
      steps: (Array.isArray(ritual.steps) ? ritual.steps : [])
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((step) => ({
          productId: step.productId ?? null,
          alternativeProductId: step.alternativeProductId ?? null,
          note: step.note || "",
          frequency: step.frequency || "",
        })),
    });
    setStoryPreview(false);
    setDialogOpen(true);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    // Auto-slug only while creating: /rituals/<slug> is a live URL once saved.
    setForm((f) => ({ ...f, name, slug: editing ? f.slug : slugify(name) }));
  };

  // ── Steps ──────────────────────────────────────────────────────────────────
  const setStep = (index, next) =>
    setForm((f) => ({ ...f, steps: f.steps.map((step, i) => (i === index ? next : step)) }));

  const moveStep = (index, delta) => {
    const target = index + delta;
    setForm((f) => {
      if (target < 0 || target >= f.steps.length) return f;
      const next = [...f.steps];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...f, steps: next };
    });
  };

  const removeStep = (index) =>
    setForm((f) => ({ ...f, steps: f.steps.filter((_, i) => i !== index) }));

  const addStep = () => setForm((f) => ({ ...f, steps: [...f.steps, { ...EMPTY_STEP }] }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const name = form.name.trim();
    const slug = form.slug.trim() || slugify(name);
    if (!name) {
      toast("warning", "A name is required");
      return;
    }
    if (!slug) {
      toast("warning", "A slug is required");
      return;
    }
    const clash = rituals.find(
      (r) => String(r.slug) === slug && String(r.id) !== String(editing?.id)
    );
    if (clash) {
      toast("warning", "That slug is taken", `"${clash.name}" already uses /rituals/${slug}.`);
      return;
    }
    // A step with no product is a step the storefront cannot render — it would
    // print a note with nothing to buy under it.
    const steps = form.steps.filter((step) => step.productId != null);
    if (steps.length !== form.steps.length) {
      const result = await Swal.fire({
        title: "Some steps name no product",
        text: `${form.steps.length - steps.length} step${
          form.steps.length - steps.length === 1 ? "" : "s"
        } will be dropped, because a step without a product cannot be shown.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: ADMIN_PALETTE.error.main,
        confirmButtonText: "Drop them and save",
      });
      if (!result.isConfirmed) return;
    }

    const payload = {
      name,
      slug,
      tagline: form.tagline.trim(),
      story: form.story.trim(),
      image: form.image.trim(),
      duration: form.duration.trim(),
      isActive: !!form.isActive,
      // `order` comes from the row's position, never from a field, so it is
      // dense and always agrees with the editor.
      steps: steps.map((step, index) => ({
        order: index + 1,
        productId: step.productId,
        // Omitted rather than written as null, so a ritual that never had an
        // alternative does not grow the key.
        ...(step.alternativeProductId != null
          ? { alternativeProductId: step.alternativeProductId }
          : {}),
        note: (step.note || "").trim(),
        frequency: (step.frequency || "").trim(),
      })),
      sortOrder: editing?.sortOrder ?? rituals.length,
    };

    try {
      setSaving(true);
      if (editing) {
        // PUT replaces the row — spread the original so createdAt and anything
        // else this form does not manage survives the save.
        await apiService.admin.updateRitual(editing.id, { ...editing, ...payload });
      } else {
        await apiService.admin.createRitual(payload);
      }
      setDialogOpen(false);
      await load();
      toast("success", editing ? "Ritual updated" : "Ritual created");
    } catch (error) {
      console.error("Error saving ritual:", error);
      toast("error", "Could not save the ritual", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ritual) => {
    const isActive = ritual.isActive === false;
    // Optimistic — the switch has to answer immediately.
    setRituals((prev) => prev.map((r) => (r.id === ritual.id ? { ...r, isActive } : r)));
    try {
      setBusy(true);
      await apiService.admin.updateRitual(ritual.id, { ...ritual, isActive });
    } catch (error) {
      console.error("Error toggling ritual:", error);
      toast("error", "Could not update the ritual", error.message);
      load(); // roll back to server truth
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (ritual) => {
    const result = await Swal.fire({
      title: "Delete this ritual?",
      html: `<strong>${ritual.name}</strong> will be permanently removed, and <code>${ROUTES.RITUALS}/${ritual.slug}</code> will stop resolving. The products it names are not affected.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: ADMIN_PALETTE.error.main,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      setBusy(true);
      await apiService.admin.deleteRitual(ritual.id);
      await load();
      toast("success", "Ritual deleted");
    } catch (error) {
      console.error("Error deleting ritual:", error);
      toast("error", "Could not delete the ritual", error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= rituals.length) return;
    const next = [...rituals];
    [next[index], next[target]] = [next[target], next[index]];
    const renumbered = next.map((row, i) => ({ ...row, sortOrder: i }));
    const before = rituals;
    setRituals(renumbered);
    try {
      setBusy(true);
      await apiService.admin.reorderRituals(
        renumbered.map((row) => row.id),
        before
      );
    } catch (error) {
      console.error("Error reordering rituals:", error);
      toast("error", "Could not save the new order", error.message);
      load();
    } finally {
      setBusy(false);
    }
  };

  // Steps naming a product that is no longer in the catalogue: the storefront
  // renders the step without a card, which is a hole an admin should see here.
  const brokenSteps = useMemo(() => {
    const known = new Set(products.map((p) => String(p.id)));
    return rituals.reduce(
      (total, ritual) =>
        total +
        (Array.isArray(ritual.steps) ? ritual.steps : []).filter(
          (step) => step.productId != null && !known.has(String(step.productId))
        ).length,
      0
    );
  }, [rituals, products]);

  const liveCount = rituals.filter((r) => r.isActive !== false).length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-start" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Rituals
          </Typography>
          <Typography color="text.secondary">
            Routines built from the catalogue — read at {ROUTES.RITUALS}, in this order. A step names
            a product; the products themselves are unaffected by anything on this screen.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Icon icon="mdi:plus" />}
          onClick={openCreate}
          disabled={busy}
          sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "flex-start" } }}
        >
          Add Ritual
        </Button>
      </Box>

      {!loading && rituals.length > 0 && liveCount === 0 && (
        <Alert severity="warning" icon={<Icon icon="mdi:eye-off-outline" />} sx={{ mb: 3 }}>
          Every ritual is switched off — {ROUTES.RITUALS} shows its empty state.
        </Alert>
      )}

      {!loading && brokenSteps > 0 && (
        <Alert severity="warning" icon={<Icon icon="mdi:link-variant-off" />} sx={{ mb: 3 }}>
          {brokenSteps === 1 ? "One step names" : `${brokenSteps} steps name`} a product that is no
          longer in the catalogue, so {brokenSteps === 1 ? "it renders" : "they render"} without a
          product card. Open the ritual and pick a replacement.
        </Alert>
      )}

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 72 }}>Order</TableCell>
                <TableCell>Ritual</TableCell>
                <TableCell align="center">Steps</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [0, 1, 2].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton height={56} />
                    </TableCell>
                  </TableRow>
                ))
              ) : rituals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Icon icon="mdi:spa-outline" style={{ fontSize: 44, opacity: 0.4 }} />
                    <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                      No rituals yet — {ROUTES.RITUALS} shows its empty state.
                    </Typography>
                    <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={openCreate}>
                      Add the first ritual
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                rituals.map((ritual, index) => {
                  const steps = Array.isArray(ritual.steps) ? ritual.steps : [];
                  return (
                    <TableRow key={ritual.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            size="small"
                            disabled={index === 0 || busy}
                            onClick={() => handleMove(index, -1)}
                            aria-label={`Move up: ${ritual.name}`}
                          >
                            <Icon icon="mdi:chevron-up" />
                          </IconButton>
                          <IconButton
                            size="small"
                            disabled={index === rituals.length - 1 || busy}
                            onClick={() => handleMove(index, 1)}
                            aria-label={`Move down: ${ritual.name}`}
                          >
                            <Icon icon="mdi:chevron-down" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              flexShrink: 0,
                              borderRadius: 1,
                              overflow: "hidden",
                              bgcolor: "action.hover",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "text.disabled",
                            }}
                          >
                            {ritual.image ? (
                              <Box
                                component="img"
                                src={ritual.image}
                                alt=""
                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <Icon icon="mdi:image-outline" style={{ fontSize: 20 }} />
                            )}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {ritual.name}
                            </Typography>
                            {ritual.tagline && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  maxWidth: 280,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {ritual.tagline}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          variant="outlined"
                          color={steps.length ? "primary" : "warning"}
                          label={steps.length}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {ritual.slug}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          size="small"
                          checked={ritual.isActive !== false}
                          disabled={busy}
                          onChange={() => handleToggleActive(ritual)}
                          inputProps={{ "aria-label": `Show ${ritual.name} on the storefront` }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => openEdit(ritual)}
                              disabled={busy}
                              aria-label={`Edit ${ritual.name}`}
                            >
                              <Icon icon="mdi:pencil-outline" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(ritual)}
                              disabled={busy}
                              aria-label={`Delete ${ritual.name}`}
                            >
                              <Icon icon="mdi:delete-outline" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ── Editor ──────────────────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreenDialog}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editing ? "Edit ritual" : "New ritual"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5} sx={{ pt: 0.5 }}>
            <Grid item xs={12} sm={7}>
              <TextField
                label="Name *"
                value={form.name}
                onChange={handleNameChange}
                fullWidth
                size="small"
                placeholder="e.g. The Morning Glow Ritual"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="Slug *"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                fullWidth
                size="small"
                helperText={
                  editing
                    ? `${ROUTES.RITUALS}/${form.slug || "…"} — changing it breaks existing links`
                    : "Generated from the name"
                }
                inputProps={{ style: { fontFamily: "monospace" } }}
              />
            </Grid>

            <Grid item xs={12} sm={7}>
              <TextField
                label="Tagline"
                value={form.tagline}
                onChange={(e) => setField("tagline", e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. Clear, refreshed, quietly radiant."
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="Duration"
                value={form.duration}
                onChange={(e) => setField("duration", e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. About five minutes"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <TextField
                  label="Image URL"
                  value={form.image}
                  onChange={(e) => setField("image", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="https://..."
                  helperText="A portrait shot reads best — the cards are taller than they are wide."
                />
                <Box
                  sx={{
                    width: 72,
                    height: 90,
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
                  {form.image ? (
                    <Box
                      component="img"
                      src={form.image}
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
            </Grid>

            <Grid item xs={12}>
              <MarkdownField
                label="Story"
                value={form.story}
                onChange={(value) => setField("story", value)}
                previewing={storyPreview}
                onTogglePreview={() => setStoryPreview((open) => !open)}
                minRows={6}
              />
              <Button
                size="small"
                onClick={() => setHelpOpen((open) => !open)}
                startIcon={<Icon icon={helpOpen ? "mdi:chevron-up" : "mdi:help-circle-outline"} />}
                sx={{ color: "text.primary", mt: 1 }}
              >
                {helpOpen ? "Hide formatting help" : "Formatting & tokens"}
              </Button>
              {helpOpen && (
                <Paper
                  elevation={0}
                  sx={{ mt: 1.5, p: 2, border: "1px solid", borderColor: "divider" }}
                >
                  <ContentHelp />
                </Paper>
              )}
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)}
                  />
                }
                label={form.isActive ? "Live on the storefront" : "Hidden"}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Steps */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  Steps
                </Typography>
                <Button size="small" startIcon={<Icon icon="mdi:plus" />} onClick={addStep}>
                  Add step
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                Read in this order. Each step names one product, and may offer an alternative — a
                step with no product is dropped on save.
              </Typography>

              {form.steps.length === 0 ? (
                <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    No steps yet. A ritual with no steps still has a page, but nothing to follow.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: "grid", gap: 2 }}>
                  {form.steps.map((step, index) => (
                    /* eslint-disable-next-line react/no-array-index-key */
                    <StepRow
                      key={index}
                      step={step}
                      index={index}
                      total={form.steps.length}
                      products={products}
                      onChange={setStep}
                      onMove={moveStep}
                      onRemove={removeStep}
                    />
                  ))}
                </Box>
              )}
            </Grid>

            {/* What the page will list */}
            {form.steps.some((step) => step.productId != null) && (
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1, letterSpacing: 0.6, textTransform: "uppercase" }}
                  >
                    The routine, in order
                  </Typography>
                  <Box component="ol" sx={{ m: 0, pl: 2.5, display: "grid", gap: 0.5 }}>
                    {form.steps
                      .filter((step) => step.productId != null)
                      .map((step, index) => (
                        /* eslint-disable-next-line react/no-array-index-key */
                        <Box component="li" key={index}>
                          <Typography variant="body2">
                            {productName(step.productId) || `Product #${step.productId}`}
                            {step.alternativeProductId != null && (
                              <Typography component="span" variant="body2" color="text.secondary">
                                {" "}
                                or {productName(step.alternativeProductId) ||
                                  `Product #${step.alternativeProductId}`}
                              </Typography>
                            )}
                            {step.note && (
                              <Typography component="span" variant="body2" color="text.secondary">
                                {" "}
                                — {step.note}
                              </Typography>
                            )}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {editing ? "Save changes" : "Create ritual"}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default AdminRituals;
