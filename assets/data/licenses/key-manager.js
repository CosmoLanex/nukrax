// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/licenses/key-manager.js
// Admin-side Key generation + issuance. Generating a random Key string
// here is NOT the same as hardcoding one — nothing here contains a real,
// usable Key; a fresh one is generated on demand. The actual write to the
// `licenses` table is enforced server-side: Supabase RLS only allows
// INSERT/UPDATE on `licenses` when `is_admin(auth.uid())` is true (see
// supabase/migrations/0002_marketplace.sql), so calling these functions
// from a non-admin session fails at the database regardless of what the
// UI shows — this file is not the security boundary, RLS is.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../../auth/auth-widget.js';
import { KEY_PREFIX, KEY_SEGMENT_COUNT, KEY_SEGMENT_LENGTH, KEY_ALPHABET } from './config.js';

function randomSegment() {
  let out = '';
  for (let i = 0; i < KEY_SEGMENT_LENGTH; i++) {
    out += KEY_ALPHABET[Math.floor(Math.random() * KEY_ALPHABET.length)];
  }
  return out;
}

/** Generates a new, never-before-seen Key string in NKX-XXXX-XXXX-XXXX format. */
export function generateKey() {
  const segments = Array.from({ length: KEY_SEGMENT_COUNT }, randomSegment);
  return [KEY_PREFIX, ...segments].join('-');
}

/**
 * Issues a freshly-generated Key to a specific customer for a specific
 * product. Fails (returns { error }) if the caller isn't an admin — RLS
 * enforced, not just a UI check.
 */
export async function issueLicense({ userId, productId, note }) {
  const key_value = generateKey();
  const { data, error } = await supabase
    .from('licenses')
    .insert({ user_id: userId, product_id: productId, key_value, notes: note || null })
    .select()
    .single();
  return { license: data, error: error?.message };
}

export async function revokeLicense(licenseId) {
  const { error } = await supabase.from('licenses').update({ status: 'revoked', revoked_at: new Date().toISOString() }).eq('id', licenseId);
  return { error: error?.message };
}

/**
 * Finds a customer by username (their public @handle) — used by the admin
 * panel to issue a Key to a specific customer. profiles has no email
 * column (only auth.users does, which isn't broadly readable by client
 * sessions), so username is the reliable public lookup key; ask the
 * customer for their username if searching by their approximate email
 * doesn't find them.
 */
export async function findUserByUsername(query) {
  const { data } = await supabase.from('profiles').select('id, username, display_name, avatar_url').ilike('username', `%${query}%`).limit(8);
  return data || [];
}
