import apiService from "../../services/api";

// =============================================================================
// The Rituals tab's data — categories and rituals, once
// =============================================================================
//
// The header's Rituals tab lists the ritual SUB-categories that have rituals
// filed under them (utils/categories.js → getRitualMenuCategories). The header
// is on every storefront route and has to know BEFORE it draws whether the tab
// has a dropdown at all, so the two reads are made once and kept in a module
// cache — the same shape as MegaPanel's `loadMegaPanelData`. Header.js clears
// it when the tab regains focus, so a collection added in the admin shows up
// without a reload.
// =============================================================================

let cache = null;
let pending = null;

export const loadRitualsMenuData = () => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = Promise.all([
      apiService.categories.getAll(),
      apiService.rituals.getAll(),
    ])
      .then(([categories, rituals]) => {
        cache = {
          categories: Array.isArray(categories) ? categories : [],
          rituals: Array.isArray(rituals) ? rituals : [],
        };
        return cache;
      })
      .catch((error) => {
        pending = null; // allow a retry
        throw error;
      });
  }
  return pending;
};

export const clearRitualsMenuCache = () => {
  cache = null;
  pending = null;
};
