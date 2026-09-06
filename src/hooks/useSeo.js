import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import brand from "../config/brand";
import { isPlaceholder } from "../utils/placeholders";
import {
  releasePageTitle,
  setPageTitle,
  storeDocumentTitle,
} from "../utils/documentTitle";
import { useStoreSettings } from "../context/StoreSettingsContext";

// =============================================================================
// useSeo — one hook owns the <head> of a page
// =============================================================================
//
// The repository had two half-answers to "what goes in the head": the static
// block in public/index.html (right for a crawler that never runs JS, wrong the
// moment you navigate) and the PDP's hand-rolled title + description effect.
// Neither wrote a canonical, an og:url or a robots directive, so every route
// shared one set of share-card tags and /checkout was as indexable as /.
//
// This is the single answer. A page calls it once, declaratively:
//
//   useSeo({ title: "Shop", description: "…", jsonLd: { … } });
//   useSeo({ title: "Page not found", noindex: true });
//
// and gets: the tab title through the same claim/release protocol the store
// title respects (utils/documentTitle.js), a description, the Open Graph and
// Twitter card set, a canonical link, a robots directive when the page must not
// be indexed, and an application/ld+json block.
//
// NO DEPENDENCY. react-helmet and friends buy asynchronous, nested, SSR-aware
// head management; a client-rendered CRA storefront where exactly one component
// per route describes itself needs none of it — this is ~40 lines of DOM work
// plus a cleanup, and it cannot fall out of step with a library's React version.
//
// data-seo="page" IS THE OWNERSHIP MARK. Every element this hook writes carries
// it, which is the contract that nothing else in the app touches those tags. A
// tag it did not create (the static og:* set in index.html) is BORROWED, not
// duplicated: the hook remembers the original content, stamps the element while
// it holds it, and puts the original back on unmount — so a route without a
// useSeo() call still finds the site-wide defaults in the head, and a crawler
// never sees two og:title tags and has to guess.
//
// Prompt 25 moves the PDP onto this hook (with the product JSON-LD from Prompt
// 27); Prompt 38 audits the result.
// =============================================================================

/** The mark that says "useSeo owns this element". */
const OWNED = "page";

/**
 * Find or create a <meta>/<link> element, remember what it was, and write the
 * new value. Returns a restore function — that is the whole lifecycle.
 */
const claimElement = (tagName, selector, identity, valueAttr, value) => {
  const head = document.head;
  let element = head.querySelector(selector);
  const created = !element;
  const previousValue = created ? null : element.getAttribute(valueAttr);

  if (created) {
    element = document.createElement(tagName);
    Object.entries(identity).forEach(([name, attr]) => element.setAttribute(name, attr));
    head.appendChild(element);
  }

  element.setAttribute(valueAttr, value);
  element.setAttribute("data-seo", OWNED);

  return () => {
    if (created) {
      element.remove();
      return;
    }
    // A borrowed tag goes back exactly as it was found.
    if (previousValue == null) element.removeAttribute(valueAttr);
    else element.setAttribute(valueAttr, previousValue);
    element.removeAttribute("data-seo");
  };
};

const claimMeta = (name, content, attribute = "name") =>
  claimElement(
    "meta",
    `meta[${attribute}="${name}"]`,
    { [attribute]: name },
    "content",
    content
  );

const claimLink = (rel, href) =>
  claimElement("link", `link[rel="${rel}"]`, { rel }, "href", href);

/**
 * The site origin to build a canonical from. brand.seo.siteUrl is
 * `{{LAMIKAA_DOMAIN}}` until the owner names the public domain, and a canonical
 * pointing at a placeholder is worse than none — so until it resolves we use
 * the origin the page is actually being served from, which is correct on the
 * real domain and harmless on localhost.
 */
export const seoOrigin = () => {
  const configured = brand.seo?.siteUrl;
  if (configured && !isPlaceholder(configured)) {
    const withScheme = /^https?:\/\//i.test(configured)
      ? configured
      : `https://${configured}`;
    return withScheme.replace(/\/+$/, "");
  }
  return typeof window !== "undefined" ? window.location.origin : "";
};

/**
 * Describe this page to a browser tab, a share card and a crawler.
 *
 * @param {object}  options
 * @param {string}  [options.title]        page title, run through
 *                                         brand.seo.titleTemplate; empty falls
 *                                         back to brand.seo.defaultTitle
 * @param {string}  [options.description]  meta description + og/twitter
 * @param {string}  [options.canonical]    absolute URL, or a path; defaults to
 *                                         the current pathname on seoOrigin()
 * @param {string}  [options.image]        absolute og/twitter image URL
 * @param {string}  [options.type]         og:type — "website" | "article" | "product"
 * @param {boolean} [options.noindex]      emit robots noindex,nofollow
 * @param {object|array} [options.jsonLd]  structured data for the ld+json block
 */
const useSeo = ({
  title,
  description,
  canonical,
  image,
  type = "website",
  noindex = false,
  jsonLd,
} = {}) => {
  const { pathname } = useLocation();
  const { store } = useStoreSettings();

  // The tab title and the store default: whichever page holds the claim wins,
  // and releasing it hands the tab back to Admin → Settings > General.
  const storeTitle = storeDocumentTitle(store);

  const resolvedTitle = title
    ? brand.seo.titleTemplate.replace("%s", title)
    : brand.seo.defaultTitle;
  const resolvedDescription = description || brand.seo.defaultDescription;
  const resolvedImage = image || brand.seo.ogImage;
  const resolvedCanonical = canonical
    ? /^https?:\/\//i.test(canonical)
      ? canonical
      : `${seoOrigin()}${canonical}`
    : `${seoOrigin()}${pathname}`;

  // JSON.stringify once, here: it doubles as the effect's dependency, so a page
  // that rebuilds its jsonLd object every render does not rewrite the head
  // every render. `<` is escaped because the string ends up inside a <script>.
  const jsonLdText = jsonLd
    ? JSON.stringify(jsonLd).replace(/</g, "\\u003c")
    : "";

  useEffect(() => {
    const restore = [];

    setPageTitle(resolvedTitle);

    restore.push(claimMeta("description", resolvedDescription));

    restore.push(claimMeta("og:title", resolvedTitle, "property"));
    restore.push(claimMeta("og:description", resolvedDescription, "property"));
    restore.push(claimMeta("og:type", type, "property"));
    restore.push(claimMeta("og:url", resolvedCanonical, "property"));
    if (resolvedImage) {
      restore.push(claimMeta("og:image", resolvedImage, "property"));
    }

    restore.push(claimMeta("twitter:title", resolvedTitle));
    restore.push(claimMeta("twitter:description", resolvedDescription));
    if (resolvedImage) restore.push(claimMeta("twitter:image", resolvedImage));

    // Only a page that must stay out of the index carries a robots tag — an
    // "index,follow" tag says nothing a missing tag does not already say.
    if (noindex) restore.push(claimMeta("robots", "noindex,nofollow"));

    if (resolvedCanonical) restore.push(claimLink("canonical", resolvedCanonical));

    let script = null;
    if (jsonLdText) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", OWNED);
      script.textContent = jsonLdText;
      document.head.appendChild(script);
    }

    return () => {
      releasePageTitle(storeTitle);
      restore.forEach((undo) => undo());
      if (script) script.remove();
    };
  }, [
    resolvedTitle,
    resolvedDescription,
    resolvedCanonical,
    resolvedImage,
    type,
    noindex,
    jsonLdText,
    storeTitle,
  ]);
};

export default useSeo;
