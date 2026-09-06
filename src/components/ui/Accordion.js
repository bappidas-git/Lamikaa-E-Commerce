import React, { useCallback, useId, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "./Accordion.module.css";

// =============================================================================
// Accordion — the disclosure pattern, once, to WAI-ARIA
// =============================================================================
//
// Used by the home FAQs, the PDP chapters, the policy pages and the admin's
// content editor. Getting it right once is the whole point: an accordion is one
// of the easiest components to ship inaccessibly and one of the most common on
// a storefront.
//
// THE CONTRACT
//   • every header is a real <button> inside a heading, carrying
//     `aria-expanded` and `aria-controls`
//   • every panel is `role="region"` labelled by its header's id
//   • ArrowUp / ArrowDown move between HEADERS (wrapping), Home / End jump to
//     the first and last — the pattern's own keys, on top of Tab, which still
//     walks the whole page
//   • a collapsed panel is `visibility: hidden`, so its links and buttons leave
//     the tab order in every browser rather than only where `inert` is supported
//
// THE HEIGHT ANIMATION is `grid-template-rows: 0fr -> 1fr` on the panel, which
// animates to the content's OWN height without measuring anything in JavaScript
// — no ResizeObserver, no scrollHeight read, and no jump when the content
// changes while open. Under `prefers-reduced-motion` the token layer zeroes
// --sf-transition and the panel simply snaps.
//
// `defaultOpen` accepts an id or an array of ids; `multiple` decides whether
// opening one closes the others. `onToggle(id, isOpen)` reports every change.
// =============================================================================

const toSet = (value) => {
  if (value == null) return new Set();
  return new Set(Array.isArray(value) ? value : [value]);
};

const Accordion = ({
  items = [],
  multiple = false,
  defaultOpen,
  onToggle,
  className = "",
  headingLevel: Heading = "h3",
  ...rest
}) => {
  const baseId = useId();
  const [open, setOpen] = useState(() => toSet(defaultOpen));
  const headerRefs = useRef([]);

  const toggle = useCallback(
    (id) => {
      setOpen((current) => {
        const next = new Set(multiple ? current : []);
        if (current.has(id)) next.delete(id);
        else next.add(id);
        onToggle?.(id, next.has(id));
        return next;
      });
    },
    [multiple, onToggle]
  );

  // ArrowUp/ArrowDown/Home/End move between headers. Tab is untouched: it still
  // leaves the accordion, which is what a visitor who wants the rest of the
  // page expects.
  const onHeaderKeyDown = (event, index) => {
    const last = items.length - 1;
    let target = null;
    if (event.key === "ArrowDown") target = index === last ? 0 : index + 1;
    else if (event.key === "ArrowUp") target = index === 0 ? last : index - 1;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = last;
    if (target == null) return;
    event.preventDefault();
    headerRefs.current[target]?.focus();
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")} {...rest}>
      {items.map((item, index) => {
        const isOpen = open.has(item.id);
        const headerId = `${baseId}-h-${item.id}`;
        const panelId = `${baseId}-p-${item.id}`;
        return (
          <div
            key={item.id}
            className={[styles.item, isOpen ? styles.itemOpen : ""].filter(Boolean).join(" ")}
          >
            <Heading className={styles.heading}>
              <button
                type="button"
                id={headerId}
                ref={(node) => {
                  headerRefs.current[index] = node;
                }}
                className={styles.trigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                onKeyDown={(event) => onHeaderKeyDown(event, index)}
              >
                <span className={styles.title}>{item.title}</span>
                <Icon
                  icon="mdi:chevron-down"
                  className={styles.chevron}
                  aria-hidden="true"
                />
              </button>
            </Heading>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={[styles.panel, isOpen ? styles.panelOpen : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <div className={styles.panelInner}>
                <div className={styles.content}>{item.content}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
