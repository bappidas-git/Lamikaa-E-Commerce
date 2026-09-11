import React from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { concernPath } from "../../utils/categories";
import { onImageError } from "../../utils/helpers";
import { Chip, GlassCard } from "../ui";
import styles from "./CategoryHead.module.css";

// =============================================================================
// CategoryHead — how a category page opens
// =============================================================================
//
// `/category/<slug>` is `/shop` constrained by its URL: the same chapters, the
// same index, the same closing panel. What makes it a PLACE rather than a
// filtered list is this head — a full-bleed band carrying the category's own
// photograph with a glass panel resting on its lower-left corner, holding the
// trail, the name, the description, the count and the concerns the products in
// this category actually answer to.
//
// THE PANEL OVERLAPS ONLY WHERE THERE IS ROOM. From 769px it sits INSIDE the
// band's bottom edge (`margin-top: -Npx`), which is the composition the brief
// asks for. On a phone the band is 2:1 and the panel is BELOW it, full width:
// an overlapping glass panel on a 360px screen either covers the photograph it
// is meant to sit on or squeezes the h1 to four words a line. Two layouts, one
// component, and no absolute positioning in either — the overlap is a negative
// margin, so the band cannot crop the panel when the description runs long.
//
// THE IMAGE IS A PLACEHOLDER AND SAYS SO. Category photography does not exist
// yet (PLACEHOLDER_ASSETS.md), so `heroImage` is a stock stand-in and wears
// `.sf-placeholder-media` — desaturated, darkened, under a bottom-weighted
// wash. It is decorative (`alt=""`): the category's name is the <h1> two lines
// below it. The panel over it takes `scrim` as well, because 8% white at 20px
// blur is a filter on whatever is behind it and nobody has chosen what that is
// yet: a bright Picsum seed under warm-white type is a contrast failure waiting
// for a reseed, and the scrim is the inner --sf-color-bg wash that prevents it.
//
// EVERY WORD IS THE CATEGORY'S OWN except the eyebrow. The name, the display
// name and the description come from the record the admin edits; the count is
// counted; the concerns are read off the products. "Category" is the only
// string typed here.
//
// Props:
//   category   object    the category record (required)
//   trail      array     the `{label, to}` crumbs — the page owns it, because
//                        the same array is published as BreadcrumbList
//   countLabel string    "6 products", already pluralised by the caller
//   concerns   array     `{slug, name}` rows for the chips; [] hides the row
//   titleId    string    the <h1>'s id — the page owns it because the chapter
//                        index's "Back to top" target is the page's heading
// =============================================================================

const CategoryHead = ({
  category,
  trail = [],
  countLabel = "",
  concerns = [],
  titleId,
  className = "",
}) => {
  if (!category) return null;

  const name = category.displayName || category.name || "";
  const image = category.heroImage || category.image || "";

  return (
    <header className={[styles.head, className].filter(Boolean).join(" ")}>
      <div className={`sf-placeholder-media ${styles.band}`}>
        {image ? (
          <img
            className={styles.image}
            src={image}
            alt=""
            /* The first thing on the page, above the fold at every width — the
               one image on this route that must not wait for a lazy pass. */
            loading="eager"
            decoding="async"
            onError={onImageError}
          />
        ) : null}
      </div>

      <div className={`sf-container ${styles.panelWrap}`}>
        <GlassCard strong scrim padding="lg" className={styles.panel}>
          <Breadcrumb items={trail} className={styles.crumbs} />

          <p className={`sf-eyebrow sf-eyebrow--rule ${styles.eyebrow}`}>Category</p>

          <h1 id={titleId} className={styles.title}>
            {name}
          </h1>

          {category.description ? (
            <p className={styles.description}>{category.description}</p>
          ) : null}

          {countLabel ? <p className={styles.count}>{countLabel}</p> : null}

          {concerns.length > 0 && (
            <>
              <p className="sf-visually-hidden" id="category-concerns-label">
                Concerns answered in this category
              </p>
              {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
              <ul
                className={styles.concerns}
                role="list"
                aria-labelledby="category-concerns-label"
              >
                {concerns.map((concern) => (
                  <li key={concern.slug}>
                    <Chip
                      variant="concern"
                      as={Link}
                      to={concernPath(concern.slug)}
                      tone={concern.slug}
                    >
                      {concern.name}
                    </Chip>
                  </li>
                ))}
              </ul>
            </>
          )}
        </GlassCard>
      </div>
    </header>
  );
};

export default CategoryHead;
