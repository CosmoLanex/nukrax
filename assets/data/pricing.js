// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/pricing.js
// THE single source of truth for every price on the entire site.
//
// HOW TO EDIT:
//   - Change a number below → that price updates everywhere it's shown
//     (product cards, product pages, marketplace, dashboard, checkout).
//   - `price: null` means "not set yet" — the UI will show "Price TBD"
//     instead of a number or a $0. Replace `null` with a real number
//     (e.g. `price: 249`) whenever you're ready.
//   - `id` values must match the product `id` used in
//     assets/data/products/products.js exactly.
//
// Nothing else in the codebase should ever write a "$" followed by a
// number directly into HTML — everything reads from here via
// getProductPrice()/getMembershipPrice()/formatPrice().
// ═══════════════════════════════════════════════════════════════════════

export const CURRENCY = 'USD';
export const CURRENCY_SYMBOL = '$';

/** Membership tier pricing. `null` = not set yet (shows "Price TBD"). */
export const MEMBERSHIP_PRICING = Object.freeze({
  free:     { price: 0,    billing: 'forever' },
  pro:      { price: null, billing: 'monthly' },
  advanced: { price: null, billing: 'monthly' },
});

/**
 * Product pricing, keyed by product id. Add a new line here whenever a
 * new product id is added to assets/data/products/products.js — that's
 * the only other place that needs to know about a new product.
 */
export const PRODUCT_PRICING = Object.freeze({
  // ── Expert Advisors ──
  'apex':     { price: null, salePrice: null },
  'aurum':    { price: null, salePrice: null },
  'smc-ict':  { price: null, salePrice: null },

  // ── Automation Tools ──
  'auto-trade-journal-sync':   { price: null, salePrice: null },
  'auto-risk-guard':           { price: null, salePrice: null },
  'auto-news-filter':          { price: null, salePrice: null },
  'auto-multi-account-copier': { price: null, salePrice: null },
  'auto-session-scheduler':    { price: null, salePrice: null },
  'auto-equity-alert':         { price: null, salePrice: null },
  'auto-equity-dashboard':     { price: null, salePrice: null },

  // ── Everything else is added here as real products are built (Automation
  //    Tools, AI Models, APIs, Datasets, Python/JS Projects, Templates,
  //    Developer Tools, Utilities, Prompt Packs) — no code changes needed
  //    elsewhere, just add `'product-id': { price: 0 }` here and register
  //    the product in assets/data/products/products.js. ──
});

/** Formats a raw number as e.g. "$249" — or a clearly-marked placeholder if not set. */
export function formatPrice(amount) {
  if (amount === null || amount === undefined) return 'Price TBD';
  if (amount === 0) return 'Free';
  return `${CURRENCY_SYMBOL}${amount.toLocaleString()}`;
}

/** Full pricing info for a product: { price, salePrice, display, onSale }. */
export function getProductPrice(productId) {
  const entry = PRODUCT_PRICING[productId] || { price: null, salePrice: null };
  const onSale = entry.salePrice !== null && entry.salePrice !== undefined && entry.price !== null;
  return {
    price: entry.price,
    salePrice: entry.salePrice ?? null,
    onSale,
    display: formatPrice(onSale ? entry.salePrice : entry.price),
    displayOriginal: onSale ? formatPrice(entry.price) : null,
  };
}

/** Full pricing info for a membership tier: { price, billing, display }. */
export function getMembershipPrice(tierKey) {
  const entry = MEMBERSHIP_PRICING[tierKey] || { price: null, billing: 'monthly' };
  return {
    price: entry.price,
    billing: entry.billing,
    display: formatPrice(entry.price) + (entry.price ? `/${entry.billing === 'monthly' ? 'mo' : entry.billing}` : ''),
  };
}
