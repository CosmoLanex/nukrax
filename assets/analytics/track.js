// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/analytics/track.js
// Reusable analytics architecture. Per Phase 4 scope: NO external
// provider (no GA/Segment/PostHog etc.) — events go to the
// `analytics_events` table (supabase/migrations/0003_community_rewards.sql),
// a generic write-only-from-the-client event log an internal dashboard
// can query later. Call track() from anywhere; nothing else needs to
// know how/where events are stored.
//
// Supports: User Analytics (user_id is attached automatically when
// signed in), Marketplace/Product Analytics (track('product_view', ...)),
// Download Analytics (already logged more precisely via
// supabase.rpc('log_download') — this is the general-purpose companion),
// Revenue/Engagement Analytics (track order/achievement events the same
// way). Every call is fire-and-forget and never blocks the UI.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/client.js';

let cachedUserId = undefined; // undefined = not yet resolved, null = signed out

async function resolveUserId() {
  if (cachedUserId !== undefined) return cachedUserId;
  const { data } = await supabase.auth.getSession();
  cachedUserId = data.session?.user?.id || null;
  return cachedUserId;
}

/**
 * @param {string} eventName e.g. 'product_view', 'purchase_started', 'search'
 * @param {Record<string, any>} [properties]
 */
export async function track(eventName, properties = {}) {
  try {
    const user_id = await resolveUserId();
    await supabase.from('analytics_events').insert({ user_id, event_name: eventName, properties });
  } catch {
    // Analytics must never break the page it's called from.
  }
}
