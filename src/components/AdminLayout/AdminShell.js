import React from "react";
import { Outlet } from "react-router-dom";
import { AdminThemeProvider } from "../../context/AdminThemeContext";

// =============================================================================
// AdminShell — the route element above every /admin screen
// =============================================================================
// One job: put the admin's light/dark theme above BOTH halves of the admin
// route tree — the sign-in screen at `/admin` and the shell that owns everything
// under it — so the two share one stored preference and an administrator never
// sees a flash of the other mode while signing in.
//
// It is a separate module (rather than an inline element in App.js) so it stays
// inside the lazily loaded admin bundle: a storefront visitor must not download
// the admin theme, and `App.js` only ever names the lazy component.
// =============================================================================

const AdminShell = () => (
  <AdminThemeProvider>
    <Outlet />
  </AdminThemeProvider>
);

export default AdminShell;
