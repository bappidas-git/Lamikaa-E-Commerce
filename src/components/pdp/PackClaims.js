import React from "react";
import brand from "../../config/brand";
import { isPlaceholder } from "../../utils/placeholders";
import { Chip, ContentBlocks } from "../ui";
import styles from "./PackClaims.module.css";

// =============================================================================
// PackClaims — "As printed on the pack"
// =============================================================================
//
// THE ONE BLOCK ON THE STOREFRONT THAT QUOTES RATHER THAN CLAIMS. Every LAMIKAA
// carton prints a line of antioxidant copy ("Enriched with Anti-Ageing
// Antioxidants") and four certification roundels (ISO / GMP / Non-GMO /
// Cruelty-Free). The owner has not yet supplied the certificates behind the
// roundels, and nobody has substantiated the antioxidant line as a benefit —
// so BRAND.md §3.9 rule 3 keeps both off every surface that speaks in the
// brand's own voice: no card badge, no chapter heading, no meta description.
//
// They still belong on the product page, because a shopper holding the box can
// read them. This eyebrow is the frame that makes that honest: everything under
// "As printed on the pack" is presented as a quotation of the packaging, which
// is a verifiable fact, instead of as a promise the shop is making.
//
// The claims list is therefore set QUIET — 14px, muted, no ticks, no gold, no
// card — while the badges are `Chip variant="trust"`, the same pill the three
// owner-mandated badges wear, because a certification mark IS a trust mark once
// it is attributed. A badge left as an unresolved token never renders.
//
// THE CAUTION IS THE PACK'S TOO, and it is the only part of the block that
// raises its voice: it goes in the `ContentBlocks` callout — the same glass
// aside the content pages use — under the heading "Caution", with a gold
// hairline down its leading edge. Rendering it THROUGH ContentBlocks rather
// than restating the callout's markup is deliberate: there is exactly one
// callout recipe in the design system and this is not a second copy of it.
//
// Props:
//   product   the product record — `packClaims[]`, `fragranceNote`, `caution`
//   badges    the roundels, defaulting to brand.packBadges
// =============================================================================

/** The eyebrow, the callout heading — the two strings this block owns. */
export const PACK_EYEBROW = "As printed on the pack";
export const CAUTION_TITLE = "Caution";

const lines = (value) =>
  (Array.isArray(value) ? value : [])
    .map((row) => (typeof row === "string" ? row.trim() : ""))
    .filter(Boolean);

/**
 * The roundels that may be shown: a badge is printed on the carton, so it is
 * quotable — unless it is still an unresolved `{{TOKEN}}`, which is a badge
 * nobody has named yet.
 *
 * Exported for the unit test: it is the gate the whole block turns on.
 */
export const packBadgesToShow = (badges) =>
  lines(badges).filter((badge) => !isPlaceholder(badge));

/**
 * The caution, as markdown-lite the callout parser understands.
 *
 * Returns "" for a product with no caution, which is how the callout is skipped
 * — a heading with nothing under it is worse than no heading.
 */
export const cautionMarkup = (caution) => {
  const text = typeof caution === "string" ? caution.trim() : "";
  if (!text) return "";
  return `::callout ${CAUTION_TITLE}\n${text}\n::`;
};

const PackClaims = ({ product, badges = brand.packBadges, className = "" }) => {
  const claims = lines(product?.packClaims);
  const marks = packBadgesToShow(badges);
  const fragrance =
    typeof product?.fragranceNote === "string" ? product.fragranceNote.trim() : "";
  const caution = cautionMarkup(product?.caution);

  if (!claims.length && !marks.length && !fragrance && !caution) return null;

  return (
    <div className={[styles.block, className].filter(Boolean).join(" ")}>
      <p className={`sf-eyebrow ${styles.eyebrow}`}>{PACK_EYEBROW}</p>

      {claims.length > 0 && (
        <ul className={styles.claims}>
          {claims.map((claim) => (
            <li key={claim} className={styles.claim}>
              {claim}
            </li>
          ))}
        </ul>
      )}

      {fragrance ? <p className={styles.fragrance}>{fragrance}</p> : null}

      {marks.length > 0 && (
        <ul className={styles.badges}>
          {marks.map((badge) => (
            <li key={badge}>
              <Chip variant="trust">{badge}</Chip>
            </li>
          ))}
        </ul>
      )}

      {caution ? (
        <ContentBlocks text={caution} variant="prose" className={styles.caution} />
      ) : null}
    </div>
  );
};

export default PackClaims;
