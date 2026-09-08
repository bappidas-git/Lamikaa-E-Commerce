import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "../../hooks/useCart";
import { reveal } from "../../theme/motion";
import { buildCartItem, onImageError, productPath } from "../../utils/helpers";
import { primaryImage, productAlt, stageSrc } from "../../utils/product";
import { Button, Chip, Price } from "../ui";
import styles from "./RitualStep.module.css";

// =============================================================================
// RitualStep — one step of a routine, as a row
// =============================================================================
//
// A ritual page is an ORDERED LIST of these, so each one is an <li> inside the
// page's <ol>: the order is in the markup, not only in the numerals. The row
// carries the numeral, the product's own label plate, its name, its promise,
// the step's note and frequency, the price and one add-to-cart — everything a
// shopper needs to do this step without leaving the routine to find it.
//
// THE CONNECTOR IS DRAWN FROM THE NUMERAL COLUMN, at both widths: a one-pixel
// signature-gradient hairline running from under each numeral to the top of the
// next one, so the four numerals read as one thread rather than four badges.
// The last step draws none (`data-last`) — a thread that continues past the end
// of the routine promises a step that is not there. It is a pseudo-element and
// says nothing to assistive tech; the <ol> already carries the sequence.
//
// THE ALTERNATIVE IS A CHOICE, NOT A SECOND PRODUCT. The body ritual's first
// step is the goat milk soap OR the body wash — the same job done two ways — so
// the step renders a two-option segmented control (a real `radiogroup`, with
// roving tabindex and arrow keys) that swaps the plate, the name, the promise,
// the price and the add action together. Both labels come from the CATALOGUE
// (`shortName`, falling back to the full name): the admin can pair any two
// products, and a component that typed "Bar / Wash" would be describing today's
// seed rather than the data.
//
// THE CHOICE CAN BE LIFTED. Pass `selectedProductId` + `onSelect` and the page
// owns it — which is exactly what the ritual's CTA panel needs, because "add
// the whole ritual" must add the product the visitor actually chose. Pass
// neither and the row keeps the choice itself, so the component stands alone.
//
// PRICE DISCIPLINE, the same as everywhere else: five of the eight products
// have no MRP yet. Their add button is disabled and reads "Coming soon"; the
// price surface renders its own "Price on launch" chip; and `buildCartItem`
// throws rather than enqueue a ₹0 line, which is the second lock on the first.
// =============================================================================

/**
 * "01" — the same padded numeral the chapters and the card strip use.
 *
 * A step's own `order` wins, and only a POSITIVE one: `Number(null)` is 0, which
 * is finite, so a looser test prints "00" for a step whose order never landed
 * instead of falling back to the row it is being rendered in.
 */
export const stepNumeral = (order, index = 0) => {
  const value = Number(order);
  const resolved = Number.isFinite(value) && value > 0 ? value : index + 1;
  return String(resolved).padStart(2, "0");
};

/**
 * What the add button says. Never "Add to Cart" for something that cannot be
 * bought — the label is the honest half of the disabled state.
 */
export const stepActionLabel = (product) => {
  if (!product) return "Coming soon";
  if (product.priceTBA === true) return "Coming soon";
  if (product.stock === 0) return "Out of stock";
  return "Add to Cart";
};

/** The short label a choice button shows — the catalogue's word, never ours. */
export const choiceLabel = (product) =>
  (product?.shortName || product?.name || "").trim();

const RitualStep = ({
  step,
  index = 0,
  total = 0,
  selectedProductId,
  onSelect,
  as: Component = "li",
  className = "",
}) => {
  const reduceMotion = useReducedMotion();
  const { addToCart } = useCart();

  // The two products this step can be done with, in the admin's order. A step
  // with no alternative has one, and the control below never renders.
  const choices = [step?.product, step?.alternativeProduct].filter(Boolean);
  const fallbackId = choices[0] ? String(choices[0].id) : "";

  const [ownChoice, setOwnChoice] = useState(fallbackId);
  const controlled = selectedProductId != null;
  const chosenId = controlled ? String(selectedProductId) : ownChoice;

  const product =
    choices.find((candidate) => String(candidate.id) === chosenId) || choices[0] || null;

  const choose = useCallback(
    (id) => {
      if (!controlled) setOwnChoice(String(id));
      if (typeof onSelect === "function") onSelect(String(id));
    },
    [controlled, onSelect]
  );

  // Roving tabindex: one stop for the whole group, arrows move (and select)
  // inside it — the radiogroup pattern, so the choice costs a keyboard visitor
  // one Tab rather than one per option.
  const radioRefs = useRef([]);
  const handleKeyDown = (event) => {
    const last = choices.length - 1;
    const current = choices.findIndex((c) => String(c.id) === chosenId);
    let next = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = current >= last ? 0 : current + 1;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = current <= 0 ? last : current - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next == null) return;
    event.preventDefault();
    choose(choices[next].id);
    radioRefs.current[next]?.focus();
  };

  // A brief "Added" confirmation. The Button variant owns the label swap and
  // the live region; this only holds the flag (the same gesture as a chapter's).
  const [added, setAdded] = useState(false);
  const addedTimer = useRef(null);
  useEffect(() => () => clearTimeout(addedTimer.current), []);

  if (!step) return null;

  const numeral = stepNumeral(step.order, index);
  const to = product ? productPath(product) : "";
  const unavailable = !product || product.priceTBA === true || product.stock === 0;
  const actionLabel = stepActionLabel(product);

  const handleAdd = () => {
    if (unavailable || !product) return;
    addToCart(buildCartItem(product), 1);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1400);
  };

  // The thread's two ends are marked with DATA ATTRIBUTES rather than with
  // `:first-child` / `:last-child`, so a page that wraps a row in anything at
  // all still gets a thread that starts and stops in the right place.
  const MotionComponent = motion[Component] || motion.li;

  return (
    <MotionComponent
      className={[styles.step, className].filter(Boolean).join(" ")}
      data-first={index === 0 ? "" : undefined}
      data-last={total > 0 && index === total - 1 ? "" : undefined}
      {...reveal(reduceMotion, { index, inView: true, amount: 0.2 })}
    >
      {/* ---- The numeral, and the thread between numerals ----------------- */}
      <div className={styles.numeralCol}>
        <Chip variant="step" className={styles.numeral} aria-hidden="true">
          {numeral}
        </Chip>
      </div>

      {/* ---- The label plate ---------------------------------------------
          The plate is a link and the name is a link: two stops, one
          destination — the contract every product surface in the storefront
          already follows. The image carries the real alt text, so the plate's
          link takes its accessible name from it rather than repeating it. */}
      <div className={styles.plateCol}>
        {product ? (
          <Link to={to} className={`sf-plate ${styles.plate}`}>
            <img
              src={stageSrc(product, { w: 480 })}
              alt={productAlt(product, primaryImage(product))}
              loading="lazy"
              decoding="async"
              onError={onImageError}
            />
          </Link>
        ) : (
          /* An empty shelf is honest, a borrowed one is not: a step whose
             product has left the catalogue keeps its place and its note. */
          <span className={`sf-plate ${styles.plate}`} aria-hidden="true" />
        )}
      </div>

      {/* ---- The words ---------------------------------------------------- */}
      <div className={styles.body}>
        <p className={styles.name}>
          {product ? (
            <Link to={to} className={styles.nameLink}>
              {product.name}
            </Link>
          ) : (
            <span className={styles.nameLink}>This step is being restocked</span>
          )}
        </p>

        {product?.promise ? <p className={styles.promise}>{product.promise}</p> : null}

        {step.note ? <p className={styles.note}>{step.note}</p> : null}

        {choices.length > 1 && (
          <div
            className={styles.choice}
            role="radiogroup"
            aria-label={`Choose the product for step ${index + 1}`}
            onKeyDown={handleKeyDown}
          >
            {choices.map((candidate, position) => {
              const checked = String(candidate.id) === chosenId;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  aria-label={candidate.name}
                  tabIndex={checked ? 0 : -1}
                  ref={(node) => {
                    radioRefs.current[position] = node;
                  }}
                  className={`${styles.choiceOption} ${checked ? styles.choiceOn : ""}`.trim()}
                  onClick={() => choose(candidate.id)}
                >
                  {choiceLabel(candidate)}
                </button>
              );
            })}
          </div>
        )}

        {step.frequency ? (
          <Chip variant="glass" className={styles.frequency}>
            {step.frequency}
          </Chip>
        ) : null}
      </div>

      {/* ---- The price and the one action --------------------------------- */}
      <div className={styles.buy}>
        <Price product={product} size="md" live={false} className={styles.price} />
        <Button
          variant="addToCart"
          size="sm"
          className={styles.add}
          disabled={unavailable}
          success={added}
          onClick={handleAdd}
        >
          {actionLabel}
        </Button>
      </div>
    </MotionComponent>
  );
};

export default RitualStep;
