import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@mui/material";
import { Icon } from "@iconify/react";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../context/WishlistContext";
import { useDealsConfig } from "../../context/DealsConfigContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import { ROUTES } from "../../utils/constants";
import Logo from "../brand/Logo";
import AnnouncementBar from "../AnnouncementBar";
import CartDrawer from "../CartDrawer/CartDrawer";
import SidebarMenu from "../SidebarMenu/SidebarMenu";
import AuthModal from "../AuthModal/AuthModal";
import SearchModal from "../SearchModal/SearchModal";
import HeaderActions from "./HeaderActions";
import MegaPanel, {
  clearMegaPanelCache,
  loadMegaPanelData,
} from "./MegaPanel";
import styles from "./Header.module.css";

// =============================================================================
// Header — the LAMIKAA sticky glass masthead
// =============================================================================
//
// Three zones on one 64px row (56px on phones): the mobile hamburger and the
// wordmark on the left, four primary nav entries in the centre, the utility
// actions on the right. The announcement band renders ABOVE it in normal flow,
// so it scrolls away and the PINNED chrome is the header alone — 100px of page
// chrome before the first scroll, 64px after it.
//
// THREE STATES, in this order of precedence:
//   transparent  while `#hero-sentinel` is intersecting. The hero renders that
//                sentinel (Prompt 14); when it is absent the header is glass
//                from the first pixel, which is the correct default for every
//                route that is not the home page.
//   glass        `.sf-glass` — the resting state.
//   glass--strong after 24px of scroll. NOT "the same bar, slightly more
//                opaque": once the page has moved, the bar thins to 72% of the
//                chrome ground and blurs nearly twice as hard, so what is
//                scrolling under it is visibly under it. The recipe and the
//                contrast arithmetic are in Header.module.css `.strong`; the
//                per-device blur radii are tokens, so a phone gets the same
//                step at a radius a phone can afford.
//
// THE BLUR BUDGET (DESIGN_SYSTEM §4: two blurred layers, ever). The header
// drops its backdrop filter while `body[data-drawer-open]` is set — the flag
// ui/Drawer reference-counts — and also while one of the four overlays THIS
// component mounts is open, since those still carry their own traps until
// Prompts 10-12 migrate them onto the primitive. The announcement band has no
// blur at all, which is what keeps the sum at two.
//
// WHAT LEFT IN PROMPT 09. The measured "priority nav" (a hidden twin list, a
// ResizeObserver and an overflow count) is gone: four entries never overflow at
// ≥1025px, and below that the whole nav collapses into the hamburger. So are
// the per-category collection panels — the mega panel replaces them — and the
// all-collections drawer they opened, whose files are deleted. The promises
// hairline the masthead used to cap the page with becomes a home-page section
// in Prompt 15; the mobile drawer still renders it.
// =============================================================================

const LOGO_WIDTH = 168;
const LOGO_WIDTH_MOBILE = 140;
const LOGO_WIDTH_MARK = 40;

// Long enough that crossing the row on the way to the cart never opens the
// panel, short enough that reaching for "Shop" feels like a hover, not a wait.
const HOVER_INTENT_MS = 200;

// The scroll depth at which the glass thickens. Small on purpose: the change
// should read as "the page has moved", not as a second scroll threshold — and
// it is a threshold rather than a ramp because the two surfaces are a CSS
// transition apart, so one class swap at 24px buys the whole crossfade without
// a style write on every scroll frame.
const STRONG_AT = 24;

const MEGA_PANEL_ID = "mega-panel";

/** Pointer users get hover intent; touch users get click only (no hover to
    detect, and a phantom hover on tap opens a panel nobody asked for). */
const hasFinePointer = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(pointer: fine)").matches;

const Header = () => {
  const location = useLocation();
  const { authModalOpen, authModalTab, openAuthModal, closeAuthModal } = useAuth();
  const { getCartItemCount, isCartOpen, setIsCartOpen } = useCart();
  const { getWishlistCount } = useWishlist();
  // The "Offers" entry is hidden when the admin turns the deals page off.
  const { enabled: dealsEnabled } = useDealsConfig();
  // Store name comes from Settings → General, so renaming the store renames the
  // lockup's label everywhere the artwork itself cannot say it.
  const { storeName } = useStoreSettings();

  const isMobile = useMediaQuery("(max-width:768px)");
  const isDesktop = useMediaQuery("(min-width:1025px)");
  const isTiny = useMediaQuery("(max-width:340px)");

  // Live badge counts (context exposes getters, not raw values).
  const cartCount = getCartItemCount();
  const wishlistCount = getWishlistCount();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  const headerRef = useRef(null);
  const shopButtonRef = useRef(null);
  const hoverTimerRef = useRef(null);

  // ---- Scroll depth ------------------------------------------------------
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > STRONG_AT);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---- The hero sentinel -------------------------------------------------
  // The hero renders `#hero-sentinel` at its own top edge; while that element
  // is on screen the header is transparent over it. The sentinel arrives with a
  // lazily-loaded route chunk, so the lookup retries for a few frames (the same
  // technique ScrollToTop uses for a hash target) before settling on "no hero
  // here" — which is the right answer on every page but the home page.
  useEffect(() => {
    let observer = null;
    let raf = 0;
    let frames = 0;
    let cancelled = false;

    setOverHero(false);

    const attach = () => {
      if (cancelled) return;
      const sentinel = document.getElementById("hero-sentinel");
      if (!sentinel) {
        if (frames < 30) {
          frames += 1;
          raf = requestAnimationFrame(attach);
        }
        return;
      }
      if (typeof IntersectionObserver === "undefined") return;
      observer = new IntersectionObserver(
        ([entry]) => setOverHero(Boolean(entry?.isIntersecting)),
        { threshold: 0 }
      );
      observer.observe(sentinel);
    };

    attach();
    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (observer) observer.disconnect();
    };
  }, [location.pathname]);

  // ---- The mega panel ----------------------------------------------------
  const clearHoverIntent = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const closeMega = useCallback(() => {
    clearHoverIntent();
    setMegaOpen(false);
  }, []);

  /** Escape and a link click both hand focus back to the trigger that opened
      the panel — a keyboard visitor must never be dropped at the top of the
      document because a menu closed underneath them. */
  const closeMegaAndRestoreFocus = useCallback(() => {
    closeMega();
    shopButtonRef.current?.focus();
  }, [closeMega]);

  // Any route change closes the panel.
  useEffect(() => {
    setMegaOpen(false);
  }, [location.pathname, location.search]);

  // Clear a pending hover timer on unmount.
  useEffect(() => () => clearHoverIntent(), []);

  // Outside click. Bound only while the panel is open, on `mousedown` so the
  // panel is gone before the click resolves anywhere else.
  useEffect(() => {
    if (!megaOpen) return undefined;
    const onDocumentPointerDown = (e) => {
      if (!headerRef.current?.contains(e.target)) closeMega();
    };
    document.addEventListener("mousedown", onDocumentPointerDown);
    document.addEventListener("touchstart", onDocumentPointerDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentPointerDown);
      document.removeEventListener("touchstart", onDocumentPointerDown);
    };
  }, [megaOpen, closeMega]);

  // THE SHOP MENU FOLLOWS THE ADMIN, not the page load. `loadMegaPanelData()`
  // caches the catalogue in a module so the panel opens from memory on every
  // hover — but the panel itself is mounted only WHILE it is open, so it cannot
  // be the thing that notices the catalogue moved. The header can: it is on
  // every storefront route, so returning from the admin tab drops the cache
  // here and the next open of the menu reads a category's current name, its
  // current membership and its current image without a reload.
  useEffect(() => {
    const onFocus = () => clearMegaPanelCache();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handleShopPointerEnter = () => {
    if (!hasFinePointer()) return;
    // Warm the cache while the intent delay runs, so the panel is drawn from
    // memory rather than mid-fetch on the very first hover of a session.
    loadMegaPanelData().catch(() => {});
    clearHoverIntent();
    hoverTimerRef.current = setTimeout(() => setMegaOpen(true), HOVER_INTENT_MS);
  };

  /**
   * The pointer has said it is done with the panel — either by leaving the
   * header (the panel is a DESCENDANT of it, so travelling from the trigger
   * down into the sheet is not "leaving") or by arriving on a sibling nav
   * entry, because a mega menu that stays up while the pointer reads "Rituals"
   * is a mega menu in the way. Touch is excluded: there is no hover to end,
   * and a tap's phantom one would close the panel it just opened.
   */
  const dismissMegaFromPointer = () => {
    clearHoverIntent();
    if (hasFinePointer()) setMegaOpen(false);
  };

  const handleHeaderKeyDown = (e) => {
    if (e.key === "Escape" && megaOpen) {
      e.stopPropagation();
      closeMegaAndRestoreFocus();
    }
  };

  // Focus leaving the header entirely closes the panel; focus moving between
  // the trigger and the panel's own links does not.
  const handleHeaderBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) closeMega();
  };

  // ---- Overlay handlers --------------------------------------------------
  const handleCartClick = () => setIsCartOpen(true);
  const handleSearchClick = () => setSearchModalOpen(true);
  const handleMobileMenuClick = () => setSidebarOpen(true);

  // ---- Nav ---------------------------------------------------------------
  const { pathname } = location;
  const shopActive = pathname === ROUTES.SHOP || pathname.startsWith("/category/");
  const navLinks = [
    {
      key: "rituals",
      label: "Rituals",
      to: ROUTES.RITUALS,
      active: pathname === ROUTES.RITUALS || pathname.startsWith("/rituals/"),
    },
    {
      key: "about",
      label: "Our Story",
      to: ROUTES.ABOUT,
      active: pathname === ROUTES.ABOUT,
    },
    {
      key: "why",
      label: "Why LAMIKAA",
      to: ROUTES.WHY,
      active: pathname === ROUTES.WHY,
    },
    // Hidden while the admin has the deals page switched off.
    ...(dealsEnabled
      ? [
          {
            key: "offers",
            label: "Offers",
            to: ROUTES.SPECIAL_OFFERS,
            active: pathname === ROUTES.SPECIAL_OFFERS,
          },
        ]
      : []),
  ];

  // ---- Surface -----------------------------------------------------------
  // Transparent wins over glass; glass--strong is glass one step MORE glass —
  // a thinner veil over a wider blur, not a firmer wash (Header.module.css).
  // The blur is dropped while any overlay this header owns is up — the drawer
  // flag ui/Drawer sets is handled in CSS, for the drawers that already use
  // it.
  const overlayOpen =
    isCartOpen || sidebarOpen || searchModalOpen || authModalOpen;

  const headerClasses = [
    // The chrome scope: the masthead keeps the near-black ground and the
    // champagne gold the LAMIKAA wordmark was drawn for, while the page under
    // it is cream. Nothing in this file reads a colour — the class re-points
    // the tokens and every rule in Header.module.css follows.
    "sf-on-dark",
    styles.header,
    overHero ? styles.transparent : "sf-glass",
    !overHero && scrolled ? "sf-glass--strong" : "",
    !overHero && scrolled ? styles.strong : "",
    // PINNED = the announcement band has scrolled away and this header is the
    // thing at y=0. That is the only state in which it has to clear a device's
    // top inset, and `scrolled` alone says it — `overHero` only decides how the
    // header is PAINTED, not where it sits.
    scrolled ? styles.pinned : "",
    overlayOpen ? styles.noBlur : "",
  ]
    .filter(Boolean)
    .join(" ");

  const logoWidth = isTiny
    ? LOGO_WIDTH_MARK
    : isMobile
    ? LOGO_WIDTH_MOBILE
    : LOGO_WIDTH;

  return (
    <>
      {/* ===== ANNOUNCEMENT BAND ===========================================
          In normal flow ABOVE the sticky header, so it scrolls away and the
          pinned chrome stays at the header's own 64px. */}
      <AnnouncementBar />

      <header
        ref={headerRef}
        className={headerClasses}
        onMouseLeave={dismissMegaFromPointer}
        onKeyDown={handleHeaderKeyDown}
        onBlur={handleHeaderBlur}
      >
        <div className={`sf-container ${styles.inner}`}>
          {/* ---- Left: hamburger + wordmark ---- */}
          <div className={styles.left}>
            {!isDesktop && (
              <button
                type="button"
                className={styles.menuButton}
                onClick={handleMobileMenuClick}
                aria-label="Open menu"
                aria-haspopup="dialog"
                aria-expanded={sidebarOpen}
              >
                <Icon icon="mdi:menu" aria-hidden="true" />
              </button>
            )}

            {/* Transparent-ground artwork straight on the ground — the LAMIKAA
                wordmark needs no plate on the chrome's espresso #17120F, where
                it still measures 13.1:1 (PACKAGING_NOTES §1). */}
            <Link to={ROUTES.HOME} className={styles.logoLink} aria-label={storeName}>
              <Logo
                variant={isTiny ? "mark" : "wordmark"}
                width={logoWidth}
                className={styles.logoImg}
                alt={storeName}
              />
            </Link>
          </div>

          {/* ---- Centre: primary nav (≥1025px) ---- */}
          {isDesktop && (
            /* Not "Primary" — BottomNav already claims that label, and two nav
               landmarks with the same name are indistinguishable to a screen
               reader running the landmark list. */
            <nav className={styles.nav} aria-label="Shop">
              <ul className={styles.navList}>
                <li
                  className={styles.navItem}
                  onPointerEnter={handleShopPointerEnter}
                  onPointerLeave={clearHoverIntent}
                >
                  <button
                    type="button"
                    ref={shopButtonRef}
                    className={`${styles.navLink} ${
                      shopActive ? styles.navLinkActive : ""
                    }`}
                    aria-haspopup="true"
                    aria-expanded={megaOpen}
                    aria-controls={MEGA_PANEL_ID}
                    aria-current={shopActive ? "page" : undefined}
                    onClick={() => setMegaOpen((open) => !open)}
                    onFocus={() => loadMegaPanelData().catch(() => {})}
                  >
                    Shop
                    <Icon
                      icon="mdi:chevron-down"
                      className={styles.navChevron}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Inside the trigger's <li> so its links follow the trigger
                      in the tab order; positioned against the <header>, so it
                      still spans the full width. */}
                  <AnimatePresence>
                    {megaOpen && (
                      <MegaPanel
                        id={MEGA_PANEL_ID}
                        onNavigate={closeMega}
                      />
                    )}
                  </AnimatePresence>
                </li>

                {navLinks.map((item) => (
                  <li
                    key={item.key}
                    className={styles.navItem}
                    onPointerEnter={dismissMegaFromPointer}
                  >
                    <Link
                      to={item.to}
                      className={`${styles.navLink} ${
                        item.active ? styles.navLinkActive : ""
                      }`}
                      aria-current={item.active ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* ---- Right: utility actions ---- */}
          <HeaderActions
            cartCount={cartCount}
            wishlistCount={wishlistCount}
            onSearch={handleSearchClick}
            onCart={handleCartClick}
          />
        </div>
      </header>

      {/* ===== MODALS & DRAWERS =============================================
          Unchanged mounts, unchanged props: each keeps its own focus trap until
          its own prompt migrates it onto the ui/Drawer + ui/Modal primitives. */}
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <SidebarMenu
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAuth={() => openAuthModal("login")}
      />
      <AuthModal
        open={authModalOpen}
        onClose={closeAuthModal}
        defaultTab={authModalTab}
      />
      <SearchModal
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};

export default Header;
