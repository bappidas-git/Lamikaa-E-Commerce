// =============================================================================
// API Base URL Configuration
// =============================================================================
//
// The app talks to ONE of two backends, chosen entirely by .env:
//
//   Production            REACT_APP_API_URL=https://core.lamikanaturals.com/api/v1
//                         REACT_APP_USE_MOCK_API=false
//                         → the Laravel API + MySQL database on Cloudways.
//                         Set this way in .env.production.
//
//   Local mock (default)  REACT_APP_API_URL=http://localhost:3001
//                         REACT_APP_USE_MOCK_API=true
//                         → JSON Server over db.json (npm run dev).
//                         Set this way in the committed .env.
//
// Restart the dev server after changing .env. No code changes are needed to
// switch; every service method in api.js branches on IS_MOCK_API below, and the
// two branches are documented endpoint-for-endpoint in
// prompts/_reference/REPO_MAP.md §3 — the contract the Laravel side implements.
// `npm run test:live` drives api.js against a real API end to end; never point
// it at production.
// =============================================================================

// Development / Mock API URL (JSON Server)
export const MOCK_API_URL = "http://localhost:3001";

// Determine which URL to use
const getBaseURL = () => {
  if (process.env.REACT_APP_USE_MOCK_API === "true") {
    return MOCK_API_URL;
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (process.env.NODE_ENV === "development") {
    return MOCK_API_URL;
  }
  return process.env.REACT_APP_API_URL || MOCK_API_URL;
};

const BASE_URL = getBaseURL();

// Flag to detect mock API (JSON Server) mode
export const IS_MOCK_API =
  BASE_URL === MOCK_API_URL ||
  process.env.REACT_APP_USE_MOCK_API === "true";

export const API_VERSION = "v1";

if (process.env.NODE_ENV === "development") {
  console.log(`[API] Mode: ${IS_MOCK_API ? "JSON Server (Mock)" : "Production API"}`);
  console.log(`[API] Base URL: ${BASE_URL}`);
}

export default BASE_URL;
