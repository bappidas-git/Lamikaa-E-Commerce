import React, { useEffect, useRef, useState } from "react";
import {
  Box, Button, Chip, IconButton, Paper, Radio, TextField, Tooltip, Typography,
} from "@mui/material";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import { cld, isCloudinary } from "../../../utils/cloudinary";
import { validateMedia } from "../../../utils/product";
import { ADMIN_PALETTE } from "../../../theme/adminTheme";

// =============================================================================
// MediaManager — image links and video links, ordered, previewed and validated
// =============================================================================
//
// This replaces "Image URLs (one per line)": a textarea that could not express
// alt text, could not say which frame leads, could not hold a video, could not
// show you that a URL was a 404, and quietly re-ordered nothing. The PDP
// gallery (Prompt 26) reads `media[]` — an ordered mix of images and videos with
// exactly one image flagged `primary` — so that is what this edits, directly.
//
// LINKS ONLY. There is no upload here, by the brief: assets live on Cloudinary
// (and on placeholder hosts until the shoot lands), and the admin's job is to
// point at them. That makes the preview the whole safety net, so every row
// renders its real asset from its real URL — an `<img>` for an image, a
// `<video preload="metadata">` for a video. If the browser cannot load it, the
// row says so before the merchant saves; there is no other reachability check,
// and a HEAD request from a CRA page would only have hit CORS anyway.
//
// TWO LISTS, ONE ARRAY. Images and videos are edited as separate ordered lists
// because they are separate decisions — which picture leads a card, which film
// opens the story — but they persist as ONE `media[]`, images first, then
// videos, each in its own order. Every commit re-emits in that shape, which is
// exactly the shape the eight seeded products already have: opening one and
// saving it re-writes the same array.
//
// ORDER IS EDITABLE THREE WAYS and they are the same operation: drag a row by
// its handle, or press the up/down buttons, or (for a keyboard visitor) tab to
// those buttons — the drag is the affordance, the buttons are the contract.
// After a keyboard move the focus is put back on the button that moved the row,
// so a merchant can press it again; when that button has become disabled (the
// row reached an end) focus goes to its twin instead, which is where the next
// useful press is.
//
// PRIMARY IS A RADIO, not a checkbox, because "exactly one" is the rule the
// whole storefront depends on: `images[0]` is the primary's URL, and that is
// what cart lines, wishlist snapshots and order items have already stored.
// Removing the primary is the one destructive edit here, so it is the one that
// asks first.
// =============================================================================

/** Delivered width for a 64px box on a 2x screen. Cloudinary URLs only. */
const THUMB_WIDTH = 128;

const THUMB = 64;

const trimmed = (value) => (typeof value === "string" ? value.trim() : "");

/** A patch whose `undefined` values REMOVE the key rather than setting it. */
const applyPatch = (row, patch) => {
  const next = { ...row, ...patch };
  Object.keys(patch).forEach((key) => {
    if (patch[key] === undefined) delete next[key];
  });
  return next;
};

const MediaManager = ({ value, onChange, productName, errors }) => {
  const rows = Array.isArray(value) ? value : [];
  const images = rows.filter((row) => row?.type !== "video");
  const videos = rows.filter((row) => row?.type === "video");

  // Live validation, so a mis-typed URL is red before "Save" is ever pressed.
  // The same function runs (blocking) in handleSave — one rule set, one answer.
  const live = validateMedia(rows);

  const [imgStatus, setImgStatus] = useState({});
  const [videoStatus, setVideoStatus] = useState({});
  const [dragging, setDragging] = useState(null); // { list, index }
  const [dragOver, setDragOver] = useState(null); // { list, index }
  const [focusRequest, setFocusRequest] = useState(null);
  const moveButtons = useRef({});

  // Put the keyboard back where the merchant left it after a move. The row has
  // travelled, so the focused element has to travel with it.
  useEffect(() => {
    if (!focusRequest) return;
    const { list, index, dir } = focusRequest;
    const pick = (which) => {
      const el = moveButtons.current[`${list}-${index}-${which}`];
      return el && !el.disabled ? el : null;
    };
    const target = pick(dir) || pick(dir === "up" ? "down" : "up");
    if (target) target.focus();
    setFocusRequest(null);
  }, [focusRequest]);

  // ── Commit ────────────────────────────────────────────────────────────────
  // One writer. Images keep their order, videos keep theirs, and the array that
  // leaves is always images-then-videos.
  const commit = (nextImages, nextVideos) => onChange([...nextImages, ...nextVideos]);

  const commitImages = (next) => commit(next, videos);
  const commitVideos = (next) => commit(images, next);

  const swap = (list, index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= list.length) return null;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  };

  const moveTo = (list, from, to) => {
    if (to < 0 || to >= list.length || from === to) return null;
    const next = [...list];
    const [row] = next.splice(from, 1);
    next.splice(to, 0, row);
    return next;
  };

  // ── Images ────────────────────────────────────────────────────────────────
  const setImage = (index, patch) =>
    commitImages(images.map((row, i) => (i === index ? applyPatch(row, patch) : row)));

  const defaultAlt = (position) =>
    productName ? `${productName} — image ${position}` : `Image ${position}`;

  const addImage = () =>
    commitImages([
      ...images,
      // The first image a product ever gets is its primary — nobody should have
      // to be told that, and a list with no primary is not saveable.
      { type: "image", url: "", alt: defaultAlt(images.length + 1), ...(images.length ? {} : { primary: true }) },
    ]);

  const removeImage = async (index) => {
    const row = images[index];
    if (row?.primary === true) {
      const result = await Swal.fire({
        title: "Remove the primary image?",
        text: "It leads the gallery, the product cards and the cart. The next image takes its place.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: ADMIN_PALETTE.error.main,
        confirmButtonText: "Remove",
      });
      if (!result.isConfirmed) return;
    }
    const next = images.filter((_, i) => i !== index);
    // Never leave the list without a primary: the first survivor inherits it.
    if (next.length && !next.some((r) => r.primary === true)) next[0] = { ...next[0], primary: true };
    commitImages(next);
  };

  const setPrimary = (index) =>
    commitImages(
      images.map((row, i) =>
        i === index ? { ...row, primary: true } : applyPatch(row, { primary: undefined })
      )
    );

  const moveImage = (index, delta, viaKeyboard) => {
    const next = swap(images, index, delta);
    if (!next) return;
    commitImages(next);
    if (viaKeyboard) {
      setFocusRequest({ list: "image", index: index + delta, dir: delta < 0 ? "up" : "down" });
    }
  };

  // ── Videos ────────────────────────────────────────────────────────────────
  const setVideo = (index, patch) =>
    commitVideos(videos.map((row, i) => (i === index ? applyPatch(row, patch) : row)));

  const addVideo = () =>
    commitVideos([...videos, { type: "video", url: "", poster: "", title: `Video ${videos.length + 1}` }]);

  const removeVideo = (index) => commitVideos(videos.filter((_, i) => i !== index));

  const moveVideo = (index, delta, viaKeyboard) => {
    const next = swap(videos, index, delta);
    if (!next) return;
    commitVideos(next);
    if (viaKeyboard) {
      setFocusRequest({ list: "video", index: index + delta, dir: delta < 0 ? "up" : "down" });
    }
  };

  // ── Drag and drop ─────────────────────────────────────────────────────────
  // By the handle only: a `draggable` row would fight text selection inside its
  // own inputs, which is where a merchant spends all of their time.
  //
  // THE DATA TRANSFER IS THE SOURCE OF TRUTH, not React state. `dragover` may
  // only read `dataTransfer.types` (the payload is protected until the drop),
  // so the LIST is encoded as a custom MIME type — that is what lets a row
  // refuse a video dropped into the image list — and the index rides in
  // `text/plain`, read back at the drop. `dragging` below exists only to dim
  // the row being carried; nothing about the reorder depends on it having
  // re-rendered in time.
  const dragType = (list) => `application/x-lamikaa-media-${list}`;

  const onDragStart = (list, index) => (event) => {
    setDragging({ list, index });
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(dragType(list), String(index));
    // Firefox refuses to start a drag with no text/plain on the transfer.
    event.dataTransfer.setData("text/plain", `${list}:${index}`);
  };

  const onDragOverRow = (list, index) => (event) => {
    if (!Array.from(event.dataTransfer.types || []).includes(dragType(list))) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (dragOver?.list !== list || dragOver?.index !== index) setDragOver({ list, index });
  };

  const onDropRow = (list, index) => (event) => {
    const raw = event.dataTransfer.getData("text/plain");
    const [fromList, fromIndex] = String(raw).split(":");
    if (fromList !== list) return;
    event.preventDefault();
    const next = moveTo(list === "image" ? images : videos, Number(fromIndex), index);
    if (next) (list === "image" ? commitImages : commitVideos)(next);
    setDragging(null);
    setDragOver(null);
  };

  const endDrag = () => {
    setDragging(null);
    setDragOver(null);
  };

  // ── Row helpers ───────────────────────────────────────────────────────────
  /**
   * The row's message.
   *
   * Live validation wins on any row that HAS a URL, because it is recomputed on
   * every keystroke: a save-time message would still be sitting there claiming
   * "enter a URL" a second after the merchant entered one. A row that is still
   * blank shows nothing until a save attempt flags it — a row added ten seconds
   * ago is not yet a mistake — and that is the only case `errors` answers.
   */
  const rowError = (row) => {
    const index = rows.indexOf(row);
    if (index < 0) return "";
    if (trimmed(row?.url)) return live.errors[index] || "";
    return errors?.[index] || "";
  };

  const registerMoveButton = (list, index, dir) => (el) => {
    moveButtons.current[`${list}-${index}-${dir}`] = el;
  };

  const moveControls = (list, index, count, move, remove, removeLabel) => (
    <Box sx={{ display: "flex", flexShrink: 0 }}>
      <Tooltip title="Move up">
        {/* A disabled IconButton drops its tooltip, so the span carries it. */}
        <span>
          <IconButton
            size="small"
            ref={registerMoveButton(list, index, "up")}
            onClick={() => move(index, -1, true)}
            disabled={index === 0}
            aria-label={`Move ${list} ${index + 1} up`}
          >
            <Icon icon="mdi:chevron-up" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Move down">
        <span>
          <IconButton
            size="small"
            ref={registerMoveButton(list, index, "down")}
            onClick={() => move(index, 1, true)}
            disabled={index === count - 1}
            aria-label={`Move ${list} ${index + 1} down`}
          >
            <Icon icon="mdi:chevron-down" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={removeLabel}>
        <IconButton
          size="small"
          color="error"
          onClick={() => remove(index)}
          aria-label={`${removeLabel} ${index + 1}`}
        >
          <Icon icon="mdi:delete-outline" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const rowSx = (list, index) => ({
    p: 1.5,
    border: "1px solid",
    borderColor:
      dragOver?.list === list && dragOver?.index === index ? "primary.main" : "divider",
    borderRadius: 1,
    bgcolor: "background.paper",
    opacity: dragging?.list === list && dragging?.index === index ? 0.5 : 1,
    minHeight: 56,
    display: "flex",
    gap: 1.5,
    alignItems: "flex-start",
    // Below `sm` there is no width left for a URL field once the handle, the
    // 64px thumbnail and three buttons have taken their share, so the fields
    // drop to their own line rather than squeezing a link into 90px. The wrap
    // follows DOM order, so the tab order still matches what is on screen.
    flexWrap: { xs: "wrap", sm: "nowrap" },
  });

  const dragHandle = (list, index) => (
    <Box
      draggable
      onDragStart={onDragStart(list, index)}
      onDragEnd={endDrag}
      aria-hidden="true"
      title="Drag to reorder"
      sx={{
        width: 24,
        height: 24,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "text.disabled",
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
      }}
    >
      <Icon icon="mdi:drag-vertical" />
    </Box>
  );

  const errorText = (message) =>
    message ? (
      <Typography sx={{ fontSize: 12, color: "error.main", mt: 0.5 }}>{message}</Typography>
    ) : null;

  const thumbBoxSx = {
    width: THUMB,
    height: THUMB,
    flexShrink: 0,
    borderRadius: 1,
    overflow: "hidden",
    bgcolor: "surface.sunken",
    border: "1px solid",
    borderColor: "divider",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  };

  // ── Summary ───────────────────────────────────────────────────────────────
  const primaryPosition = images.findIndex((row) => row.primary === true) + 1;
  const summary = [
    `${images.length} ${images.length === 1 ? "image" : "images"}`,
    `${videos.length} ${videos.length === 1 ? "video" : "videos"}`,
    `primary: ${primaryPosition > 0 ? `#${primaryPosition}` : "none"}`,
  ].join(" · ");

  return (
    <Box>
      <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          {summary}
        </Typography>
        {errorText(live.message)}
      </Box>

      {/* ── Image links ────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mb: 1,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Image links ({images.length})
        </Typography>
        <Button size="small" startIcon={<Icon icon="mdi:image-plus" />} onClick={addImage}>
          Add image link
        </Button>
      </Box>

      {images.length === 0 ? (
        <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            No images yet. Add at least one link — the first one becomes the primary.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {images.map((row, index) => {
            const url = trimmed(row.url);
            const broken = url && imgStatus[url] === "error";
            const message = rowError(row) || (broken ? "Invalid image URL" : "");
            const cloudinary = isCloudinary(url);
            return (
              <Paper
                /* eslint-disable-next-line react/no-array-index-key */
                key={`image-${index}`}
                elevation={0}
                sx={rowSx("image", index)}
                onDragOver={onDragOverRow("image", index)}
                onDrop={onDropRow("image", index)}
              >
                {dragHandle("image", index)}

                <Box sx={thumbBoxSx}>
                  {url && !broken ? (
                    <Box
                      component="img"
                      src={cloudinary ? cld(url, { w: THUMB_WIDTH }) : url}
                      alt=""
                      onLoad={() => setImgStatus((s) => (s[url] === "ok" ? s : { ...s, [url]: "ok" }))}
                      onError={() => setImgStatus((s) => (s[url] === "error" ? s : { ...s, [url]: "error" }))}
                      /* CONTAIN, not cover: this preview is the merchant's only
                         look at the asset before saving, and the storefront
                         shows the whole frame. A cropped preview would hide
                         exactly the mistake — a pack sitting off to one side of
                         a wide shot — that the preview exists to catch. */
                      sx={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                    />
                  ) : (
                    <Icon
                      icon={broken ? "mdi:image-broken-variant" : "mdi:image-outline"}
                      style={{ fontSize: 22, opacity: 0.6 }}
                    />
                  )}
                </Box>

                <Box sx={{ flex: { xs: "1 1 100%", sm: 1 }, minWidth: 0 }}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: { xs: "wrap", md: "nowrap" } }}>
                    <TextField
                      label={`Image ${index + 1} URL`}
                      value={row.url || ""}
                      onChange={(e) => setImage(index, { url: e.target.value })}
                      size="small"
                      error={!!message}
                      sx={{ flex: 2, minWidth: 200 }}
                      placeholder="https://…"
                    />
                    <TextField
                      label="Alt text"
                      value={row.alt || ""}
                      onChange={(e) => setImage(index, { alt: e.target.value })}
                      size="small"
                      sx={{ flex: 1.5, minWidth: 160 }}
                      placeholder={defaultAlt(index + 1)}
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
                    <Box
                      component="label"
                      sx={{ display: "flex", alignItems: "center", cursor: "pointer", color: "text.secondary" }}
                    >
                      <Radio
                        size="small"
                        checked={row.primary === true}
                        onChange={() => setPrimary(index)}
                        name="media-primary"
                        inputProps={{ "aria-label": `Make image ${index + 1} the primary` }}
                      />
                      <Typography variant="caption">Primary</Typography>
                    </Box>
                    {row.placeholder && (
                      <Chip label="Placeholder" size="small" variant="outlined" sx={{ height: 20, fontSize: "0.65rem" }} />
                    )}
                  </Box>

                  {errorText(message)}
                </Box>

                {moveControls("image", index, images.length, moveImage, removeImage, "Remove image")}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* ── Video links ────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          mt: 3,
          mb: 1,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Video links ({videos.length})
        </Typography>
        <Button size="small" startIcon={<Icon icon="mdi:video-plus-outline" />} onClick={addVideo}>
          Add video link
        </Button>
      </Box>

      {videos.length === 0 ? (
        <Box sx={{ p: 2, border: "1px dashed", borderColor: "divider", borderRadius: 1, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            No videos. A product without one is perfectly normal.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {videos.map((row, index) => {
            const url = trimmed(row.url);
            const poster = trimmed(row.poster);
            const unreachable = url && videoStatus[url] === "error";
            const message = rowError(row) || (unreachable ? "Video could not be loaded" : "");
            const playable = /^https?:\/\/\S+$/i.test(url);
            return (
              <Paper
                /* eslint-disable-next-line react/no-array-index-key */
                key={`video-${index}`}
                elevation={0}
                sx={rowSx("video", index)}
                onDragOver={onDragOverRow("video", index)}
                onDrop={onDropRow("video", index)}
              >
                {dragHandle("video", index)}

                <Box sx={thumbBoxSx}>
                  {playable ? (
                    <>
                      {/* `preload="metadata"` IS the reachability check: it loads
                          the header and nothing more, then reports which way it
                          went. It also paints the poster, or the first frame. */}
                      <Box
                        component="video"
                        src={url}
                        poster={poster || undefined}
                        preload="metadata"
                        muted
                        playsInline
                        onLoadedMetadata={() =>
                          setVideoStatus((s) => (s[url] === "ok" ? s : { ...s, [url]: "ok" }))
                        }
                        onError={() =>
                          setVideoStatus((s) => (s[url] === "error" ? s : { ...s, [url]: "error" }))
                        }
                        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <Box
                        aria-hidden="true"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "common.white",
                          textShadow: "0 1px 4px rgba(0,0,0,.6)",
                          pointerEvents: "none",
                        }}
                      >
                        <Icon icon="mdi:play-circle" style={{ fontSize: 26 }} />
                      </Box>
                    </>
                  ) : (
                    <Icon
                      icon={unreachable ? "mdi:video-off-outline" : "mdi:video-outline"}
                      style={{ fontSize: 22, opacity: 0.6 }}
                    />
                  )}
                </Box>

                <Box sx={{ flex: { xs: "1 1 100%", sm: 1 }, minWidth: 0 }}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: { xs: "wrap", md: "nowrap" } }}>
                    <TextField
                      label={`Video ${index + 1} URL`}
                      value={row.url || ""}
                      onChange={(e) => setVideo(index, { url: e.target.value })}
                      size="small"
                      error={!!message}
                      sx={{ flex: 2, minWidth: 200 }}
                      placeholder="https://… .mp4"
                    />
                    <TextField
                      label="Title"
                      value={row.title || ""}
                      onChange={(e) => setVideo(index, { title: e.target.value })}
                      size="small"
                      sx={{ flex: 1.5, minWidth: 150 }}
                      placeholder={`Video ${index + 1}`}
                    />
                  </Box>
                  <TextField
                    label="Poster image URL"
                    value={row.poster || ""}
                    onChange={(e) => setVideo(index, { poster: e.target.value })}
                    size="small"
                    fullWidth
                    sx={{ mt: 1 }}
                    placeholder="https://…"
                    helperText="Optional — the primary image is used when this is empty."
                  />
                  {errorText(message)}
                </Box>

                {moveControls("video", index, videos.length, moveVideo, removeVideo, "Remove video")}
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default MediaManager;
