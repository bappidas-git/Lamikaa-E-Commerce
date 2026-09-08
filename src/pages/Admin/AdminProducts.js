import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Skeleton, Tooltip, InputAdornment, Select, MenuItem, FormControl,
  InputLabel, useMediaQuery, useTheme,
} from "@mui/material";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import apiService from "../../services/api";
import { ADMIN_PALETTE } from "../../theme/adminTheme";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import brand from "../../config/brand";
import { normalizeProduct, syncProductMedia, validateMedia } from "../../utils/product";
import ProductFormSections from "./components/ProductFormSections";

// Every key a LAMIKAA product carries (PRODUCTS.md §6). A new product starts
// life with the whole shape rather than acquiring fields as it is edited — a
// record that is missing `media` or `badges` reads differently on the
// storefront from one that has them empty, and "differently" here means the
// card falls back to brand defaults it was never meant to inherit.
const emptyProduct = {
  name: "", shortName: "", slug: "", sku: "", brand: "",
  categoryId: "", categoryIds: [], concerns: [],
  ritualStep: { order: 1, label: "", frequency: "" },
  heroHeadline: "", heroSubtext: "", heroOrder: null,
  promise: "", shortDescription: "", description: "",
  price: 0, priceTBA: false, priceSource: "",
  comparePrice: 0, costPrice: 0, currency: "INR",
  size: "", stock: 0, lowStockThreshold: 10, weight: 0,
  dimensions: { length: 0, width: 0, height: 0 },
  variants: [],
  benefits: [], keyIngredients: [], howToUse: [], ingredientsList: "",
  packClaims: [], fragranceNote: "", caution: "", suitableFor: [],
  // BRAND.md §3.9 rule 4: the three owner-mandated badges are configuration,
  // never a literal in a component — and a new product inherits them.
  badges: [...brand.trustBadges],
  media: [], images: [], faqs: [],
  tags: [], featured: false, trending: false, hot: false, isNew: false, isActive: true,
  metaTitle: "", metaDescription: "",
};

const slugify = (s) =>
  String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// Keep numeric inputs as non-negative numbers. Empty/NaN falls back (defaults to
// 0, or a caller-supplied value for fields like the low-stock threshold).
const clampNum = (v, { int = false, fallback = 0 } = {}) => {
  const n = int ? parseInt(v, 10) : parseFloat(v);
  if (Number.isNaN(n)) return fallback;
  return Math.max(0, n);
};

const newVariantId = () => `v-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

/** A string list, trimmed, with the rows the merchant never filled in dropped. */
const cleanList = (rows) =>
  (Array.isArray(rows) ? rows : []).map((row) => String(row ?? "").trim()).filter(Boolean);

/**
 * A two-field list, trimmed, keeping every other key the row carried and the
 * key ORDER it was seeded with. A row with both fields blank is a row the
 * merchant added and walked away from.
 */
const cleanPairs = (rows, keyField, valueField) =>
  (Array.isArray(rows) ? rows : [])
    .map((row) => ({
      ...row,
      [keyField]: String(row?.[keyField] ?? "").trim(),
      [valueField]: String(row?.[valueField] ?? "").trim(),
    }))
    .filter((row) => row[keyField] || row[valueField]);

const AdminProducts = () => {
  // Currency comes from the admin's own Settings > General, so every figure
  // on this screen speaks the same money as the storefront.
  const { currencySymbol, formatPrice } = useStoreSettings();
  const theme = useTheme();
  // The form is fifty fields deep; on a phone it takes the whole screen or it
  // takes none of it.
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  // Three questions a merchant actually asks of this table: what is in the
  // hero, what still has no price, what is not live yet. Chips AND together.
  const [flagFilters, setFlagFilters] = useState({ hero: false, tba: false, drafts: false });
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prods, cats, cons] = await Promise.all([
        apiService.admin.getProducts(),
        apiService.admin.getCategories(),
        apiService.admin.getConcerns(),
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
      setConcerns(cons || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm({
      ...emptyProduct,
      ritualStep: { ...emptyProduct.ritualStep },
      dimensions: { ...emptyProduct.dimensions },
      categoryIds: [], concerns: [], variants: [], media: [], images: [], faqs: [],
      benefits: [], keyIngredients: [], howToUse: [], packClaims: [], suitableFor: [],
      badges: [...brand.trustBadges],
      tags: [],
    });
    setErrors({});
    setTagsInput("");
    setDialogOpen(true);
  };

  // Hydration goes through normalizeProduct FIRST. Admin reads are already
  // normalised, but a record hand-edited in db.json (or served by a Laravel
  // branch that has not caught up) may still be images-only — mapping it here
  // is what puts those legacy rows in front of the media manager instead of
  // silently dropping them on the next save.
  const openEdit = (raw) => {
    const p = normalizeProduct(raw);
    const dims = p.dimensions || {};
    setEditingProduct(raw);
    setForm({
      name: p.name || "",
      shortName: p.shortName || "",
      slug: p.slug || "",
      sku: p.sku || "",
      brand: p.brand || "",
      categoryId: p.categoryId ?? "",
      categoryIds: [...(p.categoryIds || [])],
      concerns: [...(p.concerns || [])],
      ritualStep: {
        order: p.ritualStep?.order ?? "",
        label: p.ritualStep?.label ?? "",
        frequency: p.ritualStep?.frequency ?? "",
      },
      heroHeadline: p.heroHeadline || "",
      heroSubtext: p.heroSubtext || "",
      heroOrder: p.heroOrder ?? null,
      promise: p.promise || "",
      shortDescription: p.shortDescription || "",
      description: p.description || "",
      // A TBA product carries no number to put in the field, and putting 0
      // there would be a price the moment the switch went off by accident.
      price: p.priceTBA ? null : (p.price ?? 0),
      priceTBA: !!p.priceTBA,
      priceSource: p.priceSource || "",
      comparePrice: p.comparePrice || 0,
      costPrice: p.costPrice || 0,
      currency: p.currency || "INR",
      size: p.size || "",
      stock: p.stock || 0,
      lowStockThreshold: p.lowStockThreshold || 10,
      weight: p.weight || 0,
      dimensions: {
        length: dims.length || 0, width: dims.width || 0, height: dims.height || 0,
      },
      // Clone every list and row so edits don't mutate the list's product object.
      variants: Array.isArray(p.variants)
        ? p.variants.map((v) => ({
            id: v.id || newVariantId(),
            name: v.name || "",
            price: v.price || 0,
            stock: v.stock || 0,
            sku: v.sku || "",
          }))
        : [],
      benefits: [...(p.benefits || [])],
      keyIngredients: (p.keyIngredients || []).map((row) => ({ ...row })),
      howToUse: [...(p.howToUse || [])],
      ingredientsList: p.ingredientsList || "",
      packClaims: [...(p.packClaims || [])],
      fragranceNote: p.fragranceNote || "",
      caution: p.caution || "",
      suitableFor: [...(p.suitableFor || [])],
      badges: [...(p.badges || [])],
      media: (p.media || []).map((row) => ({ ...row })),
      images: [...(p.images || [])],
      faqs: (p.faqs || []).map((row) => ({ ...row })),
      tags: [...(p.tags || [])],
      featured: !!p.featured, trending: !!p.trending, hot: !!p.hot,
      isNew: !!p.isNew, isActive: p.isActive !== false,
      metaTitle: p.metaTitle || "", metaDescription: p.metaDescription || "",
    });
    setErrors({});
    setTagsInput((p.tags || []).join(", "));
    setDialogOpen(true);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    // Auto-slug only while creating (don't fight a hand-edited slug on edit).
    setForm((f) => ({ ...f, name, slug: !editingProduct ? slugify(name) : f.slug }));
  };

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setDimension = (key, value) =>
    setForm((f) => ({ ...f, dimensions: { ...f.dimensions, [key]: value } }));
  const setRitualStep = (key, value) =>
    setForm((f) => ({ ...f, ritualStep: { ...f.ritualStep, [key]: value } }));

  // ── Variants ───────────────────────────────────────────────────────────
  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { id: newVariantId(), name: "", price: 0, stock: 0, sku: "" }],
    }));

  const updateVariant = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === idx ? { ...v, [key]: value } : v)),
    }));

  const removeVariant = (idx) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));

  // Make a URL-safe slug that doesn't collide with another product's slug.
  const makeUniqueSlug = (base) => {
    let slug = slugify(base);
    if (!slug) return slug;
    const taken = new Set(
      products
        .filter((p) => !editingProduct || String(p.id) !== String(editingProduct.id))
        .map((p) => p.slug)
    );
    if (!taken.has(slug)) return slug;
    let n = 2;
    while (taken.has(`${slug}-${n}`)) n += 1;
    return `${slug}-${n}`;
  };

  const handleSave = async () => {
    // Drop entirely-blank variant rows, then keep a clean shape.
    const cleanedVariants = form.variants
      .filter((v) => v.name.trim() || v.sku.trim() || Number(v.price) > 0 || Number(v.stock) > 0)
      .map((v) => ({
        id: v.id || newVariantId(),
        name: v.name.trim(),
        price: clampNum(v.price),
        stock: clampNum(v.stock, { int: true }),
        sku: v.sku.trim(),
      }));

    const name = form.name.trim();
    const priceTBA = !!form.priceTBA;
    const price = priceTBA ? null : clampNum(form.price);

    // ── Media, cleaned before it is judged ──────────────────────────────
    // The poster default is resolved HERE, where the primary image is known:
    // "the primary image at save" is a promise the manager cannot keep on its
    // own, because the merchant may still be moving the primary around.
    const primaryUrl =
      form.media.find((row) => row.type !== "video" && row.primary === true)?.url?.trim() || "";
    const media = form.media.map((row, index) => {
      const url = String(row.url ?? "").trim();
      if (row.type === "video") {
        return {
          ...row,
          url,
          poster: String(row.poster ?? "").trim() || primaryUrl,
          title: String(row.title ?? "").trim() || `Video ${index + 1}`,
        };
      }
      return {
        ...row,
        url,
        alt: String(row.alt ?? "").trim() || `${name} — image ${index + 1}`,
      };
    });

    // ── Validation ──────────────────────────────────────────────────────
    const nextErrors = {};
    if (!name) nextErrors.name = "Product name is required";

    const slug = makeUniqueSlug(form.slug || form.name);
    if (!slug) nextErrors.slug = "A URL-safe slug is required";

    if (!priceTBA && !(price > 0) && cleanedVariants.length === 0) {
      nextErrors.price =
        "Enter a price above 0, add a variant, or switch on “Price to be announced”";
    }

    const mediaCheck = validateMedia(media);
    if (!mediaCheck.ok) {
      nextErrors.media = mediaCheck.message || "Fix the highlighted media rows";
      if (Object.keys(mediaCheck.errors).length) nextErrors.mediaRows = mediaCheck.errors;
    }

    const categoryIds = [...(form.categoryIds || [])];
    const hasPrimaryCategory = form.categoryId !== "" && form.categoryId != null;
    if (hasPrimaryCategory && !categoryIds.some((id) => String(id) === String(form.categoryId))) {
      nextErrors.categoryIds = "The primary category has to be one of the categories";
    }

    // Two products cannot hold the same slide. The hero reads the whole
    // catalogue and sorts by this number, so a tie is a coin toss on the home
    // page — decided here, where the other products are known.
    const heroOrder = Number.isFinite(form.heroOrder) ? form.heroOrder : null;
    if (heroOrder != null) {
      const clash = products.find(
        (p) =>
          (!editingProduct || String(p.id) !== String(editingProduct.id)) &&
          Number(p.heroOrder) === heroOrder
      );
      if (clash) nextErrors.heroOrder = `Hero position ${heroOrder} is already used by ${clash.name}`;
    }

    const variantRowErrors = {};
    cleanedVariants.forEach((v, i) => {
      if (!v.name) variantRowErrors[i] = "Name required";
    });
    if (Object.keys(variantRowErrors).length) nextErrors.variantRows = variantRowErrors;

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      Swal.fire({
        icon: "warning", title: nextErrors.media || "Please fix the highlighted fields",
        toast: true, position: "bottom-end", showConfirmButton: false, timer: 3500,
      });
      return;
    }
    setErrors({});

    // Drop an all-zero dimensions object so the storefront spec table doesn't
    // render a meaningless "0 × 0 × 0" row for products without dimensions.
    const dims = {
      length: clampNum(form.dimensions.length),
      width: clampNum(form.dimensions.width),
      height: clampNum(form.dimensions.height),
    };
    const dimensions = dims.length || dims.width || dims.height ? dims : null;

    // The same rule for the ritual step: a step nobody NAMED is not a step, and
    // the order on its own is not a name. It matters beyond the empty label the
    // PDP would skip — the cart's cross-sell sorts candidates by
    // `ritualStep.order`, so a product left on the form's default 1 would join
    // the routine as its first step and start suggesting what comes next.
    const rsOrder = parseInt(form.ritualStep?.order, 10);
    const rsLabel = String(form.ritualStep?.label ?? "").trim();
    const rsFrequency = String(form.ritualStep?.frequency ?? "").trim();
    const ritualStep =
      !rsLabel && !rsFrequency
        ? null
        : {
            order: Number.isNaN(rsOrder) ? 1 : Math.max(1, rsOrder),
            label: rsLabel,
            frequency: rsFrequency,
          };

    // ── Payload ─────────────────────────────────────────────────────────
    // `images` is deliberately absent: it is DERIVED from `media` by
    // syncProductMedia() below (and again inside the api layer), and writing a
    // second opinion of it here is how the two get out of step.
    const editable = {
      name,
      shortName: form.shortName.trim(),
      slug,
      sku: form.sku.trim(),
      brand: form.brand.trim(),
      categoryId: form.categoryId === "" ? null : form.categoryId,
      categoryIds,
      concerns: cleanList(form.concerns),
      ritualStep,
      heroHeadline: form.heroHeadline.trim(),
      heroSubtext: form.heroSubtext.trim(),
      heroOrder,
      promise: form.promise.trim(),
      shortDescription: form.shortDescription,
      description: form.description,
      price,
      priceTBA,
      // Null, not "": the seed stores `null` for a product whose price has no
      // source yet, and a round trip must not turn that into an empty string.
      priceSource: form.priceSource.trim() || null,
      comparePrice: clampNum(form.comparePrice),
      costPrice: clampNum(form.costPrice),
      currency: form.currency || "INR",
      size: form.size.trim(),
      stock: clampNum(form.stock, { int: true }),
      lowStockThreshold: clampNum(form.lowStockThreshold, { int: true, fallback: 10 }),
      weight: clampNum(form.weight),
      dimensions,
      variants: cleanedVariants,
      badges: cleanList(form.badges),
      keyIngredients: cleanPairs(form.keyIngredients, "name", "benefit"),
      benefits: cleanList(form.benefits),
      howToUse: cleanList(form.howToUse),
      ingredientsList: form.ingredientsList.trim(),
      packClaims: cleanList(form.packClaims),
      fragranceNote: form.fragranceNote.trim(),
      caution: form.caution.trim(),
      suitableFor: cleanList(form.suitableFor),
      media,
      faqs: cleanPairs(form.faqs, "q", "a"),
      tags: tagsInput.split(",").map((s) => s.trim()).filter(Boolean),
      featured: form.featured, trending: form.trending, hot: form.hot,
      isNew: form.isNew, isActive: form.isActive,
      metaTitle: form.metaTitle, metaDescription: form.metaDescription,
    };

    // Sync here as well as in the api layer: this is the one place that can
    // still show the merchant what went wrong, and the record that leaves is
    // already consistent whichever mode it leaves through.
    const payload = syncProductMedia(
      // updateProduct PUTs the full record (mock) — merge over the original so
      // server-managed fields (rating, totalReviews, createdAt) survive the edit.
      editingProduct ? { ...editingProduct, ...editable } : editable
    );

    try {
      setSaving(true);
      if (editingProduct) {
        await apiService.admin.updateProduct(editingProduct.id, payload);
      } else {
        await apiService.admin.createProduct(payload);
      }
      setDialogOpen(false);
      Swal.fire({
        icon: "success", title: editingProduct ? "Product updated" : "Product created",
        toast: true, position: "bottom-end", showConfirmButton: false, timer: 2500,
      });
      loadData();
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    const result = await Swal.fire({
      title: "Delete product?", text: `"${p.name}" will be permanently deleted.`,
      icon: "warning", showCancelButton: true, confirmButtonColor: ADMIN_PALETTE.error.main, confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;
    try {
      await apiService.admin.deleteProduct(p.id);
      Swal.fire({ icon: "success", title: "Deleted", toast: true, position: "bottom-end", showConfirmButton: false, timer: 2000 });
      loadData();
    } catch (e) { Swal.fire({ icon: "error", title: "Error", text: e.message }); }
  };

  const getCategoryName = (id) => categories.find((c) => String(c.id) === String(id))?.name || "—";

  // What the gallery holds, at a glance: "3 img · 1 vid". normalizeProduct()
  // guarantees `media[]` on every record the admin reads, so a catalogue seeded
  // before media[] existed still counts its images here.
  const mediaCounts = (p) => {
    const rows = Array.isArray(p.media) ? p.media : [];
    const images = rows.filter((m) => m.type === "image").length;
    const videos = rows.filter((m) => m.type === "video").length;
    if (!images && !videos) return { label: "—" };
    const parts = [];
    if (images) parts.push(`${images} img`);
    if (videos) parts.push(`${videos} vid`);
    return { label: parts.join(" · ") };
  };
  const fc = (n) => formatPrice(n, { decimals: 0 });

  // For variant products the product-level stock is rarely the real figure, so
  // show the summed variant stock; the chip colour follows the same total.
  const effectiveStock = (p) =>
    Array.isArray(p.variants) && p.variants.length > 0
      ? p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
      : p.stock;

  const toggleFlag = (key) => setFlagFilters((f) => ({ ...f, [key]: !f[key] }));

  const FLAG_CHIPS = [
    { key: "hero", label: "Hero", test: (p) => Number.isFinite(p.heroOrder) },
    { key: "tba", label: "Price on launch", test: (p) => !!p.priceTBA },
    { key: "drafts", label: "Drafts", test: (p) => p.isActive === false },
  ];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q);
    const matchCat = categoryFilter === "all" || String(p.categoryId) === String(categoryFilter);
    const matchFlags = FLAG_CHIPS.every(({ key, test }) => !flagFilters[key] || test(p));
    return matchSearch && matchCat && matchFlags;
  });

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold">Products</Typography>
          <Typography variant="body2" color="text.secondary">Manage your product catalogue</Typography>
        </Box>
        <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={openCreate}>
          Add Product
        </Button>
      </Box>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider", display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <TextField
            placeholder="Search by name, SKU or brand..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            size="small" sx={{ flex: 1, minWidth: 220, maxWidth: 360 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Icon icon="mdi:magnify" /></InputAdornment> }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="product-category-filter-label">Category</InputLabel>
            <Select
              labelId="product-category-filter-label"
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((c) => (<MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>))}
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {FLAG_CHIPS.map(({ key, label }) => (
              <Chip
                key={key}
                label={label}
                size="small"
                clickable
                onClick={() => toggleFlag(key)}
                color={flagFilters[key] ? "primary" : "default"}
                variant={flagFilters[key] ? "filled" : "outlined"}
                aria-pressed={flagFilters[key]}
              />
            ))}
          </Box>
        </Box>
        {/* Horizontal scroll keeps all 10 columns reachable on small screens. */}
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 1160 }}>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Hero</TableCell>
                <TableCell>Media</TableCell>
                <TableCell>Flags</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (<TableRow key={i}><TableCell colSpan={10}><Skeleton height={56} /></TableCell></TableRow>))
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No products found</Typography></TableCell></TableRow>
              ) : (
                filtered.map((p) => {
                  const stock = effectiveStock(p);
                  const hasStock = typeof stock === "number";
                  const media = mediaCounts(p);
                  return (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar src={p.images?.[0]} alt="" variant="rounded" sx={{ width: 48, height: 48, bgcolor: "action.hover" }}>
                            <Icon icon="mdi:package-variant" style={{ fontSize: 22 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                            {p.brand && <Typography variant="caption" color="text.secondary">{p.brand}</Typography>}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{p.sku || "—"}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{getCategoryName(p.categoryId)}</Typography></TableCell>
                      <TableCell>
                        {p.priceTBA ? (
                          <Chip label="Price on launch" size="small" color="warning" sx={{ height: 22, fontSize: "0.7rem" }} />
                        ) : (
                          <>
                            <Typography variant="body2" fontWeight={500}>{fc(p.price)}</Typography>
                            {p.comparePrice > p.price && <Typography variant="caption" color="text.secondary" sx={{ textDecoration: "line-through" }}>{fc(p.comparePrice)}</Typography>}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={hasStock ? stock : "N/A"}
                          size="small"
                          color={!hasStock ? "default" : stock === 0 ? "error" : stock <= (p.lowStockThreshold || 10) ? "warning" : "success"}
                        />
                      </TableCell>
                      <TableCell>
                        {Number.isFinite(p.heroOrder) ? (
                          <Chip label={`#${p.heroOrder}`} size="small" color="primary" sx={{ height: 22, fontSize: "0.7rem" }} />
                        ) : (
                          <Typography variant="body2" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>{media.label}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {p.featured && <Chip label="Featured" size="small" color="primary" sx={{ height: 20, fontSize: "0.65rem" }} />}
                          {p.isNew && <Chip label="New" size="small" color="info" sx={{ height: 20, fontSize: "0.65rem" }} />}
                          {p.trending && <Chip label="Trending" size="small" color="secondary" sx={{ height: 20, fontSize: "0.65rem" }} />}
                          {p.hot && <Chip label="Hot" size="small" color="error" sx={{ height: 20, fontSize: "0.65rem" }} />}
                        </Box>
                      </TableCell>
                      <TableCell><Chip label={p.isActive !== false ? "Active" : "Draft"} size="small" color={p.isActive !== false ? "success" : "default"} /></TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)}><Icon icon="mdi:pencil-outline" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(p)}><Icon icon="mdi:delete-outline" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        fullScreen={fullScreen}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>{editingProduct ? "Edit Product" : "New Product"}</DialogTitle>
        <DialogContent dividers>
          <ProductFormSections
            form={form}
            errors={errors}
            setField={setField}
            setDimension={setDimension}
            setRitualStep={setRitualStep}
            categories={categories}
            concerns={concerns}
            currencySymbol={currencySymbol}
            tagsInput={tagsInput}
            setTagsInput={setTagsInput}
            onNameChange={handleNameChange}
            onSlugBlur={(e) => setField("slug", slugify(e.target.value))}
            clampNum={clampNum}
            addVariant={addVariant}
            updateVariant={updateVariant}
            removeVariant={removeVariant}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : editingProduct ? "Save Changes" : "Create Product"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProducts;
