// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/membership/render.js
// Small, dependency-free HTML-string builders shared by the dashboard,
// profile, homepage welcome panel, and settings — so the "tier chip" /
// "level ring" / "points pill" markup exists in exactly one place.
// Pair with assets/membership/membership.css for styling.
// ═══════════════════════════════════════════════════════════════════════

import { getTier } from './tiers.js';
import { computeLevelProgress } from './levels.js';
import { getRankInfo } from './ranks.js';
import { resolveBadges } from './badges.js';

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

export function tierChip(membershipProfile) {
  const tier = getTier(membershipProfile?.membership_tier);
  return `<span class="nkx-tier-chip" style="--chip-color:${tier.color}">${esc(tier.label)}</span>`;
}

export function levelRing(membershipProfile, size = 56) {
  const p = computeLevelProgress(membershipProfile || {});
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (p.percent / 100) * c;
  return `
    <div class="nkx-level-ring" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 ${size} ${size}">
        <circle class="nkx-lr-track" cx="${size / 2}" cy="${size / 2}" r="${r}"/>
        <circle class="nkx-lr-fill" cx="${size / 2}" cy="${size / 2}" r="${r}"
          stroke-dasharray="${c}" stroke-dashoffset="${offset}"
          transform="rotate(-90 ${size / 2} ${size / 2})"/>
      </svg>
      <div class="nkx-lr-label">${p.level}</div>
    </div>
  `;
}

export function pointsPill(membershipProfile) {
  const points = membershipProfile?.points ?? 0;
  return `<span class="nkx-points-pill">${points.toLocaleString()} <small>pts</small></span>`;
}

export function rankChip(membershipProfile) {
  const rank = getRankInfo(membershipProfile?.rank_number);
  return `<span class="nkx-rank-chip">${rank.icon} ${esc(rank.title)}${rank.rankNumber ? ` <small>#${rank.rankNumber}</small>` : ''}</span>`;
}

export function badgeRow(membershipProfile) {
  const badges = resolveBadges(membershipProfile?.badge_keys || []);
  if (!badges.length) return '';
  return `<div class="nkx-badge-row">${badges.map(b => `<span class="nkx-badge" title="${esc(b.label)}">${b.icon} ${esc(b.label)}</span>`).join('')}</div>`;
}

export { esc };
