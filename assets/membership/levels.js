// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/membership/levels.js
// Reusable level/XP math. The DB only stores raw `level` + `xp` (see
// profiles table) — everything derived (progress %, XP needed for next
// level) is computed here so the curve can change in one place later.
// ═══════════════════════════════════════════════════════════════════════

const BASE_XP = 100;   // XP required to go from level 1 → 2
const GROWTH = 1.18;   // each level requires ~18% more XP than the last

/** Total cumulative XP required to REACH a given level (level 1 = 0). */
export function xpForLevel(level) {
  if (level <= 1) return 0;
  let total = 0;
  let need = BASE_XP;
  for (let l = 2; l <= level; l++) {
    total += need;
    need = Math.round(need * GROWTH);
  }
  return total;
}

/** Given total lifetime XP, derive current level. */
export function levelForXp(totalXp) {
  let level = 1;
  while (xpForLevel(level + 1) <= totalXp) level++;
  return level;
}

/**
 * Full progress breakdown for a profile's stored { level, xp } (xp here is
 * treated as XP *within the current level*, matching the `profiles.xp`
 * column — kept simple/legible rather than cumulative for UI purposes).
 */
export function computeLevelProgress({ level = 1, xp = 0 } = {}) {
  const currentLevelStart = 0;
  const nextLevelNeed = Math.round(BASE_XP * Math.pow(GROWTH, Math.max(0, level - 1)));
  const clampedXp = Math.max(0, Math.min(xp, nextLevelNeed));
  const percent = nextLevelNeed > 0 ? Math.round((clampedXp / nextLevelNeed) * 100) : 0;
  return {
    level,
    xp: clampedXp,
    xpForNext: nextLevelNeed,
    xpRemaining: Math.max(0, nextLevelNeed - clampedXp),
    percent,
  };
}
