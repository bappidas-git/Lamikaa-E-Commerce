import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import FAQ, { faqAnswerText } from "../../components/FAQ/FAQ";
import { Button, GlassCard } from "../../components/ui";
import { useFaqs } from "../../context/FaqContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import useSeo from "../../hooks/useSeo";
import useSiteContent from "../../hooks/useSiteContent";
import { ROUTES } from "../../utils/constants";
import { DEFAULT_FAQ_GROUP, faqsForGroup } from "../../utils/faqs";
import { faqPageJsonLd } from "../../utils/seo";
import styles from "./Faq.module.css";

// =============================================================================
// /faq — every answer the store has, filed
// =============================================================================
//
// The Help Centre this replaces was a flat list with a search box and a grid of
// six links to other pages. The list is the right idea and the grid was not:
// six cards pointing at /orders, /profile and three policies is a second
// navigation for a site that already has one, and none of the six was an
// ANSWER. What a reference page owes a visitor is the answers, arranged so the
// one they want is findable two ways — by reading the headings, or by typing.
//
// SO THE PAGE IS A BOOK: a search line, a contents rail, and the answers under
// their own headings.
//
//   THE GROUPS ARE DATA. `siteContent.faqPage.groups` names them and orders
//   them, so the owner renames "Orders, shipping & returns" without a deploy;
//   each row's `group` files it (utils/faqs.js). A row filed under a heading
//   nobody has configured — or under none — lands in a trailing group rather
//   than falling off the page: an answer the store has written must be visible
//   somewhere, and silently dropping it is the one behaviour a help page cannot
//   have.
//
//   THE RAIL IS A LIST OF LINKS to `#group-<key>`, sticky at 112px from 1025px
//   (clear of the masthead) and a horizontally scrolling chip strip below that.
//   It is a <nav>, not a decoration, so it is in the landmark list.
//
//   THE SEARCH IS THE HELP CENTRE'S, UNCHANGED: a match on the question OR
//   anywhere in the FILLED answer, so a shopper who types the store's own
//   shipping threshold finds the line that prints it, and the number of matches
//   is announced in a `role="status"` region rather than only shown.
//
// THE ANSWERS THEMSELVES ARE THE SHARED `FAQ` COMPONENT — one accordion, one
// keyboard model, one deep-link rule (`/faq#faq-7` opens row 7 and focuses it),
// and one place where `{freeShipping}` becomes a figure and a sentence still
// quoting an unsupplied fact leaves the page.
//
// THE JSON-LD IS BUILT FROM THE SAME PREPARED TEXT the accordion renders, not
// from the raw record: a graph built from the raw answer would publish
// `{{DISPATCH_SLA}}` to a crawler while the page quietly dropped the line. It
// describes the WHOLE page, not the current search — a transient query is not a
// change to what this page contains.
// =============================================================================

/** Where a row filed under an unconfigured heading goes. Furniture, not copy. */
const OTHER_GROUP = { key: DEFAULT_FAQ_GROUP, label: "More questions" };

/**
 * The page's sections: the configured groups that actually have rows, then one
 * trailing group for everything the configured keys did not claim.
 *
 * Exported for the unit test — "no answer disappears" is the property that can
 * go quietly wrong here, and it only shows up when an admin renames a heading.
 *
 * @param {object[]} rows    the live `help` rows, in the admin's order
 * @param {object[]} groups  `siteContent.faqPage.groups`
 * @returns {Array<{key: string, label: string, rows: object[]}>}
 */
export const faqSections = (rows, groups) => {
  const list = Array.isArray(rows) ? rows : [];
  const configured = (Array.isArray(groups) ? groups : []).filter(
    (group) => group && typeof group.key === "string" && group.key.trim()
  );

  const sections = configured
    .map((group) => {
      const key = group.key.trim();
      return { key, label: group.label || key, rows: faqsForGroup(list, key) };
    })
    .filter((section) => section.rows.length > 0);

  // Claimed by KEY, not by the rows a group returned: `faqsForGroup` de-dupes,
  // and a row dropped as a duplicate must not reappear under "More questions"
  // as if nobody had filed it.
  const claimed = new Set(configured.map((group) => group.key.trim()));
  const orphans = list.filter(
    (row) => !claimed.has(row.group || DEFAULT_FAQ_GROUP)
  );
  if (orphans.length > 0) {
    sections.push({ ...OTHER_GROUP, rows: orphans });
  }

  return sections;
};

const Faq = () => {
  const { content } = useSiteContent("faqPage");
  const { forPlacement } = useFaqs();
  const {
    email: supportEmail,
    phone: supportPhone,
    emailHref,
    phoneHref,
    fillCopy,
  } = useStoreSettings();

  const [query, setQuery] = useState("");

  // The answers the admin has switched on for the help centre, in their order.
  const helpFaqs = useMemo(() => forPlacement("help"), [forPlacement]);

  // The whole page, before the search narrows it. This is what the contents
  // rail counts and what the structured data describes. The group list is read
  // INSIDE the memo: `content?.groups` is a fresh array on every render of a
  // record that has none, and a dependency that changes every render is a memo
  // that never memoises.
  const sections = useMemo(
    () => faqSections(helpFaqs, content?.groups),
    [helpFaqs, content]
  );

  const term = query.trim().toLowerCase();
  const isSearching = term.length > 0;

  // Unchanged from the Help Centre: question OR anywhere in the FILLED answer.
  const results = useMemo(() => {
    if (!isSearching) return sections;
    return sections
      .map((section) => ({
        ...section,
        rows: section.rows.filter(
          (faq) =>
            faq.question.toLowerCase().includes(term) ||
            fillCopy(faq.answer).toLowerCase().includes(term)
        ),
      }))
      .filter((section) => section.rows.length > 0);
  }, [sections, isSearching, term, fillCopy]);

  const matchCount = results.reduce(
    (total, section) => total + section.rows.length,
    0
  );

  // The graph, from the same prepared text the accordion renders.
  const jsonLd = useMemo(
    () =>
      faqPageJsonLd(
        sections.flatMap((section) =>
          section.rows.map((faq) => ({
            question: faq.question,
            answer: faqAnswerText(faq.answer, fillCopy),
          }))
        )
      ),
    [sections, fillCopy]
  );

  useSeo({
    title: "FAQ",
    description:
      "Answers about ordering, delivery, returns and the LAMIKAA Naturals Black Rice range.",
    jsonLd,
  });

  return (
    <div className={styles.page}>
      {/* ── 1. THE OPENING ──────────────────────────────────────────────── */}
      <section className={`sf-section ${styles.head}`} aria-labelledby="faq-title">
        <div className="sf-container">
          <p className={`sf-eyebrow sf-eyebrow--rule ${styles.eyebrow}`}>
            {content?.eyebrow || "Help"}
          </p>
          <h1 className={styles.title} id="faq-title">
            {content?.title || "Frequently asked questions"}
          </h1>
          {content?.lede ? <p className={styles.lede}>{content.lede}</p> : null}

          <div className={styles.search}>
            <label className={styles.searchLabel} htmlFor="faq-search">
              Search the answers
            </label>
            <div className={styles.searchRow}>
              <span className={styles.searchIcon} aria-hidden="true">
                <Icon icon="mdi:magnify" />
              </span>
              <input
                id="faq-search"
                className={styles.searchInput}
                type="search"
                autoComplete="off"
                placeholder="Delivery, returns, black rice…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {isSearching && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => setQuery("")}
                  aria-label="Clear the search"
                >
                  <Icon icon="mdi:close" aria-hidden="true" />
                </button>
              )}
            </div>
            <p className={styles.searchStatus} role="status">
              {isSearching
                ? `${matchCount} ${matchCount === 1 ? "answer" : "answers"} for “${query.trim()}”`
                : ""}
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. THE CONTENTS AND THE ANSWERS ─────────────────────────────── */}
      <div className={`sf-container ${styles.body}`}>
        {results.length > 1 && (
          <nav className={styles.rail} aria-label="Question groups">
            <p className={styles.railTitle}>Contents</p>
            {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
            <ul className={styles.railList} role="list">
              {results.map((section) => (
                <li key={section.key} className={styles.railItem}>
                  <a className={styles.railLink} href={`#group-${section.key}`}>
                    <span className={styles.railLabel}>{section.label}</span>
                    <span className={styles.railCount} aria-hidden="true">
                      {section.rows.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className={styles.groups}>
          {results.length === 0 ? (
            <GlassCard padding="lg" className={styles.empty} role="status">
              <p className={styles.emptyTitle}>
                {isSearching
                  ? `Nothing here matches “${query.trim()}”`
                  : "No answers yet"}
              </p>
              <p className={styles.emptyBody}>
                Write to us instead — the care desk answers questions this page
                has not learned yet.
              </p>
              <Button variant="primary" to={ROUTES.CONTACT}>
                Write to us
              </Button>
            </GlassCard>
          ) : (
            results.map((section) => (
              <section
                key={section.key}
                id={`group-${section.key}`}
                className={styles.group}
                aria-labelledby={`group-${section.key}-title`}
              >
                <h2 className={styles.groupTitle} id={`group-${section.key}-title`}>
                  {section.label}
                </h2>
                {/* The shared accordion: one keyboard model, one deep-link
                    rule, one place the store's figures are filled in. */}
                <FAQ
                  faqs={section.rows}
                  multiple
                  headingLevel={3}
                  className={styles.accordion}
                />
              </section>
            ))
          )}
        </div>
      </div>

      {/* ── 3. THE CLOSING BAND ─────────────────────────────────────────── */}
      <section className={`sf-section ${styles.band}`} aria-labelledby="faq-still">
        <div className="sf-container">
          <GlassCard strong padding="lg" glow="gold" className={styles.bandCard}>
            <div className={styles.bandBody}>
              <h2 className={styles.bandTitle} id="faq-still">
                Still need help?
              </h2>
              <p className={styles.bandLede}>
                Write, call, or send a photograph of the product you are asking
                about. We read every message.
              </p>
              {/* A channel with no resolved value is not a channel: an empty
                  `mailto:` is a dead link, so the row is simply not written. */}
              {(supportEmail || supportPhone) && (
                <p className={styles.bandMeta}>
                  {supportEmail && (
                    <a className={styles.bandLink} href={emailHref}>
                      <Icon icon="mdi:email-outline" aria-hidden="true" />
                      {supportEmail}
                    </a>
                  )}
                  {supportPhone && (
                    <a className={styles.bandLink} href={phoneHref}>
                      <Icon icon="mdi:phone-outline" aria-hidden="true" />
                      {supportPhone}
                    </a>
                  )}
                </p>
              )}
            </div>
            <div className={styles.bandActions}>
              <Button variant="primary" to={ROUTES.CONTACT}>
                Write to us
              </Button>
              <Link className={styles.bandGhost} to={ROUTES.POLICY_SHIPPING_RETURNS}>
                Shipping &amp; Returns
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Faq;
