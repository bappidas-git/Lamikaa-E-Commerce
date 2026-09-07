import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "../../hooks/useCart";
import { buildCartItem, productPath } from "../../utils/helpers";
import { normalizeProduct, primaryImage, productAlt } from "../../utils/product";
import { DURATION, reveal, tween } from "../../theme/motion";
import { Button, Chip, CloudinaryImage, GlassCard, GlowWrap, Price } from "../ui";
import styles from "./ProductChapter.module.css";

// =============================================================================
// ProductChapter — one product, one full editorial spread
// =============================================================================
//
// The home page's showcase and (Prompt 23) the shop listing are the same eight
// chapters: a label card on one side and, on the other, everything the range
// promises about that product — its place in the ritual, its name, its promise,
// its description, what is in it, the owner's three badges, the price and the
// two ways forward. One component, because a chapter that reads differently on
// the shop page than on the home page is two chapters to keep in step.
//
// THE MEDIA IS STICKY, THE WORDS SCROLL PAST IT (desktop only). The section is
// at least 80svh tall and the media column is `align-self: start` +
// `position: sticky`, so the pack stays in view for as long as its own words
// do — scrollytelling inside one chapter rather than across the page. On a
// phone there is one column, the pack comes FIRST, and nothing sticks: a
// sticky image on a 390px screen is an image that never leaves.
//
// ALTERNATING SIDES. `flip` swaps the two columns with `grid-column`, never with
// `flex-direction: row-reverse` or `order` on the mobile stack — the DOM order
// is media → words at every width, so the reading order a screen reader or a
// keyboard walks is the same one the phone paints.
//
// THE GLASS PANEL LOSES ITS BLUR AT <= 768px. Eight chapters is eight blurred
// panels in one scroll; DESIGN_SYSTEM §4 allows two blurred layers in view, and
// a phone pays for every one of them. Below the breakpoint the panel paints the
// opaque glass fallback instead — identical to read, far cheaper to composite.
//
// EVERY WORD IS THE PRODUCT'S OWN. Name, promise, description, ingredients,
// badges, fragrance note and price all come from the record (PRODUCTS.md §5,
// seeded in db.json). The only strings this file types are the two CTA labels,
// the "Key ingredients" eyebrow, and the two withheld-action labels the rest of
// the storefront already uses ("Coming soon" for `priceTBA`, "Out of stock" for
// `stock === 0`) — the same pair, spelled the same way, as ProductCard.
//
// Props:
//   product  object   the catalogue row (required)
//   index    number   0-based position — the chapter numeral and the glow tone
//   total    number   how many chapters there are, for "Chapter 3 of 8"
//   variant  "home" | "shop"   "shop" drops the 80svh floor (Prompt 23 adds the
//                              index-rail hooks on top of `data-chapter`)
//   flip     boolean  put the words on the left and the pack on the right
//   id       string   the section's own id — `product-<slug>` on the home page
// =============================================================================

// At most five, and the seeded products carry four or five. A sixth chip would
// wrap the row onto a third line and turn a glance into a list.
const MAX_INGREDIENTS = 5;

// The pack fades in more slowly than the words arrive — half a beat behind, so
// the eye lands on the label and then reads. DESIGN_SYSTEM's slow duration is
// the panel's; the plate takes half as long again.
const MEDIA_FADE = DURATION.slow * 1.5;

// The plate's real layout widths: ~44vw of a 1440 desktop, ~92vw of a phone.
const PLATE_WIDTHS = [480, 768, 1080];
const PLATE_SIZES = "(max-width: 768px) 92vw, 44vw";

/** "07" — the chapter's own numeral, independent of the ritual step's. */
export const chapterNumeral = (index) => String(Number(index) + 1).padStart(2, "0");

/**
 * The eyebrow over the chapter name: the product's place in its ritual.
 *
 * "01 — Cleanse" for the face, "Body 01 — Body cleanse" for the body: the soap
 * and the body wash are both step one of a DIFFERENT routine, and an unqualified
 * "01 — Body cleanse" standing beside the face wash's "01 — Cleanse" reads as a
 * contradiction rather than as a second sequence. The qualifier is derived from
 * the step's own label, so a ritual the owner adds later needs no code change.
 */
export const stepEyebrow = (product) => {
  const step = product?.ritualStep;
  if (!step?.label) return "";
  const order = Number(step.order);
  if (!Number.isFinite(order) || order <= 0) return step.label;
  const scope = /^body\b/i.test(step.label) ? "Body " : "";
  return `${scope}${String(order).padStart(2, "0")} — ${step.label}`;
};

const ProductChapter = ({
  product,
  index = 0,
  total = 0,
  variant = "home",
  flip = false,
  id,
  className = "",
}) => {
  const reduceMotion = useReducedMotion();
  const { addToCart } = useCart();

  // A brief "Added" confirmation; the Button variant owns the label swap and
  // the live region, this only holds the flag. Same gesture as ProductCard's.
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);
  useEffect(() => () => clearTimeout(addedTimer.current), []);

  // Read every product through the one normaliser, so a chapter renders the
  // same whether it was handed a hero row, a category row or a search hit.
  const p = useMemo(() => (product ? normalizeProduct(product) : null), [product]);

  if (!p) return null;

  const media = primaryImage(p);
  const headingId = `${id || `chapter-${p.slug || p.id || index}`}-title`;
  const numeral = chapterNumeral(index);
  const eyebrow = stepEyebrow(p);
  const ingredients = (p.keyIngredients || []).slice(0, MAX_INGREDIENTS);
  const badges = Array.isArray(p.badges) ? p.badges : [];

  const outOfStock = p.stock === 0;
  const comingSoon = p.priceTBA === true;
  const unavailable = outOfStock || comingSoon;
  const actionLabel = comingSoon
    ? "Coming soon"
    : outOfStock
    ? "Out of stock"
    : "Add to Cart";

  const handleAdd = () => {
    // buildCartItem throws PRICE_TBA rather than enqueue a ₹0 line; the button
    // is disabled before it can, and this guard is the second lock on that.
    if (unavailable) return;
    addToCart(buildCartItem(p), 1);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1400);
  };

  // Under reduced motion both factories return nothing at all, so the chapter
  // renders at its finished state on the first frame with no motion attached.
  const mediaMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true, amount: 0.1 },
        transition: tween(MEDIA_FADE),
      };

  return (
    <section
      id={id}
      data-chapter={index}
      aria-labelledby={headingId}
      className={[
        "sf-section",
        styles.chapter,
        flip ? styles.flip : "",
        variant === "shop" ? styles.shop : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="sf-container">
        <div className={styles.grid}>
          {/* ---- The pack ------------------------------------------------- */}
          <motion.div className={styles.media} {...mediaMotion}>
            <GlowWrap
              tone={index % 2 ? "violet" : "pink"}
              intensity={0.2}
              className={styles.glow}
            >
              <CloudinaryImage
                src={media?.url}
                alt={productAlt(p, media)}
                crop={media?.crop}
                ar="4:5"
                pad
                plate
                fit="contain"
                aspectRatio="4 / 5"
                widths={PLATE_WIDTHS}
                sizes={PLATE_SIZES}
                className={styles.plate}
              />
            </GlowWrap>
          </motion.div>

          {/* ---- The words ------------------------------------------------ */}
          <motion.div
            className={styles.text}
            {...reveal(reduceMotion, { inView: true, amount: 0.1 })}
          >
            <GlassCard padding="lg" className={styles.panel}>
              <div className={styles.numeralRow}>
                <Chip variant="step" className={styles.numeralChip} aria-hidden="true">
                  {numeral}
                </Chip>
                {/* The numeral is decoration; this line is what is announced,
                    and it opens with the chapter's position so the count is
                    heard once rather than guessed from eight repeated "01"s. */}
                <p className={`sf-eyebrow ${styles.eyebrow}`}>
                  {total > 0 && (
                    <span className="sf-visually-hidden">
                      {`Chapter ${index + 1} of ${total}. `}
                    </span>
                  )}
                  {eyebrow}
                </p>
              </div>

              <h2 id={headingId} className={styles.name}>
                {p.name}
              </h2>

              {p.promise ? <p className={styles.promise}>{p.promise}</p> : null}

              {p.description ? (
                <p className={styles.description}>{p.description}</p>
              ) : null}

              {ingredients.length > 0 && (
                <div className={styles.block}>
                  <p className={`sf-eyebrow ${styles.blockLabel}`}>Key ingredients</p>
                  {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
                  <ul className={styles.chipRow} role="list">
                    {ingredients.map((ingredient) => (
                      <li key={ingredient.name}>
                        <Chip variant="glass">{ingredient.name}</Chip>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {badges.length > 0 && (
                // eslint-disable-next-line jsx-a11y/no-redundant-roles
                <ul className={`${styles.chipRow} ${styles.badges}`} role="list">
                  {badges.map((badge) => (
                    <li key={badge}>
                      <Chip variant="trust">{badge}</Chip>
                    </li>
                  ))}
                </ul>
              )}

              {p.fragranceNote ? (
                <p className={styles.fragrance}>{p.fragranceNote}</p>
              ) : null}

              <Price
                product={p}
                size="lg"
                live={false}
                className={styles.price}
              />

              <div className={styles.actions}>
                <Button
                  variant="secondary"
                  to={productPath(p)}
                  className={styles.cta}
                  // Eight chapters mean eight "Explore more" links; the name is
                  // what tells them apart in a link list.
                  aria-label={`Explore more about ${p.name}`}
                >
                  Explore more
                </Button>
                {/* No aria-label here on purpose: the addToCart variant's own
                    label IS its live region ("Adding…" -> "Added"), and an
                    aria-label would freeze the accessible name at the label it
                    was given. The chapter's <section> supplies the context. */}
                <Button
                  variant="addToCart"
                  className={styles.cta}
                  disabled={unavailable}
                  success={added}
                  onClick={handleAdd}
                >
                  {actionLabel}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProductChapter;
