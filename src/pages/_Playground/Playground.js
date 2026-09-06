import React, { useState } from "react";
import {
  Accordion,
  Button,
  Chip,
  CloudinaryImage,
  ContentBlocks,
  Drawer,
  GlassCard,
  GlowWrap,
  Modal,
  Price,
  SectionHeading,
  Skeleton,
  VideoPlayer,
} from "../../components/ui";
import { normalizeProduct } from "../../utils/product";
import styles from "./Playground.module.css";

// =============================================================================
// /_playground  —  TEMPORARY. Prompt 35 deletes this folder and its route.
// =============================================================================
//
// The visual QA surface for the primitive layer (Prompts 05-08): every
// component from src/components/ui in every state it can be in, on one page, so
// a regression in a shared control is caught here rather than three prompts
// later on a page that happens to use it.
//
// It is deliberately unreachable from the navigation and unlinked from the
// sitemap. Nothing else in the application may import from this folder — when
// it goes, nothing else can go with it.
//
// WHAT TO CHECK, at 360 / 390 / 414 / 768 / 1024 / 1280 / 1440:
//   • no horizontal scroll at any width
//   • Tab through the whole page: every control shows the champagne ring
//   • the drawer traps focus on each side, Escape closes, focus returns
//   • the modal at each size; below 480px every size is the same sheet
//   • the video player's controls are reachable with a thumb; Space/K/M/arrows
//   • the plate images contain-fit with no white edge (the Body Wash crop is
//     the one with transparent corners)
//   • the content column never exceeds 68ch (76ch editorial)
//   • with `prefers-reduced-motion: reduce`: no card or button transition, the
//     accordion snaps, the glow stops breathing
// =============================================================================

const FACE_WASH_COVER =
  "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Black-Rice-Face-Wash-Cover.jpg";
const BODY_WASH_COVER =
  "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670690/Body-Wash-Cover.jpg";
const PLACEHOLDER_CLIP =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

// The two price shapes the storefront has to render: a product with a
// packaging MRP, and one whose price is not set yet.
const PRICED_PRODUCT = normalizeProduct({
  id: 1,
  name: "Black Rice Face Wash",
  price: 390,
  comparePrice: 500,
  images: [FACE_WASH_COVER],
});

const TBA_PRODUCT = normalizeProduct({
  id: 3,
  name: "Black Rice Body Wash",
  price: null,
  media: [
    {
      type: "image",
      url: BODY_WASH_COVER,
      alt: "Black Rice Body Wash — label",
      primary: true,
      crop: { x: 715, y: 30, w: 395, h: 710 },
    },
  ],
});

const CONTENT_SAMPLE = [
  "## Every rule in the grammar",
  "",
  "A paragraph whose lines are **wrapped** in the source, joined on render, and",
  "held to a comfortable measure. It carries a [link to the shop](/shop), an",
  "[external one](https://example.org) and an [unsafe one](javascript:void 0)",
  "that renders as its own source text.",
  "",
  "### A third-level heading",
  "",
  "- An unordered item",
  "- A second one",
  "",
  "1. An ordered item",
  "2. A second one",
  "",
  "> A quotation whose consecutive lines",
  "> join into one.",
  "",
  "---",
  "",
  "::callout Patch test first",
  "Apply a little to the inner arm.",
  "",
  "Wait twenty-four hours before using it on the face.",
  "::",
  "",
  "::steps",
  "- The farmer-members grow the black rice",
  "- The co-operative mills and extracts it",
  "- The formula is made and filled",
  "- It reaches you, and the margin goes back",
  "::",
].join("\n");

const FAQ_ITEMS = [
  {
    id: "a",
    title: "How often should I use the face wash?",
    content: (
      <p>
        Morning and evening, as printed on the pack. Massage gently on a wet face
        and rinse thoroughly. <a href="/shop">A link, to check the tab order.</a>
      </p>
    ),
  },
  {
    id: "b",
    title: "Is it suitable for sensitive skin?",
    content: <p>All skin types — patch test recommended.</p>,
  },
  {
    id: "c",
    title: "Where is it made?",
    content: <p>In Assam, by the farmer-members who grow the rice.</p>,
  },
];

const BUTTON_VARIANTS = ["primary", "secondary", "ghost", "addToCart", "icon"];

const Section = ({ title, eyebrow, lede, children, ...rest }) => (
  <section className={styles.section}>
    <SectionHeading eyebrow={eyebrow} title={title} lede={lede} rule {...rest} />
    {children}
  </section>
);

const Playground = () => {
  const [modalSize, setModalSize] = useState(null);
  const [drawerSide, setDrawerSide] = useState(null);
  const [cartState, setCartState] = useState("idle");

  // The three add-to-cart states, walked by one press so the live region can be
  // heard doing its job.
  const runCart = () => {
    setCartState("loading");
    setTimeout(() => setCartState("success"), 900);
    setTimeout(() => setCartState("idle"), 2600);
  };

  return (
    <div className={`sf-container ${styles.page}`}>
      <header className={styles.masthead}>
        <p className="sf-eyebrow sf-eyebrow--rule">Temporary · removed by Prompt 35</p>
        <h1 className={styles.h1}>
          Primitive <span className="sf-gradient-text">playground</span>
        </h1>
        <p className={styles.lede}>
          Every component in <code>src/components/ui</code>, in every state. Not
          linked from anywhere; this page is the visual QA surface for Prompts
          05–08.
        </p>
      </header>

      {/* ---- Buttons ------------------------------------------------------ */}
      <Section
        eyebrow="Controls"
        title="Buttons"
        lede="Five variants across idle, disabled and loading, plus the three add-to-cart states."
      >
        {BUTTON_VARIANTS.map((variant) => (
          <div key={variant} className={styles.row}>
            <span className={styles.rowLabel}>{variant}</span>
            <Button
              variant={variant}
              icon={variant === "icon" ? "mdi:heart-outline" : undefined}
              srLabel={variant === "icon" ? "Save to wishlist" : undefined}
            >
              {variant === "icon" ? null : "Add to bag"}
            </Button>
            <Button
              variant={variant}
              disabled
              icon={variant === "icon" ? "mdi:heart-outline" : undefined}
              srLabel={variant === "icon" ? "Save to wishlist (disabled)" : undefined}
            >
              {variant === "icon" ? null : "Disabled"}
            </Button>
            <Button
              variant={variant}
              loading
              icon={variant === "icon" ? "mdi:heart-outline" : undefined}
              srLabel={variant === "icon" ? "Saving" : undefined}
            >
              {variant === "icon" ? null : "Loading"}
            </Button>
          </div>
        ))}

        <div className={styles.row}>
          <span className={styles.rowLabel}>sizes</span>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button variant="secondary" to="/shop">
            As a router link
          </Button>
          <Button variant="ghost" as="a" href="https://example.org" icon="mdi:open-in-new" iconPosition="right">
            As an anchor
          </Button>
        </div>

        <div className={styles.row}>
          <span className={styles.rowLabel}>add to cart</span>
          <Button
            variant="addToCart"
            onClick={runCart}
            loading={cartState === "loading"}
            success={cartState === "success"}
          >
            Add to bag
          </Button>
          <Button variant="primary" block>
            Block
          </Button>
        </div>
      </Section>

      {/* ---- Chips -------------------------------------------------------- */}
      <Section eyebrow="Labels" title="Chips" lede="Trust marks, concerns, ritual numerals and statuses.">
        <div className={styles.row}>
          <span className={styles.rowLabel}>trust</span>
          <Chip variant="trust">Farmer to Consumer</Chip>
          <Chip variant="trust">100% Organic</Chip>
          <Chip variant="trust">Result Oriented</Chip>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>concern</span>
          <Chip variant="concern" tone="pink">Brightening</Chip>
          <Chip variant="concern" tone="violet">Anti-ageing</Chip>
          <Chip variant="concern" tone="cyan">Hydration</Chip>
          <Chip variant="concern" tone="gold">Cleansing</Chip>
          <Chip variant="concern" tone="mint">Soothing</Chip>
          <Chip variant="concern" tone="rose">Sensitive skin</Chip>
          <Chip variant="concern" tone="oiliness">Hashed tone</Chip>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>status</span>
          <Chip variant="status" tone="success">Delivered</Chip>
          <Chip variant="status" tone="warning">Pending</Chip>
          <Chip variant="status" tone="danger">Cancelled</Chip>
          <Chip variant="status" tone="info">Shipped</Chip>
          <Chip variant="status" tone="neutral">Draft</Chip>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>step / glass</span>
          <Chip variant="step">1</Chip>
          <Chip variant="step">2</Chip>
          <Chip variant="glass">Filter</Chip>
          <Chip variant="glass" active>
            Active
          </Chip>
          <Chip variant="glass" as="button" onClick={() => {}}>
            Interactive
          </Chip>
        </div>
      </Section>

      {/* ---- Headings ----------------------------------------------------- */}
      <Section eyebrow="Type" title="Section headings">
        <div className={styles.stack}>
          <SectionHeading
            eyebrow="Left, with a rule"
            title="Skincare that pays the farmer first"
            lede="One quiet line of support underneath, held to sixty characters so it never becomes a paragraph."
            rule
            gradientWord={1}
            actions={<Button variant="ghost">View all</Button>}
          />
          <SectionHeading
            align="center"
            eyebrow="Centred"
            title="Rooted in Assam"
            lede="The centred variant, for a section that opens on itself."
          />
          <SectionHeading as="h3" title="A bare h3, no eyebrow, no lede" />
        </div>
      </Section>

      {/* ---- Cards and glow ----------------------------------------------- */}
      <Section
        eyebrow="Surfaces"
        title="Glass cards and ambient glow"
        lede="Each glow tone behind a card, plus the breathing one — at most one of those per viewport."
      >
        <div className={styles.grid}>
          {["pink", "violet", "gold", "duo"].map((tone) => (
            <GlassCard key={tone} interactive glow={tone} padding="lg">
              <h3 className={styles.cardTitle}>glow={tone}</h3>
              <p className={styles.cardBody}>
                Interactive: lifts on hover, hairline firms, glow fades in.
              </p>
            </GlassCard>
          ))}
          <GlassCard padding="lg" strong>
            <h3 className={styles.cardTitle}>strong, no glow</h3>
            <p className={styles.cardBody}>The modal/header ground, one step more opaque.</p>
          </GlassCard>
          <GlowWrap tone="gold" intensity={0.3} breathe offset={{ x: 10, y: -6 }} size={130}>
            <GlassCard padding="lg" scrim>
              <h3 className={styles.cardTitle}>GlowWrap</h3>
              <p className={styles.cardBody}>
                intensity 0.30, breathing, offset 10/-6%, size 130%.
              </p>
            </GlassCard>
          </GlowWrap>
        </div>
      </Section>

      {/* ---- Media -------------------------------------------------------- */}
      <Section
        eyebrow="Media"
        title="Images and video"
        lede="The Face Wash cover cropped and padded onto a 1:1 plate, the Body Wash crop beside it, and the placeholder clip."
      >
        <div className={styles.mediaGrid}>
          <figure className={styles.figure}>
            <CloudinaryImage
              src={FACE_WASH_COVER}
              alt="Black Rice Face Wash — label"
              plate
              crop={{ x: 1050, y: 100, w: 1500, h: 3200 }}
              ar="1:1"
              pad
              priority
              sizes="(max-width: 768px) 100vw, 320px"
            />
            <figcaption className={styles.caption}>plate · crop · pad · priority</figcaption>
          </figure>

          <figure className={styles.figure}>
            <CloudinaryImage
              src={BODY_WASH_COVER}
              alt="Black Rice Body Wash — label"
              plate
              crop={{ x: 715, y: 30, w: 395, h: 710 }}
              ar="1:1"
              pad
              sizes="(max-width: 768px) 100vw, 320px"
            />
            <figcaption className={styles.caption}>the transparent-corner crop</figcaption>
          </figure>

          <figure className={styles.figure}>
            <CloudinaryImage
              src="https://picsum.photos/seed/lamikaa-farm/1600/1000"
              alt=""
              aspectRatio="16 / 10"
              fit="cover"
              placeholder
              sizes="(max-width: 768px) 100vw, 320px"
            />
            <figcaption className={styles.caption}>placeholder treatment · cover</figcaption>
          </figure>

          <figure className={styles.figure}>
            <CloudinaryImage src="" alt="A deliberately empty source" aspectRatio="1" />
            <figcaption className={styles.caption}>no source → inline placeholder</figcaption>
          </figure>
        </div>

        <div className={styles.mediaGrid}>
          <figure className={styles.figure}>
            <VideoPlayer
              src={PLACEHOLDER_CLIP}
              poster={FACE_WASH_COVER}
              title="How to use (placeholder video)"
              className={styles.video}
            />
            <figcaption className={styles.caption}>inline controls</figcaption>
          </figure>
          <figure className={styles.figure}>
            <VideoPlayer
              src={PLACEHOLDER_CLIP}
              poster={FACE_WASH_COVER}
              title="Minimal variant"
              controlsVariant="minimal"
              className={styles.video}
            />
            <figcaption className={styles.caption}>minimal controls</figcaption>
          </figure>
          <figure className={styles.figure}>
            <VideoPlayer
              src="https://example.invalid/not-a-video.mp4"
              poster={FACE_WASH_COVER}
              title="A source that cannot load"
              className={styles.video}
            />
            <figcaption className={styles.caption}>error → poster + notice</figcaption>
          </figure>
        </div>
      </Section>

      {/* ---- Price -------------------------------------------------------- */}
      <Section eyebrow="Commerce" title="Price" lede="Known and unknown, at all three sizes.">
        <div className={styles.grid}>
          <GlassCard padding="md">
            <p className={styles.rowLabel}>known · lg / md / sm</p>
            <Price product={PRICED_PRODUCT} size="lg" showSavings taxNote="Inclusive of all taxes" />
            <Price product={PRICED_PRODUCT} size="md" />
            <Price product={PRICED_PRODUCT} size="sm" />
          </GlassCard>
          <GlassCard padding="md">
            <p className={styles.rowLabel}>unknown · lg / md / sm</p>
            <Price product={TBA_PRODUCT} size="lg" taxNote="Inclusive of all taxes" />
            <Price product={TBA_PRODUCT} size="md" />
            <Price product={TBA_PRODUCT} size="sm" />
          </GlassCard>
          <GlassCard padding="md">
            <p className={styles.rowLabel}>bare numbers · a cart line</p>
            <Price price={390} comparePrice={500} size="md" showSavings />
            <Price price={null} size="md" />
          </GlassCard>
        </div>
      </Section>

      {/* ---- Accordion ---------------------------------------------------- */}
      <Section
        eyebrow="Disclosure"
        title="Accordion"
        lede="Single-open on the left, multi-open on the right. Arrow keys, Home and End move between headers."
      >
        <div className={styles.twoUp}>
          <Accordion items={FAQ_ITEMS} defaultOpen="a" />
          <Accordion items={FAQ_ITEMS} multiple defaultOpen={["a", "b"]} />
        </div>
      </Section>

      {/* ---- Overlays ----------------------------------------------------- */}
      <Section
        eyebrow="Overlays"
        title="Modal and drawer"
        lede="Each traps focus, closes on Escape and on navigation, and returns focus to the button that opened it. A full modal fills the viewport and hands its body padding to its child, which is why this demo's copy sits flush."
      >
        <div className={styles.row}>
          <span className={styles.rowLabel}>modal</span>
          {["sm", "md", "lg", "full"].map((size) => (
            <Button key={size} variant="secondary" onClick={() => setModalSize(size)}>
              {size}
            </Button>
          ))}
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>drawer</span>
          {["left", "right", "bottom"].map((side) => (
            <Button key={side} variant="secondary" onClick={() => setDrawerSide(side)}>
              {side}
            </Button>
          ))}
        </div>

        <Modal
          open={modalSize !== null}
          onClose={() => setModalSize(null)}
          title={`A ${modalSize || ""} modal`}
          size={modalSize || "md"}
          footer={
            <>
              <Button variant="ghost" onClick={() => setModalSize(null)}>
                Cancel
              </Button>
              <Button onClick={() => setModalSize(null)}>Confirm</Button>
            </>
          }
        >
          <p>
            Tab cycles inside this panel and never leaves it. Escape closes it,
            the backdrop closes it, and focus returns to the button you pressed.
          </p>
          <p>
            <a href="/shop">A link, so there is more than one stop in the ring.</a>
          </p>
        </Modal>

        <Drawer
          open={drawerSide !== null}
          onClose={() => setDrawerSide(null)}
          side={drawerSide || "right"}
          title={`A ${drawerSide || ""} drawer`}
          footer={<Button block onClick={() => setDrawerSide(null)}>Done</Button>}
        >
          <p>
            Full width below 481px, 420px above it. The bottom side is a sheet at
            85svh with a grab handle.
          </p>
          <p>
            While this is open <code>body[data-drawer-open]</code> is set, which
            is how the sticky header drops its blur (Prompt 09).
          </p>
        </Drawer>
      </Section>

      {/* ---- Skeletons ---------------------------------------------------- */}
      <Section eyebrow="Loading" title="Skeletons" lede="Each shape claims the space its content will take.">
        <div className={styles.grid}>
          <div>
            <p className={styles.rowLabel}>text · 4 lines</p>
            <Skeleton variant="text" lines={4} />
          </div>
          <div>
            <p className={styles.rowLabel}>block · 16 / 9</p>
            <Skeleton variant="block" aspectRatio="16 / 9" />
          </div>
          <div>
            <p className={styles.rowLabel}>circle</p>
            <Skeleton variant="circle" />
          </div>
          <div>
            <p className={styles.rowLabel}>card</p>
            <Skeleton variant="card" />
          </div>
        </div>
      </Section>

      {/* ---- Content blocks ------------------------------------------------ */}
      <Section
        eyebrow="Copy"
        title="Content blocks"
        lede="The markdown-lite grammar in full, in both variants. No raw markup anywhere in the path — every node is a React element."
      >
        <div className={styles.twoUp}>
          <div>
            <p className={styles.rowLabel}>variant=&quot;prose&quot;</p>
            <ContentBlocks text={CONTENT_SAMPLE} />
          </div>
          <div>
            <p className={styles.rowLabel}>variant=&quot;editorial&quot;</p>
            <ContentBlocks text={CONTENT_SAMPLE} variant="editorial" />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Playground;
