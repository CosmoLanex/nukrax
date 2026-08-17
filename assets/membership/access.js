// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/membership/access.js
// Single reusable permission-check architecture. ANY page/component that
// needs to gate a feature by membership tier imports from here — never
// re-implements the tier comparison inline. This is UI-level gating only
// (hide/disable + friendly upsell); it is NOT a security boundary, since
// Supabase RLS is what actually protects data (see the migration file).
// ═══════════════════════════════════════════════════════════════════════

import { TIERS, normalizeTier } from './tiers.js';

/** True if `profileTier` meets or exceeds `requiredTier`. */
export function hasTier(profileTier, requiredTier) {
  const have = TIERS[normalizeTier(profileTier)].order;
  const need = TIERS[normalizeTier(requiredTier)].order;
  return have >= need;
}

/** Convenience: pass a membership profile object ({ membership_tier }) directly. */
export function hasAccess(membershipProfile, requiredTier) {
  return hasTier(membershipProfile?.membership_tier, requiredTier);
}

/**
 * Declaratively gate DOM elements by tier without writing new comparison
 * logic per page. Give any element `data-nkx-require-tier="pro"` and call
 * this once with the current profile; elements the user doesn't have
 * access to get `hidden` + a `data-nkx-locked` flag another script can use
 * to render an upsell state instead of just disappearing.
 */
export function applyAccessGates(root, membershipProfile) {
  const scope = root || document;
  scope.querySelectorAll('[data-nkx-require-tier]').forEach(el => {
    const required = el.getAttribute('data-nkx-require-tier');
    const allowed = hasAccess(membershipProfile, required);
    el.hidden = !allowed && el.dataset.nkxLockedBehavior !== 'show-locked';
    el.toggleAttribute('data-nkx-locked', !allowed);
  });
}

export { TIERS };
