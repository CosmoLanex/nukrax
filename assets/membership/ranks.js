// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/membership/ranks.js
// Reusable rank architecture. `profiles.rank_number` is the only stored
// value; everything else (title, badge, progress within the current
// band) is derived here so it can later be driven by the community
// leaderboard without changing any consuming page.
// ═══════════════════════════════════════════════════════════════════════

/**
 * rank_number is a LEADERBOARD POSITION (1 = best). Bands are ordered
 * best → worst; the first band whose `maxPosition` the user's position
 * falls under wins. `maxPosition: Infinity` is the catch-all.
 */
export const RANK_BANDS = Object.freeze([
  { maxPosition: 3,        title: 'Elite',      icon: '✦' },
  { maxPosition: 25,       title: 'Veteran',    icon: '★' },
  { maxPosition: 100,      title: 'Specialist', icon: '◆' },
  { maxPosition: 500,      title: 'Operative',  icon: '◈' },
  { maxPosition: Infinity, title: 'Recruit',    icon: '◇' },
]);

/** null/undefined/0 = not yet on the leaderboard. */
export function getRankInfo(rankNumber) {
  if (!rankNumber || rankNumber < 1) {
    return { rankNumber: null, title: 'Unranked', icon: '—' };
  }
  const band = RANK_BANDS.find(b => rankNumber <= b.maxPosition) || RANK_BANDS[RANK_BANDS.length - 1];
  return { rankNumber, title: band.title, icon: band.icon };
}
