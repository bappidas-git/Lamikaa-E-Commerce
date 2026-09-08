// =============================================================================
// UI PRIMITIVES  —  the layer every LAMIKAA feature composes on
// =============================================================================
//
// Fifteen components, one import:
//
//   import { Button, SectionHeading, Price } from "../../components/ui";
//
// Everything here is styled by CSS Modules over the `--sf-*` tokens and the
// global `.sf-*` primitives in theme/storefront-primitives.css — never by a
// hard-coded colour, radius, shadow or duration, and never by copying a shared
// rule (a glass card wears `.sf-glass`, it does not restate it).
//
// The rules these encode, so no feature has to re-decide them:
//   • every interactive element is at least 44px and shows --sf-shadow-focus
//   • every dialog traps focus, restores it, closes on Escape and on navigation
//   • no autoplaying sound, ever
//   • no raw-HTML injection anywhere — markup is never a thing this layer
//     can produce, which is what the zero-result grep in Prompt 05 checks for
//   • motion comes from theme/motion.js factories and stops under
//     `prefers-reduced-motion`
// =============================================================================

export { default as Accordion } from "./Accordion";
export { default as Button } from "./Button";
export { default as Chip } from "./Chip";
export { default as CloudinaryImage } from "./CloudinaryImage";
export { default as ContentBlocks } from "./ContentBlocks";
export { default as Drawer } from "./Drawer";
export { default as EmptyState } from "./EmptyState";
export { default as ErrorState } from "./ErrorState";
export { default as GlassCard } from "./GlassCard";
export { default as GlowWrap } from "./GlowWrap";
export { default as Modal } from "./Modal";
export { default as Price } from "./Price";
export { default as SectionHeading } from "./SectionHeading";
export { default as Skeleton } from "./Skeleton";
export { default as VideoPlayer } from "./VideoPlayer";
