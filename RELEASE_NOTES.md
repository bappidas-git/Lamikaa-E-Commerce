# Release notes

## 1.4.3-lamikaa — 2026-09-14

Two things a merchant saw on the home page and could not explain: a hard line
drawn straight across the hero's photograph a little above the control rail,
which the admin's own live preview never showed; and a product card that had
quietly shrunk on every laptop. Both are fixed, and the second is a decision
put back rather than a bug: the card is bounded by the band, not by what the
band spends on furniture.

### Fixed

- **The overlay no longer leaves a line across the hero.** The ground under the
  hero's copy (`panel: "scrim"`) is an absolutely positioned `::before` on
  `.copy` — and an absolutely positioned box is laid out against the nearest
  POSITIONED ancestor, not against the element it is attached to. `.copy`
  carried `isolation: isolate` and nothing else, and isolation opens a stacking
  context (paint ORDER) without touching the containing block, so the bloom
  resolved against `.stage` instead: one radial wash the full width and height
  of the carousel, with a hard edge where the stage ends — 116px above the foot
  of the band, straight through the arrows and the counter. `position: relative`
  on `.copy` puts the plate back in the column it belongs to. This is also
  exactly why the storefront did not match Admin → Home & Hero: the preview's
  copy column has always set `position: relative`, so it drew the same gradient
  correctly. Measured on the built storefront at 1536x760 and 1920x905, on all
  eight slides: the seam is gone, and the plate is the bounded, soft-edged
  bloom the preview shows.

- **The hero's product card is its designed size again.** 1.4.2 took the control
  rail and the slide's own padding off the card's height budget, which cost a
  laptop a fifth of its pack — 474px where the composition was drawn at 560, and
  384px on a 1536x760 screen. The budget is the band's own height once more
  (`--sf-hero-card-fit: calc((100svh - var(--sf-hero-chrome)) * 0.8)`), so the
  card is 560px at 1920x905, 534px at 1366x768 and 528px at 1536x760. A phone's
  card is bounded by the screen's WIDTH again (`80vw`, not `min(80vw, 42svh)`):
  a phone scrolls, and a card sized from the height of a handset held on its
  side is 151px of pack on a 360px-tall screen. Portrait was never affected in
  either direction. The height that 1.4.2 was looking for is still found — in
  the short-screen bracket's padding and leading, which nobody is looking at —
  and on a screen 900px or shorter it keeps the band 32px shorter than it was
  before 1.4.2 at the same card size.

  **The trade-off, stated:** a 4:5 card 560px wide is 700px tall, and 700px of
  card plus 40px of padding plus the 140px rail does not fit in the 660px a
  "Full screen" band has at 1536x760 however it is divided. With the card at its
  designed size the rail sits below the fold on a short laptop — which is the
  behaviour the band had before 1.4.2, and is the way round the size was asked
  for. A merchant who wants the controls above the fold on a short screen can
  set the card below 100% in Admin → Home & Hero → Composition, or choose the
  "Compact" band height.

### Changed

- **`HeroCarousel.test.js` pins the decision rather than its opposite.** The
  guard added in 1.4.2 asserted that the rail comes off the card's budget; two
  guards now assert that it does not and that the budget is the band's own
  height, so the next edit reads the reasoning before reversing it. A third
  reads `.copy` and asserts both `position: relative` and `isolation: isolate`
  — jsdom computes no CSS module, so a containing block lost to an unrelated
  edit can fail no other way.

## 1.4.2-lamikaa — 2026-09-14

The home page's opening spread is a carousel again on the screen most visitors
have. Its controls — the arrows, the pause, the counter, the progress hairline
and the row of product names — had been pushed below the fold on every laptop,
so the band read as one still photograph; and the headline had lost the rule
that typeset it, which set it at the browser's own 32px on every phone and
tablet and moved the whole page on every advance.

### Fixed

- **The hero headline is typeset again.** `.headline` in
  `HeroCarousel.module.css` — its measure, display face, size, weight, leading
  and tracking — was deleted by an unrelated edit to the eyebrow beside it
  (1.4.1), and nothing failed: the class is a CSS module, so no test computes
  it, and the ACTIVE slide still looked almost right because its headline is an
  `<h1>` and the global stylesheet gives an `h1` a face and a leading. Below
  1025px there was no size left at all and the hero opened at the browser's
  default 2em; the other seven slides, which render as `<p>`, were set in the
  BODY face at the display size. The rule is restored.

- **The band no longer moves under the visitor on every advance.** That is the
  same deletion, seen from below: the stage is one grid cell as tall as its
  TALLEST slide, so seven slides measured in the wrong face measured the wrong
  height, and which slide was the tallest changed each time the active one did.
  Measured across the eight slides, the band moved by up to 62px on a laptop
  and 48px on a phone between advances; it is 0 on both now.

- **A band asked to be one screen tall is one screen tall.** The card's height
  budget was the whole screen, leaving the control rail and the slide's own
  padding nowhere to go but under it — so a "full screen" hero was 984px on an
  800px laptop and every control sat below the fold. The rail and that padding
  now come off the budget first (`--sf-hero-rail`, `--sf-hero-slide-pad`, both
  declared once on the section and read by the boxes that draw them), the copy
  takes one step down the type scale and a tighter rhythm on a screen 900px or
  shorter, and the whole composition — words, card, buttons, arrows, counter,
  progress and all eight product names — lands on one screen from 1366x768 up.

- **A phone's card is bounded by the screen's height as well as its width.**
  `80vw` on a handset turned on its side is a card taller than the screen it is
  on; it is `min(80vw, 42svh)` now. Portrait is unchanged — it never reaches
  the second term.

- **The progress hairline has a track over a photograph.** Its 10%-opacity
  ground was invisible against the artwork, leaving the gradient fill floating
  with no rule to read as progress along. It takes a real ground now, for the
  same reason the glass circles beside it do.

### Added

- **Two guards in `HeroCarousel.test.js`** for the rules above, because both
  were lost silently and neither can fail loudly: the stylesheet is read as
  text and asserted to typeset the headline on the CLASS (not on the `h1`), and
  to subtract the rail and the slide's padding from the card's budget.

## 1.4.1-lamikaa — 2026-09-14

The home page now opens on the brand's argument rather than on a repeated
label. Every slide of the hero carousel carries a **tagline** of its own — the
tracked gold line over the headline — and the first one is
**"Ancient Wisdom. Modern Beauty."**: traditional knowledge and contemporary
skincare, said in four words before a visitor has scrolled anything.

### Added

- **A tagline per hero slide.** `heroConfig.slides[].eyebrow` is now read on a
  PRODUCT slide as well as on a poster (`heroSlideEyebrow` in
  `src/components/home/HeroCarousel.js`), so each slide opens on its own line
  instead of on one section-wide label. The eight slides read: *Ancient Wisdom.
  Modern Beauty.* · *Handed Down. Made New.* · *Old Rituals. New Mornings.* ·
  *Ancient Grain. Modern Glow.* · *Heritage Fields. Modern Skin.* · *Timeless
  Care. New Radiance.* · *Age-Old Craft. Modern Ease.* · *Ancestral Roots.
  Modern Light.*

- **Admin → Home & Hero edits it.** A product slide's editor gained "Tagline
  over the headline (optional)", above the headline it sits over, and the live
  preview resolves it exactly as the storefront does. It is the one word of a
  product slide's copy stored on the SLIDE rather than on the product — this
  slide's line in the carousel's argument, not a fact about the product — so a
  product dropped from the hero does not carry it into the catalogue.

### Changed

- **A tagline is printed on its own.** The position (`· 03 / 08`) is still
  appended to `heroConfig.eyebrowLabel`, which is what a label repeated on
  every slide needed to be worth reading, but not to a sentence written for one
  slide. Nothing is lost: the rail under the stage still draws the counter, and
  the slide's own `aria-label` ("1 of 8: Black Rice Face Wash") is what a
  screen reader hears either way. A slide with no tagline of its own is
  unchanged — it still prints "Black Rice Ritual · 03 / 08".

- **The line is set to wrap, on every device.** `HeroCarousel.module.css` gives
  the eyebrow `text-wrap: balance` (with `pretty` beneath it) and no `ch`
  measure — `ch` cannot see the 0.14em tracking and would fold a tagline that
  had room to spare. Measured on the built storefront, all eight taglines set
  on ONE line from 320px to 1600px; squeezed further (a glass plate's padding,
  the split composition's third of a spread) they break into two even lines at
  the clause rather than overflowing the column.

## 1.4.0-lamikaa — 2026-09-13

Customers can now show what they are talking about — a photograph of themselves
beside their name, and up to three pictures of the product — and the store has
a **"What our customers say"** band at the foot of every page. The band is not a
second place to write anything: it reads the same approved reviews the product
pages print, so a review is written once and read wherever it belongs.

### Added

- **"What our customers say", on every storefront page.** One band, mounted
  once in the shell (`src/components/storefront/Testimonials.js`), so it rides
  every route and reads once per visit rather than once per page: the eyebrow,
  the headline with its one gradient word, and a rail of quote cards — stars,
  the title, the words, the customer's pictures, then their photograph, name,
  verified mark and date, and a link to the product the review is about. It is
  a `<figure>` with a `<blockquote>` and a `<figcaption>`, which is what a
  quotation with an attribution is.

- **The same reviews, never written twice.** There is no `testimonials`
  collection and no second admin screen. `reviews.getPublished()` reads the
  approved rows across the whole catalogue and `src/utils/testimonials.js`
  decides which of them the band carries — the owner's featured rows first,
  then the ones with a face on them, then the most recent. A review needs WORDS
  to qualify (a bare five stars is a rating, not a quote) and, unless it is
  featured, four stars or better; the product page still prints every approved
  review it has, unfiltered, so that is curation rather than concealment.

- **And never twice on one screen.** On a product page the band drops the
  reviews of THAT product — they are printed in full a few hundred pixels above
  — and carries what other customers said about the rest of the range. If that
  leaves nothing, the band takes itself off the page.

- **A photograph with your review.** The review dialog (My Orders → a delivered
  order → Write a review) now takes two kinds of picture, and says which is
  which: YOUR PHOTO, the face that sits beside your name on the product page
  and in the band, and up to three pictures OF THE PRODUCT. Both are optional —
  a monogram stands in for the portrait, and nobody is asked for a face to be
  heard.

- **Pictures that fit in a row.** `src/utils/imageFile.js` draws a picked file
  into a canvas before it is attached: a 5 MB phone photograph travels as a
  ~200 KB JPEG data URL (1200px on its longest edge; a portrait is 320px).
  Transparency is flattened onto white rather than onto black, a file that is
  already smaller than its re-encode is kept as it is, and every refusal is a
  sentence the picker prints under the field. This is the one place in the app
  that stores an image instead of pointing at Cloudinary, and it exists because
  the person writing a review has a photograph and no asset pipeline.

- **Admin → Reviews grew the other half of the job.** Every row can now carry a
  customer photo and up to three review photos — pasted as links, exactly as
  `MediaManager` works, or picked off this computer through the same resizer the
  storefront dialog uses — and a **"Feature in What our customers say"** mark,
  which is the curation the band sorts on (togglable from the table with one
  press, and only on an approved row). The table shows the photograph, the
  featured mark and the picture count; the detail dialog shows the pictures
  themselves.

- **Editing a review.** The Add dialog opens on an existing row now, so a review
  can be corrected — or given the photograph the customer sent afterwards —
  instead of only being approved or deleted.

### Changed

- **The reviewer's disc is a photograph when there is one.** The product page's
  reviews and the new band share `ReviewerAvatar`, so "who wrote this?" is
  answered identically on both surfaces: the customer's own picture, or their
  initial in the display serif on the hairline ring that was already there. A
  dead link falls back to the monogram rather than to the landscape placeholder.

- **Every write in Admin → Reviews tells the storefront.** Approving, featuring,
  editing or deleting fires `reviews:updated`, so a storefront open in the same
  tab refreshes its band without a reload; one in another tab picks it up on
  focus.

### Notes

- **Nothing is fabricated.** Every card in the band is a real approved review
  with a real name (BRAND.md §3.9 rule 6): the two seeded rows are still
  `isSample` and still hidden behind `brand.flags.showSampleReviews`, and a
  store with no approved reviews shows no band at all. To fill it: Admin →
  Reviews → Add Review (or approve what a customer wrote), add the photo, tick
  Feature.

- **It costs nothing until it is nearly on screen.** The band is a lazy chunk
  (the main bundle grew 298 B) and fetches nothing until it is within 600px of
  the viewport; while it waits it draws no skeleton and reserves no space, so a
  store with nothing to show has nothing to look at. Checkout is the one route
  it stays off — a payment is not a place to start reading about face cream.

- **Backend.** `GET /reviews/testimonials?limit=&includeSample=` is a new live
  endpoint, and `POST /products/{id}/reviews` now carries `photos[]` and
  `avatar`. Both are specified in `prompts/_reference/REPO_MAP.md` §3.4/§3.5.

## 1.3.2-lamikaa — 2026-09-13

The hero's live preview is a picture of the home page again — the same crop of
the same product card, on each of the three devices the composition is drawn
for — and the section's default composition is something a merchant can watch
work. And three of the storefront's own hero rules — the ground under the copy
among them — turn out never to have reached the page at all.

### Added

- **A tablet in the live preview.** Admin → Home & Hero previewed a desktop and
  a phone; the card's size has been set per device on three sliders since 1.3.1,
  and the tablet's was the one nobody could see. The preview's device switch is
  now built from the same three devices those sliders are (`HERO_MEDIA_DEVICES`)
  — desktop (1025px and wider), tablet (769–1024px), phone (768px and narrower)
  — and each draws that device's own composition: the tablet lays the spreads
  out at the 420px they are drawn at there, the phone stacks one column with a
  SQUARE card, and the desktop takes the full 560px.

- **The band's height, in the preview.** Compact, Full screen and Tall are set
  on the same screen and changed nothing in the picture beside them. The preview
  now holds the band's own proportion for the device it is showing, and grows
  past it when the slide's content needs the room — which is what `min-height`
  does to the band itself.

### Fixed

- **The live preview was showing the old crop of every product card.** When the
  eight covers became lifestyle photographs, the editorial stages — the hero's
  card, the home chapters and the PDP — moved from `c_pad,b_auto` (the whole
  shot letterboxed onto a band of sampled brown) to `c_fill,g_center`. The
  admin's preview kept asking for `stageSrc`, so a merchant arranging the
  carousel was shown a pack sitting small in a padded frame while the home page
  drew it filling the plate. The preview asks for `stageFillSrc` now — 1:1 on a
  phone, 4:5 above it — and paints it with `object-fit: cover`: the same file
  and the same fit the storefront requests. (`fillSrc`/`stageFillSrc` are the
  named twins of `plateSrc`/`stageSrc`, so there is one place to read the rule.)

- **Section settings → Default composition did nothing you could see.** The
  preview beside it was drawing a SLIDE, and a slide that has its own
  composition, picture or ground is exactly the slide the defaults do not
  reach — so an editor could change the default composition, watch nothing move,
  and reasonably conclude the control was broken. That preview is now composed
  from the section's own layout, picture and ground (on the first slide's words
  and card), which is what those controls actually write; when the slide it
  borrowed its words from overrides something, it says so under the frame.

- **A slide's composition overrode everything, not the one key it was given.**
  `normalizeHeroSlide` filled a slide's `layout` in on the way through, so a
  slide stored as `{ preset: "split" }` came back holding all ten keys with the
  DEFAULTS standing in for the nine nobody touched — and the section's
  composition could never move that slide again. Opening one slide in the admin
  and changing one field was enough to freeze it. A slide's layout is a PATCH
  now (`normalizeHeroLayoutPatch`), the editor diffs what it is holding against
  the section before storing it (`diffHeroLayout`), and `mediaScale` is per
  device inside that — so a slide that wants a bigger card on the desktop keeps
  the section's phone and tablet sizes. Which is what the line above the editor
  has always promised.

- **`--sf-space-7` does not exist, and four hero rules asked for it.** The
  spacing scale runs 1–6, 8, 10, 12, 16, 20, 24, 32; an undefined custom
  property is invalid at computed-value time, which UNSETS the property rather
  than falling back, so three of those rules were silently doing nothing on the
  storefront:
  - **the ground under the copy was never painted.** `.panelScrim::before` — the
    plate `resolveHeroPanel` computes, the thing that lets a merchant take the
    scrim to 0 without losing the headline — resolved to `inset: auto` and came
    out a 0×0 box, at every width, on every slide. The admin preview drew it;
    the page did not.
  - **the phone's slide had no gap at all** between the card and the copy
    (`gap: normal`), on every composition.
  - **the glass and solid plates had no padding** below 1025px, so the pane
    hugged the words on every phone and tablet.

- **The mirrored spread put the card under the copy in the preview.** Grid
  auto-placement only moves forwards, and on `text-right` the copy is written
  first and sits in column 2 — so the card could not go back into column 1 of
  the same row and started a second one. Every column in the preview is now
  placed by row AND column, which is the rule the stylesheet states for itself.

- **The admin fetched hero masters at full size.** The preview's backdrop and
  the two picture wells in the background editor pointed `<img>` straight at the
  uploaded URL — the one thing the delivery rule forbids. All three go through
  `cld()` now, at the width they are actually drawn at.

### Changed

- The preview's phone view stacks the buttons full-width and keeps a split
  slide's two copy blocks as two plates, both of which is what the band does
  there; its measures (16/18/26ch headline, 42/34/56ch subtext) and its
  card's share of the stage are now the stylesheet's own numbers rather than
  approximations, so a card set to 130% moves in the preview by the proportion
  it moves on the page.

## 1.3.1-lamikaa — 2026-09-13

The hero's product card is the size it was drawn at again — and how big it is
became a decision the owner makes, on each of the three devices, rather than one
the stylesheet takes on their behalf.

### Added

- **How big the card is, per device (`layout.mediaScale`).** Admin → Home & Hero
  → Composition: three sliders — desktop (1025px and wider), tablet
  (769–1024px) and phone (768px and narrower) — each a percentage of the size
  the composition was drawn at, 50–150%, with 100% being the drawing.
  `Match the desktop size` copies one answer to all three. Held at BOTH levels
  like every other composition key, so the section sets the default and a single
  slide may carry a bigger pack than the rest of the carousel; the live preview
  paints the change on the device it is showing.

  What is stored is the PERCENTAGE, never a width. Six compositions × three
  breakpoints is eighteen designed widths, none of them a merchant's decision to
  make, so they stay in the stylesheet and the stored number scales whichever
  one the visitor's screen lands on — which is how one setting keeps a
  composition's proportions on a monitor, a tablet and a phone at once.

### Changed

- **The card's column is now the card's own width**, not an `fr` share of the
  spread. A proportional track answers "how big is the card?" with "half of
  whatever the spread is", so a card asked to be larger than its share would
  have had nowhere to grow — and one asked to be smaller would have left a hole
  beside the copy rather than giving the room back. The track is sized from the
  card, capped at the share each composition was drawn with (scaled by the same
  percentage) and at a ceiling that always leaves the copy a column to be read
  in. At 100% every composition is laid out exactly as before, at every width.

### Fixed

- **The hero's Section settings showed an empty Ground.** The one Ground select
  was bound to `layout.theme` at both levels — but a section layout reads
  `inherit`, which is not one of the two grounds a section is offered, so the
  field rendered blank until somebody picked something. Worse, picking one wrote
  the band's ground onto the section's LAYOUT, where `resolveHeroTheme` reads it
  first and it silently shadowed `heroConfig.theme`: the record then carried the
  band's ground in two places, disagreeing. The section's select is bound to
  `heroConfig.theme` now — the band's own key, with `layout.theme` left as the
  per-slide override it is documented to be — and `normalizeHeroConfig` LIFTS a
  ground found on a section layout into it, returning the layout to `inherit`.
  A record written by the old screen therefore opens showing the ground it is
  actually painting, and saves back with one source of truth; nothing a visitor
  sees moves.

- **The hero card had quietly become a fifth smaller.** 1.3.0 bounded it by the
  height left over once the chrome, the slide's padding AND the control rail had
  taken theirs — which cost a 900px-tall laptop 96px of card (464px where the
  composition is drawn at 560px), 176px on an 800px window, and nearly half of
  it at 650px. It also did not buy what it was for: what makes a full-screen
  band overflow is the copy column and the rail under it, not the width of the
  pack, and the band on that laptop was taller than the screen either way. The
  ceiling is the band's OWN height now, so the card is the designed size
  wherever there is room for it and gives way only on a genuinely short screen —
  and the size set in the admin multiplies that answer rather than being
  overruled by it.

## 1.3.0-lamikaa — 2026-09-13

The home page's opening band stops being one composition repeated eight times.
A slide can now be a **poster** rather than a product, its copy can sit on
either side of the stage or on both, and the band can be composed on a dark
ground instead of the cream one — all of it from Admin → Home & Hero, none of
it in the stylesheet. And the copy carries its own ground, so a merchant can
take the scrim over a photograph to zero without losing the headline.

The admin panel gains a light mode. Dark stays the default.

### Added

- **Poster slides.** A slide no longer has to be a product. `heroConfig.slides`
  is the ordered carousel and an entry is either `{ kind: "product",
  productId }` or `{ kind: "custom", … }` — a picture with an eyebrow, a
  headline, two lines, some marks, a card of its own and up to two buttons, any
  of which may be blank. *A picture and one button* is a valid slide; so is a
  picture and nothing at all. Posters are added, reordered, duplicated, hidden
  and deleted in the same list the products are.

- **Five compositions, per slide.** `layout.preset` is one of `text-left`
  (the classic spread), `text-right` (mirrored), `text-center`, `split` — the
  card centred with the headline one side and the lines and buttons the other —
  and `poster`. Alongside it: `align` (left / centred / right, or "match the
  layout"), `vertical` (top / middle / bottom), and three switches for whether
  the slide draws its words, its card and its buttons at all. Held at BOTH
  levels: `heroConfig.layout` is the default every slide inherits key by key, so
  a slide that only wants its copy on the other side does not restate the rest.

- **A dark ground for the hero, and the hero only.** `theme: "dark"` puts the
  band in `.sf-on-dark` — the storefront's own dark token scope — so the ink,
  the hairlines, the buttons, the chips, the scrim and the plate under the copy
  all re-point together. Set for the section, overridable per slide, and the
  page around the band is untouched. A dark poster can sit in a cream carousel.

- **The ground under the copy (`layout.panel`).** The fix for type on an
  unscrimmed photograph. The artwork is the merchant's and so is the scrim —
  which goes all the way to zero — so no default veil over the PICTURE can
  guarantee the words. The copy now carries its own: a feathered wash, a pane of
  the storefront's frosted glass, or a solid card. At the default (`auto`) its
  strength is computed from how much work the scrim and the blur are already
  doing — 62% behind the words at a scrim of 0, a whisper at 55, nothing at all
  by 80 or behind an 8px blur. A merchant who drops the scrim to 0 on a bright
  studio frame keeps a readable headline; one who wants the picture untouched
  says `none`.

- **Band height and eyebrow, admin-managed.** `heroConfig.height` is `auto` /
  `compact` / `standard` (the screen, less the header) / `tall`, and the eyebrow
  over a product headline is editable copy rather than a constant.

- **A light mode for the admin panel, dark by default.** One switch in the app
  bar, stored per browser (`lamikaa-admin-theme`), applied above the whole
  `/admin` route tree — so signing in never flashes the other mode.
  `buildAdminTheme(mode)` builds both from one set of component overrides: same
  radii, same density, a different ladder of neutrals and a gold re-picked for
  a pale ground (antique `#825C0E` under a warm-white label, rather than
  champagne under a near-black one). SweetAlert2 and the page scrollbars follow
  by body class, since they render outside the MUI tree.

### Changed

- **The hero is a one-cell grid of complete slides.** Every slide sits in
  `grid-area: 1 / 1` of the stage, so the stage is exactly as tall as its
  tallest slide and nothing below the hero can move when the slide changes —
  the same zero-CLS guarantee the old hidden "copy sizer" bought, by
  construction rather than by mirroring the copy. The build this replaces
  rendered one copy block and updated it in place, which is not possible once
  the copy is in a different place on every slide.

- **The copy fades THROUGH; the card still crossfades.** Two headlines stacked
  in one cell at 50% each are two headlines, so the outgoing copy is gone before
  the incoming copy starts (a fast exit, a delayed entrance). Two dissolving
  photographs read as one becoming another, so the card keeps its full-duration
  crossfade. `visibility` is switched at the ends of that window, which is what
  keeps exactly one slide in the tab order and in the accessibility tree.

- **The control rail is its own row under the stage**, aligned with whichever
  composition is on screen, and one line of names rather than two wrapped rows —
  it used to live inside the copy column, which only worked while the copy was
  always in the same place.

- **The backdrop's scrim is even, not directional.** It used to lean towards
  wherever the copy was; the copy now carries its own plate, which is both
  layout-aware and automatic, so the picture gets one veil at the admin's
  strength and the words get their own ground.

- **Admin → Home & Hero is one screen with one save.** The slide list, the
  compositions, the grounds, the pictures and the poster copy are one
  `PUT /heroConfig`; `setHeroOrder` keeps the products' own `heroOrder` in step
  for the rest of the admin, and a product's hero headline still saves to the
  product. The composition is picked from five wireframe tiles, and the live
  preview paints the real thing — the picture, its scrim, the plate, the layout
  and the band's own light or dark ground — with a desktop/phone switch, because
  the two are different compositions.

### Fixed

- **A hero slide could overflow the band sideways.** The section and the stage
  left their single grid column implicit, and an implicit `auto` track is sized
  from its items' max-content and may overflow its container — so on a phone the
  track resolved to the 1280px container inside a 390px viewport and the copy
  ran off the side, invisible behind `overflow-x: clip`. Both now state
  `grid-template-columns: minmax(0, 1fr)`.

- **The mirrored composition stacked instead of sitting side by side.** Grid
  auto-placement only moves forwards: the copy comes first in the DOM and is
  placed in column 2, so the card could not go into column 1 of the same row and
  started a second one. Every placed item now names its row as well as its
  column.

- **A "full screen" band was taller than the screen.** The card is the tallest
  thing in a slide and the rail sits under it, so a fixed card width put the
  CTAs below the fold on a 900px laptop. The card is now bounded by the height
  left over once the chrome, the slide's padding and the rail have taken theirs,
  and the centred composition — the one that stacks its card UNDER its copy — is
  sized by height rather than width.

## 1.2.0-lamikaa — 2026-09-11

The storefront is light. The page is a warm cream under espresso type, the
photographs sit on near-white plates, and the navigation — the announcement
band, the masthead, the mobile drawer, the bottom bar and the footer — stays
near-black, because the LAMIKAA wordmark is champagne gold and has no
light-ground variant.

### Changed

- **One light theme, "Black Rice in Daylight".** `:root` in
  `src/theme/storefront-tokens.css` is now the cream set: `#F8F3EA` ground,
  `#FFFDF9` surfaces, `#1B1714` type, `#8C6410` antique gold. `colors.js` (the
  MUI mirror) and `ThemeContext.js` follow it, and `html` is
  `color-scheme: light`. There is still exactly one theme, no toggle and no
  stored preference; no component gained a colour of its own.

- **`.sf-on-dark` — a scope, not a second theme.** The same role tokens,
  re-pointed onto the previous near-black palette, applied to the six pieces of
  chrome and to the PDP lightbox. A subtree that wears the class flips whole —
  ground, ink, accent, glass, glow, shadow — so the masthead keeps the
  champagne gold the lockup was drawn for while the page under it is cream.
  Print overrides both surfaces, so a receipt still comes out as ink on paper.

- **The accent split in two.** `--sf-color-gold` is antique gold (4.9:1 on
  cream) on the page and champagne gold (13.4:1) in the chrome; the signature
  gradient runs gold → berry → plum on cream and gold → neon pink → violet in
  the chrome. Every stop is ink-strength on its own ground, because
  `.sf-gradient-text` clips that gradient to glyphs.

- **Glass inverts where it is chrome.** `.sf-glass` is a veil of white and that
  only works over a dark ground; an element carrying both `.sf-on-dark` and
  `.sf-glass` is a dark bar floating over a cream page, so the veil becomes the
  chrome's own near-black at 86% (94% for `--strong`). Glass CHILDREN inside the
  chrome keep the white recipe — they sit on the bar's own ground.

- **The masthead no longer disappears over the hero.** It was fully transparent
  while the hero's opening band was on screen, which relied on the hero being
  the page ground. It is a solid near-black bar now, at every scroll position.

### Fixed

- **The hero photograph was painting over the announcement band.** The backdrop
  bled 100px upward to reach the top of the page behind a masthead that was
  transparent over it. With the chrome opaque that bleed only ever reached the
  band — which is not in the header's stacking context — and painted a
  scrimmed slice of the picture across it. The hero starts where the hero
  starts. (The bug predates this release; on a near-black storefront a
  near-black scrim over a near-black band was invisible.)

- **Two scrims that were one token.** `--sf-color-overlay` was doing two
  opposite jobs: the plate a label sits on over a photograph (which has to
  follow the page, so it is light now) and the backdrop behind a modal or drawer
  (which has to stay dark, or a pale panel has nothing to separate from). The
  backdrop is `--sf-color-scrim`.

- **The gold lockup on a light surface.** The two places the wordmark appears
  inside the cream page — the auth dialog's header and the brand hero the
  storefront falls back to when the catalogue is empty — now set it on
  `.sf-lockup-plate`, a patch of the chrome's own ground.

- **The admin's markdown preview went unreadable.** `MarkdownField` renders the
  storefront's own `<ContentBlocks>` so a preview cannot drift from the page,
  and it paints espresso type on the assumption that it is standing on the
  cream page. Its frame was the ADMIN's ground — which is still near-black —
  so the preview came out at about 1.5:1. The frame is the storefront's ground
  now, which is also the more honest preview: the panel exists to answer "what
  will this look like on /about", and /about is cream. It is the only place the
  admin renders a storefront component; nothing else in the admin reads
  `--sf-*`.

- **Three text tokens were measured against the wrong ground.** A colour picked
  to clear 4.5:1 on the cream PAGE is a few points short on a sunken input or a
  hover row, which is where a price, a rating or an avatar's initials often
  sit. Auditing every text-role token against all four grounds found the gold
  at 4.26:1 on `--sf-color-surface-hover` and the struck compare-price at
  3.83:1; both are deepened, and the doc table now quotes the worst ground
  rather than the page.

- **A hairline token was being used as a text colour.** The "·" and "/"
  separators in Profile, Order history and Checkout took
  `--sf-color-border-strong` — a value chosen to be nearly invisible. They read
  at 3.2:1 on the old dark ground and 2.2:1 on cream; they are
  `--sf-color-text-muted` now.

### Gates

- `npm test` — 369 tests, 32 suites, all passing.
- `npm run build` — compiled successfully, no warnings.
- Every text-role token checked against all four grounds (`bg`, `surface`,
  `surface-2`, `surface-hover`): none below 4.5:1 on either surface.
- Contrast swept in Chromium over 18 storefront routes × {1440×900, 390×844},
  signed-in pages included (profile, orders, wishlist, a filled cart and
  checkout): every text node on a resolvable ground meets WCAG AA (4.5:1, or
  3:1 at large sizes).

## 1.1.2-lamikaa — 2026-09-11

Every row of cards a visitor can swipe is now one component, and the cards in it
line up. The two product rails were measuring a card against the VIEWPORT rather
than against the rail they were standing in, which is why the PDP's "You may
also like" was rendering ninety-one-pixel cards on a laptop.

### Fixed

- **"You may also like" collapsed inside the PDP.** The rail sized its cards
  with `(100% - gaps) / 4.4` under a `min-width: 1024px` query — a sound rule
  for a page-wide rail, and the wrong question entirely for a rail inside a
  column. On the product page that rail lives in a 537px chapter, so the
  arithmetic resolved to **91px** cards at 1180px and **120px** at 1440px: the
  name clipped to "Black Ric…", one concern chip per line, the promise reading
  one word per row, and the hover Add-to-Cart button wider than the card it sat
  on. Cards are now clamped against the rail's own width and never go under
  248px anywhere.

- **The same rail on a phone was stuck at its floor.** `minmax(150px, 62%)` on
  a track that already overflows has no free space for the 62% maximum to grow
  into, so every card sat on the 150px minimum. It is a clamp now, and a phone
  gets one full card plus a real peek of the next.

- **Cards in a row started at different heights.** The card's eyebrow was one
  wrapping row of "step + up to two concerns", so it was one line tall for a
  product whose labels happened to fit and two for the product beside it — and
  the name, the promise, the badges and the price of half of any row inherited
  the offset. The step and the concerns now hold a reserved line each, the name
  and the promise hold two lines each, and the badges and price are pushed to
  the foot of the card, so a rail, the shop wall, the search results and the
  wishlist all read as a set.

- **A long step label could leave its card.** "01 · BODY CLEANSE" overflowed the
  card edge at the narrow end of the range; it truncates now.

- **A sideways swipe could walk the phone back a page.** Every horizontal
  scroller on the storefront — the product rails, the category and ritual rails,
  the trust strip, the badge row, the chapter bars, the gallery thumbnails, the
  hero's product index, the offers tabs and the FAQ contents — now contains its
  own overscroll.

- **The last card in a mobile rail kissed the right edge.** The category and
  ritual rails padded their scroll on the left only, so the last card snapped
  flush to the screen while every other card had a margin.

### Added

- **`ui/Rail`, the one horizontal card scroller.** Cards clamped against the
  rail's own width (nothing in it reads the viewport), a peek of the next card,
  arrows on a fine pointer that disappear when the row fits or when they have
  nowhere left to go, an edge fade on the side that actually HAS more content,
  a scroll progress bar on touch, snap points that are mandatory under a finger
  and gentle under a trackpad, and a focusable track that answers the arrow
  keys plus Home and End. The PDP rail, the home page's "Where you left off"
  and the wishlist's recommendations are all this component.

### Removed

- **`RecentlyViewed`'s private copy of the rail** — a `useRail` hook with its
  own ResizeObserver and its own pair of arrows, ported from the old home page.
  It is `ui/Rail` now, which is how the two rails stop drifting apart: only one
  of them had arrows, only the other had a fade, and neither contained a swipe.

## 1.1.1-lamikaa — 2026-09-11

Product pictures are never cut again. Whatever a product's image is — a pack
shot, a carton dieline, a finished lifestyle photograph — every surface now
delivers the WHOLE frame and lets the plate letterbox it.

### Fixed

- **A stored crop could outlive the picture it was measured against.** Each
  seeded product carried a `crop` in its cover's own source pixels, recorded to
  pull a front panel out of a carton dieline. Those coordinates describe one
  specific upload and nothing else, so the moment a row's `url` changed — a new
  photograph pasted over the old link in **Admin → Products → Media** — the same
  numbers went on cutting, and every card, hero, chapter, gallery stage,
  thumbnail, cart bar and search hit showed a narrow strip of the new picture
  with 60–75% of it thrown away. The eight seeded rectangles kept between 25.7%
  and 39.0% of their frames.

- **The whole frame, everywhere.** `stageSrc()` and the PDP gallery now deliver
  `c_pad,ar_…,b_auto` only: the complete picture, letterboxed to the plate's
  ratio on a ground sampled from the shot's own edges, at every breakpoint.
  Nothing in the storefront emits `c_crop`.

- **The Deal of the Day plate.** `/offers` rendered the raw `images[0]` — the
  full multi-megapixel upload — and then let CSS cut a 4:5 window out of it. It
  goes through `stageSrc()` like every other product plate now: sized for its
  box, padded rather than cropped, and `object-fit: contain`.

- **The admin's row preview** shows the whole asset (`contain`, not `cover`), so
  a merchant sees before saving exactly what the storefront will show.

### Removed

- **The stored crop, at the boundary.** `normalizeProduct` drops any `crop` a
  record still holds, so a stale rectangle from *any* backend — `db.json`, the
  Laravel API, a months-old wishlist snapshot — cannot reach a delivery URL. The
  eight rectangles are gone from `db.json` as well.

- **"Advanced: stage crop"** in the admin media manager, and the PDP's
  **"Full label" / "Front panel"** toggle. With nothing cropped there is no
  second version of a frame to offer, and a control that claimed otherwise would
  be a lie.

---

## 1.0.0-lamikaa — 2026-09-08

The complete rebuild of this repository from the previous storefront into
**LAMIKAA NATURALS**: a farmer-owned Black Rice skincare store and its admin
console. Delivered as 39 sequential prompts (`prompts/00_INDEX.md`); this is the
last of them. Every existing storefront and admin capability was preserved, the
previous brand was removed from source, seeds, assets and the production build,
and nothing about the brand was invented — facts nobody has supplied yet are
carried as placeholder tokens that render as nothing.

---

### Highlights

**One dark theme, one token layer.** The light/dark toggle is gone from both the
storefront and the admin. `src/theme/` is the only styling source — colour,
type, space, radius, shadow, glass, glow and the signature gradient all come
from `--sf-*` tokens; no component hard-codes a colour. The admin runs its own
isolated dark MUI theme so the two can never bleed into each other. Fraunces for
display, Manrope for UI, pill buttons throughout.

**A product-driven hero.** The home page opens on the range itself: one slide
per product, ordered by `heroOrder`, each with its own headline and subtext and
two CTAs, with autoplay, pause, swipe, arrows, keyboard and a counter — all of
it off under `prefers-reduced-motion`. The old admin-managed banner slides are
gone; the `banners` collection became `announcements`, and the hero is now
ordered and copy-edited in Admin → Home & Hero.

**A chaptered shop.** No filters, no sort, no pagination — an explicit brief
decision. `/shop` is eight full editorial chapters, one per product, with a
sticky chapter index, quick add, and the same chapters constrained by route on
the category pages. Search moved to a proper overlay plus a `/search` results
page.

**A rebuilt PDP with a real media gallery.** Images *and* videos in one authored
`media[]` list: thumbnails, an inline player, a lightbox, swipe and full
keyboard control, plus a "Full label" toggle that swaps the Cloudinary crop for
the uncropped pack shot. Below it, chaptered supporting content (overview,
benefits, key ingredients, how to use, the farmer story, full INCI list, FAQs),
reviews, cross-sell and Product + BreadcrumbList JSON-LD.

**Rituals.** Three curated routines as data (`rituals`), rendered as an index,
per-ritual detail pages with numbered steps and alternates, a home teaser, and
full CRUD in Admin → Rituals.

**The farmer-owned story, told with its qualifiers.** About, Why LAMIKAA, the
value chain, the four pillars and the impact triptych are all driven by
`siteContent` and edited in Admin → Content. Wherever profits or dividends
appear, the "can" / "subject to applicable laws and the company's dividend
declaration" wording is part of the copy and is asserted by a test.

**An admin that manages the shop, not just the catalogue.** Nineteen screens.
The product form gained a media manager (add, remove, reorder, preview, set the
primary, crop, per-row placeholder chips) that round-trips `media[]` and keeps
the derived `images[]` mirror in step. New screens for Concerns, Rituals,
Content, Announcements, FAQs (groups, placements, reordering) and Home & Hero;
Reviews grew approve/reject/create with a sample-data chip; the dashboard gained
hero, ritual, live-announcement and price-on-launch tiles.

---

### For the owner — what still has to be supplied

Nothing below is broken. Each is a fact this project refused to invent, carried
as a `{{TOKEN}}` that renders as nothing until you fill it in. Run
`npm run placeholders` at any time for the current, generated inventory; the
full register with candidates and sources is `prompts/_reference/PLACEHOLDERS.md`.

| Group | Tokens | Where to resolve |
|---|---|---|
| **Prices** | `{{PRICE_BODY_WASH}}`, `{{PRICE_FACE_MASK}}`, `{{PRICE_FACE_MIST}}`, `{{PRICE_FACE_SERUM}}`, `{{PRICE_MOISTURIZER_GEL}}` — five of the eight products ship as `price: null, priceTBA: true` ("Price on launch", purchase disabled) because their MRP is not legible on the packaging. The other three are seeded from the printed MRP (₹390 / ₹90 / ₹349, `priceSource: "packaging-mrp"`) and still want confirming. | Admin → Products |
| **Contact** | `{{LAMIKAA_EMAIL}}`, `{{LAMIKAA_PHONE}}`, `{{LAMIKAA_ADDRESS}}`, `{{SUPPORT_HOURS}}` — the footer address block, the contact page, the policies colophon and the admin invoice all hide their rows until these are real. The packaging prints `info@baopcl.com`, `+91 97076 91169` and the Bokakhat address; confirm they are the customer-care ones. | Admin → Settings → Store |
| **Social** | `{{LAMIKAA_INSTAGRAM_URL}}`, `{{LAMIKAA_FACEBOOK_URL}}`, `{{LAMIKAA_YOUTUBE_URL}}`, `{{LAMIKAA_WHATSAPP_URL}}` — no `https://{{…}}` link is ever rendered; the row simply is not there. | Admin → Settings → Social Links |
| **Domain** | `{{LAMIKAA_DOMAIN}}` — three ordered steps, no page changes: set `seo.siteUrl` in `src/config/brand.js`, run `npm run sitemap`, then uncomment the `Sitemap:` line already written into `public/robots.txt` with the same host. Candidate `lamikanaturals.com` (`.env.production` points the API at `core.lamikanaturals.com`). | `src/config/brand.js` |
| **Legal** | `{{GSTIN}}`, `{{CIN}}`, `{{JURISDICTION}}` — the footer colophon rows and the Terms jurisdiction sentence are dropped while unresolved. | Admin → Settings, Admin → Content → Terms |
| **Policies** | `{{DISPATCH_SLA}}`, `{{REFUND_TIMELINE}}`, `{{RETURN_WINDOW_DAYS}}`, `{{FREE_SHIPPING_THRESHOLD}}`, `{{LAUNCH_OFFER_TEXT}}` — the four policy documents are generic templates; sentences carrying an unresolved token are removed, not printed. The return window currently uses the boilerplate default of 7 days (`STOREFRONT_CONFIG.returnsWindowDays`). | Admin → Shipping, Admin → Announcements, Admin → Content |
| **Certifications** | `{{CERTIFICATIONS}}` — the packaging roundels (ISO Certified · GMP Certified · Non-GMO · Cruelty-Free) are shown **as printed**, only inside the PDP's "As printed on the pack" block. Remove any you cannot substantiate. `{{SHELF_LIFE}}` is unset and its row is hidden. | `src/config/brand.js → packBadges`, `productDefaults.shelfLife` |
| **Media** | 53 stand-in assets: 42 photographs (Picsum, Unsplash licence) and 11 videos (MDN CC0 and Cloudinary demo). 27 are product gallery rows flagged `"placeholder": true`; the rest are category, ritual and story imagery. Full list in `prompts/_reference/PLACEHOLDER_ASSETS.md`. | Admin → Products → Media, Admin → Content |

**Sample data to remove before launch** (real rows, not tokens):

- `admins[0]` — `admin@store.com` / `admin123`, stored in plain text. **Change both.**
- `users[0]` — `sample.customer@example.com` / `password123` with a Guwahati address and ₹390 of store credit.
- Three seeded orders, their three payments, one refund and one wallet transaction — the money trail behind them must stay in agreement if any row is edited.
- `coupons[0]` — `SAMPLE10`.
- `shipping_methods[0]` — "Standard Delivery" with `freeAbove: null` and `estimatedDays: ""` (the unresolved state of two tokens above).
- `reviews` — two rows flagged `isSample: true`, hidden from the storefront by `brand.flags.showSampleReviews === false`. Every product's `rating` and `totalReviews` are 0; nothing fabricates social proof.
- `leads` — one sample contact and one sample newsletter subscriber.

---

### Known limitations

- **The Laravel backend is not in this repository.** Every function in
  `src/services/api.js` has a live branch, but the newer routes it calls have to
  be implemented before live mode is complete: the hero, category-by-slug,
  concern and search product queries, product reviews with the sample filter,
  concerns, rituals, site content, announcements, hero config, and their admin
  CRUD and reorder counterparts. The full sheet — method, path, payload,
  response — is `prompts/_reference/REPO_MAP.md` §3.4 and §3.5. Mock mode is
  complete and exercised.
- **Sample data ships enabled**, as listed above, so the admin has something to
  show on a fresh clone.
- **`brand.flags.enableRitualBundles` is `false`.** "Add the whole ritual"
  bundling is built and works, but a bundle price cannot be stated while five of
  eight products have no price. Turn it on once the range is priced.
- **`brand.flags.showSampleReviews` is `false`**, which is why the PDP shows an
  empty reviews state on a fresh clone.
- **`brand.seo.siteUrl` is unresolved**, so `public/sitemap.xml` is not written
  and `robots.txt` carries its `Sitemap:` line commented out. Canonicals,
  `og:url` and JSON-LD `url` fall back to the runtime origin, so nothing is
  broken and nothing prints a token.
- **`npm run test:live` writes to the database it points at.** It is skipped by
  default and must never be run against production.

---

### Cleanup verification

The previous brand is absent from source, seeds, public assets and the
production build. Three greps establish it, and all three are **defined in
`prompts/_reference/BRAND_FOOTPRINT.md`** and were introduced by Prompt 36 at
commit `5cc9d3f`:

1. the previous brand's name and its six product-vocabulary words, over the
   whole repository except `node_modules/`, `.git/`, `build/` and `prompts/`;
2. the same list over the built `build/` directory;
3. the retired pre-rebrand CSS token names — the old emerald colours, the
   heritage gradient, the logo-background variable and the per-category colour
   family, all four spelled out in `BRAND_FOOTPRINT.md`.

Re-run on the tree this release is cut from, in the working copy and against a
fresh `CI=true npm run build`: **all three return zero results.** Copy the
commands from `BRAND_FOOTPRINT.md` rather than from here — spelling the search
terms in a committed file is exactly what would make grep 1 stop returning zero.

The only surviving mentions of the previous brand are inside `prompts/`, which
documents the rebuild and is not part of the application (see the README's
closing section).

### Gates

- `CI=true npm run build` — clean, no warnings.
- `npm test -- --watchAll=false` — 30 suites, 328 tests passing; the live-API
  suite (50 tests) skipped, as designed.
- Full storefront and admin regression in mock mode — 99 automated checks
  across home, catalogue, PDP, commerce, account, content, admin and the
  order/return lifecycles. Recorded in `prompts/PROGRESS.md`.

### Fixed in this release

- **Cash on Delivery was silently unavailable at checkout.** `codMaxOrder: 0` is
  what Admin → Settings → Payment calls "no maximum" and is the field's own
  default, but the checkout read a stored `0` as a real ₹0 cap, so COD was shown
  disabled ("Available for orders up to ₹0.00") on every order that cost
  anything — while the assurance rail still promised "Cash on delivery
  available". Zero now means no maximum, as documented.

---

## 1.0.1-lamikaa — 2026-09-10

A full-surface QA pass over the storefront and the admin console in mock mode:
every route, every tab, every button and every write path driven in a real
browser at four viewport widths, plus the keyboard, the accessibility tree and
the API-down case. Six defects were found and fixed; nothing else changed.

### Fixed

- **Changing your password did nothing, and said it had.** In mock mode
  `auth.changePassword` returned `{ success: true }` without checking anything
  or writing anything, so Profile → Settings accepted a WRONG current password
  and reported "Password updated successfully" — while the account kept the old
  password, locking the shopper out of the one they thought they had just set.
  The mock branch now verifies the current password against the stored user and
  writes the new one, and the screen prints the reason a change was refused.

- **A coupon applied in the cart was lost at checkout.** The tray, `/cart` and
  Checkout each held their own `couponApplied` state, so a code applied on one
  screen was simply gone on the next: the shopper was shown a discount and then
  charged the full price, and the order recorded no coupon. The applied coupon
  now lives on the cart (`CartContext`), shared by all three, persisted with the
  cart, re-validated when it is restored (a code that has since expired or been
  switched off is dropped rather than honoured), and cleared with the cart when
  the order is placed.

- **The admin was unusable on a phone after one tap.** Closing the navigation
  drawer in the same commit as `navigate()` interrupted MUI's exit transition,
  so `onExited` never fired, the modal never returned to `visibility: hidden`,
  and its backdrop stayed at full opacity over the whole panel — the screen
  looked fine and swallowed every tap. The drawer now closes from an effect on
  the route, in the commit after the swap, so the transition completes.

- **"Move to cart" threw on a saved product with no price.** The wishlist's own
  button ignored `priceTBA` — the card directly above it did not — so clicking
  it on any of the five unpriced products threw `PRICE_TBA` out of the click
  handler: nothing added, no toast, nothing said. It now reads "Coming soon" and
  is disabled, exactly like every other Add button in the storefront.

- **A product page reported a network failure as a 404.** Any failed read — a
  dropped connection, a 5xx, a timeout — set `notFound`, so a shopper on a
  flaky connection was told the product they had clicked does not exist. A
  genuine miss (an unknown slug, an unknown id, a drafted product) is still a
  real 404; a failed read now gets the error state and a "Try again", the same
  rule `/shop` already followed.

- **"Return / exchange" handed the care desk nothing.** The button in My Orders
  navigated to a blank contact form, and the lead reached Admin → Leads with an
  empty `orderNumber` — the field that screen prints. The order now travels with
  the visitor and seeds the subject, the order number and the category.

Two accessibility defects in the admin's tab sets were fixed alongside them:
Home & Hero's two panels had no `role="tabpanel"` at all, and Settings' five
panels were named by `aria-labelledby` ids that did not exist.

### Gates

- `CI=true npm run build` — clean, no warnings.
- `npm test -- --watchAll=false` — 29 suites, 328 tests passing; the live-API
  suite skipped, as designed.

---

## 1.1.0-lamikaa — 2026-09-10

The home page hero can now carry artwork behind its slides, set from the admin
console. Nothing else changed, and a storefront with no picture uploaded opens
exactly as it did before.

### Added

- **Slide backgrounds, at two levels.** The hero carousel drew its slides on the
  page's own ground — there was no artwork behind them and nowhere in the admin
  to put any. There are now two places a picture can come from, sharing one
  shape: `heroConfig.background`, the SECTION picture behind every slide, and
  `product.heroBackground`, ONE slide's own, which overrides it. Both are edited
  in **Admin → Home & Hero** — the section picture on *Section settings*, a
  slide's own inside its row on *Hero products* — and both are stored, read and
  rendered like every other admin-managed value: nothing about the hero's
  artwork is hardcoded.

- **One link is a whole background.** Only the image URL is a decision. The
  focal point, the scrim strength and the soft focus all have designed defaults
  and sit behind a "Framing & scrim" disclosure, so pasting a link and pressing
  save is a complete edit — and one link on *Section settings* dresses all eight
  slides at once. `normalizeHeroBackground()` accepts a bare URL string as well
  as a record, so a hand-edited `db.json` may say `"heroBackground": "https://…"`
  and mean it.

- **A slide can be its picture and nothing else.** Switching off "Show the
  product over the picture" hides that slide's copy, its two CTAs and its label
  plate, leaving the artwork and the control rail. The heading stays in the
  accessibility tree (the page keeps exactly one `h1`), the sizer keeps the
  column's height so nothing below the hero moves, and the plate for that slide
  is never fetched.

- **Every device.** A separate phone picture (`mobileUrl`) may be given for
  screens up to 768px, chosen in JS off the same media flag the plate's ratio
  already reads, so a browser downloads one file and not both; either URL alone
  is enough and each falls back to the other. The scrim turns with the
  composition — over the foot of the frame on a phone, over the copy column from
  the tablet up — and keeps a fixed wash under the transparent masthead so the
  header's type always has ground. Cloudinary links are delivered responsively
  (`f_auto,q_auto` + a five-rung `srcset`); any other host is used as given.

- **The carousel's existing budgets are unchanged.** Only the first slide's
  background is `priority`; the rest mount in the same `requestIdleCallback`
  pass the plates use. The crossfade follows the configured transition and stops
  under `prefers-reduced-motion`; an unblurred layer emits `filter: none` rather
  than `blur(0px)`, so it is never promoted to its own viewport-sized
  compositing layer; and the whole backdrop is dropped in print.

### Changed

- `Admin → Home & Hero`: a row's disclosure is now **Edit slide** and its button
  **Save slide** — it saves the two lines and the picture together. Rows are
  chipped with what backs them ("Own background", "Section background",
  "Background only"), and the live preview paints the resolved picture and its
  scrim. The "no primary image" warning no longer fires for a slide that shows
  nothing but its background, and it says what actually happens (the slide opens
  without its label plate) rather than that the slide is skipped.

