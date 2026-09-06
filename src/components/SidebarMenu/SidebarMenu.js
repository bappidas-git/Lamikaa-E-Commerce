import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import apiService from "../../services/api";
import brand from "../../config/brand";
import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../context/WishlistContext";
import { useDealsConfig } from "../../context/DealsConfigContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import { categoryPath } from "../../utils/categories";
import { firstProductForCategory } from "../../utils/catalogue";
import { stageSrc } from "../../utils/product";
import { ROUTES } from "../../utils/constants";
import Logo from "../brand/Logo";
import { Accordion, Button, Drawer } from "../ui";
import styles from "./SidebarMenu.module.css";

// =============================================================================
// SidebarMenu — the mobile navigation drawer
// =============================================================================
//
// The whole storefront below 1025px navigates from here, so the drawer is a
// full-height glass panel rather than a menu: a 64px masthead carrying the
// wordmark and the close mark, a scrolling body of four labelled navs, and a
// footer pinned above the home indicator with the one CTA the range is named
// for.
//
// IT IS `ui/Drawer` NOW. The hand-rolled focus trap, the Escape handler, the
// `body.style.overflow` lock and the close-on-navigate effect this file used to
// carry are all the primitive's (Prompt 05), which means they behave exactly as
// the cart tray's and every future drawer's do — including the reference
// counting that keeps a modal opening over the drawer from unlocking the page
// early, and the `body[data-drawer-open]` flag the sticky header reads to drop
// its own backdrop filter (DESIGN_SYSTEM §4: two blurred layers, ever). The
// PUBLIC PROPS ARE UNCHANGED — Header still mounts
// `<SidebarMenu open onClose onOpenAuth />`.
//
// THE FIVE `--sf-drawer-*` CUSTOM PROPERTIES on `.panel` retune the primitive's
// chrome to this content (a 64px masthead, an 8px/20px body, a footer that adds
// the safe area rather than absorbing it). They are declared with the
// primitive's own values as defaults, so nothing else that uses Drawer moves.
//
// FOUR NAVS, four `aria-label`s, none of them clashing with a landmark another
// surface owns: the masthead's desktop nav is "Shop" and BottomNav is
// "Primary", so the catalogue group here is "Catalogue". Two navigation
// landmarks with the same name are indistinguishable in a screen reader's
// landmark list.
//
// WHAT IS DELIBERATELY GONE. The theme row (there is one theme — Prompt 03),
// the recursive multi-level category tree (the catalogue is one flat level of
// seven), the "Discover" sort deep links (the shop has no sort — brief §7.3),
// and `TrustStrip`, which becomes a home page section in Prompt 15.
// =============================================================================

// The wordmark in the masthead slot. Same <Logo> — and therefore the same URL —
// the header and the splash screen render, so opening the menu paints it from
// cache. It is decorative here (`alt=""`): the dialog is named "Menu" by the
// visually-hidden label beside it, and the store's name is already announced by
// the masthead behind the drawer.
const LOGO_WIDTH = 132;

// The Shop group is one accordion item, not seven: `Accordion` is single-open
// by default, and a group that can only ever have one panel open is exactly
// what a single item expresses.
const SHOP_ITEM_ID = "shop";

/** Initials for the account avatar — first + last, then the email, then "U". */
const initialsFor = (user) => {
  if (!user) return "";
  const parts = String(user.name || "").trim().split(/\s+/).filter(Boolean);
  const first = user.firstName || parts[0] || "";
  const last = user.lastName || parts.slice(1).join(" ") || "";
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase().trim();
  if (initials) return initials;
  if (user.email) return user.email.charAt(0).toUpperCase();
  return "U";
};

/** The name to greet an account by, however little of it the record carries. */
const displayNameFor = (user) => {
  if (!user) return "";
  if (user.firstName) {
    return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`;
  }
  return user.name || user.email || "User";
};

const SidebarMenu = ({ open, onClose, onOpenAuth }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const labelId = useId();

  const { user, logout, openAuthModal } = useAuth();
  const { getWishlistCount } = useWishlist();
  // The Offers entry disappears when the admin turns the Special Offers page
  // off — the same gate the masthead's nav applies.
  const { enabled: dealsEnabled } = useDealsConfig();
  // Contact rows come from Settings > General, already normalised: an
  // unresolved `{{LAMIKAA_EMAIL}}` reaches this component as "" (utils/
  // storeSettings.js runs every field through resolveOrNull), so a falsy check
  // is the whole placeholder rule and no `{{` can ever print here.
  const { email, phone, emailHref, phoneHref, socialLinks } = useStoreSettings();

  const wishlistCount = getWishlistCount();

  // ---- Catalogue ---------------------------------------------------------
  // Categories for the rows, hero products for their thumbnails — the same two
  // reads the mega panel makes, resolved through the same helper so a product
  // that gains a second category shows up identically on both surfaces.
  const [catalogue, setCatalogue] = useState({ categories: [], products: [] });
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);
  const loadedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadCatalogue = useCallback(() => {
    setLoadingCatalogue(true);
    return Promise.all([
      apiService.categories.getAll(),
      apiService.products.getHeroProducts(),
    ])
      .then(([categories, products]) => {
        if (!mountedRef.current) return;
        setCatalogue({
          categories: Array.isArray(categories)
            ? categories
            : categories?.data ?? [],
          products: Array.isArray(products) ? products : [],
        });
      })
      // A catalogue that will not load leaves the accordion empty and every
      // other section untouched — the drawer is still the way to the shop.
      .catch(() => {})
      .finally(() => {
        if (mountedRef.current) setLoadingCatalogue(false);
      });
  }, []);

  // Fetched on the first open rather than on mount: the drawer is mounted on
  // every storefront route and most visits never open it.
  useEffect(() => {
    if (!open || loadedRef.current) return;
    loadedRef.current = true;
    loadCatalogue();
  }, [open, loadCatalogue]);

  // Refetched when the tab regains focus, so a category renamed or retired in
  // the admin in another tab is right the next time the menu is opened —
  // the same freshness rule StoreSettingsContext applies to settings.
  useEffect(() => {
    const onFocus = () => {
      if (loadedRef.current) loadCatalogue();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadCatalogue]);

  // ---- Closing -----------------------------------------------------------
  // The primitive closes on Escape, on the scrim, on its close button and on
  // any route change. Links call this too: navigating to the route you are
  // already on does not change `location.pathname`, and without it the drawer
  // would stay open over the page it just "went" to.
  const close = useCallback(() => onClose?.(), [onClose]);

  const handleLogin = () => {
    close();
    onOpenAuth?.();
  };

  const handleSignup = () => {
    close();
    openAuthModal("signup");
  };

  const handleLogout = () => {
    close();
    logout();
    navigate(ROUTES.HOME);
  };

  // ---- Rows --------------------------------------------------------------
  const categoryRows = useMemo(
    () =>
      (catalogue.categories || []).map((cat) => {
        const first = firstProductForCategory(catalogue.products, cat);
        return {
          cat,
          // 32px slot, requested at 2x for retina.
          thumb: first ? stageSrc(first, { w: 64 }) : "",
        };
      }),
    [catalogue]
  );

  const shopActive =
    pathname === ROUTES.SHOP || pathname.startsWith("/category/");

  const brandLinks = [
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
    {
      key: "faq",
      label: "FAQ",
      to: ROUTES.FAQ,
      active: pathname === ROUTES.FAQ,
    },
    {
      key: "contact",
      label: "Contact",
      to: ROUTES.CONTACT,
      active: pathname === ROUTES.CONTACT,
    },
  ];

  const accountLinks = [
    {
      key: "profile",
      label: "My Profile",
      to: ROUTES.PROFILE,
      icon: "mdi:account-outline",
    },
    {
      key: "orders",
      label: "My Orders",
      to: ROUTES.ORDERS,
      icon: "mdi:package-variant-closed",
    },
    {
      key: "wishlist",
      label: "My Wishlist",
      to: ROUTES.WISHLIST,
      icon: "mdi:heart-outline",
      count: wishlistCount,
    },
  ];

  // ---- The Shop accordion ------------------------------------------------
  const shopPanel = (
    <ul className={styles.catList}>
      {categoryRows.map(({ cat, thumb }) => {
        const to = categoryPath(cat);
        return (
          <li key={cat.id ?? cat.slug}>
            <Link
              to={to}
              className={styles.catRow}
              onClick={close}
              aria-current={pathname === to ? "page" : undefined}
            >
              <span className={`sf-plate ${styles.catThumb}`} aria-hidden="true">
                {thumb ? (
                  <img
                    src={thumb}
                    alt=""
                    width="32"
                    height="32"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
              </span>
              <span className={styles.catName}>
                {cat.displayName || cat.name}
              </span>
            </Link>
          </li>
        );
      })}
      <li>
        <Link
          to={ROUTES.SHOP}
          className={`${styles.catRow} ${styles.catRowAll}`}
          onClick={close}
          aria-current={pathname === ROUTES.SHOP ? "page" : undefined}
        >
          {/* The empty plate keeps this label on the same x as the names
              above it. */}
          <span className={styles.catThumbSpacer} aria-hidden="true" />
          <span className={styles.catName}>All products</span>
        </Link>
      </li>
    </ul>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      width="min(100vw, 420px)"
      labelledBy={labelId}
      className={styles.panel}
      title={
        <span className={styles.brand}>
          {/* The dialog's accessible name and the drawer's heading in one
              node: read as "Menu", seen as the wordmark. */}
          <span id={labelId} className="sf-visually-hidden">
            Menu
          </span>
          <Logo width={LOGO_WIDTH} alt="" className={styles.logo} />
        </span>
      }
      footer={
        <>
          <Button
            variant="primary"
            block
            to={ROUTES.SHOP}
            onClick={close}
            className={styles.cta}
          >
            Shop the Black Rice Range
          </Button>
          <p className={styles.legal}>{brand.legalNote}</p>
        </>
      }
    >
      {/* ---- Catalogue --------------------------------------------------- */}
      <nav aria-label="Catalogue">
        <Accordion
          className={styles.shopAccordion}
          headingLevel="h2"
          items={[{ id: SHOP_ITEM_ID, title: "Shop", content: shopPanel }]}
          // Open where the visitor already is: arriving at the menu from the
          // shop or a category page, the categories are the thing they came
          // back for. Everywhere else the menu opens as one short list.
          defaultOpen={shopActive ? SHOP_ITEM_ID : undefined}
        />
        {loadingCatalogue && categoryRows.length === 0 ? (
          <p className={styles.note}>Loading the catalogue…</p>
        ) : null}
      </nav>

      {/* ---- Brand ------------------------------------------------------- */}
      <nav aria-label="Brand" className={styles.brandNav}>
        {brandLinks.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={styles.brandLink}
            onClick={close}
            aria-current={item.active ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* ---- Account ----------------------------------------------------- */}
      <nav aria-label="Account" className={styles.accountNav}>
        {user ? (
          <>
            <div className={styles.identity}>
              <span className={styles.avatar} aria-hidden="true">
                {initialsFor(user)}
              </span>
              <span className={styles.identityText}>
                <span className={styles.identityName}>
                  {displayNameFor(user)}
                </span>
                {user.email ? (
                  <span className={styles.identityMeta}>{user.email}</span>
                ) : null}
              </span>
            </div>

            {accountLinks.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className={styles.accountRow}
                onClick={close}
                aria-current={pathname === item.to ? "page" : undefined}
              >
                <Icon
                  icon={item.icon}
                  className={styles.accountIcon}
                  aria-hidden="true"
                />
                <span className={styles.accountLabel}>{item.label}</span>
                {/* The count is decorative — the row's own text carries it for
                    assistive tech, so the label is never read as "3My
                    Wishlist" (WCAG 2.5.3 needs the visible name to be
                    speakable). */}
                {item.count > 0 ? (
                  <span className={styles.count} aria-hidden="true">
                    {item.count > 99 ? "99+" : item.count}
                  </span>
                ) : null}
                {item.count > 0 ? (
                  <span className="sf-visually-hidden">
                    {`, ${item.count} ${item.count === 1 ? "item" : "items"}`}
                  </span>
                ) : null}
              </Link>
            ))}

            <button
              type="button"
              className={`${styles.accountRow} ${styles.logout}`}
              onClick={handleLogout}
            >
              <Icon
                icon="mdi:logout"
                className={styles.accountIcon}
                aria-hidden="true"
              />
              <span className={styles.accountLabel}>Log out</span>
            </button>
          </>
        ) : (
          <div className={styles.guest}>
            <Button
              variant="secondary"
              block
              onClick={handleLogin}
              className={styles.guestBtn}
            >
              Log in
            </Button>
            <Button
              variant="ghost"
              block
              onClick={handleSignup}
              className={styles.guestBtn}
            >
              Create account
            </Button>
          </div>
        )}
      </nav>

      {/* ---- Contact and social ------------------------------------------ */}
      {email || phone || socialLinks.length > 0 ? (
        <nav aria-label="Contact" className={styles.contactNav}>
          {email ? (
            <a href={emailHref} className={styles.contactRow}>
              <Icon
                icon="mdi:email-outline"
                className={styles.accountIcon}
                aria-hidden="true"
              />
              <span className={styles.contactText}>{email}</span>
            </a>
          ) : null}
          {phone ? (
            <a href={phoneHref} className={styles.contactRow}>
              <Icon
                icon="mdi:phone-outline"
                className={styles.accountIcon}
                aria-hidden="true"
              />
              <span className={styles.contactText}>{phone}</span>
            </a>
          ) : null}

          {socialLinks.length > 0 ? (
            <ul className={styles.social}>
              {socialLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.url}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.label}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d={link.path} />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </nav>
      ) : null}
    </Drawer>
  );
};

export default SidebarMenu;
