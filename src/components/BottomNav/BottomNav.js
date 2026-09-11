import React, { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useWishlist } from "../../context/WishlistContext";
import SearchModal from "../SearchModal/SearchModal";
import { ROUTES } from "../../utils/constants";
import styles from "./BottomNav.module.css";

// =============================================================================
// BottomNav — the phone and tablet tab bar
// =============================================================================
//
// Five labelled tabs on a strong-glass bar with one hairline on top: 64px of
// bar plus whatever the device's home indicator asks for. It is the storefront's
// thumb-level chrome below 769px and does not exist above it.
//
// LABELS ARE VISIBLE, always. An icon-only bar saves 13px of height and costs
// every visitor who does not read `mdi:shopping-outline` as "shop" — and a
// voice-control user the ability to say the tab's name at all.
//
// THE ACTIVE TAB is gold type plus a 20px signature-gradient hairline above the
// icon: two differences, so the state is never carried by colour alone, and
// NavLink stamps `aria-current="page"` on top of both. The hairline is rendered
// on every tab (transparent when inactive) so nothing reflows as you move
// between them.
//
// SHOP COVERS THE WHOLE CATALOGUE, not just /shop: a category page, a product
// page and the rituals index are all "Shop" as far as the bar is concerned, so
// the tab stays lit while a visitor browses down into one. Search is the one
// tab that is not a route — a real <button> that opens the SearchModal this
// component still mounts, exactly as before.
//
// HIDE ON SCROLL DOWN, SHOW ON SCROLL UP — the existing behaviour, with one
// rule added: the bar never hides while an overlay is up. `body[data-drawer-open]`
// (ui/Drawer, reference-counted) and `body[data-scroll-lock]` (useScrollLock)
// are the two flags that say so, and a drawer sliding in over a bar that is
// mid-retreat is a distraction the visitor did not ask for.
//
// Z-ORDER: the bar sits at --sf-z-sticky (40) and the PDP's sticky purchase bar
// at --sf-z-stickybar (60), which is ABOVE it — the buy action wins the bottom
// of a product page.
//
// NOT ON A PRODUCT PAGE, AND NOT ON THE CART (Prompts 25, 29). Below 769px both
// of those routes grow their own sticky bar — the pack, the price and Add to
// Cart on a PDP; the subtotal and Checkout on /cart — and two stacked bars take
// 128px off a 640px screen, leave the tab labels reading as part of the buy
// control, and push the page's own content behind both. The bar therefore
// stands down on exactly the two routes where the thing a visitor came to do
// lives at the bottom of the screen. Navigation is still a tap away in the
// masthead (menu, search, cart) at every width. The bar exists only below 769px
// anyway, so this is a decision about phones and large phones.
// =============================================================================

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "mdi:home-outline", path: ROUTES.HOME },
  { key: "shop", label: "Shop", icon: "mdi:shopping-outline", path: ROUTES.SHOP },
  { key: "search", label: "Search", icon: "mdi:magnify", path: null },
  {
    key: "wishlist",
    label: "Wishlist",
    icon: "mdi:heart-outline",
    path: ROUTES.WISHLIST,
  },
  {
    key: "account",
    label: "Account",
    icon: "mdi:account-outline",
    path: ROUTES.PROFILE,
  },
];

/** The scroll depth below which the bar always shows — a short page never hides
    its own navigation. */
const HIDE_AFTER = 80;

/** Is an overlay holding the page? Either flag means "do not move". */
const overlayIsOpen = () => {
  if (typeof document === "undefined") return false;
  const { body } = document;
  return Boolean(body?.dataset.drawerOpen || body?.dataset.scrollLock);
};

/** The two routes the bar stands down on — see the note above. */
export const hidesBottomNav = (pathname) =>
  typeof pathname === "string" &&
  (pathname.startsWith("/product/") || pathname === ROUTES.CART);

const BottomNav = () => {
  const { getWishlistCount } = useWishlist();
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  const wishlistCount = getWishlistCount();

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      // An overlay is up: hold the bar exactly where it is. iOS still emits
      // scroll events for rubber-banding behind a locked body, and the bar
      // retreating under a drawer is movement nobody asked for.
      if (overlayIsOpen()) {
        lastScrollY.current = currentY;
        return;
      }
      setVisible(!(currentY > lastScrollY.current && currentY > HIDE_AFTER));
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The search overlay is this component's own, so it cannot rely on the body
  // flags alone: bring the bar back before the modal covers it, so closing the
  // modal never reveals a bar that has quietly slid away.
  useEffect(() => {
    if (searchOpen) setVisible(true);
  }, [searchOpen]);

  // The catalogue rules the tab bar reads. Written out rather than left to
  // NavLink's prefix matching because "/product/black-rice-face-wash" has to
  // light the SHOP tab, and NavLink can only match a tab against its own path.
  const isShopActive =
    pathname === ROUTES.SHOP ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/product/") ||
    pathname === ROUTES.RITUALS ||
    pathname.startsWith("/rituals/");

  const resolveActive = useCallback(
    (item, isActive) => (item.key === "shop" ? isShopActive : isActive),
    [isShopActive]
  );

  // Every hook above has run: the bar may now decline to render. Its search
  // modal goes with it — the modal is opened from this bar and from nowhere
  // else, and the masthead carries its own search at every width.
  if (hidesBottomNav(pathname)) return null;

  const renderInner = (item) => (
    <>
      {/* The active marker: a 20px slice of the signature gradient. Rendered on
          every tab so the row's height never depends on where you are. */}
      <span className={styles.rule} aria-hidden="true" />
      <span className={styles.iconWrap}>
        <Icon icon={item.icon} className={styles.icon} aria-hidden="true" />
        {/* The count is already spoken in the tab's aria-label, and it sits in
            the DOM ahead of the word with no whitespace between them — so to a
            machine the tab read "3Wishlist", which no voice-control user can
            say (WCAG 2.5.3). Hidden here, the visible label is the plain word
            again and the aria-label contains it. */}
        {item.key === "wishlist" && wishlistCount > 0 ? (
          <span className={styles.badge} aria-hidden="true">
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        ) : null}
      </span>
      <span className={styles.label}>{item.label}</span>
    </>
  );

  return (
    <>
      <nav
        className={[
          // The chrome scope — the same near-black band as the masthead,
          // closing the page at the foot of a phone.
          "sf-on-dark",
          "sf-glass",
          "sf-glass--strong",
          // "text on glass over imagery gets .sf-glass--scrim" (DESIGN_SYSTEM
          // §4). Unlike the drawer, this bar has no --sf-color-overlay behind
          // it: the live page scrolls directly under 8% white and a 12px blur,
          // and a bright product photograph or a gold headline passing beneath
          // "Wishlist" would take its 11px label under AA. The scrim is an
          // inert ::before, so the tabs stay clickable and the glass stays
          // glass.
          "sf-glass--scrim",
          styles.bottomNav,
          visible ? styles.visible : styles.hidden,
        ].join(" ")}
        aria-label="Primary"
      >
        <div className={styles.navItems}>
          {NAV_ITEMS.map((item) => {
            // Search: a real <button> that opens the modal (not a route). It
            // marks itself active while the modal is up, so the bar always says
            // where you are.
            if (item.key === "search") {
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`${styles.navItem} ${
                    searchOpen ? styles.active : ""
                  }`}
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  aria-haspopup="dialog"
                  aria-expanded={searchOpen}
                >
                  {renderInner(item)}
                </button>
              );
            }

            // Route tabs: NavLink handles the active class + aria-current.
            return (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.key === "home"}
                className={({ isActive }) =>
                  `${styles.navItem} ${
                    resolveActive(item, isActive) ? styles.active : ""
                  }`
                }
                aria-label={
                  item.key === "wishlist"
                    ? `Wishlist, ${wishlistCount} ${
                        wishlistCount === 1 ? "item" : "items"
                      }`
                    : item.label
                }
              >
                {renderInner(item)}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default BottomNav;
