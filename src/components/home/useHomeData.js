import { useEffect, useMemo, useState } from "react";
import apiService from "../../services/api";

// =============================================================================
// useHomeData — the home page's ONE read of the catalogue
// =============================================================================
//
// Prompts 14–21 each built their section as a self-contained unit that fetched
// what it needed on mount. That was right while the sections were being built
// one at a time and wrong the moment they were assembled: on a single paint of
// `/` the page issued
//
//   products.getAll()      ×3   (showcase fallback, rituals teaser, recently viewed)
//   products.getHeroProducts() ×4 (hero, showcase, shop-by-category, spotlight)
//   categories.getAll()    ×1
//   concerns.getAll()      ×1
//   rituals.getAll()       ×2   (shop-by-category, rituals teaser)
//   siteContent.get("home") ×3  (about teaser, spotlight, full-page CTA)
//   siteContent.get("impact") ×1
//
// — fifteen requests for six collections. This hook is the fix Prompt 22 asks
// for: every collection is read ONCE, all six reads go out in parallel from the
// page's first effect, and the sections take their slices as PROPS. Home.js is
// the only caller.
//
// TRI-STATE VALUES, because "not yet" and "not there" are different answers and
// a section renders differently for each. This is the convention AboutTeaser
// and WhyLamikaaSection already used for their content block, lifted to the
// whole page:
//
//   undefined   still in flight        → the section shows its skeleton
//   null        the read failed        → the section takes itself off the page
//   value       an array or an object  → the section renders
//
// SITE CONTENT IS ONE REQUEST, not four. `siteContent.get()` with no key
// answers the whole record, so `home` and `impact` are two properties of one
// response rather than two round trips — and the three sections that each
// wanted `home` now share it.
//
// NO CROSS-MOUNT CACHE. The map below de-duplicates requests that are IN FLIGHT
// (React 18 StrictMode mounts every effect twice in development, and that is
// exactly the double-read this hook exists to prevent); a settled entry is
// dropped. Leaving results cached for the session would mean an owner editing a
// product in the admin and returning to `/` saw yesterday's page, which is a
// freshness regression the old per-section fetches did not have.
//
// NO `useAsync`. Prompt 22 names a `useAsync`/cache helper "from Prompt 05";
// Prompt 05 shipped three hooks — `useInView`, `useFocusTrap`, `useScrollLock`
// — and no async helper, and `api.js` has no request cache either. Rather than
// invent a general-purpose one for a single caller, the orchestration lives
// here, where the tri-state contract it exists to serve is also written down.
// (Logged in PROGRESS.md.)
// =============================================================================

/**
 * The six reads, by the name each one is returned under.
 *
 * Every function here must resolve rather than reject for an EXPECTED empty
 * answer (`siteContent.get` already does); a rejection is a real failure and
 * lands the key on `null`.
 */
const LOADERS = {
  products: () => apiService.products.getAll(),
  heroProducts: () => apiService.products.getHeroProducts(),
  categories: () => apiService.categories.getAll(),
  concerns: () => apiService.concerns.getAll(),
  rituals: () => apiService.rituals.getAll(),
  siteContent: () => apiService.siteContent.get(),
};

const KEYS = Object.keys(LOADERS);

/** Requests that have gone out and not yet settled, so a second mount joins. */
const inFlight = new Map();

const request = (key) => {
  const pending = inFlight.get(key);
  if (pending) return pending;

  // Started inside a `then` so a loader that throws SYNCHRONOUSLY (a missing
  // api module, a bad build) lands on the promise's rejection path like every
  // other failure, instead of escaping into the page's effect.
  const promise = Promise.resolve()
    .then(() => LOADERS[key]())
    .finally(() => {
      // Settled — the next mount of the page reads the collection again.
      inFlight.delete(key);
    });
  inFlight.set(key, promise);
  return promise;
};

/** Every key in flight. The state this hook starts in, and its loading test. */
const PENDING = KEYS.reduce((acc, key) => ({ ...acc, [key]: undefined }), {});

/**
 * Load everything the home page's sections read, once.
 *
 * @returns {{
 *   products:      object[]|null|undefined,
 *   heroProducts:  object[]|null|undefined,
 *   categories:    object[]|null|undefined,
 *   concerns:      object[]|null|undefined,
 *   rituals:       object[]|null|undefined,
 *   homeContent:   object|null|undefined,
 *   impactContent: object|null|undefined,
 *   loading:       boolean,
 *   error:         Error|null,
 * }}
 */
export default function useHomeData() {
  const [slices, setSlices] = useState(PENDING);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let alive = true;

    KEYS.forEach((key) => {
      request(key).then(
        (value) => {
          if (!alive) return;
          // An endpoint that answers with the wrong shape is a failed read, not
          // an empty collection — a section must not print "nothing here yet"
          // because a backend returned a string.
          const ok = key === "siteContent" ? value && typeof value === "object" : Array.isArray(value);
          setSlices((prev) => ({ ...prev, [key]: ok ? value : null }));
        },
        (error) => {
          if (!alive) return;
          setSlices((prev) => ({ ...prev, [key]: null }));
          setErrors((prev) => ({ ...prev, [key]: error }));
        }
      );
    });

    return () => {
      alive = false;
    };
  }, []);

  return useMemo(() => {
    const keys = Object.keys(errors);
    return {
      products: slices.products,
      heroProducts: slices.heroProducts,
      categories: slices.categories,
      concerns: slices.concerns,
      rituals: slices.rituals,
      // The two blocks the content sections read, split out of the one record.
      // `undefined` while the record is in flight, `null` when it failed or the
      // owner has not written that block — the same answer, and the same thin
      // fallback, as before.
      homeContent:
        slices.siteContent === undefined
          ? undefined
          : slices.siteContent?.home ?? null,
      impactContent:
        slices.siteContent === undefined
          ? undefined
          : slices.siteContent?.impact ?? null,
      loading: KEYS.some((key) => slices[key] === undefined),
      // The first failure, for a caller that wants to know the page is degraded.
      // No section uses it to render an error panel: a home page missing one of
      // its bands is still a home page, and an error box where a spread should
      // be is louder than the loss.
      error: keys.length > 0 ? errors[keys[0]] : null,
    };
  }, [slices, errors]);
}
