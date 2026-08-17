// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/search/index.js
// Reusable global search: Marketplace products (all categories — EAs,
// Automations, AI Models, APIs, Datasets, Dev Resources) + Documentation,
// in one ranked result list. Pure client-side, no network calls beyond
// the already-loaded static data — fast by construction. Used by
// search.html and can be dropped into any page (nav search box, support
// hub, etc.) without re-implementing the matching logic.
// ═══════════════════════════════════════════════════════════════════════

import { PRODUCTS } from '../data/products/products.js';
import { getCategory } from '../data/products/categories.js';
import { DOCS_INDEX } from './docs-index.js';

function score(haystack, query) {
  const h = haystack.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return 0;
  if (h === q) return 100;
  if (h.startsWith(q)) return 80;
  if (h.includes(q)) return 50;
  return 0;
}

/**
 * @param {string} query
 * @returns {{ products: Array, docs: Array }} ranked, deduplicated results
 */
export function globalSearch(query) {
  const q = (query || '').trim();
  if (!q) return { products: [], docs: [] };

  const products = PRODUCTS
    .map(p => {
      const category = getCategory(p.categoryId);
      const s = Math.max(
        score(p.name, q) * 1.5,
        score(p.tagline, q),
        (p.tags || []).reduce((max, t) => Math.max(max, score(t, q)), 0),
        category ? score(category.label, q) * 0.8 : 0
      );
      return { ...p, _score: s };
    })
    .filter(p => p._score > 0)
    .sort((a, b) => b._score - a._score);

  const docs = DOCS_INDEX
    .map(d => ({ ...d, _score: Math.max(score(d.title, q) * 1.5, score(d.description, q)) }))
    .filter(d => d._score > 0)
    .sort((a, b) => b._score - a._score);

  return { products, docs };
}
