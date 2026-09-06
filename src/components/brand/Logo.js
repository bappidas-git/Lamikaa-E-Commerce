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

  return (
    <img
      className={className ? `${styles.logo} ${className}` : styles.logo}
      src={cld(source, { w: Math.ceil(w * 2) })}
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
