import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ThemeProvider, alpha } from "@mui/material/styles";
import { Icon } from "@iconify/react";
import { useAdmin } from "../../context/AdminContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import Logo from "../../components/brand/Logo";
import brand from "../../config/brand";
import buildAdminTheme from "../../theme/adminTheme";
import useAdminBodyClass from "../../hooks/useAdminBodyClass";
import { setPageTitle } from "../../utils/documentTitle";

// The same <Logo> the storefront renders. One wordmark on a transparent ground:
// it reads on the login card's glass without a variant to pick.
const LOGO_WIDTH = 210;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: adminLoading } = useAdmin();
  const { storeName } = useStoreSettings();
  useAdminBodyClass();

  // Name the tab like every other admin screen. No release: signing in unmounts
  // this route into AdminLayout, which claims the tab for the screen it lands on.
  useEffect(() => {
    setPageTitle(`Sign in \u00b7 Admin \u00b7 ${brand.name}`);
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the server error and this field's inline error as the user types.
    setError("");
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Basic client-side validation: required fields + a sane email format, so
  // obvious mistakes are caught before we hit the API.
  const validate = () => {
    const next = {};
    const email = formData.email.trim();
    if (!email) next.email = "Email is required";
    else if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address";
    if (!formData.password) next.password = "Password is required";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setIsLoading(true);
    const result = await login({ ...formData, email: formData.email.trim() });

    if (result.success) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError(result.error || "Invalid credentials");
      setIsLoading(false);
    }
  };

  // One admin theme — dark, like the rest of the app. Built once so the
  // login card is not re-themed on every keystroke.
  const adminTheme = useMemo(() => buildAdminTheme(), []);

  // Wait for the sessionStorage restore before deciding what to render, so an
  // already-authenticated admin never sees a flash of the login form.
  if (adminLoading) {
    return (
      <ThemeProvider theme={adminTheme}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  // Already authenticated → go straight to the dashboard.
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <ThemeProvider theme={adminTheme}>
    {/* THE DOOR IS A <main> (Prompt 38). This screen renders outside
        AdminLayout, so it inherited none of the shell's landmarks: axe found
        the whole sign-in card sitting in no landmark at all (`region` x9), no
        `main` (`landmark-one-main`) and no h1. `component="main"` and the h1
        below are the whole fix — nothing moves on screen. */}
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      {/* The admin's ONE pane of glass. Everything else in the panel is a flat
          surface; the door gets the storefront's treatment because it is the
          first LAMIKAA surface an administrator sees. */}
      <Paper
        elevation={0}
        sx={(theme) => ({
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 420,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: alpha(theme.palette.background.paper, 0.72),
          WebkitBackdropFilter: "blur(20px)",
          backdropFilter: "blur(20px)",
          "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))":
            { backgroundColor: theme.palette.background.paper },
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.55)",
        })}
      >
          {/* Logo/Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                }}
              >
                <Logo
                  width={LOGO_WIDTH}
                  alt={`${storeName} Admin`}
                  style={{ height: 60, width: "auto", maxWidth: "100%", display: "block" }}
                />
              </Box>
            </Box>
            {/* The page's h1. `variant` keeps the h6 type scale — the console
                title is not meant to shout — while `component` gives the
                document the level-one heading it was missing. */}
            <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>
              Admin Console
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sign in to manage {brand.name}
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              autoComplete="username"
              value={formData.email}
              onChange={handleChange}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email || " "}
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:email-outline" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password || " "}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon icon="mdi:lock-outline" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <Icon
                        icon={
                          showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"
                        }
                      />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ py: 1.25, fontSize: "0.95rem" }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <>
                  <Icon icon="mdi:login" style={{ marginRight: 8, fontSize: 20 }} />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Back to Store */}
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <Button
              onClick={() => navigate("/")}
              startIcon={<Icon icon="mdi:arrow-left" />}
              sx={{ color: "text.secondary" }}
            >
              Back to Store
            </Button>
          </Box>
      </Paper>
    </Box>
    </ThemeProvider>
  );
};

export default AdminLogin;
