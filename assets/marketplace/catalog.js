// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/marketplace/catalog.js
// Search / category filter / sort / membership-only filter / recently
// viewed / favorites-toggle wiring for the marketplace grid. One
// implementation — marketplace.html is a thin shell around this module.
// ═══════════════════════════════════════════════════════════════════════

import { PRODUCTS } from '../data/products/products.js';
import { getUIState, setUIState } from '../membership/store.js';
import { getList, toggleListItem } from './favorites.js';
import { getProduct } from '../data/products/products.js';

const RECENTLY_VIEWED_KEY = 'marketplace_recently_viewed';
const RECENTLY_VIEWED_MAX = 12;

export const SORTS = Object.freeze({
  newest: { label: 'Newest', fn: (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate) },
  'recently-updated': { label: 'Recently Updated', fn: (a, b) => new Date(b.releaseDate) - new Date(a.releaseDate) },
  recommended: { label: 'Recommended', fn: (a, b) => (a.relatedProductIds?.length || 0) < (b.relatedProductIds?.length || 0) ? 1 : -1 },
  popular: { label: 'Popular', fn: () => 0 }, // no view/sales telemetry yet — stable order until Phase-later analytics exists
});

/** Records a product view in localStorage (per-device browsing history only — see Phase 1 storage rule). */
export function recordRecentlyViewed(productId) {
  const list = getUIState(RECENTLY_VIEWED_KEY, []);
  const next = [productId, ...list.filter(id => id !== productId)].slice(0, RECENTLY_VIEWED_MAX);
  setUIState(RECENTLY_VIEWED_KEY, next);
}

export function getRecentlyViewed() {
  return getUIState(RECENTLY_VIEWED_KEY, []).map(getProduct).filter(Boolean);
}

/**
 * @param {{ query?: string, categoryId?: string, sort?: keyof SORTS,
 *   membershipOnly?: boolean, favoriteIds?: string[] }} filters
 */
export function filterProducts(filters = {}) {
  const { query = '', categoryId = '', sort = 'newest', membershipOnly = false, favoriteIds = null } = filters;
  let list = PRODUCTS.slice();

  if (categoryId) list = list.filter(p => p.categoryId === categoryId);
  if (membershipOnly) list = list.filter(p => !!p.membershipTier);
  if (favoriteIds) list = list.filter(p => favoriteIds.includes(p.id));

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  const sorter = SORTS[sort]?.fn || SORTS.newest.fn;
  return list.slice().sort(sorter);
}

/** Wires the star/favorite buttons inside a rendered product grid (event delegation, one listener per container). */
export function wireFavoriteButtons(container, userId, onChange) {
  container.addEventListener('click', async e => {
    const btn = e.target.closest('[data-fav-toggle]');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (!userId) { window.location.href = '/?authRequired=1'; return; }
    const productId = btn.dataset.favToggle;
    const currentlyIn = btn.classList.contains('active');
    const { inList, error } = await toggleListItem(userId, productId, 'favorite', currentlyIn);
    if (!error) {
      btn.classList.toggle('active', inList);
      onChange?.(productId, inList);
    }
  });
}

export async function getFavoriteIds(userId) {
  return getList(userId, 'favorite');
}
