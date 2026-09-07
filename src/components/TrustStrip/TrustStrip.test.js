// The strip's contract is that its words come from the brand config and never
// from this component: three owner-mandated badges plus the provenance line,
// each with an icon matched by position.
import { trustPromises } from "./TrustStrip";
import brand from "../../config/brand";

describe("trustPromises", () => {
  it("is brand.trustBadges followed by brand.originBadge", () => {
    expect(trustPromises().map((p) => p.label)).toEqual([
      ...brand.trustBadges,
      brand.originBadge,
    ]);
  });

  it("gives every promise an icon, matched by position", () => {
    const icons = trustPromises().map((p) => p.icon);
    expect(icons).toEqual([
      "mdi:sprout-outline",
      "mdi:leaf",
      "mdi:star-four-points-outline",
      "mdi:map-marker-outline",
    ]);
  });

  it("carries no Meghali-era wording", () => {
    const text = trustPromises().map((p) => p.label).join(" ");
    expect(text).not.toMatch(/silk|handwoven|handloom/i);
  });
});
