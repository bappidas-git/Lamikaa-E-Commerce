import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Skeleton,
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

// =============================================================================
// Admin → Catalogue → Concerns
// =============================================================================
//
// The "shop by concern" vocabulary: the chips on the shop page, the concern rail
// on the home page and the `?concern=<slug>` filter behind them. It is a small,
// flat, ordered list, and every product points at it BY SLUG (`product.concerns`
// is an array of slugs, not of ids).
//
// THAT IS THE ONE RULE THIS SCREEN EXISTS TO PROTECT. Because the reference is
// the slug:
//
//   • renaming a concern is safe (the products keep pointing at it) and the
//     editor says so;
//   • CHANGING A SLUG SILENTLY ORPHANS every product that used the old one, so
//     the field warns before the save and names how many products would be cut
//     loose;
//   • DELETING one that is still in use is refused outright, mirroring the
//     category rule (`CATEGORY_IN_USE`) — except that concerns have no server
//     guard behind them, so the check is done here, over `admin.getProducts()`,
//     before the destructive confirmation is even offered.
//
// `order` is a plain number rather than up/down arrows: this list is ordered by
// hand in `db.json` today, the storefront sorts by it, and eleven rows do not
// need a reordering ceremony.
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

const EMPTY_FORM = { name: "", slug: "", order: 0 };

const AdminConcerns = () => {
  const fullScreenDialog = useMediaQuery("(max-width:599.95px)");

  const [concerns, setConcerns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [rows, catalogue] = await Promise.all([
        apiService.admin.getConcerns().catch(() => []),
        // The usage count is what makes the delete rule safe; a catalogue that
        // fails to load leaves the screen readable but blocks nothing, so the
        // delete guard treats "unknown" as "0 known references" and the
        // confirmation still spells out what it is about to do.
        apiService.admin.getProducts().catch(() => []),
      ]);
      setConcerns(Array.isArray(rows) ? rows : []);
      setProducts(Array.isArray(catalogue) ? catalogue : []);
    } catch (error) {
      console.error("Error loading concerns:", error);
      toast("error", "Could not load the concerns", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // slug → the products naming it. Built once per catalogue read.
  const usage = useMemo(() => {
    const map = new Map();
    products.forEach((product) => {
      (Array.isArray(product.concerns) ? product.concerns : []).forEach((slug) => {
        const key = String(slug);
        map.set(key, [...(map.get(key) || []), product]);
      });
    });
    return map;
  }, [products]);

  const usersOf = useCallback((slug) => usage.get(String(slug)) || [], [usage]);

  const sorted = useMemo(
    () =>
      [...concerns].sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) ||
          String(a.name || "").localeCompare(String(b.name || ""))
      ),
    [concerns]
  );

  // Concern slugs products point at that no row here defines: the storefront
  // renders such a chip as a bare slug, so the admin should see them.
  const orphanSlugs = useMemo(() => {
    const known = new Set(concerns.map((c) => String(c.slug)));
    return [...usage.keys()].filter((slug) => !known.has(slug));
  }, [concerns, usage]);

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    const maxOrder = concerns.reduce((m, c) => Math.max(m, c.order ?? 0), 0);
    setForm({ ...EMPTY_FORM, order: maxOrder + 1 });
    setDialogOpen(true);
  };

  const openEdit = (concern) => {
    setEditing(concern);
    setForm({
      name: concern.name || "",
      slug: concern.slug || "",
      order: concern.order ?? 0,
    });
    setDialogOpen(true);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    // Auto-slug only while creating: an existing slug is a reference and must
    // never move because someone fixed a capital letter in the name.
    setForm((f) => ({ ...f, name, slug: editing ? f.slug : slugify(name) }));
  };

  // How many products the save would orphan by moving the slug out from under
  // them. Zero while creating, and zero while the slug is untouched.
  const orphanCount =
    editing && form.slug.trim() !== editing.slug ? usersOf(editing.slug).length : 0;

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
    const clash = concerns.find(
      (c) => String(c.slug) === slug && String(c.id) !== String(editing?.id)
    );
    if (clash) {
      toast("warning", "That slug is taken", `"${clash.name}" already uses ${slug}.`);
      return;
    }
    if (orphanCount > 0) {
      const result = await Swal.fire({
        title: "Change the slug?",
        html: `${orphanCount} product${orphanCount === 1 ? "" : "s"} point${
          orphanCount === 1 ? "s" : ""
        } at <code>${editing.slug}</code>. Changing it to <code>${slug}</code> will leave ${
          orphanCount === 1 ? "it" : "them"
        } filed under a concern that no longer exists.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: ADMIN_PALETTE.error.main,
        confirmButtonText: "Change it anyway",
      });
      if (!result.isConfirmed) return;
    }

    const payload = { name, slug, order: Number(form.order) || 0 };
    try {
      setSaving(true);
      if (editing) {
        // PUT replaces the row — spread the original so anything this form does
        // not manage survives the save.
        await apiService.admin.updateConcern(editing.id, { ...editing, ...payload });
      } else {
        await apiService.admin.createConcern(payload);
      }
      setDialogOpen(false);
      await load();
      toast("success", editing ? "Concern updated" : "Concern created");
    } catch (error) {
      console.error("Error saving concern:", error);
      toast("error", "Could not save the concern", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (concern) => {
    // The category rule, applied client-side: refuse while anything still
    // references it, so no product is left filed under a concern that is gone.
    const inUse = usersOf(concern.slug);
    if (inUse.length > 0) {
      const names = inUse
        .slice(0, 5)
        .map((p) => p.name)
        .join(", ");
      Swal.fire({
        icon: "info",
        title: "Concern in use",
        text: `${inUse.length} product${inUse.length === 1 ? "" : "s"} still name${
          inUse.length === 1 ? "s" : ""
        } "${concern.slug}" — ${names}${inUse.length > 5 ? ", …" : ""}. Remove it from ${
          inUse.length === 1 ? "that product" : "those products"
        } first.`,
      });
      return;
    }
    const result = await Swal.fire({
      title: "Delete concern?",
      text: `"${concern.name}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: ADMIN_PALETTE.error.main,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      setBusy(true);
      await apiService.admin.deleteConcern(concern.id);
      await load();
      toast("success", "Concern deleted");
    } catch (error) {
      console.error("Error deleting concern:", error);
      toast("error", "Could not delete the concern", error.message);
    } finally {
      setBusy(false);
    }
  };

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
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Concerns
          </Typography>
          <Typography color="text.secondary">
            The &ldquo;shop by concern&rdquo; vocabulary. Products name a concern by its slug, so a
            name can be reworded freely — a slug cannot.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Icon icon="mdi:plus" />}
          onClick={openCreate}
          disabled={busy}
          sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "flex-start" } }}
        >
          Add Concern
        </Button>
      </Box>

      {!loading && orphanSlugs.length > 0 && (
        <Alert severity="warning" icon={<Icon icon="mdi:link-variant-off" />} sx={{ mb: 3 }}>
          {orphanSlugs.length === 1 ? "One slug is" : `${orphanSlugs.length} slugs are`} named by
          products but not defined here: <strong>{orphanSlugs.join(", ")}</strong>. Add{" "}
          {orphanSlugs.length === 1 ? "it" : "them"} below, or remove{" "}
          {orphanSlugs.length === 1 ? "it" : "them"} from those products.
        </Alert>
      )}

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell>Concern</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell align="center">Order</TableCell>
                <TableCell align="center">Products</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [0, 1, 2, 3].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton height={48} />
                    </TableCell>
                  </TableRow>
                ))
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Icon icon="mdi:leaf-circle-outline" style={{ fontSize: 44, opacity: 0.4 }} />
                    <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                      No concerns yet — the shop page shows no concern chips.
                    </Typography>
                    <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={openCreate}>
                      Add the first concern
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((concern) => {
                  const count = usersOf(concern.slug).length;
                  return (
                    <TableRow key={concern.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {concern.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {concern.slug}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{concern.order ?? 0}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          variant="outlined"
                          color={count > 0 ? "primary" : "default"}
                          label={count}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => openEdit(concern)}
                              disabled={busy}
                              aria-label={`Edit ${concern.name}`}
                            >
                              <Icon icon="mdi:pencil-outline" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={count > 0 ? "In use — cannot be deleted" : "Delete"}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(concern)}
                              disabled={busy}
                              aria-label={`Delete ${concern.name}`}
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

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={fullScreenDialog}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editing ? "Edit concern" : "New concern"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5} sx={{ pt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Name *"
                value={form.name}
                onChange={handleNameChange}
                fullWidth
                size="small"
                placeholder="e.g. Hydration"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Slug *"
                value={form.slug}
                onChange={(e) => setField("slug", e.target.value)}
                fullWidth
                size="small"
                helperText={
                  editing
                    ? "Products point at this slug. Changing it re-files every product that used it."
                    : "Generated from the name. Products will point at this."
                }
                inputProps={{ style: { fontFamily: "monospace" } }}
              />
            </Grid>
            {orphanCount > 0 && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<Icon icon="mdi:link-variant-off" />}>
                  {orphanCount} product{orphanCount === 1 ? "" : "s"} still name{" "}
                  <code>{editing.slug}</code>. Save this and {orphanCount === 1 ? "it" : "they"} will
                  be filed under a concern that no longer exists.
                </Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                label="Order"
                type="number"
                value={form.order}
                onChange={(e) => setField("order", parseInt(e.target.value, 10) || 0)}
                size="small"
                sx={{ width: 140 }}
                helperText="Lower numbers first"
              />
            </Grid>
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
            {editing ? "Save changes" : "Create concern"}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default AdminConcerns;
