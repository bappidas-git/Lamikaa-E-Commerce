import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import useInView from "../../hooks/useInView";
import styles from "./VideoPlayer.module.css";

// =============================================================================
// VideoPlayer — hand-rolled, keyboard-complete, never noisy
// =============================================================================
//
// No library. A video player is three DOM APIs and a state machine, and the
// bundle cost of a packaged one buys nothing this needs — the whole point is
// that the chrome is OURS: a champagne play badge on the poster, a hairline of
// progress, and a mute toggle, instead of a browser's grey control bar sitting
// on top of a brand film.
//
// THE RULES IT ENFORCES
//   • It never autoplays, so it can never autoplay with sound. Playback starts
//     from a press, and `muted` still defaults to true so an unexpected press
//     is quiet.
//   • `preload="metadata"` — the duration, not the file. A PDP gallery with
//     four clips must not pull four videos nobody asked for.
//   • `playsInline` — iOS otherwise takes the video fullscreen on play, which
//     throws the visitor out of the gallery they were browsing.
//   • It pauses when it scrolls out of view (useInView) and when the tab is
//     hidden. Audio continuing from a page nobody is looking at is the single
//     most complained-about behaviour on the web.
//
// KEYBOARD (the conventional set, so nobody has to learn ours):
//   Space / K  play-pause      M  mute        <- / ->  seek 5s      F  fullscreen
// The wrapper is the focus target and carries the ring; presses that land on
// one of the control buttons are left to the button.
//
// FAILURE. A dead URL is likely here: the seeded clips are third-party
// placeholders (PLACEHOLDER_ASSETS.md). On `error` the poster stays up under a
// plain "Video unavailable" line, and the element hands over its own native
// controls — whatever the browser can still do with the source, it may.
// =============================================================================

const SEEK_STEP = 5;

const supportsFullscreen = (node) =>
  !!(node && (node.requestFullscreen || node.webkitEnterFullscreen));

const VideoPlayer = ({
  src,
  poster,
  title = "",
  preload = "metadata",
  muted: mutedProp = true,
  controlsVariant = "inline",
  className = "",
  ...rest
}) => {
  const videoRef = useRef(null);
  const wrapRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(mutedProp);
  const [progress, setProgress] = useState(0);
  const [errored, setErrored] = useState(false);
  // Resolved after mount: the element has to exist before it can be asked
  // whether it can go fullscreen, and iOS answers on the <video> itself
  // (webkitEnterFullscreen) rather than on the document.
  const [canFullscreen, setCanFullscreen] = useState(false);

  // `once: false` — this is a "pause when it leaves" observer, so it has to keep
  // answering, not freeze at the first sighting.
  const inView = useInView(wrapRef, { once: false, amount: 0.3 });

  // `muted` is a PROPERTY, not just an attribute: browsers read the property
  // when deciding whether a play() is allowed to be silent.
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    setCanFullscreen(supportsFullscreen(videoRef.current));
  }, []);

  const play = useCallback(() => {
    const node = videoRef.current;
    if (!node) return;
    const started = node.play();
    // Chrome rejects play() when the gesture is not trusted; swallowing the
    // rejection keeps an unhandled promise out of the console.
    if (started?.catch) started.catch(() => setPlaying(false));
  }, []);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const node = videoRef.current;
    if (!node) return;
    if (node.paused) play();
    else pause();
  }, [play, pause]);

  const seekBy = useCallback((seconds) => {
    const node = videoRef.current;
    if (!node || !Number.isFinite(node.duration)) return;
    node.currentTime = Math.min(
      Math.max(0, node.currentTime + seconds),
      node.duration
    );
  }, []);

  const toggleFullscreen = useCallback(() => {
    const node = videoRef.current;
    if (!node) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else if (node.requestFullscreen) node.requestFullscreen();
    else if (node.webkitEnterFullscreen) node.webkitEnterFullscreen(); // iOS
  }, []);

  // Out of view -> pause. Nothing resumes it: a video that restarts itself when
  // you scroll back is a video you cannot leave paused.
  useEffect(() => {
    if (!inView && playing) pause();
  }, [inView, playing, pause]);

  // Hidden tab -> pause, for the same reason.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [pause]);

  const onKeyDown = (event) => {
    // A press that landed on one of our buttons belongs to that button; only
    // the keys a button does not claim are ours to read there.
    const onControl = event.target.closest?.("button");
    if (onControl && (event.key === " " || event.key === "Enter")) return;

    switch (event.key) {
      case " ":
      case "k":
      case "K":
        event.preventDefault();
        toggle();
        break;
      case "m":
      case "M":
        event.preventDefault();
        setMuted((current) => !current);
        break;
      case "ArrowRight":
        event.preventDefault();
        seekBy(SEEK_STEP);
        break;
      case "ArrowLeft":
        event.preventDefault();
        seekBy(-SEEK_STEP);
        break;
      case "f":
      case "F":
        if (!canFullscreen) return;
        event.preventDefault();
        toggleFullscreen();
        break;
      default:
        break;
    }
  };

  const label = title || "video";
  const minimal = controlsVariant === "minimal";

  return (
    <div
      ref={wrapRef}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      // A labelled group, so a screen reader announces what the controls belong
      // to before it reaches them.
      role="group"
      aria-label={title || undefined}
      tabIndex={0}
      onKeyDown={onKeyDown}
      {...rest}
    >
      <video
        ref={videoRef}
        className={styles.video}
        src={src}
        poster={poster || undefined}
        preload={preload}
        title={title || undefined}
        playsInline
        // Never `autoPlay`. Playback is always a press.
        muted={muted}
        controls={errored}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => setErrored(true)}
        onTimeUpdate={(event) => {
          const node = event.currentTarget;
          if (!Number.isFinite(node.duration) || node.duration === 0) return;
          setProgress((node.currentTime / node.duration) * 100);
        }}
        onClick={errored ? undefined : toggle}
      />

      {errored ? (
        <div className={styles.error}>
          {poster ? (
            <img src={poster} alt="" className={styles.errorPoster} />
          ) : null}
          <p className={styles.errorText}>Video unavailable</p>
        </div>
      ) : (
        <>
          {/* The play badge — champagne, and only while paused, so it never
              sits over a film that is running. */}
          {!playing ? (
            <button
              type="button"
              className={styles.badge}
              onClick={toggle}
              aria-label={`Play ${label}`}
            >
              <Icon icon="mdi:play" aria-hidden="true" />
            </button>
          ) : null}

          <div className={[styles.bar, minimal ? styles.barMinimal : ""].filter(Boolean).join(" ")}>
            {!minimal ? (
              <button
                type="button"
                className={styles.control}
                onClick={toggle}
                aria-label={playing ? `Pause ${label}` : `Play ${label}`}
              >
                <Icon icon={playing ? "mdi:pause" : "mdi:play"} aria-hidden="true" />
              </button>
            ) : null}

            {/* The progress hairline. Decorative: the numbers a visitor needs
                are in the native controls the error path exposes, and a bar
                that re-announces itself several times a second is noise. */}
            <span className={styles.track} aria-hidden="true">
              <span className={styles.fill} style={{ width: `${progress}%` }} />
            </span>

            <button
              type="button"
              className={styles.control}
              onClick={() => setMuted((current) => !current)}
              aria-pressed={muted}
              aria-label={muted ? `Unmute ${label}` : `Mute ${label}`}
            >
              <Icon icon={muted ? "mdi:volume-off" : "mdi:volume-high"} aria-hidden="true" />
            </button>

            {!minimal && canFullscreen ? (
              <button
                type="button"
                className={styles.control}
                onClick={toggleFullscreen}
                aria-label={`Full screen ${label}`}
              >
                <Icon icon="mdi:fullscreen" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
