// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/membership/tiers.js
// Single source of truth for the three membership tiers. Payment flow is
// NOT implemented here (Phase 2) — this is the reusable architecture every
// page/component reads from so tier logic is never hand-rolled twice.
// ═══════════════════════════════════════════════════════════════════════

/** Ordered low → high. Order matters for access.js comparisons. */
export const TIERS = Object.freeze({
  free: {
    key: 'free',
    order: 0,
    label: 'Free',
    tagline: 'Everything you need to get started.',
    color: 'var(--muted)',
  },
  pro: {
    key: 'pro',
    order: 1,
    label: 'Pro',
    tagline: 'Full execution systems + priority support.',
    color: 'var(--accent)',
  },
  advanced: {
    key: 'advanced',
    order: 2,
    label: 'Advanced',
    tagline: 'Everything in Pro, plus advanced analytics & early access.',
    color: '#F2C185',
  },
});

export const TIER_ORDER = ['free', 'pro', 'advanced'];

/** Normalize any raw tier string from the DB (or a missing value) to a known key. */
export function normalizeTier(rawTier) {
  return TIERS[rawTier] ? rawTier : 'free';
}

export function getTier(rawTier) {
  return TIERS[normalizeTier(rawTier)];
}
