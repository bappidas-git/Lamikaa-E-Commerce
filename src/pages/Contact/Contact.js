import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import Pillars from "../../components/brand/Pillars";
import { Button, GlassCard } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import { useStoreSettings } from "../../context/StoreSettingsContext";
import apiService from "../../services/api";
import useSeo from "../../hooks/useSeo";
import useSiteContent from "../../hooks/useSiteContent";
import { ROUTES } from "../../utils/constants";
import { isEmailValid, isValidPhone } from "../../utils/helpers";
import { resolveOrNull } from "../../utils/placeholders";
import styles from "./Contact.module.css";

// =============================================================================
// /contact — the care desk, written as a page
// =============================================================================
//
// Where `/faq` is a book you look something up in, this is a letter you write.
// The page has three parts: the ways in, the letter, and a rail of the things
// somebody standing here usually wants next.
//
// THE API CONTRACT IS UNCHANGED, and that is the point of this rewrite being a
// RESTYLE rather than a rebuild. `apiService.leads.createContact(formData)`
// still receives the same seven keys it always has — including the two the form
// never shows, `orderNumber` (blank from this surface) and `category:
// "general"` — so a message written here lands in Admin → Leads beside the
// seeded rows with the same shape. The validation is the same too: name,
// a well-formed email, an optional phone checked only once something is typed
// into it, a subject, and a message of at least MESSAGE_MIN characters, with
// focus moved to the first field that failed.
//
// NOTHING ON THIS PAGE CLAIMS ANYTHING THE STORE CANNOT EVIDENCE. There is no
// rating, no customer count, no "average response in X hours" and no "online"
// badge — nothing in this application knows whether anyone is at the desk. The
// one availability statement is `siteContent.contact.hoursNote`, and while that
// is still a `{{SUPPORT_HOURS}}` placeholder the sentence that would quote it
// is not written at all.
//
// A CHANNEL WITH NO ADDRESS IS NOT A CHANNEL. Email, phone and WhatsApp are
// read from Admin → Settings (General and Social Links), where
// `normalizeStoreSettings` has already blanked every unresolved token, so a
// card whose href would be `mailto:` or `https://{{…}}` is simply not rendered.
// The same rule governs the Visit card and its Maps link.
//
// THE RAIL IS THE BRAND'S OWN FURNITURE — `Pillars compact` reading
// `brand.pillars`, the social marks the admin has filled in, and the way
// through to the FAQ. It is not copy this file wrote.
// =============================================================================

// A message has to say something — the same floor the old form enforced.
const MESSAGE_MIN = 20;

// The payload the API expects, in full. `orderNumber` and `category` are never
// shown on this surface and are always sent: Admin → Leads and the seeded rows
// both read them.
const EMPTY_LEAD = {
  name: "",
  email: "",
  phone: "",
  orderNumber: "",
  category: "general",
  subject: "",
  message: "",
};

/**
 * The three ways in, built from the store's own contact details. WhatsApp is
 * only offered when a URL exists; an empty entry drops the card rather than
 * printing a dead one.
 *
 * Ported from the page this replaces, notes and all — with the note copy
 * rewritten for the LAMIKAA range.
 */
export const buildChannels = ({ phone, email, phoneHref, emailHref, whatsappUrl }) =>
  [
    {
      key: "email",
      icon: "mdi:email-outline",
      label: "Email",
      value: email,
      note: "For anything that needs a considered answer",
      href: email ? emailHref : "",
      external: false,
    },
    {
      key: "call",
      icon: "mdi:phone-outline",
      label: "Call",
      value: phone,
      note: "Speak to the care desk",
      href: phone ? phoneHref : "",
      external: false,
    },
    {
      key: "whatsapp",
      icon: "mdi:whatsapp",
      label: "WhatsApp",
      value: "Start a chat",
      note: "Send a photograph of the product you are asking about",
      href: whatsappUrl,
      external: true,
    },
  ].filter((channel) => !!channel.href);

const Contact = () => {
  useSeo({
    title: "Contact",
    description:
      "Talk to the LAMIKAA Naturals care desk about an order, a product or the farmer-owned enterprise behind the brand.",
  });

  const { content } = useSiteContent("contact");
  const { user } = useAuth();
  const {
    email: supportEmail,
    phone: supportPhone,
    address: supportAddress,
    emailHref,
    phoneHref,
    social,
    socialLinks,
  } = useStoreSettings();

  // The desk's hours are the record's, and are a placeholder until the owner
  // supplies them — unresolved, every clause that would quote them is dropped.
  const supportHours = resolveOrNull(content?.hoursNote);

  const channels = buildChannels({
    phone: supportPhone,
    email: supportEmail,
    phoneHref,
    emailHref,
    whatsappUrl: social.whatsapp,
  });

  const mapsUrl = supportAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        supportAddress
      )}`
    : "";

  const [formData, setFormData] = useState(EMPTY_LEAD);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const sentRef = useRef(null);

  // Pre-fill the email for a signed-in visitor once auth resolves, without
  // overwriting anything already typed.
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => (prev.email ? prev : { ...prev, email: user.email }));
    }
  }, [user]);

  // The success panel replaces the form in place; move focus to it so a
  // keyboard visitor is not dropped onto <body> when the button disappears.
  useEffect(() => {
    if (isSubmitted) sentRef.current?.focus();
  }, [isSubmitted]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Unchanged rules. Phone stays optional and is only checked once something
  // has been typed into it.
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Please tell us your name";
    if (!formData.email.trim())
      newErrors.email = "Please add an email we can reply to";
    else if (!isEmailValid(formData.email))
      newErrors.email = "That email address doesn't look right";
    if (formData.phone.trim() && !isValidPhone(formData.phone))
      newErrors.phone = "Please enter a valid 10-digit mobile number";
    if (!formData.subject.trim())
      newErrors.subject = "A few words about the subject, please";
    if (!formData.message.trim()) newErrors.message = "Please write your message";
    else if (formData.message.trim().length < MESSAGE_MIN)
      newErrors.message = `A little more, please — at least ${MESSAGE_MIN} characters`;
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }
    setIsSubmitting(true);
    try {
      await apiService.leads.createContact(formData);
      setIsSubmitted(true);
      setFormData({ ...EMPTY_LEAD, email: user?.email || "" });
    } catch {
      setErrors({
        submit:
          "The message didn't send. Please try again, or write to us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // A hint, never a scold — it says how far along the note is and goes quiet
  // once it clears the floor.
  const messageLength = formData.message.trim().length;
  const messageHint =
    messageLength === 0
      ? `A sentence or two is plenty — at least ${MESSAGE_MIN} characters.`
      : messageLength < MESSAGE_MIN
      ? `${messageLength} of ${MESSAGE_MIN} characters`
      : "";

  const describedBy = (field, extra) =>
    [errors[field] ? `${field}-error` : null, extra].filter(Boolean).join(" ") ||
    undefined;

  /** One field's error line, with its glyph. */
  const fieldError = (field) =>
    errors[field] ? (
      <span id={`${field}-error`} className={styles.fieldError}>
        <Icon icon="mdi:alert-circle-outline" aria-hidden="true" />
        {errors[field]}
      </span>
    ) : null;

  return (
    <div className={styles.page}>
      <div className="sf-container">
        {/* ── 1. THE INVITATION ─────────────────────────────────────────── */}
        <header className={styles.head}>
          <p className={`sf-eyebrow sf-eyebrow--rule ${styles.eyebrow}`}>
            {content?.eyebrow || "Contact"}
          </p>
          <h1 className={styles.title}>{content?.title || "Write to us"}</h1>
          {content?.lede ? <p className={styles.lede}>{content.lede}</p> : null}
        </header>

        {/* ── 2. THE CHANNELS ───────────────────────────────────────────── */}
        {channels.length > 0 && (
          <section className={styles.channels} aria-label="Ways to reach us">
            {channels.map((channel) => (
              <a
                key={channel.key}
                className={`sf-card ${styles.channel}`}
                href={channel.href}
                {...(channel.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <span className={styles.channelIcon} aria-hidden="true">
                  <Icon icon={channel.icon} />
                </span>
                <span className={styles.channelLabel}>{channel.label}</span>
                <span className={styles.channelValue}>{channel.value}</span>
                <span className={styles.channelNote}>{channel.note}</span>
              </a>
            ))}
          </section>
        )}

        <div className={styles.body}>
          {/* ── 3. THE LETTER ───────────────────────────────────────────── */}
          <section className={styles.letter} aria-labelledby="contact-form-title">
            <div className={styles.letterHead}>
              <h2 className={styles.sectionTitle} id="contact-form-title">
                Write to us
              </h2>
              <p className={styles.sectionLede}>
                We read every message.
                {supportHours
                  ? ` Replies come from the care desk — ${supportHours}.`
                  : ""}
              </p>
            </div>

            {isSubmitted ? (
              <GlassCard strong padding="lg" className={styles.sent} role="status">
                <span className={styles.sentMark} aria-hidden="true">
                  <Icon icon="mdi:check" />
                </span>
                <h3 className={styles.sentTitle} ref={sentRef} tabIndex={-1}>
                  Message sent
                </h3>
                <p className={styles.sentBody}>
                  Your note is with the care desk.
                  {supportHours ? ` We answer ${supportHours}.` : ""}
                </p>
                <Button variant="secondary" onClick={() => setIsSubmitted(false)}>
                  Send another
                </Button>
              </GlassCard>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="name">
                      Your name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                      value={formData.name}
                      onChange={handleChange}
                      aria-invalid={!!errors.name}
                      aria-describedby={describedBy("name")}
                    />
                    {fieldError("name")}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                      value={formData.email}
                      onChange={handleChange}
                      aria-invalid={!!errors.email}
                      aria-describedby={describedBy("email")}
                    />
                    {fieldError("email")}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="phone">
                      Phone <span className={styles.optional}>Optional</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                      value={formData.phone}
                      onChange={handleChange}
                      aria-invalid={!!errors.phone}
                      aria-describedby={describedBy("phone")}
                    />
                    {fieldError("phone")}
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="subject">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      autoComplete="off"
                      required
                      className={`${styles.input} ${errors.subject ? styles.inputError : ""}`}
                      value={formData.subject}
                      onChange={handleChange}
                      aria-invalid={!!errors.subject}
                      aria-describedby={describedBy("subject")}
                    />
                    {fieldError("subject")}
                  </div>

                  <div className={`${styles.field} ${styles.fieldWide}`}>
                    <label className={styles.label} htmlFor="message">
                      Your message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className={`${styles.input} ${styles.textarea} ${
                        errors.message ? styles.inputError : ""
                      }`}
                      value={formData.message}
                      onChange={handleChange}
                      aria-invalid={!!errors.message}
                      aria-describedby={describedBy(
                        "message",
                        messageHint ? "message-hint" : null
                      )}
                    />
                    {fieldError("message")}
                    {messageHint && (
                      <span id="message-hint" className={styles.hint}>
                        {messageHint}
                      </span>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <p className={styles.formError} role="alert">
                    <Icon icon="mdi:alert-circle-outline" aria-hidden="true" />
                    {errors.submit}
                  </p>
                )}

                <div className={styles.formFoot}>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? "Sending…" : "Send message"}
                  </Button>
                  <p className={styles.formNote}>
                    Your details are used to answer this message and nothing
                    else. <Link to={ROUTES.POLICY_PRIVACY}>Privacy policy</Link>.
                  </p>
                </div>
              </form>
            )}
          </section>

          {/* ── 4. THE RAIL ─────────────────────────────────────────────── */}
          <aside className={styles.rail}>
            {supportAddress && (
              <GlassCard
                as="section"
                padding="lg"
                className={styles.railCard}
                aria-labelledby="contact-visit"
              >
                <h2 className={styles.railTitle} id="contact-visit">
                  Visit
                </h2>
                <p className={styles.railLine}>
                  <span className={styles.railIcon} aria-hidden="true">
                    <Icon icon="mdi:map-marker-outline" />
                  </span>
                  <span>{supportAddress}</span>
                </p>
                {supportHours && (
                  <p className={styles.railLine}>
                    <span className={styles.railIcon} aria-hidden="true">
                      <Icon icon="mdi:clock-outline" />
                    </span>
                    <span>{supportHours}</span>
                  </p>
                )}
                <a
                  className={styles.railLink}
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions
                  <Icon icon="mdi:arrow-top-right" aria-hidden="true" />
                </a>
              </GlassCard>
            )}

            <section className={styles.railBlock} aria-labelledby="contact-why">
              <h2 className={styles.railTitle} id="contact-why">
                Why LAMIKAA
              </h2>
              {/* The four pillars, read from `brand.pillars` — not four
                  sentences retyped into a sidebar. */}
              <Pillars compact titleAs="h3" className={styles.railPillars} />
              <Link className={styles.railLink} to={ROUTES.WHY}>
                Read the full story
                <Icon icon="mdi:arrow-right" aria-hidden="true" />
              </Link>
            </section>

            {socialLinks.length > 0 && (
              <section className={styles.railBlock} aria-labelledby="contact-social">
                <h2 className={styles.railTitle} id="contact-social">
                  Follow our journey
                </h2>
                {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
                <ul className={styles.socials} role="list">
                  {socialLinks.map((platform) => (
                    <li key={platform.key}>
                      <a
                        className={styles.social}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={platform.label}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false">
                          <path d={platform.path} />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className={styles.railFoot}>
              Looking for an answer straight away?{" "}
              <Link to={ROUTES.FAQ}>Read the FAQ</Link>.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Contact;
