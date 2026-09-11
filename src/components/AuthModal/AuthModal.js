import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import { isEmailValid } from "../../utils/helpers";
import Logo from "../brand/Logo";
import { Button, Modal } from "../ui";
import { DURATION, INSTANT, RISE, t, tween } from "../../theme/motion";
import { ROUTES } from "../../utils/constants";
import styles from "./AuthModal.module.css";

// =============================================================================
// AuthModal — sign in and create an account, in one sheet
// =============================================================================
//
// ON THE SHARED PRIMITIVE (Prompt 30). The dialog's hand-rolled overlay, focus
// trap, Escape handler, body-scroll lock, close button and mobile/desktop
// branch are gone: `ui/Modal` owns all of them, and owns them better (it also
// closes on navigation and compensates the scrollbar so the page behind cannot
// shift). `size="sm"` is the 420px column, which every viewport at 480px and
// below turns into a full-height sheet — a centred card with no margins is not
// a dialog on a phone.
//
// WHAT THIS COMPONENT STILL OWNS is everything a generic dialog cannot know:
// the two tabs and their roving tabindex, the directional pane slide, the
// validation, the password strength meter, the show/hide toggles and the two
// submits.
//
// THE SOCIAL BUTTONS ARE GONE. Google and Facebook were rendered disabled,
// badged "Soon", and wired to nothing — two controls that could not be pressed,
// carrying the only hard-coded brand hexes on the storefront. Social sign-in is
// a backend feature (an OAuth callback and a provider table); when it exists it
// comes back as working buttons. Until then the dialog does not advertise a
// door that is painted on.
//
// COPY: "Welcome back" for sign in, "Create your account" for sign up.
// =============================================================================

/* One wordmark on a transparent ground, so it sits straight on the sheet. Same
   <Logo> — and therefore the same URL — the masthead and SidebarMenu render, so
   opening the dialog paints it from cache. The slot in the module still decides
   the rendered height. */
const LOGO_WIDTH = 132;

/* How far the tab panes travel as they swap. The pane is answering a click on a
   tab six pixels away, not arriving from off-screen. */
const PANE_TRAVEL = 32;

/* ------------------------------------------------------------------ */
/*  Marks — hairline line art, never a filled icon                     */
/* ------------------------------------------------------------------ */

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={styles.spinner} aria-hidden="true" focusable="false">
    <path d="M12 2a10 10 0 010 20" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Password strength helper                                           */
/* ------------------------------------------------------------------ */
/* The four tiers are the semantic tokens, named rather than valued: the meter
   never carries a colour this file decided on. The WORD is what says the score;
   the bar only echoes it, so the meaning survives a colour-blind reading. */

const STRENGTH_TIERS = [
  null,
  { label: "Weak", className: "strengthWeak" },
  { label: "Fair", className: "strengthFair" },
  { label: "Good", className: "strengthGood" },
  { label: "Strong", className: "strengthStrong" },
];

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", className: "" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const tier = score <= 1 ? 1 : score <= 2 ? 2 : score <= 3 ? 3 : 4;
  return { score: tier, ...STRENGTH_TIERS[tier] };
}

/* Joins the ids a control is described by, dropping the ones that aren't
   rendered. Returns undefined (not "") so React omits the attribute. */
const describedBy = (...ids) => ids.filter(Boolean).join(" ") || undefined;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const AuthModal = ({ open, onClose, defaultTab = "login" }) => {
  const { login, register, isLoading: authLoading } = useAuth();
  const { storeName } = useStoreSettings();
  const reduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [direction, setDirection] = useState(0);

  // Login state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup state
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Shared state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // The tablist uses a roving tabindex, so arrow keys have to move focus by hand.
  const loginTabRef = useRef(null);
  const signupTabRef = useRef(null);

  // Honour defaultTab on every open, not just when the prop changes: a caller
  // asking for "login" has to land on Sign in even if the last visit to the
  // dialog ended on Create account. Also re-runs if defaultTab changes while
  // the dialog is already open.
  useEffect(() => {
    if (!open) return;
    setActiveTab(defaultTab);
    setDirection(0);
    setErrors({});
    setSuccessMessage("");
    setInfoMessage("");
  }, [open, defaultTab]);

  /* ---- Tab switching ---- */

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    setDirection(tab === "signup" ? 1 : -1);
    setActiveTab(tab);
    setErrors({});
    setSuccessMessage("");
    setInfoMessage("");
  };

  // Arrow/Home/End move between the two tabs, per the WAI-ARIA tabs pattern.
  const handleTabKeyDown = (e) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let next;
    if (e.key === "Home") next = "login";
    else if (e.key === "End") next = "signup";
    else next = activeTab === "login" ? "signup" : "login";
    switchTab(next);
    const node = next === "login" ? loginTabRef.current : signupTabRef.current;
    if (node) node.focus();
  };

  // Self-service password reset isn't built yet — say so instead of doing
  // nothing, and point at the support page (the manual path that exists).
  const handleForgotPassword = () => {
    setErrors({});
    setInfoMessage("Password reset isn't available yet. Our support team can help you regain access.");
  };

  /* ---- Handlers: Login ---- */

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateLogin = () => {
    const errs = {};
    if (!loginData.email.trim()) {
      errs.email = "Email is required";
    } else if (!isEmailValid(loginData.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!loginData.password) {
      errs.password = "Password is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsSubmitting(true);
    setErrors({});
    setInfoMessage("");
    try {
      // login() resolves with { success, error } instead of throwing — check
      // it, or failed logins would show the success state and close the modal.
      const result = await login({
        email: loginData.email,
        password: loginData.password,
        remember: rememberMe,
      });
      if (!result.success) {
        setErrors({ general: result.error || "Login failed. Please try again." });
        return;
      }
      setSuccessMessage("Welcome back! Signing you in...");
      setTimeout(() => {
        onClose();
        setSuccessMessage("");
        setLoginData({ email: "", password: "" });
      }, 1500);
    } catch (err) {
      setErrors({ general: err.message || "Login failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- Handlers: Signup ---- */

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateSignup = () => {
    const errs = {};
    if (!signupData.firstName.trim()) errs.firstName = "First name is required";
    if (!signupData.lastName.trim()) errs.lastName = "Last name is required";
    if (!signupData.email.trim()) {
      errs.email = "Email is required";
    } else if (!isEmailValid(signupData.email)) {
      errs.email = "Enter a valid email address";
    }
    if (signupData.phone && !/^\d{10}$/.test(signupData.phone.replace(/\s/g, ""))) {
      errs.phone = "Enter a valid 10-digit phone number";
    }
    if (!signupData.password) {
      errs.password = "Password is required";
    } else if (signupData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (!signupData.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (signupData.password !== signupData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    if (!agreeTerms) {
      errs.terms = "You must accept the terms and conditions";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      // register() resolves with { success, error } instead of throwing —
      // see handleLoginSubmit.
      const result = await register({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        phone: signupData.phone ? `+91${signupData.phone.replace(/\s/g, "")}` : "",
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
      });
      if (!result.success) {
        setErrors({ general: result.error || "Registration failed. Please try again." });
        return;
      }
      setSuccessMessage("Account created! Redirecting to login...");
      const registeredEmail = signupData.email;
      setTimeout(() => {
        switchTab("login");
        setSuccessMessage("");
        setLoginData({ email: registeredEmail, password: "" });
        setSignupData({ firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "" });
        setAgreeTerms(false);
      }, 1800);
    } catch (err) {
      setErrors({ general: err.message || "Registration failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- Password strength (signup only) ---- */

  const passwordStrength = getPasswordStrength(signupData.password);

  /* ---- Derived ---- */

  const loading = isSubmitting || authLoading;
  const isLogin = activeTab === "login";

  /* ---------------------------------------------------------------------
   * MOTION — the dialog's own open/close belongs to `ui/Modal`; what is left
   * here is the pane swap and the two notes, all from theme/motion.js.
   * ------------------------------------------------------------------- */

  // Directional pane slide — the pane follows the direction you moved along
  // the tablist, arriving on the base tier and leaving on the fast one.
  const tabContentVariants = reduceMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1, transition: INSTANT },
        exit: { opacity: 0, transition: INSTANT },
      }
    : {
        enter: (dir) => ({ x: dir > 0 ? PANE_TRAVEL : -PANE_TRAVEL, opacity: 0 }),
        center: { x: 0, opacity: 1, transition: tween(DURATION.base) },
        exit: (dir) => ({
          x: dir > 0 ? -PANE_TRAVEL : PANE_TRAVEL,
          opacity: 0,
          transition: tween(DURATION.fast),
        }),
      };

  const noteMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: INSTANT },
        exit: { opacity: 0, transition: INSTANT },
      }
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto", transition: tween(DURATION.base) },
        exit: { opacity: 0, height: 0, transition: tween(DURATION.fast) },
      };

  /* ---- Render ---- */

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      labelledBy="auth-modal-title"
      className={styles.dialog}
    >
      {/* ---- Success toast ---- */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            className={styles.successToast}
            initial={{ opacity: 0, x: "-50%", y: reduceMotion ? 0 : -RISE.micro }}
            animate={{
              opacity: 1,
              x: "-50%",
              y: 0,
              transition: t(reduceMotion, DURATION.base),
            }}
            exit={{
              opacity: 0,
              x: "-50%",
              y: reduceMotion ? 0 : -RISE.micro,
              transition: t(reduceMotion, DURATION.fast),
            }}
            role="status"
          >
            <span className={styles.successIcon}><CheckIcon /></span>
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Masthead: the wordmark on its plate ----
           NOT straight on the sheet any more. The sheet is near-white and the
           wordmark is champagne gold — 1.4:1, a watermark. `.sf-lockup-plate`
           (with `.sf-on-dark`, which is what gives it its ground) puts the
           lockup back on the near-black it was drawn for. */}
      <div className={styles.header}>
        <span className={`sf-on-dark sf-lockup-plate ${styles.logoPlate}`}>
          <Logo className={styles.logo} width={LOGO_WIDTH} alt={storeName} />
        </span>
        <h2 id="auth-modal-title" className={styles.title}>
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>
        <p className={styles.subtitle}>
          {isLogin
            ? "Sign in to reach your orders, your wishlist and your saved details."
            : "Create an account to save what you love and follow every order."}
        </p>
      </div>

      {/* ---- Tabs — a glass segmented control ---- */}
      <div className={`sf-glass ${styles.tabs}`} role="tablist" aria-label="Account access">
        <motion.span
          className={styles.tabIndicator}
          aria-hidden="true"
          animate={{ x: isLogin ? "0%" : "100%" }}
          transition={t(reduceMotion, DURATION.base)}
        />
        <button
          ref={loginTabRef}
          type="button"
          role="tab"
          id="auth-tab-login"
          aria-selected={isLogin}
          aria-controls={isLogin ? "auth-panel-login" : undefined}
          tabIndex={isLogin ? 0 : -1}
          className={`${styles.tab} ${isLogin ? styles.tabActive : ""}`}
          onClick={() => switchTab("login")}
          onKeyDown={handleTabKeyDown}
        >
          Sign in
        </button>
        <button
          ref={signupTabRef}
          type="button"
          role="tab"
          id="auth-tab-signup"
          aria-selected={!isLogin}
          aria-controls={!isLogin ? "auth-panel-signup" : undefined}
          tabIndex={!isLogin ? 0 : -1}
          className={`${styles.tab} ${!isLogin ? styles.tabActive : ""}`}
          onClick={() => switchTab("signup")}
          onKeyDown={handleTabKeyDown}
        >
          Create account
        </button>
      </div>

      {/* ---- General error ---- */}
      <AnimatePresence>
        {errors.general && (
          <motion.div className={styles.errorNote} {...noteMotion} role="alert">
            <div className={styles.noteInner}>{errors.general}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Info note ---- */}
      <AnimatePresence>
        {infoMessage && (
          <motion.div className={styles.infoNote} {...noteMotion} role="status">
            <div className={styles.noteInner}>
              {infoMessage}{" "}
              <Link to={ROUTES.CONTACT} className={styles.link} onClick={onClose}>
                Contact support
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Form content ---- */}
      <div className={styles.formWrapper}>
        <AnimatePresence custom={direction} mode="wait">
          {/* THE PANEL IS THE WRAPPER, THE FORM IS THE FORM (Prompt 38).
              `role="tabpanel"` was on the <form> itself, which ARIA does not
              allow on a form element (axe `aria-allowed-role`) — a form with a
              name is already a `form` landmark and the role cannot be swapped
              for one. Splitting them keeps the whole tab pattern intact (same
              ids, same `aria-controls`, same animation) and gives the fields
              back a real <form> to be submitted from. */}
          {isLogin ? (
            <motion.div
              key="login"
              id="auth-panel-login"
              role="tabpanel"
              aria-labelledby="auth-tab-login"
              custom={direction}
              variants={tabContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <form onSubmit={handleLoginSubmit} noValidate className={styles.form}>
                {/* Email */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="login-email">Email</label>
                  <div className={`${styles.field} ${errors.email ? styles.fieldInvalid : ""}`}>
                    <input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      className={styles.input}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={describedBy(errors.email && "login-email-error")}
                    />
                  </div>
                  {errors.email && (
                    <span id="login-email-error" className={styles.fieldError}>{errors.email}</span>
                  )}
                </div>

                {/* Password */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="login-password">Password</label>
                  <div className={`${styles.field} ${errors.password ? styles.fieldInvalid : ""}`}>
                    <input
                      id="login-password"
                      name="password"
                      type={showLoginPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      className={styles.input}
                      aria-invalid={errors.password ? true : undefined}
                      aria-describedby={describedBy(errors.password && "login-password-error")}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowLoginPassword((v) => !v)}
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      aria-pressed={showLoginPassword}
                    >
                      {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && (
                    <span id="login-password-error" className={styles.fieldError}>{errors.password}</span>
                  )}
                </div>

                {/* Remember me + Forgot */}
                <div className={styles.optionsRow}>
                  <label className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span className={styles.checkMark} />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className={`${styles.link} ${styles.forgotBtn}`}
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  block
                  disabled={loading}
                  aria-busy={loading || undefined}
                  className={styles.submitBtn}
                >
                  {loading ? (
                    <>
                      <SpinnerIcon />
                      <span className="sf-visually-hidden">Signing in, please wait</span>
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                {/* Switch link */}
                <p className={styles.switchText}>
                  New to {storeName}?{" "}
                  <button type="button" className={styles.link} onClick={() => switchTab("signup")}>
                    Create an account
                  </button>
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              id="auth-panel-signup"
              role="tabpanel"
              aria-labelledby="auth-tab-signup"
              custom={direction}
              variants={tabContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <form onSubmit={handleSignupSubmit} noValidate className={styles.form}>
                {/* Name row */}
                <div className={styles.nameRow}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="signup-first">First name</label>
                    <div className={`${styles.field} ${errors.firstName ? styles.fieldInvalid : ""}`}>
                      <input
                        id="signup-first"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="First name"
                        value={signupData.firstName}
                        onChange={handleSignupChange}
                        className={styles.input}
                        aria-invalid={errors.firstName ? true : undefined}
                        aria-describedby={describedBy(errors.firstName && "signup-first-error")}
                      />
                    </div>
                    {errors.firstName && (
                      <span id="signup-first-error" className={styles.fieldError}>{errors.firstName}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="signup-last">Last name</label>
                    <div className={`${styles.field} ${errors.lastName ? styles.fieldInvalid : ""}`}>
                      <input
                        id="signup-last"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Last name"
                        value={signupData.lastName}
                        onChange={handleSignupChange}
                        className={styles.input}
                        aria-invalid={errors.lastName ? true : undefined}
                        aria-describedby={describedBy(errors.lastName && "signup-last-error")}
                      />
                    </div>
                    {errors.lastName && (
                      <span id="signup-last-error" className={styles.fieldError}>{errors.lastName}</span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="signup-email">Email</label>
                  <div className={`${styles.field} ${errors.email ? styles.fieldInvalid : ""}`}>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className={styles.input}
                      aria-invalid={errors.email ? true : undefined}
                      aria-describedby={describedBy(errors.email && "signup-email-error")}
                    />
                  </div>
                  {errors.email && (
                    <span id="signup-email-error" className={styles.fieldError}>{errors.email}</span>
                  )}
                </div>

                {/* Phone */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="signup-phone">Phone (optional)</label>
                  <div className={`${styles.field} ${errors.phone ? styles.fieldInvalid : ""}`}>
                    <span className={styles.phonePrefix} aria-hidden="true">+91</span>
                    <input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel-national"
                      placeholder="9876543210"
                      value={signupData.phone}
                      onChange={handleSignupChange}
                      className={`${styles.input} ${styles.phoneInput}`}
                      aria-invalid={errors.phone ? true : undefined}
                      aria-describedby={describedBy("signup-phone-hint", errors.phone && "signup-phone-error")}
                    />
                    <span id="signup-phone-hint" className="sf-visually-hidden">
                      Indian number, country code +91, ten digits
                    </span>
                  </div>
                  {errors.phone && (
                    <span id="signup-phone-error" className={styles.fieldError}>{errors.phone}</span>
                  )}
                </div>

                {/* Password */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="signup-password">Password</label>
                  <div className={`${styles.field} ${errors.password ? styles.fieldInvalid : ""}`}>
                    <input
                      id="signup-password"
                      name="password"
                      type={showSignupPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min. 6 characters"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      className={styles.input}
                      aria-invalid={errors.password ? true : undefined}
                      aria-describedby={describedBy(
                        errors.password && "signup-password-error",
                        signupData.password && "signup-password-strength"
                      )}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowSignupPassword((v) => !v)}
                      aria-label={showSignupPassword ? "Hide password" : "Show password"}
                      aria-pressed={showSignupPassword}
                    >
                      {showSignupPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.password && (
                    <span id="signup-password-error" className={styles.fieldError}>{errors.password}</span>
                  )}

                  {/* Password strength — the word carries the meaning,
                      the four rules only echo it (never colour alone) */}
                  {signupData.password && (
                    <div
                      id="signup-password-strength"
                      className={`${styles.strengthWrap} ${styles[passwordStrength.className] || ""}`}
                      aria-live="polite"
                    >
                      <div className={styles.strengthBar} aria-hidden="true">
                        {[1, 2, 3, 4].map((segment) => (
                          <div
                            key={segment}
                            className={`${styles.strengthSegment} ${
                              segment <= passwordStrength.score ? styles.strengthSegmentOn : ""
                            }`}
                          />
                        ))}
                      </div>
                      <span className={styles.strengthLabel}>
                        {passwordStrength.label ? `${passwordStrength.label} password` : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label} htmlFor="signup-confirm">Confirm password</label>
                  <div className={`${styles.field} ${errors.confirmPassword ? styles.fieldInvalid : ""}`}>
                    <input
                      id="signup-confirm"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter password"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      className={styles.input}
                      aria-invalid={errors.confirmPassword ? true : undefined}
                      aria-describedby={describedBy(errors.confirmPassword && "signup-confirm-error")}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span id="signup-confirm-error" className={styles.fieldError}>{errors.confirmPassword}</span>
                  )}
                </div>

                {/* Terms */}
                <div className={styles.fieldGroup}>
                  <label className={`${styles.checkLabel} ${styles.termsLabel}`}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
                      }}
                      className={styles.checkbox}
                      aria-invalid={errors.terms ? true : undefined}
                      aria-describedby={describedBy(errors.terms && "signup-terms-error")}
                    />
                    <span className={styles.checkMark} />
                    <span>
                      I agree to the{" "}
                      <Link
                        to={ROUTES.POLICY_TERMS}
                        target="_blank"
                        className={styles.link}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to={ROUTES.POLICY_PRIVACY}
                        target="_blank"
                        className={styles.link}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <span id="signup-terms-error" className={styles.fieldError}>{errors.terms}</span>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  block
                  disabled={loading}
                  aria-busy={loading || undefined}
                  className={styles.submitBtn}
                >
                  {loading ? (
                    <>
                      <SpinnerIcon />
                      <span className="sf-visually-hidden">Creating your account, please wait</span>
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>

                {/* Switch link */}
                <p className={styles.switchText}>
                  Already have an account?{" "}
                  <button type="button" className={styles.link} onClick={() => switchTab("login")}>
                    Sign in
                  </button>
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default AuthModal;
