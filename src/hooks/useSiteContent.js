import { useEffect, useState } from "react";
import apiService from "../services/api";

// =============================================================================
// useSiteContent — one read of the editorial record, shared by five pages
// =============================================================================
//
// `/about`, `/why-lamikaa`, `/faq`, `/contact` and `/policies/:policy` are all
// the same page in different clothes: fetch one section of `siteContent`, then
// typeset it. Prompt 22 already found what happens when every surface fetches
// for itself (fifteen requests for six collections on one paint of `/`), so the
// five content pages share this instead of each keeping a copy of the effect.
//
// TRI-STATE, the convention useHomeData established — because "not yet" and
// "not there" are different answers and a page renders differently for each:
//
//   undefined   the read is in flight    → the page shows its skeleton
//   null        missing or unreadable    → the page shows its empty state
//   value       an object                → the page renders
//
// `apiService.siteContent.get` never rejects (it answers `null` for a section
// that does not exist and `{}` for a record it could not read), so the only
// rejection path left is a broken build — which lands on `null` here like every
// other failure rather than escaping into the page's effect.
//
// ONE KEY OR THE WHOLE RECORD. A page that needs two sections (About and Why
// LAMIKAA both want `impact` alongside their own copy) calls this with no key
// and picks the two properties out of one response, which is one request rather
// than two.
//
// IN-FLIGHT DE-DUPLICATION ONLY, no cache: React 18's StrictMode mounts every
// effect twice in development and that is exactly the double read this map
// prevents, but a settled entry is dropped — an owner who edits the About copy
// in the admin and clicks back to the page must see today's words, not the ones
// this session first loaded.
// =============================================================================

/** Reads that have gone out and not yet settled, keyed by section (or ""). */
const inFlight = new Map();

const request = (key) => {
  const cacheKey = key || "";
  const pending = inFlight.get(cacheKey);
  if (pending) return pending;

  const promise = Promise.resolve()
    .then(() => apiService.siteContent.get(key))
    .finally(() => inFlight.delete(cacheKey));
  inFlight.set(cacheKey, promise);
  return promise;
};

/**
 * Read `siteContent`, or one section of it.
 *
 * @param {string} [key] a section key ("about", "policies", …). Omitted, the
 *                       whole record comes back in one request.
 * @returns {{content: object|null|undefined, loading: boolean}}
 */
export default function useSiteContent(key) {
  const [content, setContent] = useState(undefined);

  useEffect(() => {
    let alive = true;
    // A key change starts a new read, and the page goes back to its skeleton
    // rather than showing the previous section's copy under the new heading.
    setContent(undefined);

    request(key).then(
      (value) => {
        if (!alive) return;
        // A backend that answers with the wrong shape is a failed read, not an
        // empty section: a page must not print its "nothing here yet" state
        // because an endpoint returned a string.
        setContent(value && typeof value === "object" ? value : null);
      },
      (error) => {
        if (!alive) return;
        console.error("Failed to load site content:", error);
        setContent(null);
      }
    );

    return () => {
      alive = false;
    };
  }, [key]);

  return { content, loading: content === undefined };
}
