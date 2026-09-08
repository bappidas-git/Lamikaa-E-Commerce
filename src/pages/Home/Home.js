import React, { Suspense, lazy, useRef } from "react";
import brand from "../../config/brand";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import useInView from "../../hooks/useInView";
import useSeo, { organizationJsonLd, websiteJsonLd } from "../../hooks/useSeo";
import { Skeleton } from "../../components/ui";
import HeroCarousel from "../../components/home/HeroCarousel";
import TrustStrip from "../../components/TrustStrip";
import useHomeData from "../../components/home/useHomeData";
import styles from "./Home.module.css";

// =============================================================================
// HOME — eleven sections, one data load, two things above the fold
// =============================================================================
//
// Prompts 14–21 each built one band of this page and mounted it at the bottom
// of whatever was already here, alongside the six pre-rebuild sections that
// were still standing. Prompt 22 is the assembly: the old sections are gone,
// the new ones are in the brief's order, and the page finally reads as one
// document rather than as eight prompts' worth of output.
//
//   1  HERO             the product carousel, the page's only h1        (14)
//   2  TRUST STRIP      four promises, on the hero's bottom edge        (15)
//   3  THE RANGE        one editorial chapter per product               (16)
//   4  SHOP BY CATEGORY seven ways in + the concern chips               (15)
//   5  ABOUT LAMIKAA    the farmer-owned story + the value chain        (17)
//   6  WHY BLACK RICE   the ingredient spotlight                        (18)
//   7  RITUALS          three routines, in the designed order           (18)
//   8  FULL-PAGE CTA    the page stops for one screen and asks          (19)
//   9  WHY LAMIKAA      the philosophy, four pillars, the triptych      (20)
//   10 RECENTLY VIEWED  the one kept secondary section  [conditional]   (22)
//   11 GOOD TO KNOW     up to eight admin-managed answers               (21)
//
// SHOP-BY-CATEGORY MOVED. Prompt 15 mounted it directly under the trust strip;
// the brief (§7.2 item 4) places it AFTER the product chapters, and that is
// where it is now. The page leads with the products themselves and offers the
// directory once the visitor has seen what is in it.
//
// WHAT WAS DELETED, and why none of it is a lost feature:
//   • The collection-stories band that opened the old page — three categories
//     told as stories, which is what section 4 now does for all seven, with
//     real counts.
//   • The featured grid and the trending rail — merchandising flags shown twice
//     over; the eight chapters ARE the range, in the owner's own order.
//   • The offers rail and its countdown — the deals page is still there and
//     still linked (`/special-offers`, and the "Offers" nav item when the admin
//     has it switched on). The home page no longer duplicates it.
//   • The full-bleed craft interlude — copy about the previous catalogue.
//   • The closing promises row — the trust strip states the same promises from
//     the same config, at the top, where they are read.
//   • The two orphaned components of the old page, deleted outright: they had
//     no consumer left anywhere in `src`. (Named in PROGRESS.md row 22.)
// "Recently viewed" is the ONE secondary section kept, because it is existing
// storefront functionality rather than a section (see RecentlyViewed.js).
//
// ONE DATA LOAD. `useHomeData()` is called here, once, and the sections take
// their slices as props. Assembled naively this page issued fifteen requests
// for six collections; it now issues six, in parallel, from the first effect.
//
// EVERYTHING BELOW THE TRUST STRIP IS DEFERRED — a lazy chunk mounted by
// <DeferredSection> when it comes within 600px of the viewport. The landing
// route therefore ships the hero and the strip and nothing else, and each band
// arrives (already painted) as the visitor scrolls toward it.
// =============================================================================

// ── The nine deferred chunks ─────────────────────────────────────────────────
// Each is its own bundle. The eager pair above — HeroCarousel and TrustStrip —
// are the only two the first paint needs, and lazy-loading them would delay the
// LCP element to buy nothing.

const ProductShowcase = lazy(() => import("../../components/home/ProductShowcase"));
const ShopByCategory = lazy(() => import("../../components/home/ShopByCategory"));
const AboutTeaser = lazy(() => import("../../components/home/AboutTeaser"));
const WhyBlackRice = lazy(() => import("../../components/home/WhyBlackRice"));
const RitualsTeaser = lazy(() => import("../../components/home/RitualsTeaser"));
const FullPageCta = lazy(() => import("../../components/home/FullPageCta"));
const WhyLamikaaSection = lazy(() => import("../../components/home/WhyLamikaaSection"));
const RecentlyViewed = lazy(() => import("../../components/home/RecentlyViewed"));
const HomeFaqs = lazy(() => import("../../components/home/HomeFaqs"));

/** How far ahead of the viewport a section is mounted. */
const ROOT_MARGIN = "600px";

// ── DeferredSection ──────────────────────────────────────────────────────────

/**
 * Hold a section's space, then fill it just before it is reached.
 *
 * The `reserve` height is the whole point: an unreserved placeholder collapses
 * to nothing and every section below it jumps when the chunk lands, which is a
 * layout shift on the one page the site is judged on. Reserving it means the
 * correction — the difference between the estimate and the real height —
 * happens 600px ABOVE the viewport, where nobody can see it.
 *
 * `contained` adds `content-visibility: auto`, which lets the browser skip
 * rendering a section that has scrolled far away. It is OFF for the three
 * sections that draw a glow (about, spotlight, CTA): `content-visibility`
 * applies paint containment at all times, and `.sf-glow::before` deliberately
 * bleeds past its host box (`inset: -12% -8%` under a 60px blur), so those
 * three would have their glow clipped to a hard edge. Skipping the rendering
 * of three sections is not worth cutting the page's atmosphere in half.
 *
 * THE TWO WAITING STATES ARE NOT THE SAME, and giving them the same one cost
 * 20 seconds of Speed Index in the first Lighthouse run of this page:
 *
 *   not near yet   An EMPTY reserved box. By construction it is at least 600px
 *                  outside the viewport, so it is never seen — and `.sf-skeleton`
 *                  is `animation: … infinite` over a 200%-wide gradient, so nine
 *                  of them (one 3200px tall) meant nine perpetual shimmers the
 *                  visitor could not look at, repainting for the life of the page.
 *   near, still    A real <Skeleton>. This one CAN be seen — the chunk is
 *   downloading    fetching while the visitor scrolls toward it — and it is one
 *                  section at a time, on screen, which is what a skeleton is for.
 *
 * Both hold the identical reserved height, so neither transition shifts the page.
 *
 * THE RESERVE VALUES ARE MEASURED, not guessed: each is the section's own
 * rendered height at 390px, read off the built page (the narrowest common phone
 * is also where every section is tallest, so the estimate is never short on a
 * wider screen). "Recently viewed" is reserved at its height WHEN PRESENT; for
 * the majority of visitors it renders nothing, and the collapse to zero happens
 * 600px above the viewport like every other correction.
 *
 * @param {object} props
 * @param {string} props.reserve     the height to hold, e.g. "1200px"
 * @param {boolean} [props.contained]  skip rendering when far off-screen
 */
const DeferredSection = ({ reserve, contained = true, children }) => {
  const ref = useRef(null);
  const near = useInView(ref, { once: true, amount: 0, rootMargin: ROOT_MARGIN });

  // THE RESERVATION IS DROPPED THE MOMENT THE SECTION MOUNTS. Holding it for
  // the life of the page would make `reserve` a floor on the section's height,
  // and the first measurement of this page found exactly that: three bands
  // padded out to their estimate with dead space, and — worse — a 420px blank
  // gap where RecentlyViewed had correctly rendered nothing, which is the
  // NORMAL case for a first-time visitor. After mounting, a section's own
  // height is the only thing that should decide the space it takes, including
  // when that height is zero.
  const className = [
    styles.deferred,
    contained ? styles.contained : "",
    near ? "" : styles.reserving,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={className} style={{ "--sf-reserve": reserve }}>
      {near ? (
        <Suspense
          fallback={
            <Skeleton variant="block" height={reserve} className={styles.placeholder} />
          }
        >
          {children}
        </Suspense>
      ) : null}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════════════════════════

const Home = () => {
  const {
    products,
    heroProducts,
    categories,
    concerns,
    rituals,
    homeContent,
    impactContent,
  } = useHomeData();

  // The live social map, so `sameAs` publishes the profiles the owner has
  // actually filled in rather than the brand config's unresolved tokens.
  const { social } = useStoreSettings();

  // The home page keeps the site-wide title and description — a "Home ·
  // LAMIKAA NATURALS" tab says nothing the wordmark has not — and carries the
  // two site-level graphs. Product/FAQPage/Breadcrumb graphs belong to the
  // pages that own those things (Prompts 27, 28).
  useSeo({
    title: "",
    description: brand.seo.defaultDescription,
    image: brand.seo.ogImage,
    jsonLd: [organizationJsonLd({ social }), websiteJsonLd()],
  });

  return (
    // No page-level fade here: the route transition is applied once, to the
    // keyed wrapper around <Routes> in App.js, so every storefront route
    // arrives the same way.
    <div className={styles.page}>
      {/* ── 1. HERO ─────────────────────────────────────────────────────────
          It escapes nothing: neither .main-content nor .page sets a max-width,
          so the section spans the viewport and the page ground shows straight
          through it. It owns the page's single <h1> and renders
          #hero-sentinel, which is what keeps the masthead transparent over the
          opening band. Above the fold, so it never reveals and never defers. */}
      <section className={styles.hero}>
        <HeroCarousel heroProducts={heroProducts} />
      </section>

      {/* ── 2. TRUST STRIP ──────────────────────────────────────────────────
          The hero's bottom EDGE, not a section of its own: on a desktop the
          strip is pulled up 28px so it overlaps the hero's ground and reads as
          the band the spread closes on. On a phone it simply stacks — 28px of
          overlap on a 48px band would eat the promises. Rendered here rather
          than inside HeroCarousel because the carousel also draws the
          brand-slide fallback, and the promises belong to the page whichever
          slide the hero settled on. */}
      <div className={styles.trustEdge}>
        <TrustStrip />
      </div>

      {/* ── 3. THE RANGE — one editorial chapter per product ──────────────── */}
      <DeferredSection reserve="11600px">
        <ProductShowcase heroProducts={heroProducts} products={products} />
      </DeferredSection>

      {/* ── 4. SHOP BY CATEGORY / CONCERN — the seven ways in ─────────────── */}
      <DeferredSection reserve="980px">
        <ShopByCategory
          categories={categories}
          concerns={concerns}
          products={heroProducts}
          rituals={rituals}
        />
      </DeferredSection>

      {/* ── 5. ABOUT LAMIKAA — who owns this, and where the value goes ────── */}
      <DeferredSection reserve="1880px" contained={false}>
        <AboutTeaser content={homeContent?.aboutTeaser} />
      </DeferredSection>

      {/* ── 6. WHY BLACK RICE — the one ingredient, and the eight that carry it */}
      <DeferredSection reserve="960px" contained={false}>
        <WhyBlackRice content={homeContent?.whyBlackRice} products={heroProducts} />
      </DeferredSection>

      {/* ── 7. RITUALS — the order the range was designed to be used in ───── */}
      <DeferredSection reserve="850px">
        <RitualsTeaser rituals={rituals} products={products} />
      </DeferredSection>

      {/* ── 8. FULL-PAGE CTA — the page stops, and asks ───────────────────────
          The page's SECOND and last breathing glow (the hero owns the first).
          Everything above it — eight product chapters, the seven cards, the
          About band, the spotlight, the routines — is what guarantees the two
          can never share a viewport, whatever the screen height. */}
      <DeferredSection reserve="1160px" contained={false}>
        <FullPageCta content={homeContent?.fullPageCta} />
      </DeferredSection>

      {/* ── 9. WHY LAMIKAA — the four pillars, and what the business is for ──
          Both halves are shared with the Why LAMIKAA page (Prompt 28), which
          mounts the same two components. */}
      <DeferredSection reserve="2400px">
        <WhyLamikaaSection content={impactContent} />
      </DeferredSection>

      {/* ── 10. RECENTLY VIEWED — the one kept secondary section ──────────────
          Renders nothing until the catalogue lands, and nothing at all unless
          the stored list reconciles to two or more live products — which is why
          it reserves a footnote's height rather than a band's. */}
      <DeferredSection reserve="830px">
        <RecentlyViewed products={products} />
      </DeferredSection>

      {/* ── 11. GOOD TO KNOW — the answers, before they have to be looked for ─
          The admin-managed `faqs` collection (placement "home", up to eight
          rows) through FaqContext, in the shared accordion. It publishes no
          FAQPage JSON-LD: /faq owns that (Prompt 28). */}
      <DeferredSection reserve="1010px">
        <HomeFaqs />
      </DeferredSection>
    </div>
  );
};

export default Home;
