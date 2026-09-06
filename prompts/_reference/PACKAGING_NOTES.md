# Packaging & brand-asset review — LAMIKAA NATURALS

> Phase A, finding 10. Every asset below was downloaded (`curl -sL … -o`) and viewed; the two PNGs were also decoded pixel-by-pixel (alpha histogram, gold percentiles, bounding boxes). Only what is **legible** is recorded as fact. Anything else stays a placeholder (`PLACEHOLDERS.md`).

## 0. Headline findings (read first)

1. **The eight "cover images" are flat label / carton artwork, not product photography.** No bottle, tube or jar is rendered; each file is the printed label laid flat (some are two-panel labels or a full carton dieline). This changes the visual system: the hero and showcase "product stage" must present a **cropped front panel** of the label as a *label card*, and the full label goes into the PDP gallery as media #1. Never crop with `c_fill`/`g_auto` alone — it slices text. Use the explicit `stageCrop` rectangles in §2 (verified on screen during the build).
2. **All eight labels sit on a black/near-black ground** (pure `#000` on six of them, charcoal `#1C1C1C` on the Face Wash, `#1A1A1A` on the Scrub). Six are full-bleed dark (edge-to-edge is safe). **Two have white margins** — the Goat Milk Soap carton dieline and the two-panel Body Wash label — so they must be cropped to their front panel or padded with `b_auto`; never shown raw on the dark page.
3. **Palette confirmation.** Every label is champagne-gold typography on black; the icon adds a **magenta → violet ring** around a deep navy disc. The brief's palette (gold primary, pink/violet neon accents, near-black ground) is therefore *literally* on the packaging. Gold measured from the logo PNG: p10 `#DCCF65`, p50 `#FAEE80`, p90 `#FFFBA8` (a pale champagne — lighter than the brief's `#F5D76E`; use `#F5D76E` for UI gold and `#FFEFA6` for highlights, which sits inside the logo's own range).
4. **Typography on pack:** wordmark = high-contrast serif capitals with a swash ligature on "K–A"; "NATURALS" = wide-tracked geometric sans (≈0.35em tracking); product names = bold geometric sans caps ("BLACK RICE") over a lighter title-case or caps second line; body text = humanist/geometric sans (Poppins-like). Decision for the site (see `DESIGN_SYSTEM.md`): **Fraunces** (display serif, echoes the wordmark's contrast and warmth, holds up on dark at opsz ≥ 72) + **Manrope** (UI/body, geometric-humanist like the label sans). Cormorant Garamond (current) is retired — its hairlines shimmer on `#0B0B0D`.
5. **Legible, reusable facts** (allowed in copy as printed): product volumes, the "Mild Sandalwood Fragrance" line on all eight, the "Enriched with / Full of Anti-Ageing Antioxidants" line on all eight, the key-ingredient band per product, full INCI lists, directions, cautions, four roundels (ISO Certified · GMP Certified · Non-GMO · Cruelty-Free), marketer/manufacturer blocks, Mfg. Lic. No. 890-AYU, and three printed MRPs.
6. **Contact details printed on every label** (candidate values for the contact placeholders — the owner must confirm they are the *storefront* care details, not only the company's): Cust. Care **+91 97076 91169**, Email **info@baopcl.com**, Web **www.baopcl.com**, Marketed by **Bokakhat Agro Organic Producer Co. Ltd., Bachagaon, Kaziranga National Park, Golaghat, Assam – 785609**. Manufactured by **Maur Herbals, Plot No. F-356, Phase II, RIICO Industrial Area, Sri Ganganagar, Rajasthan – 335002**.

## 1. Brand assets

### Logo (wordmark) — `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670626/logo.png`
- 1400 × 400 px, RGBA, 314 KB. Aspect **3.5 : 1**. Opaque bbox x 0–1383, y 0–387 (art fills the canvas; no padding to trim).
- Alpha: **80.2 % fully transparent, 6.5 % partial, 13.2 % opaque** → transparent ground. The faint disc behind the botanical mark that appears on white previews is *not* a white fill — zero whitish opaque pixels — it is semi-transparent anti-aliasing. **On `#0B0B0D` the wordmark sits directly on the page with no plate.**
- Colour: gold gradient (p10 `#DCCF65` → p50 `#FAEE80` → p90 `#FFFBA8`), a thin darker keyline `#202020` (2.4 % of pixels) around the letters — this keyline is what keeps it legible on light *and* dark; on glass surfaces add `filter: drop-shadow(0 1px 12px rgba(245,215,110,.18))` only if a hover state needs lift. **No plate or glow is necessary for legibility on `#0B0B0D` or on `rgba(255,255,255,.06)` glass.**
- Composition: botanical mark (tulip-like bud with two leaves) left, "LAMIKAA" serif caps with a swash from the K into the final A, "NATURALS" tracked caps beneath. Minimum render width for the tagline to stay legible: **≈ 150 px**; header uses 168–210 px, mobile 140 px; below 120 px switch to the icon.

### Icon (mark) — `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670625/icon.png`
- 696 × 696 px, RGBA, 222 KB. Opaque bbox x 20–675, y 20–675 (a 20 px transparent margin; circle Ø ≈ 656 px).
- 30 % transparent (corners), 70 % opaque. Disc fill deep navy-teal (`#002030` bucket, ≈49 % of pixels); ring = **magenta → violet gradient** (`#C02090` → `#6010D0` buckets); mark = the gold botanical line-drawing.
- The disc colour (`#0F2230`-ish navy) is *not* in the brief's palette. Use the icon as supplied for favicons/PWA/app icons; where it appears inside the UI (compact header mark, toast icon, admin collapsed sidebar) render it at ≤ 40 px on `--sf-color-bg` — the navy reads as "dark" at that size. Do not recolour it.
- Favicon generation (Prompt 02): download once, produce 16/32/48 (ICO), 180 (Apple), 192/512 (PWA, `purpose: any` and a padded `maskable` variant) — the circle already has a 20 px safe margin; add 10 % extra padding for `maskable`.

## 2. Product covers — per product

Common to all eight unless noted: black ground; centred brand lockup (mark + LAMIKAA NATURALS in gold); product name in white bold geometric caps; a gold band naming the key ingredients (black text on gold); the antioxidant line; three-word benefit line separated by bullets; "Mild Sandalwood Fragrance"; volume; roundels ISO / GMP / NON GMO / CRUELTY FREE; left column ABOUT / DIRECTIONS (HOW TO USE) / INGREDIENTS / CAUTION; right column Marketed by / Manufactured by / Mfg. Lic. No. 890-AYU / Batch / Mfg. date / Exp. date / M.R.P.

`stageCrop` = starting crop rectangle **in original pixels** for the hero/showcase "label card" (Cloudinary `c_crop,x_,y_,w_,h_`). They were estimated from the rendered previews and **must be checked visually in Prompt 06/14** (tune ±5 %). Chain with `c_pad,ar_1:1,b_auto` (or `ar_4:5`) for a uniform stage.

### 1 · Black Rice Face Wash — `…/v1788670695/Black-Rice-Face-Wash-Cover.jpg`
- 3604 × 3417 px (1.05 : 1, near-square), 300 dpi, 1.63 MB. Full-bleed charcoal `#1C1C1C`. Padding ≈ 3 % all round. **Edge-to-edge safe.**
- Layout: three columns; centre column carries the lockup, "BLACK RICE / Face Wash", a gold rule, an outlined pill "Deeply Cleanses · Brightens Skin · Hydrates · Refreshes", an "ENRICHED WITH:" bullet list, "Mild Sandalwood Fragrance", "Net Vol. 200 ml".
- Claims (verbatim): "Enriched with Anti-Ageing Antioxidants"; ENRICHED WITH: Black Rice, Aloe Vera, Green Tea, Neem, Turmeric.
- About: "Reveal healthier-looking skin with the power of Black Rice. Enriched with antioxidant-rich botanicals, this gentle face wash effectively removes dirt, excess oil and impurities while helping maintain the skin's natural moisture balance. Regular use leaves skin feeling clean, refreshed and radiant."
- Directions: "Apply on wet face, massage gently in circular motions, then rinse thoroughly with water. Use morning and evening for best results."
- Ingredients: Aqua, Black Rice Extract, Aloe Vera Extract, Green Tea Extract, Turmeric Extract, Neem Extract, Tulsi Extract, Glycerin, Cocamidopropyl Betaine, Decyl Glucoside, Propanediol, Panthenol, Allantoin, Xanthan Gum, Sodium Chloride, Citric Acid, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- Caution: "For external use only. Avoid direct contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children. Store in a cool, dry place away from direct sunlight."
- Volume **200 ml** · Batch RWMH/203 · Mfg Aug-2026 · Exp July-2028 · **M.R.P ₹390/-** (legible). Extra marks bottom-right: Do-not-litter, Keep-your-city-clean, Make-in-India lion, Swachh Bharat.
- `stageCrop`: `x_1050,y_100,w_1500,h_3200` (centre column, portrait ≈ 0.47:1). Whole image is also usable (square).

### 2 · Black Rice Goat Milk Soap — `…/v1788670693/Black-Rice-Goat-Milk-Soap-Cover.jpg`
- 3610 × 1830 px (1.97 : 1), 300 dpi, 1.23 MB. **Carton dieline on a WHITE canvas** — two identical front panels (left/right), a narrow information panel between them, a right-hand legal panel, top flaps with inverted text, cut-outs. Gold foil bands and a circular "Power of Black Rice" gold seal. **NOT edge-to-edge safe.**
- Product name on pack: "BLACK RICE GOAT MILK SOAP" (condensed bold sans caps); "Enriched With Anti-Ageing Antioxidants"; info strip "SUITABLE FOR: ALL SKIN TYPES · WITH THE GOODNESS OF Goat Milk & Black Rice Extract · NET WEIGHT: 100g"; flap "Nourishes · Cleanses · Softens Skin"; "BEAUTY SOAP" tag; "Mild Sandalwood Fragrance" band.
- About: "A luxurious cleansing bar enriched with Goat Milk and Black Rice Extract that gently cleanses while helping nourish and moisturize the skin. Rich antioxidants help maintain soft, smooth and healthy-looking skin after every wash."
- Directions: "Wet the soap and work into a rich lather. Massage gently over the skin and rinse thoroughly with water."
- Ingredients: Aqua, Glycerin, Goat Milk, Black Rice Extract, Rice Extract, Coconut Oil, Shea Butter, Aloe Vera Extract, Turmeric Extract, Liquorice Extract, Vitamin E, Sodium Chloride, Fragrance.
- Caution: "For external use only. Avoid contact with eyes. Keep out of reach of children. Store in a cool, dry place after use."
- Weight **100 g** · Batch RSMH/204 · Mfg Aug-2026 · Exp July-2028 · **M.R.P ₹90/-** (legible).
- `stageCrop` (left front panel, below the top flap): `x_216,y_522,w_1377,h_1269` (≈ 1.09:1). Verify the gold "Beauty Soap" tag is inside the crop and no white shows at the rounded corners.

### 3 · Black Rice Body Wash — `…/v1788670690/Body-Wash-Cover.jpg`
- 1365 × 767 px (1.78 : 1), 146 KB. **Two rounded-rectangle label panels on a WHITE canvas** (back panel left with text; front panel right with lockup and a gold swoosh). **NOT edge-to-edge safe.**
- Front: "BLACK RICE / Body Wash"; gold band "With Black Rice & Sandalwood Extract"; "Full of Anti-Ageing Antioxidants"; "Nourishes • Cleanses • Hydrates"; "Mild Sandalwood Fragrance"; "250 mL".
- About: "Nourishing body wash enriched with Black Rice and Sandalwood Extracts. Its gentle cleansing formula helps remove dirt and impurities while leaving skin feeling soft, fresh and hydrated."
- How to use: "Apply to wet skin, massage gently to create a rich lather and rinse thoroughly with water."
- Ingredients: Aqua, Glycerin, Oryza Sativa (Black Rice) Extract, Santalum Album (Sandalwood) Extract, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Glyceryl Stearate, Shea Butter, Squalane, Dimethicone, Niacinamide, Panthenol, Sodium Hyaluronate, Tocopherol, Carbomer, Xanthan Gum, Triethanolamine, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- Caution: "For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children."
- Volume **250 mL** · Batch RWMH/203 · Mfg Sep-2026 · Exp Aug-2028 · M.R.P **not legible** (masked `₹ ***/-`).
- `stageCrop` (front panel, inside the rounded corners): `x_715,y_30,w_395,h_710` (≈ 0.56:1).

### 4 · Black Rice Face Mask — `…/v1788670690/Face-Mask-Cover.jpg`
- 1318 × 401 px (**3.29 : 1**, very wide), 115 KB. Full-bleed black. **Edge-to-edge safe** but too wide for a card without cropping.
- Front: "BLACK RICE / FACE MASK"; gold band "With Black Rice, Sandalwood & Kaolin"; "Full of Anti-Ageing Antioxidants"; "Mild Sandalwood Fragrance"; "NET WT. 100 g".
- About: "A purifying face mask powered by Black Rice, Sandalwood, Kaolin and Bentonite. The clay-based formula helps absorb excess oil and impurities while Aloe Vera and skin-conditioning ingredients leave skin feeling refreshed and smooth."
- How to use: "Apply an even layer to clean, dry face, avoiding the eye area. Leave for 10–15 minutes, then rinse thoroughly with water."
- Ingredients: Aqua, Oryza Sativa (Black Rice) Extract, Santalum Album (Sandalwood) Extract, Kaolin, Bentonite, Glycerin, Aloe Barbadensis Leaf Juice, Niacinamide, Panthenol, Allantoin, Sodium Hyaluronate, Xanthan Gum, Hydroxyethylcellulose, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- Caution: "For external use only. Avoid contact with eyes. Patch test before use. Discontinue if irritation occurs."
- Weight **100 g** · Batch RMMH/204 · Mfg Sep-2026 · Exp Aug-2028 · M.R.P **not legible**.
- `stageCrop` (centre panel): `x_480,y_0,w_370,h_401` (≈ 0.92:1).

### 5 · Black Rice Face Mist — `…/v1788670691/Face-Mist-Cover.jpg`
- 1045 × 744 px (1.40 : 1), 151 KB. Full-bleed black. **Edge-to-edge safe.**
- Front: "BLACK RICE / Face Mist"; gold band "With Black Rice, Sandalwood & Aloe Vera"; boxed "Full of Anti-Ageing Antioxidants"; "Refreshes • Hydrates • Revitalizes"; "Mild Sandalwood Fragrance"; "NET VOL. 100 ml".
- About: "A refreshing facial mist enriched with Black Rice, Sandalwood, Aloe Vera, Niacinamide and Hyaluronic Acid. It instantly refreshes the skin and helps maintain a soft, hydrated and comfortable feel."
- Directions: "Close eyes and mist evenly over the face from a comfortable distance. Allow to absorb naturally. Use whenever skin needs a refreshing boost."
- Ingredients: Aqua, Oryza Sativa (Black Rice) Extract, Santalum Album (Sandalwood) Extract, Glycerin, Propanediol, Aloe Barbadensis Leaf Juice, Niacinamide, Panthenol, Betaine, Sodium Hyaluronate, Allantoin, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Citric Acid, Sodium Citrate, Fragrance.
- Caution: "For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children."
- Volume **100 ml** · Batch RMMH/204 · Mfg Sep-2026 · Exp Aug-2028 · M.R.P **not legible**.
- `stageCrop`: `x_320,y_20,w_410,h_710` (≈ 0.58:1).

### 6 · Black Rice Exfoliating Face Scrub — `…/v1788670694/Face-Scrub-Cover.jpg`
- 4963 × 744 px (**6.67 : 1**, an extremely wide wrap label), 300 dpi, 869 KB. Full-bleed `#1A1A1A`. **Edge-to-edge safe** but unusable uncropped in any card.
- Front: "EXFOLIATING FACE SCRUB / WITH THE GOODNESS OF BLACK RICE" (note: the pack name does not carry the "Black Rice" prefix — the site keeps the brief's name "Black Rice Exfoliating Face Scrub" and shows the pack name in the "As printed on the pack" block); "Enriched With Anti-Ageing Antioxidants"; "100gm".
- About: "An antioxidant-rich exfoliating scrub formulated with Black Rice, Rice Powder and Walnut Shell Powder to gently remove dead skin cells, unclog pores and reveal smoother, brighter-looking skin without over-drying."
- Directions: "Apply on damp face, massage gently for 1–2 minutes, then rinse thoroughly. Use 2–3 times weekly."
- Ingredients: Aqua, Black Rice Extract, Glycerin, Aloe Vera Extract, Rice Powder, Walnut Shell Powder, Kaolin Clay, Jojoba Oil, Almond Oil, Coconut Oil, Shea Butter, Niacinamide, Vitamin E, Liquorice Extract, Green Tea Extract, Cucumber Extract, Xanthan Gum, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- Caution: "For external use only. Avoid contact with eyes and broken skin. Discontinue use if irritation occurs."
- Weight **100 g** ("100gm") · Batch RCMH/202 · Mfg Aug-2026 · Exp July-2028 · **M.R.P ₹349/-** (legible).
- `stageCrop` (centre panel): `x_1700,y_0,w_1600,h_744` (≈ 2.15:1 landscape — pad to 1:1 with `b_auto`).

### 7 · Black Rice Face Serum — `…/v1788670692/Face-Serum-Cover.jpg`
- 1323 × 558 px (2.37 : 1), 163 KB. Full-bleed black. **Edge-to-edge safe.**
- Front: "BLACK RICE / Face Serum"; gold band "With Black Rice, Niacinamide & Alpha-Arbutin"; "Full of Anti-Ageing Antioxidants"; "Mild Sandalwood Fragrance"; "NET VOL. 30 mL".
- About: "A lightweight facial serum combining Black Rice Extract, Niacinamide and Alpha-Arbutin with Hyaluronic Acid and Panthenol. The formula helps improve the appearance of dull, uneven-looking skin while supporting a soft, hydrated and smooth appearance."
- How to use: "Apply 2–3 drops to cleansed face and neck. Gently massage until absorbed. Follow with moisturizer. Use daily."
- Ingredients: Aqua, Oryza Sativa (Black Rice) Extract, Santalum Album (Sandalwood) Extract, Glycerin, Propanediol, Niacinamide, Alpha-Arbutin, Panthenol, Sodium Hyaluronate, Betaine, Allantoin, Tocopherol, Hydroxyethylcellulose, Carbomer, Tromethamine, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- Caution: "For external use only. Avoid contact with eyes. Patch test before use."
- Volume **30 mL** · Batch RMMH/204 · Mfg Sep-2026 · Exp Aug-2028 · M.R.P **not legible**.
- `stageCrop`: `x_460,y_15,w_410,h_530` (≈ 0.77:1).

### 8 · Black Rice Moisturizer Gel — `…/v1788670693/Moisturizer-Gel-Cover.jpg`
- 814 × 739 px (1.10 : 1), 115 KB. Full-bleed black. **Edge-to-edge safe.**
- Front: "BLACK RICE / MOISTURIZER GEL"; gold band "With Black Rice, Niacinamide & Hyaluronic Acid"; boxed "Full of Anti-Ageing Antioxidants"; "Hydrates • Softens • Refreshes"; "Mild Sandalwood Fragrance"; "NET VOL. 100 ml".
- About: "A lightweight moisturizing gel enriched with Black Rice Extract, Niacinamide, Aloe Vera and Hyaluronic Acid. Its refreshing gel texture helps replenish moisture and leaves skin feeling soft, smooth and hydrated."
- Directions: "Apply a small amount evenly over cleansed face and neck. Gently massage until absorbed. Use morning and evening."
- Ingredients: Aqua, Oryza Sativa (Black Rice) Extract, Santalum Album (Sandalwood) Extract, Glycerin, Propanediol, Niacinamide, Panthenol, Sodium Hyaluronate, Aloe Barbadensis Leaf Juice, Betaine, Carbomer, Hydroxyethylcellulose, Tromethamine, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- Caution: "For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children."
- Volume **100 ml** · Batch RMMH/204 · Mfg Sep-2026 · Exp Aug-2028 · M.R.P **not legible**.
- `stageCrop`: `x_240,y_40,w_330,h_680` (≈ 0.49:1).

## 3. What the review changes in the design system and copy

| Observation | Consequence |
|---|---|
| Covers are flat labels, mixed aspect (0.5:1 … 6.7:1), black ground | Product stages use a **label card**: `c_crop` to `stageCrop` → `c_pad,ar_1:1,b_auto` → `f_auto,q_auto,w_*`. Cards/hero: 1:1 plate on `--sf-color-surface-2` with a 1px glass hairline and the ambient glow *behind* the plate. Galleries show the full label with `object-fit: contain` on the same plate (white-canvas files 2 & 3 use the cropped variant as media #1's `stage` and the raw file as the zoomable full view). |
| Gold on pack is pale champagne (`#DCCF65`–`#FFFBA8`) | UI gold `#F5D76E` / highlight `#FFEFA6` / dark gold `#B88924` as briefed; eyebrows and prices use `#F5D76E`; gradient text may use the lighter logo range. |
| Icon ring is magenta→violet | Neon pink `#FF4FD8` / violet `#8B5CF6` accents are on-brand; the signature gradient (gold→pink→violet) literally reads as "logo gold + icon ring". |
| Every pack says "Mild Sandalwood Fragrance" | Add a quiet "Mild sandalwood fragrance" note line to the PDP purchase panel and showcase (as printed). |
| Every pack says "(Enriched with / Full of) Anti-Ageing Antioxidants" | Quote only inside the PDP "As printed on the pack" block; site copy says "antioxidant-rich". |
| Roundels ISO / GMP / NON GMO / CRUELTY FREE on every pack | `{{CERTIFICATIONS}}` resolves to these four labels *as printed* (owner to confirm the certificates exist); render as hairline chips on the PDP, never as "clinically proven". |
| Volumes legible on all eight | `size` seeded from packaging (see `PRODUCTS.md`); `{{SIZE_*}}` tokens are resolved, source noted. |
| MRP legible on three packs (Face Wash ₹390, Soap ₹90, Scrub ₹349) | Seeded as `price` with `priceSource: "packaging-mrp"` — owner to confirm; other five products ship as `price: null, priceTBA: true` → "Price on launch". |
| Pack copy is plain, benefit-led | Hero/showcase copy keeps the emotional register of the brief; the "About product" lines from the pack become the PDP `description`; the pack's three-word benefit line becomes `benefits[]` seeds. |
| Directions legible | `howToUse[]` seeded verbatim from the pack. |
| Ingredient lists legible | `ingredientsList` (INCI) seeded verbatim; `{{INCI_*}}` tokens are resolved. |
