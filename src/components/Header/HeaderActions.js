import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuItem, Avatar, Typography, Divider } from "@mui/material";
import {
  PersonOutline,
  ListAltOutlined,
  FavoriteBorder,
  LogoutOutlined,
  LoginOutlined,
  PersonAddAltOutlined,
} from "@mui/icons-material";
import { Icon } from "@iconify/react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui";
import styles from "./Header.module.css";

// =============================================================================
// HeaderActions — search, account, wishlist and cart
// =============================================================================
//
// The masthead's right-hand cluster, lifted out of Header.js so the header file
// is a layout and a set of states rather than a layout, a set of states and a
// dropdown menu. Every handler still belongs to the header (it owns the cart
// drawer, the search overlay and the auth modal), so they arrive as props —
// this component owns exactly one piece of state, the account menu's anchor.
//
// THE ACCOUNT MENU is the existing MUI Menu, moved here unchanged: greeting,
// My Profile, My Orders, My Wishlist, Logout when signed in; Login and Register
// when not. Only its paper is restyled (glass + hairline, via PaperProps).
//
// WHAT SHOWS WHERE. Search and cart are on every width. Account and wishlist
// step out at 768px, where the drawer and the bottom nav already carry both —
// and they do it in CSS, not through a media-query hook, so a viewport that
// narrows mid-render cannot flash a five-button row into a 360px masthead.
//
// THE BADGE is a span, not MUI's <Badge>: an 18px gold disc with near-black
// numerals, capped at 99, marked aria-hidden because the button's own label
// already reads "Cart, 3 items".
// =============================================================================

const BADGE_MAX = 99;

const formatCount = (n) => (n > BADGE_MAX ? `${BADGE_MAX}+` : String(n));

const CountBadge = ({ count }) =>
  count > 0 ? (
    <span className={styles.badge} aria-hidden="true">
      {formatCount(count)}
    </span>
  ) : null;

const HeaderActions = ({
  cartCount = 0,
  wishlistCount = 0,
  onSearch,
  onCart,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleUserMenuOpen = (e) => {
    if (isAuthenticated) {
      setUserMenuAnchor(e.currentTarget);
    } else {
      openAuthModal("login");
    }
  };

  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleMenuNavigate = (path) => {
    handleUserMenuClose();
    navigate(path);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
    navigate("/");
  };

  const items = (n) => `${n} ${n === 1 ? "item" : "items"}`;

  return (
    <div className={styles.actions}>
      <Button
        variant="icon"
        icon="mdi:magnify"
        onClick={onSearch}
        aria-label="Search"
        className={styles.action}
      />

      {/* Account — hidden ≤768px, where the drawer carries the same links. */}
      <Button
        variant="icon"
        onClick={handleUserMenuOpen}
        aria-label={isAuthenticated ? "Account menu" : "Log in"}
        aria-haspopup={isAuthenticated ? "menu" : undefined}
        aria-expanded={isAuthenticated ? Boolean(userMenuAnchor) : undefined}
        className={`${styles.action} ${styles.actionAccount}`}
        icon={
          isAuthenticated && user ? (
            /* The initial is a portrait, not a label: left exposed it becomes
               the button's visible text ("B"), which the "Account menu" name
               cannot contain — so voice control has nothing to match on
               (WCAG 2.5.3). */
            <Avatar className={styles.avatar} aria-hidden="true">
              {(user.firstName || user.name || "U").charAt(0).toUpperCase()}
            </Avatar>
          ) : (
            <Icon icon="mdi:account-outline" aria-hidden="true" />
          )
        }
      />

      {/* Wishlist — hidden ≤768px (drawer + bottom nav). */}
      <Button
        variant="icon"
        onClick={() => navigate("/wishlist")}
        aria-label={`Wishlist, ${items(wishlistCount)}`}
        className={`${styles.action} ${styles.actionWishlist}`}
        icon={
          <>
            <Icon icon="mdi:heart-outline" aria-hidden="true" />
            <CountBadge count={wishlistCount} />
          </>
        }
      />

      <Button
        variant="icon"
        onClick={onCart}
        aria-label={`Cart, ${items(cartCount)}`}
        className={styles.action}
        icon={
          <>
            <Icon icon="mdi:shopping-outline" aria-hidden="true" />
            <CountBadge count={cartCount} />
          </>
        }
      />

      {/* ===== ACCOUNT DROPDOWN ===== */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        className={styles.userMenu}
        PaperProps={{
          className: styles.userMenuPaper,
          elevation: 0,
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {isAuthenticated
          ? [
              <div key="greeting" className={styles.menuGreeting}>
                <Avatar
                  className={styles.menuAvatar}
                  sx={{ width: 36, height: 36 }}
                >
                  {(user?.firstName || user?.name || "U").charAt(0).toUpperCase()}
                </Avatar>
                <div className={styles.menuIdentity}>
                  <Typography variant="subtitle2" className={styles.menuUserName}>
                    {user?.firstName || user?.name || "User"}
                  </Typography>
                  <Typography variant="caption" className={styles.menuUserEmail}>
                    {user?.email || ""}
                  </Typography>
                </div>
              </div>,
              <Divider key="div1" className={styles.menuDivider} />,
              <MenuItem
                key="profile"
                onClick={() => handleMenuNavigate("/profile")}
                className={styles.menuItem}
              >
                <PersonOutline fontSize="small" className={styles.menuItemIcon} />
                My Profile
              </MenuItem>,
              <MenuItem
                key="orders"
                onClick={() => handleMenuNavigate("/orders")}
                className={styles.menuItem}
              >
                <ListAltOutlined fontSize="small" className={styles.menuItemIcon} />
                My Orders
              </MenuItem>,
              <MenuItem
                key="wishlist"
                onClick={() => handleMenuNavigate("/wishlist")}
                className={styles.menuItem}
              >
                <FavoriteBorder fontSize="small" className={styles.menuItemIcon} />
                My Wishlist
              </MenuItem>,
              <Divider key="div2" className={styles.menuDivider} />,
              <MenuItem
                key="logout"
                onClick={handleLogout}
                className={`${styles.menuItem} ${styles.logoutItem}`}
              >
                <LogoutOutlined fontSize="small" className={styles.menuItemIcon} />
                Logout
              </MenuItem>,
            ]
          : [
              <MenuItem
                key="login"
                onClick={() => {
                  handleUserMenuClose();
                  openAuthModal("login");
                }}
                className={styles.menuItem}
              >
                <LoginOutlined fontSize="small" className={styles.menuItemIcon} />
                Login
              </MenuItem>,
              <MenuItem
                key="register"
                onClick={() => {
                  handleUserMenuClose();
                  openAuthModal("signup");
                }}
                className={styles.menuItem}
              >
                <PersonAddAltOutlined
                  fontSize="small"
                  className={styles.menuItemIcon}
                />
                Register
              </MenuItem>,
            ]}
      </Menu>
    </div>
  );
};

export default HeaderActions;
