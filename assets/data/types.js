// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/licenses/types.js
// Shared vocabulary for the licensing system. No logic here — just the
// constants every other license module imports so "active"/"revoked"
// aren't retyped as raw strings all over the codebase.
// ═══════════════════════════════════════════════════════════════════════

export const LICENSE_STATUS = Object.freeze({
  ACTIVE: 'active',
  REVOKED: 'revoked',
});

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  PAID: 'paid',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
});

export const ORDER_STATUS_LABEL = Object.freeze({
  pending: 'Awaiting payment',
  under_review: 'Payment under review',
  paid: 'Paid — Key pending',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
});

/**
 * @typedef {Object} LicenseRecord
 * @property {string} id
 * @property {string} user_id
 * @property {string} product_id
 * @property {string} key_value  — only ever visible to its owner or an admin (RLS-enforced)
 * @property {'active'|'revoked'} status
 * @property {string} issued_at
 */

/**
 * @typedef {Object} OrderRecord
 * @property {string} id
 * @property {string} user_id
 * @property {string|null} product_id
 * @property {string|null} membership_tier
 * @property {number|null} amount
 * @property {string} currency
 * @property {string|null} crypto_asset
 * @property {string|null} crypto_network
 * @property {string|null} customer_note
 * @property {'pending'|'under_review'|'paid'|'fulfilled'|'cancelled'} status
 */
