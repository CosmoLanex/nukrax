// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/licenses/validator.js
// The ONLY place that checks whether a Key is valid. Always goes through
// the server-side `validate_license_key` RPC (SECURITY DEFINER) — no Key
// values are ever compared, stored, or listed in this file or shipped in
// any JS bundle. This is also the seam a future payment webhook plugs
// into: automatic issuance would call the same RPC contract, so nothing
// here needs to change when that lands.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../../auth/auth-widget.js';
import { VALIDATE_RPC } from './config.js';
import { setLastUnlockAttempt } from './storage.js';

/**
 * @param {string} productId
 * @param {string} keyInput — raw text the user typed
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function validateKey(productId, keyInput) {
  const cleaned = (keyInput || '').trim().toUpperCase();
  if (!cleaned) return { valid: false, error: 'Enter your Key.' };

  const { data, error } = await supabase.rpc(VALIDATE_RPC, {
    p_product_id: productId,
    p_key: cleaned,
  });

  if (error) return { valid: false, error: 'Could not verify your Key right now — try again in a moment.' };

  const valid = Array.isArray(data) ? data.length > 0 && data[0].valid : !!data?.valid;
  setLastUnlockAttempt(productId, valid);
  return { valid, error: valid ? undefined : 'That Key isn\u2019t valid for this product.' };
}
