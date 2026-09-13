import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Tooltip, Skeleton, TextField,
  InputAdornment, Select, MenuItem, FormControl, InputLabel, Avatar,
  Rating, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Checkbox, FormControlLabel, Stack, Autocomplete,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import apiService from "../../services/api";
import { ADMIN_PALETTE } from "../../theme/adminTheme";
import { ImageField, ImageListField } from "./components/ImageFields";
import { notifyReviewsUpdated } from "../../hooks/useTestimonials";

// =============================================================================
// Admin → Reviews — moderation, and the ONE place a testimonial is written
// =============================================================================
//
// There is no "Testimonials" screen, and that is the design: the storefront's
// "What our customers say" band reads the same approved `reviews` rows a
// product page prints (`reviews.getPublished`). So a quote is typed HERE, once,
// and the row it lands in is both the product's review and — with "Feature in
// What our customers say" ticked — the band's testimonial. Nobody is ever
// asked to paste the same paragraph into two screens.
//
// WHAT THIS SCREEN GAINED WITH THE BAND
//   • a CUSTOMER PHOTO and up to three REVIEW PHOTOS on every row, by link or
//     picked off this computer (`components/ImageFields`);
//   • "Feature" — the curation mark `utils/testimonials` sorts on;
//   • EDITING. The dialog used to create only, so a review could be approved or
//     deleted but never corrected — and a photograph could never be added to a
//     review a customer had already written. It now opens on an existing row.
//
// EVERY WRITE TELLS THE STOREFRONT. `notifyReviewsUpdated()` is a window event
// the band listens for, so approving a review in this tab refreshes a storefront
// open beside it without a reload (a storefront in ANOTHER tab picks it up on
// focus).
//
// NOTHING IS INVENTED HERE. The reviewer name is free text typed from a real
// customer's words — the one-click mock names this screen used to offer were
// removed for BRAND.md §3.9 rule 6, and nothing in this file may bring them
// back.
// =============================================================================

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "warning" },
  approved: { label: "Approved", color: "success" },
  rejected: { label: "Rejected", color: "error" },
};

const EMPTY_REVIEW = {
  productId: "", userName: "", rating: 5, title: "", body: "",
  isVerifiedPurchase: false, status: "approved",
  // The testimonial half of a review: the customer's own photograph, the
  // pictures they sent of the product, and the owner's curation mark.
  avatar: "", photos: [], featured: false,
};

/** An existing row, in the shape the dialog edits. */
const toForm = (review) => ({
  productId: review.productId ?? "",
  userName: review.userName || "",
  rating: Number(review.rating) || 0,
  title: review.title || "",
  body: review.body || "",
  isVerifiedPurchase: !!review.isVerifiedPurchase,
  status: review.status || "approved",
  avatar: review.avatar || "",
  photos: Array.isArray(review.photos) ? review.photos.filter(Boolean) : [],
  featured: review.featured === true,
});

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_REVIEW);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reviewData, productData] = await Promise.all([
        apiService.admin.getReviews(),
        apiService.products.getAll(),
      ]);
      setReviews(reviewData || []);
      setProducts(productData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (id) => products.find((p) => p.id === id)?.name || `Product #${id}`;

  const handleStatusUpdate = async (review, newStatus) => {
    try {
      await apiService.admin.updateReview(review.id, { status: newStatus });
      notifyReviewsUpdated();
      Swal.fire({ icon: "success", title: `Review ${newStatus}`, toast: true, position: "bottom-end", showConfirmButton: false, timer: 2000 });
      if (dialogOpen) setDialogOpen(false);
      loadData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
  };

  const handleDelete = async (review) => {
    const result = await Swal.fire({ title: "Delete review?", icon: "warning", showCancelButton: true, confirmButtonColor: ADMIN_PALETTE.error.main, confirmButtonText: "Delete" });
    if (!result.isConfirmed) return;
    try {
      await apiService.admin.deleteReview(review.id);
      notifyReviewsUpdated();
      Swal.fire({ icon: "success", title: "Deleted", toast: true, position: "bottom-end", showConfirmButton: false, timer: 2000 });
      loadData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
  };

  const openCreate = () => { setEditingId(null); setForm(EMPTY_REVIEW); setCreateOpen(true); };

  // The same dialog, opened on a row that already exists — which is how a
  // photograph gets added to a review a customer wrote without one.
  const openEdit = (review) => {
    setEditingId(review.id);
    setForm(toForm(review));
    setDialogOpen(false);
    setCreateOpen(true);
  };

  // One toggle, from the table: the mark that promotes an approved review into
  // the storefront's "What our customers say" band.
  const toggleFeatured = async (review) => {
    try {
      await apiService.admin.updateReview(review.id, { featured: review.featured !== true });
      notifyReviewsUpdated();
      loadData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    }
  };

  const handleSave = async () => {
    if (!form.productId) { Swal.fire({ icon: "warning", title: "Select a product" }); return; }
    if (!form.userName.trim()) { Swal.fire({ icon: "warning", title: "Enter a reviewer name" }); return; }
    if (!form.rating) { Swal.fire({ icon: "warning", title: "Pick a rating" }); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        userName: form.userName.trim(),
        productId: Number(form.productId),
        rating: Number(form.rating),
        avatar: form.avatar || null,
        photos: Array.isArray(form.photos) ? form.photos.filter(Boolean) : [],
        featured: form.featured === true,
      };
      if (editingId) await apiService.admin.updateReview(editingId, payload);
      else await apiService.admin.createReview(payload);
      notifyReviewsUpdated();
      Swal.fire({ icon: "success", title: editingId ? "Review saved" : "Review added", toast: true, position: "bottom-end", showConfirmButton: false, timer: 2000 });
      setCreateOpen(false);
      setEditingId(null);
      loadData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.userName?.toLowerCase().includes(q) || r.title?.toLowerCase().includes(q) || r.body?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold">Reviews</Typography>
          <Typography variant="body2" color="text.secondary">Moderate and manage product reviews</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {pendingCount > 0 && (
            <Chip label={`${pendingCount} pending review${pendingCount > 1 ? "s" : ""}`} color="warning" icon={<Icon icon="mdi:clock-outline" />} />
          )}
          <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={openCreate}>
            Add Review
          </Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", gap: 2 }}>
          <TextField
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, maxWidth: 320 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="mdi:magnify" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="admin-reviews-status-label">Status</InputLabel>
            <Select labelId="admin-reviews-status-label" value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All</MenuItem>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (<MenuItem key={k} value={k}>{v.label}</MenuItem>))}
            </Select>
          </FormControl>
        </Box>
        <TableContainer>
          {/* Wide enough for the five row actions (view, edit, feature, approve
                or reject, delete) to stay on ONE line; the container scrolls
                horizontally below that rather than stacking icons. */}
          <Table sx={{ minWidth: 1240 }}>
            <TableHead>
              <TableRow>
                <TableCell>Reviewer</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Review</TableCell>
                <TableCell>Verified</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(3)].map((_, i) => (<TableRow key={i}><TableCell colSpan={8}><Skeleton height={52} /></TableCell></TableRow>))
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No reviews found</Typography></TableCell></TableRow>
              ) : (
                filtered.map((review) => {
                  const sc = STATUS_CONFIG[review.status] || { label: review.status, color: "default" };
                  return (
                    <TableRow key={review.id} hover sx={(t) => ({ bgcolor: review.status === "pending" ? alpha(t.palette.warning.main, 0.12) : "inherit" })}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          {/* The customer's own photograph when the row has
                              one — the same picture the storefront paints
                              beside their name — and their initial when it
                              does not. */}
                          <Avatar
                            src={review.avatar || undefined}
                            sx={{ width: 32, height: 32, fontSize: "0.8rem", bgcolor: "primary.light" }}
                          >
                            {review.userName?.[0]}
                          </Avatar>
                          <Typography variant="body2">{review.userName}</Typography>
                          {/* Seeded copy, not a customer — hidden from the
                              storefront by brand.flags.showSampleReviews and
                              marked here so it is easy to clear before launch. */}
                          {review.isSample && (
                            <Chip label="Sample" size="small" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
                          )}
                          {review.featured && (
                            <Chip
                              label="Featured"
                              size="small"
                              color="primary"
                              variant="outlined"
                              icon={<Icon icon="mdi:star" style={{ fontSize: 12 }} />}
                              sx={{ height: 20, fontSize: "0.65rem" }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{getProductName(review.productId)}</Typography></TableCell>
                      <TableCell><Rating value={review.rating} readOnly size="small" /></TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{review.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", maxWidth: 200 }}>{review.body}</Typography>
                        {review.photos?.length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                            <Icon icon="mdi:image-multiple-outline" style={{ fontSize: 14 }} />
                            {review.photos.length} photo{review.photos.length > 1 ? "s" : ""}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {review.isVerifiedPurchase ? (
                          <Chip label="Verified" size="small" color="success" icon={<Icon icon="mdi:check" style={{ fontSize: 14 }} />} />
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell><Chip label={sc.label} size="small" color={sc.color} /></TableCell>
                      <TableCell><Typography variant="caption">{formatDate(review.createdAt)}</Typography></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => { setSelectedReview(review); setDialogOpen(true); }}><Icon icon="mdi:eye-outline" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Edit (words, photos, rating)">
                          <IconButton size="small" onClick={() => openEdit(review)}><Icon icon="mdi:pencil-outline" /></IconButton>
                        </Tooltip>
                        {/* The curation mark. Only an APPROVED review can reach
                            the storefront at all, so featuring anything else
                            would promise a band place it cannot take. */}
                        <Tooltip title={review.featured ? "Remove from “What our customers say”" : "Feature in “What our customers say”"}>
                          {/* The <span> is what lets a DISABLED button still
                              own a tooltip — and it is also where MUI would
                              hang the accessible name, which would leave the
                              button itself nameless. Hence the explicit one. */}
                          <span>
                            <IconButton
                              size="small"
                              color={review.featured ? "primary" : "default"}
                              disabled={review.status !== "approved"}
                              aria-label={review.featured ? "Remove from What our customers say" : "Feature in What our customers say"}
                              aria-pressed={review.featured === true}
                              onClick={() => toggleFeatured(review)}
                            >
                              <Icon icon={review.featured ? "mdi:star" : "mdi:star-outline"} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        {review.status !== "approved" && (
                          <Tooltip title="Approve"><IconButton size="small" color="success" onClick={() => handleStatusUpdate(review, "approved")}><Icon icon="mdi:check-circle-outline" /></IconButton></Tooltip>
                        )}
                        {review.status !== "rejected" && (
                          <Tooltip title={review.status === "approved" ? "Un-approve" : "Reject"}><IconButton size="small" color="error" onClick={() => handleStatusUpdate(review, "rejected")}><Icon icon="mdi:close-circle-outline" /></IconButton></Tooltip>
                        )}
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(review)}><Icon icon="mdi:delete-outline" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Review Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedReview && (
          <>
            <DialogTitle sx={{ fontWeight: "bold" }}>
              Review by {selectedReview.userName}
              <Chip label={(STATUS_CONFIG[selectedReview.status] || {}).label} size="small" color={(STATUS_CONFIG[selectedReview.status] || {}).color} sx={{ ml: 2 }} />
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Product</Typography>
                <Typography variant="body2" fontWeight={500}>{getProductName(selectedReview.productId)}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Rating value={selectedReview.rating} readOnly size="small" />
                <Typography variant="body2" fontWeight={600}>{selectedReview.rating}/5</Typography>
              </Box>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>{selectedReview.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{selectedReview.body}</Typography>
              {selectedReview.photos?.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                  {selectedReview.photos.filter(Boolean).map((src, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={src}
                      alt={`Review photo ${index + 1}`}
                      sx={{ width: 92, height: 92, objectFit: "cover", borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}
                    />
                  ))}
                </Box>
              )}
              <Box sx={{ display: "flex", gap: 3 }}>
                <Box><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2">{formatDate(selectedReview.createdAt)}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Helpful</Typography><Typography variant="body2">{selectedReview.helpfulCount || 0} votes</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Verified</Typography><Typography variant="body2">{selectedReview.isVerifiedPurchase ? "Yes" : "No"}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Testimonial</Typography><Typography variant="body2">{selectedReview.featured ? "Featured" : "Not featured"}</Typography></Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button onClick={() => openEdit(selectedReview)} startIcon={<Icon icon="mdi:pencil-outline" />}>Edit</Button>
              {selectedReview.status !== "rejected" && (
                <Button variant="outlined" color="error" onClick={() => handleStatusUpdate(selectedReview, "rejected")}>
                  {selectedReview.status === "approved" ? "Un-approve" : "Reject"}
                </Button>
              )}
              {selectedReview.status !== "approved" && (
                <Button variant="contained" color="success" onClick={() => handleStatusUpdate(selectedReview, "approved")}>Approve</Button>
              )}
              <Button color="error" onClick={() => { setDialogOpen(false); handleDelete(selectedReview); }} startIcon={<Icon icon="mdi:delete-outline" />}>Delete</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add / edit a review — one dialog, because they are one record. What
          is typed here is BOTH the product page's review and (with "Feature"
          ticked) the storefront band's testimonial. */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>{editingId ? "Edit Review" : "Add a Review"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Autocomplete
              fullWidth
              size="small"
              options={products}
              value={products.find((p) => p.id === form.productId) || null}
              onChange={(_, newValue) => setForm((f) => ({ ...f, productId: newValue ? newValue.id : "" }))}
              getOptionLabel={(option) => option.name || ""}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>{option.name}</li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Product" placeholder="Search products…" />
              )}
              noOptionsText="No products found"
            />

            {/* Free text only. The one-click name chips that used to sit under
                this field offered eight invented shoppers — fabricated social
                proof, which BRAND.md 3.9 rule 6 rules out. A review is typed in
                with the name of the person who wrote it. */}
            <TextField
              fullWidth size="small" label="Reviewer name"
              value={form.userName}
              onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
              helperText="The name the review is published under."
            />

            <Box>
              <Typography variant="caption" color="text.secondary">Rating</Typography>
              <Rating
                value={form.rating}
                onChange={(_, v) => setForm((f) => ({ ...f, rating: v || 0 }))}
              />
            </Box>

            <TextField
              fullWidth size="small" label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              fullWidth size="small" label="Review" multiline minRows={3}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />

            {/* ── The pictures ────────────────────────────────────────────
                The portrait is previewed as the circle the storefront crops
                it to; the review photos are the strip under the words on the
                product page and on the testimonial card. */}
            <ImageField
              label="Customer photo (optional)"
              helperText="Shown beside the name on the product page and in “What our customers say”."
              shape="circle"
              value={form.avatar}
              onChange={(next) => setForm((f) => ({ ...f, avatar: next }))}
            />

            <ImageListField
              label="Review photos (optional)"
              helperText="Pictures of the product, from the customer."
              value={form.photos}
              onChange={(next) => setForm((f) => ({ ...f, photos: next }))}
            />

            {/* ── The curation mark ───────────────────────────────────────── */}
            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.featured === true}
                    onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                  />
                }
                label="Feature in “What our customers say”"
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", pl: 4 }}>
                Featured reviews lead the band that appears at the foot of every
                storefront page. Approved reviews can appear there without this;
                the tick is what puts one first. Nothing is written twice — the
                band reads this review, it does not copy it.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.isVerifiedPurchase}
                    onChange={(e) => setForm((f) => ({ ...f, isVerifiedPurchase: e.target.checked }))}
                  />
                }
                label="Verified purchase"
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="admin-reviews-status-2-label">Status</InputLabel>
                <Select labelId="admin-reviews-status-2-label"
                  label="Status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                >
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Typography variant="caption" color="text.secondary">
              Approved reviews appear on the storefront product page immediately.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setCreateOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save changes" : "Add Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReviews;
