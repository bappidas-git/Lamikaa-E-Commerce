// =============================================================================
// alerts.js — SweetAlert, loaded when something is actually said
// =============================================================================
//
// `fireAlert(options)` is `Swal.fire(options)` with one difference: the library
// is fetched the first time an alert is shown rather than bundled into the
// code that might one day show one. The promise it returns is SweetAlert's own
// result promise, so a call site that awaits a confirmation
// (`const { isConfirmed } = await fireAlert({...})`) reads exactly as before.
//
// WHY (Prompt 38). Four contexts — auth, cart, wishlist, orders — mount on
// every storefront route, and each imported `sweetalert2` at the top of the
// file. That put 79 kB of parsed JavaScript into the EAGER main bundle for a
// library whose every use is a reaction to something a visitor does: a toast
// after Add to Cart, a confirmation before emptying a wishlist, an error after
// a failed sign-in. None of it is needed to paint the page, and all of it was
// downloaded, parsed and evaluated before the page could paint. Lighthouse
// measured the main bundle as ~42% unused on first load, and script evaluation
// as the single largest slice of main-thread work.
//
// One `import()` moves the whole library to a chunk fetched on first use.
// After that the module cache serves it, so the second toast costs nothing —
// and `loading` is memoised, so ten simultaneous calls share one fetch.
//
// THE LOAD CANNOT FAIL LOUDLY. An alert is how the app reports things; if the
// chunk itself does not arrive (offline, a stale deploy) the right behaviour is
// to log and resolve, never to throw an unhandled rejection into a click
// handler that had nothing to do with SweetAlert. The resolved value then
// mirrors a dismissed dialog, which is the safe answer for `isConfirmed`.
// =============================================================================

/** The in-flight (or settled) import, so the library is fetched exactly once. */
let loading = null;

/** SweetAlert's shape for "the visitor did not confirm". */
const DISMISSED = { isConfirmed: false, isDenied: false, isDismissed: true };

/**
 * The SweetAlert module, fetched on first use.
 * @returns {Promise<object|null>} the default export, or null if it could not load
 */
const loadSwal = () => {
  if (!loading) {
    loading = import("sweetalert2")
      .then((module) => module.default)
      .catch((error) => {
        console.error("Failed to load the alert library:", error);
        // Do not cache the failure: a later call may well succeed.
        loading = null;
        return null;
      });
  }
  return loading;
};

/**
 * Show a SweetAlert.
 *
 * @param {object} options  SweetAlert's own options, unchanged
 * @returns {Promise<object>} SweetAlert's result, or a dismissed result when
 *          the library could not be loaded
 */
export const fireAlert = (options) =>
  loadSwal().then((Swal) => (Swal ? Swal.fire(options) : DISMISSED));

/**
 * Close whatever alert is open, if the library has been loaded at all.
 * A no-op before the first alert — there is nothing open to close.
 */
export const closeAlert = () => {
  if (loading) loading.then((Swal) => Swal && Swal.close());
};

export default fireAlert;
