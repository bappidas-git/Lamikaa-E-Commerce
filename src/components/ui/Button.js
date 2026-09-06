import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import styles from "./Button.module.css";

// =============================================================================
// Button — every control the storefront clicks, in one component
// =============================================================================
//
// The LOOK comes from `.sf-btn*` in theme/storefront-primitives.css and is not
// duplicated here: pill radius, 44px minimum, Manrope 600 in sentence case, a
// one-pixel lift on hover, a press that settles back at 92% opacity, and the
// champagne focus ring. This module owns only what a class cannot: the element
// choice, the three add-to-cart states and the icon-only circle.
//
// VARIANTS map onto the primitives rather than restating them —
//   primary    -> .sf-btn--emerald   the gold fill (legacy class name, Prompt 35)
//   secondary  -> .sf-btn--outline-gold
//   ghost      -> .sf-btn--ghost
//   addToCart  -> .sf-btn--outline-gold + a signature-gradient hairline on hover
//   icon       -> a 44px glass circle
//
// THE ELEMENT. A button that navigates is a link, and a link that acts is a
// button — getting this wrong costs a keyboard visitor middle-click, "open in
// new tab" and the correct screen-reader role. Pass `to` for an in-app route
// (react-router <Link>), `href` for an external one, neither for an action.
// `as` overrides when a caller knows better.
//
// DISABLED. <button> takes the real attribute; a link cannot be disabled at all,
// so it drops its href and carries `aria-disabled` — which is exactly what the
// primitive's `[aria-disabled="true"]` rule styles.
//
// ADD TO CART is three states in one live region, so a screen reader hears the
// outcome of a press it cannot see: "Adding…", then "Added". `aria-live` sits
// on the label rather than on a second hidden node, because a hidden mirror of
// a visible label is a second thing to keep in step.
// =============================================================================

const VARIANT_CLASS = {
  primary: "sf-btn--emerald",
  secondary: "sf-btn--outline-gold",
  ghost: "sf-btn--ghost",
  addToCart: "sf-btn--outline-gold",
  icon: "",
};

const SIZE_CLASS = { sm: "sf-btn--sm", md: "", lg: "sf-btn--lg" };

/** An Iconify id renders as an icon; a node renders as itself. */
const renderIcon = (icon) =>
  typeof icon === "string" ? <Icon icon={icon} aria-hidden="true" /> : icon;

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    as,
    to,
    href,
    type,
    loading = false,
    success = false,
    disabled = false,
    icon,
    iconPosition = "left",
    block = false,
    srLabel,
    className = "",
    children,
    onClick,
    ...rest
  },
  ref
) {
  const isIconOnly = variant === "icon";
  const isAddToCart = variant === "addToCart";
  const inactive = disabled || loading;

  const Component = as || (to ? Link : href ? "a" : "button");
  const isNativeButton = Component === "button";

  const classes = [
    "sf-btn",
    VARIANT_CLASS[variant] ?? VARIANT_CLASS.primary,
    SIZE_CLASS[size] ?? "",
    block ? "sf-btn--block" : "",
    isIconOnly ? styles.icon : "",
    isIconOnly && size === "sm" ? styles.iconSm : "",
    isIconOnly && size === "lg" ? styles.iconLg : "",
    isAddToCart ? styles.addToCart : "",
    isAddToCart && success ? styles.success : "",
    loading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // The label an add-to-cart button is showing right now. The other variants
  // keep their children exactly as given — a button that rewrites its own copy
  // while you are reading it is a bug everywhere else.
  const label = isAddToCart
    ? loading
      ? "Adding…"
      : success
      ? "Added"
      : children
    : children;

  const iconNode = isAddToCart && success ? renderIcon("mdi:check") : renderIcon(icon);

  const content = isIconOnly ? (
    <>
      {renderIcon(icon) || children}
      {srLabel ? <span className="sf-visually-hidden">{srLabel}</span> : null}
    </>
  ) : (
    <>
      {iconNode && iconPosition === "left" ? iconNode : null}
      <span className={isAddToCart ? styles.state : undefined} {...(isAddToCart ? { "aria-live": "polite" } : {})}>
        {label}
      </span>
      {iconNode && iconPosition === "right" ? iconNode : null}
    </>
  );

  const shared = {
    ref,
    className: classes,
    onClick: inactive ? undefined : onClick,
    "aria-busy": loading || undefined,
    ...rest,
  };

  if (isNativeButton) {
    return (
      <button {...shared} type={type || "button"} disabled={inactive}>
        {content}
      </button>
    );
  }

  return (
    <Component
      {...shared}
      {...(Component === Link ? { to: inactive ? "#" : to } : { href: inactive ? undefined : href || to })}
      aria-disabled={inactive || undefined}
      tabIndex={inactive ? -1 : rest.tabIndex}
    >
      {content}
    </Component>
  );
});

export default Button;
