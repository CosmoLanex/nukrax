// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/membership/badges.js
// JS-side badge catalog. Mirrors `public.badges` (see
// supabase/migrations/0001_membership_platform.sql) so the UI has an
// immediate, offline-safe source for label/icon while `user_badges` rows
// (which badges a specific user actually holds) come from Supabase.
// Add a new badge in ONE place — here AND the matching migration row.
// ═══════════════════════════════════════════════════════════════════════

export const BADGES = Object.freeze({
  free:       { key: 'free',       label: 'Free',       icon: '○' },
  pro:        { key: 'pro',        label: 'Pro',         icon: '★' },
  advanced:   { key: 'advanced',   label: 'Advanced',    icon: '⚡' },
  founder:    { key: 'founder',    label: 'Founder',     icon: '⚑' },
  elite:      { key: 'elite',      label: 'Elite',       icon: '♛' },
  'top-ranked': { key: 'top-ranked', label: 'Top Ranked', icon: '🏆' },
  verified:   { key: 'verified',   label: 'Verified',    icon: '✓' },
});

export function getBadge(key) {
  return BADGES[key] || null;
}

/** Given an array of badge_key strings (from user_badges), return full badge objects, unknowns dropped. */
export function resolveBadges(keys = []) {
  return keys.map(getBadge).filter(Boolean);
}
