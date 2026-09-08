import React from "react";
import { Button, EmptyState } from "../../components/ui";
import useSeo from "../../hooks/useSeo";
import { ROUTES } from "../../utils/constants";
import styles from "./NotFound.module.css";

// =============================================================================
// NotFound — a real 404
// =============================================================================
//
// The storefront this one replaced answered every unknown path with a
// <Navigate to="/" />. That is a redirect, not a 404: the visitor loses the URL
// that was wrong (so they cannot see the typo), the Back button bounces them
// straight out again, and a crawler is told the homepage lives at a thousand
// addresses.
//
// This page keeps the URL, says plainly what happened, and offers the two exits
// that are actually useful — the shop and the homepage. It is `noindex` so the
// 404 body never enters an index in place of the page that used to be there.
//
// It is the shared `ui/EmptyState` with "404" as its eyebrow (Prompt 31): a
// wrong address IS an empty state, and drawing it in the same card as every
// other one is what stops a 404 reading like a crash. `titleAs="h1"` because
// here the state is the whole page and does own the heading level.
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
        <EmptyState
          eyebrow="404"
          title="This page has wandered off"
          titleAs="h1"
          text="The link may be old, or the address may have a typo in it. Everything else is exactly where you left it."
          icon="mdi:map-marker-question-outline"
          actions={
            <>
              <Button to={ROUTES.SHOP} size="lg">
                Shop the Black Rice Range
              </Button>
              <Button to={ROUTES.HOME} variant="ghost">
                Back to home
              </Button>
            </>
          }
        />
      </div>
    </section>
  );
};

export default NotFound;
