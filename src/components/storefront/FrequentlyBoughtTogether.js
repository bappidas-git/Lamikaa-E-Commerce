import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Price } from "../ui";
import { isPriceKnown } from "../../utils/product";
import {
  getProductMinPrice,
  buildCartItem,
  productPath,
  formatCurrency,
  truncateText,
  PLACEHOLDER_IMG,
  onImageError,
} from "../../utils/helpers";
import styles from "./FrequentlyBoughtTogether.module.css";

// =============================================================================
// FrequentlyBoughtTogether — "Complete the ritual"
// =============================================================================
// Shows the current product plus REAL companion products (passed by the caller,
// resolved from the merchant's own curated `frequentlyBoughtTogetherIds`). The
// shopper ticks what they want; the combined total is computed from real prices
// — never a fabricated "bundle discount". If there are no real companions, the
// module renders nothing.
//
// STRUCTURAL HONESTY
//   The heading is "Complete the ritual", not "Frequently bought together". The
//   list is a CURATION the merchant set by hand — the next steps of the LAMIKAA
//   routine for this product — and it is not a co-purchase statistic. This
//   surface must never phrase it as one.
//
// A COMPANION WITH NO PRICE CANNOT BE BOUGHT, AND SAYS SO. Five of the eight
// products ship before their MRP is set, so a bundle whose companion is one of
// them would otherwise quietly add ₹0 to the cart and to the total. Such a row
// is rendered UNTICKED and DISABLED, wearing the same "Price on launch" chip
// the rest of the storefront uses, and the total is the sum of the ticked rows
// only. The same rule applies to the anchor: on a `priceTBA` product page this
// block still lists the routine, and the button reads how many of it can
// actually be bought.
//
// EDITORIAL SET
//   A rule of plates runs left — the product you are looking at, then each
//   companion, divided by thin plus marks — and the checklist sits beneath them
//   as a ruled ledger: ticks, real prices, a live total over a hairline, then
//   the button.
//
// Props:
//   anchor       object  the product being viewed (always listed first)
//   companions   array   real companion products (selectable)
//   onAddToCart  fn      (cartItem) => void — called once per selected item
//   currency     string
//   title        string  the heading; `null` where the caller's own section
//                        heading already carries it (the PDP chapter does)
//   note         string  the line under it
// =============================================================================

export const FBT_TITLE = "Complete the ritual";
export const FBT_EYEBROW = "Curated pairing";
export const FBT_NOTE = "The next steps of the routine, chosen for this product.";

const FrequentlyBoughtTogether = ({
  anchor,
  companions = [],
  onAddToCart,
  currency,
  title = FBT_TITLE,
  note = FBT_NOTE,
  className = "",
}) => {
  const items = useMemo(
    () => (Array.isArray(companions) ? companions.filter(Boolean) : []),
    [companions]
  );

  // Companions start selected (the anchor is always listed). Keyed by product
  // id. We store only explicit toggles and treat "unset" as selected, so
  // companions that arrive AFTER first render (async load) still default to
  // checked without needing a sync effect.
  const [selected, setSelected] = useState({});

  if (!anchor || items.length === 0) return null;

  // A row can only be ticked if there is a price to charge for it.
  const isOn = (product) => isPriceKnown(product) && selected[product.id] !== false;
  const toggle = (id) => setSelected((s) => ({ ...s, [id]: s[id] === false }));

  const chosen = [
    ...(isPriceKnown(anchor) ? [anchor] : []),
    ...items.filter(isOn),
  ];
  const total = chosen.reduce((sum, p) => sum + getProductMinPrice(p).sellingPrice, 0);

  const handleAddAll = () => {
    chosen.forEach((p) => onAddToCart?.(buildCartItem(p)));
  };

  // The plate, then a caption under it — the anchor says where you are, the
  // companions name themselves.
  //
  // ONE NAME PER TILE (Prompt 38). The image and the caption sit inside the
  // SAME link, so an `alt` carrying the product name made the link read its
  // name twice — WCAG H2's case, and axe's `image-redundant-alt`. The picture
  // is therefore decorative (`alt=""`, the caption is the label) and the link
  // states its own name once, in full: the caption is truncated at 26
  // characters for the layout and the anchor's caption says "This item" rather
  // than naming the product at all, so neither can be trusted to name the link.
  const renderTile = (p, locked) => (
    <Link
      to={productPath(p)}
      className={styles.tile}
      key={p.id}
      aria-label={locked ? `${p.name} (this item)` : p.name}
    >
      <span className={`sf-plate ${styles.plate}`}>
        <img
          src={p.images?.[0] || p.image || PLACEHOLDER_IMG}
          alt=""
          loading="lazy"
          decoding="async"
          onError={onImageError}
        />
      </span>
      <span className={locked ? styles.thisItem : styles.tileName}>
        {locked ? "This item" : truncateText(p.name, 26)}
      </span>
    </Link>
  );

  // One checklist row. The anchor's is locked (you are on its page); a
  // companion with no price is locked for the opposite reason.
  const renderCheck = (p, locked) => {
    const known = isPriceKnown(p);
    const checked = locked ? known : isOn(p);
    return (
      <li className={styles.check} key={p.id}>
        <label className={[styles.checkLabel, known ? "" : styles.unpriced]
          .filter(Boolean)
          .join(" ")}
        >
          <input
            type="checkbox"
            checked={checked}
            disabled={locked || !known}
            readOnly={locked}
            onChange={locked || !known ? undefined : () => toggle(p.id)}
          />
          <span className={styles.checkText}>
            <span className={styles.checkName}>
              {truncateText(p.name, 40)}
              {locked ? <em> (this item)</em> : null}
            </span>
            <Price product={p} size="sm" live={false} className={styles.checkPrice} />
          </span>
        </label>
      </li>
    );
  };

  return (
    // THE LABEL FOLLOWS THE HEADING, AND SO DOES THE LANDMARK (Prompt 38).
    // A <section> is only a `region` landmark once it has an accessible name,
    // so falling back to FBT_TITLE when the caller passed `title={null}` named
    // this region "Complete the ritual" INSIDE the PDP chapter of that exact
    // name — two regions, one name, which axe reports as `landmark-unique` and
    // a screen-reader user hears as the same section twice. Where the caller
    // heads the block itself, this one drops out of the landmark map entirely
    // (undefined, not the fallback) and the chapter's own heading is the only
    // name; where it heads itself, the name is its own <h2>.
    <section
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-label={title || undefined}
    >
      {(title || note) && (
        <header className={styles.head}>
          {title ? (
            <>
              <span className={styles.eyebrow}>{FBT_EYEBROW}</span>
              <h2 className={styles.title}>{title}</h2>
            </>
          ) : null}
          {note ? <p className={styles.note}>{note}</p> : null}
        </header>
      )}

      <div className={styles.layout}>
        <div className={styles.visual}>
          {renderTile(anchor, true)}
          {/* The mark travels with the tile it adds, so a row that wraps never
              ends on a dangling "+". */}
          {items.map((p) => (
            <span className={styles.pair} key={p.id}>
              <span className={styles.plus} aria-hidden="true">
                +
              </span>
              {renderTile(p, false)}
            </span>
          ))}
        </div>

        <div className={styles.summary}>
          <ul className={styles.checklist}>
            {renderCheck(anchor, true)}
            {items.map((p) => renderCheck(p, false))}
          </ul>

          {/* No ticked rows, no total. "₹0.00" for a routine whose products
              are all still unpriced is a price claim, and the wrong one. */}
          {chosen.length > 0 && (
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>
                Total ({chosen.length} item{chosen.length !== 1 ? "s" : ""})
              </span>
              <span className={styles.totalValue}>
                {formatCurrency(total, currency)}
              </span>
            </div>
          )}
          <Button
            variant="primary"
            block
            onClick={handleAddAll}
            disabled={chosen.length === 0}
            className={styles.addBtn}
          >
            {chosen.length === 0
              ? "Nothing to add yet"
              : `Add ${chosen.length} to Cart`}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FrequentlyBoughtTogether;
