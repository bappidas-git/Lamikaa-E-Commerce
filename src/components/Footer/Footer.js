import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { useDealsConfig } from "../../context/DealsConfigContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import apiService from "../../services/api";
import { ROUTES, SUPPORT_HOURS } from "../../utils/constants";
import { categoryPath, ritualPath } from "../../utils/categories";
import brand from "../../config/brand";
import { resolveOrNull } from "../../utils/placeholders";
import { isEmailValid } from "../../utils/helpers";
import Logo from "../brand/Logo";
import LegalNote from "../brand/LegalNote";
import { Accordion, Button } from "../ui";
import styles from "./Footer.module.css";

// =============================================================================
// Footer — the LAMIKAA close
// =============================================================================
//
// FOUR BANDS on one `--sf-color-surface` room, under a gradient hairline:
//
//   1. INVITATION  the 220px wordmark, the master tagline and one signature
//                  line on the left; "Stay close to the farm" and the
//                  newsletter field on the right. A faint violet lamp sits
//                  behind it on desktop.
//   2. DIRECTORY   the farmer-ownership note in the wide first track, then
//                  four data-fed link columns: Shop by category (the seven
//                  categories the admin publishes), Rituals (the three the
//                  admin publishes), Company and Help.
//   3. ASSURANCES  the contact block, the social marks and the payment marks —
//                  every one of which hides itself while it has nothing real
//                  to say.
//   4. COLOPHON    BAOPCL's copyright, the brand-of line, the registration
//                  rows once they exist, and the policy micro-links.
//
// ONE GRID, TWICE. Bands 1 and 2 share `--sf-footer-grid`
// (`1.6fr repeat(4, 1fr)` on a desktop), so the newsletter starts exactly where
// the link columns start and the legal note sits exactly under the wordmark.
// The tracks collapse to 2×2 at 1024px and to one column at 480px, where the
// four headings become disclosures (`ui/Accordion`) so the close of the page
// stays scannable with a thumb.
//
// NOTHING IS INVENTED. The contact rows, the social marks and the GSTIN/CIN
// rows are rendered only once `resolveOrNull` says there is a publishable value
// behind them (utils/placeholders.js) — an unresolved fact costs no label, no
// hairline and no empty row, and a `{{TOKEN}}` never reaches type.
//
// THE NEWSLETTER CONTRACT IS UNCHANGED from the band this file replaces:
// `isEmailValid()` gate → `apiService.leads.createNewsletter(email)` → success
// or error, with the success line reverting to the field after six seconds so a
// second visitor on the same screen can subscribe too. The lead lands in
// Admin → Leads as a `newsletter` row.
//
// The ONLY literal colours in this file are the payment networks' own brand
// hexes. They are mandated marks that must not be re-skinned, and they are the
// documented exception to the tokens-only rule (DESIGN_SYSTEM.md §7).
// =============================================================================

const WORDMARK_WIDTH = 220;

const EMAIL_INPUT_ID = "footer-newsletter-email";
const EMAIL_ERROR_ID = "footer-newsletter-error";
const NEWSLETTER_NOTE_ID = "footer-newsletter-note";
const HEADING_ID = "footer-heading";

// The phone breakpoint at which the four columns become disclosures. Kept in
// step with the `max-width: 480px` block in Footer.module.css by hand — one
// number, two languages, and no way to express it once.
const PHONE_QUERY = "(max-width:480px)";

// "Bokakhat Agro Organic Producer Co. Ltd. (BAOPCL)" is the legal name as
// brand.js writes it; the copyright line wants the registered name on its own,
// and the sentence after it introduces the short form. Derived rather than
// retyped, so brand.js stays the single source (BRAND.md §3.9 rule 1).
//
// The name ALREADY ENDS IN A FULL STOP ("… Co. Ltd."), so the copyright line
// prints it and then "All rights reserved." with no punctuation of its own —
// otherwise the line reads "Co. Ltd.. All rights reserved." A legal name that
// does not end in one gets it added here instead.
const REGISTERED_NAME = brand.legalName.replace(/\s*\([^)]*\)\s*$/, "");
const COPYRIGHT_NAME = /\.$/.test(REGISTERED_NAME)
  ? REGISTERED_NAME
  : `${REGISTERED_NAME}.`;

// The four link columns' data comes from the same two reads the mega panel
// makes, cached at module level: the footer is mounted once by App.js and lives
// for the whole session, but a remount (a test, a future layout route) must not
// re-fetch what is already in hand. A failed load clears the promise so the
// next mount retries, and the columns keep their static entries meanwhile —
// "All products" and "Build your ritual" are never missing.
let footerDataCache = null;
let footerDataPromise = null;

export const loadFooterData = () => {
  if (footerDataCache) return Promise.resolve(footerDataCache);
  if (!footerDataPromise) {
    footerDataPromise = Promise.all([
      apiService.categories.getAll(),
      apiService.rituals.getAll(),
    ])
      .then(([categories, rituals]) => {
        footerDataCache = {
          categories: Array.isArray(categories) ? categories : [],
          rituals: Array.isArray(rituals) ? rituals : [],
        };
        return footerDataCache;
      })
      .catch((error) => {
        footerDataPromise = null; // allow a retry on the next mount
        throw error;
      });
  }
  return footerDataPromise;
};

const Footer = () => {
  const { enabled: dealsEnabled } = useDealsConfig();
  // Store name, tagline and the contact block are the admin's (Settings →
  // General); `socialLinks` arrives from Settings → Social Links already
  // filtered to the platforms that have a URL, in canonical order, each
  // carrying its own label and art. Clearing a link there takes its mark off
  // this row rather than leaving a dead one.
  const {
    storeName,
    email: supportEmail,
    phone: supportPhone,
    address: supportAddress,
    emailHref,
    phoneHref,
    socialLinks,
  } = useStoreSettings();

  const isPhone = useMediaQuery(PHONE_QUERY);

  const [data, setData] = useState(footerDataCache);

  useEffect(() => {
    let active = true;
    loadFooterData()
      .then((loaded) => {
        if (active) setData(loaded);
      })
      .catch(() => {
        // The static entries in each column stand on their own; a footer that
        // cannot reach the API is a shorter footer, not a broken one.
      });
    return () => {
      active = false;
    };
  }, []);

  // ---- Newsletter (contract unchanged) -----------------------------------
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

  // ---- The four columns ---------------------------------------------------
  // Categories and rituals are DATA: the admin publishes seven categories and
  // three rituals today, and the columns follow whatever it publishes tomorrow.
  // `categoryPath()` sends the "rituals" category to /rituals and every other
  // one to /category/<slug>, so the two columns can never disagree about where
  // a ritual lives.
  const categories = data?.categories || [];
  const rituals = data?.rituals || [];

  const columns = [
    {
      id: "categories",
      title: "Shop by category",
      links: [
        ...categories.map((cat) => ({
          key: `cat-${cat.id}`,
          label: cat.displayName || cat.name,
          path: categoryPath(cat),
        })),
        { key: "all-products", label: "All products", path: ROUTES.SHOP },
      ],
    },
    {
      id: "rituals",
      title: "Rituals",
      links: [
        ...rituals.map((ritual) => ({
          key: `ritual-${ritual.id}`,
          label: ritual.name,
          path: ritualPath(ritual),
        })),
        { key: "build-ritual", label: "Build your ritual", path: ROUTES.RITUALS },
      ],
    },
    {
      id: "company",
      title: "Company",
      links: [
        { key: "about", label: "Our Story", path: ROUTES.ABOUT },
        { key: "why", label: "Why LAMIKAA", path: ROUTES.WHY },
        { key: "impact", label: "Impact", path: `${ROUTES.WHY}#impact` },
        { key: "contact", label: "Contact", path: ROUTES.CONTACT },
        // Dropped entirely when the admin turns the deals page off, exactly as
        // the masthead and the mobile drawer drop it.
        ...(dealsEnabled
          ? [{ key: "offers", label: "Offers", path: ROUTES.SPECIAL_OFFERS }]
          : []),
      ],
    },
    {
      id: "help",
      title: "Help",
      links: [
        { key: "faq", label: "FAQ", path: ROUTES.FAQ },
        {
          key: "shipping",
          label: "Shipping & Returns",
          path: ROUTES.POLICY_SHIPPING_RETURNS,
        },
        { key: "privacy", label: "Privacy", path: ROUTES.POLICY_PRIVACY },
        { key: "terms", label: "Terms", path: ROUTES.POLICY_TERMS },
        { key: "cookies", label: "Cookies", path: ROUTES.POLICY_COOKIES },
        { key: "orders", label: "My Orders", path: ROUTES.ORDERS },
        { key: "wishlist", label: "Wishlist", path: ROUTES.WISHLIST },
      ],
    },
  ];

  const linkList = (column) => (
    <ul className={styles.linkList}>
      {column.links.map((link) => (
        <li key={link.key}>
          <Link to={link.path} className={styles.footerLink}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  // ---- Contact ------------------------------------------------------------
  // Fields the owner has not supplied yet are carried as {{TOKENS}}. A row with
  // nothing publishable behind it is not rendered — never printed raw, and
  // never left as an empty value under its own label.
  const contactAddress = resolveOrNull(supportAddress);
  const contactEmail = resolveOrNull(supportEmail);
  const contactPhone = resolveOrNull(supportPhone);
  const contactHours = resolveOrNull(SUPPORT_HOURS);
  const hasContact =
    contactAddress || contactEmail || contactPhone || contactHours;

  // ---- Registration rows --------------------------------------------------
  const gstin = resolveOrNull(brand.legal.gstin);
  const cin = resolveOrNull(brand.legal.cin);

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer} aria-labelledby={HEADING_ID}>
      {/* The whole transition from page to close: one signature seam. */}
      <div className="sf-hairline sf-hairline--gradient" aria-hidden="true" />

      {/* ---------- 1. The invitation ---------- */}
      <div className={`${styles.band} ${styles.invitation} sf-glow sf-glow--violet`}>
        <div className={`sf-container ${styles.grid}`}>
          <div className={styles.brandBlock}>
            {/* The wordmark is the heading, so the heading's text is the
                accessible name and the artwork itself is decorative — one
                announcement of the brand at the close of the page, not two. */}
            <h2 id={HEADING_ID} className="sf-visually-hidden">
              {storeName}
            </h2>
            <Logo
              variant="wordmark"
              width={WORDMARK_WIDTH}
              alt=""
              className={styles.wordmark}
            />
            <p className={styles.tagline}>{brand.tagline}</p>
            <p className={styles.signature}>{brand.signatureLines[3]}</p>
          </div>

          <div className={styles.newsletter}>
            <p className={styles.eyebrow}>Stay close to the farm</p>
            <p className={styles.newsletterNote} id={NEWSLETTER_NOTE_ID}>
              New products, farm stories and the occasional offer — no noise.
            </p>

            {subscribeStatus === "success" ? (
              <p className={styles.formSuccess} role="status">
                Thank you — you are on the list.
              </p>
            ) : (
              <form
                className={styles.form}
                onSubmit={handleSubscribe}
                noValidate
              >
                <label className="sf-visually-hidden" htmlFor={EMAIL_INPUT_ID}>
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
                      if (subscribeStatus === "error") {
                        setSubscribeStatus("idle");
                      }
                    }}
                    disabled={isSubmitting}
                    aria-invalid={subscribeStatus === "error"}
                    aria-describedby={
                      subscribeStatus === "error"
                        ? `${NEWSLETTER_NOTE_ID} ${EMAIL_ERROR_ID}`
                        : NEWSLETTER_NOTE_ID
                    }
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className={styles.submit}
                  >
                    {isSubmitting ? "Sending" : "Subscribe"}
                  </Button>
                </div>
                {subscribeStatus === "error" && (
                  <p
                    className={styles.formError}
                    id={EMAIL_ERROR_ID}
                    role="alert"
                  >
                    {errorMsg}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ---------- 2. The directory ---------- */}
      <div className={`${styles.band} ${styles.directory}`}>
        <div className={`sf-container ${styles.grid}`}>
          <LegalNote className={styles.legalNote} />

          {isPhone ? (
            // One accordion, four disclosures, multi-open and all closed: the
            // primitive owns aria-expanded / aria-controls, the region
            // labelling, the arrow-key roving between headers and the
            // visibility flip that takes a collapsed panel's links out of the
            // tab order. Four separate accordions would each carry their own
            // roving ring and four collapsed landmarks with them.
            <nav className={styles.disclosures} aria-label="Footer directory">
              <Accordion
                multiple
                headingLevel="h3"
                items={columns.map((column) => ({
                  id: column.id,
                  title: column.title,
                  content: linkList(column),
                }))}
              />
            </nav>
          ) : (
            columns.map((column) => (
              <nav
                key={column.id}
                className={styles.column}
                aria-labelledby={`footer-col-${column.id}`}
              >
                <h3 className={styles.eyebrow} id={`footer-col-${column.id}`}>
                  {column.title}
                </h3>
                {linkList(column)}
              </nav>
            ))
          )}
        </div>
      </div>

      {/* ---------- 3. Contact, social and payment ---------- */}
      <div className={`${styles.band} ${styles.assurances}`}>
        <div className={`sf-container ${styles.assurancesInner}`}>
          {(hasContact || socialLinks.length > 0) && (
            <div className={styles.reach}>
              {hasContact && (
                <address className={styles.contact}>
                  {contactAddress && (
                    <span className={styles.contactRow}>{contactAddress}</span>
                  )}
                  {contactEmail && (
                    <span className={styles.contactRow}>
                      <a className={styles.contactLink} href={emailHref}>
                        {contactEmail}
                      </a>
                    </span>
                  )}
                  {contactPhone && (
                    <span className={styles.contactRow}>
                      <a className={styles.contactLink} href={phoneHref}>
                        {contactPhone}
                      </a>
                    </span>
                  )}
                  {contactHours && (
                    <span className={styles.contactRow}>{contactHours}</span>
                  )}
                </address>
              )}

              {socialLinks.length > 0 && (
                <ul className={styles.social}>
                  {socialLinks.map((social) => (
                    <li key={social.key}>
                      <a
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
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* The payment networks' own brand hexes are mandated marks and the
              one documented exception to the tokens-only rule — they must not
              be re-skinned. The <text> nodes inherit the storefront face from
              .paymentMark (see the module), so no font literal remains, and the
              row is held at 60% opacity so it reads as a footnote. */}
          <div className={styles.payments}>
            <span className={styles.paymentLabel}>We accept</span>
            <div className={styles.paymentMarks}>
              <span className={styles.paymentMark}>
                <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-label="Visa">
                  <rect width="48" height="32" rx="4" fill="#1A1F71" />
                  <text x="24" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">VISA</text>
                </svg>
              </span>
              <span className={styles.paymentMark}>
                <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-label="Mastercard">
                  <rect width="48" height="32" rx="4" fill="#252525" />
                  <circle cx="19" cy="16" r="8" fill="#EB001B" />
                  <circle cx="29" cy="16" r="8" fill="#F79E1B" />
                  <path d="M24 10.34a8 8 0 010 11.32 8 8 0 000-11.32z" fill="#FF5F00" />
                </svg>
              </span>
              <span className={styles.paymentMark}>
                <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-label="UPI">
                  <rect width="48" height="32" rx="4" fill="#EDEDED" />
                  <text x="24" y="20" textAnchor="middle" fill="#00897B" fontSize="11" fontWeight="bold">UPI</text>
                </svg>
              </span>
              <span className={styles.paymentMark}>
                <svg viewBox="0 0 48 32" width="40" height="26" role="img" aria-label="Cash on delivery">
                  <rect width="48" height="32" rx="4" fill="#4CAF50" />
                  <text x="24" y="20" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">COD</text>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- 4. The colophon ----------
          Deliberately NOT a landmark: the four policy links below are already
          the Help column above, which is a <nav> named by its own heading, and
          a second navigation landmark with the same links is one more thing to
          cycle past for no new destination. */}
      <div className={styles.colophon}>
        <div className={`sf-container ${styles.colophonInner}`}>
          <div className={styles.copyright}>
            <p className={styles.copyLine}>
              &copy; {currentYear} {COPYRIGHT_NAME} All rights reserved.
            </p>
            <p className={styles.copyLine}>
              {brand.name} is a brand of {brand.legalShort}.
            </p>
            {/* Registration rows appear the day the owner supplies them and
                cost nothing until then. */}
            {gstin && <p className={styles.copyLine}>GSTIN {gstin}</p>}
            {cin && <p className={styles.copyLine}>CIN {cin}</p>}
          </div>

          <div className={styles.microLinks}>
            <Link to={ROUTES.POLICY_PRIVACY} className={styles.microLink}>
              Privacy
            </Link>
            <Link to={ROUTES.POLICY_TERMS} className={styles.microLink}>
              Terms
            </Link>
            <Link to={ROUTES.POLICY_COOKIES} className={styles.microLink}>
              Cookies
            </Link>
            <Link
              to={ROUTES.POLICY_SHIPPING_RETURNS}
              className={styles.microLink}
            >
              Shipping &amp; Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
