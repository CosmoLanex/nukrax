// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/licenses/storage.js
// LOCAL, per-device UI-state only — same rule as
// assets/membership/store.js's getUIState/setUIState. NEVER stores a Key
// value itself, only harmless view-state like "which product's unlock
// modal did the user last have open" so it can restore that on return.
// The actual Key data lives exclusively in Supabase (`licenses` table),
// gated by RLS — see supabase/migrations/0002_marketplace.sql.
// ═══════════════════════════════════════════════════════════════════════

const PREFIX = 'nkx_license_ui_';

export function getLastUnlockAttempt(productId) {
  try {
    return localStorage.getItem(PREFIX + 'last_attempt_' + productId) || '';
  } catch { return ''; }
}

/** Remembers the last product ID a key modal was opened for (UI convenience only). */
export function setLastUnlockAttempt(productId, wasValid) {
  try {
    localStorage.setItem(PREFIX + 'last_attempt_' + productId, wasValid ? 'valid' : 'invalid');
  } catch { /* non-critical */ }
}
