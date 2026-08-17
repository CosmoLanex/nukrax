// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/licenses/config.js
// Tunable constants for the licensing system. Change the Key FORMAT here
// and every place that generates/validates/displays a Key follows.
// ═══════════════════════════════════════════════════════════════════════

/** Visual format: NKX-XXXX-XXXX-XXXX (uppercase, no ambiguous chars). */
export const KEY_PREFIX = 'NKX';
export const KEY_SEGMENT_COUNT = 3;
export const KEY_SEGMENT_LENGTH = 4;
export const KEY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I — avoids transcription errors

/** What the UI calls this concept everywhere — never "password". */
export const KEY_LABEL = 'Key';

/**
 * The Supabase RPC used to check a Key server-side (see
 * supabase/migrations/0002_marketplace.sql → validate_license_key).
 * Kept as a named constant so a future swap to a different validation
 * endpoint (e.g. once a payment webhook auto-issues Keys) only needs to
 * change this one string.
 */
export const VALIDATE_RPC = 'validate_license_key';
export const LOG_DOWNLOAD_RPC = 'log_download';
