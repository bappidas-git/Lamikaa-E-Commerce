import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import apiService from "../../services/api";
import brand from "../../config/brand";
import { Button, Chip, SectionHeading, Skeleton } from "../../components/ui";
import ProductCard from "../../components/storefront/ProductCard";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../context/WishlistContext";
import useSeo from "../../hooks/useSeo";
import { rankProducts } from "../../utils/search";
import { ROUTES } from "../../utils/constants";
import { reveal } from "../../theme/motion";
import styles from "./Search.module.css";

// =============================================================================
// /search?q= — the results page
// =============================================================================
//
// The overlay's eight rows, as a grid with no ceiling. It is the same ranking
// (`utils/search.js`) over the same three collections, so a query cannot mean
// one thing in the overlay and another here — and it is the page a shared or
// bookmarked search URL resolves to, which the overlay, being a dialog, can
// never be.
//
// NOINDEX. A search result page is a URL a crawler can generate infinitely many
// of, none of which is a page the store wrote. It carries `noindex,nofollow`
// like every other query-shaped route.
//
// The field at the top submits to this same page rather than opening the
// overlay: someone who has landed here from a link, or come back to it, is
// already looking at the results and wants to edit the query in place.
// =============================================================================

const Search = () => {
  const [params, setParams] = useSearchParams();
  const query = (params.get("q") || "").trim();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const reduce = useReducedMotion();

  const inputRef = useRef(null);
  const [draft, setDraft] = useState(query);
  const [data, setData] = useState({ products: [], categories: [], concerns: [] });
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  // The field mirrors the URL, so Back and Forward move the query too.
  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiService.products.getAll(),
      apiService.categories.getAll(),
      apiService.concerns.getAll(),
    ])
      .then(([products, categories, concerns]) => {
        if (!active) return;
        setData({
          products: Array.isArray(products) ? products : [],
          categories: Array.isArray(categories) ? categories : [],
          concerns: Array.isArray(concerns) ? concerns : [],
        });
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load the catalogue for search:", err);
        setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(
    () =>
      rankProducts(data.products, query, {
        categories: data.categories,
        concerns: data.concerns,
      }),
    [data, query]
  );

  const count = results.length;

  useSeo({
    title: query ? `Search: ${query}` : "Search",
    description: query
      ? `Products matching “${query}” at LAMIKAA NATURALS.`
      : "Search the LAMIKAA NATURALS range.",
    noindex: true,
  });

  // ---- Handlers -----------------------------------------------------------

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = draft.trim();
    // `replace` so a visitor editing the same search does not have to walk back
    // through every intermediate query to leave the page.
    setParams(value ? { q: value } : {}, { replace: true });
  };

  // ProductCard hands back a ready cart line (it calls buildCartItem itself).
  const handleAddToCart = useCallback((cartItem) => addToCart(cartItem, 1), [addToCart]);
  const handleToggleWishlist = useCallback(
    (product) => toggleWishlist(product),
    [toggleWishlist]
  );

  // ---- Copy ---------------------------------------------------------------

  const lede = () => {
    if (loading) return "Searching the range…";
    if (failed) return "The catalogue could not be loaded. Please try again.";
    if (!query) return "Type what you are looking for — a product, an ingredient or a concern.";
    if (!count) return `Nothing matched “${query}”.`;
    return `${count} ${count === 1 ? "product" : "products"} matching “${query}”.`;
  };

  const popular = brand.search?.popular || [];

  return (
    <section className="sf-section">
      <div className="sf-container">
        <SectionHeading
          as="h1"
          eyebrow="Search"
          title={query ? `Results for “${query}”` : "Search"}
          lede={lede()}
        />

        <form
          className={styles.field}
          role="search"
          aria-label="Search products"
          onSubmit={handleSubmit}
        >
          <span className={styles.fieldIcon} aria-hidden="true">
            <Icon icon="mdi:magnify" />
          </span>
          <input
            ref={inputRef}
            type="search"
            className={styles.input}
            value={draft}
            placeholder="Search products"
            aria-label="Search products"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            enterKeyHint="search"
            onChange={(event) => setDraft(event.target.value)}
          />
          <Button type="submit" size="sm" className={styles.submit}>
            Search
          </Button>
        </form>

        {/* The count, spoken. The heading's lede carries it visually. */}
        <p className="sf-visually-hidden" role="status" aria-live="polite">
          {loading || !query
            ? ""
            : `${count} ${count === 1 ? "result" : "results"} for “${query}”`}
        </p>

        {loading ? (
          /* `role="list"` restated on purpose: Safari drops the list semantics
             of a <ul> whose `list-style` is none, which is every list in this
             design system. */
          /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
          <ul className={styles.grid} role="list">
            {[0, 1, 2, 3].map((index) => (
              <li key={index} aria-hidden="true">
                <Skeleton variant="card" />
              </li>
            ))}
          </ul>
        ) : count ? (
          /* eslint-disable-next-line jsx-a11y/no-redundant-roles */
          <ul className={styles.grid} role="list">
            {results.map((entry, index) => (
              <motion.li key={entry.product.id} {...reveal(reduce, { index })}>
                <ProductCard
                  product={entry.product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={isInWishlist(entry.product.id)}
                />
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>
              {failed
                ? "Search is unavailable right now."
                : query
                ? `Nothing matched “${query}”.`
                : "Nothing searched for yet."}
            </p>
            {!failed && popular.length ? (
              <>
                <p className={styles.emptyHint}>Try one of these:</p>
                <ul className={styles.chips}>
                  {popular.map((term) => (
                    <li key={term}>
                      <Chip
                        variant="glass"
                        as="button"
                        onClick={() => {
                          setDraft(term);
                          setParams({ q: term }, { replace: true });
                          inputRef.current?.focus();
                        }}
                      >
                        {term}
                      </Chip>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            <Button variant="secondary" to={ROUTES.SHOP}>
              Browse all products
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Search;
