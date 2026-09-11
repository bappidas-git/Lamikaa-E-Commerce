import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import reportWebVitals from "./reportWebVitals";

// =============================================================================
// PRE-MOUNT CRASH SCREEN
// =============================================================================
//
// The last line of defence: a failure BEFORE React mounts, or outside its tree,
// never reaches <ErrorBoundary>. It used to paint red or orange monospace on
// #1a1a2e — the boilerplate's navy, a colour this design system does not own —
// under a developer's heading ("JS Error (window.onerror)"). A visitor who hits
// it should see the storefront's own dark ground and neutral wording, with the
// technical detail folded away for whoever needs it.
//
// LITERALS ON PURPOSE, same exception as ErrorBoundary: this paints when the
// bundle failed, so it cannot rely on var(--sf-*) resolving. Each value below
// is the resolved token from src/theme/storefront-tokens.css — re-copy them if
// that palette moves.
const CRASH = {
  bg: "#17120F", // --sf-color-bg
  card: "#201A15", // --sf-color-surface
  detailsBg: "#29221B", // --sf-color-surface-2
  border: "rgba(247, 243, 234, 0.10)", // --sf-color-border
  heading: "#F7F5F0", // --sf-color-text
  text: "#BDB5A8", // --sf-color-text-secondary
  detail: "#FF8A80", // --sf-color-danger
  shadow: "0 20px 60px rgba(23, 15, 6, 0.45)", // --sf-shadow-2
  body: '"Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif', // --sf-font-family
  display:
    '"Fraunces", "Playfair Display", Georgia, "Times New Roman", serif', // --sf-font-display
};

/** Escape before it goes near innerHTML — the detail is an untrusted message. */
const escapeHtml = (value) =>
  String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/**
 * Paint the crash screen, but only into an empty #root: once React has rendered
 * anything, ErrorBoundary owns the failure and this must not overwrite it.
 */
const paintCrashScreen = (detail) => {
  const el = document.getElementById("root");
  if (!el || el.hasChildNodes()) return;

  el.innerHTML =
    '<div role="alert" style="min-height:100vh;display:flex;align-items:center;' +
    "justify-content:center;padding:24px;background:" +
    CRASH.bg +
    ";font-family:" +
    escapeHtml(CRASH.body) +
    '">' +
    '<div style="width:100%;max-width:520px;background:' +
    CRASH.card +
    ";border:1px solid " +
    CRASH.border +
    ";border-radius:14px;padding:48px 32px;text-align:center;box-shadow:" +
    CRASH.shadow +
    '">' +
    '<h1 style="margin:0 0 12px;font-family:' +
    escapeHtml(CRASH.display) +
    ";font-size:2.25rem;font-weight:500;line-height:1.12;color:" +
    CRASH.heading +
    '">Something went wrong</h1>' +
    '<p style="margin:0 0 8px;font-size:1rem;line-height:1.7;color:' +
    CRASH.text +
    '">This page could not be loaded. Reloading usually fixes it.</p>' +
    (detail
      ? '<details style="margin-top:28px;text-align:left;color:' +
        CRASH.text +
        '">' +
        '<summary style="cursor:pointer;font-size:0.85rem;font-weight:600">Error details</summary>' +
        '<pre style="margin-top:12px;padding:16px;border-radius:8px;background:' +
        CRASH.detailsBg +
        ";color:" +
        CRASH.detail +
        ";font-size:0.8rem;white-space:pre-wrap;word-break:break-word;" +
        'max-height:240px;overflow:auto">' +
        escapeHtml(detail) +
        "</pre></details>"
      : "") +
    "</div></div>";
};

// Any JS error thrown before or outside React's tree.
window.onerror = function (msg, src, line, col, error) {
  paintCrashScreen(error && error.stack ? error.stack : msg);
};

window.addEventListener("unhandledrejection", function (event) {
  paintCrashScreen(event.reason);
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Signal that React has mounted so the HTML loading screen (public/index.html)
// can fade out. Tying this to the actual mount — rather than an arbitrary
// timer — prevents a flash of unstyled content while React boots, and the
// loader's own fallback timeout guarantees it can never get stuck visible.
if (typeof window !== "undefined") {
  requestAnimationFrame(() => {
    document.body.classList.add("react-loaded");
  });
}
// reportWebVitals();
