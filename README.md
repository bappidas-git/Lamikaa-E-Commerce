# LAMIKAA NATURALS

Farmer-owned skincare rooted in the indigenous wisdom of Assam and Northeast India. The Black Rice range: cleanse, refresh, treat and moisturise — beauty that creates value for farmers. This repository holds the storefront and the admin console (Create React App, React 18, CSS Modules over `--sf-*` design tokens), served either by a local JSON Server mock or by the live Laravel API.

> Stub README — completed by Prompt 39. See `prompts/00_INDEX.md` for the rebuild programme.

## Run in mock mode

Starts the storefront on `http://localhost:3000` and JSON Server (over `db.json`) on `http://localhost:3001`:

```bash
npm ci && npm run dev
```

## Run against the live API

Edit `.env`: comment out the mock pair and uncomment the live pair.

```
# REACT_APP_API_URL=http://localhost:3001
# REACT_APP_USE_MOCK_API=true
REACT_APP_API_URL=https://core.lamikanaturals.com/api/v1
REACT_APP_USE_MOCK_API=false
```

Restart the dev server after any `.env` change. `.env.production` already carries these values, so `npm run build` targets the live API. `npm run test:live` writes to the real database — never run it casually.

## Admin

The admin console is at `/admin`. Seeded mock credentials: `admin@store.com` / `admin123` (change before production).

## Brand configuration

`src/config/brand.js` is the single source of brand truth: names, tagline, pillars, badges, logo and icon URLs, contact fields, SEO defaults and feature flags. No other file hard-codes the brand name, legal name, logo URL or icon URL. Facts the owner has not supplied yet are `{{TOKENS}}` (see `prompts/_reference/PLACEHOLDERS.md`); `src/utils/placeholders.js` hides them rather than printing them.

## Programme

The rebuild is delivered as 39 sequential prompts — see [`prompts/00_INDEX.md`](prompts/00_INDEX.md) and the running log in [`prompts/PROGRESS.md`](prompts/PROGRESS.md).
