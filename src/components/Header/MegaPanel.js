import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import apiService from "../../services/api";
import { categoryPath, concernPath, ritualPath } from "../../utils/categories";
import { firstProductForCategory, productsForCategory } from "../../utils/catalogue";
import { productPath } from "../../utils/helpers";
import { stageSrc, productAlt, primaryImage } from "../../utils/product";
import { ROUTES } from "../../utils/constants";
import { Button, Chip, GlassCard, Price } from "../ui";
import { sheet, t, DURATION } from "../../theme/motion";
import styles from "./MegaPanel.module.css";

// =============================================================================
// MegaPanel — the Shop menu, opened from the header's "Shop" trigger
// =============================================================================
//
// Three columns under one hairline: the seven CATEGORIES with a thumbnail of a
// real product from each, the eleven CONCERNS as chips, and one FEATURED
// product on a glow card. Everything is data — categories, concerns, products
// and rituals all come from the API the admin writes — so the panel changes
// when the catalogue does and never when this file does.
//
// WHERE IT LIVES IN THE DOM. Rendered INSIDE the Shop <li>, positioned against
// the sticky <header> (`top: 100%`, full width). That placement is the whole
// keyboard story: the panel's links follow their trigger in the tab order, so
// Tab walks categories -> concerns -> featured and Shift+Tab from the first
// link lands back on the Shop button with no JS holding the ring together. A
// sibling of the <ul> would have been visually identical and eight links away
// from the keyboard.
//
// THE DATA IS FETCHED ONCE PER PAGE LOAD. `loadMegaPanelData()` is a module-
// level promise, the same shape as SearchModal's `loadSearchData` — the panel
// opens and closes on every hover, and re-fetching four collections each time
// would be four round trips for a menu the visitor is skimming. A failed load
// clears the promise so the next open retries.
//
// TABLET (769-1024) NEVER RENDERS THIS. The header collapses into the hamburger
// there, so the panel has no trigger; Header.js gates it on a media query
// rather than this file hiding itself with CSS.
// =============================================================================

let megaDataCache = null;
let megaDataPromise = null;

/**
 * Categories, concerns, hero products and rituals, once.
 *
 * Every read is one of the four the storefront already has: none of them writes
 * and none of them is admin-only. `Promise.all` rather than four awaits because
 * they are independent, and the panel wants the whole grid or nothing — a
 * half-drawn menu reads as broken.
 */
export const loadMegaPanelData = () => {
  if (megaDataCache) return Promise.resolve(megaDataCache);
  if (!megaDataPromise) {
    megaDataPromise = Promise.all([
      apiService.categories.getAll(),
      apiService.concerns.getAll(),
      apiService.products.getHeroProducts(),
      apiService.rituals.getAll(),
    ])
      .then(([categories, concerns, products, rituals]) => {
        megaDataCache = {
          categories: Array.isArray(categories) ? categories : [],
          concerns: Array.isArray(concerns) ? concerns : [],
          products: Array.isArray(products) ? products : [],
          rituals: Array.isArray(rituals) ? rituals : [],
        };
        return megaDataCache;
      })
      .catch((err) => {
        megaDataPromise = null; // allow a retry on the next open
        throw err;
      });
  }
  return megaDataPromise;
};

const MegaPanel = ({ id = "mega-panel", onNavigate }) => {
  const reduce = useReducedMotion();
  const [data, setData] = useState(megaDataCache);
  const [failed, setFailed] = useState(false);

  // `sheet()` carries the shape (fade + a 16px rise) and reduced motion; the
  // durations are re-tiered to the panel's own budget — 320ms in, 160ms out.
  // Slower in than out is the house rule that makes a sheet feel PLACED.
  const motionProps = useMemo(() => {
    const base = sheet(reduce);
    return {
      ...base,
      animate: { ...base.animate, transition: t(reduce, DURATION.base) },
      exit: { ...base.exit, transition: t(reduce, DURATION.fast) },
    };
  }, [reduce]);

  useEffect(() => {
    let active = true;
    loadMegaPanelData()
      .then((loaded) => {
        if (active) setData(loaded);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const concerns = data?.concerns || [];
  const products = data?.products || [];
  const rituals = data?.rituals || [];

  // One pass over the hero-ordered catalogue per category: the first product
  // that belongs to it (which is the lowest heroOrder, since getHeroProducts
  // returns them in that order) and how many of them there are. The membership
  // rule itself lives in utils/catalogue.js — the mobile drawer's Shop
  // accordion (Prompt 10) draws the same row from the same helper. Keyed on
  // `data` itself — the `|| []` fallbacks above are fresh arrays on every
  // render, so they would defeat the memo they were the dependencies of.
  const rows = useMemo(() => {
    const cats = data?.categories || [];
    const catalogue = data?.products || [];
    return cats.map((cat) => ({
      cat,
      firstProduct: firstProductForCategory(catalogue, cat),
      count: productsForCategory(catalogue, cat).length,
    }));
  }, [data]);

  const featured = products[0] || null;
  const fallbackRitual = rituals[0] || null;

  // A load that failed leaves the trigger honest: the panel says where the
  // catalogue is rather than showing an empty grid.
  if (failed && !data) {
    return (
      <motion.div
        id={id}
        role="region"
        aria-label="Shop menu"
        className={`${styles.panel} sf-glass--strong`}
        {...motionProps}
      >
        <div className={styles.scroll}>
          <div className={`sf-container ${styles.inner} ${styles.innerEmpty}`}>
            <p className={styles.empty}>
              The catalogue could not be loaded just now.
            </p>
            <Button
              variant="secondary"
              size="sm"
              to={ROUTES.SHOP}
              onClick={onNavigate}
            >
              Go to the shop
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      id={id}
      role="region"
      aria-label="Shop menu"
      className={`${styles.panel} sf-glass--strong`}
      {...motionProps}
    >
      {/* The SHEET is `.panel` and the SCROLL BOX is this div, never the other
          way round: the panel paints its own near-black ground with an
          absolutely-positioned `::before`, and inside a scroll container that
          pseudo-element is anchored to the scroll origin and only as tall as
          the visible box — so a scrolled menu used to slide its own ground out
          from under the featured card. See MegaPanel.module.css. */}
      <div className={styles.scroll}>
        <div className={`sf-container ${styles.inner}`}>
          {/* ---- Column 1 — categories ---------------------------------- */}
          <div className={styles.column}>
            <p className={`sf-eyebrow ${styles.eyebrow}`}>Categories</p>
            <ul className={styles.categoryList}>
              {rows.map(({ cat, firstProduct, count }) => {
                const thumb = firstProduct ? stageSrc(firstProduct, { w: 96 }) : "";
                return (
                  <li key={cat.id}>
                    <Link
                      to={categoryPath(cat)}
                      className={styles.categoryRow}
                      onClick={onNavigate}
                    >
                      <span className={`sf-plate ${styles.thumb}`} aria-hidden="true">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            width="40"
                            height="40"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : null}
                      </span>
                      <span className={styles.categoryText}>
                        <span className={styles.categoryName}>
                          {cat.displayName || cat.name}
                        </span>
                        {cat.description ? (
                          <span className={styles.categoryDesc}>{cat.description}</span>
                        ) : null}
                      </span>
                      {count > 0 ? (
                        <span className={styles.countChip} aria-hidden="true">
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  to={ROUTES.SHOP}
                  className={`${styles.categoryRow} ${styles.allRow}`}
                  onClick={onNavigate}
                >
                  {/* The empty thumbnail cell keeps this label on the same x as
                      the seven names above it. */}
                  <span aria-hidden="true" />
                  <span className={styles.categoryText}>
                    <span className={styles.categoryName}>All products</span>
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* ---- Column 2 — concerns -------------------------------------- */}
          <div className={styles.column}>
            <p className={`sf-eyebrow ${styles.eyebrow}`}>Shop by concern</p>
            <ul className={styles.concernList}>
              {concerns.map((concern) => (
                <li key={concern.id ?? concern.slug}>
                  <Chip
                    variant="concern"
                    as={Link}
                    to={concernPath(concern.slug)}
                    tone={concern.slug}
                    onClick={onNavigate}
                    className={styles.concernChip}
                  >
                    {concern.name}
                  </Chip>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Column 3 — featured -------------------------------------- */}
          <div className={styles.column}>
            <p className={`sf-eyebrow ${styles.eyebrow}`}>Featured</p>
            {featured ? (
              <GlassCard
                glow="duo"
                interactive
                padding="md"
                className={styles.featured}
              >
                <span className={`sf-plate ${styles.featuredPlate}`}>
                  {/* `stageSrc`'s default 1:1, which is the shape the plate
                      keeps. 600 CSS px of art for a plate that tops out at
                      252 is the retina allowance, not a bigger picture. */}
                  <img
                    src={stageSrc(featured, { w: 600 })}
                    alt={productAlt(featured, primaryImage(featured))}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <p className={`sf-eyebrow ${styles.featuredEyebrow}`}>
                  Black Rice Ritual · 01
                </p>
                <p className={styles.featuredName}>{featured.name}</p>
                {featured.promise ? (
                  <p className={styles.featuredPromise}>{featured.promise}</p>
                ) : null}
                <Price product={featured} size="sm" className={styles.featuredPrice} />
                <Button
                  variant="primary"
                  size="sm"
                  to={productPath(featured)}
                  onClick={onNavigate}
                  className={styles.featuredCta}
                >
                  Explore
                </Button>
              </GlassCard>
            ) : fallbackRitual ? (
              /* No hero product to feature — the first ritual takes the card, so
                 the column is never an empty box. */
              <GlassCard
                glow="duo"
                interactive
                padding="md"
                className={styles.featured}
              >
                <p className={`sf-eyebrow ${styles.featuredEyebrow}`}>Ritual</p>
                <p className={styles.featuredName}>{fallbackRitual.name}</p>
                {fallbackRitual.tagline ? (
                  <p className={styles.featuredPromise}>{fallbackRitual.tagline}</p>
                ) : null}
                <Button
                  variant="primary"
                  size="sm"
                  to={ritualPath(fallbackRitual)}
                  onClick={onNavigate}
                  className={styles.featuredCta}
                >
                  Build your ritual
                </Button>
              </GlassCard>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MegaPanel;
