import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getPageMotion } from "./theme/motion";

// Context Providers
import { ThemeContextProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { AdminProvider } from "./context/AdminContext";
import { WishlistProvider } from "./context/WishlistContext";
import { DealsConfigProvider } from "./context/DealsConfigContext";
import { FaqProvider } from "./context/FaqContext";
import { StoreSettingsProvider, useStoreSettings } from "./context/StoreSettingsContext";

// Layout Components
import Header from "./components/Header/Header";
import BottomNav from "./components/BottomNav/BottomNav";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

// Routing components (Prompt 08)
import legacyRoutes from "./components/routing/LegacyRedirects";
import RouteFallback from "./components/routing/RouteFallback";
import AuthRoute from "./components/routing/AuthRoute";

import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { ROUTES } from "./utils/constants";
import "./App.css";

// =============================================================================
// CODE SPLITTING (Prompt 08)
// =============================================================================
// Every page below is its own chunk, so a first visit downloads the shell, the
// providers and ONE page instead of the whole application. Home is the single
// exception: it is the LCP page and the most common entry point, so pushing it
// behind a dynamic import would trade a smaller bundle for a slower hero.
//
// The admin is split too — a storefront visitor should never pay for sixteen
// admin screens, and an admin's second screen is a 30KB chunk, not a reload.
// =============================================================================
import Home from "./pages/Home/Home";

// Storefront Pages
const Products = React.lazy(() => import("./pages/Products/Products"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails/ProductDetails"));
const Checkout = React.lazy(() => import("./pages/Checkout/Checkout"));
const OrderConfirmation = React.lazy(() => import("./pages/OrderConfirmation/OrderConfirmation"));
const OrderHistory = React.lazy(() => import("./pages/OrderHistory/OrderHistory"));
const Profile = React.lazy(() => import("./pages/Profile/Profile"));
const HelpCenter = React.lazy(() => import("./pages/HelpCenter/HelpCenter"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService/TermsOfService"));
const CookiePolicy = React.lazy(() => import("./pages/CookiePolicy/CookiePolicy"));
const RefundPolicy = React.lazy(() => import("./pages/RefundPolicy/RefundPolicy"));
const Support = React.lazy(() => import("./pages/Support/Support"));
const AboutUs = React.lazy(() => import("./pages/AboutUs/AboutUs"));
const SpecialOffers = React.lazy(() => import("./pages/SpecialOffers/SpecialOffers"));
const Wishlist = React.lazy(() => import("./pages/Wishlist/Wishlist"));
const Search = React.lazy(() => import("./pages/Search/Search"));
const NotFound = React.lazy(() => import("./pages/NotFound/NotFound"));
// TEMPORARY (Prompt 08, removed by Prompts 24/28/29 as each page lands): the
// route map is complete from today, so the pages that have not been built yet
// say so instead of 404ing or hiding behind a redirect to the homepage.
// /search stopped needing it in Prompt 11.
const ComingSoon = React.lazy(() => import("./pages/_ComingSoon/ComingSoon"));
// TEMPORARY (Prompt 05, removed by Prompt 35): the visual QA surface for the
// shared UI primitives. Unlinked from the navigation and from the sitemap.
const Playground = React.lazy(() => import("./pages/_Playground/Playground"));

// Admin Pages
// The admin SHELL, not just the admin pages. It was the one eager import left
// on the admin side, and because it is built on MUI (Drawer, AppBar, List,
// Popper…) it pulled ~630 kB of @mui/* into the bundle EVERY STOREFRONT
// VISITOR downloads, for a layout only a signed-in administrator ever sees.
// Prompt 22's Lighthouse pass on `/` found it. It is a layout route inside the
// same <Suspense fallback={<RouteFallback/>}> as the pages it wraps, so it
// loads exactly the way they already do.
const AdminLayout = React.lazy(() => import("./components/AdminLayout/AdminLayout"));

const AdminLogin = React.lazy(() => import("./pages/Admin/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/Admin/AdminDashboard"));
const AdminProducts = React.lazy(() => import("./pages/Admin/AdminProducts"));
const AdminCategories = React.lazy(() => import("./pages/Admin/AdminCategories"));
const AdminOrders = React.lazy(() => import("./pages/Admin/AdminOrders"));
const AdminReturns = React.lazy(() => import("./pages/Admin/AdminReturns"));
const AdminPayments = React.lazy(() => import("./pages/Admin/AdminPayments"));
const AdminUsers = React.lazy(() => import("./pages/Admin/AdminUsers"));
const AdminShipping = React.lazy(() => import("./pages/Admin/AdminShipping"));
const AdminCoupons = React.lazy(() => import("./pages/Admin/AdminCoupons"));
const AdminSpecialOffers = React.lazy(() => import("./pages/Admin/AdminSpecialOffers"));
const AdminHeroSection = React.lazy(() => import("./pages/Admin/AdminHeroSection"));
const AdminFaqs = React.lazy(() => import("./pages/Admin/AdminFaqs"));
const AdminReviews = React.lazy(() => import("./pages/Admin/AdminReviews"));
const AdminLeads = React.lazy(() => import("./pages/Admin/AdminLeads"));
const AdminSettings = React.lazy(() => import("./pages/Admin/AdminSettings"));

// =============================================================================
// /category/:slug — the listing, constrained by the path
//
// TEMPORARY BRIDGE (Prompt 08 → 24). The category lives in the PATH now, but the
// page that renders it is still the Meghali-era listing, which reads its
// category from `?category=`. Rather than redirect (which would undo the very
// URL the sweep just introduced) the slug is handed to the listing as a prop and
// the listing locks itself to it. Prompt 24 replaces the element with
// <Shop mode="category" /> and this wrapper goes with it.
// =============================================================================
function CategoryRoute() {
  const { slug } = useParams();
  return <Products categorySlug={slug} />;
}

// =============================================================================
// The storefront shell.
//
// Lifted out of the <Route element> below so it can hold hooks — specifically
// useLocation(), which is what makes the route transition real. AnimatePresence
// only runs an exit animation when its child's KEY changes; keyed on the
// pathname (not the whole location), a route change plays one quiet fade out
// and one fade-and-rise in, while a query change (`/shop?concern=glow`) or a
// hash jump (`/faq#returns`) leaves the page exactly where it is.
//
// The transition lives here, once, rather than on twenty-odd page roots: that is
// what guarantees every storefront route arrives and leaves identically,
// including each page's own loading, empty and error branches.
//
// <Suspense> sits INSIDE the keyed <motion.div> on purpose: a fallback outside
// it would appear and disappear without the fade, so a slow chunk would flash
// the skeleton in and snap the page on. Inside, the skeleton IS the page for as
// long as the chunk takes, and it fades exactly like one.
// =============================================================================
function StorefrontShell() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const pageMotion = getPageMotion(reduceMotion);
  // Subscribing to the currency here, at the root of the storefront tree, is
  // what makes a currency change in the admin repaint every price under it:
  // the pages below call the plain formatCurrency() helper, which reads the
  // store's currency but cannot itself ask React for a re-render.
  useStoreSettings();

  return (
    <DealsConfigProvider>
      {/* The admin's FAQ set, read once for the whole storefront: the PDP's
          FAQs tab, the Help Centre and the shared FAQ block all draw on it. */}
      <FaqProvider>
      <div className="App">
        {/* First stop on every route, so a keyboard visitor can step over the
            announcement bar, the lockup, the four actions and the ten-item nav
            in one press. Styled in App.css — off-canvas until focused. */}
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Header />
        <main className="main-content" id="main-content" tabIndex={-1}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} {...pageMotion}>
              <Suspense fallback={<RouteFallback />}>
                <Routes location={location}>
                  {/* Every Meghali-era URL, redirected before anything else can
                      claim it. The old paths exist ONLY inside this array. */}
                  {legacyRoutes}

                  <Route path={ROUTES.HOME} element={<Home />} />

                  {/* ---- Catalogue ---------------------------------------- */}
                  {/* Prompt 23 replaces the element with <Shop />; the listing
                      reads ?concern= there. */}
                  <Route path={ROUTES.SHOP} element={<Products />} />
                  {/* The rituals "category" is an editorial index of its own,
                      not a listing — categoryPath() sends it here too. */}
                  <Route
                    path="/category/rituals"
                    element={<Navigate to={ROUTES.RITUALS} replace />}
                  />
                  <Route path={ROUTES.CATEGORY} element={<CategoryRoute />} />
                  {/* Product detail resolves by human-readable slug; a legacy
                      numeric /product/:id still resolves and redirects to the
                      canonical slug URL. */}
                  <Route path={ROUTES.PRODUCT} element={<ProductDetails />} />
                  <Route
                    path={ROUTES.RITUALS}
                    element={<ComingSoon prompt="24" title="Rituals" />}
                  />
                  <Route
                    path={ROUTES.RITUAL}
                    element={<ComingSoon prompt="24" title="Rituals" />}
                  />

                  {/* ---- Brand and content -------------------------------- */}
                  {/* Prompt 28 replaces AboutUs with pages/About/About. */}
                  <Route path={ROUTES.ABOUT} element={<AboutUs />} />
                  <Route
                    path={ROUTES.WHY}
                    element={<ComingSoon prompt="28" title="Why LAMIKAA" />}
                  />
                  {/* Prompt 28 → pages/Faq/Faq and pages/Contact/Contact. */}
                  <Route path={ROUTES.FAQ} element={<HelpCenter />} />
                  <Route path={ROUTES.CONTACT} element={<Support />} />
                  {/* Prompt 28 collapses these four into pages/Policies/
                      PolicyPage, driven by siteContent. */}
                  <Route path={ROUTES.POLICY_PRIVACY} element={<PrivacyPolicy />} />
                  <Route path={ROUTES.POLICY_TERMS} element={<TermsOfService />} />
                  <Route
                    path={ROUTES.POLICY_SHIPPING_RETURNS}
                    element={<RefundPolicy />}
                  />
                  <Route path={ROUTES.POLICY_COOKIES} element={<CookiePolicy />} />

                  {/* ---- Commerce ---------------------------------------- */}
                  {/* The cart is a drawer until Prompt 29 builds the page. */}
                  <Route
                    path={ROUTES.CART}
                    element={<ComingSoon prompt="29" title="Cart" />}
                  />
                  <Route path={ROUTES.CHECKOUT} element={<Checkout />} />
                  <Route
                    path={`${ROUTES.ORDER_CONFIRMATION}/:orderNumber`}
                    element={<OrderConfirmation />}
                  />
                  <Route path={ROUTES.SPECIAL_OFFERS} element={<SpecialOffers />} />

                  {/* ---- Account ----------------------------------------- */}
                  <Route path={ROUTES.ORDERS} element={<OrderHistory />} />
                  <Route path={ROUTES.PROFILE} element={<Profile />} />
                  <Route path={ROUTES.WISHLIST} element={<Wishlist />} />
                  {/* Deep-linkable auth: both paths open the modal over the page
                      the visitor came from. */}
                  <Route path={ROUTES.LOGIN} element={<AuthRoute tab="login" />} />
                  <Route path={ROUTES.REGISTER} element={<AuthRoute tab="signup" />} />

                  {/* ---- Utility ----------------------------------------- */}
                  {/* The overlay's ranking as a page: shareable, bookmarkable
                      and noindex. `/products?search=` redirects here. */}
                  <Route path={ROUTES.SEARCH} element={<Search />} />
                  {/* TEMPORARY — primitive playground, deleted by Prompt 35. */}
                  <Route path="/_playground" element={<Playground />} />
                  {/* A real 404 — never a redirect to the homepage. */}
                  <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
        <BottomNav />
      </div>
      </FaqProvider>
    </DealsConfigProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
    <ThemeContextProvider>
      {/* Above both route trees: the admin's Settings > General values dress the
          storefront AND the admin shell, so neither side can be the owner. */}
      <StoreSettingsProvider>
      <AuthProvider>
        <AdminProvider>
          <WishlistProvider>
            <CartProvider>
              <OrderProvider>
                <Router>
                  <ScrollToTop />
                  <CssBaseline />
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      {/* Admin Routes — paths unchanged by the Prompt 08 IA. */}
                      <Route path="/admin">
                        <Route index element={<AdminLogin />} />
                        <Route element={<AdminLayout />}>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="products" element={<AdminProducts />} />
                          <Route path="categories" element={<AdminCategories />} />
                          <Route path="orders" element={<AdminOrders />} />
                          <Route path="returns" element={<AdminReturns />} />
                          <Route path="payments" element={<AdminPayments />} />
                          <Route path="users" element={<AdminUsers />} />
                          <Route path="shipping" element={<AdminShipping />} />
                          <Route path="coupons" element={<AdminCoupons />} />
                          <Route path="special-offers" element={<AdminSpecialOffers />} />
                          <Route path="hero-section" element={<AdminHeroSection />} />
                          <Route path="faqs" element={<AdminFaqs />} />
                          <Route path="reviews" element={<AdminReviews />} />
                          <Route path="leads" element={<AdminLeads />} />
                          <Route path="settings" element={<AdminSettings />} />
                        </Route>
                      </Route>

                      {/* Storefront Routes */}
                      <Route path="/*" element={<StorefrontShell />} />
                    </Routes>
                  </Suspense>
                </Router>
              </OrderProvider>
            </CartProvider>
          </WishlistProvider>
        </AdminProvider>
      </AuthProvider>
      </StoreSettingsProvider>
    </ThemeContextProvider>
    </ErrorBoundary>
  );
}

export default App;
