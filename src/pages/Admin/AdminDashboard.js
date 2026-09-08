import React, { useState, useEffect } from "react";
import {
  Box, Grid, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, Skeleton,
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import { useStoreSettings } from "../../context/StoreSettingsContext";

// Keep status chip labels/colors identical to the Orders page (src/pages/Admin/AdminOrders.js)
const FULFILLMENT_STATUS = {
  unfulfilled: { label: "Unfulfilled", color: "warning" },
  partially_fulfilled: { label: "Partial", color: "info" },
  fulfilled: { label: "Fulfilled", color: "success" },
  returned: { label: "Returned", color: "secondary" },
  cancelled: { label: "Cancelled", color: "error" },
};
const PAYMENT_STATUS = {
  pending: { label: "Pending", color: "warning" },
  paid: { label: "Paid", color: "success" },
  partially_paid: { label: "Partial", color: "info" },
  refunded: { label: "Refunded", color: "secondary" },
  failed: { label: "Failed", color: "error" },
  voided: { label: "Voided", color: "default" },
};

// `tone` names a palette channel, never a colour: the admin has one palette and
// the cards read it, so a change in adminTheme.js repaints the dashboard.
const StatCard = ({ title, value, icon, tone = "primary", subtitle, onClick }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <Paper
      elevation={0}
      onClick={onClick}
      sx={(theme) => ({
        p: 2.5, border: "1px solid", borderColor: "divider",
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick ? { borderColor: theme.palette[tone].main } : {},
        transition: "border-color 0.2s",
      })}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
          <Typography variant="h4">{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>{subtitle}</Typography>}
        </Box>
        <Box
          sx={(theme) => ({
            width: 42, height: 42, borderRadius: 1, display: "flex",
            alignItems: "center", justifyContent: "center",
            bgcolor: alpha(theme.palette[tone].main, 0.12),
            color: theme.palette[tone].main,
          })}
        >
          <Icon icon={icon} style={{ fontSize: 22 }} />
        </Box>
      </Box>
    </Paper>
  </motion.div>
);

const AdminDashboard = () => {
  // Currency comes from the admin's own Settings > General, so every figure
  // on this screen speaks the same money as the storefront.
  const { formatPrice } = useStoreSettings();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0,
    pendingOrders: 0, pendingReturns: 0, lowStockProducts: 0, activeCoupons: 0,
    // Prompt 34 — the content counts. Every one is read with `?? 0` below, so a
    // live backend that has not added them to /admin/dashboard/stats yet leaves
    // the four tiles at zero rather than printing "undefined".
    heroProducts: 0, activeRituals: 0, liveAnnouncements: 0, priceOnLaunchProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashStats, orders, products] = await Promise.all([
        apiService.admin.getDashboardStats(),
        apiService.admin.getOrders(),
        apiService.admin.getProducts(),
      ]);
      setStats(dashStats);
      // Sort by recency so newly placed orders surface first regardless of source ordering.
      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentOrders(sortedOrders.slice(0, 5));
      setLowStockProducts(
        products
          .filter((p) => p.stock !== undefined && p.stock <= (p.lowStockThreshold || 10))
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 5)
      );
    } catch (error) {
      console.error("Dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Matches the currency style used across the admin pages (Orders, Payments, Users…).
  const fc = (n) => formatPrice(n, { decimals: 0 });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—";

  if (loading) return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Welcome back! Here's your store overview.</Typography>
      <Grid container spacing={3}>
        {[1,2,3,4].map((i) => (<Grid item xs={12} sm={6} lg={3} key={i}><Skeleton variant="rounded" height={130} sx={{}} /></Grid>))}
      </Grid>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {[1,2,3,4].map((i) => (<Grid item xs={6} sm={3} key={i}><Skeleton variant="rounded" height={72} sx={{}} /></Grid>))}
      </Grid>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {[1,2,3,4].map((i) => (<Grid item xs={6} sm={3} key={`content-${i}`}><Skeleton variant="rounded" height={72} sx={{}} /></Grid>))}
      </Grid>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} lg={7}><Skeleton variant="rounded" height={320} sx={{}} /></Grid>
        <Grid item xs={12} lg={5}><Skeleton variant="rounded" height={320} sx={{}} /></Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Dashboard</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Welcome back! Here's your store overview.</Typography>

      {/* Primary Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Revenue" value={fc(stats.totalRevenue)} icon="mdi:currency-inr" tone="primary" subtitle="All time" onClick={() => navigate("/admin/payments")} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Orders" value={stats.totalOrders} icon="mdi:shopping-outline" tone="success" subtitle={`${stats.pendingOrders} pending`} onClick={() => navigate("/admin/orders")} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Products" value={stats.totalProducts} icon="mdi:package-variant" tone="secondary" subtitle={stats.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : "All in stock"} onClick={() => navigate("/admin/products")} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard title="Total Users" value={stats.totalUsers} icon="mdi:account-group-outline" tone="info" onClick={() => navigate("/admin/users")} />
        </Grid>
      </Grid>

      {/* Secondary Stats */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={(theme) => ({ p: 2, border: "1px solid", borderColor: "divider", cursor: "pointer", "&:hover": { borderColor: theme.palette.warning.main } })} onClick={() => navigate("/admin/orders")}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={(theme) => ({ p: 1, bgcolor: alpha(theme.palette.warning.main, 0.12), borderRadius: 1, display: "flex", color: theme.palette.warning.main })}><Icon icon="mdi:clock-outline" style={{ fontSize: 20 }} /></Box>
              <Box><Typography variant="caption" color="text.secondary">Pending Orders</Typography><Typography variant="h6" fontWeight="bold">{stats.pendingOrders}</Typography></Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={(theme) => ({ p: 2, border: "1px solid", borderColor: "divider", cursor: "pointer", "&:hover": { borderColor: theme.palette.error.main } })} onClick={() => navigate("/admin/returns")}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={(theme) => ({ p: 1, bgcolor: alpha(theme.palette.error.main, 0.12), borderRadius: 1, display: "flex", color: theme.palette.error.main })}><Icon icon="mdi:backup-restore" style={{ fontSize: 20 }} /></Box>
              <Box><Typography variant="caption" color="text.secondary">Pending Returns</Typography><Typography variant="h6" fontWeight="bold">{stats.pendingReturns}</Typography></Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={(theme) => ({ p: 2, border: "1px solid", borderColor: "divider", cursor: "pointer", "&:hover": { borderColor: theme.palette.warning.main } })} onClick={() => navigate("/admin/products")}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={(theme) => ({ p: 1, bgcolor: alpha(theme.palette.warning.main, 0.12), borderRadius: 1, display: "flex", color: theme.palette.warning.main })}><Icon icon="mdi:alert-circle-outline" style={{ fontSize: 20 }} /></Box>
              <Box><Typography variant="caption" color="text.secondary">Low Stock</Typography><Typography variant="h6" fontWeight="bold">{stats.lowStockProducts}</Typography></Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper elevation={0} sx={(theme) => ({ p: 2, border: "1px solid", borderColor: "divider", cursor: "pointer", "&:hover": { borderColor: theme.palette.secondary.main } })} onClick={() => navigate("/admin/coupons")}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={(theme) => ({ p: 1, bgcolor: alpha(theme.palette.secondary.main, 0.12), borderRadius: 1, display: "flex", color: theme.palette.secondary.main })}><Icon icon="mdi:tag-outline" style={{ fontSize: 20 }} /></Box>
              <Box><Typography variant="caption" color="text.secondary">Active Coupons</Typography><Typography variant="h6" fontWeight="bold">{stats.activeCoupons}</Typography></Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Storefront content — the collections Prompt 34 made editable. Each tile
          opens the screen that owns the number, so a zero is one click from the
          place it is fixed. */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {[
          {
            label: "Hero products",
            value: stats.heroProducts ?? 0,
            icon: "mdi:view-carousel-outline",
            tone: "primary",
            path: "/admin/hero-section",
          },
          {
            label: "Rituals",
            value: stats.activeRituals ?? 0,
            icon: "mdi:spa-outline",
            tone: "success",
            path: "/admin/rituals",
          },
          {
            label: "Announcements live",
            value: stats.liveAnnouncements ?? 0,
            icon: "mdi:bullhorn-outline",
            tone: "info",
            path: "/admin/announcements",
          },
          {
            label: "Price on launch",
            value: stats.priceOnLaunchProducts ?? 0,
            icon: "mdi:tag-off-outline",
            tone: "warning",
            path: "/admin/products",
          },
        ].map((tile) => (
          <Grid item xs={6} sm={3} key={tile.label}>
            <Paper
              elevation={0}
              sx={(theme) => ({ p: 2, height: "100%", border: "1px solid", borderColor: "divider", cursor: "pointer", "&:hover": { borderColor: theme.palette[tile.tone].main } })}
              onClick={() => navigate(tile.path)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={(theme) => ({ p: 1, bgcolor: alpha(theme.palette[tile.tone].main, 0.12), borderRadius: 1, display: "flex", color: theme.palette[tile.tone].main })}>
                  <Icon icon={tile.icon} style={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">{tile.label}</Typography>
                  <Typography variant="h6" fontWeight="bold">{tile.value}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Tables */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {/* Recent Orders */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" fontWeight="bold">Recent Orders</Typography>
              <Button size="small" onClick={() => navigate("/admin/orders")} sx={{ textTransform: "none" }}>View All</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="center">Items</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Payment</TableCell>
                    <TableCell>Fulfillment</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentOrders.map((order) => {
                    const psc = PAYMENT_STATUS[order.paymentStatus] || { label: order.paymentStatus, color: "default" };
                    const fsc = FULFILLMENT_STATUS[order.fulfillmentStatus] || { label: order.fulfillmentStatus, color: "default" };
                    return (
                    <TableRow key={order.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate("/admin/orders")}>
                      <TableCell><Typography variant="body2" fontWeight={600} noWrap>{order.orderNumber}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap>{order.billingAddress?.firstName} {order.billingAddress?.lastName}</Typography>
                        {order.billingAddress?.city && <Typography variant="caption" color="text.secondary">{order.billingAddress.city}</Typography>}
                      </TableCell>
                      <TableCell align="center"><Typography variant="body2">{order.items?.length || 0}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={500}>{fc(order.total)}</Typography></TableCell>
                      <TableCell><Chip label={psc.label} size="small" color={psc.color} sx={{ height: 22, fontSize: "0.7rem" }} /></TableCell>
                      <TableCell><Chip label={fsc.label} size="small" color={fsc.color} sx={{ height: 22, fontSize: "0.7rem" }} /></TableCell>
                      <TableCell><Typography variant="caption" noWrap>{formatDate(order.createdAt)}</Typography></TableCell>
                    </TableRow>
                    );
                  })}
                  {recentOrders.length === 0 && (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No orders yet</Typography></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Low Stock Alert */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
            <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" fontWeight="bold">Low Stock Alert</Typography>
              <Button size="small" onClick={() => navigate("/admin/products")} sx={{ textTransform: "none" }}>Manage</Button>
            </Box>
            <Box sx={{ p: 1 }}>
              {lowStockProducts.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 5 }}>
                  <Box component={Icon} icon="mdi:check-circle-outline" sx={{ fontSize: 48, color: "success.main" }} />
                  <Typography color="text.secondary" sx={{ mt: 1 }}>All products well stocked</Typography>
                </Box>
              ) : (
                lowStockProducts.map((p, i) => (
                  <Box key={p.id} sx={{ display: "flex", alignItems: "center", gap: 2, p: 1.5, borderBottom: i < lowStockProducts.length - 1 ? "1px solid" : "none", borderColor: "divider" }}>
                    <Avatar src={p.images?.[0]} variant="rounded" sx={{ width: 40, height: 40, bgcolor: "action.hover" }}>
                      <Icon icon="mdi:package-variant" />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={500} noWrap>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">SKU: {p.sku}</Typography>
                    </Box>
                    <Chip
                      label={`${p.stock} left`}
                      size="small"
                      color={p.stock === 0 ? "error" : "warning"}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Links */}
      <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider", mt: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Quick Actions</Typography>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1 }}>
          {[
            { label: "Add Product", icon: "mdi:plus-box", path: "/admin/products" },
            { label: "View Orders", icon: "mdi:shopping-outline", path: "/admin/orders" },
            { label: "Create Coupon", icon: "mdi:tag-plus", path: "/admin/coupons" },
            { label: "Add Category", icon: "mdi:shape-plus", path: "/admin/categories" },
            { label: "Shipping Setup", icon: "mdi:truck-outline", path: "/admin/shipping" },
            { label: "View Returns", icon: "mdi:backup-restore", path: "/admin/returns" },
            { label: "Edit Home Hero", icon: "mdi:view-carousel-outline", path: "/admin/hero-section" },
            { label: "Manage Content", icon: "mdi:text-box-edit-outline", path: "/admin/content" },
          ].map((qa) => (
            <Button
              key={qa.label} variant="outlined" size="small"
              startIcon={<Icon icon={qa.icon} />}
              onClick={() => navigate(qa.path)}
              sx={{ color: "text.primary" }}
            >
              {qa.label}
            </Button>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
