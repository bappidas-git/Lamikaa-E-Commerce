import React from "react";
import { Link } from "react-router-dom";
import styles from "./Breadcrumb.module.css";

// =============================================================================
// Breadcrumb — where this page sits, in one line
// =============================================================================
//
// ONE ARRAY, TWO RENDERINGS. The trail this draws is the same `{ label, to }`
// array `utils/seo.js` publishes as a `BreadcrumbList`, so the crumb a visitor
// reads and the crumb a crawler is told about cannot drift apart:
//
//   const trail = [
//     { label: "Home", to: ROUTES.HOME },
//     { label: "Shop", to: ROUTES.SHOP },
//     { label: category.displayName },      // the page itself — no `to`
//   ];
//   <Breadcrumb items={trail} />
//   useSeo({ jsonLd: [breadcrumbJsonLd(trail), …] })
//
// HOME IS AN ITEM, NOT A CONSTANT. The old version hard-coded the first crumb
// and took only the tail, which meant the structured-data half had to retype it
// — exactly the drift this component now exists to prevent.
//
// THE LAST CRUMB IS NOT A LINK. It is the page you are already on: it carries
// `aria-current="page"` and no href, so a keyboard visitor is never offered a
// stop that goes nowhere, and it drops any `to` a caller passes by mistake.
//
// It is an ordered list because a trail is ordered, and the separators are
// pseudo-elements — a "/" between two crumbs is punctuation drawn by the
// stylesheet, not a character a screen reader should read out.
// =============================================================================

const Breadcrumb = ({ items = [], className = "" }) => {
  const trail = (Array.isArray(items) ? items : []).filter(
    (item) => item && typeof item.label === "string" && item.label.trim() !== ""
  );
  if (trail.length === 0) return null;

  return (
    <nav
      className={[styles.breadcrumb, className].filter(Boolean).join(" ")}
      aria-label="Breadcrumb"
    >
      <ol className={styles.list}>
        {trail.map((item, index) => {
          const last = index === trail.length - 1;
          return (
            <li className={styles.item} key={`${item.label}-${index}`}>
              {item.to && !last ? (
                <Link to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current={last ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
