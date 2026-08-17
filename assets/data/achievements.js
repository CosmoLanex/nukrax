// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/achievements.js
// JS-side achievement catalog. Mirrors `public.achievements` (see
// supabase/migrations/0003_community_rewards.sql) — same pattern as
// assets/membership/badges.js. Add a new achievement in ONE place here
// AND the matching migration row; this file drives instant client-side
// rendering (icon/label/description), the DB is the source of truth for
// who has actually earned it and what XP/points it grants.
// ═══════════════════════════════════════════════════════════════════════

export const ACHIEVEMENTS = Object.freeze({
  'first-login':          { key: 'first-login',          label: 'First Login',            description: 'Signed in to NUKRAX for the first time.', icon: '\u2726', xpReward: 10,  pointsReward: 5 },
  'first-purchase':       { key: 'first-purchase',        label: 'First Purchase',         description: 'Completed your first purchase.',           icon: '\u25c6', xpReward: 50,  pointsReward: 25 },
  'first-download':       { key: 'first-download',        label: 'First Download',         description: 'Downloaded your first product.',            icon: '\u2193', xpReward: 20,  pointsReward: 10 },
  'profile-completed':    { key: 'profile-completed',      label: 'Profile Completed',     description: 'Filled out your full profile.',             icon: '\u25c7', xpReward: 15,  pointsReward: 5 },
  'marketplace-explorer': { key: 'marketplace-explorer',   label: 'Marketplace Explorer',  description: 'Viewed 10 different products.',             icon: '\u25a6', xpReward: 20,  pointsReward: 10 },
  'docs-explorer':        { key: 'docs-explorer',          label: 'Documentation Explorer', description: 'Visited 5 documentation pages.',           icon: '\u25a4', xpReward: 15,  pointsReward: 5 },
  'pro-member':           { key: 'pro-member',             label: 'Pro Member',            description: 'Upgraded to Pro membership.',               icon: '\u2605', xpReward: 30,  pointsReward: 15 },
  'advanced-member':      { key: 'advanced-member',        label: 'Advanced Member',       description: 'Upgraded to Advanced membership.',          icon: '\u26a1', xpReward: 50,  pointsReward: 25 },
  'top-ranked':           { key: 'top-ranked',             label: 'Top Ranked',            description: 'Reached the Top 28 leaderboard.',           icon: '\ud83c\udfc6', xpReward: 100, pointsReward: 50 },
  'elite-user':           { key: 'elite-user',             label: 'Elite User',            description: 'Reached Elite rank.',                       icon: '\u2655', xpReward: 150, pointsReward: 75 },
});

export const ACHIEVEMENT_LIST = Object.values(ACHIEVEMENTS);

export function getAchievement(key) {
  return ACHIEVEMENTS[key] || null;
}
