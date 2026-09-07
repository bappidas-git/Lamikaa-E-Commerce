import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDealsConfig } from "../../context/DealsConfigContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import apiService from "../../services/api";
import {
  POLICY_LAST_UPDATED,
  ROUTES,
  SUPPORT_HOURS,
} from "../../utils/constants";
import brand from "../../config/brand";
import { resolveOrNull } from "../../utils/placeholders";
import { isEmailValid } from "../../utils/helpers";
import Logo from "../brand/Logo";
import styles from "./Footer.module.css";

/**
 * Footer — the editorial close.
 *
 * Four bands on one deep ground, top to bottom:
 *   1. the invitation  — serif "Letters from LAMIKAA" + the newsletter row
 *   2. the grid        — white wordmark, brand statement, contact, 4 link columns
 *   3. the promises    — store-attested policy + accepted payment marks
 *   4. the colophon    — copyright and legal links in tiny tracked type
 *
 * The band is its own room rather than a tint of the page: its ground is
 * pinned to --sf-color-brand-green-deep, the deepest ground in the palette,
 * which storefront-tokens.css declares once in :root. Everything inside paints
 * from footer-scoped aliases (see Footer.module.css) built on that ground, so
 * legibility does not depend on what surrounds the band. No hardcoded hex and
 * no hardcoded type in here — the only
 * literal colours are the payment networks' own brand hexes, which are mandated
 * marks and must not be re-skinned.
 *
 * The newsletter contract is untouched: isEmailValid() gate →
 * apiService.leads.createNewsletter(email) → success / error state.
 */

// One wordmark on a transparent ground, so it sits straight on the deep band —
// the same <Logo> the masthead renders, usually straight from cache. The 48px
// slot in Footer.module.css decides the rendered height; the width/height <Logo>
// writes reserve the box and avoid CLS.
const LOGO_WIDTH = 190;

const EMAIL_INPUT_ID = "footer-newsletter-email";
const EMAIL_ERROR_ID = "footer-newsletter-error";

// Store-attested promises only. Every line here is written down elsewhere in the
// storefront — the 7-day window in RefundPolicy and the FAQ, the owner-mandated
// badge wording in brand.trustBadges. No ratings, no subscriber counts, and no
// "24/7 support" claim (SUPPORT_HOURS contradicts it).
//
// The free-shipping row carries `needsThreshold`: with no threshold set, the
// row is dropped rather than printed as "above ₹0".
const TRUST_ITEMS = [
  {
    id: "secure",
    label: "Secure payment",
    path: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  },
  {
    id: "returns",
    label: "7-day returns",
    path: "M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z",
  },
  {
    id: "shipping",
    // {amount} is filled in at render in the store's own currency — same idiom
    // and same constant as the AnnouncementBar, so the two figures can never
    // drift apart. Dropped entirely while the threshold is unknown.
    needsThreshold: true,
    label: "Free shipping above {amount}",
    path: "M18 18.5a1.5 1.5 0 001.5-1.5 1.5 1.5 0 00-1.5-1.5 1.5 1.5 0 00-1.5 1.5 1.5 1.5 0 001.5 1.5zM19.5 9.5h-3V12h4.46L19.5 9.5zM6 18.5A1.5 1.5 0 007.5 17 1.5 1.5 0 006 15.5 1.5 1.5 0 004.5 17 1.5 1.5 0 006 18.5zM20 8l3 4v5h-2c0 1.66-1.34 3-3 3s-3-1.34-3-3H9c0 1.66-1.34 3-3 3s-3-1.34-3-3H1V6c0-1.11.89-2 2-2h14v4h3zM3 6v9h.76c.55-.61 1.35-1 2.24-1 .89 0 1.69.39 2.24 1H15V6H3z",
  },
  {
    id: "farmer-owned",
    // Owner-mandated wording, configurable in brand.js (BRAND.md 3.9 rule 4).
    label: brand.trustBadges[0],
    path: "M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
  },
];

const Footer = () => {
  const { enabled: dealsEnabled } = useDealsConfig();
  // Wordmark label, brand line, contact block and the shipping figure all come
  // from the admin's Settings > General, so the close of every page states what
  // the store itself says.
  //
  // `socialLinks` is the same story for the marks below the wordmark: the admin
  // owns them in Settings > Social Links, and the list arrives already filtered
  // to the platforms that have a URL, in canonical order, each carrying its own
  // label and art. Clearing a link there takes its icon off this row rather than
  // leaving a dead one — exactly what blanking the old constant did.
  const {
    storeName,
    tagline,
    email: supportEmail,
    phone: supportPhone,
    address: supportAddress,
    emailHref,
    phoneHref,
    socialLinks,
  } = useStoreSettings();
  // The free-shipping promise is the one trust row that quotes a figure, and
  // that figure has exactly one home: `shipping_methods.freeAbove` in
  // Admin > Shipping, read live (the cart tray's meter does this — Prompt 12).
  // The retired constant is no longer consulted here; until Prompt 13 rebuilds
  // this band on the live read, the row is simply not rendered. An unknown
  // threshold is never promised, and `{amount}` therefore never reaches type.
  const trustItems = TRUST_ITEMS.filter((item) => !item.needsThreshold);

  // Contact fields the owner has not supplied yet are carried as {{TOKENS}}.
  // A row with nothing publishable behind it is not rendered — never printed
  // raw, and never left as an empty <dd> under its own label.
  const contactAddress = resolveOrNull(supportAddress);
  const contactEmail = resolveOrNull(supportEmail);
  const contactPhone = resolveOrNull(supportPhone);
  const contactHours = resolveOrNull(SUPPORT_HOURS);
  const hasContact =
    contactAddress || contactEmail || contactPhone || contactHours;
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState("idle"); // idle | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = email.trim();
    if (!isEmailValid(trimmed)) {
      setSubscribeStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.leads.createNewsletter(trimmed);
      setSubscribeStatus("success");
      setEmail("");
      // The success line replaces the form; reset back to the input after a few
      // seconds so a second visitor on the same screen can subscribe too.
      clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setSubscribeStatus("idle"), 6000);
    } catch {
      // Surface genuine failures instead of a fake "success". We still don't
      // reveal whether this address was already subscribed — the API returns a
      // uniform response for that — but a network/5xx error must not look like
      // a win, otherwise real failures stay invisible and nothing is recorded.
      setSubscribeStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Every target below resolves to a real route in App.js — nothing here falls
  // through to the 404. "Deals" / "Special Offers" share the deals hub and are
  // dropped when the admin disables it.
  //
  // Prompt 08 retired the two `?sort=` deep-links (New Arrivals, Best Sellers):
  // the LAMIKAA shop has no sort, so both resolved to the same page as "Shop
  // All" and the column repeated itself three times. Prompt 13 rebuilds the
  // footer around the new information architecture.
  const shopLinks = [
    { label: "Shop All", path: ROUTES.SHOP },
    { label: "Deals", path: ROUTES.SPECIAL_OFFERS, deals: true },
  ].filter((link) => dealsEnabled || !link.deals);

  // Company column — Our Story is the About page; Special Offers is deals-gated.
  const companyLinks = [
    { label: "Our Story", path: ROUTES.ABOUT },
    { label: "Special Offers", path: ROUTES.SPECIAL_OFFERS, deals: true },
    { label: "Wishlist", path: ROUTES.WISHLIST },
  ].filter((link) => dealsEnabled || !link.deals);

  // Support column — the FAQ covers shipping/FAQ topics; Returns maps to the
  // Shipping & Returns policy. All paths exist in App.js.
  const supportLinks = [
    { label: "Contact", path: ROUTES.CONTACT },
    { label: "FAQ", path: ROUTES.FAQ },
    { label: "Order Tracking", path: ROUTES.ORDERS },
    { label: "My Account", path: ROUTES.PROFILE },
    { label: "Returns & Exchange", path: ROUTES.POLICY_SHIPPING_RETURNS },
  ];

  // Legal column — exact paths that all resolve in App.js.
  const legalColumnLinks = [
    { label: "Privacy Policy", path: ROUTES.POLICY_PRIVACY },
    { label: "Terms of Service", path: ROUTES.POLICY_TERMS },
    { label: "Cookie Policy", path: ROUTES.POLICY_COOKIES },
    { label: "Shipping & Returns", path: ROUTES.POLICY_SHIPPING_RETURNS },
  ];

  const currentYear = new Date().getFullYear();

  const linkColumns = [
    { id: "shop", title: "Shop", links: shopLinks },
    { id: "company", title: "Company", links: companyLinks },
    { id: "support", title: "Support", links: supportLinks },
    { id: "legal", title: "Legal", links: legalColumnLinks },
  ];

  return (
    <footer className={styles.footer}>
      {/* ---------- 1. The invitation ---------- */}
      <div className={styles.invitation}>
        <div className={styles.container}>
          <div className={styles.invitationInner}>
            <div className={styles.invitationCopy}>
              <p className={styles.eyebrow}>Newsletter</p>
              <p className={styles.invitationTitle}>Letters from LAMIKAA</p>
              <p className={styles.invitationNote}>
                New arrivals, rituals and quiet offers — straight to your
                inbox.
              </p>
            </div>

            {subscribeStatus === "success" ? (
              <p className={styles.formSuccess} role="status">
                Thank you — you are on the list.
              </p>
            ) : (
              <form className={styles.form} onSubmit={handleSubscribe} noValidate>
                <label className={styles.srOnly} htmlFor={EMAIL_INPUT_ID}>
                  Email address
                </label>
                <div className={styles.field}>
                  <input
                    id={EMAIL_INPUT_ID}
                    type="email"
                    name="email"
                    autoComplete="email"
                    className={`${styles.input} ${
                      subscribeStatus === "error" ? styles.inputError : ""
                    }`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (subscribeStatus === "error") setSubscribeStatus("idle");
                    }}
                    disabled={isSubmitting}
                    aria-invalid={subscribeStatus === "error"}
                    aria-describedby={
                      subscribeStatus === "error" ? EMAIL_ERROR_ID : undefined
                    }
                  />
                  {/* The shared `.sf-btn` shape, with the footer's own primary
                      skin: `--emerald` is ink-on-ink here in light mode (the
                      CTA fill is the same near-black as this band), so the
                      module inverts it to ivory-on-ink instead. */}
                  <button
                    type="submit"
                    className={`sf-btn ${styles.submitBtn}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending" : "Subscribe"}
                  </button>
                </div>
                {subscribeStatus === "error" && (
                  <p className={styles.formError} id={EMAIL_ERROR_ID} role="alert">
                    {errorMsg}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ---------- 2. The grid ---------- */}
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.brandCol}>
              <Logo
                className={styles.logo}
                width={LOGO_WIDTH}
                alt={storeName}
              />
              <p className={styles.brandLine}>{tagline}</p>
              <p className={styles.brandNote}>{brand.legalNote}</p>

              {hasContact && (
                <dl className={styles.contact}>
                  {contactAddress && (
                    <>
                      <dt className={styles.contactLabel}>Address</dt>
                      <dd className={styles.contactValue}>{contactAddress}</dd>
                    </>
                  )}
                  {contactEmail && (
                    <>
                      <dt className={styles.contactLabel}>Write</dt>
                      <dd className={styles.contactValue}>
                        <a className={styles.contactLink} href={emailHref}>
                          {contactEmail}
                        </a>
                      </dd>
                    </>
                  )}
                  {contactPhone && (
                    <>
                      <dt className={styles.contactLabel}>Call</dt>
                      <dd className={styles.contactValue}>
                        <a className={styles.contactLink} href={phoneHref}>
                          {contactPhone}
                        </a>
                      </dd>
                    </>
                  )}
                  {contactHours && (
                    <>
                      <dt className={styles.contactLabel}>Hours</dt>
                      <dd className={styles.contactValue}>{contactHours}</dd>
                    </>
                  )}
                </dl>
              )}

              {socialLinks.length > 0 && (
                <div className={styles.social}>
                  {socialLinks.map((social) => (
                    <a
                      key={social.key}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={social.label}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        width="18"
                        height="18"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d={social.path} />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {linkColumns.map((col) => (
              <nav
                className={styles.linkCol}
                key={col.id}
                aria-labelledby={`footer-col-${col.id}`}
              >
                <h2 className={styles.colTitle} id={`footer-col-${col.id}`}>
                  {col.title}
                </h2>
                <ul className={styles.linkList}>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link to={link.path} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
      </div>

      {/* ---------- 3. The promises ---------- */}
      <div className={styles.trustBar}>
        <div className={styles.container}>
          <div className={styles.trustInner}>
            <ul className={styles.trustList}>
              {trustItems.map((item) => (
                <li className={styles.trustItem} key={item.id}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="16"
                    height="16"
                    className={styles.trustIcon}
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d={item.path} />
                  </svg>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>

            {/* The payment networks' own brand hexes are mandated marks and are
                the one documented exception to the tokens-only rule — they must
                not be re-skinned. The <text> nodes inherit the storefront font
                from .paymentBadge (see the module), so no font literal remains. */}
            <div className={styles.payments}>
              <span className={styles.paymentLabel}>We accept</span>
              <div className={styles.paymentIcons}>
                <span className={styles.paymentBadge}>
                  <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-label="Visa">
                    <rect width="48" height="32" rx="4" fill="#1A1F71" />
                    <text x="24" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">VISA</text>
                  </svg>
                </span>
                <span className={styles.paymentBadge}>
                  <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-label="Mastercard">
                    <rect width="48" height="32" rx="4" fill="#252525" />
                    <circle cx="19" cy="16" r="8" fill="#EB001B" />
                    <circle cx="29" cy="16" r="8" fill="#F79E1B" />
                    <path d="M24 10.34a8 8 0 010 11.32 8 8 0 000-11.32z" fill="#FF5F00" />
                  </svg>
                </span>
                <span className={styles.paymentBadge}>
                  <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-label="UPI">
                    <rect width="48" height="32" rx="4" fill="#EDEDED" />
                    <text x="24" y="20" textAnchor="middle" fill="#00897B" fontSize="11" fontWeight="bold">UPI</text>
                  </svg>
                </span>
                <span className={styles.paymentBadge}>
                  <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-label="Cash on delivery">
                    <rect width="48" height="32" rx="4" fill="#4CAF50" />
                    <text x="24" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">COD</text>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- 4. The colophon ---------- */}
      <div className={styles.bottomBar}>
        <div className={styles.container}>
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              &copy; {currentYear} {storeName}. All rights reserved.
              <span className={styles.policyDate}>
                {" "}
                Policies last updated {POLICY_LAST_UPDATED}.
              </span>
            </p>
            {/* Not a landmark. These three links are already the "Legal"
                column above, which is a <nav> named by its own <h2> — so this
                row was a second navigation landmark with the identical name,
                and a screen-reader user cycling landmarks met "Legal" twice
                with no way to tell them apart. The links stay; the duplicate
                signpost goes. */}
            <div className={styles.legalLinks}>
              <Link to={ROUTES.POLICY_TERMS} className={styles.legalLink}>
                Terms of Service
              </Link>
              <Link to={ROUTES.POLICY_PRIVACY} className={styles.legalLink}>
                Privacy Policy
              </Link>
              <Link to={ROUTES.POLICY_COOKIES} className={styles.legalLink}>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
