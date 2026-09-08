import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import { useFaqs } from "../../context/FaqContext";
import apiService from "../../services/api";
import useSeo from "../../hooks/useSeo";
import brand from "../../config/brand";
import { isPriceKnown, stageSrc } from "../../utils/product";
import { categoryPath } from "../../utils/categories";
import { ROUTES } from "../../utils/constants";
import { STOREFRONT_CONFIG } from "../../theme/tokens";
import { Accordion, ContentBlocks, Skeleton } from "../../components/ui";
import Chapter from "../../components/pdp/Chapter";
import MediaGallery from "../../components/pdp/MediaGallery";
import ChapterNav from "../../components/pdp/ChapterNav";
import PurchasePanel from "../../components/pdp/PurchasePanel";
import {
  AddToCartBar,
  FrequentlyBoughtTogether,
  RelatedProducts,
  ReviewsSection,
} from "../../components/storefront";
import NotFound from "../NotFound/NotFound";
import styles from "./ProductDetails.module.css";

// =============================================================================
// /product/:slug — the product page
// =============================================================================
//
// TWO COLUMNS, ONE OF THEM STILL. From 1025px the pack holds its place on the
// left (`position: sticky`) while the right column scrolls the whole way: the
// purchase panel first, then the product's story as numbered chapters. The
// product is never off screen while a shopper reads about it, and the page
// needs no second gallery further down to put it back.
//
// THE TAB STRIP IS GONE, and its absence is the design. Five panels behind one
// control hid four fifths of the page, on a range whose whole story — the
// ritual step, the ingredients, the farmer ownership — is the reason to buy.
// Everything is on the page now, in order, and `ChapterNav` is how you skip: a
// slim glass bar that arrives after 320px of scroll, tracks the chapter being
// read and jumps to any other.
//
// WHAT WENT WITH IT. Six derivation helpers built a textile spec table, a
// craft narrative and a "PREMIUM" ribbon for the previous brand. None of that
// has a LAMIKAA meaning — a face wash carries an INCI list and a ritual step,
// not a textile record — and the fields those helpers read do not exist on
// a seeded product. The promises band went the same way: it restated, two
// screens lower, the trust badges the purchase panel already carries.
//
// THE HEAD IS `useSeo`'s NOW. The hand-rolled `setPageTitle` + `meta[name=
// description]` effect this page carried (the last one in the app) is replaced
// by the hook every other route uses, so the PDP also gets a canonical, the
// Open Graph set and a share image. The product JSON-LD arrives in Prompt 27.
//
// STAGED ACROSS THREE PROMPTS. Prompt 25 built the skeleton: layout, panel,
// nav, the overview chapter and the mobile bar. Prompt 26 filled the media
// column with `pdp/MediaGallery` — the mixed image/video gallery, its rail and
// its lightbox — which is mounted with `key={product.id}` so a walk from one
// product to the next resets the gallery's index and toggle the way a new page
// should. Prompt 27 writes the benefits / ingredients / directions /
// farmer-story / full-INCI chapters and rewrites the three retained blocks at
// the foot of the column (FAQs, reviews, the cross-sell rails).
// =============================================================================

/** Quantity ceiling for a product whose stock nobody has recorded. */
const STOCK_UNKNOWN_MAX = 10;

/** How long the "Added" state holds on the Add to Cart button. */
const ADDED_MS = 1400;

/** The <h1>'s id — the purchase panel labels itself with it. */
const TITLE_ID = "pdp-title";

/**
 * The tab title a product asks for.
 *
 * `useSeo` owns the "%s · LAMIKAA NATURALS" template, and the seeded
 * `metaTitle` is a WHOLE title ("Black Rice Face Wash · LAMIKAA NATURALS") —
 * written in Prompt 06 for the hand-rolled title effect this page used to run.
 * Handed to the hook unchanged it printed the brand name twice. An override
 * that already ends in the site's own suffix therefore has it taken off HERE
 * rather than out of the seed: the admin's field keeps meaning "the title I
 * want", whatever an owner types into it, and neither answer says LAMIKAA
 * NATURALS twice.
 */
export const productSeoTitle = (product) => {
  const override = product?.metaTitle?.trim();
  if (!override) return product?.name;
  const suffix = brand.seo.titleTemplate.replace("%s", "");
  if (suffix && override.endsWith(suffix)) {
    return override.slice(0, -suffix.length).trim() || product?.name;
  }
  return override;
};

// ─── Loading skeleton ────────────────────────────────────────────────────────
// The page's silhouette in the two-column shape it is about to take, drawn on
// the shared `Skeleton` primitive.
const PageSkeleton = () => (
  <div className={styles.page}>
    <div className={`sf-container sf-container--wide ${styles.layout}`} aria-hidden="true">
      <div className={styles.mediaColumn}>
        <Skeleton variant="block" className={styles.stage} />
      </div>
      <div className={styles.contentColumn}>
        <div className={styles.panelSkeleton}>
          <Skeleton variant="text" lines={1} width="40%" />
          <Skeleton variant="text" lines={2} />
          <Skeleton variant="text" lines={1} width="30%" />
          <Skeleton variant="text" lines={3} />
          <Skeleton variant="block" height="52px" />
        </div>
      </div>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// DATA
// ═════════════════════════════════════════════════════════════════════════════
/**
 * Everything the page knows and everything it can do, in one hook.
 *
 * It lives outside the view so the route can decide between the skeleton, the
 * 404 and the page BEFORE the component that owns the <head> mounts — see the
 * note on `ProductDetails` at the bottom of this file.
 */
const useProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  // Currency, the tax note and the COD rules come from Admin → Settings; the
  // whole record is handed on to the trust badges and the delivery panel.
  const {
    store: settingsStore,
    payment: settingsPayment,
    currency: storeCurrency,
    fillCopy,
  } = useStoreSettings();
  const settings = useMemo(
    () => ({ store: settingsStore, payment: settingsPayment }),
    [settingsStore, settingsPayment]
  );
  // The FAQs chapter reads the admin's answer set — Admin → Storefront → FAQs.
  const { forProduct: faqsForThisProduct } = useFaqs();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [bundle, setBundle] = useState([]);
  const [category, setCategory] = useState(null);
  const [shipping, setShipping] = useState([]);

  // ── Fetch product ───────────────────────────────────────────────────────
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setNotFound(false);

      const isLegacyId = /^\d+$/.test(String(slug));
      let data = isLegacyId
        ? await apiService.products.getById(slug)
        : await apiService.products.getBySlug(slug);

      if (!data) {
        data = isLegacyId
          ? await apiService.products.getBySlug(slug).catch(() => null)
          : await apiService.products.getById(slug).catch(() => null);
      }

      if (!data) {
        setProduct(null);
        setNotFound(true);
        return;
      }

      // Canonicalise the URL to the slug form so old links never 404.
      if (data.slug && String(slug) !== String(data.slug)) {
        navigate(`/product/${data.slug}`, { replace: true });
      }

      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      setQuantity(1);

      // Recently viewed (key must match what Home.js reads).
      try {
        const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        const filtered = viewed.filter((item) => String(item.id) !== String(data.id));
        filtered.unshift({
          id: data.id,
          slug: data.slug,
          name: data.name,
          brand: data.brand,
          image: data.images?.[0] || data.image,
          images: data.images,
          price: data.price,
          comparePrice: data.comparePrice,
          variants: data.variants,
          rating: data.rating,
          totalReviews: data.totalReviews,
          viewedAt: new Date().toISOString(),
        });
        localStorage.setItem("recentlyViewed", JSON.stringify(filtered.slice(0, 20)));
      } catch (e) {
        /* ignore localStorage errors */
      }

      if (data.categoryId) {
        apiService.categories
          .getById(data.categoryId)
          .then(setCategory)
          .catch(() => {});
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  // ── Fetch reviews (approved only — enforced by the API) ─────────────────
  const fetchReviews = useCallback(async () => {
    const productId = product?.id;
    if (!productId) return;
    try {
      setReviewsLoading(true);
      setReviewsError(false);
      const data = await apiService.products.getReviews(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      setReviewsError(true);
    } finally {
      setReviewsLoading(false);
    }
  }, [product?.id]);

  // ── Related + bundle (AOV) — real catalogue data only ───────────────────
  const fetchAov = useCallback(async () => {
    if (!product) return;
    const cfg = STOREFRONT_CONFIG.aov;
    if (cfg.relatedProducts) {
      apiService.products
        .getRelated(product, cfg.maxRelated)
        .then(setRelatedProducts)
        .catch(() => setRelatedProducts([]));
    }
    if (cfg.frequentlyBoughtTogether) {
      apiService.products
        .getFrequentlyBoughtTogether(product, cfg.maxBundle - 1)
        .then(setBundle)
        .catch(() => setBundle([]));
    }
  }, [product]);

  // Public store data for the delivery panel and the trust badges.
  useEffect(() => {
    apiService.shipping
      .getMethods()
      .then((m) => setShipping(Array.isArray(m) ? m : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [fetchProduct]);

  useEffect(() => {
    if (product) {
      fetchReviews();
      fetchAov();
    }
  }, [product, fetchReviews, fetchAov]);

  // ── Derived: stock, availability, the quantity ceiling ──────────────────
  const currentStock = selectedVariant
    ? typeof selectedVariant.stock === "number"
      ? selectedVariant.stock
      : product?.stock
    : product?.stock;
  const hasStockInfo = typeof currentStock === "number";
  const isOutOfStock = hasStockInfo && currentStock <= 0;
  const lowStockThreshold = Number(product?.lowStockThreshold) || 5;
  const isLowStock = !isOutOfStock && hasStockInfo && currentStock <= lowStockThreshold;
  const maxQuantity = hasStockInfo ? Math.max(1, currentStock) : STOCK_UNKNOWN_MAX;

  useEffect(() => {
    setQuantity((q) => Math.min(Math.max(1, q), maxQuantity));
  }, [maxQuantity]);

  // "Price on launch" — the one flag that disables buying anywhere on the site.
  const comingSoon = product ? !isPriceKnown(product) : false;
  const unavailable = comingSoon || isOutOfStock;

  // ── Reviews blend (one average across the page) ─────────────────────────
  const baseRating = Number(product?.rating) || 0;
  const baseCount = Number(product?.totalReviews) || 0;
  const reviewSum = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
  const totalRatingsCount = baseCount + reviews.length;
  const displayAvg =
    totalRatingsCount > 0
      ? (baseRating * baseCount + reviewSum) / totalRatingsCount
      : baseRating;

  // ── Cart wiring. The line id scheme is the cart's contract: `<id>` for a
  // plain product, `<id>-<variantId>` for a variant. Changing it orphans every
  // line already in a shopper's cart.
  const handleAddToCart = useCallback(
    (options) => {
      if (!product) return undefined;
      if (product.variants?.length > 0 && !selectedVariant) return undefined;

      const effectivePrice = selectedVariant ? selectedVariant.price : product.price;
      const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
      const cartItem = {
        id: selectedVariant ? `${product.id}-${selectedVariant.id}` : String(product.id),
        productId: product.id,
        slug: product.slug || null,
        variantId: selectedVariant?.id || null,
        variantName: selectedVariant?.name || null,
        name: product.name,
        image: product.images?.[0] || product.image || "",
        price: effectivePrice,
        comparePrice: product.comparePrice || 0,
        currency: storeCurrency,
        ...(effectiveStock != null && effectiveStock !== ""
          ? { stock: Number(effectiveStock) }
          : {}),
      };
      return addToCart(cartItem, quantity, options);
    },
    [product, selectedVariant, quantity, addToCart, storeCurrency]
  );

  // The primary CTA, with the brief "Added" confirmation the Button variant
  // owns (the cart toast and the drawer also fire, from CartContext).
  const addedTimer = useRef(null);
  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const handleAddClick = useCallback(() => {
    if (unavailable) return;
    handleAddToCart();
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), ADDED_MS);
  }, [handleAddToCart, unavailable]);

  const handleBuyNow = useCallback(async () => {
    if (unavailable) return;
    await handleAddToCart({ openDrawer: false });
    navigate(ROUTES.CHECKOUT);
  }, [handleAddToCart, unavailable, navigate]);

  // ── Below-the-panel content ─────────────────────────────────────────────
  const faqs = useMemo(
    () => (product ? faqsForThisProduct(product) : []),
    [product, faqsForThisProduct]
  );

  return {
    product,
    loading,
    notFound,
    category,
    shipping,
    settings,
    fillCopy,
    // Selection
    selectedVariant,
    setSelectedVariant,
    quantity,
    setQuantity,
    maxQuantity,
    // Availability
    hasStockInfo,
    isOutOfStock,
    isLowStock,
    currentStock,
    comingSoon,
    // Actions
    added,
    handleAddClick,
    handleBuyNow,
    addToCart,
    toggleWishlist,
    isInWishlist,
    // Reviews + AOV
    reviews,
    reviewsLoading,
    reviewsError,
    fetchReviews,
    displayAvg,
    totalRatingsCount,
    relatedProducts,
    bundle,
    faqs,
  };
};

// ═════════════════════════════════════════════════════════════════════════════
// VIEW
// ═════════════════════════════════════════════════════════════════════════════
const ProductDetailsView = ({
  product,
  category,
  shipping,
  settings,
  fillCopy,
  selectedVariant,
  setSelectedVariant,
  quantity,
  setQuantity,
  maxQuantity,
  hasStockInfo,
  isOutOfStock,
  isLowStock,
  currentStock,
  comingSoon,
  added,
  handleAddClick,
  handleBuyNow,
  addToCart,
  toggleWishlist,
  isInWishlist,
  reviews,
  reviewsLoading,
  reviewsError,
  fetchReviews,
  displayAvg,
  totalRatingsCount,
  relatedProducts,
  bundle,
  faqs,
}) => {
  // The purchase panel's own CTA row: the anchor the sticky mobile bar watches,
  // which is what guarantees the bar can never cover the buttons it duplicates.
  const ctaRef = useRef(null);

  // ── The head — Admin → Products → SEO (Optional), through the shared hook
  useSeo({
    title: productSeoTitle(product),
    description:
      product.metaDescription?.trim() || product.promise || product.shortDescription,
    image: stageSrc(product, { w: 1200, ar: "1:1" }),
    type: "product",
  });

  const faqItems = useMemo(
    () =>
      faqs.map((faq, index) => ({
        id: `pdp-faq-${index}`,
        title: faq.question,
        content: fillCopy(faq.answer),
      })),
    [faqs, fillCopy]
  );

  // The chapter index. The order here IS document order — `ChapterNav` observes
  // these sections and the first one in the reading band wins, so the two lists
  // must not disagree.
  const chapters = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      ...(faqs.length > 0 ? [{ id: "faqs", label: "FAQs" }] : []),
      { id: "reviews", label: "Reviews" },
    ],
    [faqs.length]
  );

  const chapterIndex = (id) => chapters.findIndex((row) => row.id === id);

  const scrollToReviews = useCallback(() => {
    const section = document.getElementById("reviews");
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    section.focus({ preventScroll: true });
  }, []);

  // ONE ARRAY, TWO RENDERINGS: the visible trail, and the BreadcrumbList that
  // Prompt 27 will publish from these same rows.
  const trail = [
    { label: "Home", to: ROUTES.HOME },
    { label: "Shop", to: ROUTES.SHOP },
    ...(category
      ? [
          {
            label: category.displayName || category.name,
            to: categoryPath(category),
          },
        ]
      : []),
    { label: product.shortName || product.name },
  ];

  const suitableFor = Array.isArray(product.suitableFor)
    ? product.suitableFor.filter(Boolean)
    : [];

  return (
    <div className={styles.page}>
      <div className={`sf-container sf-container--wide ${styles.layout}`}>
        {/* ── The pack, held in place ─────────────────────────────────── */}
        <div className={styles.mediaColumn}>
          <MediaGallery key={product.id} product={product} />
        </div>

        {/* ── The column that scrolls ─────────────────────────────────── */}
        <div className={styles.contentColumn}>
          <PurchasePanel
            product={product}
            category={category}
            trail={trail}
            titleId={TITLE_ID}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
            quantity={quantity}
            onQuantityChange={setQuantity}
            maxQuantity={maxQuantity}
            hasStockInfo={hasStockInfo}
            isOutOfStock={isOutOfStock}
            isLowStock={isLowStock}
            stock={currentStock}
            comingSoon={comingSoon}
            onAddToCart={handleAddClick}
            onBuyNow={handleBuyNow}
            added={added}
            wishlisted={isInWishlist(product.id)}
            onToggleWishlist={() => toggleWishlist(product)}
            showRating={totalRatingsCount > 0}
            rating={displayAvg}
            ratingsCount={totalRatingsCount}
            onReviewsClick={scrollToReviews}
            shipping={shipping}
            settings={settings}
            fillCopy={fillCopy}
            ctaRef={ctaRef}
          />

          <ChapterNav chapters={chapters} className={styles.nav} />

          {/* ── 01 Overview ──────────────────────────────────────────── */}
          <Chapter id="overview" index={0} title="Overview" className={styles.chapter}>
            {product.description ? (
              <ContentBlocks text={product.description} variant="prose" />
            ) : null}

            {suitableFor.length > 0 && (
              <p className={styles.suitableFor}>
                <span className={styles.suitableForLabel}>Suitable for</span>
                {suitableFor.join(" · ")}
              </p>
            )}
          </Chapter>

          {/* ── Retained, pending Prompt 27 ───────────────────────────────
              The FAQ accordion, the reviews and the two cross-sell rails are
              the PDP's existing content features; they keep working exactly as
              they did behind the tab strip. Prompt 27 rewrites them and adds
              the benefits / ingredients / directions / farmer-story / full-INCI
              chapters around them. */}
          {faqItems.length > 0 && (
            <Chapter
              id="faqs"
              index={chapterIndex("faqs")}
              title="Questions, answered"
              className={styles.chapter}
            >
              <Accordion items={faqItems} headingLevel="h3" />
            </Chapter>
          )}

          <Chapter
            id="reviews"
            index={chapterIndex("reviews")}
            title="Reviews"
            className={styles.chapter}
          >
            <ReviewsSection
              reviews={reviews}
              displayAvg={displayAvg}
              totalRatingsCount={totalRatingsCount}
              loading={reviewsLoading}
              error={reviewsError}
              onRetry={fetchReviews}
            />
          </Chapter>

          <FrequentlyBoughtTogether
            anchor={product}
            companions={bundle}
            onAddToCart={addToCart}
          />

          <RelatedProducts
            title="You may also like"
            products={relatedProducts}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            isInWishlist={isInWishlist}
          />
        </div>
      </div>

      {/* ── The sticky purchase bar (≤ 768px) ──────────────────────────── */}
      <AddToCartBar
        anchorRef={ctaRef}
        product={product}
        variant={selectedVariant}
        name={selectedVariant?.name || product.name}
        outOfStock={isOutOfStock}
        comingSoon={comingSoon}
        added={added}
        onAddToCart={handleAddClick}
        onBuyNow={comingSoon || isOutOfStock ? undefined : handleBuyNow}
      />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
/**
 * The route's three states, and nothing else.
 *
 * THE SPLIT IS NOT COSMETIC — the same rule `/shop` follows. `useSeo` claims
 * the tab, the description, the Open Graph set and the canonical, and remembers
 * what it displaced so it can put it back. Two of them mounted at once (this
 * page's and the one inside <NotFound/>) restore in the wrong order and leave a
 * stale description behind, so both exits are taken BEFORE the view that owns
 * the head, and exactly one useSeo is ever mounted on this route.
 *
 * A DRAFT IS A 404. `products.getById/getBySlug` answer `null` for a product
 * whose "Active (visible on store)" switch is off, which is the same answer a
 * missing slug gets and the same page it deserves.
 */
const ProductDetails = () => {
  const data = useProductPage();

  if (data.loading) return <PageSkeleton />;
  if (data.notFound || !data.product) return <NotFound />;

  return <ProductDetailsView {...data} />;
};

export default ProductDetails;
