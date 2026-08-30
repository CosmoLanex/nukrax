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
 *
 * Defaults below are deliberately differentiated per product rather than
 * one flat number everywhere — Apex/Aurum (full HFT systems) priced
 * above SMC ICT (single-methodology system), automations priced by
 * rough build complexity. Every one of these is still just a plain
 * number to edit, or overridable live from Admin → Pricing (see
 * ADMIN_OVERRIDE_KEY below) without touching code at all.
 */
export const PRODUCT_PRICING = Object.freeze({
  // ── Expert Advisors ──
  'apex':     { price: 249, salePrice: null },
  'aurum':    { price: 229, salePrice: null },
  'smc-ict':  { price: 179, salePrice: null },

  // ── Automation Tools ──
  'auto-trade-journal-sync':   { price: 49, salePrice: null },
  'auto-risk-guard':           { price: 59, salePrice: null },
  'auto-news-filter':          { price: 39, salePrice: null },
  'auto-multi-account-copier': { price: 79, salePrice: null },
  'auto-session-scheduler':    { price: 39, salePrice: null },
  'auto-equity-alert':         { price: 29, salePrice: null },
  'auto-equity-dashboard':     { price: 49, salePrice: null },

  // ── Everything else is added here as real products are built (Automation
  //    Tools, AI Models, APIs, Datasets, Python/JS Projects, Templates,
  //    Developer Tools, Utilities, Prompt Packs) — no code changes needed
  //    elsewhere, just add `'product-id': { price: 0 }` here and register
  //    the product in assets/data/products/products.js. ──
});

/**
 * Pricing for build-for-you SERVICES (as opposed to off-the-shelf
 * PRODUCT_PRICING above) — the "send your idea to the dev team" flow
 * from develop/ea.html / develop/automation.html, plus the "Onboard
 * EA" service (bringing an existing EA you own onto NUKRAX).
 * `rangeLow`/`rangeHigh` describe the advertised range; `price` is the
 * single number to actually charge/display if set.
 */
export const SERVICE_PRICING = Object.freeze({
  'custom-ea':        { price: null, rangeLow: 178, rangeHigh: 338 },
  'onboard-ea':        { price: 99,   rangeLow: null, rangeHigh: null },
  'custom-automation': { price: null, rangeLow: 89,  rangeHigh: 199 },
});

/** localStorage key for admin-entered overrides — see getAdminOverrides()
 *  below. Kept separate from PRODUCT_PRICING/SERVICE_PRICING (the coded
 *  defaults) so "reset to default" is just "clear this key". */
const ADMIN_OVERRIDE_KEY = 'nukrax.admin.pricingOverrides';

function getAdminOverrides() {
  try {
    const v = JSON.parse(localStorage.getItem(ADMIN_OVERRIDE_KEY));
    return (v && typeof v === 'object') ? v : {};
  } catch (e) { return {}; }
}

/** Admin.html → Pricing tab calls this to persist an override. `kind` is
 *  'product' | 'service' | 'membership'. `price: null` clears the
 *  override for that id (falls back to the coded default again). */
export function setAdminPriceOverride(kind, id, price) {
  const overrides = getAdminOverrides();
  const key = `${kind}:${id}`;
  if (price === null || price === undefined || price === '') {
    delete overrides[key];
  } else {
    overrides[key] = Number(price);
  }
  try { localStorage.setItem(ADMIN_OVERRIDE_KEY, JSON.stringify(overrides)); } catch (e) { /* ignore */ }
}

function overrideFor(kind, id) {
  const overrides = getAdminOverrides();
  const v = overrides[`${kind}:${id}`];
  return (typeof v === 'number' && !Number.isNaN(v)) ? v : null;
}

/** Formats a raw number as e.g. "$249" — or a clearly-marked placeholder if not set. */
export function formatPrice(amount) {
  if (amount === null || amount === undefined) return 'Price TBD';
  if (amount === 0) return 'Free';
  return `${CURRENCY_SYMBOL}${amount.toLocaleString()}`;
}

/** Full pricing info for a product: { price, salePrice, display, onSale }.
 *  An admin override (if set) takes priority over the coded default. */
export function getProductPrice(productId) {
  const entry = PRODUCT_PRICING[productId] || { price: null, salePrice: null };
  const override = overrideFor('product', productId);
  const price = override !== null ? override : entry.price;
  const onSale = entry.salePrice !== null && entry.salePrice !== undefined && price !== null;
  return {
    price,
    salePrice: entry.salePrice ?? null,
    onSale,
    display: formatPrice(onSale ? entry.salePrice : price),
    displayOriginal: onSale ? formatPrice(price) : null,
  };
}

/** Full pricing info for a build-for-you service (custom-ea, onboard-ea,
 *  custom-automation). Falls back to displaying the advertised range
 *  (e.g. "$178–$338") when no single price is set. */
export function getServicePrice(serviceId) {
  const entry = SERVICE_PRICING[serviceId] || { price: null, rangeLow: null, rangeHigh: null };
  const override = overrideFor('service', serviceId);
  const price = override !== null ? override : entry.price;
  let display;
  if (price !== null && price !== undefined) {
    display = formatPrice(price);
  } else if (entry.rangeLow && entry.rangeHigh) {
    display = `${formatPrice(entry.rangeLow)}–${formatPrice(entry.rangeHigh)}`;
  } else {
    display = 'Price TBD';
  }
  return { price, rangeLow: entry.rangeLow, rangeHigh: entry.rangeHigh, display };
}

/** Full pricing info for a membership tier: { price, billing, display }. */
export function getMembershipPrice(tierKey) {
  const entry = MEMBERSHIP_PRICING[tierKey] || { price: null, billing: 'monthly' };
  const override = overrideFor('membership', tierKey);
  const price = override !== null ? override : entry.price;
  return {
    price,
    billing: entry.billing,
    display: formatPrice(price) + (price ? `/${entry.billing === 'monthly' ? 'mo' : entry.billing}` : ''),
  };
}

/** All prices for the Admin → Pricing panel: coded default + live
 *  override (if any) for every product/service/membership entry. */
export function listAllPricesForAdmin() {
  const rows = [];
  for (const id of Object.keys(PRODUCT_PRICING)) {
    rows.push({ kind: 'product', id, default: PRODUCT_PRICING[id].price, override: overrideFor('product', id) });
  }
  for (const id of Object.keys(SERVICE_PRICING)) {
    rows.push({ kind: 'service', id, default: SERVICE_PRICING[id].price, override: overrideFor('service', id) });
  }
  for (const id of Object.keys(MEMBERSHIP_PRICING)) {
    if (id === 'free') continue; // not editable — free is always $0
    rows.push({ kind: 'membership', id, default: MEMBERSHIP_PRICING[id].price, override: overrideFor('membership', id) });
  }
  return rows;
}
