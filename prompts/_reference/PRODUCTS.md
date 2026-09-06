# PRODUCTS — the LAMIKAA NATURALS launch range (seed source of truth)

> Section 4 of the brief + `PACKAGING_NOTES.md` + the seed data model (brief §8, adapted to the repo) + the hero/showcase copy (brief §7.2, refined after the packaging review). Prompt 06 seeds `db.json` from this file; Prompts 14, 16, 23–27 render it. Product facts below come from the brief or from the packaging; anything else is a placeholder (see `PLACEHOLDERS.md`).

## 1. Brand assets (final — character-exact)

| Asset | URL | Config key |
|---|---|---|
| Logo (wordmark, 1400×400, transparent) | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670626/logo.png` | `brand.logoUrl` |
| Icon (mark, 696×696, transparent corners) | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670625/icon.png` | `brand.iconUrl` |

Cloudinary delivery rule: never serve the raw URL at full size in the UI. `src/utils/cloudinary.js → cld(url, opts)` inserts transformations after `/upload/`: `cld(logo, { w: 480 })` → `…/upload/f_auto,q_auto,w_480/v1788670626/logo.png`. `srcSet` widths: 480 / 768 / 1080 / 1440 / 1920. Crops: `cld(url, { crop: {x,y,w,h}, ar: "1:1", pad: true, w: 900 })` → `…/upload/c_crop,x_…,y_…,w_…,h_…/c_pad,ar_1:1,b_auto/f_auto,q_auto,w_900/v…`. (Verified: transformation URLs on this cloud return 200.)

## 2. The eight products — cover URLs (character-exact) and packaging-derived facts

| # | Name (site) | slug | Cover image URL | Size (pack) | MRP (pack) | stageCrop (verify) |
|---|---|---|---|---|---|---|
| 1 | Black Rice Face Wash | `black-rice-face-wash` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Black-Rice-Face-Wash-Cover.jpg` | 200 ml | ₹390 | `x_1050,y_100,w_1500,h_3200` |
| 2 | Black Rice Goat Milk Soap | `black-rice-goat-milk-soap` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670693/Black-Rice-Goat-Milk-Soap-Cover.jpg` | 100 g | ₹90 | `x_216,y_522,w_1377,h_1269` |
| 3 | Black Rice Body Wash | `black-rice-body-wash` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670690/Body-Wash-Cover.jpg` | 250 ml | not legible → `priceTBA` | `x_715,y_30,w_395,h_710` |
| 4 | Black Rice Face Mask | `black-rice-face-mask` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670690/Face-Mask-Cover.jpg` | 100 g | not legible → `priceTBA` | `x_480,y_0,w_370,h_401` |
| 5 | Black Rice Face Mist | `black-rice-face-mist` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670691/Face-Mist-Cover.jpg` | 100 ml | not legible → `priceTBA` | `x_320,y_20,w_410,h_710` |
| 6 | Black Rice Exfoliating Face Scrub | `black-rice-exfoliating-face-scrub` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670694/Face-Scrub-Cover.jpg` | 100 g | ₹349 | `x_1700,y_0,w_1600,h_744` |
| 7 | Black Rice Face Serum | `black-rice-face-serum` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670692/Face-Serum-Cover.jpg` | 30 ml | not legible → `priceTBA` | `x_460,y_15,w_410,h_530` |
| 8 | Black Rice Moisturizer Gel | `black-rice-moisturizer-gel` | `https://res.cloudinary.com/v8vrixwq/image/upload/v1788670693/Moisturizer-Gel-Cover.jpg` | 100 ml | not legible → `priceTBA` | `x_240,y_40,w_330,h_680` |

Price policy (adaptation, see `00_INDEX.md`): a legible MRP is seeded as `price` with `priceSource: "packaging-mrp"` (owner to confirm); an illegible one is seeded as `price: null, priceTBA: true` and renders as "Price on launch" with Add to Cart disabled. The tokens `{{PRICE_<PRODUCT>}}` in `PLACEHOLDERS.md` map to these rows.

## 3. Category mapping, concerns, ritual steps, hero order

| # | shortName | `categoryId` (primary) | `categoryIds` | `concerns` | `ritualStep` | `heroOrder` |
|---|---|---|---|---|---|---|
| 1 | Face Wash | 1 face-care | [1, 3] | cleansing, brightening | `{ order: 1, label: "Cleanse", frequency: "Morning and evening" }` | 1 |
| 2 | Goat Milk Soap | 2 body-care | [2, 3] | nourishing, cleansing | `{ order: 1, label: "Body cleanse", frequency: "Daily" }` | 2 |
| 3 | Body Wash | 2 body-care | [2, 3] | hydration, refresh | `{ order: 1, label: "Body cleanse", frequency: "Daily" }` | 3 |
| 4 | Face Mask | 1 face-care | [1, 6] | glow, revive | `{ order: 3, label: "Treat", frequency: "Weekly" }` | 4 |
| 5 | Face Mist | 1 face-care | [1, 5] | hydration, refresh | `{ order: 2, label: "Refresh", frequency: "Whenever skin needs it" }` | 5 |
| 6 | Exfoliating Face Scrub | 1 face-care | [1, 6] | exfoliation, texture | `{ order: 2, label: "Polish", frequency: "2–3 times weekly" }` | 6 |
| 7 | Face Serum | 1 face-care | [1, 4] | brightening, even-tone | `{ order: 4, label: "Treat", frequency: "Daily" }` | 7 |
| 8 | Moisturizer Gel | 1 face-care | [1, 5] | hydration, comfort | `{ order: 5, label: "Moisturise", frequency: "Morning and evening" }` | 8 |

### Categories (seed — ids fixed, slugs stable)

| id | slug | name | displayName | order | kind | description (short) |
|---|---|---|---|---|---|---|
| 1 | `face-care` | Face Care | Face Care | 1 | `products` | Cleanse, refresh, treat and moisturise — the Black Rice face routine. |
| 2 | `body-care` | Body Care | Body Care | 2 | `products` | Everyday cleansing bars and washes with black rice and sandalwood. |
| 3 | `cleansers` | Cleansers | Cleansers | 3 | `products` | Face wash, body wash and the goat milk bar. |
| 4 | `serums` | Serums | Serums | 4 | `products` | Concentrated daily care for a rested, even-looking complexion. |
| 5 | `moisturizers` | Moisturizers | Moisturizers & Mists | 5 | `products` | Featherlight gel and an instant mist. |
| 6 | `masks` | Masks | Masks & Scrubs | 6 | `products` | Weekly treats: a clay mask and a fine rice scrub. |
| 7 | `rituals` | Rituals | Rituals | 7 | `rituals` | Curated routines, step by step. Route target `/rituals`. |

Each category also carries `heroImage` (placeholder, see `PLACEHOLDER_ASSETS.md`), `isActive: true`, `sortOrder = order`, `showInMainMenu: true`, `menuOrder = order`, `parentId: null`. The existing admin category manager keeps working unchanged (kind/heroImage/displayName added in Prompt 34).

### Concerns (seed collection `concerns`)

`cleansing` Cleansing · `brightening` Brightening · `hydration` Hydration · `refresh` Refresh · `glow` Glow · `revive` Revive · `exfoliation` Exfoliation · `texture` Texture · `even-tone` Even tone · `comfort` Comfort · `nourishing` Nourishing. Fields: `{ id, slug, name, order }`. "Shop by concern" links to `/shop?concern=<slug>` (a routing constraint rendered as a chaptered subset — not a filter UI).

### Rituals (seed collection `rituals`)

| id | slug | name | steps `[{ order, productId, alternativeProductId?, note, frequency }]` |
|---|---|---|---|
| 1 | `morning-glow` | The Morning Glow Ritual | 1 → Face Wash (1) "Begin with a clean slate" · 2 → Face Mist (5) "Wake the skin" · 3 → Face Serum (7) "A few drops, pressed in" · 4 → Moisturizer Gel (8) "Seal it in, weightlessly" |
| 2 | `evening-renewal` | The Evening Renewal Ritual | 1 → Face Wash (1) · 2 → Exfoliating Face Scrub (6), frequency "2–3 times weekly" · 3 → Face Mask (4), frequency "Weekly" · 4 → Face Serum (7) · 5 → Moisturizer Gel (8) |
| 3 | `black-rice-body` | The Black Rice Body Ritual | 1 → Goat Milk Soap (2) with `alternativeProductId: 3` (Body Wash) "Choose the bar or the wash" · 2 → Face Mist (5) "Finish with a refreshing mist" |

Each ritual: `story` (2–3 sentences in brand tone, derived from §3 of `BRAND.md` and the product promises — no invented facts), `image` (placeholder), `duration` text ("About five minutes" is acceptable copy, not a fact), `isActive: true`, `sortOrder`.

### Trust badges (brand config, never hard-coded)

`brand.trustBadges = ["Farmer to Consumer", "100% Organic", "Result Oriented"]` — rendered on every card, showcase and PDP. `brand.packBadges = ["ISO Certified", "GMP Certified", "Non-GMO", "Cruelty-Free"]` (as printed on packaging; owner to confirm) — rendered only on the PDP "As printed on the pack" block.

## 4. Copy — hero slides (emotion first; one slide per product)

| # | Eyebrow | Headline | Subtext |
|---|---|---|---|
| 1 | Black Rice Ritual · 01 / 08 | Begin again, every morning. | A gentle black rice cleanse that lifts the day's dust and leaves your skin calm, clear and quietly radiant. |
| 2 | Black Rice Ritual · 02 / 08 | Softness, handed down. | Black rice and goat milk, pressed into a bar that treats your skin the way tradition always meant to. |
| 3 | Black Rice Ritual · 03 / 08 | Let the day wash off you. | A nourishing black rice and sandalwood body wash that turns a quick shower into a slow, fragrant ritual. |
| 4 | Black Rice Ritual · 04 / 08 | Ten quiet minutes. Visibly yours. | A black rice clay mask that gives tired skin its freshness back, one unhurried evening at a time. |
| 5 | Black Rice Ritual · 05 / 08 | A breath of Assam, anywhere. | Hydrating black rice mist to wake, refresh and settle your skin whenever the day asks for a pause. |
| 6 | Black Rice Ritual · 06 / 08 | Reveal what was always there. | Fine black rice exfoliation that gently polishes away dullness and lets your natural light through. |
| 7 | Black Rice Ritual · 07 / 08 | The glow that grows with you. | A lightweight black rice serum for skin that looks rested, even and luminous, day after day. |
| 8 | Black Rice Ritual · 08 / 08 | Weightless. Endless. Hydration. | A featherlight black rice gel that drinks in fast and keeps skin soft, smooth and comfortable all day. |

CTAs on every slide: primary **"Explore the {shortName}"** → `/product/{slug}`; secondary **"Add to Cart"** (disabled with label "Coming soon" while `priceTBA`).

## 5. Copy — showcase sections and PDP fields (per product)

Field sources: `promise` (one line, brand tone) · `description` (2–3 lines, from the pack "About" reworded in second person, no new claims) · `benefits[]` (from the pack's benefit line + about) · `keyIngredients[]` (from the pack's "with …" band; benefits generic and cosmetic) · `howToUse[]` (pack directions, split into steps, verbatim wording) · `ingredientsList` (pack INCI verbatim) · `packClaims` (verbatim pack lines, shown only in "As printed on the pack") · `suitableFor` · `fragranceNote: "Mild sandalwood fragrance"` (all eight, as printed) · `caution` (pack, verbatim).

### 1 · Black Rice Face Wash — 01 Cleanse
- promise: "A gentle daily cleanse that leaves skin clean, refreshed and quietly bright."
- description: "Enriched with black rice and antioxidant-rich botanicals, this gentle face wash lifts away dirt, excess oil and impurities while helping your skin keep its natural moisture balance. Use it morning and evening and let clean feel calm."
- benefits: "Deeply cleanses", "Helps brighten the look of skin", "Hydrates", "Refreshes".
- keyIngredients: Black Rice — "antioxidant-rich, traditionally valued in Northeast India" · Aloe Vera — "soothing hydration" · Green Tea — "antioxidant-rich" · Neem — "traditionally used for clarifying" · Turmeric — "traditionally valued for a radiant look".
- howToUse: ["Apply on wet face.", "Massage gently in circular motions.", "Rinse thoroughly with water.", "Use morning and evening for best results."]
- packClaims: ["Enriched with Anti-Ageing Antioxidants", "Deeply Cleanses · Brightens Skin · Hydrates · Refreshes", "Mild Sandalwood Fragrance", "Net Vol. 200 ml"]
- ingredientsList: Aqua, Black Rice Extract, Aloe Vera Extract, Green Tea Extract, Turmeric Extract, Neem Extract, Tulsi Extract, Glycerin, Cocamidopropyl Betaine, Decyl Glucoside, Propanediol, Panthenol, Allantoin, Xanthan Gum, Sodium Chloride, Citric Acid, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- caution: "For external use only. Avoid direct contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children. Store in a cool, dry place away from direct sunlight."
- suitableFor: ["All skin types — patch test recommended"]

### 2 · Black Rice Goat Milk Soap — Body 01
- promise: "A luxurious cleansing bar that nourishes as it cleans."
- description: "Goat milk and black rice extract, pressed into a bar that gently cleanses while helping to nourish and moisturise your skin. Antioxidants help it feel soft, smooth and healthy-looking after every wash."
- benefits: "Nourishes", "Cleanses", "Softens skin".
- keyIngredients: Goat Milk — "gentle, nourishing cleanse" · Black Rice — "antioxidant-rich, traditionally valued in Northeast India" · Shea Butter — "softening" · Coconut Oil — "conditioning".
- howToUse: ["Wet the soap and work into a rich lather.", "Massage gently over the skin.", "Rinse thoroughly with water."]
- packClaims: ["Enriched With Anti-Ageing Antioxidants", "Suitable for all skin types", "With the goodness of Goat Milk & Black Rice Extract", "Nourishes · Cleanses · Softens Skin", "Mild Sandalwood Fragrance", "Net weight 100 g"]
- ingredientsList: Aqua, Glycerin, Goat Milk, Black Rice Extract, Rice Extract, Coconut Oil, Shea Butter, Aloe Vera Extract, Turmeric Extract, Liquorice Extract, Vitamin E, Sodium Chloride, Fragrance.
- caution: "For external use only. Avoid contact with eyes. Keep out of reach of children. Store in a cool, dry place after use."
- suitableFor: ["All skin types (as printed)"]

### 3 · Black Rice Body Wash — Body 01
- promise: "A nourishing wash that turns a quick shower into a slow, fragrant ritual."
- description: "Black rice and sandalwood extracts in a gentle cleansing formula that helps remove dirt and impurities while leaving your skin feeling soft, fresh and hydrated."
- benefits: "Nourishes", "Cleanses", "Hydrates".
- keyIngredients: Black Rice — "antioxidant-rich" · Sandalwood — "traditionally valued in India for a calm, fragrant finish" · Shea Butter & Squalane — "softening" · Niacinamide — "helps skin look smooth".
- howToUse: ["Apply to wet skin.", "Massage gently to create a rich lather.", "Rinse thoroughly with water."]
- packClaims: ["With Black Rice & Sandalwood Extract", "Full of Anti-Ageing Antioxidants", "Nourishes • Cleanses • Hydrates", "Mild Sandalwood Fragrance", "250 mL"]
- ingredientsList: Aqua, Glycerin, Oryza Sativa (Black Rice) Extract, Santalum Album (Sandalwood) Extract, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Glyceryl Stearate, Shea Butter, Squalane, Dimethicone, Niacinamide, Panthenol, Sodium Hyaluronate, Tocopherol, Carbomer, Xanthan Gum, Triethanolamine, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- caution: "For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children."
- suitableFor: ["All skin types — patch test recommended"]

### 4 · Black Rice Face Mask — 03 Treat (weekly)
- promise: "Ten quiet minutes for skin that looks refreshed and smooth."
- description: "A purifying clay mask with black rice, sandalwood, kaolin and bentonite. It helps absorb excess oil and impurities while aloe vera and skin-conditioning ingredients leave your skin feeling refreshed and smooth."
- benefits: "Helps absorb excess oil", "Refreshes", "Smooths the feel of skin".
- keyIngredients: Black Rice — "antioxidant-rich" · Sandalwood — "calming fragrance" · Kaolin & Bentonite — "purifying clays" · Aloe Vera — "soothing".
- howToUse: ["Apply an even layer to clean, dry face, avoiding the eye area.", "Leave for 10–15 minutes.", "Rinse thoroughly with water."]
- packClaims: ["With Black Rice, Sandalwood & Kaolin", "Full of Anti-Ageing Antioxidants", "Mild Sandalwood Fragrance", "Net wt. 100 g"]
- ingredientsList: Aqua, Oryza Sativa (Black Rice) Extract, Santalum Album (Sandalwood) Extract, Kaolin, Bentonite, Glycerin, Aloe Barbadensis Leaf Juice, Niacinamide, Panthenol, Allantoin, Sodium Hyaluronate, Xanthan Gum, Hydroxyethylcellulose, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- caution: "For external use only. Avoid contact with eyes. Patch test before use. Discontinue if irritation occurs."
- suitableFor: ["All skin types — patch test before use (as printed)"]

### 5 · Black Rice Face Mist — 02 Refresh
- promise: "An instant refresh you can reach for anywhere."
- description: "A refreshing facial mist with black rice, sandalwood, aloe vera, niacinamide and hyaluronic acid. It instantly refreshes the skin and helps keep it feeling soft, hydrated and comfortable."
- benefits: "Refreshes", "Hydrates", "Revitalizes the feel of skin".
- keyIngredients: Black Rice — "antioxidant-rich" · Aloe Vera — "soothing hydration" · Hyaluronic Acid (Sodium Hyaluronate) — "helps skin feel hydrated" · Niacinamide — "helps skin look smooth".
- howToUse: ["Close eyes and mist evenly over the face from a comfortable distance.", "Allow to absorb naturally.", "Use whenever skin needs a refreshing boost."]
- packClaims: ["With Black Rice, Sandalwood & Aloe Vera", "Full of Anti-Ageing Antioxidants", "Refreshes • Hydrates • Revitalizes", "Mild Sandalwood Fragrance", "Net vol. 100 ml"]
- ingredientsList: Aqua, Oryza Sativa (Black Rice) Extract, Santalum Album (Sandalwood) Extract, Glycerin, Propanediol, Aloe Barbadensis Leaf Juice, Niacinamide, Panthenol, Betaine, Sodium Hyaluronate, Allantoin, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Citric Acid, Sodium Citrate, Fragrance.
- caution: "For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children."
- suitableFor: ["All skin types — patch test recommended"]

### 6 · Black Rice Exfoliating Face Scrub — 02 Polish (2–3×/week)
- promise: "A fine polish that reveals smoother, brighter-looking skin."
- description: "Black rice, rice powder and walnut shell powder gently remove dead skin cells and help unclog pores, revealing smoother, brighter-looking skin without over-drying."
- benefits: "Gently exfoliates", "Helps unclog pores", "Reveals smoother, brighter-looking skin".
- keyIngredients: Black Rice — "antioxidant-rich" · Rice Powder & Walnut Shell Powder — "gentle physical exfoliants" · Jojoba & Almond Oil — "conditioning" · Green Tea & Cucumber — "refreshing".
- howToUse: ["Apply on damp face.", "Massage gently for 1–2 minutes.", "Rinse thoroughly.", "Use 2–3 times weekly."]
- packClaims: ["Exfoliating Face Scrub with the goodness of Black Rice", "Enriched With Anti-Ageing Antioxidants", "100 gm"]
- ingredientsList: Aqua, Black Rice Extract, Glycerin, Aloe Vera Extract, Rice Powder, Walnut Shell Powder, Kaolin Clay, Jojoba Oil, Almond Oil, Coconut Oil, Shea Butter, Niacinamide, Vitamin E, Liquorice Extract, Green Tea Extract, Cucumber Extract, Xanthan Gum, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- caution: "For external use only. Avoid contact with eyes and broken skin. Discontinue use if irritation occurs."
- suitableFor: ["All skin types — avoid broken skin; patch test recommended"]
- Note: `fragranceNote` is omitted for this product — the pack does not print the sandalwood line.

### 7 · Black Rice Face Serum — 04 Treat
- promise: "A daily drop of light for skin that looks rested, even and luminous."
- description: "A lightweight serum combining black rice extract, niacinamide and alpha-arbutin with hyaluronic acid and panthenol. It helps improve the appearance of dull, uneven-looking skin while supporting a soft, hydrated and smooth look."
- benefits: "Helps improve the look of dull, uneven skin", "Hydrates", "Leaves skin feeling soft and smooth".
- keyIngredients: Black Rice — "antioxidant-rich" · Niacinamide — "helps skin look even and smooth" · Alpha-Arbutin — "helps brighten the look of skin" · Hyaluronic Acid — "hydration" · Panthenol — "comfort".
- howToUse: ["Apply 2–3 drops to cleansed face and neck.", "Gently massage until absorbed.", "Follow with moisturizer.", "Use daily."]
- packClaims: ["With Black Rice, Niacinamide & Alpha-Arbutin", "Full of Anti-Ageing Antioxidants", "Mild Sandalwood Fragrance", "Net vol. 30 mL"]
- ingredientsList: Aqua, Oryza Sativa (Black Rice) Extract, Santalum Album (Sandalwood) Extract, Glycerin, Propanediol, Niacinamide, Alpha-Arbutin, Panthenol, Sodium Hyaluronate, Betaine, Allantoin, Tocopherol, Hydroxyethylcellulose, Carbomer, Tromethamine, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- caution: "For external use only. Avoid contact with eyes. Patch test before use."
- suitableFor: ["All skin types — patch test before use (as printed)"]

### 8 · Black Rice Moisturizer Gel — 05 Moisturise
- promise: "Weightless hydration that keeps skin soft, smooth and comfortable all day."
- description: "A lightweight moisturising gel with black rice extract, niacinamide, aloe vera and hyaluronic acid. Its refreshing texture helps replenish moisture and leaves your skin feeling soft, smooth and hydrated."
- benefits: "Hydrates", "Softens", "Refreshes".
- keyIngredients: Black Rice — "antioxidant-rich" · Hyaluronic Acid — "hydration" · Aloe Vera — "soothing" · Niacinamide — "helps skin look smooth".
- howToUse: ["Apply a small amount evenly over cleansed face and neck.", "Gently massage until absorbed.", "Use morning and evening."]
- packClaims: ["With Black Rice, Niacinamide & Hyaluronic Acid", "Full of Anti-Ageing Antioxidants", "Hydrates • Softens • Refreshes", "Mild Sandalwood Fragrance", "Net vol. 100 ml"]
- ingredientsList: Aqua, Oryza Sativa (Black Rice) Extract, Santalum Album (Sandalwood) Extract, Glycerin, Propanediol, Niacinamide, Panthenol, Sodium Hyaluronate, Aloe Barbadensis Leaf Juice, Betaine, Carbomer, Hydroxyethylcellulose, Tromethamine, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.
- caution: "For external use only. Avoid contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children."
- suitableFor: ["All skin types — patch test recommended"]

Showcase sections (home + shop) show: chapter number + ritual step ("01 — Cleanse"), name, `promise`, `description`, `keyIngredients[].name` chips, the three trust badges, price (or "Price on launch"), CTAs **"Explore more"** → PDP and **"Add to Cart"**.

## 6. Seed data model (adapted to the repo — see `00_INDEX.md` § Adaptations)

The existing product fields that code relies on are **kept**: `id`, `slug`, `name`, `sku`, `shortDescription`, `description`, `categoryId` (number, primary), `brand` ("LAMIKAA Naturals"), `images[]` (**derived** from `media`, primary first — kept in sync by `src/utils/product.js → syncProductMedia()` on every admin save and by `normalizeProduct()` on every read), `price` (number or `null`), `comparePrice`, `costPrice`, `stock`, `lowStockThreshold`, `weight`, `dimensions`, `variants[]` (empty for the launch range), `tags[]`, `featured`, `trending`, `hot`, `isActive`, `rating`, `totalReviews`, `metaTitle`, `metaDescription`, `relatedProductIds[]`, `frequentlyBoughtTogetherIds[]`, `createdAt`, `updatedAt`.

New fields: `shortName`, `categoryIds[]` (numbers), `concerns[]` (slugs), `ritualStep{order,label,frequency}`, `heroHeadline`, `heroSubtext`, `heroOrder` (1–8, `null` = not in the hero), `promise`, `benefits[]`, `keyIngredients[{name,benefit}]`, `howToUse[]`, `ingredientsList`, `packClaims[]`, `fragranceNote`, `caution`, `suitableFor[]`, `size`, `priceTBA`, `priceSource`, `currency: "INR"`, `badges[]` (defaults to `brand.trustBadges`), `media[]`, `faqs[{q,a}]`, `isNew`.

```jsonc
{
  "id": 1, "slug": "black-rice-face-wash", "name": "Black Rice Face Wash", "shortName": "Face Wash",
  "sku": "LK-BR-FW-001", "brand": "LAMIKAA Naturals", "categoryId": 1, "categoryIds": [1, 3],
  "concerns": ["cleansing", "brightening"], "ritualStep": { "order": 1, "label": "Cleanse", "frequency": "Morning and evening" },
  "heroHeadline": "Begin again, every morning.", "heroSubtext": "A gentle black rice cleanse that lifts the day's dust and leaves your skin calm, clear and quietly radiant.", "heroOrder": 1,
  "promise": "A gentle daily cleanse that leaves skin clean, refreshed and quietly bright.",
  "shortDescription": "A gentle daily cleanse that leaves skin clean, refreshed and quietly bright.",
  "description": "Enriched with black rice and antioxidant-rich botanicals, this gentle face wash lifts away dirt, excess oil and impurities while helping your skin keep its natural moisture balance. Use it morning and evening and let clean feel calm.",
  "price": 390, "priceSource": "packaging-mrp", "priceTBA": false, "comparePrice": 0, "costPrice": 0, "currency": "INR",
  "size": "200 ml", "stock": 100, "lowStockThreshold": 10, "weight": 0, "dimensions": null, "variants": [],
  "badges": ["Farmer to Consumer", "100% Organic", "Result Oriented"],
  "keyIngredients": [{ "name": "Black Rice", "benefit": "antioxidant-rich, traditionally valued in Northeast India" }, { "name": "Aloe Vera", "benefit": "soothing hydration" }, { "name": "Green Tea", "benefit": "antioxidant-rich" }, { "name": "Neem", "benefit": "traditionally used for clarifying" }, { "name": "Turmeric", "benefit": "traditionally valued for a radiant look" }],
  "benefits": ["Deeply cleanses", "Helps brighten the look of skin", "Hydrates", "Refreshes"],
  "howToUse": ["Apply on wet face.", "Massage gently in circular motions.", "Rinse thoroughly with water.", "Use morning and evening for best results."],
  "ingredientsList": "Aqua, Black Rice Extract, Aloe Vera Extract, Green Tea Extract, Turmeric Extract, Neem Extract, Tulsi Extract, Glycerin, Cocamidopropyl Betaine, Decyl Glucoside, Propanediol, Panthenol, Allantoin, Xanthan Gum, Sodium Chloride, Citric Acid, Disodium EDTA, Phenoxyethanol, Ethylhexylglycerin, Fragrance.",
  "packClaims": ["Enriched with Anti-Ageing Antioxidants", "Deeply Cleanses · Brightens Skin · Hydrates · Refreshes", "Mild Sandalwood Fragrance", "Net Vol. 200 ml"],
  "fragranceNote": "Mild sandalwood fragrance", "caution": "For external use only. Avoid direct contact with eyes. Discontinue use if irritation occurs. Keep out of reach of children. Store in a cool, dry place away from direct sunlight.",
  "suitableFor": ["All skin types — patch test recommended"],
  "media": [
    { "type": "image", "url": "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Black-Rice-Face-Wash-Cover.jpg", "alt": "Black Rice Face Wash by LAMIKAA Naturals — label", "primary": true, "crop": { "x": 1050, "y": 100, "w": 1500, "h": 3200 } },
    { "type": "image", "url": "https://picsum.photos/seed/lamikaa-black-rice-face-wash-2/1200/1500", "alt": "Black Rice Face Wash — placeholder lifestyle image", "placeholder": true },
    { "type": "image", "url": "https://picsum.photos/seed/lamikaa-black-rice-face-wash-3/1200/1500", "alt": "Black Rice Face Wash — placeholder texture image", "placeholder": true },
    { "type": "video", "url": "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", "poster": "https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Black-Rice-Face-Wash-Cover.jpg", "title": "How to use (placeholder video)", "placeholder": true }
  ],
  "images": ["https://res.cloudinary.com/v8vrixwq/image/upload/v1788670695/Black-Rice-Face-Wash-Cover.jpg", "https://picsum.photos/seed/lamikaa-black-rice-face-wash-2/1200/1500", "https://picsum.photos/seed/lamikaa-black-rice-face-wash-3/1200/1500"],
  "faqs": [{ "q": "How often should I use the face wash?", "a": "Morning and evening, as printed on the pack. Massage gently on a wet face and rinse thoroughly." }],
  "tags": ["black rice", "face wash", "cleanser", "face care"], "relatedProductIds": [5, 7, 8], "frequentlyBoughtTogetherIds": [5, 8],
  "featured": true, "trending": false, "hot": false, "isNew": true, "isActive": true, "rating": 0, "totalReviews": 0,
  "metaTitle": "Black Rice Face Wash · LAMIKAA NATURALS", "metaDescription": "A gentle black rice cleanse that lifts the day's dust and leaves your skin calm, clear and quietly radiant. Farmer-owned, rooted in Assam.",
  "createdAt": "2026-09-06T00:00:00.000Z", "updatedAt": "2026-09-06T00:00:00.000Z"
}
```

`media[]` item contract: `{ type: "image" | "video", url, alt?, primary?, crop?: {x,y,w,h} (image only, Cloudinary pixels), poster? (video), title? (video), placeholder?: true }`. Exactly one image is `primary`; `images[0]` always equals the primary image URL. Products with zero videos are normal.

`rating`/`totalReviews` are **0** for every product (no fabricated social proof); the PDP shows "No reviews yet" and no `aggregateRating` in JSON-LD until real approved reviews exist. Sample reviews (2 rows) are `isSample: true` and hidden by `brand.flags.showSampleReviews === false`.

Other seed collections are specified in Prompt 06 (categories, concerns, rituals, faqs with `group`, siteContent, announcements, heroConfig, settings, admins, one sample customer, three sample orders + matching payments/refunds/wallet rows, one sample coupon, one shipping method, empty cart/wishlist).
