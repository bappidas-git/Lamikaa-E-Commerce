import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ThemeProvider } from "@mui/material/styles";
import buildAdminTheme, {
  ADMIN_DEFAULT_MODE,
  adminThemeMode,
} from "../theme/adminTheme";

// =============================================================================
// ADMIN THEME CONTEXT — the back office's light/dark switch
// =============================================================================
// The STOREFRONT has one theme and no toggle (see `context/ThemeContext`): it is
// a showroom, and a shopper does not choose the lighting. The ADMIN is a tool
// somebody sits in front of all day, in a warehouse office at noon and at a
// desk at midnight, so it has both — and DARK IS THE DEFAULT, because that is
// the ground the panel was drawn on.
//
// WHERE IT SITS. One provider above the whole `/admin` route tree
// (`components/AdminLayout/AdminShell`), so the sign-in screen and the shell
// share one choice and there is no flash of the other mode on the way in.
//
// WHAT IT OWNS
//   • the mode, persisted per browser under `lamikaa-admin-theme`. It is a
//     PREFERENCE, not store data: it belongs to the person at the keyboard, not
//     to the shop, so it is not written to the API where it would follow every
//     administrator to every machine.
//   • the MUI theme built from it, handed down through a real `ThemeProvider`
//     so every admin screen picks the mode up without being touched.
//
// TOLERANT OF NO PROVIDER. `useAdminTheme()` falls back to a dark theme rather
// than throwing, so an admin screen rendered on its own — a test, a storybook,
// a future embed — still paints. Nothing about the mode is required for a
// screen to work.
//
// The BODY CLASS that follows the mode (SweetAlert2, the page scrollbars and
// the overscroll ground all live outside the MUI tree) is set by
// `hooks/useAdminBodyClass`, which every admin screen already calls.
// =============================================================================

export const ADMIN_THEME_STORAGE_KEY = "lamikaa-admin-theme";

const readStoredMode = () => {
  try {
    const stored = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : ADMIN_DEFAULT_MODE;
  } catch {
    // Storage can be unavailable (private mode, blocked cookies). The default
    // is the answer; a preference nobody can store is not an error.
    return ADMIN_DEFAULT_MODE;
  }
};

const AdminThemeContext = createContext(null);

export const AdminThemeProvider = ({ children }) => {
  const [mode, setModeState] = useState(readStoredMode);

  const setMode = useCallback((next) => {
    setModeState(adminThemeMode(next));
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, mode);
    } catch {
      // Nothing to recover: the mode still applies for this session.
    }
  }, [mode]);

  // Rebuilt only when the mode changes. `buildAdminTheme` also re-points the
  // out-of-tree `ADMIN_PALETTE` (SweetAlert2's confirm colours), so that
  // happens here rather than in a second effect somebody has to remember.
  const theme = useMemo(() => buildAdminTheme(mode), [mode]);

  const value = useMemo(
    () => ({ mode, theme, setMode, toggleMode, isDark: mode === "dark" }),
    [mode, theme, setMode, toggleMode]
  );

  return (
    <AdminThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AdminThemeContext.Provider>
  );
};

/**
 * The admin's theme mode and its switch.
 *
 * @returns {{
 *   mode: "dark"|"light",
 *   isDark: boolean,
 *   theme: object,
 *   setMode: (mode: string) => void,
 *   toggleMode: () => void,
 * }}
 */
export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext);
  // No provider: the designed default, so a screen mounted outside the admin
  // shell still has a complete, working theme.
  const fallback = useMemo(() => {
    if (context) return null;
    const theme = buildAdminTheme(ADMIN_DEFAULT_MODE);
    return {
      mode: ADMIN_DEFAULT_MODE,
      isDark: ADMIN_DEFAULT_MODE === "dark",
      theme,
      setMode: () => {},
      toggleMode: () => {},
    };
  }, [context]);
  return context || fallback;
};

export default AdminThemeContext;
