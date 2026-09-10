import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import { useFaqs } from "../../context/FaqContext";
import apiService from "../../services/api";
import useSeo from "../../hooks/useSeo";
import brand from "../../config/brand";
import { isPriceKnown, stageSrc } from "../../utils/product";
import { categoryPath } from "../../utils/categories";
import { productPath } from "../../utils/helpers";
import { isPlaceholder } from "../../utils/placeholders";
import { breadcrumbJsonLd, productJsonLd } from "../../utils/seo";
import { ROUTES } from "../../utils/constants";
import { STOREFRONT_CONFIG } from "../../theme/tokens";
import { Accordion, Button, ContentBlocks, ErrorState, Skeleton } from "../../components/ui";
import FAQ from "../../components/FAQ/FAQ";
import Chapter from "../../components/pdp/Chapter";
import MediaGallery from "../../components/pdp/MediaGallery";
import ChapterNav from "../../components/pdp/ChapterNav";
import PurchasePanel from "../../components/pdp/PurchasePanel";
import IngredientChapter from "../../components/pdp/IngredientChapter";
import HowToUse, { ritualsWithProduct } from "../../components/pdp/HowToUse";
import FarmerStory, { farmerStoryLines } from "../../components/pdp/FarmerStory";
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
// WHAT WENT WITH IT. Six derivation helpers built a materials spec table, a
// craft narrative and a corner ribbon for the previous catalogue. None of that
// has a LAMIKAA meaning — a face wash carries an INCI list and a ritual step,
// not a materials record — and the fields those helpers read do not exist on
// a seeded product. The promises band went the same way: it restated, two
// screens lower, the trust badges the purchase panel already carries.
//
// THE HEAD IS `useSeo`'s, GRAPHS INCLUDED. The hand-rolled `setPageTitle` +
// `meta[name=description]` effect this page carried (the last one in the app)
// is gone; the hook every other route uses also gives the PDP a canonical, the
// Open Graph set, a share image and — through `utils/seo` — the `Product` and
// `BreadcrumbList` graphs. `Product` is the one graph on this storefront a
// search engine will render as a rich result, so it is also the one that must
// not overstate: `offers` is published only for a product whose price is known
// and `aggregateRating` only where a real rating exists, which on a fresh
// install means neither key appears on five of the eight products and the
// rating appears on none.
//
// NINE CHAPTERS, EACH ONE OPTIONAL. Overview, Benefits, Key ingredients, How to
// use, The farmer story, Full ingredients, FAQs, Reviews, Complete the ritual —
// in that order, and every one of them absent from the document AND from
// `ChapterNav` when the product has nothing to put in it. The two lists cannot
// disagree because both read the same booleans, computed once.
//
// THE CHAPTERS PRINT DATA, NOT PROSE. Benefits, ingredients, directions, the
// INCI list, the ritual step and the FAQs are all fields an admin edits; this
// file types section furniture and nothing else. The one place the page carries
// pack copy it has not verified — the antioxidant line — is inside
// `PackClaims`, under "As printed on the pack", where it is a quotation of the
// carton rather than a claim the shop is making.
//
// ONE ROUND TRIP FOR THE CHAPTERS. Reviews, related, the bundle, the rituals
// and the two `siteContent` sections are fetched together once the product has
// resolved, and each of them catches its own failure: an unreachable rituals
// endpoint costs the page its "Part of these rituals" list and nothing else.
//
// STAGED ACROSS THREE PROMPTS. Prompt 25 built the skeleton: layout, panel,
// nav, the overview chapter and the mobile bar. Prompt 26 filled the media
// column with `pdp/MediaGallery` — the mixed image/video gallery, its rail and
// its lightbox — which is mounted with `key={product.id}` so a walk from one
// product to the next resets the gallery's index and toggle the way a new page
// should. Prompt 27 wrote the remaining chapters, the cross-sell chapter and
// the structured data.
// =============================================================================

/** Quantity ceiling for a product whose stock nobody has recorded. */
const STOCK_UNKNOWN_MAX = 10;

/** How long the "Added" state holds on the Add to Cart button. */
const ADDED_MS = 1400;

/** The <h1>'s id — the purchase panel labels itself with it. */
const TITLE_ID = "pdp-title";

/**
 * The disclosure the INCI list sits behind.
 *
 * "Full ingredients" is the chapter's own heading, so the trigger says what
 * pressing it reveals instead of repeating it — a row labelled with its
 * section's name reads, in a screen reader, as "Full ingredients, Full
 * ingredients, collapsed".
 */
const INCI_DISCLOSURE_TITLE = "Read the full INCI list";

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
  // NOT the same thing as `notFound`, and the difference is the whole point.
  // "There is no such product" is a 404; "the read did not come back" is a
  // failure, and telling a shopper on a dropped connection that the product
  // they clicked does not exist is the one mistake this page must not make —
  // the same rule `/shop` states for the listing.
  const [failed, setFailed] = useState(false);
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
  // The chapter data: the routines this product belongs to, and the two
  // `siteContent` sections the farmer story is written from.
  const [rituals, setRituals] = useState([]);
  const [aboutContent, setAboutContent] = useState(null);
  const [homeContent, setHomeContent] = useState(null);

  // ── Fetch product ───────────────────────────────────────────────────────
  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setNotFound(false);
      setFailed(false);

      const isLegacyId = /^\d+$/.test(String(slug));
      // A 404 from the API is an ANSWER ("no such row"), not a failure, so it
      // is folded into the null the callers below already treat as a miss.
      // Everything else — no response at all, a 5xx, a timeout — is left to
      // throw, and lands in the failure branch at the bottom.
      const missToNull = (error) => {
        if (error?.response?.status === 404) return null;
        throw error;
      };
      let data = isLegacyId
        ? await apiService.products.getById(slug).catch(missToNull)
        : await apiService.products.getBySlug(slug).catch(missToNull);

      if (!data) {
        data = isLegacyId
          ? await apiService.products.getBySlug(slug).catch(missToNull)
          : await apiService.products.getById(slug).catch(missToNull);
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
      setProduct(null);
      setFailed(true);
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

  // ── The chapters' own data ──────────────────────────────────────────────
  // ONE ROUND TRIP, SIX INDEPENDENT FAILURES. Everything below the purchase
  // panel is fetched together once the product has resolved, and each promise
  // carries its own `catch`: a rituals endpoint that is down costs the page its
  // "Part of these rituals" list and leaves the eight other chapters intact.
  // `Promise.all` over already-settled promises therefore never rejects — it is
  // here to run the six in parallel, not to bind their fates together.
  const fetchChapterData = useCallback(async () => {
    if (!product) return;
    const cfg = STOREFRONT_CONFIG.aov;
    await Promise.all([
      // `fetchReviews` owns its own loading/error state — that is what feeds
      // the reviews chapter's Retry button.
      fetchReviews(),
      cfg.relatedProducts
        ? apiService.products
            .getRelated(product, cfg.maxRelated)
            .then(setRelatedProducts)
            .catch(() => setRelatedProducts([]))
        : Promise.resolve(),
      cfg.frequentlyBoughtTogether
        ? apiService.products
            .getFrequentlyBoughtTogether(product, cfg.maxBundle - 1)
            .then(setBundle)
            .catch(() => setBundle([]))
        : Promise.resolve(),
      apiService.rituals
        .getAll()
        .then((rows) => setRituals(Array.isArray(rows) ? rows : []))
        .catch(() => setRituals([])),
      // `siteContent.get` answers null rather than rejecting; the catch is the
      // belt to that braces.
      apiService.siteContent
        .get("about")
        .then(setAboutContent)
        .catch(() => setAboutContent(null)),
      apiService.siteContent
        .get("home")
        .then(setHomeContent)
        .catch(() => setHomeContent(null)),
    ]);
  }, [product, fetchReviews]);

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
    if (product) fetchChapterData();
  }, [product, fetchChapterData]);

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
    failed,
    retry: fetchProduct,
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
    // Chapter data
    rituals,
    aboutContent,
    homeContent,
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
  rituals,
  aboutContent,
  homeContent,
}) => {
  // The purchase panel's own CTA row: the anchor the sticky mobile bar watches,
  // which is what guarantees the bar can never cover the buttons it duplicates.
  const ctaRef = useRef(null);

  // ── What this product actually has to say ───────────────────────────────
  // Computed ONCE, and read by both the chapter index and the chapter markup,
  // so a chapter can never be listed in `ChapterNav` without being on the page
  // (or vice versa) — the failure mode of two hand-kept lists.
  const benefits = useMemo(
    () =>
      (Array.isArray(product.benefits) ? product.benefits : [])
        .map((row) => (typeof row === "string" ? row.trim() : ""))
        .filter(Boolean),
    [product.benefits]
  );

  const suitableFor = useMemo(
    () =>
      (Array.isArray(product.suitableFor) ? product.suitableFor : []).filter(Boolean),
    [product.suitableFor]
  );

  // The shelf life is a PACK FACT nobody has confirmed. The cartons print a
  // Mfg → Exp pair about 23 months apart, but "23 months" is an inference, so
  // `brand.productDefaults.shelfLife` is still `{{SHELF_LIFE}}` and the row
  // stays off the page until an owner supplies the real figure (PLACEHOLDERS.md).
  const shelfLife = brand.productDefaults.shelfLife;
  const goodToKnow = useMemo(
    () => [
      ...suitableFor,
      ...(shelfLife && !isPlaceholder(shelfLife) ? [`Shelf life ${shelfLife}`] : []),
    ],
    [suitableFor, shelfLife]
  );

  const ingredientsList =
    typeof product.ingredientsList === "string" ? product.ingredientsList.trim() : "";

  // The routines that name this product — derived, so an admin who adds a step
  // adds the link. Computed here rather than inside `HowToUse` because the
  // chapter index needs the answer before the chapter renders.
  const routines = useMemo(
    () => ritualsWithProduct(rituals, product.id),
    [rituals, product.id]
  );

  // The pool a compact `RitualCard` resolves its step thumbnails against.
  // `getRelated` already returns every other product in a catalogue this size
  // (its last pass sweeps the brand), so the page needs no ninth request to
  // draw a routine's strip; where a catalogue outgrows that, a step whose
  // product is missing keeps its numeral and shows an empty plate, which is
  // `RitualCard`'s own documented degradation.
  const ritualPool = useMemo(() => {
    const seen = new Set();
    return [product, ...relatedProducts, ...bundle].filter((row) => {
      if (!row || seen.has(String(row.id))) return false;
      seen.add(String(row.id));
      return true;
    });
  }, [product, relatedProducts, bundle]);

  const storyLines = useMemo(
    () => farmerStoryLines(aboutContent, homeContent),
    [aboutContent, homeContent]
  );

  const hasIngredients =
    (Array.isArray(product.keyIngredients) && product.keyIngredients.length > 0) ||
    (Array.isArray(product.packClaims) && product.packClaims.length > 0) ||
    Boolean(product.fragranceNote) ||
    Boolean(product.caution);
  const hasHowToUse =
    (Array.isArray(product.howToUse) && product.howToUse.length > 0) ||
    Boolean(product.ritualStep) ||
    routines.length > 0;
  // The value chain and the ownership qualifier are brand constants and always
  // render; the chapter is skipped only when there is no story copy to open it
  // with, which is what an unreachable `siteContent` looks like.
  const hasFarmerStory = storyLines.length > 0;
  const hasFullIngredients = Boolean(ingredientsList) || goodToKnow.length > 0;
  const hasCrossSell = bundle.length > 0 || relatedProducts.length > 0;

  // ── The chapter index ───────────────────────────────────────────────────
  // The order here IS document order — `ChapterNav` observes these sections and
  // the first one in the reading band wins, so the two lists must not disagree.
  const chapters = useMemo(
    () => [
      { id: "overview", label: "Overview" },
      ...(benefits.length > 0 ? [{ id: "benefits", label: "Benefits" }] : []),
      ...(hasIngredients ? [{ id: "ingredients", label: "Key ingredients" }] : []),
      ...(hasHowToUse ? [{ id: "how-to-use", label: "How to use" }] : []),
      ...(hasFarmerStory ? [{ id: "farmer-story", label: "The farmer story" }] : []),
      ...(hasFullIngredients
        ? [{ id: "full-ingredients", label: "Full ingredients" }]
        : []),
      ...(faqs.length > 0 ? [{ id: "faqs", label: "FAQs" }] : []),
      { id: "reviews", label: "Reviews" },
      ...(hasCrossSell
        ? [{ id: "complete-the-ritual", label: "Complete the ritual" }]
        : []),
    ],
    [
      benefits.length,
      hasIngredients,
      hasHowToUse,
      hasFarmerStory,
      hasFullIngredients,
      faqs.length,
      hasCrossSell,
    ]
  );

  const chapterIndex = (id) => chapters.findIndex((row) => row.id === id);

  const scrollToReviews = useCallback(() => {
    const section = document.getElementById("reviews");
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    section.focus({ preventScroll: true });
  }, []);

  // ONE ARRAY, TWO RENDERINGS: the visible trail, and the BreadcrumbList
  // published from these same rows — so the crumb a visitor reads and the crumb
  // a crawler is told about cannot drift apart.
  const trail = useMemo(
    () => [
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
    ],
    [category, product.shortName, product.name]
  );

  // ── The head — Admin → Products → SEO (Optional), through the shared hook
  const jsonLd = useMemo(
    () =>
      [
        breadcrumbJsonLd(trail),
        productJsonLd(product, {
          url: productPath(product),
          category: category?.displayName || category?.name,
          // The blended average the page itself prints, not the stored one.
          rating: displayAvg,
          ratingCount: totalRatingsCount,
        }),
      ].filter(Boolean),
    [trail, product, category, displayAvg, totalRatingsCount]
  );

  useSeo({
    title: productSeoTitle(product),
    description:
      product.metaDescription?.trim() || product.promise || product.shortDescription,
    image: stageSrc(product, { w: 1200, ar: "1:1" }),
    type: "product",
    jsonLd,
  });

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
          </Chapter>

          {/* ── Benefits ─────────────────────────────────────────────────
              The product's own `benefits[]`, and nothing else: a gold tick, the
              line as written, two columns where the column is wide enough. No
              adjective is added here — a benefits list is the easiest place on
              a skincare page to slip into medical language, so the only words
              on it are the ones an admin typed. */}
          {benefits.length > 0 && (
            <Chapter
              id="benefits"
              index={chapterIndex("benefits")}
              title="Benefits"
              className={styles.chapter}
            >
              <ul className={styles.benefits}>
                {benefits.map((line) => (
                  <li key={line} className={styles.benefit}>
                    <Icon
                      icon="mdi:check-circle-outline"
                      className={styles.benefitMark}
                      aria-hidden="true"
                    />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </Chapter>
          )}

          {/* ── Key ingredients + "As printed on the pack" ─────────────── */}
          {hasIngredients && (
            <Chapter
              id="ingredients"
              index={chapterIndex("ingredients")}
              title="Key ingredients"
              className={styles.chapter}
            >
              <IngredientChapter product={product} />
            </Chapter>
          )}

          {/* ── How to use, the ritual step, the routines ──────────────── */}
          {hasHowToUse && (
            <Chapter
              id="how-to-use"
              index={chapterIndex("how-to-use")}
              title="How to use"
              className={styles.chapter}
            >
              <HowToUse product={product} rituals={rituals} products={ritualPool} />
            </Chapter>
          )}

          {/* ── The farmer story ──────────────────────────────────────── */}
          {hasFarmerStory && (
            <Chapter
              id="farmer-story"
              index={chapterIndex("farmer-story")}
              title="The farmer story"
              className={styles.chapter}
            >
              <FarmerStory about={aboutContent} home={homeContent} />
            </Chapter>
          )}

          {/* ── Full ingredients ──────────────────────────────────────────
              The INCI list is the longest single string on the page and the one
              the fewest visitors read, so it goes behind a closed disclosure
              rather than into the flow. It is still ONE Tab away and still in
              the document for a find-in-page — a `<details>`-style accordion,
              not a fetch. */}
          {hasFullIngredients && (
            <Chapter
              id="full-ingredients"
              index={chapterIndex("full-ingredients")}
              title="Full ingredients"
              className={styles.chapter}
            >
              {ingredientsList ? (
                <Accordion
                  items={[
                    {
                      id: "pdp-inci",
                      title: INCI_DISCLOSURE_TITLE,
                      content: <p className={styles.inci}>{ingredientsList}</p>,
                    },
                  ]}
                  headingLevel="h3"
                  className={styles.disclosure}
                />
              ) : null}

              {goodToKnow.length > 0 && (
                <div className={styles.goodToKnow}>
                  <p className={`sf-eyebrow ${styles.goodToKnowLabel}`}>Good to know</p>
                  <ul className={styles.goodToKnowList}>
                    {goodToKnow.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Chapter>
          )}

          {/* ── FAQs ──────────────────────────────────────────────────────
              `useFaqs().forProduct` puts the product's own inline answers
              first, then the rows targeted at it, then the general product-page
              rows; `FAQ` is the one accordion every answered question on the
              storefront is read in, so the keyboard model, the deep links and
              the store-figure tokens all come with it. */}
          {faqs.length > 0 && (
            <Chapter
              id="faqs"
              index={chapterIndex("faqs")}
              title="FAQs"
              className={styles.chapter}
            >
              <FAQ faqs={faqs} headingLevel={3} />
            </Chapter>
          )}

          {/* ── Reviews ───────────────────────────────────────────────────
              Always a chapter, even at zero reviews: the empty state is the
              page saying where reviews come from, which is the honest answer on
              a range that has not shipped yet. `SocialProof` in the purchase
              panel scrolls here. */}
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

          {/* ── Complete the ritual ───────────────────────────────────────
              The chapter's own h2 carries the title, so the bundle renders its
              note and its plates without repeating it; the related rail drops
              to an h3 under the same heading. */}
          {hasCrossSell && (
            <Chapter
              id="complete-the-ritual"
              index={chapterIndex("complete-the-ritual")}
              title="Complete the ritual"
              className={styles.chapter}
            >
              <FrequentlyBoughtTogether
                anchor={product}
                companions={bundle}
                onAddToCart={addToCart}
                currency={product.currency}
                title={null}
              />

              <RelatedProducts
                title="You may also like"
                headingLevel="h3"
                products={relatedProducts}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isInWishlist={isInWishlist}
              />
            </Chapter>
          )}
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
/**
 * The read did not come back. Its own component, and therefore its own single
 * `useSeo`, for the same reason <NotFound/> is: exactly one of them is ever
 * mounted on this route, so nothing restores the <head> in the wrong order.
 * `noindex` because a page that could not load its product is not a page a
 * crawler should keep.
 */
const ProductLoadFailed = ({ onRetry }) => {
  useSeo({ title: "We couldn't load this product", noindex: true });
  return (
    <div className={styles.page}>
      <div className="sf-container">
        <ErrorState
          title="We couldn't load this product"
          text="Nothing was changed — the product is still there, it just didn't reach this page. Check your connection and try again."
          onRetry={onRetry}
          actions={
            <Button variant="secondary" to={ROUTES.SHOP}>
              Back to the range
            </Button>
          }
        />
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const data = useProductPage();

  if (data.loading) return <PageSkeleton />;
  // The failure comes FIRST: a read that never arrived must not be reported as
  // a product that does not exist.
  if (data.failed) return <ProductLoadFailed onRetry={data.retry} />;
  if (data.notFound || !data.product) return <NotFound />;

  return <ProductDetailsView {...data} />;
};

export default ProductDetails;
