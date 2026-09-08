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
import { alpha } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import apiService from "../../services/api";
import { ADMIN_PALETTE } from "../../theme/adminTheme";
import { isPlaceholder, placeholderToken } from "../../utils/placeholders";

// =============================================================================
// Admin → Storefront → Announcements
// =============================================================================
//
// The rotating line above the masthead. Prompt 06 repurposed the old `banners`
// collection into `announcements`, and until Prompt 34 it was edited from a
// temporary tab bolted onto the hero screen — which meant the two fields that
// actually matter (the schedule window) had no controls at all and survived only
// because the adapter carried them across each PUT. This screen is the real one:
// text, link, on/off, an optional start and end, and the order they rotate in.
//
// WHAT "LIVE" MEANS HERE IS WHAT IT MEANS ON THE BAR — three gates, not one:
//   1. `isActive` — the switch;
//   2. the schedule window — `startsAt`/`endsAt`, either or both optional, and
//      an unparseable date is IGNORED rather than hiding the row (a typo in the
//      admin must not silently empty the bar);
//   3. printable — a row whose text still carries a `{{TOKEN}}` is DROPPED by
//      `AnnouncementBar` (PLACEHOLDERS.md: an announcement is hidden while
//      unresolved, never printed raw).
// Two of the three seeded rows are tokens today, so the third gate is not
// hypothetical: without it this screen would report three live announcements
// while a shopper reads one. The preview strip prints exactly the rows that pass
// all three, in order.
//
// TIMES ARE LOCAL IN THE INPUT AND ISO IN THE RECORD. `datetime-local` has no
// timezone, so an admin types their own wall clock and `toIso`/`toInputValue`
// convert around the stored UTC instant.
//
// The API PUTs the whole row (`updateAnnouncement`), so every save sends every
// field — a partial payload would blank the fields it omitted.
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

const EMPTY_FORM = {
  text: "",
  link: "",
  isActive: true,
  startsAt: "",
  endsAt: "",
};

const pad = (n) => String(n).padStart(2, "0");

/** An ISO instant as the local wall clock `datetime-local` expects. */
const toInputValue = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
};

/** …and back. Blank means "no bound", which is stored as null, never as "". */
const toIso = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const formatWhen = (iso) => {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Is this row inside its schedule window right now? */
const inWindow = (row, now = Date.now()) => {
  const starts = row.startsAt ? Date.parse(row.startsAt) : NaN;
  const ends = row.endsAt ? Date.parse(row.endsAt) : NaN;
  if (Number.isFinite(starts) && now < starts) return false;
  if (Number.isFinite(ends) && now > ends) return false;
  return true;
};

/** What the bar can actually print: real text with no unresolved token. */
const isPrintable = (row) =>
  typeof row?.text === "string" && row.text.trim() !== "" && !isPlaceholder(row.text);

/** On the bar right now — all three gates. */
const isLiveNow = (row, now = Date.now()) =>
  row?.isActive !== false && inWindow(row, now) && isPrintable(row);

/** A `{{` that is not a recognised upper-snake token prints RAW on the
    storefront: the placeholder gate would not catch it, so the editor must. */
const hasBrokenToken = (text) =>
  typeof text === "string" && text.includes("{{") && !isPlaceholder(text);

const bySortOrder = (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0);

const AdminAnnouncements = () => {
  const fullScreenDialog = useMediaQuery("(max-width:599.95px)");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.admin.getAnnouncements();
      setRows((Array.isArray(data) ? data : []).slice().sort(bySortOrder));
    } catch (error) {
      console.error("Error loading announcements:", error);
      toast("error", "Could not load the announcements", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const live = useMemo(() => rows.filter((row) => isLiveNow(row)), [rows]);
  const placeholderRows = useMemo(
    () => rows.filter((row) => isPlaceholder(row.text)),
    [rows]
  );

  const setField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      text: row.text || "",
      link: row.link || "",
      isActive: row.isActive !== false,
      startsAt: toInputValue(row.startsAt),
      endsAt: toInputValue(row.endsAt),
    });
    setDialogOpen(true);
  };

  // Every field, every time: the API PUTs the whole row.
  const payloadOf = (source, row) => ({
    text: source.text.trim(),
    link: source.link.trim(),
    isActive: !!source.isActive,
    startsAt: toIso(source.startsAt),
    endsAt: toIso(source.endsAt),
    sortOrder: row?.sortOrder ?? rows.length,
    ...(row?.createdAt ? { createdAt: row.createdAt } : {}),
  });

  const windowIsBackwards =
    !!form.startsAt && !!form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt);

  const handleSave = async () => {
    if (!form.text.trim()) {
      toast("warning", "The announcement needs some text");
      return;
    }
    if (windowIsBackwards) {
      toast("warning", "The end must come after the start");
      return;
    }
    try {
      setSaving(true);
      if (editing) {
        await apiService.admin.updateAnnouncement(editing.id, payloadOf(form, editing));
      } else {
        await apiService.admin.createAnnouncement(payloadOf(form, null));
      }
      setDialogOpen(false);
      await load();
      toast("success", editing ? "Announcement updated" : "Announcement added");
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast("error", "Could not save the announcement", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (row) => {
    const isActive = row.isActive === false;
    // Optimistic — the switch has to answer immediately.
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isActive } : r)));
    try {
      setBusy(true);
      await apiService.admin.updateAnnouncement(row.id, {
        ...payloadOf(
          {
            text: row.text || "",
            link: row.link || "",
            isActive,
            startsAt: toInputValue(row.startsAt),
            endsAt: toInputValue(row.endsAt),
          },
          row
        ),
      });
    } catch (error) {
      console.error("Error toggling announcement:", error);
      toast("error", "Could not update the announcement", error.message);
      load(); // roll back to server truth
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (row) => {
    const lastLive = isLiveNow(row) && live.length === 1;
    const result = await Swal.fire({
      title: "Delete this announcement?",
      html: `<strong>${row.text || "Untitled"}</strong> will be permanently removed.${
        lastLive
          ? "<br/><br/>It is the only line on the bar — the storefront will fall back to its built-in announcements until you add another."
          : ""
      }`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: ADMIN_PALETTE.error.main,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      setBusy(true);
      await apiService.admin.deleteAnnouncement(row.id);
      await load();
      toast("success", "Announcement deleted");
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast("error", "Could not delete the announcement", error.message);
    } finally {
      setBusy(false);
    }
  };

  const handleMove = async (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    // Renumber from the top so the order is dense and stable.
    const renumbered = next.map((row, i) => ({ ...row, sortOrder: i }));
    const before = rows;
    setRows(renumbered);
    try {
      setBusy(true);
      await apiService.admin.reorderAnnouncements(
        renumbered.map((row) => row.id),
        before
      );
    } catch (error) {
      console.error("Error reordering announcements:", error);
      toast("error", "Could not save the new order", error.message);
      load();
    } finally {
      setBusy(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const statusOf = (row) => {
    if (row.isActive === false) return { label: "Off", color: "default", icon: "mdi:eye-off-outline" };
    if (!isPrintable(row))
      return { label: "Hidden", color: "warning", icon: "mdi:eye-off-outline" };
    if (!inWindow(row)) {
      const starts = row.startsAt ? Date.parse(row.startsAt) : NaN;
      const scheduled = Number.isFinite(starts) && Date.now() < starts;
      return {
        label: scheduled ? "Scheduled" : "Expired",
        color: scheduled ? "info" : "default",
        icon: scheduled ? "mdi:clock-outline" : "mdi:clock-alert-outline",
      };
    }
    return { label: "On the bar", color: "success", icon: "mdi:broadcast" };
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
            Announcements
          </Typography>
          <Typography color="text.secondary">
            The line above the masthead. Every live one rotates, in this order, and a shopper can
            dismiss the bar for the rest of their session.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Icon icon="mdi:plus" />}
          onClick={openCreate}
          disabled={busy}
          sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "flex-start" } }}
        >
          Add Announcement
        </Button>
      </Box>

      {/* ── Live preview strip ──────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{ mb: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}
      >
        <Box sx={{ px: 2, pt: 1.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: 0.6, textTransform: "uppercase" }}
          >
            On the bar right now
          </Typography>
        </Box>
        <Box
          sx={{
            m: 2,
            mt: 1,
            px: 2,
            py: 1.25,
            borderRadius: 1,
            bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {loading ? (
            <Skeleton variant="text" width="60%" />
          ) : live.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nothing — the bar is hidden on the storefront until a line is live.
            </Typography>
          ) : (
            <Box sx={{ display: "grid", gap: 0.75 }}>
              {live.map((row, i) => (
                <Box key={row.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" color="primary.main" fontWeight={700}>
                    {String(i + 1).padStart(2, "0")}
                  </Typography>
                  <Typography variant="body2" sx={{ letterSpacing: 0.3 }}>
                    {row.text.trim()}
                  </Typography>
                  {row.link && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<Icon icon="mdi:link-variant" />}
                      label={row.link}
                      sx={{ maxWidth: 220 }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Paper>

      {!loading && placeholderRows.length > 0 && (
        <Alert severity="info" icon={<Icon icon="mdi:code-braces" />} sx={{ mb: 3 }}>
          {placeholderRows.length === 1
            ? "One announcement still carries a placeholder and stays hidden"
            : `${placeholderRows.length} announcements still carry a placeholder and stay hidden`}{" "}
          on the storefront until the real wording replaces it — a placeholder is never printed
          raw.
        </Alert>
      )}

      {/* ── The table ───────────────────────────────────────────────────── */}
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <TableContainer>
          <Table sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 72 }}>Order</TableCell>
                <TableCell>Announcement</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">On</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [0, 1, 2].map((i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton height={52} />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Icon icon="mdi:bullhorn-outline" style={{ fontSize: 44, opacity: 0.4 }} />
                    <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                      No announcements yet — the storefront is showing its built-in lines.
                    </Typography>
                    <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={openCreate}>
                      Add the first announcement
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => {
                  const status = statusOf(row);
                  const token = placeholderToken(row.text);
                  const starts = formatWhen(row.startsAt);
                  const ends = formatWhen(row.endsAt);
                  return (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            size="small"
                            disabled={index === 0 || busy}
                            onClick={() => handleMove(index, -1)}
                            aria-label={`Move up: ${row.text || "Untitled"}`}
                          >
                            <Icon icon="mdi:chevron-up" />
                          </IconButton>
                          <IconButton
                            size="small"
                            disabled={index === rows.length - 1 || busy}
                            onClick={() => handleMove(index, 1)}
                            aria-label={`Move down: ${row.text || "Untitled"}`}
                          >
                            <Icon icon="mdi:chevron-down" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {row.text || "Untitled"}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 0.5 }}>
                          {row.link && (
                            <Chip
                              size="small"
                              variant="outlined"
                              icon={<Icon icon="mdi:link-variant" />}
                              label={row.link}
                              sx={{ maxWidth: 240 }}
                            />
                          )}
                          {token && (
                            <Tooltip title="An unresolved placeholder — the bar hides this line until the real wording replaces it">
                              <Chip
                                size="small"
                                color="warning"
                                variant="outlined"
                                icon={<Icon icon="mdi:code-braces" />}
                                label={`Placeholder — ${token}`}
                              />
                            </Tooltip>
                          )}
                          {hasBrokenToken(row.text) && (
                            <Tooltip title="Not a recognised placeholder token, so it would print exactly as typed">
                              <Chip
                                size="small"
                                color="error"
                                variant="outlined"
                                icon={<Icon icon="mdi:alert-outline" />}
                                label="Braces print as typed"
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {starts || ends ? (
                          <Typography variant="caption" color="text.secondary">
                            {starts ? `From ${starts}` : "From now"}
                            <br />
                            {ends ? `Until ${ends}` : "No end"}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.disabled">
                            Always
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={status.color}
                          icon={<Icon icon={status.icon} />}
                          label={status.label}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Switch
                          size="small"
                          checked={row.isActive !== false}
                          disabled={busy}
                          onChange={() => handleToggleActive(row)}
                          inputProps={{ "aria-label": `Show "${row.text || "Untitled"}" on the bar` }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => openEdit(row)}
                              disabled={busy}
                              aria-label={`Edit: ${row.text || "Untitled"}`}
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
                              onClick={() => handleDelete(row)}
                              disabled={busy}
                              aria-label={`Delete: ${row.text || "Untitled"}`}
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
        maxWidth="sm"
        fullWidth
        fullScreen={fullScreenDialog}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editing ? "Edit announcement" : "New announcement"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5} sx={{ pt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                label="Text *"
                value={form.text}
                onChange={(e) => setField("text", e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. Farmer-owned. Assam-grown."
                helperText="One short line. The bar rotates through every live announcement."
              />
            </Grid>

            {isPlaceholder(form.text) && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<Icon icon="mdi:code-braces" />}>
                  <strong>{placeholderToken(form.text)}</strong> is a placeholder, so this line stays
                  hidden on the storefront until you replace it with the real wording. Saving it is
                  fine — nothing prints until then.
                </Alert>
              </Grid>
            )}

            {hasBrokenToken(form.text) && (
              <Grid item xs={12}>
                <Alert severity="error" icon={<Icon icon="mdi:alert-outline" />}>
                  Those braces are not a recognised placeholder token — a token is upper-case
                  letters, digits and underscores between double braces — so they would print on
                  the bar exactly as typed.
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Link"
                value={form.link}
                onChange={(e) => setField("link", e.target.value)}
                fullWidth
                size="small"
                placeholder="/shop"
                helperText="Optional. A storefront path, so the whole line becomes clickable."
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={700}>
                Schedule
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Both optional, in your own time zone. Leave them empty and the line shows for as
                long as it is switched on.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Starts"
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setField("startsAt", e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ends"
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setField("endsAt", e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                error={windowIsBackwards}
                helperText={windowIsBackwards ? "The end must come after the start" : " "}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(e) => setField("isActive", e.target.checked)}
                  />
                }
                label={form.isActive ? "Switched on" : "Switched off"}
              />
            </Grid>

            {/* What the bar would print */}
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5, letterSpacing: 0.6, textTransform: "uppercase" }}
                >
                  As it reads on the bar
                </Typography>
                <Typography variant="body2" sx={{ letterSpacing: 0.3 }}>
                  {isPlaceholder(form.text) || !form.text.trim()
                    ? "— hidden —"
                    : form.text.trim()}
                </Typography>
              </Paper>
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
            {editing ? "Save changes" : "Add announcement"}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default AdminAnnouncements;
