import React from "react";
import { GlassCard } from "../ui";
import PackClaims from "./PackClaims";
import styles from "./IngredientChapter.module.css";

// =============================================================================
// IngredientChapter — "Key ingredients", then what the carton says
// =============================================================================
//
// Two halves, and the order between them is the argument. First the botanicals
// the formulation is BUILT from, each on its own card with the one sentence the
// seed records about it; then, ruled off underneath, the "As printed on the
// pack" block — the antioxidant line, the roundels and the caution, quoted
// rather than claimed (see `PackClaims`).
//
// BLACK RICE COMES FIRST, WHEREVER IT WAS AUTHORED. It is the one ingredient
// every product in the range is built around (BRAND.md §3.2), so it opens the
// row and wears a gold hairline while the others take the plain card. That is
// the whole emphasis: no badge, no bigger card, no second colour — a reader
// scanning the row sees which one the range is named after and moves on.
//
// EVERY WORD IS THE PRODUCT'S OWN. The names and the benefit lines come from
// `keyIngredients[]` in the catalogue, which an admin edits; this file types no
// ingredient, no benefit and no adjective. A product with no key ingredients
// renders the pack block alone rather than an empty row.
//
// Props:
//   product   the product record — `keyIngredients[]` and the pack fields
// =============================================================================

/**
 * The one ingredient the range is named after.
 *
 * A lower-case needle matched against the ingredient's own name, so "Black
 * Rice", "Black Rice Extract" and "black rice bran oil" all resolve to the
 * hero card without the seed having to spell it a particular way.
 */
const HERO_INGREDIENT = "black rice";

/** Is this the hero ingredient? Exported for the unit test. */
export const isHeroIngredient = (name) =>
  typeof name === "string" && name.toLowerCase().includes(HERO_INGREDIENT);

/**
 * The row, hero first.
 *
 * A STABLE partition rather than a sort: the authored order survives inside
 * each group, so an admin who reorders the list still gets their order — with
 * black rice lifted out of it. Rows with no name are dropped; a card that says
 * nothing is a hole in the row.
 *
 * Exported for the unit test.
 */
export const orderedIngredients = (list) => {
  const rows = (Array.isArray(list) ? list : []).filter(
    (row) => row && typeof row.name === "string" && row.name.trim() !== ""
  );
  return [
    ...rows.filter((row) => isHeroIngredient(row.name)),
    ...rows.filter((row) => !isHeroIngredient(row.name)),
  ];
};

const IngredientChapter = ({ product, className = "" }) => {
  const ingredients = orderedIngredients(product?.keyIngredients);

  return (
    <div className={[styles.chapter, className].filter(Boolean).join(" ")}>
      {ingredients.length > 0 && (
        <ul className={styles.grid}>
          {ingredients.map((row) => {
            const hero = isHeroIngredient(row.name);
            return (
              <li key={row.name}>
                <GlassCard
                  padding="md"
                  className={[styles.card, hero ? styles.hero : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className={styles.name}>{row.name}</span>
                  {row.benefit ? (
                    <span className={styles.benefit}>{row.benefit}</span>
                  ) : null}
                </GlassCard>
              </li>
            );
          })}
        </ul>
      )}

      <PackClaims product={product} />
    </div>
  );
};

export default IngredientChapter;
