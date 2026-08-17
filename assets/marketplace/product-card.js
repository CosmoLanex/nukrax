// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/marketplace/product-card.js
// One product-card markup builder, used by the marketplace grid,
// "Related products", "Similar products", and dashboard "Recommended" —
// nowhere else re-implements this card.
// ═══════════════════════════════════════════════════════════════════════

import { getProductPrice } from '../data/pricing.js';
import { getCategory } from '../data/products/categories.js';

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

export function productCardHtml(product, { favorited = false } = {}) {
  const price = getProductPrice(product.id);
  const category = getCategory(product.categoryId);
  return `
    <a href="product.html?id=${encodeURIComponent(product.id)}" class="nkx-mp-card" data-product-id="${product.id}">
      <div class="nkx-mp-card-top">
        <span class="nkx-mp-card-category">${category ? esc(category.icon) + ' ' + esc(category.label) : ''}</span>
        <button class="nkx-mp-fav-btn ${favorited ? 'active' : ''}" data-fav-toggle="${product.id}" type="button" aria-label="Save to favorites" onclick="event.preventDefault()">&#9733;</button>
      </div>
      <h3 class="nkx-mp-card-title">${esc(product.name)}</h3>
      <p class="nkx-mp-card-tagline">${esc(product.tagline)}</p>
      <div class="nkx-mp-card-foot">
        <span class="nkx-mp-card-price">${price.display}</span>
        <span class="nkx-mp-card-arrow">&rarr;</span>
      </div>
    </a>
  `;
}

export function productCardGrid(products, opts) {
  if (!products.length) {
    return `<div class="nkx-mp-empty">No products listed in this category yet — check back soon.</div>`;
  }
  return products.map(p => productCardHtml(p, opts)).join('');
}
