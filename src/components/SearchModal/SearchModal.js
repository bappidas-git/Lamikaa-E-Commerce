import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import apiService from "../../services/api";
import brand from "../../config/brand";
import { Button, Chip, Modal, Price } from "../ui";
import { useCart } from "../../hooks/useCart";
import { buildCartItem, productPath } from "../../utils/helpers";
import { isPriceKnown, stageSrc } from "../../utils/product";
import { categoryPath } from "../../utils/categories";
import { rankProducts } from "../../utils/search";
import { ROUTES } from "../../utils/constants";
import { reveal } from "../../theme/motion";
import styles from "./SearchModal.module.css";

// =============================================================================
// SearchModal — the full-screen search overlay
// =============================================================================
//
// One field, and everything under it answers it. Empty, the overlay offers the
// three ways into a small catalogue that are honest to offer: the owner's
// popular searches (brand config, not a metric nobody is measuring), what THIS
// TAB has searched for, and the seven categories. Typed into, it becomes a
// ranked list of real products with a price and an add button on every row.
//
// IT RANKS LOCALLY. `utils/search.js` scores the whole catalogue on every
// keystroke — eight products across nine fields is roughly nothing, so there is
// no debounce, no spinner between the keystroke and the answer, and no request
// per keystroke to cancel. The catalogue itself is fetched once per page load
// (`loadSearchData`, shared by the header's overlay and the bottom bar's) and
// refreshed the next time the overlay opens after the tab has regained focus —
// long enough away that the merchant may have changed something.
//
// THE KEYBOARD, in full:
//   ↑ / ↓      move the highlight (`data-active`) through the rows. Focus stays
//              in the field, so the next keystroke still types — which is what
//              makes the highlight worth having.
//   Tab        lands on the highlighted row (roving `tabIndex`), not on all
//              eight in turn, then on its add button, then on "See all".
//   ↑ / ↓      from a focused row, move focus row to row; ↑ off the top goes
//              back to the field.
//   Enter      opens the highlighted row; with nothing highlighted it submits
//              the query to /search?q= and remembers it.
//   Escape     closes, and focus returns to whatever opened the overlay.
//              (Escape, the focus trap and the restore are `ui/Modal`'s.)
//
// GLASS BUDGET. `Modal size="full"` is one blurred layer over the scrim, and it
// raises `body[data-drawer-open]`, which is what makes the sticky header drop
// its own backdrop filter for as long as the overlay is up — two blurred layers
// at most, per DESIGN_SYSTEM §4.
//
// Props: `open`, `onClose` — unchanged, so Header and BottomNav mount it as
// they always have.
// =============================================================================

/** Rows in the overlay before it defers to the results page. */
const MAX_ROWS = 8;

/** Terms kept in the tab's recent list. */
const MAX_RECENT = 6;

// SESSION, not local, storage: a search history is a trail, and the visitor did
// not ask for one that outlives the tab. It is also why there is no "clear on
// every device" to build — closing the tab is the clear.
const RECENT_KEY = "lk-recent-searches";

// ---------------------------------------------------------------------------
// Recent searches
// ---------------------------------------------------------------------------

const readRecent = () => {
  try {
    const stored = window.sessionStorage.getItem(RECENT_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((row) => typeof row === "string") : [];
  } catch {
    // Private mode, a disabled store, a corrupted value — all the same answer.
    return [];
  }
};

const writeRecent = (terms) => {
  try {
    window.sessionStorage.setItem(RECENT_KEY, JSON.stringify(terms));
  } catch {
    /* the list is a convenience; losing it is not an error worth showing */
  }
  return terms;
};

/** Most recent first, case-insensitively deduped, capped. */
const rememberSearch = (query) => {
  const term = query.trim();
  if (!term) return readRecent();
  const rest = readRecent().filter((row) => row.toLowerCase() !== term.toLowerCase());
  return writeRecent([term, ...rest].slice(0, MAX_RECENT));
};

const forgetSearches = () => {
  try {
    window.sessionStorage.removeItem(RECENT_KEY);
  } catch {
    /* nothing to clear */
  }
  return [];
};

// ---------------------------------------------------------------------------
// Catalogue cache — module level, so the header's overlay and the bottom bar's
// share one fetch instead of one each.
// ---------------------------------------------------------------------------

let searchDataCache = null;
let searchDataPromise = null;
let searchDataStale = false;
let watchingFocus = false;

/**
 * Mark the cache stale when the tab comes back.
 *
 * NOT a refetch: the visitor is not necessarily searching, and a background tab
 * regaining focus is no reason to make a request. The next OPEN pays for it.
 * Registered on first use rather than on import, so a page that never opens the
 * overlay never installs a listener.
 */
const watchTabFocus = () => {
  if (watchingFocus || typeof window === "undefined") return;
  watchingFocus = true;
  const markStale = () => {
    if (!document.hidden) searchDataStale = true;
  };
  window.addEventListener("focus", markStale);
  document.addEventListener("visibilitychange", markStale);
};

/**
 * Products, categories and concerns, once per page load.
 *
 * A failed load clears the promise but KEEPS the last good cache: an overlay
 * that empties itself because one refresh timed out is worse than an overlay
 * showing a catalogue that is a few minutes old.
 */
const loadSearchData = () => {
  watchTabFocus();
  if (searchDataCache && !searchDataStale) return Promise.resolve(searchDataCache);
  if (!searchDataPromise) {
    searchDataPromise = Promise.all([
      apiService.products.getAll(),
      apiService.categories.getAll(),
      apiService.concerns.getAll(),
    ])
      .then(([products, categories, concerns]) => {
        searchDataCache = {
          products: Array.isArray(products) ? products : [],
          categories: Array.isArray(categories) ? categories : [],
          concerns: Array.isArray(concerns) ? concerns : [],
        };
        searchDataStale = false;
        searchDataPromise = null;
        return searchDataCache;
      })
      .catch((err) => {
        searchDataPromise = null; // allow a retry on the next open
        throw err;
      });
  }
  return searchDataPromise;
};

const EMPTY_DATA = { products: [], categories: [], concerns: [] };

// ---------------------------------------------------------------------------

const SearchModal = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const reduce = useReducedMotion();

  const inputRef = useRef(null);
  const listRef = useRef(null);
  const rowRefs = useRef([]);

  const headingId = useId();
  const listId = useId();

  const [query, setQuery] = useState("");
  const [data, setData] = useState(searchDataCache || EMPTY_DATA);
  const [ready, setReady] = useState(!!searchDataCache);
  const [failed, setFailed] = useState(false);
  const [recent, setRecent] = useState([]);
  // -1 is "the field itself": Enter submits the query rather than opening a row.
  const [activeIndex, setActiveIndex] = useState(-1);

  // ---- Data ---------------------------------------------------------------

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setRecent(readRecent());
    setFailed(false);
    loadSearchData()
      .then((loaded) => {
        if (!active) return;
        setData(loaded);
        setReady(true);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load search data:", err);
        // Settled, just empty-handed: `ready` flips either way so the overlay
        // resolves to a state instead of a permanent "Searching…".
        setReady(true);
        setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [open]);

  // The overlay is mounted for the life of the page (Header and BottomNav both
  // hold one), so closing has to reset it — otherwise it reopens mid-query.
  useEffect(() => {
    if (open) return;
    setQuery("");
    setActiveIndex(-1);
  }, [open]);

  // ---- Results ------------------------------------------------------------

  const trimmed = query.trim();
  const results = useMemo(
    () =>
      rankProducts(data.products, trimmed, {
        categories: data.categories,
        concerns: data.concerns,
      }),
    [data, trimmed]
  );
  const rows = results.slice(0, MAX_ROWS);

  const categories = useMemo(
    () =>
      (data.categories || [])
        .filter((category) => category && category.isActive !== false)
        .slice()
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [data.categories]
  );

  const popular = brand.search?.popular || [];
  const hasQuery = trimmed.length > 0;
  const searching = hasQuery && !ready;

  // A highlight that outlives the row it pointed at is a highlight pointing at
  // a different product, so every new query starts from the field again.
  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmed]);

  // Keep the highlighted row in the scrollport. `nearest` so a row that is
  // already visible does not scroll the list at all.
  useEffect(() => {
    if (activeIndex < 0) return;
    rowRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // ---- Actions ------------------------------------------------------------

  const openProduct = useCallback(
    (product) => {
      if (trimmed) setRecent(rememberSearch(trimmed));
      onClose?.();
      navigate(productPath(product));
    },
    [navigate, onClose, trimmed]
  );

  // `onClose` explicitly rather than leaning on Modal's close-on-navigation:
  // submitting from /search?q=a to /search?q=b changes no pathname, so nothing
  // would close the overlay over the results it just produced.
  const submitQuery = useCallback(
    (term) => {
      const value = (term || "").trim();
      if (!value) return;
      setRecent(rememberSearch(value));
      onClose?.();
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(value)}`);
    },
    [navigate, onClose]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const active = rows[activeIndex];
    if (active) openProduct(active.product);
    else submitQuery(query);
  };

  const handleQuickAdd = (product) => {
    // The button is disabled for an unpriced product, so this cannot build a
    // ₹0 line — and the cart drawer stays shut either way: the visitor is
    // mid-search, and a tray sliding over the results ends the search for them.
    // The confirmation is CartContext's existing toast.
    addToCart(buildCartItem(product), 1, { openDrawer: false });
  };

  /**
   * Move the highlight.
   *
   * `moveFocus` is what separates the two callers: from the field the highlight
   * moves alone (so typing continues), from a focused row the focus goes with
   * it — and off the top of the list it goes back to the field. Focusing a row
   * that is still `tabIndex={-1}` this render is fine: programmatic focus does
   * not care about the tab order, which is the whole reason -1 exists.
   */
  const moveActive = (delta, { moveFocus = false } = {}) => {
    if (!rows.length) return;
    const next = Math.min(activeIndex + delta, rows.length - 1);
    if (next < 0) {
      setActiveIndex(-1);
      if (moveFocus) inputRef.current?.focus();
      return;
    }
    setActiveIndex(next);
    if (moveFocus) rowRefs.current[next]?.focus();
  };

  const handleFieldKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    }
  };

  const handleListKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1, { moveFocus: true });
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1, { moveFocus: true });
    }
  };

  const handleTerm = (term) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleResultNavigate = () => {
    if (trimmed) setRecent(rememberSearch(trimmed));
    onClose?.();
  };

  // ---- Render -------------------------------------------------------------

  /** The one line the count is announced and shown on. "" while idle. */
  const statusLine = () => {
    if (!hasQuery) return "";
    if (searching) return "Searching…";
    if (!results.length) return `No results for “${trimmed}”`;
    return `${results.length} ${results.length === 1 ? "result" : "results"} for “${trimmed}”`;
  };

  const popularChips = (
    <ul className={styles.chips}>
      {popular.map((term) => (
        <li key={term}>
          <Chip variant="glass" as="button" onClick={() => handleTerm(term)}>
            {term}
          </Chip>
        </li>
      ))}
    </ul>
  );

  const renderRow = (entry, index) => {
    const product = entry.product;
    const buyable = isPriceKnown(product);
    const label = product.shortName || product.name;
    const thumb = stageSrc(product, { w: 112 });
    const isActive = index === activeIndex;
    // Roving tabIndex: exactly one row is in the tab order, and with nothing
    // highlighted it is the first — so Tab out of the field reaches the best
    // answer, not the eighth-best after seven presses.
    const rowTab = isActive || (activeIndex < 0 && index === 0) ? 0 : -1;

    return (
      <motion.li
        key={product.id}
        className={styles.row}
        data-active={isActive ? "true" : undefined}
        {...reveal(reduce, { index })}
      >
        <Link
          to={productPath(product)}
          className={styles.rowLink}
          ref={(node) => {
            rowRefs.current[index] = node;
          }}
          tabIndex={rowTab}
          onClick={handleResultNavigate}
          onFocus={() => setActiveIndex(index)}
        >
          <span className={`sf-plate ${styles.thumb}`}>
            {thumb ? <img src={thumb} alt="" loading="lazy" /> : null}
          </span>
          {/* A <div>, not a <span>: `Price` renders a block element, and an
              <a> inside an <li> may hold flow content while a <span> may not. */}
          <div className={styles.rowText}>
            <span className={styles.rowName}>{product.name}</span>
            {product.promise ? (
              <span className={styles.rowPromise}>{product.promise}</span>
            ) : null}
            {/* `live={false}`: this chip is created and destroyed with its
                row rather than changing in place, and eight live regions
                arriving at once would talk over the result count. */}
            <Price
              product={product}
              size="sm"
              live={false}
              className={styles.rowPrice}
            />
          </div>
        </Link>

        <Button
          variant="icon"
          size="sm"
          icon="mdi:cart-plus"
          className={styles.rowAdd}
          tabIndex={rowTab}
          disabled={!buyable}
          srLabel={buyable ? `Add ${label} to cart` : "Coming soon"}
          onClick={() => handleQuickAdd(product)}
        />
      </motion.li>
    );
  };

  return (
    <Modal
      open={!!open}
      onClose={onClose}
      size="full"
      showClose={false}
      labelledBy={headingId}
      initialFocus={inputRef}
      className={styles.modal}
    >
      <h2 id={headingId} className="sf-visually-hidden">
        Search products
      </h2>

      {/* ---- The field, and the way out ------------------------------------ */}
      <div className={styles.head}>
        <div className={styles.inner}>
          <div className={styles.topRow}>
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
                value={query}
                placeholder="Search products"
                aria-label="Search products"
                aria-controls={results.length ? listId : undefined}
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                enterKeyHint="search"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleFieldKeyDown}
              />
              {query ? (
                <Button
                  variant="icon"
                  size="sm"
                  icon="mdi:close"
                  srLabel="Clear search"
                  className={styles.clear}
                  onClick={handleClear}
                />
              ) : null}
            </form>
            <Button
              variant="icon"
              icon="mdi:close"
              srLabel="Close search"
              className={styles.close}
              onClick={onClose}
            />
          </div>

          {/* Always in the DOM, empty while idle: a live region created at the
              moment its text arrives is a live region that announces nothing. */}
          <p className={styles.count} role="status" aria-live="polite">
            {statusLine()}
          </p>
        </div>
      </div>

      {/* ---- Suggestions, or results --------------------------------------- */}
      <div className={styles.scroll}>
        <div className={styles.inner}>
          {!hasQuery ? (
            <div className={styles.idle}>
              <div className={styles.idleCol}>
                {popular.length ? (
                  <section className={styles.block}>
                    <h3 className={`sf-eyebrow ${styles.blockLabel}`}>
                      Popular searches
                    </h3>
                    {popularChips}
                  </section>
                ) : null}

                {recent.length ? (
                  <section className={styles.block}>
                    <div className={styles.blockHead}>
                      <h3 className={`sf-eyebrow ${styles.blockLabel}`}>Recent</h3>
                      <button
                        type="button"
                        className={styles.textBtn}
                        onClick={() => setRecent(forgetSearches())}
                      >
                        Clear
                      </button>
                    </div>
                    <ul className={styles.chips}>
                      {recent.map((term) => (
                        <li key={term}>
                          <Chip
                            variant="glass"
                            as="button"
                            onClick={() => handleTerm(term)}
                          >
                            {term}
                          </Chip>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>

              {categories.length ? (
                <section className={`${styles.block} ${styles.idleCol}`}>
                  <h3 className={`sf-eyebrow ${styles.blockLabel}`}>
                    Shop by category
                  </h3>
                  <ul className={styles.chips}>
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Chip
                          variant="glass"
                          as={Link}
                          to={categoryPath(category)}
                          className={styles.linkChip}
                          onClick={onClose}
                        >
                          {category.displayName || category.name}
                        </Chip>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : searching ? (
            <p className={styles.searching}>Searching…</p>
          ) : results.length ? (
            <>
              {/* `role="list"` restated on purpose: Safari drops the list
                  semantics of a <ul> whose `list-style` is none, which is every
                  list in this design system. eslint's redundant-role rule does
                  not know about that bug. */}
              {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
              <ul
                id={listId}
                ref={listRef}
                role="list"
                className={styles.rows}
                onKeyDown={handleListKeyDown}
              >
                {rows.map(renderRow)}
              </ul>

              <Link
                to={`${ROUTES.SEARCH}?q=${encodeURIComponent(trimmed)}`}
                className={styles.seeAll}
                onClick={handleResultNavigate}
              >
                See all {results.length} {results.length === 1 ? "result" : "results"}
                <Icon icon="mdi:arrow-right" aria-hidden="true" />
              </Link>

              {/* Desktop only (CSS): a phone has no keyboard to hint at. */}
              <p className={styles.hints} aria-hidden="true">
                ↑ ↓ to move · Enter to open · Esc to close
              </p>
            </>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>
                {failed
                  ? "Search is unavailable right now."
                  : `Nothing matched “${trimmed}”.`}
              </p>
              {!failed && popular.length ? (
                <>
                  <p className={styles.emptyHint}>Try one of these:</p>
                  {popularChips}
                </>
              ) : null}
              <Button variant="secondary" to={ROUTES.SHOP} onClick={onClose}>
                Browse all products
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SearchModal;
