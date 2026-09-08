import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { ContentBlocks, Skeleton } from "../../components/ui";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import apiService from "../../services/api";
import useSeo from "../../hooks/useSeo";
import useSiteContent from "../../hooks/useSiteContent";
import NotFound from "../NotFound/NotFound";
import { STOREFRONT_CONFIG } from "../../theme/tokens";
import { parseBlocks } from "../../utils/contentBlocks";
import { ROUTES } from "../../utils/constants";
import { formatDate } from "../../utils/helpers";
import { shippingMethodsBlock, termsPricingBlock } from "../../utils/policyClauses";
import { breadcrumbJsonLd } from "../../utils/seo";
import styles from "./PolicyPage.module.css";

// =============================================================================
// /policies/:policy — one page, four documents
// =============================================================================
//
// Privacy, Terms, Shipping & Returns and Cookies were four page components with
// four stylesheets and four copies of one "document" treatment, each carrying
// its own clauses as hard-coded JSX. They are one component and one record now:
// `siteContent.policies`, edited in the admin (Prompt 34), typeset here.
//
// That collapse is worth more than the four files it saves. The boilerplate Terms
// page stated three rupee shipping rates, a jurisdiction and a company name
// none of which this store runs on; because they were JSX, correcting them was
// a deploy. The only clauses this page writes are the ones that CANNOT be
// written in advance, and it builds them from the live records:
//
//   terms              a "Pricing, tax and payment" clause from
//                      `settings.store` + `settings.payment` +
//                      `STOREFRONT_CONFIG.returnsWindowDays` — what currency
//                      prices are in, whether tax is inside them, whether cash
//                      on delivery is offered and up to what value, and how
//                      long a return window runs (utils/policyClauses.js).
//   shipping-returns   the methods `shipping.getMethods()` actually offers,
//                      named and described. NO RATES: money in a policy belongs
//                      where the checkout can be held to it, which is the
//                      checkout.
//
// THE NUMBERS ARE THE PAGE'S, NOT THE COPY'S. The stored bodies open their
// clauses "## 01. Dispatch"; the ordinal is stripped off the heading and
// re-hung in the left gutter, numbered BY POSITION. That is what lets a
// generated clause continue the run (Terms ends at 10 and the pricing clause is
// 11) and what keeps the document right when an owner reorders two clauses in
// the admin without renumbering them by hand.
//
// A TOKEN NEVER PRINTS. The body goes through `fillCopy` first, which fills the
// store's own figures and then takes the whole SENTENCE off the page when it
// still quotes a `{{TOKEN}}` nobody has supplied — so the GSTIN line, the
// jurisdiction sentence and the dispatch SLA are absent rather than broken
// while the owner has not supplied them.
//
// AN UNKNOWN POLICY IS A 404, not an empty document: `/policies/other` renders
// `NotFound` with the URL intact, exactly as an unknown category slug does.
// =============================================================================

/**
 * The URL segment → the key in `siteContent.policies`, and the label the
 * breadcrumb and the cross-links use.
 *
 * The map is the route's whole vocabulary: a segment that is not in it does not
 * exist, which is what makes `/policies/other` a 404 rather than a blank page.
 */
export const POLICIES = [
  { slug: "privacy", key: "privacy", label: "Privacy", to: ROUTES.POLICY_PRIVACY },
  { slug: "terms", key: "terms", label: "Terms", to: ROUTES.POLICY_TERMS },
  {
    slug: "shipping-returns",
    key: "shippingReturns",
    label: "Shipping & Returns",
    to: ROUTES.POLICY_SHIPPING_RETURNS,
  },
  { slug: "cookies", key: "cookies", label: "Cookies", to: ROUTES.POLICY_COOKIES },
];

export const policyBySlug = (slug) =>
  POLICIES.find((policy) => policy.slug === slug) || null;

/** "01"–"99", padded so a column of numerals lines up on the digit. */
export const clauseNumeral = (index) => String(index + 1).padStart(2, "0");

/**
 * A stored heading without the ordinal the author typed into it.
 * "01. Dispatch" → "Dispatch"; "2) Your account" → "Your account"; a heading
 * that never carried one is returned unchanged.
 *
 * Two digits, not three: a clause ordinal is 01–99, and allowing a third would
 * make "2026 in review" open on a stripped "6 in review" the moment a year led
 * a heading.
 */
export const clauseTitle = (text) =>
  typeof text === "string" ? text.replace(/^\s*\d{1,2}\s*[.)]?\s+/, "").trim() : "";

/** A heading as a URL fragment: "Your account" → "your-account". */
const slugify = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * The document as clauses: every `h2` opens one and owns the blocks under it.
 *
 * Blocks before the first heading are the document's PREAMBLE — unnumbered,
 * untitled, and rendered above the first clause rather than swallowed by it.
 *
 * Exported for the unit test: the numbering, the stripped ordinal and the
 * uniqueness of the anchors are the three things a table of contents depends
 * on, and all three are quiet when they break.
 *
 * @param {Array<object>} blocks the parsed body (stored + generated)
 * @returns {{preamble: object[], clauses: Array<{id, number, title, blocks}>}}
 */
export const toClauses = (blocks) => {
  const preamble = [];
  const clauses = [];
  const seen = new Set();

  (Array.isArray(blocks) ? blocks : []).forEach((block) => {
    if (block.type === "h2") {
      const title = clauseTitle(block.text);
      const number = clauseNumeral(clauses.length);
      // An anchor has to be unique on the page, and two clauses can legitimately
      // share a title across a long document ("Contact"). The number is the
      // tie-breaker rather than a bare counter, so the first "#contact" keeps
      // its short link.
      let id = slugify(title) || `clause-${number}`;
      if (seen.has(id)) id = `${id}-${number}`;
      seen.add(id);
      clauses.push({ id, number, title, blocks: [] });
      return;
    }
    if (clauses.length === 0) preamble.push(block);
    else clauses[clauses.length - 1].blocks.push(block);
  });

  return { preamble, clauses };
};

// ── The one read this page makes of its own ─────────────────────────────────

/**
 * The active shipping methods, for the Shipping & Returns document only.
 *
 * `null` while in flight or where the page does not need them, an array once
 * they land, `[]` when the read failed — and an empty array renders no clause,
 * which is the honest answer for "we could not find out".
 */
const useShippingMethods = (enabled) => {
  const [methods, setMethods] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setMethods(null);
      return undefined;
    }
    let alive = true;
    apiService.shipping
      .getMethods()
      .then((rows) => {
        if (alive) setMethods(Array.isArray(rows) ? rows : []);
      })
      .catch((error) => {
        if (!alive) return;
        console.error("Failed to load shipping methods:", error);
        setMethods([]);
      });
    return () => {
      alive = false;
    };
  }, [enabled]);

  return methods;
};

// ══════════════════════════════════════════════════════════════════════════════
// THE DOCUMENT
// ══════════════════════════════════════════════════════════════════════════════
//
// Split from the route component below so the unknown-slug case can return
// `NotFound` BEFORE any of this reads a record or claims the document head. A
// guard inside one component would have to run after every hook, which means
// `/policies/other` would publish this page's `<title>` and canonical for a
// frame and then let NotFound's own `useSeo` overwrite them.

const PolicyDocument = ({ policy }) => {
  const { content, loading } = useSiteContent("policies");
  const {
    store,
    payment,
    email: supportEmail,
    address: supportAddress,
    emailHref,
    fillCopy,
  } = useStoreSettings();

  const methods = useShippingMethods(policy.key === "shippingReturns");

  const record = content?.[policy.key] ?? null;
  const title = record?.title || policy.label;

  // The stored body, with the store's figures filled in and every sentence
  // still quoting an unsupplied fact removed.
  const body = useMemo(
    () => (record?.body ? fillCopy(record.body) : ""),
    [record, fillCopy]
  );

  // The clauses this document cannot carry in stored prose.
  const generated = useMemo(() => {
    if (policy.key === "terms") {
      return termsPricingBlock({
        store,
        payment,
        returnWindowDays: STOREFRONT_CONFIG.returnsWindowDays,
      });
    }
    if (policy.key === "shippingReturns") {
      return shippingMethodsBlock(methods);
    }
    return "";
  }, [policy, store, payment, methods]);

  const { preamble, clauses } = useMemo(
    () => toClauses([...parseBlocks(body), ...parseBlocks(generated)]),
    [body, generated]
  );

  const trail = [{ label: "Home", to: ROUTES.HOME }, { label: title }];

  useSeo({
    title,
    description: record?.standfirst || `${title} — LAMIKAA Naturals.`,
    jsonLd: breadcrumbJsonLd(trail),
  });

  const others = POLICIES.filter((row) => row.slug !== policy.slug);

  return (
    <div className={styles.page}>
      <div className={`sf-container ${styles.container}`}>
        <div className={styles.layout}>
          {/* ── The table of contents ──────────────────────────────────────
              A sticky rail from 1025px, an inline list below it. Generated
              from the clauses actually on the page, so a generated clause is
              in it and a clause whose every sentence was stripped is not. */}
          {clauses.length > 1 && (
            <nav className={styles.toc} aria-label="Contents">
              <p className={styles.tocTitle}>Contents</p>
              {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
              <ol className={styles.tocList} role="list">
                {clauses.map((clause) => (
                  <li key={clause.id} className={styles.tocItem}>
                    <a className={styles.tocLink} href={`#${clause.id}`}>
                      <span className={styles.tocNum} aria-hidden="true">
                        {clause.number}
                      </span>
                      <span>{clause.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <article className={styles.doc}>
            {/* ── Masthead ─────────────────────────────────────────────── */}
            <Breadcrumb items={trail} className={styles.crumbs} />
            <p className={styles.kicker}>Policies</p>
            <h1 className={styles.title}>{title}</h1>
            {record?.updatedAt ? (
              <p className={styles.updated}>
                Last updated{" "}
                <time dateTime={record.updatedAt}>
                  {formatDate(record.updatedAt)}
                </time>
              </p>
            ) : null}
            {record?.standfirst ? (
              <p className={styles.standfirst}>{record.standfirst}</p>
            ) : null}

            {/* ── The clauses ──────────────────────────────────────────── */}
            {loading && (
              <div className={styles.clauses}>
                <Skeleton variant="text" lines={10} />
              </div>
            )}

            {!loading && clauses.length === 0 && preamble.length === 0 && (
              <p className={styles.missing} role="status">
                This policy has not been published yet. Write to us and we will
                answer any question it would have covered —{" "}
                <Link to={ROUTES.CONTACT}>contact the care desk</Link>.
              </p>
            )}

            {!loading && preamble.length > 0 && (
              <ContentBlocks blocks={preamble} className={styles.prose} />
            )}

            {!loading && clauses.length > 0 && (
              <div className={styles.clauses}>
                {clauses.map((clause) => (
                  <section
                    key={clause.id}
                    id={clause.id}
                    className={styles.clause}
                    aria-labelledby={`${clause.id}-title`}
                  >
                    {/* The ordinal is a visual hang, not a word: the heading
                        below it already names the clause, and a screen reader
                        that reads "zero one" before every title is reading the
                        page's typography out loud. */}
                    <span className={styles.clauseNum} aria-hidden="true">
                      {clause.number}
                    </span>
                    <h2 className={styles.clauseTitle} id={`${clause.id}-title`}>
                      {clause.title}
                    </h2>
                    {clause.blocks.length > 0 && (
                      <ContentBlocks
                        blocks={clause.blocks}
                        className={styles.prose}
                      />
                    )}
                  </section>
                ))}
              </div>
            )}

            {/* ── Colophon ─────────────────────────────────────────────── */}
            <div className={styles.colophon}>
              <p className={styles.colophonLabel}>
                Questions about this document
              </p>
              {supportEmail ? (
                <p className={styles.colophonText}>
                  Write to{" "}
                  <a className={styles.link} href={emailHref}>
                    {supportEmail}
                  </a>
                  .
                </p>
              ) : (
                <p className={styles.colophonText}>
                  <Link className={styles.link} to={ROUTES.CONTACT}>
                    Write to us
                  </Link>{" "}
                  and we will answer.
                </p>
              )}
              {supportAddress ? (
                <p className={styles.colophonText}>{supportAddress}</p>
              ) : null}

              {/* Cross-links: the other three documents, always reachable from
                  any one of them. */}
              <nav className={styles.siblings} aria-label="Other policies">
                {others.map((row) => (
                  <Link key={row.slug} className={styles.sibling} to={row.to}>
                    {row.label}
                  </Link>
                ))}
              </nav>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// THE ROUTE
// ══════════════════════════════════════════════════════════════════════════════
//
// One hook, one decision. A segment the map does not know is a real 404 with
// the wrong URL left in the bar — never a redirect to a policy the visitor did
// not ask for, and never an empty document under a heading.

const PolicyPage = () => {
  const { policy: slug } = useParams();
  const policy = policyBySlug(slug);

  if (!policy) return <NotFound />;
  // Keyed on the slug so moving between two policies remounts the document
  // rather than reusing one that has already read another record.
  return <PolicyDocument key={policy.slug} policy={policy} />;
};

export default PolicyPage;
