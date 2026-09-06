import React from "react";
import { Button, GlassCard, SectionHeading } from "../../components/ui";
import useSeo from "../../hooks/useSeo";
import { ROUTES } from "../../utils/constants";
import styles from "./NotFound.module.css";

// =============================================================================
// NotFound — a real 404
// =============================================================================
//
// The Meghali storefront answered every unknown path with <Navigate to="/" />.
// That is a redirect, not a 404: the visitor loses the URL that was wrong (so
// they cannot see the typo), the Back button bounces them straight out again,
// and a crawler is told the homepage lives at a thousand addresses.
//
// This page keeps the URL, says plainly what happened, and offers the two exits
// that are actually useful — the shop and the homepage. It is `noindex` so the
// 404 body never enters an index in place of the page that used to be there.
// =============================================================================

const NotFound = () => {
  useSeo({
    title: "Page not found",
    description:
      "That page is not here. Browse the LAMIKAA Naturals Black Rice range instead.",
    noindex: true,
  });

  return (
    <section className={`sf-section ${styles.section}`}>
      <div className="sf-container">
        <GlassCard padding="lg" glow="gold" className={styles.card}>
          <SectionHeading
            as="h1"
            align="center"
            eyebrow="404"
            title="This page has wandered off"
            lede="The link may be old, or the address may have a typo in it. Everything else is exactly where you left it."
          />
          <div className={styles.actions}>
            <Button to={ROUTES.SHOP} size="lg">
              Shop the Black Rice Range
            </Button>
            <Button to={ROUTES.HOME} variant="ghost">
              Back to home
            </Button>
          </div>
        </GlassCard>
      </div>
    </section>
  );
};

export default NotFound;
