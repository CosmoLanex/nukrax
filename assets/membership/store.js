// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/membership/store.js
// Central data-access layer for membership/dashboard/notification data.
// ONE place that knows the Supabase shape (table/column names) so pages
// never hand-roll their own query. Any future schema change happens once,
// here.
//
// Split of storage responsibilities (per architecture decision):
//   - Real, cross-device, potentially-shared data (tier, level, xp,
//     points, rank, badges, notifications) → Supabase, via this module.
//   - Purely local, per-device UI/view state (last active dashboard tab,
//     sidebar collapsed, "continue where you left off") → localStorage,
//     via the UI-state helpers at the bottom of this file. Never used for
//     anything that needs to be visible to anyone else or sync devices.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/auth-widget.js';

/** Full membership+profile row for the current user, or null if signed out. */
export async function getMembershipProfile(user) {
  if (!user) return null;
  const [{ data: profile }, { data: badgeRows }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
    supabase.from('user_badges').select('badge_key, earned_at').eq('user_id', user.id),
  ]);
  return {
    ...(profile || { id: user.id }),
    badge_keys: (badgeRows || []).map(b => b.badge_key),
  };
}

/** Recent notifications (all types — likes/follows AND system ones added in Phase 1). */
export async function getNotifications(user, limit = 20) {
  if (!user) return [];
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

export async function getUnreadNotificationCount(user) {
  if (!user) return 0;
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false);
  return count || 0;
}

export async function markNotificationsRead(ids = []) {
  if (!ids.length) return;
  await supabase.from('notifications').update({ read: true }).in('id', ids);
}

export async function getRecentPoints(user, limit = 10) {
  if (!user) return [];
  const { data } = await supabase
    .from('points_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

// ── Local, per-device UI state (never synced, never shown to anyone else) ──
const UI_PREFIX = 'nkx_ui_';

export function getUIState(key, fallback = null) {
  try {
    const raw = localStorage.getItem(UI_PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setUIState(key, value) {
  try {
    localStorage.setItem(UI_PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage unavailable/full — non-critical UI state, ignore */
  }
}
