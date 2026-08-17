// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/community/achievements.js
// Reusable achievement award/read logic — used by the dashboard,
// onboarding flows, and anywhere else an achievement condition is met.
// Awarding always goes through the `award_achievement` RPC (idempotent,
// server-side XP/points grant) — never a raw insert. See
// supabase/migrations/0003_community_rewards.sql.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/client.js';
import { getAchievement } from '../data/achievements.js';

/** @returns {Promise<string[]>} achievement keys the user has earned */
export async function getEarnedAchievements(userId) {
  if (!userId) return [];
  const { data } = await supabase.from('user_achievements').select('achievement_key, earned_at').eq('user_id', userId).order('earned_at', { ascending: false });
  return data || [];
}

/**
 * Attempts to award an achievement. Safe to call speculatively — e.g.
 * "call tryAward('first-download') every time a download succeeds" — it's
 * a no-op (returns false) if already earned.
 * @returns {Promise<boolean>} true if newly awarded
 */
export async function tryAward(achievementKey) {
  if (!getAchievement(achievementKey)) return false; // unknown key — fail closed, never call an arbitrary RPC arg
  const { data, error } = await supabase.rpc('award_achievement', { p_achievement_key: achievementKey });
  return !error && data === true;
}
