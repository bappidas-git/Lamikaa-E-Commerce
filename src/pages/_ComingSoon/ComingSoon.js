import React from "react";
import { GlassCard, SectionHeading } from "../../components/ui";
import useSeo from "../../hooks/useSeo";
import styles from "../NotFound/NotFound.module.css";

// =============================================================================
// ComingSoon  —  TEMPORARY. Prompt 35 verifies no route still points here.
// =============================================================================
//
// Prompt 08 installs the whole LAMIKAA route map at once, ahead of the pages
// that will fill it: /search arrived in Prompt 11, /rituals and /rituals/:slug
// in 24, /why-lamikaa in 28. ONE route still points here — /cart, which Prompt
// 29 builds. A route that 404s in the meantime would make the navigation of the
// next prompts untestable, and a route quietly pointed at the homepage would
// hide the gap instead of showing it — so the unbuilt page renders this, named
// with the prompt that owns it.
//
// It is `noindex`: nothing here is a page a search engine should ever hold.
//
// It borrows NotFound's stylesheet on purpose. This is scaffolding — it should
// cost one file, and it should disappear without leaving a stylesheet behind.
// =============================================================================

const ComingSoon = ({ prompt, title = "Coming soon", description }) => {
  useSeo({
    title,
    description: description || `${title} — this page is being built.`,
    noindex: true,
  });

  return (
    <section className={`sf-section ${styles.section}`}>
      <div className="sf-container">
        <GlassCard padding="lg" glow="gold" className={styles.card}>
          <SectionHeading
            as="h1"
            align="center"
            eyebrow="In progress"
            title={title}
            lede={
              prompt
                ? `This page is being built (Prompt ${prompt}).`
                : "This page is being built."
            }
          />
        </GlassCard>
      </div>
    </section>
  );
};

export default ComingSoon;
