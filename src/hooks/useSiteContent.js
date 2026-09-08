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
//
// REFETCH ON FOCUS (Prompt 34) — the same contract StoreSettingsContext and
// FaqContext already have, and the reason Admin → Content needs no live channel
// to the storefront: an owner edits the About lede in one tab, returns to the
// storefront tab, and the page they left open is reading today's words. The
// admin also fires `site-content:updated` after a save, which refetches a
// storefront open in the SAME tab (a second window, an iframe) without waiting
// for a focus event.
//
// Both are cheap: one GET of a record the API already serves to every content
// page, and only while such a page is mounted.
// =============================================================================

export const SITE_CONTENT_UPDATED_EVENT = "site-content:updated";

/** Fired by Admin → Content after a successful save. */
export const notifySiteContentUpdated = () => {
  window.dispatchEvent(new CustomEvent(SITE_CONTENT_UPDATED_EVENT));
};

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

    // `skeleton: false` is what a refetch passes: the page is already reading
    // the previous words and must not blink back to its skeleton to replace
    // them with the same ones.
    const read = ({ skeleton }) => {
      if (skeleton) setContent(undefined);
      request(key).then(
        (value) => {
          if (!alive) return;
          // A backend that answers with the wrong shape is a failed read, not
          // an empty section: a page must not print its "nothing here yet"
          // state because an endpoint returned a string.
          setContent(value && typeof value === "object" ? value : null);
        },
        (error) => {
          if (!alive) return;
          console.error("Failed to load site content:", error);
          // A failed REFETCH keeps the words already on the page; only the
          // first read has nothing to fall back to.
          if (skeleton) setContent(null);
        }
      );
    };

    // A key change starts a new read, and the page goes back to its skeleton
    // rather than showing the previous section's copy under the new heading.
    read({ skeleton: true });

    const refresh = () => read({ skeleton: false });
    window.addEventListener("focus", refresh);
    window.addEventListener(SITE_CONTENT_UPDATED_EVENT, refresh);

    return () => {
      alive = false;
      window.removeEventListener("focus", refresh);
      window.removeEventListener(SITE_CONTENT_UPDATED_EVENT, refresh);
    };
  }, [key]);

  return { content, loading: content === undefined };
}
