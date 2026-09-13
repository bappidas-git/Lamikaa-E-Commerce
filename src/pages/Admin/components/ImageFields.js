import React, { useRef, useState } from "react";
import { Box, Button, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import {
  readImageFile,
  IMAGE_ACCEPT,
  REVIEW_PHOTO_MAX_EDGE,
  AVATAR_MAX_EDGE,
} from "../../../utils/imageFile";

// =============================================================================
// ImageField / ImageListField — a picture, by link OR from this computer
// =============================================================================
//
// `MediaManager` is deliberately LINKS ONLY: the catalogue's photography lives
// on Cloudinary and the admin's job there is to point at it. A REVIEW is the
// one record where that is not enough — the picture the owner is typing in came
// from a customer's phone, by email or WhatsApp, and there is no asset pipeline
// between the two. So these two fields take both:
//
//   PASTE A LINK   the Cloudinary/CDN path, exactly as MediaManager works, and
//                  the preferred one whenever the asset is already hosted.
//   PICK A FILE    read through `utils/imageFile`, which resizes it in a canvas
//                  and stores it inline. The same code path the customer's own
//                  review dialog uses, so a picture attached by the owner and a
//                  picture attached by the shopper are the same size and shape.
//
// THE PREVIEW IS THE SAFETY NET, as it is in MediaManager: every field renders
// the real asset from the real value, so a broken link is visible before "Save"
// is pressed rather than on the storefront afterwards.
//
// The circle is not decoration. `shape="circle"` previews a portrait exactly as
// `ReviewerAvatar` will crop it on the storefront, so what the owner approves
// here is what a shopper sees.
// =============================================================================

/** The hidden input plus the button that opens it. */
const PickButton = ({ label, onFiles, disabled, multiple = false }) => {
  const inputRef = useRef(null);
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Icon icon="mdi:tray-arrow-up" />}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple={multiple}
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files || []);
          event.target.value = ""; // the same file twice must still fire
          if (files.length) onFiles(files);
        }}
      />
    </>
  );
};

const Preview = ({ src, shape, size = 72, alt = "" }) => {
  const [broken, setBroken] = useState(false);
  const radius = shape === "circle" ? "50%" : 1.5;
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flex: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: radius,
        border: "1px solid",
        borderColor: broken ? "error.main" : "divider",
        bgcolor: "action.hover",
        color: "text.disabled",
      }}
    >
      {src && !broken ? (
        <img
          src={src}
          alt={alt}
          onError={() => setBroken(true)}
          onLoad={() => setBroken(false)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Icon icon={broken ? "mdi:image-broken-variant" : "mdi:image-outline"} width={24} />
      )}
    </Box>
  );
};

/**
 * ONE image on a record — a customer's portrait, a badge, a signature.
 *
 * @param {object}   props
 * @param {string}   props.label
 * @param {string}   props.helperText
 * @param {string}   props.value       a URL or a data URL
 * @param {Function} props.onChange    (next: string) => void
 * @param {"circle"|"square"} [props.shape]
 * @param {number}   [props.maxEdge]   longest edge kept when a FILE is picked
 */
export const ImageField = ({
  label,
  helperText,
  value = "",
  onChange,
  shape = "square",
  maxEdge = AVATAR_MAX_EDGE,
}) => {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const pick = async (files) => {
    setNote("");
    setBusy(true);
    const result = await readImageFile(files[0], { maxEdge, quality: 0.82 });
    setBusy(false);
    if (result.error) setNote(result.error);
    else onChange(result.dataUrl);
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Preview src={value} shape={shape} alt={label} />
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Image link"
            placeholder="https://res.cloudinary.com/…"
            // A picked file lands here as a data URL, which is thousands of
            // characters of base64 — showing it would fill the field with
            // noise, so the control says what it holds instead.
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value.trim())}
            helperText={value.startsWith("data:") ? "Uploaded from this computer." : helperText}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <PickButton label={busy ? "Reading…" : "Upload"} onFiles={pick} disabled={busy} />
            {value && (
              <Tooltip title="Remove image">
                <IconButton size="small" color="error" onClick={() => onChange("")}>
                  <Icon icon="mdi:close-circle-outline" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          {note && (
            <Typography variant="caption" color="error">
              {note}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

/**
 * A SHORT ordered list of images — the pictures attached to one review.
 *
 * @param {object}   props
 * @param {string[]} props.value
 * @param {Function} props.onChange  (next: string[]) => void
 * @param {number}   [props.limit]
 */
export const ImageListField = ({
  label,
  helperText,
  value,
  onChange,
  limit = 3,
  maxEdge = REVIEW_PHOTO_MAX_EDGE,
}) => {
  const rows = Array.isArray(value) ? value.filter(Boolean) : [];
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");

  const room = Math.max(0, limit - rows.length);

  const pick = async (files) => {
    setNote("");
    if (!room) {
      setNote(`Up to ${limit} images.`);
      return;
    }
    setBusy(true);
    const added = [];
    let refused = "";
    for (const file of files.slice(0, room)) {
      // eslint-disable-next-line no-await-in-loop
      const result = await readImageFile(file, { maxEdge });
      if (result.dataUrl) added.push(result.dataUrl);
      else if (!refused) refused = result.error;
    }
    setBusy(false);
    if (added.length) onChange([...rows, ...added].slice(0, limit));
    if (refused) setNote(refused);
  };

  const addLink = () => {
    const next = link.trim();
    if (!next) return;
    if (!room) {
      setNote(`Up to ${limit} images.`);
      return;
    }
    onChange([...rows, next].slice(0, limit));
    setLink("");
    setNote("");
  };

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        {label} ({rows.length}/{limit})
      </Typography>

      {rows.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
          {rows.map((src, index) => (
            <Box key={`${index}-${src.slice(-16)}`} sx={{ position: "relative" }}>
              <Preview src={src} shape="square" size={80} alt={`${label} ${index + 1}`} />
              <IconButton
                size="small"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                aria-label={`Remove image ${index + 1}`}
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "error.main", color: "error.contrastText" },
                }}
              >
                <Icon icon="mdi:close" width={16} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
        <TextField
          size="small"
          label="Image link"
          placeholder="https://…"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addLink();
            }
          }}
          disabled={!room}
          sx={{ flex: "1 1 220px", minWidth: 0 }}
          helperText={helperText}
        />
        <Button size="small" onClick={addLink} disabled={!room || !link.trim()} sx={{ mt: 0.5 }}>
          Add link
        </Button>
        <Box sx={{ mt: 0.5 }}>
          <PickButton
            label={busy ? "Reading…" : "Upload"}
            onFiles={pick}
            disabled={busy || !room}
            multiple
          />
        </Box>
      </Box>

      {note && (
        <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
          {note}
        </Typography>
      )}
    </Box>
  );
};
