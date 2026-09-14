import React from "react";
import brand from "../../config/brand";
import { cld } from "../../utils/cloudinary";
import styles from "./Logo.module.css";

// =============================================================================
// Logo — the LAMIKAA lockup, everywhere it appears
// =============================================================================
// One component owns the brand artwork: the masthead, the mobile drawer, the
// footer, the auth modal, the admin shell and the admin login all render this.
// The URLs live in src/config/brand.js and are inlined nowhere else in src/ —
// changing the wordmark is one edit there.
//
//   variant="wordmark"  the full lockup (default). Height is derived from
//                       brand.logoAspect, so the box is reserved before the
//                       image lands and nothing shifts (CLS).
//   variant="mark"      the square icon, for tight slots and avatars.
//
// BOTH VARIANTS ARE DELIVERED TRIMMED. The two master files carry a wide
// transparent bleed (see the note above LOGO_URL in src/config/brand.js), and
// an untrimmed <img> reserves a box a third of which is empty — which is not a
// cosmetic quibble in a 56px phone masthead, it is the difference between a
// lockup that fills its slot and one that floats in it. The mark is squared up
// after the trim (`ar: "1:1"` on a TRANSPARENT ground, never `b_auto`, which
// would paint an opaque plate behind gold line art): its ink is 1024x1126,
// taller than it is wide, and every slot that takes it — the admin's collapsed
// drawer, the masthead under 340px — paints it into a square box.
//
// `width` is the CSS width the slot actually paints; the file is requested at
// 2x that for retina, which is the smallest request that still looks sharp on
// the screens this catalogue is browsed on. `loading="eager"` because every
// current placement is above the fold in its own surface — a wordmark that
// fades in late reads as a broken page, not as a saved byte.
//
// The module's own rules are wrapped in :where() so they carry ZERO
// specificity: a consumer that already sizes its logo slot (the masthead's
// 44px, the footer's 48px) keeps winning with a plain class, in either source
// order. Defaults, not opinions.
// =============================================================================

const Logo = ({
  variant = "wordmark",
  width = 168,
  className = "",
  alt,
  style,
  ...rest
}) => {
  const isMark = variant === "mark";
  const source = isMark ? brand.iconUrl : brand.logoUrl;

  const w = Math.max(1, Math.round(Number(width) || 0) || 168);
  const h = isMark ? w : Math.round(w / brand.logoAspect);

  const delivery = isMark
    ? { trim: true, ar: "1:1", pad: true, background: "transparent" }
    : { trim: true };

  return (
    <img
      className={className ? `${styles.logo} ${className}` : styles.logo}
      src={cld(source, { ...delivery, w: Math.ceil(w * 2) })}
      alt={alt ?? brand.name}
      width={w}
      height={h}
      loading="eager"
      decoding="async"
      style={style}
      {...rest}
    />
  );
};

export default Logo;
