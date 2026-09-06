import React from "react";

// The LAMIKAA palette mirrored here as literals on purpose: this boundary must
// render even when the provider tree (and the stylesheet that declares the
// --sf-* tokens) failed to mount, so it cannot rely on var(--sf-*). There is
// one theme, so there is one palette and nothing to resolve at runtime.
//
// SYNC SOURCE: src/theme/storefront-tokens.css — each literal below is the
// resolved value of the --sf-* token named in its comment. Re-copy them
// whenever that file's palette changes; nothing here updates automatically.
const palette = {
  bg: "#0B0B0D", // --sf-color-bg
  card: "#141416", // --sf-color-surface
  border: "rgba(255, 255, 255, 0.08)", // --sf-color-border
  heading: "#F7F5F0", // --sf-color-text
  text: "#B8B5B0", // --sf-color-text-secondary
  detailsBg: "#1C1C20", // --sf-color-surface-2
  detailsText: "#FF8A80", // --sf-color-danger
  primaryBg: "#F5D76E", // --sf-color-emerald (the gold CTA fill)
  primaryText: "#0B0B0D", // --sf-color-emerald-contrast
  ghostBorder: "#B88924", // --sf-color-gold-deep
  ghostText: "#F7F5F0", // --sf-color-text
  shadow: "0 20px 60px rgba(0, 0, 0, 0.5)", // --sf-shadow-2
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("=== CAUGHT ERROR ===", error);
    console.error("Component stack:", info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    // Full navigation resets the broken React tree, even outside the Router.
    window.location.assign("/");
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    // Pill button, uppercase, wide tracking — the inline twin of `.sf-btn`
    // in storefront-primitives.css.
    const btnBase = {
      padding: "14px 28px",
      minHeight: "44px", // --sf-tap-target
      borderRadius: "999px", // --sf-radius-pill
      fontSize: "0.75rem", // --sf-text-xs
      fontWeight: 500, // --sf-font-medium
      textTransform: "uppercase",
      letterSpacing: "0.14em", // --sf-tracking-wide
      cursor: "pointer",
      transition: "background-color 0.32s cubic-bezier(0.2, 0.7, 0.2, 1)",
      fontFamily: "inherit",
    };

    return (
      <div
        role="alert"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: palette.bg,
          // --sf-font-family. Spelled out, not var(): this boundary has to
          // render when the app has failed, and a failure early enough to take
          // the stylesheet with it would leave a var() unresolved.
          fontFamily:
            '"Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            background: palette.card,
            border: `1px solid ${palette.border}`,
            borderRadius: "14px", // --sf-radius-md
            padding: "48px 32px",
            textAlign: "center",
            boxShadow: palette.shadow,
          }}
        >
          <div style={{ fontSize: "44px", lineHeight: 1, marginBottom: "20px" }}>
            <span role="img" aria-label="warning">
              ⚠️
            </span>
          </div>
          <h1
            style={{
              margin: "0 0 12px",
              // --sf-font-display / --sf-leading-display
              fontFamily:
                '"Fraunces", "Playfair Display", Georgia, "Times New Roman", serif',
              fontSize: "2.25rem",
              fontWeight: 500,
              lineHeight: 1.12,
              color: palette.heading,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              margin: "0 0 32px",
              fontSize: "1rem",
              lineHeight: 1.7, // --sf-leading-relaxed
              color: palette.text,
            }}
          >
            An unexpected error occurred while rendering this page. You can try
            reloading, or head back to the homepage.
          </p>

          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                ...btnBase,
                border: `1px solid ${palette.primaryBg}`,
                color: palette.primaryText,
                background: palette.primaryBg,
              }}
            >
              Reload Page
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              style={{
                ...btnBase,
                background: "transparent",
                color: palette.ghostText,
                border: `1px solid ${palette.ghostBorder}`,
              }}
            >
              Go Home
            </button>
          </div>

          {this.state.error && (
            <details
              style={{
                marginTop: "28px",
                textAlign: "left",
                color: palette.text,
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  userSelect: "none",
                }}
              >
                Error details
              </summary>
              <pre
                style={{
                  marginTop: "12px",
                  padding: "16px",
                  borderRadius: "8px", // --sf-radius-sm
                  background: palette.detailsBg,
                  color: palette.detailsText,
                  fontSize: "0.8rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "240px",
                  overflow: "auto",
                }}
              >
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
