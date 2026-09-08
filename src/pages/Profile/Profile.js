import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { fireAlert } from "../../utils/alerts";
import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../context/WishlistContext";
import apiService from "../../services/api";
import { formatDate, formatCurrency, getInitials, generateId, isValidPhone } from "../../utils/helpers";
import { collapse, reveal } from "../../theme/motion";
import { ROUTES } from "../../utils/constants";
import { Button, Chip, EmptyState, GlassCard } from "../../components/ui";
import { orderStatusInfo } from "../../utils/orderStatus";
import useSeo from "../../hooks/useSeo";
import styles from "./Profile.module.css";

// =============================================================================
// /profile — the account hub
// =============================================================================
//
// A dashboard and six sections behind it: personal details, addresses, payment
// methods, store credit, notifications and settings. The dashboard is two
// columns from 1025px — an identity card and the three figures on the left, the
// index and the recent orders on the right — and one column below that, in the
// order a phone reads it.
//
// WHAT PROMPT 30 CHANGED: the look, and one fact that had been written down
// twice. `deriveOrderStatus`/`STATUS_CONFIG` now live in `utils/orderStatus`,
// which Order History reads too, so the mini-records here can never label an
// order differently from the page they link to. Every handler, guard, effect
// and payload is otherwise untouched — including the address default rules, the
// legacy-row normalisation and the honest "—" while a figure is loading.
//
// HONEST FIGURES, STILL. Nothing on this page is invented: the counts are 0
// when empty and "—" while loading, the membership badge falls back to a
// neutral "Member" because the seeded user shape carries no tier, and the
// payment and notification sections say plainly that there is nothing stored
// rather than drawing controls that would not persist.
// =============================================================================

// SweetAlert2 takes a colour VALUE, not a token — it renders outside the React
// tree, and a per-call confirmButtonColor is set as an inline variable on the
// button (see the Swal block in App.css). This mirrors --sf-color-danger from
// storefront-tokens.css; keep the two in sync if that token is ever retuned.
const DANGER_HEX = "#FF8A80";

// Only render a membership badge when it's real or derivable from the user
// object. The seeded user shape carries no membership/tier field, so we never
// fabricate a paid "Premium" tier for everyone — we fall back to a neutral
// "Member" badge. The moment a real flag appears on the user, the gold
// "Premium Member" badge lights up automatically.
const getMembership = (user) => {
  const isPremium =
    !!user?.isPremium ||
    user?.membershipTier === "premium" ||
    (typeof user?.tier === "string" && user.tier.toLowerCase() === "premium");
  if (isPremium) return { label: "Premium Member", premium: true };
  return { label: "Member", premium: false };
};

// ---- Inline icon set ----------------------------------------------------
// Drawn at hairline weight (1.4) so the index rows read as an editorial list
// of marks, not a tray of app tiles. stroke = currentColor throughout.
const Icon = ({ name, size = 18, strokeWidth = 1.4 }) => {
  const icons = {
    orders: (
      <>
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </>
    ),
    location: (
      <>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    card: (
      <>
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </>
    ),
    wallet: (
      <>
        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
    lock: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
    chevron: <polyline points="9 18 15 12 9 6" />,
    back: <polyline points="15 18 9 12 15 6" />,
    person: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
    check: <polyline points="20 6 9 17 4 12" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icons[name] || null}
    </svg>
  );
};

// The gold seal that marks the default address — a hairline rosette rather than
// a filled pill, so "default" reads as a mark on the card, not a tag stuck to it.
const Seal = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.2l2.4 2.4 4.6-4.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Profile = () => {
  useSeo({
    title: "Your account",
    description: "Your LAMIKAA Naturals account, addresses and preferences.",
    noindex: true,
  });

  const navigate = useNavigate();
  // This page used to run its fades unconditionally — the one storefront
  // surface that never asked. Every motion prop below now goes through the
  // shared factories in theme/motion.js with this boolean.
  const shouldReduceMotion = useReducedMotion();
  const { user, isAuthenticated, isLoading: authLoading, logout, updateUser, openAuthModal } = useAuth();
  const { wishlistItems } = useWishlist();

  // null = dashboard (greeting + figures + index + recent orders + logout).
  // Otherwise one of: profile | addresses | payment | wallet | notifications | settings
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Account stats + recent orders (read-only fetches; real data only)
  const [orders, setOrders] = useState([]);
  const [reviewsCount, setReviewsCount] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Store-credit wallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTx, setWalletTx] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [addressForm, setAddressForm] = useState({
    id: null,
    label: "Home",
    firstName: "",
    lastName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  // Populate form data from user
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setAddresses(user.addresses || []);
    }
  }, [user]);

  // Clear feedback after 4 seconds
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => setFeedback({ type: "", message: "" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Load account stats (orders + reviews) once the user is known. Orders feed
  // both the Orders figure and the Recent Orders list; reviews feed the Reviews
  // figure. Counts are honest: 0 when empty, "—" while loading, and a failed
  // fetch leaves the figures at 0 rather than inventing numbers.
  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    (async () => {
      setStatsLoading(true);
      try {
        const [orderRes, reviewRes] = await Promise.all([
          apiService.orders.getByUserId(user.id),
          apiService.reviews.getMine(user.id).catch(() => []),
        ]);
        const orderData = Array.isArray(orderRes)
          ? orderRes
          : orderRes?.data || orderRes?.orders || [];
        const sorted = [...orderData].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        if (active) {
          setOrders(sorted);
          setReviewsCount(Array.isArray(reviewRes) ? reviewRes.length : 0);
        }
      } catch (e) {
        console.error("Load account stats error:", e);
        if (active) {
          setOrders([]);
          setReviewsCount(0);
        }
      } finally {
        if (active) setStatsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  // Load wallet balance + ledger when the Store Credit section is opened (fresh
  // from the API, so a refund issued by the admin in another session shows up).
  useEffect(() => {
    if (activeSection !== "wallet" || !user?.id) return;
    let active = true;
    (async () => {
      setWalletLoading(true);
      try {
        const [bal, tx] = await Promise.all([
          apiService.wallet.getBalance(user.id),
          apiService.wallet.getTransactions(user.id),
        ]);
        if (active) {
          setWalletBalance(Number(bal) || 0);
          setWalletTx(Array.isArray(tx) ? tx : []);
        }
      } catch (e) {
        console.error("Load wallet error:", e);
      } finally {
        if (active) setWalletLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [activeSection, user]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
  };

  const openSection = (section) => {
    setActiveSection(section);
    setFeedback({ type: "", message: "" });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToDashboard = () => {
    setActiveSection(null);
    resetAddressForm();
    setFeedback({ type: "", message: "" });
  };

  // ---- Profile handlers ----
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      showFeedback("error", "First name and last name are required.");
      return;
    }
    if (profileForm.phone && !isValidPhone(profileForm.phone)) {
      showFeedback("error", "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone.trim(),
      });
      showFeedback("success", "Profile updated successfully.");
    } catch (err) {
      showFeedback("error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Password handlers ----
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: "", key: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, label: "Weak", key: "weak" };
    if (score <= 4) return { level: 2, label: "Fair", key: "fair" };
    if (score <= 5) return { level: 3, label: "Good", key: "good" };
    return { level: 4, label: "Strong", key: "strong" };
  };

  const handlePasswordSubmit = async () => {
    if (!passwordForm.currentPassword) {
      showFeedback("error", "Please enter your current password.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showFeedback("error", "New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showFeedback("error", "New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiService.auth.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswords({ current: false, new: false, confirm: false });
      showFeedback("success", "Password updated successfully.");
    } catch (err) {
      showFeedback("error", "Failed to change password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Address handlers ----
  const resetAddressForm = () => {
    setAddressForm({
      id: null,
      label: "Home",
      firstName: "",
      lastName: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    });
    setShowAddressForm(false);
    setEditingAddressIndex(null);
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddressSave = async () => {
    if (
      !addressForm.firstName.trim() ||
      !addressForm.lastName.trim() ||
      !addressForm.addressLine1.trim() ||
      !addressForm.city.trim() ||
      !addressForm.state.trim() ||
      !addressForm.postalCode.trim()
    ) {
      showFeedback("error", "Please fill in all required address fields.");
      return;
    }
    if (!isValidPhone(addressForm.phone)) {
      showFeedback("error", "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      // Persist the canonical shape (firstName/lastName/postalCode + a stable
      // id) so the row round-trips with Checkout, Orders and db.json. New rows
      // get an id; edited rows keep theirs.
      const isFirst = addresses.length === 0;
      const entry = {
        ...addressForm,
        id: addressForm.id || generateId(),
        firstName: addressForm.firstName.trim(),
        lastName: addressForm.lastName.trim(),
        phone: addressForm.phone.trim(),
        country: addressForm.country || "India",
        // The first address is always the default; otherwise honour the box.
        isDefault: isFirst ? true : addressForm.isDefault,
      };

      let updatedAddresses = [...addresses];
      // "Default" is exclusive — clear it everywhere else before applying.
      if (entry.isDefault) {
        updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
      }
      if (editingAddressIndex !== null) {
        updatedAddresses[editingAddressIndex] = entry;
      } else {
        updatedAddresses.push(entry);
      }
      // Guard against zero defaults (e.g. un-checking default on the only row):
      // there must always be exactly one when addresses exist.
      if (updatedAddresses.length > 0 && !updatedAddresses.some((a) => a.isDefault)) {
        updatedAddresses[0] = { ...updatedAddresses[0], isDefault: true };
      }

      await updateUser({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      resetAddressForm();
      showFeedback(
        "success",
        editingAddressIndex !== null ? "Address updated successfully." : "Address added successfully."
      );
    } catch (err) {
      showFeedback("error", "Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressEdit = (index) => {
    const a = addresses[index] || {};
    // Normalise any legacy row (single fullName / zipCode) into the canonical
    // form shape so an edit always writes firstName/lastName/postalCode back.
    const [firstFromFull, ...restFromFull] = (a.fullName || "").trim().split(/\s+/);
    setAddressForm({
      id: a.id || null,
      label: a.label || "Home",
      firstName: a.firstName || firstFromFull || "",
      lastName: a.lastName || restFromFull.join(" ") || "",
      phone: a.phone || "",
      addressLine1: a.addressLine1 || "",
      addressLine2: a.addressLine2 || "",
      city: a.city || "",
      state: a.state || "",
      postalCode: a.postalCode || a.zipCode || "",
      country: a.country || "India",
      isDefault: !!a.isDefault,
    });
    setEditingAddressIndex(index);
    setShowAddressForm(true);
  };

  const handleAddressDelete = async (index) => {
    const result = await fireAlert({
      title: "Delete this address?",
      text: "This address will be removed from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: DANGER_HEX,
      confirmButtonText: "Delete",
      cancelButtonText: "Keep",
    });
    if (!result.isConfirmed) return;

    setLoading(true);
    try {
      const removedDefault = addresses[index]?.isDefault;
      let updatedAddresses = addresses.filter((_, i) => i !== index);
      // Deleting the default promotes the next remaining address (immutably —
      // never mutate the shared objects still referenced by state).
      if (removedDefault && updatedAddresses.length > 0) {
        updatedAddresses = updatedAddresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      await updateUser({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      // If we were editing the row we just deleted, drop the open form.
      if (editingAddressIndex === index) resetAddressForm();
      showFeedback("success", "Address deleted successfully.");
    } catch (err) {
      showFeedback("error", "Failed to delete address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (index) => {
    setLoading(true);
    try {
      const updatedAddresses = addresses.map((a, i) => ({
        ...a,
        isDefault: i === index,
      }));
      await updateUser({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      showFeedback("success", "Default address updated.");
    } catch (err) {
      showFeedback("error", "Failed to update default address.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Logout handler ----
  const handleLogout = async () => {
    // Confirm first so logging out isn't a one-click accident.
    const result = await fireAlert({
      title: "Log out?",
      text: "You'll need to sign in again to access your account.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: DANGER_HEX,
      confirmButtonText: "Log Out",
      cancelButtonText: "Stay Signed In",
    });
    if (!result.isConfirmed) return;

    try {
      await logout();
      navigate("/");
    } catch (err) {
      showFeedback("error", "Logout failed. Please try again.");
    }
  };

  // ---- Logged-out guard ----
  // While the session restore is still settling, render nothing so the account
  // UI never flashes before we know who (if anyone) is signed in.
  if (authLoading) return null;

  // Settled and not signed in → a branded prompt that opens the AuthModal, with
  // a navigation fallback if the customer dismisses it.
  if (!isAuthenticated || !user) {
    return (
      <div className={styles.page}>
        <section className="sf-section">
          <div className="sf-container">
            <motion.div {...reveal(shouldReduceMotion)}>
              <GlassCard padding="md" glow="gold" className={styles.gate}>
                <span className={styles.gateMark}>
                  <Icon name="person" size={30} strokeWidth={1} />
                </span>
                <p className="sf-eyebrow">Your account</p>
                <h1 className={styles.gateTitle}>Sign in to your account</h1>
                <p className={styles.gateText}>
                  Your orders, your addresses and your store credit are kept here,
                  waiting for you.
                </p>
                <div className={styles.gateActions}>
                  <Button variant="primary" onClick={() => openAuthModal("login")}>
                    Sign in
                  </Button>
                  <Button variant="secondary" to={ROUTES.SHOP}>
                    Continue shopping
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  const membership = getMembership(user);
  const passwordStrength = getPasswordStrength(passwordForm.newPassword);
  const recentOrders = orders.slice(0, 3);
  const greetingName = (user.firstName || "").trim();

  const statValue = (count) => (statsLoading ? "—" : count);

  const statusChip = (statusInfo) => (
    <Chip variant="status" tone={statusInfo.tone}>
      {statusInfo.label}
    </Chip>
  );

  // ---- Index rows (each opens an in-page section or navigates) ------------
  // One uniform list. No per-row tone: the only things that vary down the
  // column are the mark, the words, and whether there is a real count to show.
  const menuRows = [
    {
      id: "orders",
      icon: "orders",
      label: "Your orders",
      sub: "Track, return or buy again",
      badge: !statsLoading && orders.length > 0 ? orders.length : null,
      onClick: () => navigate("/orders"),
    },
    {
      id: "addresses",
      icon: "location",
      label: "Addresses",
      sub: "Where your parcels go",
      badge: addresses.length > 0 ? addresses.length : null,
      onClick: () => openSection("addresses"),
    },
    {
      id: "payment",
      icon: "card",
      label: "Payment methods",
      sub: "Saved cards & UPI",
      onClick: () => openSection("payment"),
    },
    {
      id: "wallet",
      icon: "wallet",
      label: "Store credit",
      sub: "Wallet balance & history",
      onClick: () => openSection("wallet"),
    },
    {
      id: "notifications",
      icon: "bell",
      label: "Notifications",
      sub: "Offers, updates & more",
      onClick: () => openSection("notifications"),
    },
    {
      id: "settings",
      icon: "settings",
      label: "Settings",
      sub: "Password & privacy",
      onClick: () => openSection("settings"),
    },
  ];

  // =====================================================================
  // Section renderers (reachable from the index / identity card)
  // =====================================================================
  const renderProfileSection = () => (
    <GlassCard padding="md" className={styles.section}>
      <p className={styles.sectionLead}>
        The name and number we use on your orders and deliveries.
      </p>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="pf-first">First name *</label>
          <input
            id="pf-first"
            type="text"
            name="firstName"
            autoComplete="given-name"
            value={profileForm.firstName}
            onChange={handleProfileChange}
            placeholder="First name"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="pf-last">Last name *</label>
          <input
            id="pf-last"
            type="text"
            name="lastName"
            autoComplete="family-name"
            value={profileForm.lastName}
            onChange={handleProfileChange}
            placeholder="Last name"
          />
        </div>
        <div className={styles.field}>
          <label htmlFor="pf-email">Email address</label>
          <input
            id="pf-email"
            type="email"
            name="email"
            autoComplete="email"
            value={profileForm.email}
            className={styles.readOnly}
            readOnly
          />
          <span className={styles.hint}>Email cannot be changed</span>
        </div>
        <div className={styles.field}>
          <label htmlFor="pf-phone">Phone number</label>
          <input
            id="pf-phone"
            type="tel"
            name="phone"
            autoComplete="tel"
            value={profileForm.phone}
            onChange={handleProfileChange}
            placeholder="10-digit mobile number"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleProfileSave} disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </GlassCard>
  );

  const renderAddressesSection = () => (
    <div className={styles.sectionStack}>
      <GlassCard padding="md" className={styles.section}>
        <div className={styles.sectionBar}>
          <p className={styles.sectionLead}>
            {addresses.length === 0
              ? "Save an address once and checkout will know where to send it."
              : `${addresses.length} address${addresses.length === 1 ? "" : "es"} on file. The default is offered first at checkout.`}
          </p>
          {!showAddressForm && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                resetAddressForm();
                setShowAddressForm(true);
              }}
            >
              Add an address
            </Button>
          )}
        </div>

        {showAddressForm && (
          <div className={styles.addrForm}>
            <h3 className={styles.addrFormTitle}>
              {editingAddressIndex !== null ? "Edit address" : "New address"}
            </h3>

            <div className={styles.labelChips} role="group" aria-label="Address label">
              {["Home", "Work", "Other"].map((label) => (
                <Chip
                  key={label}
                  as="button"
                  variant="glass"
                  active={addressForm.label === label}
                  aria-pressed={addressForm.label === label}
                  onClick={() => setAddressForm((prev) => ({ ...prev, label }))}
                >
                  {label}
                </Chip>
              ))}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="af-first">First name *</label>
                <input id="af-first" type="text" name="firstName" autoComplete="given-name" value={addressForm.firstName} onChange={handleAddressChange} placeholder="First name" />
              </div>
              <div className={styles.field}>
                <label htmlFor="af-last">Last name *</label>
                <input id="af-last" type="text" name="lastName" autoComplete="family-name" value={addressForm.lastName} onChange={handleAddressChange} placeholder="Last name" />
              </div>
              <div className={`${styles.field} ${styles.fieldWide}`}>
                <label htmlFor="af-phone">Phone number *</label>
                <input id="af-phone" type="tel" name="phone" autoComplete="tel" value={addressForm.phone} onChange={handleAddressChange} placeholder="10-digit mobile number" />
              </div>
              <div className={`${styles.field} ${styles.fieldWide}`}>
                <label htmlFor="af-line1">Address line 1 *</label>
                <input id="af-line1" type="text" name="addressLine1" autoComplete="address-line1" value={addressForm.addressLine1} onChange={handleAddressChange} placeholder="House/Flat No., Building, Street" />
              </div>
              <div className={`${styles.field} ${styles.fieldWide}`}>
                <label htmlFor="af-line2">Address line 2</label>
                <input id="af-line2" type="text" name="addressLine2" autoComplete="address-line2" value={addressForm.addressLine2} onChange={handleAddressChange} placeholder="Landmark, Area (optional)" />
              </div>
              <div className={styles.field}>
                <label htmlFor="af-city">City *</label>
                <input id="af-city" type="text" name="city" autoComplete="address-level2" value={addressForm.city} onChange={handleAddressChange} placeholder="Enter city" />
              </div>
              <div className={styles.field}>
                <label htmlFor="af-state">State *</label>
                <input id="af-state" type="text" name="state" autoComplete="address-level1" value={addressForm.state} onChange={handleAddressChange} placeholder="Enter state" />
              </div>
              <div className={styles.field}>
                <label htmlFor="af-postal">Postal code *</label>
                <input id="af-postal" type="text" name="postalCode" autoComplete="postal-code" inputMode="numeric" value={addressForm.postalCode} onChange={handleAddressChange} placeholder="Enter postal code" />
              </div>
              <div className={styles.field}>
                <label htmlFor="af-country">Country</label>
                <input id="af-country" type="text" name="country" autoComplete="country-name" value={addressForm.country} className={styles.readOnly} readOnly />
                <span className={styles.hint}>Currently shipping within India only</span>
              </div>
            </div>

            <label className={styles.checkRow}>
              <input
                type="checkbox"
                name="isDefault"
                checked={addressForm.isDefault}
                onChange={handleAddressChange}
                className={styles.checkbox}
              />
              <span className={styles.checkMark} aria-hidden="true" />
              <span>Set as default address</span>
            </label>

            <div className={styles.actions}>
              <Button variant="ghost" onClick={resetAddressForm} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddressSave} disabled={loading}>
                {loading
                  ? "Saving…"
                  : editingAddressIndex !== null
                  ? "Update address"
                  : "Save address"}
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {addresses.length === 0 && !showAddressForm ? (
        <EmptyState
          compact
          className={styles.state}
          title="No addresses saved yet"
          text="Add one and checkout will offer it first, every time."
          icon="mdi:map-marker-outline"
        />
      ) : (
        <div className={styles.addrList}>
          {addresses.map((addr, index) => (
            <GlassCard
              as="article"
              padding="md"
              key={addr.id || index}
              className={`${styles.addrCard} ${addr.isDefault ? styles.addrCardDefault : ""}`}
            >
              <div className={styles.addrTop}>
                <div className={styles.addrLabelRow}>
                  <span className={styles.addrLabel}>{addr.label || "Address"}</span>
                  {addr.isDefault && (
                    <Chip variant="trust" icon={<Seal />} className={styles.defaultChip}>
                      Default
                    </Chip>
                  )}
                </div>
                <div className={styles.addrActions}>
                  {!addr.isDefault && (
                    <button type="button" className={styles.textBtn} onClick={() => handleSetDefaultAddress(index)} disabled={loading}>
                      Set default
                    </button>
                  )}
                  <button type="button" className={styles.textBtn} onClick={() => handleAddressEdit(index)} disabled={loading}>
                    Edit
                  </button>
                  <button type="button" className={`${styles.textBtn} ${styles.textBtnDanger}`} onClick={() => handleAddressDelete(index)} disabled={loading}>
                    Delete
                  </button>
                </div>
              </div>
              <div className={styles.addrBody}>
                <p className={styles.addrName}>
                  {[addr.firstName, addr.lastName].filter(Boolean).join(" ") || addr.fullName || ""}
                </p>
                <p className={styles.addrLine}>
                  {addr.addressLine1}
                  {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                </p>
                <p className={styles.addrLine}>
                  {addr.city}, {addr.state} {addr.postalCode || addr.zipCode || ""}
                </p>
                <p className={styles.addrLine}>{addr.country}</p>
                <p className={styles.addrPhone}>{addr.phone}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  const renderPaymentSection = () => (
    /* No payment-method API exists — render an honest empty state rather than
       fabricating saved cards. Payment is collected securely at checkout. */
    <EmptyState
      compact
      className={styles.state}
      title="Nothing saved here — by design"
      text="Payment details are entered fresh at checkout and are never stored on your account. There is nothing kept on this page for anyone to take."
      icon="mdi:credit-card-outline"
    />
  );

  const renderWalletSection = () => (
    <div className={styles.sectionStack}>
      <GlassCard strong padding="md" glow="gold" className={styles.walletBand}>
        <span className={styles.walletBandLabel}>Available balance</span>
        <span className={styles.walletBandValue}>
          {walletLoading ? "—" : formatCurrency(walletBalance)}
        </span>
        <p className={styles.walletBandHint}>
          Apply your store credit at checkout, toward any order.
        </p>
      </GlassCard>

      <GlassCard padding="md" className={styles.section}>
        <h3 className={styles.ledgerTitle}>Statement</h3>

        {walletLoading ? (
          <div className={styles.ledger} aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.ledgerSkeleton}>
                <span className={`sf-skeleton ${styles.skelMark}`} />
                <span className={styles.skelLines}>
                  <span className="sf-skeleton sf-skeleton--text" />
                  <span className="sf-skeleton sf-skeleton--text" />
                </span>
              </div>
            ))}
          </div>
        ) : walletTx.length === 0 ? (
          <EmptyState
            compact
            className={styles.state}
            title="No store credit yet"
            text="Refunds issued to store credit, and credit you spend at checkout, are written here — each line with the order it belongs to."
            icon="mdi:wallet-outline"
          />
        ) : (
          <div className={styles.ledger}>
            {walletTx.map((t) => {
              const isCredit = t.type === "credit";
              return (
                <div key={t.id} className={styles.ledgerRow}>
                  <span
                    className={`${styles.ledgerMark} ${
                      isCredit ? styles.ledgerMarkCredit : styles.ledgerMarkDebit
                    }`}
                    aria-hidden="true"
                  >
                    {isCredit ? "+" : "−"}
                  </span>
                  <span className={styles.ledgerBody}>
                    <span className={styles.ledgerReason}>
                      {t.reason || (isCredit ? "Store credit added" : "Store credit used")}
                    </span>
                    <span className={styles.ledgerMeta}>
                      {formatDate(t.createdAt, "medium")}
                      {t.orderNumber && (
                        <>
                          <span className={styles.metaSep} aria-hidden="true">·</span>
                          <button
                            type="button"
                            className={styles.ledgerLink}
                            onClick={() => navigate("/orders")}
                          >
                            {t.orderNumber}
                          </button>
                        </>
                      )}
                    </span>
                  </span>
                  <span className={styles.ledgerAmounts}>
                    <span className={isCredit ? styles.amountCredit : styles.amountDebit}>
                      {isCredit ? "+" : "−"}
                      {formatCurrency(t.amount)}
                    </span>
                    {t.balanceAfter != null && (
                      <span className={styles.ledgerBalance}>
                        Balance {formatCurrency(t.balanceAfter)}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );

  const renderNotificationsSection = () => (
    /* No notification-preference fields exist on the user yet — show an honest
       "coming soon" state rather than toggles that wouldn't persist. */
    <EmptyState
      compact
      className={styles.state}
      title="Preferences are coming soon"
      text={
        <>
          For now, order updates are always sent to <strong>{user.email}</strong>.
          Fine-tuning offers and reminders will live here shortly.
        </>
      }
      icon="mdi:bell-outline"
    />
  );

  const renderSettingsSection = () => (
    <GlassCard padding="md" className={styles.section}>
      {/* Change password — the only block in Settings. */}
      <h3 className={styles.subHead}>
        <Icon name="lock" size={16} />
        Change password
      </h3>

      <div className={styles.pwForm}>
        <div className={styles.field}>
          <label htmlFor="pw-current">Current password *</label>
          <div className={styles.pwWrap}>
            <input
              id="pw-current"
              type={showPasswords.current ? "text" : "password"}
              name="currentPassword"
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
            />
            <button
              type="button"
              className={styles.pwToggle}
              onClick={() => setShowPasswords((p) => ({ ...p, current: !p.current }))}
              aria-label={showPasswords.current ? "Hide current password" : "Show current password"}
            >
              {showPasswords.current ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="pw-new">New password *</label>
          <div className={styles.pwWrap}>
            <input
              id="pw-new"
              type={showPasswords.new ? "text" : "password"}
              name="newPassword"
              autoComplete="new-password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
            />
            <button
              type="button"
              className={styles.pwToggle}
              onClick={() => setShowPasswords((p) => ({ ...p, new: !p.new }))}
              aria-label={showPasswords.new ? "Hide new password" : "Show new password"}
            >
              {showPasswords.new ? "Hide" : "Show"}
            </button>
          </div>
          {passwordForm.newPassword && (
            <div className={`${styles.meter} ${styles[`strength_${passwordStrength.key}`]}`}>
              <span className={styles.meterBar} aria-hidden="true">
                {[1, 2, 3, 4].map((seg) => (
                  <span
                    key={seg}
                    className={`${styles.meterSeg} ${
                      seg <= passwordStrength.level ? styles.meterSegOn : ""
                    }`}
                  />
                ))}
              </span>
              <span className={styles.meterLabel} role="status">
                <span className="sf-visually-hidden">Password strength: </span>
                {passwordStrength.label}
              </span>
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="pw-confirm">Confirm new password *</label>
          <div className={styles.pwWrap}>
            <input
              id="pw-confirm"
              type={showPasswords.confirm ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
            />
            <button
              type="button"
              className={styles.pwToggle}
              onClick={() => setShowPasswords((p) => ({ ...p, confirm: !p.confirm }))}
              aria-label={showPasswords.confirm ? "Hide confirmed password" : "Show confirmed password"}
            >
              {showPasswords.confirm ? "Hide" : "Show"}
            </button>
          </div>
          {passwordForm.confirmPassword &&
            passwordForm.newPassword !== passwordForm.confirmPassword && (
              <span className={styles.fieldError} role="alert">Passwords do not match</span>
            )}
        </div>

        {/* Live checklist. Each item carries its state in words as well as in the
            mark, so it is never colour-alone — and the list is polite-live, so a
            requirement being met is announced as you type. */}
        <div className={styles.reqs}>
          <p className={styles.reqsTitle}>A good password has</p>
          <ul className={styles.reqsList} aria-live="polite">
            {[
              { text: "At least 8 characters", met: passwordForm.newPassword.length >= 8 },
              { text: "One uppercase letter", met: /[A-Z]/.test(passwordForm.newPassword) },
              { text: "One lowercase letter", met: /[a-z]/.test(passwordForm.newPassword) },
              { text: "One number", met: /[0-9]/.test(passwordForm.newPassword) },
              { text: "One special character", met: /[^A-Za-z0-9]/.test(passwordForm.newPassword) },
            ].map((req) => (
              <li key={req.text} className={`${styles.req} ${req.met ? styles.reqOn : ""}`}>
                <span className={styles.reqMark} aria-hidden="true">
                  {req.met ? <Icon name="check" size={12} strokeWidth={2} /> : null}
                </span>
                {req.text}
                <span className="sf-visually-hidden">{req.met ? " — met" : " — not met yet"}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" onClick={handlePasswordSubmit} disabled={loading}>
            {loading ? "Updating…" : "Update password"}
          </Button>
        </div>
      </div>
    </GlassCard>
  );

  const SECTION_META = {
    profile: { title: "Personal details", render: renderProfileSection },
    addresses: { title: "Addresses", render: renderAddressesSection },
    payment: { title: "Payment methods", render: renderPaymentSection },
    wallet: { title: "Store credit", render: renderWalletSection },
    notifications: { title: "Notifications", render: renderNotificationsSection },
    settings: { title: "Settings", render: renderSettingsSection },
  };

  return (
    <div className={styles.page}>
      <section className="sf-section">
        <div className="sf-container">
          {/* Feedback toast (fixed-position; see .feedback in the stylesheet) */}
          <AnimatePresence>
            {feedback.message && (
              <motion.div
                className={`${styles.feedback} ${styles[`feedback_${feedback.type}`]}`}
                role="status"
                aria-live="polite"
                {...collapse(shouldReduceMotion)}
              >
                <span>{feedback.message}</span>
                <button
                  type="button"
                  className={styles.feedbackClose}
                  onClick={() => setFeedback({ type: "", message: "" })}
                  aria-label="Dismiss"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {activeSection ? (
            /* ===================== Section view ===================== */
            <motion.div key={activeSection} {...collapse(shouldReduceMotion)}>
              <div className={styles.sectionTop}>
                <button type="button" className={styles.backBtn} onClick={backToDashboard}>
                  <Icon name="back" size={15} />
                  <span>Your account</span>
                </button>
                <h1 className={styles.sectionTitle}>{SECTION_META[activeSection]?.title}</h1>
              </div>
              {SECTION_META[activeSection]?.render()}
            </motion.div>
          ) : (
            /* ===================== Dashboard view =====================
               Two columns from 1025px: the identity card and the figures on the
               left, the index and the recent orders on the right. Below that,
               one column in the order a phone reads it. */
            <motion.div className={styles.dashboard} {...collapse(shouldReduceMotion)}>
              <div className={styles.rail}>
                {/* 1. WHO YOU ARE */}
                <GlassCard strong padding="md" glow="gold" className={styles.identity}>
                  <span className={styles.avatarRing}>
                    <span className={styles.avatar}>
                      {user.avatar ? (
                        <img className={styles.avatarImg} src={user.avatar} alt="" loading="lazy" />
                      ) : (
                        <span className={styles.avatarInitials}>
                          {getInitials(user.firstName, user.lastName)}
                        </span>
                      )}
                    </span>
                  </span>

                  <p className="sf-eyebrow">Your account</p>
                  <h1 className={styles.greetTitle}>
                    {greetingName ? `Good to see you, ${greetingName}` : "Good to see you"}
                  </h1>
                  <p className={styles.greetEmail}>{user.email}</p>
                  <p className={styles.greetMeta}>
                    <span className={`${styles.badge} ${membership.premium ? styles.badgeGold : ""}`}>
                      {membership.label}
                    </span>
                    {user.createdAt && (
                      <>
                        <span className={styles.metaSep} aria-hidden="true">·</span>
                        <span>Since {formatDate(user.createdAt, "medium")}</span>
                      </>
                    )}
                  </p>

                  <Button
                    variant="secondary"
                    size="sm"
                    block
                    className={styles.editLink}
                    onClick={() => openSection("profile")}
                  >
                    Edit details
                  </Button>
                </GlassCard>

                {/* 2. THE FIGURES */}
                <section className={styles.figures} aria-label="Account summary">
                  <button type="button" className={styles.figure} onClick={() => navigate("/orders")}>
                    <span className={styles.figureValue}>{statValue(orders.length)}</span>
                    <span className={styles.figureLabel}>Orders</span>
                  </button>
                  <button type="button" className={styles.figure} onClick={() => navigate("/wishlist")}>
                    <span className={styles.figureValue}>{wishlistItems.length}</span>
                    <span className={styles.figureLabel}>Wishlist</span>
                  </button>
                  <div className={styles.figure}>
                    <span className={styles.figureValue}>{statValue(reviewsCount ?? 0)}</span>
                    <span className={styles.figureLabel}>Reviews</span>
                  </div>
                </section>
              </div>

              <div className={styles.main}>
                {/* 3. THE INDEX */}
                <nav className={`sf-glass ${styles.index}`} aria-label="Account menu">
                  {menuRows.map((row) => (
                    <button key={row.id} type="button" className={styles.indexRow} onClick={row.onClick}>
                      <span className={styles.indexIcon}>
                        <Icon name={row.icon} />
                      </span>
                      <span className={styles.indexText}>
                        <span className={styles.indexLabel}>
                          {row.label}
                          {row.badge != null && <span className={styles.indexCount}>{row.badge}</span>}
                        </span>
                        <span className={styles.indexSub}>{row.sub}</span>
                      </span>
                      <span className={styles.indexChevron}><Icon name="chevron" size={16} /></span>
                    </button>
                  ))}
                </nav>

                {/* 4. RECENT ORDERS */}
                <section className={styles.recent}>
                  <div className={styles.recentHead}>
                    <h2 className={styles.recentTitle}>Recent orders</h2>
                    {orders.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
                        View all
                      </Button>
                    )}
                  </div>

                  {statsLoading ? (
                    <div className={styles.recentList} aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className={styles.recentSkeleton}>
                          <span className={`sf-skeleton ${styles.skelPlate}`} />
                          <span className={styles.skelLines}>
                            <span className="sf-skeleton sf-skeleton--text" />
                            <span className="sf-skeleton sf-skeleton--text" />
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <EmptyState
                      compact
                      className={styles.state}
                      title="No orders yet"
                      text="When you order, it is recorded here — and kept."
                      icon="mdi:shopping-outline"
                      actions={<Button to={ROUTES.SHOP}>Start shopping</Button>}
                    />
                  ) : (
                    <div className={styles.recentList}>
                      {recentOrders.map((order) => {
                        const statusInfo = orderStatusInfo(order);
                        const firstItem = (order.items || [])[0] || {};
                        return (
                          <button
                            key={order.id || order.orderNumber}
                            type="button"
                            className={`sf-glass ${styles.recentRow}`}
                            onClick={() => navigate("/orders")}
                            aria-label={`Order ${order.orderNumber || order.id}, ${statusInfo.label}`}
                          >
                            <span className={`sf-plate ${styles.recentPlate}`}>
                              {firstItem.image ? <img src={firstItem.image} alt="" loading="lazy" /> : null}
                            </span>
                            <span className={styles.recentBody}>
                              <span className={styles.recentNumber}>
                                {order.orderNumber || `#${order.id}`}
                              </span>
                              <span className={styles.recentMeta}>
                                {formatDate(order.createdAt, "medium")}
                              </span>
                            </span>
                            <span className={styles.recentEnd}>
                              {statusChip(statusInfo)}
                              <span className={styles.recentTotal}>{formatCurrency(order.total)}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* 5. THE DOOR */}
                <div className={styles.logoutRow}>
                  <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
