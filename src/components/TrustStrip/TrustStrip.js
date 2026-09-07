import React from "react";
import { Icon } from "@iconify/react";
import brand from "../../config/brand";
import styles from "./TrustStrip.module.css";

// =============================================================================
// TrustStrip — the four promises, on the hero's bottom edge
// =============================================================================
//
// A slim glass band the home page hangs off the foot of the hero (Home.js pulls
// it up 28px on a desktop so it overlaps the hero's ground; on a phone it
// simply stacks). Four short reassurances, gold glyph then label, centred —
// nothing here is a sentence, a metric or a claim about demand.
//
// WHERE THE WORDS COME FROM. The first three are the owner-mandated badges in
// `brand.trustBadges` (BRAND.md §3.9 rule 4) and the fourth is `originBadge`,
// the brand's provenance line from BRAND.md §3.1. All four are read from the
// brand config, never typed here, so the owner can adjust the wording for
// compliance in one file — the same three words also print on every product
// card, on the hero chips and in the PDP's trust badges.
//
// The ICONS are this component's own: an icon is presentation, not copy, so it
// is matched to the label by POSITION and falls back to a neutral mark if the
// owner adds a fifth promise. Iconify is already a dependency (the header, the
// footer and the mega panel all draw from it) — no new package.
//
// MOBILE. Four items cannot share a 360px line, and wrapping them into a 2x2
// block would turn the hero's edge into a paragraph. So the strip becomes a
// horizontal snap scroller with edge fades: still one band, still 48px tall,
// and every promise reachable by swipe or by arrow keys on the focused track.
//
// GLASS BUDGET (DESIGN_SYSTEM §4). The band drops its backdrop blur entirely at
// <= 768px: a blurred surface that also scrolls is the one combination that
// janks on a phone, and the fallback ground reads identically.
// =============================================================================

// Matched to the labels by position. `mdi:*` ids only — the set the rest of the
// storefront draws from.
const ICONS = [
  "mdi:sprout-outline",
  "mdi:leaf",
  "mdi:star-four-points-outline",
  "mdi:map-marker-outline",
];

const FALLBACK_ICON = "mdi:check-decagram-outline";

/**
 * The four promises, from the brand config. Exported for the unit test and for
 * any later surface that wants the same list without the band around it.
 */
export const trustPromises = () =>
  [...(brand.trustBadges || []), brand.originBadge]
    .filter((label) => typeof label === "string" && label.trim() !== "")
    .map((label, index) => ({
      id: label,
      label,
      icon: ICONS[index] || FALLBACK_ICON,
    }));

const TrustStrip = ({ items, className = "" }) => {
  const list = items && items.length ? items : trustPromises();
  if (list.length === 0) return null;

  return (
    // The accessible name belongs on the <ul>, not on the wrapper: `aria-label`
    // on a plain <div> with no role is ignored by most assistive tech, and the
    // strip would announce as an unnamed list of four stray phrases.
    <div className={`sf-glass ${styles.strip} ${className}`.trim()}>
      {/* Focusable for the same reason Home's rails are: below 640px the list
          is an overflow region, and a region a pointer can scroll has to be
          reachable by a keyboard too (WCAG 2.1.1). It is a NAMED list, so the
          stop announces "Our promises, list, 4 items" rather than nothing. */}
      <ul className={styles.list} aria-label="Our promises" tabIndex={0}>
        {list.map((item) => (
          <li key={item.id} className={styles.item}>
            <Icon icon={item.icon} className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrustStrip;
