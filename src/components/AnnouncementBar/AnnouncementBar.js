import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import apiService from "../../services/api";
import brand from "../../config/brand";
import { isPlaceholder } from "../../utils/placeholders";
import { DURATION, tween } from "../../theme/motion";
import styles from "./AnnouncementBar.module.css";

// =============================================================================
// AnnouncementBar — the utility band above the masthead
// =============================================================================
//
// DATA. The rows come from Admin → Announcements through
// `apiService.announcements.getAll()`, which already hides the rows that are
// switched off or outside their scheduling window. `brand.announcements` is the
// fallback the bar falls back to when the API answers with nothing or fails, so
// a store whose backend is unreachable still says who it is.
//
// PLACEHOLDERS. A row whose `text` still carries a `{{TOKEN}}` is DROPPED
// (PLACEHOLDERS.md: an announcement is hidden while unresolved, never printed
// raw). Two of the three seeded rows are tokens today — the free-shipping
// threshold and the launch offer — so the bar honestly shows one line until the
// owner fills them in, and starts rotating the moment they do.
//
// ROTATION. A 6s crossfade (opacity only, no travel), paused on hover/focus and
// while the tab is in the background, held on the first row under reduced
// motion. `role="status" aria-live="polite"` so the swap is announced once.
//
// DISMISSAL is remembered for the SESSION (`sessionStorage`), not forever: the
// brief asks for "remembered per session", so a new tab gets the announcement
// back while a walk across the storefront does not.
//
// THE BAND CARRIES NO BLUR. It is the glass recipe (DESIGN_SYSTEM §4) at 4%
// white with the backdrop filter left off, because it sits directly above the
// blurred header and the budget is two blurred layers in view — the header and
// whatever overlay is open. It renders in NORMAL FLOW above the sticky header,
// so it scrolls away and the pinned chrome stays at 64px (100px including this
// band before the first scroll).
// =============================================================================

const STORAGE_KEY = "lk-announcement-dismissed";
const ROTATE_MS = 6000;

/** A row the bar can actually print: real text, no unresolved token. */
const isPrintable = (row) =>
  typeof row?.text === "string" &&
  row.text.trim() !== "" &&
  !isPlaceholder(row.text);

/** Normalise an API row and a brand-config row into the one shape rendered. */
const toRow = (row, index) => ({
  id: String(row.id ?? row.text ?? index),
  text: row.text.trim(),
  // A blank/absent link is "no link", not a dead href to "".
  link: typeof row.link === "string" && row.link.trim() ? row.link.trim() : "",
});

const AnnouncementBar = ({ className = "" }) => {
  const [rows, setRows] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hidden, setHidden] = useState(false);
  const timerRef = useRef(null);

  // ---- Data --------------------------------------------------------------
  // The API never throws (it returns [] on failure), so "empty" covers both an
  // unreachable backend and a merchant who has switched every row off. The
  // brand fallback then answers, and the placeholder filter runs over both.
  useEffect(() => {
    let active = true;
    const load = async () => {
      let data = [];
      try {
        data = await apiService.announcements.getAll();
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
      }
      const source =
        Array.isArray(data) && data.length ? data : brand.announcements;
      const printable = (source || []).filter(isPrintable).map(toRow);
      if (active) setRows(printable);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // ---- Dismissal (per session) -------------------------------------------
  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setDismissed(true);
    } catch (e) {
      /* sessionStorage may be unavailable (private mode) — fail open. */
    }
  }, []);

  // ---- Reduced motion ----------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  // Hold while the tab is in the background. Browsers suspend rAF there, so a
  // rotation started off-screen would queue an exit animation that can never
  // finish — leaving every message stacked in the DOM until the tab returns.
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  // ---- Rotation ----------------------------------------------------------
  const count = rows.length;
  useEffect(() => {
    if (paused || hidden || reduceMotion || dismissed || count <= 1) {
      return undefined;
    }
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, hidden, reduceMotion, dismissed, count]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      /* ignore persistence failures */
    }
  }, []);

  const active = useMemo(
    () => (count ? rows[index % count] : null),
    [rows, index, count]
  );

  // Nothing to say (every row a placeholder, or the merchant switched them all
  // off) renders nothing at all rather than an empty band.
  if (dismissed || !active) return null;

  // The dot is the band's marker, not a word: it punctuates the line without
  // adding copy nobody wrote. The message ITSELF carries `row.link` — a second
  // "Shop now" affordance would be invented copy (BRAND.md §3.9).
  const message = active.link ? (
    <Link to={active.link} className={styles.messageLink}>
      {active.text}
    </Link>
  ) : (
    active.text
  );

  return (
    <div
      className={`${styles.bar} ${className}`.trim()}
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.inner}>
        {/* Both messages share the cell during the crossfade, so the band
            height never twitches as one replaces the other. */}
        <div className={styles.messageWrap}>
          {reduceMotion ? (
            <span className={styles.message}>
              <span className={styles.dot} aria-hidden="true" />
              {message}
            </span>
          ) : (
            <AnimatePresence initial={false}>
              <motion.span
                key={active.id}
                className={styles.message}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={tween(DURATION.slow)}
              >
                <span className={styles.dot} aria-hidden="true" />
                {message}
              </motion.span>
            </AnimatePresence>
          )}
        </div>
      </div>

      <button
        type="button"
        className={styles.close}
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
      >
        <Icon icon="mdi:close" className={styles.closeIcon} aria-hidden="true" />
      </button>
    </div>
  );
};

export default AnnouncementBar;
