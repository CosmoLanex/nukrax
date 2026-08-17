// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/payments/wallets.js
// Read-only ES-module reader over assets/address.js — the ACTUAL source of
// truth for every receiving wallet address stays in that one file. This
// module never stores, copies, or re-types an address; it only reads
// `window.DEPOSIT_ADDRESSES` (exposed by address.js) so module-based
// marketplace/checkout code can use the same data cr.html already uses.
//
// REQUIRES: the page must load `<script src="assets/address.js"></script>`
// (classic script, before any module that imports this file) — exactly
// the same requirement cr.html already documents for itself.
// ═══════════════════════════════════════════════════════════════════════

function requireAddresses() {
  if (typeof window === 'undefined' || !window.DEPOSIT_ADDRESSES) {
    throw new Error('[wallets.js] assets/address.js must be loaded (as a classic <script>) before this module is used.');
  }
  return window.DEPOSIT_ADDRESSES;
}

/** Every supported asset ticker, e.g. ['XRP','SOL','USDT',...] — derived, never hardcoded. */
export function getSupportedAssets() {
  return Object.keys(requireAddresses());
}

/** Every network name available for a given asset ticker. */
export function getNetworksForAsset(asset) {
  const addresses = requireAddresses();
  return Object.keys(addresses[asset] || {});
}

/** The receiving address (+ optional memo) for a specific asset/network — read-only. */
export function getAddress(asset, network) {
  const addresses = requireAddresses();
  return addresses[asset]?.[network] || null;
}
