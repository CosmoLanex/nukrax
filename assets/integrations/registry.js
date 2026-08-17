// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/integrations/registry.js
// A single registry of every third-party integration NUKRAX has, or plans
// to have. Nothing here performs an actual connection — this is the
// architecture other UI (settings.html, a future "Integrations" page)
// renders from, so adding a new integration is one entry here instead of
// new markup scattered across pages.
//
// status: 'connected' | 'planned'
//   'connected' means the integration is live and a user can actually
//   link/unlink it (none currently are — Phase 4 is architecture only).
//   'planned' renders as an upcoming-integration row with no action.
// ═══════════════════════════════════════════════════════════════════════

export const INTEGRATIONS = Object.freeze([
  { key: 'discord', label: 'Discord', description: 'Community sign-in and role sync.', status: 'planned', icon: '\u25c8' },
  { key: 'github', label: 'GitHub', description: 'Link your GitHub account for developer products.', status: 'connected', icon: '\u25c7' },
  { key: 'google', label: 'Google', description: 'Sign in with Google.', status: 'planned', icon: '\u25cb' },
  { key: 'telegram', label: 'Telegram', description: 'Get order and Key notifications via Telegram.', status: 'planned', icon: '\u2708' },
  { key: 'email', label: 'Email', description: 'Transactional email for orders, Keys, and alerts.', status: 'connected', icon: '\u2709' },
  { key: 'payment-providers', label: 'Payment Providers', description: 'Card and additional crypto payment gateways beyond manual deposit.', status: 'planned', icon: '\u25c6' },
  { key: 'third-party-apis', label: 'Third-Party APIs', description: 'Broker and data-provider API connections for automations.', status: 'planned', icon: '\u21c4' },
]);

export function getIntegration(key) {
  return INTEGRATIONS.find(i => i.key === key) || null;
}

export function getConnectedIntegrations() {
  return INTEGRATIONS.filter(i => i.status === 'connected');
}

export function getPlannedIntegrations() {
  return INTEGRATIONS.filter(i => i.status === 'planned');
}
