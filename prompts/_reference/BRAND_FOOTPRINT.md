# BRAND_FOOTPRINT — every Meghali's Silk reference in the repository

> Phase A, finding 9. Generated from a case-insensitive search (word boundaries on the short terms) across the repo excluding `node_modules`, `.git`, `build/` and `prompts/`: `meghali|silk|mekhela|mekhla|chador|sador|saree|\bsari\b|handloom|weav|\bloom\b|\bmuga\b|\beri\b|\bpat\b|assam|gamosa|blouse|sualkuchi|kolkata|galleria` plus the old asset/domain names listed in §1. Every hit is listed with its file, line and a trimmed excerpt. **The cleanup prompts (35, 36) consume this file group by group; the final verification grep must return zero.**

Note on false positives: `\beri\b` also matches nothing else in this repo; `\bpat\b` matches only the silk; `weav` matches the CSS class `.weave`/`.heritageWeave` (HeroSection, Home) and comments; `\bloom\b` matches the About page's `.loom` class and copy; `assam` matches `state: "Assam"` in seed addresses and the live test (Assam is also LAMIKAA's home state — those address values may stay, the copy may not); `kolkata` also matches `"timezone": "Asia/Kolkata"` in settings (keep — it is the IANA zone name).

Total hits: **531** across **62** files.

## 0. Summary by group

| Group | Files | Hits | Cleanup owner |
|---|---|---|---|
| A · Seed data (db.json) | 1 | 204 | Prompt 06 (reseed) → verified by 36 |
| B · Public shell (index.html, manifest) | 2 | 24 | Prompt 02 (index.html/manifest/favicons) → verified by 36 |
| C · Env / package | 3 | 4 | Prompt 02 (.env app name) + 36 (.env comments, package-lock unaffected) |
| D · Theme tokens & global CSS | 4 | 9 | Prompt 03 (token rewrite) + 35 (token names, comments) |
| E · Constants & utils | 4 | 31 | Prompt 02 (constants → brand config) + 36 |
| F · API layer & live test | 2 | 3 | Prompt 07 (comments) + 36 (live test BASE_URL, address fixtures) |
| G · Contexts | 1 | 1 | Prompt 03 |
| H · Admin panel | 4 | 10 | Prompt 32/34 (admin) + 35/36 |
| I · Storefront components | 20 | 45 | Prompts 09–13, 15 (rebuilds) + 35 (comments, class names) |
| J · Storefront pages | 21 | 200 | Prompts 16–31 (rebuilds/restyles) + 35/36 |

## 1. Identifiers that are brand-bound but do not contain a searched term

These do not appear in the grep above but must go in the same cleanup passes:

- **Old asset URLs:** `https://res.cloudinary.com/v8vrixwq/image/upload/v1787592407/meghali-silk-logo.png` and `…/v1787592405/meghali-silk-logo-white.png` (5 components, `public/index.html` ×3, admin ×2); Cloudinary catalogue images `…/v1788289312/muga_1_V1.png`, `muga_1_V2.png`, `muga_1_V3.png`, `muga_2_V1.png` (db.json products/categories, AboutUs); `placehold.co/...?text=Muga+Mekhela|Eri+Shawl|Silk+Suit|Baluchari+Silk|Georgette+Silk|Gamosa|Handwoven+in+Assam|The+Looms+of+Sualkuchi|In+the+Loom+Room` (db.json, `src/utils/heroConfig.js:144`, AboutUs).
- **Old domains / emails / phones / addresses:** `meghalissilk.com` (public/index.html OG/twitter urls), `core.meghalisilk.in` (.env comment, baseURL.js comment, api.live.test.js:152), `care@meghalisilk.com` (constants.js, db.json settings), `+91 33 4000 1100` / `wa.me/913340001100` (constants.js, db.json), `Galleria Producer Company Limited, Park Street, Kolkata, West Bengal 700016` (constants.js, db.json, PrivacyPolicy, TermsOfService, AboutUs), social handles `facebook.com/meghalisilk`, `instagram.com/meghalisilk`, `twitter.com/meghalisilk`, `youtube.com/@meghalisilk` (constants.js, db.json), `admin@mystore.com` (db.json notifications), `shubendu@assamdigital.com` (db.json users/leads).
- **Token / class / variable names carrying Meghali-era semantics:** `--sf-gradient-heritage`, `--sf-color-brand-green`, `--sf-color-brand-green-deep`, `--brand-logo-bg`, `--sf-color-emerald*` (legacy CTA name), `--sf-gradient-announce-1/2/3`, `--sf-cat-pink/purple/orange/blue/teal/red` ("muted silk tones"), `.weave`, `.heritageWeave`, `.heritage*` (Home), `.silks/.silk/.silkTerm/.silkName/.silkNote/.silkText/.loom` (AboutUs), `SILK_SPEC_LABELS`, `deriveSilkSpecRows`, `deriveFabricCraft`, `FABRIC_FAMILIES`, `productFabricLabels`, `isPremiumProduct` (`bridal` tag), `HERO_FALLBACK_SLIDES`, `HERO_FALLBACK_IMAGE`, `GRADIENT_PRESETS` (AdminHeroSection), `PROMISE_DETAIL["Authentic Silk"]`, `TRUST_BADGES` ("Authentic Silk"), `WHY_CHOOSE_US` (loom copy), `FAQ_ITEMS` (silk FAQs), `APP_TAGLINE`, `APP_DESCRIPTION`, `SUPPORT_*`, `SOCIAL_LINKS`, `MOCK_REVIEWERS` (AdminReviews).
- **localStorage / sessionStorage keys:** `theme` (removed with the toggle), `cart`, `wishlist`, `recentlyViewed`, `user`, `token`, `admin`, `adminToken` — none brand-named; keep them (no migration needed) except `theme`, which Prompt 03 deletes on first load.
- **File names:** none contain the old brand. `src/pages/Products/*` and `src/pages/HelpCenter/*`, `Support/*` are renamed for IA reasons, not brand reasons.
- **Test fixtures:** `src/services/api.live.test.js` uses `Guwahati / Assam` addresses (fine) and asserts the old API host (line 152).
- **Coupon codes:** `MUGA500`, `SUALKUCHI1000` and the other five Meghali codes in db.json.
- **Sample orders/customers/reviews:** all of db.json `users`, `orders`, `returns`, `payments`, `refunds`, `reviews`, `wishlist`, `cart`, `leads`, `walletTransactions` reference silk products or the old customers.
- **Email/invoice templates:** none exist in the repo (the admin invoice is generated inline in `src/pages/Admin/AdminOrders.js:370-416` from `settings.store`, fallback string "My E-Commerce Store").
- **Analytics IDs:** `settings.seo.googleAnalyticsId` / `facebookPixelId` are empty strings (nothing to remove).
- **Dangling doc references:** `STOREFRONT_UX_GUIDELINES.md`, `prompt_testing/09_authentication_and_session.md`, `backend-developer-guideline/postman-api-collection.json` (files do not exist; comments removed in Prompt 35).

## 2. Hits by file (file:line — kind — excerpt)

### A · Seed data (db.json)

#### `db.json` — 204 hits

- `5` — seed value — `"title": "The Bridal Muga Edit",`
- `6` — seed value — `"subtitle": "Heirloom Mekhela Chador woven to order in undyed Sualkuchi Muga",`
- `8` — seed value — `"link": "/products?category=muga-silk",`
- `27` — seed value — `"title": "Mekhela Chador from Sualkuchi",`
- `28` — seed value — `"subtitle": "Muga, Pat, Eri and Nuni — the Assamese drape, woven on village looms",`
- `29` — seed value — `"cta": "Explore Mekhela Chador",`
- `50` — seed value — `"subtitle": "A short list of genuinely reduced weaves — everything else stays at its honest price",`
- `70` — seed value — `"title": "New In: Eri Shawls & Stoles",`
- `71` — seed value — `"subtitle": "Handspun Eri — matte, warm and softer with every wash",`
- `73` — seed value — `"link": "/products?category=eri-silk",`
- `178` — seed value — `"question": "How should I care for Muga, Pat and Eri silk?###",`
- `179` — seed value — `"answer": "Dry-clean for the first couple of years, then a gentle cold hand wash with a mild detergent — Muga in particular grows softer and deepens i…`
- `194` — seed value — `"question": "Is the silk really handwoven in Assam?",`
- `195` — seed value — `"answer": "Yes. Every piece is woven on a handloom and bought directly from weaving families in and around Sualkuchi, the weaving village on the north…`
- `208` — seed value — `"question": "What is the difference between Muga, Pat, Eri and Nuni silk?",`
- `209` — seed value — `"answer": "Muga is the golden silk unique to Assam — undyed, unusually strong, and it only improves with age. Pat is the bright ivory-to-white mulberr…`
- `224` — seed value — `"question": "What comes in a Mekhela Chador set, and does it arrive stitched?",`
- `225` — seed value — `"answer": "A set is the two-piece drape: the mekhela, worn as the lower wrap, and the chador that goes over it. Both arrive unstitched and unpleated s…`
- `240` — seed value — `"answer": "Standard delivery reaches most of India in 5-7 business days and is free on orders above {freeShipping}. Express delivery arrives in 2-3 bu…`
- `255` — seed value — `"answer": "We offer a 7-day return. Request one from My Orders within 7 days of delivery and send the piece back unworn, unwashed and with its origina…`
- `360` — seed value — `"state": "Assam",`
- `374` — seed value — `"email": "shubendu@assamdigitaxcvbbl.com",`
- `400` — seed value — `"name": "Muga Silk",`
- `401` — seed value — `"slug": "muga-silk",`
- `402` — seed value — `"description": "Assam's own golden silk, undyed — the honey colour is the fibre's, not a dye. Strong, lustrous, and it deepens with every wash.",`
- `414` — seed value — `"name": "Pat Silk",`
- `415` — seed value — `"slug": "pat-silk",`
- `416` — seed value — `"description": "Bright ivory-to-white mulberry silk, the weave most often carried with zari for weddings and Bihu.",`
- `428` — seed value — `"name": "Eri Silk",`
- `429` — seed value — `"slug": "eri-silk",`
- `430` — seed value — `"description": "Handspun, matte and warm — Eri behaves more like a fine wool than a silk, which is why it makes the shawls.",`
- `444` — seed value — `"name": "Sualkuchi Muga Mekhela Chador — Natural Gold",`
- `445` — seed value — `"slug": "sualkuchi-muga-mekhela-chador-natural-gold",`
- `447` — seed value — `"shortDescription": "A two-piece Muga Mekhela Chador in undyed golden yarn, handwoven on Sualkuchi looms.",`
- `448` — seed value — `"description": "Woven in Sualkuchi, the weaving village on the north bank of the Brahmaputra where Muga has been worked for generations. The yarn is u…`
- `450` — seed value — `"brand": "Meghali's Silk",`
- `484` — seed value — `"mekhela chador",`
- `485` — seed value — `"muga",`
- `486` — seed value — `"assam silk",`
- `487` — seed value — `"sualkuchi",`
- `488` — seed value — `"handloom",`
- `498` — seed value — `"metaTitle": "Sualkuchi Muga Mekhela Chador — Natural Gold | Meghali's Silk",`
- `499` — seed value — `"metaDescription": "A two-piece Muga Mekhela Chador in undyed golden yarn, handwoven on Sualkuchi looms.",`
- `515` — seed value — `"name": "Pat Silk Mekhela Chador — Ivory & Gold",`
- `516` — seed value — `"slug": "pat-silk-mekhela-chador-ivory-and-gold",`
- `517` — seed value — `"sku": "MEK-PAT-006",`
- `518` — seed value — `"shortDescription": "Ivory Pat silk with a gold zari border — the drape worn at Bihu across Assam.",`
- `519` — seed value — `"description": "Pat is Assam's mulberry silk: brighter and finer than Muga, and traditionally kept in ivory and white. This is the drape you see on st…`
- `521` — seed value — `"brand": "Meghali's Silk",`
- `544` — seed value — `"sku": "MEK-PAT-006-IVY"`
- `551` — seed value — `"sku": "MEK-PAT-006-OFW"`
- `555` — seed value — `"mekhela chador",`
- `556` — seed value — `"pat",`
- `558` — seed value — `"assam silk",`
- `559` — seed value — `"sualkuchi",`
- `560` — seed value — `"handloom",`
- `570` — seed value — `"metaTitle": "Pat Silk Mekhela Chador — Ivory & Gold | Meghali's Silk",`
- `571` — seed value — `"metaDescription": "Ivory Pat silk with a gold zari border — the drape worn at Bihu across Assam.",`
- `587` — seed value — `"name": "Eri Silk Mekhela Chador — Undyed Natural",`
- `588` — seed value — `"slug": "eri-silk-mekhela-chador-undyed-natural",`
- `589` — seed value — `"sku": "MEK-ERI-010",`
- `590` — seed value — `"shortDescription": "Undyed Eri in its own oatmeal colour — matte, warm and made for wearing often.",`
- `591` — seed value — `"description": "Eri is the quiet member of the Assamese silk family. The cocoon is left to open before the yarn is reeled, so the filament is spun rat…`
- `593` — seed value — `"brand": "Meghali's Silk",`
- `616` — seed value — `"sku": "MEK-ERI-010-NAT"`
- `623` — seed value — `"sku": "MEK-ERI-010-RST"`
- `627` — seed value — `"mekhela chador",`
- `628` — seed value — `"eri",`
- `630` — seed value — `"assam silk",`
- `631` — seed value — `"handloom",`
- `641` — seed value — `"metaTitle": "Eri Silk Mekhela Chador — Undyed Natural | Meghali's Silk",`
- `642` — seed value — `"metaDescription": "Undyed Eri in its own oatmeal colour — matte, warm and made for wearing often.",`
- `658` — seed value — `"name": "Muga Silk Saree — Assam Golden",`
- `659` — seed value — `"slug": "muga-silk-saree-assam-golden",`
- `661` — seed value — `"shortDescription": "Six yards of undyed Muga with a woven border — the drape, in saree form.",`
- `662` — seed value — `"description": "The same Sualkuchi Muga we weave into Mekhela Chador, run to six and a quarter yards for those who prefer a saree. Undyed golden yarn …`
- `664` — seed value — `"brand": "Meghali's Silk",`
- `698` — seed value — `"saree",`
- `699` — seed value — `"muga",`
- `700` — seed value — `"assam silk",`
- `701` — seed value — `"sualkuchi",`
- `702` — seed value — `"handloom",`
- `712` — seed value — `"metaTitle": "Muga Silk Saree — Assam Golden | Meghali's Silk",`
- `713` — seed value — `"metaDescription": "Six yards of undyed Muga with a woven border — the drape, in saree form.",`
- `729` — seed value — `"name": "Pat Silk Saree — Ivory Zari",`
- `730` — seed value — `"slug": "pat-silk-saree-ivory-zari",`
- `731` — seed value — `"sku": "SAR-PAT-016",`
- `732` — seed value — `"shortDescription": "Ivory Pat silk with a gold zari border and anchal — the Assamese festive standard.",`
- `733` — seed value — `"description": "Ivory and gold is the combination Assam reaches for at Bihu, at weddings, at anything that calls for silk. This saree keeps to it stri…`
- `735` — seed value — `"brand": "Meghali's Silk",`
- `758` — seed value — `"sku": "SAR-PAT-016-IVY"`
- `765` — seed value — `"sku": "SAR-PAT-016-RED"`
- `769` — seed value — `"saree",`
- `770` — seed value — `"pat",`
- `772` — seed value — `"assam silk",`
- `773` — seed value — `"sualkuchi",`
- `774` — seed value — `"handloom",`
- `784` — seed value — `"metaTitle": "Pat Silk Saree — Ivory Zari | Meghali's Silk",`
- `785` — seed value — `"metaDescription": "Ivory Pat silk with a gold zari border and anchal — the Assamese festive standard.",`
- `801` — seed value — `"name": "Eri Silk Shawl — Undyed Ivory",`
- `802` — seed value — `"slug": "eri-silk-shawl-undyed-ivory",`
- `803` — seed value — `"sku": "STO-ERI-019",`
- `804` — seed value — `"shortDescription": "A handspun Eri shawl in undyed ivory, warm enough for a Guwahati winter evening.",`
- `805` — seed value — `"description": "Eri is spun rather than reeled, which gives it a soft, slightly irregular surface and a warmth closer to fine wool than to silk. This …`
- `807` — seed value — `"brand": "Meghali's Silk",`
- `830` — seed value — `"sku": "STO-ERI-019-IVY"`
- `837` — seed value — `"sku": "STO-ERI-019-NAT"`
- `843` — seed value — `"eri",`
- `845` — seed value — `"assam silk",`
- `846` — seed value — `"handloom",`
- `856` — seed value — `"metaTitle": "Eri Silk Shawl — Undyed Ivory | Meghali's Silk",`
- `857` — seed value — `"metaDescription": "A handspun Eri shawl in undyed ivory, warm enough for a Guwahati winter evening.",`
- `877` — seed value — `"name": "Eri Silk Shawl — Undyed Ivory",`
- `878` — old placeholder image URL — `"image": "https://placehold.co/600x800/FAF6EC/5C554A?text=Eri+Shawl",`
- `897` — seed value — `"name": "Pure Tussar Silk Saree — Indigo Block Print - Indigo",`
- `977` — seed value — `"name": "Bridal Silk Lehenga — Crimson Zardozi - Crimson / M",`
- `987` — seed value — `"name": "Pure Silk Unstitched Suit Set — Wine Floral - Wine / Free Size",`
- `988` — old placeholder image URL — `"image": "https://placehold.co/600x800/0B3B2E/CBA35A?text=Silk+Suit",`
- `1061` — seed value — `"name": "Baluchari Silk Saree — Maroon Narrative Pallu - Maroon",`
- `1062` — old placeholder image URL — `"image": "https://placehold.co/600x800/0B3B2E/CBA35A?text=Baluchari+Silk",`
- `1132` — seed value — `"name": "Mulberry Silk Stole — Pastel Set - Mint",`
- `1194` — seed value — `"name": "Baluchari Silk Saree — Midnight Blue - Midnight Blue",`
- `1209` — seed value — `"state": "Assam",`
- `1220` — seed value — `"state": "Assam",`
- `1263` — seed value — `"name": "Baluchari Silk Saree — Midnight Blue - Midnight Blue",`
- `1278` — seed value — `"state": "Assam",`
- `1289` — seed value — `"state": "Assam",`
- `1337` — seed value — `"name": "Banarasi Georgette Silk Saree — Wine - Wine",`
- `1338` — old placeholder image URL — `"image": "https://placehold.co/600x800/0B3B2E/CBA35A?text=Georgette+Silk",`
- `1352` — seed value — `"state": "Assam",`
- `1363` — seed value — `"state": "Assam",`
- `1426` — seed value — `"name": "Bengal Handloom Silk Saree — Dhakai Jamdani - White / Red",`
- `1441` — seed value — `"state": "Assam",`
- `1452` — seed value — `"state": "Assam",`
- `1528` — seed value — `"name": "Bridal Silk Lehenga — Crimson Zardozi - Crimson / M",`
- `1543` — seed value — `"state": "Assam",`
- `1554` — seed value — `"state": "Assam",`
- `1596` — seed value — `"name": "Bridal Silk Lehenga — Crimson Zardozi - Crimson / M",`
- `1606` — seed value — `"name": "Baluchari Silk Saree — Midnight Blue - Midnight Blue",`
- `1623` — seed value — `"state": "Assam",`
- `1637` — seed value — `"state": "Assam",`
- `1697` — seed value — `"name": "Banarasi Georgette Silk Saree — Wine - Wine",`
- `1698` — old placeholder image URL — `"image": "https://placehold.co/600x800/0B3B2E/CBA35A?text=Georgette+Silk",`
- `1714` — seed value — `"state": "Assam",`
- `1728` — seed value — `"state": "Assam",`
- `1963` — seed value — `"name": "Bridal Silk Lehenga — Crimson Zardozi - Crimson / M",`
- `1972` — seed value — `"name": "Pure Silk Unstitched Suit Set — Wine Floral - Wine / Free Size",`
- `2019` — seed value — `"name": "Banarasi Georgette Silk Saree — Wine - Wine",`
- `2184` — seed value — `"refundReason": "Bengal Handloom Silk Saree — Dhakai Jamdani - White / Red is returned",`
- `2426` — seed value — `"description": "Delivered in 5–7 business days in insured silk packaging",`
- `2450` — seed value — `"description": "Delivered today within select Kolkata pin codes",`
- `2486` — seed value — `"description": "₹500 off your Muga or Pat silk order above ₹5,000",`
- `2518` — seed value — `"description": "10% off bridal Muga sets above ₹25,000 — capped at ₹5,000",`
- `2533` — seed value — `"code": "SUALKUCHI1000",`
- `2534` — seed value — `"description": "₹1,000 off handloom orders above ₹10,000",`
- `2604` — seed value — `"body": "Lovely weave and the kesa border is neatly finished. Muga is stiffer off the loom than I expected and it took two wears before the chador ple…`
- `2617` — seed value — `"title": "Bought it as a saree rather than a drape",`
- `2618` — seed value — `"body": "I am not from Assam and do not wear a mekhela, so a Muga saree was exactly what I wanted. Six and a quarter yards, blouse piece included, and…`
- `2636` — seed value — `"body": "Handspun Eri is genuinely warm in a way I did not expect from silk — closer to a light wool. Undyed ivory goes with everything and the fringe…`
- `2641` — old placeholder image URL — `"https://placehold.co/300x300/FAF6EC/5C554A?text=Eri+Shawl"`
- `2653` — seed value — `"body": "Exactly the drape you see on stage at Bihu — ivory Pat, gold zari border, nothing extra. It holds a crisp pleat which is what I wanted. Sligh…`
- `2667` — seed value — `"body": "Straightforward handwoven gamosas with the proper red border and woven buta at both ends. The listing is honest that they are cotton, which i…`
- `2672` — old placeholder image URL — `"https://placehold.co/300x300/F2ECE1/C8912A?text=Gamosa"`
- `2684` — seed value — `"body": "No complaint about the Eri itself — it is soft, matte and exactly as described in the hand. But the natural oatmeal arrived noticeably paler …`
- `2697` — seed value — `"title": "Second Muga from Meghali’s, consistent quality",`
- `2698` — seed value — `"body": "Bought a Mekhela Chador last year and this saree in June. Same depth of gold, same finish on the border, so whatever they are doing at the Su…`
- `2724` — seed value — `"slug": "sualkuchi-muga-mekhela-chador-natural-gold",`
- `2725` — seed value — `"name": "Sualkuchi Muga Mekhela Chador — Natural Gold",`
- `2726` — old placeholder image URL — `"image": "https://placehold.co/600x800/F2ECE1/8A6118?text=Muga+Mekhela",`
- `2727` — seed value — `"brand": "Meghali's Silk",`
- `2732` — seed value — `"shortDescription": "A two-piece Muga Mekhela Chador in undyed golden yarn, handwoven on Sualkuchi looms.",`
- `2741` — seed value — `"Fabric": "Muga Silk",`
- `2753` — seed value — `"Fabric": "Muga Silk",`
- `2768` — seed value — `"slug": "muga-silk-saree-assam-golden",`
- `2769` — seed value — `"name": "Muga Silk Saree — Assam Golden",`
- `2770` — old placeholder image URL — `"image": "https://placehold.co/600x800/F2ECE1/8A6118?text=Muga+Saree",`
- `2771` — seed value — `"brand": "Meghali's Silk",`
- `2776` — seed value — `"shortDescription": "Six yards of undyed Muga with a woven border — the drape, in saree form.",`
- `2785` — seed value — `"Fabric": "Muga Silk",`
- `2797` — seed value — `"Fabric": "Muga Silk",`
- `2812` — seed value — `"slug": "eri-silk-shawl-undyed-ivory",`
- `2813` — seed value — `"name": "Eri Silk Shawl — Undyed Ivory",`
- `2814` — old placeholder image URL — `"image": "https://placehold.co/600x800/FAF6EC/5C554A?text=Eri+Shawl",`
- `2815` — seed value — `"brand": "Meghali's Silk",`
- `2820` — seed value — `"shortDescription": "A handspun Eri shawl in undyed ivory, warm enough for a Guwahati winter evening.",`
- `2827` — seed value — `"sku": "STO-ERI-019-IVY",`
- `2829` — seed value — `"Fabric": "Eri Silk",`
- `2839` — seed value — `"sku": "STO-ERI-019-NAT",`
- `2841` — seed value — `"Fabric": "Eri Silk",`
- `2919` — seed value — `"email": "shubendu@assamdigital.com",`
- `2934` — seed value — `"email": "shubendu@assamdigitaxcvbbl.com",`
- `2949` — seed value — `"name": "Meghali's Silk",`
- `2950` — seed value — `"tagline": "Handwoven Assamese silk from the looms of Sualkuchi",`
- `2951` — seed value — `"email": "care@meghalisilk.com",`
- `2953` — seed value — `"address": "Galleria Producer Company Limited, Park Street, Kolkata, West Bengal 700016",`
- `2956` — seed value — `"timezone": "Asia/Kolkata",`
- `2992` — seed value — `"metaTitle": "Meghali's Silk — Assamese Muga, Pat & Eri Silk Mekhela Chador and Sarees",`
- `2993` — seed value — `"metaDescription": "Handwoven Assamese silk from Sualkuchi — Muga, Pat and Eri Mekhela Chador, sarees, shawls, blouses and gifts. Naturally golden Mug…`
- `2998` — seed value — `"facebook": "https://facebook.com/meghalisilk",`
- `2999` — seed value — `"instagram": "https://instagram.com/meghalisilk",`
- `3000` — seed value — `"twitter": "https://twitter.com/meghalisilk",`
- `3001` — seed value — `"youtube": "https://youtube.com/@meghalisilk",`
- `3067` — seed value — `"title": "Honest Markdowns on Handwoven Assamese Silk",`
- `3068` — seed value — `"subtitle": "A short list of Muga, Pat and Eri pieces genuinely reduced from their original price. Everything else in the catalogue stays where it is.…`

### B · Public shell (index.html, manifest)

#### `public/index.html` — 21 hits

- `17` — old logo asset URL — `href="https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592407/meghali-silk-logo.png"`
- `23` — code / copy — `NOTE ON THE ARTWORK: the shipped icons draw the gold Assamese silk motif on`
- `59` — copy string — `content="Handwoven Assamese silk from Sualkuchi — Muga, Pat and Eri Mekhela Chador, sarees, shawls, blouses and gifts. Naturally golden Muga, soft mat…`
- `63` — copy string — `content="Assamese silk, Muga silk, Pat silk, Eri silk, Mekhela Chador, Sualkuchi silk, handwoven saree, Assam handloom, silk shawl, Meghali's Silk"`
- `65` — copy string — `<meta name="author" content="Meghali's Silk" />`
- `69` — copy string — `<meta property="og:site_name" content="Meghali's Silk" />`
- `71` — URL / domain — `<meta property="og:url" content="https://meghalissilk.com/" />`
- `74` — copy string — `content="Meghali's Silk — Assamese Muga, Pat &amp; Eri Silk Mekhela Chador and Sarees"`
- `78` — copy string — `content="Handwoven Assamese silk from Sualkuchi — Muga, Pat and Eri Mekhela Chador, sarees, shawls, blouses and gifts. Naturally golden Muga, soft mat…`
- `84` — copy string — `<meta property="og:image:alt" content="Meghali's Silk" />`
- `92` — URL / domain — `<meta name="twitter:url" content="https://meghalissilk.com/" />`
- `95` — copy string — `content="Meghali's Silk — Assamese Muga, Pat &amp; Eri Silk Mekhela Chador and Sarees"`
- `99` — copy string — `content="Handwoven Assamese silk from Sualkuchi — Muga, Pat and Eri Mekhela Chador, sarees, shawls, blouses and gifts. Naturally golden Muga, soft mat…`
- `105` — copy string — `<meta name="twitter:image:alt" content="Meghali's Silk" />`
- `143` — code / copy — `<title>Meghali's Silk — Assamese Muga, Pat &amp; Eri Silk Mekhela Chador and Sarees</title>`
- `248` — old logo asset URL — `background: url("https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592405/meghali-silk-logo-white.png")`
- `431` — old logo asset URL — `src="https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592407/meghali-silk-logo.png"`
- `432` — copy string — `alt="Meghali's Silk"`
- `438` — copy string — `<div class="loader-logo-dark" role="img" aria-label="Meghali's Silk"></div>`
- `440` — code / copy — `Handwoven Assamese silk from the looms of Sualkuchi`
- `465` — comment — `// Dark ("evening gallery") is the default for Meghali's Silk — this`

#### `public/manifest.json` — 3 hits

- `2` — copy string — `"short_name": "Meghali's Silk",`
- `3` — copy string — `"name": "Meghali's Silk",`
- `4` — copy string — `"description": "Handwoven Assamese silk from Sualkuchi — Muga, Pat and Eri Mekhela Chador, sarees, shawls, blouses and gifts.",`

### C · Env / package

#### `.env` — 2 hits

- `5` — URL / domain — `# Default: the live Laravel API on Cloudways (https://core.meghalisilk.in).`
- `30` — code / copy — `REACT_APP_NAME=Meghali's Silk`

#### `.env.production` — 1 hit

- `21` — code / copy — `REACT_APP_NAME=Meghali's Silk`

#### `package-lock.json` — 1 hit

- `7733` — copy string — `"integrity": "sha512-2sJGJTaXIIaR1w4iJSNoN0hnMY7Gpc/n8D4qSCJw8QqFWXf7cuAgnEHxBpweaVcPevC2l3KpjYCx3NypQQgaJg==",`

### D · Theme tokens & global CSS

#### `src/theme/storefront-tokens.css` — 5 hits

- `29` — comment — `* THE MEGHALI'S SILK EDITORIAL PALETTE (source of truth — read this first)`
- `38` — old logo asset URL — `* Light logo → …/v1787592407/meghali-silk-logo.png (gold on transparent)`
- `39` — old logo asset URL — `* White logo → …/v1787592405/meghali-silk-logo-white.png (white on transparent)`
- `131` — comment — `/* ---- Brand system (Meghali's Silk) ----------------------------------- */`
- `152` — comment — `/* Category accents — muted silk tones (clay / mauve / terracotta / indigo /`

#### `src/theme/tokens.js` — 2 hits

- `59` — comment — `// Which trust badges appear near the buy box, in order. For Meghali's Silk`
- `60` — comment — `// this maps to: 7-Day Returns / Authentic Silk / Free Shipping / Support.`

#### `src/theme/colors.js` — 1 hit

- `9` — comment — `// the Meghali's Silk logo artwork); keep the two in sync.`

#### `src/App.css` — 1 hit

- `2` — comment — `* GLOBAL STYLES — Meghali's Silk storefront`

### E · Constants & utils

#### `src/utils/constants.js` — 26 hits

- `2` — constant — `export const APP_NAME = process.env.REACT_APP_NAME || "Meghali's Silk";`
- `3` — constant — `export const APP_TAGLINE = "Heritage handloom silk, woven for you";`
- `4` — constant — `export const APP_DESCRIPTION = "Authentic women's silk sarees and ethnic wear, handwoven by master artisans – free shipping, easy returns, 100% genuin…`
- `114` — URL / domain — `FACEBOOK: "https://facebook.com/meghalisilk",`
- `115` — URL / domain — `TWITTER: "https://twitter.com/meghalisilk",`
- `116` — URL / domain — `INSTAGRAM: "https://instagram.com/meghalisilk",`
- `117` — URL / domain — `YOUTUBE: "https://youtube.com/@meghalisilk",`
- `121` — comment — `// Store contact (Meghali's Silk — Kolkata). Single source so the Header top bar,`
- `123` — constant — `export const SUPPORT_EMAIL = "care@meghalisilk.com";`
- `126` — copy string — `"Galleria Producer Company Limited, Park Street, Kolkata, West Bengal 700016";`
- `142` — copy string — `question: "How should I care for Muga, Pat and Eri silk?",`
- `144` — copy string — `"Dry-clean for the first couple of years, then a gentle cold hand wash with a mild detergent — Muga in particular grows softer and deepens in lustre e…`
- `148` — copy string — `question: "Is the silk really handwoven in Assam?",`
- `150` — copy string — `"Yes. Every piece is woven on a handloom and bought directly from weaving families in and around Sualkuchi, the weaving village on the north bank of t…`
- `154` — copy string — `question: "What is the difference between Muga, Pat, Eri and Nuni silk?",`
- `156` — copy string — `"Muga is the golden silk unique to Assam — undyed, unusually strong, and it only improves with age. Pat is the bright ivory-to-white mulberry silk, th…`
- `160` — copy string — `question: "What comes in a Mekhela Chador set, and does it arrive stitched?",`
- `162` — copy string — `"A set is the two-piece drape: the mekhela, worn as the lower wrap, and the chador that goes over it. Both arrive unstitched and unpleated so your tai…`
- `168` — copy string — `"Standard delivery reaches most of India in 5-7 business days and is free on orders above {freeShipping}. Express delivery arrives in 2-3 business day…`
- `174` — copy string — `"We offer a 7-day return. Request one from My Orders within 7 days of delivery and send the piece back unworn, unwashed and with its original tags and…`
- `191` — comment — `// Every line is traceable: the loom provenance to the catalogue copy and`
- `192` — comment — `// settings.store.tagline, the undyed-Muga claim to the FAQ above, the ₹999`
- `199` — copy string — `title: "Handwoven in Sualkuchi",`
- `201` — copy string — `"Bought directly from weaving families on the north bank of the Brahmaputra",`
- `206` — copy string — `title: "Undyed Muga, handspun Eri",`
- `272` — copy string — `"Authentic Silk",`

#### `src/utils/heroConfig.js` — 3 hits

- `144` — old placeholder image URL — `"https://placehold.co/1600x900/1D1A16/8A6118?text=Handwoven+in+Assam";`
- `151` — copy string — `title: "Handwoven Assamese Silk",`
- `153` — copy string — `"Muga, Pat and Eri from the looms of Sualkuchi — woven a metre a day.",`

#### `src/utils/categories.js` — 1 hit

- `69` — comment — `* (which has no products of its own) returns its Sarees and Kurtas products.`

#### `src/utils/documentTitle.js` — 1 hit

- `6` — comment — `// * StoreSettingsContext, which sets the store-wide default ("Meghali's Silk`

### F · API layer & live test

#### `src/services/api.live.test.js` — 2 hits

- `72` — copy string — `state: "Assam",`
- `152` — URL / domain — `expect(BASE_URL).toBe("https://core.meghalisilk.in/api/v1");`

#### `src/services/baseURL.js` — 1 hit

- `7` — comment — `// Production (default) REACT_APP_API_URL=https://core.meghalisilk.in/api/v1`

### G · Contexts

#### `src/context/ThemeContext.js` — 1 hit

- `40` — comment — `// Meghali's Silk. With no saved choice we default to dark; only an explicit`

### H · Admin panel

#### `src/pages/Admin/AdminHeroSection.js` — 4 hits

- `91` — copy string — `{ label: "Bridal Muga", value: "linear-gradient(135deg,#1D1A16 0%,#3A2E1B 60%,#8A6118 100%)" },`
- `92` — copy string — `{ label: "Sualkuchi", value: "linear-gradient(135deg,#322C25 0%,#6B5030 55%,#C8912A 100%)" },`
- `94` — copy string — `{ label: "Eri Warmth", value: "linear-gradient(135deg,#1D1A16 0%,#4A3F31 55%,#AF7E26 100%)" },`
- `1268` — copy string — `helperText="e.g. /products?category=mekhela-chador"`

#### `src/components/AdminLayout/AdminLayout.js` — 2 hits

- `44` — old logo asset URL — `"https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592407/meghali-silk-logo.png";`
- `46` — old logo asset URL — `"https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592405/meghali-silk-logo-white.png";`

#### `src/pages/Admin/AdminFaqs.js` — 2 hits

- `61` — comment — `// "does this Mekhela arrive stitched?" sits ahead of the store-wide one.`
- `814` — UI placeholder text — `placeholder="e.g. Does a Mekhela Chador arrive stitched?"`

#### `src/pages/Admin/AdminLogin.js` — 2 hits

- `26` — old logo asset URL — `"https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592407/meghali-silk-logo.png";`
- `28` — old logo asset URL — `"https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592405/meghali-silk-logo-white.png";`

### I · Storefront components

#### `src/components/SearchModal/SearchModal.js` — 13 hits

- `20` — copy string — `"Muga Mekhela Chador",`
- `21` — copy string — `"Pat silk saree",`
- `22` — copy string — `"Eri shawl",`
- `23` — copy string — `"Toss silk saree",`
- `30` — copy string — `"Sualkuchi",`
- `31` — copy string — `"Muga silk",`
- `32` — copy string — `"Pat silk",`
- `33` — copy string — `"Eri silk",`
- `34` — copy string — `"Toss silk",`
- `158` — comment — `// category's slug AND all of its descendants' slugs (so a "Mekhela Chador" chip`
- `159` — comment — `// still surfaces the Muga / Pat / Eri products beneath it). Returns`
- `633` — UI placeholder text — `placeholder="Search Muga, Eri, Mekhela Chador…"`
- `688` — code / copy — `Try another weave — Muga, Pat or Eri — or browse the whole collection.`

#### `src/components/Footer/Footer.js` — 8 hits

- `15` — comment — `* Footer — Meghali's Silk editorial close.`
- `18` — comment — `* 1. the invitation — serif "Letters from the loom" + the newsletter row`
- `45` — old logo asset URL — `"https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592405/meghali-silk-logo-white.png";`
- `77` — copy string — `label: "Authentic Assamese silk",`
- `198` — code / copy — `<p className={styles.invitationTitle}>Letters from the loom</p>`
- `200` — code / copy — `New arrivals, weave stories and quiet offers — straight to your`
- `274` — code / copy — `Muga, Eri and Pat silk, handwoven on the looms of Sualkuchi,`
- `275` — code / copy — `Assam.`

#### `src/components/Header/Header.js` — 4 hits

- `57` — old logo asset URL — `"https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592407/meghali-silk-logo.png";`
- `167` — comment — `// The old "Mega Silk" / "Bridal" chips bound themselves to a live category by`
- `168` — comment — `// regex with a ?search= fallback. The reseeded Assamese catalogue promotes`
- `169` — comment — `// those very collections — Mekhela Chador and Bridal & Occasion — into the`

#### `src/components/SidebarMenu/SidebarMenu.js` — 2 hits

- `40` — old logo asset URL — `"https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592407/meghali-silk-logo.png";`
- `42` — old logo asset URL — `"https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592405/meghali-silk-logo-white.png";`

#### `src/components/HeroSection/HeroSection.module.css` — 2 hits

- `2` — comment — `* HeroSection — Meghali's Silk cinematic opening`
- `201` — CSS class name — `.weave {`

#### `src/components/AuthModal/AuthModal.js` — 2 hits

- `26` — old logo asset URL — `"https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592407/meghali-silk-logo.png";`
- `28` — old logo asset URL — `"https://res.cloudinary.com/v8vrixwq/image/upload/f_auto,q_auto,w_520/v1787592405/meghali-silk-logo-white.png";`

#### `src/components/SidebarMenu/SidebarMenu.module.css` — 1 hit

- `2` — comment — `* SidebarMenu — Meghali's Silk editorial menu (mobile primary navigation)`

#### `src/components/CartDrawer/CartDrawer.js` — 1 hit

- `340` — code / copy — `Nothing chosen yet. The looms of Sualkuchi are waiting.`

#### `src/components/AnnouncementBar/AnnouncementBar.js` — 1 hit

- `34` — copy string — `{ id: "origin", text: "Handwoven in Sualkuchi, Assam" },`

#### `src/components/Header/Header.module.css` — 1 hit

- `2` — code / copy — `Header — Meghali's Silk editorial masthead`

#### `src/components/ErrorBoundary/ErrorBoundary.js` — 1 hit

- `42` — comment — `// Meghali's Silk brand palette mirrored here as literals on purpose: this`

#### `src/components/SearchModal/SearchModal.module.css` — 1 hit

- `2` — comment — `* SearchModal — Meghali's Silk editorial search overlay`

#### `src/components/BottomNav/BottomNav.module.css` — 1 hit

- `2` — comment — `* BottomNav — Meghali's Silk mobile bar`

#### `src/components/TrustStrip/TrustStrip.js` — 1 hit

- `19` — copy string — `{ id: "authentic", label: "Authentic Silk", icon: "mdi:certificate-outline" },`

#### `src/components/Footer/Footer.module.css` — 1 hit

- `2` — comment — `* Footer — Meghali's Silk editorial close`

#### `src/components/ReviewModal/ReviewModal.js` — 1 hit

- `281` — UI placeholder text — `placeholder="How does the weave feel? How true is the colour? What would you tell a friend?"`

#### `src/components/storefront/ProductCard.module.css` — 1 hit

- `249` — copy string — `in the two-up phone listing) "MEGHALI'S SILK" and one mark cannot share a`

#### `src/components/storefront/ProductCard.js` — 1 hit

- `17` — comment — `// ProductCard — the reusable Meghali's Silk storefront product card`

#### `src/components/HeroSection/HeroSection.js` — 1 hit

- `390` — code / copy — `<div className={styles.weave} />`

#### `src/components/AuthModal/AuthModal.module.css` — 1 hit

- `12` — comment — `* Meghali's Silk"). Everything else is quiet Inter: tracked uppercase for`

### J · Storefront pages

#### `src/pages/AboutUs/AboutUs.js` — 79 hits

- `2` — comment — `// OUR STORY — Meghali's Silk, route '/about'`
- `15` — comment — `// 3. THE FIBRE — Muga, Pat and Eri as a hairline list, closed by the`
- `16` — comment — `// Mekhela Chador: what the drape is and how it arrives.`
- `19` — comment — `// 5. THE LOOM — a full-bleed image band, presented AS an image.`
- `27` — comment — `// • THE STORY WAS THE WRONG ONE. The old copy sold "Bengal handloom",`
- `30` — comment — `// in Kolkata (settings.store.address) but the silk is Assamese: Muga, Pat,`
- `31` — comment — `// Eri and Nuni, handwoven in Sualkuchi on the north bank of the`
- `70` — comment — `// slot is the exception: the house's own photograph of a Muga Mekhela Chador,`
- `75` — old placeholder image URL — `"https://placehold.co/2400x1000/1D1A16/C8912A?text=The+Looms+of+Sualkuchi",`
- `78` — old placeholder image URL — `loom: "https://placehold.co/2000x1000/1D1A16/8A6118?text=In+the+Loom+Room",`
- `102` — constant — `const META = ["Est. 2010", "Kolkata", "Woven in Sualkuchi, Assam"];`
- `106` — comment — `// between Muga, Pat, Eri and Nuni silk?" and the authenticity answer), so the`
- `107` — comment — `// Help Centre and this page describe the same silks the same way.`
- `108` — constant — `const SILKS = [`
- `110` — copy string — `name: "Muga",`
- `113` — copy string — `"The golden silk unique to Assam — reared nowhere else. The deep honey colour is the fibre's own and never a dye, it is unusually strong, and it is on…`
- `116` — copy string — `name: "Pat",`
- `119` — copy string — `"The bright ivory-to-white mulberry silk, and the one most often woven with zari for weddings and festivals. It is the silk most of the occasion piece…`
- `122` — copy string — `name: "Eri",`
- `125` — copy string — `"Soft, matte, and spun by hand before it is woven. Eri behaves more like a fine wool than a silk — quietly warm to wear — which is why it goes into th…`
- `137` — copy string — `"From weaving families in and around Sualkuchi, on the north bank of the Brahmaputra. We buy from the loom the piece came off.",`
- `143` — copy string — `"Every piece in the shop left a handloom. A handloom moves about a metre a day, and a Mekhela Chador can take weeks to come off the beam.",`
- `149` — copy string — `"Undyed Muga is sold undyed and Eri is handspun. Each listing carries the details the weaver gave us for that particular piece.",`
- `155` — copy string — `"In 2023 the house was honoured with a National Handloom Award for the craftsmanship behind this work.",`
- `161` — comment — `// silk actually comes from.`
- `167` — copy string — `"{store} begins in Kolkata as the flagship label of Galleria Producer Company Limited, selling Assamese handloom silk to people who could not get to t…`
- `173` — copy string — `"Direct buying begins with master weaving families in and around Sualkuchi — no tier between the loom and the shop.",`
- `179` — copy string — `"The house joins a National Handloom Development effort supporting weaving families.",`
- `184` — copy string — `text: "Honoured with a National Handloom Award for craftsmanship.",`
- `192` — copy string — `{ value: "2010", label: "Founded in Kolkata" },`
- `194` — copy string — `{ value: "2023", label: "National Handloom Award" },`
- `254` — code / copy — `Three silks, one river, and the families who weave them.`
- `257` — code / copy — `{storeName} began in Kolkata in 2010 on a single conviction: that`
- `258` — code / copy — `the silk worth keeping is still made by hand, on the north bank of`
- `259` — code / copy — `the Brahmaputra, by weavers who learned the loom from their mothers.`
- `273` — copy string — `alt="A row of handlooms in a weaving shed in Sualkuchi, Assam"`
- `290` — code / copy — `A Kolkata house, an Assamese loom`
- `295` — code / copy — `<strong>Galleria Producer Company Limited</strong>, a producer`
- `296` — code / copy — `company on Park Street in Kolkata built around a single trade:`
- `297` — code / copy — `Assamese handloom silk.`
- `301` — code / copy — `the shop is bought directly from weaving families in and`
- `302` — code / copy — `around Sualkuchi — the silk village on the north bank of the`
- `303` — code / copy — `Brahmaputra — where a handloom moves about a metre a day and a`
- `304` — code / copy — `Mekhela Chador can take weeks to come off the beam.`
- `307` — code / copy — `What that buys is not speed. It is a cloth with the weaver's`
- `309` — code / copy — `by a person, a depth of surface no power loom reproduces, and`
- `311` — code / copy — `way of working was recognised with a National Handloom Award.`
- `336` — code / copy — `<h2 className={styles.chapterTitle}>Muga, Pat and Eri</h2>`
- `339` — code / copy — `Four silks come off the looms we buy from. Three of them carry`
- `340` — code / copy — `the collection; the fourth, Nuni, is a mulberry silk with a`
- `341` — code / copy — `quieter finish that turns up in the everyday weaves. Every`
- `346` — code / copy — `<dl className={styles.silks}>`
- `347` — code / copy — `{SILKS.map((silk) => (`
- `348` — code / copy — `<div key={silk.name} className={styles.silk}>`
- `349` — code / copy — `<dt className={styles.silkTerm}>`
- `350` — code / copy — `<span className={styles.silkName}>{silk.name}</span>`
- `351` — code / copy — `<span className={styles.silkNote}>{silk.note}</span>`
- `353` — code / copy — `<dd className={styles.silkText}>{silk.text}</dd>`
- `359` — code / copy — `<h3 className={styles.subTitle}>The Mekhela Chador</h3>`
- `361` — code / copy — `Not a saree, and not a version of one. The Mekhela Chador is a`
- `362` — code / copy — `two-piece drape — the mekhela worn as the lower wrap, the`
- `363` — code / copy — `chador taken over it — and it is what Assam wears to weddings,`
- `368` — code / copy — `the loom, so your own tailor can pleat, hem and finish them to`
- `369` — code / copy — `your measurements. A matching blouse piece is listed`
- `387` — copy string — `alt="A Muga Mekhela Chador in undyed Muga gold — the mekhela and the chador draped together, floral butis through the body and a wide woven border at …`
- `397` — code / copy — `Everything here came off a handloom`
- `401` — code / copy — `Mekhela Chador sets in Muga, Pat, Eri and Nuni. Sarees. Eri`
- `402` — code / copy — `shawls and stoles for the cold months. Blouse pieces and`
- `407` — code / copy — `Each listing carries what the weaver told us about that`
- `408` — code / copy — `particular piece — the silk, the work in it, and the`
- `421` — code / copy — `{/* ── 5. THE LOOM — an image band, presented as one ───────────────── */}`
- `422` — code / copy — `<motion.figure className={styles.loom} {...reveal()}>`
- `424` — code / copy — `src={IMAGES.loom}`
- `425` — copy string — `alt="A weaver at a handloom, a length of golden Muga silk on the beam"`
- `433` — code / copy — `Sualkuchi, on the north bank of the Brahmaputra. Every piece we sell`
- `434` — code / copy — `begins on a loom like this one.`
- `499` — code / copy — `&ldquo;We don't manufacture silk. We keep a craft alive, one loom`
- `529` — code / copy — `Come and see what a handloom does that nothing else can — or write`
- `530` — code / copy — `to us, and someone at the desk in Kolkata will help you choose.`

#### `src/pages/ProductDetails/ProductDetails.js` — 25 hits

- `152` — comment — `// The silk spec rows, in the order the design shows them.`
- `153` — constant — `const SILK_SPEC_LABELS = [`
- `157` — copy string — `"Saree Length",`
- `158` — copy string — `"Blouse Length",`
- `160` — copy string — `"Blouse Width",`
- `161` — copy string — `"Weave Type",`
- `202` — comment — `// Build the silk spec table rows. Returns [] unless the product carries at least`
- `203` — comment — `// one EXPLICIT silk spec field (specifications/specs/attributes) — the variant`
- `204` — comment — `// fabric / occasion fallbacks only enrich an already-silk product, they never`
- `205` — comment — `// fabricate a silk table on their own.`
- `206` — code / copy — `const deriveSilkSpecRows = (product) => {`
- `208` — code / copy — `const hasExplicit = SILK_SPEC_LABELS.some((l) =>`
- `217` — copy string — `"Weave Type": product?.weaveType,`
- `224` — code / copy — `SILK_SPEC_LABELS.forEach((label) => {`
- `234` — comment — `// when no silk-specific data is present. Still real-data-only.`
- `260` — comment — `// craft-specific content: an explicit story field, OR a real weave/origin/craft`
- `272` — copy string — `const weave = get("Weave Type") || cleanSpecValue(product?.weaveType);`
- `273` — copy string — `if (weave) facts.push({ label: "Weave Type", value: weave });`
- `603` — code / copy — `const silkSpecRows = deriveSilkSpecRows(product);`
- `605` — code / copy — `silkSpecRows.length > 0`
- `606` — code / copy — `? silkSpecRows`
- `695` — copy string — `text: "Certified genuine silk",`
- `706` — copy string — `text: "Crafted on the handloom",`
- `981` — code / copy — `{/* ── Specification — the silk table, rows the product really`
- `1007` — code / copy — `{/* ── Fabric & Craft — the loom story as an interlude. Only ever`

#### `src/pages/AboutUs/AboutUs.module.css` — 17 hits

- `15` — code / copy — `silk names, the years and the figures. Inter carries the body and the`
- `20` — code / copy — `loom, the pull-quote) so the page breathes between chapters. They work`
- `302` — code / copy — `3. THE FIBRE — three silks as hairline rows`
- `305` — CSS class name — `.silks {`
- `310` — CSS class name — `.silk {`
- `318` — CSS class name — `.silk:last-child {`
- `322` — CSS class name — `.silkTerm {`
- `328` — CSS class name — `.silkName {`
- `336` — CSS class name — `.silkNote {`
- `344` — CSS class name — `.silkText {`
- `429` — code / copy — `5. THE LOOM — a photograph, and nothing pretending to be a player`
- `434` — CSS class name — `.loom {`
- `439` — CSS class name — `.loom img {`
- `770` — CSS class name — `.loom img {`
- `811` — CSS class name — `.silk,`
- `817` — CSS class name — `.silk {`
- `821` — CSS class name — `.silkTerm {`

#### `src/pages/Products/Products.js` — 17 hits

- `130` — comment — `// The Assamese fabric vocabulary — the "Fabric" facet. Labels and match tokens`
- `131` — comment — `// mirror 'variants[].attributes.Fabric' in the catalogue: the four silks the`
- `132` — comment — `// collections are organised by (Muga, Pat, Eri, Toss), the cotton-and-kesapat`
- `133` — comment — `// weave, and the handloom cotton the gamosa gift sets are woven from. Order`
- `134` — comment — `// here is the display order — silks first, then the cottons.`
- `143` — comment — `// names on purpose: the catalogue also tags single words ("muga", "pat", "eri",`
- `144` — comment — `// "cotton", "handloom"), so a bare "muga" would drag every Muga-tagged blend`
- `145` — comment — `// into the pure-Muga family, and two adjacent tags would join across the`
- `149` — copy string — `{ label: "Muga Silk", match: ["muga silk"] },`
- `150` — copy string — `{ label: "Pat Silk", match: ["pat silk"] },`
- `151` — copy string — `{ label: "Eri Silk", match: ["eri silk"] },`
- `152` — copy string — `{ label: "Toss Silk", match: ["toss silk"] },`
- `154` — copy string — `{ label: "Handloom Cotton", match: ["handloom cotton"] },`
- `273` — comment — `// Empty state — a loom with the warp strung and nothing woven on it yet. Line`
- `606` — comment — `// Sarees/Kurtas items. Picking a leaf category returns just that category.`
- `649` — comment — `// Fabric (silk family) — derived client-side from variants/tags; a product`
- `1001` — copy string — `return "All Silk";`

#### `src/pages/Home/Home.js` — 9 hits

- `70` — copy string — `"Authentic Silk": {`
- `72` — copy string — `text: "Genuine handloom silk, woven by master artisans.",`
- `428` — copy string — `lede="From everyday Eri to heirloom Muga — start with the drape that suits the day."`
- `510` — copy string — `lede="A short list from the loom — the pieces we would reach for first."`
- `578` — copy string — `<div className={styles.heritageWeave} aria-hidden="true" />`
- `586` — code / copy — `Muga is reared nowhere else on earth. We weave it a metre a day.`
- `591` — code / copy — `Every drape here leaves a handloom in Sualkuchi, Assam's silk`
- `592` — code / copy — `village — Muga, Pat, Eri and Nuni, thrown by hand and finished`
- `593` — code / copy — `by hand, by weavers who learned the loom from their mothers.`

#### `src/pages/RefundPolicy/RefundPolicy.js` — 9 hits

- `2` — comment — `// RETURN & REFUND POLICY — Meghali's Silk, route '/refund'`
- `22` — comment — `// • THE CONDITIONS SAID NOTHING ABOUT SILK. A returns policy for handwoven`
- `23` — comment — `// cloth has to distinguish a weaving irregularity (which is the handloom,`
- `65` — copy string — `text: "The piece is checked within two business days of reaching Kolkata — that the tags are intact, that it is unworn and unwashed, and that the faul…`
- `74` — copy string — `"Arrived damaged, stained, or with a genuine weaving fault",`
- `82` — copy string — `"Blouses stitched or altered to your measurements",`
- `188` — code / copy — `Silk keeps a record of how it has been handled, so the condition`
- `194` — code / copy — `Please read a slub in the weave, a small unevenness in the zari`
- `196` — code / copy — `colour in your hands as what they are — the marks of a handloom`

#### `src/pages/TermsOfService/TermsOfService.js` — 9 hits

- `2` — comment — `// TERMS OF SERVICE — Meghali's Silk, route '/terms'`
- `18` — comment — `// — ₹99 free above ₹999, ₹199 free above ₹4,999, ₹499 same-day in Kolkata —`
- `96` — copy string — `'By browsing or buying from ${storeName}, operated by Galleria Producer Company Limited of Kolkata, West Bengal, you agree to the terms set out below.…`
- `118` — copy string — `"Handloom silk varies. Slight irregularities in the weave, and small differences between the colour on your screen and the colour in your hands, are c…`
- `131` — copy string — `"Every piece is dispatched from Kolkata in insured packaging. The methods available to you are shown at checkout and depend on your pin code:",`
- `144` — copy string — `text: "₹499, within select Kolkata pin codes, on pieces already in stock.",`
- `169` — copy string — `'Everything published on ${storeName} — the photographs, the written descriptions, the wordmark and the site itself — belongs to Galleria Producer Com…`
- `170` — copy string — `"Traditional Assamese motifs are the shared inheritance of the weaving communities of Assam; nothing here claims ownership of them. Our claim is to ou…`
- `183` — copy string — `"These terms are governed by the laws of India. Any dispute arising from them is subject to the exclusive jurisdiction of the courts of Kolkata, West …`

#### `src/pages/Support/Support.js` — 6 hits

- `2` — comment — `// CONTACT — Meghali's Silk, route '/support'`
- `134` — copy string — `{ value: "2010", label: "Founded in Kolkata" },`
- `136` — copy string — `{ value: "2023", label: "National Handloom Award" },`
- `307` — code / copy — `Whether you are choosing a first Mekhela Chador, asking after a piece`
- `308` — code / copy — `already on its way, or learning how to keep Muga for the next`
- `309` — code / copy — `generation — write to us. Someone at the desk in Kolkata will answer.`

#### `src/pages/PrivacyPolicy/PrivacyPolicy.js` — 5 hits

- `2` — comment — `// PRIVACY POLICY — Meghali's Silk, route '/privacy'`
- `15` — comment — `// house: the stitching measurements a made-to-measure blouse needs, the`
- `63` — copy string — `'Galleria Producer Company Limited, the company behind ${storeName}, collects the details you give us when you open an account, place an order or writ…`
- `71` — copy string — `"We also use it to meet our obligations under Indian tax and consumer law, to detect and prevent fraud, and — only where you have asked for it — to se…`
- `152` — code / copy — `{storeName} is a small house selling handwoven Assamese silk. This`

#### `src/pages/CookiePolicy/CookiePolicy.js` — 4 hits

- `2` — comment — `// COOKIE POLICY — Meghali's Silk, route '/cookies'`
- `64` — copy string — `"Tells us, in aggregate, which pages and which weaves are being looked at, so we know what to photograph and stock.",`
- `115` — code / copy — `the site set, and understand which weaves are being looked at.`
- `131` — code / copy — `that is how a site remembers that the sari you added is still in`

#### `src/pages/HelpCenter/HelpCenter.js` — 3 hits

- `2` — comment — `// HELP CENTRE — Meghali's Silk, route '/help'`
- `201` — code / copy — `The questions we are asked most often, answered in full — on silk and`
- `215` — UI placeholder text — `placeholder="Muga, delivery, returns…"`

#### `src/pages/Home/Home.module.css` — 3 hits

- `2` — code / copy — `HOME PAGE — Meghali's Silk, read as a magazine (below the Prompt 12 hero)`
- `487` — code / copy — `The weave is a pair of hairline gradients — the same device as the hero's —`
- `498` — CSS class name — `.heritageWeave {`

#### `src/pages/Checkout/Checkout.js` — 3 hits

- `210` — comment — `// Empty state — the counter with nothing on it: a hairline tray, the loom's`
- `518` — code / copy — `Nothing has been set aside for this order yet. Choose a weave and it`
- `855` — code / copy — `Delivered across India in insured silk packaging.`

#### `src/pages/OrderHistory/OrderHistory.js` — 2 hits

- `691` — code / copy — `Your ledger opens with the first piece you take home. Muga, Pat and`
- `692` — code / copy — `Eri — woven in Assam, and waiting.`

#### `src/pages/ProductDetails/ProductDetails.module.css` — 2 hits

- `19` — code / copy — `as a hairline table, the loom story as a pull-quote interlude, the`
- `505` — code / copy — `values; the loom story as a pull-quote interlude over a ruled facts grid;`

#### `src/pages/Wishlist/Wishlist.js` — 2 hits

- `91` — comment — `// Empty state — a heart drawn in hairline with the loom's gold weft laid across`
- `354` — code / copy — `Tap the heart on any piece and it waits for you here — the weave,`

#### `src/pages/Profile/Profile.module.css` — 1 hit

- `531` — comment — `/* A plate, not a thumbnail: the silk's own proportion, hairline-bounded. An`

#### `src/pages/PrivacyPolicy/PrivacyPolicy.module.css` — 1 hit

- `2` — copy string — `PRIVACY POLICY — Meghali's Silk, route '/privacy'`

#### `src/pages/CookiePolicy/CookiePolicy.module.css` — 1 hit

- `2` — copy string — `COOKIE POLICY — Meghali's Silk, route '/cookies'`

#### `src/pages/RefundPolicy/RefundPolicy.module.css` — 1 hit

- `2` — copy string — `RETURN & REFUND POLICY — Meghali's Silk, route '/refund'`

#### `src/pages/TermsOfService/TermsOfService.module.css` — 1 hit

- `2` — copy string — `TERMS OF SERVICE — Meghali's Silk, route '/terms'`

## 3. Verification (must return zero after Prompt 36)

```bash
grep -riIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts \
  -e "meghali" -e "mekhela" -e "mekhla" -e "chador" -e "saree" -e "sari\b" -e "handloom" -e "muga" .
grep -riIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts -e "silk" .
grep -riIn --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=build --exclude-dir=prompts \
  -e "sualkuchi" -e "galleria" -e "meghalisilk" -e "meghalissilk" -e "gamosa" -e "blouse" -e "v1787592407" -e "v1787592405" -e "v1788289312" -e "v1788289308" -e "v1788289311" .
# after `npm run build`:
grep -riIl -e "meghali" -e "mekhela" -e "chador" -e "saree" -e "handloom" -e "muga" -e "silk" build/ || echo "build clean"
```

`kolkata` and `assam` are checked separately: the only permitted survivors are `"timezone": "Asia/Kolkata"` and genuine LAMIKAA/Assam references (the brand *is* from Assam).
